import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import _ from 'lodash';

import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    OUT_OF_BASE_MODEL_ERROR,
    MODEL_INTERSECTION_WITH_OTHER_MODELS,
    VERTEX_EQUIVALENT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    DEFAULT_HANDRAIL_DIRECTION,
    ALTERNATE_HANDRAIL_DIRECTION,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
    MATERIAL_STATES,
    WALKWAY_2D_LINE_WIDTH,
    LINE_WIDTH,
} from '../visualConstants';
import {
    areVerticesOnGround,
    getTopCommonModelBelowVertices,
} from '../../utils/raycastingUtils';
import {
    convertArrayToVector,
    checkIfLastVertexOnEdges,
    setbackPolygon,
    getNormalPoints,
    getNormalPointsWithTiltedParent,
    checkLastEdgeIntersectionWithEdges,
    checkPolygonInsidePolygon,
    checkIntersectionWithSiblings,
    checkVertexEquivalency,
    checkLineIntersection,
    rotationAroundPoint,
    convertArrayTo3DVector,
} from '../../utils/utils';

import OutlinePoints from '../subObjects/OutlinePoints';
import LengthMeasurement from '../subObjects/LengthMeasurement';
import Walkway from './Walkway';
import PolygonModel from './PolygonModel';
import Subarray from './../subArray/Subarray';
import * as visualUtils from '../../utils/visualUtils';
import Ground from '../ground/Ground';
import BaseObject from '../BaseObject';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import NikGeometry from '../ground/NikGeometry';

const MINIMUM_NUMBER_OF_POINTS = 2;

const handrailRadius = 0.01685;
const baseCylinderRadius = 0.018;
const verticalCylinderRadius = 0.01685;
const baseCylinderHeight = 0.05;
const baseCylinderDistance = 2;
const baseCylinderColor = 0xc0c0c0;
const handrailColor = 0x808080;
const midHorizontalRailHeight = 0.5;

export default class Handrail extends BaseObject {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.id = stage.getHandrailId();
        this.name = `Handrail #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectGroupFor3D = new THREE.Group();

        // materials
        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .HANDRAIL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: 4,
            color: COLOR_MAPPINGS
                .HANDRAIL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // meshes and edges
        this.coreMesh = createMesh(createBufferGeometry(), this.meshMaterial2D);
        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this.edgeMaterial2D,
        );
        this.merged3d = null;
        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        const defaultProperties = this.getDefaultProperties();
        this.setInitialProperties(defaultProperties);

        this.handrailDirection = DEFAULT_HANDRAIL_DIRECTION;

        this.outlinePoints = [];
        this.lengthMeasurements = [];
        this.updateVisualsAfterLoadingAndCreation();
    }

    setInitialProperties(properties) {
        this.coreHeight = properties.coreHeight;
        this.width = properties.width;
        this.verticalColumnSpacing = properties.verticalColumnSpacing;
    }

    getState() {
        const walkwayData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            handrailDirection: this.handrailDirection,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return walkwayData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;

            this.coreHeight = state.coreHeight;
            this.width = state.width;
            this.handrailDirection = state.handrailDirection;

            this.updateVisualsAfterLoadingAndCreation();

            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.outlinePoints = state.outlinePoints.map(outlinePoint =>
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage,
                    ));

                this.updateMeasurement();
            }
            else {
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error("Handrail: loadState: outlinePoints length don't match");
                    return null;
                }

                for (let index = 0; index < this.outlinePoints.length; index += 1) {
                    this.outlinePoints[index].setPosition(
                        state.outlinePoints[index][0],
                        state.outlinePoints[index][1],
                        state.outlinePoints[index][2],
                    );
                }

                this.updateMeasurement();
            }

            this.updateGeometry();
            this.stage.quadTreeManager.handlePlaceObject(this);
        }
    }

    clearState() {
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove measurements
        this.removeMeasurement();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    saveObject(isCopy = false) {
        const handrailData = {
            type: Handrail.getObjectType(),
            id: this.id,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            handrailDirection: this.handrailDirection,
            verticalColumnSpacing: this.verticalColumnSpacing,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            handrailData.uuid = this.uuid;
        }
        return handrailData;
    }

    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
        }

        this.coreHeight = data.coreHeight;
        this.width = data.width;
        this.handrailDirection = data.handrailDirection;
        this.verticalColumnSpacing = data.verticalColumnSpacing;

        this.outlinePoints = data.outlinePoints.map(
            outlinePoint =>
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ),
        );

        this.updateMeasurement();

        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    // exporters
    exportAsSTL() {
        return [{
            mesh: this.coreMesh,
            name: this.name,
        }];
    }

    exportAsCollada() {
        const mesh = this.coreMesh.clone();
        mesh.material = new THREE.MeshLambertMaterial({
            color:
                COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .MESH_COLOR,
            transparent: true,
            opacity: 0.6,
        });
        mesh.name = this.name;
        return {
            model: mesh,
            subarray: [],
        };
    }

    /**
     * Returns the default properties properties for handrail
     * For now they are hard-coded.
     */
    getDefaultProperties() {
        return {
            coreHeight: 0.95,
            width: 0.05,
            verticalColumnSpacing: 2,
        }
    }

    getId() {
        return this.id;
    }

    getLength() {
        let totalLength = 0;
        for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
            const v1 = this.outlinePoints[i].getPosition();
            const v2 = this.outlinePoints[i + 1].getPosition();
            totalLength += v1.distanceTo(v2);
        }
        return totalLength;
    }

    getHeight() {
        return this.coreHeight;
    }

    getColumnSpacing() {
        return this.verticalColumnSpacing;
    }

    getEdges() {
        const vertices = convertArrayToVector(this.get2DVertices());
        const edges = [];
        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([vertices[i], vertices[i + 1]]);
        }
        // push the last edge
        if (
            this.numVertices > 2 &&
            (vertices[this.numVertices - 1].x !== vertices[0].x ||
                vertices[this.numVertices - 1].y !== vertices[0].y)
        ) {
            edges.push([vertices[this.numVertices - 1], vertices[0]]);
        }

        return edges;
    }

    getPlacingInformation(drawingVertices, currentParent = null) {
        let rawVertices = drawingVertices;
        let vertices = drawingVertices;

        const response = {};
        let parentExists = true;
        let polygonExists = true;
        let numberOfPoints = 0;
        response.errors = [];
        response.pointUnplaceableError = null;

        if (vertices !== null && vertices !== undefined) {
            if (vertices.length - 1 < MINIMUM_NUMBER_OF_POINTS) {
                const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
                response.cannotCompleteError = error;
                response.errors.push(error);
                parentExists = false;
                polygonExists = false;
            }

            if (polygonExists) {
                vertices = [];
                for (let i = 0, l = drawingVertices.length; i < l; i += 1) {
                    vertices.push(new THREE.Vector3(drawingVertices[i][0], drawingVertices[i][1]));
                }
                vertices = this.get2DVertices(vertices);
                if (vertices.length === 0) {
                    polygonExists = false;
                }
            }
            numberOfPoints = vertices.length - 1;
        }
        else {
            vertices = this.get2DVertices();
            numberOfPoints = vertices.length;
        }

        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
        }

        if (!areVerticesOnGround(vertices, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        if (currentParent === null || currentParent === undefined) {
            currentParent = this.getParent();
        }
        // if no of vertices is 2 then the mesh will have 4 vertices then only we will be able to call setbackPolygon
        let erodedVertices = vertices;
        if (vertices.length > 2) {
            erodedVertices = setbackPolygon(vertices, -0.01);
        }
        if (currentParent !== null && currentParent !== undefined && erodedVertices.length > 3
            && !checkPolygonInsidePolygon(erodedVertices, currentParent.get2DVertices())) {
            const error = new Error(OUT_OF_BASE_MODEL_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        if (currentParent !== null && currentParent !== undefined && erodedVertices.length > 3
            && checkIntersectionWithSiblings(currentParent, this, erodedVertices)) {
            const error = new Error(MODEL_INTERSECTION_WITH_OTHER_MODELS);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        if (rawVertices === undefined) {
            rawVertices = vertices;
        }
        if (polygonExists && checkLastEdgeIntersectionWithEdges(rawVertices)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (polygonExists && checkIfLastVertexOnEdges(vertices)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        if (polygonExists && checkVertexEquivalency(vertices)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }

        if (parentExists) {
            if (erodedVertices.length === 0) {
                response.errors.push(new Error(POLYGON_WITH_NO_AREA_ERROR));
                parentExists = false;
            }
            if (parentExists) {
                erodedVertices.splice(2, 2);
                [response.parent] = getTopCommonModelBelowVertices(erodedVertices, this.stage);
            }
        }
        return response;
    }

    // Drawing functions

    initDrawingMode() {
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    /**
     * Gets the vertices geometry from draw manager and
     * places the handrail according to the drawn vertices.
     */
    async onComplete(geometry) {

        const notificationObject = this.stage.eventManager.setHandrailCreating();

        const vertices = _.range(geometry.noOfVertices).map(
            index =>
                new THREE.Vector3(
                    geometry.attributes.position.array[index * 3],
                    geometry.attributes.position.array[index * 3 + 1],
                    geometry.attributes.position.array[index * 3 + 2],
                ),
        );

        this.outlinePoints = vertices.map(
            vertex => new OutlinePoints(vertex.x, vertex.y, vertex.z, this, this.stage),
        );

        this.updateMeasurement();

        try {
            await this.placeObject();
            this.stage.eventManager.completeHandrailCreation(notificationObject);
            return true;
        }
        catch (error) {
            console.error('ERROR: Handrail: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorHandrailCreation(notificationObject);
            throw error;
        }
    }

    onCancel() {
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        const vertices2DVectorToArray = convertArrayTo3DVector(vertices2DArray);

        const topPoints = [];
        const bottomPoints = [];

        for (let i = 0; i < vertices2DVectorToArray.length; i += 1) {
            const bottomVector = vertices2DVectorToArray[i].clone();
            const topVector = vertices2DVectorToArray[i].clone();
            const z = this.getParent().getZOnTopSurface(bottomVector.x, bottomVector.y);

            bottomVector.setZ(z);
            topVector.setZ(z + this.coreHeight);

            topPoints.push(topVector);
            bottomPoints.push(bottomVector);
        }

        const geometry = new NikGeometry();
        const coreGeometry = geometry.createFromTopAndBottomPoints(topPoints, bottomPoints);

        // updating outline points height
        let constantForParapetAccommodation = 0;
        if (this.getParent() instanceof PolygonModel && this.getParent().isParapetPresent()) {
            constantForParapetAccommodation += this.getParent().getParapetHeight();
        }
        for (const outlinePoint of this.outlinePoints) {
            const position = outlinePoint.getPosition();
            outlinePoint.moveObjectWithoutConsequences(
                0,
                0,
                this.getParent().getZOnTopSurface(position.x, position.y) + this.coreHeight + constantForParapetAccommodation - position.z
            );
        }

        // updating meshes and edges
        this.coreMesh.geometry = coreGeometry;
        this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);

        // update measurement
        this.updateMeasurement();

        this.update3DHandrail();
    }

    update3DHandrail() {
        // remove old meshes
        while (this.objectGroupFor3D.children.length > 0) {
            this.objectGroupFor3D.remove(this.objectGroupFor3D.children[0]);
        }
        const vertices3D = this.get3DVertices();
        const verticesLength = vertices3D.length;
        for (let i = 0, l = vertices3D.length / 2; i < l - 1; i += 1) {
            this.update3DHandrailBetween2Points([
                vertices3D[i],
                vertices3D[i + 1],
                vertices3D[verticesLength - i - 2],
                vertices3D[verticesLength - i - 1],
            ], i === 0);
        }
    }

    update3DHandrailBetween2Points(vertices, addColumnAtBeginning = true) {
        // const vertices = this.get3DVertices();
        // 01 cross 03
        const v1 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[1][0], vertices[1][1], vertices[1][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        const v2 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[3][0], vertices[3][1], vertices[3][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        v1.cross(v2);
        v1.normalize(); // v1 is the normal unit vector to the parent surface.
        const multiplier = v1.z > 0 ? 1 : -1;

        const leftCenterPoint = new THREE.Vector3(
            (vertices[0][0] + vertices[3][0]) / 2,
            (vertices[0][1] + vertices[3][1]) / 2,
            ((vertices[0][2] + vertices[3][2]) / 2) - this.coreHeight,
            // - core height of safety line.
        );
        const rightCenterPoint = new THREE.Vector3(
            (vertices[1][0] + vertices[2][0]) / 2,
            (vertices[1][1] + vertices[2][1]) / 2,
            ((vertices[1][2] + vertices[2][2]) / 2) - this.coreHeight,
            // - core height of safety line.
        );

        const handrailLength = leftCenterPoint.distanceTo(rightCenterPoint);
        const baseCylindersPoints = [];
        const verticalCylindersPoints = [];
        let lerpFactor = baseCylinderRadius / handrailLength;
        const lerpFactorIncrement = baseCylinderDistance / handrailLength;
        while (lerpFactor < 1 - (baseCylinderRadius / handrailLength)) {
            const basePoint =
                new THREE.Vector3().lerpVectors(leftCenterPoint, rightCenterPoint, lerpFactor);
            const upPoint = basePoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
            const upPoint2 = basePoint.clone().addScaledVector(v1, multiplier * this.coreHeight);
            baseCylindersPoints.push({
                basePoint,
                upPoint,
            });
            verticalCylindersPoints.push({
                basePoint,
                upPoint: new THREE.Vector3(upPoint.x,upPoint.y, upPoint2.z),
            });
            lerpFactor += lerpFactorIncrement;
        }
        // setting up the last base cylinder
        const basePoint = new THREE.Vector3().lerpVectors(
            leftCenterPoint, rightCenterPoint,
            1 - (baseCylinderRadius / handrailLength),
        );
        const upPoint = basePoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
        const upPoint2 = basePoint.clone().addScaledVector(v1, multiplier * this.coreHeight);
        baseCylindersPoints.push({
            basePoint,
            upPoint,
        });
        verticalCylindersPoints.push({
            basePoint,
            upPoint: new THREE.Vector3(upPoint.x,upPoint.y, upPoint2.z),
        });

        let baseCoords = leftCenterPoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
        let heightCoords = leftCenterPoint.clone().addScaledVector(v1, multiplier * this.coreHeight);
        let rightCoords = rightCenterPoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
        let heightRightCoords = rightCenterPoint.clone().addScaledVector(v1, multiplier * this.coreHeight)
        const horizontalLineCylinderPoints = {
            basePoint: new THREE.Vector3(leftCenterPoint.x,leftCenterPoint.y, heightCoords.z),
            upPoint: new THREE.Vector3(rightCenterPoint.x,rightCenterPoint.y, heightRightCoords.z),
        };
        let heightCoords2 = leftCenterPoint.clone().addScaledVector(v1, multiplier * midHorizontalRailHeight);
        let heightRightCoords2 = rightCenterPoint.clone().addScaledVector(v1, multiplier * midHorizontalRailHeight)
        const horizontalLineCylinderPoints2 = {
            basePoint: new THREE.Vector3(leftCenterPoint.x,leftCenterPoint.y, heightCoords2.z),
            upPoint: new THREE.Vector3(rightCenterPoint.x,rightCenterPoint.y, heightRightCoords2.z),
        };

        const geometries = [];

        // base cylinders
        let j = addColumnAtBeginning ? 0 : 1;
        for (let l = baseCylindersPoints.length; j < l; j += 1) {
            geometries.push(...this.createVerticalCylinderMesh(
                baseCylindersPoints[j].basePoint,
                baseCylindersPoints[j].upPoint,
                baseCylinderRadius,
            ));
        }

        // vertical upright columns
        j = addColumnAtBeginning ? 0 : 1;
        for (let l = verticalCylindersPoints.length; j < l; j += 1) {
            geometries.push(...this.createVerticalCylinderMesh(
                verticalCylindersPoints[j].basePoint,
                verticalCylindersPoints[j].upPoint,
                verticalCylinderRadius,
            ));
        }

        // horizontal line in middle
        geometries.push(...this.createHorizontalCylinderMesh(
            horizontalLineCylinderPoints2.basePoint,
            horizontalLineCylinderPoints2.upPoint,
            handrailRadius,
        ));

        // horizontal line at the top
        geometries.push(...this.createHorizontalCylinderMesh(
            horizontalLineCylinderPoints.basePoint,
            horizontalLineCylinderPoints.upPoint,
            handrailRadius,
        ));

        const material = new THREE.MeshLambertMaterial({ color: handrailColor });

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

        const lineSegmentsMesh = new THREE.LineSegments(mergedGeometry, this.edgeMaterial2D);
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        this.merged3d = mergedMesh;
        this.objectGroupFor3D.add(lineSegmentsMesh);
        this.objectGroupFor3D.add(mergedMesh);

    }

    createVerticalCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 8);
        geometry.rotateX(Math.PI / 2);
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry];
    }

    createHorizontalCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const direction = new THREE.Vector3();
        direction.subVectors(endpoint2, endpoint1).normalize();
        const geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 8);
        const yAxis = new THREE.Vector3(0, 1, 0);
        yAxis.normalize();
        const rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(direction,yAxis);
        rotationAxis.normalize();
        const theta =- Math.acos(direction.dot(yAxis));
        const rotMatrix = new THREE.Matrix4();
        rotMatrix.makeRotationAxis(rotationAxis, theta);
        geometry.applyMatrix4(rotMatrix)
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry];
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        // update outline points without consequences
        this.outlinePoints.forEach(outlinePoint => {
            outlinePoint.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        });

        // update measurement
        this.onlyUpdateMeasurement();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        this.saveState();
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.outlinePoints[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setHandrailOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.walkwayVertexEquivalentError();
            }
            else if (error.message === MODEL_INTERSECTION_WITH_OTHER_MODELS) {
                this.stage.eventManager
                    .customErrorMessage('Handrail: ' + MODEL_INTERSECTION_WITH_OTHER_MODELS);
            }
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        if (this.getParent() !== placingInformation.parent) {
            this.stage.eventManager
                .customErrorMessage('Handrail: ' + OUT_OF_BASE_MODEL_ERROR);
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        this.updateGeometry();

        // update dimensions
        for(let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        // update siblings
        this.handleSiblingConsequences();

        this.stage.quadTreeManager.handlePlaceObject(this);

        return true;
    }

    handleSiblingConsequences() {
        const siblings = this.getParent().getChildren();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray) {
                sibling.deleteTableInsideArea(this.get2DVertices());
            }
        }
    }

    handleDragStart() {
        // this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        const notificationObject = this.stage.eventManager.setHandrailLoading();
        try {
            await this.placeObject();
            this.stage.eventManager.completeHandrailLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR HANDRAIL: handleDragEnd failed', error);
            this.stage.eventManager.completeHandrailLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex){
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Handrail: vertex not in outlinePoints in handleVertexDragStart');
        }
        // this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Handrail: vertex not in outlinePoints in handleVertexMove');
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Handrail: vertex not in outlinePoints in handleVertexMove');
        }

        const notificationObject = this.stage.eventManager.setHandrailLoading();

        try {
            await this.placeObject();

            // this.lengthMeasurement.setMovableVertex(vertex);

            // remove dimensions if not over edge and update after resize
            for(let dimension in this.dimensionObjects) {
                this.dimensionObjects[dimension].handleAssociatedObjectUpdateGeometry(this);
            }

            this.stage.eventManager.completeHandrailLoading(notificationObject);

            this.stage.eventManager.setObjectsSelected(this);

            this.saveState();
        }
        catch (error) {
            console.error('ERROR Walkway: handleVertexPlace failed', error);
            this.stage.eventManager.completeHandrailLoading(notificationObject);
            throw error;
        }
    }

    async removeObject(isTemporaryDuplicate = false) {

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.removeMeasurement();

        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.removeDimensions();

        this.stage.quadTreeManager.removeObject(this);
        //when duplicates are updated in run time they remove the extra models so selecting ground during runtime ,
        //merges the scene hence entire scene moves. the istemporaryduplicate is set false as soon the duplicates are placed in duplicate manager.
        if(!isTemporaryDuplicate){
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
    }

    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.WALKWAY;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            if (this.coreMesh.material !== this.meshMaterial2D) {
                this.coreMesh.material = this.meshMaterial2D;
                this.coreEdges.material = this.edgeMaterial2D;
            }
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            if (this.coreMesh.material !== this.meshMaterial2D) {
                this.coreMesh.material = this.meshMaterial2D;
                this.coreEdges.material = this.edgeMaterial2D;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges);

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        }
        else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    // Functions related to vertices.

    static getOuterVerticesInSequence(directVertices, calculatedVertices) {
        if (directVertices.length === 0 || calculatedVertices.length === 0) {
            return [];
        }
        const vertices = [];
        for (let i = 0, l = directVertices.length; i < l; i += 2) {
            vertices.push(directVertices[i]);
        }
        vertices.push(directVertices[directVertices.length - 1]);

        const insertPosition = vertices.length;
        vertices.splice(insertPosition, 0, calculatedVertices[0]);
        for (let i = 2, l = calculatedVertices.length; i < l; i += 2) {
            // vertices.splice(insertPosition, 0, calculatedVertices[i]);
            const intersection = checkLineIntersection(
                [
                    new THREE.Vector2(calculatedVertices[i - 2][0], calculatedVertices[i - 2][1]),
                    new THREE.Vector2(calculatedVertices[i - 1][0], calculatedVertices[i - 1][1]),
                ],
                [
                    new THREE.Vector2(calculatedVertices[i][0], calculatedVertices[i][1]),
                    new THREE.Vector2(calculatedVertices[i + 1][0], calculatedVertices[i + 1][1]),
                ],
            );

            if (intersection.x !== null && intersection.y !== null) {
                vertices.splice(insertPosition, 0, [intersection.x, intersection.y]);
            }
            else if(intersection.x == null && intersection.y == null) {
                vertices.splice(insertPosition, 0, calculatedVertices[i]);
            }
        }
        vertices.splice(insertPosition, 0, calculatedVertices[calculatedVertices.length - 1]);

        return vertices;
    }

    get3DVertices() {
        const vertices = this.get2DVertices();
        for (let vertex of vertices) {
            vertex.push(this.getParent().getZOnTopSurface(vertex[0], vertex[1]) + this.coreHeight);
        }
        return vertices;
    }

    get2DVertices(drawingVertices = []) {
        const directVertices = [];
        const calculatedVertices = [];
        if (drawingVertices.length > 1) {
            for (let i = 0, l = drawingVertices.length; i < l - 1; i += 1) {
                const rectangleVertices = this.get2DVerticesUsing2Points(
                    drawingVertices[i],
                    drawingVertices[i + 1],
                );
                directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
            }
        }
        else {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                const rectangleVertices = this.get2DVerticesUsing2Points(
                    this.outlinePoints[i].getPosition(),
                    this.outlinePoints[i + 1].getPosition(),
                );
                directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
            }
        }
        return Handrail.getOuterVerticesInSequence(directVertices, calculatedVertices);
    }

    get2DVerticesUsing2Points(vertexA = null, vertexB = null) {
        const vertex1 = vertexA;
        const vertex2 = vertexB;
        if (vertex1 == null || vertex2 == null) {
            console.error('Wrong vertices passed in get2DVerticesUsing2Points');
        }
        if (vertex1.distanceTo(vertex2) === 0) {
            return [];
        }
        let vertex3;
        let vertex4;
        if (this.getParent() === null || this.getParent() === undefined ||
            this.getParent() instanceof Ground || this.getParent().getTilt() === 0) {
            const vertices = getNormalPoints(
                vertex1,
                vertex2,
                this.width,
                this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION ?
                    DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
            );
            if (vertices === null) {
                return [
                    [vertex1.x, vertex1.y],
                    [vertex2.x, vertex2.y],
                ];
            }
            [vertex3, vertex4] = vertices;
        }
        else {
            vertex1.z = this.getParent().getZOnTopSurface(vertex1.x, vertex1.y);
            vertex2.z = this.getParent().getZOnTopSurface(vertex2.x, vertex2.y);
            [vertex3, vertex4] = getNormalPointsWithTiltedParent(
                this.getParent().get3DVertices(),
                vertex1,
                vertex2,
                this.width,
                this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION ?
                    DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
            );
        }
        return [
            [vertex1.x, vertex1.y],
            [vertex2.x, vertex2.y],
            [vertex4.x, vertex4.y],
            [vertex3.x, vertex3.y],
        ];
    }

    static getOuterVerticesInSequence2(directVertices, calculatedVertices) {
        const vertices = [];
        // const calculatedVertices = [];
        for (let i = 0, l = directVertices.length; i < l; i += 2) {
            vertices.push(directVertices[i]);
        }
        vertices.push(directVertices[directVertices.length - 1]);

        const insertPosition = vertices.length;
        vertices.splice(insertPosition, 0, calculatedVertices[0]);
        for (let i = 2, l = calculatedVertices.length; i < l; i += 2) {
            // vertices.splice(insertPosition, 0, calculatedVertices[i]);
            const intersection = checkLineIntersection(
                [
                    new THREE.Vector2(calculatedVertices[i - 2].x, calculatedVertices[i - 2].y),
                    new THREE.Vector2(calculatedVertices[i - 1].x, calculatedVertices[i - 1].y),
                ],
                [
                    new THREE.Vector2(calculatedVertices[i].x, calculatedVertices[i].y),
                    new THREE.Vector2(calculatedVertices[i + 1].x, calculatedVertices[i + 1].y),
                ],
            );

            if (intersection.x !== null && intersection.y !== null) {
                vertices.splice(insertPosition, 0, new THREE.Vector2(intersection.x, intersection.y));
            }
        }
        vertices.splice(insertPosition, 0, calculatedVertices[calculatedVertices.length - 1]);

        return vertices;
    }

    getTiltAdjustedVertices(drawingVertices, parent) {
        const directVertices = [];
        const calculatedVertices = [];

        if (drawingVertices.length > 1) {
            for (let i = 0, l = drawingVertices.length; i < l - 1; i += 1) {
                const rectangleVertices = this.getTiltAdjustedVerticesWrt2Points(
                    drawingVertices[i],
                    drawingVertices[i + 1],
                    parent,
                );
                directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
            }
        }
        const vertices = Handrail.getOuterVerticesInSequence2(directVertices, calculatedVertices);
        // for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
        // }
        return vertices;
    }

    getTiltAdjustedVerticesWrt2Points(vertex1, vertex2, parent) {
        if (parent == null) {
            return null;
        }
        if (parent instanceof Ground || parent.getTilt() === 0) {
            const [vertex3, vertex4] = getNormalPoints(
                vertex1,
                vertex2,
                this.width,
                this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION ?
                    DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
            );
            return [
                new THREE.Vector2(vertex1.x, vertex1.y),
                new THREE.Vector2(vertex2.x, vertex2.y),
                new THREE.Vector2(vertex4.x, vertex4.y),
                new THREE.Vector2(vertex3.x, vertex3.y),
            ];
        }
        vertex1.z = parent.getZOnTopSurface(vertex1.x, vertex1.y);
        vertex2.z = parent.getZOnTopSurface(vertex2.x, vertex2.y);
        const [vertex3, vertex4] = getNormalPointsWithTiltedParent(
            parent.get3DVertices(),
            vertex1,
            vertex2,
            this.width,
            this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION ?
                DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
        );
        return [
            new THREE.Vector2(vertex1.x, vertex1.y),
            new THREE.Vector2(vertex2.x, vertex2.y),
            new THREE.Vector2(vertex4.x, vertex4.y),
            new THREE.Vector2(vertex3.x, vertex3.y),
        ];
    }

    toggleDirectionDuringCreation() {
        if (this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION) {
            this.handrailDirection = ALTERNATE_HANDRAIL_DIRECTION;
        }
        else if (this.handrailDirection === ALTERNATE_HANDRAIL_DIRECTION) {
            this.handrailDirection = DEFAULT_HANDRAIL_DIRECTION;
        }
    }

    toggleDirection() {
        if (this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION) {
            this.handrailDirection = ALTERNATE_HANDRAIL_DIRECTION;
        }
        else if (this.handrailDirection === ALTERNATE_HANDRAIL_DIRECTION) {
            this.handrailDirection = DEFAULT_HANDRAIL_DIRECTION;
        }

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setHandrailOutOfGroundRemoved();
            }
            if (error.message === OUT_OF_BASE_MODEL_ERROR) {
                this.stage.eventManager
                    .customErrorMessage('Handrail: ' + OUT_OF_BASE_MODEL_ERROR);
            }
            this.removeObject();
            return;
        }

        this.updateGeometry();

        this.updateMeasurement();

        const notificationObject = this.stage.eventManager.setHandrailLoading();

        try {
            this.handleSiblingConsequences();
        }
        catch (error) {
            console.error('HANDRAIL: toggleDirection: handling sibling consequences failed', error);
        }
        finally {
            this.stage.eventManager.completeHandrailLoading(notificationObject);
        }

        this.saveState();

        return true;
    }

    getPosition() {
        const { cumulativeX, cumulativeY, cumulativeZ } = this.get3DVertices().reduce(
            (acc, vertex) => {
                return {
                    cumulativeX: acc.cumulativeX + vertex[0],
                    cumulativeY: acc.cumulativeY + vertex[1],
                    cumulativeZ: acc.cumulativeZ + vertex[2],
                };
            },
            {
                cumulativeX: 0,
                cumulativeY: 0,
                cumulativeZ: 0,
            },
        );
        return new THREE.Vector3(
            cumulativeX / this.numVertices,
            cumulativeY / this.numVertices,
            cumulativeZ / this.numVertices,
        );
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();
        this.removeMeasurement();
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        for (let i = 0, len = mirroredData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                mirroredData.outlinePoints[i][0],
                mirroredData.outlinePoints[i][1],
                mirroredData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }
        if (this.getParent().getTilt() === 0) {
            this.handrailDirection = mirroredData.handrailDirection;
        }

        this.updateMeasurement();
        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            children[i].mirrorObjectAlongEdge(edge);
        }
        if (maintainCentroid) {
            const newPosition = this.getPosition();
            // We want the mirror to be in the exact same position of the original object
            // so moving the base by a displacement of original - new
            // this move should not affect any attached dimension.
            const deltaX = oldPosition.x - newPosition.x;
            const deltaY = oldPosition.y - newPosition.y;
            this.moveObject(deltaX, deltaY, 0);
            this.moveDimensions(-deltaX, -deltaY, 0);
            return new THREE.Vector2(deltaX, deltaY);
        }
        return new THREE.Vector2(0, 0);
    }

    // Measurement functions

    updateMeasurement() {
        if (this.lengthMeasurements !== []) {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].remove();
            }
            this.lengthMeasurements = [];
        }

        if (this.handrailDirection === DEFAULT_HANDRAIL_DIRECTION) {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                this.lengthMeasurements.push(new LengthMeasurement(
                    this.outlinePoints[i],
                    this.outlinePoints[i + 1],
                    this.stage,
                    this,
                ));
            }
        }
        else if (this.handrailDirection === ALTERNATE_HANDRAIL_DIRECTION) {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                this.lengthMeasurements.push(new LengthMeasurement(
                    this.outlinePoints[i + 1],
                    this.outlinePoints[i],
                    this.stage,
                    this,
                ));
            }
        }

        if (this.stage.selectionControls.getSelectedObject() === this) {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].show();
                this.lengthMeasurements[i].update();
            }
        }
        else {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].hide();
            }
        }
    }

    onlyUpdateMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].update();
        }
    }

    showMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].show();
            this.lengthMeasurements[i].update();
        }
    }

    hideMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].hide();
        }
    }

    removeMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].remove();
        }
    }

    // visual functions

    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        if (this.stage.visualManager.getIn3D() && !this.stage.sldView) {
            this.switchTo3D();
        }
        else {
            this.switchTo2D();
        }
    }

    switchTo3D() {
        this.objectsGroup.remove(this.coreMesh);
        this.objectsGroup.remove(this.coreEdges);
        this.objectsGroup.add(this.objectGroupFor3D);
    }

    switchTo2D() {
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);
        this.objectsGroup.remove(this.objectGroupFor3D);
    }

    // Universal functions

    onSelect() {
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // show measurements
        this.showMeasurement();

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );
        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let v of this.outlinePoints) {
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v)
                );
            }
        }
    }

    isIgnored() {
        return false;
    }

    deSelect() {
        // hide outline points
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }

        // hide measurements
        this.hideMeasurement();
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
    }

    showObjectLayer(){
        for(let child of this.objectsGroup.children){
            child.layers.enable(0);
        }
        for(let child of this.objectGroupFor3D.children){
            child.layers.enable(0);
        }
    }

    hideObjectLayer(){
        for(let child of this.objectsGroup.children){
            child.layers.disable(0);
        }
        for(let child of this.objectGroupFor3D.children){
            child.layers.disable(0);
        }
    }
    get mesh() {
        return this.coreMesh;
    }
    
    get mesh2D() {
        return this.coreMesh;
    }

    get mesh3D(){
        return this.merged3d;
    }

    get mergeMeshMaterial2D() {
        return this.meshMaterial2D;
    }
 
    get mergeEdgeMaterial2D() {
        return this.edgeMaterial2D;
    }

    static getObjectType() {
        return 'Handrail';
    }

    getZOnTopSurface(x, y) {
        const parent = this.parent;
        if (parent) {
            return parent.getZOnTopSurface(x, y) + this.height;
        }
        return this.height;
    }

}
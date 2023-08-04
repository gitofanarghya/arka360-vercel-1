import * as THREE from 'three';
import _ from 'lodash';

import BaseObject from '../BaseObject';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
    MATERIAL_STATES,
    WALKWAY_2D_LINE_WIDTH,
    LINE_WIDTH,
} from '../visualConstants';
import OutlinePoints from '../subObjects/OutlinePoints';
import LengthMeasurement from '../subObjects/LengthMeasurement';
import {
    areVerticesOnGround,
    getTopCommonModelBelowVertices,
} from '../../utils/raycastingUtils';
import {
    convertArrayToVector,
    setbackPolygon,
    getNormalPoints,
    getNormalPointsWithTiltedParent,
    convertArrayTo3DVector,
    checkVertexEquivalency,
    rotationAroundPoint,
} from '../../utils/utils';
import PolygonModel from './PolygonModel';
import Subarray from '../subArray/Subarray';
import { verticesToJSTSPolygon } from '../../utils/JSTSConverter';
import Ground from '../ground/Ground';
import * as visualUtils from '../../utils/visualUtils';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import NikGeometry from '../ground/NikGeometry';

const MINIMUM_NUMBER_OF_POINTS = 2;

class Walkway extends BaseObject {
    constructor(stage) {
        super(stage);

        // standard norms
        this.stage = stage;
        this.id = this.getInitiatingId();
        this.name = `Walkway #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // materials
        this._meshMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .WALKWAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: WALKWAY_2D_LINE_WIDTH,
            color: COLOR_MAPPINGS
                .WALKWAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this._meshMaterial3D = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .WALKWAY[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._meshMaterial3D.defines = this._meshMaterial3D.defines || {};
        this._meshMaterial3D.defines.CUSTOM = '';
        this._edgeMaterial3D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .WALKWAY[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // list of outline points
        this.outlinePoints = [];

        // meshes and edges
        this.coreMesh = createMesh(createBufferGeometry(), this._meshMaterial2D)
        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this._edgeMaterial2D,
        );

        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        // walkway properties
        const defaultValues = this.getDefaultValues();
        this.walkwayDirection = DEFAULT_WALKWAY_DIRECTION;
        this.coreHeight = defaultValues.coreHeight;
        this.width = defaultValues.width;

        // length measurement
        this.lengthMeasurement = null;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.prevIntersectingSubarrays = [];

        this.updateVisualsAfterLoadingAndCreation();
    }

    getInitiatingId() {
        return this.stage.getWalkwayId();
    }

    getState() {
        const walkwayData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            walkwayDirection: this.walkwayDirection,
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
            this.walkwayDirection = state.walkwayDirection;

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
                    console.error("Walkway: loadState: outlinePoints length don't match");
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
        this.lengthMeasurement.remove();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

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

    saveObject(isCopy = false) {
        const walkwayData = {
            type: Walkway.getObjectType(),
            id: this.id,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            walkwayDirection: this.walkwayDirection,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            walkwayData.uuid = this.uuid;
        }
        return walkwayData;
    }

    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
        }

        this.coreHeight = data.coreHeight;
        this.width = data.width;
        this.walkwayDirection = data.walkwayDirection;

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
        } else {
            this.saveState({ withoutContainer: true });
        }
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();
        this.lengthMeasurement.remove();
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
            this.walkwayDirection = mirroredData.walkwayDirection;
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

    // event manager functions

    setObjectCreating() {
        return this.stage.eventManager.setWalkwayCreating();
    }

    completeObjectCreation(notificationObject) {
        this.stage.eventManager.completeWalkwayCreation(notificationObject);
    }

    errorObjectCreation(notificationObject) {
        this.stage.eventManager.errorWalkwayCreation(notificationObject);
    }

    setObjectLoading() {
        return this.stage.eventManager.setWalkwayLoading();
    }

    completeObjectLoading(notificationObject) {
        this.stage.eventManager.completeWalkwayLoading(notificationObject);
    }

    // Drawing functions

    initDrawingMode() {
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    async onComplete(geometry) {

        let notificationObject = this.setObjectCreating();

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
            this.completeObjectCreation(notificationObject);
            return true;
        } catch (error) {
            console.error('ERROR: Walkway: onCompleted failed', error);
            this.onCancel();
            this.errorObjectCreation(notificationObject);
            throw error;
        }
    }

    onCancel() {
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }


    // Geometry functions

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

        for (let i = 0; i < this.outlinePoints.length; i += 1) {
            const outlinePoint = this.outlinePoints[i];
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
        this.lengthMeasurement.update();
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        // update outline points without consequences
        for (let i = 0; i < this.outlinePoints.length; i += 1) {
            const outlinePoint = this.outlinePoints[i];
            outlinePoint.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        this.lengthMeasurement.update();

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

    getPlacingInformation(drawingVertices) {
        let vertices = drawingVertices;

        const response = {};
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        response.pointUnplaceableError = null;

        if (vertices !== null && vertices !== undefined) {
            if (vertices.length < MINIMUM_NUMBER_OF_POINTS) {
                const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
                response.cannotCompleteError = error;
                response.errors.push(error);
                parentExists = false;
                polygonExists = false;
            }

            if (polygonExists) {
                vertices = this.get2DVertices(
                    new THREE.Vector3(vertices[0][0], vertices[0][1]),
                    new THREE.Vector3(vertices[1][0], vertices[1][1]),
                );
                if (vertices.length === 0) {
                    polygonExists = false;
                }
            }
        }
        else {
            vertices = this.get2DVertices();
        }

        if (!areVerticesOnGround(vertices, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }

        if (polygonExists && checkVertexEquivalency(vertices)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }

        if (polygonExists) {
            const erodedVertices = setbackPolygon(vertices, -0.001);
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

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setWalkwayOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.walkwayVertexEquivalentError();
            }
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        const parentModel = placingInformation.parent;

        this.changeParent(parentModel);

        this.updateGeometry();

        // update dimensions
        for(let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        // update siblings
        try {
            this.handleSiblingConsequences();

            this.stage.quadTreeManager.handlePlaceObject(this);

            this.saveState();
        } catch (error) {
            console.error('ERROR: Walkway: placeObject failed', error);
            return Promise.reject(error);
        }

        return true;
    }

    handleDragStart() {
        this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        const notificationObject = this.setObjectLoading();
        try {
            await this.placeObject();
            this.completeObjectLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR Walkway: handleDragEnd failed', error);
            this.completeObjectLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex){
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Walkway: vertex not in outlinePoints in handleVertexDragStart');
        }
        this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Walkway: vertex not in outlinePoints in handleVertexMove');
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Walkway: vertex not in outlinePoints in handleVertexMove');
        }

        const notificationObject = this.setObjectLoading();

        try {
            await this.placeObject();

            this.lengthMeasurement.setMovableVertex(vertex);

            // remove dimensions if not over edge and update after resize
            for(let dimension in this.dimensionObjects) {
                this.dimensionObjects[dimension].handleAssociatedObjectUpdateGeometry(this);
            }

            this.completeObjectLoading(notificationObject);

            this.stage.eventManager.setObjectsSelected(this);

            this.saveState();
        }
        catch (error) {
            console.error('ERROR Walkway: handleVertexPlace failed', error);
            this.completeObjectLoading(notificationObject);
            throw error;
        }
    }


    // Measurement functions

    updateMeasurement() {
        if (this.lengthMeasurement !== null) {
            this.lengthMeasurement.remove();
        }

        if (this.walkwayDirection === DEFAULT_WALKWAY_DIRECTION) {
            this.lengthMeasurement = new LengthMeasurement(
                this.outlinePoints[0],
                this.outlinePoints[1],
                this.stage,
                this,
            );
        }
        else if (this.walkwayDirection === ALTERNATE_WALKWAY_DIRECTION) {
            this.lengthMeasurement = new LengthMeasurement(
                this.outlinePoints[1],
                this.outlinePoints[0],
                this.stage,
                this,
            );
        }

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.lengthMeasurement.show();
            this.lengthMeasurement.update();
        } else {
            this.lengthMeasurement.hide();
        }
    }

    // on cancel handler for LengthMeasurement
    handleOnCancel() {
        // do nothing
        return true;
    }

    // Properties update functions

    getDefaultValues() {
        const designSettings = this.stage.getDesignSettings();
        return {
            coreHeight: designSettings.drawing_defaults.walkwayModel.coreHeight,
            width: designSettings.drawing_defaults.walkwayModel.width,
        }
    }

    async updateObject(properties) {
        this.name = _.get(properties, 'name', this.name);

        if (properties.coreHeight && properties.coreHeight !== this.coreHeight) {
            this.changeHeight(properties.coreHeight);
        }

        if (properties.width && properties.width !== this.width) {
            await this.changeWidth(properties.width);
        }

        this.saveState();

        return true;
    }

    changePropertiesDuringCreation(properties) {
        this.name = _.get(properties, 'name', this.name);
        this.coreHeight = _.get(properties, 'coreHeight', this.coreHeight);
        this.width = _.get(properties, 'width', this.width);
    }

    changeHeight(height) {
        this.coreHeight = height;

        this.updateGeometry();
    }

    async changeWidth(width) {
        this.width = width;

        this.updateGeometry();

        try {
            this.handleSiblingConsequences();
            return true;
        }
        catch (error) {
            console.error('Walkway: changeWidth: Updating siblings failed', error);
            throw error;
        }
    }

    async toggleWalkwayDirection() {
        if (this.walkwayDirection === DEFAULT_WALKWAY_DIRECTION) {
            this.walkwayDirection = ALTERNATE_WALKWAY_DIRECTION;
        }
        else if (this.walkwayDirection === ALTERNATE_WALKWAY_DIRECTION) {
            this.walkwayDirection = DEFAULT_WALKWAY_DIRECTION;
        }

        this.updateGeometry();

        this.updateMeasurement();

        const notificationObject = this.setObjectLoading();

        try {
            this.handleSiblingConsequences();
        }
        catch (error) {
            console.error('Walkway: toggleWalkwayDirection: handling sibling consequences failed', error);
        }
        finally {
            this.completeObjectLoading(notificationObject);
        }

        this.saveState();

        return true;
    }

    toggleWalkwayDirectionDuringCreation() {
        if (this.walkwayDirection === DEFAULT_WALKWAY_DIRECTION) {
            this.walkwayDirection = ALTERNATE_WALKWAY_DIRECTION;
        }
        else if (this.walkwayDirection === ALTERNATE_WALKWAY_DIRECTION) {
            this.walkwayDirection = DEFAULT_WALKWAY_DIRECTION;
        }
    }


    // consequences functions

    handleSiblingConsequences() {
        const siblings = this.getParent().getChildren();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray) {
                sibling.deleteTableInsideArea(this.get2DVertices());
            }
        }
    }


    // Helper functions

    get numVertices() {
        return 4;
    }

    get mesh() {
        return this.coreMesh;
    }

    get mesh2D() {
        return this.coreMesh;
    }

    get mesh3D() {
        return this.coreMesh;
    }

    get mergeMeshMaterial2D() {
        return this._meshMaterial2D;
    }

    get mergeMeshMaterial3D() {
        return this._meshMaterial3D;
    }

    get mergeEdgeMaterial2D() {
        return this._edgeMaterial2D;
    }

    get mergeEdgeMaterial3D() {
        return this._edgeMaterial3D;
    }

    getTiltAdjustedVertices(vertex1, vertex2, parent) {
        if (parent == null) {
            return null;
        }
        if (parent instanceof Ground || parent.getTilt() == 0) {
            const [vertex3, vertex4] = getNormalPoints(
                vertex1,
                vertex2,
                this.width,
                this.walkwayDirection,
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
            this.walkwayDirection,
        );
        return [
            new THREE.Vector2(vertex1.x, vertex1.y),
            new THREE.Vector2(vertex2.x, vertex2.y),
            new THREE.Vector2(vertex4.x, vertex4.y),
            new THREE.Vector2(vertex3.x, vertex3.y),
        ];
    }


    get2DVertices(vertexA = null, vertexB = null) {
        let vertex1 = vertexA;
        let vertex2 = vertexB;
        if (vertex1 == null && vertex2 == null) {
            vertex1 = this.outlinePoints[0].getPosition();
            vertex2 = this.outlinePoints[1].getPosition();
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
                this.walkwayDirection,
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
                this.walkwayDirection,
            );
        }
        return [
            [vertex1.x, vertex1.y],
            [vertex2.x, vertex2.y],
            [vertex4.x, vertex4.y],
            [vertex3.x, vertex3.y],
        ];
    }

    get3DVertices() {
        let vertices = this.get2DVertices();
        for (let vertex of vertices) {
            vertex.push(this.getParent().getZOnTopSurface(vertex[0], vertex[1]) + this.coreHeight);
        }
        return vertices;
    }

    getHighestZ() {
        let highestZ = 0;
        const { array } = this.coreMesh.geometry.attributes.position;

        for (let i = 0; i < array.length; i += 3) {
            const z = array[i + 2];

            if (z) {
                highestZ = Math.max(highestZ, z);
            }
        }
        return highestZ;
    }

    getZOnTopSurface(x, y) {
        const parent = this.parent;
        if (parent) {
            return parent.getZOnTopSurface(x, y) + this.height;
        }
        return this.height;
    }

    getTilt() {
        const parent = this.getParent();
        if (parent instanceof PolygonModel) {
            return parent.getTilt();
        }
        return 0;
    }

    getAzimuth() {
        const parent = this.getParent();
        if (parent instanceof PolygonModel) {
            return parent.getAzimuth();
        }
        return 0;
    }

    getId() {
        return this.id;
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

    computeLength() {
        const vertex1 = this.outlinePoints[0].getPosition();
        const vertex2 = this.outlinePoints[1].getPosition();
        return vertex2.distanceTo(vertex1);
    }

    getIntersectingSubarrays() {
        let intersectingSubarrays = [];
        const siblings = this.getParent().getChildren();
        for (let sibling of siblings) {
            if (sibling instanceof Subarray) {
                const walkwayPolygon = verticesToJSTSPolygon(this.get2DVertices());
                const siblingPolygon = verticesToJSTSPolygon(sibling.get2DVertices());
                const intersectingPolygon = walkwayPolygon.intersection(siblingPolygon);
                if (intersectingPolygon.getArea() > 0) {
                    intersectingSubarrays.push(sibling);
                }
            }
        }
        return intersectingSubarrays;
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
            if (this.coreMesh.material !== this._meshMaterial3D) {
                this.coreMesh.material = this._meshMaterial3D;
                this.coreEdges.material = this._edgeMaterial3D;
            }
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            if (this.coreMesh.material !== this._meshMaterial2D) {
                this.coreMesh.material = this._meshMaterial2D;
                this.coreEdges.material = this._edgeMaterial2D;
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

    // Universal functions

    onSelect() {
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // show measurements
        this.lengthMeasurement.show();
        this.lengthMeasurement.update();

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

    deSelect() {
        // hide outline points
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }

        // hide measurements
        this.lengthMeasurement.hide();
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
    }

    hideObjectLayer(){
        for(let child of this.objectsGroup.children){
            child.layers.disable(0);
        }
    }

    async removeObject(isTemporaryDuplicate = false) {

        let currentIntersectingSubarrays = this.getIntersectingSubarrays();

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

        this.lengthMeasurement.remove();

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
        const allPromises = [];
        for (const subarray of currentIntersectingSubarrays) {
            allPromises.push(subarray.updatePanelPlacement({withoutContainer: false, noRefresh: true}));
        }
        try {
            await Promise.all(allPromises);
        }
        catch (error) {
            console.error('ERROR: Walkway: removeObject: Updating intersecting subarrays failed', error);
        }
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

    static getObjectType() {
        return 'Walkway';
    }
}

export default Walkway;

import * as THREE from 'three';
import OutlinePoints from '../subObjects/OutlinePoints';
import PolygonMeasurement from '../subObjects/PolygonMeasurement';
import RotationPoint from '../subObjects/RotationPoint';
import PolygonModel from "./PolygonModel";
import * as utils from '../../utils/utils';
import * as raycastingUtils from '../../utils/raycastingUtils';
import {
    COMPLEX_GEOMETRY_ERROR,
    INVALID_CORE_HEIGHT_ERROR,
    INVALID_TILT_ERROR,
    INVALID_TOP_HEIGHT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    OUT_OF_GROUND_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    VERTEX_OVER_EDGE_ERROR
} from '../../coreConstants';
import { MINIMUM_NUMBER_OF_POINTS } from '../subObjects/TextBox';
import { SmartroofModel } from './smartroof/SmartroofModel';

export default class RectangleObstruction extends PolygonModel {
    constructor(stage) {
        super(stage, true);
        this.isRotationAllowed = false;
        this.setbackInside = null;
        this.flushType = false;
        this.obstructionType = RectangleObstruction.getObjectType();
    }

    async onComplete(geometry, geomVertices){
        const notificationObject = this.stage.eventManager.setRectangleCreating();
        const vertices = [];
        for (let i = 0; i < (geomVertices.length/3)-1; i += 1) {
            vertices.push(new THREE.Vector3(
                geomVertices[i * 3],
                geomVertices[(i * 3) + 1],
                geomVertices[(i * 3) + 2],
            ));
        }
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
                this,
                this.stage,
            ));
        }
        // create polygon measurement
        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);
        try {
            await this.placeObject();
            this.azimuth = this.getParent().azimuth===undefined ? 180 : this.getParent().azimuth;
            this.stage.eventManager.completeRectangleCreation(notificationObject);
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorRectangleCreation(notificationObject);
            return Promise.reject(error);
        }
    }

    handleVertexMove(vertex, deltaX = 0, deltaY = 0, deltaZ = 0, vertexValueBeforeMoved = 0) {
        if (!(vertex instanceof RotationPoint) && this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: PolygonModel: vertex not in outlinePoints in handleVertexMove');
        }
        const displacementVector = new THREE.Vector3(deltaX, deltaY, 0);
        const movedVertexIndex = this.outlinePoints.indexOf(vertex);
        const prevPoint = this.outlinePoints[(movedVertexIndex-1)<0 ? this.outlinePoints.length - 1 : movedVertexIndex-1];
        const nextPoint = this.outlinePoints[(movedVertexIndex+1)>=(this.outlinePoints.length) ? 0 : movedVertexIndex+1];
        const prevLine = prevPoint.getPosition().sub(vertexValueBeforeMoved);
        const nextLine = nextPoint.getPosition().sub(vertexValueBeforeMoved);
        prevLine.z = 0;
        nextLine.z = 0;
        let prevLineMoved = new THREE.Vector3(0,0,0);
        let nextLineMoved = new THREE.Vector3(0,0,0);
        prevLineMoved = displacementVector.clone().projectOnVector(prevLine);
        nextLineMoved = displacementVector.clone().projectOnVector(nextLine);
        prevPoint.moveObjectWithoutConsequences(nextLineMoved.x, nextLineMoved.y, deltaZ);
        nextPoint.moveObjectWithoutConsequences(prevLineMoved.x, prevLineMoved.y, deltaZ);
        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    updateWhilePlacing(placingInformation) {
        if (!this.isRotationAllowed && placingInformation.parent && (placingInformation.parent.azimuth !== this.azimuth)) {
            const rotationPoint = this.getPosition();
            let angleToRotate = this.azimuth - (placingInformation.parent.azimuth ? placingInformation.parent.azimuth : 180);
            // if (angleToRotate < 0) {
            //     angleToRotate += 360;
            // }
            const angleInRad = THREE.MathUtils.degToRad(angleToRotate);
            for (let i = 0; i < this.outlinePoints.length; i++) {
                const outlinePointX = this.outlinePoints[i].getPosition().x;
                const outlinePointY = this.outlinePoints[i].getPosition().y;
                const outlineDeltaXY = utils.rotationAroundPoint(
                    rotationPoint.x,
                    rotationPoint.y,
                    outlinePointX,
                    outlinePointY,
                    angleInRad,
                );

                this.outlinePoints[i].moveObjectWithoutConsequences(
                    outlineDeltaXY[0] - outlinePointX,
                    outlineDeltaXY[1] - outlinePointY,
                );
            }
            this.azimuth = placingInformation.parent.azimuth ? placingInformation.parent.azimuth : 180;
            this.updateGeometry(true);
            this.polygonMeasurement.hide();
            const children = this.getChildren();
            for (let i = 0, l = children.length; i < l; i += 1) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                }
                children[i].updateGeometry();
                children[i].rotateObjectHelper(angleInRad, rotationPoint);
            }
        }
    }
    getPlacingInformation(vertices) {
        const response = {};
        let numberOfPoints;

        // Getting vertices
        let vertices2DArray;
        if (vertices === null || vertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        } else {
            vertices2DArray = vertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        if (!raycastingUtils.areVerticesOnGround(vertices2DVectorArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DVectorArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        let erodedVertices;
        if (polygonExists) {
            // To accommodate for snapping
            erodedVertices = vertices2DArray;
            if (erodedVertices.length === 0) {
                response.errors.push(new Error(POLYGON_WITH_NO_AREA_ERROR));
                parentExists = false;
            }

            if (parentExists) {
                // using raycaster to get the top most model in new place
                // and get height of it for deltaZ
                // but ignoring this model or its child as we don't want to place over them
                const idsToIgnore = [this.uuid];
                this.getChildrenModelUuids(idsToIgnore);

                const allBelowModels =
                    raycastingUtils.getAllModelsBelowVertices(erodedVertices, this.stage);
                let [newParent, newHeight] = [-1, -1];
                for (let i = 0; i < allBelowModels.length; i += 1) {
                    const model = allBelowModels[i][0];
                    const height = allBelowModels[i][1];
                    if (!idsToIgnore.includes(model.uuid) && !(model instanceof SmartroofModel)) {
                        if (newHeight < height) {
                            [newParent, newHeight] = [model, height];
                        }
                    }
                }

                response.parent = newParent;
                response.height = newHeight;

                if (vertices2DVectorArray.length >= 3) {
                    const tiltAndHeightsParams = {
                        coreHeight: this.coreHeight,
                        topHeight: this.topHeight,
                        tilt: this.tilt,
                        azimuth: this.azimuth,
                        lockedParameter: this.lockedParameter,
                        parent: newParent,
                        vertices: vertices2DVectorArray,
                    };

                    response.tiltAndHeights = this.computeTiltAndHeights(tiltAndHeightsParams);
                    if (response.tiltAndHeights.coreHeight <= 0) {
                        const error = new Error(INVALID_CORE_HEIGHT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                    if (response.tiltAndHeights.topHeight <= 0) {
                        const error = new Error(INVALID_TOP_HEIGHT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                    if (response.tiltAndHeights.tilt < 0 ||
                        response.tiltAndHeights.tilt === null) {
                        const error = new Error(INVALID_TILT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                }
            }
        }

        return response;
    }

    static getObjectType() {
        return 'RectangleObstruction';
    }
}
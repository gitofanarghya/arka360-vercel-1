/* eslint-disable prefer-destructuring */
import * as THREE from 'three';
import { Vector3 } from 'three';
import { getChildrenSequence } from './../smartroofUtils';
import {
    COMPLEX_GEOMETRY_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    INSUFFICIENT_VERTICES,
    INVALID_CORE_HEIGHT_ERROR,
    INVALID_TILT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    OUT_OF_BASE_MODEL_ERROR,
    OUT_OF_GROUND_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    VERTEX_OVER_EDGE_ERROR,
} from '../../../../coreConstants';
import * as utils from '../../../../utils/utils';
import Subarray from '../../../subArray/Subarray';
import OutlinePoints from '../../../subObjects/OutlinePoints';
import PolygonMeasurement from '../../../subObjects/PolygonMeasurement';
import OuterEdge from '../OuterEdge';
import SmartroofFace from '../SmartroofFace';
import * as raycastingUtils from '../../../../utils/raycastingUtils';
import { MINIMUM_NUMBER_OF_POINTS } from '../../../subObjects/TextBox';
import Fold from '../Fold';
import { SmartroofModel } from '../SmartroofModel';

export default class TurretDormer extends SmartroofModel {
    constructor(stage) {
        super(stage);
        this.coreTilt = this.defaultTilt;
        this.turretCount = 2;
        this.isTemplate = true;
        this.snapHeight = true;
        this.isTurret = true;
        this.type = 'TurretDormer';
        this.symmetryAxisVector = new THREE.Vector3(0, 1, 0);
    }

    static getObjectType() {
        return 'TurretDormer';
    }

    getEdgeAngleWithSymmetryAxis(outerEdge) {
        const edgeVector = outerEdge.getEdgeVector();
        return utils.rad2Deg(this.symmetryAxisVector.angleTo(edgeVector));
    }

    changeNumberOfTurrets(turretCount) {
        this.turretCount = turretCount;
        this.updateTurretCount();
    }

    updateTurretCount() {
        const outerEdges = this.getOuterEdges();
        const outerEdgeCount = outerEdges.length;
        const turretCount = this.turretCount;
        const turretCountDifference = turretCount - outerEdgeCount;
        if (turretCountDifference > 0) {
            for (let i = 0; i < turretCountDifference; i++) {
                this.addTurret();
            }
        }
        else if (turretCountDifference < 0) {
            for (let i = 0; i < Math.abs(turretCountDifference); i++) {
                this.removeTurret();
            }
        }
    }

    getTurretCount() {
        if (!this.outlinePoints) {
            return -1;
        }
        const turretStartIndex = 1;
        const turretEndIndex = this.outlinePoints.length - 3;
        const turretCount = turretEndIndex - turretStartIndex;
        return turretCount;
    }

    updateWhilePlacing() {
        const placingInformation = this.getPlacingInformation();
        if (placingInformation.parent instanceof SmartroofFace && (placingInformation.parent.azimuth !== this.azimuth)) {
            const rotationPoint = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
            const angleToRotate = this.azimuth - placingInformation.parent.azimuth;
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

            // Update apex similarly
            const apexX = this.apex.getPosition().x;
            const apexY = this.apex.getPosition().y;
            const apexDeltaXY = utils.rotationAroundPoint(
                rotationPoint.x,
                rotationPoint.y,
                apexX,
                apexY,
                angleInRad,
            );
            this.apex.moveObjectWithoutConsequences(
                apexDeltaXY[0] - apexX,
                apexDeltaXY[1] - apexY,
            );
            this.apex.setPosition(this.apex.getPosition().x, this.apex.getPosition().y, this.getApexHeight());

            this.azimuth = placingInformation.parent.azimuth;
            const children = this.getChildren();
            for (let i = 0, l = children.length; i < l; i += 1) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                }
                children[i].updateSetback();
                children[i].updateGeometry();
                children[i].rotateObjectHelper(angleInRad, rotationPoint);
            }
        }
        if (this.parent instanceof SmartroofFace) {
            this.snapTemplateToParent();
        }
        else {
            this.updateSmartRoof();
        }
        this.getAllSmartroofIntersections();
    }

    initDormerPlacingMode() {
        this.stage.stateManager.startContainer();

        const vertices2DArray = this.get2DVertices();
        const offsetPoint = vertices2DArray[vertices2DArray.length - 1];
        const offsetVector = new THREE.Vector2(offsetPoint[0], offsetPoint[1], 0);
        offsetVector.subVectors(this.getPosition(), offsetVector);
        this.stage.placeManager.initialize(
            this,
            this.placeObject.bind(this),
            this.onCancelDormerPlacing.bind(this),
            offsetVector.x,
            offsetVector.y, { moveWithOffset: true },
        );

        this.stage.selectionControls.setSelectedObject(this);
    }

    getPosition() {
        const position = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        if (this.snapHeight && this.parent instanceof SmartroofFace) {
            const pointToSnap = this.get3DVertices()[0];
            const line3 = new THREE.Line3(new Vector3(pointToSnap[0], pointToSnap[1], 1000), new Vector3(pointToSnap[0], pointToSnap[1], -1000));
            const parentPlane = this.getParent().plane;
            if (parentPlane) {
                const intersectionPoint = new Vector3();
                position.z = parentPlane.intersectLine(line3, intersectionPoint).z;
            }
        }
        return position;
    }

    getPlacingInformation(vertices) {
        const response = {};
        let numberOfPoints;

        // Getting vertices
        let vertices2DArray;

        if (vertices === null || vertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        }
        else {
            vertices2DArray = vertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        if (!raycastingUtils.areVerticesOnGround(vertices2DVectorArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DVectorArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (this.isInvalidRoof()) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }


        let erodedVertices;
        if (polygonExists) {
            // To accommodate for snapping
            erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            {
                const idsToIgnore = [this.uuid];
                this.getChildrenModelUuids(idsToIgnore);
                let offset = 0.001;
                const totalVertices = vertices2DArray.length;
                erodedVertices =
                    [
                        [vertices2DArray[totalVertices - 1][0] - offset, vertices2DArray[totalVertices - 1][1] - offset],
                        [vertices2DArray[totalVertices - 1][0] + offset, vertices2DArray[totalVertices - 1][1] + offset],
                    ];
                const allBelowModels = raycastingUtils.getAllModelsBelowVertices(
                    erodedVertices,
                    this.stage, { includeObstacles: true },
                );
                let [newParent, newHeight] = [-1, -1];
                for (let i = 0; i < allBelowModels.length; i += 1) {
                    const model = allBelowModels[i][0];
                    const height = allBelowModels[i][1];
                    if (!idsToIgnore.includes(model.uuid)) {
                        if (newHeight < height) {
                            [newParent, newHeight] = [model, height];
                        }
                    }
                }
                const lastVertexIndex = totalVertices - 2;
                const midPoint = new THREE.Vector2(
                    (this.get2DVertices()[0][0] + this.get2DVertices()[lastVertexIndex][0]) / 2,
                    (this.get2DVertices()[0][1] + this.get2DVertices()[lastVertexIndex][1]) / 2,
                );
                const centerPoint = new THREE.Vector2(this.get2DVertices()[totalVertices - 1][0], this.get2DVertices()[totalVertices - 1][1]);
                const ratio = 0.95;
                const checkPoint = new THREE.Vector2(
                    (ratio * centerPoint.x) + ((1 - ratio) * midPoint.x),
                    (ratio * centerPoint.y) + ((1 - ratio) * midPoint.y),
                );

                offset = 0.0001;
                const erodedVerticesMidpoint = [
                    [checkPoint.x - offset, checkPoint.y - offset],
                    [checkPoint.x + offset, checkPoint.y + offset],
                ];

                const allBelowMidPoint = raycastingUtils.getAllModelsBelowVertices(
                    erodedVerticesMidpoint,
                    this.stage, { includeObstacles: true },
                );
                let [newParentMidPoint, newHeightMidPoint] = [-1, -1];
                for (let i = 0; i < allBelowMidPoint.length; i += 1) {
                    const model = allBelowMidPoint[i][0];
                    const height = allBelowMidPoint[i][1];
                    if (!idsToIgnore.includes(model.uuid)) {
                        if (newHeightMidPoint < height) {
                            [newParentMidPoint, newHeightMidPoint] = [model, height];
                        }
                    }
                }
                if (newParentMidPoint.uuid === newParent.uuid || !(newParent instanceof SmartroofFace && newParentMidPoint instanceof SmartroofFace)) {
                    this.parentTemp = newParent;
                }
                response.parent = this.parentTemp;
                response.height = newHeight;
                if (!(this.parentTemp instanceof SmartroofFace)) {
                    response.errors.push(new Error(OUT_OF_BASE_MODEL_ERROR));
                }
            }
        }
        return response;
    }

    async placeObject(deltaX = 0, deltaY = 0, flag = false) {
        // move object
        this.moveObject(deltaX, deltaY, -this.baseHeight);
        const placingInformation = this.getPlacingInformation();
        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            else if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setPolygonModelOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.modelVertexEquivalentError();
            }
            else if (error.message === INVALID_CORE_HEIGHT_ERROR) {
                this.stage.eventManager.invalidCoreHeightErrorForPolygon();
            }
            else if (error.message === INVALID_TILT_ERROR) {
                this.stage.eventManager.invalidTiltErrorForPolygon();
            }
            else if (error.message === INSUFFICIENT_VERTICES) {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.removeObject();
            return Promise.reject(error);
        }

        if (this.parent !== placingInformation.parent) {
            this.changeParent(placingInformation.parent);
        }
        this.snapTemplateToParent();
        this.setApexRestrictions();
        const oldHeight = this.getZOnTopSurface(...this.get2DVertices()[0]);


        this.deleteInactiveFolds();
        this.updateSmartRoof();
        this.getAllSmartroofIntersections();

        const deltaZ = this.getZOnTopSurface(...this.get2DVertices()[0]) - oldHeight;
        for (let i = 0, len = this.children.length; i < len; i += 1) {
            if (!this.getChildren()[i].isValid) {
                continue;
            }
            if(flag) this.getChildren()[i].updatedEditedFace();
            else this.getChildren()[i].resetEditedVertices();
            this.getChildren()[i].updateSetback();
            this.getChildren()[i].updateGeometry();
            this.getChildren()[i].moveChildren(0, 0, deltaZ);
            this.getChildren()[i].placeChildrenSmartRoofs();
        }
        if (!this.rotationPoints) {
            this.createRotation();
        }

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0; i < keys.length; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        // Update locked parameter
        // this.updateCurrentlyLockedParameter(placingInformation.tiltAndHeights);

        // TODO: Jugaad, fix for moveObject of safety line and handrail
        // utils.updateHandrailAndSafetyLineForMove(this);
        // update siblings
        try {
            await this.handleSiblingConsequences();
            this.resetGrandParentSolarAccess();
            this.stage.smartRoofSetbackEditMode.updateModelArea();
        }
        catch (error) {
            console.error('ERROR: PolygonModel: placeObject failed', error);
            return Promise.reject(error);
        }

        if (!this.isSelected) {
            this.deSelect();
        }
        this.updateApex();
        this.saveState();
        this.stage.stateManager.stopContainer();
        return Promise.resolve(true);
    }

    snapTemplateToParent() {
        const pointToSnap = this.get3DVertices()[0];
        const line3 = new THREE.Line3(new Vector3(pointToSnap[0], pointToSnap[1], 1000), new Vector3(pointToSnap[0], pointToSnap[1], -1000));
        const parentPlane = this.getParent().plane;
        if (parentPlane) {
            const intersectionPoint = new Vector3();
            parentPlane.intersectLine(line3, intersectionPoint);
            this.changeCoreHeight(intersectionPoint.z);
        }
    }

    calculateTilt() {
        const topLeftVertexIndex = 0;
        const topRightVertexIndex = this.outlinePoints.length - 2;
        const pitchPoint = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const point1 = this.outlinePoints[topLeftVertexIndex].getPosition();
        const point2 = this.outlinePoints[topRightVertexIndex].getPosition();
        const apex = pitchPoint;
        const midPoint = new Vector3().addVectors(point1, point2).divideScalar(2);
        const noseLength = apex.distanceTo(midPoint);
        let parentTilt = this.getParent().tilt;
        if (parentTilt < 1) parentTilt = 1;
        const halfWidth = point1.distanceTo(midPoint);
        let tilt = utils.rad2Deg(Math.atan((noseLength * Math.tan(utils.deg2Rad(parentTilt))) / halfWidth));
        const maxTilt = 60;
        if (tilt < 1) {
            tilt = 1;
        }
        else if (tilt > maxTilt) {
            tilt = maxTilt;
        }
        return tilt;
    }

    snapTemplateToParentWithoutUpdate() {
        const pointToSnap = this.get3DVertices()[0];
        const line3 = new THREE.Line3(new Vector3(pointToSnap[0], pointToSnap[1], 1000), new Vector3(pointToSnap[0], pointToSnap[1], -1000));
        const parentPlane = this.getParent().plane;
        if (parentPlane) {
            const intersectionPoint = new Vector3();
            parentPlane.intersectLine(line3, intersectionPoint);
            this.coreHeight = intersectionPoint.z;
        }
    }

    getCoreTilt() {
        return this.coreTilt;
    }

    setCoreTilt(coreTilt) {
        this.coreTilt = coreTilt;
        this.updateCoreTilt();
    }

    updateCoreTilt() {
        const coreTilt = this.coreTilt;
        const outerEdges = this.getOuterEdges();
        const outerEdgeCount = outerEdges.length;
        for (let i = 0; i < outerEdgeCount; i++) {
            const outerEdge = outerEdges[i];
            outerEdge.setEdgeTilt(coreTilt);
        }
    }

    setSymmetryAxisVector(symmetryAxisVector) {
        this.symmetryAxisVector = symmetryAxisVector;
        this.updateSymmetryAxisVector();
    }

    updateSymmetryAxisVector() {
        const symmetryAxisVector = this.symmetryAxisVector;
        const outerEdges = this.getOuterEdges();

        const outerEdgeCount = outerEdges.length;
        for (let i = 0; i < outerEdgeCount; i++) {
            const outerEdge = outerEdges[i];
            const edgeVector = outerEdge.getEdgeVector();
            const edgeAngle = utils.rad2Deg(edgeVector.angleTo(symmetryAxisVector));
            outerEdge.setEdgeAngle(edgeAngle);
        }
    }

    updateApex() {
        this.apex.setPosition(this.apex.getPosition().x, this.apex.getPosition().y, this.getApexHeight());
    }

    getState() {
        const polygonData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            tilt: this.tilt,
            baseHeight: this.baseHeight,
            coreHeight: this.coreHeight,
            lockedParameter: this.lockedParameter,
            isTemplate: true,
            ignored: this.ignored,
            snapHeight: this.snapHeight,
            isTurret: true,
            allowRemoveTurretFace: this.getTurretCount() > 3,
            childSequence: getChildrenSequence(this),
            outlinePoints: this.saveOutlinePoints(),
            oldVertices: this.oldVertices,
            outerEdgeObjects: this.saveOuterEdgeObjects(),
            apex: [this.apex.getPosition().x, this.apex.getPosition().y, this.apex.getPosition().z],
            folds: this.saveFolds(),
            isMoved: this.isMoved,
            rotationPoints: this.rotationPoints,
            parent: this.getParent() ? this.getParent().uuid : null,
        };
        return polygonData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load polygon properties
            this.tilt = state.tilt;
            this.coreHeight = state.coreHeight;
            this.baseHeight = state.baseHeight;
            this.lockedParameter = state.lockedParameter;
            this.ignored = state.ignored;
            this.snapHeight = state.snapHeight;
            this.isMoved = state.isMoved;
            this.oldVertices = state.oldVertices;

            this.updateVisualsAfterLoadingAndCreation();


            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                if (this.apex) this.apex.removeObject();
                this.apex = new OutlinePoints(state.apex[0], state.apex[1], state.apex[2], this, this.stage);
                this.apex.raise = 10;
                this.apex.vertexMesh.geometry.attributes.position.needsUpdate = true;
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.outerEdgeObjects.forEach((outerEdgeObject) => {
                    outerEdgeObject.outlinePoint1 = this.outlinePoints[outerEdgeObject.outlinePoint1Index];
                    outerEdgeObject.outlinePoint2 = this.outlinePoints[outerEdgeObject.outlinePoint2Index];
                });
                this.loadFolds(state.folds);
                this.updateOldVertices();
                // create polygon measurement
                // this.polygonMeasurement = new PolygonMeasurement(
                //     this.oldVertices,
                //     this, this.stage,
                // );
            }
            else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
                this.apex.setPosition(state.apex[0], state.apex[1], state.apex[2]);
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.loadFolds(state.folds);
            }
            else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // Remove outline points
                for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                }

                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                if (this.apex) this.apex.removeObject();
                this.apex = new OutlinePoints(state.apex[0], state.apex[1], state.apex[2], this, this.stage);
                this.apex.raise = 10;
                this.apex.vertexMesh.geometry.attributes.position.needsUpdate = true;
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.outerEdgeObjects.forEach((outerEdgeObject) => {
                    outerEdgeObject.outlinePoint1 = this.outlinePoints[outerEdgeObject.outlinePoint1Index];
                    outerEdgeObject.outlinePoint2 = this.outlinePoints[outerEdgeObject.outlinePoint2Index];
                });
                this.loadFolds(state.folds);
            }
            else {
                console.error('PitchedRoofModel: loadState: Error in Loading Outline Points');
                return null;
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {
                // update polygon measurement
                // this.polygonMeasurement.show();
                // this.polygonMeasurement.update();
            }

            // update geometry
            this.setApexRestrictions();
            this.updateSmartRoof();
            this.getAllSmartroofIntersections();
            // if (this.polygonMeasurement) this.polygonMeasurement.remove();
            // this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);


            // this.rotationPoints.removeObject();
            this.coreMesh.geometry.computeBoundingSphere();


            // setting RotationPoint
            if (!this.rotationPoints) {
                this.createRotation();
            }
            else {
                this.rotationPoints.removeObject();
                this.createRotation();
            }
        }
        if (!this.isSelected && this.outerEdgeObjects) {
            //hide outer edge objects measurement
            this.outerEdgeObjects.forEach((outerEdgeObject) => {
                outerEdgeObject.measurementText.hideObject();
            });
        }        
        return this;
    }

    saveOuterEdgeObjects() {
        return this.outerEdgeObjects.map(outerEdgeObject => [
            outerEdgeObject.isPitched,
            outerEdgeObject.tilt,
            outerEdgeObject.height,
            outerEdgeObject.outlinePoint1Index,
            outerEdgeObject.outlinePoint2Index,
            outerEdgeObject.id,
            this.outerEdgeObjects.indexOf(outerEdgeObject),
        ]);
    }

    loadOuterEdgeObjects(outerEdgeObjects) {
        const clone = [...this.outerEdgeObjects];
        this.outerEdgeObjects = [];
        outerEdgeObjects.forEach((outerEdgeObject) => {
            let outerEdge = clone.find(o => o.id === outerEdgeObject[5]);
            if (outerEdge) {
                outerEdge.isPitched = outerEdgeObject[0];
                outerEdge.tilt = outerEdgeObject[1];
                outerEdge.height = outerEdgeObject[2];
                outerEdge.outlinePoint1Index = outerEdgeObject[3];
                outerEdge.outlinePoint2Index = outerEdgeObject[4];
            }
            else {
                const smartRoofFace = this.children.find(child => child.id === outerEdgeObject[5]);
                if (smartRoofFace) {
                    outerEdge = new OuterEdge(
                        this,
                        this.stage,
                        this.outlinePoints[outerEdgeObject[3]],
                        this.outlinePoints[outerEdgeObject[4]],
                        outerEdgeObject[3],
                        outerEdgeObject[4],
                        smartRoofFace.outerEdgeHeight,
                        !smartRoofFace.isDeleted,
                        smartRoofFace.tilt,
                        smartRoofFace,
                    );
                }
                else {
                    outerEdge = new OuterEdge(
                        this,
                        this.stage,
                        this.outlinePoints[outerEdgeObject[3]],
                        this.outlinePoints[outerEdgeObject[4]],
                        outerEdgeObject[3],
                        outerEdgeObject[4],
                        outerEdgeObject[2],
                        outerEdgeObject[0],
                        outerEdgeObject[1],
                    );
                }
            }
            this.outerEdgeObjects[outerEdgeObject[6]] = outerEdge;
        });
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        if (this.rotationPoints) this.rotationPoints.removeObject();


        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.apex.removeObject();
        this.apex = null;
        // disable innerEdge
        for (let i = this.innerEdgesObject.length - 1; i >= 0; i -= 1) {
            this.innerEdgesObject[i].removeObject();
            this.innerEdgesObject.splice(i, 1);
        }

        for (let i = this.folds.length - 1; i >= 0; i -= 1) {
            this.folds[i].removeObject();
            this.folds.splice(i, 1);
        }

        // remove measurements
        // this.polygonMeasurement.remove();
    }

    saveObject(isCopy = false) {
        // return;
        const polygonModelData = {
            type: TurretDormer.getObjectType(),
            children: [],
        };

        // save id and name
        polygonModelData.id = this.id;
        polygonModelData.name = this.name;
        if (isCopy) {
            polygonModelData.uuid = this.uuid;
        }

        // save polygon properties
        polygonModelData.baseHeight = this.baseHeight;
        polygonModelData.coreHeight = this.coreHeight;
        polygonModelData.tilt = this.tilt;
        polygonModelData.ignored = this.ignored;
        polygonModelData.snapHeight = this.snapHeight;
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.dormerType = this.type;

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            if (position !== undefined) {
                outlinePoints.push([
                    position.x,
                    position.y,
                    position.z,
                ]);
            }
        }
        polygonModelData.outlinePoints = outlinePoints;
        const apexPosition = this.apex.getPosition();
        polygonModelData.apex = [apexPosition.x, apexPosition.y, apexPosition.z];
        // saving outerEdgeObjects
        const outerEdgeObjects = [];
        if (this.outerEdgeObjects) {
            for (let i = 0; i < this.outerEdgeObjects.length; i += 1) {
                outerEdgeObjects.push(this.outerEdgeObjects[i].getSaveObjectArray());
            }
        }
        polygonModelData.outerEdgeObjects = outerEdgeObjects;

        const folds = [];
        if (this.folds) {
            for (let i = 0, len = this.folds.length; i < len; i += 1) {
                const position = this.folds[i].getPosition();
                if (position !== undefined) {
                    folds.push({
                        x: position.x,
                        y: position.y,
                        z: position.z,
                        foldType: this.folds[i].foldType,
                        faceId: this.folds[i].faceId,
                        tilt: this.folds[i].tilt,
                    });
                }
            }
            polygonModelData.folds = folds;
        }

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        return polygonModelData;
    }

    loadObject(polygonModelData, isPaste = false) {
        this.oldVertices = [];
        if (!TurretDormer.validateObject(polygonModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Polygon data invalid: Polygon removed');
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = polygonModelData.id;
            this.name = polygonModelData.name;
        }

        // load polygon properties
        this.baseHeight = polygonModelData.baseHeight;
        this.coreHeight = polygonModelData.coreHeight;
        this.tilt = polygonModelData.tilt;
        this.ignored = polygonModelData.ignored;
        this.topHeight = polygonModelData.topHeight;
        this.snapHeight = polygonModelData.snapHeight;
        this.type = polygonModelData.dormerType;
        this.azimuth = polygonModelData.azimuth;

        // set outline points
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                polygonModelData.outlinePoints[i][0],
                polygonModelData.outlinePoints[i][1],
                polygonModelData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }
        this.apex = new OutlinePoints(
            polygonModelData.apex[0],
            polygonModelData.apex[1],
            polygonModelData.apex[2],
            this,
            this.stage,
        );
        this.apex.raise = 10;
        this.apex.vertexMesh.geometry.attributes.position.needsUpdate = true;
        this.updateOldVertices();
        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage);
        this.coreMesh.geometry.computeBoundingSphere();

        // load children
        const { children } = polygonModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === SmartroofFace.getObjectType()) {
                const smartroofFace = new SmartroofFace(this.stage);
                this.addChild(smartroofFace);
                smartroofFace.loadObject(children[i], isPaste);
                if (smartroofFace.getParent() !== this) {
                    console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                }
            }
            else {
                console.error('PolygonModel: Invalid object type in loadObject');
            }
        }

        // load outerEdgeObjects
        const { outerEdgeObjects } = polygonModelData;
        this.outerEdgeObjects = [];

        if (!outerEdgeObjects) {
            // Create outerEdge objects and their associated faces
            this.outerEdgeObjects = [];
            this.outerEdgesMesh = [];
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const smartRoofFace = this.children.find(child => child.edge[0] === i);
                const outerEdge = new OuterEdge(
                    this,
                    this.stage,
                    this.outlinePoints[i],
                    this.outlinePoints[(i + 1) % l],
                    i,
                    (i + 1) % l,
                    smartRoofFace.outerEdgeHeight,
                    !smartRoofFace.isDeleted,
                    smartRoofFace.tilt,
                    smartRoofFace,
                );
                this.outerEdgeObjects.push(outerEdge);
            }
        }
        else if (isPaste && outerEdgeObjects) {
            for (let i = 0, len = outerEdgeObjects.length; i < len; i += 1) {
                const outerEdgeLoadObject = outerEdgeObjects[i];
                const outerEdgeObject = new OuterEdge(
                    this,
                    this.stage,
                    this.outlinePoints[outerEdgeLoadObject.outlinePoint1Index],
                    this.outlinePoints[outerEdgeLoadObject.outlinePoint2Index],
                    outerEdgeLoadObject.outlinePoint1Index,
                    outerEdgeLoadObject.outlinePoint2Index,
                    outerEdgeLoadObject.height,
                    outerEdgeLoadObject.isPitched,
                    outerEdgeLoadObject.tilt,
                    this.children.find(child => child.outerEdgeId === outerEdgeLoadObject.id),
                );
                this.outerEdgeObjects.push(outerEdgeObject);
            }
        }
        else {
            for (let i = 0, len = outerEdgeObjects.length; i < len; i += 1) {
                const outerEdgeLoadObject = outerEdgeObjects[i];
                const outerEdgeObject = new OuterEdge(
                    this,
                    this.stage,
                    this.outlinePoints[outerEdgeLoadObject.outlinePoint1Index],
                    this.outlinePoints[outerEdgeLoadObject.outlinePoint2Index],
                    outerEdgeLoadObject.outlinePoint1Index,
                    outerEdgeLoadObject.outlinePoint2Index,
                    outerEdgeLoadObject.height,
                    outerEdgeLoadObject.isPitched,
                    utils.isNumber(parseFloat(outerEdgeLoadObject.tilt)) ? parseFloat(outerEdgeLoadObject.tilt) : 20,
                    this.children.find(child => child.id === outerEdgeLoadObject.id),
                );
                this.outerEdgeObjects.push(outerEdgeObject);
            }
        }

        const { folds } = polygonModelData;
        this.folds = [];
        if (isPaste) {
            for (let i = 0, len = folds.length; i < len; i += 1) {
                const foldLoadObject = folds[i];
                const fold = new Fold(
                    foldLoadObject.x,
                    foldLoadObject.y,
                    foldLoadObject.z,
                    this,
                    this.stage,
                    foldLoadObject.foldType,
                    this.children.find(child => child.foldId === foldLoadObject.faceId),
                );
                fold.tilt = foldLoadObject.tilt;
                this.folds.push(fold);
            }
        }
        else {
            for (let i = 0, len = folds.length; i < len; i += 1) {
                const foldLoadObject = folds[i];
                const fold = new Fold(
                    foldLoadObject.x,
                    foldLoadObject.y,
                    foldLoadObject.z,
                    this,
                    this.stage,
                    foldLoadObject.foldType,
                    this.children.find(child => child.id === foldLoadObject.faceId),
                );
                fold.tilt = foldLoadObject.tilt;
                this.folds.push(fold);
            }
        }
        this.updateSmartRoof();
        // this.updatePolygonMeasurement();


        if (this.isInvalidRoof()) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }
            this.removeObject();


            this.stage.eventManager
                .customErrorMessage('Polygon data invalid: Polygon removed');
            return;
        }
        if (!this.rotationPoints) {
            this.createRotation();
        }
        else {
            this.rotationPoints.removeObject();
            this.createRotation();
        }
        this.updateApex();
        if (!this.isSelected) {
            this.hideSelectables();
        }
        else {
            this.showSelectables();
        }
        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    static getInitValues(type) {
        const vertices = [];
        const deletedEdges = [];
        const coupledEdges = [];
        switch (type) {
        case 'Extended':
            vertices.push(...[
                new THREE.Vector3(0, 5, 5),
                new THREE.Vector3(0, 0, 5),
                new THREE.Vector3(2.5 * Math.cos(Math.PI / 3), -2.5 * Math.sin(Math.PI / 3), 5),
                new THREE.Vector3(5 - (2.5 * Math.cos(Math.PI / 3)), -2.5 * Math.sin(Math.PI / 3), 5),
                new THREE.Vector3(5, 0, 5),
                new THREE.Vector3(5, 5, 5),
                new THREE.Vector3(2.5, 7.5, 5),
            ]);
            deletedEdges.push(...[5, 6]);
            break;
        default:
        {
            console.error('No valid template passed');
        }
        }
        return { vertices, deletedEdges, coupledEdges };
    }

    setApexRestrictions() {
        const symmetryPoint1 = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const symmetryPoint2 = this.outlinePoints[this.outlinePoints.length - 2].getPosition().add(this.outlinePoints[0].getPosition()).multiplyScalar(0.5);
        const symmetryVector = new THREE.Vector3().subVectors(symmetryPoint2, symmetryPoint1).normalize();
        if (this.outlinePoints.length % 2 === 0) {
            const middleIndex = Math.floor(this.outlinePoints.length / 2) - 1;
            this.outlinePoints[middleIndex].setMovementRestrictionVector(symmetryVector);
        }
        this.apex.setMovementRestrictionVector(symmetryVector);
        this.outlinePoints[0].setMovementRestrictionVector(symmetryVector);
        this.outlinePoints[this.outlinePoints.length - 2].setMovementRestrictionVector(symmetryVector);
    }

    onSelect() {
        this.coreMesh.material.opacity = 0.4;
        this.setApexRestrictions();
        this.is3d = this.stage.visualManager.in3D;

        // show outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].hideObject();
        }
        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].showObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].showObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].showObject();
        }

        this.apex.showObject();

        // show measurements
        // jugaad to fix no snapping after complex roof deletion
        // if (this.polygonMeasurement.arcElements.length !== 0 || this.polygonMeasurement.lengthElements.length !== 0) {
        //     this.updatePolygonMeasurement();
        //     this.polygonMeasurement.show();
        // }

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length - 1; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            for (let i = 0, len = this.folds.length; i < len; i += 1) {
                const v = this.folds[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            this.stage.dragControls.add(
                this.apex,
                this.apex.moveObject.bind(this.apex),
                this.apex.placeObject.bind(this.apex),
                this.apex.handleDragStart.bind(this.apex),
            );
        }
        this.isSelected = true;
    }

    deSelect() {
        this.coreMesh.material.opacity = 0.25;
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].hideObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].hideObject();
        }
        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].hideObject();
        }

        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].hideObject();
        }

        this.apex.hideObject();

        this.isSelected = false;
    }

    hideSelectables() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].hideObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].hideObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].hideObject();
        }
        this.apex.hideObject();
    }

    async makeDormer(type = 'Extended') {
        const { vertices, deletedEdges } = TurretDormer.getInitValues(type);

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            for (let i = vertices.length - 1; i >= 0; i -= 1) {
                this.outlinePoints.push(new OutlinePoints(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                    this,
                    this.stage,
                ));
            }
        }
        else {
            for (let i = 0, l = vertices.length; i < l; i += 1) {
                this.outlinePoints.push(new OutlinePoints(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                    this,
                    this.stage,
                ));
            }
        }
        this.oldVertices = vertices;
        // Create outerEdge objects and their associated faces
        this.outerEdgeObjects = [];
        this.outerEdgesMesh = [];
        this.snapHeight = true;


        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(
                this,
                this.stage,
                this.outlinePoints[i],
                this.outlinePoints[(i + 1) % l],
                i,
                (i + 1) % l,
                this.coreHeight,
                true,
                this.tilt,
            );
            this.outerEdgeObjects.push(outerEdge);
            const face = outerEdge.smartRoofFace;
            if (deletedEdges.indexOf(i) !== -1) {
                outerEdge.isPitched = false;
                face.tilt = 90;
                outerEdge.tilt = 90;
                face.plane = face.outerPlane;
                face.isDeleted = true;
                face.isValid = false;
            }
            else {
                if (i === 2) {
                    face.tilt = 17.8;
                    outerEdge.tilt = 17.8;
                }
                this.addChild(face);
            }
        }

        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);
        // geometry.computeBoundingSphere();
        const apexHeight = this.getApexHeight();
        this.apex = new OutlinePoints(
            2.5,
            0.66,
            apexHeight,
            this,
            this.stage,
        );
        this.apex.raise = 10;
        this.apex.vertexMesh.geometry.attributes.position.needsUpdate = true;
        this.setApexRestrictions();


        try {
            this.updateSmartRoof();
            this.stage.ground.addChild(this);
            this.getAllSmartroofIntersections();
            return Promise.resolve(true);
        }
        catch (error) {
            if (error === 'Insufficient number of vertices') {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.onCancel();
            return Promise.reject(error);
        }
    }

    updateSmartRoof() {
        this.updateTilts();
        this.updateOuterEdges();
        this.runPolygonShrink();
        this.updateGeometry();
    }

    getSymmetryAxisVector() {
        return this.apex.getPosition().clone().sub(this.outlinePoints[this.outlinePoints.length - 1].getPosition());
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.skeletonGroup.clear();
        this.baseHeight += deltaZ;
        if (deltaX !== 0 || deltaY !== 0) {
            this.isMoved = true;
        }
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.children.forEach((edge) => {
            edge.geometry.translate(deltaX, deltaY, deltaZ);
        });


        if (this.rotationPoints) {
            this.rotationPoints.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            this.outerEdgeObjects[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
            this.oldVertices[i].add(new THREE.Vector3(deltaX, deltaY, deltaZ));
        }
        // disable innerEdge
        for (let i = 0, l = this.innerEdgesObject.length; i < l; i += 1) {
            this.innerEdgesObject[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            // this.folds[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
            this.folds[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }


        // update measurement
        // TODO this will not work in multy select
        // if (this.stage.selectionControls.getSelectedObject() === this) {
        //     this.updatePolygonMeasurement();
        // }
        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }

        this.apex.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        this.apex.setPosition(this.apex.getPosition().x, this.apex.getPosition().y, this.getApexHeight());

        this.saveState();
    }

    getMirrorVertex(vertex) {
        const index = this.outlinePoints.indexOf(vertex);
        if (index === -1) {
            return null;
        }
        const mirrorIndex = TurretDormer.getMirrorIndex(this.outlinePoints.length, index);
        if (mirrorIndex === index) return null;
        return this.outlinePoints[mirrorIndex];
    }

    static getMirrorIndex(totalCount, index) {
        return totalCount - index - 2;
    }

    getWidth() {
        return this.outlinePoints[0].getPosition().distanceTo(this.outlinePoints[this.outlinePoints.length - 2].getPosition());
    }

    getApexHeight() {
        const firstFaceTilt = this.outerEdgeObjects[0].tilt;
        const apexHeight = (Math.tan(utils.deg2Rad(firstFaceTilt)) * (this.getWidth() / 2)) + this.coreHeight;
        return apexHeight;
    }

    async rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
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

        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            const outlinePointX = this.folds[i].getPosition().x;
            const outlinePointY = this.folds[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.folds[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        const { x: apexX, y: apexY } = this.apex.getPosition();
        const apexDeltaXY = utils.rotationAroundPoint(
            centroidPoint.x,
            centroidPoint.y,
            apexX,
            apexY,
            angleInRad,
        );
        this.apex.moveObjectWithoutConsequences(
            apexDeltaXY[0] - apexX,
            apexDeltaXY[1] - apexY,
        )
        const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;

        // update faces here
        this.updateFacesWithNewAngles(false);
        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }


    handleVertexMove(vertex, deltaX, deltaY) {
        // get the mirror delta values using the symmetry axis
        const mirrorDelta = this.getMirrorDelta(deltaX, deltaY, 0);
        const parallel = this.getParallelDelta(deltaX, deltaY, 0);
        const totalVertices = this.outlinePoints.length;
        const idOdd = totalVertices % 2 === 0;
        const pitchPoint = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const pitchPoint2d = new Vector3(pitchPoint.x, pitchPoint.y, 0);
        const mirrorVertex = this.getMirrorVertex(vertex);
        const index = this.outlinePoints.indexOf(vertex);
        let middleIndex = -1;
        if (idOdd) {
            middleIndex = Math.floor(totalVertices / 2) - 1;
        }
        else {
            middleIndex = Math.floor(totalVertices / 2);
        }
        if (mirrorVertex) {
            mirrorVertex.moveObjectWithoutConsequences(mirrorDelta.x, mirrorDelta.y, 0);
            if (index === 1) {
                const extendedEdgeVector = pitchPoint2d.clone().sub(this.outlinePoints[0].getPosition());
                const newPosition = utils.getIntersectionPoint(vertex.getPosition(), this.getPerpendicularVector(), pitchPoint2d, extendedEdgeVector);
                const deltaVector = newPosition.clone().sub(this.outlinePoints[0].getPosition());
                const mirrorDeltav = this.getMirrorDelta(deltaVector.x, deltaVector.y, 0);
                this.outlinePoints[0].setPosition(newPosition.x, newPosition.y, this.outlinePoints[0].getPosition().z);
                this.outlinePoints[totalVertices - 2].moveObjectWithoutConsequences(mirrorDeltav.x, mirrorDeltav.y, 0);
                if (idOdd) {
                    for (let i = 2; i < middleIndex; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, 0);
                    }
                    for (let i = middleIndex + 1; i < totalVertices - 3; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(mirrorDelta.x, mirrorDelta.y, 0);
                    }
                    this.outlinePoints[middleIndex].moveObjectWithoutConsequences(parallel.x, parallel.y, 0);
                }
                else {
                    for (let i = 2; i < middleIndex; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, 0);
                    }
                    for (let i = middleIndex; i < totalVertices - 3; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(mirrorDelta.x, mirrorDelta.y, 0);
                    }
                }
                this.apex.moveObjectWithoutConsequences(parallel.x, parallel.y, 0);
                this.apex.setPosition(this.apex.getPosition().x, this.apex.getPosition().y, this.getApexHeight());
            }
            else if (index === totalVertices - 3) {
                const extendedEdgeVector = pitchPoint2d.clone().sub(this.outlinePoints[totalVertices - 2].getPosition());
                const newPosition = utils.getIntersectionPoint(vertex.getPosition(), this.getPerpendicularVector(), pitchPoint2d, extendedEdgeVector);
                const deltaVector = newPosition.clone().sub(this.outlinePoints[totalVertices - 2].getPosition());
                const mirrorDeltav = this.getMirrorDelta(deltaVector.x, deltaVector.y, 0);
                this.outlinePoints[totalVertices - 2].setPosition(newPosition.x, newPosition.y, this.outlinePoints[totalVertices - 2].getPosition().z);
                this.outlinePoints[0].moveObjectWithoutConsequences(mirrorDeltav.x, mirrorDeltav.y, 0);
                if (idOdd) {
                    for (let i = 2; i < middleIndex; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(mirrorDelta.x, mirrorDelta.y, 0);
                    }
                    for (let i = middleIndex + 1; i < totalVertices - 3; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, 0);
                    }
                    this.outlinePoints[middleIndex].moveObjectWithoutConsequences(parallel.x, parallel.y, 0);
                }
                else {
                    for (let i = 2; i < middleIndex; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(mirrorDelta.x, mirrorDelta.y, 0);
                    }
                    for (let i = middleIndex; i < totalVertices - 3; i += 1) {
                        this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, 0);
                    }
                }
                this.apex.moveObjectWithoutConsequences(parallel.x, parallel.y, 0);
                this.apex.setPosition(this.apex.getPosition().x, this.apex.getPosition().y, this.getApexHeight());
            }
        }
        const firstEdge = this.outerEdgeObjects[0];
        const lastEdge = this.outerEdgeObjects[this.outerEdgeObjects.length - 3];
        const newTilt = this.calculateTilt();
        firstEdge.smartRoofFace.tilt = newTilt;
        firstEdge.tilt = newTilt;
        lastEdge.smartRoofFace.tilt = newTilt;
        lastEdge.tilt = newTilt;
        this.tilt = newTilt;

        this.updateOldVertices();
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
        try {
            this.updateSmartRoof();
            this.getAllSmartroofIntersections(true);
        }
        catch (error) {
            console.error('Error moving vertex', error);
        }
        this.saveState();
    }

    async updateFacesWithNewAngles(place = true) {
        const children = this.getChildren();
        const roofObstacles = [];

        if (place) {
            for (let i = 0; i < children.length; i++) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                    const child = grandChildren[j];
                    if (!(child instanceof SmartroofModel)) {
                        children[i].removeChild(child);
                    }
                    roofObstacles.push(child);
                }
            }
        }
        for (let i = 0; i < children.length; i++) {
            if (!utils.isNumber(this.tilt)) {
                this.tilt = this.outerEdgeObjects[0].tilt;
            }
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].fold) {
                children[i].fold.tilt = children[i].tilt;
                continue;
            }
        }


        if (place) {
            try {
                await this.placeObject();
            }
            catch (e) {
                console.log(new Error(), e);
            }
        }
        else {
            try {
                this.updateSmartRoof();
            }
            catch (e) {
                console.error('Failed to update faces with new angles', e);
            }

            this.getAllSmartroofIntersections(true);
        }
    }

    handlePropertiesUpdate(options) {
        if (options.tiltChanged) {
            const children = this.getChildren();
            const roofObstacles = [];
            for (let i = 0; i < children.length; i++) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0; j < grandChildren.length; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                    const child = grandChildren[j];
                    if (!(child instanceof SmartroofModel)) {
                        children[i].removeChild(child);
                    }
                    roofObstacles.push(child);
                }
            }

            if (utils.isNumber(this.tilt)) {
                this.outerEdgeObjects[0].tilt = this.tilt;
                this.outerEdgeObjects[0].smartRoofFace.tilt = this.tilt;
                this.outerEdgeObjects[0].updateOuterEdge();
                this.outerEdgeObjects[this.outerEdgeObjects.length - 3].tilt = this.tilt;
                this.outerEdgeObjects[this.outerEdgeObjects.length - 3].smartRoofFace.tilt = this.tilt;
                this.outerEdgeObjects[this.outerEdgeObjects.length - 3].updateOuterEdge();
            }
            try {
                this.snapTemplateToParent();
                this.updateSmartRoof();
            }
            catch (error) {
                console.error(error);
            }

            this.children.forEach((face) => {
                face.updateSetback();
                face.updateGeometry();
            });

            for (let i = 0; i < roofObstacles.length; i++) {
                roofObstacles[i].placeObject();
            }
            this.getAllSmartroofIntersections();
        }
        if (options.heightChanged) {
            const deltaZ = this.coreHeight - options.prevHeight;
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, deltaZ);
            }
            for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
                this.outerEdgeObjects[i].moveObjectWithoutConsequences(0, 0, deltaZ);
            }

            const children = this.getChildren();
            for (let i = 0, len = children.length; i < len; i += 1) {
                children[i].moveObject(0, 0, deltaZ);
            }
            try {
                this.updateSmartRoof();
            }
            catch (error) {
                console.error(error);
            }

            this.resetGrandParentSolarAccess();
            this.stage.lightsManager.setShadowMapParameters();
            this.placeObject(0,0,true);
        }
    }

    updateTilts() {
        // update tilts of turret faces so that the faces meet at the apex
        // Compute the tilts of one half and set the other half to the same tilts
        const turretFacesCount = this.outerEdgeObjects.length - 2;
        const firstTurretFaceIndex = 1;
        const isOdd = turretFacesCount % 2 === 1;
        let lastIndex = -1;
        let middleTurretFaceIndex = -1;
        if (isOdd) {
            middleTurretFaceIndex = Math.floor(turretFacesCount / 2);
            lastIndex = middleTurretFaceIndex - 1;
        }
        else {
            lastIndex = turretFacesCount / 2;
        }
        const apexPoint = this.apex.getPosition();
        const apexHeight = this.getApexHeight();
        apexPoint.z = apexHeight;
        for (let i = firstTurretFaceIndex; i <= lastIndex; i += 1) {
            const turretEdge = this.outerEdgeObjects[i];
            const mirrorTurretEdge = this.outerEdgeObjects[turretFacesCount - i - 1];
            const turretFace = turretEdge.smartRoofFace;
            const mirrorTurretFace = mirrorTurretEdge.smartRoofFace;
            const point1dirty = turretEdge.outlinePoint1.getPosition();
            const point1 = new Vector3(point1dirty.x, point1dirty.y, this.coreHeight);
            const point2dirty = turretEdge.outlinePoint2.getPosition();
            const point2 = new Vector3(point2dirty.x, point2dirty.y, this.coreHeight);
            const facePlane = new THREE.Plane().setFromCoplanarPoints(point1, point2, apexPoint);
            const faceNormal = facePlane.normal;
            // get angle of plane with the xy plane
            const angle = faceNormal.angleTo(new THREE.Vector3(0, 0, 1));
            const angleDeg = utils.rad2Deg(angle);
            turretFace.tilt = angleDeg;
            mirrorTurretFace.tilt = angleDeg;
            turretEdge.tilt = angleDeg;
            mirrorTurretEdge.tilt = angleDeg;
        }

        if (middleTurretFaceIndex !== -1) {
            const turretEdge = this.outerEdgeObjects[middleTurretFaceIndex];
            const turretFace = turretEdge.smartRoofFace;
            const point1dirty = turretEdge.outlinePoint1.getPosition();
            const point1 = new Vector3(point1dirty.x, point1dirty.y, this.coreHeight);
            const point2dirty = turretEdge.outlinePoint2.getPosition();
            const point2 = new Vector3(point2dirty.x, point2dirty.y, this.coreHeight);
            const facePlane = new THREE.Plane().setFromCoplanarPoints(point1, point2, apexPoint);
            const faceNormal = facePlane.normal;
            // get angle of plane with the xy plane
            const angle = faceNormal.angleTo(new THREE.Vector3(0, 0, 1));
            const angleDeg = utils.rad2Deg(angle);
            turretFace.tilt = angleDeg;
            turretEdge.tilt = angleDeg;
        }
    }

    getMirrorDelta(deltaX, deltaY) {
        // get the mirror delta values using the symmetry line
        const symmetryPoint1 = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const symmetryPoint12D = new Vector3(symmetryPoint1.x, symmetryPoint1.y, 0);
        const symmetryPoint2 = this.apex.getPosition();
        const symmetryPoint22D = new Vector3(symmetryPoint2.x, symmetryPoint2.y, 0);
        const symmetryVector = new THREE.Vector3().subVectors(symmetryPoint22D, symmetryPoint12D).normalize();
        const perpendicularVector = new THREE.Vector3().crossVectors(symmetryVector, new THREE.Vector3(0, 0, 1)).normalize();
        const parallelComponent = new THREE.Vector3().copy(symmetryVector).multiplyScalar(symmetryVector.dot(new THREE.Vector3(deltaX, deltaY, 0)));
        const perpendicularComponent = new THREE.Vector3().copy(perpendicularVector).multiplyScalar(perpendicularVector.dot(new THREE.Vector3(deltaX, deltaY, 0)));
        const mirrorDelta = new THREE.Vector3().subVectors(parallelComponent, perpendicularComponent);
        return mirrorDelta;
    }

    getPerpendicularDelta(deltaX, deltaY) {
        const symmetryPoint1 = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const symmetryPoint12D = new Vector3(symmetryPoint1.x, symmetryPoint1.y, 0);
        const symmetryPoint2 = this.apex.getPosition();
        const symmetryPoint22D = new Vector3(symmetryPoint2.x, symmetryPoint2.y, 0);
        const symmetryVector = new THREE.Vector3().subVectors(symmetryPoint22D, symmetryPoint12D).normalize();
        const perpendicularVector = new THREE.Vector3().crossVectors(symmetryVector, new THREE.Vector3(0, 0, 1)).normalize();
        const perpendicularComponent = new THREE.Vector3().copy(perpendicularVector).multiplyScalar(perpendicularVector.dot(new THREE.Vector3(deltaX, deltaY, 0)));
        return perpendicularComponent;
    }

    getPerpendicularVector() {
        const symmetryPoint1 = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const symmetryPoint12D = new Vector3(symmetryPoint1.x, symmetryPoint1.y, 0);
        const symmetryPoint2 = this.apex.getPosition();
        const symmetryPoint22D = new Vector3(symmetryPoint2.x, symmetryPoint2.y, 0);
        const symmetryVector = new THREE.Vector3().subVectors(symmetryPoint22D, symmetryPoint12D).normalize();
        return symmetryVector;
    }


    getParallelDelta(deltaX, deltaY) {
        const symmetryPoint1 = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        const symmetryPoint12D = new Vector3(symmetryPoint1.x, symmetryPoint1.y, 0);
        const symmetryPoint2 = this.apex.getPosition();
        const symmetryPoint22D = new Vector3(symmetryPoint2.x, symmetryPoint2.y, 0);
        const symmetryVector = new THREE.Vector3().subVectors(symmetryPoint22D, symmetryPoint12D).normalize();
        const parallelComponent = new THREE.Vector3().copy(symmetryVector).multiplyScalar(symmetryVector.dot(new THREE.Vector3(deltaX, deltaY, 0)));
        return parallelComponent;
    }

    addTurretFace() {
        const totalVertices = this.outlinePoints.length;
        const turretStartIndex = 1;
        const turredEdgeStartIndex = 1;
        const turretEndIndex = totalVertices - 3;
        const turredEdgeEndIndex = totalVertices - 4;
        const startVertexPosition = this.outlinePoints[turretStartIndex].getPosition();
        const startVertex2d = new Vector3(startVertexPosition.x, startVertexPosition.y, 0);
        const endVertexPosition = this.outlinePoints[turretEndIndex].getPosition();
        const endVertex2d = new Vector3(endVertexPosition.x, endVertexPosition.y, 0);
        const midPoint = this.apex.getPosition();
        const midPoint2d = new Vector3(midPoint.x, midPoint.y, 0);
        midPoint.z = this.getApexHeight();
        const radius = midPoint.distanceTo(startVertexPosition);
        const turretCount = turretEndIndex - turretStartIndex + 1;
        // get the angle made at the apex by the start and end vertices
        const startVector = new THREE.Vector3().subVectors(startVertex2d, midPoint2d);
        const endVector = new THREE.Vector3().subVectors(endVertex2d, midPoint2d);
        const angle = startVector.angleTo(endVector);
        const turretAngle = angle / turretCount;
        const startRadialVector = new THREE.Vector3().subVectors(startVertexPosition, midPoint).normalize();
        let angleDelta = 0;
        for (let i = turredEdgeStartIndex; i <= turredEdgeEndIndex; i += 1) {
            angleDelta += turretAngle;
            const edge = this.outerEdgeObjects[i];
            const nextVertexVector = new THREE.Vector3().copy(startRadialVector).applyAxisAngle(new THREE.Vector3(0, 0, 1), angleDelta);
            const nextVertexPosition = new THREE.Vector3().copy(midPoint).add(nextVertexVector.multiplyScalar(radius));
            const nextVertex = edge.outlinePoint2;
            nextVertex.setPosition(nextVertexPosition.x, nextVertexPosition.y, nextVertexPosition.z);
        }
        const lastEdge = this.outerEdgeObjects[turredEdgeEndIndex];
        const lastVertex = lastEdge.outlinePoint2;
        const newVertex = new OutlinePoints(endVertexPosition.x, endVertexPosition.y, endVertexPosition.z, this, this.stage);
        const newOuterEdge = new OuterEdge(this, this.stage, lastVertex, newVertex, turretEndIndex, turretEndIndex + 1, this.coreHeight, true, this.tilt);
        const nextEdge = this.outerEdgeObjects[turredEdgeEndIndex];
        nextEdge.outlinePoint1 = newVertex;
        // insert the new vertex and edge into the arrays at the correct positions
        this.outlinePoints.splice(turretEndIndex + 1, 0, newVertex);
        this.outerEdgeObjects.splice(turredEdgeEndIndex + 1, 0, newOuterEdge);
        lastEdge.outlinePoint1 = this.outlinePoints[turredEdgeEndIndex];
        this.outerEdgeObjects[turredEdgeEndIndex + 2].outlinePoint1 = this.outlinePoints[turredEdgeEndIndex + 2];
        // update the indices of the edges after the new edge
        for (let i = turredEdgeEndIndex + 2; i < this.outerEdgeObjects.length; i += 1) {
            this.outerEdgeObjects[i].outlinePoint1Index += 1;
            this.outerEdgeObjects[i].outlinePoint2Index += 1;
        }
        this.outerEdgeObjects[this.outerEdgeObjects.length - 1].outlinePoint2Index = 0;
        this.addChild(newOuterEdge.smartRoofFace);
        // if (this.polygonMeasurement) this.polygonMeasurement.remove();
        // this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);
        this.updateOldVertices();
        this.updateSmartRoof();
        this.getAllSmartroofIntersections();
        this.saveState();
        this.onSelect();
    }

    removeTurretFace() {
        if (this.getTurretCount() < 4) return;
        const totalVertices = this.outlinePoints.length;
        const turretStartIndex = 1;
        const turredEdgeStartIndex = 1;
        const turretEndIndex = totalVertices - 3;
        const turredEdgeEndIndex = totalVertices - 4;
        const startVertexPosition = this.outlinePoints[turretStartIndex].getPosition();
        const endVertexPosition = this.outlinePoints[turretEndIndex].getPosition();
        const startVertex2d = new Vector3(startVertexPosition.x, startVertexPosition.y, 0);
        const endVertex2d = new Vector3(endVertexPosition.x, endVertexPosition.y, 0);
        const midPoint = this.apex.getPosition();
        const midPoint2d = new Vector3(midPoint.x, midPoint.y, 0);
        midPoint.z = this.getApexHeight();
        const radius = midPoint.distanceTo(startVertexPosition);
        const turretCount = turretEndIndex - turretStartIndex - 1;
        // get the angle made at the apex by the start and end vertices
        const startVector = new THREE.Vector3().subVectors(startVertex2d, midPoint2d);
        const endVector = new THREE.Vector3().subVectors(endVertex2d, midPoint2d);
        const angle = startVector.angleTo(endVector);
        const turretAngle = angle / turretCount;
        const startRadialVector = new THREE.Vector3().subVectors(startVertexPosition, midPoint).normalize();
        let angleDelta = 0;
        for (let i = turredEdgeStartIndex; i < turredEdgeStartIndex + turretCount; i += 1) {
            angleDelta += turretAngle;
            const edge = this.outerEdgeObjects[i];
            const nextVertexVector = new THREE.Vector3().copy(startRadialVector).applyAxisAngle(new THREE.Vector3(0, 0, 1), angleDelta);
            const nextVertexPosition = new THREE.Vector3().copy(midPoint).add(nextVertexVector.multiplyScalar(radius));
            const nextVertex = edge.outlinePoint2;
            nextVertex.setPosition(nextVertexPosition.x, nextVertexPosition.y, nextVertexPosition.z);
        }
        const lastEdge = this.outerEdgeObjects[turredEdgeStartIndex + turretCount - 1];
        lastEdge.outlinePoint2 = this.outlinePoints[turretEndIndex];
        const removedOutline = this.outlinePoints.splice(turretEndIndex - 1, 1);
        removedOutline[0].removeObject();
        const removedEdge = this.outerEdgeObjects.splice(turredEdgeEndIndex, 1)[0];
        for (let i = turredEdgeEndIndex; i < this.outerEdgeObjects.length; i += 1) {
            this.outerEdgeObjects[i].outlinePoint1Index -= 1;
            this.outerEdgeObjects[i].outlinePoint2Index -= 1;
        }
        this.outerEdgeObjects[this.outerEdgeObjects.length - 1].outlinePoint2Index = 0;
        removedEdge.smartRoofFace.removeObject(false);
        removedEdge.removeObject();

        // if (this.polygonMeasurement) this.polygonMeasurement.remove();
        // this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);
        this.updateOldVertices();
        this.updateSmartRoof();
        this.getAllSmartroofIntersections();
        this.saveState();
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }
        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.removeObject();
        this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }
}

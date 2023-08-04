/* eslint-disable prefer-destructuring */
import * as THREE from 'three';
import * as utils from '../../../utils/utils';
import { getChildrenSequence } from './smartroofUtils';
import OutlinePoints from '../../subObjects/OutlinePoints';
import PolygonMeasurement from '../../subObjects/PolygonMeasurement';
import OuterEdge from './OuterEdge';
import SmartroofFace from './SmartroofFace';
import { CREATED_STATE, DELETED_STATE } from '../../../coreConstants';
import { SmartroofModel } from './SmartroofModel';

export default class Drawface extends SmartroofModel {
    async onComplete(geometry, vert = []) {
        // getting vertices from buffer geometry
        let vertices = [];
        if (vert.length === 0) {
            for (let i = 0; i < geometry.noOfVertices; i += 1) {
                vertices.push(new THREE.Vector3(
                    geometry.attributes.position.array[(i * 3)],
                    geometry.attributes.position.array[(i * 3) + 1],
                    geometry.attributes.position.array[(i * 3) + 2],
                ));
            }
            for (let i = 0; i < vertices.length; i += 1) {
                const vertex = vertices[i];
                const vertexNext = vertices[(i + 1) % vertices.length];
                const vertexPrev = vertices[((i - 1) + vertices.length) % vertices.length];
                if (utils.checkCollinear(vertex, vertexNext, vertexPrev, 0.0001)) {
                    vertices.splice(i, 1);
                    i -= 1;
                }
            }
        }
        else {
            vertices = vert;
        }
        this.oldVertices = vertices;

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            this.oldVertices.reverse();
        }

        for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                this.oldVertices[i].x,
                this.oldVertices[i].y,
                this.oldVertices[i].z,
                this,
                this.stage,
            ));
        }

        // Create outerEdge objects and their associated faces
        this.outerEdgeObjects = [];
        this.outerEdgesMesh = [];
        const tilt = this.getValidTilt(this.tilt);
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(this, this.stage, this.outlinePoints[i], this.outlinePoints[(i + 1) % l], i, (i + 1) % l, this.coreHeight, true, tilt);
            this.outerEdgeObjects.push(outerEdge);
            this.addChild(outerEdge.smartRoofFace);
        }


        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage, false, true);
        geometry.computeBoundingSphere();
        this.isDrawFace = true;
        try {
            this.primaryEdge = this.outerEdgeObjects[0];
            this.primaryEdge.isPrimaryEdge = true;
            this.deleteSmartRoofFaces();
            this.updateSmartRoof();
            this.stage.ground.addChild(this);
            for (let i = 0; i < this.children.length; i++) {
                // this.children[i].createPolygonMeasurement();
            }
            if (!this.isTemplate) {
                this.placeObject();
            }
            else {
                this.getAllSmartroofIntersections();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            // console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.onCancel();
            return Promise.reject(error);
        }
    }
    onSelect() {
        this.coreMesh.material.opacity = 0.4;
        this.is3d = this.stage.visualManager.in3D;

        // show outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].showObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].showObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].showObject();
        }

        if (this.primaryEdge) {
            this.primaryEdge.showObject();
            this.primaryEdge.isPrimaryEdge = true;
            // this.primaryEdge.onSelect();
        }

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
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            // disable innerEdge
            for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
                const v = this.innerEdgesObject[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.handleDragEnd.bind(v),
                    v.handleDragStart.bind(v),
                );
                // }
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
            for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
                const v = this.outerEdgeObjects[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
        }
        this.isSelected = true;
    }

    deSelect() {
        this.coreMesh.material.opacity = 0.25;
        // this.stage.rendererManager.getDomElement().removeEventListener('mousemove', this.onMouseMove, false)
        // hide outline points
        if (this.primaryEdge) this.primaryEdge.onDeselect();

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
        this.isSelected = false;
    }

    updateSmartRoof(updateFaces = true) {
        this.tilt = this.primaryEdge.tilt;
        this.coreHeight = this.primaryEdge.height;
        this.updateOuterEdges();
        this.updatePrimaryFace();
        this.children.forEach((c) => {
            if (c != this.primaryEdge.smartRoofFace) {
                c.updateOutlinePoints([]);
            }
        });
        this.updateGeometry();
        if (updateFaces) {
            this.children.forEach((c) => {
                c.updateSetback();
                c.updateGeometry();
            });
        }
    }

    updatePrimaryFace() {
        this.primaryEdge.smartRoofFace.vertices = this.makeFace(this.primaryEdge);
        this.primaryEdge.smartRoofFace.updateOutlinePoints(this.makeFace(this.primaryEdge));
    }

    getIndexOfOuterEdge() {
        for (let index = 0; index < this.outerEdgeObjects.length; index++) {
            if (this.outerEdgeObjects[index].id === this.primaryEdge.id) return index;
        }
        return -1;
    }

    makeFace() {
        const plane = this.primaryEdge.getFacePlane();
        const outerEdges = this.outerEdgeObjects;
        const vertices = [];
        let index = this.getIndexOfOuterEdge();
        let count = 0;
        while (count !== outerEdges.length) {
            const outerEdge1 = outerEdges[index];
            const nextIndex = (index + 1) % outerEdges.length;
            const outerEdge2 = outerEdges[nextIndex];

            vertices.push(utils.getInterSectionOfPlanes(
                plane,
                outerEdge1.getWallPlane(),
                outerEdge2.getWallPlane(),
            ));
            index = (index + 1) % outerEdges.length;
            count++;
        }
        return vertices;
    }

    makePrimaryEdge(outerEdge) {
        const prevTilt = this.primaryEdge.tilt;
        this.primaryEdge.isPrimaryEdge = false;
        Drawface.deleteSmartRoofFace(this.primaryEdge);
        this.primaryEdge = outerEdge;
        this.unDeleteSmartRoofFace(this.primaryEdge, prevTilt);
        this.updateSmartRoof();
        this.getAllSmartroofIntersections();
        this.placeObject();
    }

    saveOuterEdgeObjects() {
        return this.outerEdgeObjects.map(outerEdgeObject => [
            outerEdgeObject.isPitched,
            outerEdgeObject.tilt,
            outerEdgeObject.height,
            outerEdgeObject.smartRoofFace.isDeleted,
            outerEdgeObject.smartRoofFace.isValid,
            outerEdgeObject.isPrimaryEdge,
        ]);
    }

    loadOuterEdgeObjects(outerEdgeObjects) {
        for (let i = 0; i < outerEdgeObjects.length; i += 1) {
            this.outerEdgeObjects[i].isPitched = outerEdgeObjects[i][0];
            this.outerEdgeObjects[i].tilt = this.getValidTilt(outerEdgeObjects[i][1]);
            this.outerEdgeObjects[i].height = outerEdgeObjects[i][2];
            this.outerEdgeObjects[i].smartRoofFace.isDeleted = outerEdgeObjects[i][3];
            this.outerEdgeObjects[i].smartRoofFace.isValid = outerEdgeObjects[i][4];
            this.outerEdgeObjects[i].isPrimaryEdge = outerEdgeObjects[i][5];
        }
    }

    unDeleteSmartRoofFace(outerEdgeObject , prevTilt = this.defaultTilt) {
        const outerEdge = outerEdgeObject;
        const face = outerEdge.smartRoofFace;
        if (outerEdge.belongsTo.type === 'FlatDormer') {
            outerEdge.tilt = 0;
            face.tilt = 0;
        }
        else {
            outerEdge.tilt = prevTilt;
            face.tilt = prevTilt;
        }
        outerEdge.isPitched = true;
        outerEdge.tilt = prevTilt;
        face.isDeleted = false;
        face.tilt = prevTilt;
        face.plane = outerEdge.getFacePlane();
        face.isDeleted = false;
        face.isValid = true;
    }

    deleteSmartRoofFaces() {
        for (let index = 1; index < this.outerEdgeObjects.length; index++) {
            Drawface.deleteSmartRoofFace(this.outerEdgeObjects[index]);
        }
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
            ignored: this.ignored,
            snapHeight: this.snapHeight,
            isTemplate: this.isTemplate,
            childSequence: getChildrenSequence(this),
            outlinePoints: this.saveOutlinePoints(),
            oldVertices: this.oldVertices,
            outerEdgeObjects: this.saveOuterEdgeObjects(),
            primaryEdgeId: this.primaryEdge.id,
            folds: this.saveFolds(),
            isMoved: this.isMoved,
            rotationPoints: this.rotationPoints,
            parent: this.getParent() ? this.getParent().uuid : null,
        };
        return polygonData;
    }

    getValidTilt(tilt) {
        const validTilt = !utils.isNumber(parseFloat(tilt)) ? this.defaultTilt : parseFloat(tilt);
        return validTilt;
    }

    makeDrawFace(vert) {
        this.isDrawFace = true;

        const vectorVertices = [];
        for (let i = 0; i < vert.length; i += 1) {
            const v = vert[i];
            vectorVertices.push(new THREE.Vector3(
                v[0],
                v[1],
                v[2],
            ));
        }
        const vertices = vectorVertices;
        this.oldVertices = vertices;

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            this.oldVertices.reverse();
        }
        for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                this.oldVertices[i].x,
                this.oldVertices[i].y,
                this.oldVertices[i].z,
                this,
                this.stage,
            ));
        }

        // Create outerEdge objects and their associated faces
        this.outerEdgeObjects = [];
        this.outerEdgesMesh = [];
        const validTilt = this.getValidTilt(this.tilt);
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
                validTilt,
            );
            this.outerEdgeObjects.push(outerEdge);
            this.addChild(outerEdge.smartRoofFace);
        }


        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage, false, true);
        // geometry.computeBoundingSphere();
        this.isDrawFace = true;
        try {
            this.primaryEdge = this.outerEdgeObjects[0];
            // this.makeFace(this.outerEdgeObjects[0]);
            this.deleteSmartRoofFaces();
            this.updateSmartRoof();
            this.stage.ground.addChild(this);
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].createPolygonMeasurement();
            }
            if (!this.isTemplate) {
                this.placeObject();
            }
            else {
                this.getAllSmartroofIntersections();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            // console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.onCancel();
            return Promise.reject(error);
        }
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
            this.isTemplate = state.isTemplate;
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
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.outerEdgeObjects.forEach((outerEdgeObject) => {
                    outerEdgeObject.outlinePoint1 = this.outlinePoints[outerEdgeObject.outlinePoint1Index];
                    outerEdgeObject.outlinePoint2 = this.outlinePoints[outerEdgeObject.outlinePoint2Index];
                    outerEdgeObject.loadDeleteState();
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

            // if (this.stage.selectionControls.getSelectedObject() === this) {
            //     // update polygon measurement
            //     this.polygonMeasurement.show();
            //     // this.polygonMeasurement.update();
            // }

            this.primaryEdge = this.outerEdgeObjects.find(o => o.id === state.primaryEdgeId);
            // this.outerEdgeObjects.forEach(outerEdge => {
            //     outerEdge.updateAzimuthSelectionArrow();
            // })
            // update geometry
            this.updateSmartRoof();
            this.getAllSmartroofIntersections();
            // this.updatePolygonMeasurement();
            this.oldVertices = [];
            this.outlinePoints.forEach(outlinePoint => {
                this.oldVertices.push(outlinePoint.getPosition());
            })
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
        return true;
    }

    objectType() {
        return 'DrawFace';
    }

    static getObjectType() {
        return 'DrawFace';
    }

    saveObject(isCopy = false) {
        // return;
        const polygonModelData = {
            type: Drawface.getObjectType(),
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
        polygonModelData.minTilt = 0;
        polygonModelData.ignored = this.ignored;
        polygonModelData.snapHeight = this.snapHeight;
        polygonModelData.isTemplate = this.isTemplate;
        polygonModelData.isDrawFace = this.isDrawFace;
        polygonModelData.primaryEdgeId = (this.primaryEdge ? this.primaryEdge.id : 0);
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.dormerType = this.type;

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            if (position) {
                outlinePoints.push([
                    position.x,
                    position.y,
                    position.z,
                ]);
            }
        }
        polygonModelData.outlinePoints = outlinePoints;

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

    loadObjectFlatDormerBackwardsComp(polygonModelData, isPaste) {
        this.makeDrawFace(polygonModelData.outlinePoints);
        this.makePrimaryEdge(this.outerEdgeObjects[1]);
        this.oldVertices = [];
        if (!Drawface.validateObject(polygonModelData).isValid) {
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
        this.minTilt = 0;
        this.baseHeight = polygonModelData.baseHeight;
        this.coreHeight = polygonModelData.coreHeight;
        this.tilt = 0;
        this.ignored = polygonModelData.ignored;
        this.topHeight = polygonModelData.topHeight;
        this.snapHeight = polygonModelData.snapHeight;
        this.isTemplate = polygonModelData.isTemplate;
        this.isDrawFace = true;
        if (this.isTemplate) {
            this.type = polygonModelData.dormerType;
        }
        this.azimuth = polygonModelData.azimuth;
        this.updateOldVertices();
        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage);
        this.coreMesh.geometry.computeBoundingSphere();
        let primaryEdgeChildData = [];
        this.primaryEdge.smartRoofFace.tiltChange(polygonModelData.tilt);

        // load children
        const { children } = polygonModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === SmartroofFace.getObjectType()) {
                primaryEdgeChildData = children[i];
            }
        }

        this.tilt = primaryEdgeChildData.tilt;
        this.primaryEdge.smartRoofFace.loadObject(primaryEdgeChildData, isPaste);

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

    loadObject(polygonModelData, isPaste = false) {
        this.oldVertices = [];
        if (!Drawface.validateObject(polygonModelData).isValid) {
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
        this.minTilt = 0;
        this.baseHeight = polygonModelData.baseHeight;
        this.coreHeight = polygonModelData.coreHeight;
        this.tilt = polygonModelData.tilt;
        this.ignored = polygonModelData.ignored;
        this.topHeight = polygonModelData.topHeight;
        this.snapHeight = polygonModelData.snapHeight;
        this.isTemplate = polygonModelData.isTemplate;
        this.isDrawFace = true;
        if (this.isTemplate) {
            this.type = polygonModelData.dormerType;
        }
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
        this.updateOldVertices();
        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage);
        this.coreMesh.geometry.computeBoundingSphere();
        let copyPrimaryFace = null;
        // load children
        const { children } = polygonModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === SmartroofFace.getObjectType()) {
                const smartroofFace = new SmartroofFace(this.stage);
                this.addChild(smartroofFace);

                smartroofFace.loadObject(children[i], isPaste);
                if (isPaste && polygonModelData.primaryEdgeId === children[i].id) {
                    copyPrimaryFace = smartroofFace;
                }
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
                    this.getValidTilt(smartRoofFace.tilt),
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
                    this.getValidTilt(outerEdgeLoadObject.tilt),
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
                    this.getValidTilt(outerEdgeLoadObject.tilt),
                    this.children.find(child => child.id === outerEdgeLoadObject.id),
                );
                this.outerEdgeObjects.push(outerEdgeObject);
            }
        }
        if (!polygonModelData.primaryEdgeId) {
            this.primaryEdge = this.outerEdgeObjects[0];
        }
        else if (isPaste) this.primaryEdge = copyPrimaryFace.outerEdge;
        else this.primaryEdge = this.outerEdgeObjects.find(o => o.id === polygonModelData.primaryEdgeId);
        this.tilt = this.primaryEdge.tilt;
        this.primaryEdge.isPrimaryEdge = true;
        this.updateSmartRoof(false);
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
}

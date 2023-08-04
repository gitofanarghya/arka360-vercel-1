/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
import * as utils from '../../../utils/utils';
import OutlinePoints from '../../subObjects/OutlinePoints';
import PolygonMeasurement from '../../subObjects/PolygonMeasurement';
import OuterEdge from './OuterEdge';
import { SmartroofModel } from "./SmartroofModel";
import DrawFace from "./DrawFace";
import Templates from "./Templates";

export default class SmartroofBuilder {
    constructor(type, stage, templateRequired = true) {
        this.type = type;
        this.stage = stage;
        if (templateRequired) {
            this.template = new Templates(this.type);
        }
        this.model = [];
        this.builder();
    }

    builder() {
        if (this.type === 'Custom') {
            this.model = new DrawFace(this.stage);
        }
        else {
            if (this.type === 'FlatDormer') {
                this.model = new DrawFace(this.stage);
                this.model.isTemplate = true;
                this.model.type = this.type;
                this.model.snapHeight = true;
                this.model.tilt = 0;
                this.makeDrawFace(this.template.vertices);
                this.model.minTilt = 0;
            }
            else {
                this.model = new SmartroofModel(this.stage);
                this.model.isTemplate = true;
                this.model.type = this.type;
                this.model.snapHeight = true;
                this.makeSmartroof(this.template.vertices);
            }
            for (let i = 0; i < this.template.movementEdge.length; i++) {
                this.model.outerEdgeObjects[this.template.movementEdge[i][0]].mirrorEdge = this.model.outerEdgeObjects[this.template.movementEdge[i][1]];
                this.model.outerEdgeObjects[this.template.movementEdge[i][1]].mirrorEdge = this.model.outerEdgeObjects[this.template.movementEdge[i][0]];
            }
        }
    }

    async makeSmartroof(vertices) {
        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            for (let i = vertices.length - 1; i >= 0; i -= 1) {
                this.model.outlinePoints.push(new OutlinePoints(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                    this.model,
                    this.model.stage,
                ));
            }
        }
        else {
            for (let i = 0, l = vertices.length; i < l; i += 1) {
                this.model.outlinePoints.push(new OutlinePoints(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                    this.model,
                    this.model.stage,
                ));
            }
        }
        // Create outerEdge objects and their associated faces
        this.model.outerEdgeObjects = [];
        this.model.outerEdgesMesh = [];
        for (let i = 0, l = this.model.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(this.model, this.model.stage, this.model.outlinePoints[i], this.model.outlinePoints[(i+1)%l], i, (i+1)%l, this.model.coreHeight, true, this.model.tilt);
            this.model.outerEdgeObjects.push(outerEdge);
            const face = outerEdge.smartRoofFace;
            if (this.template.deletedFacesEdge.indexOf(i) !== -1) {
                outerEdge.isPitched = false;
                face.tilt = 90;
                outerEdge.tilt = 90;
                face.plane = face.outerPlane;
                face.isDeleted = true;
                face.isValid = false;
            }
            else {
                this.model.addChild(face);
            }
        }
        // create polygon measurement
        this.model.polygonMeasurement = new PolygonMeasurement([...this.model.outlinePoints], this.model, this.model.stage);
        // geometry.computeBoundingSphere();

        try {
            this.model.updateSmartRoof();
            this.stage.ground.addChild(this.model);
            this.model.getAllSmartroofIntersections();
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

    makeDrawFace(vert) {
        const vertices = vert;
        this.model.oldVertices = vertices;

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            this.model.oldVertices.reverse();
        }
        for (let i = 0, l = this.model.oldVertices.length; i < l; i += 1) {
            this.model.outlinePoints.push(new OutlinePoints(
                this.model.oldVertices[i].x,
                this.model.oldVertices[i].y,
                this.model.oldVertices[i].z,
                this.model,
                this.model.stage,
            ));
        }

        // Create outerEdge objects and their associated faces
        this.model.outerEdgeObjects = [];
        this.model.outerEdgesMesh = [];
        for (let i = 0, l = this.model.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(this.model, this.model.stage, this.model.outlinePoints[i], this.model.outlinePoints[(i + 1) % l], i, (i + 1) % l, this.model.coreHeight, true, this.model.tilt);
            this.model.outerEdgeObjects.push(outerEdge);
            this.model.addChild(outerEdge.smartRoofFace);
        }


        // create polygon measurement
        this.model.polygonMeasurement = new PolygonMeasurement(this.model.oldVertices, this.model, this.model.stage, false, true);
        // geometry.computeBoundingSphere();
        this.model.isDrawFace = true;
        try {
            this.model.primaryEdge = this.model.outerEdgeObjects[0];
            // this.makeFace(this.outerEdgeObjects[0]);
            this.model.deleteSmartRoofFaces();
            this.model.updateSmartRoof();
            this.model.stage.ground.addChild(this.model);
            for (let i = 0; i < this.model.children.length; i++) {
                this.model.children[i].createPolygonMeasurement();
            }
            if (!this.model.isTemplate) {
                this.model.placeObject();
            }
            else {
                this.model.getAllSmartroofIntersections();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            // console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.model.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.model.onCancel();
            return Promise.reject(error);
        }
    }

    makeCustomDrawFace(vertices, primaryEdgeIndex = 0, tilt = 20) {
        this.model.tilt = tilt
        for (let i = 0; i < vertices.length; i += 1) {
            const vertex = vertices[i];
            const vertexNext = vertices[(i + 1) % vertices.length];
            const vertexPrev = vertices[((i - 1) + vertices.length) % vertices.length];
            if (utils.checkCollinear(vertex, vertexNext, vertexPrev, 0.00001)) {
                vertices.splice(i, 1);
                i -= 1;
            }
        }
        this.model.oldVertices = vertices;

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            this.model.oldVertices.reverse();
        }
        for (let i = 0, l = this.model.oldVertices.length; i < l; i += 1) {
            this.model.outlinePoints.push(new OutlinePoints(
                this.model.oldVertices[i].x,
                this.model.oldVertices[i].y,
                this.model.oldVertices[i].z,
                this.model,
                this.model.stage,
            ));
        }

        // Create outerEdge objects and their associated faces
        this.model.outerEdgeObjects = [];
        this.model.outerEdgesMesh = [];
        for (let i = 0, l = this.model.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(this.model, this.model.stage, this.model.outlinePoints[i], this.model.outlinePoints[(i + 1) % l], i, (i + 1) % l, this.model.coreHeight, true, this.model.tilt);
            this.model.outerEdgeObjects.push(outerEdge);
            this.model.addChild(outerEdge.smartRoofFace);
        }


        // create polygon measurement
        this.model.polygonMeasurement = new PolygonMeasurement(this.model.oldVertices, this.model, this.model.stage, false, true);
        // geometry.computeBoundingSphere();
        this.model.isDrawFace = true;
        try {
            this.model.primaryEdge = this.model.outerEdgeObjects[primaryEdgeIndex];
            this.model.primaryEdge.tilt = tilt;
            // this.makeFace(this.outerEdgeObjects[0]);
            this.model.deleteSmartRoofFaces();
            this.model.updateSmartRoof();
            this.model.stage.ground.addChild(this.model);
            for (let i = 0; i < this.model.children.length; i++) {
                this.model.children[i].createPolygonMeasurement();
            }
            if (!this.model.isTemplate) {
                this.model.placeObject();
            }
            else {
                this.model.getAllSmartroofIntersections();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.model.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.model.onCancel();
            return Promise.reject(error);
        }
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.model.getParent() !== null) {
            this.model.getParent().removeChild(this.model);
        }
        // Remove from scene
        this.model.stage.sceneManager.scene.remove(this.model.objectsGroup);
        this.model.removeObject();
        this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }
}
import * as THREE from 'three';
import _ from 'lodash';

import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
    MATERIAL_STATES,
} from '../visualConstants';
import {
    areVerticesOnGround,
} from '../../utils/raycastingUtils';
import {
    convertArrayToVector,
    setbackPolygon,
    getNormalPoints,
    checkVertexEquivalency,
} from '../../utils/utils';
import OutlinePoints from '../subObjects/OutlinePoints';
import LengthMeasurement from '../subObjects/LengthMeasurement';
import BaseObject from '../BaseObject';

const MINIMUM_NUMBER_OF_POINTS = 2;
// Temp fix, seems like this constant is never used in a meaningful way
// Remove this and the property line attribute if it is not used
const DEFAULT_PROPERTY_DIRECTION = undefined;

export default class Property extends BaseObject {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.id = stage.getPropertyId();
        this.name = `Property #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // materials
        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .PROPERTY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.edgeMaterial2D = new THREE.LineDashedMaterial({
            linewidth: 4,
            scale: 2,
            dashSize: 4,
            gapSize: 8,
            color: COLOR_MAPPINGS
                .PROPERTY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // meshes and edges
        this.edgeGeometry = new THREE.BufferGeometry()
        this.coreEdges = new THREE.Line(
            this.edgeGeometry,
            this.edgeMaterial2D,
        );
        this.objectsGroup.add(this.coreEdges);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        const defaultProperties = this.getDefaultProperties();
        this.setInitialProperties(defaultProperties);

        this.propertyDirection = DEFAULT_PROPERTY_DIRECTION;

        this.outlinePoints = [];
        this.lengthMeasurements = [];
        this.vertices = [];
        this.updateVisualsAfterLoadingAndCreation();
    }

    setInitialProperties(properties) {
        this.coreHeight = properties.coreHeight;
        this.width = properties.width + 1;
        this.verticalColumnSpacing = properties.verticalColumnSpacing;
    }

    getState() {
        const PropertyData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            propertyDirection: this.propertyDirection,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return PropertyData;
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
            this.propertyDirection = state.propertyDirection;

            this.updateVisualsAfterLoadingAndCreation();
            // update parent
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
                    console.error("PropertyLine: loadState: outlinePoints length don't match");
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

        // Remove measurements
        this.removeMeasurement();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    saveObject(isCopy = false) {
        const propertyData = {
            type: Property.getObjectType(),
            id: this.id,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            propertyDirection: this.propertyDirection,
            verticalColumnSpacing: this.verticalColumnSpacing,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            propertyData.uuid = this.uuid;
        }
        return propertyData;
    }

    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
        }

        this.coreHeight = data.coreHeight;
        this.width = data.width;
        this.propertyDirection = data.propertyDirection;
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
            name: this.name,
        }];
    }

    /**
     * Returns the default properties properties for property
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
        const l = this.outlinePoints.length;
        for (let i = 0; i < l - 1; i += 1) {
            const v1 = this.outlinePoints[i].getPosition();
            const v2 = this.outlinePoints[i + 1].getPosition();
            totalLength += v1.distanceTo(v2);
        }
        totalLength += ((this.outlinePoints[l - 1].getPosition()).distanceTo(this.outlinePoints[0].getPosition()));
        return totalLength;
    }

    getHeight() {
        return this.coreHeight;
    }

    getEdges() {
        const vertices = convertArrayToVector(this.get2DVertices());
        const edges = [];
        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([vertices[i], vertices[i + 1]]);
        }
        // push the last edge
        // edges.push([vertices[this.vertices.length - 1], vertices[0]]);
        return edges;
    }

    getPlacingInformation(drawingVertices, currentParent = null) {
        let rawVertices = drawingVertices;
        let vertices = drawingVertices;

        const response = {};
        let polygonExists = true;
        let numberOfPoints = 0;
        response.errors = [];
        response.pointUnplaceableError = null;

        if (vertices !== null && vertices !== undefined) {
            if (vertices.length - 1 <= MINIMUM_NUMBER_OF_POINTS) {
                const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
                response.cannotCompleteError = error;
                response.errors.push(error);
                polygonExists = false;
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
        }
        if (rawVertices === undefined) {
            rawVertices = vertices;
        }

        if (checkVertexEquivalency(vertices)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
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
     * places the property according to the drawn vertices.
     */
    async onComplete(geometry) {
        const notificationObject = this.stage.eventManager.setPropertyCreating();
        const vertices = [];
        for (let i = 0; i <= geometry.noOfVertices; i += 1) {
            if (i < geometry.noOfVertices) {
                vertices.push(new THREE.Vector3(
                    geometry.attributes.position.array[(i * 3)],
                    geometry.attributes.position.array[(i * 3) + 1],
                    geometry.attributes.position.array[(i * 3) + 2],
                ));
            }
        }
        this.vertices = vertices;
        // set outline points
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
                this,
                this.stage,
            ));
        }


        this.updateMeasurement();

        try {
            await this.placeObject();
            this.stage.eventManager.completePropertyCreation(notificationObject);
            return true;
        }
        catch (error) {
            console.error('ERROR: Property: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorPropertyCreation(notificationObject);
            throw error;
        }
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        const vertices2dArrayHalf = [];
        for (let i = 0; i < vertices2DArray.length / 2; i++) {
            vertices2dArrayHalf.push(vertices2DArray[i]);
        }
        const vertices2DVectorToArray = convertArrayToVector(vertices2dArrayHalf);
        const numVertices = vertices2dArrayHalf.length;
        const coreShape = new THREE.Shape(vertices2DVectorToArray);
        const coreGeometry = new THREE.ExtrudeGeometry(coreShape, {
            depth: this.coreHeight,
            bevelEnabled: false,
        });

        for (let i = 0; i < numVertices; i++) {
            const vertex = coreGeometry.attributes.position.array;
            vertex.z = 1;
        }

        const points = [];
        for (const outlinePoint of this.outlinePoints) {
            points.push(outlinePoint.getPosition()); 
            outlinePoint.moveObjectWithoutConsequences(
                0,
                0,
                0,
            );
        }

        // updating meshes and edges
        points.push(points[0]);
        this.edgeGeometry.setFromPoints(points);
        this.edgeGeometry.computeBoundingSphere();
        // update measurement
        this.updateMeasurement();

    }

    moveObject(deltaX, deltaY, deltaZ = 1) {
        // update all meshes and edges
        this.coreEdges.geometry.translate(deltaX, deltaY, 1);

        // update outline points without consequences
        this.outlinePoints.forEach(outlinePoint => {
            outlinePoint.moveObjectWithoutConsequences(deltaX, deltaY, 0);
        });

        // update measurement
        this.onlyUpdateMeasurement();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        this.saveState();
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 1);

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setPropertyOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.walkwayVertexEquivalentError();
            }
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        this.updateGeometry();

        // update dimensions
        for(let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        // update siblings
        this.stage.quadTreeManager.handlePlaceObject(this);

        return true;
    }

    handleDragStart() {
        }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 1);
    }

    async handleDragEnd() {
        const notificationObject = this.stage.eventManager.setPropertyLoading();
        try {
            await this.placeObject();
            this.stage.eventManager.completePropertyLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR PROPERTY: handleDragEnd failed', error);
            this.stage.eventManager.completePropertyLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex){
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Property: vertex not in outlinePoints in handleVertexDragStart');
        }
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Property: vertex not in outlinePoints in handleVertexMove');
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Property: vertex not in outlinePoints in handleVertexMove');
        }

        const notificationObject = this.stage.eventManager.setPropertyLoading();

        try {
            await this.placeObject();

            // this.lengthMeasurement.setMovableVertex(vertex);

            // remove dimensions if not over edge and update after resize
            for(let dimension in this.dimensionObjects) {
                this.dimensionObjects[dimension].handleAssociatedObjectUpdateGeometry(this);
            }

            this.stage.eventManager.completePropertyLoading(notificationObject);

            this.stage.eventManager.setObjectsSelected(this);

            this.saveState();
        }
        catch (error) {
            console.error('ERROR PropertyLine: handleVertexPlace failed', error);
            this.stage.eventManager.completePropertyLoading(notificationObject);
            throw error;
        }
    }

    removeObject() {

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        this.removeMeasurement();

        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        if(this.getParent() != null) {
            this.getParent().removeChild(this);
        }

        this.removeDimensions();

        this.stage.quadTreeManager.removeObject(this);

        this.stage.selectionControls.setSelectedObject(this.stage.ground);
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
    }

    // Functions related to vertices.

    static getOuterVerticesInSequence(directVertices, calculatedVertices) {
        const vertices = [];
        for (let i = 0, l = directVertices.length; i < l; i += 2) {
            vertices.push(directVertices[i]);
        }
        vertices.push(directVertices[directVertices.length - 1]);
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
        return Property.getOuterVerticesInSequence(directVertices, calculatedVertices);
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
        const vertices = getNormalPoints(
            vertex1,
            vertex2,
            this.width,
            this.propertyDirection === DEFAULT_PROPERTY_DIRECTION ?
                DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
        );
        if (vertices === null) {
            return [
                [vertex1.x, vertex1.y],
                [vertex2.x, vertex2.y],
            ];
        }
        [vertex3, vertex4] = vertices;
        return [
            [vertex1.x, vertex1.y],
            [vertex2.x, vertex2.y],
            [vertex4.x, vertex4.y],
            [vertex3.x, vertex3.y],
        ];
    }

    getPosition() {
        const { cumulativeX, cumulativeY } = this.get2DVertices().reduce(
            (acc, vertex) => {
                return {
                    cumulativeX: acc.cumulativeX + vertex[0],
                    cumulativeY: acc.cumulativeY + vertex[1],
                    cumulativeZ: 0,
                };
            },
            {
                cumulativeX: 0,
                cumulativeY: 0,
                cumulativeZ: 0,
            },
        );
        return new THREE.Vector3(
            cumulativeX / this.vertices.length,
            cumulativeY / this.vertices.length,
            0,
        );
    }

    // Measurement functions

    updateMeasurement() {
        if (this.lengthMeasurements !== []) {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].remove();
            }
            this.lengthMeasurements = [];
        }

        for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
            this.lengthMeasurements.push(new LengthMeasurement(
                this.outlinePoints[i],
                this.outlinePoints[i + 1],
                this.stage,
                this,
            ));
        }
        this.lengthMeasurements.push(new LengthMeasurement(
            this.outlinePoints[this.outlinePoints.length - 1],
            this.outlinePoints[0],
            this.stage,
            this,
        ));
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
        this.objectsGroup.remove(this.coreEdges);
        this.hideMeasurement();
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
    }

    switchTo2D() {
        this.objectsGroup.add(this.coreEdges);
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
        this.hideMeasurement();
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
    get mesh() {
        return this.coreEdges;
    }
    
    get mesh2D() {
        return this.coreEdges;
    }

    get mergeMeshMaterial2D() {
        return this.meshMaterial2D;
    }
 
    get mergeEdgeMaterial2D() {
        return this.edgeMaterial2D;
    }

    static getObjectType() {
        return 'Property';
    }

}
import * as THREE from 'three';
import BaseObject from '../BaseObject';
import * as raycastingUtils from '../../utils/raycastingUtils';
import {
    OUT_OF_GROUND_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
} from '../../coreConstants';
import { MATERIAL_STATES, VISUAL_STATES, COLOR_MAPPINGS } from '../visualConstants';
import * as utils from '../../utils/utils';
import * as visualUtils from '../../utils/visualUtils';
import OutlinePoints from '../subObjects/OutlinePoints';
import { updateText } from './textUtils';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';

export const MINIMUM_NUMBER_OF_POINTS = 2;

export default class TextBox extends BaseObject {
    constructor(stage) {
        super(stage);

        this.stage = stage;

        this.name = 'Text Box Tool';
        this.id = stage.getTextboxId();

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.outlinePoints = [];

        this.zValue = null;

        this.textBoxMaterial = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .TEXT_BOX[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide,
        });

        this.textBoxMesh = createMesh(
            createBufferGeometry(),
            this.textBoxMaterial,
        );

        this.shapeWidth = 2;
        this.shapeColor = '#000000';
        this.font = 'Arial';
        this.fontColor = '#FFFFFF';
        this.fontSize = 1;
        this.fontBold = false;
        this.fontItalics = false;
        this.text = '';
        this.prevLineText = '';
        this.currLineText = '';
        this.wordArray = [];
        this.textForUpdate = '';

        this.lineSpacing = 1.2;
        this.textPadding = 0.5;
        this.wrappingLimit = 0;
        this.wrapLine = false;
        this.isUpdate = false;
        this.lineWidth = 1;
        this.prevWidth = null;
        this.startY = true;
        this.startYPosition = null;
        this.adjust = false;

        this.textMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: false,
            opacity: 1,
            side: THREE.DoubleSide,
        });

        this.textMesh = createMesh(
            createBufferGeometry(),
            this.textMaterial,
        );

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.objectsGroup.add(this.textMesh);
        this.objectsGroup.add(this.textBoxMesh);

        // handle reference deletion properly
        this.stage.textObjects.push(this);

        this.updateVisualsAfterLoadingAndCreation();
    }

    getState() {
        const textBoxData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            shapeWidth: this.shapeWidth,

            shapeColor: this.shapeColor,
            font: this.font,
            fontColor: this.fontColor,
            fontSize: this.fontSize,
            fontBold: this.fontBold,
            fontItalics: this.fontItalics,
            text: this.text,
            wrappingLimit: this.wrappingLimit,

            wrapLine: this.wrapLine,
            textForUpdate: this.textForUpdate,
            isUpdate: this.isUpdate,
            wordArray: this.wordArray,
            prevLineText: this.prevLineText,
            currLineText: this.currLineText,
            lineWidth: this.lineWidth,
            prevWidth: this.prevWidth,
            startY: this.startY,
            startYPosition: this.startYPosition,
            adjust: this.adjust,

            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return textBoxData;
    }

    async loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;

            this.shapeWidth = state.shapeWidth;
            this.shapeColor = state.shapeColor;
            this.font = state.font;
            this.fontColor = state.fontColor;
            this.fontSize = state.fontSize;
            this.fontBold = state.fontBold;
            this.fontItalics = state.fontItalics;
            this.text = state.text;
            this.wrappingLimit = state.wrappingLimit;

            this.wrapLine = state.wrapLine;
            this.textForUpdate = state.textForUpdate;
            this.isUpdate = state.isUpdate;
            this.wordArray = state.wordArray;
            this.prevLineText = state.prevLineText;
            this.currLineText = state.currLineText;
            this.lineWidth = state.lineWidth;
            this.prevWidth = state.prevWidth;
            this.startY = state.startY;
            this.startYPosition = state.startYPosition;
            this.adjust = state.adjust;

            this.updateVisualsBasedOnStates();

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
            }
            else {
                // update outline points
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('Text Box: loadState: outlinePoints length don\'t match');
                    return null;
                }
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            }

            // update geometry
            this.updateGeometry();
            await updateText(this, { updateTextBox: false });
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    saveObject(isCopy = false) {
        const textBoxData = {
            type: TextBox.getObjectType(),
        };

        textBoxData.id = this.id;
        textBoxData.name = this.name;
        if (isCopy) {
            textBoxData.uuid = this.uuid;
        }

        textBoxData.shapeWidth = this.shapeWidth;
        textBoxData.shapeColor = this.shapeColor;
        textBoxData.font = this.font;
        textBoxData.fontColor = this.fontColor;
        textBoxData.fontSize = this.fontSize;
        textBoxData.fontBold = this.fontBold;
        textBoxData.fontItalics = this.fontItalics;
        textBoxData.text = this.text;
        textBoxData.wrappingLimit = this.wrappingLimit;

        textBoxData.wrapLine = this.wrapLine;
        textBoxData.textForUpdate = this.textForUpdate;
        textBoxData.isUpdate = this.isUpdate;
        textBoxData.wordArray = this.wordArray;
        textBoxData.prevLineText = this.prevLineText;
        textBoxData.currLineText = this.currLineText;
        textBoxData.lineWidth = this.lineWidth;
        textBoxData.prevWidth = this.prevWidth;
        textBoxData.startY = this.startY;
        textBoxData.startYPosition = this.startYPosition;
        textBoxData.adjust = this.adjust;

        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            outlinePoints.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
                this.outlinePoints[i].getPosition().z,
            ]);
        }
        textBoxData.outlinePoints = outlinePoints;

        return textBoxData;
    }

    loadObject(textBoxData, isPaste = false) {
        let shouldBeRemoved = true;

        for (let i = 0, len = textBoxData.outlinePoints.length; i < len; i += 1) {
            if (!(textBoxData.outlinePoints[i][0] === 0 &&
                textBoxData.outlinePoints[i][1] === 0 &&
                textBoxData.outlinePoints[i][2] === 0)) {
                shouldBeRemoved = false;
                break;
            }
        }

        if (shouldBeRemoved) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = textBoxData.id;
            this.name = textBoxData.name;
        }

        this.shapeWidth = textBoxData.shapeWidth;
        this.shapeColor = textBoxData.shapeColor;
        this.font = textBoxData.font;
        this.fontColor = textBoxData.fontColor;
        this.fontSize = textBoxData.fontSize;
        this.fontBold = textBoxData.fontBold;
        this.fontItalics = textBoxData.fontItalics;
        this.text = textBoxData.text;
        this.wrappingLimit = textBoxData.wrappingLimit;

        this.wrapLine = textBoxData.wrapLine;
        this.textForUpdate = textBoxData.textForUpdate;
        this.isUpdate = textBoxData.isUpdate;
        this.wordArray = textBoxData.wordArray;
        this.prevLineText = textBoxData.prevLineText;
        this.currLineText = textBoxData.currLineText;
        this.lineWidth = textBoxData.lineWidth;
        this.prevWidth = textBoxData.prevWidth;
        this.startY = textBoxData.startY;
        this.startYPosition = textBoxData.startYPosition;
        this.adjust = textBoxData.adjust;

        // set outline points
        for (let i = 0, len = textBoxData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                textBoxData.outlinePoints[i][0],
                textBoxData.outlinePoints[i][1],
                textBoxData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }

        // update geometry
        this.updateGeometry();
        updateText(this, { updateTextBox: false });

        this.updateVisualsBasedOnStates();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);

        const normalisedShapeWidth = this.shapeWidth * 0.025;
        const outsideVertices2DArray = utils.setbackPolygon(vertices2DArray, normalisedShapeWidth);
        const outsideVertices2DVectorArray = utils.convertArrayToVector(outsideVertices2DArray);

        const textBoxShape = new THREE.Shape(outsideVertices2DVectorArray);
        if (vertices2DVectorArray.length > 2) {
            textBoxShape.holes = [new THREE.Path(vertices2DVectorArray)];
        }

        const textBoxGeometry = new THREE.ShapeGeometry(textBoxShape);
        textBoxGeometry.translate(0, 0, this.outlinePoints[0].getPosition().z - 0.001);

        this.textBoxMesh.geometry = textBoxGeometry;
    }

    async onComplete(geometry) {
        const notificationObject = this.stage.eventManager.setTextBoxCreating();

        const vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i += 1) {
            vertices.push(new THREE.Vector3(
                geometry.attributes.position.array[i * 3],
                geometry.attributes.position.array[(i * 3) + 1],
                geometry.attributes.position.array[(i * 3) + 2],
            ));
        }

        // set outline points
        // TODO: Always make bottom vertex as outlinePoint[1]. 0 -> Drag, 1 -> Resize
        if (vertices[0].y < vertices[1].y) {
            vertices.reverse();
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

        try {
            this.placeObject();
            this.stage.ground.addChild(this);
            this.stage.eventManager.completeTextBoxCreation(notificationObject);
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Text Box: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorTextBoxCreation(notificationObject);
            return Promise.reject(error);
        }
    }

    onCancel() {
        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    initDrawingMode() {
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    initEditMode() {
        this.stage.stateManager.startContainer();
        this.stage.textEditor.initialize(this);
    }

    removeObject() {
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        // NOTE: deSelect should be after save,
        // since it will disable drag controls and stop Undo/Redo container
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }


    moveObject(deltaX, deltaY, deltaZ = 0) {
        this.textBoxMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.textMesh.geometry.translate(deltaX, deltaY, deltaZ);

        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        this.saveState();
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setTextBoxOutOfGroundRemoved();
            }
            this.removeObject();
            return Promise.reject(error);
        }

        this.updateGeometry();
        this.saveState();

        return Promise.resolve(true);
    }

    handleDragStart() {
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        // const notificationObject = this.stage.eventManager.setTextBoxLoading();
        try {
            await this.placeObject();
            // this.stage.eventManager.completeTextBoxLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR Text Box: handleDragEnd failed', error);
            // this.stage.eventManager.completeTextBoxLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Text Box: vertex not in outlinePoints in handleVertexDragStart');
        }
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Text Box: vertex not in outlinePoints in handleVertexMove');
        }
        // else if (this.outlinePoints.indexOf(vertex) === 0) {
        //     console.log('p1');
        //     this.moveObject();
        // }
        // else if (this.outlinePoints.indexOf(vertex) === 1) {
        //     console.log('p2');

        //     // update geometry
        //     this.updateGeometry();
        //     updateText(this, { updateTextBox: false });
        //     this.saveState();
        // }

        // update geometry
        this.updateGeometry();
        // updateText(this, { updateTextBox: false });

        // this.textMesh.geometry.computeBoundingBox();
        // const textBBox = this.textMesh.geometry.boundingBox;
        // const textBBoxSize = new THREE.Vector3();
        // textBBox.getSize(textBBoxSize);

        // // horizontal textBox adjustments
        // const currentWidth = this.getTextBoxWidth();
        // if (textBBoxSize.x >= currentWidth) {
        //     updateText(this, { updateTextBox: false });
        // }

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Text Box: vertex not in outlinePoints in handleVertexMove');
        }

        // const notificationObject = this.stage.eventManager.setTextBoxLoading();

        try {
            await updateText(this, {updateTextBox: true});
            await this.placeObject();

            this.stage.eventManager.setObjectsSelected(this);
            // this.stage.eventManager.completeTextBoxLoading(notificationObject);
            this.saveState();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR Text Box: handleVertexPlace failed', error);
            // this.stage.eventManager.completeTextBoxLoading(notificationObject);
            throw error;
        }
    }

    onSelect() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }

        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        if (!this.stage.selectionControls.isMultiSelect()) {
            // const dragVertex = this.outlinePoints[0];
            // this.stage.dragControls.add(
            //     dragVertex,
            //     dragVertex.moveObject.bind(dragVertex),
            //     dragVertex.placeObject.bind(dragVertex),
            //     dragVertex.handleDragStart.bind(dragVertex),
            // );

            const resizeVertex = this.outlinePoints[1];
            this.stage.dragControls.add(
                resizeVertex,
                resizeVertex.moveObject.bind(resizeVertex),
                resizeVertex.placeObject.bind(resizeVertex),
                resizeVertex.handleDragStart.bind(resizeVertex),
            );
        }
    }

    deSelect() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
    }

    showObjectLayer() {
        // In future if layers are used,
        // it needs to be checked if the camera and model are in the same layer or not!
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
    }

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
    }

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const pointPosition = this.outlinePoints[i].getPosition();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count += 1;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    getTextBoxWidth() {
        return Math.abs(this.outlinePoints[1].getPosition().x
            - this.outlinePoints[0].getPosition().x);
    }

    getTextBoxHeight() {
        return Math.abs(this.outlinePoints[1].getPosition().y
            - this.outlinePoints[0].getPosition().y);
    }

    getPlacingInformation(drawingVertices) {
        const response = {};
        response.parent = null;
        response.pointUnplaceableError = null;
        response.errors = [];

        // Getting vertices
        const vertices2DArray = this.get2DVertices(drawingVertices);

        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }

        if (vertices2DArray.length < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }

        return response;
    }

    get2DVertices(drawingVertices) {
        const vertices = [];

        let startPoint;
        let endPoint;

        if (drawingVertices === null
            || drawingVertices === undefined) {
            startPoint = this.outlinePoints[0].getPosition();
            endPoint = this.outlinePoints[1].getPosition();
        }
        else if (drawingVertices.length < MINIMUM_NUMBER_OF_POINTS) {
            return utils.convertArrayToVector(drawingVertices);
        }
        else {
            const vectorVertices = utils.convertArrayToVector(drawingVertices);
            [startPoint, endPoint] = vectorVertices;
        }


        vertices.push([startPoint.x, startPoint.y]);
        vertices.push([endPoint.x, startPoint.y]);
        vertices.push([endPoint.x, endPoint.y]);
        vertices.push([startPoint.x, endPoint.y]);

        return vertices;
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.TEXT_BOX;
        let color = {};
        if (this.materialAndVisualStatesExist(colorMapping)) {
            color = colorMapping[this.materialState][this.visualState];
        }
        if (this.visualState !== VISUAL_STATES.ERROR) {
            color.MESH_COLOR = parseInt(this.shapeColor.replace('#', ''), 16);
        }
        return color;
    }

    getId() {
        return this.id;
    }

    getEdges() {
        const vertices = utils.convertArrayToVector(this.get2DVertices());
        const edges = [];
        for (let i = 0; i < vertices.length - 1; i += 1) {
            edges.push([
                vertices[i],
                vertices[i + 1],
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[vertices.length - 1].x !== vertices[0].x ||
                vertices[vertices.length - 1].y !== vertices[0].y)) {
            edges.push([
                vertices[vertices.length - 1],
                vertices[0],
            ]);
        }

        return edges;
    }

    async updateTextProperties(properties) {
        let updateGeometryRequired = false;
        let updateMaterialRequired = false;
        let updateTextRequired = false;
        let adjustRequired = false;
        if (Object.prototype.hasOwnProperty.call(properties, 'shapeWidth')
            && properties.shapeWidth !== this.shapeWidth) {
            this.shapeWidth = properties.shapeWidth;
            updateGeometryRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'shapeColor')
            && properties.shapeColor !== this.shapeColor) {
            this.shapeColor = properties.shapeColor;
            updateMaterialRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'font')
            && properties.font !== this.font) {
            this.font = properties.font;
            updateTextRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'fontColor')
            && properties.fontColor !== this.fontColor) {
            this.fontColor = properties.fontColor;
            updateMaterialRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'fontSize')
            && properties.fontSize !== this.fontSize) {
            this.fontSize = properties.fontSize;
            updateTextRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'fontBold')
            && properties.fontBold !== this.fontBold) {
            this.fontBold = properties.fontBold;
            updateTextRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'fontItalics')
            && properties.fontItalics !== this.fontItalics) {
            this.fontItalics = properties.fontItalics;
            updateTextRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'adjust')
            && properties.adjust !== this.adjust) {
            adjustRequired = true;
            this.adjust = properties.adjust;
        }
        if (updateGeometryRequired) {
            this.updateGeometry();
        }
        if (updateMaterialRequired) {
            this.updateVisualsBasedOnStates();
        }
        if (updateTextRequired) {
            await updateText(this, { updateTextBox: true });
        }
        if (adjustRequired) {
            // await updateText(this, { updateTextBox: true, adjust: true });
            await updateText(this, { updateTextBox: true });
        }
    }

    async resizeTextBox(dX = 0, dY = 0, dZ = 0) {
        // TODO: record these states
        try {
            this.outlinePoints[1].moveObjectWithoutConsequences(
                (dX + this.textPadding),
                -(dY + this.textPadding + this.fontSize + this.lineSpacing),
                dZ,
            );
            this.updateGeometry();
        }
        catch (error) {
            console.error('Text Box: Auto Resize failed.');
            this.stage.textEditor.exitTextEditor({ discard: false });
        }
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            // for 3D
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.textBoxMesh.castShadow = false;
            if (this.textBoxMesh.material !== this.textBoxMaterial) {
                this.textBoxMesh.material = this.textBoxMaterial;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.textBoxMesh);
        const textColor = parseInt(this.fontColor.replace('#', ''), 16);
        visualUtils.updateMeshWithColor(textColor, this.textMesh);
    }

    switchVisualState(newVisualState) {
        if (this.visualState !== newVisualState) {
            if (newVisualState === VISUAL_STATES.DEFAULT) {
                this.stage.visualManager.switchDefaultVisualStatesInSequenceForObject(this);
            }
            else {
                this.visualState = newVisualState;
            }

            this.updateVisualsBasedOnStates();
        }
    }

    switchView(view) {
        if (view === '3D') {
            this.zValue = this.getPosition().z;
            this.textBoxMesh.translateZ(-this.zValue + 0.001);
            this.textMesh.translateZ(-this.zValue + 0.001);
        }
        if (view === '2D') {
            this.textBoxMesh.translateZ(this.zValue);
            this.textMesh.translateZ(this.zValue);
        }
    }

    static getObjectType() {
        return 'TextBox';
    }
}

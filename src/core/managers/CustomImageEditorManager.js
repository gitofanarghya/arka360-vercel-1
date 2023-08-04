import * as THREE from 'three';

import * as utils from '../utils/utils';
import {
    MAX_DRAWING_POINTS,
    INVALID_PROPERTIES_ERROR,
} from '../coreConstants';
import { getNewScale } from '../utils/customImageEditUtils';
import {
    THICK_BORDER_OUTLINE_POINT_IMAGE_URL,
    SCALE_GUI_LINE_WIDTH,
    SCALE_GUI_POINT_SIZE,
    SCALE_GUI_LINE_COLOR,
    SCALE_GUI_POINT_COLOR,
    VISUAL_STATES,
} from '../objects/visualConstants';
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import LengthMeasurement from '../objects/subObjects/LengthMeasurement';
import { getZoomToObject } from '../utils/controlsUtils';

const ROTATION_GUI_CONTROL = 'rotation';
const SCALE_GUI_CONTROL = 'scale';

const GROUND_SIZE_LIMITS = {
    MIN: 10,
    MAX: 1000,
    ALLOWED_DEVIATION: 0.75,
};

let customImageEditorManagerInstance;

export default class CustomImageEditorManager {
    constructor(stage) {
        if (customImageEditorManagerInstance) {
            return customImageEditorManagerInstance;
        }
        this.stage = stage;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.currentlyActiveControl = '';

        this.onCompleteCallback = null;
        this.onCancelCallback = null;

        this.newCustomImage = null;

        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.numVertices = 0;

        this.mousePoint = new THREE.Vector2();

        // May be used in the future
        // this.centreCircleSegments = 32;
        // this.centreCircleVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        // this.circleSegments = 32;
        // this.circleVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        // const sprite = new THREE.TextureLoader().load('https://res.cloudinary.com/dkb1nvu7q/image/upload/v1579516446/disc.png');
        // this.centreCircleMaterial = new THREE.PointsMaterial({
        //     size: 50,
        //     sizeAttenuation: false,
        //     map: sprite,
        //     alphaTest: 0.5,
        //     transparent: true,
        // });
        // this.centreCircleMaterial.color.set(0xffffff);

        // this.textMaterial = new THREE.MeshBasicMaterial({
        //     color: 0xffffff,
        //     transparent: true,
        //     opacity: 0.8,
        // });

        // this.circleMaterial = new THREE.MeshBasicMaterial({
        //     color: 0xffffff,
        // });

        this.lineMaterial = new THREE.LineBasicMaterial({
            linewidth: SCALE_GUI_LINE_WIDTH,
            linecap: 'square',
            color: SCALE_GUI_LINE_COLOR,
        });

        const pointSprite = new THREE.TextureLoader().load(THICK_BORDER_OUTLINE_POINT_IMAGE_URL);
        this.pointMaterial = new THREE.PointsMaterial({
            size: SCALE_GUI_POINT_SIZE,
            map: pointSprite,
            color: SCALE_GUI_POINT_COLOR,
        });

        this.canvas = stage.rendererManager.getDomElement();

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);

        this.currentGroundSize = this.stage.getImageDimensions().width;

        this.modelsErred = [];

        // May be used in the future
        this.validationError = null;

        customImageEditorManagerInstance = this;
    }

    reset() {
        this.currentlyActiveControl = '';

        this.onCompleteCallback = null;
        this.onCancelCallback = null;

        this.newCustomImage = null;

        this.validationError = null;

        this.currentGroundSize = this.stage.getImageDimensions().width;

        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.numVertices = 0;

        this.mousePoint = new THREE.Vector2();

        this.modelsErred = [];
    }

    updateCameraPosition() {
        const controls = this.stage.controlsManager.get2DControls();
        controls.setOrthographicCameraPosition(new THREE.Vector2(0, 0));
        controls.setOrthographicTarget(new THREE.Vector2(0, 0));
        controls.setOrthographicCameraZoom(getZoomToObject(
            this.stage.ground,
            controls,
            { bufferX: 1.2, bufferY: 1.2 },
        ));
    }

    initialize(newCustomImage, onCompleteCallback, onCancelCallback) {
        this.registerListeners();

        this.infoNotificationObject =
            this.stage.eventManager.createNotificationForCustomImageEditMode();

        this.onCompleteCallback = onCompleteCallback;
        this.onCancelCallback = onCancelCallback;
        this.newCustomImage = newCustomImage;

        this.stage.ground.hideImage();
        this.stage.ground.showEdges();

        if (this.stage.visualManager.getShadowEnabled()) {
            this.stage.lightsManager.disableShadows();
        }
        this.stage.visualManager.updateVisualsForCustomImageEdit(true);
        this.stage.viewManager.disableDimensions();
        this.newCustomImage.enableDragging();
        this.stage.eventManager.updateSAPPaneForCustomImage(
            this.newCustomImage,
            { controlsEnabled: !this.isAnyControlActive() },
        );
        this.stage.selectionControls.disable();
        this.stage.duplicateManager.disable();

        this.stage.eventManager.setButtonStatusWhileEditingCustomImage(
            this.onComplete.bind(this),
            this.onCancel.bind(this),
            this.newCustomImage,
        );

        this.lengthMeasurement = null;
        this.modelsErred = [];
        for (let i = 0; i < this.stage.ground.getChildren().length; i += 1) {
            this.modelsErred.push(false);
        }

        this.updateCameraPosition();
    }

    startScaleGUI() {
        this.stage.viewManager.enableXray(this.stage.ground);
        this.stage.viewManager.unbindXRayVision();
        this.currentlyActiveControl = SCALE_GUI_CONTROL;

        this.scaleGUINotificationObject = this.stage.eventManager
            .setButtonStatusWhileEditingCustomImageInScaleGUIMode();

        this.initPoints();
        this.initLines();
    }

    startRotationGUI() {
        this.currentlyActiveControl = ROTATION_GUI_CONTROL;

        this.initCentreCircle();
        this.initCircle();
        this.initText();
        this.initLines();
    }

    initPoints() {
        // Geometry for drawing points
        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        this.pointsMesh = new THREE.Points(pointGeometry, this.pointMaterial);
        this.pointsMesh.name = 'Scale points';
        this.pointsMesh.geometry.setDrawRange(0, 0);
        this.pointsMesh.position.z = 1;
        this.pointsMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.pointsMesh);

        // initialize outline points
        this.outlinePoints = [];
        this.outlinePoints.push(new OutlinePoints(
            0,
            0,
            0,
            this,
            this.stage,
            {
                OUTLINE_POINT_COLOR: 0xffffff,
            },
        ));
    }

    initLines() {
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        const { lineMaterial } = this;

        this.lineMesh = new THREE.Line(lineGeometry, lineMaterial);
        this.lineMesh.name = 'Scale lines';
        this.lineMesh.geometry.setDrawRange(0, 0);
        this.lineMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.lineMesh);
    }

    // initCircle() {
    //     const circleGeometry = new THREE.BufferGeometry();
    //     circleGeometry.addAttribute(
    //         'position',
    //         new THREE.BufferAttribute(this.circleVertices, 3),
    //     );

    //     this.circleMesh = new THREE.Line(circleGeometry, this.circleMaterial);
    //     this.circleMesh.name = 'Circle';
    //     this.circleMesh.geometry.setDrawRange(0, this.circleSegments + 1);
    //     this.circleMesh.frustumCulled = false;

    //     this.objectsGroup.add(this.circleMesh);
    // }

    // initCentreCircle() {
    //     const centreCircleGeometry = new THREE.BufferGeometry();
    //     centreCircleGeometry
    //         .addAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

    //     this.centreCircleMesh = new THREE.Points(centreCircleGeometry,
    //     this.centreCircleMaterial);
    //     this.centreCircleMesh.name = 'Centre circle';
    //     this.centreCircleMesh.frustumCulled = false;

    //     this.objectsGroup.add(this.centreCircleMesh);
    // }

    // initText() { }

    updateGeometry() {
        if (this.currentlyActiveControl === SCALE_GUI_CONTROL) {
            this.updateScaleGUI();
        }
        else if (this.currentlyActiveControl === ROTATION_GUI_CONTROL) {
            this.updateRotationGUI();
        }
    }

    completeScalingGUI() {
        const newValue = this.outlinePoints[0]
            .getPosition().distanceTo(this.outlinePoints[1].getPosition());
        const vertices = utils.drawingArrayToVectorArray(this.vertices, this.numVertices);
        const scaleOrigin =
            (new THREE.Vector2()).copy(vertices[0]).add(vertices[1]).divideScalar(2);
        const newScale = getNewScale(vertices, newValue, this.newCustomImage.getScale());
        this.newCustomImage.updateScale(newScale, scaleOrigin);

        this.resetGUI();
    }

    resetGUI() {
        if (this.currentlyActiveControl === SCALE_GUI_CONTROL) {
            this.stage.viewManager.bindXRayVision();
            this.stage.viewManager.disableXray(this.stage.ground);

            if (this.scaleGUINotificationObject) {
                this.stage.eventManager.closeNotificationObject(this.scaleGUINotificationObject);
            }
        }
        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.numVertices = 0;

        this.mousePoint = new THREE.Vector2();

        this.initPoints();
        this.initLines();
        // this.initCentreCircle();
        // this.initCircle();
        // this.initText();

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.currentlyActiveControl = '';
        this.stage.eventManager.updateSAPPaneForCustomImage(
            this.newCustomImage,
            { controlsEnabled: !this.isAnyControlActive() },
        );

        if (this.lengthMeasurement) {
            this.lengthMeasurement.remove();
        }
        for (let i = 0; i < this.outlinePoints.length; i += 1) {
            this.outlinePoints[i].removeObject();
        }
        this.outlinePoints = [];
        this.lengthMeasurement = null;

        this.stage.eventManager.setButtonStatusWhileEditingCustomImage(
            this.onComplete.bind(this),
            this.onCancel.bind(this),
            this.newCustomImage,
        );
    }

    updateGroundSize(newSize) {
        this.stage.ground.resizeGround(newSize / this.currentGroundSize);
        this.currentGroundSize = newSize;

        this.updateErredModels();
    }

    updateRotationGUI() {
        this.updateLines();
        this.updateCircle();
        this.updateCentreCircle();
        this.updateText();
    }

    updateScaleGUI() {
        if (this.numVertices < 2) {
            this.updatePoints();
            this.updateLines();

            this.updateMeasurements();
        }
    }

    updatePoints() {
        this.pointsMesh.geometry.setDrawRange(0, this.numVertices + 1);
        this.pointsMesh.geometry.attributes.position.needsUpdate = true;
    }

    updateLines() {
        this.lineMesh.geometry.setDrawRange(0, this.numVertices + 1);
        this.lineMesh.geometry.attributes.position.needsUpdate = true;
    }

    // updateCircle() { }

    // updateCentreCircle() {
    //     if (this.numVertices < 1) {
    //         this.centreCircleMesh.position.set(
    //             this.mousePoint.x,
    //             this.mousePoint.y,
    //             1,
    //         );
    //     }
    // }

    // updateText() { }

    updateMeasurements() {
        if (this.numVertices >= 1) {
            if (this.lengthMeasurement === null) {
                this.lengthMeasurement = new LengthMeasurement(
                    this.outlinePoints[0],
                    this.outlinePoints[1],
                    this.stage,
                    this,
                );
            }
            else {
                this.lengthMeasurement.update();
            }
            this.lengthMeasurement.show();
        }
    }

    updatePropertiesValidationError(isValid) {
        if (isValid) {
            this.validationError = null;
        }
        else {
            this.validationError = new Error(INVALID_PROPERTIES_ERROR);
        }
    }

    registerListeners() {
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.canvas.addEventListener('click', this.onClick, false);
    }

    removeListeners() {
        this.canvas.removeEventListener('click', this.onClick, false);
        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
    }

    disable() {
        this.removeListeners();

        this.stage.visualManager.updateVisualsForCustomImageEdit(false);
        this.stage.ground.updateGroundForDrawing();
        this.stage.viewManager.enableDimensions();
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);

        if (this.infoNotificationObject) {
            this.stage.eventManager.closeNotificationObject(this.infoNotificationObject);
        }
        this.stage.eventManager.finishCustomImageEditMode();

        this.reset();
    }

    removeErredModels() {
        const groundChildren = this.stage.ground.getChildren();
        for (let i = this.modelsErred.length; i >= 0; i -= 1) {
            if (this.modelsErred[i]) {
                groundChildren[i].removeObject();
            }
        }
    }

    updateImageDimensions() {
        const newImageDimensions = {
            width: this.getCurrentGroundSize(),
            height: this.getCurrentGroundSize(),
        };
        this.stage.updateImageDimensions(newImageDimensions);
        this.stage.eventManager.saveCurrentDesignScene({ imageDimensions: newImageDimensions });
    }

    async onComplete() {
        this.stage.eventManager.updateSAPPaneForCustomImage(
            this.newCustomImage,
            { controlsEnabled: false },
        );

        const notificationObject = this.stage.eventManager.setUpdatingCustomImageLoading();
        await new Promise(r => setTimeout(r, 300));

        await this.stage.eventManager.uploadAndPatchImage(this.newCustomImage);

        this.updateImageDimensions();

        this.stage.ground.reset();

        this.removeErredModels();

        this.onCompleteCallback();

        this.stage.eventManager.closeNotificationObject(notificationObject);
        this.disable();
    }

    updateErredModels() {
        const groundChildren = this.stage.ground.getChildren();
        for (let i = 0; i < groundChildren.length; i += 1) {
            const placingInformation = groundChildren[i].getPlacingInformation();
            if (placingInformation.errors.length !== 0 &&
                !this.modelsErred[i]) {
                groundChildren[i].switchVisualState(VISUAL_STATES.ERROR, true);
                this.modelsErred[i] = true;
            }
            else if (placingInformation.errors.length === 0 &&
                this.modelsErred[i]) {
                groundChildren[i].switchVisualState(VISUAL_STATES.DEFAULT, true);
                this.modelsErred[i] = false;
            }
        }
    }

    onCancel() {
        if (this.isAnyControlActive()) {
            this.resetGUI();
        }
        else {
            this.stage.ground.reset();

            this.onCancelCallback();
            this.disable();

            this.stage.eventManager.cancelCustomImageUpload();
        }
    }

    // Called by length measurement
    handleOnCancel() {
        if (this.currentlyActiveControl === SCALE_GUI_CONTROL) {
            this.resetGUI();
        }
    }

    handleVertexPlace() {
        // Create a distance to function in outline points
        this.completeScalingGUI();
    }

    handleVertexMove() {}

    addPoint(vertex) {
        this.vertices[(this.numVertices * 3)] = vertex.x;
        this.vertices[(this.numVertices * 3) + 1] = vertex.y;
        this.vertices[(this.numVertices * 3) + 2] = 1;

        this.numVertices += 1;

        if (this.currentlyActiveControl === SCALE_GUI_CONTROL) {
            this.outlinePoints.push(new OutlinePoints(
                vertex.x,
                vertex.y,
                vertex.z,
                this,
                this.stage,
                {
                    OUTLINE_POINT_COLOR: 0xffffff,
                },
            ));

            if (this.numVertices === 2) {
                this.lengthMeasurement.textObject.update('');
                this.lengthMeasurement.setTextEditable();
            }
        }
    }

    onClick(event) {
        if (this.currentlyActiveControl === SCALE_GUI_CONTROL && this.numVertices < 2) {
            const vertex = utils
                .getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
            this.addPoint(vertex);
        }
    }

    updateMousePoint(event) {
        this.mousePoint = utils.getNormalizedCameraCoordinates(
            event.clientX,
            event.clientY,
            this.stage,
        );
        if (this.currentlyActiveControl === SCALE_GUI_CONTROL && this.numVertices < 2) {
            this.vertices[(this.numVertices * 3)] = this.mousePoint.x;
            this.vertices[(this.numVertices * 3) + 1] = this.mousePoint.y;
            this.vertices[(this.numVertices * 3) + 2] = utils.getHighestZ(this.stage.ground) + 5;

            this.outlinePoints[this.numVertices].setPosition(
                this.vertices[this.numVertices * 3],
                this.vertices[(this.numVertices * 3) + 1],
                this.vertices[(this.numVertices * 3) + 2],
            );
        }
    }

    onMouseMove(event) {
        if (this.isAnyControlActive()) {
            this.updateMousePoint(event);
            this.updateGeometry();
        }
    }

    // Getters

    getCurrentGroundSize() {
        return parseFloat(this.currentGroundSize.toFixed(3));
    }

    getGroundSizeLimits() {
        return {
            min: parseFloat((Math.max(
                GROUND_SIZE_LIMITS.MIN,
                this.stage.getImageDimensions().width * (1 - GROUND_SIZE_LIMITS.ALLOWED_DEVIATION),
            )).toFixed(3)),
            max: parseFloat((Math.min(
                GROUND_SIZE_LIMITS.MAX,
                this.stage.getImageDimensions().width * (1 + GROUND_SIZE_LIMITS.ALLOWED_DEVIATION),
            )).toFixed(3)),
        };
    }

    getValidationError() {
        return this.validationError;
    }

    isAnyControlActive() {
        return this.currentlyActiveControl !== '';
    }

    static getInstance() {
        return customImageEditorManagerInstance;
    }

    static destroyInstance() {
        customImageEditorManagerInstance = null;
    }
}

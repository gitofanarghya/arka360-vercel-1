import * as THREE from 'three';
import * as utils from '../utils/utils';
import Table from '../objects/subArray/Table';
import Panel from '../objects/subArray/Panel';
import PolygonModel from '../objects/model/PolygonModel';
import Subarray from '../objects/subArray/Subarray';
import CylinderModel from '../objects/model/CylinderModel';
import Walkway from '../objects/model/Walkway';
import { VISUAL_STATES } from '../objects/visualConstants';
import { INVALID_PROPERTIES_FOR_TABLE_ERROR } from '../coreConstants';
import Tree from '../objects/model/Tree';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import DCDB from '../objects/ac/DCDB';
import TextBox from '../objects/subObjects/TextBox';
import Dormer from '../objects/model/smartroof/Dormer';
import CombinerBox from '../objects/ac/CombinerBox';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import HippedDormer from '../objects/model/smartroof/dormers/HippedDormer';
import GabledDormer from '../objects/model/smartroof/dormers/GabledDormer';
import FlatDormer from '../objects/model/smartroof/dormers/FlatDormer';
import Gazebo from '../lib/PowerGazebo';

export default class PlaceManager {
    constructor(stage) {
        this.stage = stage;

        this.mousePoint = new THREE.Vector3();
        this.canvas = stage.rendererManager.getDomElement();
        this.currentPlacingObjects = null;
        this.offsetVector = new THREE.Vector2(0, 0);

        this.onClickHandler = () => {};
        this.onCancelHandler = () => {};
        this.handleClickEvent = true;
        this.mouseMovesIndex = undefined;

        this.validationError = null;

        this.enabled = false;
    }

    enable() {
        if (!this.enabled) {
            // this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.stage.eventHandler.addEvent(this.onMouseMove.bind(this));
            this.mouseMovesIndex = this.stage.eventHandler.getIndex();

            if (this.handleClickEvent) {
                this.canvas.addEventListener('click', this.onClick, false);
            }
            this.enabled = true;
            this.currentParents = [];
            this.objectsErrored = [];
            this.stage.visualManager.updateVisualsForEditing(true);
        }
        else {
            console.error('ERROR: PlaceManager: Cannot enable placing - Placing already enabled');
        }
    }

    disable() {
        if (this.enabled) {
            this.stage.eventHandler.removeEvent(this.mouseMovesIndex);
            // this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
            if (this.handleClickEvent) {
                this.canvas.removeEventListener('click', this.onClick, false);
            }

            this.enabled = false;

            this.stage.visualManager.updateVisualsForEditing(false);
            for (let placingObjectParentIdx = 0;
                placingObjectParentIdx < this.currentParents.length; placingObjectParentIdx += 1) {
                if (this.currentParents[placingObjectParentIdx] !== null &&
                        this.currentParents[placingObjectParentIdx] !== undefined) {
                    this.currentParents[placingObjectParentIdx]
                        .switchVisualState(VISUAL_STATES.DEFAULT, false);
                }
            }
        }
        else {
            console.error('ERROR: PlaceManager: Cannot disable placing - Placing already disabled');
        }
    }

    reset() {
        this.mousePoint = new THREE.Vector3();

        this.currentPlacingObjects = null;
        this.onClickHandler = () => {};
        this.onCancelHandler = () => {};

        this.handleClickEvent = true;

        this.validationError = null;
    
        this.offsetVector = new THREE.Vector2(0, 0);
    }

    initialize(
        objects, onClickHandler, onCancelHandler,
        offsetX = 0, offsetY = 0, { moveWithOffset } = { moveWithOffset: false },
        { handleClickEvent } = { handleClickEvent: true },
        { duplicateMode } = { duplicateMode: false },
    ) {
        if (!Array.isArray(objects)) {
            objects = [objects];
        }
        else if (objects.length === 0) {
            return;
        }
        for (let i = 0, len = objects.length; i < len; i += 1) {
            if (!this.isPlacableInstance(objects[i])) {
                return;
            }
        }
        this.handleClickEvent = handleClickEvent;

        // Enable placing
        this.enable();

        this.currentPlacingObjects = objects;
        this.onClickHandler = onClickHandler;
        this.onCancelHandler = onCancelHandler;

        // Get max height in the scene and add a margin of 5 to ensure placing is always on top
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        this.initializeSnapForPlacing(duplicateMode);

        this.offsetVector = new THREE.Vector2(offsetX, offsetY);
        if (moveWithOffset) {
            const moveVector = utils.getCentroidOfObjects(this.currentPlacingObjects)
                .sub(this.stage.mousePoint.clone());
            this.movePlacingObjects(
                -moveVector.x + this.offsetVector.x,
                -moveVector.y + this.offsetVector.y,
                highestZ,
            );
        }

        // disable selection controls
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();

        this.stage.viewManager.disableDimensions();
    }

    initializeSnapForPlacing(duplicateMode) {
        if (this.currentPlacingObjects.length === 1 &&
            !(this.currentPlacingObjects[0] instanceof Table)) {
            this.stage.snapManager.initialize(
                this.currentPlacingObjects[0],
                null,
                { mirrorMode: false },
                { duplicateMode },
            );
        }
        else {
            this.stage.snapManager.initialize(
                this.currentPlacingObjects,
                this.getPositionForObjects(),
            );
        }
    }

    updateParentsAndErrors() {
        for (let i = 0; i < this.currentPlacingObjects.length; i += 1) {
            const placingInformation = this.currentPlacingObjects[i].getPlacingInformation();
            this.currentPlacingObjects[i].updateWhilePlacing(placingInformation);

            if (placingInformation.errors.length !== 0 && !this.objectsErrored[i] ||
                this.validationError !== null) {
                this.objectsErrored[i] = true;
                this.currentPlacingObjects[i].switchVisualState(VISUAL_STATES.ERROR, true);

                if (this.currentParents[i] !== null && this.currentParents[i] !== undefined) {
                    this.currentParents[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
                }
            }
            else if (placingInformation.errors.length === 0) {
                if (this.objectsErrored[i]) {
                    this.objectsErrored[i] = false;
                    this.currentPlacingObjects[i].switchVisualState(VISUAL_STATES.DEFAULT, true);
                }
                this.currentPlacingObjects[i].switchVisualState(VISUAL_STATES.SELECT, false);
            }

            if (placingInformation.parent !== undefined && placingInformation.parent !== null && placingInformation.parent !== -1) {
                const { parent } = placingInformation;

                if (this.currentParents[i] !== null && this.currentParents[i] !== undefined &&
                    this.currentParents[i] !== parent) {
                    if (this.currentPlacingObjects[i] instanceof CylinderModel ||
                        this.currentPlacingObjects[i] instanceof PolygonModel) {
                        if (this.currentPlacingObjects[i]
                            .updateCurrentlyLockedParameter(placingInformation.tiltAndHeights)) {
                            this.stage.eventManager
                                .setObjectsSelected([this.currentPlacingObjects[i]]);
                        }
                    }

                    if (this.currentPlacingObjects[i] instanceof Table) {
                        if (this.currentPlacingObjects[i].getSubarray() instanceof Gazebo) {
                            this.currentPlacingObjects[i].updateWhileHovering(this.currentParents[0], parent, true);
                        }
                    }

                    this.currentParents[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
                }
                parent.switchVisualState(VISUAL_STATES.PARENT, false);

                this.currentParents[i] = parent;
            }
        }
    }

    updatePropertiesValidationError(isValid) {
        if (isValid) {
            this.validationError = null;
        }
        else {
            if (this.currentPlacingObjects[0] instanceof Table) {
                this.validationError = new Error(INVALID_PROPERTIES_FOR_TABLE_ERROR);
                this.currentPlacingObjects[0].switchVisualState(VISUAL_STATES.ERROR, true);
            }
        }
    }

    movePlacingObjects(deltaX = 0, deltaY = 0, deltaZ = 0) {
        for (let i = 0, len = this.currentPlacingObjects.length; i < len; i += 1) {
            this.currentPlacingObjects[i].moveObject(deltaX, deltaY, deltaZ);
        }
        // Jugaad
        this.stage.duplicateManager.moveDuplicates(deltaX, deltaY);
    }

    onMouseMove = (event) => {
        this.mousePoint = this.stage.snapManager.objectSnap(event);

        const objectPosition = this.getPositionForObjects();
        const deltaX = this.mousePoint.x - objectPosition.x;
        const deltaY = this.mousePoint.y - objectPosition.y;

        this.movePlacingObjects(deltaX, deltaY);

        this.updateParentsAndErrors();
    };

    onClick = async (event) => {
        if ((event.type === 'click' && !event.ctrlKey && !event.metaKey) || event.type === 'paste') {
            if (this.validationError !== null) {
                this.stage.eventManager
                    .customErrorMessage(this.validationError.message);
                return;
            }
            
            // Disable Placing
            this.disable();

            // Call onClick handler of current placing object
            try{
                await this.onClickHandler();
            }
            catch(error){
                this.stage.eventManager.customErrorMessage(error.message);
                this.onCancel();
                return;
            }

            // Reset all assigned variables
            this.reset();

            // UnInitialize snap manager
            this.stage.snapManager.unInitialize();

            // enable selection controls
            this.stage.selectionControls.enable();
            this.stage.dragControls.enable();

            // update Event Manager
            this.stage.eventManager.setPlaceObjectComplete();

            this.stage.viewManager.enableDimensions();
        }
    };

    onCancel() {
        // Disable Placing
        this.disable();

        // Call Cancel handler of current placing object
        this.onCancelHandler();

        // Reset all assigned variables
        this.reset();

        // enable selection controls
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();

        // UnInitialize snap manager
        this.stage.snapManager.unInitialize();

        this.stage.viewManager.enableDimensions();
    }

    isPlacableInstance(object) {
        if (object instanceof Table
            || object instanceof Panel
            || object instanceof PolygonModel
            || object instanceof Dormer
            || object instanceof CylinderModel
            || object instanceof Subarray
            || object instanceof Walkway
            || object instanceof Tree
            || object instanceof Inverter
            || object instanceof CombinerBox
            || object instanceof ACDB
            || object instanceof DCDB
            || object instanceof TextBox
            || object instanceof HippedDormer
            || object instanceof GabledDormer
            || object instanceof FlatDormer
            || object instanceof SmartroofModel) {
            return true;
        }
        console.error('ERROR: PlaceManager: object not of placable instance');
        return false;
    }

    getPositionForObjects() {
        if( this.currentPlacingObjects[0] instanceof Dormer){
            return this.currentPlacingObjects[0].outlinePoints[2].getPosition();
        }
        return utils.getCentroidOfObjects(this.currentPlacingObjects).sub(this.offsetVector);
    }

    isEnabled() {
        return this.enabled;
    }

    getValidationError() {
        return this.validationError;
    }
}

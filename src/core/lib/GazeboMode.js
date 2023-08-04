import Row from "../objects/subArray/Row";
import Table from "../objects/subArray/Table";
import * as sapPaneAssistant from '../../componentManager/sapPaneAssistant';
import Mousetrap from "mousetrap";
import { v4 } from "uuid";
import { CREATED_STATE, TEMP_STACK_USED_BY_EDIT_MODE } from "../coreConstants";
import { utilityMeterList } from "../sld/sldConstants";
import Gazebo from "./PowerGazebo";
import * as utils from '../../core/utils/utils';
import SmartroofFace from "../objects/model/smartroof/SmartroofFace";
import { VISUAL_STATES } from "../objects/visualConstants";

export default class GazeboMode {
    constructor(stage) {
        this.stage = stage;
        this.isMouseDown = true;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;
        this.gazeboProperties = null;
        this.startingParent = null;
        this.currentGazeboTable = null;
        this.currentGazebo = null;
        this.isClicked = false;
        this.enable = false;
        this.gazebos = [];
        this.intersectingGazebosRemoved = [];
    }
    /**
     * Initializing the Gazebo Mode
     * @param {*} gazeboProperties 
     * @param {*} startingParent 
     */
    initGazeboMode(gazeboProperties = null, startingParent = null) {
        this.enable = true;
        // to deselct all the pervious selected things
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.isMouseDown = true;
        this.stage.stateManager.startTempStack(TEMP_STACK_USED_BY_EDIT_MODE);
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        this.stage.dragControls.domElement.style.cursor = 'crosshair';
        this.stage.visualManager.updateVisualsForEditing(true);

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();
        this.stage.viewManager.disableDimensions();

        if (gazeboProperties !== null) {
            this.gazeboProperties = gazeboProperties;
        }
        if (startingParent !== null) {
            this.startingParent = startingParent;
        }
        else {
            this.startingParent = this.stage.ground;
        }

        this.currentGazeboTable = this.createNewGazeboTable();
        this.stage.eventManager.addGazeboMode(this.currentGazebo);
        this.currentParents = [];
        this.objectsErrored = [];
        
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;

        this.currentGazeboTable.moveObject(this.stage.mousePoint.x, this.stage.mousePoint.y, highestZ);
        this.stage.eventHandler.addEvent(this.onMouseMove);
        this.mouseMoveIndex = this.stage.eventHandler.getIndex();
        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseUp, false);
    }
    /**
     * adding the placed table to gazebo 
     * and gazebo to gazebo array
     * @param {*} newGazebo 
     */
    addTableToNewGazebo(newGazebo) {
        if (newGazebo.getSubarray().tableSizeUp === '' || newGazebo.getSubarray().tableSizeUp === 0 ||
            newGazebo.getSubarray().tableSizeWide === '' || newGazebo.getSubarray().tableSizeWide === 0) {
            this.stage.eventManager.tableEmptyError();
            newGazebo.removeObject();
            this.stage.stateManager.stopContainer({ discard: true });
        }
        else {
            try {
                this.gazeboProperties = newGazebo.getSubarray().getState();
                const tablePlaced = newGazebo.placeObjectForAddTable();
                if (!(tablePlaced instanceof Error) && tablePlaced.isSuccess) {
                    newGazebo.getSubarray().getTableDimensions(true);
                    newGazebo.getPosition(true);
                    newGazebo.getSubarray().getBoundingBox(true);
                    newGazebo.getParent().updateLocalBoundingBox();
                    newGazebo.updateVisualsAfterLoadingAndCreation();
                    this.startingParent = newGazebo.getSubarray().getParent();
                    this.gazebos.push(newGazebo.getSubarray());
                }
            }
            catch (error) {
                this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
                this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
                console.error('ERROR: GazeboMode: Cannot Add Gazebo', error);
            }
        }
    }
    /**
     * creating new gazebo and gazebo table
     * and adding the gazebo table into gazebo
     * @returns new gazebo table
     */
    createNewGazeboTable() {
        const newGazebo = this.createNewGazebo();
        this.currentGazebo = newGazebo;
        const templateTableMap = newGazebo.getTemplateTableMap({ withBBox: true });
        templateTableMap.hidden = false;
        templateTableMap.isMoved = true;
        const newTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
        newTable.showIndividualMesh();
        newTable.clickToAdd = true;
        newGazebo.getChildren()[0].addChild(newTable);
        // updating the panels id for the gazebo as the table
        // was added without updating the ids of panels
        const panels = newTable.getChildren();
        for (let i = 0, l = panels.length; i < l; i += 1) {
            panels[i].setId(newGazebo.getPanelId());
        }
        return newTable;
    }
    /**
     * creating new gazebo from powergazebo class
     * and changing its properties
     * @returns new Gazebo
     */
    createNewGazebo() {
        const newGazebo = new Gazebo(this.stage);
        this.startingParent.addChild(newGazebo);
        newGazebo.associatedModel = this.startingParent;
        newGazebo.createBoundaryFromParent();
        newGazebo.addTableFlow = true;
        if (this.gazeboProperties !== null) {
            newGazebo.changePropertiesDuringCreation(this.gazeboProperties);
            newGazebo.createBoundaryFromParent();
        }

        const rowMap = {
            id: 0,
            frames: [],
        };
        const row = new Row(this.stage, rowMap, { withoutContainer: false }, true);
        newGazebo.addChild(row);
        row.saveState({ withoutContainer: false });
        newGazebo.addTableMode = true;
        return newGazebo;
    }
    /**
     * removing the gazebo after oncomplete called
     * and saving the state of the gazebos.
     * @param {*} newTable 
     */
    cancelAddTableToNewGazebo(newTable) {
        this.enable = false;
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
        this.stage.stateManager.stopTempStack();
        this.stage.stateManager.startContainer();
        this.intersectingGazebosRemoved.forEach(ele => {
            ele.GazeboRemoved.forEach((gazebo) => {
                if (gazebo instanceof Gazebo) {
                    gazebo.addTableMode = false;
                    gazebo.showMergedMeshes();
                    gazebo.removeObject();
                }
            });
            ele.subarrayToBeUpdated.forEach(subarray => subarray.removeObject());
        })

        this.gazebos.forEach((gazebo) => {
            gazebo.addTableMode = false;
            if (gazebo.getChildren().length !== 0) {
                gazebo.saveState();
                gazebo.getChildren()[0].saveState();
                gazebo.getChildren()[0].getChildren()[0].saveState();
                // save states of the panels undo was not working
                gazebo.getChildren()[0].getChildren()[0].getChildren().forEach((panel) => {
                    panel.saveState();
                })
            }
            gazebo.mergeGeometriesForAllPanels();
            gazebo.hideIndividualPanelMeshes();
        });

        if (newTable.parent && newTable.getChildren() && newTable.getChildren().length > 0) {
            newTable.removeObject();
        }
        this.stage.stateManager.stopContainer();
        this.resetAddTableMode();
        this.stage.eventManager.setPlaceObjectComplete();
    }

    onComplete() {
        this.isMouseDown = false;
        this.cancelAddTableToNewGazebo(this.currentGazeboTable);
        this.stage.dragControls.domElement.style.cursor = 'default';

        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseUp, false);

        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.viewManager.enableDimensions();
        this.stage.eventManager.setPlaceObjectComplete();

        this.stage.eventHandler.removeEvent(this.mouseMoveIndex);

    }

    onCancel() {
        this.currentGazeboTable.removeObject();
        this.cancelAddTableToNewGazebo(this.currentGazeboTable);
        
        this.stage.dragControls.domElement.style.cursor = 'default';
        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseUp, false);
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this);
        this.stage.viewManager.enableDimensions();

        this.stage.eventHandler.removeEvent(this.mouseMoveIndex);
    }

    resetAddTableMode() {
        this.canvas.removeEventListener('click', this.onClick, false);
        this.gazebos = [];
        this.intersectingGazebosRemoved = [];
        this.gazeboProperties = null;
        this.startingParent = null;
        this.tablesRemovedFromScene = [];
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
    }

    onMouseMove = async (event) => {
        if (this.isClicked) {
            this.mousePoint = this.stage.mousePoint.clone();
            this.currentGazeboTable.hideObjectLayer();
        }
        const objectPosition = this.getPositionForObjects();
        /**
         * to move the gazebo according to mouse point
         * {*} deltaX : x axis distance  between gazebo & mouse point
         * {*} deltaY : y axis distance  between gazebo & mouse point
         */
        const deltaX = this.stage.mousePoint.x - objectPosition.x;
        const deltaY = this.stage.mousePoint.y - objectPosition.y;
        this.currentGazeboTable.moveObject(deltaX, deltaY, 0);
        this.stage.duplicateManager.moveDuplicates(deltaX, deltaY); 

        this.stage.visualManager.updateVisualsForEditing(true);
        this.updateParentsAndErrors();
        // this.currentGazeboTable.saveState();
        // console.log('this.currentGazeboTable.saveState(): ', this.currentGazeboTable.saveState());
        
    }
    /**
     * while hovering the gazebo checking the whether it is placable.
     * showing error/red color base on the placing information.
     */
    updateParentsAndErrors() {
        const placingInformation = this.currentGazeboTable.getPlacingInformation();

        if (placingInformation.errors.length !== 0 && !this.objectsErrored[0]) {
            this.objectsErrored[0] = true;
            this.currentGazeboTable.switchVisualState(VISUAL_STATES.ERROR, true);

            if (this.currentParents[0] !== null && this.currentParents[0] !== undefined && !this.isClicked) {
                this.currentParents[0].switchVisualState(VISUAL_STATES.DEFAULT, false);
            }
        }
        else if (placingInformation.errors.length === 0) {
            if (this.objectsErrored[0]) {
                this.objectsErrored[0] = false;
                this.currentGazeboTable.switchVisualState(VISUAL_STATES.DEFAULT, true);
            }
            this.currentGazeboTable.switchVisualState(VISUAL_STATES.SELECT, false);
        }

        else if (this.isClicked) {
            if (placingInformation.parent !== undefined && placingInformation.parent !== null) {
                const { parent } = placingInformation;
                if (this.currentParents[0] != parent) {
                    this.prevTable = null;
                    this.objectsErrored[0] = true;
                    this.currentGazeboTable.switchVisualState(VISUAL_STATES.ERROR, true);
                }
                else {
                    if (this.prevTable == null) {
                        this.currentGazeboTable.updateWhileHovering(this.currentParents[0], parent);
                        this.currentParents[0].switchVisualState(VISUAL_STATES.DEFAULT, false);

                        this.prevTable = this.currentGazeboTable;
                        this.position = this.prevTable.getPosition();
                        this.currentGazeboTable = this.createNewGazeboTable();

                        this.currentGazeboTable.showTable();
                    }
                }
            }
        }

        if (placingInformation.parent !== undefined && placingInformation.parent !== null) {
            const { parent } = placingInformation;
            if (this.currentParents[0] != parent) {
                this.currentParent = parent;
                this.currentGazeboTable.updateWhileHovering(this.currentParents[0], parent, true);
            }
            if (this.currentParents[0] !== null && this.currentParents[0] !== undefined &&
                this.currentParents[0] !== parent) {
                this.currentParents[0].switchVisualState(VISUAL_STATES.DEFAULT, false);
            }
            if (!this.isClicked) {
                parent.switchVisualState(VISUAL_STATES.PARENT, false);
                this.objectsErrored[0] = false;
                this.currentParents[0] = parent;
            }
            this.currentGazeboTable.showTable();
        }
    }

    mouseDown = async (event) => {
        this.switchMode = false;
        this.isClicked = true;
        this.snapping = true;
        this.prevTable = this.currentGazeboTable;
        this.intersectingGazebosRemoved.push(this.currentGazeboTable.getIntersectedTableWithoutRemoving(true));
        this.position = this.prevTable.getPosition();
        this.addTableToNewGazebo(this.currentGazeboTable);
        this.currentGazeboTable = this.createNewGazeboTable();
        this.stage.eventManager.addGazeboMode(this.currentGazebo);
    }

    mouseUp = async (event) => {
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        const objectPosition = this.getPositionForObjects();
        const deltaX = this.stage.mousePoint.x - objectPosition.x;
        const deltaY = this.stage.mousePoint.y - objectPosition.y;
        this.currentGazeboTable.moveObject(deltaX, deltaY, highestZ);

        this.currentGazeboTable.showObjectLayer();
        this.isClicked = false;
        this.snapping = true;
        this.stage.eventManager.addGazeboMode(this.currentGazebo);
    }

    getPositionForObjects() {
        if (!Array.isArray(this.currentGazeboTable)) {
            return utils.getCentroidOfObjects([this.currentGazeboTable]);
        }
        else {
            return utils.getCentroidOfObjects(this.currentGazeboTable);
        }
    }
}
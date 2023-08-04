import * as THREE from 'three';
import { v4 } from 'uuid';
import * as raycastingUtils from '../utils/raycastingUtils';
import * as utils from '../utils/utils';
import { getSubarrays } from '../utils/exporters';
import Panel from '../objects/subArray/Panel';
import Table from '../objects/subArray/Table';
import Row from '../objects/subArray/Row';
import { COLOR_MAPPINGS, MATERIAL_STATES, THICK_BORDER_OUTLINE_POINT_IMAGE_URL, VISUAL_STATES } from '../objects/visualConstants';
import Subarray from '../objects/subArray/Subarray';
import {
    ADD_EAST_TABLE,
    ADD_EW_TABLE,
    ADD_WEST_TABLE,
    CREATED_STATE,
    DELETED_STATE,
    PANEL_ORIENTATION_LANDSCAPE,
    SUBARRAY_RACK_STYLE_EWRACKING,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    TEMP_STACK_USED_BY_EDIT_MODE,
} from '../coreConstants';

// import { VISUAL_STATES } from '../objects/visualConstants';
import { InstancedBufferGeometry, Vector3 } from 'three';
import Mousetrap from 'mousetrap';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import InstancedTable from '../objects/subArray/InstancedTable';
import EastWestRack from './EastWestRacking';

export default class AddTableMode {
    constructor(stage) {
        this.stage = stage;
        this.selectedPanels = [];
        this.subarrays = [];
        this.subarrayProperties = null;
        this.startingParent = null;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;
        this.tablesRemovedFromScene = [];
        this.instancedTable = null;
        this.mousePoint = new THREE.Vector3();
        this.isClicked = false;
        this.deleteMode = false;
      
        this.meshMaterial = new THREE.MeshBasicMaterial({
            transparent: false,
            color: COLOR_MAPPINGS
                .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });

        this.switchMode = false;
        this.flag = new THREE.Object3D()
        this.instancedTable = null;
        this.count = 0;
        this.instancedTable = null;
        this.dragStartParent = null;

    }

    /**
     * Initialize the table based on given subarray properties
     * @param {subarrayProperties} subarrayProperties 
     * @param {THREE.Object3D} startingParent 
     */
    initAddTableMode(subarrayProperties = null, startingParent = null, tableType = null) {
        this.stage.stateManager.startTempStack(TEMP_STACK_USED_BY_EDIT_MODE);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.stage.dragControls.domElement.style.cursor = 'crosshair';
        this.stage.visualManager.updateVisualsForAddTableMode(true);
        this.deleteMode = false;

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();
        this.stage.viewManager.disableDimensions();

        if (subarrayProperties !== null) {
            this.subarrayProperties = subarrayProperties;
        }

        if (startingParent !== null) {
            this.startingParent = startingParent;
        } else {
            this.startingParent = this.stage.ground;
        }
        if (!this.instancedTable) {
            this.instancedTable = new InstancedTable(this.stage, this.subarrayProperties, this.startingParent, tableType);
        } else {
            this.instancedTable.currentTableId = this.instancedTable.currentInstancedMesh.instanceCount;
            this.instancedTable.currentInstancedMesh.setInstanceCount(this.instancedTable.currentTableId + 1)
        }

        this.initializeSnapForPlacing(this.instancedTable);

        this.stage.eventManager.addTableMode(this.instancedTable);

        this.currentParents = [];
        this.objectsErrored = [];

        this.stage.eventHandler.mouseMoves.push(this.onMouseMove);
        this.mouseMoveIndex = this.stage.eventHandler.mouseMoves.length - 1;
        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseUp, false);
        Mousetrap.bind('shift+d', () => {
            this.initDeleteTableMode();
        });
        notificationsAssistant.longInfo({
            title: 'Table Add Mode',
            message: 'Press shift + D to delete table, \n Hold Alt to disable Snapping',
        });
    }

    initDeleteTableMode() {
        this.stage.dragControls.domElement.style.cursor = 'default';
        this.stage.snapManager.unInitialize();

        this.instancedTable.deleteMouseTable();

        this.deleteMode = true;
        notificationsAssistant.longInfo({
            title: 'Delete Table Mode',
            message: 'Press A to add table',
        });
        Mousetrap.bind('a', () => {
            this.stage.eventHandler.mouseMoves.splice(this.mouseMoveIndex, 1);
            this.stage.selectionControls.enable();
            this.initAddTableMode();
        });
        Mousetrap.unbind('shift+d');
    }

    initializeSnapForPlacing(newTable) {
        this.stage.snapManager.initialize(
            newTable,
        );
    }

    onMouseMove = async(event) => {
        if (this.isClicked) {
            if (this.deleteMode) {
                this.instancedTable.deleteTable(event);
            } else {
                this.mousePoint = utils
                    .getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
                this.mousePoint = this.instancedTable.getSnappedPosition(this.mousePoint);
                this.instancedTable.mouseMoveErrorHandling(event, this.mousePoint);
                this.instancedTable.movePlaceTable(this.mousePoint.x, this.mousePoint.y);
                if ((!this.prevMouspoint)|| this.prevMouspoint.distanceTo (this.mousePoint) > 0.5){
                    this.prevMouspoint = this.mousePoint;
                    this.instancedTable.placeTable(this.mousePoint, event);
                }
            }
            this.mousePoint = this.stage.mousePoint.clone();
        }
        if (!this.deleteMode && !this.isClicked) {
            this.mousePoint = this.stage.snapManager.objectSnap(event);
            this.instancedTable.movePlaceTable(this.mousePoint.x, this.mousePoint.y);
            this.instancedTable.mouseMoveErrorHandling(event);
            // this.stage.visualManager.updateVisualsForEditing(true);
        }
    }

    mouseDown = async(event) => {
        if (this.deleteMode) {
            this.isClicked = true;
            this.instancedTable.deleteTable(event);
        } else if (event.which === 3) {
            this.switchMode = true;
            this.instancedTable.instanceTablePanelOrientation();
            this.instancedTable.movePlaceTable(this.mousePoint.x, this.mousePoint.y);
        } else {
            this.instancedTable.setStartParent();
            this.instancedTable.placeTable(this.mousePoint, event);
            if(!this.instancedTable.isDragged){
                this.instancedTable.getSnappedPosition(this.mousePoint, true)
            }
            this.instancedTable.isDragged = true;
            this.switchMode = false;
            this.isClicked = true;
            this.snapping = true;
        }
    }

    mouseUp = async(event) => {
        if (!this.deleteMode) {
            this.initializeSnapForPlacing(this.instancedTable);
        }
        this.isClicked = false;
        this.snapping = true;
        this.instancedTable.isDragged = false;
    }

    onCompleteAddTableMode() {
        if (!this.deleteMode) {
            this.instancedTable.deleteMouseTable();
        }
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
        this.stage.stateManager.stopTempStack();
        this.stage.eventManager.setPlaceObjectComplete();
        this.resetAddTableMode();
        this.instancedTable.unbindSnapFunctions();
        try {
            if (this.instancedTable.getSubarray().mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
                if (this.instancedTable.tableType === ADD_EW_TABLE || this.instancedTable.tableType === null)
                    this.instancedTable.convertInstancedMeshToEastWestSubarray();
                else
                this.instancedTable.convertInstancedMeshToEast_OR_WestSubarray(this.instancedTable.tableType);
            }
            else {
                this.instancedTable.convertInstancedMeshToSubarray();
            }
        } catch (error) {
            console.log(error);
            notificationsAssistant.error({
                title: 'Add Table Mode',
                message: 'Error placing table',
            });
            this.stage.stateManager.stopContainer();
            this.instancedTable.removePlacedInstancedMeshes();
        }
        this.instancedTable = null;
        this.stage.dragControls.domElement.style.cursor = 'default';

        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseUp, false);

        Mousetrap.unbind('shift+d');

        this.stage.duplicateManager.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.selectionControls.enable();
        this.stage.viewManager.enableDimensions();
        this.stage.snapManager.unInitialize();
        this.stage.eventHandler.mouseMoves.splice(this.mouseMoveIndex, 1);
        this.snapping = false;
    }

    resetAddTableMode() {
        this.canvas.removeEventListener('click', this.onClick, false);
        this.subarrays = [];
        this.subarrayProperties = null;
        this.startingParent = null;
        this.tablesRemovedFromScene = [];
        this.stage.visualManager.updateVisualsForAddTableMode(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
    }

}
import * as THREE from 'three';
import { v4 } from 'uuid';
import * as raycastingUtils from '../utils/raycastingUtils';
import * as utils from '../utils/utils';
import { getSubarrays } from '../utils/exporters';
import Panel from '../objects/subArray/Panel';
import Table from '../objects/subArray/Table';
import Row from '../objects/subArray/Row';
import Subarray from '../objects/subArray/Subarray';
import Inverter from '../objects/ac/Inverter';
import {
    CREATED_STATE,
    DELETED_STATE,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    TEMP_STACK_USED_BY_EDIT_MODE,
    HIGH_PANEL_COVERAGE_AREA,
} from '../coreConstants';
import { VISUAL_STATES } from '../objects/visualConstants';
import { Vector3 } from 'three';
import Mousetrap from 'mousetrap';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { PANEL_SELECTION_DROPDOWN_MENU_CLASS_NAME } from '../../componentManager/componentManagerConstants';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import * as notificationAssistant from '../../componentManager/notificationsAssistant';
import Gazebo from './PowerGazebo';

export default class EditMode {
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
        this.currentTable = null;
        this.mousePoint = new THREE.Vector3();
        this.isClicked = false;
        this.deleteMode = false;
        this.allTables = [];
        this.switchMode = false;
        this.isMouseDown = false;

        // add inverter variables
        this.inverterSpecification = null;
        this.linkedSubarray = null;
        this.addInverterMode = false;
        this.preInverter = null;
        this.addedInverterInSeen = false;
        this.mouseMoveIndex = null;
    }

    enable() {
        if(!this.stage.visualManager.in3D){
            this.stage.visualManager.updateVisualsForEditing(true);
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.viewManager.disableDimensions();
        }
    }

    disable() {
        for (let i = 0, l = this.selectedPanels.length; i < l; i += 1) {
            this.selectedPanels[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
            // oncancel To hide mesh and update the subarraymesh
            if (this.selectedPanels[i].getParent() !== null) {
                this.selectedPanels[i].getParent().hideIndividualMesh();
                this.selectedPanels[i].getSubarray().mergeGeometriesForAllPanels();
            }
        }
        this.selectedPanels = [];
        this.canvas.removeEventListener('mousedown', this.panelDeleteMode, false);
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.viewManager.enableDimensions();
    }

    // panel delete mode functions

    initDeletePanelMode() {
        this.selectedPanels = [];
        this.canvas.addEventListener('mousedown', this.panelDeleteMode, false);
    }

    initDeleteTableMode() {
        this.stage.dragControls.domElement.style.cursor = 'default';
        this.stage.snapManager.unInitialize();
        this.snapping = false;
        this.currentTable.removeObject();

        this.allTables = [];

        utils.getAllTables(this.stage.ground, this.allTables);
        this.deleteMode = true;
        notificationsAssistant.longInfo({
            title: 'Delete Table Mode',
            message: 'Press Shift + T to add table',
        });
        Mousetrap.bind('shift+t', () => {
            this.stage.eventHandler.removeEvent(this.mouseMoveIndex);
            this.stage.selectionControls.enable();
            this.initAddTableMode();
        });
        Mousetrap.unbind('shift+d');
    }

    deleteTable() {
        for (let i = 0; i < this.allTables.length; i++) {
            const bBox = this.allTables[i].get2DVertices();
            if (utils.inspectPointInsideVertices(bBox, this.mousePoint)) {
                const subarray = this.allTables[i].getSubarray();
                this.allTables[i].removeObject();
                subarray.mergeGeometriesForAllPanels();
                break;
            }
        }
    }

    panelDeleteMode = (event) => {
        if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
            if (!this.stage.textSelectionControls.deSelectSelectedTextObject()) {
                return;
            }
            const intersectingObject = raycastingUtils.getTopObjectOnClick(event, this.stage);
            if (!(intersectingObject instanceof Gazebo)){
                if (intersectingObject instanceof Subarray || intersectingObject instanceof Panel ) {
                    // TODO: Handle unlinking of deleted objects.
                    // if (intersectingObject instanceof Subarray && intersectingObject.eastWestRackingEnabled) {
                    //     return;
                    // }
                    let nearestPanel = intersectingObject;
                    if (intersectingObject instanceof Subarray) {
                        const clickPosition =
                            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
                        const nearestTable = intersectingObject.getNearestTableToPoint(clickPosition);
                        if (!utils.checkPointInsideVertices(nearestTable.get2DVertices(), [clickPosition.x, clickPosition.y])) {
                            return;
                        }
                        nearestPanel = nearestTable.getNearestPanelToPoint(clickPosition);
                    }
                    if (this.selectedPanels.indexOf(nearestPanel) < 0) {
                        nearestPanel.switchVisualState(VISUAL_STATES.DELETE_MODE, false);
                        this.selectedPanels.push(nearestPanel);
                        this.updateSubarrayMesh(nearestPanel);
                        nearestPanel.getParent().showIndividualMesh();
                    } else {
                        nearestPanel.switchVisualState(VISUAL_STATES.DEFAULT, false);
                        this.selectedPanels.splice(this.selectedPanels.indexOf(nearestPanel), 1);
                        this.updateSubarrayMesh(nearestPanel);
    
                        let sibilingExist = false;
                        for (let i = 0, l = this.selectedPanels.length; i < l; i += 1) {
                            if (this.selectedPanels[i].getParent() === nearestPanel.getParent()) {
                                sibilingExist = true;
                                break;
                            }
                        }
                        if (!sibilingExist) {
                            nearestPanel.getParent().hideIndividualMesh();
                        }
                    }
    
                }
            }
        }
    }

    updateSubarrayMesh(panel) {
        const excludeTables = [];
        for (let i = 0, l = this.selectedPanels.length; i < l; i += 1) {
            excludeTables.push(this.selectedPanels[i].getParent());
        }

        panel.getSubarray().mergeGeometriesForAllPanels({ excludeTables });
    }

    onCompleteDeleteMode() {
        const tables = [];
        for (let idx = 0, len = this.selectedPanels.length; idx < len; idx += 1) {
            if (this.selectedPanels[idx].getParent().getChildren().length > 1) {
                const index = this.indexOfTable(tables, this.selectedPanels[idx].getParent());
                if (index < 0) {
                    tables.push({
                        table: this.selectedPanels[idx].getParent(),
                        deletedPanels: [this.selectedPanels[idx]
                            .getParent().getChildren().indexOf(this.selectedPanels[idx])
                        ],
                    });
                } else {
                    tables[index].deletedPanels.push(this.selectedPanels[idx]
                        .getParent().getChildren().indexOf(this.selectedPanels[idx]));
                }
            } else {
                this.selectedPanels[idx].getParent().removeObject();
            }
        }
        for (let i = 0, l = tables.length; i < l; i += 1) {
            tables[i].table.hideIndividualMesh();
        }
        const newSubarrays = [];
        for (let t = 0, l = tables.length; t < l; t += 1) {
            const newTables = [];
            const sizeUp = tables[t].table.getSubarray().tableSizeUp;
            const sizeWide = tables[t].table.getSubarray().tableSizeWide;
            // for each deleted table find the new tables to be formed
            for (let i = 0; i < sizeWide; i += 1) {
                let indices = [];
                for (let j = 0; j < sizeUp; j += 1) {
                    const panelIndex = i + (sizeWide * j);
                    if (tables[t].deletedPanels.indexOf(panelIndex) > -1) {
                        if (indices.length > 0) {
                            newTables.push(indices);
                            indices = [];
                        }
                    } else {
                        indices.push(panelIndex);
                    }
                }
                if (indices.length > 0) {
                    newTables.push(indices);
                }
            }
            // for each new table create/add-to a subarray
            for (let i = 0, len = newTables.length; i < len; i += 1) {
                let x = 0;
                let y = 0;
                let z = 0;
                let total = 0;
                let minZPoint = new THREE.Vector3(0, 0, Infinity);
                for (let idx = 0, { length } = newTables[i]; idx < length; idx += 1) {
                    const vertices = tables[t].table
                        .getChildren()[newTables[i][idx]].get3DVertices();
                    for (let ver of vertices) {
                        x += ver[0];
                        y += ver[1];
                        z += ver[2];
                        total += 1;
                        if (ver[2] < minZPoint.z) {
                            minZPoint = new THREE.Vector3(ver[0], ver[1], ver[2]);
                        }
                    }
                }
                const tablePosition = new THREE.Vector3(x / total, y / total, z / total);
                const parentZPoint = tables[t].table.getSubarray()
                    .getParent().getZOnTopSurface(minZPoint.x, minZPoint.y);
                const mountHeight = parseFloat((minZPoint.z - parentZPoint).toFixed(3));
                const properties = {...tables[t].table.getSubarray().getState() };
                delete properties.name;
                properties.mountHeight = mountHeight;
                properties.tableSizeUp = newTables[i].length;
                properties.tableSizeWide = 1;

                const subarrayIndex = this.checkForSameSubarray(newSubarrays, properties);
                if (subarrayIndex === -1) { // create new Subarray
                    const newSubarray = new Subarray(this.stage);
                    newSubarray.addTableFlow = true;
                    tables[t].table.getSubarray().getParent().addChild(newSubarray);
                    newSubarray.associatedModel = tables[t].table.getSubarray().associatedModel;

                    const rowMap = {
                        id: 0,
                        frames: [],
                        localBBox: {
                            minX: 0,
                            maxX: 0,
                            minY: 0,
                            maxY: 0,
                        },
                    };
                    const row = new Row(this.stage, rowMap, { withoutContainer: false }, false);
                    newSubarray.addChild(row);
                    newSubarray.updateSubarrayForAddTable(properties);
                    newSubarray.rowSpacing = newSubarray.getOptimisedRowSpacing();

                    const tableMap = newSubarray.getTemplateTableMap({ withBBox: true });
                    tableMap.position = tablePosition;
                    const newTable =
                        new Table(this.stage, tableMap, { withoutContainer: false }, true);

                    // fixing ids of the panels
                    const panels = newTable.getChildren();
                    for (let i = 0, l = panels.length; i < l; i += 1) {
                        panels[i].setId(newSubarray.getPanelId());
                    }

                    row.addChild(newTable);
                    newSubarray.createConvexHull();
                    newSubarray.getTableDimensions(true);
                    newTable.getSubarray().getBoundingBox(true);
                    row.updateLocalBoundingBox();

                    newTable.saveState();
                    row.saveState();
                    newSubarray.saveState();
                    newSubarrays.push(newSubarray);
                    newSubarray.validateStructures();
                } else { // add to an existing same subarray
                    const newSubarray = newSubarrays[subarrayIndex];

                    const tableMap = newSubarray.getTemplateTableMap({ withBBox: true });
                    tableMap.position = tablePosition;
                    const newTable =
                        new Table(this.stage, tableMap, { withoutContainer: false }, true);
                    newSubarray.findAndSetNewParentForTable(newTable);

                    // fixing ids of the panels
                    const panels = newTable.getChildren();
                    for (let i = 0, l = panels.length; i < l; i += 1) {
                        panels[i].setId(newSubarray.getPanelId());
                    }

                    newTable.saveState();
                }
            }
            tables[t].table.removeObject();
        }
        for (let i = 0, l = newSubarrays.length; i < l; i += 1) {
            newSubarrays[i].mergeGeometriesForAllPanels();
        }
    }

    checkForSameSubarray(subarrays, properties) {
        for (let i = 0, len = subarrays.length; i < len; i += 1) {
            const properties1 = subarrays[i].getState();
            if (
                properties1.parent === properties.parent &&
                properties1.mountHeight === properties.mountHeight &&
                properties1.tableSizeUp === properties.tableSizeUp &&
                properties1.tilt === properties.tilt &&
                properties1.azimuth === properties.azimuth &&
                properties1.rowSpacingMode === properties.rowSpacingMode &&
                properties1.panelOrientation === properties.panelOrientation &&
                properties1.tableSizeWide === properties.tableSizeWide &&
                properties1.tableSpacing === properties.tableSpacing &&
                properties1.moduleSpacingUp === properties.moduleSpacingUp &&
                properties1.moduleSpacingWide === properties.moduleSpacingWide &&
                properties1.moduleProperties.moduleId === properties.moduleProperties.moduleId &&
                properties1.moduleProperties.moduleMake === properties.moduleProperties.moduleMake &&
                properties1.moduleProperties.moduleSize === properties.moduleProperties.moduleSize &&
                properties1.moduleProperties.moduleLength === properties.moduleProperties.moduleLength &&
                properties1.moduleProperties.moduleWidth === properties.moduleProperties.moduleWidth
            ) {
                return i;
            }
        }
        return -1;
    }

    // Add Table Mode

    initAddTableMode(subarrayProperties = null, startingParent = null) {
        this.isMouseDown = true;
        this.stage.stateManager.startTempStack(TEMP_STACK_USED_BY_EDIT_MODE);
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        this.stage.dragControls.domElement.style.cursor = 'crosshair';
        this.stage.visualManager.updateVisualsForEditing(true);
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

        this.currentTable = this.createNewTable();
        this.stage.eventManager.addTableMode(this.currentTable.getSubarray());

        this.initializeSnapForPlacing(this.currentTable);

        this.currentParents = [];
        this.objectsErrored = [];

        // Get max height in the scene and add a margin of 5 to ensure placing is always on top
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;

        this.currentTable.moveObject(this.mousePoint.x, this.mousePoint.y, highestZ);
        this.stage.eventHandler.addEvent(this.onMouseMove);
        this.mouseMoveIndex = this.stage.eventHandler.getIndex();
        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseUp, false);
        Mousetrap.bind('shift+d', () => {
            this.initDeleteTableMode();
        });
        notificationsAssistant.longInfo({
            title: 'Table Add Mode',
            message: 'Press Shift + D to delete table',
        });
        Mousetrap.unbind('shift+t');
    }

    initializeSnapForPlacing(newTable) {
        this.stage.snapManager.initialize(
            newTable,
            this.getPositionForObjects(),
        );
    }

    getState() {
        const subarrayMaps = [];
        const tablesRemoved = [];
        for (let i = 0, len = this.subarrays.length; i < len; i += 1) {
            subarrayMaps.push(this.subarrays[i].getSubarrayMap());
        }
        for (let i = 0, len = this.tablesRemovedFromScene.length; i < len; i += 1) {
            tablesRemoved.push(this.tablesRemovedFromScene[i]);
        }
        return {
            subarrayMaps,
            tablesRemoved,
        };
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            // removing the subarrays which are in the scene
            // but not in the loading state
            const newSubarraysList = []; // for efficiency
            for (let i = 0, l = this.subarrays.length; i < l; i += 1) {
                const uuid = this.subarrays[i].getUUID();
                let uuidExists = false;
                for (let j = 0, len = state.subarrayMaps.length; j < len; j += 1) {
                    if (uuid === state.subarrayMaps[j].uuid) {
                        uuidExists = true;
                        break;
                    }
                }
                if (uuidExists) {
                    newSubarraysList.push(this.subarrays[i]);
                } else {
                    this.subarrays[i].removeObject();
                    this.stage.snapManager.updateTableGrid();
                }
            }
            this.subarrays = newSubarraysList;

            // adding subarrays which are not there in the scene
            for (let i = 0, l = state.subarrayMaps.length; i < l; i += 1) {
                const uuid = state.subarrayMaps[i].uuid;
                let uuidExists = false;
                for (let j = 0, len = this.subarrays.length; j < len; j += 1) {
                    if (uuid === this.subarrays[j].getUUID()) {
                        uuidExists = true;
                        break;
                    }
                }
                if (!uuidExists) {
                    const newSubarray = new Subarray(this.stage);
                    this.stage.ground.addChild(newSubarray);
                    newSubarray.associatedModel = this.stage.ground;
                    newSubarray.createBoundaryFromParent();
                    newSubarray.addTableFlow = true;
                    newSubarray
                        .updateSubarrayForAddTable(state.subarrayMaps[i]);
                    newSubarray.makeSubarray(state.subarrayMaps[i]);
                    this.subarrays.push(newSubarray);
                }
            }

            // for the other removed tables...
            let removedTablesInPreviousState = fromState.tablesRemoved;
            if (fromState === CREATED_STATE || state === DELETED_STATE) {
                removedTablesInPreviousState = [];
            }
            const unique1 = removedTablesInPreviousState.filter(
                (table) => state.tablesRemoved.indexOf(table) === -1);
            const unique2 = state.tablesRemoved.filter(
                (table) => removedTablesInPreviousState.indexOf(table) === -1);

            for (let i = 0, l = unique1.length; i < l; i += 1) {
                unique1[i].addPanelMeshToScene();
            }

            for (let i = 0, l = unique2.length; i < l; i += 1) {
                unique2[i].removePanelsMeshFromScene();
            }

            this.tablesRemovedFromScene = state.tablesRemoved;
        }
    }

    clearState() {
        for (let i = 0, l = this.subarrays.length; i < l; i += 1) {
            this.subarrays[i].removeObject();
        }
        this.stage.snapManager.updateTableGrid();
        for (let i = 0, l = this.tablesRemovedFromScene.length; i < l; i += 1) {
            this.tablesRemovedFromScene[i].addPanelMeshToScene();
        }
        this.subarrays = [];
        this.tablesRemovedFromScene = [];
    }

    createNewSubarray() {
        const newSubarray = new Subarray(this.stage);
        this.startingParent.addChild(newSubarray);
        newSubarray.associatedModel = this.startingParent;
        newSubarray.createBoundaryFromParent();
        newSubarray.addTableFlow = true;
        if (this.subarrayProperties !== null) {
            newSubarray.updateSubarrayForAddTable(this.subarrayProperties);
        }

        const rowMap = {
            id: 0,
            frames: [],
        };
        const row = new Row(this.stage, rowMap, { withoutContainer: false }, true);
        newSubarray.addChild(row);
        row.saveState({ withoutContainer: false });
        return newSubarray;
    }

    createNewTable() {
        const newSubarray = this.createNewSubarray();
        const templateTableMap = newSubarray.getTemplateTableMap({ withBBox: true });
        templateTableMap.hidden = false;
        templateTableMap.isMoved = true;
        const newTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
        newTable.showIndividualMesh();
        newTable.clickToAdd = true;
        newSubarray.getChildren()[0].addChild(newTable);
        // updating the panels id for the subarray as the table
        // was added without updating the ids of panels
        const panels = newTable.getChildren();
        for (let i = 0, l = panels.length; i < l; i += 1) {
            panels[i].setId(newSubarray.getPanelId());
        }
        return newTable;
    }

    addTableToNewSubarray(newTable) {
        if (newTable.getSubarray().tableSizeUp === '' || newTable.getSubarray().tableSizeUp === 0 ||
            newTable.getSubarray().tableSizeWide === '' || newTable.getSubarray().tableSizeWide === 0) {
            this.stage.eventManager.tableEmptyError();
            newTable.removeObject();
            this.stage.stateManager.stopContainer({ discard: true });
        } else {
            try {
                this.subarrayProperties = newTable.getSubarray().getState();
                const tablePlaced = newTable.placeObjectForAddTable();
                if (!(tablePlaced instanceof Error) && tablePlaced.isSuccess) {
                    // Jugaad for click drag tables removed -> affectedSubarrays
                    const affectedSubarrays = [];
                    for (let i = 0, l = tablePlaced.tablesRemoved.length; i < l; i += 1) {
                        if (!(this.tablesRemovedFromScene.includes(tablePlaced.tablesRemoved[i]))) {
                            this.tablesRemovedFromScene.push(tablePlaced.tablesRemoved[i]);
                        }
                        if (!affectedSubarrays.includes(tablePlaced.tablesRemoved[i].getSubarray())) {
                            affectedSubarrays.push(tablePlaced.tablesRemoved[i].getSubarray());
                        }
                    }
                    for (let i = 0, l = affectedSubarrays.length; i < l; i += 1) {
                        affectedSubarrays[i]
                            .mergeGeometriesForAllPanels({ excludeTables: this.tablesRemovedFromScene });
                    }
                    newTable.getSubarray().getTableDimensions(true);
                    newTable.getPosition(true);
                    newTable.getSubarray().getBoundingBox(true);
                    newTable.getParent().updateLocalBoundingBox();
                    newTable.updateVisualsAfterLoadingAndCreation();
                    this.subarrays.push(newTable.getSubarray());
                    this.startingParent = newTable.getSubarray().getParent();
                }
            } catch (error) {
                this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
                this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
                console.error('ERROR: EditMode: Cannot Add Table', error);
            }
        }
    }

    snapWhileClicked() {
        return this.snapping;
    }

    onMouseMove = async (event) => {
        if (window.document.activeElement.className === PANEL_SELECTION_DROPDOWN_MENU_CLASS_NAME) {
            return;
        }
        if (this.isClicked) {
            if (this.deleteMode) {
                this.deleteTable();
            } else {
                if (this.prevTable) {
                    this.getSnappedTable(event);
                    this.currentTable.hideObjectLayer();
                }
            }
            this.mousePoint = this.stage.mousePoint.clone();
        }
        if (!this.deleteMode && !this.isClicked) {
            this.mousePoint = this.stage.snapManager.objectSnap(event);
        }
        const objectPosition = this.getPositionForObjects();
        const deltaX = this.mousePoint.x - objectPosition.x;
        const deltaY = this.mousePoint.y - objectPosition.y;
        this.currentTable.moveObject(deltaX, deltaY, 0);
        this.stage.duplicateManager.moveDuplicates(deltaX, deltaY);
        this.updateParentsAndErrors();

        this.stage.visualManager.updateVisualsForEditing(true);
    }

    mouseDown = async(event) => {
        if (this.deleteMode) {
            this.isClicked = true;
            this.deleteTable();
        } else {
            this.stage.snapManager.unInitialize();
            if (event.which === 3) {
                this.switchMode = true;
                this.subarrayProperties = this.currentTable.getSubarray().getState();
                this.subarrayProperties.panelOrientation = this.subarrayProperties
                    .panelOrientation === 'Portrait' ? 'Landscape' : 'Portrait';
                this.currentTable.getSubarray().changeTablePropertiesDuringCreation(this.subarrayProperties);
                this.stage.eventManager.addTableMode(this.currentTable.getSubarray());
            } else {
                this.switchMode = false;
                this.isClicked = true;
                this.snapping = true;
                if (!this.objectsErrored[0]) {
                    this.addTableToNewSubarray(this.currentTable);
                    this.prevTable = this.currentTable;
                    this.position = this.prevTable.getPosition();

                    this.currentTable = this.createNewTable();
                    this.stage.eventManager.addTableMode(this.currentTable.getSubarray());
                    const subarrayProperties = this.currentTable.getSubarray().getState();
                    const parent = this.currentTable.getSubarray().getParent()
                    if (subarrayProperties.mountType === SUBARRAY_RACK_STYLE_FLUSH && parent.getTilt() === 0) {
                        notificationsAssistant.longInfo({
                            title: 'Tilted Mount on Flat Surface',
                            message: 'You are now creating Tilted Mount structure on Flat Surface',
                        });
                    }
                    if (subarrayProperties.mountType === SUBARRAY_RACK_STYLE_FIXED && parent.getTilt() !== 0) {
                        notificationsAssistant.longInfo({
                            title: 'Roof Mount on Tilted Surface',
                            message: 'You are now creating Roof Mount structure on Tilted Surface',
                        });
                    }
                    let currentTableParent = this.currentTable.getSubarray().parent
                    if (currentTableParent instanceof SmartroofFace){
                        let smartroofFaceParent = currentTableParent.getParent();
                        if (smartroofFaceParent.computePercentageAreaCoveredByPanels() >= HIGH_PANEL_COVERAGE_AREA){    
                            notificationAssistant.error({
                                title: 'Percentage Area',
                                message: 'Percentaage Area Exceeded more than 33 %',
                            });    
                        }
                    }
                }
            }
        }
    }

    mouseUp = async(event) => {
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        const objectPosition = this.getPositionForObjects();
        const deltaX = this.mousePoint.x - objectPosition.x;
        const deltaY = this.mousePoint.y - objectPosition.y;
        this.currentTable.moveObject(deltaX, deltaY, highestZ);

        this.currentTable.showObjectLayer();
        if (!this.deleteMode) {
            this.initializeSnapForPlacing(this.currentTable);
        }
        this.isClicked = false;
        this.snapping = true;
        this.stage.eventManager.addTableMode(this.currentTable.getSubarray());
    }

    updateParentsAndErrors() {
        const placingInformation = this.currentTable.getPlacingInformation(this.mousePoint);

        if (placingInformation.errors.length !== 0 && !this.objectsErrored[0]) {
            this.objectsErrored[0] = true;
            this.currentTable.switchVisualState(VISUAL_STATES.ERROR, true);

            if (this.currentParents[0] !== null && this.currentParents[0] !== undefined && !this.isClicked) {
                this.currentParents[0].switchVisualState(VISUAL_STATES.DEFAULT, false);
            }
        } else if (placingInformation.errors.length === 0) {
            if (this.objectsErrored[0]) {
                this.objectsErrored[0] = false;
                this.currentTable.switchVisualState(VISUAL_STATES.DEFAULT, true);
            }
            this.currentTable.switchVisualState(VISUAL_STATES.SELECT, false);
        }
        let currentTableParent = this.currentTable.getSubarray().parent
        if (currentTableParent instanceof SmartroofFace){
            let smartroofFaceParent = currentTableParent.getParent();
            if (smartroofFaceParent.computePercentageAreaCoveredByPanels() >= HIGH_PANEL_COVERAGE_AREA){    
               this.objectsErrored[0] = true; 
            }
        }

        if (this.isClicked) {
            if (placingInformation.parent !== undefined && placingInformation.parent !== null) {
                const { parent } = placingInformation;
                if (this.currentParents[0] != parent) {
                    this.prevTable = null;
                    this.objectsErrored[0] = true;
                    this.currentTable.switchVisualState(VISUAL_STATES.ERROR, true);
                } else {
                    if (this.prevTable == null) {
                        this.currentTable.updateWhileHovering(this.currentParents[0], parent);
                        this.currentParents[0].switchVisualState(VISUAL_STATES.DEFAULT, false);

                        // Jugaad Is this required?
                        this.addTableToNewSubarray(this.currentTable);
                        this.prevTable = this.currentTable;
                        this.position = this.prevTable.getPosition();
                        this.currentTable = this.createNewTable();

                        this.currentTable.showTable();
                    }
                }
            }
        }

        if (placingInformation.parent !== undefined && placingInformation.parent !== null) {
            const { parent } = placingInformation;
            if (this.currentParents[0] != parent) {
                this.currentParent = parent;
                this.currentTable.updateWhileHovering(this.currentParents[0], parent);
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
            this.currentTable.showTable();
        }
    }

    getVertices(table) {
        let panels = table.getChildren();

        if (panels.length > 3) {
            let subarray = table.getSubarray();
            let azimuth = subarray.getAzimuth();

            let firstCoordinate = panels[0].get2DVertices()[1];
            let secondCoordinate = panels[subarray.tableSizeWide - 1].get2DVertices()[0];
            let thirdCoordinate = panels[subarray.tableSizeWide * subarray.tableSizeUp - 1].get2DVertices()[3];
            let zeroCoordinate = panels[subarray.tableSizeWide * (subarray.tableSizeUp - 1)].get2DVertices()[2];

            let vertices = [];
            if (azimuth >= 0 && azimuth <= 90) {
                vertices = [firstCoordinate, secondCoordinate, thirdCoordinate, zeroCoordinate];
            }
            if (azimuth > 90 && azimuth <= 180) {
                vertices = [zeroCoordinate, firstCoordinate, secondCoordinate, thirdCoordinate];
            }
            if (azimuth > 180 && azimuth <= 270) {
                vertices = [thirdCoordinate, zeroCoordinate, firstCoordinate, secondCoordinate];
            }
            if (azimuth > 270 && azimuth < 360) {
                vertices = [secondCoordinate, thirdCoordinate, zeroCoordinate, firstCoordinate];
            }
            return vertices;
        }

        return table.get2DVertices();
    }

    getSnappedTable(event) {
        if (this.prevTable.parent === null || this.prevTable.parent === undefined) {
            return;
        }
        const subarray = this.prevTable.getSubarray();
        let bBox = this.getVertices(this.prevTable);

        let position = this.position;

        //vectorDirection along azimuth
        const azimuth = subarray.getAzimuth();
        const panelDirection = new THREE.Vector3(Math.sin(azimuth), Math.cos(azimuth));
        panelDirection.normalize();

        // const  verticalDirection = panelDirection.normalize();
        let verticalDirection = position.clone().add(panelDirection);
        verticalDirection.normalize();

        //rotate vector along axis with for horizontal direction
        let horizontalDirection = position.clone().add(panelDirection.applyAxisAngle(position, 90));
        horizontalDirection.normalize();

        //distance b/w points of 2 tables for horizontal direction
        const tableSizeWide = subarray.tableSizeWide;
        const moduleSpacingWide = subarray.moduleSpacingWide;
        const moduleWidth = subarray.moduleProperties.moduleWidth;
        const tableSpacingWide = subarray.tableSpacing;


        //distance b/w points of 2 tables for verticle Direction
        const tableSizeUp = subarray.tableSizeUp;
        const moduleSpacingUp = subarray.moduleSpacingUp;
        const moduleLength = subarray.moduleProperties.moduleLength;
        const tableSpacingUp = subarray.rowSpacing;

        const tiltAngle = utils.deg2Rad(subarray.tilt);

        let horizontalDistanceBwCentroids = tableSizeWide * moduleWidth + moduleSpacingWide * (tableSizeWide - 1) + tableSpacingWide;
        let verticalDistanceBwCentroids = tableSizeUp * moduleLength * Math.cos(tiltAngle) +
            ((moduleSpacingUp * (tableSizeUp - 1)) * Math.cos(tiltAngle)) + tableSpacingUp;

        if (subarray.panelOrientation === "Landscape") {
            horizontalDistanceBwCentroids = tableSizeWide * moduleLength + moduleSpacingWide * (tableSizeWide - 1) + tableSpacingWide;
            verticalDistanceBwCentroids = tableSizeUp * moduleWidth * Math.cos(tiltAngle) +
                ((moduleSpacingUp * (tableSizeUp - 1)) * Math.cos(tiltAngle)) + tableSpacingUp;
        }

        const direction = {
            left: false,
            right: false,
            up: false,
            down: false,
        }

        if (!utils.inspectPointInsideVertices(bBox, this.mousePoint)) {
            const line = [position, this.mousePoint];
            for (let i = 0; i < bBox.length; i++) {
                const intersection = utils.checkLineIntersection(line, [new THREE.Vector2(bBox[i][0], bBox[i][1]),
                    new THREE.Vector2(bBox[(i + 1) % bBox.length][0],
                        bBox[(i + 1) % bBox.length][1])
                ]);
                if (intersection.onLine1 && intersection.onLine2) {
                    switch (i) {
                        case 0:
                            direction.left = true;
                            break;
                        case 1:
                            direction.up = true;
                            break;
                        case 2:
                            direction.right = true;
                            break;
                        case 3:
                            direction.down = true;
                            break;
                    }
                }
            }
        }

        if ((azimuth > 180 && azimuth <= 270) || (azimuth > 0 && azimuth <= 90)) {
            [horizontalDistanceBwCentroids, verticalDistanceBwCentroids] = [verticalDistanceBwCentroids, horizontalDistanceBwCentroids];
        }

        const horizontalSlope = (bBox[2][1] - bBox[1][1]) / (bBox[2][0] - bBox[1][0]);
        const verticalSlope = (bBox[1][1] - bBox[0][1]) / (bBox[1][0] - bBox[0][0]);

        const horizontalPoints = this.getCentrePointsforNewTable(position, horizontalSlope, horizontalDistanceBwCentroids);
        const verticalPoints = this.getCentrePointsforNewTable(position, verticalSlope, verticalDistanceBwCentroids);

        if (verticalPoints[0].y < verticalPoints[1].y) {
            [verticalPoints[0], verticalPoints[1]] = [verticalPoints[1], verticalPoints[0]];
        }

        let finalPoints;

        if (direction.up) {
            finalPoints = verticalPoints[0];
        }
        if (direction.down) {
            finalPoints = verticalPoints[1];
        }
        if (direction.left) {
            finalPoints = horizontalPoints[1];
        }
        if (direction.right) {
            finalPoints = horizontalPoints[0];
        }

        if ((direction.left || direction.right || direction.up || direction.down) && !this.objectsErrored[0]) {
            this.currentTable.setPosition(finalPoints);
            this.addTableToNewSubarray(this.currentTable);

            this.prevTable = this.currentTable;
            this.prevTable.showObjectLayer();
            this.position = this.prevTable.getPosition();
            this.currentTable = this.createNewTable();
        }
    }

    getCentrePointsforNewTable(point, m, distance) {

        let constant = point.y - m * point.x;

        let a = 1 + m * m;
        let b = 2 * (m * constant - point.x - m * point.y);
        let c = point.x * point.x + point.y * point.y + constant * constant - distance * distance - 2 * constant * point.y;

        let x1 = (-1 * b + Math.sqrt(b * b - 4 * a * c));
        let x2 = (-1 * b - Math.sqrt(b * b - 4 * a * c));

        x1 = x1 / (2 * a);
        x2 = x2 / (2 * a);

        let y1 = m * x1 + constant;
        let y2 = m * x2 + constant;


        if (m == Infinity) {
            x1 = point.x;
            x2 = point.x;
            y1 = point.y + distance;
            y2 = point.y - distance;
        }

        let positionRight = new THREE.Vector2(x1, y1);
        let positionLeft = new THREE.Vector2(x2, y2);

        return [positionRight, positionLeft];
    }

    removeIntersectedSubarray(subarray) {
        const index = this.subarrays.indexOf(subarray);
        if (index >= 0) {
            this.subarrays.splice(index, 1);
        }
    }

    getSimilarSubarrays() {
        const checkedIdx = [];
        const similarSet = [];
        for (let i = 0, len = this.subarrays.length; i < len; i += 1) {
            const set = [];
            const prop = this.subarrays[i].getState();
            const parent1 = this.subarrays[i].getAssociatedModel();
            if (checkedIdx.indexOf(i) === -1) {
                for (let j = 0, len2 = this.subarrays.length; j < len2; j += 1) {
                    const parent2 = this.subarrays[j].getAssociatedModel();
                    const idx = this.checkForSameSubarray([this.subarrays[j]], prop);
                    if (idx !== -1 && parent1 === parent2) {
                        set.push(j);
                        checkedIdx.push(j);
                    }
                }
                similarSet.push(set);
            }
        }
        return similarSet;
    }

    combineSameSubarrays() {
        const arr = [];
        this.subarrays.forEach((subarray) => {
            if (subarray.getParent() !== null && subarray.getChildren() && subarray.getChildren().length > 0) {
                arr.push(subarray);
            }
        });
        this.subarrays = [...arr];
        const similarSet = this.getSimilarSubarrays();
        for (let i = 0, len = similarSet.length; i < len; i += 1) {
            const subarray = this.subarrays[similarSet[i][0]];
            subarray.addTableFlow = false;
            let isCombined = false;
            for (let j = 1, len2 = similarSet[i].length; j < len2; j += 1) {
                if (this.subarrays[similarSet[i][j]].getChildren().length === 0) {
                    break;
                }
                const table = this.subarrays[similarSet[i][j]].getChildren()[0].getChildren()[0];
                // Jugaad for table in air.
                // table.placeObjectForAddTable();
                table.getParent().removeChild(table);
                subarray.getChildren()[0].addChild(table);

                // Fixing the ids of panels as all the
                // panels will have same id in the new subarray
                const panels = table.getChildren();
                for (let i = 0, l = panels.length; i < l; i += 1) {
                    panels[i].setId(subarray.getPanelId());
                }
                // TODO: also fix the ids of tables
                this.subarrays[similarSet[i][j]].removeObject();
                isCombined = true;
            }
            if (isCombined) {
                subarray.validateStructures();
                subarray.removeOutlinePoints();
                subarray.createConvexHull();
                const newSubarrayMap =
                    subarray.createRowBlocksInSubarrayMap(subarray.getSubarrayMap());
                subarray.clearSubarray();
                subarray.makeSubarray(newSubarrayMap, { withoutContainer: false });
            } else {
                subarray.saveState();
                subarray.getChildren()[0].saveState();
                subarray.getChildren()[0].getChildren()[0].saveState();
                subarray.mergeGeometriesForAllPanels();
            }
            subarray.hideIndividualPanelMeshes();
        }
    }

    resetAddTableMode() {
        this.canvas.removeEventListener('click', this.onClick, false);
        this.subarrays = [];
        this.subarrayProperties = null;
        this.startingParent = null;
        this.tablesRemovedFromScene = [];
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
    }

    cancelAddTableToNewSubarray(newTable) {
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
        this.stage.stateManager.stopTempStack();
        this.stage.stateManager.startContainer();
        this.combineSameSubarrays();

        if (newTable.parent && newTable.getChildren() && newTable.getChildren().length > 0) {
            newTable.removeObject();
        }
        for (let i = 0, l = this.tablesRemovedFromScene.length; i < l; i += 1) {
            this.tablesRemovedFromScene[i].removeObject();
        }
        this.stage.stateManager.stopContainer({
            discard: this.subarrays.length === 0 &&
                this.tablesRemovedFromScene.length === 0
        });
        this.resetAddTableMode();
        this.stage.eventManager.setPlaceObjectComplete();
    }

    onCompleteAddTableMode() {
        this.isMouseDown = false;
        this.cancelAddTableToNewSubarray(this.currentTable);
        this.stage.dragControls.domElement.style.cursor = 'default';

        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseUp, false);

        Mousetrap.unbind('shift+d');
        // this.canvas.removeEventListener('click', this.onMouseClick, false);
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.selectionControls.enable();
        this.stage.viewManager.enableDimensions();
        this.stage.snapManager.unInitialize();
        this.stage.eventHandler.removeEvent(this.mouseMoveIndex);
        this.snapping = false;
    }

    indexOfTable(tables, table) {
        for (let i = 0, len = tables.length; i < len; i += 1) {
            if (tables[i].table === table) {
                return i;
            }
        }
        return -1;
    }

    // Add Inverter functions

    getNewInverter() {
        if (this.inverterSpecification === null || this.inverterSpecification === undefined) {
            console.error('Edit.js : Inverter spec is not defined')
                // do something ??
        }
        const newInverter = new Inverter(this.stage, this.inverterSpecification);
        newInverter.callOptimizerAndStringingApi(this.linkedSubarray.getModuleId());
        for (let i = 0, l = newInverter.mppts.length; i < l; i += 1) {
            newInverter.mppts[i].setLinkedSubarray(this.linkedSubarray);
        }
        this.preInverter = newInverter;
        this.addInverterMode = true;
        return newInverter;
    }

    initAddInverter(inverterDetails) {
        // Jugaad fix
        this.stage.duplicateManager.disable();
        if (this.addInverterMode) {
            //jugad fix - initially it was this.preInverter.removeObject();
            this.preInverter.removePrevInverterWhileAdding();

            // TODO: remove this manual
            // enable and disable 
            this.stage.placeManager.disable();
            this.stage.selectionControls.enable();
            this.stage.dragControls.enable();
            this.stage.snapManager.unInitialize();

            this.canvas.removeEventListener('click', this.onClickNewInverter, false);
            this.addInverterMode = false;
        }
        const subarrays = [];
        getSubarrays(this.stage.ground, subarrays);

        if (subarrays.length === 0) {
            console.error('EditMode: Cannot add inverter without adding panels');
            //TODO: add a error notification for the user
            return;
        }

        this.linkedSubarray = subarrays[0];

        const mppts = [];
        const mpptsMaxString = inverterDetails.Number_of_Strings.replace(/\s/g, "");
        const arrayOfStrings = mpptsMaxString.split('/');
        for (let i = 0; i < inverterDetails.Number_of_MPPT; i += 1) {
            let maxStrings = parseInt(arrayOfStrings[i]);
            if (isNaN(maxStrings)) {
                console.error(
                    'Error parsing the max strings in mppts with inverter id:',
                    inverterDetails.id,
                    'Default set to 3',
                );
                maxStrings = 3;
            }
            mppts.push({
                maxStrings,
            })
        }

        this.inverterSpecification = {
            electricalProperties: inverterDetails,
            mppts,
        };
        this.stage.stateManager.startContainer();
        const newInverter = this.getNewInverter();
        this.stage.eventManager.addInverterMode(newInverter);
        this.initPlaceManagerForAddInverter(newInverter);
        this.canvas.addEventListener('click', this.onClickNewInverter, false);

    }

    initPlaceManagerForAddInverter(newInverter) {
        this.stage.placeManager.initialize(
            newInverter,
            this.addNewInverter.bind(this, newInverter),
            this.cancelAddNewInverter.bind(this, newInverter),
            0,
            0, { moveWithOffset: true }, { handleClickEvent: false },
        );

    }

    addNewInverter(newInverter) {
        newInverter.placeObject();
        this.addedInverterInSeen = true;
    }

    cancelAddNewInverter(newInverter) {
        newInverter.removeObject();
        let discard = false;
        if (!this.addedInverterInSeen) {
            discard = true;
        }
        this.addedInverterInSeen = false;
        this.stage.stateManager.stopContainer({ discard: discard });
        this.canvas.removeEventListener('click', this.onClickNewInverter, false);
        this.stage.eventManager.setPlaceObjectComplete();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.duplicateManager.enable();
        this.addInverterMode = false;
    }

    onClickNewInverter = async(event) => {
        if (event.type === 'click' && !event.ctrlKey && !event.metaKey) {
            if (this.stage.placeManager.getValidationError() !== null) {
                this.stage.eventManager
                    .customErrorMessage(this.stage.placeManager.getValidationError().message);
                return;
            }
            try {
                await this.stage.placeManager.onClick(event);
                const newInverter = this.getNewInverter();
                this.stage.eventManager.addInverterMode(newInverter);
                this.initPlaceManagerForAddInverter(newInverter);
            } catch (error) {
                console.error('ERROR: EditMode: error in onClick event', error);
                this.stage.stateManager.stopContainer({ discard: true });
            }
        }
    }

    getPositionForObjects() {
        if (!Array.isArray(this.currentTable)) {
            return utils.getCentroidOfObjects([this.currentTable]);
        } else {
            return utils.getCentroidOfObjects(this.currentTable);

        }
    }
}
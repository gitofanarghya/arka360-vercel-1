import _ from 'lodash';

import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import Panel from '../objects/subArray/Panel';
import {
    CREATED_STATE,
    DELETED_STATE,
    TEMP_STACK_USED_BY_DRAW_MANAGER,
    TEMP_STACK_USED_BY_EDIT_MODE,
} from '../coreConstants';
import Row from '../objects/subArray/Row';
import Table from '../objects/subArray/Table';
import Subarray from '../objects/subArray/Subarray';
import { VISUAL_STATES } from '../objects/visualConstants';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import * as smartroofUtils from '../objects/model/smartroof/smartroofUtils';

import { serverBus } from '../../main';
import DCString from '../objects/subArray/DCString';
import ElectricalString from '../objects/subArray/ElectricalString';
import MicroInverter from '../objects/ac/MicroInverter';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Dormer from '../objects/model/smartroof/Dormer';
import Gazebo from '../lib/PowerGazebo';

class StateManager {
    constructor(stage) {
        this.stage = stage;

        this.undoObjectStates = {};
        this.redoObjectStates = {};

        // stack of past states
        // a state object would be in the form of
        // {id: 'stateID', states: [{uuid: 'objectUUID', ...}]}
        this.undoStack = [];
        // temporary stack to save undoStack
        this.tempUndoStack = [];

        // stack of future states
        this.redoStack = [];
        // temporary stack to save undoStack
        this.tempRedoStack = [];

        // temporary stack is used by which component.
        this.tempStackUsedBy = null;

        this.undoStackUsed = this.undoStack;
        this.redoStackUsed = this.redoStack;

        // Active state corresponds to state container where
        // all the affected objects would be stored in it
        this.activeContainer = null;

        this.tempoObjectStates = {};

        this.dcStringsAffected = [];
        this.microInvertersAffected = [];
    }

    add({ uuid, getStateCb, withoutContainer = false }) {
        if (withoutContainer) {
            this.addObjectState({ uuid, state: getStateCb() });
        }
        else if (this.activeContainer) {
            if (!this.activeContainer.includes(uuid)) {
                this.activeContainer.unshift(uuid);
            }
            this.tempoObjectStates[uuid] = getStateCb;
        }
    }

    addObjectState({ uuid, state, actionType = 'UNDO' }) {
        let objectStates;
        if (actionType === 'UNDO') {
            objectStates = this.undoObjectStates;
        }
        else if (actionType === 'REDO') {
            objectStates = this.redoObjectStates;
        }
        else {
            throw new Error('StateManager: addObjectState() use valid actionType either UNDO or REDO');
        }

        if (!objectStates[uuid]) {
            objectStates[uuid] = [state];
        }
        else {
            objectStates[uuid].unshift(state);
        }
    }

    removeObjectStates({ uuid, actionType = 'UNDO' }) {
        let objectStates;
        if (actionType === 'UNDO') {
            objectStates = this.undoObjectStates;
        }
        else if (actionType === 'REDO') {
            objectStates = this.redoObjectStates;
        }
        else {
            throw new Error('StateManager: removeObjectStates() use valid actionType either UNDO or REDO');
        }

        if (objectStates[uuid]) {
            _.remove(objectStates[uuid], undefined);
        }
    }

    // Temp fix for EW: REWORK REQUIRED
    removeObjectStatesFromAll({ uuid }) {
        this.removeObjectStates({ uuid, actionType: 'UNDO' });
        this.removeObjectStates({ uuid, actionType: 'REDO' });
        // Also remove from tempoObjectStates
        delete this.tempoObjectStates[uuid];

        // remove from containers
        if (this.activeContainer) {
            _.remove(this.activeContainer, (item) => item === uuid);
        }
    }

    updateSelectedObjects() {
        this.stage.eventManager
            .setObjectsSelected(this.stage.selectionControls.getSelectedObject());
        const selectedObjects = this.stage.selectionControls.getSelectedObjects();
        this.stage.selectionControls.setSelectedObject(this.stage.selectionControls.getSelectedObject());
        for (let i = 0; i < selectedObjects.length; i += 1) {
            selectedObjects[i].switchVisualState(VISUAL_STATES.SELECT, false);
        }
    }

    updateCreatedObject() {
        this.stage.eventManager.setObjectsCreated(
            this.stage.drawManager.getCurrentDrawingObject(),
            { onlyUpdateGetters: true },
        );
    }


    getObjectsSortOrder(a, b) {
        // Sorting Order
        // PolygonModel or CylinderModel = 0
        // Subarray = 1
        // Row = 2
        const objectA = this.stage.getObject(a);
        const objectB = this.stage.getObject(b);
        let valueOfA = 0;
        let valueOfB = 0;
        if (objectA instanceof SmartroofModel || objectA instanceof SmartroofFace) {
            valueOfA = 0;
        }
        else if (objectA instanceof PolygonModel || objectA instanceof CylinderModel) {
            valueOfA = 1;
        }
        else if (objectA instanceof Subarray) {
            valueOfA = 2;
        }
        else if (objectA instanceof Row) {
            valueOfA = 3;
        }
        else if (objectA instanceof DCString || objectA instanceof MicroInverter) {
            valueOfA = 5;
        }
        else if (objectA instanceof ElectricalString) {
            valueOfA = 6;
        }
        else {
            valueOfA = 4;
        }
        if (objectB instanceof SmartroofModel || objectB instanceof SmartroofFace) {
            valueOfB = 0;
        }
        else if (objectB instanceof PolygonModel || objectB instanceof CylinderModel) {
            valueOfB = 1;
        }
        else if (objectB instanceof Subarray) {
            valueOfB = 2;
        }
        else if (objectB instanceof Row) {
            valueOfB = 3;
        }
        else if (objectB instanceof DCString || objectB instanceof MicroInverter) {
            valueOfB = 5;
        }
        else if (objectB instanceof ElectricalString) {
            valueOfB = 6;
        }
        else {
            valueOfB = 4;
        }
        return valueOfA - valueOfB;
    }


    undo() {
        if (this.undoStackUsed.length > 0) {
            const container = this.undoStackUsed.shift();
            this.redoStackUsed.unshift(container);
            let stateHasSmartoof = 
            {
                flag: false,
                model: null,
            };
            const subarraysListForUpdate = [];
            const smartroofListForUpdate = [];
            container.sort((a, b) => this.getObjectsSortOrder(a, b));

            for (const objectUUID of container) {
                const objectStates = this.undoObjectStates[objectUUID];
                if (objectStates && objectStates.length > 0) {
                    const object = this.stage.getObject(objectUUID);

                    // to update merged meshes of subarray
                    if (object instanceof Table) {
                        if (object.getParent() !== null && object.getSubarray() !== null) {
                            if (!subarraysListForUpdate.includes(object.getSubarray()))
                                subarraysListForUpdate.push(object.getSubarray());
                        }
                    }
                    
                    const lastObjectState = objectStates.shift();
                    this.addObjectState({
                        uuid: objectUUID,
                        state: lastObjectState,
                        actionType: 'REDO',
                    });

                    try {
                        object.loadState(objectStates[0], lastObjectState);
                    }
                    catch (e) {
                        console.error(e);
                    }
                    /* to update the subarraysListForUpdate when the whole row is removed 
                       we were not able to get the subarry for update */
                       if (object instanceof Row && (!object.getParent() instanceof Gazebo)) {
                        if (objectStates[0] === DELETED_STATE || objectStates[0] === CREATED_STATE) {
                            const subarray = this.stage.getObject(lastObjectState.parent)
                            if (!subarraysListForUpdate.includes(subarray))
                                subarraysListForUpdate.push(subarray);
                        }
                    }
                    // to update merged meshes of  subarray
                    if (object instanceof Table) {
                        if (object.getParent() !== null && object.getSubarray() !== null) {
                            if (!subarraysListForUpdate.includes(object.getSubarray()))
                                {subarraysListForUpdate.push(object.getSubarray());}
                        }
                    }
                    if (object instanceof SmartroofModel || object instanceof Dormer){
                        stateHasSmartoof.flag = true;
                        stateHasSmartoof.model = object;
                    }
                    if (object instanceof SmartroofModel || object instanceof Dormer) {
                        smartroofListForUpdate.push({
                            object: object,
                            previousChildSequenceList: objectStates[0].childSequence,
                        })
                    }
                }
            }
            this.updateButtonStatus();

            // to update merged meshes of  subarray
            if (subarraysListForUpdate.length > 0) {
                for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                    subarraysListForUpdate[i].mergeGeometriesForAllPanels();
                    // jugaad when undo for first time panels were not showing.
                    if (subarraysListForUpdate[i] instanceof Gazebo) {
                        if (subarraysListForUpdate[i].getTables()[0].getChildren().length === 0) {
                            subarraysListForUpdate[i].createPanels();
                        }
                    }
                    subarraysListForUpdate[i].updateRail();
                }
            }
            if (smartroofListForUpdate.length > 0) {
                for (let i = 0, l = smartroofListForUpdate.length; i < l; i += 1) {
                    smartroofUtils.checkChildrenSequence(smartroofListForUpdate[i].previousChildSequenceList,smartroofListForUpdate[i].object);
                }
            }
            if (stateHasSmartoof.flag) {
                // Find the top level smartroof model
                const baseRoof = stateHasSmartoof.model.getBaseSmartroof();
                if (baseRoof && baseRoof instanceof SmartroofModel) {
                    baseRoof.getAllSmartroofIntersections();
                    baseRoof.stage.smartRoofSetbackEditMode.updateModelArea();
                }
            }

            if (this.undoStackUsed !== this.tempUndoStack) {
                // update SAP pane
                this.updateSelectedObjects();
            }
            else if (this.tempStackUsedBy === TEMP_STACK_USED_BY_DRAW_MANAGER) { 
                this.updateCreatedObject();
            }
            else if (this.tempStackUsedBy === TEMP_STACK_USED_BY_EDIT_MODE) { 
                // do nothing
            }
            serverBus.$emit('designChanged');
        }
        else {
            notificationsAssistant.warning({
                title: 'Undo',
                message: 'No further history available',
            });
        }
    }

    redo() {
        if (this.redoStackUsed.length > 0) {
            const container = this.redoStackUsed.shift();
            this.undoStackUsed.unshift(container);
            let stateHasSmartoof = 
            {
                flag: false,
                model: null,
            };
            const subarraysListForUpdate = [];
            const smartroofListForUpdate = [];

            container.sort((a, b) => this.getObjectsSortOrder(a, b));

            for (const objectUUID of container) {
                const objectStates = this.redoObjectStates[objectUUID];

                if (objectStates.length > 0) {
                    const object = this.stage.getObject(objectUUID);

                    // to update merged meshes of subarray
                    if (object instanceof Table) {
                        if (object.getParent() !== null && object.getSubarray() !== null) {
                            if (!subarraysListForUpdate.includes(object.getSubarray()))
                                subarraysListForUpdate.push(object.getSubarray());
                        }
                    }

                    const lastObjectState = objectStates.shift();
                    this.addObjectState({
                        uuid: objectUUID,
                        state: lastObjectState,
                        actionType: 'UNDO',
                    });

                    try {
                        object.loadState(lastObjectState, this.undoObjectStates[objectUUID][1]);
                    }
                    catch (e) {
                        console.error(e);
                    }
                    /* to update the subarraysListForUpdate when the whole row is removed 
                       we were not able to get the subarry for update
                       while doing redo parent is coming null so added conditional operator for that */
                    if (object instanceof Row && (object.getParent() ? (!object.getParent() instanceof Gazebo) : true)) {
                        if (lastObjectState === DELETED_STATE || lastObjectState === CREATED_STATE) {
                            const subarray = this.stage.getObject(this.undoObjectStates[objectUUID][1].parent)
                            if (!subarraysListForUpdate.includes(subarray))
                                subarraysListForUpdate.push(subarray);
                        }
                    }
                    // to update merged meshes of subarray
                    if (object instanceof Table) {
                        if (object.getParent() !== null && object.getSubarray() !== null) {
                            if (!subarraysListForUpdate.includes(object.getSubarray()))
                                subarraysListForUpdate.push(object.getSubarray());
                        }
                    }
                    if (object instanceof SmartroofModel || object instanceof Dormer){
                        stateHasSmartoof.flag = true;
                        stateHasSmartoof.model = object;
                    }
                    if (object instanceof SmartroofModel || object instanceof Dormer) {
                        smartroofListForUpdate.push({
                            object: object,
                            previousChildSequenceList: this.undoObjectStates[objectUUID][1].childSequence,
                        })
                    }
                }
            }
            this.updateButtonStatus();

            // to update merged meshes of  subarray
            if (subarraysListForUpdate.length > 0) {
                for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                    subarraysListForUpdate[i].mergeGeometriesForAllPanels();
                    if (subarraysListForUpdate[i] instanceof Gazebo) {
                        // jugad to fix the extra panels
                        const noOfPanels = subarraysListForUpdate[i].tableSizeUp * subarraysListForUpdate[i].tableSizeWide;
                        if (subarraysListForUpdate[i].getTables()[0] && subarraysListForUpdate[i].getTables()[0].getChildren().length === 2 * noOfPanels) {
                            subarraysListForUpdate[i].removePanels();
                        }
                    }
                    subarraysListForUpdate[i].updateRail();
                }
            }
            if (smartroofListForUpdate.length > 0) {
                for (let i = 0, l = smartroofListForUpdate.length; i < l; i += 1) {
                    smartroofUtils.checkChildrenSequence(smartroofListForUpdate[i].previousChildSequenceList,smartroofListForUpdate[i].object);
                }
            }

            if (stateHasSmartoof.flag) {
                // Find the top level smartroof model
                const baseRoof = stateHasSmartoof.model.getBaseSmartroof();
                if (baseRoof && baseRoof instanceof SmartroofModel) {
                    baseRoof.getAllSmartroofIntersections();
                    baseRoof.stage.smartRoofSetbackEditMode.updateModelArea();
                }
            }
            if (this.redoStackUsed !== this.tempRedoStack) {
                // update SAP pane
                this.updateSelectedObjects();
            }
            else if (this.tempStackUsedBy === TEMP_STACK_USED_BY_DRAW_MANAGER) { 
                this.updateCreatedObject();
            }
            else if (this.tempStackUsedBy === TEMP_STACK_USED_BY_EDIT_MODE) { 
                // do nothing
            }
            serverBus.$emit('designChanged');
        }
        else {
            notificationsAssistant.warning({
                title: 'Redo',
                message: 'No further history available',
            });
        }
    }

    startTempStack(usedByComponent) {
        if (usedByComponent === null || usedByComponent === undefined) {
            console.error('StateManager: Temporary stack use called by unknown component.');
        }
        if (
            this.undoStackUsed !== this.tempUndoStack &&
            this.redoStackUsed !== this.tempRedoStack
        ) {
            this.tempStackUsedBy = usedByComponent;
            this.undoStackUsed = this.tempUndoStack;
            this.redoStackUsed = this.tempRedoStack;
        }
        this.updateButtonStatus();
    }

    stopTempStack() {
        if (
            this.undoStackUsed === this.tempUndoStack &&
            this.redoStackUsed === this.tempRedoStack
        ) {
            this.undoStackUsed = this.undoStack;
            this.redoStackUsed = this.redoStack;

            this.tempUndoStack = [];
            this.tempRedoStack = [];
        }
        this.updateButtonStatus();
    }

    addElectricalComponentAffected(electricalComponent) {
        if (electricalComponent !== null) {
            if (electricalComponent instanceof DCString &&
                !this.dcStringsAffected.includes(electricalComponent)) {
                this.dcStringsAffected.push(electricalComponent);
            }
            else if (electricalComponent instanceof MicroInverter && 
                !this.microInvertersAffected.includes(electricalComponent)) {
                this.microInvertersAffected.push(electricalComponent);
            }
        }

    }

    startContainer() {
        this.dcStringsAffected = [];
        if (!this.activeContainer) {
            this.activeContainer = [];
        }
        else {
            console.error('StateManager: Active container already created');
        }
    }

    stopContainer({ discard } = { discard: false }) {
        for (let i = 0, l = this.dcStringsAffected.length; i < l; i += 1) {
            if (this.dcStringsAffected[i].linkedPanels.length === 0) {
                this.dcStringsAffected[i].removeObject();
            }
            else {
                this.dcStringsAffected[i].updateString();
                this.dcStringsAffected[i].removeNumberMesh();
            }
        }
        for (let i = 0, l = this.microInvertersAffected.length; i < l; i += 1) {
            if (this.microInvertersAffected[i].panels.length === 0) {
                this.microInvertersAffected[i].removeObject();
            }
            else {
                this.microInvertersAffected[i].updateGeometry();
                this.microInvertersAffected[i].saveState();
            }
        }
        this.microInvertersAffected = [];

        if (!discard && this.activeContainer && this.activeContainer.length > 0) {
            this.undoStackUsed.unshift(this.activeContainer);
            // Remove all the elements without creating new assignments
            _.remove(this.redoStackUsed, undefined);
            Object.keys(this.tempoObjectStates).forEach((objectUUID) => {
                this.addObjectState({
                    uuid: objectUUID,
                    state: this.tempoObjectStates[objectUUID](),
                });
            });
            this.optimiseContainer(this.activeContainer);
        }
        this.activeContainer = null;
        this.tempoObjectStates = {};

        this.updateButtonStatus();
        serverBus.$emit('designChanged');
    }

    optimiseContainer(container) {
        // Two Optimisations
        //  1. D | C
        //  2. C

        const uuidToRemove = [];

        for (const objectUUID of container) {
            const objectStates = this.undoObjectStates[objectUUID];
            if (
                (objectStates[0] === CREATED_STATE) ||
                (
                    objectStates[0] === DELETED_STATE &&
                    objectStates[1] === CREATED_STATE
                )
            ) {
                uuidToRemove.push(objectUUID);
            }
        }
        _.pullAll(container, uuidToRemove);
    }

    updateButtonStatus() {
        if (this.undoStackUsed.length > 0) {
            this.stage.eventManager.setUndoStatus({ isEnabled: true });
        }
        else {
            this.stage.eventManager.setUndoStatus({ isEnabled: false });
        }

        if (this.redoStackUsed.length > 0) {
            this.stage.eventManager.setRedoStatus({ isEnabled: true });
        }
        else {
            this.stage.eventManager.setRedoStatus({ isEnabled: false });
        }
    }

    updateLastSavedObjectState({ uuid, getStateCb }) {
        if (this.activeContainer !== null) {
            this.add({ uuid, getStateCb });
        }
        else {
            // For now used only for updating solar access of panels
            // Will warn error if uuid is of object that is not a panel
            if (!(this.stage.getObject(uuid) instanceof Panel)) {
                console.warn('StateManger: updateLastSavedObjectState: Supported only for Panel');
            }

            if (
                this.undoObjectStates[uuid][0] === CREATED_STATE ||
                this.undoObjectStates[uuid][0] === DELETED_STATE
            ) {
                console.error('StateManager: updateLastSavedObjectState: Trying to update created or deleted state');
            }

            this.undoObjectStates[uuid][0] = getStateCb();
        }
    }
}

export default StateManager;

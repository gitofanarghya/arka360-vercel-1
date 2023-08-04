import * as THREE from 'three';
import { v4 } from 'uuid';
import * as raycastingUtils from '../utils/raycastingUtils';
import * as utils from '../utils/utils';
import Panel from '../objects/subArray/Panel';
import DCString from '../objects/subArray/DCString';
import Table from '../objects/subArray/Table';
import Row from '../objects/subArray/Row';
import Subarray from '../objects/subArray/Subarray';
import DcCable from '../objects/model/cable/DcCable'
import { getSubarrays, getInverters } from '../../core/utils/exporters';
import {
    CREATED_STATE,
    DELETED_STATE,
    TEMP_STACK_USED_BY_EDIT_MODE,
} from '../coreConstants';
import { VISUAL_STATES } from '../objects/visualConstants';
import { store } from '../../store';
import * as topBarAssistant from '../../componentManager/topBarAssistant';
import * as CONSTANTS from '../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { serverBus } from '../../main';

export default class StringingMode {

    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        // initilizing the variables
        this.break = false;
        this.enabled = false;
        this.currentTopObject = null;
        this.previousTopObject = null;
        this.currentString = null;
        this.stringsCount = 0;
        this.selectablePanels = [];
        this.completedStrings = [];
    }

    initialize(mppt, initWithString = null) {
        if (this.enabled) {
            console.error('StringingMode: Stringing mode already Initilized');
            notificationsAssistant.error({
                title: 'Stringing',
                message: 'Already in Stringing mode.',
            });
            return 'Stringing Mode Enabled';
        }
        this.stage.stateManager.startContainer();

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);

        // disable sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        // store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

        topBarAssistant.setCompleteAction(this.onComplete.bind(this), this);
        topBarAssistant.setCancelAction(this.onCancel.bind(this));

        this.enabled = true;
        this.stage.visualManager.updateVisualsForEditing(true);
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.viewManager.disableDimensions();
        this.stage.hideSolarAccess();
        // TODO: disable solar access and heat map.
        this.mppt = mppt;
        this.initWithString = initWithString;
        this.selectablePanels = [];

        this.setMpptLinkedSubarray = true;

        if (this.mppt.getAllLinkedPanels().length > 0) {
            this.setMpptLinkedSubarray = false;
            if (this.mppt.linkedSubarray === null || this.mppt.linkedSubarray === undefined) {
                console.error('Stringing Mode: Linked subarray not setup for mppt');
                // TODO:
                // this might happen when we deleted the subarray
                // in this case find any other linked subarray... from the linked panels
                // if no subarray found then delete all the strings and notify the user.
            }
            else {
                this.setUpStringingForProperties(this.mppt.linkedSubarray);
            }
        }
        else {
            // do nothing
        }

        const invertersArray = getInverters(this.stage);
        for(let i = 0; i < invertersArray.length; i++){
            if(invertersArray[i]){
                const mpptsArray = invertersArray[i].mppts;
                for(let j = 0; j < mpptsArray.length; j++){
                    for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                        mpptsArray[j].strings[k].editStringColor();
                        mpptsArray[j].strings[k].displayStringForStringing();
                    }
                }
            }
        }

        this.completedStrings = [];
        if (initWithString !== null) {
            this.currentString = initWithString;
            this.currentString.displayStringForStringing();
            this.stringsCount = 0;
            this.currentString.updateString();
            this.completedStrings.push(this.currentString);
        }
        else {
            if (this.mppt.getStringsLeft() > 0) {
                this.currentString = new DCString(this.stage, this.mppt);
                this.currentString.displayStringForStringing();
                this.mppt.addString(this.currentString);
                this.completedStrings.push(this.currentString);
                // Juggad for dynamic update of completed strings in sappane
                this.mppt.setCopyStrings();
            }
            else {
                this.currentString = this.mppt.getStrings()[this.mppt.getStrings().length - 1];
            }
        }

        const microInvertersArray = this.stage.ground.microInverters;
        for(let i = 0 ; i < microInvertersArray.length ; i++){
            microInvertersArray[i].showObject();
        }
        this.setUpStringingForProperties(this.mppt.linkedSubarray);

        this.break = false;

        // Add event listeners
        // this.canvas.addEventListener('click', this.onClick, false);
        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseup, false);
    }

    setUpStringingForProperties(linkedSubarray) { 
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);
        if (!this.setMpptLinkedSubarray) {
            for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
                if (allSubarrays[i].getAzimuth() === linkedSubarray.getAzimuth() &&
                    allSubarrays[i].getTilt() === linkedSubarray.getTilt() &&
                    allSubarrays[i].getModuleId() === linkedSubarray.getModuleId()) {
                        allSubarrays[i].enableSubarrayForStringing();
                        this.selectablePanels.push(...allSubarrays[i].getPanels());
                }
                else {
                    allSubarrays[i].disableSubarrayForStringing();
                }
            }
        }

        // disabling microinverters from being string
        const microInvertersArray = this.stage.ground.microInverters;
        for(let i = 0 ; i < microInvertersArray.length ; i++){
            let panelsArr = microInvertersArray[i].panels;
            this.removePanelsFromSelectable(panelsArr);
            microInvertersArray[i].showObject();
        }

        const invertersArray = getInverters(this.stage);
        for (let i = 0; i < invertersArray.length; i++) {
            if(invertersArray[i]) {
                const mpptsArray = invertersArray[i].mppts;
                for (let j = 0; j < mpptsArray.length; j++) {
                    if (mpptsArray[j] !== this.mppt) {
                        this.removePanelsFromSelectable(
                            mpptsArray[j].getAllLinkedPanels()
                        );
                    }
                    else {
                        this.removePanelsFromSelectable(
                            mpptsArray[j].getAllLinkedPanelsExcludingString(this.initWithString),
                        );
                    }
                }
            }
        }
    }

    unintialize() {
        // remove event listiners
        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseup, false);
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);
        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].exitStringingMode();
        }
        const microInvertersArray = this.stage.ground.microInverters;
        for(let i = 0 ; i < microInvertersArray.length ; i++){
            microInvertersArray[i].hideObject();
        }

        this.enabled = false;
        this.currentTopObject = null;
        this.previousTopObject = null;
        this.currentString = null;
        this.stringsCount = 0;
        this.linkedSubarray = null;
        this.selectablePanels = [];
        this.completedStrings = [];

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // enable sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        this.stage.selectionControls.enable();
        this.stage.viewManager.enableDimensions();
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
    }

    onComplete() {
        const inverter = this.completedStrings[0].mppt.inverter;
        const inverterEndOne = new THREE.Vector3((inverter.outlinePoints[0][0] + inverter.outlinePoints[3][0])/2,  inverter.outlinePoints[0][1], 0);
        const inverterEndTwo = new THREE.Vector3((inverter.outlinePoints[1][0] + inverter.outlinePoints[2][0])/2,  inverter.outlinePoints[1][1], 0);                               
        // this.currentString.resetStringMesh();
        this.currentString.drawOptimizers();
        this.currentString.editStringColor();
        if (this.currentString.getStringLength() === 0) {
            this.mppt.removeString(this.currentString);
        }
        
        for (let i = 0, l = this.completedStrings.length; i < l; i += 1) {
            // dc cable disabled
            // const dcCables = [];
            // const totalPanel = this.completedStrings[i].linkedPanels.length;
            // const stringEndTwo = this.completedStrings[i].linkedPanels[0].getPosition();
            // const stringEndOne = this.completedStrings[i].linkedPanels[totalPanel-1].getPosition();
            // let cable = this.drawDcCables(inverterEndOne, stringEndOne);
            // cable.attachedString = this.completedStrings[i];
            // cable.cableLength = cable.getLength();
            // cable.polarity = 'negative';
            // cable.mpptIndex = this.mppt.inverter.mppts.indexOf(this.completedStrings[i].mppt)+1;
            // cable.stringIndex = this.mppt.strings.indexOf(this.completedStrings[i])+1;
            // dcCables.push(cable);
            // cable = this.drawDcCables(inverterEndTwo, stringEndTwo);
            // cable.attachedString = this.completedStrings[i];
            // cable.cableLength = cable.getLength();
            // cable.polarity = 'positive';
            // cable.mpptIndex = this.mppt.inverter.mppts.indexOf(this.completedStrings[i].mppt)+1;
            // cable.stringIndex = this.mppt.strings.indexOf(this.completedStrings[i])+1;
            // cable.redColor = true;
            // cable.inverter = this.mppt.inverter;
            // dcCables.push(cable);
            // this.completedStrings[i].attachedDcCable = dcCables; 
            this.completedStrings[i].saveState();
        }
        if(inverter.AJBToggle) {
            inverter.drawCableDcdbToInverter();
        }
        this.stage.selectionControls.setSelectedObject(this.mppt.inverter);
        this.stage.stateManager.stopContainer();
        this.unintialize();
        serverBus.$emit(CONSTANTS.UPDATE_INVERTER_DC_SIZE);
    }

    onCancel() {
        this.currentString.resetStringMesh();
        this.mppt.removeString(this.currentString);
        for (let i = 0, l = this.completedStrings.length; i < l; i += 1) {
            this.completedStrings[i].deleteString();
        }
        this.stage.stateManager.stopContainer({ discard: true });
        this.unintialize();
        serverBus.$emit(CONSTANTS.UPDATE_INVERTER_DC_SIZE);
    }

    drawDcCables(inverterEnd, stringEnd) {
        const inverter = this.mppt.inverter ;
        const dcCable = new DcCable(this.stage);
        dcCable.inverter = inverter;
        dcCable.cableSize = inverter.cableSize;
        dcCable.inverterId = inverter.id;
        dcCable.stringEnd = stringEnd;
        dcCable.inverterEnd = inverterEnd;
        dcCable.updateAutoRoutingBrokenOutlinePoints();
        dcCable.placeObject();
        return dcCable
    }

    isEnabled() {
        return this.enabled;
    }

    mouseDown = ( event ) => {
        if (event.buttons === 1) {
            if (this.mppt.getStringsLeft() === 0 && !event.shiftKey && this.break) {
                notificationsAssistant.info({
                    title: 'Stringing',
                    message: 'No more  Strings left to add.',
                });
            }
            else {
                // const mousePoint = utils
                // .getNormalizedCameraCoordinates(event.clientX, event.clientY, this);
                // const objects = raycastingUtils.getAllObjectsBelowPoint(mousePoint, this);
                // if (objects.length > 0 && raycastingUtils.checkPointOnGround(mousePoint, this)) {
                //     let i = 0;
                //     while (i < objects.length) {
                //         if(objects[i][0] instanceof DrawManager ||
                //             objects[i][0] instanceof OutlinePoints ||
                //             objects[i][0] instanceof LengthMeasurement ||
                //             objects[i][0] instanceof Dimension ||
                //             objects[i][0] instanceof ArcMeasurement ||
                //             objects[i][0] === undefined
                //             ) {
                //             i += 1;
                //         }
                //         else {
                //             break;
                //         }
                //     }
                const topObject = this.currentTopObject;
                this.currentTopObject = null;
                this.onMouseMove(event, topObject);
            }
        }
    }

    mouseup = ( event ) => {
        this.break = true;
    }

    onMouseMove(event, topObject) {
        if (this.currentTopObject !== topObject) {
            this.previousTopObject = this.currentTopObject;
            this.currentTopObject = topObject;
            if (this.enabled && event.buttons === 1 && !event.ctrlKey) {

                if (event.shiftKey) {
                    this.break = false;
                }

                if (this.currentTopObject instanceof Panel) {
                    if (this.break) {
                        if (this.mppt.getStringsLeft() > 0) {
                            if (this.currentString.getStringLength() > 0) {
                                // this.currentString.resetStringMesh();
                                this.currentString.drawOptimizers();
                                this.currentString.editStringColor();
                                this.stringsCount += 1;
                                this.removePanelsFromSelectable(this.currentString.linkedPanels);
                                this.currentString = new DCString(this.stage, this.mppt);
                                this.currentString.displayStringForStringing();
                                this.completedStrings.push(this.currentString);
                                this.mppt.addString(this.currentString);
                                // Juggad for dynamic update of completed strings in sappane
                                this.mppt.setCopyStrings();
                                this.break = false;
                            }
                        }
                        else {
                            // console.log('notify that the max string possible for the mppt has reached..');
                        }
                    }
                    if (this.mppt.getStringsLeft() === 0) {
                        if (!this.break) {
                            this.enterPanel();
                        }
                    }
                    else {
                        this.enterPanel();
                    }
                }
            }
        }
    }

    /**
     * Enter panel only called when this.currentTopObject
     * is the instance of a Panel.
     */
    enterPanel() {
        if (this.setMpptLinkedSubarray && this.currentTopObject.electricalComponentConnected == null) {
            const subarray = this.currentTopObject.getSubarray();
            this.setMpptLinkedSubarray = false;
            this.mppt.setLinkedSubarray(subarray);
            this.setUpStringingForProperties(this.mppt.linkedSubarray);
            //TODO: also setup the suggestions
            this.currentString.enterPanel(this.currentTopObject);
        }
        else if (this.selectablePanels.includes(this.currentTopObject)) {
            this.currentString.enterPanel(this.currentTopObject);
        }
    }

    removePanelsFromSelectable(panels) {
        for (let i = 0, l = panels.length; i < l; i += 1) {
            if (this.selectablePanels.includes(panels[i])) {
                this.selectablePanels.splice(this.selectablePanels.indexOf(panels[i]), 1);
            }
        }
    }
}
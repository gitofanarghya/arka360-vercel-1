import MicroInverter from '../objects/ac/MicroInverter';
import Mppt from '../objects/subArray/Mppt';
import { store } from '../../store';
import { v4 } from 'uuid';
import * as CONSTANTS from '../../componentManager/componentManagerConstants';
import { MICRO_INVERTER, STRING_INVERTER } from '../sld/sldConstants';
import { getSubarrays, getInverters } from '../utils/exporters';
import * as topBarAssistant from '../../componentManager/topBarAssistant';
import DCString from '../objects/subArray/DCString';
import ElectricalString from '../objects/subArray/ElectricalString';
import Panel from '../objects/subArray/Panel';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { serverBus } from '../../main';


export default class Stringing {
    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();

        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        this.stringingType = null;
        this.selectablePanels = [];
        this.inverter = undefined;
        this.stringingEnable = false;
        this.break = false;
    }

    init(object, initWithString = null) {
        if (this.stringingEnable) {
            console.error('StringingMode: Stringing mode already Initilized');
            notificationsAssistant.error({
                title: 'Stringing',
                message: 'Already in Stringing mode.',
            });
            return 'Stringing Mode Enabled';
        }

        this.selectablePanels = [];
        this.stringingEnable = true;
        this.initWithString = initWithString;
        this.completedStrings = [];
        this.break = false;

        if (object instanceof MicroInverter) {

            this.inverter = object;
            this.stringingType = MICRO_INVERTER;

        }
        else if (object instanceof Mppt) {

            this.mppt = object;
            this.setMpptLinkedSubarray = true;

            // TODO: could give better naming to inverter (parameter) 
            // renamed inverter as object
            this.inverter = object.inverter;

            this.stringingType = STRING_INVERTER;
        }
        // setup the topBar and sideBar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);

        // setup sapPane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        // topBar oncomplete and oncancel button binding
        topBarAssistant.setCompleteAction(this.onComplete.bind(this), this);
        topBarAssistant.setCancelAction(this.onCancel.bind(this));

        // setup stage:
        this.stage.visualManager.updateVisualsForEditing(true);
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.stateManager.startContainer();
        this.stage.viewManager.disableDimensions();

        // selectable panels initialization
        this.setupPanelsForStringing();

        // adding eventlisteners
        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseup, false);

    }

    mouseDown = ( event ) => {
        if (event.buttons === 1) {
            const topObject = this.currentTopObject;
            this.currentTopObject = null;
            if (this.stringingType === STRING_INVERTER) {
                if (this.mppt.getStringsLeft() === 0 && !event.shiftKey && this.break) {
                    notificationsAssistant.info({
                        title: 'Stringing',
                        message: 'No more  Strings left to add.',
                    });
                }
                else {
                    this.onMouseMove(event, topObject);
                }
            }
            else if (this.stringingType === MICRO_INVERTER) {
                this.onMouseMove(event, topObject);
            }
        }
    }

    mouseup = () => {
        this.break = true;
    }

    onMouseMove(event, topObject) {
        if (this.currentTopObject !== topObject) {
            this.currentTopObject = topObject;
            if (this.stringingEnable && event.buttons === 1 ) { // y event.ctrl?

                if (event.shiftKey) {
                    this.break = false;
                }

                if (this.currentTopObject instanceof Panel) {
                    if ((this.stringingType === MICRO_INVERTER) && (this.currentString.getStringLength() === this.inverter.maxString || this.break)) {
                        if (this.currentString.getStringLength() > 0) {
                            if (!this.currentString.linkedPanels.includes(this.currentTopObject)) {
                                this.currentString.editStringColor();
                                this.removePanelsFromSelectable(this.currentString.linkedPanels);
                                this.currentString = new ElectricalString(this.stage, this.inverter);
                                this.completedStrings.push(this.currentString);
                                this.currentString.displayStringForStringing();
                                this.inverter.addString(this.currentString);
                                this.break = false;
                            }
                            this.enterPanel();
                        }
                        else {
                            this.enterPanel();
                            this.break = false;
                        }
                    }
                    else if ((this.stringingType === STRING_INVERTER) && (this.mppt.getStringsLeft() > 0 && this.break)) {
                        if (this.currentString.getStringLength() > 0) {
                            this.currentString.drawOptimizers();
                            this.currentString.editStringColor();
                            this.removePanelsFromSelectable(this.currentString.linkedPanels);
                            this.currentString = new DCString(this.stage, this.mppt);
                            this.currentString.displayStringForStringing();
                            this.completedStrings.push(this.currentString);
                            this.mppt.addString(this.currentString);
                            this.enterPanel();
                            // Juggad for dynamic update of completed strings in sappane
                            this.mppt.setCopyStrings();
                            this.break = false;
                        }
                        else {
                            // console.log('notify that the max string possible for the mppt has reached..');
                        }
                    }
                    else if ((this.stringingType === STRING_INVERTER) && (this.mppt.getStringsLeft() === 0 && !this.break)) {
                        this.enterPanel();
                    }
                    else {
                        this.enterPanel();
                    }
                }
            }
        }
    }

    enterPanel() {
        if (this.stringingType === STRING_INVERTER) {
            if (this.setMpptLinkedSubarray && this.currentTopObject.electricalComponentConnected == null) {
                const subarray = this.currentTopObject.getSubarray();
                this.setMpptLinkedSubarray = false;
                this.mppt.setLinkedSubarray(subarray);
                this.updateValidPanelVisuals(this.mppt.linkedSubarray);
                //TODO: also setup the suggestions
                this.currentString.enterPanel(this.currentTopObject);
            }
            else if (this.selectablePanels.includes(this.currentTopObject)) {
                this.currentString.enterPanel(this.currentTopObject);
            }
            // Juggad for dynamic update of completed strings in sappane
            this.mppt.setCopyStrings();
        }
        else if (this.stringingType === MICRO_INVERTER) {
            if (this.selectablePanels.includes(this.currentTopObject)) {
                this.currentString.enterPanel(this.currentTopObject);
            }
        }
    }

    onComplete() {
        if (this.stringingType === MICRO_INVERTER) {
            if (this.currentString.getStringLength() === 0) {
                this.inverter.removeString(this.currentString);
            }
        }
        else if (this.stringingType === STRING_INVERTER) {
            this.currentString.drawOptimizers();
            if (this.currentString.getStringLength() === 0) {
                this.mppt.removeString(this.currentString);
            }
            // if required in inverterSummary.vue uncomment it
            // serverBus.$emit(CONSTANTS.UPDATE_INVERTER_DC_SIZE);
        }
        for (let i = 0, l = this.completedStrings.length; i < l; i += 1) {
            this.completedStrings[i].saveState();
        }
        this.currentString.editStringColor();
        this.stage.stateManager.stopContainer();
        if(!this.stage.viewManager.showStringing){
            this.hideString();
        }
        this.unintialize();
    }

    onCancel() {
        this.currentString.resetStringMesh();
        if (this.stringingType === STRING_INVERTER) {
            this.mppt.removeString(this.currentString);
        }
        else if (this.stringingType === STRING_INVERTER) {
            this.inverter.removeString(this.currentString);
            // if required in inverterSummary.vue uncomment it
            // serverBus.$emit(CONSTANTS.UPDATE_INVERTER_DC_SIZE);
        }
        for (let i = 0, l = this.completedStrings.length; i < l; i += 1) {
            this.completedStrings[i].deleteString();
        }
        this.stage.stateManager.stopContainer({ discard: true });
        if(!this.stage.viewManager.showStringing){
            this.hideString();
        }
        this.unintialize();
    }

    setupPanelsForStringing() {
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        if (this.stringingType === MICRO_INVERTER) {
            const { microInverters } = this.stage.ground;
            for (let i = 0; i < microInverters.length; i += 1) {
                if (microInverters[i] === this.inverter) {
                    const { panels } = microInverters[i];
                    this.selectablePanels.push(...panels);
                }
            }
            let tempStrings = [];
            let tempStringsLinkedPanels = [];

            tempStrings = this.inverter.strings;

            for( let i = 0; i < tempStrings.length; i += 1) {
                tempStringsLinkedPanels = tempStrings[i].linkedPanels;
                this.removePanelsFromSelectable(tempStringsLinkedPanels);
            }

            if (this.initWithString !== null) {
                this.currentString = this.initWithString;
                this.currentString.displayStringForStringing();
                this.currentString.updateString();
                // push the current string's linkedPanels to enable editing on them.
                this.selectablePanels.push(...this.initWithString.linkedPanels);
                this.completedStrings.push(this.currentString);
            }
            else {
                this.currentString = new ElectricalString(this.stage, this.inverter);
                this.completedStrings.push(this.currentString);
                this.inverter.addString(this.currentString);
            }

            this.showString();

        }
        else if (this.stringingType === STRING_INVERTER) {
            if (this.mppt.getAllLinkedPanels().length > 0) {
                this.setMpptLinkedSubarray = false;
                if (this.mppt.linkedSubarray === null || this.mppt.linkedSubarray === undefined) {
                    console.error('Stringing Mode: Linked subarray not setup for mppt');
                    // TODO:
                    // this might happen when we deleted the subarray
                    // in this case find any other linked subarray... from the linked panels
                    // if no subarray found then delete all the strings and notify the user.
                }
            }
            else {
                // do nothing;
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

            if (this.initWithString !== null) {
                this.currentString = this.initWithString;
                this.currentString.displayStringForStringing();
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
                this.showString();
            }

            const microInvertersArray = this.stage.ground.microInverters;
            for(let i = 0 ; i < microInvertersArray.length ; i++){
                microInvertersArray[i].showObject();
            }
            this.updateValidPanelVisuals(this.mppt.linkedSubarray);
        }
    }

    updateValidPanelVisuals(linkedSubarray) {
        if (this.stringingType === STRING_INVERTER) {
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

            const microInvertersArray = this.stage.ground.microInverters;
            for (let i = 0 ; i < microInvertersArray.length ; i++) {
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
    }

    showString() {
        const invertersArray = getInverters(this.stage);
        for (let i = 0; i < invertersArray.length; i++) {
            if (invertersArray[i]) {
                const mpptsArray = invertersArray[i].mppts;
                for (let j = 0; j < mpptsArray.length; j++) {
                    for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                        mpptsArray[j].strings[k].editStringColor();
                        mpptsArray[j].strings[k].displayStringForStringing();
                    }
                }
            }
        }
        const microInvertersArray = this.stage.ground.microInverters;
        for (let i = 0 ; i < microInvertersArray.length ; i += 1) {
            for (let j = 0; j < microInvertersArray[i].strings.length; j += 1) {
                microInvertersArray[i].strings[j].displayStringForStringing();
            }
        }
    }

    hideString() {
        const invertersArray = getInverters(this.stage);
        for (let i = 0; i < invertersArray.length; i++) {
            if (invertersArray[i]) {
                const mpptsArray = invertersArray[i].mppts;
                for (let j = 0; j < mpptsArray.length; j++) {
                    for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                        mpptsArray[j].strings[k].hideStringColor();
                    }
                }
            }
        }
        const microInvertersArray = this.stage.ground.microInverters;
        for (let i = 0 ; i < microInvertersArray.length ; i += 1) {
            for (let j = 0; j < microInvertersArray[i].strings.length; j += 1) {
                microInvertersArray[i].strings[j].hideStringColor();
            }
        }
    }

    removePanelsFromSelectable(panels) {
        for (let i = 0, l = panels.length; i < l; i += 1) {
            if (this.selectablePanels.includes(panels[i])) {
                this.selectablePanels.splice(this.selectablePanels.indexOf(panels[i]), 1);
            }
        }
    }

    unintialize() {
        // remove event listiners
        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseup, false);

        this.stringingEnable = false;
        this.completedStrings = [];
        this.currentTopObject = null;

        // make all subarray back to default color
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);
        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].exitStringingMode();
        }

        // hide MicroInverters
        if (this.stringingType === STRING_INVERTER) {
            const microInvertersArray = this.stage.ground.microInverters;
            for (let i = 0 ; i < microInvertersArray.length ; i++) {
                microInvertersArray[i].hideObject();
            }
        }

        // set TopBar and SideBar to normal
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // enable sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        // setup stage:
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.viewManager.enableDimensions();
    }

    isEnabled() {
        return this.stringingEnable;
    }
}
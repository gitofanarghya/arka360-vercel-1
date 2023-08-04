import { v4 } from 'uuid';
import { store } from '../../store';
import * as topBarAssistant from '../../componentManager/topBarAssistant';
import * as CONSTANTS from '../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import DcCable from '../objects/model/cable/DcCable';
import { getSubarrays } from '../utils/exporters';


export default class AddCablesMode {

    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        // initilizing the variables
        this.enabled = false;
        this.selectedConduit = null;
    }

    initialize(conduit) {
        if (this.enabled) {
            console.error('Add CableMode: Add Cable mode already Initilized');
            notificationsAssistant.error({
                title: 'Add Cable Mode',
                message: 'Already in Add Cable mode.',
            });
            return 'Add Cable Mode Enabled';
        }
        this.stage.stateManager.startContainer();

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        // store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

        topBarAssistant.setCompleteAction(this.onComplete.bind(this), this);
        topBarAssistant.setCancelAction(this.onCancel.bind(this));

        this.enabled = true;
        this.stage.visualManager.updateVisualsForEditing(true);
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.viewManager.disableDimensions();
        this.stage.hideSolarAccess();
        this.selectedConduit = conduit;
        this.stage.selectionControls.selectionRectangle.enableRectTool();
        // TODO: disable solar access and heat map.

        // set ground image to white with grids
        this.stage.ground.hideGroundImage();
        this.stage.ground.hideGrid();

        // use only wireframe for all subarrays
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].disableSubarrayForStringing();
        }
    }

    unintialize() {
        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].mergeGeometriesForAllPanels();
        }
        this.stage.ground.showGroundImage();
        this.stage.ground.showGrid();

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        this.enabled = false;
        this.stage.selectionControls.enable();
        this.stage.viewManager.enableDimensions();
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
    }

    onComplete() {
        const objects = this.stage.selectionControls.selectedObjects;
        let cableInToConduit = new Set();
        for(let i=0; i<this.selectedConduit.attachedDcCable.length; i++) {
            cableInToConduit.add(this.selectedConduit.attachedDcCable[i]);
        }
        for(let i=0; i<objects.length; i++) {
            if(objects[i] instanceof DcCable && !cableInToConduit.has(objects[i])) {
                this.snapIntoConduit(objects[i]);
                cableInToConduit.add(objects[i]);
                let cable = objects[i].findOtherCable();
                this.snapIntoConduit(cable);
                cableInToConduit.add(cable);
            }
        }

        cableInToConduit.clear();
        this.selectedConduit.saveState();

        this.stage.stateManager.stopContainer();
        this.unintialize();
    }

    snapIntoConduit(cable) {
        this.selectedConduit.inverter = cable.inverter;
        cable.attachedConduit.push(this.selectedConduit);
        cable.updateAutoRoutingBrokenOutlinePoints();
        cable.placeObject();
        this.selectedConduit.attachedDcCable.push(cable);
        cable.saveState();
    }

    onCancel() {
        this.stage.stateManager.stopContainer({ discard: true });
        this.unintialize();
    }

    isEnabled() {
        return this.enabled;
    }
}
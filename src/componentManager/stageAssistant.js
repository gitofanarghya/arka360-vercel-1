import LassoSelectionTool from '../core/lib/LassoSelectionTool';
import { serverBus } from '../main';
import { store } from '../store';
import * as CONSTANTS from './componentManagerConstants';

// TODO: Remove jugaad after properties refactor
let enabledBy = null;

function setEditMode(stage, editModeEnabled, duringOperation) {
    if (!stage.visualManager.in3D) {
        if (store.state.studio.stage.enabled === editModeEnabled) {
            if (editModeEnabled) {
                store.commit(CONSTANTS.STAGE_STATUS, false);
                store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
                store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
                store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);
                stage.selectionControls.disable();
                stage.dragControls.disable();
                stage.textSelectionControls.disable();
                switch (duringOperation) {
                case 0:
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
                    stage.rendererManager
                        .getDomElement()
                        .parentElement.addEventListener(
                            'mousedown',
                            stage.eventManager.setPropertyChanged,
                        );
                    break;
                case 1:
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
                    stage.rendererManager
                        .getDomElement()
                        .parentElement.addEventListener(
                            'mousedown',
                            stage.eventManager.setOptimiseClicked,
                        );
                    break;
                default:
                }
            }
            else {
                store.commit(CONSTANTS.STAGE_STATUS, true);
                store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                if(!stage.visualManager.in3D){
                    stage.selectionControls.enable();
                    stage.dragControls.enable();
                    stage.textSelectionControls.enable();
                }
                switch (duringOperation) {
                case 0:
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    stage.rendererManager
                        .getDomElement()
                        .parentElement.removeEventListener(
                            'mousedown',
                            stage.eventManager.setPropertyChanged,
                        );
                    break;
                case 1:
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                    stage.rendererManager
                        .getDomElement()
                        .parentElement.removeEventListener(
                            'mousedown',
                            stage.eventManager.setOptimiseClicked,
                        );
                    break;
                default:
                }
            }
        }
    }
}

function setPropertyEditMode(stage, enabled) {
    if (enabled) {
        enabledBy = 'PROPERTY';
        setEditMode(stage, enabled, 0);
    }
    else if (enabledBy === 'PROPERTY') {
        setEditMode(stage, enabled, 0);
    }
}

function setActionEditMode(stage, enabled) {
    if (enabled) {
        enabledBy = 'ACTIONS';
        setEditMode(stage, enabled, 1);
    }
    else if (enabledBy === 'ACTIONS') {
        setEditMode(stage, enabled, 1);
    }
}

function updateMapImage(stage, image) {
    stage.updateMapImage(image);
}

function switchToCustomImageEditMode(stage, imageData, imageId, transformations) {
    stage.switchToCustomImageEditMode(imageData, imageId, transformations);
}

function updateAllSubarrayColor(stage) {
    // jugaad fix for lassoSelection
    if (!(stage.drawManager.currentDrawingObject instanceof LassoSelectionTool)) {
        stage.updateSubarrayColor();
    }
}

function initStageCommunication(stage) {
    serverBus.$on(CONSTANTS.SET_PROPERTIES_EDIT_MODE, setPropertyEditMode.bind(null, stage));
    serverBus.$on(CONSTANTS.SET_ACTION_EDIT_MODE, setActionEditMode.bind(null, stage));
    serverBus.$on(CONSTANTS.UPDATE_MAP_IMAGE, updateMapImage.bind(null, stage));
    serverBus.$on(
        CONSTANTS.SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE,
        switchToCustomImageEditMode.bind(null, stage),
    );
    serverBus.$on('designSavedUpdated', updateAllSubarrayColor.bind(null, stage));
    serverBus.$on(CONSTANTS.UPDATE_DESIGN_SETTINGS, stage.updateDesignSettings.bind(stage));
    serverBus.$on('load3dTiles', stage.load3DMesh.bind(stage));
    serverBus.$on('hide3DTiles', stage.hide3DMesh.bind(stage));
    serverBus.$on('newBounds', stage.getUpdatedImageDimensionsOnResize.bind(stage));
    serverBus.$on('deleteModels', stage.deleteModelsOutsideGround.bind(stage));
}

function destroyStageCommunication() {
    serverBus.$off(CONSTANTS.SET_PROPERTIES_EDIT_MODE);
    serverBus.$off(CONSTANTS.SET_ACTION_EDIT_MODE);
    serverBus.$off(CONSTANTS.UPDATE_MAP_IMAGE);
    serverBus.$off(CONSTANTS.SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE);
    serverBus.$off(CONSTANTS.UPDATE_DESIGN_SETTINGS);
    serverBus.$off('newBounds');
    serverBus.$off('deleteModels');
}

function toggleMapImage(stage) {
    serverBus.$emit(
        CONSTANTS.TOGGLE_MAP_IMAGE,
        stage.viewManager.toggleMapImage.bind(stage.viewManager)
    );
}

function initCompass(stage) {
    serverBus.$emit(
        CONSTANTS.INIT_COMPASS,
        stage.controlsManager.reset.bind(stage.controlsManager)
    );
}

export { initStageCommunication, destroyStageCommunication, toggleMapImage, initCompass };

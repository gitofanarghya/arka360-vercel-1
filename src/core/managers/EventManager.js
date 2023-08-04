import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import {
    onObjectSelection,
    onObjectCreation,
    onSwitchToSLD,
    onSwitchToCustomImageEditMode,
onClickInverterMenu,
} from '../../componentManager/sapPaneAssistant';
import { onMouseMove, rKeyPress } from '../../componentManager/statusBarAssistant';
import { serverBus } from '../../main';
import * as CONSTANTS from '../../componentManager/componentManagerConstants';
import * as topBarAssistant from '../../componentManager/topBarAssistant';
import Table from '../objects/subArray/Table';
import { QUOTA_TYPES_DC_CAP_SIZE } from '../coreConstants.js';
import { TIERS_WITH_ALL_TIERS_DIFF } from '../coreConstants.js';
import { TIERS_WITH_ALL_TIERS_NOT_DIFF } from '../coreConstants.js';

import { store } from '../../store';
import API from '../../services/api';
import { imageURLToBase64 } from '../utils/customImageEditUtils';
import { isMetricUnit } from "../../components/ui/length/utils";
import Panel from "../objects/subArray/Panel";

export default class EventManager {
    constructor(stage) {
        this.stage = stage;
    }

    // Heat Map

    heatMapLoading() {
        store.commit('studio/sideBar/HEAT_MAP_BUTTON_STATUS', false);
        return notificationsAssistant.loading({
            title: 'Irradiance Map',
            message: 'Generating Irradiance map',
        });
    }

    heatMapLoaded(notificationObject) {
        store.commit('studio/sideBar/HEAT_MAP_BUTTON_STATUS', true);
        notificationsAssistant.close(notificationObject);
    }

    heatMapLoadingFailed(notificationObject) {
        this.heatMapLoaded(notificationObject);
        notificationsAssistant.error({
            title: 'Irradiance Map',
            message: 'Error generating Irradiance map',
        });
    }

    heatMapVisibility(visible) {
        store.commit('studio/sideBar/HEAT_MAP_VISIBILITY', visible);
    }

    // Solar Access

    solarAccessLoading() {
        store.commit(CONSTANTS.SOLAR_ACCESS_LOADING, true);
        // if (!localStorage.getItem('solaraccessData')) {
            return notificationsAssistant.loading({
                title: 'Solar Access',
                message: 'Calculating solar access',
            });
        // }
    }

    solarAccessLoaded(notificationObject) {
        store.commit(CONSTANTS.SOLAR_ACCESS_LOADING, false);
        notificationsAssistant.close(notificationObject);
    }

    solarAccessLoadingFailed(notificationObject) {
        this.solarAccessLoaded(notificationObject);
        notificationsAssistant.error({
            title: 'Solar Access',
            message: 'Solar access calculation failed',
        });
    }

    solarAccessVisibility(visible) {
        store.commit('studio/sideBar/SOLAR_ACCESS_VISIBILITY', visible);
    }

    solarAccessVisible() {
        return store.state.studio.sideBar.solarAccess.visible;
    }

    setSolarAccessLoadingForSubarray(subarrayName) {
        store.commit(CONSTANTS.SOLAR_ACCESS_LOADING, true);
        return notificationsAssistant.loading({
            title: 'Solar Access',
            message: `Calculating solar access for ${subarrayName}`,
        });
    }

    setSolarAccessFinishedForSubarray(notificationObject) {
        store.commit(CONSTANTS.SOLAR_ACCESS_LOADING, false);
        notificationsAssistant.close(notificationObject);
    }

    setSolarAccessFailedForSubarray(subarrayName, notificationObject) {
        this.setSolarAccessFinishedForSubarray(notificationObject);
        notificationsAssistant.error({
            title: 'Solar Access',
            message: `Solar access calculation failed for ${subarrayName}`,
        });
    }


    // Sun Simulation

    sunSimulationOn() {
        store.commit(CONSTANTS.SET_SUN_SIMULATION_STATUS, true);
    }

    sunSimulationOff() {
        store.commit(CONSTANTS.SET_SUN_SIMULATION_STATUS, false);
    }

    lidarSimulationOn() {
        store.commit(CONSTANTS.SET_LIDAR_STATUS, true);
    }

    lidarSimulationOff() {
        store.commit(CONSTANTS.SET_LIDAR_STATUS, false);
    }

    // Status Bar

    setCursorCoordinates(cursorCoordinates) {
        onMouseMove(cursorCoordinates);
    }

    setRepeatStatus(repeatEnabled) {
        store.commit(CONSTANTS.REPEAT_STATUS, repeatEnabled);
    }

    setRKeyPressed() {
        rKeyPress();
    }

    // Stage
    updateCameraAzimuth(azimuth) {
        store.commit(CONSTANTS.SET_CAMERA_AZIMUTH, azimuth);
    }

    setTopBarWhileDrawing(actionFunc, cancelFunc, drawingObject, manager) {
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);

        const promise = topBarAssistant.setCompleteAction(actionFunc.bind(manager), drawingObject);
        topBarAssistant.setCancelAction(cancelFunc.bind(manager));

        return promise;
    }

    // noinspection JSMethodCanBeStatic
    setObjectsCreated(object, options) {
        onObjectCreation(object, options);
    }

    // noinspection JSMethodCanBeStatic
    setObjectsSelected(objects) {
        if (objects instanceof Array) {
            if (objects.length > 0) {
                if (objects[0] instanceof Table || objects[0] instanceof Panel) {
                    if (objects.length > 1) {
                        // TODO: Do drag controls multi select here
                        onObjectSelection(objects);
                    } else {
                        onObjectSelection(objects[0]);
                    }
                } else {
                    onObjectSelection(objects[0]);
                }
            }
        } else {
            onObjectSelection(objects);
        }
    }

    // noinspection JSMethodCanBeStatic
    setPropertyChanged() {
        notificationsAssistant.warning({
            title: 'Property Changed',
            message: 'Please Update/Cancel property changes',
        });
    }

    setOptimiseClicked() {
        notificationsAssistant.warning({
            title: 'Optimise clicked',
            message: 'Please close optimise slider',
        });
    }


    // noinspection JSMethodCanBeStatic
    setComplexPolygonModelRemoved() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Complex shapes not supported. Model deleted.',
        });
    }

    setComplexDormerRemoved() {
        notificationsAssistant.error({
            title: 'Dormer',
            message: 'Complex shapes not supported. Model deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setComplexSubarrayRemoved() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Complex shapes not supported. Subarray deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setPolygonModelOutsideOnResizeRemoved() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Model now outside the base model. Model deleted.',
        });
    }

    setCylinderModelOutsideOnResizeRemoved() {
        notificationsAssistant.error({
            title: 'Cylinder',
            message: 'Model now outside the base model. Model deleted.',
        });
    }

    vertexNotAddedWarning() {
        notificationsAssistant.warning({
            title: 'Vertex too close, not added',
            message: 'This vertex was not added because it is too close to another vertex.',
        });
    }

    modelVertexEquivalentError() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Vertex placed over another vertex, model deleted.',
        });
    }

    invalidFaceDeletion() {
        notificationsAssistant.error({
            title: 'Smartroof Face',
            message: 'Single roof face is left. Cannot be deleted',
        });
    }

    foldError() {
        notificationsAssistant.error({
            title: 'Smartroof Face',
            message: 'Fold outside roof face, fold deleted.',
        });
    }

    invalidTiltErrorForCylinder() {
        notificationsAssistant.error({
            title: 'Cylinder',
            message: 'Tilt of cylinder is invalid, model deleted.',
        });
    }

    invalidCoreHeightErrorForCylinder() {
        notificationsAssistant.error({
            title: 'Cylinder',
            message: 'Core height of cylinder is invalid, model deleted.',
        });
    }

    invalidTiltErrorForPolygon() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Tilt of polygon is invalid, model deleted.',
        });
    }

    invalidCoreHeightErrorForPolygon() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Core height of polygon is invalid, model deleted.',
        });
    }

    subarrayVertexEquivalentError() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Vertex placed over another vertex, subarray deleted.',
        });
    }

    walkwayVertexEquivalentError() {
        notificationsAssistant.error({
            title: 'Walkway',
            message: 'Vertex placed over another vertex, walkway deleted.',
        });
    }

    subarrayEmptyError() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Empty subarray created, subarray deleted.',
        });
    }

    tableEmptyError() {
        notificationsAssistant.error({
            title: 'Table',
            message: 'Cannot Place Empty Table. Table deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setSubarrayOutsideOnResizeRemoved() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Subarray outside the base model. Subarray deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setWalkwayOutsideOnResizeRemoved() {
        notificationsAssistant.error({
            title: 'Walkway',
            message: 'Walkway now outside the base model. Walkway deleted.',
        });
    }

    setTableOutsideGroundRemoved() {
        notificationsAssistant.error({
            title: 'Table',
            message: 'Table outside Ground.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setPolygonModelOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Polygon',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setGazeboOutOfPolygonRemoved() {
        notificationsAssistant.error({
            title: 'Gazebo',
            message: 'Gazebo getting ouside the boundary. Gazebo deleted.',
        });
    }

    setCylinderModelOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Cylinder',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setTreeOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Tree',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setTextBoxOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Text Box',
            message: 'Shapes outside ground not supported. Text Box deleted.',
        });
    }

    setWalkwayOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Walkway',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setHandrailOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Handrail',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }
    
    setPropertyOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Property',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setInverterOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Inverter',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    inverterRemoved() {
        notificationsAssistant.error({
            title: 'Inverter',
            message: 'Intersecting model placement not supported. Model deleted.',
        });
    }

    dormerRemoved() {
        notificationsAssistant.error({
            title: 'Dormer',
            message: 'Dormer can only be placed on Pitched Roof. Model deleted.',
        });
    }

    setDcdbOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Dcdb',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    dcdbRemoved() {
        notificationsAssistant.error({
            title: 'Dcdb',
            message: 'Intersecting model placement not supported. Model deleted.',
        });
    }

    acdbRemoved() {
        notificationsAssistant.error({
            title: 'Inverter',
            message: 'Intersecting model placement not supported. Model deleted.',
        });
    }

    setACDBOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'ACDB',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setDormerOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Dormer',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setDCDBOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'DCDB',
            message: 'Shapes outside ground not supported. Model deleted.',
        });
    }

    setDCDBOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'DCDB',
            message: 'Shapes outside ground not supported. Model deleted.'
        });
    }

    // noinspection JSMethodCanBeStatic
    setSubarrayOutOfGroundRemoved() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Shapes outside ground not supported. Subarray deleted.',
        });
    }

    setCreateStrutureLoading() {
        return notificationsAssistant.loading({
            title: 'Structure',
            message: 'Creating Structures..',
        });
    }

    completeCreateStructureLoading(notificationObject) {
        notificationsAssistant.close(notificationObject)
    }

    setCreateSLDLoading() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        return notificationsAssistant.loading({
            title: 'SLD',
            message: 'SLD Loading',
        });
    }

    completeCreateSLDLoading(notificationObject) {
        notificationsAssistant.close(notificationObject)
    }

    setSaveWireSizeCalculator() {
        return notificationsAssistant.longInfo({
            title: 'Save WireSizeCalculator',
            message: 'Please save',
        });
    }

    // noinspection JSMethodCanBeStatic
    setUpdatePanelPlacementLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Subarray',
            message: 'Updating Subarray',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeUpdatePanelPlacementLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    setUpdatingCustomImageLoading() {
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        return notificationsAssistant.loading({
            title: 'Custom image',
            message: 'Applying custom image to the ground',
        });
    }

    // noinspection JSMethodCanBeStatic
    setPolygonModelLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Polygon',
            message: 'Updating Polygon',
        });
    }

    // noinspection JSMethodCanBeStatic
    setCylinderModelLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Cylinder',
            message: 'Updating Cylinder',
        });
    }

    // noinspection JSMethodCanBeStatic
    completePolygonModelLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setWalkwayCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Walkway',
            message: 'Creating Walkway',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeWalkwayCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorWalkwayCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Walkway',
            message: 'Error Creating walkway. Walkway deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setWalkwayLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Walkway',
            message: 'Updating Walkway',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeWalkwayLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setSafetyLineCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Safety Line',
            message: 'Creating Safety Line',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeSafetyLineCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorSafetyLineCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Safety Line',
            message: 'Error Creating safety line. Safety Line deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setSafetyLineLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Safety Line',
            message: 'Updating Safety Line',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeSafetyLineLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    setHandrailCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Handrail',
            message: 'Creating Handrail',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeHandrailCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorHandrailCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Handrail',
            message: 'Error Creating handrail. Handrail deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setHandrailLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Handrail',
            message: 'Updating Handrail',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeHandrailLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    setPropertyCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Property Line',
            message: 'Creating Property Line',
        });
    }

    // noinspection JSMethodCanBeStatic
    completePropertyCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorPropertyCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Property Line',
            message: 'Error Creating property line. Property Line deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setPropertyLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Property Line',
            message: 'Updating Property Line',
        });
    }

    // noinspection JSMethodCanBeStatic
    completePropertyLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    setAcCableCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Ac Cable',
            message: 'Creating Ac Cable',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeAcCableCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorAcCableCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Ac Cable',
            message: 'Error Creating ac cable. Ac Cable deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setAcCableLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Ac Cable',
            message: 'Updating Ac Cable',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeAcCableLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setTreeLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Tree',
            message: 'Updating Tree',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeTreeLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    setTextBoxLoading() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'TextBox',
            message: 'Updating TextBox',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeTextBoxLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setInverterLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Inverter',
            message: 'Updating Inverter',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeInverterLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setACDBLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'ACDB',
            message: 'Updating ACDB',
        });
    }

    setDormerLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Dormer',
            message: 'Updating Dormer',
        });
    }

    setDCDBLoading() {
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.textSelectionControls.disable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'DCDB',
            message: 'Updating DCDB',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeACDBLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    completeDormerLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    completeDCDBLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    closeNotificationObject(notificationObject) {
        notificationsAssistant.close(notificationObject);
    }


    completeLassoSelectionToolCreation() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
    }

    errorLassoSelectionToolCreation(error) {
        console.error('ERROR: topBarAssistant: onComplete failed', error);
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
    }

    completeCylinderModelLoading(notificationObject) {
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.textSelectionControls.enable();

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setCylinderModelCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Cylinder Model',
            message: 'Creating cylinder model',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeCylinderModelCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorCylinderModelCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Cylinder',
            message: 'Error Creating cylinder model. Cylinder model deleted.',
        });
    }

    setLidarLoading() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'LIDAR',
            message: 'Creating LIDAR image.',
        }); 
    }

    // noinspection JSMethodCanBeStatic
    completeLidarLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorLidarLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'LIDAR',
            message: 'Error getting LIDAR data.',
        });
    }

    completeLidarAutoFitLoading() {
        notificationsAssistant.success({
            title: 'LIDAR Auto Fit Complete',
            message: 'Models are being updated.',
       });
    }

    errorLidarAutoFitLoading() {
        notificationsAssistant.error({
            title: 'LIDAR',
            message: 'Error getting LIDAR data.',
        });
    }

    setTilesLoading() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        const loadingTexts = [
            "Unveiling a 3D masterpiece... Loading Google 3D.",
            "Crafting immersive dimensions... Loading 3D Data.",
            "Building a virtual reality... Loading Google 3D.",
            "Creating a lifelike world... Loading 3D Data.",
            "Forming a visual voyage... Loading Google 3D.",
            "Shaping the 3D landscape... Loading 3D Data.",
            "Forging a digital realm... Loading Google 3D.",
            "Bringing dimensions to life... Loading 3D Data.",
            "Constructing an immersive experience... Loading Google 3D.",
            "Designing a captivating 3D world... Loading 3D Google 3D."
          ];
          
          const randomLoadingText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];

        return notificationsAssistant.loading({
            title: 'Google 3D Data',
            message: randomLoadingText ,
        }); 
    }
    completeTilesLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }
    errorTilesLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Google 3D Data',
            message: 'OOPS! 3D tiles got tangled in a virtual traffic jam. Try again later...',
        });
    }
    errorTilesAlreadyLoaded() {
        notificationsAssistant.error({
            title: 'Google 3D Data',
            message: '3D data is already loaded.',
        });
    }

    setTreeCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'TREE',
            message: 'Creating Tree',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeTreeCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorTreeCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Tree',
            message: 'Error Creating Tree. Tree model deleted.',
        });
    }

    setRectangleCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Rectangle Obstruction',
            message: 'Creating rectangle',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeRectangleCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorRectangleCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Rectangle Obstruction',
            message: 'Error Creating Rectangle.',
        });
    }

    setTextBoxCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Text Box',
            message: 'Creating Text Box',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeTextBoxCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorTextBoxCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Text Box',
            message: 'Error Creating TextBox. Text Box model deleted.',
        });
    }

    setButtonStatusWhileTextEdit(onCompleteHandler, onCancelHandler, object) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.TEXT_TOOLBAR_ENABLED_STATE);
        topBarAssistant.setCompleteAction(onCompleteHandler, object);
        topBarAssistant.setCancelAction(onCancelHandler);

        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
    }

    onExitTextEditor() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
        store.commit(CONSTANTS.TEXT_TOOLBAR_HOME_STATE, true);
    }

    setACDBCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'ACDB',
            message: 'Creating ACDB',
        });
    }

    setDormerCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Dormer',
            message: 'Creating Dormer',
        });
    }

    setDCDBCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'DCDB',
            message: 'Creating DCDB',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeACDBCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    completeDormerCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    completeDCDBCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    completeDCDBCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject)
    }

    errorACDBCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'ACDB',
            message: 'Error Creating ACDB. ACDB model deleted.',
        });
    }

    errorDormerCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'Dormer',
            message: 'Error Creating Dormer. Dormer model deleted.',
        });
    }

    errorDCDBCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'DCDB',
            message: 'Error Creating DCDB. DCDB model deleted.',
        });
    }

    setInverterCreating() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'INVERTER',
            message: 'Creating Inverter',
        });
    }

    // noinspection JSMethodCanBeStatic
    completeInverterCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorInverterCreation(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);

        notificationsAssistant.error({
            title: 'INVERTER',
            message: 'Error Creating Inverter. Inverter model deleted.',
        });
    }

    setButtonStatusWhileEditingCustomImageInScaleGUIMode() {
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);
        return notificationsAssistant.longInfo({
            title: 'Scale',
            duration: 0,
            message: 'Please click on two points and enter the required distance between them to scale the image.',
        });
    }

    createNotificationForCustomImageEditMode() {
        return notificationsAssistant.longInfo({
            title: 'Custom image edit mode',
            duration: 0,
            message: 'You are in custom image edit mode. You can drag, rotate and scale your custom image. Click the complete button when you are done.',
        });
    }

    setButtonStatusWhileEditingCustomImage(onCompleteHandler, onCancelHandler, object) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_ONLY_COMPLETE_STATE);
        topBarAssistant.setCompleteAction(onCompleteHandler, object);
    }

    updateSAPPaneForCustomImage(customImage, params) {
        onSwitchToCustomImageEditMode(customImage, params);
    }

    finishCustomImageEditMode() {
        // Top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // SAP pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
    }

    setButtonStatusWhilePasting(onCancelHandler) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);
        topBarAssistant.setCancelAction(onCancelHandler);

        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
    }

    setButtonStatusWhileMirroring(onCancelHandler) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);
        topBarAssistant.setCancelAction(onCancelHandler);

        notificationsAssistant.info({
            title: 'Mirror Mode',
            message: 'Please Click any of the Highlighted Edges to Mirror the Object.',
        });

        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
    }

    setButtonStatusWhileSetbackEdit(onCompleteHandler, onCancelHandler, object) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        topBarAssistant.setCompleteAction(onCompleteHandler, object);
        topBarAssistant.setCancelAction(onCancelHandler);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
    }

    setButtonStatusWhileFaceEdit(onCompleteHandler, onCancelHandler, object) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        topBarAssistant.setCompleteAction(onCompleteHandler, object);
        topBarAssistant.setCancelAction(onCancelHandler);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);        
    }

    setPasteLoading() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

        return notificationsAssistant.loading({
            title: 'Paste',
            message: 'Pasting Object',
        });
    }

    completePasteLoading(notificationObject) {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    errorPasteLoading(notificationObject) {
        notificationsAssistant.error({
            title: 'Paste',
            message: 'Error while pasting.',
        });

        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);

        notificationsAssistant.close(notificationObject);
    }

    // noinspection JSMethodCanBeStatic
    setUpdatePanelPlacementComplete() {
        notificationsAssistant.success({
            title: 'Subarray',
            message: 'Subarray updated',
        });
    }

    // noinspection JSMethodCanBeStatic
    setUpdatePanelPlacementError() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Error updating subarray. Subarray deleted.',
        });
    }

    // noinspection JSMethodCanBeStatic
    setPlaceObjectComplete() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
    }

    addTableMode(subArray, options) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_UNDO_REDO_COMPLETE_STATE);
        /* TODO: The flow for Add Table has to be refactored
        to include function in EditMode on clicking cancel */
        // store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);
        onObjectCreation(subArray, options);
        topBarAssistant.setCompleteAction(this.stage.addTableMode.onCompleteAddTableMode
            .bind(this.stage.addTableMode), this.stage.addTableMode);
    }

    addGazeboMode(gazebo) {
       // updating the properties of gazebo in sappaneAssistant while placing.
        onObjectCreation(gazebo);
        topBarAssistant.setCompleteAction(this.stage.gazeboMode.onComplete
            .bind(this.stage.gazeboMode), this.stage.gazeboMode);
    }

    addInverterMode(inverter) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_ONLY_COMPLETE_STATE);
        /* TODO: The flow for Add Table has to be refactored
        to include function in EditMode on clicking cancel */
        // store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);
        topBarAssistant.setCompleteAction(this.stage.placeManager.onCancel
            .bind(this.stage.placeManager), inverter);
    }

    // noinspection JSMethodCanBeStatic
    setButtonsStatusOnTextSelect(actionFunc, cancelFunc, htmlText) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        topBarAssistant.setCompleteAction(actionFunc.bind(htmlText), htmlText);
        topBarAssistant.setCancelAction(cancelFunc.bind(htmlText));
    }

    // noinspection JSMethodCanBeStatic
    setButtonsStatusOnHomeState() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
    }

    setButtonsStatusWhileDragging(onCancelHandler) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, false);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);
        topBarAssistant.setCancelAction(onCancelHandler);
    }

    set3DViewDisabled() {
        store.commit(CONSTANTS.SIDEBAR_DISABLE_VIEWS);
    }

    set3DViewEnabled() {
        store.commit(CONSTANTS.SIDEBAR_ENABLE_VIEWS);
    }

    // noinspection JSMethodCanBeStatic
    setTextValueChanged() {
        notificationsAssistant.warning({
            title: 'Value Changed',
            message: 'Please Update/Cancel changes',
        });
    }

    // noinspection JSMethodCanBeStatic
    wrongLengthInputError() {
        if (isMetricUnit()) {
            notificationsAssistant.error({
                title: 'Edit Length',
                message: 'Length should be a positive real number with upto 3 decimal places. Cannot set this value.',
            });
        } else {
            notificationsAssistant.error({
                title: 'Edit Length',
                message: 'Input format is not valid.',
            });
        }
    }

    // noinspection JSMethodCanBeStatic
    wrongAngleInputError() {
        notificationsAssistant.error({
            title: 'Edit Angle',
            message: 'Angle should be a positive real number in degrees with upto 1 decimal place. Cannot set this value.',
        });
    }

    // dimension Error messages

    dimensionHiddenError() {
        notificationsAssistant.error({
            title: 'Dimension',
            message: 'Dimensions hidden. Cannot create new dimension.',
        });
    }

    noObjectOnStageError() {
        notificationsAssistant.error({
            title: 'Dimension',
            message: 'No object on stage to add dimension.',
        });
    }

    sameAssociationError() {
        notificationsAssistant.error({
            title: 'Dimension',
            message: 'Can\'t add dimension to same object.',
        });
    }

    wrongAssociationError() {
        notificationsAssistant.error({
            title: 'Dimension',
            message: 'Dimension not possible.',
        });
    }

    customErrorMessage(errorMessage, errorTitle = 'Error') {
        notificationsAssistant.error({
            title: errorTitle,
            message: errorMessage,
        });
    }

    wrongClickError() {
        notificationsAssistant.error({
            title: 'Dimension',
            message: 'Click over an Edge or Ground to attach dimension.',
        });
    }

    completeDimensionCreation() {
        // top bar and side bar
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);

        // sap pane
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
    }

    toggleNotPossibleWarning() {
        notificationsAssistant.warning({
            title: 'Dimension',
            message: 'Toggling direction not possible',
        });
    }

    subarrayTiltNotPossibleError() {
        notificationsAssistant.error({
            title: 'Subarray',
            message: 'Subarray tilt should be greater than roof tilt',
        });
    }

    clickCompleteButton() {
        document.getElementById('studio-app-complete-button').click();
    }

    clickCancelButton() {
        document.getElementById('studio-app-cancel-button').click();
    }

    setUndoStatus({ isEnabled }) {
        store.commit(CONSTANTS.SET_UNDO_AVAILABILITY, isEnabled);
    }

    setRedoStatus({ isEnabled }) {
        store.commit(CONSTANTS.SET_REDO_AVAILABILITY, isEnabled);
    }

    showSelectionContextMenu(event, name, selectionFunction, defaultLevel = 0) {
        serverBus.$emit(CONSTANTS.SHOW_SELECTION_CONTEXT_MENU, {
            event,
            name,
            selectionFunction,
            defaultLevel,
            disable: false,
        });
    }

    hideSelectionContextMenu() {
        serverBus.$emit(CONSTANTS.SHOW_SELECTION_CONTEXT_MENU, {
            disable: true,
        });
    }

    async uploadAndPatchImage(image) {
        let imageId;
        const imageTransformations = {
            offset: image.getOffset(),
            scale: image.getScaleInMeters(),
            rotation: image.getRotation(),
        };
        if (image.getImageId() !== undefined && image.getImageId() !== null) {
            await API.PROJECTS.PATCH_IMAGE_TRANSFORMATIONS(
                this.getProjectId(),
                Object.assign({ id: image.getImageId() }, imageTransformations),
            );

            imageId = image.getImageId();
        } else {
            const response = await API.PROJECTS.POST_CURRENT_STUDIO_IMAGE(
                this.getProjectId(),
                Object.assign({
                    image: await imageURLToBase64(image.getImage()),
                }, imageTransformations),
            );

            imageId = response.data.id;
        }

        const patchData = {
            map_image: imageId,
        };
        await store.dispatch("design/PATCH_DESIGN_VERSION_MAP_IMAGE", patchData);

        const imageUrl = (await API.PROJECTS
            .FETCH_PROJECT_MAP_IMAGE(imageId)).data.image;

        serverBus.$emit(
            CONSTANTS.SIDEBAR_UPDATE_UPLOAD_DIALOG_IMAGES,
            true,
            Object.assign({
                url: imageUrl,
                id: imageId,
            }, imageTransformations),
        );

        this.stage.updateMapImage(Object.assign({
            url: await imageURLToBase64(image.image),
        }, imageTransformations));
    }

    async saveCurrentDesignScene(sceneData) {
        await store.dispatch(
            'design/PATCH_DESIGN_VERSION_SCENE', [{ scene: Object.assign(this.getCurrentDesignScene(), sceneData) }, true],
        );
    }

    getCurrentDesignScene() {
        if (store.state.design.versions.scene) {
            return JSON.parse(JSON.stringify(store.state.design.versions.scene));
        }
        return {
            latitude: this.stage.latitude,
            longitude: this.stage.longitude,
            zoom: this.stage.zoom,
        };
    }

    cancelCustomImageUpload() {
        serverBus.$emit(CONSTANTS.SIDEBAR_UPDATE_UPLOAD_DIALOG_IMAGES, false);
    }

    updateSidebarFor2DSwitch() {
        serverBus.$emit(CONSTANTS.SET_2D_VIEW);
    }

    setButtonVisibilityIn2D() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
    }

    setButtonVisibilityIn3D() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_3D_VIEW);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_3D_VIEW);
    }

    setStudioForSLD() {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_SLD_VIEW);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_SLD_VIEW);
        onSwitchToSLD(this.stage);
    }

    setStudioForInverterMenu() {
        onClickInverterMenu(this.stage);
    }

    dcCapSizeExceeded() {
        serverBus.$emit(CONSTANTS.DC_CAP_SIZE_ERROR);
    }
    getMaxAllowedDCSize() {
        //if (design service based)
        if(this.isDesignServiceBased()){ 
            return TIERS_WITH_ALL_TIERS_DIFF[store.state.design.request_expert_service.site_size];
        }
        // when Subscribed AND SELF DESIGN
        else if(this.isAccountSubscribed() && !this.isDesignServiceBased()){
            return TIERS_WITH_ALL_TIERS_NOT_DIFF[store.state.design.project.add_ons_availed && store.state.design.project.add_ons_availed.project_type];
        }
        // (self design AND NON SUBSCRIBED)
        else if(!this.isDesignServiceBased() && !this.isAccountSubscribed() ){
            return TIERS_WITH_ALL_TIERS_DIFF[store.state.design.project.add_ons_availed && store.state.design.project.add_ons_availed.project_type];
        }

        return QUOTA_TYPES_DC_CAP_SIZE[this.getQuotaType()];
    }
    getQuotaType() {
        return store.state.project.quota_type;
    }
    isAccountSubscribed(){
        if (!JSON.parse(localStorage.getItem('allServicesInfo'))) return;
        let selfDesignId = JSON.parse(localStorage.getItem('allServicesInfo'))['self_designing_info']['id'];
        return !Boolean(selfDesignId);
    }
    isDesignServiceBased(){
        return Boolean(Object.keys(store.state.design.request_expert_service).length);
    }

    getProjectDesignName() {
        return `${store.state.design.project.name}_${store.state.design.name}`;
    }

    getWeatherID() {
        return store.state.design.project.weather.toString();
    }

    getProjectId() {
        return store.state.design.project.id;
    }
}
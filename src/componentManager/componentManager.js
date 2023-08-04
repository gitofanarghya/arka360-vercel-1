import Stage from '../core/App';
import * as sideBarAssistant from './sideBarAssistant';
import * as topBarAssistant from './topBarAssistant';
import * as stageAssistant from './stageAssistant';
import * as CONSTANTS from './componentManagerConstants';
import * as statusBarAssistant from './statusBarAssistant';

import { store } from '../store';

function loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData = {}) {
    const stage = new Stage();
    stage.loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData);
    stage.main();

    sideBarAssistant.initSideBar(stage);
    sideBarAssistant.initPolygonModel(stage);
    sideBarAssistant.initPolygonObstruction(stage);
    sideBarAssistant.initRectangleModel(stage);
    sideBarAssistant.initPitchedRoofModel(stage);
    sideBarAssistant.initDrawFace(stage);
    sideBarAssistant.initCylinderModel(stage);
    sideBarAssistant.initSubarray(stage);
    sideBarAssistant.initGazeboModel(stage);
    sideBarAssistant.initWalkway(stage);
    sideBarAssistant.initSafetyLine(stage);
    sideBarAssistant.initHandrail(stage);
    sideBarAssistant.initProperty(stage);
    sideBarAssistant.initTreeModel(stage);
    sideBarAssistant.initInverterMenu(stage);
    sideBarAssistant.initInverter(stage);
    sideBarAssistant.initACDB(stage);
    sideBarAssistant.initDCDB(stage);
    sideBarAssistant.initAcCable(stage);
    sideBarAssistant.initConduit(stage);
    sideBarAssistant.initDoubleConduit(stage);
    sideBarAssistant.initDoubleSeparateConduit(stage);
    sideBarAssistant.initSingleCableTray(stage);
    sideBarAssistant.initDoubleCableTray(stage);
    sideBarAssistant.initDoubleSeparateCableTray(stage);
    sideBarAssistant.initLassoSelectionTool(stage);
    sideBarAssistant.initTextBoxTool(stage);

    sideBarAssistant.initHeatMap(stage);
    sideBarAssistant.initIrradiance(stage);
    sideBarAssistant.initDimension(stage);
    sideBarAssistant.initTablePanelSelection(stage);
    sideBarAssistant.initSolarAccess(stage);
    sideBarAssistant.initViews(stage);
    sideBarAssistant.initLayers(stage);

    statusBarAssistant.initRepeat(stage.duplicateManager.handleRepeatCountChange
        .bind(stage.duplicateManager));

    topBarAssistant.setSaveAction(stage.saveStage.bind(stage));
    topBarAssistant.setUndoAction(stage.stateManager.undo.bind(stage.stateManager));
    topBarAssistant.setRedoAction(stage.stateManager.redo.bind(stage.stateManager));
    topBarAssistant.setSunSimulationRoofView(stage.updateSunRoofView.bind(stage));
    topBarAssistant.setSTLExportAction(stage.exportSTL.bind(stage));
    topBarAssistant.setDXFExportAction(stage.exportDXF.bind(stage));
    topBarAssistant.setVideoExportAction(stage.downloadVideo.bind(stage));
    topBarAssistant.setPDFExportAction(stage.exportPDF.bind(stage));
    topBarAssistant.setDesignDXFExportAction(stage.exportDesignDXF.bind(stage));
    topBarAssistant.setColladaExportAction(stage.exportCollada.bind(stage));

    stageAssistant.initStageCommunication(stage);
    stageAssistant.initCompass(stage);
    stageAssistant.toggleMapImage(stage);

    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
    store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
    store.commit(CONSTANTS.STAGE_STATUS, true);

    return stage;
}

function destroyStudio() {
    store.dispatch('studio/RESET_STATE');
    stageAssistant.destroyStageCommunication();
}

export { loadStage, destroyStudio };

import loBind from 'lodash/bind';
import { serverBus } from '../main';
import * as CONSTANTS from './componentManagerConstants';
import * as topBarAssistant from './topBarAssistant';
import * as sapPaneAssistant from './sapPaneAssistant';
import * as notificationsAssistant from './notificationsAssistant';
import { getSubarrays, getOptimizerQuantity } from '../core/utils/exporters';

import { store } from '../store';
import { getDefaultGroundSize } from '../core/utils/customImageEditUtils';
import { getFont } from '../core/objects/subObjects/textUtils';
import { ADD_EW_TABLE, SUBARRAY_RACK_STYLE_EWRACKING } from '../core/coreConstants';

function initSideBar(stage) {
    serverBus.$emit(
        CONSTANTS.INIT_SIDEBAR,
        stage.ground.getMicroinverters.bind(stage.ground),
        getOptimizerQuantity.bind(stage.ground, stage),
        stage.getImageDimensions.bind(stage),
        getDefaultGroundSize.bind(null, stage),
        stage.lidar.fetchData.bind(stage.lidar),
    );
}

function initPolygonModel(stage) {
    function onClickPolygon(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const model = stage.newPolygonModel.call(stage);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), model);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_POLYGON_MODEL, onClickPolygon.bind(null, stage));
}

function initPolygonObstruction(stage) {
    function onClickPolygon(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const model = stage.newPolygonModel.call(stage,true);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), model);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_POLYGON_OBSTRUCTION, onClickPolygon.bind(null, stage));
}

function initRectangleModel(stage) {
    function onClickRectangle(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const model = stage.newRectangleModel.call(stage);

        // topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), model);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_RECTANGLE_MODEL, onClickRectangle.bind(null, stage));
}

function initPitchedRoofModel(stage) {
    function onClickPitchedRoof(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const model = stage.newPitchedRoofModel.call(stage);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), model);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_PITCHED_ROOF_MODEL, onClickPitchedRoof.bind(null, stage));
}

function initDrawFace(stage) {
    function onClickDrawFace(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const model = stage.newDrawFace.call(stage);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), model);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_DRAW_FACE, onClickDrawFace.bind(null, stage));
}

function initLassoSelectionTool(stage) {
    function onClickLassoTool(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

        stage.selectionControls.newLassoSelection();
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        // TODO: update this method
        // sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_LASSO_TOOL, onClickLassoTool.bind(null, stage));
}

function initTextBoxTool(stage) {
    function onClickTextBoxTool(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);
        store.commit(CONSTANTS.TEXT_TOOLBAR_ALL_BUTTONS_DISABLED_STATE);

        const textBox = stage.newTextBox();

        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));

        sapPaneAssistant.onObjectCreation(textBox);
        // for reducing the FONT API calls when
        // initially loading the studio
        getFont();
    }

    serverBus.$emit(CONSTANTS.INIT_TEXT_TOOL, onClickTextBoxTool.bind(null, stage));
}

function initCylinderModel(stage) {
    function onClickCylinder(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const model = stage.newCylinderModel.call(stage);

        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(model);
    }

    serverBus.$emit(CONSTANTS.INIT_CYLINDER_MODEL, onClickCylinder.bind(null, stage));
}

function initTreeModel(stage) {
    function onClickTree(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const tree = stage.newTree.call(stage);

        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(tree);
    }

    serverBus.$emit(CONSTANTS.INIT_TREE_MODEL, onClickTree.bind(null, stage));
}

function initSubarray(stage) {
    function onClickManualSubarray(stage) {
        
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const subarray = stage.newSubarrayDrawingMode.call(stage);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), subarray);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(subarray);
    }

    function onClickManualEastWestRack(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const eastWestRack = stage.newEastWestRackDrawingMode.call(stage);

        topBarAssistant.setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), eastWestRack);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(eastWestRack);
    }
    function onClickAutoSubarray(appParameters) {
        function onClickComplete(appParameters) {
            function onClickSuggestion(applySuggestionFunc, appSuggestions, moduleProperties, suggestionId) {
                applySuggestionFunc(appSuggestions[suggestionId], moduleProperties);
            }

            function onClickComplete() {
                stage.stateManager.stopContainer();
                store.commit(CONSTANTS.SUGGESTION_BAR_SET_VISIBILITY, false);
                store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
                stage.viewManager.enableDimensions();
                stage.selectionControls.enable();
                stage.selectionControls.setSelectedObject(stage.ground);
            }

            function onClickCancel(deleteSubarrayFunc) {
                deleteSubarrayFunc();
                stage.stateManager.stopContainer();
                store.commit(CONSTANTS.SUGGESTION_BAR_SET_VISIBILITY, false);
                store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
                stage.viewManager.enableDimensions();
                stage.selectionControls.enable();
                stage.selectionControls.setSelectedObject(stage.ground);
            }

            let stage = this;

            stage.stateManager.startContainer();

            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);
            store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

            const notificationObject = notificationsAssistant.loading({
                title: 'Auto Panel Placement',
                message: 'Auto panel placement in progress',
            });

            stage.ground.onCompleteAppSelectionMode();

            stage.ground.autoPanelPlacement(appParameters).then(
                ([applySuggestionFunc, appSuggestions, moduleProperties, solarAccessCutoff, deleteSubarrayFunc]) => {
                    notificationsAssistant.close(notificationObject);
                    notificationsAssistant.success({
                        title: 'Auto Panel Placement',
                        message: 'Auto panel placement completed',
                    });

                    const suggestionsList = [];
                    let dcCapExceeded = false;
                    for (const appSuggestion of appSuggestions) {
                        let nPanelsAboveCutoff = 0;
                        let sumOfSolarAccessOfPanelsAboveCutoff = 0;
                        const solarAccess = appSuggestion.solarAccess;
                        for (const placableModelId of Object.keys(appSuggestion)) {
                            if (placableModelId !== 'solarAccess') {
                                const subarray = appSuggestion[placableModelId];
                                for (const row of subarray.rows) {
                                    for (const frame of row.frames) {
                                        let sumFrameSolarAccess = 0;
                                        let nPanelsInFrame = 0;
                                        for (const panel of frame.panels) {
                                            sumFrameSolarAccess += solarAccess[subarray.id][panel.id];
                                            nPanelsInFrame += 1;
                                        }
                                        if (sumFrameSolarAccess / nPanelsInFrame >= solarAccessCutoff) {
                                            nPanelsAboveCutoff += nPanelsInFrame;
                                            sumOfSolarAccessOfPanelsAboveCutoff += sumFrameSolarAccess;
                                        }
                                    }
                                }
                            }
                        }
                        const systemSize = Math.min(
                            nPanelsAboveCutoff,
                            Math.floor(stage.getRemainingDcSize() / moduleProperties.moduleSize),
                        ) * moduleProperties.moduleSize;
                        dcCapExceeded = Math.floor(stage.getRemainingDcSize() /
                            moduleProperties.moduleSize) < nPanelsAboveCutoff || dcCapExceeded;

                        suggestionsList.push({
                            systemSize,
                            avgSolarAccess: sumOfSolarAccessOfPanelsAboveCutoff / nPanelsAboveCutoff,
                        });
                        appSuggestion.systemSize = systemSize;
                    }
                    if (dcCapExceeded) {
                        stage.eventManager.dcCapSizeExceeded();
                    }
                    suggestionsList.sort((a, b) => b.systemSize - a.systemSize);
                    appSuggestions.sort((a, b) => b.systemSize - a.systemSize);
                    onClickSuggestion(applySuggestionFunc, appSuggestions, moduleProperties, 0);
                    serverBus.$emit(
                        CONSTANTS.INIT_SUGGESTION_BAR,
                        CONSTANTS.SUGGESTION_TYPE_AUTO_PANELS,
                        suggestionsList,
                        loBind(onClickSuggestion, null, applySuggestionFunc, appSuggestions, moduleProperties),
                    );

                    topBarAssistant.setCompleteAction(onClickComplete, stage.ground);
                    topBarAssistant.setCancelAction(onClickCancel.bind(null, deleteSubarrayFunc));
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
                },
                () => {
                    notificationsAssistant.close(notificationObject);
                    notificationsAssistant.error({
                        title: 'Auto Panel Placement',
                        message: 'Auto panel placement failed',
                    });

                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);

                    stage.viewManager.enableDimensions();

                    stage.selectionControls.enable();
                    stage.ground.onCancelAppSelectionMode();
                },
            );
        }

        function onClickCancel() {
            const stage = this;

            stage.ground.onCancelAppSelectionMode();

            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);

            stage.viewManager.enableDimensions();

            stage.selectionControls.enable();
        }

        const stage = this;

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

        stage.viewManager.disableDimensions();

        notificationsAssistant.info({
            title: 'Auto Panel Placement',
            message: 'Please select required models',
        });

        stage.ground.enableAppSelectionMode();

        topBarAssistant.setCompleteAction(onClickComplete.bind(stage, appParameters), stage.ground);
        topBarAssistant.setCancelAction(onClickCancel.bind(stage));
    }

    function onClickPanelDelete() {
        function onClickComplete() {
            this.editMode.onCompleteDeleteMode();
            this.editMode.disable();
            stage.stateManager.stopContainer();
            store.commit(CONSTANTS.SUGGESTION_BAR_SET_VISIBILITY, false);
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
        }

        function onClickCancel() {
            this.editMode.disable();
            stage.stateManager.stopContainer();
            store.commit(CONSTANTS.SUGGESTION_BAR_SET_VISIBILITY, false);
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
            store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
        }

        stage.stateManager.startContainer();

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);

        notificationsAssistant.info({
            title: 'Panel Delete Mode',
            message: 'Please select the Panels to delete.',
        });

        this.editMode.enable();
        this.editMode.initDeletePanelMode();
        topBarAssistant.setCompleteAction(onClickComplete.bind(stage), stage.ground);
        topBarAssistant.setCancelAction(onClickCancel.bind(stage));
    }

    function onClickAddTable() {
        let tableType = null;
        if (stage.getDesignSettings().drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) tableType = ADD_EW_TABLE;
        this.addTableMode.initAddTableMode(null, null, tableType);
    }

    serverBus.$emit(
        CONSTANTS.INIT_SUBARRAY,
        onClickManualSubarray.bind(null, stage),
        onClickManualEastWestRack.bind(null, stage),
        onClickAutoSubarray.bind(stage),
        stage.getDesignSettings.bind(stage),
        onClickPanelDelete.bind(stage),
        onClickAddTable.bind(stage),
    );
}
function initGazeboModel(stage) {
    function onClickGazebo(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_ONLY_COMPLETE_STATE);

        const gazebo = stage.newGazebo.call(stage);

        topBarAssistant.setCompleteAction(gazebo.onComplete.bind(gazebo), gazebo);
        sapPaneAssistant.onObjectCreation(gazebo.currentGazebo);
    }
    serverBus.$emit(CONSTANTS.INIT_GAZEBO_MODEL, onClickGazebo.bind(null,stage));
}

function initInverterMenu(stage) {
    // topBarAssistant.setCancelAction(staTON_STATUS_NO_COMPLETE_DRAWING_STATE);
    serverBus.$emit(CONSTANTS.INIT_INVERTER_MENU, stage.switchToInverterMenu.bind(stage));
}

function initInverter(stage) {
    // function onClickInverter(stage) {
    //     store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
    //     store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

    // //     const inverter = stage.newInverter.call(stage);
    //         stage.switchToInverterMenu.call(stage)
    //         topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
    // //     sapPaneAssistant.onObjectCreation(inverter);
    //  }
    // // topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));

    // //serverBus.$emit(CONSTANTS.INIT_INVERTER, onClickInverter.bind(stage));
    topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
    store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);
    serverBus.$emit(CONSTANTS.INIT_INVERTER, stage.switchToInverterMenu.bind(stage));
}

function initACDB(stage) {
    function onClickACDB(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const acdb = stage.newACDB.call(stage);
        topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
        sapPaneAssistant.onObjectCreation(acdb);
    }

    serverBus.$emit(CONSTANTS.INIT_ACDB, onClickACDB.bind(null, stage));
}

function initDCDB(stage) {
    function onClickDCDB(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const dcdb = stage.newDCDB.call(stage);
        topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
        sapPaneAssistant.onObjectCreation(dcdb);
    }

    serverBus.$emit(CONSTANTS.INIT_DCDB, onClickDCDB.bind(null, stage));
}

function initAcCable(stage) {
    function onClickAcCable(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const cable = stage.newAcCable.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), cable);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(cable);
    }

    serverBus.$emit(CONSTANTS.INIT_ACCABLE, onClickAcCable.bind(null, stage));
}

function initConduit(stage) {
    function onClickConduit(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const conduit = stage.newConduit.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), conduit);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(conduit);
    }

    serverBus.$emit(CONSTANTS.INIT_CONDUIT, onClickConduit.bind(null, stage));
}

function initDoubleConduit(stage) {
    function onClickDoubleConduit(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const doubleConduit = stage.newDoubleConduit.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), doubleConduit);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(doubleConduit);
    }

    serverBus.$emit(CONSTANTS.INIT_DOUBLECONDUIT, onClickDoubleConduit.bind(null, stage));
}

function initDoubleSeparateConduit(stage) {
    function onClickDoubleSeparateConduit(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const doubleSeparateConduit = stage.newDoubleSeparateConduit.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), doubleSeparateConduit);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(doubleSeparateConduit);
    }

    serverBus.$emit(CONSTANTS.INIT_DOUBLESEPARATECONDUIT, onClickDoubleSeparateConduit.bind(null, stage));
}

function initSingleCableTray(stage) {
    function onClickSingleCableTray(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const singleCableTray = stage.newSingleCableTray.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), singleCableTray);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(singleCableTray);
    }

    serverBus.$emit(CONSTANTS.INIT_SINGLECABLETRAY, onClickSingleCableTray.bind(null, stage));
}

function initDoubleCableTray(stage) {
    function onClickDoubleCableTray(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const doubleCableTray = stage.newDoubleCableTray.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), doubleCableTray);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(doubleCableTray);
    }

    serverBus.$emit(CONSTANTS.INIT_DOUBLECABLETRAY, onClickDoubleCableTray.bind(null, stage));
}

function initDoubleSeparateCableTray(stage) {
    function onClickDoubleSeparateCableTray(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const doubleSeparateCableTray = stage.newDoubleSeparateCableTray.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), doubleSeparateCableTray);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(doubleSeparateCableTray);
    }

    serverBus.$emit(CONSTANTS.INIT_DOUBLESEPARATECABLETRAY, onClickDoubleSeparateCableTray.bind(null, stage));
}

function initHeatMap(stage) {
    serverBus.$emit(
        CONSTANTS.INIT_HEAT_MAP,
        stage.heatMap.show.bind(stage.heatMap),
        stage.heatMap.refresh.bind(stage.heatMap),
        stage.heatMap.hide.bind(stage.heatMap),
    );
}

function initSolarAccess(stage) {
    async function onClickShow() {
        const subarrays = [];
        getSubarrays(stage.ground, subarrays);
        if (!subarrays.every(subarray => subarray.isSolarAccessComputed())) {
            await stage.asyncManager.updateSolarAccess();
        }
        stage.showSolarAccess();
    }

    async function onClickRefresh() {
        await stage.asyncManager.updateSolarAccess();
        stage.showSolarAccess();
    }

    function onClickHide() {
        stage.hideSolarAccess();
    }

    serverBus.$emit(
        CONSTANTS.INIT_SOLAR_ACCESS,
        onClickShow.bind(null, stage),
        onClickRefresh.bind(null, stage),
        onClickHide.bind(null, stage),
    );

    serverBus.$emit(
        CONSTANTS.INIT_SOLAR_ACCESS_COLOR_BAR,
        stage.getSolarAccessColorMap(),
        0.7, 1.0, 0.01,
    );
}

function initIrradiance(stage) {
    async function onClickShowSolarAccess(stage) {
        const subarrays = [];
        getSubarrays(stage.ground, subarrays);
        if (!subarrays.every(subarray => subarray.isSolarAccessComputed())) {
            await stage.asyncManager.updateSolarAccess();
        }
        stage.showSolarAccess();
    }

    function onClickHideSolarAccess(stage) {
        stage.hideSolarAccess();
    }

    serverBus.$emit(
        CONSTANTS.INIT_IRRADIANCE,
        onClickShowSolarAccess.bind(null, stage),
        onClickHideSolarAccess.bind(null, stage),
        stage.heatMap.show.bind(stage.heatMap),
        stage.heatMap.hide.bind(stage.heatMap),
        stage.lightsManager.enableShadows.bind(stage.lightsManager),
        stage.lightsManager.disableShadows.bind(stage.lightsManager),
    );
}

function initViews(stage) {

    // function getMicroInverterInScene() {
    //     let microInverterInScene = (stage.ground.microInverters.length > 0) ? true : false ;
    //     return microInverterInScene;
    // }

    serverBus.$emit(
        CONSTANTS.INIT_VIEWS,
        stage.switchTo2d.bind(stage),
        stage.switchTo3d.bind(stage),
        stage.switchToSLD.bind(stage),
        // getMicroInverterInScene,
        stage.getMicroInverterInScene.bind(stage),
    );
}

function initWalkway(stage) {
    function onClickWalkway(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const walkway = stage.newWalkway.call(stage);

        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(walkway);
    }

    serverBus.$emit(CONSTANTS.INIT_WALKWAY_MODEL, onClickWalkway.bind(null, stage));
}

function initSafetyLine(stage) {
    function onClickSafetyLine(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

        const safetyLine = stage.newSafetyLine.call(stage);

        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(safetyLine);
    }

    serverBus.$emit(CONSTANTS.INIT_SAFETY_LINE_MODEL, onClickSafetyLine.bind(null, stage));
}

function initHandrail(stage) {
    function onClickHandrail(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const handrail = stage.newHandrail.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), handrail);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(handrail);
    }

    serverBus.$emit(CONSTANTS.INIT_HANDRAIL_MODEL, onClickHandrail.bind(null, stage));
}

function initProperty(stage) {
    function onClickProperty(stage) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);

        const property = stage.newProperty.call(stage);

        topBarAssistant
            .setCompleteAction(stage.drawManager.onComplete.bind(stage.drawManager), property);
        topBarAssistant.setCancelAction(stage.drawManager.onCancel.bind(stage.drawManager));
        sapPaneAssistant.onObjectCreation(property);
    }

    serverBus.$emit(CONSTANTS.INIT_PROPERTY_MODEL, onClickProperty.bind(null, stage));
}

function initLayers(stage) {
    function onToggleLength(stage) {
        stage.viewManager.toggleLength();
    }

    function onToggleArc(stage) {
        stage.viewManager.toggleArc();
    }

    function onToggleRafter(stage) {
        stage.viewManager.toggleRafter();
    }

    function onToggleProperty(stage) {
        if (!(stage.visualManager.getIn3D())) {
            stage.viewManager.onToggleProperty();
        }
    }

    function onToggleDimension(stage) {
        stage.viewManager.toggleDimension();
    }

    function onToggleShowStringing(stage) {
        stage.viewManager.toggleShowStringing();
    }

    function onToggleSetback(stage) {
        stage.viewManager.toggleSetback();
    }

    function onToggleMapImage(stage) {
        stage.viewManager.toggleMapImage();
    }

    function onToggleEdgeCenter(stage) {
        stage.viewManager.toggleEdgeCenter();
    }

    serverBus.$emit(
        CONSTANTS.INIT_LAYERS,
        onToggleLength.bind(null, stage),
        onToggleArc.bind(null, stage),
        onToggleRafter.bind(null, stage),
        onToggleProperty.bind(null, stage),
        onToggleDimension.bind(null, stage),
        onToggleShowStringing.bind(null, stage),
        onToggleSetback.bind(null, stage),
        onToggleMapImage.bind(null, stage),
        stage.getImageDimensions.bind(stage),
        getDefaultGroundSize.bind(null, stage),
        onToggleEdgeCenter.bind(null, stage),
    );
}

function initDimension(stage) {
    function onClickDimension(stage) {
        const dimension = stage.newDimension.call(stage);
        if (dimension !== null) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);
            topBarAssistant.setCancelAction(dimension.stage.drawManager.onCancel.bind(dimension.stage.drawManager));
            sapPaneAssistant.onObjectCreation(dimension);
        }
    }

    serverBus.$emit(CONSTANTS.INIT_DIMENSION, onClickDimension.bind(null, stage));
}

function initTablePanelSelection(stage) {
    function toggleToTable(stage) {
        stage.defaultPanelSelection = false;
    }

    function toggleToPanel(stage) {
        stage.defaultPanelSelection = true;
    }
    const toggleFunctions = {
        toggleToTable: toggleToTable.bind(null, stage),
        toggleToPanel: toggleToPanel.bind(null, stage),
    }
    serverBus.$emit(CONSTANTS.INIT_TABLE_PANEL, toggleFunctions);
}

export {
    initSideBar,
    initPolygonModel,
    initPolygonObstruction,
    initRectangleModel,
    initPitchedRoofModel,
    initDrawFace,
    initSubarray,
    initGazeboModel,
    initHeatMap,
    initSolarAccess,
    initIrradiance,
    initViews,
    initWalkway,
    initSafetyLine,
    initHandrail,
    initProperty,
    initLayers,
    initDimension,
    initTablePanelSelection,
    initCylinderModel,
    initLassoSelectionTool,
    initTreeModel,
    initInverterMenu,
    initInverter,
    initACDB,
    initDCDB,
    initAcCable,
    initDoubleConduit,
    initDoubleSeparateConduit,
    initConduit,
    initDoubleCableTray,
    initDoubleSeparateCableTray,
    initSingleCableTray,
    initTextBoxTool,
};
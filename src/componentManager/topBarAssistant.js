import { serverBus } from '../main';
import * as CONSTANTS from './componentManagerConstants';
import PolygonModel from '../core/objects/model/PolygonModel';
import Handrail from '../core/objects/model/Handrail';
import Property from '../core/objects/model/Property';
import Subarray from '../core/objects/subArray/Subarray';
import * as notificationsAssistant from './notificationsAssistant';
import HTMLText from '../core/objects/subObjects/HTMLText';
import Ground from '../core/objects/ground/Ground';
import * as utils from '../core/utils/utils';
import BaseObject from '../core/objects/BaseObject';
import Inverter from '../core/objects/ac/Inverter';
import Conduit from '../core/objects/ac/conduits/Conduit';
import DoubleConduit from '../core/objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../core/objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../core/objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../core/objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../core/objects/ac/cableTrays/DoubleSeparateCableTray';
import MicroInverter from '../core/objects/ac/MicroInverter';
import { store } from '../store';
import CustomImage from '../core/objects/ground/CustomImage';
import Table from '../core/objects/subArray/Table';
import SetbackEditMode from '../core/lib/SetbackEditMode';
import AcCable from '../core/objects/model/cable/AcCable';
import DcCable from '../core/objects/model/cable/DcCable';
import TextEditor from '../core/objects/subObjects/TextEditor';
import StringingMode from '../core/lib/StringingMode';
import { SmartroofModel } from '../core/objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../core/objects/model/smartroof/SmartroofFace';
import Dormer from '../core/objects/model/smartroof/Dormer';
import AddCablesMode from '../core/lib/AddCablesMode';
import MicroInverterSelectionMode from '../core/managers/MicroInverterSelectionMode';
import EditMode from '../core/lib/EditMode';
import RafterEditMode from '../core/lib/RafterEditMode';
import GazeboMode from '../core/lib/GazeboMode';
import AddTableMode from '../core/lib/AddTableMode';
import SmartroofSetbackEditMode from '../core/lib/smartroofSetbackEditMode';
import FaceSelectMode from '../core/lib/FaceSelectMode';
import AttachmentEditMode from '../core/lib/AttachmentEditMode';
import Stringing from '../core/lib/stringing';


function setCompleteAction(actionFunc, object) {
    function onClickComplete(actionFunc, object) {
        if (object instanceof BaseObject) {
            const { drawManager } = object.stage;
            const points =
                utils.drawingArrayTo2DArray(drawManager.vertices, drawManager.numVertices);
            const placingInformation = object.getPlacingInformation(points);
            if (drawManager.getValidationError() !== null) {
                object.stage.eventManager
                    .customErrorMessage(drawManager.getValidationError().message);
                return;
            }
            if (placingInformation.cannotCompleteError !== null &&
                placingInformation.cannotCompleteError !== undefined) {
                object.stage.eventManager
                    .customErrorMessage(placingInformation.cannotCompleteError.message);
                return;
            }
        }

        if (object instanceof PolygonModel || object instanceof SmartroofModel || object instanceof SmartroofFace) {
            const notificationObject = notificationsAssistant.loading({
                title: 'Polygon Model',
                message: 'Creating polygon model.',
            });

            actionFunc().then(
                () => {
                    notificationsAssistant.close(notificationObject);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                },
                (error) => {
                    console.error('ERROR: topBarAssistant: onComplete failed', error);
                    notificationsAssistant.close(notificationObject);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                },
            );
        } else if (object instanceof Subarray) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_LOADING_STATE);
            store.commit(CONSTANTS.SET_PROPERTIES_STATUS, false);

            const notificationObject = notificationsAssistant.loading({
                title: 'Subarray',
                message: 'Creating Subarray',
            });

            // TODO: Promise
            Promise.resolve(actionFunc()).then(
                (success) => {
                    notificationsAssistant.close(notificationObject);
                    if (!success) {
                        notificationsAssistant.error({
                            title: 'Subarray',
                            message: 'Error creating subarray. Subarray deleted.',
                        });
                    }
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
                (error) => {
                    console.error('ERROR: topBarAssistant: onComplete failed', error);
                    notificationsAssistant.close(notificationObject);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
            );
        } else if (object instanceof Inverter) {
            if(store.getters['studio/sapPane/GET_INVERTER_DROPDOWN_STATUS']) {
                object.stage.stateManager.stopContainer();
                return;
            }
            actionFunc();
        } else if (object instanceof Dormer) {
            actionFunc();
        } else if (object instanceof MicroInverter) {
            actionFunc();
        } else if (object instanceof HTMLText) {
            actionFunc();
        } else if (object instanceof Ground) {
            actionFunc();
        } else if (object instanceof CustomImage) {
            actionFunc();
        } else if (object instanceof Table) {
            actionFunc();
        } else if (object instanceof SetbackEditMode || object instanceof SmartroofSetbackEditMode) {
            actionFunc().then(
                () => {
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
                (error) => {
                    console.error('ERROR: topBarAssistant: onComplete failed', error);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
            );
        } else if (object instanceof RafterEditMode || object instanceof AttachmentEditMode) {
            actionFunc().then(
                () => {
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
                (error) => {
                    console.error('ERROR: topBarAssistant: onComplete failed', error);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
            );
        } else if (object instanceof FaceSelectMode) {
            actionFunc().then(
                () => {
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
                (error) => {
                    console.error('ERROR: topBarAssistant: onComplete failed', error);
                    store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
                    store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
                    store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
                    store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
                },
            );            
        }
        else if (object instanceof Handrail) {
            actionFunc();
        }
        else if (object instanceof Property) {
            actionFunc();
        }
        else if (object instanceof AcCable) {
            actionFunc();
        } else if (object instanceof DcCable) {
            actionFunc();
        } else if (object instanceof Conduit) {
            actionFunc();
        } else if (object instanceof DoubleConduit) {
            actionFunc();
        } else if (object instanceof DoubleSeparateConduit) {
            actionFunc();
        } else if (object instanceof SingleCableTray) {
            actionFunc();
        } else if (object instanceof DoubleCableTray) {
            actionFunc();
        } else if (object instanceof DoubleSeparateCableTray) {
            actionFunc();
        } else if (object instanceof TextEditor) {
            actionFunc();
        } else if (object instanceof StringingMode) {
            actionFunc();
        } else if (object instanceof Stringing) {
            actionFunc();
        } else if (object instanceof AddCablesMode) {
            actionFunc();
        } else if (object instanceof MicroInverterSelectionMode) {
            actionFunc();
        } else if (object instanceof EditMode) {
            actionFunc();
        } else if (object instanceof GazeboMode) {
            actionFunc();
        } else if (object instanceof AddTableMode) {
            actionFunc();
        } else {
            console.error('ERROR: TopBarAssistant: Unknown object passed to onClickComplete function', object);
        }
    }

    return new Promise((resolve) => {
        serverBus.$emit(
            CONSTANTS.SET_COMPLETE,
            onClickComplete.bind(null, actionFunc, object),
            resolve,
        );
    });
}

function setCancelAction(actionFunc) {
    function onClickCancel(actionFunc) {
        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_SUMMARY_STATUS, true);
        store.commit(CONSTANTS.SET_ACTIONS_STATUS, true);
        store.commit(CONSTANTS.SET_PROPERTIES_STATUS, true);
        store.commit(CONSTANTS.TEXT_TOOLBAR_HOME_STATE, true);

        // execution of actionFunc at last as it might change status of buttons
        // like in draw manager via HtmlText
        actionFunc();
    }
    serverBus.$emit(CONSTANTS.SET_CANCEL, onClickCancel.bind(null, actionFunc));
}

function setSaveAction(saveFunc) {
    function onClickSave(saveFunc) {
        return saveFunc();
    }

    serverBus.$emit(CONSTANTS.SET_SAVE, onClickSave.bind(null, saveFunc));
}

function setUndoAction(undoFunc) {
    function onClickUndo(undoFunc) {
        undoFunc();
    }

    serverBus.$emit(CONSTANTS.SET_UNDO, onClickUndo.bind(null, undoFunc));
}

function setRedoAction(redoFunc) {
    function onClickRedo(redoFunc) {
        redoFunc();
    }

    serverBus.$emit(CONSTANTS.SET_REDO, onClickRedo.bind(null, redoFunc));
}

function setSunSimulationRoofView(updateSun) {
    function onUpdateSun(updateSun, sunTime) {
        return updateSun(sunTime);
    }

    serverBus.$emit(CONSTANTS.SET_SUN_SIMULATION_ROOF_VIEW, onUpdateSun.bind(null, updateSun));
}

function setSTLExportAction(exportFunc) {
    function onClickSTLExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_STL_EXPORT, onClickSTLExport.bind(null, exportFunc));
}

function setColladaExportAction(exportFunc) {
    function onClickColladaExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_DAE_EXPORT, onClickColladaExport.bind(null, exportFunc));
}

function setDXFExportAction(exportFunc) {
    function onClickDXFExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_DXF_EXPORT, onClickDXFExport.bind(null, exportFunc));
}

function setVideoExportAction(exportFunc) {
    function onClickVideoExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_VIDEO_EXPORT, onClickVideoExport.bind(null, exportFunc));
}

function setDesignDXFExportAction(exportFunc) {
    function onClickDXFExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_DESIGN_DXF_EXPORT, onClickDXFExport.bind(null, exportFunc));
}

function setPDFExportAction(exportFunc) {
    function onClickPDFExport(exportFunc) {
        return exportFunc();
    }

    serverBus.$emit(CONSTANTS.SET_PDF_EXPORT, onClickPDFExport.bind(null, exportFunc));
}

export {
    setCompleteAction,
    setCancelAction,
    setSaveAction,
    setUndoAction,
    setRedoAction,
    setSunSimulationRoofView,
    setSTLExportAction,
    setColladaExportAction,
    setDXFExportAction,
    setVideoExportAction,
    setDesignDXFExportAction,
    setPDFExportAction,
};
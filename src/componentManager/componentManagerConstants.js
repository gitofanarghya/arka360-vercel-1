import STUDIO_STORE_MUTATION_TYPES from '../store/modules/studio/mutationTypes';
import STAGE_STORE_MUTATION_TYPES from '../store/modules/studio/modules/stage/mutationTypes';
import SIDEBAR_STORE_MUTATION_TYPES from '../store/modules/studio/modules/sideBar/mutationTypes';
import TOPBAR_STORE_MUTATION_TYPES from '../store/modules/studio/modules/topBar/mutationTypes';
import SUGGESTION_BAR_STORE_MUTATION_TYPES from '../store/modules/studio/modules/suggestionBar/mutationTypes';
import SAP_PANE_STORE_MUTATION_TYPES from '../store/modules/studio/modules/sapPane/mutationTypes';
import STATUS_BAR_MUTATION_TYPES from '../store/modules/studio/modules/statusBar/mutationTypes';
import TEXT_TOOL_BAR_STORE_MUTATION_TYPES from '../store/modules/studio/modules/textToolBar/mutationTypes';

// studio
const STUDIO_STORE_PATH = 'studio/';
export const SOLAR_ACCESS_LOADING =
    STUDIO_STORE_PATH + STUDIO_STORE_MUTATION_TYPES.SOLAR_ACCESS_LOADING;
export const SET_SUN_SIMULATION_STATUS =
    STUDIO_STORE_PATH + STUDIO_STORE_MUTATION_TYPES.SET_SUN_SIMULATION_STATUS;
export const SET_LIDAR_STATUS =
    STUDIO_STORE_PATH + STUDIO_STORE_MUTATION_TYPES.SET_LIDAR_STATUS;

export const DC_CAP_SIZE_ERROR = 'DC_CAP_SIZE_ERROR';

// stage
export const SHOW_SELECTION_CONTEXT_MENU = 'selection-context-menu';
export const UPDATE_MAP_IMAGE = 'update-map-image';
export const SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE = 'switch-to-custom-image-edit-mode';
export const UPDATE_DESIGN_SETTINGS = 'designVersionSettingsUpdated';
export const INIT_COMPASS = 'init-compass';
export const TOGGLE_MAP_IMAGE = 'toggle_map_image';

const STAGE_STORE_PATH = 'studio/stage/';
export const STAGE_STATUS = STAGE_STORE_PATH + STAGE_STORE_MUTATION_TYPES.SET_STATUS;
export const SET_CAMERA_AZIMUTH = STAGE_STORE_PATH + STAGE_STORE_MUTATION_TYPES.SET_CAMERA_AZIMUTH;
export const ALL_MAP_BUTTONS_DISABLED_STATE = STAGE_STORE_PATH + STAGE_STORE_MUTATION_TYPES.ALL_MAP_BUTTONS_DISABLED_STATE;
export const ALL_MAP_BUTTONS_ENABLED_STATE = STAGE_STORE_PATH + STAGE_STORE_MUTATION_TYPES.ALL_MAP_BUTTONS_ENABLED_STATE;

// side bar
export const INIT_SIDEBAR = 'init-sidebar';
export const INIT_POLYGON_MODEL = 'init-polygon-model';
export const INIT_POLYGON_OBSTRUCTION = 'init-polygon-obstruction';
export const INIT_RECTANGLE_MODEL = 'init-rectangle-model';
export const INIT_PITCHED_ROOF_MODEL = 'init-pitched-roof-model';
export const INIT_DRAW_FACE = 'init-draw-face';
export const INIT_CYLINDER_MODEL = 'init-cylinder-model';
export const INIT_WALKWAY_MODEL = 'init-walkway';
export const INIT_SAFETY_LINE_MODEL = 'init-safety-line';
export const INIT_HANDRAIL_MODEL = 'init-handrail';
export const INIT_PROPERTY_MODEL = 'init-property';
export const INIT_TREE_MODEL = 'init-tree';
export const INIT_SUBARRAY = 'init-subarray';
export const INIT_GAZEBO_MODEL = 'init-gazebo';
export const INIT_INVERTER = 'init-inverter';
export const INIT_INVERTER_MENU = 'init-inverter-menu';
export const INIT_ACDB = 'init-acdb';
export const INIT_DCDB = 'init-dcdb';
export const INIT_ACCABLE = 'init-accable';
export const INIT_DCCABLE = 'init-dccable';
export const INIT_CONDUIT = 'init-conduit';
export const INIT_DOUBLECONDUIT = 'init-doubleconduit';
export const INIT_DOUBLESEPARATECONDUIT = 'init-doubleseparateconduit';
export const INIT_SINGLECABLETRAY = 'init-singlecabletray';
export const INIT_DOUBLECABLETRAY = 'init-doublecabletray';
export const INIT_DOUBLESEPARATECABLETRAY = 'init-doubleseparatecabletray';

export const INIT_HEAT_MAP = 'init-heat-map';
export const INIT_SOLAR_ACCESS = 'init-solar-access';
export const INIT_SOLAR_ACCESS_COLOR_BAR = 'init-solar-access-color-bar';
export const INIT_IRRADIANCE = 'init-irradiance';
export const INIT_DIMENSION = 'init-dimension';
export const INIT_LASSO_TOOL = 'init-lasso-tool';
export const INIT_TEXT_TOOL = 'init-text-tool';
export const INIT_TABLE_PANEL = 'init-table-panel-select';

export const INIT_VIEWS = 'init-views';
export const INIT_LAYERS = 'init-layers';
export const SET_2D_VIEW = 'set-2d-view';

const SIDEBAR_STORE_PATH = 'studio/sideBar/';
export const SIDEBAR_BUTTON_STATUS_HOME_STATE =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.HOME_STATE;
export const SIDEBAR_BUTTON_STATUS_3D_VIEW =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.VIEW_3D_STATE;
export const SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.ALL_BUTTONS_DISABLED_STATE;
export const SIDEBAR_BUTTON_STATUS_SLD_VIEW =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.VIEW_SLD_STATE;
export const SIDEBAR_UPDATE_UPLOAD_DIALOG_IMAGES =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.UPDATE_UPLOAD_DIALOG_IMAGES;
export const SIDEBAR_BUTTON_STATUS_LASSO_TOOL = 
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.LASSO_ENABLED;
export const SIDEBAR_DISABLE_VIEWS =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.DISABLE_VIEW;
export const SIDEBAR_ENABLE_VIEWS =
    SIDEBAR_STORE_PATH + SIDEBAR_STORE_MUTATION_TYPES.ENABLE_VIEW;

// top bar
export const SET_UNDO = 'set-undo';
export const SET_REDO = 'set-redo';
export const SET_COMPLETE = 'set-complete';
export const SET_CANCEL = 'set-cancel';
export const SET_SAVE = 'set-save';
export const SET_SUN_SIMULATION_ROOF_VIEW = 'set-sun-simulation-roof-view';
export const SET_DAE_EXPORT = 'set-dae-export';
export const SET_STL_EXPORT = 'set-stl-export';
export const SET_DXF_EXPORT = 'set-dxf-export';
export const SET_DESIGN_DXF_EXPORT = 'set-design-dxf-export';
export const SET_VIDEO_EXPORT = 'set-video-export';
export const SET_PDF_EXPORT = 'set-pdf-export';

const TOPBAR_STORE_PATH = 'studio/topBar/';
export const TOPBAR_BUTTON_STATUS_HOME_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.HOME_STATE;
export const TOPBAR_BUTTON_STATUS_3D_VIEW =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.VIEW_3D_STATE;
export const TOPBAR_BUTTON_STATUS_LOADING_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.LOADING_STATE;
export const TOPBAR_BUTTON_STATUS_CANCEL_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.CANCEL_STATE;
export const TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.COMPLETE_CANCEL_STATE;
export const TOPBAR_BUTTON_STATUS_DRAWING_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.DRAWING_STATE;
export const TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.NO_COMPLETE_DRAWING_STATE;
export const TOPBAR_BUTTON_STATUS_UNDO_REDO_COMPLETE_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.UNDO_REDO_COMPLETE_STATE;
export const TOPBAR_BUTTON_STATUS_ONLY_COMPLETE_STATE =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.ONLY_COMPLETE_STATE;
export const SET_UNDO_AVAILABILITY =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.UNDO_AVAILABILITY;
export const SET_REDO_AVAILABILITY =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.REDO_AVAILABILITY;
export const TOPBAR_BUTTON_STATUS_SLD_VIEW =
    TOPBAR_STORE_PATH + TOPBAR_STORE_MUTATION_TYPES.VIEW_SLD_STATE;

// status bar
export const MOUSE_MOVE = 'mouse-move';
export const INIT_REPEAT = 'init-repeat';
export const R_KEY_PRESSED = 'r-key-pressed';

const STATUS_BAR_STORE_PATH = 'studio/statusBar/';
export const REPEAT_STATUS = STATUS_BAR_STORE_PATH +
    STATUS_BAR_MUTATION_TYPES.SET_REPEAT_VISIBILITY;

// sap pane
export const SET_SAP_PANE = 'set-sap-pane';
export const SET_ACTION_EDIT_MODE = 'set-action-edit-mode';
export const SET_PROPERTIES_EDIT_MODE = 'set-properties-edit-mode';

const SAP_PANE_STORE_PATH = 'studio/sapPane/';
export const SET_SUMMARY_STATUS =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_SUMMARY_STATUS;
export const SET_ACTIONS_STATUS =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_ACTIONS_STATUS;
export const SET_PROPERTIES_STATUS =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_PROPERTIES_STATUS;
export const SET_SETBACKEDIT_STATUS =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_SETBACKEDIT_STATUS;
export const SET_INVERTER_DROPDOWN_STATUS =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_INVERTER_DROPDOWN_STATUS;
export const SET_CREATION_MODE =
    SAP_PANE_STORE_PATH + SAP_PANE_STORE_MUTATION_TYPES.SET_CREATION_MODE;

export const UPDATE_INVERTER_DC_SIZE = 'update-inverter-dc-size';

// suggestion bar
export const SUGGESTION_TYPE_AUTO_PANELS = 'suggestion-type-auto-panels';
export const SUGGESTION_TYPE_AUTO_STRING = 'suggestion-type-auto-string';
export const SUGGESTION_TYPE_AUTO_WIRE = 'suggestion-type-auto-wire';
export const INIT_SUGGESTION_BAR = 'init-suggestion-bar';

const SUGGESTION_BAR_STORE_PATH = 'studio/suggestionBar/';
export const SUGGESTION_BAR_SET_VISIBILITY =
    SUGGESTION_BAR_STORE_PATH + SUGGESTION_BAR_STORE_MUTATION_TYPES.SET_VISIBILITY;

// text tool bar
export const SET_TEXT_TOOL_BAR = 'set-text-tool-bar';
// export const SET_TEXT_ACTION_EDIT_MODE = 'set-text-action-edit-mode';
// export const SET_TEXT_PROPERTIES_EDIT_MODE = 'set-text-properties-edit-mode';

const TEXT_TOOL_BAR_STORE_PATH = 'studio/textToolBar/';
export const TEXT_TOOLBAR_HOME_STATE =
    TEXT_TOOL_BAR_STORE_PATH + TEXT_TOOL_BAR_STORE_MUTATION_TYPES.HOME_STATE;
export const TEXT_TOOLBAR_ENABLED_STATE =
    TEXT_TOOL_BAR_STORE_PATH + TEXT_TOOL_BAR_STORE_MUTATION_TYPES.TOOLBAR_ENABLED_STATE;
export const TEXT_TOOLBAR_ALL_BUTTONS_DISABLED_STATE =
    TEXT_TOOL_BAR_STORE_PATH + TEXT_TOOL_BAR_STORE_MUTATION_TYPES.ALL_BUTTONS_DISABLED_STATE;

export const SELECTION_CONTEXT_MENU_CLASS_NAME = 'text_each_items';

export const PANEL_SELECTION_DROPDOWN_MENU_CLASS_NAME = 'filter-input-light SearchField searchInput';

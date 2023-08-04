import { PRODUCTION_ENV } from "../constants"
export { PRODUCTION_ENV } from "../constants"

export const CAMERA_TYPE_3D = 'perspective';
export const CAMERA_TYPE_2D = 'orthographic';
export const ORTHO_CAMERA_Z = 500;

export const MAX_DRAWING_POINTS = 500;

export const SUN_REVOLUTION_RADIUS = 200;
export const LOW_SHADOW_MAP_RESOLUTION = 2048;

export const MAX_STRINGING_VERTICES = 1000;

export const DEFAULT_GAZEBO_STRUCTURE = 'PGUS01-01M1-77- 4x8';
export const DEFAULT_GAZEBO_INVERTER_TYPE = 'Enphase IQ7PLUS-72-2-US';
export const DEFAULT_GAZEBO_MODULEMAKE = 'Arka Energy Arka_E_77_SP(N)';
export const DEFAULT_GAZEBO_MOUNTHEIGHT = 2.1336;
export const DEFAULT_GAZEBO_TILT = 6.75;

export const PANEL_ORIENTATION_LANDSCAPE = 'Landscape';
export const PANEL_ORIENTATION_PORTRAIT = 'Portrait';
export const SUBARRAY_RACK_STYLE_FIXED = 'Fixed Tilt';
export const SUBARRAY_RACK_STYLE_FLUSH = 'Tilted Mount';
export const SUBARRAY_RACK_STYLE_EWRACKING = 'East West Racking';
export const ARKA_PERGOLAS_TILT_VALUES = ['PGIN-01S1-250-D01', 'PGUS01-01M1-77-4.8', 'PGUS01-01M1-77-5.8'];
export const STRUCTURE_TYPES = ['Default Fixed Tilt', 'Pergola',
    'Low Foundation Fixed Tilt', 'Four MMS One Leg', 'Four MMS Two Leg',
    'Ballast Type 1', 'Ballast Type 2', 'Ballast Type 3',
    'General Ballast', 'UNIRAC RM 5', 'UNIRAC RM 10', 'Ground Mount MMS',
    'Elevated MMS', 'Fixed Tilt 2500mm'
];
export const ADD_EAST_TABLE = 'East Table';
export const ADD_WEST_TABLE = 'West Table';
export const ADD_EW_TABLE = 'East West Table';
export const ROW_SPACING_MODE_AUTO = 'Auto';
export const ROW_SPACING_MODE_MANUAL = 'Manual';
export const TILT_LOCKED = 'tilt';
export const RAFTER_ORIENTATION_PARALLEL = 'Parallel';
export const RAFTER_ORIENTATION_PERPENDICULAR = 'Perpendicular';
export const ATTACHMENT_ORIENTATION_PARALLEL = 'Parallel';
export const ATTACHMENT_RADIUS = 0.0758;
export const ATTACHMENT_ORIENTATION_STAGGERED = 'Staggered';
export const ATTACHMENT_ALIGNMENT = 'attachmentAlignment';
export const RAFTER_ALIGNMENT = 'rafterAlignment';
export const TOP_HEIGHT_LOCKED = 'topHeight';
export const CORE_HEIGHT_LOCKED = 'coreHeight';
export const EDIT_SETBACK_INSIDE = 'setbackInside';
export const EDIT_SETBACK_OUTSIDE = 'setbackOutside';
export const OBSTRUCTION_TYPES = ['Chimney,Skylight,AC Unit'];
export const ACCABLE_MATERIAL_TYPE_COPPER = 'copper';
export const ACCABLE_MATERIAL_TYPE_ALUMINIUM = 'aluminium';
export const ACCABLE_SIZE_AWG = ['0000', '000', '00', '0', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
export const ACCABLE_SIZE_MM = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000];
export const MANUAL_ACCABLE_SIZE_MMSQ = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000];
export const CABLE_TYPE = ['Copper', 'Aluminium'];
export const MANUAL_STRING_AWG = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, '0 (1/0)', '00 (2/0)', '000 (3/0)', '0000 (4/0)', '250MCM', '300MCM', '350MCM', '400MCM', '450MCM', '500MCM', '550MCM', '600MCM', '650MCM', '700MCM', '750MCM', '800MCM', '900MCM', '1000MCM', '1100MCM'];
export const SNAP_RADIUS = 3;
export const NO_OF_CELLS = 128;

export const CYLINDER_SEGMENTS = 32;
export const CYLINDER_PLUS_SIZE_PERCENT = 10;
export const TREE_SEGMENTS = 32;
export const BLOCK_UTILS_CYLINDER_SEGMENTS = 12;

export const BASE_URL = PRODUCTION_ENV ? '13.234.123.80' :
    'https://betaapi.thesolarlabs.com:5000/';

export const CONVERTER_URL = 'designs/dae-to-3ds';

export const COMPLEX_GEOMETRY_ERROR = 'Complex geometries not supported';
export const VERTEX_EQUIVALENT_ERROR =
    'New vertex is same as another placed vertex';
export const OUT_OF_GROUND_ERROR = 'Model is outside ground';
export const OUT_OF_BASE_MODEL_ERROR = 'Model is outside roof.';
export const MODEL_INTERSECTION_WITH_OTHER_MODELS = 'Model is intersecting with other models.';
export const TABLE_OUT_OF_GROUND_ERROR = 'Table is outside ground';
export const OUT_OF_ASSOCIATED_MODEL_ERROR = 'Table outside the roof. Table deleted';
export const OUT_OF_POLYGON_MODEL = 'Cannot place Gazebo on the edge of the polygon';
export const COMBINATION_IS_NOT_POSSIBLE_ERROR = 'This combination of azimuth and tilt is not possible on this Surface. Cannot place.';
export const PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR =
    'ParentWithinChildSoNoSetbackOutsidePossibleError';
export const LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR = 'Need more vertices to complete object';
export const LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR =
    'Less vertices than needed for drawing object';
export const LAST_EDGE_INTERSECTION_ERROR = 'Intersecting models are not supported';
export const POLYGON_WITH_NO_AREA_ERROR = 'Polygon has no area';
export const CYLINDER_WITH_NO_AREA_ERROR = 'Cylinder has no area';
export const TREE_WITH_NO_AREA_ERROR = 'Tree has no area';
export const INVERTER_WITH_NO_AREA_ERROR = 'Inverter has no area';
export const ACDB_WITH_NO_AREA_ERROR = 'ACDB has no area';
export const DCDB_WITH_NO_AREA_ERROR = 'DCDB has no area';
export const INTERSECTING_AC_COMPONENT_ERROR = 'Intersecting model placement are not allowed';
export const DORMER_INVALID_PARENT_ERROR = 'Dormer can only be placed on Pitched Roof';
export const DIMENSION_INVALID_ERROR = 'Dimension is not valid';
export const VERTEX_OVER_EDGE_ERROR = 'Vertex is over an edge';
export const INSUFFICIENT_VERTICES = "Insufficient number of vertices";
export const TREE_WITH_SMALL_CROWN_ERROR = 'Tree has small crown than trunk';
export const INVALID_PROPERTIES_ERROR = 'Cannot complete with invalid properties';
export const INVALID_PROPERTIES_FOR_TABLE_ERROR = 'Cannot add table with invalid properties';
export const INVALID_TILT_ERROR = 'Tilt is invalid';
export const INVALID_TOP_HEIGHT_ERROR = 'Top height is invalid';
export const INVALID_CORE_HEIGHT_ERROR = 'Core height is invalid';
export const TABLE_TILT_LOWER_THAN_PARENT_TILT_ERROR = 'Table tilt is lower than roof tilt';
export const PASTE_TABLE_WITHOUT_SUBARRAY_ERROR =
    'Cannot paste table(s) since subarray does not exist in the design';
export const DC_CAP_REACHED_ERROR = 'Cannot complete operation properly because you have reached the maximum allowed DC size';

export const SCENE_UPDATED = 'scene-updated';
export const CAMERA_UPDATED = 'camera-updated';
export const ENABLE_TEXT_SELECTION = 'enable-text-selection';
export const DISABLE_TEXT_SELECTION = 'disable-text-selection';

export const CREATED_STATE = 'created-state';
export const DELETED_STATE = 'deleted-state';

export const TEMP_STACK_USED_BY_DRAW_MANAGER = 'temp-stack-used-by-draw-manager';
export const TEMP_STACK_USED_BY_EDIT_MODE = 'temp-stack-used-by-edit-mode';

export const CLIPBOARD_READ_ACCESS = 'clipboard-read';
export const CLIPBOARD_WRITE_ACCESS = 'clipboard-write';

export const DEFAULT_WALKWAY_DIRECTION = 'default-walkway-direction';
export const ALTERNATE_WALKWAY_DIRECTION = 'alternate-walkway-direction';

export const DEFAULT_HANDRAIL_DIRECTION = 'default-handrail-direction';
export const ALTERNATE_HANDRAIL_DIRECTION = 'alternate-handrail-direction';

export const DEFAULT_VERTICES_DIRECTION = 'default-direction';
export const ALTERNATE_VERTICES_DIRECTION = 'alternate-direction';

export const COORDINATE_CLOSENESS_PRECISION = 0.007;

export const PANEL_TYPE_POLYCRYSTALLINE = 'Polycrystalline';
export const PANEL_TYPE_MONOCRYSTALLINE = 'Monocrystalline';
export const HIGH_PANEL_COVERAGE_AREA = 33;


export const DYNAMIC_OFFSET_ITERATION_STEPS = {
    5000: 100,
    10000: 40,
    Infinity: 15,
};

export const SHADOW_VIEW_SUMMER_SOLSTICE = 'Summer';
export const SHADOW_VIEW_WINTER_SOLSTICE = 'Winter';
export const SHADOW_VIEW_MORNING_TIME = 'Morning';
export const SHADOW_VIEW_EVENING_TIME = 'Evening';

export const QUOTA_TYPES_DC_CAP_SIZE = {
    SMALL: 25,
    MEDIUM: 200,
    LARGE: Math.Infinity,
};

export const CROSSHAIR = "url('data:image/x-icon;base64,AAACAAEAICACAA8AEAAwAQAAFgAAACgAAAAgAAAAQAAAAAEAAQAAAAAAgAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAA////AAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAAAAAAAH/wH/wAAAAAAAAAAAAAAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAAAAAAAAAAA//x////8f////H////x////8f////H////x////8f////H////x////8f////H////x///////8ABEABAAVAAQAEQAH///////x////8f////H////x////8f////H////x////8f////H////x////8f////H////x///////8='), auto";
export const TIERS_WITH_ALL_TIERS_DIFF = {
    T1:25,
    T2:200,
    T3:500,
    T4:5000
};
export const TIERS_WITH_ALL_TIERS_NOT_DIFF = {
    T1:25,
    T2:200,
    T3:Math.Infinity,
    T4:Math.Infinity,
};
export const INVALID_SCALE = 0;
// View Manager Constants
export const POLYGON_EDGE_CENTER_VISIBILTY_DEFAULT = false;
export const EDGE_LENGTH_VISIBILTY_DEFAULT = true;
export const ARC_VISIBILTY_DEFAULT = false;
export const RAFTER_VISIBILTY_DEFAULT = true;
export const PROPERTY_VISIBILTY_DEFAULT = true;
export const DIMENSION_VISIBILTY_DEFAULT = true;
export const SETBACK_VISIBILTY_DEFAULT = true;
export const MAPIMAGE_VISIBILTY_DEFAULT = true;
export const STRINGING_VISIBILTY_DEFAULT = false;

// Layers Constant for design dxf export
export const PANEL_COLOR = 5;
export const OBSTACLES_COLOR = 31;
export const ROOF_COLOR = 4;
export const SHADOW_COLOR = 5;
export const HANDRAIL_COLOR = 16;
export const STRING_COLOR = 0;
export const FRAME_THICKNESS = 0.05;
export const ROOF_THICKNESS = 0.3;
export const STRING_THICKNESS = 0.05;
export const WALKWAY_COLOR = 1;
export const SAFETYLINE_COLOR = 21;
export const AC_CABLE_COLOR = 136;
export const DC_STRING_COLOR = 200;
export const RAFTERS_COLOR = 104;
export const RAILS_COLOR = 35;
export const MICROINVERTERS_COLOR = 2;
export const OPTIMIZERS_COLOR = 2;
export const SETBACK_COLOR = 4;
export const PROPERTY_COLOR = 160;
export const PROPERTY_DIMENSION_COLOR = 10;
export const ATTACHMENT_COLOR = 13;

export const SETBACKDROPDOWNLIST = [
    '0 INCHES',
    '18 INCHES',
    '36  INCHES',
];
export const ZERO_INCH_SETBACK = 0;
export const EIGHTEEN_INCH_SETBACK = 18 * 0.0254;
export const THIRTYSIX_INCH_SETBACK = 36 * 0.0254;
export const fancyConsoleMessage = '%c Welcome To Design Studio';
export const fancyConsoleProperty = 'font-weight: bold; font-size: 50px;color: red; text-shadow: 3px 3px 0 rgb(217,31,38) , 6px 6px 0 rgb(226,91,14) , 9px 9px 0 rgb(245,221,8) , 12px 12px 0 rgb(5,148,68) , 15px 15px 0 rgb(2,135,206) , 18px 18px 0 rgb(4,77,145) , 21px 21px 0 rgb(42,21,113)';


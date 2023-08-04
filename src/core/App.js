import * as THREE from "three";
import * as JSTS from "jsts";
import * as _ from 'lodash';
import SceneManager from "./managers/SceneManager";
import CameraManager from "./managers/CameraManager";
import RendererManager from "./managers/RendererManager";
import ControlsManager from "./managers/ControlsManger";
import rStats from "./lib/rStats";
import {
    threeStats,
    BrowserStats,
    glStats,
    dummyRStats
} from "./lib/rStats.extras";
import DragControls from "./lib/DragControls";
import Ground from "./objects/ground/Ground";
import HeatMap from "./objects/ground/HeatMap";
import PolygonModel from "./objects/model/PolygonModel";
import CylinderModel from "./objects/model/CylinderModel";
import Tree from './objects/model/Tree';
import Gazebo from './lib/PowerGazebo';
import Subarray from "./objects/subArray/Subarray";
import Inverter from './objects/ac/Inverter';
import ACDB from './objects/ac/ACDB';
import DCDB from './objects/ac/DCDB';
import Conduit from './objects/ac/conduits/Conduit';
import DoubleConduit from './objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from './objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from './objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from './objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from './objects/ac/cableTrays/DoubleSeparateCableTray';
import RafterEditMode from "./lib/RafterEditMode";
import AttachmentEditMode from "./lib/AttachmentEditMode";
import AddTableMode from "./lib/AddTableMode";
import FaceSelectMode from "./lib/FaceSelectMode";


import { defaultModuleId } from "../constants";
import {
    CAMERA_TYPE_2D,
    PRODUCTION_ENV,
    CAMERA_UPDATED,
    SHADOW_VIEW_SUMMER_SOLSTICE,
    SHADOW_VIEW_WINTER_SOLSTICE,
    SHADOW_VIEW_MORNING_TIME,
    SHADOW_VIEW_EVENING_TIME,
    TOP_HEIGHT_LOCKED,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    OBSTRUCTION_TYPES,
    fancyConsoleMessage,
    fancyConsoleProperty,
    SUBARRAY_RACK_STYLE_EWRACKING,
} from './coreConstants';
import AsyncManager from "./managers/AsyncManager";
import SelectionControls from "./lib/SelectionControls";
import SelectionControls3D from "./lib/SelectionControls3D";
import EditMode from './lib/EditMode'
import StringingMode from './lib/StringingMode'
import EventManager from "./managers/EventManager";
import MicroInverterSelectionMode from "./managers/MicroInverterSelectionMode";
import DrawManager from "./managers/DrawManager";
import SnapManager from "./managers/SnapManager";
import PlaceManager from "./managers/PlaceManager";
import StateManager from "./managers/StateManager";
import TextSelectionControls from "./lib/TextSelectionControls";
import * as utils from "./utils/utils";
import * as raycastingUtils from './utils/raycastingUtils'
import LightsManager from './managers/LightsManager';
import TweenControls from './managers/TweenControls';
import * as TWEEN from '@tweenjs/tween.js';
import chroma from "chroma-js";
import Walkway from './objects/model/Walkway';
import SafetyLine from './objects/model/SafetyLine';
import Handrail from './objects/model/Handrail';
import Property from "./objects/model/Property";
import AcCable from './objects/model/cable/AcCable';
import ViewManager from "./managers/ViewManager";
import DuplicateManager from './managers/DuplicateManager';
import Dimension from './objects/subObjects/Dimension'
import * as exporters from "../core/utils/exporters"
import VisualManager from './managers/VisualManager';
import createStructure from './structure/structureController';
import { VISUAL_STATES, MATERIAL_STATES, COLOR_MAPPINGS } from './objects/visualConstants';
import OutlinePoints from './objects/subObjects/OutlinePoints';
import LengthMeasurement from "./objects/subObjects/LengthMeasurement";
import ArcMeasurement from "./objects/subObjects/ArcMeasurement";
import MirrorManager from './managers/MirrorManager';
import CustomImageEditorManager from './managers/CustomImageEditorManager';
import CustomImage from "./objects/ground/CustomImage";
import SetbackEditMode from './lib/SetbackEditMode';
import * as sldUtils from './sld/sldUtils';
import { createPDF, createVideo} from '../core/PDFExport/creationTool';
import TextBox from './objects/subObjects/TextBox';
import TextEditor from './objects/subObjects/TextEditor';
import SaveManager from "./managers/SaveManager";
import { store } from '../store/index';
import { mapState } from 'pinia';
import { isCloselyEqual } from '../core/utils/comparisonUtils';
import { reportPagesListNonUs } from "../utils";
const checkedPagesCopy = reportPagesListNonUs.map(page => page.label)

// Important do not remove this import, it helps in adding 
// the svg loader into the three.js library
// import stage from "../store/modules/studio/modules/stage";
import { useStudioStageStore } from "../stores/studio-stage";
import { SmartroofModel } from "./objects/model/smartroof/SmartroofModel";
import Dormer from "./objects/model/smartroof/Dormer";
import GabledDormer from "./objects/model/smartroof/dormers/GabledDormer";
import FlatDormer from "./objects/model/smartroof/dormers/FlatDormer";
import HippedDormer from "./objects/model/smartroof/dormers/HippedDormer";
import AddCablesMode from "./lib/AddCablesMode";
import CombinerBox from "./objects/ac/CombinerBox";
import QuadTreeManager from "./managers/QuadTreeManager";
import MergeManager from "./managers/MergeManager";
import SLDManager from "./managers/SLDManager";
import DesignDxfManager from "./managers/DesignDXFManager";
import API from '@/services/api/';
import SmartroofBuilder from "./objects/model/smartroof/SmartroofBuilder";
import Stringing from "./lib/stringing";
import Lidar from "./objects/ground/Lidar";
import InnerEdge from "./objects/model/smartroof/InnerEdge";
import Edge from "./objects/model/smartroof/Edge";
import RotationPoint from "./objects/subObjects/RotationPoint";
import OuterEdge from "./objects/model/smartroof/OuterEdge";
import Drawface from "./objects/model/smartroof/DrawFace";
import SmartroofSetbackEditMode from "./lib/smartroofSetbackEditMode";
import TurretDormer from "./objects/model/smartroof/dormers/TurretDormer";
import EventHandler from "./managers/EventHandler";
import GazeboMode from "./lib/GazeboMode";
import RectangleObstruction from "./objects/model/Rectangle";
import Table from "./objects/subArray/Table";
import { useDesignStore } from "../stores/design";
import EastWestRack from "./lib/EastWestRacking";
import GoogleTiles from "./objects/ground/GoogleTiles";
import CustomImageManager from "./managers/CustomImageManager";
import DualMapManager from "./managers/DualMapManager";
import { useMapImagesStore } from "../stores/mapImages";
import { useStudioStore } from "../stores/studio";
import { serverBus } from "../main";
export default class App {
    constructor() {
        this.eventBus = new THREE.EventDispatcher();

        if (!PRODUCTION_ENV) {
            window.windowTHREE = THREE;
            window.windowJSTS = JSTS;
            window.windowStage = this;
            window.windowPolygonModel = PolygonModel;
            window.windowCylinderModel = CylinderModel;
            window.windowSubarray = Subarray;
            window.windowUtils = utils;
            window.windowExporters = exporters;
            window.windowRaycast = raycastingUtils;
            window._ = _;
        }

        // TODO: Temporarily using the same old name for a different function for creating layout image
        // Which right now shows solid white image in 2D itself just for layout - to be called for report
        window.switchToNormalView = this.switchToNormalView.bind(this);
        window.switchTo2d = this.switchToLayoutView.bind(this);
        window.startVideo = this.downloadVideo.bind(this);
        window.switchToHeatMapView = this.switchToHeatMapView.bind(this);
        window.switchToSolarAccessView = this.switchToSolarAccessView.bind(this);
        window.switchToEveningSummerShadowView = this.switchToEveningSummerShadowView.bind(this);
        window.switchToEveningWinterShadowView = this.switchToEveningWinterShadowView.bind(this);
        window.switchToMorningSummerShadowView = this.switchToMorningSummerShadowView.bind(this);
        window.switchToMorningWinterShadowView = this.switchToMorningWinterShadowView.bind(this);

        this.sceneRotated = false;
        this.sldView = false;
        this.heatMapEnabled = false;
        this.solarAccessEnabled = false;
        this.defaultPanelSelection = false;
        this.isVideoRecording  = false;
        this.dualMapVisible = useStudioStageStore().dualMapMode;
        this.streetMapVisible = false;
        let panelDefaultColor =
            COLOR_MAPPINGS.PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR.toString(16);
        for (let i = 0; i <= 6 - panelDefaultColor.length; i += 1) {
            panelDefaultColor = "0" + panelDefaultColor;
        }
        panelDefaultColor = "#" + panelDefaultColor;

        let solarAccessColors = [
            panelDefaultColor,
            "#d73027",
            "#f46d43",
            "#fdae61",
            "#fee08b",
            "#ffffbf",
            "#d9ef8b",
            "#a6d96a",
            "#66bd63",
            "#1a9850"
        ];
        this.solarAccessColorMap = chroma
            .scale(solarAccessColors)
            .domain([0, 0.01, 0.45, 0.5, 0.55, 0.6, 0.75, 0.8, 0.9, 1.0])
            .gamma(3);

        //CHANGES IN SHADER LIBS (for objects to recieve shadows and reaction to light = 1 - factor)
        let factor = 0.5;
        let f2 = 1 - factor;
        THREE.ShaderLib['lambert'].fragmentShader = THREE.ShaderLib['lambert'].fragmentShader.replace(

            `vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;`,

            `#ifndef CUSTOM
                vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
            #else
                vec3 outgoingLight = ${factor} * diffuseColor.rgb + ${f2} * (reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance) ;
            #endif`

        );
        this.flag = true;
        this.designDefaultsOpened = false;
        this.objects = {};
        this.highlightedObjects = [];
        this.dimensionObjects = {};
        this.structures = null;
        this.previousSubarrayList = null;
        this.designId = -1;
        this.textObjects = [];
        this.prevMousePoint = new THREE.Vector3();
        this.showInverterIn3D = true;
        this.rStats = new dummyRStats();
        this.inCustomImageEditMode = false;
    }

    async updateDesignSettings(designSettings = {}) {
        if (designSettings === null) {
            designSettings = {};
        }
        if (designSettings.wiring_unit === 'millimeter_square') {
            designSettings.wiring_unit = 'mmsq';
        }
        designSettings = JSON.parse(JSON.stringify(designSettings));
        let structureValidationRequired = false;

        if (utils.getProperty(this, 'designSettings.drawing_defaults.structures') !== null &&
            utils.getProperty(this, 'designSettings.drawing_defaults.structures') !==
            utils.getProperty(designSettings, 'drawing_defaults.structures')) {
            structureValidationRequired = true;
        }

        this.designSettings = {};
        this.designSettings["default_solar_access_threshold"] = ("default_solar_access_threshold" in designSettings &&
                designSettings["default_solar_access_threshold"]) ?
            designSettings.default_solar_access_threshold : 92;
        this.designSettings["default_table_types"] = ("default_table_types" in designSettings &&
                designSettings["default_table_types"] &&
                Object.keys(designSettings["default_table_types"]).length !== 0) ?
            designSettings.default_table_types : [{
                    "mountHeight": 1,
                    "tableSizeUp": 1,
                    "tableSizeWide": 1,
                    "moduleSpacingUp": 0.025,
                    "panelOrientation": "Portrait",
                    "moduleSpacingWide": 0.025
                },
                {
                    "mountHeight": 1,
                    "tableSizeUp": 1,
                    "tableSizeWide": 1,
                    "moduleSpacingUp": 0.025,
                    "panelOrientation": "Landscape",
                    "moduleSpacingWide": 0.025
                },
                {
                    "mountHeight": 1,
                    "tableSizeUp": 2,
                    "tableSizeWide": 1,
                    "moduleSpacingUp": 0.025,
                    "panelOrientation": "Portrait",
                    "moduleSpacingWide": 0.025
                },
                {
                    "mountHeight": 1,
                    "tableSizeUp": 2,
                    "tableSizeWide": 1,
                    "moduleSpacingUp": 0.025,
                    "panelOrientation": "Landscape",
                    "moduleSpacingWide": 0.025
                }
            ];
        this.designSettings["distance_unit"] = ("distance_unit" in designSettings &&
                designSettings["distance_unit"]) ?
            designSettings.distance_unit : "meters";
        this.designSettings["wiring_unit"] = ("wiring_unit" in designSettings &&
                designSettings["wiring_unit"]) ?
            designSettings.wiring_unit : "awg";
        this.designSettings["start_time_auto_row_spacing"] = ("start_time_auto_row_spacing" in designSettings &&
                designSettings["start_time_auto_row_spacing"]) ?
            designSettings.start_time_auto_row_spacing : "09:00:00";
        this.designSettings["end_time_auto_row_spacing"] = ("end_time_auto_row_spacing" in designSettings &&
                designSettings["end_time_auto_row_spacing"]) ?
            designSettings.end_time_auto_row_spacing : "15:00:00";
        this.designSettings["start_date_heatmap"] = ("start_date_heatmap" in designSettings &&
                designSettings["start_date_heatmap"]) ?
            designSettings.start_date_heatmap : "2019-01-01";
        this.designSettings["end_date_heatmap"] = ("end_date_heatmap" in designSettings &&
                designSettings["end_date_heatmap"]) ?
            designSettings.end_date_heatmap : "2019-12-31";
        this.designSettings["start_time_heatmap"] = ("start_time_heatmap" in designSettings &&
                designSettings["start_time_heatmap"]) ?
            designSettings.start_time_heatmap : "00:00:00";
        this.designSettings["end_time_heatmap"] = ("end_time_heatmap" in designSettings &&
                designSettings["end_time_heatmap"]) ?
            designSettings.end_time_heatmap : "23:59:59";
        this.designSettings["constant_losses"] = ("constant_losses" in designSettings &&
                designSettings["constant_losses"] &&
                Object.keys(designSettings["constant_losses"]).length !== 0) ?
            designSettings.constant_losses : {
                "ac": {
                    "ac_ohmic": 1,
                    "unavailability": 0
                },
                "dc": {
                    "dc_ohmic": 1,
                    "mismatch": 1.5,
                    "irradiance": 3,
                    "temperature": 5
                },
                "irradiance": {
                    "iam": 1.5,
                    "shading": 1,
                    "soiling": 2
                },
                "inverter_efficiency": 96
            };
        this.designSettings["shadows"] = ("shadows" in designSettings &&
                designSettings["shadows"] !== null) ?
            designSettings.shadows : { "high_resolution_shadows": false };
        this.designSettings["drawing_defaults"] = ("drawing_defaults" in designSettings &&
                designSettings["drawing_defaults"]) ?
            designSettings.drawing_defaults : {};
        if (!("subarray" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["subarray"] = {
                mountType: SUBARRAY_RACK_STYLE_FIXED,
                fixedMount: {
                    azimuth: 180,
                    structureType: 'Default Fixed Tilt',
                    moduleProperties: {
                        moduleId: defaultModuleId,
                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                        moduleSize: 0.313,
                        moduleLength: 2.030,
                        moduleWidth: 0.98,
                    },
                    panelProperties: {
                        characteristics: {
                            cell_number: 72,
                            cell_type: 'Monocrystalline',
                            length: 2.03,
                            manufacturer: 'The Solar Labs',
                            model: 'TSL-315-FX',
                            p_mp_ref: 313,
                            series: 'SolarLabs TSL-310-330-FX',
                            v_max: 999,
                            width: 0.98,
                        },
                        id: defaultModuleId,
                        image: null,
                        image_link: null,
                        is_selected: true,
                        model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                    },
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 1,
                    mountType: 'Fixed Tilt',
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    tilt: 20,
                    rowSpacingMode: ROW_SPACING_MODE_AUTO,
                    rowSpacing: 0.025,
                },
                flushMount: {
                    structureType: '',
                    moduleProperties: {
                        moduleId: defaultModuleId,
                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                        moduleSize: 0.313,
                        moduleLength: 2.030,
                        moduleWidth: 0.98,
                    },
                    panelProperties: {
                        characteristics: {
                            cell_number: 72,
                            cell_type: 'Monocrystalline',
                            length: 2.03,
                            manufacturer: 'The Solar Labs',
                            model: 'TSL-315-FX',
                            p_mp_ref: 313,
                            series: 'SolarLabs TSL-310-330-FX',
                            v_max: 999,
                            width: 0.98,
                        },
                        id: defaultModuleId,
                        image: null,
                        image_link: null,
                        is_selected: true,
                        model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                    },
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.1,
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                    rowSpacing: 0.025,
                },
                eastWestRacking: {
                    azimuth: 90,
                    structureType: 'Low Foundation Fixed Tilt',
                    moduleProperties: {
                        moduleId: defaultModuleId,
                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                        moduleSize: 0.313,
                        moduleLength: 2.030,
                        moduleWidth: 0.98,
                    },
                    panelProperties: {
                        panelProperties: {
                            characteristics: {
                                cell_number: 72,
                                cell_type: 'Monocrystalline',
                                length: 2.03,
                                manufacturer: 'The Solar Labs',
                                model: 'TSL-315-FX',
                                p_mp_ref: 313,
                                series: 'SolarLabs TSL-310-330-FX',
                                v_max: 999,
                                width: 0.98,
                            },
                            id: defaultModuleId,
                            image: null,
                            image_link: null,
                            is_selected: true,
                            model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                        },
                    },
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.1,
                    intraRowSpacing:0.100,
                    interRowSpacingMode: 'Auto',
                    interRowSpacing:0.44,
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    tilt: 5,
                },
            }
        } else if (!("fixedMount" in this.designSettings["drawing_defaults"]["subarray"])) {
            this.designSettings["drawing_defaults"]["subarray"] = {
                mountType: SUBARRAY_RACK_STYLE_FIXED,
                fixedMount: {
                    azimuth: 180,
                    structureType: 'Default Fixed Tilt',
                    moduleProperties: this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties,
                    panelProperties: this.designSettings.drawing_defaults.subarray.fixedMount.panelProperties,
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 1,
                    mountType: 'Fixed Tilt',
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    tilt: 20,
                    rowSpacingMode: ROW_SPACING_MODE_AUTO,
                    rowSpacing: 0.025,
                },
                flushMount: {

                    moduleProperties: this.designSettings.drawing_defaults.subarray.flushMount.moduleProperties,
                    panelProperties: this.designSettings.drawing_defaults.subarray.flushMount.panelProperties,
                    structureType: '',
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.1,
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                    rowSpacing: 0.025,
                }, 
                eastWestRacking: {
                    azimuth: 90,
                    structureType: 'Low Foundation Fixed Tilt',
                    moduleProperties: this.designSettings.drawing_defaults.subarray.eastWestRacking.moduleProperties,
                    panelProperties: this.designSettings.drawing_defaults.subarray.eastWestRacking.panelProperties,
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.5,
                    intraRowSpacing:0.100,
                    interRowSpacingMode: 'Auto',
                    interRowSpacing:0.44,
                    mountType: 'East West Racking',
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    tilt: 5,
                }
            }
        }
        else if (!("eastWestRacking" in this.designSettings["drawing_defaults"]["subarray"])) {
            console.log('this.designSettings.drawing_defaults.subarray: ', this.designSettings.drawing_defaults.subarray);
            // console.log(this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties);

            this.designSettings["drawing_defaults"]["subarray"] = {
                mountType: SUBARRAY_RACK_STYLE_FIXED,
                fixedMount: {
                    azimuth: 180,
                    structureType: 'Default Fixed Tilt',
                    moduleProperties: this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties,
                    panelProperties: this.designSettings.drawing_defaults.subarray.fixedMount.panelProperties,
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 1,
                    mountType: 'Fixed Tilt',
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    tilt: 20,
                    rowSpacingMode: ROW_SPACING_MODE_AUTO,
                    rowSpacing: 0.025,
                },
                flushMount: {
                    moduleProperties: this.designSettings.drawing_defaults.subarray.flushMount.moduleProperties,
                    panelProperties: this.designSettings.drawing_defaults.subarray.flushMount.panelProperties,
                    structureType: '',
                    moduleSpacingUp: 0.025,
                    moduleSpacingWide: 0.025,
                    mountHeight: 0.1,
                    panelOrientation: 'Portrait',
                    tableSizeUp: 1,
                    tableSizeWide: 1,
                    tableSpacing: 0.025,
                    rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                    rowSpacing: 0.025,
                },
                eastWestRacking: {
                    azimuth: 90,
                    structureType: 'Low Foundation Fixed Tilt',
                    moduleProperties: {
                        moduleId: defaultModuleId,
                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                        moduleSize: 0.313,
                        moduleLength: 2.030,
                        moduleWidth: 0.98,
                    },
                    panelProperties: {
                        characteristics: {
                            cell_number: 72,
                            cell_type: 'Monocrystalline',
                            length: 2.03,
                            manufacturer: 'The Solar Labs',
                            model: 'TSL-315-FX',
                            p_mp_ref: 313,
                            series: 'SolarLabs TSL-310-330-FX',
                            v_max: 999,
                            width: 0.98,
                        },
                    id: defaultModuleId,
                    image: null,
                    image_link: null,
                    is_selected: true,
                    model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                },
                moduleSpacingUp: 0.025,
                moduleSpacingWide: 0.025,
                mountHeight: 0.5,
                intraRowSpacing:0.100,
                interRowSpacingMode: 'Auto',
                interRowSpacing:0.44,
                mountType: 'East West Racking',
                panelOrientation: 'Portrait',
                tableSizeUp: 1,
                tableSizeWide: 1,
                tableSpacing: 0.025,
                tilt: 5,
                }, 
            }
        }
        else if (!("moduleProperties" in this.designSettings["drawing_defaults"]["subarray"]["fixedMount"])) {
            this.designSettings.drawing_defaults.subarray.fixedMount = {
                azimuth: 180,
                structureType: 'Default Fixed Tilt',
                moduleProperties: {
                    moduleId: defaultModuleId,
                    moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                    moduleSize: 0.313,
                    moduleLength: 2.030,
                    moduleWidth: 0.98,
                },
                panelProperties: {
                    characteristics: {
                        cell_number: 72,
                        cell_type: 'Monocrystalline',
                        length: 2.03,
                        manufacturer: 'The Solar Labs',
                        model: 'TSL-315-FX',
                        p_mp_ref: 313,
                        series: 'SolarLabs TSL-310-330-FX',
                        v_max: 999,
                        width: 0.98,
                    },
                    id: defaultModuleId,
                    image: null,
                    image_link: null,
                    is_selected: true,
                    model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                },
                moduleSpacingUp: 0.025,
                moduleSpacingWide: 0.025,
                mountHeight: 1,
                mountType: 'Fixed Tilt',
                panelOrientation: 'Portrait',
                tableSizeUp: 1,
                tableSizeWide: 1,
                tableSpacing: 0.025,
                tilt: 20,
                rowSpacingMode: ROW_SPACING_MODE_AUTO,
                rowSpacing: 0.025,
            }
        }
        else if (!("moduleProperties" in this.designSettings["drawing_defaults"]["subarray"]["flushMount"])) {
            this.designSettings.drawing_defaults.subarray.flushMount = {
                structureType: 'Default Fixed Tilt',
                moduleProperties: {
                    moduleId: defaultModuleId,
                    moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                    moduleSize: 0.313,
                    moduleLength: 2.030,
                    moduleWidth: 0.98,
                },
                panelProperties: {
                    characteristics: {
                        cell_number: 72,
                        cell_type: 'Monocrystalline',
                        length: 2.03,
                        manufacturer: 'The Solar Labs',
                        model: 'TSL-315-FX',
                        p_mp_ref: 313,
                        series: 'SolarLabs TSL-310-330-FX',
                        v_max: 999,
                        width: 0.98,
                    },
                    id: defaultModuleId,
                    image: null,
                    image_link: null,
                    is_selected: true,
                    model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                },
                moduleSpacingUp: 0.025,
                moduleSpacingWide: 0.025,
                mountHeight: 0.1,
                panelOrientation: 'Portrait',
                tableSizeUp: 1,
                tableSizeWide: 1,
                tableSpacing: 0.025,
                rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                rowSpacing: 0.025,
            }
        }
        else if (!("moduleProperties" in this.designSettings["drawing_defaults"]["subarray"]["eastWestRacking"])) {
            this.designSettings.drawing_defaults.subarray.eastWestRacking = {
                azimuth: 90,
                structureType: 'Low Foundation Fixed Tilt',
                moduleProperties: {
                    moduleId: defaultModuleId,
                    moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                    moduleSize: 0.313,
                    moduleLength: 2.030,
                    moduleWidth: 0.98,
                },
                panelProperties: {
                    characteristics: {
                        cell_number: 72,
                        cell_type: 'Monocrystalline',
                        length: 2.03,
                        manufacturer: 'The Solar Labs',
                        model: 'TSL-315-FX',
                        p_mp_ref: 313,
                        series: 'SolarLabs TSL-310-330-FX',
                        v_max: 999,
                        width: 0.98,
                    },
                    id: defaultModuleId,
                    image: null,
                    image_link: null,
                    is_selected: true,
                    model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                },
                moduleSpacingUp: 0.025,
                moduleSpacingWide: 0.025,
                mountHeight: 0.5,
                intraRowSpacing:0.100,
                interRowSpacingMode: 'Auto',
                interRowSpacing:0.44,
                mountType: 'East West Racking',
                panelOrientation: 'Portrait',
                tableSizeUp: 1,
                tableSizeWide: 1,
                tableSpacing: 0.025,
                tilt: 5,
            }
        }
        if(window.location.pathname.includes("studio")){
            if(!("panelProperties" in this.designSettings["drawing_defaults"]["subarray"]["fixedMount"]) 
                    || this.designSettings.drawing_defaults.subarray.fixedMount.panelProperties === undefined
                    || this.designSettings.drawing_defaults.subarray.fixedMount.panelProperties === null) {
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.designSettings["drawing_defaults"]["subarray"]["fixedMount"]["panelProperties"] = selectedPanel;
            }
            if(!("panelProperties" in this.designSettings["drawing_defaults"]["subarray"]["flushMount"])
                    || this.designSettings.drawing_defaults.subarray.flushMount.panelProperties === undefined
                    || this.designSettings.drawing_defaults.subarray.flushMount.panelProperties === null) {
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.designSettings.drawing_defaults.subarray.flushMount.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.designSettings["drawing_defaults"]["subarray"]["flushMount"]["panelProperties"] = selectedPanel;
            }
            if(this.designSettings.drawing_defaults.subarray.fixedMount.panelProperties.id !== this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties.moduleId){
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.designSettings.drawing_defaults.subarray.fixedMount.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.designSettings["drawing_defaults"]["subarray"]["fixedMount"]["panelProperties"] = selectedPanel;
            }
            if(this.designSettings.drawing_defaults.subarray.flushMount.panelProperties.id !== this.designSettings.drawing_defaults.subarray.flushMount.moduleProperties.moduleId){
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.designSettings.drawing_defaults.subarray.flushMount.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.designSettings["drawing_defaults"]["subarray"]["flushMount"]["panelProperties"] = selectedPanel;
            }
        }
        if (!("polygonModel" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["polygonModel"] = {
                "tilt": 0,
                "azimuth": 180,
                "ignored": false,
                "placable": true,
                "heatMapThreshold": 100,
                "coreHeight": 2,
                "topHeight": 2,
                "parapetHeight": 0,
                "setbackInside": 0.5,
                "setbackOutside": 0.5,
                "parapetThickness": 0.3,
                "lockedParameter": TOP_HEIGHT_LOCKED,
                "obstruction": OBSTRUCTION_TYPES,
            };
        }
        if (!("tree" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["tree"] = {
                treeId: 1,
                isProportional: false,
                coreHeight: 10,
                width: 4,
            };
        }
        if (!('treeId' in this.designSettings["drawing_defaults"]["tree"])) {
            this.designSettings["drawing_defaults"]["tree"] = {
                treeId: 1,
                isProportional: false,
                coreHeight: 10,
                width: 4,
            };
        }
        if (!('isProportional' in this.designSettings["drawing_defaults"]["tree"])) {
            this.designSettings["drawing_defaults"]["tree"] = {
                treeId: 1,
                isProportional: false,
                coreHeight: 10,
                width: 4,
            };
        }
        if (!("cylinderModel" in this.designSettings["drawing_defaults"])) {
            this.designSettings['drawing_defaults']['cylinderModel'] = {
                "tilt": 0,
                "azimuth": 180,
                "ignored": false,
                "placable": true,
                "heatMapThreshold": 100,
                "coreHeight": 2,
                "topHeight": 2,
                "parapetHeight": 0,
                "setbackInside": 0.5,
                "setbackOutside": 0.5,
                "parapetThickness": 0.3,
                "lockedParameter": TOP_HEIGHT_LOCKED,
                "obstruction":OBSTRUCTION_TYPES,
            }
        }
        if (!("smartroofModel" in this.designSettings['drawing_defaults'])) {
            this.designSettings['drawing_defaults']['smartroofModel'] = {
                tilt: 20,
                setbackInside: 0.5,
                coreHeight: 5,
            }
        }
        if (!('dormer' in this.designSettings['drawing_defaults'])) {
            this.designSettings['drawing_defaults']['dormer'] = {
                tilt: 20,
                setbackOutside: 0.5,
            }
        }
        if (!("walkwayModel" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["walkwayModel"] = {
                coreHeight: 0.1,
                width: 0.25
            };
        }
        if (!("inverter" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["inverter"] = {
                azimuth: 90,
                mountHeight: 1.2,
            };
        }
        if (!("acdb" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["acdb"] = {
                azimuth: 90,
                mountHeight: 0.5,
            };
        }
        if (!("dcdb" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["dcdb"] = {
                azimuth: 90,
                mountHeight: 0.5,
            };
        }
        if (!("acCable" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["acCable"] = {
                materialType: 'aluminium',
                cores: '1',
                cableSizeMM: '1.5',
                cableSizeAWG: '0000',
            };
        }
        if (!("dcCable" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["dcCable"] = {
                cableLength: 0,
                polarity: 'negative',
                cableSize: 0,
            };
        }
        if (!("conduit" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["conduit"] = {
                materialType: 'EMT - Electrical Metallic Tubing',
                innerDiameter: 0.5,
                outerDiameter: 0.5,
                maxFillFactor: 0.4,
            };
        }
        if (!("cabletray" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["cabletray"] = {
                materialType: 'EMT - Electrical Metallic Tubing',
                width: 150,
                height: 45,
                maxFillFactor: 0.4,
            };
        }
        if (!("structures" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["structures"] = {
                visible: false,
                template: "Default Fixed Tilt"
            };
        }
        if (!("texture" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["texture"] = true;
        }
        if (!("monocrystallinepanels" in this.designSettings["drawing_defaults"])) {
            this.designSettings["drawing_defaults"]["monocrystallinepanels"] = false;
        }
        // for report defaults
        this.designSettings["report_defaults"] = ("report_defaults" in designSettings &&
                designSettings["report_defaults"]) ?
            designSettings.report_defaults : {};
        if (!("threed_data" in this.designSettings["report_defaults"])) {
            this.designSettings["report_defaults"]["threed_data"] = {
                generation: true,
                financial: true,
            };
        }
        if (!("shadowAnalysis" in this.designSettings["report_defaults"])) {
            this.designSettings["report_defaults"]["threed_data"] = {
                start_time_shadow_analysis: '09:00:00',
                end_time_shadow_analysis: '17:00:00',
            };
        }
        if (!("pages" in this.designSettings["report_defaults"])) {
            this.designSettings["report_defaults"]["threed_data"] = checkedPagesCopy;
        }

        if (this.lightsManager !== undefined) {
            this.lightsManager.updateShadowMapResolution();
        }

        if (structureValidationRequired) {
            this.validateStructures();
            this.eventManager.setObjectsSelected(this.selectionControls.getSelectedObject());
        }

        // TODO: Update subarray on update row spacing
    }

    saveStage() {
        // TODO: Find the root cause
        utils.removeEmptySRT(this);

        let stageData = {};

        stageData.latitude = this.latitude;
        stageData.longitude = this.longitude;
        stageData.zoom = this.zoom;

        // save image URL and image dimensions
        stageData.imageURL = this.groundImage.url;
        stageData.imageDimensions = this.imageDimensions;
        stageData.designDefaultsOpened = this.designDefaultsOpened;
        // save ground
        stageData.ground = this.ground.saveObject();
        stageData.ground.dcdbCount = exporters.getAllDCDBs(this).length;
        stageData.panelMap = exporters.panelMapExporter(this);
        stageData.isFinalBifacialEnabled = exporters.isBifacialEnabled(stageData.panelMap)
        stageData.roofMap = exporters.roofMapExporter(this);
        stageData.gazeboMap = exporters.gazeboMapExporter(this);
        stageData.totalRoofArea = this.getAllRoofArea();
        //
        const roofAreaInfo = this.getRoofAreaInfo()
        stageData.roofWithPanelArea = roofAreaInfo.roofWithPanelArea;
        stageData.underneathArrayArea = roofAreaInfo.underneathArrayArea;
        stageData.buildingWithPanelArea = roofAreaInfo.buildingWithPanelArea;
        //
        stageData.inverterElectricalMap =
            exporters.inverterElectricalMapExporter(this, stageData.panelMap);

        if (stageData.inverterElectricalMap.isStringing) {
            this.ground.selectedPreliminaryInverters = [];
            stageData.ground.selectedPreliminaryInverters = [];
        }

        stageData.showInverterIn3D = this.showInverterIn3D;

        // save heat map
        stageData.heatMap = this.heatMap.saveHeatMap();
        
        // save id count for objects
        stageData._MODEL_ID_INIT = this._MODEL_ID_INIT;
        stageData._SMARTROOFFACE_ID_INIT = this._SMARTROOFFACE_ID_INIT;
        stageData._DORMER_ID_INIT = this._DORMER_ID_INIT;
        stageData._COMBINERBOX_ID_INIT = this._COMBINERBOX_ID_INIT;
        stageData._INVERTER_ID_INIT = this._INVERTER_ID_INIT;
        stageData._DC_STRING_ID_INIT = this._DC_STRING_ID_INIT;
        stageData._STRING_ID_INIT = this._STRING_ID_INIT;
        stageData._MICROINVERTER_ID_INIT = this._MICROINVERTER_ID_INIT;
        stageData._DCDB_ID_INIT = this._DCDB_ID_INIT;
        stageData._ACDB_ID_INIT = this._ACDB_ID_INIT;
        stageData._SUBARRAY_ID_INIT = this._SUBARRAY_ID_INIT;
        stageData._WALKWAY_ID_INIT = this._WALKWAY_ID_INIT;
        stageData._SAFETY_LINE_ID_INIT = this._SAFETY_LINE_ID_INIT;
        stageData._HANDRAIL_ID_INIT = this._HANDRAIL_ID_INIT;
        stageData._PROPERTY_ID_INIT = this._PROPERTY_ID_INIT;
        stageData._DIMENSION_ID_INIT = this._DIMENSION_ID_INIT;
        stageData._TEXTBOX_ID_INIT = this._TEXTBOX_ID_INIT;
        stageData._ACCABLE_ID_INIT = this._ACCABLE_ID_INIT;
        stageData._DCCABLE_ID_INIT = this._DCCABLE_ID_INIT;

        return stageData;
    }

    loadDoubleSeperateConduits() {
        const result = exporters.getAllModelType();
        exporters.getModels(stage.ground, result);

        for (let i = 0, l = result.doubleSeparateConduit.length; i < l; i += 1) {
            result.doubleSeparateConduit.loadRedAndBlackConduits(result.conduit);
        }
    }

    loadCombinerBox() {
        const combinerBox = exporters.getCombinerBox(this);
        if (combinerBox.length > 0) {
            for (let j = 0; j < combinerBox.length; j++) {
                for (let i = 0; i < this.ground.microInverters.length; i++) {
                    if (this.ground.microInverters[i].id === combinerBox[j].linkedMicroInverterId) {
                        combinerBox[j].linkedMicroInverter = this.ground.microInverters[i];
                        this.ground.microInverters[i].combinerBox = combinerBox[j];
                    }
                }
            }
        }
    }

    loadInverters() {
        this._DC_STRING_ID_INIT = 0;
        const allAjbs = exporters.getAllDCDBs(this);
        const inverters = exporters.getInverters(this);
        const dcCables = this.ground.allCables;
        const allAcdbs = this.ground.allAcdbs;
        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].loadMpptsData();
            // inverters[i].loadDcCables(dcCables);
            // inverters[i].loadAjb(allAjbs);
            // inverters[i].loadAcdb(allAcdbs);
        }
    }

    loadInvertersIntoSubarrays() {
        const result = [];
        exporters.getSubarrays(this.ground, result);
        for (let subarray of result) {
            subarray.loadInvertersUsingId();
        }
    }

    loadStage(canvas, latitude, longitude, zoom, designSettings, mapImage, stageData = {}) {
        // Fancy console
        if (PRODUCTION_ENV) {
            console.clear();
        }
        console.log(fancyConsoleMessage, fancyConsoleProperty);
        if (stageData === null || stageData === undefined) {
            stageData = {};
        }

        if (
            latitude === null || latitude === undefined ||
            longitude === null || longitude === undefined ||
            zoom === null || zoom === undefined ||
            mapImage === null || mapImage === undefined
        ) {
            throw new Error('App: Init: Invalid input');
        }
        this.latitude = latitude;
        this.longitude = longitude;
        this.zoom = zoom;
        this.groundImage = JSON.parse(JSON.stringify(mapImage));
        this.designDefaultsOpened = stageData.designDefaultsOpened ? stageData.designDefaultsOpened : false;
        this.updateDesignSettings(designSettings);

        this.imageDimensions =
            Object.prototype.hasOwnProperty.call(stageData, 'imageDimensions') ?
            stageData.imageDimensions :
            utils.getImageDimensions(this.latitude, this.longitude, this.zoom, 512, 512);
        this.screenDimensions = {
            width: canvas.width,
            height: canvas.height,
            left: canvas.getBoundingClientRect().left,
            top: canvas.getBoundingClientRect().top
        };

        this.sceneManager = new SceneManager();

        this.cameraManager = new CameraManager(this.screenDimensions, this.imageDimensions, CAMERA_TYPE_2D);

        this.rendererManager = new RendererManager(canvas);

        this.eventManager = new EventManager(this);

        this.eventHandler = new EventHandler();

        this.asyncManager = new AsyncManager(this);

        this.drawManager = new DrawManager(this);

        this.snapManager = new SnapManager(this);

        this.placeManager = new PlaceManager(this);

        this.mergeManager = new MergeManager(this);

        this.mirrorManager = new MirrorManager(this);

        this.setbackEditMode = new SetbackEditMode(this);

        this.smartRoofSetbackEditMode = new SmartroofSetbackEditMode(this);

        this.saveManager = new SaveManager(this);

        this.dragControls = new DragControls(
            this.cameraManager.camera,
            canvas.parentElement,
            this
        );

        this.lightsManager = new LightsManager(this);

        this.selectionControls = new SelectionControls(this);
        this.selectionControls.enable();
        
        this.selectionControls3D = new SelectionControls3D(this);

        this.editMode = new EditMode(this);

        this.stringing = new Stringing(this);

        this.addCablesMode = new AddCablesMode(this);

        this.microInverterSelectionMode = new MicroInverterSelectionMode(this);

        this.textSelectionControls = new TextSelectionControls(this);

        this.duplicateManager = new DuplicateManager(this);

        this.stateManager = new StateManager(this);

        this.viewManager = new ViewManager(this);

        this.visualManager = new VisualManager(this);

        this.textEditor = new TextEditor(this);

        this.quadTreeManager = new QuadTreeManager(this);

        this.dualMapManager = new DualMapManager(this);

        this.rafterEditMode = new RafterEditMode(this);

        this.attachmentEditMode = new AttachmentEditMode(this);

        this.addTableMode = new AddTableMode(this);
        
        this.gazeboMode = new GazeboMode(this);

        this.SLDManager = new SLDManager(this);

        this.DesignDxfManager = new DesignDxfManager(this);

        this.lidar = new Lidar(this);

        this.faceSelectMode = new FaceSelectMode(this);
            
        this.customImageManager = new CustomImageManager(this);

        new CustomImageEditorManager(this);

        if (!PRODUCTION_ENV) {

            const bS = new BrowserStats();
            // this.glS = new glStats();
            const tS = new threeStats(this.rendererManager.renderer);

            this.rStats = new rStats({
                userTimingAPI: true,
                values: {
                    frame: { caption: 'Total frame time (ms)', over: 16, average: true, avgMs: 1000 },
                    render: { caption: 'Total render time (ms)', over: 16, average: true, avgMs: 1000 },
                    mouseMove: { caption: 'mouseMove time (ms)', over: 16, average: true, avgMs: 1000 },
                    fps: { caption: 'Framerate (FPS)', below: 30 },
                    temp: { caption: 'tmep time (ms)', over: 60, average: true, avgMs: 1000 },
                    calls: { caption: 'Calls (three.js)', over: 3000 },
                    raf: { caption: 'Time since last rAF (ms)', over: 16, average: true, avgMs: 1000 },
                    rstats: { caption: 'rStats update (ms)', average: true, avgMs: 1000 },
                    texture: {  caption: 'GenTex', average: true, avgMs: 1000 },
                    merging: { caption: 'Merging (ms)', over: 16, average: true, avgMs: 1000 },
                },
                groups: [
                    { caption: 'Framerate', values: ['fps', 'raf'] },
                    { caption: 'Frame Budget', values: ['frame', 'texture', 'setup', 'render', 'mouseMove', 'merging'] }
                ],
                fractions: [
                    { base: 'raf', steps: ['frame'] },
                    { base: 'frame', steps: ['render'] }
                ],
                plugins: [
                    bS,
                    tS
                ]
            });

            // this.glS.start();
            // canvas.parentElement.insertBefore(this.rStats.dom, canvas);
        }
        this.tweenControls = new TweenControls(this);

        this._MODEL_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_MODEL_ID_INIT') ?
            stageData._MODEL_ID_INIT :
            0;
        this._SMARTROOFFACE_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_SMARTROOFFACE_ID_INIT') ?
            stageData._SMARTROOFFACE_ID_INIT :
            0;
        this._DORMER_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_DORMER_ID_INIT') ?
            stageData._DORMER_ID_INIT :
            0;
        this._COMBINERBOX_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_COMBINERBOX_ID_INIT') ?
            stageData._COMBINERBOX_ID_INIT :
            0;
        this._INVERTER_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_INVERTER_ID_INIT') ?
            stageData._INVERTER_ID_INIT :
            0;
        this._DC_STRING_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_DC_STRING_ID_INIT') ?
            stageData._DC_STRING_ID_INIT :
            0;
        this._STRING_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_STRING_ID_INIT') ?
            stageData._STRING_ID_INIT :
            0;
        this._MICROINVERTER_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_MICROINVERTER_ID_INIT') ?
            stageData._MICROINVERTER_ID_INIT :
            0;
        this._DCDB_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_DCDB_ID_INIT') ?
            stageData._DCDB_ID_INIT :
            0;
        this._ACDB_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_ACDB_ID_INIT') ?
            stageData._ACDB_ID_INIT :
            0;
        this._SUBARRAY_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_SUBARRAY_ID_INIT') ?
            stageData._SUBARRAY_ID_INIT :
            0;
        this._WALKWAY_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_WALKWAY_ID_INIT') ?
            stageData._WALKWAY_ID_INIT :
            0;
        this._SAFETY_LINE_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_SAFETY_LINE_ID_INIT') ?
            stageData._SAFETY_LINE_ID_INIT :
            0;
        this._HANDRAIL_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_HANDRAIL_ID_INIT') ?
            stageData._HANDRAIL_ID_INIT :
            0;
        this._PROPERTY_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_PROPERTY_ID_INIT') ?
            stageData._PROPERTY_ID_INIT :
            0;
        this._DIMENSION_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_DIMENSION_ID_INIT') ?
            stageData._DIMENSION_ID_INIT :
            0;
        this._TEXTBOX_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_TEXTBOX_ID_INIT') ?
            stageData._TEXTBOX_ID_INIT :
            0;
        this._ACCABLE_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_ACCABLE_ID_INIT') ?
            stageData._ACCABLE_ID_INIT :
            0;
        this._DCCABLE_ID_INIT =
            Object.prototype.hasOwnProperty.call(stageData, '_DCCABLE_ID_INIT') ?
            stageData._DCCABLE_ID_INIT :
            0;

        window.addEventListener("resize", this.appResize, false);
        window.addEventListener("scroll", this.appResize, false);

        this.heatMap = new HeatMap(this);
        if (Object.prototype.hasOwnProperty.call(stageData, 'heat_Map')) {
            this.heatMap.loadHeatMap(stageData.heat_Map);
        }

        this.ground = new Ground(this);
        if (Object.prototype.hasOwnProperty.call(stageData, 'ground')) {
            this.ground.loadObject(stageData.ground);
        }

        this.customImageManager.loadCustomImagesOnLoad();
        this.quadTreeManager.initialize();

        this.controlsManager = new ControlsManager(
            this.cameraManager.get2dCamera(),
            this.cameraManager.get3dCamera(),
            canvas,
            this.eventBus,
            this
        );
        this.controlsManager.use2dControls();

        if (stageData.showInverterIn3D !== undefined) {
            this.showInverterIn3D = stageData.showInverterIn3D;
        }
        this.lightsManager.disableShadows();

        // enable selection on ground
        this.selectionControls.setSelectedObject(this.ground);

        this.mousePoint = new THREE.Vector3(0, 0, 0);
        this.prevMousePoint = new THREE.Vector3(-10000, -10000, -10000);
        this.eventHandler.mouseMoves[0] = this.mouseMove.bind(this);
        // this.mouseMoves = [];
        // this.mouseMoves[0] = this.mouseMove.bind(this);
        this.cameraUpdates = [];
        this.lastZValue = '--';
        this.lastXValue = '--';
        this.lastYValue = '--';
        this.event = null;
        window.addEventListener('mousemove', this.onDocumentMouseMove, false);

        // TODO: Add handling in case there are errors in loading inverters
        try {
            this.loadInverters();
            this.loadCombinerBox();
            this.loadInvertersIntoSubarrays();
            // this.getUpdatedImageDimensionsOnResize(null, this.getImageDimensions(), true);
        } catch (error) {
            console.error('error: ', error);
        }
        this.eventManager.lidarSimulationOff();
        this.smartRoofSetbackEditMode.updateModelArea();
    }
    
    // Getting unique ids

    getModelId() {
        this._MODEL_ID_INIT++;
        return this._MODEL_ID_INIT;
    }

    getSmartroofFaceId() {
        this._SMARTROOFFACE_ID_INIT++;
        return this._SMARTROOFFACE_ID_INIT;
    }

    getDormerId() {
        this._DORMER_ID_INIT++;
        return this._DORMER_ID_INIT;
    }

    getInverterId() {
        this._INVERTER_ID_INIT++;
        return this._INVERTER_ID_INIT;
    }

    getDcStringId() {
        this._DC_STRING_ID_INIT++;
        return this._DC_STRING_ID_INIT;
    }

    getStringId() {
        this._STRING_ID_INIT++;
        return this._STRING_ID_INIT;
    }

    getMicroInverterId() {
        this._MICROINVERTER_ID_INIT++;
        return this._MICROINVERTER_ID_INIT;
    }

    getCombinerBoxId() {
        this._COMBINERBOX_ID_INIT++;
        return this._COMBINERBOX_ID_INIT;
    }

    getDcdbId() {
        this._DCDB_ID_INIT++;
        return this._DCDB_ID_INIT;
    }

    getACDBId() {
        this._ACDB_ID_INIT++;
        return this._ACDB_ID_INIT;
    }

    getSubarrayId() {
        this._SUBARRAY_ID_INIT++;
        return this._SUBARRAY_ID_INIT;
    }

    getWalkwayId() {
        this._WALKWAY_ID_INIT++;
        return this._WALKWAY_ID_INIT;
    }

    getSafetyLineId() {
        this._SAFETY_LINE_ID_INIT++;
        return this._SAFETY_LINE_ID_INIT;
    }

    getHandrailId() {
        this._HANDRAIL_ID_INIT++;
        return this._HANDRAIL_ID_INIT;
    }

    getPropertyId() {
        this._PROPERTY_ID_INIT++;
        return this._PROPERTY_ID_INIT;
    }

    getDimensionId() {
        this._DIMENSION_ID_INIT++;
        return this._DIMENSION_ID_INIT;
    }

    getTextboxId() {
        this._TEXTBOX_ID_INIT++;
        return this._TEXTBOX_ID_INIT;
    }

    getAcCableId() {
        this._ACCABLE_ID_INIT++;
        return this._ACCABLE_ID_INIT;
    }

    getDcCableId() {
        this._DCCABLE_ID_INIT++;
        return this._DCCABLE_ID_INIT;
    }

    getObject(uuid) {
        return this.objects[uuid];
    }

    getLatitude() {
        return this.latitude;
    }

    getLongitude() {
        return this.longitude;
    }

    getImageDimensions() {
        return this.imageDimensions;
    }

    getGroundImage() {
        return this.groundImage;
    }

    getNormalisedZoom() {
        // returns normalised zoom level based on image dimension
        // scale followed is that for 300x300, zoom is 1 and linear scale
        // NOTE: camera's 'z' is 500. Changing might affect it. Not accounted.
        // NOTE: Image's aspect ratio is assumed to be 1:1
        return ((300 / this.imageDimensions.width) * this.cameraManager.camera.zoom);
    }

    getRemainingDcSize() {
        return this.eventManager.getMaxAllowedDCSize() - this.getDcSize();
    }

    getDcSize() {
        let subarrays = [];
        exporters.getSubarrays(this.ground, subarrays);
        let dcSize = 0;
        for (let subarray of subarrays) {
            dcSize += subarray.getDcSize();
        }
        return dcSize;
    }

    getDcSizeForGazebos() {
        let gazebos = [];
        exporters.getGazebos(this.ground, gazebos);
        let dcSize = 0;
        for (let gazebo of gazebos) {
            dcSize += gazebo.getDcSize();
        }
        if (dcSize === 0) {
            return 0;
        }
        return (dcSize.toFixed(2));
    }

    getAcSize() {
        let acSize = 0;
        // for (let inverter of this.ground.selectedPreliminaryInverters) {
        //     acSize += (inverter.quantity * inverter.inverterDetails.characteristics.paco / 1000);
        // }
        return acSize;
    }

    getAllRoofArea() {
        const result = exporters.getAllModelType();
        exporters.getModels(this.ground, result);
        let modelArea = 0;
        for (let i = 0; i < result.smartroofs.length; i++) {
            modelArea =  modelArea + result.smartroofs[i].computeArea();
        }
        const placablePolygons = result.polygons.filter((el)=> {return !el.isObstruction;});
        for (let i = 0; i < placablePolygons.length; i++) {
            modelArea =  modelArea + placablePolygons[i].computeArea();
        }
        return modelArea;
    }

    getRoofAreaInfo() {
        const result = exporters.getAllModelType();
        exporters.getModels(this.ground, result);

        let roofWithPanelArea = 0;
        let underneathArrayArea = 0;
        let buildingWithPanelArea = 0;

        for (let i = 0; i < result.smartroofFaces.length; i++) {
            const isContains = result.smartroofFaces[i].checkContainsPanel();

            if (isContains) {
                roofWithPanelArea =  roofWithPanelArea + result.smartroofFaces[i].computeArea();
            }

            underneathArrayArea += result.smartroofFaces[i].computeAreaForPanels();
        }

        for (let i = 0; i < result.smartroofs.length; i++) {
            const children = result.smartroofs[i].getChildren();

            for (let j = 0; j < children.length; j+= 1) {
                const child = children[j];
                const isContains = child.checkContainsPanel();

                if (isContains) {
                    buildingWithPanelArea += result.smartroofs[i].computeArea();
                    break;
                }
            }
        }

        for (let i = 0; i < result.polygons.length; i += 1) {
            const polygon = result.polygons[i];

            const isContains = polygon.checkContainsPanel();

            if (isContains) {
                roofWithPanelArea += polygon.computeArea();
                buildingWithPanelArea += polygon.computeArea();
            }
            underneathArrayArea += polygon.computeAreaForPanels();

        }

        return {
            roofWithPanelArea,
            underneathArrayArea,
            buildingWithPanelArea,
        }
    }



    /**
     * returns the default setting of the design
     */
    getDesignSettings() {
        return JSON.parse(JSON.stringify(this.designSettings));
    }

    appResize = () => {
        let resizeTimeout;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(this.resizeRendererAndCamera, 500);
    };
    resizeRendererAndCamera = () => {
        let canvas = this.rendererManager.getDomElement();
        let parent = this.dualMapVisible ? canvas.parentElement.parentElement : canvas.parentElement;
        let parentBoundingRect = parent.getBoundingClientRect();
        let parentPadding = parseInt(Object(window.getComputedStyle(parent, null)).getPropertyValue("padding-left"));
        let dualMapWidth = this.dualMapVisible ? document.getElementById("map_canvas").clientWidth : 0;
        this.screenDimensions = {
            width: this.dualMapVisible ? parent.offsetWidth/2 : parent.offsetWidth - 2 * parentPadding,
            height: parent.offsetHeight - 2 * parentPadding,
            left: parentBoundingRect.left+dualMapWidth ,
            top: parentBoundingRect.top
        };
        this.rendererManager.resizeRenderer(this.screenDimensions);
        this.cameraManager.updateCamera(this.screenDimensions, this.imageDimensions);
        this.eventBus.dispatchEvent({ type: CAMERA_UPDATED });
    };

    // TODO: remove this function in 3d and then add back in when switch to 2d.
    onDocumentMouseMove = (event) => {
        if (!this.visualManager.getIn3D()) {
            this.mousePoint = utils
                .getNormalizedCameraCoordinates(event.clientX, event.clientY, this);
            this.event = event;
        }
    }

    mouseMove(event) {
        if (!this.visualManager.getIn3D() && raycastingUtils.checkPointOnGround(this.mousePoint, this)) {
            if (this.prevMousePoint.distanceToSquared(this.mousePoint) >= 0.000001) {
                for(let ind = 0; ind < this.highlightedObjects.length; ind += 1) {
                    this.highlightedObjects[ind].unHighlight();
                }
                this.highlightedObjects = [];
                const coordinates = {
                    x: this.lastXValue,
                    y: this.lastYValue,
                    z: this.lastZValue,
                    enabled: false,
                }
                coordinates.x = (this.mousePoint.x).toFixed(3);
                coordinates.y = (this.mousePoint.y).toFixed(3);
                if (this.eventHandler.mouseMoves[this.placeManager.mouseMovesIndex] === undefined || this.eventHandler.mouseMoves[this.dragControls.mouseMovesIndex] === undefined) {
                    const objectMeshes = this.mergeManager.getAllMeshesInScene();
                    let objects = [];
                    // when stringing is enabled we should only be able to select panels.
                    if (this.stringing.isEnabled()) {
                        const objectMeshesForStringing = [];
                        objectMeshes.forEach((mesh) => {
                            if (mesh.parent.container instanceof Subarray)
                                objectMeshesForStringing.push(mesh);
                            })
                        objects = raycastingUtils.getAllObjectsBelowPoint(this.mousePoint, this, undefined, objectMeshesForStringing, 0.0001);
                    }
                    else {
                        objects = raycastingUtils.getAllObjectsBelowPoint(this.mousePoint, this, undefined, objectMeshes, 0.0001);
                    }
                    if (objects.length > 0) {
                        let i = 0;
                        while (i < objects.length) {
                            if( objects[i][0] instanceof OutlinePoints || 
                                objects[i][0] instanceof InnerEdge ||
                                objects[i][0] instanceof Edge ||
                                objects[i][0] instanceof RotationPoint ||
                                objects[i][0] instanceof OuterEdge) {
                                objects[i][0].highlightOnHover();
                                this.highlightedObjects.push(objects[i][0]);
                            }
                            if (objects[i][0] instanceof DrawManager ||
                                objects[i][0] instanceof OutlinePoints ||
                                objects[i][0] instanceof LengthMeasurement ||
                                objects[i][0] instanceof Dimension ||
                                objects[i][0] instanceof ArcMeasurement ||
                                objects[i][0] === undefined
                            ) {
                                i += 1;
                            } else {
                                break;
                            }
                        }
                        coordinates.z = Math.max(objects[i][1], 0).toFixed(3);
                        this.lastZValue = coordinates.z;
                        this.lastXValue = coordinates.x;
                        this.lastYValue = coordinates.y;
                        coordinates.enabled = true;
                        if (this.stringing.isEnabled()) {
                            if (objects[i][0] instanceof Subarray) {
                                const point = new THREE.Vector3(coordinates.x, coordinates.y, 0);
                                const table = objects[i][0].getNearestTableToPoint(point);
                                const panel = table.getNearestPanelToPoint(point);
                                this.stringing.onMouseMove(event, panel);
                            }
                        }
                        this.prevMousePoint = this.mousePoint.clone();
                    }
                }
                this.eventManager.setCursorCoordinates(coordinates);
            }
        } else {
            this.lastZValue = '--';
            this.lastXValue = '--';
            this.lastYValue = '--';
            const coordinates = {
                x: this.lastXValue,
                y: this.lastYValue,
                z: this.lastZValue,
                enabled: false,
            }
            this.eventManager.setCursorCoordinates(coordinates);
        }
    }

    addCameraUpdates(func) {
        if (this.cameraUpdates.indexOf(func) === -1) {
            this.cameraUpdates.push(func);
        }
    }

    toggleRstats() {
        const canvas = this.rendererManager.getDomElement();
        if (canvas.parentElement.contains(this.rStats.dom)) {
            canvas.parentElement.removeChild(this.rStats.dom);
        } else {
            canvas.parentElement.insertBefore(this.rStats.dom, canvas);
        }
    }
    
    load3DMesh(){
        if(this.googleTiles){
            if(!this.googleTiles.tilesLoaded){
                this.googleTiles = new GoogleTiles(this);
            }
            else if(this.googleTiles.tilesLoaded && !this.googleTiles.tileMeshHidden){
                    this.googleTiles.showTileMesh();
                    if(!this.visualManager.in3D){
                        this.googleTiles.shiftMeshBelowGround();
                    }
            }
            else{
                this.googleTiles.showTileMesh();
                if(!this.visualManager.in3D){
                    this.googleTiles.shiftMeshBelowGround();
                }
                // this.eventManager.errorTilesAlreadyLoaded();
            }
        }else{
            this.googleTiles = new GoogleTiles(this);
        }
    }

    hide3DMesh() {
        if (this.googleTiles && this.googleTiles.tilesLoaded) {
            this.googleTiles.hideTileMesh();
            if(!this.visualManager.in3D){
                this.googleTiles.shiftMeshAboveGround();
            }
        }
    }

    fitToTiles(){
        const groundChildren = this.ground.getChildren();
        const allSmartroofs = [];
            for (let i = 0, len = groundChildren.length; i < len; i++) {
                const child = groundChildren[i];
                if (child instanceof SmartroofModel) {
                    allSmartroofs.push(child);
                }
            }
            for (let i = 0, len = allSmartroofs.length; i < len; i++) {
                const smartRoofModel = allSmartroofs[i];
                smartRoofModel.getChildren().forEach((c) => {
                    c.updateLidarConvexHull();
                });
            }
            for (let i = 0, len = allSmartroofs.length; i < len; i++) {
                const smartRoofModel = allSmartroofs[i];
                this.googleTiles.fitToGoogleTiles(smartRoofModel);
            }
    }

    getUpdatedImageDimensionsOnResize(imageProperties, checkImageDimension, loadStageFlag = false) {
        if (imageProperties === null) {
            this.checkImageDimension = checkImageDimension;
        }
        else {
            this.checkImageDimension = utils.getImageDimensions(
                imageProperties.updatedLat,
                imageProperties.updatedLng,
                imageProperties.updatedZoom,
                imageProperties.updatedDimensions,
                imageProperties.updatedDimensions
            );
        }
        this.checkIfModelsOutsideGroundImage(this.checkImageDimension, loadStageFlag);
    }

    checkIfModelsOutsideGroundImage(groundImageDimensions, loadStageFlag) {
        const updatedGroundBoundingMax = new THREE.Vector2(groundImageDimensions.width / 2, groundImageDimensions.height / 2);
        const updatedGroundBoundingMin = new THREE.Vector2(-groundImageDimensions.width / 2, -groundImageDimensions.height / 2);
        const groundChildren = this.ground.getChildren();
        this.modelsOutsideGround = [];
        groundChildren.forEach((child) => {
            if (child.coreMesh) {
                child.coreMesh.geometry.computeBoundingBox();
                let childBoundingBox = child.coreMesh.geometry.boundingBox;
                if (childBoundingBox.max.x > updatedGroundBoundingMax.x || childBoundingBox.max.y > updatedGroundBoundingMax.y || childBoundingBox.min.x < updatedGroundBoundingMin.x || childBoundingBox.min.y < updatedGroundBoundingMin.y) {
                    this.modelsOutsideGround.push(child);
                }
            }
        });
        if (loadStageFlag) this.modelsOutsideGround.forEach((child) => {
            // child.removeObject();
        });
        if(this.modelsOutsideGround.length > 0) {
            serverBus.$emit('modelOutside', this.setModelOutside.bind(this));
        }
        else {
            serverBus.$emit('modelOutside', this.setModelInside.bind(this));
        }
    }

    deleteModelsOutsideGround() {
        if (this.modelsOutsideGround) this.modelsOutsideGround.forEach((child) => {
            child.removeObject();
        });
    }

    setModelOutside() {
        return true;
    }
    setModelInside() {
        return false;
    }

    animate() {
        this.rStats.id('frame').start();
        // this.glS.update();
        this.rStats.id('rAF').tick();
        this.rStats.id('FPS').frame();
        if(this.isVideoRecording){
            this.controlsManager._3dControls.update();
        }
        if(this.googleTiles){
            this.googleTiles.render();
        }
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        TWEEN.update();
        this.rStats.id('mouseMove').start();
        this.eventHandler.update(this.event);
        this.rStats.id('mouseMove').end();

        for (let i = 0; i < this.cameraUpdates.length; i++) {
            let func = this.cameraUpdates[i];
            if (func !== undefined) {
                func();
            }
        }
        this.cameraUpdates = [];

        this.rStats.id('render').start();
        this.rendererManager.render(this.sceneManager.scene, this.cameraManager.camera);
        this.rStats.id('render').end();
        this.rStats.id('frame').end();

        this.rStats.id('rStats').start();
        if (!PRODUCTION_ENV) {
            this.rStats.update();
        }
        this.rStats.id('rStats').end();
    }

    setDesignDefaultOpen(){
        this.designDefaultsOpened = true;
        return this.designDefaultsOpened;
    }
    // Sidebar button functions

    getMicroInverterInScene() {
        let microInverterInScene = (this.ground.microInverters.length > 0) ? true : false;
        // console.log(microInverterInScene , "in app");
        return microInverterInScene;
    }

    switchTo2d() {
        this.ground.showSkyAndGround();
        this.SLDManager.hideObject();
        if (this.sldView) {
            this.controlsManager.enableQuickLook();
            this.selectionControls.selectionRectangle.enableRectTool();
            this.controlsManager._2dControls.setDefaultZoom(1);
            this.viewManager.disableXray(this.ground);
            this.viewManager.bindXRayVision();
            this.ground.updateGroundForDrawing();
            this.sldView = false;
            this.controlsManager._2dControls.reset();
            if (this.heatMapEnabled) {
                this.heatMapEnabled = false;
                this.heatMap.show();
            }
            if (this.solarAccessEnabled) {
                this.solarAccessEnabled = false;
                this.showSolarAccess();
            }
            if (this.sldGroup !== undefined) {
                this.sldGroup.visible = false;
            }
            this.mergeManager.showMergedMesh();
        }
        if(this.googleTiles && useStudioStore().isGoogle3dSwitchEnabled){
            if(this.googleTiles.tileMeshHidden){
                this.googleTiles.showTileMesh();
            }
            if(this.googleTiles.isAbove){
                this.googleTiles.shiftMeshBelowGround()
            }
        }
        this.toggleDcCable();
        this.showInverterIn2D();
        this.showStringing();
        this.hideStructure();
        this.updateTextMeshView('2D');
        
        // this.rotateSceneBack();
        this.duplicateManager.enable();
        this.selectionControls3D.disable();
        if (!this.selectionControls.isEnabled()) {
            this.selectionControls.enable();
        }
        this.selectionControls.setSelectedObject(this.ground);
        this.cameraManager.useOrthographicCamera();
        this.controlsManager.use2dControls();
        this.lightsManager.sunPosResetFor2D();
        this.eventManager.setButtonVisibilityIn2D();
        this.viewManager.showLengthMeasurements();
        this.visualManager.updateVisualsFor2D();
        this.inCustomImageEditMode = false;

        // show dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].show();
        }
        if(this.streetMapVisible){
            this.dualMapManager.showStreetViewLayer();
        }
            this.mergeManager.switchTo2D();

        if (this.designSettings["drawing_defaults"]["texture"]) {
            if (this.heatMap != undefined && !this.heatMap.heatMapEnabled ){
                this.ground.removeRoofTexture();
            }
            else {
                this.ground.addRoofTexture();
            }
        }
        this.lidar.switchTo2D();
        // TODO: Fix the proper way
        setTimeout(() => {
            this.eventBus.dispatchEvent({ type: CAMERA_UPDATED });
        }, 200)
    }

    switchToCustomImageEditMode(imageData, imageId, transformations) {
        this.switchTo2d();
        this.eventManager.updateSidebarFor2DSwitch();

        this.hideSolarAccess();
        this.inCustomImageEditMode = true;
        
        this.customImage = new CustomImage(this, imageData, imageId);
        this.customImage.applyTransformations(transformations);
        this.customImage.initialize();
    }

    validateStructures() {
        if (this.getDesignSettings().drawing_defaults.structures.visible) {
            let subarrayList = [];
            exporters.getSubarrays(this.ground, subarrayList);
            for (let i = 0; i < subarrayList.length; i += 1) {
                subarrayList[i].validateStructures();
            }
        }
    }

    hideStructure() {
        if (this.structures === null) {
            return;
        }
        // if (this.getDesignSettings().drawing_defaults.structures.visible) {
        //     this.structures.visible = false;
        // }
        this.structures.visible = false;
    }

    hideInvertersIn3D() {
        const inverters = exporters.getInverters(this);
        if (!this.showInverterIn3D) {
            for (let j = 0; j < inverters.length; j++) {
                inverters[j].hideObject();
            }
        }
    }

    showInverterIn2D() {
        const inverters = exporters.getInverters(this);
        for (let j = 0; j < inverters.length; j++) {
            if (inverters[j].AJB) {
                inverters[j].AJB.showObject();
            }
            inverters[j].showObject();
        }
    }

    toggleDcCable() {
        const inverters = exporters.getInverters(this);
        if (this.showInverterIn3D) {
            for (let j = 0; j < inverters.length; j++) {
                if (inverters[j].AJB) {
                    inverters[j].AJB.showObject();
                }
                // dc cable disabled
                // for (let i = 0; i < inverters[j].mppts.length; i++) {
                //     for (let k = 0; k < inverters[j].mppts[i].strings.length; k++) {
                //         if (inverters[j].mppts[i].strings[k].attachedDcCable == undefined) continue;
                //         inverters[j].mppts[i].strings[k].attachedDcCable[0].showObject();
                //         inverters[j].mppts[i].strings[k].attachedDcCable[1].showObject();
                //     }
                // }
            }
        } else {
            for (let j = 0; j < inverters.length; j++) {
                if (inverters[j].AJB) {
                    inverters[j].AJB.hideObject();
                }
                // dc cable disabled
                // for (let i = 0; i < inverters[j].mppts.length; i++) {
                //     for (let k = 0; k < inverters[j].mppts[i].strings.length; k++) {
                //         inverters[j].mppts[i].strings[k].attachedDcCable[0].hideObject();
                //         inverters[j].mppts[i].strings[k].attachedDcCable[1].hideObject();
                //     }
                // }
            }
        }
    }

    showStringing() {
        if (this.viewManager.showStringing) {
            this.viewManager.showStringingFunc();
        }
    }

    hideStringing() {
        if (this.viewManager.showStringing) {
            this.viewManager.hideStringing();
        }
    }

    async createStructures() {
        let subarrayList = [];
        if (this.getDesignSettings().drawing_defaults.structures.visible) {
            exporters.getSubarrays(this.ground, subarrayList);
        }
        else if (!this.getDesignSettings().drawing_defaults.structures.visible) {
            exporters.getSubarrays(this.ground, subarrayList);
            subarrayList = subarrayList.filter(ele => ele.objectType === 'Gazebo');
        }
            let notificationObject;
            if (this.checkStructureUpdateRequired(subarrayList)) {
                try {
                    notificationObject = this.eventManager.setCreateStrutureLoading();
                    this.sceneManager.scene.remove(this.structures);
                    this.structures = null;
                    this.structures = await createStructure({
                        subarrayList: subarrayList,
                        scene: this.sceneManager.scene,
                        structureDesignTemplate: this.getDesignSettings().drawing_defaults.structures.template,
                    });
                    this.sceneManager.scene.add(this.structures);
                } catch (ex) {
                    console.error(new Error('Error creating structures'));
                } finally {
                    this.eventManager.completeCreateStructureLoading(notificationObject)
                }

            } else {
                this.structures.visible = true;
            }
    }

    /**
     * check whether the structure is updated in any subarray
     * @param {*subarrayList of the updated subarray}  
     */
    checkStructureUpdateRequired(subarrayList) {
        let updateRequired = false;
        if (this.previousSubarrayList === null) {
            updateRequired = true;
        } else {
            if (this.previousSubarrayList.length !== subarrayList.length) {
                updateRequired = true;
            } else {
                for (let i = 0; i < subarrayList.length; i += 1) {
                    if (subarrayList[i] instanceof Gazebo) {
                        const prevSubarrayIdx = this.previousSubarrayList.findIndex(obj => obj.id === subarrayList[i].id);
                        if (prevSubarrayIdx !== -1) {
                            if (this.checkGazeboPropertiesChanged(
                                this.previousSubarrayList[prevSubarrayIdx].properties,
                                subarrayList[i].getState(),
                            ) || subarrayList[i].structureUpdateRequired) {
                                updateRequired = true;
                                break;
                            }
                        } else {
                            updateRequired = true;
                            break;
                        }
                    }
                    else {
                        const prevSubarrayIdx = this.previousSubarrayList.findIndex(obj => obj.id === subarrayList[i].id);
                        if (prevSubarrayIdx !== -1) {
                            if (this.checkPropertiesChanged(
                                this.previousSubarrayList[prevSubarrayIdx].properties,
                                subarrayList[i].getState(),
                            ) || subarrayList[i].structureUpdateRequired) {
                                updateRequired = true;
                                break;
                            }
                        } else {
                            updateRequired = true;
                            break;
                        }
                    }
                }
            }
        }
        if (updateRequired) {
            this.previousSubarrayList = [];
            for (let i = 0; i < subarrayList.length; i += 1) {
                this.previousSubarrayList.push({ id: subarrayList[i].id, properties: subarrayList[i].getState() });
                subarrayList[i].structureUpdateRequired = false;
            }
        }
        return updateRequired;
    }

    checkGazeboPropertiesChanged(prevProperties, currentProperties) {
        if (
            prevProperties.structureType !== currentProperties.structureType ||
            prevProperties.azimuth !== currentProperties.azimuth ||
            prevProperties.inverterType !== currentProperties.inverterType ||
            prevProperties.outlinePoints !== currentProperties.outlinePoints
        ) {
            return true;
        }
        return false;
    }

    checkPropertiesChanged(prevProperties, currentProperties) {
        if (
            prevProperties.moduleProperties.moduleId !== currentProperties.moduleProperties.moduleId ||
            prevProperties.tilt !== currentProperties.tilt ||
            prevProperties.structureType !== currentProperties.structureType ||
            prevProperties.azimuth !== currentProperties.azimuth ||
            prevProperties.rowSpacing !== currentProperties.rowSpacing ||
            prevProperties.tableSpacing !== currentProperties.tableSpacing ||
            prevProperties.tableSizeUp !== currentProperties.tableSizeUp ||
            prevProperties.tableSizeWide !== currentProperties.tableSizeWide ||
            prevProperties.panelOrientation !== currentProperties.panelOrientation ||
            prevProperties.mountHeight !== currentProperties.mountHeight ||
            prevProperties.moduleSpacingUp !== currentProperties.moduleSpacingUp ||
            prevProperties.moduleSpacingWide !== currentProperties.moduleSpacingWide ||
            prevProperties.rowSpacingMode !== currentProperties.rowSpacingMode ||
            prevProperties.mountType !== currentProperties.mountType ||
            JSON.stringify(prevProperties.outlinePoints) !== JSON.stringify(currentProperties.outlinePoints)
        ) {
            return true;
        }
        return false;
    }

    updateTextMeshView(view) {
        for (let i = 0; i < this.textObjects.length; i++) {
            let textObj = this.textObjects[i];
            if (textObj) {
                textObj.switchView(view);
            }
        }
    }

    updateSubarrayColor() {
        if (this.gazeboMode.enable) return;
        const subarrays = [];
        exporters.getSubarrays(this.ground, subarrays);

        const currentSelectedObjects = [...this.selectionControls.getSelectedObjects()];
        const subarraysListForUpdate = new Set([...subarrays])
        const subarraysListForUpdateWithExcludingPanels = [];
        for (let obj of currentSelectedObjects) {
            // to update merged meshes of subarray
            if (obj instanceof Table) {
                if (obj.getParent() !== null && obj.getSubarray() !== null) {
                    const subArray = obj.getSubarray();
                    if (!subarraysListForUpdateWithExcludingPanels.includes(subArray)) {
                        subarraysListForUpdateWithExcludingPanels.push(subArray);
                    }
                    // Temp fix for EW: REWORK REQUIRED
                    if (subArray.eastWestRackingEnabled) {
                        if (subArray.linkedSubarray && !subarraysListForUpdateWithExcludingPanels.includes(subArray.linkedSubarray)) {
                            subarraysListForUpdateWithExcludingPanels.push(subArray.linkedSubarray);
                        }
                        if (subArray.rackSubarray && !subarraysListForUpdateWithExcludingPanels.includes(subArray.rackSubarray)) {
                            subarraysListForUpdateWithExcludingPanels.push(subArray.rackSubarray);
                        }
                        if (!currentSelectedObjects.includes(obj.linkedTable)) {
                            currentSelectedObjects.push(obj.linkedTable);
                        }
                    }
                }
            }
        }

        subarraysListForUpdateWithExcludingPanels.forEach((subarray) => {
            if (subarraysListForUpdate.has(subarray)) {
                subarraysListForUpdate.delete(subarray);
            }
            subarray.mergeGeometriesForAllPanels({excludeTables: currentSelectedObjects});
        })

        subarraysListForUpdate.forEach((subarray) => {
            subarray.mergeGeometriesForAllPanels();
        })

    }

    async switchTo3d() {
        this.SLDManager.hideObject();
        this.ground.showSkyAndGround();        
        this.selectionControls.selectionRectangle.hide();
        if (this.sldView) {
            this.controlsManager.enableQuickLook();
            this.controlsManager._2dControls.setDefaultZoom(1);
            this.viewManager.disableXray(this.ground);
            this.viewManager.bindXRayVision();
            this.controlsManager._2dControls.reset();
            if (this.heatMapEnabled) {
                this.heatMapEnabled = false;
                this.heatMap.show();
            }
            if (this.solarAccessEnabled) {
                this.solarAccessEnabled = false;
                this.showSolarAccess();
            }
            if (this.sldGroup !== undefined) {
                this.sldGroup.visible = false;
            }
            this.ground.updateGroundForDrawing();
            this.sldView = false;
            this.mergeManager.showMergedMesh();
        }
        if(this.googleTiles && useStudioStore().isGoogle3dSwitchEnabled){
            if(this.googleTiles.tileMeshHidden){
                this.googleTiles.showTileMesh();
            }
            if(!this.googleTiles.isAbove){
                this.googleTiles.shiftMeshAboveGround();
            }
        }
        this.flag = true;
        this.toggleDcCable();
        this.hideInvertersIn3D();
        this.hideStringing();
        await this.createStructures();
        // this.rotateScene();
        this.updateTextMeshView('3D');
        this.duplicateManager.disable();
        this.selectionControls.selectGroundAndDisable();
        if (!this.selectionControls3D.isEnabled() && !store.state.design.versions.overviewMode) {
            this.selectionControls3D.enable();
        }
        this.controlsManager.use3dControls();
        this.cameraManager.usePerspectiveCamera();
        this.lightsManager.sunPosResetFor3D();
        this.eventManager.setButtonVisibilityIn3D();
        this.visualManager.updateVisualsFor3D(this.ground);
        this.viewManager.hideLengthMeasurements();
        this.inCustomImageEditMode = false;
        // hide dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].hide();
        }
        this.mergeManager.switchTo3D();
        // get all children and iterate for childs and display texture
        if (this.designSettings["drawing_defaults"]["texture"]) {
            this.ground.addRoofTexture();
        }
        if(this.streetMapVisible){
            this.dualMapManager.hideStreetViewLayer();
        }
        this.lidar.switchTo3D();
        let desigCanvas = document.getElementById('design-canvas');
        desigCanvas.style.cursor = 'default';
    }

    async switchToSLD() {
        const notificationObject = this.eventManager.setCreateSLDLoading();
        if(this.lidar.lidarModeEnabled || this.lidar.lidarMeshVisible){
            this.lidar.toggleLidarMode();
        }
        this.ground.children.forEach((child) => {
            if (child instanceof Tree) {
                if (child.polyTrunkMesh) {
                    child.polyTrunkMesh.visible = false;
                }
            }
        })
        if (!this.selectionControls.isEnabled()) {
            this.selectionControls.enable();
        }
        if(this.googleTiles){
            if(!this.googleTiles.tileMeshHidden){
                this.googleTiles.hideTileMesh();
            }
        }
        this.selectionControls.selectionRectangle.disableRectTool();
        if (this.visualManager.getIn3D()) {
            // this.rotateSceneBack();
            this.hideStructure();
            this.controlsManager._2dControls.reset();
            this.cameraManager.useOrthographicCamera();
            this.controlsManager.use2dControls();
            this.lightsManager.sunPosResetFor2D();
            setTimeout(() => {
                this.eventBus.dispatchEvent({ type: CAMERA_UPDATED });
            }, 200)
        } else {
            this.duplicateManager.disable();
            this.selectionControls.setSelectedObject(this.ground);
        }
        this.ground.hideSkyAndGround();
        if (this.heatMap.isVisible()) {
            this.heatMapEnabled = true;
            this.heatMap.hide();
        }
        if (this.visualManager.getSolarAccessEnabled()) {
            this.solarAccessEnabled = true;
            this.hideSolarAccess();
        }
        //  if (this.designSettings["drawing_defaults"]["texture"]) {
        //     this.ground.removeRoofTexture();
        // }
        this.sldView = true;
        this.controlsManager.disableQuickLook();
        this.hideStringing();
        this.visualManager.updateVisualsFor3D();
        // hide models
        this.viewManager.enableXray(this.ground);
        this.viewManager.unbindXRayVision();
        this.ground.updateGroundForSLD();
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].hide();
        }

        this.inCustomImageEditMode = false;
        // this.renderModule();
        // sldUtils.drawSLD(this);
        // hide dimensions
        this.mergeManager.hideMergedMesh();
        try {
            await this.SLDManager.init();
        } catch (ex) {
            if (ex.request) {
                this.eventManager.completeCreateSLDLoading(notificationObject)
                this.eventManager.setSaveWireSizeCalculator()
            }
            console.log(ex);
            console.error(new Error('Error creating SLD'));
        } finally {
            this.eventManager.completeCreateSLDLoading(notificationObject)
        }
        this.eventManager.setStudioForSLD();
    }

    switchToInverterMenu() {
        this.eventManager.setStudioForInverterMenu();
    }

    rotateScene() {
        // if (!this.sceneRotated) {
        //     for (let child of this.sceneManager.scene.children) {
        //         child.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        //     }
        //     this.sceneRotated = true;
        // }
    }

    rotateSceneBack() {
        // if (this.sceneRotated) {
        //     for (let child of this.sceneManager.scene.children) {
        //         child.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        //     }
        //     this.sceneRotated = false;
        // }
    }

    newPolygonModel(isObstructionType = false) {
        let polygonModel = new PolygonModel(this, isObstructionType);
        polygonModel.initDrawingMode();
        return polygonModel;
    }

    newPitchedRoofModel() {
        let pitchedRoofModel = new SmartroofModel(this);
        pitchedRoofModel.initDrawingMode();
        return pitchedRoofModel;
    }
    newDrawFace() {
        let drawFace = new Drawface(this);
        drawFace.initDrawingMode();
        return drawFace;
    }

    newRectangleModel() {
        let rectangle = new RectangleObstruction(this);
        rectangle.initDrawingMode();
        return rectangle;
    }

    newCylinderModel(isObstructionType = true) {
        let cylinderModel = new CylinderModel(this, isObstructionType);
        cylinderModel.initDrawingMode();
        return cylinderModel;
    }

    newTree() {
        const tree = new Tree(this);
        tree.initDrawingMode();
        return tree;
    }

    newHippedDormer() {
        
        const dormer = new SmartroofBuilder('HippedDormer', this.stateManager.stage);
        dormer.model.initDormerPlacingMode();
        return dormer;
    }

    newGabledDormer() {
        const dormer = new SmartroofBuilder('GabledDormer', this.stateManager.stage);
        dormer.model.initDormerPlacingMode();
        return dormer;
    }

    newGazebo(){
        const gazebo = this.gazeboMode;
        gazebo.initGazeboMode();
        return gazebo;
    }


    newFlatDormer() {
        const dormer = new SmartroofBuilder('FlatDormer', this.stateManager.stage);
        dormer.model.initDormerPlacingMode();
        return dormer;
    }

    async newTurretDormer() {
        const turretDormer = new TurretDormer(this.stateManager.stage);
        await turretDormer.makeDormer();
        turretDormer.initDormerPlacingMode();
        return turretDormer;
    }

    newInverter() {
        const inverter = new Inverter(this);
        inverter.initPlacingMode();
        return inverter;
    }

    newACDB() {
        const acdb = new ACDB(this);
        acdb.initACDBPlacingMode();
        return acdb;
    }

    newCombinerBox(microInverter) {
        const combinerBox = new CombinerBox(this);
        combinerBox.linkedMicroInverter = microInverter;
        combinerBox.initCombinerBoxPlacingMode(microInverter);
        return combinerBox;
    }

    newDCDB() {
        const dcdb = new DCDB(this);
        dcdb.initPlacingMode();
        return dcdb;
    }

    newDimension() {
        let dimension = new Dimension(this);
        if (dimension.initDrawingMode())
            return dimension;
        else
            return null;
    }

    newTextBox() {
        const textBox = new TextBox(this);
        textBox.initDrawingMode();
        return textBox;
    }

    newSubarrayDrawingMode() {
        let subarray = new Subarray(this);
        subarray.initDrawingMode();
        return subarray;
    }

    newEastWestRackDrawingMode() {
        let eastWestRack = new EastWestRack(this);
        eastWestRack.initDrawingMode();
        return eastWestRack;
    }

    newWalkway() {
        const walkwayModel = new Walkway(this);
        walkwayModel.initDrawingMode();
        return walkwayModel;
    }

    newSafetyLine() {
        const walkwayModel = new SafetyLine(this);
        walkwayModel.initDrawingMode();
        return walkwayModel;
    }

    newHandrail() {
        const handrail = new Handrail(this);
        handrail.initDrawingMode();
        return handrail;
    }
    
    newProperty() {
        const property = new Property(this);
        property.initDrawingMode();
        return property;
    }
    newAcCable() {
        const acCable = new AcCable(this);
        acCable.initDrawingMode();
        return acCable;
    }

    newConduit() {
        const conduit = new Conduit(this);
        conduit.initDrawingMode();
        return conduit;
    }

    newDoubleConduit() {
        const doubleConduit = new DoubleConduit(this);
        doubleConduit.initDrawingMode();
        return doubleConduit;
    }

    newDoubleSeparateConduit() {
        const doubleSeparateConduit = new DoubleSeparateConduit(this);
        doubleSeparateConduit.initDrawingMode();
        return doubleSeparateConduit;
    }

    newSingleCableTray() {
        const singleCableTray = new SingleCableTray(this);
        singleCableTray.initDrawingMode();
        return singleCableTray;
    }

    newDoubleCableTray() {
        const doubleCableTray = new DoubleCableTray(this);
        doubleCableTray.initDrawingMode();
        return doubleCableTray;
    }

    newDoubleSeparateCableTray() {
        const doubleSeparateCableTray = new DoubleSeparateCableTray(this);
        doubleSeparateCableTray.initDrawingMode();
        return doubleSeparateCableTray;
    }

    showSolarAccess() {
        this.visualManager.updateVisualsForSolarAccess(true);
        this.eventManager.solarAccessVisibility(true);
    }

    hideSolarAccess() {
        this.eventManager.solarAccessVisibility(false);
        this.visualManager.updateVisualsForSolarAccess(false);
    }

    getSolarAccessColorMap() {
        return this.solarAccessColorMap;
    }


    // top bar functions
    async exportSTL() {
        let result = await exporters.STLExport(this);
        return result;
    }

    async exportCollada() {
        let result = await exporters.ColladaExport(this);
        return result;
    }

    async exportDXF() {
        let result = this.SLDManager.exportAsDXF();
        return result;
    }

    exportDesignDXF() {
        const result = this.DesignDxfManager.exportAsDesignDXF();
        return result;
    }

    async exportPDF() {
        let result = await createPDF(this);
        return result;
    }

    // initVideoDownload() {
    //     let url =  "/stage-report/" + this.getReferenceId() + "?video=true"
    //     let target = "_blank"
    //     let windowFeatures = "popup"
    //     window.open(url, "target", "width="+screen.width+",height="+screen.height+",toolbar=no,menubar=no,fullscreen='yes',top=0,left=0,resizable=0").moveTo(0,0);
    // }

    async downloadVideo() {
        const studioStageVue = document.getElementById('studio').__vue__;
        const timeController = document.getElementById('timeController'); 
        let timeControllerVue;
        if(timeController){
            timeControllerVue = timeController.__vue__;
            timeControllerVue.$data.videoRecording = true;
        }
        studioStageVue.$data.isLoadingVisible = true;
        this.isVideoRecording = true;
        let result = await createVideo(this);
        studioStageVue.$data.isLoadingVisible = false;
        if (timeController) {
            timeControllerVue.$data.videoRecording = false;
        }
        return result;
    }
    
    getDesignVersionId() {
        const getter = {
            $store: store,
            ...mapState(useDesignStore, {
                designVersionId: state => state.versions.id,
            }),
        };
        return getter.designVersionId();
    }

    setDesignId(designId) {
        this.designId = designId;
        this.asyncManager.setReportSpecialSettings();
    }

    getDesignId() {
        if (this.designId !== -1) {
            return this.designId;
        }
        const getter = {
            $store: store,
            ...mapState(useDesignStore, {
                designId: state => state.id,
            }),
        };
        return getter.designId();
    }

    getReferenceId() {
        if (this.designId !== -1) {
            return this.designId;
        }
        const getter = {
            $store: store,
            ...mapState(useDesignStore, {
                referenceId: state => state.versions.reference_id,
            }),
        };
        return getter.referenceId();
    }

    getOverviewMode() {
        const getter = {
            $store: store,
            ...mapState(useDesignStore, {
                overviewMode: state => state.versions.overviewMode,
            }),
        };
        return getter.overviewMode();
    }

    getStore() {
        console.log(store)
    }

    getIsDesignSaved() {
        const getter = {
            $store: store,
            ...mapState(useDesignStore, {
                designId: state => state.id,
                designVersionScene: state => state.versions.scene,
                isDesignLoaded: state => state.isDesignLoaded,
            }),
        };
        if (!getter.isDesignLoaded) {
            return true;
        }
        const currentStageData = this.saveStage();
        const savedStageData = getter.designVersionScene() === undefined ?
            null :
            JSON.parse(JSON.stringify(getter.designVersionScene()));

        // when stage was never loaded
        if (typeof currentStageData === 'undefined') return false;

        // when design was never saved before
        if (savedStageData === null) {
            return currentStageData.ground.children.length == 0;
        }

        return isCloselyEqual(currentStageData.ground, savedStageData.ground, 3);
    }

    // helper functions

    showStatus() {
        console.log("State: ", !!this.stateManager.activeContainer);
        console.log("Draw: ", this.drawManager.isEnabled());
        console.log("Place: ", this.placeManager.isEnabled());
        console.log("Mirror: ", this.mirrorManager.isEnabled());
        console.log("Drag: ", this.dragControls.isEnabled());
        console.log("Selection: ", this.selectionControls.isEnabled());
        console.log("Selection Rectangle: ", this.selectionControls.selectionRectangle.selectionRectEnabled);
        console.log("Text Selection: ", this.textSelectionControls.selectionEnabled);
        console.log("Snap: ", this.snapManager.isInitialized);
        console.log("Duplicate: ", this.duplicateManager.isEnabled());
        console.log("Shadows: ", this.lightsManager.shadowEnabled);
        console.log("X Ray: ", this.viewManager.keyPressed);
        console.log("Controls 2D 3D: ", this.controlsManager.is2dControlsEnabled, this.controlsManager.is3dControlsEnabled);
    }

    enableRoofTexture() {
        if (this.designSettings["drawing_defaults"]["texture"]) {
            this.ground.addRoofTexture();
            this.ground.children.forEach(element => {
                if (element instanceof PolygonModel) {
                    element.hideRoofTextureWithoutTilt();
                }
            });
        }
    }

    async switchToNormalView() {
        if (this.designSettings["drawing_defaults"]["texture"]) {
            this.ground.removeRoofTexture();
        }
        await this.lightsManager.switchToNormalView();

    }

    async switchToMorningSummerShadowView() {
        this.enableRoofTexture();
        await this.lightsManager
            .switchToShadowView(SHADOW_VIEW_SUMMER_SOLSTICE, SHADOW_VIEW_MORNING_TIME);
    }

    async switchToMorningWinterShadowView() {
        this.enableRoofTexture();
        await this.lightsManager
            .switchToShadowView(SHADOW_VIEW_WINTER_SOLSTICE, SHADOW_VIEW_MORNING_TIME);
    }

    async switchToEveningSummerShadowView() {
        this.enableRoofTexture();
        await this.lightsManager
            .switchToShadowView(SHADOW_VIEW_SUMMER_SOLSTICE, SHADOW_VIEW_EVENING_TIME);
    }

    async switchToEveningWinterShadowView() {
        this.enableRoofTexture();
        await this.lightsManager
            .switchToShadowView(SHADOW_VIEW_WINTER_SOLSTICE, SHADOW_VIEW_EVENING_TIME);
    }

    switchToLayoutView() {
        this.enableRoofTexture();
        this.visualManager.updateVisualsForSunSimulation(true);
        this.rotateSceneBack();
        this.cameraManager.useOrthographicCamera();
        this.lightsManager.sunPosResetFor2D();
        // hide dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].hide();
        }
        this.rendererManager.renderer.shadowMap.needsUpdate = true;
    }

    async switchToHeatMapView() {
        if (this.designSettings["drawing_defaults"]["texture"]) {
            this.ground.removeRoofTexture();
        }
        this.eventManager.solarAccessVisibility(false);
        let subarrayList = [];
        exporters.getSubarrays(this.ground, subarrayList);
        for (let subarray of subarrayList) {
            subarray.hideObject();
        } 
        await this.heatMap.show(false);

    }

    switchOffHeatmapView() {
        let subarrayList = [];
        exporters.getSubarrays(this.ground, subarrayList);
        for (let subarray of subarrayList) {
            subarray.showObjectWithoutOutlinePoints();
        }
        this.heatMap.hide();
    }

    async switchToSolarAccessView() {
        this.enableRoofTexture();
        await this.asyncManager.updateSolarAccess(false);
        this.showSolarAccess();
        this.rendererManager.renderer.shadowMap.needsUpdate = true;
    }

    disableEditing() {
        this.selectionControls.disable();
        this.duplicateManager.disable();
    }

    destroyStage() {

        function doDispose(obj) {
            if (obj !== null) {
                for (let i = 0; i < obj.children.length; i++) {
                    doDispose(obj.children[i]);
                }
                if (obj.geometry) {
                    obj.geometry.dispose();
                    obj.geometry = undefined;
                }
                if (obj.material) {
                    if (obj.material.map) {
                        obj.material.map.dispose();
                        obj.material.map = undefined;
                    }
                    obj.material.dispose();
                    obj.material = undefined;
                }
            }
            obj = undefined;
        }

        cancelAnimationFrame(this.animationId);

        // Removing all event listeners
        window.removeEventListener("resize", this.appResize, false);
        window.removeEventListener("scroll", this.appResize, false);
        window.removeEventListener('mousemove', this.onDocumentMouseMove, false);
        if (this.selectionControls.isEnabled()) this.selectionControls.disable();
        if (this.dragControls.isEnabled()) this.dragControls.disable();
        if (this.drawManager.isEnabled()) this.drawManager.disable();
        if (this.placeManager.isEnabled()) this.placeManager.disable();
        if (this.mirrorManager.isEnabled()) this.mirrorManager.disable();
        this.duplicateManager.destroy();

        CustomImageEditorManager.destroyInstance();

        // destroy all meshes, materials and textures
        doDispose(this.sceneManager.scene);

        this.sceneManager.scene = null;

        let renderer = this.rendererManager.renderer;
        renderer.forceContextLoss();
        renderer.context = null;
        renderer.domElement = null;
        this.rendererManager.render = null;

        this.cameraManager.camera = null;
        this.cameraManager.perspectiveCamera = null;
        this.cameraManager.orthographicCamera = null;

        this.controlsManager._2dControls.disable();
        this.controlsManager._3dControls.disable();

        // let scene = this.sceneManager.scene;
        // for (let object of scene.children) {
        //     object.geometry.dispose();
        //     object.material.dispose();
        //     scene.remove(object);
        // }

    }

    updateSunRoofView(sunTime) {
        this.tweenControls.TweenActions.time = sunTime;
        this.tweenControls.TweenActions.sun();
    }

    updateMapImage(image) {
        console.log(image,"adsasfa");
        this.groundImage = image;
        this.ground.loadGroundImage(image);
        if(this.lidar.lidarModeEnabled || this.lidar.lidarMeshVisible){
            this.lidar.hideObject();
        }
        this.selectionControls.setSelectedObject(this.ground);
        if(this.googleTiles){
            this.googleTiles.disposeFalseComponents();
            this.googleTiles = null;
            useStudioStore().SET_GOOGLE3D_STATUS(false)
            useStudioStore().SET_FITGOOGLE3D_STATUS(false);
        }
    }

    updateImageDimensions(newImageDimensions) {
        this.imageDimensions = newImageDimensions;
        this.cameraManager.updateImageDimensions(this.screenDimensions, this.imageDimensions);
    }

    main() {
        this.appResize();
        this.animate();
    }

}
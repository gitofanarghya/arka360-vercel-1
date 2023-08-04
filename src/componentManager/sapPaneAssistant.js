import API from '@/services/api/';
import axios from 'axios';
import _ from 'lodash';
import * as THREE from "three";
import { Vector3 } from 'three';
import { CABLE_TYPE, MANUAL_ACCABLE_SIZE_MMSQ, MANUAL_STRING_AWG, PRODUCTION_ENV, SUBARRAY_RACK_STYLE_EWRACKING, SUBARRAY_RACK_STYLE_FIXED, SUBARRAY_RACK_STYLE_FLUSH, ADD_EW_TABLE } from '../core/coreConstants';
import EastWestRack from '../core/lib/EastWestRacking';
import LassoSelectionTool from '../core/lib/LassoSelectionTool';
import Gazebo from '../core/lib/PowerGazebo';
import CustomImageEditorManager from '../core/managers/CustomImageEditorManager';
import { FLAT_FOLD, PITCHED_FOLD, VERTICAL_FOLD } from '../core/objectConstants';
import ACDB from '../core/objects/ac/ACDB';
import CombinerBox from '../core/objects/ac/CombinerBox';
import DCDB from '../core/objects/ac/DCDB';
import Inverter from '../core/objects/ac/Inverter';
import MicroInverter from '../core/objects/ac/MicroInverter';
import DoubleCableTray from '../core/objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../core/objects/ac/cableTrays/DoubleSeparateCableTray';
import SingleCableTray from '../core/objects/ac/cableTrays/SingleCableTray';
import Conduit from '../core/objects/ac/conduits/Conduit';
import DoubleConduit from '../core/objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../core/objects/ac/conduits/DoubleSeparateConduit';
import Ground from '../core/objects/ground/Ground';
import CylinderModel from '../core/objects/model/CylinderModel';
import Handrail from '../core/objects/model/Handrail';
import PolygonModel from '../core/objects/model/PolygonModel';
import Property from '../core/objects/model/Property';
import SafetyLine from '../core/objects/model/SafetyLine';
import Tree from '../core/objects/model/Tree';
import Walkway from '../core/objects/model/Walkway';
import AcCable from '../core/objects/model/cable/AcCable';
import DcCable from '../core/objects/model/cable/DcCable';
import Dormer from '../core/objects/model/smartroof/Dormer';
import DrawFace from '../core/objects/model/smartroof/DrawFace';
import OuterEdge from '../core/objects/model/smartroof/OuterEdge';
import SmartroofFace from '../core/objects/model/smartroof/SmartroofFace';
import { SmartroofModel } from '../core/objects/model/smartroof/SmartroofModel';
import FlatDormer from '../core/objects/model/smartroof/dormers/FlatDormer';
import HippedDormer from '../core/objects/model/smartroof/dormers/HippedDormer';
import DCString from '../core/objects/subArray/DCString';
import ElectricalString from '../core/objects/subArray/ElectricalString';
import InstancedTable from '../core/objects/subArray/InstancedTable';
import Panel from '../core/objects/subArray/Panel';
import Row from '../core/objects/subArray/Row';
import Subarray from '../core/objects/subArray/Subarray';
import Table from '../core/objects/subArray/Table';
import Dimension from '../core/objects/subObjects/Dimension';
import OutlinePoints from '../core/objects/subObjects/OutlinePoints';
import TextBox from '../core/objects/subObjects/TextBox';
import ThreejsText from '../core/objects/subObjects/ThreejsText';
import { VISUAL_STATES } from '../core/objects/visualConstants';
import { getDefaultGroundSize } from '../core/utils/customImageEditUtils';
import {
    getAllAcCables,
    getAllDcCables,
    getGazebos,
    getInverters,
    getOptimizerQuantity,
    getSubarrays,
    panelMapExporter,
    roofMapExporter,
} from '../core/utils/exporters';
import { getAllObjectsBelowPoint } from '../core/utils/raycastingUtils';
import { autoFixSubarrayForStructureTemplate, getAllModuleQuantity } from '../core/utils/subarrayUtils';
import { checkPointInsideVertices } from '../core/utils/utils';
import { serverBus } from '../main';
import { store } from '../store';
import * as CONSTANTS from './componentManagerConstants';
import * as notificationsAssistant from './notificationsAssistant';
import * as topBarAssistant from './topBarAssistant';
import CustomImage from '../core/objects/ground/CustomImage';


function onObjectCreation(objectCreated, options = {}) {
    function modelCreated(model) {
        const component = 'model';

        const modelSummaryData = {
            modelNumber: model.id,
            modelArea: 0,
            percentageArea: 0,
            isObstruction : model.isObstruction,
        };

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onModelPropertyUpdate(updatedProperties, isValid) {
            const model = this;
            model.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                model.changePropertiesDuringCreation(updatedProperties);
                model.stage.drawManager.updatePolygonOnPropertiesChange();
            }
        }

        const modelActionsData = {
            deleteModel: nullFunc,
            duplicate: nullFunc,
            editDimensions: nullFunc,
            fillFace: nullFunc,
            addFold: nullFunc,
            addFlatFold: nullFunc,
            addVerticalFold: nullFunc,
            mergeFaces: nullFunc,
            addTable: nullFunc,
            customFillFace: nullFunc,
            makePrimaryEdge: nullFunc,
            isObstruction : model.isObstruction,
        };

        const modelPropertiesData = {
            coreHeight: model.coreHeight,
            parapetHeight: model.parapetHeight,
            parapetThickness: model.parapetThickness,
            tilt: model.tilt,
            structureType: model.structureType,
            topHeight: model.topHeight,
            lockedParameter: model.lockedParameter,
            computeTiltAndHeights: model.computeTiltAndHeights.bind(model),
            azimuth: model.azimuth,
            setbackInside: model.setbackInside,
            setbackOutside: model.setbackOutside,
            setbackEditMode: nullFunc,
            ignored: model.ignored,
            placable: model.placable,
            flushType: (model.flushType === undefined || model.flushType === null) ? false : model.flushType,
            heatMapThreshold: model.heatMapThreshold,
            rotationAllowed: (model.isRotationAllowed === undefined || model.isRotationAllowed === null) ? true : model.isRotationAllowed,
            obstruction: model.obstruction,
            update: onModelPropertyUpdate.bind(model),
            getPossibleAzimuths: model.getPossibleAzimuths.bind(model, { isCreation: true }),
            getCurrentlyLockedParameter: model.getCurrentlyLockedParameter.bind(model),
            isObstruction : model.isObstruction,
            isCylinder: (model instanceof CylinderModel) ? true : false,
        };

        const { onlyUpdateGetters = false } = options;
        const { onlyUpdateLockedParameter = false } = options;

        serverBus.$emit(
            CONSTANTS.SET_SAP_PANE,
            'MODEL',
            modelSummaryData,
            modelActionsData,
            modelPropertiesData,
            true, { onlyUpdateGetters, onlyUpdateLockedParameter },
        );
    }

    function faceCreated(face) {
    }

    function gazeboCreated(gazebo) {
        // const component = 'gazebo';
        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }
        function onGazeboPropertyUpdate(updatedProperties, isValid) {
            const subarrayGazebo = this;
            if (subarrayGazebo.addTableFlow) {
                subarrayGazebo.stage.placeManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    subarrayGazebo.changeTablePropertiesDuringCreation(updatedProperties);
                }
            } else {
                subarrayGazebo.stage.drawManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    subarrayGazebo.changePropertiesDuringCreation(updatedProperties);
                }
            }
        }
        const gazeboSummaryData = {
            panelNumbers: 0,
            gazeboModelType: '',
            DCSize: 0,
            inverterType: '',

        };

        const gazeboActionsData = {
            deleteGazebo: nullFunc,
        };

        const gazeboPropertiesData = {
            update: onGazeboPropertyUpdate.bind(gazebo),
            structureType: gazebo.structureType,
            inverterType: gazebo.inverterType,
            azimuth: gazebo.azimuth,
            getPossibleAzimuths: gazebo.getPossibleAzimuths.bind(gazebo, { isCreation: true }),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'GAZEBO', gazeboSummaryData, gazeboActionsData, gazeboPropertiesData, true);
    }


    function smartroofModelCreated(model) {
        const component = 'model';

        const modelSummaryData = {
            modelNumber: model.id,
            modelArea: 0,
            percentageArea: 0,
        };

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onModelPropertyUpdate(updatedProperties, isValid) {
            const model = this;
            model.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                model.changePropertiesDuringCreation(updatedProperties);
                model.stage.drawManager.updatePolygonOnPropertiesChange();
            }
        }

        const modelActionsData = {
            deleteModel: nullFunc,
            duplicate: nullFunc,
            editDimensions: nullFunc,
            fillFace: nullFunc,
            addTable: nullFunc,
            addTurretFace: nullFunc,
            removeTurretFace: nullFunc,
            newHippedDormer: nullFunc,
            newGabledDormer: nullFunc,
            newFlatDormer: nullFunc,
            newTurretDormer: nullFunc,
            fitToLidar: nullFunc,
            customFillFace: nullFunc,
        };

        const modelPropertiesData = {
            coreHeight: model.coreHeight,
            topHeight: model.topHeight,
            azimuth: model.azimuth,
            ignored: model.ignored,
            snapHeight: model.snapHeight,
            update: onModelPropertyUpdate.bind(model),
            getPossibleAzimuths: model.getPossibleAzimuths.bind(model, { isCreation: true }),
        };

        const { onlyUpdateGetters = false } = options;

        serverBus.$emit(
            CONSTANTS.SET_SAP_PANE,
            'SMARTROOFMODEL',
            modelSummaryData,
            modelActionsData,
            modelPropertiesData,
            true, { onlyUpdateGetters },
        );
    }

    function dormerCreated(dormer) {

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        const dormerSummaryData = {
            modelNumber: dormer.id,
            modelArea: 0,
            percentageArea: 0,
            type: dormer.type,
        }
        const dormerActionsData = {
            deleteDormer: nullFunc,
        }
        const dormerPropertiesData = {
            tilt: dormer.getPitch().toFixed(2),
            minTilt: 0,
            maxTilt: 0,
            setbackOutside: 0,
            Height: dormer.getCoreHeight(),
            setbackEditMode: nullFunc,
            update: nullFunc,
        }
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DORMER', dormerSummaryData, dormerActionsData, dormerPropertiesData);
    }

    function instanceTableCreated(instancedTable) {
        let subarray = instancedTable.getSubarray();
        const component = 'subarray';

        const subarraySummaryData = {
            subarrayNumber: subarray.id,
            numPanels: 0,
            currentPanelsCount: getAllModuleQuantity(instancedTable.stage) + instancedTable.getPanelCount(),
            totalModules: instancedTable.totalModules,
            subarraySize: () => 0,
            panelType: '',
            getSolarAccess: () => 0,
        };

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function updateInstancedMesh(updatedProperties, isValid) {
            const instancedTable = this;
            // instancedTable.stage.placeManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                instancedTable.updateObject(updatedProperties);
            }
        }
        // function onSubarrayPropertyUpdate(updatedProperties, isValid) {
        //     const subarray = this;
        //     if (subarray.addTableFlow) {
        //         subarray.stage.placeManager.updatePropertiesValidationError(isValid);
        //         if (isValid) {
        //             subarray.changeTablePropertiesDuringCreation(updatedProperties);
        //         }
        //     } else {
        //         subarray.stage.drawManager.updatePropertiesValidationError(isValid);
        //         if (isValid) {
        //             subarray.changePropertiesDuringCreation(updatedProperties);
        //         }
        //     }
        // }

        function eastWestMountTypeSelected() {
            ewRackCreated(subarray, true);
        }
        function getEastWestRackingProperties(){
            subarray.getEastWestRackingProperties();
        }
        const { customFillFaceMode = false } = options;

        const subarrayActionsData = {
            deleteSubarray: nullFunc,
            addTables: nullFunc,
            onClickOptimise: nullFunc,
            resetSubarray: nullFunc,
            addTableFlow: subarray.addTableFlow,
        };

        const subarrayPropertiesData = {
            moduleId: subarray.moduleProperties.moduleId,
            name: subarray.name,
            tilt: subarray.tilt,
            azimuth: subarray.azimuth,
            structureType: subarray.structureType,
            rowSpacing: subarray.rowSpacing,
            rowSpacingMode: subarray.rowSpacingMode,
            tableSpacing: subarray.tableSpacing,
            interRowSpacing: subarray.interRowSpacing,
            intraRowSpacing: subarray.intraRowSpacing,
            interRowSpacingMode: subarray.interRowSpacingMode,
            tableSizeUp: subarray.tableSizeUp,
            tableSizeWide: subarray.tableSizeWide,
            panelOrientation: subarray.panelOrientation,
            mountHeight: subarray.mountHeight,
            moduleSpacingUp: subarray.moduleSpacingUp,
            moduleSpacingWide: subarray.moduleSpacingWide,
            update: updateInstancedMesh.bind(instancedTable),
            customFillFaceMode,
            getOptimisedRowSpacing: subarray.getOptimisedRowSpacing.bind(subarray),
            mountType: subarray.mountType,
            getFlushMountProperties: subarray.getFlushMountProperties.bind(subarray),
            getFixedMountProperties: subarray.getFixedMountProperties.bind(subarray),
            getEastWestRackingProperties: getEastWestRackingProperties.bind(subarray),
            ewRackCreated: eastWestMountTypeSelected.bind(subarray),
            getPossibleAzimuths: subarray.getPossibleAzimuths.bind(subarray, { isCreation: !customFillFaceMode }),
            addTableFlow: subarray.addTableFlow,
            bifacialEnabled: subarray.bifacialEnabled,
            eastWestRackingEnabled: subarray.eastWestRackingEnabled,
            getParent: subarray.getParent.bind(subarray),
        };

        const { onlyUpdateGetters = false } = options;
        const {updateSummary = false}  = options;   
        if(updateSummary){
            serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SUBARRAY', subarraySummaryData, undefined, undefined, true);
        }else{
            serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SUBARRAY', subarraySummaryData, subarrayActionsData, subarrayPropertiesData, true, { onlyUpdateGetters });
        }
        if (subarray.stage.getDesignSettings().drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
            serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'EWRACK', subarraySummaryData, subarrayActionsData, subarrayPropertiesData, true, { onlyUpdateGetters });
        }
    }

    function subarrayCreated(subarray) {
        const component = 'subarray';

        const subarraySummaryData = {
            subarrayNumber: subarray.id,
            numPanels: 0,
            subarraySize: () => 0,
            panelType: '',
            getSolarAccess: () => 0,
        };

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onSubarrayPropertyUpdate(updatedProperties, isValid) {
            const subarray = this;
            if (subarray.addTableFlow) {
                subarray.stage.placeManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    subarray.changeTablePropertiesDuringCreation(updatedProperties);
                }
            } else {
                subarray.stage.drawManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    subarray.changePropertiesDuringCreation(updatedProperties);
                }
            }
        }

        function onCancelCustomFillFace() {
            const { stage } = subarray;
            subarray.removeObject();
            stage.selectionControls.setSelectedObject(this.stage.ground);
            stage.stateManager.stopContainer();
        }

        function onCompleteCustomFillFace(updatedProperties) {
            const notificationObject = subarray.stage.eventManager.setUpdatePanelPlacementLoading();
            subarray.changePropertiesDuringCreation(updatedProperties);
            if( updatedProperties.eastWestRackingEnabled && 
                subarray.outlinePoints.length < 1
            ) {
                this.createBoundaryFromParent();
            }
            subarray.updatePanelPlacement().then(
                () => {
                    // if( updatedProperties.eastWestRackingEnabled &&
                    //     subarray.rackParent
                    // ) {
                    //     this.populateSubarrayForEastWestRacking();
                    // }
                    subarray.saveState();
                    subarray.validateStructures();
                    subarray.stage.selectionControls.setSelectedObject(subarray);
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    subarray.stage.stateManager.stopContainer();
                },
                () => {
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    subarray.stage.selectionControls.setSelectedObject(subarray.stage.ground);
                    subarray.stage.stateManager.stopContainer();
                },
            );
        }

        const { customFillFaceMode = false } = options;

        const subarrayActionsData = {
            deleteSubarray: nullFunc,
            addTables: nullFunc,
            onClickOptimise: nullFunc,
            resetSubarray: nullFunc,
            addTableFlow: subarray.addTableFlow,
            eastWestRackingEnabled: subarray.eastWestRackingEnabled,
        };

        function eastWestMountTypeSelected() {
            ewRackCreated(subarray, true);
        }

        const subarrayPropertiesData = {
            moduleId: subarray.moduleProperties.moduleId,
            name: subarray.name,
            tilt: subarray.tilt,
            azimuth: subarray.azimuth,
            structureType: subarray.structureType,
            rowSpacing: subarray.rowSpacing,
            rowSpacingMode: subarray.rowSpacingMode,
            tableSpacing: subarray.tableSpacing,
            intraRowSpacing: subarray.intraRowSpacing,
            interRowSpacing: subarray.interRowSpacing,
            tableSizeUp: subarray.tableSizeUp,
            tableSizeWide: subarray.tableSizeWide,
            panelOrientation: subarray.panelOrientation,
            mountHeight: subarray.mountHeight,
            moduleSpacingUp: subarray.moduleSpacingUp,
            moduleSpacingWide: subarray.moduleSpacingWide,
            update: onSubarrayPropertyUpdate.bind(subarray),
            cancelCustomFillFace: onCancelCustomFillFace.bind(subarray),
            completeCustomFillFace: onCompleteCustomFillFace.bind(subarray),
            ewRackCreated: eastWestMountTypeSelected.bind(subarray),
            customFillFaceMode,
            getOptimisedRowSpacing: subarray.getOptimisedRowSpacing.bind(subarray),
            mountType: subarray.mountType,
            getFlushMountProperties: subarray.getFlushMountProperties.bind(subarray),
            getFixedMountProperties: subarray.getFixedMountProperties.bind(subarray),
            getEastWestRackingProperties: subarray.getEastWestRackingProperties.bind(subarray),
            getPossibleAzimuths: subarray.getPossibleAzimuths.bind(subarray, { isCreation: !customFillFaceMode }),
            addTableFlow: subarray.addTableFlow,
            eastWestRackingEnabled: subarray.eastWestRackingEnabled,
            bifacialEnabled: subarray.bifacialEnabled,
            getParent: subarray.getParent.bind(subarray),
        };

        const { onlyUpdateGetters = false } = options;
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SUBARRAY', subarraySummaryData, subarrayActionsData, subarrayPropertiesData, true, { onlyUpdateGetters });
    }

    function ewRackCreated(subarray, fromSubarrayCreated = false) {
        let ewrack = subarray;
        let ewrackProperties = Object.assign({}, subarray);
        if (!(subarray instanceof EastWestRack)) {
            if (fromSubarrayCreated) ewrack = new EastWestRack(subarray.stage);
            ewrack.changeParent(subarray.getParent())
            ewrack.associatedModel = ewrack.parent;
            ewrack.addTableFlow = subarray.addTableFlow;
        }

        // assign outline points of subarray from which its created
        // console.log('subarray.outlinePoints: ', subarray.outlinePoints);
        if (ewrack.addTableFlow) {
            ewrack.outlinePoints = subarray.outlinePoints.map(outlinePoint => new OutlinePoints(
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
                ewrack,
                ewrack.stage,
            ));
        }
        const component = 'ewRack';

        const eastWestRackingSummaryData = {
            subarrayNumber: ewrack.id,
            numPanels: 0,
            subarraySize: () => 0,
            panelType: '',
            getSolarAccess: () => 0,
        };

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onSubarrayPropertyUpdate(updatedProperties, isValid) {
            const ewrack = this;
            if (ewrack.addTableFlow) {
                ewrack.stage.placeManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    ewrack.changeTablePropertiesDuringCreation(updatedProperties);
                }
            } else {
                ewrack.stage.drawManager.updatePropertiesValidationError(isValid);
                if (isValid) {
                    ewrack.changePropertiesDuringCreation(updatedProperties);
                }
            }
        }

        function onCancelCustomFillFace() {
            const { stage } = ewrack;
            ewrack.removeObject();
            stage.selectionControls.setSelectedObject(this.stage.ground);
            stage.stateManager.stopContainer();
        }

        function onCompleteCustomFillFace(updatedProperties) {
            const notificationObject = ewrack.stage.eventManager.setUpdatePanelPlacementLoading();
            ewrack.changePropertiesDuringCreation(updatedProperties);
            if( updatedProperties.eastWestRackingEnabled && 
                ewrack.outlinePoints.length < 1
            ) {
                if (ewrack.getParent() === null) {
                    ewrack.changeParent(ewrack.associatedModel);
                }
                ewrack.createBoundaryFromParent();
            }
            ewrack.updatePanelPlacement().then(
                () => {
                    // if( updatedProperties.eastWestRackingEnabled &&
                    //     ewrack.rackParent
                    // ) {
                    //     this.populateSubarrayForEastWestRacking();
                    // }
                    ewrack.saveState();
                    ewrack.validateStructures();
                    ewrack.stage.selectionControls.setSelectedObject(ewrack);
                    ewrack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    ewrack.stage.stateManager.stopContainer();
                },
                // () => {
                //     ewrack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                //     ewrack.stage.selectionControls.setSelectedObject(ewrack.stage.ground);
                //     ewrack.stage.stateManager.stopContainer();
                // },
            );
        }

        function subarrayMountTypeSelected(mountType) {
            subarray = new Subarray(ewrack.stage);
            subarray.mountType = mountType;
            subarray.changeParent(ewrackProperties.parent);
            ewrack.associatedModel = ewrack.parent;
            ewrack.addTableFlow = subarray.addTableFlow;
            subarray.createBoundaryFromParent();
            subarrayCreated(subarray, ewrack);
        }

        const { customFillFaceMode = false } = options;

        const eastWestRackingActionsData = {
            deleteSubarray: nullFunc,
            addTables: nullFunc,
            onClickOptimise: nullFunc,
            resetSubarray: nullFunc,
            addTableFlow: ewrack.addTableFlow,
            eastWestRackingEnabled: ewrack.eastWestRackingEnabled,
        };

        const eastWestRackingPropertiesData = {
            moduleId: ewrack.moduleProperties.moduleId,
            name: ewrack.name,
            tilt: ewrack.tilt,
            azimuth: ewrack.azimuth,
            structureType: ewrack.structureType,
            tableSpacing: ewrack.tableSpacing,
            intraRowSpacing: ewrack.intraRowSpacing,
            interRowSpacing: ewrack.interRowSpacing,
            interRowSpacingMode: ewrack.interRowSpacingMode,
            tableSizeUp: ewrack.tableSizeUp,
            tableSizeWide: ewrack.tableSizeWide,
            panelOrientation: ewrack.panelOrientation,
            mountHeight: ewrack.mountHeight,
            moduleSpacingUp: ewrack.moduleSpacingUp,
            moduleSpacingWide: ewrack.moduleSpacingWide,
            update: onSubarrayPropertyUpdate.bind(ewrack),
            cancelCustomFillFace: onCancelCustomFillFace.bind(ewrack),
            completeCustomFillFace: onCompleteCustomFillFace.bind(ewrack),
            customFillFaceMode,
            getOptimisedRowSpacing: ewrack.getOptimisedRowSpacing.bind(ewrack),
            mountType: SUBARRAY_RACK_STYLE_EWRACKING,
            subarrayCreated: subarrayMountTypeSelected.bind(ewrack),
            getFlushMountProperties: ewrack.getFlushMountProperties.bind(ewrack),
            getFixedMountProperties: ewrack.getFixedMountProperties.bind(ewrack),
            getEastWestRackingProperties: ewrack.getEastWestRackingProperties.bind(ewrack),
            getPossibleAzimuths: ewrack.getPossibleAzimuths.bind(ewrack, { isCreation: !customFillFaceMode }),
            addTableFlow: ewrack.addTableFlow,
            eastWestRackingEnabled: ewrack.eastWestRackingEnabled,
            bifacialEnabled: ewrack.bifacialEnabled,
            getParent: ewrack.getParent.bind(ewrack),
        };

        const { onlyUpdateGetters = false } = options;
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'EWRACK', eastWestRackingSummaryData, eastWestRackingActionsData, eastWestRackingPropertiesData, true, { onlyUpdateGetters });
    }

    function walkwayCreated(walkway) {
        const component = 'walkway';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onWalkwayPropertyUpdate(updatedProperties, isValid) {
            const walkway = this;
            walkway.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                walkway.changePropertiesDuringCreation(updatedProperties);
                walkway.stage.drawManager.updateRectangle();
            }
        }

        function onToggleDirection() {
            const walkway = this;
            walkway.toggleWalkwayDirectionDuringCreation();
            walkway.stage.drawManager.updateRectangle();
        }

        const walkwaySummaryData = {
            walkwayNumber: walkway.id,
            walkwayLength: 0,
        };

        const walkwayActionsData = {
            deleteWalkway: nullFunc,
            toggleDirection: onToggleDirection.bind(walkway),
        };

        const walkwayPropertiesData = {
            coreHeight: walkway.coreHeight,
            width: walkway.width,
            update: onWalkwayPropertyUpdate.bind(walkway),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'WALKWAY', walkwaySummaryData, walkwayActionsData, walkwayPropertiesData, true);
    }

    function safetyLineCreated(safetyLine) {

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onToggleDirection() {
            safetyLine.toggleWalkwayDirectionDuringCreation();
            safetyLine.stage.drawManager.updateRectangle();
        }

        const safetyLineSummaryData = {
            safetyLineNumber: safetyLine.id,
            safetyLineLength: 0,
        };

        const safetyLineActionsData = {
            deleteSafetyLine: nullFunc,
            toggleDirection: onToggleDirection,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SAFETYLINE', safetyLineSummaryData, safetyLineActionsData, {}, true);
    }

    function handrailCreated(handrail) {
        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onToggleDirection() {
            handrail.toggleDirectionDuringCreation();
            handrail.stage.drawManager.updateHandrailPolygon();
        }

        const handrailSummaryData = {
            handrailNumber: handrail.getId(),
            handrailLength: handrail.getLength(),
            height: handrail.getHeight(),
            columnSpacing: handrail.getColumnSpacing(),
        };

        const handrailActionsData = {
            deleteHandrail: nullFunc,
            toggleDirection: onToggleDirection,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'HANDRAIL', handrailSummaryData, handrailActionsData, {}, true);
    }

    function propertyCreated(property) {
        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        const propertySummaryData = {
            propertyNumber: property.getId(),
            propertyLength: 0,
        };

        const propertyActionsData = {
            deleteProperty: nullFunc,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'PROPERTY', propertySummaryData, propertyActionsData, {}, true);
    }

    function treeCreated(tree) {
        const component = 'tree';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onTreePropertyUpdate(updatedProperties, isValid) {
            const treeModel = this;
            treeModel.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                treeModel.changePropertiesDuringCreation(updatedProperties);
            }
        }

        const treeSummaryData = {
            treeNumber: tree.id,
            treeHeight: 0,
        };

        const treeActionsData = {
            deleteTree: nullFunc,
        };

        const treePropertiesData = {
            trunkHeight: tree.trunkHeight,
            crownHeight: tree.crownHeight,
            update: onTreePropertyUpdate.bind(tree),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TREE', treeSummaryData, treeActionsData, treePropertiesData, true);
    }

    function inverterCreated(inverter) {
        const component = 'inverter';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onInverterPropertyUpdate(updatedProperties) {
            const inverterModel = this;
            inverterModel.changePropertiesDuringCreation(updatedProperties);
        }

        const inverterSummaryData = {
            inverterNumber: inverter.id,
        };
        const inverterActionsData = {
            deleteInverter: nullFunc,
        };

        const inverterPropertiesData = {
            dcCable: {
                moduleToDcbd: {
                    cableType: 'Copper',
                    cableSize: 10,
                },
                toInverter: {
                    cableType: 'Copper',
                    cableSize: 10,
                },
                options: {
                    cableType: CABLE_TYPE,
                    cableSizeAWG: MANUAL_STRING_AWG,
                    cableSizeMM: MANUAL_ACCABLE_SIZE_MMSQ,
                },
            },
            stringRange: {
                minimum: 0,
                maximum: 0,
                // reset: onClickReset.bind()
            },
            mppts: [{
                    // linkedSubarrays: [12,4,4,4,5],
                    allSubArray: [1, 2, 3, 4],
                    maxStringCount: 4,
                    suggestedStringCount: 3,
                    stringsLength: 12,
                    stringsCompleted: [{
                        linkedPanels: [],
                        edit: () => {},
                        delete: () => {},
                    }, ],
                    addString: () => {},
                },
                {
                    // linkedSubarrays: [12,4,4,4,5],
                    allSubArray: [1, 2, 3, 4],
                    maxStringCount: 5,
                    suggestedStringCount: 2,
                    stringsLength: 12,
                    stringsCompleted: [{
                        linkedPanels: [],
                        edit: () => {},
                        delete: () => {},
                    }],
                    addString: () => {},
                },
            ],
            name: inverter.name,
            azimuth: inverter.azimuth,
            mountHeight: inverter.pillarHeight,
            mountHeightEditable: true,
            update: onInverterPropertyUpdate.bind(inverter),
        };
        //serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'INVERTER', inverterSummaryData, inverterActionsData, inverterPropertiesData, true);
    }

    function acdbCreated(acdb) {
        const component = 'acdb';
        const inverters = getInverters(acdb.stage);

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onACDBPropertyUpdate(updatedProperties) {
            const acdbModel = this;
            acdbModel.changePropertiesDuringCreation(updatedProperties);
        }

        const acdbSummaryData = {
            acdbNumber: acdb.id,
        };

        const acdbActionsData = {
            deleteACDB: nullFunc,
        };

        const acdbPropertiesData = {
            azimuth: acdb.azimuth,
            mountHeight: acdb.pillarHeight,
            mountHeightEditable: true,
            invertersList: inverters,
            update: onACDBPropertyUpdate.bind(acdb),
            drawAcCable: acdb.drawAcCable.bind(acdb),
            deleteAcCable: acdb.deleteAcCable.bind(acdb),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'ACDB', acdbSummaryData, acdbActionsData, acdbPropertiesData, true);
    }

    function dcdbCreated(dcdb) {
        const component = 'dcdb';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onDCDBPropertyUpdate(updatedProperties) {
            const dcdbModel = this;
            dcdbModel.changePropertiesDuringCreation(updatedProperties);
        }

        const dcdbSummaryData = {
            dcdbNumber: dcdb.id,
        };

        const dcdbActionsData = {
            deleteDCDB: nullFunc,
        };

        const dcdbPropertiesData = {
            azimuth: dcdb.azimuth,
            mountHeight: dcdb.pillarHeight,
            mountHeightEditable: true,
            update: onDCDBPropertyUpdate.bind(dcdb),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DCDB', dcdbSummaryData, dcdbActionsData, dcdbPropertiesData, true);
    }

    function acCableCreated(acCable) {
        const component = 'acCable';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onAcCablePropertyUpdate(updatedProperties, isValid) {
            const acCable = this;
            acCable.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                acCable.changePropertiesDuringCreation(updatedProperties);
                acCable.stage.drawManager.updateRectangle();
            }
        }

        function onToggleDirection() {
            const acCable = this;
            acCable.toggleDirectionDuringCreation();
            acCable.stage.drawManager.updateRectangle();
        }

        const acCableSummaryData = {
            acCableNumber: acCable.id,
            acCableLength: acCable.getLength(),
        };

        const acCableActionsData = {
            deleteAcCable: nullFunc,
            toggleDirection: onToggleDirection.bind(acCable),
        };

        const acCablePropertiesData = {
            update: onAcCablePropertyUpdate.bind(acCable),
            materialType: acCable.materialType,
            cores: acCable.cores,
            cableSizeMM: acCable.cableSizeMM,
            cableSizeAWG: acCable.cableSizeAWG,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'ACCABLE', acCableSummaryData, acCableActionsData, acCablePropertiesData, true);
    }

    function dcCableCreated(dcCable) {
        const component = 'dcCable';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        function onAcCablePropertyUpdate(updatedProperties, isValid) {
            const dcCable = this;
            dcCable.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                dcCable.changePropertiesDuingCreation(updatedProperties);
                dcCable.stage.drawManager.updateRectangle();
            }
        }

        function attachedMaxCableLength() {
            let maxLength = 1;
            // dc cable disabled
            // for(let i=0; i<this.inverter.mppts.length; i++) {
            //     const strings = this.inverter.mppts[i].strings;
            //     for(let j=0; j<strings.length; j++) {
            //         const cable1 = strings[j].attachedDcCable[0];
            //         const cable2 = strings[j].attachedDcCable[1];
            //         maxLength = Math.max(maxLength, cable1.getLength());
            //         maxLength = Math.max(maxLength, cable2.getLength());
            //     }
            // }
            return maxLength;
        }

        const dcCableSummaryData = {
            dcCableId: dcCable.id,
            inverterName: dcCable.inverter.name,
            mppts: dcCable.attachedString.mppt.inverter.mppts.indexOf(dcCable.attachedString.mppt) + 1,
            string: dcCable.attachedString.mppt.strings.indexOf(dcCable.attachedString) + 1,
        };

        const dcCableActionsData = {
            deleteDcCable: nullFunc,
        };

        const dcCablePropertiesData = {
            update: onAcCablePropertyUpdate.bind(dcCable),
            cableLength: dcCable.getLength(),
            polarity: dcCable.polarity,
            stringSize: dcCable.stringSize,
            moduleId: dcCable.inverter.mppts[0].linkedSubarray.moduleProperties.moduleId,
            attachedMaxCableLength: attachedMaxCableLength.bind(dcCable),
            inverterName: dcCable.inverter.name,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DCCABLE', dcCableSummaryData, dcCableActionsData, dcCablePropertiesData, true);
    }

    function conduitCreated(conduit) {
        const component = 'conduit';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await conduit.reversePolarity(conduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(conduit);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const conduit = this;
            conduit.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                conduit.changePropertiesDuringCreation(updatedProperties);
                conduit.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<conduit.attachedDcCable.length; i++) {
            //     cables.push({'id':conduit.attachedDcCable[i].id,
            //                 'inverterName': conduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': conduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':conduit.attachedDcCable[i].stringIndex,
            //                 'string':conduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            conduit.stage.selectionControls.selectGroundAndDisable();
            conduit.stage.stateManager.startContainer();
            conduit.updateAttachedCables(string);
            conduit.stage.stateManager.stopContainer();
            conduit.stage.selectionControls.enable();
        }

        const conduitSummaryData = {
            conduitLength: conduit.getLength(),
            currentFillFactor: conduit.currentFillFactor(),
            type: "Single Conduit",
        };

        const conduitActionsData = {
            deleteConduit: nullFunc,
            reversePolarity: reversePolarity.bind(conduit),
            enable: conduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: conduit.name,
            innerDiameter: conduit.innerDiameter,
            outerDiameter: conduit.outerDiameter,
            maxFillFactor: conduit.maxFillFactor,
            materialType: conduit.materialType,
            updateCables: updateCable.bind(conduit),
            update: onConduitPropertyUpdate.bind(conduit),
            attachedDcCable: getAllDcCables.bind(conduit),
            deleteCable: deleteCable.bind(conduit),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData, true);
    }

    function doubleConduitCreated(doubleConduit) {
        const component = 'doubleConduit';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await doubleConduit.reversePolarity(doubleConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleConduit);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const doubleConduit = this;
            doubleConduit.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                doubleConduit.changePropertiesDuringCreation(updatedProperties);
                doubleConduit.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleConduit.stage.selectionControls.selectGroundAndDisable();
            doubleConduit.stage.stateManager.startContainer();
            doubleConduit.updateAttachedCables(string);
            doubleConduit.stage.stateManager.stopContainer();
            doubleConduit.stage.selectionControls.enable();
        }

        const conduitSummaryData = {
            conduitLength: doubleConduit.getLength(),
            currentFillFactor: doubleConduit.currentFillFactor(),
            type: "Double Conduit",
        };

        const conduitActionsData = {
            deleteConduit: nullFunc,
            reversePolarity: reversePolarity.bind(doubleConduit),
            enable: doubleConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleConduit.name,
            innerDiameter: doubleConduit.innerDiameter,
            outerDiameter: doubleConduit.outerDiameter,
            maxFillFactor: doubleConduit.maxFillFactor,
            materialType: doubleConduit.materialType,
            updateCables: updateCable.bind(doubleConduit),
            update: onConduitPropertyUpdate.bind(doubleConduit),
            attachedDcCable: getAllDcCables.bind(doubleConduit),
            deleteCable: deleteCable.bind(doubleConduit),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData, true);
    }

    function doubleSeparateConduitCreated(doubleSeparateConduit) {
        const component = 'doubleSeparateConduit';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await doubleSeparateConduit.reversePolarity(doubleSeparateConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateConduit);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const doubleSeparateConduit = this;
            doubleSeparateConduit.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                doubleSeparateConduit.changePropertiesDuringCreation(updatedProperties);
                doubleSeparateConduit.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateConduit.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateConduit.stage.stateManager.startContainer();
            doubleSeparateConduit.updateAttachedCables(string);
            doubleSeparateConduit.stage.stateManager.stopContainer();
            doubleSeparateConduit.stage.selectionControls.enable();
        }

        const conduitSummaryData = {
            conduitLength: doubleSeparateConduit.getLength(),
            currentFillFactor: doubleSeparateConduit.currentFillFactor(),
            type: "Double Separate Conduit",
        };

        const conduitActionsData = {
            deleteConduit: nullFunc,
            reversePolarity: reversePolarity.bind(doubleSeparateConduit),
            enable: doubleSeparateConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleSeparateConduit.name,
            innerDiameter: doubleSeparateConduit.innerDiameter,
            outerDiameter: doubleSeparateConduit.outerDiameter,
            maxFillFactor: doubleSeparateConduit.maxFillFactor,
            materialType: doubleSeparateConduit.materialType,
            updateCables: updateCable.bind(doubleSeparateConduit),
            update: onConduitPropertyUpdate.bind(doubleSeparateConduit),
            attachedDcCable: getAllDcCables.bind(doubleSeparateConduit),
            deleteCable: deleteCable.bind(doubleSeparateConduit),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData, true);
    }

    function singleCableTrayCreated(singleCableTray) {
        const component = 'singleCableTray';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await singleCableTray.reversePolarity(singleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(singleCableTray);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const singleCableTray = this;
            singleCableTray.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                singleCableTray.changePropertiesDuringCreation(updatedProperties);
                singleCableTray.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<singleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':singleCableTray.attachedDcCable[i].id,
            //                 'inverterName': singleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': singleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':singleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':singleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            singleCableTray.stage.selectionControls.selectGroundAndDisable();
            singleCableTray.stage.stateManager.startContainer();
            singleCableTray.updateAttachedCables(string);
            singleCableTray.stage.stateManager.stopContainer();
            singleCableTray.stage.selectionControls.enable();
        }

        const cabletraySummaryData = {
            cableTrayLength: singleCableTray.getLength(),
            currentFillFactor: singleCableTray.currentFillFactor(),
            type: "Single Cabletray",
        };

        const cabletrayActionsData = {
            deleteCableTray: nullFunc,
            reversePolarity: reversePolarity.bind(singleCableTray),
            enable: singleCableTray.stage.addCablesMode.enabled,
        };

        const cabletrayPropertiesData = {
            name: singleCableTray.name,
            width: singleCableTray.width,
            height: singleCableTray.height,
            maxFillFactor: singleCableTray.maxFillFactor,
            materialType: singleCableTray.materialType,
            updateCables: updateCable.bind(singleCableTray),
            update: onConduitPropertyUpdate.bind(singleCableTray),
            attachedDcCable: getAllDcCables.bind(singleCableTray),
            deleteCable: deleteCable.bind(singleCableTray),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cabletraySummaryData, cabletrayActionsData, cabletrayPropertiesData, true);
    }

    function doubleCableTrayCreated(doubleCableTray) {
        const component = 'singleCableTray';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await doubleCableTray.reversePolarity(doubleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleCableTray);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const doubleCableTray = this;
            doubleCableTray.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                doubleCableTray.changePropertiesDuringCreation(updatedProperties);
                doubleCableTray.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleCableTray.stage.stateManager.startContainer();
            doubleCableTray.updateAttachedCables(string);
            doubleCableTray.stage.stateManager.stopContainer();
            doubleCableTray.stage.selectionControls.enable();
        }

        const cabletraySummaryData = {
            cableTrayLength: doubleCableTray.getLength(),
            currentFillFactor: doubleCableTray.currentFillFactor(),
            type: "Double Cabletray",
        };

        const cabletrayActionsData = {
            deleteCableTray: nullFunc,
            reversePolarity: reversePolarity.bind(doubleCableTray),
            enable: doubleCableTray.stage.addCablesMode.enabled,
        };

        const cabletrayPropertiesData = {
            name: doubleCableTray.name,
            width: doubleCableTray.width,
            height: doubleCableTray.height,
            maxFillFactor: doubleCableTray.maxFillFactor,
            materialType: doubleCableTray.materialType,
            updateCables: updateCable.bind(doubleCableTray),
            update: onConduitPropertyUpdate.bind(doubleCableTray),
            attachedDcCable: getAllDcCables.bind(doubleCableTray),
            deleteCable: deleteCable.bind(doubleCableTray),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cabletraySummaryData, cabletrayActionsData, cabletrayPropertiesData, true);
    }

    function doubleSeparateCableTrayCreated(doubleSeparateCableTray) {
        const component = 'singleCableTray';

        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        async function reversePolarity() {
            await doubleSeparateCableTray.reversePolarity(doubleSeparateCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateCableTray);
        }

        function onConduitPropertyUpdate(updatedProperties, isValid) {
            const doubleSeparateCableTray = this;
            doubleSeparateCableTray.stage.drawManager.updatePropertiesValidationError(isValid);
            if (isValid) {
                doubleSeparateCableTray.changePropertiesDuringCreation(updatedProperties);
                doubleSeparateCableTray.stage.drawManager.updateRectangle();
            }
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateCableTray.stage.stateManager.startContainer();
            doubleSeparateCableTray.updateAttachedCables(string);
            doubleSeparateCableTray.stage.stateManager.stopContainer();
            doubleSeparateCableTray.stage.selectionControls.enable();
        }

        const cabletraySummaryData = {
            cableTrayLength: doubleSeparateCableTray.getLength(),
            currentFillFactor: doubleSeparateCableTray.currentFillFactor(),
            type: "Double Separate Cabletray",
        };

        const cabletrayActionsData = {
            deleteCableTray: nullFunc,
            reversePolarity: reversePolarity.bind(doubleSeparateCableTray),
            enable: doubleSeparateCableTray.stage.addCablesMode.enabled,
        };

        const cabletrayPropertiesData = {
            name: doubleSeparateCableTray.name,
            width: doubleSeparateCableTray.width,
            height: doubleSeparateCableTray.height,
            maxFillFactor: doubleSeparateCableTray.maxFillFactor,
            materialType: doubleSeparateCableTray.materialType,
            updateCables: updateCable.bind(doubleSeparateCableTray),
            update: onConduitPropertyUpdate.bind(doubleSeparateCableTray),
            attachedDcCable: getAllDcCables.bind(doubleSeparateCableTray),
            deleteCable: deleteCable.bind(doubleSeparateCableTray),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cabletraySummaryData, cabletrayActionsData, cabletrayPropertiesData, true);
    }

    function dimensionCreated(dimension) {
        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        const component = 'dimension';

        const dimensionSummaryData = {
            dimensionNumber: dimension.getId(),
        };

        const dimensionActionsData = {
            toggleMovingDirection: nullFunc,
            remove: nullFunc,
        };

        const dimensionPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DIMENSION', dimensionSummaryData, dimensionActionsData, dimensionPropertiesData, true);
    }

    function textBoxCreated(textBox) {
        function nullFunc(obj) {
            console.log('nullFunc is Called', obj);
        }

        const component = 'textBox';

        const textBoxSummaryData = {
            textBoxNumber: textBox.getId(),
        };

        const textBoxActionsData = {
            deleteTextBox: nullFunc,
            editText: nullFunc,
        };

        const textBoxPropertiesData = {};
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TEXTBOX', textBoxSummaryData, textBoxActionsData, textBoxPropertiesData, true);
        serverBus.$emit(
            CONSTANTS.SET_TEXT_TOOL_BAR,
            textBoxPropertiesData,
        );
    }

    if (objectCreated instanceof PolygonModel || objectCreated instanceof CylinderModel ) {
        modelCreated(objectCreated);
    } else if (objectCreated instanceof SmartroofFace) {
        faceCreated(objectCreated);
    } else if (objectCreated instanceof SmartroofModel) {
        smartroofModelCreated(objectCreated);
    } else if (objectCreated instanceof Dormer) {
        dormerCreated(objectCreated);
    } else if (objectCreated instanceof Tree) {
        treeCreated(objectCreated);
    } else if (objectCreated instanceof Gazebo) {
        gazeboCreated(objectCreated);
    } else if (objectCreated instanceof EastWestRack) {
       ewRackCreated(objectCreated);
    } else if (objectCreated instanceof Subarray) {
        subarrayCreated(objectCreated);
    } else if (objectCreated instanceof InstancedTable) {
        instanceTableCreated(objectCreated);
    } else if (objectCreated instanceof Walkway) {
        if (objectCreated instanceof SafetyLine) {
            safetyLineCreated(objectCreated);
        } else {
            walkwayCreated(objectCreated);
        }
    } else if (objectCreated instanceof Handrail) {
        handrailCreated(objectCreated);
    } else if (objectCreated instanceof Property) {
        propertyCreated(objectCreated);
    } else if (objectCreated instanceof Dimension) {
        dimensionCreated(objectCreated);
    } else if (objectCreated instanceof Inverter) {
        inverterCreated(objectCreated);
    } else if (objectCreated instanceof ACDB) {
        acdbCreated(objectCreated);
    } else if (objectCreated instanceof DCDB) {
        dcdbCreated(objectCreated);
    } else if (objectCreated instanceof LassoSelectionTool) {
        // Do nothing
    } else if (objectCreated instanceof TextBox) {
        textBoxCreated(objectCreated);
    } else if (objectCreated instanceof AcCable) {
        acCableCreated(objectCreated);
    } else if (objectCreated instanceof DcCable) {
        dcCableCreated(objectCreated);
    } else if (objectCreated instanceof Conduit) {
        if (objectCreated instanceof DoubleConduit) {
            if (objectCreated instanceof DoubleCableTray) {
                doubleCableTrayCreated(objectCreated);
            } else {
                doubleConduitCreated(objectCreated);
            }
        } else if (objectCreated instanceof DoubleSeparateConduit) {
            if (objectCreated instanceof DoubleSeparateCableTray) {
                doubleSeparateCableTrayCreated(objectCreated);
            } else {
                doubleSeparateConduitCreated(objectCreated);
            }
        } else {
            if (objectCreated instanceof SingleCableTray) {
                singleCableTrayCreated(objectCreated);
            } else {
                conduitCreated(objectCreated);
            }
        }
    } else {
        console.error('ERROR: ComponentManager: Unknown object passed to onObjectCreation function.', objectCreated);
    }
}

function onObjectSelection(objectSelected) {
    function groundSelected(ground) {
        const component = 'home';

        function getAcSize() {
            const inverters = getInverters(this);
            const gazebo = [];
            getGazebos(ground,gazebo);
            let acSize = 0;
            for (let i = 0, l = inverters.length; i < l; i += 1) {
                acSize += inverters[i].getAcSize();
            }

            //microInverter ac size add /.
            const microInverters = this.ground.microInverters;
            for (let i = 0; i < microInverters.length; i++) {
                acSize += (Math.ceil(microInverters[i].panels.length / microInverters[i].stringLength)) * (microInverters[i].getAcSize());
            }
            for (let i = 0; i < gazebo.length; i++) {
                acSize += gazebo[i].getAcSize();
            }
            return acSize / 1000;
        }

        function getStringedDcSize() {
            const inverters = getInverters(this);
            let dcSize = 0;
            for (let i = 0, l = inverters.length; i < l; i += 1) {
                dcSize += inverters[i].getDcSize();
            }

            const microInverters = this.ground.microInverters;
            for (let i = 0; i < microInverters.length; i++) {
                dcSize += microInverters[i].getDcSize();
            }

            return dcSize;
        }

        function getInverterQuantity() {
            const inverters = getInverters(this);
            const microInverters = this.ground.microInverters;
            let totalMicroInverters = 0;
            for (let i = 0; i < microInverters.length; i++) {
                totalMicroInverters += Math.ceil(microInverters[i].panels.length / microInverters[i].stringLength);
            }
            const gazebo = [];
            getGazebos(ground,gazebo); 
            for (let i = 0; i < gazebo.length; i++) {
                totalMicroInverters += gazebo[i].getInverterCountGazebos();
            }

            return inverters.length + totalMicroInverters;
        }

        function getDcCablesLength() {
            const dcCables = getAllDcCables(this);
            let dcCableLength = 0;
            for (let i = 0, l = dcCables.length; i < l; i += 1) {
                dcCableLength += dcCables[i].getLength();
            }
            return dcCableLength;
        }

        function getAcCablesLength() {
            const acCables = getAllAcCables(this);
            let acCableLength = 0;
            for (let i = 0, l = acCables.length; i < l; i += 1) {
                acCableLength += acCables[i].getLength();
            }
            return acCableLength;
        }

        let isDesignSaved = false;

        try {
            isDesignSaved = ground.stage.getIsDesignSaved();
        } catch (error) {
            console.error(error);
        }

        const homeSummaryData = {
            name: ground.name,
            latitude: ground.stage.getLatitude(),
            longitude: ground.stage.getLongitude(),
            setDesignDefaultOpen: ground.stage.setDesignDefaultOpen.bind(ground.stage),
            designDefaultsOpened: ground.stage.designDefaultsOpened,
            getDcSize: ground.stage.getDcSize.bind(ground.stage),
            getDcCablesLength: getDcCablesLength.bind(ground.stage),
            getStringedDcSize: getStringedDcSize.bind(ground.stage),
            getAcSize: getAcSize.bind(ground.stage),
            getAcCablesLength: getAcCablesLength.bind(ground.stage),
            getInverterQuantity: getInverterQuantity.bind(ground.stage),
            getOptimizerQuantity: getOptimizerQuantity.bind(this, ground.stage),
            isDesignSaved,
            getModuleQuantity: getAllModuleQuantity.bind(null, ground.stage),
            getImageDimension: ground.stage.getImageDimensions.bind(ground.stage),
            getGroundSize: getDefaultGroundSize.bind(null, ground.stage),
            lidarFetchData: ground.stage.lidar.fetchData.bind(ground.stage.lidar),
            sunSimulation: ground.stage.tweenControls.TweenActions,
            sceneIn3D:ground.stage.visualManager.getIn3D.bind(ground.stage.visualManager),
            fitToTiles: ground.stage.fitToTiles.bind(ground.stage),
            lidarMode: ground.stage.lidar.toggleLidarMode.bind(ground.stage.lidar),
            lidarModeEnabled: ground.stage.lidar.lidarModeEnabled,
            lidarDataFetched: ground.stage.lidar.lidarDataFetched && ground.stage.lidar.lidarMeshCreated,
            mapSource: ground.stage.groundImage.source,
            mapZoom: ground.stage.groundImage.zoom,
            autoFitModel: ground.stage.lidar.autoFitAllModels.bind(ground.stage.lidar),
            toggleRStats: PRODUCTION_ENV ? () => {} : ground.stage.toggleRstats.bind(ground.stage),
            isProductionEnv: PRODUCTION_ENV,
            roofMap: roofMapExporter(
                ground.stage, { approximateCylinder: true }, { approximateTree: true },
            ),
            panelMap: panelMapExporter(ground.stage),
            generationData: {
                intervalId: null,
                lastUpdated: 0,
                annualGeneration: 0,
                specificGeneration: 0,
                performanceRatio: 0,
                lossData: {
                    energy: {},
                    losses: {},
                },
            },
        };
        // NOTE: ground actions and properties should be mounted for
        // deactivate life cycle hook of the mounted component to be called
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'HOME', homeSummaryData);
    }

    function customImageSelected(customImage) {
        const customImageManager = customImage.stage.customImageManager;
        function placeholderFunc(obj) {
            console.log('Function needs to be implemented', obj);
        }
        const customImagePropertiesData = {
            rotation: customImage.getRotation(),
            scale: customImage.getScale(),
            updateRotation: customImage.updateRotation.bind(customImage),
            updateScale: customImage.updateScale.bind(customImage),
            opacity: customImage.imageOpacity,
            updateOpacity: customImage.updateOpacity.bind(customImage),
            completeEditing: customImage.stage.customImageManager.onComplete.bind(customImage.stage.customImageManager,false),
            deleteImage: customImage.stage.customImageManager.deleteImage.bind(customImage.stage.customImageManager)
        };
    
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CUSTOM IMAGE', {}, {}, customImagePropertiesData);
    }

    function dimensionSelected(dimension) {
        function toggleMovingDirection() {
            const dimension = this;
            dimension.toggleMovingDirection();
            dimension.focus();
        }

        function onClickDelete() {
            const dimension = this;
            dimension.stage.selectionControls.selectGroundAndDisable();
            dimension.stage.stateManager.startContainer();
            dimension.remove();
            dimension.stage.stateManager.stopContainer();
            dimension.stage.selectionControls.enable();
        }

        const component = 'dimension';

        const dimensionSummaryData = {
            dimensionNumber: dimension.getId(),
        };

        const dimensionActionsData = {
            toggleMovingDirection: toggleMovingDirection.bind(dimension),
            remove: onClickDelete.bind(dimension),
        };

        const dimensionPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DIMENSION', dimensionSummaryData, dimensionActionsData, dimensionPropertiesData);
    }

    function threejsTextSelected(threejsText) {
        function onClickDelete() {
            const threejsText = this;
            threejsText.stage.selectionControls.selectGroundAndDisable();
            threejsText.stage.stateManager.startContainer();
            threejsText.remove();
            threejsText.stage.stateManager.stopContainer();
            threejsText.stage.selectionControls.enable();
        }

        const component = 'threejsText';

        const threejsTextSummaryData = {
            text: threejsText.text,
        };

        const threejsTextActionsData = {
            remove: onClickDelete.bind(threejsText),
        };

        const threejsTextPropertiesData = {};

        // serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'THREEJS_TEXT', threejsTextSummaryData, threejsTextActionsData, threejsTextPropertiesData);

    }

    function modelSelected(model) {
        function placeholderFunc(obj) {
            console.log('Function needs to be implemented', obj);
        }

        function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        function onClickUpdate(updatedProperties) {
            const model = this;
            model.stage.stateManager.startContainer();
            model
                .updateObject(updatedProperties)
                .then(() => {
                    onObjectSelection(model);
                })
                .catch((error) => {
                    console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                    onObjectSelection(model);
                })
                .finally(() => {
                    model.stage.stateManager.stopContainer();
                });
        }

        function onClickFillFace() {
            const model = this;

            const notificationObject = model.stage.eventManager.setUpdatePanelPlacementLoading();

            model.stage.stateManager.startContainer();
            model.onFillFace().then(
                (subarray) => {
                    model.stage.selectionControls.setSelectedObject(subarray);
                    model.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    model.stage.stateManager.stopContainer();
                },
                () => {
                    model.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Fill Face',
                        message: 'Error creating subarray through fill face',
                    });
                    model.stage.stateManager.stopContainer();
                },
            );
        }

        // function onClickAddFold() {
        //     model.stage.stateManager.startContainer();

        //     model.stage.stateManager.stopContainer();
        // }

        function onClickCustomFillFace() {
            notificationsAssistant.longInfo({
                title: 'Edit Properties and Fill Face',
                message: 'Edit Properties and click Fill Face button in Properties Pane',
            });
            model.stage.stateManager.startContainer();
            model.onFillFace({ isCustom: true })
            .then(
                (subarray) => {
                    onObjectCreation(subarray, { customFillFaceMode: true });
                    model.deSelect();
                },
                () => {
                    notificationsAssistant.error({
                        title: 'Fill Face',
                        message: 'Error creating subarray through fill face',
                    });
                },
            );
        }

        function onClickAddTableToNewSubarray() {
            let subarrayProperties = null;
            let tableType = null;
            let settings = model.stage.getDesignSettings();
            if (settings.drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) tableType = ADD_EW_TABLE;

            if (model.getTilt() > 0) {
                const subarrayDefaults =
                    model.stage.getDesignSettings().drawing_defaults.subarray.flushMount;
                subarrayProperties = {
                    mountType: SUBARRAY_RACK_STYLE_FLUSH,
                    tilt: model.getTilt(),
                    azimuth: model.getTilt() === 0 ? 180 : model.getAzimuth(),
                    structureType: subarrayDefaults.structureType,
                    panelOrientation: subarrayDefaults.panelOrientation,
                    mountHeight: subarrayDefaults.mountHeight,
                    tableSizeUp: subarrayDefaults.tableSizeUp,
                    tableSizeWide: subarrayDefaults.tableSizeWide,
                    tableSpacing: subarrayDefaults.tableSpacing,
                    moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                    moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
                    rowSpacing: subarrayDefaults.rowSpacing,
                    moduleProperties: subarrayDefaults.moduleProperties,
                    rowSpacingMode: subarrayDefaults.rowSpacingMode,
                };
            }
            model.stage.addTableMode.initAddTableMode(subarrayProperties, model, tableType);
        }

        function onSetbackEdit(setbackType) {
            model.stage.stateManager.startContainer();
            model.stage.setbackEditMode.initialize(model, setbackType);
        }

        const component = 'model';

        const modelSummaryData = {
            modelNumber: model.id,
            modelArea: model.computeArea(),
            percentageArea: model.computePercentageAreaCoveredByPanels(),
            isObstruction: model.isObstruction,
        };

        const modelActionsData = {
            deleteModel: deleteObject.bind(model),
            duplicate: placeholderFunc.bind(null, model),
            editDimensions: placeholderFunc.bind(null, model),
            fillFace: onClickFillFace.bind(model),
            customFillFace: onClickCustomFillFace.bind(model),
            addTable: onClickAddTableToNewSubarray.bind(model),
            fillFacePossible: !model.ignored,
            isObstruction: model.isObstruction,
        };

        // These needs to be referenced otherwise cancel in vue will reset to previous call data
        let modelSetbackInside;
        let modelSetbackOutside;

        if (model instanceof SmartroofFace) {
            if (Array.isArray(model.setbackInside)) {
                const allEqual = model.setbackInside
                    .every(arr => arr
                        .every(v => v === model.setbackInside[0][0]));
                modelSetbackInside = allEqual ? model.setbackInside[0][0] : 'custom';
            } else {
                modelSetbackInside = model.setbackInside;
            }
        }
        else {
            if (Array.isArray(model.setbackInside)) {
                const allEqual = model.setbackInside.every(v => v === model.setbackInside[0]);
                modelSetbackInside = allEqual ? model.setbackInside[0] : 'custom';
            } else {
                modelSetbackInside = model.setbackInside;
            }
        }

        if (Array.isArray(model.setbackOutside)) {
            const allEqual = model.setbackOutside.every(v => v === model.setbackOutside[0]);
            modelSetbackOutside = allEqual ? model.setbackOutside[0] : 'custom';
        } else {
            modelSetbackOutside = model.setbackOutside;
        }

        const modelPropertiesData = {
            coreHeight: model.coreHeight,
            parapetHeight: model.parapetHeight,
            parapetThickness: model.parapetThickness,
            tilt: model.tilt,
            structureType: model.structureType,
            topHeight: model.topHeight,
            lockedParameter: model.lockedParameter,
            computeTiltAndHeights: model.computeTiltAndHeights.bind(model),
            azimuth: model.azimuth,
            setbackInside: modelSetbackInside,
            setbackOutside: modelSetbackOutside,
            setbackEditMode: onSetbackEdit.bind(model),
            ignored: model.ignored,
            placable: model.placable,
            rotationAllowed: (model.isRotationAllowed === undefined || model.isRotationAllowed === null) ? true : model.isRotationAllowed,
            flushType: (model.flushType === undefined || model.flushType === null) ? false : model.flushType,
            obstruction: model.obstruction,
            update: onClickUpdate.bind(model),
            getPossibleAzimuths: model.getPossibleAzimuths.bind(model),
            isObstruction: model.isObstruction,
            isCylinder: (model instanceof CylinderModel) ? true : false,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'MODEL', modelSummaryData, modelActionsData, modelPropertiesData);
    }

    function smartroofModelSelected(model) {
        function placeholderFunc(obj) {
            console.log('Function needs to be implemented', obj);
        }

        function onHeightChange() {
            model.updateHeight(model.coreHeight);
        }

        let children = model.getChildren();
        let modelTilt = model.tilt;
        for (let i = 0; i < children.length; i++) {
            if (!children[i].isDeleted && !children[i].fold && modelTilt != children[i].tilt) {
                modelTilt = 'custom';
                break;
            }
        }

        function addTurretFace() {
            this.stage.stateManager.startContainer();
            model.addTurretFace();
            this.stage.stateManager.stopContainer();
        }

        function removeTurretFace() {
            this.stage.stateManager.startContainer();
            model.removeTurretFace();
            this.stage.stateManager.stopContainer();
        }

        function onClickGabledDormer(stage) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);

            const model = stage.newGabledDormer.call(stage);

            topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
            // sapPaneAssistant.onObjectCreation(model);
        }


        function onClickHippedDormer(stage) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);

            const model = stage.newHippedDormer.call(stage);

            topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
            // sapPaneAssistant.onObjectCreation(model);
        }

        function onClickFlatDormer(stage) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);

            const model = stage.newFlatDormer.call(stage);

            topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
            // sapPaneAssistant.onObjectCreation(model);
        }

        function onClickTurretDormer(stage) {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_CANCEL_STATE);

            const model = stage.newTurretDormer.call(stage);

            topBarAssistant.setCancelAction(stage.placeManager.onCancel.bind(stage.placeManager));
            // sapPaneAssistant.onObjectCreation(model);
        }

        function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }
        function onTiltChange() {
            this.changeTilt(this.tilt);
        }

        function onClickUpdate(updatedProperties) {
            const model = this;
            model.stage.stateManager.startContainer();
            model
                .updateObject(updatedProperties, true, true)
                .then(() => {
                    onObjectSelection(model);
                })
                .catch((error) => {
                    console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                    onObjectSelection(model);
                })
                .finally(() => {
                    model.stage.stateManager.stopContainer();
                });
        }

        const modelSummaryData = {
            modelNumber: model.id,
            modelArea: model.computeArea(),
            percentageArea: model.computePercentageAreaCoveredByPanels(),
        };

        const modelActionsData = {
            deleteModel: deleteObject.bind(model),
            duplicate: placeholderFunc.bind(null, model),
            editDimensions: placeholderFunc.bind(null, model),
            isTemplate: model.isTemplate,
            isTurret: model.isTurret,
            newHippedDormer: onClickHippedDormer.bind(null, model.stage),
            newGabledDormer: onClickGabledDormer.bind(null, model.stage),
            newFlatDormer: onClickFlatDormer.bind(null, model.stage),
            newTurretDormer: onClickTurretDormer.bind(null, model.stage),
            fitToLidar: model.stage.lidar.onClickFitToLidar.bind(model.stage.lidar, model),
            lidarModeEnabled: model.stage.lidar.lidarModeEnabled,
            is3d: model.is3d,
        };

        const modelPropertiesData = {
            coreHeight: model.coreHeight,
            tilt: (modelTilt !== 'custom' && modelTilt)? parseFloat(modelTilt).toFixed(2) : modelTilt,
            minTilt: model.minTilt,
            isTemplate: model.isTemplate,
            isTurret: model.isTurret,
            allowRemoveTurretFace: model.allowRemoveTurretFace,
            ignored: model.ignored,
            snapHeight: model.snapHeight,
            placable: model.placable,
            obstruction: model.obstruction,
            update: onClickUpdate.bind(model),
            getPossibleAzimuths: model.getPossibleAzimuths.bind(model),
            updateHeight: model.updateHeight.bind(model),
            is3d: model.is3d,
            maxTilt: model.maxTilt,
            addTurretFace: addTurretFace.bind(model),
            removeTurretFace: removeTurretFace.bind(model),
            isDrawFace: model.isDrawFace,
            onHeightChange: onHeightChange.bind(model),
            tiltChange: model.changeTilt.bind(model),
            onTiltChange: onTiltChange.bind(model),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SMARTROOFMODEL', modelSummaryData, modelActionsData, modelPropertiesData);
    }

    function smartroofFaceSelected(face) {
        let faceSetbackInside;
        let multiFoldAllow = true;
        if (Array.isArray(face.setbackInside)) {
            const allEqual = face.setbackInside
                .every(arr => arr
                    .every(v => v === face.setbackInside[0][0]));
            faceSetbackInside = allEqual ? face.setbackInside[0][0] : 'custom';
        } else {
            faceSetbackInside = face.setbackInside;
        }

        // if (face.getParent().folds) {
        //     face.getParent().folds.forEach(foldEl => {
        //         if(foldEl.foldType === FLAT_FOLD) {
        //             multiFoldAllow = false;
        //         }
        //     });
        // }

        function onClickAddTableToNewSubarray() {
            let subarrayProperties = null;
            if (face.getTilt() > 0) {
                const subarrayDefaults =
                    face.stage.getDesignSettings().drawing_defaults.subarray.flushMount;
                subarrayProperties = {
                    mountType: SUBARRAY_RACK_STYLE_FLUSH,
                    tilt: face.getTilt(),
                    azimuth: face.getTilt() === 0 ? 180 : face.getAzimuth(),
                    structureType: subarrayDefaults.structureType,
                    panelOrientation: subarrayDefaults.panelOrientation,
                    mountHeight: subarrayDefaults.mountHeight,
                    tableSizeUp: subarrayDefaults.tableSizeUp,
                    tableSizeWide: subarrayDefaults.tableSizeWide,
                    tableSpacing: subarrayDefaults.tableSpacing,
                    moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                    moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
                    rowSpacing: subarrayDefaults.rowSpacing,
                    moduleProperties: subarrayDefaults.moduleProperties,
                    rowSpacingMode: subarrayDefaults.rowSpacingMode,
                };
            }
            face.stage.addTableMode.initAddTableMode(subarrayProperties, face);
        }

        function onClickAdjustFace() {
            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_DRAWING_STATE);
            this.initDrawingMode();
            topBarAssistant.setCompleteAction(this.stage.drawManager.onComplete.bind(this.stage.drawManager), this);
            topBarAssistant.setCancelAction(this.stage.drawManager.onCancel.bind(this.stage.drawManager));
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        function onClickAddFold() {
            this.stage.stateManager.startContainer();
            this.getParent().addFold(this, PITCHED_FOLD);
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.setSelectedObject(this.getParent());
        }

        function onClickAddFlatFold() {
            this.stage.stateManager.startContainer();
            this.getParent().addFold(this, FLAT_FOLD);
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.setSelectedObject(this.getParent());
        }

        function onClickAddVerticalFold() {
            this.stage.stateManager.startContainer();
            this.getParent().addFold(this, VERTICAL_FOLD);
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.setSelectedObject(this.getParent());
        }

        function onClickMergeFace() {
            face.stage.stateManager.startContainer();
            this.stage.faceSelectMode.initialize(this);
            notificationsAssistant.info({
                title: 'Secondary Face Select',
                message: 'Please select the secondary face.',
            });

        }

        function onClickmakePrimaryEdge() {
            this.stage.stateManager.startContainer();
            this.getParent().makePrimaryEdge(this.outerEdge);
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.setSelectedObject(this.getParent());
        }

        function onClickFillFace() {
            const model = this;
            const notificationObject = model.stage.eventManager.setUpdatePanelPlacementLoading();

            model.stage.stateManager.startContainer();
            model.onFillFace().then(
                (subarray) => {
                    model.stage.selectionControls.setSelectedObject(subarray);
                    model.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    model.stage.stateManager.stopContainer();
                },
                () => {
                    model.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Fill Face',
                        message: 'Error creating subarray through fill face',
                    });
                    model.stage.stateManager.stopContainer();
                },
            );
        }

        function onClickUpdate(updatedProperties) {
            const model = this;
            model.stage.stateManager.startContainer();
            model
                .updateObject(updatedProperties)
                .then(() => {
                    smartroofFaceSelected(model);
                })
                .catch((error) => {
                    console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                    smartroofFaceSelected(model);
                })
                .finally(() => {
                    model.stage.stateManager.stopContainer();
                });
        }

        function onSetbackEdit(setbackType) {
            face.stage.stateManager.startContainer();
            face.stage.smartRoofSetbackEditMode.initialize(face, setbackType);
        }

        function automateSetBacks() {
            face.stage.stateManager.startContainer();
            face.stage.smartRoofSetbackEditMode.automateAllSetbacks();
        }

        function onRafterEdit(rafterAlignmentEdit) {
            face.stage.stateManager.startContainer();
            face.stage.rafterEditMode.initialize(face, rafterAlignmentEdit);
        }

        function onAttachmentEdit(attachmentEdit) {
            face.stage.stateManager.startContainer();
            face.stage.attachmentEditMode.initialize(face, attachmentEdit);
        }

        function onTiltChange() {
            this.getParent().updateFacesWithNewAngles();
        }

        function onHeightChange() {
            this.getParent().placeObject();
        }

        const smartroofFaceSummaryData = {
            faceAzimuth: face.azimuth,
        };
        const smartroofFaceActionsData = {
            isParentDormer: face.isParentDormer(),
            isParentFlatDormer: face.isParentFlatDormer(),
            isParentTurretDormer: face.isParentTurretDormer(),
            isDrawFace: (face.getParent() instanceof DrawFace) ? true : false,
            isDeleted: face.isDeleted,
            deleteFace: face.deleteFace.bind(face),
            fillFace: onClickFillFace.bind(face),
            editFace: onClickAdjustFace.bind(face),
            addTable: onClickAddTableToNewSubarray.bind(face),
            addfold: onClickAddFold.bind(face),
            addFlatFold: onClickAddFlatFold.bind(face),
            mergeFace: onClickMergeFace.bind(face),
            addVerticalFold: onClickAddVerticalFold.bind(face),
            makePrimaryEdge: onClickmakePrimaryEdge.bind(face),
            fillFacePossible: !face.ignored,
            multiFoldAllow: multiFoldAllow,
        };
        const smartroofFacePropertiesData = {
            isParentDormer: face.isParentDormer(),
            isParentFlatDormer: face.isParentFlatDormer(),
            isParentTurretDormer: face.isParentTurretDormer(),
            isDrawFace: (face.getParent() instanceof DrawFace) ? true : false,
            isDeleted: face.isDeleted,
            tilt: (face.tilt !== 'custom') ? parseFloat(face.tilt).toFixed(2) : face.tilt,
            minTilt: face.getMinimumTilt(),
            height: face.getHeight(),
            setbackInside: faceSetbackInside,
            rafterEnabled: face.rafterEnabled,
            rafterOrientation: face.rafterOrientation,
            rafterSpacing: face.rafterSpacing,
            attachmentType: face.attachmentType,
            attachmentSpacingMultiplier: face.attachmentSpacingMultiplier,
            placable: face.placable,
            setbackEditMode: onSetbackEdit.bind(face),
            automateSetBacks: automateSetBacks.bind(face),
            rafterEditMode: onRafterEdit.bind(face),
            attachmentEditMode: onAttachmentEdit.bind(face),
            update: onClickUpdate.bind(face),
            tiltChange: face.tiltChange.bind(face),
            heightChange: face.heightChange.bind(face),
            onTiltChange: onTiltChange.bind(face),
            onHeightChange: onHeightChange.bind(face),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SMARTROOFFACE', smartroofFaceSummaryData, smartroofFaceActionsData, smartroofFacePropertiesData);
    }

    function outerEdgeSelected(outerEdge) {
        smartroofFaceSelected(outerEdge.smartRoofFace);
    }

    function dormerSelected(dormer) {

        let dormerSetbackOutside;

        if (Array.isArray(dormer.setbackOutside)) {
            const allEqual = dormer.setbackOutside.every(v => v === dormer.setbackOutside[0]);
            dormerSetbackOutside = allEqual ? dormer.setbackOutside[0] : 'custom';
        } else {
            dormerSetbackOutside = dormer.setbackOutside;
        }

        let minTilt = 0;
        let maxTilt = 89.9;

        if (dormer.type === "Flat Dormer" && dormer.getParent()) {
            if (dormer.getParent().getParent() instanceof FlatDormer) {
                minTilt = dormer.getParent().getParent().getTilt();
            } else {
                minTilt = (dormer.getParent().getTilt() - 0.1) * (-1);
            }
        }
        function updateHeight(){
            dormer.stage.stateManager.startContainer();
            dormer.updateHeight();
            dormer.stage.stateManager.stopContainer();

        }

        function addVerticalFold(){
            dormer.stage.stateManager.startContainer();

            const face = dormer.getFoldface();

            let centroid = [face[3].x,face[3].y,face[3].z];
        
            for(let i =4;i<6;i++){
                centroid[0] += face[i].x;
                centroid[1] += face[i].y;
                centroid[2] += face[i].z;
            }

            centroid[0]/=3;
            centroid[1]/=3;
            centroid[2]/=3;

            dormer.setFoldface(new OutlinePoints(centroid[0],centroid[1],centroid[2],this,this.stage));
            // dormer.foldCalculations();
            dormer.updateGeometry(true,true,true);

            dormer.stage.stateManager.stopContainer();


        }
        function deleteVerticalFold(){
            dormer.stage.stateManager.startContainer();
            dormer.deleteVerticalFold();
            dormer.stage.stateManager.stopContainer();


        }
        function deleteObject() {
            dormer.stage.selectionControls.selectGroundAndDisable();
            dormer.stage.stateManager.startContainer();
            dormer.removeObject();
            dormer.stage.stateManager.stopContainer();
            dormer.stage.selectionControls.enable();
        }

        function onClickUpdate(updatedProperties) {
            const model = this;
            model.stage.stateManager.startContainer();
            model
                .updateObject(updatedProperties)
                .then(() => {
                    dormerSelected(dormer);
                })
                .catch((error) => {
                    console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                    dormerSelected(dormer);
                })
                .finally(() => {
                    model.stage.stateManager.stopContainer();
                });
        }

        function onSetbackEdit(setbackType) {
            dormer.stage.stateManager.startContainer();
            dormer.stage.setbackEditMode.initialize(dormer, setbackType);
        }

        const dormerSummaryData = {
            modelNumber: dormer.id,
            modelArea: dormer.computeArea(),
            percentageArea: dormer.computePercentageAreaCoveredByPanels(),
            type: dormer.type,
        }
        const dormerActionsData = {
            deleteDormer: deleteObject.bind(dormer),
            addVerticalFoldDormer: addVerticalFold.bind(dormer),
            deleteVerticalFoldDormer: deleteVerticalFold.bind(dormer),
            isHippedDormer: (dormer instanceof HippedDormer) ? true : false,
            hasFold: (dormer instanceof HippedDormer && dormer.verticalFold) ? true : false,

        }
        const dormerPropertiesData = {
            tilt: dormer.getPitch().toFixed(2),
            minTilt: minTilt,
            maxTilt: maxTilt,
            setbackOutside: dormerSetbackOutside,
            updateHeightDormer: updateHeight.bind(dormer),
            setbackEditMode: onSetbackEdit.bind(dormer),
            update: onClickUpdate.bind(dormer),
            Height: dormer.getCoreHeight(),
        }
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DORMER', dormerSummaryData, dormerActionsData, dormerPropertiesData);
    }

    function subarraySelected(subarray, fromEWRack = null) {
        let ewRack = null;
        let fromEWRackFlag = false;
        let updateRequired = false;
        if (fromEWRack) {
            if (subarray.mountType === SUBARRAY_RACK_STYLE_FIXED) {
                subarray.changePropertiesDuringCreation(fromEWRack.getFixedMountProperties())
            }
            else {
                subarray.changePropertiesDuringCreation(fromEWRack.getFlushMountProperties())
            }
            subarray.changeParent(fromEWRack.getParent());
            subarray.associatedModel = subarray.parent;
            if (fromEWRack.outlinePoints.length !== 0) {
                subarray.outlinePoints = fromEWRack.outlinePoints.map((ele) => new OutlinePoints(
                    ele.getPosition().x,
                    ele.getPosition().y,
                    0,
                    subarray,
                    subarray.stage,
                ))
            }
            else {
                // if outline points are nto retained after changing mount type
                // then create the points from parent
                subarray.createBoundaryFromParent();
            }
            subarray.updateGeometry();
            updateRequired = true;
            fromEWRackFlag = true;
        }
        function deleteObject() {
            this.stage.stateManager.startContainer();

            // first remove object and then deselect ground
            // so that subArray changes are reflected on ground selection
            this.removeObject();
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.selectionControls.enable();

            this.stage.stateManager.stopContainer();
        }

        function onClickUpdate(updatedProperties) {
            let subarray = this;
            if (ewRack) {
                ewRack.changePropertiesDuringCreation(ewRack.getEastWestRackingProperties());
                subarray = ewRack;
            }

            const notificationObject = subarray.stage.eventManager.setUpdatePanelPlacementLoading();

            subarray.stage.stateManager.startContainer();
            // TODO: Promise
            Promise.resolve(subarray.updateObject(updatedProperties, fromEWRackFlag)).then((success) => {
                if (success) {
                    onObjectSelection(subarray);
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    subarray.stage.stateManager.stopContainer();
                } else {
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Update Properties',
                        message: 'Error updating subarray properties. Subarray deleted.',
                    });
                    subarray.stage.stateManager.stopContainer();
                }
            });
        }

        async function onClickOptimise() {
            function onSlideSlider(subarray, sortedTables, nTables) {
                return subarray.optimiseOnSubarraySize(sortedTables, nTables);
            }

            function onLeaveSlider() {
                function getUpdatedSolarAccess() {
                    const subarray = this;
                    return subarray.getAverageSolarAccess();
                }

                const subarraySummaryData = {
                    subarrayNumber: subarray.id,
                    numPanels: subarray.getNumberOfPanels(),
                    subarraySize: subarray.getDcSize.bind(subarray),
                    isEastWest: subarray.eastWestRackingEnabled,
                    panelType: subarray.getModuleMake(),
                    getSolarAccess: getUpdatedSolarAccess.bind(subarray),
                };
                serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SUBARRAY', subarraySummaryData);
            }

            function onUpdateSolarAccessThreshold(solarAccessThreshold) {
                const subarray = this;
                let nTables;
                if (subarray.getMaxSolarAccess() < solarAccessThreshold) {
                    nTables = 1;
                } else {
                    subarray.optimiseOnSolarAccess(solarAccessThreshold);
                    nTables = subarray.getNumberOfTables();
                }
                return nTables;
            }

            function onOptimiseClose() {
                subarray.onCloseOptimise();
                // stop container
                subarray.stage.stateManager.stopContainer();
            }

            let subarray = this;

            try {
                const sortedTables = await subarray.initOptimiseOnSubarraySize();

                // start container
                subarray.stage.stateManager.startContainer();

                if (store.state.studio.sideBar.solarAccess.visible) {
                    subarray.switchVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS, true);
                }

                return {
                    onSlideSlider: _.bind(onSlideSlider, null, subarray, sortedTables),
                    onLeaveSlider: onLeaveSlider.bind(this),
                    maxTables: sortedTables.length,
                    nTables: subarray.getNumberOfTables(),
                    tableSize: subarray.getTableSize(),
                    moduleCountPerTable: subarray.tableSizeUp * subarray.tableSizeWide,
                    onOptimiseClose: onOptimiseClose.bind(this),
                    onUpdateSolarAccessThreshold: onUpdateSolarAccessThreshold.bind(subarray),
                };
            } catch (error) {
                console.error('ERROR: sapPaneAssistant: onClickOptimise failed', error);
                return Promise.reject(error);
            }
        }

        function onClickReset() {
            const subarray = this;

            const notificationObject = subarray.stage.eventManager.setUpdatePanelPlacementLoading();

            subarray.stage.stateManager.startContainer();
            subarray.updatePanelPlacement().then(
                () => {
                    onObjectSelection(subarray);
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    subarray.stage.stateManager.stopContainer();
                },
                () => {
                    subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Reset Subarray',
                        message: 'Error resetting subarray.',
                    });
                    subarray.stage.stateManager.stopContainer();
                },
            );
        }

        function getUpdatedSolarAccess() {
            const subarray = this;
            return subarray.getAverageSolarAccess();
        }

        function onClickAddTableToNewSubarray(tableType) {
            subarray.stage.addTableMode.initAddTableMode(subarray.getState(), subarray.getParent(), tableType);
        }
        function eastWestMountTypeSelected() {
            // jugaad to change the default values of eastwestsubarray
            // we need to create ewrack instance when user swith to eastwest rack
            ewRack = new EastWestRack(subarray.stage);

            ewRackSelected(ewRack, subarray);
        }

        const component = 'subarray';

        const subarraySummaryData = {
            subarrayNumber: subarray.id,
            numPanels: subarray.getNumberOfPanels(),
            subarraySize: subarray.getDcSize.bind(subarray),
            isEastWest: subarray.eastWestRackingEnabled,
            panelType: subarray.getModuleMake(),
            getSolarAccess: getUpdatedSolarAccess.bind(subarray),
            structureErrors: subarray.getStructureErrors(),
            structureErrorAutoFixFunction: autoFixSubarrayForStructureTemplate.bind(null, subarray, subarray.stage),
        };

        const subarrayActionsData = {
            deleteSubarray: deleteObject.bind(subarray),
            addTables: onClickAddTableToNewSubarray.bind(subarray),
            onClickOptimise: onClickOptimise.bind(subarray),
            resetSubarray: onClickReset.bind(subarray),
            addTableFlow: subarray.addTableFlow,
            eastWestRackingEnabled: subarray.eastWestRackingEnabled,
        };

        const subarrayPropertiesData = {
            moduleId: subarray.moduleProperties.moduleId,
            name: subarray.name,
            tilt: subarray.tilt,
            azimuth: subarray.azimuth,
            structureType: subarray.structureType,
            rowSpacing: subarray.rowSpacing,
            rowSpacingMode: subarray.rowSpacingMode,
            tableSpacing: subarray.tableSpacing,
            intraRowSpacing: subarray.intraRowSpacing,
            interRowSpacing: subarray.interRowSpacing,
            tableSizeUp: subarray.tableSizeUp,
            tableSizeWide: subarray.tableSizeWide,
            panelOrientation: subarray.panelOrientation,
            mountHeight: subarray.mountHeight,
            moduleSpacingUp: subarray.moduleSpacingUp,
            moduleSpacingWide: subarray.moduleSpacingWide,
            update: onClickUpdate.bind(subarray),
            updateRequired: updateRequired,
            getOptimisedRowSpacing: subarray.getOptimisedRowSpacing.bind(subarray),
            mountType: subarray.mountType,
            getFlushMountProperties: subarray.getFlushMountProperties.bind(subarray),
            getFixedMountProperties: subarray.getFixedMountProperties.bind(subarray),
            getEastWestRackingProperties: subarray.getEastWestRackingProperties.bind(subarray),
            getPossibleAzimuths: subarray.getPossibleAzimuths.bind(subarray),
            structureErrors: subarray.getStructureErrors(),
            structureErrorAutoFixFunction: autoFixSubarrayForStructureTemplate.bind(null, subarray, subarray.stage),
            updateInverters: subarray.updateInverters.bind(subarray),
            inverters: subarray.inverters,
            updateInverterAddition: subarray.updateInverterAddition.bind(subarray),
            updateInverterDeletion: subarray.updateInverterDeletion.bind(subarray),
            ewRackCreated: eastWestMountTypeSelected.bind(subarray),
            getDcSize: subarray.stage.getDcSize.bind(subarray.stage),
            getAcSize: subarray.stage.getAcSize.bind(subarray.stage),
            bifacialEnabled: subarray.bifacialEnabled,
            eastWestRackingEnabled: subarray.eastWestRackingEnabled,
            getParent: subarray.getParent.bind(subarray),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SUBARRAY', subarraySummaryData, subarrayActionsData, subarrayPropertiesData);
    }

    function ewRackSelected(ewRack, fromSubarray = null) {
        let fromSubarrayFlag = false;
        let updateEnabled = false;
        if (fromSubarray) {
            ewRack.changePropertiesDuringCreation(fromSubarray.getEastWestRackingProperties())

            ewRack.mountType = SUBARRAY_RACK_STYLE_EWRACKING;
            ewRack.changeParent(fromSubarray.getParent());
            ewRack.associatedModel = ewRack.parent;
            // should update geometry after assigning outline points
            // when updating from fromSubarray to eastwest we should retain the outlinepoints
            const outlinePoints = [...fromSubarray.outlinePoints];
            if (outlinePoints.length !== 0) {
                ewRack.outlinePoints = outlinePoints.map(ele => new OutlinePoints(
                    ele.getPosition().x,
                    ele.getPosition().y,
                    0,
                    ewRack,
                    ewRack.stage,
                ));
            }
            else {
                // if outline points are nto retained after changing mount type
                // then create the points from parent
                ewRack.createBoundaryFromParent();
            }
            ewRack.updateGeometry();
            updateEnabled = true;
            fromSubarrayFlag = true;
        }
        let subarray = null;
        function deleteObject() {
            this.stage.stateManager.startContainer();

            // first remove object and then deselect ground
            // so that subArray changes are reflected on ground selection
            this.removeObject();
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.selectionControls.enable();

            this.stage.stateManager.stopContainer();
        }

        function onClickUpdate(updatedProperties) {
            let ewRack = null;
            if (subarray) {
                // this.removeObject();
                subarray.changePropertiesDuringCreation(subarray.getEastWestRackingProperties());
                if (subarray.outlinePoints.length === 0) {
                    subarray.createBoundaryFromParent();
                }
                ewRack = subarray;
            }
            else {
                ewRack = this;
            }

            const notificationObject = ewRack.stage.eventManager.setUpdatePanelPlacementLoading();

            ewRack.stage.stateManager.startContainer();
            // TODO: Promise
            Promise.resolve(ewRack.updateObject(updatedProperties, fromSubarrayFlag)).then((success) => {
                if (success) {
                    onObjectSelection(ewRack);
                    ewRack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    ewRack.stage.stateManager.stopContainer();
                } else {
                    ewRack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Update Properties',
                        message: 'Error updating ewRack properties. Subarray deleted.',
                    });
                    ewRack.stage.stateManager.stopContainer();
                }
            });
        }

        async function onClickOptimise() {
            function onSlideSlider(ewRack, sortedTables, nTables) {
                return ewRack.optimiseOnSubarraySize(sortedTables, nTables);
            }

            function onLeaveSlider() {
                function getUpdatedSolarAccess() {
                    const ewRack = this;
                    return ewRack.getAverageSolarAccess();
                }

                const eastWestRackingSummaryData = {
                    subarrayNumber: ewRack.id,
                    numPanels: ewRack.getNumberOfPanels(),
                    subarraySize: ewRack.getDcSize.bind(ewRack),
                    isEastWest: ewRack.eastWestRackingEnabled,
                    panelType: ewRack.getModuleMake(),
                    getSolarAccess: getUpdatedSolarAccess.bind(ewRack),
                };
                serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'EWRACK', eastWestRackingSummaryData);
            }

            function onUpdateSolarAccessThreshold(solarAccessThreshold) {
                const ewRack = this;
                let nTables;
                if (ewRack.getMaxSolarAccess() < solarAccessThreshold) {
                    nTables = 1;
                } else {
                    ewRack.optimiseOnSolarAccess(solarAccessThreshold);
                    nTables = ewRack.getNumberOfTables();
                }
                return nTables;
            }

            function onOptimiseClose() {
                ewRack.onCloseOptimise();
                // stop container
                ewRack.stage.stateManager.stopContainer();
            }

            let ewRack = this;

            try {
                const sortedTables = await ewRack.initOptimiseOnSubarraySize();

                // start container
                ewRack.stage.stateManager.startContainer();

                if (store.state.studio.sideBar.solarAccess.visible) {
                    ewRack.switchVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS, true);
                }

                return {
                    onSlideSlider: _.bind(onSlideSlider, null, ewRack, sortedTables),
                    onLeaveSlider: onLeaveSlider.bind(this),
                    maxTables: sortedTables.length,
                    nTables: ewRack.getNumberOfTables(),
                    tableSize: ewRack.getTableSize(),
                    moduleCountPerTable: ewRack.tableSizeUp * ewRack.tableSizeWide,
                    onOptimiseClose: onOptimiseClose.bind(this),
                    onUpdateSolarAccessThreshold: onUpdateSolarAccessThreshold.bind(ewRack),
                };
            } catch (error) {
                console.error('ERROR: sapPaneAssistant: onClickOptimise failed', error);
                return Promise.reject(error);
            }
        }

        function onClickReset() {
            const ewRack = this;

            const notificationObject = ewRack.stage.eventManager.setUpdatePanelPlacementLoading();

            ewRack.stage.stateManager.startContainer();
            ewRack.updatePanelPlacement().then(
                () => {
                    onObjectSelection(ewRack);
                    ewRack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    ewRack.stage.stateManager.stopContainer();
                },
                () => {
                    ewRack.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Reset Subarray',
                        message: 'Error resetting ewRack.',
                    });
                    ewRack.stage.stateManager.stopContainer();
                },
            );
        }

        function getUpdatedSolarAccess() {
            const ewRack = this;
            return ewRack.getAverageSolarAccess();
        }

        function onClickAddTableToNewSubarray(tableType) {
            ewRack.stage.addTableMode.initAddTableMode(ewRack.getState(), ewRack.getParent(), tableType);
        }

        function subarrayMountTypeSelected(mountType) {
            // jugaad to change the default values of eastwestsubarray
            // we need to create ewrack instance when user swith to eastwest rack
            subarray = new Subarray(ewRack.stage);
            subarray.mountType = mountType;
            subarraySelected(subarray, ewRack);
        }

        const component = 'ewRack';

        const eastWestRackingSummaryData = {
            subarrayNumber: ewRack.id,
            numPanels: ewRack.getNumberOfPanels(),
            subarraySize: ewRack.getDcSize.bind(ewRack),
            isEastWest: ewRack.eastWestRackingEnabled,
            panelType: ewRack.getModuleMake(),
            getSolarAccess: getUpdatedSolarAccess.bind(ewRack),
            structureErrors: ewRack.getStructureErrors(),
            structureErrorAutoFixFunction: autoFixSubarrayForStructureTemplate.bind(null, ewRack, ewRack.stage),
        };

        const eastWestRackingActionsData = {
            deleteSubarray: deleteObject.bind(ewRack),
            addTables: onClickAddTableToNewSubarray.bind(ewRack),
            onClickOptimise: onClickOptimise.bind(ewRack),
            resetSubarray: onClickReset.bind(ewRack),
            addTableFlow: ewRack.addTableFlow,
            eastWestRackingEnabled: ewRack.eastWestRackingEnabled,
        };

        const eastWestRackingPropertiesData = {
            moduleId: ewRack.moduleProperties.moduleId,
            name: ewRack.name,
            tilt: ewRack.tilt,
            azimuth: ewRack.azimuth,
            structureType: ewRack.structureType,
            tableSpacing: ewRack.tableSpacing,
            intraRowSpacing: ewRack.intraRowSpacing,
            interRowSpacing: ewRack.interRowSpacing,
            interRowSpacingMode: ewRack.interRowSpacingMode,
            tableSizeUp: ewRack.tableSizeUp,
            tableSizeWide: ewRack.tableSizeWide,
            panelOrientation: ewRack.panelOrientation,
            mountHeight: ewRack.mountHeight,
            moduleSpacingUp: ewRack.moduleSpacingUp,
            moduleSpacingWide: ewRack.moduleSpacingWide,
            update: onClickUpdate.bind(ewRack),
            updateRequired: updateEnabled,
            getOptimisedRowSpacing: ewRack.getOptimisedRowSpacing.bind(ewRack),
            mountType: ewRack.mountType,
            getFlushMountProperties: ewRack.getFlushMountProperties.bind(ewRack),
            getFixedMountProperties: ewRack.getFixedMountProperties.bind(ewRack),
            getPossibleAzimuths: ewRack.getPossibleAzimuths.bind(ewRack),
            structureErrors: ewRack.getStructureErrors(),
            structureErrorAutoFixFunction: autoFixSubarrayForStructureTemplate.bind(null, ewRack, ewRack.stage),
            updateInverters: ewRack.updateInverters.bind(ewRack),
            subarrayCreated: subarrayMountTypeSelected.bind(ewRack),
            inverters: ewRack.inverters,
            updateInverterAddition: ewRack.updateInverterAddition.bind(ewRack),
            updateInverterDeletion: ewRack.updateInverterDeletion.bind(ewRack),
            getDcSize: ewRack.stage.getDcSize.bind(ewRack.stage),
            getAcSize: ewRack.stage.getAcSize.bind(ewRack.stage),
            bifacialEnabled: ewRack.bifacialEnabled,
            getParent: ewRack.getParent.bind(ewRack),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'EWRACK', eastWestRackingSummaryData, eastWestRackingActionsData, eastWestRackingPropertiesData);
    }

    function gazeboSelected(gazebo) {
        function onClickUpdate(updatedProperties) {
            const notificationObject = this.stage.eventManager.setUpdatePanelPlacementLoading();

            this.stage.stateManager.startContainer();
            // TODO: Promise
            Promise.resolve(this.updateObject(updatedProperties)).then((success) => {
                if (success) {
                    // onObjectSelection(this);
                    this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    this.stage.stateManager.stopContainer();
                } else {
                    this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                    notificationsAssistant.error({
                        title: 'Update Properties',
                        message: 'Error updating this properties. this deleted.',
                    });
                    this.stage.stateManager.stopContainer();
                }
            });
        }
        
        function updateTable(table,updatedProperties){
            if (table.getSubarray().moduleProperties.moduleId !== updatedProperties.moduleProperties.moduleId) {
                createUpdatedTables(table,updatedProperties)
            }
        }

        function deleteObject() {
            this.stage.stateManager.startContainer();

            this.removeObject();
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.selectionControls.enable();

            this.stage.stateManager.stopContainer();
        }

        const gazeboSummaryData = {
            panelNumbers: gazebo.getNumberOfPanels(),
            gazeboType: gazebo.gazeboType(),
            DCSize: gazebo.getDcSize(),
            inverterType: gazebo.getInverterType(),

        };
        const gazeboActionsData = {
            deleteGazebo: deleteObject.bind(gazebo),
        };
        const gazeboPropertiesData = {
            update: onClickUpdate.bind(gazebo),
            structureType: gazebo.structureType,
            inverterType: gazebo.inverterType,
            azimuth: gazebo.azimuth,
            getPossibleAzimuths: gazebo.getPossibleAzimuths.bind(gazebo),
        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'GAZEBO', gazeboSummaryData, gazeboActionsData, gazeboPropertiesData);
    }

    function tableSelected(table) {

        if (table.getSubarray() instanceof Gazebo) {
            gazeboSelected(table.getSubarray());
        }
        else {
            const component = 'table';

            // eslint-disable-next-line no-inner-declarations
            function deleteTable() {
                const table = this;
                table.stage.stateManager.startContainer();

                // first remove table
                // so that table changes are reflected on ground selection
                table.removeObject(undefined, undefined, { objectSelected: true });
                table.stage.selectionControls.selectGroundAndDisable();
                table.stage.selectionControls.enable();

                table.stage.stateManager.stopContainer();
            }

            // eslint-disable-next-line no-inner-declarations
            function getUpdatedSolarAccess() {
                const table = this;
                return table.getAverageSolarAccess();
            }



            function updateTable(table,updatedProperties) {
                let stage = table.stage
                stage.stateManager.startContainer();
                    let newDimensions = table.getSubarray().getTableDimensions();
                    let oldDimensions = table.getSubarray().getTableDimensions();
                    let subarrayProperties = table.getSubarray();
                    // subarrayProperties.moduleProperties = updatedProperties.moduleProperties
                        const subarray = createNewSubarray(subarrayProperties)        
                        subarray.updateSubarrayForAddTable(updatedProperties)
                        newDimensions = subarray.getTableDimensions()
                            // subarray.isEmpty = false;
                            const templateTableMap = subarray.getTemplateTableMap({ withBBox: true });
                            templateTableMap.hidden = false;
                            templateTableMap.isMoved = true;
                
                                        let currentBaseTable = new Table(stage, templateTableMap, { withoutContainer: false }, false);
                                        const rowMap = {
                                            id: 0,
                                            frames: [],
                                        };
                                        const row = new Row(stage, rowMap, { withoutContainer: true }, true);
                                        subarray.addChild(row);
                                        currentBaseTable.clickToAdd = true;
                
                                        row.addChild(currentBaseTable);
                                        subarray.validateStructures();
                                        const panels = currentBaseTable.getChildren();
                                        for (let i = 0, l = panels.length; i < l; i += 1) {
                                            panels[i].setId(subarray.getPanelId());
                                        }
                                        let position = table.getPosition();
                                        currentBaseTable.moveObject(position.x, position.y, position.z);
                                        currentBaseTable.updateVisualsAfterLoadingAndCreation();
                                        row.saveState();
                                    
                                
                                if (!subarray.isEmpty && subarray.getParent()) {
                                    try{
                                        subarray.removeOutlinePoints();
                                        subarray.addTableFlow = false;
                                        subarray.createConvexHull();
                                        subarray.mergeGeometriesForAllPanels();
                                    }catch(e){
                                        //console.log("ERROR CREATING SUBARRAY")
                                    }
                                } else {
                                    subarray.removeIfEmpty();
                                }
                                table.removeObject()
                                stage.selectionControls.setSelectedObject(currentBaseTable);
                            
                            // after the table is added to subarray we should update rails
                            subarray.updateRail();
                        
                    
                    stage.stateManager.stopContainer();
                    function createNewSubarray(subarrayProperties) {
                        const newSubarray = new Subarray(stage);
                        subarrayProperties.getParent().addChild(newSubarray);
                        newSubarray.associatedModel = subarrayProperties.associatedModel;
                        newSubarray.createBoundaryFromParent();
                        newSubarray.addTableFlow = true;
                        if (subarrayProperties !== null) {
                            newSubarray.updateSubarrayForAddTable(subarrayProperties);
                        }
                        return newSubarray;
                    }
            }

            const tableSummaryData = {
                panelCount: table.getChildren().length,
                tableNumber: table.id,
                tableSizeX: table.tableSize.wide,
                tableSizeY: table.tableSize.up,
                isEastTable: table.getSubarray().eastSubarrayFlag,
                getSolarAccess: getUpdatedSolarAccess.bind(table),
            };

            const tableActionsData = {
                deleteTable: deleteTable.bind(table),
                updateTable: updateTable.bind(table)
            };

            const tablePropertiesData = {
                update: updateTable.bind(table,table),
                defaultModuleId: table.getSubarray().getModuleId(),
                eastWestRackingEnabled: table.getSubarray().eastWestRackingEnabled
            };



            serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TABLE', tableSummaryData, tableActionsData, tablePropertiesData);
        }
    }

    function tablesSelected(tables) {
        let selectedPanels = 0;
        for (let x = 0; x < tables.length; x++) {
            selectedPanels += tables[x].getChildren().length;
        }

        const component = 'table';
        let warnings = [];
        let stage = tables[0].stage
        let raycaster = new THREE.Raycaster();
        let groupedTables = groupTables(tables);

        function updateTable(tables,updatedProperties){
            if (tables[0].getSubarray().moduleProperties.moduleId !== updatedProperties.moduleProperties.moduleId) {
                let groupedTables = groupTables(tables);
                createUpdatedTables(this,updatedProperties, groupedTables)
                this.stage = tables[0].stage
                this.stage.selectionControls.setSelectedObject(this.stage.ground);
            }
        }
        
        function groupBy(list, keyGetter) {
            const map = new Map();
            list.forEach((item) => {
                 const key = keyGetter(item);
                 const collection = map.get(key);
                 if (!collection) {
                     map.set(key, [item]);
                 } else {
                     collection.push(item);
                 }
            });
            return map;
        }
        function groupTables(tables){
            return groupBy(tables,table =>table.getSubarray().uuid);
        }

        function checkIfSnapped(checkTable, tables){

            let subarray = tables[0].getSubarray();
            let dimension = subarray.getTableDimensions();
            let stage = tables[0].stage;
            const bBox = tables[0].getSubarray().getBoundingBox();
                
            const rightDirection = bBox[3].clone().sub(bBox[0]);
            rightDirection.normalize();
            const upDirection = bBox[0].clone().sub(bBox[1]);
            upDirection.normalize();

            for(let i= 0; i < tables.length; i++) {
                // console.log(tables[i])
            let position = tables[i].getPosition();
            const rightDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, dimension.width/2 + subarray.tableSpacing * 2 + 0.2);
            const leftDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, -(dimension.width/2 + subarray.tableSpacing * 2 + 0.2));
            const topDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, dimension.length/2 + subarray.rowSpacing * 2 + 0.2);
            const downDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, -dimension.length/2 + subarray.rowSpacing * 2 + 0.2);
        
                let leftPos = new Vector3(position.x + leftDisplacement.x, position.y + leftDisplacement.y, position.z);
                let rightPos = new Vector3(position.x + rightDisplacement.x, position.y + rightDisplacement.y, position.z);
                let topPos = new Vector3(position.x + topDisplacement.x, position.y + topDisplacement.y, position.z);
                let downPos = new Vector3(position.x + downDisplacement.x, position.y + downDisplacement.y, position.z);
                // let downPos = tables[i].getPosition();
                // //visualization
                // let box = new THREE.BoxGeometry(1, 1, 1);
                // let collision_mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color:0xff0000}));
                // collision_mesh.position.set(leftPos.x, leftPos.y, leftPos.z);
                // tables[0].stage.sceneManager.scene.add(collision_mesh);
        
                tables[i].snappedLeft = null;
                tables[i].snappedRight = null;
                tables[i].anchorTable = false;
                // let subarray = tables[i].getSubarray();
                // let raycaster = new THREE.Raycaster();
                // //not working needs fix
                // let right = getAllObjectsBelowPoint(rightPos, stage, raycaster)
                // let left = getAllObjectsBelowPoint(leftPos, stage, raycaster)
                // let top = getAllObjectsBelowPoint(topPos, stage, raycaster)
                // let down = getAllObjectsBelowPoint(downPos, stage, raycaster)
                let nearestTop = subarray.getNearestTableToPoint(topPos);
                let nearestDown = subarray.getNearestTableToPoint(downPos);
                let nearestRight = subarray.getNearestTableToPoint(rightPos);
                let nearestLeft = subarray.getNearestTableToPoint(leftPos);
                
                // tables[i].getSubarray().parent.parent.drawCircleGreen(nearestTop.getPosition())
                // console.log(right[0][0].getParent(), left[0][0]);
                let snappedLeft = false;
                let snappedRight = false;
                let snappedTop = false;
                let snappedDown = false;
                if(nearestRight){
                    if(checkPointInsideVertices(nearestRight.get2DVertices(), [rightPos.x, rightPos.y])){
                        tables[i].snappedRight = nearestRight;
                        snappedRight = true;
                    }
                }
                if(nearestLeft){
                    if(checkPointInsideVertices(nearestLeft.get2DVertices(), [leftPos.x, leftPos.y])){
                        tables[i].snappedLeft = nearestLeft;
                        snappedLeft = true;
                    }
                }
                if(nearestTop){
                    if(checkPointInsideVertices(nearestTop.get2DVertices(), [topPos.x, topPos.y])){
                        tables[i].snappedTop = nearestTop;
                        snappedTop = true;
                    }
                }
                if(nearestDown){
                    if(checkPointInsideVertices(nearestDown.get2DVertices(), [downPos.x, downPos.y])){
                        tables[i].snappedDown = nearestDown;
                        snappedDown = true;
                    }
                }
                tables[i].anchorTable = !snappedLeft && snappedRight;
            }
            // console.log(tables)
            return tables;

        }

        function addSnappingInformation(tables){
            let _tables = tables;
            let startingTable = _tables[0]
            return checkIfSnapped(startingTable,tables);
            
        }
        function getModuleId(groupedTables){
            let moduleIds = []
            let groupKeys = Array.from(groupedTables.keys())
            for(let i = 0; i < groupKeys.length; i++){
                moduleIds.push(groupedTables.get(groupKeys[i])[0].getSubarray().getModuleId());
            }
            let uniqueIds = Array.from(new Set(moduleIds))
            if (uniqueIds.length > 1) warnings.push("Multiple Panels Selected");
            return uniqueIds[0]
        }

        function createUpdatedTables(tables,updatedProperties, groupedTables) {
            let stage = tables[0].stage
            stage.stateManager.startContainer();
            let groupKeys = Array.from(groupedTables.keys())
            for (let i = 0; i < groupKeys.length; i++) {
                let tables = groupedTables.get(groupKeys[i]);
                let newDimensions = tables[0].getSubarray().getTableDimensions();
                let oldDimensions = tables[0].getSubarray().getTableDimensions();
                tables = addSnappingInformation(tables);
                let subarrayProperties = tables[0].getSubarray();
                // subarrayProperties.moduleProperties = updatedProperties.moduleProperties
                const subarray = createNewSubarray(subarrayProperties)        
                subarray.updateSubarrayForAddTable(updatedProperties)
                newDimensions = subarray.getTableDimensions()
                moveScaleFactor(tables, oldDimensions, newDimensions)

                for (let i = 0; i < tables.length; i++) {
                    // subarray.isEmpty = false;
                    const templateTableMap = subarray.getTemplateTableMap({ withBBox: true });
                    templateTableMap.hidden = false;
                    templateTableMap.isMoved = true;
        
                                let currentBaseTable = new Table(stage, templateTableMap, { withoutContainer: false }, false);
                                const rowMap = {
                                    id: i,
                                    frames: [],
                                };
                                const row = new Row(stage, rowMap, { withoutContainer: true }, true);
                                subarray.addChild(row);
                                currentBaseTable.clickToAdd = true;
        
                                row.addChild(currentBaseTable);
                                subarray.validateStructures();
                                const panels = currentBaseTable.getChildren();
                                for (let i = 0, l = panels.length; i < l; i += 1) {
                                    panels[i].setId(subarray.getPanelId());
                                }
                                let position = tables[i].getPosition();
                                const objectMeshes = stage.mergeManager.getAllMeshesInScene();
                                const objectArray = getAllObjectsBelowPoint(
                                    new THREE.Vector3(position.x, position.y, 0),
                                    stage,
                                    raycaster,
                                    objectMeshes,
                                );
                                currentBaseTable.moveObject(position.x, position.y, position.z);
                                currentBaseTable.updateVisualsAfterLoadingAndCreation();
                                row.saveState();
                            
                        
                        if (!subarray.isEmpty && subarray.getParent()) {
                            try{
                                subarray.removeOutlinePoints();
                                subarray.addTableFlow = false;
                                subarray.createConvexHull();
                                subarray.mergeGeometriesForAllPanels();
                            }catch(e){
                                //console.log("ERROR CREATING SUBARRAY")
                            }
                        } else {
                            subarray.removeIfEmpty();
                        }
                        tables[i].removeObject()
                    
                    // after the table is added to subarray we should update rails
                    subarray.updateRail();
                }
            }
            stage.stateManager.stopContainer();
        }
    function moveScaleFactor(tables, oldDimensions, newDimensions){
        // let tables = subarray.getTables();
        if(oldDimensions.length != newDimensions.length || oldDimensions.width != newDimensions.width) warnings.push("Dimensions Does Not Match");
        let subarray = tables[0].getSubarray();
        let azimuthFactor = subarray.azimuth > 180 ? -1: -1;
        let xDiff = (oldDimensions.width - newDimensions.width) * azimuthFactor;  
        let yDiff = (oldDimensions.length - newDimensions.length) * azimuthFactor; 
        // console.log(tables)
        for(let i = 0; i < tables.length; i++){
            if(tables[i].anchorTable){
                const bBox = tables[i].getSubarray().getBoundingBox();
                
                const rightDirection = bBox[3].clone().sub(bBox[0]);
                rightDirection.normalize();
                const upDirection = bBox[0].clone().sub(bBox[1]);
                upDirection.normalize();
                

                let currentTable = tables[i];
                let distanceCount = 1;
                while(currentTable.snappedRight){
                    
                    if(currentTable.anchorTable && currentTable.snappedTop){
                    currentTable.heightCount = (currentTable.snappedTop.heightCount || 0 ) + 1
                    const finalDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, -yDiff * currentTable.heightCount);
                    currentTable.moveObject(finalDisplacement.x, finalDisplacement.y, 0)
                    }


                    const finalDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, xDiff * distanceCount);

                    if(tables[i].snappedTop) finalDisplacement.addScaledVector(upDirection, -yDiff * tables[i].heightCount);

                    currentTable = currentTable.snappedRight;
                    currentTable.moveObject(finalDisplacement.x, finalDisplacement.y, 0)
                    // finalDisplacement.addScaledVector(upDirection, smallestDelta.y);
                    // console.log(currentTable.getPosition(), )
                    distanceCount++
                    // console.log("moving right", xDiff, currentTable.id)
                }
            }
        }
    }
        
    function createNewSubarray(subarrayProperties) {
        const newSubarray = new Subarray(stage);
        subarrayProperties.getParent().addChild(newSubarray);
        newSubarray.associatedModel = subarrayProperties.associatedModel;
        newSubarray.createBoundaryFromParent();
        newSubarray.addTableFlow = true;
        if (subarrayProperties !== null) {
            newSubarray.updateSubarrayForAddTable(subarrayProperties);
        }
        return newSubarray;
    }
        function deleteTable() {
            const tables = this;
            const subarraysListForUpdate = [];
            tables[0].stage.stateManager.startContainer();
            for (const table of tables) {
                if (table.getParent() !== null && table.getSubarray() !== null) {
                    if (!subarraysListForUpdate.includes(table.getSubarray()))
                        subarraysListForUpdate.push(table.getSubarray());
                }
                table.removeObject(undefined, undefined, { objectSelected: false });
            }
            tables[0].stage.selectionControls.selectGroundAndDisable();
            tables[0].stage.selectionControls.enable();
            for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                subarraysListForUpdate[i].mergeGeometriesForAllPanels();
            }
            tables[0].stage.stateManager.stopContainer();
        }

        function getUpdatedSolarAccess() {
            const tables = this;
            return tables.map(table => table.getAverageSolarAccess());
        }

        const tableSummaryData = {
            panelCount: selectedPanels,
            tableNumber: tables.map(x => x.id),
            tableSizeX: tables.map(x => x.tableSize.wide),
            tableSizeY: tables.map(x => x.tableSize.up),
            getSolarAccess: getUpdatedSolarAccess.bind(tables),
        };

        const tableActionsData = {
            deleteTable: deleteTable.bind(tables),
            updateTable: updateTable.bind(tables)
        };

        const tablePropertiesData = {
            update: updateTable.bind(tables,tables),
            defaultModuleId: getModuleId(groupedTables),
            eastWestRackingEnabled: tables[0].getSubarray().eastWestRackingEnabled,
            warnings : warnings
        };        

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TABLE', tableSummaryData, tableActionsData, tablePropertiesData);
    }

    function panelSelected(panel) {
        const component = 'panel';

        function getDcSize() {
            return panel.getDCSize().toFixed(2);
        }

        function getSolarAccess() {
            return panel.getSolarAccess();
        }
        const panelSummaryData = {
            totalPanels: 1,
            DCSize: getDcSize.bind(panel),
            subarrayList: panel.getSubarray().getId(),
            tableSizeX: panel.getSubarray().tableSizeWide,
            tableSizeY: panel.getSubarray().tableSizeUp,
            getSolarAccess: getSolarAccess.bind(panel),
        };
        const panelActionsData = {};
        const panelPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'PANEL', panelSummaryData, panelActionsData, panelPropertiesData);
    }

    function panelsSelected(panels) {
        const component = 'panel';

        function getDcSize() {
            let totalDCSize = 0;
            panels.map(panel => {
                totalDCSize += panel.getDCSize();
            });
            return totalDCSize.toFixed(2);
        }

        function getSolarAccess() {
            let totalSolarAccess = 0;
            const panels = this;
            panels.map(panel => {
                totalSolarAccess += panel.getSolarAccess()
            });
            return totalSolarAccess / panels.length;
        }

        const number = panels.length;
        const panelSummaryData = {
            totalPanels: number,
            DCSize: getDcSize.bind(panels),
            subarrayList: panels.map(x => x.getSubarray().getId()),
            tableSizeX: panels.map(x => x.getSubarray().tableSizeWide),
            tableSizeY: panels.map(x => x.getSubarray().tableSizeUp),
            getSolarAccess: getSolarAccess.bind(panels),
        };
        const panelActionsData = {};
        const panelPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'PANEL', panelSummaryData, panelActionsData, panelPropertiesData);
    }

    function stringSelected(string) {

        function deleteString() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            string.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const stringSummaryData = {
            inverterName: string.mppt.inverter.name,
            mppt: string.mppt.inverter.mppts.indexOf(string.mppt) + 1,
            stringNum: string.mppt.strings.indexOf(string) + 1,
            stringType: 'STRING_INVERTER',
        };
        const stringActionsData = {
            deleteString: deleteString.bind(string),
        };
        const stringPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'STRING', stringSummaryData, stringActionsData, stringPropertiesData);
    }

    function electricalStringSelected(string) {

        function deleteString() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            string.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const stringSummaryData = {
            inverterName: string.inverter.name,
            stringNum: string.inverter.strings.indexOf(string) + 1,
            stringType: 'MICRO_INVERTER',
        };
        const stringActionsData = {
            deleteString: deleteString.bind(string),
        };
        const stringPropertiesData = {};

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'STRING', stringSummaryData, stringActionsData, stringPropertiesData);
    }

    function walkwaySelected(walkway) {
        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        async function toggleDirection() {
            this.stage.stateManager.startContainer();
            await this.toggleWalkwayDirection();
            this.stage.stateManager.stopContainer();
        }

        const component = 'walkway';

        const walkwaySummaryData = {
            walkwayNumber: walkway.id,
            walkwayLength: walkway.computeLength(),
        };

        const walkwayActionsData = {
            deleteWalkway: deleteObject.bind(walkway),
            toggleDirection: toggleDirection.bind(walkway),
        };

        // These needs to be referenced otherwise cancel in vue will reset to previous call data
        const walkwayPropertiesData = {
            coreHeight: walkway.coreHeight,
            width: walkway.width,
            update: onClickUpdate.bind(walkway),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'WALKWAY', walkwaySummaryData, walkwayActionsData, walkwayPropertiesData);
    }

    function safetyLineSelected(safetyLine) {

        async function deleteObject() {
            safetyLine.stage.selectionControls.selectGroundAndDisable();
            safetyLine.stage.stateManager.startContainer();
            await safetyLine.removeObject();
            safetyLine.stage.stateManager.stopContainer();
            safetyLine.stage.selectionControls.enable();
        }

        async function onToggleDirection() {
            safetyLine.stage.stateManager.startContainer();
            await safetyLine.toggleWalkwayDirection();
            safetyLine.stage.stateManager.stopContainer();
        }

        const safetyLineSummaryData = {
            safetyLineNumber: safetyLine.id,
            safetyLineLength: safetyLine.computeLength(),
        };

        const safetyLineActionsData = {
            deleteSafetyLine: deleteObject,
            toggleDirection: onToggleDirection,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SAFETYLINE', safetyLineSummaryData, safetyLineActionsData, {});
    }

    function handrailSelected(handrail) {

        async function deleteObject() {
            handrail.stage.selectionControls.selectGroundAndDisable();
            handrail.stage.stateManager.startContainer();
            await handrail.removeObject();
            handrail.stage.stateManager.stopContainer();
            handrail.stage.selectionControls.enable();
        }

        async function onToggleDirection() {
            handrail.stage.stateManager.startContainer();
            await handrail.toggleDirection();
            handrail.stage.stateManager.stopContainer();
        }

        const handrailSummaryData = {
            handrailNumber: handrail.getId(),
            handrailLength: handrail.getLength(),
            height: handrail.getHeight(),
            columnSpacing: handrail.getColumnSpacing(),
        };

        const handrailActionsData = {
            deleteHandrail: deleteObject,
            toggleDirection: onToggleDirection,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'HANDRAIL', handrailSummaryData, handrailActionsData, {});
    }
    function propertySelected(property) {

        async function deleteObject() {
            property.stage.selectionControls.selectGroundAndDisable();
            property.stage.stateManager.startContainer();
            await property.removeObject();
            property.stage.stateManager.stopContainer();
            property.stage.selectionControls.enable();
        }

        const propertySummaryData = {
            propertyNumber: property.getId(),
            propertyLength: property.getLength(),
        };

        const propertyActionsData = {
            deleteProperty: deleteObject,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'PROPERTY', propertySummaryData, propertyActionsData, {});
    }
    function acCableSelected(acCable) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            acCable.stage.selectionControls.selectGroundAndDisable();
            acCable.stage.stateManager.startContainer();
            await acCable.removeObject();
            acCable.stage.stateManager.stopContainer();
            acCable.stage.selectionControls.enable();
        }

        async function onToggleDirection() {
            acCable.stage.stateManager.startContainer();
            await acCable.toggleDirection();
            acCable.stage.stateManager.stopContainer();
        }

        const component = 'acCable';

        const acCableSummaryData = {
            acCableNumber: acCable.id,
            acCableLength: acCable.getLength(),
        };

        const acCableActionsData = {
            deleteAcCable: deleteObject.bind(acCable),
            toggleDirection: onToggleDirection.bind(acCable),
        };

        const acCablePropertiesData = {
            update: onClickUpdate.bind(acCable),
            materialType: acCable.materialType,
            cores: acCable.cores,
            cableSizeMM: acCable.cableSizeMM,
            cableSizeAWG: acCable.cableSizeAWG,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'ACCABLE', acCableSummaryData, acCableActionsData, acCablePropertiesData);
    }

    function dcCableSelected(dcCable) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            dcCable.stage.selectionControls.selectGroundAndDisable();
            dcCable.stage.stateManager.startContainer();
            await dcCable.attachedString.deleteString();
            dcCable.stage.stateManager.stopContainer();
            dcCable.stage.selectionControls.enable();
        }

        function attachedMaxCableLength() {
            let maxLength = 1;
            // dc cable disabled
            // for(let i=0; i<this.inverter.mppts.length; i++) {
            //     const strings = this.inverter.mppts[i].strings;
            //     for(let j=0; j<strings.length; j++) {
            //         const cable1 = strings[j].attachedDcCable[0];
            //         const cable2 = strings[j].attachedDcCable[1];
            //         maxLength = Math.max(maxLength, cable1.getLength());
            //         maxLength = Math.max(maxLength, cable2.getLength());
            //     }
            // }
            return maxLength;
        }

        const component = 'dcCable';

        const dcCableSummaryData = {
            dcCableId: dcCable.id,
            inverterName: dcCable.inverter.name,
            mppts: dcCable.attachedString.mppt.inverter.mppts.indexOf(dcCable.attachedString.mppt) + 1,
            string: dcCable.attachedString.mppt.strings.indexOf(dcCable.attachedString) + 1,
        };

        const dcCableActionsData = {
            deleteDcCable: deleteObject.bind(dcCable),
        };

        const dcCablePropertiesData = {
            update: onClickUpdate.bind(dcCable),
            cableLength: dcCable.getLength(),
            polarity: dcCable.polarity,
            stringSize: dcCable.stringSize,
            moduleId: dcCable.inverter.mppts[0].linkedSubarray.moduleProperties.moduleId,
            attachedMaxCableLength: attachedMaxCableLength.bind(dcCable),
            inverterName: dcCable.inverter.name,

        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DCCABLE', dcCableSummaryData, dcCableActionsData, dcCablePropertiesData);
    }

    function conduitSelected(conduit) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            conduit.stage.selectionControls.selectGroundAndDisable();
            conduit.stage.stateManager.startContainer();
            await conduit.removeObject();
            conduit.stage.stateManager.stopContainer();
            conduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await conduit.reversePolarity(conduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(conduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<conduit.attachedDcCable.length; i++) {
            //     cables.push({'id':conduit.attachedDcCable[i].id,
            //                 'inverterName': conduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': conduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':conduit.attachedDcCable[i].stringIndex,
            //                 'string':conduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            conduit.stage.selectionControls.selectGroundAndDisable();
            conduit.stage.stateManager.startContainer();
            conduit.updateAttachedCables(string);
            conduit.stage.stateManager.stopContainer();
            conduit.stage.selectionControls.enable();
        }


        const component = 'conduit';

        const conduitSummaryData = {
            conduitLength: conduit.getLength(),
            currentFillFactor: conduit.currentFillFactor(),
            type: "Single Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(conduit),
            reversePolarity: reversePolarity.bind(conduit),
            enable: conduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: conduit.name,
            innerDiameter: conduit.innerDiameter,
            outerDiameter: conduit.outerDiameter,
            maxFillFactor: conduit.maxFillFactor,
            materialType: conduit.materialType,
            updateCables: updateCable.bind(conduit),
            update: onClickUpdate.bind(conduit),
            attachedDcCable: getAllDcCables.bind(conduit),
            deleteCable: deleteCable.bind(conduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }


    function doubleConduitSelected(doubleConduit) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleConduit.stage.selectionControls.selectGroundAndDisable();
            doubleConduit.stage.stateManager.startContainer();
            await doubleConduit.removeObject();
            doubleConduit.stage.stateManager.stopContainer();
            doubleConduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleConduit.reversePolarity(doubleConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleConduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleConduit.stage.selectionControls.selectGroundAndDisable();
            doubleConduit.stage.stateManager.startContainer();
            doubleConduit.updateAttachedCables(string);
            doubleConduit.stage.stateManager.stopContainer();
            doubleConduit.stage.selectionControls.enable();
        }


        const component = 'doubleConduit';

        const conduitSummaryData = {
            conduitLength: doubleConduit.getLength(),
            currentFillFactor: doubleConduit.currentFillFactor(),
            type: "Double Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(doubleConduit),
            reversePolarity: reversePolarity.bind(doubleConduit),
            enable: doubleConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleConduit.name,
            innerDiameter: doubleConduit.innerDiameter,
            outerDiameter: doubleConduit.outerDiameter,
            maxFillFactor: doubleConduit.maxFillFactor,
            materialType: doubleConduit.materialType,
            updateCables: updateCable.bind(doubleConduit),
            update: onClickUpdate.bind(doubleConduit),
            attachedDcCable: getAllDcCables.bind(doubleConduit),
            deleteCable: deleteCable.bind(doubleConduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }

    function doubleSeparateConduitSelected(doubleSeparateConduit) {
        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleSeparateConduit.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateConduit.stage.stateManager.startContainer();
            await doubleSeparateConduit.removeObject();
            doubleSeparateConduit.stage.stateManager.stopContainer();
            doubleSeparateConduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleSeparateConduit.reversePolarity(doubleSeparateConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateConduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateConduit.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateConduit.stage.stateManager.startContainer();
            doubleSeparateConduit.updateAttachedCables(string);
            doubleSeparateConduit.stage.stateManager.stopContainer();
            doubleSeparateConduit.stage.selectionControls.enable();
        }


        const component = 'doubleSeparateConduit';

        const conduitSummaryData = {
            conduitLength: doubleSeparateConduit.getLength(),
            currentFillFactor: doubleSeparateConduit.currentFillFactor(),
            type: "Double Separate Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(doubleSeparateConduit),
            reversePolarity: reversePolarity.bind(doubleSeparateConduit),
            enable: doubleSeparateConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleSeparateConduit.name,
            innerDiameter: doubleSeparateConduit.innerDiameter,
            outerDiameter: doubleSeparateConduit.outerDiameter,
            maxFillFactor: doubleSeparateConduit.maxFillFactor,
            materialType: doubleSeparateConduit.materialType,
            updateCables: updateCable.bind(doubleSeparateConduit),
            update: onClickUpdate.bind(doubleSeparateConduit),
            attachedDcCable: getAllDcCables.bind(doubleSeparateConduit),
            deleteCable: deleteCable.bind(doubleSeparateConduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }

    function singleCableTraySelected(singleCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            singleCableTray.stage.selectionControls.selectGroundAndDisable();
            singleCableTray.stage.stateManager.startContainer();
            await singleCableTray.removeObject();
            singleCableTray.stage.stateManager.stopContainer();
            singleCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await singleCableTray.reversePolarity(singleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(singleCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<singleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':singleCableTray.attachedDcCable[i].id,
            //                 'inverterName': singleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': singleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':singleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':singleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            singleCableTray.stage.selectionControls.selectGroundAndDisable();
            singleCableTray.stage.stateManager.startContainer();
            singleCableTray.updateAttachedCables(string);
            singleCableTray.stage.stateManager.stopContainer();
            singleCableTray.stage.selectionControls.enable();
        }


        const component = 'singleCableTray';

        const cableTraySummaryData = {
            cableTrayLength: singleCableTray.getLength(),
            currentFillFactor: singleCableTray.currentFillFactor(),
            type: "Single Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(singleCableTray),
            reversePolarity: reversePolarity.bind(singleCableTray),
            enable: singleCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: singleCableTray.name,
            width: singleCableTray.width,
            height: singleCableTray.height,
            maxFillFactor: singleCableTray.maxFillFactor,
            materialType: singleCableTray.materialType,
            updateCables: updateCable.bind(singleCableTray),
            update: onClickUpdate.bind(singleCableTray),
            attachedDcCable: getAllDcCables.bind(singleCableTray),
            deleteCable: deleteCable.bind(singleCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function doubleCableTraySelected(doubleCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleCableTray.stage.stateManager.startContainer();
            await doubleCableTray.removeObject();
            doubleCableTray.stage.stateManager.stopContainer();
            doubleCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleCableTray.reversePolarity(doubleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleCableTray.stage.stateManager.startContainer();
            doubleCableTray.updateAttachedCables(string);
            doubleCableTray.stage.stateManager.stopContainer();
            doubleCableTray.stage.selectionControls.enable();
        }


        const component = 'doubleCableTray';

        const cableTraySummaryData = {
            cableTrayLength: doubleCableTray.getLength(),
            currentFillFactor: doubleCableTray.currentFillFactor(),
            type: "Double Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(doubleCableTray),
            reversePolarity: reversePolarity.bind(doubleCableTray),
            enable: doubleCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: doubleCableTray.name,
            width: doubleCableTray.width,
            height: doubleCableTray.height,
            maxFillFactor: doubleCableTray.maxFillFactor,
            materialType: doubleCableTray.materialType,
            updateCables: updateCable.bind(doubleCableTray),
            update: onClickUpdate.bind(doubleCableTray),
            attachedDcCable: getAllDcCables.bind(doubleCableTray),
            deleteCable: deleteCable.bind(doubleCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function doubleSeparateCableTraySelected(doubleSeparateCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleSeparateCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateCableTray.stage.stateManager.startContainer();
            await doubleSeparateCableTray.removeObject();
            doubleSeparateCableTray.stage.stateManager.stopContainer();
            doubleSeparateCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleSeparateCableTray.reversePolarity(doubleSeparateCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateCableTray.stage.stateManager.startContainer();
            doubleSeparateCableTray.updateAttachedCables(string);
            doubleSeparateCableTray.stage.stateManager.stopContainer();
            doubleSeparateCableTray.stage.selectionControls.enable();
        }


        const component = 'doubleSeparateCableTray';

        const cableTraySummaryData = {
            cableTrayLength: doubleSeparateCableTray.getLength(),
            currentFillFactor: doubleSeparateCableTray.currentFillFactor(),
            type: "Double Separate Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(doubleSeparateCableTray),
            reversePolarity: reversePolarity.bind(doubleSeparateCableTray),
            enable: doubleSeparateCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: doubleSeparateCableTray.name,
            width: doubleSeparateCableTray.width,
            height: doubleSeparateCableTray.height,
            maxFillFactor: doubleSeparateCableTray.maxFillFactor,
            materialType: doubleSeparateCableTray.materialType,
            updateCables: updateCable.bind(doubleSeparateCableTray),
            update: onClickUpdate.bind(doubleSeparateCableTray),
            attachedDcCable: getAllDcCables.bind(doubleSeparateCableTray),
            deleteCable: deleteCable.bind(doubleSeparateCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function dcCableSelected(dcCable) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            dcCable.stage.selectionControls.selectGroundAndDisable();
            dcCable.stage.stateManager.startContainer();
            await dcCable.attachedString.deleteString();
            dcCable.stage.stateManager.stopContainer();
            dcCable.stage.selectionControls.enable();
        }

        function attachedMaxCableLength() {
            let maxLength = 1;
            // dc cable disabled
            // for(let i=0; i<this.inverter.mppts.length; i++) {
            //     const strings = this.inverter.mppts[i].strings;
            //     for(let j=0; j<strings.length; j++) {
            //         const cable1 = strings[j].attachedDcCable[0];
            //         const cable2 = strings[j].attachedDcCable[1];
            //         maxLength = Math.max(maxLength, cable1.getLength());
            //         maxLength = Math.max(maxLength, cable2.getLength());
            //     }
            // }
            return maxLength;
        }

        const component = 'dcCable';

        const dcCableSummaryData = {
            dcCableId: dcCable.id,
            inverterName: dcCable.inverter.name,
            mppts: dcCable.attachedString.mppt.inverter.mppts.indexOf(dcCable.attachedString.mppt) + 1,
            string: dcCable.attachedString.mppt.strings.indexOf(dcCable.attachedString) + 1,
        };

        const dcCableActionsData = {
            deleteDcCable: deleteObject.bind(dcCable),
        };

        const dcCablePropertiesData = {
            update: onClickUpdate.bind(dcCable),
            cableLength: dcCable.getLength(),
            polarity: dcCable.polarity,
            stringSize: dcCable.stringSize,
            moduleId: dcCable.inverter.mppts[0].linkedSubarray.moduleProperties.moduleId,
            attachedMaxCableLength: attachedMaxCableLength.bind(dcCable),
            inverterName: dcCable.inverter.name,

        };
        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DCCABLE', dcCableSummaryData, dcCableActionsData, dcCablePropertiesData);
    }

    function conduitSelected(conduit) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            conduit.stage.selectionControls.selectGroundAndDisable();
            conduit.stage.stateManager.startContainer();
            await conduit.removeObject();
            conduit.stage.stateManager.stopContainer();
            conduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await conduit.reversePolarity(conduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(conduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<conduit.attachedDcCable.length; i++) {
            //     cables.push({'id':conduit.attachedDcCable[i].id,
            //                 'inverterName': conduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': conduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':conduit.attachedDcCable[i].stringIndex,
            //                 'string':conduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            conduit.stage.selectionControls.selectGroundAndDisable();
            conduit.stage.stateManager.startContainer();
            conduit.updateAttachedCables(string);
            conduit.stage.stateManager.stopContainer();
            conduit.stage.selectionControls.enable();
        }


        const component = 'conduit';

        const conduitSummaryData = {
            conduitLength: conduit.getLength(),
            currentFillFactor: conduit.currentFillFactor(),
            type: "Single Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(conduit),
            reversePolarity: reversePolarity.bind(conduit),
            enable: conduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: conduit.name,
            innerDiameter: conduit.innerDiameter,
            outerDiameter: conduit.outerDiameter,
            maxFillFactor: conduit.maxFillFactor,
            materialType: conduit.materialType,
            updateCables: updateCable.bind(conduit),
            update: onClickUpdate.bind(conduit),
            attachedDcCable: getAllDcCables.bind(conduit),
            deleteCable: deleteCable.bind(conduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }


    function doubleConduitSelected(doubleConduit) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleConduit.stage.selectionControls.selectGroundAndDisable();
            doubleConduit.stage.stateManager.startContainer();
            await doubleConduit.removeObject();
            doubleConduit.stage.stateManager.stopContainer();
            doubleConduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleConduit.reversePolarity(doubleConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleConduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleConduit.stage.selectionControls.selectGroundAndDisable();
            doubleConduit.stage.stateManager.startContainer();
            doubleConduit.updateAttachedCables(string);
            doubleConduit.stage.stateManager.stopContainer();
            doubleConduit.stage.selectionControls.enable();
        }


        const component = 'doubleConduit';

        const conduitSummaryData = {
            conduitLength: doubleConduit.getLength(),
            currentFillFactor: doubleConduit.currentFillFactor(),
            type: "Double Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(doubleConduit),
            reversePolarity: reversePolarity.bind(doubleConduit),
            enable: doubleConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleConduit.name,
            innerDiameter: doubleConduit.innerDiameter,
            outerDiameter: doubleConduit.outerDiameter,
            maxFillFactor: doubleConduit.maxFillFactor,
            materialType: doubleConduit.materialType,
            updateCables: updateCable.bind(doubleConduit),
            update: onClickUpdate.bind(doubleConduit),
            attachedDcCable: getAllDcCables.bind(doubleConduit),
            deleteCable: deleteCable.bind(doubleConduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }

    function doubleSeparateConduitSelected(doubleSeparateConduit) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleSeparateConduit.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateConduit.stage.stateManager.startContainer();
            await doubleSeparateConduit.removeObject();
            doubleSeparateConduit.stage.stateManager.stopContainer();
            doubleSeparateConduit.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleSeparateConduit.reversePolarity(doubleSeparateConduit);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateConduit);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateConduit.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateConduit.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateConduit.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateConduit.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateConduit.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateConduit.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateConduit.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateConduit.stage.stateManager.startContainer();
            doubleSeparateConduit.updateAttachedCables(string);
            doubleSeparateConduit.stage.stateManager.stopContainer();
            doubleSeparateConduit.stage.selectionControls.enable();
        }


        const component = 'doubleSeparateConduit';

        const conduitSummaryData = {
            conduitLength: doubleSeparateConduit.getLength(),
            currentFillFactor: doubleSeparateConduit.currentFillFactor(),
            type: "Double Separate Conduit",
        };

        const conduitActionsData = {
            deleteConduit: deleteObject.bind(doubleSeparateConduit),
            reversePolarity: reversePolarity.bind(doubleSeparateConduit),
            enable: doubleSeparateConduit.stage.addCablesMode.enabled,
        };

        const conduitPropertiesData = {
            name: doubleSeparateConduit.name,
            innerDiameter: doubleSeparateConduit.innerDiameter,
            outerDiameter: doubleSeparateConduit.outerDiameter,
            maxFillFactor: doubleSeparateConduit.maxFillFactor,
            materialType: doubleSeparateConduit.materialType,
            updateCables: updateCable.bind(doubleSeparateConduit),
            update: onClickUpdate.bind(doubleSeparateConduit),
            attachedDcCable: getAllDcCables.bind(doubleSeparateConduit),
            deleteCable: deleteCable.bind(doubleSeparateConduit)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CONDUIT', conduitSummaryData, conduitActionsData, conduitPropertiesData);
    }

    function singleCableTraySelected(singleCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            singleCableTray.stage.selectionControls.selectGroundAndDisable();
            singleCableTray.stage.stateManager.startContainer();
            await singleCableTray.removeObject();
            singleCableTray.stage.stateManager.stopContainer();
            singleCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await singleCableTray.reversePolarity(singleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(singleCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<singleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':singleCableTray.attachedDcCable[i].id,
            //                 'inverterName': singleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': singleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':singleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':singleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            singleCableTray.stage.selectionControls.selectGroundAndDisable();
            singleCableTray.stage.stateManager.startContainer();
            singleCableTray.updateAttachedCables(string);
            singleCableTray.stage.stateManager.stopContainer();
            singleCableTray.stage.selectionControls.enable();
        }


        const component = 'singleCableTray';

        const cableTraySummaryData = {
            cableTrayLength: singleCableTray.getLength(),
            currentFillFactor: singleCableTray.currentFillFactor(),
            type: "Single Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(singleCableTray),
            reversePolarity: reversePolarity.bind(singleCableTray),
            enable: singleCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: singleCableTray.name,
            width: singleCableTray.width,
            height: singleCableTray.height,
            maxFillFactor: singleCableTray.maxFillFactor,
            materialType: singleCableTray.materialType,
            updateCables: updateCable.bind(singleCableTray),
            update: onClickUpdate.bind(singleCableTray),
            attachedDcCable: getAllDcCables.bind(singleCableTray),
            deleteCable: deleteCable.bind(singleCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function doubleCableTraySelected(doubleCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleCableTray.stage.stateManager.startContainer();
            await doubleCableTray.removeObject();
            doubleCableTray.stage.stateManager.stopContainer();
            doubleCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleCableTray.reversePolarity(doubleCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleCableTray.stage.stateManager.startContainer();
            doubleCableTray.updateAttachedCables(string);
            doubleCableTray.stage.stateManager.stopContainer();
            doubleCableTray.stage.selectionControls.enable();
        }


        const component = 'doubleCableTray';

        const cableTraySummaryData = {
            cableTrayLength: doubleCableTray.getLength(),
            currentFillFactor: doubleCableTray.currentFillFactor(),
            type: "Double Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(doubleCableTray),
            reversePolarity: reversePolarity.bind(doubleCableTray),
            enable: doubleCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: doubleCableTray.name,
            width: doubleCableTray.width,
            height: doubleCableTray.height,
            maxFillFactor: doubleCableTray.maxFillFactor,
            materialType: doubleCableTray.materialType,
            updateCables: updateCable.bind(doubleCableTray),
            update: onClickUpdate.bind(doubleCableTray),
            attachedDcCable: getAllDcCables.bind(doubleCableTray),
            deleteCable: deleteCable.bind(doubleCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function doubleSeparateCableTraySelected(doubleSeparateCableTray) {

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            doubleSeparateCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateCableTray.stage.stateManager.startContainer();
            await doubleSeparateCableTray.removeObject();
            doubleSeparateCableTray.stage.stateManager.stopContainer();
            doubleSeparateCableTray.stage.selectionControls.enable();
        }

        async function reversePolarity() {
            await doubleSeparateCableTray.reversePolarity(doubleSeparateCableTray);
        }

        async function updateCable() {
            await this.stage.addCablesMode.initialize(doubleSeparateCableTray);
        }

        function getAllDcCables() {
            let cables = [];
            // dc cable disabled
            // for(let i=0; i<doubleSeparateCableTray.attachedDcCable.length; i++) {
            //     cables.push({'id':doubleSeparateCableTray.attachedDcCable[i].id,
            //                 'inverterName': doubleSeparateCableTray.attachedDcCable[i].inverter.name,
            //                 'mpptIndex': doubleSeparateCableTray.attachedDcCable[i].mpptIndex,
            //                 'stringIndex':doubleSeparateCableTray.attachedDcCable[i].stringIndex,
            //                 'string':doubleSeparateCableTray.attachedDcCable[i].attachedString});
            // }
            return cables;
        }

        async function deleteCable(string) {
            doubleSeparateCableTray.stage.selectionControls.selectGroundAndDisable();
            doubleSeparateCableTray.stage.stateManager.startContainer();
            doubleSeparateCableTray.updateAttachedCables(string);
            doubleSeparateCableTray.stage.stateManager.stopContainer();
            doubleSeparateCableTray.stage.selectionControls.enable();
        }


        const component = 'doubleSeparateCableTray';

        const cableTraySummaryData = {
            cableTrayLength: doubleSeparateCableTray.getLength(),
            currentFillFactor: doubleSeparateCableTray.currentFillFactor(),
            type: "Double Separate Cabletray",
        };

        const cableTrayActionsData = {
            deleteCableTray: deleteObject.bind(doubleSeparateCableTray),
            reversePolarity: reversePolarity.bind(doubleSeparateCableTray),
            enable: doubleSeparateCableTray.stage.addCablesMode.enabled,
        };

        const cableTrayPropertiesData = {
            name: doubleSeparateCableTray.name,
            width: doubleSeparateCableTray.width,
            height: doubleSeparateCableTray.height,
            maxFillFactor: doubleSeparateCableTray.maxFillFactor,
            materialType: doubleSeparateCableTray.materialType,
            updateCables: updateCable.bind(doubleSeparateCableTray),
            update: onClickUpdate.bind(doubleSeparateCableTray),
            attachedDcCable: getAllDcCables.bind(doubleSeparateCableTray),
            deleteCable: deleteCable.bind(doubleSeparateCableTray)
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CABLETRAY', cableTraySummaryData, cableTrayActionsData, cableTrayPropertiesData);
    }

    function treeSelected(tree) {
        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const component = 'tree';

        const treeSummaryData = {
            treeNumber: tree.id,
            treeHeight: tree.treeHeight,
        };

        const treeActionsData = {
            deleteTree: deleteObject.bind(tree),
        };

        // These needs to be referenced otherwise cancel in vue will reset to previous call data
        const treePropertiesData = {
            treeId: tree.treeId ? tree.treeId : tree.getDefaultValues().treeId,
            isProportional: tree.isProportional,
            trunkHeight: tree.trunkHeight,
            crownHeight: tree.crownHeight,
            update: onClickUpdate.bind(tree),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TREE', treeSummaryData, treeActionsData, treePropertiesData);
    }

    function inverterSelected(inverter) {

        function getInverter() {
            return inverter;
        }

        function onclickAJBToggle(toggleValue) {
            inverter.stage.stateManager.startContainer();
            if (toggleValue) {
                // edge case when ther is already an ajb connected to the inverter
                // then remove that inverter and add a new one.
                if (inverter.ajb instanceof DCDB) {
                    inverter.ajb.removeObject();
                }
                inverter.createAJB(this.stage);
                inverter.AJBToggle = true;
                inverter.drawCableDcdbToInverter();
            } else {
                inverter.AJBToggle = false;
                inverter.removeCableDcdbToInverter();
                inverter.ajb.removeObject();
            }
            inverter.saveState();
            inverter.stage.stateManager.stopContainer();
        }

        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                //msg --> updated inverter props.
                notificationsAssistant.success({
                    title: 'Update Inverter Properties',
                    message: 'Inveter Properties have been updated',
                });
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        function attachedMaxCableLength() {
            let maxLength = 1;
            // for(let i=0; i<inverter.mppts.length; i++) {
            //     const strings = inverter.mppts[i].strings;
            //     for(let j=0; j<strings.length; j++) {
            //         const cable1 = strings[j].attachedDcCable[0];
            //         const cable2 = strings[j].attachedDcCable[1];
            //         maxLength = Math.max(maxLength, cable1.getLength());
            //         maxLength = Math.max(maxLength, cable2.getLength());
            //     }
            // }
            return maxLength;
        }

        function showNotSelectedError() {
            notificationsAssistant.error({
                title: 'Save Linked Subarrays',
                message: 'Atleast one subarray should be selected.',
            });
        }

        function showNotSelectedSimilarSubarrays() {
            notificationsAssistant.error({
                title: 'Save Linked Subarrays',
                message: 'Selected subarrays should have same tilt, azimuth and PV Module.',
            });
        }

        async function getStringingData(moduleID) {
            const invertereStringingData =
                await API.DESIGNS.FETCH_INVERTER_STRINGING_INFO(this.stage.getDesignId(), {
                    moduleID,
                    inverterID: this.electricalProperties.id,
                });
            let stringRange = {};
            if (this.optimizerStatus) {
                stringRange = {
                    min: this.optimizer.minPanelLength,
                    max: this.optimizer.maxPanelLength
                }
            } else {
                stringRange = {
                    min: invertereStringingData.data.min,
                    max: invertereStringingData.data.max,
                };
            }
            return stringRange;
        }

        const component = 'inverter';

        const inverterSummaryData = {
            inverterNumber: inverter.id,
            inverterMake: inverter.getInverterMake(),
            inverterManufacturer: inverter.getInverterManufacturer(),
            numberOfMppts: inverter.getNumberOfMppts(),
            getDcSize: inverter.getDcSize.bind(inverter),
            acSize: inverter.getAcSize() / 1000,
        };

        const inverterActionsData = {
            deleteInverter: deleteObject.bind(inverter),
        };

        // const allSubarrays = [];
        // getSubarrays(inverter.stage.ground, allSubarrays);
        function getOptimizerPanelList() {
            const panelList = [];
            const uniquePanel = new Set();
            for (let i = 0; i < inverter.mppts.length; i++) {
                const make = inverter.mppts[i].linkedSubarray.getModuleMake();
                const id = inverter.mppts[i].linkedSubarray.getModuleId();
                if (!uniquePanel.has({ make, id })) {
                    uniquePanel.add({ make, id });
                    panelList.push({ make, id });
                }
            }

            return panelList;
        }

        async function getOptimizerList(moduleId) {
            try {
                const requestBody = { "moduleID": moduleId, "inverterID": inverter.electricalProperties.id };
                const resp = await axios.post(`api/designs/${inverter.stage.getDesignId()}/get_optimizer_list/`, requestBody);

                inverter.optimizerList = resp.data.optimizerList;
                inverter.optimizerStatus = resp.data.status;

                return inverter.optimizerList;
            } catch (error) {
                console.error(error);
            }
        }

        function getOptimizerCount() {
            if (inverter.optimizerStatus) {
                inverter.optimizerCount = 0;
                for (let i = 0; i < inverter.mppts.length; i++) {
                    let count = 0;
                    for (let j = 0; j < inverter.mppts[i].strings.length; j++) {
                        count = inverter.mppts[i].strings[j].linkedPanels.length;
                        inverter.optimizerCount += Math.ceil(count / inverter.optimizerStringLength)
                    }
                }
            }
            return inverter.optimizerCount;
        }

        function getPanelCount() {
            inverter.panelCount = 0;
            for (let i = 0; i < inverter.mppts.length; i++) {
                for (let j = 0; j < inverter.mppts[i].strings.length; j++) {
                    inverter.panelCount += inverter.mppts[i].strings[j].linkedPanels.length;
                }
            }

            return inverter.panelCount;
        }

        let mountHeightEditable = false;
        if (inverter.getParent() !== null &&
            inverter.getParent().getTilt() === 0) {
            mountHeightEditable = true;
        }

        const mppts = [];

        for (let i = 0, l = inverter.mppts.length; i < l; i += 1) {
            // Juggad for dynamic update of completed strings in sappane
            inverter.mppts[i].setCopyStrings();
            const stringsCompleted = [];
            for (let j = 0, len = inverter.mppts[i].strings.length; j < len; j += 1) {
                stringsCompleted.push({
                    length: inverter.mppts[i].strings[j].linkedPanels.length,
                    edit: inverter.mppts[i].strings[j].edit.bind(inverter.mppts[i].strings[j]),
                    deleteString: inverter.mppts[i].strings[j].deleteString
                        .bind(inverter.mppts[i].strings[j]),
                });
            }

            mppts.push({
                linkedSubarrayModuleId: inverter.mppts[i].linkedSubarray !== undefined &&
                    inverter.mppts[i].linkedSubarray !== null ?
                    inverter.mppts[i].linkedSubarray.getModuleId() : 0,
                maxStringCount: inverter.mppts[i].getMaxStrings(),
                suggestedStringCount: inverter.mppts[i].getSuggestedStringCount
                    .bind(inverter.mppts[i]),
                stringsCompleted: inverter.mppts[i].stringsCopy,
                addString: inverter.mppts[i].enterStringingEditMode.bind(inverter.mppts[i]),
                setStringRange: inverter.mppts[i].setStringRange.bind(inverter.mppts[i]),
                stringRange: inverter.mppts[i].stringRange,
            });
        }

        const inverterPropertiesData = {
            dcCable: {
                moduleToDcbd: {
                    cableType: inverter.dcCable.moduleToDcdb.cableType,
                    cableSizeMM: inverter.dcCable.moduleToDcdb.cableSizeMM,
                    cableSizeAWG: inverter.dcCable.moduleToDcdb.cableSizeAWG,
                },
                toInverter: {
                    cableType: inverter.dcCable.toInverter.cableType,
                    cableSizeMM: inverter.dcCable.toInverter.cableSizeMM,
                    cableSizeAWG: inverter.dcCable.toInverter.cableSizeAWG,
                },
                options: {
                    cableType: CABLE_TYPE,
                    cableSizeAWG: MANUAL_STRING_AWG,
                    cableSizeMM: MANUAL_ACCABLE_SIZE_MMSQ,
                },
            },
            // allSubararysForMppt,
            // showNotSelectedError: showNotSelectedError.bind(inverter) ,
            // showNotSelectedSimilarSubarrays: showNotSelectedSimilarSubarrays.bind(inverter),
            getStringingData: getStringingData.bind(inverter),
            setDcCableProperties: inverter.setDcCableProperties.bind(inverter),
            mppts,
            // stringRange: mppts.stringRange,
            azimuth: inverter.azimuth,
            mountHeight: inverter.pillarHeight,
            mountHeightEditable,
            name: inverter.name,
            cableSize: inverter.cableSize,
            update: onClickUpdate.bind(inverter),
            getInverter,
            ajbToggle: inverter.ajb instanceof DCDB,
            onclickAJBToggle: onclickAJBToggle.bind(inverter),
            designId: inverter.stage.getDesignId(),
            attachedMaxCableLength: attachedMaxCableLength.bind(inverter),
            getOptimizerPanelList: getOptimizerPanelList,
            getOptimizerList: getOptimizerList,
            optimizerList: inverter.optimizerList,
            optimizer: inverter.optimizer,
            optimizerStatus: inverter.optimizerStatus,
            optimizerPanel: inverter.optimizerPanel,
            optimizerStringLength: inverter.optimizerStringLength,
            getOptimizerCount: getOptimizerCount,
            getPanelCount: getPanelCount,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'INVERTER', inverterSummaryData, inverterActionsData, inverterPropertiesData);
    }

    function acdbSelected(acdb) {
        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const inverters = [];
        // const inverters = getInverters(acdb.stage);
        // let inverters = [];
        // for(let i = 0 ; i < allInverters.length ; i++){
        //     inverters.push({
        //         id: allInverters[i].id,
        //         name: allInverters[i].name,
        //         Manufacturer: allInverters[i].electricalProperties.Manufacturer,
        //         Make: allInverters[i].electricalProperties.Make,
        //         Size: allInverters[i].electricalProperties.Size,
        //         acCableAttached: allInverters[i].acCableAttached,
        //     });
        // }

        const component = 'acdb';

        const acdbSummaryData = {
            acdbNumber: acdb.id,
        };

        const acdbActionsData = {
            deleteACDB: deleteObject.bind(acdb),
        };

        let mountHeightEditable = false;
        if (acdb.getParent() !== null &&
            acdb.getParent().getTilt() === 0) {
            mountHeightEditable = true;
        }

        const acdbPropertiesData = {
            azimuth: acdb.azimuth,
            mountHeight: acdb.pillarHeight,
            mountHeightEditable,
            // ToDO: do not pass inverters directly.
            invertersList: inverters,
            update: onClickUpdate.bind(acdb),
            addAcCable: acdb.drawAcCable.bind(acdb),
            deleteAcCable: acdb.deleteAcCable.bind(acdb),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'ACDB', acdbSummaryData, acdbActionsData, acdbPropertiesData);
    }

    function dcdbSelected(dcdb) {
        async function onClickUpdate(updatedProperties) {
            this.stage.stateManager.startContainer();
            try {
                await this.updateObject(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            } finally {
                this.stage.stateManager.stopContainer();
            }
        }

        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const component = 'dcdb';

        const dcdbSummaryData = {
            dcdbNumber: dcdb.id,
        };

        const dcdbActionsData = {
            deleteDCDB: deleteObject.bind(dcdb),
        };

        let mountHeightEditable = false;
        if (dcdb.getParent() !== null &&
            dcdb.getParent().getTilt() === 0) {
            mountHeightEditable = true;
        }

        const dcdbPropertiesData = {
            azimuth: dcdb.azimuth,
            mountHeight: dcdb.pillarHeight,
            mountHeightEditable,
            update: onClickUpdate.bind(dcdb),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'DCDB', dcdbSummaryData, dcdbActionsData, dcdbPropertiesData);
    }

    function textBoxSelected(textBox) {
        async function deleteObject() {
            this.stage.selectionControls.selectGroundAndDisable();
            this.stage.stateManager.startContainer();
            await this.removeObject();
            this.stage.stateManager.stopContainer();
            this.stage.selectionControls.enable();
        }

        const component = 'textBox';

        const textBoxSummaryData = {
            textBoxNumber: textBox.getId(),
        };

        async function onClickUpdate(updatedProperties) {
            try {
                await this.updateTextProperties(updatedProperties);
                onObjectSelection(this);
            } catch (error) {
                console.error('Error: In sapPaneAssistant at onClickUpdate.', error);
                onObjectSelection(this);
            }
        }

        function editText() {
            this.initEditMode();
            const textBoxPropertiesData = {
                font: textBox.font,
                fontColor: textBox.fontColor,
                fontSize: textBox.fontSize,
                fontBold: textBox.fontBold,
                fontItalics: textBox.fontItalics,
                shapeWidth: textBox.shapeWidth,
                shapeColor: textBox.shapeColor,
                adjust: textBox.adjust,
                update: onClickUpdate.bind(textBox),
            };
            serverBus.$emit(
                CONSTANTS.SET_TEXT_TOOL_BAR,
                textBoxPropertiesData,
            );
        }

        const textBoxActionsData = {
            deleteTextBox: deleteObject.bind(textBox),
            editText: editText.bind(textBox),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'TEXTBOX', textBoxSummaryData, textBoxActionsData);
        const textBoxPropertiesData = {
            font: textBox.font,
            fontColor: textBox.fontColor,
            fontSize: textBox.fontSize,
            fontBold: textBox.fontBold,
            fontItalics: textBox.fontItalics,
            shapeWidth: textBox.shapeWidth,
            shapeColor: textBox.shapeColor,
            adjust: textBox.adjust,
            update: onClickUpdate.bind(textBox),
        };
        serverBus.$emit(
            CONSTANTS.SET_TEXT_TOOL_BAR,
            textBoxPropertiesData,
        );
    }

    function combinerBoxSelected(combinerBox) {

        function showMicroInverter() {
            combinerBox.stage.selectionControls.setSelectedObject(combinerBox.linkedMicroInverter);
        }

        const combinerBoxSummaryData = {
            showMicroInverter: showMicroInverter,
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'COMBINERBOX', combinerBoxSummaryData);
    }

    function microInverterSelected(microInverter) {

        function selectPanels() {
            microInverter.stage.microInverterSelectionMode.initialize(microInverter);
        }

        function updateButton(stringLength) {
            const string = microInverter.strings.slice();
            if (microInverter.stringLength != stringLength) {
                for (let i = 0; i < string.length; i++) {
                    microInverter.deleteStrings(string[i]);
                }
            }

            microInverter.stringLength = stringLength;
            microInverter.updateGeometry();
        }

        function cancelButton(microInverter) {
            if (!microInverter.stage.viewManager.showStringing) {
                microInverter.deSelect();
            }
            onClickInverterMenu(microInverter.stage);
        }

        function addCombinerBoxButton(microInverter) {

            store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
            store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
            store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_NO_COMPLETE_DRAWING_STATE);

            microInverter.stage.newCombinerBox.call(microInverter.stage, microInverter);

            topBarAssistant.setCancelAction(microInverter.stage.placeManager.onCancel.bind(microInverter.stage.placeManager));
            microInverter.stage.selectionControls.setSelectedObject(microInverter);
        }

        function deleteCombinerBox(microInverter) {
            microInverter.combinerBox.removeObject();
            microInverter.combinerBox = null;
        }

        function addString(microInverter) {
            microInverter.stage.stringing.init(microInverter);
        }

        function deleteString(string) {
            microInverter.deleteStrings(string);
        }

        function editString(string) {
            microInverter.editString(string);
        }

        // function getMicroInverter() {
        //     return microInverter;
        // }

        const microInverterSummaryData = {
            // getMicroInverter: getMicroInverter.bind(microInverter),
            microInverter,
            stringLength: microInverter.stringLength,
            stringRange: microInverter.stringRange,
            onClickSelectPanels: selectPanels,
            onClickUpdate: updateButton,
            onClickCancel: cancelButton,
            onClickAddCombinerBox: addCombinerBoxButton,
            onClickDeleteCombinerBox: deleteCombinerBox,
            onClickAddString: addString,
            onClickDeleteString: deleteString,
            onClickEditString: editString,
            stringingModeEnabled: microInverter.stage.stringing.stringingEnable,
            microInverterNumber: microInverter.id,
            microInverterMake: microInverter.getInverterMake(),
            microInverterManufacturer: microInverter.getInverterManufacturer(),
        };

        serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'MICROINVERTER', microInverterSummaryData);
    }
    if (objectSelected instanceof Ground) {
        groundSelected(objectSelected);
    }else if (objectSelected instanceof CustomImage){
        customImageSelected(objectSelected);
    } else if (objectSelected instanceof PolygonModel) {
        store.commit(CONSTANTS.SET_SETBACKEDIT_STATUS, true);
        modelSelected(objectSelected);
    } else if (objectSelected instanceof SmartroofModel) {
        smartroofModelSelected(objectSelected);
    } else if (objectSelected instanceof SmartroofFace) {
        smartroofFaceSelected(objectSelected);
    } else if (objectSelected instanceof OuterEdge) {
        outerEdgeSelected(objectSelected);
    } else if (objectSelected instanceof Dormer) {
        dormerSelected(objectSelected);
    } else if (objectSelected instanceof CylinderModel) {
        store.commit(CONSTANTS.SET_SETBACKEDIT_STATUS, false);
        modelSelected(objectSelected);
    } else if (objectSelected instanceof Gazebo){
        gazeboSelected(objectSelected)
    } else if (objectSelected instanceof EastWestRack) {
        if (objectSelected.rackSubarray) {
            ewRackSelected(objectSelected.rackSubarray);
        }
        else {
            ewRackSelected(objectSelected);
        }
    } else if (objectSelected instanceof Subarray) {
        subarraySelected(objectSelected);
    } else if (objectSelected instanceof Table) {
        tableSelected(objectSelected);
    } else if (objectSelected instanceof Array &&
        objectSelected.length > 0 &&
        objectSelected[0] instanceof Table) {
        tablesSelected(objectSelected);
    } else if (objectSelected instanceof Array &&
        objectSelected.length > 0 &&
        objectSelected[0] instanceof Panel) {
        panelsSelected(objectSelected);
    } else if (objectSelected instanceof Panel) {
        panelSelected(objectSelected);
    } else if (objectSelected instanceof ElectricalString) {
        electricalStringSelected(objectSelected);
    } else if (objectSelected instanceof DCString) {
        stringSelected(objectSelected);
    } else if (objectSelected instanceof Walkway) {
        if (objectSelected instanceof SafetyLine) {
            safetyLineSelected(objectSelected);
        } else {
            walkwaySelected(objectSelected);
        }
    } else if (objectSelected instanceof Handrail) {
        handrailSelected(objectSelected);
    } else if (objectSelected instanceof Property) {
        propertySelected(objectSelected);
    } else if (objectSelected instanceof Tree) {
        treeSelected(objectSelected);
    } else if (objectSelected instanceof Dimension) {
        dimensionSelected(objectSelected);
    } else if (objectSelected instanceof ThreejsText) {
        threejsTextSelected(objectSelected);
    } else if (objectSelected instanceof Inverter) {
        inverterSelected(objectSelected);
    } else if (objectSelected instanceof MicroInverter) {
        microInverterSelected(objectSelected);
    } else if (objectSelected instanceof CombinerBox) {
        combinerBoxSelected(objectSelected);
    } else if (objectSelected instanceof ACDB) {
        acdbSelected(objectSelected);
    } else if (objectSelected instanceof DCDB) {
        dcdbSelected(objectSelected);
    } else if (objectSelected instanceof TextBox) {
        textBoxSelected(objectSelected);
    } else if (objectSelected instanceof AcCable) {
        acCableSelected(objectSelected);
    } else if (objectSelected instanceof DcCable) {
        dcCableSelected(objectSelected);
    } else if (objectSelected instanceof Conduit) {
        if (objectSelected instanceof DoubleConduit) {
            if (objectSelected instanceof DoubleCableTray) {
                doubleCableTraySelected(objectSelected);
            } else {
                doubleConduitSelected(objectSelected);
            }
        } else if (objectSelected instanceof DoubleSeparateConduit) {
            if (objectSelected instanceof DoubleSeparateCableTray) {
                doubleSeparateCableTraySelected(objectSelected);
            } else {
                doubleSeparateConduitSelected(objectSelected);
            }
        } else {
            if (objectSelected instanceof SingleCableTray) {
                singleCableTraySelected(objectSelected);
            } else {
                conduitSelected(objectSelected);
            }
        }
    } else {
        console.error('ERROR: ComponentManager: Unknown object passed to onObjectSelection function', objectSelected);
    }
}

function onSwitchToCustomImageEditMode(customImage, { controlsEnabled = false }) {
    const customImageEditorManager = CustomImageEditorManager.getInstance();

    const customImagePropertiesData = {
        rotation: customImage.getRotation(),
        scale: customImage.getScale(),
        updateRotation: customImage.updateRotation.bind(customImage),
        updateScale: customImage.updateScale.bind(customImage),
        updateGroundSize: customImageEditorManager.updateGroundSize.bind(customImageEditorManager),
        groundSize: customImageEditorManager.getCurrentGroundSize(),
        groundSizeLimits: customImageEditorManager.getGroundSizeLimits(),
        enableRotationGUI: customImageEditorManager.startRotationGUI
            .bind(customImageEditorManager),
        enableScaleGUI: customImageEditorManager.startScaleGUI
            .bind(customImageEditorManager),
        controlsEnabled,
    };

    serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'CUSTOM IMAGE', {}, {}, customImagePropertiesData);
}

function onSwitchToSLD(stage) {
    const stringInverters = []
    const inverterList = getInverters(stage);
    for (let i = 0; i < inverterList.length; i += 1) {
        let inverter = {
            Manufacturer: inverterList[i].electricalProperties.Manufacturer,
            Make: inverterList[i].electricalProperties.Make,
            Size: inverterList[i].electricalProperties.Size,
            panelCount: inverterList[i].panelCount,
            mmptVoltageRange: {
                min: inverterList[i].electricalProperties.MPPT_Low_V,
                max: inverterList[i].electricalProperties.MPPT_High_V,
            },
            mmptCount: inverterList[i].electricalProperties.Number_of_MPPT,
        };
        if (inverterList[i].mpptsData[0]) {
            inverter.stringRange = {
                max: inverterList[i].mpptsData[0].stringRange.maximum,
                min: inverterList[i].mpptsData[0].stringRange.minimum,
            }
        } else {
            inverter.stringRange = {
                max: 0,
                min: 0,
            }
        }
        const optimizer = {};
        if (inverterList[i].optimizer) {
            optimizer.make = inverterList[i].optimizer.optimizer.Make;
            optimizer.Manufacturer = inverterList[i].optimizer.optimizer.Manufacturer;
            optimizer.stringRange = {
                max: inverterList[i].optimizer.maxPanelLength,
                min: inverterList[i].optimizer.minPanelLength,
            };
            optimizer.stringLength = inverterList[i].optimizerStringLength;
            optimizer.optimizerPanel = inverterList[i].optimizerPanel;
            optimizer.panelCount = inverterList[i].panelCount;
            optimizer.optimizerCount = inverterList[i].optimizerCount;
            optimizer.maxOptimizerPanelLength = inverterList[i].optimizer.maxOptimizerPanelLength;

            inverter.optimizer = optimizer;
        }
        stringInverters.push(inverter);
    }

    const microInverters = [];
    const microInverterList = stage.ground.microInverters;
    for (let i = 0; i < microInverterList.length; i += 1) {
        let inverter = {
            Manufacturer: microInverterList[i].electricalProperties.Manufacturer,
            Make: microInverterList[i].electricalProperties.Make,
            Size: microInverterList[i].electricalProperties.Size,
            panelCount: microInverterList[i].microInverterArray.length,
            mmptVoltageRange: {
                min: microInverterList[i].electricalProperties.MPPT_Low_V,
                max: microInverterList[i].electricalProperties.MPPT_High_V,
            },
            mmptCount: microInverterList[i].electricalProperties.Number_of_MPPT,
            microInverterCount: microInverterList[i].microInverterArray.length,
            maxString: microInverterList[i].maxString,
        };
        microInverters.push(inverter);
    }
    let totalModules = 0;

    const subarrays = [];
    getSubarrays(stage.ground, subarrays);
    for (let i = 0; i < subarrays.length; i++) {
        totalModules += subarrays[i].getPanels().length;
    }

    const sldSummaryData = {
        totalModules,
        inverters: stringInverters,
        microInverters: microInverters,
        modules: stage.SLDManager.getModules(),
        strings: stage.SLDManager.getStrings(),
        modulesLeft: stage.SLDManager.getNumberOfModulesLeft(),
        isMeterEnabled: stage.SLDManager.getMeterState(),
        toggleMeter: stage.SLDManager.toggleMeter.bind(stage.SLDManager),
        updateSLD: stage.SLDManager.updateSLD.bind(stage.SLDManager),
        autoSize: stage.SLDManager.autoSizeInverters.bind(stage.SLDManager),
        switchToSLD: stage.SLDManager.switchToSLD.bind(stage.SLDManager),
        switchTo3LD: stage.SLDManager.switchTo3LD.bind(stage.SLDManager),
        changeAcDisconnect: stage.SLDManager.changeAcDisconnect.bind(stage.SLDManager),
    };

    serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'SLD', sldSummaryData);
}

function onClickInverterMenu(stage) {
    let inverterToBeDeleted = [];

    const allStringInverters = getInverters(stage);
    const allMicroInverters = stage.ground.microInverters;

    function updateVisualsOfInverters() {
        stage.showInverterIn3D = !stage.showInverterIn3D;
        for (let i = 0, l = allStringInverters.length; i < l; i += 1) {
            allStringInverters[i].updateVisualsBasedOnStates();
        }
    }

    function deleteInverter(deletedInverter, inverters) {
        for (let i in deletedInverter) {
            for (let inverter in inverters) {
                if (deletedInverter[i].id === inverters[inverter].id) {
                    let index = inverters.indexOf(deletedInverter[i]);
                    inverters.splice(index, 1);
                    break;
                }
            }
            deletedInverter[i].startContainer();
            deletedInverter[i].removeObject();
            deletedInverter[i].stopContainer();
        }
        //checkbox todo invertermenu will be selected
        stage.selectionControls.setSelectedObject(stage.ground);
        // onClickInverterMenu(stage);
    }

    const stringInverters = [];
    const microInverters = [];
    const centralInverters = [];

    function getInverter() {
        return this;
    }

    function addMicroInverter(microInverterData) {
        const microInverter = new MicroInverter(stage, microInverterData);
        microInverter.setMaxStringLength();
        stage.ground.microInverters.push(microInverter);
        stage.selectionControls.setSelectedObject(microInverter);
        microInverter.stage.microInverterSelectionMode.initialize(microInverter);
    }

    for (let i = 0, l = allStringInverters.length; i < l; i += 1) {
        stringInverters.push({
            name: allStringInverters[i].name,
            Make: allStringInverters[i].electricalProperties.Make,
            Size: allStringInverters[i].electricalProperties.Size,
            Manufacturer: allStringInverters[i].electricalProperties.Manufacturer,
            inverterType: "stringInverters",
            getInverter: getInverter.bind(allStringInverters[i]),
            removeObject: allStringInverters[i].removeObject.bind(allStringInverters[i]),
            startContainer: stage.stateManager.startContainer.bind(stage.stateManager),
            stopContainer: stage.stateManager.stopContainer.bind(stage.stateManager),
        });
    }

    for (let i = 0, l = allMicroInverters.length; i < l; i += 1) {
        allMicroInverters[i].deSelect();
        microInverters.push({
            name: allMicroInverters[i].name,
            Make: allMicroInverters[i].electricalProperties.Make,
            Size: allMicroInverters[i].electricalProperties.Size,
            Manufacturer: allMicroInverters[i].electricalProperties.Manufacturer,
            stringLength: allMicroInverters[i].stringLength,
            panelCount: allMicroInverters[i].panels.length,
            inverterType: "microInverters",
            getInverter: getInverter.bind(allMicroInverters[i]),
            microInverterCount: Math.ceil(allMicroInverters[i].panels.length / allMicroInverters[i].stringLength),
            removeObject: allMicroInverters[i].removeObject.bind(allMicroInverters[i]),
            startContainer: stage.stateManager.startContainer.bind(stage.stateManager),
            stopContainer: stage.stateManager.stopContainer.bind(stage.stateManager),
        });
    }
    //central inverters get and  push data tobe added

    const inverterSummaryData = {
        stringInverters,
        microInverters,
        centralInverters,
        onClickAddMicroInverter: addMicroInverter,
        onClickAddInverter: stage.editMode.initAddInverter.bind(stage.editMode),
        updateVisualsOfInverters: updateVisualsOfInverters.bind(stage),
        setSelectedObject: stage.selectionControls.setSelectedObject
            .bind(stage.selectionControls),
        showInverterIn3D: stage.showInverterIn3D,
        inverterToBeDeleted: inverterToBeDeleted,
        deleteInverter: deleteInverter,
    };

    serverBus.$emit(CONSTANTS.SET_SAP_PANE, 'INVERTERMENU', inverterSummaryData);
}

export {
    onObjectCreation,
    onObjectSelection,
    onSwitchToSLD,
    onSwitchToCustomImageEditMode,
    onClickInverterMenu,
};
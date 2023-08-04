import API from '@/services/api/';
import axios from 'axios';
import * as THREE from 'three';
import FixedObject from '../../objects/FixedObject';
import Mppt from '../subArray/Mppt';
import DCString from '../subArray/DCString';
import Panel from '../subArray/Panel';
import DcCable from '../../objects/model/cable/DcCable';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    INTERSECTING_AC_COMPONENT_ERROR,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    INVERTER_COLORS,
    VISUAL_STATES,
} from '../visualConstants';
import * as exporters from '../../utils/exporters';
import { getTableCoordinates } from '../../utils/subarrayUtils';
import { getCentroidOfPoints , deg2Rad, getOutlinePoints, rotationAroundPoint, rad2Deg } from '../../utils/utils';
import { findAdjustedAzimuth } from '../../structure/utils/mathUtils';
import DCDB from './DCDB';
import OutlinePoints from '../subObjects/OutlinePoints';
import AcCable from '../model/cable/AcCable';
import utils from '../../../services/api/utils';

export default class Inverter extends FixedObject {
    constructor(stage, inverterSpecifications = {}) {
        super(stage);

        this.stage = stage;
        this.id = this.stage.getInverterId();
        this.name = `Inverter #${this.id.toString()}`;
        this.objectColorMapping = this.getColorMapForObject();

        // Jugaad for inverter colors maintainance.
        this.meshMaterial2D.color.setHex(INVERTER_COLORS.Color[this.id % INVERTER_COLORS.Color.length]);
        this.meshMaterial3D.color.setHex(INVERTER_COLORS.Color[this.id % INVERTER_COLORS.Color.length]);

        this.mppts = [];
        this.acCableAttached = null;
        if (inverterSpecifications.electricalProperties !== undefined) {
            this.electricalProperties = inverterSpecifications.electricalProperties;
        }
        else {
            this.electricalProperties = {};
        }

        if (inverterSpecifications.mppts !== undefined) {
            for (let i = 0, l = inverterSpecifications.mppts.length; i < l; i += 1) {
                const mppt = new Mppt(this, inverterSpecifications.mppts[i].maxStrings);
                this.mppts.push(mppt);
            }
        }

        this.dcCable = {
            moduleToDcdb: {
                cableType: 'Copper',
                cableSizeMM: 1.25,
                cableSizeAWG: 10,
            },
            toInverter: {
                cableType: 'Copper',
                cableSizeMM: 1.25,
                cableSizeAWG: 10,
            },
        };

        this.optimizer = null;
        this.optimizerStringLength = 1;
        this.optimizerPanel = null;
        this.optimizerCount = 0;
        this.panelCount = 0;
        this.optimizerStatus = false;
        this.optimizerList = null;
        this.mpptData = null;
        this.ajbId = -1;
        this.ajb = null;
        this.AJBToggle = false;
        this.cableSize = 4;


        // this.baseHeight = 0;
        // const moduleData = this.getDefaultValues();
        // this.azimuth = moduleData.azimuth;
        // this.moduleDimensions = {
        //     moduleWidth: '1.2',
        //     moduleHeight: '0.3',
        //     moduleDepth: '0.6',
        //     pillarRadius: 0.02,
        // };

        // this.pillarHeight = moduleData.mountHeight;

        // this.prevIntersectingSubarrays = [];

        // this.updateGeometry();

        // this.stage.stateManager.add({
        //     uuid: this.uuid,
        //     getStateCb: () => CREATED_STATE,
        //     withoutContainer: true,
        // });

        // this.updateVisualsAfterLoadingAndCreation();
    }

    getDefaultValues() {
        return this.stage.getDesignSettings().drawing_defaults.inverter;
    }

    getModuleDimensions() {
        return {
            moduleWidth: '1.4',
            moduleHeight: '0.6',
            moduleDepth: '0.6',
            pillarRadius: 0.02,
        };
    }

    getColorMap() {
        if (this.materialAndVisualStatesExist(this.objectColorMapping)) {
            if (this.visualState === VISUAL_STATES.ERROR ||
                this.visualState === VISUAL_STATES.EDGE_HIGHLIGHT ||
                this.visualState === VISUAL_STATES.DRAWING_ERROR ||
                this.visualState === VISUAL_STATES.MIRROR_MODE) {
                return this.objectColorMapping[this.materialState][this.visualState];
            }
            else {
                return {
                    MESH_COLOR: INVERTER_COLORS.Color[ this.id % INVERTER_COLORS.Color.length],
                    EDGE_COLOR: 0x424242,
                    PILLAR_COLOR: 0xA9A9A9,
                }
            }
        }
        return {};
    }

    getColorMapForObject() {
        return COLOR_MAPPINGS.INVERTER;
    }

    getState() {
        const inverterData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            pillarHeight: this.pillarHeight,
            azimuth: this.azimuth,
            ajbUuid: this.ajb ? this.ajb.uuid : null,
            AJBToggle : this.AJBToggle,
            optimizer: this.optimizer,
            optimizerStringLength: this.optimizerStringLength,
            optimizerPanel: this.optimizerPanel,
            optimizerCount: this.optimizerCount,
            panelCount: this.panelCount,
            optimizerStatus: this.optimizerStatus,
            optimizerList: this.optimizerList,

            // saving outline points
            outlinePoints: [...this.outlinePoints],

            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return inverterData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load properties
            this.baseHeight = state.baseHeight;
            this.pillarHeight = state.pillarHeight;
            this.azimuth = state.azimuth;
            this.AJBToggle = state.AJBToggle;
            if (state.ajbUuid !== null) {
                this.ajb = this.stage.getObject(state.ajbUuid);
            }

            this.optimizer = state.optimizer;
            this.optimizerStringLength = state.optimizerStringLength;
            this.optimizerPanel = state.optimizerPanel;
            this.optimizerCount = state.optimizerCount;
            this.panelCount = state.panelCount;
            this.optimizerStatus = state.optimizerStatus;
            this.optimizerList = state.optimizerList;

            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.outlinePoints = [...state.outlinePoints];
            }
            else {
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('Inverter: loadState: vertices length don\'t match');
                    return null;
                }
                this.outlinePoints = [...state.outlinePoints];
            }

            // update geometry
            this.updateGeometry();
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.removeObject();
    }

    saveObject(isCopy = false) {
        const inverterModelData = {
            type: Inverter.getObjectType(),
        };

        // save id and name
        inverterModelData.id = this.id;
        inverterModelData.name = this.name;

        if (isCopy) {
            inverterModelData.uuid = this.uuid;
        }

        inverterModelData.mppts = this.getMpptsData();

        inverterModelData.baseHeight = this.baseHeight;
        inverterModelData.pillarHeight = this.pillarHeight;
        inverterModelData.azimuth = this.azimuth;
        inverterModelData.electricalProperties = this.electricalProperties;
        inverterModelData.dcCable = this.dcCable;
        inverterModelData.AJBToggle = this.AJBToggle;
        if (this.ajb !== null && this.ajb !== undefined) {
            inverterModelData.ajbId = this.ajb.getId();
        }
        else {
            inverterModelData.ajbId = -1;
        }

        inverterModelData.optimizer = this.optimizer;
        inverterModelData.optimizerList = this.optimizerList;
        inverterModelData.optimizerStringLength = this.optimizerStringLength;
        inverterModelData.optimizerPanel = this.optimizerPanel;
        inverterModelData.optimizerCount = this.optimizerCount;
        inverterModelData.panelCount = this.panelCount;
        inverterModelData.optimizerStatus = this.optimizerStatus;

        inverterModelData.outlinePoints = [...this.outlinePoints];
        return inverterModelData;
    }

    validateObject(inverterModelData) {
        let lessOutlinePoints = false;
        if (inverterModelData.outlinePoints.length < 4){
            lessOutlinePoints = true;
        }
        if (lessOutlinePoints) {
            return { isValid: false };
        }

        let allOutlinePointsZero = false;
        for (let i = 0, len = inverterModelData.outlinePoints.length; i < len; i += 1) {
            if ((inverterModelData.outlinePoints[i][0] === 0 &&
            inverterModelData.outlinePoints[i][1] === 0 &&
            inverterModelData.outlinePoints[i][2] === 0)) {
                allOutlinePointsZero = true;
                break;
            }
        }
        if (allOutlinePointsZero) {
            return { isValid: false };
        }

        let nanPoints = false;
        for (let i = 0; i < 4; i += 1) {
            if ((Number.isNaN(inverterModelData.outlinePoints[i][0]) ||
            Number.isNaN(inverterModelData.outlinePoints[i][1]) ||
            Number.isNaN(inverterModelData.outlinePoints[i][2]))) {
                nanPoints = true;
                break;
            }
        }
        if (nanPoints) {
            return { isValid: false };
        }
        else{
            return { isValid: true };
        }
    }

    loadObject(inverterModelData, isPaste = false) {
        if (!this.validateObject(inverterModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Inverter data invalid: Inverter removed');
            return;
        }
        // load id and name
        if (!isPaste) {
            this.id = inverterModelData.id;
            this.name = inverterModelData.name;
        }

        this.baseHeight = inverterModelData.baseHeight;
        this.pillarHeight = inverterModelData.pillarHeight;
        this.azimuth = inverterModelData.azimuth;
        this.AJBToggle = inverterModelData.AJBToggle;
        if (inverterModelData.ajbId !== undefined) {
            this.ajbId = inverterModelData.ajbId;
        }

        this.optimizer = inverterModelData.optimizer;
        this.optimizerList = inverterModelData.optimizerList;
        this.optimizerStringLength = inverterModelData.optimizerStringLength;
        this.optimizerPanel = inverterModelData.optimizerPanel;
        this.optimizerCount = inverterModelData.optimizerCount;
        this.panelCount = inverterModelData.panelCount;
        this.optimizerStatus = inverterModelData.optimizerStatus;

        this.outlinePoints = this.manupilateOldInverterOutlinePoints(inverterModelData);

        this.electricalProperties = inverterModelData.electricalProperties;

        if (inverterModelData.mppts !== undefined) {
            this.mpptsData = inverterModelData.mppts;
        }

        if (inverterModelData.dcCable !== undefined) {
            this.dcCable.moduleToDcdb = inverterModelData.dcCable.moduleToDcdb;
            this.dcCable.toInverter = inverterModelData.dcCable.toInverter;
        }

        // Backward compatibility for string range
        // can be removed after June 2021
        if (inverterModelData.stringRange !== undefined) {
            if (this.mpptsData !== undefined) {
                for (const mpptData of this.mpptsData) {
                    mpptData.stringRange = inverterModelData.stringRange;
                 }
            }
        }

        // update geometry
        this.updateGeometry();
        this.updateVisualsBasedOnStates();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    loadAjb(allAjbs) {
        if (this.ajbId !== -1) {
            for (let i = 0, l = allAjbs.length; i < l; i += 1) {
                if (this.ajbId === allAjbs[i].getId()) {
                    this.ajb = allAjbs[i];
                    allAjbs[i].linkedInverter = this;
                    this.ajb.setToInverterColor();
                    this.drawCableDcdbToInverter();
                }
            }
        }
    }

    loadDcCables(allCables) {
        for(let i=0; i<allCables.length; i++) {
            if(allCables[i].data.inverterId == this.id) {
                allCables[i].cable.inverter = this;
                if(allCables[i].cable instanceof AcCable) {
                    this.acCableAttached = allCables[i].cable;
                }
                else{
                    allCables[i].cable.cableSize = this.cableSize;
                }
                allCables[i].cable.loadObject(allCables[i].data, allCables[i].isPaste);
            }
        }
    }

    loadAcdb(allAcdb) {
        for(let i=0; i<allAcdb.length; i++) {
            allAcdb[i].acdb.loadObject(allAcdb[i].data, allAcdb[i].isPaste);
        }
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.setObjectOutOfGroundError();
            }
            else if (error.message === INTERSECTING_AC_COMPONENT_ERROR) {
                this.objectRemoved();
            }

            this.removeObject();
            return Promise.reject(error);
        }
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);

        // really?
        this.baseHeight = newHeight;
        this.updateGeometry();

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        try {
            await this.handleSiblingConsequences();

            this.resetGrandParentSolarAccess();

            // Saving state after the object is placed
            if(this.acCableAttached != null) {
                this.acCableAttached.acdbAttached.placeObject();
            }
            this.moveDcCables();
            this.saveState();
            
        }
        catch (error) {
            console.error('ERROR: Inverter: placeObject failed', error);
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    }

    moveDcCables() {
        // dc cable disabled
        // const mpptDetails = this.mppts;
        // const inverterEndOne = new THREE.Vector3((this.outlinePoints[0][0] + this.outlinePoints[3][0])/2,  this.outlinePoints[0][1], 0);
        // const inverterEndTwo = new THREE.Vector3((this.outlinePoints[1][0] + this.outlinePoints[2][0])/2,  this.outlinePoints[1][1], 0);
        // for (let i = 0, len = mpptDetails.length; i < len; i += 1) {
        //     for (let j = 0, StLen = mpptDetails[i].strings.length; j < StLen; j += 1) {
        //         if(mpptDetails[i].strings[j].attachedDcCable == undefined) continue;
        //         const cable1 = mpptDetails[i].strings[j].attachedDcCable[0];
        //         const cable2 = mpptDetails[i].strings[j].attachedDcCable[1];
        //         cable1.inverterEnd = inverterEndOne;
        //         cable2.inverterEnd = inverterEndTwo;
        //         cable1.updateAutoRoutingBrokenOutlinePoints();
        //         cable2.updateAutoRoutingBrokenOutlinePoints();
        //         cable1.placeObject();
        //         cable2.placeObject();
        //     }
        // }
    }

    // TODO: remove this?
    // drawDcCables(inverterEndX, inverterEndY, stringEnd) {
    //     const dcCable = new DcCable(this.stage);
    //     dcCable.setInverterId(this.mppt.inverter.getId());
    //     dcCable.setInverterColor();
    //     const vertices = [];
    //     vertices.push(new THREE.Vector3(inverterEndX, inverterEndY, 0))
    //     vertices.push(stringEnd);
    //     dcCable.drawCableBetween2Points(vertices);
    //     return dcCable;
    // }

    //TODO : this function can be removed after May 2021
    manupilateOldInverterOutlinePoints(inverterModelData) {
        const centroid = getCentroidOfPoints(inverterModelData.outlinePoints);
        const vertices = getTableCoordinates(
            [centroid.x, centroid.y, 0], 1,
            1, this.moduleDimensions.moduleWidth, this.moduleDimensions.moduleHeight,
            this.azimuth, 0,
            0, 0,
            0,
        )[0].corners;

        return vertices;
    }

    loadMpptsData() {
        if (this.mpptsData !== undefined && this.mpptsData !== null) {
            const allSubarrays = [];
            exporters.getSubarrays(this.stage.ground, allSubarrays);

            this.mppts = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const mpptData of this.mpptsData) {
                const mppt = new Mppt(this, mpptData.maxStrings);
                if (mpptData.suggestedStringCount !== undefined) {
                    mppt.suggestedStringCount = mpptData.suggestedStringCount;
                }
                this.mppts.push(mppt);
                mppt.setStringRange({
                    min: mpptData.stringRange.minimum,
                    max: mpptData.stringRange.maximum,
                });

                let linkedSubarrayId = null;
                if (mpptData.linkedSubarraysIds !== undefined &&
                    mpptData.linkedSubarraysIds[0] !== undefined) {
                    linkedSubarrayId = mpptData.linkedSubarraysIds[0];
                }
                // eslint-disable-next-line no-restricted-syntax
                for (const string of mpptData.strings) {
                    const linkedPanels = [];
                    // eslint-disable-next-line no-restricted-syntax
                    for (const linkedPanelId of string.linkedPanelIds) {
                        // eslint-disable-next-line no-restricted-syntax
                        for (const subarray of allSubarrays) {
                            if (subarray.getId() === linkedPanelId.subarrayId) {
                                const panel = subarray.getPanelWithId(linkedPanelId.panelId);
                                if (panel !== null) {
                                    linkedPanels.push(panel);
                                    if (linkedSubarrayId === null) {
                                        linkedSubarrayId = subarray.getId();
                                    }
                                }
                            }
                        }
                    }
                    const dcString = new DCString(this.stage, mppt, this.objectsGroup);
                    dcString.id = string.id;
                    mppt.addString(dcString);
                    dcString.loadObject(linkedPanels);
                }
                if(!linkedSubarrayId){
                    linkedSubarrayId = allSubarrays[0].getId();
                }
                for (const subarray of allSubarrays) {
                    if (linkedSubarrayId === subarray.getId()) {
                        mppt.linkedSubarray = subarray;
                    }
                }
            }
        }
    }

    getInverterMake() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Make;
        }
        return 'NA';
    }

    getInverterManufacturer() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Manufacturer;
        }
        return 'NA';
    }

    /**
     * returns ac size in watts
     */
    getAcSize() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Size * 1000;
        }
        return 1;
    }

    /**
     * returns dc size in watts
     */
    getDcSize() {
        let totalDcSize = 0;
        for (let i = 0, l = this.mppts.length; i < l; i += 1) {
            totalDcSize += this.mppts[i].getDcSize();
        }
        return totalDcSize * 1000;
    }

    /**
     * gets all the panels in this inverter
     */
    getAllLinkedPanels() {
        const panels = [];
        for (let i = 0, l = this.mppts.length; i < l; i += 1) {
            panels.push(...this.mppts[i].getAllLinkedPanels())
        }
        return panels;
    }

    getNumberOfMppts() {
        return this.mppts.length;
    }

    getElectricalMap() {
        if (this.electricalProperties !== undefined) {
            const inverter = {
                inverterDatabaseId: this.electricalProperties !== undefined ?
                    this.electricalProperties.id : 0,
                inverterMake: this.electricalProperties.Make,
                inverterManufacturer: this.electricalProperties.Manufacturer,
                electricalProperties: this.electricalProperties,
                mppts: this.getMpptsData(),
            };
            if(this.optimizerStatus){
                inverter.optimizerId = this.optimizer.optimizer.id ;
                inverter.optimizerStringLength = this.optimizerStringLength;
                inverter.optimizerMake = this.optimizer.optimizer.Make;
                inverter.optimizerCount = this.optimizerCount;
            }
            return inverter;
        }
        return {};
    }

    getMpptsData() {
        const mppts = [];
        for (let i = 0, l = this.mppts.length; i < l; i += 1) {
            mppts.push(this.mppts[i].getMpptMap());
        }
        return mppts;
    }

    getStringsCoordinates() {
        const stringsCoordinates = [];
        for (let i = 0, l = this.mppts.length; i < l; i += 1) {
            stringsCoordinates.push(...this.mppts[i].getStringsCoordinates());
        }
        return stringsCoordinates;
    }

    getOptimizersCoordinates() {
        const optimizerCoordinates = [];
        for (let i = 0, l = this.mppts.length; i < l; i += 1) {
            optimizerCoordinates.push(...this.mppts[i].getOptimizersCoordinates());
        }
        return optimizerCoordinates;
    }

    async setStringingData(moduleID) {
        if (this.electricalProperties.id !== 0 && this.electricalProperties.id !== undefined) {
            try {
                const invertereStringingData =
                    await API.DESIGNS.FETCH_INVERTER_STRINGING_INFO(this.stage.getDesignId(), {
                        moduleID,
                        inverterID: this.electricalProperties.id,
                    });
                let stringRange = {};
                if(this.optimizerStatus){
                    stringRange = {
                        min: this.optimizer.minPanelLength,
                        max: this.optimizer.maxPanelLength
                    }
                }else{
                    stringRange = {
                        min: invertereStringingData.data.min,
                        max: invertereStringingData.data.max,
                    };
                }
                for (let i = 0, l = this.mppts.length; i < l; i += 1) {
                    this.mppts[i]
                        .setSuggestedStringCount(invertereStringingData.data.stringSuggestion[i]);
                    this.mppts[i]
                        .setStringRange(stringRange);
                }
            }
            catch (error) {
                console.error('Inverter.js: Cannot load inverter stringing data');
            }
        }
    }

    async callOptimizerAndStringingApi(moduleID){
        await this.getOptimizerList(moduleID);
        await this.setStringingData(moduleID);
    }

    setDcCableProperties(dcCableProperties) {
        this.dcCable.moduleToDcdb.cableType = dcCableProperties.moduleToDcdb.cableType;
        this.dcCable.moduleToDcdb.cableSizeMM = dcCableProperties.moduleToDcdb.cableSizeMM;
        this.dcCable.moduleToDcdb.cableSizeAWG = dcCableProperties.moduleToDcdb.cableSizeAWG;
        this.dcCable.toInverter.cableType = dcCableProperties.toInverter.cableType;
        this.dcCable.toInverter.cableSizeMM = dcCableProperties.toInverter.cableSizeMM;
        this.dcCable.toInverter.cableSizeAWG = dcCableProperties.toInverter.cableSizeAWG;
    }

    setObjectOutOfGroundError() {
        this.stage.eventManager.setInverterOutOfGroundRemoved();
    }

    objectRemoved() {
        this.stage.eventManager.inverterRemoved();
    }

    onSelect() {
        super.onSelect();
        this.verifyForPanelDeleted();
        for (let i = 0; i < this.mppts.length; i += 1) {
            for (let j = 0; j < this.mppts[i].strings.length; j += 1) {
                this.mppts[i].strings[j].editStringColor();
            }
        }
    }

    deSelect() {
        super.deSelect();
        if (!this.stage.viewManager.showStringing) {
            const invertersArray = exporters.getInverters(this.stage);
            for (let i = 0; i < invertersArray.length; i++) {
                if (invertersArray[i]) {
                    const mpptsArray = invertersArray[i].mppts;
                    for (let j = 0; j < mpptsArray.length; j += 1) {
                        for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                            mpptsArray[j].strings[k].hideStringColor();
                        }
                    }
                }
            }
        }
    }

    // Jugaad function
    verifyForPanelDeleted() {
        for (let i = 0; i < this.mppts.length; i += 1) {
            for (let j = 0; j < this.mppts[i].strings.length; j += 1) {
                this.mppts[i].strings[j].verifyForPanelDeleted();
            }
        }
    }

    removeInverterFromSubarray() {
        const subarrays = [];
        exporters.getSubarrays(this.stage.ground, subarrays);
        for (let i = 0, l = subarrays.length; i < l; i += 1) {
            subarrays[i].removeInverter(this);
        }
    }

    // jugad fix - home summary issue (when select different inverter while adding)
    removePrevInverterWhileAdding() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    removeObject() {
        if (this.ajb) {
            this.ajb.removeObject();
            this.ajb = null;
        }

        super.removeObject();
        for (let i = 0, l = this.mppts.length; i < l; i ++) {
            // dc cable disabled
            // also this is supposed to be handled in dc strings
            // for( let j = 0 ; j < this.mppts[i].strings.length ; j++){
            //     if(this.mppts[i].strings[j].attachedDcCable[0].length > 0){
            //         this.mppts[i].strings[j].attachedDcCable[0].removeObject();
            //         this.mppts[i].strings[j].attachedDcCable[1].removeObject();
            //     }
            // }
            this.mppts[i].removeObject(true);
        }
        if (this.acCableAttached) {
            this.acCableAttached.acdbAttached.deleteAcCable(this);
        }
    }

    async getOptimizerList(moduleId) {
        try {
            const requestBody = {"moduleID":moduleId,"inverterID":this.electricalProperties.id};
            const resp = await axios.post(`api/designs/${this.stage.getDesignId()}/get_optimizer_list/`, requestBody);

            this.optimizerList = resp.data.optimizerList;
            this.optimizerStatus = resp.data.status;

            this.optimizer = this.optimizerList[Object.keys(this.optimizerList)[0]];

            return this.optimizerList ;
        } catch (error) {
            console.error(error);
        }
    }

    static getObjectType() {
        return 'Inverter';
    }

    createAJB() {
        this.ajb = new DCDB(this.stage);
        this.ajb.linkedInverter = this;
        this.ajb.setToInverterColor();
        this.ajb.updateVisualsBasedOnStates();
        const pos = this.getPosition();
        // const angle = deg2Rad(findAdjustedAzimuth(this.azimuth));
        this.ajb.placeObject(pos.x + 1, pos.y);
        this.ajb.saveState();
    }

    drawCableDcdbToInverter() {
        // dc cable disabled
        // const ajbEndOne = new THREE.Vector3((this.ajb.outlinePoints[0][0] + this.ajb.outlinePoints[3][0])/2,  this.ajb.outlinePoints[0][1], 0);
        // const ajbEndTwo = new THREE.Vector3((this.ajb.outlinePoints[1][0] + this.ajb.outlinePoints[2][0])/2,  this.ajb.outlinePoints[1][1], 0);
        // for(let i=0; i<this.mppts.length; i++) {
        //     const strings = this.mppts[i].strings;
        //     for(let j=0; j<strings.length; j++) {
        //         this.ajb.dcCablesAttached = true;
        //         const cable1 = strings[j].attachedDcCable[0];
        //         const cable2 = strings[j].attachedDcCable[1];
        //         cable1.ajbEnd = ajbEndOne;
        //         cable2.ajbEnd = ajbEndTwo;
        //         cable1.updateAutoRoutingBrokenOutlinePoints();
        //         cable2.updateAutoRoutingBrokenOutlinePoints();
        //         cable1.placeObject();
        //         cable2.placeObject();
        //         strings[j].attachedDcCable[0] = cable1;
        //         strings[j].attachedDcCable[1] = cable2;
        //     }
        // }
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        const currentPosition = this.getPosition();
        const outlineDeltaXY = rotationAroundPoint(
            centroidPoint.x,
            centroidPoint.y,
            currentPosition.x,
            currentPosition.y,
            angleInRad,
        );
        this.moveObject(outlineDeltaXY[0] - currentPosition.x, outlineDeltaXY[1] - currentPosition.y);
        const calcAzimuth = parseFloat((this.azimuth - rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;
        this.updateRotation();
    }

    removeCableDcdbToInverter() {
        // dc cable disabled
        // if(this.ajb.dcCablesAttached == true) {
        //     this.ajb.dcCablesAttached = false;
        //     for(let i=0; i<this.mppts.length; i++) {
        //         const strings = this.mppts[i].strings;
        //         for(let j=0; j<strings.length; j++) {
        //             let cable1 = strings[j].attachedDcCable[0];
        //             let cable2 = strings[j].attachedDcCable[1];
        //             cable1.updateAutoRoutingBrokenOutlinePoints();
        //             cable2.updateAutoRoutingBrokenOutlinePoints();
        //             cable1.placeObject();
        //             cable2.placeObject();  
        //             strings[j].attachedDcCable[0] = cable1;
        //             strings[j].attachedDcCable[1] = cable2;
        //         }
        //     }
        // }
    }
}

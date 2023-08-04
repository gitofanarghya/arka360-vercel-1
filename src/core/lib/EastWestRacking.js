import { CREATED_STATE, DELETED_STATE, PANEL_ORIENTATION_LANDSCAPE, PANEL_ORIENTATION_PORTRAIT, ROW_SPACING_MODE_AUTO, SUBARRAY_RACK_STYLE_EWRACKING } from "../coreConstants";
import * as THREE from 'three';
import * as JSTS from 'jsts';
import ACDB from "../objects/ac/ACDB";
import DCDB from "../objects/ac/DCDB";
import Inverter from "../objects/ac/Inverter";
import CylinderModel from "../objects/model/CylinderModel";
import Handrail from "../objects/model/Handrail";
import PolygonModel from "../objects/model/PolygonModel";
import Tree from "../objects/model/Tree";
import Walkway from "../objects/model/Walkway";
import Dormer from "../objects/model/smartroof/Dormer";
import SmartroofFace from "../objects/model/smartroof/SmartroofFace";
import Row from "../objects/subArray/Row";
import Subarray from "../objects/subArray/Subarray";
import OutlinePoints from "../objects/subObjects/OutlinePoints";
import * as JSTSConverter from '../utils/JSTSConverter';
import * as utils from "../utils/utils";
import { getDynamicOffsetBasedOnArea, getEdgesFromGeometry, getRays, localToGlobalCoordinates } from "../utils/subarrayUtils";
import { gazeboAllowedModules } from "../../constants";
const WALKWAY = 'Walkway';

export default class EastWestRack extends Subarray {
    constructor(stage, properties = null, eastSubarrayFlag = true) {
        super(stage);
        this.structureType = 'Low Foundation Fixed Tilt';
        let defaultEastWestProperties;
        if (properties) {
            defaultEastWestProperties = properties;
        }
        else {
            defaultEastWestProperties = this.getEastWestRackingProperties();
        }
        this.moduleProperties.moduleId = defaultEastWestProperties.moduleProperties.moduleId;
        this.azimuth = defaultEastWestProperties.azimuth;
        this.mountHeight = defaultEastWestProperties.mountHeight;
        this.tilt = defaultEastWestProperties.tilt;
        this.intraRowSpacing = defaultEastWestProperties.intraRowSpacing;
        this.interRowSpacingMode = defaultEastWestProperties.interRowSpacingMode;
        this.interRowSpacing = defaultEastWestProperties.interRowSpacing;
        this.eastSubarrayFlag = eastSubarrayFlag;
        this.eastWestRackingEnabled = true;
        this.objectType = 'EastWestRack';
    }

    saveObject() {
        let ewRackData = {
            type: EastWestRack.getObjectType(),
        };

        // save id and name
        ewRackData.id = this.id;
        ewRackData.name = this.name;
        ewRackData.addTableFlow = this.addTableFlow;
        // save subarray properties
        ewRackData.moduleProperties = {
            moduleId: this.moduleProperties.moduleId,
            moduleMake: this.moduleProperties.moduleMake,
            moduleSize: this.moduleProperties.moduleSize,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
        };
        ewRackData.panelProperties = this.panelProperties;
        // ewRackData.rowSpacing = this.rowSpacing;
        // ewRackData.rowSpacingMode = this.rowSpacingMode;
        ewRackData.tilt = this.tilt;
        ewRackData.structureType = this.structureType;
        ewRackData.azimuth = this.azimuth;
        ewRackData.panelOrientation = this.panelOrientation;
        ewRackData.mountHeight = this.mountHeight;
        ewRackData.tableSizeUp = this.tableSizeUp;
        ewRackData.tableSizeWide = this.tableSizeWide;
        ewRackData.tableSpacing = this.tableSpacing;
        ewRackData.moduleSpacingUp = this.moduleSpacingUp;
        ewRackData.moduleSpacingWide = this.moduleSpacingWide;
        ewRackData.mountType = this.mountType;
        ewRackData.inverterLerpPosition = this.inverterLerpPosition;
        ewRackData.eastWestRackingEnabled = this.eastWestRackingEnabled;
        ewRackData.interRowSpacing = this.interRowSpacing;
        ewRackData.intraRowSpacing = this.intraRowSpacing;
        ewRackData.interRowSpacingMode = this.interRowSpacingMode;
        if (this.eastWestRackingEnabled && this.linkedSubarray) {
            ewRackData.linkedSubarrayID = this.linkedSubarray.getId();
        }
        // ewRackData.linkedSubarray = this.linkedSubarray;
        ewRackData.rackParent = this.rackParent;
        if (this.eastWestSubarray) ewRackData.eastWestSubarraydata = this.eastWestSubarray.saveObject()
        ewRackData.inverterIds = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            ewRackData.inverterIds.push(this.inverters[i].id);
        }
        ewRackData.bifacialEnabled = this.bifacialEnabled;

        // saving outline points
        let outlinePoints = [];
        for (let outlinePoint of this.outlinePoints) {
            outlinePoints.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ])
        }
        ewRackData.outlinePoints = outlinePoints;

        // save subarray map
        ewRackData.subarrayMap = this.getSubarrayMap();
        return ewRackData;
    }

    // this can be used later
    // getState() {
    //     // IMPORTANT: Currently not handeling the case when we delete of inverter
    //     // const linkedMppts = [];
    //     // for (let i = 0, l = this.linkedMppts.length; i < l; i += 1) {
    //     //     linkedMppts.push(this.linkedMppts[i]);
    //     // }
    //     const obj =  {
    //         type: Subarray.getObjectType(),
    //         uuid: this.uuid,
    //         id: this.id,
    //         name: this.name,
    //         addTableFlow: this.addTableFlow,
    //         moduleProperties: {
    //             moduleId: this.moduleProperties.moduleId,
    //             moduleMake: this.moduleProperties.moduleMake,
    //             moduleSize: this.moduleProperties.moduleSize,
    //             moduleLength: this.moduleProperties.moduleLength,
    //             moduleWidth: this.moduleProperties.moduleWidth,
    //         },
    //         panelProperties: this.panelProperties,
    //         mountType: this.mountType,
    //         rowSpacing: this.rowSpacing,
    //         rowSpacingMode: this.rowSpacingMode,
    //         tilt: this.tilt,
    //         structureType: this.structureType,
    //         azimuth: this.azimuth,
    //         panelOrientation: this.panelOrientation,
    //         mountHeight: this.mountHeight,
    //         tableSizeUp: this.tableSizeUp,
    //         tableSizeWide: this.tableSizeWide,
    //         tableSpacing: this.tableSpacing,
    //         moduleSpacingUp: this.moduleSpacingUp,
    //         moduleSpacingWide: this.moduleSpacingWide,
    //         eastWestRackingEnabled: this.eastWestRackingEnabled,
    //         interRowSpacing : this.interRowSpacing,
    //         intraRowSpacing : this.intraRowSpacing,
    //         eastWestSubarray: this.eastWestSubarray.getState(),
    //         rackParent: this.rackParent,
    //         outlinePoints: this.outlinePoints.map(outlinePoint => [
    //             outlinePoint.getPosition().x,
    //             outlinePoint.getPosition().y,
    //             outlinePoint.getPosition().z,
    //         ]),
    //         parent: this.getParent() ? this.getParent().uuid : null,
    //         boundingBox: this.getBoundingBox(),
    //         inverterLerpPosition: this.inverterLerpPosition,
    //         // IMPORTANT: Currently not handeling the case when we delete of invertes
    //         // linkedMppts,
    //         // inverters: this.inverters,
    //     };
    //     return obj;
    // }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;
            this.addTableFlow = state.addTableFlow;
            // load subarray properties
            this.moduleProperties = {
                moduleId: state.moduleProperties.moduleId,
                moduleMake: state.moduleProperties.moduleMake,
                moduleSize: state.moduleProperties.moduleSize,
                moduleLength: state.moduleProperties.moduleLength,
                moduleWidth: state.moduleProperties.moduleWidth,
            };
            this.panelProperties = state.panelProperties;
            this.mountType = state.mountType;
            this.structureType = state.structureType; // TBC what is load state
            this.tilt = state.tilt;
            this.azimuth = state.azimuth;
            this.panelOrientation = state.panelOrientation;
            this.mountHeight = state.mountHeight;
            this.tableSizeUp = state.tableSizeUp;
            this.tableSizeWide = state.tableSizeWide;
            this.tableSpacing = state.tableSpacing;
            this.moduleSpacingUp = state.moduleSpacingUp;
            this.moduleSpacingWide = state.moduleSpacingWide;
            this.eastWestRackingEnabled = state.eastWestRackingEnabled;
            this.interRowSpacing = state.interRowSpacing;
            this.intraRowSpacing = state.intraRowSpacing;
            this.eastWestSubarray = state.eastWestSubarray,
            this.rackParent = state.rackParent,
            this.boundingBox = state.boundingBox;
            this.inverterLerpPosition = state.inverterLerpPosition;
            // IMPORTANT: Currently not handeling the case when we delete an inverter
            // this.inverters = state.inverters;
            // this.linkedMppts = [];
            // for (let i = 0, l = state.linkedMppts.length; i < l; i += 1) {
            //     this.linkedMppts.push(state.linkedMppts[i]);
            // }
            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }
            this.associatedModel = this.getParent();

            this.validateStructures();

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
            }
            else {
                // update outline points
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('PolygonModel: loadState: outlinePoints length don\'t match');
                    return null;
                }
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            }
            // update geometry
            this.updateGeometry();
        }
        // Jugaad fix for EWR
        if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
            this.showMergedMeshes();
        }
    }

    // clearState() {
    //     // select ground if selected
    //     if (this.stage.selectionControls.getSelectedObject() === this) {
    //         this.stage.selectionControls.setSelectedObject(this.stage.ground);
    //     }

    //     this.stage.quadTreeManager.removeObject(this);
    //     // Jugaad fix for EWR
    //     this.getChildren().forEach((row) => {
    //         row.getChildren().forEach((table) => {
    //             this.stage.sceneManager.scene.remove(table.objectsGroup);
    //         })
    //     })
    //     this.hideMergedMeshes()
    //     this.stage.sceneManager.scene.remove(this.objectsGroup);
    //     //updating the rails after redo on delete
    //     let prevParent;
    //     if (this.getParent() !== null) {
    //         prevParent = this.getParent();
    //         this.getParent().removeChild(this);
    //         if (prevParent instanceof SmartroofFace) {
    //             prevParent.updateRails();
    //             prevParent.updateAttachments();
    //         }
    //         prevParent = null;
    //     }
    //     // Remove outline points
    //     for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
    //         this.outlinePoints[i].removeObject();
    //         this.outlinePoints.splice(i, 1);
    //     }
    // }

    getState() {
        // IMPORTANT: Currently not handeling the case when we delete of inverter
        // const linkedMppts = [];
        // for (let i = 0, l = this.linkedMppts.length; i < l; i += 1) {
        //     linkedMppts.push(this.linkedMppts[i]);
        // }
        const obj =  {
            type: Subarray.getObjectType(),
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            addTableFlow: this.addTableFlow,
            moduleProperties: {
                moduleId: this.moduleProperties.moduleId,
                moduleMake: this.moduleProperties.moduleMake,
                moduleSize: this.moduleProperties.moduleSize,
                moduleLength: this.moduleProperties.moduleLength,
                moduleWidth: this.moduleProperties.moduleWidth,
            },
            panelProperties: this.panelProperties,
            mountType: this.mountType,
            rowSpacing: this.rowSpacing,
            rowSpacingMode: this.rowSpacingMode,
            tilt: this.tilt,
            structureType: this.structureType,
            azimuth: this.azimuth,
            panelOrientation: this.panelOrientation,
            mountHeight: this.mountHeight,
            tableSizeUp: this.tableSizeUp,
            tableSizeWide: this.tableSizeWide,
            tableSpacing: this.tableSpacing,
            moduleSpacingUp: this.moduleSpacingUp,
            moduleSpacingWide: this.moduleSpacingWide,
            eastWestRackingEnabled: this.eastWestRackingEnabled,
            interRowSpacing : this.interRowSpacing,
            interRowSpacingMode : this.interRowSpacingMode,
            intraRowSpacing : this.intraRowSpacing,
            eastWestSubarray: this.eastWestSubarray,
            rackParent: this.rackParent,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
            boundingBox: this.getBoundingBox(),
            inverterLerpPosition: this.inverterLerpPosition,
            // IMPORTANT: Currently not handeling the case when we delete of invertes
            // linkedMppts,
            // inverters: this.inverters,
        };
        return obj;
    }

    getSubarrayMap(forSolar = false) {
        if ((!this.getParent()) && this.rackSubarray) {
            this.changeParent(this.getParent() ? this.getParent() : this.rackSubarray.getParent());
        }
        let subarrayMap = {
            uuid: this.getUUID(),
            id: this.id,
            name: this.name,
            tilt: parseFloat(this.tilt),
            // To be Tested the structure type thing
            structureType: this.structureType,
            rowSpacing: this.interRowSpacing,
            interRowSpacing: this.interRowSpacing,
            azimuth: this.azimuth,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
            landscape: this.panelOrientation === PANEL_ORIENTATION_LANDSCAPE,
            mountHeight: this.mountHeight,
            frameSizeUp: this.tableSizeUp,
            frameSizeWide: this.tableSizeWide,
            frameSpacing: this.tableSpacing,
            moduleSpacingUp: this.moduleSpacingUp,
            moduleSpacingWide: this.moduleSpacingWide,
            associatedObstacle: this.associatedModel ? this.associatedModel.id : null,
            surfaceTilt: this.objectType === 'Gazebo' ? 0 : this.getParent().getTilt(),
            moduleProperties: this.moduleProperties,
            panelProperties: this.panelProperties,
            rows: [],
            bifacialEnabled: this.bifacialEnabled,
        };
        if (forSolar) {
            subarrayMap.azimuth = _.round(this.getAzimuthIn3D(), 2);
        }
        for (let row of this.getChildren()) {
            const rowMap = row.getRowMap();
            if(rowMap.frames.length > 0) subarrayMap.rows.push(rowMap);
        }
        return subarrayMap;
    }

    async loadObject(ewRackData, parentModel, isPaste = false) {
        // load id and name
        // if (!ewRackData.rackParent && ewRackData.eastWestRackingEnabled) return;
        if (!isPaste) {
            this.id = ewRackData.id;
            this.name = ewRackData.name;
        }

        this.addTableFlow = ewRackData.addTableFlow;
        // load subarray properties
        this.moduleProperties = {
            moduleId: ewRackData.moduleProperties.moduleId,
            moduleMake: ewRackData.moduleProperties.moduleMake,
            moduleSize: ewRackData.moduleProperties.moduleSize,
            moduleLength: ewRackData.moduleProperties.moduleLength,
            moduleWidth: ewRackData.moduleProperties.moduleWidth,
        };
        this.panelProperties = ewRackData.panelProperties;
        // this.rowSpacing = ewRackData.rowSpacing;
        // this.rowSpacingMode = ewRackData.rowSpacingMode;
        this.tilt = ewRackData.tilt;
        this.structureType = ewRackData.structureType;
        this.azimuth = ewRackData.azimuth;
        this.panelOrientation = ewRackData.panelOrientation;
        this.mountHeight = ewRackData.mountHeight;
        this.tableSizeUp = ewRackData.tableSizeUp;
        this.tableSizeWide = ewRackData.tableSizeWide;
        this.tableSpacing = ewRackData.tableSpacing;
        this.moduleSpacingUp = ewRackData.moduleSpacingUp;
        this.moduleSpacingWide = ewRackData.moduleSpacingWide;
        this.mountType = ewRackData.mountType;
        this.bifacialEnabled = ewRackData.bifacialEnabled;
        this.eastWestRackingEnabled = ewRackData.eastWestRackingEnabled;
        this.rackParent = ewRackData.rackParent;
        this.interRowSpacing = ewRackData.interRowSpacing;
        this.intraRowSpacing = ewRackData.intraRowSpacing;
        this.interRowSpacingMode = ewRackData.interRowSpacingMode;
        // this.linkedSubarray = ewRackData.linkedSubarray;
        if (ewRackData.inverterLerpPosition !== undefined) {
            this.inverterLerpPosition = ewRackData.inverterLerpPosition;
        }

        // load subarray outline vertices (points)
        if (parentModel !== null) {
            this.associatedModel = parentModel;
            this.associatedModel.addChild(this);
        }

        if (ewRackData.inverterIds !== undefined) {
            this.inverterIds = ewRackData.inverterIds;
        }
        // load inverters accoding to this..
        // if (ewRackData.inverterIds !== undefined) {
        //     for (let i = 0, l = ewRackData.inverterIds.length; i < l; i += 1) {
        //         this.inverterIds.push(ewRackData.inverterIds);
        //     }
        // }

        // TODO: Identify the real cause
        if (ewRackData.outlinePoints.length === 0) {
            if (ewRackData.subarrayMap.rows.length === 0) {
                this.removeObject();
                return;
            }
            let coordinatePoints = [];
            for (let row of ewRackData.subarrayMap.rows) {
                for (let table of row.frames) {
                    for (let panel of table.panels) {
                        for (let corner of panel.corners) {
                            coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                        }
                    }
                }
            }
            let convexHullCoordinates = new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints).convexHull().getCoordinates().slice(0, -1);
            ewRackData.outlinePoints = convexHullCoordinates.map(coordinate => [coordinate.x, coordinate.y, 0]);
        }

        // set outline points
        for (let outlinePoint of ewRackData.outlinePoints) {
            this.outlinePoints.push(
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage
                )
            );
        }

        // update geometry
        this.updateGeometry();
        if (ewRackData.eastWestSubarraydata) {
            const ewRack = new EastWestRack(this.stage);
            ewRack.loadObject(ewRackData.eastWestSubarraydata, this.getParent(), isPaste);
            if (ewRack.azimuth === this.azimuth) {
                let newAzimuth = this.azimuth + 180;
                if (newAzimuth >= 360) newAzimuth -= 360;
                ewRack.azimuth = newAzimuth;
            }
            // this.getParent().addChild(ewRack);
            this.eastWestSubarray = ewRack;
            this.eastWestSubarray.rackSubarray = this;
            this.eastWestSubarray.updateGeometry();
        }
        if (isPaste) {
            // Jugaad FIX NEED TO BE REMOVED AFTER EW REWORK
            // Normal Subarray Flow 
            ewRackData.subarrayMap = this.createRowBlocksInSubarrayMap(ewRackData.subarrayMap);
            this.makeSubarrayWithPanelProperties(ewRackData.subarrayMap, { withoutContainer: false });
            this.saveState({ withoutContainer: false });
            // if (!this.eastWestRackingEnabled) {
            //     // load subarray map
            // }
            // else {
            //     // manuplating the subarray map to create row blocks
            //     this.makeSubarrayWithPanelProperties(ewRackData.subarrayMap, { withoutContainer: true });
            //     // if (this.rackParent) {
            //     //     this.linkedSubarrayID = ewRackData.linkedSubarrayID;
            //     //     if (!this.linkedSubarray) {
            //     //         this.populateSubarrayForEastWestRacking(true, this.linkedSubarrayID);
            //     //         this.linkedSubarray.saveState({ withoutContainer: true });
            //     //     }
            //     // }
            //     this.saveState({ withoutContainer: true });
            // }
        }
        else {
            // manuplating the subarray map to create row blocks
            ewRackData.subarrayMap = this.createRowBlocksInSubarrayMap(ewRackData.subarrayMap);
            this.makeSubarrayWithPanelProperties(ewRackData.subarrayMap, { withoutContainer: true });
            // if (this.eastWestRackingEnabled && this.rackParent) {
            //     this.linkedSubarrayID = ewRackData.linkedSubarrayID;
            //     if (!this.linkedSubarray) {
            //         this.populateSubarrayForEastWestRacking(true, this.linkedSubarrayID);
            //         this.linkedSubarray.saveState({ withoutContainer: true });
            //     }
            // }
            // this.updatePanelPlacement();
            // this.eastWestSubarray.mergeGeometriesForAllPanels();
            this.saveState({ withoutContainer: true });
        }

        this.validateStructures();
        this.ensureValidSubarrayDCSize();

    }

    createLinkedSubarray(linkedSubarrayID = null) {
        // if(this.linkedSubarray != null) this.linkedSubarray.removeObject( {shouldSaveState: true}, true);
        const linkedSubarray = new EastWestRack(this.stage, null, false);
        if (linkedSubarrayID) linkedSubarray.id = linkedSubarrayID;
        linkedSubarray.associatedModel = this.associatedModel;
        // linkedSubarray.rackParent = false
        linkedSubarray.rackSubarray = this;
        // this.associatedModel.addChild(linkedSubarray);
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const pos = this.outlinePoints[i].getPosition();
            const newOutlinePoint = new OutlinePoints(pos.x, pos.y, pos.z, linkedSubarray, this.stage);
            linkedSubarray.outlinePoints.push(newOutlinePoint);
        }
        linkedSubarray.mountHeight = this.mountHeight;
        // linkedSubarray.outlinePoints = this.outlinePoints;
        linkedSubarray.addTableFlow = this.addTableFlow;
        linkedSubarray.eastWestRackingEnabled = true;
        linkedSubarray.changePropertiesDuringCreation(this);
        linkedSubarray.structureType = "Low Foundation Fixed Tilt"
        // linkedSubarray.changePropertiesDuringCreation({azimuth: (this.azimuth + 180)})
        let newAzimuth = this.azimuth + 180;
        if (newAzimuth >= 360) newAzimuth -= 360;
        linkedSubarray.azimuth = newAzimuth;
        // linkedSubarray.updateObject(this)
        this.getParent().addChild(linkedSubarray);
        linkedSubarray.parent = this.parent;
        linkedSubarray.updateGeometry();
        // linkedSubarray.createBoundaryFromParent()
        linkedSubarray.saveState();

        return linkedSubarray;
    }

    async updatePanelPlacement({ withoutContainer, noRefresh, fromSubarrayFlag } =
        { withoutContainer: false, noRefresh: false, fromSubarrayFlag: false }) {
        // this.inverterLerpPosition = 0;
        // // Wait for 300 ms before starting any work so that notification come
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!fromSubarrayFlag) {
            if (!noRefresh && !this.addTableFlow) {
                this.removeIntersectingSiblingSubarrayTables();
            }
        }
        // remove if panels placed already
        if (this.eastWestSubarray) {
            this.eastWestSubarray.clearSubarray();
        }
        this.clearSubarray();

        // creating linked subarray 
        this.eastWestSubarray = this.createLinkedSubarray();

        // place panels
        try {
            this.autoPlacePanels({ withoutContainer, noRefresh });
            // this.updateRail();
            this.ensureValidSubarrayDCSize();
            if (fromSubarrayFlag) {
                let siblings = this.getParent().getChildren().filter(ele => ele !== this);
                siblings.forEach((ele) => {
                    if (ele instanceof Subarray && ele.objectType !== 'EastWestRack') ele.removeObject();
                });
            }
            // if (!noRefresh && !this.addTableFlow) {
            //     this.removeIntersectingSiblingSubarrayTables();
            // }
        }
        catch (error) {
            return Promise.reject(error);
        }

        if (this.removeIfEmpty(false)) {
            return Promise.reject(new Error('Empty Subarray'));
        }
        return Promise.resolve(true);
    }

    removeIntersectingSiblingSubarrayTables() {
        const siblings = this.getParent().getChildren();
        const allTables = [];
        const subarrayVertices = this.get2DVertices();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            if (siblings[i] instanceof Subarray && siblings[i] !== this && (siblings[i] !== this.eastWestSubarray && siblings[i] !== this.rackSubarray)) {
                if (siblings[i].addTableFlow) {
                    const rows = siblings[i].getChildren();
                    for (let j = rows.length - 1; j >= 0; j -= 1) {
                        const tables = rows[j].getChildren();
                        for (let k = tables.length - 1; k >= 0; k -= 1) {
                            allTables.push(tables[k]);
                        }
                    }
                }
                else {
                    siblings[i].deleteTableInsideArea(subarrayVertices);
                }
            }
        }

        let minX = Infinity;
        let minY = Infinity;
        for (let i = subarrayVertices.length - 1; i >= 0; i -= 1) {
            if (subarrayVertices[i][0] < minX) {
                minX = subarrayVertices[i][0];
            }
            if (subarrayVertices[i][1] < minY) {
                minY = subarrayVertices[i][1];
            }
        }

        const result = [];
        const subarrayEdges = utils.getEdges(subarrayVertices);
        for (let i = allTables.length - 1; i >= 0; i -= 1) {
            const tableEdges = utils.getEdges(allTables[i].get2DVertices());
            let intersection = false;
            for (let j = subarrayEdges.length - 1; j >= 0; j -= 1) {
                for (let k = tableEdges.length - 1; k >= 0; k -= 1) {
                    const check = utils.checkLineIntersection(subarrayEdges[j], tableEdges[k]);
                    if (check.onLine1 && check.onLine2) {
                        result.push(allTables[i]);
                        intersection = true;
                        break;
                    }
                }
                if (intersection) {
                    break;
                }
            }

            if (!intersection) {
                const outsidePoint = new THREE.Vector2(minX - 2, minY - 2);
                const vertex = allTables[i].get2DVertices()[0];
                const extEdge = [ outsidePoint, new THREE.Vector2(vertex[0], vertex[1]) ];
                let noOfIntersection = 0;
                for (let edge of subarrayEdges) {
                    let check = utils.checkLineIntersection(extEdge, edge);
                    if (check.onLine1 && check.onLine2) {
                        noOfIntersection = noOfIntersection + 1;
                    }
                }
                if (noOfIntersection % 2 === 1) {
                    result.push(allTables[i]);
                    continue;
                }
            }
        }
        for (let r of result) {
            r.removeObject();
        }
    }

    async updateObject(properties, fromSubarrayFlag = false) {
        // if(this.eastWestRackingEnabled && !this.rackParent){
        //     this.rackSubarray.updateObjectForRack(properties);
        //     Promise.resolve(true);
        //     return
        // }
        // if(this.eastWestRackingEnabled && this.rackParent){
        //     this.updateObjectForRack(properties);
        //     // Promise.resolve(true);
        //     // return
        // }
        let updatePanelsRequired = false;

        const mountHeightParams = {
            changed: false,
            prevValue: null,
        };

        let structureUpdated = false;

        if (properties.hasOwnProperty('moduleProperties')) {
            if (
                properties.moduleProperties.hasOwnProperty('moduleId') &&
                this.moduleProperties.moduleId !== properties.moduleProperties.moduleId
            ) {
                this.moduleProperties.moduleId = properties.moduleProperties.moduleId;
                this.moduleProperties.moduleMake = properties.moduleProperties.moduleMake;
                this.moduleProperties.moduleSize = properties.moduleProperties.moduleSize;
                this.panelProperties = properties.moduleProperties.panelProperties;

                if (
                    this.moduleProperties.moduleLength !== parseFloat(properties.moduleProperties.moduleLength) ||
                    this.moduleProperties.moduleWidth !== parseFloat(properties.moduleProperties.moduleWidth)
                ) {
                    updatePanelsRequired = true;
                }

                this.moduleProperties.moduleLength = parseFloat(properties.moduleProperties.moduleLength);
                this.moduleProperties.moduleWidth = parseFloat(properties.moduleProperties.moduleWidth);
            }
        }
        if (properties.hasOwnProperty('name')
            && properties.name !== this.name) {
            this.name = properties.name;
        }
        // // do we need to comment this two ifs? Ankit
        // if (properties.hasOwnProperty('rowSpacing')
        //     && properties.rowSpacing !== this.rowSpacing) {
        //     this.rowSpacing = properties.rowSpacing;
        //     updatePanelsRequired = true;
        // }
        // if (properties.hasOwnProperty('rowSpacingMode')
        //     && properties.rowSpacingMode !== this.rowSpacingMode) {
        //     this.rowSpacingMode = properties.rowSpacingMode;
        // }
        if (properties.hasOwnProperty('tilt')
            && properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('structureType')
            && properties.structureType !== this.structureType) {
            this.structureType = properties.structureType;
            structureUpdated = true;
        }
        if (properties.hasOwnProperty('azimuth')
            && properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('panelOrientation')
            && properties.panelOrientation !== this.panelOrientation) {
            this.panelOrientation = properties.panelOrientation;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('mountHeight')
            && properties.mountHeight !== this.mountHeight) {
            mountHeightParams.changed = true;
            mountHeightParams.prevValue = this.mountHeight;
            this.mountHeight = properties.mountHeight;
        }
        if (properties.hasOwnProperty('tableSizeUp')
            && properties.tableSizeUp !== this.tableSizeUp) {
            this.tableSizeUp = properties.tableSizeUp;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('tableSizeWide')
            && properties.tableSizeWide !== this.tableSizeWide) {
            this.tableSizeWide = properties.tableSizeWide;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('tableSpacing')
            && properties.tableSpacing !== this.tableSpacing) {
            this.tableSpacing = properties.tableSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('intraRowSpacing')
            && properties.intraRowSpacing !== this.intraRowSpacing) {
            this.intraRowSpacing = properties.intraRowSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('interRowSpacing')
            && properties.interRowSpacing !== this.interRowSpacing) {
            this.interRowSpacing = properties.interRowSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('interRowSpacingMode')
            && properties.interRowSpacingMode !== this.interRowSpacingMode) {
            this.interRowSpacingMode = properties.interRowSpacingMode;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('moduleSpacingUp')
            && properties.moduleSpacingUp !== this.moduleSpacingUp) {
            this.moduleSpacingUp = properties.moduleSpacingUp;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('moduleSpacingWide')
            && properties.moduleSpacingWide !== this.moduleSpacingWide) {
            this.moduleSpacingWide = properties.moduleSpacingWide;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('mountType')
            && properties.mountType !== this.mountType) {
            this.mountType = properties.mountType;
            this.eastWestRackingEnabled = false;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'bifacialEnabled')
            && properties.bifacialEnabled !== this.bifacialEnabled) {
            this.bifacialEnabled = properties.bifacialEnabled;
        }
        if (properties.hasOwnProperty('eastWestRackingEnabled')) {
            this.eastWestRackingEnabled = properties.eastWestRackingEnabled;
            if (properties.eastWestRackingEnabled) {
                if (this.rackParent) updatePanelsRequired = true;
            }
        }
        this.validateStructures();
        if (this.rackParent == false) {
        } else {
            this.stage.eventManager.setObjectsSelected(this);

        }
        if (updatePanelsRequired || fromSubarrayFlag) {
            const inverters = [];

            for (let i = 0, l = this.inverters.length; i < l; i += 1) {
                inverters.push(this.inverters[i]);
            }

            for (let i = 0, l = inverters.length; i < l; i += 1) {
                inverters[i].removeObject();
            }

            this.inverters = [];
            if (this.interRowSpacingMode === ROW_SPACING_MODE_AUTO) {
                this.interRowSpacing = this.getOptimisedRowSpacing()
            }
            try {
                // if (this.eastWestRackingEnabled && this.outlinePoints.length < 1) { this.createBoundaryFromParent(); }
                await this.updatePanelPlacement({
                    withoutContainer: false,
                    noRefresh: false,
                    fromSubarrayFlag,
                });
                // if(this.eastWestRackingEnabled && this.rackParent) this.populateSubarrayForEastWestRacking();
                this.saveState();
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: Subarray: updateObject failed', error);
                // TODO: Restore previous properties and call new/update panel placement - don't know what
                return Promise.resolve(false);
            }
        }
        else if (mountHeightParams.changed) {
            this.changeMountHeight(mountHeightParams.prevValue);
            this.saveState();
            return Promise.resolve(true);
        }
        else if (structureUpdated) {
            this.saveState();
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(true);
        }
    }
    
    changeTablePropertiesDuringCreation(properties) {
        // // calculating shift in centroid
        // let { moduleLength } = this.moduleProperties;
        // let { moduleWidth } = this.moduleProperties;
        // if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
        //     moduleWidth = this.moduleProperties.moduleLength;
        //     moduleLength = this.moduleProperties.moduleWidth;
        // }
        // let panels = getTableCoordinates(
        //     [0, 0, 0], this.tableSizeUp, this.tableSizeWide,
        //     moduleWidth, moduleLength, this.azimuth, this.tilt,
        //     this.moduleSpacingUp, this.moduleSpacingWide,
        //     this.getTiltWrtParentSurface(), this.getBoundingBox(),
        // );

        // // convert to local coordinates
        // const bBox = this.getBoundingBox();
        // let minXOld = Infinity;
        // let maxXOld = -Infinity;
        // let minYOld = Infinity;
        // let maxYOld = -Infinity;
        // for (let panel of panels) {
        //     for (let corner of panel.corners) {
        //         const modCorner = this.globalToLocalCoordinates({x: corner[0], y: corner[1]}, bBox)
        //         if (modCorner.x > maxXOld) maxXOld = modCorner.x;
        //         if (modCorner.x < minXOld) minXOld = modCorner.x;
        //         if (modCorner.y > maxYOld) maxYOld = modCorner.y;
        //         if (modCorner.y < minYOld) minYOld = modCorner.y;
        //     }
        // }

        this.changePropertiesDuringCreation(properties);
        this.boundingBox = this.getBoundingBox({ reset: true });
        this.getChildren()[0].getChildren()[0].changeTableDuringCreation();

        // // calculating shift in centroid
        // moduleLength = this.moduleProperties.moduleLength;
        // moduleWidth = this.moduleProperties.moduleWidth;
        // if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
        //     moduleWidth = this.moduleProperties.moduleLength;
        //     moduleLength = this.moduleProperties.moduleWidth;
        // }
        // panels = getTableCoordinates(
        //     [0, 0, 0], this.tableSizeUp, this.tableSizeWide,
        //     moduleWidth, moduleLength, this.azimuth, this.tilt,
        //     this.moduleSpacingUp, this.moduleSpacingWide,
        //     this.getTiltWrtParentSurface(), this.getBoundingBox(),
        // );

        // // convert to local coordinates
        // let minXNew = Infinity;
        // let maxXNew = -Infinity;
        // let minYNew = Infinity;
        // let maxYNew = -Infinity;
        // for (let panel of panels) {
        //     for (let corner of panel.corners) {
        //         const modCorner = this.globalToLocalCoordinates({x: corner[0], y: corner[1]}, bBox)
        //         if (modCorner.x > maxXNew) maxXNew = modCorner.x;
        //         if (modCorner.x < minXNew) minXNew = modCorner.x;
        //         if (modCorner.y > maxYNew) maxYNew = modCorner.y;
        //         if (modCorner.y < minYNew) minYNew = modCorner.y;
        //     }
        // }

        // const bBoxDimensions = {
        //     xLength: bBox[0].distanceTo(bBox[1]),
        //     yLength: bBox[0].distanceTo(bBox[3]),
        // };
        // const centroidShift = localToGlobalCoordinates(
        //     new THREE.Vector2(((maxXOld - minXOld) - (maxXNew - minXNew)) / 2, 0),
        //     bBox,
        //     bBoxDimensions,
        // ).sub(localToGlobalCoordinates(
        //     new THREE.Vector2(0, 0),
        //     bBox,
        //     bBoxDimensions,
        // ));
        // this.stage.snapManager.updateCentroidForAddTableSnap(
        //     centroidShift,
        //     this.getChildren()[0].getChildren()[0],
        // );
    }

    changePropertiesDuringCreation(properties) {
        // jugad FIX: for changing the length and width
        // until arka panels load
        const arkaPanelIdSet = new Set(gazeboAllowedModules);
        if (arkaPanelIdSet.has(properties.moduleProperties.moduleId)) {
            if (properties.moduleProperties.moduleLength !== 1.12
                && properties.moduleProperties.moduleWidth !== 0.465
                && properties.moduleProperties.moduleWidth !== 0.435
            ) {
                properties.moduleProperties.moduleLength = 1.12;
                if (properties.moduleProperties.moduleId === defaultGazeboModuleId) {
                    properties.moduleProperties.moduleWidth = 0.465;
                }
                else {
                    properties.moduleProperties.moduleWidth = 0.435;
                }
            }
        }
        if (properties.hasOwnProperty('moduleProperties')) {
            if (properties.moduleProperties.hasOwnProperty('moduleId') &&
              (this.moduleProperties.moduleId !== properties.moduleProperties.moduleId
              || this.moduleProperties.moduleMake !== properties.moduleProperties.moduleMake)) {
                this.moduleProperties.moduleId = properties.moduleProperties.moduleId;
                this.moduleProperties.moduleMake = properties.moduleProperties.moduleMake;
                this.moduleProperties.moduleSize = properties.moduleProperties.moduleSize;
                this.moduleProperties.moduleLength = parseFloat(properties.moduleProperties.moduleLength);
                this.moduleProperties.moduleWidth = parseFloat(properties.moduleProperties.moduleWidth);
                this.panelProperties = this.eastWestRackingEnabled ? properties.panelProperties : properties.moduleProperties.panelProperties;
            }
        }
        if (properties.hasOwnProperty('name')
            && properties.name !== this.name) {
            this.name = properties.name;
        }
        // // do we need to comment this two ifs? Ankit
        // if (properties.hasOwnProperty('rowSpacing')
        //     && properties.rowSpacing !== this.rowSpacing) {
        //     this.rowSpacing = properties.rowSpacing;
        // }
        // if (properties.hasOwnProperty('rowSpacingMode')
        //     && properties.rowSpacingMode !== this.rowSpacingMode) {
        //     this.rowSpacingMode = properties.rowSpacingMode;
        // }
        if (properties.hasOwnProperty('tilt')
            && properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (properties.hasOwnProperty('structureType')
            && properties.structureType !== this.structureType) {
            this.structureType = properties.structureType;
            }
        if (properties.hasOwnProperty('azimuth')
            && properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (properties.hasOwnProperty('panelOrientation')
            && properties.panelOrientation !== this.panelOrientation) {
            this.panelOrientation = properties.panelOrientation;
        }
        if (properties.hasOwnProperty('mountHeight')
            && properties.mountHeight !== this.mountHeight) {
            this.mountHeight = properties.mountHeight;
        }
        if (properties.hasOwnProperty('tableSizeUp')
            && properties.tableSizeUp !== this.tableSizeUp) {
            this.tableSizeUp = properties.tableSizeUp;
        }
        if (properties.hasOwnProperty('tableSizeWide')
            && properties.tableSizeWide !== this.tableSizeWide) {
            this.tableSizeWide = properties.tableSizeWide;
        }
        if (properties.hasOwnProperty('tableSpacing')
            && properties.tableSpacing !== this.tableSpacing) {
            this.tableSpacing = properties.tableSpacing;
        }
        if (properties.hasOwnProperty('moduleSpacingUp')
            && properties.moduleSpacingUp !== this.moduleSpacingUp) {
            this.moduleSpacingUp = properties.moduleSpacingUp;
        }
        if (properties.hasOwnProperty('moduleSpacingWide')
            && properties.moduleSpacingWide !== this.moduleSpacingWide) {
            this.moduleSpacingWide = properties.moduleSpacingWide;
        }
        if (properties.hasOwnProperty('mountType')
            && properties.mountType !== this.mountType) {
            this.mountType = properties.mountType;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'bifacialEnabled')
        && properties.bifacialEnabled !== this.bifacialEnabled) {
            this.bifacialEnabled = properties.bifacialEnabled;
        }
        // if (properties.hasOwnProperty('eastWestRackingEnabled')){
        //     this.eastWestRackingEnabled = properties.eastWestRackingEnabled;
        //     if(properties.eastWestRackingEnabled ){
        //         if(this.structureType !== "Default Fixed Tilt"){
        //             this.structureType = "Default Fixed Tilt";
        //         }
                
        //     }
        // }
        if (properties.hasOwnProperty('intraRowSpacing')
        && properties.intraRowSpacing !== this.intraRowSpacing) {
            this.intraRowSpacing = properties.intraRowSpacing;
        }
        if (properties.hasOwnProperty('interRowSpacing')
            && properties.interRowSpacing !== this.interRowSpacing) {
            this.interRowSpacing = properties.interRowSpacing;
        }
    }
    optimiseOnSubarraySize(sortedTables, nTables) {
        this.structureUpdateRequired = true;
        for (let i = 0; i < nTables; i++) {
            sortedTables[ i ].showTable();

            if (sortedTables[ i ].linkedTable) {
                sortedTables[ i ].linkedTable.showTable();
            }
        }
        for (let i = nTables; i < sortedTables.length; i++) {
            for(let j = 0 ; j < sortedTables[i].children.length ; j++) {
                let panel = sortedTables[i].children[j];
                if (panel.electricalComponentConnected !== null) {
                    this.stage.stateManager
                        .addElectricalComponentAffected(panel.electricalComponentConnected);
                    panel.electricalComponentConnected.removePanel(panel);
                }
            }
            sortedTables[ i ].hideTable();

            if (this.mountType === SUBARRAY_RACK_STYLE_EWRACKING){
                sortedTables[ i ].getSubarray().mergeGeometriesForAllPanels();
            }

            // if (sortedTables[ i ].linkedTable) {
            //     // update linked panel's electrical component in east west racking 
            //     for(let j = 0 ; j < sortedTables[i].linkedTable.children.length ; j++) {
            //         let panel = sortedTables[i].linkedTable.children[j];
            //         if (panel.electricalComponentConnected !== null) {
            //             this.stage.stateManager
            //                 .addElectricalComponentAffected(panel.electricalComponentConnected);
            //             panel.electricalComponentConnected.removePanel(panel);
            //         }
            //     }
            //     sortedTables[ i ].linkedTable.hideTable();
            // }
        }
        // update the rails after hiding tables
        this.updateRail();
        return sortedTables[nTables -1].getAverageSolarAccess().toFixed(3);
    }

    async initOptimiseOnSubarraySize() {

        // update solar access for this subarray
        try {
            if (!this.isSolarAccessComputed()) {
                // await this.stage.asyncManager.updateSolarAccessForSubarray(this);
                notificationsAssistant.error({
                    title: 'Optimize failed.',
                    message: 'Please refresh solar access.',
                });
                throw 'Optimize failed, need to refresh solar access';
            }
        }
        catch (error) {
            console.error('ERROR: Subarray: initOptimiseOnSubarraySize failed', error);
            return Promise.reject(error);
        }

        // after solar access is updated then we have the use individual meshes
        // of panels and hide the merged mesh of subarray.
        this.hideMergedMeshes();
        this.showIndividualPanelMeshes();

        // if (this.linkedSubarray) {
        //     this.linkedSubarray.hideMergedMeshes();
        //     this.linkedSubarray.showIndividualPanelMeshes();
        // }

        let tablesArray = [];
        for (let row of this.getChildren()) {
            for (let table of row.getChildren()) {
                tablesArray.push([
                    table._getAverageSolarAccessIncludingHidden().toFixed(3),
                    table.getChildren()[ 0 ].id,
                    table
                ]);
            }
        }
        if (this.eastWestSubarray){
            for (let row of this.eastWestSubarray.getChildren()) {
                for (let table of row.getChildren()) {
                    tablesArray.push([
                        table._getAverageSolarAccessIncludingHidden().toFixed(3),
                        table.getChildren()[ 0 ].id,
                        table
                    ]);
                }
            }
        }

        tablesArray.sort(
            function (a, b) {
                if (a[ 0 ] === b[ 0 ]) {
                    return (b[ 1 ] - a[ 1 ]);
                } else {
                    return (b[ 0 ] - a[ 0 ]);
                }
            }
        );

        const maxTables = Math.floor((
            this.stage.getRemainingDcSize() + this.getDcSize()) / this.getTableSize());
        if (tablesArray.length > maxTables) {
            tablesArray = tablesArray.slice(0, maxTables);
        }

        return tablesArray.map(
            function (element) {
                return element[ 2 ];
            }
        )
    }

    getNumberOfTables() {
        let noOfTables = this.getNumberOfPanels() / (this.tableSizeUp * this.tableSizeWide);
        if (this.eastWestSubarray) {
            let noOfNewFlowTable = this.eastWestSubarray.getNumberOfPanels() / (this.tableSizeUp * this.tableSizeWide)
            noOfTables += noOfNewFlowTable
        }
        return (noOfTables);
    }

    removeObject({ shouldSaveState } = { shouldSaveState: true }) {
        // this.eastWestSubarray.removeObject();
        if (this.eastWestSubarray) {
            if (this.eastWestSubarray) this.eastWestSubarray.removeObject({shouldSaveState: shouldSaveState});
        }
        let i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({ shouldSaveState: shouldSaveState, deleteEmptyParent: false });
        }

        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }

        // NOTE: deSelect should be after save since it will disable drag controls and stop Undo/Redo container
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        const inverters = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            inverters.push(this.inverters[i]);
        }

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].removeObject()
        }
        this.inverters = [];
        // remove from quadtree
        this.stage.quadTreeManager.removeObject(this);
    }

    getRowSpacing() {
        return this.interRowSpacing;
    }

    getTiltWrtParentSurface(parent = this.getParent()) {
        // console.log('getTiltWrtParentSurface: GG');
        const reverseTilt = (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) > 90
        )
        &&
        (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) < 270
        );

        // eliminating the cases when the calculation is not required.
        if (!reverseTilt && (parent.getTilt() > this.tilt)) {
            return NaN;
        }

        if (parent.getAzimuth() === this.azimuth ||
        parent.getTilt() === 0
        ) {
            return utils.deg2Rad(this.tilt - parent.getTilt());
        }

        const bBox = this.getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();

        const groundNormal = new THREE.Vector3(0, 0, 1);
        const parentNormal = rightDirection.clone().cross(upDirection);
        let panelPlaneNormal;

        const c = Math.cos(utils.deg2Rad(this.tilt));

        const xD = rightDirection.x;
        const yD = rightDirection.y;
        const zD = rightDirection.z;

        let a;
        let b;

        if (Math.abs(xD) < 0.0001) {
            b = 0;
            a = Math.sqrt(1 - (c ** 2)) * (upDirection.x > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else if (Math.abs(yD) < 0.0001) {
            a = 0;
            b = Math.sqrt(1 - (c ** 2)) * (upDirection.y > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else {
            const A = (xD ** 2) + (yD ** 2);
            const B = 2 * xD * zD * c;
            const C = (((zD ** 2) * (c ** 2)) + ((yD ** 2) * (c ** 2))) - (yD ** 2);

            // Note
            // Precision is set to 13 for 64 bit systems.
            // Having lower precision will affect edge cases like azimuth close to 180˚
            const D = _.round((B ** 2) - (4 * A * C), 13);
            if (D >= 0) {
                let validOrderedPanelPlaceNormals = [];

                a = (-B + Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                a = (-B - Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                validOrderedPanelPlaceNormals = validOrderedPanelPlaceNormals.filter(item => Math.abs(utils.rad2Deg(item.tiltWRTGround) - this.tilt) <= 0.05, this);
                if (validOrderedPanelPlaceNormals.length === 0) {
                    return NaN;
                }

                validOrderedPanelPlaceNormals.sort((itemA, itemB) => itemA.tiltWRTParent - itemB.tiltWRTParent);

                panelPlaneNormal = (reverseTilt ? validOrderedPanelPlaceNormals[validOrderedPanelPlaceNormals.length - 1] : validOrderedPanelPlaceNormals[0]).panelNormal;
            }
            else {
                return NaN;
            }
        }
        const relativeTilt = parentNormal.angleTo(panelPlaneNormal);
        // console.log('relativeTilt: ', relativeTilt);
        return relativeTilt;
    }

    createConvexHull(eastSubarray, westSubarray) {
        if (this.outlinePoints.length === 0) {
            const coordinatePoints = [];
            const subarrayOffset = 0.25;
            if (eastSubarray) {
                const subarrayMapEast = eastSubarray.getSubarrayMap();
                for (let i = 0, rowLen = subarrayMapEast.rows.length; i < rowLen; i += 1) {
                    const row = subarrayMapEast.rows[i];
                    for (let j = 0, frameLen = row.frames.length; j < frameLen; j += 1) {
                        const frame = row.frames[j];
                        for (let k = 0, panelLen = frame.panels.length; k < panelLen; k += 1) {
                            const panel = frame.panels[k];
                            for (let l = 0, cornerLen = panel.corners.length; l < cornerLen; l += 1) {
                                const corner = panel.corners[l];
                                coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                            }
                        }
                    }
                }
            }
            if (westSubarray) {
                const subarrayMapWest = westSubarray.getSubarrayMap();
                for (let i = 0, rowLen = subarrayMapWest.rows.length; i < rowLen; i += 1) {
                    const row = subarrayMapWest.rows[i];
                    for (let j = 0, frameLen = row.frames.length; j < frameLen; j += 1) {
                        const frame = row.frames[j];
                        for (let k = 0, panelLen = frame.panels.length; k < panelLen; k += 1) {
                            const panel = frame.panels[k];
                            for (let l = 0, cornerLen = panel.corners.length; l < cornerLen; l += 1) {
                                const corner = panel.corners[l];
                                coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                            }
                        }
                    }
                }
            }
            const convexHullCoordinates =
                new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints)
                    .convexHull().getCoordinates();
            const simplifiedConvexHull = utils.removeCollinearPoints(convexHullCoordinates
                .map(coordinate => [coordinate.x, coordinate.y]).slice(0, -1));
            const outlinePoints = utils.setbackPolygon(
                simplifiedConvexHull,
                subarrayOffset,
            );
            for (let i = 0, len = outlinePoints.length; i < len; i += 1) {
                this.outlinePoints.push(new OutlinePoints(
                    outlinePoints[i][0],
                    outlinePoints[i][1],
                    0,
                    this,
                    this.stage,
                ));
            }
            this.updateGeometry();
        }
        this.saveState();
    }

    autoPlacePanels({ withoutContainer, noRefresh } =
        { withoutContainer: false, noRefresh: false }) {
        // update bounding box rotated along the azimuth of the rows
        // and tilted along the parent surface
        const boundingBox = this.getBoundingBox({ reset: true });
        const bBoxDimensions = {
            xLength: boundingBox[0].distanceTo(boundingBox[1]),
            yLength: boundingBox[0].distanceTo(boundingBox[3]),
        };
        const relativeTilt = this.getTiltWrtParentSurface() / 2;
        if (Number.isNaN(relativeTilt)) {
            this.removeObject();
            this.stage.eventManager.subarrayTiltNotPossibleError();
            throw new Error('This combination of  Tilt and azimuth is not possible on this surface');
        }
        const tableMap = this.getTemplateTableMap();
        const tableDimensions = this.eastWestRackingEnabled ? this.getTableDimensionsEW({ reset: true }) : this.getTableDimensions({ reset: true });
        // get placable polygon and walkways polygon
        let placablePolygon = JSTSConverter.verticesToJSTSPolygon(this.get3DVertices());
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        if (this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel || this.getParent() instanceof SmartroofFace) {
            const insideSetbackShapes = this.getParent().getInsideSetbackPolygons();
            const parapetShapes = this.getParent() instanceof SmartroofFace ? [] : this.getParent().getParapetPolygons();
            if (insideSetbackShapes.length === 1) {
                const insideSetbackVertices = insideSetbackShapes[0].holeVertices
                    .map(shape => shape
                        .map(vertex => [vertex.x, vertex.y]));
                const insideSetbackSegmentsArray = [];
                insideSetbackVertices.forEach((shape) => {
                    const insideSetbackPolygon = JSTSConverter
                        .verticesToJSTSPolygon(shape);
                    const insideSetbackPolygonSegment = utils
                        .getReducedPrecisionJSTSGeometry(insideSetbackPolygon);
                    insideSetbackSegmentsArray.push(insideSetbackPolygonSegment);
                });
                // TODO: Calling geometryFactory like this is bad, should change later.
                // Will fix when changing geometryFactory instances in JSTSConverter,
                // have to know how to deal a factory pattern with a functional utils file.

                const geometryFactory = new JSTS.geom.GeometryFactory();
                const insideSetbackPolygon = geometryFactory
                    .createMultiPolygon(insideSetbackSegmentsArray).union();
                placablePolygon = placablePolygon.intersection(insideSetbackPolygon);
            }
            else if (parapetShapes.length === 1) {
                const parapetVertices = parapetShapes[0].holeVertices
                    .map(vertex => [vertex.x, vertex.y]);
                let parapetPolygon = JSTSConverter.verticesToJSTSPolygon(parapetVertices);
                parapetPolygon = utils.getReducedPrecisionJSTSGeometry(parapetPolygon);
                placablePolygon = placablePolygon.intersection(parapetPolygon);
            }
            else {
                let parentPolygon = JSTSConverter
                    .verticesToJSTSPolygon(this.getParent().get3DVertices());
                parentPolygon = utils.getReducedPrecisionJSTSGeometry(parentPolygon);
                placablePolygon = placablePolygon.intersection(parentPolygon);
            }

            // remove this
            if (this.getParent() instanceof SmartroofFace && insideSetbackShapes.length > 1) {
                const geometryFactory = new JSTS.geom.GeometryFactory();
                const insideSetbackSegmentsArray = [];
                insideSetbackShapes.forEach((insideSetbackShape) => {
                    const insideSetbackVertices = insideSetbackShape.holeVertices
                        .map(shape => shape
                            .map(vertex => [vertex.x, vertex.y]));

                    insideSetbackVertices.forEach((shape) => {
                        const insideSetbackPolygon = JSTSConverter
                            .verticesToJSTSPolygon(shape);
                        const insideSetbackPolygonSegment = utils
                            .getReducedPrecisionJSTSGeometry(insideSetbackPolygon);
                        insideSetbackSegmentsArray.push(insideSetbackPolygonSegment);
                    });
                });

                const insideSetbackPolygon = geometryFactory
                    .createMultiPolygon(insideSetbackSegmentsArray).union();
                placablePolygon = placablePolygon.intersection(insideSetbackPolygon);
            }
        }
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        const placablePolygonEdge = getEdgesFromGeometry(placablePolygon);
        // create a flat polygon from the placable polygon edges
        this.placablePolygonVertices = placablePolygonEdge.map(edge => [edge[0].x, edge[0].y]);
        const walkwaysLocalYCoordinates = [];

        const siblings = this.getParent().getChildren().filter(sibling => sibling !== this);
        //quick-fix
        const siblingObstacles = [];
        const allObstacleEdges = [];
        const allWalkwayObstacleEdges = [];

        for (let idx = 0, len = siblings.length; idx < len; idx += 1) {
            if (siblings[idx] instanceof PolygonModel || siblings[idx] instanceof CylinderModel || siblings[idx] instanceof Dormer) {
                if (!siblings[idx].isIgnored()) {
                    let siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    siblingObstacles.push(siblings[idx].get2DVertices());
                    const outsideSetbackShapes = siblings[idx].getOutsideSetbackPolygons();
                    const shapesLen = outsideSetbackShapes.length;
                    if (shapesLen > 0) {
                        for (let i = 0; i < shapesLen; i += 1) {
                            outsideSetbackShapes[i].vertices = outsideSetbackShapes[i].vertices
                                .map(vertex => [vertex.x, vertex.y]);
                            outsideSetbackShapes[i].holeVertices = outsideSetbackShapes[i]
                                .holeVertices
                                .map(vertex => [vertex.x, vertex.y]);
                        }
                        siblingPolygon = utils.getReducedPrecisionJSTSGeometry(
                            siblingPolygon.union(
                                utils.getReducedPrecisionJSTSGeometry(
                                    JSTSConverter.setbackToJSTSPolygon(outsideSetbackShapes))));

                    }
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Tree) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Inverter) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof ACDB) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof DCDB) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Walkway) {
                const walkwayVertices = siblings[idx].get2DVertices();
                if (!utils.checkParallel(this.azimuth, utils
                    .convertArrayToVector([walkwayVertices[0], walkwayVertices[1]])).isParallel) {
                    const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                        .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allWalkwayObstacleEdges.push(obstacleEdges);
                    }
                }
                else {
                    const walkwayVerticesVector = utils.convertArrayToVector(walkwayVertices);
                    let min = Infinity;
                    let max = -Infinity;

                    for (let i = 0, arrLen = walkwayVerticesVector.length; i < arrLen; i += 1) {
                        const localCoordinates = this
                            .globalToLocalCoordinates(walkwayVerticesVector[i], boundingBox);
                        if (localCoordinates.y > max) {
                            max = localCoordinates.y;
                        }
                        if (localCoordinates.y < min) {
                            min = localCoordinates.y;
                        }
                    }
                    walkwaysLocalYCoordinates.push({ x: min, y: max });
                }
            }
            else if (siblings[idx] instanceof Handrail) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Subarray && noRefresh === true) {
                const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                    .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                    allObstacleEdges.push(obstacleEdges);
                }
            }
        }

        if (this.parent instanceof SmartroofFace) {
            const convexHullGroup = this.getParent().innerLoops;
            convexHullGroup.forEach((convexHull) => {
                if (convexHull.length > 3) {
                    const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                        .verticesToJSTSPolygon(convexHull));
                    siblingObstacles.push(this.getParent().innerLoops);
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            });
        }

        walkwaysLocalYCoordinates.sort((a, b) => a.x - b.x);

        let efficientRows = [];
        let maxRowLength = 0;
        this.isJustified = true;

        const { dynamicOffsetDx, dynamicOffsetDy } = getDynamicOffsetBasedOnArea(this.getArea());
        if (noRefresh && this.finaldx !== undefined && this.finaldy !== undefined) {
            [efficientRows, maxRowLength] = this.getRowsForGivenOffset(
                this.finaldx, this.finaldy, dynamicOffsetDx, walkwaysLocalYCoordinates, boundingBox, bBoxDimensions,
                tableMap, tableDimensions, relativeTilt, false, placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
            );
        }
        else {
            // loop for dy
            this.newRowSpacing = this.interRowSpacing;
            // EW REWORK REQUIRED
            // if(this.rowSpacingMode != ROW_SPACING_MODE_AUTO && this.eastWestRackingEnabled){
            //     this.newRowSpacing = this.interRowSpacing
            // }
            // if(this.eastWestRackingEnabled) this.newRowSpacing += this.intraRowSpacing + this.tableDimensions.length * Math.cos(relativeTilt);
            const dyIncrement = (tableDimensions.length + this.newRowSpacing) /
                dynamicOffsetDy;

            for (let dy = 0; dy < tableDimensions.length + this.newRowSpacing; dy += dyIncrement) {
                const [rows, rowLength, dx] = this.getRowsForGivenOffset(
                    0, dy, dynamicOffsetDx, walkwaysLocalYCoordinates, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt, true, placablePolygonEdge,
                    allObstacleEdges, allWalkwayObstacleEdges
                );

                if (rowLength > maxRowLength) {
                    maxRowLength = rowLength;
                    efficientRows = rows.slice(0);
                    this.finaldx = dx;
                    this.finaldy = dy;
                }

            }
        }
        if (this.eastWestRackingEnabled) {
            const newDims = this.getTableDimensionsEW({ reset: true });
            efficientRows.forEach((o) => {
                o.tableDimensions = newDims;
                o.ewflag = true;
                o.offset = this.intraRowSpacing;
            });
            this.makeRows(efficientRows, { withoutContainer });
        }
        else {
            this.makeRows(efficientRows, { withoutContainer });
        }
        // efficientRows.forEach((o) => {
        //     const topLeft = localToGlobalCoordinates({x: o.startPositionX, y: o.bottomPositionY}, boundingBox, bBoxDimensions);
        //     const bottomRight = localToGlobalCoordinates({x: o.endPositionX, y: o.topPositionY}, boundingBox, bBoxDimensions);

        //     const material = new THREE.LineBasicMaterial({
        //         color: 0x0000ff
        //     });
        //     const geometry = new THREE.BufferGeometry().setFromPoints( [
        //         new THREE.Vector3(topLeft.x, topLeft.y, 10),
        //         new THREE.Vector3(bottomRight.x, topLeft.y, 10),
        //         new THREE.Vector3(bottomRight.x, bottomRight.y, 10),
        //         new THREE.Vector3(topLeft.x, bottomRight.y, 10),
        //         new THREE.Vector3(topLeft.x, topLeft.y, 10),
        //     ] );

        //     const line = new THREE.Line( geometry, material );
        //     this.stage.sceneManager.scene.add(line);
        // });
    }

    getRowsForGivenOffset(
        givenDx, dy, dynamicOffsetDx, walkwaysLocalYCoordinates,
        boundingBox, bBoxDimensions, tableMap, tableDimensions, relativeTilt, iterateThroughDx = true,
        placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
    ) {
        const possibleRows = [];
        this.relativeTilt = relativeTilt;
        const newTableLength = tableDimensions.length;
    
        const lines = getRays(
            dy, relativeTilt, newTableLength, this.interRowSpacing,
            walkwaysLocalYCoordinates, boundingBox, bBoxDimensions.yLength,
        );
        for(let i=0; i<lines.length; i++) {
            const obstaclePoints1 = [];
            const obstaclePoints2 = [];
            const edge1 = [lines[i][0], lines[i][1]];
            const edge2 = [lines[i][2], lines[i][3]];
            const obsRows = [];
            const placableStartEnd = [];
            const obstacleStartEnd = [];
            const topLocalPositionY = this
                .globalToLocalCoordinates(lines[i][0], boundingBox).y;
            const bottomLocalPositionY = this
                .globalToLocalCoordinates(lines[i][2], boundingBox).y;
            for(let j=0; j<placablePolygonEdge.length; j++) {
                let point1 = utils.checkLineIntersection(placablePolygonEdge[j], edge1);
                let point2 = utils.checkLineIntersection(placablePolygonEdge[j], edge2);
                if (point1.onLine1 && point1.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point1.x, point1.y), boundingBox);
                    obstaclePoints1.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
                if (point2.onLine1 && point2.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point2.x, point2.y), boundingBox);
                    obstaclePoints2.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
            }
            obstaclePoints1.sort((a, b) => a.x - b.x);
            obstaclePoints2.sort((a, b) => a.x - b.x);
            if(obstaclePoints1.length>0 && obstaclePoints2.length>0) {
                let idx1 = 0;
                let idx2 = 0;
                let start, end;
                while(obstaclePoints1.length > idx1 && obstaclePoints2.length > idx2) {
                    if(obstaclePoints1[idx1].x > obstaclePoints2[idx2].x) {
                        start = obstaclePoints1[idx1];
                        if(obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2].x) {
                            end = obstaclePoints1[idx1 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx1 += 2;
                            continue;
                        }

                    }
                    else {
                        start = obstaclePoints2[idx2];
                        if(obstaclePoints2[idx2 + 1].x < obstaclePoints1[idx1].x) {
                            end = obstaclePoints2[idx2 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx2 += 2;
                            continue;
                        }

                    }
                    if (obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2 + 1].x) {
                        end = obstaclePoints1[idx1 + 1];
                        idx1 += 2;
                        if(idx1 < obstaclePoints1.length) {
                            if(obstaclePoints1[idx1].x > obstaclePoints2[idx2 + 1].x) {
                                idx2 += 2;
                            }
                        }
                    }
                    else {
                        end = obstaclePoints2[idx2 + 1];
                        idx2 += 2;
                        if(idx2 < obstaclePoints2.length) {
                            if(obstaclePoints2[idx2].x > obstaclePoints1[idx1 + 1].x) {
                                idx1 += 2;
                            }
                        }
                    }
                    if(start > end) {
                        let temp = start;
                        start = end;
                        end = temp;
                    }
                    placableStartEnd.push({start:start, end:end});
                }
            }
            if(placableStartEnd.length>0) {
                for(let j=0; j<allObstacleEdges.length; j++) {
                    const obstacleEdges = allObstacleEdges[j];
                    let minX = null;
                    let maxX = null;
                    for(let k=0; k<obstacleEdges.length; k++) {
                        let obsTopCoordinate,  obsBottomCoordinate, obsEdge1 = null, obsEdge2 = null ;
                        obsTopCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][0], boundingBox);
                        obsBottomCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][1], boundingBox);
                        if(obsTopCoordinate.y < obsBottomCoordinate.y) {
                            let temp = obsBottomCoordinate;
                            obsBottomCoordinate = obsTopCoordinate;
                            obsTopCoordinate = temp;
                        }
                        let point1 = utils.checkLineIntersection(obstacleEdges[k], edge1);
                        let point2 = utils.checkLineIntersection(obstacleEdges[k], edge2);
                        const obstacleEdge = obstacleEdges[k];
                        if(point1.onLine1 && point1.onLine2 && point2.onLine1 && point2.onLine2){
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                        }
                        else if(point1.onLine1 && point1.onLine2) {
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x:obsTopCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        else if(point2.onLine1 && point2.onLine2) {
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                            obsEdge1 = {x:obsBottomCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                        }
                        else if(topLocalPositionY<=obsTopCoordinate.y && bottomLocalPositionY>=obsBottomCoordinate.y) {
                            obsEdge1 = {x:obsTopCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                            obsEdge2 = {x:obsBottomCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        if(obsEdge1 && obsEdge2) {
                            if(minX == null){
                                if(obsEdge1.x < obsEdge2.x) {
                                    minX = obsEdge1;
                                    maxX = obsEdge2;
                                }
                                else {
                                    minX = obsEdge2;
                                    maxX = obsEdge1;
                                }
                            }
                            else {
                                if(obsEdge2.x > obsEdge1.x) {
                                    if(minX.x > obsEdge1.x) {
                                        minX = obsEdge1;
                                    }
                                    if(maxX.x < obsEdge2.x) {
                                        maxX = obsEdge2;
                                    }
                                }
                                else {
                                    if(minX.x > obsEdge2.x) {
                                        minX = obsEdge2;
                                    }
                                    if(maxX.x < obsEdge1.x) {
                                        maxX = obsEdge1;
                                    }
                                }
                            }
                        }
                    }
                    if(minX && maxX) {
                        if(minX > maxX) {
                            let temp = minX;
                            minX = maxX;
                            maxX = temp;
                        }
                        obstacleStartEnd.push({start:minX, end:maxX});
                    }
                }
                for(let j=0; j<allWalkwayObstacleEdges.length; j++) {
                    const obstacleEdges = allWalkwayObstacleEdges[j];
                    let minX = null;
                    let maxX = null;
                    for(let k=0; k<obstacleEdges.length; k++) {
                        let obsTopCoordinate,  obsBottomCoordinate, obsEdge1 = null, obsEdge2 = null ;
                        obsTopCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][0], boundingBox);
                        obsBottomCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][1], boundingBox);
                        if(obsTopCoordinate.y < obsBottomCoordinate.y) {
                            let temp = obsBottomCoordinate;
                            obsBottomCoordinate = obsTopCoordinate;
                            obsTopCoordinate = temp;
                        }
                        let point1 = utils.checkLineIntersection(obstacleEdges[k], edge1);
                        let point2 = utils.checkLineIntersection(obstacleEdges[k], edge2);
                        const obstacleEdge = obstacleEdges[k];
                        if(point1.onLine1 && point1.onLine2 && point2.onLine1 && point2.onLine2){
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: WALKWAY};
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: WALKWAY};
                        }
                        else if(point1.onLine1 && point1.onLine2) {
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: WALKWAY};
                            obsEdge2 = {x:obsTopCoordinate.x , y:bottomLocalPositionY, belongsTo: WALKWAY};
                        }
                        else if(point2.onLine1 && point2.onLine2) {
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: WALKWAY};
                            obsEdge1 = {x:obsBottomCoordinate.x , y:topLocalPositionY, belongsTo: WALKWAY};
                        }
                        else if(topLocalPositionY<=obsTopCoordinate.y && bottomLocalPositionY>=obsBottomCoordinate.y) {
                            obsEdge1 = {x:obsTopCoordinate.x , y:topLocalPositionY, belongsTo: WALKWAY};
                            obsEdge2 = {x:obsBottomCoordinate.x , y:bottomLocalPositionY, belongsTo: WALKWAY};
                        }
                        if(obsEdge1 && obsEdge2) {
                            if(minX == null){
                                if(obsEdge1.x < obsEdge2.x) {
                                    minX = obsEdge1;
                                    maxX = obsEdge2;
                                }
                                else {
                                    minX = obsEdge2;
                                    maxX = obsEdge1;
                                }
                            }
                            else {
                                if(obsEdge2.x > obsEdge1.x) {
                                    if(minX.x > obsEdge1.x) {
                                        minX = obsEdge1;
                                    }
                                    if(maxX.x < obsEdge2.x) {
                                        maxX = obsEdge2;
                                    }
                                }
                                else {
                                    if(minX.x > obsEdge2.x) {
                                        minX = obsEdge2;
                                    }
                                    if(maxX.x < obsEdge1.x) {
                                        maxX = obsEdge1;
                                    }
                                }
                            }
                        }
                    }
                    if(minX && maxX) {
                        if(minX > maxX) {
                            let temp = minX;
                            minX = maxX;
                            maxX = temp;
                        }
                        obstacleStartEnd.push({start:minX, end:maxX});
                    }
                }
                let clonedObsPoints = [];
                obstacleStartEnd.sort((a,b) => a.start.x - b.start.x);
                if( obstacleStartEnd.length > 0) {
                    clonedObsPoints.push( obstacleStartEnd[0]);
                    let idx = 1;
                    while(obstacleStartEnd.length > idx) {
                        let clonedIdx = clonedObsPoints.length;
                        if(clonedObsPoints[clonedIdx - 1].end.x <  obstacleStartEnd[idx].start.x) {
                            clonedObsPoints.push(obstacleStartEnd[idx]);
                        }
                        else {
                            if(clonedObsPoints[clonedIdx - 1].start.x > obstacleStartEnd[idx].start.x) {
                                clonedObsPoints[clonedIdx - 1].start = obstacleStartEnd[idx].start;
                            }
                            if(clonedObsPoints[clonedIdx - 1].end.x < obstacleStartEnd[idx].end.x) {
                                clonedObsPoints[clonedIdx - 1].end = obstacleStartEnd[idx].end;
                            }
                        }
                        idx += 1;
                    }
                }
                placableStartEnd.sort((a,b) => a.start.x - b.start.x);
                clonedObsPoints.sort((a,b) => a.start.x - b.start.x);
                let obsIdx = 0, placableIdx = 0;
                let start = placableStartEnd[0].start, end = placableStartEnd[0].end;
                while(clonedObsPoints.length > obsIdx && placableStartEnd.length > placableIdx) {
                    if(clonedObsPoints[obsIdx].end.x < start.x) {
                        while(clonedObsPoints.length > obsIdx && clonedObsPoints[obsIdx].end.x < start.x) {
                            obsIdx += 1;
                        }
                    }
                    else if(clonedObsPoints[obsIdx].start.x < start.x && clonedObsPoints[obsIdx].end.x > start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                    }
                    else if(start.x < clonedObsPoints[obsIdx].start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                        if(start.belongsTo == WALKWAY) {
                            obsRows.push({start: start, end:start});
                        }
                       obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                        if(clonedObsPoints[obsIdx].start.belongsTo == WALKWAY) {
                            obsRows.push({start: clonedObsPoints[obsIdx].start, end:clonedObsPoints[obsIdx].start});
                        }
                       start = clonedObsPoints[obsIdx].end;
                       obsIdx += 1;
                    }
                    else if(clonedObsPoints[obsIdx].start.x < end.x && end.x < clonedObsPoints[obsIdx].end.x) {
                        if(start.belongsTo == WALKWAY) {
                            obsRows.push({start: start, end:start});
                        }
                        obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                        if(clonedObsPoints[obsIdx].start.belongsTo == WALKWAY) {
                            obsRows.push({start: clonedObsPoints[obsIdx].start, end:clonedObsPoints[obsIdx].start});
                        }
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                        placableIdx += 1;
                        while(placableStartEnd.length > placableIdx && start.x >= end.x ) {
                            if(start.x < placableStartEnd[placableIdx].end.x) {
                                if(placableStartEnd[placableIdx].start.x >= start.x) {
                                    start = placableStartEnd[placableIdx].start;
                                }
                                end = placableStartEnd[placableIdx].end;
                                break;
                            }
                            placableIdx += 1;
                        }
                    }
                    else {
                        obsRows.push({start: start, end:end});
                        placableIdx += 1;
                        if(placableStartEnd.length <= placableIdx) {
                            start = end;
                            break;
                        }
                        start = placableStartEnd[placableIdx].start;
                        end = placableStartEnd[placableIdx].end;
                    }

                }
                placableIdx += 1;
                while(placableStartEnd.length > placableIdx) {
                    obsRows.push({start: start, end:end});
                    start = placableStartEnd[placableIdx].start;
                    end = placableStartEnd[placableIdx].end;
                    placableIdx += 1;
                }
                if(start.x < end.x) {
                    if(start.belongsTo == WALKWAY) {
                        obsRows.push({start: start, end:start});
                    }
                    obsRows.push({start: start, end:end});
                    if(end.belongsTo == WALKWAY) {
                        obsRows.push({start: end, end:end});
                    }
                }
                possibleRows.push({
                    obsRows,
                    minY: bottomLocalPositionY,
                    maxY: topLocalPositionY,
                });
                obsRows.slice(0);
            }
        }
        let efficientRows = [];
        let maxRowLength = 0;
        let efficientDx = 0;
        if (iterateThroughDx) {
            let rowLength = 0;
            let rows = [];
            const dxIncrement = (tableDimensions.width + this.tableSpacing) /
                dynamicOffsetDx;
            for (let dx = 0; dx < tableDimensions.width + this.tableSpacing; dx += dxIncrement) {
                [rows, rowLength] = this
                    .getRowsForDx(
                        dx, possibleRows, boundingBox, bBoxDimensions,
                        tableMap, tableDimensions, relativeTilt,
                    );
                if (rowLength > maxRowLength) {
                    efficientRows = rows.slice(0);
                    maxRowLength = rowLength;
                    efficientDx = dx;
                }
            }
        }
        else {
            [efficientRows, maxRowLength] = this
                .getRowsForDx(
                    givenDx, possibleRows, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt,
                );
        }
        return [efficientRows, maxRowLength, efficientDx];
    }

    getTableDimensionsEW(reset = false) {
        if (reset || this.tableDimensions === undefined) {
            let { moduleLength } = this.moduleProperties;
            let { moduleWidth } = this.moduleProperties;
            if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
                moduleWidth = this.moduleProperties.moduleLength;
                moduleLength = this.moduleProperties.moduleWidth;
            }
            if (this.eastWestRackingEnabled) {
                return {
                    length: ((((this.tableSizeUp * 2) - 1) * this.intraRowSpacing) +
                        ((this.tableSizeUp * 2) * moduleLength)),
                    width: (((this.tableSizeWide - 1) * this.moduleSpacingWide) +
                        (this.tableSizeWide * moduleWidth)),
                    height: ((((this.tableSizeUp * 2) - 1) * this.intraRowSpacing) +
                        (this.tableSizeUp * moduleLength)) * Math.sin(this.tilt * (Math.PI / 180)),
                };
            }
        }
        return this.tableDimensions;
    }

    makeRows(rows, { withoutContainer } = { withoutContainer: false }) {
        let rowsLength = rows.length;
        for (let i = 0; i < rowsLength; i += 1) {
            const rowMap = {
                id: i,
                frames: [],
            };
            const r1 = new Row(this.stage, rowMap, { withoutContainer }, true);
            const r2 = new Row(this.stage, rowMap, { withoutContainer }, true);
            this.addChild(r1);
            this.eastWestSubarray.addChild(r2);

            const offset = rows[i].topPositionY > rows[i].bottomPositionY ? (this.intraRowSpacing / 2) : -(this.intraRowSpacing / 2);
            const center = (rows[i].topPositionY + rows[i].bottomPositionY) / 2;
            const r1params = Object.assign({}, rows[i]);
            r1params.bottomPositionY = rows[i].bottomPositionY;
            r1params.topPositionY = center - offset;
            const r2params = Object.assign({}, rows[i]);
            r2params.topPositionY = rows[i].topPositionY;
            r2params.bottomPositionY = center + offset;

            r2params.tableMap = this.eastWestSubarray.getTemplateTableMap();
            r1.autoPlacePanels(r1params, { withoutContainer });
            r2.autoPlacePanels(r2params, { withoutContainer });
            r1.saveState({ withoutContainer });
            r2.saveState({ withoutContainer });
        }
        this.mergeGeometriesForAllPanels();
    }
    static getObjectType() {
        return 'EastWestRack'
    }
}
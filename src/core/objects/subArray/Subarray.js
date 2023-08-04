import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import _ from 'lodash';
import Row from './Row';
import Inverter from '../ac/Inverter';
import DCDB from '../ac/DCDB';
import { ARKA_MODULE_MAKE } from '../../structure/constants';
import BaseObject from '../../objects/BaseObject';
import * as utils from '../../utils/utils';
import * as raycastingUtils from '../../utils/raycastingUtils';
import {
    getTimeBasedRowSpacing,
    getTableMapCentroid,
} from '../../utils/subarrayUtils';
import { defaultGazeboModuleId, gazeboAllowedModules } from '../../../constants';
import {
    COMPLEX_GEOMETRY_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    SUBARRAY_RACK_STYLE_FLUSH,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    SUBARRAY_RACK_STYLE_FIXED,
    PANEL_TYPE_MONOCRYSTALLINE,
    SUBARRAY_RACK_STYLE_EWRACKING,
} from "../../coreConstants";
import OutlinePoints from '../subObjects/OutlinePoints';
import * as JSTS from 'jsts';
import PolygonModel from '../model/PolygonModel';
import CylinderModel from '../model/CylinderModel';
import panelPlacementModule from './SubarrayPanelPlacement';
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES, LINE_WIDTH } from '../visualConstants';
import * as visualUtils from '../../utils/visualUtils';
import * as exporters from '../../utils/exporters';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import { getStructureValidationErrorMessages } from '../../structure/utils/structureValidationUtils';
import API from '@/services/api/';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import SmartroofFace from '../model/smartroof/SmartroofFace';
import Table from './Table';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import { Mesh } from 'three';
import { SmartroofModel } from '../model/smartroof/SmartroofModel';
import Ground from '../ground/Ground';

const MERGE_ROWS = 'MergeRows';
const ADD_TO_ROW = 'AddToRow';
const CREATE_NEW_ROW = 'CreateNewRow';

const MINIMUM_NUMBER_OF_POINTS = 3;

export default class Subarray extends BaseObject {
    constructor(stage) {
        super(stage);
        // standard norms
        this.stage = stage;
        this.id = this.stage.getSubarrayId();
        this.name = 'Subarray #' + this.id.toString();
        this.addTableFlow = false;
        this.structureErrors = [];
        this.structureUpdateRequired = false;
        this.inverterIds = [];

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.panelMeshMaterial = new THREE.MeshLambertMaterial({
            transparent: false,
            side:  THREE.DoubleSide,
            vertexColors: true,
        });
        this.panelEdgeMaterial = new THREE.LineBasicMaterial({
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PANEL_EDGE_COLOR,
        });

        this.mergedMesh = createMesh(createBufferGeometry(), this.panelMeshMaterial);
        this.mergedEdgemesh = new THREE.LineSegments(createBufferGeometry(), this.panelEdgeMaterial);

        this.objectsGroup.add(this.mergedMesh);
        this.objectsGroup.add(this.mergedEdgemesh);

        // materials
        this._meshMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.4,
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._edgeMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .SUBARRAY[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // list of outline points
        this.outlinePoints = [];

        // mesh and edges
        this.coreMesh = createMesh(createBufferGeometry(), this._meshMaterial);
        this.coreEdges = new THREE.LineSegments(new THREE.EdgesGeometry(this.coreMesh.geometry), this._edgeMaterial);

        // hide mesh and edges
        this.coreMesh.visible = false;
        this.coreEdges.visible = false;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        // associated model
        this.associatedModel = this.stage.ground;

        // subarray properties
        const defaultValues = this.getDefaultValues();
        this.tilt = defaultValues.tilt;
        this.azimuth = defaultValues.azimuth;
        this.structureType = defaultValues.structureType;
        this.panelOrientation = defaultValues.panelOrientation;
        this.mountHeight = defaultValues.mountHeight;
        this.tableSizeUp = defaultValues.tableSizeUp;
        this.tableSizeWide = parseInt(defaultValues.tableSizeWide, 10);
        this.tableSpacing = defaultValues.tableSpacing;
        this.interRowSpacing = 0.2;
        this.intraRowSpacing = 0.1;
        this.moduleSpacingUp = defaultValues.moduleSpacingUp;
        this.moduleSpacingWide = defaultValues.moduleSpacingWide;
        this.moduleProperties = defaultValues.moduleProperties;
        this.panelProperties = defaultValues.panelProperties;
        this.rowSpacingMode = defaultValues.rowSpacingMode;
        this.eastWestRackingEnabled = false;
        this.linkedSubarray = null;
        this.rackParent = true;
        if (defaultValues.rowSpacingMode === ROW_SPACING_MODE_MANUAL) {
            this.rowSpacing = defaultValues.rowSpacing;
            this.interRowSpacing = this.rowSpacing
        }
        else {
            const optimizedRowSpacing = this.getOptimisedRowSpacing();
            this.rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
            this.interRowSpacing = this.rowSpacing
        }
        this.mountType = defaultValues.mountType;
        this.bifacialEnabled = false;

        // TODO: Remove this after selection controls
        this.canvas = stage.rendererManager.getDomElement();

        this.PANEL_MODEL_ID = 0;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.updateVisualsAfterLoadingAndCreation();

        this.inverterLerpPosition = 0;
        this.linkedMppts = [];
        this.inverters = [];
    }

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
            intraRowSpacing : this.intraRowSpacing,
            linkedSubarray: this.linkedSubarray,
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
            this.rowSpacing = state.rowSpacing;
            this.structureType = state.structureType; // TBC what is load state
            this.rowSpacingMode = state.rowSpacingMode;
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
            this.linkedSubarray = state.linkedSubarray,
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

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);
        // Jugaad fix for EWR
        this.getChildren().forEach((row) => {
            row.getChildren().forEach((table) => {
                this.stage.sceneManager.scene.remove(table.objectsGroup);
            })
        })
        this.hideMergedMeshes()
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        //updating the rails after redo on delete
        let prevParent;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            if (prevParent instanceof SmartroofFace) {
                prevParent.updateRails();
                prevParent.updateAttachments();
            }
            prevParent = null;
        }
        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    exportAsSTL({ singleObject } = { singleObject: true }) {
        const allObjects = [];

        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const objects = children[i].exportAsSTL();
            allObjects.push(...objects);
        }

        if (singleObject) {
            const singleGeometry = BufferGeometryUtils
                .mergeGeometries(allObjects.map((child) => {
                    child.mesh.updateMatrix();
                    return child.mesh.geometry;
                }));

            const mesh = new THREE.Mesh(singleGeometry, new THREE.MeshBasicMaterial());
            return [{
                mesh,
                name: this.name,
            }];
        }
        return allObjects;
    }

    exportAsCollada({ singleObject } = { singleObject: true }) {
        const object = {
            children: [],
            name: this.name,
        };

        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const objects = children[i].exportAsCollada();
            object.children.push(...objects);
        }

        if (singleObject) {
            const singleGeometry = BufferGeometryUtils
                .mergeGeometries(object.children.map((child) => {
                    child.updateMatrix();
                    return child.geometry;
                }));

            const mesh = createMesh(
                singleGeometry,
                new THREE.MeshLambertMaterial({
                    color: 0x0062A3,
                    transparent: false,
                }),
            );

            mesh.name = this.name;
            return [mesh];
        }
        return [object];
    }

    saveObject() {
        let subarrayData = {
            type: Subarray.getObjectType(),
        };

        // save id and name
        subarrayData.id = this.id;
        subarrayData.name = this.name;
        subarrayData.addTableFlow = this.addTableFlow;
        // save subarray properties
        subarrayData.moduleProperties = {
            moduleId: this.moduleProperties.moduleId,
            moduleMake: this.moduleProperties.moduleMake,
            moduleSize: this.moduleProperties.moduleSize,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
        };
        subarrayData.panelProperties = this.panelProperties;
        subarrayData.rowSpacing = this.rowSpacing;
        subarrayData.rowSpacingMode = this.rowSpacingMode;
        subarrayData.tilt = this.tilt;
        subarrayData.structureType = this.structureType;
        subarrayData.azimuth = this.azimuth;
        subarrayData.panelOrientation = this.panelOrientation;
        subarrayData.mountHeight = this.mountHeight;
        subarrayData.tableSizeUp = this.tableSizeUp;
        subarrayData.tableSizeWide = this.tableSizeWide;
        subarrayData.tableSpacing = this.tableSpacing;
        subarrayData.moduleSpacingUp = this.moduleSpacingUp;
        subarrayData.moduleSpacingWide = this.moduleSpacingWide;
        subarrayData.mountType = this.mountType;
        subarrayData.inverterLerpPosition = this.inverterLerpPosition;
        subarrayData.eastWestRackingEnabled = this.eastWestRackingEnabled;
        subarrayData.interRowSpacing = this.interRowSpacing;
        subarrayData.intraRowSpacing = this.intraRowSpacing;
        if (this.eastWestRackingEnabled && this.linkedSubarray) {
            subarrayData.linkedSubarrayID = this.linkedSubarray.getId();
        }
        // subarrayData.linkedSubarray = this.linkedSubarray;
        subarrayData.rackParent = this.rackParent;

        subarrayData.inverterIds = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            subarrayData.inverterIds.push(this.inverters[i].id);
        }
        subarrayData.bifacialEnabled = this.bifacialEnabled;

        // saving outline points
        let outlinePoints = [];
        for (let outlinePoint of this.outlinePoints) {
            outlinePoints.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ])
        }
        subarrayData.outlinePoints = outlinePoints;
       
        // save subarray map
        subarrayData.subarrayMap = this.getSubarrayMap();
        return subarrayData;
    }

    async loadObject(subarrayData, parentModel, isPaste = false) {
        // load id and name
        if(!subarrayData.rackParent && subarrayData.eastWestRackingEnabled) return;
        if (!isPaste) {
            this.id = subarrayData.id;
            this.name = subarrayData.name;
        }

        this.addTableFlow = subarrayData.addTableFlow;
        // load subarray properties
        this.moduleProperties = {
            moduleId: subarrayData.moduleProperties.moduleId,
            moduleMake: subarrayData.moduleProperties.moduleMake,
            moduleSize: subarrayData.moduleProperties.moduleSize,
            moduleLength: subarrayData.moduleProperties.moduleLength,
            moduleWidth: subarrayData.moduleProperties.moduleWidth,
        };
        this.panelProperties = subarrayData.panelProperties;
        this.rowSpacing = subarrayData.rowSpacing;
        this.rowSpacingMode = subarrayData.rowSpacingMode;
        this.tilt = subarrayData.tilt;
        this.structureType = subarrayData.structureType;
        this.azimuth = subarrayData.azimuth;
        this.panelOrientation = subarrayData.panelOrientation;
        this.mountHeight = subarrayData.mountHeight;
        this.tableSizeUp = subarrayData.tableSizeUp;
        this.tableSizeWide = subarrayData.tableSizeWide;
        this.tableSpacing = subarrayData.tableSpacing;
        this.moduleSpacingUp = subarrayData.moduleSpacingUp;
        this.moduleSpacingWide = subarrayData.moduleSpacingWide;
        this.mountType = subarrayData.mountType;
        this.bifacialEnabled = subarrayData.bifacialEnabled;
        this.eastWestRackingEnabled = subarrayData.eastWestRackingEnabled;
        this.rackParent = subarrayData.rackParent;
        this.interRowSpacing = subarrayData.interRowSpacing;
        this.intraRowSpacing = subarrayData.intraRowSpacing;
        // this.linkedSubarray = subarrayData.linkedSubarray;
        if (subarrayData.inverterLerpPosition !== undefined) {
            this.inverterLerpPosition = subarrayData.inverterLerpPosition;
        }

        // load subarray outline vertices (points)
        if (parentModel !== null) {
            this.associatedModel = parentModel;
            this.associatedModel.addChild(this);
        }

        if (subarrayData.inverterIds !== undefined) {
            this.inverterIds = subarrayData.inverterIds;
        }
        // load inverters accoding to this..
        // if (subarrayData.inverterIds !== undefined) {
        //     for (let i = 0, l = subarrayData.inverterIds.length; i < l; i += 1) {
        //         this.inverterIds.push(subarrayData.inverterIds);
        //     }
        // }

        // TODO: Identify the real cause
        if (subarrayData.outlinePoints.length === 0) {
            if (subarrayData.subarrayMap.rows.length === 0) {
                this.removeObject();
                return;
            }
            let coordinatePoints = [];
            for (let row of subarrayData.subarrayMap.rows) {
                for (let table of row.frames) {
                    for (let panel of table.panels) {
                        for (let corner of panel.corners) {
                            coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                        }
                    }
                }
            }
            let convexHullCoordinates = new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints).convexHull().getCoordinates().slice(0, -1);
            subarrayData.outlinePoints = convexHullCoordinates.map(coordinate => [coordinate.x, coordinate.y, 0]);
        }

        // set outline points
        for (let outlinePoint of subarrayData.outlinePoints) {
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

        if (isPaste) {
            // Jugaad FIX NEED TO BE REMOVED AFTER EW REWORK
            // Normal Subarray Flow 
            if (!this.eastWestRackingEnabled) {
                // load subarray map
                this.makeSubarrayWithPanelProperties(subarrayData.subarrayMap, { withoutContainer: false });
                this.saveState({ withoutContainer: false });
            }
            else {
                // manuplating the subarray map to create row blocks
                subarrayData.subarrayMap = this.createRowBlocksInSubarrayMap(subarrayData.subarrayMap);
                this.makeSubarrayWithPanelProperties(subarrayData.subarrayMap, { withoutContainer: true });
                // if(this.rackParent){
                //     this.linkedSubarrayID = subarrayData.linkedSubarrayID;
                //     if(!this.linkedSubarray){
                //         this.populateSubarrayForEastWestRacking(true, this.linkedSubarrayID);
                //         this.linkedSubarray.saveState({ withoutContainer: true });
                //     }
                // }
                this.saveState({ withoutContainer: true });                
            }
        }
        else {
            // manuplating the subarray map to create row blocks
            subarrayData.subarrayMap = this.createRowBlocksInSubarrayMap(subarrayData.subarrayMap);
            this.makeSubarrayWithPanelProperties(subarrayData.subarrayMap, { withoutContainer: true });
            // if(this.eastWestRackingEnabled && this.rackParent){
            //     this.linkedSubarrayID = subarrayData.linkedSubarrayID;
            //     if(!this.linkedSubarray){
            //         this.populateSubarrayForEastWestRacking(true, this.linkedSubarrayID);
            //         this.linkedSubarray.saveState({ withoutContainer: true });
            //     }
            // }
            this.saveState({ withoutContainer: true });
        }

        this.validateStructures();
        this.ensureValidSubarrayDCSize();

    }

    // jugaad fix: TO call api after subarray is created.
    async makeSubarrayWithPanelProperties(subarrayMap, { withoutContainer } = { withoutContainer: false }) {
        // subarray creation.
        for (let rowMap of subarrayMap.rows !== undefined ? subarrayMap.rows : []) {
            const row = new Row(this.stage, rowMap, { withoutContainer: withoutContainer });
            this.addChild(row);
            row.saveState({ withoutContainer: withoutContainer });
        }
        // backward compatibility (old designs dont have panel properties).
        if (this.panelProperties === undefined || (this.panelProperties.id !== this.moduleProperties.moduleId)) {
            if(window.location.pathname.includes("studio")){
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(this.moduleProperties.moduleId);
                const selectedPanel = response.data;
                this.panelProperties = selectedPanel;
            }
        }
        // call merge geometries to merge subarray after creation.
        this.mergeGeometriesForAllPanels();
    }

    loadInvertersUsingId() {
        const inverters = exporters.getInverters(this.stage);
        for (let i = 0, l = this.inverterIds.length; i < l; i += 1) {
            for (let inverter of inverters) {
                if (this.inverterIds[i] === inverter.id) {
                    this.inverters.push(inverter);
                    break;
                }
            }
        }
    }

    ensureValidSubarrayDCSize({ showError } = { showError: true }) {
        if (this.stage.getRemainingDcSize() < 0) {
            if (showError) {
                this.stage.eventManager.dcCapSizeExceeded();
            }
            this.limitDCSize(this.stage.getRemainingDcSize() + this.getDcSize());
        }
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.azimuth = mirroredData.azimuth;
        for (let i = 0, len = mirroredData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                mirroredData.outlinePoints[i][0],
                mirroredData.outlinePoints[i][1],
                mirroredData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }

        this.updateGeometry();

        this.clearSubarray();
        mirroredData.subarrayMap = this.createRowBlocksInSubarrayMap(mirroredData.subarrayMap);
        this.makeSubarray(mirroredData.subarrayMap, { withoutContainer: false });

        if (maintainCentroid) {
            const newPosition = this.getPosition();
            // We want the mirror to be in the exact same position of the original object
            // so moving the base by a displacement of original - new
            // this move should not affect any attached dimension.
            const deltaX = oldPosition.x - newPosition.x;
            const deltaY = oldPosition.y - newPosition.y;
            this.moveObject(deltaX, deltaY, 0);
            this.moveDimensions(-deltaX, -deltaY, 0);
            return new THREE.Vector2(deltaX, deltaY);
        }
        return new THREE.Vector2(0, 0);
    }

    createConvexHull() {
        if (this.outlinePoints.length === 0) {
            const coordinatePoints = [];
            const subarrayMap = this.getSubarrayMap();
            const subarrayOffset = 0.25;
            for (let i = 0, rowLen = subarrayMap.rows.length; i < rowLen; i += 1) {
                const row = subarrayMap.rows[i];
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

    createBoundaryFromParent() {
        const vertices = this.getParent().get2DVertices();
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i][0],
                vertices[i][1],
                0,
                this,
                this.stage,
            ));
        }
        this.updateGeometry();
    }
    // Drawing functions

    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    async onComplete(geometry) {
        // getting vertices from buffer geometry
        let vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i++) {
            vertices.push(
                new THREE.Vector3(
                    geometry.attributes.position.array[i * 3],
                    geometry.attributes.position.array[i * 3 + 1],
                    geometry.attributes.position.array[i * 3 + 2],
                )
            )
        }

        // set outline points
        for (let vertex of vertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    vertex.x,
                    vertex.y,
                    vertex.z,
                    this,
                    this.stage
                )
            );
        }

        try {
            // update panel placement
            await this.placeObject();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Subarray: OnComplete failed.', error);
            this.onCancel();
            return Promise.reject(false);
        }

    }

    onCancel() {

        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    // Geometry functions

    updateGeometry() {
        let vertices2DArray = this.get2DVertices();
        let vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);

        // create core
        let coreShape = new THREE.Shape(vertices2DVectorArray);
        let coreGeometry = new THREE.ShapeGeometry(coreShape);

        // TODO: Optimise here: Height calculation is done twice

        // update core geometry vertices height
        const { count } = coreGeometry.attributes.position;
        for (let i = 0; i < count; i += 1) {
            const X = coreGeometry.attributes.position.getX(i);
            const Y = coreGeometry.attributes.position.getY(i);
            const Z = this.associatedModel.getZOnTopSurface(X, Y);

            coreGeometry.attributes.position.setZ(i, Z);
        }
        // for (let vertex of coreGeometry.vertices) {
        //     vertex.z = this.associatedModel.getZOnTopSurface(vertex.x, vertex.y);
        // }

        // updating outline points height
        let constantForParapetAccommodation = 0;
        if ((this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel) && this.getParent().isParapetPresent()) {
            constantForParapetAccommodation += this.getParent().getParapetHeight();
        }
        // Hack for preventing raycastor to raycast lidar
        this.stage.lidar.lidarMesh.layers.set(4);
        for (let outlinePoint of this.outlinePoints) {
            let position = outlinePoint.getPosition();
            outlinePoint.moveObjectWithoutConsequences(0, 0,
                raycastingUtils.getTopModelFromPoint(position, this.stage)[1] + constantForParapetAccommodation - position.z);
        }
        this.stage.lidar.lidarMesh.layers.set(0);

        // updating mesh and edges
        this.coreMesh.geometry = coreGeometry;
        this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);
        this.boundingBox = this.getBoundingBox({ reset: true});
        let outlineHeightAccommodationConstant = 1;
        if (this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel) {
            outlineHeightAccommodationConstant += this.getParent().isParapetPresent() ?
                this.getParent().getParapetHeight() :
                0;
        }
        this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry
            .clone()
            .translate(0, 0, outlineHeightAccommodationConstant));
        this.boundingBox = this.getBoundingBox({ reset: true });
    }

    updateRail() {
        if (this.getParent() instanceof SmartroofFace) {
            this.getParent().updateRail();
            this.getParent().updateAttachments();
        }
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        this.mergedMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.mergedEdgemesh.geometry.translate(deltaX, deltaY, deltaZ);

        // update the bounding box
        if (this.getParent() !== null) {
            this.boundingBox = this.getBoundingBox({ reset: true });
        }

        // update outline points without consequences
        for (let v of this.outlinePoints) {
            v.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update children
        for (let child of this.getChildren()) {
            child.moveObject(deltaX, deltaY, deltaZ);
        }
        this.saveState();
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.outlinePoints[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;

        this.updateGeometry();
    }

    getPlacingInformation(drawingVertices) {
        const response = {};
        let numberOfPoints;
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        // Getting vertices
        let vertices2DArray;
        if (drawingVertices === null || drawingVertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        }
        else {
            vertices2DArray = drawingVertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
            parentExists = true;
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        // for Gazebo the 4 oulinepoints are pre-defined and
        // it cant be changed so this is not required to check for gazebo
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints)) && (!this.objectType === 'Gazebo')) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        let erodedVertices = [];
        if (polygonExists) {
            if (vertices2DArray.length > 3) {
                erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            }
            else {
                const erodedVectorVertices = utils.generateSetbackGeometry(
                    [0.001, 0.001, 0.001],
                    this.getEdges(),
                    vertices2DArray,
                    'setbackInside',
                );
                erodedVertices = utils.convertVectorArrayTo2DArray(erodedVectorVertices);
            }

            if (erodedVertices.length === 0) {
                const error = new Error(POLYGON_WITH_NO_AREA_ERROR);
                response.errors.push(error);
                response.cannotCompleteError = error;
                parentExists = false;
            }

            if (parentExists) {
                const allModels =
                    raycastingUtils.getAllCommonModelsBelowVertices(erodedVertices, this.stage);
                //getAllCommonModelsBelowVertices is used instead of getAllModelsBelowVertices because such object is 
                // required whose all vertices cover the subarray instead of the highest object in that area.
                for (let idx = 0, len = allModels.length; idx < len; idx += 1) {
                    if (!allModels[idx][0].isIgnored()) {
                        [response.parent, response.height] = allModels[idx];
                        break;
                    }
                }
            }
        }

        return response;
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        try {
            await this.updateAssociatedModel();
        }
        catch (error) {
            console.error('ERROR: Subarray: placeObject failed', error);
            return Promise.reject(error);
        }
        // if the subarray was Tilted Mount, then change tilt, azimuth
        if (this.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
            const flushMountProperties = this.getFlushMountProperties();
            this.tilt = flushMountProperties.tilt;
            this.azimuth = flushMountProperties.azimuth;
        }

        // update geometry
        this.updateGeometry();
        this.validateStructures();

        const inverters = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            inverters.push(this.inverters[i]);
        }

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].removeObject()
        }
        this.inverters = [];

        try {
            // update panel placement
            if (!this.addTableFlow) {
                if (this.eastWestRackingEnabled && this.outlinePoints.length < 1) {
                    this.createBoundaryFromParent();
                }
                await this.updatePanelPlacement();
                // if (this.eastWestRackingEnabled && this.rackParent) {
                //     this.populateSubarrayForEastWestRacking();
                // }
            }
            this.saveState();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Subarray: placeObject failed', error);
            return Promise.reject(error);
        }
    }

    async updateAssociatedModel() {
        // check if place object possible
        const placingInformation = this.getPlacingInformation();
        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexSubarrayRemoved();
            }
            else if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setSubarrayOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.subarrayVertexEquivalentError();
            }
            else if (error.message === LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR) {
                // Do nothing
            }
            this.removeObject();
            return Promise.reject(error);
        }
        // get associated model

        // Jugaad fix for fill face
        if (this.associatedFillFaceModel) {
            this.associatedModel = this.associatedFillFaceModel;
        }
        else {
            this.associatedModel = placingInformation.parent;
        }
        // update parent
        this.changeParent(this.associatedModel);

        return Promise.resolve(true);
    }

    handleDragStart() {
        return false;
    }

    handleDragMove(deltaX, deltaY) {
        return false;
    }

    async handleDragEnd() {
        return false;
    }

    handleVertexDragStart(vertex){
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Subarray: vertex not in outlinePoints in handleVertexMove');
        }
        this.updateGeometry();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Subarray: vertex not in outlinePoints in handleVertexPlace');
        }
        let notificationObject = this.stage.eventManager.setUpdatePanelPlacementLoading();

        try {
            // place object
            await this.placeObject();

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);

            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);
            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
            return Promise.reject(error);
        }
    }

    handleParentParapetHeightUpdate(deltaParapetHeight) {
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.moveObjectWithoutConsequences(0, 0, deltaParapetHeight);
        }
    }

    // inverter functions

    // TODO: remove this function from all locations
    // This is not required ~ ust
    updateInverters(inverters) {
        // this.inverters = inverters;
    }

    // addDCDB(inverter) {
    //     const dcdb = new DCDB(this.stage);
    //     const inverterDimesions = dcdb.getModuleDimensions()
    //     const dcdbPlacentInfo = this.getComponentPlacementInfo(inverterDimesions);
    //     dcdb.azimuth = parseFloat(dcdbPlacentInfo.azimuth.toFixed(2));
    //     dcdb.updateGeometry();
    //     dcdb.placeObject(dcdbPlacentInfo.position.x, dcdbPlacentInfo.position.y, 0);
    //     dcdb.linkedInveter = inverter;
    //     return dcdb;
    // }

    // addInverter(inverterSpecification = {}) {
    //     const inverter = new Inverter(this.stage, inverterSpecification);
    //     const inverterDimesions = inverter.getModuleDimensions()
    //     const inverterPlacentInfo = this.getComponentPlacementInfo(inverterDimesions);
    //     inverter.azimuth = parseFloat(inverterPlacentInfo.azimuth.toFixed(2));
    //     inverter.updateGeometry();
    //     inverter.placeObjectForAddition(inverterPlacentInfo.position.x, inverterPlacentInfo.position.y, 0);
    //     for (let i = 0, l = inverter.mppts.length; i < l; i += 1) {
    //         inverter.mppts[i].setLinkedSubarrays([this]);
    //         this.addLinkedMppt(inverter.mppts[i]);
    //     }
    //     inverter.setStringingData(this.getModuleId());
    //     inverter.saveState({ withoutContainer: true });
    //     if (inverterSpecification.addDCDB) {
    //         const dcdb = this.addDCDB();
    //         inverter.linkedDcdb.push(dcdb);
    //     }
    //     return inverter;
    // }

    updateInverterAddition(inverterData) {
        const mppts = [];
        const mpptsMaxString = inverterData.inverterDetails.Number_of_Strings.replace(/\s/g , "");
        const arrayOfStrings = mpptsMaxString.split('/');
        for (let i = 0; i < inverterData.inverterDetails.Number_of_MPPT; i += 1) {
            let maxStrings = parseInt(arrayOfStrings[i]);
            if (isNaN(maxStrings)) {
                console.error(
                    'Error parsing the max strings in mppts with inverter id:',
                    inverterData.inverterDetails.id,
                    'Default set to 3',
                );
                maxStrings = 3;
            }
            mppts.push({
                maxStrings,
            })
        }
        const inverterSpec = {
            electricalProperties: inverterData.inverterDetails,
            mppts,
            addDCDB: inverterData.addDCDB,
        };
        for (let i = 0; i < inverterData.quantity; i += 1) {
            this.inverters.push(this.addInverter(inverterSpec));
        }
        this.saveState();
    }

    updateInverterAdditionForUnmappedInverters(inverterData) {
        const mppts = [];
        const inverterSpec = {
            electricalProperties: inverterData.inverterDetails,
            mppts,
            addDCDB: false,
        };
        for (let i = 0; i < inverterData.quantity; i += 1) {
            this.inverters.push(this.addInverter(inverterSpec));
        }
        this.saveState();
    }

    // TODO: remove this function from all
    // loacations.
    updateInverterDeletion(inverter) {
    }

    getComponentPlacementInfo(componentDimesions) {
        const edges = this.getEdges();
        let maxLengthSquared = 0;
        let index = 0;
        for (let i = 0, l = edges.length; i < l; i += 1) {
            const lengthSquared = edges[i][0].distanceToSquared(edges[i][1]);
            if (lengthSquared > maxLengthSquared) {
                index = i;
                maxLengthSquared = lengthSquared;
            }
        }
        const vertex1 = edges[index][0];
        const vertex2 = edges[index][1];

        const vectorAlongEdge = new THREE.Vector3().subVectors(vertex2, vertex1);
        const lengthOfEdge = vertex2.distanceTo(vertex1);
        vectorAlongEdge.normalize();
        const inverterAzimuth = Math.abs(utils.vectorToAzimuth(vectorAlongEdge));
        this.inverterLerpPosition +=
            ( 1 + parseInt(componentDimesions.moduleWidth)) / lengthOfEdge;
        const placementPosition = new THREE.Vector3().
            lerpVectors(vertex1, vertex2, this.inverterLerpPosition);
        return {
            position: placementPosition,
            azimuth: inverterAzimuth,
        }
    }

    removeInverter(inverter) {
        const index = this.inverters.indexOf(inverter);
        if (index > -1) {
            this.inverters.splice(index, 1);
            // IMPORTANT: Currently not handeling the case when we delete an inverter
            // this.saveState();
        }
    }

    addLinkedMppt(mppt) {
        this.linkedMppts.push(mppt);
    }

    removeLinkedMppt(mppt) {
        if (this.linkedMppts.includes(mppt)) {
            this.linkedMppts.splice(this.linkedMppts.indexOf(mppt), 1);
        }
    }

    removePanelFromString(panel) {
        for (let i = 0, l = this.linkedMppts.length; i < l; i += 1) {
            this.linkedMppts[i].removePanelFromString(panel);
        }
    }

    // Solar Access functions

    isSolarAccessComputed() {
        for (let child of this.getChildren()) {
            if (!child.isSolarAccessComputed()) {
                return false;
            }
        }
        return true;
    }

    updateSolarAccess(solarAccessMap) {
        for (let child of this.getChildren()) {
            child.updateSolarAccess(solarAccessMap);
        }
    }

    getMaxSolarAccess() {
        let maxSolarAccess = -Infinity;
        for (let child of this.getChildren()) {
            maxSolarAccess = Math.max(maxSolarAccess, child.getMaxSolarAccess());
        }
        return maxSolarAccess;
    }

    optimiseOnSolarAccess(solarAccessThreshold) {
        for (let child of this.getChildren()) {
            child.optimiseOnSolarAccess(solarAccessThreshold);
        }
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

        if (this.linkedSubarray) {
            this.linkedSubarray.hideMergedMeshes();
            this.linkedSubarray.showIndividualPanelMeshes();
        }

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
    // noinspection JSMethodCanBeStatic
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

            if (sortedTables[ i ].linkedTable) {
                // update linked panel's electrical component in east west racking 
                for(let j = 0 ; j < sortedTables[i].linkedTable.children.length ; j++) {
                    let panel = sortedTables[i].linkedTable.children[j];
                    if (panel.electricalComponentConnected !== null) {
                        this.stage.stateManager
                            .addElectricalComponentAffected(panel.electricalComponentConnected);
                        panel.electricalComponentConnected.removePanel(panel);
                    }
                }
                sortedTables[ i ].linkedTable.hideTable();
            }
        }
        // update the rails after hiding tables
        this.updateRail();
        return sortedTables[nTables -1].getAverageSolarAccess().toFixed(3);
    }

    onCloseOptimise() {
        // on closing optimise we update and switch back to the merged mesh
        // and hide the individual meshes of the panels.
        this.mergeGeometriesForAllPanels();
        this.showMergedMeshes();
        this.hideIndividualPanelMeshes();

        if (this.linkedSubarray) {
            this.linkedSubarray.mergeGeometriesForAllPanels();
            this.linkedSubarray.showMergedMeshes();
            this.linkedSubarray.hideIndividualPanelMeshes();
        }
    }

    // Properties Update functions
    updateObjectForRack(properties){
        if(this.linkedSubarray != null){
            this.linkedSubarray.removeObject( {shouldSaveState: true}, true);
            this.linkedSubarray = null
        }
    }
    // TODO: Add update for when module is changed
    async  updateObject(properties, fromEWRackFlag = false) {
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
        if (properties.hasOwnProperty('rowSpacing')
            && properties.rowSpacing !== this.rowSpacing) {
            this.rowSpacing = properties.rowSpacing;
            updatePanelsRequired = true;
        }
        if (properties.hasOwnProperty('rowSpacingMode')
            && properties.rowSpacingMode !== this.rowSpacingMode) {
            this.rowSpacingMode = properties.rowSpacingMode;
        }
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
        if (properties.hasOwnProperty('eastWestRackingEnabled')){
            this.eastWestRackingEnabled = properties.eastWestRackingEnabled;
            if(properties.eastWestRackingEnabled ){
                if(this.structureType !== "Default Fixed Tilt"){
                    this.structureType = "Default Fixed Tilt";
                    structureUpdated = true;
                }
                if (this.rackParent) updatePanelsRequired = true;
                
            }
        }
        this.validateStructures();
        if(this.rackParent == false){
        }else{
            this.stage.eventManager.setObjectsSelected(this);

        }
        if (updatePanelsRequired || fromEWRackFlag) {
            const inverters = [];

            for (let i = 0, l = this.inverters.length; i < l; i += 1) {
                inverters.push(this.inverters[i]);
            }
    
            for (let i = 0, l = inverters.length; i < l; i += 1) {
                inverters[i].removeObject();
            }

            this.inverters = [];
            try {
                // if(this.eastWestRackingEnabled && this.outlinePoints.length < 1) {this.createBoundaryFromParent();}
                await this.updatePanelPlacement();
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

    createLinkedSubarray(linkedSubarrayID = null){
        // if(this.linkedSubarray != null) this.linkedSubarray.removeObject( {shouldSaveState: true}, true);
        this.linkedSubarray = new Subarray(this.stage);
        if (linkedSubarrayID) this.linkedSubarray.id = linkedSubarrayID;
        this.linkedSubarray.associatedModel = this.associatedModel;
        this.linkedSubarray.rackParent = false
        this.linkedSubarray.rackSubarray = this;
        this.associatedModel.addChild(this.linkedSubarray);
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const pos = this.outlinePoints[i].getPosition();
            const newOutlinePoint = new OutlinePoints(pos.x, pos.y, pos.z, this.linkedSubarray, this.stage);
            this.linkedSubarray.outlinePoints.push(newOutlinePoint);
        }
        // this.linkedSubarray.outlinePoints = this.outlinePoints;
        this.linkedSubarray.addTableFlow = true;
        this.linkedSubarray.eastWestRackingEnabled = true;
        this.linkedSubarray.changePropertiesDuringCreation(this);
        this.linkedSubarray.structureType = "Default Fixed Tilt"
        // this.linkedSubarray.changePropertiesDuringCreation({azimuth: (this.azimuth + 180)})
        let newAzimuth = this.azimuth + 180;
        if(newAzimuth >= 360) newAzimuth -= 360;
        this.linkedSubarray.azimuth = newAzimuth;
        // this.linkedSubarray.updateObject(this)
        this.linkedSubarray.parent = this.parent;
        this.linkedSubarray.updateGeometry();
        // this.linkedSubarray.createBoundaryFromParent()
        this.linkedSubarray.saveState();
    }
    
    validateStructures() {
        if(!this.structureType || !this.isStructureRequired()) {
            return;
        }
        if(!this.eastWestRackingEnabled){
            this.structureErrors = getStructureValidationErrorMessages(
                this,
                this.structureType,
            );
        }
    }

    updateSubarrayForAddTable(properties) {
        this.changePropertiesDuringCreation(properties);
        this.createBoundaryFromParent();
        this.saveState();
    }

    // populateSubarrayForEastWestRacking(isLoad = false, linkedSubarrayID = null){
    //     this.createLinkedSubarray(linkedSubarrayID);
    //     const rows = this.getChildren();
    //     let boundaryVertices;
    //     if (this.placablePolygonVertices && this.placablePolygonVertices.length > 0) {
    //         boundaryVertices = this.placablePolygonVertices;
    //     }
    //     else {
    //         boundaryVertices = this.get2DVertices();
    //     }
        
    //     for(let i = 0; i < rows.length; i++){
    //         const rowMap = {
    //             id: 0,
    //             frames: [],
    //         };
    //         const row = new Row(this.stage, rowMap, { withoutContainer: false }, true);
    //         // row.saveState({ withoutContainer: false });
    //         const bBox = this.getBoundingBox();
                
    //         const rightDirection = bBox[3].clone().sub(bBox[0]);
    //         rightDirection.normalize();
    //         const upDirection = bBox[0].clone().sub(bBox[1]);
    //         upDirection.normalize();
    //         this.relativeTilt = this.getTiltWrtParentSurface();

    //         const finalDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, ((this.getTableDimensions({reset: true}).length * Math.cos(this.relativeTilt)) + this.intraRowSpacing));

    //         for(let j = 0; j < rows[i].getChildren().length; j++){
    //             const currentTable =  rows[i].children[j];
    //             const templateTableMap = this.linkedSubarray.getTemplateTableMap({ withBBox: true });

    //             templateTableMap.panels.forEach((panel, idx) => {
    //                 panel.id = currentTable.children[idx].id
    //             })
    //             const table = new Table(this.stage, templateTableMap, { withoutContainer: isLoad }, false);
    //             table.id = currentTable.id;
    //             const position = currentTable.getPosition();
    //             position.y -= 0 // add inter row Spacing
    //             table.moveObject(position.x + finalDisplacement.x, position.y + finalDisplacement.y, position.z);
    //             // let isInside = true;
    //             let vertices = table.get2DVertices();
    //             let intersects = raycastingUtils.getAllModelsBelowVerticesCustom(vertices,this.stage,{includeObstacles: true})
    //             if (
    //                 isLoad || 
    //                 (intersects[0][0] == this.parent &&
    //                 utils.checkPolygonInsidePolygon(vertices,boundaryVertices) &&
    //                 !(utils.checkIntersectionWithSiblingsCustom(this.parent, table, vertices))
    //                  )) {
    //                 table.linked = true;
    //                 table.linkedTable = currentTable;
    //                 currentTable.linkedTable = table;
    //                 currentTable.eastWestParent = true;
    //                 table.eastWestParent = false;
    //                 currentTable.linked = true;
    //                 table.clickToAdd = true;
    //                 table.hidden = currentTable.hidden;
    //                 row.addChild(table)
    //             }
    //             else {
    //                 this.stage.stateManager.removeObjectStatesFromAll({ uuid: table.uuid });
    //                 table.removeObject();
    //             }
    //         }
    //         if(row.children.length > 0){
    //             this.linkedSubarray.addChild(row);
    //         }
    //     }
    //     // Remove any table that is not linked
    //     for (let i = 0; i < this.linkedSubarray.children.length; i++) {
    //         const row = this.linkedSubarray.children[i];
    //         for(let j = 0; j < row.children.length; j++){
    //             if(!row.children[j].linked){
    //                 row.children[j].removeObject();
    //                 j--;
    //             }
    //             else {
    //                 row.children[j].saveState({ withoutContainer: isLoad });
    //             }
    //         }
    //         if (row.children.length === 0) {
    //             row.removeObject();
    //             i--;
    //         }
    //         else {
    //             row.saveState({ withoutContainer: isLoad });
    //         }
    //     }

    //     // remove unlinked tables from current subarray
    //     for (let i = 0; i < this.children.length; i++) {
    //         const row = this.children[i];
    //         for(let j = 0; j < row.children.length; j++){
    //             if(!row.children[j].linked){
    //                 row.children[j].removeObject();
    //                 j--;
    //             }
    //             else {
    //                 row.children[j].saveState({ withoutContainer: isLoad });
    //             }
    //         }
    //         if (row.children.length === 0) {
    //             row.removeObject();
    //             i--;
    //         }
    //         else {
    //             row.saveState({ withoutContainer: isLoad });
    //         }
    //     }

    //     this.mergeGeometriesForAllPanels();
    //     this.linkedSubarray.mergeGeometriesForAllPanels();
    // }

    getCurrentParent(deconstructSmartRoofFaces = true, position = this.stage.mousePoint) {
        const objectMeshes = this.stage.dragControls.getAllObjectMeshes().filter((object)=> {return (object instanceof Mesh)});
        const hitArray = raycastingUtils.getAllObjectsBelowPoint(
            position,
            this.stage,
            this.raycaster,
            objectMeshes,
            );

        const objectArray = hitArray.filter((object)=>{return (object[0] instanceof SmartroofModel || (object[0] instanceof PolygonModel && !object[0].isIgnored()) || object[0] instanceof Ground) || object[0] instanceof CylinderModel})
        if (objectArray.length >= 1) {
            if (objectArray[0][0] instanceof SmartroofModel && deconstructSmartRoofFaces) {
            //     this.selectedSmartroofFaces = null;
            //     objectArray[0][0].children.forEach((child, index) => {
            //         const checkSmartroofFaceVertices = utils.inspectPointInsideVertices(objectArray[0][0].children[index].get2DVertices(), position)
            //         if (checkSmartroofFaceVertices) this.selectedSmartroofFaces = child;
            //     });
            //     return [this.selectedSmartroofFaces];
            const topObject = objectArray[0][0];

            for( let i = 0; i < topObject.getChildren().length; i+=1 ){
                if (topObject.getChildren()[i].isDeleted) continue;
                const raycaster = new THREE.Raycaster(new Vector3(position.x, position.y, 500), new Vector3(0,0,-1));
                const intersects = raycaster.intersectObject(topObject.getChildren()[i].faceMesh, true);
                if(intersects.length > 0){
                    return [topObject.getChildren()[i]]
                }
            }

            }
            return objectArray[0];
        } else {
            return [this.stage.ground];
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
        // @@@@@@@@@@
        // this.changePropertiesDuringCreation(properties);
        // this.boundingBox = this.getBoundingBox({ reset: true });
        // this.getChildren()[0].getChildren()[0].changeTableDuringCreation();
        // @@@@@@@@@@
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
        if (properties.hasOwnProperty('rowSpacing')
            && properties.rowSpacing !== this.rowSpacing) {
            this.rowSpacing = properties.rowSpacing;
        }
        if (properties.hasOwnProperty('rowSpacingMode')
            && properties.rowSpacingMode !== this.rowSpacingMode) {
            this.rowSpacingMode = properties.rowSpacingMode;
        }
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
        if (properties.hasOwnProperty('eastWestRackingEnabled')){
            this.eastWestRackingEnabled = properties.eastWestRackingEnabled;
            if(properties.eastWestRackingEnabled ){
                if(this.structureType !== "Default Fixed Tilt"){
                    this.structureType = "Default Fixed Tilt";
                }
                
            }
        }
        if (properties.hasOwnProperty('intraRowSpacing')
        && properties.intraRowSpacing !== this.intraRowSpacing) {
            this.intraRowSpacing = properties.intraRowSpacing;
        }
        if (properties.hasOwnProperty('interRowSpacing')
            && properties.interRowSpacing !== this.interRowSpacing) {
            this.interRowSpacing = properties.interRowSpacing;
        }
    }

    changeMountHeight(prevValue) {
        const deltaZ = this.mountHeight - prevValue;

        const children = this.getChildren();
        for (let idx = 0, len = children.length; idx < len; idx += 1) {
            children[idx].moveObject(0, 0, deltaZ);
        }

        this.resetGrandParentSolarAccess();

        // resetting the solar access of this subarray.
        this.resetSolarAccess();
        this.mergeGeometriesForAllPanels();
    }


    // Helper functions

    get2DVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            vertices.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y
            ])
        }
        return vertices;
    }

    get3DVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            let position = outlinePoint.getPosition();
            vertices.push([
                position.x,
                position.y,
                this.getParent().getZOnTopSurface(position.x, position.y)
            ])
        }
        return vertices;
    }

    getHighestZ() {
        return this.mountHeight + this.getTableDimensions().height;
    }

    getArea() {
        const vertices = this.get2DVertices();
        const modVertices = vertices.map((vertex) => {
            return {
                x: vertex[ 0 ],
                y: vertex[ 1 ]
            }
        });
        return Math.abs(THREE.ShapeUtils.area(modVertices) / Math.cos(this.tilt * Math.PI / 180));
    }

    getAzimuth() {
        return this.azimuth;
    }

    getTilt(){
        return this.tilt;
    }

    getSructureType() {
        return this.structureType;
    }

    getPanelOrientation(){
        return this.panelOrientation;
    }

    getNumberOfPanels() {
        let nPanels = 0;
        for (let child of this.getChildren()) {
            nPanels += child.getNumberOfPanels();
        }
        return nPanels;
    }

    getEdges() {
        let vertices = utils.convertArrayToVector(this.get2DVertices());
        let edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([
                vertices[ i ],
                vertices[ i + 1 ]
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[ vertices.length - 1 ].x !== vertices[ 0 ].x ||
                vertices[ vertices.length - 1 ].y !== vertices[ 0 ].y)) {
            edges.push([
                vertices[ vertices.length - 1 ],
                vertices[ 0 ]
            ]);
        }

        return edges;
    }

    getNumberOfTables() {
        return this.getNumberOfPanels() / (this.tableSizeUp * this.tableSizeWide);
    }

    getPanelSize() {
        return this.moduleProperties.moduleSize;
    }

    getTableSize() {
        return this.moduleProperties.moduleSize * this.tableSizeUp * this.tableSizeWide;
    }

    get mesh() {
        return this.mergedMesh;
    }

    get tableSize() {
        return {
            up: this.tableSizeUp,
            wide: this.tableSizeWide,
        }
    }

    getDcSize() {
        return this.moduleProperties.moduleSize * this.getNumberOfPanels();
    }

    getModuleId() {
        return this.moduleProperties.moduleId;
    }

    getModuleMake() {
        return this.moduleProperties.moduleMake;
    }

    getModuleCharacteristics() {
        return this.panelProperties.characteristics;
    }

    getCellType() {
        return this.panelProperties.characteristics.cell_type;
    }

    getPanelProperties() {
        return this.panelProperties;
    }

    getModuleDimensions() {
        return {
            length: this.moduleProperties.moduleLength,
            width: this.moduleProperties.moduleWidth,
        }
    }

    getModuleSpacing(){
        return {
            up: this.moduleSpacingUp,
            wide: this.moduleSpacingWide
        };
    }

    getTableSpacing(){
        return this.tableSpacing;
    }

    getRowSpacing() {
        return this.rowSpacing;
    }

    getSubarrayMap(forSolar = false) {
        let subarrayMap = {
            uuid: this.getUUID(),
            id: this.id,
            name: this.name,
            rowSpacing: this.rowSpacing,
            tilt: parseFloat(this.tilt),
            // To be Tested the structure type thing
            structureType: this.structureType,
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

    getTables() {
        const rows = this.getChildren();
        const tables = [];
        for (let i = 0, l = rows.length; i < l; i += 1) {
            tables.push(...rows[i].getChildren());
        }
        return tables;
    }

    getPanels() {
        const panels = [];
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                panels.push(...tables[i].getChildren());
            }
        }
        return panels;
    }

    getPanelWithId(id) {
        const panels = this.getPanels();
        for (let i = 0, l = panels.length; i < l;  i += 1) {
            if (panels[i].getId() === id) {
                return panels[i];
            }
        }
        return null;
    }

    getTotalSolarAccess() {
        let totalSolarAccess = 0;
        for (let child of this.getChildren()) {
            totalSolarAccess += child.getTotalSolarAccess();
        }
        return totalSolarAccess;
    }

    getAverageSolarAccess() {
        let nPanels = this.getNumberOfPanels();
        if (nPanels > 0)
            return this.getTotalSolarAccess() / nPanels;
        else
            return 0;
    }

    getAssociatedModel() {
        return this.associatedModel;
    }

    getMountHeight() {
        return this.mountHeight;
    }

    getHiddenTables(hiddenTablesList) {
        hiddenTablesList = hiddenTablesList === undefined ? [] : hiddenTablesList;
        for (let row of this.getChildren()) {
            row.getHiddenTables(hiddenTablesList);
        }
        return hiddenTablesList;
    }

    findAndSetNewParentForTable(table) {
        const previousParent = table.getParent();
        if (previousParent !== null && previousParent !== undefined) {
            previousParent.removeChild(table, true);
            if (previousParent.getChildren().length < 1) {
                previousParent.removeObject({ shouldSaveState: true, deleteEmptyParent: false });
            }
        }
        const newRowParameters = this.getNewRowParameters(table);
        if (newRowParameters.type === ADD_TO_ROW) {
            const newRow = this.getChildren()[newRowParameters.rowIndex[0]];
            table.id = newRow.getHighestTableId() + 1;
            newRow.addChild(table, null, true);
            newRow.saveState();
        }
        else if (newRowParameters.type === CREATE_NEW_ROW) {
            const rowMap = {
                id: this.getHighestRowId() ? 0 : this.getHighestRowId()+1,
                frames: [],
            };
            const newRow = new Row(
                this.stage,
                rowMap,
                { withoutContainer: false },
                true,
            );
            this.addChild(newRow, newRowParameters.rowIndex[0]);
            newRow.addChild(table, null, true);
            newRow.saveState();
        }
        else if (newRowParameters.type === MERGE_ROWS) {
            const newRow = this.getChildren()[newRowParameters.rowIndex[0]];
            table.id = newRow.getHighestTableId() + 1;
            newRow.addChild(table, null, true);
            this.mergeRows(newRow, this.getChildren()[newRowParameters.rowIndex[1]]);
        }
    }

    getNewRowParameters(targetTable) {
        const rows = this.getChildren();
        const tableDimensions = this.getTableDimensions();
        const len = rows.length;
        const localPosition = targetTable.getLocalPosition(this);
        if (len === 0) { // no rows in subarray
            return {
                type: CREATE_NEW_ROW,
                rowIndex: [0],
            };
        }
        const rowParameters = {
            type: '',
            rowIndex: [],
        };
        for (let idx = 0; idx < len; idx += 1) {
            // taking a margin of 0.001 meter.
            if (Math.abs(localPosition.y -
                ((rows[idx].getlocalBoundingBox().minY + rows[idx].getlocalBoundingBox().maxY)
                    / 2))
                    <= 0.001) {
                if ((localPosition.x >=
                        (rows[idx].getlocalBoundingBox().minX - (tableDimensions.width / 2)
                            - this.tableSpacing - 0.001)
                ) &&
                    (localPosition.x <=
                        (rows[idx].getlocalBoundingBox().maxX + (tableDimensions.width / 2)
                                + this.tableSpacing + 0.001))) {
                    rowParameters.type = ADD_TO_ROW;
                    rowParameters.rowIndex.push(idx);
                    if (rowParameters.rowIndex.length === 2) {
                        rowParameters.type = MERGE_ROWS;
                        break;
                    }
                }
            }
            // TODO:This might be used to sort the rows.
            // else {
            //     if(localPosition.y < ((rows[idx].getlocalBoundingBox().minY
            //    + rows[idx].getlocalBoundingBox().maxY) / 2)){
            //         if(rowParameters.rowIndex.length === 0) {
            //             rowParameters.type = CREATE_NEW_ROW;
            //             rowParameters.rowIndex = [idx];
            //         }
            //         break;
            //     }
            // }
        }
        if (rowParameters.type === '') {
            rowParameters.type = CREATE_NEW_ROW;
            rowParameters.rowIndex = len;
        }
        return rowParameters;
    }

    mergeRows(row1, row2) { // row2 is deleted and its tables are added to row1
        const len = row2.getChildren().length;
        for (let i = 0; i < len; i += 1) {
            const child = row2.removeChild(row2.getChildren()[0]); // removes the child at 0th index
            row1.addChild(child, null, { newFlow: true });
            child.saveState();
        }
        this.removeChild(row2);
        row2.saveState();
        row1.saveState();
    }

    // checks if the subarray was build from old panel placement
    // by checking the panel height
    setCorrectPanelCoordinates(subarrayMap) {
        const moduleLength = this.panelOrientation === PANEL_ORIENTATION_PORTRAIT ?
            this.moduleProperties.moduleLength : this.moduleProperties.moduleWidth;
        const moduleZlength = moduleLength * Math.sin(this.tilt * (Math.PI / 180));
        for(let rowMap of subarrayMap.rows) {
            for(let tableMap of rowMap.frames) {
                let ratio = 1;
                for(let panelMap of tableMap.panels) {
                    const p1 = panelMap.corners[1];
                    const p2 = panelMap.corners[2];
                    const zDiff = p1[2] - p2[2];
                    if(Math.abs(moduleZlength - zDiff) >= 0.0001) {
                        ratio = moduleZlength / zDiff;
                        break;
                    }
                }
                if(ratio !== 1) {
                    let lowestZ = Infinity;
                    // find the lowest point in table
                    for(let panel of tableMap.panels) {
                        for(let corner of panel.corners) {
                            if(corner[2] < lowestZ) {
                                lowestZ = corner[2];
                            }
                        }
                    }
                    for(let panel of tableMap.panels) {
                        for(let corner of panel.corners) {
                            corner[2] = lowestZ + (corner[2] - lowestZ) * ratio;
                        }
                    }
                }
            }
        }
        return subarrayMap;
    }

    createRowBlocksInSubarrayMap(subarrayMap) {
        const tableMaps = [];
        this.getBoundingBox({ reset: true });
        for(let rowMap of subarrayMap.rows) {
            for(let tableMap of rowMap.frames) {
                tableMap.position = getTableMapCentroid(tableMap);
                tableMap.localPosition = this.globalToLocalCoordinates(new 
                    THREE.Vector2(tableMap.position.x, tableMap.position.y), this.getBoundingBox());
                tableMaps.push(tableMap);
            }
        }
        tableMaps.sort((a, b) => a.localPosition.y - b.localPosition.y);
        if (tableMaps.length > 0) {
            let previousYPosition = tableMaps[0].localPosition.y;
            let sameYTables = [];
            const rows = [];
            const { width } = this.getTableDimensions();
            for (let i = 0, len = tableMaps.length; i <= len; i += 1) {
                // i !== len condition is to proces the last
                // sameYTables after the tableMaps are finished.
                if (i !== len && (tableMaps[i].localPosition.y - previousYPosition <= 0.001)) {
                    sameYTables.push(tableMaps[i]);
                }
                else {
                    sameYTables.sort((a, b) => a.localPosition.x - b.localPosition.x);
                    let previousXPosition =
                        sameYTables[0].localPosition.x - width - this.tableSpacing;
                    let row = [];
                    for (let j = 0, { length } = sameYTables; j < length; j += 1) {
                        if (Math.abs(sameYTables[j].localPosition.x - previousXPosition -
                            width - this.tableSpacing) <= 0.001) {
                            row.push(sameYTables[j]);
                        }
                        else {
                            rows.push(row);
                            row = [];
                            row.push(sameYTables[j]);
                        }
                        previousXPosition = sameYTables[j].localPosition.x;
                    }
                    if (row.length > 0) {
                        rows.push(row);
                    }
                    sameYTables = [];
                    sameYTables.push(tableMaps[i]);
                }
                if (i !== len) {
                    previousYPosition = tableMaps[i].localPosition.y;
                }
            }
            subarrayMap.rows = [];
            const tiltDiff = this.getTiltWrtParentSurface();
            for (let idx = 0, { length } = rows; idx < length; idx += 1) {
                if (rows[idx].length > 0) {
                    const rowMap = {
                        id: idx,
                        frames: [],
                        localBBox: {
                            minX: rows[idx][0].localPosition.x -
                                (this.getTableDimensions().width / 2),
                            maxX: rows[idx][rows[idx].length - 1].localPosition.x +
                                (this.getTableDimensions().width / 2),
                            minY: rows[idx][0].localPosition.y -
                                ((this.getTableDimensions().length / 2) *
                                Math.cos(tiltDiff)),
                            maxY: rows[idx][0].localPosition.y +
                                ((this.getTableDimensions().length / 2) *
                                Math.cos(tiltDiff)),
                        },
                    };
                    for (let i = 0, len = rows[idx].length; i < len; i += 1) {
                        rowMap.frames.push(rows[idx][i]);
                    }
                    subarrayMap.rows.push(rowMap);
                }
            }
        }
        return subarrayMap;
    }

    getHighestPanelId() {
        let highestPanelId = -Infinity;
        for (const row of this.getChildren()) {
            for (const table of row.getChildren()) {
                for (const panel of table.getChildren()) {
                    if (panel.getId() > highestPanelId) {
                        highestPanelId = panel.getId();
                    }
                }
            }
        }
        return highestPanelId;
    }

    getHighestTableId() {
        let highestTableId = -Infinity;
        for (const row of this.getChildren()) {
            for (const table of row.getChildren()) {
                if (table.getId() > highestTableId) {
                    highestTableId = table.getId();
                }
            }
        }
        return highestTableId;
    }

    getHighestRowId() {
        let highestId = -Infinity;
        for (let i = 0, { length } = this.getChildren(); i < length; i += 1) {
            if (this.getChildren()[i].getId() > highestId) {
                highestId = this.getChildren()[i].getId();
            }
        }
        return highestId;
    }

    getOptimisedRowSpacing(params = {}) {
        const designSettings = this.stage.getDesignSettings();
        let startDate = designSettings["start_time_auto_row_spacing"].split(":");
        let endDate = designSettings["end_time_auto_row_spacing"].split(":");
        let latitude = this.stage.getLatitude();
        if (latitude > 0) {
            startDate = new Date(2019, 11, 21, parseInt(startDate[0]), parseInt(startDate[1]));
            endDate = new Date(2019, 11, 21, parseInt(endDate[0]), parseInt(endDate[1]));
        } else {
            startDate = new Date(2019, 5, 21, parseInt(startDate[0]), parseInt(startDate[1]));
            endDate = new Date(2019, 5, 21, parseInt(endDate[0]), parseInt(endDate[1]));
        }
        if (Object.keys(params).length === 0) {
            return getTimeBasedRowSpacing({
                panelOrientation: this.panelOrientation,
                moduleProperties: this.moduleProperties,
                tableSizeUp: this.tableSizeUp,
                moduleSpacingUp: this.moduleSpacingUp,
                tilt: this.tilt,
                azimuth: this.azimuth,
            }, this.stage.getLatitude(), this.stage.getLongitude(), startDate, endDate);
        }
        else {
            return getTimeBasedRowSpacing(params, this.stage.getLatitude(), this.stage.getLongitude(),
                startDate, endDate);
        }
    }
    async onSubarrayRotationEnd() {
        this.showObjectLayer();
        if (this.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
            this.rowSpacing = this.getOptimisedRowSpacing();
        }
        if (this.eastWestSubarray) {
            this.eastWestSubarray.showObjectLayer();
            this.eastWestSubarray.removeObject();
        }
        await this.placeObject();
        this.saveState();
    }
    getPossibleAzimuths({ isCreation } = { isCreation: false }) {
        // get the vertices in clockwise order
        const vertices = (isCreation && !this.addTableFlow)
            ? this.stage.drawManager.get2DVertices() : this.get2DVertices();
        if (vertices.length === 0) {
            return [];
        }
        if (utils.checkClockwise(vertices)) {
            vertices.reverse();
        }

        // getting normal for each pair
        vertices.push(vertices[0]);
        const azimuths = [];
        for (let idx = 0; idx < vertices.length - 1; idx += 1) {
            let angle = utils.toDegrees(Math.atan2(
                (vertices[idx + 1][1] - vertices[idx][1]),
                -(vertices[idx + 1][0] - vertices[idx][0]),
            ));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }

    highlight() {
        this.coreMesh.visible = true;
    }

    unHighlight() {
        this.coreMesh.visible = false;
    }

    highlightEdges() {
        this.coreEdges.visible = true;
    }

    unHighlightEdges() {
        this.coreEdges.visible = false;
    }

    getDefaultValues() {
        const designSettings = this.stage.getDesignSettings();
        let subarrayDefaults = {};
        if (designSettings.drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_FIXED) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.fixedMount;
        }
        else if (designSettings.drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.flushMount;
            subarrayDefaults.tilt = this.associatedModel.getTilt();
            subarrayDefaults.azimuth =
                subarrayDefaults.tilt === 0 ? 180 : this.associatedModel.getAzimuth();
        }else {
            subarrayDefaults = designSettings.drawing_defaults.subarray.eastWestRacking;
        }

        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: subarrayDefaults.azimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            mountType: designSettings.drawing_defaults.subarray.mountType,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacing: subarrayDefaults.rowSpacing,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
            monocrystallinepanels: designSettings.drawing_defaults.monocrystallinepanels,
        };
    }

    getFlushMountProperties() {
        const associatedTilt = this.associatedModel.getTilt();
        // Remove restriction on azimuth for Tilted Mounts when tilt is 0. The azimuth is directly obtained from the parent object.
        // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
        const associatedAzimuth = this.associatedModel.getAzimuth();
        const designSettings = this.stage.getDesignSettings();
        const subarrayDefaults = designSettings.drawing_defaults.subarray.flushMount;
        return {
            tilt: associatedTilt,
            azimuth: associatedAzimuth,
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
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
        };
    }

    getFixedMountProperties() {
        const designSettings = this.stage.getDesignSettings();
        const subarrayDefaults = designSettings.drawing_defaults.subarray.fixedMount;
        // Remove restriction on azimuth for Tilted Mounts when tilt is 0. The azimuth is directly obtained from the parent object.
        // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
        const associatedAzimuth = this.associatedModel.getAzimuth();
        let { rowSpacing } = subarrayDefaults;
        if (subarrayDefaults.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
            const optimizedRowSpacing = this.getOptimisedRowSpacing({
                panelOrientation: subarrayDefaults.panelOrientation,
                moduleProperties: subarrayDefaults.moduleProperties,
                tableSizeUp: subarrayDefaults.tableSizeUp,
                moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                tilt: subarrayDefaults.tilt,
                azimuth: subarrayDefaults.azimuth,
            });
            rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
        }
        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: associatedAzimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            rowSpacing,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
        };
    }
    getEastWestRackingProperties() {
        const designSettings = this.stage.getDesignSettings();
        const subarrayDefaults = designSettings.drawing_defaults.subarray.eastWestRacking;
        // Remove restriction on azimuth for Tilted Mounts when tilt is 0. The azimuth is directly obtained from the parent object.
        // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
        // const associatedAzimuth = this.associatedModel.getAzimuth();
        let { interRowSpacing } = subarrayDefaults;
        if (subarrayDefaults.interRowSpacingMode === ROW_SPACING_MODE_AUTO) {
            const optimizedinterRowSpacing = this.getOptimisedRowSpacing({
                panelOrientation: subarrayDefaults.panelOrientation,
                moduleProperties: subarrayDefaults.moduleProperties,
                tableSizeUp: subarrayDefaults.tableSizeUp,
                moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                tilt: subarrayDefaults.tilt,
                azimuth: subarrayDefaults.azimuth,
            });
            interRowSpacing = optimizedinterRowSpacing < 0.001 ? 0.001 : optimizedinterRowSpacing;
        }
        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: subarrayDefaults.azimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            interRowSpacing,
            interRowSpacingMode: subarrayDefaults.interRowSpacingMode,
            intraRowSpacing: subarrayDefaults.intraRowSpacing,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            moduleProperties: subarrayDefaults.moduleProperties,
            panelProperties: subarrayDefaults.panelProperties,
        };
    }

    // getEastWestRackingProperties() {
    //     console.log('subeast');
    //     const designSettings = this.stage.getDesignSettings();
    //     const subarrayDefaults = designSettings.drawing_defaults.subarray.eastWestRacking;
    //     // Remove restriction on azimuth for Tilted Mounts when tilt is 0. The azimuth is directly obtained from the parent object.
    //     // const associatedAzimuth = associatedTilt === 0 ? 180 : this.associatedModel.getAzimuth();
    //     const associatedAzimuth = this.associatedModel.getAzimuth();
    //     let { rowSpacing } = subarrayDefaults;
    //     if (subarrayDefaults.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
    //         const optimizedRowSpacing = this.getOptimisedRowSpacing({
    //             panelOrientation: subarrayDefaults.panelOrientation,
    //             moduleProperties: subarrayDefaults.moduleProperties,
    //             tableSizeUp: subarrayDefaults.tableSizeUp,
    //             moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
    //             tilt: subarrayDefaults.tilt,
    //             azimuth: subarrayDefaults.azimuth,
    //         });
    //         rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
    //     }
    //     return {
    //         structureType: subarrayDefaults.structureType,
    //         tilt: subarrayDefaults.tilt,
    //         azimuth: associatedAzimuth,
    //         panelOrientation: subarrayDefaults.panelOrientation,
    //         mountHeight: subarrayDefaults.mountHeight,
    //         interRowSpacing: subarrayDefaults.interRowSpacing,
    //         interRowSpacingMode: subarrayDefaults.interRowSpacingMode,
    //         intraRowSpacing: subarrayDefaults.intraRowSpacing,
    //         tableSizeUp: subarrayDefaults.tableSizeUp,
    //         tableSizeWide: subarrayDefaults.tableSizeWide,
    //         tableSpacing: subarrayDefaults.tableSpacing,
    //         moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
    //         moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
    //         rowSpacing,
    //         moduleProperties: subarrayDefaults.moduleProperties,
    //         panelProperties: subarrayDefaults.panelProperties,
    //         rowSpacingMode: subarrayDefaults.rowSpacingMode,
    //     };
    // }

    getStructureErrors() {
        return this.structureErrors;
    }

    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.SUBARRAY;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    switchVisualState(newVisualState, recursive) {
        super.switchVisualState(newVisualState, recursive);
        if (this.visualState === VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS) {
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsBasedOnStates() {
        this.updateVisualsBasedOnStatesForCombinedPanelsMesh();
        const newColors = this.getColorMap();
        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges);

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        }
        else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    updateVisualsBasedOnStatesForCombinedPanelsMesh() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.mergedMesh.castShadow = true;
            this.mergedMesh.receiveShadow = true;
            this.mergedMesh.material.needsUpdate = true;
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.mergedMesh.castShadow = false;
            this.mergedMesh.receiveShadow = false;
            this.mergedMesh.material.needsUpdate = true;
        }
        this.mergeGeometriesForAllPanels();
    }

    removeOutlinePoints() {
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    // Stringing Mode

    enableSubarrayForStringing() {
        // this.showIndividualPanelMeshes();
        // this.hideMergedMeshes();
        this.showStringedPanels();
    }

    disableSubarrayForStringing() {
        // TODO: just change the color of the mesh
        this.mergeGeometriesForAllPanels({
            excludeTables: [],
            defaultMeshColor: 0x4A6A79,
        });
    }

    exitStringingMode() {
        // this.hideIndividualPanelMeshes();
        // this.showMergedMeshes();
        this.mergeGeometriesForAllPanels();
    }

    showStringedPanels() {

    }

    // Universal Functions

    onSelect() {
        // show outline
        if (this.rackSubarray) {
            this.rackSubarray.onSelect();
            this.stage.eventManager.setObjectsSelected(this.rackSubarray);
            this.stage.selectionControls.setSelectedObject(this.rackSubarray);
            return
        }
        this.coreEdges.visible = true;

        // show outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this)
        );
        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let v of this.outlinePoints) {
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v)
                );
            }
        }
    }

    deSelect() {
        // hide outline
        this.coreEdges.visible = false;

        // hide outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
    }

    showIndividualPanelMeshes() {
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                tables[i].showIndividualMesh();
            }
        }
    }

    hideIndividualPanelMeshes() {
        const rows = this.getChildren();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                tables[i].hideIndividualMesh();
            }
        }
    }

    hideMergedMeshes() {
        this.objectsGroup.remove(this.mergedMesh);
        this.objectsGroup.remove(this.mergedEdgemesh);
    }

    showMergedMeshes() {
        this.objectsGroup.add(this.mergedMesh);
        this.objectsGroup.add(this.mergedEdgemesh);
    }

    hideObject() {
        this.objectsGroup.visible = false;
        this._hiddenTables = this.getHiddenTables();
        for (let row of this.getChildren()) {
            row.hideObject();
        }
        for (let v of this.outlinePoints)
            v.hideObject();
    }

    showObjectWithoutOutlinePoints() {
        this.objectsGroup.visible = true;
        for (let row of this.getChildren()) {
            row.showObject(this._hiddenTables);
        }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (let row of this.getChildren()) {
            row.showObject(this._hiddenTables);
        }
        for (let v of this.outlinePoints)
            v.showObject();
    }

    showObjectLayer() {
        for(let child of this.objectsGroup.children){
            child.layers.enable(0);
        }
        for (let row of this.getChildren()) {
            row.showObjectLayer();
        }
    }

    hideObjectLayer(){
        for(let child of this.objectsGroup.children){
            child.layers.disable(0);
        }
        for (let row of this.getChildren()) {
            row.hideObjectLayer();
        }
    }

    removeObject({ shouldSaveState } = {shouldSaveState: true}) {
        if (this.eastWestRackingEnabled && this.rackParent) {
            if (this.linkedSubarray) this.linkedSubarray.removeObject({shouldSaveState: shouldSaveState});
        }
        let i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({shouldSaveState: shouldSaveState, deleteEmptyParent: false});
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

        if(this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i,1);
        }

        const inverters = [];

        if (this.inverters && this.inverters.length > 0) {
            for (let i = 0, l = this.inverters.length; i < l; i += 1) {
                inverters.push(this.inverters[i]);
            }
        }

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            inverters[i].removeObject()
        }
        this.inverters = [];
        // remove from quadtree
        this.stage.quadTreeManager.removeObject(this);
    }

    /**
     * merge all the geometries of panels then merge them
     * in one single geometry and mesh.
     */

    checkForArkaModuleMake(moduleMake) {
        const moduleMakeFirstWord = moduleMake.split(' ')[0];
        if (moduleMakeFirstWord === ARKA_MODULE_MAKE) {
            return true;
        }
        return false;
    }
    
    mergeGeometriesForAllPanels(
        {
            excludeTables,
            excludePanels,
            defaultMeshColor,
        } = {
            excludeTables: [],
            excludePanels: [],
            defaultMeshColor: COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
                [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR,
        }) {
        // get geometries for all the panels
        // then merge them
        if (defaultMeshColor === undefined) {
            defaultMeshColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR;
        }
        if (this.checkForArkaModuleMake(this.moduleProperties.moduleMake)) {
            defaultMeshColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR_MONO;
        }
        if (this.getPanelProperties() !== undefined) {
            if ((this.getCellType() === PANEL_TYPE_MONOCRYSTALLINE) && this.getDefaultValues().monocrystallinepanels) {
                    defaultMeshColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT]
                    [VISUAL_STATES.DEFAULT_STATES.DEFAULT].PANEL_MESH_COLOR_MONO;
            }
        }
        const withSolarAccess = this.stage
            .visualManager.containsVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS);
        let defaultColorRGB = null;
        if (!withSolarAccess) {
            const threejsColor = new THREE.Color(defaultMeshColor);
            defaultColorRGB  = {_rgb: [
                parseInt(threejsColor.r * 256),
                parseInt(threejsColor.g * 256),
                parseInt(threejsColor.b * 256),
                1,
            ]}
        }
        const geometries = [];
        const children = this.getChildren();
        const vertices = [];
        const panelColors = [];
        for (const row of children) {
            for (const table of row.children) {
                let excludeThisTable = false;
                if(excludeTables != undefined){
                    for (let i = 0, l = excludeTables.length; i < l; i += 1) {
                        if (excludeTables[i] === table) {
                            excludeThisTable = true;
                            break;
                        }
                    }
                }                
                if (!excludeThisTable && !table.isHidden()) {
                    for (const panel of table.children) {
                        let excludeThisPanel = false;
                        if(excludePanels != undefined){
                            for(let i = 0; i < excludePanels.length; i += 1) {
                                if(excludePanels[i] === panel) {
                                    excludeThisPanel = true;
                                    break;
                                }
                            }
                        }
                        if(!excludeThisPanel && !panel.isHidden()){
                            geometries.push(panel.panelMesh.geometry);
                            vertices.push(...(panel.getGeometry3DVertices()));
                            // panelColors.push(this.stage
                            //     .solarAccessColorMap(withSolarAccess ? panel.solarAccess.toFixed(2) : 0));
                            if (withSolarAccess) {
                                // if the panel solar access is default i.e zero 
                                // the panel color will be as per cell type mono or poly crystalline
                                if (panel.solarAccess.toFixed(2) == 0) {
                                    const threejsColor = new THREE.Color(defaultMeshColor);
                                    let defaultColorRGB  = {_rgb: [
                                        parseInt(threejsColor.r * 256),
                                        parseInt(threejsColor.g * 256),
                                        parseInt(threejsColor.b * 256),
                                        1,
                                    ]}
                                    panelColors.push(defaultColorRGB);
                                }
                                // else solar access color
                                else {
                                    panelColors.push(this.stage.solarAccessColorMap(panel.solarAccess.toFixed(2)));
                                }
                            }
                            else {
                                panelColors.push(defaultColorRGB);
                            }
                        }
                    }
                }
            }
        }
        // setting up vertices
        const typedVertices = new Float32Array(vertices.length);
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            typedVertices[i] = vertices[i];
        }
        const mergedGeometry = new THREE.BufferGeometry();
        mergedGeometry.setAttribute('position', new THREE.BufferAttribute(typedVertices, 3));

        // setting up vertex-coloring
        const colors = new Uint8Array(vertices.length);
        for (let i = 0, l = colors.length; i < l; i += 1) {
            colors[i] = panelColors[Math.floor(i / 18)]._rgb[i % 3];
        }
        const normalized = true;
        const colorAttrib = new THREE.BufferAttribute(colors, 3, normalized);
        mergedGeometry.setAttribute('color', colorAttrib);

        this.mergedMesh.geometry = mergedGeometry;
        this.mergedEdgemesh.geometry = new THREE.EdgesGeometry(mergedGeometry);

        this.mergedMesh.geometry.computeVertexNormals();
        // Jugaad: need to find a better solution for this.
        if (this.stage.sceneManager.scene) {
            this.stage.sceneManager.scene.remove(this.objectsGroup);
            this.stage.sceneManager.scene.add(this.objectsGroup);
        }
    }

    /**
     * Gives the nearest table out of all the tables in
     * the suarray to the given point
     * @param {Vector3} point
     */
    getNearestTableToPoint(point) {
        const rows = this.getChildren();
        let nearestDistance = Infinity;
        let nearestTable = null;
        for (let i = 0, l = rows.length; i < l; i += 1) {
            const tables = rows[i].getChildren();
            for (let i = 0, l = tables.length; i < l; i += 1) {
                const position = tables[i].getPosition();
                position.setZ(0);
                const currDistance = position.distanceToSquared(point)
                if (currDistance < nearestDistance) {
                    nearestDistance = currDistance;
                    nearestTable = tables[i];
                }
            }
        }
        if (nearestTable === null) {
            console.error('how can the subarray exist if no table???');
        }
        return nearestTable;
    }

    removeIfEmpty(showError = true) {
        if (this.getNumberOfPanels() === 0) {
            this.removeObject();
            if (!this.addTableFlow && showError) {
                this.stage.eventManager.subarrayEmptyError();
            }
            return true;
        }
        return false;
    }

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let point of this.outlinePoints) {
            let pointPosition = point.getPosition();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count++;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    isStructureRequired() {
        return this.mountType !== SUBARRAY_RACK_STYLE_FLUSH;
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getPanelId() {
        this.PANEL_MODEL_ID++;
        return this.PANEL_MODEL_ID;
    }

    static getObjectType() {
        return 'Subarray'
    }
}

Object.assign(
    Subarray.prototype,
    panelPlacementModule,
);

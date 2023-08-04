 import * as THREE from "three";
import { InstancedMesh } from "three";
import BaseObject from "../BaseObject";
import Row from "./Row";
import Subarray from "./Subarray";
import Table from "./Table";
import * as utils from '../../utils/utils';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { Color, Mesh, Vector2, Vector3 } from "three";
import { PANEL_ORIENTATION_LANDSCAPE, PANEL_ORIENTATION_PORTRAIT, ROW_SPACING_MODE_AUTO, SUBARRAY_RACK_STYLE_EWRACKING, SUBARRAY_RACK_STYLE_FIXED, SUBARRAY_RACK_STYLE_FLUSH } from "../../coreConstants";
import { checkPointOnGround, getAllModelsBelowVertices, getAllObjectsBelowPoint, getTopModelFromPoint, isIntersecting } from "../../utils/raycastingUtils";
import { SmartroofModel } from "../model/smartroof/SmartroofModel";
import { each } from "lodash";
import PolygonModel from "../model/PolygonModel";
import SmartroofFace from "../model/smartroof/SmartroofFace";
import CylinderModel from "../model/CylinderModel";
import InstancedTableMesh from "../subObjects/InstancedTableMesh";
import Ground from "../ground/Ground";
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import { validateJSTSPolygon } from "../../utils/JSTSConverter";
import { getNearestSubarrayForTableSnapping } from "../../utils/subarrayUtils";
import { getSubarrays } from "../../utils/exporters";
import Mousetrap from "mousetrap";
import createBufferGeometry from "../../utils/meshUtils";
import { ADD_EAST_TABLE } from "../../coreConstants";
import { ADD_WEST_TABLE } from "../../coreConstants";
import { ADD_EW_TABLE } from "../../coreConstants";
import EastWestRack from "../../lib/EastWestRacking";

export default class InstancedTable extends BaseObject {
    constructor(stage, subarrayProperties, startingParent, tableType) {
        super(stage);
        this.stage = stage;
        this.currentTableId = 0;
        this.totalModules = 0;
        this.intersectedTablesToBeRemoved = [];
        this.isEastWestModeEnabled = false;
        if (subarrayProperties)
        this.currentSubarrayProperties = subarrayProperties;
        else
        this.currentSubarrayProperties = this.getDefaultValues();

        if (startingParent && startingParent.tilt > 0) {
            this.currentSubarrayProperties.mountType = SUBARRAY_RACK_STYLE_FLUSH;
            this.currentSubarrayProperties = this.getDefaultValues(SUBARRAY_RACK_STYLE_FLUSH);
        }
        this.mainModel = startingParent;
        this.startingParent = this.currentSubarrayProperties.mountType == SUBARRAY_RACK_STYLE_FLUSH ? this.stage.ground : startingParent;
        this.allSubarrayProperties = [];
        this.allInstancedMeshes = [];
        this.placedInstancedMeshes = [];
        this.tableColor = new THREE.Color();
        this.currentBaseTable = null;
        this.currentPosition = new Vector3();
        this.previousPosition = new Vector3();
        this.currentSubarray = null;
        this.currentGeometry = createBufferGeometry();
        this.instanceTableOrientation = false;
        this.panelWidth = 0;
        this.panelHeight = 0;
        this.updateSummary = true;
        this.prevMeshRotation = this.currentSubarrayProperties.panelOrientation;
        this.temp = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();
        this.edgesGeometry = createBufferGeometry();
        this.raycaster.params.Line.threshold = 0.5 / this.stage.getNormalisedZoom();
        this.rect = this.stage.rendererManager.getDomElement().getBoundingClientRect();
        this.tableType = tableType;
        this.east_OR_westUpdated = false;
        if(this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING){
            this.isEastWestModeEnabled = true;
        }
        else {
            this.isEastWestModeEnabled = false;
        }
        if (tableType === ADD_EW_TABLE) {
            this.eastWestTableId = 0;
            this.currentInstancedMesh = new InstancedTableMesh(stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
            this.currentInstancedMeshEastWest = new InstancedTableMesh(stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
            this.snappingProperties = this.getSnappingPropertiesForEastWest();
        }
        else if (tableType === ADD_EAST_TABLE || tableType === ADD_WEST_TABLE) {
            this.currentTableId = 0;
            this.currentInstancedMesh = new InstancedTableMesh(stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
        }
        else {
            this.currentInstancedMesh = new InstancedTableMesh(
                stage,
                this.currentSubarrayProperties,
                this.isEastWestModeEnabled,
                this.tableType,
                this.startingParent,
            );
        }

         // create function for default values of east tables , west tables, east-west tables and give conditions here.

        if (this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
            if (this.tableType === ADD_EAST_TABLE) {
                this.eastSubarrayProperties = this.currentInstancedMesh.currentSubarrayProperties;
                // this.eastSubarrayProperties.azimuth = 270;
            }
            else if (this.tableType === ADD_WEST_TABLE) {
                this.westSubarrayProperties = this.currentInstancedMesh.currentSubarrayProperties;
                // this.westSubarrayProperties.azimuth = 90;
            }
            else {
                // this.currentInstancedMesh.currentSubarrayProperties.tableSizeUp = 1;
                this.eastSubarrayProperties = Object.assign({}, this.currentInstancedMesh.currentSubarrayProperties);
                this.westSubarrayProperties = Object.assign({}, this.currentInstancedMesh.currentSubarrayProperties);
                let newAzimuth = this.eastSubarrayProperties.azimuth + 180;
                if (newAzimuth >= 360) newAzimuth -= 360;
                this.westSubarrayProperties.azimuth = newAzimuth;
            }
        }

        this.placedInstancedMeshes.push(this.currentInstancedMesh);
        if (tableType === ADD_EW_TABLE) {
            this.placedInstancedMeshes.push(this.currentInstancedMeshEastWest);
        }


        this.placingTable = false;
        this.isDragged = false;
        this.dragStartParent = null;
        this.horizontalSnap = true;
        this.verticalSnap = true;
        this.bindSnapFunctions()

    }

    bindSnapFunctions(){
        Mousetrap.bind("z",()=>{
            this.disableHorizontalSnap();
        }, "keydown")
        Mousetrap.bind("z",()=>{
            this.enableHorizontalSnap();
        }, "keyup")

        Mousetrap.bind("x",()=>{
            this.disableVerticalSnap();
        }, "keydown")
        Mousetrap.bind("x",()=>{
            this.enableVerticalSnap()
        }, "keyup")
    }

    unbindSnapFunctions(){
        Mousetrap.unbind("z","keydown");
        Mousetrap.unbind("z","keyup");
        Mousetrap.unbind("x","keydown");
        Mousetrap.unbind("x","keyup");
    }

    disableHorizontalSnap(){
        this.horizontalSnap = false;
    }
    enableHorizontalSnap(){
        this.horizontalSnap = true;
    }
    disableVerticalSnap(){
        this.verticalSnap = false;
    }
    enableVerticalSnap(){
        this.verticalSnap = true;
    }

    createNewSubarray() {
        const newSubarray = new Subarray(this.stage);
        this.startingParent.addChild(newSubarray);
        newSubarray.associatedModel = this.startingParent;
        newSubarray.createBoundaryFromParent();
        newSubarray.addTableFlow = true;
        if (this.currentSubarrayProperties !== null) {
            newSubarray.updateSubarrayForAddTable(this.currentSubarrayProperties);
        }
        return newSubarray;
    }

    createNewSubarrayForEastWestRacking(subarrayProperties) {
        const newSubarray = new EastWestRack(this.stage, subarrayProperties);
        this.startingParent.addChild(newSubarray);
        newSubarray.associatedModel = this.startingParent;
        newSubarray.createBoundaryFromParent();
        newSubarray.addTableFlow = true;
        if (this.currentSubarrayProperties !== null) {
            newSubarray.updateSubarrayForAddTable(subarrayProperties);
        }
        return newSubarray;
    }

    getPreviousTablePosition() {
        return this.previousPosition;
    }

    getSnappingPropertiesForEastWest() {
        this.currentInstancedMesh.getSubarray().tableDimensions = this.updateTableDimensionsForEastWest(this.currentInstancedMesh.getSubarray().getTableDimensions());
        return this.currentInstancedMesh.getSubarray().tableDimensions;
    }

    async placeTable(mousePoint) {
        if (this.placingTable) {
            return;
        }
        this.deleteOverlappedPanels(mousePoint);
        let currentInstancedMeshArray = [];
        currentInstancedMeshArray.push(this.currentInstancedMesh.getMesh());
        if (this.tableType === ADD_EW_TABLE) {
            currentInstancedMeshArray.push(this.currentInstancedMeshEastWest.getMesh());
        }
        const intersects = getAllObjectsBelowPoint(
            mousePoint,
            this.stage,
            this.raycaster, currentInstancedMeshArray,
        );
        if (intersects.length <= 1) {
            if (this.currentPosition.x) {
                if (this.tableType === ADD_EW_TABLE) {
                    let moduleDistanceBasedOnOrientation;
                    if (this.currentSubarrayProperties.panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                        moduleDistanceBasedOnOrientation = this.snappingProperties.length * this.currentSubarrayProperties.tableSizeUp;
                    }
                    else {
                        moduleDistanceBasedOnOrientation = this.snappingProperties.width * this.currentSubarrayProperties.tableSizeUp;
                    }
                    const magnitude = (moduleDistanceBasedOnOrientation + this.currentSubarrayProperties.intraRowSpacing) / 2;
                    this.currentPositionEast = new THREE.Vector3(this.currentPosition.x, this.currentPosition.y, 0);
                    let temp = new THREE.Vector2(this.currentPositionEast.x, this.currentPositionEast.y);
                    const directionVector = new THREE.Vector2(1, 0).rotateAround(new Vector2(), utils.deg2Rad(90 - this.currentSubarrayProperties.azimuth));
                    const centerPosition = temp.clone().addScaledVector(directionVector, -magnitude);
                    this.currentPositionEast = centerPosition.clone().addScaledVector(directionVector, magnitude)
                    this.currentPositionWest = centerPosition.clone().addScaledVector(directionVector, -magnitude);


                    this.currentInstancedMesh.setColorAt(this.currentTableId);
                    this.currentInstancedMeshEastWest.setColorAt(this.eastWestTableId);
                    this.currentTableId++;
                    this.eastWestTableId++;
                    this.currentInstancedMesh.setColorAt(this.currentTableId + 1, new THREE.Color(0x64b5f6));
                    this.currentInstancedMeshEastWest.setColorAt(this.eastWestTableId + 1, new THREE.Color(0x64b5f6));
                    this.currentInstancedMesh.setInstanceCount(this.currentTableId + 1);
                    this.currentInstancedMeshEastWest.setInstanceCount(this.eastWestTableId + 1);
                    this.currentInstancedMesh.moveBaseTable(this.currentPositionEast);
                    this.currentInstancedMeshEastWest.moveBaseTable(this.currentPositionWest);
                    
                    this.movePlaceTable(this.currentPosition.x, this.currentPosition.y);
                    this.stage.eventManager.addTableMode(this, { updateSummary: true });
                }
                else {
                    this.currentInstancedMesh.setColorAt(this.currentTableId);
                    this.currentTableId++;
                    this.currentInstancedMesh.setColorAt(this.currentTableId + 1, new THREE.Color(0x64b5f6));
                    this.currentInstancedMesh.setInstanceCount(this.currentTableId + 1);
                    this.currentInstancedMesh.moveBaseTable(this.currentPosition);
                    this.movePlaceTable(this.currentPosition.x, this.currentPosition.y);
                    this.stage.eventManager.addTableMode(this, { updateSummary: true });
                }
            }
        }
    }

    getTable() {
        return this.currentTable;
    }

    getSubarray() {
        return this.currentInstancedMesh.getSubarray();
    }

    movePlaceTable(x, y) {
        const currentParent = this.getCurrentParent()[0];
        if (this.currentSubarrayProperties.rowSpacingMode === 'Auto' && this.currentSubarrayProperties.mountType !== SUBARRAY_RACK_STYLE_FLUSH) {
            this.currentSubarrayProperties.rowSpacing = this.currentInstancedMesh.getSubarray().getOptimisedRowSpacing();
        }

        if ((this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_FLUSH)) {
            if ((currentParent instanceof PolygonModel ||
                    currentParent instanceof SmartroofFace ||
                    currentParent instanceof CylinderModel) && !this.isDragged) {
                this.updateCurrentTiltAzimuth(currentParent.tilt, currentParent.azimuth);
            } else if (currentParent instanceof Ground && !this.isDragged) {
                this.updateCurrentTiltAzimuth(0, 0);
            }
        }
        if (this.tableType === ADD_EW_TABLE) {
            let moduleDistanceBasedOnOrientation;
            if (this.currentSubarrayProperties.panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                moduleDistanceBasedOnOrientation = this.currentSubarrayProperties.moduleProperties.moduleLength * this.currentSubarrayProperties.tableSizeUp;
            }
            else {
                moduleDistanceBasedOnOrientation = this.currentSubarrayProperties.moduleProperties.moduleWidth * this.currentSubarrayProperties.tableSizeUp;
            }
            const magnitude = (moduleDistanceBasedOnOrientation + this.currentSubarrayProperties.intraRowSpacing) / 2;
            this.currentPositionEast = new THREE.Vector3(x, y, 0);
            let temp = new Vector2(this.currentPositionEast.x, this.currentPositionEast.y);
            const directionVector = new THREE.Vector2(1, 0).rotateAround(new Vector2(), utils.deg2Rad(90 - this.currentSubarrayProperties.azimuth));
            const centerPosition = temp.clone().addScaledVector(directionVector, -magnitude);
            this.currentPositionEast = centerPosition.clone().addScaledVector(directionVector, magnitude)
            this.currentPositionWest = centerPosition.clone().addScaledVector(directionVector, -magnitude);

            this.currentInstancedMesh.setPositionAt(this.currentTableId, new THREE.Vector3(this.currentPositionEast.x, this.currentPositionEast.y, 0));
            this.currentInstancedMeshEastWest.setPositionAt(this.eastWestTableId, new THREE.Vector3(this.currentPositionWest.x, this.currentPositionWest.y, 0));
            this.currentInstancedMesh.setScaleAt(this.currentTableId, new THREE.Vector3(1, 1, 1));
            this.currentInstancedMeshEastWest.setScaleAt(this.eastWestTableId, new THREE.Vector3(1, 1, 1));
        }
        else if (this.tableType === ADD_EAST_TABLE || this.tableType === ADD_WEST_TABLE) {
            this.currentInstancedMesh.setPositionAt(this.currentTableId, new THREE.Vector3(x, y, 0));
            this.currentInstancedMesh.setScaleAt(this.currentTableId, new THREE.Vector3(1, 1, 1));
        }
        else {
            this.currentInstancedMesh.setPositionAt(this.currentTableId, new THREE.Vector3(x, y, 0));
            this.currentInstancedMesh.setScaleAt(this.currentTableId, new THREE.Vector3(1, 1, 1));
        }
        if(!this.currentInstancedMesh.parent){
            this.currentInstancedMesh.parent = currentParent;
        }
        this.currentPosition = new THREE.Vector3(x, y, 0);
        if (this.currentInstancedMesh.parent &&
            this.currentInstancedMesh.parent !== currentParent && !this.placingTable) {
            if (this.currentTableId > 0) {
                this.currentInstancedMesh.setInstanceCount(this.currentTableId);
                this.allInstancedMeshes.push(this.currentInstancedMesh);
            } else {
                this.currentInstancedMesh.removeObjectFromScene();
            }
            if (this.tableType === ADD_EW_TABLE) {
                if(!this.currentInstancedMeshEastWest.parent){
                    this.currentInstancedMeshEastWest.parent = currentParent;
                }
                if (this.eastWestTableId > 0) {
                    this.currentInstancedMeshEastWest.setInstanceCount(this.eastWestTableId);
                    // this.allInstancedMeshes.push(this.currentInstancedMeshEastWest);
                } else {
                    this.currentInstancedMeshEastWest.removeObjectFromScene();
                }
            }
            else if (this.tableType === ADD_EAST_TABLE || this.tableType === ADD_WEST_TABLE) {
                if(!this.currentInstancedMesh.parent){
                    this.currentInstancedMesh.parent = currentParent;
                }
                if (this.currentTableId > 0) {
                    this.currentInstancedMesh.setInstanceCount(this.currentTableId);
                    // this.allInstancedMeshes.push(this.currentInstancedMesh);
                } else {
                    this.currentInstancedMesh.removeObjectFromScene();
                }
            }
            if (this.tableType === ADD_EW_TABLE) {
                this.currentTableId = 0;
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, currentParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);    
                this.currentInstancedMesh.setPositionAt(0, new Vector3(this.currentPositionEast.x, this.currentPositionEast.y, 0));
                this.prevSnapObject = null;

                this.eastWestTableId = 0;
                this.currentInstancedMeshEastWest = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, currentParent);
                this.placedInstancedMeshes.push(this.currentInstancedMeshEastWest);
                this.currentInstancedMeshEastWest.setPositionAt(0, new THREE.Vector3(this.currentPositionWest.x, this.currentPositionWest.y, 0));
            }
            else if (this.tableType === ADD_EAST_TABLE || this.tableType === ADD_WEST_TABLE) {
                this.currentTableId = 0;
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, currentParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);    
                this.prevSnapObject = null;
                this.currentInstancedMesh.setPositionAt(0, new Vector3(x, y, 0));
            }
            else {
                this.currentTableId = 0;
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, currentParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);    
                this.prevSnapObject = null;
                this.currentInstancedMesh.setPositionAt(0, new Vector3(x, y, 0));
            }
        }
    }

    updateCurrentTiltAzimuth(tilt, azimuth) {
        if (this.currentSubarrayProperties.tilt !== tilt || this.currentSubarrayProperties.azimuth !== azimuth) {
            const updatedProperties = JSON.parse(JSON.stringify(this.currentSubarrayProperties));
            updatedProperties.tilt = tilt;
            updatedProperties.azimuth = azimuth;
            this.deleteMouseTable();
            if (this.currentTableId > 0) {
                this.allInstancedMeshes.push(this.currentInstancedMesh);
            } else {
                this.currentInstancedMesh.removeObjectFromScene();
            }
            this.currentTableId = 0;
            this.currentSubarrayProperties = updatedProperties;
            this.currentInstancedMesh = new InstancedTableMesh(
                this.stage,
                this.currentSubarrayProperties,
                this.isEastWestModeEnabled,
                this.tableType,
                this.startingParent,
            );
            this.placedInstancedMeshes.push(this.currentInstancedMesh);
            this.prevSnapObject = null;
            this.stage.eventManager.addTableMode(this);
        }
    }
    getSnappedPosition(mousepoint, forceNewSnapObject = false) {
        const mouseVector = new THREE.Vector3(mousepoint.x, mousepoint.y, 0);
        if (!(this.isDragged) || this.snapObject === null || forceNewSnapObject) {
            this.currentParent = this.getCurrentParent()[0];
            this.checkMeshes = [];
            if (this.currentInstancedMesh.instanceCount > 1 && this.currentParent === this.currentInstancedMesh.parent) {
                this.checkMeshes.push(this.currentInstancedMesh);
            }
            try{
                var children = this.currentParent.getChildren().filter((child)=>{return child instanceof Subarray && !child.addTableFlow})

            }catch(a){
                //console.log(this.currentParent)
                }
            if(children){
                this.checkMeshes.push(...children);
            }
            this.snapMeshes = [];
            this.snapObject = null;
            for (let i = 0; i < this.allInstancedMeshes.length; i++) {
                let mesh = this.allInstancedMeshes[i]
                if (mesh.parent == this.currentParent) this.checkMeshes.push(mesh);
            }
            if (this.checkMeshes.length > 0) {
                for (let i = 0; i < this.checkMeshes.length; i++) {
                    let mesh = this.checkMeshes[i]
                    if (mesh instanceof InstancedTableMesh && mesh.getSubarray().mountType == this.currentInstancedMesh.getSubarray().mountType) {
                        mesh.distance = Infinity;
                        let instanceCount = mesh.uuid == this.currentInstancedMesh.uuid ? (mesh.instanceCount - 1) : mesh.instanceCount;
                        for (let i = 0; i < instanceCount; i++) {
                            let midDistance = mouseVector.distanceTo(mesh.getPositionAt(i));
                            if(midDistance < 10){
                                const midPosition = mesh.getPositionAt(i)
                                const tableVertices = mesh.getVerticesAtPosition(i, midPosition);
                                const currentVertices = this.currentInstancedMesh.getVerticesAtPosition(this.currentTableId, new THREE.Vector3(mouseVector.x, mouseVector.y, 0));
                                // console.log(tableVertices,currentVertices);
                                let distance = Infinity
                                let snappedVertices = {}
                                for(let i = 0; i < tableVertices.length; i++){
                                    for(let j = 0; j < currentVertices.length; j++){
                                        const currentVector = new THREE.Vector2(currentVertices[i][0], currentVertices[i][1])
                                        const snapVector = new THREE.Vector2(tableVertices[j][0], tableVertices[j][1])
                                        const newDistance = currentVector.distanceTo(snapVector);
                                        if(newDistance < distance){
                                            snappedVertices= {
                                                x: i,
                                                y:j
                                            }
                                        }
                                        distance = Math.min(distance, newDistance)
                                        // if(distance<0.1){
                                        //     i = tableVertices.length;
                                        //     j = currentVertices.length;
                                        // }
                                    }
                                }
                                if (distance < mesh.distance) {
                                    mesh.distance = distance;
                                    mesh.nearestVector = mesh.getPositionAt(i);
                                    mesh.tableVertices = mesh.getVerticesAt(i);
                                    mesh.snappedVertices = snappedVertices;
                                    mesh.moveBaseTable(mesh.nearestVector);
                                }
                            }else{
                                //console.log("no snap tables found")
                            }
                        }
                        this.snapMeshes.push(mesh)
                    } else if (mesh instanceof Subarray && mesh != this.currentInstancedMesh.getSubarray() && mesh.mountType == this.currentInstancedMesh.getSubarray().mountType) {
                        mesh.distance = Infinity;
                        let tables = mesh.getTables();
                        let currentMesh = null;
                        const subarrayProperties = mesh;
                        if(mesh.instanceMesh){
                            currentMesh = mesh.instanceMesh;
                        }else{
                            currentMesh = new InstancedTableMesh(this.stage, subarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent, false);
                            currentMesh.forSnap = true;
                            currentMesh.snappingSubarray = mesh;
                            this.placedInstancedMeshes.push(currentMesh);
                            mesh.instanceMesh = currentMesh;
                        }  
                        currentMesh.distance = Infinity;
                        currentMesh.parent = this.currentInstancedMesh.parent;
                        currentMesh.snappedVertices = null;

                        for (let i = 0; i < tables.length; i++) {
                            let t = tables[i]
                            const position = t.snapPosition || utils.getCentroidOfPoints(t.get2DVertices());
                            t.snapPosition = position
                            if(position){
                                t.distance =  mouseVector.distanceTo(new THREE.Vector3(position.x, position.y, 0));                        
                                if(t.distance < 4){
                                    t.nearestVector = position;
                                    t.tableVertices = t.get2DVertices()
                                    t.isPlaced = true;
                                    t.currentSubarray = mesh;
                                    // this.snapMeshes.push(t)
                                
                                    const snapTable = t;
                                    if(snapTable instanceof Table){
                                        this.prevSnapObject = null;
                                        currentMesh.setPositionAt(snapTable.id, new Vector3(snapTable.nearestVector.x, snapTable.nearestVector.y, 0));                                       
                                        let distance = Infinity;
                                        let snappedVertices = {}
                                        const tableVertices = currentMesh.getVerticesAtPosition(snapTable.id, new Vector3(snapTable.nearestVector.x, snapTable.nearestVector.y, 0));
                                        const currentVertices = this.currentInstancedMesh.getVerticesAtPosition(this.currentTableId, new THREE.Vector3(mouseVector.x, mouseVector.y, 0));
                                        for(let i = 0; i < tableVertices.length; i++){
                                            for(let j = 0; j < currentVertices.length; j++){
                                                const currentVector = new THREE.Vector2(currentVertices[i][0], currentVertices[i][1]);
                                                const snapVector = new THREE.Vector2(tableVertices[j][0], tableVertices[j][1]);
                                                const newDistance = currentVector.distanceTo(snapVector);
                                                if(newDistance < distance){
                                                    snappedVertices= {
                                                        x: i,
                                                        y:j
                                                    }
                                                }
                                                distance = Math.min(distance, newDistance)
                                                // if(distance<0.1){
                                                //     i = tableVertices.length;
                                                //     j = currentVertices.length;
                                                // }
                                            }
                                        }
                                        currentMesh.fromTable = true;
                                        if(currentMesh.distance > distance){
                                            currentMesh.distance = distance;
                                            currentMesh.tableVertices = currentMesh.getVerticesAt(snapTable.id)
                                            currentMesh.nearestVector = currentMesh.getPositionAt(snapTable.id)
                                            currentMesh.moveBaseTable(new Vector3(snapTable.nearestVector.x, snapTable.nearestVector.y, 0))
                                            currentMesh.snappedVertices = snappedVertices;
                                        }
                                        if(!this.compareSubarrayProperties(currentMesh.currentSubarrayProperties, subarrayProperties)){
                                            mesh.instancedTable = null
                                        }
                                    }
                                }
                                if(currentMesh.snappedVertices){
                                    this.snapMeshes.push(currentMesh);
                                }

                            }
                        }
                    }
                    
                }

                if (this.snapMeshes.length > 0) {
                    this.snapObject = this.snapMeshes.reduce((a, b) => (a.distance < b.distance ? a : b));
                }
            }
        }
        if (this.snapObject !== null) {
            // console.log(this.snapObject.snappedVertices)
            return this.addTableSnap(this.snapObject, mouseVector);
        }
        return mousepoint;
    }

    updateTableDimensionsForEastWest(tableDimensions) {
        // console.log('tableDimensions: ', tableDimensions);
        let newUpdatedSubarrayProperties = this.currentInstancedMesh.getSubarray();
        let newTableDimensionsForEastWest = {
            height: tableDimensions.height,
            length: (tableDimensions.length * 2 + newUpdatedSubarrayProperties.interRowSpacing),
            width: tableDimensions.width,
        }
        return newTableDimensionsForEastWest;
    }

    addTableSnap(snapObject, mouseVector) {
        if (
            !(snapObject instanceof InstancedTableMesh) ||
            !snapObject.nearestVector
        ) {
            return mouseVector;
        }
        let smallestDelta = new THREE.Vector2(Infinity, Infinity);
        const snappingSubarray = snapObject.currentSubarray
        let snappingRowBBox = []
        this.removeXOffset = false;
        this.removeYOffset = false;
        if(snapObject instanceof Table){
            if(snapObject.parent){
                snapObject.parent.updateLocalBoundingBox()
                snappingRowBBox = snapObject.parent.getlocalBoundingBox();
            }
        }else{
            if(snappingSubarray.getChildren().length>0){
                snappingSubarray.getChildren()[0].updateLocalBoundingBox()
                snappingRowBBox = snappingSubarray.getChildren()[0].getlocalBoundingBox();
            }
        }
        const snapBox = snappingSubarray.getBoundingBox({ reset: true });
        snapObject.subarray = snappingSubarray;
        const tableLocalPosition = snappingSubarray
            .globalToLocalCoordinates(mouseVector, snapBox);
            
        const snappingPosition = snappingSubarray
            .globalToLocalCoordinates(snapObject.nearestVector, snapBox);
        let isEastWestMode = false;
        if (this.tableType === ADD_EW_TABLE) {
            isEastWestMode = true;
        }

        const isSnappingSubarrayPortrait = snappingSubarray.panelOrientation === PANEL_ORIENTATION_PORTRAIT;
        const isSnappingSubarrayLandscape = snappingSubarray.panelOrientation === PANEL_ORIENTATION_LANDSCAPE;
        const isSelectedTablePortrait = this.currentInstancedMesh.getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT;
        const isSelectedTableLandscape = this.currentInstancedMesh.getSubarray().panelOrientation === PANEL_ORIENTATION_LANDSCAPE;
        const isTableSizeUpSnap = snappingSubarray.tableSizeUp === 1;
        const isTableSizeWideSnap = snappingSubarray.tableSizeWide === 1;
        const isTableOneCrossOne = isTableSizeUpSnap && isTableSizeWideSnap && !isEastWestMode;

        this.tableDimensions = this.currentInstancedMesh.getSubarray().getTableDimensions();
        this.deltaRequired = new THREE.Vector2();

        const subarrayRelativeTiltFactor = Math.cos(this.currentInstancedMesh.getSubarray().getTiltWrtParentSurface());
        const selectedTableLength = this.currentInstancedMesh.getSubarray().getTableDimensions().length * subarrayRelativeTiltFactor;
        let rowWidth = this.tableDimensions.length * subarrayRelativeTiltFactor;
        if (isEastWestMode) rowWidth = this.tableDimensions.length * 2 * subarrayRelativeTiltFactor;
        const rowSpacing = this.currentInstancedMesh.getSubarray().getRowSpacing();
        const tableSpacing = snappingSubarray.getTableSpacing();

        let ySnapDistance;
        if (isSnappingSubarrayPortrait && isSelectedTableLandscape) {
            ySnapDistance = (rowWidth) / 2 + tableSpacing;
            if (isEastWestMode) {
                ySnapDistance = rowWidth + rowSpacing + this.currentInstancedMesh.getSubarray().intraRowSpacing;
            }
        } else {
            ySnapDistance = rowWidth + rowSpacing;
            if (isEastWestMode) {
                ySnapDistance = rowWidth + rowSpacing + this.currentInstancedMesh.getSubarray().intraRowSpacing;
            }
        }
        if (isSnappingSubarrayLandscape && isSelectedTablePortrait && isTableOneCrossOne && false) {
        } else if (tableLocalPosition.y > snappingRowBBox.minY - rowSpacing / 2) {
            this.deltaRequired.y = ((
                        ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2) /
                        ySnapDistance) %
                    1) *
                ySnapDistance -
                selectedTableLength / 2 - rowSpacing / 2;
        } else {
            this.deltaRequired.y = ((
                        ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2) /
                        ySnapDistance) %
                    1) *
                ySnapDistance +
                selectedTableLength / 2 + rowSpacing / 2;
        }

        let xSnapDistance;
        if (isSnappingSubarrayLandscape && isSelectedTablePortrait && isTableOneCrossOne) {
            xSnapDistance = (this.tableDimensions.width) / 2 + tableSpacing;
        } else {
            xSnapDistance = this.tableDimensions.width + tableSpacing;
        }
        const selectedTableWidth = this.currentInstancedMesh.getSubarray().getTableDimensions().width;
        if (isSnappingSubarrayPortrait && isSelectedTableLandscape && isTableOneCrossOne && false) {       
        } else if (snappingRowBBox.minX < tableLocalPosition.x) {
            this.deltaRequired.x =
                ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x) /
                    xSnapDistance) % 1) * xSnapDistance) +
                (selectedTableWidth / 2) + (tableSpacing / 2);
        } else {
            this.deltaRequired.x =
                ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x) /
                    xSnapDistance) % 1) * xSnapDistance) -
                (selectedTableWidth / 2) - (tableSpacing / 2);
        }
        if (isSnappingSubarrayPortrait && isSelectedTableLandscape) {
            ySnapDistance = this.tableDimensions.length / 2;
            let xStartOffset = 0;
            let xOffset = tableSpacing;
            xSnapDistance = xSnapDistance / 2 - tableSpacing / 2
            ySnapDistance = this.tableDimensions.length + tableSpacing;
            let yOffset = (this.tableDimensions.length * subarrayRelativeTiltFactor / 2);
            let yInsideRowBox = true;
            if(tableLocalPosition.y < (snappingRowBBox.minY) || tableLocalPosition.y > (snappingRowBBox.maxY)){
                ySnapDistance = this.tableDimensions.length + tableSpacing / 2
                this.removeXOffset = true;
                yOffset = -(this.tableDimensions.length * subarrayRelativeTiltFactor/ 2 + tableSpacing)
                xOffset = 0;
                yInsideRowBox = true;
                // console.log("positive y")
                
            }else{
                xOffset = tableSpacing
                this.removeXOffset = false
                yInsideRowBox = false;

            }
            
            // if(tableLocalPosition.x < (snappingRowBBox.minX) || tableLocalPosition.x > (snappingRowBBox.maxX)){
            //     xOffset = this.snapObject.getSubarray().getTableDimensions().width + tableSpacing / 2;
            // }


            this.alternatePanels = true

            if ((tableLocalPosition.y - this.snapObject.getSubarray().getTableDimensions().length / 2) > snappingRowBBox.minY) {
                this.deltaRequired.y = ((
                            ((tableLocalPosition.y - snappingRowBBox.maxY ) ) /
                            ySnapDistance) %
                        1) *
                    ySnapDistance + yOffset;
            } else {
                this.deltaRequired.y = ((
                            ((tableLocalPosition.y - snappingRowBBox.minY) ) /
                            ySnapDistance) %
                        1) *
                    ySnapDistance - yOffset;
            }
            let azimuth = this.currentSubarrayProperties.azimuth

            if (azimuth > 270 || azimuth == 0) {
                this.case1 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 3);
                this.case2 = (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 3);
                this.case3 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 1)
            }else if (azimuth > 0 && azimuth <= 90){
                this.case1 = (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 3);
                this.case2 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 3) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 0);
                this.case3 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 1);
            }else if (azimuth > 90 && azimuth <= 180){
                this.case1 = (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 1);
                this.case2 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 1);
                this.case3 = (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 3) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 2);
            }else if(azimuth > 180 && azimuth <= 270){
                this.case1 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 1);
                this.case2 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 1);
                this.case3 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 3) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 0);
            }

            if(yInsideRowBox){
                xSnapDistance = this.tableDimensions.width;
                if(this.case1){
                    this.deltaRequired.x = (snappingRowBBox.minX - tableLocalPosition.x - this.tableDimensions.width / 2 - tableSpacing) % xSnapDistance ; 
                    // console.log("case 1")     
                }else if(this.case2){
                    this.deltaRequired.x = (snappingRowBBox.minX - tableLocalPosition.x + this.tableDimensions.width / 2) % xSnapDistance ;
                    // console.log("case 2")
                }
                else if(this.case3){
                    // console.log("case 3")  
                    this.deltaRequired.x = (snappingRowBBox.maxX - tableLocalPosition.x - this.tableDimensions.width / 2 ) % xSnapDistance ;
                    }
                else{
                    this.deltaRequired.x = (snappingRowBBox.maxX - tableLocalPosition.x + this.tableDimensions.width / 2 + tableSpacing) % xSnapDistance ;
                    // console.log("case 4")
                }

            }else{
                if (tableLocalPosition.x  < snappingPosition.x) {
                    this.deltaRequired.x =
                        (snappingRowBBox.minX  - tableLocalPosition.x  - tableSpacing - this.tableDimensions.width / 2) % xSnapDistance ;
                            // tableLocalPosition.x += xOffset; 
                } else {
                    this.deltaRequired.x =
                        (snappingRowBBox.maxX  - tableLocalPosition.x  + tableSpacing + this.tableDimensions.width / 2) % xSnapDistance ;
                }
            }

        }
        else if(isSnappingSubarrayLandscape && isSelectedTablePortrait){
            ySnapDistance = this.tableDimensions.length * subarrayRelativeTiltFactor;
            // let yStartOffset = this.snapObject.getSubarray().getTableDimensions().length * subarrayRelativeTiltFactor /2
            let yOffset = 0;
            let xOffset = this.tableDimensions.width / 2
            let insideX = false

            if(tableLocalPosition.x < (snappingRowBBox.minX) || tableLocalPosition.x > (snappingRowBBox.maxX)){
                // yStartOffset = ySnapDistance
                xOffset = -(this.tableDimensions.width / 2 + tableSpacing);
                this.removeYOffset = true;
                yOffset = tableSpacing;
                insideX = true;
                // console.log("remove offset")
            }else{ 
                this.removeYOffset = false;
                insideX = false;
            }
            // if(tableLocalPosition.y < (snappingRowBBox.minY) || tableLocalPosition.y > (snappingRowBBox.maxY) && !this.removeYOffset){
            //     yOffset = this.snapObject.getSubarray().getTableDimensions().length * subarrayRelativeTiltFactor + tableSpacing;
        //     console.log("yoffset tre")
            // }
            this.alternatePanels = true

            let azimuth = this.currentSubarrayProperties.azimuth

            if (azimuth > 270 || azimuth == 0) {
                this.case1 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 1);
                this.case2 = (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 3);
                this.case3 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 1)
            }else if (azimuth > 0 && azimuth <= 90){
                this.case1 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 3);
                this.case2 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 1) || (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 0);
                this.case3 = (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 3)

            }else if (azimuth > 90 && azimuth <= 180){
                this.case1 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 3) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 0);
                this.case2 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 1);
                this.case3 = (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 3) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 0)

            }else if(azimuth > 180 && azimuth <= 270){
                this.case1 = (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 1);
                this.case2 = (this.snapObject.snappedVertices.x == 3 && this.snapObject.snappedVertices.y == 2) || (this.snapObject.snappedVertices.x == 2 && this.snapObject.snappedVertices.y == 3);
                this.case3 = (this.snapObject.snappedVertices.x == 1 && this.snapObject.snappedVertices.y == 0) || (this.snapObject.snappedVertices.x == 0 && this.snapObject.snappedVertices.y == 1)

            }

            if(insideX){
                if(this.case1){
                    this.deltaRequired.y =
                    (-snappingRowBBox.maxY + tableLocalPosition.y - (this.tableDimensions.length * subarrayRelativeTiltFactor) / 2 - tableSpacing) % ySnapDistance ;
                
                    // console.log("case 1")     
                }else if(this.case2){
                    this.deltaRequired.y =
                    (-snappingRowBBox.minY  + tableLocalPosition.y - this.tableDimensions.length * subarrayRelativeTiltFactor / 2) % ySnapDistance;
                    // console.log("case 2")
                }
                else if(this.case3){
                    this.deltaRequired.y =
                    (-snappingRowBBox.maxY + tableLocalPosition.y + (this.tableDimensions.length * subarrayRelativeTiltFactor) / 2) % ySnapDistance;
                    // console.log("case 3")  
                    }
                else{
                    this.deltaRequired.y =
                    (-snappingRowBBox.minY  + tableLocalPosition.y + this.tableDimensions.length * subarrayRelativeTiltFactor / 2 + tableSpacing) % ySnapDistance;
                
                //    console.log("case 4")
                }
            }else{
                if (tableLocalPosition.y > snappingPosition.y) {
                    this.deltaRequired.y =
                    (-snappingRowBBox.maxY + tableLocalPosition.y - (this.tableDimensions.length * subarrayRelativeTiltFactor) / 2 - tableSpacing - yOffset) % ySnapDistance ;                 
                } else {
                    this.deltaRequired.y =
                    (-snappingRowBBox.minY  + tableLocalPosition.y + this.tableDimensions.length * subarrayRelativeTiltFactor / 2 + tableSpacing + yOffset) % ySnapDistance;              
                }
                
            }


            xSnapDistance = selectedTableWidth;
            if ((tableLocalPosition.x - this.snapObject.getSubarray().getTableDimensions().width / 2) > snappingRowBBox.minX) {
                this.deltaRequired.x = ((
                            ((snappingRowBBox.maxX - tableLocalPosition.x) ) /
                            xSnapDistance) %
                        1) *
                    xSnapDistance - xOffset;
            } else {
                this.deltaRequired.x = ((
                            ((snappingRowBBox.minX - tableLocalPosition.x)) /
                            xSnapDistance) %
                        1) *
                    xSnapDistance + xOffset;
            }
        }
        else{
            this.alternatePanels = false
        }

        if (this.deltaRequired.length() < smallestDelta.length()) {
            smallestDelta = this.deltaRequired.clone();
        }

        if(!this.isDragged){
            if(!this.horizontalSnap){
                smallestDelta.x = 0;
            }
            if(!this.verticalSnap){
                smallestDelta.y = 0;
            }
        }
        
        if(!this.isDragged && this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_FLUSH){
            const snapTableWidth = this.snapObject.getSubarray().getTableDimensions().width;
            const snapTableLength = subarrayRelativeTiltFactor * this.snapObject.getSubarray().getTableDimensions().length;

            if(snapObject.nearestVector.distanceTo(mouseVector)>(Math.max(xSnapDistance, ySnapDistance, 30)*2)){
                smallestDelta.x = 0
                smallestDelta.y = 0
            }else{
                const minX = tableLocalPosition.x - this.tableDimensions.width / 2;
                const maxX = tableLocalPosition.x + this.tableDimensions.width / 2;
                const sMinX = snappingPosition.x - snapTableWidth / 2;
                const sMaxX = snappingPosition.x + snapTableWidth / 2;
                const xDiffNew = Math.min(Math.abs(minX - sMinX),Math.abs(minX - sMaxX), Math.abs(maxX - sMinX), Math.abs(maxX - sMaxX));
                const minY = tableLocalPosition.y - subarrayRelativeTiltFactor * this.tableDimensions.length / 2;
                const maxY = tableLocalPosition.y + subarrayRelativeTiltFactor * this.tableDimensions.length / 2;
                const sMinY = snappingPosition.y - snapTableLength / 2;
                const sMaxY = snappingPosition.y + snapTableLength / 2;
                const yDiffNew = Math.min(Math.abs(minY - sMinY),Math.abs(minY - sMaxY), Math.abs(maxY - sMinY), Math.abs(maxY - sMaxY));
                const xDiff = new Vector2(tableLocalPosition.x, 0).distanceTo(new Vector2(snappingPosition.x, 0));
                const yDiff = new Vector2(0, tableLocalPosition.y).distanceTo(new Vector2(0, snappingPosition.y));
                const delta = tableSpacing * 4
                this.snappingEnabled = true;
                if((xDiffNew > (delta))){
                    smallestDelta.x = 0
                    this.snappingEnabled = false;
                }
                if((yDiffNew > (delta))){
                    smallestDelta.y = 0
                    this.snappingEnabled = false;
                }
                
            }
        }

        const bBox = snapObject.currentSubarray.getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();
        const finalDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, smallestDelta.x);
        finalDisplacement.addScaledVector(upDirection, smallestDelta.y);
        return mouseVector.clone().add(finalDisplacement);
    }

    instanceTablePanelOrientation() {
        // let tempProps = ;
        // // if (this.isEastWestModeEnabled) {
        // //     this.currentSubarrayProperties.tableSizeUp = 2;
        // // }
        // if (this.getSubarray().mountType === SUBARRAY_RACK_STYLE_EWRACKING && this.tableType === ADD_EW_TABLE) {
        //     tempProps = this.currentInstancedMesh.eastWestProperties;
        // }
        const updatedProperties = JSON.parse(JSON.stringify(this.currentSubarrayProperties));
        updatedProperties.panelOrientation = this.currentSubarrayProperties
            .panelOrientation === 'Portrait' ? 'Landscape' : 'Portrait';
        this.updateObject(updatedProperties);
        this.stage.eventManager.addTableMode(this);
    }

    getDefaultValues(mountType) {
        const designSettings = this.stage.getDesignSettings();
        this.totalModules = designSettings.drawing_defaults.quickView.totalModules
        let subarrayDefaults = {};
        if ((mountType || designSettings.drawing_defaults.subarray.mountType) === SUBARRAY_RACK_STYLE_FIXED) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.fixedMount;
        } else if ((mountType || designSettings.drawing_defaults.subarray.mountType) === SUBARRAY_RACK_STYLE_FLUSH) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.flushMount;
            subarrayDefaults.tilt = 20;
            subarrayDefaults.azimuth = 180;
            // subarrayDefaults.tilt === 0 ? 180 : this.associatedModel.getAzimuth();
        }else {
            subarrayDefaults = designSettings.drawing_defaults.subarray.eastWestRacking;
            return {
                interRowSpacing: subarrayDefaults.interRowSpacing,
                intraRowSpacing: subarrayDefaults.intraRowSpacing,
                interRowSpacingMode: subarrayDefaults.interRowSpacingMode,
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
                mountType: mountType || designSettings.drawing_defaults.subarray.mountType,
                moduleProperties: subarrayDefaults.moduleProperties,
                rowSpacing: subarrayDefaults.rowSpacing,
                rowSpacingMode: subarrayDefaults.rowSpacingMode,
                panelProperties: subarrayDefaults.panelProperties
            };
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
            mountType: mountType || designSettings.drawing_defaults.subarray.mountType,
            moduleProperties: subarrayDefaults.moduleProperties,
            rowSpacing: subarrayDefaults.rowSpacing,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
            panelProperties: subarrayDefaults.panelProperties
        };
    }

    setStartParent() {
        this.dragStartParent = this.getCurrentParent();
        this.currentInstancedMesh.parent = this.getCurrentParent()[0];
        if(this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING && this.tableType === ADD_EW_TABLE) {
            this.currentInstancedMeshEastWest.parent = this.getCurrentParent()[0];
        }
    }

    checkIntersectionPointInvalid(point, lav) {
        const activeVertices = [];
        lav.forEach((vertex) => {
            activeVertices.push([vertex.position.x, vertex.position.y]);
        });
        return (utils.inspectPointInsideVertices(activeVertices, point));
    }

    getCurrentParent(deconstructSmartRoofFaces = true, position = this.stage.mousePoint) {
        const objectMeshes = this.stage.dragControls.getAllObjectMeshes().filter((object)=> {return (object instanceof Mesh)});
        const hitArray = getAllObjectsBelowPoint(
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

    mouseMoveErrorHandling(event, mousePoint) {
        this.placingError = [];
        let currentParent = this.getCurrentParent(true)[0];
        let currentMouseParent = this.getCurrentParent(true, mousePoint)[0];
        if (!checkPointOnGround(new THREE.Vector2(this.stage.mousePoint.x, this.stage.mousePoint.y), this.stage)) {
            this.placingError.push('object not on ground');
        } else if (this.isDragged) {
            if (this.dragStartParent[0].uuid !== currentMouseParent.uuid) {
                this.placingError.push('starting parent changed');
                // //console.log(this.dragStartParent[0],currentMouseParent)
            }
        }
        if(currentParent.uuid != this.getCurrentParent(true, this.currentInstancedMesh.getPositionAt(this.currentTableId))[0].uuid){
            this.placingError.push("different parent after snapping")
        }
        if (currentMouseParent.isObstruction) {
            this.placingError.push('parent is an obstruction');
        }
        if (this.stage.getRemainingDcSize() - this.getDcSize() < 0) {
            this.placingError.push('Reached DC Size Limit');
            if(!this.alertedLimit){
                notificationsAssistant.warning({
                    title: 'Reached DC size limit',
                    message: 'Please upgrade your plan',
                })
                this.alertedLimit = true;
            }
        }
        if (this.placingError.length >= 1) {
            this.currentInstancedMesh.setColorAt(this.currentTableId, new THREE.Color(0xf44336));
            if(this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING && this.tableType === ADD_EW_TABLE) {
                this.currentInstancedMeshEastWest.setColorAt(this.currentTableId, new THREE.Color(0xf44336));
            }
            this.placingTable = true;
        }else if(this.totalModules != 0 && this.getAllModuleQuantity(this.stage) > this.totalModules){
            if(!this.alertedLimit){
                notificationsAssistant.warning({
                    title: 'Reached Panel Limit',
                    message: 'Placing Panels Beyond Set Limit',
                })
                this.alertedLimit = true;
            }
            this.currentInstancedMesh.setColorAt(this.currentTableId, new THREE.Color(0xFFA500));
            this.placingTable = false;
        }else if(
            currentMouseParent instanceof SmartroofFace && currentMouseParent.isSetbackIntersecting(this.currentInstancedMesh, this.currentTableId)
        ){
            this.currentInstancedMesh.setColorAt(this.currentTableId, new THREE.Color(0xFF9966));
            this.placingTable = false;
            this.alertedLimit = false;
        }
         else {
            this.currentInstancedMesh.setColorAt(this.currentTableId, new THREE.Color(0x64b5f6));
            if(this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING && this.tableType === ADD_EW_TABLE) {
                this.currentInstancedMeshEastWest.setColorAt(this.currentTableId, new THREE.Color(0x64b5f6));
            }
            this.placingTable = false;
            this.alertedLimit = false;
        }
    }

    updateObject(updatedSubarrayProperties) {
        if (!this.compareSubarrayProperties(updatedSubarrayProperties, this.currentSubarrayProperties)) {
            if (this.currentTableId > 0) {
                this.currentInstancedMesh.setInstanceCount(this.currentTableId);

                this.allSubarrayProperties.push(this.currentSubarrayProperties);
                this.allInstancedMeshes.push(this.currentInstancedMesh);

            } else {
                this.currentInstancedMesh.setInstanceCount(this.currentTableId);
            }
            // //console.log(this.currentSubarrayProperties, updatedSubarrayProperties)
            let mountChanged = false;
            if(this.currentSubarrayProperties.mountType !== updatedSubarrayProperties.mountType){
                this.startingParent = updatedSubarrayProperties.mountType == SUBARRAY_RACK_STYLE_FLUSH ? this.stage.ground : this.mainModel;
                this.currentSubarrayProperties = this.getDefaultValues(updatedSubarrayProperties.mountType)
                mountChanged = true;
            }else{
                this.currentSubarrayProperties = updatedSubarrayProperties;
            }
            if (this.currentSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
                if ((this.tableType === ADD_EW_TABLE || this.tableType === null)) {
                    this.isEastWestModeEnabled = true;
                    // updatedSubarrayProperties.tableSizeUp = 1;
                    this.currentSubarrayProperties = updatedSubarrayProperties;
                    this.eastSubarrayProperties = Object.assign({}, updatedSubarrayProperties);
                    this.westSubarrayProperties = Object.assign({}, updatedSubarrayProperties);
                    let newAzimuth = this.eastSubarrayProperties.azimuth + 180;
                    if (newAzimuth >= 360) newAzimuth -= 360;
                    this.westSubarrayProperties.azimuth = newAzimuth;
                }
                else if ((this.tableType === ADD_EAST_TABLE || this.tableType === ADD_WEST_TABLE)) {
                    this.east_OR_westUpdated = true;
                    this.currentSubarrayProperties = updatedSubarrayProperties;
                }
            }
            else {
                this.isEastWestModeEnabled = false;
            }
            if (mountChanged) this.stage.eventManager.addTableMode(this);
            if (this.tableType === ADD_EW_TABLE) {
                this.currentInstancedMesh.setScaleAt(this.currentTableId);
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
                this.currentInstancedMeshEastWest.setScaleAt(this.eastWestTableId);
                this.currentInstancedMeshEastWest = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);
                this.placedInstancedMeshes.push(this.currentInstancedMeshEastWest);

                let moduleDistanceBasedOnOrientation;
                if (this.currentSubarrayProperties.panelOrientation === PANEL_ORIENTATION_PORTRAIT){
                    moduleDistanceBasedOnOrientation = this.currentSubarrayProperties.moduleProperties.moduleLength * this.currentSubarrayProperties.tableSizeUp;
                }
                else {
                    moduleDistanceBasedOnOrientation = this.currentSubarrayProperties.moduleProperties.moduleWidth * this.currentSubarrayProperties.tableSizeUp;
                }
                const magnitude = (moduleDistanceBasedOnOrientation + this.currentSubarrayProperties.intraRowSpacing) / 2;
                this.currentPositionEast = this.currentPosition;
                let temp = new Vector2(this.currentPositionEast.x, this.currentPositionEast.y);
                const directionVector = new THREE.Vector2(1, 0).rotateAround(new Vector2(), utils.deg2Rad(90 - this.currentSubarrayProperties.azimuth));
                this.currentPositionEast = temp.clone().addScaledVector(directionVector, magnitude)
                this.currentPositionWest = temp.clone().addScaledVector(directionVector, -magnitude);

                this.currentInstancedMesh.setPositionAt(this.currentTableId, new THREE.Vector3(this.currentPositionEast.x, this.currentPositionEast.y, 0));
                this.currentInstancedMeshEastWest.setPositionAt(this.eastWestTableId, new THREE.Vector3(this.currentPositionWest.x, this.currentPositionWest.y, 0));
                this.currentInstancedMesh.setScaleAt(this.currentTableId, new THREE.Vector3(1, 1, 1));
                this.currentInstancedMeshEastWest.setScaleAt(this.eastWestTableId, new THREE.Vector3(1, 1, 1));

                this.currentTableId = 0;
                this.eastWestTableId = 0;
                this.prevSnapObject = null;
            }
            else if (this.tableType === ADD_EAST_TABLE || this.tableType === ADD_WEST_TABLE) {
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);
                this.currentTableId = 0;
                this.prevSnapObject = null;
            }
            else {
                this.currentInstancedMesh = new InstancedTableMesh(this.stage, this.currentSubarrayProperties, this.isEastWestModeEnabled, this.tableType, this.startingParent);
                this.placedInstancedMeshes.push(this.currentInstancedMesh);
                this.currentTableId = 0;
                this.prevSnapObject = null;
            }
        }
    }

    convertInstancedMeshToSubarray() {
        this.stage.stateManager.startContainer();
        this.allInstancedMeshes.push(this.currentInstancedMesh);
        this.intersectedTablesToBeRemoved.forEach((ele) => {
            ele.removeObject();
        })
        for (let instanceMesh of this.allInstancedMeshes) {
            this.currentInstancedMesh = instanceMesh;
            this.currentSubarrayProperties = this.currentInstancedMesh.currentSubarrayProperties;
            this.startingParent = this.currentInstancedMesh.parent || this.stage.ground;
            
            // check for existing subarrays
            const existingSubarray = this.getSimilarSubarray(this.startingParent,this.currentSubarrayProperties);
            let subarray = null
            
            if (instanceMesh.instanceCount >= 1) {
                if(existingSubarray){
                    subarray = existingSubarray;
                }else{
                    subarray = this.createNewSubarray();
                }
                subarray.isEmpty = true;
                for (let i = 0; i < (this.currentInstancedMesh.instanceCount); i++) {
                    if (this.currentInstancedMesh.getScaleAt(i).x != 0) {
                        subarray.isEmpty = false;
                        const templateTableMap = subarray.getTemplateTableMap({ withBBox: true });
                        templateTableMap.hidden = false;
                        templateTableMap.isMoved = true;

                        let currentBaseTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
                        try {
                            const rowMap = {
                                id: i,
                                frames: [],
                            };
                            const row = new Row(this.stage, rowMap, { withoutContainer: true }, true);
                            subarray.addChild(row);
                            currentBaseTable.clickToAdd = true;
                            
                            row.addChild(currentBaseTable);
                            subarray.validateStructures();
                            const panels = currentBaseTable.getChildren();
                            for (let i = 0, l = panels.length; i < l; i += 1) {
                                panels[i].setId(subarray.getPanelId());
                            }
                            let position = this.currentInstancedMesh.getPositionAt(i);
                            let deltaZ = 0;
                            // if (this.currentSubarrayProperties.mountType === 'Fixed Tilt') {
                                if (this.currentInstancedMesh.parent.getTilt() == 0) {
                                    
                                    const lowestVertex = currentBaseTable.getLowestVertex();
                                    const associatedModelZ = Math.max(
                                        subarray.getAssociatedModel().getZOnTopSurface(
                                            lowestVertex.x,
                                            lowestVertex.y,
                                            ),
                                            0,
                                            );
                                            deltaZ += subarray.getMountHeight() - (lowestVertex.z - associatedModelZ);// need to add proper Logic
                                        }
                                        else {
                                            // Removing raycasting and using getzontopsurface instead as raycasting gives errors
                                            // const objectMeshes = this.stage.mergeManager.getAllMeshesInScene();
                                            // const objectArray = [];
                                // const objectArray = getAllObjectsBelowPoint(
                                //     new THREE.Vector3(position.x, position.y, 0),
                                //     this.stage,
                                //     this.raycaster,
                                //     objectMeshes,
                                // );
                                deltaZ = this.currentInstancedMesh.parent.getZOnTopSurface(position.x, position.y) + this.currentSubarrayProperties.mountHeight;
                            }
                            
                            currentBaseTable.moveObject(position.x, position.y, deltaZ);
                            
                            currentBaseTable.updateVisualsAfterLoadingAndCreation();
                            row.saveState();
                        } catch (error) {
                            console.error(error);
                            notificationsAssistant.error({
                                title: 'Add Table Mode',
                                message: 'Error placing table',
                            });
                            currentBaseTable.removeObject();
                        }
                    }                                                
                }
                if (!subarray.isEmpty && subarray.getParent()) {
                    try{
                        subarray.removeOutlinePoints();
                        subarray.addTableFlow = false;
                        subarray.createConvexHull();
                        subarray.mergeGeometriesForAllPanels();
                        // after the table is added to subarray we should update rails
                        subarray.updateRail();
                    }catch(e){
                        //console.log("ERROR CREATING SUBARRAY")
                    }
                } else {
                    subarray.removeIfEmpty();
                }
            }
            instanceMesh.removeObjectFromScene();
        }
        this.currentTableId = 0;
        this.stage.stateManager.stopContainer();
        this.removePlacedInstancedMeshes();
    }

    convertInstancedMeshToEast_OR_WestSubarray(tableType) {
        this.stage.stateManager.startContainer();
        this.allInstancedMeshes.push(this.currentInstancedMesh);
        this.intersectedTablesToBeRemoved.forEach((ele) => {
            ele.removeObject();
        })
        for (let instanceMesh of this.allInstancedMeshes) {
            this.currentInstancedMesh = instanceMesh;
            this.currentSubarrayProperties = this.currentInstancedMesh.currentSubarrayProperties;
            if (tableType === ADD_EAST_TABLE) {
                if (!this.east_OR_westUpdated) this.currentSubarrayProperties.azimuth = 90;
            }
            else {
                if (this.east_OR_westUpdated) {
                    let newAzimuth = this.currentSubarrayProperties.azimuth + 180;
                    if (newAzimuth >= 360) newAzimuth -= 360;
                    this.currentSubarrayProperties.azimuth = newAzimuth;
                }
                else {
                    this.currentSubarrayProperties.azimuth = 270;
                }
            }
            this.startingParent = this.currentInstancedMesh.parent || this.stage.ground;
            
            // check for existing subarrays
            const existingSubarray = this.getSimilarSubarray(this.startingParent,this.currentSubarrayProperties);
            let subarray = null
            
            if (instanceMesh.instanceCount >= 1) {
                if(existingSubarray){
                    subarray = existingSubarray;
                }else{
                    subarray = this.createNewSubarrayForEastWestRacking(this.currentSubarrayProperties);
                }
                subarray.isEmpty = true;
                for (let i = 0; i < (this.currentInstancedMesh.instanceCount); i++) {
                    if (this.currentInstancedMesh.getScaleAt(i).x != 0) {
                        subarray.isEmpty = false;
                        const templateTableMap = subarray.getTemplateTableMap({ withBBox: true });
                        templateTableMap.hidden = false;
                        templateTableMap.isMoved = true;

                        let currentBaseTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
                        try {
                            const rowMap = {
                                id: i,
                                frames: [],
                            };
                            const row = new Row(this.stage, rowMap, { withoutContainer: true }, true);
                            subarray.addChild(row);
                            currentBaseTable.clickToAdd = true;
                            
                            row.addChild(currentBaseTable);
                            subarray.validateStructures();
                            const panels = currentBaseTable.getChildren();
                            for (let i = 0, l = panels.length; i < l; i += 1) {
                                panels[i].setId(subarray.getPanelId());
                            }
                            let position = this.currentInstancedMesh.getPositionAt(i);
                            let deltaZ = 0;
                            // if (this.currentSubarrayProperties.mountType === 'Fixed Tilt') {
                                if (this.currentInstancedMesh.parent.getTilt() == 0) {
                                    
                                    const lowestVertex = currentBaseTable.getLowestVertex();
                                    const associatedModelZ = Math.max(
                                        subarray.getAssociatedModel().getZOnTopSurface(
                                            lowestVertex.x,
                                            lowestVertex.y,
                                            ),
                                            0,
                                            );
                                            deltaZ += subarray.getMountHeight() - (lowestVertex.z - associatedModelZ);// need to add proper Logic
                                        }
                                        else {
                                            // Removing raycasting and using getzontopsurface instead as raycasting gives errors
                                            // const objectMeshes = this.stage.mergeManager.getAllMeshesInScene();
                                            // const objectArray = [];
                                // const objectArray = getAllObjectsBelowPoint(
                                //     new THREE.Vector3(position.x, position.y, 0),
                                //     this.stage,
                                //     this.raycaster,
                                //     objectMeshes,
                                // );
                                deltaZ = this.currentInstancedMesh.parent.getZOnTopSurface(position.x, position.y) + this.currentSubarrayProperties.mountHeight;
                            }
                            
                            currentBaseTable.moveObject(position.x, position.y, deltaZ);
                            
                            currentBaseTable.updateVisualsAfterLoadingAndCreation();
                            row.saveState();
                        } catch (error) {
                            console.error(error);
                            notificationsAssistant.error({
                                title: 'Add Table Mode',
                                message: 'Error placing table',
                            });
                            currentBaseTable.removeObject();
                        }
                    }                                                
                }
                if (!subarray.isEmpty && subarray.getParent()) {
                    try{
                        subarray.removeOutlinePoints();
                        subarray.addTableFlow = false;
                        subarray.createConvexHull(subarray);
                        subarray.mergeGeometriesForAllPanels();
                        // after the table is added to subarray we should update rails
                        subarray.updateRail();
                        if (subarray.interRowSpacingMode === ROW_SPACING_MODE_AUTO) {
                            subarray.interRowSpacing = subarray.getOptimisedRowSpacing();
                        }
                    }catch(e){
                        //console.log("ERROR CREATING SUBARRAY")
                    }
                } else {
                    subarray.removeIfEmpty();
                }
            }
            instanceMesh.removeObjectFromScene();
        }
        this.currentTableId = 0;
        this.stage.stateManager.stopContainer();
        this.removePlacedInstancedMeshes();
    }

    convertInstancedMeshToEastWestSubarray() {
        this.stage.stateManager.startContainer();
        this.allInstancedMeshes.push(this.currentInstancedMesh);
        this.intersectedTablesToBeRemoved.forEach((ele) => {
            ele.removeObject();
        })
        for (let instanceMesh of this.allInstancedMeshes) {
            this.currentInstancedMesh = instanceMesh;
            this.currentSubarrayProperties = this.currentInstancedMesh.currentSubarrayProperties;
            this.startingParent = this.currentInstancedMesh.parent || this.stage.ground;
            
            // check for existing subarrays
            const existingSubarray = this.getSimilarSubarray(this.startingParent,this.currentSubarrayProperties);
            let subarrayEast = null;
            let subarrayWest = null;
            
            if (instanceMesh.instanceCount >= 1) {
                this.eastSubarrayProperties = Object.assign({}, this.currentSubarrayProperties);
                this.westSubarrayProperties = Object.assign({}, this.currentSubarrayProperties);
                let newAzimuth = this.eastSubarrayProperties.azimuth + 180;
                if (newAzimuth >= 360) newAzimuth -= 360;
                this.westSubarrayProperties.azimuth = newAzimuth;
                    subarrayEast = this.createNewSubarrayForEastWestRacking(this.eastSubarrayProperties);
                    subarrayWest = this.createNewSubarrayForEastWestRacking(this.westSubarrayProperties);
                subarrayEast.isEmpty = true;
                subarrayWest.isEmpty = true;
                for (let i = 0; i < (this.currentInstancedMesh.instanceCount); i++) {
                    if (this.currentInstancedMesh.getScaleAt(i).x != 0) {
                        subarrayEast.isEmpty = false;
                        subarrayWest.isEmpty = false;
                        const templateTableMapEast = subarrayEast.getTemplateTableMap({ withBBox: true });
                        const templateTableMapWest = subarrayWest.getTemplateTableMap({ withBBox: true });
                        templateTableMapEast.hidden = false;
                        templateTableMapEast.isMoved = true;
                        templateTableMapWest.hidden = false;
                        templateTableMapWest.isMoved = true;

                        let currentBaseTableEast = new Table(this.stage, templateTableMapEast, { withoutContainer: false }, false);
                        let currentBaseTableWest = new Table(this.stage, templateTableMapWest, { withoutContainer: false }, false);

                        try {
                            const rowMap = {
                                id: i,
                                frames: [],
                            };
                            const rowEast = new Row(this.stage, rowMap, { withoutContainer: true }, true);
                            const rowWest = new Row(this.stage, rowMap, { withoutContainer: true }, true);
                            subarrayEast.addChild(rowEast);
                            subarrayWest.addChild(rowWest);
                            currentBaseTableEast.clickToAdd = true;
                            currentBaseTableWest.clickToAdd = true;

                            rowEast.addChild(currentBaseTableEast);
                            rowWest.addChild(currentBaseTableWest);
                            subarrayEast.validateStructures();
                            subarrayWest.validateStructures();
                            const panelsEast = currentBaseTableEast.getChildren();
                            const panelsWest = currentBaseTableWest.getChildren();
                            for (let i = 0, l = panelsEast.length; i < l; i += 1) {
                                panelsEast[i].setId(subarrayEast.getPanelId());
                                panelsWest[i].setId(subarrayWest.getPanelId());
                            }
                            let moduleDistanceBasedOnOrientation;
                            if (this.currentSubarrayProperties.panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                                moduleDistanceBasedOnOrientation = subarrayEast.moduleProperties.moduleLength * subarrayEast.tableSizeUp;
                            }
                            else {
                                moduleDistanceBasedOnOrientation = subarrayEast.moduleProperties.moduleWidth * subarrayEast.tableSizeUp;
                            }
                            const magnitude = (moduleDistanceBasedOnOrientation + subarrayEast.intraRowSpacing) / 2;
                            let positionEast = this.currentInstancedMesh.getPositionAt(i);
                            let temp = new Vector2(positionEast.x, positionEast.y);

                            // const center = new Vector2();
                            // const v = new Vector2().subVectors(otherPoint, center);
                            // const result = new Vector2().clone(center).sub(v);


                            const directionVector = new THREE.Vector2(1, 0).rotateAround(new Vector2(), utils.deg2Rad(90 - subarrayEast.azimuth));
                            const centerPosition = temp.clone().addScaledVector(directionVector, -magnitude);
                            positionEast = centerPosition.clone().addScaledVector(directionVector, magnitude);
                            let positionWest = centerPosition.clone().addScaledVector(directionVector, -magnitude);
                            let deltaZEast = 0;
                            let deltaZWest = 0;
                            // if (this.currentSubarrayProperties.mountType === 'Fixed Tilt') {
                                if (this.currentInstancedMesh.parent.getTilt() == 0) {
                                    
                                    const lowestVertexEast = currentBaseTableEast.getLowestVertex();
                                    const lowestVertexWest = currentBaseTableWest.getLowestVertex();
                                    const associatedModelZEast = Math.max(
                                        subarrayEast.getAssociatedModel().getZOnTopSurface(
                                            lowestVertexEast.x,
                                            lowestVertexEast.y,
                                            ),
                                            0,
                                            );
                                            deltaZEast += subarrayEast.getMountHeight() - (lowestVertexEast.z - associatedModelZEast);// need to add proper Logic
                                    const associatedModelZWest = Math.max(
                                        subarrayWest.getAssociatedModel().getZOnTopSurface(
                                            lowestVertexWest.x,
                                            lowestVertexWest.y,
                                            ),
                                            0,
                                            );
                                            deltaZWest += subarrayWest.getMountHeight() - (lowestVertexWest.z - associatedModelZWest);// need to add proper Logic
                                        }
                                        else {
                                            // Removing raycasting and using getzontopsurface instead as raycasting gives errors
                                            // const objectMeshes = this.stage.mergeManager.getAllMeshesInScene();
                                            // const objectArray = [];
                                // const objectArray = getAllObjectsBelowPoint(
                                //     new THREE.Vector3(position.x, position.y, 0),
                                //     this.stage,
                                //     this.raycaster,
                                //     objectMeshes,
                                // );
                                deltaZEast = this.currentInstancedMesh.parent.getZOnTopSurface(positionEast.x, positionEast.y) + this.eastSubarrayProperties.mountHeight;
                                deltaZEast = this.currentInstancedMesh.parent.getZOnTopSurface(positionWest.x, positionWest.y) + this.westSubarrayProperties.mountHeight;

                            }

                            currentBaseTableEast.moveObject(positionEast.x, positionEast.y, deltaZEast);
                            currentBaseTableWest.moveObject(positionWest.x, positionWest.y, deltaZWest)

                            currentBaseTableEast.updateVisualsAfterLoadingAndCreation();
                            currentBaseTableWest.updateVisualsAfterLoadingAndCreation();
                            rowEast.saveState();
                            rowWest.saveState();
                        } catch (error) {
                            console.error(error);
                            notificationsAssistant.error({
                                title: 'Add Table Mode',
                                message: 'Error placing table',
                            });
                            currentBaseTableEast.removeObject();
                            currentBaseTableWest.removeObject();
                        }
                    }
                }
                if (!subarrayEast.isEmpty && subarrayEast.getParent() && !subarrayWest.isEmpty && subarrayWest.getParent()) {
                    try {
                        subarrayEast.removeOutlinePoints();
                        subarrayWest.removeOutlinePoints();
                        subarrayEast.addTableFlow = false;
                        subarrayWest.addTableFlow = false;
                        subarrayEast.createConvexHull(subarrayEast, subarrayWest);
                        subarrayWest.createConvexHull(subarrayEast, subarrayWest);
                        subarrayEast.mergeGeometriesForAllPanels();
                        subarrayWest.mergeGeometriesForAllPanels();
                        subarrayEast.eastWestSubarray = subarrayWest;
                        subarrayWest.rackSubarray = subarrayEast;
                        // after the table is added to subarray we should update rails
                        subarrayEast.updateRail();
                        subarrayWest.updateRail();
                        if (subarrayEast.interRowSpacingMode === ROW_SPACING_MODE_AUTO) {
                            subarrayEast.interRowSpacing = subarrayEast.getOptimisedRowSpacing();
                        }
                        if (subarrayWest.interRowSpacingMode === ROW_SPACING_MODE_AUTO) {
                            subarrayWest.interRowSpacing = subarrayWest.getOptimisedRowSpacing();
                        }
                    } catch (e) {
                        //console.log("ERROR CREATING SUBARRAY")
                    }
                } else {
                    subarrayEast.removeIfEmpty();
                    subarrayWest.removeIfEmpty();
                }
            }
            instanceMesh.removeObjectFromScene();
        }
        this.currentTableId = 0;
        this.stage.stateManager.stopContainer();
        this.removePlacedInstancedMeshes();
    }

    getSimilarSubarray(parent,currentSubarrayProperties){
        if(parent instanceof SmartroofFace){
            const children = parent.getChildren();
            for(let i = 0; i < children.length; i++){
                const child = children[i];
                if(child instanceof Subarray && !child.isInstancedSubarray){
                    if(this.compareSubarrayProperties(child, currentSubarrayProperties)){
                        return child       
                    }
                }
            }
        }
    }
    compareSubarrayProperties(properties1, properties, skipOrientation = false) {
        return (
            properties1.mountHeight === properties.mountHeight &&
            properties1.tableSizeUp === properties.tableSizeUp &&
            properties1.tilt === properties.tilt &&
            properties1.azimuth === properties.azimuth &&
            properties1.rowSpacingMode === properties.rowSpacingMode &&
            properties1.rowSpacing === properties.rowSpacing &&
            (properties1.panelOrientation === properties.panelOrientation || skipOrientation) &&
            properties1.tableSizeWide === properties.tableSizeWide &&
            properties1.tableSpacing === properties.tableSpacing &&
            properties1.moduleSpacingUp === properties.moduleSpacingUp &&
            properties1.moduleSpacingWide === properties.moduleSpacingWide &&
            properties1.moduleProperties.moduleId === properties.moduleProperties.moduleId &&
            properties1.moduleProperties.moduleMake === properties.moduleProperties.moduleMake &&
            properties1.moduleProperties.moduleSize === properties.moduleProperties.moduleSize &&
            properties1.moduleProperties.moduleLength === properties.moduleProperties.moduleLength &&
            properties1.moduleProperties.moduleWidth === properties.moduleProperties.moduleWidth)
    }

    deleteTable(event) {
        let intersects = getAllObjectsBelowPoint(this.stage.mousePoint, this.stage, this.raycaster)
        intersects = intersects.filter((intersect) => { return (intersect[0] instanceof InstancedTableMesh || intersect[0] instanceof Subarray) });
        if (intersects.length >= 1) {
            if (intersects[0][0] instanceof InstancedTableMesh) {
                let intersectInstance = []
                intersects[0][0]._instancedMesh.raycast(this.raycaster, intersectInstance);
                if (intersectInstance[0]) {
                    intersects[0][0].deleteInstanceAt(intersectInstance[0].instanceId);
                }
            } else if (intersects[0][0] instanceof Subarray && !intersects[0][0].addTableFlow) {
                this.allTables = intersects[0][0].getTables()
                for (let i = 0; i < this.allTables.length; i++) {
                    const bBox = this.allTables[i].get2DVertices();
                    if (utils.inspectPointInsideVertices(bBox, this.stage.mousePoint)) {
                        const subarray = this.allTables[i].getSubarray();
                        this.allTables[i].removeObject();
                        if(subarray.children.length !== 0){
                            subarray.mergeGeometriesForAllPanels();
                        }
                        break;
                    }
                }
            }
        }
    }

    addDebugPointOnPosition(position) {
        // if(!this.debug){
        //     this.debug = new THREE.Mesh(new THREE.BoxGeometry(3,3,1), new THREE.MeshBasicMaterial({color: 0xffff00}));
        //     this.stage.sceneManager.scene.add(this.debug);
        // }
        // if(position){
        //     this.debug.position.set(position.x, position.y)
        // }
    }

    deleteMouseTable() {
        this.currentInstancedMesh.setInstanceCount(this.currentTableId);
    }

    getPanelCount() {
        let panelCount = this.currentInstancedMesh.getInstanceCount() - 1;
        for (let i = 0; i < this.allInstancedMeshes.length; i++) {
            panelCount += this.allInstancedMeshes[i].getInstanceCount();
            // console.log(panelCount);
        }
        this.currentPanelsCount = panelCount;
        return panelCount;
    }

    getDcSize() {
        return this.currentSubarrayProperties.moduleProperties.moduleSize * (this.getPanelCount() + 1);
    }

    getAllModuleQuantity(stage) {
        const result = [];
        getSubarrays(stage.ground, result);
        let totalPanels = 0;
        for (let i = 0, l = result.length; i < l; i += 1) {
            totalPanels += result[i].getNumberOfPanels();
        }
        return totalPanels + this.currentPanelsCount;
    }
    deleteOverlappedPanels(mousepoint) {
        this.currentParent = this.getCurrentParent()[0];
        this.checkMeshes = [];
        try{
            var children = this.currentParent.getChildren().filter((child)=>{return child instanceof Subarray && !child.addTableFlow})

        }catch(a){
            //console.log(this.currentParent)
        }
        this.checkMeshes.push(...children);
        const parentBox = this.currentInstancedMesh.getVerticesAt(this.currentTableId, true);
        if (this.currentInstancedMesh.instanceCount > 1) {
            this.checkMeshes.push(this.currentInstancedMesh);
        }

        for (let i = 0; i < this.allInstancedMeshes.length; i++) {
            let mesh = this.allInstancedMeshes[i]
            this.checkMeshes.push(mesh);
        }
        if (this.checkMeshes.length > 0) {
            for (let mesh of this.checkMeshes) {
                if (mesh instanceof InstancedTableMesh) {

                    let instanceCount = mesh.uuid == this.currentInstancedMesh.uuid ? (mesh.instanceCount - 1) : mesh.instanceCount;

                    for (let i = 0; i < instanceCount; i++) {
                        let intersecting = isIntersecting(parentBox, mesh.getVerticesAt(i, true));
                        if (intersecting) {
                            mesh.setScaleAt(i);

                        }
                    }
                } else if (mesh instanceof Subarray && mesh != this.currentInstancedMesh.getSubarray()) {
                    let tables = mesh.getTables();
                    for (let t of tables) {
                        let intersecting = isIntersecting(parentBox, t.get2DVertices());
                        if (intersecting) {
                            // we need to save the states in between startContainer and stopContainer
                            // so calling remove object of the table in convertInstancedMeshToSubarray function
                            this.intersectedTablesToBeRemoved.push(t);
                            // t.removeObject();
                            // t.getParent().saveState();
                            // t.saveState();
                            // t.removePanelsMeshFromScene();
                            t.hideIndividualMesh();
                        };
                    }
                    if(mesh.children.length !== 0){
                        mesh.mergeGeometriesForAllPanels({ excludeTables: this.intersectedTablesToBeRemoved});
                    }

                }
            }
        }
    }

    removeAllInstancedMeshes() {
        for ( let i = 0; i < this.allInstancedMeshes.length; i++ ) {
            this.allInstancedMeshes[i].removeObjectFromScene();
        }
    }

    removePlacedInstancedMeshes() {
        for ( let i = 0; i < this.placedInstancedMeshes.length; i++ ) {
            this.placedInstancedMeshes[i].removeObjectFromScene();
        }
    }
}
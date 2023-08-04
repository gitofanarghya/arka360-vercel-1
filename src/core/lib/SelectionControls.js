import BaseObject from '../objects/BaseObject';
import * as THREE from 'three';
import HeatMap from "../objects/ground/HeatMap";
import * as raycastingUtils from "../utils/raycastingUtils";
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import ThreejsText from '../objects/subObjects/ThreejsText';
import RotationPoint from '../objects/subObjects/RotationPoint';
import LengthMeasurement from "../objects/subObjects/LengthMeasurement";
import ArcMeasurement from "../objects/subObjects/ArcMeasurement";
import loBind from "lodash/bind";
import _ from "lodash";
import Subarray from "../objects/subArray/Subarray";
import Table from "../objects/subArray/Table";
import Panel from "../objects/subArray/Panel";
import Dimension from "../objects/subObjects/Dimension"
import SelectionRectangle from './SelectionRectangle';
import LassoSelectionTool from './LassoSelectionTool';
import TextBox from '../objects/subObjects/TextBox';
import * as utils from '../utils/utils'
import Ground from '../objects/ground/Ground';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Dormer from '../objects/model/smartroof/Dormer';
import DCString from '../objects/subArray/DCString';
import ElectricalString from '../objects/subArray/ElectricalString';
import DcCable from '../objects/model/cable/DcCable';
import Conduit from '../objects/ac/conduits/Conduit';
import MicroInverter from '../objects/ac/MicroInverter';
import DropDownTool from '../sld/dropDownTool';
import SLDManager from '../managers/SLDManager';
import Property from '../objects/model/Property';
import Gazebo from './PowerGazebo';
import { Vector3 } from 'three';
import OuterEdge from '../objects/model/smartroof/OuterEdge';
import DrawFace from '../objects/model/smartroof/DrawFace';
import EastWestRack from './EastWestRacking';

export default class SelectionControls {
    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();

        this.selectionEnabled = false;

        this.selectedObjects = [];
        this.selectionTree = null;
        this.selectedWiringZone = null;
        this.selectionContextMenuVisible = false;

        this.clickOverride = false;

        this.selectionRectangle = new SelectionRectangle(stage);

        this.lassoSelection = new LassoSelectionTool(stage);
        this.doubleClick = false;
    }

    // addingDelay() {
    //     setTimeout(function() {
    //         this.handleClick;
    //     }, 500);
    // }

    enable() {
        if (!this.selectionEnabled) {
            this.selectionEnabled = true;
            this.selectionRectangle.enableRectTool();
            this.canvas.addEventListener('dblclick', this.handleDoubleClick);
            this.canvas.addEventListener('click', this.onClick);
        }
        else {
            console.error('ERROR: SelectionControls: Selection control already enabled.')
        }
    }

    disable() {
        if (this.selectionEnabled) {
            this.selectionEnabled = false;
            this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
            this.canvas.removeEventListener('click', this.onClick);

            this.selectionRectangle.disableRectTool();

            if (this.selectionContextMenuVisible) {
                this.hideSelectionContextMenu();
            }
        }
        else {
            console.error('ERROR: SelectionControls: Selection control already disabled.')
        }
    }
    newLassoSelection(){
        this.lassoSelection.initDrawingMode();
        return this.lassoSelection;
    }

    getSelectedObject() {
        // TODO: Change this to multiple objects everywhere - and remove this function completely
        return this.getSelectedObjects()[0];
    }

    getSelectedObjects() {
        return this.selectedObjects;
    }

    isMultiSelect() {
        return this.getSelectedObjects().length > 1;
    }

    selectGroundAndDisable() {
        this.setSelectedObject(this.stage.ground);
        this.disable();
    }
    selectGround() {
        this.setSelectedObject(this.stage.ground);
    }

    handleDoubleClick = (event) => {
        this.doubleClick = true;
        const objectMeshes = this.getObjectMeshes();
        let topObject = raycastingUtils.getTopObjectOnClick(event, this.stage, objectMeshes);
        let selectionList = [];
        if (topObject instanceof SLDManager) {
            this.stage.eventManager.hideSelectionContextMenu();
            return;
        }
        if (topObject instanceof DropDownTool) {
            return;
        }
        if( topObject instanceof SmartroofModel || topObject instanceof Dormer ){
            const clickPosition = utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
            const raycaster = new THREE.Raycaster(new Vector3(clickPosition.x, clickPosition.y, 500), new Vector3(0,0,-1));
            raycaster.params.Line.threshold = 4/this.stage.getNormalisedZoom();

            for( let i = 0; i < topObject.getChildren().length; i+=1 ){
                if (topObject.getChildren()[i].isDeleted) continue;
                const intersects = raycaster.intersectObject(topObject.getChildren()[i].faceMesh, true);
                if(intersects.length > 0){
                    selectionList.push(topObject.getChildren()[i]);
                }
            }
            if(topObject instanceof DrawFace) {
                for( let i = 0; i < topObject.outerEdgeObjects.length; i+=1 ){
                    const intersects = raycaster.intersectObject(topObject.outerEdgeObjects[i].outerEdgeMesh, true);
                    if(intersects.length > 0){
                        selectionList.push(topObject.outerEdgeObjects[i].smartroofFace);
                    }
                }
            }
        }
        else if (topObject instanceof SmartroofFace) {
            selectionList.push(topObject);
        }
        else if (topObject instanceof ThreejsText) {
            if (topObject.editable) selectionList.push(topObject);
        }
        else if (topObject instanceof OuterEdge && topObject.belongsTo instanceof DrawFace) {
            selectionList.push(topObject);
        }
        if(selectionList.length === 0){
            selectionList.push(this.stage.ground);
        }
        this.setSelectedObjects(selectionList);
    }

    getObjectMeshes() {
        let objectMeshes;
        if (!this.stage.sldView) {
            objectMeshes = this.stage.mergeManager.getAllMeshesInScene();
        }
        else {
            objectMeshes = this.stage.SLDManager.getMeshes();
        }

        return objectMeshes;
    }

    onClick = (event) => {
        this.doubleClick = false;
        setTimeout(this.handleClick.bind(this, event), 20);
    }

    handleClick(event){
        if (this.doubleClick) {
            return null;
        }

        if (this.clickOverride) {
            this.clickOverride = false;
            return null;
        }

        if (this.selectionContextMenuVisible) {
            this.hideSelectionContextMenu();
        }

        if (event.ctrlKey || event.metaKey || event.which !== 1) {
            return null;
        }

        if (!this.stage.textSelectionControls.deSelectSelectedTextObject()) {
            return null;
        }
        let objectMeshes = this.getObjectMeshes();
        
        let topObject = raycastingUtils.getTopObjectOnClick(event, this.stage, objectMeshes);
        // check if the top object is a subarray (cause of merged geometries)
        // add code here to select the table on the click
        // can do it by finding the table wich is nearest
        if (topObject instanceof Subarray || topObject instanceof Gazebo) {
            const clickPosition = utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
            const nearestTable = topObject.getNearestTableToPoint(clickPosition);
            if (utils.checkPointInsideVertices(nearestTable.get2DVertices(), [clickPosition.x, clickPosition.y])) {
                if(!event.shiftKey){
                    topObject = nearestTable.getChildren()[0];
                }
                else{
                    topObject = nearestTable.getNearestPanelToPoint(clickPosition);
                }
            }
            else {
                topObject = topObject.getParent();
            }
        }

        if (topObject === null) {
            // Click outside ground
            return null;
        }
        if(topObject instanceof SLDManager) {
            this.stage.eventManager.hideSelectionContextMenu();
        }
        if(topObject instanceof DropDownTool) {
            this.stage.eventManager.showSelectionContextMenu(event,
                topObject.belongsTo.getNames(),
                topObject.belongsTo.selectionControl.bind(topObject.belongsTo),
                topObject.belongsTo.getDefault());
        }
        if (topObject instanceof HeatMap) {
            topObject = this.stage.ground;
        }
        if (topObject instanceof SmartroofFace) {
            topObject = topObject.getParent();
        }
        if (topObject instanceof OuterEdge) {
            topObject = topObject;
        }
        if (!(topObject instanceof BaseObject
            || topObject instanceof Dimension
            || topObject instanceof TextBox)) {
            if (!(topObject instanceof OutlinePoints
                || topObject instanceof LengthMeasurement
                || topObject instanceof ArcMeasurement
                || topObject instanceof RotationPoint
                || topObject instanceof ThreejsText
            )) {
                // Not showing error when it is a subObject
                console.error('ERROR: SelectionControl: selected object not of type BaseObject or Dimension');
            }
            return null;
        }

        let selectionList = [];
        if (!event.shiftKey) {
            // Single selection case
            this.selectionTree = topObject.getSelectableObjects();
            this.setWiringZoneMode(topObject.getParentWiringZone());
            selectionList = this.selectionTree.getSelectionList();
        }
        else {
            // Multi selection case
            if (this.selectedWiringZone !== topObject.getParentWiringZone()) {
                // TODO: Show error or warning for disallowing selection from multiple wiring zones
                return null;
            }

            // TODO: Fix how merging and deleting is done
            if (topObject instanceof Panel && this.getSelectedObjects()[0] instanceof Table) {
                // if (topObject.getSubarray() !== this.getSelectedObjects()[0].getSubarray()) {
                //     // Tables could only be selected from the same subarray
                //     return null;
                // }
                selectionList = [this.getSelectedObjects().slice()];
                const index = selectionList[0].indexOf(topObject.getParent());
                if (index > -1) {
                    selectionList[0].splice(index, 1);
                }
                else {
                    selectionList[0].push(topObject.getParent());
                }
            }
            else if (topObject instanceof Panel && this.getSelectedObjects()[0] instanceof Panel) {
                // if (topObject.getSubarray() !== this.getSelectedObjects()[0].getSubarray()) {
                //     // Tables could only be selected from the same subarray
                //     return null;
                // }
                // Temp fix for EW: REWORK REQUIRED
                if (topObject.getSubarray().eastWestRackingEnabled) {
                    return null;
                }
                selectionList = [this.getSelectedObjects().slice()];
                const index = selectionList[0].indexOf(topObject);
                if (index > -1) {
                    selectionList[0].splice(index, 1);
                }
                else {
                    selectionList[0].push(topObject);
                }
            }
            else {
                return null;
            }
        }

        let defaultLevel = this._isSelectedFromList(selectionList);

        // Jugaad fix
        // when selecting ground after selecting inverter menu
        // the ground is already selected, so this sets default level = 0
        // and ground is not selected again and hence sap pane is not updated
        // find  better soultion for this.
        if (topObject instanceof Ground) {
            defaultLevel = -1;
        }

        // Showing the selectionContextMenu and handling the selection
        if (defaultLevel === 0) {
            // the zeroth level from object click is already
            return null;
        }
        else if (defaultLevel === -1) {
            // none of the level from object click is already selected
            defaultLevel = 0;
            this.setSelectedObjects(selectionList[0]);
        }
        if (selectionList.length > 1) {
            let name = [];
            for (let i = 0; i < selectionList.length; i++) {
                name.push(selectionList[i][0].constructor.getObjectType());
            }

            if (!name.includes('Gazebo')) {
                this.showSelectionContextMenu(
                    event,
                    name,
                    loBind((list, idx) => { this._setSelectedObjectsWithoutHiding(list[idx]) }, this, selectionList),
                    defaultLevel
                );
            }
        }

    };

    _isSelectedFromList(selectionList) {
        for (let level in selectionList) {
            if (_.isEqual(selectionList[level], this.getSelectedObjects())) {
                return parseInt(level);
            }
        }
        return -1;
    }

    setSelectedObject(object) {
        this.setSelectedObjects([object]);
    }

    setSelectedObjects(objects) {
        if (this.selectionContextMenuVisible) {
            this.hideSelectionContextMenu();
        }
        this._setSelectedObjectsWithoutHiding(objects);
    }

    removeSelectedObject(object) {
        const selectedObjects = this.getSelectedObjects();
        for (let j = 0; j < selectedObjects.length; j += 1) {
            if (selectedObjects[j] === object) {
                selectedObjects.splice(j, 1);
                break;
            }
        }

        this.stage.viewManager.updateSelectedObjects(selectedObjects);
        
        if (selectedObjects.length > 0) {
            this.stage.eventManager.setObjectsSelected(selectedObjects);
        }
        else {
            this.setSelectedObject(this.stage.ground);
        }
    }

    _setSelectedObjectsWithoutHiding(objects) {

        for (let object of objects) {
            if (!(object instanceof BaseObject
                || object instanceof Dimension
                || object instanceof SmartroofFace
                || object instanceof ThreejsText
                || object instanceof OuterEdge
                || object instanceof Dormer
                || object instanceof DCString
                || object instanceof ElectricalString
                || object instanceof DcCable
                || object instanceof Conduit
                || object instanceof MicroInverter)) {
                console.error('ERROR: SelectionControls: Object passed to setSelectedObjects is not an instance of BaseObject or Dimension.');
                return null;
            }
        }

        const oldSelectedObjects = [];
        for (let i = 0; i < this.getSelectedObjects().length; i += 1) {
            oldSelectedObjects.push(this.getSelectedObjects()[i]);
        }

        this.selectedObjects = objects;
        // Call deSelect for previously selected object (if they are not in new selection)
        // TODO: Change this for multi this.selectedObjects so that you don't call deSelect and select again
        if (oldSelectedObjects.length > 0) {
            const subarraysListForUpdate = [];
            for (let i = 0; i < oldSelectedObjects.length; i++) {
                const obj = oldSelectedObjects[i];

                // to update merged meshes of subarray
                if (obj instanceof Table) {
                    obj.deSelect({updateSubarray: false});
                    if (obj.getParent() !== null && obj.getSubarray() !== null) {
                        const subArray = obj.getSubarray();
                        if (!subarraysListForUpdate.includes(subArray)) {
                            subarraysListForUpdate.push(subArray);
                        }
                        // Temp fix for EW: REWORK REQUIRED
                        if (subArray.eastWestRackingEnabled) {
                            if (subArray.linkedSubarray && !subarraysListForUpdate.includes(subArray.linkedSubarray)) {
                                subarraysListForUpdate.push(subArray.linkedSubarray);
                            }
                            if (subArray.rackSubarray && !subarraysListForUpdate.includes(subArray.rackSubarray)) {
                                subarraysListForUpdate.push(subArray.rackSubarray);
                            }
                        }
                    }
                }
                else if (obj instanceof Panel) {
                    if (obj.getParent() !== null && obj.getSubarray() !== null) {
                        const subArray = obj.getSubarray();
                        if (!subarraysListForUpdate.includes(subArray)) {
                            subarraysListForUpdate.push(subArray);
                        }
                        // // Temp fix for EW: REWORK REQUIRED
                        // if (subArray.eastWestRackingEnabled) {
                        //     if (subArray.linkedSubarray && !subarraysListForUpdate.includes(subArray.linkedSubarray)) {
                        //         subarraysListForUpdate.push(subArray.linkedSubarray);
                        //     }
                        //     if (subArray.rackSubarray && !subarraysListForUpdate.includes(subArray.rackSubarray)) {
                        //         subarraysListForUpdate.push(subArray.rackSubarray);
                        //     }
                        // }
                    }
                    obj.deSelect();
                }
                else {
                    obj.deSelect();
                }
            }
            for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                subarraysListForUpdate[i].mergeGeometriesForAllPanels();
            }
        }

        //for merging the scene according to the object selected
        this.stage.rStats.id('merging').start();
        if (objects[0] === undefined) {
            this.stage.mergeManager.mergeScene(objects);
        }
        else {
            this.stage.mergeManager.mergeScene(objects[0]);
        }
        this.stage.rStats.id('merging').end();

        this.stage.dragControls.removeAll();
        if (this.isMultiSelect()) {
            this.stage.dragControls.enableMultiSelect();
        } else {
            this.stage.dragControls.disableMultiSelect();
        }

        if (objects[0] instanceof OuterEdge) {
            // console.log('ok');
            const objectParent = objects[0].parent;
            objects[0].onSelectEdge();
            objects = objects.slice(1);
            objects.push(objectParent)
            this.selectedObjects = this.selectedObjects.slice(1);
            this.selectedObjects.push(objectParent)
        }
        
        if (objects[0] instanceof Table) {
            const subarraysListForUpdate = [];
            const excludeObject = [];
            for (let obj of objects) {
                obj.onSelect({updateSubarray: false});
                excludeObject.push(obj);
                // to update merged meshes of subarray
                if (obj instanceof Table) {
                    if (obj.linkedTable && obj.getParent() !== null && obj.getSubarray() !== null) {
                        excludeObject.push(obj.linkedTable);
                    }
                    if (obj.getParent() !== null && obj.getSubarray() !== null) {
                        if (!subarraysListForUpdate.includes(obj.getSubarray())) {
                            subarraysListForUpdate.push(obj.getSubarray());
                            if (obj.linkedTable) {
                                subarraysListForUpdate.push(obj.linkedTable.getSubarray()); 
                            }
                        }
                    }
                }
            }
            for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                subarraysListForUpdate[i].mergeGeometriesForAllPanels({excludeTables: excludeObject});
            }
        }
        else if(objects[0] instanceof Panel){
            const subarraysListForUpdate = [];
            for (let obj of objects) {
                obj.onSelect();
                if (obj instanceof Panel) {
                    if (obj.getParent() !== null && obj.getSubarray() !== null) {
                        if (!subarraysListForUpdate.includes(obj.getSubarray()))
                            subarraysListForUpdate.push(obj.getSubarray());
                    }
                }
            }
            for (let i = 0, l = subarraysListForUpdate.length; i < l; i += 1) {
                subarraysListForUpdate[i].mergeGeometriesForAllPanels({excludePanels: objects});
            }
        }
        else if (objects[0] instanceof DCString) {
            objects[0].onSelect();
        }
        else if (objects[0] instanceof ElectricalString) {
            objects[0].onSelect();
        }
        else if (objects[0] instanceof Property) {
            objects[0].onSelect();
        }
        else if (objects[0] instanceof DcCable) {
            objects[0].onSelect();
        }
        else if (objects[0] instanceof TextBox) {
            objects[0].onSelect();
        }
        else if (objects[0] instanceof Conduit) {
            objects[0].onSelect();
        }
        else {
            for (let obj of objects) {
                obj.onSelect();
            }
        }

        if(objects[0] instanceof Subarray){
            let s = objects[0];
            if(s.eastWestRackingEnabled && !s.rackParent){
                if(s.rackSubarray){
                    objects[0] = s.rackSubarray
                }
            }
        }


        
        this.stage.viewManager.updateSelectedObjects(objects);
        this.stage.eventManager.setObjectsSelected(objects); // Time consuming
    }

    setWiringZoneMode(wiringZone) {
        if (this.selectedWiringZone !== wiringZone) {
            this.selectedWiringZone = wiringZone;
            if (wiringZone !== null) {
                // do stuff about showing wiring zone
            }
            else {
                // do stuff about getting out
            }
        }
    }

    showSelectionContextMenu(event, name, selectionFunction, defaultLevel = 0) {
        this.stage.eventManager.showSelectionContextMenu(event, name, selectionFunction, defaultLevel);
        this.selectionContextMenuVisible = true;
    }

    hideSelectionContextMenu() {
        this.stage.eventManager.hideSelectionContextMenu();
        this.selectionContextMenuVisible = false;
    }

    isEnabled() {
        return this.selectionEnabled;
    }
}

import * as raycastingUtils from "../utils/raycastingUtils";
import _ from "lodash";
import Subarray from "../objects/subArray/Subarray";
import Ground from '../objects/ground/Ground';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import PolygonModel from "../objects/model/PolygonModel";
import CylinderModel from "../objects/model/CylinderModel";
import Tree from "../objects/model/Tree";
import Handrail from "../objects/model/Handrail";
import Property from "../objects/model/Property";
import Walkway from "../objects/model/Walkway";
import Inverter from "../objects/ac/Inverter";
import MicroInverter from "../objects/ac/Inverter";


export default class SelectionControls3D {
    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();
        this.selectionEnabled = false;
        this.selectedObjects = [];
        this.selectionTree = null;

    }
    enable() {
        if (!this.selectionEnabled) {
            this.selectionEnabled = true;
            this.canvas.addEventListener('click', this.onClick);
            this.stage.dragControls.disable();
            this._setSelectedObjectsWithoutHiding([this.stage.ground]);
        }
        else {
            console.error('ERROR: SelectionControls3D: Selection control already enabled.');
        }
    }

    disable() {
        if (this.selectionEnabled) {
            this.selectionEnabled = false;
            this.stage.dragControls.enable();
            this.canvas.removeEventListener('click', this.onClick);
            if (this.selectionContextMenuVisible) {
                this.hideSelectionContextMenu();
            }
        }
        else {
            console.error('ERROR: SelectionControls3D: Selection control already disabled.');
        }
    }

    getSelectedObjects() {
        return this.selectedObjects;
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
        setTimeout(this.handleClick.bind(this, event), 20);
    }

    handleClick(event){
        let objectMeshes = this.getObjectMeshes();
        
        let topObject = raycastingUtils.getTopObjectOnClick(event, this.stage, objectMeshes);

        if (topObject instanceof Subarray) {
                topObject = topObject.getParent().getParent();
        }

        if (topObject === null || topObject instanceof PolygonModel || topObject instanceof CylinderModel || topObject instanceof Tree || topObject instanceof Handrail || topObject instanceof Property || topObject instanceof Walkway || topObject instanceof Inverter || topObject instanceof MicroInverter) {
            return null;
        }

        if (topObject instanceof SmartroofFace) {
            topObject = topObject.getParent();
        }

        let selectionList = [];
        this.selectionTree = topObject.getSelectableObjects();
        selectionList = this.selectionTree.getSelectionList();

        let defaultLevel = this._isSelectedFromList(selectionList);

        if (topObject instanceof Ground) {
            defaultLevel = -1;
        }

        if (defaultLevel === 0) {
            return null;
        }
        else if (defaultLevel === -1) {
            defaultLevel = 0;
            this._setSelectedObjectsWithoutHiding(selectionList[0]);
        }
        if (selectionList.length > 1) {
            for (let i = 0; i < selectionList.length; i++) {
                _setSelectedObjectsWithoutHiding(selectionList[i]);
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

    _setSelectedObjectsWithoutHiding(objects) {

        const oldSelectedObjects = [];
        for (let i = 0; i < this.getSelectedObjects().length; i += 1) {
            oldSelectedObjects.push(this.getSelectedObjects()[i]);
        }

        this.selectedObjects = objects;

        if (oldSelectedObjects.length > 0) {
            const subarraysListForUpdate = [];
            for (let i = 0; i < oldSelectedObjects.length; i++) {
                const obj = oldSelectedObjects[i];
                obj.deSelect();
                if(obj instanceof SmartroofModel || obj instanceof PolygonModel)
                    obj.changeColorDeSelect();
            }
        }

        this.stage.rStats.id('merging').start();

        if (objects[0] === undefined) {
            this.stage.mergeManager.mergeScene(objects);
        }

        else {
            this.stage.mergeManager.mergeScene(objects[0]);
        }

        this.stage.rStats.id('merging').end();
        
        for (let obj of objects) {
            obj.onSelect();
            if(obj instanceof SmartroofModel || obj instanceof PolygonModel){
                obj.hideSelectables();
                obj.changeColorOnSelect();
            }
        }
        this.stage.eventManager.setObjectsSelected(objects);
        
    }
    isEnabled() {
        return this.selectionEnabled;
    }
}
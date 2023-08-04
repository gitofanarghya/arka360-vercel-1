import * as THREE from 'three';
import { Text } from 'troika-three-text';
import SelectionTree from '../../lib/SelectionTree';
import { CAMERA_UPDATED } from '../../coreConstants';
import * as utils from '../../utils/utils';
import * as utilss from "../../../components/ui/length/utils"; 
import HTMLText from './HTMLText';
import { isMetricUnit, stringifyFromMetricMeasurement } from '../../../components/ui/length/utils';
import { FOOT_INCHES_VALIDATION_REGEX } from '../../../components/ui/length/constants';



export default class ThreejsText {
    constructor(text, position, angle, stage, parent, editable = false, visible = true) {
        // standard norms
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();
        this.length = text;
        this.text = this.getValidInput(text);
        this.angle = angle;
        this.position = position;

        this.objectsGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.position.z += 0.1;
        this.objectsGroup.container = this;

        // properties
        this.parent = parent;
        this.editable = editable;
        this.isSelectionEnabled = false;
        this.textMesh = new Text();
        this.textMesh.maxWidth =1;
        this.isMetricUnitFlag = isMetricUnit();
        this.init();
    }

    init() {
        // Set properties to configure:
        this.textMesh.text = this.text;
        this.textMesh.fontSize = 0.35;
        this.updateScale();
        this.textMesh.position.x = this.position.x;
        this.textMesh.position.y = this.position.y;
        this.textMesh.position.z = this.position.z + 20;
        // this.textMesh.fillOpacity = 0.5;
        this.textMesh.color = 0xffffff;
        this.textMesh.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), this.angle);

        // Update the rendering:
        this.updateScale();
        this.showObject();
        this.textMesh.sync();
        this.objectsGroup.add(this.textMesh);
    }

    moveObjectWithoutConsequences(deltaX, deltaY, deltaZ = 0) {
        this.textMesh.position.x += deltaX;
        this.textMesh.position.y += deltaY;
        this.textMesh.position.z += deltaZ;
        this.showObject();
    }

    getValidInput(magnitude){
        let res = magnitude;
        if (utilss.isMetricUnit()) {
            res = parseFloat(magnitude);
            if(res < 0.001 ){
                return '0.001';
            }
        } else {
            const lengthInFeets = magnitude * 3.28084;
            const lengthInInches = ((((lengthInFeets).toFixed(4)) % 1) * 12).toFixed(2);
            const length = `${String((((lengthInFeets).toFixed(4)) - (((lengthInFeets).toFixed(4)) % 1)).toFixed(0))}'${String(lengthInInches)}"`;
            return length;
        }
        return magnitude;
    }

    convertLengthToMetric(length) {
        if (isMetricUnit()) {
            return length;
        }
        for(let i = 0; i < length.length; i++) {
            if (length[i] === "'") {
                if(i === length.length - 1) return (parseFloat(length.substring(0, i)) * 0.3048).toFixed(3);
                return (parseFloat(length.substring(0, i)) * 0.3048 + parseFloat(length.substring(i + 1, length.length - 1)) * 0.0254).toFixed(3);
            }
        }
    }

    isValidInput(input) {
        if (!isMetricUnit()) {
            return input.search(FOOT_INCHES_VALIDATION_REGEX) !== -1;
        }

        if (Number.isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
            return false;
        }

        if (input % 1 === 0) {
            return true;
        }

        const inputArr = input.split('.');
        return inputArr[1].length <= 3;
    }

    isValidToShow() {
        //if the length is less than 10 feet hide
        if (!isMetricUnit()) {
            const lengthInFeets = this.length * 3.28084;
            if (lengthInFeets < 1) {
                return false;
            }
        }
        else {
            if (parseFloat(this.length) < 0.3048) {
                return false;
            }
        }
        return true;
    }

    update(text, position, angle) {
        // this.textMesh.clipRect = [0,0,100,100]
        // this.convertLengthToMetric(text);
        this.length = text;
        // setting the properties
        if(!isMetricUnit()) {
            const lengthInFeets = this.length * 3.28084;
            const lengthInInches = ((((lengthInFeets).toFixed(4)) % 1) * 12).toFixed(2);
            const length = `${String((((lengthInFeets).toFixed(4)) - (((lengthInFeets).toFixed(4)) % 1)).toFixed(0))}'${String(lengthInInches)}"`;
            this.text = length;
        }
        else {
            this.text = text;
        }

        // this.isValidInput(text) ? this.text = this.getValidInput(text) : this.text = this.text;

        // this.text = text;
        this.position = position;
        this.textMesh.text = this.text;
        this.textMesh.position.x = this.position.x;
        this.textMesh.position.y = this.position.y;
        this.textMesh.position.z = this.position.z + 20;
        if (this.angle !== angle) {
            this.angle = angle;
            this.textMesh.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), this.angle);
        }
        this.showObject();
        // this.textMesh.maxWidth =1;
        // updating the text mesh
        // this.textMesh.sync();
    }

    updateScale = () => {
        const zoom = 1/this.stage.getNormalisedZoom() * 15;
        if (zoom <= 2) this.textMesh.scale.set(zoom,zoom,1);
        if((this.textMesh.geometry.boundingSphere.radius * zoom * 5 > this.length) && this.objectsGroup.visible) this.objectsGroup.visible = false;
        else if((this.textMesh.geometry.boundingSphere.radius * zoom * 5 < this.length) && !this.objectsGroup.visible) this.objectsGroup.visible = true;
    } 

    updateScaleAfterSelection = () => {
        if(this.HTMLText) this.HTMLText._setPosition(this.position, this.HTMLText.direction, 0);
    }

    hideObject() {
        this.objectsGroup.visible = false;
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);

    }

    showObject() {
        if(this.isMetricUnitFlag !== isMetricUnit()) {

            this.isMetricUnitFlag = isMetricUnit();
            if(isMetricUnit()) {
                for(let i = 0; i < this.text.length; i++) {
                    if (this.text[i] === "'") {
        
                        if(i === this.text.length - 1) return (parseFloat(this.text.substring(0, i)) * 0.3048).toFixed(3);
                        this.text =  (parseFloat(this.text.substring(0, i)) * 0.3048 + parseFloat(this.text.substring(i + 1, this.text.length - 1)) * 0.0254).toFixed(3);
                    }
                }
            }
            this.update(this.text, this.position, this.angle);
        }
        if(!this.stage.visualManager.in3D) {
            this.objectsGroup.visible = true;
            this.updateScale();
            this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdate);
        }
    }

    setPosition(pos){
        this.positon = pos;
        this.update(this.text, this.position, this.angle);
    }
    getPosition(){
        return this.position;
    }
    getEdgeVector(point1, point2) {
        return (new THREE.Vector3(point2.x - point1.x, point2.y - point1.y, 0)).normalize();
    }

    
    onDimensionChange() {
        this.stage.stateManager.startContainer();
        const pointIndex1 = this.parent.index1;
        const pointIndex2 = this.parent.index2;
        const pointIndex3 = (this.parent.index2 + 1) % this.parent.parent.outlinePoints.length;
        const pointIndex4 = (this.parent.index2 + 2) % this.parent.parent.outlinePoints.length;

        const point1 = this.parent.parent.outlinePoints[pointIndex1].getPosition().clone();
        const point2 = this.parent.parent.outlinePoints[pointIndex2].getPosition().clone();
        const point3 = this.parent.parent.outlinePoints[pointIndex3].getPosition().clone();
        const point4 = this.parent.parent.outlinePoints[pointIndex4].getPosition().clone();

        const edgeVector1 = this.getEdgeVector(point1, point2);
        const edgeVector2 = this.getEdgeVector(point2, point3);
        const edgeVector3 = this.getEdgeVector(point3, point4);

        const newPoint2 = point1.add(edgeVector1.multiplyScalar(this.length));
        const newPoint3 = utils.checkLineIntersection([newPoint2,edgeVector2.add(newPoint2)],[point3,edgeVector3.add(point3)]);

        this.parent.parent.outlinePoints[pointIndex2].setPosition(newPoint2.x, newPoint2.y, point2.z);
        this.parent.parent.outlinePoints[pointIndex3].setPosition(newPoint3.x, newPoint3.y, point3.z);
        this.parent.parent.updateSmartRoof();
        this.parent.parent.placeObject();

        this.stage.stateManager.stopContainer();
    }

    onSelect() {
        this.HTMLText =  new HTMLText(this.text, this.position, this.angle, this.stage, new THREE.Vector3(0,0,0), 0, this.parent.parent, function (input) {
            if (!isMetricUnit()) {
                return input.search(FOOT_INCHES_VALIDATION_REGEX) !== -1;
            }

            if (input.length === 0 || isNaN(input) || parseFloat(input) < 0) return false;
    
            if (input % 1 === 0) return true;
    
            input = input.split(".");
            return input[1].length <= 4;
        });

        this.HTMLText._setPosition(this.position,this.HTMLText.direction,0);
        this.HTMLText.onSelect();
        this.hideObject();
        this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdateAfterSelection);
        document.addEventListener('keydown', (event) => {
            let name = '';
            if(event.key === 'Enter') {
                const test = this.HTMLText.getElementInnerText();
                if(!isMetricUnit()) this.length = this.convertLengthToMetric(test);
                else this.length = this.getValidInput(test);
                this.onDimensionChange();
                this.deSelect();
            }
        }, false);
    }

    deSelect() {
        this.HTMLText.deSelect();
        this.HTMLText.remove();
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdateAfterSelection);
        document.removeEventListener('keydown', (event) => {
            let name = '';
            if(event.key === 'Enter') {
                const test = this.HTMLText.getElementInnerText();
                if(!isMetricUnit()) this.length = this.convertLengthToMetric(test);
                else this.length = this.getValidInput(test);
                this.onDimensionChange();
                this.deSelect();
            }
        }, false);
    }

    handleTextSelection() {
        if (!this.stage.dragControls.isEditModeEnabled() &&
            !this.stage.duplicateManager.isEditModeEnabled() &&
            !this.stage.setbackEditMode.isEnabled() &&
            !this.stage.smartRoofSetbackEditMode.isEnabled()) {
            this.isTextSelected = true;
            this.stage.selectionControls.setSelectedObject(this);
        }
    }

    getSelectableObjects() {
        return new SelectionTree([this]);
    }

    getParentWiringZone() {
        return null;
    }
    getChildren() {
        return [];
    }

    cameraUpdate = () => {
        this.stage.addCameraUpdates(this.updateScale);
    }

    cameraUpdateAfterSelection = () => {
        this.stage.addCameraUpdates(this.updateScaleAfterSelection);
    }
    removeObject() {
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);
        this.objectsGroup.remove(this.textMesh);
        this.textMesh.dispose();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }
}
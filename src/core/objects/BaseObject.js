import * as THREE from 'three';
import { v4 } from 'uuid';
import SelectionTree from "../lib/SelectionTree";
import Ground from './ground/Ground';
import { VISUAL_STATES } from './visualConstants';

export default class BaseObject {
    constructor(stage) {
        this.parent = null;
        this.children = [];
        this.dimensionObjects = {};

        this.visualState = null;
        this.materialState = null;

        this.uuid = v4();
        this.stage = stage;
        this.stage.objects[this.uuid] = this;
    }

    static shouldPropagate() {
        console.warn('Should propagate not implemented in a base object');
        return false;
    }

    getUUID() {
        return this.uuid;
    }

    getChildren() {
        return this.children;
    }

    addChild(child, index) {
        if (!(child instanceof BaseObject)) {
            console.error('ERROR: BaseObject: Child cannot be added since it is not an instance of BaseObject class');
            return null;
        }

        const parent = this;

        if (child.parent !== null && child.parent !== parent) {
            console.error('ERROR: BaseObject: Child already has a parent. Cannot add child to more than one parent');
            return null;
        }
        else if (child.parent === parent) {
            console.error('ERROR: BaseObject: Child already added to this parent');
            return null;
        }
        else {
            if(index !== undefined){
                parent.children.splice(index, 0, child);
            }
            else{
                parent.children.push(child);
            }
            child.parent = parent;
            return child;
        }
    }

    removeChild(child) {
        if (!(child instanceof BaseObject)) {
            console.error('ERROR: BaseObject: Child cannot be removed since it is not an instance of BaseObject class');
            return null;
        }

        const parent = this;

        const childIndex = parent.children.indexOf(child);
        if (childIndex > -1) {
            const removedChild = parent.children.splice(childIndex, 1).shift();
            removedChild.parent = null;
            return removedChild;
        }

        console.error('ERROR: BaseObject: Child cannot be removed since it is not a child of parent');
        return null;
    }

    hasChild(object) {
        return this.children.indexOf(object) !== -1;
    }

    getParent() {
        return this.parent;
    }

    changeParent(toParent) {
        if (!(toParent instanceof BaseObject)) {
            console.error('ERROR: BaseObject: Parent cannot be changed since it is not an instance of BaseObject class');
            return null;
        }
        const child = this;
        const fromParent = child.parent;
        if (fromParent !== null) {
            fromParent.removeChild(child);
        }
        toParent.addChild(child);
        return child;
    }

    getPosition() {
        return new THREE.Vector3();
    }

    // dimension functions
    handleDimensionAddition(dimension) {
        this.dimensionObjects[dimension.getId()] = dimension;
    }

    handleDimensionDeletion(dimension) {
        delete this.dimensionObjects[dimension.getId()];
    }

    moveDimensions(deltaX, deltaY, deltaZ) {
        // update dimensions
        for (const dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectMove(this, deltaX, deltaY, deltaZ);
        }
    }

    removeDimensions() {
        for (const dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].remove();
            delete this.dimensionObjects[dimension];
        }
    }

    getAttachedDimensions() {
        const dimensions = [];
        for (const key in this.dimensionObjects) {
            dimensions.push(this.dimensionObjects[key]);
        }
        return dimensions;
    }

    getState() {
        console.warn('BaseObject: getState: Function not overridden');
    }

    loadState(state, fromState) {
        console.warn('BaseObject: loadState: Function not overridden', state, fromState);
    }

    clearState() {
        console.warn('BaseObject: clearState: Function not overridden');
    }

    saveState({ withoutContainer } = { withoutContainer: false }) {
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: this.getState.bind(this),
            withoutContainer,
        });
    }

    getSelectableObjects() {
        return new SelectionTree([this]);
    }

    getParentWiringZone() {
        return null;
    }

    materialAndVisualStatesExist(colorMapping) {
        if (colorMapping[this.materialState] !== undefined &&
            colorMapping[this.materialState] !== null &&
            colorMapping[this.materialState][this.visualState] !== undefined &&
            colorMapping[this.materialState][this.visualState] !== null) {
            return true;
        }
        return false;
    }

    switchMaterialState(newMaterialState, recursive) {
        if (recursive) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].switchMaterialState(newMaterialState, recursive);
            }
        }
        if (this.materialState !== newMaterialState) {
            this.materialState = newMaterialState;
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsAfterLoadingAndCreation() {
        this.materialState = this.stage.visualManager.getMaterialStateBasedOnConditions();
        this.stage.visualManager.switchDefaultVisualStatesInSequenceForObject(this);
    }

    updateOutlinePointsVisuals(color) {
        if (color !== null && color !== undefined &&
            this.outlinePoints !== null && this.outlinePoints !== undefined &&
            this.outlinePoints.length > 0 && this.outlinePoints[0].getColor() !== color) {
            for (let i = 0; i < this.outlinePoints.length; i += 1) {
                this.outlinePoints[i].updateColor(color);
            }
        }
    }

    switchVisualState(newVisualState, recursive) {
        if (recursive) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].switchVisualState(newVisualState, recursive);
            }
        }

        if (this.visualState !== newVisualState) {
            if (newVisualState === VISUAL_STATES.DEFAULT) {
                this.stage.visualManager.switchDefaultVisualStatesInSequenceForObject(this);
            }
            else {
                this.visualState = newVisualState;
            }

            this.updateVisualsBasedOnStates();
        }
    }

    getPlacingInformation() {
        console.warn('BaseObject: getPlacingInformation: Function not overridden');
        return {};
    }

    updateWhilePlacing() {
        // do nothing
    }

    updateVisualsBasedOnStates() {
        console.warn('BaseObject: updateVisualsBasedOnState: Function not overridden');
    }

    resetSolarAccess() {
        const children = this.getChildren();
        for (let idx = 0, len = children.length; idx < len; idx += 1) {
            children[idx].resetSolarAccess();
        }
    }

    resetGrandParentSolarAccess() {
        if (this.getParent() !== null) {
            this.stage.ground.resetSolarAccess();
        }
        else {
            this.resetSolarAccess();
        }
    }

    getVisualState() {
        return this.visualState;
    }
}

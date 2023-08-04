import FixedObject from '../../objects/FixedObject';
import {
    CREATED_STATE,
    DELETED_STATE,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
} from '../visualConstants';
import MicroInverter from './MicroInverter';


export default class CombinerBox extends FixedObject{
    constructor(stage) {
        super(stage);

        this.stage = stage;
        this.id = this.stage.getCombinerBoxId();
        this.name = `CombinerBox #${this.id.toString()}`;

        this.linkedMicroInverter = {};
        this.linkedPanels = [];
    }

    getDefaultValues() {
        return this.stage.getDesignSettings().drawing_defaults.inverter;
    }

    getModuleDimensions() {
        return {
            moduleWidth: '0.6',
            moduleHeight: '0.3',
            moduleDepth: '0.6',
            pillarRadius: 0.02,
        };
    }

    getColorMapForObject() {
        return COLOR_MAPPINGS.INVERTER;
    }

    getState() {
        const combinerBoxData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            pillarHeight: this.pillarHeight,
            azimuth: this.azimuth,

            // saving outline points
            outlinePoints: [...this.outlinePoints],

            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return combinerBoxData;
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

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);
    }

    saveObject(isCopy = false) {
        const combinerModelData = {
            type: CombinerBox.getObjectType(),
        };

        // save id and name
        combinerModelData.id = this.id;
        combinerModelData.name = this.name;
        if (isCopy) {
            combinerModelData.uuid = this.uuid;
        }
        if(this.linkedMicroInverter){
            combinerModelData.linkedMicroInverterId = this.linkedMicroInverter.id;
        }

        combinerModelData.baseHeight = this.baseHeight;
        combinerModelData.pillarHeight = this.pillarHeight;
        combinerModelData.azimuth = this.azimuth;

        combinerModelData.outlinePoints = [...this.outlinePoints];

        return combinerModelData;
    }

    loadObject(combinerModelData, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = combinerModelData.id;
            this.name = combinerModelData.name;
        }

        this.baseHeight = combinerModelData.baseHeight;
        this.pillarHeight = combinerModelData.pillarHeight;
        this.azimuth = combinerModelData.azimuth;
        this.linkedMicroInverterId = combinerModelData.linkedMicroInverterId;

        this.outlinePoints = [...combinerModelData.outlinePoints];

        // update geometry
        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    initCombinerBoxPlacingMode(microInverter) {
        // this.stage.stateManager.startContainer();
        this.stage.placeManager.initialize(
            this,
            this.onComplete.bind(this , microInverter),
            this.onCancel.bind(this),
            0,
            0,
            { moveWithOffset: true },
        );

        this.stage.selectionControls.setSelectedObject(this);
    }

    onCancel() {
        this.removeObject();
        // this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }

    async onComplete(microInverter) {
        const notificationObject = this.stage.eventManager.setInverterCreating();

        try {
            await this.placeObject();
            microInverter.combinerBox = this;
            // this.stage.stateManager.stopContainer();
            this.stage.eventManager.completeInverterCreation(notificationObject);
            this.stage.selectionControls.setSelectedObject(this);
        }
        catch (error) {
            console.error('ERROR: Combiner Box: OnComplete failed.', error);
            this.removeObject();
            this.stage.stateManager.stopContainer({ discard: true });
            this.stage.eventManager.errorCombinerBoxCreation(notificationObject);
        }
        return Promise.resolve(true);
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
            this.saveState();
            
        }
        catch (error) {
            console.error('ERROR: Combiner Box: placeObject failed', error);
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    }

    static getObjectType() {
        return 'CombinerBox';
    }
}
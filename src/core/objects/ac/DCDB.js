import FixedObject from '../../objects/FixedObject';
import * as THREE from 'three';
import {
    CREATED_STATE,
    DELETED_STATE,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    INVERTER_COLORS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../visualConstants';
import {getOutlinePoints} from './../../utils/utils'
import OutlinePoints from '../subObjects/OutlinePoints';

export default class DCDB extends FixedObject {
    constructor(stage) {
        super(stage);

        this.stage = stage;
        this.id = this.stage.getDcdbId();
        this.name = `DCDB #${this.id.toString()}`;
        this.linkedInverter = null;

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

    setToInverterColor() {
        // Jugaad for inverter colors maintainance.
        this.meshMaterial2D.color.setHex(
            INVERTER_COLORS.Color[this.linkedInverter.getId() % INVERTER_COLORS.Color.length]
        );
        this.meshMaterial3D.color.setHex(
            INVERTER_COLORS.Color[this.linkedInverter.getId() % INVERTER_COLORS.Color.length]
        );
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

    getColorMap() {
        if (this.materialAndVisualStatesExist(this.objectColorMapping)) {
            if (this.visualState === VISUAL_STATES.ERROR ||
                this.visualState === VISUAL_STATES.EDGE_HIGHLIGHT ||
                this.visualState === VISUAL_STATES.DRAWING_ERROR || 
                this.visualState === VISUAL_STATES.MIRROR_MODE) {
                return this.objectColorMapping[this.materialState][this.visualState];
            }
            return {
                MESH_COLOR: INVERTER_COLORS.Color[this.linkedInverter !== null &&
                    this.linkedInverter !== undefined ? this.linkedInverter.getId() : 0],
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
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
        const dcdbModelData = {
            type: DCDB.getObjectType(),
        };

        // save id and name
        dcdbModelData.id = this.id;
        dcdbModelData.name = this.name;
        if (isCopy) {
            dcdbModelData.uuid = this.uuid;
        }

        dcdbModelData.baseHeight = this.baseHeight;
        dcdbModelData.pillarHeight = this.pillarHeight;
        dcdbModelData.azimuth = this.azimuth;

        dcdbModelData.outlinePoints = [...this.outlinePoints];

        return dcdbModelData;
    }

    loadObject(inverterModelData, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = inverterModelData.id;
            this.name = inverterModelData.name;
        }

        this.baseHeight = inverterModelData.baseHeight;
        this.pillarHeight = inverterModelData.pillarHeight;
        this.azimuth = inverterModelData.azimuth;

        this.outlinePoints = [...inverterModelData.outlinePoints];

        // update geometry
        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    removeObject() {
        super.removeObject();
        if (this.linkedInverter !== null && this.linkedInverter !== undefined) {
            this.linkedInverter.ajb = null;
            this.linkedInverter = null;
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

        this.updateAttachedCables();

        try {
            await this.handleSiblingConsequences();

            this.resetGrandParentSolarAccess();

            // Saving state after the object is placed
            this.saveState();
        }
        catch (error) {
            console.error('ERROR: Inverter: placeObject failed', error);
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    }

    updateAttachedCables() {
        // dc cable disabled
        // if(this.dcCablesAttached) {
        //     const inverter = this.linkedInverter;
        //     const ajbEndOne = new THREE.Vector3((this.outlinePoints[0][0] + this.outlinePoints[3][0])/2,  this.outlinePoints[0][1], 0);
        //     const ajbEndTwo = new THREE.Vector3((this.outlinePoints[1][0] + this.outlinePoints[2][0])/2,  this.outlinePoints[1][1], 0);
        //     for(let i=0; i<inverter.mppts.length; i++) {
        //         const strings = inverter.mppts[i].strings;
        //         for(let j=0; j<strings.length; j++) {
        //             const cable1 = strings[j].attachedDcCable[0];
        //             const cable2 = strings[j].attachedDcCable[1];
        //             cable1.ajbEnd = ajbEndOne;
        //             cable2.ajbEnd = ajbEndTwo;
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

    setObjectOutOfGroundError() {
        this.stage.eventManager.setDcdbOutOfGroundRemoved();
    }

    objectRemoved() {
        this.stage.eventManager.dcdbRemoved();
    }

    static getObjectType() {
        return 'Dcdb';
    }
}

import * as THREE from 'three';
import _, { forOwnRight, reduce, result } from 'lodash';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    OUT_OF_BASE_MODEL_ERROR,
    MODEL_INTERSECTION_WITH_OTHER_MODELS,
    VERTEX_EQUIVALENT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    DEFAULT_HANDRAIL_DIRECTION,
    ALTERNATE_HANDRAIL_DIRECTION,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    DEFAULT_VERTICES_DIRECTION,
    ALTERNATE_VERTICES_DIRECTION,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
} from '../../../coreConstants';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
    MATERIAL_STATES,
    WALKWAY_2D_LINE_WIDTH,
    LINE_WIDTH,
} from '../../visualConstants';
import {
    areVerticesOnGround,
    getAllCommonModelsBelowVertices,
    getTopCommonModelBelowVertices,
    getTopModelFromPoint,
} from '../../../utils/raycastingUtils';
import {
    convertArrayToVector,
    convertArrayTo3DVector,
    checkIfLastVertexOnEdges,
    setbackPolygon,
    getNormalPoints,
    checkLastEdgeIntersectionWithEdges,
    checkPolygonInsidePolygon,
    checkIntersectionWithSiblings,
    checkVertexEquivalency,
    checkLineIntersection,
    lineIntersection,
    getLerpValueFromVertices,
    getHighestZ,
    checkPointInsideVertices,
    rotationAroundPoint,
    getOutlinePoints,
} from '../../../utils/utils';

import OutlinePoints from '../../subObjects/OutlinePoints';
import LengthMeasurement from '../../subObjects/LengthMeasurement';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import Walkway from './../../model/Walkway';
import PolygonModel from './../../model/PolygonModel';
import Ground from '../../ground/Ground';
import Cables from '../../model/cable/Cables';
import Handrail from './../../model/Handrail';
import CylinderModel from './../../model/CylinderModel';
import DcCable from '../../model/cable/DcCable';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';

const MINIMUM_NUMBER_OF_POINTS = 2;

const acCableRadius = 0.02*10;
const UP_CROSSING = 'up-crossing';
const DOWN_CROSSING = 'down-crossing';
const NO_CROSSING = 'no-crossing';
let pointOnParapet1 = false;
let pointOnParapet2 = false;

export default class Conduit extends Cables {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.id = stage.getAcCableId();
        this.name = `Cable #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectGroupFor3D = new THREE.Group();

        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });
        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: 4,
            color: 0xffffff,
        });

        // meshes and edges
        this.conduitMesh = createMesh(createBufferGeometry(), this.meshMaterial2D);
        this.conduitEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.conduitMesh.geometry),
            this.edgeMaterial2D,
        );

        this.conduitMesh.receiveShadow = true;
        this.conduitMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.conduitMesh);
        this.objectsGroup.add(this.conduitEdges);
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.CableDirection = DEFAULT_VERTICES_DIRECTION;
        const defaultProperties = this.getDefaultProperties(); 
        this.setInitialProperties(defaultProperties);
        this.outlinePoints = [];
        this.lengthMeasurements = [];
        this.edgeCentrePoints = [];
        this.attachedDcCable = [];
        this.innerDiameter = 0.75;
        this.outerDiameter = 1.00;
        this.name = "Conduit #";
        this.maxFillFactor = 0.4;
        this.materialType = "EMT - Electrical Metallic Tubing";
        this.inverterEnd = 1;
        this.inverter = null;
        this.updateVisualsAfterLoadingAndCreation();

        this.parentConduit = null;
    }

    setInitialProperties(properties) {
        // TODO-NOW
    }

    /**
     * Returns the default properties properties for handrail
     * For now they are hard-coded.
     */
     getDefaultProperties() {
        return {
           //TODO-NOW
        };
    }

    updateObject(properties) {
        const {name, innerDiameter, outerDiameter, materialType, maxFillFactor} = properties;
        if(name && name !== this.name) {
            this.name = name;
        }
        if(outerDiameter && outerDiameter !== this.outerDiameter) {
            this.outerDiameter = outerDiameter;
        }
        if(innerDiameter && innerDiameter !== this.innerDiameter) {
            if(this.outerDiameter < innerDiameter) {
                this.innerDiameter = this.outerDiameter;
            }
            else {
                this.innerDiameter = innerDiameter;
            }
        }
        if(materialType && materialType !== this.materialType) {
            this.materialType = materialType;
        }
        if(maxFillFactor && maxFillFactor !== this.maxFillFactor) {
            this.maxFillFactor = maxFillFactor;
        }
        
    }

    removeObject() {
        for(let i=0; i<this.attachedDcCable.length; i++) {
            const cable = this.attachedDcCable[i];
            const conduitIndex = cable.attachedConduit.indexOf(this);
            cable.attachedConduit.splice(conduitIndex, 1);
            cable.updateAutoRoutingBrokenOutlinePoints();
            cable.placeObject();
        }
        super.removeObject();
    }

    getState() {
        const conduitData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            innerDiameter:this.innerDiameter,
            outerDiameter:this.outerDiameter,
            maxFillFactor:this.maxFillFactor,
            materialType:this.materialType,
            cable: this.attachedDcCable.map(cable => [
                cable.uuid,
            ]),
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return conduitData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;
            this.innerDiameter = state.innerDiameter;
            this.outerDiameter = state.outerDiameter;
            this.maxFillFactor = state.maxFillFactor;
            this.materialType = state.materialType;
            this.attachedDcCable = [];
            for(let i=0; i<state.cable.length; i++) {
                const cable = this.stage.getObject(state.cable[i]);
                this.attachedDcCable.push(cable);
                cable.saveState();
            }

            this.updateVisualsAfterLoadingAndCreation();

            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.outlinePoints = state.outlinePoints.map(outlinePoint =>
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage,
                    ));

                this.updateMeasurement();
            }
            else {
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error("Handrail: loadState: outlinePoints length don't match");
                    return null;
                }

                for (let index = 0; index < this.outlinePoints.length; index += 1) {
                    this.outlinePoints[index].setPosition(
                        state.outlinePoints[index][0],
                        state.outlinePoints[index][1],
                        state.outlinePoints[index][2],
                    );
                }

                this.updateMeasurement();
            }

            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }

            for(let i=0; i<this.edgeCentrePoints.length; i++) {
                this.edgeCentrePoints[i].hideObject();
            }

            this.placeObject();
        }
    }

    clearState() {
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove measurements
        this.removeMeasurement();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.edgeCentrePoints = [];
    }

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const conduitData = {
            type: Conduit.getObjectType(),
            id: this.id,
            name: this.name,
            innerDiameter:this.innerDiameter,
            outerDiameter:this.outerDiameter,
            maxFillFactor:this.maxFillFactor,
            materialType:this.materialType,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            conduitData.uuid = this.uuid;
        }
        return conduitData;
    }
    
    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
            this.innerDiameter = data.innerDiameter;
            this.outerDiameter = data.outerDiameter;
            this.maxFillFactor = data.maxFillFactor;
            this.materialType = data.materialType;
        }

        // update properties here

        this.outlinePoints = data.outlinePoints.map(
            outlinePoint =>
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ),
        );

        for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
            const nextIndex = i + 1 < l ? i + 1 : 0;
            const currentPoint = this.outlinePoints[i].getPosition();
            const nextPoint = this.outlinePoints[nextIndex].getPosition();
            this.edgeCentrePoints.push(new EdgeCentrePoints(
                (currentPoint.x + nextPoint.x) / 2,
                (currentPoint.y + nextPoint.y) / 2,
                (currentPoint.z + nextPoint.z) / 2,
                this,
                this.stage,
            ));
        }

        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }

        this.updateMeasurement();

        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setHandrailOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.walkwayVertexEquivalentError();
            }
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        this.changeParent(placingInformation.parent);

        this.updateGeometry();

        // update dimensions
        for(let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        this.moveCables();
        this.saveState();

        return true;
    }

    moveCables() {
        for(let i=0; i<this.attachedDcCable.length; i++) {
            const cable = this.attachedDcCable[i];
            cable.updateAutoRoutingBrokenOutlinePoints();
            cable.placeObject();
        }
        this.saveState();
    }


    reversePolarity(conduit) {
        this.outlinePoints.reverse();
        this.moveCables();
    }

    currentFillFactor() {
        if(this.attachedDcCable !== undefined) {
           const totalCableArea = this.attachedDcCable.length*Math.PI*4*0.02*0.02;
           const conduitArea = Math.PI*(this.innerDiameter*this.innerDiameter);
            return totalCableArea/conduitArea;
        }
        return 0;
    }

    updateAttachedCables(string) {
        for (let i = 0; i < this.attachedDcCable.length; i++) {
            if (
                string.attachedDcCable[0].id == this.attachedDcCable[i].id ||
                string.attachedDcCable[1].id == this.attachedDcCable[i].id
                ) {
                    const cable = this.attachedDcCable[i];
                    const conduitIndex = cable.attachedConduit.indexOf(this);
                    cable.attachedConduit.splice(conduitIndex, 1);
                    cable.updateAutoRoutingBrokenOutlinePoints();
                    cable.placeObject();
                    this.attachedDcCable.splice(i, 1);
                    break;
            }
        }
        for (let i = 0; i < this.attachedDcCable.length; i++) {
            if (
                string.attachedDcCable[0].id == this.attachedDcCable[i].id ||
                string.attachedDcCable[1].id == this.attachedDcCable[i].id
                ) {
                    const cable = this.attachedDcCable[i];
                    const conduitIndex = cable.attachedConduit.indexOf(this);
                    cable.attachedConduit.splice(conduitIndex, 1);
                    cable.updateAutoRoutingBrokenOutlinePoints();
                    cable.placeObject();
                    this.attachedDcCable.splice(i, 1);
                    break;
            }
        }
        this.saveState();
    }

    static getObjectType() {
        return 'Conduit';
    }

}
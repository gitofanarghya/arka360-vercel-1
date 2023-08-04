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
} from '../../../utils/utils';

import PolygonModel from './../../model/PolygonModel';
import OutlinePoints from '../../subObjects/OutlinePoints';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import Conduit from './Conduit';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';
import NikGeometry from '../../ground/NikGeometry';

const acCableRadius = 0.02*10;

export default class DoubleConduit extends Conduit {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectGroupFor3D = new THREE.Group();

        // materials
        this.redConduitMeshMaterial2D = new THREE.MeshBasicMaterial({
            color: 0xFF0000,
        });
        this.blackConduitMeshMaterial2D = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });
        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: 4,
            color: 0xffffff,
        });

        this.redConduit = {};
        this.blackConduit = {};


        // meshes and edges
        this.redConduitMesh = createMesh(createBufferGeometry(), this.redConduitMeshMaterial2D);
        this.redConduitEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.redConduitMesh.geometry),
            this.edgeMaterial2D,
        );
        this.blackConduitMesh = createMesh(createBufferGeometry(), this.blackConduitMeshMaterial2D);
        this.blackConduitEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.blackConduitMesh.geometry),
            this.edgeMaterial2D,
        );

        this.redConduitMesh.receiveShadow = true;
        this.redConduitMesh.castShadow = true;
        this.blackConduitMesh.receiveShadow = true;
        this.blackConduitMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.redConduitMesh);
        this.objectsGroup.add(this.redConduitEdges);
        this.objectsGroup.add(this.blackConduitMesh);
        this.objectsGroup.add(this.blackConduitEdges);

        const defaultProperties = this.getDefaultProperties(); 
        this.setInitialProperties(defaultProperties);
        this.updateVisualsAfterLoadingAndCreation();
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
    
    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        const numVertices = vertices2DArray.length;
        let redConduit = vertices2DArray.slice(0, numVertices/2);
        let blackConduit = [];
        for(let i=numVertices/2-1; i>=0; i--) {
            const midPoint = [];
            midPoint.push((vertices2DArray[i][0] + vertices2DArray[numVertices-i-1][0])/2);
            midPoint.push((vertices2DArray[i][1] + vertices2DArray[numVertices-i-1][1])/2);
            redConduit.push(midPoint);
            blackConduit.push(midPoint);
        }
        blackConduit.reverse();
        blackConduit = blackConduit.concat(vertices2DArray.slice(numVertices/2, numVertices));
        blackConduit.reverse();
        // TODO: why?
        // this.redConduit.midEnd = this.midEndPoints(redConduit);
        // this.blackConduit.midEnd = this.midEndPoints(blackConduit);
        const redConduitVertices2DVectorToArray = convertArrayTo3DVector(redConduit);

        const geometry = new NikGeometry(this.stage);
        const redConduitGeometry = geometry.createFromPoints(
            redConduitVertices2DVectorToArray,
            this.coreHeight || 0.002,
        );

        const blackConduitVertices2DVectorToArray = convertArrayTo3DVector(blackConduit);
        const geometry1 = new NikGeometry(this.stage);
        const blackConduitGeometry = geometry1.createFromPoints(
            blackConduitVertices2DVectorToArray,
            this.coreHeight || 0.002,
        );

        // const highestZ = getHighestZ(this.stage.ground);

        // for (let i = 0; i < numVertices; i++) {
        //     const vertex = redConduitGeometry.vertices[i];
        //     vertex.z = highestZ;
        // }

        // for (let i = numVertices; i < 2 * numVertices; i++) {
        //     const vertex = redConduitGeometry.vertices[i];
        //     vertex.z = highestZ + acCableRadius;
        // }


        //updating outline points height
        let constantForParapetAccommodation = 0;
        if (this.getParent() instanceof PolygonModel && this.getParent().isParapetPresent()) {
            constantForParapetAccommodation += this.getParent().getParapetHeight();
        }
        for (const outlinePoint of this.outlinePoints) {
            const position = outlinePoint.getPosition();
            outlinePoint.moveObjectWithoutConsequences(
                0,
                0,
                this.getParent().getZOnTopSurface(position.x, position.y) + acCableRadius + constantForParapetAccommodation - position.z,
            );
        }

        // updating meshes and edges
        this.redConduitMesh.geometry = redConduitGeometry;
        this.redConduitEdges.geometry = new THREE.EdgesGeometry(redConduitGeometry);
        this.blackConduitMesh.geometry = blackConduitGeometry;
        this.blackConduitEdges.geometry = new THREE.EdgesGeometry(blackConduitGeometry);
        

        this.updateMeasurement();

        this.update3DAcCable();
    }

    switchTo3D() {
        this.objectsGroup.remove(this.redConduitMesh);
        this.objectsGroup.remove(this.redConduitEdges);
        this.objectsGroup.remove(this.blackConduitMesh);
        this.objectsGroup.remove(this.blackConduitEdges);
        this.objectsGroup.add(this.objectGroupFor3D);
    }

    switchTo2D() {
        this.objectsGroup.add(this.redConduitMesh);
        this.objectsGroup.add(this.redConduitEdges);
        this.objectsGroup.add(this.blackConduitMesh);
        this.objectsGroup.add(this.blackConduitEdges);
        this.objectsGroup.remove(this.objectGroupFor3D);
    }
    
    changePropertiesDuringCreation(properties) {

        // Here the values gets overridden by the change of values in Ac Cable properties.

       

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

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const conduitData = {
            type: DoubleConduit.getObjectType(),
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


    
    static getObjectType() {
        return 'DoubleConduit';
    }
}
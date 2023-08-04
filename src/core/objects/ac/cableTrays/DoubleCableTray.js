import OutlinePoints from '../../subObjects/OutlinePoints';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import DoubleConduit from '../conduits/DoubleConduit';
import * as THREE from 'three';

export default class DoubleCableTray extends DoubleConduit {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.width = 150;
        this.height = 45;
        const defaultProperties = this.getDefaultProperties(); 
        this.setInitialProperties(defaultProperties);
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
        const {name, width, height, materialType, maxFillFactor} = properties;
        if(name && name !== this.name) {
            this.name = name;
        }
        if(height && height !== this.height) {
            this.height = height;
        }
        if(width && width !== this.width) {
            this.width = width;
        }
        if(materialType && materialType !== this.materialType) {
            this.materialType = materialType;
        }
        if(maxFillFactor && maxFillFactor !== this.maxFillFactor) {
            this.maxFillFactor = maxFillFactor;
        }
        
    }
    
    createHorizontalCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const direction = new THREE.Vector3();
        direction.subVectors(endpoint2, endpoint1).normalize();
        const geometry = new THREE.BoxBufferGeometry(0.06,height,0.06);
        const yAxis = new THREE.Vector3(0, 1, 0);
        yAxis.normalize();
        let rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(direction,yAxis);
        rotationAxis.normalize();
        let theta=-Math.acos(direction.dot(yAxis));
        let rotMatrix=new THREE.Matrix4();
        rotMatrix.makeRotationAxis(rotationAxis, theta);
        geometry.applyMatrix4(rotMatrix);
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry]; 
    }
   

    changePropertiesDuringCreation(properties) {

        // Here the values gets overridden by the change of values in Ac Cable properties.

        this.name = _.get(properties, 'name', this.name);
        this.materialType = _.get(properties, 'materialType', this.materialType);
        this.cores = _.get(properties, 'cores', this.cores);
        this.cableSizeAWG = _.get(properties, 'cableSizeAWG', this.cableSizeAWG);
        this.cableSizeMM = _.get(properties, 'cableSizeMM', this.cableSizeMM);

    }

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const cabletrayData = {
            type: DoubleCableTray.getObjectType(),
            id: this.id,
            name: this.name,
            width:this.width,
            height:this.height,
            maxFillFactor:this.maxFillFactor,
            materialType:this.materialType,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            cabletrayData.uuid = this.uuid;
        }
        return cabletrayData;
    }


    
    static getObjectType() {
        return 'DoubleCableTray';
    }
}
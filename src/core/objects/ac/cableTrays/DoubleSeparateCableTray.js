import OutlinePoints from '../../subObjects/OutlinePoints';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import  DoubleSeparateConduit from '../conduits/DoubleSeparateConduit';
import * as THREE from 'three';

export default class DoubleSeparateCableTray extends DoubleSeparateConduit {
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
    
    // load and save functions

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const acCableData = {
            type: DoubleSeparateCableTray.getObjectType(),
            id: this.id,
            name: this.name,
            CableDirection: this.CableDirection,
            materialType: this.materialType,
            cores: this.cores,
            cableSizeMM: this.cableSizeMM,
            cableSizeAWG: this.cableSizeAWG,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            acCableData.uuid = this.uuid;
        }
        return acCableData;
    }
    
    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
            this.materialType = data.materialType;
            this.cores = data.cores;
            this.cableSizeMM = data.cableSizeMM;
            this.cableSizeAWG = data.cableSizeAWG;
        }

        // update properties here
        this.CableDirection = data.CableDirection;

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

        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
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

        this.updateMeasurement();

        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
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
        const geometry = new THREE.BoxBufferGeometry(0.05,height,0.05);
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

        

    }


    
    static getObjectType() {
        return 'DoubleSeparateCableTray';
    }
}
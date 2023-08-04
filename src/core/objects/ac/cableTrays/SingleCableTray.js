import OutlinePoints from '../../subObjects/OutlinePoints';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import Conduit from '../conduits/Conduit';
import * as THREE from 'three';

export default class SingleCableTray extends Conduit {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.width = 150;
        this.height = 45;
        this.name = "Cabletray #";
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

    getState() {
        const acCableData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            width:this.width,
            height:this.height,
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

        return acCableData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;
            this.width = state.width;
            this.height = state.height;
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
            // for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
            //     const nextIndex = i + 1 < l ? i + 1 : 0;
            //     const currentPoint = this.outlinePoints[i].getPosition();
            //     const nextPoint = this.outlinePoints[nextIndex].getPosition();
            //     this.edgeCentrePoints.push(new EdgeCentrePoints(
            //         (currentPoint.x + nextPoint.x) / 2,
            //         (currentPoint.y + nextPoint.y) / 2,
            //         (currentPoint.z + nextPoint.z) / 2,
            //         this,
            //         this.stage,
            //     ));
            // }

            this.placeObject();
        }
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
        const cabletrayData = {
            type: SingleCableTray.getObjectType(),
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
    
    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
            this.width = data.width;
            this.height = data.height;
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


    
    static getObjectType() {
        return 'SingleCableTray';
    }
}
import * as THREE from 'three';
import _, { forOwnRight, reduce, result } from 'lodash';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import OutlinePoints from '../../subObjects/OutlinePoints';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import Conduit from './Conduit';
import { getAllConduits } from '../../../utils/exporters';
import BaseObject from '../../BaseObject';

export default class DoubleSeparateConduit extends Conduit  {
    constructor(stage) {
        super(stage)
        this.stage = stage;

        this.stage.ground.addChild(this);

        // standard norms
        this.stage = stage;
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

    initDrawingMode() {
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    /**
     * Gets the vertices geometry from draw manager and
     * places the ac cable according to the drawn vertices.
     */
    async onComplete(geometry) {
        const notificationObject = this.stage.eventManager.setAcCableCreating();

        const vertices = _.range(geometry.noOfVertices).map(
            index =>
                new THREE.Vector3(
                    geometry.attributes.position.array[index * 3],
                    geometry.attributes.position.array[index * 3 + 1],
                    geometry.attributes.position.array[index * 3 + 2],
                ),
        );

        this.outlinePoints = vertices.map(
            vertex => new OutlinePoints(vertex.x, vertex.y, vertex.z, this, this.stage),
        );

        // set edge center points
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            const nextIndex = i + 1 < l ? i + 1 : 0;
            this.edgeCentrePoints.push(new EdgeCentrePoints(
                (vertices[i].x + vertices[nextIndex].x) / 2,
                (vertices[i].y + vertices[nextIndex].y) / 2,
                (vertices[i].z + vertices[nextIndex].z) / 2,
                this,
                this.stage,
            ));
        }

        this.updateMeasurement();
        const redConduitVertices = [];
        for(let i=0; i<this.outlinePoints.length; i++) {
            redConduitVertices.push(this.outlinePoints[i].getPosition());
        }
        this.redConduit = new Conduit(this.stage) ;
        this.redConduit.drawCableBetween2Points(redConduitVertices);
        this.redConduit.meshMaterial2D.color.setHex(0xFF0000);
        //this.redConduit.deSelect();
        const vertices2DArray = this.get2DVertices();
        const numVertices = vertices2DArray.length;
        const blackConduitVertices = [];
        for(let i=0; i<numVertices/2; i++) {
            blackConduitVertices.push(new THREE.Vector3(vertices2DArray[numVertices-i-1][0], vertices2DArray[numVertices-i-1][1], 6.800000190734863));
        }
        this.blackConduit = new Conduit(this.stage);
        this.blackConduit.drawCableBetween2Points(blackConduitVertices);
        this.blackConduit.meshMaterial2D.color.setHex(0x000000);
        //this.blackConduit.deSelect();
        try {
            //await this.placeObject();
            this.stage.eventManager.completeAcCableCreation(notificationObject);
            return true;
        }
        catch (error) {
            console.error('ERROR: Conduit: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorAcCableCreation(notificationObject);
            throw error;
        }
    }

    onCancel() {
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    updateGeometry() {
        
    }

    // load and save functions

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const saveData = {
            type: DoubleSeparateConduit.getObjectType(),
            id: this.id,
            name: this.name,
            materialType: this.materialType,
            cores: this.cores,
            cableSizeMM: this.cableSizeMM,
            cableSizeAWG: this.cableSizeAWG,
            redConduitId: this.redConduit !== undefined ? this.redConduit.getId() : 0,
            blackConduitId: this.blackConduit !== undefined ? this.blackConduit.getId() : 0,
            // not required
            // CableDirection: this.CableDirection,
            // outlinePoints: this.outlinePoints.map(outlinePoint => [
            //     outlinePoint.getPosition().x,
            //     outlinePoint.getPosition().y,
            //     outlinePoint.getPosition().z,
            // ]),
        };
        if (isCopy) {
            saveData.uuid = this.uuid;
        }
        return saveData;
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

        this.redConduitId = data.redConduitId;
        this.blackConduitId = data.blackConduitId;

        // not requried.
        // this.CableDirection = data.CableDirection;

        // this.outlinePoints = data.outlinePoints.map(
        //     outlinePoint =>
        //         new OutlinePoints(
        //             outlinePoint[0],
        //             outlinePoint[1],
        //             outlinePoint[2],
        //             this,
        //             this.stage,
        //         ),
        // );

        // for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
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

        // this.updateMeasurement();

        // this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    loadRedAndBlackConduits(allConduits = getAllConduits(this.stage)) {
        for (let i = 0, l = allConduits.length; i < l; i += 1) {
            if (allConduits[i].getId === this.redConduitId) {
                this.redConduit = allConduits[i];
                this.redConduit.parentConduit = this;
            }
            else if (allConduits[i].getId === this.blackConduitId) {
                this.blackConduit = allConduits[i];
                this.blackConduit.parentConduit = this;
            }
        }
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
        super.removeObject();
        this.redConduit.removeObject();
        this.blackConduit.removeObject();
    }

    changePropertiesDuringCreation(properties) {

        // Here the values gets overridden by the change of values in Ac Cable properties.

       

    }

    static getObjectType() {
        return 'DoubleSeparateConduit';
    }
}
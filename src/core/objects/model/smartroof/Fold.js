/* eslint-disable consistent-return */
import * as THREE from 'three';
import { Vector2 } from 'three';
import { Vector3 } from 'three';
import { FLAT_FOLD, PITCHED_FOLD, VERTICAL_FOLD } from '../../../objectConstants';
import * as utils from '../../../utils/utils';
import OutlinePoints from '../../subObjects/OutlinePoints';
import { POINT_SIZE } from '../../visualConstants';
import SmartroofFace from './SmartroofFace';

export default class Fold extends OutlinePoints {
    constructor(x = 0, y = 0, z = 20, smartRoofModel, stage, foldType, smartRoofFace = null) {
        super(x, y, z, smartRoofModel, stage, null);
        this.foldType = foldType;
        this.belongsTo = smartRoofModel;
        this.stage = stage;
        this.isActive = true;
        this.tilt = this.getTiltFromType();
        if (!smartRoofFace) {
            this.smartRoofFace = new SmartroofFace(stage, [], [], this.tilt, this.getHeight(), [[]], this, null);
        }
        else {
            this.smartRoofFace = smartRoofFace;
            smartRoofFace.fold = this;
        }
        this.faceId = this.smartRoofFace.getId();
        this.id = this.faceId;
    }

    getFoldType() {
        return this.foldType;
    }

    getHeight() {
        return this.getPosition().z;
    }

    getTiltFromType() {
        switch (this.getFoldType()) {
        case PITCHED_FOLD:
            return 35;
        case FLAT_FOLD:
            return 0;
        case VERTICAL_FOLD:
            return 90;
        default:
            break;
        }
        // TODO: implement
    }

    // Geometry Manipulation

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // stupidly move the points
        this.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        // call on resize function for model
        this.belongsTo.handleFoldMove(this);
    }

    updateTilt(tilt) {
        this.tilt = tilt;
    }


    async placeObject(deltaX = 0, deltaY = 0, deltaZ = 0) {
        this.moveObject(deltaX, deltaY, deltaZ);
        try {
            await this.belongsTo.handleFoldPlace(this);
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: OutlinePoints: placeObject failed', error);
            return Promise.reject(error);
        }
    }

    moveObjectWithoutConsequences(deltaX, deltaY, deltaZ = 0) {
        // this is to be used when all the vertices are being moved
        // and the geometry is not being resize
        this.vertexMesh.geometry.translate(deltaX, deltaY, deltaZ);
        if (this.plane) {
            this.plane.translate(new Vector3(deltaX, deltaY, deltaZ));
        }
    }

    handleDragStart() {
        // this.belongsTo.foldDragStart(this);
    }

    // Helper functions

    // returns Vector3 of the outline point (with actual z, not raised z)
    getPosition() {
        if (this.objectsGroup.children[0].geometry != null) {
            const x = this.objectsGroup.children[0].geometry.attributes.position.array[0];
            const y = this.objectsGroup.children[0].geometry.attributes.position.array[1];
            const z = this.objectsGroup.children[0].geometry.attributes.position.array[2];
            // noinspection JSValidateTypes
            return new THREE.Vector3(
                x,
                y,
                z - this.raise,
            );
        }
        return null;
    }

    setPosition(x, y, z) {
        const { geometry } = this.vertexMesh;

        if (x !== undefined) {
            geometry.attributes.position.array[0] = x;
        }

        if (y !== undefined) {
            geometry.attributes.position.array[1] = y;
        }

        if (z !== undefined) {
            geometry.attributes.position.array[2] = z + this.raise;
        }

        geometry.attributes.position.needsUpdate = true;
    }

    setMovementRestrictionVector(restrictionVector) {
        this.movementRestrictionVector = restrictionVector.clone();
    }

    // Universal functions

    hideObject() {
        this.objectsGroup.visible = false;
    }

    showObject() {
        this.objectsGroup.visible = true;
    }

    removeObject() {
        try {
            this.objectsGroup.children[0].geometry.dispose();
            this.objectsGroup.children[0].material.dispose();
            this.objectsGroup.remove(this.objectsGroup.children[0]);
        } catch (error) {
            this.objectsGroup.remove(this.objectsGroup.children[0]);
        } finally {
            this.stage.sceneManager.scene.remove(this.objectsGroup);
        }
    }
}
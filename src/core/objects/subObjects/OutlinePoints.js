import * as THREE from 'three';
import createBufferGeometry from '../../utils/meshUtils';
import { POINT_SIZE } from '../visualConstants';

export default class OutlinePoints {
    constructor(x, y, z, object, stage, colorMap = null) {
        // standard norms
        this.stage = stage;
        this.index = -1;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // this connects it back to the tsl object class
        this.belongsTo = object;

        // raise used to increase the z of outline points, useful for selection
        this.raise = 1;

        const pointColor = colorMap !== null ? colorMap : object.getColorMap();
        const defaultColor = new THREE.Color(0xffffff);

        // material
        this.defaultPointColor = pointColor.OUTLINE_POINT_COLOR === undefined ? pointColor.EDGE_COLOR : pointColor.OUTLINE_POINT_COLOR;
        if (this.defaultPointColor === undefined) {
            this.defaultPointColor = defaultColor;
        }

        const pointsMaterial = new THREE.PointsMaterial({
            color: this.defaultPointColor,
            size: POINT_SIZE,
        });
        this.highlightColor = 0x409EFF;
        // geometry
        const vertexGeometry = createBufferGeometry([new THREE.Vector3(x, y, z + this.raise)]);
        // vertexGeometry.vertices.push(new THREE.Vector3(x, y, z + this.raise));

        // mesh
        this.vertexMesh = new THREE.Points(vertexGeometry, pointsMaterial);
        this.vertexMesh.frustumCulled = false;

        // adding mesh to objectsGroup
        this.objectsGroup.add(this.vertexMesh);
        this.objectsGroup.name = 'Top Polygon Point';

        // hide vertex by default
        this.hideObject();
        this.movementRestrictionVector = null;
    }


    // Geometry Manipulation

    moveObject(deltaX, deltaY, deltaZ = 0) {
        let dx = deltaX,
            dy = deltaY,
            dz = deltaZ;
        if (this.movementRestrictionVector !== null) {
            const deltaVector = new THREE.Vector3(deltaX, deltaY, 0);
            deltaVector.projectOnVector(this.movementRestrictionVector);
            dx = deltaVector.x;
            dy = deltaVector.y;
        }
        const prevValue = this.getPosition();
        // stupidly move the points
        this.vertexMesh.geometry.translate(dx, dy, dz);

        // call on resize function for model
        this.belongsTo.handleVertexMove(this, dx, dy, dz, prevValue);
    }

    async placeObject(deltaX = 0, deltaY = 0, deltaZ = 0) {
        this.moveObject(deltaX, deltaY, deltaZ);
        try {
            await this.belongsTo.handleVertexPlace(this);
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
    }

    highlightOnHover() {
        this.updateColor(this.highlightColor);
        this.vertexMesh.material.size = 12;
    }

    unHighlight() {
        this.updateColor(this.defaultPointColor);
        this.vertexMesh.material.size = POINT_SIZE;
    }

    handleDragStart() {
        this.belongsTo.handleVertexDragStart(this);
    }

    async handleDragCancel() {
        await this.placeObject();
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

    updateColor(color) {
        this.vertexMesh.material.color.setHex(color);
    }

    getColor() {
        return this.vertexMesh.material.color.getHex();
    }

    // noinspection JSUnusedGlobalSymbols
    static getObjectType() {
        return 'Vertex';
    }
}
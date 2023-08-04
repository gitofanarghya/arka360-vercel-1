import * as THREE from 'three';
import { Ray, Vector3 } from 'three';
import * as utils from '../../../utils/utils';
import Edge from './Edge';
import createBufferGeometry from '../../../utils/meshUtils';

export default class InnerEdge extends Edge {
    constructor(startPoint, endPoint, smartroofModel, stage, id = null, outerEdge1 = null, outerEdge2 = null) {

        super(smartroofModel, stage, startPoint, endPoint, false);
        // standard norms
        this.status = true;
        this.id = id;
        this.outerEdge1 = outerEdge1;
        this.adjacentFace1 = outerEdge1.smartRoofFace;
        this.adjacentFace2 = outerEdge2.smartRoofFace;
        this.outerEdge2 = outerEdge2;
        this.stage = stage;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // this connects it back to the tsl object class
        this.belongsTo = smartroofModel;
        this.defaultPointColor = 0x288BA8;
        this.highlightColor = 0x28ffed;
        // raise used to increase the z of outline points, useful for selection
        this.raise = 7;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.edge = [this.startPoint, this.endPoint];
        // material
        // this.makeLines();
        this.makeEdgeMesh();
        // hide vertex by default
        this.hideObject();

        this.mousePoint = new THREE.Vector3();
        this.ray = new THREE.Ray(this.mousePoint, new Vector3(0, 0, -1));

        // const endPointClone = endPoint.clone();
        // const startPointClone = startPoint.clone();
        // const slope = (startPointClone.y - endPointClone.y) / (startPointClone.x - endPointClone.x);
        // const textAngle = Math.atan(slope);
        // const lengthInMeters = startPointClone.distanceTo(endPointClone).toFixed(3);
        // const lengthInFeets = lengthInMeters * 3.28084;
        // const lengthInInches = ((((lengthInFeets).toFixed(4)) % 1) * 12).toFixed(2);
        // const length = `${String((((lengthInFeets).toFixed(4)) - (((lengthInFeets).toFixed(4)) % 1)).toFixed(0))}'${String(lengthInInches)}"`;
        // const midPosition = (endPointClone.add(startPointClone)).divideScalar(2);
        // this.measurementText = new ThreejsText(length, midPosition, textAngle, this.stage, smartroofModel);
        // if (this.measurementText) this.measurementText.hideObject();
    }

    addConnectedEdges(edge) { 
        this.connectedEdges.push(edge);
    }

    makeEdgeMaterial() {
        const lineMaterial = new THREE.LineDashedMaterial({
            color: 0x288BA8,
            linewidth: 1,
            scale: 2,
            dashSize: 1,
            gapSize: 1,
        });
        return lineMaterial;
    }

    makeEdgeGeometry() {
        const raisedStart = new THREE.Vector3(this.point1.x, this.point1.y, this.point1.z + 7);
        const raisedEnd = new THREE.Vector3(this.point2.x, this.point2.y, this.point2.z + 7);

        const lineGeometry = createBufferGeometry();
        lineGeometry.setFromPoints([raisedStart, raisedEnd]);
        return lineGeometry;
    }

    makeEdgeMesh() {
        this.linesMesh = new THREE.Line(
            this.makeEdgeGeometry(),
            this.makeEdgeMaterial(),
        );
        this.linesMesh.computeLineDistances();

        this.linesMesh.geometry.computeBoundingSphere();

        this.linesMesh.position.z = 40;
        
        this.linesMesh.name = 'Inner Edge Mesh';

        this.belongsTo.innerEdgesMesh.push(this.linesMesh);
        this.objectsGroup.add(this.linesMesh);
        this.objectsGroup.name = 'Inner Edge';
        // this.belongsTo.EdgesMesh.push(this.linesMesh);
    }
    makeLines() {
        const linesMaterial = new THREE.LineDashedMaterial({
            color: 0x288BA8,
            linewidth: 1,
            scale: 2,
            dashSize: 1,
            gapSize: 1,
        });

        // geometry
        const raisedStart = new THREE.Vector3(this.startPoint.x, this.startPoint.y, this.startPoint.z + this.raise);
        const raisedEnd = new THREE.Vector3(this.endPoint.x, this.endPoint.y, this.endPoint.z + this.raise);

        const innerEdgeLineGeometry = new THREE.BufferGeometry();
        innerEdgeLineGeometry.setFromPoints([raisedStart, raisedEnd]);
        this.linesMesh = new THREE.Line(
            innerEdgeLineGeometry,
            linesMaterial,
        );
        this.linesMesh.computeLineDistances();

        this.linesMesh.geometry.computeBoundingSphere();

        this.linesMesh.position.z = 40;

        this.linesMesh.name = 'Inner Edge Mesh';

        this.belongsTo.innerEdgesMesh.push(this.linesMesh);
        this.objectsGroup.add(this.linesMesh);
        this.objectsGroup.name = 'Inner Edge';
    }

    updateGeometry() {
        const raisedStart = new THREE.Vector3(this.startPoint.x, this.startPoint.y, this.startPoint.z + this.raise);
        const raisedEnd = new THREE.Vector3(this.endPoint.x, this.endPoint.y, this.endPoint.z + this.raise);
        this.point1 = raisedStart;
        this.point2 = raisedEnd;
        const innerEdgeLineGeometry = new THREE.BufferGeometry();
        innerEdgeLineGeometry.setFromPoints([raisedStart, raisedEnd]);
        if (this.linesMesh && this.linesMesh.geometry) this.linesMesh.geometry.dispose();
        if (this.linesMesh.geometry) this.linesMesh.geometry.dispose();
        this.linesMesh.geometry = innerEdgeLineGeometry;
        this.linesMesh.computeLineDistances();
        this.linesMesh.geometry.attributes.position.needsUpdate = true;
        this.measurementTextUpdate();
    }

    enable() {
        this.status = true;
        // this.objectsGroup.visible = true;
    }

    disable() {
        this.status = false;
        this.objectsGroup.visible = false;
        if (this.measurementText) this.measurementText.objectsGroup.visible = false;
    }

    highlightOnHover() {
        this.updateColor(this.highlightColor);
    }

    unHighlight() {
        this.updateColor(this.defaultPointColor);
    }

    moveObject() {
        this.mousePoint.x = this.stage.mousePoint.x;
        this.mousePoint.y = this.stage.mousePoint.y;
        this.mousePoint.z = 100000;
        this.ray = new Ray(this.mousePoint, new Vector3(0, 0, -1));
        const outerEdge1Plane = this.outerEdge1.facePlane;
        const outerEdge2Plane = this.outerEdge2.facePlane;
        const intersection1 = new Vector3();
        this.ray.intersectPlane(outerEdge1Plane, intersection1);
        const intersection2 = new Vector3();
        this.ray.intersectPlane(outerEdge2Plane, intersection2);
        if (intersection1 && intersection2) {
            const dz = intersection1.z - intersection2.z;
            const plane1Factor = Math.tan(utils.deg2Rad(this.outerEdge1.tilt));
            const plane2Factor = Math.tan(utils.deg2Rad(this.outerEdge2.tilt));
            const deltaZ1 = -dz * (plane1Factor / (plane1Factor + plane2Factor));
            const deltaZ2 = dz * (plane2Factor / (plane1Factor + plane2Factor));
            this.outerEdge1.changeHeight(deltaZ1);
            this.outerEdge2.changeHeight(deltaZ2);
            this.belongsTo.handleInnerEdgeMove();
        }
        this.measurementTextUpdate();
    }

    async placeObject(deltaX = 0, deltaY = 0, deltaZ = 0) {
        this.moveObject(deltaX, deltaY, deltaZ);
        try {
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: OutlinePoints: placeObject failed', error);
            return Promise.reject(error);
        }
    }

    moveObjectWithoutConsequences(deltaX, deltaY, deltaZ = 0) {
        // this is to be used when all the vertices are being moved
        // and the geometry is not being resize
        // console.log('moveObjectWithoutConsequences inner edges');
        this.linesMesh.geometry.translate(deltaX, deltaY, deltaZ);
        if (this.measurementText) this.measurementText.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        // const pos = this.measurementText.getPosition().add(new THREE.Vector3(deltaX, deltaY, deltaZ));
        // this.measurementText.setPosition(pos);
    }

    handleDragStart() {
        this.line = new THREE.Line3(new Vector3(this.startPoint.x, this.startPoint.y, 0), new Vector3(this.endPoint.x, this.endPoint.y, 0));
        this.belongsTo.handleVertexDragStart(this);
    }

    handleDragEnd() {
        // console.log('handleDragEnd');
        this.belongsTo.handleInnerEdgeDragEnd(this);
    }

    // Helper functions

    // returns Vector3 of the outline point (with actual z, not raised z)
    getPosition() {
        if (this.objectsGroup.children[0].geometry != null) {
            // noinspection JSValidateTypes
            return [this.point1, this.point2];
        }
        return null;
    }

    setMovementRestrictionVector(restrictionVector) {
        this.movementRestrictionVector = restrictionVector.clone();
    }

    // Universal functions

    // hideObject() {
    //     this.objectsGroup.visible = false;
    //     // if (this.measurementText) this.measurementText.hideObject();
    // }

    // showObject() {
    //     if (this.status) {
    //         this.objectsGroup.visible = true;
    //         // if (this.measurementText) this.measurementText.showObject();
    //     }
    // }

    removeObject() {
        try {
            this.objectsGroup.children[0].geometry.dispose();
            this.objectsGroup.children[0].material.dispose();
            this.objectsGroup.remove(this.objectsGroup.children[0]);
            // this.measurementText.removeObject();
        }
        catch (error) {
            this.objectsGroup.remove(this.objectsGroup.children[0]);
        }
        finally {
            // this.measurementText.removeObject();
            this.stage.sceneManager.scene.remove(this.objectsGroup);
        }
    }

    updateColor(color) {
        this.linesMesh.material.color.setHex(color);
    }

    getColor() {
        return this.linesMesh.material.color.getHex();
    }

    // noinspection JSUnusedGlobalSymbols
    static getObjectType() {
        return 'Vertex';
    }
}

import ThreejsText from '../../subObjects/ThreejsText';
import OutlinePoints from '../../subObjects/OutlinePoints';
import * as THREE from 'three';


export default class Edge {
    constructor(parent, stage, outlinePoint1, outlinePoint2, measurementTextFlag, index1 = -1, index2 = -1, editable = false) {
        this.belongsTo = parent;
        this.parent = parent;
        this.stage = stage;
        this.outlinePoint1 = outlinePoint1;
        this.outlinePoint2 = outlinePoint2;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.objectsGroup.name = 'Edge';
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.point1 = (this.outlinePoint1 instanceof OutlinePoints) ? this.outlinePoint1.getPosition() : this.outlinePoint1;
        this.point1.z += 60;
        this.point2 = (this.outlinePoint2 instanceof OutlinePoints) ? this.outlinePoint2.getPosition() : this.outlinePoint2;
        this.point2.z += 60;
        this.createHash();
        this.highlightColor = 0x28ffed;
        this.measurementTextFlag = measurementTextFlag;
        this.index1 = index1;
        this.index2 = index2;
        this.editable = editable;
        this.status = true;
        if (this.measurementTextFlag) this.measurementText = this.makeMeasurementText();

        // Math.floor(Date.now() / 1000)
        // console.log('Math.floor(Date.now() / 1000): ', Math.floor(Date.now() / 1000));
        // this.makeEdgeMesh();
        if (this.measurementText) this.measurementText.hideObject();
        // if (this.measurementText) this.belongsTo.EdgesMesh.push(this.measurementText.textMesh);
    }

    createHash() {
        const precision = 10000;
        const currentVertex = this.point1;
        const nextVertex = this.point2;
        const currentVertexHash = `${Math.round(currentVertex.x * precision)},${Math.round(currentVertex.y * precision)}`;
        const nextVertexHash = `${Math.round(nextVertex.x * precision)},${Math.round(nextVertex.y * precision)}`;

        this.edgeHash = `${currentVertexHash}_${nextVertexHash}`;
        this.reverseEdgeHash = `${nextVertexHash}_${currentVertexHash}`;
    }

    makeMeasurementText() {
        const endPointClone = this.point2.clone();
        endPointClone.z = 0;
        const startPointClone = this.point1.clone();
        startPointClone.z = 0;
        const slope = (startPointClone.y - endPointClone.y) / (startPointClone.x - endPointClone.x);
        let textAngle = Math.atan(slope);
        if ((endPointClone.y > startPointClone.y) && (endPointClone.x < startPointClone.x) && this.editable) {
            textAngle = Math.PI + textAngle;
        }
        else if ((endPointClone.y < startPointClone.y) && (endPointClone.x < startPointClone.x) && this.editable) {
            textAngle = Math.PI + textAngle;
        }
        else if ((endPointClone.y < startPointClone.y) && (endPointClone.x > startPointClone.x) && !this.editable) {
            textAngle = Math.PI + textAngle;
        }
        else if ((endPointClone.y > startPointClone.y) && (endPointClone.x > startPointClone.x) && !this.editable) {
            textAngle = Math.PI + textAngle;
        }
        
        const lengthInMeters = startPointClone.distanceTo(endPointClone).toFixed(3);
        // const lengthInFeets = lengthInMeters * 3.28084;
        // const lengthInInches = ((((lengthInFeets).toFixed(4)) % 1) * 12).toFixed(2);
        // const length = `${String((((lengthInFeets).toFixed(4)) - (((lengthInFeets).toFixed(4)) % 1)).toFixed(0))}'${String(lengthInInches)}"`;
        const midPosition = (endPointClone.add(startPointClone)).divideScalar(2);
        return new ThreejsText(lengthInMeters, midPosition, textAngle, this.stage, this, this.editable);
    }

    // eslint-disable-next-line class-methods-use-this
    makeEdgeMaterial() {
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 1,
        });
        return lineMaterial;
    }

    makeEdgeGeometry() {
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setFromPoints([this.point1, this.point2]);
        return lineGeometry;
    }

    makeEdgeMesh() {
        this.linesMesh = new THREE.Line(
            this.makeEdgeGeometry(),
            this.makeEdgeMaterial(),
        );
        this.objectsGroup.add(this.linesMesh);
        this.linesMesh.name = 'edge';
        this.linesMesh.userData = {
            belongsTo: this.belongsTo,
            type: 'edge',
            edge: this,
        };
        // this.belongsTo.EdgesMesh.push(this.linesMesh);
    }
    measurementTextUpdate() {
        const endPointClone = this.point2.clone();
        endPointClone.z = 0;
        const startPointClone = this.point1.clone();
        startPointClone.z = 0;
        const slope = (startPointClone.y - endPointClone.y) / (startPointClone.x - endPointClone.x);
        let textAngle = Math.atan(slope);
        if ((endPointClone.y > startPointClone.y) && (endPointClone.x < startPointClone.x) && this.editable) {
            textAngle = Math.PI + textAngle;
        }
        else if ((endPointClone.y < startPointClone.y) && (endPointClone.x < startPointClone.x) && this.editable) {
            textAngle = Math.PI + textAngle;
        }
        const lengthInMeters = startPointClone.distanceTo(endPointClone).toFixed(3);
        // const lengthInFeets = lengthInMeters * 3.28084;
        // const lengthInInches = ((((lengthInFeets).toFixed(4)) % 1) * 12).toFixed(2);
        // const length = `${String((((lengthInFeets).toFixed(4)) - (((lengthInFeets).toFixed(4)) % 1)).toFixed(0))}'${String(lengthInInches)}"`;
        const midPosition = (endPointClone.add(startPointClone)).divideScalar(2);
        this.createHash();
        if (this.measurementText) this.measurementText.update(lengthInMeters, midPosition, textAngle);
    }

    updateEdge(point1, point2) {
        this.point1 = point1.clone();
        this.point2 = point2.clone();
        this.point1.z += 10;
        this.point2.z += 10;
        this.linesMesh.geometry.setFromPoints([this.point1, this.point2]);
        this.measurementTextUpdate();
    }


    updateColor(color) {
        this.linesMesh.material.color.setHex(color);
    }

    highlightOnHover() {
        this.updateColor(this.highlightColor);
    }

    unHighlight() {
        this.updateColor(this.defaultPointColor);
    }

    onSelect() {
        this.isSelected = true;
        if (this.measurementText) this.measurementText.showObject();
        this.edgeMesh.visible = true;
    }

    onDeselect() {
        this.isSelected = false;
        if (this.measurementText) this.measurementText.hideObject();
        this.edgeMesh.visible = false;
    }

    hideObject() {
        if (this.measurementText) this.measurementText.hideObject();
        this.objectsGroup.visible = false;
    }

    showObject() {
        if (this.status && !this.stage.visualManager.in3D) {
            if (this.measurementText) this.measurementText.showObject();
            this.objectsGroup.visible = true;
        }
    }

    removeObject() {
        if (this.measurementText) this.measurementText.removeObject();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }
}
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
import * as THREE from 'three';
import * as utils from '../../../utils/utils';
import { Vector3 } from 'three';
import SmartroofFace from './SmartroofFace';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import Edge from './Edge';
import createBufferGeometry from '../../../utils/meshUtils';
import img from '../../../../assets/img/arrow.png'

export default class OuterEdge extends Edge {
    constructor(parent, stage, outlinePoint1 = null, outlinePoint2 = null, outlinePoint1Index, outlinePoint2Index, height = null, isPitched = true, tilt = 20, smartRoofFace = null) {
        super(parent, stage, outlinePoint1, outlinePoint2, true, outlinePoint1Index, outlinePoint2Index, !parent.isTemplate && !parent.isTurret);
        // this.belongsTo = parent;
        // this.parent = parent;
        // this.stage = stage;
        this.isPitched = isPitched;
        this.tilt = tilt;
        this.defaultTilt = this.parent.defaultTilt;
        this.height = height;
        // this.outlinePoint1 = outlinePoint1;
        // this.outlinePoint2 = outlinePoint2;
        this.outlinePoint1Index = outlinePoint1Index;
        this.outlinePoint2Index = outlinePoint2Index;
        // this.point1 = this.outlinePoint1.getPosition();
        // this.point2 = this.outlinePoint2.getPosition();
        this.defaultColor = 0xF0FFFF;
        // Neon sky blue color for highlighted edges
        this.highlightColor = 0x7DF9FF;

        if (!smartRoofFace) {
            this.smartRoofFace = new SmartroofFace(stage, [], [], this.getValidTilt(tilt), height, [[]], null, this);
        }
        else {
            this.smartRoofFace = smartRoofFace;
            smartRoofFace.outerEdge = this;
        }
        this.id = this.smartRoofFace.id;
        this.wallId = `${this.id}wall`;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.highlightedLine = new Line2();
        this.azimuthSelection = this.makeAzimuthSelection();
        this.highlightedLine.geometry = new LineGeometry();
        this.objectsGroup.name = 'Outer Edge';
        this.otherObject = [];
        this.shrinkPaths = [];
        this.children= [];
        this.updateFacePlane();
        this.updateWallPlane();
        // this.edge = new Edge(this.belongsTo, this.stage, this.outlinePoint1, this.outlinePoint2);
        this.makeOuterEdge();
        this.hideObject();
        this.coupledEdges = [];
        this.isPrimaryEdge = false;
    }

    loadFace(face) {
        this.smartRoofFace = face;
        this.id = this.smartRoofFace.id;
        this.wallId = `${this.id}wall`;
        this.updateFacePlane();
        this.updateWallPlane();
        this.makeOuterEdge();
    }

    makeOuterEdge() {
        this.makeEdgeGeometry();
        this.makeEdgeMaterial();
        this.makeEdgeMesh();
    }
    hideObject() {
        if (this.measurementText) this.measurementText.hideObject();
        this.objectsGroup.visible = false;
        if(this.azimuthSelection)this.azimuthSelection.visible = false;
    }

    showObject() {
        if (this.status && !this.stage.visualManager.in3D) {
            if (this.measurementText) this.measurementText.showObject();
            this.objectsGroup.visible = true;
            
        }
        if(this.azimuthSelection)this.azimuthSelection.visible = true;
    }

    makeEdgeGeometry() {
        const EPSILON = 5;
        this.outerEdgeGeometry = createBufferGeometry();
        const raisedPoint1 = new Vector3(this.point1.x, this.point1.y, this.point1.z + EPSILON);
        const raisedPoint2 = new Vector3(this.point2.x, this.point2.y, this.point2.z + EPSILON);
        // this.outerEdgeGeometry.vertices.push(raisedPoint1);
        // this.outerEdgeGeometry.vertices.push(raisedPoint2);
        this.outerEdgeGeometry.setFromPoints([raisedPoint1, raisedPoint2]);
        if (this.highlightedLine) {
            const points = [];
            points.push(raisedPoint1.x, raisedPoint1.y, raisedPoint1.z);
            points.push(raisedPoint2.x, raisedPoint2.y, raisedPoint2.z);
            this.highlightedLine.geometry.setPositions(points);
        }
    }

    makeEdgeMaterial() {
        // make blue outer edges
        this.outerEdgeMaterial = new THREE.LineBasicMaterial({
            color: 0xF0FFFF,
            linewidth: 1,
        });
        if (this.highlightedLine) { 
            this.highlightedLine.material = new LineMaterial({
            color: new THREE.Color(this.highlightColor),
            linewidth: 5,
            });
            this.updateHighlightResolution();
        }
    }a


    getPerpendicularPoint(vector1, vector2) {
        // Calculate the midpoint of the line
        const midpoint = vector1.add(vector2).multiplyScalar(0.5);
      
        const crossProduct = new THREE.Vector3().crossVectors(vector1, vector2);

        // The cross product gives a vector that is perpendicular to both input vectors
        const perpendicular = crossProduct.clone().normalize();
      
        // Multiply the perpendicular vector by 1 and add it to the midpoint to get the final point
        const finalPoint = new THREE.Vector3().addVectors(midpoint, perpendicular.multiplyScalar(-2));
      
        return finalPoint;
      }
      

    makeAzimuthSelection() {
        const geometry = new THREE.BoxGeometry(1, 1, .00001);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(img);
        // Create a new Mesh object with the geometry and a basic material
        const material = new THREE.MeshBasicMaterial({map: texture});
        material.opacity = .5
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    getPerpendicularPoint(vector1, vector2) {
        // Calculate the midpoint of the line
        const midpoint = vector1.add(vector2).multiplyScalar(0.5);
      
        const crossProduct = new THREE.Vector3().crossVectors(vector1, vector2);

        // The cross product gives a vector that is perpendicular to both input vectors
        const perpendicular = crossProduct.clone().normalize();
      
        // Multiply the perpendicular vector by 1 and add it to the midpoint to get the final point
        const finalPoint = new THREE.Vector3().addVectors(midpoint, perpendicular.multiplyScalar(-2));
      
        return finalPoint;
    }
    updateAzimuthSelectionArrow() {
        const check = utils.checkClockwise([this.outlinePoint1.getPosition(),this.outlinePoint2.getPosition()]);
        const outlineP1 = this.outlinePoint1.getPosition();
        const outlineP2 = this.outlinePoint2.getPosition();
        const centerPos = this.getPerpendicularPoint(new THREE.Vector3(outlineP1.x,outlineP1.y,20),new THREE.Vector3(outlineP2.x,outlineP2.y,20));
        let  direction = this.outlinePoint1.getPosition().clone().sub(this.outlinePoint2.getPosition().clone()).normalize();
        // Create a new Euler object and set its rotation to align with the direction vector
        const euler =  direction;

        if(!this.isPrimaryEdge) this.azimuthSelection.position.set(centerPos.x ,centerPos.y ,20);
        else {
            const parentvertices = [];
            this.parent.outlinePoints.forEach(outlinePoint => {
                parentvertices.push(outlinePoint.getPosition())
            })
            const centroid = this.findCentroid(parentvertices);
            this.azimuthSelection.position.set(centroid.x ,centroid.y ,20);
        }
        this.azimuthSelection.rotation.set(0,0,euler.z);

        // Normalize the direction vector
        direction.normalize();

        // Calculate the rotation axis
        var rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(new THREE.Vector3(0, 1, 0), direction);
        rotationAxis.normalize();

        // Calculate the angle of rotation
        var angle = Math.acos(new THREE.Vector3(0, 1, 0).dot(direction));

        // Create a quaternion rotation
        var quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(rotationAxis, angle);

        // Apply the rotation to the box mesh
        this.azimuthSelection.setRotationFromQuaternion(quaternion);
    }

    loadDeleteState(){
        this.makeEdgeMesh()
        this.stage.sceneManager.scene.add(this.objectsGroup);

    }
      

    makeEdgeMesh() {
        if(this.parent.objectType() === 'DrawFace'){
            this.updateAzimuthSelectionArrow();
            this.belongsTo.outerEdgesMesh.push(this.azimuthSelection);
            this.objectsGroup.add(this.azimuthSelection);
        }


        this.outerEdgeMesh = new THREE.Line(this.outerEdgeGeometry, this.outerEdgeMaterial);
        this.outerEdgeMesh.name = 'Outer Edge Mesh';
        this.objectsGroup.add(this.outerEdgeMesh);
        this.objectsGroup.add(this.highlightedLine);
        if (this.highlightedLine) this.highlightedLine.visible = false;
        this.belongsTo.measurementTextMesh.push(this.measurementText.textMesh);
        this.belongsTo.outerEdgesMesh.push(this.outerEdgeMesh);
    }

    handleTextSelection() {
        if (!this.stage.dragControls.isEditModeEnabled() &&
            !this.stage.duplicateManager.isEditModeEnabled() &&
            !this.stage.setbackEditMode.isEnabled() &&
            !this.stage.smartRoofSetbackEditMode.isEnabled()) {
            this.isTextSelected = true;
            this.stage.selectionControls.setSelectedObject(this);
        }
    }

    updateOuterEdge() {
        // this.outerEdgeGeometry.vertices[0].copy(this.outlinePoint1.getPosition());
        // this.outerEdgeGeometry.vertices[1].copy(this.outlinePoint2.getPosition());
        this.outerEdgeGeometry.setFromPoints([this.outlinePoint1.getPosition(), this.outlinePoint2.getPosition()])
        this.point1 = this.outlinePoint1.getPosition();
        this.point1.z = this.height;
        this.point2 = this.outlinePoint2.getPosition();
        this.point2.z = this.height;
        this.outerEdgeGeometry.translate(0, 0, 5);
        this.outerEdgeGeometry.attributes.position.needsUpdate = true;
        if (this.highlightedLine) {
            const points = [];
            points.push(this.point1.x, this.point1.y, this.point1.z);
            points.push(this.point2.x, this.point2.y, this.point2.z);
            this.highlightedLine.geometry.setPositions(points);
            this.updateHighlightResolution();
        }
        
        this.updateFacePlane();
        this.updateWallPlane();
        this.measurementTextUpdate();
        this.updateAzimuthSelectionArrow();
        // this.edge.updateEdge(this.point1, this.point2);
    }

    highlightOnHover() {
        if (!this.isSelected) {
            this.highlightLine();
        }
    }

    highlightLine() {
        if (this.highlightedLine) {
            this.updateHighlightResolution();
            this.highlightedLine.visible = true;
        }
    }

    updateHighlightResolution() {
        if (this.highlightedLine && this.highlightedLine.material) {
            const resolution = new THREE.Vector2();
            this.stage.rendererManager.renderer.getSize(resolution);
            this.highlightedLine.material.resolution.set(resolution.x, resolution.y);
        }
    }

    unHighlight() {
        if (!this.isSelected) {
            if (this.highlightedLine) this.highlightedLine.visible = false;
        }
    }

    updateColor(color) {
        this.outerEdgeMesh.material.color.setHex(color);
    }

    changeHeight(deltaHeight) {
        this.height += deltaHeight;
        if (this.height < 0) {
            this.height = 0;
        }
        this.smartRoofFace.coreHeight = this.height;
        this.updateOuterEdge();
        for (let i = 0; i < this.coupledEdges.length; i++) {
            const coupledEdge = this.coupledEdges[i];
            coupledEdge.height += deltaHeight;
            if (coupledEdge.height < 0) {
                coupledEdge.height = 0;
            }
            coupledEdge.smartRoofFace.coreHeight = coupledEdge.height;
            coupledEdge.updateOuterEdge();
        }
    }

    getValidTilt(tilt) {
        const validTilt = utils.isNumber(parseFloat(tilt)) ? parseFloat(tilt) : this.defaultTilt;
        return validTilt;
    }

    moveObject() {
        this.moveObjectWithContraints();
        // if (this.belongsTo.isTemplate) {
        // }
        // else {
        //     const EPSILON = 0.00001;
        //     this.point1 = this.outlinePoint1.getPosition();
        //     this.point2 = this.outlinePoint2.getPosition();
        //     const line = new THREE.Line3(new Vector3(this.point1.x, this.point1.y, 0), new Vector3(this.point2.x, this.point2.y, 0));
        //     const mousePoint = new THREE.Vector3(this.stage.mousePoint.x, this.stage.mousePoint.y, 0);
        //     const closestPointToPoint = new Vector3();
        //     line.closestPointToPoint(mousePoint, false, closestPointToPoint);
        //     const distance = closestPointToPoint.distanceTo(mousePoint);
        //     let dx = 0;
        //     let dy = 0;
        //     if (distance > EPSILON) {
        //         dx = mousePoint.x - closestPointToPoint.x;
        //         dy = mousePoint.y - closestPointToPoint.y;
        //         const dz = 0;
        //         this.outlinePoint1.moveObjectWithoutConsequences(dx, dy, dz);
        //         this.outlinePoint2.moveObjectWithoutConsequences(dx, dy, dz);
        //     }
        //     this.updateOuterEdge();
        //     this.belongsTo.handleOuterEdgeMove(this, dx, dy);
        // }
    }

    moveObjectWithContraints() {
        const EPSILON = 0.00001;
        this.point1 = this.outlinePoint1.getPosition();
        this.point2 = this.outlinePoint2.getPosition();
        const line = new THREE.Line3(new Vector3(this.point1.x, this.point1.y, 0), new Vector3(this.point2.x, this.point2.y, 0));
        const mousePoint = new THREE.Vector3(this.stage.mousePoint.x, this.stage.mousePoint.y, 0);
        const closestPointToPoint = new Vector3();
        line.closestPointToPoint(mousePoint, false, closestPointToPoint);
        const distance = closestPointToPoint.distanceTo(mousePoint);
        let dx = 0;
        let dy = 0;
        if (distance > EPSILON) {
            dx = mousePoint.x - closestPointToPoint.x;
            dy = mousePoint.y - closestPointToPoint.y;
            const dz = 0;
            this.outlinePoint1.moveObjectWithoutConsequences(dx, dy, dz);
            this.outlinePoint2.moveObjectWithoutConsequences(dx, dy, dz);
            if (this.mirrorEdge) {
                this.mirrorEdge.outlinePoint1.moveObjectWithoutConsequences(-dx, -dy, dz);
                this.mirrorEdge.outlinePoint2.moveObjectWithoutConsequences(-dx, -dy, dz);
                this.mirrorEdge.updateOuterEdge();
            }
        }
        this.updateOuterEdge();
        this.belongsTo.handleOuterEdgeMove(this, dx, dy);
    }

    moveObjectWithoutConsequences(deltaX, deltaY, deltaZ = 0) {
        this.height += deltaZ;
        this.updateOuterEdge();
    }

    getPosition() {
        if (this.objectsGroup.children[0].geometry != null) {
            // noinspection JSValidateTypes
            return [this.point1, this.point2];
        }
        return null;
    }

    async placeObject() {
        try {
            await this.belongsTo.handleOuterEdgeDragEnd(this);
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: OutlinePoints: placeObject failed', error);
            return Promise.reject(error);
        }
    }

    handleDragStart() {
        this.belongsTo.handleVertexDragStart(this);
    }

    getParent() {
        return this.belongsTo;
    }
    findCentroid(vectors) {
        if (vectors.length === 0) {
          return null; // Return null if the array is empty
        }
      
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
      
        for (let i = 0; i < vectors.length; i++) {
          sumX += vectors[i].x;
          sumY += vectors[i].y;
          sumZ += vectors[i].z;
        }
      
        const centroidX = sumX / vectors.length;
        const centroidY = sumY / vectors.length;
        const centroidZ = sumZ / vectors.length;
      
        return new THREE.Vector3(centroidX, centroidY, 20);
    }
    getChildren() {
        return this.children;
    }

    onSelect() {
        this.isSelected = true;
        this.measurementText.showObject();
        if(this.parent.objectType() === 'DrawFace' && !this.isPrimaryEdge) {
            this.stage.stateManager.startContainer();
            const centroid = this.findCentroid(this.parent.oldVertices);
            this.azimuthSelection.position.set(centroid.x ,centroid.y ,20);
            this.isPrimaryEdge = true;
            this.parent.makePrimaryEdge(this);
            this.parent.saveState();
            this.stage.stateManager.stopContainer();
        }
        else {
            this.highlightLine();
            this.outerEdgeMesh.visible = true;
        }
    }
    onSelectEdge() {
        this.isSelected = true;
        this.measurementText.showObject();
        if(this.parent.objectType() === 'DrawFace' && !this.isPrimaryEdge) {
            this.stage.stateManager.startContainer();
            const centroid = this.findCentroid(this.parent.oldVertices);
            this.azimuthSelection.position.set(centroid.x ,centroid.y ,20);
            this.isPrimaryEdge = true;
            this.parent.makePrimaryEdge(this);
            this.parent.onSelect();
            this.parent.saveState();
            this.stage.stateManager.stopContainer();
        }
        else {
            this.highlightLine();
            this.outerEdgeMesh.visible = true;
        }
    }

    deSelect() {
        this.parent.deSelect();
    }
    onDeselect() {
        this.isSelected = false;
        if (this.highlightedLine) this.highlightedLine.visible = false;
        this.measurementText.hideObject();
        this.outerEdgeMesh.visible = false;
    }

    getSaveObjectArray() {
        // Convert all the data and return it as an array
        const saveObject = {
            id: this.id,
            outlinePoint1Index: this.outlinePoint1Index,
            outlinePoint2Index: this.outlinePoint2Index,
            height: this.height,
            belongsTo: this.belongsTo.id,
            tilt: this.getValidTilt(this.tilt),
            isPitched: this.isPitched,
        };
        return saveObject;
    }

    loadObject(saveObjectArray) {
        // load the object from an array of data
        this.point1 = new Vector3(saveObjectArray[0][0], saveObjectArray[0][1], saveObjectArray[0][2]);
        this.point2 = new Vector3(saveObjectArray[1][0], saveObjectArray[1][1], saveObjectArray[1][2]);
        this.isPitched = saveObjectArray[2];
        this.tilt = this.getValidTilt(saveObjectArray[3]);
        if (saveObjectArray[4] != null) {
            this.smartRoofFace = this.stage.sceneManager.scene.getObjectById(saveObjectArray[4]);
        }
        else {
            this.smartRoofFace = null;
        }
        this.makeOuterEdge();
    }

    getInwardHorizontalNormal() {
        return (new Vector3(this.point1.y - this.point2.y, this.point2.x - this.point1.x, 0)).normalize();
    }

    getAzimuth() {
        let edge = [];
        edge = [this.point2, this.point1];


        // getting normal for each pair
        let azimuth = 180;
        let angle = utils.toDegrees(Math.atan2((edge[1].y - edge[0].y), -(edge[1].x - edge[0].x)));
        // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
        angle += 180;
        azimuth = angle.toFixed(2);
        if (azimuth > 359.99) {
            azimuth = 0;
        }

        return azimuth;
    }

    getEdgeVector() {
        return (new Vector3(this.point2.x - this.point1.x, this.point2.y - this.point1.y, 0)).normalize();
    }

    getMidPoint() {
        return new Vector3((this.point1.x + this.point2.x) / 2, (this.point1.y + this.point2.y) / 2, (this.point1.z + this.point2.z) / 2);
    }

    getLength() {
        return this.point1.distanceTo(this.point2);
    }

    getPlaneNormal() {
        const planeNormalAngle = utils.deg2Rad(90 + this.getValidTilt(this.tilt));
        const planeNormal = (this.getInwardHorizontalNormal().applyAxisAngle(this.getEdgeVector(), planeNormalAngle)).normalize();
        return planeNormal;
    }

    getFacePlane() {
        // console.log('this.point1: ', this.point1);
        return new THREE.Plane().setFromNormalAndCoplanarPoint(this.getPlaneNormal(), this.point1);
    }

    updateFacePlane() {
        this.facePlane = this.getFacePlane();
        this.smartRoofFace.plane = this.facePlane;
    }

    getWallPlane() {
        const verticalPlane = new THREE.Plane().setFromCoplanarPoints(
            new THREE.Vector3(
                this.point1.x,
                this.point1.y,
                0,
            ),
            new THREE.Vector3(
                this.point2.x,
                this.point2.y,
                0,
            ),
            new THREE.Vector3(
                this.point1.x,
                this.point1.y,
                1,
            ),
        );
        return verticalPlane;
    }

    updateWallPlane() {
        this.wallPlane = this.getWallPlane();
        this.smartRoofFace.outerPlane = this.wallPlane;
    }

    removeObject() {
        this.outerEdgeMesh.geometry.dispose();
        this.highlightedLine.geometry.dispose();
        if (this.smartRoofFace) this.smartRoofFace.disposeFaceMesh();
        if (this.measurementText) this.measurementText.removeObject();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }


}

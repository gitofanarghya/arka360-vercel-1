import { VISUAL_STATES } from '../objects/visualConstants';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import {SmartroofModel} from '../objects/model/smartroof/SmartroofModel';
import Dormer from '../objects/model/smartroof/Dormer';
import * as THREE from 'three';
import { DragControls } from './RafterDragControls';
import { RAFTER_ORIENTATION_PERPENDICULAR, ORTHO_CAMERA_Z, RAFTER_ORIENTATION_PARALLEL } from '../coreConstants';
import createBufferGeometry from '../utils/meshUtils';
import * as utils from '../utils/utils';

export default class RafterEditMode {
    constructor(stage) {
        this.stage = stage;
          
        this.rafterAlignmentEdit = null;
        this.currentObject = null;
        this.enabled = false;
        this.controls = null;
        this.offset = 0;
        this.snappedMousePoint = new THREE.Vector3();

        this.finalPoint = new THREE.Vector3();
        this.initialPoint = new THREE.Vector3();
        this.objectsGroup = new THREE.Object3D();
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.altKeyPressed = false;
    }

    get normalizedSnapRadius() {
        return 1 / this.stage.getNormalisedZoom();
    }

    initialize(object, rafterAlignmentEdit) {
        if (!this.isRafterEditSupported(object)) {
            this.stage.eventManager
                .customErrorMessage('Object not supported for rafter Alignment edit');
            return false;
        }
        this.currentObject = object;
        this.rafterAlignmentEdit = rafterAlignmentEdit;
        this.rafterInitialPoint = this.currentObject.rafterOffset;

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();

        this.setButtonStatus();
        this.rafterEditMode(true);
        return true;
    }

    setButtonStatus() {
        this.stage.eventManager.setButtonStatusWhileSetbackEdit(
            this.onComplete.bind(this),
            this.exitRafterEditMode.bind(this),
            this,
        );
    }

    onComplete() {
        try {
            this.currentObject.updateRafter();
            this.currentObject.saveState();
            this.exitRafterEditMode(true);

            return Promise.resolve(true);
        }
        catch (error) {
            this.exitRafterEditMode(true);
            return Promise.reject(error);
        }
    }

    exitRafterEditMode(isComplete = false) {

        this.rafterEditMode(false);

        if (!isComplete){
            this.currentObject.rafterOffset =this.rafterInitialPoint;
            this.currentObject.updateRafter();
        }

        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this.currentObject);

        this.reset();
        this.stage.stateManager.stopContainer();
    }

    reset() {
        this.currentObject = null;
        this.rafterAlignmentEdit = null;
    }


    rafterEditMode(enabled) {
        if (enabled) {
            this.stage.ground.switchVisualState(VISUAL_STATES.MIRROR_MODE, true);
            this.currentObject.hideMeasurement();
            
            this.moveRafters();
        }
        else {
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
            this.currentObject.showMeasurement();
            // dragcontrols deactivate
            this.controls.dispose();
            this.stage.rendererManager.getDomElement().removeEventListener('mousemove', this.onMove, false)
        }
    }

    isRafterEditSupported(object) {
        if (object instanceof SmartroofFace || object instanceof Dormer) {
            return true;
        }
        this.stage.eventManager
            .customErrorMessage('Object not supported for rafter Alignment editing');
        return false;
    }

    // find the direction of the rafter line movement respective to the associated azimuth of the selected face

    getBoundingBox(reset = false) {
        // order of vertices
        // top-left
        // bottom-left
        // bottom-right
        // top-right
        if (this.boundingBox === undefined || reset) {
            this.currentObject.faceMesh.geometry.computeBoundingSphere();
            const Sphere = this.currentObject.faceMesh.geometry.boundingSphere;
            Sphere.center.z = this.currentObject
                .getZOnTopSurface(Sphere.center.x, Sphere.center.y);
            // 2D directions
            let bBoxDirectionUp = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                -this.currentObject.azimuth * (Math.PI / 180),
            ); //  tilt's zero is from the base and azimuth is clockwise (in scene)
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionUp = utils.posResetFor2D(bBoxDirectionUp);

            let bBoxDirectionLeft = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                (-this.currentObject.azimuth + 90) * (Math.PI / 180),
            );
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionLeft = utils.posResetFor2D(bBoxDirectionLeft);

            // finding 3D directions using the slope of parent
            const pointUp = Sphere.center.clone().addScaledVector(bBoxDirectionUp, 1);
            const pointLeft = Sphere.center.clone().addScaledVector(bBoxDirectionLeft, 1);

            // getting the z-coordinates of the points along the slope of the parent polygon
            pointUp.z = this.currentObject.getZOnTopSurface(pointUp.x, pointUp.y);
            pointLeft.z = this.currentObject.getZOnTopSurface(pointLeft.x, pointLeft.y);

            // now these direction are along the slope of the parent in 3D
            bBoxDirectionUp = pointUp.sub(Sphere.center);
            bBoxDirectionLeft = pointLeft.sub(Sphere.center);

            bBoxDirectionUp.normalize();
            bBoxDirectionLeft.normalize();

            // this is also normal of the parent surface
            const bBoxNormal = new THREE.Vector3();
            bBoxNormal.crossVectors(bBoxDirectionUp, bBoxDirectionLeft);
            bBoxNormal.normalize();

            const vertices = [];
            const diagonalVector = bBoxDirectionLeft.clone()
                .multiplyScalar(Sphere.radius * Math.SQRT2);
            const verticesOrderAngle = [-45, 45, 135, -135];

            verticesOrderAngle.forEach((angle) => {
                vertices.push(Sphere.center
                    .clone()
                    .add(diagonalVector
                        .clone()
                        .applyAxisAngle(bBoxNormal, utils.deg2Rad(angle))));
            });
            this.boundingBox = vertices;
        }
        return this.boundingBox;
    }

    movementDirection(f, i) {
        const finalPoint = f.clone().setZ(0);
        const initialPoint = i.clone().setZ(0);
        let bbx = [];
        bbx = this.getBoundingBox(true);
        this.xAxis = bbx[2].clone().sub(bbx[1]).normalize();
        this.yAxis = bbx[0].clone().sub(bbx[1]).normalize();
        this.zAxis = this.currentObject.plane.normal.clone();
        this.matrix = new THREE.Matrix4();
        let vertx = [];
        vertx.push(finalPoint);
        vertx.push(initialPoint);
        this.matrix.makeBasis(this.xAxis, this.yAxis, this.zAxis).setPosition(new THREE.Vector3(0, 0, 0));
        this.inverseMatrix = this.matrix.clone().invert();
        const local = vertx.map((v) => {
            return v.clone().applyMatrix4(this.inverseMatrix);
        });
        let direction1;
        let tempDirection1;
        if (this.currentObject.rafterOrientation === RAFTER_ORIENTATION_PERPENDICULAR) {
            direction1 = new THREE.Vector3(local[0].x - local[1].x, 0, 0);
            tempDirection1 = direction1.x;
        }
        else {
            direction1 = new THREE.Vector3(0, local[0].y - local[1].y, 0);
            tempDirection1 = direction1.y;
        }
        direction1.applyMatrix4(this.matrix);
        return {
            direction: direction1,
            tempDirection: tempDirection1,
        };

        // Usage:
        // To Global: vector.applyMatrix(this.matrix);
        // To Local: vector.applyMatrix(this.inverseMatrix);

    }


    dependentDistance(InitialPoint, FinalPoint) {
        const {direction} = this.movementDirection(InitialPoint, FinalPoint);
        return direction;
    }

    // find slope of the bottom edge of faces to move the rafter along the returned slope

    slope() {
        const edge = this.currentObject.getEdges();
        const length = edge.length;
        let point1;
        let point2;
        if (this.currentObject.getParent() instanceof Dormer && this.currentObject.getParent().type !== 'Flat Dormer' && length % 2 == 0) {
                point1 = edge[length - 2][0];
                point2 = edge[length - 2][1];
        }
        else {
            point1 = edge[length - 1][0];
            point2 = edge[length - 1][1];
        }
        const diffY = point2.y - point1.y;
        const diffX = point2.x - point1.x;
        if (diffY == 0) {
            return 0;
        }
        if (diffX == 0) {
            return Infinity;
        }
        return (diffY / diffX);
    }

    updateRafter() {
        this.currentObject.updateRafter();
    }

    // function to snap the selected rafter line to align with the nearby rafter intersection points

    snapRafter(Line) {
        this.objectsGroup.clear();
        const parent = this.currentObject.getParent();

        let pointA = new THREE.Vector3();
        let pointB = new THREE.Vector3();


        // check if the selected face is part or dormer and allow snapping with its children faces

        let requiredFaces = [];
        let grandParent = [];
        let tempFace = [];
        let grandChildrens = [];

        if (this.currentObject.getParent() instanceof SmartroofModel) {
            tempFace = parent.getChildren().filter(sibling => (sibling.id !== this.currentObject.id && sibling.rafterEnabled));
            for ( let i = 0; i < tempFace.length; i += 1) {
                requiredFaces.push(tempFace[i]);
            }
            let tempDormerCheck = this.currentObject.getChildren();
            for (let i = 0; i < tempDormerCheck.length; i += 1) {
                if (tempDormerCheck[i] instanceof Dormer) {
                    tempFace = tempDormerCheck[i].getChildren();
                    for ( let i = 0; i < tempFace.length; i += 1) {
                        requiredFaces.push(tempFace[i]);
                    }
                }
            }
        }
        else {
            if (this.currentObject.getParent() instanceof Dormer) {
                tempFace = parent.getChildren().filter(sibling => (sibling.id !== this.currentObject.id && sibling.rafterEnabled));
                for ( let i = 0; i < tempFace.length; i += 1) {
                    requiredFaces.push(tempFace[i]);
                }
                grandParent = (parent.getParent()).getParent();
                grandChildrens = grandParent.getChildren();
                for ( let i = 0; i < grandChildrens.length; i += 1) {
                    requiredFaces.push(grandChildrens[i]);
                }
            }
        }
        pointA = new THREE.Vector3(
            Line.geometry.attributes.position.array[0] + (this.dependentDistance(this.finalPoint, this.initialPoint).x),
            Line.geometry.attributes.position.array[1] + (this.dependentDistance(this.finalPoint, this.initialPoint).y),
            0,
        )
        pointB = new THREE.Vector3(
            Line.geometry.attributes.position.array[3] + (this.dependentDistance(this.finalPoint, this.initialPoint).x),
            Line.geometry.attributes.position.array[4] + (this.dependentDistance(this.finalPoint, this.initialPoint).y),
            0,
        )
        const lineSegment = new THREE.Line3(pointA, pointB);
        const arrayOfFaces = [];
        this.stage.ground.faces.forEach(element => {
            if(element.id !== this.currentObject.id) arrayOfFaces.push(element);
          });
        const rafterEndPoints = this.getRafterPoints(arrayOfFaces);
        const temp = [];
        for (let i = 0; i < rafterEndPoints.length; i++) {
            if (pointA.distanceToSquared(rafterEndPoints[i]) < (this.currentObject.rafterSpacing) ** 2) {
                temp.push(rafterEndPoints[i])
            }
            if (pointB.distanceToSquared(rafterEndPoints[i]) < (this.currentObject.rafterSpacing) ** 2) {
                temp.push(rafterEndPoints[i])
            }
        }
        const closePoint = new THREE.Vector3();
        let distance = 0;
        let snapDist = 0;
        for (let i = 0; i < temp.length; i++) {
            lineSegment.closestPointToPoint(temp[i], false, closePoint);
            distance = closePoint.distanceTo(temp[i]);
            snapDist = distance;
            let condition = false;
            if (this.stage.getNormalisedZoom() > 20) {
                condition = (distance <= this.normalizedSnapRadius);
            }
            else {
                condition = (distance <= 0.1 * this.normalizedSnapRadius);
            }
            if (condition) {
                let pointGeometryVertices = new THREE.Vector3(temp[i].x, temp[i].y, 20);
                const pointGeometry = createBufferGeometry([pointGeometryVertices]);
                const pointMaterial = new THREE.PointsMaterial({
                    color: 0x00ff00,
                    size: 5,
                });
                const pointOnGeo = new THREE.Points(
                    pointGeometry,
                    pointMaterial,
                );
                this.snappedMousePoint = closePoint;
                this.objectsGroup.add(pointOnGeo);
                Line.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                this.controls.enabled = false; // < --To disable drag after snapping >
            }
    // created points near to the rafter to which they are to snap.
            let nearSnapPoints = [new THREE.Vector3(temp[i].x, temp[i].y, 20)];
            const nearestSnapPointGeometry = createBufferGeometry(nearSnapPoints);
            const nearestSnapPointMaterial = new THREE.PointsMaterial({
                color: 0x00ff00,
                size: 5,
            });
            const nearestSnapMesh = new THREE.Points(
                nearestSnapPointGeometry,
                nearestSnapPointMaterial, 
            );
            this.objectsGroup.add(nearestSnapMesh);
        }
        return snapDist;
    }

    // get the intersection points of the rafter lines in neighbouring faces associated with the selected object/face
    
    getRafterPoints(siblings) {
        const rafterEndPoints = [];
        for( let i = 0; i < siblings.length; i++) {
            for (let j = 0; j < siblings[i].rafterLineMeshObject.children.length; j++) {
                rafterEndPoints.push(
                    new THREE.Vector3(
                        siblings[i].rafterLineMeshObject.children[j].geometry.attributes.position.array[0],
                        siblings[i].rafterLineMeshObject.children[j].geometry.attributes.position.array[1],
                        0,
                    ),
                    new THREE.Vector3(
                        siblings[i].rafterLineMeshObject.children[j].geometry.attributes.position.array[3],
                        siblings[i].rafterLineMeshObject.children[j].geometry.attributes.position.array[4],
                        0,
                    ),
                );
            }
        }
        return rafterEndPoints;
    }

    moveRafters() {
        this.stage.cameraManager.camera.position.z = ORTHO_CAMERA_Z;
        this.controls = new DragControls(
            this.currentObject.rafterLineMeshObject.children,
            this.stage.cameraManager.camera,
            this.stage.rendererManager.getDomElement(),
        );
    
        this.stage.rendererManager.getDomElement().addEventListener('mousemove', this.onMove, false)
        this.controls.addEventListener('dragstart', this.onDragStart, false);
        this.controls.addEventListener('drag', this.onDrag, false);
        this.controls.addEventListener('dragend', this.onDragEnd, false);
    }

    onMove = (event) => {
        if (event.altKey) {
            this.altKeyPressed = true;
        }
        else {
            this.altKeyPressed = false;
        }
        if (!this.controls.enabled && event.object) {
            const mouseDist = this.snappedMousePoint.distanceTo(event.object.position);
            if (mouseDist > (this.currentObject.rafterSpacing / this.stage.getNormalisedZoom())/2) {
                this.controls.enabled = true;
                this.objectsGroup.clear();
            }
        }
    }

    onDragStart = (event) => {
        this.stage.rendererManager.getDomElement().style.cursor = 'e-resize';
        const points = [
            new THREE.Vector3(
                event.object.geometry.attributes.position.array[0],
                event.object.geometry.attributes.position.array[1],
                event.object.geometry.attributes.position.array[2],
            ),
            new THREE.Vector3(
                event.object.geometry.attributes.position.array[3],
                event.object.geometry.attributes.position.array[4],
                event.object.geometry.attributes.position.array[5],
            ),
        ]
        const pointGeometry = createBufferGeometry(points);

        const pointMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 5,
        });

        const pointOnGeo = new THREE.Points(
            pointGeometry,
            pointMaterial,
        );
        event.object.attach(pointOnGeo);
        this.initialPoint = this.stage.mousePoint.clone();
    }

    snapOverridden() {
        return (this.altKeyPressed);
    }

    onDrag = (event) => {
        this.stage.rendererManager.getDomElement().style.cursor = 'e-resize';
        this.finalPoint = this.stage.mousePoint.clone();
    
        event.object.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const deltaVector = this.dependentDistance(this.finalPoint, this.initialPoint);
        const dist = deltaVector.length();
        const magnitude = deltaVector.length() % this.currentObject.rafterSpacing;
        deltaVector.normalize().multiplyScalar(magnitude);
        let addedSnapDist = 0;
        if (dist < 2 * this.currentObject.rafterSpacing) {
            event.object.position.x = this.dependentDistance(this.finalPoint, this.initialPoint).x;
            event.object.position.y = this.dependentDistance(this.finalPoint, this.initialPoint).y;
            // this.offset will be our deltavector which we be added to the rafter, rework the algo of the rafters.
            this.offset = magnitude;
            if (!this.snapOverridden()) {
                if (this.movementDirection(this.finalPoint, this.initialPoint).tempDirection > 0) {
                    addedSnapDist = this.snapRafter(event.object);
                    this.offset = addedSnapDist - magnitude;
                }
                else {
                    addedSnapDist = this.snapRafter(event.object);
                    this.offset = addedSnapDist + magnitude;
                }
            }
            else {
                if (this.movementDirection(this.finalPoint, this.initialPoint).tempDirection > 0) {
                    this.offset = -magnitude;
                }
                else {
                    this.offset = magnitude;
                }
            }
        }
        else {
            event.object.clear();
            event.object.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            this.offset = 0;
            this.currentObject.rafterOffset += 0;
            this.updateRafter();
        }
    }

    onDragEnd = (event) => {        
        this.stage.rendererManager.getDomElement().style.cursor = 'e-resize';
        this.currentObject.rafterOffset += this.offset;
        if (this.currentObject.rafterOffset > 2*this.currentObject.rafterSpacing) {
            this.currentObject.rafterOffset %= this.currentObject.rafterSpacing;
        }
        this.updateRafter();
        this.objectsGroup.clear();
        event.object.clear();
        event.object.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.controls.enabled = true;
    }
}

import * as THREE from 'three';
import { ROTATABLE_POINT_SIZE } from '../visualConstants';
import { checkPolygonIntersection, deg2Rad, directionOfPoint, rotationAroundPoint } from '../../utils/utils';
import HTMLText from './HTMLText';
import { isMetricUnit } from '../../../components/ui/length/utils';
import { FOOT_INCHES_VALIDATION_REGEX } from '../../../components/ui/length/constants';
import { crossProduct } from '../../structure/utils/mathUtils';
import Subarray from '../subArray/Subarray';
import Inverter from '../ac/Inverter';
import PolygonModel from '../model/PolygonModel';
import CylinderModel from '../model/CylinderModel';
import DCDB from '../ac/DCDB';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import { SmartroofModel } from '../model/smartroof/SmartroofModel';
import SmartroofFace from '../model/smartroof/SmartroofFace';
import Gazebo from '../../lib/PowerGazebo';
import { CAMERA_UPDATED } from '../../coreConstants';

function getImageUrl(path) {
    return new URL(path, import.meta.url).href
}

export default class RotationPoint {
    constructor(x, y, z, object, stage, colorMap = null) {
        // standard norms
        this.stage = stage;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.startPosition = null;
        this.rotationVector = null;
        // this connects it back to the tsl object class
        this.belongsTo = object;
        this.offsetX = 0;
        this.offsetY = 0;
        // raise used to increase the z of outline points, useful for selection
        this.raise = 1;
        this.designCanvas = document.getElementById('design-canvas');
        if (colorMap === null) {
            colorMap = object.getColorMap();
        }

        // material
        const pointsMaterial = new THREE.PointsMaterial({
            color: (colorMap.OUTLINE_POINT_COLOR === undefined) ? colorMap.EDGE_COLOR : colorMap.OUTLINE_POINT_COLOR,
            size: ROTATABLE_POINT_SIZE,
        });
        this.belongsTo.coreMesh.geometry.computeBoundingBox();
        // geometry
        this.position = new THREE.Vector3(
            this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            z + this.raise,
        );
        this.scaleValue = 4;
        this.startPosition = this.position;
        if(this.belongsTo instanceof Gazebo) {
            this.scaleValue = 1.5;
        }
        this.scale = Math.max(this.scaleValue, (this.belongsTo.coreMesh.geometry.boundingSphere.radius * 0.26));
        const svgImageURL = new URL('/src/assets/img/rotation-point.png', import.meta.url).href
        const spriteTexture = new THREE.TextureLoader().load(svgImageURL);

        this.vertexMesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTexture }));
        this.updateScale();
        this.vertexMesh.center.set(0, 0.65);
        this.vertexMesh.frustumCulled = false;
        // bounding box mesh / line
        this.lineGeometry = new THREE.BufferGeometry();
        this.lineMaterial = new THREE.MeshBasicMaterial();
        this.lineMesh = new THREE.Line(this.lineGeometry, this.lineMaterial);
        this.updateBoundingBox();
        // arc / ellipse 
        this.radius = 0;
        this.startAngle = 0;
        this.endAngle = 0;
        this.curve = new THREE.EllipseCurve(
            0, 0, // ax, aY
            this.radius, this.radius, // xRadius, yRadius
            this.startAngle, this.endAngle, // aStartAngle, aEndAngle
            true, // aClockwise
        );

        const ellipseGeometry = new THREE.BufferGeometry();
        const ellipseMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.ellipse = new THREE.Line(ellipseGeometry, ellipseMaterial);
        // this.rotation = undefined;
        // this.polygonRotation = undefined;
        // adding mesh to objectsGroup
        this.objectsGroup.add(this.vertexMesh);
        this.stage.sceneManager.scene.add(this.lineMesh);
        this.objectsGroup.add(this.ellipse);
        this.objectsGroup.name = 'Rotatable Polygon Point';

        this.centroidPoint = this.belongsTo.getPosition();
        this.updateArc();
        this.currentAngle = 0;
        this.textObject = new HTMLText(
            0, this.position, 0, this.stage, this.position, 0,
            this, RotationPoint.isValidInput,
        );
        this.centroidPoint = this.belongsTo.getPosition();
        this.belongsTo.coreMesh.geometry.computeBoundingBox();
        this.updateBoundingBox();
        this.vertexMesh.position.set(
            this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            this.position.z,
        );
        this.radius = this.centroidPoint.distanceTo(
            new THREE.Vector3(
                this.belongsTo.coreMesh.geometry.boundingBox.max.x,
                this.belongsTo.coreMesh.geometry.boundingBox.min.y,
                this.centroidPoint.z,
            ),
        );
        this.textObject.hide();
        this.hideObject();
        this.inputErrorMessage = "";
    }

    /**
     * uses mouse position to manipulate geometry
     * @param {*} deltaX - Replaced by mouseX
     * @param {*} deltaY - Replaced by mouseY
     */
    moveObject(deltaX, deltaY) {
        this.centroidPoint = this.belongsTo.getPosition();
        const MouseX = this.stage.mousePoint.x;
        const MouseY = this.stage.mousePoint.y;
        let mouseVector = new THREE.Vector3((MouseX - this.centroidPoint.x + this.offsetX), (MouseY - this.centroidPoint.y + this.offsetY), 0);
        mouseVector.multiplyScalar(this.radius / mouseVector.length());
        if (!this.rotationVector) this.rotationVector = mouseVector.clone();
        const newX = mouseVector.x + this.centroidPoint.x;
        const newY = mouseVector.y + this.centroidPoint.y;
        let angle = this.getAngle(this.rotationVector, mouseVector);

        // calculating current angle and remove startangle offset
        this.currentAngle = Math.atan2(newY - this.centroidPoint.y, newX - this.centroidPoint.x);
        if (this.currentAngle < 0) this.currentAngle += Math.PI * 2;
        this.currentAngle -= this.curve.aStartAngle - (Math.PI * 2);
        if (this.currentAngle > Math.PI) this.currentAngle -= Math.PI * 2;
        if (Math.abs(angle)) {
            this.belongsTo.rotateObjectHelper(angle, this.centroidPoint);
            this.stage.mergeManager.rotateObjectHelper(angle, this.centroidPoint);
            this.rotateObjectHelper(angle, this.centroidPoint);
            this.textObject.update((Math.abs((((this.currentAngle * 180) / Math.PI) % 360).toFixed(2))), undefined, 0);
            this.textObject._setPosition(
                new THREE.Vector3(
                    this.curve.getPoint(0.5).x,
                    this.curve.getPoint(0.5).y, 0,
                ),
                new THREE.Vector3(), this.radius,
            );
            Math.abs(this.currentAngle) > 0.001 ? this.textObject.show() : this.textObject.hide();
            this.vertexMesh.material.rotation += angle;
            this.vertexMesh.position.set(newX, newY, this.position.z);
            this.position.setX(newX);
            this.position.setY(newY);
            this.rotationVector = mouseVector.clone();
        }
    }

    /**
     * returns the angle between 2 vectors
     * @param {THREE.Vector3} Vector1 - First Vector
     * @param {THREE.Vector3} Vector2 - Second Vector
     * @param {Boolean} Signed - direction
     */
    getAngle(Vector1, Vector2, Signed = true) {
        const direction = Signed ? new THREE.Vector3(0, 0, 1).dot(crossProduct(Vector1, Vector2)) : 1;
        return Math.acos(Vector1.normalize().dot(Vector2.normalize())) * Math.sign(direction);
    }

    cameraUpdate = () => {
        this.stage.addCameraUpdates(this.updateScale);
    }

    async updateRotationPoint() {
        this.centroidPoint = this.belongsTo.getPosition();
        await this.belongsTo.coreMesh.geometry.computeBoundingBox();
        this.updateBoundingBox();
        this.updateArc();
        this.textObject.hide();
        this.vertexMesh.material.rotation = 0;

        await this.vertexMesh.position.set(
            this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            this.position.z,
        );
        this.rotationVector = null;
        this.currentAngle = 0;
        this.startPosition = new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.max.x, this.belongsTo.coreMesh.geometry.boundingBox.min.y, this.position.z);
        await this.belongsTo.coreMesh.geometry.computeBoundingSphere();
        this.updateScale();
        this.vertexMesh.material.color.set(0xffffff);
        this.designCanvas.style.cursor = 'auto';
    }

    async placeObject() {
        this.centroidPoint = this.belongsTo.getPosition();
        await this.belongsTo.coreMesh.geometry.computeBoundingBox();
        this.updateBoundingBox();
        this.updateArc();
        this.textObject.hide();
        this.vertexMesh.material.rotation = 0;
        await this.vertexMesh.position.set(
            this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            this.position.z,
        );
        this.rotationVector = null;
        this.currentAngle = 0;
        this.startPosition = new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.max.x, this.belongsTo.coreMesh.geometry.boundingBox.min.y, this.position.z);
        await this.handleRotationDragEnd();
        this.belongsTo.getChildren().forEach((child) => {
            if (child instanceof SmartroofFace) {
                for (let i = 0; i < child.getChildren().length; i++ ){
                    const grandChild = child.getChildren()[i];
                    if (grandChild.rotationPoints) {
                        grandChild.rotationPoints.placeObject();
                    }
                }
            } else {
                if (child.rotationPoints) {
                    child.rotationPoints.placeObject();
                }
            }
        });
        await this.belongsTo.coreMesh.geometry.computeBoundingSphere();
        this.updateScale();
        this.vertexMesh.material.color.set(0xffffff);
        this.designCanvas.style.cursor = 'auto';
    }

    moveObjectWithoutConsequences(deltaX, deltaY, deltaZ = 0) {
        // this is to be used when all the vertices are being moved
        // and the geometry is not being resize
        this.vertexMesh.translateX(deltaX);
        this.vertexMesh.translateY(deltaY);
        if (!(this.belongsTo instanceof Gazebo)) {
            if (this.lineMesh.geometry) {
                this.lineMesh.geometry.computeBoundingSphere();
            }
            if (!Number.isNaN(this.lineMesh.geometry.boundingSphere.radius)) this.lineMesh.geometry.translate(deltaX, deltaY, deltaZ);
        }
        this.ellipse.geometry.translate(deltaX, deltaY, deltaZ);
        this.curve.aX += deltaX;
        this.curve.aY += deltaY;
        this.textObject._setPosition(
            new THREE.Vector3(this.textObject.getPosition().x + deltaX, this.textObject.getPosition().y + deltaY, 0),
            new THREE.Vector3(), this.radius,
        );
    }

    handleDragStart() {
        this.belongsTo.coreMesh.geometry.computeBoundingBox();
        this.centroidPoint = this.belongsTo.getPosition();
        this.radius = this.centroidPoint.distanceTo(
            new THREE.Vector3(
                this.belongsTo.coreMesh.geometry.boundingBox.max.x,
                this.belongsTo.coreMesh.geometry.boundingBox.min.y,
                this.centroidPoint.z,
            ),
        );
        if (this.belongsTo instanceof Gazebo) {
            this.belongsTo.saveInitPanelRotation();
            return null;
        }
        this.startPosition = this.position;
        this.offsetX = this.belongsTo.coreMesh.geometry.boundingBox.max.x - this.stage.mousePoint.x
        this.offsetY = this.belongsTo.coreMesh.geometry.boundingBox.min.y - this.stage.mousePoint.y
        this.textObject.update(0);
        this.currentAngle = 0;
        this.updateArc();
        this.handleRotationDragStart();
        this.designCanvas.style.cursor = 'all-scroll';
        this.vertexMesh.material.color.set(0xedafaf);
    }

    handleDragCancel() {
        this.placeObject();
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.lineMesh.geometry.attributes.position.array.length; i < l; i += 3) {
            // update edgeCentrePoints
            const oldX = this.lineMesh.geometry.attributes.position.array[i]
            const oldY = this.lineMesh.geometry.attributes.position.array[i + 1]
            const newXY = rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                oldX,
                oldY,
                angleInRad,
            );
            this.lineMesh.geometry.attributes.position.array[i] += newXY[0] - oldX;
            this.lineMesh.geometry.attributes.position.array[i + 1] += newXY[1] - oldY;
            this.lineMesh.geometry.attributes.position.needsUpdate = true;
        }
        this.curve.aClockwise = Math.sign(this.currentAngle) < 0 ? true : false;
        this.ellipse.visible = Math.abs(this.currentAngle) < 0.05 ? false : true;
        this.curve.aEndAngle += angleInRad;
        this.curve.aX = this.centroidPoint.x;
        this.curve.aY = this.centroidPoint.y;
        const points1 = this.curve.getPoints(50);
        this.ellipse.geometry.setFromPoints(points1);
    }

    getPosition() {
        if (this.objectsGroup.children[0].geometry != null) {
            const raisedPoint = this.objectsGroup.children[0].position;
            // noinspection JSValidateTypes
            return new THREE.Vector3(
                raisedPoint.x,
                raisedPoint.y,
                raisedPoint.z - this.raise,
            );
        }
        return null;
    }
    updateScale = () => {
        this.scale = 1/this.stage.getNormalisedZoom() * 8;
        this.vertexMesh.scale.set(this.scale, this.scale, 1);
    }

    setPosition(x, y, z) {
        const { geometry } = this.vertexMesh;
        geometry.translate(x - this.position.x, y - this.position.y, 0);
        geometry.attributes.position.needsUpdate = true;
        this.position = new THREE.Vector3(x, y, z + this.raise);
    }

    updateBoundingBox() {
        this.belongsTo.coreMesh.geometry.computeBoundingBox();
        // creating bounding box
        const points = [];
        points.push(new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.max.y,
            this.position.z));
        points.push(new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            this.position.z));
        points.push(new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.min.x,
            this.belongsTo.coreMesh.geometry.boundingBox.min.y,
            this.position.z));
        points.push(new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.min.x,
            this.belongsTo.coreMesh.geometry.boundingBox.max.y,
            this.position.z));
        points.push(new THREE.Vector3(this.belongsTo.coreMesh.geometry.boundingBox.max.x,
            this.belongsTo.coreMesh.geometry.boundingBox.max.y,
            this.position.z));

        this.lineMesh.geometry.setFromPoints(points);
    }

    updateArc() {
        this.centroidPoint = this.belongsTo.getPosition();
        this.belongsTo.coreMesh.geometry.computeBoundingBox();
        this.radius = this.centroidPoint.distanceTo(
            new THREE.Vector3(
                this.belongsTo.coreMesh.geometry.boundingBox.max.x,
                this.belongsTo.coreMesh.geometry.boundingBox.min.y,
                this.centroidPoint.z,
            ),
        );
        // Get angle of starting point
        let pointAngle = this.getAngleofPointOnCircle(this.centroidPoint.x, this.centroidPoint.y, this.belongsTo.coreMesh.geometry.boundingBox.max.x, this.belongsTo.coreMesh.geometry.boundingBox.min.y)
        this.curve = new THREE.EllipseCurve(
            this.centroidPoint.x, this.centroidPoint.y, // ax, aY
            this.radius, this.radius, // xRadius, yRadius
            pointAngle, pointAngle, // aStartAngle, aEndAngle
            true, // aClockwise
        );
        const points1 = this.curve.getPoints(50);
        this.ellipse.geometry.setFromPoints(points1);
    }

    /**
     * get angle of point on circle
     * @param {*} cX - centerpoint x of the circle
     * @param {*} cY - centerpoint y of the circle
     * @param {*} x - x attribute of the point
     * @param {*} y - y attribute of the point
     * @returns radian angle of the point on circle
     */
    getAngleofPointOnCircle(cX, cY, x, y) {
        return Math.PI * 2 + Math.atan2(y - cY, x - cX);
    }

    enableTextSelection() {
        this.textObject.enableSelection();
    }
    disableTextSelection() {
        this.textObject.disableSelection();
    }
    setTextEditable({ shouldCreateContainer, shouldCompleteOnNoChange } = { shouldCreateContainer: true, shouldCompleteOnNoChange: false }) {
        this.stage.textSelectionControls.setSelectedTextObject(
            this.textObject, { shouldCreateContainer, shouldCompleteOnNoChange },
        );
    }
    onPolygonRotationStart(object) {

        if (object instanceof SmartroofModel) {
            object.clearObstacles();
        }
        const children = object.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i] instanceof Subarray) {
                children[i].hideObjectLayer();
            }
            if (children[i] instanceof PolygonModel ||
                children[i] instanceof CylinderModel ||
                children[i] instanceof SmartroofModel||
                children[i] instanceof SmartroofFace) {
                this.onPolygonRotationStart(children[i]);
            }
            if (children[i] instanceof Inverter || children[i] instanceof DCDB) {
                children[i].hideObjectLayer();
            }
        }
        this.stage.selectionControls.setSelectedObject(this.belongsTo);
    }

    async onPolygonRotationEnd(object) {
        const children = [...object.getChildren()];
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i] instanceof Gazebo) {
                await children[i].onGazeboRotationEnd();
            }
            else if (children[i] instanceof Subarray) {
                if (children[i].getChildren().length > 0) await children[i].onSubarrayRotationEnd();
            }
            else if (children[i] instanceof PolygonModel ||
                children[i] instanceof CylinderModel ||
                children[i] instanceof SmartroofModel||
                children[i] instanceof SmartroofFace ) {
                await this.onPolygonRotationEnd(children[i]);
            }
        }
    }
    // async updateIntersectingCablesConduit(cableConduit) {
    //     const polygonVertices = this.belongsTo.get2DVertices();
    //         for (let i = 0; i < cableConduit.length; i += 1) {
    //             if (checkPolygonIntersection(polygonVertices, cableConduit[i].get2DVertices())) {
    //                 cableConduit[i].placeObject();
    //             }
    //         }
    // }
    handleRotationDragStart() {
        this.onPolygonRotationStart(this.belongsTo);
    }

    async handleRotationDragEnd() {
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        // this.belongsTo.updateIntersectingCablesConduit(this.belongsTo.previousIntersectingCableConduit);
        this.belongsTo.previousIntersectingCableConduit = [];
        try {
            if (this.belongsTo instanceof Gazebo) {
                this.belongsTo.updateAfterRotation();
                // this.belongsTo.saveState();
            }
            // place object
            else if (this.belongsTo instanceof SmartroofModel) {
                await this.belongsTo.updateFacesWithNewAngles(true);
            }
            else {
                await this.belongsTo.placeObject();
            }
            await this.onPolygonRotationEnd(this.belongsTo);

            // place its children if top surface changed, i.e., the model is tilted
            // this.belongsTo.handleChildrenConsequences({
            //     resized: true,
            //     tiltChanged: this.belongsTo.getTilt() !== 0,
            // });


            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.belongsTo.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.belongsTo.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this.belongsTo);
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this.belongsTo);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);


            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }



    handleTextSelection() {
        // this.rotateObjectHelper(-(this.angle * Math.PI) / 180, this.centroidPoint);
    }

    handleTextDeSelection() {
        this.vertexMesh.material.color.set(0xffffff);
        this.designCanvas.style.cursor = 'auto';
    }

    /**
     * rotates the object to the given angle in degrees
     * @param {*} angle - angle in degrees
     */
    async handleValueUpdate(angle) {
        //remove the existing rotation and rotate to the angle specified by the user
        let angleInRad = deg2Rad(angle);
        let newAngle = angleInRad - Math.abs(this.currentAngle);
        if (this.curve.aClockwise) newAngle = -newAngle;
        this.belongsTo.rotateObjectHelper(newAngle, this.centroidPoint);
        this.stage.mergeManager.rotateObjectHelper(newAngle, this.centroidPoint);
        this.rotateObjectHelper(newAngle, this.centroidPoint);
        this.stage.dragControls.handleValueCancel();
        this.centroidPoint = this.belongsTo.getPosition();
        await this.placeObject();
    }

    hideObject() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
        this.objectsGroup.visible = false;
        this.lineMesh.visible = false;
        this.designCanvas.style.cursor = 'auto';
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);
    }

    showObject() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
        this.objectsGroup.visible = true;
        this.lineMesh.visible = false;
        this.updateScale();
        this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdate);
    }

    //on esc pressed on tab mode
    handleOnCancel() {
        this.placeObject();
        this.stage.dragControls.handleValueCancel();
        this.rotationVector = null;
        this.designCanvas.style.cursor = 'auto';
    }
    removeObject() {
        try {
            this.textObject.remove();
            this.objectsGroup.children[0].geometry.dispose();
            this.objectsGroup.children[0].material.dispose();
            this.lineMesh.geometry.dispose();
            this.lineMesh.material.dispose();
            this.objectsGroup.remove(this.objectsGroup.children[0]);
        } catch (error) {
            this.objectsGroup.remove(this.objectsGroup.children[0]);
        } finally {
            this.stage.sceneManager.scene.remove(this.objectsGroup);
            this.stage.sceneManager.scene.remove(this.lineMesh);
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
        return 'Polygon Rotation Point';
    }

    /**
     * enables the hover fx
     */
     highlightOnHover() {
        this.vertexMesh.material.color.set(0xedafaf);
        this.designCanvas.style.cursor = 'all-scroll';
    }

    /**
     * Disables the hover fx
     */
     unHighlight() {
        this.vertexMesh.material.color.set(0xffffff);
        this.designCanvas.style.cursor = 'auto';
    }

    static isValidInput(input) {
        /* we dont need this as the rotation will always be in metric unit
           no need to convert it into ft in */
        // if (!isMetricUnit()) {
        //     return input.search(FOOT_INCHES_VALIDATION_REGEX) !== -1;
        // }

        if (Number.isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
            this.parent.inputErrorMessage = 'Rotation should be a positive real number with upto 3 decimal places. Cannot set this value.';
            return false;
        }
        if (input > 360) {
            this.parent.inputErrorMessage = 'Rotation should be between 0 to 359.9. Cannot set this value.';
            return false;
        }

        if (input % 1 === 0) {
            return true;
        }

        const inputArr = input.split('.');
        return inputArr[1].length <= 3;
    }

    inputError() {
        notificationsAssistant.error({
            title: 'Edit Rotation',
            message: this.inputErrorMessage,
        })
    }

    /**
     * update cursor and vertex mesh color on hover
     * @param {*} event 
     */
    onMouseMove = (event) => {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 0.5 / this.stage.getNormalisedZoom();
        let rect = this.stage.rendererManager.getDomElement().getBoundingClientRect();
        this.mouse = new THREE.Vector3();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.params.Points.threshold = 1 / this.stage.getNormalisedZoom();
        this.raycaster.setFromCamera(this.mouse, this.stage.cameraManager.camera);

        let intersects = this.raycaster.intersectObjects([this.vertexMesh], true);

        if (intersects.length > 0) {
            this.vertexMesh.material.color.set(0xedafaf);
            this.designCanvas.style.cursor = 'all-scroll';
        } else {
            this.vertexMesh.material.color.set(0xffffff);
            this.designCanvas.style.cursor = 'auto';
        }
    }
}
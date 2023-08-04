import * as THREE from 'three';
import * as utils from '../../utils/utils';
import HTMLText from './HTMLText';
import { CAMERA_UPDATED } from '../../coreConstants';
import OutlinePoints from './OutlinePoints';
import createBufferGeometry from '../../utils/meshUtils';

export default class ArcMeasurement {
    constructor(vertexObj1, vertexObj2, vertexObj3, stage, parent) {
        // standard norms
        this.stage = stage;
        this.parent = parent;

        this.objectsGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectsGroup.position.z += 0.1;
        this.objectsGroup.container = this;

        this.vertexObj1 = vertexObj1;
        this.vertexObj2 = vertexObj2;
        this.vertexObj3 = vertexObj3;

        // initialise material and edges
        this.onSelectColor = new THREE.Color(0, 0, 1);
        this.deSelectColor = new THREE.Color(1, 0, 0);
        const arcMaterial = new THREE.LineBasicMaterial({
            color: this.deSelectColor,
            linewidth: 1,
        });
        this.arcEdges = new THREE.Line(createBufferGeometry(), arcMaterial);
        this.objectsGroup.add(this.arcEdges);

        // initialise text
        const tempVector = new THREE.Vector3(0, 0, 0);
        this.textObject = new HTMLText(
            0, tempVector, 0, this.stage, tempVector, 0,
            this, ArcMeasurement.isValidInput,
        );

        this.hide();

        // update arc and text
        this.update();

        // TODO: Think of some other method
        this.inputError = this.stage.eventManager.wrongAngleInputError;
    }

    static isValidInput(input) {
        if (Number.isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
            return false;
        }
        if (input % 1 === 0) {
            return true;
        }
        const inputArr = input.split('.');
        return inputArr[1].length <= 1;
    }

    show(editable=true) {
        if (this.stage.viewManager.arcVisible) {
            this.textObject.show(editable);
            this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdate);
            this.objectsGroup.visible = true;
        }
    }

    hide() {
        this.textObject.hide();
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);
        this.objectsGroup.visible = false;
    }

    cameraUpdate = () => {
        this.stage.addCameraUpdates(this.update);
    }

    // TODO: Refactor this
    update = () => {
        const vertex1 = (!(this.vertexObj1 instanceof OutlinePoints) ) ? this.vertexObj1.clone() :this.vertexObj1.getPosition();
        const vertex2 = (!(this.vertexObj2 instanceof OutlinePoints) ) ? this.vertexObj2.clone() :this.vertexObj2.getPosition();
        const vertex3 = (!(this.vertexObj3 instanceof OutlinePoints) ) ? this.vertexObj3.clone() :this.vertexObj3.getPosition();

        // will be used in update magnitude function
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
        this.vertex3 = vertex3;

        const radius = (4 / this.stage.getNormalisedZoom());
        const [startAngle, endAngle] = utils.getAngles(vertex1, vertex2, vertex3);

        // add arc points
        const curve = new THREE.EllipseCurve(
            0, 0, // ax, aY
            radius, radius, // xRadius, yRadius
            startAngle, endAngle, // aStartAngle, aEndAngle
            true, // aClockwise
        );
        const points = curve.getPoints(10);
        this.arcEdges.geometry.setFromPoints(points);
        this.arcEdges.geometry.translate(vertex2.x, vertex2.y, vertex2.z);

        // set magnitude in degrees
        let diff = endAngle - startAngle;
        if (startAngle > endAngle) {
            diff = (Math.PI * 2) - Math.abs(diff);
        }

        // calculate placement point
        const direction1 = new THREE.Vector3(vertex1.x - vertex2.x, vertex1.y - vertex2.y, 0);
        const direction2 = new THREE.Vector3(vertex3.x - vertex2.x, vertex3.y - vertex2.y, 0);
        direction1.normalize();
        direction2.normalize();
        let placementUnitVector = new THREE.Vector3(
            direction1.x + direction2.x,
            direction1.y + direction2.y,
            0,
        );
        placementUnitVector.normalize();

        if (diff < Math.PI) {
            placementUnitVector.multiplyScalar(-1);
        }

        let placementPoint = vertex2.clone().addScaledVector(placementUnitVector, radius);

        const textInclination = 0;
        const magnitude = (360 - Math.abs(utils.toDegrees(diff))).toFixed(1);
        if (magnitude === '180.0') {
            placementUnitVector = new THREE.Vector3(
                direction1.x + direction2.x,
                direction1.y + direction2.y,
                0,
            );

            // if the angles are very close to PI x and y tends to zero
            placementUnitVector.x = (placementUnitVector.x < 0.001) ? 0 : placementUnitVector.x;
            placementUnitVector.y = (placementUnitVector.y < 0.001) ? 0 : placementUnitVector.y;
            placementUnitVector.normalize();

            direction2.applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2).normalize();
            placementPoint = vertex2.clone().addScaledVector(direction2, radius);
            placementUnitVector = direction2;
        }
        this.textObject.update(
            magnitude,
            placementPoint,
            textInclination,
            placementUnitVector,
            10,
            this.stage.textSelectionControls.getSelectedTextObject() !==
                this.textObject,
        );
    };

    // remove and dispose threejs objects
    remove() {
        this.hide();
        this.textObject.remove();
        this.arcEdges.geometry.dispose();
        this.arcEdges.material.dispose();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    enable() {
        // TODO: Enable arc
        this.textObject.enable();
    }

    disable() {
        // TODO: Disable arc
        this.textObject.disable();
    }

    // update magnitude by moving the vertex to the desired location.
    async handleValueUpdate(newMagnitude) {
        // TODO: Refactor
        const newMagnitudeInRads = utils.toRadian(newMagnitude);
        const lengthMagnitude = utils.getEuclideanDistance(this.vertex2, this.vertex3);
        const vector = new THREE.Vector3(1, 0, 0);
        let slope = Math.atan2(this.vertex1.y - this.vertex2.y, this.vertex1.x - this.vertex2.x);
        if (slope < 0) {
            slope += Math.PI * 2;
        }

        const rotatedVector = utils.rotateVector(
            [vector.x, vector.y],
            (newMagnitudeInRads + slope),
        );
        const vector2 = new THREE.Vector3(rotatedVector[0], rotatedVector[1], 0);
        const newPoint = [(lengthMagnitude * vector2.x) + this.vertex2.x,
            (lengthMagnitude * vector2.y) + this.vertex2.y];

        await this.vertexObj3.placeObject(
            newPoint[0] - this.vertex3.x,
            newPoint[1] - this.vertex3.y,
            0,
        );
    }

    setTextEditable({ shouldCreateContainer, shouldCompleteOnNoChange } = { shouldCreateContainer: true, shouldCompleteOnNoChange: false }) {
        this.stage.textSelectionControls.setSelectedTextObject(
            this.textObject,
            { shouldCreateContainer, shouldCompleteOnNoChange },
        );
    }

    handleOnCancel() {
        this.parent.handleOnCancel();
    }

    enableTextSelection() {
        this.textObject.enableSelection();
    }

    disableTextSelection() {
        this.textObject.disableSelection();
    }

    handleTextSelection() {
        this.arcEdges.material.color = this.onSelectColor;
    }

    handleTextDeSelection() {
        this.arcEdges.material.color = this.deSelectColor;
    }
}

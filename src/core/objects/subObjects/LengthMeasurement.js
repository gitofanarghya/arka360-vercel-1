import * as THREE from 'three';
import HTMLText from './HTMLText';
import { CAMERA_UPDATED } from '../../coreConstants';
import {
    convertMetricToImperial,
    stringifyMetricMeasurement,
    stringifyImperialMeasurement,
    convertImperialToMetric,
    parseImperialMeasurement,
    isMetricUnit,
} from '../../../components/ui/length/utils';
import { FOOT_INCHES_VALIDATION_REGEX } from '../../../components/ui/length/constants';
import OutlinePoints from './OutlinePoints';

export default class LengthMeasurement {
    constructor(vertexObj1, vertexObj2, stage, parent, scalingFactor = 2) {
        // standard norms
        this.stage = stage;
        this.parent = parent;

        this.objectsGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.position.z += 0.1;
        this.objectsGroup.container = this;

        this.vertexObj1 = vertexObj1;
        this.vertexObj2 = vertexObj2;

        // properties
        this.scalingFactor = scalingFactor;
        this.onSelectColor = new THREE.Color(0, 0, 1);
        this.deSelectColor = new THREE.Color(1, 0, 0);
        this.movableVertex = this.vertexObj2;

        //this is only for rectangle obstruction
        this.obstructionVertex1 = null;
        this.obstructionVertex2 = null;
        // TODO: Think of some other method
        this.inputError = this.stage.eventManager.wrongLengthInputError;

        // initialising arrows
        const directionVector = new THREE.Vector3(1,1,1);
        const tempVector = new THREE.Vector3(0, 0, 0);
        this.arrowHelper1 = new THREE.ArrowHelper(
            directionVector, tempVector,
            1, this.deSelectColor,
        );
        this.arrowHelper2 = new THREE.ArrowHelper(
            directionVector, tempVector,
            1, this.deSelectColor,
        );
        this.arrowHelper1.container = this;
        this.arrowHelper2.container = this;

        // constant for arrow helper throwing error if vertices are at same position
        this.ARROW_HELPER_ERROR_CONSTANT = 0.001;

        // initialising text
        this.textObject = new HTMLText(
            0, tempVector, 0, this.stage, tempVector, 0,
            this, LengthMeasurement.isValidInput,
        );

        // add to objectsGroup
        this.objectsGroup.add(this.arrowHelper1);
        this.objectsGroup.add(this.arrowHelper2);

        this.hide();

        this.update();
    }

    // input validator to be passed to text class
    // TODO: Use some library
    static isValidInput(input) {
        if (!isMetricUnit()) {
            return input.search(FOOT_INCHES_VALIDATION_REGEX) !== -1;
        }

        if (Number.isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
            return false;
        }

        if (input % 1 === 0) {
            return true;
        }

        const inputArr = input.split('.');
        return inputArr[1].length <= 3;
    }

    // add to objects group
    show(editable=true) {
        if (this.stage.viewManager.lengthVisible) {
            this.textObject.show(editable);
            this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdate);
            this.objectsGroup.visible = true;
        }
    }

    // remove only from objects group, different from remove() which deletes the threejs objects
    hide() {
        this.textObject.hide();
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);
        this.objectsGroup.visible = false;
    }

    cameraUpdate = () => {
        this.stage.addCameraUpdates(this.update.bind(null, this.obstructionVertex1, this.obstructionVertex2));
    }

    // update
    update = (vertex1Pos, vertex2Pos) => {
        // calculate required parameter
        // get vertices vectors
        let vertex1 = (!(this.vertexObj1 instanceof OutlinePoints) )? this.vertexObj1.clone() : this.vertexObj1.getPosition();
        let vertex2 = (!(this.vertexObj2 instanceof OutlinePoints) )? this.vertexObj2.clone() : this.vertexObj2.getPosition();
        //if position is passed in parameter
        if((vertex1Pos !== undefined && vertex1Pos !== null) && (vertex2Pos !== undefined && vertex2Pos !== null)){
            vertex1 = vertex1Pos;
            this.obstructionVertex1 = vertex1Pos;
            vertex2 = vertex2Pos;
            this.obstructionVertex2 = vertex2Pos;
        }

        // magnitude
        const magnitude = vertex1.distanceTo(vertex2);

        // text angle
        const textAngle = 0;

        // adjustments for changing camera position
        const scalingFactor = this.scalingFactor / this.stage.getNormalisedZoom();
        let headLength = 2 / this.stage.getNormalisedZoom();
        const headWidth = 1 / this.stage.getNormalisedZoom();

        // arrow direction
        const arrow1Direction = vertex1.clone().sub(vertex2).normalize();
        const arrow2Direction = arrow1Direction.clone().multiplyScalar(-1);

        // mid point of the line
        const midPoint = vertex1.clone().add(vertex2).divideScalar(2);

        // box direction from reference point
        const boxDirection = vertex2.clone().sub(midPoint).applyAxisAngle(
            new THREE.Vector3(0, 2, 1),
            Math.PI / 2,
        ).normalize();

        // reference point
        const origin = boxDirection.clone().multiplyScalar(scalingFactor).add(midPoint);

        // update arrows
        if (magnitude > this.ARROW_HELPER_ERROR_CONSTANT) {
            if (magnitude < (this.ARROW_HELPER_ERROR_CONSTANT + (2 * headLength))) {
                headLength = (magnitude - this.ARROW_HELPER_ERROR_CONSTANT) / 2;
            }

            this.arrowHelper1.setDirection(arrow1Direction);
            this.arrowHelper1.setLength(magnitude / 2, headLength, headWidth);
            this.arrowHelper1.position.copy(origin);
            this.arrowHelper2.setDirection(arrow2Direction);
            this.arrowHelper2.setLength(magnitude / 2, headLength, headWidth);
            this.arrowHelper2.position.copy(origin);

            // update text
            this.textObject.update(
                (isMetricUnit()) ?
                    stringifyMetricMeasurement(magnitude) :
                    stringifyImperialMeasurement(...convertMetricToImperial(magnitude)),
                origin,
                textAngle,
                boxDirection,
                10,
                this.stage.textSelectionControls.getSelectedTextObject() !== this.textObject,
            );
        }
        else {
            // update text
            this.textObject.update(
                (isMetricUnit()) ?
                    stringifyMetricMeasurement(magnitude) :
                    stringifyImperialMeasurement(...convertMetricToImperial(magnitude)),
                undefined,
                undefined,
                undefined,
                undefined,
                this.stage.textSelectionControls.getSelectedTextObject() !== this.textObject,
            );
        }

    };

    // remove and dispose threejs objects
    remove() {
        this.hide();
        this.textObject.remove();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    enable() {
        // TODO: Enable arrow
        this.textObject.enable();
    }

    disable() {
        // TODO: Disable arrow
        this.textObject.disable();
    }

    setMovableVertex(vertexObj) {
        if (vertexObj !== this.vertexObj1 && vertexObj !== this.vertexObj2) {
            console.error('ERROR: Length Measurement: vertexObj doesn\'t belong to this object');
        }
        this.movableVertex = vertexObj;
    }

    // update magnitude by moving the vertex to the desired location.
    async handleValueUpdate(userEnteredValue) {
        const newMagnitude = (isMetricUnit()) ? userEnteredValue :
            convertImperialToMetric(parseImperialMeasurement(userEnteredValue));

        // get vertices in order according to movable vertex
        let vertex1 = this.vertexObj1.getPosition();
        let vertex2 = this.vertexObj2.getPosition();
        if (this.movableVertex === this.vertexObj1) {
            vertex1 = this.vertexObj2.getPosition();
            vertex2 = this.vertexObj1.getPosition();
        }

        // get delta vector to move
        const magnitude = vertex1.distanceTo(vertex2);
        const delta = vertex2.clone().sub(vertex1).setLength(newMagnitude - magnitude);

        await this.movableVertex.placeObject(delta.x, delta.y, delta.z);
    }

    moveVertex(userEnteredValue){
        const newMagnitude = (isMetricUnit()) ? userEnteredValue :
            convertImperialToMetric(parseImperialMeasurement(userEnteredValue));

        // get vertices in order according to movable vertex
        let vertex1 = this.vertexObj1.getPosition();
        let vertex2 = this.vertexObj2.getPosition();
        if (this.movableVertex === this.vertexObj1) {
            vertex1 = this.vertexObj2.getPosition();
            vertex2 = this.vertexObj1.getPosition();
        }

        // get delta vector to move
        const magnitude = vertex1.distanceTo(vertex2);
        const delta = vertex2.clone().sub(vertex1).setLength(newMagnitude - magnitude);

        this.movableVertex.moveObject(delta.x, delta.y, delta.z);
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
        this.arrowHelper1.setColor(this.onSelectColor);
        this.arrowHelper2.setColor(this.onSelectColor);
    }

    handleTextDeSelection() {
        this.arrowHelper1.setColor(this.deSelectColor);
        this.arrowHelper2.setColor(this.deSelectColor);
    }
}

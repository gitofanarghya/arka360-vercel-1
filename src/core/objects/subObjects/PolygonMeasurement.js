import * as utils from "../../utils/utils"
import LengthMeasurement from "./LengthMeasurement"
import ArcMeasurement from "./ArcMeasurement"
import * as THREE from 'three';
export default class PolygonMeasurement {

    constructor(vertices, parent, stage, editable=true) {

        //console.time('PolygonMeasurement');
        // standard norms
        this.stage = stage;

        this.parent = parent;
        this.vertices = vertices;

        // make vertices clockwise
        if (!utils.checkClockwise(this.parent.get2DVertices())) {
            this.vertices.reverse();
        }

        // add length and arc measurement object
        this.init();

        // edit mode variables
        this.editModeEnabled = false;
        this.editableMeasurements = [];
        this.currentEditableMeasurementIndex = 0;
        this.dragIndex = null;
        this.dragStartPosition = null;
        this.editable = editable;
        //console.timeEnd('PolygonMeasurement');

    }


    _getPreviousVertexIndex(index) {
        if (index === 0) {
            return this.vertices.length - 1;
        } else
            return index - 1;
    }

    _getNextVertexIndex(index) {
        if (index === this.vertices.length - 1) {
            return 0;
        } else
            return index + 1;
    }

    init() {
        //console.time('PolygonMeasurement: init');
        this.lengthElements = [];
        this.arcElements = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let prevIndex = this._getPreviousVertexIndex(i);
            let nextIndex = this._getNextVertexIndex(i);
            this.lengthElements.push(
                new LengthMeasurement(this.vertices[i], this.vertices[(i+1)%this.vertices.length], this.stage, this));       
            this.arcElements.push(
                new ArcMeasurement(this.vertices[prevIndex], this.vertices[i], this.vertices[nextIndex], this.stage, this));
        }
        //console.timeEnd('PolygonMeasurement: init');
    }

    _editMode = (event) => {
        if (event.key === "Tab") {
            event.preventDefault();
            if (!this.editModeEnabled) {
                this.editModeEnabled = true;
                this.stage.dragControls.disable();
                this.stage.dragControls.reset();
                this.stage.selectionControls.disable();
                for (let key in this.stage.dimensionObjects) {
                    this.stage.dimensionObjects[key].disable();
                }

                // get editable measurements
                this.editableMeasurements = [];
                this.editableMeasurements.push(this.lengthElements[this._getPreviousVertexIndex(this.dragIndex)]);
                this.editableMeasurements.push(this.lengthElements[this.dragIndex]);

                // disable all measurements
                this.disable();

                for (let editableMeasurement of this.editableMeasurements) {
                    // enable editable measurements
                    editableMeasurement.enable();
                    // change update direction of editable measurement
                    editableMeasurement.setMovableVertex(this.vertices[this.dragIndex]);
                }

                // enable edit mode of first element
                this.currentEditableMeasurementIndex = 0;
                this.editableMeasurements[this.currentEditableMeasurementIndex].setTextEditable();

            }
            else {
                this.currentEditableMeasurementIndex += 1;
                this.editableMeasurements[
                this.currentEditableMeasurementIndex % this.editableMeasurements.length
                    ].setTextEditable();
            }

        }
    };

    show() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].show(this.editable);
            this.arcElements[i].show(this.editable);
        }
    }

    showLength(){
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].show(this.editable);
        }
    }

    showArc(){
        for (let i = 0; i < this.vertices.length; i++) {
            this.arcElements[i].show(this.editable);
        }
    }

    hide() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i] && this.lengthElements[i].hide();
            this.arcElements[i] && this.arcElements[i].hide();
        }    
    }

    hideLength(){
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i] && this.lengthElements[i].hide();
        }
    }

    hideArc(){
        for (let i = 0; i < this.vertices.length; i++) {
            this.arcElements[i] && this.arcElements[i].hide();
        }
    }

    enable() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].enable();
            this.arcElements[i].enable();
        }
    }

    disable() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].disable();
            this.arcElements[i].disable();
        }
    }

    disableTextSelection() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].disableTextSelection();
            this.arcElements[i].disableTextSelection();
        }
    }

    enableTextSelection() {
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].enableTextSelection();
            this.arcElements[i].enableTextSelection();
        }
    }

    update() {
        if (!utils.checkClockwise(this.get2DVertices())) {
            this.vertices.reverse();
            this.remove();
            this.init();
            this.show();
            // update dragIndex
            this.dragIndex = (this.lengthElements.length-1) - this.dragIndex;
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.lengthElements[i].update();
            this.arcElements[i].update();
        }   
    }
    
    updateMeasurements(arr) {
        for (let i = 0; i < this.lengthElements.length; i++) {
            if(this.lengthElements[i].vertexObj1 && this.lengthElements[i].vertexObj2){
                this.lengthElements[i].vertexObj1 = arr[i];
                this.lengthElements[i].vertexObj2 = arr[(i+1)%this.lengthElements.length];
                //add for arc
                this.arcElements[i].vertexObj2 = arr[i];
                this.arcElements[i].vertexObj1 = arr[(i-1 + this.arcElements.length)%this.arcElements.length];
                this.arcElements[i].vertexObj3= arr[(i+1)%this.arcElements.length];
                this.lengthElements[i].update();
                this.arcElements[i].update();
            }
        }
        
    }

    remove() {
        for (let i = this.lengthElements.length - 1; i >= 0; i--) {
            this.lengthElements[i].remove();
            this.lengthElements.splice(i,1);
        }

        for (let i = this.arcElements.length - 1; i >= 0; i--) {
            this.arcElements[i].remove();
            this.arcElements.splice(i,1);
        }
    }

    handleVertexDragStart(vertex, ind) {
        this.dragIndex = ind;
        if (this.dragIndex === -1) {
            console.error('PolygonMeasurement: handleVertexDragStart: Invalid vertex passed.');
        } else {
            this.dragStartPosition = vertex.getPosition();
            window.addEventListener('keydown', this._editMode, true);
        }
    }

    handleVertexDragMove(updatedVertex) {
        // get affected vertex indices
        let index = this.vertices.indexOf(updatedVertex);
        let prevIndex = this._getPreviousVertexIndex(index);
        let nextIndex = this._getNextVertexIndex(index);
        this.lengthElements[prevIndex].vertexObj2.add(new THREE.Vector3(deltaX,deltaY,deltaZ));

        // update associated length measurements
        this.lengthElements[prevIndex].update();
        this.lengthElements[index].update();

        // update associated arc measurements
        this.arcElements[prevIndex].update();
        this.arcElements[index].update();
        this.arcElements[nextIndex].update();
    }

    handleVertexDragEnd(vertex,ind) {

        if (this.dragIndex !== null) {
            if (this.dragIndex !== ind) {
                console.error('ERROR: Polygon Measurement: vertex mismatch in handleVertexDragEnd');
            }
    
            window.removeEventListener('keydown', this._editMode, true);
    
            if (this.editModeEnabled) {
                this.disableEditMode();
            }

            this.dragIndex = null;
        }
    }

    handleOnCancel() {
        if(this.editModeEnabled) {
            let currentPosition = this.vertices[this.dragIndex].getPosition();
            this.vertices[this.dragIndex].moveObject(this.dragStartPosition.x - currentPosition.x, this.dragStartPosition.y - currentPosition.y, this.dragStartPosition.z - currentPosition.z);
            this.disableEditMode();
            window.removeEventListener('keydown', this._editMode, true);
        }
    }

    disableEditMode() {
        // enable all measurements
        this.enable();

        this.stage.dragControls.enable();
        this.stage.selectionControls.enable();
        for (let key in this.stage.dimensionObjects) {
            this.stage.dimensionObjects[key].enable();
        }

        // restore editable measurement's update direction
        for (let editableMeasurement of this.editableMeasurements) {
            let index = this.lengthElements.indexOf(editableMeasurement);
            editableMeasurement.setMovableVertex(this.vertices[this._getNextVertexIndex(index)]);
        }

        // reset edit mode variables
        this.editModeEnabled = false;
        this.editableMeasurements = [];
        this.currentEditableMeasurementIndex = 0;
        this.dragStartPosition = null;
    }

    get2DVertices() {
        let vertices = [];
        for (let vertex of this.vertices) {
            vertices.push([
                vertex.getPosition().x,
                vertex.getPosition().y
            ])
        }
        return vertices;
    }

}

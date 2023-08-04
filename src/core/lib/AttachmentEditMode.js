import { VISUAL_STATES } from '../objects/visualConstants';
import * as THREE from 'three';
import { DragControls } from './RafterDragControls';
import { ORTHO_CAMERA_Z } from '../coreConstants';
import Dormer from '../objects/model/smartroof/Dormer';

export default class AttachmentEditMode {
    constructor(stage) {
        this.stage = stage;
        this.offset = 0;

        this.finalPoint = new THREE.Vector3();
        this.initialPoint = new THREE.Vector3();

        this.isSnapped = false;
    }

    initialize(object, attachmentEditMode) {
        this.currentObject = object;

        this.attachmentEdit = attachmentEditMode;
        // deep copy of the updateAttachmentRow array
        this.initialUpdatedAttachmentRow = JSON.parse(JSON.stringify(this.currentObject.updatedAttachmentRow));

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();

        this.setButtonStatus();
        this.attachmentEditMode(true);
        return true;
    }

    setButtonStatus() {
        this.stage.eventManager.setButtonStatusWhileSetbackEdit(
            this.onComplete.bind(this),
            this.onCancel.bind(this),
            this,
        );
    }

    attachmentEditMode(enabled) {
        if (enabled) {
            this.stage.ground.switchVisualState(VISUAL_STATES.MIRROR_MODE, true);
            this.currentObject.hideMeasurement();

            this.initDragControls();

        }
        else {
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
            this.currentObject.showMeasurement();
            // dragcontrols deactivate
            this.controls.dispose();
            this.stage.rendererManager.getDomElement().removeEventListener('mousemove', this.onMove, false);
        }
    }

    initDragControls() {
        this.stage.cameraManager.camera.position.z = ORTHO_CAMERA_Z;
        this.controls = new DragControls(
            this.currentObject.attachmentObject.children,
            this.stage.cameraManager.camera,
            this.stage.rendererManager.getDomElement(),
        );
    
        this.stage.rendererManager.getDomElement().addEventListener('mousemove', this.onMove, false)
        this.controls.addEventListener('dragstart', this.onDragStart, false);
        this.controls.addEventListener('drag', this.onDrag, false);
        this.controls.addEventListener('dragend', this.onDragEnd, false);
    }

    movementDirection() {
        if(this.currentObject.azimuth >= 0 && this.currentObject.azimuth < 45 ){
            return -1;
        }
        if(this.currentObject.azimuth >= 45 && this.currentObject.azimuth < 225 ){
            return 1;
        }
        if(this.currentObject.azimuth >= 225 && this.currentObject.azimuth < 360){
            return -1;
        }
        else {
            return -1;
        }
    }

    dependentDistance(FinalPoint, InitialPoint, Dist) {
        if (FinalPoint - InitialPoint > 0) {
            return (this.movementDirection() * Dist);
        }
        else {
            return (this.movementDirection() * -Dist);
        }
    }

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

    onDragStart = (event) => {
        if (event.object.userData.middle) {
            this.stage.rendererManager.getDomElement().style.cursor = 'e-resize';

            event.object.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

            this.initialPoint = this.stage.mousePoint.clone();
        }
        else {
            this.controls.enabled = false;
            event.object.clear();
        }
    }

    onDrag = (event) => {

        this.finalPoint = this.stage.mousePoint.clone();

        const dist = this.finalPoint.distanceTo(this.initialPoint);
        let lastEdgeSlope = this.slope();
        if (event.object.userData.middle) {
            if (dist < this.currentObject.rafterSpacing) {
                if (lastEdgeSlope == Infinity) {
                    event.object.position.x = 0;
                    this.offset = this.dependentDistance(this.finalPoint.x, this.initialPoint.x, dist);
                }
                else if (lastEdgeSlope <= 1 && lastEdgeSlope > -1) {
                    event.object.position.y = lastEdgeSlope * event.object.position.x;
                    this.offset = this.dependentDistance(this.finalPoint.x, this.initialPoint.x, dist);
                }
                else if (lastEdgeSlope > 1 && lastEdgeSlope != Infinity) {
                    event.object.position.x = (1 / lastEdgeSlope) * event.object.position.y;
                    this.offset = this.dependentDistance(this.finalPoint.y, this.initialPoint.y, dist);
                }
                else if (lastEdgeSlope < -1 && lastEdgeSlope != Infinity) {
                    event.object.position.x = (1 / lastEdgeSlope) * event.object.position.y;
                    this.offset = this.dependentDistance(this.finalPoint.y, this.initialPoint.y, dist);
                }
            }
            else {
                event.object.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const moveDist = this.offset < 0 ? -1 * this.currentObject.rafterSpacing : this.currentObject.rafterSpacing;
                const rowIds = this.currentObject.updatedAttachmentRow.map(ele => ele.rowId);
                if (rowIds.includes(event.object.userData.rowId)) {
                    for (let i = 0; i < this.currentObject.updatedAttachmentRow.length; i++) {
                        if (this.currentObject.updatedAttachmentRow[i].rowId === event.object.userData.rowId) {
                            this.currentObject.updatedAttachmentRow[i].offset += moveDist;
                        }
                    }
                }
                else {
                    this.currentObject.updatedAttachmentRow.push({
                        offset: moveDist,
                        rowId: event.object.userData.rowId,
                    })
                }
                this.controls.enabled = false;
            }
        }
    }

    onDragEnd = (event) => {
        if (event.object.userData.middle) {
            this.stage.rendererManager.getDomElement().style.cursor = 'e-resize';
            this.currentObject.updateAttachments();
        }
        this.controls.enabled = true;
    }

    onCancel() {
        this.currentObject.updatedAttachmentRow = this.initialUpdatedAttachmentRow;
        this.currentObject.updateAttachments();
        this.exitAttachmentEditMode();
    }

    onComplete() {
        try {
            this.currentObject.saveState();
            this.exitAttachmentEditMode();

            return Promise.resolve(true);
        }
        catch (error) {
            this.exitAttachmentEditMode();
            return Promise.reject(error);
        }
    }

    exitAttachmentEditMode() {
        this.attachmentEditMode(false);

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
}
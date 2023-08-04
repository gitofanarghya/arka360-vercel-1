import * as THREE from 'three';
import { v4 } from 'uuid';
import * as raycastingUtils from '../utils/raycastingUtils';
import * as utils from '../utils/utils';
import Subarray from '../objects/subArray/Subarray';
import {
    CREATED_STATE,
    DELETED_STATE,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    TEMP_STACK_USED_BY_EDIT_MODE,
    HIGH_PANEL_COVERAGE_AREA,
} from '../coreConstants';
import { VISUAL_STATES } from '../objects/visualConstants';
import Mousetrap from 'mousetrap';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { PANEL_SELECTION_DROPDOWN_MENU_CLASS_NAME } from '../../componentManager/componentManagerConstants';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import OuterEdge from '../objects/model/smartroof/OuterEdge';

export default class FaceSelectMode {
    constructor(stage) {
        this.stage = stage;
        this.selectedFaces = [];
        this.smartroofFaces = [];
        this.primaryFace = null;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;
        this.mousePoint = new THREE.Vector3();
        this.isClicked = false;
        this.isMouseDown = false;
        this.stopOnSingleSelect = false;
        this.finalDrawFace = null;
        this.highlightedFace = null;
    }

    initialize(object) {
        this.smartroofFaces = [];
        this.highlightedFace = null;
        this.primaryFace = object;
        this.selectedFaces = [object];
        this.enable();
        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();

        this.setButtonStatus();
        object.highlightOnHover();
        this.doubleClick = false;
        this.stopOnSingleSelect = true;
        this.canvas.addEventListener('click', this.onClick, false);
        this.canvas.addEventListener('mousemove', this.onMouseMove, false);
        this.finalDrawFace = null;
        return true;
    }    

    setButtonStatus() {
        this.stage.eventManager.setButtonStatusWhileFaceEdit(
            this.onComplete.bind(this),
            this.exitFaceSelectMode.bind(this),
            this,
        );
    }

    resetButtonStatus() {
        this.stage.eventManager.resetButtonStatusWhileFaceEdit();
    }

    async onComplete() {
        this.disable();
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.stateManager.stopContainer();
        return Promise.resolve(true);
    }

    async exitFaceSelectMode() {
        this.disable();
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.stateManager.stopContainer();
        return Promise.resolve(true);
    }

    enable() {
        if (!this.stage.visualManager.in3D) {
            this.stage.visualManager.updateVisualsForEditing(true);
            this.stage.selectionControls.setSelectedObject(this.primaryFace);
            this.stage.selectionControls.disable();
            this.stage.viewManager.disableDimensions();
        }
    }

    disable() {
        for (let i = 0, l = this.selectedFaces.length; i < l; i += 1) {
            this.selectedFaces[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
        }
        this.highlightedFace ? this.highlightedFace.unHighlight() : null;
        this.primaryFace ? this.primaryFace.unHighlight() : null;
        this.highlightedFace = null;

        this.canvas.removeEventListener('click', this.onClick, false);
        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
        this.stage.selectionControls.enable();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.viewManager.enableDimensions();
        if (this.finalDrawFace) {
            this.stage.selectionControls.setSelectedObject(this.finalDrawFace);
        }
    }

    onClick = (event) => {
        this.doubleClick = false;
        setTimeout(this.handleClick.bind(this, event), 20);
    }

    async handleSecondaryRoofPlace() {
        const secondaryRoof = this.selectedFaces[1].parent;
        await secondaryRoof.placeObject.bind(secondaryRoof);

        // Might not be needed
        this.selectedFaces[1].parent.placeObject();
        if(utils.isDisjoint(
            this.primaryFace.vertices,
            this.selectedFaces[1].vertices,
        )) {
            notificationsAssistant.info({
                title: 'Merge Face',
                message: 'Faces Need to be intersecting to merge',
            });
        }
        else {
            this.finalDrawFace  = this.primaryFace.mergeFace(this.selectedFaces[1]);    
            notificationsAssistant.info({
                title: 'Merge Face',
                message: 'Merge Face Complete',
            });
        }
        this.onComplete();
    }

    handleClick(event) {
        if (this.doubleClick) {
            return;
        }

        if (this.clickOverride) {
            this.clickOverride = false;
            return;
        }

        if (event.ctrlKey || event.metaKey || event.which !== 1) {
            return;
        }

        if (!this.stage.textSelectionControls.deSelectSelectedTextObject()) {
            return;
        }

        const tiltDeltaEpsilon = 0.01;
        const azimuthTolerance = 0.1;
        const azimuth = this.primaryFace.azimuth;
        const azimuthFilter = this.primaryFace.parent.isTemplate;

        // Filter out faces that are not valid
        const faces = Array.from(this.stage.ground.faces)
        .filter((face) => {
            if(!face.isValidFace()) return false;
            if(Math.abs(face.tilt - this.primaryFace.tilt) > tiltDeltaEpsilon) return false;
            if(face.parent === this.primaryFace.parent) return false;
            else if(this.selectedFaces.includes(face)) return false;
            if (azimuthFilter || face.parent.isTemplate) {
                if (Math.abs(face.azimuth - azimuth) > azimuthTolerance) return false;
            }
            return true;
        });
        const objectMeshes = faces.map(f => f.faceMesh);

        const allFaces = raycastingUtils
            .getObjectsOnClick(event, this.stage, objectMeshes);            
        let topObject = allFaces.length > 0 ? allFaces[0][0] : null;

        if (topObject) {
            if (topObject instanceof OuterEdge) {
                topObject = OuterEdge.smartroofFace;
            }
            else if ( !topObject instanceof SmartroofFace) {
                return;
            }
        }
        else {
            return;
        }

        const selectionList = [...this.selectedFaces];

        const index = selectionList.indexOf(topObject);

        if (index > -1) {
            selectionList.splice(index, 1);
            topObject.unHighlight();
            this.selectedFaces = selectionList;
        }
        else if (this.stopOnSingleSelect) {
            // Manage secondary face
            if (topObject.parent === this.primaryFace.parent) {
                notificationsAssistant.warning({
                    title: 'Secondary Face Select',
                    message: 'Primary face and secondary face cannot belong to the same roof.',
                });
            }
            else {
                // Valid Secondary Face
                selectionList.push(topObject);
                topObject.highlightOnHover();
                this.selectedFaces = selectionList;
                this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
                this.canvas.removeEventListener('click', this.onClick, false);
                this.stopOnSingleSelect = false;
                // decide params
                const secondaryFace = this.selectedFaces[1];
                const secondaryRoof = secondaryFace.parent;
                // rotate

                const threshold = 0.1;
                const dormerInvolved = this.primaryFace.parent.isTemplate || secondaryRoof.isTemplate;
                this.handleMerge(secondaryFace, threshold, dormerInvolved);
                return;
            }
        }
        else {
            selectionList.push(topObject);
            topObject.highlightOnHover();
            this.selectedFaces = selectionList;
        }

        return;
    }

    handleMerge(secondaryFace, disjointThreshold, isDormer = false) {
        const deltaAzimuth = secondaryFace.azimuth - this.primaryFace.azimuth;        
        
        // Handle disjiont faces
        if (utils.isDisjoint(this.primaryFace.vertices,secondaryFace.vertices)) {
            if (Math.abs(deltaAzimuth) > 0.0001 ) {
                notificationsAssistant.warning({
                    title: 'Secondary Face Select',
                    message: 'Face Azimuths do not match.',
                });
                this.stage.eventManager.clickCompleteButton();                
                return;
            }

            const minDistance = utils.minimumDistanceBetweenPolygons(this.primaryFace.vertices,secondaryFace.vertices);

            // Interpolate if needed
            if (minDistance < disjointThreshold) {
                secondaryFace.parent.saveState();
                this.primaryFace.parent.saveState();                
                this.finalDrawFace  = this.primaryFace.mergeFace(secondaryFace, !isDormer, minDistance);
                notificationsAssistant.info({
                    title: 'Merge Face',
                    message: 'Merge Face Complete (Interpolated)',
                });
                this.stage.eventManager.clickCompleteButton();
                return;
            }

            notificationsAssistant.warning({
                title: 'Merge Face',
                message: 'Faces Need to be intersecting to merge, try moving the roof.',
            });
            this.stage.eventManager.clickCompleteButton();
            return;
        }

        // Match the azimuths
        // Rotate if needed
        if (!isDormer && Math.abs(deltaAzimuth) > 0.0001 ) {
            if (Math.abs(deltaAzimuth) < 5) {
                secondaryFace.parent.saveState();
                this.primaryFace.parent.saveState();                   
                secondaryFace.parent.rotateObjectHelper(utils.deg2Rad(deltaAzimuth), secondaryFace.parent.getPosition());
            }
            else {
                notificationsAssistant.warning({
                    title: 'Secondary Face Select',
                    message: 'Face Azimuths do not match, try rotating the roof.',
                });
                this.stage.eventManager.clickCompleteButton();                
                return;
            }
        }

        secondaryFace.parent.saveState();
        this.primaryFace.parent.saveState();           
        this.finalDrawFace  = this.primaryFace.mergeFace(secondaryFace, !isDormer);
        notificationsAssistant.info({
            title: 'Merge Face',
            message: 'Merge Face Complete',
        });
        this.stage.eventManager.clickCompleteButton();

        return;
    }

    onMouseMove = (event) => {
        setTimeout(this.handleHover.bind(this, event), 20);
    }

    handleHover(event) {
        
        const tiltDeltaEpsilon = 0.01;
        const azimuth = this.primaryFace.azimuth;
        let azimuthFilter = false;
        const azimuthTolerance = 0.1;
        if (this.primaryFace.parent.isTemplate) {
            azimuthFilter = true;
        }
        const highlightablefaces = Array.from(this.stage.ground.faces)
            .filter((face) => {
                if(!face.isValidFace()) return false;
                if(Math.abs(face.tilt - this.primaryFace.tilt) > tiltDeltaEpsilon) return false;
                if(face.parent === this.primaryFace.parent) return false;
                else if(this.selectedFaces.includes(face)) return false;
                if (azimuthFilter || face.parent.isTemplate) {
                    if (Math.abs(face.azimuth - azimuth) > azimuthTolerance) return false;
                }
                return true;
        });
        const mousePoint = this.stage.mousePoint;

        const objectMeshes = highlightablefaces.map(f => f.faceMesh);
        
        // const allFaces = raycastingUtils
        // .getObjectsOnClick(event, this.stage, objectMeshes);
        const allFaces = raycastingUtils.getAllObjectsBelowPoint(mousePoint, this.stage, null, objectMeshes);
        let topObject = allFaces.length > 0 ? allFaces[0][0] : null;
        if (topObject === null) {
            this.unHighlight();
            return null;
        }
        if (topObject instanceof SmartroofFace) {
            if(!this.selectedFaces.includes(topObject)) {
                if (topObject !== this.highlightedFace) {
                    this.unHighlight();
                    topObject.highlightOnHover();
                    this.highlightedFace = topObject;
                }
            }
            else {
                this.unHighlight();
            }
        }else {
            this.unHighlight();
        }

        return null;
    }

    unHighlight() {
        if (this.highlightedFace) {
            this.highlightedFace.unHighlight();
            this.highlightedFace = null;
        }
    }
}

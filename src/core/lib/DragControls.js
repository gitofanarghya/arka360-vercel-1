import * as THREE from 'three';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Table from '../objects/subArray/Table';
import Dimension from '../objects/subObjects/Dimension';
import Walkway from '../objects/model/Walkway';
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import RotationPoint from '../objects/subObjects/RotationPoint';
import {
    getCentroidOfObjects,
    getNormalizedCameraCoordinates,
} from '../utils/utils';
import { checkPointOnGround } from '../utils/raycastingUtils';
import { VISUAL_STATES } from '../objects/visualConstants';
import Tree from '../objects/model/Tree';
import CustomImage from '../objects/ground/CustomImage';
import Inverter from '../objects/ac/Inverter';
import DCDB from '../objects/ac/DCDB';
import ACDB from '../objects/ac/ACDB';
import TextBox from '../objects/subObjects/TextBox';
import EdgeCentrePoints from '../objects/subObjects/EdgeCentrePoints';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import Dormer from '../objects/model/smartroof/Dormer';
import Fold from '../objects/model/smartroof/Fold';
import CombinerBox from '../objects/ac/CombinerBox';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import InnerEdge from '../objects/model/smartroof/InnerEdge';
import { getAllModelType, getModels } from '../utils/exporters';
import Subarray from '../objects/subArray/Subarray';
import { SELECTION_CONTEXT_MENU_CLASS_NAME } from '../../componentManager/componentManagerConstants';
import FixedObject from '../objects/FixedObject';
import Property from '../objects/model/Property';
import Gazebo from './PowerGazebo';
import OuterEdge from '../objects/model/smartroof/OuterEdge';
import { CROSSHAIR } from '../coreConstants';
import TurretDormer from '../objects/model/smartroof/dormers/TurretDormer';
export default class DragControls {
    constructor(camera, domElement, stage) {
        this.dragEnabled = false;
        this.stage = stage;

        this.camera = camera;
        this.domElement = domElement;

        // initialize mouse for storing mouse position
        this.mouse = new THREE.Vector3();

        // initialize raycaster
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 2/this.stage.getNormalisedZoom();

        // initialize selected object, it's function
        // and an intersection point where it was clicked upon
        // and an offset point to store deltaX and deltaY while moving
        // and plane used for subsequent intersections after selection
        // and a variable to store if drag was actually done or not so as
        //  not to call objectDoneFunctions unnecessarily
        this.selectedIdx = null;
        this.intersectionPoint = new THREE.Vector3();
        this.offset = new THREE.Vector2();
        this.plane = new THREE.Plane();
        this.isMoved = false;
        this.areStudioButtonsDisabled = false;
        this.displacementDimension = null;

        // multi-selection mode: default off.
        // If on, all objects will be subjected to their respective func
        this.multiSelectMode = false;

        // list of objects on which dragging is enabled with the functions
        // and their corresponding threejs groups
        // drag function is called while dragging with deltaX and deltaY
        // done function is called on completion of drag with no argument
        this.objects = [];
        this.threejsObjectsGroup = [];
        this.objectDragFunctions = [];
        this.objectDoneFunctions = [];
        this.objectStartFunctions = [];
        this.objectCancelFunctions = [];

        // for tab interface of dimension
        this.editModeEnabled = false;
        this.editableDimensions = [];
        this.currentEditableDimensionIndex = -1;
        this.dragStartPosition = new THREE.Vector3();
        this.mouseMovesIndex = undefined;

        this.enable();

        this.outlinePointOutsideGround = false;

        this.currentParents = [];
        this.objectsErrored = [];
    }

    add(
        object,
        dragFunc,
        doneFunc = function done() {
            return false;
        },
        startFunc = function start() {
            return false;
        },
        cancelFunc = function cancel() {
            return false;
        },
    ) {
        if (object instanceof PolygonModel 
            || object instanceof SmartroofModel
            || object instanceof Dormer
            || object instanceof CylinderModel
            || object instanceof Table
            || object instanceof OutlinePoints
            || object instanceof Walkway 
            || object instanceof Tree
            || object instanceof CustomImage
            || object instanceof Inverter
            || object instanceof DCDB
            || object instanceof ACDB
            || object instanceof TextBox
            || object instanceof CombinerBox
            || object instanceof EdgeCentrePoints
            || object instanceof RotationPoint
            || object instanceof Fold
            || object instanceof InnerEdge
            || object instanceof OuterEdge
            || object instanceof Property) {

            this.objects.push(object);
            // getting list of ObjectsGroup from TSL Objects
            this.threejsObjectsGroup.push(object.objectsGroup);
            this.objectDragFunctions.push(dragFunc);
            this.objectStartFunctions.push(startFunc);
            this.objectDoneFunctions.push(doneFunc);
            this.objectCancelFunctions.push(cancelFunc);
        }
    }

    removeIfExists(object) {
        const idx = this.objects.indexOf(object);
        if (idx !== -1) {
            this.objects.splice(idx, 1);
            this.threejsObjectsGroup.splice(idx, 1);
            this.objectDragFunctions.splice(idx, 1);
            this.objectDoneFunctions.splice(idx, 1);
            this.objectStartFunctions.splice(idx, 1);
            this.objectCancelFunctions.splice(idx, 1);
        }
    }

    removeAll() {
        this.objects = [];
        this.threejsObjectsGroup = [];
        this.objectDragFunctions = [];
        this.objectDoneFunctions = [];
        this.objectStartFunctions = [];
        this.objectCancelFunctions = [];
    }

    enable() {
        if (!this.dragEnabled) {
            this.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
            this.dragEnabled = true;
        } else {
            console.error('ERROR: DragControls.js: Drag Controls control already enabled.')
        }
    }

    disable() {
        if (this.dragEnabled) {
            this.domElement.removeEventListener('mousedown', this.onDocumentMouseDown, false);
            this.domElement.removeEventListener('mouseup', this.onComplete, false);
            this.domElement.removeEventListener('mouseleave', this.onComplete, false);

            this.dragEnabled = false;
        }
    }

    reset() {
        this.updateParentsAndObjectsForDragEnd();
        this.selectedIdx = null;
        this.intersectionPoint = new THREE.Vector3();
        this.offset = new THREE.Vector2();
        this.plane = new THREE.Plane();
        this.isMoved = false;
        if (this.displacementDimension !== null) {
            this.displacementDimension.remove();
        }
        this.areStudioButtonsDisabled = false;

        this.editModeEnabled = false;
        this.editableDimensions = [];
        this.currentEditableDimensionIndex = -1;
        this.dragStartPosition = new THREE.Vector3();

        // make mouse normal
        document.getElementById('design-canvas').style.cursor = 'auto';

        this.stage.snapManager.unInitialize();

        this.stage.visualManager.updateVisualsForEditing(false);
    }

    enableMultiSelect() {
        this.multiSelectMode = true;
    }

    disableMultiSelect() {
        this.multiSelectMode = false;
    }

    updateParentsAndErrors() {
        let doneObjects = [];
        for (let i = 0; i < this.objects.length; i += 1) {
            const object = (this.objects[i] instanceof OutlinePoints || this.objects[i] instanceof RotationPoint || this.objects[i] instanceof Fold || this.objects[i] instanceof InnerEdge || this.objects[i] instanceof OuterEdge) ?
                this.objects[i].belongsTo :
                this.objects[i];

            // gazebo was coming in the object from above line, as this.object was rotation point
            if (object instanceof Gazebo) {
                continue;
            }

            if (!doneObjects.includes(object)) {

                const placingInformation = object.getPlacingInformation();
                object.updateWhilePlacing(placingInformation);

                if (placingInformation.errors.length !== 0 && !this.objectsErrored[i]) {
                    this.objectsErrored[i] = true;
                    object.switchVisualState(VISUAL_STATES.ERROR, true);

                    if (this.currentParents[i] !== null && this.currentParents[i] !== undefined) {
                        this.currentParents[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
                        this.currentParents[i] = null;
                    }
                } else if (placingInformation.errors.length === 0 && this.objectsErrored[i]) {
                    object.switchVisualState(VISUAL_STATES.DEFAULT, true);
                    object.switchVisualState(VISUAL_STATES.SELECT, false);
                    this.objectsErrored[i] = false;
                }


                if (placingInformation.parent !== undefined && placingInformation.parent !== null) {
                    const { parent } = placingInformation;

                    if (this.currentParents[i] !== null && this.currentParents[i] !== undefined &&
                        this.currentParents[i] !== parent) {
                        if (this.currentParents[i] instanceof CylinderModel || this.currentParents[i] instanceof PolygonModel) {
                            this.currentParents[i].hideObject();
                        }

                        if (this.object instanceof Table) {
                            if (this.object.getSubarray() instanceof Gazebo) {
                                this.object.updateWhileHovering(this.currentParents[0], parent, true);
                            }
                        }
                        this.currentParents[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
                    }

                    if (object instanceof CylinderModel || object instanceof PolygonModel) {
                        if (object.updateCurrentlyLockedParameter(placingInformation.tiltAndHeights)) {
                            this.stage.eventManager.setObjectsSelected([object]);
                        }
                    }
                    if (parent instanceof CylinderModel || parent instanceof PolygonModel) {
                        parent.showObject();
                    }
                    parent.switchVisualState(VISUAL_STATES.PARENT, false);
                    this.currentParents[i] = parent;
                }
                doneObjects.push(object);
            }
        }
    }

    onDocumentMouseDown = (event) => {
        // className should be same as the class name of SelectionContextMenu.Vue
        if (event.target.className === SELECTION_CONTEXT_MENU_CLASS_NAME) {
            return;
        }
        if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
            // for selecting object
            event.preventDefault();

            // getting the mouse
            this.mouse = getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
            this.mouse.project(this.camera);

            this.raycaster.params.Line.threshold = 2/this.stage.getNormalisedZoom();
            this.raycaster.params.Points.threshold = 2 / this.stage.getNormalisedZoom();
            this.raycaster.setFromCamera(this.mouse, this.camera);

            const allObjectMeshes = this.getAllObjectMeshes();
            let intersects = this.raycaster.intersectObjects(allObjectMeshes, false);
            if (intersects.length > 0) {
                // Get the selected object idx
                let intersectionIndex = -1;
                [this.selectedIdx, intersectionIndex] = this.findTopmostIntersectingParentObjectGroup(intersects);
                // If the selected object is valid, start drag process
                if (this.selectedIdx !== -1) {
                    // console.log('selected object', this.objects[this.selectedIdx]);
                    // get the intersection point for moving while considering offset
                    this.stage.eventManager.set3DViewDisabled();
                    this.intersectionPoint = intersects[intersectionIndex].point;
                    // make a plane for further intersection
                    // plane is made up of normal pointing upwards
                    // and the intersection point on the plane
                    this.plane.setFromNormalAndCoplanarPoint(
                        new THREE.Vector3(0, 0, -1),
                        this.intersectionPoint
                    );
                    this.raycaster.ray.intersectPlane(this.plane, this.intersectionPoint);

                    // Initialize snap manager
                    let selectedObject = this.objects[this.selectedIdx];

                    // this.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
                    this.stage.eventHandler.addEvent(this.onDocumentMouseMove.bind(this));
                    this.mouseMovesIndex = this.stage.eventHandler.getIndex();
                    this.domElement.addEventListener('mouseup', this.onComplete, false);
                    this.domElement.addEventListener('mouseleave', this.onComplete, false);
                    let desigCanvas = document.getElementById('design-canvas');
                    desigCanvas.style.cursor = CROSSHAIR;

                    // To be used for canceling drag
                    this.dragStartPosition = new THREE.Vector3();
                    this.raycaster.ray.intersectPlane(this.plane, this.dragStartPosition);

                    // initialise tab mode
                    if (!(selectedObject instanceof OutlinePoints)) {
                        window.addEventListener('keydown', this._tabMode, false);
                    }
                }
            }

        }
    };

    getAllObjectMeshes() {
        const allObjectMeshes = [];
        const allModels = getAllModelType();
        getModels(this.stage.ground, allModels);
        Object.keys(allModels).forEach((obj) => {
            for (let i = 0; i < allModels[obj].length; i += 1) {
                const object = allModels[obj][i];
                if (object instanceof SmartroofModel) {
                    object.folds.forEach((fold) => {
                        allObjectMeshes.push(fold.vertexMesh);
                    });                    
                }
                if (object instanceof TurretDormer) {
                    allObjectMeshes.push(object.apex.vertexMesh);
                }
                if (object instanceof Dormer) {
                    if(object.point)
                        allObjectMeshes.push(object.point.vertexMesh);
                }
                if (object instanceof SmartroofFace) {
                    continue;
                } else if (object instanceof Tree) {
                    allObjectMeshes.push(object.trunkMesh);
                    allObjectMeshes.push(object.crownMesh);
                }
                else if (object instanceof TextBox) {
                    allObjectMeshes.push(object.textBoxMesh);
                    allObjectMeshes.push(object.textMesh);
                }
                else {
                    allObjectMeshes.push(object.mesh);
                }
                if (object.edgeCentrePoints) {
                    object.edgeCentrePoints.forEach(edgeCenter => {
                        allObjectMeshes.push(edgeCenter.vertexMesh);
                    });
                }
                if (object.outlinePoints && !(object instanceof FixedObject || object instanceof ACDB)) {
                    object.outlinePoints.forEach(outline => {
                        if (outline.objectsGroup.visible) {
                            allObjectMeshes.push(outline.vertexMesh);
                        }
                    });
                }
                if (object.innerEdgesObject) {
                    object.innerEdgesObject.forEach(innerEdge => {
                        if (innerEdge.objectsGroup.visible) {
                            allObjectMeshes.push(innerEdge.linesMesh);
                        }
                    });
                }
                if (object.outerEdgeObjects) {
                    object.outerEdgeObjects.forEach(outerEdge => {
                        if (outerEdge.objectsGroup.visible) {
                            allObjectMeshes.push(outerEdge.outerEdgeMesh);
                        }
                    });
                }
                if (object.rotationPoints) {
                    if (object.rotationPoints.objectsGroup.visible) {
                        allObjectMeshes.push(object.rotationPoints.vertexMesh);
                    }
                }
                if (object instanceof Subarray || object instanceof Gazebo) {
                    object.getPanels().forEach((panel) => {
                        allObjectMeshes.push(panel.panelMesh);
                    });
                }
            }
        });
        if(this.stage.inCustomImageEditMode){
            allObjectMeshes.push(this.stage.customImage.plane);
        }

        return allObjectMeshes;
    }

    findTopmostIntersectingParentObjectGroup(allIntersections) {
        for (let i = 0, l = allIntersections.length; i < l; i += 1) {
            let intersectingObject = allIntersections[i].object;
            while (intersectingObject && intersectingObject.type !== "Scene") {
                const index = this.threejsObjectsGroup.indexOf(intersectingObject);
                if (index !== -1 && (this.objects[index] instanceof InnerEdge || this.objects[index] instanceof OuterEdge)) {
                    let isOutlinePoint = false;
                    for (let j = i + 1; j < allIntersections.length; j += 1) {
                        let intersectingObject2 = allIntersections[j].object;
                        while (intersectingObject2 && intersectingObject2.type !== "Scene") {
                            const index2 = this.threejsObjectsGroup.indexOf(intersectingObject2);
                            if (this.objects[index2] instanceof OutlinePoints) {
                                isOutlinePoint = true;
                                return [index2, j];
                            }
                            intersectingObject2 = intersectingObject2.parent;
                        }
                    }
                }
                if (index !== -1 && i === 0) {
                    return [index, i];
                } else if (index !== -1 && this.objects[index] instanceof OutlinePoints) {
                    return [index, i];
                }
                intersectingObject = intersectingObject.parent;
            }
        }
        return [-1, -1];
    }

    firstTimeMoveActions() {
        // setting stage controls to desired, that is disabled buttons
        if (!this.areStudioButtonsDisabled && !this.inCustomImageEditMode()) {
            this.stage.eventManager.setButtonsStatusWhileDragging(this.cancelDrag.bind(this));
            this.areStudioButtonsDisabled = true;
        }

        // Hiding selectionContextMenu
        if (this.stage.selectionControls.selectionContextMenuVisible) {
            this.stage.selectionControls.hideSelectionContextMenu();
        }

        // Start editing
        if (!this.inCustomImageEditMode()) {
            this.stage.visualManager.updateVisualsForEditing(true);
        }

        // calling the startFunc
        if (!this.multiSelectMode) {
            // in case of single select, just call a single function
            this.objectStartFunctions[this.selectedIdx]();
        } else {
            // in case of multi select, call every function (associated with each object)
            for (let func of this.objectStartFunctions) {
                func();
            }
        }

        // disable rect tool while dragging
        this.stage.selectionControls.selectionRectangle.disableRectTool();

        // disable duplicate manager
        this.stage.duplicateManager.disable();

        // Initialize snap manager
        let selectedObject = this.objects[this.selectedIdx];
        this.stage.snapManager.initialize(selectedObject, this.intersectionPoint.clone());

        // Drag Displacement for non-outline point and non custom image object
        if (!(this.objects[ this.selectedIdx ] instanceof OutlinePoints
            || this.objects[this.selectedIdx] instanceof CustomImage
            || this.objects[this.selectedIdx] instanceof TextBox
            || this.objects[this.selectedIdx] instanceof EdgeCentrePoints
            || this.objects[this.selectedIdx] instanceof RotationPoint
            || this.objects[this.selectedIdx] instanceof Fold
            || this.objects[this.selectedIdx] instanceof OuterEdge
            || this.objects[this.selectedIdx] instanceof InnerEdge)) {
            this.displacementDimension = new Dimension(this.stage, true);

            const obj2 = this.objects[this.selectedIdx];
            const vertex2 = getCentroidOfObjects(this.objects);
            const vertex1 = vertex2;
            const obj1 = obj2 instanceof Table ? obj2.getSubarray().getParent() : obj2.getParent();
            this.displacementDimension.makeDimension(vertex1, obj1, vertex2, obj2);
        }
    }

    onDocumentMouseMove = (event) => {
        if(!this.objects[this.selectedIdx]) return;
        // for dragging object
        event.preventDefault();
        
        if(!this.isMoved) {
            // Prevent accidental drag while selecting objects with raycaster threshold
            const currentMouseposition = getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
            const currentMouseposition2D = new THREE.Vector2(currentMouseposition.x, currentMouseposition.y);
            const mouseDelta = currentMouseposition2D.sub(this.dragStartPosition);
            if(mouseDelta.length() > 0.001) {
                this.isMoved = true;
                this.firstTimeMoveActions();
            }
            else return;
        }

        const position = this.objects[this.selectedIdx].getPosition();

        if (!checkPointOnGround(position, this.stage) || this.inCustomImageEditMode()) {
            this.mouse = getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
        } else {
            this.mouse = this.stage.snapManager.objectSnap(event);
        }

        this.mouse.project(this.camera);

        this.raycaster.setFromCamera(this.mouse, this.camera);

        //         this.objects[this.selectedIdx].belongsTo.rotateObject(this.offset.x, this.offset.y)

        if (this.selectedIdx !== null && this.selectedIdx !== -1) {
            // this should always be true though as mouse move is only enabled on mouse down

            // check for intersection with plane and save it to newIntersectionPoint
            let newIntersectionPoint = new THREE.Vector3();

            if (this.raycaster.ray.intersectPlane(this.plane, newIntersectionPoint)) {
                // getting offset for moving
                this.offset.subVectors(newIntersectionPoint, this.intersectionPoint);
                if (this.objects[this.selectedIdx] instanceof OutlinePoints || this.objects[this.selectedIdx] instanceof InnerEdge || 
                    this.objects[this.selectedIdx] instanceof RotationPoint) {
                    this.objects[this.selectedIdx].highlightOnHover();
                    this.stage.highlightedObjects.push(this.objects[this.selectedIdx]);
                }
                if (this.objects[this.selectedIdx] instanceof OutlinePoints || this.objects[this.selectedIdx] instanceof InnerEdge || this.objects[this.selectedIdx] instanceof OuterEdge || this.objects[this.selectedIdx] instanceof CustomImage) {
                    this.moveObjects(this.offset.x, this.offset.y, false);
                } else {
                    this.moveObjects(this.offset.x, this.offset.y, true);
                }
                this.updateParentsAndErrors();

                // make the intersectionPoint the new point
                // so that next time only the delta is seen
                this.intersectionPoint = newIntersectionPoint;
            }
        }
    };

    onComplete = async(event) => {
        if (event.which === 1) {
            this.stage.eventManager.set3DViewEnabled();
            // removing dragging
            this.stage.eventHandler.removeEvent(this.mouseMovesIndex);
            event.preventDefault();

            if (this.isMoved && !this.inCustomImageEditMode()) {
                this.stage.selectionControls.clickOverride = true;

                if (this.areStudioButtonsDisabled) {
                    this.stage.eventManager.setButtonsStatusOnHomeState();
                    this.areStudioButtonsDisabled = false;
                }

                //set a minimum distance move required
                const currentPosition = new THREE.Vector3();
                this.raycaster.ray.intersectPlane(this.plane, currentPosition);
                if (this.dragStartPosition.distanceToSquared(currentPosition) >= 0.000001) {
                    await this.placeObjects();
                } else {
                    await this.cancelDrag();
                }

                //enable rect tool after done
                if(!this.stage.visualManager.in3D)
                    this.stage.selectionControls.selectionRectangle.enableRectTool();

                // enable duplicate manager
                this.stage.duplicateManager.enable();

                // UnInitialize Snap Manager
                this.stage.snapManager.unInitialize();

                if (this.displacementDimension !== null) {
                    this.displacementDimension.remove();
                }
            }

            if (this.selectedIdx !== null && this.selectedIdx !== -1) {
                // unInitialise tab mode
                window.removeEventListener('keydown', this._tabMode, false);

                // making the pointer normal
                let desigCanvas = document.getElementById('design-canvas');
                desigCanvas.style.cursor = 'auto';

                // disabling move and cancel event
                // this.domElement.removeEventListener('mousemove', this.onDocumentMouseMove, false);
                this.domElement.removeEventListener('mouseup', this.onComplete, false);
                this.domElement.removeEventListener('mouseleave', this.onComplete, false);

                // disabling selection
                this.selectedIdx = null;
                this.intersectionPoint = new THREE.Vector3();
                this.offset = new THREE.Vector2();
                this.plane = new THREE.Plane();
                this.isMoved = false;
            }
        }
    };

    moveObjects(deltaX = 0, deltaY = 0, flag = true) {
        // calling the dragFuncs
        if (!this.multiSelectMode) {
            // in case of single select, just call a single function
            if (this.objectDragFunctions[this.selectedIdx]) {
                this.objectDragFunctions[this.selectedIdx](deltaX, deltaY);
            }
            if (flag && !(this.objects[this.selectedIdx] instanceof RotationPoint)) {
                this.stage.mergeManager.moveChildrenMesh(deltaX, deltaY);
            }
        } else {
            if (this.objects[this.selectedIdx] instanceof Table && this.objects[this.selectedIdx].linked) {
                return;
            }
            // in case of multi select, call every function (associated with each object)
            for (let func of this.objectDragFunctions) {
                func(deltaX, deltaY);
            }
        }
    }

    // rotateObjects(deltaX = 0, deltaY = 0) {
    //     console.log("rotateObjects in dragcontrol.js",deltaX,deltaY)
    //     // calling the dragFuncs
    //     if ( !this.multiSelectMode ) {
    //         // in case of single select, just call a single function
    //         PolygonModel.rotateObjects(deltaX, deltaY);
    //     }
    //     else {
    //         // in case of multi select, call every function (associated with each object)
    //         for (let func of this.objectDragFunctions) {
    //             func(deltaX, deltaY);
    //         }
    //     }
    // }

    async placeObjects(deltaX = 0, deltaY = 0) {
        this.stage.stateManager.startContainer();
        this.updateParentsAndObjectsForDragEnd();
        this.isMoved = false;
        this.stage.visualManager.updateVisualsForEditing(false);
        try {
            // calling the doneFuncs if moved
            if (!this.multiSelectMode) {
                await this.objectDoneFunctions[this.selectedIdx](deltaX, deltaY);
            } else {
                // in case of multi select, call every function (associated with each object)
                for (let i = this.objectDoneFunctions.length - 1; i >= 0; i -= 1) {
                    if (this.objectDoneFunctions[i]) {
                        await this.objectDoneFunctions[i]();
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.stage.stateManager.stopContainer();
        }
    }

    isEditModeEnabled() {
        return this.editModeEnabled;
    }

    rotationtabMode() {
        this.stage.textSelectionControls.setSelectedTextObject(this.objects[this.selectedIdx].textObject, {
            shouldCreateContainer: true,
            shouldCompleteOnNoChange: true
        });
        this.stage.eventHandler.mouseMoves.splice(this.mouseMovesIndex, 1)
        this.stage.dragControls.disable();
        this.stage.selectionControls.disable();
    }

    _tabMode = (event) => {
        if (event.key === "Tab") {
            event.preventDefault();
            if (this.objects[this.selectedIdx] instanceof RotationPoint) {
                if (!this.editModeEnabled) {
                    this.editModeEnabled = true;
                    this.rotationtabMode();
                }
            } else {
                this.tabMode()
            }
        }
    }
    tabMode() {
        if (!this.editModeEnabled) {
            this.editableDimensions = [];
            this.stage.eventHandler.mouseMoves.splice(this.mouseMovesIndex, 1);
            let selectedObjects = this.stage.selectionControls.getSelectedObjects();

            // get dimensions of selected objects which don't have both associated objects selected
            for (let selectedObject of selectedObjects) {
                let dimensions = selectedObject.getAttachedDimensions();
                for (let dimension of dimensions) {
                    let idx = this.editableDimensions.indexOf(dimension);
                    if (idx === -1) {
                        this.editableDimensions.push(dimension)
                    } else {
                        this.editableDimensions.splice(idx, 1);
                    }
                }
            }
            if (!this.editModeEnabled) {
                this.stage.eventHandler.removeEvent(this.mouseMovesIndex);

                this.editableDimensions = [];
                let selectedObjects = this.stage.selectionControls.getSelectedObjects();

                // get dimensions of selected objects which don't have both associated objects selected
                for (let selectedObject of selectedObjects) {
                    let dimensions = selectedObject.getAttachedDimensions();
                    for (let dimension of dimensions) {
                        let idx = this.editableDimensions.indexOf(dimension);
                        if (idx === -1) {
                            this.editableDimensions.push(dimension)
                        } else {
                            this.editableDimensions.splice(idx, 1);
                        }
                    }
                }

                // Toggle moving direction to be the selected object if possible
                // else remove from editableDimension array
                for (let i = this.editableDimensions.length - 1; i >= 0; i--) {
                    let dimension = this.editableDimensions[i];
                    if (!selectedObjects.includes(dimension.getMovingObject())) {
                        if (dimension.isMovingDirectionValid({ opposite: true })) {
                            dimension.toggleMovingDirection();
                        } else {
                            this.editableDimensions.splice(i, 1);
                        }
                    }
                }

                if (this.editableDimensions.length > 0) {
                    this.editModeEnabled = true;

                    this.stage.dragControls.disable();
                    this.stage.selectionControls.disable();
                    for (let key in this.stage.dimensionObjects) {
                        this.stage.dimensionObjects[key].disable();
                    }
                    for (let dimension of this.editableDimensions) {
                        dimension.enable();
                    }
                    for (let selectedObject of selectedObjects) {
                        if (selectedObject instanceof PolygonModel ||
                            selectedObject instanceof SmartroofModel ||
                            selectedObject instanceof CylinderModel) {
                                if (selectedObject.polygonMeasurement) {
                                    selectedObject.polygonMeasurement.disable();
                                }
                        }
                    }
                    this.domElement.style.cursor = 'auto';

                    // enable edit mode of first element
                    this.currentEditableDimensionIndex = 0;
                    this.editableDimensions[this.currentEditableDimensionIndex].setTextEditable();
                } else {
                    window.removeEventListener('keydown', this._tabMode, false);
                }
            } else {
                if (this.editableDimensions.length > 1) {
                    this.currentEditableDimensionIndex += 1;
                    this.editableDimensions[
                        this.currentEditableDimensionIndex % this.editableDimensions.length
                    ].setTextEditable();
                }
            }

            // Toggle moving direction to be the selected object if possible
            // else remove from editableDimension array
            for (let i = this.editableDimensions.length - 1; i >= 0; i--) {
                let dimension = this.editableDimensions[i];
                if (!selectedObjects.includes(dimension.getMovingObject())) {
                    if (dimension.isMovingDirectionValid({ opposite: true })) {
                        dimension.toggleMovingDirection();
                    } else {
                        this.editableDimensions.splice(i, 1);
                    }
                }
            }

            if (this.editableDimensions.length > 0) {
                this.editModeEnabled = true;

                this.stage.dragControls.disable();
                this.stage.selectionControls.disable();
                for (let key in this.stage.dimensionObjects) {
                    this.stage.dimensionObjects[key].disable();
                }
                for (let dimension of this.editableDimensions) {
                    dimension.enable();
                }
                for (let selectedObject of selectedObjects) {
                    if (selectedObject instanceof PolygonModel ||
                        selectedObject instanceof SmartroofModel ||
                        selectedObject instanceof CylinderModel) {
                            if (selectedObject.polygonMeasurement) {
                                selectedObject.polygonMeasurement.disable();
                            }
                    }
                }
                this.domElement.style.cursor = 'auto';

                // enable edit mode of first element
                this.currentEditableDimensionIndex = 0;
                this.editableDimensions[this.currentEditableDimensionIndex].setTextEditable();
            } else {
                window.removeEventListener('keydown', this._tabMode, false);
            }
        } else {
            if (this.editableDimensions.length > 1) {
                this.currentEditableDimensionIndex += 1;
                this.editableDimensions[
                    this.currentEditableDimensionIndex % this.editableDimensions.length
                ].setTextEditable();
            }
        }
    }

    async handleValueUpdate(deltaX = 0, deltaY = 0, deltaZ = 0) {
        window.removeEventListener('keydown', this._tabMode, false);

        // this.stage.dragControls.enable();
        this.stage.selectionControls.enable();

        // enable duplicate manager
        this.stage.duplicateManager.enable();

        for (let key in this.stage.dimensionObjects) {
            this.stage.dimensionObjects[key].enable();
        }
        for (let selectedObject of this.stage.selectionControls.getSelectedObjects()) {
            if (selectedObject instanceof PolygonModel ||
                selectedObject instanceof SmartroofModel ||
                selectedObject instanceof CylinderModel) {
                    if (selectedObject.polygonMeasurement) {
                        selectedObject.polygonMeasurement.enable();
                    }
                        
            }
        }

        this.moveObjects(deltaX, deltaY);
        await this.placeObjects();

        this.reset();
    }

    handleValueCancel() {
        window.removeEventListener('keydown', this._tabMode, false);

        this.restoreStartPosition();

        this.stage.dragControls.enable();
        this.stage.selectionControls.enable();

        // enable duplicate manager
        this.stage.duplicateManager.enable();

        for (let key in this.stage.dimensionObjects) {
            this.stage.dimensionObjects[key].enable();
        }
        for (let selectedObject of this.stage.selectionControls.getSelectedObjects()) {
            if (selectedObject instanceof PolygonModel || selectedObject instanceof CylinderModel || selectedObject instanceof SmartroofModel) {
                if (selectedObject.polygonMeasurement) {
                    selectedObject.polygonMeasurement.enable();
                }                    
            }
        }
        this.reset();
    }

    removeDraggingObject(object) {
        for (let j = 0; j < this.objects.length; j += 1) {
            if (this.objects[j] === object) {
                this.objects.splice(j, 1);
                break;
            }
        }
    }

    updateParentsAndObjectsForDragEnd() {
        for (let i = 0; i < this.currentParents.length; i += 1) {
            if (this.currentParents[i] !== null && this.currentParents[i] !== undefined) {
                this.currentParents[i].switchVisualState(VISUAL_STATES.DEFAULT, false);
            }
        }
        this.currentParents = [];
    }

    async cancelDrag() {
        try {
            if (!this.multiSelectMode) {
                await this.objectCancelFunctions[this.selectedIdx]();
            } else {
                // in case of multi select, call every function (associated with each object)
                for (let i = this.objectCancelFunctions.length - 1; i >= 0; i -= 1) {
                    await this.objectCancelFunctions[i]();
                }
            }
        } catch (error) {
            console.error(error);
        }
        this.stage.eventHandler.removeEvent(this.mouseMovesIndex);

        // enable duplicate manager
        this.stage.duplicateManager.enable();

        //enable rect tool after done
        if(!this.stage.visualManager.in3D)
            this.stage.selectionControls.selectionRectangle.enableRectTool();
        this.stage.selectionControls.clickOverride = true;

        this.disable();
        this.restoreStartPosition();
        this.updateParentsAndErrors();
        this.reset();
        this.enable();
    }

    restoreStartPosition() {
        // get deltaX and deltaY for previous position and move by the delta
        let currentPosition = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, currentPosition);
        this.moveObjects(this.dragStartPosition.x - currentPosition.x, this.dragStartPosition.y - currentPosition.y);
    }

    inCustomImageEditMode() {
        return this.objects.length === 1 && this.objects[0] instanceof CustomImage;
    }

    isEnabled() {
        return this.dragEnabled;
    }

    getIsMoved() {
        return this.isMoved;
    }
}
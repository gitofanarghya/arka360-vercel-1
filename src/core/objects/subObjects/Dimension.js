import * as THREE from "three";
import { v4 } from 'uuid';
import OutlinePoints from './OutlinePoints';
import {
    getObjectsWithEdgeContainingPoint,
    areVerticesOnGround,
} from "../../utils/raycastingUtils";
import * as utils from '../../utils/utils';
import Ground from "../ground/Ground";
import {
    getSubarrays, getModels, getAllModelType
} from "../../utils/exporters";
import HTMLText from "./HTMLText";
import PolygonModel from "../model/PolygonModel";
import Subarray from "../subArray/Subarray";
import {
    CAMERA_UPDATED,
    CREATED_STATE,
    DELETED_STATE,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    OUT_OF_GROUND_ERROR,
    DIMENSION_INVALID_ERROR,
} from "../../coreConstants";
import Panel from "../subArray/Panel";
import Table from "../subArray/Table";
import SelectionTree from "../../lib/SelectionTree";
import BaseObject from "../BaseObject";
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES } from '../visualConstants';
import {
    isMetricUnit,
    parseImperialMeasurement,
    convertImperialToMetric,
    stringifyImperialMeasurement,
    stringifyMetricMeasurement,
    convertMetricToImperial,
} from "../../../components/ui/length/utils";
import { FOOT_INCHES_VALIDATION_REGEX } from "../../../components/ui/length/constants";
import SmartroofFace from "../model/smartroof/SmartroofFace";
import Dormer from "../model/smartroof/Dormer";
import { SmartroofModel } from "../model/smartroof/SmartroofModel";
import gjk from "gjk";

const MINIMUM_NUMBER_OF_POINTS = 2;

export default class Dimension {
    constructor(stage, isTemporary = false) {
        this.stage = stage;
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;
        
        this.id = this.stage.getDimensionId();
        this.stage.dimensionObjects[this.id] = this;
        this.isTemporary = isTemporary;

        // creating objectsGroup
        this.objectsGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectsGroup.container = this;

        this.vertexObj1 = null;
        this.vertexObj2 = null;
        this.associatedObject1 = null;
        this.associatedObject2 = null;

        // properties
        this._defaultArrowColor = new THREE.Color(0xff0000);
        this._onSelectLineColor =
            new THREE.Color(COLOR_MAPPINGS.DIMENSION[MATERIAL_STATES
                .TRANSLUCENT][VISUAL_STATES.SELECT]
                .EDGE_COLOR);
        this._movableArrowHeadColor = new THREE.Color(0x00ff00);
        this.movableVertex = null;

        // TODO: Think of some other method
        this.inputError = this.stage.eventManager.wrongLengthInputError;

        this.completed = false;

        // initialising arrows
        let tempVector = new THREE.Vector3(0, 0, 0);
        this.arrowHelper1 =
            new THREE.ArrowHelper(tempVector, tempVector, 0.001, this._defaultArrowColor);
        this.arrowHelper2 =
            new THREE.ArrowHelper(tempVector, tempVector, 0.001, this._defaultArrowColor);
        this.arrowHelper1.container = this;
        this.arrowHelper2.container = this;

        this.objectsGroup.visible = false;
        this.objectsGroup.add(this.arrowHelper1);
        this.objectsGroup.add(this.arrowHelper2);

        // initialising text
        this.textObject = new HTMLText(
            0, 
            tempVector, 
            0,
            this.stage, 
            tempVector,
            0,
            this,
            function (input) {
                if (!isMetricUnit()) {
                    return input.search(FOOT_INCHES_VALIDATION_REGEX) !== -1;
                }

                if (input.length === 0 || isNaN(input) || parseFloat(input) < 0) return false;
        
                if (input % 1 === 0) return true;
        
                input = input.split(".");
                return input[1].length <= 4;
            }
        );

        this.textObject.hide();
        this.isTextSelected = false;

        // constant for arrow helper throwing error if vertices are at same position
        this._ARROW_HELPER_ERROR_CONSTANT = 0.0001;

        // for dimension not getting hidden below objects
        this.heightOffset = 10;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
    }

    saveState({ withoutContainer } = { withoutContainer: false }) {
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: this.getState.bind(this),
            withoutContainer: withoutContainer,            
        });
    }

    getState() {
        const dimensionData = {
            id: this.id,
            uuid: this.uuid,
            vertex1: this.vertexObj1.getPosition().toArray(),
            vertex2: this.vertexObj2.getPosition().toArray(),
            isVertex1Movable: this.vertexObj1 === this.movableVertex,
        };
        return dimensionData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            this.id = state.id;
            
            this.associatedObject1.handleDimensionAddition(this);
            this.associatedObject2.handleDimensionAddition(this);
            
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {                                
                this.stage.dimensionObjects[this.id] = this;
                this.stage.sceneManager.scene.add(this.objectsGroup);
                this.show();

                this.vertexObj1 = new OutlinePoints(...state.vertex1, this, this.stage);
                this.vertexObj2 = new OutlinePoints(...state.vertex2, this, this.stage);
            }
            else {
                this.vertexObj1.setPosition(...state.vertex1);
                this.vertexObj2.setPosition(...state.vertex2);
            }

            if (state.isVertex1Movable) {
                this.setMovableVertex(this.vertexObj1);
            }
            else {
                this.setMovableVertex(this.vertexObj2);
            }

            this.update();
        }
    }

    clearState() {
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
        this.remove({ shouldSaveState: false });
    }


    // drawing functions

    initDrawingMode() {
        if (!this.stage.viewManager.areDimensionsVisible()) {
            this.stage.eventManager.dimensionHiddenError();
            return false;
        }

        // check if dimension can be drawn, there should be at least one more object apart from Ground.
        let modelResult = getAllModelType();
        let subArrayResult = [];
        getModels(this.stage.ground, modelResult);
        getSubarrays(this.stage.ground, subArrayResult);

        if (
            modelResult.polygons.length === 0 &&
            modelResult.smartroofs.length === 0 &&
            modelResult.cylinders.length === 0 &&
            subArrayResult.length === 0 &&
            modelResult.trees.length === 0
        ) {
            this.stage.eventManager.noObjectOnStageError();
            return false;
        }

        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this)
        );            

        return true;        
    }

    // TODO: Ideal way would be that this function should not change any
    // instance variables and should just return the information about placing
    getPlacingInformation(drawingVertices, click = false) {
        const response = {};
        response.errors = [];
        response.pointUnplaceableError = null;

        const vector2DArray = utils.convertArrayToVector(drawingVertices);
        if (!areVerticesOnGround(vector2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }

        if (drawingVertices.length < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }

        const points = utils.convertArrayToVector(drawingVertices);
        const point1 = points[0];
        const point2 = points[1];

        // If point 1 is defined
        if (point1 !== undefined) {

            // Get possible associatedObjects for the first point
            let possibleAssociatedObjectsForPoint1 =
            getObjectsWithEdgeContainingPoint(point1, this.stage);
            possibleAssociatedObjectsForPoint1 = possibleAssociatedObjectsForPoint1.map(
                (possibleAssociatedObject) => {
                    return possibleAssociatedObject instanceof Panel ?
                        possibleAssociatedObject.getParent() : possibleAssociatedObject;
                },
            );

            // If length is 0, throw Dimension invalid error
            if (possibleAssociatedObjectsForPoint1.length === 0) {
                const error = new Error(DIMENSION_INVALID_ERROR);
                response.errors.push(error);
                response.pointUnplaceableError = error;
            }
            else {
                this.associatedObject1 = possibleAssociatedObjectsForPoint1;
            }

            if (point2 !== undefined) {
                // Get possible associated objects for the second point
                let possibleAssociatedObjectsForPoint2 =
                getObjectsWithEdgeContainingPoint(point2, this.stage);
                possibleAssociatedObjectsForPoint2 = possibleAssociatedObjectsForPoint2.map(
                    (possibleAssociatedObject) => {
                        return possibleAssociatedObject instanceof Panel ?
                            possibleAssociatedObject.getParent() : possibleAssociatedObject;
                    },
                );


                for (let i = 0; i < possibleAssociatedObjectsForPoint1.length; i += 1) {
                    const model = possibleAssociatedObjectsForPoint1[i];

                    if(model instanceof SmartroofModel) {
                        const children = model.getChildren();



                        for (let j = 0; j < children.length; j += 1) {
                            const child = children[j];
                            if (!child.isValidFace()) continue;
                            const vertices = child.get2DVertices();

                            const distance1 =  gjk.distance(vertices, [point1])
                            const distance2 =  gjk.distance(vertices, [point2])

                            if (distance1 < 0.01 && distance2 < 0.01) {
                                possibleAssociatedObjectsForPoint1.splice(i, 1)
                                possibleAssociatedObjectsForPoint1.push(child);
                            }
                        }
                    }
                }
                for (let i = 0; i < possibleAssociatedObjectsForPoint2.length; i += 1) {
                    const model = possibleAssociatedObjectsForPoint2[i];

                    if(model instanceof SmartroofModel) {
                        const children = model.getChildren();


                        for (let j = 0; j < children.length; j += 1) {
                            const child = children[j];
                            if (!child.isValidFace()) continue;
                            const vertices = child.get2DVertices();

                            const distance1 =  gjk.distance(vertices, [point1])
                            const distance2 =  gjk.distance(vertices, [point2])

                            if (distance1 < 0.01 && distance2 < 0.01) {
                                possibleAssociatedObjectsForPoint2.splice(i, 1)
                                possibleAssociatedObjectsForPoint2.push(child);
                            }
                        }
                    }
                }

                for (let i = 0; i < possibleAssociatedObjectsForPoint1.length; i += 1) {
                    const prevPossibleAssociatedObject = possibleAssociatedObjectsForPoint1[i];
                    for (let j = 0; j < possibleAssociatedObjectsForPoint2.length; j += 1) {
                        const possibleAssociatedObject = possibleAssociatedObjectsForPoint2[j];
                        if (
                            this.isDimensionValid(
                                prevPossibleAssociatedObject,
                                possibleAssociatedObject,
                            )
                        ) {
                            if (click) {
                                this.associatedObject1 = prevPossibleAssociatedObject;
                                this.associatedObject2 = possibleAssociatedObject;
                            }
                            return response;
                        }
                    }
                }
                const error = new Error(DIMENSION_INVALID_ERROR);
                response.errors.push(error);
                response.pointUnplaceableError = error;
            }
        }

        return response;
    }

    onComplete(geometry) {
        this.completed = true;

        // checks are required due to the new update
        // for subarray merging meshes.
        if (this.associatedObject1 instanceof Subarray) {
            this.associatedObject1 =
                this.associatedObject1.getNearestTableToPoint(new THREE.Vector3 (
                    geometry.attributes.position.array[0],
                    geometry.attributes.position.array[1],
                    geometry.attributes.position.array[2],
                ));
        }

        if (this.associatedObject2 instanceof Subarray) {
            this.associatedObject2 =
                this.associatedObject2.getNearestTableToPoint(new THREE.Vector3 (
                    geometry.attributes.position.array[3],
                    geometry.attributes.position.array[4],
                    geometry.attributes.position.array[5],
                ));
        }

        this.associatedObject1.handleDimensionAddition(this);
        this.associatedObject2.handleDimensionAddition(this);

        this.vertexObj1 = new OutlinePoints(
            geometry.attributes.position.array[0],
            geometry.attributes.position.array[1],
            geometry.attributes.position.array[2],
            this,
            this.stage
        );
        this.vertexObj2 = new OutlinePoints(
            geometry.attributes.position.array[3],
            geometry.attributes.position.array[4],
            geometry.attributes.position.array[5],
            this,
            this.stage
        );
        
        let [ firstObject, secondObject ] = this.getParentChildObjects();
        if (
            firstObject.getParent() === secondObject ||
            secondObject instanceof Ground
        ) {
            this.setMovableVertex(this.vertexObj1);
        }
        else {
            this.setMovableVertex(this.vertexObj2);
        }        

        this.updateHeight();

        this.show();

        this.stage.eventManager.completeDimensionCreation();
    }

    onCancel() {
        this.remove({ shouldSaveState: false });
    }

    makeDimension(vertex1, object1, vertex2, object2) {
        this._shouldCreateContainer = false;
        this.associatedObject1 = object1;
        this.associatedObject2 = object2;

        this.associatedObject1.handleDimensionAddition(this);
        this.associatedObject2.handleDimensionAddition(this);

        this.vertexObj1 = new OutlinePoints(vertex1.x, vertex1.y, vertex1.z, this, this.stage);
        this.vertexObj2 = new OutlinePoints(vertex2.x, vertex2.y, vertex2.z, this, this.stage);
        this.setMovableVertex(this.vertexObj2);

        this.updateHeight();
        this.show();
    }


    // handle vertex functions
    
    handleVertexMove(vertexObj, deltaX, deltaY, deltaZ) {
        console.warn("Dimensions: handleVertexMove: Function should not have been called");
    }

    handleVertexPlace(vertexObj, deltaX = 0, deltaY = 0, deltaZ = 0) {
        console.warn("Dimensions: handleVertexPlace: Function should not have been called");
    }

    
    // handle object functions

    handleAssociatedObjectMove(associatedObject, deltaX, deltaY, deltaZ) {
        // move outline points of this class if associated objects move
        // and also update arrows after movement
        if (associatedObject !== this.associatedObject1 && associatedObject !== this.associatedObject2) {
            console.error(
                "ERROR: Dimension: associatedObject doesn't belong to this object in handleAssociatedObjectMove",
                associatedObject
            );
        }

        (this.associatedObject1 === associatedObject 
            ? this.vertexObj1 
            : this.vertexObj2)
            .moveObjectWithoutConsequences(
                deltaX,
                deltaY,
                deltaZ
            );

        this.updateHeight();
    }
    
    handleAssociatedObjectPlace(associatedObject) {
        // check for association condition after placing object
    
        if(associatedObject !== this.associatedObject1 && associatedObject !== this.associatedObject2) {
            console.warn("Dimension.js: handleAssociatedObjectPlace(): Unknown associated object passed.")
        }

        if (!this.isDimensionValid()) {
            this.remove();
        }
        else if (!this.isMovingDirectionValid()) {
            this.toggleMovingDirection();
        }
    }

    handleAssociatedObjectUpdateGeometry(associatedObject) {
        // if association moves dimension might not be over edge, remove in that case
        // update height if not removed
        if (associatedObject !== this.associatedObject1 && associatedObject !== this.associatedObject2) {
            console.error(
                "ERROR: Dimension: associatedObject doesn't belong to this object in handleAssociatedObjectUpdateGeometry",
                associatedObject
            );
        }

        let vertex = this.associatedObject1 === associatedObject ? this.vertexObj1 : this.vertexObj2;    
       
        if (!getObjectsWithEdgeContainingPoint(vertex.getPosition(), this.stage).includes(associatedObject)) {
            this.remove();
        } 
        else {
            this.updateHeight();
        }        
    }

    
    // handle HTML text functions

    async handleValueUpdate(userEnteredValue) {
        const newMagnitude = (isMetricUnit()) ? userEnteredValue :
        convertImperialToMetric(parseImperialMeasurement(userEnteredValue));
        /* update magnitude by moving the vertex to the desired location.
        get vertices in order according to movable vertex */
        let vertex1 = this.vertexObj1.getPosition();
        let vertex2 = this.vertexObj2.getPosition();
        let associatedObject = this.associatedObject2;

        if (this.movableVertex === this.vertexObj1) {
            associatedObject = this.associatedObject1;
            vertex1 = this.vertexObj2.getPosition();
            vertex2 = this.vertexObj1.getPosition();
        }

        // get delta vector to move
        let magnitude = vertex1.distanceTo(vertex2);
        // Temp-hotfix, need to fix properly
        let delta
        if (this.stage.smartRoofSetbackEditMode.isEnabled() ||
            this.stage.setbackEditMode.isEnabled()) {
            delta = vertex2
               .clone()
               .sub(vertex1)
               .setLength(magnitude - newMagnitude);
        }
        else {
            delta = vertex2
            .clone()
            .sub(vertex1)
            .setLength(newMagnitude - magnitude);
        }
        if (this.stage.dragControls.isEditModeEnabled()) {
            this.stage.stateManager.startContainer()
            if (parseFloat(newMagnitude) === 0) {
                this.remove();
            }
            this.stage.stateManager.stopContainer();
            await this.stage.dragControls.handleValueUpdate(delta.x, delta.y, delta.z);
        }
        else if (this.stage.duplicateManager.isEditModeEnabled()) {
            await this.stage.duplicateManager.handleValueUpdate(delta.x, delta.y);
        }
        else if (this.stage.setbackEditMode.isEnabled()) {
            await this.stage.setbackEditMode.handleOnValueComplete(newMagnitude, delta, this);
        }
        else if (this.stage.smartRoofSetbackEditMode.isEnabled()) {
            await this.stage.smartRoofSetbackEditMode.handleOnValueComplete(newMagnitude, delta, this);
        }
        else {
            // TODO: Think about notification for multi select also
            let notificationObject;
            if (associatedObject instanceof PolygonModel) {
                notificationObject = this.stage.eventManager.setPolygonModelLoading();
            } 
    
            try {
                await associatedObject.placeObject(delta.x, delta.y, delta.z);
                this.stage.mergeManager.moveChildrenMesh(delta.x, delta.y, delta.z);
                //jugaad fix
                this.stage.selectionControls.setSelectedObject(this);
            } catch (e) {
                // TODO: error notification
            }
    
            if (associatedObject instanceof PolygonModel) {
                this.stage.eventManager.completePolygonModelLoading(notificationObject);
            }

            if (associatedObject instanceof Table) {
                associatedObject.getSubarray().mergeGeometriesForAllPanels();
            }

            if (parseFloat(newMagnitude) === 0) {
                this.remove();
                if(this.stage.selectionControls.getSelectedObject() === this) {
                    this.stage.selectionControls.setSelectedObject(this.stage.ground);
                }
            }
        }
    }

    handleOnCancel() {
        if (this.stage.dragControls.isEditModeEnabled()) {
            this.stage.dragControls.handleValueCancel();
        }
        else if (this.stage.duplicateManager.isEditModeEnabled()) {
            this.stage.duplicateManager.handleValueCancel();
        }
        else if (this.stage.setbackEditMode.isEnabled()) {
            this.stage.setbackEditMode.handleOnValueCancel();
        }
        else if (this.stage.smartRoofSetbackEditMode.isEnabled()) {
            this.stage.smartRoofSetbackEditMode.handleOnValueCancel();
        }
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

    handleTextDeSelection() {
        this.isTextSelected = false;
    }    

    
    // geometry functions

    updateHeight() {
        let [ firstObject, secondObject ] = this.getParentChildObjects();

        let parent = firstObject.getParent() === secondObject.getParent() ? firstObject.getParent()
                        : firstObject.getParent() === secondObject ? secondObject
                        : firstObject;

        let position = this.vertexObj1.getPosition();
        this.vertexObj1.setPosition(
            undefined,
            undefined,
            parent.getZOnTopSurface(position.x, position.y)
        );
        position = this.vertexObj2.getPosition();
        this.vertexObj2.setPosition(
            undefined,
            undefined,
            parent.getZOnTopSurface(position.x, position.y)
        );

        // update arrows
        this.update();

        if (!this.isTemporary) {
            this.saveState();
        }
    }

    cameraUpdate = () => {
        this.stage.addCameraUpdates(this.update);
    }

    update = () => {
        // calculate required parameter

        // get vertices vectors
        let vertex1 = this.vertexObj1.getPosition();
        let vertex2 = this.vertexObj2.getPosition();

        vertex1.z += this.heightOffset;
        vertex2.z += this.heightOffset;

        // magnitude
        let magnitude = vertex1.distanceTo(vertex2);

        // text angle
        let textAngle = 0;

        // adjustments for changing camera position        
        let headLength = 2 / this.stage.getNormalisedZoom();
        let headWidth = 1 / this.stage.getNormalisedZoom();

        // arrow direction
        let arrow1Direction = vertex1.clone().sub(vertex2).normalize();
        let arrow2Direction = arrow1Direction.clone().multiplyScalar(-1);

        // mid point of the line
        let midPoint = vertex1.clone().add(vertex2).divideScalar(2);

        // box direction from reference point
        let boxDirection = vertex2.clone().sub(midPoint).applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2).normalize();

        // reference point
        let origin = boxDirection.clone().multiplyScalar(0).add(midPoint);

        // update arrows
        const metricText = isMetricUnit() ? stringifyMetricMeasurement(magnitude) : stringifyImperialMeasurement(...convertMetricToImperial(magnitude));
        if (magnitude > this._ARROW_HELPER_ERROR_CONSTANT ||
            this.stage.setbackEditMode.isEnabled() ||
            this.stage.smartRoofSetbackEditMode.isEnabled()) {

            if (magnitude < (this._ARROW_HELPER_ERROR_CONSTANT + (2 * headLength))) {
                headLength = (magnitude - this._ARROW_HELPER_ERROR_CONSTANT) / 2;
            }

            this.arrowHelper1.setDirection(arrow1Direction);
            this.arrowHelper1.setLength(magnitude / 2, headLength, headWidth);
            this.arrowHelper1.position.copy(origin);
            this.arrowHelper2.setDirection(arrow2Direction);
            this.arrowHelper2.setLength(magnitude / 2, headLength, headWidth);
            this.arrowHelper2.position.copy(origin); 

            // update text
            this.textObject.update(
                metricText,
                origin,
                textAngle,
                boxDirection,
                10,
                this.stage.textSelectionControls.getSelectedTextObject() !== this.textObject,
            );
        } else {
            // update text
            this.textObject.update(
                metricText,
                undefined,
                undefined,
                undefined,
                undefined,
                this.stage.textSelectionControls.getSelectedTextObject() !== this.textObject,
            );
        }
    };

    getColorMap() {
        return COLOR_MAPPINGS
            .DIMENSION[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT];
    }

    updateHeadColor() {
        if (this.movableVertex === this.vertexObj1) {
            this.arrowHelper1.cone.material.color = this._movableArrowHeadColor.clone();
            this.arrowHelper2.setColor(this._onSelectLineColor);
            return true;
        } else if (this.movableVertex === this.vertexObj2) {
            this.arrowHelper2.cone.material.color = this._movableArrowHeadColor.clone();
            this.arrowHelper1.setColor(this._onSelectLineColor);
            return true;
        } else {
            console.error("ERROR: Dimensions: movableVertex is not vertexObject1 or vertexObject2 in updateHeadColor");
            return false;
        }
    }


    // properties update functions

    isMovingDirectionValid({ opposite } = { opposite: false }) {
        let [ firstObject, secondObject ] = this.getParentChildObjects();
        
        if (opposite) {
            [firstObject, secondObject] = [secondObject, firstObject];
        }

        return (this.movableVertex === this.vertexObj1 && secondObject.getParent() !== firstObject)
            || (this.movableVertex === this.vertexObj2 && firstObject.getParent() !== secondObject);
    }

    toggleMovingDirection() {                
        if (this.isMovingDirectionValid({ opposite : true })) {
            // toggle if both are movable vertices and also set movable vertex.
            this.movableVertex === this.vertexObj1
                ? this.setMovableVertex(this.vertexObj2)
                : this.setMovableVertex(this.vertexObj1);

            if (this.stage.selectionControls.getSelectedObjects().includes(this)) {
                this.updateHeadColor();
            }
        } 
        else {            
            this.stage.eventManager.toggleNotPossibleWarning();
        }
    }

    setMovableVertex(vertexObj) {
        if (vertexObj !== this.vertexObj1 && vertexObj !== this.vertexObj2) {
            console.error("ERROR: Dimension: vertexObj doesn't belong to this object");
        }
        this.movableVertex = vertexObj;
    }
    

    // helper function

    getId() {
        return this.id;
    }

    getParentChildObjects(associatedObject1, associatedObject2) {
        associatedObject1 = associatedObject1 === undefined ? this.associatedObject1 : associatedObject1;
        associatedObject2 = associatedObject2 === undefined ? this.associatedObject2 : associatedObject2;
        return [
            associatedObject1 instanceof Table ? associatedObject1.getSubarray() : associatedObject1,
            associatedObject2 instanceof Table ? associatedObject2.getSubarray() : associatedObject2
        ]
    }

    isDimensionValid(associatedObject1, associatedObject2) {
        associatedObject1 = associatedObject1 === undefined ? this.associatedObject1 : associatedObject1;
        associatedObject2 = associatedObject2 === undefined ? this.associatedObject2 : associatedObject2;

        if (associatedObject1 === associatedObject2) {
            // adding this condition
            // since tables are not selected now due to new
            // merged structure of subarrays.
            if (!(associatedObject1 instanceof Subarray) || !(associatedObject2 instanceof Subarray)) {
                return false;
            }
        }

        let [ firstObject, secondObject ] = this.getParentChildObjects(associatedObject1, associatedObject2);

        if (
            firstObject.getParent() === secondObject.getParent() ||
            firstObject.getParent() === secondObject ||
            secondObject.getParent() === firstObject
        ) {
            return true;
        }
        return false;
    }

    getMovingObject() {
        return this.movableVertex === this.vertexObj1 ? this.associatedObject1 : this.associatedObject2;
    }


    // universal functions

    onSelect() {
        this.highlight();
    }

    deSelect() {
        this.unHighlight();
    }

    enable() {
        // TODO: Enable arrow
        this.textObject.enable();
    }

    disable() {
        // TODO: Disable arrow
        this.textObject.disable();
    }

    enableTextSelection() {
        this.textObject.enableSelection();
    }

    disableTextSelection() {
        this.textObject.disableSelection();
    }

    remove({ shouldSaveState } = { shouldSaveState: true }) {
        
        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }

        // delete from dimensionObjects
        delete this.stage.dimensionObjects[this.getId()];

        this.hide();

        if (this.associatedObject1 instanceof BaseObject) this.associatedObject1.handleDimensionDeletion(this);
        if (this.associatedObject2 instanceof BaseObject) this.associatedObject2.handleDimensionDeletion(this);

        if (this.vertexObj1 instanceof OutlinePoints) {
            this.vertexObj1.removeObject()
            this.vertexObj1 = null;
        }
        if (this.vertexObj2 instanceof OutlinePoints) {
            this.vertexObj2.removeObject();
            this.vertexObj2 = null;
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);        
    }

    setTextEditable() {
        if (!this.isTextSelected) {
            this.stage.textSelectionControls.setSelectedTextObject(this.textObject, { shouldCreateContainer: false,
                shouldCompleteOnNoChange: true
            });
        }
    }

    focus() {
        this.textObject.focus();
    }

    focusAndSelectText() {
        this.textObject.focus();
        this.textObject.selectText();
    }

    highlight() {
        // always set line color first, just a guideline
        this.arrowHelper1.setColor(this._onSelectLineColor);
        this.arrowHelper2.setColor(this._onSelectLineColor);

        this.updateHeadColor();

        if (this.associatedObject1 instanceof Subarray) {
            this.associatedObject1.highlightEdges();
        }
        if (this.associatedObject2 instanceof Subarray) {
            this.associatedObject2.highlightEdges();
        }
    }

    unHighlight() {
        this.arrowHelper1.setColor(this._defaultArrowColor);
        this.arrowHelper2.setColor(this._defaultArrowColor);

        if (this.associatedObject1 instanceof Subarray) {
            this.associatedObject1.unHighlightEdges();
        }
        if (this.associatedObject2 instanceof Subarray) {
            this.associatedObject2.unHighlightEdges();
        }
    }

    switchVisualState() {
        // Do nothing for now
        return;
    }

    show() {
        // add to objects group
        if (this.stage.viewManager.areDimensionsVisible() && !this.stage.visualManager.getIn3D()) {
            if (this.completed || this.isTemporary) {
                this.textObject.show();
                this.stage.eventBus.addEventListener(CAMERA_UPDATED, this.cameraUpdate);
            }
            this.objectsGroup.visible = true;
        }
    }

    hide() {
        // remove only from objects group, different from remove() which deletes the threejs objects
        this.textObject.hide();
        this.stage.eventBus.removeEventListener(CAMERA_UPDATED, this.cameraUpdate);
        this.objectsGroup.visible = false;
    }

    showText() {
        this.textObject.show();
    }

    hideText() {
        this.textObject.hide();
    }        

    getSelectableObjects() {
        return new SelectionTree([this]);
    }

    getParentWiringZone() {
        return null;
    }

    static getObjectType() {
        return 'Dimension'
    }
}

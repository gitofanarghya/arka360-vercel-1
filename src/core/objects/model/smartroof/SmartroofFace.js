/* eslint-disable prefer-destructuring */
import * as THREE from 'three';
import RectangleObstruction from '../Rectangle';
import PolygonModel from '../PolygonModel';
import CylinderModel from '../CylinderModel';
import Subarray from '../../subArray/Subarray';
import OutlinePoints from '../../subObjects/OutlinePoints';
import PolygonMeasurement from '../../subObjects/PolygonMeasurement';
import * as JSTSConverter from '../../../utils/JSTSConverter';
import {
    getEdgesFromGeometry,
    getCommonSubarray,
    getCommonRows,
} from '../../../utils/subarrayUtils';
import Tree from '../Tree';
import ACDB from '../../ac/ACDB';
import DCDB from '../../ac/DCDB';
import SafetyLine from '../SafetyLine';
import Handrail from '../Handrail';
import AcCable from '../cable/AcCable';
import Walkway from '../Walkway';
import Inverter from '../../ac/Inverter';
import BaseObject from '../../BaseObject';
import FlatDormer from './dormers/FlatDormer';
import HippedDormer from './dormers/HippedDormer';
import {
    CREATED_STATE,
    DELETED_STATE,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    EDIT_SETBACK_INSIDE,
    RAFTER_ORIENTATION_PERPENDICULAR,
    RAFTER_ORIENTATION_PARALLEL,
    PANEL_ORIENTATION_PORTRAIT,
    EDIT_SETBACK_OUTSIDE,
    ATTACHMENT_ORIENTATION_PARALLEL,
    ATTACHMENT_RADIUS,
    COMPLEX_GEOMETRY_ERROR,
    OUT_OF_GROUND_ERROR,
    PANEL_ORIENTATION_LANDSCAPE,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    PANEL_TYPE_MONOCRYSTALLINE,
} from '../../../coreConstants';
import {

    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
} from '../../visualConstants';
import * as utils from '../../../utils/utils';
import * as raycastingUtils from '../../../utils/raycastingUtils';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';
import * as notificationsAssistant from '../../../../componentManager/notificationsAssistant';
import Dormer from './Dormer';
import DrawFace from './DrawFace';
import { SmartroofModel } from './SmartroofModel';
import { Vector3 } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import OuterEdge from './OuterEdge';
import TurretDormer from './dormers/TurretDormer';
import Edge from './Edge';
import gjk from 'gjk';

const MERGE_ROWS = 'MergeRows';
const ADD_TO_ROW = 'AddToRow';
const CREATE_NEW_ROW = 'CreateNewRow';

const MINIMUM_NUMBER_OF_POINTS = 3;
// eslint-disable-next-line import/prefer-default-export
export default class SmartroofFace extends BaseObject {
    constructor(stage, vertices = [], edge = [], tilt = 20, coreHeight = 5, setbackInside = [[]], fold = null, outerEdge = null) {
        super(stage);
        this.outerEdgeHeight = coreHeight;
        this.stage = stage;
        this.id = this.stage.getSmartroofFaceId();
        this.vertices = vertices;
        this.name = `Roof Face #${this.id.toString()}`;
        this.outlinePoints = [];
        this.innerLoops = [];
        this.convexHullCoordinates = [];
        this.convexHullCoordinates2D = [];
        this.children = [];
        this.isValid = true;
        this.oldVertices = [];
        this.mergePoints = [];
        this.intersectingEdges = [];
        if (fold) {
            this.fold = fold;
        }
        // else {
        //     this.parent = outerEdge.parent;
        // }
        this.edges = [];
        this.outerEdge = outerEdge;
        this.startNode = null;
        this.endNode = null;
        this.edge = edge;
        this.isSelected = false;
        this.tilt = utils.isNumber(tilt) ? tilt : 20;
        this.defaultTilt = utils.isNumber(parseFloat(this.tilt)) ? parseFloat(this.tilt) : 20;
        this.rafterEnabled = false;
        this.rafterOrientation = RAFTER_ORIENTATION_PERPENDICULAR;
        this.rafterSpacing = 24 * 0.0254; // default rafter spacing is 24 inches.
        this.rafterOffset = 0;
        // attachment defaults
        this.attachmentType = ATTACHMENT_ORIENTATION_PARALLEL;
        this.attachmentSpacingMultiplier = 1;
        this.updatedAttachmentRow = [];
        this.attachmentRow = [];
        this.isDeleted = false;
        this.outlineHeight = 0;
        this.coreHeight = coreHeight;
        this.selectedEdge = [];
        this.baseHeight = 0;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.debugGroup = new THREE.Group();
        this.objectsGroup.add(this.debugGroup);
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.rafterLineMaterial = new THREE.MeshBasicMaterial();
        this.rafterLineGeometry = createBufferGeometry();
        this.faceMesh = new THREE.Mesh();
        this.faceMesh.geometry = new THREE.BufferGeometry();
        // this.faceMesh.material = new THREE.MeshLambertMaterial({
        //     color: COLOR_MAPPINGS
        //         .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
        //         .MESH_COLOR,
        //     side: THREE.DoubleSide,
        // });
        this.faceMesh.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.4,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });
        this.faceMesh.visible = false;
        this.objectsGroup.add(this.faceMesh);
        this.rafterLineMeshObject = new THREE.Object3D();
        this.intersectionLinesGroup = new THREE.Group();
        this.intersectionLinesGroup.visible = false;
        this.debugGroup = new THREE.Group();
        this.debugGroup.visible = true;
        this.stage.sceneManager.scene.add(this.intersectionLinesGroup);
        this.stage.sceneManager.scene.add(this.debugGroup);
        this.objectsGroup.add(this.rafterLineMeshObject);

        this.railLineMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.railLineMeshObject = new THREE.Object3D();
        this.objectsGroup.add(this.railLineMeshObject);

        this.attachmentMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.attachmentObject = new THREE.Object3D();
        this.objectsGroup.add(this.attachmentObject);

        this.rafterLineMeshObject.visible = false;
        this.isDeleted = false;

        // setback material
        this.setbackMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .SETBACK_COLOR,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        this.setbackVertices = [[]];
        // setting outline points.
        for (let i = 0; i < vertices.length; i++) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
                this,
                this.stage,
            ));
            this.setbackVertices[0].push(new THREE.Vector3(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
            ));
        }

        if (vertices.length > 0) {
            this.setbackVerticesReset = true;
        }

        // this.polygonMeasurement = vertices.length > 0 ? new PolygonMeasurement([...this.outlinePoints], this, this.stage, false) : null;
        this.setbackInsideMesh = createMesh(
            createBufferGeometry(),
            this.setbackMaterial2D,
        );


        this.setbackInsideMesh.visible = false;
        this.objectsGroup.add(this.setbackInsideMesh);
        this.setbackInside = setbackInside;
        this.edgeTypes = [];
        this.ignored = false;
        this.placable = true;
        this.azimuth = null;
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        this.isSelected = false;
        this.interSectionPoints = [];
        this.lidarSamplePoints = [];
        this.editedVertices = vertices;
    }

    createFaceMesh() {
        this.disposeFaceMesh();
        this.faceMesh = new THREE.Mesh();
        this.faceMesh.geometry = new THREE.BufferGeometry();
        this.faceMesh.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.4,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });
        this.faceMesh.visible = this.isSelected;
        this.objectsGroup.add(this.faceMesh);
    }

    disposeFaceMesh() {
        if (this.faceMesh) {
            if (this.faceMesh.geometry) {
                this.faceMesh.geometry.dispose();
            }
            this.objectsGroup.remove(this.faceMesh);
        }
    }

    addMapTexture() {
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (
                modelObj instanceof SmartroofModel ||
                modelObj instanceof PolygonModel ||
                modelObj instanceof Dormer ||
                modelObj instanceof CylinderModel
            ) {
                modelObj.heatMapEnabled = this.heatMapEnabled;
                modelObj.heatMapTexture = this.heatMapTexture;
                modelObj.removeRoofTexture();
                modelObj.addMapTexture();
            }
        });
    }

    removeRoofTexture() {
        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (
                children[i] instanceof SmartroofModel ||
                children[i] instanceof PolygonModel ||
                children[i] instanceof Dormer ||
                children[i] instanceof CylinderModel
            ) {
                children[i].removeRoofTexture();
            }
        }
    }

    showRoofTexture() {
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (
                modelObj instanceof SmartroofModel ||
                modelObj instanceof PolygonModel ||
                modelObj instanceof Dormer ||
                modelObj instanceof CylinderModel ||
                modelObj instanceof SmartroofFace
            ) {
                modelObj.showRoofTexture();
            }
        });
    }
    hideRoofTexture() {
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel || modelObj instanceof SmartroofFace) {
                modelObj.hideRoofTexture();
            }
        });
    }

    getState() {
        const polygonData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            tilt: this.tilt,
            rafterEnabled: this.rafterEnabled,
            rafterOrientation: this.rafterOrientation,
            rafterSpacing: this.rafterSpacing,
            rafterOffset: this.rafterOffset,
            attachmentSpacingMultiplier: this.attachmentSpacingMultiplier,
            attachmentType: this.attachmentType,
            updatedAttachmentRow: this.updatedAttachmentRow.map(elem => ({
                offset: elem.offset,
                rowId: elem.rowId,
            })),
            attachmentRow: this.attachmentRow,
            isDeleted: this.isDeleted,
            azimuth: this.azimuth,
            isValid: this.isValid,
            coreHeight: this.coreHeight,
            setbackInside: this.setbackInside,
            ignored: this.ignored,
            placable: this.placable,
            plane: this.plane,
            outerPlane: this.outerPlane,
            edge: this.edge,
            editedVertices: this.editedVertices.map(editedVertex => [
                editedVertex.x,
                editedVertex.y,
                editedVertex.z,
            ]),

            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };
        return polygonData;
    }
    updateOldVertices() {
        this.oldVertices = [];
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.oldVertices.push(this.outlinePoints[i].getPosition());
        }
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load polygon properties
            this.attachmentSpacingMultiplier = state.attachmentSpacingMultiplier;
            this.attachmentType = state.attachmentType;
            this.updatedAttachmentRow = state.updatedAttachmentRow.map(elem => ({
                offset: elem.offset,
                rowId: elem.rowId,
            }));
            this.attachmentRow = state.attachmentRow;
            this.tilt = this.getValidTilt(state.tilt);
            this.rafterEnabled = state.rafterEnabled;
            this.rafterOrientation = state.rafterOrientation;
            this.rafterSpacing = state.rafterSpacing;
            this.rafterOffset = state.rafterOffset;
            this.isDeleted = state.isDeleted;
            this.azimuth = state.azimuth;
            this.setbackInside = state.setbackInside;
            this.isValid = state.isValid;
            this.ignored = state.ignored;
            this.placable = state.placable;
            this.coreHeight = state.coreHeight;
            if (!state.plane) {
                if (this.outerEdge) {
                    this.plane = this.outerEdge.facePlane;
                    this.outerPlane = this.outerEdge.wallPlane;
                }
                else if (this.fold) {
                    this.plane = this.fold.plane;
                }
                else {
                    this.plane = state.plane;
                    this.outerPlane = state.outerPlane;
                }
            }
            else {
                this.plane = state.plane;
                this.outerPlane = state.outerPlane;
            }
            this.edge = state.edge;
            this.updateVisualsAfterLoadingAndCreation();
            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);
                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                // create polygon measurement
                // if (this.isValid) {
                //     this.polygonMeasurement = new PolygonMeasurement(
                //         this.oldVertices,
                //         this, this.stage, false,
                //     );
                // }
            }
            else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            }
            else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // Remove outline points
                for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                }
                // remove measurements
                // if (this.polygonMeasurement) this.polygonMeasurement.remove();

                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                // create polygon measurement
                // if (this.isValid) {
                //     this.polygonMeasurement = new PolygonMeasurement(
                //         this.oldVertices,
                //         this, this.stage, false,
                //     );
                // }
            }
            else {
                console.error('PitchedRoof Face: loadState: Error in Loading Outline Points');
                return null;
            }

            // if (this.stage.selectionControls.getSelectedObject() === this) {
            //     // update polygon measurement
            //     // this.updatePolygonMeasurement();
            //     // this.polygonMeasurement.show();
            // }
            // update geometry
            this.editedVertices = [];
            state.editedVertices.forEach(x => {
                this.editedVertices.push(new THREE.Vector3(x[0],x[1],x[2]));
            })
            this.updatedEditedFace();
            this.updateSetback();
            this.updateGeometry();
            this.updateRafter();
            if (this.isValidFace()) {
                this.stage.quadTreeManager.handlePlaceObject(this);
                this.stage.ground.faces.add(this);
            }
        }
        return true;
    }

    snapChildDormers() {
        this.children.forEach((child) => {
            if (child instanceof SmartroofModel) {
                child.adjustTiltToParent();
                child.snapTemplateToParent();
                child.setRestrictions();
                child.children.forEach((grandChild) => {
                    grandChild.snapChildDormers();
                });
            }
        });
    }

    tiltChange(arg) {
        this.hideSetback();
        const validTilt = this.getValidTilt(arg);
        this.tilt = validTilt;
        if (this.fold) {
            this.fold.tilt = validTilt;
        }
        else {
            this.outerEdge.tilt = validTilt;
        }
        this.hideEdges();
        this.getParent().updateFacesWithNewAngles(false);
        this.showEdges();
    }

    heightChange(arg, setbackFlag = false) {
        this.hideSetback();
        this.outerEdge.changeHeight(arg - this.outerEdge.height);
        this.hideEdges();
        this.getParent().placeObject();
        this.showEdges();
    }

    getHeight() {
        if (this.outerEdge) {
            return this.outerEdge.height;
        }
        else if (this.fold) {
            return this.fold.getHeight();
        }
        return 0;
    }

    isParentDormer() {
        if (this.getParent()) {
            return this.getParent() instanceof Dormer;
        }
        else if (this.outerEdge) {
            return this.outerEdge.parent instanceof Dormer;
        }
        return false;
    }

    isParentFlatDormer() {
        if (this.getParent()) {
            return this.getParent().type === 'FlatDormer';
        }
        else if (this.outerEdge) {
            return this.outerEdge.parent.type === 'FlatDormer';
        }
        return false;
    }

    isParentTurretDormer() {
        if (this.getParent()) {
            return this.getParent() instanceof TurretDormer;
        }
        else if (this.outerEdge) {
            return this.outerEdge.parent instanceof TurretDormer;
        }
        return false;
    }

    getMinimumTilt() {
        return this.outerEdge ? this.outerEdge.belongsTo.minTilt : 0;
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);
        this.stage.ground.faces.delete(this);


        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        // remove measurements
        // if (this.polygonMeasurement) this.polygonMeasurement.remove();
    }

    exportAsSTL() {
        const allObjects = [];

        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const objects = children[i].exportAsSTL();
            allObjects.push(...objects);
        }

        return allObjects;
    }

    exportAsCollada() {
        const children = this.getChildren();
        const child = [];
        const subArrays = [];
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof Subarray) {
                const obj = children[i].exportAsCollada();
                subArrays.push(...obj);
            }
            else {
                const obj = children[i].exportAsCollada();
                child.push(obj.model);
                subArrays.push(...obj.subarray);
            }
        }

        return {
            child,
            subarray: subArrays,
        };
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: SmartroofFace.getObjectType(),
            children: [],
        };

        // save id and name
        polygonModelData.id = this.id;
        polygonModelData.name = this.name;
        if (isCopy) {
            polygonModelData.uuid = this.uuid;
        }
        polygonModelData.tilt = this.getValidTilt(this.tilt);
        polygonModelData.rafterEnabled = this.rafterEnabled;
        polygonModelData.rafterOrientation = this.rafterOrientation;
        polygonModelData.rafterSpacing = this.rafterSpacing;
        polygonModelData.rafterOffset = this.rafterOffset;
        polygonModelData.isDeleted = this.isDeleted;
        polygonModelData.coreHeight = this.coreHeight;
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.setbackInside = this.setbackInside;
        polygonModelData.attachmentSpacingMultiplier = this.attachmentSpacingMultiplier;
        polygonModelData.attachmentType = this.attachmentType;
        polygonModelData.updatedAttachmentRow = this.updatedAttachmentRow;
        polygonModelData.attachmentRow = this.attachmentRow;

        // polygonModelData.setbackOutside = this.setbackOutside;
        polygonModelData.ignored = this.ignored;
        polygonModelData.placable = this.placable;
        polygonModelData.isValid = this.isValid;
        if (this.outerEdge) {
            polygonModelData.outerEdgeId = this.outerEdge.id;
        }
        if (this.fold) {
            polygonModelData.foldId = this.fold.id;
        }

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            if (position) {
                outlinePoints.push([
                    position.x,
                    position.y,
                    position.z,
                ]);
            }
        }
        polygonModelData.outlinePoints = outlinePoints;
        // saving setbackVertices
        polygonModelData.setbackVertices = this.setbackVertices
            .map(polygon => polygon
                .map(vector => [vector.x, vector.y, vector.z]));

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        polygonModelData.errors = this.errors;
        return polygonModelData;
    }

    static validateObject(polygonModelData) {
        if (!polygonModelData.isValid) {
            return { isValid: true };
        }
        let allOutlinePointsZero = true;
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            if (!(polygonModelData.outlinePoints[i][0] === 0 &&
                    polygonModelData.outlinePoints[i][1] === 0 &&
                    polygonModelData.outlinePoints[i][2] === 0)) {
                allOutlinePointsZero = false;
                break;
            }
        }
        if (allOutlinePointsZero) {
            return { isValid: false };
        }

        if (polygonModelData.setbackInside === undefined) {
            polygonModelData.setbackInside = [[]];
        }
        return { isValid: true };
    }

    loadObject(polygonModelData, isPaste = false) {
        this.oldVertices = [];
        if (!SmartroofFace.validateObject(polygonModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Polygon data invalid: Polygon removed');
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = polygonModelData.id;
            this.name = polygonModelData.name;
        }

        // load polygon properties
        this.tilt = this.getValidTilt(polygonModelData.tilt);
        this.rafterEnabled = (polygonModelData.rafterEnabled === undefined) ? (this.rafterEnabled) : (polygonModelData.rafterEnabled);
        this.rafterOrientation = (polygonModelData.rafterOrientation === undefined) ? (this.rafterOrientation) : (polygonModelData.rafterOrientation);
        this.rafterSpacing = (polygonModelData.rafterSpacing === undefined) ? (this.rafterSpacing) : (polygonModelData.rafterSpacing);
        this.rafterOffset = (polygonModelData.rafterOffset === undefined) ? (this.rafterOffset) : (polygonModelData.rafterOffset);
        this.attachmentSpacingMultiplier = (polygonModelData.attachmentSpacingMultiplier === undefined) ? (this.attachmentSpacingMultiplier) : (polygonModelData.attachmentSpacingMultiplier);
        this.attachmentType = (polygonModelData.attachmentType === undefined) ? (this.attachmentType) : (polygonModelData.attachmentType);
        this.updatedAttachmentRow = (polygonModelData.updatedAttachmentRow === undefined) ? (this.updatedAttachmentRow) : (polygonModelData.updatedAttachmentRow);
        this.attachmentRow = (polygonModelData.attachmentRow === undefined) ? (this.attachmentRow) : (polygonModelData.attachmentRow);
        this.isDeleted = (polygonModelData.isDeleted === undefined) ? (this.tilt === 89.9) : polygonModelData.isDeleted;
        this.azimuth = polygonModelData.azimuth;
        this.coreHeight = polygonModelData.coreHeight;
        this.ignored = polygonModelData.ignored;
        this.placable = polygonModelData.placable;
        this.edge = polygonModelData.edge;
        this.outerEdgeHeight = polygonModelData.outerEdgeHeight;
        this.isValid = polygonModelData.isValid;
        if (polygonModelData.outerEdgeId) {
            this.outerEdgeId = polygonModelData.outerEdgeId;
        }
        if (polygonModelData.foldId) {
            this.foldId = polygonModelData.foldId;
        }

        // set outline points
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                polygonModelData.outlinePoints[i][0],
                polygonModelData.outlinePoints[i][1],
                polygonModelData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }
        this.updateOldVertices();

        // Setting the setback vertices

        // New design
        if (polygonModelData.setbackVertices &&
            Array.isArray(polygonModelData.setbackVertices) &&
            polygonModelData.setbackVertices.every(group => Array.isArray(group)) &&
            polygonModelData.setbackVertices.every(group => group
                .every(values => Array.isArray(values)))) {
            this.setbackVertices = polygonModelData.setbackVertices
                .map(polygon => polygon
                    .map(values => new THREE.Vector3(...values)));
            this.setbackInside = polygonModelData.setbackInside;
        }
        // Old design
        else if (Array.isArray(polygonModelData.outlinePoints)) {
            this.setbackVertices = [polygonModelData.outlinePoints
                .map(values => new THREE.Vector3(...values))];
            this.setbackInside = [polygonModelData.setbackInside];
        }
        else {
            console.error('unidentified design type', polygonModelData.setbackVertices, polygonModelData.outlinePoints);
        }

        // create polygon measurement
        // if (this.isValid) {
        //     this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage, false);
        // }

        // update geometry

        const tempVertices = [];
        const tempSavedVertices = [];

        this.oldVertices.forEach((vertex) => {
            tempVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        });
        this.oldVertices.forEach((vertex) => {
            tempSavedVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        });

        this.editedVertices = (tempSavedVertices.length > 0) ? tempSavedVertices : tempVertices;

        this.updateSetback();
        this.updateGeometry();

        // load children
        const { children } = polygonModelData;
        this.errors = polygonModelData.errors ? polygonModelData.errors : [];
        for (let i = 0, len = children.length; i < len; i += 1) {
            let currentObject;
            try {
                if (children[i].type === PolygonModel.getObjectType()) {
                    const polygonModel = new PolygonModel(this.stage);
                    currentObject = polygonModel;
                    this.addChild(polygonModel);
                    polygonModel.loadObject(children[i], isPaste);
                    if (polygonModel.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                }
                else if (children[i].type === RectangleObstruction.getObjectType()) {
                    const rectangleObstruction = new RectangleObstruction(this.stage);
                    currentObject = rectangleObstruction;
                    this.addChild(rectangleObstruction);
                    rectangleObstruction.loadObject(children[i], isPaste);
                    if (rectangleObstruction.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                }
                else if (children[i].type === TurretDormer.getObjectType()) {
                    const turretDormer = new TurretDormer(this.stage);
                    currentObject = turretDormer;
                    this.addChild(turretDormer);
                    turretDormer.loadObject(children[i], isPaste);
                    if (turretDormer.getParent() !== this) {
                        console.error('SmartRoof Dormer: Mismatch in parent while loading dormer');
                    }
                }
                else if (children[i].type === DrawFace.getObjectType()) {
                    const dormer = new DrawFace(this.stage);
                    currentObject = dormer;
                    this.addChild(dormer);
                    dormer.loadObject(children[i], isPaste);
                }
                else if (children[i].type === SmartroofModel.getObjectType() && children[i].dormerType === 'FlatDormer') {
                    const dormer = new DrawFace(this.stage);
                    currentObject = dormer;
                    dormer.isTemplate = true;
                    dormer.type = 'FlatDormer';
                    dormer.snapHeight = true;
                    dormer.tilt = 0;
                    dormer.minTilt = 0;
                    dormer.loadObjectFlatDormerBackwardsComp(children[i], isPaste);
                }
                else if (children[i].type === SmartroofModel.getObjectType()) {
                    const dormer = new SmartroofModel(this.stage);
                    currentObject = dormer;
                    this.addChild(dormer);
                    dormer.loadObject(children[i], isPaste);
                    if (dormer.getParent() !== this) {
                        console.error('SmartRoof Dormer: Mismatch in parent while loading dormer');
                    }
                }
                else if (children[i].type === Dormer.getObjectType()) {
                    const dormer = new SmartroofModel(this.stage);
                    currentObject = dormer;
                    this.addChild(dormer);
                    this.loadDormerBackwardsCompatibility(dormer, children[i]);
                    if (dormer.getParent() !== this) {
                        console.error('GabledDormer: Mismatch in parent while loading dormer');
                    }
                }
                else if (children[i].type === FlatDormer.getObjectType()) {
                    const dormer = new SmartroofModel(this.stage);
                    currentObject = dormer;
                    this.addChild(dormer);
                    this.loadDormerBackwardsCompatibility(dormer, children[i]);
                    if (dormer.getParent() !== this) {
                        console.error('FlatDormer: Mismatch in parent while loading dormer');
                    }
                }
                else if (children[i].type === HippedDormer.getObjectType()) {
                    const dormer = new SmartroofModel(this.stage);
                    currentObject = dormer;
                    this.addChild(dormer);
                    this.loadDormerBackwardsCompatibility(dormer, children[i]);
                    if (dormer.getParent() !== this) {
                        console.error('HippedDormer: Mismatch in parent while loading dormer');
                    }
                }
                else if (children[i].type === CylinderModel.getObjectType()) {
                    const cylinderModel = new CylinderModel(this.stage);
                    currentObject = cylinderModel;
                    this.addChild(cylinderModel);
                    cylinderModel.loadObject(children[i], isPaste);
                    if (cylinderModel.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                }
                else if (children[i].type === Tree.getObjectType()) {
                    const tree = new Tree(this.stage);
                    currentObject = tree;
                    this.addChild(tree);
                    tree.loadObject(children[i], isPaste);
                    if (tree.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                }
                else if (children[i].type === Inverter.getObjectType()) {
                    if (!isPaste) {
                        const inverter = new Inverter(this.stage);
                        currentObject = inverter;
                        this.addChild(inverter);
                        inverter.loadObject(children[i], isPaste);
                        if (inverter.getParent() !== this) {
                            console.error('PolygonModel: Mismatch in parent while loading Inverter');
                        }
                    }
                }
                else if (children[i].type === ACDB.getObjectType()) {
                    const acdb = new ACDB(this.stage);
                    currentObject = acdb;
                    this.addChild(acdb);
                    acdb.loadObject(children[i], isPaste);
                    if (acdb.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading ACDB');
                    }
                }
                else if (children[i].type === DCDB.getObjectType()) {
                    if (!isPaste) {
                        const dcdb = new DCDB(this.stage);
                        currentObject = dcdb;
                        this.addChild(dcdb);
                        dcdb.loadObject(children[i], isPaste);
                        if (dcdb.getParent() !== this) {
                            console.error('PolygonModel: Mismatch in parent while loading DCDB');
                        }
                    }
                }
                else if (children[i].type === Subarray.getObjectType()) {
                    const subarray = new Subarray(this.stage);
                    currentObject = subarray;
                    subarray.loadObject(children[i], this, isPaste).then(() =>
                    {this.updateRafter()});
                }
                else if (children[i].type === Walkway.getObjectType()) {
                    const walkway = new Walkway(this.stage);
                    currentObject = walkway;
                    this.addChild(walkway);
                    walkway.loadObject(children[i], isPaste);
                }
                else if (children[i].type === SafetyLine.getObjectType()) {
                    const safetyLine = new SafetyLine(this.stage);
                    currentObject = safetyLine;
                    this.addChild(safetyLine);
                    safetyLine.loadObject(children[i], isPaste);
                }
                else if (children[i].type === Handrail.getObjectType()) {
                    const handrail = new Handrail(this.stage);
                    currentObject = handrail;
                    this.addChild(handrail);
                    handrail.loadObject(children[i], isPaste);
                }
                else if (children[i].type === AcCable.getObjectType()) {
                    const acCable = new AcCable(this.stage);
                    currentObject = acCable;
                    this.addChild(acCable);
                    acCable.loadObject(children[i], isPaste);
                }
                else {
                    console.error('PolygonModel: Invalid object type in loadObject');
                }
            }
            catch (error) {
                console.error('Unable to load children of smartroof face', error);
                notificationsAssistant.error({
                    title: 'Load Error',
                    message: 'Error loading object. Please contact support.',
                });
                this.errors.push(children[i]);
                currentObject.removeObject();
            }
        }
        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    loadDormerBackwardsCompatibility(dormer, dormerLoadData) {
        dormer.baseHeight = dormerLoadData.baseHeight;
        let minHeight = dormerLoadData.coreHeight;
        for (let i = 0; i < dormerLoadData.outlinePoints.length; i += 1) {
            if (minHeight > dormerLoadData.outlinePoints[i][2]) {
                minHeight = dormerLoadData.outlinePoints[i][2];
            }
        }
        if (dormerLoadData.type === 'Flat Dormer') {
            dormerLoadData.outlinePoints.splice(2, 1);
            if (dormerLoadData.tilt < 0) {
                dormerLoadData.tilt = 0;
                dormer.tilt = 0;
            }
            else {
                dormer.tilt = dormerLoadData.tilt;
            }
        }
        else {
            dormer.tilt = dormerLoadData.tilt;
        }
        for (let i = 0; i < dormerLoadData.outlinePoints.length; i += 1) {
            dormerLoadData.outlinePoints[i][2] = minHeight;
        }
        dormer.coreHeight = minHeight;
        dormer.ignored = dormerLoadData.ignored;
        dormer.topHeight = dormerLoadData.topHeight;
        dormer.snapHeight = true;
        dormer.isTemplate = true;
        dormer.azimuth = dormerLoadData.azimuth;
        switch (dormerLoadData.type) {
        case 'Dormer':
            dormer.type = 'GabledDormer';
            break;
        case 'Hipped Dormer':
            dormer.type = 'HippedDormer';
            break;
        case 'Flat Dormer':
            dormer.type = 'FlatDormer';
            break;
        default:
            console.error('Invalid Dormer type');
        }

        // set outline points
        const { length } = dormerLoadData.outlinePoints;
        for (let i = length - 1; i > -1; i -= 1) {
            dormer.outlinePoints.push(new OutlinePoints(
                dormerLoadData.outlinePoints[i][0],
                dormerLoadData.outlinePoints[i][1],
                dormerLoadData.outlinePoints[i][2],
                dormer,
                dormer.stage,
            ));
        }

        // create polygon measurement
        dormer.polygonMeasurement = new PolygonMeasurement([...dormer.outlinePoints], dormer, dormer.stage);
        dormer.coreMesh.geometry.computeBoundingSphere();

        // load children
        const { children } = dormerLoadData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === SmartroofFace.getObjectType()) {
                const smartroofFace = new SmartroofFace(dormer.stage);
                dormer.addChild(smartroofFace);
                smartroofFace.loadObject(children[i]);
                children[i].outerEdgeHeight = dormer.coreHeight;
                children[i].coreHeight = dormer.coreHeight;
                if (smartroofFace.getParent() !== dormer) {
                    console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                }
            }
            else {
                console.error('PolygonModel: Invalid object type in loadObject');
            }
        }

        // Create outerEdge objects and their associated faces
        dormer.outerEdgeObjects = [];
        dormer.outerEdgesMesh = [];
        for (let i = 0, l = dormer.outlinePoints.length; i < l; i += 1) {
            const face = SmartroofFace.getFaceFromOutlinePoint(dormer, i);
            if (face) {
                const outerEdge = new OuterEdge(
                    dormer,
                    dormer.stage,
                    dormer.outlinePoints[i],
                    dormer.outlinePoints[(i + 1) % l],
                    i,
                    (i + 1) % l,
                    dormer.coreHeight,
                    !face.isDeleted,
                    this.getValidTilt(face.tilt),
                    face,
                );
                dormer.outerEdgeObjects.push(outerEdge);
            }
            else {
                const outerEdge = new OuterEdge(dormer, dormer.stage, dormer.outlinePoints[i], dormer.outlinePoints[(i + 1) % l], i, (i + 1) % l, dormer.coreHeight, true, this.getValidTilt(dormer.tilt));
                dormer.outerEdgeObjects.push(outerEdge);
                const deletedFace = outerEdge.smartRoofFace;
                outerEdge.isPitched = false;
                deletedFace.tilt = 90;
                outerEdge.tilt = 90;
                deletedFace.plane = deletedFace.outerPlane;
                deletedFace.isDeleted = true;
                deletedFace.isValid = false;
            }
        }
        dormer.updateSmartRoof();
    }

    static getFaceFromOutlinePoint(dormer, edgeIndex) {
        const faces = dormer.children;
        let face;
        switch (dormer.type) {
        case 'GabledDormer':
            switch (edgeIndex) {
            case 0:
                face = faces.find(f => f.edge[0] === 3);
                break;
            case 3:
                face = faces.find(f => f.edge[0] === 0);
                break;
            default:
                face = null;
            }
            break;
        case 'HippedDormer':
            switch (edgeIndex) {
            case 0:
                face = faces.find(f => f.edge[0] === 3);
                break;
            case 3:
                face = faces.find(f => f.edge[0] === 0);
                break;
            case 4:
                face = faces.find(f => f.edge[0] === 4);
                break;
            default:
                face = null;
            }
            break;
        case 'FlatDormer':
            switch (edgeIndex) {
            case 1:
                face = faces[0];
                break;
            default:
                face = null;
            }
            break;
        default:
            console.error('No valid template passed');
        }
        return face;
    }

    getSetbackValuesForMirror(commonEdges = utils.getEdgesWithPanelsAround(this.stage.ground)) {
        const setbackValues = this.setbackInside.map(arr => arr.slice());
        const faceEdge = this.getSetbackEdges();
        let edgesWithSetback = [];
        // get common edges with faces with panel and make setback just for those edges
        if (!this.hasPanel() && !this.isDeleted && this.isValid) {
            for (let i = 0; i < faceEdge.length; i++) {
                if (!faceEdge[i]) {
                    continue;
                }
                edgesWithSetback = utils.intersectOfVectorArrays(commonEdges, faceEdge[i]);
                edgesWithSetback.sort((a, b) => a - b);
                let j = 0;
                for (let a = 0; a < setbackValues[i].length; a++) {
                    if (a === edgesWithSetback[j]) {
                        const obj = utils.getObjectAdjacentToEdge(faceEdge[i][a], this.stage);
                        const topobj1 = obj[0][0][0] instanceof Subarray ? obj[0][1][0] : obj[0][0][0];
                        const topobj2 = obj[1][0][0] instanceof Subarray ? obj[1][1][0] : obj[1][0][0];
                        const faces = this.getFacesFromEdge(faceEdge[i][a]);
                        if (faces.length > 0) {
                            if (topobj1.id !== topobj2.id) {
                                if (!(faces[0].hasPanel() && faces[1].hasPanel())) {
                                    setbackValues[i][a] = 0.001;
                                }
                            }
                        }
                        j++;
                    }
                    else {
                        setbackValues[i][a] = 0.001;
                    }
                    if (setbackValues[i][a] < 0.001) {
                        setbackValues[i][a] = 0.001;
                    }
                }
            }
        }
        return setbackValues;
    }

    static checkOccurrence(array, element) {
        const arr = [];
        for (let i = 0; i <= array.length; i++) {
            if (array[i] === element) {
                arr.push(i);
            }
        }
        return arr;
    }

    getValidTilt(tilt) {
        const validTilt = utils.isNumber(parseFloat(tilt)) ? parseFloat(tilt) : this.defaultTilt;
        return validTilt;
    }

    /**
     * It takes an edge as an argument and returns an array of faces that are adjacent to that edge.
     * @param edge - THREE.Line
     * @returns The faces that are adjacent to the edge.
     */
    getFacesFromEdge(edge) {
        const points = utils.getPointsOnLeftRightOfEdge(edge);
        const obj = utils.getObjectAdjacentToEdge(edge, this.stage);
        const faces = [];
        for (let index = 0; index < obj.length; index++) {
            let topObject = obj[index][0][0];
            if (topObject instanceof Subarray) {
                topObject = obj[index][1][0];
            }
            const raycaster = new THREE.Raycaster();
            if (topObject instanceof SmartroofModel || topObject instanceof Dormer) {
                raycaster.params.Line.threshold = 0.5 / this.stage.getNormalisedZoom();
                raycaster.params.Points.threshold = 2 / this.stage.getNormalisedZoom();
                const vec = new THREE.Vector3(points[index].x, points[index].y, 0);
                vec.project(this.stage.cameraManager.camera);

                raycaster.setFromCamera(vec, this.stage.cameraManager.camera);
                for (let i = 0; i < topObject.getChildren().length; i += 1) {
                    if (topObject.getChildren()[i].isDeleted) continue;
                    const intersects = raycaster.intersectObject(topObject.getChildren()[i].faceMesh, true);
                    if (intersects.length > 0) {
                        faces.push(topObject.getChildren()[i]);
                    }
                }
            }
            else if (topObject instanceof DrawFace) {
                for (let i = 0; i < topObject.outerEdgeObjects.length; i += 1) {
                    const intersects = raycaster.intersectObject(topObject.outerEdgeObjects[i].outerEdgeMesh, true);
                    if (intersects.length > 0) {
                        faces.push(topObject.outerEdgeObjects[i].smartroofFace);
                    }
                }
            }
        }
        if (faces[0] && faces[1]) {
            return faces;
        }
        return [];
    }

    removeSetbackOnLowerEdges() {
        if (!this.isDeleted && this.hasPanel()) {
            try {
                for (let i = 0; i < this.edgeTypes.length; i++) {
                    const edgeType = [...this.edgeTypes[i]];
                    const eavePos = SmartroofFace.checkOccurrence(edgeType, 'Eave');
                    if (eavePos.length > 1) {
                        let isValidSubset = true;
                        let temp = [];
                        const firstSubset = [];
                        let first = true;
                        let finalArr = [];
                        for (let j = 0; j < edgeType.length; j++) {
                            if (edgeType[j] === 'Eave') {
                                first = false;
                                isValidSubset = true;
                                if (temp.length > 0) {
                                    finalArr = finalArr.concat(temp);
                                    for (let k = 0; k < temp.length; k++) {
                                        const faces = this.getFacesFromEdge([...this.setbackEdges[i][temp[k]]]);
                                        if (faces.length > 0) {
                                            if (!(faces[0].hasPanel() && faces[1].hasPanel())) {
                                                this.setbackInside[i][temp[k]] = 0.001;
                                            }
                                        }
                                    }
                                    temp = [];
                                }
                                continue;
                            }
                            else if (edgeType[j] === 'Hip' || edgeType[j] === 'Ridge') {
                                isValidSubset = false;
                                temp = [];
                            }
                            else if (isValidSubset) {
                                if (first) {
                                    firstSubset.push(j);
                                }
                                else {
                                    temp.push(j);
                                }
                            }
                            if (j === (edgeType.length - 1)) {
                                if (temp.length > 0) {
                                    finalArr = finalArr.concat(temp);
                                    if (isValidSubset) {
                                        temp = temp.concat(firstSubset);
                                    }
                                    for (let k = 0; k < temp.length; k++) {
                                        this.setbackInside[i][temp[k]] = 0.001;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error removing Setback On lower face');
            }
        }
    }

    classifyEdges(eave = 0.001, rake = 0.001, ridge = 0.001, hip = 0.001, valley = 0.001) {
        if (!this.isDeleted && this.isValid) {
            this.debugGroup.clear();
            const edges = this.getParent().getEdges();
            const faceEdge = this.getSetbackEdges();
            this.edgeTypes = [];
            for (let i = 0; i < faceEdge.length; i++) {
                const edgeTypeVals = [];
                for (let j = 0; j < faceEdge[i].length; j++) {
                    if (utils.isEave(faceEdge[i][j], edges,utils.convertVectorToArray(this.parent.oldVertices))) {
                        this.setbackInside[i][j] = eave;
                        edgeTypeVals.push('Eave');
                    }
                    else if (utils.isRack(faceEdge[i][j], edges, this.stage)) {
                        this.setbackInside[i][j] = rake;
                        edgeTypeVals.push('Rack');
                    }
                    else if (utils.isRidge(faceEdge[i][j], this.tilt, this.stage)) {
                        this.setbackInside[i][j] = ridge;
                        edgeTypeVals.push('Ridge');
                    }
                    else if (utils.isHip(faceEdge[i][j], this.stage)) {
                        this.setbackInside[i][j] = hip;
                        edgeTypeVals.push('Hip');
                    }
                    else if (utils.isValley(faceEdge[i][j], this.stage)) {
                        this.setbackInside[i][j] = valley;
                        edgeTypeVals.push('Valley');
                    }
                    else {
                        edgeTypeVals.push('NaN');
                    }
                }
                this.edgeTypes.push(edgeTypeVals);
            }
        }
    }

    debugger(faceEdge, color) {
        const [start, end] = faceEdge;
        const dir = new THREE.Vector3().subVectors(end, start);
        const length = dir.length();
        dir.normalize();

        const hex = color;

        const arrowHelper = new THREE.ArrowHelper(dir, start, length, hex);
        this.debugGroup.add(arrowHelper);
    }

    getSetbackInsideGeometry() {
        this.innerLoops = [];
        this.setbackEdges = [];
        this.intersectionLinesGroup.clear();
        // create setbackInside
        const vertices2DVectorArrays = this.setbackVertices;
        if (vertices2DVectorArrays[0] && vertices2DVectorArrays[0].length < 3) {
            return new THREE.BufferGeometry();
        }
        const setbackInsideGeometries = [];
        let ofEqualLengths = true;
        for (let index = 0; index < this.setbackInside.length; index++) {
            if (Array.isArray(this.setbackVertices[index]) &&
                Array.isArray(this.setbackInside[index]) &&
                this.setbackVertices[index].length !== this.setbackInside[index].length) {
                ofEqualLengths = false;
                break;
            }
        }
        if (this.setbackInside.length !== this.setbackVertices.length || !ofEqualLengths) {
            this.setbackInside = [[]];
            this.setbackVerticesReset = false;
        }
        if (this.setbackInside && (this.setbackInside[0] && !this.setbackInside[0].length)) {
            const setbackArray = [];
            for (let i = 0, len = vertices2DVectorArrays.length; i < len; i += 1) {
                const vertices2DVectorArray = vertices2DVectorArrays[i];
                const setbackValues = [];
                for (let j = 0, lenn = vertices2DVectorArray.length; j < lenn; j += 1) {
                    setbackValues.push(0.5);
                }
                setbackArray.push(setbackValues);
            }

            this.setbackInside = setbackArray;
        }
        const fallback = [...this.setbackInside];
        this.fallback = fallback;

        const setBackShapes = [];
        this.setbackInsideVerts = [];

        for (let q = 0, len = vertices2DVectorArrays.length; q < len; q += 1) {
            const vertices2DVectorArray = vertices2DVectorArrays[q];
            const setbackVectorArray = this.setbackVertices[q];
            const setbackInsideArray = setbackVectorArray.map(vector => [vector.x, vector.y]);
            const setbackValuesArray = this.setbackInside[q];

            const setbackEdgesArray = [];
            for (let i = 0; i < setbackVectorArray.length - 1; i += 1) {
                setbackEdgesArray.push([
                    setbackVectorArray[i],
                    setbackVectorArray[i + 1],
                ]);
            }

            if (setbackVectorArray.length > 2 &&
                (setbackVectorArray[setbackVectorArray.length - 1].x !== setbackVectorArray[0].x ||
                    setbackVectorArray[setbackVectorArray.length - 1].y !== setbackVectorArray[0].y)) {
                setbackEdgesArray.push([
                    setbackVectorArray[setbackVectorArray.length - 1],
                    setbackVectorArray[0],
                ]);
            }

            if (setbackValuesArray) {
                const edgeSetbackInsideValues = setbackValuesArray.map(item =>
                    item);
                let setbackInsideVectorPoints;
                let outsideFlag;
                try {
                    outsideFlag = utils.checkClockwise(setbackInsideArray);
                    const setbacktype = outsideFlag ? EDIT_SETBACK_OUTSIDE : EDIT_SETBACK_INSIDE;
                    setbackInsideVectorPoints = utils.newBuffer(
                        edgeSetbackInsideValues,
                        setbackInsideArray,
                        setbacktype,
                    );
                }
                catch (error) {
                    console.error('ERROR: Setback Inside: Complex Inside Setback generation not supported.');
                    return new THREE.BufferGeometry();
                }
                const setbackPoints2DVector = setbackInsideVectorPoints
                    .map(loop => loop
                        .map(coordinate => new THREE.Vector2(coordinate.x, coordinate.y)));

                this.setbackInsideVerts.push(...setbackPoints2DVector);

                const setbackInsideShape = outsideFlag ?
                    new THREE.Shape(setbackPoints2DVector[0]) :
                    new THREE.Shape(vertices2DVectorArray);

                if (outsideFlag) this.innerLoops.push(setbackPoints2DVector[0].map(v => [v.x, v.y]));

                if (Array.isArray(setbackPoints2DVector) &&
                    setbackPoints2DVector.length &&
                    setbackPoints2DVector.every(loop => Array.isArray(loop))) {
                    if (outsideFlag) {
                        setbackInsideShape.holes = [];
                        setbackInsideShape.holes.push(new THREE.Path(vertices2DVectorArray));
                    }
                    else {
                        setbackInsideShape.holes = [];
                        setbackPoints2DVector.forEach((loop) => {
                            if (loop.length > 2) {
                                setbackInsideShape.holes.push(new THREE.Path(loop));
                            }
                        });
                    }
                }
                const setbackInsideGeometry = new THREE.ShapeGeometry(setbackInsideShape);
                setbackInsideGeometry.translate(0, 0, 5);
                setbackInsideGeometries.push(setbackInsideGeometry);

                setBackShapes.push(setbackInsideShape);
            }
            this.setbackEdges.push(setbackEdgesArray);
        }

        let setbackInsideGeometry;
        if (setbackInsideGeometries.length === 0) {
            setbackInsideGeometry =  new THREE.BufferGeometry(new THREE.ShapeGeometry(new THREE.Shape()));
        }
        else {
            setbackInsideGeometry = BufferGeometryUtils
            .mergeGeometries(setbackInsideGeometries);
        }
        // Add geometries to geometry
        // // setbackInsideGeometry.vertices = [];
        // for (let index = 0; index < setbackInsideGeometry.attributes.position.count; index++) {
        //     const vertex = new THREE.Vector3(
        //         setbackInsideGeometry.attributes.position.array[(3 * index)],
        //         setbackInsideGeometry.attributes.position.array[(3 * index) + 1],
        //         setbackInsideGeometry.attributes.position.array[(3 * index) + 2],
        //     );
        //     setbackInsideGeometry.vertices.push(vertex);
        // }

        // for (let k = 0; k < setbackInsideGeometries.length; k++) {
        //     const hexForFace = 0xff0000 + Math.floor(Math.random() * 0x00ffff);
        //     const InsideGeometry = setbackInsideGeometries[k];
        //     for (let index = 0; index < InsideGeometry.attributes.position.count; index += 3) {
        //         const vertex1 = new THREE.Vector3(
        //             InsideGeometry.attributes.position.array[(3 * index)],
        //             InsideGeometry.attributes.position.array[(3 * index) + 1],
        //             InsideGeometry.attributes.position.array[(3 * index) + 2],
        //         );
        //         const vertex2 = new THREE.Vector3(
        //             InsideGeometry.attributes.position.array[(3 * (index + 1))],
        //             InsideGeometry.attributes.position.array[(3 * (index + 1)) + 1],
        //             InsideGeometry.attributes.position.array[(3 * (index + 1)) + 2],
        //         );
        //         const vertex3 = new THREE.Vector3(
        //             InsideGeometry.attributes.position.array[(3 * (index + 2))],
        //             InsideGeometry.attributes.position.array[(3 * (index + 2)) + 1],
        //             InsideGeometry.attributes.position.array[(3 * (index + 2)) + 2],
        //         );
        //         {
        //             const arrowVector = new THREE.Vector3().subVectors(vertex2, vertex1);
        //             const length = arrowVector.length();
        //             arrowVector.normalize();
        //             const arrowHelper = new THREE.ArrowHelper( arrowVector, vertex1, length, hexForFace);
        //             this.intersectionLinesGroup.add(arrowHelper);
        //         }
        //         {
        //             const arrowVector = new THREE.Vector3().subVectors(vertex3, vertex2);
        //             const length = arrowVector.length();
        //             arrowVector.normalize();
        //             const arrowHelper = new THREE.ArrowHelper( arrowVector, vertex2, length, hexForFace);
        //             this.intersectionLinesGroup.add(arrowHelper);
        //         }
        //         {
        //             const arrowVector = new THREE.Vector3().subVectors(vertex1, vertex3);
        //             const length = arrowVector.length();
        //             arrowVector.normalize();
        //             const arrowHelper = new THREE.ArrowHelper( arrowVector, vertex3, length, hexForFace);
        //             this.intersectionLinesGroup.add(arrowHelper);
        //         }
        //     }
        // }

        setbackInsideGeometry.parameters = { shapes: setBackShapes };

        return setbackInsideGeometry;
    }

    getEdges() {
        const vertices = utils.convertArrayToVector(this.get2DVertices());
        const edges = [];
        for (let i = 0; i < vertices.length - 1; i += 1) {
            edges.push([
                vertices[i],
                vertices[i + 1],
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[vertices.length - 1].x !== vertices[0].x ||
                vertices[vertices.length - 1].y !== vertices[0].y)) {
            edges.push([
                vertices[vertices.length - 1],
                vertices[0],
            ]);
        }

        return edges;
    }

    async updateObject(properties, flag = false) {
        let updateGeometryRequired = false;
        // let handleChildrenRequired = false;
        let tiltChanged = false;
        const options = {
            heightChanged: false,
            prevHeight: null,
            parapetHeightChanged: false,
            prevParapetHeight: null,
            parapetThicknessChanged: false,
        };

        if (Object.prototype.hasOwnProperty.call(properties, 'name') &&
            properties.name !== this.name) {
            this.name = properties.name;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'height') &&
            properties.height != this.getHeight()) {
                this.heightChange(properties.height, true);
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt != parseFloat(this.tilt).toFixed(2)) {
            updateGeometryRequired = updateGeometryRequired || true;
            // handleChildrenRequired = true;
            const validTilt = this.getValidTilt(properties.tilt);
            this.tilt = validTilt;
            if (this.fold) {
                this.fold.updateTilt(validTilt);
            }
            else {
                this.outerEdge.tilt = validTilt;
            }
            tiltChanged = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'rafterEnabled') &&
            properties.rafterEnabled !== this.rafterEnabled) {
            updateGeometryRequired = updateGeometryRequired || true;                
            this.rafterEnabled = properties.rafterEnabled;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'rafterOrientation') &&
            properties.rafterOrientation !== this.rafterOrientation) {
            updateGeometryRequired = updateGeometryRequired || true;                
            this.rafterOrientation = properties.rafterOrientation;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'rafterSpacing') &&
            properties.rafterSpacing !== this.rafterSpacing) {
            updateGeometryRequired = updateGeometryRequired || true;                
            this.rafterSpacing = properties.rafterSpacing;
            this.updatedAttachmentRow = [];
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'attachmentType') &&
            properties.attachmentType !== this.attachmentType) {
            updateGeometryRequired = updateGeometryRequired || true;                
            this.attachmentType = properties.attachmentType;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'attachmentSpacingMultiplier') &&
            properties.attachmentSpacingMultiplier !== this.attachmentSpacingMultiplier) {
            updateGeometryRequired = updateGeometryRequired || true;                
            this.attachmentSpacingMultiplier = properties.attachmentSpacingMultiplier;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'placable') &&
            properties.placable !== this.placable) {
            updateGeometryRequired = updateGeometryRequired || false;
            this.placable = properties.placable;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            updateGeometryRequired = updateGeometryRequired || true;

            if (properties.setbackInside !== 'custom') {
                const setbackValues = [];
                for (let i = 0, len = this.setbackVertices.length; i < len; i += 1) {
                    const vertices2DVectorArray = this.setbackVertices[i];
                    const setbackArray = [];
                    for (let j = 0, lenn = vertices2DVectorArray.length; j < lenn; j += 1) {
                        setbackArray.push(properties.setbackInside);
                    }
                    setbackValues.push(setbackArray);
                }
                this.setbackInside = setbackValues;
            }
        }
        if (tiltChanged || flag) {
            this.getParent().updateFacesWithNewAngles();
        }
        if (updateGeometryRequired) {
            try {
                this.handlePropertiesUpdate(options);
            }
            catch (error) {
                console.error('ERROR: PolygonModel: Update failed', error);
                return Promise.reject(error);
            }
        }

        if (this.isSelected) {
            this.onSelect();
        }
        this.editedVertices = this.vertices;
        this.stage.mergeManager.mergeScene(this);
        return Promise.resolve(true);
    }

    updateOutlinePoints(vertices, place = true) {
        let flag = false;
        if (this.oldVertices && vertices) flag = this.oldVertices.length === vertices.length;
        this.oldVertices = vertices;
        this.outlinePoints.forEach((outlinePoint) => {
            outlinePoint.removeObject();
        });
        this.outlinePoints = [];
        this.setbackVertices = [[]];
        if (vertices) {
            for (let i = 0; i < vertices.length; i++) {
                this.outlinePoints.push(new OutlinePoints(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                    this,
                    this.stage,
                ));
                this.setbackVertices[0].push(new THREE.Vector3(
                    vertices[i].x,
                    vertices[i].y,
                    vertices[i].z,
                ));
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {
                // if (this.polygonMeasurement != null && flag) this.updatePolygonMeasurement();
                // else this.createPolygonMeasurement();
                this.showMeasurement();
                const selectionOutLinePoints = this.outlinePoints;
                for (let i = 0; i < selectionOutLinePoints.length; i += 1) {
                    selectionOutLinePoints[i].showObject();
                }
            }
            this.azimuth = this.findAzimuth();
            if (place) {
                if (this.isValidFace() ) {
                    this.stage.quadTreeManager.handlePlaceObject(this);
                }
                else {
                    this.stage.quadTreeManager.removeObject(this);
                }
            }
            if(this.isValidFace()) {
                this.stage.ground.faces.add(this);
            }
            else {
                this.stage.ground.faces.delete(this);
            }

            // TODO: Jugaad, fix for moveObject of safety line and handrail
            utils.updateHandrailAndSafetyLineForMove(this);
        }
        else {
            this.hideMeasurement();
            this.stage.quadTreeManager.removeObject(this);
            this.stage.ground.faces.delete(this);
        }
        if (this.rafterEnabled && !this.stage.visualManager.in3D) {
            this.updateRafter();
            this.showRafter();
        }
        if(this.editedVertices.length === 0 && vertices) {
            this.editedVertices = vertices;
        }

        // this.setbackVerticesReset = true;
    }

    updatePolygonMeasurement() {
        let countBefore = 0;
        if (this.polygonMeasurement) countBefore = this.polygonMeasurement.lengthElements.length;
        this.updateOldVertices();
        const countAfter = this.oldVertices.length;
        if (this.polygonMeasurement && countBefore === countAfter) this.polygonMeasurement.updateMeasurements(this.oldVertices);
        else this.createPolygonMeasurement();
        this.updateRafter();
    }
    createPolygonMeasurement() {
        if (this.polygonMeasurement) {
            this.polygonMeasurement.remove();
        }

        if (!this.isValid || this.isDeleted || this.oldVertices.length < 3) {
            return;
        }
        try {
            this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage, false);
        }
        catch (e) {
            console.error('ERROR: Smartroof face: createPolygonMeasurement failed', e);
        }
        this.updateRafter();
    }

    handlePropertiesUpdate() {
        this.updateSetback();
        this.updateGeometry();
        this.updateRafter();
    }

    getInsideSetbackPolygons() {
        const polygons = [];
        if (this.setbackInsideMesh.geometry.parameters) {
            const { shapes } = this.setbackInsideMesh.geometry.parameters;
            shapes.forEach((shape) => {
                polygons.push({
                    vertices: shape.getPoints(),
                    holeVertices: shape.getPointsHoles(),
                });
            });
        }
        return polygons;
    }

    getDrawableFaceForRafter() {
        const shells = [];
        const holes = [];
        this.setbackVertices.forEach((loop) => {
            const array2d = loop.map(v => [v.x, v.y, v.z]);
            if (utils.checkClockwise(array2d)) holes.push(array2d);
            else shells.push(array2d);
        });
        const children = this.getChildren().filter(sibling => (
            sibling !== this &&
                (
                    sibling instanceof Dormer ||
                    sibling instanceof PolygonModel ||
                    sibling instanceof CylinderModel
                )
        ));
        children.forEach((child) => {
            holes.push(child.get3DVertices());
        });
        const shellLength = shells.length;
        const holeLength = holes.length;
        const finalEdgesForRafter = [];
        const finalVerticesForRafter = [];
        if (holes.length > 0 || shells.length > 1) {
            for (let i = 0; i < shellLength; i += 1) {
                const shellJstsPolygon = JSTSConverter.verticesToJSTSPolygon(shells[i]);
                let preciseShellFace = utils.getReducedPrecisionJSTSGeometry(shellJstsPolygon);
                for (let j = 0; j < holeLength; j += 1) {
                    const holeJstsPolygon = JSTSConverter.verticesToJSTSPolygon(holes[j]);
                    const preciseHoleFace = utils.getReducedPrecisionJSTSGeometry(holeJstsPolygon);
                    if (holeJstsPolygon.intersects(shellJstsPolygon) ||
                    holeJstsPolygon.within(shellJstsPolygon)) {
                        const shellWithHole = preciseShellFace.difference(preciseHoleFace);
                        preciseShellFace = shellWithHole;
                    }
                }
                const finalShellEdges = getEdgesFromGeometry(preciseShellFace);
                const finalShellVertices = shells[i].map(e => [e[0], e[1]]);
                finalShellVertices.push([shells[i][0][0], shells[i][0][1]]);
                finalEdgesForRafter.push(finalShellEdges);
                finalVerticesForRafter.push(finalShellVertices);
            }
            return finalEdgesForRafter;
        }
        return this.getSetbackEdges();
    }
    updateRafterLines() {

        let RafterEdges = [];
        RafterEdges = this.getDrawableFaceForRafter();

        this.bBox = utils.getBoundingBox(this.get3DVertices());
        const points = [];
        const newPoints = [];

        const centroidX = (this.bBox.max.x + this.bBox.min.x) / 2;
        const centroidY = (this.bBox.max.y + this.bBox.min.y) / 2;
        const radius = new THREE.Vector3(centroidX, centroidY, 0).distanceTo(new THREE.Vector3(this.bBox.max.x, this.bBox.max.y, 0));

        points.push(new THREE.Vector3(centroidX + radius, centroidY - radius, 0));
        points.push(new THREE.Vector3(centroidX + radius, centroidY + radius, 0));
        points.push(new THREE.Vector3(centroidX - radius, centroidY + radius, 0));
        points.push(new THREE.Vector3(centroidX - radius, centroidY - radius, 0));
        points.push(new THREE.Vector3(centroidX + radius, centroidY - radius, 0));


        const finalPoints = [];
        let numberOfLines;
        let startXY;
        // convertValue will convert the inches into meter value
        // (24'OC inches calculated on centre of rafters)
        // by multiplying with converting formula; inches * 0.0254
        // not required now, use this.rafterSpacing automatically.
        this.convertRafterSpacingValue = this.rafterSpacing;
        // Todo : refactor
        if (this.rafterOrientation === RAFTER_ORIENTATION_PARALLEL) {
            numberOfLines = Math.abs(Math.round((points[0].y - points[1].y) / this.convertRafterSpacingValue));
            startXY = points[0].y + this.rafterOffset;
            for (let i = 0; i <= numberOfLines; i += 1) {
                finalPoints.push(new THREE.Vector3(points[0].x, startXY, 0));
                finalPoints.push(new THREE.Vector3(points[2].x, startXY, 0));
                startXY += this.convertRafterSpacingValue;
            }
        }
        else {
            numberOfLines = Math.abs(Math.round((points[0].x - points[2].x) / this.convertRafterSpacingValue));
            startXY = points[0].x + this.rafterOffset;
            for (let i = 0; i <= numberOfLines; i += 1) {
                finalPoints.push(new THREE.Vector3(startXY, points[0].y, 0));
                finalPoints.push(new THREE.Vector3(startXY, points[2].y, 0));
                startXY -= this.convertRafterSpacingValue;
            }
        }


        for (let i = 0, len = finalPoints.length; i < len; i += 1) {
            const x = finalPoints[i].x;
            const y = finalPoints[i].y;

            const deltaXY = utils.rotationAroundPoint(
                centroidX,
                centroidY,
                x,
                y,
                utils.deg2Rad(-this.azimuth),
            );
            newPoints.push(new THREE.Vector3(deltaXY[0], deltaXY[1], 0));
        }
        const interSectionPoints = [];

        for (let i = 0, len = newPoints.length; i < len; i += 2) {
            const edge1 = new THREE.Vector2(newPoints[i].x, newPoints[i].y);
            const edge2 = new THREE.Vector2(newPoints[i + 1].x, newPoints[i + 1].y);
            const edge = [edge1, edge2];
            let intersectPoint = [];
            const temporyIntersectionArray = [];
            for (let j = 0; j < RafterEdges.length; j++) {
                for (let k = 0; k < RafterEdges[j].length; k += 1) {
                    intersectPoint = utils.lineIntersection(edge, RafterEdges[j][k]);
                    if (intersectPoint.intersect) {
                        temporyIntersectionArray.push(intersectPoint.point);
                    }
                }
            }
            // arranges the intersection points in a order for rafters to see console interSectionPoints.
            temporyIntersectionArray.sort((a, b) => {
                if (Math.abs(b.x - a.x) > 1) {
                    return b.x - a.x;
                }
                return b.y - a.y;
            });
            for (let k = 0; k < temporyIntersectionArray.length; k++) {
                interSectionPoints.push(temporyIntersectionArray[k]);
            }
        }
        this.rafterPoints = interSectionPoints;
        SmartroofFace.disposeGeometry(this.rafterLineMeshObject);
        const finalIntersectionPoints = [];
        const initialIntersectionPoints = [];
        for (let i = 0; i < interSectionPoints.length - 1; i += 2) {
            initialIntersectionPoints.push(interSectionPoints[i]);
            finalIntersectionPoints.push(interSectionPoints[i + 1]);
        }
        for (let i = 0; i < initialIntersectionPoints.length; i++) {
            const rafterLineGeometry = createBufferGeometry();
            rafterLineGeometry.setFromPoints([
                initialIntersectionPoints[i],
                finalIntersectionPoints[i],
            ]);
            const rafterLineMesh = new THREE.Line(
                rafterLineGeometry,
                this.rafterLineMaterial,
            );
            rafterLineMesh.geometry.computeBoundingSphere();
            this.rafterLineMeshObject.add(rafterLineMesh);
        }
    }

    async updateAttachments() {
        if (this.rafterOrientation === RAFTER_ORIENTATION_PERPENDICULAR) {
            this.createAttachments();
            this.showAttachments();
        }
        else {
            if (this.attachmentObject) {
                SmartroofFace.disposeGeometry(this.attachmentObject);
            }
        }
    }

    // Function to find the rail points according to the associated Azimuth & Spacing
    findRailPoints(pointA, pointB, spacing) {
        const maxZ = utils.getMaxZ(this.get3DVertices());
        const xDist = pointB.x - pointA.x;
        const yDist = pointB.y - pointA.y;
        const dist = Math.sqrt((xDist * xDist) + (yDist * yDist));
        const fractionOfTotal = spacing / dist;
        const railPoint = {
            x: pointA.x + (xDist * fractionOfTotal),
            y: pointA.y + (yDist * fractionOfTotal),
            z: maxZ + 10,
        };
        return railPoint;
    }

    async updateRails() {
        SmartroofFace.disposeGeometry(this.railLineMeshObject);
        if (this.isValidFace()) {
            if (this.isSubarrayPresent()) {
                if (this.rafterOrientation === RAFTER_ORIENTATION_PARALLEL) {
                    this.createColumns();
                }
                else {
                    this.drawRailParallel();
                }
            }
        }
    }

    createAttachments() {
        SmartroofFace.disposeGeometry(this.attachmentObject);
        // need to dispose geometry and mesh too
        const commonRows = this.createRowRails();

        let spacing = 0;
        if (this.rafterLineMeshObject.children.length > 0 && this.railLineMeshObject.children.length > 0) {
            const tilt = commonRows[0][0].getSubarray().getTilt();
            const portraitSpacing = 12 * 0.0254 * Math.cos(utils.deg2Rad(tilt));
            const landscapeSpacing = 8 * 0.0254 * Math.cos(utils.deg2Rad(tilt));
            const rowPanelRailLines = [];
            commonRows.forEach((ele) => {
                if (ele[0].getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                    spacing = portraitSpacing;
                }
                else {
                    spacing = landscapeSpacing;
                }
                const initialPoints = [];
                const finalPoints = [];
                initialPoints.push(this.findRailPoints(
                    ele[0].getEdges()[2][0],
                    ele[0].getEdges()[1][0],
                    spacing,
                ));
                initialPoints.push(this.findRailPoints(
                    ele[0].getEdges()[3][0],
                    ele[0].getEdges()[0][0],
                    spacing,
                ));
                initialPoints.push(this.findRailPoints(
                    ele[0].getEdges()[1][0],
                    ele[0].getEdges()[2][0],
                    spacing,
                ));
                initialPoints.push(this.findRailPoints(
                    ele[0].getEdges()[0][0],
                    ele[0].getEdges()[3][0],
                    spacing,
                ));
                rowPanelRailLines.push({
                    point: [initialPoints[2], initialPoints[3]],
                    panel: 'firstPanel',
                    rail: 'top',
                    rowId: commonRows.indexOf(ele),
                });
                rowPanelRailLines.push({
                    point: [initialPoints[0], initialPoints[1]],
                    panel: 'firstPanel',
                    rail: 'bottom',
                    rowId: commonRows.indexOf(ele),
                });
                finalPoints.push(this.findRailPoints(
                    ele[ele.length - 1].getEdges()[2][0],
                    ele[ele.length - 1].getEdges()[1][0],
                    spacing,
                ));
                finalPoints.push(this.findRailPoints(
                    ele[ele.length - 1].getEdges()[3][0],
                    ele[ele.length - 1].getEdges()[0][0],
                    spacing,
                ));
                finalPoints.push(this.findRailPoints(
                    ele[ele.length - 1].getEdges()[1][0],
                    ele[ele.length - 1].getEdges()[2][0],
                    spacing,
                ));
                finalPoints.push(this.findRailPoints(
                    ele[ele.length - 1].getEdges()[0][0],
                    ele[ele.length - 1].getEdges()[3][0],
                    spacing,
                ));
                rowPanelRailLines.push({
                    point: [finalPoints[2], finalPoints[3]],
                    panel: 'lastPanel',
                    rail: 'top',
                    rowId: commonRows.indexOf(ele),
                });
                rowPanelRailLines.push({
                    point: [finalPoints[0], finalPoints[1]],
                    panel: 'lastPanel',
                    rail: 'bottom',
                    rowId: commonRows.indexOf(ele),
                });
            });
            const cornerAttachmentPoints = [];
            let intersectPoint;
            // TODO: optimise the algorithm
            // instead of iterating through all the rafter lines and checking for intersection
            // implememnt some algorithm to find the rafter edge from spacing and start point
            for (let i = 0; i < rowPanelRailLines.length; i++) {
                const tempIntersection = [];
                for (let j = 0; j < this.rafterPoints.length; j += 2) {
                    const edge = [this.rafterPoints[j], this.rafterPoints[j + 1]];
                    intersectPoint = utils.lineIntersection(rowPanelRailLines[i].point, edge);
                    if (intersectPoint.intersect) {
                        tempIntersection.push({
                            point: intersectPoint.point,
                            panel: rowPanelRailLines[i].panel,
                            rail: rowPanelRailLines[i].rail,
                            rowId: rowPanelRailLines[i].rowId,
                        });
                    }
                }
                if (rowPanelRailLines[i].panel === 'firstPanel' && tempIntersection[0]) {
                    cornerAttachmentPoints.push(tempIntersection[0]);
                }
                else if (tempIntersection[tempIntersection.length - 1]) {
                    cornerAttachmentPoints.push(tempIntersection[tempIntersection.length - 1]);
                }
            }

            const row = [];
            for (let i = 0; i < commonRows.length; i++) {
                const tempRow = [];
                for (let j = 0; j < cornerAttachmentPoints.length; j++) {
                    if (cornerAttachmentPoints[j].rowId === i) {
                        tempRow.push(cornerAttachmentPoints[j]);
                    }
                }
                if (tempRow.length < 4) {
                    row.push({
                        topAttachmentPoint: [tempRow[0]],
                        bottomAttachmentPoint: [tempRow[1]],
                    });
                }
                else {
                    row.push({
                        topAttachmentPoint: [tempRow[0], tempRow[2]],
                        bottomAttachmentPoint: [tempRow[1], tempRow[3]],
                    });
                }
            }

            const circleGeometry = new THREE.CircleGeometry(ATTACHMENT_RADIUS, 32);
            this.attachmentRow = [];
            for (let i = 0; i < row.length; i++) {
                const tempAttachmentMesh = [];
                let oldTop = [];
                let oldBot = [];
                let extraAttach = [];
                let offset = 0;
                if (row[i].topAttachmentPoint.length > 1) {
                    const distance = row[i].topAttachmentPoint[0].point
                        .distanceTo(row[i].topAttachmentPoint[1].point);
                    const noOfRafters = (distance / this.rafterSpacing).toFixed() - 1;
                    const noOfMiddleAttachments = parseInt(noOfRafters / this.attachmentSpacingMultiplier, 10);
                    if (this.updatedAttachmentRow.length !== 0) {
                        this.updatedAttachmentRow.forEach((ele) => {
                            if (ele.rowId === i) {
                                offset = ele.offset;
                            }
                        });
                    }
                    if (i % 2 !== 0 && this.attachmentType === ATTACHMENT_ORIENTATION_PARALLEL) {
                        oldTop = this.getMiddleAttachmentPoints(
                            row[i].topAttachmentPoint[1],
                            noOfMiddleAttachments,
                            offset,
                            noOfRafters,
                        );
                        oldBot = this.getMiddleAttachmentPoints(
                            row[i].bottomAttachmentPoint[1],
                            noOfMiddleAttachments,
                            offset,
                            noOfRafters,
                        );
                    }
                    else {
                        oldTop = this.getMiddleAttachmentPoints(
                            row[i].topAttachmentPoint[0],
                            noOfMiddleAttachments,
                            offset,
                            noOfRafters,
                        );
                        oldBot = this.getMiddleAttachmentPoints(
                            row[i].bottomAttachmentPoint[0],
                            noOfMiddleAttachments,
                            offset,
                            noOfRafters,
                        );
                    }

                    const isInBetween = (A, B, point) => {
                        const total = A.distanceTo(B);
                        return Math.abs(total - point.distanceTo(A) - point.distanceTo(B)) < 0.00001;
                    };

                    let top = oldTop;
                    let bot = oldBot;
                    // to check if the attachment is on rail or not and removing duplicate points
                    oldTop.forEach((ele) => {
                        const vec2 = new THREE.Vector2(ele.x, ele.y)
                        if (isInBetween(row[i].topAttachmentPoint[0].point, row[i].topAttachmentPoint[1].point, vec2) && !top.includes(ele))
                            top.push(ele)
                    })
                    oldBot.forEach((ele) => {
                        const vec2 = new THREE.Vector2(ele.x, ele.y)
                        if (isInBetween(row[i].bottomAttachmentPoint[0].point, row[i].bottomAttachmentPoint[1].point, vec2) && !bot.includes(ele))
                            bot.push(ele)
                    })

                    // removing extra single from top and bottom attachments
                    if (this.attachmentType !== ATTACHMENT_ORIENTATION_PARALLEL) {
                        if (top[0] && bot[0]) {
                            const distFirstTop = row[i].topAttachmentPoint[0].point.distanceTo(top[0]);
                            const distFirstBot = row[i].bottomAttachmentPoint[0].point.distanceTo(bot[0]);

                            const diff = distFirstBot - distFirstTop;
                            if (Math.abs(diff - (this.rafterSpacing)) > 0.01) {
                                extraAttach.push(bot.shift());
                            }

                            if (bot.length < top.length) {
                                extraAttach.push(top.pop());
                            }
                        }
                    }

                    // merging top and bot pair
                    const length = bot.length <= top.length ? bot.length : top.length;
                    for (let j = 0; j < length; j++) {
                        const dist = top[j].distanceToSquared(bot[j]);
                        const attachment1 = circleGeometry.clone().translate(
                            top[j].x,
                            top[j].y,
                            utils.getHighestZ(this.stage.ground) + 10,
                        );
                        const attachment2 = circleGeometry.clone().translate(
                            bot[j].x,
                            bot[j].y,
                            utils.getHighestZ(this.stage.ground) + 10,
                        );

                        // attachmentGeometry.merge(attachment1);
                        // attachmentGeometry.merge(attachment2);
                        const attachmentGeometry = BufferGeometryUtils.mergeGeometries([attachment1, attachment2]);
                        const attachmentMesh = new THREE.Mesh(
                            attachmentGeometry,
                            this.attachmentMaterial,
                        );
                        attachmentMesh.geometry.computeBoundingSphere();
                        attachmentMesh.userData.rowId = i;
                        attachmentMesh.userData.middle = true;
                        const attachment1Vertices = [];
                        for (let i = 0; i < attachment1.attributes.position.array.length; i++) {
                            attachment1Vertices.push(new THREE.Vector3(
                                attachment1.attributes.position.array[i++],
                                attachment1.attributes.position.array[i++],
                                attachment1.attributes.position.array[i++],
                            ));
                        }
                        const attachment2Vertices = [];
                        for (let i = 0; i < attachment2.attributes.position.array.length; i++) {
                            attachment2Vertices.push(new THREE.Vector3(
                                attachment2.attributes.position.array[i++],
                                attachment2.attributes.position.array[i++],
                                attachment2.attributes.position.array[i++],
                            ));
                        }
                        attachmentMesh.userData.vertices = [[...attachment1Vertices], [...attachment2Vertices]];
                        tempAttachmentMesh.push(attachmentMesh);
                        this.attachmentObject.add(attachmentMesh);
                    }
                    this.attachmentRow.push([...top]);
                    this.attachmentRow.push([...bot]);

                    // creating mesh for single attach
                    extraAttach.forEach((extra) => {
                        const attachment1 = circleGeometry.clone().translate(
                            extra.x,
                            extra.y,
                            utils.getHighestZ(this.stage.ground) + 10,
                        );
                        const attachmentMesh = new THREE.Mesh(
                            attachment1,
                            this.attachmentMaterial,
                        );
                        attachmentMesh.geometry.computeBoundingSphere();
                        attachmentMesh.userData.rowId = i;
                        attachmentMesh.userData.middle = true;
                        const attachment1Vertices = [];
                        for (let i = 0; i < attachment1.attributes.position.array.length; i++) {
                            attachment1Vertices.push(new THREE.Vector3(
                                attachment1.attributes.position.array[i++],
                                attachment1.attributes.position.array[i++],
                                attachment1.attributes.position.array[i++],
                            ));
                        }
                        attachmentMesh.userData.vertices = [[...attachment1Vertices]];
                        tempAttachmentMesh.push(attachmentMesh);
                        this.attachmentObject.add(attachmentMesh);
                    })
                    this.attachmentRow.push([...extraAttach]);
                }
            }
            this.attachmentRow.push(cornerAttachmentPoints.map(point => point.point));

            cornerAttachmentPoints.forEach((point) => {
                this.attachmentGeometry = new THREE.CircleGeometry(ATTACHMENT_RADIUS, 32);
                this.attachmentGeometry.translate(point.point.x, point.point.y, utils.getHighestZ(this.stage.ground) + 10);
                const attachmentMesh = new THREE.Mesh(this.attachmentGeometry, this.attachmentMaterial);
                attachmentMesh.geometry.computeBoundingSphere();
                this.attachmentObject.add(attachmentMesh);
            });

        }
    }

    getMiddleAttachmentPoints(startPoint, noOfAttachments, offset = 0, noOfMiddleRafters) {
        const convertRafterSpacingValue = this.attachmentSpacingMultiplier * this.rafterSpacing;

        // no of movements
        let unitMovement = (offset / this.rafterSpacing).toFixed();
        unitMovement = unitMovement % this.attachmentSpacingMultiplier;

        // initial no of last rafters
        const initExtraLastRafter = (noOfMiddleRafters %  this.attachmentSpacingMultiplier);

        // no of rafters after movement
        let currExtraLastRafter = 0;
        if (startPoint.rowId % 2 !== 0 && this.attachmentType === ATTACHMENT_ORIENTATION_PARALLEL) {
            currExtraLastRafter = (noOfMiddleRafters %  this.attachmentSpacingMultiplier) + unitMovement;
        }
        else {
            currExtraLastRafter = (noOfMiddleRafters %  this.attachmentSpacingMultiplier) - unitMovement;
        }

        // spacing and no of attachments update after movement
        const finalPoints = [];
        const newPoints = [];
        let startXY = startPoint.point.x;
        // first attachment for parallel attachment type
        if (this.attachmentType === ATTACHMENT_ORIENTATION_PARALLEL) {
            // positive movement
            if (unitMovement > 0) {
                // left to right
                if (startPoint.rowId % 2 === 0) {
                    if (currExtraLastRafter >= 0) noOfAttachments += 1;
                    startXY = startXY + offset % convertRafterSpacingValue;
                }
                // right to left
                else {
                    if (currExtraLastRafter >= this.attachmentSpacingMultiplier) noOfAttachments += 1;
                    startXY = startXY - convertRafterSpacingValue + (offset % convertRafterSpacingValue);
                }
            }
            // negative movement
            else if (unitMovement < 0){
                // left to right
                if (startPoint.rowId % 2 === 0) {
                    if (currExtraLastRafter >= this.attachmentSpacingMultiplier) noOfAttachments += 1;
                    startXY = startXY + convertRafterSpacingValue + (offset % convertRafterSpacingValue);
                }
                // right to left
                else {
                    if (initExtraLastRafter > 0) noOfAttachments += 1;
                    startXY = startXY + offset % convertRafterSpacingValue;
                }
            }
            // parallel left to right for first attachment
            else {
                startXY = startPoint.rowId % 2 === 0 ?
                    startXY + convertRafterSpacingValue :
                    startXY - convertRafterSpacingValue;
            }
        }
        // staggered for first attachment
        else if (startPoint.rail === 'top') {
            // if we don't have last upper attachment
            if (currExtraLastRafter === this.attachmentSpacingMultiplier - 1 && initExtraLastRafter > 0 && noOfMiddleRafters > this.attachmentSpacingMultiplier) {
                noOfAttachments += 1;
            }
            // positive movement
            if (unitMovement > 0) {
                if (currExtraLastRafter >= 0 && unitMovement > 1) {
                    noOfAttachments += 1;
                }
                if (currExtraLastRafter == -1 && initExtraLastRafter > 0) {
                    noOfAttachments += 1;
                }
                if ((Math.abs(offset % convertRafterSpacingValue) - this.rafterSpacing) < 0.01) {
                    startXY = startXY + (convertRafterSpacingValue);
                }
                else {
                    startXY = startXY + ((offset % convertRafterSpacingValue) - this.rafterSpacing);
                }
            }
            // negative movement
            else if (unitMovement < 0) {
                if (currExtraLastRafter >= this.attachmentSpacingMultiplier && Math.abs(unitMovement) < this.attachmentSpacingMultiplier - 1) {
                    noOfAttachments += 1;
                }
                if ((Math.abs(convertRafterSpacingValue + (offset % convertRafterSpacingValue) - this.rafterSpacing)) < 0.01) {
                    startXY += (convertRafterSpacingValue);
                }
                else {
                    startXY = startXY + (convertRafterSpacingValue + (offset % convertRafterSpacingValue) - this.rafterSpacing);
                }
            }
            // no movement
            else {
                startXY += (convertRafterSpacingValue - this.rafterSpacing);
            }
        }
        // first bot staggered attachment
        else {
            // positive movement
            if (unitMovement > 0) {
                if (currExtraLastRafter >= 0) noOfAttachments += 1;
                startXY = startXY + offset % convertRafterSpacingValue;
            }
            // negative movement
            else if (unitMovement < 0) {
                if (currExtraLastRafter >= this.attachmentSpacingMultiplier) noOfAttachments += 1;
                startXY = startXY + convertRafterSpacingValue + (offset % convertRafterSpacingValue);
            }
            // no movement
            else {
                startXY += convertRafterSpacingValue;
            }
        }
        for (let i = 0; i < noOfAttachments; i += 1) {
            finalPoints.push(new THREE.Vector3(startXY, startPoint.point.y, 0));

            // alternate left and right start
            if (this.attachmentType === ATTACHMENT_ORIENTATION_PARALLEL) {
                startXY = startPoint.rowId % 2 === 0 ?
                    startXY + convertRafterSpacingValue :
                    startXY - convertRafterSpacingValue;
            }
            // staggered
            else {
                startXY += convertRafterSpacingValue;
            }
        }

        // rotating the attachments wrt azimuth of roof
        for (let i = 0, len = finalPoints.length; i < len; i += 1) {
            const x = finalPoints[i].x;
            const y = finalPoints[i].y;

            const deltaXY = utils.rotationAroundPoint(
                startPoint.point.x,
                startPoint.point.y,
                x,
                y,
                utils.deg2Rad(180 - this.azimuth),
            );
            newPoints.push(new THREE.Vector3(deltaXY[0], deltaXY[1], 0));
        }

        return newPoints;
    }

    /**
     * takes the meshobject i.e rafterLineMeshObject and railLineMeshObject
     * disposes their geomtry, material and clears the meshObject
     * @param {meshObject} meshObject
     */
    static disposeGeometry(meshObject) {
        meshObject.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        meshObject.clear();
    }

    drawEdges() {
        Object.values(this.cleanEdges).forEach((edge) => {
            if (!edge) return;
            this.parent.drawEdge(edge.vertex1.data, edge.vertex2.data);
        });
    }

    drawRailParallel() {
        const allRows = this.createRowRails();
        let railLineMesh1;
        let railLineMesh2;
        for (let k = 0; k < allRows.length; k++) {
            const rows = allRows[k];
            const railFinal1 = [];
            const railFinal2 = [];
            const railFinal3 = [];
            const railFinal4 = [];
            let spacing = 0;
            const tilt = rows[0].getSubarray().getTilt();
            const portraitSpacing = 12 * 0.0254 * Math.cos(utils.deg2Rad(tilt));
            const landscapeSpacing = 8 * 0.0254 * Math.cos(utils.deg2Rad(tilt));
            if (rows[0]) {
                if (rows[0].getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                    spacing = portraitSpacing;
                }
                else {
                    spacing = landscapeSpacing;
                }
            }
            for (let i = 0; i < rows.length; i++) {
                const railLineGeometry1 = createBufferGeometry();
                railFinal1.push(this.findRailPoints(
                    rows[0].getEdges()[2][0],
                    rows[0].getEdges()[1][0],
                    spacing,
                ));
                railFinal2.push(this.findRailPoints(
                    rows[rows.length - 1].getEdges()[3][0],
                    rows[rows.length - 1].getEdges()[0][0],
                    spacing,
                ));
                railLineGeometry1.setFromPoints([
                    new THREE.Vector3(
                        railFinal1[i].x,
                        railFinal1[i].y,
                        railFinal1[i].z,
                    ),
                    new THREE.Vector3(
                        railFinal2[i].x,
                        railFinal2[i].y,
                        railFinal2[i].z,
                    ),
                ]);
                railLineMesh1 = new THREE.Line(railLineGeometry1, this.railLineMaterial);
                railLineGeometry1.computeBoundingSphere(5);
                const railLineGeometry2 = createBufferGeometry();
                railFinal3.push(this.findRailPoints(
                    rows[0].getEdges()[1][0],
                    rows[0].getEdges()[2][0],
                    spacing,
                ));
                railFinal4.push(this.findRailPoints(
                    rows[rows.length - 1].getEdges()[0][0],
                    rows[rows.length - 1].getEdges()[3][0],
                    spacing,
                ));
                railLineGeometry2.setFromPoints([
                    new THREE.Vector3(
                        railFinal3[i].x,
                        railFinal3[i].y,
                        railFinal3[i].z,
                    ),
                    new THREE.Vector3(
                        railFinal4[i].x,
                        railFinal4[i].y,
                        railFinal4[i].z,
                    ),
                ]);
                railLineMesh2 = new THREE.Line(railLineGeometry2, this.railLineMaterial);
                railLineGeometry2.computeBoundingSphere(5);
            }
            // adding the Rail Mesh to objectsGroup for each Row
            this.railLineMeshObject.add(railLineMesh1);
            this.railLineMeshObject.add(railLineMesh2);
        }
    }

    createRowRails() {
        const allRows = [];
        const commonSubarray = getCommonSubarray(this);
        for (let k = 0; k < commonSubarray.length; k++) {
            let panelsOfCommonSubarray = [];
            const panelWithLocalCoordinates = [];
            for (let l = 0; l < commonSubarray[k].length; l++) {
                panelsOfCommonSubarray = panelsOfCommonSubarray.concat(
                    commonSubarray[k][l].getPanels().filter(
                        // added condition to check if the panel is placed and it's not hidden
                        (panel) => !panel.getParent().isHidden() && !panel.getParent().notPlaced
                    )
                );
            }
            const panels = panelsOfCommonSubarray;
            if (panels.length === 1) {
                allRows.push(panels);
            }
            else {
                for (let i = 0; i < panels.length; i++) {
                    panelWithLocalCoordinates.push({
                        panel: panels[i],
                        localPosition: commonSubarray[k][0].globalToLocalCoordinates(
                            panels[i].getPosition(),
                            commonSubarray[k][0].boundingBox,
                        ),
                    });
                }
                panelWithLocalCoordinates.sort((a, b) => a.localPosition.y.toFixed(3) - b.localPosition.y.toFixed(3));
                const row = getCommonRows(panelWithLocalCoordinates, { flag: false, col: false });
                const realRows = [];
                for (let i = 0; i < row.length; i += 1) {
                    row[i].sort((a, b) => a.localPosition.x.toFixed(3) - b.localPosition.x.toFixed(3));
                    realRows.push(getCommonRows(row[i], { flag: true, col: false }));
                }
                for (let i = 0; i < realRows.length; i += 1) {
                    for (let j = 0; j < realRows[i].length; j += 1) {
                        allRows.push(realRows[i][j]);
                    }
                }
            }
        }
        return allRows;
    }

    // Function to draw the railLines in perpendicular orientation when the Rafters are parallel
    drawRailPerpendicular() {
        const allcolumns = this.createColumns();
        let railLineMesh1;
        let railLineMesh2;
        for (let k = 0; k < allcolumns.length; k++) {
            const columns = allcolumns[k];
            const railFinal1 = [];
            const railFinal2 = [];
            const railFinal3 = [];
            const railFinal4 = [];
            let spacing = 0;
            const portraitSpacing = 12 * 0.0254;
            const landscapeSpacing = 8 * 0.0254;
            if (columns[0]) {
                if (columns[0].getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
                    spacing = portraitSpacing;
                }
                else {
                    spacing = landscapeSpacing;
                }
            }
            for (let i = 0; i < columns.length; i++) {
                const railLineGeometry1 = createBufferGeometry();
                railFinal1.push(this.findRailPoints(
                    columns[0].getEdges()[1][0],
                    columns[0].getEdges()[0][0],
                    spacing,
                ));
                railFinal2.push(this.findRailPoints(
                    columns[columns.length - 1].getEdges()[2][0],
                    columns[columns.length - 1].getEdges()[3][0],
                    spacing,
                ));
                railLineGeometry1.setFromPoints([
                    new THREE.Vector3(
                        railFinal1[i].x,
                        railFinal1[i].y,
                        railFinal1[i].z,
                    ),
                    new THREE.Vector3(
                        railFinal2[i].x,
                        railFinal2[i].y,
                        railFinal2[i].z,
                    ),
                ]);
                railLineMesh1 = new THREE.Line(railLineGeometry1, this.railLineMaterial);
                railLineGeometry1.computeBoundingSphere(5);
                const railLineGeometry2 = createBufferGeometry();
                railFinal3.push(this.findRailPoints(
                    columns[0].getEdges()[0][0],
                    columns[0].getEdges()[1][0],
                    spacing,
                ));
                railFinal4.push(this.findRailPoints(
                    columns[columns.length - 1].getEdges()[3][0],
                    columns[columns.length - 1].getEdges()[2][0],
                    spacing,
                ));
                railLineGeometry2.setFromPoints([
                    new THREE.Vector3(
                        railFinal3[i].x,
                        railFinal3[i].y,
                        railFinal3[i].z,
                    ),
                    new THREE.Vector3(
                        railFinal4[i].x,
                        railFinal4[i].y,
                        railFinal4[i].z,
                    ),
                ]);
                railLineMesh2 = new THREE.Line(railLineGeometry2, this.railLineMaterial);
                railLineGeometry2.computeBoundingSphere(5);
            }
            // adding the Rail Mesh to objectsGroup for each Column
            this.railLineMeshObject.add(railLineMesh1);
            this.railLineMeshObject.add(railLineMesh2);
        }
    }

    createColumns() {
        const columns = [];
        const commonSubarray = getCommonSubarray(this);
        for (let k = 0; k < commonSubarray.length; k++) {
            let panelsOfCommonSubarray = [];
            const panelWithLocalCoordinates = [];
            for (let l = 0; l < commonSubarray[k].length; l++) {
                panelsOfCommonSubarray = panelsOfCommonSubarray.concat(commonSubarray[k][l].getPanels().filter((panel) => !panel.getParent().isHidden()));
            }
            const panels = panelsOfCommonSubarray;
            if (panels.length === 1) {
                columns.push(panels);
            }
            else {
                for (let i = 0; i < panels.length; i++) {
                    panelWithLocalCoordinates.push({
                        panel: panels[i],
                        localPosition: commonSubarray[k][0].globalToLocalCoordinates(
                            panels[i].getPosition(),
                            commonSubarray[k][0].boundingBox,
                        ),
                    });
                }
                panelWithLocalCoordinates.sort((a, b) =>
                    b.localPosition.x.toFixed(3) - a.localPosition.x.toFixed(3));
                const column = getCommonRows(panelWithLocalCoordinates, { flag: false, col: true });
                const realColumn = [];
                for (let i = 0; i < column.length; i += 1) {
                    column[i].sort((a, b) => a.localPosition.y.toFixed(3) - b.localPosition.y.toFixed(3));
                    realColumn.push(getCommonRows(column[i], { flag: true, col: true }));
                }
                for (let i = 0; i < realColumn.length; i += 1) {
                    for (let j = 0; j < realColumn[i].length; j += 1) {
                        columns.push(realColumn[i][j]);
                    }
                }
            }
        }
        return columns;
    }

    showRails() {
        this.railLineMeshObject.visible = true;
        this.railsSwitchTo3D();
    }

    showAttachments() {
        this.attachmentObject.visible = true;
    }

    async updateRail() {
        if (this.rafterEnabled && this.stage.viewManager.rafterVisible) {
            this.railLineMeshObject.visible = true;
            await this.updateRails();
            this.railsSwitchTo3D();
        }
        else {
            this.hideRails();
        }
    }

    hideRails() {
        this.railLineMeshObject.visible = false;
    }

    hideAttachments() {
        this.attachmentObject.visible = false;
    }

    railsSwitchTo3D() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.railLineMeshObject.visible = false;
        }
        else {
            this.railLineMeshObject.visible = true;
        }
    }

    getRailLineVertices() {
        const railLineVertices = [];
        this.railLineMeshObject.children.forEach((railLine) => {
            for (let i = 0; i < railLine.geometry.attributes.position.array.length; i++) {
                const vertex1 = [];
                vertex1.push(railLine.geometry.attributes.position.array[i++]);
                vertex1.push(railLine.geometry.attributes.position.array[i++]);
                vertex1.push(railLine.geometry.attributes.position.array[i++]);
                const vertex2 = [];
                vertex2.push(railLine.geometry.attributes.position.array[i++]);
                vertex2.push(railLine.geometry.attributes.position.array[i++]);
                vertex2.push(railLine.geometry.attributes.position.array[i]);
                railLineVertices.push([vertex1, vertex2]);
            }
        });
        return railLineVertices;
    }

    getAttachmentPoints() {
        const attachmentPoints = [];
        this.attachmentObject.children.forEach((attachment) => {
            if (attachment.userData.vertices) {
                if (attachment.userData.vertices[0]) attachmentPoints.push(attachment.userData.vertices[0]);
                if (attachment.userData.vertices[1]) attachmentPoints.push(attachment.userData.vertices[1]);
            }
            else {
                const attachmentVertices = [];
                for (let i = 0; i < attachment.geometry.attributes.position.array.length; i++) {
                    attachmentVertices.push(new THREE.Vector3(
                        attachment.geometry.attributes.position.array[i++],
                        attachment.geometry.attributes.position.array[i++],
                        attachment.geometry.attributes.position.array[i++],
                    ));
                }
                attachmentPoints.push(attachmentVertices);
            }
        });
        return attachmentPoints;
    }

    getRafterLineVertices() {
        const rafterLineVertices = [];
        this.rafterLineMeshObject.children.forEach((rafterLine) => {
            for (let i = 0; i < rafterLine.geometry.attributes.position.array.length; i++) {
                const vertex1 = [];
                vertex1.push(rafterLine.geometry.attributes.position.array[i++]);
                vertex1.push(rafterLine.geometry.attributes.position.array[i++]);
                vertex1.push(rafterLine.geometry.attributes.position.array[i++]);
                const vertex2 = [];
                vertex2.push(rafterLine.geometry.attributes.position.array[i++]);
                vertex2.push(rafterLine.geometry.attributes.position.array[i++]);
                vertex2.push(rafterLine.geometry.attributes.position.array[i]);
                rafterLineVertices.push([vertex1, vertex2]);
            }
        });
        return rafterLineVertices;
    }


    // the rafter lines wont be visible when switch into 3D
    // need better fix; To do: refactor
    switchTo3D() {
        if (this.materialState === MATERIAL_STATES.SOLID || (this.stage.visualManager.getIn3D() && this.stage.heatMap.isVisible())) {
            this.hideRafter();
        }
        else {
            this.updateRafter();
            if (this.stage.viewManager.rafterVisible && this.rafterEnabled) {
                this.showAttachments();
            }
        }
    }

    getSetbackEdges() {
        const edges = [];
        this.setbackVertices.forEach((loop) => {
            const edgeloop = [];
            for (let index = 0; index < loop.length; index++) {
                const current = loop[index];
                const next = loop[(index + 1) % loop.length];
                edgeloop.push([current, next]);
            }
            edges.push(edgeloop);
        });
        return edges;
    }

    updateGeometry() {
        if (!this.azimuth && !this.isDeleted && this.isValid) {
            this.azimuth = this.findAzimuth();
        }
        
        // if (this.rafterEnabled) {
        //     this.updateRafter();
        // }
        // else {
        // this.hideRafter();
        // }
        // this.updateRafterLines();
        // this.updateRail();
        // To resolve Z fighting
        this.setbackInsideMesh.position.z = 0.01;
        this.saveState();
    }

    updateSetback() {
        if (this.outlinePoints.length !== 0 && !this.isDeleted) {
            let setbackInsideGeometryVertices;
            if (!this.isValid) {
                if (this.setbackInsideMesh && this.setbackInsideMesh.geometry) this.setbackInsideMesh.geometry.dispose();
                this.setbackInsideMesh.geometry = new THREE.BufferGeometry();
                setbackInsideGeometryVertices = [];
            }
            try {
                if (this.setbackInsideMesh && this.setbackInsideMesh.geometry) this.setbackInsideMesh.geometry.dispose();
                this.setbackInsideMesh.geometry = this.getSetbackInsideGeometry();
                setbackInsideGeometryVertices = this.setbackInsideMesh.geometry.attributes.position;
                if (setbackInsideGeometryVertices) {
                    for (let index = 0; index < setbackInsideGeometryVertices.count; index++) {
                        setbackInsideGeometryVertices.array[(3 * index) + 2] = this.getZOnTopSurface(
                            setbackInsideGeometryVertices.array[(3 * index)],
                            setbackInsideGeometryVertices.array[(3 * index) + 1],
                        ) + 0.01;
                    }
                    this.setbackInsideMesh.geometry.attributes.position = setbackInsideGeometryVertices;
                    this.setbackInsideMesh.geometry.attributes.position.needsUpdate = true;
                }
            }
            catch (error) {
                // console.error('Unable to create inner setback for face', error);
                if (this.setbackInsideMesh && this.setbackInsideMesh.geometry) this.setbackInsideMesh.geometry.dispose();
                this.setbackInsideMesh.geometry = new THREE.BufferGeometry();
                setbackInsideGeometryVertices = [];
            }


            // for (let i = 0; i < setbackInsideGeometryVertices.length; i++) {
            //     setbackInsideGeometryVertices[i].z = this.getZOnTopSurface(setbackInsideGeometryVertices[i].x, setbackInsideGeometryVertices[i].y) + 0.01;
            // }
            // Might need reassigning?
            // setbackInsideGeometryVertices.needsUpdate = true;
        }
        this.setbackInsideMesh.position.z = 0.01;
        this.saveState();
    }

    updatePanels() {
        const subArrays = this.getChildren().filter(c => c instanceof Subarray);

        subArrays.forEach((subarray) => {
            // subarray.placeObject();
            const updatedProperties = {}
            updatedProperties.tilt = this.tilt;
            updatedProperties.azimuth = this.azimuth;
            utils.updateTable(subarray.getTables(), updatedProperties, this.stage);
        });
    }

    computeArea() {
        if (!this.isDeleted) {
            let area = 0;
            for (let i = 0; i < this.setbackVertices.length; i++) {
                const vertices = this.setbackVertices[i];
                const modVertices = vertices.map(vertex => ({
                    x: vertex.x,
                    y: vertex.y,
                }));
                area += Math.abs(THREE.ShapeUtils.area(modVertices) / Math.cos((this.tilt * Math.PI) / 180));
            }
            return area;
        }
        return 0;
    }

    computeAreaForPanels() {
        const panelSubarray = this.getChildren().filter(subarray => subarray instanceof Subarray);
        let panelArea = 0;
        for (let i = 0; i < panelSubarray.length; i += 1) {
            panelArea += panelSubarray[i].getPanels().length * ((
                panelSubarray[i].moduleProperties.moduleLength) * (panelSubarray[i].moduleProperties.moduleWidth
            ));
        }
        return panelArea;
    }

    checkContainsPanel() {
        let contains = false;
        const children = this.getChildren();

        for (let i = 0; i < children.length; i += 1) {
            const child = children[i];

            if (child instanceof Subarray) {
                contains = true;
                break
            }
        }
        return contains;
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }

    mergeFace(face2, snapRoofs = true, offset = 0) {
        return utils.mergeFaces(this.stage, this, face2, snapRoofs, offset);
    }

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
            this.hideRafter();
        }
    }

    showObjectLayer() {
        // In future if layers are used..  it needs to be checked if the camera and model are in the same layer or not!
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
        this.showRafter();
    }

    showRafter() {
        if (this.stage.viewManager.rafterVisible && this.rafterEnabled) {
            this.rafterLineMeshObject.visible = true;
            this.showAttachments();
            this.showRails();
        }
    }

    updateRafter() {
        if (this.stage.viewManager.rafterVisible && this.rafterEnabled && this.isValidFace()) {
            if (this.stage.editMode.isMouseDown === false) {
                this.updateRails();
            }
            this.railsSwitchTo3D();
            this.updateRafterLines();

            this.rafterLineMeshObject.visible = true;
            this.updateAttachments();
        }
        else{
            if (this.rafterLineMeshObject) {
                SmartroofFace.disposeGeometry(this.rafterLineMeshObject);
            }
            if (this.railLineMeshObject) {
                SmartroofFace.disposeGeometry(this.railLineMeshObject);
            }
            if (this.attachmentObject) {
                SmartroofFace.disposeGeometry(this.attachmentObject);
            }
        }
    }

    hideRafter() {
        this.rafterLineMeshObject.visible = false;
        this.hideRails();
        this.hideAttachments(); // hide attachments if rafter is hidden
        // for (let i = this.getChildren().length - 1; i >= 0; i -= 1) {
        //     const child = this.getChildren()[i];
        //     if (child instanceof Subarray) {
        //         child.hideRails();
        //     }
        // }
    }

    showObject() {
        this.parent.showObject();
    }

    hideObject() {
        this.parent.hideObject();
    }

    async onFillFace({ isCustom } = { isCustom: false }) {
        // Removing previous subarray
        for (let i = this.getChildren().length - 1; i >= 0; i -= 1) {
            const child = this.getChildren()[i];
            if (child instanceof Subarray) {
                child.removeObject();
            }
        }
        const subarray = new Subarray(this.stage);
        try {
            await subarray.fillFace(
                this.get3DVertices(),
                this.tilt > 0 ? SUBARRAY_RACK_STYLE_FLUSH : SUBARRAY_RACK_STYLE_FIXED, { isCustom },
                {associatedFillFaceModel : this},
            );
            await this.updateRails();
            if (this.rafterEnabled) await this.updateAttachments(); // create attachments on fill face
            return Promise.resolve(subarray);
        }
        catch (error) {
            console.error('ERROR: PolygonModel: onFillFace failed', error);
            return Promise.reject(error);
        }
    }

    createEdges() {
        this.edges.forEach(edge => {
            edge.removeObject();
        })
        this.edges = [];
        // const vertices = this.get3DVertices();
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const edge = new Edge(this, this.stage, this.outlinePoints[i], this.outlinePoints[(i + 1) % len], true, i, (i + 1) % len, false);
            this.edges.push(edge);
        }
    }

    showEdges() {
        for (let i = 0, len = this.edges.length; i < len; i += 1) {
            this.edges[i].showObject();
        }
    }

    hideEdges() {
        for (let i = 0, len = this.edges.length; i < len; i += 1) {
            this.edges[i].removeObject();
        }
    }

    onSelect() {
        this.isSelected = true;
        if (this.outerEdge && this.parent instanceof DrawFace) {
            this.outerEdge.showObject();
            this.outerEdge.onSelect();
        }
        if (this.isValidFace()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                this.outlinePoints[i].showObject();
            }
            this.showSetback();
            this.createEdges();
            this.showEdges();
        }
        this.highlightOnHover()
    }

    deSelect() {
        this.isSelected = false;
        if (this.outerEdge && this.parent instanceof DrawFace) {
            this.outerEdge.hideObject();
            this.parent.deSelect();
        }
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        if (this.outerEdge) this.outerEdge.onDeselect();
        this.hideSetback();
        this.hideEdges();
        this.unHighlight();
        // if (this.polygonMeasurement) this.polygonMeasurement.hide();
    }

    deleteFace() {
        const siblings = this.getParent().getChildren();
        let stopDeletion = true;
        for (let i = 0; i < siblings.length; i += 1) {
            if (!siblings[i].isDeleted && siblings[i] !== this) {
                stopDeletion = false;
            }
        }
        if (stopDeletion) {
            this.stage.eventManager.invalidFaceDeletion();
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
            return;
        }
        this.stage.stateManager.startContainer();
        this.tilt = 90;
        if (this.fold) {
            this.fold.isActive = false;
        }
        else {
            this.outerEdge.tilt = 90;
            this.outerEdge.isPitched = false;
        }
        this.plane = this.outerPlane;
        this.isDeleted = true;
        this.rafterEnabled = false;
        this.updateRafter();
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }
        this.isValid = false;
        this.getParent().updateFacesWithNewAngles();
        this.stage.stateManager.stopContainer();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.isDeleted = true;
    }

    getDefaultValues() {
        const polygonDrawingDefaults = this.stage.getDesignSettings().drawing_defaults.polygonModel;
        return {
            coreHeight: polygonDrawingDefaults.coreHeight,
            parapetHeight: polygonDrawingDefaults.parapetHeight,
            parapetThickness: polygonDrawingDefaults.parapetThickness,
            tilt: polygonDrawingDefaults.tilt,
            azimuth: polygonDrawingDefaults.azimuth,
            setbackInside: polygonDrawingDefaults.setbackInside,
            setbackOutside: polygonDrawingDefaults.setbackOutside,
            ignored: polygonDrawingDefaults.ignored,
            placable: polygonDrawingDefaults.placable,
            topHeight: polygonDrawingDefaults.topHeight,
        };
    }

    getChildren() {
        return this.children;
    }

    isValidFace() {
        return this.isValid && !this.isDeleted && (this.vertices.length > 0);
    }

    getConvexHull2D() {
        const vertices = [];
        for (let i = 0; i < this.convexHullCoordinates.length; i += 1) {
            for (let j = 0; j < this.convexHullCoordinates[i].length; j += 1) {
                vertices.push([
                    this.convexHullCoordinates[i][j].x,
                    this.convexHullCoordinates[i][j].y,
                ]);
            }
        }
        return vertices;
    }

    updateLidarConvexHull() {
        this.lidarConvexHull = this.getConvexHullCoordinates();
    }

    getConvexHull() {
        const vertices = [];
        for (let i = 0; i < this.convexHullCoordinates.length; i += 1) {
            const group = [];
            for (let j = 0; j < this.convexHullCoordinates[i].length; j += 1) {
                group.push([
                    this.convexHullCoordinates[i][j].x,
                    this.convexHullCoordinates[i][j].y,
                    this.convexHullCoordinates[i][j].z,
                ]);
            }
            vertices.push(group);
        }
        return vertices;
    }

    getConvexHullCoordinates() {
        return this.convexHullCoordinates;
    }

    getIntersectingEdges() {
        return this.intersectingEdges;
    }

    /**
     * It takes the 2D vertices of the polygon and converts them to latitude and longitude coordinates.
     * @returns An array of arrays. Each array contains a longitude and latitude.
     */
    getLongLatVertices() {
        const currlat = this.stage.getLatitude();
        const currlong = this.stage.getLongitude();
        const verts = this.get2DVertices();
        const latlongs = [];
        for (let i = 0; i < this.numVertices; i++) {
            const xcord = verts[i][0];
            const ycord = verts[i][1];
            const lat = currlat + (ycord / 111111);
            const long = currlong + (xcord / (111111 * Math.cos(utils.toRadian(lat))));
            latlongs.push([long, lat]);
        }
        latlongs.push(latlongs[0]);
        return latlongs;
    }

    get2DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
            ]);
        }
        return vertices;
    }

    get2DVectorVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push(this.outlinePoints[i].getPosition());
        }
        return vertices;
    }

    getVector2Vertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const pos = this.outlinePoints[i].getPosition();
            vertices.push(new THREE.Vector2(pos.x, pos.y));
        }
        return vertices;
    }

    get2DMergePoints() {
        const group = [];
        Object.values(this.mergePoints).forEach((points) => {
            const vertices = [];
            if (points.length > 2) {
                for (let i = 0, len = points.length; i < len; i += 1) {
                    vertices.push([
                        points[i].x,
                        points[i].y,
                    ]);
                }
                group.push(vertices);
            }
        });
        return group;
    }

    get3DMergePoints() {
        const group = [];
        Object.values(this.mergePoints).forEach((points) => {
            const vertices = [];
            if (points.length > 2) {
                for (let i = 0, len = points.length; i < len; i += 1) {
                    vertices.push(points[i]);
                }
                group.push(vertices);
            }
        });
        return group;
    }

    getVector3DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const outlinePoint = this.outlinePoints[i].getPosition();
            vertices.push(new Vector3(outlinePoint.x, outlinePoint.y, outlinePoint.z));
        }
        return vertices;
    }

    get3DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const outlinePoint = this.outlinePoints[i].getPosition();
            vertices.push([
                outlinePoint.x,
                outlinePoint.y,
                outlinePoint.z,
            ]);
        }
        return vertices;
    }

    getZOnTopSurface(x, y) {
        if (this.outlinePoints.length === 0) {
            console.error('ERROR: PolygonModel: has outline points null');
        }
        const v1 = this.outlinePoints[0].getPosition();
        let v2 = this.outlinePoints[1].getPosition();
        const v3 = this.outlinePoints[2].getPosition();
        v1.addScaledVector(v2, -1);
        v3.addScaledVector(v2, -1);
        v1.cross(v3);
        v2 = this.outlinePoints[1].getPosition();
        const d = -1 * ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
        return -1 * ((d / v1.z) + ((v1.y * y) / v1.z) + ((v1.x * x) / v1.z));
    }

    findAzimuth() {
        if (this.outerEdge) {
            return this.outerEdge.getAzimuth();
        }
        let edge = [];
        {
            const vertices = this.get2DVectorVertices();
            edge = [vertices[0], vertices[vertices.length - 1]];
        }
        if (edge.length === 0) {
            return 180;
        }

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

    moveObject(deltaX, deltaY, deltaZ = 0) {
        this.outerEdgeHeight += deltaZ;

        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        for (let i = 0, l = this.vertices.length; i < l; i += 1) {
            this.vertices[i].add(new THREE.Vector3(deltaX, deltaY, deltaZ));
        }
        for (let i = 0, l = this.editedVertices.length; i < l; i += 1) {
            this.editedVertices[i].add(new THREE.Vector3(deltaX, deltaY, deltaZ));
        }

        if (this.oldVertices) {
            for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
                this.oldVertices[i].add(new THREE.Vector3(deltaX, deltaY, deltaZ));
            }
        }
        if (this.faceMesh && this.isValidFace()) {
            this.faceMesh.geometry.translate(deltaX, deltaY, deltaZ);
        }

        // update measurement
        // // TODO this will not work in multy select
        // if (this.stage.selectionControls.getSelectedObject() === this && this.isValidFace()) {
        //     if (this.polygonMeasurement && this.oldVertices) this.polygonMeasurement.updateMeasurements(this.oldVertices);
        // }

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }
        this.hideRafter(); // hide rafters while the smartroof is dragged
        this.updateGeometry();
        this.saveState();
    }

    updateHeight(deltaZ) {
        this.outerEdgeHeight += deltaZ;
        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, deltaZ);
        }
        for (let i = 0, l = this.vertices.length; i < l; i += 1) {
            this.vertices[i].add(new THREE.Vector3(0, 0, deltaZ));
        }
        for (let i = 0, l = this.editedVertices.length; i < l; i += 1) {
            this.editedVertices[i].add(new THREE.Vector3(0, 0, deltaZ));
        }
        if (this.oldVertices) {
            for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
                this.oldVertices[i].add(new THREE.Vector3(0, 0, deltaZ));
            }
        }
        if (this.faceMesh && this.isValidFace()) {
            this.faceMesh.geometry.translate(0, 0, deltaZ);
        }

        // update measurement
        // // TODO this will not work in multy select
        // if (this.stage.selectionControls.getSelectedObject() === this && this.isValidFace()) {
        //     if (this.polygonMeasurement && this.oldVertices) this.polygonMeasurement.updateMeasurements(this.oldVertices);
        // }

        // update dimensions
        this.moveDimensions(0, 0, deltaZ);

        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i].isTemplate) {
                children[i].updateHeight(parseFloat(children[i].coreHeight) + parseFloat(deltaZ));
                children[i].hideTestEdges();
            }
            else children[i].moveObject(0, 0, deltaZ);
            // console.log('children[i]: ', children[i].isTemplate);
        }
        this.hideRafter(); // hide rafters while the smartroof is dragged
        this.updatedEditedFace();
        this.saveState();
    }

    moveChildren(deltaX, deltaY, deltaZ) {
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }
    }

    placeChildrenSmartRoofs() {
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i] instanceof SmartroofModel) {
                children[i].placeObject();
            }
        }
    }

    getChildrenModelUuids(ids) {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof PolygonModel || children[i] instanceof CylinderModel || children[i] instanceof Dormer) {
                ids.push(children[i].uuid);
                children[i].getChildrenModelUuids(ids);
            }
        }
    }

    getChildSubarrays() {
        const childSubarrays = [];
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof Subarray) {
                childSubarrays.push(children[i]);
            }
        }
        return childSubarrays;
    }

    isSubarrayPresent() {
        return this.getChildSubarrays().length > 0;
    }

    pointInPolygon(point, polygon) {
        const x = point[0];
        const y = point[1];
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i][0];
          const yi = polygon[i][1];
          const xj = polygon[j][0];
          const yj = polygon[j][1];
          const intersect =
            yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
          if (intersect) {
            inside = !inside;
          }
        }
        return inside;
      }
      
    
    async handleVertexPlace(vertex) {

        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Subarray: vertex not in outlinePoints in handleVertexPlace');
        }
        let notificationObject = this.stage.eventManager.setUpdatePanelPlacementLoading();

        try {
            // place object
            await this.placeObject();

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);

            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);
            this.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
            return Promise.reject(error);
        }
    }

    getPlacingInformation(drawingVertices) {
        const response = {};
        let numberOfPoints;
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        // Getting vertices
        let vertices2DArray;
        if (drawingVertices === null || drawingVertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        }
        else {
            vertices2DArray = drawingVertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
            parentExists = true;
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if(!(utils.checkPointOnEdgesApprx(utils.convertVectorToArray(this.vertices), vertices2DArray[0])) || !(utils.checkPointOnEdgesApprx(utils.convertVectorToArray(this.parent.oldVertices), vertices2DArray[0]))) {
                const error = new Error(VERTEX_OVER_EDGE_ERROR);
                response.errors.push(error);
                parentExists = false;
                response.pointUnplaceableError = error;
        }

        if(( this.pointInPolygon(vertices2DArray[vertices2DArray.length -1 ], this.parent.get2DVertices()) && ! this.pointInPolygon(vertices2DArray[vertices2DArray.length -1 ], utils.convertVectorToArray(this.vertices)))){
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        this.selectedEdge = this.returnPlacingEdge(utils.convertVectorToArray(this.vertices),vertices2DArray[0]);

        let erodedVertices = [];
        if (polygonExists) {
            if (vertices2DArray.length > 3) {
                erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            }
            else {
                const erodedVectorVertices = utils.generateSetbackGeometry(
                    [0.001, 0.001, 0.001],
                    this.getEdges(),
                    vertices2DArray,
                    'setbackInside',
                );
                erodedVertices = utils.convertVectorArrayTo2DArray(erodedVectorVertices);
            }

            if (erodedVertices.length === 0) {
                const error = new Error(POLYGON_WITH_NO_AREA_ERROR);
                response.errors.push(error);
                response.cannotCompleteError = error;
                parentExists = false;
            }

            if (parentExists) {
                const allModels =
                    raycastingUtils.getAllCommonModelsBelowVertices(erodedVertices, this.stage);
                //getAllCommonModelsBelowVertices is used instead of getAllModelsBelowVertices because such object is 
                // required whose all vertices cover the subarray instead of the highest object in that area.
                for (let idx = 0, len = allModels.length; idx < len; idx += 1) {
                    if (!allModels[idx][0].isIgnored()) {
                        [response.parent, response.height] = allModels[idx];
                        break;
                    }
                }
            }
        }

        return response;
    }


    initDrawingMode() {

        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    findIntersection(lineEndpoints, point) {
        // Extract endpoints of the given line
        const [x1, y1] = lineEndpoints[0];
        const [x2, y2] = lineEndpoints[1];
    
        // Calculate slope and y-intercept of the given line
        const slope = (x2 - x1) !== 0 ? (y2 - y1) / (x2 - x1) : Infinity;
        const yIntercept = slope !== Infinity ? y1 - slope * x1 : x1;
    
        // Calculate slope and y-intercept of the perpendicular line passing through the given point
        const m2 = slope !== 0 ? -1 / slope : Infinity;
        const b2 = m2 !== Infinity ? point.y - m2 * point.x : point.x;
    
        // Calculate the x-coordinate of the intersection point
        let x;
        let y;
        if(slope === 0){
            x = point.x;
            y = y1;
        }
        else if(slope === Infinity) {
            x = x1;
            y = point.y;
        }
        else {
            x =( b2 - yIntercept) / (slope - m2);
            y = slope * x + yIntercept ;
        }

        // Calculate the y-coordinate of the intersection point
        const intersectionPoint = new THREE.Vector3(x, y, 0);
    
        // Return the intersection point as an object with x and y properties
        return intersectionPoint;
      }
      

    async onComplete(geometry) {
        const editVertices = [];
        let flag = true;
        for (let i = 0; i < geometry.noOfVertices; i += 1) {
            editVertices.push(new THREE.Vector3(
                geometry.attributes.position.array[(i * 3)],
                geometry.attributes.position.array[(i * 3) + 1],
                geometry.attributes.position.array[(i * 3) + 2],
            ));
        }
        const faceOuterEdge = [new THREE.Vector2(this.outerEdge.point1.x,this.outerEdge.point1.y),new THREE.Vector2(this.outerEdge.point2.x,this.outerEdge.point2.y)]

        if(! utils.checkPointOnEdgesApprx(faceOuterEdge, [editVertices[editVertices.length - 1].x, editVertices[editVertices.length - 1].y])) {
            const test = this.findIntersection(faceOuterEdge, new THREE.Vector2(editVertices[editVertices.length - 1].x, editVertices[editVertices.length - 1].y));
            editVertices.push(test);
        }

        let coplanarFacePoints = SmartroofModel.makeCoplanar(editVertices, this);

        if(faceOuterEdge[0].distanceTo(new THREE.Vector2(editVertices[0].x, editVertices[0].y)) > faceOuterEdge[1].distanceTo(new THREE.Vector2(editVertices[0].x, editVertices[0].y))) {
            coplanarFacePoints.reverse();         
        }
        const firstPoint = new THREE.Vector2(coplanarFacePoints[0].x,coplanarFacePoints[0].y);
        const lastPoint = new THREE.Vector2(coplanarFacePoints[coplanarFacePoints.length - 1].x,coplanarFacePoints[coplanarFacePoints.length - 1].y);

        if(firstPoint.distanceTo(faceOuterEdge[0])< 0.0001) {
            coplanarFacePoints = coplanarFacePoints.slice(1);
        }
        if(firstPoint.distanceTo(faceOuterEdge[1])< 0.0001) {
            coplanarFacePoints = coplanarFacePoints.slice(1);
        }
        if(lastPoint.distanceTo(faceOuterEdge[0])< 0.0001) {
            coplanarFacePoints.pop();
        }
        if(lastPoint.distanceTo(faceOuterEdge[1])< 0.0001) {
            coplanarFacePoints.pop();
        }
        
        for(let i = 0; i< this.vertices.length; i++) {
            if(new THREE.Vector2(this.vertices[i].x,this.vertices[i].y).distanceTo(faceOuterEdge[0])<= 0.00001) {
                this.vertices.splice((i+1)%this.vertices.length,0, ...coplanarFacePoints);
                break;
            }
        }

        this.editedVertices = this.vertices;
        try {
                this.updateOutlinePoints(this.vertices)
                this.updateSetback();
                this.parent.updateGeometry();
                this.parent.getAllSmartroofIntersections();
                this.getParent().placeObject(0,0,true); 
                this.saveState();
                return Promise.resolve(true);
            }
        catch (error) {
            // console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.onCancel();
            this.saveState();
            return Promise.reject(error);
        }

    }
    resetEditedVertices() {
        this.editedVertices = [];
        this.vertices.forEach(x =>{
            this.editedVertices.push(x.clone())
        })
    }

    updatedEditedFace() {
        this.vertices = [];
        this.editedVertices.forEach(x =>{
            this.vertices.push(x.clone())
        })
        this.updateOutlinePoints(this.vertices)
        this.updateSetback();
        this.parent.updateGeometry();
        // this.parent.getAllSmartroofIntersections();
        return Promise.resolve(true);
    }

    returnPlacingEdge(vertices,point) {
        const pointVect = new THREE.Vector2(point[0], point[1]);
        const edgesOfVertices = utils.getEdges(vertices);

        for (let j = 0, mEdgeLen = edgesOfVertices.length; j < mEdgeLen; j += 1) {
            const edge = edgesOfVertices[j];
            if (Math.abs((edge[0].distanceTo(edge[1])) - (edge[0].distanceTo(pointVect) + edge[1].distanceTo(pointVect))) < 0.00001) {
                return [j,edge];
            }
        }
    }
    
    onCancel() {
    }

    removeObject(deselect = true) {
        // First deleting child subarray before other objects so that deleting walkways or other
        // objects don't refresh the subarray unnecessarily
        const childSubarrays = this.getChildSubarrays();
        for (let i = 0, len = childSubarrays.length; i < len; i += 1) {
            childSubarrays[i].removeObject();
        }

        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        // NOTE: deSelect should be after save since it will disable
        // drag controls and stop Undo/Redo container
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }
        this.fold = null;
        // remove measurements
        // if (this.polygonMeasurement) {
        //     this.polygonMeasurement.remove();
        // }

        // Remove outline points
        for (let j = this.outlinePoints.length - 1; j >= 0; j -= 1) {
            this.outlinePoints[j].removeObject();
            this.outlinePoints.splice(j, 1);
        }

        // from base object
        this.removeDimensions();

        if (this.faceMesh) {
            this.faceMesh.geometry.dispose();
            this.stage.sceneManager.scene.remove(this.faceMesh);
        }

        // remove object from hover manager
        this.stage.quadTreeManager.removeObject(this);
        this.stage.ground.faces.delete(this);

        if (deselect) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
    }

    showMeasurement() {
        // if (this.polygonMeasurement) {
        //     this.polygonMeasurement.show();
        //     this.polygonMeasurement.updateMeasurements(this.oldVertices);
        // }
    }

    hideMeasurement() {
        // if (this.polygonMeasurement) {
        //     this.polygonMeasurement.hide();
        // }
    }
    highlightOnHover() {
        if (!this.faceMesh.visible) {
            // this.faceMesh.geometry.translate(0, 0, 0.00001);
            this.faceMesh.visible = true;
        }
    }
    unHighlight() {
        if (this.faceMesh.visible) {
            // this.faceMesh.geometry.translate(0, 0, -0.00001);
            this.faceMesh.visible = false;
        }
    }

    updateVisualsBasedOnStates() {
        const newColors = this.getColorMap();

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        }
        else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getTilt() {
        // return this.tilt;
        return this.getValidTilt(this.tilt);
    }

    getAzimuth() {
        return this.azimuth;
    }

    getOuterEdgeVector() {
        const vertices = this.get2DVectorVertices();
        const start = vertices[0];
        const end = vertices[vertices.length - 1];
        return (new THREE.Vector3(end.x - start.x, end.y - start.y, 0)).normalize();
    }

    getRafterVector() {
        if (this.outerEdge) {
            return this.outerEdge.getEdgeVector();
        }
        else {
            const point1 = this.outlinePoints[this.outlinePoints.length -1].getPosition();
            const point2 = this.outlinePoints[0].getPosition();
            return (new Vector3(point2.x - point1.x, point2.y - point1.y, 0)).normalize();
        }
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.POLYGON;
        if (this.materialState) {
            return colorMapping[this.materialState][VISUAL_STATES.DEFAULT_STATES.DEFAULT];
        }
        return {};
    }

    hideSetback() {
        this.setbackInsideMesh.visible = false;
    }

    hasPanel() {
        const children = this.getChildren();
        let flag = false;
        if (children) {
            children.forEach((child) => {
                if (child instanceof Subarray) {
                    flag = true;
                }
            });
        }
        return flag;
    }

    showSetback() {
        if (this.stage.viewManager.setbackVisible) {
            this.setbackInsideMesh.visible = true;
        }
    }

    get numVertices() {
        return this.outlinePoints.length;
    }

    static getObjectType() {
        return 'SmartroofModel';
    }

    isIgnored() {
        return this.ignored;
    }

    isSetbackIntersecting(instancedMesh, id) {
        try {
            const mesh = instancedMesh._instancedMesh;
            const mat4 = new THREE.Matrix4();
            mesh.getMatrixAt(id, mat4);
            const instanceVertices = instancedMesh.vertices.map((vertex) => {
                return new THREE.Vector3(vertex[0], vertex[1], 0).applyMatrix4(mat4);
            });
            let vertices = instanceVertices;

            // convert both the vertices to 2D array type for GJK
            vertices = vertices.map((vertex) => [vertex.x, vertex.y]);

            for (let i = 0; i < this.setbackInsideVerts.length; i += 1) {
                let setbackGeometryVertices = this.setbackInsideVerts[i];
                setbackGeometryVertices = setbackGeometryVertices.map((vertex) => [vertex.x, vertex.y]);
                for (let j = 0; j < setbackGeometryVertices.length; j += 1) {
                    const edge = [setbackGeometryVertices[j], setbackGeometryVertices[(j + 1) % setbackGeometryVertices.length]];
                    for (let k = 0; k < vertices.length; k += 1) {
                        const edge2 = [vertices[k], vertices[(k + 1) % vertices.length]];
                        if (gjk.intersect(edge, edge2)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        catch(e) {
            console.error('error in setback intersection check', e);
            return false;
        }
    }

}

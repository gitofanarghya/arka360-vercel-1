import * as THREE from 'three';
import {
    POINT_SIZE,
    VISUAL_STATES,
    COLOR_MAPPINGS,
    MATERIAL_STATES,
} from '../objects/visualConstants';
import {
    getHighestZ,
    getNormalizedCameraCoordinates,
    drawingArrayToVectorArray,
    checkIfPointLiesOnLineSegment,
    nearestEdgeToVertex,
    nearestVertexToVertex,
    convertArrayToVector,
} from '../utils/utils';
import { updateMeshWithColor } from '../utils/visualUtils';
import { isMirrorSupported } from '../utils/mirrorUtils';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';

export default class MirrorManager {
    constructor(stage) {
        this.stage = stage;
        this.enabled = false;
        this.currentMirroringObject = null;
        this.duplicateObjects = null;
        this.highestZ = 0;

        this.pointsMesh = null;
        this.pointMaterial = new THREE.PointsMaterial({
            size: POINT_SIZE,
        });

        this.mousePoint = new THREE.Vector3();
        this.vertices = new Float32Array(1 * 3);
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;

        this.canvas = stage.rendererManager.getDomElement();
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('click', this.onClick, false);
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.canvas.removeEventListener('click', this.onClick, false);
            this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
        }
    }

    initPoints() {
        // Geometry for points
        const pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        // Use default point material for points
        const { pointMaterial } = this;

        this.pointsMesh = new THREE.Points(pointGeometry, pointMaterial);
        this.pointsMesh.name = 'Edge Selection Point';
        this.pointsMesh.geometry.setDrawRange(0, 0);
        this.pointsMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.pointsMesh);
    }

    initialize(object, duplicateObjects, offsetX = 0, offsetY = 0) {
        if (!isMirrorSupported(object)) {
            this.stage.eventManager
                .customErrorMessage('Object not supported for mirroring');
            return false;
        }

        if (object.getPlacingInformation().errors.length !== 0) {
            this.stage.eventManager
                .customErrorMessage('Mirroring not supported for object outside Ground');
            return false;
        }

        this.currentMirroringObject = object;
        this.duplicateObjects = duplicateObjects;
        this.enable();
        this.highestZ = getHighestZ(this.stage.ground) + 10; // greater than placeManager.

        this.initPoints();
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.offsetVector = new THREE.Vector2(offsetX, offsetY);
        this.stage.eventManager.setButtonStatusWhileMirroring(this.exitMirrorMode.bind(this));
        this.stage.snapManager.initialize(this.currentMirroringObject, null, { mirrorMode: true });

        this.updateVisualsForMirrorMode(true);
        return true;
    }

    reset() {
        this.mousePoint = new THREE.Vector3();
        this.pointsMesh = null;
        this.highestZ = 0;

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;

        this.currentMirroringObject = null;
        this.duplicateObjects = null;
    }

    getVertexSnapPoint(event) {
        const snappedPoint = this.stage.snapManager.vertexSnap(event);
        const mousePoint =
            getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
        const allVertices = drawingArrayToVectorArray(this.vertices, this.numVertices);

        // Check if the snapped point is the same as any other vertex
        for (let i = 1; i < allVertices.length - 1; i += 1) {
            if (allVertices[i].distanceTo(snappedPoint) <= 0.0001) {
                return mousePoint;
            }
        }

        // Check if the snapped point lies on any edge
        for (let i = 1; i < allVertices.length - 2; i += 1) {
            if (checkIfPointLiesOnLineSegment(
                [allVertices[i], allVertices[i + 1]],
                snappedPoint,
            )) {
                return mousePoint;
            }
        }
        return snappedPoint;
    }

    updateVisualsForMirrorMode(enabled) {
        if (enabled) {
            this.currentMirroringObject.hideParapet();
            for (let i = 0, len = this.duplicateObjects.length; i < len; i += 1) {
                for (let j = 0, holderLen = this.duplicateObjects[i].length;
                    j < holderLen; j += 1) {
                    this.duplicateObjects[i][j].hideParapet();
                }
            }
            this.stage.ground.switchVisualState(VISUAL_STATES.MIRROR_MODE, true);
            this.currentMirroringObject.switchVisualState(VISUAL_STATES.EDGE_HIGHLIGHT, false);
        }
        else {
            this.currentMirroringObject.showParapet();
            for (let i = 0, len = this.duplicateObjects.length; i < len; i += 1) {
                for (let j = 0, holderLen = this.duplicateObjects[i].length;
                    j < holderLen; j += 1) {
                    this.duplicateObjects[i][j].showParapet();
                }
            }
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
        }
    }

    getColorForState(state) {
        let newColor = null;
        if (this.currentMirroringObject instanceof PolygonModel) {
            newColor = COLOR_MAPPINGS.POLYGON[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentMirroringObject instanceof CylinderModel) {
            newColor = COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.TRANSLUCENT][state];
        }

        return newColor;
    }

    updatePointWithNewColor(newColor) {
        if (newColor.OUTLINE_POINT_COLOR === undefined) {
            updateMeshWithColor(newColor.EDGE_COLOR, this.pointsMesh);
        }
        else {
            updateMeshWithColor(newColor.OUTLINE_POINT_COLOR, this.pointsMesh);
        }
    }

    onMouseMove = (event) => {
        this.mousePoint = this.getVertexSnapPoint(event);

        if (this.isSafe()) {
            this.updatePointWithNewColor(this
                .getColorForState(VISUAL_STATES.DEFAULT_STATES.DEFAULT));
        }
        else {
            this.updatePointWithNewColor(this
                .getColorForState(VISUAL_STATES.ERROR));
        }

        this.vertices[0] = this.mousePoint.x;
        this.vertices[1] = this.mousePoint.y;
        this.vertices[2] = this.highestZ;

        this.pointsMesh.geometry.setDrawRange(0, 1);
        this.pointsMesh.geometry.attributes.position.needsUpdate = true;
    };

    mirrorObjects(nearestEdge) {
        const objectDisplacement = this.currentMirroringObject
            .mirrorObjectAlongEdge(nearestEdge, { maintainCentroid: true });
        for (let i = 0, len = this.duplicateObjects.length; i < len; i += 1) {
            for (let j = 0, holderLen = this.duplicateObjects[i].length; j < holderLen; j += 1) {
                this.duplicateObjects[i][j]
                    .mirrorObjectAlongEdge(nearestEdge, { maintainCentroid: true });
            }
        }
        const mouseOffsetPos = this.currentMirroringObject.getPosition().sub(this.offsetVector);
        this.stage.duplicateManager
            .mirrorMousePoint(mouseOffsetPos, nearestEdge, objectDisplacement);
    }

    isSafe() {
        const pointDistance = nearestVertexToVertex(
            this.mousePoint,
            convertArrayToVector(this.currentMirroringObject.get2DVertices()),
        )[1];
        const edgeDistance =
            nearestEdgeToVertex(this.mousePoint, this.currentMirroringObject.getEdges())[1];

        if (Math.abs(edgeDistance) <= 0.001 && pointDistance >= 0.001) {
            return true;
        }
        return false;
    }

    onClick = (event) => {
        this.mousePoint = this.getVertexSnapPoint(event);

        if (this.isSafe()) {
            const nearestEdge =
                nearestEdgeToVertex(this.mousePoint, this.currentMirroringObject.getEdges())[0];
            this.mirrorObjects(nearestEdge);
            this.stage.selectionControls.setSelectedObjects([this.currentMirroringObject]);
            this.currentMirroringObject.hideMeasurement();
            this.exitMirrorMode();
        }
        else {
            this.stage.eventManager
                .customErrorMessage('Click on an edge of highlighted object to mirror along that edge');
        }
    };

    exitMirrorMode() {
        this.stage.snapManager.unInitialize();
        this.updateVisualsForMirrorMode(false);
        this.disable();
        this.reset();
        this.stage.duplicateManager.disableMirrorMode();
    }

    isEnabled() {
        return this.enabled;
    }
}

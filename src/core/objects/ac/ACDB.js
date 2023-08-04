import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import BaseObject from '../../objects/BaseObject';
import PolygonModel from '../model/PolygonModel';
import CylinderModel from '../model/CylinderModel';
import Ground from '../ground/Ground';
import Subarray from '../subArray/Subarray';
import Walkway from '../model/Walkway';
import { verticesToJSTSPolygon } from '../../utils/JSTSConverter';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    ACDB_WITH_NO_AREA_ERROR,
    INTERSECTING_AC_COMPONENT_ERROR,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../visualConstants';
import { setbackPolygon, convertArrayToVector, convertArrayTo3DVector } from '../../utils/utils';
import * as visualUtils from '../../utils/visualUtils';
import {
    areVerticesOnGround,
    getAllModelsBelowVertices,
} from '../../utils/raycastingUtils';
import { getTableCoordinates } from '../../utils/subarrayUtils';
import Tree from '../model/Tree';
import Inverter from '../ac/Inverter';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import AcCable from '../model/cable/AcCable';
import { MaterialLoader, MeshBasicMaterial } from 'three';
import _, { indexOf } from 'lodash';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import NikGeometry from '../ground/NikGeometry';

export default class ACDB extends BaseObject {
    constructor(stage) {
        super(stage);

        // standard norms
        this.stage = stage;
        this.id = this.stage.getACDBId();
        this.name = `ACDB #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.cablesList = [];

        // list of vertices
        this.outlinePoints = [];

        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .ACDB[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.meshMaterial2D.defines = this.meshMaterial2D.defines || {};
        this.meshMaterial2D.defines.CUSTOM = '';

        this.meshMaterial3D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS.ACDB[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.meshMaterial3D.defines = this.meshMaterial3D.defines || {};
        this.meshMaterial3D.defines.CUSTOM = '';

        this.pillarMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .INVERTER[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PILLAR_COLOR,
        });
        this.meshMaterial2D.defines = this.meshMaterial2D.defines || {};
        this.meshMaterial2D.defines.CUSTOM = '';

        this.pillarMaterial3D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS.INVERTER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PILLAR_COLOR,
        });
        this.meshMaterial3D.defines = this.meshMaterial3D.defines || {};
        this.meshMaterial3D.defines.CUSTOM = '';

        this.edgeMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .ACDB[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        this.coreMesh = createMesh(
            createBufferGeometry(),
            this.meshMaterial2D,
        );
        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this.edgeMaterial,
        );

        this.pillarMesh = createMesh(
            createBufferGeometry(),
            this.meshMaterial2D,
        );
        this.pillarMesh.receiveShadow = true;
        this.pillarMesh.castShadow = true;

        this.pillarEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.pillarMesh.geometry),
            this.edgeMaterial,
        );

        this.objectsGroup.add(this.pillarMesh);
        this.objectsGroup.add(this.pillarEdges);

        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        this.baseHeight = 0;
        const moduleData = this.getDefaultValues();
        this.azimuth = moduleData.azimuth;
        this.moduleDimensions = {
            moduleWidth: '1.2',
            moduleHeight: '0.3',
            moduleDepth: '1.5',
            pillarRadius: 0.02,
        };

        this.pillarHeight = moduleData.mountHeight;

        this.prevIntersectingSubarrays = [];

        this.updateGeometry();

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.updateVisualsAfterLoadingAndCreation();
    }

    getState() {
        const acdbData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            pillarHeight: this.pillarHeight,
            azimuth: this.azimuth,
            cable: this.cablesList.map(cable => [
                cable.uuid,
            ]),

            // saving outline points
            outlinePoints: [...this.outlinePoints],

            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return acdbData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load properties
            this.baseHeight = state.baseHeight;
            this.pillarHeight = state.pillarHeight;
            this.azimuth = state.azimuth;
            this.cablesList = [];
            for (let i = 0; i < state.cable.length; i++) {
                const cable = this.stage.getObject(state.cable[i]);
                this.cablesList.push(cable);
                cable.saveState();
            }

            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.outlinePoints = [...state.outlinePoints];
            } else {
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('ACDB: loadState: vertices length don\'t match');
                    return null;
                }
                this.outlinePoints = [...state.outlinePoints];
            }

            // update geometry
            this.updateGeometry();
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);
    }

    saveObject(isCopy = false) {
        const acdbModelData = {
            type: ACDB.getObjectType(),
        };

        // save id and name
        acdbModelData.id = this.id;
        acdbModelData.name = this.name;
        acdbModelData.cableId = this.cablesList.map(cable => [
            cable.id,
        ]);
        if (isCopy) {
            acdbModelData.uuid = this.uuid;
        }

        acdbModelData.baseHeight = this.baseHeight;
        acdbModelData.pillarHeight = this.pillarHeight;
        acdbModelData.azimuth = this.azimuth;

        acdbModelData.outlinePoints = [...this.outlinePoints];

        return acdbModelData;
    }

    loadObject(acdbModelData, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = acdbModelData.id;
            this.name = acdbModelData.name;
        }

        this.baseHeight = acdbModelData.baseHeight;
        this.pillarHeight = acdbModelData.pillarHeight;
        this.azimuth = acdbModelData.azimuth;
        this.cablesList = [];
        // dc cable disabled
        // this.getAllCables(acdbModelData.cableId);

        this.outlinePoints = [...acdbModelData.outlinePoints];

        // update geometry
        this.updateGeometry();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        } else {
            this.saveState({ withoutContainer: true });
        }
    }

    exportAsSTL() {
        const { coreMesh, pillarMesh } = this;
        coreMesh.updateMatrix();
        pillarMesh.updateMatrix();
        const singleGeometry = BufferGeometryUtils.mergeGeometries([
            coreMesh.geometry,
            pillarMesh.geometry,
        ]);


        const mesh = createMesh(singleGeometry, new THREE.MeshBasicMaterial());

        return [{
            mesh,
            name: this.name,
        }];
    }

    exportAsCollada() {
        const { coreMesh, pillarMesh } = this;
        coreMesh.updateMatrix();
        pillarMesh.updateMatrix();
        const singleGeometry = BufferGeometryUtils.mergeGeometries([
            coreMesh.geometry,
            pillarMesh.geometry,
        ]);


        const mesh = createMesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: COLOR_MAPPINGS
                    .ACDB[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .MESH_COLOR,
                transparent: true,
                opacity: 0.6,
            }),
        );

        mesh.name = this.name;
        return {
            model: mesh,
            subarray: [],
        };
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();

        this.azimuth = mirroredData.azimuth;
        this.outlinePoints = [];
        for (let i = 0, len = mirroredData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push([
                mirroredData.outlinePoints[i][0],
                mirroredData.outlinePoints[i][1],
                mirroredData.outlinePoints[i][2],
            ]);
        }

        // polygon measurement reverses the vertices order in case they are anti-clockwise
        // so passing outline points directly to polygon measurement affects original array
        // which reverse the edge setback value
        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            children[i].mirrorObjectAlongEdge(edge);
        }

        if (maintainCentroid) {
            const newPosition = this.getPosition();
            // We want the mirror to be in the exact same position of the original object
            // so moving the base by a displacement of original - new
            // this move should not affect any attached dimension.
            const deltaX = oldPosition.x - newPosition.x;
            const deltaY = oldPosition.y - newPosition.y;
            this.moveObject(deltaX, deltaY, 0);
            this.moveDimensions(-deltaX, -deltaY, 0);
            return new THREE.Vector2(deltaX, deltaY);
        }
        return new THREE.Vector2(0, 0);
    }

    updateGeometry(rotatedVertices = null) {
        let vertices2DVectorArray;
        if (rotatedVertices !== null) {
            vertices2DVectorArray = convertArrayTo3DVector(rotatedVertices);
        }
        else {
            vertices2DVectorArray = convertArrayTo3DVector(this.get2DVertices());
        }
        vertices2DVectorArray.forEach((element) => {
            element.z = 0;
        });
        // create core
        const geometry = new NikGeometry(this.stage);
        const acdbGeometry = geometry.createFromPoints(vertices2DVectorArray, 2);
        acdbGeometry.translate(0, 0, this.baseHeight);

        this.coreMesh.geometry = acdbGeometry;

        const pillarGeomettries = [];
        let pillarGeometry = createBufferGeometry();

        if ((this.getParent() instanceof PolygonModel ||
                this.getParent() instanceof CylinderModel ||
                this.getParent() instanceof Ground) &&
            this.getParent().getTilt() === 0) {
            const position = this.getPosition();
            const pillarCenters = getTableCoordinates(
                [position.x, position.y, position.z],
                1, 1,
                this.moduleDimensions.moduleWidth - (2 * this.moduleDimensions.pillarRadius),
                this.moduleDimensions.moduleHeight - (2 * this.moduleDimensions.pillarRadius),
                this.azimuth, 0,
                0, 0,
                0,
            )[0].corners;
            const cylinder = new THREE.CylinderGeometry(
                this.moduleDimensions.pillarRadius,
                this.moduleDimensions.pillarRadius,
                this.pillarHeight,
                32,
            ).toNonIndexed().rotateX(Math.PI / 2);

            const pillar1 = cylinder.clone().translate(
                pillarCenters[0][0],
                pillarCenters[0][1],
                this.baseHeight + (this.pillarHeight / 2),
            );
            pillarGeomettries.push(pillar1);

            const pillar2 = cylinder.clone().translate(
                pillarCenters[1][0],
                pillarCenters[1][1],
                this.baseHeight + (this.pillarHeight / 2),
            );
            pillarGeomettries.push(pillar2);


            const pillar3 = cylinder.clone().translate(
                pillarCenters[2][0],
                pillarCenters[2][1],
                this.baseHeight + (this.pillarHeight / 2),
            );
            pillarGeomettries.push(pillar3);


            const pillar4 = cylinder.clone().translate(
                pillarCenters[3][0],
                pillarCenters[3][1],
                this.baseHeight + (this.pillarHeight / 2),
            );
            pillarGeomettries.push(pillar4);


            acdbGeometry.translate(0, 0, this.pillarHeight);
            pillarGeometry = BufferGeometryUtils.mergeGeometries(pillarGeomettries);
        }

        this.pillarMesh.geometry = pillarGeometry;
        this.pillarEdges.geometry = new THREE.EdgesGeometry(pillarGeometry);
        this.coreEdges.geometry = new THREE.EdgesGeometry(acdbGeometry);
    }

    updateRotation() {
        // Temporary method for allowing acdb rotation, using table generation algo.
        const position = this.getPosition();
        const map = getTableCoordinates(
            [position.x, position.y, position.z], 1,
            1, this.moduleDimensions.moduleWidth, this.moduleDimensions.moduleHeight,
            this.azimuth, 0,
            0, 0,
            0,
        );
        this.updateGeometry(map[0].corners);
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.baseHeight += deltaZ;

        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        this.pillarMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.pillarEdges.geometry.translate(deltaX, deltaY, deltaZ);

        this.outlinePoints = this.get3DVertices();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        this.saveState();
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        for (let i = 0; i < this.cablesList.length; i++) {
            let point1 = this.outlinePoints[0];
            let point2 = this.cablesList[i].inverter.get2DVertices()[0];
            point1 = new THREE.Vector3(point1[0], point1[1], point1[2]);
            point2 = new THREE.Vector3(point2[0], point2[1], point2[2]);
            let vertices = [point1, point2];
            this.cablesList[i].drawCableBetween2Points(vertices);
        }
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setACDBOutOfGroundRemoved();
            } else if (error.message === INTERSECTING_AC_COMPONENT_ERROR) {
                this.stage.eventManager.inverterRemoved();
            }

            this.removeObject();
            return Promise.reject(error);
        }
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);

        // really?
        this.baseHeight = newHeight;
        this.updateGeometry();

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        try {
            await this.handleSiblingConsequences();

            this.resetGrandParentSolarAccess();

            // Saving state after the object is placed
            this.saveState();
        } catch (error) {
            console.error('ERROR: ACDB: placeObject failed', error);
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    }

    async removeObject() {
        const allCables = [];
        for (let i = 0; i < this.cablesList.length; i++) {
            allCables.push(this.cablesList[i]);
        }
        for (let i = 0; i < allCables.length; i++) {
            allCables[i].removeObject();
            // this.cablesList[i].inverter.acCableAttached = null;
            // this.cablesList[i].inverter = null;
        }
        let currentIntersectingSubarrays = [];

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        // NOTE: deSelect should be after save,
        // since it will disable drag controls and stop Undo/Redo container
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.cablesList = [];
        if (this.getParent() !== null) {
            currentIntersectingSubarrays = this.getIntersectingSubarrays();
            this.getParent().removeChild(this);
        }
        // from base object
        this.removeDimensions();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
    }

    initACDBPlacingMode() {
        this.stage.stateManager.startContainer();
        this.stage.placeManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
            0,
            0, { moveWithOffset: true },
        );

        this.stage.selectionControls.setSelectedObject(this);
    }

    onCancel() {
        this.removeObject();
        this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }

    async onComplete() {
        const notificationObject = this.stage.eventManager.setACDBCreating();
        try {
            await this.placeObject();
            this.stage.stateManager.stopContainer();
            this.stage.eventManager.completeACDBCreation(notificationObject);
            this.stage.selectionControls.setSelectedObject(this);
        } catch (error) {
            console.error('ERROR: ACDB: OnComplete failed.', error);
            this.removeObject();
            this.stage.stateManager.stopContainer({ discard: true });
            this.stage.eventManager.errorACDBCreation(notificationObject);
        }
        return Promise.resolve(true);
    }

    handleDragStart() {
        this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        const notificationObject = this.stage.eventManager.setACDBLoading();
        try {
            await this.placeObject();
            this.stage.eventManager.completeACDBLoading(notificationObject);
        } catch (error) {
            console.error('ERROR ACDB: handleDragEnd failed', error);
            this.stage.eventManager.completeACDBLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    async handleSiblingConsequences() {
        const allPromises = [];

        const siblings = this.getParent().getChildren();

        const currentIntersectingSubarrays = this.getIntersectingSubarrays();
        for (let i = 0, len = currentIntersectingSubarrays.length; i < len; i += 1) {
            currentIntersectingSubarrays[i].deleteTableInsideArea(this.get2DVertices());
        }

        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Walkway) {
                const placingPolygon =
                    verticesToJSTSPolygon(this.get2DVertices());
                const siblingPolygon = verticesToJSTSPolygon(sibling.get2DVertices());
                const intersectingPolygon = placingPolygon.intersection(siblingPolygon);
                if (intersectingPolygon.getArea() > 0) {
                    allPromises.push(sibling.placeObject());
                }
            }
        }

        try {
            await Promise.all(allPromises);
        } catch (error) {
            console.error('ERROR: ACDB: handleSiblingConsequences failed', error);
        }
        return Promise.resolve(true);
    }

    // async handleSiblingConsequences() {
    //     const allPromises = [];

    //     const siblings = this.getParent().getChildren();

    //     for (let i = 0, len = this.prevIntersectingSubarrays.length; i < len; i += 1) {
    //         allPromises.push(this.prevIntersectingSubarrays[i].updatePanelPlacement({
    //             withoutContainer: false,
    //             noRefresh: true,
    //         }));
    //     }

    //     const currentIntersectingSubarrays = this.getIntersectingSubarrays();
    //     for (let i = 0, len = currentIntersectingSubarrays.length; i < len; i += 1) {
    //         if (!this.prevIntersectingSubarrays.includes(currentIntersectingSubarrays[i])) {
    //             allPromises.push(currentIntersectingSubarrays[i].updatePanelPlacement({
    //                 withoutContainer: false,
    //                 noRefresh: true,
    //             }));
    //         }
    //     }

    //     for (let i = siblings.length - 1; i >= 0; i -= 1) {
    //         const sibling = siblings[i];
    //         if (sibling instanceof Walkway) {
    //             const placingPolygon =
    //                 verticesToJSTSPolygon(this.get2DVertices());
    //             const siblingPolygon = verticesToJSTSPolygon(sibling.get2DVertices());
    //             const intersectingPolygon = placingPolygon.intersection(siblingPolygon);
    //             if (intersectingPolygon.getArea() > 0) {
    //                 allPromises.push(sibling.placeObject());
    //             }
    //         }
    //     }

    //     try {
    //         await Promise.all(allPromises);
    //     } catch (error) {
    //         console.error('ERROR: ACDB: handleSiblingConsequences failed', error);
    //     }
    //     return Promise.resolve(true);
    // }

    onSelect() {
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
        );
        this.switchVisualState(VISUAL_STATES.EDGE_HIGHLIGHT, false);
    }

    deSelect() {
        this.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, false);
    }

    showObject() {
        this.objectsGroup.visible = true;
    }

    hideObject() {
        this.objectsGroup.visible = false;
    }

    showObjectLayer() {
        // In future if layers are used,
        // it needs to be checked if the camera and model are in the same layer or not!
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
    }

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
    }

    drawAcCable(inverter) {
        let point1 = this.outlinePoints[0];
        let point2 = inverter.get2DVertices()[0];
        point1 = new THREE.Vector3(point1[0], point1[1], point1[2]);
        point2 = new THREE.Vector3(point2[0], point2[1], point2[2]);
        let vertices = [point1, point2];
        const ACCable = new AcCable(this.stage);
        this.stage.stateManager.startContainer();
        ACCable.drawCableBetween2Points(vertices);
        this.stage.stateManager.stopContainer();
        this.cablesList.push(ACCable);
        inverter.acCableAttached = ACCable;
        ACCable.inverter = inverter;
        ACCable.acdbAttached = this;
    }

    deleteAcCable(inverter) {
        this.stage.stateManager.startContainer();
        inverter.acCableAttached.removeObject();
        this.stage.stateManager.stopContainer();
    }

    async changePropertiesDuringCreation(data) {
        if (Object.prototype.hasOwnProperty.call(data, 'azimuth') &&
            data.azimuth !== this.azimuth) {
            this.azimuth = data.azimuth;
            this.updateRotation();
        }
        if (Object.prototype.hasOwnProperty.call(data, 'mountHeight') &&
            data.mountHeight !== this.pillarHeight) {
            this.pillarHeight = data.mountHeight;
            this.updateGeometry();
        }
    }

    async updateObject(data) {
        let placeRequired = false;
        if (Object.prototype.hasOwnProperty.call(data, 'azimuth') &&
            data.azimuth !== this.azimuth) {
            this.azimuth = data.azimuth;
            this.updateRotation();
            placeRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'mountHeight') &&
            data.mountHeight !== this.pillarHeight) {
            this.pillarHeight = data.mountHeight;
            this.updateGeometry();
        }

        if (placeRequired) {
            await this.placeObject();
        }
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.ACDB;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    switchMaterialState(newMaterialState, recursive) {
        if (recursive) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].switchMaterialState(newMaterialState, recursive);
            }
        }
        if (this.stage.visualManager.in3D) {
            this.materialState = MATERIAL_STATES.SOLID;
            this.updateVisualsBasedOnStates();
        } else if (this.materialState !== newMaterialState) {
            this.materialState = newMaterialState;
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            if (this.coreMesh.material !== this.meshMaterial3D) {
                this.coreMesh.material = this.meshMaterial3D;
                this.pillarMesh.material = this.pillarMaterial3D;
            }
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            if (this.coreMesh.material !== this.meshMaterial2D) {
                this.coreMesh.material = this.meshMaterial2D;
                this.pillarMesh.material = this.pillarMaterial2D;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges);
    }

    getPosition() {
        const num = this.coreMesh.geometry.attributes.position.count;

        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let i = 0; i < num; i += 1) {
            cumulativeX += this.coreMesh.geometry.attributes.position.getX(i);
            cumulativeY += this.coreMesh.geometry.attributes.position.getY(i);
            cumulativeZ += this.coreMesh.geometry.attributes.position.getZ(i);
            count += 1;
        }
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    getPlacingInformation() {
        let parentExists = true;
        const response = {};
        response.pointUnplaceableError = null;
        response.errors = [];

        // Getting vertices
        const vertices2DArray = this.get2DVertices();

        if (!areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        if (parentExists) {
            // using raycaster to get the top most model in new place
            // and get height of it for deltaZ
            // but ignoring this model or its child as we don't want to place over them
            const idsToIgnore = [this.uuid];
            let erodedVertices;
            // To accommodate for snapping
            if (vertices2DArray !== null) {
                erodedVertices = setbackPolygon(
                    vertices2DArray, -0.001,
                );
            }

            if (erodedVertices.length !== 0) {
                const allBelowModels = getAllModelsBelowVertices(
                    erodedVertices,
                    this.stage, { includeObstacles: true },
                );
                let [newParent, newHeight] = [-1, -1];
                for (let i = 0; i < allBelowModels.length; i += 1) {
                    const model = allBelowModels[i][0];
                    const height = allBelowModels[i][1];
                    if (!idsToIgnore.includes(model.uuid)) {
                        if (newHeight < height) {
                            [newParent, newHeight] = [model, height];
                        }
                    }
                }

                response.parent = newParent;
                response.height = newHeight;

                if (newParent instanceof Inverter ||
                    newParent instanceof ACDB ||
                    newParent instanceof Tree) {
                    response.errors.push(new Error(INTERSECTING_AC_COMPONENT_ERROR));
                }
            } else {
                response.errors.push(new Error(ACDB_WITH_NO_AREA_ERROR));
            }
        }
        return response;
    }

    get2DVertices() {
        let vertices = [];

        const { outlinePoints } = this;
        if (outlinePoints.length === 0) {
            return this.getInitial2DVertices();
        }
        vertices = [...this.outlinePoints];
        return vertices;
    }

    get3DVertices() {
        const vertices = [];
        const meshVertices = this.getTopVerticesFromGeometry();
        for (let i = 0, len = meshVertices.length; i < len; i += 1) {
            vertices.push([
                meshVertices[i].x,
                meshVertices[i].y,
                meshVertices[i].z,
            ]);
        }
        return vertices;
    }

    getEdges() {
        const vertices = convertArrayToVector(this.get2DVertices());
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

    getInitial2DVertices() {
        const position = new THREE.Vector3();
        const vertices = getTableCoordinates(
            [position.x, position.y, position.z], 1,
            1, this.moduleDimensions.moduleWidth, this.moduleDimensions.moduleHeight,
            this.azimuth, 0,
            0, 0,
            0,
        )[0].corners;

        return vertices;
    }

    getHighestZ() {
        let highestZ = 0;
        const { array } = this.coreMesh.geometry.attributes.position;

        for (let i = 2; i < array.length; i += 3) {
            const z = array[i];

            if (z) {
                highestZ = Math.max(highestZ, z);
            }
        }
        return highestZ;
    }

    getZOnTopSurface(x, y) {
        const topSurfaceVertices = convertArrayTo3DVector(this.get3DVertices());

        const v1 = topSurfaceVertices[0].clone();
        let v2 = topSurfaceVertices[1].clone();
        const v3 = topSurfaceVertices[2].clone();

        v1.addScaledVector(v2, -1);
        v3.addScaledVector(v2, -1);
        v1.cross(v3);
        v2 = topSurfaceVertices[1].clone();
        const d = -1 * ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
        return -1 * ((d / v1.z) + ((v1.y * y) / v1.z) + ((v1.x * x) / v1.z));
    }

    getIntersectingSubarrays() {
        const intersectingSubarrays = [];
        const siblings = this.getParent().getChildren();
        for (let i = 0, len = siblings.length; i < len; i += 1) {
            if (siblings[i] instanceof Subarray) {
                const walkwayPolygon = verticesToJSTSPolygon(this.get2DVertices());
                const siblingPolygon = verticesToJSTSPolygon(siblings[i].get2DVertices());
                const intersectingPolygon = walkwayPolygon.intersection(siblingPolygon);
                if (intersectingPolygon.getArea() > 0) {
                    intersectingSubarrays.push(siblings[i]);
                }
            }
        }
        return intersectingSubarrays;
    }

    getAllCables(cableId) {
        const allCables = this.stage.ground.allCables;
        for (let i = 0; i < cableId.length; i++) {
            for (let j = 0; j < allCables.length; j++) {
                if (allCables[j].cable instanceof AcCable && allCables[j].cable.id == cableId[i]) {
                    allCables[j].cable.acdbAttached = this;
                    this.cablesList.push(allCables[j].cable);
                }
            }
        }
    }

    getDefaultValues() {
        return this.stage.getDesignSettings().drawing_defaults.acdb;
    }

    isIgnored() {
        return this.ignored;
    }

    getTopVerticesFromGeometry() {
        const heightZ = this.getHighestZ();
        const topVertices = [];
        const { count } = this.coreMesh.geometry.attributes.position;

        for (let i = 0; i < count; i += 1) {
            const z = this.coreMesh.geometry.attributes.position.getZ(i);
            const x = this.coreMesh.geometry.attributes.position.getX(i);
            const y = this.coreMesh.geometry.attributes.position.getY(i);
            if (z === heightZ) {
                topVertices.push(new THREE.Vector3(x, y, z));
            }
        }
        const vertices = Array.from(new Set(topVertices.map(JSON.stringify)), JSON.parse);
        return vertices;
    }

    get ignored() {
        return false;
    }

    get placable() {
        return false;
    }

    get mesh() {
        return this.coreMesh;
    }

    get mergeMeshMaterial2D() {
        return this.meshMaterial2D;
    }

    get mergeMeshMaterial3D() {
        return this.meshMaterial3D;
    }

    get mergeEdgeMaterial2D() {
        return this.edgeMaterial;
    }

    get mergeEdgeMaterial3D() {
       return this.edgeMaterial;
    }

    static getObjectType() {
        return 'ACDB';
    }
}
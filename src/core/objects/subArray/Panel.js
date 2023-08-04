import * as THREE from "three";
import BaseObject from "../../objects/BaseObject";
import * as raycastingUtils from "../../utils/raycastingUtils";
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_ASSOCIATED_MODEL_ERROR,
    OUT_OF_GROUND_ERROR,
} from '../../coreConstants';
import SelectionTree from "../../lib/SelectionTree";
import * as utils from "../../utils/utils";
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES } from '../visualConstants';
import * as visualUtils from '../../utils/visualUtils';
import MicroInverter from "../ac/MicroInverter";
import createBufferGeometry, { createMesh } from "../../utils/meshUtils";

export default class Panel extends BaseObject {
    constructor(stage, panelMap) {
        super(stage);

        this.stage = stage;
        this.id = parseInt(panelMap.id);
        this.name = `Panel #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;

        this.solarAccess = panelMap.hasOwnProperty('solarAccess')
            ? parseFloat(panelMap.solarAccess)
            : 0;
        this.hidden = panelMap.hasOwnProperty('hidden') ? panelMap.hidden : false;
        this.electricalComponentConnected = null;
        this.positionBeforeStart = 0;
        // Materials

        // Default mesh and edge materials
        // When textures aren't loaded
        this.meshMaterial = new THREE.MeshBasicMaterial({
            transparent: false,
            color: COLOR_MAPPINGS
                .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.edgeMaterial = new THREE.LineBasicMaterial({
            color: COLOR_MAPPINGS
                .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        // Shadow Material when textures aren't loaded
        this.shadowMaterial = new THREE.MeshLambertMaterial({
            shadowSide: THREE.FrontSide,
            color: COLOR_MAPPINGS
                .PANEL[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.shadowMaterial.defines = this.shadowMaterial.defines || {};
        this.shadowMaterial.defines.CUSTOM = '';

        this.panelMesh = createMesh(createBufferGeometry(), this.meshMaterial);
        this.edgeMesh = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.panelMesh.geometry),
            this.edgeMaterial,
        );
        this.panelMesh.receiveShadow = true;
        this.panelMesh.castShadow = true;

        this.objectsGroup.add(this.panelMesh);
        this.objectsGroup.add(this.edgeMesh);

        this._update({ panelMap });

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.isTranslucent = false;

        this.isSelected = false;

        this.useIndividualMesh = false;

        this.rotation = 0;

        this.updateVisualsAfterLoadingAndCreation();

        // In future, maybe detect hardware, number of panels etc and automatically
        // decide which image to use for texture but for the time being, these are the textures - 
        // Low - https://i.imgur.com/PbPOumW.jpg - 128x128, 3.1KB
        // Medium - https://i.imgur.com/HLCWRvM.jpg - 256x256, 9.2KB
        // High - https://i.imgur.com/KRSn7B5.jpg - 512x512, 24KB
        // Highest - https://i.imgur.com/y2gTTQm.jpg - 512x512, 34.8KB

        // Removing textures for the time being

        // let textureLoader = new THREE.TextureLoader();
        // textureLoader.load(
        //     'https://i.imgur.com/PbPOumW.jpg',
        //     function(texture){
        //         texture.wrapS = THREE.RepeatWrapping;
        //         texture.wrapT = THREE.RepeatWrapping;
        //         texture.repeat.set( 1, 1 );
        //         outside.textured2dMaterial = new THREE.MeshBasicMaterial({
        //             map: texture,
        //             color: outside.currentPanelColor
        //         })
        //         outside.texturedShadowMaterial = new THREE.MeshBasicMaterial({
        //             map: texture,
        //             shadowSide: THREE.FrontSide
        //         })
        //         outside.texturedShadowMaterial.defines = outside.texturedShadowMaterial.defines || {};
        //         outside.texturedShadowMaterial.defines.CUSTOM = '';
        //         if(!outside.stage.lightsManager.shadowEnabled){
        //             outside.panelMesh.material = outside.textured2dMaterial;
        //         }else{
        //             outside.panelMesh.material = outside.texturedShadowMaterial;
        //         }

        //     }, undefined, (error)=>{
        //         console.log(error)
        //     }
        // )
    }

    getState() {
        return {
            uuid: this.uuid,
            panelMap: this.getPanelMap(),
            solarAccess: this.getSolarAccess(),
            parent: this.getParent() ? this.getParent().uuid : null,
            rotation: this.rotation,
            hidden: this.hidden,
        };
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            const {
                solarAccess, parent, hidden,
            } = state;

            // load properties
            this.solarAccess = solarAccess;
            this.hidden = hidden;
            this.rotation = state.rotation;

            this.updateVisualsAfterLoadingAndCreation();

            const parentObject = this.stage.getObject(parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // commented to prevent double addition of panel objectsGroup
                // while performing undo after deletion.
                // ROOT CAUSE UNKNOWN!!!!!.
                // this.addToScene();
            }

            this.update({shouldSaveState: false });
        }
    }

    clearState() {
        this.removeFromScene();
        if (this.getParent()) {
            this.getParent().removeChild(this);
        }
    }

    update({shouldSaveState = true }) {
        if (this.hidden) {
            this.hidePanel({ shouldSaveState });
        }
        else {
            this.showPanel({ shouldSaveState });
        }
    }

    _update({ panelMap, shouldSaveState = true }) {
        // update based on properties

        this.updateGeometry(panelMap);

        if (this.hidden) {
            this.hidePanel({ shouldSaveState });
        }
        else {
            this.showPanel({ shouldSaveState });
        }
    }

    // Geometry Manipulation

    updateGeometry(panelMap) {
        const panelGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            panelMap.corners[0][0], panelMap.corners[0][1], panelMap.corners[0][2],
            panelMap.corners[1][0], panelMap.corners[1][1], panelMap.corners[1][2],
            panelMap.corners[2][0], panelMap.corners[2][1], panelMap.corners[2][2],

            panelMap.corners[0][0], panelMap.corners[0][1], panelMap.corners[0][2],
            panelMap.corners[2][0], panelMap.corners[2][1], panelMap.corners[2][2],
            panelMap.corners[3][0], panelMap.corners[3][1], panelMap.corners[3][2],
        ]);
        panelGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.panelMesh.geometry = panelGeometry;
        this.edgeMesh.geometry = new THREE.EdgesGeometry(panelGeometry);
    }

    // not used now for geometry manuplations
    moveObject(deltaX, deltaY, deltaZ) {
        this.stage.stateManager.addElectricalComponentAffected(this.electricalComponentConnected);
        return;
        this.panelMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.edgeMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.saveState();
    }

    exportMesh() {
        const panelGeometry = this.panelMesh.geometry.clone();
        const { x, y, z } = this.getParent().getPosition();
        panelGeometry.translate(x, y, z);
        const panelMesh = new THREE.Mesh(panelGeometry, this.meshMaterial);
        panelMesh.updateMatrix();
        return panelMesh;
    }

    getPlacingInformation() {
        const response = {};
        response.errors = [];
        const modelsBelow = raycastingUtils.getAllModelsBelowVertices(
            utils.convertVectorToArray(utils.getVerticesFromBufferGeometry(this.panelMesh.geometry)),
            this.stage,
        );
        if (modelsBelow.length !== 0) {
            const topModel = modelsBelow[0][0];
            if (topModel !== this.getSubarray().getAssociatedModel()) {
                response.errors.push(new Error(OUT_OF_ASSOCIATED_MODEL_ERROR));
            }
        }
        else {
            response.errors.push(new Error(OUT_OF_GROUND_ERROR));
        }
        return response;
    }

    getLowestVertex() {
        let lowestVertexZ = Infinity;
        let lowestVertexZIndex = 2;
        const position = this.getParent().getPosition();
        const bufferVertices = this.panelMesh.geometry.attributes.position.array;
        for (let i = 0, l = bufferVertices.length; i < l; i += 1) {
            if (i % 3 === 2 && bufferVertices[i] < lowestVertexZ) {
                lowestVertexZIndex = i;
            } 
        }
        return new THREE.Vector3(
            bufferVertices[lowestVertexZIndex - 2] + position.x,
            bufferVertices[lowestVertexZIndex - 1] + position.y,
            bufferVertices[lowestVertexZIndex] + position.z,
        );
    }

    // TODO: Maybe required for Panel level interactions
    // placeObject(deltaX = 0, deltaY = 0, tableInteraction) {
    //
    //     // move to the new position in x and y direction
    //     this.moveObject(deltaX, deltaY, 0);
    //
    //     //check for validity by checking if all the corners are on the
    //     //  same associated model as the subarray it belong to
    //     for (let vertex of this.panelMesh.geometry.vertices) {
    //         let belowObjects = raycastingUtils.getAllObjectsBelowPoint(
    //             new THREE.Vector2( vertex.x, vertex.y),
    //             this.stage,
    //         );
    //         belowObjects = belowObjects.filter(function ([ object, objectZ ]) {
    //             return object !== this && object.getParent() !== this.getParent();
    //         }, this);
    //         console.log('all objects', belowObjects);
    //         let [object, objectZ] = belowObjects[0];
    //         if (object !== this.getSubarray().getAssociatedModel()) {
    //             if (object instanceof Panel) {
    //                 // delete panel or table
    //                 // check for the next object to be associated object, if not delete this table also
    //             }
    //             else {
    //                 if (tableInteraction){
    //                     let table = this.getParent();
    //                     table.removeObject();
    //                     return;
    //                 }
    //             }
    //         }
    //     }
    //
    //     // if panels are below it, remove panel or table based on the input
    //
    //     // place panel in the new position according to the slope of the roof
    //     // use move object after figuring out deltaZ
    // }


    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.PANEL;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    switchVisualState(newVisualState, recursive) {
        super.switchVisualState(newVisualState, recursive);
        if (this.visualState === VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS) {
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.panelMesh.castShadow = true;
            this.panelMesh.receiveShadow = true;
            this.panelMesh.material.needsUpdate = true;
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.panelMesh.castShadow = false;
            this.panelMesh.receiveShadow = false;
            this.panelMesh.material.needsUpdate = true;
        }
        let isSelected = this.stage.selectionControls.getSelectedObjects().includes(this.parent);

        if (this.parent && this.parent.linked && this.parent.linkedTable) {
            isSelected = isSelected || this.stage.selectionControls.getSelectedObjects().includes(this.parent.linkedTable)
        }

        let newColors;
        if (isSelected) {
            if (this.visualState === VISUAL_STATES.ERROR) {
                newColors = this.getColorMap();
            }
            else {
                newColors = COLOR_MAPPINGS.PANEL[this.materialState][VISUAL_STATES.SELECT];
            }
        }
        else if (this.visualState === VISUAL_STATES.DELETE_MODE) {
            newColors = this.getColorMap();
        }
        else if (this.stage
            .visualManager.containsVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS)) {
            this.solarAccessColor = parseInt(
                this.stage
                    .solarAccessColorMap(this.solarAccess.toFixed(2))
                    .hex()
                    .substring(1),
                16,
            );
            newColors = { MESH_COLOR: this.solarAccessColor };
        }
        else {
            newColors = this.getColorMap();
        }

        if (newColors !== undefined && newColors !== null) {
            visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.panelMesh);
            visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.edgeMesh);
        }
    }

    updateColorToGrey() {
        visualUtils.updateMeshWithColor(0x4A6A79, this.panelMesh);
    }

    updateColorToSelected() {
        visualUtils.updateMeshWithColor(
            COLOR_MAPPINGS.PANEL[MATERIAL_STATES.TRANSLUCENT]
                [VISUAL_STATES.SELECT].MESH_COLOR,
            this.panelMesh,
        );
    }

    updateColorToDefault() {
        visualUtils.updateMeshWithColor(
            COLOR_MAPPINGS.PANEL[MATERIAL_STATES.TRANSLUCENT]
                [VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
            this.panelMesh,
        );
    }

    updatePanelColorGreenString() {

    }

    updatePanelColorRedString() {

    }

    isHidden() {
        return this.hidden;
    }
    
    handleDragStart() {
        this.objectsGroup.position.z += 0.1;
        this.positionBeforeStart = this.getPosition();
    }

    handleDragCancel() {
        this.objectsGroup.position.z -= 0.1;
    }

    handleDragEnd() {
        this.objectsGroup.position.z -= 0.1;
    }

    // Helper functions

    onSelect() {
        this.getParent().useIndividualMesh = true;
        this.switchVisualState(VISUAL_STATES.SELECT, true);
        this.addToScene();
    }

    deSelect() {
        this.getParent().useIndividualMesh = false;
        this.removeFromScene();
        this.switchVisualState(VISUAL_STATES.DEFAULT,true);
    }

    showPanel({ shouldSaveState } = { shouldSaveState: true }) {
        this.hidden = false;
        this.objectsGroup.visible = !this.hidden;

        if (shouldSaveState) {
            this.saveState();
        }
    }

    hidePanel({ shouldSaveState } = { shouldSaveState: true }) {
        this.hidden = true;
        this.objectsGroup.visible = !this.hidden;

        if (shouldSaveState) {
            this.saveState();
        }
    }

    showObjectLayer() {
        for (const child of this.objectsGroup.children) {
            child.layers.enable(0);
        }
    }

    hideObjectLayer() {
        for (const child of this.objectsGroup.children) {
            child.layers.disable(0);
        }
    }

    getMeshBoundingBox() {
        const position = this.getParent().getPosition();
        const bBox = this.panelMesh.geometry.boundingBox.clone();
        bBox.min.add(position);
        bBox.max.add(position);
        return bBox;
    }

    getPanelMap({ withSolarAccess } = { withSolarAccess: true }) {
        const panelMap = {
            id: this.id,
            solarAccess: withSolarAccess ? this.solarAccess : 0,
            corners: [],
        };
        const position = this.getParent().getPosition();
        for (let i = 0; i < 3; i++) {
            panelMap.corners.push([
                this.panelMesh.geometry.attributes.position.array[(i * 3)] + position.x,
                this.panelMesh.geometry.attributes.position.array[(i * 3) + 1] + position.y,
                this.panelMesh.geometry.attributes.position.array[(i * 3) + 2] + position.z,
            ]);
        }
        panelMap.corners.push([
            this.panelMesh.geometry.attributes.position.array[(5 * 3)] + position.x,
            this.panelMesh.geometry.attributes.position.array[(5 * 3) + 1] + position.y,
            this.panelMesh.geometry.attributes.position.array[(5 * 3) + 2] + position.z,
        ]);
        return panelMap;
    }

    getPanelTableRowSubarrayIds() {
        return {
            panelId: this.id,
            tableId: this.getParent().getId(),
            rowId: this.getParent().getParent().getId(),
            subarrayId: this.getParent().getSubarray().getId(),
        }
    }

    get2DVertices() {
        const vertices = [];
        const position = this.getParent().getPosition();
        for (let i = 0; i < 3; i++) {
            vertices.push([
                this.panelMesh.geometry.attributes.position.array[(i * 3)] + position.x,
                this.panelMesh.geometry.attributes.position.array[(i * 3) + 1] + position.y,
            ]);
        }
        vertices.push([
            this.panelMesh.geometry.attributes.position.array[(5 * 3)] + position.x,
            this.panelMesh.geometry.attributes.position.array[(5 * 3) + 1] + position.y,
        ]);
        return vertices;
    }

    get3DVertices() {
        const vertices = [];
        const position = this.getParent().getPosition();
        for (let i = 0; i < 3; i++) {
            vertices.push([
                this.panelMesh.geometry.attributes.position.array[(i * 3)] + position.x,
                this.panelMesh.geometry.attributes.position.array[(i * 3) + 1] + position.y,
                this.panelMesh.geometry.attributes.position.array[(i * 3) + 2] + position.z,
            ]);
        }
        vertices.push([
            this.panelMesh.geometry.attributes.position.array[(5 * 3)] + position.x,
            this.panelMesh.geometry.attributes.position.array[(5 * 3) + 1] + position.y,
            this.panelMesh.geometry.attributes.position.array[(5 * 3) + 2] + position.z,
        ]);
        return vertices;
    }

    getGeometry3DVertices() {
        const vertices = [];
        const tablePosition = this.getParent().getPosition();
        const typedVertices = this.panelMesh.geometry.attributes.position.array;
        for (let i = 0, l = typedVertices.length; i < l; i += 1) {
            if (i % 3 === 0) {
                vertices.push(typedVertices[i] + tablePosition.x);
            }
            else if (i % 3 === 1) {
                vertices.push(typedVertices[i] + tablePosition.y);
            }
            else{
                vertices.push(typedVertices[i] + tablePosition.z);
            }
        }
        return vertices;
    }

    getHighestZ() {
        const vertices = this.get3DVertices();
        let highestZ = vertices[0][2];
        for (let i = 1; i < vertices.length; i += 1) {
            if (vertices[i][2] > highestZ) {
                // eslint-disable-next-line prefer-destructuring
                highestZ = vertices[i][2];
            }
        }
        return highestZ;
    }

    getReleativePositionToTable() {
        let vertexX = 0;
        let vertexY = 0;
        for (let i = 0; i < 4; i++) {
            vertexX += this.panelMesh.geometry.attributes.position.array[(i * 3)];
            vertexY += this.panelMesh.geometry.attributes.position.array[(i * 3) + 1];
        }
        vertexX /= 4;
        vertexY /= 4;
        return new THREE.Vector3(vertexX, vertexY, 0);
    }

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        const vertices = this.get3DVertices();
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            cumulativeX += vertices[i][0];
            cumulativeY += vertices[i][1];
            cumulativeZ += vertices[i][2];
            count += 1;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    getSolarAccess() {
        return this.solarAccess;
    }

    getSubarray() {
        return this.getParent()
            .getParent()
            .getParent();
    }

    getDCSize() {
        return this.getSubarray().moduleProperties.moduleSize;
    }

    getEdges() {
        const vertices = utils.convertArrayToVector(this.get2DVertices());
        const edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([vertices[i], vertices[i + 1]]);
        }

        edges.push([vertices[vertices.length - 1], vertices[0]]);

        return edges;
    }

    getId() {
        return this.id;
    }

    setId(id) {
        this.id = id;
        // QUESTION... Do we update the name too?
    }

    setElectricalConnection(electricalComponent) {
        this.electricalComponentConnected = electricalComponent;
    }

    getElectricalConnection() {
        return this.electricalComponentConnected;
    }

    // Solar Access

    isSolarAccessComputed() {
        if (!this.hidden) {
            return this.solarAccess !== 0;
        }
        return true;
    }

    updateSolarAccess(solarAccessMap) {
        if (solarAccessMap.hasOwnProperty(this.id.toString())) {
            this.solarAccess = solarAccessMap[this.id.toString()];
            this.stage.stateManager.updateLastSavedObjectState({
                uuid: this.uuid,
                getStateCb: this.getState.bind(this),
            });
        }
        else {
            console.error('ERROR: Panels: Solar access value not available');
        }
    }

    resetSolarAccess() {
        this.solarAccess = 0;
        this.saveState();
        this.updateVisualsBasedOnStates();
    }

    // Universal functions

    addToScene() {
        this.getParent().handleObjectsGroupAddition(this.objectsGroup);
    }

    removeFromScene() {
        if (this.getParent()) this.getParent().handleObjectsGroupDeletion(this.objectsGroup);
    }

    removeObject(shouldSaveState = true) {
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }
        this.removeFromScene();
        if (this.getParent()) {
            this.getParent().removeChild(this);
        }
        this.stage.stateManager.addElectricalComponentAffected(this.electricalComponentConnected);
        if (this.electricalComponentConnected !== null) {
            this.electricalComponentConnected.removePanel(this);
        }
        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }
    }

    gazeboRotation(angleInRad) {
        this.rotation += angleInRad;
    }

    getSelectableObjects() {
        return new SelectionTree([this.getSubarray(), this.parent]);
    }
}

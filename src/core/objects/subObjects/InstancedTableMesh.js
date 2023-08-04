import * as THREE from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import BaseObject from "../BaseObject";
import * as utils from '../../utils/utils';
import Row from "../subArray/Row";
import Subarray from "../subArray/Subarray";
import Table from "../subArray/Table";
import createBufferGeometry from "../../utils/meshUtils";
import { ADD_EAST_TABLE, ADD_EW_TABLE, ADD_WEST_TABLE, SUBARRAY_RACK_STYLE_EWRACKING, SUBARRAY_RACK_STYLE_FIXED, SUBARRAY_RACK_STYLE_FLUSH } from "../../coreConstants";
import EastWestRack from "../../lib/EastWestRacking";

export default class InstancedTableMesh extends BaseObject {
    constructor(
        stage, subarrayProperties = {}, isEastWestMode = false, tableType, startingParent = null,
        addToScene = true
    ) {
        super(stage);
        this.stage = stage;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.objectsGroup.name = 'InstancedTableMesh';

        this.startingParent = startingParent;
        this.instancedTableType = tableType;

        this.currentSubarrayProperties = subarrayProperties;
        this.isEastWestMode = isEastWestMode;
        if (this.isEastWestMode) {
            if (this.instancedTableType === ADD_EW_TABLE || this.instancedTableType === null) {
                this.eastWestProperties = this.currentSubarrayProperties;
                // this.eastWestProperties.tableSizeUp = 2;
                // this.eastWestProperties.azimuth = 90;
            }
            else if (this.instancedTableType === ADD_EAST_TABLE) {
                this.eastTableProperties = this.currentSubarrayProperties;
                // this.eastTableProperties.azimuth = 90;
            }
            else if (this.instancedTableType === ADD_WEST_TABLE) {
                this.westTableProperties = this.currentSubarrayProperties;
                // this.westTableProperties.azimuth = 270;
            }
        }
        this.currentSubarray = null;

        this.instanceCount = 1;
        this.edgesGeometry = createBufferGeometry();
        this.panelGeometry = createBufferGeometry();
        this.defaultColor = new THREE.Color(0xffffff);

        if(addToScene){
            this.stage.sceneManager.scene.add(this.objectsGroup);
        }

        this._instancedMesh = this.createInstancedTableMesh();
        // this._instancedMesh.instanceColor = new THREE.BufferAttribute(new Float32Array(3000), 3);
        //TODO - cleanup instanced edges creation
        this._instancedEdges = new THREE.InstancedBufferGeometry();
        this._EdgeMesh = this.createInstancedEdges();

        this.objectsGroup.add(this._instancedMesh);
        this.objectsGroup.add(this._EdgeMesh);
    }

    createInstancedTableMesh() {
        
        this.currentSubarray = this.createNewSubarray();

        const templateTableMap = this.currentSubarray.getTemplateTableMap({ withBBox: true });
        templateTableMap.hidden = true;
        templateTableMap.isMoved = true

        this.currentBaseTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
        this.tableDimensions = this.currentSubarray.getTableDimensions();
        this.vertices = this.currentBaseTable.get2DVertices();

        this.currentBaseTable.clickToAdd = true;
        this.currentSubarray.getChildren()[0].addChild(this.currentBaseTable);

        this.panelGeometry = this.getMergedPanelMesh(this.currentBaseTable).clone();
        this.edgesGeometry = this.getMergedEdgeMesh(this.currentBaseTable).clone();
        this.defaultColor = this.getMergedPanelMaterial(this.currentBaseTable).color;

        const highestZ = utils.getHighestZ(this.stage.ground) + 5;

        this.panelGeometry.translate(0, 0, highestZ);
        this.edgesGeometry.translate(0, 0, highestZ);

        this.mergedGeometry = BufferGeometryUtils.mergeGeometries([this.panelGeometry], true);
        this.mergedGeometry.computeBoundingBox();

        const instancedMesh = new THREE.InstancedMesh(this.mergedGeometry, [new THREE.MeshBasicMaterial({ color: 0xffffff })], 1000);
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instancedMesh.count = 1;
        instancedMesh.InstancedTableMesh = this;
        return instancedMesh;
    }
    // need to create seperate subarray for ew rack
    createNewSubarray() {
        let newSubarray;
        if (this.isEastWestMode) {
            newSubarray = new EastWestRack(this.stage);
        }
        else {
            newSubarray = new Subarray(this.stage);
        }
        this.startingParent.addChild(newSubarray);
        newSubarray.associatedModel = this.startingParent;
        newSubarray.createBoundaryFromParent();
        newSubarray.addTableFlow = true;
        newSubarray.isInstancedSubarray = true;
        if (this.currentSubarrayProperties !== null) {
            if (this.isEastWestMode) {
                if (this.instancedTableType === ADD_EW_TABLE || this.instancedTableType === null)
                newSubarray.updateSubarrayForAddTable(this.eastWestProperties);
                else if (this.instancedTableType === ADD_EAST_TABLE)
                newSubarray.updateSubarrayForAddTable(this.eastTableProperties);
                else if (this.instancedTableType === ADD_WEST_TABLE)
                newSubarray.updateSubarrayForAddTable(this.westTableProperties);
            }
            else {
                newSubarray.updateSubarrayForAddTable(this.currentSubarrayProperties);
            }
        }

        const rowMap = {
            id: 0,
            frames: [],
        };
        const row = new Row(this.stage, rowMap, { withoutContainer: false }, true);
        newSubarray.addChild(row);
        row.saveState({ withoutContainer: false });
        return newSubarray;
    }

    getMergedPanelMesh(table) {
        let bufferArray = [];
        for (let i = 0; i < table.getChildren().length; i++) {
            let panel = table.getChildren()[i]
            bufferArray.push(panel.panelMesh.geometry);
        }
        return BufferGeometryUtils.mergeGeometries(bufferArray, false);
    }
    getMergedEdgeMesh(table) {
        let bufferArray = [];
        for (let i = 0; i < table.getChildren().length; i++) {
            let panel = table.getChildren()[i]
            bufferArray.push(panel.edgeMesh.geometry);
        }
        return BufferGeometryUtils.mergeGeometries(bufferArray, false);
    }

    getMergedPanelMaterial(table) {
        return table.getChildren()[0].panelMesh.material;
    }

    getMergedEdgeMaterial(table) {

        return table.getChildren()[0].edgeMesh.material;
    }

    getDefaultValues(mountType) {
        const designSettings = this.stage.getDesignSettings();
        this.totalModules = designSettings.drawing_defaults.quickView.totalModules
        let subarrayDefaults = {};
        if ((mountType || designSettings.drawing_defaults.subarray.mountType) === SUBARRAY_RACK_STYLE_FIXED) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.fixedMount;
        } else if ((mountType || designSettings.drawing_defaults.subarray.mountType) === SUBARRAY_RACK_STYLE_FLUSH) {
            subarrayDefaults = designSettings.drawing_defaults.subarray.flushMount;
            subarrayDefaults.tilt = this.associatedModel.getTilt();
            subarrayDefaults.azimuth =
                subarrayDefaults.tilt === 0 ? 180 : this.associatedModel.getAzimuth();
        }else {
            subarrayDefaults = designSettings.drawing_defaults.subarray.eastWestRacking;
            return {
                interRowSpacing: subarrayDefaults.interRowSpacing,
                intraRowSpacing: subarrayDefaults.intraRowSpacing,
                interRowSpacingMode: subarrayDefaults.interRowSpacingMode,
                structureType: subarrayDefaults.structureType,
                tilt: subarrayDefaults.tilt,
                azimuth: subarrayDefaults.azimuth,
                panelOrientation: subarrayDefaults.panelOrientation,
                mountHeight: subarrayDefaults.mountHeight,
                tableSizeUp: subarrayDefaults.tableSizeUp,
                tableSizeWide: subarrayDefaults.tableSizeWide,
                tableSpacing: subarrayDefaults.tableSpacing,
                moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
                moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
                mountType: mountType || designSettings.drawing_defaults.subarray.mountType,
                moduleProperties: subarrayDefaults.moduleProperties,
                rowSpacing: subarrayDefaults.rowSpacing,
                rowSpacingMode: subarrayDefaults.rowSpacingMode,
                panelProperties: subarrayDefaults.panelProperties
            };
        }
        
        return {
            structureType: subarrayDefaults.structureType,
            tilt: subarrayDefaults.tilt,
            azimuth: subarrayDefaults.azimuth,
            panelOrientation: subarrayDefaults.panelOrientation,
            mountHeight: subarrayDefaults.mountHeight,
            tableSizeUp: subarrayDefaults.tableSizeUp,
            tableSizeWide: subarrayDefaults.tableSizeWide,
            tableSpacing: subarrayDefaults.tableSpacing,
            moduleSpacingUp: subarrayDefaults.moduleSpacingUp,
            moduleSpacingWide: subarrayDefaults.moduleSpacingWide,
            mountType: mountType || designSettings.drawing_defaults.subarray.mountType,
            moduleProperties: subarrayDefaults.moduleProperties,
            rowSpacing: subarrayDefaults.rowSpacing,
            rowSpacingMode: subarrayDefaults.rowSpacingMode,
            panelProperties: subarrayDefaults.panelProperties
        };
    }

    updateEdges() {
        let count = this._instancedMesh.instanceMatrix.array.length / 16;
        let rotation = new Float32Array(count * 4);
        let scale = new Float32Array(count * 3);
        this._instancedEdges.instanceCount = this.instanceCount;
        this._instancedEdges.setAttribute(
            "rotation",
            new THREE.InstancedBufferAttribute(rotation, 4, false, 1)
        );
        let translation = new Float32Array(
            (this._instancedMesh.instanceMatrix.array.length / 16) * 3
        );
        for (
            let i = 0; i < this._instancedMesh.instanceMatrix.array.length; i += 16
        ) {
            let a = new THREE.Matrix4().fromArray(
                this._instancedMesh.instanceMatrix.array,
                i
            );
            let pos = new THREE.Vector3().setFromMatrixPosition(a);
            let S = new THREE.Vector3().setFromMatrixScale(a);
            translation.set([pos.x, pos.y, pos.z], (i / 16) * 3);
            scale.set([S.x, S.y, S.z], (i / 16) * 3);
        }
        this._instancedEdges.setAttribute(
            "scale",
            new THREE.InstancedBufferAttribute(scale, 3, false, 1)
        );
        this._instancedEdges.setAttribute(
            "translation",
            new THREE.InstancedBufferAttribute(translation, 3, false, 1)
        );
        this._instancedEdges.attributes.translation.needsUpdate = true;
    }

    //TODO - cleanup shaders to use matrix
    createInstancedEdges() {
        let count = this._instancedMesh.instanceMatrix.array.length / 16;

        var vertexShader = `
        precision highp float;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform mat3 normalMatrix;
         
    
        attribute vec3 position;
        attribute vec3 translation;
        attribute vec4 rotation;
        attribute vec3 scale;
        attribute vec3 skew;
        attribute vec4 perspective;
        attribute mat4 instancedMatrix;

        // translation
        vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
            position *= S;
            //computes the rotation where R is a (vec4) quaternion
            position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
            position += T;
            return position;
        }
         
        //re-use position for shading
        varying vec3 vPos;
        void main() {
    
            vec3 pos = position;
    
           transform( pos, translation, rotation, scale );
          //pos +=  vec3(instanceyMatrix[0][3],instanceyMatrix[1][3],instanceyMatrix[2][3]);
            gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    
            vPos = pos;
        }`;

        var fragmentShader = `precision highp float;
        varying vec3 vPos;
        void main() {
            gl_FragColor = vec4( 1.0,1.0,1.0, 1. );
        }`;

        this._instancedEdges.setAttribute(
            "position",
            this.edgesGeometry.attributes.position
        );

        var rotation = new Float32Array(count * 4);
        var scale = new Float32Array(count * 3);
        this._instancedEdges.instanceCount = 1;

        this._instancedEdges.setAttribute(
            "rotation",
            new THREE.InstancedBufferAttribute(rotation, 4, false, 1)
        );
        this._instancedEdges.setAttribute(
            "scale",
            new THREE.InstancedBufferAttribute(scale, 3, false, 1)
        );
        let translation = new Float32Array(
            (this._instancedMesh.instanceMatrix.array.length / 16) * 3
        );
        for (
            let i = 0; i < this._instancedMesh.instanceMatrix.array.length; i += 16
        ) {
            let a = new THREE.Matrix4().fromArray(
                this._instancedMesh.instanceMatrix.array,
                i
            );
            let pos = new THREE.Vector3().setFromMatrixPosition(a);
            translation.set([pos.x, pos.y, pos.z], (i / 16) * 3);
            scale.set([1, 1, 1], (i / 16) * 3);
        }
        this._instancedEdges.setAttribute(
            "translation",
            new THREE.InstancedBufferAttribute(translation, 3, false, 1)
        );
        // create a material
        var material = new THREE.RawShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide,
            depthTest: false,
        });
        let edges = new THREE.LineSegments(this._instancedEdges, material);
        edges.frustumCulled = false;
        return edges;
    }

    updateSubarrayProperties(updatedProperties) {
        
        if(this.currentSubarrayProperties.mountType !== updatedProperties.mountType){
            this.getDefaultValues(updatedProperties.mountType)
        }else{
            this.currentSubarrayProperties = updatedProperties;
        }

        this._instancedMesh = this.createInstancedTableMesh();

        //TODO - cleanup instanced edges creation
        this._instancedEdges = new THREE.InstancedBufferGeometry();
        this._EdgeMesh = this.createInstancedEdges();
        this.objectsGroup.add(this._EdgeMesh);
        this.objectsGroup.add(this._instancedMesh);
    }

    setInstanceCount(count) {
        this.instanceCount = count;
        this._instancedEdges.instanceCount = count;
        this._instancedMesh.count = count;
        this._instancedMesh.instanceMatrix.needsUpdate = true;
        this._instancedEdges.attributes.translation.needsUpdate = true;
    }

 minOccupiedPosition( A, n) {

    var minPos = 0;
    for (var i = 0; i < n; ++i) {
        if (A[i] > 0) {
            ++minPos;
            i += 2;
        }
    }
 
    return minPos;
}

    getInstanceCount() {
        let nonZero = this.minOccupiedPosition(this._instancedEdges.getAttribute("scale").array, this.instanceCount * 3);
        return nonZero;
    }

    /**
     * sets the position of the instance at the given index
     * @param {Integer} index -index of the instance
     * @param {THREE.Vector3} position -position to set 
     */
    setPositionAt(index = 0, position = new THREE.Vector3(0, 0, 0)) {
        const T = new THREE.Object3D();
        T.position.set(position.x, position.y);
        T.updateMatrix();
        this._instancedMesh.setMatrixAt(index, T.matrix);
        this._instancedMesh.instanceMatrix.needsUpdate = true;
        this.updateEdges();
    }

    moveBaseTable(position = new THREE.Vector3(0, 0, 0)) {
        let P = this.currentBaseTable.getPosition();
        this.currentBaseTable.moveObject(position.x - P.x, position.y - P.y);
        if(this.currentSubarray.getChildren()[0]){
            this.currentSubarray.getChildren()[0].updateLocalBoundingBox()
        }
    }

    /**
     * returns the position of the instance at the given index
     * @param {Integer} index - index of the instance
     * @returns Vector3 of the position
     */
    getPositionAt(index = 0) {
        const matrix = new THREE.Matrix4();
        this._instancedMesh.getMatrixAt(index, matrix);
        const position = new THREE.Vector3().setFromMatrixPosition(matrix);
        position.z = 0;
        return position;
    }

    getScaleAt(index = 0) {
        const matrix = new THREE.Matrix4();
        this._instancedMesh.getMatrixAt(index, matrix);
        const scale = new THREE.Vector3().setFromMatrixScale(matrix);
        return scale;
    }

    getBoundingBox(index = 0) {
        const matrix = new THREE.Matrix4();

        let bBox = this.mergedGeometry.boundingBox.clone();
        this._instancedMesh.getMatrixAt(index, matrix);
        bBox.applyMatrix4(matrix);
        return bBox;
    }
    getVerticesAt(index = 0, withoutPosition = false) {
        let t = [];
        let p = this.getPositionAt(index)
        let tableP = withoutPosition ? this.currentBaseTable.getPosition() : new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < this.currentBaseTable.get2DVertices().length; i++) {
            let v = this.currentBaseTable.get2DVertices()[i]
            v[0] += p.x - tableP.x;
            v[1] += p.y - tableP.y;
            t.push(v)
        }
        return t;

    }
    getVerticesAtPosition(index = 0, position = new THREE.Vector3(0,0,0)) {
        let t = [];
        let p = new THREE.Vector3(position.x,position.y,0);
        let tableP = this.currentBaseTable.getPosition();
        for (let i = 0; i < this.currentBaseTable.get2DVertices().length; i++) {
            let v = this.currentBaseTable.get2DVertices()[i]
            v[0] += p.x - tableP.x;
            v[1] += p.y - tableP.y;
            t.push(v)
        }
        return t;

    }
    setScaleAt(index = 0, scale = new THREE.Vector3(0, 0, 0)) {

        const T = new THREE.Object3D();
        T.scale.set(scale.x, scale.y, scale.z);
        const P = this.getPositionAt(index);
        if (scale.x > 0) {
            T.position.set(P.x, P.y, P.z);
        }
        T.updateMatrix();
        this._instancedMesh.setMatrixAt(index, T.matrix);
        this._instancedMesh.instanceMatrix.needsUpdate = true;
        this.updateEdges();
    }

    /**
     * sets the color of the instance (sets default color if color not specified)
     * @param {Integer} index  - index of the instance
     * @param {ThREE.color} color - color to set
     */
    setColorAt(index = 0, color = this.defaultColor) {
        this._instancedMesh.setColorAt(index, color);
        this._instancedMesh.instanceColor.needsUpdate = true;
    }

    /**
     * deletes the instance at the given index
     * @param {Integer} instanceId - instance id to delete
     */
    deleteInstanceAt(instanceId = 0) {
        let updatedArray = this._instancedMesh.instanceMatrix.array.subarray((instanceId + 1) * 16, this._instancedMesh.instanceMatrix.array.length);
        this._instancedMesh.instanceMatrix.set(updatedArray, instanceId * 16);
        this.setInstanceCount(this.instanceCount - 1);
        this._instancedMesh.instanceMatrix.needsUpdate = true;
        this.updateEdges();
    }

    /**
     * get the current subarray of the instance matrix
     * @returns Subarray
     */
    getSubarray() {
        return this.currentSubarray;
    }

    /**
     * returns the current instance mesh
     * @returns THREE.InstanceMesh
     */
    getMesh() {
        return this._instancedMesh;
    }

    getMergedGeometry() {
        return this.mergedGeometry;
    }

    removeObjectFromScene() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        // this.currentBaseTable.removeObject();
        this.getSubarray().removeObject();
        if(this.forSnap){
            this.snappingSubarray.instanceMesh = null;
        }
        //TODO - cleanup instanced edges creation
        // this._instancedMesh.geometry.material.dispose();
    }
}
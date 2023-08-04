import * as THREE from 'three';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../../visualConstants';
import * as visualUtils from '../../../utils/visualUtils';
import {
    CREATED_STATE,
    DELETED_STATE,
    COMPLEX_GEOMETRY_ERROR,
    OUT_OF_GROUND_ERROR,
    ACDB_WITH_NO_AREA_ERROR,
    DORMER_INVALID_PARENT_ERROR,
    EDIT_SETBACK_OUTSIDE,
    PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR,
} from '../../../coreConstants';
import { getModels, getAllModelType } from '../../../utils/exporters';
import { getChildrenSequence, getDistanceBetweenPointAndLine } from './smartroofUtils';
import * as raycastingUtils from '../../../utils/raycastingUtils';
import * as JSTSConverter from '../../../utils/JSTSConverter';
import * as JSTS from 'jsts';
import * as utils from '../../../utils/utils';
import * as modelUtils from '../modelUtils';
import Inverter from '../../ac/Inverter';
import ACDB from '../../ac/ACDB';
import Tree from '../Tree';
import BaseObject from '../../BaseObject';
import { SmartroofModel } from './SmartroofModel';
import OutlinePoints from '../../subObjects/OutlinePoints';
import SmartroofFace from './SmartroofFace';
import PolygonModel from '../PolygonModel';
import CylinderModel from '../CylinderModel';
import Subarray from '../../subArray/Subarray';
import Walkway from '../Walkway';
import PolygonMeasurement from '../../subObjects/PolygonMeasurement';
import FlatDormer from './dormers/FlatDormer';

export default class Dormer extends BaseObject {
    constructor(stage) {
        super(stage);
        this.stage = stage;
        this.parent;
        this.faceChanged = false;
        this.faceInfo = [];
        this.id = stage.getDormerId();
        this.outlinePoints = [];
        this.headPoint;
        this.heightChange = 0;
        this.curDif = 0;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.name = `Dormer #${this.id.toString()}`;
        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });
        this.meshMaterial2D.defines = this.meshMaterial2D.defines || {};
        this.meshMaterial2D.defines.CUSTOM = '';

        this.meshMaterial3D = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS.POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });
        this.meshMaterial3D.defines = this.meshMaterial3D.defines || {};
        this.meshMaterial3D.defines.CUSTOM = '';

        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        this.edgeMaterial3D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // setback material
        this.setbackMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .SETBACK_COLOR,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        this.coreMesh = new THREE.Mesh(
            createBufferGeometry(),
            this.meshMaterial2D,
        );
        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        this.coreEdges = new THREE.Group();

        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        const defaultValues = this.getDefaultValues();
        this.pitchPoint = new THREE.Vector3(0, 0, 0);
        this.baseHeight = 10;
        this.coreHeight = 0;
        this.tilt = parseFloat(defaultValues.tilt);
        this.azimuth = 180;
        this.setbackOutside = defaultValues.setbackOutside;
        this.edgePoints = [];

        const vertices = this.getDefault2DVertices();
        // set outline points
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i][0],
                vertices[i][1],
                this.baseHeight,
                this,
                this.stage,
            ));
        }

        this.setbackOutsideMesh = new THREE.Mesh(
            createBufferGeometry(),
            this.setbackMaterial2D,
        );
        this.setbackOutsideMesh.visible = false;

        this.objectsGroup.add(this.setbackOutsideMesh);

        const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        this.outlinePoints[1].setMovementRestrictionVector(normalVector);
        this.outlinePoints[3].setMovementRestrictionVector(normalVector);


        this.moduleDimensions = {
            moduleWidth: '1.2',
            moduleHeight: '0.3',
            moduleDepth: '0.01',
        };
        this.isSelected = false;
        this.ignored = false;
        this.placable = true;
        this.previousIntersectingAcCables = [];

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        //roof texture
        const imageUrl = this.stage.getGroundImage().url;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "Anonymous";
        this.imgTexture = textureLoader.load(imageUrl);

        this.roofTextureGeometry = createBufferGeometry();
        this.roofTextureMesh = new THREE.Mesh(
            createBufferGeometry(),
            this.translucentMaterial2D,
        );

        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage, false);
        this.polygonMeasurement.hide();
        this.updateGeometry(true);

        this.intersectingModels = [];
    }

    updateMapTexture() {
        // Get image dimension to calculate offset and scale between 0 to 1
        let imgWidth = this.stage.getImageDimensions().width;
        let imgHeight = this.stage.getImageDimensions().height;
                
        // Calculate Scale/Zoom
        let scalex = imgWidth/this.stage.getGroundImage().scale;
        let scaley = imgHeight/this.stage.getGroundImage().scale;
        
        // Calculate offset and associate it with scale
        let offSet = new THREE.Vector2(((0-1)*this.stage.getGroundImage().offset[0]/imgWidth)*scalex, ((0-1)*this.stage.getGroundImage().offset[1]/imgHeight)*scaley);
        
        //set scale on center,texture and offset
        if (scalex && scaley && offSet.x && offSet.y) {
            this.imgTexture.center = new THREE.Vector2(0.5, 0.5);
            this.imgTexture.repeat.x = scalex;
            this.imgTexture.repeat.y = scaley;
            this.imgTexture.offset = offSet;
        }
        // Rotation of Texture [PS: Roataion not implemented due to difference in offset]
        //let rotaionAngle = -utils.deg2Rad(this.stage.groundImage.rotation);
        //this.imgTexture.rotation = rotaionAngle;
    }

    addMapTexture() {
        this.removeRoofTexture();
        this.updateMapTexture();
        const roofTexture = createBufferGeometry();
        this.children.forEach(element => {
            let faceVertices = element.get3DVertices();
            let points = [];
            faceVertices.forEach(vertex => {
                points.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2] + 0.002));
            });

            let holes = [];
            let triangles;
            let geometry = createBufferGeometry();
            geometry.vertices = points;
            triangles = THREE.ShapeUtils.triangulateShape(points, holes);

            for (let i = 0; i < triangles.length; i++) {

                geometry.faces.push(new THREE.Face3(triangles[i][0], triangles[i][1], triangles[i][2]));

            }
            roofTexture.merge(geometry);
        });

        this.roofTextureGeometry = roofTexture;

        // get model geometry and calcuate face uvs
        this.coreMesh.geometry.computeBoundingBox();
        // let triGeom = this.coreMesh.geometry;
        this.computeUVs(this.roofTextureGeometry);
        this.roofTextureGeometry.computeFaceNormals();
        this.roofTextureGeometry.computeVertexNormals();

        let planeMat = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .GROUND[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
            // map: this.imgTexture,
            map: this.heatMapEnabled ? this.heatMapTexture : this.imgTexture,
            transparent: this.heatMapEnabled,
        });
        planeMat.defines = planeMat.defines || {};
        planeMat.defines.CUSTOM = "";

        let mesh = new THREE.Mesh(this.roofTextureGeometry, planeMat);
        // if (this.stage.visualManager.getIn3D()) {
        //     mesh.rotation.x = Math.PI + (Math.PI / 2);
        // }
        mesh.receiveShadow = true;
        this.roofTextureMesh = mesh;
        this.stage.sceneManager.scene.add(this.roofTextureMesh);

        const children = this.getChildren();
        children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel || modelObj instanceof SmartroofFace) {
                modelObj.heatMapEnabled = this.heatMapEnabled;
                modelObj.heatMapTexture = this.heatMapTexture;
                modelObj.removeRoofTexture();
                modelObj.addMapTexture();
            }
        });
    }

    computeUVs(geometry) {
        this.stage.ground.plane.geometry.computeBoundingBox();
        let groundGeometry = this.stage.ground.plane.geometry;

        let max = groundGeometry.boundingBox.max,
            min = groundGeometry.boundingBox.min;
        let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
        let range = new THREE.Vector2(max.x - min.x, max.y - min.y);
        let faces = geometry.faces;

        geometry.faceVertexUvs[0] = [];

        for (let i = 0; i < faces.length; i++) {
            let v1 = geometry.vertices[faces[i].a],
                v2 = geometry.vertices[faces[i].b],
                v3 = geometry.vertices[faces[i].c];
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
                new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
                new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
            ]);
        }
        geometry.uvsNeedUpdate = true;
    }



    removeRoofTexture() {
        if (this.roofTextureMesh != null) {
            const object = this.stage.sceneManager.scene.getObjectByProperty('uuid', this.roofTextureMesh.uuid);
            if (object) {
                object.geometry.dispose();
                object.material.dispose();
                this.stage.sceneManager.scene.remove(object);
                this.roofTextureMesh = null;
            }
        }
        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i] instanceof SmartroofModel || children[i] instanceof PolygonModel || children[i] instanceof Dormer || children[i] instanceof CylinderModel || children[i] instanceof SmartroofFace) {
                children[i].removeRoofTexture();
            }
        }
    }

    showRoofTexture() {
        this.roofTextureMesh.visible = true;
        let children = this.getChildren();
        children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel || modelObj instanceof SmartroofFace) {
                modelObj.showRoofTexture();
            }
        });
    }
    hideRoofTexture() {
        this.roofTextureMesh.visible = false;
        let children = this.getChildren();
        children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel || modelObj instanceof SmartroofFace) {
                modelObj.hideRoofTexture();
            }
        });
    }

    getDefaultValues() {
        const polygonDrawingDefaults = this.stage.getDesignSettings().drawing_defaults.dormer;
        return {
            tilt: polygonDrawingDefaults.tilt,
            setbackOutside: polygonDrawingDefaults.setbackOutside,
        };
    }

    initDormerPlacingMode() {
        this.stage.stateManager.startContainer();
        this.createFace();
        const vertices2DArray = this.getDefault2DVertices();
        let offsetVector = new THREE.Vector2(vertices2DArray[2][0], vertices2DArray[2][1], 0);
        offsetVector.subVectors(this.getPosition(), offsetVector);
        this.stage.placeManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
            offsetVector.x,
            offsetVector.y, { moveWithOffset: true },
        );

        this.stage.selectionControls.setSelectedObject(this);
    }

    onCancel() {
        this.removeObject();
        this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }

    async onComplete() {
        const notificationObject = this.stage.eventManager.setDormerCreating();

        try {
            await this.placeObject();
            this.stage.stateManager.stopContainer();
            this.stage.eventManager.completeDormerCreation(notificationObject);
            this.coreHeight = this.faceInfo[3].z;
            this.stage.selectionControls.setSelectedObject(this);
        } catch (error) {
            console.error('ERROR: Dormer: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorDormerCreation(notificationObject);
        }
        return Promise.resolve(true);
    }

    getState() {
        const dormerData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            coreHeight: this.coreHeight,
            tilt: this.tilt,
            azimuth: this.azimuth,
            setbackOutside: this.setbackOutside,
            ignored: this.ignored,
            childSequence: getChildrenSequence(this),
            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return dormerData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load polygon properties
            this.baseHeight = state.baseHeight;
            this.coreHeight = state.coreHeight;
            this.tilt = state.tilt;
            this.azimuth = state.azimuth;
            this.setbackOutside = state.setbackOutside;
            this.ignored = state.ignored;

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
                this.polygonMeasurement = new PolygonMeasurement(
                    [...this.outlinePoints],
                    this, this.stage, false
                );

            } else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            } else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // Remove outline points
                for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                }
                // remove measurements
                this.polygonMeasurement.remove();
                // create outline pints
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                // create polygon measurement
                this.polygonMeasurement = new PolygonMeasurement(
                    [...this.outlinePoints],
                    this, this.stage, false
                );
            } else {
                console.error('Dormer: loadState: Error in Loading Outline Points');
                return null;
            }

            const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[3].setMovementRestrictionVector(normalVector);
            // update geometry
            this.updateGeometry(true, true, true);
            // undo redo for rafters Lines
            this.getParent().getParent().updateRafter();
            this.coreMesh.geometry.computeBoundingSphere();
        }
    }

    updateRafter() {
        this.getChildren().forEach((child) => {
            child.updateRafter();
        });
    }

    exportAsSTL() {
        const { coreMesh } = this;
        coreMesh.updateMatrix();
        const singleGeometry = coreMesh.geometry.clone();

        const allObjects = [];


        const mesh = new THREE.Mesh(singleGeometry, new THREE.MeshBasicMaterial());

        allObjects.push({
            mesh,
            name: this.name,
        });

        const children = this.getChildren();

        for (let i = 0, len = children.length; i < len; i += 1) {
            const objects = children[i].exportAsSTL();
            allObjects.push(...objects);
        }

        return allObjects;
    }

    exportAsCollada() {
        const { coreMesh } = this;
        coreMesh.updateMatrix();
        const singleGeometry = coreMesh.geometry.clone();

        singleGeometry.merge(coreMesh.geometry, coreMesh.matrix);

        const mesh = new THREE.Mesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: COLOR_MAPPINGS
                    .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .MESH_COLOR,
            }),
        );
        mesh.name = this.name;

        const children = this.getChildren();

        const subArrays = [];
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof Subarray) {
                const obj = children[i].exportAsCollada();
                subArrays.push(...obj);
            } else {
                const obj = children[i].exportAsCollada();
                mesh.children.push(...obj.child);
                subArrays.push(...obj.subarray);
            }
        }

        return {
            model: mesh,
            subarray: subArrays,
        };
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        if (this.getParent() !== null) {
            let parent = this.getParent();
            this.getParent().removeChild(this);
            // undo redo for delete dormer
            parent.getParent().updateRafter();
            parent = null;
        }
        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        // remove measurements
        this.polygonMeasurement.remove();
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: Dormer.getObjectType(),
            children: [],
        };

        // save id and name
        polygonModelData.id = this.id;
        polygonModelData.name = this.name;
        if (isCopy) {
            polygonModelData.uuid = this.uuid;
        }

        // save polygon properties
        polygonModelData.baseHeight = this.baseHeight;
        polygonModelData.coreHeight = this.coreHeight;
        // polygonModelData.parapetHeight = this.parapetHeight;
        // polygonModelData.parapetThickness = this.parapetThickness;
        polygonModelData.tilt = this.tilt;
        // polygonModelData.topHeight = this.topHeight;
        polygonModelData.azimuth = this.azimuth;
        // polygonModelData.setbackInside = this.setbackInside;
        polygonModelData.setbackOutside = this.setbackOutside;
        polygonModelData.ignored = this.ignored;
        // polygonModelData.placable = this.placable;
        // polygonModelData.rotationPoints = this.rotationPoints;

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            if (position !== undefined) {
                outlinePoints.push([
                    position.x,
                    position.y,
                    position.z,
                ]);
            }
        }
        polygonModelData.outlinePoints = outlinePoints;

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        return polygonModelData;
    }

    validateObject(polygonModelData) {
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

        if (polygonModelData.setbackOutside === undefined) {
            polygonModelData.setbackOutside = 0.5;
        }

        return { isValid: true };
    }

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
        this.coreEdges.visible = false;
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
    }

    showObjectLayer() {
        // In future if layers are used..  it needs to be checked if the camera and model are in the same layer or not!
        for (let child of this.objectsGroup.children) {
            child.layers.enable(0);
        }
        this.coreEdges.visible = true;
    }

    loadObject(polygonModelData, isPaste = false) {
        if (!this.validateObject(polygonModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Dormer data invalid: Dormer removed');
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = polygonModelData.id;
            this.name = polygonModelData.name;
        }

        // load polygon properties
        this.baseHeight = polygonModelData.baseHeight;
        this.coreHeight = polygonModelData.coreHeight;
        // this.parapetHeight = polygonModelData.parapetHeight;
        // this.parapetThickness = polygonModelData.parapetThickness;
        this.tilt = parseFloat(polygonModelData.tilt);
        this.azimuth = polygonModelData.azimuth;
        // this.setbackInside = polygonModelData.setbackInside;
        this.setbackOutside = polygonModelData.setbackOutside;
        this.ignored = polygonModelData.ignored;
        // this.placable = polygonModelData.placable;

        // this.rotationPoints = polygonModelData.rotationPoints;

        // set outline points
        this.outlinePoints = [];
        for (let i = 0, len = polygonModelData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                polygonModelData.outlinePoints[i][0],
                polygonModelData.outlinePoints[i][1],
                polygonModelData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }

        // create polygon measurement
        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage, false);
        const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        this.outlinePoints[1].setMovementRestrictionVector(normalVector);
        this.outlinePoints[3].setMovementRestrictionVector(normalVector);
        // update geometry
        this.updateGeometry(true, true, true);

        // load children
        const { children } = polygonModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === SmartroofFace.getObjectType()) {
                const smartroofFace = new SmartroofFace(this.stage);
                this.addChild(smartroofFace);
                smartroofFace.loadObject(children[i], isPaste);
                if (smartroofFace.getParent() !== this) {
                    console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                }
            } else {
                console.error('PolygonModel: Invalid object type in loadObject');
            }
        }
        this.updateGeometry(true, true, true);
        if (isPaste) {
            this.saveState({ withoutContainer: false });
        } else {
            this.saveState({ withoutContainer: true });
        }
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        let heightBefore = this.coreHeight;

        // move object
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setDormerOutOfGroundRemoved();
            } else if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexDormerRemoved();
            } else if (error.message === DORMER_INVALID_PARENT_ERROR) {
                this.stage.eventManager.dormerRemoved();
            }

            this.removeObject();
            return Promise.reject(error);
        }
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);


        // really?
        const prevHeight = this.coreHeight;
        if (this.faceChanged) {
            this.curDif = 0;
            this.faceChanged = false;
        }
        if (this.getParent()) {
            const v = this.outlinePoints[2].getPosition();
            const d1 = this.getParent().getZOnTopSurface(v.x, v.y);
            this.coreHeight = d1 + this.curDif;
        }
        this.baseHeight = 0;
        this.updateGeometry(true, false, true);
        let heightAfter = this.coreHeight;
        const children = this.getChildren();
        const roofObstacles = [];
        for (let i = 0; i < children.length; i++) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0, k = grandChildren.length; j < k; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    grandChildren[j].moveObject(0, 0, heightAfter - heightBefore);
                }
                roofObstacles.push(grandChildren[j]);
            }
        }

        for (let i = 0; i < roofObstacles.length; i++) {
            roofObstacles[i].placeObject();
        }
        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }
        //Jugaad - this to remove the core edge geometry created in constructor.
        this.coreEdges.clear();
        this.updateEdgePoints();
        this.getAllSmartroofIntersections();
        try {
            await this.handleSiblingConsequences();

            this.resetGrandParentSolarAccess();

            // Saving state after the object is placed
            this.saveState();
        } catch (error) {
            console.error('ERROR: Dormer: placeObject failed', error);
            return Promise.reject(error);
        }
        // placing new dormer
        this.getParent().updateRafter();
        return Promise.resolve(true);
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        const v = this.outlinePoints[2].getPosition();
        // update base height
        this.baseHeight += deltaZ;

        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        // this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.children.forEach(edge => {
            edge.geometry.translate(deltaX, deltaY, deltaZ);
        });
        if (deltaZ !== 0) {
            for (let ind = 0; ind < this.coreMesh.geometry.vertices.length; ind += 1) {
                if (this.coreMesh.geometry.vertices[ind].z === deltaZ) {
                    this.coreMesh.geometry.vertices[ind].z = 0;
                }
            }
            // this.coreEdges.geometry = new THREE.EdgesGeometry(this.coreMesh.geometry);
            // this.coreEdges.position.z = this.coreMesh.position.z + 0.01;
            this.updateEdgePoints();
        }
        this.setbackOutsideMesh.geometry.translate(deltaX, deltaY, deltaZ);
        // this.outlinePoints = this.get3DVertices();

        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        const tempVector = new THREE.Vector3(deltaX,deltaY,deltaZ);
        this.pitchPoint.add(tempVector);
        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);
        this.polygonMeasurement.update();
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }
        this.saveState();
    }

    updateGeometry(whileRotating, g = true, flag = false) {
        

        let setbackOutsideGeometry;

        let midPoint = new THREE.Vector2();
        midPoint.x = (this.outlinePoints[0].getPosition().x + this.outlinePoints[4].getPosition().x) / 2;
        midPoint.y = (this.outlinePoints[0].getPosition().y + this.outlinePoints[4].getPosition().y) / 2;

        let vertices2DVectorArray = utils.convertArrayToVector(this.get2DVertices());
        let vertices2DVectorArray1 = vertices2DVectorArray.slice(0, 3);
        vertices2DVectorArray1.push(midPoint);
        let vertices2DVectorArray2 = vertices2DVectorArray.slice(2, 5);
        vertices2DVectorArray2.splice(0, 0, midPoint);

        // create core
        const coreShape1 = new THREE.Shape(vertices2DVectorArray1);
        const coreGeometry1 = new THREE.ExtrudeGeometry(
            coreShape1, {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        coreGeometry1.translate(0, 0, this.baseHeight);

        const coreShape2 = new THREE.Shape(vertices2DVectorArray2);
        const coreGeometry2 = new THREE.ExtrudeGeometry(
            coreShape2, {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        coreGeometry2.translate(0, 0, this.baseHeight);

        const numVertices = 4;

        if (this.getParent() instanceof SmartroofFace) {
            this.faceInfo = [];
            for (let i = 0; i < numVertices; i += 1) {
                const v = coreGeometry1.vertices[numVertices + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y) ;
            }
            coreGeometry1.vertices[numVertices + 1].z = coreGeometry1.vertices[numVertices + 0].z;
            coreGeometry1.vertices[numVertices + 2].z = coreGeometry1.vertices[numVertices + 3].z;

            for (let i = 0; i < numVertices; i += 1) {
                const v = coreGeometry2.vertices[numVertices + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y) ;
            }
            coreGeometry2.vertices[numVertices + 1].z = coreGeometry2.vertices[numVertices + 0].z;
            coreGeometry2.vertices[numVertices + 2].z = coreGeometry2.vertices[numVertices + 3].z;

            for (let i = 0; i < numVertices + 1; i += 1) {
                const v = this.outlinePoints[i].getPosition();
                const d = this.getParent().getZOnTopSurface(v.x, v.y)  - v.z;
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, d);
            }
            this.faceInfo.push(coreGeometry1.vertices[4], coreGeometry1.vertices[5], coreGeometry1.vertices[6], coreGeometry1.vertices[7], coreGeometry2.vertices[4], coreGeometry2.vertices[5], coreGeometry2.vertices[6], coreGeometry2.vertices[7]);
            const temp = this.outlinePoints;
            temp[0].moveObjectWithoutConsequences(0, 0, temp[1].getPosition().z - temp[0].getPosition().z);
            temp[4].moveObjectWithoutConsequences(0, 0, temp[3].getPosition().z - temp[4].getPosition().z);

            // update base height (defined as the lowest z of top surface minus core height)
            // let minZOnTopSurface = +Infinity;
            // for (let i = 0; i < numVertices; i += 1) {
            //     if (coreGeometry1.vertices[numVertices + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = coreGeometry1.vertices[numVertices + i].z;
            //     }
            // }
            // for (let i = 0; i < numVertices; i += 1) {
            //     if (coreGeometry2.vertices[numVertices + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = coreGeometry2.vertices[numVertices + i].z;
            //     }
            // }
            // this.baseHeight = minZOnTopSurface - this.coreHeight;

            if (this.setbackOutside) {
                setbackOutsideGeometry = this.getSetbackOutsideGeometry();
                const setbackOutsideVertices = setbackOutsideGeometry.vertices;
                for (let i = 0, len = setbackOutsideVertices.length; i < len; i += 1) {
                    setbackOutsideVertices[i].z = this.getParent().getZOnTopSurface(setbackOutsideVertices[i].x, setbackOutsideVertices[i].y) + 1;
                }
            }
            const v = this.outlinePoints[2].getPosition();
            const d = this.getParent().getZOnTopSurface(v.x, v.y);

            // const children = this.getChildren();
            if (this.faceInfo && flag) {
                for (let i = 0; i < 8; i++) {
                    this.faceInfo[i].z += this.coreHeight - d;
                }
            }
        } else {
            setbackOutsideGeometry = this.getSetbackOutsideGeometry();
        }
        this.pitchPoint = coreGeometry1.vertices[numVertices + 2].clone();
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof SmartroofFace) {
                if (children[i].edge[0] == 0 && children[i].edge[1] == 1) {
                    children[i].faceMesh = new THREE.Mesh(coreGeometry1, this.meshMaterial3D);
                }
                if (children[i].edge[0] == 3 && children[i].edge[1] == 4) {
                    children[i].faceMesh = new THREE.Mesh(coreGeometry2, this.meshMaterial3D);
                }
            }
            // console.log([...children[i].outlinePoints]);
            // const tempPlane = new THREE.Plane();
            // tempPlane.setFromCoplanarPoints(
            //     children[i].outlinePoints[0].getPosition(),
            //     children[i].outlinePoints[1].getPosition(),
            //     children[i].outlinePoints[2].getPosition(),
            // );
            // children[i].faceMesh = tempPlane;
        }
        coreGeometry1.merge(coreGeometry2);
        this.coreMesh.geometry = coreGeometry1;
        if (whileRotating) {
            this.coreEdges.clear();
            const tempCoreEdges = new THREE.LineSegments(
                new THREE.EdgesGeometry(this.coreMesh.geometry),
                this.edgeMaterial2D,
            );
            this.coreEdges.add(tempCoreEdges);
        }
        // this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry1);
        // this.coreEdges.position.z = this.coreMesh.position.z + 0.01;
        this.setbackOutsideMesh.geometry = setbackOutsideGeometry;
        this.tilt = parseFloat(this.getPitch().toFixed(2));
        this.updateFacePoints();
        if (this.stage.selectionControls.getSelectedObjects().includes(this)) {
            this.polygonMeasurement.show();
        }
        this.polygonMeasurement.update();
        this.updateEdgePoints();
        if (this.getParent()) {
            const v = this.outlinePoints[2].getPosition();
            const d1 = this.getParent().getZOnTopSurface(v.x, v.y);
            this.curDif = this.coreHeight - d1;
        }
        this.saveState();
    }

    updateRafter() {
        this.getChildren().forEach((child) => {
            child.updateRafter();
        });
    }

    createFace() {
        const op = this.outlinePoints;
        this.addChild(new SmartroofFace(this.stage, [op[0].getPosition(), op[1].getPosition(), op[2].getPosition(), this.pitchPoint.clone()], [0, 1], this.tilt));
        this.addChild(new SmartroofFace(this.stage, [this.pitchPoint.clone(), op[2].getPosition(), op[3].getPosition(), op[4].getPosition()], [3, 4], this.tilt));
    }

    updateFacePoints() {
        const children = this.getChildren();
        const gg = this.faceInfo;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof SmartroofFace) {
                if (children[i].edge[0] == 0 && children[i].edge[1] == 1) {
                    children[i].updateOutlinePoints([gg[0], gg[1], gg[2], gg[3]]);
                    children[i].tilt = this.tilt;
                }
                if (children[i].edge[0] == 3 && children[i].edge[1] == 4) {
                    children[i].updateOutlinePoints([gg[4],gg[5], gg[6], gg[7]]);
                    children[i].tilt = this.tilt;
                }
            }
            const tempPlane = new THREE.Plane();
            tempPlane.setFromCoplanarPoints(
                children[i].outlinePoints[0].getPosition(),
                children[i].outlinePoints[1].getPosition(),
                children[i].outlinePoints[2].getPosition(),
            );
            children[i].plane = tempPlane;
        }
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.outlinePoints[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;

        this.updateGeometry(true);
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0, k = grandChildren.length; j < k; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    grandChildren[j].removeObject();
                    continue;
                }
            }
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }

    async updateObject(properties) {
        let updateGeometryRequired = false;
        let handleChildrenRequired = false;
        // let handleSiblingsRequired = false;
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

        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt !== this.tilt) {
            updateGeometryRequired = updateGeometryRequired || true;
            handleChildrenRequired = true;
            properties.tilt = parseFloat(properties.tilt);
            try {
                this.updateOutlinePoints(this.tilt, properties.tilt);
            } catch (error) {
                console.error('ERROR: Dormer: Update failed', error);
                return Promise.reject(error);
            }
            this.tilt = properties.tilt;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'Height') &&
            properties.Height !== this.coreHeight) {
            updateGeometryRequired = updateGeometryRequired || true;
            handleChildrenRequired = true;
            properties.Height = parseFloat(properties.Height);
            this.heightChange = properties.Height - this.coreHeight;
            this.coreHeight = properties.Height;
            this.updateHeight();
        }

        if (Object.prototype.hasOwnProperty.call(properties, 'setbackOutside') &&
            properties.setbackOutside !== this.setbackOutside) {
            updateGeometryRequired = updateGeometryRequired || true;

            if (properties.setbackOutside !== 'custom') {
                const setbackValues = [];
                for (let i = 0, len = this.numVertices; i < len; i += 1) {
                    setbackValues.push(properties.setbackOutside);
                }
                this.setbackOutside = setbackValues;
            }
        }

        if (updateGeometryRequired) {
            try {
                this.handlePropertiesUpdate(options);
            } catch (error) {
                console.error('ERROR: PolygonModel: Update failed', error);
                return Promise.reject(error);
            }
        }
        // if (handleChildrenRequired) {
        //     const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        //     this.stage.lightsManager.setShadowMapParameters();

        //     try {
        //         await this.handleChildrenConsequences({
        //             resized: false,
        //             tiltChanged: true,
        //         });
        //         this.stage.eventManager.completePolygonModelLoading(notificationObject);
        //     }
        //     catch (error) {
        //         console.error('ERROR: PolygonModel: changeTilt failed', error);
        //         this.stage.eventManager.completePolygonModelLoading(notificationObject);
        //     }
        // }
        this.saveState();
        return Promise.resolve(true);
    }
    updateHeight() {
        const children = this.getChildren();
        this.updateGeometry(true, true, true);
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(0, 0, this.heightChange);
        }
    }

    handlePropertiesUpdate() {
        this.updateGeometry(true, true, true);
        // update children
        const children = this.getChildren();
        const roofObstacles = [];
        for (let i = 0; i < children.length; i++) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0, k = grandChildren.length; j < k; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    // grandChildren[j].removeObject();
                    continue;
                }
                roofObstacles.push(grandChildren[j]);
            }
        }
        for (let i = 0; i < roofObstacles.length; i++) {
            roofObstacles[i].placeObject();
        }
        this.getAllSmartroofIntersections();
    }

    updateOutlinePoints(currTilt, newTilt) {
        const t1 = this.outlinePoints[0].getPosition();
        t1.z = 0;
        const t2 = this.pitchPoint.clone();
        t2.z = 0;
        const b = Math.abs(t2.sub(t1).length());
        const heightDiff = (Math.tan(utils.deg2Rad(newTilt)) - Math.tan(utils.deg2Rad(currTilt))) * b;
        let lp1 = this.outlinePoints[0].getPosition();
        let lp2 = this.outlinePoints[1].getPosition();
        let line1 = [
            [lp1.x, lp1.y, lp1.z + heightDiff],
            [lp2.x, lp2.y, lp2.z + heightDiff]
        ];
        let plane = this.getParent().getFacePlaneEq();

        let res = this.getLinePlaneIntersection(plane, line1);
        this.outlinePoints[1].moveObjectWithoutConsequences(lp2.x - res.x, lp2.y - res.y, lp2.z - res.z);
        this.outlinePoints[0].moveObjectWithoutConsequences(0, 0, lp1.z - res.z);

        lp1 = this.outlinePoints[4].getPosition();
        lp2 = this.outlinePoints[3].getPosition();
        let line2 = [
            [lp1.x, lp1.y, lp1.z + heightDiff],
            [lp2.x, lp2.y, lp2.z + heightDiff]
        ];

        res = this.getLinePlaneIntersection(plane, line2);
        this.outlinePoints[3].moveObjectWithoutConsequences(lp2.x - res.x, lp2.y - res.y, lp2.z - res.z);
        this.outlinePoints[4].moveObjectWithoutConsequences(0, 0, lp1.z - res.z);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setDormerOutOfGroundRemoved();
            } else if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexDormerRemoved();
            } else if (error.message === DORMER_INVALID_PARENT_ERROR) {
                this.stage.eventManager.dormerRemoved();
            }

            this.removeObject();
            throw error;
        }
    }

    updateWhilePlacing(placingInformation) {
        if (placingInformation.parent instanceof SmartroofFace && (placingInformation.parent.getParent() !== this) && (placingInformation.parent.azimuth !== this.azimuth)) {
            const centroidPoint = this.getPosition();
            const rotationPoint = this.outlinePoints[2].getPosition();
            let angleToRotate = this.azimuth - placingInformation.parent.azimuth;
            // if (angleToRotate < 0) {
            //     angleToRotate += 360;
            // }
            const angleInRad = THREE.MathUtils.degToRad(angleToRotate);
            for (let i = 0; i < this.outlinePoints.length; i++) {
                const outlinePointX = this.outlinePoints[i].getPosition().x;
                const outlinePointY = this.outlinePoints[i].getPosition().y;
                const outlineDeltaXY = utils.rotationAroundPoint(
                    rotationPoint.x,
                    rotationPoint.y,
                    outlinePointX,
                    outlinePointY,
                    angleInRad,
                );

                this.outlinePoints[i].moveObjectWithoutConsequences(
                    outlineDeltaXY[0] - outlinePointX,
                    outlineDeltaXY[1] - outlinePointY,
                );
            }
            this.azimuth = placingInformation.parent.azimuth;
            const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[3].setMovementRestrictionVector(normalVector);
            this.updateGeometry(true);
            const children = this.getChildren();
            for (let i = 0, l = children.length; i < l; i += 1) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                }
                children[i].updateGeometry();
                children[i].rotateObjectHelper(angleInRad, rotationPoint);
            }
        }
    }

    updateEdgePoints() {
        this.edgePoints = [];
        const vertices = this.get3DVertices();
        let tempArr = [];
        for(let ind = 0; ind<vertices.length; ind+=1) {
            if(ind===vertices.length-1){
                tempArr.push(vertices[ind]);
                tempArr.push([this.pitchPoint.x, this.pitchPoint.y, this.pitchPoint.z]);
                tempArr.push(vertices[0]);
                tempArr.push([vertices[0][0], vertices[0][1], 0]);
                tempArr.push([vertices[ind][0], vertices[ind][1], 0]);
            }
            else{
                tempArr.push(vertices[ind]);
                tempArr.push(vertices[ind+1]);
                tempArr.push([vertices[ind+1][0], vertices[ind+1][1], 0]);
                tempArr.push([vertices[ind][0], vertices[ind][1], 0]);
            }
            this.edgePoints.push(tempArr);
            tempArr = [];
        }
    }

    onSelect() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }

        // show measurements
        this.polygonMeasurement.show();
        this.polygonMeasurement.update();

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                if (i == 2)
                    continue;
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
        }
        this.isSelected = true;
        this.showSetback();
    }

    deSelect() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        // hide measurements
        this.polygonMeasurement.hide();

        this.isSelected = false;
        this.hideSetback();
    }

    removeObject() {
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
        for (let j = this.outlinePoints.length - 1; j >= 0; j -= 1) {
            this.outlinePoints[j].removeObject();
            this.outlinePoints.splice(j, 1);
        }

        if (this.getParent() !== null) {
            let Previousparent = this.getParent();
            this.getParent().removeChild(this);
            if (Previousparent instanceof SmartroofFace) {
                Previousparent.updateRafterLines();
            }
            Previousparent = null;
        }
        // remove object from hover manager
        this.stage.quadTreeManager.removeObject(this);

        this.polygonMeasurement.remove();
        this.removeDimensions();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getAllSmartroofIntersections(true);
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
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

    getDefault2DVertices() {
        let vertices = [];
        vertices.push([0, 0]);
        vertices.push([0, 5]);
        vertices.push([2.5, 7.5]);
        vertices.push([5, 5]);
        vertices.push([5, 0]);
        return vertices;
    }

    // get3DVertices() {
    //     const vertices = [];
    //     const meshVertices = this.coreMesh.geometry.vertices;
    //     for (let i =0, len = meshVertices.length; i < len; i += 1) {
    //         vertices.push([
    //             meshVertices[i].x,
    //             meshVertices[i].y,
    //             meshVertices[i].z,
    //         ]);
    //     }
    //     return vertices;
    // }

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

    getIntersectionWithOtherModels(model, allModelConvexLines=[]) {
        this.intersectingEdges = [];
        const smartRoofs = [];
        model.children.forEach((child) => {
            child.convexHullCoordinates = [];
            child.convexHullCoordinates2D = [];
            child.mergePoints = [];
            child.intersectingEdges = [];
        });

        // getting models on ground.
        // no use.
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        // const groundChildren = this.stage.ground.getChildren();
        const allRoofs = [];
        for (let smodel of result.smartroofs) {
            if (smodel !== model) smartRoofs.push(smodel);
            allRoofs.push(smodel);
        }
        for (let dormer of result.dormers) {
            if(dormer !== model) smartRoofs.push(dormer);
            allRoofs.push(dormer);
        }

        const checkPointInAllModels = (point, roofID) => {
            const EPSILON = 0.00001;
            // Workaround for points on surface
            const slightlyElevatedPoint = new THREE.Vector3(
                point.x,
                point.y,
                point.z + EPSILON,
            );
            for (let i = 0; i < allRoofs.length; i++) {
                const roof = allRoofs[i];
                if (roofID !== roof.uuid) {
                    if (utils.checkPointInsideMesh(slightlyElevatedPoint, roof.coreMesh)) {
                        return true;
                    }
                }
            }
            return false;
        };

        // assigning models with intersections are to be calculated.
        // const oneRoof = this; // all roofs in scene
        const twoRoof = model; // current

        const oneRoofCoords = [];
        const twoRoofCoords = [];

        const oneRoofFaces = [];
        const oneRoofFaceObjs = [];
        for (let j = 0; j < smartRoofs.length; j++) {
            const oneRoof = smartRoofs[j];
            // oneRoof.intersectionLinesGroup.clear();
            for (let i = 0; i < oneRoof.children.length; i++) {
                const faceobj = oneRoof.children[i];
                const face = faceobj.get3DVertices();
                oneRoofFaceObjs.push(faceobj);
                oneRoofFaces.push(face);
                oneRoofCoords.push(faceobj.get2DVertices());
            }
        }

        // other roof's faces being calculated.
        const twoRoofFaces = [];
        const twoRoofFaceObjs = [];
        for (let i = 0; i < twoRoof.children.length; i++) {
            if (!twoRoof.children[i].isDeleted) {
                const faceobj = twoRoof.children[i];
                const face = faceobj.get3DVertices();
                twoRoofFaceObjs.push(faceobj);
                twoRoofFaces.push(face);
                twoRoofCoords.push(faceobj.get2DVertices());
            }
        }

        // planes being generated for the first roof.
        const oneRoofPlanes = [];
        for (let i = 0; i < oneRoofFaces.length; i++) {
            const p1 = oneRoofFaces[i][0];
            const p2 = oneRoofFaces[i][1];
            const p3 = oneRoofFaces[i][2];

            // const plane = this.getPlaneFrom3Points(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2], p3[0], p3[1], p3[2]);
            const a = new THREE.Vector3(...p1);
            const b = new THREE.Vector3(...p2);
            const c = new THREE.Vector3(...p3);

            const plane = new THREE.Plane().setFromCoplanarPoints(a, b, c);
            oneRoofPlanes.push(plane);
        }

        // Side faces of the roofs.
        const oneRoofSides = [];
        const oneRoofSideLines = [];
        for (let j = 0; j < smartRoofs.length; j++) {
            const oneRoof = smartRoofs[j];
            const vertices = oneRoof.get3DVertices();
            if(oneRoof instanceof FlatDormer){
                vertices.splice(2,1);
            }
            vertices.push(vertices[0]);
            for (let i = 0; i < (vertices.length - 1); i++) {
                const oneRoofSide = {
                    plane: null,
                    coords: null,
                    parent: null,
                    height: null,
                };
                const oneRoofSideLine = {
                    line: null,
                    parentID: null,
                };
                const p1 = vertices[i];
                const p2 = vertices[i + 1];
                const p3 = [p1[0], p1[1], 0]; // Ground Point
                [,, oneRoofSide.height] = p1;

                const a = new THREE.Vector3(...p1);
                const b = new THREE.Vector3(...p2);
                const c = new THREE.Vector3(...p3);

                oneRoofSide.plane = new THREE.Plane().setFromCoplanarPoints(a, b, c);
                oneRoofSide.coords = oneRoof.edgePoints[i];
                oneRoofSide.parent = oneRoof;
                oneRoofSides.push(oneRoofSide);
                oneRoofSideLine.parentID = oneRoof.uuid;
                oneRoofSideLine.line = new THREE.Line3(
                    new THREE.Vector3(...oneRoof.edgePoints[i][0]),
                    new THREE.Vector3(...oneRoof.edgePoints[i][oneRoof.edgePoints[i].length - 1]),
                );
                oneRoofSideLines.push(oneRoofSideLine);
            }
        }

        // planes being generated for the second roof.
        const twoRoofPlanes = [];
        for (let i = 0; i < twoRoofFaces.length; i++) {
            const p1 = twoRoofFaces[i][0];
            const p2 = twoRoofFaces[i][1];
            const p3 = twoRoofFaces[i][2];

            const a = new THREE.Vector3(...p1);
            const b = new THREE.Vector3(...p2);
            const c = new THREE.Vector3(...p3);

            const plane = new THREE.Plane().setFromCoplanarPoints(a, b, c);
            twoRoofPlanes.push(plane);
        }


        // Side faces of the roofs.
        const twoRoofSides = [];
        // const twoRoofSideLines = [];
        {
            const vertices = twoRoof.get3DVertices();
            if(twoRoof instanceof FlatDormer){
                vertices.splice(2,1);
            }
            vertices.push(vertices[0]);
            for (let i = 0; i < (vertices.length - 1); i++) {
                const twoRoofSide = {
                    plane: null,
                    coords: null,
                    parent: null,
                    height: null,
                };
                // const twoRoofSideLine = {
                //     line: null,
                //     // parent: null,
                // };
                const p1 = vertices[i];
                const p2 = vertices[i + 1];
                const p3 = [p1[0], p1[1], 0]; // Ground Point
                [,, twoRoofSide.height] = p1;
                const a = new THREE.Vector3(...p1);
                const b = new THREE.Vector3(...p2);
                const c = new THREE.Vector3(...p3);

                twoRoofSide.plane = new THREE.Plane().setFromCoplanarPoints(a, b, c);
                twoRoofSide.coords = twoRoof.edgePoints[i];
                twoRoofSide.parent = twoRoof;
                twoRoofSides.push(twoRoofSide);
                // twoRoofSideLine.parent = twoRoof;
                // twoRoofSideLine.line = new THREE.Line3(a, c);
                // twoRoofSideLines.push(twoRoofSideLine);
            }
        }

        const insideVertices = [];
        for (let j = 0; j < smartRoofs.length; j++) {
            const oneRoof = smartRoofs[j];
            if (oneRoof !== twoRoof) {
                twoRoof.children.forEach((faceobj) => {
                    faceobj.get3DVertices().forEach((vertex) => {
                        if (utils.checkPointInsideMesh(new THREE.Vector3(...vertex), oneRoof.coreMesh)) {
                            const coordinate = new JSTS.geom.Coordinate(...vertex);
                            faceobj.addMergePoint(coordinate, oneRoof.uuid);
                        }
                    });
                });
            }
        }

        let isIntersecting = false;
        const cutList = [];

        {
            const twoRoofID = twoRoof.uuid;
            const TwoRoofHeight = twoRoof.coreHeight;
            for (let i = 0; i < twoRoof.children.length; i++) {
                const faceID = twoRoof.children[i].uuid;
                const face = twoRoof.children[i].get3DVertices();
                face.push(face[0]);

                for (let j = 0; j < face.length - 1; j++) {
                    const start = new THREE.Vector3(...face[j]);
                    const end = new THREE.Vector3(...face[j + 1]);
                    const line = new THREE.Line3(start, end);
                    const lineIntersections = [];
                    let prevOneRoofID;

                    for (let k = 0; k < oneRoofPlanes.length; k++) {
                        const oneRoofID = oneRoofFaceObjs[k].parent.uuid;
                        const planecords = oneRoofCoords[k];
                        const planecords3D = oneRoofFaceObjs[k].get3DVertices().map(point => new THREE.Vector3(...point));
                        const result = new THREE.Vector3();
                        const intersectsLine = oneRoofPlanes[k].intersectsLine(line);
                        oneRoofPlanes[k].intersectLine(line, result);
                        const resultPoint = [result.x, result.y, result.z];
                        const onSurface = Math.abs(result.z - oneRoofFaceObjs[k].getZOnTopSurface(result.x, result.y)) < 0.00001;

                        if (
                            intersectsLine &&
                            (utils.checkPointInsideVertices(planecords, resultPoint) ||
                            utils.checkPointOnEdgesApprx3D(planecords3D, result)) &&
                            onSurface
                        ) {
                            const coordinate = new JSTS.geom.Coordinate(
                                result.x,
                                result.y,
                                result.z,
                            );
                            // TODO: Confirm if all instances of adding mergePoints to OneRoof can be removed.
                            // isIntersecting = oneRoofFaceObjs[k]
                            //     .addMergePoint(coordinate, twoRoofID) || isIntersecting;
                            isIntersecting = twoRoof.children[i]
                                .addMergePoint(coordinate, oneRoofID) || isIntersecting;
                            lineIntersections.push(result);

                            // DEBUG
                            // const dir = new THREE.Vector3().subVectors(start, result).normalize();
                            // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
                            // this.intersectionLinesGroup.add(arrowhelper);
                        }

                        // Executes only when oneRoofID changes. So, only once per roof.
                        if (
                            prevOneRoofID &&
                            prevOneRoofID !== oneRoofID
                        ) {
                            if (!start.isInside) {
                                utils.checkPointInsideMesh(
                                    start,
                                    oneRoofFaceObjs[k].parent.coreMesh,
                                    true,
                                );
                            }
                            if (!end.isInside) {
                                utils.checkPointInsideMesh(
                                    end,
                                    oneRoofFaceObjs[k].parent.coreMesh,
                                    true,
                                );
                            }
                        }
                        prevOneRoofID = oneRoofID;
                    }

                    for (let k = 0; k < oneRoofSides.length; k++) {
                        // TODO
                        // parent attribute should be removed once proper checks for sides are done
                        // with polygon bound rather than height checks
                        // if (TwoRoofHeight < oneRoofSides[k].parent.coreHeight) {
                        const oneRoofID = oneRoofSides[k].parent.uuid;
                        const planecords = oneRoofSides[k].coords.map(point => new THREE.Vector3(...point));
                        // console.log('planecords: ', planecords);
                        const result = new THREE.Vector3();
                        const intersectsLine = oneRoofSides[k].plane.intersectsLine(line);
                        oneRoofSides[k].plane.intersectLine(line, result);
                        const resultPoint = [result.x, result.y, result.z];
                        if (!oneRoofSides[k].plane.isPlane) {
                            console.log('oneSide', k, 'is not a plane');
                        }
                        if (
                            (
                                intersectsLine
                                // || utils.workAroundintersectSide(planecords, line)
                            )
                            // && (result.z < oneRoofSides[k].height)
                            &&
                            (utils.checkPointInsideVertices3D(planecords, result) ||
                            utils.checkPointOnEdgesApprx3D(planecords, result))
                        ) {
                            const sideCoordinate = new JSTS.geom.Coordinate(
                                result.x,
                                result.y,
                                result.z,
                            );
                            // Line of twoRoof intersects with side/face of oneRoof,
                            // point belongs to twoRoof.
                            isIntersecting = twoRoof.children[i]
                                .addMergePoint(sideCoordinate, oneRoofID) || isIntersecting;
                            lineIntersections.push(result);

                            // DEBUG
                            // const dir = new THREE.Vector3().subVectors(start, result).normalize();
                            // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
                            // this.intersectionLinesGroup.add(arrowhelper);
                        }
                        else {
                            // DEBUG
                            // const color = (utils.checkPointInsideVertices(planecords, resultPoint) ||
                            // utils.checkPointOnEdgesApprx(planecords, resultPoint)) ? 0xff0000 : 0xb0b0b0;
                            // if (utils.workAroundintersectSide(planecords, line)) {
                            //     console.log('This intersects!', result);
                            // }
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices.push(result);
                            // this.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color, size: 5, sizeAttenuation: false }),
                            // ));
                        }
                        // }
                    }
                    const cuts = utils.getLineCuts(start, end, lineIntersections);
                    cutList.push({
                        roofID: twoRoofID,
                        cuts,
                        faceID,
                    });
                }
            }

            // TODO: Confirm if all instances of adding mergePoints to OneRoof can be removed.
            // for (let i = 0; i < twoRoofSideLines.length; i++) {
            //     const { line } = twoRoofSideLines[i];

            //     for (let j = 0; j < oneRoofPlanes.length; j++) {
            //         const planecords = oneRoofCoords[j];
            //         const planecords3D = oneRoofFaceObjs[j].get3DVertices().map(point => new THREE.Vector3(...point));
            //         const result = new THREE.Vector3();
            //         const intersectsLine = oneRoofPlanes[j].intersectsLine(line);
            //         oneRoofPlanes[j].intersectLine(line, result);
            //         const resultPoint = [result.x, result.y, result.z];
            //         const isAbove = result.z < Math.max(line.start.z, line.end.z);

            //         // Side line of twoRoof 'falls' on oneRoof plane, point belongs to oneRoof.
            //         if (
            //             intersectsLine &&
            //             (utils.checkPointInsideVertices(planecords, resultPoint) ||
            //             utils.checkPointOnEdgesApprx3D(planecords3D, result)) &&
            //             isAbove
            //         ) {
            //             const coordinate = new JSTS.geom.Coordinate(result.x, result.y, result.z);
            //             oneRoofFaceObjs[j].addMergePoint(coordinate, twoRoofID);

            //             // DEBUG
            //             // const dir = new THREE.Vector3().subVectors(line.start, result).normalize();
            //             // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
            //             // this.intersectionLinesGroup.add(arrowhelper);
            //         }
            //     }
            // }
        }

        for (let z = 0; z < smartRoofs.length; z++) {
            const oneRoof = smartRoofs[z];
            const oneRoofID = oneRoof.uuid;
            const OneRoofHeight = oneRoof.coreHeight;

            for (let i = 0; i < oneRoof.children.length; i++) {
                const face = oneRoof.children[i].get3DVertices();
                face.push(face[0]);

                for (let j = 0; j < face.length - 1; j++) {
                    const start = new THREE.Vector3(...face[j]);
                    const end = new THREE.Vector3(...face[j + 1]);
                    const line = new THREE.Line3(start, end);
                    const lineIntersections = [];
                    let prevTwoRoofID;

                    for (let k = 0; k < twoRoofPlanes.length; k++) {
                        const twoRoofID = twoRoofFaceObjs[k].parent.uuid;
                        const planecords = twoRoofCoords[k];
                        const planecords3D = twoRoofFaceObjs[k].get3DVertices().map(point => new THREE.Vector3(...point));
                        const result = new THREE.Vector3();
                        const intersectsLine = twoRoofPlanes[k].intersectsLine(line);
                        twoRoofPlanes[k].intersectLine(line, result);
                        const resultPoint = [result.x, result.y, result.z];
                        const onSurface = Math.abs(result.z - twoRoofFaceObjs[k].getZOnTopSurface(result.x, result.y)) < 0.00001;

                        // Need to check if this gives extrapoints
                        // for the inner boundaries of a face.
                        if (
                            intersectsLine &&
                            (utils.checkPointInsideVertices(planecords, resultPoint) ||
                            utils.checkPointOnEdgesApprx3D(planecords3D, result)) &&
                            onSurface
                        ) {
                            const coordinate = new JSTS.geom.Coordinate(
                                result.x,
                                result.y,
                                result.z,
                            );
                            // TODO: Confirm if all instances of adding mergePoints to OneRoof can be removed.
                            // isIntersecting = oneRoof.children[i]
                            //     .addMergePoint(coordinate, twoRoofID) || isIntersecting;
                            isIntersecting = twoRoofFaceObjs[k]
                                .addMergePoint(coordinate, oneRoofID) || isIntersecting;
                            lineIntersections.push(result);

                            // DEBUG
                            // const dir = new THREE.Vector3().subVectors(start, result).normalize();
                            // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
                            // this.intersectionLinesGroup.add(arrowhelper);
                        }

                        // This probably won't do anything as 'start, end' aren't used later.
                        if (
                            prevTwoRoofID &&
                            prevTwoRoofID !== twoRoofID
                        ) {
                            if (!start.isInside) {
                                utils.checkPointInsideMesh(
                                    start,
                                    twoRoofFaceObjs[k].parent.coreMesh,
                                    true,
                                );
                            }
                            if (!end.isInside) {
                                utils.checkPointInsideMesh(
                                    end,
                                    twoRoofFaceObjs[k].parent.coreMesh,
                                    true,
                                );
                            }
                        }
                        prevTwoRoofID = twoRoofID;
                    }

                    for (let k = 0; k < twoRoofSides.length; k++) {
                        // TODO
                        // parent attribute should be removed once proper checks for sides are done
                        // with polygon bound rather than height checks
                        // if (OneRoofHeight < twoRoofSides[k].parent.coreHeight) {
                        const twoRoofID = twoRoofSides[k].parent.uuid;
                        const planecords = twoRoofSides[k].coords.map(point => new THREE.Vector3(...point));
                        // console.log('planecords: ', planecords);
                        const result = new THREE.Vector3();
                        const intersectsLine = twoRoofSides[k].plane.intersectsLine(line);
                        twoRoofSides[k].plane.intersectLine(line, result);
                        const resultPoint = [result.x, result.y, result.z];
                        if (!twoRoofSides[k].plane.isPlane) {
                            console.log('twoSide', k, 'is not a plane');
                        }
                        if (
                            (
                                intersectsLine
                                // || utils.workAroundintersectSide(planecords, line)
                            )
                            // && (result.z < twoRoofSides[k].height)
                            &&
                            (utils.checkPointInsideVertices3D(planecords, result) ||
                            utils.checkPointOnEdgesApprx3D(planecords, result))
                        ) {
                            const sideCoordinate = new JSTS.geom.Coordinate(
                                result.x,
                                result.y,
                                result.z,
                            );
                            // TODO: Confirm if all instances of adding mergePoints to OneRoof can be removed.
                            // isIntersecting = oneRoof.children[i]
                            //     .addMergePoint(sideCoordinate, twoRoofID) || isIntersecting;
                            lineIntersections.push(result);

                            // DEBUG
                            // const dir = new THREE.Vector3().subVectors(start, result).normalize();
                            // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
                            // this.intersectionLinesGroup.add(arrowhelper);
                        }
                        else {
                            // DEBUG
                            // const color = (utils.checkPointInsideVertices(planecords, resultPoint) ||
                            // utils.checkPointOnEdgesApprx(planecords, resultPoint)) ? 0xff0000 : 0xb0b0b0;
                            // if (utils.workAroundintersectSide(planecords, line)) {
                            //     console.log('This intersects!', result);
                            // }
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices.push(result);
                            // this.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color, size: 5, sizeAttenuation: false }),
                            // ));
                        }
                        // }
                    }
                }
            }
        }

        for (let i = 0; i < oneRoofSideLines.length; i++) {
            const { line, parentID } = oneRoofSideLines[i];
            for (let j = 0; j < twoRoofPlanes.length; j++) {
                const planecords = twoRoofCoords[j];
                const planecords3D = twoRoofFaceObjs[j].get3DVertices()
                    .map(point => new THREE.Vector3(...point));
                const result = new THREE.Vector3();
                const intersectsLine = twoRoofPlanes[j].intersectsLine(line);
                twoRoofPlanes[j].intersectLine(line, result);
                const resultPoint = [result.x, result.y, result.z];
                const isAbove = result.z < Math.max(line.start.z, line.end.z);
                if (
                    intersectsLine &&
                    (utils.checkPointInsideVertices(planecords, resultPoint) ||
                    utils.checkPointOnEdgesApprx3D(planecords3D, result)) &&
                    isAbove
                ) {
                    const coordinate = new JSTS.geom.Coordinate(result.x, result.y, result.z);
                    twoRoofFaceObjs[j].addMergePoint(coordinate, parentID);

                    // DEBUG
                    // const dir = new THREE.Vector3().subVectors(line.start, result).normalize();
                    // const arrowhelper = new THREE.ArrowHelper(dir, result, 5, 0xffff00);
                    // this.intersectionLinesGroup.add(arrowhelper);
                }
            }
        }

        {
            const drawableCuts = [];
            const points = [];
            cutList.forEach(({ roofID, cuts, faceID }) => {
                cuts.forEach((cut) => {
                    if (!checkPointInAllModels(cut.mid, roofID)) {
                        drawableCuts.push(cut);
                        points.push(
                            cut.start,
                            cut.end,
                        );
                        if(Math.abs(cut.start.x.toFixed(4)) !== Math.abs(cut.end.x.toFixed(4)) || Math.abs(cut.start.y.toFixed(4)) !== Math.abs(cut.end.y.toFixed(4))){
                            this.stage.getObject(faceID).intersectingEdges.push([cut.start, cut.end]);
                            this.stage.getObject(roofID).coreEdges.add(new THREE.LineSegments(
                                new THREE.BufferGeometry().setFromPoints([
                                    cut.start,
                                    cut.end,
                                ]),
                                this.edgeMaterial2D,
                            ));
                        }
                    }
                });
            });
        }

        if (isIntersecting) {
            for (let i = 0; i < model.children.length; i++) {
                // if(model.coreHeight >= this.coreHeight) {
                    //////console.log("base height", model.baseHeight +"core height" + model.coreHeight);
                //     model.children[i].convexHullCoordinates.push(new JSTS.geom.GeometryFactory().createMultiPointFromCoords(finalInterPoints).convexHull().getCoordinates())
                    //////console.log("Core height is greater than roof height");
                // } else ////console.log("Core height is less than roof height");

                // It would be better to do everything inside the class,
                // since we're dealing with its own property,
                // but this works for now, need to be changed later.

                const { mergePoints } = model.children[i];
                const hullGeomList = [];
                let normalVector = new THREE.Vector3(0,0,0);
                let templine1 = new THREE.Vector3(0,0,0);
                templine1.subVectors(model.children[i].outlinePoints[1].getPosition(),  model.children[i].outlinePoints[0].getPosition()).normalize();
                let templine2 = new THREE.Vector3(0,0,0);
                templine2.subVectors(model.children[i].outlinePoints[1].getPosition(),  model.children[i].outlinePoints[2].getPosition()).normalize();
                normalVector.crossVectors(templine1, templine2).normalize;
                Object.values(mergePoints).forEach((convexHull) => {
                    const hullGeom = new JSTS.geom.GeometryFactory()
                        .createMultiPointFromCoords(convexHull)
                        .convexHull();
                    const coordinates = hullGeom.getCoordinates();

                    if (coordinates.length > 3) {
                        hullGeomList.push(hullGeom);
                    }
                    model.children[i].convexHullCoordinates.push(coordinates);
                });

                const multiGeom = utils.combineTillDisjoint(hullGeomList);
                // Debug
                // console.log('convexHull of', i, model.children[i].convexHullCoordinates);
                // const dotGroup = model.children[i].convexHullCoordinates;

                multiGeom.forEach((jstsGeom) => {
                    const dotLocations = jstsGeom.getCoordinates();
                    if (dotLocations.length > 3) {
                        // this.intersectingEdges.push(dotLocations.slice(0, -1));
                        const lineSegments = [];
                        let previousPoint;
                        dotLocations.forEach((dotLocation) => {
                            if (!dotLocation.z) {
                                dotLocation.z = model.children[i]
                                    .getZOnTopSurface(dotLocation.x, dotLocation.y);
                            }

                            const currentPoint = new THREE.Vector3(
                                dotLocation.x,
                                dotLocation.y,
                                dotLocation.z,
                            );

                            const verticalpoints = [
                                currentPoint,
                                new THREE.Vector3(
                                    dotLocation.x,
                                    dotLocation.y,
                                ),
                            ];
                            const vertGeometry = new THREE.BufferGeometry()
                                .setFromPoints(verticalpoints);
                            // const vertMaterial = new THREE.LineBasicMaterial({
                            //     linewidth: LINE_WIDTH,
                            //     color: (0xffffff),
                            // });

                            {
                                const verticalline = new THREE.LineSegments(vertGeometry, this.edgeMaterial2D);
                                verticalline.position.x += 0.05;
                                this.coreEdges.add(verticalline);
                            }
                            {
                                const verticalline = new THREE.LineSegments(vertGeometry, this.edgeMaterial2D);
                                verticalline.position.x -= 0.05;
                                this.coreEdges.add(verticalline);
                            }

                            if (previousPoint) {
                                const midPoint = new THREE.Vector3(
                                    (currentPoint.x + previousPoint.x) / 2,
                                    (currentPoint.y + previousPoint.y) / 2,
                                    (currentPoint.z + previousPoint.z) / 2,
                                );
                                const direction = new THREE.Vector3().subVectors(currentPoint, previousPoint);
                                const nudge = utils.getNudgeVector(direction, normalVector);
                                const nudged1 = new THREE.Vector3().addVectors(midPoint, nudge);
                                const nudged2 = new THREE.Vector3().subVectors(midPoint, nudge);
                                if (
                                    (
                                        !checkPointInAllModels(nudged1, model.uuid) ||
                                        !checkPointInAllModels(nudged2, model.uuid)
                                    ) &&
                                    !utils.checkIfVectorPresentInArray(
                                        [previousPoint, currentPoint],
                                        allModelConvexLines,
                                    )
                                ) {
                                    lineSegments.push(previousPoint, currentPoint);
                                    if(Math.abs(previousPoint.x.toFixed(4)) !== Math.abs(currentPoint.x.toFixed(4)) || Math.abs(previousPoint.y.toFixed(4)) !== Math.abs(currentPoint.y.toFixed(4))){
                                        model.children[i].intersectingEdges.push([previousPoint, currentPoint]);
                                    }
                                    allModelConvexLines.push([previousPoint, currentPoint]);
                                }
                            }

                            previousPoint = currentPoint;

                            // DEBUG
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices = [currentPoint];
                            // this.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color: (0x00ff00 + (0x0000f0 * i)), size: 10, sizeAttenuation: false }),
                            // ));
                        });

                        if (lineSegments.length > 1) {
                            for(let ind = 0 ; ind < lineSegments.length - 1 ; ind++){
                                this.intersectingEdges.push([lineSegments[ind], lineSegments[ind+1]])
                            }
                            const hullLinesGeometry = new THREE.BufferGeometry()
                                .setFromPoints(lineSegments);
                            // const hullLinesMaterial = new THREE.LineBasicMaterial({
                            //     linewidth: LINE_WIDTH,
                            //     color: 0x00ff00,
                            // });
                            const horizontalline = new THREE.LineSegments(
                                hullLinesGeometry,
                                this.edgeMaterial2D,
                            );
                            horizontalline.position.z += 0.01;
                            this.coreEdges.add(horizontalline);
                        }
                    }
                });

                // const groundline = new THREE.Line(ground, dbgMaterial);
                // groundline.position.y += 0.01;
                // this.intersectionLinesGroup.add(groundline);

                // const dbgGeometry = getFace(debugPlaneVertices.splice(-1));
                // const dbgMaterial = new THREE.MeshBasicMaterial({
                //     transparent: true,
                //     opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
                //     color: (0x00ff00 + (0x0000f0 * i)),
                // });
                // const dbgmesh = new THREE.Mesh(dbgGeometry, dbgMaterial);
                // this.intersectionLinesGroup.add(dbgmesh);
            }
        }
        return allModelConvexLines;

        // Only for debug
        // for (let i = 0; i < oneRoofFaceObjs.length; i++) {
            //////console.log('oneroofface', i, oneRoofFaceObjs[i].mergePoints);
        // }

        // for (let i = 0; i < twoRoofFaceObjs.length; i++) {
            //////console.log('tworoofface', i, twoRoofFaceObjs[i].mergePoints);
        // }
    }

    getAllSmartroofIntersections(isDeleted = false){
        let tempConvexLines = [];
        if(!isDeleted){
            this.coreEdges.clear();
            tempConvexLines = utils.getIntersectionWithOtherModels(this);
        }
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        const groundChildren = [];
        for (let smodel of result.smartroofs) {
            groundChildren.push(smodel);
        }
        for (let dormer of result.dormers) {
            groundChildren.push(dormer);
        }
        groundChildren.forEach((child) => {
            if ((child instanceof SmartroofModel || child instanceof Dormer) && child !== this) {
                // child.intersectionLinesGroup.clear();
                child.coreEdges.clear();
                let temp212 = utils.getIntersectionWithOtherModels(child, []);
                if(temp212.length!==tempConvexLines.length){
                    tempConvexLines.push(...temp212);
                }
                child.getChildren().forEach(face => {
                    face.updateRafter();
                });
            }
        });
        this.getChildren().forEach(face => {
            face.updateRafter();
        });
    }

    getRoofMapVertices() {
        let roofVertices = [];
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
                this.outlinePoints[i].getPosition().z,
            ]);
        }
        const centrePoint = [this.pitchPoint.x, this.pitchPoint.y, this.pitchPoint.z];
        roofVertices.push(vertices[0], vertices[1], vertices[2], centrePoint, vertices[2], vertices[3], vertices[4]);
        return roofVertices;
    }

    getAzimuth() {
        return this.azimuth;
    }

    getTilt() {
        return this.tilt;
    }

    getCoreHeight() {
        return this.coreHeight;
    }
    getParentHeight() {
        let parentCoreHeight;
        if (this.getParent()) {
            parentCoreHeight = this.getParent().getParent().coreHeight;
        }
        return parentCoreHeight;
    }

    getZOnTopSurface(x, y) {
        // should return parents getZCoord
        if (this.outlinePoints.length === 0) {
            console.error('ERROR: PolygonModel: has outline points null');
        }
        const v1 = this.outlinePoints[0].getPosition();
        const v2 = this.outlinePoints[1].getPosition();
        const v3 = this.outlinePoints[2].getPosition();
        v1.addScaledVector(v2, -1);
        v3.addScaledVector(v2, -1);
        v1.cross(v3);
        const d = -1 * ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
        return -1 * ((d / v1.z) + ((v1.y * y) / v1.z) + ((v1.x * x) / v1.z));
    }

    getLinePlaneIntersection(plane, line) {
        const result = {
            x: null,
            y: null,
            z: null,
            onLine: false,
            onPlane: false,
        };

        const l = line[1][0] - line[0][0];
        const m = line[1][1] - line[0][1];
        const n = line[1][2] - line[0][2];

        const t = -(plane[0] * line[0][0] + plane[1] * line[0][1] + plane[2] * line[0][2] + plane[3]) / (plane[0] * l + plane[1] * m + plane[2] * n);

        result.x = t * l + line[0][0];
        result.y = t * m + line[0][1];
        result.z = t * n + line[0][2];

        const minX = Math.min(line[0][0], line[1][0]);
        const maxX = Math.max(line[0][0], line[1][0]);
        const minY = Math.min(line[0][1], line[1][1]);
        const maxY = Math.max(line[0][1], line[1][1]);
        const minZ = Math.min(line[0][2], line[1][2]);
        const maxZ = Math.max(line[0][2], line[1][2]);

        if (result.x >= minX && result.x <= maxX && result.y >= minY && result.y <= maxY && result.z >= minZ && result.z <= maxZ) {
            result.onLine = true;
        }

        if (this.checkPointOnPlane(plane, result)) {
            result.onPlane = true;
        }

        return result;
    }

    checkPointOnPlane(plane, point) {
        return plane[0] * point.x + plane[1] * point.y + plane[2] * point.z + plane[3] == 0;
    }

    getPosition() {
        const { vertices } = this.coreMesh.geometry;
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let i = 0, len = vertices.length; i < len / 2; i += 1) {
            const pointPosition = vertices[i].clone();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count += 1;
        }
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    getPitch() {
        if (this.faceInfo.length) {
            const deltaZ = Math.abs(this.faceInfo[1].z - this.pitchPoint.z);
            const deltaV = this.pitchPoint.clone().sub(this.faceInfo[1]).length();
            return utils.rad2Deg(Math.asin(deltaZ / deltaV));
        }
        return 0;
    }

    getPlacingInformation() {
        let parentExists = true;
        const response = {};
        response.pointUnplaceableError = null;
        response.errors = [];

        // Getting vertices
        const vertices2DArray = this.get2DVertices();
        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        if (utils.checkComplexGeometry(vertices2DArray) ||
            !this.checkTopVerticesConstraint() ||
            this.checkDormerNormal() ||
            !this.checkIfDormerRectangle() ||
            this.checkDormerVerticesOnGround()) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }

        if (parentExists) {
            if (this.getParent()) {
                this.stage.eventManager.setObjectsSelected(this);

            }
            // using raycaster to get the top most model in new place
            // and get height of it for deltaZ
            // but ignoring this model or its child as we don't want to place over them
            
            const idsToIgnore = [this.uuid];
            this.getChildrenModelUuids(idsToIgnore);
            let erodedVertices;
            // To accommodate for snapping
            if (vertices2DArray !== null) {
                const offset = 0.001;
                erodedVertices =
                    [
                        [vertices2DArray[2][0] - offset, vertices2DArray[2][1] - offset],
                        [vertices2DArray[2][0] + offset, vertices2DArray[2][1] + offset],
                    ];
            }
            if (erodedVertices.length !== 0) {
                const allBelowModels = raycastingUtils.getAllModelsBelowVertices(
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

                const midPoint = new THREE.Vector2(
                    (this.get2DVertices()[0][0] + this.get2DVertices()[4][0]) / 2,
                    (this.get2DVertices()[0][1] + this.get2DVertices()[4][1]) / 2,
                );
                const centerPoint = new THREE.Vector2(this.get2DVertices()[2][0], this.get2DVertices()[2][1]);
                const ratio = 0.95;
                const checkPoint = new THREE.Vector2(
                    (ratio * centerPoint.x) + ((1 - ratio) * midPoint.x),
                    (ratio * centerPoint.y) + ((1 - ratio) * midPoint.y),
                );

                const offset = 0.0001;
                const erodedVerticesMidpoint = [
                    [checkPoint.x - offset, checkPoint.y - offset],
                    [checkPoint.x + offset, checkPoint.y + offset],
                ];

                const allBelowMidPoint = raycastingUtils.getAllModelsBelowVertices(
                    erodedVerticesMidpoint,
                    this.stage, { includeObstacles: true },
                );
                let [newParentMidPoint, newHeightMidPoint] = [-1, -1];
                for (let i = 0; i < allBelowMidPoint.length; i += 1) {
                    const model = allBelowMidPoint[i][0];
                    const height = allBelowMidPoint[i][1];
                    if (!idsToIgnore.includes(model.uuid)) {
                        if (newHeightMidPoint < height) {
                            [newParentMidPoint, newHeightMidPoint] = [model, height];
                        }
                    }
                }
                if (newParentMidPoint.uuid === newParent.uuid || !(newParent instanceof SmartroofFace && newParentMidPoint instanceof SmartroofFace)) {
                    this.parentTemp = newParent;
                    if (this.parent && this.parentTemp) {
                        if (this.parentTemp.id !== this.parent.id) {
                            this.faceChanged = true;
                        }
                    }
                }
                response.parent = this.parentTemp;
                response.height = newHeight;

                if (!(this.parentTemp instanceof SmartroofFace && (this.parentTemp.getParent() !== this) && !this.parentTemp.isDeleted && !this.checkDormerInverted(this.parentTemp))) {
                    response.errors.push(new Error(DORMER_INVALID_PARENT_ERROR));
                }
            } else {
                response.errors.push(new Error(ACDB_WITH_NO_AREA_ERROR));
            }
        }
        return response;
    }

    checkTopVerticesConstraint() {
        const v1 = new THREE.Vector3();
        v1.subVectors(this.outlinePoints[2].getPosition(), this.outlinePoints[1].getPosition());
        const v2 = new THREE.Vector3();
        v2.subVectors(this.outlinePoints[3].getPosition(), this.outlinePoints[2].getPosition());
        let angle = utils.rad2Deg(Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x));
        if ((angle >= 0 && angle < 180) || (angle >= -360 && angle < -180) || (angle > -0.1 && angle <= 0)) {
            return true;
        } else {
            return false;
        }
    }

    checkDormerNormal() {
        const v1 = new THREE.Vector3();
        v1.subVectors(this.outlinePoints[1].getPosition(), this.outlinePoints[0].getPosition());
        const v2 = new THREE.Vector3();
        v2.subVectors(this.outlinePoints[4].getPosition(), this.outlinePoints[0].getPosition());
        v1.z = 0;
        v2.z = 0;
        v2.cross(v1);
        if (v2.z <= 0) {
            return true;
        }
        return false;
    }

    checkDormerInverted(newParent) {
        if (newParent === undefined || newParent === null || !(newParent instanceof SmartroofFace)) {
            return false;
        }
        const points = newParent.getParent().get2DVertices();
        const vertices = utils.convertArrayToVector(points);
        if (newParent.fold) {
            vertices.push(newParent.fold.foldPoints[0]);
            vertices.push(newParent.fold.foldPoints[1]);
            const faceEdge = [vertices[points.length], vertices[points.length + 1]];
            const topPoint = utils.getSideofLine(vertices[points.length], vertices[points.length + 1], this.outlinePoints[2].getPosition());
            const bottomPoint = utils.getSideofLine(vertices[points.length], vertices[points.length + 1], this.outlinePoints[0].getPosition());

            const distTop = getDistanceBetweenPointAndLine(this.outlinePoints[2].getPosition(), faceEdge);
            const distBottom = getDistanceBetweenPointAndLine(this.outlinePoints[0].getPosition(), faceEdge);

            return ((distTop <= distBottom) && !(topPoint ^ bottomPoint));
        } else {
            const faceEdge = [vertices[newParent.edge[0]], vertices[newParent.edge[1]]];
            const topPoint = utils.getSideofLine(vertices[newParent.edge[0]], vertices[newParent.edge[1]], this.outlinePoints[2].getPosition());
            const bottomPoint = utils.getSideofLine(vertices[newParent.edge[0]], vertices[newParent.edge[1]], this.outlinePoints[0].getPosition());

            const distTop = getDistanceBetweenPointAndLine(this.outlinePoints[2].getPosition(), faceEdge);
            const distBottom = getDistanceBetweenPointAndLine(this.outlinePoints[0].getPosition(), faceEdge);

            return ((distTop <= distBottom) && !(topPoint ^ bottomPoint));
        }
    }

    checkIfDormerRectangle() {
        const v1 = this.outlinePoints[0].getPosition().clone();
        const v2 = this.outlinePoints[1].getPosition().clone();
        const v3 = this.outlinePoints[3].getPosition().clone();
        const v4 = this.outlinePoints[4].getPosition().clone();
        v1.z = 0;
        v2.z = 0;
        v3.z = 0;
        v4.z = 0;
        let [startAngle, endAngle] = (utils.getAngles(v1, v2, v3));
        let diff = endAngle - startAngle;
        if (startAngle > endAngle) {
            diff = (Math.PI * 2) - Math.abs(diff);
        }
        let angle = parseFloat((360 - Math.abs(utils.toDegrees(diff))).toFixed(1))
        if (angle != 90.0) {
            return false;
        }

        [startAngle, endAngle] = (utils.getAngles(v2, v3, v4));
        diff = endAngle - startAngle;
        if (startAngle > endAngle) {
            diff = (Math.PI * 2) - Math.abs(diff);
        }
        angle = parseFloat((360 - Math.abs(utils.toDegrees(diff))).toFixed(1))
        if (angle != 90.0) {
            return false;
        }

        [startAngle, endAngle] = (utils.getAngles(v3, v4, v1));
        diff = endAngle - startAngle;
        if (startAngle > endAngle) {
            diff = (Math.PI * 2) - Math.abs(diff);
        }
        angle = parseFloat((360 - Math.abs(utils.toDegrees(diff))).toFixed(1))
        if (angle != 90.0) {
            return false;
        }

        [startAngle, endAngle] = (utils.getAngles(v4, v1, v2));
        diff = endAngle - startAngle;
        if (startAngle > endAngle) {
            diff = (Math.PI * 2) - Math.abs(diff);
        }
        angle = parseFloat((360 - Math.abs(utils.toDegrees(diff))).toFixed(1))
        if (angle != 90.0) {
            return false;
        }
        return true;
    }

    checkDormerVerticesOnGround() {
        let flag = false;
        const vertices = this.get3DVertices();
        vertices.forEach(vertex => {
            if (vertex[2] < 0) {
                flag = true;
            }
        });
        return flag;
    }

    getReflectiveVector(vector, normal) {
        let reflectiveVector = new THREE.Vector3();
        reflectiveVector = normal.clone();
        let dotResult = vector.dot(normal);
        reflectiveVector.multiplyScalar(2 * dotResult);
        reflectiveVector.sub(vector);

        return reflectiveVector;
    }

    getSetbackOutsideGeometry() {
        // create setbackOutside
        let setbackOutsideGeometry = createBufferGeometry();
        const setbackOutsideShapes = [];

        if (this.setbackOutside && this.getParent()) {
            if (!Array.isArray(this.setbackOutside)) {
                const setbackValues = [];
                for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                    setbackValues.push(this.setbackOutside);
                }
                this.setbackOutside = setbackValues;
            }

            const setbackOutsideVectorPoints = utils.generateSetbackGeometry(
                this.setbackOutside,
                this.getEdges(),
                this.get2DVertices(),
                EDIT_SETBACK_OUTSIDE,
            );
            const innerPolygonPoints = this.get2DVertices();

            // why was this done?
            // const base3DVerticesArray = [];
            // for (let point of innerPolygonPoints) {
            //     if (this.getParent() instanceof PolygonModel ||
            //         this.getParent() instanceof CylinderModel) {
            //         base3DVerticesArray.push([
            //             point[0],
            //             point[1],
            //             this.getParent().getZOnTopSurface(point[0], point[1]),
            //         ]);
            //     }
            //     else {
            //         base3DVerticesArray.push([
            //             point[0],
            //             point[1],
            //             0,
            //         ]);
            //     }
            // }
            // let setbackOutside3DPoints =
            //     utils.getSetbackPoints(base3DVerticesArray, this.setbackOutside);
            const setbackOutsidePoints =
                utils.convertVectorArrayTo2DArray(setbackOutsideVectorPoints);
            const parentPolygonPoints = this.getParent().get2DVertices();
            const setbackVertices = utils.outsideSetbackIntersectionWithParent(
                setbackOutsidePoints,
                innerPolygonPoints,
                parentPolygonPoints,
            );

            if (setbackVertices instanceof Error) {
                if (setbackVertices.message === PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR ||
                    setbackVertices.message === 'Cannot generate outside setback') {
                    return createBufferGeometry();
                }
            }

            for (let i = 0; i < setbackVertices[0].length; i += 1) {
                if (setbackVertices[0][i].length > 0) {
                    const setbackOutsideShape =
                        new THREE.Shape(utils.convertArrayToVector(setbackVertices[0][i]));

                    const holesInShape = [];
                    for (let j = 0; j < setbackVertices[1][i].length; j += 1) {
                        const hole =
                            new THREE.Path(utils.convertArrayToVector(setbackVertices[1][i][j]));
                        holesInShape.push(hole);
                    }

                    setbackOutsideShape.holes = holesInShape;
                    setbackOutsideShapes.push(setbackOutsideShape);
                }
            }

            setbackOutsideGeometry = new THREE.ShapeGeometry(setbackOutsideShapes);
            setbackOutsideGeometry.translate(0, 0, this.baseHeight);
        }

        return setbackOutsideGeometry;
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

    hideSetback() {
        this.setbackOutsideMesh.visible = false;
    }

    showSetback() {
        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
    }

    showMeasurement() {

    }

    hideMeasurement() {
        this.polygonMeasurement.hide();
    }

    getOutsideSetbackPolygons() {
        const polygons = [];
        if (this.setbackOutsideMesh.geometry.parameters !== undefined) {
            const { shapes } = this.setbackOutsideMesh.geometry.parameters;
            for (let i = 0, len = shapes.length; i < len; i += 1) {
                polygons.push({
                    vertices: shapes[i].getPoints(),
                    holeVertices: shapes[i].getPointsHoles().length > 0 ?
                        shapes[i].getPointsHoles()[0] : [],
                });
            }
        }
        return polygons;
    }

    /**
     * Returns the list of acCables intersecting
     * with the polygon model.
     */
    getIntersectingAcCables() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        return result.acCable;
    }

    /**
     * Updates the acCables in 3d.
     * @param {* array of acCables} acCables
     */
    async updateIntersectingAcCables(acCables) {
        const polygonVertices = this.get2DVertices();
        for (let i = 0; i < acCables.length; i += 1) {
            if (utils.checkPolygonIntersection(polygonVertices, acCables[i].get2DVertices())) {
                acCables[i].placeObject();
            }
        }
    }

    async handleSiblingConsequences() {
        const allPromises = [];

        const siblings = this.getParent().getChildren();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray && !this.ignored) {
                // TO:DO - consider outside setback?
                sibling.deleteTableInsideArea(this.get2DVertices());
            } else if (sibling instanceof Walkway) {
                const placingPolygon = JSTSConverter.verticesToJSTSPolygon(this.get2DVertices());
                const siblingPolygon = JSTSConverter.verticesToJSTSPolygon(sibling.get2DVertices());
                const intersectingPolygon = placingPolygon.intersection(siblingPolygon);
                if (intersectingPolygon.getArea() > 0) {
                    allPromises.push(sibling.placeObject());
                }
            }
        }

        try {
            await Promise.all(allPromises);
        } catch (error) {
            console.error('ERROR: Dormer: handleSiblingConsequences failed', error);
        }
        return Promise.resolve(true);
    }

    computeArea() {
        let modelArea = 0;
        const roofChildren = this.getChildren().filter(child => child instanceof SmartroofFace);
        roofChildren.forEach((child) => {
            modelArea += child.computeArea();
        });
        return modelArea;
    }

    computePercentageAreaCoveredByPanels() {
        let modelArea = 0;
        let panelArea = 0;
        let calculatedPercentage = 0;
        const roofChildren = this.getChildren().filter(child => child instanceof SmartroofFace);
        roofChildren.forEach((child) => {
            modelArea += child.computeArea();
            panelArea += child.computeAreaForPanels();
        });
        calculatedPercentage = ((panelArea / modelArea) * 100);
        return calculatedPercentage;
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.POLYGON;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    get numVertices() {
        return this.outlinePoints.length;
    }

    get mesh() {
        return this.coreMesh;
    }

    get mesh2D() {
        return this.coreMesh;
    }

    get mesh3D() {
        return this.coreMesh;
    }

    get mergeMeshMaterial2D() {
        return this.meshMaterial2D;
    }

    get mergeMeshMaterial3D() {
        return this.meshMaterial3D;
    }

    get mergeEdgeMaterial2D() {
        return this.edgeMaterial2D;
    }

    get mergeEdgeMaterial3D() {
        return this.edgeMaterial3D;
    }
    dormerSwitchTo3D() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.getChildren().forEach((child) => {
                child.hideRafter();
            });
        } else {
            this.getChildren().forEach((child) => {
                child.updateRafter();
            });
        }
    }

    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        this.dormerSwitchTo3D();
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            if (this.coreMesh.material !== this.meshMaterial3D) {
                this.coreMesh.material = this.meshMaterial3D;
                this.coreEdges.children.forEach(edge => {
                    edge.material = this.edgeMaterial3D;
                });
                this.getChildren().forEach((child) => {
                    child.hideRafter();
                });
            }
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            if (this.coreMesh.material !== this.meshMaterial2D) {
                this.coreMesh.material = this.meshMaterial2D;
                this.coreEdges.children.forEach(edge => {
                    edge.material = this.edgeMaterial2D;
                });
                this.getChildren().forEach((child) => {
                    child.updateRafter();
                });
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        for (let i = 0; i < this.coreEdges.children.length; i++) {
            visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges.children[i]);
        }
        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        } else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    handleDragStart() {
        // this.setbackOutsideMesh.visible = false;
        this.previousIntersectingAcCables = this.getIntersectingAcCables();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd(deltaX = 0, deltaY = 0) {
        this.updateIntersectingAcCables(this.previousIntersectingAcCables);
        const notificationObject = this.stage.eventManager.setDormerLoading();

        // if (this.stage.viewManager.setbackVisible) {
        //     this.setbackOutsideMesh.visible = true;
        // }
        try {
            await this.placeObject(deltaX, deltaY);
        } catch (e) {
            // error handled by place object
        } finally {
            this.stage.eventManager.completeDormerLoading(notificationObject);
        }
        this.previousIntersectingAcCables = [];
    }

    handleDragCancel() {
        this.previousIntersectingAcCables = [];
        // if (this.stage.viewManager.setbackVisible) {
        //     this.setbackOutsideMesh.visible = true;
        // }
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex) {
        this.polygonMeasurement.handleVertexDragStart(vertex);
        this.previousIntersectingAcCables = this.getIntersectingAcCables();
    }

    handleVertexMove(vertex, deltaX = 0, deltaY = 0, deltaZ = 0) {
        console.log('outlinePointsss', this.outlinePoints);
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: DORMER: vertex not in outlinePoints in handleVertexMove');
        }
        let displacementVector = new THREE.Vector3(deltaX, deltaY, 0);

        let normal = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        // normal.addVectors( this.outlinePoints[4].getPosition() , this.outlinePoints[0].getPosition() );
        // normal.divideScalar(2);
        // normal.sub(this.outlinePoints[2].getPosition());
        // normal.z = 0;
        const theta1 = -Math.atan2(displacementVector.y, displacementVector.x) + Math.atan2(normal.y, normal.x);
        normal.normalize();
        let reflectiveV = this.getReflectiveVector(displacementVector, normal);

        let headVector = new THREE.Vector3();
        if (this.outlinePoints.indexOf(vertex) == 0) {
            headVector.subVectors(this.outlinePoints[1].getPosition(), this.outlinePoints[2].getPosition());
        } else if (this.outlinePoints.indexOf(vertex) == 4) {
            headVector.subVectors(this.outlinePoints[3].getPosition(), this.outlinePoints[2].getPosition());
        }
        headVector.z = 0;
        headVector.normalize();

        let temp = displacementVector.length();

        let dvx = new THREE.Vector3(Math.cos(utils.deg2Rad(this.azimuth)), Math.sin(utils.deg2Rad(this.azimuth)), 0);
        // dvx.subVectors( this.outlinePoints[0].getPosition(), this.outlinePoints[4].getPosition() );
        // dvx.z = 0;
        dvx.normalize();
        const theta2 = dvx.angleTo(headVector);
        dvx.multiplyScalar(temp);
        let final = dvx.clone();

        const movementVector1 = final.multiplyScalar(Math.sin(theta1)).add(normal.clone().multiplyScalar(final.length() * Math.sin(theta1) * Math.tan(theta2)));
        // const movementVector1 = displacementVector.clone();
        // movementVector1.projectOnVector(headVector);
        const movementVector2 = this.getReflectiveVector(movementVector1, normal);

        //bottom-left vertex
        if (this.outlinePoints.indexOf(vertex) == 0) {
            this.outlinePoints[4].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
            // this.outlinePoints[1].moveObjectWithoutConsequences( movementVector1.x, movementVector1.y, deltaZ);
            // this.outlinePoints[3].moveObjectWithoutConsequences( movementVector2.x, movementVector2.y, deltaZ);

            // done with intersections
            // edge intersection between 1-2 and 0 and normal for 1
            const edge1_2 = [this.outlinePoints[1].getPosition(), this.outlinePoints[2].getPosition()];
            const edge0_1 = [this.outlinePoints[0].getPosition(), this.outlinePoints[0].getPosition().add(normal)];
            const result = utils.checkLineIntersection(edge0_1, edge1_2);
            // edge intersection between 3-2 and 4 and normal for 3
            const edge3_2 = [this.outlinePoints[3].getPosition(), this.outlinePoints[2].getPosition()];
            const edge4_3 = [this.outlinePoints[4].getPosition(), this.outlinePoints[4].getPosition().add(normal)];
            const result2 = utils.checkLineIntersection(edge3_2, edge4_3);
            this.outlinePoints[1].setPosition(result.x, result.y, this.outlinePoints[1].getPosition().z)
            this.outlinePoints[3].setPosition(result2.x, result2.y, this.outlinePoints[3].getPosition().z)

        }
        //bottom-right vertex
        else if (this.outlinePoints.indexOf(vertex) == 4) {
            this.outlinePoints[0].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
            // this.outlinePoints[3].moveObjectWithoutConsequences( movementVector1.x, movementVector1.y, deltaZ);
            // this.outlinePoints[1].moveObjectWithoutConsequences( movementVector2.x, movementVector2.y, deltaZ);

            // done with intersection
            // edge intersection between 1-2 and 0 and normal for 1
            const edge1_2 = [this.outlinePoints[1].getPosition(), this.outlinePoints[2].getPosition()];
            const edge0_1 = [this.outlinePoints[0].getPosition(), this.outlinePoints[0].getPosition().add(normal)];
            const result = utils.checkLineIntersection(edge0_1, edge1_2);
            // edge intersection between 3-2 and 4 and normal for 3
            const edge3_2 = [this.outlinePoints[3].getPosition(), this.outlinePoints[2].getPosition()];
            const edge4_3 = [this.outlinePoints[4].getPosition(), this.outlinePoints[4].getPosition().add(normal)];
            const result2 = utils.checkLineIntersection(edge3_2, edge4_3);
            this.outlinePoints[1].setPosition(result.x, result.y, this.outlinePoints[1].getPosition().z)
            this.outlinePoints[3].setPosition(result2.x, result2.y, this.outlinePoints[3].getPosition().z)
        }
        //top-left vertex
        else if (this.outlinePoints.indexOf(vertex) == 1) {
            this.outlinePoints[3].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }
        //top-right vertex
        else if (this.outlinePoints.indexOf(vertex) == 3) {
            this.outlinePoints[1].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }
        this.polygonMeasurement.update()
        this.updateGeometry();
        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: DORMER: vertex not in outlinePoints in handleVertexPlace');
        }

        const notificationObject = this.stage.eventManager.setDormerLoading();
        this.updateIntersectingAcCables(this.previousIntersectingAcCables);
        this.previousIntersectingAcCables = [];
        try {
            // place object
            await this.placeObject();

            // place its children if top surface changed, i.e., the model is tilted
            // await this.handleChildrenConsequences({
            //     resized: true,
            //     tiltChanged: this.getTilt() !== 0,
            // });

            // update measurement
            this.polygonMeasurement.handleVertexDragEnd(vertex);

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            //remove subarrays
            const children = this.getChildren();
            for (let i = 0; i < children.length; i++) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                    }
                }
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);

            // to update the mesh in the scene
            this.stage.mergeManager.mergeScene(this);

            this.stage.eventManager.completeDormerLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: DORMER: handleVertexPlace failed', error);

            this.stage.eventManager.completeDormerLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    getUUID() {
        return this.uuid;
    }

    getChildrenModelUuids(ids) {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof PolygonModel || children[i] instanceof CylinderModel || children[i] instanceof SmartroofFace || children[i] instanceof Dormer) {
                ids.push(children[i].uuid);
                children[i].getChildrenModelUuids(ids);
            }
        }
    }

    getHighestZ() {
        let highestZ = 0;
        const { vertices } = this.coreMesh.geometry;
        for (let i = this.numVertices; i < 2 * this.numVertices; i += 1) {
            if (vertices[i]) {
                highestZ = Math.max(highestZ, vertices[i].z);
            }
        }
        return highestZ;
    }

    static getObjectType() {
        return 'Dormer';
    }

    isIgnored() {
        return this.ignored;
    }
}
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import _ from 'lodash';
import BaseObject from '../BaseObject';
import PolygonModel from './PolygonModel';
import CylinderModel from './CylinderModel';
import Walkway from './Walkway';
import Subarray from '../subArray/Subarray';
import * as JSTSConverter from '../../utils/JSTSConverter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    TREE_WITH_NO_AREA_ERROR,
    TREE_SEGMENTS,
    TREE_WITH_SMALL_CROWN_ERROR,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    LINE_WIDTH,
    TRANSLUCENT_OPACITY_FOR_MODELS,
} from '../visualConstants';
import OutlinePoints from '../subObjects/OutlinePoints';
import LengthMeasurement from '../subObjects/LengthMeasurement';
import * as visualUtils from '../../utils/visualUtils';
import * as raycastingUtils from '../../utils/raycastingUtils';
import * as utils from '../../utils/utils';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';

const MINIMUM_NUMBER_OF_POINTS = 3;
const trunkMaterialTexture = new THREE.TextureLoader().load('https://design-studio-app.s3.ap-south-1.amazonaws.com/Trunk_AL.png');
const crownMaterialTexture = new THREE.TextureLoader().load('https://design-studio-app.s3.ap-south-1.amazonaws.com/Crown_AL.png');

export default class Tree extends BaseObject {
    constructor(stage) {
        super(stage);

        // standard norms
        this.stage = stage;
        this.id = this.stage.getModelId();
        this.name = `Tree #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // list of outline points
        this.outlinePoints = [];

        // // // //
        // Material Start
        //
        this.trunkMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .TREE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .TRUNK_MESH_COLOR,
        });
        this.trunkMaterial2D.defines = this.trunkMaterial2D.defines || {};
        this.trunkMaterial2D.defines.CUSTOM = '';

        this.crownMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .TREE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .CROWN_MESH_COLOR,
        });
        this.crownMaterial2D.defines = this.crownMaterial2D.defines || {};
        this.crownMaterial2D.defines.CUSTOM = '';

        trunkMaterialTexture.wrapS = THREE.RepeatWrapping;
        trunkMaterialTexture.wrapT = THREE.RepeatWrapping;
        trunkMaterialTexture.offset.set(0, 0);
        trunkMaterialTexture.repeat.set(2, 2);
        this.trunkMaterial3D = new THREE.MeshLambertMaterial({
            color:
                COLOR_MAPPINGS.TREE[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .TRUNK_MESH_COLOR,
            map: trunkMaterialTexture,
        });
        this.trunkMaterial3D.defines = this.trunkMaterial3D.defines || {};
        this.trunkMaterial3D.defines.CUSTOM = '';

        this.crownMaterial3D = new THREE.MeshLambertMaterial({
            color:
                COLOR_MAPPINGS.TREE[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .CROWN_MESH_COLOR,
            map: crownMaterialTexture,
        });
        this.crownMaterial3D.defines = this.crownMaterial3D.defines || {};
        this.crownMaterial3D.defines.CUSTOM = '';

        this.trunkEdgeMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .TREE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .TRUNK_EDGE_COLOR,
        });

        this.crownEdgeMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .TREE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .CROWN_EDGE_COLOR,
        });
        //
        // Material end
        // // // //

        this.trunkMesh = createMesh(createBufferGeometry(),this.trunkMaterial2D);
        this.trunkMesh.receiveShadow = true;
        this.trunkMesh.castShadow = true;

        this.crownMesh = createMesh(createBufferGeometry(),this.crownMaterial2D)
        this.crownMesh.receiveShadow = true;
        this.crownMesh.castShadow = true;

        this.trunkEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.trunkMesh.geometry),
            this.trunkEdgeMaterial,
        );
        this.crownEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.crownMesh.geometry),
            this.crownEdgeMaterial,
        );
        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.trunkMesh);
        this.objectsGroup.add(this.crownMesh);
        this.objectsGroup.add(this.trunkEdges);
        this.objectsGroup.add(this.crownEdges);

        // tree model properties
        const defaultValues = this.getDefaultValues();
        this.trunkBaseHeight = 0;
        this.treeId = defaultValues.treeId;
        this.isProportional = defaultValues.isProportional;
        this.trunkHeight = defaultValues.trunkHeight;
        this.crownHeight = defaultValues.crownHeight;

        // TODO: Add type when adding templates

        // tree measurement
        this.trunkMeasurement = null;
        this.crownMeasurement = null;
        this.polyTrunkMesh = null;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.updateVisualsAfterLoadingAndCreation();
    }

    getScales(number, autoscale) {
        let scale = [];
        /* All the models except birch tree are equal in scale 
           to the default height of tree and birch tree is 0.4 times 
           the noraml height */
        const totalHeight = this.crownHeight + this.trunkHeight;
        const percentChange = (totalHeight - 25) * 4;
        scale[1] = 1 + percentChange / 100;
        if (number === 2)
            scale[1] = 0.4 + percentChange * 0.004;

        // proper scaling
        const percentChangeWidth = (this.crownRadius - 5) * 20;
        scale[0] = 1 + percentChangeWidth / 100;
        if (number === 2)
            scale[0] = 0.4 + percentChangeWidth * 0.004;

        // proportionate scaling
        if (autoscale) {
            scale[0] = scale[1];
            if (number === 2)
                scale[0] = scale[1];
        }
        const modelScales = new THREE.Vector3(scale[0], scale[1], scale[0]);
        return modelScales;
    }
    loadPolyTree(tree) {
        if(tree.polyTrunkMesh) {
            tree.stage.sceneManager.scene.remove(tree.polyTrunkMesh);
        }
        const modelScales = this.getScales(tree.treeId, tree.isProportional);
        const loader = new GLTFLoader();
        const models = [
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/Small+Oak+New.glb',
            },
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/BirchTree+New.glb',
            },
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/low_poly_tree.glb',
            },
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/SmallOakTree.glb',
            },
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/AppleTree.glb',
            },
            {
                url: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/TreeModels/PalmTree.glb',
            },
        ];
      
        if (tree.treeId < 1 || tree.treeId > models.length) {
            return;
        }
      
        const model = models[tree.treeId - 1];
        loader.load(model.url, function (gltf) {

            // All the meshes in the scene will be stored in children variable

            let children = gltf.scene.children[0].children[0].children;
            if(tree.treeId === 5 || tree.treeId === 6) {
                children = gltf.scene.children[0].children;
            }

            for (let i = 0; i < children.length; i++) {
                children[i].castShadow = true;
            }
            
            // Set the polyTrunkMesh properties and add it to the scene
            
            tree.polyTrunkMesh = gltf.scene.children[0];
            tree.polyTrunkMesh.scale.copy(modelScales);

            // Fixing the rotation of models
            if ( tree.treeId === 1 || tree.treeId === 2 ) {
                tree.polyTrunkMesh.rotateX(Math.PI / 2);
            }

            tree.polyTrunkMesh.castShadow = true;
            tree.polyTrunkMesh.position.set(
                tree.outlinePoints[0].getPosition().x + (model.position ? model.position.x : 0),
                tree.outlinePoints[0].getPosition().y + (model.position ? model.position.y : 0),
                tree.trunkBaseHeight,
            );
            tree.stage.sceneManager.scene.add(tree.polyTrunkMesh);
            if (!tree.stage.visualManager.in3D) {
                tree.polyTrunkMesh.visible = false;
            }
        });

        tree.trunkMesh.visible = false;
        tree.crownMesh.visible = false;
        tree.trunkEdges.visible = false;
        tree.crownEdges.visible = false;
    }

    get crownEdgeGeometry() {
        return this.crownEdges.geometry;
    }

    get trunkEdgeGeometry() {
        return this.trunkEdges.geometry;
    }
    getState() {
        const treeData = {
            id: this.id,
            tree: this.treeId,
            isProportional: this.isProportional,
            uuid: this.uuid,
            name: this.name,
            trunkBaseHeight: this.trunkBaseHeight,
            trunkHeight: this.trunkHeight,
            crownHeight: this.crownHeight,
            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return treeData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load tree properties
            this.trunkBaseHeight = state.trunkBaseHeight;
            this.trunkHeight = state.trunkHeight;
            this.crownHeight = state.crownHeight;
            this.treeId = state.treeId,
            this.isProportional = state.isProportional,

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
                this.outlinePoints = state.outlinePoints.map(outlinePoint =>
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage,
                    ));
                this.updateOutlinePointsVisuals(this.getColorMap());

                // create tree measurement
                this.trunkMeasurement = new LengthMeasurement(
                    this.outlinePoints[0], this.outlinePoints[1],
                    this.stage, this, 0,
                );
                this.crownMeasurement = new LengthMeasurement(
                    this.outlinePoints[0], this.outlinePoints[2],
                    this.stage, this, 0,
                );
            }
            else {
                // update outline points
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('Tree: loadState: outlinePoints length don\'t match');
                    return null;
                }
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {
                // update tree measurement
                this.trunkMeasurement.show();
                this.trunkMeasurement.update();
                this.crownMeasurement.show();
                this.crownMeasurement.update();
            }

            // update geometry
            this.updateGeometry();
            if (this.polyTrunkMesh) {
                this.polyTrunkMesh.position.set(
                    this.outlinePoints[0].getPosition().x + (model.position ? model.position.x : 0),
                    this.outlinePoints[0].getPosition().y + (model.position ? model.position.y : 0),
                    this.trunkBaseHeight,
                );
            }
            this.stage.quadTreeManager.handlePlaceObject(this);
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        // remove measurements
        this.trunkMeasurement.remove();
        this.crownMeasurement.remove();
    }

    saveObject(isCopy = false) {
        const treeModelData = {
            type: Tree.getObjectType(),
        };

        // save id and name
        treeModelData.id = this.id;
        treeModelData.name = this.name;
        if (isCopy) {
            treeModelData.uuid = this.uuid;
        }

        // save tree properties
        treeModelData.trunkBaseHeight = this.trunkBaseHeight;
        treeModelData.trunkHeight = this.trunkHeight;
        treeModelData.crownHeight = this.crownHeight;
        treeModelData.treeId = this.treeId;
        treeModelData.isProportional = this.isProportional;

        // saving outline points
        const outlinePoints = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            outlinePoints.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
                this.outlinePoints[i].getPosition().z,
            ]);
        }
        treeModelData.outlinePoints = outlinePoints;

        return treeModelData;
    }

    loadObject(treeModelData, isPaste = false) {
        let shouldBeRemoved = true;

        for (let i = 0, len = treeModelData.outlinePoints.length; i < len; i += 1) {
            if (!(treeModelData.outlinePoints[i][0] === 0 &&
                treeModelData.outlinePoints[i][1] === 0 &&
                treeModelData.outlinePoints[i][2] === 0)) {
                shouldBeRemoved = false;
                break;
            }
        }

        if (shouldBeRemoved) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = treeModelData.id;
            this.name = treeModelData.name;
        }

        // load tree properties
        this.trunkBaseHeight = treeModelData.trunkBaseHeight;
        this.trunkHeight = treeModelData.trunkHeight;
        this.crownHeight = treeModelData.crownHeight;
        this.treeId = treeModelData.treeId ? treeModelData.treeId : this.getDefaultValues().treeId;
        this.isProportional = treeModelData.isProportional ? treeModelData.isProportional: this.getDefaultValues().isProportional;

        // set outline points
        for (let i = 0, len = treeModelData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                treeModelData.outlinePoints[i][0],
                treeModelData.outlinePoints[i][1],
                treeModelData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }
        this.updateOutlinePointsVisuals(this.getColorMap());

        // create tree measurements
        this.trunkMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[1],
            this.stage, this, 0,
        );
        this.crownMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[2],
            this.stage, this, 0,
        );

        // update geometry
        this.updateGeometry();
        const currentURL = window.location.href;
        if (!currentURL.includes('stage-report')) {
            this.loadPolyTree(this);
        }
        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();
        this.trunkMeasurement.remove();
        this.crownMeasurement.remove();

        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        for (let i = 0, len = mirroredData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                mirroredData.outlinePoints[i][0],
                mirroredData.outlinePoints[i][1],
                mirroredData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }
        this.updateOutlinePointsVisuals(this.getColorMap());

        this.trunkMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[1],
            this.stage, this, 0,
        );
        this.crownMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[2],
            this.stage, this, 0,
        );
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

    exportAsSTL() {
        const { trunkMesh, crownMesh } = this;
        trunkMesh.updateMatrix();
        crownMesh.updateMatrix();
        const trunkGeometry = trunkMesh.geometry.clone();
        const crownGeometry = crownMesh.geometry.clone().toNonIndexed();
        let allGeometries = [];

        // add object if it is valid
        if (trunkGeometry.attributes.position.count > 0) {
            allGeometries.push(trunkGeometry);
        }
        if (crownGeometry.attributes.position.count > 0) {
            allGeometries.push(crownGeometry);
        }


        const singleGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);

        const mesh = new THREE.Mesh(singleGeometry, new THREE.MeshBasicMaterial());

        return [{
            mesh,
            name: this.name,
        }];
    }

    exportAsCollada() {
        const { trunkMesh, crownMesh } = this;
        trunkMesh.updateMatrix();
        crownMesh.updateMatrix();
        const trunkGeometry = trunkMesh.geometry.clone();
        const crownGeometry = crownMesh.geometry.clone().toNonIndexed();
        let allGeometries = [];

        // add object if it is valid
        if (trunkGeometry.attributes.position.count > 0) {
            allGeometries.push(trunkGeometry);
        }
        if (crownGeometry.attributes.position.count > 0) {
            allGeometries.push(crownGeometry);
        }


        const singleGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);

        const mesh = new THREE.Mesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color:
                    COLOR_MAPPINGS.TREE[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                        .CROWN_MESH_COLOR,
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

    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    async onComplete(geometry) {
        const notificationObject = this.stage.eventManager.setTreeCreating();

        // getting vertices from buffer geometry
        const vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i += 1) {
            vertices.push(new THREE.Vector3(
                geometry.attributes.position.array[i * 3],
                geometry.attributes.position.array[(i * 3) + 1],
                geometry.attributes.position.array[(i * 3) + 2],
            ));
        }

        // set outline points
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
                this,
                this.stage,
            ));
        }

        // create Tree measurement
        this.trunkMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[1],
            this.stage, this, 0,
        );
        this.crownMeasurement = new LengthMeasurement(
            this.outlinePoints[0], this.outlinePoints[2],
            this.stage, this, 0,
        );

        try {
            await this.placeObject();
            this.loadPolyTree(this);
            this.crownEdges.visible = true;
            this.trunkEdges.visible = true;
            this.updateOutlinePointsVisuals(this.getColorMap());
            this.stage.eventManager.completeTreeCreation(notificationObject);
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Tree: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorTreeCreation(notificationObject);
            return Promise.reject(error);
        }
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }
        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    updateGeometry() {
        const trunkVertices = this.get2DTrunkVertices();
        const trunkVertices2DVectorArray = utils.convertArrayToVector(trunkVertices);

        // create core
        const trunkShape = new THREE.Shape(trunkVertices2DVectorArray);
        const trunkGeometry = new THREE.ExtrudeGeometry(
            trunkShape,
            {
                depth: this.trunkHeight,
                bevelEnabled: false,
            },
        );
        trunkGeometry.translate(0, 0, this.trunkBaseHeight);

        const crownGeometry = new THREE.SphereGeometry(
            this.crownRadius,
            TREE_SEGMENTS / 2,
            TREE_SEGMENTS / 2,
        );

        // Creating Edge Geometries
        const crownEdgeGeometry = new THREE.CircleGeometry(
            this.crownRadius,
            TREE_SEGMENTS,
        );
        const trunkEdgeGeometry = new THREE.CircleGeometry(
            this.trunkRadius,
            TREE_SEGMENTS,
        );

        // for ellipsoidal shape.
        const mergeFactor = 0.1 * (this.crownHeight / 2);
        const heightScaling = ((this.crownHeight / 2) + mergeFactor) / this.crownRadius;
        crownGeometry.applyMatrix4(new THREE.Matrix4().makeScale(
            1.0,
            1.0,
            heightScaling,
        ));
        crownGeometry.translate(
            this.outlinePoints[0].getPosition().x,
            this.outlinePoints[0].getPosition().y,
            (this.trunkBaseHeight + this.trunkHeight + (this.crownHeight / 2)) - mergeFactor,
        );
        crownEdgeGeometry.translate(
            this.outlinePoints[0].getPosition().x,
            this.outlinePoints[0].getPosition().y,
            (this.trunkBaseHeight + this.trunkHeight + (this.crownHeight / 2)) - mergeFactor,
        );
        trunkEdgeGeometry.translate(
            this.outlinePoints[0].getPosition().x,
            this.outlinePoints[0].getPosition().y,
            this.trunkBaseHeight + this.trunkHeight + this.crownHeight,
        );

        if (this.stage.selectionControls.getSelectedObjects().includes(this)) {
            this.showMeasurement();
        }

        // updating outline points height
        const outlinePointHeightConstant =
            this.trunkBaseHeight + this.trunkHeight + this.crownHeight + mergeFactor;

        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(
                0,
                0,
                outlinePointHeightConstant - this.outlinePoints[i].getPosition().z,
            );
        }

        // update if bottom or top surface is tilted
        if ((this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel)
            && (this.getParent().getTilt() !== 0)) {
            // get tilt and azimuth of parent model
            let parentTilt = 0;
            let parentAzimuth = 180;
            if (this.getParent() instanceof PolygonModel ||
                this.getParent() instanceof CylinderModel) {
                parentTilt = this.getParent().getTilt();
                parentAzimuth = this.getParent().getAzimuth();
            }

            // get height difference between top and bottom surface
            const a1 =
                Math.sin((parentTilt * Math.PI) / 180) * Math.sin((parentAzimuth * Math.PI) / 180);
            const b1 =
                Math.sin((parentTilt * Math.PI) / 180) * Math.cos((parentAzimuth * Math.PI) / 180);
            const c1 = Math.cos((parentTilt * Math.PI) / 180);

            const a2 =
                Math.sin((this.tilt * Math.PI) / 180) * Math.sin((this.azimuth * Math.PI) / 180);
            const b2 =
                Math.sin((this.tilt * Math.PI) / 180) * Math.cos((this.azimuth * Math.PI) / 180);
            const c2 = Math.cos((this.tilt * Math.PI) / 180);

            let minZOnTop = +Infinity;
            let minHeightDiff = +Infinity;
            let placingPoint = null;
            for (let i = 0; i < this.numVertices; i += 1) {
                const v = trunkGeometry.vertices[i];
                // rounding off to 3 decimal (1mm precision)
                const heightDiff =
                    Math.round((((-1 * ((a2 * v.x) + (b2 * v.y))) / c2)
                        - ((-1 * ((a1 * v.x) + (b1 * v.y))) / c1)) * 1000) / 1000;

                if (heightDiff < minHeightDiff) {
                    const z = this.getParent().getZOnTopSurface(v.x, v.y);
                    if (z <= minZOnTop) {
                        minZOnTop = z;
                    }
                    minHeightDiff = heightDiff;
                    placingPoint = v.clone();
                }
                else if (heightDiff === minHeightDiff) {
                    const z = this.getParent().getZOnTopSurface(v.x, v.y);
                    if (z <= minZOnTop) {
                        minZOnTop = z;
                        placingPoint = v.clone();
                    }
                }
            }

            if (this.getParent() instanceof CylinderModel ||
                this.getParent() instanceof PolygonModel) {
                placingPoint.z = this.getParent().getZOnTopSurface(placingPoint.x, placingPoint.y);
            }
            else {
                placingPoint.z = this.trunkBaseHeight;
            }

            // update all vertices of bottom surface with reference to the placing point
            const d1 =
                (-1 * ((a1 * placingPoint.x) + (b1 * placingPoint.y) + (c1 * placingPoint.z)));

            for (let i = 0; i < this.numVertices; i += 1) {
                const v = trunkGeometry.vertices[i];
                v.z = (-1 * ((a1 * v.x) + (b1 * v.y) + d1)) / c1;
            }

            // update all vertices of top surface with reference to placing pt. and trunk height
            const d2 = (-1 * ((a2 * placingPoint.x) +
                (b2 * placingPoint.y) +
                (c2 * (placingPoint.z + this.trunkHeight))));

            for (let i = 0; i < this.numVertices; i += 1) {
                const v = trunkGeometry.vertices[this.numVertices + i];
                v.z = (-1 * ((a2 * v.x) + (b2 * v.y) + d2)) / c2;
            }

            // update base height (defined as the lowest z of top surface minus core height)
            let minZOnTopSurface = +Infinity;
            for (let i = 0; i < this.numVertices; i += 1) {
                if (trunkGeometry.vertices[this.numVertices + i].z < minZOnTopSurface) {
                    minZOnTopSurface = trunkGeometry.vertices[this.numVertices + i].z;
                }
            }
            this.trunkBaseHeight = minZOnTopSurface - this.trunkHeight;
        }

        // updating meshes and edges
        this.trunkMesh.geometry = trunkGeometry;
        this.trunkEdges.geometry = new THREE.EdgesGeometry(trunkEdgeGeometry);
        this.crownMesh.geometry = crownGeometry;
        this.crownEdges.geometry = new THREE.EdgesGeometry(crownEdgeGeometry);

        // update measurement
        this.trunkMeasurement.update();
        this.crownMeasurement.update();
        if (this.polyTrunkMesh) {
            this.polyTrunkMesh.scale.copy(this.getScales(this.treeId, this.isProportional));
        }
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.trunkBaseHeight += deltaZ;

        // update all meshes and edges
        this.trunkMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.trunkEdges.geometry.translate(deltaX, deltaY, deltaZ);
        this.crownMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.crownEdges.geometry.translate(deltaX, deltaY, deltaZ);

        // update outline points without consequences
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        this.trunkMeasurement.update();
        this.crownMeasurement.update();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        if(this.polyTrunkMesh) {
            this.polyTrunkMesh.position.set(
                this.outlinePoints[0].getPosition().x + (model.position ? model.position.x : 0),
                this.outlinePoints[0].getPosition().y + (model.position ? model.position.y : 0),
                this.trunkBaseHeight,
            );
        }

        this.saveState();
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

        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }

    // Placing Function
    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setTreeOutOfGroundRemoved();
            }
            this.removeObject();
            return Promise.reject(error);
        }
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);

        // really?
        this.trunkBaseHeight = newHeight;
        this.updateGeometry();

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        try {
            await this.handleSiblingConsequences();
            // remove object from hover manager and add it again
            this.stage.quadTreeManager.handlePlaceObject(this);

            this.resetGrandParentSolarAccess();

            // Saving state after the object is placed
            this.saveState();
        }
        catch (error) {
            console.error('ERROR: Tree: placeObject failed', error);
            return Promise.reject(error);
        }

        return Promise.resolve(true);
    }

    removeObject(isTemporaryDuplicate = false) {
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

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // remove measurements
        this.trunkMeasurement.remove();
        this.crownMeasurement.remove();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        // from base object
        this.removeDimensions();

        // remove object from hover manager
        this.stage.quadTreeManager.removeObject(this);

        //when duplicates are updated in run time they remove the extra models so selecting ground during runtime ,
        //merges the scene hence entire scene moves. the istemporaryduplicate is set false as soon the duplicates are placed in duplicate manager.
        if(!isTemporaryDuplicate){
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }    
    }

    handleDragStart() {
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        const notificationObject = this.stage.eventManager.setTreeLoading();
        try {
            await this.placeObject();
            this.stage.eventManager.completeTreeLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR Tree: handleDragEnd failed', error);
            this.stage.eventManager.completeTreeLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Tree: vertex not in outlinePoints in handleVertexDragStart');
        }
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Tree: vertex not in outlinePoints in handleVertexMove');
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Tree: vertex not in outlinePoints in handleVertexMove');
        }

        const notificationObject = this.stage.eventManager.setTreeLoading();

        try {
            await this.placeObject();
            if (vertex === this.trunkMeasurement.vertexObj1 ||
                vertex === this.trunkMeasurement.vertexObj2) {
                this.trunkMeasurement.setMovableVertex(vertex);
            }
            else {
                this.crownMeasurement.setMovableVertex(vertex);
            }

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            this.stage.eventManager.setObjectsSelected(this);
            this.stage.eventManager.completeTreeLoading(notificationObject);
            this.saveState();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR Tree: handleVertexPlace failed', error);
            this.stage.eventManager.completeTreeLoading(notificationObject);
            throw error;
        }
    }

    getPlacingInformation(drawingVertices) {
        let parentExists = true;

        const response = {};
        response.pointUnplaceableError = null;
        response.errors = [];

        // Getting vertices
        const vertices2DArray = this.get2DVertices(drawingVertices);
        const crownVertices = drawingVertices === undefined || null ?
            this.get2DCrownVertices() : vertices2DArray;
        let trunkVertices2DArray = null;

        if (!raycastingUtils.areVerticesOnGround(crownVertices, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        if (vertices2DArray.length < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }
        // Refactor this
        if (drawingVertices !== null && drawingVertices !== undefined) {
            if (drawingVertices.length === MINIMUM_NUMBER_OF_POINTS) {
                const vectorVertices = utils.convertArrayToVector(drawingVertices);
                const trunkRadius = vectorVertices[0].distanceTo(vectorVertices[1]);
                const crownRadius = vectorVertices[0].distanceTo(vectorVertices[2]);

                const cloneDrawingVertices = [...drawingVertices];
                cloneDrawingVertices.pop();
                trunkVertices2DArray = this.get2DVertices(cloneDrawingVertices);
                if (crownRadius <= trunkRadius) {
                    const error = new Error(TREE_WITH_SMALL_CROWN_ERROR);
                    response.errors.push(error);
                    response.pointUnplaceableError = error;
                    parentExists = false;
                }
            }
        }
        else if (this.crownRadius <= this.trunkRadius) {
            const error = new Error(TREE_WITH_SMALL_CROWN_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }

        if (parentExists) {
            // using raycaster to get the top most model in new place
            // and get height of it for deltaZ
            // but ignoring this model or its child as we don't want to place over them
            const idsToIgnore = [this.uuid];
            let erodedVertices;
            // To accommodate for snapping
            if (trunkVertices2DArray !== null) {
                erodedVertices = utils.setbackPolygon(
                    trunkVertices2DArray,
                    -0.001,
                );
            }
            else {
                erodedVertices = utils.setbackPolygon(
                    vertices2DArray,
                    -0.001,
                );
            }

            if (erodedVertices.length !== 0) {
                const allBelowModels =
                    raycastingUtils.getAllModelsBelowVertices(erodedVertices, this.stage);
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
            }
            else {
                response.errors.push(new Error(TREE_WITH_NO_AREA_ERROR));
            }
        }
        return response;
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getEdges() {
        const vertices = utils.convertArrayToVector(this.get2DCrownVertices());
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

    // Visual Functions
    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.TREE;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    // override this function for trees
    switchMaterialState(newMaterialState, recursive) {
        if (recursive) {
            for (let i = 0; i < this.children.length; i += 1) {
                this.children[i].switchMaterialState(newMaterialState, recursive);
            }
        }
        if (this.stage.visualManager.in3D) {
            this.materialState = MATERIAL_STATES.SOLID;
            this.updateVisualsBasedOnStates();
        }
        else if (this.materialState !== newMaterialState) {
            this.materialState = newMaterialState;
            this.updateVisualsBasedOnStates();
        }
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.trunkMesh.castShadow = true;
            if (this.trunkMesh.material !== this.trunkMaterial3D) {
                this.trunkMesh.material = this.trunkMaterial3D;
                this.trunkEdges.visible = false;
            }
            this.crownMesh.castShadow = true;
            if (this.crownMesh.material !== this.crownMaterial3D) {
                this.crownMesh.material = this.crownMaterial3D;
                this.crownEdges.visible = false;
            }
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.trunkMesh.castShadow = false;
            if (this.trunkMesh.material !== this.trunkMaterial2D) {
                this.trunkMesh.material = this.trunkMaterial2D;
                this.trunkEdges.material = this.trunkEdgeMaterial;
                this.trunkEdges.visible = true;
            }
            this.crownMesh.castShadow = false;
            if (this.crownMesh.material !== this.crownMaterial2D) {
                this.crownMesh.material = this.crownMaterial2D;
                this.crownEdges.material = this.crownEdgeMaterial;
                this.crownEdges.visible = true;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.TRUNK_MESH_COLOR, this.trunkMesh);
        visualUtils.updateMeshWithColor(newColors.TRUNK_EDGE_COLOR, this.trunkEdges);
        visualUtils.updateMeshWithColor(newColors.CROWN_MESH_COLOR, this.crownMesh);
        visualUtils.updateMeshWithColor(newColors.CROWN_EDGE_COLOR, this.crownEdges);

        this.updateOutlinePointsVisuals(newColors);
    }

    // override this function for trees
    updateOutlinePointsVisuals(color) {
        if (color !== null && color !== undefined &&
            this.outlinePoints !== null && this.outlinePoints !== undefined &&
            this.outlinePoints.length > 0 && this.outlinePoints[0].getColor() !== color) {
            this.outlinePoints[0].updateColor(color.TRUNK_EDGE_COLOR);
            this.outlinePoints[1].updateColor(color.TRUNK_EDGE_COLOR);
            this.outlinePoints[2].updateColor(color.CROWN_EDGE_COLOR);
        }
    }

    // consequences Functions
    async handleSiblingConsequences() {
        const allPromises = [];

        const siblings = this.getParent().getChildren();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray) {
                sibling.deleteTableInsideArea(this.get2DVertices());
            }
            else if (sibling instanceof Walkway) {
                const placingPolygon =
                    JSTSConverter.verticesToJSTSPolygon(this.get2DTrunkVertices());
                const siblingPolygon = JSTSConverter.verticesToJSTSPolygon(sibling.get2DVertices());
                const intersectingPolygon = placingPolygon.intersection(siblingPolygon);
                if (intersectingPolygon.getArea() > 0) {
                    allPromises.push(sibling.placeObject());
                }
            }
        }

        try {
            await Promise.all(allPromises);
        }
        catch (error) {
            console.error('ERROR: Tree: handleSiblingConsequences failed', error);
        }
        return Promise.resolve(true);
    }

    // updateObject Functions
    async updateObject(properties) {
        this.name = _.get(properties, 'name', this.name);

        if (properties.trunkHeight && properties.trunkHeight !== this.trunkHeight) {
            this.changeTrunkHeight(properties.trunkHeight);
        }

        if (properties.crownHeight && properties.crownHeight !== this.crownHeight) {
            this.changeCrownHeight(properties.crownHeight);
        }

        if (properties.treeId && properties.treeId !== this.treeId) {
            this.treeId = properties.treeId;
            // dispose old mesh and geometry
            // load tree 3d model
            this.loadPolyTree(this);
            this.crownEdges.visible = true;
            this.trunkEdges.visible = true;
        }
        
        if (properties.isProportional !== this.isProportional) {
            this.isProportional = properties.isProportional;
            // dispose old mesh and geometry
            // load tree 3d model
            if (this.polyTrunkMesh) {
                this.polyTrunkMesh.scale.copy(this.getScales(this.treeId, this.isProportional));
            }
            else {
                this.loadPolyTree(this);
            }
        }

        this.saveState();

        return true;
    }

    changeTrunkHeight(trunkHeight) {
        this.trunkHeight = trunkHeight;

        this.updateGeometry();

        this.resetGrandParentSolarAccess();

        // try {
        //     await this.handleSiblingConsequences();
        //     return true;
        // }
        // catch (error) {
        //     console.error('Tree: changeTrunkHeight: Updating siblings failed', error);
        //     throw error;
        // }
    }

    changeCrownHeight(crownHeight) {
        this.crownHeight = crownHeight;

        this.updateGeometry();

        this.resetGrandParentSolarAccess();

        // try {
        //     await this.handleSiblingConsequences();
        //     return true;
        // }
        // catch (error) {
        //     console.error('Tree: changeCrownHeight: Updating siblings failed', error);
        //     throw error;
        // }
    }

    // temp Func

    handleOnCancel() {
        // to avoid errors while deselecting length measurement text object
    }

    getDefaultValues() {
        const designSettings = this.stage.getDesignSettings();
        return {
            treeId: designSettings.drawing_defaults.tree.treeId,
            isProportional: designSettings.drawing_defaults.tree.isProportional,
            trunkHeight: designSettings.drawing_defaults.tree.trunkHeight,
            crownHeight: designSettings.drawing_defaults.tree.crownHeight,
        };
    }

    changePropertiesDuringCreation(properties) {
        this.name = _.get(properties, 'name', this.name);
        this.trunkHeight = _.get(properties, 'trunkHeight', this.trunkHeight);
        this.crownHeight = _.get(properties, 'crownHeight', this.crownHeight);
    }

    // get3DVertices, getTopHeight, getBaseHeight implementation
    get2DOutlineVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const position = this.outlinePoints[i].getPosition();
            vertices.push([
                position.x,
                position.y,
            ]);
        }
        return vertices;
    }

    isIgnored() {
        return this.ignored;
    }

    get ignored() {
        return false;
    }

    get placable() {
        return false;
    }

    get numVertices() {
        return TREE_SEGMENTS;
    }

    get tilt() {
        return 0;
    }

    get azimuth() {
        return 180;
    }

    get trunkRadius() {
        // instead of making this getter we can set it up on update and store it as a variable.
        const vertices2DArray = this.get2DOutlineVertices();
        const trunkPoints = utils.convertArrayToVector(vertices2DArray);
        return trunkPoints[0].distanceTo(trunkPoints[1]);
    }

    get crownRadius() {
        // instead of making this getter we can set it up on update and store it as a variable.
        const vertices2DArray = this.get2DOutlineVertices();
        const trunkPoints = utils.convertArrayToVector(vertices2DArray);
        return trunkPoints[0].distanceTo(trunkPoints[2]);
    }

    get treeHeight() {
        return this.trunkHeight + this.crownHeight;
    }

    getHighestZ() {
        let highestZ = 0;
        const vertices = this.convertPositionArrayToVector(this.trunkMesh.geometry.getAttribute("position").array)
        for (let i = this.numVertices; i < 2 * this.numVertices; i += 1) {
            highestZ = Math.max(highestZ, vertices[i].z);
        }
        return highestZ + this.crownHeight;
    }

    convertPositionArrayToVector(array) { 
        let converted = [];
        for(let i = 0; i < array.length; i += 3) {
           converted.push(new THREE.Vector3(array[i], array[i+1], array[i+2])) 
        }
        return converted
    }

    get3DVertices(
        trunkGeometry = null,
        { approximate } = { approximate: false },
        { roofMapExport } = { roofMapExport: false },
    ) {
        let vertices;
        if (trunkGeometry === null) {
            ( vertices = this.convertPositionArrayToVector(this.trunkMesh.geometry.getAttribute("position").array));
        }
        else {
            ( vertices = this.convertPositionArrayToVector(trunkGeometry.getAttribute("position").array));
        }

        // returns the tilted circle vertices in the 3d orientation
        const circleVertices = [];
        const increment = approximate ? TREE_SEGMENTS / 8 : 1;
        if (!roofMapExport) {
            // For Panel Placement
            for (let i = 0; i < this.numVertices; i += increment) {
                const v = vertices[this.numVertices + i].clone();
                circleVertices.push([
                    v.x,
                    v.y,
                    v.z,
                ]);
            }
        }
        else {
            // For Roof Map Exports, HeatMap Generation.
            const centerPoint = this.outlinePoints[0].getPosition();
            const { crownRadius } = this;
            // returns the circle vertices parallel to the xy plane
            for (let i = 0; i < this.numVertices; i += increment) {
                const theta = ((i % this.numVertices) / this.numVertices) * Math.PI * 2;
                circleVertices.push([
                    centerPoint.x + (Math.cos(theta) * crownRadius),
                    centerPoint.y + (Math.sin(theta) * crownRadius),
                    this.treeHeight,
                ]);
            }
        }
        return circleVertices;
    }

    get2DTrunkVertices() {
        const centerPoint = this.outlinePoints[0].getPosition();
        const { trunkRadius } = this;
        // returns the circle vertices parallel to the xy plane
        const trunkVertices = [];
        for (let i = 0; i < this.numVertices; i += 1) {
            const theta = ((i % this.numVertices) / this.numVertices) * Math.PI * 2;
            trunkVertices.push([
                centerPoint.x + (Math.cos(theta) * trunkRadius),
                centerPoint.y + (Math.sin(theta) * trunkRadius),
            ]);
        }
        return trunkVertices;
    }

    get2DCrownVertices() {
        const centerPoint = this.outlinePoints[0].getPosition();
        const { crownRadius } = this;
        // returns the circle vertices parallel to the xy plane
        const crownVertices = [];
        for (let i = 0; i < this.numVertices; i += 1) {
            const theta = ((i % this.numVertices) / this.numVertices) * Math.PI * 2;
            crownVertices.push([
                centerPoint.x + (Math.cos(theta) * crownRadius),
                centerPoint.y + (Math.sin(theta) * crownRadius),
            ]);
        }
        return crownVertices;
    }

    get2DVertices(drawingVertices) {
        let centerPoint;
        let radius;
        // returns the circle vertices parallel to the xy plane
        const trunkVertices = [];
        if (drawingVertices === null || drawingVertices === undefined) {
            // return trunk 2D points for placement
            centerPoint = this.outlinePoints[0].getPosition();
            radius = this.trunkRadius;
        }
        else if (drawingVertices.length <= 1) {
            return utils.convertArrayToVector(drawingVertices);
        }
        else if (drawingVertices.length === 2) {
            const vectorVertices = utils.convertArrayToVector(drawingVertices);
            radius = vectorVertices[0].distanceTo(vectorVertices[1]);
            [centerPoint] = vectorVertices;
        }
        else if (drawingVertices.length === 3) {
            const vectorVertices = utils.convertArrayToVector(drawingVertices);
            radius = vectorVertices[0].distanceTo(vectorVertices[2]);
            [centerPoint] = vectorVertices;
        }
        for (let i = 0; i < this.numVertices; i += 1) {
            const theta = ((i % this.numVertices) / this.numVertices) * Math.PI * 2;
            trunkVertices.push([
                centerPoint.x + (Math.cos(theta) * radius),
                centerPoint.y + (Math.sin(theta) * radius),
            ]);
        }

        return trunkVertices;
    }

    onSelect() {
        // show outline points
        if (this.visualState === 'sun-simulation') {
            this.crownMesh.visible = true;
        }
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }

        // show measurements
        this.trunkMeasurement.show();
        this.trunkMeasurement.update();

        this.crownMeasurement.show();
        this.crownMeasurement.update();

        // adding moveObject on Tree move and placeObject when it is done
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        // adding resize on radial outlinePoint only of Tree when it is done
        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 1, len = this.outlinePoints.length; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
        }
    }

    deSelect() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }

        // hide measurements
        this.trunkMeasurement.hide();
        this.crownMeasurement.hide();
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
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

    getPosition() {
        // get center outline point, which is at 0th idx.
        return this.outlinePoints[0].getPosition();
    }

    showMeasurement() {
        this.trunkMeasurement.show();
        this.trunkMeasurement.update();
        this.crownMeasurement.show();
        this.crownMeasurement.update();
    }

    hideMeasurement() {
        this.trunkMeasurement.hide();
        this.crownMeasurement.hide();
    }

    static getObjectType() {
        return 'Tree';
    }
}

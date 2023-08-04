import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import {
    COMPLEX_GEOMETRY_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    VERTEX_EQUIVALENT_ERROR,
    PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    INVALID_CORE_HEIGHT_ERROR,
    INVALID_TILT_ERROR,
    INVALID_TOP_HEIGHT_ERROR,
    TILT_LOCKED,
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
    SUBARRAY_RACK_STYLE_EWRACKING,
} from '../../coreConstants';
import { verticesFromJSTSPolygon, verticesToJSTSPolygon } from '../../utils/JSTSConverter';
import * as raycastingUtils from '../../utils/raycastingUtils';
import * as utils from '../../utils/utils';
import * as modelUtils from './modelUtils';
import BaseObject from '../BaseObject';
import Gazebo from '../../lib/PowerGazebo'; // inheritance issue
import Subarray from '../subArray/Subarray';
import OutlinePoints from '../subObjects/OutlinePoints';
import RotationPoint from '../subObjects/RotationPoint';
import EdgeCentrePoints from '../subObjects/EdgeCentrePoints';
import PolygonMeasurement from '../subObjects/PolygonMeasurement';
import CylinderModel from './CylinderModel';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../visualConstants';
import Walkway from './Walkway';
import SafetyLine from './SafetyLine';
import Handrail from './Handrail';
import * as visualUtils from '../../utils/visualUtils';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import Tree from './Tree';
import Inverter from '../ac/Inverter';
import DCDB from '../ac/DCDB';
import ACDB from '../ac/ACDB';
import Conduit from '../ac/conduits/Conduit';
import DoubleConduit from '../ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../ac/cableTrays/DoubleSeparateCableTray';
import { mirrorObjectData } from '../../utils/mirrorUtils';
import SmartroofFace from './smartroof/SmartroofFace';
import AcCable from './cable/AcCable';
import DcCable from './cable/DcCable';
import { getModels, getAllModelType } from '../../utils/exporters';
import CombinerBox from '../ac/CombinerBox';
import { SmartroofModel } from './smartroof/SmartroofModel';
import Dormer from './smartroof/Dormer';
import RectangleObstruction from './Rectangle';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import NikGeometry from '../ground/NikGeometry';
import EastWestRack from '../../lib/EastWestRacking';

const MINIMUM_NUMBER_OF_POINTS = 3;

export default class PolygonModel extends BaseObject {
    constructor(stage, isObstructionType = false) {
        super(stage);

        // standard norms
        this.stage = stage;
        this.isRotationAllowed = true;
        this.id = this.stage.getModelId();
        this.name = `Model #${this.id.toString()}`;
        this.isObstruction = isObstructionType;
        this.objectsGroup = new THREE.Group();
        this.debugGroup = new THREE.Group();
        this.stage.sceneManager.scene.add(this.debugGroup);
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // materials
        // Translucent materials
        this.translucentMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.translucenthMaterial2DParapet = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.translucentEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this.translucentParapetEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // Solid Material-- used when sun simulation is on or in 3d
        this.solidMaterial = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.solidMaterial.defines = this.solidMaterial.defines || {};
        this.solidMaterial.defines.CUSTOM = '';
        this.parapetSolidMeshMaterial = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.parapetSolidMeshMaterial.defines = this.parapetSolidMeshMaterial.defines || {};
        this.parapetSolidMeshMaterial.defines.CUSTOM = '';
        this.edgesolidMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        const imageUrl = this.stage.getGroundImage().url;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "Anonymous";
        this.imgTexture = textureLoader.load(imageUrl);

        this.roofTextureGeometry = createBufferGeometry();
        this.roofTextureMesh = createMesh(createBufferGeometry(), this.translucentMaterial2D);

        // setback material
        this.setbackMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .SETBACK_COLOR,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        // list of outline points
        this.outlinePoints = [];
        this.edgeCentrePoints = [];

        this.rotationPoints = null;

        // meshes and edges
        this.coreMesh = createMesh(createBufferGeometry(), this.translucentMaterial2D);
        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this.translucentEdgeMaterial2D,
        );
        this.parapetMesh = createMesh(createBufferGeometry(), this.translucenthMaterial2DParapet);
        this.parapetEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.parapetMesh.geometry),
            this.translucentParapetEdgeMaterial2D,
        );
        this.setbackInsideMesh = createMesh(createBufferGeometry(), this.setbackMaterial2D);
        this.setbackOutsideMesh = createMesh(createBufferGeometry(), this.setbackMaterial2D);

        this.setbackInsideMesh.visible = false;
        this.setbackOutsideMesh.visible = false;

        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;
        this.parapetMesh.castShadow = true;
        this.parapetMesh.receiveShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);
        this.objectsGroup.add(this.parapetMesh);
        this.objectsGroup.add(this.parapetEdges);
        this.objectsGroup.add(this.setbackInsideMesh);
        this.objectsGroup.add(this.setbackOutsideMesh);

        // polygon model properties
        const defaultValues = this.getDefaultValues();
        this.baseHeight = 0;
        this.coreHeight = defaultValues.coreHeight;
        this.parapetHeight = defaultValues.parapetHeight;
        this.parapetThickness = defaultValues.parapetThickness;
        this.tilt = defaultValues.tilt;
        this.azimuth = defaultValues.azimuth;
        this.setbackInside = defaultValues.setbackInside;
        this.setbackOutside = defaultValues.setbackOutside;
        this.ignored = defaultValues.ignored;
        this.placable = defaultValues.placable;
        this.topHeight = defaultValues.topHeight;
        this.lockedParameter = defaultValues.lockedParameter;
        this.obstruction = defaultValues.obstruction;

        // polygon measurement
        this.polygonMeasurement = null;

        this.isSelected = false;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.previousIntersectingCableConduit = [];

        this.updateVisualsAfterLoadingAndCreation();

        this.previousHeight = null;
        this.currentHeight = null;
    }

    updateMapTexture() {
        // Get image dimension to calculate offset and scale between 0 to 1
        const imgWidth = this.stage.getImageDimensions().width;
        const imgHeight = this.stage.getImageDimensions().height;

        const { groundImage } = this.stage.ground;
        groundImage.getDimensions().then(({ width, height }) => {
            const scale = groundImage.getScale();
            const lengthMeters = imgWidth;
            const pixelPerMeter = Math.max(width, height) / (lengthMeters * scale);
            const metersPerPixel = 1 / pixelPerMeter;
            const imageHeightMeters = height * metersPerPixel;
            const imageWidthMeters = width * metersPerPixel;


            // Calculate Scale/Zoom
            const scalex = imgWidth / imageWidthMeters;
            const scaley = imgHeight / imageHeightMeters;

            // Calculate offset and associate it with scale
            const offSet = new THREE.Vector2(
                ((-this.stage.getGroundImage().offset[0]) / imageWidthMeters),
                ((-this.stage.getGroundImage().offset[1]) / imageHeightMeters),
            );

            // set scale on center,texture and offset
            if (scalex && scaley && offSet.x && offSet.y) {
                this.imgTexture.center = new THREE.Vector2(0.5, 0.5);
                this.imgTexture.repeat.x = scalex;
                this.imgTexture.repeat.y = scaley;
                this.imgTexture.offset = offSet;
            }
        });
        // Rotation of Texture [PS: Roataion not implemented due to difference in offset]
        // let rotaionAngle = -utils.deg2Rad(this.stage.groundImage.rotation);
        // this.imgTexture.rotation = rotaionAngle;
    }

    hideSelectables() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
        this.setbackOutsideMesh.visible = false;
        this.setbackInsideMesh.visible = false;
        this.rotationPoints.hideObject();
    }

    showSelectables() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].showObject();
        }
        this.setbackOutsideMesh.visible = true;
        this.setbackInsideMesh.visible = true;
        this.rotationPoints.showObject();
    }

    changeColorOnSelect() {
        this.solidMaterial.emissive.setHex(0x00f0f0);
    }
    changeColorDeSelect() {
        this.solidMaterial.emissive.setHex(0x000000);
    }

    addMapTexture() {
        this.removeRoofTexture();
        this.updateMapTexture();
        let faceVertices = this.get3DVertices();
        let points = [];
        faceVertices.forEach(vertex => {
            points.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2] + 0.002));
        });
        // triangulateShape for bufffer Geometry
        let pointsforGeom = [];
        let triangles = THREE.ShapeUtils.triangulateShape(points, []);
        for (let i = 0; i < triangles.length; i++) {
            for(let j = 0; j < 3; j++){
                pointsforGeom.push(points[triangles[i][j]].x);
                pointsforGeom.push(points[triangles[i][j]].y);
                pointsforGeom.push(points[triangles[i][j]].z);
            }
        }

        let geometry = createBufferGeometry();
        geometry.setAttribute('position',new THREE.BufferAttribute( new Float32Array( pointsforGeom),3));

        // get model geometry and calcuate face uvs
        this.coreMesh.geometry.computeBoundingBox();
        utils.computeUVs(geometry,this.stage.ground.plane.geometry);
        this.roofTextureGeometry = geometry;
        
        let planeMat = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
            .GROUND[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
            map: this.heatMapEnabled ? this.heatMapTexture : this.imgTexture,
            transparent: this.heatMapEnabled,
        });
        planeMat.defines = planeMat.defines || {};
        planeMat.defines.CUSTOM = "";
        let mesh = new THREE.Mesh(geometry, planeMat);
        // if (this.stage.visualManager.getIn3D()) {
        //     mesh.rotation.x = Math.PI + (Math.PI / 2);
        // }
        mesh.receiveShadow = true;
        this.roofTextureMesh = mesh;

        //update self and children
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

    hideRoofTextureWithoutTilt() {
        if (this.tilt === 0) {
            this.roofTextureMesh.visible = false;
        }
        let children = this.getChildren();
        children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel || modelObj instanceof SmartroofFace) {
                modelObj.hideRoofTexture();
            } else if (modelObj instanceof PolygonModel) {
                modelObj.hideRoofTextureWithoutTilt();
            }
        });
    }


    getState() {
        const polygonData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            coreHeight: this.coreHeight,
            parapetHeight: this.parapetHeight,
            parapetThickness: this.parapetThickness,
            tilt: this.tilt,
            lockedParameter: this.lockedParameter,
            topHeight: this.topHeight,
            azimuth: this.azimuth,
            setbackInside: this.setbackInside,
            setbackOutside: this.setbackOutside,
            ignored: this.ignored,
            placable: this.placable,
            rotationPoints: this.rotationPoints,
            obstruction: this.obstruction,
            isRotationAllowed: this.isRotationAllowed,
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
            this.parapetHeight = state.parapetHeight;
            this.parapetThickness = state.parapetThickness;
            this.tilt = state.tilt;
            this.lockedParameter = state.lockedParameter;
            this.topHeight = state.topHeight;
            this.azimuth = state.azimuth;
            this.setbackInside = state.setbackInside;
            this.setbackOutside = state.setbackOutside;
            this.ignored = state.ignored;
            this.placable = state.placable;
            this.obstruction = state.obstruction;
            this.isRotationAllowed = state.isRotationAllowed;
            // this.rotationPoints = state

            this.updateVisualsAfterLoadingAndCreation();

            // previous parent
            let prevParent = null;
            if (this.getParent()) {
                prevParent = this.getParent();
            }

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
                    this, this.stage,
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
                    this, this.stage,
                );
            } else {
                console.error('PolygonModel: loadState: Error in Loading Outline Points');                
                return null;
            }

            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];
            // set edge center points
            if(!this.isObstruction){
                for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                    const nextIndex = i + 1 < l ? i + 1 : 0;
                    const currentPoint = this.outlinePoints[i].getPosition();
                    const nextPoint = this.outlinePoints[nextIndex].getPosition();
                    this.edgeCentrePoints.push(new EdgeCentrePoints(
                        (currentPoint.x + nextPoint.x) / 2,
                        (currentPoint.y + nextPoint.y) / 2,
                        (currentPoint.z + nextPoint.z) / 2,
                        this,
                        this.stage,
                    ));
                }
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {
                // update polygon measurement
                this.polygonMeasurement.show();
                this.polygonMeasurement.update();
            }

            // update geometry
            this.updateGeometry();

            this.rotationPoints.removeObject();
            // updating the rafters when we do undo redo if the current parent is smartroofface
            if (this.getParent() instanceof SmartroofFace) {
                this.getParent().updateRafter();
            }
            // update the rafters of the previous parent if it's a sface
            if (prevParent && prevParent instanceof SmartroofFace) prevParent.updateRafter();
            this.createRotation();
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

        // update rafter on undo redo
        let prevParent = null;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            if (prevParent instanceof SmartroofFace) {
                prevParent.updateRafter();
            }
            prevParent = null;
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.rotationPoints.removeObject();

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.edgeCentrePoints = [];

        // remove measurements
        this.polygonMeasurement.remove();
    }

    exportAsSTL() {
        const { coreMesh } = this;
        const { parapetMesh } = this;
        coreMesh.updateMatrix();
        parapetMesh.updateMatrix();

        const coreGeometry = coreMesh.geometry.clone();
        const parapetGeometry = parapetMesh.geometry.clone();
        let allGeometries = [];

        // add object if it is valid
        if (coreGeometry.attributes.position.count > 0) {
            allGeometries.push(coreGeometry);
        }
        if (parapetGeometry.attributes.position.count > 0) {
            allGeometries.push(parapetGeometry);
        }


        const singleGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);

        const allObjects = [];

        const mesh = createMesh(singleGeometry, new THREE.MeshBasicMaterial());

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
        const { parapetMesh } = this;
        coreMesh.updateMatrix();
        parapetMesh.updateMatrix();
        const coreGeometry = coreMesh.geometry.clone();
        const parapetGeometry = parapetMesh.geometry.clone();
        let allGeometries = [];

        // add object if it is valid
        if (coreGeometry.attributes.position.count > 0) {
            allGeometries.push(coreGeometry);
        }
        if (parapetGeometry.attributes.position.count > 0) {
            allGeometries.push(parapetGeometry);
        }


        const singleGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);

        const mesh = createMesh(
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
                mesh.children.push(obj.model);
                subArrays.push(...obj.subarray);
            }
        }

        return {
            model: mesh,
            subarray: subArrays,
        };
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: this.obstructionType === RectangleObstruction.getObjectType() ? RectangleObstruction.getObjectType() : PolygonModel.getObjectType(),
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
        polygonModelData.parapetHeight = this.parapetHeight;
        polygonModelData.parapetThickness = this.parapetThickness;
        polygonModelData.tilt = this.tilt;
        polygonModelData.lockedParameter = this.lockedParameter;
        polygonModelData.topHeight = this.topHeight;
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.setbackInside = this.setbackInside;
        polygonModelData.setbackOutside = this.setbackOutside;
        polygonModelData.ignored = this.ignored;
        polygonModelData.placable = this.placable;
        polygonModelData.isRotationAllowed = this.isRotationAllowed;
        polygonModelData.obstruction = this.obstruction;
        polygonModelData.isObstruction = this.isObstruction;
        if (this.isObstruction) polygonModelData.flushType = this.flushType;
        // polygonModelData.rotationPoints = this.rotationPoints;

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

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        polygonModelData.errors = this.errors;
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

        if (polygonModelData.lockedParameter === undefined) {
            polygonModelData.lockedParameter = TOP_HEIGHT_LOCKED;
        }

        if (polygonModelData.topHeight === undefined) {
            const vertices = [];
            for (let i = 0; i < polygonModelData.outlinePoints.length; i += 1) {
                const outlinePoint = polygonModelData.outlinePoints[i];
                vertices.push(new THREE.Vector3(outlinePoint[0], outlinePoint[1], outlinePoint[2]));
            }
            const params = {
                coreHeight: polygonModelData.coreHeight,
                tilt: polygonModelData.tilt,
                lockedParameter: polygonModelData.lockedParameter,
                azimuth: polygonModelData.azimuth,
                vertices,
            };
            polygonModelData.topHeight = this.computeTiltAndHeights(params).topHeight;
        }

        return { isValid: true };
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
                .customErrorMessage('Polygon data invalid: Polygon removed');
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
        this.parapetHeight = polygonModelData.parapetHeight;
        this.parapetThickness = polygonModelData.parapetThickness;
        this.tilt = polygonModelData.tilt;
        this.azimuth = polygonModelData.azimuth;
        this.setbackInside = polygonModelData.setbackInside;
        this.setbackOutside = polygonModelData.setbackOutside;
        this.ignored = polygonModelData.ignored;
        if (polygonModelData.placable === undefined) {
            this.placable = this.getDefaultValues().placable;
        } else {
            this.placable = polygonModelData.placable;
        }
        this.lockedParameter = polygonModelData.lockedParameter;
        this.topHeight = polygonModelData.topHeight;
        this.isRotationAllowed = (polygonModelData.isRotationAllowed === undefined || polygonModelData.isRotationAllowed === null) ? true : polygonModelData.isRotationAllowed,
        this.obstruction = polygonModelData.obstruction;
        this.isObstruction = polygonModelData.isObstruction;
        if(!polygonModelData.obstruction){
            this.obstruction = 'None'
        }

        // this.rotationPoints = polygonModelData.rotationPoints;

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
        if (this.isObstruction) {
            this.setbackInside = null;
            this.flushType = polygonModelData.flushType;
        }
        if(!this.isObstruction){
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        if (!Array.isArray(this.setbackInside)) {
            const setbackValues = [];
            if(this.setbackInside === 0){
                this.setbackInside = 0.001;
            }
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                setbackValues.push(this.setbackInside);
            }
            this.setbackInside = setbackValues;
        }
        else{
            for (let i = 0, len = this.setbackInside.length; i < len; i += 1) {
                if(Array.isArray(this.setbackInside[i])){
                    for (let j = 0, len = this.setbackInside[i].length; j < len; j += 1) {
                        if(this.setbackInside[i][j]===0){
                            this.setbackInside[i][j] = 0.001;
                        }
                    }
                }
                else{
                    if(this.setbackInside[i]===0)
                        this.setbackInside[i] = 0.001;
                }
            }
        }

        if (!Array.isArray(this.setbackOutside)) {
            const setbackValues = [];
            if(this.setbackOutside === 0){
                this.setbackOutside = 0.001;
            }
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                setbackValues.push(this.setbackOutside);
            }
            this.setbackOutside = setbackValues;
        }
        else{
            for (let i = 0, len = this.setbackOutside.length; i < len; i += 1) {
                if(Array.isArray(this.setbackOutside[i])){
                    for (let j = 0, len = this.setbackOutside[i].length; j < len; j += 1) {
                        if(this.setbackOutside[i][j]===0){
                            this.setbackOutside[i][j] = 0.001;
                        }
                    }
                }
                else{
                    if(this.setbackOutside[i]===0)
                        this.setbackOutside[i] = 0.001;
                }
            }
        }

        // create polygon measurement
        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);

        // update geometry
        this.updateGeometry();
        this.createRotation();

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
                } else if (children[i].type === RectangleObstruction.getObjectType()) {
                    const rectangleObstruction = new RectangleObstruction(this.stage);
                    currentObject = rectangleObstruction;
                    this.addChild(rectangleObstruction);
                    rectangleObstruction.loadObject(children[i], isPaste);
                    if (rectangleObstruction.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                } else if (children[i].type === CylinderModel.getObjectType()) {
                    const cylinderModel = new CylinderModel(this.stage);
                    currentObject = cylinderModel;
                    this.addChild(cylinderModel);
                    cylinderModel.loadObject(children[i], isPaste);
                    if (cylinderModel.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');
                    }
                } else if (children[i].type === Tree.getObjectType()) {
                    const tree = new Tree(this.stage);
                    currentObject = tree;
                    this.addChild(tree);
                    tree.loadObject(children[i], isPaste);
                    if (tree.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading PolygonModel');  
                    }
                } else if (children[i].type === Inverter.getObjectType()) {
                    if (!isPaste) {
                        const inverter = new Inverter(this.stage);
                        currentObject = inverter;
                        this.addChild(inverter);
                        inverter.loadObject(children[i], isPaste);
                        if (inverter.getParent() !== this) {
                            console.error('PolygonModel: Mismatch in parent while loading Inverter');
                        }
                    }
                } else if (children[i].type === CombinerBox.getObjectType()) {
                    const combinerBox = new CombinerBox(this.stage);
                    currentObject = combinerBox;
                    this.addChild(combinerBox);
                    combinerBox.loadObject(children[i], isPaste);
                    if (combinerBox.getParent() !== this) {
                        console.error('PolygonModel: Mismatch in parent while loading Combiner Box');
                    }
                } else if (children[i].type === ACDB.getObjectType()) {
                    try {
                        const acdb = new ACDB(this.stage);
                        currentObject = acdb;
                        this.addChild(acdb);
                        acdb.loadObject(children[i], isPaste);
                        if (acdb.getParent() !== this) {
                            console.error('PolygonModel: Mismatch in parent while loading ACDB');
                        }
                    } catch (error) {
                        console.error('PolygonModel.js: error in loading ACdb', error);
                    }
                    // TODO: not a fix for loading later on and then adding the electrical connection
                    // this.stage.ground.allAcdbs.push({data:children[i], acdb:acdb, isPaste:false});
                } else if (children[i].type === DCDB.getObjectType()) {
                    if (!isPaste) {
                        try {
                            const dcdb = new DCDB(this.stage);
                            currentObject = dcdb;
                            this.addChild(dcdb);
                            dcdb.loadObject(children[i], isPaste);
                            if (dcdb.getParent() !== this) {
                                console.error('PolygonModel: Mismatch in parent while loading DCDB');
                            }
                        } catch (error) {
                            console.error('PolygonModel.js: error in loading dcdb', error);
                        }

                    }
                } else if (children[i].type === EastWestRack.getObjectType()) {
                    if (children[i].eastWestSubarraydata) {
                        // we have 2 childrens of the east west subarray 
                        // if we load both here we wont be able to link them together
                        // after loading, so we are loading it in the east west rack loadobject
                        const ewRack = new EastWestRack(this.stage);
                        currentObject = ewRack;
                        ewRack.loadObject(children[i], this, isPaste);
                    }
                    else {
                        continue;
                    }
                } else if (children[i].type === Subarray.getObjectType()) {
                    const subarray = new Subarray(this.stage);
                    currentObject = subarray;
                    subarray.loadObject(children[i], this, isPaste);
                } else if (children[i].type === Gazebo.getObjectType()) {
                    const gazebo = new Gazebo(this.stage);
                    currentObject = gazebo;
                    gazebo.loadObject(children[i], this, isPaste);
                } else if (children[i].type === Walkway.getObjectType()) {
                    const walkway = new Walkway(this.stage);
                    currentObject = walkway;
                    this.addChild(walkway);
                    walkway.loadObject(children[i], isPaste);
                } else if (children[i].type === SafetyLine.getObjectType()) {
                    const safetyLine = new SafetyLine(this.stage);
                    currentObject = safetyLine;
                    this.addChild(safetyLine);
                    safetyLine.loadObject(children[i], isPaste);
                } else if (children[i].type === Handrail.getObjectType()) {
                    const handrail = new Handrail(this.stage);
                    currentObject = handrail;
                    this.addChild(handrail);
                    handrail.loadObject(children[i], isPaste);
                } else if (children[i].type === AcCable.getObjectType()) {
                    try {
                        const acCable = new AcCable(this.stage);
                        currentObject = acCable;
                        this.addChild(acCable);
                        acCable.loadObject(children[i], isPaste);
                    } catch (error) {
                        console.error('PolygonModel.js: error in loading AC cable', error);
                    }
                    // this.stage.ground.allCables.push({data:children[i], cable:acCable, isPaste:isPaste});
                } else if (children[i].type === DcCable.getObjectType()) {
                    const dcCable = new DcCable(this.stage);
                    currentObject = dcCable;
                    this.addChild(dcCable);
                    // this.stage.ground.allCables.push({data:children[i], cable:dcCable, isPaste:isPaste});
                }
                // else if (children[i].type === Conduit.getObjectType()) {
                //     const conduit = new Conduit(this.stage);
                //     this.addChild(conduit);
                //     conduit.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(conduit);
                // }
                // else if (children[i].type === DoubleConduit.getObjectType()) {
                //     const doubleConduit = new DoubleConduit(this.stage);
                //     this.addChild(doubleConduit);
                //     doubleConduit.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(doubleConduit);
                // }
                // else if (children[i].type === DoubleSeparateConduit.getObjectType()) {
                //     const doubleSeparateConduit = new DoubleSeparateConduit(this.stage);
                //     this.addChild(doubleSeparateConduit);
                //     doubleSeparateConduit.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(doubleSeparateConduit);
                // }
                // else if (children[i].type === SingleCableTray.getObjectType()) {
                //     const singleCableTray = new SingleCableTray(this.stage);
                //     this.addChild(singleCableTray);
                //     singleCableTray.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(singleCableTray);
                // }
                // else if (children[i].type === DoubleCableTray.getObjectType()) {
                //     const doubleCableTray = new DoubleCableTray(this.stage);
                //     this.addChild(doubleCableTray);
                //     doubleCableTray.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(doubleCableTray);
                // }
                // else if (children[i].type === DoubleSeparateCableTray.getObjectType()) {
                //     const doubleSeparateCableTray = new DoubleSeparateCableTray(this.stage);
                //     this.addChild(doubleSeparateCableTray);
                //     doubleSeparateCableTray.loadObject(children[i], isPaste);
                //     this.allConduitAndCabletary.push(doubleSeparateCableTray);
                // }
                else {
                    console.error('PolygonModel: Invalid object type in loadObject');
                }
            } catch (error) {
                console.error('Unable to load children of Polygon', error);
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
        } else {
            this.saveState({ withoutContainer: true });
        }
    }

    mirrorObjectAlongEdge(edge, { maintainCentroid } = { maintainCentroid: false }) {
        const mirroredData = mirrorObjectData(this.saveObject(), edge);
        const oldPosition = this.getPosition();
        this.polygonMeasurement.remove();
        // TODO: measurements should be set to null after removing?
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.rotationPoints.removeObject();

        this.azimuth = mirroredData.azimuth;
        for (let i = 0, len = mirroredData.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                mirroredData.outlinePoints[i][0],
                mirroredData.outlinePoints[i][1],
                mirroredData.outlinePoints[i][2],
                this,
                this.stage,
            ));
        }

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.edgeCentrePoints = [];
        if(!this.isObstruction){
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        // polygon measurement reverses the vertices order in case they are anti-clockwise
        // so passing outline points directly to polygon measurement affects original array
        // which reverse the edge setback value

        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);
        if (this.isObstruction && this.flushType) {
            this.tilt = this.getParent().tilt == undefined ? 0 : this.getParent().tilt;
            this.azimuth = this.getParent().azimuth == undefined ? 0: this.getParent().azimuth;
        }
        this.updateGeometry();
        this.createRotation();

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

    // Drawing functions
    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    async onComplete(geometry) {
        // getting vertices from buffer geometry
        const vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i += 1) {
            vertices.push(new THREE.Vector3(
                geometry.attributes.position.array[(i * 3)],
                geometry.attributes.position.array[(i * 3) + 1],
                geometry.attributes.position.array[(i * 3) + 2],
            ));
        }

        // Removing collinear vertices
        for (let i = 0; i < vertices.length; i += 1) {
            const vertex = vertices[i];
            const vertexNext = vertices[(i + 1) % vertices.length];
            const vertexPrev = vertices[(i - 1 + vertices.length) % vertices.length];
            if (this.checkCollinear(vertex, vertexNext, vertexPrev)) {
                vertices.splice(i, 1);
                i -= 1;
            }
        }

        // set outline points
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z,
                this,
                this.stage,
            ));
        }

        // set edge center points
        if(!this.isObstruction){
            for (let i = 0, l = vertices.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (vertices[i].x + vertices[nextIndex].x) / 2,
                    (vertices[i].y + vertices[nextIndex].y) / 2,
                    (vertices[i].z + vertices[nextIndex].z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        // create polygon measurement
        this.polygonMeasurement = new PolygonMeasurement([...this.outlinePoints], this, this.stage);

        if (this.computeArea() > this.getDefaultValues().heatMapThreshold) {
            this.placable = true;
        } else {
            this.placable = false;
        }
        geometry.computeBoundingSphere();

        try {
            await this.placeObject();
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: OnComplete failed.', error);
            this.onCancel();
            return Promise.reject(error);
        }
    }

    checkCollinear(a,b,c) {
        let t = a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y);
        return Math.abs(t) < 0.01;
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    // Takes 4 inputs, azimuth, lockedParameter, and any two of top height, tilt and core height.
    computeTiltAndHeights(params) {
        this.coreMesh.geometry.computeBoundingSphere();
        const response = {
            tilt: params.tilt,
            coreHeight: params.coreHeight,
            topHeight: params.topHeight,
        };

        const {
            azimuth,
            coreHeight,
            topHeight,
            lockedParameter,
            tilt,
        } = params;

        let parent = null;
        let parentTilt = 0;
        let parentAzimuth = 180;
        if (params.parent !== undefined && params.parent !== null) {
            ({ parent } = params);
        } else {
            parent = this.getParent();
        }

        if (parent === null) {
            const placingInformation = this.getPlacingInformation(utils.drawingArrayTo2DArray(
                this.stage.drawManager.getVertices(),
                this.stage.drawManager.getNoOfVertices(),
            ), params);
            return (placingInformation.tiltAndHeights !== undefined) ?
                placingInformation.tiltAndHeights : response;
        }

        parentTilt = parent.getTilt();
        parentAzimuth = parent.getAzimuth();

        let vertices = [];
        if (params.vertices === undefined || params.vertices === null) {
            vertices = utils.convertArrayToVector(this.get2DVertices());
        } else {
            ({ vertices } = params);
        }

        switch (lockedParameter) {
            case TILT_LOCKED:
                response.tilt = modelUtils.computeTilt(
                    azimuth,
                    coreHeight,
                    topHeight,
                    vertices,
                    parent,
                );
                break;
            case CORE_HEIGHT_LOCKED:
                response.coreHeight = modelUtils.computeCoreHeight(
                    parentTilt,
                    parentAzimuth,
                    tilt,
                    azimuth,
                    vertices,
                    topHeight,
                );
                break;
            case TOP_HEIGHT_LOCKED:
                response.topHeight = modelUtils.computeTopHeight(
                    parentTilt,
                    parentAzimuth,
                    tilt,
                    azimuth,
                    vertices,
                    coreHeight,
                );
                break;
            default:
                console.error(`ERROR: PolygonModel: computeTiltAndHeights failed -
                Incorrect locked parameter ${lockedParameter}`);
        }
        return response;
    }

    // Geometry functions

    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        const vertices2DVectorArray = utils.convertArrayTo3DVector(vertices2DArray);

        // create core
        const geometry = new NikGeometry(this.stage);
        const coreGeometry = geometry.createFromPoints(vertices2DVectorArray, this.coreHeight);

        coreGeometry.translate(0, 0, this.baseHeight);

        let setbackInsideGeometry = createBufferGeometry();
        let setbackOutsideGeometry = createBufferGeometry();

        if (utils.checkComplexGeometry(vertices2DArray)) {
            this.coreMesh.visible = false;
            this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);
            this.parapetMesh.visible = false;
            this.parapetEdges.visible = false;
            this.setbackInsideMesh.visible = false;
            this.setbackOutsideMesh.visible = false;
            this.polygonMeasurement.hide();
            return;
        }

        this.coreMesh.visible = true;
        this.parapetMesh.visible = true;
        this.parapetEdges.visible = true;
        if (this.stage.selectionControls.getSelectedObjects().includes(this)){
            this.polygonMeasurement.show();
            if (this.stage.viewManager.setbackVisible) {
                this.setbackInsideMesh.visible = true;
                this.setbackOutsideMesh.visible = true;
            }
        }

        // create parapet
        let parapetGeometry = createBufferGeometry();
        if (this.isParapetPresent() && this.getParent().getTilt() === 0 && this.tilt === 0) {
            const parapetInside2DVectorArrays = utils
                .bufferPolygon(vertices2DArray, -1 * this.parapetThickness)
                .map(group => group.map(arr => new THREE.Vector3(...arr)));

            const topVertices = [];
            const bottomVertices = [];
            const topHoles = [];
            const bottomHoles = [];

            for (let i = 0; i < vertices2DVectorArray.length; i += 1) {
                const v1 = vertices2DVectorArray[i].clone();
                const v2 = vertices2DVectorArray[i].clone();
                v1.setZ(this.parapetHeight);

                topVertices.push(v1);
                bottomVertices.push(v2);
            }

            for (let i = 0; i < parapetInside2DVectorArrays.length; i += 1) {
                const parapetInside2DVectorArray = parapetInside2DVectorArrays[i];

                const top = [];
                const bottom = [];
                for (let j = 0; j < parapetInside2DVectorArray.length; j += 1) {
                    const v1 = parapetInside2DVectorArray[j].clone();
                    const v2 = parapetInside2DVectorArray[j].clone();
                    v1.setZ(this.parapetHeight);
    
                    top.push(v1);
                    bottom.push(v2);
                }
                topHoles.push(top);
                bottomHoles.push(bottom);
            }

            const tempGeometry = new NikGeometry();
            parapetGeometry = tempGeometry.createFromTopAndBottomPoints(
                topVertices,
                bottomVertices,
                topHoles,
                bottomHoles,
            );
            parapetGeometry.translate(0, 0, this.baseHeight + this.coreHeight);
        }

        // updating outline points height
        let outlinePointHeightConstant = this.baseHeight + this.coreHeight;
        if (this.isParapetPresent()) {
            outlinePointHeightConstant += this.parapetHeight;
        }
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(
                0,
                0,
                outlinePointHeightConstant - this.outlinePoints[i].getPosition().z,
            );
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].moveObjectWithoutConsequences(
                0,
                0,
                outlinePointHeightConstant - this.edgeCentrePoints[i].getPosition().z,
            );
        }
        // update if bottom or top surface is tilted

        if (((this.getParent() instanceof PolygonModel ||
                    this.getParent() instanceof CylinderModel || this.getParent() instanceof SmartroofFace) &&
                (this.getParent().getTilt() !== 0)) || this.tilt !== 0) {
            // get tilt and azimuth of parent model
            let parentTilt = 0;
            let parentAzimuth = 180;
            if (this.getParent() instanceof PolygonModel ||
                this.getParent() instanceof CylinderModel || this.getParent() instanceof SmartroofFace) {
                parentTilt = this.getParent().getTilt();
                parentAzimuth = this.getParent().getAzimuth();
            }

            // Get height difference between top and bottom surface
            const [a1, b1, c1, a2, b2, c2] = modelUtils
                .getNormalsForTopAndBottomPlane(this.tilt, this.azimuth, parentTilt, parentAzimuth);

            let minZOnTop = +Infinity;
            let minHeightDiff = +Infinity;
            let placingPoint = null;
            for (let i = 0; i < vertices2DVectorArray.length; i += 1) {
                const v = vertices2DVectorArray[i].clone();
                v.z = this.baseHeight;
                // rounding off to 3 decimal (1mm precision)
                const heightDiff =
                    Math.round((((-1 * ((a2 * v.x) + (b2 * v.y))) / c2) -
                        ((-1 * ((a1 * v.x) + (b1 * v.y))) / c1)) * 1000) / 1000;

                if (heightDiff < minHeightDiff) {
                    const z = this.getParent().getZOnTopSurface(v.x, v.y);
                    if (z <= minZOnTop) {
                        minZOnTop = z;
                    }
                    minHeightDiff = heightDiff;
                    placingPoint = v.clone();
                } else if (heightDiff === minHeightDiff) {
                    const z = this.getParent().getZOnTopSurface(v.x, v.y);
                    if (z <= minZOnTop) {
                        minZOnTop = z;
                        placingPoint = v.clone();
                    }
                }
            }

            if (this.getParent() instanceof CylinderModel ||
                this.getParent() instanceof PolygonModel || this.getParent() instanceof SmartroofFace) {
                placingPoint.z = this.getParent().getZOnTopSurface(placingPoint.x, placingPoint.y);
            } else {
                placingPoint.z = this.baseHeight;
            }

            // update all vertices of bottom surface with reference to the placing point
            const bottomPoints = [];
            const topPoints = [];
            const d1 =
                (-1 * ((a1 * placingPoint.x) + (b1 * placingPoint.y) + (c1 * placingPoint.z)));
            for (let i = 0; i < vertices2DVectorArray.length; i += 1) {
                const v = vertices2DVectorArray[i].clone();
                v.z = (-1 * ((a1 * v.x) + (b1 * v.y) + d1)) / c1;

                bottomPoints.push(v);
            }

            // update all vertices of top surface with ref to the placing point and core height
            const d2 = (-1 * (
                (a2 * placingPoint.x) +
                (b2 * placingPoint.y) +
                (c2 * (placingPoint.z + this.coreHeight))
            ));
            for (let i = 0; i < vertices2DVectorArray.length; i += 1) {
                const v = vertices2DVectorArray[i].clone();
                v.z = (-1 * ((a2 * v.x) + (b2 * v.y) + d2)) / c2;

                topPoints.push(v);
            }

            // update base height (defined as the lowest z of top surface minus core height)
            let minZOnTopSurface = +Infinity;
            for (let i = 0; i < topPoints.length; i += 1) {
                if (topPoints[i].z < minZOnTopSurface) {
                    minZOnTopSurface = topPoints[i].z;
                }
            }
            this.baseHeight = minZOnTopSurface - this.coreHeight;

            // update parapet height
            if (this.isParapetPresent()) {
                const parapetInside2DVectorArrays = utils
                    .bufferPolygon(vertices2DArray, -1 * this.parapetThickness)
                    .map(group => group.map(arr => new THREE.Vector3(...arr)));

                const topVertices = [];
                const bottomVertices = [];
                const topHoles = [];
                const bottomHoles = [];

                for (let i = 0; i < vertices2DVectorArray.length; i += 1) {
                    const v1 = vertices2DVectorArray[i].clone();
                    const v2 = vertices2DVectorArray[i].clone();
                    v1.setZ(((-1 * ((a2 * v1.x) + (b2 * v1.y) + d2)) / c2) + this.parapetHeight);
                    v2.setZ((-1 * ((a2 * v2.x) + (b2 * v2.y) + d2)) / c2);

                    topVertices.push(v1);
                    bottomVertices.push(v2);
                }

                for (let i = 0; i < parapetInside2DVectorArrays.length; i += 1) {
                    const parapetInside2DVectorArray = parapetInside2DVectorArrays[i];

                    const top = [];
                    const bottom = [];
                    for (let j = 0; j < parapetInside2DVectorArray.length; j += 1) {
                        const v1 = parapetInside2DVectorArray[j].clone();
                        const v2 = parapetInside2DVectorArray[j].clone();
                        v1.setZ(((-1 * ((a2 * v1.x) + (b2 * v1.y) + d2)) / c2) + this.parapetHeight);
                        v2.setZ((-1 * ((a2 * v2.x) + (b2 * v2.y) + d2)) / c2);

                        top.push(v1);
                        bottom.push(v2);
                    }

                    topHoles.push(top);
                    bottomHoles.push(bottom);
                }

                const tempGeometry = new NikGeometry();
                parapetGeometry = tempGeometry.createFromTopAndBottomPoints(
                    topVertices,
                    bottomVertices,
                    topHoles,
                    bottomHoles,
                );
            }

            // updating outline points height to accommodate for the tilt
            let parapetAccommodationConstant = 0;
            if (this.isParapetPresent()) {
                parapetAccommodationConstant += this.parapetHeight;
            }
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const v = this.outlinePoints[i].getPosition();
                const outlinePointDeltaZ = ((-1 * ((a2 * v.x) + (b2 * v.y) + d2)) / c2) +
                    (parapetAccommodationConstant - this.outlinePoints[i].getPosition().z);
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, outlinePointDeltaZ);
            }

            // updating edge center points height to accommodate for the tilt
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                const v = this.edgeCentrePoints[i].getPosition();
                const outlinePointDeltaZ = ((-1 * ((a2 * v.x) + (b2 * v.y) + d2)) / c2) +
                    (parapetAccommodationConstant - this.edgeCentrePoints[i].getPosition().z);
                this.edgeCentrePoints[i].moveObjectWithoutConsequences(0, 0, outlinePointDeltaZ);
            }


            // // update all the vertices of the setbackOutsideMesh
            if (this.setbackOutside) {
                setbackOutsideGeometry = this.getSetbackOutsideGeometry();

                const { count } = setbackOutsideGeometry.attributes.position;

                for (let i = 0; i < count; i += 1) {
                    const x = setbackOutsideGeometry.attributes.position.getX(i);
                    const y = setbackOutsideGeometry.attributes.position.getY(i);

                    const z = (-1 * (
                        (a1 * x) +
                        (b1 * y) +
                        d1)) / c1;

                    setbackOutsideGeometry.attributes.position.setZ(i, z);
                }
            }

            // update all the vertices of the setbackInsideMesh
            if (this.setbackInside && !this.isObstruction) {
                setbackInsideGeometry = this.getSetbackInsideGeometry();

                const { count } = setbackInsideGeometry.attributes.position;

                for (let i = 0; i < count; i += 1) {
                    const x = setbackInsideGeometry.attributes.position.getX(i);
                    const y = setbackInsideGeometry.attributes.position.getY(i);

                    const z = (-1 * (
                        (a2 * x) +
                        (b2 * y) +
                        d2)) / c2;

                    setbackInsideGeometry.attributes.position.setZ(i, z);
                }
            }

            geometry.createFromTopAndBottomPoints(topPoints, bottomPoints);
        } else {
            if(!this.isObstruction){
                setbackInsideGeometry = this.getSetbackInsideGeometry();
            }
            setbackOutsideGeometry = this.getSetbackOutsideGeometry();
        }

        // updating meshes and edges
        this.coreMesh.geometry = coreGeometry;
        this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);
        this.coreEdges.position.z = this.coreMesh.position.z + 0.01;
        this.parapetMesh.geometry = parapetGeometry;
        this.parapetEdges.geometry = new THREE.EdgesGeometry(parapetGeometry);
        this.parapetEdges.position.z = this.parapetMesh.position.z + 0.01;
        this.setbackInsideMesh.geometry = setbackInsideGeometry;
        this.setbackOutsideMesh.geometry = setbackOutsideGeometry;

        // To resolve Z fighting
        this.setbackInsideMesh.position.z = 0.01;
        this.setbackOutsideMesh.position.z = 0.01;

        // update measurement
        this.polygonMeasurement.update();
    }

    getSetbackInsideGeometry() {
        // create setbackInside
        this.debugGroup.clear();
        const vertices2DArray = this.get2DVertices();
        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        let setbackInsideGeometry = createBufferGeometry();
        if (this.setbackInside) {
            // const setbackInside3DPoints = utils.getSetbackPoints(
            //     this.get3DVertices(),
            //     -1 * (this.setbackInside
            //         + (this.isParapetPresent() ? this.parapetThickness : 0)),
            // );
            // const setbackInsidePoints = utils.convertVectorArrayTo2DArray(setbackInside3DPoints);
            if (!Array.isArray(this.setbackInside)) {
                const setbackValues = [];
                for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                    setbackValues.push(this.setbackInside);
                }
                this.setbackInside = setbackValues;
            }
            const edgeSetbackInsideValues = this.setbackInside.map(item =>
                item + (this.isParapetPresent() ? this.parapetThickness : 0));
            const setbacks = utils.newBuffer(
                edgeSetbackInsideValues,
                vertices2DArray,
                EDIT_SETBACK_INSIDE,
            );
            const setbackInsidePoints = setbacks.map(loop =>
                utils.convertVectorArrayTo2DArray(loop));

            const setbackInsideShape = new THREE.Shape(vertices2DVectorArray);
            if (Array.isArray(setbackInsidePoints) && setbackInsidePoints.length && setbackInsidePoints.every(loop => Array.isArray(loop))) {
                setbackInsideShape.holes = [];
                setbackInsidePoints.forEach((loop) => {
                    if (loop.length > 2) {
                        const subPath = new THREE.Path(utils.convertArrayToVector(loop));
                        setbackInsideShape.holes.push(subPath);
                    }
                });
            }
            setbackInsideGeometry = new THREE.ShapeGeometry(setbackInsideShape);
            setbackInsideGeometry.translate(0, 0, this.baseHeight + this.coreHeight);
        }

        return setbackInsideGeometry;
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
            const parentPolygonPoints = this.parent.get2DVertices();
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
            this.setbackOutsidePoints = setbackOutsidePoints;
        }

        return setbackOutsideGeometry;
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.baseHeight += deltaZ;

        // this.rotateObject(deltaX,deltaY,deltaZ)
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        this.parapetMesh.geometry.translate(deltaX, deltaY, deltaZ);
        utils.translateShapeGeometry(this.parapetMesh.geometry, deltaX, deltaY);

        this.parapetEdges.geometry.translate(deltaX, deltaY, deltaZ);

        this.setbackInsideMesh.geometry.translate(deltaX, deltaY, deltaZ);
        utils.translateShapeGeometry(this.setbackInsideMesh.geometry, deltaX, deltaY);

        this.setbackOutsideMesh.geometry.translate(deltaX, deltaY, deltaZ);
        utils.translateShapeGeometry(this.setbackOutsideMesh.geometry, deltaX, deltaY);

        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        if (this.rotationPoints) {
            this.rotationPoints.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        // TODO this will not work in multy select 
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.polygonMeasurement.update();
        }

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }
        this.roofTextureGeometry.translate(0, 0, deltaZ);

        this.saveState();
    }

    async rotateObjectHelper(angleInRad, centroidPoint) {
        if(this.isObstruction && !this.isRotationAllowed) {
            this.isRotationAllowed = true;
        }
        if(!this.isObstruction){
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                // update edgeCentrePoints
                const edgePointX = this.edgeCentrePoints[i].getPosition().x;
                const edgePointY = this.edgeCentrePoints[i].getPosition().y;
                const edgeDeltaXY = utils.rotationAroundPoint(
                    centroidPoint.x,
                    centroidPoint.y,
                    edgePointX,
                    edgePointY,
                    angleInRad,
                );
    
                this.edgeCentrePoints[i].moveObjectWithoutConsequences(
                    edgeDeltaXY[0] - edgePointX,
                    edgeDeltaXY[1] - edgePointY,
                );
            }
        }
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

        this.updateGeometry();
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }


    // Placing functions

    getPlacingInformation(vertices) {
        const response = {};
        let numberOfPoints;

        // Getting vertices
        let vertices2DArray;
        if (vertices === null || vertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        } else {
            vertices2DArray = vertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        let parentExists = true;
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        if (!raycastingUtils.areVerticesOnGround(vertices2DVectorArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
        }
        if (numberOfPoints + 1 < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DVectorArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
            parentExists = false;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        let erodedVertices;
        if (polygonExists) {
            // To accommodate for snapping
            erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            if (erodedVertices.length === 0) {
                response.errors.push(new Error(POLYGON_WITH_NO_AREA_ERROR));
                parentExists = false;
            }

            if (parentExists) {
                // using raycaster to get the top most model in new place
                // and get height of it for deltaZ
                // but ignoring this model or its child as we don't want to place over them
                const idsToIgnore = [this.uuid];
                this.getChildrenModelUuids(idsToIgnore);

                const allBelowModels =
                    raycastingUtils.getAllModelsBelowVertices(erodedVertices, this.stage);
                let [newParent, newHeight] = [-1, -1];
                for (let i = 0; i < allBelowModels.length; i += 1) {
                    const model = allBelowModels[i][0];
                    const height = allBelowModels[i][1];
                    if (!idsToIgnore.includes(model.uuid) && !(model instanceof SmartroofModel)) {
                        if (newHeight < height) {
                            [newParent, newHeight] = [model, height];
                        }
                    }
                }

                response.parent = newParent;
                response.height = newHeight;

                if (vertices2DVectorArray.length >= 3) {
                    const tiltAndHeightsParams = {
                        coreHeight: this.coreHeight,
                        topHeight: this.topHeight,
                        tilt: this.tilt,
                        azimuth: this.azimuth,
                        lockedParameter: this.lockedParameter,
                        parent: newParent,
                        vertices: vertices2DVectorArray,
                    };

                    response.tiltAndHeights = this.computeTiltAndHeights(tiltAndHeightsParams);
                    if (response.tiltAndHeights.coreHeight <= 0) {
                        const error = new Error(INVALID_CORE_HEIGHT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                    if (response.tiltAndHeights.topHeight <= 0) {
                        const error = new Error(INVALID_TOP_HEIGHT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                    if (response.tiltAndHeights.tilt < 0 ||
                        response.tiltAndHeights.tilt === null) {
                        const error = new Error(INVALID_TILT_ERROR);
                        response.errors.push(error);
                        parentExists = false;
                        response.cannotCompleteError = error;
                    }
                }
            }
        }

        return response;
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            } else if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setPolygonModelOutOfGroundRemoved();
            } else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.modelVertexEquivalentError();
            } else if (error.message === INVALID_CORE_HEIGHT_ERROR) {
                this.stage.eventManager.invalidCoreHeightErrorForPolygon();
            } else if (error.message === INVALID_TILT_ERROR) {
                this.stage.eventManager.invalidTiltErrorForPolygon();
            }
            console.log(placingInformation.errors)
            this.removeObject();
            return Promise.reject(error);
        }
        // get new parent and height while placing
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);
        if (newParent instanceof SmartroofFace) {
            // update rafter of prev parent
            newParent.getParent().updateRafter();
        }

        // update new base height
        this.baseHeight = newHeight;

        const oldHeight = this.getZOnTopSurface(...this.get2DVertices()[0]);
        if (this.isObstruction && this.flushType) {
            this.tilt = this.getParent().tilt == undefined ? 0 : this.getParent().tilt;
            this.azimuth = this.getParent().azimuth == undefined ? 0: this.getParent().azimuth;
        }
        this.updateGeometry();

        if (!this.rotationPoints) {
            this.createRotation();
        }

        const deltaZ = this.getZOnTopSurface(...this.get2DVertices()[0]) - oldHeight;

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0; i < keys.length; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        // Update locked parameter
        this.updateCurrentlyLockedParameter(placingInformation.tiltAndHeights);

        // update children
        for (let i = 0; i < this.getChildren().length; i += 1) {
            this.getChildren()[i].moveObject(0, 0, deltaZ);

            // // remove and add children to hover Manager
            // if (mapped[this.getChildren()[i].id]) {
            //     mapped[this.getChildren()[i].id].forEach((h) => {
            //         h.removeObject(this.getChildren()[i].id);
            //     });
            // }
            // this.getChildren()[i].stage.hoverManager.addObject(this.getChildren()[i]);
        }

        // TODO: Jugaad, fix for moveObject of safety line and handrail
        utils.updateHandrailAndSafetyLineForMove(this);

        // update siblings
        try {
            await this.handleSiblingConsequences();

            // remove object from hover manager and add it again
            this.stage.quadTreeManager.handlePlaceObject(this);
            // if (mapped[this.id]) {
            //     mapped[this.id].forEach((h) => {
            //         h.removeObject(this.id);
            //     });
            // }
            // this.stage.hoverManager.addObject(this);
            this.resetGrandParentSolarAccess();
            this.stage.heatMap.removeHeatMapOnModelPlace();

            // Saving state after the object is placed
            this.saveState();
        } catch (error) {
            console.error('ERROR: PolygonModel: placeObject failed', error);
            return Promise.reject(error);
        }
        return Promise.resolve(true);
    }

    handleDragStart() {
        this.setbackOutsideMesh.visible = false;
        this.previousIntersectingCableConduit = this.getIntersectingCablesConduit();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd(deltaX = 0, deltaY = 0) {
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();

        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
        try {
            await this.placeObject(deltaX, deltaY);
        } catch (e) {
            // error handled by place object
        } finally {
            this.stage.eventManager.completePolygonModelLoading(notificationObject);
        }
        this.previousIntersectingCableConduit = [];
    }

    handleDragCancel() {
        this.previousIntersectingCableConduit = [];
        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }


    handleVertexDragStart(vertex) {
        this.polygonMeasurement.handleVertexDragStart(vertex);
        this.previousIntersectingCableConduit = this.getIntersectingCablesConduit();
        this.previousHeight = this.getHighestZ();
    }

    handleVertexMove(vertex) {
        if (!(vertex instanceof RotationPoint) && this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: PolygonModel: vertex not in outlinePoints in handleVertexMove');
        }

        if(!this.isObstruction){
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];
    
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (!(vertex instanceof RotationPoint) && this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: PolygonModel: vertex not in outlinePoints in handleVertexPlace');
        }

        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        this.previousIntersectingCableConduit = [];
        try {

            // place object
            await this.placeObject();
            this.currentHeight = this.getHighestZ();
            const deltaZ = this.currentHeight - this.previousHeight;
            // place its children if top surface changed, i.e., the model is tilted
            await this.handleChildrenConsequences({
                resized: true,
                tiltChanged: this.getTilt() !== 0,
            });

            // Same code present in placeObject()
            // this.getChildren().forEach((child) => {
            //         child.moveObject(0, 0, deltaZ);
            //     })

            // Remove collinear points
            const resetMeasurement = this.removeCollinearOutlinePoints();
            this.addObjectsToDragControls();

            // update measurement
            if (!resetMeasurement) {
                this.polygonMeasurement.handleVertexDragEnd(vertex);
            }

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);
            await this.rotationPoints.placeObject();
            // to update the mesh in the scene
            this.stage.mergeManager.mergeScene(this);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            await this.saveState();

            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    removeCollinearOutlinePoints() {
        let resetMeasurement = false;
        let collinear = true;
        while (collinear) {
            collinear = false;
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const prevIndex = (i - 1 + l) % l;
                const nextIndex = (i + 1) % l;
                const prevPoint = this.outlinePoints[prevIndex].getPosition();
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                collinear  = utils.checkCollinear(prevPoint, currentPoint, nextPoint, 0.0001);
                if (collinear) {
                    resetMeasurement = true;
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                    i -= 1;
                    l -= 1;
                }
            }
        }
        if (resetMeasurement) {
            this.resetPolygonMeasurement();
            this.resetEdgeCenterPoints();
        }
        return resetMeasurement;

    }

    resetPolygonMeasurement() {
        this.polygonMeasurement.remove();
        // create polygon measurement
        this.polygonMeasurement = new PolygonMeasurement(
            [...this.outlinePoints],
            this, this.stage,
        );        
    }

    resetEdgeCenterPoints() {
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.edgeCentrePoints = [];
        // set edge center points
        if(!this.isObstruction){
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }
    }

    handleEdgeCenterDragStart(vertex) {
        const idx = this.edgeCentrePoints.indexOf(vertex);
        const movedPoint = this.edgeCentrePoints[idx].getPosition();

        this.outlinePoints.splice(
            idx + 1, 0,
            new OutlinePoints(
                movedPoint.x,
                movedPoint.y,
                movedPoint.z,
                this,
                this.stage,
            ),
        );

        const nextIndex = idx + 2 < this.outlinePoints.length ? idx + 2 : 0;
        const prevPoint = this.outlinePoints[idx].getPosition();
        const currentPoint = this.outlinePoints[idx + 1].getPosition();
        const nextPoint = this.outlinePoints[nextIndex].getPosition();

        this.edgeCentrePoints.splice(
            idx, 0,
            new EdgeCentrePoints(
                (currentPoint.x + prevPoint.x) / 2,
                (currentPoint.y + prevPoint.y) / 2,
                (currentPoint.z + prevPoint.z) / 2,
                this,
                this.stage,
            ),
            new EdgeCentrePoints(
                (currentPoint.x + nextPoint.x) / 2,
                (currentPoint.y + nextPoint.y) / 2,
                (currentPoint.z + nextPoint.z) / 2,
                this,
                this.stage,
            ),
        );

        this.polygonMeasurement.remove();
        this.polygonMeasurement = new PolygonMeasurement(
            [...this.outlinePoints],
            this, this.stage,
        );
        const edgeInsiddeSetbackValue = this.setbackInside[idx];
        const edgeOutsideSetbackValue = this.setbackInside[idx];

        this.setbackInside.splice(idx, 1, edgeInsiddeSetbackValue, edgeInsiddeSetbackValue);
        this.setbackOutside.splice(idx, 1, edgeOutsideSetbackValue, edgeOutsideSetbackValue);

        this.polygonMeasurement.handleVertexDragStart(this.outlinePoints[idx + 1]);
    }

    handleEdgeCentreMove(vertex, delta) {
        const idx = this.edgeCentrePoints.indexOf(vertex);
        if (idx < 2) {
            return;
        }

        this.outlinePoints[idx - 1].moveObjectWithoutConsequences(delta.x, delta.y, delta.z);

        this.edgeCentrePoints[idx - 1]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);
        this.edgeCentrePoints[idx - 2]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleEdgeCentrePlace(vertex) {
        const idx = this.edgeCentrePoints.indexOf(vertex);
        const [removedPoint] = this.edgeCentrePoints.splice(idx, 1);
        removedPoint.removeObject();
        
        if (this.outlinePoints[idx - 1]) {
            this.outlinePoints[idx - 1].showObject();
        }
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        this.previousIntersectingCableConduit = [];
        try {
            // remove collinear points
            const resetMeasurement = this.removeCollinearOutlinePoints();
            this.addObjectsToDragControls();

            // place object
            await this.placeObject();

            // place its children if top surface changed, i.e., the model is tilted
            await this.handleChildrenConsequences({
                resized: true,
                tiltChanged: this.getTilt() !== 0,
            });

            // update measurement
            if (!resetMeasurement) {
                this.polygonMeasurement.handleVertexDragEnd(this.outlinePoints[idx - 1]);
            }

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);
            this.rotationPoints.placeObject();
            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: PolygonModel: handleVertexPlace failed', error);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    // Properties Update functions

    getDefaultValues() {
        const polygonDrawingDefaults = this.stage.getDesignSettings().drawing_defaults.polygonModel;
        if(this.isObstruction) {
            polygonDrawingDefaults.parapetHeight = 0.00;
            polygonDrawingDefaults.parapetThickness = 0.001;
        }
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
            heatMapThreshold: polygonDrawingDefaults.heatMapThreshold,
            topHeight: polygonDrawingDefaults.topHeight,
            lockedParameter: polygonDrawingDefaults.lockedParameter,
            obstruction: polygonDrawingDefaults.obstruction,
        };
    }

    changePropertiesDuringCreation(properties) {
        if (Object.prototype.hasOwnProperty.call(properties, 'name') &&
            properties.name !== this.name) {
            this.name = properties.name;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'baseHeight') &&
            properties.baseHeight !== this.baseHeight) {
            this.baseHeight = properties.baseHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'coreHeight') &&
            properties.coreHeight !== this.coreHeight) {
            this.coreHeight = properties.coreHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetHeight') &&
            properties.parapetHeight !== this.parapetHeight) {
            this.parapetHeight = properties.parapetHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetThickness') &&
            properties.parapetThickness !== this.parapetThickness) {
            this.parapetThickness = properties.parapetThickness;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'lockedParameter') &&
            properties.lockedParameter !== this.lockedParameter) {
            this.lockedParameter = properties.lockedParameter;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'topHeight') &&
            this.topHeight !== properties.topHeight) {
            this.topHeight = properties.topHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'azimuth') &&
            properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            this.setbackInside = properties.setbackInside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackOutside') &&
            properties.setbackOutside !== this.setbackOutside) {
            this.setbackOutside = properties.setbackOutside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'ignored') &&
            properties.ignored !== this.ignored) {
            this.ignored = properties.ignored;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'placable') &&
            properties.placable !== this.placable) {
            this.placable = properties.placable;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'obstruction') &&
            properties.obstruction !== this.obstruction) {
            this.obstruction = properties.obstruction;
        }
    }

    // Calculates lockedParameter if nothing is passed and updates the values without updating
    // the geometry. Returns if the values were changed
    updateCurrentlyLockedParameter(calculatedTiltsAndHeights = null) {
        const tiltAndHeights = (calculatedTiltsAndHeights === null) ?
            this.computeTiltAndHeights({
                azimuth: this.getAzimuth(),
                tilt: this.getTilt(),
                coreHeight: this.getCoreHeight(),
                topHeight: this.getTopHeight(),
                lockedParameter: this.getLockedParameter(),
            }) : calculatedTiltsAndHeights;
        let valuesChanged = false;
        switch (this.getLockedParameter()) {
            case TILT_LOCKED:
                valuesChanged = (this.getTilt() !== tiltAndHeights.tilt);
                this.tilt = tiltAndHeights.tilt;
                break;
            case TOP_HEIGHT_LOCKED:
                valuesChanged = (this.getTopHeight() !== tiltAndHeights.topHeight);
                this.topHeight = tiltAndHeights.topHeight;
                break;
            case CORE_HEIGHT_LOCKED:
                valuesChanged = (this.getCoreHeight() !== tiltAndHeights.coreHeight);
                this.coreHeight = tiltAndHeights.coreHeight;
                break;
            default:
                // Do nothing
        }

        return valuesChanged;
    }

    getCurrentlyLockedParameter() {
        switch (this.lockedParameter) {
            case CORE_HEIGHT_LOCKED:
                return this.getCoreHeight();
            case TOP_HEIGHT_LOCKED:
                return this.getTopHeight();
            case TILT_LOCKED:
                return this.getTilt();
            default:
                console.error(`ERROR: PolygonModel: getCurrentlyLockedParameter failed -
                Invalid locked parameter`);
                return null;
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
            tiltOrAzimuthChanged: false,
            rotationPermissionChanged: false,
        };
        if (Object.prototype.hasOwnProperty.call(properties, 'name') &&
            properties.name !== this.name) {
            this.name = properties.name;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'baseHeight') &&
            properties.baseHeight !== this.baseHeight) {
            this.moveObject(0, 0, properties.baseHeight - this.baseHeight);
            this.stage.lightsManager.setShadowMapParameters();
            this.resetGrandParentSolarAccess();
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'flushType') && this.isObstruction &&
            properties.flushType !== this.flushType) {
            updateGeometryRequired = updateGeometryRequired || true;
            handleChildrenRequired = true;
            this.flushType = properties.flushType;
            if(properties.flushType){
                this.tilt = this.getParent().tilt===undefined ? 0 : this.getParent().tilt;
                if(this.coreHeight===properties.coreHeight){
                    options.heightChanged = true;
                    options.prevHeight = this.coreHeight;
                    this.coreHeight = 0.1;
                }
                this.azimuth = this.getParent().azimuth===undefined ? 180 : this.getParent().azimuth;
                this.updateCurrentlyLockedParameter();
            }
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'coreHeight') &&
            properties.coreHeight !== this.coreHeight && !options.heightChanged) {
            updateGeometryRequired = updateGeometryRequired || true;
            options.heightChanged = true;
            options.prevHeight = this.coreHeight;
            this.coreHeight = properties.coreHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetHeight') &&
            properties.parapetHeight !== this.parapetHeight) {
            updateGeometryRequired = updateGeometryRequired || true;
            options.parapetHeightChanged = true;
            handleChildrenRequired = true;
            options.prevParapetHeight = this.parapetHeight;
            this.parapetHeight = properties.parapetHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetThickness') &&
            properties.parapetThickness !== this.parapetThickness) {
            updateGeometryRequired = updateGeometryRequired || true;
            handleChildrenRequired = true;
            options.parapetThicknessChanged = true;
            this.parapetThickness = properties.parapetThickness;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt !== this.tilt) {
            updateGeometryRequired = updateGeometryRequired || true;
            options.tiltOrAzimuthChanged = true;
            handleChildrenRequired = true;
            this.tilt = properties.tilt;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'lockedParameter') &&
            properties.lockedParameter !== this.lockedParameter) {
            this.lockedParameter = properties.lockedParameter;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'topHeight') &&
            this.topHeight !== properties.topHeight) {
            this.topHeight = properties.topHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'azimuth') &&
            properties.azimuth !== this.azimuth) {
            updateGeometryRequired = updateGeometryRequired || true;
            options.tiltOrAzimuthChanged = true;
            handleChildrenRequired = true;
            this.azimuth = properties.azimuth;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'rotationAllowed') && this.isObstruction &&
            properties.rotationAllowed !== this.isRotationAllowed) {
            this.isRotationAllowed = properties.rotationAllowed;
            options.rotationPermissionChanged = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            updateGeometryRequired = updateGeometryRequired || true;

            if (properties.setbackInside !== 'custom') {
                const setbackValues = [];
                for (let i = 0, len = this.numVertices; i < len; i += 1) {
                    setbackValues.push(properties.setbackInside);
                }
                this.setbackInside = setbackValues;
            }
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
        if (Object.prototype.hasOwnProperty.call(properties, 'ignored') &&
            properties.ignored !== this.ignored) {
            if (properties.ignored) {
                const childSubarrays = this.getChildSubarrays();
                for (let i = 0; i < childSubarrays.length; i += 1) {
                    childSubarrays[i].removeObject();
                }
            } else {
                const siblings = this.getParent().getChildren();
                for (let i = 0; i < siblings.length; i += 1) {
                    if (siblings[i] instanceof Subarray) {
                        siblings[i].deleteTableInsideArea(this.get2DVertices());
                    }
                }
            }
            updateGeometryRequired = updateGeometryRequired || false;
            this.ignored = properties.ignored;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'placable') &&
            properties.placable !== this.placable) {
            updateGeometryRequired = updateGeometryRequired || false;
            this.placable = properties.placable;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'obstruction') &&
            properties.obstruction !== this.obstruction) {
            updateGeometryRequired = updateGeometryRequired || false;
            this.obstruction = properties.obstruction;
        }

        if (updateGeometryRequired) {
            try {
                this.handlePropertiesUpdate(options);
            } catch (error) {
                console.error('ERROR: PolygonModel: Update failed', error);
                return Promise.reject(error);
            }
        }
        if (handleChildrenRequired) {
            const notificationObject = this.stage.eventManager.setPolygonModelLoading();
            this.stage.lightsManager.setShadowMapParameters();

            try {
                await this.handleChildrenConsequences({
                    resized: false,
                    tiltChanged: true,
                    tiltOrAzimuthChanged: options.tiltOrAzimuthChanged,
                });
                this.stage.eventManager.completePolygonModelLoading(notificationObject);
            } catch (error) {
                console.error('ERROR: PolygonModel: changeTilt failed', error);
                this.stage.eventManager.completePolygonModelLoading(notificationObject);
            }
        }

        this.saveState();
        this.stage.mergeManager.mergeScene(this);
        return Promise.resolve(true);
    }

    handlePropertiesUpdate(options) {
        // for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
        //     console.log(this.edgeCentrePoints[i].getPosition())
        //     console.log(this.outlinePoints[i].getPosition())
        // }
        //this.edgeCentrePoints = [];
        //this.edgeCentrePoints.moveObject()
        this.updateGeometry();

        // for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
        //     const nextIndex = i + 1 < l ? i + 1 : 0;
        //     const currentPoint = this.outlinePoints[i].getPosition();
        //     const nextPoint = this.outlinePoints[nextIndex].getPosition();
        //     this.edgeCentrePoints.push(new EdgeCentrePoints(
        //         (currentPoint.x + nextPoint.x) / 2,
        //         (currentPoint.y + nextPoint.y) / 2,
        //         (currentPoint.z + nextPoint.z) / 2,
        //         this,
        //         this.stage,
        //     ));
        // }
        if (options.heightChanged) {
            const deltaZ = this.coreHeight - options.prevHeight;
            this.roofTextureGeometry.translate(0, 0, deltaZ);
            const children = this.getChildren();
            for (let i = 0, len = children.length; i < len; i += 1) {
                children[i].moveObject(0, 0, deltaZ);
            }
            utils.updateHandrailAndSafetyLineForMove(this);
            this.resetGrandParentSolarAccess();
            this.stage.lightsManager.setShadowMapParameters();
        } else if (options.parapetHeightChanged) {
            const deltaParapetHeight = this.parapetHeight - options.prevParapetHeight;
            const children = this.getChildren();
            for (let i = 0, len = children.length; i < len; i += 1) {
                if (children[i] instanceof Subarray) {
                    children[i].handleParentParapetHeightUpdate(deltaParapetHeight);
                }
            }
            this.resetGrandParentSolarAccess();
            this.stage.lightsManager.setShadowMapParameters();
        } else if (options.parapetThicknessChanged) {
            this.resetSolarAccess();
        }
    }

    // consequences functions

    async handleSiblingConsequences() {
        this.updateIntersectingCablesConduit(this.getIntersectingCablesConduit());
        const allPromises = [];

        const siblings = this.getParent().getChildren();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray && !this.ignored) {
                // TODO: Consider self-intersections and possibilities of multiple geometries
                // and handle the jsts ops accordingly.
                sibling.deleteTableInsideArea(this.get2DVerticesOutsideSetBack());
            } else if (sibling instanceof Walkway) {
                const placingPolygon = verticesToJSTSPolygon(this.get2DVertices());
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
            console.error('ERROR: PolygonModel: handleSiblingConsequences failed', error);
        }
        return Promise.resolve(true);
    }

    async handleChildrenConsequences(options = {}) {
        this.updateIntersectingCablesConduit(this.getIntersectingCablesConduit());
        /*
        param: options
            fields:
                resized -> boolean
                tiltChanged -> boolean
        */

        options.resized = Object.prototype.hasOwnProperty.call(options, 'resized') ? options.resized : false;
        options.tiltChanged = Object.prototype.hasOwnProperty.call(options, 'tiltChanged') ? options.tiltChanged : false;
        options.tiltOrAzimuthChanged = Object.prototype.hasOwnProperty.call(options, 'tiltOrAzimuthChanged') ? options.tiltOrAzimuthChanged : false;

        // TODO:
        // options.setbackInsideChanged = options.hasOwnProperty('setbackInsideChanged') ?
        //     options.setbackInsideChanged : false;

        // First remove the parent child link between this and child subarrays so that place for
        // polygon, cylinder or walkways not cause update for subarray repeatedly
        // (and later link it back and call update for it)
        const childSubarrays = this.getChildSubarrays();
        for (let i = 0, len = childSubarrays.length; i < len; i += 1) {
            this.removeChild(childSubarrays[i]);
        }

        const errors = [];
        for (let i = this.getChildren().length - 1; i >= 0; i -= 1) {
            const child = this.getChildren()[i];
            if (child instanceof PolygonModel ||
                child instanceof CylinderModel ||
                child instanceof Tree ||
                child instanceof Inverter ||
                child instanceof DCDB ||
                child instanceof AcCable ||
                child instanceof DcCable ||
                child instanceof Conduit ||
                child instanceof DoubleConduit ||
                child instanceof DoubleSeparateConduit ||
                child instanceof SingleCableTray ||
                child instanceof DoubleCableTray ||
                child instanceof DoubleSeparateCableTray ||
                child instanceof ACDB) {
                try {
                    if (options.resized) {
                        // check for intersection and remove child if no intersection
                        const parentPolygon = verticesToJSTSPolygon(this.get2DVertices());
                        const childPolygon = verticesToJSTSPolygon(child.get2DVertices());
                        const intersectingPolygon = parentPolygon.intersection(childPolygon);
                        if (intersectingPolygon.getArea() === 0) {
                            child.removeObject();
                            this.stage.eventManager.setPolygonModelOutsideOnResizeRemoved();
                            continue;
                        }
                    }
                    if (options.tiltOrAzimuthChanged && child.isObstruction && child.flushType) {
                        child.tilt = this.tilt;
                        child.azimuth = this.azimuth;
                        await child.placeObject();
                    }
                    if (options.tiltChanged && !child.flushType) {
                        await child.placeObject();
                    }
                } catch (error) {
                    errors.push(error);
                }
            } else if (child instanceof Walkway ||
                child instanceof Handrail) {
                try {
                    if (options.resized) {
                        // check for intersection and remove child if not complete intersection
                        const parentPolygon = verticesToJSTSPolygon(this.get2DVertices());
                        const childPolygon = verticesToJSTSPolygon(child.get2DVertices());
                        const intersectingPolygon = parentPolygon.intersection(childPolygon);
                        if (intersectingPolygon.getArea() !== childPolygon.getArea()) {
                            child.removeObject();
                            this.stage.eventManager.setWalkwayOutsideOnResizeRemoved();
                            continue;
                        }
                    }
                    if (options.tiltChanged) {
                        await child.placeObject();
                    }
                } catch (error) {
                    errors.push(error);
                }
            } else {
                console.error('ERROR: PolygonModel: Child consequence not handled for some child changeTilt');
                return Promise.reject(new Error('UndefinedChildInConsequences'));
            }
        }

        for (let i = childSubarrays.length - 1; i >= 0; i -= 1) {
            const childSubarray = childSubarrays[i];
            try {
                this.addChild(childSubarray);
                if (options.resized) {
                    // check for intersection and remove child if not complete intersection
                    const parentPolygon = verticesToJSTSPolygon(this.get2DVertices());
                    const childPolygon = verticesToJSTSPolygon(childSubarray.get2DVertices());
                    const intersectingPolygon = parentPolygon.intersection(childPolygon);
                    if (intersectingPolygon.getArea() !== childPolygon.getArea()) {
                        childSubarray.removeObject();
                        this.stage.eventManager.setSubarrayOutsideOnResizeRemoved();
                        continue;
                    }
                }
                if (options.tiltChanged) {
                    await childSubarray.placeObject();
                }
            } catch (error) {
                if (childSubarray instanceof Gazebo) {
                    childSubarray.removeObject();
                    this.stage.eventManager.setSubarrayOutsideOnResizeRemoved();
                    continue;
                }
                else errors.push(error);
            }
        }


        if (errors.length > 0) {
            console.error('ERROR: PolygonModel: handleChildrenConsequences failed', errors);
            return Promise.reject(errors);
        }

        return Promise.resolve(true);
    }

    /**
     * Returns the list of cableConduit intersecting
     * with the polygon model.
     */
    getIntersectingCablesConduit() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        const allCablesConduit = [];
        getObject(result.dcCable);
        getObject(result.acCable);
        getObject(result.conduits);
        getObject(result.singleCableTray);
        getObject(result.doubleConduit);
        getObject(result.doubleCableTray);
        getObject(result.doubleSeparateConduit);
        getObject(result.DoubleSeparateCableTray);

        function getObject(object) {
            for (let i = 0; i < object.length; i++) {
                allCablesConduit.push(object[i]);
            }
        }
        return allCablesConduit;
    }

    /**
     * Updates the cableConduit in 3d.
     * @param {* array of cableConduit} cableConduit
     */
    async updateIntersectingCablesConduit(cableConduit) {
        const polygonVertices = this.get2DVertices();
        for (let i = 0; i < cableConduit.length; i += 1) {
            if (utils.checkPolygonIntersection(polygonVertices, cableConduit[i].get2DVertices())) {
                cableConduit[i].placeObject();
            }
        }
    }

    // Visual Functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.POLYGON;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    // switchMaterialState(newMaterialState, recursive) {
    //     super.switchMaterialState(newMaterialState, recursive);
    //     if (this.stage.visualManager.getIn3D() ||
    //         newMaterialState === MATERIAL_STATES.SOLID) {
    //         for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
    //             this.edgeCentrePoints[i].hideObject();
    //         }
    //     }
    //     else if (this.isSelected || this.stage.viewManager.edgeCenterVisible) {
    //         for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
    //             this.edgeCentrePoints[i].showObject();
    //         }
    //     }
    // }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            this.parapetMesh.castShadow = true;
            if (this.coreMesh.material !== this.solidMaterial) {
                this.coreMesh.material = this.solidMaterial;
                this.coreEdges.material = this.edgesolidMaterial;
                this.parapetMesh.material = this.parapetSolidMeshMaterial;
                this.parapetEdges.material = this.edgesolidMaterial;
            }
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            this.parapetMesh.castShadow = false;
            if (this.coreMesh.material !== this.translucentMaterial2D) {
                this.coreMesh.material = this.translucentMaterial2D;
                this.coreEdges.material = this.translucentEdgeMaterial2D;
                this.parapetMesh.material = this.translucentMaterial2D;
                this.parapetEdges.material = this.translucentParapetEdgeMaterial2D;
            }
        }

        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges);
        visualUtils.updateMeshWithColor(newColors.PARAPET_COLOR, this.parapetMesh);
        visualUtils.updateMeshWithColor(newColors.PARAPET_EDGE_COLOR, this.parapetEdges);
        visualUtils.updateMeshWithColor(newColors.SETBACK_COLOR, this.setbackInsideMesh);
        visualUtils.updateMeshWithColor(newColors.SETBACK_COLOR, this.setbackOutsideMesh);

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        } else {
            this.updateOutlinePointsVisuals(newColors.EDGE_COLOR);
        }
    }

    // Helper functions

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

    get getParapetMesh() {
        if (this.isParapetPresent()) {
            return this.parapetMesh;
        }
        return null;
    }

    get mergeMeshMaterial2D() {
        return this.translucentMaterial2D;
    }

    get mergeMeshMaterial3D() {
        return this.solidMaterial;
    }

    get mergeEdgeMaterial2D() {
        return this.translucentEdgeMaterial2D;
    }

    get mergeEdgeMaterial3D() {
        return this.edgesolidMaterial;
    }
    createRotation() {
        this.coreMesh.geometry.computeBoundingSphere();
        const { center, radius } = this.coreMesh.geometry.boundingSphere;
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        // setting RotationPoint
        this.rotationPoints = new RotationPoint(
            center.x,
            center.y + radius,
            highestZ,
            this,
            this.stage,
        );
    }

    get2DVerticesOutsideSetBack() {
        return this.setbackOutsidePoints;
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

    getParapetEdges() {
        const vertices = [];
        const vertices2DArray = this.get2DVertices();
        const parapetInside2DVectorArray = utils.convertArrayToVector(utils.setbackPolygon(
            vertices2DArray, -1 * this.parapetThickness,
        ));
        for (let i = 0; i < parapetInside2DVectorArray.length; i += 1) {
            vertices.push([
                parapetInside2DVectorArray[i],
                parapetInside2DVectorArray[(i + 1) % parapetInside2DVectorArray.length],
            ]);
        }
        return vertices;
    }

    getParapet2DVertices() {
        // const vertices = [];
        const vertices2DArray = this.get2DVertices();
        const parapetInside2DVectorArray = utils.convertArrayToVector(utils.setbackPolygon(
            vertices2DArray, -1 * this.parapetThickness,
        ));
        // for (let vertex of parapetInside2DVectorArray) {
        //     vertices.push([
        //         vertex.x,
        //         vertex.y
        //     ])
        // }
        const vertices = parapetInside2DVectorArray.map(vertex => [vertex.x, vertex.y]);
        return vertices;
    }

    get2DEdgeCentres() {
        const vertices = [];
        if(!this.isObstruction){
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                vertices.push([
                    this.edgeCentrePoints[i].getPosition().x,
                    this.edgeCentrePoints[i].getPosition().y,
                ]);
            }
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
                outlinePoint.z - (this.isParapetPresent() ? this.getParapetHeight() : 0),
            ]);
        }
        return vertices;
    }

    getBaseHeight() {
        return this.baseHeight;
    }

    getHighestZ() {
        let highestZ = 0;
        const { count } = this.coreMesh.geometry.attributes.position;

        for (let i = 0; i < count; i += 1) {
            const z = this.coreMesh.geometry.attributes.position.getZ(i);

            if (z) {
                highestZ = Math.max(highestZ, z);
            }
        }
        return highestZ + this.parapetHeight;
    }

    getTopHeight() {
        return this.topHeight;
    }

    getLockedParameter() {
        return this.lockedParameter;
    }

    getCoreHeight() {
        return this.coreHeight;
    }

    getTilt() {
        return this.tilt;
    }

    getAzimuth() {
        return this.azimuth;
    }

    isIgnored() {
        return this.ignored;
    }

    getPossibleAzimuths({ isCreation } = { isCreation: false }) {
        // get the vertices in clockwise order
        const vertices = (isCreation) ?
            this.stage.drawManager.get2DVertices() : this.get2DVertices();
        if (vertices.length === 0) {
            return [];
        }
        if (utils.checkClockwise(vertices)) {
            vertices.reverse();
        }

        // getting normal for each pair
        vertices.push(vertices[0]);
        const azimuths = [];
        for (let idx = 0; idx < vertices.length - 1; idx += 1) {
            let angle = utils.toDegrees(Math.atan2(
                (vertices[idx + 1][1] - vertices[idx][1]), -(vertices[idx + 1][0] - vertices[idx][0]),
            ));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }

    getParapetHeight() {
        return this.parapetHeight;
    }

    getParapetThickness() {
        return this.parapetThickness;
    }

    isParapetPresent() {
        return this.parapetHeight !== 0 && this.parapetThickness !== 0;
    }

    getZOnTopSurface(x, y) {
        if (this.outlinePoints.length === 0) {
            console.error('ERROR: PolygonModel: has outline points null');
        }
        const v1 = this.outlinePoints[0].getPosition();
        let v2 = this.outlinePoints[1].getPosition();
        const v3 = this.outlinePoints[2].getPosition();
        if (this.isParapetPresent()) {
            v1.z -= this.parapetHeight;
            v2.z -= this.parapetHeight;
            v3.z -= this.parapetHeight;
        }
        v1.addScaledVector(v2, -1);
        v3.addScaledVector(v2, -1);
        v1.cross(v3);
        v2 = this.outlinePoints[1].getPosition();
        v2.z -= this.parapetHeight;
        const d = -1 * ((v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z));
        return -1 * ((d / v1.z) + ((v1.y * y) / v1.z) + ((v1.x * x) / v1.z));
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
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

    getInsideSetbackPolygons() {
        const polygons = [];
        if (this.setbackInsideMesh.geometry.parameters !== undefined) {
            const shape = this.setbackInsideMesh.geometry.parameters.shapes;
            polygons.push({
                vertices: shape.getPoints(),
                holeVertices: shape.getPointsHoles(),
            });
        }
        return polygons;
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

    getParapetPolygons() {
        const polygons = [];
        if (this.parapetMesh.geometry.parameters !== undefined) {
            const shape = this.parapetMesh.geometry.parameters.shapes;
            polygons.push({
                vertices: shape.getPoints(),
                holeVertices: shape.getPointsHoles().length > 0 ? shape.getPointsHoles()[0] : [],
            });
        }
        return polygons;
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

    computeArea() {
        const vertices = this.get2DVertices();
        const modVertices = vertices.map(vertex => ({
            x: vertex[0],
            y: vertex[1],
        }));
        return Math.abs(THREE.ShapeUtils.area(modVertices) / Math.cos((this.tilt * Math.PI) / 180));
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

    computePercentageAreaCoveredByPanels() {
        const modelArea = this.computeArea();
        const panelArea = this.computeAreaForPanels();
        const calculatedPercentage = ((panelArea / modelArea) * 100);
        return calculatedPercentage;
    }

    async onFillFace({ isCustom } = { isCustom: false }) {
        // Removing previous subarray
        for (let i = this.getChildren().length - 1; i >= 0; i -= 1) {
            const child = this.getChildren()[i];
            if (child instanceof Subarray) {
                child.removeObject();
            }
        }
        let subarray = null;
        let mountType = '';
        if (this.stage.getDesignSettings().drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
            mountType = SUBARRAY_RACK_STYLE_EWRACKING;
            subarray = new EastWestRack(this.stage)
        }
        else {
            mountType = this.tilt > 0 ? SUBARRAY_RACK_STYLE_FLUSH : SUBARRAY_RACK_STYLE_FIXED
            subarray = new Subarray(this.stage);
        }

        try {
            await subarray.fillFace(
                this.get3DVertices(),
                mountType, { isCustom },
                {associatedFillFaceModel : this},
            );
            return Promise.resolve(subarray);
        } catch (error) {
            console.error('ERROR: PolygonModel: onFillFace failed', error);
            return Promise.reject(error);
        }
    }

    getChildrenModelUuids(ids) {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof PolygonModel || children[i] instanceof CylinderModel) {
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

    addObjectsToDragControls() {
        this.stage.dragControls.removeAll();
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        this.stage.dragControls.add(
            this.rotationPoints,
            this.rotationPoints.moveObject.bind(this.rotationPoints),
            this.rotationPoints.placeObject.bind(this.rotationPoints),
            this.rotationPoints.handleDragStart.bind(this.rotationPoints),
            this.rotationPoints.handleDragCancel.bind(this.rotationPoints),
        );

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                    v.handleDragCancel.bind(v),
                );
            }
            if(!this.isObstruction){
                for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                    const v = this.edgeCentrePoints[i];
                    this.stage.dragControls.add(
                        v,
                        v.moveObject.bind(v),
                        v.placeObject.bind(v),
                        v.handleDragStart.bind(v),
                        v.handleDragCancel.bind(v),
                    );
                }
            }
        }
    }


    // Universal Functions

    onSelect() {
        this.rotationPoints.showObject();

        // show outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }

        // show measurements
        this.polygonMeasurement.show();
        this.polygonMeasurement.update();

        // show setbacks
        this.showSetback();

        // show edgecenters
        this.showEdgeCenters();

        // add to drag
        this.addObjectsToDragControls();

        this.isSelected = true;
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].showObject();
        }
    }

    deSelect() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }

        this.rotationPoints.hideObject();

        // hide measurements
        this.polygonMeasurement.hide();

        // hide setbacks
        this.hideSetback();

        // hide edge centers
        this.hideEdgeCenters();

        this.isSelected = false;
    }

    hideSetback() {
        this.setbackInsideMesh.visible = false;
        this.setbackOutsideMesh.visible = false;
    }

    showSetback() {
        if (this.stage.viewManager.setbackVisible) {
            this.setbackInsideMesh.visible = true;
            this.setbackOutsideMesh.visible = true;
        }
    }

    hideEdgeCenters(override = false) {
        if (!this.stage.viewManager.edgeCenterVisible || override) {
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                this.edgeCentrePoints[i].hideObject();
            }
        }
    }

    showEdgeCenters(override = false) {
        if (!this.stage.viewManager.edgeCenterVisible || override) {
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                this.edgeCentrePoints[i].showObject();
            }
        }
    }

    hideParapet() {
        this.parapetMesh.visible = false;
        this.parapetEdges.visible = false;
    }

    showParapet() {
        this.parapetMesh.visible = true;
        this.parapetEdges.visible = true;
    }

    showObject() {
        this.objectsGroup.visible = true;
        // for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
        //     this.outlinePoints[i].showObject();
        // }
        // for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
        //     this.edgeCentrePoints[i].showObject();
        // }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
        this.rotationPoints.hideObject();
    }

    showObjectLayer() {
        // In future if layers are used..  it needs to be checked if the
        // camera and model are in the same layer or not!
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
        if ((this.isSelected || this.stage.viewManager.edgeCenterVisible) &&
            !this.stage.visualManager.getIn3D()) {
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].showObject();
            }
        }
    }

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
    }

    removeObject(isTemporaryDuplicate = false) {
        // First deleting child subarray before other objects so that deleting walkways or other
        // objects don't refresh the subarray unnecessarily
        const childSubarrays = this.getChildSubarrays();
        for (let i = 0, len = childSubarrays.length; i < len; i += 1) {
            childSubarrays[i].removeObject();
        }

        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject(isTemporaryDuplicate);
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
        let prevParent = null;
        if (this.getParent() !== null) {
            prevParent = this.getParent();
            this.getParent().removeChild(this);
            if (prevParent instanceof SmartroofFace) {
                prevParent.updateRafter();
            }
            prevParent = null;
        }

        // remove measurements
        if (this.polygonMeasurement) {
            this.polygonMeasurement.remove();
        }

        // Remove outline points
        for (let j = this.outlinePoints.length - 1; j >= 0; j -= 1) {
            this.outlinePoints[j].removeObject();
            this.outlinePoints.splice(j, 1);
        }

        for (let j = 0, l = this.edgeCentrePoints.length; j < l; j += 1) {
            this.edgeCentrePoints[j].removeObject();
        }
        if (this.rotationPoints) {
            this.rotationPoints.removeObject();
        }
        this.edgeCentrePoints = [];
        this.removeRoofTexture();


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

    getPosition() {
        // get centroid of outline points
        let count = 0;
        let cumulativeX = 0;
        let cumulativeY = 0;
        let cumulativeZ = 0;
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const pointPosition = this.outlinePoints[i].getPosition();
            cumulativeX += pointPosition.x;
            cumulativeY += pointPosition.y;
            cumulativeZ += pointPosition.z;
            count += 1;
        }
        // noinspection JSValidateTypes
        return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
    }

    showMeasurement() {
        this.polygonMeasurement.show();
        this.polygonMeasurement.update();
    }

    hideMeasurement() {
        this.polygonMeasurement.hide();
    }

    static getObjectType() {
        return 'PolygonModel';
    }
}
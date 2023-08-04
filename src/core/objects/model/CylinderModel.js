import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as utils from '../../utils/utils';
import * as raycastingUtils from '../../utils/raycastingUtils';
import BaseObject from '../BaseObject';
import {
    CYLINDER_SEGMENTS,
    OUT_OF_GROUND_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    CYLINDER_WITH_NO_AREA_ERROR,
    INVALID_CORE_HEIGHT_ERROR,
    INVALID_TILT_ERROR,
    INVALID_TOP_HEIGHT_ERROR,
    TILT_LOCKED,
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    CYLINDER_PLUS_SIZE_PERCENT,
} from '../../coreConstants';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../visualConstants';
import Subarray from '../subArray/Subarray';
import OutlinePoints from '../subObjects/OutlinePoints';
import PolygonModel from './PolygonModel';
import LengthMeasurement from '../subObjects/LengthMeasurement';
import * as JSTSConverter from '../../utils/JSTSConverter';
import Walkway from './Walkway';
import SafetyLine from './SafetyLine';
import * as visualUtils from '../../utils/visualUtils';
import * as modelUtils from './modelUtils';
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
import Handrail from './Handrail';
import AcCable from './cable/AcCable';
import DcCable from './cable/DcCable';
import SmartroofFace from './smartroof/SmartroofFace';
import { getModels, getAllModelType } from '../../utils/exporters';
import { SmartroofModel } from './smartroof/SmartroofModel';
import Dormer from './smartroof/Dormer';
import RectangleObstruction from './Rectangle';
import { BufferGeometry } from 'three';
import createBufferGeometry, { createMesh } from '../../utils/meshUtils';
import NikGeometry from '../ground/NikGeometry';

const MINIMUM_NUMBER_OF_POINTS = 2;

export default class CylinderModel extends BaseObject {
    constructor(stage, isObstructionType = true) {
        super(stage);

        // standard norms
        this.stage = stage;
        this.id = this.stage.getModelId();
        this.name = 'Model #' + this.id.toString();
        this.isObstruction = isObstructionType;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // Materials
        // Translucent materials
        this.translucentMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .CYLINDER[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.translucenthMaterial2DParapet = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS
                .CYLINDER[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.translucentEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .CYLINDER[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this.translucentParapetEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        // Shadow Material-- used when sun simulation is on
        this.solidMaterial = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this.solidMaterial.defines = this.solidMaterial.defines || {};
        this.solidMaterial.defines.CUSTOM = '';
        this.parapetSolidMeshMaterial = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.parapetSolidMeshMaterial.defines = this.parapetSolidMeshMaterial.defines || {};
        this.parapetSolidMeshMaterial.defines.CUSTOM = '';
        this.edgesolidMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        this.setbackMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .SETBACK_COLOR,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
        });

        // list of outline points
        this.outlinePoints = [];

        // meshes and edges
        this.coreMesh = createMesh(createBufferGeometry(),this.translucentMaterial2D)

        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this.translucentEdgeMaterial2D,
        );
        this.parapetMesh = createMesh(createBufferGeometry(),this.translucenthMaterial2DParapet)
        this.parapetEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.parapetMesh.geometry),
            this.translucentParapetEdgeMaterial2D,
        );
        this.setbackInsideMesh = createMesh(createBufferGeometry(),this.setbackMaterial2D)
        this.setbackOutsideMesh = createMesh(createBufferGeometry(),this.setbackMaterial2D)
        


        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;
        this.parapetMesh.castShadow = true;
        this.parapetMesh.receiveShadow = true;

        this.setbackInsideMesh.visible = false;
        this.setbackOutsideMesh.visible = false;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);
        this.objectsGroup.add(this.parapetMesh);
        this.objectsGroup.add(this.parapetEdges);
        this.objectsGroup.add(this.setbackInsideMesh);
        this.objectsGroup.add(this.setbackOutsideMesh);

        // cylinder model properties
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
        this.obstruction = defaultValues.obstruction;
        this.topHeight = defaultValues.topHeight;
        this.lockedParameter = defaultValues.lockedParameter;
        this.previousIntersectingCableConduit = [];

        // TODO: Add type when adding templates

        // cylinder measurement
        this.polygonMeasurement = null;

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        const imageUrl = this.stage.getGroundImage().url;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "Anonymous";
        this.imgTexture = textureLoader.load(imageUrl);

        this.roofTextureGeometry = new THREE.BufferGeometry();
        this.roofTextureMesh = new THREE.Mesh(
            new THREE.BufferGeometry(),
            this.translucentMaterial2D,
        );

        this.updateVisualsAfterLoadingAndCreation();
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

    getState() {
        const cylinderData = {
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
            obstruction: this.obstruction,
            // saving outline points
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return cylinderData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            // load id and name
            this.id = state.id;
            this.name = state.name;

            // load cylinder properties
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
                this.outlinePoints = state.outlinePoints.map(outlinePoint =>
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage
                    )
                );

                // create cylinder measurement
                this.polygonMeasurement = new LengthMeasurement(this.outlinePoints[0], this.outlinePoints[1], this.stage, this, 0);
            } else {
                // update outline points
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error('CylinderModel: loadState: outlinePoints length don\'t match');
                    return null;
                }
                for (let idx = 0; idx < this.outlinePoints.length; idx++) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2]
                    );
                }
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {

                // update polygon measurement
                this.polygonMeasurement.show();
                this.polygonMeasurement.update();

            }

            // update geometry
            this.updateGeometry();
            // updating the rafters when we do undo redo if the current parent is smartroofface
            if (this.getParent() instanceof SmartroofFace) {
                this.getParent().updateRafter();
            }
            // update the rafters of the previous parent if it's a sface
            if (prevParent && prevParent instanceof SmartroofFace) prevParent.updateRafter();
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
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        // remove measurements
        this.polygonMeasurement.remove();
    }

    exportAsSTL() {
        const { coreMesh } = this;
        const { parapetMesh } = this;
        coreMesh.updateMatrix(); // as needed
        parapetMesh.updateMatrix(); // as needed
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

        const mesh = new THREE.Mesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: COLOR_MAPPINGS
                    .CYLINDER[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
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
        let cylinderModelData = {
            type: CylinderModel.getObjectType(),
            children: []
        };

        // save id and name
        cylinderModelData.id = this.id;
        cylinderModelData.name = this.name;
        if (isCopy) {
            cylinderModelData.uuid = this.uuid;
        }

        // save cylinder properties
        cylinderModelData.baseHeight = this.baseHeight;
        cylinderModelData.coreHeight = this.coreHeight;
        cylinderModelData.parapetHeight = this.parapetHeight;
        cylinderModelData.parapetThickness = this.parapetThickness;
        cylinderModelData.tilt = this.tilt;
        cylinderModelData.lockedParameter = this.lockedParameter;
        cylinderModelData.topHeight = this.topHeight;
        cylinderModelData.azimuth = this.azimuth;
        cylinderModelData.setbackInside = this.setbackInside;
        cylinderModelData.setbackOutside = this.setbackOutside;
        cylinderModelData.ignored = this.ignored;
        cylinderModelData.placable = this.placable;
        cylinderModelData.obstruction = this.obstruction;
        cylinderModelData.isObstruction = this.isObstruction;
        if (this.isObstruction) cylinderModelData.flushType = this.flushType;

        // saving outline points
        let outlinePoints = [];
        for (let outlinePoint of this.outlinePoints) {
            outlinePoints.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ])
        }
        cylinderModelData.outlinePoints = outlinePoints;

        // saving children
        for (let child of this.getChildren()) {
            cylinderModelData.children.push(child.saveObject());
        }

        return cylinderModelData;
    }

    validateObject(cylinderModelData) {
        let allOutlinePointsZero = true;
        for (let i = 0, len = cylinderModelData.outlinePoints.length; i < len; i += 1) {
            if (!(cylinderModelData.outlinePoints[i][0] === 0 &&
                    cylinderModelData.outlinePoints[i][1] === 0 &&
                    cylinderModelData.outlinePoints[i][2] === 0)) {
                allOutlinePointsZero = false;
                break;
            }
        }
        if (allOutlinePointsZero) {
            return { isValid: false };
        }

        if (cylinderModelData.lockedParameter === undefined) {
            cylinderModelData.lockedParameter = TOP_HEIGHT_LOCKED;
        }

        if (cylinderModelData.topHeight === undefined) {
            const vertices = [];
            for (let i = 0; i < cylinderModelData.outlinePoints.length; i += 1) {
                const outlinePoint = cylinderModelData.outlinePoints[i];
                vertices.push(new THREE.Vector3(outlinePoint[0], outlinePoint[1], outlinePoint[2]));
            }
            const params = {
                coreHeight: cylinderModelData.coreHeight,
                tilt: cylinderModelData.tilt,
                lockedParameter: cylinderModelData.lockedParameter,
                azimuth: cylinderModelData.azimuth,
                vertices: utils.convertArrayToVector(this.get2DVertices(vertices)),
            };
            cylinderModelData.topHeight = this.computeTiltAndHeights(params).topHeight;
        }

        return { isValid: true };
    }

    loadObject(cylinderModelData, isPaste = false) {
        if (!this.validateObject(cylinderModelData).isValid) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }

            this.stage.eventManager
                .customErrorMessage('Cylinder data invalid: Cylinder removed');
            return;
        }

        // load id and name
        if (!isPaste) {
            this.id = cylinderModelData.id;
            this.name = cylinderModelData.name;
        }

        // load cylinder properties
        this.baseHeight = cylinderModelData.baseHeight;
        this.coreHeight = cylinderModelData.coreHeight;
        this.parapetHeight = cylinderModelData.parapetHeight;
        this.parapetThickness = cylinderModelData.parapetThickness;
        this.tilt = cylinderModelData.tilt;
        this.azimuth = cylinderModelData.azimuth;
        this.setbackInside = cylinderModelData.setbackInside;
        this.setbackOutside = cylinderModelData.setbackOutside;
        this.ignored = cylinderModelData.ignored;
        this.placable = cylinderModelData.placable;
        this.obstruction = cylinderModelData.obstruction;
        this.lockedParameter = cylinderModelData.lockedParameter;
        this.topHeight = cylinderModelData.topHeight;

        this.isObstruction  = cylinderModelData.isObstruction;
        if (this.isObstruction) {
            this.setbackInside = null;
            this.flushType = cylinderModelData.flushType;
        }

        for (let i = 0; i < cylinderModelData.outlinePoints.length; i += 1) {
            const outlinePoint = cylinderModelData.outlinePoints[i];
            this.outlinePoints.push(new OutlinePoints(
                outlinePoint[0],
                outlinePoint[1],
                outlinePoint[2],
                this,
                this.stage,
            ));
        }

        // create cylinder measurement
        this.polygonMeasurement = new LengthMeasurement(this.outlinePoints[0], this.outlinePoints[1], this.stage, this, 0);

        // update geometry
        this.updateGeometry();

        // load children
        const { children } = cylinderModelData;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i].type === PolygonModel.getObjectType()) {
                const polygonModel = new PolygonModel(this.stage);
                this.addChild(polygonModel);
                polygonModel.loadObject(children[i], isPaste);
                if (polygonModel.getParent() !== this) {
                    console.error('CylinderModel: Mismatch in parent while loading CylinderModel');
                }
            } else if (children[i].type === RectangleObstruction.getObjectType()) {
                const rectangleObstruction = new RectangleObstruction(this.stage);
                this.addChild(rectangleObstruction);
                rectangleObstruction.loadObject(children[i], isPaste);
                if (rectangleObstruction.getParent() !== this) {
                    console.error('CylinderModel: Mismatch in parent while loading CylinderModel');
                }
            } else if (children[i].type === CylinderModel.getObjectType()) {
                const cylinderModel = new CylinderModel(this.stage);
                this.addChild(cylinderModel);
                cylinderModel.loadObject(children[i], isPaste);
                if (cylinderModel.getParent() !== this) {
                    console.error('CylinderModel: Mismatch in parent while loading CylinderModel');
                }
            } else if (children[i].type === Tree.getObjectType()) {
                const tree = new Tree(this.stage);
                this.addChild(tree);
                tree.loadObject(children[i], isPaste);
                if (tree.getParent() !== this) {
                    console.error('CylinderModel: Mismatch in parent while loading CylinderModel');
                }
            } else if (children[i].type === Inverter.getObjectType()) {
                if (!isPaste) {
                    const inverter = new Inverter(this.stage);
                    this.addChild(inverter);
                    inverter.loadObject(children[i], isPaste);
                    if (inverter.getParent() !== this) {
                        console.error('CylinderModel: Mismatch in parent while loading Inverter');
                    }
                }
            }
            //combiner box
            else if (children[i].type === ACDB.getObjectType()) {
                try {
                    const acdb = new ACDB(this.stage);
                    this.addChild(acdb);
                    acdb.loadObject(children[i], isPaste);
                    if (acdb.getParent() !== this) {
                        console.error('CylinderModel: Mismatch in parent while loading ACDB');
                    }
                } catch (error) {
                    console.error('CylinderModel.js: error in loading ACdb', error);
                }
                // TODO: not a fix for loading later on and then adding the electrical connection
                // this.stage.ground.allAcdbs.push({data:children[i], acdb:acdb, isPaste:false});
            } else if (children[i].type === DCDB.getObjectType()) {
                if (!isPaste) {
                    try {
                        const dcdb = new DCDB(this.stage);
                        this.addChild(dcdb);
                        dcdb.loadObject(children[i], isPaste);
                        if (dcdb.getParent() !== this) {
                            console.error('CylinderModel: Mismatch in parent while loading DCDB');
                        }
                    } catch (error) {
                        console.error('CylinderModel.js: error in loading dcdb', error);
                    }

                }
            } else if (children[i].type === Subarray.getObjectType()) {
                const subarray = new Subarray(this.stage);
                subarray.loadObject(children[i], this, isPaste);
            } else if (children[i].type === Walkway.getObjectType()) {
                const walkway = new Walkway(this.stage);
                this.addChild(walkway);
                walkway.loadObject(children[i], isPaste);
            } else if (children[i].type === SafetyLine.getObjectType()) {
                const safetyLine = new SafetyLine(this.stage);
                this.addChild(safetyLine);
                safetyLine.loadObject(children[i], isPaste);
            } else if (children[i].type === Handrail.getObjectType()) {
                const handrail = new Handrail(this.stage);
                this.addChild(handrail);
                handrail.loadObject(children[i], isPaste);
            } else if (children[i].type === AcCable.getObjectType()) {
                try {
                    const acCable = new AcCable(this.stage);
                    this.addChild(acCable);
                    acCable.loadObject(children[i], isPaste);
                } catch (error) {
                    console.error('CylinderModel.js: error in loading AC cable', error);
                }
            } else if (children[i].type === DcCable.getObjectType()) {
                const dcCable = new DcCable(this.stage);
                this.addChild(dcCable);
                // this.stage.ground.allCables.push({data:children[i], cable:dcCable, isPaste:isPaste});
            } else if (children[i].type === Conduit.getObjectType()) {
                const conduit = new Conduit(this.stage);
                this.addChild(conduit);
                conduit.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(conduit);
            } else if (children[i].type === DoubleConduit.getObjectType()) {
                const doubleConduit = new DoubleConduit(this.stage);
                this.addChild(doubleConduit);
                doubleConduit.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(doubleConduit);
            } else if (children[i].type === DoubleSeparateConduit.getObjectType()) {
                const doubleSeparateConduit = new DoubleSeparateConduit(this.stage);
                this.addChild(doubleSeparateConduit);
                doubleSeparateConduit.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(doubleSeparateConduit);
            } else if (children[i].type === SingleCableTray.getObjectType()) {
                const singleCableTray = new SingleCableTray(this.stage);
                this.addChild(singleCableTray);
                singleCableTray.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(singleCableTray);
            } else if (children[i].type === DoubleCableTray.getObjectType()) {
                const doubleCableTray = new DoubleCableTray(this.stage);
                this.addChild(doubleCableTray);
                doubleCableTray.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(doubleCableTray);
            } else if (children[i].type === DoubleSeparateCableTray.getObjectType()) {
                const doubleSeparateCableTray = new DoubleSeparateCableTray(this.stage);
                this.addChild(doubleSeparateCableTray);
                doubleSeparateCableTray.loadObject(children[i], isPaste);
                this.allConduitAndCabletary.push(doubleSeparateCableTray);
            } else {
                console.error('CylinderModel: Invalid object type in loadObject');
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
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

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

        this.polygonMeasurement = new LengthMeasurement(
            this.outlinePoints[0],
            this.outlinePoints[1],
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

        let notificationObject = this.stage.eventManager.setCylinderModelCreating();

        // getting vertices from buffer geometry
        let vertices = [];
        for (let i = 0; i < geometry.noOfVertices; i++) {
            vertices.push(
                new THREE.Vector3(
                    geometry.attributes.position.array[i * 3],
                    geometry.attributes.position.array[i * 3 + 1],
                    geometry.attributes.position.array[i * 3 + 2],
                )
            )
        }

        // set outline points
        for (let vertex of vertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    vertex.x,
                    vertex.y,
                    vertex.z,
                    this,
                    this.stage
                )
            );
        }
        if (this.computeArea() > this.getDefaultValues().heatMapThreshold) {
            this.placable = true;
        }
        else {
            this.placable = false;
        }

        // create cylinder measurement
        this.polygonMeasurement = new LengthMeasurement(this.outlinePoints[0], this.outlinePoints[1], this.stage, this, 0);

        try {
            await this.placeObject();
            this.stage.eventManager.completeCylinderModelCreation(notificationObject);
            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: CylinderModel: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorCylinderModelCreation(notificationObject);
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


    // Geometry functions

    // Takes 4 inputs, azimuth, locked parameter and any two of top height, tilt and core height
    computeTiltAndHeights(params) {
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
        if (params.parent !== null && params.parent !== undefined) {
            ({ parent } = params);
        } else {
            parent = this.getParent();
        }

        if (parent === null || parent === undefined) {
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
        if (params.vertices === undefined) {
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
                console.error(`ERROR: CylinderModel: computeTiltAndHeights failed -
                Incorrect locked parameter ${lockedParameter}`);
        }
        return response;
    }

    updateGeometry() {

        let circleVertices = this.get2DVertices();
        const vertices2DVectorArray = utils.convertArrayTo3DVector(circleVertices);

        // create core
        const cylinderGeometry = new NikGeometry(this.stage);
        const coreGeometry = cylinderGeometry.createFromPoints(vertices2DVectorArray, this.coreHeight);

        coreGeometry.translate(0, 0, this.baseHeight);

        if (this.stage.selectionControls.getSelectedObjects().includes(this)) {
            this.showMeasurement();
        }

        let setbackInsideGeometry = new THREE.BufferGeometry();
        let setbackOutsideGeometry = new THREE.BufferGeometry();


        // updating outline points height
        let outlinePointHeightConstant = this.baseHeight + this.coreHeight;
        if (this.isParapetPresent()) {
            outlinePointHeightConstant += this.parapetHeight;
        }
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.moveObjectWithoutConsequences(0, 0, outlinePointHeightConstant - outlinePoint.getPosition().z);
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

            // updating outline points height to accommodate for the tilt

            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const v = this.outlinePoints[i].getPosition();
                const outlinePointDeltaZ = ((-1 * ((a2 * v.x) + (b2 * v.y) + d2)) / c2) +
                    (this.outlinePoints[i].getPosition().z);
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, outlinePointDeltaZ);
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

            cylinderGeometry.createFromTopAndBottomPoints(topPoints, bottomPoints);
        } else {
            if(!this.isObstruction){
                setbackInsideGeometry = this.getSetbackInsideGeometry();
            }
            setbackOutsideGeometry = this.getSetbackOutsideGeometry();
        }

        // updating meshes and edges
        this.coreMesh.geometry = coreGeometry;
        // this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry)
        //     .merge(modelUtils.getPlusBufferGeometry(
        //         this.getPosition(),
        //         this.cylinderRadius * (CYLINDER_PLUS_SIZE_PERCENT / 100),
        //         -0.01,
        //         this.getTilt() > 0 ? this.getZOnTopSurface.bind(this) : undefined,
        //     ));
        let plusGeometryHeightFactor;
        if (this.getTilt() > 0 || (this.getParent() && this.getParent().getTilt() > 0))
            plusGeometryHeightFactor = this.getZOnTopSurface.bind(this);
        else
            plusGeometryHeightFactor = undefined;
        const geometry = [modelUtils.getPlusBufferGeometry(
            this.getPosition(),
            this.cylinderRadius * (CYLINDER_PLUS_SIZE_PERCENT / 100), -0.01,
            plusGeometryHeightFactor,
        ), new THREE.EdgesGeometry(coreGeometry)];
        this.coreEdges.geometry = BufferGeometryUtils.mergeGeometries(geometry);
        this.setbackInsideMesh.geometry = setbackInsideGeometry;
        this.setbackOutsideMesh.geometry = setbackOutsideGeometry;

        // To resolve Z fighting
        this.setbackInsideMesh.position.z = 0.01;
        this.setbackOutsideMesh.position.z = 0.01;

        // update measurement
        this.polygonMeasurement.update();
    }

    getSetbackInsideGeometry(array3DVertices) {
        // create setbackInside
        let circleVertices = this.get2DVertices();
        let vertices2DVectorArray = utils.convertArrayToVector(circleVertices);
        let setbackInsideGeometry = new THREE.BufferGeometry()
        if (this.setbackInside) {
            let setbackInside3DPoints = utils.getSetbackPoints(array3DVertices, -1 * (this.setbackInside +
                (this.isParapetPresent() ? this.parapetThickness : 0)));
            let setbackInsidePoints = utils.convertVectorArrayTo2DArray(setbackInside3DPoints);
            const setbackInside2DVectorArray = utils.convertArrayToVector(setbackInsidePoints);

            const setbackInsideShape = new THREE.Shape(vertices2DVectorArray);
            if (setbackInside2DVectorArray.length > 2) {
                setbackInsideShape.holes = [new THREE.Path(setbackInside2DVectorArray)];
            }

            setbackInsideGeometry = new THREE.ShapeGeometry(setbackInsideShape);
            setbackInsideGeometry.translate(0, 0, this.baseHeight + this.coreHeight);
        }

        return setbackInsideGeometry;
    }

    getSetbackOutsideGeometry() {
        // create setbackOutside
        let setbackOutsideGeometry = new THREE.BufferGeometry();
        let setbackOutsideShapes = [];

        if (this.setbackOutside && this.getParent()) {
            let innerPolygonPoints = this.get2DVertices();
            let base3DVerticesArray = [];
            for (let point of innerPolygonPoints) {
                if (this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel) {
                    base3DVerticesArray.push([point[0], point[1], this.getParent().getZOnTopSurface(point[0], point[1])]);
                } else {
                    base3DVerticesArray.push([point[0], point[1], 0]);
                }
            }
            let setbackOutside3DPoints = utils.getSetbackPoints(base3DVerticesArray, this.setbackOutside);
            let setbackOutsidePoints = utils.convertVectorArrayTo2DArray(setbackOutside3DPoints);
            let parentPolygonPoints = this.parent.get2DVertices();
            let setbackVertices = utils.outsideSetbackIntersectionWithParent(setbackOutsidePoints, innerPolygonPoints, parentPolygonPoints);
            if (setbackVertices instanceof Error) {
                if (setbackVertices.message === PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR) {
                    return new THREE.BufferGeometry();
                }
            }

            for (let i = 0; i < setbackVertices[0].length; i++) {
                if (setbackVertices[0][i].length > 0) {
                    let setbackOutsideShape = new THREE.Shape(utils.convertArrayToVector(setbackVertices[0][i]));

                    let holesInShape = [];
                    for (let j = 0; j < setbackVertices[1][i].length; j++) {
                        let hole = new THREE.Path(utils.convertArrayToVector(setbackVertices[1][i][j]));
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

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.baseHeight += deltaZ;
        this.roofTextureGeometry.translate(0, 0, deltaZ);

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
        for (let v of this.outlinePoints) {
            v.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        // TODO this will not work in multy select
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.polygonMeasurement.update();
        }
        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        // update children
        for (let child of this.getChildren()) {
            child.moveObject(deltaX, deltaY, deltaZ);
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
    getPlacingInformation(drawingVertices) {
        let parentExists = true;

        const response = {};
        response.pointUnplaceableError = null;
        response.errors = [];

        // Getting vertices
        const vertices2DArray = this.get2DVertices(drawingVertices);

        if (!raycastingUtils.areVerticesOnGround(vertices2DArray, this.stage)) {
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

        if (parentExists) {
            // using raycaster to get the top most model in new place
            // and get height of it for deltaZ
            // but ignoring this model or its child as we don't want to place over them
            const idsToIgnore = [this.uuid];
            this.getChildrenModelUuids(idsToIgnore);

            // To accommodate for snapping
            const erodedVertices = utils.setbackPolygon(
                vertices2DArray, -0.001,
            );
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

                const tiltAndHeightParams = {
                    coreHeight: this.coreHeight,
                    topHeight: this.topHeight,
                    tilt: this.tilt,
                    azimuth: this.azimuth,
                    lockedParameter: this.lockedParameter,
                    parent: newParent,
                    vertices: utils.convertArrayToVector(vertices2DArray),
                };

                response.tiltAndHeights = this.computeTiltAndHeights(tiltAndHeightParams);

                if (response.tiltAndHeights.coreHeight <= 0) {
                    const error = new Error(INVALID_CORE_HEIGHT_ERROR);
                    response.errors.push(error);
                    parentExists = false;
                    response.pointUnplaceableError = error;
                }

                if (response.tiltAndHeights.topHeight <= 0) {
                    const error = new Error(INVALID_TOP_HEIGHT_ERROR);
                    response.errors.push(error);
                    parentExists = false;
                    response.cannotCompleteError = error;
                }

                if (response.tiltAndHeights.tilt < 0 || response.tiltAndHeights.tilt === null) {
                    const error = new Error(INVALID_TILT_ERROR);
                    response.errors.push(error);
                    parentExists = false;
                    response.pointUnplaceableError = error;
                }
            } else {
                response.errors.push(new Error(CYLINDER_WITH_NO_AREA_ERROR));
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
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setCylinderModelOutOfGroundRemoved();
            } else if (error.message === INVALID_CORE_HEIGHT_ERROR) {
                this.stage.eventManager.invalidCoreHeightErrorForCylinder();
            } else if (error.message === INVALID_TILT_ERROR) {
                this.stage.eventManager.invalidTiltErrorForCylinder();
            }
            this.removeObject();
            return Promise.reject(error);
        }
        const newParent = placingInformation.parent;
        const newHeight = placingInformation.height;

        // update new parent
        this.changeParent(newParent);

        // update new base height
        this.baseHeight = newHeight;

        let oldHeight;
        if (this.getChildren().length !== 0) {
            oldHeight = this.getZOnTopSurface(...this.get2DVertices()[0]);
        }

        this.updateGeometry();

        // update dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        // Update locked parameter
        this.updateCurrentlyLockedParameter(placingInformation.tiltAndHeights);

        // update children
        if (this.getChildren().length !== 0) {
            const deltaZ = this.getZOnTopSurface(...this.get2DVertices()[0]) - oldHeight;
            for (let child of this.getChildren()) {
                child.moveObject(0, 0, deltaZ);
                // TODO: Jugaad, fix for moveObject of safety line
                if (child instanceof SafetyLine) {
                    child.update3DSafetyLine();
                }
                if (child instanceof Handrail) {
                    child.update3DHandrail();
                }
            }
        }

        // update siblings
        try {
            await this.handleSiblingConsequences();
            // remove object from hover manager and add it again
            this.stage.quadTreeManager.handlePlaceObject(this);

            this.resetGrandParentSolarAccess();
            this.stage.heatMap.removeHeatMapOnModelPlace();
            if (this.getParent() instanceof SmartroofFace) {
                // update rafter of prev parent
                this.getParent().getParent().updateRafter();
            }
            // Saving state after the object is placed
            this.saveState();
        } catch (error) {
            console.error('ERROR: CylinderModel: placeObject failed', error);
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

    async handleDragEnd() {
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        let notificationObject = this.stage.eventManager.setPolygonModelLoading();

        if (this.stage.viewManager.setbackVisible) {
            this.setbackOutsideMesh.visible = true;
        }
        try {
            await this.placeObject();
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
        this.previousIntersectingCableConduit = this.getIntersectingCablesConduit();
        return;
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: CylinderModel: vertex not in outlinePoints in handleVertexMove');
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: CylinderModel: vertex not in outlinePoints in handleVertexPlace');
        }

        let notificationObject = this.stage.eventManager.setCylinderModelLoading();
        this.updateIntersectingCablesConduit(this.previousIntersectingCableConduit);
        this.previousIntersectingCableConduit = [];

        try {
            // place object
            await this.placeObject();

            // place its children if top surface changed, i.e., the model is tilted
            await this.handleChildrenConsequences({
                resized: true,
                tiltChanged: this.getTilt() !== 0
            });

            // remove dimensions if not over edge and update after resize
            for (let dimension in this.dimensionObjects) {
                this.dimensionObjects[dimension].handleAssociatedObjectUpdateGeometry(this);
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);

            // to update the mesh in the scene
            this.stage.mergeManager.mergeScene(this);

            this.stage.eventManager.completeCylinderModelLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        } catch (error) {
            console.error('ERROR: CylinderModel: handleVertexPlace failed', error);

            this.stage.eventManager.completeCylinderModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    handleOnCancel() {
        // to avoid errors while deselecting length measurement text object
    }

    // Properties Update functions
    getDefaultValues() {
        const cylinderDrawingDefaults =
            this.stage.getDesignSettings().drawing_defaults.cylinderModel;
        if(this.isObstruction) {
            cylinderDrawingDefaults.parapetHeight = 0.00;
            cylinderDrawingDefaults.parapetThickness = 0.001;
        }
        return {
            coreHeight: cylinderDrawingDefaults.coreHeight,
            parapetHeight: cylinderDrawingDefaults.parapetHeight,
            parapetThickness: cylinderDrawingDefaults.parapetThickness,
            tilt: cylinderDrawingDefaults.tilt,
            azimuth: cylinderDrawingDefaults.azimuth,
            setbackInside: cylinderDrawingDefaults.setbackInside,
            setbackOutside: cylinderDrawingDefaults.setbackOutside,
            ignored: cylinderDrawingDefaults.ignored,
            placable: cylinderDrawingDefaults.placable,
            heatMapThreshold: cylinderDrawingDefaults.heatMapThreshold,
            topHeight: cylinderDrawingDefaults.topHeight,
            lockedParameter: cylinderDrawingDefaults.lockedParameter,
            obstruction: cylinderDrawingDefaults.obstruction,
        };
    }

    changePropertiesDuringCreation(properties) {
        if (properties.hasOwnProperty('name') &&
            properties.name !== this.name) {
            this.name = properties.name;
        }
        if (properties.hasOwnProperty('baseHeight') &&
            properties.baseHeight !== this.baseHeight) {
            this.baseHeight = properties.baseHeight;
        }
        if (properties.hasOwnProperty('coreHeight') &&
            properties.coreHeight !== this.coreHeight) {
            this.coreHeight = properties.coreHeight;
        }
        if (properties.hasOwnProperty('parapetHeight') &&
            properties.parapetHeight !== this.parapetHeight) {
            this.parapetHeight = properties.parapetHeight;
        }
        if (properties.hasOwnProperty('parapetThickness') &&
            properties.parapetThickness !== this.parapetThickness) {
            this.parapetThickness = properties.parapetThickness;
        }
        if (properties.hasOwnProperty('tilt') &&
            properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (properties.hasOwnProperty('lockedParameter') &&
            properties.lockedParameter !== this.lockedParameter) {
            this.lockedParameter = properties.lockedParameter;
        }
        if (properties.hasOwnProperty('topHeight') && this.topHeight !== properties.topHeight) {
            this.topHeight = properties.topHeight;
        }
        if (properties.hasOwnProperty('azimuth') &&
            properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (properties.hasOwnProperty('setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            this.setbackInside = properties.setbackInside;
        }
        if (properties.hasOwnProperty('setbackOutside') &&
            properties.setbackOutside !== this.setbackOutside) {
            this.setbackOutside = properties.setbackOutside;
        }
        if (properties.hasOwnProperty('ignored') &&
            properties.ignored !== this.ignored) {
            this.ignored = properties.ignored;
        }
        if (properties.hasOwnProperty('placable') &&
            properties.placable !== this.placable) {
            this.placable = properties.placable;
        }
        if (properties.hasOwnProperty('obstruction') &&
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
                console.error(`ERROR: CylinderModel: getCurrentlyLockedParameter failed -
                Invalid locked parameter`);
                return null;
        }
    }

    async updateObject(properties) {
        let updateGeometryRequired = false;
        let handleChildrenRequired = false;
        let handleSiblingsRequired = false;
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
        if (Object.prototype.hasOwnProperty.call(properties, 'baseHeight') &&
            properties.baseHeight !== this.baseHeight) {
            this.moveObject(0, 0, properties.baseHeight - this.baseHeight);
            this.stage.lightsManager.setShadowMapParameters();
            this.resetGrandParentSolarAccess();
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'parapetHeight') &&
            properties.parapetHeight !== this.parapetHeight) {
            updateGeometryRequired = updateGeometryRequired || true;
            handleChildrenRequired = true;
            options.parapetHeightChanged = true;
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
            handleChildrenRequired = true;
            this.azimuth = properties.azimuth;
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
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackInside') &&
            properties.setbackInside !== this.setbackInside) {
            updateGeometryRequired = updateGeometryRequired || true;
            this.setbackInside = properties.setbackInside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'setbackOutside') &&
            properties.setbackOutside !== this.setbackOutside) {
            updateGeometryRequired = updateGeometryRequired || true;
            this.setbackOutside = properties.setbackOutside;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'obstruction') &&
            properties.obstruction !== this.obstruction) {
            updateGeometryRequired = updateGeometryRequired || true;
            this.obstruction = properties.obstruction;
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

        if (updateGeometryRequired) {
            try {
                this.handlePropertiesUpdate(options);
            } catch (error) {
                console.error('ERROR: CylinderModel: Update failed', error);
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
                });
                this.stage.eventManager.completePolygonModelLoading(notificationObject);
            } catch (error) {
                console.error('ERROR: CylinderModel: changeTilt failed', error);
                this.stage.eventManager.completePolygonModelLoading(notificationObject);
            }
        }
        this.saveState();
        return Promise.resolve(true);
    }

    handlePropertiesUpdate(options) {
        this.updateGeometry();

        if (options.heightChanged) {
            const deltaZ = this.coreHeight - options.prevHeight;
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
            console.error('ERROR: CylinderModel: handleSiblingConsequences failed', error);
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

        options.resized = options.hasOwnProperty('resized') ? options.resized : false;
        options.tiltChanged = options.hasOwnProperty('tiltChanged') ? options.tiltChanged : false;

        // TODO:
        // options.setbackInsideChanged = options.hasOwnProperty('setbackInsideChanged') ? options.setbackInsideChanged : false;

        // First remove the parent child link between this and child subarrays so that place for polygon, cylinder or
        // walkways not cause update for subarray repeatedly (and later link it back and call update for it)
        let childSubarrays = this.getChildSubarrays();
        for (let childSubarray of childSubarrays) {
            this.removeChild(childSubarray);
        }

        let errors = [];
        for (let i = this.getChildren().length - 1; i >= 0; i--) {
            let child = this.getChildren()[i];
            if (child instanceof PolygonModel ||
                child instanceof CylinderModel ||
                child instanceof Tree ||
                child instanceof Inverter ||
                child instanceof DCDB ||
                child instanceof ACDB) {
                try {
                    if (options.resized) {
                        // check for intersection and remove child if no intersection
                        let parentPolygon = JSTSConverter.verticesToJSTSPolygon(this.get2DVertices());
                        let childPolygon = JSTSConverter.verticesToJSTSPolygon(child.get2DVertices());
                        let intersectingPolygon = parentPolygon.intersection(childPolygon);
                        if (intersectingPolygon.getArea() === 0) {
                            child.removeObject();
                            this.stage.eventManager.setCylinderModelOutsideOnResizeRemoved();
                            continue;
                        }
                    }
                    if (options.tiltChanged) {
                        await child.placeObject();
                    }
                } catch (error) {
                    errors.push(error);
                }
            } else if (child instanceof Walkway || child instanceof Handrail) {
                try {
                    if (options.resized) {
                        // check for intersection and remove child if not complete intersection
                        let parentPolygon = JSTSConverter.verticesToJSTSPolygon(this.get2DVertices());
                        let childPolygon = JSTSConverter.verticesToJSTSPolygon(child.get2DVertices());
                        let intersectingPolygon = parentPolygon.intersection(childPolygon);
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
                console.error("ERROR: CylinderModel: Child consequence not handled for some child changeTilt");
                return Promise.reject(new Error('UndefinedChildInConsequences'));
            }
        }

        for (let i = childSubarrays.length - 1; i >= 0; i--) {
            let childSubarray = childSubarrays[i];
            try {
                this.addChild(childSubarray);
                if (options.resized) {
                    // check for intersection and remove child if not complete intersection
                    let parentPolygon = JSTSConverter.verticesToJSTSPolygon(this.get2DVertices());
                    let childPolygon = JSTSConverter.verticesToJSTSPolygon(childSubarray.get2DVertices());
                    let intersectingPolygon = parentPolygon.intersection(childPolygon);
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
                errors.push(error);
            }
        }

        if (errors.length > 0) {
            console.error('ERROR: CylinderModel: handleChildrenConsequences failed', errors);
            return Promise.reject(errors);
        }

        return Promise.resolve(true);

    }


    // Helper functions

    get numVertices() {
        return CYLINDER_SEGMENTS;
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

    get cylinderRadius() {
        // instead of making this getter we can set it up on update and store it as a variable.
        let vertices2DArray = this.get2DOutlineVertices();
        let circlePoints = utils.convertArrayToVector(vertices2DArray);
        let centerPoint = circlePoints[0];
        let radialPoint = circlePoints[1];

        return centerPoint.distanceTo(radialPoint);
    }

    get2DOutlineVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            vertices.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y
            ])
        }
        return vertices;
    }

    // TODO: incorporate approx logic from 2 functions below heere as well/
    // Do this same for is place object possible
    get2DVertices(drawingVertices) {
        let centerPoint;
        let cylinderRadius;
        // returns the circle vertices parallel to the xy plane
        const circleVertices = [];
        if (drawingVertices === null || drawingVertices === undefined) {
            centerPoint = this.outlinePoints[0].getPosition();
            ({ cylinderRadius } = this);
        } else if (drawingVertices.length < MINIMUM_NUMBER_OF_POINTS) {
            return utils.convertArrayToVector(drawingVertices);
        } else {
            const vectorVertices = utils.convertArrayToVector(drawingVertices);
            cylinderRadius = vectorVertices[0].distanceTo(vectorVertices[1]);
            [centerPoint] = vectorVertices;
        }

        for (let i = 0; i < this.numVertices; i += 1) {
            const theta = ((i % this.numVertices) / this.numVertices) * Math.PI * 2;
            circleVertices.push([
                centerPoint.x + (Math.cos(theta) * cylinderRadius),
                centerPoint.y + (Math.sin(theta) * cylinderRadius),
            ]);
        }

        return circleVertices;
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

    get3DOutlineVertices() {
        let vertices = [];
        for (let outlinePoint of this.outlinePoints) {
            vertices.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z - (this.isParapetPresent() ? this.getParapetHeight() : 0)
            ])
        }
        return vertices;
    }

    convertPostionArrayToVector(array) { 
        let converted = [];
        for(let i = 0; i < array.length; i += 3) {
           converted.push(new THREE.Vector3(array[i], array[i+1], array[i+2])) 
        }
        return converted
    }

    get3DVertices(coreGeometry = null, { approximate } = { approximate: false }) {
        let circleVertices = this.get2DVertices();
        const topPoints = [];
        for (let i = 0; i < circleVertices.length; i += 1) {
            const topPoint = circleVertices[i];
            const z = this.getZOnTopSurface(topPoint[0], topPoint[1]);
            topPoints.push([topPoint[0], topPoint[1], z]);
        }
        return topPoints;

    }

    getTopPlane() {
        const vertices = this.coreMesh.geometry.getAttribute("position").array;
        const normals = this.coreMesh.geometry.getAttribute("normal").array;
        const topVertex = new THREE.Vector3(vertices[9], vertices[10], vertices[11]);
        const topNormal = new THREE.Vector3(normals[9], normals[10], normals[11]).normalize();
        return new THREE.Plane().setFromNormalAndCoplanarPoint(topNormal, topVertex);
    }

    getBaseHeight() {
        return this.baseHeight;
    }

    getParent() {
        return this.parent;
    }

    getHighestZ() {
        let highestZ = 0;
        const vertices = this.convertPostionArrayToVector(this.coreMesh.geometry.getAttribute("position").array);
        for (let i = 0; i < vertices.length; i += 1) {
            highestZ = Math.max(highestZ, vertices[i].z);
        }
        return highestZ;
    }

    getLockedParameter() {
        return this.lockedParameter;
    }

    getTopHeight() {
        return this.topHeight;
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

    getPossibleAzimuths() {
        return [];
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
        const plane = this.getTopPlane();
        const newPoint = new THREE.Vector3();
        const oldPoint = new THREE.Vector3(x, y, 0);
        plane.intersectLine(
            new THREE.Line3(
                new THREE.Vector3(oldPoint.x, oldPoint.y, -10000),
                new THREE.Vector3(oldPoint.x, oldPoint.y, 10000),
            ),
            newPoint,
        );
        return newPoint.z;
    }

    getId() {
        return this.id;
    }

    getUUID() {
        return this.uuid;
    }

    getEdges() {
        let vertices = utils.convertArrayToVector(this.get2DVertices());
        let edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([
                vertices[i],
                vertices[i + 1]
            ]);
        }

        if (vertices.length > 2 &&
            (vertices[vertices.length - 1].x !== vertices[0].x ||
                vertices[vertices.length - 1].y !== vertices[0].y)) {
            edges.push([
                vertices[vertices.length - 1],
                vertices[0]
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
        let polygons = [];
        if (this.setbackOutsideMesh.geometry.parameters !== undefined) {
            let shapes = this.setbackOutsideMesh.geometry.parameters.shapes;
            for (let shape of shapes) {
                polygons.push({
                    vertices: shape.getPoints(),
                    holeVertices: shape.getPointsHoles().length > 0 ? shape.getPointsHoles()[0] : [],
                })
            }
        }
        return polygons;
    }

    getParapetPolygons() {
        let polygons = [];
        if (this.parapetMesh.geometry.parameters !== undefined) {
            let shape = this.parapetMesh.geometry.parameters.shapes;
            polygons.push({
                vertices: shape.getPoints(),
                holeVertices: shape.getPointsHoles().length > 0 ? shape.getPointsHoles()[0] : [],
            })
        }
        return polygons;
    }

    computeArea() {
        let cylinderRadius = this.cylinderRadius;
        return (Math.PI * cylinderRadius * cylinderRadius / Math.cos(this.tilt * Math.PI / 180));
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
        for (let i = this.getChildren().length - 1; i >= 0; i--) {
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
            );
            return Promise.resolve(subarray);
        } catch (error) {
            console.error('ERROR: PolygonModel: onFillFace failed', error);
            return Promise.reject(error);
        }

    }

    getChildrenModelUuids(ids) {
        for (let child of this.getChildren()) {
            if (child instanceof PolygonModel || child instanceof CylinderModel) {
                ids.push(child.uuid);
                child.getChildrenModelUuids(ids);
            }
        }
    }

    getChildSubarrays() {
        let childSubarrays = [];
        for (let child of this.getChildren()) {
            if (child instanceof Subarray) {
                childSubarrays.push(child);
            }
        }
        return childSubarrays;
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

    // Visual functions

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.CYLINDER;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

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

    // Universal Functions

    onSelect() {
        // show outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // show measurements
        this.polygonMeasurement.show();
        this.polygonMeasurement.update();

        // show setbacks
        this.showSetback();

        // adding moveObject on CylinderModel move and placeObject when it is done
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        // adding resize on radial outlinePoint only of CylinderModel when it is done
        if (!this.stage.selectionControls.isMultiSelect()) {
            let v = this.outlinePoints[1];
            this.stage.dragControls.add(
                v,
                v.moveObject.bind(v),
                v.placeObject.bind(v),
                v.handleDragStart.bind(v)
            );
        }
    }

    deSelect() {
        // hide outline points
        for (let outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }

        // hide measurements
        this.polygonMeasurement.hide();

        // hide setbacks
        this.hideSetback();
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
        for (let v of this.outlinePoints)
            v.showObject();
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (let v of this.outlinePoints)
            v.hideObject();
    }

    showObjectLayer() {
        // In future if layers are used..  it needs to be checked if the camera and model are in the same layer or not!
        for (let child of this.objectsGroup.children) {
            child.layers.enable(0);
        }
    }

    hideObjectLayer() {
        for (let child of this.objectsGroup.children) {
            child.layers.disable(0);
        }
    }

    removeObject(isTemporaryDuplicate = false) {
        // First deleting child subarray before other objects so that deleting walkways or other
        // objects don't refresh the subarray unnecessarily
        for (let childSubarray of this.getChildSubarrays()) {
            childSubarray.removeObject();
        }

        let i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject(isTemporaryDuplicate);
        }

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        // NOTE: deSelect should be after save since it will disable drag controls and stop Undo/Redo container
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
        this.polygonMeasurement.remove();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

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
        return this.outlinePoints[0].getPosition();
    }

    showMeasurement() {
        this.polygonMeasurement.show();
        this.polygonMeasurement.update();
    }

    hideMeasurement() {
        this.polygonMeasurement.hide();
    }

    static getObjectType() {
        return 'CylinderModel'
    }
}
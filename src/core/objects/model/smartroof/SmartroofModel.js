/* eslint-disable no-use-before-define */
/* eslint-disable prefer-destructuring */
import * as THREE from 'three';
import * as JSTS from 'jsts';
import * as gjk from 'gjk';

import SmartroofFace from './SmartroofFace';
import Fold from './Fold';
import { generatePlaneFromPoints, getChildrenSequence, groupPoint } from './smartroofUtils';
import Dormer from './Dormer';
import OuterEdge from './OuterEdge';
import CSG from '../../../utils/three-csg';
import InnerEdge from './InnerEdge';
import Walkway from '../Walkway';
import CylinderModel from '../CylinderModel';
import PolygonModel from '../PolygonModel';
import RotationPoint from '../../subObjects/RotationPoint';
import OutlinePoints from '../../subObjects/OutlinePoints';
import PolygonMeasurement from '../../subObjects/PolygonMeasurement';
import BaseObject from '../../BaseObject';
import Subarray from '../../subArray/Subarray';
import * as unionUtils from '../../../utils/unionUtils';
import * as utils from '../../../utils/utils';
import * as visualUtils from '../../../utils/visualUtils';
import * as raycastingUtils from '../../../utils/raycastingUtils';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';
import { getModels, getAllModelType } from '../../../utils/exporters';
import * as JSTSConverter from '../../../utils/JSTSConverter';
import { store } from '../../../../store';
import { VERTICAL_FOLD } from '../../../objectConstants';
import {
    COMPLEX_GEOMETRY_ERROR,
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_PLACING_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    INVALID_CORE_HEIGHT_ERROR,
    INVALID_TILT_ERROR,
    TOP_HEIGHT_LOCKED,
    INSUFFICIENT_VERTICES,
    OUT_OF_BASE_MODEL_ERROR,
    THIRTYSIX_INCH_SETBACK,
    EIGHTEEN_INCH_SETBACK,
} from '../../../coreConstants';
import {
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    VISUAL_STATES,
    TRANSLUCENT_OPACITY_FOR_MODELS,
    LINE_WIDTH,
} from '../../visualConstants';
import Edge from './Edge';
import { isMetricUnit } from '../../../../components/ui/length/utils';


const MINIMUM_NUMBER_OF_POINTS = 3;
import NikGeometry from '../../ground/NikGeometry';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

export class SmartroofModel extends BaseObject {
    constructor(stage) {
        super(stage);
        this.stage = stage;
        this.id = this.stage.getModelId();
        this.name = `Model #${this.id.toString()}`;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.skeletonGroup = new THREE.Group();
        this.objectsGroup.add(this.skeletonGroup);
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.oldVertices = [];
        this.minTilt = 1;
        this.testEdges = [];
        this.edgeObjects = [];
        this.coreEdgeCoordinates = [];
        this.timeStamp = 0;
        // this.stage.sceneManager.scene.add(this.skeletonGroup);
        this.innerEdges = [];
        this.type = '';
        this.innerEdgesMesh = [];
        this.outerEdgesMesh = [];
        this.edgeMesh = [];
        this.measurementTextMesh = [];
        this.edgePlanes = [];
        this.foldPlanes = [];
        this.outlinePoints = [];
        this.innerEdgesObject = [];
        this.folds = [];
        this.isTemplate = false;
        this.valid = true;
        this.map = new Map();
        this.pitchPoint = new THREE.Vector3(0, 0, 0);
        this.isMoved = true;
        this.translucentMaterial2D = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });

        this.translucentEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        this.solidMaterial = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
            side: THREE.DoubleSide,
        });
        this.solidMaterial.defines = this.solidMaterial.defines || {};
        this.solidMaterial.defines.CUSTOM = '';

        this.edgesolidMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });

        this.coreMesh = createMesh(
            createBufferGeometry(),
            this.translucentMaterial2D,
        );
        this.coreEdges = new THREE.Group();

        this.intersectingLineMaterial = this.translucentEdgeMaterial2D;

        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;
        this.roofTextureGeometry = createBufferGeometry();
        this.roofTextureMesh = createMesh(
            createBufferGeometry(),
            this.translucentMaterial2D,
        );

        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        const defaultValues = this.getDefaultValues();
        this.baseHeight = 0;
        this.coreHeight = defaultValues.coreHeight;
        this.tilt = defaultValues.tilt;
        this.defaultTilt = utils.isNumber(parseFloat(defaultValues.tilt)) ? parseFloat(defaultValues.tilt) : 20;
        this.azimuth = 180;
        this.ignored = false;
        this.snapHeight = false;
        this.isTemplate = false;
        this.is3d = false;
        this.maxTilt = 60;
        this.isDrawFace = false;
        this.setbackInside = defaultValues.setbackInside;
        // this.polygonMeasurement = null;
        this.rotationPoints = null;
        this.isSelected = false;
        this.setbackFlag = false;

        // get ground texture and image
        const imageUrl = this.stage.getGroundImage().url;
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'Anonymous';
        this.imgTexture = textureLoader.load(imageUrl);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.previousIntersectingAcCables = [];

        this.updateVisualsAfterLoadingAndCreation();
        this.intersectingModels = [];
    }

    handleTextSelection() {
        if (!this.stage.dragControls.isEditModeEnabled() &&
            !this.stage.duplicateManager.isEditModeEnabled() &&
            !this.stage.setbackEditMode.isEnabled() &&
            !this.stage.smartRoofSetbackEditMode.isEnabled()) {
            this.isTextSelected = true;
            // this.stage.selectionControls.setSelectedObject(this);
        }
    }
    handleTextDeSelection() {
        this.isTextSelected = false;
    }    


    updateSetbacks() {
        this.designDefaults = this.stage.getDesignSettings();

        const { smartroofSetbacks } = this.designDefaults.drawing_defaults.quickView;
        let ridge = smartroofSetbacks.ridge > 0 ? smartroofSetbacks.ridge : 0.001;
        const eave = smartroofSetbacks.eaves > 0 ? smartroofSetbacks.eaves : 0.001;
        const hip = smartroofSetbacks.hips > 0 ? smartroofSetbacks.hips : 0.001;
        const rake = smartroofSetbacks.rack > 0 ? smartroofSetbacks.rack : 0.001;
        const valley = smartroofSetbacks.valley > 0 ? smartroofSetbacks.valley : 0.001;

        const ridgeLock = this.designDefaults.drawing_defaults.quickView.ridgeLocked;
        if (ridgeLock) {
            // automation rules:
            // AHJ
            // 33% rule
            // const uniracCheck = true;
            const areaCheck = utils.isOrganisationUnirac() ? this.compute33PercentCheck() : true;
            ridge = SmartroofModel.computeAHJCheck() &&
                areaCheck ?
                EIGHTEEN_INCH_SETBACK : THIRTYSIX_INCH_SETBACK;
        }

        const result = getAllModelType();
        getModels(this.stage.ground, result);
        for (let i = 0; i < result.smartroofs.length; i++) {
            result.smartroofs[i].automateSetbacks(eave, rake, ridge, hip, valley, true);
        }
    }

    compute33PercentCheck() {
        const totalRoofArea = this.getAllModelArea();
        const numberofPanels = this.designDefaults.drawing_defaults.quickView.totalModules;
        const panelProperties = this.designDefaults.drawing_defaults.subarray.flushMount.moduleProperties;
        const panelWidth = panelProperties.moduleWidth;
        const panelLength = panelProperties.moduleLength;

        const panelArea = panelLength * panelWidth * numberofPanels;

        const percent = (panelArea / totalRoofArea) * 100;

        return percent < 33.33;
    }

    static getAHJDetails() {
        return store.state.design.project;
    }

    static computeAHJCheck() {
        const AHJDetails = SmartroofModel.getAHJDetails();
        let IBC = 2018;
        let IFC = 2018;
        if (AHJDetails.BuildingCode !== null && AHJDetails.BuildingCode !== 'NA') {
            IBC = parseInt(AHJDetails.BuildingCode.slice(0, 4));
        }
        if (AHJDetails.FireCode !== null && AHJDetails.FireCode !== 'NA') {
            IFC = parseInt(AHJDetails.FireCode.slice(0, 4));
        }
        const AHJCheck = IBC >= 2018 || IFC >= 2018;

        return AHJCheck;
    }

    getAllModelArea() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        let modelArea = 0;
        for (let i = 0; i < result.smartroofs.length; i++) {
            modelArea += result.smartroofs[i].computeArea();
        }
        return modelArea;
    }

    automateSetbacks(eave, rake, ridge, hip, valley, considerPanels = false) {
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof SmartroofFace) {
                modelObj.classifyEdges(eave, rake, ridge, hip, valley);
                if (!considerPanels) {
                    const setBacks = modelObj.getSetbackValuesForMirror();
                    modelObj.setbackInside = setBacks;
                    modelObj.removeSetbackOnLowerEdges();
                }
                modelObj.updateSetback();
                modelObj.updateGeometry();
            }
        });
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
        let geometry = createBufferGeometry();
        geometry.setAttribute('position',new THREE.BufferAttribute( new Float32Array( []),3));
        this.children.forEach(element => {
            if (element.tilt < 89) {
                const faceVertices = element.get3DVertices();
                const points = [];
                faceVertices.forEach((vertex) => {
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
        
                let faceGeometry = createBufferGeometry();
                faceGeometry.setAttribute('position',new THREE.BufferAttribute( new Float32Array( pointsforGeom),3));
                geometry = BufferGeometryUtils.mergeGeometries([geometry,faceGeometry]);
            }
        });
        this.updateMapTexture();

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
        planeMat.defines.CUSTOM = '';

        const mesh = new THREE.Mesh(this.roofTextureGeometry, planeMat);
        // if (this.stage.visualManager.getIn3D()) {
        //     mesh.rotation.x = Math.PI + (Math.PI / 2);
        // }

        mesh.receiveShadow = true;
        this.roofTextureMesh = mesh;

        //update self and children
        this.stage.sceneManager.scene.add(this.roofTextureMesh);
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (
                modelObj instanceof SmartroofModel ||
                modelObj instanceof PolygonModel ||
                modelObj instanceof Dormer ||
                modelObj instanceof CylinderModel ||
                modelObj instanceof SmartroofFace
            ) {
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
            if (
                children[i] instanceof SmartroofModel ||
                children[i] instanceof PolygonModel ||
                children[i] instanceof Dormer ||
                children[i] instanceof CylinderModel ||
                children[i] instanceof SmartroofFace
            ) {
                children[i].removeRoofTexture();
            }
        }
    }
    setMovementRestrictionVector(restrictionVector) {
        this.movementRestrictionVector = restrictionVector.clone();
    }

    showRoofTexture() {
        this.roofTextureMesh.visible = true;
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
        this.roofTextureMesh.visible = false;
        const children = this.getChildren();
        children.forEach((modelObj) => {
            if (
                modelObj instanceof SmartroofModel ||
                modelObj instanceof PolygonModel ||
                modelObj instanceof Dormer ||
                modelObj instanceof CylinderModel ||
                modelObj instanceof SmartroofFace
            ) {
                modelObj.hideRoofTexture();
            }
        });
    }

    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    updateRafter() {
        this.getChildren().forEach((child) => {
            child.updateRafter();
        });
    }

    hideRafter() {
        this.getChildren().forEach((child) => {
            child.hideRafter();
        });
    }
    // rafterlines of each face wont be visible when into 3D
    // need better fix; To do : refactor
    switchTo3D() {
        this.getChildren().forEach((child) => {
            child.switchTo3D();
        });
    }

    getDefaultValues() {
        const polygonDrawingDefaults = this.stage.getDesignSettings().drawing_defaults.smartroofModel;
        return {
            coreHeight: polygonDrawingDefaults.coreHeight,
            tilt: polygonDrawingDefaults.tilt,
            setbackInside: polygonDrawingDefaults.setbackInside,
        };
    }

    getState() {
        const polygonData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            tilt: this.tilt,
            baseHeight: this.baseHeight,
            coreHeight: this.coreHeight,
            lockedParameter: this.lockedParameter,
            ignored: this.ignored,
            snapHeight: this.snapHeight,
            isTemplate: this.isTemplate,
            childSequence: getChildrenSequence(this),
            outlinePoints: this.saveOutlinePoints(),
            oldVertices: this.oldVertices,
            outerEdgeObjects: this.saveOuterEdgeObjects(),
            folds: this.saveFolds(),
            isMoved: this.isMoved,
            rotationPoints: this.rotationPoints,
            parent: this.getParent() ? this.getParent().uuid : null,
            maxTilt: this.maxTilt,            
        };
        return polygonData;
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
            this.tilt = state.tilt;
            this.coreHeight = state.coreHeight;
            this.baseHeight = state.baseHeight;
            this.lockedParameter = state.lockedParameter;
            this.ignored = state.ignored;
            this.snapHeight = state.snapHeight;
            this.isTemplate = state.isTemplate;
            this.isMoved = state.isMoved;
            this.oldVertices = [];
            this.updateVisualsAfterLoadingAndCreation();
            if ( this.isTemplate ) {
                if (this.parent) {
                    this.maxTilt = this.getMaxTilt();
                }
                else {
                    this.maxTilt = state.maxTilt ? state.maxTilt : 60;
                }
            }
            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                // create outline points
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.outerEdgeObjects.forEach((outerEdgeObject) => {
                    outerEdgeObject.outlinePoint1 = this.outlinePoints[outerEdgeObject.outlinePoint1Index];
                    outerEdgeObject.outlinePoint2 = this.outlinePoints[outerEdgeObject.outlinePoint2Index];
                });
                this.loadFolds(state.folds);
                this.updateOldVertices();
                // create polygon measurement
                // this.polygonMeasurement = new PolygonMeasurement(
                //     this.oldVertices,
                //     this, this.stage,
                // );
            }
            else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.loadFolds(state.folds);
            }
            else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // Remove outline points
                for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i, 1);
                }

                // create outline points
                this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage,
                ));

                this.loadOuterEdgeObjects(state.outerEdgeObjects);
                this.outerEdgeObjects.forEach((outerEdgeObject) => {
                    outerEdgeObject.outlinePoint1 = this.outlinePoints[outerEdgeObject.outlinePoint1Index];
                    outerEdgeObject.outlinePoint2 = this.outlinePoints[outerEdgeObject.outlinePoint2Index];
                });
                this.loadFolds(state.folds);
            }
            else {
                console.error('PitchedRoofModel: loadState: Error in Loading Outline Points');
                return null;
            }

            if (this.stage.selectionControls.getSelectedObject() === this) {
                // update polygon measurement
                // this.polygonMeasurement.show();
                // this.polygonMeasurement.update();
            }
            this.outlinePoints.forEach(outlineP =>{
                this.oldVertices.push(outlineP.getPosition());
            })
            // update geometry
            this.updateSmartRoof();
            this.children.forEach((child) => {
                child.updatedEditedFace();
            });
            this.getAllSmartroofIntersections();
            this.clearTestEdges();
            // this.updatePolygonMeasurement();

            this.coreMesh.geometry.computeBoundingSphere();

            // setting RotationPoint
            if (!this.rotationPoints) {
                this.createRotation();
            }
            else {
                this.rotationPoints.removeObject();
                this.createRotation();
            }
        }
        if (!this.isSelected && this.outerEdgeObjects) {
            //hide outer edge objects measurement
            this.outerEdgeObjects.forEach((outerEdgeObject) => {
                outerEdgeObject.measurementText.hideObject();
            });
        }
        return true;
    }

    saveOutlinePoints() {
        return this.outlinePoints.map(outlinePoint => [
            outlinePoint.getPosition().x,
            outlinePoint.getPosition().y,
            outlinePoint.getPosition().z,
        ]);
    }

    saveOuterEdgeObjects() {
        return this.outerEdgeObjects.map(outerEdgeObject => [
            outerEdgeObject.isPitched,
            outerEdgeObject.tilt,
            outerEdgeObject.height,
        ]);
    }

    saveFolds() {
        return this.folds.map(fold => [
            fold.getPosition().x,
            fold.getPosition().y,
            fold.getPosition().z,
            fold.tilt,
            fold.id,
            fold.foldType,
            fold.smartRoofFace,
        ]);
    }

    loadFolds(folds) {
        let foldsLoadObject = folds;
        for (let i = 0; i < this.folds.length; i += 1) {
            const fold = this.folds[i];
            const foldState = foldsLoadObject.find(f => f[4] === fold.id);
            foldsLoadObject = foldsLoadObject.filter(f => f[4] !== fold.id);
            const tiltIndex = 3;
            if (foldState) {
                fold.setPosition(foldState[0], foldState[1], foldState[2]);
                fold.tilt = foldState[tiltIndex];
            }
            else {
                const j = this.folds.indexOf(fold);
                if (j !== -1) {
                    this.folds.splice(j, 1);
                    fold.removeObject();
                }
            }
        }
        for (let i = 0; i < foldsLoadObject.length; i += 1) {
            const fold = new Fold(
                foldsLoadObject[i][0],
                foldsLoadObject[i][1],
                foldsLoadObject[i][2],
                this,
                this.stage,
                foldsLoadObject[i][5],
                foldsLoadObject[i][6],
            );
            this.folds.push(fold);
        }
    }

    loadOutlinePoints(outlinePoints) {
        for (let i = 0; i < outlinePoints.length; i += 1) {
            this.outlinePoints[i].setPosition(
                outlinePoints[i][0],
                outlinePoints[i][1],
                outlinePoints[i][2],
            );
        }
    }

    loadOuterEdgeObjects(outerEdgeObjects) {
        for (let i = 0; i < outerEdgeObjects.length; i += 1) {
            this.outerEdgeObjects[i].isPitched = outerEdgeObjects[i][0];
            this.outerEdgeObjects[i].tilt = this.getValidTilt(outerEdgeObjects[i][1]);
            this.outerEdgeObjects[i].height = outerEdgeObjects[i][2];
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        if (this.rotationPoints) this.rotationPoints.removeObject();


        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        if (this.getParent()) {
            this.getParent().removeChild(this);
        }

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        // disable innerEdge
        for (let i = this.innerEdgesObject.length - 1; i >= 0; i -= 1) {
            this.innerEdgesObject[i].removeObject();
            this.innerEdgesObject.splice(i, 1);
        }

        // Remove folds
        for (let i = this.folds.length - 1; i >= 0; i -= 1) {
            this.folds[i].removeObject();
            this.folds.splice(i, 1);
        }

        // remove measurements
        // this.polygonMeasurement.remove();
    }

    exportAsSTL() {
        const { coreMesh } = this;

        const allObjects = [];

        coreMesh.updateMatrix();

        const singleGeometry = coreMesh.geometry.clone();

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
        coreMesh.updateMatrix();
        const singleGeometry = coreMesh.geometry.clone();

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
            }
            else {
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

    static getDefault2DVertices() {
        const vertices = [];
        vertices.push([0, 0]);
        vertices.push([0, 5]);
        vertices.push([2.5, 7.5]);
        vertices.push([5, 5]);
        vertices.push([5, 0]);
        return vertices;
    }

    initDormerPlacingMode() {
        this.stage.stateManager.startContainer();

        const vertices2DArray = this.get2DVertices();
        let offsetPoint = vertices2DArray[2];
        if (this.type === 'FlatDormer') {
            offsetPoint = [(vertices2DArray[2][0] + vertices2DArray[1][0]) * 0.5,
                (vertices2DArray[2][1] + vertices2DArray[1][1]) * 0.5];
        }
        const offsetVector = new THREE.Vector2(offsetPoint[0], offsetPoint[1], 0);
        offsetVector.subVectors(this.getPosition(), offsetVector);
        this.stage.placeManager.initialize(
            this,
            this.placeObject.bind(this),
            this.onCancelDormerPlacing.bind(this),
            offsetVector.x,
            offsetVector.y, { moveWithOffset: true },
        );
        this.stage.eventManager.setButtonStatusWhilePasting(this
            .stage.placeManager.onCancel.bind(this.stage.placeManager));

        this.stage.selectionControls.setSelectedObject(this);
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
        for (let i = 0; i < vertices.length; i += 1) {
            const vertex = vertices[i];
            const vertexNext = vertices[(i + 1) % vertices.length];
            const vertexPrev = vertices[((i - 1) + vertices.length) % vertices.length];
            if (utils.checkCollinear(vertex, vertexNext, vertexPrev, 0.0001)) {
                vertices.splice(i, 1);
                i -= 1;
            }
        }
        this.oldVertices = vertices;

        if (utils.checkClockwise(utils.convertVectorToArray(vertices))) {
            this.oldVertices.reverse();
        }
        for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                this.oldVertices[i].x,
                this.oldVertices[i].y,
                this.oldVertices[i].z,
                this,
                this.stage,
            ));
        }

        // Create outerEdge objects and their associated faces
        this.outerEdgeObjects = [];
        this.outerEdgesMesh = [];
        this.measurementTextMesh = [];
        const validTilt = this.getValidTilt(this.tilt);
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(
                this,
                this.stage,
                this.outlinePoints[i],
                this.outlinePoints[(i + 1) % l],
                i,
                (i + 1) % l,
                this.coreHeight,
                true,
                validTilt,
            );
            this.outerEdgeObjects.push(outerEdge);
            this.addChild(outerEdge.smartRoofFace);
        }


        // create polygon measurement
        // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage, false, true);
        geometry.computeBoundingSphere();

        try {
            this.updateSmartRoof();
            this.stage.ground.addChild(this);
            // for (let i = 0; i < this.children.length; i++) {
            //     this.children[i].createPolygonMeasurement();
            // }
            if (!this.isTemplate) {
                await this.placeObject();
            }
            else {
                this.getAllSmartroofIntersections();
            }
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: PitchedRoof: OnComplete failed.', error);
            if (error === 'Insufficient number of vertices') {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.onCancel();
            return Promise.reject(error);
        }
    }

    async addFold(smartRoofFace, foldType) {
        // smartRoofFace.polygonMeasurement.remove();
        const vertices = smartRoofFace.getVector3DVertices();
        const initialPosition = SmartroofModel.getCentroidOfVertices(vertices);
        const fold = new Fold(initialPosition.x, initialPosition.y, initialPosition.z, this, this.stage, foldType);
        this.folds.push(fold);
        if (foldType !== VERTICAL_FOLD) {
            this.addChild(fold.smartRoofFace);
        }
        else {
            fold.smartRoofFace.isValid = false;
            fold.smartRoofFace.isDeleted = true;
            fold.smartRoofFace.vertices = [];
            fold.smartRoofFace.updateOutlinePoints();
        }
        this.updateSmartRoof();
        // remove subarrays when fold is added
        this.getChildren().forEach((sFace) => {
            sFace.getChildren().forEach((child) => {
                if (child instanceof Subarray) {
                    child.removeObject();
                }
            })
        })
        await this.placeObject();
    }

    getValidTilt(tilt) {
        const validTilt = !utils.isNumber(parseFloat(tilt)) ? this.defaultTilt : parseFloat(tilt);
        return validTilt;
    }

    static getCentroidOfVertices(vertices) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let i = 0, l = vertices.length; i < l; i += 1) {
            x += vertices[i].x;
            y += vertices[i].y;
            z += vertices[i].z;
        }
        x /= vertices.length;
        y /= vertices.length;
        z /= vertices.length;
        return new THREE.Vector3(x, y, z);
    }

    handleFoldMove() {
        this.updateSmartRoof(false);
        this.getAllSmartroofIntersections(true);
    }

    async handleFoldPlace(fold) {
        this.updateSmartRoof();
        if (!fold.isValid) {
            this.deleteFold(fold);
        }
        await this.placeObject();
    }

    handleInnerEdgeMove() {
        this.updateSmartRoof(false);
        this.getAllSmartroofIntersections(true);
    }

    handleOuterEdgeMove(outerEdge, dx = 0, dy = 0, dz = 0) {
        this.updateSmartRoof(false);
        if (!outerEdge.smartRoofFace.isDeleted && outerEdge.smartRoofFace.isValid) {
            outerEdge.smartRoofFace.moveChildren(dx, dy, dz);
        }
        this.getAllSmartroofIntersections(true);
        this.updateOldVertices();
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
    }

    updateOldVertices() {
        this.oldVertices = [];
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.oldVertices.push(this.outlinePoints[i].getPosition());
        }
    }

    updateOuterEdges() {
        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            this.outerEdgeObjects[i].updateOuterEdge();
        }
    }
    updatePolygonMeasurement() {
        this.updateOldVertices();
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
    }

    updateSmartRoof(place = true) {
        this.updateOuterEdges();
        this.runPolygonShrink(place);
        this.updateInnerEdges();
        this.updateGeometry();
    }

    updateInnerEdges() {
        for (let i = 0, l = this.connectingEdges.length; i < l; i += 1) {
            const connectingEdge = this.connectingEdges[i];
            const outerEdge1 = this.outerEdgeObjects.find(edge => edge.id === connectingEdge.edge1);
            const outerEdge2 = this.outerEdgeObjects.find(edge => edge.id === connectingEdge.edge2);
            if (outerEdge1 && outerEdge2) {
                if (this.innerEdgesObject.find(edge => edge.id === connectingEdge.id) === undefined) {
                    const innerEdge = new InnerEdge(
                        connectingEdge.startPoint,
                        connectingEdge.endPoint,
                        this,
                        this.stage,
                        connectingEdge.id,
                        outerEdge1,
                        outerEdge2,
                    );
                    this.innerEdgesObject.push(innerEdge);
                    this.stage.dragControls.add(
                        innerEdge,
                        innerEdge.moveObject.bind(innerEdge),
                        innerEdge.handleDragEnd.bind(innerEdge),
                        innerEdge.handleDragStart.bind(innerEdge),
                    );
                    innerEdge.enable();
                    if (this.isSelected) {
                        innerEdge.showObject();
                    }
                }
                else {
                    const innerEdge = this.innerEdgesObject.find(edge => edge.id === connectingEdge.id);
                    if (!outerEdge1.isPitched || !outerEdge2.isPitched) {
                        innerEdge.disable();
                        innerEdge.removeObject();
                        continue;
                    }
                    innerEdge.startPoint = connectingEdge.startPoint;
                    innerEdge.endPoint = connectingEdge.endPoint;
                    innerEdge.updateGeometry();
                    innerEdge.enable();
                    if (this.isSelected) {
                        innerEdge.showObject();
                    }
                }
            }
        }
        for (let i = 0, l = this.innerEdgesObject.length; i < l; i += 1) {
            const innerEdge = this.innerEdgesObject[i];
            const connectingEdge = this.connectingEdges.find(edge => edge.id === innerEdge.id);
            if (!connectingEdge) {
                innerEdge.disable();
            }
        }
    }

    runPolygonShrink(place = true) {
        let connectedEdge;
        let head;
        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            const outerEdge = this.outerEdgeObjects[i];
            outerEdge.smartRoofFace.startNode = null;
            outerEdge.smartRoofFace.endNode = null;
            outerEdge.coupledEdges = [];
            if (!connectedEdge) {
                connectedEdge = new ConnectedEdge(outerEdge);
                head = connectedEdge;
            }
            else {
                connectedEdge.nextEdge = new ConnectedEdge(outerEdge);
                connectedEdge.nextEdge.prevEdge = connectedEdge;
                connectedEdge = connectedEdge.nextEdge;
            }
        }

        connectedEdge.nextEdge = head;
        head.prevEdge = connectedEdge;
        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            this.folds[i].smartRoofFace.startNode = null;
            this.folds[i].smartRoofFace.endNode = null;
            this.folds[i].isValid = false;
        }

        if (this.isTemplate && this.type === 'FlatDormer') {
            this.calculatePlanarFace();
            return;
        }
        const originalDynamicPolygon = new DynamicPolygon(this, head, this.folds);
        originalDynamicPolygon.generateIntersections();
        const polygons = [originalDynamicPolygon];
        const shrinkPaths = [];
        while (polygons.length > 0) {
            const polygon = polygons.pop();
            if (!polygon) {
                continue;
            }
            let count = 0 ;
            while (polygon.intersections.length > 0 && !polygon.stop) {
                const splitPolygons = polygon.shrink(shrinkPaths);
                polygons.push(...splitPolygons);
                // Temp fix for infinite loop
                count += 1;
                if (count > 100) {
                    console.warn('Invalid roof');
                    this.valid = false;
                    break;
                }
            }
            if (polygon.stop) {
                console.warn('Invalid roof');
                this.valid = false;
            }
            else {
                this.valid = true;
            }
            if (polygon.getNumberOfVertices() === 3 && polygon.intersections.length > 0) {
                shrinkPaths.push({
                    type: 'top',
                    point: polygon.intersections[0].point,
                    faces: polygon.intersections[0].faces,
                });
            }
            else if (polygon.getNumberOfVertices() === 2) {
                // TO DO: check if the intersection is on the edge
            }
        }
        this.processShrinkPaths(shrinkPaths, place);
    }

    calculatePlanarFace() {
        this.connectingEdges = [];
        const validOuterEdge = this.outerEdgeObjects.find(o => o.isPitched);
        const validFace = validOuterEdge.smartRoofFace;
        validFace.isValid = true;
        validFace.isDeleted = false;
        validFace.tilt = validOuterEdge.tilt;
        const orderedFacePoints = [];
        const vertices = this.get3DVectorVertices();
        if (this.tilt === 0) {
            for (let i = 0; i < vertices.length; i += 1) {
                orderedFacePoints.push(new THREE.Vector3(vertices[i].x, vertices[i].y, this.coreHeight));
            }
        }
        else {
            const plane = validFace.plane;
            for (let i = 0; i < vertices.length; i += 1) {
                const newPoint = new THREE.Vector3();
                const oldPoint = vertices[i];
                plane.intersectLine(
                    new THREE.Line3(
                        new THREE.Vector3(oldPoint.x, oldPoint.y, -10000),
                        new THREE.Vector3(oldPoint.x, oldPoint.y, 10000),
                    ),
                    newPoint,
                );
                orderedFacePoints.push(newPoint);
            }
        }
        validFace.vertices = orderedFacePoints;
        validFace.updateOutlinePoints(orderedFacePoints);
        this.outerEdgeObjects.forEach((o) => {
            if (!o.isPitched) {
                o.smartRoofFace.isValid = false;
                o.smartRoofFace.isDeleted = true;
                o.smartRoofFace.vertices = [];
                o.smartRoofFace.updateOutlinePoints();
                o.smartRoofFace.disposeFaceMesh();
                o.smartRoofFace.faceMesh = null;
            }
        });
    }

    static makeCoplanar(inputVertices, face) {
        const coplanarVertices = [];
        const facePlane = face.plane;
        if (!facePlane) {
            return inputVertices;
        }
        for (let i = 0; i < inputVertices.length; i++) {
            const newPoint = new THREE.Vector3();
            const oldPoint = inputVertices[i];
            facePlane.intersectLine(
                new THREE.Line3(
                    new THREE.Vector3(oldPoint.x, oldPoint.y, -10000),
                    new THREE.Vector3(oldPoint.x, oldPoint.y, 10000),
                ),
                newPoint,
            );
            coplanarVertices.push(newPoint);
        }
        return coplanarVertices;
    }

    static removeDuplicateVertices(vertices) {
        const uniqueVertices = new Set();
        uniqueVertices.add(vertices[0]);
        for (let i = 1; i < vertices.length; i++) {
            const vertex = vertices[i];
            const lastVertex = vertices[i - 1];
            if (vertex.distanceTo(lastVertex) > 0.0001) {
                uniqueVertices.add(vertex);
            }
        }
        return [...uniqueVertices];
    }

    static removeCollinearVertices(vertices) {
        if (!vertices || vertices.length < 3) {
            return;
        }
        // Remove collinear points
        let collinearFlag = true;
        while(collinearFlag) {
            collinearFlag = false;
            for (let i = 0; i < vertices.length; i += 1) {
                const vertex = vertices[i];
                const vertexNext = vertices[(i + 1) % vertices.length];
                const vertexPrev = vertices[((i - 1) + vertices.length) % vertices.length];
                if (utils.checkCollinear(vertex, vertexNext, vertexPrev, 0.0001)) {
                    vertices.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }


    processShrinkPaths(shrinkPaths, place = true) {
        this.connectingEdges = [];
        if (this.isTemplate && this.type === 'FlatDormer') {
            if (this.tilt === 0) {
                const validOuterEdge = this.outerEdgeObjects.find(o => o.isPitched);
                const validFace = validOuterEdge.smartRoofFace;
                validFace.isValid = true;
                validFace.isDeleted = false;
                validFace.tilt = validOuterEdge.tilt;
                const orderedFacePoints = [];
                const vertices = this.get3DVectorVertices();
                for (let i = 0; i < vertices.length; i += 1) {
                    orderedFacePoints.push(new THREE.Vector3(vertices[i].x, vertices[i].y, this.coreHeight));
                }
                validFace.vertices = orderedFacePoints;
                validFace.updateOutlinePoints(orderedFacePoints, place);
                this.outerEdgeObjects.forEach((o) => {
                    if (!o.isPitched) {
                        o.smartRoofFace.isValid = false;
                        o.smartRoofFace.isDeleted = true;
                        o.smartRoofFace.vertices = [];
                        o.smartRoofFace.updateOutlinePoints(null, place);
                        o.smartRoofFace.disposeFaceMesh();
                        o.smartRoofFace.faceMesh = null;
                    }
                });
                return;
            }
        }
        const mergedFaces = shrinkPaths.filter(path => path.type === 'collinearEdgeEvent' && path.needMerge);
        const mergeData = [];
        for (let i = 0; i < mergedFaces.length; i++) {
            const face1 = mergedFaces[i].faces[1];
            const face2 = mergedFaces[i].faces[0];
            const mergePoint = mergedFaces[i].point;
            const otherMergePath = shrinkPaths.find(path => path.faces.includes(face1) && path.faces.includes(face2));
            const merge = {
                face1,
                face2,
                mergePoint,
                otherPoint: otherMergePath.point,
            };
            mergeData.push(merge);
        }

        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            const outerEdge = this.outerEdgeObjects[i];
            const height = outerEdge.height;
            const smartRoofFace = outerEdge.smartRoofFace;
            const id = outerEdge.id;
            const wallId = outerEdge.wallId;
            const orderedFacePoints = [];
            const startNode = smartRoofFace.startNode;
            const endNode = smartRoofFace.endNode;
            if (
                !startNode ||
                !utils.sanityCheckVector3(startNode.point) ||
                !endNode ||
                !utils.sanityCheckVector3(endNode.point) ||
                startNode.point.distanceTo(endNode.point) < 0.0001
            ) {
                if (smartRoofFace.isValid) {
                    smartRoofFace.isValid = false;
                    smartRoofFace.vertices = [];
                    smartRoofFace.updateOutlinePoints(null, place);
                    smartRoofFace.disposeFaceMesh();
                    smartRoofFace.faceMesh = null;
                }
                continue;
            }
            else if (!smartRoofFace.isValid) {
                smartRoofFace.isValid = true;
            }
            const startPoint = startNode.point;
            orderedFacePoints.push(startPoint);
            const endPoint = endNode.point;
            const startFace = startNode.faces.filter(face => face !== id && face !== wallId)[0];
            const lastFace = endNode.faces.filter(face => face !== id && face !== wallId)[0];
            let unorderedFaceNodes = shrinkPaths.filter((path) => {
                if (path.type !== 'coreEdgeEvent') {
                    return path.faces.includes(id) && path.point.z > height - 0.000001;
                }
                return path.faces[1] === id;
            });
            if (unorderedFaceNodes.length > 0) {
                let nextFace = startFace;
                let nextFaceNode;
                let prevFace;
                do {
                    nextFaceNode = unorderedFaceNodes.find(path => path.faces.includes(nextFace));
                    if (!nextFaceNode) {
                        const reversePoints = [];
                        const customEndFace = prevFace;
                        reversePoints.push(endPoint);
                        nextFace = lastFace;
                        do {
                            nextFaceNode = unorderedFaceNodes.find(path => path.faces.includes(nextFace));
                            if (!nextFaceNode) {
                                break;
                            }
                            if (nextFaceNode.point.distanceTo(reversePoints[reversePoints.length - 1]) > 0.000001) {
                                reversePoints.push(nextFaceNode.point);
                            }
                            prevFace = nextFace;
                            nextFace = nextFaceNode.faces.filter(face => face !== id && face !== nextFace)[0];
                            unorderedFaceNodes = unorderedFaceNodes.filter(path => !(path.faces === nextFaceNode.faces));
                        } while (!nextFaceNode.faces.includes(customEndFace));
                        for (let j = reversePoints.length - 1; j > 0; j--) {
                            orderedFacePoints.push(reversePoints[j]);
                        }
                        break;
                    }
                    if (nextFaceNode.point.distanceTo(orderedFacePoints[orderedFacePoints.length - 1]) > 0.000001) {
                        orderedFacePoints.push(nextFaceNode.point);
                    }
                    if (orderedFacePoints.length > 1) {
                        const key1 = id;
                        const key2 = nextFace;
                        const sortedKeyCombo = [key1, key2].sort((a, b) => a - b);
                        const innerEdgeId = sortedKeyCombo.join('-');
                        if (!this.connectingEdges.find(a => a.id === innerEdgeId) && prevFace !== nextFace) {
                            const startPoint = orderedFacePoints[orderedFacePoints.length - 2];
                            const endPoint = orderedFacePoints[orderedFacePoints.length - 1];
                            const innerEdge = {
                                id: innerEdgeId,
                                startPoint,
                                endPoint,
                                edge1: id,
                                edge2: nextFace,
                            };
                            this.connectingEdges.push(innerEdge);
                        }
                    }
                    prevFace = nextFace;
                    nextFace = nextFaceNode.faces.filter(face => face !== id && face !== nextFace)[0];

                    unorderedFaceNodes = unorderedFaceNodes.filter(path => !(path.faces === nextFaceNode.faces));
                } while (!nextFaceNode.faces.includes(lastFace));
                if (endPoint.distanceTo(orderedFacePoints[orderedFacePoints.length - 1]) > 0.000001) {
                    orderedFacePoints.push(endPoint);
                }
                const coplanarFacePoints = SmartroofModel.makeCoplanar(orderedFacePoints, smartRoofFace);
                smartRoofFace.vertices = coplanarFacePoints;
                SmartroofModel.removeCollinearVertices(coplanarFacePoints);
                smartRoofFace.updateOutlinePoints(coplanarFacePoints, place);
            }
        }
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const face1 = merge.face1;
            const face2 = merge.face2;
            const mergePoint = merge.mergePoint;
            const outerEdge1 = this.outerEdgeObjects.find(edge => edge.id === face1);
            const outerEdge2 = this.outerEdgeObjects.find(edge => edge.id === face2);
            if (!outerEdge1 || !outerEdge2) {
                continue;
            }
            outerEdge1.coupledEdges.push(outerEdge2);
            outerEdge2.coupledEdges.push(outerEdge1);
            const smartRoofFace1 = outerEdge1.smartRoofFace;
            const smartRoofFace2 = outerEdge2.smartRoofFace;
            const dotVector = smartRoofFace1.getOuterEdgeVector().dot(smartRoofFace2.getOuterEdgeVector());
            if (Math.abs(1 - dotVector) > 0.0001) continue;
            const smartRoofFace1Vertices = smartRoofFace1.vertices;
            const smartRoofFace2Vertices = smartRoofFace2.vertices;
            const index1 = smartRoofFace1Vertices.findIndex(point => point.distanceTo(mergePoint) < 0.01);
            const index2 = smartRoofFace2Vertices.findIndex(point => point.distanceTo(mergePoint) < 0.01);
            const mergedPath = [];
            for (let j = 0; j < smartRoofFace1Vertices.length; j++) {
                if (j === index1) {
                    for (let k = 0; k < smartRoofFace2Vertices.length; k++) {
                        if (k === index2) {
                            let l;
                            if (smartRoofFace1Vertices[j - 1] === smartRoofFace2Vertices[(k + 1) % smartRoofFace2Vertices.length]) {
                                l = (k + 2) % smartRoofFace2Vertices.length;
                            }
                            else {
                                l = (k + 1) % smartRoofFace2Vertices.length;
                            }
                            do {
                                mergedPath.push(smartRoofFace2Vertices[l]);
                                l = (l + 1) % smartRoofFace2Vertices.length;
                            } while (l !== k);
                        }
                    }
                }
                else {
                    mergedPath.push(smartRoofFace1Vertices[j]);
                }
            }
            const uniqueMergedPath = SmartroofModel.removeDuplicateVertices(mergedPath);
            const coplanarFacePoints = SmartroofModel.makeCoplanar(uniqueMergedPath, smartRoofFace1);
            smartRoofFace1.vertices = coplanarFacePoints;
            SmartroofModel.removeCollinearVertices(coplanarFacePoints);
            smartRoofFace1.updateOutlinePoints(coplanarFacePoints, place);
            smartRoofFace2.vertices = [];
            smartRoofFace2.updateOutlinePoints(null, place);
            smartRoofFace2.isValid = false;
            smartRoofFace2.disposeFaceMesh();
            smartRoofFace2.faceMesh = null;
            this.connectingEdges = this.connectingEdges.filter(edge => !((edge.edge1 == face1 && edge.edge2 == face2) || (edge.edge2 == face1 && edge.edge1 == face2)));
        }
        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            const fold = this.folds[i];
            const smartRoofFace = fold.smartRoofFace;

            if (fold.foldType === 'vertical') {
                if (smartRoofFace.isValid) {
                    smartRoofFace.isValid = false;
                    smartRoofFace.isDeleted = true;
                    smartRoofFace.vertices = [];
                    smartRoofFace.updateOutlinePoints(null, place);
                }
                continue;
            }
            const height = fold.getPosition().z;
            const id = fold.id;
            const orderedFacePoints = [];
            const startNode = smartRoofFace.startNode;
            const endNode = smartRoofFace.endNode;
            if (!startNode || !endNode) {
                if (smartRoofFace.isValid) {
                    smartRoofFace.isValid = false;
                    smartRoofFace.vertices = [];
                    smartRoofFace.updateOutlinePoints(null, place);
                }
                continue;
            }
            else {
                smartRoofFace.isValid = true;
            }
            const startPoint = startNode.point;
            orderedFacePoints.push(startPoint);
            const endPoint = endNode.point;
            const startFace = startNode.faces[2];
            const lastFace = endNode.faces[2];
            let unorderedFaceNodes = shrinkPaths.filter((path) => {
                if (path.type !== 'foldEdge') {
                    return path.faces.includes(id) && path.point.z > height - 0.0001;
                }

                return path.faces[1] === id || path.faces[2] === id;
            });
            if (unorderedFaceNodes.length > 0) {
                let nextFace = startFace;
                let nextFaceNode;
                do {
                    nextFaceNode = unorderedFaceNodes.find(path => path.faces.includes(nextFace));
                    if (!nextFaceNode) {
                        break;
                    }
                    orderedFacePoints.push(nextFaceNode.point);
                    nextFace = nextFaceNode.faces.filter(face => face != id && face != nextFace)[0];
                    unorderedFaceNodes = unorderedFaceNodes.filter(path => !(path.faces == nextFaceNode.faces));
                } while (!nextFaceNode.faces.includes(lastFace));
                orderedFacePoints.push(endPoint);
                const coplanarFacePoints = SmartroofModel.makeCoplanar(orderedFacePoints, smartRoofFace);
                smartRoofFace.vertices = coplanarFacePoints;
                SmartroofModel.removeCollinearVertices(coplanarFacePoints);
                smartRoofFace.updateOutlinePoints(coplanarFacePoints, place);
            }
        }
    }
    createRotation() {
        this.coreMesh.geometry.computeBoundingSphere();
        const { center, radius } = this.coreMesh.geometry.boundingSphere;
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        // setting RotationPoint
        this.rotationPoints = new RotationPoint(
            center.x,
            center.y + radius,
            100,
            this,
            this.stage,
        );
    }

    onCancelDormerPlacing() {
        this.removeObject();
        this.stage.eventManager.setPlaceObjectComplete();
        this.stage.stateManager.stopContainer({ discard: true });
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
    }

    onCancel() {
        // Remove parent - child relationship
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }
        // Remove from scene
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }
    updateWhilePlacing() {
        const placingInformation = this.getPlacingInformation();
        if (placingInformation.parent instanceof SmartroofFace && (placingInformation.parent.azimuth !== this.azimuth) && this.isTemplate) {
            const rotationPoint = this.outlinePoints[2].getPosition();
            const angleToRotate = this.azimuth - placingInformation.parent.azimuth;
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
            const children = this.getChildren();
            for (let i = 0, l = children.length; i < l; i += 1) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                }
                children[i].updateSetback();
                children[i].updateGeometry();
                children[i].rotateObjectHelper(angleInRad, rotationPoint);
            }
        }
        if (this.isTemplate && this.parent instanceof SmartroofFace) {
            this.snapTemplateToParent();
        }
        if (this.isTemplate) {
            this.updateSmartRoof();
            this.getAllSmartroofIntersections();
        }
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update base height
        this.skeletonGroup.clear();
        this.baseHeight += deltaZ;
        if (deltaX !== 0 || deltaY !== 0) {
            this.isMoved = true;
        }
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.children.forEach((edge) => {
            edge.geometry.translate(deltaX, deltaY, deltaZ);
        });


        if (this.rotationPoints) {
            this.rotationPoints.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update outline points without consequences
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            this.outerEdgeObjects[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        for (let i = 0, l = this.oldVertices.length; i < l; i += 1) {
            this.oldVertices[i].add(new THREE.Vector3(deltaX, deltaY, deltaZ));
        }
        // disable innerEdge
        for (let i = 0, l = this.innerEdgesObject.length; i < l; i += 1) {
            this.innerEdgesObject[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            // this.folds[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
            this.folds[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        for (let i = 0, l = this.testEdges.length; i < l; i += 1) {
            this.testEdges[i].measurementText.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }


        // update measurement
        // TODO this will not work in multy select
        if (this.stage.selectionControls.getSelectedObject() === this) {
            // this.updatePolygonMeasurement();
        }
        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        // update children
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }

        this.saveState();
    }

    getIntersectingAcCables() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        return result.acCable;
    }

    handleDragStart() {
        // this.setbackOutsideMesh.visible = false;
        this.previousIntersectingAcCables = this.getIntersectingAcCables();
    }
    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
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

        for (let i = 0, l = this.folds.length; i < l; i += 1) {
            const outlinePointX = this.folds[i].getPosition().x;
            const outlinePointY = this.folds[i].getPosition().y;
            const outlineDeltaXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.folds[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(angleInRad)).toFixed(2)) % 360;
        const finalAzimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
        this.azimuth = finalAzimuth;

        // update faces here
        this.updateFacesWithNewAngles(false);
        this.updateGeometry();
        this.oldVertices = [];
        this.outlinePoints.forEach( outlinePoint => {
            this.oldVertices.push(outlinePoint.getPosition());
        })
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }


    async handleDragEnd(deltaX = 0, deltaY = 0) {
        this.updateIntersectingAcCables(this.previousIntersectingAcCables);
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();

        try {
            await this.placeObject(deltaX, deltaY,true);
        }
        catch (e) {
            // error handled by place object
            console.error('error on drag end place object', e);
        }
        finally {
            this.stage.eventManager.completePolygonModelLoading(notificationObject);
        }
        this.previousIntersectingAcCables = [];
        
        this.testEdges.forEach((testEdge) => {
            testEdge.measurementText.showObject();
        });

    }

    handleDragCancel() {
        this.previousIntersectingAcCables = [];
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    hideSelectables() {
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].hideObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].hideObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].hideObject();
        }

        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].hideObject();
        }

    }

    showSelectables() {
        // show outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].showObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].showObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].showObject();
        }

        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].showObject();
        }
    }

    onSelect() {
        this.coreMesh.material.opacity = 0.4;
        if (!this.isTemplate) {
            if (!this.rotationPoints) {
                this.createRotation();
            }
            this.rotationPoints.showObject();
        }
        else {
            this.setRestrictions();
        }
        this.is3d = this.stage.visualManager.in3D;

        // show outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].showObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].showObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].showObject();
        }

        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].showObject();
        }
        // loop to show testedges
        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].showObject();
        }


        // show measurements
        // jugaad to fix no snapping after complex roof deletion
        // if (this.polygonMeasurement.arcElements.length !== 0 || this.polygonMeasurement.lengthElements.length !== 0) {
        //     this.updatePolygonMeasurement();
        //     this.polygonMeasurement.show();
        // }

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );

        if (!this.isTemplate) {
            this.stage.dragControls.add(
                this.rotationPoints,
                this.rotationPoints.moveObject.bind(this.rotationPoints),
                this.rotationPoints.placeObject.bind(this.rotationPoints),
                this.rotationPoints.handleDragStart.bind(this.rotationPoints),
            );
        }

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                const v = this.outlinePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            // disable innerEdge
            for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
                const v = this.innerEdgesObject[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.handleDragEnd.bind(v),
                    v.handleDragStart.bind(v),
                );
                // }
            }
            for (let i = 0, len = this.folds.length; i < len; i += 1) {
                const v = this.folds[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
            for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
                const v = this.outerEdgeObjects[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }

            if (!this.isTemplate) {
                if (this.is3d) {
                    this.rotationPoints.hideObject();
                }
                else {
                    this.rotationPoints.showObject();
                }
            }
        }
        this.isSelected = true;
    }

    hideTestEdges() {
        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].measurementText.hideObject();
        }
        this.outerEdgeObjects.forEach((outerEdgeObject) => {
            outerEdgeObject.measurementText.hideObject();
        });
    }

    changeColorOnSelect() {
        this.solidMaterial.emissive.setHex(0x00f0f0);
    }
    changeColorDeSelect() {
        this.solidMaterial.emissive.setHex(0x000000);
    }

    deSelect() {
        this.coreMesh.material.opacity = 0.25;
        // this.stage.rendererManager.getDomElement().removeEventListener('mousemove', this.onMouseMove, false)
        // hide outline points
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        // disable innerEdge
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            this.innerEdgesObject[i].hideObject();
        }
        for (let i = 0, len = this.folds.length; i < len; i += 1) {
            this.folds[i].hideObject();
        }

        if (!this.isTemplate) {
            this.rotationPoints.hideObject();
        }
        for (let i = 0, len = this.outerEdgeObjects.length; i < len; i += 1) {
            this.outerEdgeObjects[i].hideObject();
        }

        for (let i = 0, len = this.testEdges.length; i < len; i += 1) {
            this.testEdges[i].hideObject();
        }

        // this.rotationPoints.hideObject();

        // hide measurements
        // jugaad to fix no snapping after complex roof deletion
        // if (this.polygonMeasurement) {
        //     if (this.polygonMeasurement.arcElements.length !== 0 || this.polygonMeasurement.lengthElements.length !== 0) {
        //         this.polygonMeasurement.hide();
        //     }
        // }

        // hide setbacks
        // this.hideSetback();

        // hide edge centers
        // this.hideEdgeCenters();
        this.isSelected = false;
    }

    handleVertexDragStart(vertex) {
        // if (!(vertex instanceof InnerEdge || vertex instanceof OuterEdge)) {
        //     // this.polygonMeasurement.handleVertexDragStart(vertex, this.outlinePoints.indexOf(vertex));
        // }
        this.previousIntersectingAcCables = this.getIntersectingAcCables();
    }

    handleVertexMove(vertex, deltaX, deltaY, deltaZ) {
        this.updateOldVertices();
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
        if (this.isTemplate) {
            this.handleVertexMoveDormers(vertex, deltaX, deltaY, deltaZ);
        }
        else {
            try {
                this.updateSmartRoof(false);
                this.getAllSmartroofIntersections(true);
            }
            catch (error) {
                console.error('ERROR: DORMER: handleVertexMove: ', error);
            }
            this.saveState();
        }
    }

    static getReflectiveVector(vector, normal) {
        let reflectiveVector = new THREE.Vector3();
        reflectiveVector = normal.clone();
        const dotResult = vector.dot(normal);
        reflectiveVector.multiplyScalar(2 * dotResult);
        reflectiveVector.sub(vector);
        return reflectiveVector;
    }

    async handleVertexMoveDormers(vertex, deltaX = 0, deltaY = 0, deltaZ = 0) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: DORMER: vertex not in outlinePoints in handleVertexMove');
        }
        const displacementVector = new THREE.Vector3(deltaX, deltaY, 0);
        let bottomLeftVertexIndex = 0;
        let bottomRightVertexIndex = 4;
        let topLeftVertexIndex = 1;
        let topRightVertexIndex = 3;
        let pitchPoint = this.outlinePoints[2].getPosition();
        if (this.type === 'FlatDormer') {
            bottomLeftVertexIndex = 0;
            bottomRightVertexIndex = 3;
            topLeftVertexIndex = 1;
            topRightVertexIndex = 2;
            pitchPoint = this.outlinePoints[topRightVertexIndex]
                .getPosition()
                .add(this.outlinePoints[topLeftVertexIndex].getPosition())
                .multiplyScalar(0.5);
        }


        const normal = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        normal.normalize();
        const reflectiveV = SmartroofModel.getReflectiveVector(displacementVector, normal);
        const headVector = new THREE.Vector3();
        if (this.outlinePoints.indexOf(vertex) === bottomLeftVertexIndex) {
            headVector.subVectors(this.outlinePoints[topLeftVertexIndex].getPosition(), pitchPoint);
        }
        else if (this.outlinePoints.indexOf(vertex) === bottomRightVertexIndex) {
            headVector.subVectors(this.outlinePoints[topRightVertexIndex].getPosition(), pitchPoint);
        }
        headVector.z = 0;
        headVector.normalize();

        const temp = displacementVector.length();

        const dvx = new THREE.Vector3(Math.cos(utils.deg2Rad(this.azimuth)), Math.sin(utils.deg2Rad(this.azimuth)), 0);
        dvx.normalize();
        dvx.multiplyScalar(temp);
        // bottom-left vertex
        if (this.outlinePoints.indexOf(vertex) === bottomLeftVertexIndex) {
            this.outlinePoints[bottomRightVertexIndex].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);

            // done with intersections
            // edge intersection between 1-2 and 0 and normal for 1
            const edge1To2 = [this.outlinePoints[topLeftVertexIndex].getPosition(), pitchPoint];
            const edge0To1 = [
                this.outlinePoints[bottomLeftVertexIndex].getPosition(),
                this.outlinePoints[bottomLeftVertexIndex].getPosition().add(normal),
            ];
            const result = utils.checkLineIntersection(edge0To1, edge1To2);
            // edge intersection between 3-2 and 4 and normal for 3
            const edge3To2 = [this.outlinePoints[topRightVertexIndex].getPosition(), pitchPoint];
            const edge4To3 = [
                this.outlinePoints[bottomRightVertexIndex].getPosition(),
                this.outlinePoints[bottomRightVertexIndex].getPosition().add(normal),
            ];
            const result2 = utils.checkLineIntersection(edge3To2, edge4To3);
            this.outlinePoints[topLeftVertexIndex].setPosition(result.x, result.y, this.outlinePoints[topLeftVertexIndex].getPosition().z);
            this.outlinePoints[topRightVertexIndex].setPosition(result2.x, result2.y, this.outlinePoints[topRightVertexIndex].getPosition().z);
        }
        // bottom-right vertex
        else if (this.outlinePoints.indexOf(vertex) === bottomRightVertexIndex) {
            this.outlinePoints[bottomLeftVertexIndex].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);

            // done with intersection
            // edge intersection between 1-2 and 0 and normal for 1
            const edge1To2 = [this.outlinePoints[topLeftVertexIndex].getPosition(), pitchPoint];
            const edge0To1 = [
                this.outlinePoints[bottomLeftVertexIndex].getPosition(),
                this.outlinePoints[bottomLeftVertexIndex].getPosition().add(normal),
            ];
            const result = utils.checkLineIntersection(edge0To1, edge1To2);
            // edge intersection between 3-2 and 4 and normal for 3
            const edge3To2 = [this.outlinePoints[topRightVertexIndex].getPosition(), pitchPoint];
            const edge4To3 = [
                this.outlinePoints[bottomRightVertexIndex].getPosition(),
                this.outlinePoints[bottomRightVertexIndex].getPosition().add(normal),
            ];
            const result2 = utils.checkLineIntersection(edge3To2, edge4To3);
            this.outlinePoints[topLeftVertexIndex].setPosition(result.x, result.y, this.outlinePoints[topLeftVertexIndex].getPosition().z);
            this.outlinePoints[topRightVertexIndex].setPosition(result2.x, result2.y, this.outlinePoints[topRightVertexIndex].getPosition().z);
        }
        // top-left vertex
        else if (this.outlinePoints.indexOf(vertex) === topLeftVertexIndex) {
            this.outlinePoints[topRightVertexIndex].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }
        // top-right vertex
        else if (this.outlinePoints.indexOf(vertex) === topRightVertexIndex) {
            this.outlinePoints[topLeftVertexIndex].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }

        if (this.type !== 'FlatDormer') {
            let newTilt = this.calculateTilt();
            if (newTilt < 2) {
                newTilt = 2;
            }
            this.changeTilt(newTilt);
        }
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
        this.updateGeometry();
        this.saveState();
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

    hideObjectLayer() {
        for (let i = 0, len = this.objectsGroup.children.length; i < len; i += 1) {
            this.objectsGroup.children[i].layers.disable(0);
        }
        this.coreEdges.visible = false;
    }

    showObjectLayer() {
        // In future if layers are used..  it needs to be checked if the camera and model are in the same layer or not!
        for (let i = 0, l = this.objectsGroup.children.length; i < l; i += 1) {
            this.objectsGroup.children[i].layers.enable(0);
        }
        this.coreEdges.visible = true;
    }

    async handleVertexPlace(vertex) {
        // Temp Fix
        for (let i = 0, len = this.innerEdgesObject.length; i < len; i += 1) {
            const v = this.innerEdgesObject[i];
            this.stage.dragControls.add(
                v,
                v.moveObject.bind(v),
                v.handleDragEnd.bind(v),
                v.handleDragStart.bind(v),
            );
        }

        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        this.updateIntersectingAcCables(this.previousIntersectingAcCables);
        this.previousIntersectingAcCables = [];
        try {
            // place object
            await this.placeObject();

            // after moving fold the subarray of adjacent faces will get removed
            if (vertex instanceof Fold) {
                const children = this.getChildren().filter(smartRoof => smartRoof.id === vertex.faceId ||
                    smartRoof.id === vertex.smartRoofFace.id);
                for (let i = 0; i < children.length; i += 1) {
                    const grandChildren = children[i].getChildren();
                    for (let j = 0; j < grandChildren.length; j += 1) {
                        if (grandChildren[j] instanceof Subarray) {
                            grandChildren[j].removeObject();
                        }
                    }
                }
            }

            const children = this.getChildren();
            const roofObstacles = [];
            for (let i = 0; i < children.length; i++) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        if (
                            grandChildren[j].parent.outerEdge.outlinePoint1Index === this.outlinePoints.indexOf(vertex) ||
                            grandChildren[j].parent.outerEdge.outlinePoint2Index === this.outlinePoints.indexOf(vertex)
                        ) {
                            grandChildren[j].removeObject();
                        }
                        continue;
                    }
                    const child = children[i].removeChild(grandChildren[j]);
                    roofObstacles.push(child);
                }
            }

            for (let i = 0; i < roofObstacles.length; i++) {
                roofObstacles[i].placeObject();
            }

            // update Bounding box & Arc after vertex move
            // use updateRotationPoint() instead of placeObject() of rotationPoint to prevent some unrequired function invoke
            if (this.rotationPoints) this.rotationPoints.updateRotationPoint();

            // update measurement
            // this.polygonMeasurement.handleVertexDragEnd(vertex, this.outlinePoints.indexOf(vertex));

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            // update SAP pane
            this.stage.eventManager.setObjectsSelected(this);
            // to update the mesh in the scene
            this.stage.mergeManager.mergeScene(this);
            this.stage.eventManager.completePolygonModelLoading(notificationObject);
            this.isMoved = true;
            this.saveState();

            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Smartroof Model: handleVertexPlace failed', error);

            this.stage.eventManager.completePolygonModelLoading(notificationObject);

            return Promise.reject(error);
        }
    }

    checkFaceVertices() {
        for (let i = 0; i < this.children.length; i += 1) {
            if (this.children[i].get2DVertices().length < 3) {
                return true;
            }
        }
        return false;
    }

    isInvalidRoof() {
        if (!this.outerEdgeObjects || this.outerEdgeObjects.length === 0) return false;
        let isInvalid = true;
        if (utils.checkClockwise(this.get2DVertices())) {
            return true;
        }
        this.children.forEach((c) => {
            if (c.isValid && c.vertices.length > 0) {
                isInvalid = false;
            }
        });
        return isInvalid || !this.valid;
    }

    isInvalidTemplate() {
        if (this.isTemplate) {
            //
        }
        return false;
    }

    createFaceGeometry(face) {
        if (face && face.isValid && face.vertices.length > 2) {
            const topPoints = face.vertices;
            const bottomPoints = face.vertices.map((point) => {
                return new THREE.Vector3(point.x, point.y, 0);
            });
            const roofGeometry = new NikGeometry().createFromTopAndBottomPoints(topPoints, bottomPoints);
            if (!face.faceMesh) {
                face.createFaceMesh();
            }
            else if (face.faceMesh.geometry){
                face.faceMesh.geometry.dispose();
            }

            face.faceMesh.geometry = roofGeometry;
            const meshGeom = roofGeometry.clone();
            meshGeom.computeVertexNormals();
            face.faceMeshCSG = CSG.fromGeometry(meshGeom);
            return roofGeometry;
        }

        face.createFaceMesh();
        return null;
    }

    async updateObject(properties, setbackFlag = false, forcePlaceObject = false) {
        this.setbackFlag = setbackFlag;
        let updateGeometryRequired = false;
        const handleChildrenRequired = false;
        const options = {
            heightChanged: false,
            prevHeight: null,
            tiltChanged: false,
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
        if (Object.prototype.hasOwnProperty.call(properties, 'coreHeight') &&
            properties.coreHeight !== this.coreHeight && String(properties.coreHeight) !== 'NaN') {
            updateGeometryRequired = updateGeometryRequired || true;
            options.heightChanged = true;
            options.prevHeight = this.coreHeight;
            this.coreHeight = properties.coreHeight;
        }
        if (parseFloat(properties.tilt) >= 0) {
            properties.tilt = parseFloat(properties.tilt);
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt != this.tilt) {
            // handleChildrenRequired = true;
            if (utils.isNumber(properties.tilt) && properties.tilt > 60) {
                properties.tilt = 60;
            }
            if (utils.isNumber(properties.tilt) && this.isTemplate) {
                try {
                    if (this.type === 'GabledDormer') {
                        const maxTilt = this.getMaxTilt();
                        if (properties.tilt < 1) {
                            properties.tilt = 1;
                            this.updateOutlinePointsGabled(1);
                            this.tilt = 1;
                        }
                        else if (properties.tilt > maxTilt) {
                            properties.tilt = maxTilt;
                            this.updateOutlinePointsGabled(maxTilt);
                            this.tilt = maxTilt;
                        }
                        else {
                            this.updateOutlinePointsGabled(properties.tilt);
                            this.tilt = properties.tilt;
                        }
                    }
                    else if (this.type === 'HippedDormer') {
                        const maxTilt = this.getMaxTilt();
                        if (properties.tilt < 1) {
                            properties.tilt = 1;
                            this.updateOutlinePointsHipped(1);
                            this.tilt = 1;
                        }
                        else if (properties.tilt > maxTilt) {
                            properties.tilt = maxTilt;
                            this.updateOutlinePointsHipped(maxTilt);
                            this.tilt = maxTilt;
                        }
                        else {
                            this.updateOutlinePointsHipped(properties.tilt);
                            this.tilt = properties.tilt;
                        }
                    }
                    else if (this.type === 'FlatDormer') {
                        if (properties.tilt < 0) {
                            properties.tilt = 0;
                            this.tilt = 0;
                        }
                        else {
                            this.tilt = properties.tilt;
                        }
                    }
                    updateGeometryRequired = true;
                    options.tiltChanged = true;
                }
                catch (error) {
                    console.error('ERROR: Dormer: Update failed', error);
                    return Promise.reject(error);
                }
            }
            else if (utils.isNumber(properties.tilt) && properties.tilt < 1) {
                properties.tilt = 1;
                options.tiltChanged = true;
                this.tilt = 1;
                updateGeometryRequired = updateGeometryRequired || true;
            }
            else {
                updateGeometryRequired = updateGeometryRequired || true;
                // handleChildrenRequired = true;
                options.tiltChanged = true;
                this.tilt = properties.tilt;
            }
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'lockedParameter') &&
            properties.lockedParameter !== this.lockedParameter) {
            this.lockedParameter = properties.lockedParameter;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'ignored') &&
            properties.ignored !== this.ignored) {
            if (properties.ignored) {
                const childSubarrays = this.getChildSubarrays();
                for (let i = 0; i < childSubarrays.length; i += 1) {
                    childSubarrays[i].removeObject();
                }
            }
            else {
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
        if (Object.prototype.hasOwnProperty.call(properties, 'snapHeight') &&
            properties.snapHeight !== this.snapHeight) {
            if (properties.snapHeight) {
                updateGeometryRequired = updateGeometryRequired || true;
                options.heightChanged = true;
                options.prevHeight = this.coreHeight;
            }
            this.snapHeight = properties.snapHeight;
        }

        if (this.setbackFlag) this.getAllSmartroofIntersections(false,[],this.setbackFlag);

        if (updateGeometryRequired) {
            try {
                this.handlePropertiesUpdate(options);
            }
            catch (error) {
                console.error('ERROR: SmartroofModel: Update failed', error);
                return Promise.reject(error);
            }
        }
        else if (forcePlaceObject) {
            this.placeObject(0,0,true);
        }
        if (handleChildrenRequired) {
            this.stage.lightsManager.setShadowMapParameters();
        }

        const children = this.getChildren();
        if (children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                const grandChildren = children[i].getChildren();
                for (let j = 0; j < grandChildren.length; j++) {
                    if (grandChildren[j] instanceof Dormer) {
                        grandChildren[j].placeObject();
                        grandChildren[j].heightChange = this.coreHeight - options.prevHeight;
                    }
                }
            }
        }
        this.saveState();
        return Promise.resolve(true);
    }
    updateOutlinePointsGabled(newTilt) {
        const normal = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        normal.normalize();
        const deltaNoseLength = this.calculateNoseLengthDelta(newTilt);
        const translateVector = normal.clone().multiplyScalar(deltaNoseLength);
        this.outlinePoints[1].moveObjectWithoutConsequences(translateVector.x, translateVector.y, 0);
        this.outlinePoints[3].moveObjectWithoutConsequences(translateVector.x, translateVector.y, 0);
    }
    updateOutlinePointsHipped(newTilt) {
        const normal = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        normal.normalize();
        const deltaNoseLength = this.calculateNoseLengthDelta(newTilt);
        const translateVector = normal.clone().multiplyScalar(deltaNoseLength);
        this.outlinePoints[1].moveObjectWithoutConsequences(translateVector.x, translateVector.y, 0);
        this.outlinePoints[3].moveObjectWithoutConsequences(translateVector.x, translateVector.y, 0);
    }

    calculateTilt() {
        const topLeftVertexIndex = 1;
        const topRightVertexIndex = 3;
        const pitchPoint = this.outlinePoints[2].getPosition();
        if (this.type === 'FlatDormer') {
            return this.tilt;
        }
        const point1 = this.outlinePoints[topLeftVertexIndex].getPosition();
        const point2 = this.outlinePoints[topRightVertexIndex].getPosition();
        const apex = pitchPoint;
        const midPoint = new THREE.Vector3().addVectors(point1, point2).divideScalar(2);
        const noseLength = apex.distanceTo(midPoint);
        let parentTilt = this.getParent().tilt;
        if (parentTilt < 1) parentTilt = 1;
        const halfWidth = point1.distanceTo(midPoint);
        let tilt = utils.rad2Deg(Math.atan((noseLength * Math.tan(utils.deg2Rad(parentTilt))) / halfWidth));
        const maxTilt = this.getMaxTilt();
        if (tilt < 1) {
            tilt = 1;
        }
        else if (tilt > maxTilt) {
            tilt = maxTilt;
        }
        return tilt;
    }

    calculateNoseLengthDelta(newTilt) {
        let parentTilt = this.getParent().tilt;
        if (parentTilt < 1) parentTilt = 1;
        const point1 = this.outlinePoints[1].getPosition();
        const point2 = this.outlinePoints[3].getPosition();
        const apex = this.outlinePoints[2].getPosition();
        const midPoint = new THREE.Vector3().addVectors(point1, point2).divideScalar(2);
        const prevNoseLength = apex.distanceTo(midPoint);
        const halfWidth = point1.distanceTo(midPoint);
        const maxNoseLength = this.getMaxNoseLenght();
        const noseLength = (halfWidth * Math.tan(utils.deg2Rad(newTilt))) / Math.tan(utils.deg2Rad(parentTilt));
        if (noseLength > maxNoseLength) {
            return maxNoseLength - prevNoseLength;
        }
        return noseLength - prevNoseLength;
    }

    getMaxNoseLenght() {
        const EPSILON = 0.1;
        const p1 = this.outlinePoints[0].getPosition();
        const p2 = this.outlinePoints[4].getPosition();
        const pMid = new THREE.Vector2().addVectors(p1, p2).divideScalar(2);
        const apex = this.outlinePoints[2].getPosition();
        const maxNoseLength = pMid.distanceTo(apex);
        return maxNoseLength - EPSILON;
    }

    getMaxTilt() {
        if (this.type === 'FlatDormer') {
            return 60;
        }
        const EPSILON = 0.1;
        let parentTilt = this.getParent().tilt;
        if (parentTilt < 1) parentTilt = 1;
        const point1 = this.outlinePoints[1].getPosition();
        const point2 = this.outlinePoints[3].getPosition();
        const midPoint = new THREE.Vector3().addVectors(point1, point2).divideScalar(2);
        const halfWidth = point1.distanceTo(midPoint);
        const noseLength = this.getMaxNoseLenght();
        const tilt = utils.rad2Deg(Math.atan((noseLength * Math.tan(utils.deg2Rad(parentTilt))) / halfWidth));
        return tilt - EPSILON;
    }

    handlePropertiesUpdate(options) {
        if (options.tiltChanged) {
            const children = this.getChildren();
            const roofObstacles = [];
            for (let i = 0; i < children.length; i++) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0; j < grandChildren.length; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        grandChildren[j].removeObject();
                        continue;
                    }
                    const child = grandChildren[j];
                    if (!(child instanceof SmartroofModel)) {
                        children[i].removeChild(child);
                    }
                    roofObstacles.push(child);
                }
            }

            for (let i = 0; i < children.length; i++) {
                if (children[i].fold) {
                    children[i].fold.tilt = children[i].tilt;
                    continue;
                }
                else if (utils.isNumber(children[i].tilt) && !children[i].isDeleted) {
                    children[i].tilt = this.getValidTilt(this.tilt);
                    children[i].outerEdge.tilt = this.getValidTilt(this.tilt);
                    children[i].outerEdge.updateOuterEdge();
                }
            }
            try {
                if (this.isTemplate) {
                    this.snapTemplateToParent();
                }
                this.updateSmartRoof();
            }
            catch (error) {
                console.error('properties  tilt update error', error);
            }

            this.children.forEach((face) => {
                face.updateSetback();
                face.updateGeometry();
            });

            for (let i = 0; i < roofObstacles.length; i++) {
                roofObstacles[i].placeObject();
            }
            this.getAllSmartroofIntersections(false,[],true);
        }
        if (options.heightChanged) {
            if (this.isTemplate && this.snapHeight) {
                this.snapTemplateToParent();
                this.updateSmartRoof();
            }
            else {
                const deltaZ = this.coreHeight - options.prevHeight;
                this.roofTextureGeometry.translate(0, 0, deltaZ);
                for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                    this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, deltaZ);
                }
                for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
                    this.outerEdgeObjects[i].moveObjectWithoutConsequences(0, 0, deltaZ);
                }
    
                const children = this.getChildren();
                for (let i = 0, len = children.length; i < len; i += 1) {
                    children[i].moveObject(0, 0, deltaZ);
                }
                try {
                    this.updateSmartRoof();
                }
                catch (error) {
                    console.error('properties  height update error', error);
                }
    
                this.resetGrandParentSolarAccess();
                this.stage.lightsManager.setShadowMapParameters();
                this.placeObject(0,0,true);
            }
        }
    }

    changeCoreHeight(newHeight) {
        const deltaZ = newHeight - this.coreHeight;
        this.roofTextureGeometry.translate(0, 0, deltaZ);
        this.coreHeight = newHeight;
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, deltaZ);
        }
        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            this.outerEdgeObjects[i].moveObjectWithoutConsequences(0, 0, deltaZ);
        }

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            children[i].moveObject(0, 0, deltaZ);
        }
        try {
            this.updateSmartRoof(false);
        }
        catch (error) {
            console.error('Core height change error: ', error);
        }
    }

    changeTilt(newTilt, place = false) {
        this.tilt = newTilt;
        const children = this.getChildren();
        const roofObstacles = [];
        for (let i = 0; i < children.length; i++) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0; j < grandChildren.length; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    grandChildren[j].removeObject();
                    continue;
                }
                const child = children[i].removeChild(grandChildren[j]);
                roofObstacles.push(child);
            }
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].fold) {
                children[i].fold.tilt = children[i].tilt;
                continue;
            }
            else if (children[i].tilt && !children[i].isDeleted) {
                children[i].tilt = this.getValidTilt(this.tilt);
                children[i].outerEdge.tilt = this.getValidTilt(this.tilt);
                children[i].outerEdge.updateOuterEdge();
            }
        }

        this.children.forEach((face) => {
            face.resetEditedVertices();
            face.updateGeometry();
        });

        for (let i = 0; i < roofObstacles.length; i++) {
            roofObstacles[i].placeObject();
        }
        if(this.isTemplate) {
            try {
                if (this.type === 'GabledDormer') {
                    const maxTilt = this.getMaxTilt();
                    if (newTilt < 1) {
                        newTilt = 1;
                        this.updateOutlinePointsGabled(this.tilt, 1);
                        this.tilt = 1;
                    }
                    else if (newTilt > maxTilt) {
                        newTilt = maxTilt;
                        this.updateOutlinePointsGabled(this.tilt, maxTilt);
                        this.tilt = maxTilt;
                    }
                    else {
                        this.updateOutlinePointsGabled(newTilt);
                        this.tilt = newTilt;
                    }
                }
                else if (this.type === 'HippedDormer') {
                    const maxTilt = this.getMaxTilt();
                    if (newTilt < 1) {
                        newTilt = 1;
                        this.updateOutlinePointsHipped(this.tilt, 1);
                        this.tilt = 1;
                    }
                    else if (newTilt > maxTilt) {
                        newTilt = maxTilt;
                        this.updateOutlinePointsHipped(this.tilt, maxTilt);
                        this.tilt = maxTilt;
                    }
                    else {
                        this.updateOutlinePointsHipped(newTilt);
                        this.tilt = newTilt;
                    }
                }
                else if (this.type === 'FlatDormer') {
                    if (newTilt < 0) {
                        newTilt = 0;
                        this.tilt = 0;
                    }
                    else {
                        this.tilt = newTilt;
                    }
                }
            }
            catch (error) {
                console.error('ERROR: Dormer: Update failed', error);
                return Promise.reject(error);
            }
        }
        this.updateFacesWithNewAngles(place);
    }

    updateHeight(arg, place = true) {
        const deltaZ = arg - this.coreHeight;
        if (deltaZ === 0 && !place) {
            return;
        }
        this.roofTextureGeometry.translate(0, 0, deltaZ);
        this.coreHeight = arg;
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, deltaZ);
        }
        for (let i = 0, l = this.outerEdgeObjects.length; i < l; i += 1) {
            this.outerEdgeObjects[i].moveObjectWithoutConsequences(0, 0, deltaZ);
        }

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            children[i].resetEditedVertices();
            children[i].updateHeight(deltaZ);
        }
        try {
            this.updateGeometry();
        }
        catch (error) {
            console.error('update height error', error);
        }
        if (place) {
            for (let i = 0, len = this.children.length; i < len; i += 1) {
                const child = this.getChildren()[i];
                child.updateSetback();
                if (!child.isValid || child.isDeleted) {
                    continue;
                }
                child.placeChildrenSmartRoofs();
            }
            this.resetGrandParentSolarAccess();
            this.stage.lightsManager.setShadowMapParameters();
            this.getAllSmartroofIntersections();
        }
        else {
            this.getAllSmartroofIntersections(false, [], false);
        }
        this.stage.mergeManager.mergeScene(this, false);
    }

    updateGeometry() {

        const faceGeometries = []
        for (let i = 0; i < this.outerEdgeObjects.length; i++) {
            const smartRoofFace = this.outerEdgeObjects[i].smartRoofFace;
            const geo = this.createFaceGeometry(smartRoofFace);
            if (geo) {
                faceGeometries.push(geo);
            }
        }
        for (let i = 0; i < this.folds.length; i++) {
            const smartRoofFace = this.folds[i].smartRoofFace;
            const geo = this.createFaceGeometry(smartRoofFace);
            if (geo) {
                faceGeometries.push(geo);
            }
        }

        if (faceGeometries.length === 0) {
            // this.coreMesh.visible = false;
            return;
        }
        
        const finRoofGeometry = BufferGeometryUtils.mergeGeometries(faceGeometries);


        finRoofGeometry.translate(0, 0, this.baseHeight);

        this.coreMesh.visible = true;
        if (this.stage.selectionControls.getSelectedObjects().includes(this)) {
            // this.polygonMeasurement.show();
        }

        if (this.coreMesh.geometry) this.coreMesh.geometry.dispose();
        this.coreMesh.geometry = finRoofGeometry;
        // for loop iterating over coreedges
        // for (let i = 0, l = this.coreEdges.geometry.vertices.length; i < l; i += 1) {
        //     const v = this.coreEdges.geometry.vertices[i];
        // }

        //call measurementTextUpdate of all testEdge
        this.testEdges.forEach((edge) => {
            edge.measurementTextUpdate();
        });

    }

    getPlacingInformation(vertices) {
        const response = {};
        let numberOfPoints;

        // Getting vertices
        let vertices2DArray;
        if (vertices === null || vertices === undefined) {
            vertices2DArray = this.get2DVertices();
            numberOfPoints = vertices2DArray.length;
        }
        else {
            vertices2DArray = vertices;
            numberOfPoints = vertices2DArray.length - 1;
        }
        let polygonExists = true;
        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;

        const vertices2DVectorArray = utils.convertArrayToVector(vertices2DArray);
        if (!raycastingUtils.areVerticesOnGround(vertices2DVectorArray, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
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
            polygonExists = false;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DVectorArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (vertices2DArray.slice(0, numberOfPoints).length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices2DArray.slice(0, numberOfPoints))) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }
        if (utils.checkVertexEquivalency(vertices2DArray)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (this.isInvalidRoof()) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }

        let erodedVertices;
        if (polygonExists) {
            // To accommodate for snapping
            erodedVertices = utils.setbackPolygon(vertices2DArray, -0.001);
            if (this.isTemplate) {
                const idsToIgnore = [this.uuid];
                this.getChildrenModelUuids(idsToIgnore);
                let offset = 0.001;
                erodedVertices =
                    [
                        [vertices2DArray[2][0] - offset, vertices2DArray[2][1] - offset],
                        [vertices2DArray[2][0] + offset, vertices2DArray[2][1] + offset],
                    ];
                if (this.type === 'FlatDormer') {
                    const point = [(vertices2DArray[2][0] + vertices2DArray[1][0]) * 0.5, (vertices2DArray[2][1] + vertices2DArray[1][1]) * 0.5];
                    erodedVertices =
                    [
                        [point[0] - offset, point[1] - offset],
                        [point[0] + offset, point[1] + offset],
                    ];
                }
                const allBelowModels = raycastingUtils.getAllModelsBelowSmartroof(
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
                let lastVertexIndex = 4;
                if (this.type === 'FlatDormer') {
                    lastVertexIndex = 3;
                }
                const midPoint = new THREE.Vector2(
                    (this.get2DVertices()[0][0] + this.get2DVertices()[lastVertexIndex][0]) / 2,
                    (this.get2DVertices()[0][1] + this.get2DVertices()[lastVertexIndex][1]) / 2,
                );
                let centerPoint = new THREE.Vector2(this.get2DVertices()[2][0], this.get2DVertices()[2][1]);
                if (this.type === 'FlatDormer') {
                    const point = [(vertices2DArray[2][0] + vertices2DArray[1][0]) * 0.5, (vertices2DArray[2][1] + vertices2DArray[1][1]) * 0.5];
                    centerPoint = new THREE.Vector2(point[0], point[1]);
                }
                const ratio = 0.95;
                const checkPoint = new THREE.Vector2(
                    (ratio * centerPoint.x) + ((1 - ratio) * midPoint.x),
                    (ratio * centerPoint.y) + ((1 - ratio) * midPoint.y),
                );

                offset = 0.0001;
                const erodedVerticesMidpoint = [
                    [checkPoint.x - offset, checkPoint.y - offset],
                    [checkPoint.x + offset, checkPoint.y + offset],
                ];

                const allBelowMidPoint = raycastingUtils.getAllModelsBelowSmartroof(
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
                if (
                    newParentMidPoint.uuid === newParent.uuid ||
                    !(newParent instanceof SmartroofFace &&
                    newParentMidPoint instanceof SmartroofFace)
                ) {
                    this.parentTemp = newParent;
                }
                response.parent = this.parentTemp;
                response.height = newHeight;
                if (!(this.parentTemp instanceof SmartroofFace)) {
                    response.errors.push(new Error(OUT_OF_BASE_MODEL_ERROR));
                }
            }
        }
        return response;
    }

    setRestrictions() {
        const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.parent.azimuth)), Math.cos(utils.deg2Rad(this.parent.azimuth)), 0);
        if (this.type !== 'FlatDormer') {
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[3].setMovementRestrictionVector(normalVector);
        }
        else {
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[2].setMovementRestrictionVector(normalVector);
        }
    }

    adjustTiltToParent() {
        let parentTilt = this.getParent().tilt;
        if (parentTilt < 1) parentTilt = 1;
        let validParentTilt = this.getValidTilt(parentTilt);
        try {
            if (this.type === 'GabledDormer') {
                if (validParentTilt < 1) {
                    validParentTilt = 1;
                    this.updateOutlinePointsGabled(1);
                    this.tilt = 1;
                }
                else {
                    this.updateOutlinePointsGabled(validParentTilt);
                    this.tilt = validParentTilt;
                }
            }
            else if (this.type === 'HippedDormer') {
                if (validParentTilt < 1) {
                    validParentTilt = 1;
                    this.updateOutlinePointsHipped(1);
                    this.tilt = 1;
                }
                else {
                    this.updateOutlinePointsHipped(validParentTilt);
                    this.tilt = validParentTilt;
                }
            }
            else if (this.type === 'FlatDormer') {
                // DO NOTHING
                return;
            }
        }
        catch (error) {
            console.error('ERROR: Dormer: Update failed', error);
        }
        this.changeTilt(this.tilt);
    }


    snapTemplateToParent() {
        const EPSILON = 0.0000001;
        if (this.snapHeight) {
            const pointToSnap = this.get3DVertices()[1];
            const line3 = new THREE.Line3(
                new THREE.Vector3(pointToSnap[0], pointToSnap[1], 1000),
                new THREE.Vector3(pointToSnap[0], pointToSnap[1], -1000),
            );
            const parentPlane = this.getParent().plane;
            if (parentPlane) {
                const intersectionPoint = new THREE.Vector3();
                parentPlane.intersectLine(line3, intersectionPoint);
                if (this.type === 'FlatDormer') {
                    const validFace = this.getChildren().find(c => c.isValid && !c.isDeleted);
                    const intersectionPoint2 = new THREE.Vector3();
                    validFace.plane.intersectLine(line3, intersectionPoint2);
                    this.changeCoreHeight(this.coreHeight + (intersectionPoint.z - intersectionPoint2.z));
                }
                else {
                    this.updateHeight(intersectionPoint.z - EPSILON);
                }
            }
        }
    }

    async placeObject(deltaX = 0, deltaY = 0, flag = false) {
        const placingInformation = this.getPlacingInformation();
        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            else if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setPolygonModelOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.modelVertexEquivalentError();
            }
            else if (error.message === INVALID_CORE_HEIGHT_ERROR) {
                this.stage.eventManager.invalidCoreHeightErrorForPolygon();
            }
            else if (error.message === INVALID_TILT_ERROR) {
                this.stage.eventManager.invalidTiltErrorForPolygon();
            }
            else if (error.message === INSUFFICIENT_VERTICES) {
                this.stage.eventManager.setComplexPolygonModelRemoved();
            }
            this.removeObject();
            return Promise.reject(error);
        }
        // move object
        this.moveObject(deltaX, deltaY, -this.baseHeight);
        if (this.isTemplate) {
            if (this.parent !== placingInformation.parent) {
                this.changeParent(placingInformation.parent);
                this.adjustTiltToParent();
            }
            this.snapTemplateToParent();
            this.setRestrictions();
        }
        const oldHeight = this.getZOnTopSurface(...this.get2DVertices()[0]);
        this.deleteInactiveFolds();
        this.updateSmartRoof();

        const deltaZ = this.getZOnTopSurface(...this.get2DVertices()[0]) - oldHeight;
        for (let i = 0, len = this.children.length; i < len; i += 1) {
            if (!this.getChildren()[i].isValid) {
                continue;
            }
            if(flag) this.getChildren()[i].updatedEditedFace();
            else this.getChildren()[i].resetEditedVertices();
            this.getChildren()[i].updateSetback();
            this.getChildren()[i].updateGeometry();
            this.getChildren()[i].moveChildren(0, 0, deltaZ);
            this.getChildren()[i].placeChildrenSmartRoofs();
        }

        this.getAllSmartroofIntersections();
        if (!this.rotationPoints) {
            this.createRotation();
        }

        // update dimensions
        const keys = Object.keys(this.dimensionObjects);
        for (let i = 0; i < keys.length; i += 1) {
            this.dimensionObjects[keys[i]].handleAssociatedObjectPlace(this);
        }

        try {
            await this.handleSiblingConsequences();
            // automation of setbacks
            this.updateSetbacks();

            this.resetGrandParentSolarAccess();
            this.stage.heatMap.removeHeatMapOnModelPlace();
            this.stage.smartRoofSetbackEditMode.updateModelArea();
        }
        catch (error) {
            console.error('ERROR: Smartroof Model: placeObject failed', error);
            return Promise.reject(error);
        }

        if (!this.isSelected) {
            this.deSelect();
        }
        this.saveState();
        this.stage.stateManager.stopContainer();
        if(this.isTemplate) this.maxTilt = this.getMaxTilt();
        //if is template then select ground on place object
        if (this.isSelected && this.isTemplate) {
            this.updateDimensions();
            if(!this.is3d){
                this.stage.selectionControls.setSelectedObject(this);
            }
        }

        return Promise.resolve(true);
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
        if (Object.prototype.hasOwnProperty.call(properties, 'tilt') &&
            properties.tilt !== this.tilt) {
            this.tilt = properties.tilt;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'topHeight') &&
            this.topHeight !== properties.topHeight) {
            this.topHeight = properties.topHeight;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'azimuth') &&
            properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'ignored') &&
            properties.ignored !== this.ignored) {
            this.ignored = properties.ignored;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'snapHeight') &&
            properties.snapHeight !== this.snapHeight) {
            this.snapHeight = properties.snapHeight;
        }
    }

    saveOuterEdges() {
        const outerEdges = [];
        for (let i = 0; i < this.outerEdgeObjects.length; i += 1) {
            outerEdges.push(this.outerEdgeObjects[i].getSaveObjectArray());
        }
        return outerEdges;
    }

    loadOuterEdges(outerEdges) {
        this.outerEdgeObjects = [];
        if (!outerEdges || outerEdges.length === 0) {
            this.makeOuterEdges();
            return;
        }
        for (let i = 0; i < outerEdges.length; i += 1) {
            const outerEdge = new OuterEdge(this, this.stage);
            outerEdge.loadObject(outerEdges[i]);
            this.outerEdgeObjects.push(outerEdge);
        }
    }

    makeOuterEdges() {
        // Create outerEdge objects
        this.outerEdgeObjects = [];
        this.outerEdgesMesh = [];
        this.measurementTextMesh = [];
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            const outerEdge = new OuterEdge(this, this.stage, this.outlinePoints[i], this.outlinePoints[(i + 1) % l], i, (i + 1) % l, this.coreHeight);
            this.outerEdgeObjects.push(outerEdge);
        }
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: SmartroofModel.getObjectType(),
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
        polygonModelData.tilt = this.tilt;
        polygonModelData.ignored = this.ignored;
        polygonModelData.snapHeight = this.snapHeight;
        polygonModelData.isTemplate = this.isTemplate;
        polygonModelData.azimuth = this.azimuth;
        polygonModelData.dormerType = this.type;

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

        // saving outerEdgeObjects
        const outerEdgeObjects = [];
        if (this.outerEdgeObjects) {
            for (let i = 0; i < this.outerEdgeObjects.length; i += 1) {
                outerEdgeObjects.push(this.outerEdgeObjects[i].getSaveObjectArray());
            }
        }
        polygonModelData.outerEdgeObjects = outerEdgeObjects;

        const folds = [];
        if (this.folds) {
            for (let i = 0, len = this.folds.length; i < len; i += 1) {
                const position = this.folds[i].getPosition();
                if (position) {
                    folds.push({
                        x: position.x,
                        y: position.y,
                        z: position.z,
                        foldType: this.folds[i].foldType,
                        faceId: this.folds[i].faceId,
                        tilt: this.folds[i].tilt,
                    });
                }
            }
            polygonModelData.folds = folds;
        }

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        return polygonModelData;
    }

    static validateObject(polygonModelData) {
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

        return { isValid: true };
    }

    loadObject(polygonModelData, isPaste = false) {
        this.oldVertices = [];
        if (!SmartroofModel.validateObject(polygonModelData).isValid) {
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

        let isNewDesign = true;
        if (polygonModelData.folds) {
            for (let i = 0, len = polygonModelData.folds.length; i < len; i += 1) {
                if (!polygonModelData.folds[i].faceEdge) {
                    isNewDesign = false;
                }
            }
        }
        if (!polygonModelData.skeletonFaces || polygonModelData.skeletonFaces.length < 1) {
            isNewDesign = false;
        }
        if (!polygonModelData.edgePlanes) {
            isNewDesign = false;
        }

        if (polygonModelData.outerEdgeObjects) {
            isNewDesign = true;
        }

        if (isNewDesign) {
            // load polygon properties
            this.baseHeight = polygonModelData.baseHeight;
            this.coreHeight = polygonModelData.coreHeight;
            this.tilt = polygonModelData.tilt;
            this.ignored = polygonModelData.ignored;
            this.topHeight = polygonModelData.topHeight;
            this.snapHeight = polygonModelData.snapHeight;
            this.isTemplate = polygonModelData.isTemplate;
            if (this.isTemplate) {
                this.type = polygonModelData.dormerType;
            }
            this.azimuth = polygonModelData.azimuth;

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
            // create polygon measurement
            // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage);
            this.coreMesh.geometry.computeBoundingSphere();

            // load children
            const { children } = polygonModelData;
            for (let i = 0, len = children.length; i < len; i += 1) {
                if (children[i].type === SmartroofFace.getObjectType()) {
                    const smartroofFace = new SmartroofFace(this.stage);
                    this.addChild(smartroofFace);
                    smartroofFace.loadObject(children[i], isPaste);
                    if (smartroofFace.getParent() !== this) {
                        console.error('Smartroof Model: Mismatch in parent while loading Smartroof Model');
                    }
                }
                else {
                    console.error('Smartroof Model: Invalid object type in loadObject');
                }
            }

            // load outerEdgeObjects
            const { outerEdgeObjects } = polygonModelData;
            this.outerEdgeObjects = [];

            if (!outerEdgeObjects) {
                // Create outerEdge objects and their associated faces
                this.outerEdgeObjects = [];
                this.outerEdgesMesh = [];
                this.measurementTextMesh = [];
                for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                    const smartRoofFace = this.children.find(child => child.edge[0] === i);
                    const outerEdge = new OuterEdge(
                        this,
                        this.stage,
                        this.outlinePoints[i],
                        this.outlinePoints[(i + 1) % l],
                        i,
                        (i + 1) % l,
                        smartRoofFace.outerEdgeHeight,
                        !smartRoofFace.isDeleted,
                        smartRoofFace.tilt,
                        smartRoofFace,
                    );
                    this.outerEdgeObjects.push(outerEdge);
                }
            }
            else if (isPaste && outerEdgeObjects) {
                for (let i = 0, len = outerEdgeObjects.length; i < len; i += 1) {
                    const outerEdgeLoadObject = outerEdgeObjects[i];
                    const outerEdgeObject = new OuterEdge(
                        this,
                        this.stage,
                        this.outlinePoints[outerEdgeLoadObject.outlinePoint1Index],
                        this.outlinePoints[outerEdgeLoadObject.outlinePoint2Index],
                        outerEdgeLoadObject.outlinePoint1Index,
                        outerEdgeLoadObject.outlinePoint2Index,
                        outerEdgeLoadObject.height,
                        outerEdgeLoadObject.isPitched,
                        outerEdgeLoadObject.tilt,
                        this.children.find(child => child.outerEdgeId === outerEdgeLoadObject.id),
                    );
                    this.outerEdgeObjects.push(outerEdgeObject);
                }
            }
            else {
                for (let i = 0, len = outerEdgeObjects.length; i < len; i += 1) {
                    const outerEdgeLoadObject = outerEdgeObjects[i];
                    const outerEdgeObject = new OuterEdge(
                        this,
                        this.stage,
                        this.outlinePoints[outerEdgeLoadObject.outlinePoint1Index],
                        this.outlinePoints[outerEdgeLoadObject.outlinePoint2Index],
                        outerEdgeLoadObject.outlinePoint1Index,
                        outerEdgeLoadObject.outlinePoint2Index,
                        outerEdgeLoadObject.height,
                        outerEdgeLoadObject.isPitched,
                        !utils.isNumber(parseFloat(outerEdgeLoadObject.tilt)) ? 20 : parseFloat(outerEdgeLoadObject.tilt),
                        this.children.find(child => child.id === outerEdgeLoadObject.id),
                    );
                    this.outerEdgeObjects.push(outerEdgeObject);
                }
            }

            const { folds } = polygonModelData;
            this.folds = [];
            if (isPaste) {
                for (let i = 0, len = folds.length; i < len; i += 1) {
                    const foldLoadObject = folds[i];
                    const fold = new Fold(
                        foldLoadObject.x,
                        foldLoadObject.y,
                        foldLoadObject.z,
                        this,
                        this.stage,
                        foldLoadObject.foldType,
                        this.children.find(child => child.foldId === foldLoadObject.faceId),
                    );
                    fold.tilt = foldLoadObject.tilt;
                    this.folds.push(fold);
                }
            }
            else {
                for (let i = 0, len = folds.length; i < len; i += 1) {
                    const foldLoadObject = folds[i];
                    const fold = new Fold(
                        foldLoadObject.x,
                        foldLoadObject.y,
                        foldLoadObject.z,
                        this,
                        this.stage,
                        foldLoadObject.foldType,
                        this.children.find(child => child.id === foldLoadObject.faceId),
                    );
                    fold.tilt = foldLoadObject.tilt;
                    this.folds.push(fold);
                }
            }
            this.updateSmartRoof();
            this.updatePolygonMeasurement();
        }
        else {
            // load polygon properties
            this.baseHeight = polygonModelData.baseHeight;
            this.coreHeight = polygonModelData.coreHeight;
            this.tilt = polygonModelData.tilt;
            this.ignored = polygonModelData.ignored;
            this.topHeight = polygonModelData.topHeight;

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
            if (utils.checkClockwise(this.get2DVertices())) {
                this.outlinePoints.reverse();
            }
            this.updateOldVertices();
            // create polygon measurement
            // this.polygonMeasurement = new PolygonMeasurement(this.oldVertices, this, this.stage);
            this.coreMesh.geometry.computeBoundingSphere();


            const { children } = polygonModelData;
            const oldFoldIds = [];
            if (polygonModelData.folds) {
                polygonModelData.folds.forEach((fold) => {
                    if (fold.faceId) {
                        oldFoldIds.push(fold.faceId);
                    }
                    if (utils.isNumber(fold[4]) && utils.isNumber(fold[5])) {
                        children.forEach((child) => {
                            if (child.edge[0] === fold[4] && child.edge[1] === fold[5]) {
                                oldFoldIds.push(child.id);
                            }
                        });
                    }
                });
            }
            for (let i = 0, len = children.length; i < len; i += 1) {
                if (children[i].type === SmartroofFace.getObjectType() && !(oldFoldIds.includes(children[i].id))) {
                    const smartroofFace = new SmartroofFace(this.stage);
                    this.addChild(smartroofFace);
                    smartroofFace.loadObject(children[i], isPaste);
                    if (smartroofFace.getParent() !== this) {
                        console.error('Smartroof Model: Mismatch in parent while loading PolygonModel');
                    }
                }
                else {
                    console.error('Smartroof Model: Invalid object type in loadObject');
                }
            }
            // Create outerEdge objects and their associated faces
            this.outerEdgeObjects = [];
            this.outerEdgesMesh = [];
            this.measurementTextMesh = [];
            for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
                const smartRoofFace = this.children.find(child => child.edge[0] === i);
                const height = smartRoofFace.outerEdgeHeight ? smartRoofFace.outerEdgeHeight : this.coreHeight;
                const outerEdge = new OuterEdge(
                    this,
                    this.stage,
                    this.outlinePoints[i],
                    this.outlinePoints[(i + 1) % l],
                    i,
                    (i + 1) % l,
                    height,
                    !smartRoofFace.isDeleted,
                    smartRoofFace.tilt,
                    smartRoofFace,
                );
                this.outerEdgeObjects.push(outerEdge);
            }

            try {
                this.updateSmartRoof();
                // this.updatePolygonMeasurement();
            }
            catch (error) {
                console.error('Smartroof Model: Error while updating smartroof', error);
            }
        }
        this.children.forEach((child) => {
            child.updatedEditedFace();
        });

        this.outerEdgeObjects.forEach(outerEdgeobj =>{
            outerEdgeobj.onDeselect();
        })

        if ( this.isTemplate ) {
            this.maxTilt = this.getMaxTilt();
        }

        if (this.isInvalidRoof()) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });

            this.stage.sceneManager.scene.remove(this.objectsGroup);

            if (this.getParent() !== null) {
                this.getParent().removeChild(this);
            }
            this.removeObject();


            this.stage.eventManager
                .customErrorMessage('Polygon data invalid: Polygon removed');
            return;
        }
        if (!this.rotationPoints) {
            this.createRotation();
        }
        else {
            this.rotationPoints.removeObject();
            this.createRotation();
        }
        if (!this.isSelected) {
            this.hideSelectables();
        }
        else {
            this.showSelectables();
        }
        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    objectType(){
        return 'SmartRoofModel';
    }

    async updateFacesWithNewAngles(place = true) {
        const children = this.getChildren();
        for (let i = 0; i < children.length; i++) {
            if (!children[i].isDeleted && !children[i].fold && this.tilt !== children[i].tilt) {
                this.tilt = 'custom';
                break;
            }
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].fold) {
                children[i].fold.tilt = children[i].tilt;
                continue;
            }
        }

        if (place) {
            try {
                await this.placeObject();
                for (let i = 0; i < children.length; i++) {
                    children[i].updatePanels();
                }
            }
            catch (e) {
                console.error(new Error(), e);
            }
        }
        else {
            try {
                this.updateSmartRoof(false);
            }
            catch (e) {
                console.error('Failed to update faces with new angles', e);
            }

            this.getAllSmartroofIntersections(false, [], false);
        }

    }
    getPitch() {
        const deltaZ = Math.abs(this.outlinePoints[4].getPosition().z - this.pitchPoint.z);
        const deltaV = this.pitchPoint.clone().sub(this.outlinePoints[4].getPosition()).length();
        return utils.rad2Deg(Math.asin(deltaZ / deltaV));
    }

    getAllSmartroofIntersections(singleUpdate = false, roofsToExclude = [], setbackFlag = true) {
        this.clearCoreEdges();
        this.getCSGIntersections(singleUpdate, roofsToExclude, setbackFlag);
        this.getChildren().forEach((face) => {
            face.getChildren().forEach((c) => {
                if (c instanceof SmartroofModel) {
                    c.getAllSmartroofIntersections(singleUpdate);
                }
            });
            if (!this.is3d) face.updateRafter();
        });
        if (!this.is3d) {
            this.getChildren().forEach((face) => {
                face.updateRafter();
            });
        }
    }

    clearCoreEdges() {
        this.coreEdges.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        this.coreEdges.clear();
    }

    addIntersectingRoof(roof) {
        if (!this.previousIntersectingRoofs) {
            this.previousIntersectingRoofs = [];
        }
        if (!this.previousIntersectingRoofs.includes(roof)) {
            this.previousIntersectingRoofs.push(roof);
        }
    }

    drawPolygon(vertices) {
        const color = 0xff0000 + Math.floor(Math.random() * 0x00ffff);
        for (let i = 0; i < vertices.length; i++) {
            this.drawEdge(vertices[i], vertices[(i + 1) % vertices.length], color, 10);
        }
    }

    drawPolygon2D(vertices) {
        const color = 0xff0000 + Math.floor(Math.random() * 0x00ffff);
        for (let i = 0; i < vertices.length; i++) {
            this.drawEdge2D(vertices[i], vertices[(i + 1) % vertices.length], color);
        }
    }

    clearTestEdges() {
        this.testEdges.forEach((edge) => {
            edge.removeObject();
        });
        this.testEdges = [];
    }


    getCSGIntersections(singleUpdate = false, roofsToExclude = [], setbackFlag = true) {
        this.setbackFlag = setbackFlag;
        this.coreEdgeCoordinates = [];
        this.clearCoreEdges();
        const children = this.getChildren();
        let otherRoofsToUpdate;
        if (!this.previousIntersectingRoofs) {
            otherRoofsToUpdate = [];
        }
        else {
            otherRoofsToUpdate = [...this.previousIntersectingRoofs];
        }

        if (roofsToExclude.includes(this)) {
            if (!singleUpdate) {
                otherRoofsToUpdate.forEach(r => {
                    r.getCSGIntersections(true, roofsToExclude, setbackFlag);
                    // to update rafters of the smartroofmodel to which its intersected
                    r.updateRafter();
                });
            }
            return;
        }
        roofsToExclude.push(this);

        for (let i = 0; i < children.length; i++) {
            const face = children[i];
            if (!face.isValidFace() || !face.faceMeshCSG) continue;
            // const objectsInQuadrant = this.stage.quadTreeManager.getObjectsInQuadrant(utils.getBoundingBox(face.get2DVertices())).filter(o => o.parent !== this);
            const objectsInQuadrant = Array.from(this.stage.ground.faces).filter(o =>
                o.isValidFace() &&
                o.parent !== this
                ).filter(o => gjk.intersect(o.vertices, face.vertices));
            let resultantFaceCSG = face.faceMeshCSG.clone();

            const facesInBoundingBox = [];

            objectsInQuadrant.forEach((object) => {
                if (
                    object instanceof SmartroofFace &&
                    !facesInBoundingBox.includes(object) &&
                    object.faceMeshCSG && object.parent
                    ) {
                    facesInBoundingBox.push(object);
                    object.parent.addIntersectingRoof(this);
                    if (!otherRoofsToUpdate.includes(object.parent) && !roofsToExclude.includes(object.parent)) {
                        otherRoofsToUpdate.push(object.parent);
                        this.addIntersectingRoof(object.parent);
                    }
                }
            });

            if (facesInBoundingBox.length === 0) {
                const originalFaceVertices = face.getVector3DVertices();
                for (let i = 0, l = originalFaceVertices.length; i < l; i++) {
                    this.coreEdgeCoordinates.push(originalFaceVertices[i].clone(), originalFaceVertices[(i + 1) % l].clone());
                }
                this.coreEdges.add(new THREE.LineSegments(
                    new THREE.BufferGeometry().setFromPoints(this.coreEdgeCoordinates),
                    this.mergeEdgeMaterial2D,
                ));
                face.setbackVertices = [originalFaceVertices];
                face.setbackVerticesReset = true;
                if (this.setbackFlag) face.updateSetback();
                face.updateGeometry();
                continue;
            }

            const vectorPolygons = [];
            for (let j = 0; j < facesInBoundingBox.length; j++) {
                const otherFace = facesInBoundingBox[j];
                const otherCSG = otherFace.faceMeshCSG.clone();
                resultantFaceCSG = resultantFaceCSG.clone().subtract(otherCSG);
            }
            resultantFaceCSG.polygons.forEach((p) => {
                if (Math.abs(face.plane.normal.dot(new THREE.Vector3(p.plane.normal.x, p.plane.normal.y, p.plane.normal.z))) > 0.9 &&
                Math.abs(Math.abs(p.plane.w) - Math.abs(face.plane.constant)) < 0.001) {
                    const vectorPolygon = p.vertices.map(v => new THREE.Vector3(v.pos.x, v.pos.y, v.pos.z));
                    vectorPolygons.push(vectorPolygon);
                }
            });


            const result = unionUtils.altUnionOfConvexPolygons(vectorPolygons);
            let loops = result.loops;
            if (loops.length === 0) {
                loops = unionUtils.unionOfConvexPolygons(vectorPolygons).loops;
            }


            // remove collinear points
            Object.values(loops).forEach((vertices) => {
                let collinearFlag = true;
                while(collinearFlag) {
                    collinearFlag = false;
                    for (let j = 0; j < vertices.length; j += 1) {
                        const vertex = vertices[j];
                        const vertexNext = vertices[(j + 1) % vertices.length];
                        const vertexPrev = vertices[((j - 1) + vertices.length) % vertices.length];
                        if (utils.checkCollinear(vertex, vertexNext, vertexPrev, 0.0001)) {
                            collinearFlag = true;
                            vertices.splice(j, 1);
                            j -= 1;
                        }
                    }
                }
            });
            loops = loops.filter(l => l.length > 2);

            Object.values(loops).forEach((vertices) => {
                for (let i = 0; i < vertices.length; i++) {
                    this.coreEdgeCoordinates.push(vertices[i].clone(), vertices[(i + 1) % vertices.length].clone());
                }
            });

            loops = loops.filter(l => l.length > 2);
            const setbackLoops = loops
                .map(loop => utils.removeSharpCorners(loop))
                .filter(l =>  l.length > 2);

            face.setbackVertices = setbackLoops;
            face.setbackVerticesReset = true;
            if (this.setbackFlag) face.updateSetback();
            face.updateGeometry();
        }

        this.coreEdges.add(new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(this.coreEdgeCoordinates),
            this.mergeEdgeMaterial2D,
        ));

        if (!singleUpdate) {
            otherRoofsToUpdate.forEach(r => {
                r.getCSGIntersections(true, roofsToExclude,setbackFlag);
                // to update rafters of the smartroofmodel to which its intersected
                r.updateRafter();
            });
        }
        this.setbackFlag = true;
        this.updateDimensions();
    }

    updateDimensions() {
        if (Date.now() - this.timeStamp > 18) {
            this.clearTestEdges();
            this.createEdgeObjects();
            this.timeStamp = Date.now();
        }
    }

    makeEdgesVisible() {
        for (let i = 0; i < this.testEdges.length; i++) {
            this.testEdges[i].measurementText.objectsGroup.visible = true;
        }
    }
        

    createEdgeObjects() {
        // iterating through every coreEdge and creating a Edge object
        const precision = 10000;
        const checkSet = new Set();
        for (let i = 0; i < this.outerEdgeObjects.length; i++) {
            checkSet.add(this.outerEdgeObjects[i].edgeHash);
            checkSet.add(this.outerEdgeObjects[i].reverseEdgeHash);
        }

        for (let i = 0; i < this.coreEdgeCoordinates.length; i += 2) {
            const currentVertex = this.coreEdgeCoordinates[i];
            const nextVertex = this.coreEdgeCoordinates[i + 1];
            const currentVertexHash = `${Math.round(currentVertex.x * precision)},${Math.round(currentVertex.y * precision)}`;
            const nextVertexHash = `${Math.round(nextVertex.x * precision)},${Math.round(nextVertex.y * precision)}`;

            const edgeHash = `${currentVertexHash}_${nextVertexHash}`;
            const reverseEdgeHash = `${nextVertexHash}_${currentVertexHash}`;
            if (!checkSet.has(edgeHash)) {
                const edgeObject = new Edge(this, this.stage, this.coreEdgeCoordinates[i], this.coreEdgeCoordinates[i + 1], true);
                edgeObject.editable = false;
                this.testEdges.push(edgeObject);
                checkSet.add(edgeHash);
                checkSet.add(reverseEdgeHash);
            }
        }

    }

    getBaseSmartroof() {
        let baseSmartroof = this;
        let parent = baseSmartroof.parent;
        while (parent instanceof SmartroofFace) {
            baseSmartroof = parent.getParent();
            parent = baseSmartroof.getParent();
        }
        return baseSmartroof;
    }

    deleteFold(fold) {
        const i = this.folds.indexOf(fold);
        if (i !== -1) {
            this.removeChild(fold.smartRoofFace);
            fold.smartRoofFace.removeObject();
            this.folds.splice(i, 1);
            fold.removeObject();
        }
    }

    deleteInactiveFolds() {
        this.folds.forEach((fold) => {
            if (!fold.isActive) {
                this.deleteFold(fold);
            }
        });
    }

    async handleOuterEdgeDragEnd() {
        await this.placeObject();
        // use updateRotationPoint() instead of placeObject() of rotationPoint to prevent some unrequired function invoke
        if (this.rotationPoints) this.rotationPoints.updateRotationPoint();
        // to update the mesh in the scene
        this.stage.mergeManager.mergeScene(this);
    }

    async handleInnerEdgeDragEnd(innerEdge) {
        await this.placeObject(0,0,false);
        const roofObstacles = [];
        const children = [innerEdge.adjacentFace1, innerEdge.adjacentFace2];
        for (let i = 0; i < children.length; i += 1) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0, k = grandChildren.length; j < k; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    grandChildren[j].removeObject();
                    continue;
                }
                const child = children[i].removeChild(grandChildren[j]);
                roofObstacles.push(child);
            }
        }
        for (let i = 0; i < roofObstacles.length; i++) {
            roofObstacles[i].placeObject();
        }

        // make all the testEdges to be visible
        this.testEdges.forEach((testEdge) => {
            testEdge.measurementText.showObject();
        });


        // to update the mesh in the scene
        this.stage.mergeManager.mergeScene(this);
    }

    clearObstacles() {
        const children = this.getChildren();
        const roofObstacles = [];
        for (let i = 0; i < children.length; i++) {
            const grandChildren = [...children[i].getChildren()];
            for (let j = 0, k = grandChildren.length; j < k; j++) {
                if (grandChildren[j] instanceof Subarray) {
                    const panels = grandChildren[j].getPanels();
                    panels.forEach((panel) => {
                        if (panel.electricalComponentConnected) panel.electricalComponentConnected.removeObject();
                    });
                    grandChildren[j].removeObject();
                    continue;
                }
                const child = children[i].removeChild(grandChildren[j]);
                roofObstacles.push(child);
            }
        }

        for (let i = 0; i < roofObstacles.length; i++) {
            roofObstacles[i].placeObject();
        }
    }

    drawEdge(point1, point2, color = 0x0000ff, offSet = 0) {
        const material = new THREE.LineBasicMaterial({ color });
        const points = [];
        points.push(new THREE.Vector3(point1.x, point1.y, point1.z + offSet));
        points.push(new THREE.Vector3(point2.x, point2.y, point2.z + offSet));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const edge = new THREE.LineSegments(geometry, material);
        this.objectsGroup.add(edge);
    }

    drawEdge2D(point1, point2, color = 0x0000ff, height = 20) {
        const material = new THREE.LineBasicMaterial({ color });
        const points = [];
        points.push(new THREE.Vector3(point1.x, point1.y, height));
        points.push(new THREE.Vector3(point2.x, point2.y, height));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const edge = new THREE.LineSegments(geometry, material);
        this.objectsGroup.add(edge);
    }    

    drawOuterEdge(outerEdge, color = 0x0000ff) {
        const material = new THREE.LineBasicMaterial({ color });
        const points = [];
        points.push(new THREE.Vector3(outerEdge.point1.x, outerEdge.point1.y, 100));
        points.push(new THREE.Vector3(outerEdge.point2.x, outerEdge.point2.y, 100));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const edge = new THREE.Line(geometry, material);
        this.skeletonGroup.add(edge);
    }

    drawCircle(point1) {
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const geometry = new THREE.CircleGeometry(1, 10);
        const circle = createMesh(geometry, material);
        circle.position.set(point1.x, point1.y, 2);
        this.objectsGroup.add(circle);
    }

    drawCircleGreen(point1, offSet = 0) {
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const geometry = new THREE.CircleGeometry(0.01, 10);
        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(point1.x, point1.y - offSet, 30);
        this.objectsGroup.add(circle);
    }

    drawCircleRed(point1) {
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const geometry = new THREE.CircleGeometry(0.1, 10);
        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(point1.x, point1.y, 30);
        this.objectsGroup.add(circle);
    }

    drawCircleYellow(point1) {
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const geometry = new THREE.CircleGeometry(0.4, 10);
        const circle = createMesh(geometry, material);
        circle.position.set(point1.x, point1.y, 2.5);
        this.skeletonGroup.add(circle);
    }

    // Visual functions
    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.POLYGON;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        this.switchTo3D();
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.coreMesh.castShadow = true;
            // add roof texture mesh

            if (this.coreMesh.material !== this.solidMaterial) {
                this.coreMesh.material = this.solidMaterial;
                this.coreEdges.children.forEach((edge) => {
                    edge.material = this.edgesolidMaterial;
                });
                this.intersectingLineMaterial = this.edgesolidMaterial;
            }
        }
        else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.coreMesh.castShadow = false;
            if (this.coreMesh.material !== this.translucentMaterial2D) {
                this.coreMesh.material = this.translucentMaterial2D;
                this.coreEdges.children.forEach((edge) => {
                    edge.material = this.translucentEdgeMaterial2D;
                });
                this.intersectingLineMaterial = this.translucentEdgeMaterial2D;
            }
        }
        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.coreMesh);
        for (let i = 0; i < this.coreEdges.children.length; i++) {
            visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.coreEdges.children[i]);
        }

        if (newColors.OUTLINE_POINT_COLOR !== undefined && newColors.OUTLINE_POINT_COLOR !== null) {
            this.updateOutlinePointsVisuals(newColors.OUTLINE_POINT_COLOR);
        }
        else {
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

    /**
     * "Get the lat/long vertices of all the faces which are not deleted in the model, and return them in an array."
     *
     * @returns An array of objects. Each object has two properties: vertices and faceId.
     */
    getFaceLatLongs() {
        const faceCoords = [];
        for (let i = 0; i < this.children.length; i += 1) {
            if (!this.children[i].isDeleted) {
                faceCoords.push({
                    vertices: this.children[i].getLongLatVertices(),
                    faceId: this.children[i].getUUID(),
                });
            }
        }
        return faceCoords;
    }

    async handleSiblingConsequences() {
        this.updateIntersectingAcCables(this.getIntersectingAcCables());
        const allPromises = [];

        const siblings = [];
        this.getParent().getChildren().forEach((child) => {
            if (child instanceof SmartroofModel) {
                child.getChildren().forEach((gChild) => {
                    gChild.getChildren().forEach((ggChild) => {
                        siblings.push(ggChild);
                    });
                });
            }
        });
        this.getParent().getChildren().forEach((child) => {
            child.getChildren().forEach((gChild) => {
                siblings.push(gChild);
            });
        });
        this.getParent().getChildren().forEach((child) => {
            siblings.push(child);
        });
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            const sibling = siblings[i];
            if (sibling instanceof Subarray && !this.ignored) {
                // TO:DO - consider outside setback?
                const group = this.get2DVertices();
                if (sibling.getParent() instanceof SmartroofFace) {
                    let faceArea = JSTSConverter.verticesToJSTSPolygon(sibling.getParent().get2DVertices());
                    const placableAreas = [];
                    const removableAreas = [];
                    sibling.getParent().setbackVertices.forEach((loop) => {
                        const loopArray = loop.map(v => [v.x, v.y]);
                        if (utils.checkClockwise(loopArray)) removableAreas.push(JSTSConverter.verticesToJSTSPolygon(loopArray));
                        else placableAreas.push(JSTSConverter.verticesToJSTSPolygon(loopArray));
                    });
                    removableAreas.forEach((geom) => {
                        for (let j = 0, n = geom.getNumGeometries(); j < n; j++) {
                            const vertices = geom.getGeometryN(j).getCoordinates().map(c => [c.x, c.y]);
                            sibling.deleteTableInsideArea(vertices);
                        }
                    });
                    placableAreas.forEach((geom) => {
                        for (let j = 0, n = geom.getNumGeometries(); j < n; j++) {
                            const area = geom.getGeometryN(j);
                            if (faceArea.intersects(area)) {
                                faceArea = faceArea.difference(area);
                            }
                        }
                    });

                    for (let j = 0, n = faceArea.getNumGeometries(); j < n; j++) {
                        if (sibling.getParent() === null) break;
                        const vertices = faceArea.getGeometryN(j).getCoordinates().map(c => [c.x, c.y]);
                        sibling.deleteTableInsideArea(vertices);
                    }
                }
                else {
                    sibling.deleteTableInsideArea(group);
                }
            }
            else if (sibling instanceof Walkway) {
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
        }
        catch (error) {
            console.error('ERROR: Smartroof Model: handleSiblingConsequences failed', error);
        }
        return Promise.resolve(true);
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

    get3DVectorVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const outlinePoint = this.outlinePoints[i].getPosition();
            vertices.push(outlinePoint);
        }
        return vertices;
    }

    getBaseHeight() {
        return this.baseHeight;
    }

    getHighestZ() {
        let highestZ = 0;
        const { array } = this.coreMesh.geometry.attributes.position;

        for (let i = 0; i < array.length; i += 3) {
            const z = array[i + 2];

            if (z) {
                highestZ = Math.max(highestZ, z);
            }
        }
        return highestZ;
    }

    getChildrenModelUuids(ids) {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (
                children[i] instanceof PolygonModel ||
                children[i] instanceof CylinderModel ||
                children[i] instanceof SmartroofFace ||
                children[i] instanceof Dormer
            ) {
                ids.push(children[i].uuid);
                children[i].getChildrenModelUuids(ids);
            }
        }
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
            let angle = utils.toDegrees(Math.atan2((vertices[idx + 1][1] - vertices[idx][1]), -(vertices[idx + 1][0] - vertices[idx][0])));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }

    getZOnTopSurface(x, y) {
        // should return 0
        if (this.outlinePoints.length === 0) {
            console.error('ERROR: Smartroof Model: has outline points null');
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

    hasPanel() {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof SmartroofFace) {
                if (children[i].hasPanel()) {
                    return true;
                }
            }
        }
        return false;
    }

    isSubarrayPresent() {
        return this.getChildSubarrays().length > 0;
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
        if (this.rotationPoints) this.rotationPoints.hideObject();
    }

    static deleteSmartRoofFace(outerEdgeObject) {
        const outerEdge = outerEdgeObject;
        const face = outerEdge.smartRoofFace;
        const i = 0;
        while (face.getChildren().length > i) {
            face.getChildren()[i].removeObject();
        }
        outerEdge.isPitched = false;
        outerEdge.tilt = 90;
        face.isDeleted = true;
        face.tilt = 90;
        face.plane = face.outerPlane;
        face.isDeleted = true;
        face.isValid = false;
        face.vertices = [];
        face.updateOutlinePoints([]);
    }

    removeObject() {
        // First deleting child subarray before other objects so that deleting walkways or other
        // objects don't refresh the subarray unnecessarily
        const childSubarrays = this.getChildSubarrays();
        for (let i = 0, len = childSubarrays.length; i < len; i += 1) {
            childSubarrays[i].removeObject();
        }

        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[this.getChildren().length - 1].removeObject(false);
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

        // remove measurements
        // if (this.polygonMeasurement) this.polygonMeasurement.remove();

        // Remove outline points
        for (let j = this.outlinePoints.length - 1; j >= 0; j -= 1) {
            this.outlinePoints[j].removeObject();
            this.outlinePoints.splice(j, 1);
        }
        for (let j = this.folds.length - 1; j >= 0; j -= 1) {
            this.folds[j].removeObject();
            this.folds.splice(j, 1);
        }
        this.innerEdgesObject.forEach(edge => edge.removeObject());
        this.innerEdgesObject = [];
        this.innerEdgesMesh = [];
        this.outerEdgeObjects.forEach((outerEdge) => {
            outerEdge.removeObject();
        });
        this.outerEdgesMesh = [];
        this.measurementTextMesh = [];

        this.removeRoofTexture();
        // for (let j = 0, l = this.edgeCentrePoints.length; j < l; j += 1) {
        //     this.edgeCentrePoints[j].removeObject();
        // }
        if (this.rotationPoints) this.rotationPoints.removeObject();

        // from base object
        this.removeDimensions();
        this.getAllSmartroofIntersections();
        this.stage.smartRoofSetbackEditMode.updateModelArea();

        // remove object from hover manager
        this.stage.quadTreeManager.removeObject(this);

        this.stage.selectionControls.setSelectedObject(this.stage.ground);
    }

    getPosition() {
        if (this.isTemplate) {
            if (this.type === 'FlatDormer') {
                return this.outlinePoints[1].getPosition().add(this.outlinePoints[2].getPosition()).multiplyScalar(0.5);
            }
            return this.outlinePoints[2].getPosition();
        }
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
        // this.polygonMeasurement.show();
        // this.polygonMeasurement.updateMeasurements(this.oldVertices);
    }

    hideMeasurement() {
        // if (this.polygonMeasurement) this.polygonMeasurement.hide();
    }

    static getObjectType() {
        return 'SmartroofModel';
    }

    getIntersectingEdges() {
        return this.intersectingEdges;
    }

    fitToLidar() {
        const children = this.getChildren();
        const largestArea = this.getLargestRoof().computeArea();
        const lidarData = this.stage.lidar.lidarData;
        const NUMBER_OF_TESTS = 3000;
        const relativePitch = [];
        const oldHeights = [];

        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i];
            child.lidarSamplePoints = [];
            if (!child.isDeleted && child.computeArea() > largestArea / 3) {
                const grandChildren = child.getChildren();
                const grandChildrenVertices = [];
                for (let j = 0, len2 = grandChildren.length; j < len2; j += 1) {
                    grandChildrenVertices.push(utils.setbackPolygon(grandChildren[j].get2DVertices(), 0.550));
                }

                let convexHull = child.lidarConvexHull;
                const convexHullVertices = [];
                if (!convexHull) {
                    convexHull = child.getConvexHull2D();
                }
                if (convexHull) {
                    for (let j = 0; j < convexHull.length; j += 1) {
                        const vertex = utils.convertVectorArrayTo2DArray(convexHull[j]);
                        convexHullVertices.push(utils.setbackPolygon(vertex, 0.550));
                    }
                }
                let vertices = utils.setbackPolygon(child.get2DVertices(), -0.500);
                if (vertices.length === 0) {
                    vertices = child.get2DVertices();
                }
                const bBox = utils.getBoundingBox(vertices);
                const allPoints = [];
                for (let j = 0; j < NUMBER_OF_TESTS; j++) {
                    const randomY = bBox.min.y + (Math.random() * (bBox.max.y - bBox.min.y));
                    const randomX = bBox.min.x + (Math.random() * (bBox.max.x - bBox.min.x));
                    const point = [randomX, randomY];
                    // checks
                    let check1 = true;
                    let check2 = true;
                    let check3 = true;
                    check1 = utils.checkPointInsideVertices(vertices, point);
                    const check4 = utils.checkPointInsideVertices(child.get2DVertices(), point);
                    for (let k = 0, len3 = grandChildrenVertices.length; k < len3; k++) {
                        if (utils.checkPointInsideVertices(grandChildrenVertices[k], point) && !(grandChildren[k] instanceof Subarray)) {
                            check2 = false;
                        }
                    }
                    if (convexHullVertices.length > 0) {
                        for (let k = 0; k < convexHullVertices.length; k += 1) {
                            check3 = !utils.checkPointInsideVertices(convexHullVertices[j], point);
                            if (!check3) {
                                break;
                            }
                        }
                    }
                    if (check4 && check2 && check3) {
                        const origin = new THREE.Vector3(point[0], point[1], 0);
                        const X = Math.ceil(512 + ((origin.x * 1024) / this.stage.imageDimensions.height));
                        const Y = Math.ceil(512 - ((origin.y * 1024) / this.stage.imageDimensions.width));
                        const Z = lidarData[Y][X] - this.stage.lidar.lidarZMin;
                        oldHeights.push(child.getZOnTopSurface(origin.x, origin.y) - Z);
                        origin.z = Z;
                        if (check1) {
                            allPoints.push(origin);
                        }
                        child.lidarSamplePoints.push(origin);
                    }
                }
                if (allPoints.length > 2) {
                    const data = generatePlaneFromPoints(allPoints, child);
                    relativePitch.push(data.angle / child.tilt);
                }
                else {
                    relativePitch.push(1);
                }
            }
        }
        this.updateTiltFromLidar(relativePitch);
        this.updateHeightFromLidar(oldHeights);
        // disabling obstructions
        // this.findObstructions();

        children.forEach((child) => {
            child.lidarSamplePoints = [];
        });
    }

    findObstructions() {
        this.getChildren().forEach((child) => {
            const points = child.lidarSamplePoints;
            const groupOfPoints = [];
            for (let i = 0, len = points.length; i < len; i += 1) {
                const distance = child.plane.distanceToPoint(points[i]);
                if (distance > 0.6) {
                    groupOfPoints.push(new THREE.Vector3(points[i].x, points[i].y, distance));
                }
            }
            if (groupOfPoints.length > 3) {
                const optimumK = groupPoint(groupOfPoints, this.objectsGroup);
                optimumK.forEach((cluster) => {
                    const coordinatePoints = [];
                    for (let i = 0, len = cluster.length; i < len; i += 1) {
                        const point = cluster[i];
                        coordinatePoints.push(new JSTS.geom.Coordinate(point.x, point.y));
                    }
                    const convexHullCoordinates =
                        new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints).convexHull().getCoordinates();
                    const polygon = new PolygonModel(this.stage);
                    const geometry = createBufferGeometry(convexHullCoordinates);
                    geometry.noOfVertices = convexHullCoordinates.length - 1;
                    polygon.onComplete(geometry);

                    let sum = 0;

                    for (let i = 0, len = cluster.length; i < len; i += 1) {
                        sum += cluster[i].z;
                    }

                    const avgHeight = parseFloat((sum / cluster.length).toFixed(3));


                    polygon.updateObject({
                        coreHeight: avgHeight,
                    });
                });
            }
        });
    }

    getLargestRoof() {
        const largestAreaSmartRoof = this.getChildren().reduce((p, v) => (p.computeArea() > v.computeArea() ? p : v));

        return largestAreaSmartRoof;
    }

    updateTiltFromLidar(relativePitch) {
        const options = {
            heightChanged: false,
            prevHeight: null,
            parapetHeightChanged: false,
            prevParapetHeight: null,
            parapetThicknessChanged: false,
        };
        const children = this.getChildren();
        let relativeTiltSum = 0;

        relativePitch.forEach((tilt) => {
            relativeTiltSum += tilt;
        });
        // relative tilt changes of every child is calculated
        const relativeTiltRatio = relativeTiltSum / relativePitch.length;
        children.forEach((child) => {
            if (!child.isDeleted) {
                child.tilt = parseFloat((child.tilt * relativeTiltRatio).toFixed(2));
                if (child.fold) {
                    child.fold.tilt = child.tilt;
                }
                else {
                    child.outerEdge.tilt = child.tilt;
                }
            }
        });
        // Updation
        this.updateFacesWithNewAngles();
        children.forEach((child) => {
            child.handlePropertiesUpdate(options);
            child.snapChildDormers();
        });
    }

    updateHeightFromLidar(oldHeights) {
        const sum = oldHeights.reduce((partialSum, a) => partialSum + a, 0);
        let averageHeight = sum / oldHeights.length;
        if (sum === 0) {
            averageHeight = 0;
        }

        const height = (this.coreHeight - averageHeight) > 0 ? (this.coreHeight - averageHeight) : this.coreHeight;
        this.updateObject({
            coreHeight: height,
            snapHeight: false,
        });
    }

    onClickFitToLidar() {
        const allChildren = [...this.getChildren()];
        const allInterSectionModels = [];
        const allModels = raycastingUtils.getAllModelsBelowVertices(this.get2DVertices(), this.stage);
        for (let i = 0, len = allModels.length; i < len; i++) {
            if (allModels[i][0] instanceof SmartroofFace) {
                if (allModels[i][0].parent instanceof SmartroofModel) {
                    if (!allInterSectionModels.includes(allModels[i][0].parent)) {
                        allInterSectionModels.push(allModels[i][0].parent);
                    }
                }
            }
        }

        this.intersectingModels.forEach((model) => {
            if (model instanceof SmartroofModel) {
                allChildren.push(...model.getChildren());
            }
        });
        for (let i = 0, len = this.intersectingModels.length; i < len; i++) {
            if (this.intersectingModels[i] instanceof SmartroofModel) {
                allChildren.push(...this.intersectingModels[i].getChildren());
            }
        }
        for (let i = 0, len = allChildren.length; i < len; i++) {
            allChildren[i].updateLidarConvexHull();
        }
        this.fitToLidar();
        this.intersectingModels.forEach((model) => {
            if (model instanceof SmartroofModel) {
                model.fitToLidar();
            }
        });
        for (let i = 0, len = allChildren.length; i < len; i++) {
            allChildren[i].updateLidarConvexHull();
        }
    }
}


class ConnectedEdge {
    constructor(
        outerEdge,
        startPoint = new THREE.Vector3(outerEdge.point1.x, outerEdge.point1.y, 0),
        endPoint = new THREE.Vector3(outerEdge.point2.x, outerEdge.point2.y, 0),
    ) {
        this.faceId = outerEdge.id;
        this.wallId = outerEdge.wallId;
        this.id = this.wallId;
        this.outerEdge = outerEdge;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.plane = outerEdge.wallPlane;
        this.nextEdge = null;
        this.prevEdge = null;
        this.tilt = !utils.isNumber(parseFloat(outerEdge.tilt)) ? 20 : parseFloat(outerEdge.tilt);
        this.height = outerEdge.height;
        this.isWall = true;
        this.facePlane = outerEdge.facePlane;
        this.isVirtual = false;
        this.startingHeight = null;
        this.smartRoofFace = outerEdge.smartRoofFace;
    }

    getNumberOfConnectedEdges() {
        let numberOfEdges = 0;
        let edge = this;
        do {
            numberOfEdges += 1;
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.id);
        return numberOfEdges;
    }

    getLength() {
        return Math.abs(this.startPoint.distanceTo(this.endPoint));
    }

    getVector() {
        return this.endPoint.clone().sub(this.startPoint);
    }

    getSlope() {
        const vector = this.getVector();
        return Math.atan2(vector.y, vector.x);
    }

    getAngleWithXAxis() {
        const vector = this.getVector();
        return Math.atan2(vector.y, vector.x);
    }

    toString() {
        return `edge id :${this.id} || edge start :x${this.startPoint.x}y${this.startPoint.y}z${this.startPoint.z
        } || edge end :x${this.endPoint.x}y${this.endPoint.y}z${this.endPoint.z}`;
    }

    clone() {
        const cloneEdge = new ConnectedEdge(this.outerEdge, this.startPoint, this.endPoint);
        cloneEdge.faceId = this.id;
        cloneEdge.wallId = this.wallId;
        cloneEdge.id = this.id;
        cloneEdge.outerEdge = this.outerEdge;
        cloneEdge.nextEdge = this.nextEdge;
        cloneEdge.prevEdge = this.prevEdge;
        cloneEdge.plane = this.plane;
        cloneEdge.tilt = this.tilt;
        cloneEdge.height = this.height;
        cloneEdge.isWall = this.isWall;
        cloneEdge.facePlane = this.facePlane;
        cloneEdge.isVirtual = this.isVirtual;
        return cloneEdge;
    }
}

export class DynamicPolygon {
    constructor(smartRoof, head, folds) {
        this.smartRoof = smartRoof;
        this.connectedEdge = head;
        this.vertices = [];
        this.intersections = [];
        this.EPSILON = 0.001;
        this.paths = [];
        this.newPolygons = [];
        this.stop = false;
        this.approxLastHeight = -1;
        this.sameHeightCount = 0;
        this.addFolds(folds);
    }


    // Simply shrink the polygon without changing the connectivity of the edges
    basicShrink(height) {
        // The plane used to shrink the polygon to a given height
        const intersectionHorizontalPlane = new THREE.Plane()
            .setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, height));
        let edge = this.connectedEdge.nextEdge;
        do {
            edge.startPoint = DynamicPolygon.getInterSectionOfPlanes(edge.plane, edge.nextEdge.plane, intersectionHorizontalPlane);
            edge.endPoint = DynamicPolygon.getInterSectionOfPlanes(edge.plane, edge.prevEdge.plane, intersectionHorizontalPlane);
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
    }

    // Check if any edge has a length less than a treshold and if so, remove it by connecting the adjacent edges to each other
    // Decreases the size of the polygon edges by 1
    processEdgeEvents() {
        const EPSILON = 0.001;
        let edge = this.connectedEdge.nextEdge;
        do {
            // Check for length and also if the edge is not a virtual edge
            if (edge.getLength() < EPSILON) {
                const prevEdge = edge.prevEdge;
                const nextEdge = edge.nextEdge;
                const slopePrev = prevEdge.getSlope();
                const slopeNext = nextEdge.getSlope();
                if (edge.isVirtual && Math.abs(edge.startingHeight - edge.startPoint.z) < EPSILON) {
                    edge = edge.nextEdge;
                    continue;
                }
                else if (
                    !edge.isVirtual &&
                    prevEdge.isVirtual &&
                    !nextEdge.isVirtual &&
                    Math.abs(slopePrev - slopeNext) < 0.000001 &&
                    prevEdge.outerEdge.isPitched &&
                    nextEdge.outerEdge.isPitched
                ) {
                    if (edge.outerEdge.isPitched) {
                        const edgeId = edge.id;
                        const prevEdgeId = edge.prevEdge.id;
                        const nextEdgeid = edge.nextEdge.id;
                        const edgeEventSignal = {
                            type: 'edgeEvent',
                            point: edge.startPoint,
                            faces: [edgeId, prevEdgeId, nextEdgeid],
                        };
                        this.paths.push(edgeEventSignal);
                        edge.id += '_Virtual';
                        const edgeEventSignal2 = {
                            type: 'edgeEvent',
                            point: edge.startPoint,
                            faces: [edge.id, prevEdgeId, nextEdgeid],
                        };
                        this.paths.push(edgeEventSignal2);
                        edge.faceId = edge.id;
                        edge.wallId = edge.id;
                    }
                    edge.isVirtual = true;
                    edge.startingHeight = edge.startPoint.z;
                    const facePlane = new THREE.Plane().setFromNormalAndCoplanarPoint(prevEdge.getVector().normalize(), edge.endPoint);
                    facePlane.normal.z = 0;
                    edge.plane = facePlane;
                    edge.height = 0.1;
                    return true;
                }
                else {
                    const edgeId = edge.id;
                    const prevEdgeId = edge.prevEdge.id;
                    const nextEdgeid = edge.nextEdge.id;
                    if (edge.id === this.connectedEdge.id) {
                        this.connectedEdge = edge.prevEdge;
                    }
                    edge.prevEdge.nextEdge = edge.nextEdge;
                    edge.nextEdge.prevEdge = edge.prevEdge;
                    const edgeEventSignal = {
                        type: 'edgeEvent',
                        point: edge.startPoint,
                        faces: [edgeId, prevEdgeId, nextEdgeid],
                    };
                    this.paths.push(edgeEventSignal);
                    return true;
                }
            }
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);

        return false;
    }

    processDoubleSplitEvents() {
        const EPSILON = 0.0001;
        // Possible edge which can be split
        let edge = this.connectedEdge.nextEdge;
        let stop = false;
        do {
            // Edge which splits the other edge
            let checkEdge = edge.nextEdge.nextEdge;
            do {
                const vectorPrev = checkEdge.nextEdge.getVector().normalize();
                const vectorCurrent = edge.getVector().normalize();
                const check1 = Math.abs(1 - vectorPrev.dot(vectorCurrent)) < EPSILON;
                const check2 = checkEdge.id !== edge.prevEdge.prevEdge.id && checkEdge.id !== edge.prevEdge.id && checkEdge.id !== edge.id;
                if (check1 && check2) {
                    if (checkEdge.startPoint.distanceTo(edge.startPoint) < EPSILON) {
                        stop = true;
                        const originalPolygonEdge = edge;
                        const originalPolygonNextEdge = checkEdge.nextEdge;
                        const splitPolygonEdge = edge.nextEdge;
                        const splitPolygonLastEdge = checkEdge;
                        const splitPoint = edge.startPoint;
                        originalPolygonEdge.nextEdge = originalPolygonNextEdge;
                        originalPolygonNextEdge.prevEdge = originalPolygonEdge;
                        splitPolygonEdge.prevEdge = splitPolygonLastEdge;
                        splitPolygonLastEdge.nextEdge = splitPolygonEdge;
                        const newPolygon = new DynamicPolygon(this.smartRoof, splitPolygonEdge, this.folds);
                        newPolygon.connectedEdge = splitPolygonEdge;
                        this.connectedEdge = originalPolygonEdge;
                        this.newPolygons.push(newPolygon);
                        newPolygon.createVertices();
                        newPolygon.addFolds(this.folds);
                        newPolygon.generateIntersections();
                        {
                            const splitEventSignal = {
                                type: 'doubleSplit',
                                point: splitPoint,
                                faces: [originalPolygonNextEdge.id, splitPolygonEdge.id, splitPolygonLastEdge.id],
                            };
                            this.paths.push(splitEventSignal);
                        }
                        {
                            const splitEventSignal = {
                                type: 'doubleSplit',
                                point: splitPoint,
                                faces: [originalPolygonEdge.id, originalPolygonNextEdge.id, splitPolygonEdge.id],
                            };
                            this.paths.push(splitEventSignal);
                        }
                        return true;
                    }
                }
                if (stop) {
                    break;
                }
                checkEdge = checkEdge.nextEdge;
            } while (checkEdge.prevEdge.id !== edge.prevEdge.id);
            if (stop) {
                break;
            }
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);

        return false;
    }

    // If the any edge vertex of the polygon lies on another edge then a split occurs and the polygon is split into two polygons
    processSplitEvents() {
        // Possible edge which can be split
        let edge = this.connectedEdge.nextEdge;
        do {
            // Edge which splits the other edge
            let checkEdge = edge.nextEdge.nextEdge;
            do {
                if (DynamicPolygon.checkIfPointStrictlyBetweenLineSegment([edge.startPoint, edge.endPoint], checkEdge.startPoint)) {
                    const splitPoint = checkEdge.startPoint;
                    const edgeId = edge.id;
                    // New polygon tail edge
                    const tail = checkEdge;
                    // Edge next to the split edge in original polygon
                    const otherEdge = tail.nextEdge;
                    const prevEdgeId = tail.id;
                    // New polygon head edge
                    const head = new ConnectedEdge(edge.outerEdge, edge.startPoint, splitPoint);
                    head.plane = edge.plane;
                    head.isWall = edge.isWall;
                    head.id = edge.id;
                    head.faceId = edge.faceId;
                    head.wallId = edge.wallId;
                    head.facePlane = edge.facePlane;
                    head.isVirtual = edge.isVirtual;
                    head.tilt = edge.tilt;
                    head.height = edge.height;
                    head.smartRoofFace = edge.smartRoofFace;
                    head.nextEdge = edge.nextEdge;
                    head.nextEdge.prevEdge = head;
                    head.prevEdge = tail;
                    tail.nextEdge = head;
                    const newPolygon = new DynamicPolygon(this.smartRoof, head, this.folds);
                    newPolygon.connectedEdge = head;
                    this.newPolygons.push(newPolygon);
                    newPolygon.createVertices();
                    newPolygon.addFolds(this.folds);
                    newPolygon.generateIntersections();
                    edge.nextEdge = otherEdge;
                    const nextEdgeid = otherEdge.id;
                    edge.nextEdge.prevEdge = edge;
                    edge.startPoint = splitPoint;
                    this.connectedEdge = edge;
                    const splitEventSignal = {
                        type: 'splitEvent',
                        point: splitPoint,
                        faces: [edgeId, prevEdgeId, nextEdgeid],
                    };
                    this.paths.push(splitEventSignal);
                    return true;
                }
                checkEdge = checkEdge.nextEdge;
            } while (checkEdge.prevEdge.id !== edge.prevEdge.id);
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);

        return false;
    }

    processCoreEdgeEvents(height) {
        let edge = this.connectedEdge.nextEdge;
        let eventOccured = false;
        do {
            // Check if the edge needs to behave as a pitched face or not
            if (edge.isWall &&
                !edge.isVirtual &&
                edge.height === height &&
                edge.tilt < 89 &&
                edge.outerEdge.isPitched) {
                edge.isWall = false;
                edge.plane = edge.facePlane;
                const faceId = edge.faceId;
                const coreEdgeEventSignal = {
                    type: 'coreEdgeEvent',
                    point: edge.startPoint,
                    faces: [faceId, edge.nextEdge.id, edge.id],
                    isFirst: true,
                };
                const coreEdgeEventSignal2 = {
                    type: 'coreEdgeEvent',
                    point: edge.endPoint,
                    faces: [faceId, edge.prevEdge.id, edge.id],
                    isFirst: false,
                };
                edge.id = faceId;
                edge.smartRoofFace.startNode = coreEdgeEventSignal;
                edge.smartRoofFace.endNode = coreEdgeEventSignal2;
                this.paths.push(coreEdgeEventSignal);
                this.paths.push(coreEdgeEventSignal2);
                eventOccured = true;
            }
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        return eventOccured;
    }

    // Handle degenracies in the polygon
    processCollinearEdgeEvents() {
        // return false;
        const EPSILON = 0.001;
        let edge = this.connectedEdge.nextEdge;
        let prevEdge = this.connectedEdge;
        do {
            const vectorPrev = prevEdge.getVector().normalize();
            const vectorCurrent = edge.getVector().normalize();
            if (Math.abs(1 - vectorPrev.dot(vectorCurrent)) < EPSILON) {
                if (edge.outerEdge.isPitched && !prevEdge.outerEdge.isPitched) {
                    edge.endPoint = prevEdge.endPoint;
                    prevEdge.prevEdge.nextEdge = prevEdge.nextEdge;
                    prevEdge.nextEdge.prevEdge = prevEdge.prevEdge;
                    const collinearEdgeEventSignal = {
                        type: 'collinearEdgeEvent',
                        point: prevEdge.endPoint,
                        faces: [prevEdge.id, edge.id, prevEdge.prevEdge.id],
                        needMerge: false,
                    };
                    this.paths.push(collinearEdgeEventSignal);
                    if (prevEdge.id === this.connectedEdge.id) {
                        this.connectedEdge = edge;
                    }
                    return true;
                }
                else if (prevEdge.outerEdge.isPitched && !edge.outerEdge.isPitched) {
                    prevEdge.startPoint = edge.startPoint;
                    edge.prevEdge.nextEdge = edge.nextEdge;
                    edge.nextEdge.prevEdge = edge.prevEdge;
                    const collinearEdgeEventSignal = {
                        type: 'collinearEdgeEvent',
                        point: edge.startPoint,
                        faces: [edge.id, prevEdge.id, edge.nextEdge.id],
                        needMerge: false,
                    };
                    this.paths.push(collinearEdgeEventSignal);
                    if (edge.id === this.connectedEdge.id) {
                        this.connectedEdge = prevEdge;
                    }
                    return true;
                }
                else if (!edge.outerEdge.isPitched && !prevEdge.outerEdge.isPitched) {
                    // What kind of scenarios can lead to this???
                }
                else if (edge.outerEdge.tilt === prevEdge.outerEdge.tilt) {
                    edge.endPoint = prevEdge.endPoint;
                    prevEdge.prevEdge.nextEdge = prevEdge.nextEdge;
                    prevEdge.nextEdge.prevEdge = prevEdge.prevEdge;
                    const collinearEdgeEventSignal = {
                        type: 'collinearEdgeEvent',
                        point: prevEdge.endPoint,
                        faces: [prevEdge.id, edge.id, prevEdge.prevEdge.id],
                        needMerge: true,
                    };
                    this.paths.push(collinearEdgeEventSignal);
                    if (prevEdge.id === this.connectedEdge.id) {
                        this.connectedEdge = edge;
                    }
                    return true;
                }
            }
            edge = edge.nextEdge;
            prevEdge = prevEdge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        return false;
    }

    // Handle degenracies in the polygon
    processPerfectEvents() {
        const EPSILON = 0.001;
        let edge = this.connectedEdge.nextEdge;
        let prevEdge = this.connectedEdge;
        do {
            const vectorPrev = prevEdge.getVector().normalize();
            const vectorCurrent = edge.getVector().normalize();
            if (vectorPrev.dot(vectorCurrent) + 1 < EPSILON) {
                if (edge.startPoint.distanceTo(prevEdge.endPoint) < EPSILON && prevEdge.id !== edge.nextEdge.id) {
                    // delete these edges and create two events
                    prevEdge.prevEdge.nextEdge = edge.nextEdge;
                    edge.nextEdge.prevEdge = prevEdge.prevEdge;
                    const perfectEventSignal = {
                        type: 'perfectEvent',
                        point: prevEdge.endPoint,
                        faces: [prevEdge.id, edge.id, edge.nextEdge.id],
                    };
                    const perfectEventSignal2 = {
                        type: 'perfectEvent',
                        point: edge.startPoint,
                        faces: [prevEdge.prevEdge.id, prevEdge.id, edge.nextEdge.id],
                    };
                    this.paths.push(perfectEventSignal);
                    this.paths.push(perfectEventSignal2);
                    if (prevEdge.id === this.connectedEdge.id || edge.id === this.connectedEdge.id) {
                        this.connectedEdge = prevEdge.prevEdge;
                    }
                    return true;
                }
                else if (edge.nextEdge.id !== prevEdge.id && prevEdge.prevEdge.id !== edge.id) {
                    if (edge.getLength() < prevEdge.getLength()) {
                        prevEdge.startPoint = edge.startPoint;
                        prevEdge.nextEdge = edge.nextEdge;
                        edge.nextEdge.prevEdge = prevEdge;
                        const perfectEventSignal = {
                            type: 'perfectEvent',
                            point: edge.startPoint,
                            faces: [edge.id, prevEdge.id, edge.nextEdge.id],
                        };
                        this.paths.push(perfectEventSignal);
                        if (edge.id === this.connectedEdge.id) {
                            this.connectedEdge = prevEdge.prevEdge;
                        }
                        return true;
                    }
                    edge.endPoint = prevEdge.endPoint;
                    prevEdge.prevEdge.nextEdge = edge;
                    edge.prevEdge = prevEdge.prevEdge;
                    const perfectEventSignal = {
                        type: 'perfectEvent',
                        point: prevEdge.endPoint,
                        faces: [prevEdge.id, edge.id, prevEdge.prevEdge.id],
                    };
                    this.paths.push(perfectEventSignal);
                    if (prevEdge.id === this.connectedEdge.id) {
                        this.connectedEdge = prevEdge.prevEdge;
                    }
                    return true;
                }
            }
            edge = edge.nextEdge;
            prevEdge = prevEdge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        return false;
    }

    processFolds(fold, point) {
        let edge = this.connectedEdge.nextEdge;
        do {
            if (DynamicPolygon.checkIfPointApproximatelyOnLineSegment([edge.startPoint, edge.endPoint], point)) {
                this.folds = this.folds.filter(f => f.id !== fold.id);
                const foldParentEdgeId = edge.id;
                const prevFoldPosition = fold.getPosition();
                fold.setPosition(prevFoldPosition.x, prevFoldPosition.y, point.z);
                const foldPlane = DynamicPolygon.getFoldPlane(fold, edge);
                fold.plane = foldPlane;
                fold.parentFace = edge.outerEdge.smartRoofFace;
                fold.smartRoofFace.plane = foldPlane;
                fold.isValid = true;
                edge.plane = foldPlane;
                edge.id = fold.faceId;
                edge.smartRoofFace = fold.smartRoofFace;
                edge.tilt = fold.tilt;
                {
                    const foldEdgeEventSignal = {
                        type: 'foldEdge',
                        point: edge.startPoint,
                        faces: [edge.id, foldParentEdgeId, edge.nextEdge.id],
                        isFirst: true,
                    };
                    this.paths.push(foldEdgeEventSignal);
                    fold.smartRoofFace.startNode = foldEdgeEventSignal;
                }
                {
                    const foldEdgeEventSignal = {
                        type: 'foldEdge',
                        point: edge.endPoint,
                        faces: [edge.id, foldParentEdgeId, edge.prevEdge.id],
                        isFirst: false,
                    };
                    this.paths.push(foldEdgeEventSignal);
                    fold.smartRoofFace.endNode = foldEdgeEventSignal;
                }
                if (fold.tilt === 0) {
                    edge = edge.nextEdge;
                    const endId = edge.prevEdge.id;
                    do {
                        {
                            const foldEdgeEventSignal = {
                                type: 'edgeEvent',
                                point: edge.startPoint,
                                faces: [fold.faceId, edge.id, edge.nextEdge.id],
                            };
                            this.paths.push(foldEdgeEventSignal);
                        }
                        edge = edge.nextEdge;
                    } while (edge.id !== endId);
                    this.connectedEdge.nextEdge = this.connectedEdge;
                    this.connectedEdge.prevEdge = this.connectedEdge;
                }
                return true;
            }
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        return false;
    }

    shrink(paths) {
        const maxCount = 100;
        this.paths = paths;
        do {
            const lowestIntersection = this.intersections.shift();
            if (Math.abs(lowestIntersection.height - this.approxLastHeight) > 0.00000000001) {
                this.approxLastHeight = lowestIntersection.height;
                this.sameHeightCount = 0;
            }
            else {
                this.sameHeightCount++;
            }
            const infiniteLoopCheck = lowestIntersection.height > 0 &&
            this.sameHeightCount > maxCount;
            // Temp fix for infinite loop
            if (infiniteLoopCheck) {
                this.stop = true;
                return this.newPolygons;
            }
            const height = lowestIntersection.height;
            let eventOccured = false;
            const isFoldIntersection = lowestIntersection.isFold;
            do {
                eventOccured = this.processPerfectEvents() ||
                this.processCollinearEdgeEvents();
                this.createVertices();
            } while (eventOccured && this.vertices.length > 3);
            eventOccured = false;
            this.basicShrink(height);
            let foldProcessed = false;
            do {
                eventOccured =
                this.processCoreEdgeEvents(height) ||
                this.processDoubleSplitEvents() ||
                this.processEdgeEvents() ||
                this.processPerfectEvents() ||
                this.processCollinearEdgeEvents() ||
                this.processSplitEvents() ||
                false;

                if (isFoldIntersection && !foldProcessed) {
                    const fold = lowestIntersection.fold;
                    const point = lowestIntersection.point;
                    eventOccured = this.processFolds(fold, point) || eventOccured;
                    foldProcessed = true;
                }
                if (eventOccured) {
                    this.generateIntersections();
                    this.createVertices();
                }
            } while (eventOccured && this.intersections.length > 0 && this.vertices.length > 2);
        } while (this.intersections.length > 0);
        this.generateIntersections();
        return this.newPolygons;
    }


    static sanityCheck(point) {
        const maxValue = 1000;
        const infinityCheck = !(point.x === Infinity || point.y === Infinity || point.z === Infinity);
        const nanCheck = infinityCheck && (utils.isNumber(point.x) && utils.isNumber(point.y) && utils.isNumber(point.z));
        const maxCheck = nanCheck && Math.abs(point.x) < maxValue && Math.abs(point.y) < maxValue && Math.abs(point.z) < maxValue;
        return maxCheck;
    }

    static getFoldPlane(fold, edge) {
        const edgePlaneNormal = edge.plane.normal.clone();
        const foldTilt = fold.tilt;
        const edgeTilt = edge.tilt;
        const delta = utils.deg2Rad(edgeTilt - foldTilt);
        const edgeAxis = edge.getVector().normalize();
        const edgePlaneNormalRotated = edgePlaneNormal.clone().applyAxisAngle(edgeAxis, delta).normalize();
        const foldPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(edgePlaneNormalRotated, fold.getPosition());
        return foldPlane;
    }

    generateIntersections() {
        const intersections = [];
        let edge = this.connectedEdge.nextEdge;
        const baseHeight = this.connectedEdge.startPoint.z - this.EPSILON;
        const pastIntersections = new Set();
        const pastEdgeHeights = new Set();
        do {
            if (edge.isWall && !edge.isVirtual && edge.outerEdge.isPitched && !pastEdgeHeights.has(edge.height)) {
                pastEdgeHeights.add(`${edge.height}`);
                const intersectionObject = {
                    height: edge.height,
                    isFold: false,
                    isCoreEdge: true,
                };
                intersections.push(intersectionObject);
            }
            {
                const edgePlane = edge.plane;
                for (let i = 0; i < this.folds.length; i++) {
                    const fold = this.folds[i];
                    if (!fold.isActive) {
                        continue;
                    }
                    const foldPosition = fold.getPosition();
                    const foldLine = new THREE.Line3(
                        new THREE.Vector3(foldPosition.x, foldPosition.y, 1000),
                        new THREE.Vector3(foldPosition.x, foldPosition.y, -1000),
                    );
                    const foldIntersection = new THREE.Vector3();
                    edgePlane.intersectLine(foldLine, foldIntersection);
                    if (DynamicPolygon.sanityCheck(foldIntersection)) {
                        const height = foldIntersection.z;
                        if (height > baseHeight) {
                            const intersectionObject = {
                                height,
                                isFold: true,
                                fold,
                                point: foldIntersection,
                                isCoreEdge: false,
                            };
                            intersections.push(intersectionObject);
                        }
                    }
                }
            }
            const nextEdge = edge.nextEdge;
            let otherEdge = nextEdge.nextEdge;
            do {
                const intersection = DynamicPolygon.getInterSectionOfPlanes(edge.plane, nextEdge.plane, otherEdge.plane);
                const ids = [edge.id, nextEdge.id, otherEdge.id];
                ids.sort();
                const key = ids.join('');
                const duplicateCheck = !pastIntersections.has(key);
                const baseHeightCheck = intersection.z > baseHeight;
                // check if any nan values are present
                const nanCheck = (utils.isNumber(intersection.x) && utils.isNumber(intersection.y) && utils.isNumber(intersection.z));
                if (duplicateCheck && baseHeightCheck && nanCheck) {
                    pastIntersections.add(key);
                    const intersectionObject = {
                        height: intersection.z,
                        isFold: false,
                        isCoreEdge: false,
                        point: intersection,
                        faces: [edge.id, edge.nextEdge.id, edge.prevEdge.id],
                    };
                    intersections.push(intersectionObject);
                }
                otherEdge = otherEdge.nextEdge;
            } while (otherEdge.id !== edge.id);
            edge = nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        intersections.sort((a, b) => a.height - b.height);
        this.intersections = intersections;
        this.createVertices();
    }

    addFolds(folds) {
        this.folds = [];
        folds.forEach((fold) => {
            this.folds.push(fold);
        });
    }

    createVertices() {
        const vertices = [];
        const maxCount = 100;
        let count = 0;
        let edge = this.connectedEdge.nextEdge;
        if (edge.id === this.connectedEdge.id) {
            vertices.push(edge.startPoint);
            vertices.push(edge.endPoint);
            this.vertices = vertices;
            return;
        }
        do {
            count++;
            vertices.push(edge.startPoint);
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id && count < maxCount);
        this.vertices = vertices;
    }


    getNumberOfVertices() {
        return this.vertices.length;
    }

    getNumberOfEdges() {
        let numberOfEdges = 0;
        let edge = this.connectedEdge.nextEdge;
        do {
            numberOfEdges += 1;
            edge = edge.nextEdge;
        } while (edge.prevEdge.id !== this.connectedEdge.id);
        return numberOfEdges;
    }

    static checkIfPointStrictlyBetweenLineSegment(edge, point, EPSILON = 0.000001) {
        const point1 = new THREE.Vector2(edge[0].x, edge[0].y);
        const point2 = new THREE.Vector2(edge[1].x, edge[1].y);
        const checkPoint = new THREE.Vector2(point.x, point.y);
        const distanceFromPoint1 = checkPoint.distanceTo(point1);
        const distanceFromPoint2 = checkPoint.distanceTo(point2);
        const notOnPoint1 = distanceFromPoint1 > 0.01;
        const notOnPoint2 = distanceFromPoint2 > 0.01;
        const checkVal = (point1.distanceTo(checkPoint) + point2.distanceTo(checkPoint)) - point1.distanceTo(point2);
        const onLine = Math.abs(checkVal) < EPSILON;
        return notOnPoint1 && notOnPoint2 && onLine;
    }

    static checkIfPointApproximatelyOnLineSegment(edge, point, EPSILON = 0.0001) {
        const point1 = new THREE.Vector2(edge[0].x, edge[0].y);
        const point2 = new THREE.Vector2(edge[1].x, edge[1].y);
        const checkPoint = new THREE.Vector2(point.x, point.y);
        const checkVal = (point1.distanceTo(checkPoint) + point2.distanceTo(checkPoint)) - point1.distanceTo(point2);
        const onLine = Math.abs(checkVal) < EPSILON;
        return onLine;
    }

    static getInterSectionOfPlanes(p1, p2, p3) {
        const n1 = p1.normal;
        const n2 = p2.normal;
        const n3 = p3.normal;
        const x1 = p1.coplanarPoint(new THREE.Vector3());
        const x2 = p2.coplanarPoint(new THREE.Vector3());
        const x3 = p3.coplanarPoint(new THREE.Vector3());
        const f1 = new THREE.Vector3().crossVectors(n2, n3).multiplyScalar(x1.dot(n1));
        const f2 = new THREE.Vector3().crossVectors(n3, n1).multiplyScalar(x2.dot(n2));
        const f3 = new THREE.Vector3().crossVectors(n1, n2).multiplyScalar(x3.dot(n3));
        const det = new THREE.Matrix3().set(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, n3.x, n3.y, n3.z).determinant();
        const vectorSum = new THREE.Vector3().add(f1).add(f2).add(f3);
        const planeIntersection = new THREE.Vector3(vectorSum.x / det, vectorSum.y / det, vectorSum.z / det);
        return planeIntersection;
    }
}


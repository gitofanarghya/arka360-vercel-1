import * as THREE from 'three';
import BaseObject from '../BaseObject'
import CylinderModel from '../model/CylinderModel';
import PolygonModel from "../model/PolygonModel";
import GroundImage from './GroundImage';
import Subarray from "../subArray/Subarray";
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import * as exporters from '../../utils/exporters';
import * as raycastingUtils from '../../utils/raycastingUtils';
import { roofMapExporter } from '../../utils/exporters';
import InfiniteGridHelper from '../../lib/InfiniteGridHelper';

import {
    BASE_URL,
    PANEL_ORIENTATION_LANDSCAPE,
    INVALID_SCALE,
} from '../../coreConstants';
import {
    VISUAL_STATES,
    MATERIAL_STATES,
    COLOR_MAPPINGS,
    GROUND_EDGE_LINE_WIDTH,
    GROUND_EDGE_LINE_COLOR,
    ONE_PIXEL_IMAGE_DATA,
} from '../visualConstants';
import axios from 'axios';
import loBind from 'lodash/bind';
import Walkway from '../model/Walkway';
import SafetyLine from '../model/SafetyLine';
import Handrail from '../model/Handrail';
import Property from '../model/Property';
import * as visualUtils from '../../utils/visualUtils';
import Tree from '../model/Tree';
import {
    scaleMetersToRatio,
    getAspectRatio,
    getDefaultGroundSize,
} from '../../utils/customImageEditUtils';
import Inverter from '../ac/Inverter';
import microInverter from '../ac/MicroInverter';
import DCDB from '../ac/DCDB';
import ACDB from '../ac/ACDB';
import Conduit from '../ac/conduits/Conduit';
import DoubleConduit from '../ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../ac/cableTrays/DoubleSeparateCableTray';
import TextBox from '../subObjects/TextBox';
import AcCable from '../model/cable/AcCable';
import DcCable from '../model/cable/DcCable';
import API from '@/services/api/';
import { SmartroofModel } from '../model/smartroof/SmartroofModel';
import MicroInverter from '../ac/MicroInverter';
import CombinerBox from '../ac/CombinerBox';
import Dormer from '../model/smartroof/Dormer';
import Gazebo from '../../lib/PowerGazebo';
import Drawface from '../model/smartroof/DrawFace';
import utils from '../../../services/api/utils';
import * as coreUtils from '../../utils/utils';
import RectangleObstruction from '../model/Rectangle';
import Sky from '../../lib/Sky';
import { loadFonts } from '../subObjects/textUtils';
import EastWestRack from '../../lib/EastWestRacking';
import { useMapImagesStore } from '../../../stores/mapImages';
export default class Ground extends BaseObject {

    constructor(stage) {
        super(stage);

        this.stage = stage;
        this.id = 0;
        this.name = 'Ground';

        //microInverter array ;
        this.microInverters = [];

        this.material = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .GROUND[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });

        //Shadow Material
        this.shadowMaterial = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .GROUND[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
        });
        this.shadowMaterial.defines = this.shadowMaterial.defines || {};
        this.shadowMaterial.defines.CUSTOM = "";

        const planeGeometry = new THREE.PlaneGeometry(
            stage.imageDimensions.width,
            stage.imageDimensions.height,
        );
        this.plane = new THREE.Mesh(planeGeometry, this.material);
        this.plane.position.z = -0.065;

        const edgeMaterial = new THREE.LineBasicMaterial({
            color: GROUND_EDGE_LINE_COLOR,
            linewidth: GROUND_EDGE_LINE_WIDTH,
        });
        const edgeGeometry = new THREE.EdgesGeometry(planeGeometry);
        this.edgesMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.edgesMesh.visible = false;
        this.edgesMesh.position.z = 1;

        this.groundImage = null;
        this.gridLines = null;

        this.plane.castShadow = true;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.add(this.plane);
        this.objectsGroup.add(this.edgesMesh);

        this.canvas = stage.rendererManager.getDomElement();

        let gridObj= new InfiniteGridHelper(10, 100);
        this.grid = gridObj.getmesh();
        this.stage.sceneManager.scene.add(this.grid);
        this.sky = new Sky();

        this.wires = {};
        this.allCables = [];
        this.allConduitAndCabletary = [];
        this.allAcdbs = [];
        this.loadingPromises = [];

        this.initSkyGrid();
        this.initGridLines();
        this.loadGroundImage(this.stage.getGroundImage());

        this.updateVisualsAfterLoadingAndCreation();

        this.selectedPreliminaryInverters = [];
        this.faces = new Set();
    }

    initSkyGrid() {
        this.sky.scale.setScalar(4500);
        this.stage.sceneManager.scene.add(this.sky);
        let effectController = {
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.003,
            mieDirectionalG: 0.8,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            sun: !true
        };
        let uniforms = this.sky.material.uniforms;
        uniforms["turbidity"].value = effectController.turbidity;
        uniforms["rayleigh"].value = effectController.rayleigh;
        uniforms["mieCoefficient"].value = effectController.mieCoefficient;
        uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;
        uniforms["sunPosition"].value.set(400000, 400000, 400000);
        //uniforms["up"].value = new THREE.Vector3(0, 0, 1);

        this.grid.castShadow = true;
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.y = -0.075;
        this.grid.position.z = -3;

        this.stage.sceneManager.scene.add(this.grid);
    }
    hideSkyAndGround() {
        this.grid.visible = false;
        this.sky.visible = false;
    }
    showSkyAndGround() {
        this.grid.visible = true;
        this.sky.visible = true;
    }

    /* Hides the whole ground */
    hideGround() {
        this.hideEdges();
        this.hideGroundImage();
        this.hideGrid();
        this.plane.visible = false;
        this.grid.visible = false;
    }

    /* shows the whole ground */
    showGround() {
        this.showEdges();
        this.showGroundImage();
        this.showGrid();
        this.plane.visible = true;
        this.grid.visible = true;
    }

    exportAsSTL() {
        const allObjects = [];

        allObjects.push({
            mesh: this.plane,
            name: this.name,
        });

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (!(children[i] instanceof TextBox || children[i] instanceof Property)) {
                const objects = children[i].exportAsSTL();
                allObjects.push(...objects);
            }
        }
        return allObjects;
    }

    exportAsCollada() {
        // const texture = (new THREE.TextureLoader()).load(ONE_PIXEL_IMAGE_DATA);
        const mesh = this.plane.clone();

        mesh.material = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .GROUND[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT].MESH_COLOR,
        });
        mesh.name = this.name;

        const subArrays = [];

        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof Subarray) {
                const obj = children[i].exportAsCollada();
                subArrays.push(...obj);
            } else if (children[i] instanceof TextBox || children[i] instanceof Property) {
                // do nothing
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

    saveObject() {
        let groundData = {
            type: Ground.getObjectType(),
            children: []
        };

        groundData.wires = this.wires;
        groundData.selectedPreliminaryInverters = this.selectedPreliminaryInverters;

        // saving children
        for (let child of this.getChildren()) {
            groundData.children.push(child.saveObject());
        }

        groundData.errors = this.errors;

        groundData.microInverters = this.getMicroinvertersData();

        return groundData;
    }

    getMicroinvertersData() {
        const microInvertersData = [];
        for (let i = 0, l = this.microInverters.length; i < l; i += 1) {
            microInvertersData.push(this.microInverters[i].saveObject());
        }
        return microInvertersData;
    }

    addRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel) {
                modelObj.removeRoofTexture();
                modelObj.addMapTexture();
            }
        });
    }
    removeRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel) {
                modelObj.removeRoofTexture();
            }
        });
    }

    showRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel) {
                modelObj.showRoofTexture();
            }
        });
    }

    hideRoofTexture() {
        this.children.forEach(modelObj => {
            if (modelObj instanceof SmartroofModel || modelObj instanceof PolygonModel || modelObj instanceof Dormer || modelObj instanceof CylinderModel) {
                modelObj.hideRoofTexture();
            }
        });
    }

    hideImage() {
        this.groundImage.hide();
    }

    showImage() {
        this.groundImage.show();
    }

    async loadGroundImage(groundImageData) {
        if (this.groundImage) {
            this.groundImage.remove();
        }
        this.groundImage = new GroundImage(this.stage, groundImageData, null, this);
        this.loadingPromises.push(...this.groundImage.textureLoadPromise);
        const aspectRatio = await getAspectRatio(groundImageData.url);

        const scale = scaleMetersToRatio(
            (groundImageData.scale === INVALID_SCALE) ?
            getDefaultGroundSize(this.stage).width :
            groundImageData.scale,
            aspectRatio,
            this.stage.getImageDimensions().width
        );

        this.groundImage.loadObject({
            scale,
            rotation: groundImageData.rotation,
            offset: (groundImageData.offset.length == 0) ? [0, 0] : groundImageData.offset,
        });
    }

    initGridLines() {
        this.gridLines = new THREE.GridHelper(
            this.stage.getImageDimensions().width,
            this.stage.getImageDimensions().height,
        );
        this.gridLines.material.transparent = true;
        this.gridLines.material.opacity = 0.25;
        this.gridLines.material.color.set(0xbbbbbb);
        this.gridLines.rotateX(Math.PI / 2);
        this.gridLines.position.setZ(-0.06);
        this.objectsGroup.add(this.gridLines);
    }

    reset() {
        this.resetGridLines();
        this.resetEdges();
        this.resetGroundPlane();
    }

    resetEdges() {
        this.hideEdges();
        const planeVertices = coreUtils.getVerticesFromBufferGeometry(this.plane.geometry);
        const scaleMultiplier = this.stage.getImageDimensions().width /
            (planeVertices[1].x * 2);
        this.edgesMesh.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    resetGroundPlane() {
        const planeVertices = coreUtils.getVerticesFromBufferGeometry(this.plane.geometry);
        const scaleMultiplier = this.stage.getImageDimensions().width /
            (planeVertices[1].x * 2);
        this.plane.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    resetGridLines() {
        this.objectsGroup.remove(this.gridLines);
        this.initGridLines();
    }

    resizeGround(scaleMultiplier) {
        this.plane.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
        this.gridLines.geometry.scale(scaleMultiplier, 1, scaleMultiplier);
        this.edgesMesh.geometry.scale(scaleMultiplier, scaleMultiplier, 1);
    }

    async loadObject(groundData) {
        let requiredFonts = {Helvetica : {isPresent: false, bold: false, italics: false}, Arial : {isPresent: false, bold :false, italics :false}, Gentilis : {isPresent: false, bold :false, italics :false},};
        // load properties
        this.wires = groundData.wires === undefined ? {} : groundData.wires;
        let fontsLoaded = false;
        const groundChildren = groundData.children === undefined ? [] : groundData.children;
        for (let ind = 0, len = groundChildren.length; ind < len; ind += 1) {
            if (groundChildren[ind].type === TextBox.getObjectType()) {
                if(groundChildren[ind].font == "Helvetica"){
                    requiredFonts.Helvetica.isPresent = true;
                    requiredFonts.Helvetica.boldItalic = requiredFonts.Helvetica.boldItalic || (groundChildren[ind].fontBold && groundChildren[ind].fontItalics);
                    if(!groundChildren[ind].fontBold || !groundChildren[ind].fontItalics){
                        requiredFonts.Helvetica.bold = requiredFonts.Helvetica.bold || groundChildren[ind].fontBold;
                        requiredFonts.Helvetica.italics = requiredFonts.Helvetica.italics || groundChildren[ind].fontItalics;
                    }
                }
                else if(groundChildren[ind].font == "Arial"){
                    requiredFonts.Arial.isPresent = true;
                    requiredFonts.Arial.boldItalic = requiredFonts.Arial.boldItalic || (groundChildren[ind].fontBold && groundChildren[ind].fontItalics);
                    if(!groundChildren[ind].fontBold || !groundChildren[ind].fontItalics){
                        requiredFonts.Arial.bold = requiredFonts.Arial.bold || groundChildren[ind].fontBold;
                        requiredFonts.Arial.italics = requiredFonts.Arial.italics || groundChildren[ind].fontItalics;
                    }
                }
                else if(groundChildren[ind].font == "Gentilis"){
                    requiredFonts.Gentilis.isPresent = true;
                    requiredFonts.Gentilis.boldItalic = requiredFonts.Gentilis.boldItalic || (groundChildren[ind].fontBold && groundChildren[ind].fontItalics);
                    if(!groundChildren[ind].fontBold || !groundChildren[ind].fontItalics){
                        requiredFonts.Gentilis.bold = requiredFonts.Gentilis.bold || groundChildren[ind].fontBold;
                        requiredFonts.Gentilis.italics = requiredFonts.Gentilis.italics || groundChildren[ind].fontItalics;
                    }
                }
            }
        }
        // Store all the errors in this array
        this.errors = groundData.errors ? groundData.errors : [];
        for (let i = 0, len = groundChildren.length; i < len; i += 1) {
            let currentObject;
            try {            
                if (groundChildren[i].type === PolygonModel.getObjectType()) {
                    const polygonModel = new PolygonModel(this.stage);
                    currentObject = polygonModel;
                    this.addChild(polygonModel);
                    polygonModel.loadObject(groundChildren[i]);
                    if (polygonModel.getParent() !== this) {
                        console.error('Ground: Mismatch in parent while loading PolygonModel');
                    }
                } else if (groundChildren[i].type === RectangleObstruction.getObjectType()) {
                    const rectangleObstruction = new RectangleObstruction(this.stage);
                    currentObject = rectangleObstruction;
                    this.addChild(rectangleObstruction);
                    rectangleObstruction.loadObject(groundChildren[i]);
                    if (rectangleObstruction.getParent() !== this) {
                        console.error('Ground: Mismatch in parent while loading RectangleObstruction');
                    }
                } else if (groundChildren[i].type === CylinderModel.getObjectType()) {
                    const cylinderModel = new CylinderModel(this.stage);
                    currentObject = cylinderModel;
                    this.addChild(cylinderModel);
                    cylinderModel.loadObject(groundChildren[i]);
                    if (cylinderModel.getParent() !== this) {
                        console.error('Ground: Mismatch in parent while loading CylinderModel');
                    }
                } else if (groundChildren[i].type === Drawface.getObjectType()) {
                    const drawFace = new Drawface(this.stage);
                    currentObject = drawFace;
                    this.addChild(drawFace);
                    drawFace.loadObject(groundChildren[i]);
                    if (drawFace.getParent() !== this) {
                        console.error('Ground: Mismatch in parent while loading drawFace');
                    }                
                } else if (groundChildren[i].type === SmartroofModel.getObjectType()) {
                    const smartroofModel = new SmartroofModel(this.stage);
                    currentObject = smartroofModel;
                    this.addChild(smartroofModel);
                    smartroofModel.loadObject(groundChildren[i]);
                    if (smartroofModel.getParent() !== this) {
                        console.error('Ground: Mismatch in parent while loading smartroofModel');
                    }
                } 
                else if (groundChildren[i].type === EastWestRack.getObjectType()) {
                    if (groundChildren[i].eastWestSubarraydata) {
                        const ewRack = new EastWestRack(this.stage);
                        currentObject = ewRack;
                        ewRack.loadObject(groundChildren[i], this);
                    }
                    else {
                        continue;
                    }
                } else if (groundChildren[i].type === Subarray.getObjectType()) {
                    const subarray = new Subarray(this.stage);
                    currentObject = subarray;
                    subarray.loadObject(groundChildren[i], this);
                } else if (groundChildren[i].type === Gazebo.getObjectType()) {
                    const gazebo = new Gazebo(this.stage);
                    currentObject = gazebo;
                    gazebo.loadObject(groundChildren[i], this);
                } else if (groundChildren[i].type === Walkway.getObjectType()) {
                    const walkway = new Walkway(this.stage);
                    currentObject = walkway;
                    this.addChild(walkway);
                    walkway.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === SafetyLine.getObjectType()) {
                    const safetyLine = new SafetyLine(this.stage);
                    currentObject = safetyLine;
                    this.addChild(safetyLine);
                    safetyLine.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === Handrail.getObjectType()) {
                    const handrail = new Handrail(this.stage);
                    currentObject = handrail;
                    this.addChild(handrail);
                    handrail.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === Property.getObjectType()) {
                    const property = new Property(this.stage);
                    currentObject = property;
                    this.addChild(property);
                    property.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === AcCable.getObjectType()) {
                    // try {
                    // const acCable = new AcCable(this.stage);
                    // this.addChild(acCable);
                    // acCable.loadObject(groundChildren[i]);
                    // } catch (error) {
                    //     console.error('Ground.js: error in loading AC cable', error);
                    // }

                    //     // this.allCables.push({data:groundChildren[i], cable:acCable, isPaste:false});
                } else if (groundChildren[i].type === DcCable.getObjectType()) {
                    // const dcCable = new DcCable(this.stage);
                    // this.addChild(dcCable);
                    // this.allCables.push({data:groundChildren[i], cable:dcCable, isPaste:false});
                } else if (groundChildren[i].type === Conduit.getObjectType()) {
                    // const conduit = new Conduit(this.stage);
                    // this.addChild(conduit);
                    // conduit.loadObject(groundChildren[i]);
                    // this.allConduitAndCabletary.push(conduit);
                }
                // else if (groundChildren[i].type === DoubleConduit.getObjectType()) {
                //     const doubleConduit = new DoubleConduit(this.stage);
                //     this.addChild(doubleConduit);
                //     doubleConduit.loadObject(groundChildren[i]);
                //     this.allConduitAndCabletary.push(doubleConduit);
                // }
                // else if (groundChildren[i].type === DoubleSeparateConduit.getObjectType()) {
                //     const doubleSeparateconduit = new DoubleSeparateConduit(this.stage);
                //     this.addChild(doubleSeparateconduit);
                //     doubleSeparateconduit.loadObject(groundChildren[i]);
                //     this.allConduitAndCabletary.push(doubleSeparateconduit);
                // }
                // else if (groundChildren[i].type === SingleCableTray.getObjectType()) {
                //     const singleCableTray = new SingleCableTray(this.stage);
                //     this.addChild(singleCableTray);
                //     singleCableTray.loadObject(groundChildren[i]);
                //     this.allConduitAndCabletary.push(singleCableTray);
                // }
                // else if (groundChildren[i].type === DoubleCableTray.getObjectType()) {
                //     const doubleCableTray = new DoubleCableTray(this.stage);
                //     this.addChild(doubleCableTray);
                //     doubleCableTray.loadObject(groundChildren[i]);
                //     this.allConduitAndCabletary.push(doubleCableTray);
                // }
                // else if (groundChildren[i].type === DoubleSeparateCableTray.getObjectType()) {
                //     const doubleSeparateCableTray = new DoubleSeparateCableTray(this.stage);
                //     this.addChild(doubleSeparateCableTray);
                //     doubleSeparateCableTray.loadObject(groundChildren[i]);
                //     this.allConduitAndCabletary.push(doubleSeparateCableTray);
                // }
                else if (groundChildren[i].type === Tree.getObjectType()) {
                    const tree = new Tree(this.stage);
                    currentObject = tree;
                    this.addChild(tree);
                    tree.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === Inverter.getObjectType()) {
                    const inverter = new Inverter(this.stage);
                    currentObject = inverter;
                    this.addChild(inverter);
                    inverter.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === CombinerBox.getObjectType()) {
                    const combinerBox = new CombinerBox(this.stage);
                    currentObject = combinerBox;
                    this.addChild(combinerBox);
                    combinerBox.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === ACDB.getObjectType()) {
                    try {
                        const acdb = new ACDB(this.stage);
                        currentObject = acdb;
                        this.addChild(acdb);
                        acdb.loadObject(groundChildren[i]);
                    } catch (error) {
                        console.error('Ground.js: error in loading Acdb', error);
                    }
                    // this.allAcdbs.push({data:groundChildren[i], acdb:acdb, isPaste:false});
                } else if (groundChildren[i].type === DCDB.getObjectType()) {
                    const dcdb = new DCDB(this.stage);
                    currentObject = dcdb;
                    this.addChild(dcdb);
                    dcdb.loadObject(groundChildren[i]);
                } else if (groundChildren[i].type === TextBox.getObjectType()) {
                    if(!fontsLoaded){
                        // this.loadingPromises.push(getFont().then(()=>{
                        //     fontsLoaded = true;
                        //     const textBox = new TextBox(this.stage);
                        //     currentObject = textBox;
                        //     this.addChild(textBox);
                        //     textBox.loadObject(groundChildren[i]);
                        // }));
                        this.loadingPromises.push(new Promise(resolve => {
                            loadFonts(requiredFonts).then(()=>{
                                fontsLoaded = true;
                                const textBox = new TextBox(this.stage);
                                currentObject = textBox;
                                this.addChild(textBox);
                                textBox.loadObject(groundChildren[i]);
                                resolve();
                            })
                        }));
                    }
                    else{
                        const textBox = new TextBox(this.stage);
                        currentObject = textBox;
                        this.addChild(textBox);
                        textBox.loadObject(groundChildren[i]);
                    }
                } else {
                    console.error('Ground: Invalid object type in loadObject', groundChildren[i].type);
                }
            } catch (error) {
                console.error('error: ', error);
                notificationsAssistant.error({
                    title: 'Load Error',
                    message: 'Error loading object. Please contact support.',
                });  
                this.errors.push(groundChildren[i])
                currentObject.removeObject(); 
            }
        }

        // backward compatibility for inverters
        // Release 2021 feb
        // this code should/can? be removed in 2-3 months.
        try {
            if (groundData.hasOwnProperty('selectedPreliminaryInverters')) {
                if (groundData.selectedPreliminaryInverters.length > 0) {
                    const subarrays = [];
                    exporters.getSubarrays(this, subarrays);
                    if (subarrays.length === 0) {
                        throw 'No subarrays to load the old inverters into.';
                    }
                    const selectedSubarray = subarrays[0];
                    let inverterDataResponse = {};
                    for (let i = 0, l = groundData.selectedPreliminaryInverters.length; i < l; i += 1) {
                        try {
                            inverterDataResponse =
                                await API.MASTER_DATA_INVERTER.FETCH_MASTER_INVERTER_BY_OLD_ID(
                                    groundData.selectedPreliminaryInverters[i].inverterDetails.id
                                );
                        } catch (error) {
                            console.error(
                                'Ground.js: Inverter Mapping not found with id',
                                groundData.selectedPreliminaryInverters[i].inverterDetails.id,
                                error,
                            );
                            const inverterDetails = {
                                Size: parseInt(groundData.selectedPreliminaryInverters[i].inverterDetails.characteristics.paco) / 1000,
                                Make: groundData.selectedPreliminaryInverters[i].inverterDetails.characteristics.name,
                                Manufacturer: '',
                                id: 0,
                            }
                            const inverterData = {
                                inverterDetails,
                                quantity: groundData.selectedPreliminaryInverters[i].quantity,
                                isDCDB: false,
                            }
                            selectedSubarray.updateInverterAdditionForUnmappedInverters(inverterData);
                        }
                        if (inverterDataResponse.data !== undefined) {
                            const inverterData = {
                                inverterDetails: inverterDataResponse.data[0],
                                quantity: groundData.selectedPreliminaryInverters[i].quantity,
                                isDCDB: false,
                            }
                            selectedSubarray.updateInverterAddition(inverterData);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Ground.js: Cannot load old inverter properly', error);
        }
        if (groundData.microInverters !== undefined) {
            for (let i = 0, l = groundData.microInverters.length; i < l; i += 1) {
                const microInverter = new MicroInverter(this.stage, groundData.electricalProperties);
                microInverter.loadObject(groundData.microInverters[i]);
                microInverter.setMaxStringLength();
                this.microInverters.push(microInverter);
            }
        }
        this.updateRoofIntersections();
        // Jugaad fix for old designs showing ac size = 0
        this.stage.selectionControls.setSelectedObject(this);
        // window.stageLoaded = true;
        await Promise.all(this.loadingPromises).then(()=>{
            if(this.stage.getOverviewMode()){
                this.stage.updateTextMeshView('3D');
            }
            window.stageLoaded = true;
        });
    }

    // Helper Functions

    getMicroinverters() {
        return this.microInverters;
    }

    updateRoofIntersections() {
        const children = this.getChildren();
        const roofsToExclude = []
        for (let ind = 0; ind < children.length; ind += 1) {
            if(children[ind] instanceof SmartroofModel) {
                children[ind].getAllSmartroofIntersections(true, roofsToExclude);
            }
        }
    }

    get2DVertices() {
        let vertices = [];
        let x = this.stage.imageDimensions.width / 2;
        let y = this.stage.imageDimensions.height / 2;

        vertices.push([x, y]);
        vertices.push([-x, y]);
        vertices.push([-x, -y]);
        vertices.push([x, -y]);

        return vertices;
    }

    getParapetHeight() {
        return 0;
    }

    getTilt() {
        return 0;
    }

    getAzimuth() {
        return 180;
    }

    getZOnTopSurface() {
        return 0;
    }

    isIgnored() {
        return false;
    }

    updateWires(wires) {
        this.wires = wires;
    }

    // Functions pertaining to other objects

    async autoPanelPlacement(appParameters) {

        function deleteSubarrays() {
            for (let model of this.appModels) {
                deleteSubarrayForModel(model);
            }

        }

        function deleteSubarrayForModel(model) {
            if (model instanceof PolygonModel || model instanceof CylinderModel) {
                for (let child of model.getChildren()) {
                    if (child instanceof Subarray) {
                        child.removeObject();
                    }
                }
            }
        }

        function applyAutoPanelPlacement(object, appMap, moduleProperties) {
            for (let child of object.getChildren()) {
                if ((child instanceof PolygonModel || child instanceof CylinderModel)) {
                    if (child.placable && this.appModels.indexOf(child) > -1) {
                        deleteSubarrayForModel(child);
                        let subarray = new Subarray(this.stage);
                        subarray.moduleProperties = moduleProperties;
                        if (child instanceof PolygonModel || child instanceof CylinderModel) {
                            subarray.autoPanelPlacement(
                                child.get3DVertices(),
                                child,
                                appMap[child.id.toString()],
                                appMap['solarAccess'][appMap[child.id.toString()]['id']],
                                solarAccessCutoff);
                        }
                    }
                    applyAutoPanelPlacement.call(this, child, appMap, moduleProperties);
                }
            }
        }

        let moduleProperties = appParameters.moduleProperties;
        let solarAccessCutoff = appParameters.solarAccessCutoff / 100;

        let roofMap = roofMapExporter(this.stage);
        let placableModels = [];
        for (let model of this.appModels) {
            placableModels.push(model.getId());
        }

        let tableTypes = [];
        for (let tableType of appParameters.tableTypes) {
            tableTypes.push({
                landscape: tableType.panelOrientation === PANEL_ORIENTATION_LANDSCAPE,
                frameSizeUp: tableType.tableSizeUp,
                frameSizeWide: tableType.tableSizeWide,
                moduleSpacingUp: tableType.moduleSpacingUp,
                moduleSpacingWide: tableType.moduleSpacingWide,
                mountHeight: tableType.mountHeight
            })
        }

        let appRequest = {
            fieldSegment: {
                id: 1,
                tilt: appParameters.tilt,
                frameSpacing: appParameters.tableSpacing,
                azimuth: appParameters.azimuth,
                moduleLength: moduleProperties.moduleLength,
                moduleWidth: moduleProperties.moduleWidth,
                tableTypes: tableTypes,
                associatedObstacles: placableModels
            },
            obstacles: roofMap
        };
        try {
            const appResponse = await axios.post(
                BASE_URL + 'auto-panels?lat=' + this.stage.getLatitude().toString() +
                '&lon=' + this.stage.getLongitude().toString() +
                '&weather=' + this.stage.eventManager.getWeatherID(),
                appRequest
            );
            return Promise.resolve(
                [
                    loBind(applyAutoPanelPlacement, this, this),
                    appResponse.data,
                    moduleProperties,
                    solarAccessCutoff,
                    deleteSubarrays.bind(this)
                ]);
        } catch (error) {
            console.error('ERROR: App: Auto panel placement failed.', error);
            return Promise.reject(error);
        }
    }

    enableAppSelectionMode() {
        this.appModels = [];

        this.stage.selectionControls.selectGroundAndDisable();

        let models = exporters.getAllModelType();

        exporters.getModels(this, models);

        for (let model of models.polygons) {
            if (model.placable) {
                //model.highlightGeometry();
            } else {
                model.switchVisualState(VISUAL_STATES.APP_DISABLE, false);
            }
        }
        for (let model of models.smartroofs) {
            if (model.placable) {
                //model.highlightGeometry();
            } else {
                model.switchVisualState(VISUAL_STATES.APP_DISABLE, false);
            }
        }
        for (let model of models.cylinders) {
            if (model.placable) {
                //model.highlightGeometry();
            } else {
                model.switchVisualState(VISUAL_STATES.APP_DISABLE, false);
            }
        }

        this.canvas.addEventListener('mousedown', this.modelAppSelection, false);
    }

    modelAppSelection = (event) => {
        if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
            if (!this.stage.textSelectionControls.deSelectSelectedTextObject()) {
                return;
            }
            let intersectingObject = raycastingUtils.getTopObjectOnClick(event, this.stage);
            if (intersectingObject instanceof PolygonModel ||
                intersectingObject instanceof CylinderModel ||
                intersectingObject instanceof SmartroofModel) {
                console.log("swithc visual", intersectingObject);
                if (intersectingObject.placable) {
                    if (this.appModels.indexOf(intersectingObject) < 0) {
                        intersectingObject.switchVisualState(VISUAL_STATES.APP_HIGHLIGHT);
                        this.appModels.push(intersectingObject)
                    } else {
                        intersectingObject.switchMaterialState(this.stage.visualManager
                            .getMaterialStateBasedOnConditions(), false);
                        intersectingObject.switchVisualState(VISUAL_STATES.DEFAULT, true);
                        this.appModels.splice(this.appModels.indexOf(intersectingObject), 1);
                    }
                }
            }
        }
    };

    onCompleteAppSelectionMode() {
        this.stage.visualManager.updateVisualsForEditing(false);
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
        this.canvas.removeEventListener('mousedown', this.modelAppSelection, false);
    }

    onCancelAppSelectionMode() {
        this.stage.visualManager.updateVisualsForEditing(false);
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
        this.appModels = [];
        this.canvas.removeEventListener('mousedown', this.modelAppSelection, false);
    }

    getMinMax() {
        const arr = this.plane.geometry.attributes.position.array;
        const maxX = arr[3];
        const minX = arr[0];
        const maxY = arr[1];
        const minY = arr[7];

        return [minX, minY, maxX, maxY];
    }

    // Visual Functions

    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        if (this.stage.visualManager.getIn3D() || this.stage.sldView) {
            for (let i = 0, l = this.microInverters.length; i < l; i += 1) {
                this.microInverters[i].hideObject();
            }
        } else {
            if (this.stage.viewManager.showStringing) {
                for (let i = 0, l = this.microInverters.length; i < l; i += 1) {
                    this.microInverters[i].showObject();
                }
            }
        }
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.GROUND;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    updateVisualsBasedOnStates() {
        if (this.materialState === MATERIAL_STATES.SOLID) {
            this.groundImage.switchToSolidMaterial();

            this.plane.receiveShadow = true;
            this.plane.material = this.shadowMaterial;
        } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
            this.groundImage.switchToTranslucentMaterial();

            this.plane.receiveShadow = false;
            this.plane.material = this.material;
        }
        const newColors = this.getColorMap();
        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.plane);
        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.groundImage.getPlane());
    }

    hideGroundImage() {
        this.groundImage.hide();
    }

    showGroundImage() {
        this.groundImage.show();
    }

    hideGrid() {
        this.gridLines.visible = false;
    }

    showGrid() {
        this.gridLines.visible = true;
    }

    // Universal Functions

    onSelect() {}

    deSelect() {}

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

    enableObjectLayer(layer) {
        this.plane.layers.enable(layer);
    }

    disableObjectLayer(layer) {
        this.plane.layers.disable(layer);
    }

    showEdges() {
        this.edgesMesh.visible = true;
    }

    hideEdges() {
        this.edgesMesh.visible = false;
    }

    updateGroundForSLD() {
        this.plane.visible = false;
        this.removeRoofTexture();
        this.hideImage();
        this.gridLines.visible = false;
    }

    updateGroundForDrawing() {
        this.plane.visible = true;
        this.showImage();
        this.gridLines.visible = true;
    }

    static getObjectType() {
        return 'Ground'
    }

    getUUID() {
        return this.uuid;
    }

    getId() {
        return this.id;
    }
}

import * as THREE from 'three';
import { v4 } from 'uuid';
import * as utils from '../utils/utils';
import PolygonModel from '../objects/model/PolygonModel';
import Subarray from '../objects/subArray/Subarray';
import {
    MAX_DRAWING_POINTS,
    CREATED_STATE,
    DELETED_STATE,
    INVALID_PROPERTIES_ERROR,
    TEMP_STACK_USED_BY_DRAW_MANAGER,
    CROSSHAIR,
} from '../coreConstants';
import { 
    VISUAL_STATES,
    COLOR_MAPPINGS,
    MATERIAL_STATES,
    LINE_WIDTH,
    POINT_SIZE,
    THIN_BORDER_OUTLINE_POINT_SIZE,
    THIN_BORDER_OUTLINE_POINT_IMAGE_URL,
} from '../objects/visualConstants';
import CylinderModel from '../objects/model/CylinderModel';
import Tree from '../objects/model/Tree';
import TextBox from '../objects/subObjects/TextBox';
import LengthMeasurement from "../objects/subObjects/LengthMeasurement";
import ArcMeasurement from '../objects/subObjects/ArcMeasurement';
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import Walkway from '../objects/model/Walkway';
import Handrail from '../objects/model/Handrail';
import Property from '../objects/model/Property';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import Conduit from '../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import { getTopCommonModelBelowVertices } from '../utils/raycastingUtils';
import Dimension from '../objects/subObjects/Dimension';
import LassoSelectionTool from '../lib/LassoSelectionTool';
import * as visualUtils from '../utils/visualUtils';
import Mousetrap from 'mousetrap';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import InnerEdge from '../objects/model/smartroof/InnerEdge';
import RectangleObstruction from '../objects/model/Rectangle';

export default class DrawManager {
    constructor(stage) {
        this.stage = stage;
        this.name = "Temporary Drawing Shape";

        this.mousePoint = new THREE.Vector3();

        this.highestZ = 0;
        this.numVertices = 0;
        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.lineMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.rectMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5,
        });
        this.pointMaterial = new THREE.PointsMaterial({
            size: POINT_SIZE,
        });
        const firstPointSprite = new THREE.TextureLoader()
            .load(THIN_BORDER_OUTLINE_POINT_IMAGE_URL);
        this.firstPointMaterial = new THREE.PointsMaterial({
            size : THIN_BORDER_OUTLINE_POINT_SIZE,
            map: firstPointSprite,
        });
        this.lassoSelectionMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });

        this.circleMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.treeTrunkMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.treeCrownMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.textBoxMaterial = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
        });
        this.selectionPolygonMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
        });

        this.lineMesh = null;
        this.pointsMesh = null;
        this.rectMesh = null;
        this.selectionPolygonMesh = null;
        this.firstPointMesh = null;

        this.circleMesh = null;
        this.circleSegments = 32;
        this.circleVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.treeSegments = 32;
        this.treeTrunkMesh = null;
        this.treeTrunkVertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.treeCrownMesh = null;
        this.treeCrownVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.textBoxMesh = null;
        this.textBoxVertices = new Float32Array(5 * 3);

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.canvas = stage.rendererManager.getDomElement();

        this.currentDrawingObject = null;
        this.onClickHandler = () => {};
        this.onCompleteHandler = () => {};
        this.onCancelHandler = () => {};

        this.enabled = false;

        // For measurements
        this.outlinePoints = [];
        this.lengthMeasurements = [];
        this.arcMeasurements = [];

        this.validationError = null;

        // for state manager since this is not a baseObject
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        // for walkways
        this.walkwayParent = null;

        // for displaying length and angles while drawing.
        this.prevLengthVis;
        this.prevArcVis;

        // keeping tab count.
        this.tabCount = 0;
    }

    getState() {
        const drawManagerData = {
            uuid: this.uuid,
            numVertices: this.numVertices,
            vertices: [],
        };

        for (let i = 0; i < this.numVertices; i++) {
            drawManagerData.vertices.push(
                [
                    this.vertices[i * 3],
                    this.vertices[i * 3 + 1],
                    this.vertices[i * 3 + 2]
                ]
            )
        }
        return drawManagerData;
    }

    loadState(state) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.uuid = state.uuid;
            this.numVertices = state.numVertices;            

            for (let i = 0; i < this.numVertices; i++) {
                this.vertices[i * 3] = state.vertices[i][0];
                this.vertices[i * 3 + 1] = state.vertices[i][1];
                this.vertices[i * 3 + 2] = state.vertices[i][2];                
            }
            this.vertices[this.numVertices * 3] = this.mousePoint.x
            this.vertices[this.numVertices * 3 + 1] = this.mousePoint.y
            this.vertices[this.numVertices * 3 + 2] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

            if (this.outlinePoints.length > this.numVertices + 1) {
                this.outlinePoints[this.numVertices + 1].removeObject();
                this.outlinePoints.splice(this.numVertices + 1);
                this.outlinePoints[this.numVertices].setPosition(this.mousePoint.x, this.mousePoint.y, this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y));   
            }
            else if (this.outlinePoints.length < this.numVertices + 1) {
                let index = this.outlinePoints.length - 1
                this.outlinePoints[index].setPosition(
                    this.vertices[index * 3],
                    this.vertices[index * 3 + 1],                            
                    this.vertices[index * 3 + 2],    
                )
                for (let i = this.outlinePoints.length; i < this.numVertices + 1; i++) {                   
                    this.outlinePoints.push(
                        new OutlinePoints(
                            this.vertices[i * 3],
                            this.vertices[i * 3 + 1],                            
                            this.vertices[i * 3 + 2],                                                        
                            this,
                            this.stage,
                            this.getCurrentDrawingObject().getColorMap(),
                        )
                    );
                }
            }  

            this.updatePolygonOnPropertiesChange();

            this.updateGeometry();

            this.stage.snapManager.updateOnAddingPoint();

            this.updateParentsAndErrors();
        }
    }

    clearState() {
        this.numVertices = 0;

        if (this.currentParent !== null && this.currentParent !== undefined) {
            this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
        }

        this.vertices[0] = this.mousePoint.x;
        this.vertices[1] = this.mousePoint.y;
        this.vertices[2] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

        for (let i = this.outlinePoints.length - 1; i >= 1; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        this.outlinePoints[0].setPosition(this.vertices[0], this.vertices[1], this.vertices[2]);

        this.updateGeometry();
    }


    // Drawing functions

    initFirstPoint() {
        const firstPointGeometry = new THREE.BufferGeometry();
        firstPointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        this.firstPointMesh = new THREE.Points(firstPointGeometry, this.firstPointMaterial);
        this.firstPointMesh.name = 'First point';
        this.firstPointMesh.geometry.setDrawRange(0, 1);
        this.firstPointMesh.frustumCulled = false;
        this.objectsGroup.add(this.firstPointMesh);    
    }

    initPoints(material) {
        // Geometry for drawing points
        let pointGeometry = new THREE.BufferGeometry();
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        // Use default point material for drawing points
        let pointMaterial = this.pointMaterial;

        // If there is a passed material for points, then use that
        if (material !== null) {
            pointMaterial = material;
        }

        this.pointsMesh = new THREE.Points(pointGeometry, pointMaterial);
        this.pointsMesh.name = 'Drawing Points';
        if (!(this.currentDrawingObject instanceof Tree)) {
            this.pointsMesh.geometry.setDrawRange(0, 0);
        }
        // this.pointsMesh.geometry.setDrawRange(0, 0);
        this.pointsMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.pointsMesh);

        // initialise outline points
        this.outlinePoints = [];
        this.outlinePoints.push(new OutlinePoints(
            0,
            0,
            0,
            this,
            this.stage,
            this.currentDrawingObject.getColorMap(),
        ));
    }

    initLines(material) {
        // Geometry for drawing lines.
        // A separate geometry for shape and points to draw cylinder and points.
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.vertices, 3));

        // Use default material to draw lines
        let { lineMaterial } = this;

        // If there is a passed material, then use that
        if (material !== null) {
            lineMaterial = material;
        }

        this.lineMesh = new THREE.Line(lineGeometry, lineMaterial);
        this.lineMesh.name = 'Drawing Lines';
        if (!(this.currentDrawingObject instanceof Tree)) {
            this.lineMesh.geometry.setDrawRange(0, 0);
        }
        this.lineMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.lineMesh);
    }

    initSelectionPolygon() {
        const selectionPolygonGeometry = new THREE.ShapeGeometry(
            new THREE.Shape(),
            1,
        );

        // Use default material to draw lines
        let selectionPolygonMaterial = this.selectionPolygonMaterial;

        this.selectionPolygonMesh =
            new THREE.Mesh(selectionPolygonGeometry, selectionPolygonMaterial);
        this.selectionPolygonMesh.visible = false;
        this.selectionPolygonMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.selectionPolygonMesh);
    }

    initRectangle(material) {
        const rectGeometry = new THREE.ExtrudeGeometry(new THREE.Shape(), {
            depth: 0.1,
        });

        // Use default material to draw lines
        let rectMaterial = this.rectMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            rectMaterial = material;
        }

        this.rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
        this.rectMesh.visible = false;
        this.rectMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.rectMesh);
    }

    initDrawingPolygon(material) {
        const rectGeometry = new THREE.ExtrudeGeometry(new THREE.Shape(), {
            depth: 0.1,
        });

        // Use default material to draw lines
        let rectMaterial = this.rectMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            rectMaterial = material;
        }

        this.rectMesh = new THREE.Mesh(rectGeometry, rectMaterial);
        this.rectMesh.visible = false;
        this.rectMesh.frustumCulled = false;

        // Add the mesh to the group to add it to the scene
        this.objectsGroup.add(this.rectMesh);
    }

    initCircle(material) {
        let circleGeometry = new THREE.BufferGeometry();
        circleGeometry.setAttribute('position', new THREE.BufferAttribute(this.circleVertices, 3));

        let circleMaterial = this.circleMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            circleMaterial = material;
        }
        this.circleMesh = new THREE.Line(circleGeometry, circleMaterial);
        this.circleMesh.name = 'Circle Outline';
        this.circleMesh.geometry.setDrawRange(0, this.circleSegments + 1);
        this.circleMesh.frustumCulled = false;

        this.objectsGroup.add(this.circleMesh);
    }

    initTree(trunkMaterial, crownMaterial) {
        const treeTrunkGeometry = new THREE.BufferGeometry();
        const treeCrownGeometry = new THREE.BufferGeometry();

        treeTrunkGeometry.setAttribute('position', new THREE.BufferAttribute(this.treeTrunkVertices, 3));
        treeCrownGeometry.setAttribute('position', new THREE.BufferAttribute(this.treeCrownVertices, 3));

        let { treeTrunkMaterial } = this;
        let { treeCrownMaterial } = this;

        // If there is a passed material, then use that
        if (trunkMaterial !== null) {
            treeTrunkMaterial = trunkMaterial;
        }
        if (crownMaterial !== null) {
            treeCrownMaterial = crownMaterial;
        }
        this.treeTrunkMesh = new THREE.Line(treeTrunkGeometry, treeTrunkMaterial);
        this.treeTrunkMesh.name = 'Tree Trunk Outline';
        this.treeTrunkMesh.geometry.setDrawRange(0, this.treeSegments + 1);
        this.treeTrunkMesh.frustumCulled = false;

        this.treeCrownMesh = new THREE.Line(treeCrownGeometry, treeCrownMaterial);
        this.treeCrownMesh.name = 'Tree Crown Outline';
        this.treeCrownMesh.geometry.setDrawRange(0, this.treeSegments + 1);
        this.treeCrownMesh.frustumCulled = false;

        this.objectsGroup.add(this.treeTrunkMesh);
        this.objectsGroup.add(this.treeCrownMesh);
    }

    initTextBox(material) {
        let textBoxGeometry = new THREE.BufferGeometry();
        textBoxGeometry.setAttribute('position', new THREE.BufferAttribute(this.textBoxVertices, 3));

        let textBoxMaterial = this.textBoxMaterial;

        // If there is a passed material, then use that
        if (material !== null) {
            textBoxMaterial = material;
        }
        this.textBoxMesh = new THREE.Line(textBoxGeometry, textBoxMaterial);
        this.textBoxMesh.name = 'Text Box Outline';
        this.textBoxMesh.geometry.setDrawRange(0, 4 + 1);
        this.textBoxMesh.frustumCulled = false;

        this.objectsGroup.add(this.textBoxMesh);
    }

    initialize(
        object,
        onCompleteHandler,
        onCancelHandler,
        shapeMaterial = null,
        pointMaterial = null,
        rectMaterial = null,
        circleMaterial = null,
        treeTrunkMaterial = null,
        treeCrownMaterial = null,
        textBoxMaterial = null,
    ) {
        this.currentDrawingObject = object;
        this.onCompleteHandler = onCompleteHandler;
        this.onCancelHandler = onCancelHandler;

        // Enable Drawing
        this.enable();

        // Get max height in the scene and add a margin of 5 to ensure drawing is always on top
        this.highestZ = utils.getHighestZ(this.stage.ground) + 5;

        if (object instanceof RectangleObstruction) {
            this.initPoints(pointMaterial);
            this.initTextBox(textBoxMaterial); // because rectangle obstruction is similar to textBox.
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                this.currentDrawingObject.getTilt(),
            );
        }
        else if (object instanceof PolygonModel) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                this.currentDrawingObject.getTilt(),
            );
        }
        else if (object instanceof SmartroofModel) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                0,
            );
        }
        else if (object instanceof SmartroofFace) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                0,
            );
        }
        else if (object instanceof Subarray || object instanceof Dimension) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof Walkway) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initRectangle(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof Handrail) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof Property) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof AcCable) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof DcCable) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof Conduit) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof DoubleConduit) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof DoubleSeparateConduit) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof SingleCableTray) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof DoubleCableTray) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof DoubleSeparateCableTray) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initDrawingPolygon(rectMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof LassoSelectionTool) {
            this.initPoints(pointMaterial);
            this.initFirstPoint();
            this.initLines(this.lassoSelectionMaterial);
            this.initSelectionPolygon();
            this.updateDrawingSurfaceParams(180, 0);

            visualUtils.setMeshInvisible(this.pointsMesh);
            Mousetrap.bind('enter', () => {
                this.onCompleteLasso();
            });
        }
        else if (object instanceof CylinderModel) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initCircle(circleMaterial);
            this.updateDrawingSurfaceParams(
                this.currentDrawingObject.getAzimuth(),
                this.currentDrawingObject.getTilt(),
            );
        }
        else if (object instanceof Tree) {
            this.initPoints(pointMaterial);
            this.initLines(shapeMaterial);
            this.initTree(treeTrunkMaterial, treeCrownMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else if (object instanceof TextBox) {
            this.initPoints(pointMaterial);
            this.initTextBox(textBoxMaterial);
            this.updateDrawingSurfaceParams(180, 0);
        }
        else {
            console.error('DrawManager: initialize: Unknown object type', object);
        }

        // Add drawing shape and points to the scene
        this.stage.sceneManager.scene.add(this.objectsGroup);

        // disable selection controls
        this.stage.selectionControls.selectGroundAndDisable();
        this.stage.dragControls.disable();

        // disable duplicate manager
        this.stage.duplicateManager.disable();

        // Initialise Snap Manager
        this.stage.snapManager.initialize(object);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
    }

    reset() {
        this.mousePoint = new THREE.Vector3();
        this.numVertices = 0;
        this.highestZ = 0;

        this.vertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.lineMesh = null;
        this.pointsMesh = null;

        this.circleMesh = null;
        this.circleVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.treeTrunkMesh = null;
        this.treeTrunkVertices = new Float32Array(MAX_DRAWING_POINTS * 3);
        this.treeCrownMesh = null;
        this.treeCrownVertices = new Float32Array(MAX_DRAWING_POINTS * 3);

        this.textBoxMesh = null;
        this.textBoxVertices = new Float32Array(5 * 3);

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;

        this.currentDrawingObject = null;
        this.onClickHandler = () => {};
        this.onCompleteHandler = () => {};

        this.stage.snapManager.unInitialize();

        for (let i = this.lengthMeasurements.length - 1; i >= 0; i -= 1) {
            this.lengthMeasurements[i].remove();
            this.lengthMeasurements.splice(i, 1);
        }

        for (let i = this.arcMeasurements.length - 1; i >= 0; i -= 1) {
            this.arcMeasurements[i].remove();
            this.arcMeasurements.splice(i, 1);
        }

        for (let i = this.outlinePoints.length - 1; i >= 0; i -= 1) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        this.tabCount = 0;
        this.validationError = null;

        this.walkwayParent = null;
    }

    enable() {
        if (!this.enabled) {
            this.currentParent = null;

            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('click', this.onClick, false);
            
            if (!(this.currentDrawingObject instanceof Dimension ||
                this.currentDrawingObject instanceof LassoSelectionTool)) {
                window.addEventListener("keydown",this._editMode, true);
            }
            setTimeout(()=>{
                let desigCanvas = document.getElementById('design-canvas');
                desigCanvas.style.cursor = CROSSHAIR;
            },100);
            this.enabled = true;
            this.tabCount = 0;
            this.stage.visualManager.updateVisualsForEditing(true); 

            this.stage.stateManager.startTempStack(TEMP_STACK_USED_BY_DRAW_MANAGER);

            this.prevLengthVis = this.stage.viewManager.lengthVisible;
            this.prevArcVis = this.stage.viewManager.arcVisible;
            this.stage.viewManager.arcVisible = true;
            this.stage.viewManager.lengthVisible = true;

            this.stage.viewManager.disableDimensions();
        }
        else {
            console.error('ERROR: DrawManager: Cannot enable drawing - Drawing already enabled');
        }
    }

    disable() {
        //clear previous snap line oncomplete of drawing 
        this.stage.snapManager.clearSnapLine();
        if (this.enabled) {
            if (this.currentParent !== null && this.currentParent !== undefined) {
                this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
            }

            this.canvas.removeEventListener('click', this.onClick, false);
            this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
            
            if (!(this.currentDrawingObject instanceof Dimension ||
                this.currentDrawingObject instanceof LassoSelectionTool)) {
                window.removeEventListener('keydown',this._editMode, true);                
                window.removeEventListener('keydown',this._editMode, true);
                window.removeEventListener('keydown',this._editMode, true);                
            }

            let desigCanvas = document.getElementById('design-canvas');
            desigCanvas.style.cursor = 'default';

            this.enabled = false;
            this.tabCount = 0;
            this.stage.stateManager.stopTempStack();
            
            this.stage.visualManager.updateVisualsForEditing(false);
            this.currentParent = null;

            this.stage.viewManager.arcVisible = this.prevArcVis
            this.stage.viewManager.lengthVisible = this.prevLengthVis;

            this.stage.viewManager.enableDimensions();
        }
        else {
            console.error("ERROR: DrawManager: Cannot disable drawing - Drawing already disabled");
        }
    }

    async onComplete() {
        const currentParent = this.currentParent;
        this.disable();

        this.stage.stateManager.startContainer();
        try {
            if (this.currentDrawingObject instanceof Handrail) {
                this.currentDrawingObject.changeParent(currentParent);
            }
            if (this.currentDrawingObject instanceof Property) {
                this.currentDrawingObject.changeParent(this.stage.ground);
            }
            if (this.currentDrawingObject instanceof RectangleObstruction) {
                await this.onCompleteHandler(this.geometry, this.textBoxVertices);
            }
            else{
                await this.onCompleteHandler(this.geometry);
            }

            // enable selection controls
            this.stage.selectionControls.enable();
            this.stage.dragControls.enable();
            if(!(this.currentDrawingObject instanceof LassoSelectionTool))
                this.stage.selectionControls.setSelectedObject(this.currentDrawingObject);

            // enable duplicate manager
            this.stage.duplicateManager.enable();

            this.stage.stateManager.stopContainer();

            if (this.currentDrawingObject instanceof TextBox) {
                this.currentDrawingObject.initEditMode();
            }

            // Reset all assigned variables
            this.reset();

            this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
            this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
            
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: DrawManager: onComplete Failed', error);

            // enable selection controls
            this.stage.selectionControls.enable();
            this.stage.eventManager.setObjectsSelected(this.stage.selectionControls.getSelectedObject());
            this.stage.dragControls.enable();

            // enable duplicate manager
            this.stage.duplicateManager.enable();

            // Reset all assigned variables
            this.reset();

            this.stage.stateManager.stopContainer();
            this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
            this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });

            return Promise.reject(error);
        }
    }

    onCompleteLasso() {
        Mousetrap.unbind('enter');
        this.onComplete().then(
            () => {
                this.stage.eventManager.completeLassoSelectionToolCreation();
            },
            (error) => {
                this.stage.eventManager.errorLassoSelectionToolCreation(error)
            },
        );
    }

    onCancel() {
        // Disable Drawing
        this.disable();

        // Call Cancel handler of current drawing object
        this.onCancelHandler();

        // Reset all assigned variables
        this.reset();

        // select ground
        this.stage.selectionControls.enable();
        this.stage.eventManager.setObjectsSelected(this.stage.ground);
        this.stage.dragControls.enable();

        // enable duplicate manager
        this.stage.duplicateManager.enable();

        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'UNDO' });
        this.stage.stateManager.removeObjectStates({ uuid: this.uuid, actionType: 'REDO' });
    }


    // Geometry Functions

    updateGeometry() {
        if (this.currentDrawingObject instanceof RectangleObstruction) {
            this.updatePoint();
            this.updateRectangleObstruction();
        }
        else if (
            this.currentDrawingObject instanceof PolygonModel
            || this.currentDrawingObject instanceof Subarray
            || this.currentDrawingObject instanceof Dimension
            || this.currentDrawingObject instanceof SmartroofModel
            || this.currentDrawingObject instanceof SmartroofFace
        ) {
            this.updatePoint();
            this.updateLine();
        }
        else if (this.currentDrawingObject instanceof Walkway) {
            this.updatePoint();
            this.updateRectangle();
        }
        else if (this.currentDrawingObject instanceof Handrail) {
            this.updatePoint();
            this.updateHandrailPolygon();
        }
        else if (this.currentDrawingObject instanceof Property) {
            this.updatePoint();
            this.updateLine();
        }
        else if (this.currentDrawingObject instanceof AcCable) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof DcCable) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof Conduit) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof DoubleConduit) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof DoubleSeparateConduit) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof SingleCableTray) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof DoubleCableTray) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof DoubleSeparateCableTray) {
            this.updatePoint();
            this.updateDrawingPolygon();
        }
        else if (this.currentDrawingObject instanceof LassoSelectionTool) {
            this.updatePoint();
            this.updateLine();
            this.updateFirstPoint();
            this.updateSelectionPolygon();
        }
        else if (this.currentDrawingObject instanceof CylinderModel) {
            this.updatePoint();
            this.updateLine();
            this.updateCircle();
        }
        else if (this.currentDrawingObject instanceof Tree) {
            this.updatePoint();
            this.updateLine();
            this.updateTree();
        }
        else if (this.currentDrawingObject instanceof TextBox) {
            this.updatePoint();
            this.updateTextBox();
        }
        this.updateMeasurements();
    }

    updateFirstPoint() {
        if (this.numVertices <= 1) {
            this.firstPointMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    updatePoint() {
        if (this.currentDrawingObject instanceof Tree) {
            this.pointsMesh.geometry.setIndex(new THREE.BufferAttribute(
                new Uint16Array([0, this.numVertices]),
                1,
            ));
            this.pointsMesh.geometry.attributes.position.needsUpdate = true;
        }
        else {
            this.pointsMesh.geometry.setDrawRange(0, this.numVertices + 1);
            this.pointsMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateLine() {
        if (this.currentDrawingObject instanceof Tree) {
            this.lineMesh.geometry.setIndex(new THREE.BufferAttribute(
                new Uint16Array([0, this.numVertices]),
                1,
            ));
            this.lineMesh.geometry.attributes.position.needsUpdate = true;
        }
        else {
            this.lineMesh.geometry.setDrawRange(0, this.numVertices + 1);
            this.lineMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateSelectionPolygon() {
        if (this.numVertices >= 2) {
            const vectorVertices = utils.convertArrayTo3DVector(utils.drawingArrayTo2DArray(
                this.vertices,
                this.numVertices,
            ));

            const shape = new THREE.Shape(vectorVertices);
            const geometry = new THREE.ShapeGeometry(
                shape,
                1,
            );
            geometry.translate(0, 0, this.highestZ - 0.1);
            this.selectionPolygonMesh.geometry = geometry;
        }
    }

    updateCircle() {
        if (this.numVertices === 0) {
            this.circleMesh.geometry.setDrawRange(0, this.numVertices);
            this.circleMesh.visible = false;
        }

        else if (this.numVertices === 1) {
            const centerPoint = this.outlinePoints[0].getPosition().setZ(0);
            const radialPoint = this.outlinePoints[1].getPosition().setZ(0);

            // calculating circle radius dynamically
            const circleRadius = centerPoint.distanceTo(radialPoint);

            if (this.circleMesh !== null) {
                // storing circular vertices in buffergeometry
                for (let i = 0; i < this.circleSegments + 1; i += 1) {
                    const theta = ((i % this.circleSegments) / this.circleSegments) * Math.PI * 2;

                    this.circleVertices[i*3 +0] = centerPoint.x + Math.cos(theta) * circleRadius;
                    this.circleVertices[i*3 +1] = centerPoint.y + Math.sin(theta) * circleRadius;
                    this.circleVertices[i*3 +2] = centerPoint.z ;
                }
                this.circleMesh.geometry.attributes.position.needsUpdate = true;
                this.circleMesh.geometry.setDrawRange(0, this.circleSegments + 1);
            }

            this.circleMesh.visible = true;
        }
    }

    updateTree() {
        if (this.numVertices === 0) {
            this.treeTrunkMesh.geometry.setDrawRange(0, this.numVertices);
            this.treeTrunkMesh.visible = false;
            this.treeCrownMesh.visible = false;
        }

        else if (this.numVertices >= 1) {
            const centerPoint = this.outlinePoints[0].getPosition();
            const trunkRadialPoint =
                this.outlinePoints[1] !== undefined ? this.outlinePoints[1].getPosition() : null;
            const crownRadialPoint =
                this.outlinePoints[2] !== undefined ? this.outlinePoints[2].getPosition() : null;

            if (this.numVertices === 1) {
                this.treeTrunkMesh.visible = true;
                this.treeCrownMesh.visible = false;
            }
            else if (this.numVertices === 2) {
                this.treeCrownMesh.visible = true;
            }

            if (trunkRadialPoint !== null) {
                const trunkRadius = centerPoint.distanceTo(trunkRadialPoint);
                if (this.treeTrunkMesh !== null) {
                    // storing circular vertices in buffergeometry
                    for (let i = 0; i < this.treeSegments + 1; i += 1) {
                        const theta = ((i % this.treeSegments) / this.treeSegments) * Math.PI * 2;

                        this.treeTrunkVertices[(i * 3) + 0] =
                            centerPoint.x + (Math.cos(theta) * trunkRadius);
                        this.treeTrunkVertices[(i * 3) + 1] =
                            centerPoint.y + (Math.sin(theta) * trunkRadius);
                        this.treeTrunkVertices[(i * 3) + 2] = centerPoint.z;
                    }
                    this.treeTrunkMesh.geometry.attributes.position.needsUpdate = true;
                    this.treeTrunkMesh.geometry.setDrawRange(0, this.treeSegments + 1);
                }
            }

            if (crownRadialPoint !== null) {
                const crownRadius = centerPoint.distanceTo(crownRadialPoint);
                if (this.treeCrownMesh !== null) {
                    // storing circular vertices in buffergeometry
                    for (let i = 0; i < this.treeSegments + 1; i += 1) {
                        const theta = ((i % this.treeSegments) / this.treeSegments) * Math.PI * 2;

                        this.treeCrownVertices[(i * 3) + 0] =
                            centerPoint.x + (Math.cos(theta) * crownRadius);
                        this.treeCrownVertices[(i * 3) + 1] =
                            centerPoint.y + (Math.sin(theta) * crownRadius);
                        this.treeCrownVertices[(i * 3) + 2] = centerPoint.z;
                    }
                    this.treeCrownMesh.geometry.attributes.position.needsUpdate = true;
                    this.treeCrownMesh.geometry.setDrawRange(0, this.treeSegments + 1);
                }
            }
        }
    }

    updateRectangle() {
        if(this.numVertices === 0) {
            this.rectMesh.visible = false;
        } 
        else if (this.numVertices === 1) {

            const vertex1 = new THREE.Vector2(this.vertices[0], this.vertices[1]);
            const vertex2 = new THREE.Vector2(this.mousePoint.x, this.mousePoint.y);

            if (vertex1.distanceTo(vertex2) >= 0) {
                const setbackPolygon = utils.setbackPolygon(
                    this.currentDrawingObject.get2DVertices(vertex1, vertex2),
                    -0.001,
                );
                if (setbackPolygon.length === 0) {
                    return;
                }
                const erodedVertices = utils.convertArrayToVector(setbackPolygon);
                erodedVertices.splice(2, 2);

                if (erodedVertices.length !== 0) {
                    // get walkway parent
                    let currentWalkwayParent;
                    try {
                        [currentWalkwayParent] = getTopCommonModelBelowVertices(
                            utils.convertVectorToArray(erodedVertices),
                            this.stage,
                        );
                    }
                    catch (ex) {
                        return;
                    }
                    if (this.walkwayParent !== currentWalkwayParent) {
                        this.walkwayParent = currentWalkwayParent;
                        this.updateDrawingSurfaceParams(this.walkwayParent.getAzimuth(), this.walkwayParent.getTilt());
                        this.updateZOfAllVertices();
                        this.updatePoint();                
                        this.updateMeasurements({ updateAll: true });
                    }

                    const shape = new THREE.Shape(this.currentDrawingObject.getTiltAdjustedVertices(
                        new THREE.Vector3(this.vertices[0], this.vertices[1]),
                        new THREE.Vector3(this.vertices[3], this.vertices[4]),
                        currentWalkwayParent,
                    ));

                    const geometry = new THREE.ExtrudeGeometry(
                        shape,
                        {
                            depth: this.currentDrawingObject.coreHeight,
                            bevelEnabled: false,
                        }
                    );
                    
                    geometry.translate(0, 0, this.highestZ);
                    
                    this.rectMesh.geometry = geometry;
                    
                    this.rectMesh.visible = true;
                }
            }
        }    
    }

    updateTextBox() {
        if (this.numVertices === 0) {
            this.textBoxMesh.geometry.setDrawRange(0, this.numVertices);
            this.textBoxMesh.visible = false;
        }

        else if (this.numVertices === 1) {
            const startPoint = this.outlinePoints[0].getPosition().setZ(0);
            const endPoint = this.outlinePoints[1].getPosition().setZ(0);

            if (this.textBoxMesh !== null) {
                // storing circular vertices in buffergeometry
                // for (let i = 0; i < 4 + 1; i += 1) {
                //     this.textBoxVertices[i * 3] = point1.x + (deltaVector.x);
                //     this.textBoxVertices[(i * 3) + 1] = point1.y + (deltaVector.y);
                //     this.textBoxVertices[(i * 3) + 2] = point1.z ;
                // }
                /** Setting the top left corner point */
                this.textBoxVertices[0 * 3] = (startPoint.x);
                this.textBoxVertices[(0 * 3) + 1] = (startPoint.y);
                this.textBoxVertices[(0 * 3) + 2] = (this.highestZ);

                /** Setting top right corner point */
                this.textBoxVertices[1 * 3] = (endPoint.x);
                this.textBoxVertices[(1 * 3) + 1] = (startPoint.y);
                this.textBoxVertices[(1 * 3) + 2] = (this.highestZ);

                /** Setting bottom right position */
                this.textBoxVertices[2 * 3] = (endPoint.x);
                this.textBoxVertices[(2 * 3) + 1] = (endPoint.y);
                this.textBoxVertices[(2 * 3) + 2] = (this.highestZ);

                /** Setting bottom left corner */
                this.textBoxVertices[3 * 3] = (startPoint.x);
                this.textBoxVertices[(3 * 3) + 1] = (endPoint.y);
                this.textBoxVertices[(3 * 3) + 2] = (this.highestZ);

                /** Setting the top left corner point */
                this.textBoxVertices[4 * 3] = (startPoint.x);
                this.textBoxVertices[(4 * 3) + 1] = (startPoint.y);
                this.textBoxVertices[(4 * 3) + 2] = (this.highestZ);
                

                this.textBoxMesh.geometry.attributes.position.needsUpdate = true;
                this.textBoxMesh.geometry.setDrawRange(0, 4 + 1);
            }

            this.textBoxMesh.visible = true;
        }
    }

    updateRectangleObstruction() {
        //textBox variables are used because both draw in the same way.
        if (this.numVertices === 0) {
            this.textBoxMesh.geometry.setDrawRange(0, this.numVertices);
            this.textBoxMesh.visible = false;
        }
        else if (this.numVertices === 1) {
            const startPoint = this.outlinePoints[0].getPosition().setZ(0);
            const endPoint = this.outlinePoints[1].getPosition().setZ(0);

            if (this.textBoxMesh !== null) {
                const mag = 10;
                const parentAzi = utils.toRadian(parseFloat(this.currentParent.azimuth===undefined ? 180 : this.currentParent.azimuth));
                const alongAzi = new THREE.Vector2(mag*Math.sin(parentAzi), mag*Math.cos(parentAzi));
                const perpAzi = new THREE.Vector2(-mag*Math.cos(parentAzi), mag*Math.sin(parentAzi));
                const spAlong = startPoint.clone().add(alongAzi);
                const spPerp = startPoint.clone().add(perpAzi);
                const epAlong = endPoint.clone().add(alongAzi);
                const epPerp = endPoint.clone().add(perpAzi);
                const topEdgeAlong = [startPoint, spAlong];
                const topEdgePerp = [startPoint, spPerp];
                const bottomEdgeAlong = [endPoint, epAlong];
                const bottomEdgePerp = [endPoint, epPerp];
                let topPoint = utils.checkLineIntersection(topEdgeAlong, bottomEdgePerp);
                let bottomPoint = utils.checkLineIntersection(topEdgePerp, bottomEdgeAlong);
                /** Setting the top left corner point */
                this.textBoxVertices[0 * 3] = (startPoint.x);
                this.textBoxVertices[(0 * 3) + 1] = (startPoint.y);
                this.textBoxVertices[(0 * 3) + 2] = (this.highestZ);

                /** Setting top right corner point */
                this.textBoxVertices[1 * 3] = (topPoint.x);
                this.textBoxVertices[(1 * 3) + 1] = (topPoint.y);
                this.textBoxVertices[(1 * 3) + 2] = (this.highestZ);

                /** Setting bottom right position */
                this.textBoxVertices[2 * 3] = (endPoint.x);
                this.textBoxVertices[(2 * 3) + 1] = (endPoint.y);
                this.textBoxVertices[(2 * 3) + 2] = (this.highestZ);

                /** Setting bottom left corner */
                this.textBoxVertices[3 * 3] = (bottomPoint.x);
                this.textBoxVertices[(3 * 3) + 1] = (bottomPoint.y);
                this.textBoxVertices[(3 * 3) + 2] = (this.highestZ);

                /** Setting the top left corner point */
                this.textBoxVertices[4 * 3] = (startPoint.x);
                this.textBoxVertices[(4 * 3) + 1] = (startPoint.y);
                this.textBoxVertices[(4 * 3) + 2] = (this.highestZ);
                
                // this.currentDrawingObject.azimuth = this.currentParent.azimuth;

                this.textBoxMesh.geometry.attributes.position.needsUpdate = true;
                this.textBoxMesh.geometry.setDrawRange(0, 4 + 1);
            }

            this.textBoxMesh.visible = true;
        }
    }

    updateHandrailPolygon() {
        if(this.numVertices === 0) {
            this.rectMesh.visible = false;
        } 
        else if (this.numVertices >= 1) {

            const vertices = [];

            for (let i = 0, l = this.numVertices; i < l; i += 1) {
                vertices.push(new THREE.Vector3(this.vertices[i * 3], this.vertices[i * 3 + 1]));
            }

            vertices.push(new THREE.Vector3(this.mousePoint.x, this.mousePoint.y));

            // distance between last 2 vertices is not zero
            if (vertices[vertices.length - 1].distanceTo(vertices[vertices.length - 2]) > 0) {
                const setbackPolygon = utils.setbackPolygon(
                    this.currentDrawingObject.get2DVertices(vertices),
                    -0.001,
                );
                if (setbackPolygon.length === 0) {
                    return;
                }
                const erodedVertices = utils.convertArrayToVector(setbackPolygon);
                erodedVertices.splice(2, 2);

                if (erodedVertices.length !== 0) {
                    // get handrail parent
                    let currentHandrailParent;
                    try {
                        [currentHandrailParent] = getTopCommonModelBelowVertices(
                            utils.convertVectorToArray(erodedVertices),
                            this.stage,
                        );
                    }
                    catch (ex) {
                        return;
                    }
                    if (this.walkwayParent !== currentHandrailParent) {
                        this.walkwayParent = currentHandrailParent;
                        this.updateDrawingSurfaceParams(this.walkwayParent.getAzimuth(), this.walkwayParent.getTilt());
                        this.updateZOfAllVertices();
                        this.updatePoint();
                        this.updateMeasurements({ updateAll: true });
                    }

                    const shape = new THREE.Shape(this.currentDrawingObject.getTiltAdjustedVertices(
                        vertices,
                        currentHandrailParent,
                    ));

                    const geometry = new THREE.ExtrudeGeometry(
                        shape,
                        {
                            depth: this.currentDrawingObject.coreHeight,
                            bevelEnabled: false,
                        }
                    );
                    
                    geometry.translate(0, 0, this.highestZ);
                    
                    this.rectMesh.geometry = geometry;
                    
                    this.rectMesh.visible = true;
                }
            }
        }
    }
    
    updateDrawingPolygon() {
        if(this.numVertices === 0) {
            this.rectMesh.visible = false;
        } 
        else if (this.numVertices >= 1) {

            const vertices = [];

            for (let i = 0, l = this.numVertices; i < l; i += 1) {
                vertices.push(new THREE.Vector3(this.vertices[i * 3], this.vertices[i * 3 + 1]));
            }

            vertices.push(new THREE.Vector3(this.mousePoint.x, this.mousePoint.y));

            // distance between last 2 vertices is not zero
            if (vertices[vertices.length - 1].distanceTo(vertices[vertices.length - 2]) > 0) {
                const setbackPolygon = utils.setbackPolygon(
                    this.currentDrawingObject.get2DVertices(vertices),
                    -0.001,
                );
                if (setbackPolygon.length === 0) {
                    return;
                }
                const erodedVertices = utils.convertArrayToVector(setbackPolygon);
                erodedVertices.splice(2, 2);

                if (erodedVertices.length !== 0) {
                    // get handrail parent
                    let currentAcCableParent;
                    try {
                        [currentAcCableParent] = getTopCommonModelBelowVertices(
                            utils.convertVectorToArray(erodedVertices),
                            this.stage,
                        );
                    }
                    catch (ex) {
                        return;
                    }
                    if (this.walkwayParent !== currentAcCableParent) {
                        this.walkwayParent = currentAcCableParent;
                        this.updateDrawingSurfaceParams(this.walkwayParent.getAzimuth(), this.walkwayParent.getTilt());
                        this.updateZOfAllVertices();
                        this.updatePoint();
                        this.updateMeasurements({ updateAll: true });
                    }

                    const shape = new THREE.Shape(utils.convertArrayToVector(setbackPolygon));

                    const geometry = new THREE.ExtrudeGeometry(
                        shape,
                        {
                            depth: this.currentDrawingObject.coreHeight,
                            bevelEnabled: false,
                        }
                    );
                    
                    geometry.translate(0, 0, this.highestZ);
                    
                    this.rectMesh.geometry = geometry;
                    
                    this.rectMesh.visible = true;
                }
            }
        }
    }

    updatePolygonOnPropertiesChange() {
        if (
            this.currentDrawingObject instanceof PolygonModel
            || this.currentDrawingObject instanceof CylinderModel
        ) {
            this.updateDrawingSurfaceParams(this.currentDrawingObject.getAzimuth(), this.currentDrawingObject.getTilt())
            this.updateZOfAllVertices();
            
            this.updatePoint();
            this.updateLine();
            this.updateMeasurements({ updateAll: true });
        }
    }

    updateZOfAllVertices() {
        for (let i = 0; i < this.numVertices + 1; i++) {
            this.vertices[i * 3 + 2] = this.getZOnDrawingSurface(this.vertices[i * 3], this.vertices[i * 3 + 1]);
            this.outlinePoints[i].setPosition(this.vertices[i * 3], this.vertices[i * 3 + 1], this.vertices[i * 3 + 2])
        }        
    }

    getNewPointAfterClick() {
        const requiredDistance = 0.0012;
        const newZ = this.getZOnDrawingSurface(
            this.vertices[this.numVertices * 3],
            this.vertices[(this.numVertices * 3) + 1],
        );
        const newPoint = new THREE.Vector3();
        const lastPoint = this.outlinePoints[this.outlinePoints.length - 1].getPosition();
        lastPoint.z = newZ;
        let secondLastPoint;
        if (this.outlinePoints.length > 1) {
            secondLastPoint = this.outlinePoints[this.outlinePoints.length - 2].getPosition();
            secondLastPoint.z = newZ;
        }
        if (this.numVertices < 1) {
            newPoint.copy(lastPoint.addScalar(requiredDistance));
        }
        else {
            const alpha = requiredDistance / lastPoint.distanceTo(secondLastPoint);
            newPoint.copy(secondLastPoint).lerp(lastPoint, 1 + alpha);
        }
        newPoint.z = newZ;
        return newPoint;
    }

    addPoint() {
        const newPointAfterClick = this.getNewPointAfterClick();
        if (this.currentDrawingObject instanceof Walkway 
            || this.currentDrawingObject instanceof Dimension 
            || this.currentDrawingObject instanceof CylinderModel
            || this.currentDrawingObject instanceof TextBox 
            || this.currentDrawingObject instanceof RectangleObstruction) {
            // update number of vertices
            this.numVertices++;

            if (this.numVertices === 1) {
                // update snap manager
                this.stage.snapManager.updateOnAddingPoint();

                this.vertices[this.numVertices * 3] = newPointAfterClick.x;
                this.vertices[(this.numVertices * 3) + 1] = newPointAfterClick.y;
                this.vertices[(this.numVertices * 3) + 2] = newPointAfterClick.z;
                this.outlinePoints.push(new OutlinePoints(
                    this.vertices[this.numVertices * 3],
                    this.vertices[this.numVertices * 3 + 1],
                    this.vertices[this.numVertices * 3 + 2],
                    this,
                    this.stage,
                    this.currentDrawingObject.getColorMap(),
                ));
                
                this.updateGeometry();                

                // handle stateManager
                this.stage.stateManager.startContainer();
                this.stage.stateManager.add({ uuid: this.uuid, getStateCb: this.getState.bind(this) });
                this.stage.stateManager.stopContainer();

                this.updateParentsAndErrors();
            } 
            else if (this.numVertices === 2) {        
                if (this.validationError !== null) {
                    this.stage.eventManager
                        .customErrorMessage(this.validationError.message);
                    this.numVertices -= 1
                    return;
                }
                this.onComplete();
            }
        }
        else if (this.currentDrawingObject instanceof Tree) {
            this.numVertices += 1;
            if (this.numVertices < 3) {
                // update snap manager
                this.stage.snapManager.updateOnAddingPoint();

                this.vertices[this.numVertices * 3] = newPointAfterClick.x;
                this.vertices[(this.numVertices * 3) + 1] = newPointAfterClick.y;
                this.vertices[(this.numVertices * 3) + 2] = newPointAfterClick.z;
                this.outlinePoints.push(new OutlinePoints(
                    this.vertices[(this.numVertices * 3)],
                    this.vertices[(this.numVertices * 3) + 1],
                    this.vertices[(this.numVertices * 3) + 2],
                    this,
                    this.stage,
                    this.currentDrawingObject.getColorMap(),
                ));

                this.updateGeometry();

                // handle stateManager
                this.stage.stateManager.startContainer();
                this.stage.stateManager.add({
                    uuid: this.uuid,
                    getStateCb: this.getState.bind(this),
                });
                this.stage.stateManager.stopContainer();

                this.updateParentsAndErrors();
            }
            else if (this.numVertices === 3) {
                if (this.validationError !== null) {
                    this.stage.eventManager
                        .customErrorMessage(this.validationError.message);
                    this.numVertices -= 1
                    return;
                }
                this.onComplete();
            }
        }
        else if (this.currentDrawingObject instanceof PolygonModel || 
                    this.currentDrawingObject instanceof SmartroofFace ||
                    this.currentDrawingObject instanceof SmartroofModel || 
                    this.currentDrawingObject instanceof Subarray ||
                    this.currentDrawingObject instanceof Handrail ||
                    this.currentDrawingObject instanceof Property ||
                    this.currentDrawingObject instanceof AcCable ||
                    this.currentDrawingObject instanceof DcCable ||
                    this.currentDrawingObject instanceof Conduit ||
                    this.currentDrawingObject instanceof DoubleConduit ||
                    this.currentDrawingObject instanceof DoubleSeparateConduit ||
                    this.currentDrawingObject instanceof SingleCableTray ||
                    this.currentDrawingObject instanceof DoubleCableTray ||
                    this.currentDrawingObject instanceof DoubleSeparateCableTray ||
                    this.currentDrawingObject instanceof LassoSelectionTool) {

            // check for snapping to first vertex
            if (this.numVertices > 2
                && utils.isEquivalent(
                    this.mousePoint,                    
                    new THREE.Vector2(this.vertices[ 0 ], this.vertices[ 1 ])
                )
            ) {
                if (this.currentDrawingObject instanceof LassoSelectionTool) {
                    this.onCompleteLasso();
                }
                else {
                    this.stage.eventManager.clickCompleteButton();   
                }
            }
            else {
                // update number of vertices
                this.numVertices++;

                // update snap manager
                this.stage.snapManager.updateOnAddingPoint();

                // add outline point
                this.vertices[this.numVertices * 3] = newPointAfterClick.x;
                this.vertices[(this.numVertices * 3) + 1] = newPointAfterClick.y;
                this.vertices[(this.numVertices * 3) + 2] = newPointAfterClick.z;
                this.outlinePoints.push(new OutlinePoints(
                    this.vertices[this.numVertices * 3],
                    this.vertices[this.numVertices * 3 + 1],
                    this.vertices[this.numVertices * 3 + 2],
                    this,
                    this.stage,
                    this.currentDrawingObject.getColorMap(),
                ));

                this.updateGeometry();

                // handle stateManager
                this.stage.stateManager.startContainer();
                this.stage.stateManager.add({ uuid: this.uuid, getStateCb: this.getState.bind(this) });
                this.stage.stateManager.stopContainer();          

                this.updateParentsAndErrors();

                this.stage.eventManager.setObjectsCreated(this.currentDrawingObject, { onlyUpdateGetters: true });
            }
        }
    }

    // Event handling functions

    getVertexSnapPoint(event) {
        const snappedPoint = this.stage.snapManager.vertexSnap(event);
        const mousePoint =
            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);
        const allVertices = utils.drawingArrayToVectorArray(this.vertices, this.numVertices);

        // Check if the snapped point is the same as any other vertex
        for (let i = 1; i < allVertices.length - 1; i += 1) {
            if (allVertices[i].distanceTo(snappedPoint) <= 0.0001) {
                return mousePoint;
            }
        }

        // Check if the snapped point lies on any edge
        for (let i = 1; i < allVertices.length - 2; i += 1) {
            if (utils.checkIfPointLiesOnLineSegment(
                [allVertices[i], allVertices[i + 1]],
                snappedPoint,
            )) {
                return mousePoint;
            }
        }
        return snappedPoint;
    }

    onMouseMove = (event) => {
        this.mousePoint = this.getVertexSnapPoint(event);

        this.vertices[ this.numVertices * 3 ] = this.mousePoint.x;
        this.vertices[ this.numVertices * 3 + 1 ] = this.mousePoint.y;
        this.vertices[ this.numVertices * 3 + 2 ] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

        this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);

        // snap line for perfect angle 90 degree
        // TODO: can we shift this to snap manager ?
        if (this.numVertices >= 3) {
            const start = new THREE.Vector3(this.vertices[0], this.vertices[1],0);
            const end = new THREE.Vector3(this.vertices[this.numVertices * 3], this.vertices[this.numVertices*3+1],0);
            this.stage.snapManager.drawLastSnapLine(start, end, event);
        }

        this.updateParentsAndErrors();

        this.updateGeometry();
    };

    onClick = (event) => {
        this.mousePoint = this.getVertexSnapPoint(event);

        this.vertices[ this.numVertices * 3 ] = this.mousePoint.x;
        this.vertices[ this.numVertices * 3 + 1 ] = this.mousePoint.y;
        this.vertices[ this.numVertices * 3 + 2 ] = this.getZOnDrawingSurface(this.mousePoint.x, this.mousePoint.y);

        this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);

        if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
            const points = utils.drawingArrayTo2DArray(this.vertices, this.numVertices);
            let placingInformation;
            if (this.currentDrawingObject instanceof Handrail) {
                placingInformation = this.currentDrawingObject.getPlacingInformation(points, this.currentParent);
            }
            else {
                placingInformation = this.currentDrawingObject.getPlacingInformation(points, true);
            }
            const isSafe = placingInformation.pointUnplaceableError === null;
            if (isSafe) {
                this.addPoint();
            }
            else {
                this.stage.eventManager
                    .customErrorMessage(placingInformation.pointUnplaceableError.message);
            }
        }
    };


    // Measurement functions

    updateMeasurements({ updateAll } = { updateAll: false }) {
        if (this.currentDrawingObject instanceof RectangleObstruction) {
            if(this.numVertices === 0){
                while(this.lengthMeasurements.length>0){
                    let deletedLengthMeasurements = this.lengthMeasurements.pop();
                    deletedLengthMeasurements.hide();
                    deletedLengthMeasurements.remove();
                }
            }
            else if(this.numVertices === 1) {
                if(this.lengthMeasurements.length === 0){
                    const op0vector = this.outlinePoints[0].getPosition();
                    const op1vector = this.outlinePoints[1].getPosition();
                    const tempvec1 = new THREE.Vector3(this.textBoxVertices[3], this.textBoxVertices[4], this.textBoxVertices[5]);
                    let lengthMeasurement = new LengthMeasurement(
                        op0vector,
                        tempvec1,
                        this.stage,
                        this,
                    );
                    this.lengthMeasurements.push(lengthMeasurement);
                    lengthMeasurement = new LengthMeasurement(
                        tempvec1,
                        op1vector,
                        this.stage,
                        this,
                    );
                    this.lengthMeasurements.push(lengthMeasurement);
                    this.lengthMeasurements.forEach(lenghtEl => {
                        lenghtEl.show();
                        lenghtEl.disableTextSelection();
                    });
                }
                else{
                    const op0vector = this.outlinePoints[0].getPosition();
                    const op1vector = this.outlinePoints[1].getPosition();
                    const tempvec1 = new THREE.Vector3(this.textBoxVertices[3], this.textBoxVertices[4], this.textBoxVertices[5]);
                    this.lengthMeasurements[0].update(op0vector, tempvec1);
                    this.lengthMeasurements[1].update(tempvec1, op1vector);
                }
            }
        }
        else if (!(this.currentDrawingObject instanceof Dimension
            || this.currentDrawingObject instanceof LassoSelectionTool
            || this.currentDrawingObject instanceof TextBox)) {
            if (this.lengthMeasurements.length > this.outlinePoints.length - 1) {
                let deletedLengthMeasurements = this.lengthMeasurements.splice(this.outlinePoints.length - 1);
                for (let lengthMeasurement of deletedLengthMeasurements) {
                    lengthMeasurement.hide();
                    lengthMeasurement.remove();
                }
            }
            else if (this.lengthMeasurements.length < this.outlinePoints.length - 1) {
                for (let i = this.lengthMeasurements.length; i < this.outlinePoints.length - 1; i += 1) {
                    let lengthMeasurement;
                    if (!(this.currentDrawingObject instanceof Tree)) {
                        lengthMeasurement = new LengthMeasurement(
                            this.outlinePoints[i],
                            this.outlinePoints[i + 1],
                            this.stage,
                            this,
                        );
                    }
                    else {
                        lengthMeasurement = new LengthMeasurement(
                            this.outlinePoints[0],
                            this.outlinePoints[i + 1],
                            this.stage,
                            this,
                        );
                    }
                    lengthMeasurement.show();                
                    this.lengthMeasurements.push(lengthMeasurement);
                }
                for (let lengthMeasurement of this.lengthMeasurements) {
                    lengthMeasurement.update();
                    lengthMeasurement.disableTextSelection();
                }
            }

            if (this.lengthMeasurements.length > 0) {
                this.lengthMeasurements[this.lengthMeasurements.length - 1].update();
            }

            if (updateAll) {
                for (let lengthMeasurement of this.lengthMeasurements){
                    lengthMeasurement.update();
                }
            }
        }

        if (this.currentDrawingObject instanceof RectangleObstruction) {
        }
        else if (this.currentDrawingObject instanceof PolygonModel || this.currentDrawingObject instanceof SmartroofModel || this.currentDrawingObject instanceof Handrail) {
            if (this.arcMeasurements.length > this.outlinePoints.length - 1) {
                let deletedArcMeasurements = this.arcMeasurements.splice(this.outlinePoints.length - 1);
                for (let arcMeasurement of deletedArcMeasurements) {
                    arcMeasurement.hide();
                    arcMeasurement.remove();
                }
            }
            else if (this.arcMeasurements.length < this.outlinePoints.length - 1) {
                for (let i = this.arcMeasurements.length + 1; i <= this.outlinePoints.length - 1; i += 1) {
                    let arcMeasurement;
                    if(this.outlinePoints.length === 2){ // this condition is for when 1st point is added and we need to show arc with axis.
                        let tempOP = this.outlinePoints[i-1].getPosition();
                        tempOP.x += 5;
                        arcMeasurement = new ArcMeasurement(
                            tempOP,
                            this.outlinePoints[i-1],
                            this.outlinePoints[i],
                            this.stage,
                            this,
                        );
                    }
                    else{
                        arcMeasurement = new ArcMeasurement(
                            this.outlinePoints[i - 2],
                            this.outlinePoints[i - 1],
                            this.outlinePoints[i],
                            this.stage,
                            this,
                        );
                    }
                    arcMeasurement.show();                
                    this.arcMeasurements.push(arcMeasurement);
                }
                for (let arcMeasurement of this.arcMeasurements) {
                    arcMeasurement.update();
                    arcMeasurement.disableTextSelection();
                }
            }

            if (this.arcMeasurements.length > 0) {
                this.arcMeasurements[this.arcMeasurements.length - 1].update();
            }

            if (updateAll) {
                for (let arcMeasurement of this.arcMeasurements){
                    arcMeasurement.update();
                }
            }
        }
    }

    _editMode = (event) => {
        // enable editMode
        if(event.key === "Tab" && this.tabCount === 0) {
            event.preventDefault();
            this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
            this.canvas.removeEventListener('click', this.onClick, false);
            this.lengthMeasurements[this.lengthMeasurements.length - 1].enableTextSelection();
            this.lengthMeasurements[this.lengthMeasurements.length - 1].setTextEditable({ shouldCreateContainer: false, shouldCompleteOnNoChange: true });
            this.tabCount = 1;
        }
        else if(event.key === "Tab" && this.tabCount === 1) {
            event.preventDefault();
            if (this.arcMeasurements.length >= 1) {
                this.lengthMeasurements[this.lengthMeasurements.length - 1].disableTextSelection();
                const magnitude = this.lengthMeasurements[this.lengthMeasurements.length - 1].textObject.getElementInnerText();

                // manually moving the vertex along the length
                this.lengthMeasurements[this.lengthMeasurements.length - 1].moveVertex(magnitude);

                // manually updating the arc measurment according to the moved vertex
                this.arcMeasurements[this.arcMeasurements.length - 1].update();

                // manually deselecting the length text and then selecting the arc text
                this.stage.textSelectionControls.deSelectSelectedTextObject({ ignoreValueChange: true });
                this.arcMeasurements[this.arcMeasurements.length - 1].enableTextSelection();
                this.arcMeasurements[this.arcMeasurements.length - 1].setTextEditable({ shouldCreateContainer: false, shouldCompleteOnNoChange: true });
            }
        }
    };

    handleOnCancel() {
        if(this.tabCount === 1) {
            this.canvas.addEventListener('mousemove', this.onMouseMove, false);
            this.canvas.addEventListener('click', this.onClick, false);
            this.lengthMeasurements[this.lengthMeasurements.length - 1].disableTextSelection();
            if (this.arcMeasurements[this.arcMeasurements.length - 1]) {
                this.arcMeasurements[this.arcMeasurements.length - 1].disableTextSelection();
            }
            this.stage.textSelectionControls.deSelectSelectedTextObject();
            this.tabCount = 0;

            // set TopBar status
             this.stage.eventManager.setTopBarWhileDrawing(
                     this.onComplete, this.onCancel, this.currentDrawingObject, this
             );
        }
    }

    handleVertexMove(vertex){
        // this is for OutlinePoints which are not in visible state in DrawManager
    }

    handleVertexPlace(vertex){
        let position = vertex.getPosition();

        const allPoints = utils.drawingArrayTo2DArray(this.vertices, this.numVertices - 1);
        allPoints.push([
            position.x, position.y
        ]);
        const placingInformation = this.currentDrawingObject.getPlacingInformation(allPoints);

        if (placingInformation.pointUnplaceableError === null ||
                placingInformation.pointUnplaceableError === undefined) {
            // turn off editMode
            this.tabCount = 0;

            // set TopBar status
            this.stage.eventManager.setTopBarWhileDrawing(
                this.onComplete, this.onCancel, this.currentDrawingObject, this
            ).then(() => {
                this.vertices[ this.numVertices * 3 ] = position.x;
                this.vertices[ this.numVertices * 3 + 1 ] = position.y;
                this.vertices[ this.numVertices * 3 + 2 ] = this.getZOnDrawingSurface(position.x, position.y);

                this.outlinePoints[this.numVertices].setPosition(this.vertices[ this.numVertices * 3 ], this.vertices[ this.numVertices * 3 + 1], this.vertices[ this.numVertices * 3 + 2]);

                this.canvas.addEventListener('mousemove', this.onMouseMove, false);
                this.canvas.addEventListener('click', this.onClick, false); 
                this.mousePoint = position.clone();
                this.addPoint();                             
            });            
        }
        else {
            this.lengthMeasurements[this.lengthMeasurements.length - 1].setTextEditable({ shouldCreateContainer: false, shouldCompleteOnNoChange: true });
            this.stage.eventManager.customErrorMessage(placingInformation.pointUnplaceableError.message);
        }
    }

    updateMeshesWithNewColor(newColor) {
        visualUtils.updateMeshWithColor(newColor.EDGE_COLOR, this.circleMesh);
        visualUtils.updateMeshWithColor(newColor.EDGE_COLOR, this.textBoxMesh);
        visualUtils.updateMeshWithColor(newColor.TRUNK_EDGE_COLOR, this.treeTrunkMesh);
        visualUtils.updateMeshWithColor(newColor.CROWN_EDGE_COLOR, this.treeCrownMesh);
        visualUtils.updateMeshWithColor(newColor.MESH_COLOR, this.rectMesh);
        visualUtils.updateMeshWithColor(newColor.FIRST_POINT_DRAWING_COLOR, this.firstPointMesh);

        if (this.currentDrawingObject instanceof Tree) {
            let color = null;
            if (this.numVertices < 2) {
                color = newColor.TRUNK_EDGE_COLOR;
            }
            else {
                color = newColor.CROWN_EDGE_COLOR;
            }
            visualUtils.updateMeshWithColor(color, this.pointsMesh);
            visualUtils.updateMeshWithColor(color, this.lineMesh);
        }
        else if (newColor.OUTLINE_POINT_COLOR === undefined) {
            visualUtils.updateMeshWithColor(newColor.EDGE_COLOR, this.pointsMesh);
            visualUtils.updateMeshWithColor(newColor.EDGE_COLOR, this.lineMesh);
        }
        else {
            visualUtils.updateMeshWithColor(newColor.OUTLINE_POINT_COLOR, this.pointsMesh);
            visualUtils.updateMeshWithColor(newColor.EDGE_COLOR, this.lineMesh);
        }
    }

    getColorForStateWhenDrawing(state) {
        let newColor = null;
        if (this.currentDrawingObject instanceof PolygonModel || this.currentDrawingObject instanceof SmartroofModel || this.currentDrawingObject instanceof SmartroofFace ) {
            newColor = COLOR_MAPPINGS.POLYGON[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof CylinderModel) {
            newColor = COLOR_MAPPINGS.CYLINDER[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof Tree) {
            newColor = COLOR_MAPPINGS.TREE[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof Subarray) {
            newColor = COLOR_MAPPINGS.SUBARRAY[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof Walkway) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof Handrail) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof Property) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof AcCable) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof DcCable) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof Conduit) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof DoubleConduit) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof DoubleSeparateConduit) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof SingleCableTray) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof DoubleCableTray) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof DoubleSeparateCableTray) {
            newColor = COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.TRANSLUCENT][state]; // TODO Fix this
        }
        else if (this.currentDrawingObject instanceof Dimension) {
            newColor = COLOR_MAPPINGS.DIMENSION[MATERIAL_STATES.TRANSLUCENT][state];
        }
        else if (this.currentDrawingObject instanceof LassoSelectionTool
            || this.currentDrawingObject instanceof TextBox) {
            newColor = COLOR_MAPPINGS.LASSO_SELECTION[MATERIAL_STATES.TRANSLUCENT][state];
        }
        return newColor;
    }

    updateParentsAndErrors() {
        const placingInformation = this.currentDrawingObject
            .getPlacingInformation(utils.drawingArrayTo2DArray(this.vertices, this.numVertices), this.currentParent);
        if (placingInformation.errors.length !== 0 ||
            this.validationError !== null) {
            // There was 1 or more errors.
            visualUtils.setMeshInvisible(this.selectionPolygonMesh);
            if (placingInformation.pointUnplaceableError === null) {
                this.updateMeshesWithNewColor(this
                    .getColorForStateWhenDrawing(VISUAL_STATES.DRAWING_ERROR));
            }
            else {
                this.updateMeshesWithNewColor(this
                    .getColorForStateWhenDrawing(VISUAL_STATES.ERROR));
            }
        }
        else {
            visualUtils.setMeshVisible(this.selectionPolygonMesh);
            this.updateMeshesWithNewColor(this
                .getColorForStateWhenDrawing(VISUAL_STATES.DEFAULT_STATES.DEFAULT));
        }

        if (placingInformation.parent !== null && placingInformation.parent !== undefined) {
            // Parent was calculated successfully.
            if (this.currentDrawingObject instanceof CylinderModel ||
                    this.currentDrawingObject instanceof PolygonModel) {
                if (this.currentDrawingObject
                        .updateCurrentlyLockedParameter(placingInformation.tiltAndHeights)) {
                    this.stage.eventManager.setObjectsCreated(
                        this.currentDrawingObject,
                        { onlyUpdateLockedParameter: true },
                    );
                }
            }
            // special case for handrail
            if (this.currentDrawingObject instanceof Handrail) {
                // will enter here for the first time
                if (this.currentParent === null || this.currentParent === undefined) {
                    this.currentParent = placingInformation.parent;
                    placingInformation.parent.switchVisualState(VISUAL_STATES.PARENT, false);
                }
                if (this.currentParent !== placingInformation.parent) {
                    this.updateMeshesWithNewColor(this
                        .getColorForStateWhenDrawing(VISUAL_STATES.ERROR));
                }
                // check if any vertex is outside the parent model
            }
            else {
                if (this.currentParent !== null && this.currentParent !== undefined &&
                    this.currentParent !== placingInformation.parent) {
                        if (this.currentParents instanceof CylinderModel || this.currentParents instanceof PolygonModel) {
                            this.currentParents.hideObject();
                        }
                        this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
                }
                if (placingInformation.parent instanceof CylinderModel || placingInformation.parent instanceof PolygonModel)  {
                    placingInformation.parent.showObject();
                }
                    placingInformation.parent.switchVisualState(VISUAL_STATES.PARENT, false);
                    this.currentParent = placingInformation.parent;
            }
        }
        else {
            if (this.currentParent !== null && this.currentParent !== undefined) {
                this.currentParent.switchVisualState(VISUAL_STATES.DEFAULT, false);
            }
            if (!this.currentDrawingObject instanceof Handrail) {
                this.currentParent = null;
            }
        }
    }

    updatePropertiesValidationError(isValid) {
        if (isValid) {
            this.validationError = null;
        }
        else {
            this.validationError = new Error(INVALID_PROPERTIES_ERROR);
            this.updateMeshesWithNewColor(this
                .getColorForStateWhenDrawing(VISUAL_STATES.DRAWING_ERROR));
        }
    }
    
    // Helper functions
    get geometry() {
        let geometry;

        if (this.lineMesh !== null) {
            geometry = this.lineMesh.geometry.clone();
        }
        else if (this.pointsMesh !== null) {
            geometry = this.pointsMesh.geometry.clone();
        }

        if (this.currentDrawingObject instanceof PolygonModel ||
            this.currentDrawingObject instanceof SmartroofModel ||
            this.currentDrawingObject instanceof SmartroofFace ||
            this.currentDrawingObject instanceof Subarray ||
            this.currentDrawingObject instanceof CylinderModel ||
            this.currentDrawingObject instanceof Handrail ||
            this.currentDrawingObject instanceof Property ||
            this.currentDrawingObject instanceof AcCable ||
            this.currentDrawingObject instanceof DcCable ||
            this.currentDrawingObject instanceof Conduit ||
            this.currentDrawingObject instanceof DoubleConduit ||
            this.currentDrawingObject instanceof DoubleSeparateConduit ||
            this.currentDrawingObject instanceof SingleCableTray ||
            this.currentDrawingObject instanceof DoubleCableTray ||
            this.currentDrawingObject instanceof DoubleSeparateCableTray ||
            this.currentDrawingObject instanceof Tree) {
            geometry.noOfVertices = this.numVertices;
        }
        else if (this.currentDrawingObject instanceof LassoSelectionTool) {
            geometry.noOfVertices = this.numVertices + 1;
        }
        else if (this.currentDrawingObject instanceof Walkway
            || this.currentDrawingObject instanceof TextBox) {
            geometry.noOfVertices = 2;
        }

        return geometry;
    }

    getNoOfVertices() {
        return this.numVertices;
    }

    getVertices() {
        return this.vertices;
    }

    get2DVertices() {
        if (!this.isEnabled()) {
            console.error("ERROR: DrawManager - get2DVertices - DrawManager is not initialized");
            return [];
        }
        const vertices = [];

        for (let i = 0; i < this.numVertices; i += 1) {
            vertices.push([
                this.vertices[ i * 3 ],
                this.vertices[ i * 3 + 1]
            ]);
        }

        return vertices;
    }

    getEdges() {
        let vertices = utils.convertArrayToVector(this.get2DVertices());
        let edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([
                vertices[ i ],
                vertices[ i + 1 ]
            ]);
        }

        if (this.numVertices > 2 &&
            (vertices[ this.numVertices - 1 ].x !== vertices[ 0 ].x ||
                vertices[ this.numVertices - 1 ].y !== vertices[ 0 ].y)) {
            edges.push([
                vertices[ this.numVertices - 1 ],
                vertices[ 0 ]
            ]);
        }

        return edges;
    }

    getCurrentDrawingObject() {
        return this.currentDrawingObject;
    }

    updateDrawingSurfaceParams(azimuth, tilt) {        
        let placingPoint;
        if (0 <= azimuth && azimuth < 90) {
            placingPoint = new THREE.Vector3( this.stage.imageDimensions.width / 2, this.stage.imageDimensions.height / 2, this.highestZ );
        }
        else if (90 <= azimuth && azimuth < 180) {
            placingPoint = new THREE.Vector3( this.stage.imageDimensions.width / 2, -this.stage.imageDimensions.height / 2, this.highestZ );
        } 
        else if (180 <= azimuth && azimuth < 270) {
            placingPoint = new THREE.Vector3( -this.stage.imageDimensions.width / 2, -this.stage.imageDimensions.height / 2, this.highestZ );
        }
        else {
            placingPoint = new THREE.Vector3( -this.stage.imageDimensions.width / 2, this.stage.imageDimensions.height / 2, this.highestZ );
        }                
        this.dspA = Math.sin(tilt * Math.PI / 180) * Math.sin(azimuth * Math.PI / 180);
        this.dspB = Math.sin(tilt * Math.PI / 180) * Math.cos(azimuth * Math.PI / 180);
        this.dspC = Math.cos(tilt * Math.PI / 180);
        this.dspD = (-1 * (this.dspA * placingPoint.x + this.dspB * placingPoint.y + this.dspC * placingPoint.z));        
    }

    getZOnDrawingSurface(x, y) {
        return (-1 * (this.dspA * x + this.dspB * y + this.dspD)) / this.dspC;
    }

    isEnabled() {
        return this.enabled;
    }

    getValidationError() {
        return this.validationError;
    }
}

import * as THREE from 'three';
import PolygonModel from '../objects/model/PolygonModel';
import Dimension from '../objects/subObjects/Dimension';
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES } from '../objects/visualConstants';
import {
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
    THIRTYSIX_INCH_SETBACK,
    EIGHTEEN_INCH_SETBACK,
} from '../coreConstants';
import * as utils from '../utils/utils';
import * as unitUtils from '../../components/ui/length/utils'
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Dormer from '../objects/model/smartroof/Dormer';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { getAllModelType, getModels } from '../utils/exporters';
import { store } from '../../store';
import { serverBus } from '../../main';
import createBufferGeometry from '../utils/meshUtils';
import API from "@/services/api/";

export default class SmartroofSetbackEditMode {
    constructor(stage) {
        this.stage = stage;
        this.enabled = false;
        this.currentObject = null;
        this.setbackType = null;
        this.currentSelectedDimensionIdx = 0;
        this.setbackDimensionHolder = [];

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.setbackMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .SETBACK_COLOR,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
        });

        this.setbackMesh = new THREE.Mesh(
            createBufferGeometry(),
            this.setbackMaterial2D,
        );

        this.setbackMesh.visible = true;
        this.objectsGroup.add(this.setbackMesh);

        this.uniracCheck = this.isOrganisationUnirac();
        this.AHJCheck = this.computeAHJCheck();
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            document.addEventListener('keydown', this.handleKeyPress, false);
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            document.removeEventListener('keydown', this.handleKeyPress, false);
        }
    }

    handleKeyPress = (event) => {
        if (event.shiftKey && event.key === 'Tab') {
            this.tabMode(event, false);
        }
        else if (event.key === 'Tab') {
            this.tabMode(event, true);
        }
    };

    tabMode(event, selectNext) {
        event.preventDefault();
        if (selectNext) {
            this.currentSelectedDimensionIdx += 1;
            this.currentSelectedDimensionIdx =
                this.currentSelectedDimensionIdx > this.setbackDimensionHolder.length - 1 ?
                    0 : this.currentSelectedDimensionIdx;

            this.stage.textSelectionControls
                .deSelectSelectedTextObject({ ignoreValueChange: false });
            this.setbackDimensionHolder[this.currentSelectedDimensionIdx]
                .dimension.setTextEditable();
        }
        else {
            this.currentSelectedDimensionIdx -= 1;
            this.currentSelectedDimensionIdx = this.currentSelectedDimensionIdx < 0 ?
                this.setbackDimensionHolder.length - 1 : this.currentSelectedDimensionIdx;

            this.stage.textSelectionControls
                .deSelectSelectedTextObject({ ignoreValueChange: false });
            this.setbackDimensionHolder[this.currentSelectedDimensionIdx]
                .dimension.setTextEditable();
        }
    }

    initialize(object, setbackType) {
        if (!this.isSetbackEditSupported(object)) {
            this.stage.eventManager
                .customErrorMessage('Object not supported for setback edit');
            return false;
        }

        this.currentObject = object;
        this.firstObject = object;
        this.setbackType = setbackType;

        this.enable();

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();

        this.stage.sceneManager.scene.add(this.objectsGroup);

        const result = getAllModelType();
        getModels(this.stage.ground, result);


        const allSetBackShapes = [];
        const allSetBackGeometries = [];
        result.smartroofFaces.forEach((face) => {
            if (!face.isDeleted && face.isValidFace()) {
                this.currentObject = face;
                this.currentObject.hideMeasurement();
                this.currentObject.hideSetback();
                this.initSetbackDimensions();
                allSetBackShapes.push(...this.getSetbackShapes());
            }
        })
        allSetBackShapes.forEach((shape) => {
            const setbackGeometry = new THREE.ShapeGeometry(shape);
            allSetBackGeometries.push(setbackGeometry);
        })
        const setbackGeometry = BufferGeometryUtils
            .mergeGeometries(allSetBackGeometries);
        this.setbackMesh.geometry = setbackGeometry;

        // design defaults load

        this.designDefaults = this.stage.getDesignSettings();

        this.setButtonStatus();

        this.updateVisualsForSetbackEditMode(true);
        return true;
    }


    async automateAllSetbacks() {
        // design default settings for edges:
        const smartroofSetbacks = this.designDefaults.drawing_defaults.quickView.smartroofSetbacks;
        let ridge = smartroofSetbacks.ridge > 0 ? smartroofSetbacks.ridge : 0.001;
        const eaves = smartroofSetbacks.eaves > 0 ? smartroofSetbacks.eaves : 0.001;
        const hips = smartroofSetbacks.hips > 0 ? smartroofSetbacks.hips : 0.001;
        const rack = smartroofSetbacks.rack > 0 ? smartroofSetbacks.rack : 0.001;
        const valley = smartroofSetbacks.valley > 0 ? smartroofSetbacks.valley : 0.001;
        
        const ridgeLock = this.designDefaults.drawing_defaults.quickView.ridgeLocked;
        if (ridgeLock) {
            // automation rules:
            // AHJ
            // 33% rule
            // const uniracCheck = true;
            const areaCheck = this.uniracCheck ? this.compute33PercentCheck() : true;
            //
            ridge = this.AHJCheck && areaCheck ? EIGHTEEN_INCH_SETBACK : THIRTYSIX_INCH_SETBACK;
        }
        
        // remove all dimensions
        this.removeSetbackDimensions();
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        const allSetBackShapes = [];
        const allSetBackGeometries = [];
    
        result.smartroofs.forEach((model) => {
            model.automateSetbacks(eaves, rack, ridge, hips, valley);
            model.getChildren().forEach((child) => {
                if (!child.isDeleted && child.isValidFace()) {
                    this.currentObject = child;
                    this.currentObject.hideMeasurement();
                    this.currentObject.hideSetback();
                    this.initSetbackDimensions();
                    allSetBackShapes.push(...this.getSetbackShapes());
                }
            })
        })

        allSetBackShapes.forEach((shape) => {
            const setbackGeometry = new THREE.ShapeGeometry(shape);
            allSetBackGeometries.push(setbackGeometry);
        })
        const setbackGeometry = BufferGeometryUtils
            .mergeGeometries(allSetBackGeometries);
        this.setbackMesh.geometry = setbackGeometry;
    }

    async onComplete() {
        try {
            const result = getAllModelType();
            getModels(this.stage.ground, result);
            result.smartroofFaces.forEach((face) => {
                this.currentObject = face;
                const setbackValues = [];
                let holderIdxStart = 0;
                for (let i = 0; i < this.currentObject.setbackVertices.length; i++) {
                    const objectVertices2DVector = this.currentObject.setbackVertices[i];
                    const edgeSetbackValues = [];
                    for (let i = holderIdxStart; i < this.setbackDimensionHolder.length; i += 1) {
                        const holder = this.setbackDimensionHolder[i];
                        if (holder.dimension.associatedObject1 === this.currentObject) {
                            edgeSetbackValues.push(holder.edgeSetback);
                        }
                        if (edgeSetbackValues.length === objectVertices2DVector.length) {
                            holderIdxStart = i + 1;
                            break;
                        }
                    }
                    setbackValues.push(edgeSetbackValues);
                }
                this.currentObject[this.setbackType] = setbackValues;
                this.currentObject.updateSetback();
                this.currentObject.updateGeometry();
                this.currentObject.saveState();
            })
            this.exitSetbackEditMode();
            this.stage.eventManager.hideSelectionContextMenu();

            return Promise.resolve(true);
        }
        catch (error) {
            this.exitSetbackEditMode();
            this.stage.eventManager.hideSelectionContextMenu();
            return Promise.reject(error);
        }
    }

    exitSetbackEditMode() {
        // this.updateVisualsForSetbackEditMode(false);
        this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
        this.removeSetbackDimensions();
        this.disable();

        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();

        this.stage.selectionControls.setSelectedObject(this.firstObject);

        this.reset();
        this.stage.stateManager.stopContainer();
    }

    reset() {
        this.currentObject = null;
        this.setbackDimensionHolder = [];
        this.currentSelectedDimensionIdx = 0;
        this.setbackType = null;

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    removeSetbackDimensions() {
        for (let i = this.setbackDimensionHolder.length - 1; i >= 0; i -= 1) {
            this.setbackDimensionHolder[i].dimension.remove();
            this.setbackDimensionHolder.splice(i, 1);
        }
    }

    setButtonStatus() {
        this.stage.eventManager.setButtonStatusWhileSetbackEdit(
            this.onComplete.bind(this),
            this.exitSetbackEditMode.bind(this),
            this,
        );
    }

    initSetbackDimensions() {
        let objectEdges = this.currentObject.getEdges();
        let objectVertices = this.currentObject.get2DVertices();
        const edgeSetbackValues = this.currentObject[this.setbackType];

        if (this.currentObject instanceof SmartroofFace) {
            objectEdges = this.currentObject.getSetbackEdges();
            objectVertices = this.currentObject.setbackVertices;

            for (let index = 0; index < objectEdges.length; index++) {
                const objectEdge = objectEdges[index];
                const edgeSetbacks = edgeSetbackValues[index];

                let direction = DEFAULT_WALKWAY_DIRECTION;

                for (let i = 0, len = objectEdge.length; i < len; i += 1) {
                    // find mid point
                    const p1 = objectEdge[i][0].clone();
                    const p2 = objectEdge[i][1].clone();
                    const edgeMidPoint = new THREE.Vector2(0, 0).addVectors(p1, p2).divideScalar(2);

                    // setback edge fix for tilted surfaces
                    const vertex1 = new THREE.Vector3(p1.x,p1.y,this.currentObject.getParent().getZOnTopSurface(p1.x,p1.y));
                    const vertex2 = new THREE.Vector3(p2.x,p2.y,this.currentObject.getParent().getZOnTopSurface(p2.x,p2.y));
                    let setbackEdge;
                    if(this.currentObject.getParent()!== this.stage.ground){
                        setbackEdge = utils.getNormalPointsWithTiltedParent(
                            this.currentObject.getParent().get3DVertices(),
                            vertex1, 
                            vertex2, 
                            edgeSetbacks[i], 
                            direction,
                        );
                    }
                    else{
                        setbackEdge = utils.getNormalPoints(p1, p2, edgeSetbacks[i], direction);
                    }

                    //jugaad-fix smartroof face sometimes has less/more values of setback compared to edges
                    if(edgeSetbacks[i] === undefined) {
                        edgeSetbacks[i] = 0.5;
                    }
                    const setbackEdgeMidPoint =
                        new THREE.Vector2(0, 0).addVectors(setbackEdge[0], setbackEdge[1]).divideScalar(2);

                    // create dimension between these two mid points
                    const dimensionObject = new Dimension(this.stage, true);
                    // the object2(4th parameter)is currently taking the currentobject's parent, 
                    // for setbackoutside this is correct, and for setback inside need to pass this.currentObject instead of
                    // its parent.for now it will work for both setback inside and outside.the correct method is passing the 
                    // currentobject for setback inside.
                    // refactor required.
                    dimensionObject.makeDimension(
                        setbackEdgeMidPoint, this.currentObject,
                        edgeMidPoint, this.currentObject.getParent(),
                    );
                    dimensionObject.enable();
                    this.setbackDimensionHolder.push({
                        dimension: dimensionObject,
                        edge: objectEdge[i],
                        edgeSetback: edgeSetbacks[i],
                    });
                }
            }
        }
    }

    updateSetbackShape() {
        if (this.currentObject instanceof SmartroofFace) {
            const setbackGeometries = [];
            const setbackShapes = [];
            for (let i = 0; i < this.currentObject.setbackVertices.length; i++) {
                let setbackGeometry = new THREE.BufferGeometry();
                let setbackShape;
                const objectVertices2DVector = this.currentObject.setbackVertices[i];
                
                const edgeSetbackValues = [];
                for (let j = 0, len = objectVertices2DVector.length; j < len; j += 1) {
                    edgeSetbackValues.push(this.setbackDimensionHolder[i + j].edgeSetback);
                }

                if (this.setbackType === EDIT_SETBACK_INSIDE) {
                    const outerPoints = this.currentObject.setbackVertices[i].map(vector => [
                        vector.x,
                        vector.y,
                    ]);

                    const outsideFlag = utils.checkClockwise(outerPoints);
                    const setbacktype = outsideFlag ? EDIT_SETBACK_OUTSIDE : EDIT_SETBACK_INSIDE;
                    const setbackPoints = utils.newBuffer(
                        edgeSetbackValues,
                        outerPoints,
                        setbacktype,
                    );
                    const setbackPoints2DVector = setbackPoints
                    .map(loop => loop
                        .map(coordinate => new THREE.Vector2(coordinate.x, coordinate.y)));

                    if(outsideFlag) this.currentObject.innerLoops.push(setbackPoints[0].map(v => [v.x, v.y]));

                    setbackShape = new THREE.Shape(objectVertices2DVector);
                    if (Array.isArray(setbackPoints2DVector) &&
                        setbackPoints2DVector.length &&
                        setbackPoints2DVector.every(loop => Array.isArray(loop))) {
                        if(outsideFlag) {
                            setbackShape = new THREE.Shape(setbackPoints2DVector[0]);
                            setbackShape.holes = [new THREE.Path(objectVertices2DVector)];
                        }
                        else {
                            setbackShape = new THREE.Shape(objectVertices2DVector);
                            setbackShape.holes = [];
                            setbackPoints2DVector.forEach(loop => {
                                if (loop.length > 2) {
                                    setbackShape.holes.push(new THREE.Path(loop));
                                }
                            });
                        }
                    }
                }
                else {
                    const setbackPoints = utils.generateSetbackGeometry(
                        edgeSetbackValues,
                        this.currentObject.setbackEdges[i],
                        this.currentObject.setbackVertices[i],
                        this.setbackType,
                    );
                    const setbackPoints2DArray = utils.convertVectorArrayTo2DArray(setbackPoints);
                    setbackShape = new THREE.Shape(setbackPoints2DVector);
                    if (Array.isArray(setbackPoints2DArray) && setbackPoints2DArray.length) {
                        const setbackPoints2DVector =
                            utils.convertArrayToVector(setbackPoints2DArray);
                        setbackShape = new THREE.Shape(setbackPoints2DVector);
                        if (objectVertices2DVector.length > 2) {
                            setbackShape.holes = [new THREE.Path(objectVertices2DVector)];
                        }
                    }
                }
                setbackShapes.push(setbackShape);
                setbackGeometry = new THREE.ShapeGeometry(setbackShape);
                setbackGeometries.push(setbackGeometry);
            }
            const setbackGeometry = BufferGeometryUtils
                .mergeGeometries(setbackGeometries);
            this.setbackMesh.geometry = setbackGeometry;
            this.setbackMesh.parameters = { shapes: setbackShapes };
        }
    }

    getSetbackShapes() {
        const setbackShapes = [];
        let holderIdxStart = 0;
        for (let i = 0; i < this.currentObject.setbackVertices.length; i++) {
            let setbackShape;
            const objectVertices2DVector = this.currentObject.setbackVertices[i];
            
            const edgeSetbackValues = [];
            for (let i = holderIdxStart; i < this.setbackDimensionHolder.length; i += 1) {
                const holder = this.setbackDimensionHolder[i];
                if (holder.dimension.associatedObject1 === this.currentObject) {
                    edgeSetbackValues.push(holder.edgeSetback);
                }
                if (edgeSetbackValues.length === objectVertices2DVector.length) {
                    holderIdxStart = i + 1;
                    break;
                }
            }
            if (this.setbackType === EDIT_SETBACK_INSIDE) {
                const outerPoints = this.currentObject.setbackVertices[i].map(vector => [
                    vector.x,
                    vector.y,
                ]);

                const outsideFlag = utils.checkClockwise(outerPoints);
                const setbacktype = outsideFlag ? EDIT_SETBACK_OUTSIDE : EDIT_SETBACK_INSIDE;
                const setbackPoints = utils.newBuffer(
                    edgeSetbackValues,
                    outerPoints,
                    setbacktype,
                );
                const setbackPoints2DVector = setbackPoints
                .map(loop => loop
                    .map(coordinate => new THREE.Vector2(coordinate.x, coordinate.y)));

                if(outsideFlag) this.currentObject.innerLoops.push(setbackPoints[0].map(v => [v.x, v.y]));

                setbackShape = new THREE.Shape(objectVertices2DVector);
                if (Array.isArray(setbackPoints2DVector) &&
                    setbackPoints2DVector.length &&
                    setbackPoints2DVector.every(loop => Array.isArray(loop))) {
                    if(outsideFlag) {
                        setbackShape = new THREE.Shape(setbackPoints2DVector[0]);
                        setbackShape.holes = [new THREE.Path(objectVertices2DVector)];
                    }
                    else {
                        setbackShape = new THREE.Shape(objectVertices2DVector);
                        setbackShape.holes = [];
                        setbackPoints2DVector.forEach(loop => {
                            if (loop.length > 2) {
                                setbackShape.holes.push(new THREE.Path(loop));
                            }
                        });
                    }
                }
            }
            else {
                const setbackPoints = utils.generateSetbackGeometry(
                    edgeSetbackValues,
                    this.currentObject.setbackEdges[i],
                    this.currentObject.setbackVertices[i],
                    this.setbackType,
                );
                const setbackPoints2DArray = utils.convertVectorArrayTo2DArray(setbackPoints);
                setbackShape = new THREE.Shape(setbackPoints2DVector);
                if (Array.isArray(setbackPoints2DArray) && setbackPoints2DArray.length) {
                    const setbackPoints2DVector =
                        utils.convertArrayToVector(setbackPoints2DArray);
                    setbackShape = new THREE.Shape(setbackPoints2DVector);
                    if (objectVertices2DVector.length > 2) {
                        setbackShape.holes = [new THREE.Path(objectVertices2DVector)];
                    }
                }
            }
            setbackShapes.push(setbackShape);
        }

        return setbackShapes;
    }

    getDelta(modifiedDimensionIdx) {
        const clockWise = utils.checkClockwise(this.currentObject.get2DVertices());
        let direction;

        if (this.setbackType === EDIT_SETBACK_INSIDE) {
            direction = clockWise ? DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION;
        }
        else if (this.setbackType === EDIT_SETBACK_OUTSIDE) {
            direction = clockWise ? ALTERNATE_WALKWAY_DIRECTION : DEFAULT_WALKWAY_DIRECTION;
        }

        const modelEdge = this.setbackDimensionHolder[modifiedDimensionIdx].edge;
        const setbackValue = this.setbackDimensionHolder[modifiedDimensionIdx].edgeSetback
        const modelEdgeMidPoint2D = new THREE.Vector2(0, 0).addVectors(modelEdge[0], modelEdge[1]).divideScalar(2); 
        const modelEdgeMidPoint = new THREE.Vector3(
            modelEdgeMidPoint2D.x,
            modelEdgeMidPoint2D.y,
            0,
        );

        const setbackEdge = utils.getNormalPoints(modelEdge[0].clone(), modelEdge[1].clone(), setbackValue, direction);
        const setbackEdgeMidPoint2D = new THREE.Vector2(0, 0).addVectors(setbackEdge[0], setbackEdge[1]).divideScalar(2);
        const setbackEdgeMidPoint = new THREE.Vector3(
            setbackEdgeMidPoint2D.x,
            setbackEdgeMidPoint2D.y,
            0,
        );

        return setbackEdgeMidPoint.clone().sub(modelEdgeMidPoint).setLength(setbackValue);
    }

    handleOnValueComplete(newMagnitude, delta, modifiedDimension) {
        this.setButtonStatus();
        const modifiedDimensionIdx = this.setbackDimensionHolder
            .findIndex(obj => obj.dimension === modifiedDimension);
        this.currentSelectedDimensionIdx = modifiedDimensionIdx;
        this.currentObject = this.setbackDimensionHolder[this.currentSelectedDimensionIdx].dimension.associatedObject1;

        // store magnitude from dimension text box on complete
        this.setbackDimensionHolder[this.currentSelectedDimensionIdx]
            .edgeSetback = parseFloat(newMagnitude);
        
        let newDelta;
        if (delta.equals(new THREE.Vector3(0, 0, 0))) {
            newDelta = this.getDelta(modifiedDimensionIdx);
        }
        else {
            newDelta = delta;
        }

        this.setbackDimensionHolder[this.currentSelectedDimensionIdx]
        .dimension.handleAssociatedObjectMove(
            this.currentObject,
            newDelta.x,
            newDelta.y,
            newDelta.z,
        );

        const result = getAllModelType();
        getModels(this.stage.ground, result);

        const allSetBackShapes = [];
        const allSetBackGeometries = [];
        result.smartroofFaces.forEach((face) => {
            if (!face.isDeleted && face.isValidFace()) {
                this.currentObject = face;
                allSetBackShapes.push(...this.getSetbackShapes());
            }
        })
        allSetBackShapes.forEach((shape) => {
            const setbackGeometry = new THREE.ShapeGeometry(shape);
            allSetBackGeometries.push(setbackGeometry);
        })
        const setbackGeometry = BufferGeometryUtils
            .mergeGeometries(allSetBackGeometries);
        this.setbackMesh.geometry = setbackGeometry;
    }

    handleOnValueCancel() {
        // avoid magnitude from dimension text box on cancel
        this.setButtonStatus();
    }

    setbackValueValidator(magnitude) {
        let res = magnitude;
        if (!unitUtils.isMetricUnit()) {
            let feetArr = unitUtils.parseImperialMeasurement(magnitude);
            res = (0.3048 * feetArr[0]) + (0.0254 * feetArr[1]);
        }
        if(parseInt(res) === 0) {
            res = 0.001;
        }
        if (parseFloat(res) < 0.001) {

            return false;
        }
        return true;
    }

    updateVisualsForSetbackEditMode(enabled) {
        if (enabled) {
            this.currentObject.hideMeasurement();
            this.currentObject.hideSetback();
            this.stage.ground.switchVisualState(VISUAL_STATES.MIRROR_MODE, true);
            this.currentObject.switchVisualState(VISUAL_STATES.EDGE_HIGHLIGHT, false);
        }
        else {
            this.currentObject.showMeasurement();
            this.currentObject.showSetback();
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
        }
    }

    isSetbackEditSupported(object) {
        if (object instanceof PolygonModel || object instanceof SmartroofFace || object instanceof Dormer) {
            return true;
        }
        this.stage.eventManager
            .customErrorMessage('Object not supported for setback editing');
        return false;
    }

    isEnabled() {
        return this.enabled;
    }

    getAllModelArea() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        let modelArea = 0;
        for (let i = 0; i < result.smartroofs.length; i++) {
            modelArea =  modelArea + result.smartroofs[i].computeArea();
        }
        return modelArea;
    }

    updateModelArea() {
        serverBus.$emit('totalRoofArea', this.getAllModelArea.bind(this));
    }

    getAHJDetails() {
        return store.state.design.project;
    }

    computeAHJCheck() {
        const AHJDetails = this.getAHJDetails();
        let IBC = 2018;
        let IFC = 2018;
        if (AHJDetails.BuildingCode !== null && AHJDetails.BuildingCode !== "NA") {
            IBC = parseInt(AHJDetails.BuildingCode.slice(0, 4));
        }
        if (AHJDetails.FireCode !== null && AHJDetails.FireCode !== "NA") {
            IFC = parseInt(AHJDetails.FireCode.slice(0, 4));
        }
        const AHJCheck = IBC >= 2018 || IFC >= 2018;

        return AHJCheck;
    }

    compute33PercentCheck() {
        const totalRoofArea = this.getAllModelArea();
        const numberofPanels = this.designDefaults.drawing_defaults.quickView.totalModules;
        const panelProperties = this.designDefaults.drawing_defaults.subarray.flushMount.moduleProperties;
        const panelWidth = panelProperties.moduleWidth;
        const panelLength = panelProperties.moduleLength;

        const panelArea = panelLength * panelWidth * numberofPanels;

        const percent = panelArea / totalRoofArea * 100;

        return percent < 33.33;
    }

    async isOrganisationUnirac() {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const organisationId = user.organisation_id;

        let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
        if(!Object.keys(responseData).length && organisationId){
            responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
        }

        return (responseData.name === 'Unirac' && responseData.id === 114 );
    }
}

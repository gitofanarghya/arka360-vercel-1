import * as THREE from 'three';
import PolygonModel from '../objects/model/PolygonModel';
import Dimension from '../objects/subObjects/Dimension';
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES } from '../objects/visualConstants';
import {
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
} from '../coreConstants';
import * as utils from '../utils/utils';
import * as unitUtils from '../../components/ui/length/utils'
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Dormer from '../objects/model/smartroof/Dormer';
import * as JSTSConverter from '../utils/JSTSConverter';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import createBufferGeometry, { createMesh } from '../utils/meshUtils';

export default class SetbackEditMode {
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

        this.setbackMesh = createMesh(
            createBufferGeometry(),
            this.setbackMaterial2D,
        );

        this.setbackMesh.visible = true;
        this.objectsGroup.add(this.setbackMesh);
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
        this.setbackType = setbackType;

        this.enable();

        this.stage.dragControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.selectionControls.disable();

        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.initSetbackDimensions();

        this.setButtonStatus();

        this.updateVisualsForSetbackEditMode(true);
        return true;
    }

    async onComplete() {
        try {
            if(this.currentObject instanceof SmartroofFace){
                const setbackValues = [];
                let holderIndex = 0;
                for (let i = 0; i < this.currentObject.setbackVertices.length; i++) {
                    const objectVertices2DVector = this.currentObject.setbackVertices[i];
                    
                    const edgeSetbackValues = [];
                    for (let j = 0, len = objectVertices2DVector.length; j < len; j += 1) {
                        edgeSetbackValues.push(this.setbackDimensionHolder[holderIndex].edgeSetback);
                        holderIndex++;
                    }
                    setbackValues.push(edgeSetbackValues);
                }
                this.currentObject[this.setbackType] = setbackValues;
            }
            else {
                const edgeSetbackValues = [];
                for (let i = 0, len = this.setbackDimensionHolder.length; i < len; i += 1) {
                    edgeSetbackValues.push(this.setbackDimensionHolder[i].edgeSetback);
                }
                this.currentObject[this.setbackType] = edgeSetbackValues;
            }

            this.currentObject.updateGeometry();
            
            this.currentObject.saveState();
            this.exitSetbackEditMode();

            return Promise.resolve(true);
        }
        catch (error) {
            this.exitSetbackEditMode();
            return Promise.reject(error);
        }
    }

    exitSetbackEditMode() {
        this.updateVisualsForSetbackEditMode(false);
        this.removeSetbackDimensions();
        this.disable();

        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();

        this.stage.selectionControls.setSelectedObject(this.currentObject);

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
            objectEdges = this.currentObject.setbackEdges;
            objectVertices = this.currentObject.setbackVertices;

            for (let index = 0; index < objectEdges.length; index++) {
                const objectEdge = objectEdges[index];
                const edgeSetbacks = edgeSetbackValues[index];

                const clockWise = utils.checkClockwise(objectVertices[index]);
                let direction;

                if (this.setbackType === EDIT_SETBACK_INSIDE) {
                    direction = clockWise ? DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION;
                }
                else if (this.setbackType === EDIT_SETBACK_OUTSIDE) {
                    direction = clockWise ? ALTERNATE_WALKWAY_DIRECTION : DEFAULT_WALKWAY_DIRECTION;
                }

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
                        edgeMidPoint, this.currentObject,
                        setbackEdgeMidPoint, this.currentObject.getParent(),
                    );
                    dimensionObject.enable();
                    this.setbackDimensionHolder.push({
                        dimension: dimensionObject,
                        edge: objectEdge[i],
                        edgeSetback: edgeSetbacks[i],
                    });
                }
            }

            this.updateSetbackShape();

        }
        // if (!Array.isArray(edgeSetbackValues)) {
        //     const setbackValues = [];
        //     for (let i = 0, len = objectEdges.length; i < len; i += 1) {
        //         setbackValues.push(this.currentObject[this.setbackType]);
        //     }
        //     edgeSetbackValues = setbackValues;
        // }

        else {
            const clockWise = utils.checkClockwise(objectVertices);
            let direction;

            if (this.setbackType === EDIT_SETBACK_INSIDE) {
                direction = clockWise ? DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION;
            }
            else if (this.setbackType === EDIT_SETBACK_OUTSIDE) {
                direction = clockWise ? ALTERNATE_WALKWAY_DIRECTION : DEFAULT_WALKWAY_DIRECTION;
            }

            for (let i = 0, len = objectEdges.length; i < len; i += 1) {
                // find mid point
                const p1 = objectEdges[i][0].clone();
                const p2 = objectEdges[i][1].clone();
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
                        edgeSetbackValues[i], 
                        direction,
                    );
                }
                else{
                    setbackEdge = utils.getNormalPoints(p1, p2, edgeSetbackValues[i], direction);
                }

                //jugaad-fix smartroof face sometimes has less/more values of setback compared to edges
                if(edgeSetbackValues[i] === undefined) {
                    edgeSetbackValues[i] = 0.5;
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
                    edgeMidPoint, this.currentObject,
                    setbackEdgeMidPoint, this.currentObject.getParent(),
                );
                dimensionObject.enable();
                this.setbackDimensionHolder.push({
                    dimension: dimensionObject,
                    edge: objectEdges[i],
                    edgeSetback: edgeSetbackValues[i],
                });
            }
            this.updateSetbackShape();
        }
    }

    updateSetbackShape() {
        if (this.currentObject instanceof SmartroofFace) {
            const setbackGeometries = [];
            const setbackShapes = [];
            let holderIndex = 0;
            for (let i = 0; i < this.currentObject.setbackVertices.length; i++) {
                let setbackGeometry = createBufferGeometry();
                let setbackShape;
                const objectVertices2DVector = this.currentObject.setbackVertices[i];
                
                const edgeSetbackValues = [];
                for (let j = 0, len = objectVertices2DVector.length; j < len; j += 1) {
                    edgeSetbackValues.push(this.setbackDimensionHolder[holderIndex].edgeSetback);
                    holderIndex++;
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
        else {
            let setbackGeometry = createBufferGeometry();
            let setbackShape;
            const objectVertices2DVector =
                utils.convertArrayToVector(this.currentObject.get2DVertices());

            const edgeSetbackValues = [];
            for (let i = 0, len = this.setbackDimensionHolder.length; i < len; i += 1) {
                edgeSetbackValues.push(this.setbackDimensionHolder[i].edgeSetback);
            }

            if (this.setbackType === EDIT_SETBACK_INSIDE) {
                const setbackPoints = utils.newBuffer(
                    edgeSetbackValues,
                    this.currentObject.get2DVertices(),
                    this.setbackType,
                );
                const setbackPoints2DVector = setbackPoints
                    .map(loop => loop
                        .map(coordinate => new THREE.Vector2(coordinate.x, coordinate.y)));

                if (Array.isArray(setbackPoints2DVector) && setbackPoints2DVector.length && setbackPoints2DVector.every(loop => Array.isArray(loop))) {
                    setbackShape = new THREE.Shape(objectVertices2DVector);
                    setbackShape.holes = [];
                    setbackPoints2DVector.forEach(loop => {
                        if (loop.length > 2) {
                            setbackShape.holes.push(new THREE.Path(loop));
                        }
                    });
                }
            }
            else {
                const setbackPoints = utils.generateSetbackGeometry(
                    edgeSetbackValues,
                    this.currentObject.getEdges(),
                    this.currentObject.get2DVertices(),
                    this.setbackType,
                );
                const setbackPoints2DArray = utils.convertVectorArrayTo2DArray(setbackPoints);
                if (Array.isArray(setbackPoints2DArray) && setbackPoints2DArray.length) {
                    const setbackPoints2DVector =
                        utils.convertArrayToVector(setbackPoints2DArray);
                    setbackShape = new THREE.Shape(setbackPoints2DVector);
                    if (objectVertices2DVector.length > 2) {
                        setbackShape.holes = [new THREE.Path(objectVertices2DVector)];
                    }
                }
            }
            setbackGeometry = new THREE.ShapeGeometry(setbackShape);
            setbackGeometry.translate(
                0,
                0,
                this.currentObject.baseHeight + this.currentObject.coreHeight,
            );

            this.setbackMesh.geometry = setbackGeometry;
        }
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

        this.updateSetbackShape();
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
}

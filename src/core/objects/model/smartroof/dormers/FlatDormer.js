import * as THREE from 'three';
import Dormer from "../Dormer";
import * as utils from '../../../../utils/utils';
import SmartroofFace from '../SmartroofFace';
import { ACDB_WITH_NO_AREA_ERROR, COMPLEX_GEOMETRY_ERROR, DORMER_INVALID_PARENT_ERROR, OUT_OF_GROUND_ERROR } from '../../../../coreConstants';
import * as raycastingUtils from '../../../../utils/raycastingUtils';

export default class FlatDormer extends Dormer {
    constructor(stage){
        super(stage);
        this.stage = stage;
        this.tilt = 0;
        this.type = "Flat Dormer";
        this.faceInfo = [];

    }
    updateGeometry(whileRotating, g = true, flag = false) {

        let setbackOutsideGeometry;

        let vertices2DVectorArray = utils.convertArrayToVector(this.get2DVertices());
        let heightDiff = this.getHeightDiff();
        // create core
        const coreShape = new THREE.Shape(vertices2DVectorArray);
        const coreGeometry = new THREE.ExtrudeGeometry(
            coreShape,
            {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        coreGeometry.translate(0, 0, this.baseHeight);
        const numVertices = 5;
        if (this.getParent() instanceof SmartroofFace) {
            this.faceInfo = [];
            for (let i = 0; i < numVertices; i += 1) {
                const v = coreGeometry.vertices[numVertices + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y) ;
            }
            coreGeometry.vertices[numVertices + 1].z = coreGeometry.vertices[numVertices + 0].z + heightDiff;
            coreGeometry.vertices[numVertices + 2].z = coreGeometry.vertices[numVertices + 3].z + heightDiff;
            
            for (let i = 0; i < numVertices; i += 1) {
                const v = this.outlinePoints[i].getPosition();
                const d = this.getParent().getZOnTopSurface(v.x, v.y) - v.z;
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, d);
            }
            this.faceInfo.push(coreGeometry.vertices[5], coreGeometry.vertices[6], coreGeometry.vertices[7], coreGeometry.vertices[8], coreGeometry.vertices[9]);

            const temp = this.outlinePoints;
            temp[0].moveObjectWithoutConsequences(0, 0, temp[1].getPosition().z - temp[0].getPosition().z + heightDiff);
            temp[4].moveObjectWithoutConsequences(0, 0, temp[3].getPosition().z - temp[4].getPosition().z + heightDiff);

            // update base height (defined as the lowest z of top surface minus core height)
            // let minZOnTopSurface = +Infinity;
            // for (let i = 0; i < numVertices; i += 1) {
            //     if (coreGeometry.vertices[numVertices + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = coreGeometry.vertices[numVertices + i].z;
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

            if (this.faceInfo && flag) {
                for (let i = 0; i < 5; i++) {
                    this.faceInfo[i].z += this.coreHeight - d;
                }
            }
        }
        else {
            setbackOutsideGeometry = this.getSetbackOutsideGeometry();
        }
        if (this.faceInfo.length) {
            this.pitchPoint = this.faceInfo[0].clone();
        }
        else {
            this.pitchPoint = this.outlinePoints[1].getPosition().clone();
        }
        // Jugaad Bug fix
        // if (this.faceInfo[4] && this.faceInfo[3]) {
        //     this.faceInfo[4].z = this.faceInfo[3].z;
        // }
        const children = this.getChildren();
        if (children[0] instanceof SmartroofFace) {
            children[0].faceMesh = new THREE.Mesh(coreGeometry, this.meshMaterial3D);
        }
        this.coreMesh.geometry = coreGeometry;
        if (whileRotating) {
            this.coreEdges.clear();
            const tempCoreEdges = new THREE.LineSegments(
                new THREE.EdgesGeometry(this.coreMesh.geometry),
                this.edgeMaterial2D,
            );
            this.coreEdges.add(tempCoreEdges);
        }
        // this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);
        // this.coreEdges.position.z = this.coreMesh.position.z + 0.01;
        this.setbackOutsideMesh.geometry = setbackOutsideGeometry;
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
    async onComplete() {
        const notificationObject = this.stage.eventManager.setDormerCreating();

        try {
            await this.placeObject();
            this.stage.stateManager.stopContainer();
            this.stage.eventManager.completeDormerCreation(notificationObject);
            const v = this.outlinePoints[2].getPosition();
            const d = this.getParent().getZOnTopSurface(v.x, v.y);
            this.coreHeight = d;
            // this.coreHeight = this.faceInfo[3].z;
            this.stage.selectionControls.setSelectedObject(this);
        } catch (error) {
            console.error('ERROR: Dormer: OnComplete failed.', error);
            this.onCancel();
            this.stage.eventManager.errorDormerCreation(notificationObject);
        }
        return Promise.resolve(true);
    }
    createFace() {
        const op = this.outlinePoints;
        this.addChild(new SmartroofFace(this.stage, [op[0].getPosition(), op[1].getPosition(), op[3].getPosition(), op[4].getPosition()], [4,0], this.tilt ));
    }

    updateFacePoints() {
        const children = this.getChildren();
        const gg = this.faceInfo;
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof SmartroofFace) {
                if (this.tilt > 0) {
                    children[i].edge[0] = 1;
                    children[i].edge[1] = 2;
                }
                else {
                    children[i].edge[0] = 4;
                    children[i].edge[1] = 0;
                }
                // if (children[i].edge[0] == 4 && children[i].edge[1] == 0) {
                children[i].updateOutlinePoints([gg[0], gg[1], gg[2], gg[3], gg[4]]);
                children[i].tilt = Math.abs(this.tilt);
                // }
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
            this.tilt = properties.tilt;
            try {
                this.updateGeometry(true,true,true);
            } catch (error) {
                console.error('ERROR: Dormer: Update failed', error);
                return Promise.reject(error);
            }
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
                        [vertices2DArray[2][0] + offset, vertices2DArray[2][1] + offset]
                    ]
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
                const ratio = 0.8;
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

    updateEdgePoints() {
        this.edgePoints = [];
        const vertices = this.get3DVertices();
        let tempArr = [];
        for(let ind = 0; ind<vertices.length; ind+=1) {
            if(ind===vertices.length-1){
                tempArr.push(vertices[ind]);
                tempArr.push(vertices[0]);
                tempArr.push([vertices[0][0], vertices[0][1], 0]);
                tempArr.push([vertices[ind][0], vertices[ind][1], 0]);
            }
            else if (ind === 1){
                tempArr.push(vertices[ind]);
                tempArr.push(vertices[ind+2]);
                tempArr.push([vertices[ind+2][0], vertices[ind+2][1], 0]);
                tempArr.push([vertices[ind][0], vertices[ind][1], 0]);
                ind+=1;
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
                if (i == 2 || i == 1 || i == 3)
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


    getPitch() {
        let ret;
        if (this.faceInfo.length) {
            const deltaZ = this.faceInfo[1].z - this.pitchPoint.z;
            const deltaV = this.pitchPoint.clone().sub(this.faceInfo[1]).length();
            ret = utils.rad2Deg(Math.asin(deltaZ / deltaV));
        }
        else {
            const deltaZ = (this.outlinePoints[0].getPosition().z - this.pitchPoint.z);
            const deltaV = this.pitchPoint.clone().sub(this.outlinePoints[0].getPosition()).length();
            ret = utils.rad2Deg(Math.asin(deltaZ / deltaV));
        }
        return ret;
    }

    getAzimuth() {
        return this.azimuth;
    }

    getTilt() {
        return this.tilt;
    }

    getHeightDiff() {
        const e1 = this.outlinePoints[0].getPosition();
        e1.z = 0;
        const e2 = this.outlinePoints[1].getPosition();
        e2.z = 0;
        let heightDiff = e1.sub(e2).length();
        heightDiff *= Math.tan(utils.deg2Rad(this.tilt));
        return heightDiff;
    }
    getDefault2DVertices(){
        let vertices = [];
        vertices.push( [0,0] );
        vertices.push( [0,5] );
        vertices.push( [2.5, 5]);
        vertices.push( [5,5] );
        vertices.push( [5,0] );
        return vertices;
    }

    getRoofMapVertices() {
        return this.get3DVertices();
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: this.type,
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
        polygonModelData.lockedParameter = this.lockedParameter;
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

    static getObjectType(){
        return 'Flat Dormer';
    }
}
import * as THREE from 'three';
import Dormer from '../Dormer';
import * as utils from '../../../../utils/utils';
import SmartroofFace from '../SmartroofFace';
import {
    COMPLEX_GEOMETRY_ERROR,
    OUT_OF_GROUND_ERROR,
    ACDB_WITH_NO_AREA_ERROR,
    DORMER_INVALID_PARENT_ERROR,
    CREATED_STATE,
    DELETED_STATE,
} from '../../../../coreConstants';
import * as raycastingUtils from '../../../../utils/raycastingUtils';
import OutlinePoints from '../../../subObjects/OutlinePoints';
import { getChildrenSequence } from '../smartroofUtils';
import PolygonMeasurement from '../../../subObjects/PolygonMeasurement';
import Subarray from '../../../subArray/Subarray';
import { SmartroofModel } from '../SmartroofModel';
import SmartroofBuilder from '../SmartroofBuilder';

export default class HippedDormer extends Dormer {
    constructor(stage) {
        super(stage);
        this.stage = stage;
        this.type = 'Hipped Dormer';

        this.totalChange = 0;
        // For storing fold point as outline point object
        this.point;

        // For storing face vertices
        this.faceInfo = [];

        // Boolean to store the state of Fold
        this.verticalFold = false;

        this.FoldFace;

        this.coreGeometry1;
        this.coreGeometry2;
        this.coreGeometry3;
        
        this.test = new SmartroofBuilder('HippedDormer', this.stage);
        // this.test = new SmartroofModel(this.stage);
        // this.test.onComplete(0,[new THREE.Vector3(0, 0, 5),new THREE.Vector3(0, 5, 5),new THREE.Vector3(2.6, 7.6, 5),new THREE.Vector3(5, 5, 5),new THREE.Vector3(5, 0, 5)]);
        // this.test.coreHeight = this.coreHeight;
        // this.test.getChildren()[1].deleteFace();
        // this.test.getChildren()[2].deleteFace();
        // this.test.getChildren()[1].isDeleted = true;
        // this.test.getChildren()[2].isDeleted = true;
        
    }

    getInterSectionOfPlanes(p1, p2, p3) {
        // function to get the intersection points of three planes
        let n1 = p1.normal,
            n2 = p2.normal,
            n3 = p3.normal;
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

    deleteVerticalFold() {
        // function to remove the fold
        this.point.removeObject();
        this.verticalFold = false;
        this.point = null;
        this.updateGeometry(true);
        this.stage.eventManager.setObjectsSelected(this);
    }

    updateGeometry(whileRotating, g = true, flag = false) {
        let setbackOutsideGeometry;
        const midPoint = this.getPitchPoint();
        const vertices2DVectorArray = utils.convertArrayToVector(this.get2DVertices());
        const vertices2DVectorArray1 = vertices2DVectorArray.slice(0, 3);
        vertices2DVectorArray1.push(midPoint);
        const vertices2DVectorArray2 = vertices2DVectorArray.slice(2, 5);
        vertices2DVectorArray2.splice(0, 0, midPoint);
        const vertices2DVectorArray3 = [];
        vertices2DVectorArray3.push(vertices2DVectorArray[0], midPoint, vertices2DVectorArray[4]);
        // create core
        const coreShape1 = new THREE.Shape(vertices2DVectorArray1);
        this.coreGeometry1 = new THREE.ExtrudeGeometry(
            coreShape1,
            {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        this.coreGeometry1.translate(0, 0, this.baseHeight);

        const coreShape2 = new THREE.Shape(vertices2DVectorArray2);
        this.coreGeometry2 = new THREE.ExtrudeGeometry(
            coreShape2,
            {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        this.coreGeometry2.translate(0, 0, this.baseHeight);

        const coreShape3 = new THREE.Shape(vertices2DVectorArray3);
        this.coreGeometry3 = new THREE.ExtrudeGeometry(
            coreShape3,
            {
                depth: this.moduleDimensions.moduleDepth,
                bevelEnabled: false,
            },
        );
        this.coreGeometry3.translate(0, 0, this.baseHeight);

        const numVertices = 4;

        if (this.getParent() instanceof SmartroofFace) {
            this.faceInfo = [];

            for (let i = 0; i < numVertices; i += 1) {
                const v = this.coreGeometry1.vertices[numVertices + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y);
            }
            this.coreGeometry1.vertices[numVertices + 1].z = this.coreGeometry1.vertices[numVertices + 0].z;
            this.coreGeometry1.vertices[numVertices + 2].z = this.coreGeometry1.vertices[numVertices + 3].z;

            for (let i = 0; i < numVertices; i += 1) {
                const v = this.coreGeometry2.vertices[numVertices + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y);
            }
            this.coreGeometry2.vertices[numVertices + 1].z = this.coreGeometry2.vertices[numVertices + 0].z;
            this.coreGeometry2.vertices[numVertices + 2].z = this.coreGeometry2.vertices[numVertices + 3].z;

            for (let i = 0; i < numVertices - 1; i += 1) {
                const v = this.coreGeometry3.vertices[numVertices - 1 + i];
                v.z = this.getParent().getZOnTopSurface(v.x, v.y);
            }
            this.coreGeometry3.vertices[numVertices - 1].z = this.coreGeometry1.vertices[numVertices + 3].z;
            this.coreGeometry3.vertices[numVertices - 1 + 1].z = this.coreGeometry1.vertices[numVertices + 0].z;
            this.coreGeometry3.vertices[numVertices - 1 + 2].z = this.coreGeometry2.vertices[numVertices + 3].z;
            this.faceInfo.push(this.coreGeometry1.vertices[4], this.coreGeometry1.vertices[5], this.coreGeometry1.vertices[6], this.coreGeometry1.vertices[7], this.coreGeometry2.vertices[4], this.coreGeometry2.vertices[5], this.coreGeometry2.vertices[6], this.coreGeometry2.vertices[7], this.coreGeometry3.vertices[3], this.coreGeometry3.vertices[4], this.coreGeometry3.vertices[5]);
            // this.faceInfo.forEach(a => console.log('a',a.z))

            for (let i = 0; i < numVertices; i += 1) {
                const v = this.outlinePoints[i].getPosition();
                const d = this.getParent().getZOnTopSurface(v.x, v.y)  - v.z;
                this.outlinePoints[i].moveObjectWithoutConsequences(0, 0, d);
            }

            const temp = this.outlinePoints;
            temp[0].moveObjectWithoutConsequences(0, 0, temp[1].getPosition().z - temp[0].getPosition().z);
            temp[4].moveObjectWithoutConsequences(0, 0, temp[3].getPosition().z - temp[4].getPosition().z);
            // update base height (defined as the lowest z of top surface minus core height)
            // let minZOnTopSurface = +Infinity;
            // for (let i = 0; i < numVertices; i += 1) {
            //     if (this.coreGeometry1.vertices[numVertices + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = this.coreGeometry1.vertices[numVertices + i].z;
            //     }
            // }
            // for (let i = 0; i < numVertices; i += 1) {
            //     if (this.coreGeometry2.vertices[numVertices + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = this.coreGeometry2.vertices[numVertices + i].z;
            //     }
            // }
            // for (let i = 0; i < numVertices - 1; i += 1) {
            //     if (this.coreGeometry3.vertices[numVertices - 1 + i].z < minZOnTopSurface) {
            //         minZOnTopSurface = this.coreGeometry3.vertices[numVertices -1 + i].z;
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
                for (let i = 0; i < 11; i++) {
                    this.faceInfo[i].z += this.coreHeight - d;
                }
                // for(let i =0 ; i<this.outlinePoints.length ; i++){
                //     this.outlinePoints[i].setPosition(this.outlinePoints[i].getPosition().x,this.outlinePoints[i].getPosition().y,this.outlinePoints[i].getPosition().z + this.coreHeight- this.getParent().getParent().baseHeight);
                // }
            }
        }
        else {
            setbackOutsideGeometry = this.getSetbackOutsideGeometry();
        }

        this.FoldFace = this.coreGeometry3.vertices;
        this.foldCalculations(g);
        this.pitchPoint = this.coreGeometry1.vertices[numVertices + 2].clone();
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] instanceof SmartroofFace) {
                if (children[i].edge[0] === 0 && children[i].edge[1] === 1) {
                    children[i].faceMesh = new THREE.Mesh(this.coreGeometry1, this.meshMaterial3D);
                }
                if (children[i].edge[0] === 3 && children[i].edge[1] === 4) {
                    children[i].faceMesh = new THREE.Mesh(this.coreGeometry2, this.meshMaterial3D);
                }
                if (children[i].edge[0] === 4 && children[i].edge[1] === 0) {
                    children[i].faceMesh = new THREE.Mesh(this.coreGeometry3, this.meshMaterial3D);
                }
            }
        }
        this.coreGeometry1.merge(this.coreGeometry2);
        this.coreGeometry1.merge(this.coreGeometry3);
        this.coreMesh.geometry = this.coreGeometry1;
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
        this.tilt = parseFloat(this.getPitch());
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
            }
            catch (error) {
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
            }
            catch (error) {
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

        this.updateGeometry(true, true,true);

        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(0, 0, this.heightChange);
        }
    }
    foldCalculations(g = true) {
        // if the fold  exists
        if (this.point) {
            this.verticalFold = true;
            // defining the vertical fold plane
            const edgeHorizontalNormal = (new THREE.Vector3(this.coreGeometry3.vertices[5].y - this.coreGeometry3.vertices[4].y, this.coreGeometry3.vertices[4].x - this.coreGeometry3.vertices[5].x, 0)).normalize();
            const vertPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(edgeHorizontalNormal, new THREE.Vector3(this.point.vertexMesh.geometry.vertices[0].x, this.point.vertexMesh.geometry.vertices[0].y, this.point.vertexMesh.geometry.vertices[0].z));

            // defining the rest of the 3 planes
            const plane1 = new THREE.Plane().setFromCoplanarPoints(this.coreGeometry1.vertices[4], this.coreGeometry1.vertices[5], this.coreGeometry1.vertices[7]);
            const plane2 = new THREE.Plane().setFromCoplanarPoints(this.coreGeometry2.vertices[4], this.coreGeometry2.vertices[5], this.coreGeometry2.vertices[7]);
            const plane3 = new THREE.Plane().setFromCoplanarPoints(this.coreGeometry3.vertices[3], this.coreGeometry3.vertices[4], this.coreGeometry3.vertices[5]);

            // calculating the intersection points of planes
            const p1 = this.getInterSectionOfPlanes(vertPlane, plane2, plane3);
            const p2 = this.getInterSectionOfPlanes(plane1, plane2, vertPlane);
            const p3 = this.getInterSectionOfPlanes(vertPlane, plane1, plane3);

            // if the fold point is out of bounds, delete the fold
            if ((p1.z < this.coreGeometry3.vertices[5].z || p1.z > p2.z) && g) {
                this.deleteVerticalFold();
            }
            // recalculating the geometry
            else {
                this.faceInfo = [];
                this.error = false;
                const geometry1Vertices = [];
                const geometry2Vertices = [];
                const geometry3Vertices = [];
                const geometry1Vertices1 = [];
                const geometry2Vertices1 = [];
                const geometry3Vertices1 = [];

                // storing the updated points for each face
                geometry1Vertices.push(new THREE.Vector3(p3.x, p3.y, 0), this.coreGeometry1.vertices[1], this.coreGeometry1.vertices[2], this.coreGeometry1.vertices[3], new THREE.Vector3(p2.x, p2.y, 0), this.coreGeometry1.vertices[4], this.coreGeometry1.vertices[5], p3, p2, this.coreGeometry1.vertices[7]);
                geometry2Vertices.push(this.coreGeometry2.vertices[0], new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0), this.coreGeometry2.vertices[2], this.coreGeometry2.vertices[3], this.coreGeometry2.vertices[4], p2, p1, this.coreGeometry2.vertices[6], this.coreGeometry2.vertices[7]);
                geometry3Vertices.push(this.coreGeometry3.vertices[0], this.coreGeometry3.vertices[1], new THREE.Vector3(p3.x, p3.y, 0), new THREE.Vector3(p1.x, p1.y, 0), p3, this.coreGeometry3.vertices[4], this.coreGeometry3.vertices[5], p1);
                geometry1Vertices1.push(new THREE.Vector3(p3.x, p3.y, 0), this.coreGeometry1.vertices[1], this.coreGeometry1.vertices[2], this.coreGeometry1.vertices[3], new THREE.Vector3(p2.x, p2.y, 0));
                geometry2Vertices1.push(this.coreGeometry2.vertices[0], new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0), this.coreGeometry2.vertices[2], this.coreGeometry2.vertices[3]);
                geometry3Vertices1.push(this.coreGeometry3.vertices[0], this.coreGeometry3.vertices[1], new THREE.Vector3(p3.x, p3.y, 0), new THREE.Vector3(p1.x, p1.y, 0));

                // updating each geometry with new face points
                const coreShape11 = new THREE.Shape(geometry1Vertices1);
                this.coreGeometry1 = new THREE.ExtrudeGeometry(
                    coreShape11,
                    {
                        depth: this.moduleDimensions.moduleDepth,
                        bevelEnabled: false,
                    },
                );
                this.coreGeometry1.vertices[5].z = p3.z;
                this.coreGeometry1.vertices[6].z = p2.z;
                this.coreGeometry1.vertices[7].z = p2.z;
                this.coreGeometry1.vertices[8].z = geometry1Vertices[5].z;
                this.coreGeometry1.vertices[9].z = geometry1Vertices[5].z;

                // storing new face path
                this.faceInfo.push(this.coreGeometry1.vertices[5], this.coreGeometry1.vertices[6], this.coreGeometry1.vertices[7], this.coreGeometry1.vertices[8], this.coreGeometry1.vertices[9]);

                const coreShape22 = new THREE.Shape(geometry2Vertices1);
                this.coreGeometry2 = new THREE.ExtrudeGeometry(
                    coreShape22,
                    {
                        depth: this.moduleDimensions.moduleDepth,
                        bevelEnabled: false,
                    },
                );
                this.coreGeometry2.vertices[5].z = p1.z;
                this.coreGeometry2.vertices[6].z = geometry2Vertices[8].z;
                this.coreGeometry2.vertices[7].z = this.coreGeometry2.vertices[6].z;
                this.coreGeometry2.vertices[8].z = p2.z;
                this.coreGeometry2.vertices[9].z = p2.z;

                // storing new face path
                this.faceInfo.push(this.coreGeometry2.vertices[5], this.coreGeometry2.vertices[6], this.coreGeometry2.vertices[7], this.coreGeometry2.vertices[8], this.coreGeometry2.vertices[9]);

                const coreShape33 = new THREE.Shape(geometry3Vertices1);
                this.coreGeometry3 = new THREE.ExtrudeGeometry(
                    coreShape33,
                    {
                        depth: this.moduleDimensions.moduleDepth,
                        bevelEnabled: false,
                    },
                );

                this.coreGeometry3.vertices[4].z = this.coreGeometry2.vertices[6].z;
                this.coreGeometry3.vertices[5].z = this.coreGeometry1.vertices[9].z;
                this.coreGeometry3.vertices[6].z = p1.z;
                this.coreGeometry3.vertices[7].z = p3.z;

                // storing new face path
                this.faceInfo.push(this.coreGeometry3.vertices[4], this.coreGeometry3.vertices[5], this.coreGeometry3.vertices[6], this.coreGeometry3.vertices[7]);
            }
            // for(let i =0; i<14;i++){
            //     this.faceInfo[i].z+= this.coreHeight-this.getParent().getParent().coreHeight;
            // }
        }
    }

    getFoldface() {
        return (this.FoldFace);
    }

    setFoldface(point) {
        this.point = point;
        this.onSelect();
    }

    createFace() {
        const op = this.outlinePoints;
        this.addChild(new SmartroofFace(this.stage, [op[0].getPosition(), op[1].getPosition(), op[2].getPosition(), this.pitchPoint.clone()], [0, 1], this.tilt));
        this.addChild(new SmartroofFace(this.stage, [this.pitchPoint.clone(), op[2].getPosition(), op[3].getPosition(), op[4].getPosition()], [3, 4], this.tilt));
        this.addChild(new SmartroofFace(this.stage, [op[0].getPosition(), this.pitchPoint.clone(), op[4].getPosition()], [4, 0], this.tilt));
    }
    moveObject(deltaX, deltaY, deltaZ = 0) {
        
        // this.test.model.outerEdgesObject
        console.log('this.test.model.outerEdgesObject: ', this.test.model.outerEdgesObject);
        // update base height
        this.baseHeight += deltaZ;
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.children.forEach(edge => {
            edge.geometry.translate(deltaX, deltaY, deltaZ);
        });
        this.setbackOutsideMesh.geometry.translate(deltaX, deltaY, deltaZ);
        if (this.point) {
            this.point.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        // this.outlinePoints = this.get3DVertices();

        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            this.outlinePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }
        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);
        this.polygonMeasurement.update();
        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject(deltaX, deltaY, deltaZ);
        }
        this.saveState();
    }

    updateWhilePlacing(placingInformation) {
        if (placingInformation.parent instanceof SmartroofFace && (placingInformation.parent.getParent() !== this) && (placingInformation.parent.azimuth !== this.azimuth)) {
            const centroidPoint = this.getPosition();
            const rotationPoint = this.outlinePoints[2].getPosition();
            const angleToRotate = this.azimuth - placingInformation.parent.azimuth;
            // if (angleToRotate < 0) {
            //     angleToRotate += 360;
            // }
            const angleInRad = THREE.MathUtils.degToRad(angleToRotate);
            if (this.point) {
                const foldPointX = this.point.getPosition().x;
                const foldPointY = this.point.getPosition().y;
                const foldDeltaXY = utils.rotationAroundPoint(
                    rotationPoint.x,
                    rotationPoint.y,
                    foldPointX,
                    foldPointY,
                    angleInRad,
                );
                this.point.moveObjectWithoutConsequences(
                    foldDeltaXY[0] - foldPointX,
                    foldDeltaXY[1] - foldPointY,
                );
            }
            // this.updateGeometry();

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
            // for (let i = 0; i < this.test.model.outlinePoints.length; i++) {
            //     const outlinePointX = this.test.model.outlinePoints[i].getPosition().x;
            //     const outlinePointY = this.test.model.outlinePoints[i].getPosition().y;
            //     const outlineDeltaXY = utils.rotationAroundPoint(
            //         rotationPoint.x,
            //         rotationPoint.y,
            //         outlinePointX,
            //         outlinePointY,
            //         angleInRad,
            //     );
            //     this.test.model.outlinePoints[i].moveObjectWithoutConsequences(
            //         outlineDeltaXY[0] - outlinePointX,
            //         outlineDeltaXY[1] - outlinePointY,
            //     );
            // }

            this.azimuth = placingInformation.parent.azimuth;
            const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[3].setMovementRestrictionVector(normalVector);
            this.updateGeometry(true,  false, true);
            this.foldCalculations(false);
            const children = this.getChildren();
            for (let i = 0, l = children.length; i < l; i += 1) {
                const grandChildren = [...children[i].getChildren()];
                for (let j = 0, k = grandChildren.length; j < k; j++) {
                    if (grandChildren[j] instanceof Subarray) {
                        // console.log('yea yea')
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

    updateFacePoints() {
        const children = this.getChildren();
        const gg = this.faceInfo;
        for (let i = 0, len = children.length; i < len; i += 1) {
            // if fold exists updating the face path
            if (this.verticalFold) {
                if (children[i] instanceof SmartroofFace) {
                    if (children[i].edge[0] === 0 && children[i].edge[1] === 1) {
                        children[i].updateOutlinePoints([gg[0], gg[1], gg[2], gg[3], gg[4]]);
                        children[i].tilt = this.tilt;
                    }
                    if (children[i].edge[0] === 3 && children[i].edge[1] === 4) {
                        children[i].updateOutlinePoints([gg[5], gg[6], gg[7], gg[8], gg[9]]);
                        children[i].tilt = this.tilt;
                    }
                    if (children[i].edge[0] === 4 && children[i].edge[1] === 0) {
                        children[i].updateOutlinePoints([gg[10], gg[11], gg[12], gg[13]]);
                        children[i].tilt = this.tilt;
                    }
                }
            }
            else if (children[i] instanceof SmartroofFace) {
                if (children[i].edge[0] === 0 && children[i].edge[1] === 1) {
                    children[i].updateOutlinePoints([gg[0], gg[1], gg[2], gg[3]]);
                    children[i].tilt = this.tilt;
                }
                if (children[i].edge[0] === 3 && children[i].edge[1] === 4) {
                    children[i].updateOutlinePoints([gg[4], gg[5], gg[6], gg[7]]);
                    children[i].tilt = this.tilt;
                }
                if (children[i].edge[0] === 4 && children[i].edge[1] === 0) {
                    children[i].updateOutlinePoints([gg[8], gg[9], gg[10]]);
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

    updateOutlinePoints(currTilt, newTilt) {
        const t1 = this.outlinePoints[0].getPosition();
        t1.z = 0;
        const t2 = new THREE.Vector3();
        t2.x = (this.outlinePoints[0].getPosition().x + this.outlinePoints[4].getPosition().x) / 2;
        t2.y = (this.outlinePoints[0].getPosition().y + this.outlinePoints[4].getPosition().y) / 2;
        t2.z = 0;
        const b = Math.abs(t2.sub(t1).length());
        const heightDiff = (Math.tan(utils.deg2Rad(newTilt)) - Math.tan(utils.deg2Rad(currTilt))) * b;
        let lp1 = this.outlinePoints[0].getPosition();
        let lp2 = this.outlinePoints[1].getPosition();
        const line1 = [[lp1.x, lp1.y, lp1.z + heightDiff], [lp2.x, lp2.y, lp2.z + heightDiff]];
        const plane = this.getParent().getFacePlaneEq();

        let res = this.getLinePlaneIntersection(plane, line1);
        this.outlinePoints[1].moveObjectWithoutConsequences(lp2.x - res.x, lp2.y - res.y, lp2.z - res.z);
        this.outlinePoints[0].moveObjectWithoutConsequences(0, 0, lp1.z - res.z);

        lp1 = this.outlinePoints[4].getPosition();
        lp2 = this.outlinePoints[3].getPosition();
        const line2 = [[lp1.x, lp1.y, lp1.z + heightDiff], [lp2.x, lp2.y, lp2.z + heightDiff]];

        res = this.getLinePlaneIntersection(plane, line2);
        this.outlinePoints[3].moveObjectWithoutConsequences(lp2.x - res.x, lp2.y - res.y, lp2.z - res.z);
        this.outlinePoints[4].moveObjectWithoutConsequences(0, 0, lp1.z - res.z);

        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setDormerOutOfGroundRemoved();
            }
            else if (error.message === COMPLEX_GEOMETRY_ERROR) {
                this.stage.eventManager.setComplexDormerRemoved();
            }
            else if (error.message === DORMER_INVALID_PARENT_ERROR) {
                this.stage.eventManager.dormerRemoved();
            }

            this.removeObject();
            return Promise.reject(error);
        }
    }

    getPitchPoint() {
        // if(this.faceInfo.length){
        //     if(this.verticalFold){
        //         const edge_0_1 = this.faceInfo[3].sub(this.faceInfo[4]).normalize();
        //         const edge_0_4 = this.faceInfo[6].sub(this.faceInfo[4]).normalize();
        //         const edge_4_0 = this.faceInfo[4].sub(this.faceInfo[6]).normalize();
        //         const edge_4_3 = this.faceInfo[7].sub(this.faceInfo[6]).normalize();

        //         const midEdge1 = [this.faceInfo[4], this.faceInfo[4].add(edge_0_1.add(edge_0_4).normalize())];
        //         const midEdge2 = [this.faceInfo[6], this.faceInfo[6].add(edge_4_3.add(edge_4_0).normalize())];

        //         const resultPoint = utils.checkLineIntersection(midEdge1, midEdge2);
        //         return new THREE.Vector2( resultPoint.x, resultPoint.y );
        //     }else{
        //         const edge_0_1 = this.outlinePoints[1].getPosition().sub(this.outlinePoints[0].getPosition()).normalize();
        //         const edge_0_4 = this.outlinePoints[4].getPosition().sub(this.outlinePoints[0].getPosition()).normalize();
        //         const edge_4_0 = this.outlinePoints[0].getPosition().sub(this.outlinePoints[4].getPosition()).normalize();
        //         const edge_4_3 = this.outlinePoints[3].getPosition().sub(this.outlinePoints[4].getPosition()).normalize();

        //         const midEdge1 = [this.outlinePoints[0].getPosition(), this.outlinePoints[0].getPosition().add(edge_0_1.add(edge_0_4).normalize())];
        //         const midEdge2 = [this.outlinePoints[4].getPosition(), this.outlinePoints[4].getPosition().add(edge_4_3.add(edge_4_0).normalize())];

        //         const resultPoint = utils.checkLineIntersection(midEdge1, midEdge2);
        //         return new THREE.Vector2( resultPoint.x, resultPoint.y );
        //     }
        // }
        const edge_0_1 = this.outlinePoints[1].getPosition().sub(this.outlinePoints[0].getPosition()).normalize();
        const edge_0_4 = this.outlinePoints[4].getPosition().sub(this.outlinePoints[0].getPosition()).normalize();
        const edge_4_0 = this.outlinePoints[0].getPosition().sub(this.outlinePoints[4].getPosition()).normalize();
        const edge_4_3 = this.outlinePoints[3].getPosition().sub(this.outlinePoints[4].getPosition()).normalize();

        const midEdge1 = [this.outlinePoints[0].getPosition(), this.outlinePoints[0].getPosition().add(edge_0_1.add(edge_0_4).normalize())];
        const midEdge2 = [this.outlinePoints[4].getPosition(), this.outlinePoints[4].getPosition().add(edge_4_3.add(edge_4_0).normalize())];

        const resultPoint = utils.checkLineIntersection(midEdge1, midEdge2);
        return new THREE.Vector2(resultPoint.x, resultPoint.y);
    }

    getPitch() {
        if (this.faceInfo.length) {
            if (this.verticalFold) {
                const deltaZ = Math.abs(this.faceInfo[10].z - this.pitchPoint.z);
                const midPoint = new THREE.Vector3();
                midPoint.x = (this.faceInfo[10].x + this.faceInfo[11].x) / 2;
                midPoint.y = (this.faceInfo[10].y + this.faceInfo[11].y) / 2;
                midPoint.z = this.pitchPoint.z;
                const deltaV = midPoint.clone().sub(this.faceInfo[10]).length();
                return utils.rad2Deg(Math.asin(deltaZ / deltaV));
            }


            const deltaZ = Math.abs(this.faceInfo[9].z - this.pitchPoint.z);
            const midPoint = new THREE.Vector3();
            midPoint.x = (this.faceInfo[9].x + this.faceInfo[10].x) / 2;
            midPoint.y = (this.faceInfo[9].y + this.faceInfo[10].y) / 2;
            midPoint.z = this.pitchPoint.z;
            const deltaV = midPoint.clone().sub(this.faceInfo[9]).length();
            return utils.rad2Deg(Math.asin(deltaZ / deltaV));
        }
    }

    getRoofMapVertices() {
        const roofVertices = [];
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
                this.outlinePoints[i].getPosition().z,
            ]);
        }
        const centrePoint = [this.pitchPoint.x, this.pitchPoint.y, this.pitchPoint.z];
        roofVertices.push(vertices[0], vertices[1], vertices[2], centrePoint, vertices[0], vertices[4], centrePoint, vertices[2], vertices[3], vertices[4]);
        return roofVertices;
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
        if (utils.checkComplexGeometry(vertices2DArray)
        || !this.checkTopVerticesConstraint()
        || this.checkDormerNormal()
        || !this.checkIfDormerRectangle()
        || !utils.inspectPointInsideVertices(this.get2DVertices(), this.getPitchPoint())
        || this.checkDormerVerticesOnGround()) {
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
                erodedVertices = utils.setbackPolygon(
                    [[vertices2DArray[2][0] - 0.01, vertices2DArray[2][1] - 0.01],
                        [vertices2DArray[2][0] + 0.01, vertices2DArray[2][1] + 0.01]],
                    -0.001,
                );
            }
            if (erodedVertices.length !== 0) {
                const allBelowModels = raycastingUtils.getAllModelsBelowVertices(
                    erodedVertices,
                    this.stage,
                    { includeObstacles: true },
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
            }
            else {
                response.errors.push(new Error(ACDB_WITH_NO_AREA_ERROR));
            }
        }
        this.test.model.parent = this.parent;
        return response;
    }

    getState() {
        const dormerData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            baseHeight: this.baseHeight,
            tilt: this.tilt,
            coreHeight: this.coreHeight,
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
            foldPoint: this.point ? this.point.getPosition() : null,
            error: this.error,
            verticalFold: this.verticalFold,
        };
        return dormerData;
    }

    loadState(state, fromState) {
        // if point exists but in the saved state it doesn't, delete the fold
        if (this.point && !state.foldPoint) {
            this.deleteVerticalFold();
        }
        // if point doesn't exists but in the saved state it does, create the fold
        else if (!this.point && state.foldPoint) {
            if (state.foldPoint) {
                this.point = new OutlinePoints(
                    state.foldPoint.x,
                    state.foldPoint.y,
                    state.foldPoint.z,
                    this,
                    this.stage,
                );
            }
        }
        // if point exists in both the saved state and current, update the fold
        else if (this.point && state.foldPoint) {
            this.point.setPosition(state.foldPoint.x, state.foldPoint.y, state.foldPoint.z);
        }
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.error = state.error;
            this.name = state.name;

            // load polygon properties
            this.baseHeight = state.baseHeight;
            this.tilt = state.tilt;
            this.coreHeight = state.coreHeight;
            this.azimuth = state.azimuth;
            this.setbackOutside = state.setbackOutside;
            this.ignored = state.ignored;
            this.verticalFold = state.verticalFold;
            this.updateVisualsAfterLoadingAndCreation();
            // console.log('xyz',state.foldPoint);
            // if(this.point && state.foldPoint){
            //     this.point = new OutlinePoints(
            //         state.foldPoint.x,
            //         state.foldPoint.y,
            //         state.foldPoint.z,
            //         this,
            //         this.stage,
            //     );
            // }

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                if (state.foldPoint) {
                    this.point = new OutlinePoints(
                        state.foldPoint.x,
                        state.foldPoint.y,
                        state.foldPoint.z,
                        this,
                        this.stage,
                    );
                }
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
                    this, this.stage, false,
                );
            }
            else if (this.outlinePoints.length === state.outlinePoints.length) {
                for (let idx = 0; idx < this.outlinePoints.length; idx += 1) {
                    this.outlinePoints[idx].setPosition(
                        state.outlinePoints[idx][0],
                        state.outlinePoints[idx][1],
                        state.outlinePoints[idx][2],
                    );
                }
            }
            else if (this.outlinePoints.length !== state.outlinePoints.length) {
                // if(this.point && state.foldPoint){
                //     this.point.setPosition(state.foldPoint.x,state.foldPoint.y,state.foldPoint.z)
                //             }
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
                    this, this.stage, false,
                );
            }
            else {
                console.error('Dormer: loadState: Error in Loading Outline Points');
                return null;
            }

            const normalVector = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
            this.outlinePoints[1].setMovementRestrictionVector(normalVector);
            this.outlinePoints[3].setMovementRestrictionVector(normalVector);
            // update geometry
            this.updateGeometry();
            // undo redo for rafters Lines
            this.getParent().getParent().updateRafter();
            this.coreMesh.geometry.computeBoundingSphere();
        }
    }

    saveObject(isCopy = false) {
        const polygonModelData = {
            type: this.type,
            children: [],
            foldPoint: this.point ? this.point.vertexMesh.geometry.vertices[0] : null,
        };
        polygonModelData.verticalFold = this.verticalFold;
        // save id and name
        polygonModelData.id = this.id;
        polygonModelData.name = this.name;
        if (isCopy) {
            polygonModelData.uuid = this.uuid;
        }
        polygonModelData.error = this.error;
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

        polygonModelData.foldPoint = this.point ? this.point.vertexMesh.geometry.vertices[0] : null;

        // saving children
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            polygonModelData.children.push(children[i].saveObject());
        }

        return polygonModelData;
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
        this.error = polygonModelData.error;
        // load fold properties
        this.verticalFold = polygonModelData.verticalFold;
        if (polygonModelData.foldPoint) {
            this.point = new OutlinePoints(
                polygonModelData.foldPoint.x,
                polygonModelData.foldPoint.y,
                polygonModelData.foldPoint.z,
                this,
                this.stage,
            );
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
            }
            else {
                console.error('PolygonModel: Invalid object type in loadObject');
            }
        }

        // update geometry
        this.updateGeometry(true, true, true);

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    static getObjectType() {
        return 'Hipped Dormer';
    }

    onSelect() {
        if (this.point) {
            this.point.showObject();
        }
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
        // add fold point to drag controls
        if (this.point) {
            this.stage.dragControls.add(
                this.point,
                this.point.moveObject.bind(this.point),
                this.point.placeObject.bind(this.point),
                this.point.handleDragStart.bind(this.point),
            );
        }

        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                if (i == 2) {
                    continue;
                }
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
        if (this.point) {
            this.point.isSelected = true;
        }
        this.showSetback();
    }
    initDormerPlacingModex(x,y) {
        console.log('this.test.model: ', this.test.model);
        this.test.model.stage.stateManager.startContainer();

        this.test.model.stage.placeManager.initialize(
            this.test.model,
            this.test.model.placeObject.bind(this.test.model),
            
            this.test.model.onCancel.bind(this.test.model),
            x,
            y, { moveWithOffset: true },
        );

        this.test.model.stage.selectionControls.setSelectedObject(this.test.model);
    }
    initDormerPlacingMode() {

        // this.stage.stateManager.startContainer();
        // this.createFace();
        const vertices2DArray = this.getDefault2DVertices();
        let offsetVector = new THREE.Vector2(vertices2DArray[2][0], vertices2DArray[2][1], 0);
        offsetVector.subVectors(this.getPosition(), offsetVector);
        this.initDormerPlacingModex(offsetVector.x,offsetVector.y)

        // this.stage.placeManager.initialize(
        //     this,
        //     this.onComplete.bind(this),
        //     this.onCancel.bind(this),
        //     offsetVector.x,
        //     offsetVector.y, { moveWithOffset: true },
        // );

        // this.stage.selectionControls.setSelectedObject(this);

    }
    
    deSelect() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            this.outlinePoints[i].hideObject();
        }
        if (this.point) {
            this.point.hideObject();
        }
        // hide measurements
        this.polygonMeasurement.hide();
        if (this.point) {
            this.point.isSelected = false;
        }
        this.isSelected = false;
        this.hideSetback();
    }
    handleVertexMove(vertex, deltaX = 0, deltaY = 0, deltaZ = 0) {
        // console.log('vertex',vertex);
        if (this.point) {
            if (this.outlinePoints.indexOf(vertex) < 0 && vertex.vertexMesh.uuid != this.point.vertexMesh.uuid) {
                console.error('ERROR: DORMER: vertex not in outlinePoints in handleVertexMove');
            }
        }
        const displacementVector = new THREE.Vector3(deltaX, deltaY, 0);

        const normal = new THREE.Vector3(Math.sin(utils.deg2Rad(this.azimuth)), Math.cos(utils.deg2Rad(this.azimuth)), 0);
        // normal.addVectors( this.outlinePoints[4].getPosition() , this.outlinePoints[0].getPosition() );
        // normal.divideScalar(2);
        // normal.sub(this.outlinePoints[2].getPosition());
        // normal.z = 0;
        const theta1 = -Math.atan2(displacementVector.y, displacementVector.x) + Math.atan2(normal.y, normal.x);
        normal.normalize();
        const reflectiveV = this.getReflectiveVector(displacementVector, normal);

        const headVector = new THREE.Vector3();
        if (this.outlinePoints.indexOf(vertex) == 0) {
            headVector.subVectors(this.outlinePoints[1].getPosition(), this.outlinePoints[2].getPosition());
        }
        else if (this.outlinePoints.indexOf(vertex) == 4) {
            headVector.subVectors(this.outlinePoints[3].getPosition(), this.outlinePoints[2].getPosition());
        }
        headVector.z = 0;
        headVector.normalize();

        const temp = displacementVector.length();

        const dvx = new THREE.Vector3(Math.cos(utils.deg2Rad(this.azimuth)), Math.sin(utils.deg2Rad(this.azimuth)), 0);
        // dvx.subVectors( this.outlinePoints[0].getPosition(), this.outlinePoints[4].getPosition() );
        // dvx.z = 0;
        dvx.normalize();
        const theta2 = dvx.angleTo(headVector);
        dvx.multiplyScalar(temp);
        const final = dvx.clone();

        const movementVector1 = final.multiplyScalar(Math.sin(theta1)).add(normal.clone().multiplyScalar(final.length() * Math.sin(theta1) * Math.tan(theta2)));
        // const movementVector1 = displacementVector.clone();
        // movementVector1.projectOnVector(headVector);
        const movementVector2 = this.getReflectiveVector(movementVector1, normal);

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
            this.outlinePoints[1].setPosition(result.x, result.y, this.outlinePoints[1].getPosition().z);
            this.outlinePoints[3].setPosition(result2.x, result2.y, this.outlinePoints[3].getPosition().z);
        }
        // bottom-right vertex
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
            this.outlinePoints[1].setPosition(result.x, result.y, this.outlinePoints[1].getPosition().z);
            this.outlinePoints[3].setPosition(result2.x, result2.y, this.outlinePoints[3].getPosition().z);
        }
        // top-left vertex
        else if (this.outlinePoints.indexOf(vertex) == 1) {
            this.outlinePoints[3].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }
        // top-right vertex
        else if (this.outlinePoints.indexOf(vertex) == 3) {
            this.outlinePoints[1].moveObjectWithoutConsequences(reflectiveV.x, reflectiveV.y, deltaZ);
        }
        this.polygonMeasurement.update();
        this.updateGeometry();
        this.saveState();
    }
    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0 && vertex.vertexMesh.uuid != this.point.vertexMesh.uuid) {
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

            // remove subarrays
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

            this.stage.eventManager.completeDormerLoading(notificationObject);

            this.saveState();

            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: DORMER: handleVertexPlace failed', error);

            this.stage.eventManager.completeDormerLoading(notificationObject);

            return Promise.reject(error);
        }
    }
}

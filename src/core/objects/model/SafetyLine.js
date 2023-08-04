import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import Walkway from './Walkway';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
    MATERIAL_STATES,
    WALKWAY_2D_LINE_WIDTH,
    LINE_WIDTH,
} from '../visualConstants';
import { rotationAroundPoint } from '../../utils/utils';

const safetyLineHeight = 0.2; // 20cm above ground
const safetyLineRadius = 0.02;
const baseCylinderRadius = 0.075;
const baseCylinderHeight = 0.18;
const baseCylinderDistance = 2;
const baseCylinderColor = 0xc0c0c0;
const safetyLineColor = 0x808080;
export default class SafetyLine extends Walkway {
    constructor(stage) {
        super(stage);
        this.name = `SafetyLine #${this.id.toString()}`;

        // materials
        this._meshMaterial2D = new THREE.MeshBasicMaterial({
            color: COLOR_MAPPINGS
                .SAFETY_LINE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: WALKWAY_2D_LINE_WIDTH,
            color: COLOR_MAPPINGS
                .SAFETY_LINE[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this._meshMaterial3D = new THREE.MeshLambertMaterial({
            color: COLOR_MAPPINGS
                .SAFETY_LINE[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .MESH_COLOR,
        });
        this._meshMaterial3D.defines = this._meshMaterial3D.defines || {};
        this._meshMaterial3D.defines.CUSTOM = '';
        this._edgeMaterial3D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .SAFETY_LINE[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this.merged3d = null;
        this.objectGroupFor3D = new THREE.Group();
    }
    getInitiatingId() {
        return this.stage.getSafetyLineId();
    }

    saveObject(isCopy = false) {
        const walkwayData = {
            type: SafetyLine.getObjectType(),
            id: this.id,
            name: this.name,
            coreHeight: this.coreHeight,
            width: this.width,
            walkwayDirection: this.walkwayDirection,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            walkwayData.uuid = this.uuid;
        }
        return walkwayData;
    }

    exportAsSTL() {
        return [{
            mesh: this.coreMesh,
            name: this.name,
        }];
    }

    exportAsCollada() {
        const mesh = this.coreMesh.clone();
        mesh.material = new THREE.MeshLambertMaterial({
            color:
                COLOR_MAPPINGS.WALKWAY[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                    .MESH_COLOR,
            transparent: true,
            opacity: 0.6,
        });
        mesh.name = this.name;
        return {
            model: mesh,
            subarray: [],
        };
    }

    // event manager functions

    setObjectCreating() {
        return this.stage.eventManager.setSafetyLineCreating();
    }

    completeObjectCreation(notificationObject) {
        this.stage.eventManager.completeSafetyLineCreation(notificationObject);
    }

    errorObjectCreation(notificationObject) {
        this.stage.eventManager.errorSafetyLineCreation(notificationObject);
    }

    setObjectLoading() {
        return this.stage.eventManager.setSafetyLineLoading();
    }

    completeObjectLoading(notificationObject) {
        this.stage.eventManager.completeSafetyLineLoading(notificationObject);
    }

    updateGeometry() {
        super.updateGeometry();
        this.update3DSafetyLine();
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        super.moveObject(deltaX, deltaY, deltaZ);
        // TODO: move the mesh of cylinders instead of jugad.
        // for (let i = 0, l = this.objectGroupFor3D.children.length; i < l; i += 1) {
        //     this.objectGroupFor3D.children[i].geometry.translate(deltaX, deltaY, deltaZ);
        // }
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = rotationAroundPoint(
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

    update3DSafetyLine() {
        // remove old meshes
        while (this.objectGroupFor3D.children.length > 0) {
            this.objectGroupFor3D.remove(this.objectGroupFor3D.children[0]);
        }
        const vertices = this.get3DVertices();
        // 01 cross 03
        const v1 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[1][0], vertices[1][1], vertices[1][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        const v2 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[3][0], vertices[3][1], vertices[3][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        v1.cross(v2);
        v1.normalize(); // v1 is the normal unit vector to the parent surface.
        const multiplier = v1.z > 0 ? 1 : -1;

        const leftCenterPoint = new THREE.Vector3(
            (vertices[0][0] + vertices[3][0]) / 2,
            (vertices[0][1] + vertices[3][1]) / 2,
            ((vertices[0][2] + vertices[3][2]) / 2) - this.coreHeight,
            // - core height of safety line.
        );
        const rightCenterPoint = new THREE.Vector3(
            (vertices[1][0] + vertices[2][0]) / 2,
            (vertices[1][1] + vertices[2][1]) / 2,
            ((vertices[1][2] + vertices[2][2]) / 2) - this.coreHeight,
            // - core height of safety line.
        );

        const safetyLineLength = leftCenterPoint.distanceTo(rightCenterPoint);
        const baseCylindersPoints = [];
        let lerpFactor = baseCylinderRadius / safetyLineLength;
        const lerpFactorIncrement = baseCylinderDistance / safetyLineLength;
        while (lerpFactor < 1 - (baseCylinderRadius / safetyLineLength)) {
            const basePoint =
                new THREE.Vector3().lerpVectors(leftCenterPoint, rightCenterPoint, lerpFactor);
            const upPoint = basePoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
            baseCylindersPoints.push({
                basePoint,
                upPoint,
            });
            lerpFactor += lerpFactorIncrement;
        }
        // setting up the last base cylinder
        const basePoint = new THREE.Vector3().lerpVectors(
            leftCenterPoint, rightCenterPoint,
            1 - (baseCylinderRadius / safetyLineLength),
        );
        const upPoint = basePoint.clone().addScaledVector(v1, multiplier * baseCylinderHeight);
        baseCylindersPoints.push({
            basePoint,
            upPoint,
        });

        const safetyLineCylinderPoints = {
            basePoint: leftCenterPoint.clone().addScaledVector(v1, multiplier * safetyLineHeight),
            upPoint: rightCenterPoint.clone().addScaledVector(v1, multiplier * safetyLineHeight),
        };

        let geometries = [];
        for (let i = 0, l = baseCylindersPoints.length; i < l; i += 1) {
            geometries.push(...this.createBaseCylinderMesh( 
                baseCylindersPoints[i].basePoint,
                baseCylindersPoints[i].upPoint,
                baseCylinderRadius,
            ));
        }
        geometries.push(...this.createHorizontalCylinderMesh(
            safetyLineCylinderPoints.basePoint,
            safetyLineCylinderPoints.upPoint,
            safetyLineRadius,
        ));

        const material = new THREE.MeshLambertMaterial({ color: baseCylinderColor    });

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

        const lineSegmentsMesh = new THREE.LineSegments(mergedGeometry, this._edgeMaterial3D);
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        this.merged3d = mergedMesh;
        this.objectGroupFor3D.add(lineSegmentsMesh);
        this.objectGroupFor3D.add(mergedMesh);


    }

    createBaseCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 8);
        geometry.rotateX(1.57);
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry];
    }


    createHorizontalCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const direction = new THREE.Vector3();
        direction.subVectors(endpoint2, endpoint1).normalize();
        const geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 8);
        const yAxis = new THREE.Vector3(0, 1, 0);
        yAxis.normalize();
        let rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(direction,yAxis);
        rotationAxis.normalize();
        let theta=-Math.acos(direction.dot(yAxis));
        let rotMatrix=new THREE.Matrix4();
        rotMatrix.makeRotationAxis(rotationAxis, theta);
        geometry.applyMatrix4(rotMatrix);
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry];
    }



    
    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        if (this.stage.visualManager.getIn3D() && !this.stage.sldView) {
            this.switchTo3D();
        }
        else {
            this.switchTo2D();
        }
    }

    switchTo3D() {
        this.objectsGroup.remove(this.coreMesh);
        this.objectsGroup.remove(this.coreEdges);
        this.objectsGroup.add(this.objectGroupFor3D);
    }

    switchTo2D() {
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);
        this.objectsGroup.remove(this.objectGroupFor3D);
    }

    getDefaultValues() {
        return {
            coreHeight: 0.5,
            width: 0.2,
        }
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.SAFETY_LINE;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    get mesh3D(){
        return this.merged3d;
    }
    
    static getObjectType() {
        return 'SafetyLine';
    }
}
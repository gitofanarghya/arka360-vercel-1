import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { getEdgeMaterial, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth } from '../utils/mathUtils';
import { deg2Rad } from '../../utils/utils';
// import { STLLoader } from '../../lib/STLLoader';
import { BLOCK_UTILS_CYLINDER_SEGMENTS } from '../../coreConstants';
import { BLOCK_UTILS } from '../constants';

export function computeBlocks(params) {
    const {
        railingLines,
        numberOfLinesCombined,
        subarrayParent,
        subarrayDetails,
        blockBuffer,
        drawLastBlock,
    } = params;

    const blockPosition = [];


    for (let i = 0; i < railingLines.length; i += 1) {
        const initialPoint = railingLines[i][0].clone();
        const finalPoint = railingLines[i][1].clone();

        initialPoint.z = subarrayParent.getZOnTopSurface(
            initialPoint.x,
            initialPoint.y,
        );
        finalPoint.z = subarrayParent.getZOnTopSurface(
            finalPoint.x,
            finalPoint.y,
        );

        const verticalEnd = (blockBuffer.VERTICAL_END) ? blockBuffer.VERTICAL_END : 0;
        initialPoint.lerp(
            finalPoint,
            verticalEnd / initialPoint.distanceTo(finalPoint),
        );

        blockPosition.push(initialPoint);
        if (drawLastBlock !== false) {
            blockPosition.push(finalPoint);
        }

        const numberOfBlocks = numberOfLinesCombined[i] - 1;

        // TODO:
        let percentageDistance;
        if (blockBuffer.UP) {
            percentageDistance = (subarrayDetails.rowSpacing +
                (Math.cos(deg2Rad(subarrayDetails.tilt)) *
                subarrayDetails.moduleVerticalLength)) / initialPoint.distanceTo(finalPoint);
        }
        else {
            percentageDistance = (1 + (verticalEnd / initialPoint.distanceTo(finalPoint))) /
                (numberOfBlocks + 1);
        }

        for (let j = 0; j < numberOfBlocks; j += 1) {
            blockPosition.push(initialPoint.clone().lerp(finalPoint, percentageDistance * (j + 1)));
        }
    }
    return {
        blockPosition,
    };
}

export async function drawBlocks(params, objectsGroup, templateName) {
    const blockMaterial = getMeshMaterial(params.blockStyle.COLOR, params.blockStyle.URL);
    // TODO: Rename
    let blockGeometry;
    const allGeometries = [];

    if (params.blockStyle.MODEL_URL) {
        const loader = new STLLoader();
        blockGeometry = await new Promise((r) => {
            loader.load(params.blockStyle.MODEL_URL, (geometry) => {
                r(geometry);
            }, () => { }, event => console.log(event));
        });
    }
    else if (params.blockSize.RADIUS) {
        blockGeometry = new THREE.CylinderGeometry(
            params.blockSize.RADIUS,
            params.blockSize.RADIUS,
            params.blockSize.HEIGHT,
            BLOCK_UTILS_CYLINDER_SEGMENTS,
            // CYLINDER_SEGMENTS,
        );
        blockGeometry.rotateX(Math.PI / 2);
    }
    else {
        blockGeometry = new THREE.BoxGeometry(
            params.blockSize.LENGTH,
            params.blockSize.WIDTH,
            params.blockSize.HEIGHT - params.drawingBuffer,
        );
    }
    const angle = deg2Rad(findAdjustedAzimuth(params.azimuth));
    if (params.templateName === 'UNIRAC RM 10') {
        for (let i = 0; i < params.blockPosition.length; i += 1) {
            const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
            blockMesh.position.set(
                params.blockPosition[i].x - (0.04 * Math.sin(deg2Rad(params.azimuth))),
                params.blockPosition[i].y - (0.03 * Math.cos(deg2Rad(params.azimuth))),
                params.blockPosition[i].z + (params.blockSize.HEIGHT / 2) + 0.15,
            );
            blockMesh.receiveShadow = true;
            blockMesh.castShadow = true;

            blockMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
            blockMesh.rotateX(Math.PI / 2);
            blockMesh.scale.set(0.015, 0.029, 0.027);
            blockMesh.updateMatrix();

            allGeometries.push(blockMesh.geometry.clone().applyMatrix4(blockMesh.matrix));
        }
    }
    else if (params.templateName === 'UNIRAC RM 5') {
        for (let i = 0; i < params.blockPosition.length; i += 1) {
            const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
            blockMesh.position.set(
                params.blockPosition[i].x - (0.04 * Math.sin(deg2Rad(params.azimuth))),
                params.blockPosition[i].y - (0.02 * Math.cos(deg2Rad(params.azimuth))),
                params.blockPosition[i].z + (params.blockSize.HEIGHT / 2) + 0.11,
            );
            blockMesh.receiveShadow = true;
            blockMesh.castShadow = true;

            blockMesh.scale.set(0.015, 0.019, 0.016);
            blockMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
            blockMesh.rotateX((Math.PI / 2) + 0.13);
            blockMesh.updateMatrix();

            allGeometries.push(blockMesh.geometry.clone().applyMatrix4(blockMesh.matrix));
        }
    }
    else {
        for (let i = 0; i < params.blockPosition.length; i += 1) {
            const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
            blockMesh.position.set(
                params.blockPosition[i].x,
                params.blockPosition[i].y,
                params.blockPosition[i].z + (params.blockSize.HEIGHT / 2),
            );
            blockMesh.receiveShadow = true;
            blockMesh.castShadow = true;

            blockMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
            blockMesh.updateMatrix();

            allGeometries.push(blockMesh.geometry.clone().applyMatrix4(blockMesh.matrix));
        }
    }

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(allGeometries);

    const singleLineGeometry = new THREE.EdgesGeometry(mergedGeometry);
    const wireframe = new THREE.LineSegments(singleLineGeometry, getEdgeMaterial());
    wireframe.userData = [templateName, BLOCK_UTILS];
    objectsGroup.add(wireframe);

    const mergedMesh = new THREE.Mesh(mergedGeometry, blockMaterial);
    mergedMesh.userData = [templateName, BLOCK_UTILS];
    objectsGroup.add(mergedMesh);
}

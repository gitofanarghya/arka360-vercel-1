import * as THREE from 'three';
import {
    getEdgeMaterial,
    getMeshMaterial,
} from '../utils/drawingUtils';
import { findAdjustedAzimuth } from '../utils/mathUtils';
import { deg2Rad } from '../../utils/utils';
import { CYLINDER_SEGMENTS } from '../../coreConstants';
import { PILLAR_UTILS } from '../constants';

export function computePillars(params) {
    const {
        railingLines,
        numberOfLinesCombined,
        subarrayParent,
        subarrayDetails,
        pillarBuffer,
        pillarSize,
    } = params;

    const pillarPosition = [];

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

        const verticalEnd = (pillarBuffer.VERTICAL_END) ? pillarBuffer.VERTICAL_END : 0;
        initialPoint.lerp(
            finalPoint,
            verticalEnd / initialPoint.distanceTo(finalPoint),
        );

        pillarPosition.push(initialPoint);
        pillarPosition.push(finalPoint);

        const numberOfPillars = numberOfLinesCombined[i] - 1;

        // TODO:
        let percentageDistance;
        if (pillarBuffer.UP) {
            percentageDistance = (subarrayDetails.rowSpacing + (Math.cos(deg2Rad(subarrayDetails.tilt)) * subarrayDetails.moduleVerticalLength)) /
                initialPoint.distanceTo(finalPoint);
        }
        else {
            percentageDistance = (1 + (verticalEnd / initialPoint.distanceTo(finalPoint))) /
                (numberOfPillars + 1);
        }

        for (let j = 0; j < numberOfPillars; j += 1) {
            pillarPosition.push(initialPoint.clone().lerp(finalPoint, percentageDistance * (j + 1)));
        }
    }

    return {
        pillarPosition,
        pillarHeight: pillarSize.HEIGHT,
    };
}

export async function drawPillars(params, objectsGroup, templateName) {
    const pillarMaterial = getMeshMaterial(params.pillarStyle.COLOR, params.pillarStyle.URL);

    let pillarGeometry;

    if (params.pillarSize.RADIUS) {
        pillarGeometry = new THREE.CylinderGeometry(
            params.pillarSize.RADIUS,
            params.pillarSize.RADIUS,
            params.pillarSize.HEIGHT,
            CYLINDER_SEGMENTS,
        );
        pillarGeometry.rotateX(Math.PI / 2);
    }
    else {
        pillarGeometry = new THREE.BoxGeometry(
            params.pillarSize.LENGTH,
            params.pillarSize.WIDTH,
            params.pillarSize.HEIGHT - params.drawingBuffer,
        );
    }


    const angle = deg2Rad(findAdjustedAzimuth(params.azimuth));
    for (let i = 0; i < params.pillarPosition.length; i += 1) {
        const pillarMesh = new THREE.Mesh(pillarGeometry, pillarMaterial);
        pillarMesh.position.set(
            params.pillarPosition[i].x,
            params.pillarPosition[i].y,
            params.pillarPosition[i].z + (params.pillarSize.HEIGHT / 2),
        );
        pillarMesh.receiveShadow = true;
        pillarMesh.castShadow = true;
        pillarMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);

        pillarMesh.userData = [templateName, PILLAR_UTILS];
        objectsGroup.add(pillarMesh);
    }
}

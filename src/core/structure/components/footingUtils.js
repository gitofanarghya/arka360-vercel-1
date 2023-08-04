import * as THREE from 'three';

import { getUniformPoints, getNumberOfLegFooting, findAdjustedAzimuth } from '../utils/mathUtils';
import { getMeshMaterial } from '../utils/drawingUtils';
import { deg2Rad } from '../../utils/utils';
import { CYLINDER_SEGMENTS } from '../../coreConstants';
import { FOOTING_UTILS } from '../constants';

export function computeFootings(params) {
    let { footingCount } = params;
    const {
        numberOfTablesInBoundingBox,
        boundingBox,
        footingBuffer,
        row,
        tableSize,
        singleVerticalRow,
    } = params;

    if (footingCount === undefined || footingCount === null) {
        footingCount = getNumberOfLegFooting(numberOfTablesInBoundingBox, tableSize);
    }

    if (singleVerticalRow) {
        footingCount.up = 1;
    }

    const footingPosition = getUniformPoints(
        footingCount,
        boundingBox,
        footingBuffer,
        row.getParent().getParent(),
    );

    return {
        footingPosition,
        footingCount,
    };
}

function getFootingGeometry(footingSize, footingHeight, drawingBuffer) {
    let geom;
    if (footingSize.RADIUS) {
        geom = new THREE.CylinderGeometry(
            footingSize.RADIUS,
            footingSize.RADIUS,
            footingHeight,
            CYLINDER_SEGMENTS,
        );
        geom.rotateX(Math.PI / 2);
    }
    else {
        geom = new THREE.BoxGeometry(
            footingSize.LENGTH,
            footingSize.WIDTH,
            footingHeight - drawingBuffer,
        );
    }
    return geom;
}

export function drawFootings(params, objectsGroup, templateName) {
    const footingMaterial = getMeshMaterial(params.footingStyle.COLOR, params.footingStyle.URL);

    const generalFootingSize = (params.footingSize.GENERAL) ?
        params.footingSize.GENERAL : params.footingSize;

    // TODO: Rename
    const generalFootingGeometry = getFootingGeometry(generalFootingSize, params.footingSize.HEIGHT, params.drawingBuffer);
    const bottomFootingGeometry = (params.footingSize.BOTTOM) ?
        getFootingGeometry(params.footingSize.BOTTOM, params.footingSize.HEIGHT, params.drawingBuffer) :
        generalFootingGeometry;

    const angle = deg2Rad(findAdjustedAzimuth(params.azimuth));

    for (let i = 0; i < params.footingPosition.length; i += 1) {
        for (let j = 0; j < params.footingPosition[i].length; j += 1) {
            const footingMesh = new THREE.Mesh(
                (i === params.footingPosition.length - 1) ?
                    bottomFootingGeometry : generalFootingGeometry,
                footingMaterial,
            );
            footingMesh.position.set(
                params.footingPosition[i][j].x,
                params.footingPosition[i][j].y,
                params.footingPosition[i][j].z + (params.footingSize.HEIGHT / 2),
            );

            footingMesh.receiveShadow = true;
            footingMesh.castShadow = true;
            footingMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);

            footingMesh.userData = [templateName, FOOTING_UTILS];
            objectsGroup.add(footingMesh);
        }
    }
}

import * as THREE from 'three';

import {
    getEdgeMaterial,
    getMeshMaterial,
} from '../utils/drawingUtils';
import {
    createBox,
    findAdjustedAzimuth,
} from '../utils/mathUtils';
import { BACK_COVER } from '../constants';

export function computeBackCover(params) {
    const {
        boundingBox,
        minZ,
        row,
        legLength,
    } = params;

    const point1 = new THREE.Vector3(
        (boundingBox[0].x / 2) + (boundingBox[1].x / 2),
        (boundingBox[0].y / 2) + (boundingBox[1].y / 2),
        boundingBox[0].z,
    );

    const legLengthDisplacementPercentage =
        legLength / (2 * boundingBox[0].distanceTo(boundingBox[3]));
    point1.lerp(
        new THREE.Vector3(
            (boundingBox[2].x + boundingBox[3].x) / 2,
            (boundingBox[2].y + boundingBox[3].y) / 2,
            boundingBox[2].z,
        ),
        -legLengthDisplacementPercentage,
    );

    const point2 = point1.clone();
    point2.z = row.getParent().getParent().getZOnTopSurface(point2.x, point2.y) + minZ;

    return {
        backCoverLine: [point1, point2],
        backCoverLength: boundingBox[0].distanceTo(boundingBox[1]),
    };
}


export function drawBackCover(params, objectsGroup, templateName) {
    const backCoverMaterial =
        getMeshMaterial(params.backCoverStyle.COLOR, params.backCoverStyle.URL);

    let angle = findAdjustedAzimuth(params.azimuth);
    angle = angle > 360 ? angle - 360 : angle;

    const box = createBox(
        params.backCoverLine[0],
        params.backCoverLine[1],
        params.backCoverSize.THICKNESS,
        params.backCoverLength,
        backCoverMaterial,
        0,
        90,
        angle,
    );

    box.userData = [templateName, BACK_COVER];
    objectsGroup.add(box);
}

import * as THREE from 'three';
import {
    getUniformPoints,
    getZOnPlane,
    findEquationOfPlane,
    findAdjustedAzimuth,
    createBox,
} from '../utils/mathUtils';
import { deg2Rad } from '../../utils/utils';
import { getMeshMaterial } from '../utils/drawingUtils';
import { CLIP_UTILS } from '../constants';

function getTopCuboidLines(
    initialPoints,
    finalPoints,
    topCuboidLength,
    topCuboidHeight,
    sideCuboidLength,
    planeNormal,
) {
    const lines = [];

    for (let i = 0; i < initialPoints.length; i += 1) {
        const point1 = initialPoints[i].clone().lerp(
            finalPoints[i],
            -sideCuboidLength / initialPoints[i].distanceTo(finalPoints[i]),
        );
        const point2 = initialPoints[i].clone().lerp(
            finalPoints[i],
            (topCuboidLength - sideCuboidLength) / initialPoints[i].distanceTo(finalPoints[i]),
        );

        const perpendicularPoint1 = point1.clone().add(planeNormal);
        const perpendicularPoint2 = point2.clone().add(planeNormal);

        point1.lerp(perpendicularPoint1, -topCuboidHeight /
            (2 * point1.distanceTo(perpendicularPoint1)));
        point2.lerp(perpendicularPoint2, -topCuboidHeight /
            (2 * point2.distanceTo(perpendicularPoint2)));

        lines.push([
            point1,
            point2,
        ]);
    }

    return lines;
}

function getSideCuboidLines(
    initialPoints,
    finalPoints,
    sideCuboidLength,
    sideCuboidHeight,
    planeNormal,
) {
    const lines = [];

    for (let i = 0; i < initialPoints.length; i += 1) {
        const point1 = initialPoints[i].clone().lerp(
            finalPoints[i],
            -sideCuboidLength / (2 * finalPoints[i].distanceTo(initialPoints[i])),
        );
        const perpendicularPoint1 = point1.clone().add(planeNormal);
        const point2 = point1.clone().lerp(
            perpendicularPoint1,
            sideCuboidHeight / point1.distanceTo(perpendicularPoint1),
        );

        lines.push([point1, point2]);
    }

    return lines;
}

function createCuboids(
    initialClipPosition,
    finalClipPosition,
    planeEquation,
    clipSize,
    sideCuboidHeight,
) {
    const topCuboids = [];
    const sideCuboids = [];

    topCuboids.push(...getTopCuboidLines(
        finalClipPosition,
        initialClipPosition,
        clipSize.TOP_CUBOID.LENGTH,
        clipSize.TOP_CUBOID.HEIGHT,
        clipSize.SIDE_CUBOID.LENGTH,
        new THREE.Vector3(planeEquation[0], planeEquation[1], planeEquation[2]),
    ));
    sideCuboids.push(...getSideCuboidLines(
        finalClipPosition,
        initialClipPosition,
        clipSize.SIDE_CUBOID.LENGTH,
        sideCuboidHeight,
        new THREE.Vector3(planeEquation[0], planeEquation[1], planeEquation[2]),
    ));

    return {
        topCuboids,
        sideCuboids,
    };
}

export function computeClips(params) {
    const { boundingBox, buffer, clipCount } = params;

    const clipPosition = getUniformPoints(
        clipCount,
        boundingBox,
        buffer,
        params.row.getParent().getParent(),
        0,
        0,
    );

    const topCuboids = [];
    const sideCuboids = [];

    const planeEquation = findEquationOfPlane(
        boundingBox[0],
        boundingBox[1],
        boundingBox[2],
    );

    for (let j = 0; j < clipPosition.length; j += 1) {
        for (let i = 0; i < clipPosition[j].length; i += 1) {
            clipPosition[j][i].z = getZOnPlane(
                planeEquation,
                clipPosition[j][i].x,
                clipPosition[j][i].y,
            );
        }
    }

    const topClips = createCuboids(
        clipPosition[0],
        clipPosition[1],
        planeEquation,
        params.clipSize,
        Math.max(
            params.clipSize.SIDE_CUBOID.MINIMUM_HEIGHT,
            (params.mountHeight / Math.sin(deg2Rad(90 - params.tilt))) - params.minZ,
        ),
    );
    topCuboids.push(...topClips.topCuboids);
    sideCuboids.push(...topClips.sideCuboids);

    const bottomClips = createCuboids(
        clipPosition[1],
        clipPosition[0],
        planeEquation,
        params.clipSize,
        params.clipSize.SIDE_CUBOID.MINIMUM_HEIGHT,
    );
    topCuboids.push(...bottomClips.topCuboids);
    sideCuboids.push(...bottomClips.sideCuboids);

    return { clipLines: { topCuboids, sideCuboids } };
}

export function drawClips(params, objectsGroup, templateName) {
    const clipMaterial = getMeshMaterial(params.clipStyle.COLOR, params.clipStyle.URL);

    let angle = 90 + findAdjustedAzimuth(params.azimuth);
    angle = angle > 360 ? angle - 360 : angle;

    for (let lineIndex = 0; lineIndex < params.clipLines.topCuboids.length; lineIndex += 1) {
        const line = params.clipLines.topCuboids[lineIndex];

        const box = createBox(
            line[0],
            line[1],
            params.clipSize.TOP_CUBOID.WIDTH,
            params.clipSize.TOP_CUBOID.HEIGHT,
            clipMaterial,
            0,
            -params.tilt,
            angle,
        );

        box.userData = [templateName, CLIP_UTILS];
        objectsGroup.add(box);
    }

    for (let lineIndex = 0; lineIndex < params.clipLines.sideCuboids.length; lineIndex += 1) {
        const line = params.clipLines.sideCuboids[lineIndex];

        const box = createBox(
            line[0],
            line[1],
            params.clipSize.SIDE_CUBOID.WIDTH,
            params.clipSize.SIDE_CUBOID.LENGTH,
            clipMaterial,
            0,
            -params.tilt + 90,
            angle,
        );

        box.userData = [templateName, CLIP_UTILS];
        objectsGroup.add(box);
    }
}

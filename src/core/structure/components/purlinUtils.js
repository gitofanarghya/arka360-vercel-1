import * as THREE from 'three';
import * as utils from '../../utils/utils';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';
import { getEdgeMaterial, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth, createBox } from '../utils/mathUtils';
import { PURLIN_UTILS } from '../constants';

function calculateHorizontalPercentageArray(boundingBox, legPosition, footingBuffer) {
    const horizontalPointsPercentage = [];
    const horizontalLength = boundingBox[0].distanceTo(boundingBox[1]);
    const rowOfFootingPositions = legPosition[0];

    horizontalPointsPercentage.push(0);

    for (let i = 0; i < rowOfFootingPositions.length - 2; i += 1) {
        let newHorizontalPercent =
        horizontalPointsPercentage[horizontalPointsPercentage.length - 1] +
        (rowOfFootingPositions[i].distanceTo(rowOfFootingPositions[i + 1]) / horizontalLength);
        if (i === 0) {
            newHorizontalPercent += footingBuffer.WIDE / horizontalLength;
        }
        horizontalPointsPercentage.push(newHorizontalPercent);
    }

    horizontalPointsPercentage.push(1);

    return horizontalPointsPercentage;
}

function calculateVerticalPercentageArray(
    purlinBuffer,
    boundingBox,
    tableSizeUp,
    moduleLength,
    moduleWidth,
    moduleSpacingUp,
    panelOrientation,
    purlinWidth,
) {
    const verticalPointsPercentage = [];
    const verticalLength = boundingBox[0].distanceTo(boundingBox[3]);

    if (panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        for (let tableUpIdx = 0; tableUpIdx < tableSizeUp; tableUpIdx += 1) {
            verticalPointsPercentage.push(
                (purlinBuffer.TOP + ((moduleLength + moduleSpacingUp) * tableUpIdx)) /
                verticalLength,
                ((moduleLength - purlinBuffer.TOP) +
                ((moduleLength + moduleSpacingUp) * tableUpIdx)) / verticalLength,
            );
        }
    }
    else {
        verticalPointsPercentage.push(purlinWidth / 2 / verticalLength);
        for (let tableUpIdx = 1; tableUpIdx < tableSizeUp; tableUpIdx += 1) {
            verticalPointsPercentage.push((((moduleWidth + moduleSpacingUp) * tableUpIdx) -
            (moduleSpacingUp / 2)) / verticalLength);
        }
        verticalPointsPercentage.push((((moduleWidth + moduleSpacingUp) * tableSizeUp) -
        (moduleSpacingUp + (purlinWidth / 2))) / verticalLength);
    }
    return verticalPointsPercentage;
}

function getVerticalOffsetsToAlignWithPanel(purlinHeight, angle, verticalLength) {
    const perpendicularHeight = purlinHeight;
    const verticalOffsetInMeters = perpendicularHeight / Math.tan(angle);
    const verticalOffsetInPercentage = verticalOffsetInMeters / verticalLength;
    return verticalOffsetInPercentage;
}

export function computePurlins(params) {
    // TODO: Refactor
    const verticalPercentageArray = calculateVerticalPercentageArray(
        params.purlinBuffer,
        params.boundingBox,
        params.tableSizeUp,
        params.moduleLength,
        params.moduleWidth,
        params.moduleSpacingUp,
        params.orientation,
        params.purlinSize.WIDTH,
    );

    const horizontalPercentageArray = calculateHorizontalPercentageArray(
        params.boundingBox,
        params.legPosition,
        params.footingBuffer,
    );

    const angle = utils.deg2Rad(90 - params.tilt);
    const verticalOffsetToAlignWithPanel = getVerticalOffsetsToAlignWithPanel(
        params.purlinSize.HEIGHT / 2,
        angle,
        params.boundingBox[0].distanceTo(params.boundingBox[3]),
    );

    const tiltedDistanceToDecrease = (params.purlinSize.HEIGHT + params.drawingBuffer) / 2;
    const verticalDistanceToDecrease = tiltedDistanceToDecrease / Math.sin(angle);

    const purlinLines = [];

    for (let i = 0; i < verticalPercentageArray.length; i += 1) {
        const point1 = new THREE.Vector3().lerpVectors(
            params.boundingBox[0],
            params.boundingBox[3],
            verticalPercentageArray[i] - verticalOffsetToAlignWithPanel,
        );
        const point2 = new THREE.Vector3().lerpVectors(
            params.boundingBox[1],
            params.boundingBox[2],
            verticalPercentageArray[i] - verticalOffsetToAlignWithPanel,
        );

        const purlinLinesHorizontal = [];

        for (let j = 0; j < horizontalPercentageArray.length - 1; j += 1) {
            const line = [
                new THREE.Vector3().lerpVectors(point1, point2, horizontalPercentageArray[j]),
                new THREE.Vector3().lerpVectors(point1, point2, horizontalPercentageArray[j + 1]),
            ];
            line[0].z -= verticalDistanceToDecrease;
            line[1].z -= verticalDistanceToDecrease;
            purlinLinesHorizontal.push(line);
        }

        purlinLines.push(purlinLinesHorizontal);
    }

    return {
        purlinLines,
    };
}

export function drawPurlins(params, objectsGroup, templateName) {
    const purlinMaterial = getMeshMaterial(params.purlinStyle.COLOR, params.purlinStyle.URL);

    for (let verticalIdx = 0; verticalIdx < params.purlinLines.length; verticalIdx += 1) {
        for (
            let lineIndex = 0;
            lineIndex < params.purlinLines[verticalIdx].length;
            lineIndex += 1
        ) {
            const line = params.purlinLines[verticalIdx][lineIndex];

            const purlinMesh = createBox(
                line[0],
                line[1],
                params.purlinSize.WIDTH,
                params.purlinSize.HEIGHT - params.drawingBuffer,
                purlinMaterial,
                params.tilt,
                0,
                findAdjustedAzimuth(params.azimuth),
            );
            purlinMesh.userData = [templateName, PURLIN_UTILS];
            objectsGroup.add(purlinMesh);
        }
    }
}


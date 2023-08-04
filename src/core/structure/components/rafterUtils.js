import * as THREE from 'three';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';
import * as utils from '../../utils/utils';
import { getEdgeMaterial, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth, createBox } from '../utils/mathUtils';
import { RAFTER_UTILS } from '../constants';
import { RAFTER_UP_SIDE,RAFTER_DOWN_SIDE} from '../constants';

function getVerticalOffsetsToAlignWithPanel(rafterHeight, purlinHeight, angle, verticalLength) {
    const perpendicularHeight = (rafterHeight / 2) + purlinHeight;
    const verticalOffsetInMeters = perpendicularHeight / Math.tan(angle);
    const verticalOffsetInPercentage = verticalOffsetInMeters / verticalLength;
    return verticalOffsetInPercentage;
}

// TODO: Rename very important. This should explain what the function does not how it does it.
function getDistanceBetweenTopAndBottomLeg(legPosition, verticalDistanceToIncrease, legHeights) {
    const topLeftLegPoint = legPosition[0][0].clone();
    const bottomLeftLegPoint = legPosition[legPosition.length - 1][0].clone();
    topLeftLegPoint.z += legHeights[0][0] + verticalDistanceToIncrease;
    bottomLeftLegPoint.z += legHeights[legHeights.length - 1][0] +
    verticalDistanceToIncrease;
    return topLeftLegPoint.distanceTo(bottomLeftLegPoint);
}

// TODO: Too many function arguments
function computeRafterBufferPercent(
    params,
    angle,
    verticalDistanceToIncrease,
) {
    let rafterBufferTopPercent = 0;
    let rafterBufferBottomPercent = 0;

    const distanceBetweenTopAndBottomLeg = getDistanceBetweenTopAndBottomLeg(
        params.legPosition,
        verticalDistanceToIncrease,
        params.legHeights,
    );

    const verticalOffsetInPercentage = getVerticalOffsetsToAlignWithPanel(
        params.rafterSize.HEIGHT,
        params.boundingBoxZDifference,
        angle,
        distanceBetweenTopAndBottomLeg,
    );

    if (params.orientation === PANEL_ORIENTATION_PORTRAIT) {
        // TODO: Dependence on footing here
        rafterBufferTopPercent = (params.footingBuffer.UP - params.rafterBuffer.TOP) /
        distanceBetweenTopAndBottomLeg;
        rafterBufferBottomPercent = (params.footingBuffer.UP - params.rafterBuffer.BOTTOM) /
        distanceBetweenTopAndBottomLeg;
    }
    else {
        rafterBufferTopPercent = params.footingBuffer.UP / distanceBetweenTopAndBottomLeg;
        rafterBufferBottomPercent = params.footingBuffer.UP / distanceBetweenTopAndBottomLeg;
    }

    rafterBufferTopPercent += verticalOffsetInPercentage;
    rafterBufferBottomPercent -= verticalOffsetInPercentage;

    return [rafterBufferTopPercent, rafterBufferBottomPercent];
}

// TODO: Rename
// TODO: Not accounting for vertical buffer. Needed?
function computeRafterLinesForSingleLeg(params) {
    const { boundingBox, rafterBuffer } = params;

    const boundingBoxPlane = (new THREE.Plane()).setFromCoplanarPoints(...boundingBox);

    const totalHorizontalDistance = boundingBox[0].distanceTo(boundingBox[1]);
    const verticalLine = new THREE.Line3(boundingBox[0], boundingBox[3]);
    // TODO: Rename
    const rafterLines = [];

    for (let i = 0; i < params.legPosition.length; i += 1) {
        for (let j = 0; j < params.legPosition[i].length; j += 1) {
            const line = new THREE.Line3(params.legPosition[i][j], new THREE.Vector3(
                params.legPosition[i][j].x,
                params.legPosition[i][j].y,
                // TODO: Find a fix for this
                params.legPosition[i][j].z + 10000,
            ));

            const newPoint = new THREE.Vector3();
            boundingBoxPlane.intersectLine(line, newPoint);

            const pointOnLine = new THREE.Vector3();
            verticalLine.closestPointToPoint(
                newPoint,
                false,
                pointOnLine,
            );
            const distancePercent = pointOnLine.distanceTo(newPoint) / totalHorizontalDistance;

            // TODO: All these operations are extremely performance intensive. Reduce them.
            let point1 = (new THREE.Vector3()).copy(boundingBox[0])
                .lerp(boundingBox[1], distancePercent);
            let point2 = (new THREE.Vector3()).copy(boundingBox[3])
                .lerp(boundingBox[2], distancePercent);

            const verticalDistance = params.boundingBoxZDifference + (params.rafterSize.HEIGHT / 2);
            point1 = (new THREE.Vector3()).copy(point1)
                .addScaledVector(boundingBoxPlane.normal, verticalDistance);
            point2 = (new THREE.Vector3()).copy(point2)
                .addScaledVector(boundingBoxPlane.normal, verticalDistance);

            if (rafterBuffer.TOP && rafterBuffer.BOTTOM) {
                rafterLines.push([
                    (new THREE.Vector3()).copy(point1).lerp(point2, rafterBuffer.TOP / point1.distanceTo(point2)),
                    (new THREE.Vector3()).copy(point2).lerp(point1, rafterBuffer.BOTTOM / point2.distanceTo(point1)),
                ]);
            }
            else {
                rafterLines.push([point1, point2]);
            }
        }
    }
    return rafterLines;
}

function computeRafterLinesForMultiLeg(
    params,
    verticalDistanceToIncrease,
    rafterBufferTopPercent,
    rafterBufferBottomPercent,
) {
    const rafterLines = [];

    for (let i = 0; i < params.legPosition[0].length; i += 1) {
        const point1 = params.legPosition[0][i].clone();
        const point2 = params.legPosition[params.legPosition.length - 1][i].clone();

        // point1.z = (point2.z + point1.z) /;

        point1.z += params.legHeights[0][i] + verticalDistanceToIncrease;
        point2.z += params.legHeights[params.legHeights.length - 1][i] +
        verticalDistanceToIncrease;

        const rafterPoint1 = new THREE.Vector3().lerpVectors(
            point1,
            point2,
            -rafterBufferTopPercent,
        );
        const rafterPoint2 = new THREE.Vector3().lerpVectors(
            point1,
            point2,
            1 + rafterBufferBottomPercent,
        );

        rafterLines.push([rafterPoint1, rafterPoint2]);
    }
    if (params.templateName === 'Fixed Tilt 2500mm') {
        const purlinFirst = utils.convertVectorToArray([params.purlinLines[0][0][0], params.purlinLines[0][0][1]]);
        const purlinLast = utils.convertVectorToArray([params.purlinLines[5][0][0], params.purlinLines[5][0][1]]);
        const rafterFirst = utils.convertVectorToArray([rafterLines[0][0]]);
        const rafterSecond = utils.convertVectorToArray([rafterLines[0][1]]);

        const distance1 = utils.findPerpendicularDistance(rafterFirst, purlinFirst);
        const distance2 = utils.findPerpendicularDistance(rafterSecond, purlinLast);
        const length = rafterLines[0][0].distanceTo(rafterLines[0][1]);

        const up = (distance1 + length) / length;
        const down = -(((distance2 + length) / length) - 1);

        rafterLines[0][1].copy(rafterLines[0][1]).lerp(rafterLines[0][0], down);
        rafterLines[1][1].copy(rafterLines[1][1]).lerp(rafterLines[1][0], down);
        rafterLines[0][0].lerpVectors(rafterLines[0][1], rafterLines[0][0], up);
        rafterLines[1][0].lerpVectors(rafterLines[1][1], rafterLines[1][0], up);
    }

    return rafterLines;
}

// TODO: This needs a lot of refactoring. For one, it is heavily dependent on purlins,
// footings and other components
export function computeRafters(params) {
    const angle = utils.deg2Rad(90 - params.tilt);
    const verticalDistanceToIncrease = (params.rafterSize.HEIGHT / 2) /
        Math.sin(angle);

    const [rafterBufferTopPercent, rafterBufferBottomPercent] = computeRafterBufferPercent(
        params,
        angle,
        verticalDistanceToIncrease,
    );

    return {
        rafterLines: (params.legPosition.length > 1) ? computeRafterLinesForMultiLeg(
            params,
            verticalDistanceToIncrease,
            rafterBufferTopPercent,
            rafterBufferBottomPercent,
        ) : computeRafterLinesForSingleLeg(params),
    };
}


export function drawRafters(params, objectsGroup, templateName) {
    const rafterMaterial = getMeshMaterial(params.rafterStyle.COLOR, params.rafterStyle.URL);

    for (let lineIndex = 0; lineIndex < params.rafterLines.length; lineIndex += 1) {
        const line = params.rafterLines[lineIndex];

        let angle = 90 + findAdjustedAzimuth(params.azimuth);
        angle = angle > 360 ? angle - 360 : angle;

        const box = createBox(
            line[0],
            line[1],
            params.rafterSize.WIDTH,
            params.rafterSize.HEIGHT - params.drawingBuffer,
            rafterMaterial,
            0,
            -params.tilt,
            angle,
        );

        box.userData = [templateName, RAFTER_UTILS];
        objectsGroup.add(box);
    }
}

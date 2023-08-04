import * as THREE from 'three';
import { getEdgeMaterial, drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth, deg2Rad, lineIntersection } from '../../utils/utils';
import { SIDE_BRACING_UTILS } from '../constants';

export function computeSideBracings(params) {
    const {
        legPosition,
        legHeights,
        legPercentageFromBottom,
        purlinLines,
        rafterLines,
    } = params;

    const sideBracingConnectorLines = [];
    for (let i = 0; i < legPosition.length; i += 1) {
        const initialPoint = new THREE.Vector3(
            legPosition[0][i].x,
            legPosition[0][i].y,
            legPosition[0][i].z + (legHeights[0][1] * legPercentageFromBottom),
        );
        const intersection = lineIntersection(purlinLines[1][0], rafterLines[i]);
        const longDistance = new THREE.Vector3(rafterLines[i][0].x, rafterLines[i][0].y, 0)
            .distanceTo(new THREE.Vector3(intersection.point.x, intersection.point.y, 0));
        const shortDistance = new THREE.Vector3(rafterLines[i][1].x, rafterLines[i][1].y, 0)
            .distanceTo(new THREE.Vector3(intersection.point.x, intersection.point.y, 0));
        const z = (rafterLines[i][0].z -
            ((rafterLines[i][0].z - rafterLines[i][1].z) * (longDistance / shortDistance)));
        const endPoint = new THREE.Vector3(
            intersection.point.x,
            intersection.point.y,
            // purlinLines[1][0][i].z,
            z,
        );
        const sideBracingLines = new THREE.Line3(
            initialPoint,
            endPoint,
        );
        sideBracingConnectorLines.push(sideBracingLines);
    }
    return sideBracingConnectorLines;
}

export function drawSideBracings(params, objectsGroup, templateName) {
    for (let lineIndex = 0; lineIndex < params.sideBracingConnectorLines.length; lineIndex += 1) {
        const line = params.sideBracingConnectorLines[lineIndex];

        const box = drawLine(
            line.start,
            line.end,
            { width: params.sideBracingSize.WIDTH, length: params.sideBracingSize.LENGTH },
            { color: params.sideBracingStyle.COLOR, textureURL: params.sideBracingStyle.URL },
            deg2Rad(findAdjustedAzimuth(params.azimuth)),
        );
        box.rotateOnAxis = 10;

        box.userData = [templateName, SIDE_BRACING_UTILS];
        objectsGroup.add(box);
    }
}

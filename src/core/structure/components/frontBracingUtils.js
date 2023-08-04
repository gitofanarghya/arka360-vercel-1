import * as THREE from 'three';
import { drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth, deg2Rad } from '../../utils/utils';
import { FRONT_BRACING_UTILS } from '../constants';

export function computeFrontBracings(params) {
    const {
        legPosition,
        legHeights,
        legPercentageFromBottom,
        legConnectorMidPoint,
    } = params;

    const frontBracingConnectorLines = [];
    for (let i = 0; i < legPosition.length; i += 1) {
        const initialPoint = new THREE.Vector3(
            legPosition[i][1].x,
            legPosition[i][1].y,
            legPosition[i][1].z + (legHeights[i][1] * legPercentageFromBottom),
        );
        const endPoint = (new THREE.Vector3()).copy(legConnectorMidPoint[i]);
        const frontBracingLines = new THREE.Line3(
            initialPoint,
            endPoint,
        );
        frontBracingConnectorLines.push(frontBracingLines);
    }
    return frontBracingConnectorLines;
}

export function drawFrontBracings(params, objectsGroup, templateName) {

    for (let lineIndex = 0; lineIndex < params.frontBracingConnectorLines.length; lineIndex += 1) {
        const line = params.frontBracingConnectorLines[lineIndex];

        const box = drawLine(
            line.start,
            line.end,
            { width: params.frontBracingSize.WIDTH, length: params.frontBracingSize.LENGTH },
            { color: params.frontBracingStyle.COLOR, textureURL: params.frontBracingStyle.URL },
            deg2Rad(findAdjustedAzimuth(params.azimuth)),
        );


        box.userData = [templateName, FRONT_BRACING_UTILS];
        objectsGroup.add(box);
    }
}

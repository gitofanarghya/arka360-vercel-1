import * as THREE from 'three';
import { drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { findAdjustedAzimuth, deg2Rad } from '../../utils/utils';
import { BRACING_UTILS } from '../constants';

// TODO: Try to remove dependence on rafters and legs
export function computeBracings(params) {
    const {
        legPosition,
        rafterLines,
        legHeights,
        rafterTop,
        rafterBottom,
        legPercentageFromBottom,
        bracingConnector,
        boundingBox,
        bracingSize,
    } = params;

    const boundingBoxPlane = (new THREE.Plane()).setFromCoplanarPoints(...boundingBox);

    const bracingLines = [];
    const bracingConnectorLines = [];
    for (let i = 0; i < legPosition.length; i += 1) {
        for (let j = 0; j < legPosition[i].length; j += 1) {
            const initialPoint = new THREE.Vector3(
                legPosition[i][j].x,
                legPosition[i][j].y,
                legPosition[i][j].z + (legHeights[i][j] * legPercentageFromBottom),
            );

            if (rafterBottom) {
                const rafterBottomPercent = rafterBottom / rafterLines[j][0]
                    .distanceTo(rafterLines[j][1]);
                const bottomBracingFinalPoint = (new THREE.Vector3())
                    .copy(rafterLines[j][0]).lerp(rafterLines[j][1], 1 - rafterBottomPercent);

                if (bracingConnector) {
                    const bracingConnectorFinalPoint = bottomBracingFinalPoint.clone();
                    bottomBracingFinalPoint.addScaledVector(
                        boundingBoxPlane.normal,
                        bracingConnector.SIZE.HEIGHT,
                    );
                    const intersectionPoint = bottomBracingFinalPoint.clone()
                        .lerp(bracingConnectorFinalPoint, -bracingSize.LENGTH /
                        (2 * bottomBracingFinalPoint.distanceTo(bracingConnectorFinalPoint)));
                    bracingConnectorLines.push([
                        intersectionPoint,
                        bracingConnectorFinalPoint,
                    ]);
                    bracingLines.push([initialPoint, intersectionPoint]);
                }
                else {
                    bracingLines.push([initialPoint, bottomBracingFinalPoint]);
                }
            }

            if (rafterTop) {
                const rafterTopPercent = rafterTop / rafterLines[j][0]
                    .distanceTo(rafterLines[j][1]);
                const topBracingFinalPoint = (new THREE.Vector3())
                    .copy(rafterLines[j][0]).lerp(rafterLines[j][1], rafterTopPercent);
                bracingLines.push([initialPoint, topBracingFinalPoint]);
            }
        }
    }

    return { bracingLines, bracingConnectorLines };
}

export function drawBracings(params, objectsGroup, templateName) {

    for (let lineIndex = 0; lineIndex < params.bracingConnectorLines.length; lineIndex += 1) {
        const line = params.bracingConnectorLines[lineIndex];

        const box = drawLine(
            line[0],
            line[1],
            { width: params.bracingSize.WIDTH, length: params.bracingSize.LENGTH },
            { color: params.bracingStyle.COLOR, textureURL: params.bracingStyle.URL },
            deg2Rad(findAdjustedAzimuth(params.azimuth)),
        );
        box.userData = [templateName, BRACING_UTILS];
        objectsGroup.add(box);
    }

    for (let lineIndex = 0; lineIndex < params.bracingLines.length; lineIndex += 1) {
        const line = params.bracingLines[lineIndex];

        const box = drawLine(
            line[0],
            line[1],
            { width: params.bracingSize.WIDTH, length: params.bracingSize.LENGTH },
            { color: params.bracingStyle.COLOR, textureURL: params.bracingStyle.URL },
            0,
        );
        box.userData = [templateName, BRACING_UTILS];
        objectsGroup.add(box);
    }
}

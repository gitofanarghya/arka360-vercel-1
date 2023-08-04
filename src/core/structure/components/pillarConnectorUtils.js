import * as THREE from 'three';
import { drawLine, getEdgeMaterial, getMeshMaterial } from '../utils/drawingUtils';
import { PILLAR_CONNECTOR_UTILS } from '../constants';

export function computePillarConnectors(params) {
    const {
        boundingBox,
        pillarHeight,
        subarrayDetails,
        numberOfPillarConnectors,
        subarrayParent,
    } = params;

    const verticalDirection = boundingBox[2].clone().sub(boundingBox[1]);
    verticalDirection.z = 0;
    verticalDirection.normalize();

    const pillarConnectorZ = pillarHeight + subarrayParent.getZOnTopSurface(
        boundingBox[0].x,
        boundingBox[0].y,
    );
    const pillarConnectorLines = {
        horizontalLines: [],
        verticalLines: [],
    };
    const horizontalTopLine = new THREE.Line3(
        boundingBox[0].clone().setZ(pillarConnectorZ).addScaledVector(verticalDirection, -subarrayDetails.rowSpacing),
        boundingBox[1].clone().setZ(pillarConnectorZ).addScaledVector(verticalDirection, -subarrayDetails.rowSpacing),
    );
    const horizontalBottomLine = new THREE.Line3(
        boundingBox[3].clone().setZ(pillarConnectorZ),
        boundingBox[2].clone().setZ(pillarConnectorZ),
    );
    pillarConnectorLines.horizontalLines = [
        horizontalBottomLine,
        horizontalTopLine,
    ];

    // TODO: Change the constant
    const pillarDistancePercent = 1 / (numberOfPillarConnectors - 1);
    for (let i = 0; i < numberOfPillarConnectors; i += 1) {
        const start = horizontalTopLine.start.clone().lerp(
            horizontalTopLine.end, pillarDistancePercent * i);
        const end = horizontalBottomLine.start.clone().lerp(
            horizontalBottomLine.end, pillarDistancePercent * i);

        pillarConnectorLines.verticalLines.push(new THREE.Line3(start, end));
    }


    return {
        pillarConnectorLines,
    };
}

export function drawPillarConnectors(params, objectsGroup, templateName) {
    const combinedPillarConnectorLines = params.pillarConnectorLines.horizontalLines
        .concat(params.pillarConnectorLines.verticalLines);

    for (let i = 0; i < combinedPillarConnectorLines.length; i += 1) {
        const pillarConnectorMesh = drawLine(
            combinedPillarConnectorLines[i].start,
            combinedPillarConnectorLines[i].end,
            {
                length: params.pillarConnectorSize.HEIGHT,
                width: params.pillarConnectorSize.WIDTH,
            },
            {
                color: params.pillarConnectorStyle.COLOR,
                textureURL: params.pillarConnectorStyle.URL,
            },
        );
        pillarConnectorMesh.receiveShadow = true;
        pillarConnectorMesh.castShadow = true;

        pillarConnectorMesh.userData = [templateName, PILLAR_CONNECTOR_UTILS];
        objectsGroup.add(pillarConnectorMesh);
    }
}

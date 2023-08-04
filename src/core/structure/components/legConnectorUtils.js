import { BoundingBox } from 'opentype.js';
import * as THREE from 'three';
import { drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { LEG_CONNECTOR_UTILS } from '../constants';

function getLegConnectorMidPoint(horizontalBL, horizontalFL) {
    const frontLegConnectorMidPoint = new THREE.Vector3();
    const backLegConnectorMidPoint = new THREE.Vector3();

    horizontalFL.getCenter(frontLegConnectorMidPoint);
    horizontalBL.getCenter(backLegConnectorMidPoint);

    const legConnectorMidPoint = [
        backLegConnectorMidPoint,
        frontLegConnectorMidPoint,
    ];
    return legConnectorMidPoint;
}

export function computeLegConnectors(params) {
    const {
        legHeight,
        legPosition,
        subarrayParent,
    } = params;

    // backLegs.
    const horizontalDirectionBL = params.legPosition[0][1].clone().sub(params.legPosition[0][0]);
    horizontalDirectionBL.z = 0;
    horizontalDirectionBL.normalize();

    // frontlegs
    const horizontalDirectionFL = params.legPosition[1][1].clone().sub(params.legPosition[1][0]);
    horizontalDirectionFL.z = 0;
    horizontalDirectionFL.normalize();

    const legConnectorZBL = legHeight[0][1] + subarrayParent.getZOnTopSurface(
        params.legPosition[0][1].x,
        params.legPosition[0][1].y,
    );
    const legConnectorZFL = legHeight[1][1] + subarrayParent.getZOnTopSurface(
        params.legPosition[1][1].x,
        params.legPosition[1][1].y,
    );

    const legConnectorLines = {
        horizontalLines: [],
    };

    const horizontalBL = new THREE.Line3(
        params.legPosition[0][0].clone().setZ(legConnectorZBL),
        params.legPosition[0][1].clone().setZ(legConnectorZBL),
    );

    const horizontalFL = new THREE.Line3(
        params.legPosition[1][0].clone().setZ(legConnectorZFL),
        params.legPosition[1][1].clone().setZ(legConnectorZFL),
    );

    legConnectorLines.horizontalLines = [
        horizontalFL,
        horizontalBL,
    ];

    const legConnectorMidPoint = getLegConnectorMidPoint(horizontalBL, horizontalFL);
    return {
        legConnectorLines,
        legConnectorMidPoint,
    };
}

export function drawLegConnectors(params, objectsGroup, templateName) {
    const combinedLegConnectorLines = params.legConnectorLines.horizontalLines;

    for (let i = 0; i < combinedLegConnectorLines.length; i += 1) {
        const legConnectorMesh = drawLine(
            combinedLegConnectorLines[i].start,
            combinedLegConnectorLines[i].end,
            {
                length: params.legConnectorSize.HEIGHT,
                width: params.legConnectorSize.WIDTH,
            },
            {
                color: params.legConnectorStyle.COLOR,
                textureURL: params.legConnectorStyle.URL,
            },
        );
        legConnectorMesh.receiveShadow = true;
        legConnectorMesh.castShadow = true;
        legConnectorMesh.updateMatrix();

        legConnectorMesh.userData = [templateName, LEG_CONNECTOR_UTILS];
        objectsGroup.add(legConnectorMesh);
    }
}

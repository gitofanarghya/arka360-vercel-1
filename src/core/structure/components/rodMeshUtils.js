import * as THREE from 'three';

import { getEdgeMaterial, drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { deg2Rad, findAdjustedAzimuth } from '../../utils/utils';
import { ROD_MESH_UTILS } from '../constants';

// Method to get the conector corresponding to the given rafter(Only works for elevated mms config(4nx4n))
function getCorrespondingPillarConnector(pillarConnectors, rafterLine) {
    const minDistance = { value: Number.MAX_SAFE_INTEGER, index: -1 };
    const connectorMidPoint = new THREE.Vector3();
    const rafterMidPoint = new THREE.Vector3();

    for (let i = 0; i < pillarConnectors.length; i += 1) {
        pillarConnectors[i].getCenter(connectorMidPoint);
        rafterLine.getCenter(rafterMidPoint);

        const currentDistance = connectorMidPoint.distanceTo(rafterMidPoint);
        if (minDistance.value > currentDistance) {
            minDistance.value = currentDistance;
            minDistance.index = i;
        }
    }
    return pillarConnectors[minDistance.index];
}

function getRodPoints(line, numberOfPoints, startingPoint, endingPoint) {
    const points = [];
    points.push(startingPoint);
    const percentageDistance = 1 / numberOfPoints;
    for (let i = 0; i < numberOfPoints; i += 1) {
        points.push(startingPoint.clone().lerp(endingPoint, percentageDistance * i));
    }
    return points;
}

function getUpperRodPoints(rodPoints, rafterLine) {
    const points = [];
    const normalZ = new THREE.Vector3(0, 0, 1);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

    for (let i = 0; i < rodPoints.length; i += 1) {
        const raycaster = new THREE.Raycaster(rodPoints[i], normalZ);
        const geometry = new THREE.BufferGeometry().setFromPoints([rafterLine.start, rafterLine.end]);
        const rafter = new THREE.Line(geometry, material);
        const intersects = raycaster.intersectObject(rafter, true);
        points.push(intersects[0].point);
    }

    return points;
}

// lineObjects is gonna be like [ { points: [] }, { points: [] } ]
function getRodLines(lineObjects) {
    let lines = [];
    for (let i = 0; i < lineObjects[0].points.length; i += 1) {
        lines.push(new THREE.Line3(
            lineObjects[0].points[i],
            lineObjects[1].points[i],
        ));

        if (i % 2 === 0 && i < lineObjects[0].points.length - 1) {
            lines.push(new THREE.Line3(
                lineObjects[0].points[i],
                lineObjects[1].points[i + 1],
            ));
        }

        if (i % 2 === 1 && i < lineObjects[0].points.length - 1) {
            lines.push(new THREE.Line3(
                lineObjects[1].points[i],
                lineObjects[0].points[i + 1],
            ));
        }
    }

    // clip end lines
    lines = lines.slice(2);

    return lines;
}

export function computeRodMesh(params) {
    const {
        numberOfVerticalRods,
        rafterLines,
        pillarConnectorLines,
        buffer,
    } = params;

    const rodLines = [];

    const rodMeshCount = pillarConnectorLines.verticalLines.length;

    for (let i = 0; i < rodMeshCount; i += 1) {
        // select rafter and corresponding connector
        const rafterLine = new THREE.Line3(rafterLines[i][0], rafterLines[i][1]);

        const rodMeshLines = {
            connectorLine: pillarConnectorLines.verticalLines[i],
            rafterLine,
        };

        // Assuming the number of points in the lines are the same
        const lineObjects = [];

        // fix for rod mesh placement
        const shiftedStartPoint = new THREE.Vector3(
            rodMeshLines.rafterLine.start.x,
            rodMeshLines.rafterLine.start.y,
            rodMeshLines.connectorLine.start.z,
        ).lerp(rodMeshLines.connectorLine.end, buffer.TOP);

        const connectorPoints = getRodPoints(
            rodMeshLines.connectorLine,
            numberOfVerticalRods,
            shiftedStartPoint,
            rodMeshLines.connectorLine.end,
        );

        const rafterPoints = getUpperRodPoints(
            connectorPoints,
            rodMeshLines.rafterLine,
        );

        lineObjects.push({
            points: connectorPoints,
        });
        lineObjects.push({
            points: rafterPoints,
        });

        const tempRodLines = getRodLines(lineObjects);
        rodLines.push(...tempRodLines);
    }

    return { rodLines };
}

export function drawRodMesh(params, objectsGroup, templateName) {

    for (let lineIndex = 0; lineIndex < params.rodLines.length; lineIndex += 1) {
        const line = params.rodLines[lineIndex];

        const box = drawLine(
            line.start,
            line.end,
            { width: params.rodMeshSize.WIDTH, length: params.rodMeshSize.LENGTH },
            { color: params.rodMeshStyle.COLOR, textureURL: params.rodMeshStyle.URL },
            deg2Rad(findAdjustedAzimuth(params.azimuth)),
        );

        box.userData = [templateName, ROD_MESH_UTILS];
        objectsGroup.add(box);
    }
}

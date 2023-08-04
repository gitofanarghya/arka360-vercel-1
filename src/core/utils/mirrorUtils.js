import * as THREE from 'three';
import {
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
    DEFAULT_HANDRAIL_DIRECTION,
    ALTERNATE_HANDRAIL_DIRECTION,
} from '../coreConstants';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Walkway from '../objects/model/Walkway';
import Handrail from '../objects/model/Handrail';
import Subarray from '../objects/subArray/Subarray';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import Gazebo from '../lib/PowerGazebo';

export function mirrorPointAlongEdge(point, a, b, c) {
    const mirrorPoint = new THREE.Vector3();
    const perpendicular =
        (-2 * ((a * point.x) + (b * point.y) + c)) / ((a * a) + (b * b));

    mirrorPoint.x = (perpendicular * a) + point.x;
    mirrorPoint.y = (perpendicular * b) + point.y;
    mirrorPoint.z = point.z;

    return mirrorPoint;
}

export function isMirrorSupported(object) {
    if (object instanceof PolygonModel ||
        object instanceof CylinderModel) {
        return true;
    }
    console.error('ERROR: MirrorManager: object not supported for mirroring');
    return false;
}

/*
* Calculates the angle(in deg) between AB and the Y axis
* A and B are points (ax,ay) and (bx,by)
*/
function getEdgeAngleWithYAxis(edge) {
    const angleRad = Math.atan((edge[0].y - edge[1].y) / (edge[0].x - edge[1].x));
    return 90 - ((angleRad * 180) / Math.PI);
}

function mirrorAzimuthAlongEdge(azimuth, edge) {
    let angleOfEdge = getEdgeAngleWithYAxis(edge);
    angleOfEdge = (angleOfEdge > 0) ? angleOfEdge : 360 + angleOfEdge;
    let mirrorAzimuth = angleOfEdge - (azimuth - angleOfEdge);
    // rounding off to 2 decimal places.
    mirrorAzimuth = (mirrorAzimuth >= 0) ? mirrorAzimuth : 360 + mirrorAzimuth;
    return Math.round((mirrorAzimuth >= 360 ? mirrorAzimuth - 360 : mirrorAzimuth) * 100) / 100;
}

function mirrorPanelMapAlongEdge(panelMap, a, b, c) {
    const mirroredPanelMap = panelMap;
    const mirroredPanelCorners = [];

    const corners = panelMap.corners !== undefined ? panelMap.corners : [];
    const verticesOrder = [3, 2, 1, 0];
    for (let i = 0, cornersLen = corners.length; i < cornersLen; i += 1) {
        const mirroredCornerPoint = mirrorPointAlongEdge(
            new THREE.Vector3(
                corners[verticesOrder[i]][0],
                corners[verticesOrder[i]][1],
                corners[verticesOrder[i]][2],
            ),
            a, b, c,
        );
        mirroredPanelCorners.push([
            mirroredCornerPoint.x,
            mirroredCornerPoint.y,
            mirroredCornerPoint.z,
        ]);
    }
    mirroredPanelMap.corners = mirroredPanelCorners;
    return mirroredPanelMap;
}

function mirrorTableMapAlongEdge(tableMap, edge) {
    const mirroredTableMap = tableMap;
    const mirroredPanels = [];

    const a = edge[1].y - edge[0].y;
    const b = edge[0].x - edge[1].x;
    const c = -1 * ((edge[0].x * a) + (edge[0].y * b));

    const mirroredPosition = mirrorPointAlongEdge(
        new THREE.Vector3(
            tableMap.position.x,
            tableMap.position.y,
            tableMap.position.z,
        ),
        a, b, c,
    );
    mirroredTableMap.position = {
        x: mirroredPosition.x,
        y: mirroredPosition.y,
        z: mirroredPosition.z,
    };

    const panels = tableMap.panels !== undefined ? tableMap.panels : [];
    for (let i = 0, panelsLen = panels.length; i < panelsLen; i += 1) {
        const mirroredPanelMap = mirrorPanelMapAlongEdge(panels[i], a, b, c);
        mirroredPanels.push(mirroredPanelMap);
    }

    mirroredTableMap.panels = mirroredPanels;
    return mirroredTableMap;
}

function mirrorRowMapAlongEdge(rowMap, edge) {
    const mirroredRowMap = rowMap;
    const mirroredFrames = [];

    const frames = rowMap.frames !== undefined ? rowMap.frames : [];
    for (let i = 0, framesLen = frames.length; i < framesLen; i += 1) {
        const mirroredTableMap = mirrorTableMapAlongEdge(frames[i], edge);
        mirroredFrames.push(mirroredTableMap);
    }
    mirroredRowMap.frames = mirroredFrames;
    return mirroredRowMap;
}

function mirrorSubarrayMapAlongEdge(subarrayMap, edge) {
    const mirroredSubarrayMap = subarrayMap;
    const mirroredRows = [];
    const rows = subarrayMap.rows !== undefined ? subarrayMap.rows : [];
    for (let i = 0, rowsLen = rows.length; i < rowsLen; i += 1) {
        const mirroredRowMap = mirrorRowMapAlongEdge(rows[i], edge);
        mirroredRows.push(mirroredRowMap);
    }

    mirroredSubarrayMap.azimuth = mirrorAzimuthAlongEdge(subarrayMap.azimuth, edge);
    mirroredSubarrayMap.rows = mirroredRows;

    return mirroredSubarrayMap;
}

export function mirrorObjectData(objectData, edge) {
    const mirroredData = objectData;

    // a, b, c denotes the constants for equation of line formed by edge.
    // ax + by + c = 0
    const a = edge[1].y - edge[0].y;
    const b = edge[0].x - edge[1].x;
    const c = -1 * ((edge[0].x * a) + (edge[0].y * b));

    const mirroredOutLinePoints = [];
    for (let i = 0, len = objectData.outlinePoints.length; i < len; i += 1) {
        const mirroredOutLinePoint = mirrorPointAlongEdge(
            new THREE.Vector3(
                objectData.outlinePoints[i][0],
                objectData.outlinePoints[i][1],
                objectData.outlinePoints[i][2],
            ),
            a, b, c,
        );
        mirroredOutLinePoints.push([
            mirroredOutLinePoint.x,
            mirroredOutLinePoint.y,
            mirroredOutLinePoint.z,
        ]);
    }
    mirroredData.outlinePoints = mirroredOutLinePoints;

    if (objectData.type === PolygonModel.getObjectType()
        || objectData.type === CylinderModel.getObjectType()
        || objectData.type === Inverter.getObjectType()
        || objectData.type === ACDB.getObjectType()) {
        mirroredData.azimuth = mirrorAzimuthAlongEdge(objectData.azimuth, edge);
    }
    else if (objectData.type === Gazebo.getObjectType()) {
        mirroredData.azimuth = mirrorAzimuthAlongEdge(objectData.azimuth, edge);
        mirroredData.subarrayMap = mirrorSubarrayMapAlongEdge(objectData.subarrayMap, edge);
    }
    else if (objectData.type === 'EastWestRack') {
        mirroredData.azimuth = mirrorAzimuthAlongEdge(objectData.azimuth, edge);
        mirroredData.subarrayMap = mirrorSubarrayMapAlongEdge(objectData.subarrayMap, edge);
    }
    else if (objectData.type === Subarray.getObjectType()) {
        mirroredData.azimuth = mirrorAzimuthAlongEdge(objectData.azimuth, edge);
        mirroredData.subarrayMap = mirrorSubarrayMapAlongEdge(objectData.subarrayMap, edge);
    }
    else if (objectData.type === Walkway.getObjectType()) {
        if (objectData.walkwayDirection === DEFAULT_WALKWAY_DIRECTION) {
            mirroredData.walkwayDirection = ALTERNATE_WALKWAY_DIRECTION;
        }
        else if (objectData.walkwayDirection === ALTERNATE_WALKWAY_DIRECTION) {
            mirroredData.walkwayDirection = DEFAULT_WALKWAY_DIRECTION;
        }
    }
    else if (objectData.type === 'SafetyLine') {
        if (objectData.walkwayDirection === DEFAULT_WALKWAY_DIRECTION) {
            mirroredData.walkwayDirection = ALTERNATE_WALKWAY_DIRECTION;
        }
        else if (objectData.walkwayDirection === ALTERNATE_WALKWAY_DIRECTION) {
            mirroredData.walkwayDirection = DEFAULT_WALKWAY_DIRECTION;
        }
    }
    else if (objectData.type === Handrail.getObjectType()) {
        if (objectData.handrailDirection === DEFAULT_HANDRAIL_DIRECTION) {
            mirroredData.handrailDirection = ALTERNATE_HANDRAIL_DIRECTION;
        }
        else if (objectData.handrailDirection === ALTERNATE_HANDRAIL_DIRECTION) {
            mirroredData.handrailDirection = DEFAULT_HANDRAIL_DIRECTION;
        }
    }
    // might be useful in future if we modify this feature.

    // const mirroredChildren = [];
    // const children = { objectData };
    // for (let i = 0, len = children.length; i < len; i += 1) {
    //     const mirroredChild = mirrorObjectData(children[i], edge);
    //     mirroredChildren.push(mirroredChild);
    // }
    // mirroredData.children = mirroredChildren;

    return mirroredData;
}

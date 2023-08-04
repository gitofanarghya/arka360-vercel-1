import * as THREE from 'three';

import {
    getNumberOfLegFooting,
    getUniformPoints,
    createBox,
    findAdjustedAzimuth,
    getCustomUniformPoints,
} from '../utils/mathUtils';
import * as utils from '../../utils/utils';
import { getEdgeMaterial, drawLine, getMeshMaterial } from '../utils/drawingUtils';
import { LEG_UTILS } from '../constants';
import {UPPER_LEGS,LOWER_LEGS}from '../constants';

const LOG = false;

function lg(entity, msg) {
    if (LOG) {
        console.log(`${entity} START`);
        console.log(msg);
        console.log(`${entity} END`);
    }
}

function getLegPosition(params, legCount) {
    const {
        legBaseHeight,
        backLegsOnly,
        subarrayDetails,
        row,
        boundingBox,
        legBuffer,
        templateName,
    } = params;

    let legPosition;
    // TODO - Refactor
    if (legBuffer.WIDE && templateName != 'Elevated MMS') { // temp fix
        const interModuleSpacing = subarrayDetails.tableSpacing; // 0.03
        const { moduleHorizontalLength, moduleVerticalLength } = subarrayDetails;
        legPosition = getCustomUniformPoints(
            legCount,
            boundingBox,
            (index) => {
                const moduleIndex = Math.floor(index / 2);
                const cumulativeSpacingBetweenModules = (moduleIndex > 0) ? moduleIndex * interModuleSpacing : 0;
                return ((index % 2)
                    ? (((moduleIndex + 1) * moduleHorizontalLength) + (cumulativeSpacingBetweenModules)) - legBuffer.HORIZONTAL_END
                    : (moduleIndex * moduleHorizontalLength) + legBuffer.HORIZONTAL_END + cumulativeSpacingBetweenModules
                );
            },
            index => -legBuffer.UP + (index * (moduleVerticalLength + legBuffer.UP)),
            row.getParent().getParent(),
            0,
            interModuleSpacing,
        );
    }
    else {
        legPosition = getUniformPoints(
            legCount,
            boundingBox,
            legBuffer,
            row.getParent().getParent(),
            legBaseHeight,
        );
    }

    if (backLegsOnly) {
        legPosition = legPosition.slice(0, 1);
    }

    //creating Fixedtilt legposition
    
    if(templateName == 'Fixed Tilt 2500mm'){
        legPosition[0][0]  = getPointInBetweenByLen(legPosition[0][0], legPosition[1][0], UPPER_LEGS);
        legPosition[0][1]  = getPointInBetweenByLen(legPosition[0][1], legPosition[1][1], UPPER_LEGS);
        legPosition[1][0]  = getPointInBetweenByLen(legPosition[1][0], legPosition[0][0], LOWER_LEGS) ;
        legPosition[1][1]  = getPointInBetweenByLen(legPosition[1][1], legPosition[0][1], LOWER_LEGS);  
    }
    return legPosition;
}
function getPointInBetweenByLen(pointA, pointB, length) {

    var dir = pointB.clone().sub(pointA).normalize().multiplyScalar(length);
    return pointA.clone().add(dir);

}

function getLegCount(params) {
    let legCount;
    if (params.legCount) {
        ({ legCount } = params);
    }
    else if (params.footingCount) {
        legCount = params.footingCount;
    }
    else {
        legCount = getNumberOfLegFooting(
            params.numberOfTablesInBoundingBox,
            params.tableSize,
        );
    }
    return legCount;
}

export function computeLegs(params) {
    const {
        boundingBox,
        legBuffer,
        row,
        // TODO: Rename
        topZToLeave,
    } = params;

    const legCount = getLegCount(params);
    const legPosition = getLegPosition(params, legCount);

    const legHeights = [];

    const plane = (new THREE.Plane()).setFromCoplanarPoints(...boundingBox);

    // TODO: Refactor and split
    const angle = utils.deg2Rad(90 - row.getParent().getTilt()); // subarray tilt
    const tiltedDistanceToDecrease = topZToLeave;
    let verticalDistanceToDecrease = tiltedDistanceToDecrease / Math.sin(angle);

    const panelVerticalDirection = boundingBox[0].clone().sub(boundingBox[3]);
    panelVerticalDirection.z = 0;
    const panelVerticalLength = boundingBox[0].distanceTo(boundingBox[3]);

    // HotFix
    legBuffer.VERTICAL_END = (legBuffer.VERTICAL_END === 'ROW_SPACING') ?
        params.subarrayDetails.rowSpacing : legBuffer.VERTICAL_END;
    legBuffer.BACK_LEG_VERTICAL_END = (legBuffer.BACK_LEG_VERTICAL_END === 'ROW_SPACING') ?
        params.subarrayDetails.rowSpacing : legBuffer.BACK_LEG_VERTICAL_END;

    const legLines = [];
    const legTilts = [];
    for (let i = 0; i < legPosition.length; i += 1) {
        const legHeightHorizontal = [];
        for (let j = 0; j < legPosition[i].length; j += 1) {
            // TODO: Refactor and split into different functions
            const end = new THREE.Vector3();
            plane.intersectLine(
                new THREE.Line3(
                    legPosition[i][j],
                    new THREE.Vector3(
                        legPosition[i][j].x,
                        legPosition[i][j].y,
                        // TODO: Jugaad
                        legPosition[i][j].z + 1000,
                    ),
                ),
                end,
            );

            let start;

            if (legBuffer.VERTICAL_END) {
                start = legPosition[i][j].clone().addScaledVector(
                    panelVerticalDirection,
                    legBuffer.VERTICAL_END / panelVerticalLength,
                );
                verticalDistanceToDecrease = 0;
            }
            else {
                start = legPosition[i][j].clone();
            }

            if (i === 0 && legBuffer.BACK_LEG_VERTICAL_END) {
                start = legPosition[i][j].clone().addScaledVector(
                    panelVerticalDirection,
                    legBuffer.BACK_LEG_VERTICAL_END / panelVerticalLength,
                );
            }

            // TODO: MIN_Z and BOTTOM_UP doing the same thing?
            start.z += (legBuffer.MIN_Z) ? legBuffer.MIN_Z : 0;
            legPosition[i][j].z += (legBuffer.MIN_Z) ? legBuffer.MIN_Z : 0;

            if (legBuffer.BOTTOM_UP) {
                start.z += legBuffer.BOTTOM_UP;
            }

            const startToEndDistance = start.distanceTo(end);
            let legHeight = startToEndDistance - verticalDistanceToDecrease;

            if (legBuffer.BACK_LEG_VERTICAL_END) {
                const baseDistance = (new THREE.Vector2(start.x, start.y)).distanceTo(new THREE.Vector2(end.x, end.y));
                const legTilt = Math.acos(baseDistance / legHeight);
                end.lerp(start, (verticalDistanceToDecrease / Math.sin(legTilt)) / (startToEndDistance));
            }
            else {
                end.lerp(start, verticalDistanceToDecrease / startToEndDistance);
            }


            if (legBuffer.TOP_Z) {
                end.lerp(start, legBuffer.TOP_Z);
            }

            const legLine = [
                start,
                end,
            ];
            legLines.push(legLine);

            if (legBuffer.VERTICAL_END || legBuffer.BACK_LEG_VERTICAL_END) {
                const legBaseLength = (new THREE.Vector2(legLine[0].x, legLine[0].y))
                    .distanceTo(new THREE.Vector2(legLine[1].x, legLine[1].y));
                legTilts.push(utils.rad2Deg(Math.acos(legBaseLength / legHeight)));

                const baseDistance = (new THREE.Vector2(start.x, start.y)).distanceTo(new THREE.Vector2(end.x, end.y));
                const perpendicularDistance = Math.sqrt((start.distanceTo(end) ** 2) - (baseDistance ** 2));
                legHeight = perpendicularDistance;
            }
            else {
                legTilts.push(90);
            }
            legHeightHorizontal.push(legHeight);
        }
        legHeights.push(legHeightHorizontal);
    }

    // TODO: In future, remove legPosition and legHeights
    return {
        legPosition,
        legHeights,
        legLines,
        legTilts,
    };
}

export function drawLegs(params, objectsGroup, templateName) {
    const legMaterial = getMeshMaterial(params.legStyle.COLOR, params.legStyle.URL);

    let angle = 90 + findAdjustedAzimuth(params.azimuth);
    angle = angle > 360 ? angle - 360 : angle;

    for (let i = 0; i < params.legLines.length; i += 1) {
        const legMesh = createBox(
            params.legLines[i][0],
            params.legLines[i][1],
            params.legSize.WIDTH,
            params.legSize.LENGTH,
            legMaterial,
            0,
            params.legTilts[i],
            angle,
        );

        legMesh.receiveShadow = true;
        legMesh.castShadow = true;

        legMesh.userData = [templateName, LEG_UTILS];
        objectsGroup.add(legMesh);
    }
}


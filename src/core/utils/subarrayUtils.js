import * as SunCalc from 'suncalc';
import * as THREE from 'three';
import { toDegrees, toRadian, posResetFor2D } from './utils';
import {
    PANEL_ORIENTATION_PORTRAIT,
    PANEL_ORIENTATION_LANDSCAPE,
    DYNAMIC_OFFSET_ITERATION_STEPS,
    ROW_SPACING_MODE_AUTO,
} from '../coreConstants';
import { getPropertiesForSubarrayForAutoFix } from '../structure/utils/structureValidationUtils';
import { getSubarrays } from './exporters';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import Subarray from '../objects/subArray/Subarray';

export function getSolarNoon(latitude, longitude, date = new Date(2019, 11, 21, 12, 0, 0)) {
    return SunCalc.getTimes(date, latitude, longitude).solarNoon;
}

export function getSunPositions(
    latitude,
    longitude,
    startDate = new Date(2019, 11, 21, 9),
    originalEndDate = new Date(2019, 11, 21, 15),
    inSolarTime = true,
    minuteStep = 30,
) {
    /*
        Returns sun's azimuth and zenith in degrees between Start Date and End Date
     */

    let currentDate;
    let endDate;
    if (inSolarTime) {
        const analysisDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            12,
            0,
            0,
        );
        const solarNoon = getSolarNoon(latitude, longitude, analysisDate);
        currentDate = new Date(startDate.getTime() + (solarNoon - analysisDate));
        endDate = new Date(originalEndDate.getTime() + (solarNoon - analysisDate));
    }
    else {
        currentDate = startDate;
        endDate = originalEndDate;
    }

    const sunPositions = [];
    while (endDate >= currentDate) {
        // Suncalc gives azimuth with South as 0 and we need North as 0
        const sunPosition = SunCalc.getPosition(currentDate, latitude, longitude);
        const azimuth = (180 + toDegrees(sunPosition.azimuth)) % 360;
        const zenith = 90 - toDegrees(sunPosition.altitude);

        sunPositions.push([azimuth, zenith]);
        currentDate.setMinutes(currentDate.getMinutes() + minuteStep);
    }

    return sunPositions;
}

export function getTimeBasedRowSpacing(
    subarrayData,
    latitude,
    longitude,
    startDate = new Date(2019, 11, 21, 9),
    endDate = new Date(2019, 11, 21, 15),
    ) {
    //Quick fix for rowSpacing is 0 due to 0 tilt
    if(subarrayData.tilt === 0) {
        return 0.001;
    }
    /*
        Returns end to  start row spacing for a given fixed tilt subarray
        TODO: See how and if to take care of associatedObstacle's tilt
     */
    const sunPositions = getSunPositions(latitude, longitude, startDate, endDate, true, 30);
    const panelLength = subarrayData.panelOrientation === PANEL_ORIENTATION_PORTRAIT
        ? subarrayData.moduleProperties.moduleLength : subarrayData.moduleProperties.moduleWidth;
    const frameHeight = ((subarrayData.tableSizeUp * panelLength) +
        ((subarrayData.tableSizeUp - 1) * subarrayData.moduleSpacingUp))
        * Math.sin(toRadian(subarrayData.tilt));

    const allDistances = [0];
    for (let i = 0; i < sunPositions.length; i += 1) {
        const [sunAzimuth, sunZenith] = sunPositions[i];
        allDistances.push(Math.abs((frameHeight *
            Math.cos(toRadian(sunAzimuth - subarrayData.azimuth))) /
            Math.tan(toRadian(90 - sunZenith))));
    }

    return Math.round(1000 * Math.max(...allDistances)) / 1000;
}

export function getTableCoordinates(
    centerPosition,
    tableSizeUp,
    tableSizeWide,
    panelWidth,
    panelLength,
    azimuth,
    tilt,
    moduleSpacingUp,
    moduleSpacingWide,
    tiltWrtParent,
    bBox = null,
) {
    let directionLeft = new THREE.Vector3();
    let directionUp = new THREE.Vector3();
    if (bBox !== null) {
        directionLeft = bBox[0].clone().sub(bBox[3]);
        directionLeft.normalize();
        directionUp = bBox[0].clone().sub(bBox[1]);
        directionUp.applyAxisAngle(directionLeft, -tiltWrtParent);
        directionUp.normalize();
    }
    else {
        directionUp.setFromSphericalCoords(
            1,
            (90 - tilt) * (Math.PI / 180),
            -azimuth * (Math.PI / 180),
        ); //  tilt's zero is from the base and azimuth is clockwise
        // rotation required because in 2d the Y-axis is upwards not outwards
        directionUp = posResetFor2D(directionUp);

        directionLeft.setFromSphericalCoords(
            1,
            90 * (Math.PI / 180),
            (-azimuth + 90) * (Math.PI / 180),
        );
        // rotation required because in 2d the Y-axis is upwards not outwards
        directionLeft = posResetFor2D(directionLeft);
    }

    const topLeft = new THREE.Vector3(centerPosition[0], centerPosition[1], centerPosition[2]);
    topLeft.addScaledVector(
        directionUp,
        (tableSizeUp * (panelLength / 2)) + ((tableSizeUp - 1) * (moduleSpacingUp / 2)),
    ); // moving up
    topLeft.addScaledVector(
        directionLeft,
        (tableSizeWide * (panelWidth / 2)) + ((tableSizeWide - 1) * (moduleSpacingWide / 2)),
    ); // moving left

    const iteratorDown = topLeft.clone();
    const directionRight = directionLeft.clone().negate();
    const directionDown = directionUp.clone().negate();

    const panelsArr = [];

    for (let tableUp = 1; tableUp <= tableSizeUp; tableUp += 1) {
        const iteratorRight = iteratorDown.clone();
        for (let tableWide = 1; tableWide <= tableSizeWide; tableWide += 1) {
            const panelTopLeft = iteratorRight.clone();
            const panelTopRight = (iteratorRight.clone())
                .addScaledVector(directionRight, panelWidth);
            const panelBottomLeft = (iteratorRight.clone())
                .addScaledVector(directionDown, panelLength);
            const panelBottomRight = (panelTopRight.clone())
                .addScaledVector(directionDown, panelLength);
            // storing in arrays (as required)
            const corners = [];
            corners.push([panelTopRight.x, panelTopRight.y, panelTopRight.z]);
            corners.push([panelTopLeft.x, panelTopLeft.y, panelTopLeft.z]);
            corners.push([panelBottomLeft.x, panelBottomLeft.y, panelBottomLeft.z]);
            corners.push([panelBottomRight.x, panelBottomRight.y, panelBottomRight.z]);
            panelsArr.push({
                id: (tableSizeWide * (tableUp - 1)) + tableWide,
                solarAccess: 0,
                corners,
            });

            iteratorRight.addScaledVector(
                directionRight,
                panelWidth + moduleSpacingWide,
            ); // move right by one panel width and spacing
        }
        iteratorDown.addScaledVector(
            directionDown,
            panelLength + moduleSpacingUp,
        ); // move down by one panel length and spacing
    }
    return panelsArr;
}

export function getRays(
    yOffset,
    tiltWrtParent,
    tableLength,
    rowSpacing,
    walkways,
    bBox,
    bBoxYLength,
) {
    const rays = [];
    const rowWidth = tableLength * Math.cos(tiltWrtParent);
    const direction1 = bBox[1].clone().sub(bBox[0]);
    direction1.normalize();
    const direction2 = bBox[2].clone().sub(bBox[3]);
    direction2.normalize();
    let topRowLine = yOffset;
    let bottomRowLine = yOffset + rowWidth;
    let i = 0;
    while (bottomRowLine <= bBoxYLength) {
        // check for parallel walkways
        while (i < walkways.length &&
            ((topRowLine <= walkways[i].x && bottomRowLine > walkways[i].x &&
                    bottomRowLine <= walkways[i].y) ||
                (topRowLine > walkways[i].x && bottomRowLine <= walkways[i].y) ||
                (topRowLine > walkways[i].x && topRowLine <= walkways[i].y &&
                    bottomRowLine > walkways[i].y) ||
                (topRowLine <= walkways[i].x && bottomRowLine >= walkways[i].y))) {
            topRowLine = walkways[i].y + (0.0005);
            bottomRowLine = topRowLine + rowWidth;
            i += 1;
        }
        rays.push([bBox[0].clone().addScaledVector(direction1, topRowLine),
            bBox[3].clone().addScaledVector(direction2, topRowLine),
            bBox[0].clone().addScaledVector(direction1, bottomRowLine),
            bBox[3].clone().addScaledVector(direction2, bottomRowLine),
        ]);
        topRowLine += (rowWidth + rowSpacing);
        bottomRowLine = topRowLine + rowWidth;
    }
    return rays;
}

export function localToGlobalCoordinates(localCoordinate, bBox, bBoxDimensions) {
    const pointOnEdgeY1 = (new THREE.Vector3()).lerpVectors(
        bBox[0],
        bBox[1],
        localCoordinate.y / bBoxDimensions.yLength,
    );
    const pointOnEdgeY2 = (new THREE.Vector3()).lerpVectors(
        bBox[3],
        bBox[2],
        localCoordinate.y / bBoxDimensions.yLength,
    );
    return (new THREE.Vector3()).lerpVectors(
        pointOnEdgeY1,
        pointOnEdgeY2,
        localCoordinate.x / bBoxDimensions.xLength,
    );
}

export function getRowBox(start, end, top, bottom) {
    // top < bottom in local coordinate system
    return {
        min: new THREE.Vector2(start, top),
        max: new THREE.Vector2(end, bottom),
    };
}

export function getEdgesFromGeometry(geometry) {
    const edges = [];
    for (let geomIdx = 0, length = geometry.getNumGeometries(); geomIdx < length; geomIdx += 1) {
        const polygon = geometry.getGeometryN(geomIdx);
        // eslint-disable-next-line no-underscore-dangle
        const shellVertices = polygon._shell.getCoordinates();
        for (let vertexIdx = 0; vertexIdx < shellVertices.length - 1; vertexIdx += 1) {
            edges.push([shellVertices[vertexIdx], shellVertices[vertexIdx + 1]]);
        }

        // eslint-disable-next-line no-underscore-dangle
        const holes = polygon._holes;
        for (let i = 0; i < holes.length; i += 1) {
            const holeVertices = holes[i].getCoordinates();
            for (let vertexIdx = 0; vertexIdx < holeVertices.length - 1; vertexIdx += 1) {
                edges.push([holeVertices[vertexIdx], holeVertices[vertexIdx + 1]]);
            }
        }
    }
    return edges;
}

export function getTableMapCentroid(tableMap) {
    const centroid = new THREE.Vector3();
    let totalVertices = 0;
    for (let i = 0; i < tableMap.panels.length; i += 1) {
        const panelMap = tableMap.panels[i];
        for (let j = 0; j < panelMap.corners.length; j += 1) {
            const corner = panelMap.corners[j];
            centroid.x += corner[0];
            centroid.y += corner[1];
            centroid.z += corner[2];
            totalVertices += 1;
        }
    }
    return centroid.divideScalar(totalVertices);
}

export function getDynamicOffsetBasedOnArea(area) {
    const areaMarkers = Object.keys(DYNAMIC_OFFSET_ITERATION_STEPS)
        .map(marker => parseFloat(marker));
    let dynamicOffsetDx;
    let dynamicOffsetDy;
    for (let idx = 0; idx < areaMarkers.length; idx += 1) {
        if (area < areaMarkers[idx]) {
            dynamicOffsetDx = DYNAMIC_OFFSET_ITERATION_STEPS[areaMarkers[idx]];
            dynamicOffsetDy = DYNAMIC_OFFSET_ITERATION_STEPS[areaMarkers[idx]];
            break;
        }
    }
    return {
        dynamicOffsetDx,
        dynamicOffsetDy,
    };
}

export function isSimilarSubarrayProperties(s1, s2) {
    if (s1.moduleProperties.moduleId !== s2.moduleProperties.moduleId ||
        s1.moduleProperties.moduleSize !== s2.moduleProperties.moduleSize ||
        s1.moduleProperties.moduleLength !== s2.moduleProperties.moduleLength ||
        s1.moduleProperties.moduleWidth !== s2.moduleProperties.moduleWidth ||
        s1.tilt !== s2.tilt ||
        s1.azimuth !== s2.azimuth ||
        // s1.panelOrientation !== s2.panelOrientation ||
        s1.tableSpacing !== s2.tableSpacing ||
        s1.moduleSpacingUp !== s2.moduleSpacingUp ||
        s1.moduleSpacingWide !== s2.moduleSpacingWide
    ) {
        return false;
    }
    return true;
}

export function getNearestSubarrayForTableSnapping(
    allSubarrayProperties,
    selectedTable,
    tablePosition,
) {
    let selectedSubarray = {
        diff: Infinity,
    };
    for (let i = 0, len = allSubarrayProperties.length; i < len; i += 1) {
        const snappingSubarray = allSubarrayProperties[i].subarray;
        if (snappingSubarray !== selectedTable.getSubarray() &&
        isSimilarSubarrayProperties(
            allSubarrayProperties[i],
            selectedTable.getSubarray().getState(),
        )) {
            // Find the nearest row.
            const bBox = snappingSubarray.getBoundingBox();
            const tableLocalPosition = snappingSubarray
                .globalToLocalCoordinates(tablePosition, bBox);
            const rows = snappingSubarray.getChildren();
            let minYDifference = Infinity;
            let maxY = -Infinity;
            let minY = Infinity;
            let nearestYRows = [];
            for (let rowIdx = 0, { length } = rows; rowIdx < length; rowIdx += 1) {
                const rowYPosition =
                    (rows[rowIdx].getlocalBoundingBox().minY +
                    rows[rowIdx].getlocalBoundingBox().maxY) / 2;
                if (
                    Math.abs(rowYPosition - tableLocalPosition.y) - minYDifference < -0.001
                ) {
                    nearestYRows = [];
                    nearestYRows.push(rows[rowIdx]);
                    minYDifference = Math.abs(rowYPosition - tableLocalPosition.y);
                }
                else if (
                    Math.abs(Math.abs(rowYPosition - tableLocalPosition.y) - minYDifference)
                    < 0.001
                ) {
                    nearestYRows.push(rows[rowIdx]);
                }
                if (rowYPosition < minY) {
                    ({ minY } = rows[rowIdx].getlocalBoundingBox());
                }
                if (rowYPosition > maxY) {
                    ({ maxY } = rows[rowIdx].getlocalBoundingBox());
                }
            }

            let minXDifference = Infinity;
            let selectedRowIdx = 0;
            for (let rowIdx = 0, { length } = nearestYRows; rowIdx < length; rowIdx += 1) {
                const rowBBox = nearestYRows[rowIdx].getlocalBoundingBox();
                const rowXDistance =
                    Math.abs(rowBBox.minX - tableLocalPosition.x) <
                    Math.abs(rowBBox.maxX - tableLocalPosition.x) ?
                        Math.abs(rowBBox.minX - tableLocalPosition.x) :
                        Math.abs(rowBBox.maxX - tableLocalPosition.x);
                if (rowXDistance < minXDifference) {
                    minXDifference = rowXDistance;
                    selectedRowIdx = rowIdx;
                }
            }
            let rowBBox;
            if (nearestYRows[selectedRowIdx] !== undefined && nearestYRows[selectedRowIdx] !== null) {
                rowBBox = nearestYRows[selectedRowIdx].getlocalBoundingBox();
                const diff = Math.sqrt(((((rowBBox.minY + rowBBox.maxY) / 2) - tableLocalPosition.y) *
                    (((rowBBox.minY + rowBBox.maxY) / 2) - tableLocalPosition.y)) +
                    (minXDifference * minXDifference));
                if (diff < selectedSubarray.diff) {
                    selectedSubarray = {
                        diff,
                        snappingSubarray,
                        snappingRowBBox: rowBBox,
                        tableLocalPosition,
                        maxY,
                        minY,
                    };
                }
            }
        }
    }
    return selectedSubarray;
}

// Change to accomodate template
export async function autoFixSubarrayForStructureTemplate(subarray) {
    const notificationObject = subarray.stage.eventManager.setUpdatePanelPlacementLoading();
    const { subarrayProperties, allErrorsFixable } = getPropertiesForSubarrayForAutoFix(
        subarray,
        subarray.structureType,
    );

    if (allErrorsFixable) {
        subarray.stage.stateManager.startContainer();
        // TODO: Promise
        Promise.resolve(subarray.updateObject(subarrayProperties)).then(async (success) => {
            if (success) {
                if (subarray.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
                    await subarray.updateObject({ rowSpacing: subarray.getOptimisedRowSpacing() });
                }
                subarray.stage.eventManager.setObjectsSelected(subarray);
                subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                subarray.stage.stateManager.stopContainer();
            }
            else {
                subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
                notificationsAssistant.error({
                    title: 'Update Properties',
                    message: 'Error updating subarray properties. Subarray deleted.',
                });
                subarray.stage.stateManager.stopContainer();
            }
        });
    }
    else {
        subarray.stage.eventManager.completeUpdatePanelPlacementLoading(notificationObject);
        notificationsAssistant.info({
            title: 'Subarray property updates',
            message: 'Some properties could not be autofixed and would need to be manually fixed.',
        });
    }
}

export function getAllModuleQuantity(stage) {
    const result = [];
    getSubarrays(stage.ground, result);
    let totalPanels = 0;
    for (let i = 0, l = result.length; i < l; i += 1) {
        totalPanels += result[i].getNumberOfPanels();
    }
    return totalPanels;
}

export function isCommonSubarrayProperties(s1, s2) {
    if (s1.moduleProperties.moduleId !== s2.moduleProperties.moduleId ||
        s1.moduleProperties.moduleSize !== s2.moduleProperties.moduleSize ||
        s1.moduleProperties.moduleLength !== s2.moduleProperties.moduleLength ||
        s1.moduleProperties.moduleWidth !== s2.moduleProperties.moduleWidth ||
        s1.tilt !== s2.tilt ||
        s1.azimuth !== s2.azimuth ||
        s1.panelOrientation !== s2.panelOrientation ||
        s1.tableSpacing !== s2.tableSpacing ||
        s1.moduleSpacingUp !== s2.moduleSpacingUp ||
        s1.moduleSpacingWide !== s2.moduleSpacingWide
    ) {
        return false;
    }
    return true;
}

export function getCommonSubarray(object) {
    const allSubarray = object.getChildren().filter(sibling => sibling instanceof Subarray);
    const common2DSubarray = [];
    while (allSubarray.length > 0) {
        const tempCommon = [];
        const indexes = [];
        let count = 0;
        tempCommon.push(allSubarray[0]);
        allSubarray.splice(0, 1);
        for (let i = 0; i < allSubarray.length; i++) {
            if (isCommonSubarrayProperties(tempCommon[0], allSubarray[i])
                && allSubarray[i] !== undefined) {
                tempCommon.push(allSubarray[i]);
                indexes.push(i);
                count++;
            }
        }
        if (indexes.length > 0) {
            for (let j = count - 1; j >= 0; j--) {
                allSubarray.splice(indexes[j], 1);
            }
        }
        common2DSubarray.push(tempCommon);
    }
    return common2DSubarray;
}

// In this function we are taking two panels panel1 and panel2
// and bool ispanel to check if we have to check panel is beside each other
// and bool column to check if we have to check panel is in the same column or row
/**
 * @param {*Panel} panel1
 * @param {*Panel} panel2
 * @param {*bool} isPanel
 * @param {*bool} column
 * @returns bool if panel is beside other according to condition
 */
export function isBeside(panel1, panel2, isPanel = false, column = false) {
    const subarray = panel1.panel.getSubarray();

    // local co-ordinates distance between panels
    const localDist = (panel1.localPosition).distanceTo(panel2.localPosition).toFixed(3);

    // actaul distance between panels when they are portrait
    const actualDistPortRow = (subarray.moduleProperties.moduleWidth + subarray.tableSpacing);
    const actualDistPortCol = (subarray.moduleProperties.moduleLength + subarray.rowSpacing);

    // delta distance between local and actual when they are portrait
    const portraitDistanceRow = localDist - actualDistPortRow;
    const portraitDistanceCol = localDist - actualDistPortCol;

    // actaul distance between panels when they are landscape
    const actualDistLandRow = (subarray.moduleProperties.moduleLength + subarray.tableSpacing);
    const actualDistLandCol = (subarray.moduleProperties.moduleWidth + subarray.rowSpacing);

    // delta distance between local and actual when they are landscape
    const landscapeDistanceRow = localDist - actualDistLandRow;
    const landscapeDistanceCol = localDist - actualDistLandCol;

    if (column) {
        if (isPanel) {
            // portrait panels
            if (
                Math.abs(portraitDistanceCol) < 0.01 &&
                subarray.panelOrientation === PANEL_ORIENTATION_PORTRAIT
            ) {
                return true;
            }
            // landscape panels
            else if (
                Math.abs(landscapeDistanceCol) < 0.01 &&
                subarray.panelOrientation === PANEL_ORIENTATION_LANDSCAPE
            ) {
                return true;
            }
            return false;
        }
        else if (Math.abs(panel1.localPosition.x - panel2.localPosition.x) < 0.01) {
            return true;
        }
    }
    else if (isPanel) {
        if (
            Math.abs(portraitDistanceRow) < 0.01 &&
            subarray.panelOrientation === PANEL_ORIENTATION_PORTRAIT
        ) {
            return true;
        }
        // landscape panels
        else if (
            Math.abs(landscapeDistanceRow) < 0.01 &&
            subarray.panelOrientation === PANEL_ORIENTATION_LANDSCAPE
        ) {
            return true;
        }
        return false;
    }
    else if (Math.abs(panel1.localPosition.y - panel2.localPosition.y) < 0.01) {
        return true;
    }
    return false;
}

export function getCommonRows(allRow, { flag = false, col = false }) {
    const row = [];
    while (allRow.length > 0) {
        const tempRow = [];
        const tempCommon = [];
        const indexes = [];
        let count = 0;
        tempCommon.push(allRow[0]);
        tempRow.push(allRow[0].panel);
        allRow.splice(0, 1);
        for (let i = 0; i < allRow.length; i++) {
            if (isBeside(tempCommon[tempCommon.length - 1], allRow[i], flag, col)
                && allRow[i] !== undefined) {
                tempCommon.push(allRow[i]);
                tempRow.push(allRow[i].panel);
                indexes.push(i);
                count++;
            }
        }
        if (indexes.length > 0) {
            for (let j = count - 1; j >= 0; j--) {
                allRow.splice(indexes[j], 1);
            }
        }
        if (flag) {
            row.push(tempRow);
        }
        else {
            row.push(tempCommon);
        }
    }
    return row;
}

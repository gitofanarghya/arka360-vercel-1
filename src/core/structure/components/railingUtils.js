import * as THREE from 'three';

import {
    areLinesCollinear,
    computeNumberOfTablesInBoundingBox,
    getUniformPoints,
    createBox,
    findAdjustedAzimuth,
    getCustomUniformPoints,
} from '../utils/mathUtils';
import { getEdgeMaterial, getMeshMaterial } from '../utils/drawingUtils';
import { deg2Rad } from '../../utils/utils';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import { RAILING_UTILS } from '../constants';

function getInterSectionPointOnLine(line, point) {
    const normalZ = new THREE.Vector3(0, 1, 0);
    const raycaster = new THREE.Raycaster(point, normalZ);
    const intersects = raycaster.intersectObject(line, true);

    return intersects[0].point;
}

// Method returns a line perpendicular to the given azimuth using any row of the subArray
function getPerpendicularLineForHashing(boundingBoxes, objectsGroup) {
    const LINE_ACCURACY = 20;
    const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

    // Creating a line from Given Bbox
    const points = [];

    // Extending the Line
    points.push(new THREE.Vector3(
        boundingBoxes[0][0][0].x + LINE_ACCURACY,
        boundingBoxes[0][0][0].y,
        boundingBoxes[0][0][2].z,
    ));
    points.push(new THREE.Vector3(
        boundingBoxes[0][0][0].x - LINE_ACCURACY,
        boundingBoxes[0][0][0].y,
        boundingBoxes[0][0][2].z,
    ));

    // Creating the specified line with the material
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const perpendicularLine = new THREE.Line(geometry, material);

    // Adding to the scene
    objectsGroup.add(perpendicularLine);

    return { perpendicularLine, points };
}

function getAllRailingLinesBetweenPanels(
    boundingBoxes,
    rows,
    subarrayDetails,
    railingBuffer,
    railingHeight,
    railingCountFunction = null,
    alignPillarToBottom = false,
) {
    const lines = [];
    for (let i = 0; i < rows.length; i += 1) {
        if (boundingBoxes[i]) {
            for (let j = 0; j < boundingBoxes[i].length; j += 1) {
                const row = rows[i];
                const boundingBox = boundingBoxes[i][j];
                
                const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                    subarrayDetails,
                    boundingBox,
                );
                let railingCount;
                if (!railingCountFunction) {
                    railingCount = {
                        up: 2,
                        wide: (numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) + 1,
                    };
                }
                else {
                    railingCount = railingCountFunction(numberOfTablesInBoundingBox, subarrayDetails);
                }
    
                const railingPosition = getUniformPoints(
                    railingCount,
                    boundingBox,
                    railingBuffer,
                    row.getParent().getParent(),
                );

                for (let k = 0; k < railingPosition[0].length; k += 1) {
                    const point1 = railingPosition[0][k].clone();
                    const point2 = railingPosition[1][k].clone();
                    point1.z += railingHeight / 2;
                    point2.z += railingHeight / 2;

                    const rowSpacingPercentage =
                        subarrayDetails.rowSpacing / point1.distanceTo(point2);
    
                    let rowSpacingAdjustedPoint1;
                    let rowSpacingAdjustedPoint2;
    
                    if (alignPillarToBottom) {
                        rowSpacingAdjustedPoint1 = point1.clone().lerp(point2, -rowSpacingPercentage);
                        rowSpacingAdjustedPoint2 = point2;
                    }
                    else {
                        rowSpacingAdjustedPoint2 =
                            point1.clone().lerp(point2, 1 + (rowSpacingPercentage / 2));
                        rowSpacingAdjustedPoint1 =
                            point1.clone().lerp(point2, -rowSpacingPercentage / 2);
                    }
                    lines.push([rowSpacingAdjustedPoint1, rowSpacingAdjustedPoint2]);
                }
            }
        }
    }
    return lines;
}

function getAllRailingLines(
    boundingBoxes,
    rows,
    subarrayDetails,
    railingBuffer,
    railingHeight,
    moduleHorizontalLength,
    moduleVerticalLength,
) {
    const lines = [];
    const interModuleSpacing = subarrayDetails.tableSpacing;
    const moduleVerticalLengthWithTilt =
        moduleVerticalLength * Math.cos(deg2Rad(subarrayDetails.tilt));

    for (let i = 0; i < rows.length; i += 1) {
        if (boundingBoxes[i]) {
            for (let j = 0; j < boundingBoxes[i].length; j += 1) {
                const row = rows[i];
                const boundingBox = boundingBoxes[i][j];
    
                const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                    subarrayDetails,
                    boundingBox,
                );
                const numberOfPanelsInBoundingBox =
                    numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide;
                // If the railing wide buffer is not 0, then that means that a railing is not shared by two panels
                const railingCount = {
                    up: 2,
                    wide: (railingBuffer.WIDE !== 0) ? numberOfPanelsInBoundingBox * 2 : numberOfPanelsInBoundingBox + 1,
                };

                const railingPosition = getCustomUniformPoints(
                    railingCount,
                    boundingBox,
                    (index) => {
                        const moduleIndex = Math.floor(index / 2);
                        const cumulativeSpacingBetweenModules = (moduleIndex > 0) ? moduleIndex * interModuleSpacing : 0;
                        return ((index % 2)
                            ? (((moduleIndex + 1) * moduleHorizontalLength) + (cumulativeSpacingBetweenModules)) - railingBuffer.HORIZONTAL_END
                            : (moduleIndex * moduleHorizontalLength) + railingBuffer.HORIZONTAL_END + cumulativeSpacingBetweenModules
                        );
                    },
                    index => ((index - 1) * subarrayDetails.rowSpacing) + (index * moduleVerticalLength),
                    row.getParent().getParent(),
                    0,
                    interModuleSpacing,
                );
    
                if (!railingPosition) {
                    boundingBoxes.splice(i, 1);
                    i -= 1;
                    // notificationsAssistant.error({
                    //     title: 'Structure',
                    //     message: `Error creating Structures for Subarray ID#${row.getParent().getId()}. Structure is Outside Model.`,
                    // });
                    // throw new Error('Structure is outside the model');
                    break;
                }
                // lines.push(...railingPosition[0],...railingPosition[1])
                for (let k = 0; k < railingPosition[0].length; k += 1) {
                    const point1 = railingPosition[0][k].clone();
                    const point2 = railingPosition[1][k].clone();
                    point1.z += railingHeight / 2;
                    point2.z += railingHeight / 2;
    
                    if (railingBuffer.BOTTOM_UP) {
                        point1.z += railingBuffer.BOTTOM_UP;
                        point2.z += railingBuffer.BOTTOM_UP;
                    }
                    lines.push([point1, point2]);
                }
            }
        }
    }
    return lines;
}

// Method to combine lines using a hash table
function combineLinesWithHashTable(lines, maximumAllowedDistance, boundingBoxes, objectsGroup) {
    // Setting Accuracy for proper value of the hash table constant
    const ACCURACY = 1000; // milimeter accuracy

    // Defining the hash table
    const colinearLineHash = {};
    const numberOfLinesCombined = [];

    // Get the line perpendicular to the azimuth joining any bbox for any given row
    const data = getPerpendicularLineForHashing(boundingBoxes, objectsGroup);

    // loop through all the lines provided
    // Complexity should be O(n)
    for (let i = 0; i < lines.length; i++) {
        // Project this point on the perpendicular line
        const projectedPoint = getInterSectionPointOnLine(data.perpendicularLine, lines[i][0]);

        // Calculating the value of the intersection done by the projectedPoint
        const t = projectedPoint.distanceTo(data.points[0]) / data.points[0].distanceTo(data.points[1]);
        const c = Math.round((t * ACCURACY + Number.EPSILON) * 10) / 10;

        // Adding colinear points at the same hash table index
        if (colinearLineHash[c]) {
            colinearLineHash[c].push(lines[i]);
        }
        else if (colinearLineHash[c - 0.1]) {
            colinearLineHash[c - 0.1].push(lines[i]);
        }
        else if (colinearLineHash[c + 0.1]) {
            colinearLineHash[c + 0.1].push(lines[i]);
        }
        else {
            colinearLineHash[c] = [];
            colinearLineHash[c].push(lines[i]);
        }
    }

    // Combining the lines --
    for (let i = 0; i < colinearLineHash.length; i += 1) {
        let numberOfLinesCombinedInCurrentLine = 1;

        for (let j = 0; j < colinearLineHash[i].length; j += 1) {
            // Continue Min distance logic here
            let currentInitialPointLine = collinearLineHash[i][0];
            const minDistance = Math.min(
                colinearLineHash[i][j + 1][0].distanceTo(colinearLineHash[i][j][1]),
                colinearLineHash[i][j + 1][1].distanceTo(colinearLineHash[i][j][0]),
            );

            // Check for min dist
            if (minDistance > maximumAllowedDistance) {
                if (currentInitialPointLine[0].distanceTo(colinearLineHash[i][j][1]) >
                    currentInitialPointLine[1].distanceTo(colinearLineHash[i][j][0])) {
                    combinedLines.push([
                        currentInitialPointLine[0],
                        collinearLines[i][j][1],
                    ]);
                }
                else {
                    combinedLines.push([
                        colinearLineHash[i][j][0],
                        currentInitialPointLine[1],
                    ]);
                }
                currentInitialPointLine = colinearLineHash[i][j - 1];

                // This logic isn't required, calculate directly from hash map, tbc tommorow
                numberOfLinesCombined.push(numberOfLinesCombinedInCurrentLine);
                numberOfLinesCombinedInCurrentLine = 1;
            }

            else {
                numberOfLinesCombinedInCurrentLine += 1;
            }
        }
    }
    return { combinedLines, numberOfLinesCombined };
}


function combineLines(lines, maximumAllowedDistance) {
    const collinearLines = [];
    for (let i = 0; i < lines.length; i += 1) {
        let collinearLineExists = false;
        for (let j = 0; j < collinearLines.length; j += 1) {
            if (areLinesCollinear(lines[i], collinearLines[j][0])) {
                collinearLines[j].push(lines[i]);
                collinearLineExists = true;
                break;
            }
        }
        if (!collinearLineExists) {
            collinearLines.push([lines[i]]);
        }
    }

    const combinedLines = [];
    const numberOfLinesCombined = [];

    for (let i = 0; i < collinearLines.length; i += 1) {
        let currentInitialPointLine = collinearLines[i][0];
        let numberOfLinesCombinedInCurrentLine = 1;

        for (let j = 1; j < collinearLines[i].length; j += 1) {
            const minDistance = Math.min(
                collinearLines[i][j][0].distanceTo(collinearLines[i][j - 1][1]),
                collinearLines[i][j][1].distanceTo(collinearLines[i][j - 1][0]),
            );

            if (minDistance > maximumAllowedDistance) {
                if (currentInitialPointLine[0].distanceTo(collinearLines[i][j - 1][1]) >
                    currentInitialPointLine[1].distanceTo(collinearLines[i][j - 1][0])) {
                    combinedLines.push([
                        currentInitialPointLine[0],
                        collinearLines[i][j - 1][1],
                    ]);
                }
                else {
                    combinedLines.push([
                        collinearLines[i][j - 1][0],
                        currentInitialPointLine[1],
                    ]);
                }
                currentInitialPointLine = collinearLines[i][j];

                numberOfLinesCombined.push(numberOfLinesCombinedInCurrentLine);
                numberOfLinesCombinedInCurrentLine = 1;
            }
            else {
                numberOfLinesCombinedInCurrentLine += 1;
            }
        }

        if (currentInitialPointLine[0].distanceTo(collinearLines[i][collinearLines[i].length - 1][1]) <
            currentInitialPointLine[1].distanceTo(collinearLines[i][collinearLines[i].length - 1][0])) {
            combinedLines.push([
                currentInitialPointLine[1],
                collinearLines[i][collinearLines[i].length - 1][0],
            ]);
        }
        else {
            combinedLines.push([
                currentInitialPointLine[0],
                collinearLines[i][collinearLines[i].length - 1][1],
            ]);
        }
        numberOfLinesCombined.push(numberOfLinesCombinedInCurrentLine);
    }

    return {
        combinedLines,
        numberOfLinesCombined,
    };
}

function computeSupports(lines, railingHeight, railingBuffer) {
    // TODO : This will be changed after the doubts are cleared from tata about the position of support location.
    const bottomUp = railingBuffer.BOTTOM_UP;
    const supports = [];
    for (let i = 0; i < lines.length; i += 1) {
        const rafterStart = lines[i][1].clone();
        const rafterEnd = lines[i][0].clone();
        const dirVector = new THREE.Vector3();
        dirVector.subVectors(rafterEnd, rafterStart).normalize();

        const point1 = rafterStart.addScaledVector(dirVector, 0.15);

        let supportBlockTop = new THREE.Vector3(point1.x, point1.y, point1.z - (railingHeight / 2));
        let supportBlockBottom = new THREE.Vector3(point1.x, point1.y, point1.z - ((railingHeight / 2) + bottomUp));

        supports.push([supportBlockTop, supportBlockBottom]);

        const point2 = rafterStart.addScaledVector(dirVector, 1.15);

        supportBlockTop = new THREE.Vector3(point2.x, point2.y, point2.z - (railingHeight / 2));
        supportBlockBottom = new THREE.Vector3(point2.x, point2.y, point2.z - ((railingHeight / 2) + bottomUp));

        supports.push([supportBlockTop, supportBlockBottom]);
    }
    return supports;
}

export function computeRailings(params) {
    const {
        boundingBoxes,
        railingHeight,
        rows,
        railingBuffer,
        drawRailingSupport,
        subarrayDetails,
        maximumAllowedDistance,
        railingCountFunction,
        alignPillarToBottom,
        objectsGroup,
    } = params;

    let lines;
    if (railingBuffer.WIDE === 0) {
        lines = getAllRailingLinesBetweenPanels(
            boundingBoxes,
            rows,
            subarrayDetails,
            railingBuffer,
            railingHeight,
            railingCountFunction,
            alignPillarToBottom,
            objectsGroup,
        );
    }
    else {
        lines = getAllRailingLines(
            boundingBoxes,
            rows,
            subarrayDetails,
            railingBuffer,
            railingHeight,
            subarrayDetails.moduleHorizontalLength,
            subarrayDetails.moduleVerticalLength,
        );
    }

    const {
        combinedLines, numberOfLinesCombined,
    } = combineLines(lines, maximumAllowedDistance);

    let railingSupports = [];
    if (drawRailingSupport) {
        railingSupports = computeSupports(lines, railingHeight, railingBuffer);
    }

    return {
        railingLines: combinedLines,
        numberOfLinesCombined,
        railingSupports,
    };
}

export function drawRailings(params, objectsGroup, templateName) {
    const railingMaterial = getMeshMaterial(params.railingStyle.COLOR, params.railingStyle.URL);

    let angle = 90 + findAdjustedAzimuth(params.azimuth);
    angle = angle > 360 ? angle - 360 : angle;

    for (let lineIndex = 0; lineIndex < params.railingLines.length; lineIndex += 1) {
        const line = params.railingLines[lineIndex];

        const box = createBox(
            line[0],
            line[1],
            params.railingSize.WIDTH,
            params.railingSize.HEIGHT - params.drawingBuffer,
            railingMaterial,
            0,
            0,
            angle,
        );

        box.userData = [templateName, RAILING_UTILS];
        objectsGroup.add(box);
    }

    const supports = params.railingSupports;
    for (let supportIndex = 0; supportIndex < supports.length; supportIndex += 1) {
        const supportBlockPoints = supports[supportIndex];
        const supportBlock = createBox(
            supportBlockPoints[0],
            supportBlockPoints[1],
            params.railingSize.WIDTH,
            params.railingBuffer.BOTTOM_UP,
            railingMaterial,
            0,
            0,
            angle,
        );

        supportBlock.userData = [templateName, RAILING_UTILS];
        objectsGroup.add(supportBlock);
    }
}

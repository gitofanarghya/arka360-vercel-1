import * as THREE from 'three';
import * as utils from '../../utils/utils';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';
import { getAllObjectsBelowPoint } from '../../utils/raycastingUtils';
import PolygonModel from '../../objects/model/PolygonModel';
import CylinderModel from '../../objects/model/CylinderModel';
import Ground from '../../objects/ground/Ground';

function calculatePercentageArray(
    startDifference,
    endDifference,
    noOfPoints,
    horizontalBuffer = 0,
) {
    // TODO: Find a better way?
    if (noOfPoints === 1) {
        return [0.5];
    }
    const points = [];
    const total = 1 - (startDifference + endDifference);
    let currentPoint = startDifference;
    for (let i = 0; i < noOfPoints; i += 1) {
        points.push(currentPoint);
        currentPoint += total / (noOfPoints - 1);
    }
    points[0] += horizontalBuffer;
    points[points.length - 1] -= horizontalBuffer;

    return points;
}

function calculatePercentageArrayForBallastTypes( // ! This is the new function
    startDifference,
    endDifference,
    noOfPoints,
    horizontalBuffer = 0,
) {
    const firtstLeg = startDifference * 2;
    const gap = (2 / noOfPoints) - (2 * firtstLeg);

    const points = [];
    points.push(firtstLeg);
    let newLeg = firtstLeg;

    for (let i = 1; i <= (noOfPoints / 2); i += 1) {
        newLeg += gap;
        points.push(newLeg); // ? Module spacing not required?
        newLeg += (2 * firtstLeg);
        points.push(newLeg);
    }
    return points;
}

export function getCustomUniformPoints(
    count,
    boundingBox,
    horizontalPositionCallback,
    verticalPositionCallback,
    parentModel,
    baseZ = 0,
    interModuleSpacing = 0,
) {

    const horizontalWidth = boundingBox[0].distanceTo(boundingBox[1]);
    const verticalLength = boundingBox[0].distanceTo(boundingBox[3]);

    const pointsArray = [];
    for (let i = 0; i < count.up; i += 1) {
        const verticalPercentage = verticalPositionCallback(i) / verticalLength;

        const point1 = new THREE.Vector3().lerpVectors(
            boundingBox[0],
            boundingBox[3],
            verticalPercentage,
        );
        let point2 = new THREE.Vector3().lerpVectors(
            boundingBox[1],
            boundingBox[2],
            verticalPercentage,
        );
        const horizontalPoints = [];
        for (let j = 0; j < count.wide; j += 1) {
            const horizontalPercentage = horizontalPositionCallback(j) / horizontalWidth;
            const point = new THREE.Vector3().lerpVectors(
                point1,
                point2,
                horizontalPercentage,
            );
            point.setZ(parentModel.getZOnTopSurface(point.x, point.y) + baseZ);

            // HotFix
            // TODO: Refactor
           // const models = getAllObjectsBelowPoint(point, parentModel.stage);
           // let model = models[0][0];
            if (!(utils.checkPointInsideVertices(parentModel.get2DVertices(), [point.x, point.y]))) {
                return null;
            } 
            else {
                horizontalPoints.push(point);
            }
            // for (let k = 0; k < models.length; k += 1) {
            //     if ((models[k][0] instanceof PolygonModel || models[k][0] instanceof CylinderModel ||
            //         models[k][0] instanceof Ground) && !models[k][0].isIgnored()) {
            //         [model] = models[k];
            //         break;
            //     }
            // }
            // if (model === parentModel) {
            //     horizontalPoints.push(point);
            // }
            // else {
            //     return null;
            // }
        }

        if (horizontalPoints.length !== 0) {
            pointsArray.push(horizontalPoints);
        }
    }

    return pointsArray;
}

export function isBoundingBoxOutsideParentModel(boundingBox, parentModel) {
    for (let i = 0; i < boundingBox.length; i += 1) {
        const models = getAllObjectsBelowPoint(boundingBox[i], parentModel.stage);
        let model = models[0][0];
        for (let k = 0; k < models.length; k += 1) {
            if ((models[k][0] instanceof PolygonModel || models[k][0] instanceof CylinderModel ||
                models[k][0] instanceof Ground) && !models[k][0].isIgnored()) {
                [model] = models[k];
                break;
            }
        }
        if (model !== parentModel) {
            return true;
        }
    }
    return false;
}

export function isAnyBoundingBoxOutsideParentModel(boundingBoxes, parentModel) {
    for (let i = 0; i < boundingBoxes.length; i += 1) {
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            if (isBoundingBoxOutsideParentModel(boundingBoxes[i][j], parentModel)) {
                return true;
            }
        }
    }
    return false;
}

export function getUniformPoints(
    count,
    boundingBox,
    buffer,
    parentModel,
    baseZ = 0,
    interModuleSpacing,
) {
    const horizontalWidth = boundingBox[0].distanceTo(boundingBox[1]);
    const horizontalBufferPercentage = buffer.WIDE / horizontalWidth;
    const horizontalFirstBufferPercentage = buffer.HORIZONTAL_END / horizontalWidth;
    const horizontalLastBufferPercentage = buffer.HORIZONTAL_END / horizontalWidth;

    const verticalLength = boundingBox[0].distanceTo(boundingBox[3]);
    const verticalBufferPercentage = buffer.UP / verticalLength;
    let horizontalPercentageArray; // ! Is using 'let' instead of 'const' okay?
    // ! Is this okay?
    if (buffer.LEG_POSITION_SHIFT) {
        horizontalPercentageArray = calculatePercentageArrayForBallastTypes(
            horizontalBufferPercentage,
            horizontalBufferPercentage,
            Math.round(count.wide),
            horizontalFirstBufferPercentage,
            horizontalLastBufferPercentage,
        );
    }

    else {
        horizontalPercentageArray = calculatePercentageArray(
            horizontalBufferPercentage,
            horizontalBufferPercentage,
            count.wide,
            horizontalFirstBufferPercentage,
            horizontalLastBufferPercentage,
        );
    }

    const verticalPercentageArray = calculatePercentageArray(
        verticalBufferPercentage,
        verticalBufferPercentage,
        count.up,
    );


    const pointsArray = [];
    for (let i = 0; i < count.up; i += 1) {
        const point1 = new THREE.Vector3().lerpVectors(
            boundingBox[0],
            boundingBox[3],
            verticalPercentageArray[i],
        );
        const point2 = new THREE.Vector3().lerpVectors(
            boundingBox[1],
            boundingBox[2],
            verticalPercentageArray[i],
        );
        const horizontalPoints = [];
        for (let j = 0; j < count.wide; j += 1) {
            const point = new THREE.Vector3().lerpVectors(
                point1,
                point2,
                horizontalPercentageArray[j],
            );
            point.setZ(parentModel.getZOnTopSurface(point.x, point.y) + baseZ);

            // HotFix
            // TODO: Refactor
            // const models = getAllObjectsBelowPoint(point, parentModel.stage);
            // let model = models[0][0];
            if (!(utils.checkPointInsideVertices(parentModel.get2DVertices(), [point.x, point.y]))) {
                break;
            }
            else {
                horizontalPoints.push(point);
            }
            // for (let k = 0; k < models.length; k += 1) {
            //     if ((models[k][0] instanceof PolygonModel || models[k][0] instanceof CylinderModel ||
            //         models[k][0] instanceof Ground) && !models[k][0].isIgnored()) {
            //         [model] = models[k];
            //         break;
            //     }
            // }
            // if (model === parentModel) {
            //     horizontalPoints.push(point);
            // }
        }

        if (horizontalPoints.length !== 0) {
            pointsArray.push(horizontalPoints);
        }
    }
    return pointsArray;
}

// TODO: Refactor this and move this to drawingUtils
export function createBox(point1, point2, height, length, material, angleX, angleY, angleZ) {
    const center = new THREE.Vector3(
        (point1.x + point2.x) / 2,
        (point1.y + point2.y) / 2,
        (point1.z + point2.z) / 2,
    );

    const boxGeometry = new THREE.BoxGeometry(point1.distanceTo(point2), height, length);
    const box = new THREE.Mesh(boxGeometry, material);
    box.matrixAutoUpdate = true;

    box.rotateZ(utils.deg2Rad(angleZ));
    box.rotateX(utils.deg2Rad(angleX));
    box.rotateY(utils.deg2Rad(angleY));

    box.position.set(center.x, center.y, center.z);

    return box;
}

export function crossProduct(vec1, vec2) {
    return new THREE.Vector3(
        (vec1.y * vec2.z) - (vec2.y * vec1.z),
        (vec1.x * vec2.z) - (vec2.x * vec1.z),
        (vec1.x * vec2.y) - (vec2.x * vec1.y),
    );
}

export function getZOnPlane(planeEquation, x, y) {
    return (((-x * planeEquation[0]) - (y * planeEquation[1])) + planeEquation[3]) /
    planeEquation[2];
}

export function getNumberOfLegFooting(numberOfTablesInRow, tableSize) {
    const rowSizeWide = tableSize.wide * numberOfTablesInRow;
    const rowSizeUp = tableSize.up;

    const numberOfFootingsUp = Math.round(((rowSizeUp - 1) / 3) + 2);

    let numberOfFootingsWide = -1;
    const conditionsArray = [3, 7, 10, 12, 14];
    const numberWideValues = [2, 3, 4, 5, 6, 7];
    for (let i = 0; i < conditionsArray.length; i += 1) {
        if (rowSizeWide <= conditionsArray[i]) {
            numberOfFootingsWide = numberWideValues[i];
            break;
        }
    }
    if (numberOfFootingsWide === -1) {
        numberOfFootingsWide = numberWideValues[numberWideValues.length - 1];
    }

    return { up: numberOfFootingsUp, wide: numberOfFootingsWide };
}

export function findEquationOfPlane(point1, point2, point3) {
    const perpendicularVector = crossProduct(
        new THREE.Vector3(point1.x - point2.x, point1.y - point2.y, point1.z - point2.z),
        new THREE.Vector3(point2.x - point3.x, point2.y - point3.y, point2.z - point3.z),
    );
    // In the form Ax + By + Cz = d
    const plane = [
        perpendicularVector.x,
        -perpendicularVector.y,
        perpendicularVector.z,
        (perpendicularVector.x * point2.x) +
        (-perpendicularVector.y * point2.y) + (perpendicularVector.z * point2.z),
    ];

    return plane;
}

export function findAdjustedAzimuth(azimuth) {
    let correctAzimuth = 180 - azimuth;
    correctAzimuth = correctAzimuth < 0 ? correctAzimuth + 360 : correctAzimuth;
    return correctAzimuth;
}

// JUGAAD
export function computeNumberOfTablesInBoundingBox(subarrayDetails, boundingBox) {
    const moduleWidth = (subarrayDetails.orientation === PANEL_ORIENTATION_PORTRAIT) ?
        subarrayDetails.moduleDimensions.width : subarrayDetails.moduleDimensions.length;

    const width = boundingBox[0].distanceTo(boundingBox[1]);
    const tableLength = (subarrayDetails.tableSize.wide * moduleWidth) +
    ((subarrayDetails.tableSize.wide - 1) * subarrayDetails.moduleSpacing.wide);
    const numberOfTables = Math.round((width + subarrayDetails.tableSpacing) /
    (subarrayDetails.tableSpacing + tableLength));
    return numberOfTables;
}

export function getBuffer(subarrayDetails, templateBuffer) {
    let buffer;
    const { orientation, moduleDimensions } = subarrayDetails;
    if (orientation === PANEL_ORIENTATION_PORTRAIT) {
        buffer = {
            WIDE: templateBuffer.WIDE,
            UP: templateBuffer.UP * moduleDimensions.length,
        };
    }
    else {
        buffer = {
            WIDE: templateBuffer.WIDE,
            UP: templateBuffer.UP * moduleDimensions.width,
        };
    }

    // Copying other buffer values
    buffer = Object.assign(buffer, templateBuffer);

    return buffer;
}

export function areLinesCollinear(line1, line2) {
    return Math.abs(line1[0].distanceTo(line2[0]) -
        (line1[0].distanceTo(line1[1]) + line1[1].distanceTo(line2[0]))) <= 0.0001 ||
        Math.abs(line2[0].distanceTo(line1[0]) -
        (line2[0].distanceTo(line2[1]) + line2[1].distanceTo(line1[0]))) <= 0.0001;
}

export function requireJump(panel, previousPanel, distance, panelWidth, panelHeight) {
    const moduleSpacingUp = panel.getSubarray().moduleSpacingUp;
    const moduleSpacingWide = panel.getSubarray().moduleSpacingWide;
    const tableSpacing = panel.getSubarray().tableSpacing;

    if (panel.parent.parent !== previousPanel.parent.parent) {
        return true;
    }
    if (panel.getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        if (panel.parent.id === previousPanel.parent.id) {
            if (Math.abs(panel.id - previousPanel.id) === 1) {
                if (panelWidth + moduleSpacingWide < distance) {
                    return true;
                }
            }
            else if (panelHeight + moduleSpacingUp < distance) {
                return true;
            }
        }
        else if (panelWidth + tableSpacing < distance) {
            return true;
        }
    }
    else if (panel.parent.id === previousPanel.parent.id) {
        if (Math.abs(panel.id - previousPanel.id) === 1) {
            if (panelHeight + moduleSpacingWide < distance) {
                return true;
            }
        }
        else if (panelWidth + moduleSpacingUp < distance) {
            return true;
        }
    }
    else if (panelHeight + tableSpacing < distance) {
        return true;
    }
    return false;
}
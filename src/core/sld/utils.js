/* eslint-disable radix */
/* eslint-disable import/first */
/* eslint-disable no-use-before-define */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-mixed-operators */
/* eslint-disable one-var */
/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import * as makerjs from 'makerjs';
import { DashedLine } from './componentUtils';
import * as THREE from 'three';
import API from '@/services/api/';
import { getUniqueModuleIdWithCount } from '../utils/inverterUtils';
import { createTextElement } from './sldUtils';
import { createMesh } from '../utils/meshUtils';

// TODO: This is not correct, while this would work in most cases, it would not work always
// Such as if the models are placed far apart, it would calculate max width of each model but it needs
// a bounding box around the group of models. Needs to be fixed.
export function getBoundsOfMultipleModels(models) {
    let maxWidth = -1;
    let maxHeight = -1;
    for (let i = 0; i < Object.keys(models).length; i += 1) {
        const currentModel = models[Object.keys(models)[i]];
        const currentModelBounds = getBounds(currentModel);
        let origin = [0, 0];
        if (currentModel.origin !== undefined) {
            origin = currentModel.origin;
        }
        maxWidth = Math.max(maxWidth, (currentModelBounds[2] - currentModelBounds[0]) + origin[0]);
        maxHeight = Math.max(maxHeight, (currentModelBounds[3] - currentModelBounds[1]) + origin[1]);
    }

    return [maxWidth, maxHeight];
}

export function moveMultipleModelsAndPaths(models, paths, displacement) {
    for (const modelName in models) {
        makerjs.model.moveRelative(models[modelName], displacement);
    }
    for (const pathName in paths) {
        makerjs.path.moveRelative(paths[pathName], displacement);
    }
}

export function placeModelOnCenter(model, containerBounds, centerOnX = true, centerOnY = true) {
    placeModelOnOrigin(model);
    const modelBounds = getBounds(model);
    if (centerOnX) {
        makerjs.model.moveRelative(model, [
            containerBounds[0] / 2 - (modelBounds[2] - modelBounds[0]) / 2,
            0,
        ]);
    }

    if (centerOnY) {
        makerjs.model.moveRelative(model, [
            0,
            containerBounds[1] / 2 - (modelBounds[3] - modelBounds[1]) / 2,
        ]);
    }
}

export function placeModelOnOrigin(model) {
    const boundingBox = new makerjs.models.Rectangle(model, 0);
    makerjs.model.moveRelative(model, [-boundingBox.origin[0], -boundingBox.origin[1]]);
}

export function getDashedConnectionLine(outputModel, inputModel, output, input) {
    const temp = new DashedLine({
        initPoint: [outputModel.origin[0] + output.position[0], outputModel.origin[1] + output.position[1]],
        finalPoint: [inputModel.origin[0] + input.position[0], inputModel.origin[1] + input.position[1]],
        returnSVG: true,
    });
    return temp;
}

export function getPaddingValues(minPadding, maxPadding, numberOfInputs) {
    const paddingValues = [];
    const diff = (maxPadding - minPadding) / (Math.ceil(numberOfInputs / 2) - 1);
    let currentPadding = maxPadding;
    for (let i = 0; i < numberOfInputs; i += 1) {
        paddingValues.push(currentPadding);
        if (i < Math.ceil(numberOfInputs / 2) - 1) {
            currentPadding -= diff;
        }
        else if (i === parseInt(numberOfInputs) / 2 - 1) {
            // Do nothing
        }
        else {
            currentPadding += diff;
        }
    }
    return paddingValues;
}

// TODO: Jugaad
export function moveOutputs(model, displacement) {
    for (const outputKey in model.outputs) {
        model.outputs[outputKey].position[0] += displacement[0];
        model.outputs[outputKey].position[1] += displacement[1];
    }
}

// TODO: Jugaad
export function moveInputs(model, displacement) {
    for (const inputKey in model.inputs) {
        model.inputs[inputKey].position[0] += displacement[0];
        model.inputs[inputKey].position[1] += displacement[1];
    }
}

export function getConnectionLineWithPadding(outputModel, inputModel, output, input) {
    output.padding = (output.padding === undefined) ? 0 : output.padding;
    input.padding = (input.padding === undefined) ? 0 : input.padding;

    return {
        paths: {
            outputPaddingLine: new makerjs.paths.Line(
                [output.position[0], outputModel.origin[1] + output.position[1]],
                [output.position[0] + output.padding, outputModel.origin[1] + output.position[1]],
            ),
            inputPaddingLine: new makerjs.paths.Line(
                [inputModel.origin[0] + input.position[0] - input.padding, inputModel.origin[1] + input.position[1]],
                [inputModel.origin[0] + input.position[0], inputModel.origin[1] + input.position[1]],
            ),
            matchYLine: new makerjs.paths.Line(
                [output.position[0] + output.padding, outputModel.origin[1] + output.position[1]],
                [output.position[0] + output.padding, inputModel.origin[1] + input.position[1]],
            ),
            outputToInputConnectionLine: new makerjs.paths.Line(
                [output.position[0] + output.padding, inputModel.origin[1] + input.position[1]],
                [inputModel.origin[0] + input.position[0] - input.padding, inputModel.origin[1] + input.position[1]],
            ),
        },
    };
}

export function getConnectionLine(outputModel, inputModel, output, input) {
    return new makerjs.paths.Line(
        [outputModel.origin[0] + output.position[0], outputModel.origin[1] + output.position[1]],
        [inputModel.origin[0] + input.position[0], inputModel.origin[1] + input.position[1]],
    );
}

export function getBounds(model) {
    const boundingBox = new makerjs.models.Rectangle(model, 0);
    boundingBox.origin = [0, 0];
    let minX = 1000,
        minY = 1000,
        maxX = -1,
        maxY = -1;
    for (let i = 0; i < Object.keys(boundingBox.paths).length; i += 1) {
        const key = Object.keys(boundingBox.paths)[i];
        maxX = Math.max(maxX, boundingBox.paths[key].end[0]);
        maxY = Math.max(maxY, boundingBox.paths[key].end[1]);
        minX = Math.min(minX, boundingBox.paths[key].end[0]);
        minY = Math.min(minY, boundingBox.paths[key].end[1]);
    }

    return [minX, minY, maxX, maxY];
}
export function getThreeBox(width, height, origin) {
    const { x, y } = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x, y + height),
        new THREE.Vector3(x, y + height),
        new THREE.Vector3(x, y),
    ];
    return points;
}

export function getThreeBoxPolyLine(width, height, origin) {
    const { x, y } = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x, y + height),
    ];
    return {
        points,
        closed: true,
    };
}

export function getThreeBoxCenteredPolyLine(width, height, center) {
    const { x, y } = center;
    const X = x - (width / 2);
    const Y = y - (height / 2);
    const points = [
        new THREE.Vector3(X, Y),
        new THREE.Vector3(X + width, Y),
        new THREE.Vector3(X + width, Y + height),
        new THREE.Vector3(X, Y + height),
    ];
    return {
        points,
        closed: true,
    };
}

export function getThreeBoxCentered(width, height, center) {
    const { x, y } = center;
    const X = x - (width / 2);
    const Y = y - (height / 2);
    const points = [
        new THREE.Vector3(X, Y),
        new THREE.Vector3(X + width, Y),
        new THREE.Vector3(X + width, Y),
        new THREE.Vector3(X + width, Y + height),
        new THREE.Vector3(X + width, Y + height),
        new THREE.Vector3(X, Y + height),
        new THREE.Vector3(X, Y + height),
        new THREE.Vector3(X, Y),
    ];
    return points;
}

export function getThreeRectangle({ width, height, origin }, color = 0xffffff) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector2(x, y),
        new THREE.Vector2(x + width, y),
        new THREE.Vector2(x + width, y + height),
        new THREE.Vector2(x, y + height),
        new THREE.Vector2(x, y),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.Line(geometry, material);
    return mesh;
}

export function getThreeRectangle1({ width, height, origin }) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x, y + height),
        new THREE.Vector3(x, y + height),
        new THREE.Vector3(x, y),
    ];

    return points;
}
export function getThreeRectangle1PolyLines({ width, height, origin }) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x + width, y),
        new THREE.Vector3(x + width, y + height),
        new THREE.Vector3(x, y + height),
    ];

    return {
        points,
        closed: true,
    }
}

export function getThreeArc({
    origin,
    radius,
    startAngle,
    endAngle,
}, color = 0xffffff, n_points = 50) {
    const arc = new THREE.EllipseCurve(
        ...origin,
        radius, radius,
        startAngle,
        endAngle,
        true, // have to verify, also some left params (bezierData.startT,bezierData.endT)
    );
    const points = arc.getPoints(n_points);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.Line(geometry, material);
    return mesh;
}
export function getThreeCircle(
    origin,
    radius,
    startAngle,
    endAngle,
    color = 0xffffff, n_points = 50,
) {
    const arc = new THREE.EllipseCurve(
        ...origin,
        radius, radius,
        startAngle,
        endAngle,
        true, // have to verify, also some left params (bezierData.startT,bezierData.endT)
    );
    const points = arc.getPoints(n_points);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.Line(geometry, material);
    return mesh;
}
export function getThreeEllipse(
    origin,
    size = 50,
    radiusx = 1.5,
    color = 0xffffff, n_points = 50,
) {
    if (size > 50) {
        radiusx = 3.0;
    }
    const arc = new THREE.EllipseCurve(
        ...origin,
        radiusx,
        size / 2,
        0,
        2 * Math.PI,
        true, // have to verify, also some left params (bezierData.startT,bezierData.endT)
    );
    const points = arc.getPoints(n_points);
    return points;
}
export function getThreeCircleDXF(
    origin,
    radius,
    startAngle,
    endAngle,
    color = 0xffffff, n_points = 50,
) {
    const arc = new THREE.EllipseCurve(
        ...origin,
        radius,
        radius,
        startAngle,
        endAngle,
        true, // have to verify, also some left params (bezierData.startT,bezierData.endT)
    );
    const points = arc.getPoints(n_points);
    return points;
}
export function getConnectionRing(origin, size = 50) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x, y + size),
        new THREE.Vector3(x, y + size),
        new THREE.Vector3(x + 3, y + size),
        new THREE.Vector3(x + 3, y + size),
        new THREE.Vector3(x + 3, y),
        new THREE.Vector3(x + 3, y),
        new THREE.Vector3(x, y),
        new THREE.Vector3(x, y),
        new THREE.Vector3(x + 1.5, y),
        new THREE.Vector3(x + 1.5, y),
        new THREE.Vector3(x + 1.5, y - (size / 1.5)),
    ];
    return points;
}

export function getLetterM(origin, size) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x, y + size),
        new THREE.Vector3(x, y + size),
        new THREE.Vector3(x + (size / 2), y),
        new THREE.Vector3(x + (size / 2), y),
        new THREE.Vector3(x + size, y + size),
        new THREE.Vector3(x + size, y + size),
        new THREE.Vector3(x + size, y),
    ];
    return points;
}

export function getLetterMPolyLine(origin, size) {
    const [x, y] = origin;
    const points = [
        new THREE.Vector3(x, y),
        new THREE.Vector3(x, y + size),
        new THREE.Vector3(x + (size / 2), y),
        new THREE.Vector3(x + size, y + size),
        new THREE.Vector3(x + size, y),
    ];
    return { points };
}

export function getLine(origin, end, color = 0xffffff) {
    const points = [
        new THREE.Vector2(...origin),
        new THREE.Vector2(...end),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.Line(geometry, material);
    return mesh;
}

export function getDashedLine(origin, end, color = 0xffffff) {
    const points = [
        new THREE.Vector2(...origin),
        new THREE.Vector2(...end),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color,
        linewidth: 1,
        scale: 5,
        dashSize: 3,
        gapSize: 5,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
}


export function createConnection(endPoints, startPoints, xBuffer = 25, paddingBuffer = 5, gap = 0) {
    const redPoints = [];
    const whitePoints = [];
    let padding = gap;
    for (let i = startPoints.length - 1; i >= 0; i -= 1) {
        if (startPoints[i].red[1] <= endPoints[i].white[1]) {
            continue;
        }
        whitePoints.push(new THREE.Vector3(...startPoints[i].white));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(endPoints[i].white[0], endPoints[i].white[1]));
        padding += paddingBuffer;

        redPoints.push(new THREE.Vector3(...startPoints[i].red));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(endPoints[i].red[0], endPoints[i].red[1]));
        padding += paddingBuffer;
    }
    padding = gap;
    for (let i = 0; i < startPoints.length; i += 1) {
        if (startPoints[i].red[1] > endPoints[i].white[1]) {
            continue;
        }
        redPoints.push(new THREE.Vector3(...startPoints[i].red));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(endPoints[i].red[0], endPoints[i].red[1]));
        padding += paddingBuffer;

        whitePoints.push(new THREE.Vector3(...startPoints[i].white));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(endPoints[i].white[0], endPoints[i].white[1]));
        padding += paddingBuffer;
    }

    return { redPoints, whitePoints };
}

export function createPolyLineConnection(endPoints, startPoints, xBuffer = 25, paddingBuffer = 5, gap = 0) {
    const tempRedPoints = [];
    const tempWhitePoints = [];
    let padding = gap;
    for (let i = startPoints.length - 1; i >= 0; i -= 1) {
        const redPoints = [];
        const whitePoints = [];
        if (startPoints[i].red[1] <= endPoints[i].white[1]) {
            continue;
        }
        whitePoints.push(new THREE.Vector3(...startPoints[i].white));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(endPoints[i].white[0], endPoints[i].white[1]));
        padding += paddingBuffer;

        redPoints.push(new THREE.Vector3(...startPoints[i].red));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(endPoints[i].red[0], endPoints[i].red[1]));
        padding += paddingBuffer;

        tempWhitePoints.push({
            points: whitePoints,
        });
        tempRedPoints.push({
            points: redPoints,
        });
    }
    padding = gap;
    for (let i = 0; i < startPoints.length; i += 1) {
        if (startPoints[i].red[1] > endPoints[i].white[1]) {
            continue;
        }
        const redPoints = [];
        const whitePoints = [];
        redPoints.push(new THREE.Vector3(...startPoints[i].red));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, startPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(startPoints[i].red[0] + xBuffer +
            padding, endPoints[i].red[1]));
        redPoints.push(new THREE.Vector3(endPoints[i].red[0], endPoints[i].red[1]));
        padding += paddingBuffer;

        whitePoints.push(new THREE.Vector3(...startPoints[i].white));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, startPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(startPoints[i].white[0] + xBuffer +
            padding, endPoints[i].white[1]));
        whitePoints.push(new THREE.Vector3(endPoints[i].white[0], endPoints[i].white[1]));
        padding += paddingBuffer;

        tempWhitePoints.push({
            points: whitePoints,
        });
        tempRedPoints.push({
            points: redPoints,
        });
    }

    return {
        tempRedPoints,
        tempWhitePoints,
    };
}

export async function getModuleMake(ground) {
    const module = {};
    const allModulesTypes = getUniqueModuleIdWithCount(ground);
    const totalModules = Object.keys(allModulesTypes).reduce(
        (sum, key) => sum + parseFloat(allModulesTypes[key] || 0),
        0,
    );
    const maxModuleKey = Object.keys(allModulesTypes).reduce((a, b) =>
        (allModulesTypes[a] > allModulesTypes[b] ? a : b));

    // for module with maximum panels fetch it's characteristics
    try {
        const response =
            await API.MASTER_DATA_PANEL.FETCH_UPDATED_MASTER_PANEL_BY_ID(maxModuleKey);
        module.characteristics = response.data;
        module.count = totalModules;
        return module;
    }
    catch (error) {
        console.error(error);
    }
    return {};
}

export async function getTemperatureData(weatherID) {
    function csvJSON(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = [];
        }
        for (let i = 1; i < lines.length; i++) {
            const currentline = lines[i].split(',');
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]].push(parseFloat(currentline[j]));
            }
        }
        // JavaScript object
        return JSON.parse(JSON.stringify(obj)); // JSON
    }
    // default temperature values
    const temperature = {
        min: 10,
        max: 50,
    };
    // get weather information
    try {
        const response = await API.MASTER_DATA_WEATHER.FETCH_SELECTED_STATION(weatherID);
        const processedFileLocation = response.data.processed_file;
        const file = await API.MASTER_DATA_WEATHER.GET_PROCESSED_FILE(processedFileLocation);
        const fileJSON = csvJSON(file.data);
        temperature.min = Math.min(...fileJSON.Tamb);
        temperature.max = Math.max(...fileJSON.Tamb);
        return temperature;
    }
    catch (error) {
        console.error(error);
    }
    return temperature;
}


export function getText(origin, text, font, size = 2, height = 1, curveSegments = 5, bevelEnabled = false, color = 0xffffff) {
    const geometry = new THREE.TextGeometry(text, {
        font, size, height, curveSegments, bevelEnabled,
    });
    const mesh = createMesh(geometry,new THREE.MeshBasicMaterial());
    mesh.position.x = origin[0];
    mesh.position.y = origin[1];
    return mesh;
}

// export function createTextElement(position, message = 'hey, I am text0', font,size=2, color = 0xffffff) {
//     const material = new THREE.LineBasicMaterial({
//         color,
//         side: THREE.DoubleSide,
//     });
//     const shapes = font.generateShapes(message, size);
//     const geometry = new THREE.ShapeBufferGeometry(shapes);
//     const text = new THREE.Mesh(geometry, material);
//     text.geometry.center();
//     text.position.set(position[0], position[1], 0);
//     return text;
// }
export function connectTwoPoints(point1, point2, color = 0xffffff) {
    const points = [
        new THREE.Vector2(point2[0], point2[1]),
        new THREE.Vector2(point2[0] + 20, point2[1]),
        new THREE.Vector2(point2[0] + 20, point1[1]),
        new THREE.Vector2(point1[0], point1[1]),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    const mesh = new THREE.Line(geometry, material);
    return mesh;
}

export function connectTwoDottedPoints(point1, point2, color = 0xffffff) {
    const points = [
        new THREE.Vector2(point2[0], point2[1]),
        new THREE.Vector2(point2[0] + 18, point2[1]),
        new THREE.Vector2(point2[0] + 18, point1[1]),
        new THREE.Vector2(point1[0], point1[1]),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color,
        linewidth: 1,
        scale: 5,
        dashSize: 3,
        gapSize: 5,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
}

export function connectTwoPoints1(point1, point2, offset = 0) {
    const points = [
        new THREE.Vector3(point1[0], point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point2[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point2[1]),
        new THREE.Vector3(point2[0], point2[1]),
    ];
    return points;
}
export function connectTwoPointsInLShape(point1, point2) {
    const points = [
        new THREE.Vector3(point1[0], point1[1]),
        new THREE.Vector3(point2[0], point1[1]),
        new THREE.Vector3(point2[0], point1[1]),
        new THREE.Vector3(point2[0], point2[1]),
    ];
    return points;
}

export function connectTwoPoints1PolyLine(point1, point2, offset = 0) {
    const points = [
        new THREE.Vector3(point1[0], point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point2[1]),
        new THREE.Vector3(point2[0], point2[1]),
    ];
    return { points };
}

export function connectTwoPointsInLShapePolyLine(point1, point2) {
    const points = [
        new THREE.Vector3(point1[0], point1[1]),
        new THREE.Vector3(point2[0], point1[1]),
        new THREE.Vector3(point2[0], point2[1]),
    ];
    return { points };
}

export function connectTwoDottedPoints1(point1, point2, color = 0xffffff, offset = 0) {
    const points = [
        new THREE.Vector3(...point1),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point1[1]),
        new THREE.Vector3(((point1[0] + point2[0]) / 2) - offset, point2[1]),
        new THREE.Vector3(...point2),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color,
        linewidth: 1,
        scale: 5,
        dashSize: 3,
        gapSize: 5,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
}

export function connectTwoDottedPointsInLShape(point1, point2, color = 0xffffff) {
    const points = [
        new THREE.Vector3(point1[0], point1[1]),
        new THREE.Vector3(point2[0], point1[1]),
        new THREE.Vector3(point2[0], point1[1]),
        new THREE.Vector3(point2[0], point2[1]),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color,
        linewidth: 1,
        scale: 5,
        dashSize: 3,
        gapSize: 5,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
}

export function addAllrgbw(destination, source) {
    destination.whiteLines.push(...source.whiteLines);
    destination.redLines.push(...source.redLines);
    destination.blueLines.push(...source.blueLines);
    destination.blueMicroLines.push(...source.blueMicroLines);
    destination.blueMicroPolyLines.push(...source.blueMicroPolyLines);
    destination.greenPoly3ld.push(...source.greenPoly3ld);
    destination.purplePolyMicroLines.push(...source.purplePolyLines);
    destination.whitePolyLines.push(...source.whitePolyLines);
    destination.redPolyLines.push(...source.redPolyLines);
    destination.bluePolyLines.push(...source.bluePolyLines);
    destination.dashedPolyLines.push(...source.dashedPolyLines);
    destination.purpleLines.push(...source.purpleLines);
    destination.greenLines.push(...source.greenLines);
    destination.whiteCircles.push(...source.whiteCircles);
    destination.redCircles.push(...source.redCircles);
    destination.blueCircles.push(...source.blueCircles);
    destination.greenCircles.push(...source.greenCircles);
    destination.texts.push(...source.texts);
}

// extra things for group of strings
export function addAllrgbwgos(destination, source, isExclusive = false, is3LD = false, isContain3LDText = false) {
    try {
        if (source.whiteEllipse) {
            destination.whiteEllipse.push(...source.whiteEllipse);
        }
        if (source.whitePolyLines) {
            destination.whitePolyLines.push(...source.whitePolyLines);
        }
        if (source.purplePolyLines) {
            destination.purplePolyLines.push(...source.purplePolyLines);
        }
        if (source.blueMicroPolyLines) {
            destination.blueMicroPolyLines.push(...source.blueMicroPolyLines);
        }
        if (source.greenPolyLines) {
            destination.greenPolyLines.push(...source.greenPolyLines);
        }
        if (source.leaders) {
            destination.leaders.push(...source.leaders);
        }
        destination.whiteLines.push(...source.whiteLines);
        destination.blueMicroLines.push(...source.blueMicroLines);
        destination.purpleLines.push(...source.purpleLines);
        destination.greenLines.push(...source.greenLines);
        if (source.greenPolyLines) {
            destination.greenPolyLines.push(...source.greenPolyLines);
        }
        destination.dashedLines.push(...source.dashedLines);
        if (source.dashedPolyLines) {
            destination.dashedPolyLines.push(...source.dashedPolyLines);
        }
        destination.whiteCircles.push(...source.whiteCircles);
        destination.greenCircles.push(...source.greenCircles);
        destination.texts.push(...source.texts);
        if (is3LD) {
            if (source.bluePolyLines) {
                destination.bluePolyLines.push(...source.bluePolyLines);
            }
            destination.redLines.push(...source.redLines);
            if (source.redPolyLines) {
                destination.redPolyLines.push(...source.redPolyLines);
            }
            destination.blueLines.push(...source.blueLines);
            destination.redCircles.push(...source.redCircles);
            destination.blueCircles.push(...source.blueCircles);
        }
        if (isExclusive) {
            destination.textsSLD.push(...source.textsSLD);
            destination.texts3LD.push(...source.texts3LD);
            destination.whitePoly3ld.push(...source.whitePoly3ld);
            destination.whitePolySld.push(...source.whitePolySld);
            destination.greenPoly3ld.push(...source.greenPoly3ld);
            destination.greenCircles3ld.push(...source.greenCircles3ld);
            destination.whitesld.push(...source.whitesld);
            destination.white3ld.push(...source.white3ld);
        }
    }
    catch (e) {
        console.log(e);
    }
}

export function getVectorPair(list1, list2) {
    const points = [
        new THREE.Vector3(...list1),
        new THREE.Vector3(...list2),
    ];
    return points;
}

export function getPolyLineVectorPair(list1, list2) {
    const points = [
        new THREE.Vector3(...list1),
        new THREE.Vector3(...list2),
    ];
    return { points };
}

export function getPlusSign(center, size) {
    const { x, y } = center;
    const points = [
        new THREE.Vector3(x - (size / 2), y),
        new THREE.Vector3(x + (size / 2), y),
        new THREE.Vector3(x, y - (size / 2)),
        new THREE.Vector3(x, y + (size / 2)),
    ];
    return points;
}
export function getPlusSignPolyLine(center, size) {
    const { x, y } = center;
    const points = [
        new THREE.Vector3(x - (size / 2), y),
        new THREE.Vector3(x + (size / 2), y),
        new THREE.Vector3(x, y - (size / 2)),
        new THREE.Vector3(x, y + (size / 2)),
    ];
    return { points };
}

export function getMinusSign(center, size) {
    const { x, y } = center;
    const points = [
        new THREE.Vector3(x - (size / 2), y),
        new THREE.Vector3(x + (size / 2), y),
    ];
    return points;
}
export function getMinusSignPolyLine(center, size) {
    const { x, y } = center;
    const points = [
        new THREE.Vector3(x - (size / 2), y),
        new THREE.Vector3(x + (size / 2), y),
    ];
    return { points };
}

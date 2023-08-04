/* eslint-disable max-len */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-mixed-operators */
/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import * as makerjs from 'makerjs';
import * as opentype from 'opentype.js';
import * as sldConstants from './sldConstants';
import * as componentUtils from './componentUtils';
import { calculateZoomFromBoundingBox } from '../utils/controlsUtils';
import * as exporters from '../utils/exporters';
import * as dxfjs from '@tarikjabiri/dxf';
import { rad2Deg } from '../utils/utils';

let SLDModel = null;

export default async function loadThreeJsFont(url) {
    try {
        const loader = new FontLoader();
        return await new Promise((resolve, reject) => loader.load(
            url,
            (font) => {
                if (font) {
                    resolve(font);
                }
                else {
                    reject(new Error('Font not loaded'));
                }
            },
        ));
    }
    catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

async function loadFont(url) {
    try {
        return await new Promise((resolve, reject) => opentype.load(
            url,
            (err, font) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(font);
                }
            },
        ));
    }
    catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

function createLine(points) {
    return {
        models: {
            lines: new makerjs.models.ConnectTheDots(false, points),
        },
    };
}

function connectTwoPoints(point1, point2) {
    const points = [];
    points.push(point1);
    points.push([(point1[0] + point2[0]) / 2, point1[1]]);
    points.push([(point1[0] + point2[0]) / 2, point2[1]]);
    points.push(point2);
    return createLine(points);
}

function connectParentChild(parentPoints, childrenPoints) {
    const lines = { models: {} };
    let parentPointX = 0;
    for (let i = 0, len = parentPoints.length; i < len; i += 1) {
        parentPointX += parentPoints[i].x;
    }
    parentPointX /= parentPoints.length;
    let childrenPointX = 0;
    for (let i = 0, len = childrenPoints.length; i < len; i += 1) {
        childrenPointX += childrenPoints[i].x;
    }
    childrenPointX /= childrenPoints.length;
    const midPointX = (parentPointX + childrenPointX) / 2;
    const distanceBwLines = 8;
    const totalLines = childrenPoints.length;
    const levels = Math.ceil(totalLines / 2);
    // here + denotes towards the parent side
    const level1X = midPointX + (Math.floor(levels / 2) * distanceBwLines);
    for (let i = 0; i < levels; i += 1) {
        const line1Points = [];
        const line2Points = [];
        line1Points.push([parentPoints[i].x, parentPoints[i].y]);
        line2Points.push([parentPoints[totalLines - i - 1].x, parentPoints[totalLines - i - 1].y]);
        line1Points.push([
            level1X - (distanceBwLines * i),
            parentPoints[i].y,
        ]);
        line2Points.push([
            level1X - (distanceBwLines * i),
            parentPoints[totalLines - i - 1].y,
        ]);

        line1Points.push([
            level1X - (distanceBwLines * i),
            childrenPoints[i].y,
        ]);
        line2Points.push([
            level1X - (distanceBwLines * i),
            childrenPoints[totalLines - i - 1].y,
        ]);
        line1Points.push([childrenPoints[i].x, childrenPoints[i].y]);
        line2Points.push([
            childrenPoints[totalLines - i - 1].x,
            childrenPoints[totalLines - i - 1].y,
        ]);

        lines.models[`lines1${i}`] = createLine(line1Points);
        lines.models[`lines2${i}`] = createLine(line2Points);
    }
    return lines;
}

function getDCWireLabelText(dcCableMake) {
    let type = '';
    switch (dcCableMake.type) {
    case 'Al':
        type = 'Aluminum';
        break;
    case 'Cu':
        type = 'Copper';
        break;
    default:
        type = '';
        break;
    }
    return `${dcCableMake.size} Sq mm ${type}`;
}

export function createTextElement(font, message = 'hey, I am text0', position, size = 4, color = 0xffffff) {
    const material = new THREE.LineBasicMaterial({
        color,
        side: THREE.DoubleSide,
    });
    const shapes = font.generateShapes(message, size);
    const geometry = new THREE.ShapeBufferGeometry(shapes);
    const text = new THREE.Mesh(geometry, material);
    text.geometry.center();
    text.position.set(position[0], position[1], 0);
    return text;
}

export function uncentredTextElement(font, message = 'hey, I am text0', position, size = 4, color = 0xffffff) {
    const material = new THREE.LineBasicMaterial({
        color,
        side: THREE.DoubleSide,
    });
    const shapes = font.generateShapes(message, size);
    const geometry = new THREE.ShapeBufferGeometry(shapes);
    const text = new THREE.Mesh(geometry, material);
    text.position.set(position[0], position[1], 0);
    return text;
}

function generateSLDModel(font, sldData, threeJsFont) {
    let noOfChildren = 0;
    let inverterLength = 0;
    let inverterWidth = 0;
    let stringContainerLength = 0;
    let stringContainerWidth = 0;

    const dcWireLabelText = getDCWireLabelText(sldData.wires.dcCableMake);

    const inverters = [];
    for (let i = 0, l = sldData.inverters.length; i < l; i += 1) {
        for (const sizing of sldData.inverters[i].sizing) {
            if (sizing.inverterCountCurrentSizing > 0) {
                const groupOfStrings = [];
                let totalStringsInInverter = 0;
                const len = sizing.stringsConfiguration.length;
                for (let j = len - 1; j >= 0; j -= 1) {
                    const groupOfStringsObj = new componentUtils.GroupOfStrings({
                        font,
                        scale: 0.1,
                        returnSVG: true,
                        minNumberOfModules: sizing.stringsConfiguration[j].minNumberOfModules,
                        maxNumberOfModules: sizing.stringsConfiguration[j].maxNumberOfModules,
                        totalNumberOfModules: sizing.stringsConfiguration[j].totalNumberOfModules,
                        // numberOfModules: sizing.stringsConfiguration[j].minNumberOfModules === sizing.stringsConfiguration[j].maxNumberOfModules ? sizing.stringsConfiguration[j].maxNumberOfModules : `${sizing.stringsConfiguration[j].maxNumberOfModules}-${sizing.stringsConfiguration[j].minNumberOfModules}`,
                        numberOfModules: sizing.stringsConfiguration[j].numberOfModules,
                        numberOfModulesToShow: 3,
                        numberOfStrings: sizing.stringsConfiguration[j].numberOfStrings,
                        numberOfStringsToShow: 2,
                        title: `${sldData.modules.characteristics.company_name} ${sldData.modules.characteristics.model}`,
                        showWireLabel: true,
                        wireLabel: dcWireLabelText,
                    });
                    totalStringsInInverter += (sizing.stringsConfiguration[j].numberOfStrings >= 2 ? 2 : 1);
                    const sBounds = makerjs.measure.modelExtents(groupOfStringsObj);
                    if (sBounds.height > stringContainerLength) {
                        stringContainerLength = sBounds.height;
                    }
                    if (sBounds.width > stringContainerWidth) {
                        stringContainerWidth = sBounds.width;
                    }
                    groupOfStrings.push(groupOfStringsObj);
                }
                if (Math.floor(len) > noOfChildren) {
                    noOfChildren = Math.floor(len);
                }
                const inverter = new componentUtils.DisconnectAndInverter({
                    font,
                    scale: 0.1,
                    returnSVG: true,
                    dcDisconnectTitleText: 'Disconnect',
                    numberOfInputs: totalStringsInInverter,
                    showWireLabel: true,
                    wireLabelText: dcWireLabelText,
                    inverterCapacityBoxText: `${sldData.inverters[i].inverterDetails.Size}KW Inverter`,
                    inverterTitleText: sldData.inverters[i].inverterDetails.Make,
                    inverterCount: sizing.inverterCountCurrentSizing,
                });
                const bounds = makerjs.measure.modelExtents(inverter);
                if (bounds.height > inverterLength) {
                    inverterLength = bounds.height;
                }
                if (bounds.width > inverterWidth) {
                    inverterWidth = bounds.width;
                }
                inverters.splice(0, 0, { inverter, groupOfStrings, numberOfInverters: sizing.inverterCountCurrentSizing });
            }
        }
    }

    const stringsPositionX = stringContainerWidth / 2;

    const inverterStringsSpacingX = sldConstants.xSpacing +
        (noOfChildren * sldConstants.xSpacingPerWire);
    const inverterPositionX = stringsPositionX + (stringContainerWidth / 2) +
        inverterStringsSpacingX + (inverterWidth / 2);

    let stringsPositionY = stringContainerLength / 2;
    let interconnectPositionY = 0;
    const myModel = { models: {} };
    const allTextMeshes = [];

    const inverterOutputPoints = [];
    const interconnectInputArray = [];


    for (let i = 0, l = inverters.length; i < l; i += 1) {
        let inverterPositionY = 0;
        const len = inverters[i].groupOfStrings.length;
        const childOutputPoints = [];
        const parentInputPoints = [];
        for (let j = 0; j < len; j += 1) {
            inverterPositionY += stringsPositionY;
            const stringsPosition = new THREE.Vector2(stringsPositionX, stringsPositionY);
            const stringBounds = makerjs.measure.modelExtents(inverters[i].groupOfStrings[j]);
            makerjs.model.move(
                inverters[i].groupOfStrings[j],
                [
                    stringsPosition.x - (stringBounds.width / 2),
                    stringsPosition.y - (stringBounds.height / 2),
                ],
            );
            myModel.models[`groupOfStrings${i}:${j}`] = inverters[i].groupOfStrings[j];
            childOutputPoints.push({
                x: inverters[i].groupOfStrings[j].outputs.stringOutput0.position[0]
                    + inverters[i].groupOfStrings[j].origin[0],
                y: inverters[i].groupOfStrings[j].outputs.stringOutput0.position[1]
                    + inverters[i].groupOfStrings[j].origin[1],
            });
            if (inverters[i].groupOfStrings[j].outputs.hasOwnProperty('stringOutput1')) {
                childOutputPoints.push({
                    x: inverters[i].groupOfStrings[j].outputs.stringOutput1.position[0]
                        + inverters[i].groupOfStrings[j].origin[0],
                    y: inverters[i].groupOfStrings[j].outputs.stringOutput1.position[1]
                        + inverters[i].groupOfStrings[j].origin[1],
                });
            }
            for (const text of inverters[i].groupOfStrings[j].textObjects) {
                const textMesh = createTextElement(
                    threeJsFont,
                    text.text,
                    [
                        text.position[0] * 0.1 + inverters[i].groupOfStrings[j].origin[0],
                        text.position[1] * 0.1 + inverters[i].groupOfStrings[j].origin[1],
                    ],
                );
                allTextMeshes.push(textMesh);
            }
            stringsPositionY += stringContainerLength + sldConstants.stringContainerSpacing;
        }
        inverterPositionY /= len;
        interconnectPositionY += inverterPositionY;
        const inverterBounds = makerjs.measure.modelExtents(inverters[i].inverter);
        makerjs.model.move(
            inverters[i].inverter,
            [
                inverterPositionX - (inverterBounds.width / 2),
                inverterPositionY - (inverterBounds.height / 2),
            ],
        );
        const keys = Object.keys(inverters[i].inverter.inputs);
        for (const key of keys) {
            parentInputPoints.push({
                x: inverters[i].inverter.inputs[key].position[0] + inverters[i].inverter.origin[0],
                y: inverters[i].inverter.inputs[key].position[1] + inverters[i].inverter.origin[1],
            });
        }
        const lines = connectParentChild(parentInputPoints, childOutputPoints);
        myModel.models[`inverter${i}`] = inverters[i].inverter;
        myModel.models[`lines${i}`] = lines;

        inverterOutputPoints.push({
            x: inverters[i].inverter.outputs.standardOutput.position[0]
                + inverters[i].inverter.origin[0],
            y: inverters[i].inverter.outputs.standardOutput.position[1]
                + inverters[i].inverter.origin[1],
        });
        interconnectInputArray.splice(0, 0, inverters[i].numberOfInverters);

        // Add inverter Text
        for (const text of inverters[i].inverter.textObjects) {
            const textMesh = createTextElement(
                threeJsFont,
                text.text,
                [
                    text.position[0] * 0.1 + inverters[i].inverter.origin[0],
                    text.position[1] * 0.1 + inverters[i].inverter.origin[1],
                ],
            );
            if (text.rotation !== undefined) {
                textMesh.geometry.center();

                textMesh.geometry.rotateZ(text.rotation * Math.PI / 180);
            }
            allTextMeshes.push(textMesh);
        }
    }
    interconnectPositionY /= inverters.length;

    const interconnectInverterXSpacing = sldConstants.xSpacing +
        (inverters.length * sldConstants.xSpacingPerWire);

    // Interconnect
    const interconnect = new componentUtils.GenerateAcCombinerPanel(
        2, 4, font, interconnectInputArray,
        16, 2, false,
    );

    const interconnectBounds = makerjs.measure.modelExtents(interconnect);
    const interconnectPositionX = inverterPositionX + (inverterWidth / 2) +
        interconnectInverterXSpacing + (interconnectBounds.width / 2);
    makerjs.model.move(
        interconnect,
        [interconnectPositionX, interconnectPositionY],
    );
    myModel.models.interconnect = interconnect;

    // Connect interconnect with inverter..
    const interconnectInputPoints = [];
    for (let i = 0, len = interconnect.inputs.length; i < len; i += 1) {
        interconnectInputPoints.splice(0, 0, {
            x: interconnect.inputs[i][0] + interconnect.origin[0],
            y: interconnect.inputs[i][1] + interconnect.origin[1],
        });
    }
    const lines = connectParentChild(interconnectInputPoints, inverterOutputPoints);
    myModel.models.inverterInterconnectLines = lines;

    const interconnectOutput = [
        interconnect.outputs[0][0] + interconnect.origin[0],
        interconnect.outputs[0][1] + interconnect.origin[1],
    ];

    for (let i = 0; i < interconnect.text.length; i += 1) {
        const text = createTextElement(
            threeJsFont, interconnect.text[i].label,
            [
                interconnect.text[i].position[0] + interconnect.origin[0],
                interconnect.text[i].position[1] + interconnect.origin[1],
            ],
        );
        allTextMeshes.push(text);
    }

    // AC-Disconnect
    const acDisconnect = new componentUtils.GenerateAcDisconnectBox(font, 8, 2, 4, false);
    const acDisconnectBounds = makerjs.measure.modelExtents(acDisconnect);
    const acDisconnectPositionX = interconnectPositionX + (interconnectBounds.width / 2) +
        (acDisconnectBounds.width / 2) + sldConstants.xSpacing;
    makerjs.model.move(
        acDisconnect,
        [
            acDisconnectPositionX,
            interconnectPositionY - (acDisconnect.inputs[0][1] - interconnect.outputs[0][1]),
        ],
    );
    myModel.models.acDisconnect = acDisconnect;

    const acDisconnectInputs = [
        acDisconnect.inputs[0][0] + acDisconnect.origin[0],
        acDisconnect.inputs[0][1] + acDisconnect.origin[1],
    ];
    const acDisconnectOutputs = [
        acDisconnect.outputs[0][0] + acDisconnect.origin[0],
        acDisconnect.outputs[0][1] + acDisconnect.origin[1],
    ];

    for (let i = 0; i < acDisconnect.text.length; i += 1) {
        const text = createTextElement(
            threeJsFont, acDisconnect.text[i].label,
            [
                acDisconnect.text[i].position[0] + acDisconnect.origin[0],
                acDisconnect.text[i].position[1] + acDisconnect.origin[1],
            ],
        );
        allTextMeshes.push(text);
    }

    myModel.models.interconnectAcDisconnectLines =
        connectTwoPoints(interconnectOutput, acDisconnectInputs);

    // Service Panel
    const servicePanel = new componentUtils.LTPanel(2, [4, 4, 4, 1], 16, 2, font);
    const servicePanelBounds = makerjs.measure.modelExtents(servicePanel);
    const servicePanelPositionX = acDisconnectPositionX + (acDisconnectBounds.width / 2) +
        (servicePanelBounds.width / 2) + sldConstants.xSpacing;
    makerjs.model.move(
        servicePanel,
        [
            servicePanelPositionX,
            interconnectPositionY - (servicePanel.inputs[0][1] - acDisconnect.outputs[0][1])
            - (acDisconnect.inputs[0][1] - interconnect.outputs[0][1]),
        ],
    );
    myModel.models.servicePanel = servicePanel;

    const servicePanelInputs = [
        servicePanel.inputs[0][0] + servicePanel.origin[0],
        servicePanel.inputs[0][1] + servicePanel.origin[1],
    ];
    const servicePanelOutputs = [
        servicePanel.outputs[0][0] + servicePanel.origin[0],
        servicePanel.outputs[0][1] + servicePanel.origin[1],
    ];

    for (let i = 0; i < servicePanel.text.length; i += 1) {
        const text = createTextElement(
            threeJsFont, servicePanel.text[i].label,
            [
                servicePanel.text[i].position[0] + servicePanel.origin[0],
                servicePanel.text[i].position[1] + servicePanel.origin[1],
            ],
        );
        allTextMeshes.push(text);
    }

    myModel.models.servicePanelAcDisconnectLines =
        connectTwoPoints(acDisconnectOutputs, servicePanelInputs);

    // Meter
    const meter = new componentUtils.Meter(font, 15, 1, false, true);
    const meterBounds = makerjs.measure.modelExtents(servicePanel);
    const meterPositionX = servicePanelPositionX + (servicePanelBounds.width / 2) +
        (meterBounds.width / 2) + sldConstants.xSpacing;
    makerjs.model.move(
        meter,
        [meterPositionX, interconnectPositionY],
    );
    myModel.models.meter = meter;

    const meterInputs =
        [meter.inputs[0][0] + meter.origin[0], meter.inputs[0][1] + meter.origin[1]];
    const meterOutputs =
        [meter.outputs[0][0] + meter.origin[0], meter.outputs[0][1] + meter.origin[1]];

    for (let i = 0; i < meter.text.length; i += 1) {
        const text = createTextElement(
            threeJsFont, meter.text[i].label,
            [
                meter.text[i].position[0] + meter.origin[0],
                meter.text[i].position[1] + meter.origin[1],
            ],
        );
        allTextMeshes.push(text);
    }
    myModel.models.servicePanelMeterLines = connectTwoPoints(meterInputs, servicePanelOutputs);

    // Grid
    const grid = new componentUtils.Grid(font);
    const gridBounds = makerjs.measure.modelExtents(servicePanel);
    const gridPositionX = meterPositionX + (meterBounds.width / 2) +
        (gridBounds.width / 2) + sldConstants.xSpacing;
    makerjs.model.move(
        grid,
        [gridPositionX, interconnectPositionY],
    );
    myModel.models.grid = grid;

    const gridInputs = [grid.inputs[0][0] + grid.origin[0], grid.inputs[0][1] + grid.origin[1]];

    for (let i = 0; i < grid.text.length; i += 1) {
        const text = createTextElement(
            threeJsFont, grid.text[i].label,
            [
                grid.text[i].position[0] + grid.origin[0],
                grid.text[i].position[1] + grid.origin[1],
            ],
        );
        allTextMeshes.push(text);
    }

    myModel.models.meterGridLines = connectTwoPoints(meterOutputs, gridInputs);
    const modelBBox = makerjs.measure.modelExtents(myModel);

    return { myModel, allTextMeshes, modelBBox };
}

function createSLDMesh(stage, pathData, group) {
    const { paths } = pathData;
    group.name = 'sld group';
    for (let i = 0; i < paths.length; i += 1) {
        const path = paths[i];

        const material2 = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            opacity: 1,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        for (let j = 0, jl = path.subPaths.length; j < jl; j += 1) {
            const subPath = path.subPaths[j];
            const geometry =
                THREE.SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
            if (geometry) {
                geometry.applyMatrix(new THREE.Matrix4().makeScale(
                    1.0,
                    -1.0,
                    1,
                ));
                const mesh = new THREE.Mesh(geometry, material2);
                group.add(mesh);
            }
        }

        // TODO: Draws the actual shape. Might be needed later
        // for (let j = 0; j < shapes.length; j ++ ) {
        //     let shape = shapes[j];
        //     let geometry = new THREE.ShapeBufferGeometry( shape );
        //     let mesh = new THREE.Mesh( geometry, material );
        //     group.add( mesh );
        // }
    }

    return group;
}

export function setSceneZoom(stage, group, group2, group3, group4, ratio = 1) {
    const boundingBox = (new THREE.Box3()).setFromObject(group);
    const centerShift = {
        x: -(boundingBox.max.x + boundingBox.min.x) / 2,
        y: -(boundingBox.max.y + boundingBox.min.y) / 2,
    };
    group.translateX(centerShift.x);
    group2.translateX(centerShift.x);
    group3.translateX(centerShift.x);
    group4.translateX(centerShift.x);

    group.translateY(centerShift.y);
    group2.translateY(centerShift.y);
    group3.translateY(centerShift.y);
    group4.translateY(centerShift.y);


    let zoom = calculateZoomFromBoundingBox(
        {
            minX: boundingBox.min.x,
            maxX: boundingBox.max.x,
            minY: boundingBox.min.y,
            maxY: boundingBox.max.y,
        },
        {
            X: 1.1, Y: 1.1,
        },
        stage.controlsManager._2dControls.getCameraFrustumWidth(),
        stage.controlsManager._2dControls.getCameraFrustumHeight(),
        {
            MAX_X: -1,
            MAX_Y: -1,
        },
    );
    zoom /= ratio;
    stage.controlsManager._2dControls.setOrthographicCameraZoom(zoom);

    stage.controlsManager._2dControls.setDefaultZoom(zoom);
    return boundingBox;
}

function clearOldSLD(stage) {
    if (stage.sldGroup !== undefined) {
        stage.sceneManager.scene.remove(stage.sldGroup);
    }
}

export async function drawSLD(stage, sldData) {
    clearOldSLD(stage);
    let group = new THREE.Group();
    stage.sldGroup = group;

    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const font = await loadFont('https://sld-assets.s3.ap-south-1.amazonaws.com/High_School_USA_Sans.ttf');
        const threeJsFont = await loadThreeJsFont('https://sld-assets.s3.ap-south-1.amazonaws.com/Arial_Regular.json');
        SLDModel = generateSLDModel(font, sldData, threeJsFont);
        const svgFileContents = makerjs.exporter.toSVG(
            SLDModel.myModel,
            {
                useSvgPathOnly: false,
                svgAttrs: {
                    width: '100%',
                    height: '440px',
                },

                layerOptions: {

                    captionLayer: {
                        strokeWidth: 5,
                        stroke: '#9e9e9e',
                        fill: 'black',
                        cssStyle: 'fillOpacity: 0.5; ',
                    },

                    textLayer: {
                        strokeWidth: 0,
                    },

                },
            },
        );

        const pathData = new THREE.SVGLoader().load(svgFileContents);
        group = createSLDMesh(stage, pathData, group);

        const boundingBox = (new THREE.Box3()).setFromObject(group);
        group.translateY((Math.abs(boundingBox.max.y) + Math.abs(boundingBox.min.y)));
        const finalBoundingBox = (new THREE.Box3()).setFromObject(group);
        group.translateY(-finalBoundingBox.min.y + SLDModel.modelBBox.low[1]);

        for (let i = 0, l = SLDModel.allTextMeshes.length; i < l; i += 1) {
            group.add(SLDModel.allTextMeshes[i]);
            SLDModel.allTextMeshes[i].translateY(-group.position.y);
        }

        setSceneZoom(stage, group);
        stage.sceneManager.scene.add(stage.sldGroup);
        return Promise.resolve(true);
    }
    catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

export async function exportAsDXF(stage) {
    if (SLDModel !== null) {
        const designName = stage.eventManager.getProjectDesignName();
        const result = await exporters.DXFExport(SLDModel.myModel, designName);
        return result;
    }
    return Promise.reject(new Error('No SLD created.'));
}

function getPolyLineCoordinates(polyLine, scalingFactor = 1) {
    return polyLine.points
        .map(points => ({ point: dxfjs.point2d(points.x * scalingFactor, points.y * scalingFactor) }));
}

function getLeaderCoordinates(leader, scalingFactor = 1) {
    return leader.map((vector) => dxfjs.point2d(vector.x * scalingFactor, vector.y * scalingFactor, 0));
}

export function outputDocument(data, is3LD) {
    const dxf = new dxfjs.DxfWriter();
    const SCALING_FACTOR = 0.015 * 1.1;
    dxf.addLType('Dashed', '_ _ ', [1, -1, 1, -1]);

    const {
        whitePolyLines,
        redPolyLines,
        greenPolyLines,
        dashedPolyLines,
        blueMicroPolyLines,
        purplePolyLines,
        whitePolySld,
        whitePoly3ld,
        greenPoly3ld,
        greenCircles3ld,
        bluePolyLines,
        whiteCircles,
        blueCircles,
        greenCircles,
        redCircles,
        whiteEllipse,
        texts,
        texts3LD,
        textsSLD,
        leaders,
    } = data;

    const whiteLeaderCoordinates = []
    leaders.forEach((leader) => {
        whiteLeaderCoordinates.push({
            vertices: getLeaderCoordinates(leader, SCALING_FACTOR),
        })
    })
    const leaderDimStyle = dxf.addDimStyle('leaderDimStyle');
    leaderDimStyle.DIMASZ = 0.09;
    whiteLeaderCoordinates.forEach((cord) => {
        dxf.addLeader(cord.vertices, {
            dimensionStyleName: leaderDimStyle.name,
        });
    });

    const whitePolyLineCoordinates = [];

    whitePolyLines.forEach((polyLine) => {
        whitePolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });

    whitePolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
        });
    });

    if (!is3LD) {
        const whitePolySldCoordinates = [];
        
        whitePolySld.forEach((polyLine) => {
            whitePolySldCoordinates.push({
                vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
                closed: polyLine.closed || false,
            });
        });

        whitePolySldCoordinates.forEach((cord) => {
            dxf.addLWPolyline(cord.vertices, {
                flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            });
        });
    }

    if (is3LD) {
        const whitePoly3ldCoordinates = [];

        whitePoly3ld.forEach((polyLine) => {
            whitePoly3ldCoordinates.push({
                vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
                closed: polyLine.closed || false,
            });
        });

        whitePoly3ldCoordinates.forEach((cord) => {
            dxf.addLWPolyline(cord.vertices, {
                flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            });
        });

        const greenPoly3ldCoordinates = [];

        greenPoly3ld.forEach((polyLine) => {
            greenPoly3ldCoordinates.push({
                vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
                closed: polyLine.closed || false,
            });
        });

        greenPoly3ldCoordinates.forEach((cord) => {
            dxf.addLWPolyline(cord.vertices, {
                flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
                colorNumber: 3,
            });
        });

        greenCircles3ld.forEach((element) => {
            const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
            if (element.startAngle === 2*Math.PI && element.endAngle === 0) {
                dxf.addCircle(point, element.radius * SCALING_FACTOR, {
                    colorNumber: 3,
                })
            }
            else {    
                dxf.addArc(point, element.radius * SCALING_FACTOR, rad2Deg(element.endAngle), rad2Deg(element.startAngle), {
                    colorNumber: 3,
                });
            }
        });
    }

    const blueMicroPolyLineCoordinates = [];

    blueMicroPolyLines.forEach((polyLine) => {
        blueMicroPolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });
    
    blueMicroPolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 5,
        });
    });

    const purplePolyLineCoordinates = [];

    purplePolyLines.forEach((polyLine) => {
        purplePolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });

    purplePolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 202,
        });
    });

    const bluePolyLineCoordinates = [];

    bluePolyLines.forEach((polyLine) => {
        bluePolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });
    
    bluePolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 9,
        });
    });

    const redPolyLineCoordinates = [];

    redPolyLines.forEach((polyLine) => {
        redPolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });

    redPolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 1,
        });
    });

    const greenPolyLineCoordinates = [];

    greenPolyLines.forEach((polyLine) => {
        greenPolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });

    greenPolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 3,
        });
    });

    const dashedPolyLineCoordinates = [];

    dashedPolyLines.forEach((polyLine) => {
        dashedPolyLineCoordinates.push({
            vertices: getPolyLineCoordinates(polyLine, SCALING_FACTOR),
            closed: polyLine.closed || false,
        });
    });

    dashedPolyLineCoordinates.forEach((cord) => {
        dxf.addLWPolyline(cord.vertices, {
            flags: cord.closed ? dxfjs.LWPolylineFlags.Closed : dxfjs.LWPolylineFlags.None,
            colorNumber: 3,
            lineType: 'Dashed',
            lineTypeScale: 0.024,
        });
    });

    whiteCircles.forEach((element) => {
        const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        if (element.startAngle === 2*Math.PI && element.endAngle === 0) {
            dxf.addCircle(point, element.radius * SCALING_FACTOR, {
                colorNumber: 7,
            })
        }
        else {
            dxf.addArc(point, element.radius * SCALING_FACTOR, rad2Deg(element.endAngle), rad2Deg(element.startAngle), {
                colorNumber: 7,
            });
        }
    });

    blueCircles.forEach((element) => {
        const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        if (element.startAngle === 2*Math.PI && element.endAngle === 0) {
            dxf.addCircle(point, element.radius * SCALING_FACTOR , {
                colorNumber: 9,
            })
        }
        else {
            dxf.addArc(point, element.radius * SCALING_FACTOR, rad2Deg(element.endAngle), rad2Deg(element.startAngle), {
                colorNumber: 9,
            });
        }
    });

    greenCircles.forEach((element) => {
        const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        if (element.startAngle === 2*Math.PI && element.endAngle === 0) {
            dxf.addCircle(point, element.radius * SCALING_FACTOR, {
                colorNumber: 3,
            })
        }
        else {    
            dxf.addArc(point, element.radius * SCALING_FACTOR, rad2Deg(element.endAngle), rad2Deg(element.startAngle), {
                colorNumber: 3,
            });
        }
    });

    redCircles.forEach((element) => {
        const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        if (element.startAngle === 2*Math.PI && element.endAngle === 0) {
            dxf.addCircle(point, element.radius * SCALING_FACTOR, {
                colorNumber: 1,
            })
        }
        else {
            dxf.addArc(point, element.radius * SCALING_FACTOR, rad2Deg(element.endAngle), rad2Deg(element.startAngle), {
                colorNumber: 1,
            });
        }
    });

    whiteEllipse.forEach((element) => {
        const point1 = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        const point2 = dxfjs.point3d(element.secondPosition.x * SCALING_FACTOR, element.secondPosition.y * SCALING_FACTOR);
        dxf.addEllipse(point1, point2, element.ratio, rad2Deg(element.startAngle), rad2Deg(element.endAngle), {
            colorNumber: 7,
        });
    });

    texts.forEach((element) => {
        const point = dxfjs.point3d(element.position.x* SCALING_FACTOR, element.position.y * SCALING_FACTOR);
        if(element.size != 7 && element.size != 5){
            dxf.addText(point, element.size * SCALING_FACTOR, element.text, {
                horizontalAlignment: dxfjs.TextHorizontalAlignment.Center,
                verticalAlignment: dxfjs.TextVerticalAlignment.Middle,
                secondAlignmentPoint: point,
            });
        }
        else {
            dxf.addText(point, 4 * SCALING_FACTOR, element.text, {
                horizontalAlignment: dxfjs.TextHorizontalAlignment.Center,
                verticalAlignment: dxfjs.TextVerticalAlignment.Middle,
                secondAlignmentPoint: point,
            });
        }
    });
    if (!is3LD) {
        textsSLD.forEach((element) => {
            const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
            dxf.addText(point, 4 * SCALING_FACTOR, element.text, {
                horizontalAlignment: dxfjs.TextHorizontalAlignment.Center,
                verticalAlignment: dxfjs.TextVerticalAlignment.Middle,
                secondAlignmentPoint: point,
            });
        });
    }

    if (is3LD) {
        texts3LD.forEach((element) => {
            const point = dxfjs.point3d(element.position.x * SCALING_FACTOR, element.position.y * SCALING_FACTOR);
            dxf.addText(point, 4 * SCALING_FACTOR, element.text, {
                horizontalAlignment: dxfjs.TextHorizontalAlignment.Center,
                verticalAlignment: dxfjs.TextVerticalAlignment.Middle,
                secondAlignmentPoint: point,
            });
        });
    }

    return dxf.stringify();
}

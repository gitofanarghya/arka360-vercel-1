/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import createBufferGeometry from '../utils/meshUtils';
import DropDownTool from './dropDownTool';
import { productionMeterList } from './sldConstants';
import { createTextElement } from './sldUtils';
import {
    getThreeEllipse,
    getThreeArc,
    getThreeRectangle1,
    getLetterM,
    connectTwoPoints1,
    connectTwoDottedPoints1,
    getThreeRectangle,
    connectTwoDottedPointsInLShape,
    connectTwoPointsInLShape,
    getThreeRectangle1PolyLines,
    getLetterMPolyLine,
    connectTwoPointsInLShapePolyLine,
} from './utils';

export default class ProductionMeter {
    constructor(origin, endPoints, stringData, font, noOfInverter = 2, enabled = true, groupSLD, group3LD, groupExSLD, groupEx3LD, isMicroInverter, acDisconnectPosition) {
        this.parentSLD = groupSLD;
        this.parent3LD = group3LD;
        this.parentExSLD = groupExSLD;
        this.parentEx3LD = groupEx3LD;

        this.stringData = stringData;
        this.font = font;
        this.noOfInverter = noOfInverter;
        this.enabled = enabled;
        [this.originX, this.originY] = origin;
        this.size = 60;
        this.center = [this.originX + (this.size) / 2, this.originY + (this.size) / 2];
        [, this.centerY] = this.center;
        this.connectionBoxSize = 6;
        this.gap = 1;
        this.Msize = 10;
        this.Morigin = [this.center[0] - (this.Msize / 2), this.center[1] - (this.Msize / 2)];
        this.previousEndPoints = endPoints;
        this.origin = origin;
        this.whiteLines = [];
        this.whiteEllipse = [];
        this.white3ld = [];
        this.whitesld = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.bluePolyLines = [];
        this.redPolyLines = [];
        this.whitePolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.dashedLines = [];
        this.loadSide = false;
        this.normal = true;
        this.lineSide = false;
        this.acDisconnectPosition = acDisconnectPosition;
        this.isMicroInverter = isMicroInverter;

        this.sldObjectsGroup = new THREE.Group(); // sldobjectsGroup
        this.sldObjectsGroup.name = 'production-meter-group-sld';
        this.s3ldObjectsGroup = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.s3ldObjectsGroup.name = 'production-meter-group-3ld';
        this.exclusivesld = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.exclusivesld.name = 'production-meter-group-exsld';
        this.exclusive3ld = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.exclusive3ld.name = 'production-meter-group-ex3ld';
        this.toolGroup = new THREE.Group();
        if (this.enabled) {
            const dropDownPosition = new THREE.Vector2(this.originX + this.size, this.originY + this.size);
            this.dropDownTool = new DropDownTool(dropDownPosition.x, dropDownPosition.y, this);
            this.selected = 0;
        }
        else {
            const dropDownPosition = new THREE.Vector2(this.originX + this.size, this.originY + this.size);
            this.dropDownTool = new DropDownTool(dropDownPosition.x + 1000, dropDownPosition.y + 2000, this);
            this.selected = 0;
            // this.dropDownTool = [];
        }
        this.createComponent();
    }

    createComponent() {
        this.whiteLines = [];
        this.whiteEllipse = [];
        this.white3ld = [];
        this.whitesld = [];
        this.bluePolyLines = [];
        this.redPolyLines = [];
        this.whitePolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.redLines = [];
        this.blueLines = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.dashedLines = [];

        if (this.normal) {
            this.connectionOrigins = [
                [this.originX, this.centerY + 2 * this.gap], // L2
                [this.originX + this.size - this.connectionBoxSize, this.centerY + 2 * this.gap],

                [this.originX, this.centerY - 2 * this.gap - this.connectionBoxSize], // N
                [
                    this.originX + this.size - this.connectionBoxSize,
                    this.centerY - 2 * this.gap - this.connectionBoxSize,
                ],

                [this.originX, this.centerY + 3 * this.gap + this.connectionBoxSize], // L1
                [
                    this.originX + this.size - this.connectionBoxSize,
                    this.centerY + 3 * this.gap + this.connectionBoxSize,
                ],

                [this.originX, this.centerY - 3 * this.gap - 2 * this.connectionBoxSize], // G
                [
                    this.originX + this.size - this.connectionBoxSize,
                    this.centerY - 3 * this.gap - 2 * this.connectionBoxSize,
                ],
            ];
            this.connectionPoints = [
                new THREE.Vector2(this.originX, this.centerY + 2 * this.gap + this.Msize / 2),
                new THREE.Vector2(
                    this.originX + this.size + this.Msize / 2,
                    this.centerY + 2 * this.gap + this.Msize / 2,
                ),

                new THREE.Vector2(
                    this.originX,
                    this.centerY - 2 * this.gap - this.connectionBoxSize + this.Msize / 2,
                ),
                new THREE.Vector2(
                    this.originX + this.size,
                    this.centerY - 2 * this.gap - this.connectionBoxSize + this.Msize / 2,
                ),

                new THREE.Vector2(
                    this.originX,
                    this.centerY + 3 * this.gap + this.connectionBoxSize + this.Msize / 2,
                ),
                new THREE.Vector2(
                    this.originX + this.size,
                    this.centerY + 3 * this.gap + this.connectionBoxSize + this.Msize / 2,
                ),

                new THREE.Vector2(
                    this.originX,
                    this.centerY - 3 * this.gap - 2 * this.connectionBoxSize + this.Msize / 2,
                ),
                new THREE.Vector2(
                    this.originX + this.size,
                    this.centerY - 3 * this.gap - 2 * this.connectionBoxSize + this.Msize / 2,
                ),
            ];
            this.endPoints = [
                {
                    red: [
                        this.originX + this.size,
                        this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2,
                    ],
                    white: [this.originX + this.size, this.centerY + this.Msize / 2],
                    blue: [this.originX + this.size, this.centerY - this.Msize / 2],
                    green: [
                        this.originX + this.size,
                        this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2),
                    ],
                },
            ]; // endpoints were in vectors for some reason, need to fix this whatever uses this comp
            this.startPoints = [
                {
                    red: [this.originX, this.centerY + (this.gap + this.connectionBoxSize + this.Msize / 2)],
                    white: [this.originX, this.centerY + this.Msize / 2],
                    blue: [
                        this.originX,
                        this.centerY -
                            (this.gap + this.connectionBoxSize) +
                            this.Msize / 2 -
                            this.connectionBoxSize / 2,
                    ],
                    green: [
                        this.originX,
                        this.centerY -
                            2 * (this.gap + this.connectionBoxSize) +
                            this.Msize / 2 -
                            this.connectionBoxSize / 2,
                    ],
                },
            ];

            if (this.enabled) {
                this.sldObjectsGroup.add(createTextElement(this.font, '(N) PRODUCTION METER', [
                    this.originX + (this.size / 2),
                    this.originY + this.size + 10,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY + this.size + 10,
                    ),
                    text: '(N) PRODUCTION METER',
                    size: 7,
                });

                this.sldObjectsGroup.add(createTextElement(this.font, 'OPTIONAL', [
                    this.originX + (this.size / 2),
                    this.originY - 10,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY - 10,
                    ),
                    text: 'OPTIONAL',
                    size: 7,
                });

                // /

                let thwnNumber;
                if (this.stringData.temprature.tempratureAc === 90) {
                    thwnNumber = '-2';
                }
                else {
                    thwnNumber = '';
                }
                const info = `(3) ${
                    this.stringData.loadCenterToAcDisconnect.conductorSize
                } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                if (this.acDisconnectPosition === 0 || this.acDisconnectPosition === 3) {

                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX - 20 + 1.5, this.originY + 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    // left Side Conduit
                    let points = [];
                    points.push(...getThreeEllipse([this.originX - 20 + 1.5, this.originY + 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                            new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60]));
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 15, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });

                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX + 75 + 1.5, this.originY + 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    // // right side conduit
                    points = [];
                    points.push(...getThreeEllipse([this.originX + 75 + 1.5, this.originY + 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX + 75 + 1.5, this.originY),
                        new THREE.Vector3(this.originX + 75 + 1.5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX + 75 + 1.5, this.originY),
                            new THREE.Vector3(this.originX + 75 + 1.5, this.originY - (50 / 1.5)),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 75, this.originY - 60]));
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });
                }
                if (this.acDisconnectPosition === 2) {
                    // right side conduit
                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX + 75 + 1.5, this.originY + 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    const points = [];
                    points.push(...getThreeEllipse([this.originX + 75 + 1.5, this.originY + 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX + 75 + 1.5, this.originY),
                        new THREE.Vector3(this.originX + 75 + 1.5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX + 75 + 1.5, this.originY),
                            new THREE.Vector3(this.originX + 75 + 1.5, this.originY - (50 / 1.5)),
                        ]
                    });

                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 75, this.originY - 60]));
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });
                }

                // Main Component

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                // neutral
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));
                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));

                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));
                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));
                // Ground
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whiteLines.push(...getThreeRectangle1({ width: this.size, height: this.size, origin: this.origin }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.size, height: this.size, origin: this.origin }));
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 22,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 19,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 22,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 19,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.whiteLines.push(...getLetterM(this.Morigin, this.Msize));
                this.whitePolyLines.push(getLetterMPolyLine(this.Morigin, this.Msize));

                // connections
                if (this.noOfInverter === 1 && !this.isMicroInverter) {
                    this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 34, this.previousEndPoints[0].white[1]]));
                    this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 34, this.previousEndPoints[0].white[1]]));
                    this.whiteLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 34, this.previousEndPoints[0].white[1]]));
                    this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 34, this.previousEndPoints[0].white[1]]));
                    
                    this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.previousEndPoints[0].red[0] + 40, this.previousEndPoints[0].red[1]]));
                    this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.previousEndPoints[0].red[0] + 40, this.previousEndPoints[0].red[1]]));
                    this.redLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].red, [this.previousEndPoints[0].red[0] + 40, this.previousEndPoints[0].red[1]]));
                    this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].red, [this.previousEndPoints[0].red[0] + 40, this.previousEndPoints[0].red[1]]));
                    
                    this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 28, this.previousEndPoints[0].blue[1]]));
                    this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 28, this.previousEndPoints[0].blue[1]]));
                    this.blueLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 28, this.previousEndPoints[0].blue[1]]));
                    this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 28, this.previousEndPoints[0].blue[1]]));
                    this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]]));
                    this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]]));
                    this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]], 'green'));
                    this.dashedLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]]));
                    this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]]));
                    this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 22, this.previousEndPoints[0].green[1]], 'green'));
    
                    this.redLines.push(...connectTwoPointsInLShape(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                    this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                    this.whiteLines.push(...connectTwoPointsInLShape(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                    this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                    this.blueLines.push(...connectTwoPointsInLShape(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                    this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                    this.dashedLines.push(...connectTwoPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                    this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                    this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]],'green'));// if (this.noOfInverter === 1) {
                }
                else {
                    this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, this.previousEndPoints[0].white));
                    this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, this.previousEndPoints[0].white));
                    this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, this.previousEndPoints[0].red));
                    this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, this.previousEndPoints[0].red));
                    this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, this.previousEndPoints[0].blue));
                    this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, this.previousEndPoints[0].blue));
                    this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, this.previousEndPoints[0].green));
                    this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, this.previousEndPoints[0].green));
                    this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, this.previousEndPoints[0].green, 'green'));
    
                    this.redLines.push(...connectTwoPointsInLShape(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                    this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                    this.whiteLines.push(...connectTwoPointsInLShape(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                    this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                    this.blueLines.push(...connectTwoPointsInLShape(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                    this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                    this.dashedLines.push(...connectTwoPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                    this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                    this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]],'green'));// if (this.noOfInverter === 1) {
                }
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 8, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(...connectTwoPoints1(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 8, this.previousEndPoints[0].blue[1]]));
                // }
                // else {
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, this.previousEndPoints[0].blue));
                // }

                // this.redLines.push(...connectTwoPoints1(this.startPoints[0].red, this.previousEndPoints[0].red));

                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, this.previousEndPoints[0].green));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, this.previousEndPoints[0].green, 'green'));

                // this.whiteLines.push(...connectTwoPoints1(this.startPoints[0].white, this.previousEndPoints[0].white));

                // // this.whiteLines.push(...connectTwoPoints1(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 16, this.previousEndPoints[0].white[1]]));

                // // if (this.acDisconnectPosition === 1 || this.acDisconnectPosition === 2) {
                // //     this.redLines.push(...connectTwoPoints1([this.previousEndPoints[0].red[0], this.previousEndPoints[0].red[1]], [this.previousEndPoints[0].red[0] + 24, this.previousEndPoints[0].red[1]]));
                // // }
            }
            else if (!this.enabled && this.acDisconnectPosition !== 1 && this.acDisconnectPosition !== 2) {
                // Left Side Conduit in for Ac Disconnect will only work when production meter is disabled
                let thwnNumber;
                if (this.stringData.temprature.tempratureAc === 90) {
                    thwnNumber = '-2';
                }
                else {
                    thwnNumber = '';
                }
                const info = `(3) ${
                    this.stringData.loadCenterToAcDisconnect.conductorSize
                } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                // left Side Conduit
                this.whiteEllipse.push({
                    position: new THREE.Vector3(this.originX - 20 + 1.5, this.originY + 25),
                    secondPosition: new THREE.Vector3(0, 25),
                    ratio: 0.06,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                });
                const points = [];
                points.push(...getThreeEllipse([this.originX - 20 + 1.5, this.originY + 25]));
                for (let i = 0; i < points.length - 1; i++) {
                    this.whiteLines.push(
                        new THREE.Vector3(points[i].x, points[i].y),
                        new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                    );
                }
                this.whiteLines.push(
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                    ]
                });
                this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60]));
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50),
                    text: `(3) ${
                        this.stringData.loadCenterToAcDisconnect.conductorSize
                    } AWG THWN${thwnNumber}`,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 5),
                    text: `(1) ${
                        this.stringData.loadCenterToAcDisconnect.ground
                    } AWG THWN${thwnNumber} GND `,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 10),
                    text: `IN ${
                        this.stringData.loadCenterToAcDisconnect.conduitSize
                    }'' EMT CONDUIT RUN`,
                    size: 7,
                });
            }
        }

        if (this.loadSide) {
            this.connectionOrigins = [
                [this.originX + 10 * this.gap + this.size / 2, this.centerY - this.size / 2], // L2
                [this.originX + 10 * this.gap + this.size / 2, this.centerY + this.size - this.connectionBoxSize - this.size / 2],

                [this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // N
                [
                    this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],

                [this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // L1
                [
                    this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],

                [this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // G
                [
                    this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],
            ];
            this.connectionPoints = [
                // new THREE.Vector2(
                //     this.originX + 10 * this.gap + this.size / 2,
                //     this.centerY - this.size / 2,
                // ), // L2

                // new THREE.Vector2(
                //     this.originX + 10 * this.gap + this.size / 2,
                //     this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                // ),

                // new THREE.Vector2(
                //     this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                //     this.centerY - this.size / 2,
                // ), // N

                // new THREE.Vector2(
                //     this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                //     this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                // ),

                // new THREE.Vector2(
                //     this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                //     this.centerY - this.size / 2,
                // ), // L1

                // new THREE.Vector2(
                //     this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                //     this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                // ),

                // new THREE.Vector2(
                //     this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                //     this.centerY - this.size / 2,
                // ), // G

                // new THREE.Vector2(
                //     this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                //     this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                // ),
            ];
             // endpoints were in vectors for some reason, need to fix this whatever uses this comp
            // this.endPoints = [
            //     {
            //         red: [
            //             this.originX + this.size + 6,
            //             this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2,
            //         ],
            //         white: [this.originX + this.size + 14, this.centerY + this.Msize / 2],
            //         blue: [this.originX + this.size + 24, this.centerY - this.Msize / 2],
            //         green: [
            //             this.originX + this.size + 34,
            //             this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2),
            //         ],
            //     },
            // ]; // endpoints were in vectors for some reason, need to fix this whatever uses this comp
            this.startPoints = [
                {
                    red: [this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 20], // L2
                    white: [this.originX + 10 * this.gap + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 16], // L1
                    blue: [this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 8], // N
                    green: [this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 4], // G
                },
            ];
            this.endPoints = [
                {
                    red: [this.startPoints[0].red[0] + 10, this.startPoints[0].red[1] - this.size - 24], // L2
                    white: [this.startPoints[0].red[0] + 14,this.startPoints[0].white[1] - this.size - 24], // L1
                    blue: [this.startPoints[0].red[0] + 18,this.startPoints[0].blue[1] - this.size - 24], // N
                    green: [this.startPoints[0].red[0] + 22,this.startPoints[0].green[1] - this.size - 24], // G
                },
            ];
            if (this.enabled) {
                this.sldObjectsGroup.add(createTextElement(this.font, '(N) PRODUCTION METER', [
                    this.originX + (this.size / 2),
                    this.originY + this.size + 30,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY + this.size + 30,
                    ),
                    text: '(N) PRODUCTION METER',
                    size: 7,
                });

                this.sldObjectsGroup.add(createTextElement(this.font, 'OPTIONAL', [
                    this.originX + (this.size / 2),
                    this.originY - 40,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY - 40,
                    ),
                    text: 'OPTIONAL',
                    size: 7,
                });


                let thwnNumber;
                if (this.stringData.temprature.tempratureAc === 90) {
                    thwnNumber = '-2';
                }
                else {
                    thwnNumber = '';
                }
                const info = `(3) ${
                    this.stringData.loadCenterToAcDisconnect.conductorSize
                } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                if (this.acDisconnectPosition === 0 || this.acDisconnectPosition === 3) {
                    // Left Conduit
                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX - 20 + 1.5, this.originY + 25 + 25),
                        secondPosition: new THREE.Vector3(0, 50),
                        ratio: 3 / 50,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    let points = [];
                    points.push(...getThreeEllipse([this.originX - 20 + 1.5, this.originY + 25 + 25], 100));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                            new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60]));
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });

                    // Right Conduit
                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX + 76.5 + 5, this.originY + 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    points = [];
                    points.push(...getThreeEllipse([this.originX + 76.5 + 5, this.originY + 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 75 + 5, this.originY - 60]));
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX + 76.5 + 5, this.originY),
                        new THREE.Vector3(this.originX + 76.5 + 5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX + 76.5 + 5, this.originY),
                            new THREE.Vector3(this.originX + 76.5 + 5, this.originY - (50 / 1.5)),
                        ]
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });
                }

                // Main Component

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                // neutral
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));

                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));

                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));

                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));

                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));
                // Ground
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));

                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whiteLines.push(...getThreeRectangle1({ width: this.size, height: this.size, origin: this.origin }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.size, height: this.size, origin: this.origin }));
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 22,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 19,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 22,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 19,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.whiteLines.push(...getLetterM(this.Morigin, this.Msize));
                this.whitePolyLines.push(getLetterMPolyLine(this.Morigin, this.Msize));

                // Connections
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.startPoints[0].white[0],this.startPoints[0].white[1] - 16]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.startPoints[0].white[0],this.startPoints[0].white[1] - 16]));
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.startPoints[0].red[0],this.startPoints[0].red[1] - 20]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.startPoints[0].red[0],this.startPoints[0].red[1] - 20]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.startPoints[0].blue[0],this.startPoints[0].blue[1] - 8]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.startPoints[0].blue[0],this.startPoints[0].blue[1] - 8]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] - 4]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] - 4]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] - 4], 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 10,this.previousEndPoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 10,this.previousEndPoints[0].white[1]]));
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 10,this.previousEndPoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 10,this.previousEndPoints[0].white[1]]));
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, this.previousEndPoints[0].red));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, this.previousEndPoints[0].red));
                this.blueLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 13,this.previousEndPoints[0].blue[1]]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 13,this.previousEndPoints[0].blue[1]]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 13,this.previousEndPoints[0].blue[1]]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 13,this.previousEndPoints[0].blue[1]]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]], 'green'));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 10,this.previousEndPoints[0].green[1]], 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape([this.startPoints[0].white[0], this.startPoints[0].white[1] - this.size - 16], [this.startPoints[0].white[0],this.startPoints[0].white[1] - this.size - 24]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].white[0], this.startPoints[0].white[1] - this.size - 16], [this.startPoints[0].white[0],this.startPoints[0].white[1] - this.size - 24]));
                this.redLines.push(...connectTwoPointsInLShape([this.startPoints[0].red[0], this.startPoints[0].red[1] - this.size - 20], [this.startPoints[0].red[0],this.startPoints[0].red[1] - this.size - 24]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].red[0], this.startPoints[0].red[1] - this.size - 20], [this.startPoints[0].red[0],this.startPoints[0].red[1] - this.size - 24]));
                this.blueLines.push(...connectTwoPointsInLShape([this.startPoints[0].blue[0], this.startPoints[0].blue[1] - this.size - 8], [this.startPoints[0].blue[0],this.startPoints[0].blue[1] - this.size - 24]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].blue[0], this.startPoints[0].blue[1] - this.size - 8], [this.startPoints[0].blue[0],this.startPoints[0].blue[1] - this.size - 24]));
                this.dashedLines.push(...connectTwoPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] - this.size - 24]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] - this.size - 24]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] - this.size - 24], 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape([this.startPoints[0].white[0], this.startPoints[0].white[1] - this.size - 24], this.endPoints[0].white));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].white[0], this.startPoints[0].white[1] - this.size - 24], this.endPoints[0].white));
                this.redLines.push(...connectTwoPointsInLShape([this.startPoints[0].red[0], this.startPoints[0].red[1] - this.size - 24], this.endPoints[0].red));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].red[0], this.startPoints[0].red[1] - this.size - 24], this.endPoints[0].red));
                this.blueLines.push(...connectTwoPointsInLShape([this.startPoints[0].blue[0], this.startPoints[0].blue[1] - this.size - 24], this.endPoints[0].blue));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].blue[0], this.startPoints[0].blue[1] - this.size - 24], this.endPoints[0].blue));
                this.dashedLines.push(...connectTwoPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 24], this.endPoints[0].green));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 24], this.endPoints[0].green));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] - this.size - 24], this.endPoints[0].green, 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape([this.endPoints[0].white[0], this.endPoints[0].white[1] + 43], this.endPoints[0].white));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.endPoints[0].white[0], this.endPoints[0].white[1] + 43], this.endPoints[0].white));
                this.redLines.push(...connectTwoPointsInLShape([this.endPoints[0].red[0], this.endPoints[0].red[1] + 46], this.endPoints[0].red));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.endPoints[0].red[0], this.endPoints[0].red[1] + 46], this.endPoints[0].red));
                this.blueLines.push(...connectTwoPointsInLShape([this.endPoints[0].blue[0], this.endPoints[0].blue[1] + 41], this.endPoints[0].blue));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.endPoints[0].blue[0], this.endPoints[0].blue[1] + 41], this.endPoints[0].blue));
                this.dashedLines.push(...connectTwoPointsInLShape([this.endPoints[0].green[0], this.endPoints[0].green[1] + 38], this.endPoints[0].green));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.endPoints[0].green[0], this.endPoints[0].green[1] + 38], this.endPoints[0].green));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.endPoints[0].green[0], this.endPoints[0].green[1] + 38], this.endPoints[0].green, 'green'));
                
                // if (this.noOfInverter === 1) {
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 70, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(...connectTwoPoints1(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 70, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1] - 8),
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1]),
                //     );
                // }
                // else {
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 80, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(...connectTwoPoints1(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 80, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1] - 8),
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1]),
                //     );
                // }
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] - 8),
                // );
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] - 28),
                // );
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] + 19.5),
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] - 28),
                // );

                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 20),
                // );
                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] - 28),
                // );
                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] + 22),
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] - 28),
                // );

                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 16),
                // );
                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 28),
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] - 28),
                // );
                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] + 19),
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] - 28),
                // );

                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1] - 34),
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1]),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0], this.endPoints[0].green[1] - 34], [this.endPoints[0].green[0], this.endPoints[0].green[1]], 'green'));
                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 34),
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1] - 34),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 34], [this.endPoints[0].green[0], this.endPoints[0].green[1] - 34], 'green'));
                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 15.5),
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 34),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 15.5], [this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 34], 'green'));

                // this.redLines.push(...connectTwoPoints1(this.startPoints[0].red, [this.previousEndPoints[0].red[0] + 10, this.previousEndPoints[0].red[1]]));
                // this.redLines.push(
                //     new THREE.Vector3(this.startPoints[0].red[0], this.startPoints[0].red[1] - 20),
                //     new THREE.Vector3(this.startPoints[0].red[0], this.startPoints[0].red[1]),
                // );
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));
                // this.dashedLines.push(...connectTwoPoints1(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.startPoints[0].green[0], this.startPoints[0].green[1] + 10]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.startPoints[0].green[0], this.startPoints[0].green[1] - 4], 'green'));

                // this.whiteLines.push(...connectTwoPoints1(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 5, this.previousEndPoints[0].white[1]]));

                // this.whiteLines.push(...connectTwoPoints1(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 5, this.previousEndPoints[0].white[1]]));
                // this.whiteLines.push(
                //     new THREE.Vector3(this.startPoints[0].white[0], this.startPoints[0].white[1] - 16),
                //     new THREE.Vector3(this.startPoints[0].white[0], this.startPoints[0].white[1]),
                // );
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));

                // if (this.acDisconnectPosition === 1 || this.acDisconnectPosition === 2) {
                //     this.redLines.push(...connectTwoPoints1([this.previousEndPoints[0].red[0], this.previousEndPoints[0].red[1]], [this.previousEndPoints[0].red[0] + 10, this.previousEndPoints[0].red[1]]));
                // }
            }
            else {
                // Left Side Conduit in for Ac Disconnect will only work when production meter is disabled
                let thwnNumber;
                if (this.stringData.temprature.tempratureAc === 90) {
                    thwnNumber = '-2';
                }
                else {
                    thwnNumber = '';
                }
                const info = `(3) ${
                    this.stringData.loadCenterToAcDisconnect.conductorSize
                } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                // left Side Conduit
                this.whiteEllipse.push({
                    position: new THREE.Vector3(this.originX - 20 + 1.5, this.originY + 25),
                    secondPosition: new THREE.Vector3(0, 25),
                    ratio: 0.06,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                });
                const points = [];
                points.push(...getThreeEllipse([this.originX - 20 + 1.5, this.originY + 25]));
                for (let i = 0; i < points.length - 1; i++) {
                    this.whiteLines.push(
                        new THREE.Vector3(points[i].x, points[i].y),
                        new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                    );
                }
                this.whiteLines.push(
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                    ]
                });
                this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60]));
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50),
                    text: `(3) ${
                        this.stringData.loadCenterToAcDisconnect.conductorSize
                    } AWG THWN${thwnNumber}`,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 8),
                    text: `(1) ${
                        this.stringData.loadCenterToAcDisconnect.ground
                    } AWG THWN${thwnNumber} GND `,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 16),
                    text: `IN ${
                        this.stringData.loadCenterToAcDisconnect.conduitSize
                    }'' EMT CONDUIT RUN`,
                    size: 7,
                });
            }
        }


        if (this.lineSide) {
            this.connectionOrigins = [
                [this.originX + 10 * this.gap + this.size / 2, this.centerY - this.size / 2], // L2
                [this.originX + 10 * this.gap + this.size / 2, this.centerY + this.size - this.connectionBoxSize - this.size / 2],

                [this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // N
                [
                    this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],

                [this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // L1
                [
                    this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],

                [this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2, this.centerY - this.size / 2], // G
                [
                    this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ],
            ];
            this.connectionPoints = [
                new THREE.Vector2(
                    this.originX + 10 * this.gap + this.size / 2,
                    this.centerY - this.size / 2,
                ), // L2

                new THREE.Vector2(
                    this.originX + 10 * this.gap + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ),

                new THREE.Vector2(
                    this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                    this.centerY - this.size / 2,
                ), // N

                new THREE.Vector2(
                    this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ),

                new THREE.Vector2(
                    this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                    this.centerY - this.size / 2,
                ), // L1

                new THREE.Vector2(
                    this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ),

                new THREE.Vector2(
                    this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                    this.centerY - this.size / 2,
                ), // G

                new THREE.Vector2(
                    this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2,
                    this.centerY + this.size - this.connectionBoxSize - this.size / 2,
                ),
            ];

            this.endPoints = [
                {
                    red: [this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 20], // L2
                    white: [this.originX + 10 * this.gap + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 16], // L1
                    blue: [this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 8], // N
                    green: [this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY + this.size / 2 + 4], // G
                },
            ]; // endpoints were in vectors for some reason, need to fix this whatever uses this comp
            // this.endPoints = [
            //     {
            //         red: [
            //             this.originX + this.size + 6,
            //             this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2,
            //         ],
            //         white: [this.originX + this.size + 14, this.centerY + this.Msize / 2],
            //         blue: [this.originX + this.size + 24, this.centerY - this.Msize / 2],
            //         green: [
            //             this.originX + this.size + 34,
            //             this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2),
            //         ],
            //     },
            // ]; // endpoints were in vectors for some reason, need to fix this whatever uses this comp

            this.startPoints = [
                {
                    red: [this.originX + 15 * this.gap + this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY - this.size / 2 - 20], // L2
                    white: [this.originX + 10 * this.gap + this.size / 2 + this.Msize / 4, this.centerY - this.size / 2 - 16], // L1
                    blue: [this.originX - 10 * this.gap - this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY - this.size / 2 - 8], // N
                    green: [this.originX - 15 * this.gap - 2 * this.connectionBoxSize + this.size / 2 + this.Msize / 4, this.centerY - this.size / 2 - 4], // G
                },
            ];
            if (this.enabled) {
                this.sldObjectsGroup.add(createTextElement(this.font, '(N) PRODUCTION METER', [
                    this.originX + (this.size / 2),
                    this.originY + this.size + 40,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY + this.size + 40,
                    ),
                    text: '(N) PRODUCTION METER',
                    size: 7,
                });

                this.sldObjectsGroup.add(createTextElement(this.font, 'OPTIONAL', [
                    this.originX + (this.size / 2),
                    this.originY - 30,
                ]));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.size / 2),
                        this.originY - 30,
                    ),
                    text: 'OPTIONAL',
                    size: 7,
                });

                if (this.acDisconnectPosition === 0 || this.acDisconnectPosition === 3) {
                    let thwnNumber;
                    if (this.stringData.temprature.tempratureAc === 90) {
                        thwnNumber = '-2';
                    }
                    else {
                        thwnNumber = '';
                    }
                    const info = `(3) ${
                        this.stringData.loadCenterToAcDisconnect.conductorSize
                    } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                    // Left Side Conduit
                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX - 15 + 1.5, this.originY + 25 - 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    let points = [];
                    points.push(...getThreeEllipse([this.originX - 15 + 1.5, this.originY + 25 - 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX - 15 + 1.5, this.originY - 25),
                        new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5) - 25),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX - 15 + 1.5, this.originY - 25),
                            new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5) - 25),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60 - 25]));
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX - 20, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });

                    // Right Side Conduit
                    this.whiteEllipse.push({
                        position: new THREE.Vector3(this.originX + 76.5 + 5, this.originY + 25),
                        secondPosition: new THREE.Vector3(0, 25),
                        ratio: 0.06,
                        startAngle: 0,
                        endAngle: 2 * Math.PI,
                    });
                    points = [];
                    points.push(...getThreeEllipse([this.originX + 76.5 + 5, this.originY + 25]));
                    for (let i = 0; i < points.length - 1; i++) {
                        this.whiteLines.push(
                            new THREE.Vector3(points[i].x, points[i].y),
                            new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                        );
                    }
                    this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 75 + 5, this.originY - 60]));
                    this.whiteLines.push(
                        new THREE.Vector3(this.originX + 76.5 + 5, this.originY),
                        new THREE.Vector3(this.originX + 76.5 + 5, this.originY - (50 / 1.5)),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(this.originX + 76.5 + 5, this.originY),
                            new THREE.Vector3(this.originX + 76.5 + 5, this.originY - (50 / 1.5)),
                        ]
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50),
                        text: `(3) ${
                            this.stringData.loadCenterToAcDisconnect.conductorSize
                        } AWG THWN${thwnNumber}`,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50 - 8),
                        text: `(1) ${
                            this.stringData.loadCenterToAcDisconnect.ground
                        } AWG THWN${thwnNumber} GND `,
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + 75 + 5, this.originY - 50 - 16),
                        text: `IN ${
                            this.stringData.loadCenterToAcDisconnect.conduitSize
                        }'' EMT CONDUIT RUN`,
                        size: 7,
                    });
                }

                // Main Component
                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));

                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[0],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[1][0] + (this.connectionBoxSize / 2), this.connectionOrigins[1][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[0][0] + (this.connectionBoxSize / 2), this.connectionOrigins[0][1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                // neutral
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[1],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.white3ld.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[2],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(getThreeRectangle(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[3],
                    },
                    'white',
                ));
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[3][0] + (this.connectionBoxSize / 2), this.connectionOrigins[3][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[2][0] + (this.connectionBoxSize / 2), this.connectionOrigins[2][1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[5][0] + (this.connectionBoxSize / 2), this.connectionOrigins[5][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(this.connectionOrigins[4][0] + (this.connectionBoxSize / 2), this.connectionOrigins[4][1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));
                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[4],
                    },
                    'red',
                ));

                this.redLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));
                this.redPolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[5],
                    },
                    'red',
                ));
                // Ground
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[7][0] + (this.connectionBoxSize / 2), this.connectionOrigins[7][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(this.connectionOrigins[6][0] + (this.connectionBoxSize / 2), this.connectionOrigins[6][1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[6],
                    },
                    'white',
                ));

                this.whiteLines.push(...getThreeRectangle1(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whitePolyLines.push(getThreeRectangle1PolyLines(
                    {
                        width: this.connectionBoxSize,
                        height: this.connectionBoxSize,
                        origin: this.connectionOrigins[7],
                    },
                    'white',
                ));
                this.whiteLines.push(...getThreeRectangle1({ width: this.size, height: this.size, origin: this.origin }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.size, height: this.size, origin: this.origin }));
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 22,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(this.center[0], this.center[1]),
                    radius: 19,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 22,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.sldObjectsGroup.add(getThreeArc({
                    origin: this.center,
                    radius: 19,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
                this.whiteLines.push(...getLetterM(this.Morigin, this.Msize));
                this.whitePolyLines.push(getLetterMPolyLine(this.Morigin, this.Msize));

                // connections
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.startPoints[0].white[0],this.startPoints[0].white[1] + 16]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.startPoints[0].white[0],this.startPoints[0].white[1] + 16]));
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.startPoints[0].red[0],this.startPoints[0].red[1] + 20]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.startPoints[0].red[0],this.startPoints[0].red[1] + 20]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.startPoints[0].blue[0],this.startPoints[0].blue[1] + 8]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.startPoints[0].blue[0],this.startPoints[0].blue[1] + 8]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] + 4]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] + 4]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.startPoints[0].green[0],this.startPoints[0].green[1] + 4], 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 12, this.previousEndPoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 12, this.previousEndPoints[0].white[1]]));
                this.redLines.push(...connectTwoPointsInLShape(this.previousEndPoints[0].red, [this.previousEndPoints[0].red[0] + 12, this.previousEndPoints[0].red[1]]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndPoints[0].red, [this.previousEndPoints[0].red[0] + 12, this.previousEndPoints[0].red[1]]));
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 12, this.previousEndPoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 12, this.previousEndPoints[0].white[1]]));
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.previousEndPoints[0].red[0] + 12, this.previousEndPoints[0].red[1]]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.previousEndPoints[0].red[0] + 12, this.previousEndPoints[0].red[1]]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, this.previousEndPoints[0].blue));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, this.previousEndPoints[0].blue));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, this.previousEndPoints[0].green));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, this.previousEndPoints[0].green));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, this.previousEndPoints[0].green, 'green'));

                this.whiteLines.push(...connectTwoPointsInLShape([this.startPoints[0].white[0], this.startPoints[0].white[1] + this.size + 16], [this.startPoints[0].white[0],this.startPoints[0].white[1] + this.size + 24]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].white[0], this.startPoints[0].white[1] + this.size + 16], [this.startPoints[0].white[0],this.startPoints[0].white[1] + this.size + 24]));
                this.redLines.push(...connectTwoPointsInLShape([this.startPoints[0].red[0], this.startPoints[0].red[1] + this.size + 20], [this.startPoints[0].red[0],this.startPoints[0].red[1] + this.size + 24]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].red[0], this.startPoints[0].red[1] + this.size + 20], [this.startPoints[0].red[0],this.startPoints[0].red[1] + this.size + 24]));
                this.blueLines.push(...connectTwoPointsInLShape([this.startPoints[0].blue[0], this.startPoints[0].blue[1] + this.size + 8], [this.startPoints[0].blue[0],this.startPoints[0].blue[1] + this.size + 24]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].blue[0], this.startPoints[0].blue[1] + this.size + 8], [this.startPoints[0].blue[0],this.startPoints[0].blue[1] + this.size + 24]));
                this.dashedLines.push(...connectTwoPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] + this.size + 24]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] + this.size + 24]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 4], [this.startPoints[0].green[0],this.startPoints[0].green[1] + this.size + 24], 'green'));
                
                this.whiteLines.push(...connectTwoPointsInLShape([this.startPoints[0].white[0], this.startPoints[0].white[1] + this.size + 24], [this.startPoints[0].red[0] + 14,this.startPoints[0].white[1] + this.size + 24]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].white[0], this.startPoints[0].white[1] + this.size + 24], [this.startPoints[0].red[0] + 14,this.startPoints[0].white[1] + this.size + 24]));
                this.redLines.push(...connectTwoPointsInLShape([this.startPoints[0].red[0], this.startPoints[0].red[1] + this.size + 24], [this.startPoints[0].red[0] + 10,this.startPoints[0].red[1] + this.size + 24]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].red[0], this.startPoints[0].red[1] + this.size + 24], [this.startPoints[0].red[0] + 10,this.startPoints[0].red[1] + this.size + 24]));
                this.blueLines.push(...connectTwoPointsInLShape([this.startPoints[0].blue[0], this.startPoints[0].blue[1] + this.size + 24], [this.startPoints[0].red[0] + 18,this.startPoints[0].blue[1] + this.size + 24]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].blue[0], this.startPoints[0].blue[1] + this.size + 24], [this.startPoints[0].red[0] + 18,this.startPoints[0].blue[1] + this.size + 24]));
                this.dashedLines.push(...connectTwoPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22,this.startPoints[0].green[1] + this.size + 24]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22,this.startPoints[0].green[1] + this.size + 24]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.startPoints[0].green[0], this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22,this.startPoints[0].green[1] + this.size + 24], 'green'));

                this.whiteLines.push(...connectTwoPointsInLShape([this.startPoints[0].white[0] + 14, this.startPoints[0].white[1] + this.size + 24], [this.startPoints[0].red[0] + 14, this.centerY + this.Msize / 2]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].white[0] + 14, this.startPoints[0].white[1] + this.size + 24], [this.startPoints[0].red[0] + 14, this.centerY + this.Msize / 2]));
                this.redLines.push(...connectTwoPointsInLShape([this.startPoints[0].red[0] + 10, this.startPoints[0].red[1] + this.size + 24], [this.startPoints[0].red[0] + 10, this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].red[0] + 10, this.startPoints[0].red[1] + this.size + 24], [this.startPoints[0].red[0] + 10, this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2]));
                this.blueLines.push(...connectTwoPointsInLShape([this.startPoints[0].blue[0] + 18, this.startPoints[0].blue[1] + this.size + 24], [this.startPoints[0].red[0] + 18, this.centerY - this.Msize / 2]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].blue[0] + 18, this.startPoints[0].blue[1] + this.size + 24], [this.startPoints[0].red[0] + 18, this.centerY - this.Msize / 2]));
                this.dashedLines.push(...connectTwoPointsInLShape([this.startPoints[0].green[0] + 22, this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22, this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2)]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine([this.startPoints[0].green[0] + 22, this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22, this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2)]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape([this.startPoints[0].green[0] + 22, this.startPoints[0].green[1] + this.size + 24], [this.startPoints[0].red[0] + 22, this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2)], 'green'));
                
                // if (this.noOfInverter === 1) {
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 70, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(...connectTwoPoints1(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 70, this.previousEndPoints[0].blue[1]]));
                // }
                // else {
                //     this.blueLines.push(...connectTwoPoints1(this.startPoints[0].blue, [this.previousEndPoints[0].blue[0] + 80, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(...connectTwoPoints1(this.previousEndPoints[0].blue, [this.previousEndPoints[0].blue[0] + 80, this.previousEndPoints[0].blue[1]]));
                //     this.blueLines.push(
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1] + 8),
                //         new THREE.Vector3(this.startPoints[0].blue[0], this.startPoints[0].blue[1]),
                //     );
                // }
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] + 14),
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] - 8),
                // );
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0], this.endPoints[0].blue[1] + 14),
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] + 14),
                // );
                // this.blueLines.push(
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] - 45.5),
                //     new THREE.Vector3(this.endPoints[0].blue[0] + 70, this.endPoints[0].blue[1] + 14),
                // );

                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 15),
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 20),
                // );
                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0], this.endPoints[0].red[1] - 15),
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] - 15),
                // );
                // this.redLines.push(
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] - 40.5),
                //     new THREE.Vector3(this.endPoints[0].red[0] + 15, this.endPoints[0].red[1] - 15),
                // );

                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 5),
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 16),
                // );
                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0], this.endPoints[0].white[1] - 5),
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] - 5),
                // );
                // this.whiteLines.push(
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] - 43.5),
                //     new THREE.Vector3(this.endPoints[0].white[0] + 34, this.endPoints[0].white[1] - 5),
                // );

                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1] + 24),
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1] - 4),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0], this.endPoints[0].green[1] + 24], [this.endPoints[0].green[0], this.endPoints[0].green[1] - 4], 'green'));
                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 24),
                //     new THREE.Vector3(this.endPoints[0].green[0], this.endPoints[0].green[1] + 24),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 24], [this.endPoints[0].green[0], this.endPoints[0].green[1] + 24], 'green'));
                // this.dashedLines.push(
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 48.5),
                //     new THREE.Vector3(this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 24),
                // );
                // this.sldObjectsGroup.add(connectTwoDottedPoints1([this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] - 48.5], [this.endPoints[0].green[0] + 90, this.endPoints[0].green[1] + 24], 'green'));


                // this.redLines.push(...connectTwoPoints1(this.startPoints[0].red, [this.previousEndPoints[0].red[0] - 14, this.previousEndPoints[0].red[1]]));
                // this.redLines.push(
                //     new THREE.Vector3(this.startPoints[0].red[0], this.startPoints[0].red[1] + 20),
                //     new THREE.Vector3(this.startPoints[0].red[0], this.startPoints[0].red[1]),
                // );
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));
                // this.dashedLines.push(...connectTwoPoints1(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.previousEndPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.startPoints[0].green[0], this.startPoints[0].green[1] + 10]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.startPoints[0].green[0], this.startPoints[0].green[1] + 4], 'green'));

                // this.whiteLines.push(...connectTwoPoints1(this.startPoints[0].white, [this.previousEndPoints[0].white[0] + 10, this.previousEndPoints[0].white[1]]));

                // this.whiteLines.push(...connectTwoPoints1(this.previousEndPoints[0].white, [this.previousEndPoints[0].white[0] + 10, this.previousEndPoints[0].white[1]]));
                // this.whiteLines.push(
                //     new THREE.Vector3(this.startPoints[0].white[0], this.startPoints[0].white[1] + 16),
                //     new THREE.Vector3(this.startPoints[0].white[0], this.startPoints[0].white[1]),
                // );
                // this.dashedLines.push(...connectTwoPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]]));
                // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.startPoints[0].green, [this.previousEndPoints[0].green[0] + 90, this.previousEndPoints[0].green[1]], 'green'));
                // if (this.acDisconnectPosition === 1 || this.acDisconnectPosition === 2) {
                //     this.redLines.push(...connectTwoPoints1([this.previousEndPoints[0].red[0], this.previousEndPoints[0].red[1]], [this.previousEndPoints[0].red[0] + 10, this.previousEndPoints[0].red[1]]));
                // }
            }
            else {
                // Left Side Conduit in for Ac Disconnect will only work when production meter is disabled
                let thwnNumber;
                if (this.stringData.temprature.tempratureAc === 90) {
                    thwnNumber = '-2';
                }
                else {
                    thwnNumber = '';
                }
                const info = `(3) ${
                    this.stringData.loadCenterToAcDisconnect.conductorSize
                } AWG THWN${thwnNumber} 
(1) ${this.stringData.loadCenterToAcDisconnect.ground} AWG THWN${thwnNumber} GND 
IN ${this.stringData.loadCenterToAcDisconnect.conduitSize}'' EMT CONDUIT RUN`;
                // left Side Conduit
                this.whiteEllipse.push({
                    position: new THREE.Vector3(this.originX - 20 + 1.5, this.originY + 25),
                    secondPosition: new THREE.Vector3(0, 25),
                    ratio: 0.06,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                });
                const points = [];
                points.push(...getThreeEllipse([this.originX - 20 + 1.5, this.originY + 25]));
                for (let i = 0; i < points.length - 1; i++) {
                    this.whiteLines.push(
                        new THREE.Vector3(points[i].x, points[i].y),
                        new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                    );
                }
                this.whiteLines.push(
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                    new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY),
                        new THREE.Vector3(this.originX - 20 + 1.5, this.originY - (50 / 1.5)),
                    ]
                });
                this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 15, this.originY - 60]));
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50),
                    text: `(3) ${
                        this.stringData.loadCenterToAcDisconnect.conductorSize
                    } AWG THWN${thwnNumber}`,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 8),
                    text: `(1) ${
                        this.stringData.loadCenterToAcDisconnect.ground
                    } AWG THWN${thwnNumber} GND `,
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX - 15, this.originY - 50 - 16),
                    text: `IN ${
                        this.stringData.loadCenterToAcDisconnect.conduitSize
                    }'' EMT CONDUIT RUN`,
                    size: 7,
                });
            }
        }
        // if(this.normal) {
        //     this.endPoints = [
        //         {
        //             red: [
        //                 this.originX + this.size,
        //                 this.centerY + this.gap + this.connectionBoxSize + this.Msize / 2,
        //             ],
        //             white: [this.originX + this.size, this.centerY + this.Msize / 2],
        //             blue: [this.originX + this.size, this.centerY - this.Msize / 2],
        //             green: [
        //                 this.originX + this.size,
        //                 this.centerY - (this.gap + this.connectionBoxSize + this.Msize / 2),
        //             ],
        //         },
        //     ]; // endpoints were in vectors for some reason, need to fix this whatever uses this comp
        // }
        // else {

        // /

        const whiteGeometry = createBufferGeometry([...this.whiteLines]);
        const whiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        const whiteLine = new THREE.LineSegments(whiteGeometry, whiteMaterial);

        const redGeometry = createBufferGeometry([...this.redLines]);
        const redMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        const redLine = new THREE.LineSegments(redGeometry, redMaterial);

        const blueMicroGeometry = createBufferGeometry();
        const blueMicroMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 3,
        });
        blueMicroGeometry.setFromPoints([...this.blueMicroLines]);
        const blueMicroLine = new THREE.LineSegments(blueMicroGeometry, blueMicroMaterial);

        const purpleGeometry = createBufferGeometry();
        const purpleMaterial = new THREE.LineBasicMaterial({
            color: 0x800080,
            linewidth: 3,
        });
        purpleGeometry.setFromPoints([...this.purpleLines]);
        const purpleLine = new THREE.LineSegments(purpleGeometry, purpleMaterial);

        const blueGeometry = createBufferGeometry();
        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x808080,
            linewidth: 3,
        });
        blueGeometry.setFromPoints([...this.blueLines]);
        const blueLine = new THREE.LineSegments(blueGeometry, blueMaterial);

        const white3ldLineGeometry = createBufferGeometry([...this.white3ld]);
        const white3ldMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        const white3ldLine = new THREE.LineSegments(white3ldLineGeometry, white3ldMaterial);

        this.sldObjectsGroup.add(whiteLine);
        this.s3ldObjectsGroup.add(redLine);
        this.s3ldObjectsGroup.add(blueLine);
        this.sldObjectsGroup.add(blueMicroLine);
        this.sldObjectsGroup.add(purpleLine);
        this.s3ldObjectsGroup.add(white3ldLine);
        if (!this.enabled) {
            this.endPoints = this.previousEndPoints;
        }
    }
    getModelGroup() {
        return this.sldObjectsGroup;
    }

    getInnerBox() {
        return this.s3ldObjectsGroup;
    }
    selectionControl(i) {
        for (let j = 0; j < this.parentSLD.children.length; j += 1) {
            if (this.parentSLD.children[j].name === 'production-meter-group-sld') {
                this.parentSLD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parent3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'production-meter-group-3ld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentExSLD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'production-meter-group-exsld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentEx3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'production-meter-group-ex3ld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }

        this.sldObjectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.exclusivesld.clear();
        this.exclusive3ld.clear();
        this.parentSLD.add(this.sldObjectsGroup);
        this.parent3LD.add(this.s3ldObjectsGroup);
        this.parentExSLD.add(this.exclusivesld);
        this.parentEx3LD.add(this.exclusive3ld);
        this.selected = i;
        if (i === 0) {
            this.loadSide = false;
            this.lineSide = false;
            this.normal = true;
        }
        if (i === 1) {
            this.loadSide = true;
            this.lineSide = false;
            this.normal = false;
        }
        if (i === 2) {
            this.loadSide = false;
            this.lineSide = true;
            this.normal = false;
        }
        this.createComponent();
    }
    getNames() {
        return productionMeterList;
    }
    getDefault() {
        return this.selected;
    }
}

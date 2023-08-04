/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import * as THREE from 'three';
import { ROD_MESH_UTILS } from '../structure/constants';
import createBufferGeometry from '../utils/meshUtils';
import { createTextElement } from './sldUtils';
import {
    getThreeEllipse,
    createConnection,
    getThreeBox,
    getThreeCircle,
    getVectorPair,
    getDashedLine,
    getThreeRectangle,
    getThreeRectangle1,
    getThreeArc,
    getPolyLineVectorPair,
    getThreeBoxPolyLine,
    getThreeRectangle1PolyLines,
    createPolyLineConnection
} from './utils';

export default class InverterSLD {
    constructor(
        origin,
        sizingData,
        inverterName,
        manufacturer,
        size,
        endPoints,
        inverterCount,
        stringData,
        font,
        conduitText,
        index,
    ) {
        let INVERTER_BOX_WIDTH = 40;
        let numberOfConnections = 0;
        for (let i = 0; i < sizingData.length; i++) {
            numberOfConnections += sizingData[i].numberOfStrings;
        }
        const widthIncreaseFactor = (numberOfConnections - (numberOfConnections % 5)) * 2;
        INVERTER_BOX_WIDTH += widthIncreaseFactor;
        origin.x -= widthIncreaseFactor;
        let INVERTER_BOX_HEIGHT = 100;
        if (numberOfConnections > 4) {
            INVERTER_BOX_HEIGHT += 20 * (numberOfConnections - 4);
        }
        this.origin = origin;
        this.font = font;
        this.previousEndPoints = endPoints;

        this.sldObjectsGroup = new THREE.Group();
        this.s3ldObjectsGroup = new THREE.Group();

        this.whiteLines = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.bluePolyLines = [];
        this.redPolyLines = [];
        this.whitePolyLines = [];
        this.greenPolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.dashedLines = [];

        // green connection with junction box
        this.dashedLines.push(
            new THREE.Vector3(this.previousEndPoints[this.previousEndPoints.length - 1].green[0], this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10),
            new THREE.Vector3(origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.previousEndPoints[this.previousEndPoints.length - 1].green[0], this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10),
                new THREE.Vector3(origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [this.previousEndPoints[this.previousEndPoints.length - 1].green[0], this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10],
            [origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10], 'green',
        ));

        this.dashedLines.push(...getVectorPair(
            [origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10],
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5],
        ));
        this.dashedPolyLines.push(getPolyLineVectorPair(
            [origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10],
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5],
        ));
        this.sldObjectsGroup.add(getDashedLine(
            [origin.x - 10 - widthIncreaseFactor, this.previousEndPoints[this.previousEndPoints.length - 1].green[1] - 10],
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5], 'green',
        ));

        this.dashedLines.push(...getVectorPair(
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5],
            [(origin.x - widthIncreaseFactor) + 15, origin.y + 5],
        ));
        this.dashedPolyLines.push(getPolyLineVectorPair(
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5],
            [(origin.x - widthIncreaseFactor) + 15, origin.y + 5],
        ));
        this.sldObjectsGroup.add(getDashedLine(
            [origin.x - 10 - widthIncreaseFactor, origin.y + 5],
            [(origin.x - widthIncreaseFactor) + 15, origin.y + 5], 'green',
        ));

        this.whiteLines.push(...getThreeBox(
            INVERTER_BOX_WIDTH,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(this.origin.x - widthIncreaseFactor, this.origin.y),
        ));
        this.whitePolyLines.push(getThreeBoxPolyLine(
            INVERTER_BOX_WIDTH,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(this.origin.x - widthIncreaseFactor, this.origin.y),
        ));
        this.whiteLines.push(...getThreeBox(
            INVERTER_BOX_WIDTH,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(
                this.origin.x + INVERTER_BOX_WIDTH - widthIncreaseFactor,
                this.origin.y,
            ),
        ));
        this.whitePolyLines.push(getThreeBoxPolyLine(
            INVERTER_BOX_WIDTH,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(
                this.origin.x + INVERTER_BOX_WIDTH - widthIncreaseFactor,
                this.origin.y,
            ),
        ));
        this.whiteLines.push(
            new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH - widthIncreaseFactor,
                this.origin.y,
            ),
            new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH * 2 - widthIncreaseFactor,
                this.origin.y + INVERTER_BOX_HEIGHT,
            ),
        );
        this.whitePolyLines.push({
            points: [
                new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH - widthIncreaseFactor,
                    this.origin.y,
                ),
                new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH * 2 - widthIncreaseFactor,
                    this.origin.y + INVERTER_BOX_HEIGHT,
                ),
            ]
        });
        // this.sldObjectsGroup.add(getLine(
        //     [this.origin.x + INVERTER_BOX_WIDTH, this.origin.y],
        //     [
        //         this.origin.x + (INVERTER_BOX_WIDTH * 2),
        //         this.origin.y + INVERTER_BOX_HEIGHT,
        //     ],
        //     'white',
        // ));
        this.whiteLines.push(...getThreeBox(
            INVERTER_BOX_WIDTH - 5,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(
                this.origin.x + INVERTER_BOX_WIDTH * 2 - widthIncreaseFactor,
                this.origin.y,
            ),
        ));
        this.whitePolyLines.push(getThreeBoxPolyLine(
            INVERTER_BOX_WIDTH - 5,
            INVERTER_BOX_HEIGHT,
            new THREE.Vector2(
                this.origin.x + INVERTER_BOX_WIDTH * 2 - widthIncreaseFactor,
                this.origin.y,
            ),
        ));
        this.endPoints = [];
        let k = 0;
        if (numberOfConnections < 4) {
            k = 15;
        }
        else {
            k = 20;
        }
        this.whiteLines.push(...getThreeBox(
            12,
            40,
            new THREE.Vector2(
                this.origin.x + 12 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 - k,
            ),
        ));
        this.whitePolyLines.push(getThreeBoxPolyLine(
            12,
            40,
            new THREE.Vector2(
                this.origin.x + 12 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 - k,
            ),
        ));
        this.greenCircles.push({
            position: new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ),
            radius: 3,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeCircle(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ],
            3,
            0,
            Math.PI * 2,
            'green',
        ));
        this.blueCircles.push({
            position: new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 15 - k,
            ),
            radius: 3,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeCircle(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 15 - k,
            ],
            3,
            0,
            Math.PI * 2,
            'grey',
        ));
        this.whiteCircles.push({
            position: new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 25 - k,
            ),
            radius: 3,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeCircle(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 25 - k,
            ],
            3,
            0,
            Math.PI * 2,
            'white',
        ));
        this.redCircles.push({
            position: new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
            ),
            radius: 3,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeCircle(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
            ],
            3,
            0,
            Math.PI * 2,
            'red',
        ));
        this.redLines.push(
            new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
            ),
            new THREE.Vector3(
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2 + 30,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
            ),
        );
        this.redPolyLines.push({
            points:[  
                new THREE.Vector3(
                    this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                    this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
                ),
                new THREE.Vector3(
                    this.origin.x + 18 + INVERTER_BOX_WIDTH * 2 + 30,
                    this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
                ),
            ]
        });
        this.endPoints.push({
            red: [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 35 - k,
            ],
            white: [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 25 - k,
            ],
            blue: [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 15 - k,
            ],
            green: [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ],
        });

        // internal green connection
        this.dashedLines.push(...getVectorPair(
            [origin.x + 20 + 20 - 5 - widthIncreaseFactor, origin.y + 10 - 5],
            [this.origin.x + 18 + INVERTER_BOX_WIDTH * 2, origin.y + 10 - 5],
        ));
        this.dashedPolyLines.push(getPolyLineVectorPair(
            [origin.x + 20 + 20 - 5 - widthIncreaseFactor, origin.y + 10 - 5],
            [this.origin.x + 18 + INVERTER_BOX_WIDTH * 2, origin.y + 10 - 5],
        ));
        this.sldObjectsGroup.add(getDashedLine(
            [
                origin.x + 20 + 20 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ],
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                origin.y + 10 - 5,
            ], 'green',
        ));
        this.sldObjectsGroup.add(getThreeRectangle(
            {
                width: 20,
                height: 6,
                origin: [
                    origin.x + 20 - 5 - widthIncreaseFactor,
                    origin.y + 10 - 3 - 5,
                ],
            },
            'green',
        ));
        this.greenLines.push(...getThreeRectangle1(
            {
                width: 20,
                height: 6,
                origin: [
                    origin.x + 20 - 5 - widthIncreaseFactor,
                    origin.y + 10 - 3 - 5,
                ],
            },
            'green',
        ));
        this.greenPolyLines.push(getThreeRectangle1PolyLines(
            {
                width: 20,
                height: 6,
                origin: [
                    origin.x + 20 - 5 - widthIncreaseFactor,
                    origin.y + 10 - 3 - 5,
                ],
            },
            'green',
        ));
        this.greenCircles.push({
            position: new THREE.Vector3(
                origin.x + 20 + 5 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ),
            radius: 2,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [
                origin.x + 20 + 5 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ],
            radius: 2,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));

        this.greenCircles.push({
            position: new THREE.Vector3(
                origin.x + 20 + 10 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ),
            radius: 2,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [
                origin.x + 20 + 10 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ],
            radius: 2,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));

        this.greenCircles.push({
            position: new THREE.Vector3(
                origin.x + 20 + 15 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ),
            radius: 2,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [
                origin.x + 20 + 15 - 5 - widthIncreaseFactor,
                origin.y + 10 - 5,
            ],
            radius: 2,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));
        this.dashedLines.push(...getVectorPair(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                origin.y + 10 - 5,
            ],
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ],
        ));
        this.dashedPolyLines.push(getPolyLineVectorPair(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                origin.y + 10 - 5,
            ],
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ],
        ));
        this.sldObjectsGroup.add(getDashedLine(
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                origin.y + 10 - 5,
            ],
            [
                this.origin.x + 18 + INVERTER_BOX_WIDTH * 2,
                this.origin.y + INVERTER_BOX_HEIGHT / 2 + 5 - k,
            ], 'green',
        ));
        // /////////////
        this.sldObjectsGroup.add(createTextElement(
            this.font,
            `${manufacturer} - ${inverterName}\nOUTPUT: ${size}kW, 240VAC, ${stringData.inverterCurrent.current}A`,
            [
                this.origin.x + INVERTER_BOX_WIDTH + 20 - widthIncreaseFactor,
                this.origin.y + INVERTER_BOX_HEIGHT + 30 - 10,
            ],
        ));
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH + 20 - widthIncreaseFactor,
                this.origin.y + INVERTER_BOX_HEIGHT + 30 - 10,
            ),
            text: `${manufacturer} - ${inverterName}(240V)`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH + 20 - widthIncreaseFactor,
                this.origin.y + INVERTER_BOX_HEIGHT + 22 - 10,
            ),
            text: `OUTPUT: 240VAC, ${stringData.inverterCurrent.current}A `,
            size: 7,
        });
        //
        this.sldObjectsGroup.add(createTextElement(this.font, 'DC ===', [
            this.origin.x + INVERTER_BOX_WIDTH + 15 - widthIncreaseFactor,
            this.origin.y + INVERTER_BOX_HEIGHT - 20,
        ], 6));
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH + 12 - widthIncreaseFactor,
                this.origin.y + INVERTER_BOX_HEIGHT - 20,
            ),
            text: 'DC ====',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x + INVERTER_BOX_WIDTH + 22 - widthIncreaseFactor,
                this.origin.y + 20,
            ),
            text: 'AC',
            size: 7,
        });

        const sineCenter = {
            x: this.origin.x + INVERTER_BOX_WIDTH + 37 - 5 - widthIncreaseFactor,
            y: this.origin.y + 20,
            size: (18 / 4) * 0.8,
        };

        // number of points is 10
        for (let i = 0; i < 10; i++) {
            const [X, Y] = [
                sineCenter.x - (sineCenter.size / 2),
                sineCenter.y,
            ];
            const point = [
                X + (i * (sineCenter.size / 4)),
                Y + (sineCenter.size * (Math.sin(i * (2 * (Math.PI / 10))))),
            ];
            const nextpoint = [
                X + ((i + 1) * (sineCenter.size / 4)),
                Y + (sineCenter.size * (Math.sin((i + 1) * (2 * (Math.PI / 10))))),
            ];
            this.whiteLines.push(...getVectorPair(point, nextpoint));
            this.whitePolyLines.push(getPolyLineVectorPair(point, nextpoint));
        }

        //
        this.sldObjectsGroup.add(createTextElement(this.font, 'AC', [
            this.origin.x + INVERTER_BOX_WIDTH + 22 - widthIncreaseFactor,
            this.origin.y + 20,
        ], 6));

        // connection
        let thwnNumber;
        if (stringData.temprature.tempratureDc === 90) {
            thwnNumber = '-2';
        }
        else {
            thwnNumber = '';
        }
        const info1 = `${stringData.junctionBoxToInverter.conduitSize}'' EMT CONDUIT
(${this.previousEndPoints.length}) #${stringData.junctionBoxToInverter.conductorSize} AWG THWN${thwnNumber} + RED
(${this.previousEndPoints.length}) #${stringData.junctionBoxToInverter.conductorSize} AWG THWN${thwnNumber} - BLACK
(1) #${stringData.junctionBoxToInverter.ground} AWG THWN${thwnNumber} GND`;
        // const info3ld = `(${this.previousEndPoints.length}) #${stringData.junctionBoxToInverter.conductorSize} AWG THWN- 2 + RED`
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x - 20 - widthIncreaseFactor,
                this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5) - 20 - 5,
            ),
            text: `(${this.previousEndPoints.length}) #${stringData.junctionBoxToInverter.conductorSize} AWG THWN${thwnNumber} + RED`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x - 20 - widthIncreaseFactor,
                this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5) - 20 - 13,
            ),
            text: `(${this.previousEndPoints.length}) #${
                stringData.junctionBoxToInverter.conductorSize
            } AWG THWN${thwnNumber} - BLACK`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x - 20 - widthIncreaseFactor,
                this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5) - 20 - 21,
            ),
            text: `(1) #${stringData.junctionBoxToInverter.ground} AWG THWN${thwnNumber} GND`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(
                this.origin.x - 20 - (widthIncreaseFactor),
                this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5) - 17,
            ),
            text: `${
                stringData.junctionBoxToInverter.conduitSize
            }'' EMT CONDUIT`,
            size: 7,
        });
        /* this.whiteLines.push(...getConnectionRing(
            [this.origin.x - 20, this.origin.y + 5],
            INVERTER_BOX_HEIGHT,
        )); */
        this.whiteEllipse.push({
            position: new THREE.Vector3(this.origin.x - 20 + 1.5 - (widthIncreaseFactor), this.origin.y + 5 + INVERTER_BOX_HEIGHT / 2),
            secondPosition: new THREE.Vector3(0, INVERTER_BOX_HEIGHT / 2),
            ratio: INVERTER_BOX_HEIGHT > 50 ? 3 / INVERTER_BOX_HEIGHT / 2 : 1.5 / INVERTER_BOX_HEIGHT / 2,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        });
        let points = [];
        points.push(...getThreeEllipse(
            [this.origin.x - 20 + 1.5 - (widthIncreaseFactor),
                this.origin.y + 5 + INVERTER_BOX_HEIGHT / 2],
            INVERTER_BOX_HEIGHT,
        ));
        for (let i = 0; i < points.length - 1; i++) {
            this.whiteLines.push(
                new THREE.Vector3(points[i].x, points[i].y),
                new THREE.Vector3(points[i + 1].x, points[i + 1].y),
            );
        }
        this.whiteLines.push(
            new THREE.Vector3(
                this.origin.x - 20 + 1.5 - (widthIncreaseFactor),
                this.origin.y + 5,
            ),
            new THREE.Vector3(
                this.origin.x - 20 + 1.5 - (widthIncreaseFactor),
                this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5),
            ),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(
                    this.origin.x - 20 + 1.5 - (widthIncreaseFactor),
                    this.origin.y + 5,
                ),
                new THREE.Vector3(
                    this.origin.x - 20 + 1.5 - (widthIncreaseFactor),
                    this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5),
                ),
            ]
        });
        /* this.s3ldObjectsGroup.add(createTextElement(this.font, info3ld, [
            this.origin.x - 20 - 2,
            this.origin.y - INVERTER_BOX_HEIGHT + 15,
        ])); */
        this.sldObjectsGroup.add(createTextElement(this.font, info1, [
            this.origin.x - 20 - widthIncreaseFactor,
            this.origin.y + 55 - (INVERTER_BOX_HEIGHT / 1.5) - 20,
        ]));
        //
        if (inverterCount > 1) {
            const info2 = `(3) #${conduitText[index + 1]} AWG THWN${thwnNumber}
(1) #${conduitText[index]} AWG THWN${thwnNumber} GND 
IN ${conduitText[index + 2]}'' EMT CONDUIT RUN`;

            this.texts.push({
                position: new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH * 3 + 50 - (widthIncreaseFactor),
                    this.origin.y + 60 - (100 / 1.5),
                ),
                text: `(3) #${
                    conduitText[index + 1]
                } AWG THWN${thwnNumber}`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH * 3 + 50 - widthIncreaseFactor,
                    this.origin.y + 60 - 8 - (100 / 1.5),
                ),
                text: `(1) #${
                    conduitText[index]
                } AWG THWN${thwnNumber} GND`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH * 3 + 50 - widthIncreaseFactor,
                    this.origin.y + 60 - 16 - (100 / 1.5),
                ),
                text: `IN ${
                    conduitText[index + 2]
                }'' EMT CONDUIT RUN`,
                size: 7,
            });
            /* this.whiteLines.push(...getConnectionRing(
                [
                    this.origin.x + INVERTER_BOX_WIDTH * 3,
                    this.origin.y + 25,
                ],
                50,
            )); */
            this.whiteEllipse.push({
                position: new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + INVERTER_BOX_HEIGHT / 2 - k + 25),
                secondPosition: new THREE.Vector3(0, 25),
                ratio: 0.06,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            });
            points = [];
            points.push(...getThreeEllipse([this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + INVERTER_BOX_HEIGHT / 2 - k + 25]));
            for (let i = 0; i < points.length - 1; i++) {
                this.whiteLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            this.whiteLines.push(
                new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + INVERTER_BOX_HEIGHT / 2 - k),
                new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + INVERTER_BOX_HEIGHT / 2 - k),
                    new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 15 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
                new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 15 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
                    new THREE.Vector3(this.origin.x + INVERTER_BOX_WIDTH * 3 + 1.5 - widthIncreaseFactor, this.origin.y + 25 - (50 / 1.5)),
                ]
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info2, [
                this.origin.x + INVERTER_BOX_WIDTH * 3 + 50 - widthIncreaseFactor,
                this.origin.y + 60 - (100 / 1.5),
            ]));

            // this.sldObjectsGroup.add(getConnectionRing(
            //     [this.origin.x + (INVERTER_BOX_WIDTH * 3) - 25, this.origin.y + 25],
            //     info2,
            //     font,
            //     50,
            //     -25,
            // ));
        }
        // /////////////

        this.startPoints = [];
        // this.origin.y += INVERTER_BOX_HEIGHT - 20;
        const centerGap = ((numberOfConnections - 1) / 2) * 18;
        this.origin.y += ((INVERTER_BOX_HEIGHT - 20) / 2) + centerGap;
        this.origin.x += 2 - widthIncreaseFactor;
        for (let i = 0; i < numberOfConnections; i += 1) {
            this.whiteLines.push(...getThreeBox(12, 16, this.origin));
            this.whitePolyLines.push(getThreeBoxPolyLine(12, 16, this.origin));
            //
            this.startPoints.push({
                red: [this.origin.x + 6, this.origin.y + 12],
                white: [this.origin.x + 6, this.origin.y + 5],
            });
            // sld fuse
            this.whiteLines.push(
                new THREE.Vector3(this.origin.x + 12, this.origin.y + 5),
                new THREE.Vector3(this.origin.x + 17, this.origin.y + 5),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + 12, this.origin.y + 5),
                    new THREE.Vector3(this.origin.x + 17, this.origin.y + 5),
                ]
            });
            // this.sldObjectsGroup.add(getLine(
            //     [this.origin.x + 12, this.origin.y + 5],
            //     [this.origin.x + 17, this.origin.y + 5],
            // ));
            this.whiteCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 18,
                    this.origin.y + 5,
                ),
                radius: 1,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 18, this.origin.y + 5],
                1,
                0,
                Math.PI * 2,
                'white',
            ));
            this.whiteCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 24,
                    this.origin.y + 5,
                ),
                radius: 1,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 24, this.origin.y + 5],
                1,
                0,
                Math.PI * 2,
                'white',
            ));
            this.whiteLines.push(
                new THREE.Vector3(this.origin.x + 25, this.origin.y + 5),
                new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH - 2,
                    this.origin.y + 5,
                ),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + 25, this.origin.y + 5),
                    new THREE.Vector3(
                        this.origin.x + INVERTER_BOX_WIDTH - 2,
                        this.origin.y + 5,
                    ),
                ]
            });
            // this.sldObjectsGroup.add(getLine(
            //     [this.origin.x + 25, this.origin.y + 5],
            //     [this.origin.x + INVERTER_BOX_WIDTH - 2, this.origin.y + 5],
            // ));
            // 3ld fuse
            this.redLines.push(
                new THREE.Vector3(this.origin.x + 12, this.origin.y + 12),
                new THREE.Vector3(this.origin.x + 17, this.origin.y + 12),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + 12, this.origin.y + 12),
                    new THREE.Vector3(this.origin.x + 17, this.origin.y + 12),
                ]
            });
            // this.s3ldObjectsGroup.add(getLine(
            //     [this.origin.x + 12, this.origin.y + 12],
            //     [this.origin.x + 17, this.origin.y + 12],
            //     'red',
            // ));
            this.redCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 18,
                    this.origin.y + 12,
                ),
                radius: 1,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 18, this.origin.y + 12],
                1,
                0,
                Math.PI * 2,
                'red',
            ));
            this.redCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 24,
                    this.origin.y + 12,
                ),
                radius: 1,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 24, this.origin.y + 12],
                1,
                0,
                Math.PI * 2,
                'red',
            ));
            this.redLines.push(
                new THREE.Vector3(this.origin.x + 25, this.origin.y + 12),
                new THREE.Vector3(
                    this.origin.x + INVERTER_BOX_WIDTH - 2,
                    this.origin.y + 12,
                ),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(this.origin.x + 25, this.origin.y + 12),
                    new THREE.Vector3(
                        this.origin.x + INVERTER_BOX_WIDTH - 2,
                        this.origin.y + 12,
                    ),
                ]
            });
            // this.s3ldObjectsGroup.add(getLine(
            //     [this.origin.x + 25, this.origin.y + 12],
            //     [
            //         this.origin.x + INVERTER_BOX_WIDTH - 2,
            //         this.origin.y + 12,
            //     ],
            //     'red',
            // ));
            // connection rings
            this.redCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 6,
                    this.origin.y + 12,
                ),
                radius: 3,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 6, this.origin.y + 12],
                3,
                0,
                Math.PI * 2,
                'red',
            ));
            this.whiteCircles.push({
                position: new THREE.Vector3(
                    this.origin.x + 6,
                    this.origin.y + 5,
                ),
                radius: 3,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeCircle(
                [this.origin.x + 6, this.origin.y + 5],
                3,
                0,
                Math.PI * 2,
                'white',
            ));
            this.origin.y -= 18;
        }
        const connections = createConnection(
            this.startPoints,
            this.previousEndPoints,
        );
        const polyLineConnections = createPolyLineConnection(this.startPoints,this.previousEndPoints);
        this.whiteLines.push(...connections.whitePoints);
        this.whitePolyLines.push(...polyLineConnections.tempWhitePoints);
        this.redLines.push(...connections.redPoints);
        this.redPolyLines.push(...polyLineConnections.tempRedPoints);
        // this.sldObjectsGroup.add(connections.groupSLD);
        // this.s3ldObjectsGroup.add(connections.group3LD);

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
        // blueMicroGeometry.vertices.push(...this.blueMicroLines);
        blueMicroGeometry.setFromPoints([...this.blueMicroLines]);
        const blueMicroLine = new THREE.LineSegments(blueMicroGeometry, blueMicroMaterial);

        const purpleGeometry = createBufferGeometry();
        const purpleMaterial = new THREE.LineBasicMaterial({
            color: 0x800080,
            linewidth: 3,
        });
        // purpleGeometry.vertices.push(...this.purpleLines);
        purpleGeometry.setFromPoints([...this.purpleLines]);
        const purpleLine = new THREE.LineSegments(purpleGeometry, purpleMaterial);

        this.sldObjectsGroup.add(whiteLine);
        this.s3ldObjectsGroup.add(redLine);
        this.sldObjectsGroup.add(blueMicroLine);
        this.sldObjectsGroup.add(purpleLine);
    }
}

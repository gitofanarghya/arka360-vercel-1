/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import * as THREE from 'three';
import createBufferGeometry from '../utils/meshUtils';
import { createTextElement } from './sldUtils';
import DropDownTool from './dropDownTool';
import { loadCenterList } from './sldConstants';
import { getThreeEllipse, createConnection, getDashedLine, getThreeArc, getThreeRectangle, getThreeRectangle1, getLine, getThreeRectangle1PolyLines, createPolyLineConnection } from './utils';

export default class LoadCenter {
    constructor(origin, endPoints, font, groupSLD, group3LD, groupExSLD, groupEx3LD, isMicroInverter = false, wireSizeData, wireSize, inverterName, acDisconnectPosition) {
        this.parentSLD = groupSLD;
        this.parent3LD = group3LD;
        this.parentExSLD = groupExSLD;
        this.parentEx3LD = groupEx3LD;
        this.origin = origin;
        [this.originX, this.originY] = this.origin;
        this.verticalSize = 70;
        this.horizontalSize = 55;
        this.connectionBoxSize = 6;
        this.isMicroInverter = isMicroInverter;
        if (this.isMicroInverter) {
            this.inverterName = wireSize.model.modelName;
        }
        else {
            this.inverterName = 'stringInverter';
        }
        this.iName = inverterName;
        this.iq = 7;
        this.acDisconnectPosition = acDisconnectPosition;
        this.sldObjectsGroup = new THREE.Group(); // Sld ObjectsGroup
        this.sldObjectsGroup.name = 'load-center-group-sld';
        this.s3ldObjectsGroup = new THREE.Group(); // 3Ld ObjectsGroup;
        this.s3ldObjectsGroup.name = 'load-center-group-3ld';
        this.exclusivesld = new THREE.Group(); // only exlusive to sld group;
        this.exclusivesld.name = 'load-center-group-exsld';
        this.exclusive3ld = new THREE.Group(); // only exlusive to 3ld group;
        this.exclusive3ld.name = 'load-center-group-ex3ld';
        this.toolGroup = new THREE.Group();
        this.startPoints = [];
        this.previousEndPoints = endPoints;
        this.font = font;
        this.noOfConnections = this.previousEndPoints.length;
        this.endPoints = []; // all end points of load center
        //
        this.topIqNo = 3;
        this.top10 = false;
        this.top15 = true;
        this.top10_15 = false;
        this.wireSizeData = wireSizeData;
        this.isCombinerBox = false;
        this.wireSize = wireSize; // for breaker size
        //
        this.whiteLines = [];
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
        this.greensld = [];
        this.green3ld = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.dashedLines = [];
        this.dashedLinesSld = [];
        this.dashedLines3ld = [];
        this.texts3LD = [];
        this.texts = [];
        this.textsSLD = [];
        //
        if (this.isMicroInverter) {
            const dropDownPosition = new THREE.Vector2(this.originX + this.horizontalSize, this.originY + this.verticalSize);
            this.dropDownTool = new DropDownTool(dropDownPosition.x, dropDownPosition.y, this);
            this.selected = 0;
        }
        this.createComponent();
    }
    createComponent() {
        if ((this.inverterName).includes('IQ8')) {
            this.iq = 8;
            this.topIqNo = 4;
        }
        let info = `(N) ENPHASE IQ\nCOMBINER BOX ${this.topIqNo}`;
        let infoTop = '15 A';
        if (this.top10) {
            infoTop = '10 A';
        }
        if (this.top10_15) {
            infoTop = '10/15 A';
        }
        // To get average breaker size value using breaker size from wiresize calculator
        let infoBreakerSize = Math.floor(this.wireSize.breakerSizes.loadCenter);
        if (Number.isNaN(infoBreakerSize)) {
            infoBreakerSize = 20;
        }
        else if (infoBreakerSize <= 60) {
            if (infoBreakerSize % 5 === 0 && this.wireSize.breakerSizes.loadCenter !== infoBreakerSize) {
                infoBreakerSize++;
            }
            for (let i = 1; i < 5; i++) {
                if (infoBreakerSize % 5 === 0) {
                    break;
                }
                infoBreakerSize++;
            }
        }
        else {
            if (infoBreakerSize % 10 === 0 && this.wireSize.breakerSizes.loadCenter !== infoBreakerSize) {
                infoBreakerSize++;
            }
            for (let i = 1; i < 10; i++) {
                if (infoBreakerSize % 10 === 0) {
                    break;
                }
                infoBreakerSize++;
            }
        }

        const infoN = `${infoBreakerSize} A`;
        this.verticalSize = 70;
        if (this.noOfConnections > 4) {
            this.verticalSize += (this.noOfConnections - 4) * 10;
            this.whiteLines.push(...getThreeRectangle1({
                width: this.horizontalSize,
                height: this.verticalSize,
                origin: this.origin,
            }));
            this.whitePolyLines.push(getThreeRectangle1PolyLines({
                width: this.horizontalSize,
                height: this.verticalSize,
                origin: this.origin,
            }));
        }

        // string Inverter always has a load center
        if (!this.isMicroInverter) {
            this.loadCenter = true;
            info = '(N) LOAD CENTER\n         240 VAC';
            if (this.noOfConnections <= 4) {
                this.texts.push({
                    position: new THREE.Vector3(this.originX + 26.5, this.originY + this.verticalSize + 38),
                    text: '(N) LOAD CENTER',
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX + 26.5, this.originY + this.verticalSize + 30),
                    text: '       240 VAC',
                    size: 7,
                });
                this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 26.5, this.originY + this.verticalSize + 30], 4));
                this.whiteLines.push(...getThreeRectangle1({
                    width: this.horizontalSize,
                    height: this.verticalSize + 20,
                    origin: this.origin,
                }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({
                    width: this.horizontalSize,
                    height: this.verticalSize + 20,
                    origin: this.origin,
                }));
            }
            else {
                this.loadCenter = true;
                this.texts.push({
                    position: new THREE.Vector3(this.originX + 24.5, this.originY + this.verticalSize + 20),
                    text: '(N) LOAD CENTER',
                    size: 7,
                });
                this.texts.push({
                    position: new THREE.Vector3(this.originX + 24.5, this.originY + this.verticalSize + 12),
                    text: '       240 VAC',
                    size: 7,
                });
                this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 24.5, this.originY + this.verticalSize + 20], 4));
            }
        }

        // Micro Inverter- connection <= 4 ? combiner box with envoy : load center with envoy
        else if (this.noOfConnections <= 4) {
            this.isCombinerBox = true;
            this.loadCenter = false;
            this.texts.push({
                position: new THREE.Vector3(this.originX + 36.5, this.originY + this.verticalSize + 55),
                text: '(N) ENPHASE IQ',
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + 36.5, this.originY + this.verticalSize + 47),
                text: `COMBINER BOX ${this.topIqNo}`,
                size: 7,
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 36.5, this.originY + this.verticalSize + 50], 4));
            this.whiteLines.push(...getThreeRectangle1({
                width: this.horizontalSize + 20,
                height: this.verticalSize + 40,
                origin: this.origin,
            }));
            this.whitePolyLines.push(getThreeRectangle1PolyLines({
                width: this.horizontalSize + 20,
                height: this.verticalSize + 40,
                origin: this.origin,
            }));
        }
        else {
            this.loadCenter = true;
            info = '(N) LOAD CENTER\n         240 VAC';
            this.texts.push({
                position: new THREE.Vector3(this.originX + 24.5, this.originY + this.verticalSize + 20),
                text: '(N) LOAD CENTER',
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + 24.5, this.originY + this.verticalSize + 12),
                text: '         240 VAC',
                size: 7,
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX + 24.5, this.originY + this.verticalSize + 20], 4));
        }


        const divisions = (this.verticalSize - 10) / (this.noOfConnections + 2);
        let r = divisions;
        let add = 0;
        let thwnNumber;
        if (this.wireSize.temprature.tempratureDc === 90) {
            thwnNumber = '-2';
        }
        else {
            thwnNumber = '';
        }
        if (this.isMicroInverter) {
            const info1 = `(${this.previousEndPoints.length * 2}) ${this.wireSizeData.micro.junctionBoxToLoadCenter.conductorSize} AWG THWN${thwnNumber}
(1)${this.wireSizeData.micro.junctionBoxToLoadCenter.ground} AWG THWN${thwnNumber} GND 
IN ${this.wireSizeData.micro.junctionBoxToLoadCenter.conduitSize}'' EMT CONDUIT RUN`;
            /* this.whiteLines.push(...getConnectionRing(
                [this.originX - 20, this.originY + 5],
                this.verticalSize,
            )); */
            this.whiteEllipse.push({
                position: new THREE.Vector3(this.originX - 18.5, this.originY + 5 + this.verticalSize / 2),
                secondPosition: new THREE.Vector3(0, this.verticalSize / 2),
                ratio: this.verticalSize > 50 ? 3 / this.verticalSize / 2 : 1.5 / this.verticalSize / 2,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            });
            const points = [];
            points.push(...getThreeEllipse(
                [this.originX - 18.5, this.originY + 5 + this.verticalSize / 2],
                this.verticalSize,
            ));
            for (let i = 0; i < points.length - 1; i++) {
                this.whiteLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            this.whiteLines.push(
                new THREE.Vector3(this.originX - 18.5, this.originY + 5),
                new THREE.Vector3(this.originX - 18.5, this.originY + 5 - (this.verticalSize / 1.5)),
            );
            this.whitePolyLines.push({
                points: [
                    new THREE.Vector3(this.originX - 18.5, this.originY + 5),
                    new THREE.Vector3(this.originX - 18.5, this.originY + 5 - (this.verticalSize / 1.5)),
                ]
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info1, [
                this.originX - 20,
                this.originY - (this.verticalSize + 10) + 20,
            ]));
            this.texts.push({
                position: new THREE.Vector3(this.originX - 20, this.originY - this.verticalSize + 10),
                text: `(3) ${this.wireSizeData.micro.junctionBoxToLoadCenter.conductorSize} AWG THWN${thwnNumber}`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 20, this.originY - this.verticalSize + 2),
                text: `(1)${this.wireSizeData.micro.junctionBoxToLoadCenter.ground} AWG THWN${thwnNumber} GND `,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 20, this.originY - this.verticalSize - 6),
                text: `IN ${this.wireSizeData.micro.junctionBoxToLoadCenter.conduitSize}'' EMT CONDUIT RUN`,
                size: 7,
            });
            if (this.noOfConnections > 4) {
                add = (this.noOfConnections - 4) * 10;
            }
            if (this.noOfConnections > 4) {
                // IQEnvoy Outside
                this.redLines.push(
                    new THREE.Vector3(
                        this.originX,
                        this.originY + r + add + 54,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 0.5,
                        this.originY + r + add + 54,
                    ),
                );
                this.redPolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX,
                            this.originY + r + add + 54,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r + add + 54,
                        ),
                    ]
                });
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + add + 55,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc(
                    {
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 3,
                            this.originY + r + add + 55,
                        ],
                        radius: 3,
                        startAngle: Math.PI,
                        endAngle: 0,
                    },
                    'red',
                ));
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + add + 54,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + add + 54,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + add + 54,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + add + 54,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r + add + 54,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 10,
                        this.originY + r + add + 54,
                    ),
                );
                this.redPolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r + add + 54,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY + r + add + 54,
                        ),
                    ]
                });
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX,
                        this.originY + r + add + 50,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 0.5,
                        this.originY + r + add + 50,
                    ),
                );
                this.whitePolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX,
                            this.originY + r + add + 50,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r + add + 50,
                        ),
                    ]
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + add + 51,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + add + 51,
                    ],
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                }));
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r + add + 50,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 14,
                        this.originY + r + add + 50,
                    ),
                );
                this.whitePolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r + add + 50,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + r + add + 50,
                        ),
                    ]
                });

                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + add + 50,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + add + 50,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));

                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + add + 50,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + add + 50,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));
                this.sldObjectsGroup.add(createTextElement(this.font, infoN, [
                    this.originX + (this.horizontalSize / 2) - 10,
                    this.originY + r + add + 56.5,
                ], 4));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 10,
                        this.originY + r + add + 56.5,
                    ),
                    text: infoN,
                    size: 7,
                });
            }

            // IQEnvoy inside
            else {
                // line between circle and rectangle
                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 12,
                        this.originY + 64,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 0.5,
                        this.originY + 64,
                    ),
                );
                this.redPolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 12,
                            this.originY + 64,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + 64,
                        ),
                    ]
                });

                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 12,
                        this.originY + 64,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 12,
                        this.originY + 79,
                    ),
                );
                this.redPolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 12,
                            this.originY + 64,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 12,
                            this.originY + 79,
                        ),
                    ]
                });
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + 65,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc(
                    {
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 3,
                            this.originY + 65,
                        ],
                        radius: 3,
                        startAngle: Math.PI,
                        endAngle: 0,
                    },
                    'red',
                ));
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + 64,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + 64,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + 64,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + 64,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + 64,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 10,
                        this.originY + 64,
                    ),
                );
                this.redPolyLines.push({
                    points: [
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + 64,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY + 64,
                        ),
                    ]
                });
                this.whiteLines.push(...getThreeRectangle1({
                    width: 8,
                    height: 6,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 18,
                        this.originY + 79,
                    ],
                }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({
                    width: 8,
                    height: 6,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 18,
                        this.originY + 79,
                    ],
                }));
                this.whiteLines.push(...getThreeRectangle1({
                    width: 1,
                    height: 3,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 16.5,
                        this.originY + 79 + 1.5,
                    ],
                }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({
                    width: 1,
                    height: 3,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 16.5,
                        this.originY + 79 + 1.5,
                    ],
                }));

                this.whiteLines.push(...getThreeRectangle1({
                    width: 1,
                    height: 2,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 12.5,
                        this.originY + 79 + 2,
                    ],
                }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({
                    width: 1,
                    height: 2,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 12.5,
                        this.originY + 79 + 2,
                    ],
                }));
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 16,
                        this.originY + 60,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 0.5, this.originY + 60),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 16,
                            this.originY + 60,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 0.5, this.originY + 60),
                    ]
                });

                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 16,
                        this.originY + 60,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 16, this.originY + 79),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 16,
                            this.originY + 60,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 16, this.originY + 79),
                    ]
                });
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 16,
                        this.originY + 85,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 16, this.originY + 95),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 16,
                            this.originY + 85,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 16, this.originY + 95),
                    ]
                });
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 16,
                        this.originY + 95,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 1, this.originY + 95),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 16,
                            this.originY + 95,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 1, this.originY + 95),
                    ]
                });
                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 12,
                        this.originY + 85,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 12, this.originY + 91),
                );
                this.redPolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 12,
                            this.originY + 85,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 12, this.originY + 91),
                    ]
                });
                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 12,
                        this.originY + 91,
                    ),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 1, this.originY + 91),
                );
                this.redPolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 12,
                            this.originY + 91,
                        ),
                        new THREE.Vector3(this.originX + (this.horizontalSize / 2) - 1, this.originY + 91),
                    ]
                });
                this.whiteLines.push(...getThreeRectangle1({
                    width: 30,
                    height: 30,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 1,
                        this.originY + 75,
                    ],
                }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({
                    width: 30,
                    height: 30,
                    origin: [
                        this.originX + (this.horizontalSize / 2) - 1,
                        this.originY + 75,
                    ],
                }));
                if (this.iq === 8) {
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 14, this.originY + 90),
                        text: '      IQ -',
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 14, this.originY + 82),
                        text: 'GATEWAY',
                        size: 7,
                    });
                    this.sldObjectsGroup.add(createTextElement(
                        this.font,
                        '      IQ - \nGATEWAY',
                        [
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + 90,
                        ],
                        4,
                    ));
                }
                else {
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 14, this.originY + 95),
                        text: 'IQ-ENVOY',
                        size: 7,
                    });
                    this.sldObjectsGroup.add(createTextElement(
                        this.font,
                        'IQ-ENVOY',
                        [
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + 95,
                        ],
                        4,
                    ));
                }


                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + 60 + 1,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + 60 + 1,
                    ],
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                }));
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + 60,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 14,
                        this.originY + 60,
                    ),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + 60,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + 60,
                        ),
                    ]
                });
                this.sldObjectsGroup.add(createTextElement(this.font, infoTop, [
                    this.originX + (this.horizontalSize / 2),
                    this.originY + 71.5,
                ], 4));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + 71.5,
                    ),
                    text: infoTop,
                    size: 7,
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + 60,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + 60,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));

                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + 60,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + 60,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));
            }
        }

        for (
            let i = 0;
            i < this.noOfConnections;
            i++ // for connections
        ) {
            if (i === 0) {
                r += divisions;
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 5,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc(
                    {
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 3,
                            this.originY + r + 5,
                        ],
                        radius: 3,
                        startAngle: Math.PI,
                        endAngle: 0,
                    },
                    'red',
                ));
                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r + 4,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 10,
                        this.originY + r + 4,
                    ),
                );
                this.redPolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r + 4,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY + r + 4,
                        ),
                    ]
                });
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + 4,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + 4,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + 4,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + 4,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));


                if (this.isMicroInverter && !this.isCombinerBox) {
                    this.startPoints.unshift({
                        red:
                        [this.originX, this.originY + r + 4 + divisions],
                        white:
                        [this.originX, this.originY + r + divisions],
                    });

                    this.redLines.push(
                        new THREE.Vector3(
                            this.originX + 10,
                            this.originY + r + 4,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r + 4,
                        ),
                    );

                    this.redPolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + 10,
                                this.originY + r + 4,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 0.5,
                                this.originY + r + 4,
                            ),
                        ]
                    });

                    this.whiteLines.push(
                        new THREE.Vector3(
                            this.originX + 14,
                            this.originY + r,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r,
                        ),
                    );

                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + 14,
                                this.originY + r,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 0.5,
                                this.originY + r,
                            ),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, infoTop, [
                        this.originX + (this.horizontalSize / 2) - 10,
                        this.originY + r + 7.5,
                    ], 4));
                    this.texts.push({
                        position: new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 10,
                            this.originY + r + 7.5,
                        ),
                        text: infoTop,
                        size: 7,
                    });


                    this.redLines.push(
                        new THREE.Vector3(
                            this.originX + 10,
                            this.originY + r + 4,
                        ),
                        new THREE.Vector3(
                            this.originX + 10,
                            this.originY - 12,
                        ),
                    );
                    this.redPolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + 10,
                                this.originY + r + 4,
                            ),
                            new THREE.Vector3(
                                this.originX + 10,
                                this.originY - 12,
                            ),
                        ]
                    });

                    this.whiteLines.push(
                        new THREE.Vector3(
                            this.originX + 14,
                            this.originY + r,
                        ),
                        new THREE.Vector3(
                            this.originX + 14,
                            this.originY - 12,
                        ),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + 14,
                                this.originY + r,
                            ),
                            new THREE.Vector3(
                                this.originX + 14,
                                this.originY - 12,
                            ),
                        ]
                    });

                    this.whiteLines.push(...getThreeRectangle1({
                        width: 8,
                        height: 6,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 19.5,
                            this.originY - 18,
                        ],
                    }));
                    this.whitePolyLines.push(getThreeRectangle1PolyLines({
                        width: 8,
                        height: 6,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 19.5,
                            this.originY - 18,
                        ],
                    }));
                    this.whiteLines.push(...getThreeRectangle1({
                        width: 1,
                        height: 3,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 18,
                            this.originY - 16.5,
                        ],
                    }));
                    this.whitePolyLines.push(getThreeRectangle1PolyLines({
                        width: 1,
                        height: 3,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 18,
                            this.originY - 16.5,
                        ],
                    }));

                    this.whiteLines.push(...getThreeRectangle1({
                        width: 1,
                        height: 2,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 14,
                            this.originY - 16,
                        ],
                    }));
                    this.whitePolyLines.push(getThreeRectangle1PolyLines({
                        width: 1,
                        height: 2,
                        origin: [
                            this.originX + (this.horizontalSize / 2) - 14,
                            this.originY - 16,
                        ],
                    }));

                    this.redLines.push(
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 11.5,
                            this.originY - 17,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY - 17,
                        ),
                    );
                    this.redPolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 11.5,
                                this.originY - 17,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) + 10,
                                this.originY - 17,
                            ),
                        ]
                    });

                    this.whiteLines.push(
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 11.5,
                            this.originY - 13,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY - 13,
                        ),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 11.5,
                                this.originY - 13,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) + 10,
                                this.originY - 13,
                            ),
                        ]
                    });

                    this.whiteLines.push(...getThreeRectangle1({
                        width: 30,
                        height: 30,
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY - 40,
                        ],
                    }));
                    this.whitePolyLines.push(getThreeRectangle1PolyLines({
                        width: 30,
                        height: 30,
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY - 40,
                        ],
                    }));
                    if (this.iq === 8) {
                        this.texts.push({
                            position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 25, this.originY - 20),
                            text: '      IQ - ',
                            size: 7,
                        });
                        this.texts.push({
                            position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 25, this.originY - 28),
                            text: 'GATEWAY',
                            size: 7,
                        });
                        this.sldObjectsGroup.add(createTextElement(
                            this.font,
                            '      IQ - \nGATEWAY',
                            [
                                this.originX + (this.horizontalSize / 2) + 25,
                                this.originY - 20,
                            ],
                            4,
                        ));
                    }
                    else {
                        this.texts.push({
                            position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 25, this.originY - 15),
                            text: 'IQ-ENVOY',
                            size: 7,
                        });
                        this.sldObjectsGroup.add(createTextElement(
                            this.font,
                            'IQ-ENVOY',
                            [
                                this.originX + (this.horizontalSize / 2) + 25,
                                this.originY - 15,
                            ],
                            4,
                        ));
                    }

                    this.texts.push({
                        position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 25, this.originY - 50),
                        text: '(N) MONITORING',
                        size: 7,
                    });
                    this.texts.push({
                        position: new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 25, this.originY - 58),
                        text: 'UNIT - ENVOY',
                        size: 7,
                    });
                    this.sldObjectsGroup.add(createTextElement(
                        this.font,
                        '(N) MONITORING\n   UNIT - ENVOY',
                        [
                            this.originX + (this.horizontalSize / 2) + 25,
                            this.originY - 50,
                        ],
                        4,
                    ));
                }
                else {
                    this.startPoints.unshift({
                        red:
                        [this.originX, this.originY + r + 4],
                        white:
                        [this.originX, this.originY + r],
                    });

                    this.redLines.push(
                        new THREE.Vector3(
                            this.originX,
                            this.originY + r + 4,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r + 4,
                        ),
                    );
                    this.redPolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX,
                                this.originY + r + 4,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 0.5,
                                this.originY + r + 4,
                            ),
                        ]
                    });

                    this.whiteLines.push(
                        new THREE.Vector3(
                            this.originX,
                            this.originY + r,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r,
                        ),
                    );
                    this.whitePolyLines.push({
                        points:[
                            new THREE.Vector3(
                                this.originX,
                                this.originY + r,
                            ),
                            new THREE.Vector3(
                                this.originX + (this.horizontalSize / 2) - 0.5,
                                this.originY + r,
                            ),
                        ]
                    });
                    this.sldObjectsGroup.add(createTextElement(this.font, infoN, [
                        this.originX + (this.horizontalSize / 2) - 10,
                        this.originY + r + 6.5,
                    ], 4));
                    this.texts.push({
                        position: new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 10,
                            this.originY + r + 6.5,
                        ),
                        text: infoN,
                        size: 7,
                    });
                }
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 1,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 1,
                    ],
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                }));
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 14,
                        this.originY + r,
                    ),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + r,
                        ),
                    ]
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));

                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));
            }
            else {
                this.redLines.push(
                    new THREE.Vector3(this.originX, this.originY + r + 4),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 0.5,
                        this.originY + r + 4,
                    ),
                );
                this.redPolyLines.push({
                    points:[
                        new THREE.Vector3(this.originX, this.originY + r + 4),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r + 4,
                        ),
                    ]
                });
                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 5,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc(
                    {
                        origin: [
                            this.originX + (this.horizontalSize / 2) + 3,
                            this.originY + r + 5,
                        ],
                        radius: 3,
                        startAngle: Math.PI,
                        endAngle: 0,
                    },
                    'red',
                ));

                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + 4,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r + 4,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + 4,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.s3ldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r + 4,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'red'));

                this.redLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r + 4,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 10,
                        this.originY + r + 4,
                    ),
                );
                this.redPolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r + 4,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 10,
                            this.originY + r + 4,
                        ),
                    ]
                });
                this.whiteLines.push(
                    new THREE.Vector3(this.originX, this.originY + r),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 0.5,
                        this.originY + r,
                    ),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(this.originX, this.originY + r),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) - 0.5,
                            this.originY + r,
                        ),
                    ]
                });
                if (this.isMicroInverter && !this.isCombinerBox) {
                    this.startPoints.unshift({
                        red:
                        [this.originX, this.originY + r + 4 + divisions],
                        white:
                        [this.originX, this.originY + r + divisions],
                    });
                }
                else {
                    this.startPoints.unshift({
                        red:
                        [this.originX, this.originY + r + 4],
                        white:
                        [this.originX, this.originY + r],
                    });
                }
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 1,
                    ),
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 3,
                        this.originY + r + 1,
                    ],
                    radius: 3,
                    startAngle: Math.PI,
                    endAngle: 0,
                }));
                this.whiteLines.push(
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6.5,
                        this.originY + r,
                    ),
                    new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 14,
                        this.originY + r,
                    ),
                );
                this.whitePolyLines.push({
                    points:[
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 6.5,
                            this.originY + r,
                        ),
                        new THREE.Vector3(
                            this.originX + (this.horizontalSize / 2) + 14,
                            this.originY + r,
                        ),
                    ]
                });

                this.sldObjectsGroup.add(createTextElement(this.font, infoN, [
                    this.originX + (this.horizontalSize / 2) - 10,
                    this.originY + r + 6.5,
                ], 4));
                this.texts.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) - 10,
                        this.originY + r + 6.5,
                    ),
                    text: infoN,
                    size: 7,
                });
                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2) + 6,
                        this.originY + r,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));

                this.whiteCircles.push({
                    position: new THREE.Vector3(
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r,
                    ),
                    radius: 0.5,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.sldObjectsGroup.add(getThreeArc({
                    origin: [
                        this.originX + (this.horizontalSize / 2),
                        this.originY + r,
                    ],
                    radius: 0.5,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }, 'white'));
            }
            r += divisions;
        }

        let connectionHeightChangeFactor = 0;
        if (this.noOfConnections > 4) {
            connectionHeightChangeFactor += (this.noOfConnections - 4) * 10;
        }
        this.redLines.push(
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 10,
                this.originY + this.verticalSize - 5,
            ),
            new THREE.Vector3(
                this.originX + this.horizontalSize + 32,
                this.originY + this.verticalSize - 5,
            ),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 10,
                    this.originY + this.verticalSize - 5,
                ),
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 32,
                    this.originY + this.verticalSize - 5,
                ),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(
                this.originX + this.horizontalSize + 32,
                this.originY + this.verticalSize - 5,
            ),
            new THREE.Vector3(
                this.originX + this.horizontalSize + 32,
                this.originY + this.verticalSize - 5,
            ),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 32,
                    this.originY + this.verticalSize - 5,
                ),
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 32,
                    this.originY + this.verticalSize - 5,
                ),
            ]
        });
        this.endPoints.push({
            red:
                [
                    this.originX + this.horizontalSize + 32,
                    this.originY + this.verticalSize - 5,
                ],
        });
        this.redLines.push(
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 10,
                this.originY + this.verticalSize - 5,
            ),
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 10,
                this.originY + divisions + 5,
            ),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 10,
                    this.originY + this.verticalSize - 5,
                ),
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 10,
                    this.originY + divisions + 5,
                ),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 14,
                this.originY + this.verticalSize - 9,
            ),
            new THREE.Vector3(
                this.originX + this.horizontalSize + 26,
                this.originY + this.verticalSize - 9,
            ),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 14,
                    this.originY + this.verticalSize - 9,
                ),
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 26,
                    this.originY + this.verticalSize - 9,
                ),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(
                this.originX + this.horizontalSize + 26,
                this.originY + this.verticalSize - 9,
            ),
            new THREE.Vector3(
                this.originX + this.horizontalSize + 26,
                this.originY + this.verticalSize - 9,
            ),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 26,
                    this.originY + this.verticalSize - 9,
                ),
                new THREE.Vector3(
                    this.originX + this.horizontalSize + 26,
                    this.originY + this.verticalSize - 9,
                ),
            ]
        });
        this.endPoints[0].white = [
            this.originX + this.horizontalSize + 26,
            this.originY + this.verticalSize - 9,
        ];
        this.whiteLines.push(
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 14,
                this.originY + this.verticalSize - 9,
            ),
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 14,
                this.originY + divisions + 5,
            ),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 14,
                    this.originY + this.verticalSize - 9,
                ),
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 14,
                    this.originY + divisions + 5,
                ),
            ]
        });
        // }

        // Ground and Neutral
        this.whitesld.push(...getThreeRectangle1({
            width: 9,
            height: 9,
            origin: [
                this.originX + (this.horizontalSize / 2) + 5.5,
                this.originY + 2,
            ],
        }));
        this.whitePolySld.push(getThreeRectangle1PolyLines({
            width: 9,
            height: 9,
            origin: [
                this.originX + (this.horizontalSize / 2) + 5.5,
                this.originY + 2,
            ],
        }));
        this.exclusivesld.add(createTextElement(
            this.font,
            'G',
            [
                this.originX + (this.horizontalSize / 2) + 10,
                this.originY + 6.5,
            ],
            4,
            'green',
        ));
        this.textsSLD.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 10,
                this.originY + 6.5,
            ),
            text: 'G',
            size: 7,
        });

        this.blueLines.push(...getThreeRectangle1(
            {
                width: 3,
                height: 9,
                origin: [
                    this.originX + (this.horizontalSize / 2) - 1.5,
                    this.originY - (this.connectionBoxSize / 2) + 10,
                ],
            },
            'grey',
        ));
        this.bluePolyLines.push(getThreeRectangle1PolyLines(
            {
                width: 3,
                height: 9,
                origin: [
                    this.originX + (this.horizontalSize / 2) - 1.5,
                    this.originY - (this.connectionBoxSize / 2) + 10,
                ],
            },
            'grey',
        ));

        this.blueLines.push(
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) - 1.5,
                this.originY - (this.connectionBoxSize / 2) + 16,
            ),
            new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 1.5,
                this.originY - (this.connectionBoxSize / 2) + 16,
            ),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) - 1.5,
                    this.originY - (this.connectionBoxSize / 2) + 16,
                ),
                new THREE.Vector3(
                    this.originX + (this.horizontalSize / 2) + 1.5,
                    this.originY - (this.connectionBoxSize / 2) + 16,
                ),
            ]
        });
        this.s3ldObjectsGroup.add(getLine(
            [this.originX + (this.horizontalSize / 2) - 1.5, this.originY - (this.connectionBoxSize / 2) + 16],
            [this.originX + (this.horizontalSize / 2) + 1.5, this.originY - (this.connectionBoxSize / 2) + 16], 'grey',
        ));
        this.s3ldObjectsGroup.add(createTextElement(this.font, 'N', [this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 17.5], 2, 'grey'));
        this.texts3LD.push({
            position: new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 17.5),
            text: 'N',
            size: 7,
        });


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 14,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 14,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 14,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 14,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 13,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) - 0.5,
                this.originY - (this.connectionBoxSize / 2) + 13,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        this.blueCircles.push({
            position: new THREE.Vector3(
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 13,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + (this.horizontalSize / 2) + 0.5,
                this.originY - (this.connectionBoxSize / 2) + 13,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'grey'));


        //

        this.s3ldObjectsGroup.add(getThreeRectangle(
            {
                width: 3,
                height: 9,
                origin: [
                    this.originX + 35,
                    this.originY - (this.connectionBoxSize / 2) + 6,
                ],
            },
            'green',
        ));
        this.green3ld.push(...getThreeRectangle1(
            {
                width: 3,
                height: 9,
                origin: [
                    this.originX + 35,
                    this.originY - (this.connectionBoxSize / 2) + 6,
                ],
            },
            'green',
        ));
        this.greenPoly3ld.push(getThreeRectangle1PolyLines(
            {
                width: 3,
                height: 9,
                origin: [
                    this.originX + 35,
                    this.originY - (this.connectionBoxSize / 2) + 6,
                ],
            },
            'green',
        ));
        this.green3ld.push(
            new THREE.Vector3(
                this.originX + 35,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ),
            new THREE.Vector3(
                this.originX + 38,
                this.originY - (this.connectionBoxSize / 2) + 12,
            ),
        );
        this.greenPoly3ld.push({
            points:[
                new THREE.Vector3(
                    this.originX + 35,
                    this.originY - (this.connectionBoxSize / 2) + 12,
                ),
                new THREE.Vector3(
                    this.originX + 38,
                    this.originY - (this.connectionBoxSize / 2) + 12,
                ),
            ]
        });
        this.s3ldObjectsGroup.add(getLine(
            [this.originX + 35, this.originY - (this.connectionBoxSize / 2) + 12],
            [this.originX + 38, this.originY - (this.connectionBoxSize / 2) + 12], 'green',
        ));
        this.s3ldObjectsGroup.add(createTextElement(this.font, 'G', [this.originX + 36.5, this.originY - (this.connectionBoxSize / 2) + 13.5], 2, 'green'));
        this.texts3LD.push({
            position: new THREE.Vector3(this.originX + 36.5, this.originY - (this.connectionBoxSize / 2) + 13.5),
            text: 'G',
            size: 7,
        });


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 12 - 2,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 12 - 2,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 12 - 2,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 12 - 2,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 8,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 8,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 8,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 8,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 9,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 36,
                this.originY - (this.connectionBoxSize / 2) + 9,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));


        this.greenCircles3ld.push({
            position: new THREE.Vector3(
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 9,
            ),
            radius: 0.35,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc({
            origin: [
                this.originX + 37,
                this.originY - (this.connectionBoxSize / 2) + 9,
            ],
            radius: 0.35,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }, 'green'));
        this.dashedLines.push(
            new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
            new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY + 10),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY + 10),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10],
            [this.originX + (this.horizontalSize / 2) + 9, this.originY + 10],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY + 10),
            new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY + 10),
                new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [this.originX + (this.horizontalSize / 2) + 9, this.originY + 10],
            [this.originX + this.horizontalSize + 32, this.originY + 10],
            'green',
        ));
        this.dashedLines.push(
            new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
            new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
                new THREE.Vector3(this.originX + this.horizontalSize + 32, this.originY + 10),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [this.originX + this.horizontalSize + 32, this.originY + 10],
            [this.originX + this.horizontalSize + 32, this.originY + 10],
            'green',
        ));
        this.blueLines.push(
            new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 10),
            new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY + 14),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 10),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY + 14),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY + 14),
            new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY + 14),
                new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
            new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
                new THREE.Vector3(this.originX + this.horizontalSize + 26, this.originY + 14),
            ]
        });
        // if (this.acDisconnectPosition === 1 || this.acDisconnectPosition === 2) {
        //     this.endPoints[0].blue = [
        //         this.originX + this.horizontalSize + 26,
        //         this.originY + this.verticalSize - 42.5,
        //     ];
        // }
        // else {
        this.endPoints[0].blue = [
            this.originX + this.horizontalSize + 26,
            this.originY + 14,
        ];
        // }

        this.endPoints[0].green = [
            this.originX + this.horizontalSize + 32,
            this.originY + 10,
        ];
        let connections;
        let polyLineConnections;
        if (!this.isMicroInverter) {
            connections = createConnection(this.startPoints, this.previousEndPoints, 50, 5, 60);
            polyLineConnections = createPolyLineConnection(this.startPoints, this.previousEndPoints, 50, 5, 60);
        }
        else {
            connections = createConnection(this.startPoints, this.previousEndPoints, 2, 5, 10);
            polyLineConnections = createPolyLineConnection(this.startPoints, this.previousEndPoints, 2, 5, 10);
        }
        this.whiteLines.push(...connections.whitePoints);
        this.redLines.push(...connections.redPoints);

        this.whitePolyLines.push(...polyLineConnections.tempWhitePoints);
        this.redPolyLines.push(...polyLineConnections.tempRedPoints);

        const length = this.previousEndPoints.length;
        // ground
        for (let i = 0; i < this.previousEndPoints.length - 1; i += 1) {
            if (this.previousEndPoints[i].green) {
                this.dashedLines.push(
                    new THREE.Vector3(this.previousEndPoints[i].green[0], this.previousEndPoints[i].green[1]),
                    new THREE.Vector3(this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]),
                );
                this.dashedPolyLines.push({
                    points:[
                        new THREE.Vector3(this.previousEndPoints[i].green[0], this.previousEndPoints[i].green[1]),
                        new THREE.Vector3(this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]),
                    ]
                });
                this.dashedLines.push(
                    new THREE.Vector3(this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]),
                    new THREE.Vector3(this.previousEndPoints[length - 1].green[0] + 30, this.previousEndPoints[length - 1].green[1]),
                );
                this.dashedPolyLines.push({
                    points:[
                        new THREE.Vector3(this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]),
                        new THREE.Vector3(this.previousEndPoints[length - 1].green[0] + 30, this.previousEndPoints[length - 1].green[1]),
                    ]
                });
                this.sldObjectsGroup.add(getDashedLine(
                    [this.previousEndPoints[i].green[0], this.previousEndPoints[i].green[1]],
                    [this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]],
                    'green',
                ));
                this.sldObjectsGroup.add(getDashedLine(
                    [this.previousEndPoints[i].green[0] + 30, this.previousEndPoints[i].green[1]],
                    [this.previousEndPoints[length - 1].green[0] + 30, this.previousEndPoints[length - 1].green[1]],
                    'green',
                ));
            }
            if (this.previousEndPoints[i].blue) {
                this.blueLines.push(
                    new THREE.Vector3(this.previousEndPoints[i].blue[0], this.previousEndPoints[i].blue[1]),
                    new THREE.Vector3(this.previousEndPoints[i].blue[0] + 35, this.previousEndPoints[i].blue[1]),
                );
                this.bluePolyLines.push({
                    points:[
                        new THREE.Vector3(this.previousEndPoints[i].blue[0], this.previousEndPoints[i].blue[1]),
                        new THREE.Vector3(this.previousEndPoints[i].blue[0] + 35, this.previousEndPoints[i].blue[1]),
                    ]
                });
                this.blueLines.push(
                    new THREE.Vector3(this.previousEndPoints[i].blue[0] + 35, this.previousEndPoints[i].blue[1]),
                    new THREE.Vector3(this.previousEndPoints[length - 1].blue[0] + 35, this.previousEndPoints[length - 1].blue[1]),
                );
                this.bluePolyLines.push({
                    points:[
                        new THREE.Vector3(this.previousEndPoints[i].blue[0] + 35, this.previousEndPoints[i].blue[1]),
                        new THREE.Vector3(this.previousEndPoints[length - 1].blue[0] + 35, this.previousEndPoints[length - 1].blue[1]),
                    ]
                });
            }
        }
        if (this.previousEndPoints[length - 1].green && this.isMicroInverter) {
            this.dashedLines.push(
                new THREE.Vector3(this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1] - 10),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10),
            );
            this.dashedPolyLines.push({
                points:[
                    new THREE.Vector3(this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1] - 10),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10),
                ]
            });
            this.dashedLines.push(
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
            );
            this.dashedPolyLines.push({
                points:[
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
                ]
            });
            this.sldObjectsGroup.add(getDashedLine(
                [this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1] - 10],
                [this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10],
                'green',
            ));
            this.sldObjectsGroup.add(getDashedLine(
                [this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1] - 10],
                [this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10],
                'green',
            ));
        }
        else if (this.previousEndPoints[length - 1].green && !this.isMicroInverter) {
            this.dashedLines.push(
                new THREE.Vector3(this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1]),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]),
            );
            this.dashedPolyLines.push({
                points:[
                    new THREE.Vector3(this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1]),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]),
                ]
            });
            this.dashedLines.push(
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
            );
            this.dashedPolyLines.push({
                points:[
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10),
                ]
            });
            this.sldObjectsGroup.add(getDashedLine(
                [this.previousEndPoints[length - 1].green[0], this.previousEndPoints[length - 1].green[1]],
                [this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]],
                'green',
            ));
            this.sldObjectsGroup.add(getDashedLine(
                [this.originX + (this.horizontalSize / 2) + 9, this.previousEndPoints[length - 1].green[1]],
                [this.originX + (this.horizontalSize / 2) + 9, this.originY - (this.connectionBoxSize / 2) + 10],
                'green',
            ));
        }
        // blue
        if (this.previousEndPoints[length - 1].blue) {
            this.blueLines.push(
                new THREE.Vector3(this.previousEndPoints[length - 1].blue[0], this.previousEndPoints[length - 1].blue[1]),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.previousEndPoints[length - 1].blue[1]),
            );
            this.bluePolyLines.push({
                points:[
                    new THREE.Vector3(this.previousEndPoints[length - 1].blue[0], this.previousEndPoints[length - 1].blue[1]),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.previousEndPoints[length - 1].blue[1]),
                ]
            });
            this.blueLines.push(
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.previousEndPoints[length - 1].blue[1]),
                new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 10),
            );
            this.bluePolyLines.push({
                points:[
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.previousEndPoints[length - 1].blue[1]),
                    new THREE.Vector3(this.originX + (this.horizontalSize / 2), this.originY - (this.connectionBoxSize / 2) + 10),
                ]
            });
        }
        const whiteGeometry = createBufferGeometry();
        const whiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        // whiteGeometry.vertices.push(...this.whiteLines);
        whiteGeometry.setFromPoints([...this.whiteLines]);
        const whiteLine = new THREE.LineSegments(whiteGeometry, whiteMaterial);

        const redGeometry = createBufferGeometry();
        const redMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        // redGeometry.vertices.push(...this.redLines);
        redGeometry.setFromPoints([...this.redLines]);
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

        const blueGeometry = createBufferGeometry();
        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x808080,
            linewidth: 3,
        });
        // blueGeometry.vertices.push(...this.blueLines);
        blueGeometry.setFromPoints([...this.blueLines]);
        const blueLine = new THREE.LineSegments(blueGeometry, blueMaterial);

        const whitesldGeometry = createBufferGeometry();
        // whitesldGeometry.vertices.push(...this.whitesld);
        whitesldGeometry.setFromPoints([...this.whitesld]);
        const whiteLinesld = new THREE.LineSegments(whitesldGeometry, whiteMaterial);

        this.sldObjectsGroup.add(whiteLine);
        this.s3ldObjectsGroup.add(blueLine);
        this.sldObjectsGroup.add(blueMicroLine);
        this.sldObjectsGroup.add(purpleLine);
        this.s3ldObjectsGroup.add(redLine);
        this.exclusivesld.add(whiteLinesld);

        this.parentSLD.add(this.sldObjectsGroup);
        this.parent3LD.add(this.s3ldObjectsGroup);
        this.parentExSLD.add(this.exclusivesld);
        this.parentEx3LD.add(this.exclusive3ld);
    }
    getModelGroup() {
        return this.sldObjectsGroup;
    }
    getInnerBox() {
        return this.s3ldObjectsGroup;
    }
    selectionControl(i) {
        for (let j = 0; j < this.parentSLD.children.length; j += 1) {
            if (this.parentSLD.children[j].name === 'load-center-group-sld') {
                this.parentSLD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parent3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'load-center-group-3ld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentExSLD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'load-center-group-exsld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentEx3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].name === 'load-center-group-ex3ld') {
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
            this.top15 = true;
            this.top10 = false;
            this.top10_15 = false;
        }
        if (i === 1) {
            this.top15 = false;
            this.top10 = true;
            this.top10_15 = false;
        }
        if (i === 2) {
            this.top15 = false;
            this.top10 = false;
            this.top10_15 = true;
        }
        this.createComponent();
    }
    getNames() {
        return loadCenterList;
    }
    getDefault() {
        return this.selected;
    }
}

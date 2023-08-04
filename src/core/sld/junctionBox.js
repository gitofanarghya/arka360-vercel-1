/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import * as utils from './utils';
import PanelGroup from './panelGroup';
import * as sldConstants from './sldConstants';
import { createTextElement, uncentredTextElement } from './sldUtils';

export default class JunctionBox {
    constructor(centre, size, font, type, leftOffset, optimizer = false, wireSize, last = false) {
        this.panelType = type;
        this.wireSize = wireSize;
        const {
            extraSpace,
            width,
            smallboxsize,
        } = sldConstants.junctionBoxDimensions;
        const connectionPointsGap = smallboxsize * 4;
        const height = extraSpace + (connectionPointsGap * (size));
        const [x, y] = centre;
        const origin = [x - (width / 2), y - (height / 2)];

        this.centre = centre;
        this.size = size;
        this.font = font;
        this.width = width;
        this.smallboxsize = smallboxsize;
        this.isLast = last;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup3ld = new THREE.Group();
        this.exclusivesld = new THREE.Group();
        this.exclusive3ld = new THREE.Group();

        this.whiteLines = [];
        this.whitePolyLines = [];
        this.bluePolyLines = [];
        this.purplePolyLines = [];
        this.blueMicroPolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.whitesld = [];
        this.white3ld = [];
        this.redLines = [];
        this.redPolyLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.greenPolyLines = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];

        this.dashedLines = [];
        this.dashedPolyLines = [];

        this.endpoints = [];
        this.startpoints = [];
        this.boxEndPoints = [];

        this.optimizer = optimizer;
        this.leftOffset = leftOffset;


        this.whiteLines.push(...utils.getThreeBox(width, height, new THREE.Vector3(...origin)));
        this.whitePolyLines.push(utils.getThreeBoxPolyLine(width, height, new THREE.Vector3(...origin)));
        this.objectsGroup.add(utils.getThreeRectangle({ width, height, origin }));
        /* this.whiteLines.push(...utils.getConnectionRing(
            [origin[0] - 20, origin[1] + 5],
            height,
        )); */
        this.whiteEllipse.push({
            position: new THREE.Vector3(origin[0] - 20 + 1.5, origin[1] + 5 + height / 2),
            secondPosition: new THREE.Vector3(0, height / 2),
            ratio: height > 50 ? 3 / height / 2 : 1.5 / height / 2,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        });
        const points = [];
        points.push(...utils.getThreeEllipse(
            [origin[0] - 20 + 1.5, origin[1] + 5 + height / 2],
            height,
        ));
        for (let i = 0; i < points.length - 1; i++) {
            this.whiteLines.push(
                new THREE.Vector3(points[i].x, points[i].y),
                new THREE.Vector3(points[i + 1].x, points[i + 1].y),
            );
        }
        this.whiteLines.push(
            new THREE.Vector3(origin[0] - 20 + 1.5, origin[1] + 5),
            new THREE.Vector3(origin[0] - 20 + 1.5, origin[1] + 5 - (height / 1.5) + 40),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(origin[0] - 20 + 1.5, origin[1] + 5),
                new THREE.Vector3(origin[0] - 20 + 1.5, origin[1] + 5 - (height / 1.5) + 40),
            ]
        });

        const segments = Math.floor(size / 2);
        const top = new THREE.Vector2(x, y + (segments * connectionPointsGap));
        for (let i = 0; i < size; i++) {
            const endpoint = {
                red:
                [
                    top.x + (width / 2),
                    top.y - (connectionPointsGap * i),
                ],
                white:
                [
                    top.x + (width / 2),
                    top.y - (connectionPointsGap * i) - (connectionPointsGap / 3),
                ],
            };
            const startpoint = {
                red:
                [
                    top.x - (width / 2),
                    top.y - (connectionPointsGap * i),
                ],
                white:
                [
                    top.x - (width / 2),
                    top.y - (connectionPointsGap * i) - (connectionPointsGap / 3),
                ],
            };
            this.endpoints.push(endpoint);
            this.startpoints.push(startpoint);

            this.addEndPointBox(endpoint);
            this.addStartPointBox(startpoint);

            this.redLines.push(...utils.getVectorPair(
                [startpoint.red[0] + this.smallboxsize, startpoint.red[1]],
                [endpoint.red[0] - this.smallboxsize, endpoint.red[1]],
            ));

            this.redPolyLines.push(utils.getPolyLineVectorPair(
                [startpoint.red[0] + this.smallboxsize, startpoint.red[1]],
                [endpoint.red[0] - this.smallboxsize, endpoint.red[1]],
            ));

            this.whiteLines.push(...utils.getVectorPair(
                [startpoint.white[0] + this.smallboxsize, startpoint.white[1]],
                [endpoint.white[0] - this.smallboxsize, endpoint.white[1]],
            ));

            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [startpoint.white[0] + this.smallboxsize, startpoint.white[1]],
                [endpoint.white[0] - this.smallboxsize, endpoint.white[1]],
            ));
        }
        if (this.panelType === 'micro') {
            const infoMicro = `
(${this.startpoints.length * 2}) #${this.wireSize.arrayToJunctionBox.ground}
${this.wireSize.arrayToJunctionBox.conductorSize}`;
            this.objectsGroup.add(createTextElement(this.font, infoMicro, [
                origin[0] - 15,
                origin[1] - (height / 1.5) + 30,
            ]));
            this.texts.push({
                position: new THREE.Vector3(
                    origin[0] - 15,
                    origin[1] - (height / 1.5) + 30,
                ),
                text: `${this.wireSize.arrayToJunctionBox.ground}`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(
                    origin[0] - 15,
                    origin[1] - (height / 1.5) - 8 + 30,
                ),
                text: `${this.wireSize.arrayToJunctionBox.conductorSize}`,
                size: 7,
            });
        }
        else {
            const info = `
(${this.startpoints.length}) #${this.wireSize.arrayToJunctionBox.conductorSize} AWG PV WIRE + RED
(${this.startpoints.length}) #${this.wireSize.arrayToJunctionBox.conductorSize} AWG PV WIRE - BLACK
(1) #${this.wireSize.arrayToJunctionBox.ground} BARE CU GND`;
            this.objectsGroup.add(createTextElement(this.font, info, [
                origin[0] - 20,
                origin[1] - (height / 1.5) + 30,
                4,
            ]));
            this.texts.push({
                position: new THREE.Vector3(
                    origin[0] - 20,
                    origin[1] - (height / 1.5) + 30,
                ),
                text: `(${this.startpoints.length}) #${this.wireSize.arrayToJunctionBox.conductorSize} AWG PV WIRE - BLACK`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(
                    origin[0] - 20,
                    origin[1] - (height / 1.5) - 8 + 30,
                ),
                text: `(1) #${this.wireSize.arrayToJunctionBox.ground} BARE CU GND`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(
                    origin[0] - 20,
                    origin[1] - (height / 1.5) + 38,
                ),
                text: `(${this.startpoints.length}) #${this.wireSize.arrayToJunctionBox.conductorSize} AWG PV WIRE + RED`,
                size: 7,
            });
            /* const infoSld = `(${this.startpoints.length}) #${this.wireSize.arrayToJunctionBox.conductorSize} AWG PV WIRE + RED`;
            this.objectsGroup3ld.add(createTextElement(this.font, infoSld, [
                origin[0] - 20 - 2,
                origin[1] - (height / 1.5) - 10 + 10,
            ])); */
        }
        this.texts.push({
            position: new THREE.Vector3(origin[0] + (width / 2), origin[1] + height + 7),
            text: '(N) JUNCTION BOX',
            size: 7,
        });

        this.objectsGroup.add(createTextElement(font, '(N) JUNCTION BOX', [origin[0] + (width / 2), origin[1] + height + 7]));
        const lastendpoint = this.endpoints[size - 1];
        lastendpoint.green = [x + this.smallboxsize / 2, (y - (height / 2)) + connectionPointsGap];

        const laststartpoint = this.startpoints[size - 1];
        laststartpoint.green = [x, (y - (height / 2)) + connectionPointsGap - 10];

        this.greenLines.push(...utils.getThreeBox(
            this.smallboxsize,
            this.smallboxsize / 3,
            new THREE.Vector2(
                x - (this.smallboxsize / 2),
                (y - (height / 2) - (this.smallboxsize / 2)) + connectionPointsGap - 8,
            ),
        ));
        this.greenPolyLines.push(utils.getThreeBoxPolyLine(
            this.smallboxsize,
            this.smallboxsize / 3,
            new THREE.Vector2(
                x - (this.smallboxsize / 2),
                (y - (height / 2) - (this.smallboxsize / 2)) + connectionPointsGap - 8,
            ),
        ));
        this.objectsGroup.add(createTextElement(this.font, 'G', [x, (y - (height / 2)) + connectionPointsGap - 5]));
        this.texts.push({
            position: new THREE.Vector3(
                x,
                (y - (height / 2)) + connectionPointsGap - 5,
            ),
            text: 'G',
            size: 7,
        });
        this.objectsGroup.add(utils.getThreeRectangle(
            {
                width: this.smallboxsize,
                height: this.smallboxsize / 3,
                origin:
                [
                    x - (this.smallboxsize / 2),
                    (y - (height / 2) - (this.smallboxsize / 2)) + connectionPointsGap - 8,
                ],
            },
            'green',
        ));
    }

    addChild(sizingIndex, positionIndex, inverterData, isLast = false) {
        const [X, Y] = this.centre;
        const gap = 50 + this.leftOffset;
        const sizing = inverterData.sizingData[sizingIndex];

        let maxPanelGroupSize;
        if (this.panelType === 'string') {
            maxPanelGroupSize = sldConstants.maxPanelLineSize;
        }
        else if (this.panelType === 'micro') {
            maxPanelGroupSize = sldConstants.maxMicroInverterPanelLineSize;
        }
        else {
            console.error('Wrong panel type');
        }

        const [x, y] = [
            X - (gap) - (inverterData.stringCount * 10),
            (Y + (this.extentSize / 2)) - (this.innergap * positionIndex),
        ];
        const box = new PanelGroup(
            this.panelType, sizing,
            [x, y],
            this.font,
            this.optimizer,
            isLast,
            this.wireSize,
        );

        utils.addAllrgbwgos(this, box, true, true);
        this.objectsGroup.add(box.objectsGroup);

        if (this.panelType === 'string') {
            this.texts.push({
                position: new THREE.Vector3(
                    x + 40,
                    y + maxPanelGroupSize.y + (sldConstants.stringContainerSpacing / 4),
                ),
                text: `${sizing.numberOfModules} MODULES IN STRING #${positionIndex + 1}`,
                size: 7,
            }); // This needs change since uncentred text

            this.objectsGroup.add(uncentredTextElement(
                this.font,
                `${sizing.numberOfModules} MODULES IN STRING #${positionIndex + 1}`,
                [x, y + maxPanelGroupSize.y + (sldConstants.stringContainerSpacing / 4)], 4,
            ));
        }
        else if (this.panelType === 'micro') {
            this.texts.push({
                position: new THREE.Vector3(
                    x + 64,
                    y + maxPanelGroupSize.y + (sldConstants.stringContainerSpacing / 4),
                ),
                text: `${sizing.numberOfModules} MICRO-INVERTERS IN BRANCH CIRCUIT #${positionIndex + 1}`,
                size: 7,
            });

            this.objectsGroup.add(uncentredTextElement(
                this.font,
                `${sizing.numberOfModules} MICRO-INVERTERS IN BRANCH CIRCUIT #${positionIndex + 1}`,
                [x, y + maxPanelGroupSize.y + (sldConstants.stringContainerSpacing / 4)], 4,
            ));
        }

        if (this.panelType === 'string') {
            this.exclusivesld.add(box.exclusivesld);
            this.exclusive3ld.add(box.exclusive3ld);
        }

        this.boxEndPoints.push(box.endpoints[0]);
    }

    addChildren(extentsize, inverterData) {
        this.extentSize = extentsize;
        this.innergap = (this.size === 1) ? 0 : (this.extentSize) / (this.size - 1);

        let prevNumberOfStrings = 0;
        for (let i = 0; i < inverterData.sizingData.length; i++) {
            const { numberOfStrings } = inverterData.sizingData[i];

            for (let j = 0; j < numberOfStrings; j++) {
                const positionIndex = prevNumberOfStrings + j;
                if (i === (inverterData.sizingData.length - 1) && j === (numberOfStrings - 1)) {
                    this.addChild(i, positionIndex, inverterData, this.isLast);
                }
                else {
                    this.addChild(i, positionIndex, inverterData);
                }
            }

            prevNumberOfStrings += inverterData.sizingData[i].numberOfStrings;
        }
        this.objectsGroup.add(utils.getDashedLine(this.boxEndPoints[0].green, this.boxEndPoints[this.boxEndPoints.length - 1].green, 'green'));

        const tempDashedPolyLine = [];
        this.dashedLines.push(...utils.getVectorPair(
            this.boxEndPoints[0].green,
            this.boxEndPoints[this.boxEndPoints.length - 1].green,
        ));

        tempDashedPolyLine.push(utils.getPolyLineVectorPair(
            this.boxEndPoints[0].green,
            this.boxEndPoints[this.boxEndPoints.length - 1].green,
        ));

        const connections = utils.createConnection(this.startpoints, this.boxEndPoints);
        this.whiteLines.push(...connections.whitePoints);
        this.redLines.push(...connections.redPoints);

        const polyLineConnections = utils.createPolyLineConnection(this.startpoints, this.boxEndPoints);
        this.whitePolyLines.push(...polyLineConnections.tempWhitePoints);
        this.redPolyLines.push(...polyLineConnections.tempRedPoints);

        // utils.addAllrgbw(this, connections);
        // this.objectsGroup3ld.add(connections.group3LD); // has 3ld parts
        // this.objectsGroup.add(connections.groupSLD); // has 3ld parts

        // green connection
        const [p, q] = this.boxEndPoints[this.boxEndPoints.length - 1].green;
        const [r, s] = this.startpoints[this.size - 1].green;
        this.objectsGroup.add(utils.getDashedLine([p, q], [p, s], 'green'));
        this.objectsGroup.add(utils.getDashedLine([p, s], [r - this.smallboxsize / 2, s], 'green'));
        this.dashedLines.push(...utils.getVectorPair(
            [p, q],
            [p, s],
        ));
        tempDashedPolyLine.push(utils.getPolyLineVectorPair(
            [p, q],
            [p, s],
        ));
        this.dashedLines.push(...utils.getVectorPair(
            [p, s],
            [r - this.smallboxsize / 2, s],
        ));
        tempDashedPolyLine.push(utils.getPolyLineVectorPair(
            [p, s],
            [r - this.smallboxsize / 2, s],
        ));

        const dashedLinePoints = [];
        for (let i = 0; i < tempDashedPolyLine.length; i++) {
            if (i === tempDashedPolyLine.length - 1) {
                dashedLinePoints.push(tempDashedPolyLine[i].points[0]);
                dashedLinePoints.push(tempDashedPolyLine[i].points[1]);
            }
            else {
                dashedLinePoints.push(tempDashedPolyLine[i].points[0]);
            }
        }

        this.dashedPolyLines.push({
            points: dashedLinePoints,
        });
    }

    addStartPointBox(points) {
        const [x, redpointY] = points.red;
        const whitepointY = points.white[1];

        this.redLines.push(...utils.getThreeBox(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, redpointY - (this.smallboxsize / 2)),
        ));

        this.redPolyLines.push(utils.getThreeBoxPolyLine(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, redpointY - (this.smallboxsize / 2)),
        ));

        this.objectsGroup3ld.add(createTextElement(this.font, 'L1', [x + (this.smallboxsize / 2), redpointY], 4));
        this.texts3LD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                redpointY,
            ),
            text: 'L1',
            size: 7,
        });
        this.whiteLines.push(...utils.getThreeBox(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, whitepointY - (this.smallboxsize / 2)),
        ));
        this.whitePolyLines.push(utils.getThreeBoxPolyLine(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, whitepointY - (this.smallboxsize / 2)),
        ));
        this.exclusivesld.add(createTextElement(this.font, 'L', [x + (this.smallboxsize / 2), whitepointY], 4));
        this.exclusive3ld.add(createTextElement(this.font, 'L2', [x + (this.smallboxsize / 2), whitepointY], 4));
        this.textsSLD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                whitepointY,
            ),
            text: 'L',
            size: 7,
        });
        this.texts3LD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                whitepointY,
            ),
            text: 'L2',
            size: 7,
        });
    }

    addEndPointBox(points) {
        const [X, redpointY] = points.red;
        const whitepointY = points.white[1];

        const x = X - this.smallboxsize;

        this.redLines.push(...utils.getThreeBox(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, redpointY - (this.smallboxsize / 2)),
        ));
        this.redPolyLines.push(utils.getThreeBoxPolyLine(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, redpointY - (this.smallboxsize / 2)),
        ));
        this.objectsGroup3ld.add(createTextElement(this.font, 'L1', [x + (this.smallboxsize / 2), redpointY], 4));
        this.texts3LD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                redpointY,
            ),
            text: 'L1',
            size: 7,
        });
        this.whiteLines.push(...utils.getThreeBox(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, whitepointY - (this.smallboxsize / 2)),
        ));
        this.whitePolyLines.push(utils.getThreeBoxPolyLine(
            this.smallboxsize,
            this.smallboxsize,
            new THREE.Vector2(x, whitepointY - (this.smallboxsize / 2)),
        ));
        this.exclusivesld.add(createTextElement(this.font, 'L', [x + (this.smallboxsize / 2), whitepointY], 4));
        this.exclusive3ld.add(createTextElement(this.font, 'L2', [x + (this.smallboxsize / 2), whitepointY], 4));
        this.textsSLD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                whitepointY,
            ),
            text: 'L',
            size: 7,
        });
        this.texts3LD.push({
            position: new THREE.Vector3(
                x + (this.smallboxsize / 2),
                whitepointY,
            ),
            text: 'L2',
            size: 7,
        });
    }
}

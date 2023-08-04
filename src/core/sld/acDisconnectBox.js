/* eslint-disable class-methods-use-this */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
import * as THREE from 'three';
import DropDownTool from './dropDownTool';
import { acDisconnectList } from './sldConstants';
import { createTextElement } from './sldUtils';
import {
    getThreeRectangle,
    getThreeArc,
    getDashedLine,
    getThreeRectangle1,
    getThreeEllipse,
    getThreeCircleDXF,
    connectTwoPoints1,
    connectTwoDottedPoints1,
    connectTwoDottedPointsInLShape,
    connectTwoPointsInLShape,
    getThreeRectangle1PolyLines,
    connectTwoPointsInLShapePolyLine,
} from '../sld/utils';
import createBufferGeometry from '../utils/meshUtils';

export default class AcDisconnectBox {
    constructor(origin, previousEndpoints, font, groupSLD, group3LD, groupExSLD, groupEx3LD, wireSize, noOfInverters, inverterData, isMicroInverter, acDisconnectPosition = 3, enabled = true, isSecondAcDisconnect = false) {
        this.parentSLD = groupSLD;
        this.parent3LD = group3LD;
        this.parentExSLD = groupExSLD;
        this.parentEx3LD = groupEx3LD;

        this.wireSize = wireSize;
        this.acDisconnectPosition = acDisconnectPosition;
        this.isSecondAcDisconnect = isSecondAcDisconnect;
        this.enabled = enabled;
        this.origin = origin;
        [this.originX, this.originY] = this.origin;
        this.size = 65;
        this.font = font;
        this.centerX = (this.originX + this.size) / 2;
        this.centerY = (this.originY + this.size) / 2;
        this.connectionBoxSize = 6;
        this.gap = 1;
        this.isMicroInverter = isMicroInverter;
        this.inverterData = inverterData;
        this.noOfInverters = noOfInverters;
        this.MaxCurrent = this.wireSize.inverterCurrent.current;
        this.breakerSize = this.noOfInverters * this.MaxCurrent * 1.25;
        this.previousEndpoints = previousEndpoints;
        this.whiteLines = [];
        this.white3ld = [];
        this.whitesld = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.bluePolyLines = [];
        this.redPolyLines = [];
        this.greenPolyLines = [];
        this.whitePolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.dashedLines = [];
        this.connectionOrigins = [
            [this.originX, this.centerY + 2 * this.gap], // L2 Start
            [this.originX + this.size - this.connectionBoxSize, this.centerY + 2 * this.gap], // L2 End
            [this.originX, this.centerY - 2 * this.gap - this.connectionBoxSize], // N Start
            [this.originX + this.size - this.connectionBoxSize, this.centerY - 2 * this.gap - this.connectionBoxSize], // N End
            [this.originX, this.centerY + 3 * this.gap + this.connectionBoxSize], // L1 Start
            [this.originX + this.size - this.connectionBoxSize, this.centerY + 3 * this.gap + this.connectionBoxSize], // L1 End
            [this.originX + this.size / 2 - this.connectionBoxSize / 2, this.centerY - 3 * this.gap - 2 * this.connectionBoxSize], // G
        ];
        this.startPoints = [{
            red: [this.originX, (this.centerY + 3 * this.gap + this.connectionBoxSize) + this.connectionBoxSize / 2], // L1
            white: [this.originX, (this.centerY + 2 * this.gap) + this.connectionBoxSize / 2], // L2
            blue: [this.originX, (this.centerY - 2 * this.gap - this.connectionBoxSize) + this.connectionBoxSize / 2], // N
            green: [this.originX + 30, (this.centerY - 3 * this.gap - 2 * this.connectionBoxSize) + this.connectionBoxSize / 2], // G
        }];
        this.endPoints = [{
            red: [this.originX + this.size, (this.centerY + 3 * this.gap + this.connectionBoxSize) + this.connectionBoxSize / 2], // L1
            white: [this.originX + this.size, (this.centerY + 2 * this.gap) + this.connectionBoxSize / 2], // L2
            blue: [this.originX + this.size, (this.centerY - 2 * this.gap - this.connectionBoxSize) + this.connectionBoxSize / 2], // N
            green: [this.originX + this.size, (this.centerY - 3 * this.gap - 2 * this.connectionBoxSize) + this.connectionBoxSize / 2], // G
        }];

        this.sldObjectsGroup = new THREE.Group(); // sldobjectsGroup
        this.sldObjectsGroup.name = 'ac-disconnect-group-sld';
        this.s3ldObjectsGroup = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.s3ldObjectsGroup.name = 'ac-disconnect-group-3ld';
        this.exclusivesld = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.exclusivesld.name = 'ac-disconnect-group-exsld';
        this.exclusive3ld = new THREE.Group(); // 3Ld sldObjectsGroup;
        this.exclusive3ld.name = 'ac-disconnect-group-ex3ld';
        this.toolGroup = new THREE.Group(); // Tool Group for dropdown;

        const dropDownPosition = new THREE.Vector2(this.originX + this.size, this.originY + this.size);
        this.dropDownTool = new DropDownTool(dropDownPosition.x, dropDownPosition.y, this);
        this.selected = 0;
        this.isFused = true;
        this.noOfModules = 0;
        for (let j = 0; j < this.inverterData.length; j++) {
            for (let i = 0; i < this.inverterData[j].sizingData.length; i++) {
                this.noOfModules += this.inverterData[j].sizingData[i].numberOfModules;
            }
        }
        this.createComponent();
    }
    createComponent() {
        this.whiteLines = [];
        this.redLines = [];
        this.blueLines = [];
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
        this.greenLines = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3ld = [];
        this.whiteSquare3ld = [];
        this.infoBreakerSize = Math.floor(this.wireSize.breakerSizes.acDisconnectBox);
        // console.log('infoBreakerSize: ', infoBreakerSize);
        // if(infoBreakerSize<=60)
        // {
        //     if(infoBreakerSize % 5 == 0 && this.wireSize.breakerSizes.acDisconnectBox != infoBreakerSize) {
        //         infoBreakerSize++;
        //     }
        //     for(let i = 1; i < 5; i++) {
        //         if(infoBreakerSize % 5 == 0) {
        //             break;
        //         }
        //         infoBreakerSize++;
        //     }
        // }
        // else {
        //     if(infoBreakerSize % 10 == 0 && this.wireSize.breakerSizes.acDisconnectBox != infoBreakerSize) {
        //         infoBreakerSize++;
        //     }
        //     for(let i = 1; i < 10; i++) {
        //         if(infoBreakerSize % 10 == 0) {
        //             break;
        //         }
        //         infoBreakerSize++;
        //     }
        // }
        if (this.infoBreakerSize <= 20) {
            this.infoBreakerSize = 20;
        }
        else if (this.infoBreakerSize % 10 === 0 && this.wireSize.breakerSizes.acDisconnectBox !== this.infoBreakerSize) {
            this.infoBreakerSize++;
        }
        for (let i = 1; i < 10; i++) {
            if (this.infoBreakerSize % 10 === 0) {
                break;
            }
            this.infoBreakerSize++;
        }
        if (this.isMicroInverter) {
            this.breakerSize = this.infoBreakerSize;
        }
        if (this.breakerSize !== 0) {
            if (this.breakerSize <= 30) {
                this.breakerSize = 30;
            }
            else if (this.breakerSize <= 60) {
                this.breakerSize = 60;
            }
            else if (this.breakerSize <= 100) {
                this.breakerSize = 100;
            }
            else if (this.breakerSize <= 200) {
                this.breakerSize = 200;
            }
            else if (this.breakerSize <= 400) {
                this.breakerSize = 400;
            }
            else if (this.breakerSize <= 600) {
                this.breakerSize = 600;
            }
            else if (this.breakerSize <= 800) {
                this.breakerSize = 800;
            }
            else {
                this.breakerSize = 1200;
            }
            // else {
            //     this.breakerSize = Math.floor(this.breakerSize);
            //     if (this.breakerSize % 50 !== 0) {
            //         for (let i = 1; i < 50; i++) {
            //             if (this.breakerSize % 50 === 0) {
            //                 break;
            //             }
            //             this.breakerSize++;
            //         }
            //     }
            // }
        }
        // connection ring
        let thwnNumber;
        if (this.wireSize.temprature.tempratureAc === 90) {
            thwnNumber = '-2';
        }
        else {
            thwnNumber = '';
        }
        const info = `(3) ${this.wireSize.AcDisconnectToUtility.conductorSize} AWG THWN${thwnNumber} \n(1) ${this.wireSize.AcDisconnectToUtility.ground} AWG THWN${thwnNumber} GND \nIN ${this.wireSize.AcDisconnectToUtility.conduitSize}'' EMT CONDUIT RUN`;
        // this.whiteLines.push(...getConnectionRing([this.originX + 75, this.originY]));
        this.whiteEllipse.push({
            position: new THREE.Vector3(this.originX + 75 + 1.5, this.originY + 25),
            secondPosition: new THREE.Vector3(0, 25),
            ratio: 0.06,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        });
        let points = [];
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
            text: `(3) ${this.wireSize.AcDisconnectToUtility.conductorSize} AWG THWN${thwnNumber}`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 75, this.originY - 58),
            text: `(1) ${this.wireSize.AcDisconnectToUtility.ground} AWG THWN${thwnNumber} GND`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 75, this.originY - 66),
            text: `IN ${this.wireSize.AcDisconnectToUtility.conduitSize}'' EMT CONDUIT RUN`,
            size: 7,
        });

        if ((this.acDisconnectPosition === 1) && (this.enabled)) {
            this.whiteEllipse.push({
                position: new THREE.Vector3(this.originX - 15 + 1.5, this.originY + 25),
                secondPosition: new THREE.Vector3(0, 25),
                ratio: 0.06,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            });
            points = [];
            points.push(...getThreeEllipse([this.originX - 15 + 1.5, this.originY + 25]));
            for (let i = 0; i < points.length - 1; i++) {
                this.whiteLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            this.whiteLines.push(
                new THREE.Vector3(this.originX - 15 + 1.5, this.originY),
                new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5)),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.originX - 15 + 1.5, this.originY),
                    new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5)),
                ]
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 10, this.originY - 60]));
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 50),
                text: `(3) ${this.wireSize.AcDisconnectToUtility.conductorSize} AWG THWN${thwnNumber}`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 58),
                text: `(1) ${this.wireSize.AcDisconnectToUtility.ground} AWG THWN${thwnNumber} GND`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 66),
                text: `IN ${this.wireSize.AcDisconnectToUtility.conduitSize}'' EMT CONDUIT RUN`,
                size: 7,
            });
        }
        else if ((this.acDisconnectPosition === 2) && (!this.isSecondAcDisconnect)) {
            this.whiteEllipse.push({
                position: new THREE.Vector3(this.originX - 15 + 1.5, this.originY + 25),
                secondPosition: new THREE.Vector3(0, 25),
                ratio: 0.06,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            });
            points = [];
            points.push(...getThreeEllipse([this.originX - 15 + 1.5, this.originY + 25]));
            for (let i = 0; i < points.length - 1; i++) {
                this.whiteLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            this.whiteLines.push(
                new THREE.Vector3(this.originX - 15 + 1.5, this.originY),
                new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5)),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(this.originX - 15 + 1.5, this.originY),
                    new THREE.Vector3(this.originX - 15 + 1.5, this.originY - (50 / 1.5)),
                ]
            });
            this.sldObjectsGroup.add(createTextElement(this.font, info, [this.originX - 10, this.originY - 60]));
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 50),
                text: `(3) ${this.wireSize.AcDisconnectToUtility.conductorSize} AWG THWN${thwnNumber}`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 58),
                text: `(1) ${this.wireSize.AcDisconnectToUtility.ground} AWG THWN${thwnNumber} GND`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX - 10, this.originY - 66),
                text: `IN ${this.wireSize.AcDisconnectToUtility.conduitSize}'' EMT CONDUIT RUN`,
                size: 7,
            });
        }
        if (!this.isFused) {
            this.sldObjectsGroup.add(createTextElement(this.font, `(N) AC DISCONNECT\n    ${this.breakerSize}A, NON FUSED\n          240 VAC`, [this.originX + (this.size / 2), this.originY + 4 + this.size + 15]));
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 28 + this.size),
                text: '(N) AC DISCONNECT',
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 20 + this.size),
                text: ` ${this.breakerSize}A, NON FUSED,`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 12 + this.size),
                text: '    240 VAC',
                size: 7,
            });
        }
        else {
            this.sldObjectsGroup.add(createTextElement(this.font, `(N) AC DISCONNECT\n        ${this.breakerSize}A, FUSED\n           240 VAC`, [this.originX + (this.size / 2), this.originY + 4 + this.size + 15]));
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 28 + this.size),
                text: '(N) AC DISCONNECT',
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 20 + this.size),
                text: `   ${this.breakerSize}A, FUSED,`,
                size: 7,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + (this.size / 2), this.originY + 12 + this.size),
                text: '     240 VAC',
                size: 7,
            });
        }

        const textBoxPosition = [this.originX - 2, this.originY + this.size + 3];
        this.whiteLines.push(...getThreeRectangle1({ width: this.size + 6, height: 25 + 8, origin: textBoxPosition }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.size + 6, height: 25 + 8, origin: textBoxPosition }));

        this.whiteLines.push(...getThreeRectangle1({ width: this.size, height: this.size, origin: this.origin }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.size, height: this.size, origin: this.origin }));
        // wire joining N to N inside the box
        this.blueLines.push(
            new THREE.Vector3(this.origin[0] + this.connectionBoxSize, this.centerY - 2 * this.gap - this.connectionBoxSize / 2),
            new THREE.Vector3(this.origin[0] + this.size - this.connectionBoxSize, this.centerY - 2 * this.gap - this.connectionBoxSize / 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(this.origin[0] + this.connectionBoxSize, this.centerY - 2 * this.gap - this.connectionBoxSize / 2),
                new THREE.Vector3(this.origin[0] + this.size - this.connectionBoxSize, this.centerY - 2 * this.gap - this.connectionBoxSize / 2),
            ]
        });
        // wire joining start point to G
        this.dashedLines.push(
            new THREE.Vector3(this.origin[0], this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
            new THREE.Vector3(this.origin[0] + this.size / 2 - this.connectionBoxSize / 2, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.origin[0], this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
                new THREE.Vector3(this.origin[0] + this.size / 2 - this.connectionBoxSize / 2, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [this.origin[0], this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)],
            [this.origin[0] + this.size / 2 - this.connectionBoxSize / 2, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)], 'green',
        ));

        // wire joining G to end of meter should be dashed line
        this.dashedLines.push(
            new THREE.Vector3(this.origin[0] + this.size / 2 + this.connectionBoxSize / 2, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
            new THREE.Vector3(this.origin[0] + this.size, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.origin[0] + this.size / 2 + this.connectionBoxSize / 2, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
                new THREE.Vector3(this.origin[0] + this.size, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine([this.origin[0] + this.size / 2 + this.connectionBoxSize / 2, this.centerY - 3 * this.gap -
        (3 * this.connectionBoxSize / 2)], [this.origin[0] + this.size, this.centerY - 3 * this.gap - (3 * this.connectionBoxSize / 2)], 'green'));

        this.dashedLines.push(
            new THREE.Vector3(this.origin[0] + this.size / 2, this.centerY - 3 * this.gap - (2 * this.connectionBoxSize)),
            new THREE.Vector3(this.origin[0] + this.size / 2, this.originY + 1.5),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(this.origin[0] + this.size / 2, this.centerY - 3 * this.gap - (2 * this.connectionBoxSize)),
                new THREE.Vector3(this.origin[0] + this.size / 2, this.originY + 1.5),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine([this.origin[0] + this.size / 2, this.centerY - 3 * this.gap -
        (2 * this.connectionBoxSize)], [this.origin[0] + this.size / 2, this.originY + 1.5], 'green'));
        // this.greenLines.push(...getThreeRectangle1({ width: 3, height: 3, origin: [this.origin[0] + (this.size / 2) - 1.5, this.originY] }, 'green'));
        // this.sldObjectsGroup.add(getThreeRectangle({ width: 3, height: 3, origin: [this.origin[0] + (this.size / 2) - 1.5, this.originY] }, 'green'));
        this.greenCircles.push({
            position: new THREE.Vector3(this.origin[0] + (this.size / 2), this.originY),
            radius: 1.5,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [this.origin[0] + (this.size / 2), this.originY], radius: 1.5, startAngle: 0, endAngle: 2 * Math.PI,
        }, 'green'));
        let c = 1;
        this.connectionOrigins.forEach(((point) => {
            if (c === 5 || c === 6) {
                this.redLines.push(...getThreeRectangle1({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }, 'red'));
                this.redPolyLines.push(getThreeRectangle1PolyLines({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }, 'red'));
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'L1',
                    [point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)),
                    text: 'L1',
                    size: 7,
                });
            }
            if (c === 7) {
                this.greenLines.push(...getThreeRectangle1({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }, 'green'));
                this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }, 'green'));
                this.sldObjectsGroup.add(getThreeRectangle({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }, 'green'));
                this.sldObjectsGroup.add(createTextElement(
                    this.font,
                    'G',
                    [point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)],
                ));
                this.texts.push({
                    position: new THREE.Vector3(point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)),
                    text: 'G',
                    size: 7,
                });
            }
            if (c === 1 || c === 2) {
                this.exclusive3ld.add(createTextElement(
                    this.font,
                    'L2',
                    [point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)),
                    text: 'L2',
                    size: 7,
                });
                this.exclusivesld.add(createTextElement(
                    this.font,
                    'L',
                    [point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)],
                ));
                this.textsSLD.push({
                    position: new THREE.Vector3(point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)),
                    text: 'L',
                    size: 7,
                });
                this.whiteLines.push(...getThreeRectangle1({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }));
                this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }));
            }
            if (c < 5 && c > 2) {
                this.s3ldObjectsGroup.add(getThreeRectangle({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }));
                this.s3ldObjectsGroup.add(createTextElement(
                    this.font,
                    'N',
                    [point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)],
                ));
                this.texts3LD.push({
                    position: new THREE.Vector3(point[0] + (this.connectionBoxSize / 2), point[1] + (this.connectionBoxSize / 2)),
                    text: 'N',
                    size: 7,
                });
                this.white3ld.push(...getThreeRectangle1({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }));
                this.whitePoly3ld.push(getThreeRectangle1PolyLines({ width: this.connectionBoxSize, height: this.connectionBoxSize, origin: point }));
            }
            c++;
        }));


        // Todo: refactor
        if (this.isFused === true) {
            const centerL1 = new THREE.Vector2(this.origin[0] + this.connectionBoxSize, this.centerY + 3 * this.gap + this.connectionBoxSize + this.connectionBoxSize / 2);
            const centerL2 = new THREE.Vector2(this.origin[0] + this.connectionBoxSize, this.centerY + 2 * this.gap + this.connectionBoxSize / 2);
            this.redLines.push(
                new THREE.Vector3(centerL1.x, centerL1.y),
                new THREE.Vector3(centerL1.x + 9.5, centerL1.y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x, centerL1.y),
                    new THREE.Vector3(centerL1.x + 9.5, centerL1.y),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x, centerL2.y),
                new THREE.Vector3(centerL2.x + 9.5, centerL2.y),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x, centerL2.y),
                    new THREE.Vector3(centerL2.x + 9.5, centerL2.y),
                ]
            });

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 10, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 10, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 10, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 10, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));
            this.redLines.push(
                new THREE.Vector3(centerL1.x + 28.5, centerL1.y),
                new THREE.Vector3(centerL1.x + 38, centerL1.y + 5),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 28.5, centerL1.y),
                    new THREE.Vector3(centerL1.x + 38, centerL1.y + 5),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 28.5, centerL2.y),
                new THREE.Vector3(centerL2.x + 38, centerL2.y + 5),
            );

            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 28.5, centerL2.y),
                    new THREE.Vector3(centerL2.x + 38, centerL2.y + 5),
                ]
            });

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 22, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 22, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 22, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 22, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));

            this.redLines.push(
                new THREE.Vector3(centerL1.x + 22.5, centerL1.y),
                new THREE.Vector3(centerL1.x + 27.5, centerL1.y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 22.5, centerL1.y),
                    new THREE.Vector3(centerL1.x + 27.5, centerL1.y),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 22.5, centerL2.y),
                new THREE.Vector3(centerL2.x + 27.5, centerL2.y),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 22.5, centerL2.y),
                    new THREE.Vector3(centerL2.x + 27.5, centerL2.y),
                ]
            });

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 28, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 28, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 28, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 28, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 13, centerL1.y + 0.5),
                radius: 3,
                startAngle: Math.PI,
                endAngle: 0,
            });
            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 13, centerL2.y + 0.5),
                radius: 3,
                startAngle: Math.PI,
                endAngle: 0,
            });
            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 19, centerL1.y - 0.5),
                radius: 3,
                startAngle: 0,
                endAngle: Math.PI,
            });
            points = [];
            points.push(...getThreeCircleDXF([centerL1.x + 19, centerL1.y - 0.5], 3, 0, Math.PI));
            for (let i = 0; i < points.length - 1; i++) {
                this.redLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 19, centerL2.y - 0.5),
                radius: 3,
                startAngle: 0,
                endAngle: Math.PI,
            });
            points = [];
            points.push(...getThreeCircleDXF([centerL2.x + 19, centerL2.y - 0.5], 3, 0, Math.PI));
            for (let i = 0; i < points.length - 1; i++) {
                this.whiteLines.push(
                    new THREE.Vector3(points[i].x, points[i].y),
                    new THREE.Vector3(points[i + 1].x, points[i + 1].y),
                );
            }
            /* this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 34, centerL1.y - 0.5),
                radius: 3,
                startAngle: 0,
                endAngle: Math.PI,
            });
            this.whiteCircles.push({
                position: new THREE.Vector3(centerL1.x + 34, centerL2.y - 0.5),
                radius: 3,
                startAngle: 0,
                endAngle: Math.PI,
            }); */
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 13, centerL1.y + 0.5], radius: 3, startAngle: Math.PI, endAngle: 0,
            }, 'red'));
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 13, centerL2.y + 0.5], radius: 3, startAngle: Math.PI, endAngle: 0,
            }));
            /* this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 34, centerL1.y - 0.5], radius: 3, startAngle: 0, endAngle: Math.PI,
            }, 'red'));
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 34, centerL2.y - 0.5], radius: 3, startAngle: 0, endAngle: Math.PI,
            })); */

            this.redLines.push(
                new THREE.Vector3(centerL1.x + 16, centerL1.y + 0.5),
                new THREE.Vector3(centerL1.x + 16, centerL1.y - 0.5),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 16, centerL1.y + 0.5),
                    new THREE.Vector3(centerL1.x + 16, centerL1.y - 0.5),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 16, centerL2.y + 0.5),
                new THREE.Vector3(centerL2.x + 16, centerL2.y - 0.5),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 16, centerL2.y + 0.5),
                    new THREE.Vector3(centerL2.x + 16, centerL2.y - 0.5),
                ]
            });

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 38, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 38, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 38, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 38, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));

            this.redLines.push(
                new THREE.Vector3(centerL1.x + 38.5, centerL1.y),
                new THREE.Vector3(centerL1.x + this.size - 2 * this.connectionBoxSize, centerL1.y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 38.5, centerL1.y),
                    new THREE.Vector3(centerL1.x + this.size - 2 * this.connectionBoxSize, centerL1.y),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 38.5, centerL2.y),
                new THREE.Vector3(centerL2.x + this.size - 2 * this.connectionBoxSize, centerL2.y),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 38.5, centerL2.y),
                    new THREE.Vector3(centerL2.x + this.size - 2 * this.connectionBoxSize, centerL2.y),
                ]
            });
            this.exclusivesld.add(createTextElement(this.font, `${this.infoBreakerSize} A`, [centerL1.x + 32.5, centerL1.y], 4));
            this.textsSLD.push({
                position: new THREE.Vector3(centerL1.x + 32.5, centerL1.y),
                text: `${this.infoBreakerSize} A`,
                size: 7,
            });

            this.exclusive3ld.add(createTextElement(this.font, `${this.infoBreakerSize} A`, [centerL1.x + 32.5, centerL1.y + 7], 4));
            this.texts3LD.push({
                position: new THREE.Vector3(centerL1.x + 32.5, centerL1.y + 7),
                text: `${this.infoBreakerSize} A`,
                size: 7,
            });
        }
        else {
            const centerL1 = new THREE.Vector2(this.origin[0] + this.connectionBoxSize, this.centerY + 3 * this.gap + this.connectionBoxSize + this.connectionBoxSize / 2);
            const centerL2 = new THREE.Vector2(this.origin[0] + this.connectionBoxSize, this.centerY + 2 * this.gap + this.connectionBoxSize / 2);
            this.redLines.push(
                new THREE.Vector3(centerL1.x, centerL1.y),
                new THREE.Vector3(centerL1.x + 9.5, centerL1.y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x, centerL1.y),
                    new THREE.Vector3(centerL1.x + 9.5, centerL1.y),
                ]
            }
            );
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x, centerL2.y),
                new THREE.Vector3(centerL2.x + 9.5, centerL2.y),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x, centerL2.y),
                    new THREE.Vector3(centerL2.x + 9.5, centerL2.y),
                ]
            });

            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 10, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 10, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 10, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 10, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));
            // this.exclusivesld.add(createTextElement(this.font, `${this.infoBreakerSize} A`, [centerL1.x + 15.5, centerL1.y], 2));
            // this.textsSLD.push({
            //     position: new THREE.Vector3(centerL1.x + 15.5, centerL1.y),
            //     text: `${this.infoBreakerSize} A`,
            //     size: 2,
            // });

            // this.exclusive3ld.add(createTextElement(this.font, `${this.infoBreakerSize} A`, [centerL1.x + 15.5, centerL1.y + 7], 2));
            // this.texts3LD.push({
            //     position: new THREE.Vector3(centerL1.x + 15.5, centerL1.y + 7),
            //     text: `${this.infoBreakerSize} A`,
            //     size: 2,
            // });
            this.redLines.push(
                new THREE.Vector3(centerL1.x + 10.5, centerL1.y),
                new THREE.Vector3(centerL1.x + 20, centerL1.y + 5),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 10.5, centerL1.y),
                    new THREE.Vector3(centerL1.x + 20, centerL1.y + 5),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 10.5, centerL2.y),
                new THREE.Vector3(centerL2.x + 20, centerL2.y + 5),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 10.5, centerL2.y),
                    new THREE.Vector3(centerL2.x + 20, centerL2.y + 5),
                ]
            });


            this.redCircles.push({
                position: new THREE.Vector3(centerL1.x + 20.5, centerL1.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.s3ldObjectsGroup.add(getThreeArc({
                origin: [centerL1.x + 20.5, centerL1.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }, 'red'));

            this.whiteCircles.push({
                position: new THREE.Vector3(centerL2.x + 20.5, centerL2.y),
                radius: 0.5,
                startAngle: 2 * Math.PI,
                endAngle: 0,
            });
            this.sldObjectsGroup.add(getThreeArc({
                origin: [centerL2.x + 20.5, centerL2.y], radius: 0.5, startAngle: 0, endAngle: 2 * Math.PI,
            }));

            this.redLines.push(
                new THREE.Vector3(centerL1.x + 21, centerL1.y),
                new THREE.Vector3(centerL1.x + this.size - 2 * this.connectionBoxSize, centerL1.y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(centerL1.x + 21, centerL1.y),
                    new THREE.Vector3(centerL1.x + this.size - 2 * this.connectionBoxSize, centerL1.y),
                ]
            });
            this.whiteLines.push(
                new THREE.Vector3(centerL2.x + 21, centerL2.y),
                new THREE.Vector3(centerL2.x + this.size - 2 * this.connectionBoxSize, centerL2.y),
            );
            this.whitePolyLines.push({
                points:[
                    new THREE.Vector3(centerL2.x + 21, centerL2.y),
                    new THREE.Vector3(centerL2.x + this.size - 2 * this.connectionBoxSize, centerL2.y),
                ]
            });
        }
        // connections
        if (this.noOfInverters === 1 && !this.isMicroInverter && !this.isSecondAcDisconnect) {
            this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndpoints[0].white[0] + 34, this.previousEndpoints[0].white[1]]));
            this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndpoints[0].white[0] + 34, this.previousEndpoints[0].white[1]]));
            this.whiteLines.push(...connectTwoPointsInLShape(this.previousEndpoints[0].white, [this.previousEndpoints[0].white[0] + 34, this.previousEndpoints[0].white[1]]));
            this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndpoints[0].white, [this.previousEndpoints[0].white[0] + 34, this.previousEndpoints[0].white[1]]));
            
            this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.previousEndpoints[0].red[0] + 40, this.previousEndpoints[0].red[1]]));
            this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.previousEndpoints[0].red[0] + 40, this.previousEndpoints[0].red[1]]));
            this.redLines.push(...connectTwoPointsInLShape(this.previousEndpoints[0].red, [this.previousEndpoints[0].red[0] + 40, this.previousEndpoints[0].red[1]]));
            this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndpoints[0].red, [this.previousEndpoints[0].red[0] + 40, this.previousEndpoints[0].red[1]]));
            
            this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0] + 28, this.previousEndpoints[0].blue[1]]));
            this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0] + 28, this.previousEndpoints[0].blue[1]]));
            this.blueLines.push(...connectTwoPointsInLShape(this.previousEndpoints[0].blue, [this.previousEndpoints[0].blue[0] + 28, this.previousEndpoints[0].blue[1]]));
            this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndpoints[0].blue, [this.previousEndpoints[0].blue[0] + 28, this.previousEndpoints[0].blue[1]]));
            this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]]));
            this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]]));
            this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]], 'green'));
            this.dashedLines.push(...connectTwoPointsInLShape(this.previousEndpoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]]));
            this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.previousEndpoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]]));
            this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.previousEndpoints[0].green, [this.previousEndpoints[0].green[0] + 22, this.previousEndpoints[0].green[1]], 'green'));

            this.redLines.push(...connectTwoPointsInLShape(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
            this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
            this.whiteLines.push(...connectTwoPointsInLShape(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
            this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
            this.blueLines.push(...connectTwoPointsInLShape(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
            this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
            this.dashedLines.push(...connectTwoPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
            this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
            this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]],'green'));
        }
        else{

            if (this.acDisconnectPosition === 1 || this.acDisconnectPosition === 2 || !this.enabled)
            {
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.previousEndpoints[0].red[0], this.previousEndpoints[0].red[1]]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.previousEndpoints[0].red[0], this.previousEndpoints[0].red[1]]));
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndpoints[0].white[0], this.previousEndpoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndpoints[0].white[0], this.previousEndpoints[0].white[1]]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0], this.previousEndpoints[0].blue[1]]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0], this.previousEndpoints[0].blue[1]]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0], this.previousEndpoints[0].green[1]]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.previousEndpoints[0].green[0], this.previousEndpoints[0].green[1]]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0], this.previousEndpoints[0].green[1]],'green'));
            }
            else {
                this.redLines.push(...connectTwoPointsInLShape(this.startPoints[0].red, [this.previousEndpoints[0].red[0] + 3.5, this.previousEndpoints[0].red[1]]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].red, [this.previousEndpoints[0].red[0] + 3.5, this.previousEndpoints[0].red[1]]));
                this.whiteLines.push(...connectTwoPointsInLShape(this.startPoints[0].white, [this.previousEndpoints[0].white[0] + 7.5, this.previousEndpoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].white, [this.previousEndpoints[0].white[0] + 7.5, this.previousEndpoints[0].white[1]]));
                this.blueLines.push(...connectTwoPointsInLShape(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0] + 11.5, this.previousEndpoints[0].blue[1]]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].blue, [this.previousEndpoints[0].blue[0] + 11.5, this.previousEndpoints[0].blue[1]]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 15.5, this.previousEndpoints[0].green[1]]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 15.5, this.previousEndpoints[0].green[1]]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.startPoints[0].green, [this.previousEndpoints[0].green[0] + 15.5, this.previousEndpoints[0].green[1]],'green'));
                
                this.redLines.push(...connectTwoPointsInLShape(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                this.redPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].red, [this.endPoints[0].red[0] + 3.5, this.endPoints[0].red[1]]));
                this.whiteLines.push(...connectTwoPointsInLShape(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                this.whitePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].white, [this.endPoints[0].white[0] + 7.5, this.endPoints[0].white[1]]));
                this.blueLines.push(...connectTwoPointsInLShape(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                this.bluePolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].blue, [this.endPoints[0].blue[0] + 11.5, this.endPoints[0].blue[1]]));
                this.dashedLines.push(...connectTwoPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                this.dashedPolyLines.push(connectTwoPointsInLShapePolyLine(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]]));
                this.sldObjectsGroup.add(connectTwoDottedPointsInLShape(this.endPoints[0].green, [this.endPoints[0].green[0] + 15.5, this.endPoints[0].green[1]],'green'));    
            }
        }
        
        // this.redLines.push(...connectTwoPoints1(
        //     this.previousEndpoints[0].red,
        //     this.startPoints[0].red,
        // ));
        // this.whiteLines.push(...connectTwoPoints1(
        //     this.previousEndpoints[0].white,
        //     this.startPoints[0].white,
        //     this.gap + this.connectionBoxSize,
        // ));
        // this.blueLines.push(...connectTwoPoints1(
        //     this.previousEndpoints[0].blue,
        //     this.startPoints[0].blue,
        //     (this.gap + this.connectionBoxSize) * 2,
        // ));
        // this.dashedLines.push(...connectTwoPoints1(
        //     this.previousEndpoints[0].green,
        //     this.startPoints[0].green,
        //     (this.gap + this.connectionBoxSize) * 3,
        // ));
        // this.sldObjectsGroup.add(connectTwoDottedPoints1(this.previousEndpoints[0].green, this.startPoints[0].green, 'green', (this.gap + this.connectionBoxSize) * 3));

        const whiteGeometry = createBufferGeometry(this.whiteLines);
        const whiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        const whiteLine = new THREE.LineSegments(whiteGeometry, whiteMaterial);

        const redGeometry = createBufferGeometry(this.redLines);
        const redMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        const redLine = new THREE.LineSegments(redGeometry, redMaterial);

        const blueGeometry = createBufferGeometry(this.blueLines);
        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x808080,
            linewidth: 3,
        });
        const blueLine = new THREE.LineSegments(blueGeometry, blueMaterial);
        
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

        const white3ldLineGeometry = createBufferGeometry([...this.white3ld]);
        const white3ldMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        const white3ldLine = new THREE.LineSegments(white3ldLineGeometry, white3ldMaterial);

        this.sldObjectsGroup.add(whiteLine);
        this.s3ldObjectsGroup.add(blueLine);
        this.s3ldObjectsGroup.add(redLine);
        this.s3ldObjectsGroup.add(white3ldLine);
        this.sldObjectsGroup.add(blueMicroLine);
        this.sldObjectsGroup.add(purpleLine);
    }

    getModelGroup() {
        return this.sldObjectsGroup;
    }

    getInnerBox() {
        return this.s3ldObjectsGroup;
    }

    selectionControl(i) {
        for (let j = 0; j < this.parentSLD.children.length; j += 1) {
            if (this.parentSLD.children[j].uuid === this.sldObjectsGroup.uuid) {
                this.parentSLD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parent3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].uuid === this.s3ldObjectsGroup.uuid) {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentExSLD.children.length; j += 1) {
            if (this.parent3LD.children[i].uuid === this.exclusivesld.uuid) {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }
        for (let j = 0; j < this.parentEx3LD.children.length; j += 1) {
            if (this.parent3LD.children[i].uuid === this.exclusive3ld.uuid) {
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
            this.isFused = true;
        }
        else if (i === 1) {
            this.isFused = false;
        }
        this.createComponent();
    }

    getNames() {
        return acDisconnectList;
    }

    getDefault() {
        return this.selected;
    }
}

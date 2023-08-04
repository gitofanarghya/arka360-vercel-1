/* eslint-disable class-methods-use-this */
/* eslint-disable block-scoped-var */
/* eslint-disable no-mixed-operators */
/* eslint-disable max-len */
import * as THREE from 'three';
import { createTextElement } from '../sldUtils';
import createBufferGeometry from '../../utils/meshUtils';
import {
    getThreeRectangle,
    getThreeArc,
    getDashedLine,
    getThreeRectangle1,
    connectTwoDottedPoints1,
    connectTwoPoints1,
    getThreeCircleDXF,
    getThreeRectangle1PolyLines,
    connectTwoPoints1PolyLine,
    getLine,
} from '../utils';

const gap = 8;

export default class LineSideTap {
    constructor(origin, previousEndPoints, font, groupSLD, group3LD, wireSize, isMicroInverter = false) {
        this.origin = origin;
        [this.originX, this.originY] = this.origin;
        this.size = 60;

        this.font = font;
        this.wireSize = wireSize;
        // Arrays of Points
        this.previousEndPoints = previousEndPoints; // AC Disconnect box End Points
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
        this.whiteLines = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.dashedLines = [];
        this.startPoints = []; // starting points of utility meter
        this.connectionPoints = []; // upper and lower joining points for the wires
        this.leaders = [];

        this.isMicroInverter = isMicroInverter;

        this.sldObjectsGroup = groupSLD; // SLD layer Group (Always visible)
        this.sldObjectsGroup.name = 'utility-meter-group-sld'; // SLD group name for dropdown
        this.s3ldObjectsGroup = group3LD; // 3LD layer Group (Only visible in 3LD mode)
        this.s3ldObjectsGroup.name = 'utility-meter-group-3ld'; // 3LD group name for drapdown
        this.createComponent();
    }

    createComponent() {
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
        this.whiteLines = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.dashedLines = [];
        this.leaders = [];

        let boxShiftY = -30;
        // Header Text and Box
        if (!this.isMicroInverter) {
            boxShiftY = -30;
        }
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) - boxShiftY + 12),
            text: 'BI-DIRECTIONAL',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) - boxShiftY + 4),
            text: 'UTILITY METER',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) - boxShiftY - 4),
            text: '  1-PHASE, 3-W,',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) - boxShiftY - 12),
            text: '120V/240V, 60Hz',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(
            this.font,
            'BI-DIRECTIONAL\nUTILITY METER\n  1-PHASE, 3-W,\n120V/240V, 60Hz',
            [this.originX + 29.5, (this.size * 3) - boxShiftY],
            4,
        ));

        const textBoxPosition = [this.originX + 5, (this.size * 3) - 16.5 - boxShiftY];
        this.whiteLines.push(...getThreeRectangle1({
            width: 50,
            height: 35,
            origin: textBoxPosition,
        }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({
            width: 50,
            height: 35,
            origin: textBoxPosition,
        }));

        // All function Call For creation of design
        const {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld,
        } = this.getUpper([this.originX, this.originY + (this.size * 3)], this.size);
        const { lowerendpoint, lowerendpoints3ld } = this.getLower(this.origin, [this.size, this.size * 3]);
        this.createWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, lowerendpoint, lowerendpoints3ld);

        const redGeometry = createBufferGeometry();
        const redMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        redGeometry.setFromPoints([...this.redLines]);
        const redLine = new THREE.LineSegments(redGeometry, redMaterial);

        const whiteGeometry = createBufferGeometry();
        const whiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        whiteGeometry.setFromPoints([...this.whiteLines]);
        const whiteLine = new THREE.LineSegments(whiteGeometry, whiteMaterial);

        const blueGeometry = createBufferGeometry();
        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x808080,
            linewidth: 3,
        });
        blueGeometry.setFromPoints([...this.blueLines]);
        const blueLine = new THREE.LineSegments(blueGeometry, blueMaterial);

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


        this.s3ldObjectsGroup.add(redLine); // adding all red line segments to 3ld group
        this.sldObjectsGroup.add(whiteLine); // adding all white line segments to sld group
        this.s3ldObjectsGroup.add(blueLine); // adding all blue line segments to 3ld group
        this.sldObjectsGroup.add(blueMicroLine);
        this.sldObjectsGroup.add(purpleLine);
    }
    createWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, lowerendpoint, lowerendpoints3ld) {
        // inner connections
        this.whiteLines.push(
            new THREE.Vector3(...upperendpoint),
            new THREE.Vector3(...lowerendpoint),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoint),
                new THREE.Vector3(...lowerendpoint),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(...upperendpoints3ld[0]),
            new THREE.Vector3(...lowerendpoints3ld[0]),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[0]),
                new THREE.Vector3(...lowerendpoints3ld[0]),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(upperendpoints3ld[1][0] - 2, upperendpoints3ld[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(upperendpoints3ld[1][0] - 2, upperendpoints3ld[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(upperendpoints3ld[1][0] + 2, upperendpoints3ld[1][1] + 2),
            new THREE.Vector3(upperendpoints3ld[1][0] - 2, upperendpoints3ld[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(upperendpoints3ld[1][0] + 2, upperendpoints3ld[1][1] + 2),
                new THREE.Vector3(upperendpoints3ld[1][0] - 2, upperendpoints3ld[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(upperendpoints3ld[1][0] + 2, upperendpoints3ld[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(upperendpoints3ld[1][0] + 2, upperendpoints3ld[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(...lowerendpoints3ld[1]),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(...lowerendpoints3ld[1]),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(...upperTopPoints[1]),
            new THREE.Vector3(upperTopPoints[1][0] - 2, upperTopPoints[1][1] + 2),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints[1]),
                new THREE.Vector3(upperTopPoints[1][0] - 2, upperTopPoints[1][1] + 2),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(upperTopPoints[1][0] + 2, upperTopPoints[1][1] + 2),
            new THREE.Vector3(upperTopPoints[1][0] - 2, upperTopPoints[1][1] + 2),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints[1][0] + 2, upperTopPoints[1][1] + 2),
                new THREE.Vector3(upperTopPoints[1][0] - 2, upperTopPoints[1][1] + 2),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(...upperTopPoints[1]),
            new THREE.Vector3(upperTopPoints[1][0] + 2, upperTopPoints[1][1] + 2),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints[1]),
                new THREE.Vector3(upperTopPoints[1][0] + 2, upperTopPoints[1][1] + 2),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(...upperTopPoints[0]),
            new THREE.Vector3(...upperTopPoints[1]),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints[0]),
                new THREE.Vector3(...upperTopPoints[1]),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(...upperTopPoints3ld[1]),
            new THREE.Vector3(upperTopPoints3ld[1][0] - 2, upperTopPoints3ld[1][1] + 2),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ld[1]),
                new THREE.Vector3(upperTopPoints3ld[1][0] - 2, upperTopPoints3ld[1][1] + 2),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(upperTopPoints3ld[1][0] + 2, upperTopPoints3ld[1][1] + 2),
            new THREE.Vector3(upperTopPoints3ld[1][0] - 2, upperTopPoints3ld[1][1] + 2),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints3ld[1][0] + 2, upperTopPoints3ld[1][1] + 2),
                new THREE.Vector3(upperTopPoints3ld[1][0] - 2, upperTopPoints3ld[1][1] + 2),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(...upperTopPoints3ld[1]),
            new THREE.Vector3(upperTopPoints3ld[1][0] + 2, upperTopPoints3ld[1][1] + 2),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ld[1]),
                new THREE.Vector3(upperTopPoints3ld[1][0] + 2, upperTopPoints3ld[1][1] + 2),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(...upperTopPoints3ld[0]),
            new THREE.Vector3(...upperTopPoints3ld[1]),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ld[0]),
                new THREE.Vector3(...upperTopPoints3ld[1]),
            ]
        });
    }

    getUpper(origin, size) {
        const [x, y] = [origin[0], origin[1] - 30];
        const [X, Y] = [x + (size / 2), y + (size / 2)];
        const smallboxsize = gap;
        const radius = (size - 3) / 2;
        let upperTopPoints = [];
        let upperTopPoints3ld = [];
        let upperendpoints3ld = [];
        let upperendpoint = [];
        this.connectionPoints.push(
            new THREE.Vector2(X, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X - gap, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X + gap, Y + (radius / 2) + smallboxsize),
        );

        upperTopPoints = [
            [X, Y + (radius / 2) + (smallboxsize / 2)],
            [X, Y + (radius / 2) + (smallboxsize / 2) + 20],
        ];
        upperTopPoints3ld = [
            [X - gap, Y + (radius / 2) + (smallboxsize / 2)],
            [X - gap, Y + (radius / 2) + (smallboxsize / 2) + 20],
        ];
        upperendpoints3ld = [
            [X - gap, Y - (radius / 2) - (smallboxsize / 2)],
            [X + gap, Y + (radius / 2) + smallboxsize + 16],
        ];
        upperendpoint = [X, Y - (radius / 2) - (smallboxsize / 2)];

        // lines between small squares
        this.leaders.push([
            new THREE.Vector3(X, Y + (radius / 2) - (smallboxsize / 2) - 1),
            new THREE.Vector3(X, Y - (radius / 2) + (smallboxsize / 2) + 1),
        ]);
        this.sldObjectsGroup.add(getLine([X, Y + (radius / 2) - (smallboxsize / 2) - 1], [X, Y - (radius / 2) + (smallboxsize / 2) + 1]));
        this.sldObjectsGroup.add(getLine([X, Y + (radius / 2) - (smallboxsize / 2) - 1], [X + 1, Y + (smallboxsize / 2) + 1]));
        this.sldObjectsGroup.add(getLine([X, Y + (radius / 2) - (smallboxsize / 2) - 1], [X - 1, Y + (smallboxsize / 2) + 1]));

        this.leaders.push([
            new THREE.Vector3(X - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
            new THREE.Vector3(X - smallboxsize, Y + (radius / 2) - (smallboxsize / 2) - 1),
        ]);
        this.sldObjectsGroup.add(getLine([X - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1], [X - smallboxsize, Y + (radius / 2) - (smallboxsize / 2) - 1]));
        this.sldObjectsGroup.add(getLine([X - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1], [X - smallboxsize - 1, Y - (smallboxsize / 2) - 1]));
        this.sldObjectsGroup.add(getLine([X - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1], [X - smallboxsize + 1, Y - (smallboxsize / 2) - 1]));

        this.whiteLines.push(...getThreeRectangle1({ width: size, height: size, origin: [origin[0], origin[1] - 30] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: size, height: size, origin: [origin[0], origin[1] - 30] }));
        // circle thing

        this.whiteCircles.push({
            position: new THREE.Vector3(X, Y),
            radius,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X, Y], radius, startAngle: 0, endAngle: 2 * Math.PI,
        }));

        // big square at left side of circle

        this.texts.push({
            position: new THREE.Vector3(X - radius + 5, y + 30),
            text: 'L',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, 'L', [X - radius + 5, y + 30], 4));
        this.whiteLines.push(
            new THREE.Vector3(X - radius + 0.5, Y - 5),
            new THREE.Vector3(X - radius + 10, Y - 5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - radius + 0.5, Y - 5),
                new THREE.Vector3(X - radius + 10, Y - 5),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X - radius + 10, Y - 5),
            new THREE.Vector3(X - radius + 10, Y + 5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - radius + 10, Y - 5),
                new THREE.Vector3(X - radius + 10, Y + 5),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X - radius + 10, Y + 5),
            new THREE.Vector3(X - radius + 0.5, Y + 5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - radius + 10, Y + 5),
                new THREE.Vector3(X - radius + 0.5, Y + 5),
            ]
        });
        // this.whiteLines.push(...getThreeRectangle1({ width: 6, height: 6, origin: [X - radius, Y - 3] }));

        // small squares

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X - (smallboxsize / 2) + 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X - (smallboxsize / 2) + 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X - (smallboxsize / 2) + 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X - (smallboxsize / 2) + 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X - (3 * (smallboxsize / 2)) - 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X - (3 * (smallboxsize / 2)) - 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X - (3 * (smallboxsize / 2)) - 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X - (3 * (smallboxsize / 2)) - 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));
        return {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld,
        };
    }
    getLower(origin, sizes) {
        const [x, y] = origin;
        const [w, h] = [sizes[0], sizes[1] - 30];
        const [X, Y] = [x + (w / 2), y + (h / 2)];

        const placeHolder = 'X'; // in Brackets
        let infoBreakerSize = Math.floor(this.wireSize.breakerSizes.utilityMeter);
        if (infoBreakerSize <= 20) {
            infoBreakerSize = 20;
        }
        else if (infoBreakerSize % 10 === 0 && this.wireSize.breakerSizes.utilityMeter !== infoBreakerSize) {
            infoBreakerSize++;
        }
        for (let i = 1; i < 10; i++) {
            if (infoBreakerSize % 10 === 0) {
                break;
            }
            infoBreakerSize++;
        }

        const placeHolder2 = 'XX'; // PV Breaker
        const placeHolder3 = `${infoBreakerSize}`; // Main Service Panel and Main Breaker

        this.connectionPoints.push(
            new THREE.Vector2(X - (w / 4) - 1, Y - (h / 6)),
            new THREE.Vector2(X - (w / 4) - 1, Y - (h / 6) + gap),
            new THREE.Vector2(X + gap, Y - (h / 6)),
        );

        const lowerendpoint = [X, y + (5 * (h / 6)) + 6];
        const lowerendpoints3ld = [
            [X - gap, y + (5 * (h / 6)) + 4],
            [X + gap, y + (5 * (h / 6)) + 8],
        ];

        // Outer box
        this.whiteLines.push(...getThreeRectangle1({ width: w, height: h - 30, origin: [origin[0], origin[1] + 30] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: w, height: h - 30, origin: [origin[0], origin[1] + 30] }));

        // neutral and ground connection boxes

        // neutral connection box
        this.whiteLines.push(...getThreeRectangle1({ width: 18, height: 1, origin: [x + 6, y + 36] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 18, height: 1, origin: [x + 6, y + 36] }));

        // Ground connection Box
        this.whiteLines.push(...getThreeRectangle1({ width: 18, height: 1, origin: [x + 32, y + 36] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 18, height: 1, origin: [x + 32, y + 36] }));

        this.whiteLines.push(
            new THREE.Vector3(x + 24, y + 36.5),
            new THREE.Vector3(x + 32, y + 36.5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x + 24, y + 36.5),
                new THREE.Vector3(x + 32, y + 36.5),
            ]
        });

        //
        const textShiftFactorDxf = 20;
        const info = `(${placeHolder}) XX A MAIN SERVICE PANEL\nWITH (${placeHolder}) XX A MAIN BREAKER`;
        const info2 = `(N) ${placeHolder3} A PV BREAKER`;
        const info3 = `${placeHolder2} A`;
        const info4 = `(N) ${placeHolder3} A`;

        this.texts.push({
            position: new THREE.Vector3(x + w + 53, y + 60),
            text: `(${placeHolder}) XX A MAIN SERVICE PANEL`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x + w + 53, y + 52),
            text: `WITH (${placeHolder}) XX A MAIN BREAKER`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info, [x + w + 50, y + 60], 4));

        this.leaders.push([
            new THREE.Vector3(X + 1, y + (5 * (h / 6)) - 3),
            new THREE.Vector3(x + w, y + 60),
            new THREE.Vector3(x + w + 10, y + 60),
        ]);
        this.sldObjectsGroup.add(getLine([X + 1, y + (5 * (h / 6)) - 3], [x + w, y + 60]));
        this.sldObjectsGroup.add(getLine([x + w, y + 60], [x + w + 10, y + 60]));

        this.texts.push({
            position: new THREE.Vector3(x + w + 30, y + h - 5),
            text: 'LINE SIDE TAP',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, 'LINE SIDE TAP', [x + w + 30, y + h - 5], 4));
        this.leaders.push([
            new THREE.Vector3(X + 1, y + h - (2 * gap)),
            new THREE.Vector3(x + w, y + h - 5),
            new THREE.Vector3(x + w + 10, y + h - 5),
        ]);
        this.sldObjectsGroup.add(getLine([X + 1, y + h - (2 * gap)], [x + w, y + h - 5]));
        this.sldObjectsGroup.add(getLine([x + w, y + h - 5], [x + w + 10, y + h - 5]));

        this.texts.push({
            position: new THREE.Vector3(X + 4, y + (5 * (h / 6))),
            text: `${placeHolder2} A`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info3, [X + 4, y + (5 * (h / 6))], 4));

        this.startPoints = [{
            red: [x - 14, y + h - gap],
            white: [x - 6, y + h - (2 * gap)],
            blue: [x - 14, y + 28],
            green: [x - 22, y + (h / 6) - 9.5],
        }];

        this.whiteLines.push(
            new THREE.Vector3(X, y + (5 * (h / 6)) + 6),
            new THREE.Vector3(X, y + (5 * (h / 6)) + 4.33),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) + 6),
                new THREE.Vector3(X, y + (5 * (h / 6)) + 4.33),
            ]
        });


        this.blueLines.push(
            new THREE.Vector3(X + gap, y + (5 * (h / 6)) + 8),
            new THREE.Vector3(X + gap, y + 42),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap, y + (5 * (h / 6)) + 8),
                new THREE.Vector3(X + gap, y + 42),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap, y + 42),
            new THREE.Vector3(x + 15, y + 42),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap, y + 42),
                new THREE.Vector3(x + 15, y + 42),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 15, y + 42),
            new THREE.Vector3(x + 15, y + 37),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 15, y + 42),
                new THREE.Vector3(x + 15, y + 37),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 15, y + 36),
            new THREE.Vector3(x + 15, y + 30),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 15, y + 36),
                new THREE.Vector3(x + 15, y + 30),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 15, y + 30),
            new THREE.Vector3(x + 15, y + 28),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 15, y + 30),
                new THREE.Vector3(x + 15, y + 28),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 15, y + 28),
            new THREE.Vector3(x - 18, y + 28),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 15, y + 28),
                new THREE.Vector3(x - 18, y + 28),
            ]
        });

        // main wire top fed curve
        this.whiteCircles.push({
            position: new THREE.Vector3(X - 0.66, y + (5 * (h / 6))),
            radius: 4,
            startAngle: 3 * (Math.PI / 2),
            endAngle: Math.PI / 2,
        });
        let points = [];
        points.push(...getThreeCircleDXF([X - 0.66, y + (5 * (h / 6))], 4, 3 * (Math.PI / 2), Math.PI / 2));
        for (let i = 0; i < points.length - 1; i++) {
            this.whiteLines.push(
                new THREE.Vector3(points[i].x, points[i].y),
                new THREE.Vector3(points[i + 1].x, points[i + 1].y),
            );
        }

        this.whiteCircles.push({
            position: new THREE.Vector3(X, y + (5 * (h / 6)) - 4),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X, y + (5 * (h / 6)) - 4],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X, y + (5 * (h / 6)) + 4),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X, y + (5 * (h / 6)) + 4],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        // red top fed curve
        this.redCircles.push({
            position: new THREE.Vector3(X - gap - 0.66, y + (5 * (h / 6))),
            radius: 4,
            startAngle: 3 * (Math.PI / 2),
            endAngle: Math.PI / 2,
        });
        points = [];
        points.push(...getThreeCircleDXF([X - gap - 0.66, y + (5 * (h / 6))], 4, 3 * (Math.PI / 2), Math.PI / 2));
        for (let i = 0; i < points.length - 1; i++) {
            this.redLines.push(
                new THREE.Vector3(points[i].x, points[i].y),
                new THREE.Vector3(points[i + 1].x, points[i + 1].y),
            );
        }

        this.redCircles.push({
            position: new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - gap, y + (5 * (h / 6)) - 4],
                radius: 0.33,
                startAngle: 0,
                endAngle: Math.PI * 2,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - gap, y + (5 * (h / 6)) + 4),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - gap, y + (5 * (h / 6)) + 4],
                radius: 0.33,
                startAngle: 0,
                endAngle: Math.PI * 2,
            },
            'red',
        ));

        this.whiteLines.push(
            new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X, y + 46),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X, y + 46),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X - gap, y + 46),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X - gap, y + 46),
            ]
        });

        this.dashedLines.push(
            new THREE.Vector3(x - 22, y + (h / 6) - 9.5),
            new THREE.Vector3(x - 22, y + 6),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 22, y + (h / 6) - 9.5),
                new THREE.Vector3(x - 22, y + 6),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 22, y + (h / 6) - 9.5],
            [x - 22, y + 6],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x - 22, y + 16),
            new THREE.Vector3(x + 41, y + 16),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 22, y + 16),
                new THREE.Vector3(x + 41, y + 16),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 22, y + 15.5],
            [x + 41, y + 15.5],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x + 41, y + 16),
            new THREE.Vector3(x + 41, y + 36),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x + 41, y + 16),
                new THREE.Vector3(x + 41, y + 36),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x + 41, y + 16],
            [x + 41, y + 36],
            'green',
        ));

        this.whiteLines.push(...getThreeRectangle1({ width: 6, height: 1, origin: [x - 25, y + 10] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 6, height: 1, origin: [x - 25, y + 10] }));

        this.greenLines.push(...getThreeRectangle1({ width: 5, height: 0.5, origin: [x - 24.5, y + 5.5] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 5, height: 0.5, origin: [x - 24.5, y + 5.5] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 5, height: 0.5, origin: [x - 24.5, y + 5.5] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 4, height: 0.5, origin: [x - 24, y + 5] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 4, height: 0.5, origin: [x - 24, y + 5] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 4, height: 0.5, origin: [x - 24, y + 5] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 3, height: 0.5, origin: [x - 23.5, y + 4.5] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 3, height: 0.5, origin: [x - 23.5, y + 4.5] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 3, height: 0.5, origin: [x - 23.5, y + 4.5] }, 'green'));

        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 8),
            text: '   EXISTING',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 16),
            text: 'GROUNDING',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 24),
            text: '    SYSTEM',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, '   EXISTING\nGROUNDING\n    SYSTEM', [x - 22, y - 8], 4));
        // white curves
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 3, Y + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y + (h / 6) + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 3, Y + (h / 6) + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y - (h / 6) + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 3, Y - (h / 6) + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        // white connection Points at right of curve
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) + 1, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) + 1, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) + 1, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        // white connection points at left of curve
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 7, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 7, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 7, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteLines.push(
            new THREE.Vector3(x - 14, y + h - (2 * gap)),
            new THREE.Vector3(X, y + h - (2 * gap)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x - 14, y + h - (2 * gap)),
                new THREE.Vector3(X, y + h - (2 * gap)),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X, Y - (h / 6)),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y),
            new THREE.Vector3(X, Y),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y),
                new THREE.Vector3(X, Y),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y + (h / 6)),
            new THREE.Vector3(X, Y + (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y + (h / 6)),
                new THREE.Vector3(X, Y + (h / 6)),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6)),
            new THREE.Vector3(X, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6)),
                new THREE.Vector3(X, Y - (h / 6)),
            ]
        });

        // red curves
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y + gap + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 3, Y + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y + (h / 6) + gap + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 3, Y + (h / 6) + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 3, Y - (h / 6) + gap + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 3, Y - (h / 6) + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        // connection points on right of curve
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) + 1, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y + (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) + 1, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) + 1, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) + 1, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));


        // connection points on left of curve
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 7, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y + (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 7, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 7, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 7, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X - gap, Y - (h / 6) + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y + gap),
            new THREE.Vector3(X - gap, Y + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y + gap),
                new THREE.Vector3(X - gap, Y + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(x - 14, y + h - gap),
            new THREE.Vector3(X - gap, y + h - gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(x - 14, y + h - gap),
                new THREE.Vector3(X - gap, y + h - gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y + (h / 6) + gap),
            new THREE.Vector3(X - gap, Y + (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y + (h / 6) + gap),
                new THREE.Vector3(X - gap, Y + (h / 6) + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6) + gap),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6) + gap),
                new THREE.Vector3(X - gap, Y - (h / 6) + gap),
            ]
        });

        // connections from ac disconnect to Utility Meter

        this.redLines.push(...connectTwoPoints1(
            this.startPoints[0].red,
            this.previousEndPoints[0].red,
        ));
        this.redPolyLines.push(connectTwoPoints1PolyLine(
            this.startPoints[0].red,
            this.previousEndPoints[0].red,
        ));

        this.whiteLines.push(...connectTwoPoints1(
            this.startPoints[0].white,
            this.previousEndPoints[0].white,
        ));
        this.whitePolyLines.push(connectTwoPoints1PolyLine(
            this.startPoints[0].white,
            this.previousEndPoints[0].white,
        ));

        this.blueLines.push(...connectTwoPoints1(
            this.startPoints[0].blue,
            this.previousEndPoints[0].blue,
        ));
        this.bluePolyLines.push(connectTwoPoints1PolyLine(
            this.startPoints[0].blue,
            this.previousEndPoints[0].blue,
        ));

        this.dashedLines.push(...connectTwoPoints1(
            this.startPoints[0].green,
            this.previousEndPoints[0].green,
        ));
        this.dashedPolyLines.push(connectTwoPoints1PolyLine(
            this.startPoints[0].green,
            this.previousEndPoints[0].green,
        ));
        this.sldObjectsGroup.add(connectTwoDottedPoints1(
            this.startPoints[0].green,
            this.previousEndPoints[0].green,
            'green',
        ));
        return { lowerendpoint, lowerendpoints3ld };
    }
}

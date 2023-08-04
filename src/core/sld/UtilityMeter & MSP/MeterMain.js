/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
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
    getLetterM,
    getLetterMPolyLine,
    getThreeRectangle1PolyLines,
    connectTwoPoints1PolyLine,
    getLine,
} from '../utils';

const gap = 8;

export default class MeterMain {
    constructor(origin, previousEndPoints, font, groupSLD, group3LD, wireSize, isMicroInverter = false) {
        this.origin = origin;
        [this.originX, this.originY] = this.origin;
        this.size = 60;

        this.font = font;
        this.wireSize = wireSize;
        // Arrays of Points
        this.previousEndPoints = previousEndPoints; // AC Disconnect box End Points
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
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.dashedLines = [];
        this.leaders = [];

        // All function Call For creation of design

        const {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, upperTopPoints3ldBlue,
        } = this.getUpper([this.originX, this.originY + (this.size * 3)], this.size);
        const { lowerendpoint, lowerendpoints3ld } = this.getLower(this.origin, [this.size, this.size * 3]);
        this.createSolarFedWiresWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, upperTopPoints3ldBlue, lowerendpoint, lowerendpoints3ld);

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

    createSolarFedWiresWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, upperTopPoints3ldBlue, lowerendpoint, lowerendpoints3ld) {
        // inner connections
        this.whiteLines.push(
            new THREE.Vector3(upperendpoint[0], upperendpoint[1] - 10),
            new THREE.Vector3(...lowerendpoint),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(upperendpoint[0], upperendpoint[1] - 10),
                new THREE.Vector3(...lowerendpoint),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(upperendpoints3ld[0][0], upperendpoints3ld[0][1] - 9),
            new THREE.Vector3(...lowerendpoints3ld[0]),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(upperendpoints3ld[0][0], upperendpoints3ld[0][1] - 9),
                new THREE.Vector3(...lowerendpoints3ld[0]),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(upperendpoints3ld[1][0], upperendpoints3ld[0][1] - 9),
            new THREE.Vector3(...lowerendpoints3ld[1]),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(upperendpoints3ld[1][0], upperendpoints3ld[0][1] - 9),
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
            new THREE.Vector3(upperTopPoints[0][0], upperTopPoints[0][1] - 1),
            new THREE.Vector3(...upperTopPoints[1]),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints[0][0], upperTopPoints[0][1] - 1),
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
            new THREE.Vector3(upperTopPoints3ld[0][0], upperTopPoints3ld[0][1] - 2),
            new THREE.Vector3(...upperTopPoints3ld[1]),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints3ld[0][0], upperTopPoints3ld[0][1] - 2),
                new THREE.Vector3(...upperTopPoints3ld[1]),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(...upperTopPoints3ldBlue[1]),
            new THREE.Vector3(upperTopPoints3ldBlue[1][0] - 2, upperTopPoints3ldBlue[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ldBlue[1]),
                new THREE.Vector3(upperTopPoints3ldBlue[1][0] - 2, upperTopPoints3ldBlue[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(upperTopPoints3ldBlue[1][0] + 2, upperTopPoints3ldBlue[1][1] + 2),
            new THREE.Vector3(upperTopPoints3ldBlue[1][0] - 2, upperTopPoints3ldBlue[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints3ldBlue[1][0] + 2, upperTopPoints3ldBlue[1][1] + 2),
                new THREE.Vector3(upperTopPoints3ldBlue[1][0] - 2, upperTopPoints3ldBlue[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(...upperTopPoints3ldBlue[1]),
            new THREE.Vector3(upperTopPoints3ldBlue[1][0] + 2, upperTopPoints3ldBlue[1][1] + 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ldBlue[1]),
                new THREE.Vector3(upperTopPoints3ldBlue[1][0] + 2, upperTopPoints3ldBlue[1][1] + 2),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(upperTopPoints3ldBlue[1][0], upperTopPoints3ld[0][1] - 2),
            new THREE.Vector3(...upperTopPoints3ldBlue[1]),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints3ldBlue[1][0], upperTopPoints3ld[0][1] - 2),
                new THREE.Vector3(...upperTopPoints3ldBlue[1]),
            ]
        });

        // M in center of Upper Box
        const Msize = 10;
        const Morigin = [this.originX + (this.size / 2) - (Msize / 2), this.originY + (this.size * 3) + (this.size / 2) - (Msize / 2) - 30];
        this.whiteLines.push(...getLetterM(Morigin, Msize));
        this.whitePolyLines.push(getLetterMPolyLine(Morigin, Msize));
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
        let upperTopPoints3ldBlue = [];
        this.connectionPoints.push(
            new THREE.Vector2(X, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X - gap, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X + gap, Y + (radius / 2) + smallboxsize),
        );

        upperTopPoints = [
            [X, Y + (radius / 2) + (smallboxsize / 2) + 11],
            [X, Y + (radius / 2) + (smallboxsize / 2) + 16],
        ];
        upperTopPoints3ld = [
            [X - gap, Y + (radius / 2) + (smallboxsize / 2) + 11],
            [X - gap, Y + (radius / 2) + (smallboxsize / 2) + 16],
        ];
        upperTopPoints3ldBlue = [
            [X + gap, Y + (radius / 2) + (smallboxsize / 2) + 11],
            [X + gap, Y + (radius / 2) + (smallboxsize / 2) + 16],
        ];
        upperendpoints3ld = [
            [X - gap, Y - (radius / 2) - (smallboxsize / 2)],
            [X + gap, Y + (radius / 2) + smallboxsize + 8],
        ];
        upperendpoint = [X, Y - (radius / 2) - (smallboxsize / 2)];

        this.whiteCircles.push({
            position: new THREE.Vector3(X, Y),
            radius,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X, Y], radius, startAngle: 0, endAngle: 2 * Math.PI,
        }));

        this.whiteLines.push(...getThreeRectangle1({ width: size, height: size, origin: [x, y] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: size, height: size, origin: [x, y] }));

        return {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, upperTopPoints3ldBlue,
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

        const placeHolder2 = `${infoBreakerSize}`; // PV Breaker
        const placeHolder3 = 'XX'; // Main Service Panel and Main Breaker

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
        const textShiftFactorDxf = 20;
        const solar = 'TO UTILITY GRID';
        const info = `(${placeHolder}) ${placeHolder3} A MAIN\nSERVICE PANEL\nWITH (${placeHolder}) ${placeHolder3} A MAIN\n BREAKER`;
        const info2 = `(N) ${placeHolder2} A/2P DEDICATED\n                 PV BREAKER`;
        const info3 = `${placeHolder3} A`;
        const info4 = `(${placeHolder}) ${placeHolder3} A MAIN\nBREAKER 240V/2P`;


        this.texts.push({
            position: new THREE.Vector3(x + 29, y + (4 * (h / 3)) + 25),
            text: 'TO UTILITY GRID',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, solar, [x + 29, y + (4 * (h / 3)) + 25], 4));

        this.texts.push({
            position: new THREE.Vector3(x + w + 24, y + h - 4),
            text: `(${placeHolder}) ${placeHolder3} A MAIN`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x + w + 25, y + h - 12),
            text: 'SERVICE PANEL',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x + w + 31, y + h - 20),
            text: `WITH (${placeHolder}) ${placeHolder3} A MAIN`,
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x + w + 24, y + h - 28),
            text: ' BREAKER',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info, [x + w + 30, y + h - 26], 4));
        // this.sldObjectsGroup.add(createTextElement(this.font, info4, [x - w + 25, y + h + 10], 4));
        this.leaders.push([
            new THREE.Vector3(X + gap + 3, y + (5 * (h / 6))),
            new THREE.Vector3(x + w + 6, y + (5 * (h / 6))),
        ]);
        this.sldObjectsGroup.add(getLine([x + w + 6, y + (5 * (h / 6))], [X + gap + 3, y + (5 * (h / 6))]));

        this.texts.push({
            position: new THREE.Vector3(X + 9, y + (5 * (h / 6))),
            text: `${placeHolder3} A`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info3, [X + 5, y + 5 * h / 6], 4));

        // Start Points
        this.startPoints = [{
            red: [x - 8, Y + (h / 6) + 6],
            white: [x, Y + (h / 6)],
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
            new THREE.Vector3(X, Y + (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X, Y + (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X - gap, Y + (h / 6) + 6),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X - gap, Y + (h / 6) + 6),
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

        // connection lines to end points
        this.whiteLines.push(
            new THREE.Vector3(X, Y + (h / 6)),
            new THREE.Vector3(x, Y + (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, Y + (h / 6)),
                new THREE.Vector3(x, Y + (h / 6)),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(X - gap, Y + (h / 6) + 6),
            new THREE.Vector3(x - 8, Y + (h / 6) + 6),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, Y + (h / 6) + 6),
                new THREE.Vector3(x - 8, Y + (h / 6) + 6),
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

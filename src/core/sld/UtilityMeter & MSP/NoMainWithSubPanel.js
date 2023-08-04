/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import { createTextElement } from '../sldUtils';
import {
    getThreeRectangle,
    getThreeArc,
    getDashedLine,
    getThreeRectangle1,
    connectTwoDottedPoints1,
    connectTwoPoints1,
    getThreeRectangle1PolyLines,
    connectTwoPoints1PolyLine,
    getLine,
} from '../utils';
import createBufferGeometry from '../../utils/meshUtils';

const gap = 8;

export default class WithSubPanel {
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

        let boxShiftY = 0;
        // Header Text and Box
        if (!this.isMicroInverter) {
            boxShiftY = -30;
        }
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) + 30 - boxShiftY),
            text: 'BI-DIRECTIONAL',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) + 22 - boxShiftY),
            text: 'UTILITY METER',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) + 14 - boxShiftY),
            text: '  1-PHASE, 3-W,',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(this.originX + 29.5, (this.size * 3) + 6 - boxShiftY),
            text: '120V/240V, 60Hz',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(
            this.font,
            'BI-DIRECTIONAL\nUTILITY METER\n  1-PHASE, 3-W,\n120V/240V, 60Hz',
            [this.originX + 29.5, (this.size * 3) + 20 - boxShiftY],
            4,
        ));

        const textBoxPosition = [this.originX + 4, (this.size * 3) + 2 - boxShiftY];
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

        // Top Fed
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
        const info2 = `(N) ${placeHolder2} A PV BREAKER`;
        const info4 = `${placeHolder2} A`;

        this.texts.push({
            position: new THREE.Vector3(X - (w / 4), Y - (h / 6) + 9),
            text: `${placeHolder2} A`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info4, [X - (w / 4) - 1, Y - (h / 6) + 9], 4));

        const info = '(X) XX A MAIN SERVICE PANEL\n    WITH NO MAIN BREAKER';
        const subInfo = '(N) SUB PANEL';

        this.texts.push({
            position: new THREE.Vector3(x - w - textShiftFactorDxf, y + h),
            text: '(N) XX A MAIN SERVICE PANEL',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x - w - textShiftFactorDxf, y + h - 8),
            text: '    WITH NO MAIN BREAKER',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info, [x - w + 10, y + h + 40], 4));

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

        // // main wire top fed curve

        this.whiteLines.push(
            new THREE.Vector3(X, y + (5 * (h / 6)) + 4.33),
            new THREE.Vector3(X, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) + 4.33),
                new THREE.Vector3(X, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) + 4.33),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) + 4.33),
                new THREE.Vector3(X - gap, Y - (h / 6) + gap),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) - 7.33, Y - (h / 6)),
            new THREE.Vector3(x - 6, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 7.33, Y - (h / 6)),
                new THREE.Vector3(x - 6, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) - 7.33, Y - (h / 6) + gap),
            new THREE.Vector3(x - 12, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 7.33, Y - (h / 6) + gap),
                new THREE.Vector3(x - 12, Y - (h / 6) + gap),
            ]
        });

        // white curves

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
            new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
            new THREE.Vector3(X, Y - h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) - 4.33),
                new THREE.Vector3(X, Y - h / 6),
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
            new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6) + gap),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33, Y - (h / 6) + gap),
                new THREE.Vector3(X - gap, Y - (h / 6) + gap),
            ]
        });

        // SUB PANEL

        this.texts.push({
            position: new THREE.Vector3(X - (w / 4) - 90, Y - (h / 6) + 9),
            text: `${placeHolder2} A`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info4, [X - (w / 4) - 91, Y - (h / 6) + 9], 4));

        this.texts.push({
            position: new THREE.Vector3(x - w - 87, y + h),
            text: `(N) ${placeHolder2} A PV BREAKER`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info2, [x - w - 72, y + h], 4));

        this.leaders.push([
            new THREE.Vector3(X - (w / 4) - 97.33, Y - (h / 6) + 0.5),
            new THREE.Vector3(x - 94, Y - (h / 6) + 0.5 + 10),
            new THREE.Vector3(x - 94, y + h),
            new THREE.Vector3(x - 99, y + h),
        ]);
        this.sldObjectsGroup.add(getLine([x - 94, Y - (h / 6) + 0.5 + 10], [X - (w / 4) - 97.33, Y - (h / 6) + 0.5]));
        this.sldObjectsGroup.add(getLine([x - 94, Y - (h / 6) + 0.5 + 10], [x - 94, y + h]));
        this.sldObjectsGroup.add(getLine([x - 94, y + h], [x - 99, y + h]));

        // Start Points
        this.startPoints = [{
            red: [x - 86, Y - (h / 6) + gap],
            white: [x - 94, Y - (h / 6)],
            blue: [x - 102, y + (h / 6) + gap],
            green: [x - 110, y + 26],
        }];
        this.texts.push({
            position: new THREE.Vector3(x - 60, y + h - 2),
            text: `${placeHolder3} A SUB PANEL`,
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, subInfo, [x - 60, y + h - 2], 4));

        this.dashedLines.push(
            new THREE.Vector3(x - 98, y - 4 + 30),
            new THREE.Vector3(x + 41, y - 4 + 30),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 98, y - 4 + 30),
                new THREE.Vector3(x + 41, y - 4 + 30),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 98, y - 4 + 30],
            [x + 41, y - 4 + 30],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x + 41, y - 4 + 30),
            new THREE.Vector3(x + 41, y + 6 + 30),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x + 41, y - 4 + 30),
                new THREE.Vector3(x + 41, y + 6 + 30),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x + 41, y - 4 + 30],
            [x + 41, y + 6 + 30],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x - 50, y + 6 + 30),
            new THREE.Vector3(x - 50, y - 4 + 30),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 50, y + 6 + 30),
                new THREE.Vector3(x - 50, y - 4 + 30),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 50, y + 6 + 30],
            [x - 50, y - 4 + 30],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x - 78, y + 17),
            new THREE.Vector3(x - 78, y + 26),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 78, y + 17),
                new THREE.Vector3(x - 78, y + 26),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 78, y + 17],
            [x - 78, y + 26],
            'green',
        ));
        this.dashedLines.push(
            new THREE.Vector3(x - 110, y + 26),
            new THREE.Vector3(x - 95, y + 26),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 110, y + 26),
                new THREE.Vector3(x - 95, y + 26),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 110, y + 26],
            [x - 97.33, y + 26],
            'green',
        ));

        this.whiteLines.push(...getThreeRectangle1({ width: 6, height: 1, origin: [x - 81, y - 10 + 30] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 6, height: 1, origin: [x - 81, y - 10 + 30] }));

        this.greenLines.push(...getThreeRectangle1({ width: 5, height: 0.5, origin: [x - 80.5, y - 14.5 + 30] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 5, height: 0.5, origin: [x - 80.5, y - 14.5 + 30] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 5, height: 0.5, origin: [x - 80.5, y - 14.5 + 30] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 4, height: 0.5, origin: [x - 80, y - 15 + 30] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 4, height: 0.5, origin: [x - 80, y - 15 + 30] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 4, height: 0.5, origin: [x - 80, y - 15 + 30] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 3, height: 0.5, origin: [x - 79.5, y - 15.5 + 30] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 3, height: 0.5, origin: [x - 79.5, y - 15.5 + 30] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 3, height: 0.5, origin: [x - 79.5, y - 15.5 + 30] }, 'green'));

        this.texts.push({
            position: new THREE.Vector3(x - 78, y - 28 + 30),
            text: '   EXISTING',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 78, y - 28 - 8 + 30),
            text: 'GROUNDING',
            size: 7,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 78, y - 28 - 16 + 30),
            text: '    SYSTEM',
            size: 7,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, '   EXISTING\nGROUNDING\n    SYSTEM', [x - 78, y - 28 + 30], 4));

        // Sub Panel

        this.whiteLines.push(
            new THREE.Vector3(X - 90, (y + (5 * (h / 6))) + 1),
            new THREE.Vector3(X - 90, (y + 46)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - 90, (y + (5 * (h / 6))) + 1),
                new THREE.Vector3(X - 90, (y + 46)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap - 90, (y + (5 * (h / 6))) + 7),
            new THREE.Vector3(X - gap - 90, (y + 46)),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap - 90, (y + (5 * (h / 6))) + 7),
                new THREE.Vector3(X - gap - 90, (y + 46)),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap - 90, (y + (5 * (h / 6))) - 5),
            new THREE.Vector3(X + gap - 90, (y + 42)),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap - 90, (y + (5 * (h / 6))) - 5),
                new THREE.Vector3(X + gap - 90, (y + 42)),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(x - 74, y + (h / 6) + gap),
            new THREE.Vector3(x - 104, y + (h / 6) + gap),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 74, y + (h / 6) + gap),
                new THREE.Vector3(x - 104, y + (h / 6) + gap),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(x - 74, y + (h / 6) + gap),
            new THREE.Vector3(x - 74, y + 36),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 74, y + (h / 6) + gap),
                new THREE.Vector3(x - 74, y + 36),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(x - 74, y + 42),
            new THREE.Vector3(x - 74, y + 37),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 74, y + 42),
                new THREE.Vector3(x - 74, y + 37),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(x - 74, y + 42),
            new THREE.Vector3(X + gap - 90, y + 42),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 74, y + 42),
                new THREE.Vector3(X + gap - 90, y + 42),
            ]
        });
        // Panel to Utility meter connections

        this.whiteLines.push(
            new THREE.Vector3(X - 90, (y + (5 * (h / 6))) + 1),
            new THREE.Vector3(x - 38, (y + (5 * (h / 6))) + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - 90, (y + (5 * (h / 6))) + 1),
                new THREE.Vector3(x - 38, (y + (5 * (h / 6))) + 1),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - 90 - gap, (y + (5 * (h / 6))) + 7),
            new THREE.Vector3(x - 32, (y + (5 * (h / 6))) + 7),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - 90 - gap, (y + (5 * (h / 6))) + 7),
                new THREE.Vector3(x - 32, (y + (5 * (h / 6))) + 7),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X - 90 + gap, (y + (5 * (h / 6))) - 5),
            new THREE.Vector3(x - 44, (y + (5 * (h / 6))) - 5),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X - 90 + gap, (y + (5 * (h / 6))) - 5),
                new THREE.Vector3(x - 44, (y + (5 * (h / 6))) - 5),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(x - 38, (y + (5 * (h / 6))) + 1),
            new THREE.Vector3(x - 38, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x - 38, (y + (5 * (h / 6))) + 1),
                new THREE.Vector3(x - 38, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(x - 32, (y + (5 * (h / 6))) + 7),
            new THREE.Vector3(x - 32, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(x - 32, (y + (5 * (h / 6))) + 7),
                new THREE.Vector3(x - 32, Y - (h / 6) + gap),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x - 44, (y + (5 * (h / 6))) - 5),
            new THREE.Vector3(x - 44, Y - (h / 6) - gap),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 44, (y + (5 * (h / 6))) - 5),
                new THREE.Vector3(x - 44, Y - (h / 6) - gap),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(x - 38, Y - (h / 6)),
            new THREE.Vector3(x, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x - 38, Y - (h / 6)),
                new THREE.Vector3(x, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(x - 32, Y - (h / 6) + gap),
            new THREE.Vector3(x, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(x - 32, Y - (h / 6) + gap),
                new THREE.Vector3(x, Y - (h / 6) + gap),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x - 44, Y - (h / 6) - gap),
            new THREE.Vector3(x - 25, Y - (h / 6) - gap),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 44, Y - (h / 6) - gap),
                new THREE.Vector3(x - 25, Y - (h / 6) - gap),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x - 25, Y - (h / 6) - gap),
            new THREE.Vector3(x - 25, y + 28),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 25, Y - (h / 6) - gap),
                new THREE.Vector3(x - 25, y + 28),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x - 25, y + 28),
            new THREE.Vector3(x + 10, y + 28),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 25, y + 28),
                new THREE.Vector3(x + 10, y + 28),
            ]
        });

        // Main Box
        this.whiteLines.push(...getThreeRectangle1({ width: w, height: h - 37, origin: [x - 90, y + 30] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: w, height: h - 37, origin: [x - 90, y + 30] }));

        // neutral connection box
        this.whiteLines.push(...getThreeRectangle1({ width: 18, height: 1, origin: [x - 54 - 30, y + 36] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 18, height: 1, origin: [x - 54 - 30, y + 36] }));

        // Ground connection Box
        this.whiteLines.push(...getThreeRectangle1({ width: 18, height: 1, origin: [x - 28 - 30, y + 36] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 18, height: 1, origin: [x - 28 - 30, y + 36] }));

        this.whiteLines.push(
            new THREE.Vector3(x + 14 - 90 + 10, y + 36.5),
            new THREE.Vector3(x + 18 - 90 + 14, y + 36.5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x + 14 - 90 + 10, y + 36.5),
                new THREE.Vector3(x + 18 - 90 + 14, y + 36.5),
            ]
        });

        // Internal Connections

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 90 - 1 - 2, Y + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 2, Y + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 90 - 1 - 6, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 6, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 90 - 1 + 2, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 + 2, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 2, Y + (h / 6) + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 2, Y + (h / 6) + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 6, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 6, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 + 2, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 + 2, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 2, Y - (h / 6) + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 2, Y - (h / 6) + 0.66],
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 6, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 - 6, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 + 2, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 91 + 2, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y),
            new THREE.Vector3(X - 90, Y),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y),
                new THREE.Vector3(X - 90, Y),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y + h / 6),
            new THREE.Vector3(X - 90, Y + h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y + h / 6),
                new THREE.Vector3(X - 90, Y + h / 6),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y - h / 6),
            new THREE.Vector3(X - 90, Y - h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 - 90 + 0.33, Y - h / 6),
                new THREE.Vector3(X - 90, Y - h / 6),
            ]
        });

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 2, Y + gap + 0.66),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 2, Y + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 6, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 6, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 + 2, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 + 2, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 2, Y + (h / 6) + 0.66 + gap),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 2, Y + (h / 6) + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 6, Y + (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 6, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 + 2, Y + (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 + 2, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 2, Y - (h / 6) + 0.66 + gap),
            radius: 4,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 2, Y - (h / 6) + gap + 0.66],
                radius: 4,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 - 6, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 - 6, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 91 + 2, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 91 + 2, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redLines.push(
            new THREE.Vector3(X - gap - 90, y + (5 * (h / 6)) - 1),
            new THREE.Vector3(X - gap - 90, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap - 90, y + (5 * (h / 6)) - 1),
                new THREE.Vector3(X - gap - 90, Y - (h / 6) + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y + gap),
            new THREE.Vector3(X - gap - 90, Y + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y + gap),
                new THREE.Vector3(X - gap - 90, Y + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y + (h / 6) + gap),
            new THREE.Vector3(X - gap - 90, Y + h / 6 + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y + (h / 6) + gap),
                new THREE.Vector3(X - gap - 90, Y + h / 6 + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y - (h / 6) + gap),
            new THREE.Vector3(X - gap - 90, Y - h / 6 + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1.33 - 90, Y - (h / 6) + gap),
                new THREE.Vector3(X - gap - 90, Y - h / 6 + gap),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) - 97.33, Y - (h / 6)),
            new THREE.Vector3(x - 94, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 97.33, Y - (h / 6)),
                new THREE.Vector3(x - 94, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) - 97.33, Y - (h / 6) + gap),
            new THREE.Vector3(x - 90, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 97.33, Y - (h / 6) + gap),
                new THREE.Vector3(x - 90, Y - (h / 6) + gap),
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

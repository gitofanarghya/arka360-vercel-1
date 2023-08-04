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

const gap = 4;

export default class CenterFed {
    constructor(origin, previousEndPoints, font, groupSLD, group3LD, wireSize, isMicroInverter = false) {
        this.origin = origin;
        [this.originX, this.originY] = this.origin;
        this.size = 30;

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

        let boxShiftY = 0;
        // Header Text and Box
        if (!this.isMicroInverter) {
            boxShiftY = 0;
        }
        if (!this.solarReadyPanel && !this.bottomFedWithDownUtility) {
            this.texts.push({
                position: new THREE.Vector3(this.originX + 14.5, (this.size * 3) + 67 - boxShiftY),
                text: 'BI-DIRECTIONAL',
                size: 5,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + 14.5, (this.size * 3) + 62 - boxShiftY),
                text: 'UTILITY METER',
                size: 5,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + 14.5, (this.size * 3) + 57 - boxShiftY),
                text: '  1-PHASE, 3-W,',
                size: 5,
            });
            this.texts.push({
                position: new THREE.Vector3(this.originX + 14.5, (this.size * 3) + 52 - boxShiftY),
                text: '120V/240V, 60Hz',
                size: 5,
            });
            this.sldObjectsGroup.add(createTextElement(
                this.font,
                'BI-DIRECTIONAL\nUTILITY METER\n  1-PHASE, 3-W,\n120V/240V, 60Hz',
                [this.originX + 14.5, (this.size * 3) + 60 - boxShiftY],
                4,
            ));

            const textBoxPosition = [this.originX - 11, (this.size * 3) + 42 - boxShiftY];
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
        }

        // All function Call For creation of design
        const {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld,
        } = this.getUpper([this.originX, this.originY + (this.size * 3)], this.size);
        const { lowerendpoint, lowerendpoints3ld } = this.getLower(this.origin, [this.size, (this.size * 3)]);
        this.createCenterFedWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, lowerendpoint, lowerendpoints3ld);
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
    createCenterFedWires(upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld, lowerendpoint, lowerendpoints3ld) {
        this.whiteLines.push(
            new THREE.Vector3(...upperendpoint),
            new THREE.Vector3(lowerendpoint[0] + 5, lowerendpoint[1] + 3),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoint),
                new THREE.Vector3(lowerendpoint[0] + 5, lowerendpoint[1] + 3),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(...upperendpoints3ld[0]),
            new THREE.Vector3(lowerendpoints3ld[0][0] + 5, lowerendpoints3ld[0][1] + 2),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[0]),
                new THREE.Vector3(lowerendpoints3ld[0][0] + 5, lowerendpoints3ld[0][1] + 2),
            ]
        });
        
        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(upperendpoints3ld[1][0] - 1, upperendpoints3ld[1][1] + 1),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(upperendpoints3ld[1][0] - 1, upperendpoints3ld[1][1] + 1),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(upperendpoints3ld[1][0] + 1, upperendpoints3ld[1][1] + 1),
            new THREE.Vector3(upperendpoints3ld[1][0] - 1, upperendpoints3ld[1][1] + 1),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(upperendpoints3ld[1][0] + 1, upperendpoints3ld[1][1] + 1),
                new THREE.Vector3(upperendpoints3ld[1][0] - 1, upperendpoints3ld[1][1] + 1),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(upperendpoints3ld[1][0] + 1, upperendpoints3ld[1][1] + 1),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(upperendpoints3ld[1][0] + 1, upperendpoints3ld[1][1] + 1),
            ]
        });
        this.blueLines.push(
            new THREE.Vector3(...upperendpoints3ld[1]),
            new THREE.Vector3(lowerendpoints3ld[1][0] + 5, lowerendpoints3ld[1][1] + 4),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(...upperendpoints3ld[1]),
                new THREE.Vector3(lowerendpoints3ld[1][0] + 5, lowerendpoints3ld[1][1] + 4),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(...upperTopPoints[1]),
            new THREE.Vector3(upperTopPoints[1][0] - 1, upperTopPoints[1][1] + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints[1]),
                new THREE.Vector3(upperTopPoints[1][0] - 1, upperTopPoints[1][1] + 1),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(upperTopPoints[1][0] + 1, upperTopPoints[1][1] + 1),
            new THREE.Vector3(upperTopPoints[1][0] - 1, upperTopPoints[1][1] + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints[1][0] + 1, upperTopPoints[1][1] + 1),
                new THREE.Vector3(upperTopPoints[1][0] - 1, upperTopPoints[1][1] + 1),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(...upperTopPoints[1]),
            new THREE.Vector3(upperTopPoints[1][0] + 1, upperTopPoints[1][1] + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints[1]),
                new THREE.Vector3(upperTopPoints[1][0] + 1, upperTopPoints[1][1] + 1),
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
            new THREE.Vector3(upperTopPoints3ld[1][0] - 1, upperTopPoints3ld[1][1] + 1),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ld[1]),
                new THREE.Vector3(upperTopPoints3ld[1][0] - 1, upperTopPoints3ld[1][1] + 1),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(upperTopPoints3ld[1][0] + 1, upperTopPoints3ld[1][1] + 1),
            new THREE.Vector3(upperTopPoints3ld[1][0] - 1, upperTopPoints3ld[1][1] + 1),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(upperTopPoints3ld[1][0] + 1, upperTopPoints3ld[1][1] + 1),
                new THREE.Vector3(upperTopPoints3ld[1][0] - 1, upperTopPoints3ld[1][1] + 1),
            ]
        });
        this.redLines.push(
            new THREE.Vector3(...upperTopPoints3ld[1]),
            new THREE.Vector3(upperTopPoints3ld[1][0] + 1, upperTopPoints3ld[1][1] + 1),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(...upperTopPoints3ld[1]),
                new THREE.Vector3(upperTopPoints3ld[1][0] + 1, upperTopPoints3ld[1][1] + 1),
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
        const [x, y] = origin;
        const [X, Y] = [x + (size / 2), y + (size / 2)];
        const smallboxsize = gap;
        const radius = (size - 3) / 2;
        let upperTopPoints = [];
        let upperTopPoints3ld = [];
        let upperendpoints3ld = [];
        let upperendpoint = [];
        this.connectionPoints.push(
            new THREE.Vector2(X + 5, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X + 5 - gap, Y + (radius / 2) + smallboxsize),
            new THREE.Vector2(X + 5 + gap, Y + (radius / 2) + smallboxsize),
        );

        upperTopPoints = [
            [X + 5, Y + (radius / 2) + (smallboxsize / 2)],
            [X + 5, Y + (radius / 2) + (smallboxsize / 2) + 10],
        ];
        upperTopPoints3ld = [
            [X + 5 - gap, Y + (radius / 2) + (smallboxsize / 2)],
            [X + 5 - gap, Y + (radius / 2) + (smallboxsize / 2) + 10],
        ];
        upperendpoints3ld = [
            [X + 5 - gap, Y - (radius / 2) - (smallboxsize / 2)],
            [X + 5 + gap, Y + (radius / 2) + smallboxsize + 8],
        ];
        upperendpoint = [X + 5, Y - (radius / 2) - (smallboxsize / 2)];
        // lines between small squares
        this.whiteLines.push(...getThreeRectangle1({ width: size + 10, height: size, origin }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: size + 10, height: size, origin }));
        // lines between small squares
        this.whiteLines.push(
            new THREE.Vector3(X + 5, Y - (radius / 2) + (smallboxsize / 2) + 1),
            new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5, Y - (radius / 2) + (smallboxsize / 2) + 1),
                new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
            new THREE.Vector3(X + 5 - smallboxsize, Y + (radius / 2) - (smallboxsize / 2) - 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
                new THREE.Vector3(X + 5 - smallboxsize, Y + (radius / 2) - (smallboxsize / 2) - 1),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
            new THREE.Vector3(X + 1 + 5, Y + (smallboxsize / 2) + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
                new THREE.Vector3(X + 1 + 5, Y + (smallboxsize / 2) + 1),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
            new THREE.Vector3(X - 1 + 5, Y + (smallboxsize / 2) + 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5, Y + (radius / 2) - (smallboxsize / 2) - 1),
                new THREE.Vector3(X - 1 + 5, Y + (smallboxsize / 2) + 1),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
            new THREE.Vector3(X + 5 - smallboxsize - 1, Y - (smallboxsize / 2) - 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
                new THREE.Vector3(X + 5 - smallboxsize - 1, Y - (smallboxsize / 2) - 1),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
            new THREE.Vector3(X + 5 - smallboxsize + 1, Y - (smallboxsize / 2) - 1),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - smallboxsize, Y - (radius / 2) + (smallboxsize / 2) + 1),
                new THREE.Vector3(X + 5 - smallboxsize + 1, Y - (smallboxsize / 2) - 1),
            ]
        });

        // circle thing

        this.whiteCircles.push({
            position: new THREE.Vector3(X + 5, Y),
            radius,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X + 5, Y], radius, startAngle: 0, endAngle: 2 * Math.PI,
        }));

        // big square at left side of circle

        this.texts.push({
            position: new THREE.Vector3(X + 5 - radius + 3, y + 15),
            text: 'L',
            size: 5,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, 'L', [X + 5 - radius + 3, y + 15], 3));
        this.whiteLines.push(
            new THREE.Vector3(X + 5 - radius + 0.5, Y - 3),
            new THREE.Vector3(X + 5 - radius + 6, Y - 3),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - radius + 0.5, Y - 3),
                new THREE.Vector3(X + 5 - radius + 6, Y - 3),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X + 5 - radius + 6, Y - 3),
            new THREE.Vector3(X + 5 - radius + 6, Y - 3 + 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - radius + 6, Y - 3),
                new THREE.Vector3(X + 5 - radius + 6, Y - 3 + 6),
            ]
        });
        this.whiteLines.push(
            new THREE.Vector3(X + 5 - radius + 6, Y - 3 + 6),
            new THREE.Vector3(X + 5 - radius + 0.5, Y - 3 + 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 5 - radius + 6, Y - 3 + 6),
                new THREE.Vector3(X + 5 - radius + 0.5, Y - 3 + 6),
            ]
        });
        // this.whiteLines.push(...getThreeRectangle1({ width: 6, height: 6, origin: [X - radius, Y - 3] }));
        // small squares
        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (smallboxsize / 2) + 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (smallboxsize / 2) + 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (smallboxsize / 2) + 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (smallboxsize / 2) + 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (3 * (smallboxsize / 2)) - 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (3 * (smallboxsize / 2)) - 0.5, Y + (radius / 2) - (smallboxsize / 2)] }));

        this.whiteLines.push(...getThreeRectangle1({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (3 * (smallboxsize / 2)) - 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: smallboxsize, height: smallboxsize, origin: [X + 5 - (3 * (smallboxsize / 2)) - 0.5, Y - (radius / 2) - (smallboxsize / 2)] }));

        return {
            upperTopPoints, upperTopPoints3ld, upperendpoint, upperendpoints3ld,
        };
    }

    getLower(origin, sizes) {
        const [x, y] = origin;
        const [w, h] = sizes;
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
        this.whiteLines.push(...getThreeRectangle1({ width: w + 10, height: h, origin }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: w + 10, height: h, origin }));
        // neutral and ground connection boxes

        // neutral connection box
        this.whiteLines.push(...getThreeRectangle1({ width: 8, height: 1, origin: [x + 6, y + 6] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 8, height: 1, origin: [x + 6, y + 6] }));

        // Ground connection Box
        this.whiteLines.push(...getThreeRectangle1({ width: 8, height: 1, origin: [x + 18, y + 6] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 8, height: 1, origin: [x + 18, y + 6] }));

        this.whiteLines.push(
            new THREE.Vector3(x + 14, y + 6.5),
            new THREE.Vector3(x + 18, y + 6.5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x + 14, y + 6.5),
                new THREE.Vector3(x + 18, y + 6.5),
            ]
        });
        const textShiftFactorDxf = 10;
        const info = `(${placeHolder}) XX A MAIN\nSERVICE PANEL\nWITH (${placeHolder}) XX A\nMAIN BREAKER\n(CENTER FED)`;
        const info2 = `(N) ${placeHolder3} A PV BREAKER`;
        const info3 = `${placeHolder3} A`;
        const info4 = `${placeHolder2} A`;

        this.texts.push({
            position: new THREE.Vector3(x + (w * 2) + textShiftFactorDxf, y + 40),
            text: `(${placeHolder}) XX A MAIN`,
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x + (w * 2) + textShiftFactorDxf, y + 40 - 5),
            text: 'SERVICE PANEL',
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x + (w * 2) + textShiftFactorDxf, y + 40 - 10),
            text: `WITH (${placeHolder}) XX A`,
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x + (w * 2) + textShiftFactorDxf, y + 40 - 15),
            text: 'MAIN BREAKER',
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x + (w * 2) + textShiftFactorDxf, y + 40 - 20),
            text: '(CENTER FED)',
            size: 5,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info, [x + (w * 2), y + 40], 2));

        this.texts.push({
            position: new THREE.Vector3(x - w - 15, y + h - 10),
            text: `(N) ${placeHolder3} A PV BREAKER`,
            size: 5,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info2, [x - w + 5, y + h - 10], 2));

        this.texts.push({
            position: new THREE.Vector3(X - (w / 4), Y - (h / 6) + 4),
            text: info3,
            size: 2,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info3, [X - (w / 4) - 1, Y - (h / 6) + 4], 1));

        this.texts.push({
            position: new THREE.Vector3(X + 9, y + (h / 2) + 12),
            text: info4,
            size: 2,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, info4, [X + 9 - 1, y + (h / 2) + 12], 1));

        this.whiteLines.push(
            new THREE.Vector3(x - 4, y + h - 10),
            new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6) + 0.50),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x - 4, y + h - 10),
                new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6) + 0.50),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(x - 4, y + h - 10),
            new THREE.Vector3(x - 9, y + h - 10),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x - 4, y + h - 10),
                new THREE.Vector3(x - 9, y + h - 10),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(x + w + 10, y + 40),
            new THREE.Vector3(x + w + 16, y + 40),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x + w + 10, y + 40),
                new THREE.Vector3(x + w + 16, y + 40),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(x + w + 10, y + 40),
            new THREE.Vector3(X + 10, y + (h / 2) + 8 - 0.5),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(x + w + 10, y + 40),
                new THREE.Vector3(X + 10, y + (h / 2) + 8 - 0.5),
            ]
        });

        // start Points
        this.startPoints = [{
            red: [x, Y - (h / 6) + gap],
            white: [x - 4, Y - (h / 6)],
            blue: [x - 18, y + (h / 6) + 4],
            green: [x - 22, y + (h / 6)],
        }];

        this.whiteLines.push(
            new THREE.Vector3(X, y + (5 * (h / 6)) + 4),
            new THREE.Vector3(X, y + 16),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + (5 * (h / 6)) + 4),
                new THREE.Vector3(X, y + 16),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) + 4),
            new THREE.Vector3(X - gap, y + 16),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) + 4),
                new THREE.Vector3(X - gap, y + 16),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap, y + (5 * (h / 6)) + 4),
            new THREE.Vector3(X + gap, y + 12),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap, y + (5 * (h / 6)) + 4),
                new THREE.Vector3(X + gap, y + 12),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 10, y),
            new THREE.Vector3(x + 10, y - 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 10, y),
                new THREE.Vector3(x + 10, y - 2),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 10, y - 2),
            new THREE.Vector3(x - 18, y - 2),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 10, y - 2),
                new THREE.Vector3(x - 18, y - 2),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x - 18, y - 2),
            new THREE.Vector3(x - 18, y + (h / 6) + 4),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x - 18, y - 2),
                new THREE.Vector3(x - 18, y + (h / 6) + 4),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(lowerendpoint[0] + 5, lowerendpoint[1] + 3),
            new THREE.Vector3(X + 16, lowerendpoint[1] + 3),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(lowerendpoint[0] + 5, lowerendpoint[1] + 3),
                new THREE.Vector3(X + 16, lowerendpoint[1] + 3),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(lowerendpoints3ld[0][0] + 5, lowerendpoints3ld[0][1] + 2),
            new THREE.Vector3(X - gap + 16, lowerendpoints3ld[0][1] + 2),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(lowerendpoints3ld[0][0] + 5, lowerendpoints3ld[0][1] + 2),
                new THREE.Vector3(X - gap + 16, lowerendpoints3ld[0][1] + 2),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(lowerendpoints3ld[1][0] + 5, lowerendpoints3ld[1][1] + 4),
            new THREE.Vector3(X + gap + 16, lowerendpoints3ld[1][1] + 4),
        );
        this.bluePolyLines.push({
            points:[
                    new THREE.Vector3(lowerendpoints3ld[1][0] + 5, lowerendpoints3ld[1][1] + 4),
                    new THREE.Vector3(X + gap + 16, lowerendpoints3ld[1][1] + 4),
                ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X + 16, y + (5 * (h / 6)) + 9),
            new THREE.Vector3(X + 16, y + (h / 2) + 8),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 16, y + (5 * (h / 6)) + 9),
                new THREE.Vector3(X + 16, y + (h / 2) + 8),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - gap + 16, y + (5 * (h / 6)) + 6),
            new THREE.Vector3(X - gap + 16, y + (h / 2) + 11),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap + 16, y + (5 * (h / 6)) + 6),
                new THREE.Vector3(X - gap + 16, y + (h / 2) + 11),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap + 16, y + (5 * (h / 6)) + 12),
            new THREE.Vector3(X + gap + 16, y + (h / 2) + 5),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap + 16, y + (5 * (h / 6)) + 12),
                new THREE.Vector3(X + gap + 16, y + (h / 2) + 5),
            ]
        });

        this.whiteCircles.push({
            position: new THREE.Vector3(X + 8, y + (h / 2) + 8 + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X + 8, y + (h / 2) + 8 + 0.66],
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X + 8 + 2, y + (h / 2) + 8),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X + 8 + 2, y + (h / 2) + 8],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X + 8 - 2, y + (h / 2) + 8),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X + 8 - 2, y + (h / 2) + 8],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteLines.push(
            new THREE.Vector3(X + 16, y + (h / 2) + 8),
            new THREE.Vector3(X + 10 + 0.33, y + (h / 2) + 8),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 16, y + (h / 2) + 8),
                new THREE.Vector3(X + 10 + 0.33, y + (h / 2) + 8),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X + 6 - 0.33, y + (h / 2) + 8),
            new THREE.Vector3(X, y + (h / 2) + 8),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X + 6 - 0.33, y + (h / 2) + 8),
                new THREE.Vector3(X, y + (h / 2) + 8),
            ]
        });

        this.redCircles.push({
            position: new THREE.Vector3(X + 8, y + (h / 2) + 11 + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X + 8, y + (h / 2) + 11 + 0.66],
                radius: 2,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X + 8 - 2, y + (h / 2) + 11),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X + 8 - 2, y + (h / 2) + 11],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X + 8 + 2, y + (h / 2) + 11),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X + 8 + 2, y + (h / 2) + 11],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redLines.push(
            new THREE.Vector3(X - gap + 16, y + (h / 2) + 11),
            new THREE.Vector3(X + 10 + 0.33, y + (h / 2) + 11),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap + 16, y + (h / 2) + 11),
                new THREE.Vector3(X + 10 + 0.33, y + (h / 2) + 11),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X + 6 - 0.33, y + (h / 2) + 11),
            new THREE.Vector3(X - gap, y + (h / 2) + 11),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X + 6 - 0.33, y + (h / 2) + 11),
                new THREE.Vector3(X - gap, y + (h / 2) + 11),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap + 16, y + (h / 2) + 5),
            new THREE.Vector3(X + gap, y + (h / 2) + 5),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap + 16, y + (h / 2) + 5),
                new THREE.Vector3(X + gap, y + (h / 2) + 5),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(X + gap, y + 12),
            new THREE.Vector3(x + 10, y + 12),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(X + gap, y + 12),
                new THREE.Vector3(x + 10, y + 12),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 10, y + 12),
            new THREE.Vector3(x + 10, y + 7),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 10, y + 12),
                new THREE.Vector3(x + 10, y + 7),
            ]
        });

        this.blueLines.push(
            new THREE.Vector3(x + 10, y + 6),
            new THREE.Vector3(x + 10, y),
        );
        this.bluePolyLines.push({
            points:[
                new THREE.Vector3(x + 10, y + 6),
                new THREE.Vector3(x + 10, y),
            ]
        });

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, y + (5 * (h / 6)) + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1, y + (5 * (h / 6)) + 0.66],
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, y + (5 * (h / 6))),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 - 2, y + (5 * (h / 6))],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, y + (5 * (h / 6))),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 + 2, y + (5 * (h / 6))],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));
        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) + 1 + 0.33, y + (5 * (h / 6))),
            new THREE.Vector3(X, y + (5 * (h / 6))),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1 + 0.33, y + (5 * (h / 6))),
                new THREE.Vector3(X, y + (5 * (h / 6))),
            ]
        });

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, y + (5 * (h / 6)) + 0.66 + gap),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1, y + (5 * (h / 6)) + gap + 0.66],
                radius: 2,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, y + (5 * (h / 6)) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 - 2, y + (5 * (h / 6)) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, y + (5 * (h / 6)) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 + 2, y + (5 * (h / 6)) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1 + 0.33, y + (5 * (h / 6)) + gap),
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1 + 0.33, y + (5 * (h / 6)) + gap),
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) + gap),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6)),
            new THREE.Vector3(x - 4, Y - (h / 6)),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6)),
                new THREE.Vector3(x - 4, Y - (h / 6)),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6) + gap),
            new THREE.Vector3(x, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) - 3 - 0.33, Y - (h / 6) + gap),
                new THREE.Vector3(x, Y - (h / 6) + gap),
            ]
        });

        this.sldObjectsGroup.add(getDashedLine(
            [x - 22, y + (h / 6)],
            [x - 22, y - 14],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x - 22, y - 4),
            new THREE.Vector3(x + 22, y - 4),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x - 22, y - 4),
                new THREE.Vector3(x + 22, y - 4),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x - 22, y - 4],
            [x + 22, y - 4],
            'green',
        ));

        this.dashedLines.push(
            new THREE.Vector3(x + 22, y - 4),
            new THREE.Vector3(x + 22, y + 6),
        );
        this.dashedPolyLines.push({
            points:[
                new THREE.Vector3(x + 22, y - 4),
                new THREE.Vector3(x + 22, y + 6),
            ]
        });
        this.sldObjectsGroup.add(getDashedLine(
            [x + 22, y - 4],
            [x + 22, y + 6],
            'green',
        ));

        this.whiteLines.push(...getThreeRectangle1({ width: 6, height: 1, origin: [x - 25, y - 10] }));
        this.whitePolyLines.push(getThreeRectangle1PolyLines({ width: 6, height: 1, origin: [x - 25, y - 10] }));
        this.greenLines.push(...getThreeRectangle1({ width: 5, height: 0.5, origin: [x - 24.5, y - 14.5] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 5, height: 0.5, origin: [x - 24.5, y - 14.5] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 5, height: 0.5, origin: [x - 24.5, y - 14.5] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 4, height: 0.5, origin: [x - 24, y - 15] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 4, height: 0.5, origin: [x - 24, y - 15] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 4, height: 0.5, origin: [x - 24, y - 15] }, 'green'));

        this.greenLines.push(...getThreeRectangle1({ width: 3, height: 0.5, origin: [x - 23.5, y - 15.5] }));
        this.greenPolyLines.push(getThreeRectangle1PolyLines({ width: 3, height: 0.5, origin: [x - 23.5, y - 15.5] }));
        this.sldObjectsGroup.add(getThreeRectangle({ width: 3, height: 0.5, origin: [x - 23.5, y - 15.5] }, 'green'));

        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 28),
            text: '   EXISTING',
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 28 - 5),
            text: 'GROUNDING',
            size: 5,
        });
        this.texts.push({
            position: new THREE.Vector3(x - 22, y - 28 - 10),
            text: '    SYSTEM',
            size: 5,
        });
        this.sldObjectsGroup.add(createTextElement(this.font, '   EXISTING\nGROUNDING\n    SYSTEM', [x - 22, y - 28], 4));

        // white curves
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, Y + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1, Y + 0.66],
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, Y + (h / 6) + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1, Y + (h / 6) + 0.66],
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, Y - (h / 6) + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1, Y - (h / 6) + 0.66],
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        }));

        // white connection Points at right of curve
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 + 2, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 + 2, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 + 2, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        // white connection points at left of curve
        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, Y),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 - 2, Y],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, Y + (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 - 2, Y + (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, Y - (h / 6)),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.sldObjectsGroup.add(getThreeArc({
            origin: [X - (w / 4) - 1 - 2, Y - (h / 6)],
            radius: 0.33,
            startAngle: 0,
            endAngle: 2 * Math.PI,
        }));

        this.whiteLines.push(
            new THREE.Vector3(X, y + 5 * h / 6 - 2 - 0.33),
            new THREE.Vector3(X, Y - h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X, y + 5 * h / 6 - 2 - 0.33),
                new THREE.Vector3(X, Y - h / 6),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 + 0.33, Y),
            new THREE.Vector3(X, Y),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 + 0.33, Y),
                new THREE.Vector3(X, Y),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 + 0.33, Y + h / 6),
            new THREE.Vector3(X, Y + h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 + 0.33, Y + h / 6),
                new THREE.Vector3(X, Y + h / 6),
            ]
        });

        this.whiteLines.push(
            new THREE.Vector3(X - w / 4 + 1 + 0.33, Y - h / 6),
            new THREE.Vector3(X, Y - h / 6),
        );
        this.whitePolyLines.push({
            points:[
                new THREE.Vector3(X - w / 4 + 1 + 0.33, Y - h / 6),
                new THREE.Vector3(X, Y - h / 6),
            ]
        });

        // red curves
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, Y + gap + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1, Y + gap + 0.66],
                radius: 2,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - w / 4 - 1, Y + h / 6 + gap + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1, Y + (h / 6) + gap + 0.66],
                radius: 2,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1, Y - (h / 6) + gap + 0.66),
            radius: 2,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1, Y - (h / 6) + gap + 0.66],
                radius: 2,
                startAngle: Math.PI,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        // connection points on right of curve
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 + 2, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - w / 4 - 1 + 2, Y + h / 6 + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 + 2, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 + 2, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 + 2, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));


        // connection points on left of curve
        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, Y + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 - 2, Y + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - w / 4 - 1 - 2, Y + h / 6 + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 - 2, Y + (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redCircles.push({
            position: new THREE.Vector3(X - (w / 4) - 1 - 2, Y - (h / 6) + gap),
            radius: 0.33,
            startAngle: 2 * Math.PI,
            endAngle: 0,
        });
        this.s3ldObjectsGroup.add(getThreeArc(
            {
                origin: [X - (w / 4) - 1 - 2, Y - (h / 6) + gap],
                radius: 0.33,
                startAngle: 0,
                endAngle: 2 * Math.PI,
            },
            'red',
        ));

        this.redLines.push(
            new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 2 - 0.33),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - gap, y + (5 * (h / 6)) - 2 - 0.33),
                new THREE.Vector3(X - gap, Y - (h / 6) + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y + gap),
            new THREE.Vector3(X - gap, Y + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y + gap),
                new THREE.Vector3(X - gap, Y + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y + (h / 6) + gap),
            new THREE.Vector3(X - gap, Y + (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y + (h / 6) + gap),
                new THREE.Vector3(X - gap, Y + (h / 6) + gap),
            ]
        });

        this.redLines.push(
            new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y - (h / 6) + gap),
            new THREE.Vector3(X - gap, Y - (h / 6) + gap),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(X - (w / 4) + 1 + 0.33, Y - (h / 6) + gap),
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

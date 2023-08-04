/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import * as utils from './utils';
import { stringInverterDimensions } from './sldConstants';

export default class StringInverterPanel {
    constructor(
        origin,
        optimizer = false,
        defaultWidth = stringInverterDimensions.defaultWidth,
        defaultHeight = stringInverterDimensions.defaultHeight,
    ) {
        const gap = defaultHeight / 10;
        const smallOffset = defaultWidth / 20;
        const smallboxdims = { x: defaultWidth / 40, y: defaultHeight / 60 };

        const [x, Y] = origin;
        const y = Y + smallOffset;
        const leftWireOffset = x + (defaultWidth / 3) + smallOffset;
        const rightWireOffset = x + ((2 * (defaultWidth / 3)) - smallOffset);

        this.objectsGroup = new THREE.Group();
        this.exclusivesld = new THREE.Group();
        this.exclusive3ld = new THREE.Group();

        this.whiteLines = [];
        this.whitesld = [];
        this.white3ld = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.whitePolyLines = [];
        this.redPolyLines = [];
        this.bluePolyLines = [];
        this.purplePolyLines = [];
        this.blueMicroPolyLines = [];
        this.dashedPolyLines = [];
        this.greenCircles3ld = [];
        this.bluePolyLines = [];
        this.greenLines = [];
        this.whiteEllipse = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.texts = [];
        this.dashedLines = [];

        if (optimizer) {
            const size = defaultWidth / 3;
            this.whiteLines.push(...utils.getThreeBox(
                size,
                size,
                new THREE.Vector2(x + (size), y),
            ));
            this.whitePolyLines.push(utils.getThreeBoxPolyLine(
                size,
                size,
                new THREE.Vector2(x + (size), y),
            ));

            this.whiteLines.push(
                new THREE.Vector3(x + (size), y),
                new THREE.Vector3(x + (2 * (size)), y + (size)),
            );
            this.whitePolyLines.push({
                points: [
                    new THREE.Vector3(x + (size), y),
                    new THREE.Vector3(x + (2 * (size)), y + (size)),
                ]
            });

            // smallbox
            this.whitesld.push(...utils.getThreeBoxCentered(
                smallboxdims.x,
                smallboxdims.y,
                { x: x + (defaultWidth / 2), y: y - smallOffset },
            ));
            this.whitePolySld.push(utils.getThreeBoxCenteredPolyLine(
                smallboxdims.x,
                smallboxdims.y,
                { x: x + (defaultWidth / 2), y: y - smallOffset },
            ));
            this.whitesld.push(...utils.getVectorPair(
                [
                    x + ((defaultWidth / 2) - (smallboxdims.x / 2)),
                    y - smallOffset,
                ],
                [
                    x + ((defaultWidth / 2) + (smallboxdims.x / 2)),
                    y - smallOffset,
                ],
            ));

            this.whitePolySld.push(utils.getPolyLineVectorPair(
                [
                    x + ((defaultWidth / 2) - (smallboxdims.x / 2)),
                    y - smallOffset,
                ],
                [
                    x + ((defaultWidth / 2) + (smallboxdims.x / 2)),
                    y - smallOffset,
                ],
            ));

            const lineSymbol1 = {
                x: x + (5 * (size / 4)),
                y: y + (3 * (size / 4)),
                sizeX: (size / 4) * 0.8,
                sizeY: (size / 8) * 0.8,
            };

            this.whiteLines.push(...utils.getVectorPair(
                [lineSymbol1.x - (lineSymbol1.sizeX / 2), lineSymbol1.y + (lineSymbol1.sizeY / 2)],
                [lineSymbol1.x + (lineSymbol1.sizeX / 2), lineSymbol1.y + (lineSymbol1.sizeY / 2)],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [lineSymbol1.x - (lineSymbol1.sizeX / 2), lineSymbol1.y + (lineSymbol1.sizeY / 2)],
                [lineSymbol1.x + (lineSymbol1.sizeX / 2), lineSymbol1.y + (lineSymbol1.sizeY / 2)],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [lineSymbol1.x - (lineSymbol1.sizeX / 2), lineSymbol1.y - (lineSymbol1.sizeY / 2)],
                [lineSymbol1.x + (lineSymbol1.sizeX / 2), lineSymbol1.y - (lineSymbol1.sizeY / 2)],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [lineSymbol1.x - (lineSymbol1.sizeX / 2), lineSymbol1.y - (lineSymbol1.sizeY / 2)],
                [lineSymbol1.x + (lineSymbol1.sizeX / 2), lineSymbol1.y - (lineSymbol1.sizeY / 2)],
            ));

            const lineSymbol2 = {
                x: x + (7 * (size / 4)),
                y: y + (size / 4),
                sizeX: (size / 4) * 0.8,
                sizeY: (size / 8) * 0.8,
            };

            this.whiteLines.push(...utils.getVectorPair(
                [lineSymbol2.x - (lineSymbol2.sizeX / 2), lineSymbol2.y + (lineSymbol2.sizeY / 2)],
                [lineSymbol2.x + (lineSymbol2.sizeX / 2), lineSymbol2.y + (lineSymbol2.sizeY / 2)],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [lineSymbol2.x - (lineSymbol2.sizeX / 2), lineSymbol2.y + (lineSymbol2.sizeY / 2)],
                [lineSymbol2.x + (lineSymbol2.sizeX / 2), lineSymbol2.y + (lineSymbol2.sizeY / 2)],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [lineSymbol2.x - (lineSymbol2.sizeX / 2), lineSymbol2.y - (lineSymbol2.sizeY / 2)],
                [lineSymbol2.x + (lineSymbol2.sizeX / 2), lineSymbol2.y - (lineSymbol2.sizeY / 2)],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [lineSymbol2.x - (lineSymbol2.sizeX / 2), lineSymbol2.y - (lineSymbol2.sizeY / 2)],
                [lineSymbol2.x + (lineSymbol2.sizeX / 2), lineSymbol2.y - (lineSymbol2.sizeY / 2)],
            ));
        }
        else {
            this.white3ld.push(
                new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3)),
                new THREE.Vector3(leftWireOffset, y),
            );

            this.whitePoly3ld.push({
                points: [
                    new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3)),
                    new THREE.Vector3(leftWireOffset, y),
                ]
            });

            this.redLines.push(
                new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3)),
                new THREE.Vector3(rightWireOffset, y),
            );
            this.redPolyLines.push({
                points:[
                    new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3)),
                    new THREE.Vector3(rightWireOffset, y),
                ]
            });

            this.whitesld.push(
                new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3)),
                new THREE.Vector3(x + (defaultWidth / 2), y),
            );
            this.whitePolySld.push({
                points:[
                    new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3)),
                    new THREE.Vector3(x + (defaultWidth / 2), y),
                ]
            });
            this.whitesld.push(
                new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset - 0.5),
                new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset + 0.5),
            );
            this.whitePolySld.push({
                points:[
                    new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset - 0.5),
                    new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset + 0.5),    
                ]
            });
        }

        this.whiteLines.push(...utils.getThreeBox(
            defaultWidth,
            (2 * (defaultHeight / 3)) - gap,
            new THREE.Vector2(x, y + (defaultWidth / 3) + gap),
        ));

        this.whitePolyLines.push(utils.getThreeBoxPolyLine(
            defaultWidth,
            (2 * (defaultHeight / 3)) - gap,
            new THREE.Vector2(x, y + (defaultWidth / 3) + gap),
        ));

        this.white3ld.push(
            new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3)),
            new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3) + gap),
        );
        this.whitePoly3ld.push({
            points:[
                new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3)),
                new THREE.Vector3(leftWireOffset, y + (defaultWidth / 3) + gap),    
            ]
        });

        this.white3ld.push(...utils.getMinusSign(
            {
                x: x + (defaultWidth / 4),
                y: y + (defaultWidth / 3) + (gap / 2),
            },
            defaultWidth / 12,
        ));
        this.whitePoly3ld.push(utils.getMinusSignPolyLine(
            {
                x: x + (defaultWidth / 4),
                y: y + (defaultWidth / 3) + (gap / 2),
            },
            defaultWidth / 12,
        ));

        this.redLines.push(
            new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3)),
            new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3) + gap),
        );
        this.redPolyLines.push({
            points: [
                new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3)),
                new THREE.Vector3(rightWireOffset, y + (defaultWidth / 3) + gap),
            ]
        });

        this.redLines.push(...utils.getPlusSign(
            {
                x: x + (3 * (defaultWidth / 4)),
                y: y + (defaultWidth / 3) + (gap / 2),
            },
            defaultWidth / 12,
        ));
        this.redPolyLines.push(utils.getPlusSignPolyLine(
            {
                x: x + (3 * (defaultWidth / 4)),
                y: y + (defaultWidth / 3) + (gap / 2),
            },
            defaultWidth / 12,
        ));

        this.whitesld.push(
            new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + 3.5),
            new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + gap),
        );
        this.whitePolySld.push({
            points: [
                new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + 3.5),
                new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + gap),
            ]
        });
        this.whitesld.push(
            new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + 2.5),
            new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3)),
        );
        this.whitePolySld.push({
            points:[
                new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3) + 2.5),
                new THREE.Vector3(x + (defaultWidth / 2), y + (defaultWidth / 3)),
            ]
        });

        // smallbox
        this.whitesld.push(...utils.getThreeBoxCentered(
            smallboxdims.x,
            smallboxdims.y,
            { x: x + (defaultWidth / 2), y: y + (defaultWidth / 3) + (gap / 2) },
        ));
        this.whitePolySld.push(utils.getThreeBoxCenteredPolyLine(
            smallboxdims.x,
            smallboxdims.y,
            { x: x + (defaultWidth / 2), y: y + (defaultWidth / 3) + (gap / 2) },
        ));
        this.whitesld.push(...utils.getVectorPair(
            [
                x + ((defaultWidth / 2) - (smallboxdims.x / 2)),
                y + (defaultWidth / 3) + (gap / 2),
            ],
            [
                x + ((defaultWidth / 2) + (smallboxdims.x / 2)),
                y + (defaultWidth / 3) + (gap / 2),
            ],
        ));
        this.whitePolySld.push(utils.getPolyLineVectorPair(
            [
                x + ((defaultWidth / 2) - (smallboxdims.x / 2)),
                y + (defaultWidth / 3) + (gap / 2),
            ],
            [
                x + ((defaultWidth / 2) + (smallboxdims.x / 2)),
                y + (defaultWidth / 3) + (gap / 2),
            ],
        ));

        this.white3ld.push(
            new THREE.Vector3(leftWireOffset, y),
            new THREE.Vector3(leftWireOffset, y - smallOffset),
        );
        this.whitePoly3ld.push({
            points:[
                new THREE.Vector3(leftWireOffset, y),
                new THREE.Vector3(leftWireOffset, y - smallOffset),
            ]
        });

        this.white3ld.push(...utils.getMinusSign(
            {
                x: x + (defaultWidth / 4),
                y,
            },
            defaultWidth / 12,
        ));
        this.whitePoly3ld.push(utils.getMinusSignPolyLine(
            {
                x: x + (defaultWidth / 4),
                y,
            },
            defaultWidth / 12,
        ));

        this.redLines.push(
            new THREE.Vector3(rightWireOffset, y),
            new THREE.Vector3(rightWireOffset, y - smallOffset),
        );
        this.redPolyLines.push({
            points:[
                new THREE.Vector3(rightWireOffset, y),
                new THREE.Vector3(rightWireOffset, y - smallOffset),
            ]
        });

        this.redLines.push(...utils.getPlusSign(
            {
                x: x + (3 * (defaultWidth / 4)),
                y,
            },
            defaultWidth / 12,
        ));
        this.redPolyLines.push(utils.getPlusSignPolyLine(
            {
                x: x + (3 * (defaultWidth / 4)),
                y,
            },
            defaultWidth / 12,
        ));

        this.whitesld.push(
            new THREE.Vector3(x + (defaultWidth / 2), y),
            new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset + 0.5),
        );
        this.whitePolySld.push({
            points:[
                new THREE.Vector3(x + (defaultWidth / 2), y),
                new THREE.Vector3(x + (defaultWidth / 2), y - smallOffset + 0.5),
            ]
        });
        this.connectionPoints = [
            new THREE.Vector2(leftWireOffset, y - smallOffset),
            new THREE.Vector2(rightWireOffset, y - smallOffset),
            new THREE.Vector2(x + (defaultWidth / 2), y - smallOffset),
        ];

        this.greenStart = new THREE.Vector2(x, y + (defaultWidth / 3) + gap + smallOffset);
        this.greenEnd = new THREE.Vector2(
            x + defaultWidth,
            y + (defaultWidth / 3) + gap + smallOffset,
        );
    }
}

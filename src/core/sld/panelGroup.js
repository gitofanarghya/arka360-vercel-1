/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import * as utils from './utils';
import * as sldConstants from './sldConstants';
import MicroInverterPanel from './MicroInverterPanel';
import StringInverterPanel from './StringInverterPanel';
import { createTextElement, uncentredTextElement } from './sldUtils';

export default class PanelGroup {
    constructor(type, sizing, center, font, optimizer = false, isLast = false, wireSize) {
        this.objectsGroup = new THREE.Group();
        this.wireSize = wireSize;
        this.sizing = sizing;
        this.isLast = isLast;
        this.whiteLines = [];
        this.whitePolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.redPolyLines = [];
        this.greenCircles3ld = [];
        this.bluePolyLines = [];
        this.whitesld = [];
        this.white3ld = [];
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
        this.texts3LD = [];
        this.textsSLD = [];
        this.texts = [];
        this.dashedLines = [];

        const [X, Y] = center;

        if (type === 'micro') {
            this.getMicroInverterPanels([X, Y], font);
        }
        else if (type === 'string') {
            this.exclusivesld = new THREE.Group();
            this.exclusive3ld = new THREE.Group();

            this.optimizer = optimizer;
            this.getStringInverterPanels(center, font);
        }
        else {
            console.error('Wrong panel type');
        }
    }

    getMicroInverterPanels(origin, font) {
        const [x, y] = origin;
        const {
            gap,
            defaultWidth,
            defaultHeight,
            smallboxsize,
            endConnectsize,
            dotsize,
        } = sldConstants.microInverterDimensions;
        const count = (this.sizing.numberOfModules > 3) ? 3 : this.sizing.numberOfModules;

        let offset = 0;
        let prevGreenpoints;
        for (let i = 0; i < count; i++) {
            if (i === 2 && this.sizing.numberOfModules > 3) {
                this.addDots([
                    x + offset,
                    y + (defaultWidth / 4) + (7 * (defaultHeight / 10)) + (smallboxsize / 2),
                ]);
                offset += dotsize;
            }
            const panel = new MicroInverterPanel([x + offset, y]);
            if (prevGreenpoints === undefined) {
                prevGreenpoints = panel.greenConnectionPoints;
                if (this.isLast) {
                    this.whiteLines.push(...utils.getVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0] - 1,
                            panel.inverterOrigin[1] - 2,
                        ],
                    ));

                    this.whitePolyLines.push(utils.getPolyLineVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0] - 1,
                            panel.inverterOrigin[1] - 2,
                        ],
                    ));
                    this.whiteLines.push(...utils.getVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0] + 1,
                            panel.inverterOrigin[1] - 2,
                        ],
                    ));
                    this.whitePolyLines.push(utils.getPolyLineVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0] + 1,
                            panel.inverterOrigin[1] - 2,
                        ],
                    ));

                    this.whiteLines.push(...utils.getVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0],
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                    ));
                    this.whitePolyLines.push(utils.getPolyLineVectorPair(
                        panel.inverterOrigin,
                        [
                            panel.inverterOrigin[0],
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                    ));
                    this.whiteLines.push(...utils.getVectorPair(
                        [
                            panel.inverterOrigin[0],
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                        [
                            panel.inverterOrigin[0] + (defaultWidth / 6),
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                    ));

                    this.whitePolyLines.push(utils.getPolyLineVectorPair(
                        [
                            panel.inverterOrigin[0],
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                        [
                            panel.inverterOrigin[0] + (defaultWidth / 6),
                            panel.inverterOrigin[1] - (defaultHeight / 2),
                        ],
                    ));

                    const textY = (
                        panel.inverterOrigin[1]
                        - ((defaultHeight + sldConstants.textSize) / 2)
                    );

                    this.texts.push({
                        position: new THREE.Vector3(
                            panel.inverterOrigin[0] + (defaultWidth / 6) + 60,
                            textY + 2,
                        ),
                        text: `${this.wireSize.model.manufacture} ${this.wireSize.model.modelName}`,
                        size: 7,
                    });
                    this.objectsGroup.add(uncentredTextElement(
                        font,
                        `${this.wireSize.model.manufacture} ${this.wireSize.model.modelName}`,
                        [
                            panel.inverterOrigin[0] + (defaultWidth / 6),
                            textY,
                        ],
                    ));
                }
            }
            else {
                this.objectsGroup.add(utils.getDashedLine(
                    prevGreenpoints.right,
                    panel.greenConnectionPoints.left,
                    'green',
                ));
                this.dashedLines.push(...utils.getVectorPair(
                    prevGreenpoints.right,
                    panel.greenConnectionPoints.left,
                ));
                this.dashedPolyLines.push(utils.getPolyLineVectorPair(
                    prevGreenpoints.right,
                    panel.greenConnectionPoints.left,
                ));
                prevGreenpoints = panel.greenConnectionPoints;
            }
            this.objectsGroup.add(panel.objectsGroup);
            utils.addAllrgbwgos(this, panel, true, true);
            offset += defaultWidth + gap;
        }

        const maxOffset = ((defaultHeight + gap) * 4) + dotsize;

        // cap
        this.whiteLines.push(...utils.getThreeBox(
            smallboxsize,
            smallboxsize,
            new THREE.Vector2(x, y),
        ));
        this.whitePolyLines.push(utils.getThreeBoxPolyLine(
            smallboxsize,
            smallboxsize,
            new THREE.Vector2(x, y),
        ));
        this.whiteLines.push(...utils.getVectorPair(
            [x + (smallboxsize / 2), y],
            [x + (smallboxsize / 2), y + smallboxsize],
        ));
        this.whitePolyLines.push(utils.getPolyLineVectorPair(
            [x + (smallboxsize / 2), y],
            [x + (smallboxsize / 2), y + smallboxsize],
        ));
        /* if(!this.isLast) {
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y],
                [x + (smallboxsize / 2), y - defaultHeight],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y - defaultHeight],
                [x + (smallboxsize / 2) + (defaultWidth / 6), y - defaultHeight],
            ));
            this.texts.push({
                position: new THREE.Vector3(
                    x + (smallboxsize / 2) + (defaultWidth / 6),
                    y - defaultHeight - (sldConstants.textSize / 2),
                ),
                text: 'BRANCH TERMINATOR Q-TERM',
            });

            this.texts.push({
                position: new THREE.Vector3(
                    x + (smallboxsize / 2) + (defaultWidth / 6),
                    y - defaultHeight - (sldConstants.textSize / 2) - 5,
                ),
                text: 'FOR IQ SERIES (TYP)',
            });
            this.objectsGroup.add(uncentredTextElement(
                font,
                'BRANCH TERMINATOR Q-TERM \nFOR IQ SERIES (TYP)',
                [
                    x + (smallboxsize / 2) + (defaultWidth / 6),
                    y - defaultHeight - (sldConstants.textSize / 2),
                ],
            ));
        } */
        // Indication for cap
        if (this.isLast) {
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y],
                [x + (smallboxsize / 2) - 1, y - 2],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y],
                [x + (smallboxsize / 2) + 1, y - 2],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2) + 1, y - 2],
                [x + (smallboxsize / 2) - 1, y - 2],
            ));

            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y - 2],
                [x + (smallboxsize / 2), y - defaultHeight],
            ));
            this.whiteLines.push(...utils.getVectorPair(
                [x + (smallboxsize / 2), y - defaultHeight],
                [x + (smallboxsize / 2) + (defaultWidth / 6), y - defaultHeight],
            ));

            




            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + (smallboxsize / 2), y],
                [x + (smallboxsize / 2) - 1, y - 2],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + (smallboxsize / 2), y],
                [x + (smallboxsize / 2) + 1, y - 2],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + (smallboxsize / 2) + 1, y - 2],
                [x + (smallboxsize / 2) - 1, y - 2],
            ));

            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + (smallboxsize / 2), y - 2],
                [x + (smallboxsize / 2), y - defaultHeight],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + (smallboxsize / 2), y - defaultHeight],
                [x + (smallboxsize / 2) + (defaultWidth / 6), y - defaultHeight],
            ));
            this.texts.push({
                position: new THREE.Vector3(
                    x + (smallboxsize / 2) + (defaultWidth / 6) + 80,
                    y - defaultHeight - (sldConstants.textSize / 2) + 2,
                ),
                text: 'BRANCH TERMINATOR Q- TERM FOR IQ SERIES (TYP.)',
                size: 7,
            });
            this.objectsGroup.add(uncentredTextElement(
                font,
                'BRANCH TERMINATOR Q- TERM FOR IQ SERIES (TYP.)', // 'Terminator Cap on last cable connector AC trunk cable (TYP)',
                [
                    x + (smallboxsize / 2) + (defaultWidth / 6),
                    y - defaultHeight - (sldConstants.textSize / 2),
                ],
            ));
        }

        this.whiteLines.push(
            new THREE.Vector3(x + smallboxsize, y + (smallboxsize / 2)),
            new THREE.Vector3(x + (maxOffset - endConnectsize), y + (smallboxsize / 2)),
        );
        this.whitePolyLines.push(utils.getPolyLineVectorPair(
            [x + smallboxsize, y + (smallboxsize / 2)],
            [x + (maxOffset - endConnectsize), y + (smallboxsize / 2)],
        ));

        const [p, q] = prevGreenpoints.right;
        this.objectsGroup.add(utils.getDashedLine(
            [p, q],
            [x + maxOffset + endConnectsize + (defaultWidth / 2), q],
            'green',
        ));
        this.dashedLines.push(...utils.getVectorPair(
            [p, q],
            [x + maxOffset + endConnectsize + (defaultWidth / 2), q],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [p, q],
            [x + maxOffset + endConnectsize + (defaultWidth / 2), q],
        ));

        this.addEndConnect([x + (maxOffset - endConnectsize), y + (smallboxsize / 2)]);
        this.endpoints = [{
            white:
            [x + maxOffset, y - (smallboxsize / 4)],
            red:
            [x + maxOffset, y + smallboxsize],
            green:
            [x + maxOffset + endConnectsize + (defaultWidth / 2), q],
        }];

        // const boundingBox = (new THREE.Box3()).setFromObject(this.objectsGroup);
        // const size = new THREE.Vector3();
        // boundingBox.getSize(size);
        // console.log(size);
    }

    getStringInverterPanels(origin, font) {
        const [x, y] = origin;
        const {
            gap,
            defaultWidth,
            defaultHeight,
            dotsize,
            yOffset,
        } = sldConstants.stringInverterDimensions;
        // yOffset is hack for homogenous sld and 3ld without changing the endpoints completely
        const count = (this.sizing.numberOfModules > 3) ? 3 : this.sizing.numberOfModules;
        const smallrectdims = { x: defaultWidth / 40, y: defaultHeight / 60 };

        let prevEndpoints;
        let firstpoint;
        let firstGreen;
        let prevGreenEnd;
        let offset = 0;
        for (let i = 0; i < count; i++) {
            const panel = new StringInverterPanel([x + offset, y], this.optimizer);
            this.objectsGroup.add(panel.objectsGroup);
            this.exclusive3ld.add(panel.exclusive3ld);
            this.exclusivesld.add(panel.exclusivesld);
            utils.addAllrgbwgos(this, panel, true, true);

            if (prevEndpoints === undefined) {
                [firstpoint] = panel.connectionPoints;
                firstGreen = panel.greenStart;

                const endsld = [panel.connectionPoints[2].x, panel.connectionPoints[2].y];
                const endsldExtended = [
                    panel.connectionPoints[2].x,
                    panel.connectionPoints[2].y - yOffset,
                ];

                this.whitesld.push(...utils.getVectorPair(endsld, endsldExtended));
                this.whitePolySld.push(utils.getPolyLineVectorPair(endsld, endsldExtended));
                // this.exclusivesld.add(utils.getLine(endsld, endsldExtended));
            }
            if (prevEndpoints !== undefined) {
                const start3ld = [prevEndpoints[1].x, prevEndpoints[1].y];
                const end3ld = [panel.connectionPoints[0].x, panel.connectionPoints[0].y];

                const startsldExtended = [prevEndpoints[2].x, prevEndpoints[2].y - yOffset];
                const endsld = [panel.connectionPoints[2].x, panel.connectionPoints[2].y];
                const endsldExtended = [
                    panel.connectionPoints[2].x,
                    panel.connectionPoints[2].y - yOffset,
                ];
                const mid3ld = [
                    (prevEndpoints[1].x + panel.connectionPoints[0].x) / 2,
                    prevEndpoints[1].y,
                ];
                this.white3ld.push(...utils.getThreeBoxCentered(
                    smallrectdims.y,
                    smallrectdims.x,
                    { x: mid3ld[0], y: mid3ld[1] },
                ));
                this.whitePoly3ld.push(utils.getThreeBoxCenteredPolyLine(
                    smallrectdims.y,
                    smallrectdims.x,
                    { x: mid3ld[0], y: mid3ld[1] },
                ));
                this.white3ld.push(...utils.getVectorPair(
                    [mid3ld[0], mid3ld[1] - (smallrectdims.x / 2)],
                    [mid3ld[0], mid3ld[1] + (smallrectdims.x / 2)],
                ));
                this.whitePoly3ld.push(utils.getPolyLineVectorPair(
                    [mid3ld[0], mid3ld[1] - (smallrectdims.x / 2)],
                    [mid3ld[0], mid3ld[1] + (smallrectdims.x / 2)],
                ));

                this.redLines.push(...utils.getVectorPair(start3ld, [mid3ld[0] - 0.5, mid3ld[1]]));
                this.redPolyLines.push(utils.getPolyLineVectorPair(start3ld, [mid3ld[0] - 0.5, mid3ld[1]]));
                this.white3ld.push(...utils.getVectorPair([mid3ld[0] + 0.5, mid3ld[1]], end3ld));
                this.whitePoly3ld.push(utils.getPolyLineVectorPair([mid3ld[0] + 0.5, mid3ld[1]], end3ld));
                // this.exclusive3ld.add(utils.getLine(start3ld, end3ld, 0xff0000));

                this.whitesld.push(...utils.getVectorPair([endsld[0], endsld[1] - 0.5], [endsldExtended[0], endsldExtended[1]]));
                this.whitePolySld.push(utils.getPolyLineVectorPair([endsld[0], endsld[1] - 0.5], [endsldExtended[0], endsldExtended[1]]));
                // this.exclusivesld.add(utils.getLine(endsld, endsldExtended));

                this.whitesld.push(...utils.getVectorPair(startsldExtended, [endsldExtended[0], endsldExtended[1]]));
                this.whitePolySld.push(utils.getPolyLineVectorPair(startsldExtended, [endsldExtended[0], endsldExtended[1]]));
                // this.exclusivesld.add(utils.getLine(startsldExtended, endsldExtended));

                this.objectsGroup.add(utils.getDashedLine(
                    [prevGreenEnd.x, prevGreenEnd.y],
                    [panel.greenStart.x, panel.greenStart.y],
                    'green',
                ));

                this.dashedLines.push(...utils.getVectorPair(
                    [prevGreenEnd.x, prevGreenEnd.y],
                    [panel.greenStart.x, panel.greenStart.y],
                ));
                this.dashedPolyLines.push(utils.getPolyLineVectorPair(
                    [prevGreenEnd.x, prevGreenEnd.y],
                    [panel.greenStart.x, panel.greenStart.y],
                ));
            }
            if (i === 0 && this.sizing.numberOfModules > 3) {
                this.texts.push({
                    position: new THREE.Vector3(
                        x + offset + (defaultWidth / 2),
                        y + (defaultHeight / 2),
                    ),
                    text: `#${this.sizing.numberOfModules}`,
                    size: 7,
                });
                this.objectsGroup.add(createTextElement(
                    font,
                    `#${this.sizing.numberOfModules}`,
                    [x + offset + (defaultWidth / 2), y + (defaultHeight / 2)],
                ));

                this.addDots([x + offset + defaultWidth, y + (defaultHeight / 2)]);
                offset += dotsize;
            }
            else {
                this.texts.push({
                    position: new THREE.Vector3(
                        x + offset + (defaultWidth / 2),
                        y + (defaultHeight / 2),
                    ),
                    text: `#${count - i}`,
                    size: 7,
                });
                this.objectsGroup.add(createTextElement(
                    font,
                    `#${count - i}`,
                    [x + offset + (defaultWidth / 2), y + (defaultHeight / 2)],
                ));
            }

            prevEndpoints = panel.connectionPoints;
            prevGreenEnd = panel.greenEnd;
            offset += gap + defaultWidth;
        }

        const maxOffset = ((gap + defaultWidth) * 3) + dotsize;

        this.objectsGroup.add(utils.getDashedLine(
            [firstGreen.x, firstGreen.y],
            [x - (defaultWidth / 2), firstGreen.y],
            'green',
        ));
        // this.objectsGroup.add(utils.getDashedLine(
        //     [x - (defaultWidth / 2), y + (defaultWidth / 3) + smallOffset],
        //     [x + (offset - (defaultWidth / 2)), y + (defaultWidth / 3) + smallOffset],
        //     'green',
        // ));
        this.objectsGroup.add(utils.getDashedLine(
            [x - (defaultWidth / 2), firstGreen.y],
            [x - (defaultWidth / 2), y - (yOffset * 2)],
            'green',
        ));
        this.objectsGroup.add(utils.getDashedLine(
            [x - (defaultWidth / 2), y - (yOffset * 2)],
            [x + maxOffset + (defaultWidth / 2), y - (yOffset * 2)],
            'green',
        ));

        this.dashedLines.push(...utils.getVectorPair(
            [firstGreen.x, firstGreen.y],
            [x - (defaultWidth / 2), firstGreen.y],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [firstGreen.x, firstGreen.y],
            [x - (defaultWidth / 2), firstGreen.y],
        ));

        // this.dashedLines.push(...utils.getVectorPair(
        //     [x - (defaultWidth / 2), y + (defaultWidth / 3) + smallOffset],
        //     [x + (offset - (defaultWidth / 2)), y + (defaultWidth / 3) + smallOffset],
        // ));

        this.dashedLines.push(...utils.getVectorPair(
            [x - (defaultWidth / 2), firstGreen.y],
            [x - (defaultWidth / 2), y - (yOffset * 2)],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x - (defaultWidth / 2), firstGreen.y],
            [x - (defaultWidth / 2), y - (yOffset * 2)],
        ));

        this.dashedLines.push(...utils.getVectorPair(
            [x - (defaultWidth / 2), y - (yOffset * 2)],
            [x + maxOffset + (defaultWidth / 2), y - (yOffset * 2)],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x - (defaultWidth / 2), y - (yOffset * 2)],
            [x + maxOffset + (defaultWidth / 2), y - (yOffset * 2)],
        ));

        // if (this.sizing.numberOfModules <= 3) {
        //     const lastpointsld = [prevEndpoints[2].x, prevEndpoints[2].y - yOffset];
        //     const lastpoint3ld = [prevEndpoints[1].x, prevEndpoints[1].y];

        //     this.exclusivesld.add(utils.getLine(lastpointsld, [x + maxOffset, y - yOffset]));
        //     this.exclusive3ld.add(utils.getLine(lastpoint3ld, [x + maxOffset, y], 0xff0000));
        // }

        this.endpoints = [{
            red:
            [x + maxOffset + 1.35, y],
            white:
            [x + maxOffset, y - yOffset],
            green:
            [x + maxOffset + (defaultWidth / 2), y - (yOffset * 2)],
        }];

        const lastpoint = prevEndpoints[1];

        this.white3ld.push(...utils.getThreeBoxCentered(
            smallrectdims.y,
            smallrectdims.x,
            {
                x: lastpoint.x + (defaultWidth / 2),
                y: lastpoint.y,
            },
        ));
        this.whitePoly3ld.push(utils.getThreeBoxCenteredPolyLine(
            smallrectdims.y,
            smallrectdims.x,
            {
                x: lastpoint.x + (defaultWidth / 2),
                y: lastpoint.y,
            },
        ));
        this.white3ld.push(...utils.getVectorPair(
            [
                lastpoint.x + (defaultWidth / 2),
                lastpoint.y - (smallrectdims.x / 2),
            ],
            [
                lastpoint.x + (defaultWidth / 2),
                lastpoint.y + (smallrectdims.x / 2),
            ],
        ));
        this.whitePoly3ld.push(utils.getPolyLineVectorPair(
            [
                lastpoint.x + (defaultWidth / 2),
                lastpoint.y - (smallrectdims.x / 2),
            ],
            [
                lastpoint.x + (defaultWidth / 2),
                lastpoint.y + (smallrectdims.x / 2),
            ],
        ));

        this.redLines.push(...utils.getVectorPair(
            [lastpoint.x, lastpoint.y],
            [x + maxOffset + 0.35, y],
        ));
        this.redPolyLines.push(utils.getPolyLineVectorPair(
            [lastpoint.x, lastpoint.y],
            [x + maxOffset + 0.35, y],
        ));
        // this.exclusive3ld.add(utils.getLine(
        //     [lastpoint.x, lastpoint.y],
        //     [x + maxOffset, y],
        //     0xff0000,
        // ));

        this.white3ld.push(...utils.getVectorPair(
            [firstpoint.x, firstpoint.y],
            [firstpoint.x, firstpoint.y - yOffset],
        ));
        this.whitePoly3ld.push(utils.getPolyLineVectorPair(
            [firstpoint.x, firstpoint.y],
            [firstpoint.x, firstpoint.y - yOffset],
        ));
        // this.exclusive3ld.add(utils.getLine(
        //     [firstpoint.x, firstpoint.y],
        //     [firstpoint.x, firstpoint.y - yOffset],
        // ));

        this.white3ld.push(...utils.getVectorPair(
            [firstpoint.x, firstpoint.y - yOffset],
            [x + maxOffset, y - yOffset],
        ));
        this.whitePoly3ld.push(utils.getPolyLineVectorPair(
            [firstpoint.x, firstpoint.y - yOffset],
            [x + maxOffset, y - yOffset],
        ));
        // this.exclusive3ld.add(utils.getLine(
        //     [firstpoint.x, firstpoint.y - yOffset],
        //     [x + maxOffset, y - yOffset],
        // ));


        this.whitesld.push(...utils.getVectorPair(
            [prevEndpoints[2].x, prevEndpoints[2].y - yOffset],
            [x + maxOffset, y - yOffset],
        ));
        this.whitePolySld.push(utils.getPolyLineVectorPair(
            [prevEndpoints[2].x, prevEndpoints[2].y - yOffset],
            [x + maxOffset, y - yOffset],
        ));
        // this.exclusivesld.add(utils.getLine(
        //     [prevEndpoints[2].x, prevEndpoints[2].y - yOffset],
        //     [x + maxOffset, y - yOffset],
        // ));

        // this.objectsGroup.add(this.exclusivesld);
        // this.objectsGroup.add(this.exclusive3ld);

        // const boundingBox = (new THREE.Box3()).setFromObject(this.objectsGroup);
        // const size = new THREE.Vector3();
        // boundingBox.getSize(size);
        // console.log(size);

        // const [width,height] = [size.x,size.y];
        // this.objectsGroup.add(utils.getThreeRectangle({
        //     width: width+padding,
        //     height: height+padding,
        //     origin: [a,b]
        // }));
    }

    addDots(origin, horizontal = true) {
        const [x, y] = origin;

        const padding = 2;
        const circleRadius = 0.5;

        if (horizontal) {
            for (let i = 1; i < 4; i++) {
                this.whiteCircles.push({
                    position: new THREE.Vector3(x + (padding * i), y),
                    radius: circleRadius,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.objectsGroup.add(utils.getThreeArc({
                    origin: [x + (padding * i), y],
                    radius: circleRadius,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
            }
        }
        else {
            for (let i = 1; i < 4; i++) {
                this.whiteCircles.push({
                    position: new THREE.Vector3(x, y + (padding * i)),
                    radius: circleRadius,
                    startAngle: 2 * Math.PI,
                    endAngle: 0,
                });
                this.objectsGroup.add(utils.getThreeArc({
                    origin: [x, y + (padding * i)],
                    radius: circleRadius,
                    startAngle: 0,
                    endAngle: 2 * Math.PI,
                }));
            }
        }
    }

    addEndConnect(origin, size = 2) {
        const [x, y] = origin;

        this.whiteLines.push(
            new THREE.Vector3(x, y),
            new THREE.Vector3(x + size, y + size),
        );

        this.whiteLines.push(
            new THREE.Vector3(x + size, y + size),
            new THREE.Vector3(x + size, y - size),
        );

        this.whiteLines.push(
            new THREE.Vector3(x + size, y - size),
            new THREE.Vector3(x, y),
        );

        




        this.whitePolyLines.push({points:
            [new THREE.Vector3(x, y),
            new THREE.Vector3(x + size, y + size),]}
        );

        this.whitePolyLines.push({points:
            [new THREE.Vector3(x + size, y + size),
            new THREE.Vector3(x + size, y - size),]}
        );

        this.whitePolyLines.push({points:
            [new THREE.Vector3(x + size, y - size),
            new THREE.Vector3(x, y),]}
        );
    }
}


// could maybe replace it with an approximate bezier curve (discuss whichever is optimal)
// function sineWave(origin,scale){
//     const [x,y] = origin;
//     const points = [];
//     for(let i=0;i<(2 * Math.PI);i+=1){ //should change increment according to scale later
//         points.push(new THREE.Vector2(x+i,Math.sin(i)+y));
//     }
//     const geometry = new THREE.BufferGeometry().setFromPoints(points);
//     const material = new THREE.LineBasicMaterial({color: 0xb000b0});
//     const mesh = new THREE.Line(geometry,material);
//     return mesh;
// }

// export function testModule(){
//     const panel = new panelGroup('micro',3,[0,0]);
//     const boundingBox = (new THREE.Box3()).setFromObject(panel.objectsGroup);
//     return panel.objectsGroup;
// }

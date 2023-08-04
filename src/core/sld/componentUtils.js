/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import * as makerjs from 'makerjs';
import {
    getBoundsOfMultipleModels,
    getBounds,
    placeModelOnCenter,
    getDashedConnectionLine,
    getConnectionLine,
    moveMultipleModelsAndPaths,
    getConnectionLineWithPadding,
    moveOutputs,
    moveInputs,
    getPaddingValues,
} from './utils';
import * as sldConstants from './sldConstants';

const TEXT_SIZE = sldConstants.textSize;

const FONT_HEIGHT = 2;

export function CaptionText(text, position) {
    this.models = {
        emptyModel: {
            models: {},
        },
    };
    this.origin = [0, 0];

    makerjs.model.addCaption(
        this.models.emptyModel,
        text,
        position[0],
        position[1],
    );

    this.bounds = [0, 0];
}

/*
*   Draws a module
*   Returns - drawing, svg(if returnSvg is passed as true), bounds
*/
// TODO: This way of writing parameters is really useless, do something like object.assign or something. Do this everywhere
export function Module({
    font, scale, returnSVG, text,
} = {
    font: null,
    scale: 1,
    returnSVG: true,
    text: '1',
}) {
    const presentationConfig = {
        outerBoxHeight: scale * 80,
        outerBoxWidth: scale * 160,
        triangleWidth: scale * 60,
        textSize: scale * 30,
        textBezierAccuracy: Infinity,
    };

    this.models = {
        outerRectangle: new makerjs.models.Rectangle(presentationConfig.outerBoxWidth, presentationConfig.outerBoxHeight),
        leftTriangle: new makerjs.models.ConnectTheDots(false, [[0, 0], [presentationConfig.triangleWidth, presentationConfig.outerBoxHeight / 2], [0, presentationConfig.outerBoxHeight]]),
    };

    makerjs.model.addCaption(
        this.models.outerRectangle,
        text,
        [presentationConfig.triangleWidth, presentationConfig.outerBoxHeight / 2],
        [presentationConfig.outerBoxWidth, presentationConfig.outerBoxHeight / 2],
    );

    this.textObjects = [
        {
            text,
            position: [(presentationConfig.triangleWidth + presentationConfig.outerBoxWidth) / 2, presentationConfig.outerBoxHeight / 2],
        },
    ];

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;

    // TODO: Rename standard input and output
    this.outputs = {
        standardOutput: {
            position: [presentationConfig.outerBoxWidth, presentationConfig.outerBoxHeight / 2],
        },
    };
    this.inputs = {
        standardInput: {
            position: [0, presentationConfig.outerBoxHeight / 2],
        },
    };
}

/*
*   Draws a dashed line
*/
export function DashedLine({
    returnSVG, spacing, initPoint, finalPoint,
} = {}) {
    this.origin = [0, 0];
    this.paths = {};

    if (initPoint[0] > finalPoint[0]) {
        const temp = initPoint;
        initPoint = finalPoint;
        finalPoint = temp;
    }

    if (initPoint[1] > finalPoint[1]) {
        const temp = initPoint;
        initPoint = finalPoint;
        finalPoint = temp;
    }

    if (spacing === undefined) {
        spacing = 8;
    }

    const currentPoint = [initPoint[0], initPoint[1]];
    const slope = (finalPoint[1] - initPoint[1]) / (finalPoint[0] - initPoint[0]);
    const theta = Math.atan(slope);
    const pointDisplacement = [
        spacing * Math.cos(theta), spacing * Math.sin(theta),
    ];
    let count = 0;
    while (currentPoint[0] < finalPoint[0] || currentPoint[1] < finalPoint[1]) {
        if (count % 2 === 0) {
            this.paths[`dash${count}`] = new makerjs.paths.Line(
                [currentPoint[0], currentPoint[1]],
                [
                    (currentPoint[0] + pointDisplacement[0] > finalPoint[0]) ? finalPoint[0] : currentPoint[0] + pointDisplacement[0],
                    (currentPoint[1] + pointDisplacement[1] > finalPoint[1]) ? finalPoint[1] : currentPoint[1] + pointDisplacement[1],
                ],
            );
        }
        currentPoint[0] += pointDisplacement[0];
        currentPoint[1] += pointDisplacement[1];
        count += 1;
    }

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

export function DashedRectangle(rectangle, minWidth, minHeight) {
    this.origin = rectangle.origin;
    this.models = {};

    let maxXDistance = -1;
    let minXVerticalLineIndex = -1;

    let maxYDistance = -1;
    let maxYHorizontalLineIndex = -1;

    const keys = Object.keys(rectangle.paths);
    for (let i = 0; i < keys.length; i += 1) {
        const rectanglePath = rectangle.paths[keys[i]];
        if (rectanglePath.origin[0] === rectanglePath.end[0] &&
            (minXVerticalLineIndex === -1 || rectanglePath.origin[0] < rectangle.paths[keys[minXVerticalLineIndex]].origin[0])) {
            minXVerticalLineIndex = i;
        }
        const currentXDistance = Math.abs(rectanglePath.end[0] - rectanglePath.origin[0]);
        if (currentXDistance > maxXDistance) {
            maxXDistance = currentXDistance;
        }

        if (rectanglePath.origin[1] === rectanglePath.end[1] &&
            (maxYHorizontalLineIndex === -1 || rectanglePath.origin[1] > rectangle.paths[keys[maxYHorizontalLineIndex]].origin[1])) {
            maxYHorizontalLineIndex = i;
        }
        const currentYDistance = Math.abs(rectanglePath.end[1] - rectanglePath.origin[1]);
        if (currentYDistance > maxYDistance) {
            maxYDistance = currentYDistance;
        }
    }

    for (let i = 0; i < keys.length; i += 1) {
        let finalPointX = rectangle.paths[keys[i]].end[0];
        let initPointX = rectangle.paths[keys[i]].origin[0];

        let finalPointY = rectangle.paths[keys[i]].end[1];
        let initPointY = rectangle.paths[keys[i]].origin[1];

        const rectanglePath = rectangle.paths[keys[i]];

        if (maxXDistance < minWidth) {
            const minX = rectangle.paths[keys[minXVerticalLineIndex]].origin[0];
            if (i !== minXVerticalLineIndex) {
                if (finalPointX !== minX) {
                    finalPointX = rectangle.paths[keys[minXVerticalLineIndex]].origin[0] + minWidth;
                }
                if (initPointX !== minX) {
                    initPointX = rectangle.paths[keys[minXVerticalLineIndex]].origin[0] + minWidth;
                }
            }
        }

        if (maxYDistance < minHeight) {
            const minY = rectangle.paths[keys[minXVerticalLineIndex]].origin[1];
            if (i !== maxYHorizontalLineIndex) {
                if (finalPointY !== minY) {
                    finalPointY = rectangle.paths[keys[maxYHorizontalLineIndex]].origin[1] - minHeight;
                }
                if (initPointY !== minY) {
                    initPointY = rectangle.paths[keys[maxYHorizontalLineIndex]].origin[1] - minHeight;
                }
            }
        }

        this.models[keys[i]] = new DashedLine({
            returnSVG: false,
            initPoint: [initPointX, initPointY],
            finalPoint: [finalPointX, finalPointY],
        });
    }
}

/*
*   Draws a string
*/
export function ModuleString({
    font, scale, returnSVG, numberOfModules, minNumberOfModules, maxNumberOfModules, totalNumberOfModules, numberOfModulesToShow, showWireLabel,
} = {
    font: null,
    scale: 1,
    returnSVG: true,
    numberOfModules: 10,
}) {
    const presentationConfig = {
        panelSpacing: 60 * scale,
        lastPanelExtraSpace: 120 * scale,
        textBezierAccuracy: Infinity,
        singlePanelWireLabelMargin: 100,
    };

    this.models = {};
    this.paths = {};

    numberOfModulesToShow = (numberOfModules > numberOfModulesToShow) ? numberOfModulesToShow : numberOfModules;

    this.textObjects = [];

    const modules = [];
    for (let i = 0; i < numberOfModulesToShow; i += 1) {
        if (minNumberOfModules === maxNumberOfModules) {
            numberOfModules = minNumberOfModules;
        }
        else {
            numberOfModules = `${minNumberOfModules}-${maxNumberOfModules}`;
        }
        const myModule = new Module({
            font,
            scale,
            returnSVG,
            text: (i === numberOfModulesToShow - 1) ? `${numberOfModules}` : (`${i + 1}`),
        });
        const displacement = [(presentationConfig.panelSpacing + myModule.bounds[0]) * i, 0];

        if (i === numberOfModulesToShow - 1 && numberOfModules > numberOfModulesToShow) {
            displacement[0] += presentationConfig.lastPanelExtraSpace;
        }

        makerjs.model.move(myModule, displacement);
        this.models[`module${i}`] = myModule;
        modules.push(myModule);

        if (i !== 0) {
            if (i === numberOfModulesToShow - 1 && numberOfModules > numberOfModulesToShow) {
                this.models[`moduleConnection${i}`] = getDashedConnectionLine(
                    modules[i - 1],
                    modules[i],
                    modules[i - 1].outputs.standardOutput,
                    modules[i].inputs.standardInput,
                );
            }
            else {
                this.paths[`moduleConnection${i}`] = getConnectionLine(
                    modules[i - 1],
                    modules[i],
                    modules[i - 1].outputs.standardOutput,
                    modules[i].inputs.standardInput,
                );
            }
        }

        for (let j = 0; j < myModule.textObjects.length; j += 1) {
            this.textObjects.push({
                text: myModule.textObjects[j].text,
                position: [
                    myModule.textObjects[j].position[0] + myModule.origin[0],
                    myModule.textObjects[j].position[1] + myModule.origin[1],
                ],
            });
        }
    }

    this.inputs = {};
    this.outputs = {
        standardOutput: {
            position: [
                modules[modules.length - 1].outputs.standardOutput.position[0] + modules[modules.length - 1].origin[0],
                modules[modules.length - 1].outputs.standardOutput.position[1] + modules[modules.length - 1].origin[1],
            ],
        },
    };
    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    if (showWireLabel && modules.length >= 2) {
        this.outputs.wireLabelOutput = {
            position: [
                (modules[modules.length - 2].outputs.standardOutput.position[0] + modules[modules.length - 2].origin[0]
                    + modules[modules.length - 1].inputs.standardInput.position[0] + modules[modules.length - 1].origin[0]) / 2,
                modules[modules.length - 1].outputs.standardOutput.position[1] + modules[modules.length - 1].origin[1],
            ],
        };
    }
    else {
        this.outputs.wireLabelOutput = {
            position: [
                modules[modules.length - 1].outputs.standardOutput.position[0] + modules[modules.length - 1].origin[0] + presentationConfig.singlePanelWireLabelMargin,
                modules[modules.length - 1].outputs.standardOutput.position[1] + modules[modules.length - 1].origin[1],
            ],
        };
    }

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

/*
*   Draws a group of strings
*/
export function GroupOfStrings({
    font, scale, returnSVG, totalNumberOfModules, minNumberOfModules, maxNumberOfModules, numberOfModules, numberOfStrings, title, numberOfModulesToShow, numberOfStringsToShow, showWireLabel, wireLabel,
} = {
    font: null,
    scale: 1,
    returnSVG: true,
    numberOfModules: 10,
    numberOfStrings: 3,
    title: 'Some title here',
}) {
    const presentationConfig = {
        stringSpacing: 30,
        stringTextSpacing: 45, // Spacing between text and string
        textSpacing: 15, // Spacing between lines of text
        textLeftSpacing: 100,
        textSize: 30,
        outerRectanglePadding: 45,
        showOutputs: false,
        showInputs: false,
        wireLabelCircleSize: 10,
        textBezierAccuracy: Infinity,
        titleTextMarginTop: 75,
    };

    this.models = {};
    this.paths = {};

    this.inputs = {};
    this.outputs = {};

    let lastString = null;

    this.textObjects = [];

    numberOfStringsToShow = (numberOfStringsToShow > numberOfStrings) ? numberOfStrings : numberOfStringsToShow;

    for (let i = 0; i < numberOfStringsToShow; i += 1) {
        const stringParams = {
            font,
            scale: 1,
            returnSVG: false,
            numberOfModules,
            maxNumberOfModules,
            minNumberOfModules,
            totalNumberOfModules,
            numberOfModulesToShow,
        };
        if (i === numberOfStringsToShow - 1) {
            stringParams.showWireLabel = true;
            // stringParams.wireLabelText = wireLabel;
        }
        const myString = new ModuleString(stringParams);
        lastString = (i === numberOfStringsToShow - 1) ? myString : null;
        // TODO: Maybe this is fine for now, but will need to be improved to be scalable in the future
        // The following accounts for bottom text, text in between strings, string spacing, string size
        const displacement = [0, (presentationConfig.stringSpacing + myString.bounds[1]) * i + ((i === numberOfStringsToShow - 1) ? presentationConfig.textSize * 2 + presentationConfig.textSpacing + 2 * presentationConfig.stringTextSpacing - presentationConfig.stringSpacing : 0)];

        makerjs.model.move(myString, displacement);
        this.models[`string${i}`] = myString;

        if (i === numberOfStringsToShow - 1) {
            // TODO: Needs a lot of refactoring
            const width = 50;
            makerjs.measure.modelExtents(myString).width;
            this.models.stringCountText = makerjs.model.move(
                new CaptionText(`Module count: ${totalNumberOfModules}`, [[width, FONT_HEIGHT * 10], [width, FONT_HEIGHT * 10]]),
                [presentationConfig.textLeftSpacing, (presentationConfig.stringSpacing + myString.bounds[1]) * i - presentationConfig.stringSpacing + presentationConfig.stringTextSpacing],
            );

            this.textObjects.push({
                text: `Module count: ${totalNumberOfModules}`,
                position: [
                    width + presentationConfig.textLeftSpacing + 28,
                    FONT_HEIGHT + (presentationConfig.stringSpacing + myString.bounds[1]) * i - presentationConfig.stringSpacing + presentationConfig.stringTextSpacing,
                ],
            });

            this.models.moduleCountText = makerjs.model.move(
                new CaptionText(`String count: ${numberOfStrings}`, [[width, FONT_HEIGHT * 10], [width, FONT_HEIGHT * 10]]),
                [presentationConfig.textLeftSpacing, (presentationConfig.stringSpacing + myString.bounds[1]) * i - presentationConfig.stringSpacing + presentationConfig.stringTextSpacing + presentationConfig.textSpacing + presentationConfig.textSize],
            );

            this.textObjects.push({
                text: `String count: ${numberOfStrings}`,
                position: [
                    width + presentationConfig.textLeftSpacing,
                    FONT_HEIGHT + (presentationConfig.stringSpacing + myString.bounds[1]) * i - presentationConfig.stringSpacing + presentationConfig.stringTextSpacing + presentationConfig.textSpacing + presentationConfig.textSize,
                ],
            });
        }

        this.outputs[`stringOutput${i}`] = {
            position: [
                (myString.outputs.standardOutput.position[0] + myString.origin[0]) * scale,
                (myString.outputs.standardOutput.position[1] + myString.origin[1]) * scale,
            ],
        };
        if (presentationConfig.showOutputs) {
            this.paths[`tempOutput${i}`] = makerjs.path.move(
                new makerjs.paths.Circle(4),
                this.outputs[`stringOutput${i}`].position,
            );
        }
    }

    this.models.outerRectangle = new DashedRectangle(
        new makerjs.models.Rectangle(this, presentationConfig.outerRectanglePadding),
        440,
        310,
    );
    const outerRectangleExtents = makerjs.measure.modelExtents(this.models.outerRectangle);
    const titleParagraph = new CaptionText(title, [[outerRectangleExtents.width / 2, FONT_HEIGHT / 2], [outerRectangleExtents.width / 2, FONT_HEIGHT / 2]]);
    // const titleParagraph = new Paragraph({
    //     scale: 1, font, text: title, returnSVG: false, maxWidth: makerjs.measure.modelExtents(this.models.outerRectangle).width
    // })
    const xDisplacement = -this.models.outerRectangle.origin[0];
    moveMultipleModelsAndPaths(this.models, this.paths, [xDisplacement, presentationConfig.titleTextMarginTop]);

    for (let i = 0; i < this.textObjects.length; i += 1) {
        const textObj = this.textObjects[i];
        textObj.position = [
            textObj.position[0] + xDisplacement,
            textObj.position[1] + FONT_HEIGHT * 10 + presentationConfig.titleTextMarginTop,
        ];
        this.textObjects[i] = textObj;
    }

    moveOutputs(this, [xDisplacement * scale, (titleParagraph.bounds[1] + presentationConfig.titleTextMarginTop) * scale]);
    this.models.title = titleParagraph;

    this.textObjects.push({
        position: [outerRectangleExtents.width / 2, FONT_HEIGHT / 2],
        text: title,
    });
    // this.models.title = new makerjs.models.Text(font, title, presentationConfig.textSize, undefined, undefined, presentationConfig.textBezierAccuracy);

    if (showWireLabel) {
        this.models.wireLabel = makerjs.model.move(new WireLabel({
            font,
            scale: 1,
            returnSVG: false,
            labelText: wireLabel,
            point1: [0, 0],
            point2: [0, 120 * 1],
            point3: [20 * 1, 140 * 1],
            ellipseSizeX: presentationConfig.wireLabelCircleSize,
            ellipseSizeY: presentationConfig.wireLabelCircleSize,
        }), [
            lastString.outputs.wireLabelOutput.position[0] - presentationConfig.wireLabelCircleSize + lastString.origin[0],
            lastString.outputs.wireLabelOutput.position[1] - presentationConfig.wireLabelCircleSize + lastString.origin[1],
        ]);

        for (let j = 0; j < this.models.wireLabel.textObjects.length; j += 1) {
            this.textObjects.push({
                text: this.models.wireLabel.textObjects[j].text,
                position: [
                    this.models.wireLabel.origin[0] + this.models.wireLabel.textObjects[j].position[0],
                    this.models.wireLabel.origin[1] + this.models.wireLabel.textObjects[j].position[1],
                ],
            });
        }
    }

    for (let i = 0; i < numberOfStringsToShow; i += 1) {
        const myString = this.models[`string${i}`];
        for (let j = 0; j < myString.textObjects.length; j += 1) {
            this.textObjects.push({
                text: myString.textObjects[j].text,
                position: [
                    myString.textObjects[j].position[0] + myString.origin[0],
                    myString.textObjects[j].position[1] + myString.origin[1],
                ],
            });
        }
    }

    makerjs.model.scale(this, scale);

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

// TODO: Would stop working if the length of any word is more than max width
export function Paragraph({
    scale, font, text, returnSVG, maxWidth,
} = {}) {
    const presentationConfig = {
        textSize: 30,
        linePadding: 5,
        // TODO: Temporary solution
        wordSpacing: 10,
        textBezierAccuracy: Infinity,
    };
    this.origin = [0, 0];

    const wordsArray = text.split(' ');
    const wordTextObjects = [];

    for (let i = 0; i < wordsArray.length; i += 1) {
        wordTextObjects.push(new makerjs.models.Text(font, `${wordsArray[i]} `, presentationConfig.textSize, undefined, undefined, presentationConfig.textBezierAccuracy));
    }

    this.models = {};

    let lineNo = 0;
    let wordNo = 0;
    let currentLineLength = 0;
    let currentLineTextModel = { models: {} };
    for (let i = 0; i < wordsArray.length; i += 1) {
        const currentWordWidth = makerjs.measure.modelExtents(wordTextObjects[i]).width;
        if (currentLineLength + currentWordWidth > maxWidth) {
            // Create the old line and center it
            const oldLine = { models: { currentLineTextModel } };
            oldLine.origin = [0, 0];
            moveMultipleModelsAndPaths(this.models, this.paths, [0, presentationConfig.textSize + presentationConfig.linePadding]);
            this.models[`line${lineNo}`] = makerjs.model.move(
                oldLine,
                [maxWidth / 2 - makerjs.measure.modelExtents(oldLine).width / 2, 0],
            );
            currentLineTextModel = { models: {} };
            currentLineLength = 0;
            lineNo += 1;
            wordNo = 0;
        }

        currentLineTextModel.models[`word${wordNo}`] = makerjs.model.move(
            wordTextObjects[i],
            [(wordNo === 0) ? 0 : currentLineLength, 0],
        );
        currentLineLength += currentWordWidth + presentationConfig.wordSpacing;
        wordNo += 1;
    }

    // Create the old line and center it
    const oldLine = { models: { currentLineTextModel } };
    oldLine.origin = [0, 0];
    moveMultipleModelsAndPaths(this.models, this.paths, [0, presentationConfig.textSize + presentationConfig.linePadding]);
    this.models[`line${lineNo}`] = makerjs.model.move(
        oldLine,
        [maxWidth / 2 - makerjs.measure.modelExtents(oldLine).width / 2, 0],
    );

    currentLineTextModel = { models: {} };
    currentLineLength = 0;
    lineNo += 1;
    wordNo = 0;

    makerjs.model.scale(this, scale);

    const modelExtents = makerjs.measure.modelExtents(this);
    this.bounds = [
        modelExtents.width,
        modelExtents.height,
    ];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models }) : undefined;
}


/*
*   Draws a wire label
*/
export function WireLabel({
    font, scale, returnSVG, labelText, point1, point2, point3, ellipseSizeX, ellipseSizeY, textSize,
} = {}) {
    const presentationConfig = {
        textSize: (textSize === undefined) ? 30 * scale : textSize,
        textPadding: 5 * scale,
        textBezierAccuracy: Infinity,
        yPadding: 20,
    };
    this.origin = [0, 0];

    this.paths = {
        line1: new makerjs.paths.Line(
            [point1[0] + ellipseSizeX, point1[1] + 2 * ellipseSizeY],
            [point2[0] + ellipseSizeX, point2[1] + 2 * ellipseSizeY],
        ),
        line2: new makerjs.paths.Line(
            [point2[0] + ellipseSizeX, point2[1] + 2 * ellipseSizeY],
            [point3[0] + ellipseSizeX, point3[1] + 2 * ellipseSizeY],
        ),
    };

    this.models = {
        ellipse: new makerjs.models.Ellipse(ellipseSizeX, ellipseSizeY),
        textObj: new CaptionText(labelText, [
            [point3[0] + ellipseSizeX + presentationConfig.textPadding, point3[1] + presentationConfig.textPadding + ellipseSizeY * 2 + presentationConfig.yPadding],
            [point3[0] + ellipseSizeX + presentationConfig.textPadding, point3[1] + presentationConfig.textPadding + ellipseSizeY * 2 + presentationConfig.yPadding],
        ]),
    };

    makerjs.model.move(this.models.ellipse, [ellipseSizeX, ellipseSizeY]);

    this.textObjects = [
        {
            text: labelText,
            position: [
                point3[0] + ellipseSizeX + presentationConfig.textPadding, point3[1] + presentationConfig.textPadding + ellipseSizeY * 2 + presentationConfig.yPadding,
            ],
        },
    ];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

/*
*   Draws an inverter
*/
export function Inverter({
    font, scale, capacityBoxText, returnSVG, titleText, numberOfInputs, inverterCount,
} = {}) {
    const presentationConfig = {
        spacingBetweenInnerInverterAndBreakerBox: scale * 60,
        outerBoxPadding: scale * 20,
        textSize: scale * FONT_HEIGHT,
        textTopPadding: scale * 10,
        inputPadding: scale * 30,
        showInputs: false,
        showOutputs: false,
        inputConnectionPadding: scale * 30,
        outputConnectionPadding: scale * 30,
        textBezierAccuracy: Infinity,
    };
    this.origin = [0, 0];

    this.models = {};
    this.paths = {};

    this.models.innerInverter = new InverterInner({
        font, scale, capacityBoxText, returnSVG,
    });
    this.models.breakerBox = new BreakerBox({ scale, returnSVG });
    makerjs.model.move(
        this.models.breakerBox,
        [
            this.models.innerInverter.bounds[0] + presentationConfig.spacingBetweenInnerInverterAndBreakerBox,
            this.models.innerInverter.bounds[1] / 2 - this.models.breakerBox.bounds[1] / 2,
        ],
    );

    this.paths.innerInverterBreakerBoxConnection = getConnectionLine(
        this.models.innerInverter,
        this.models.breakerBox,
        this.models.innerInverter.outputs.standardOutput,
        this.models.breakerBox.inputs.standardInput,
    );

    this.models.outerBox = new makerjs.models.Rectangle(this, presentationConfig.outerBoxPadding);

    moveMultipleModelsAndPaths(this.models, this.paths, [-this.models.outerBox.origin[0], -this.models.outerBox.origin[1]]);
    this.models.outerBox.origin = [0, 0];

    // this.models.title =
    // new CaptionText(titleText, [[0, -FONT_HEIGHT / 2], [0, -FONT_HEIGHT / 2]])
    // new makerjs.models.Text(font, titleText, presentationConfig.textSize, undefined, undefined, presentationConfig.textBezierAccuracy);

    const titleParagraph =
    new CaptionText(titleText, [[makerjs.measure.modelExtents(this.models.outerBox).width / 2, -presentationConfig.textTopPadding], [makerjs.measure.modelExtents(this.models.outerBox).width / 2, -presentationConfig.textTopPadding]]);
    this.textObjects = [];
    // new Paragraph({font, text: titleText, scale, returnSVG, maxWidth: makerjs.measure.modelExtents(this.models.outerBox).width});
    let inverterCountParagraph;
    if (inverterCount > 1) {
        inverterCountParagraph =
        new CaptionText(`Typical of ${inverterCount} inverters.`, [[makerjs.measure.modelExtents(this.models.outerBox).width / 2, -FONT_HEIGHT * 10 - presentationConfig.textTopPadding * 2], [makerjs.measure.modelExtents(this.models.outerBox).width / 2, -FONT_HEIGHT * 10 - presentationConfig.textTopPadding * 2]]);
        // new Paragraph({font, text: "Typical of " + inverterCount + " inverters.", scale, returnSVG, maxWidth: });
        moveMultipleModelsAndPaths(this.models, this.paths, [0, titleParagraph.bounds[1] + presentationConfig.textTopPadding * 2 + 5]);
        this.models.inverterCountParagraph = inverterCountParagraph;
        this.models.title = makerjs.model.moveRelative(titleParagraph, [0, presentationConfig.textTopPadding]);
        this.textObjects.push({
            position: [makerjs.measure.modelExtents(this.models.outerBox).width / 2, 0],
            text: titleText,
        });
        this.textObjects.push({
            position: [makerjs.measure.modelExtents(this.models.outerBox).width / 2, -FONT_HEIGHT * 10 - presentationConfig.textTopPadding * 2],
            text: `Typical of ${inverterCount} inverters.`,
        });
    }
    else {
        moveMultipleModelsAndPaths(this.models, this.paths, [0, titleParagraph.bounds[1] + presentationConfig.textTopPadding * 2]);
        this.models.title = makerjs.model.moveRelative(titleParagraph, [0, 0]);
        this.textObjects.push({
            position: [makerjs.measure.modelExtents(this.models.outerBox).width / 2, -presentationConfig.textTopPadding],
            text: titleText,
        });
    }

    for (let i = 0; i < this.models.innerInverter.textObjects.length; i += 1) {
        const textObj = this.models.innerInverter.textObjects[i];
        this.textObjects.push({
            text: textObj.text,
            position: [
                textObj.position[0] + this.models.innerInverter.origin[0],
                textObj.position[1] + this.models.innerInverter.origin[1],
            ],
            rotation: textObj.rotation,
        });
    }

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.inputs = {};
    this.outputs = {
        standardOutput: {
            position: [this.bounds[0] * scale, (this.models.breakerBox.outputs.standardOutput.position[1] + this.models.breakerBox.origin[1]) * scale],
            padding: presentationConfig.outputConnectionPadding,
        },
    };

    if (presentationConfig.showOutputs) {
        this.paths.tempOutput = makerjs.path.move(new makerjs.paths.Circle(2), this.outputs.standardOutput.position);
    }

    const outerBoxBounds = getBounds(this.models.outerBox);
    const inputDistance = (outerBoxBounds[3] - outerBoxBounds[1]) / (numberOfInputs + 1);
    for (let i = 0; i < numberOfInputs; i += 1) {
        this.inputs[`inputs${i}`] = {
            position: [
                0,
                scale * ((i + 1) * inputDistance + titleParagraph.bounds[1] + presentationConfig.textTopPadding + ((inverterCount > 1) ? presentationConfig.textTopPadding + inverterCountParagraph.bounds[1] : 0)),
            ],
            padding: presentationConfig.inputConnectionPadding,
        };

        if (presentationConfig.showInputs) {
            this.paths[`tempInput${i}`] = makerjs.path.move(new makerjs.paths.Circle(2), this.inputs[`inputs${i}`].position);
        }
    }

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}


/*
*   Draws a group of strings
*/
export function InverterInner({
    font, scale, capacityBoxText, returnSVG,
} = {}) {
    this.origin = [0, 0];
    const presentationConfig = {
        capacityBoxTextSize: scale * 20,
        capacityBoxPadding: scale * 20,
        innerRectangleWidth: scale * 360,
        innerRectangleHeight: 460,
        lineSpacingLeft: scale * 60,
        lineLength: scale * 100,
        topLineHeightPercent: 0.83,
        bottomLineHeightPercent: 0.78,
        curveSpacingX: scale * 40,
        curveSpacingY: scale * 100,
        curveStartX: scale * 240,
        curveStartY: scale * 90,
        textBezierAccuracy: Infinity,
    };

    this.models = {};
    this.paths = {};

    this.models.capacityBox = makerjs.model.move(new TextBox({
        font,
        scale,
        text: capacityBoxText,
        returnSVG,
        rotation: 90,
        initPoint: 0,
        finalPoint: presentationConfig.innerRectangleHeight - 2 * presentationConfig.capacityBoxPadding,
    }), [0, presentationConfig.capacityBoxPadding]);
    this.models.innerBox = makerjs.model.move(
        new makerjs.models.Rectangle(
            presentationConfig.innerRectangleWidth,
            presentationConfig.innerRectangleHeight,
        ),
        [
            this.models.capacityBox.bounds[0], 0,
        ],
    );

    this.textObjects = [];
    for (let i = 0; i < this.models.capacityBox.textObjects.length; i += 1) {
        const textObj = this.models.capacityBox.textObjects[i];
        textObj.position = [
            textObj.position[0] + this.models.capacityBox.origin[0],
            textObj.position[1] + this.models.capacityBox.origin[1],
        ];
        this.textObjects.push(textObj);
    }

    const innerBoxExtents = makerjs.measure.modelExtents(this.models.innerBox);

    this.models.innerRectangleDiagonal = new makerjs.models.ConnectTheDots([[this.models.capacityBox.bounds[0], 0],
        [presentationConfig.innerRectangleWidth + this.models.capacityBox.bounds[0], innerBoxExtents.height]]);

    this.paths.topLine1 = new makerjs.paths.Line(
        [this.models.capacityBox.bounds[0] + presentationConfig.lineSpacingLeft, presentationConfig.topLineHeightPercent * innerBoxExtents.height],
        [this.models.capacityBox.bounds[0] + presentationConfig.lineSpacingLeft + presentationConfig.lineLength, presentationConfig.topLineHeightPercent * innerBoxExtents.height],
    );

    this.paths.topLine2 = new makerjs.paths.Line(
        [this.models.capacityBox.bounds[0] + presentationConfig.lineSpacingLeft, presentationConfig.bottomLineHeightPercent * innerBoxExtents.height],
        [this.models.capacityBox.bounds[0] + presentationConfig.lineSpacingLeft + presentationConfig.lineLength, presentationConfig.bottomLineHeightPercent * innerBoxExtents.height],
    );

    this.models.bottomBezierCurve = new makerjs.models.BezierCurve(
        [
            [presentationConfig.curveStartX, presentationConfig.curveStartY],
            [presentationConfig.curveStartX + presentationConfig.curveSpacingX, presentationConfig.curveStartY + presentationConfig.curveSpacingY],
            [presentationConfig.curveStartX + 2 * presentationConfig.curveSpacingX, presentationConfig.curveStartY - presentationConfig.curveSpacingY],
            [presentationConfig.curveStartX + 3 * presentationConfig.curveSpacingX, presentationConfig.curveStartY],
        ],
        0.1,
    );

    this.bounds = getBoundsOfMultipleModels(this.models);

    this.inputs = {};
    this.outputs = {
        standardOutput: {
            position: [
                this.bounds[0], this.bounds[1] / 2,
            ],
        },
    };

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

/*
*   Draws a group of strings
*/
export function BreakerBox({ scale, returnSVG } = {}) {
    this.origin = [0, 0];
    const presentationConfig = {
        padding: 20 * scale,
        textBezierAccuracy: Infinity,
    };

    this.models = {};
    this.paths = {};

    this.models.breaker = new GenerateBreaker(20);
    this.models.outerRectangle = new makerjs.models.Rectangle(this.models.breaker, presentationConfig.padding);
    makerjs.model.move(this.models.breaker, [-this.models.outerRectangle.origin[0], -this.models.outerRectangle.origin[1]]);
    makerjs.model.move(this.models.outerRectangle, [-this.models.outerRectangle.origin[0], -this.models.outerRectangle.origin[1]]);
    this.models.outerRectangle.origin = [0, 0];

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.inputs = {
        standardInput: {
            position: [0, this.bounds[1] / 2],
        },
    };
    this.outputs = {
        standardOutput: {
            position: [this.bounds[0], this.bounds[1] / 2],
        },
    };

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

export function Meter(font, meterDimension, scale = 1, returnSVG = false, labelRequired = false) {
    const meterDimensions = {
        length: scale * meterDimension,
        textSize: scale * TEXT_SIZE,
    };

    // const textObject = labelRequired ? new makerjs.models.Text(font, 'METER', meterDimensions.textSize) : null;
    // if (textObject !== null) {
    //     makerjs.model.center(textObject);
    //     const textExtents = makerjs.measure.modelExtents(textObject);
    //     makerjs.model.moveRelative(
    //         textObject,
    //         [0, -(meterDimensions.length / 2) - (textExtents.height / 2) - 1],
    //     );
    // }
    this.text = [];
    const textObject = labelRequired ? new CaptionText('Meter', [[0, 0], [0, 0]]) : null;
    if (textObject !== null) {
        makerjs.model.moveRelative(
            textObject,
            [0, -(meterDimensions.length / 2) - 2],
        );
        this.text.push({
            label: 'Meter',
            // position: [0, -(meterDimensions.length / 2) - 2],
            position: [0, -(meterDimensions.length / 2) - (TEXT_SIZE / 2) - 1],
        });
    }

    const meterLabelPoints = [
        [(meterDimensions.length / 3) * Math.cos((315) * (Math.PI / 180)),
            (meterDimensions.length / 3) * Math.sin((315) * (Math.PI / 180))],
        [(meterDimensions.length / 3) * Math.cos((45) * (Math.PI / 180)),
            (meterDimensions.length / 3) * Math.sin((45) * (Math.PI / 180))],
        [0, 0],
        [(meterDimensions.length / 3) * Math.cos((135) * (Math.PI / 180)),
            (meterDimensions.length / 3) * Math.sin((135) * (Math.PI / 180))],
        [(meterDimensions.length / 3) * Math.cos((225) * (Math.PI / 180)),
            (meterDimensions.length / 3) * Math.sin((225) * (Math.PI / 180))],
    ];
    this.models = {
        meter: {
            models: {
                outerBox: new makerjs.models.Square(meterDimensions.length),
                meterLabel: new makerjs.models.ConnectTheDots(false, meterLabelPoints),
            },
            paths: {
                innerCircle: new makerjs.paths.Circle(meterDimensions.length / 2),
            },
        },
        text: textObject,
    };
    makerjs.model.center(this.models.meter.models.outerBox);

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;

    this.outputs = [[meterDimensions.length / 2, 0]];
    this.inputs = [[-meterDimensions.length / 2, 0]];
}

export function CircleComponent(radius, font, text) {
    this.models = {};
    this.paths = {};

    // this.models.textObject = new makerjs.models.Text(font, text, TEXT_SIZE);
    // makerjs.model.center(this.models.textObject);
    this.models.textObject = new CaptionText(text, [[0, 0], [0, 0]]);
    this.paths.component = new makerjs.paths.Circle(TEXT_SIZE);
}

export function Grid(font, scale = 1, returnSVG = false) {
    this.origin = [0, 0];
    const gridBoxDimensions = {
        length: scale * 20,
        textSize: scale * TEXT_SIZE,
    };

    // const textObject = new makerjs.models.Text(font, 'GRID', gridBoxDimensions.textSize);
    // makerjs.model.center(textObject);
    // const textExtents = makerjs.measure.modelExtents(textObject);
    // makerjs.model.moveRelative(
    //     textObject,
    //     [0, -(gridBoxDimensions.length / 2) - (textExtents.height / 2) - 1],
    // );
    this.text = [];
    const textObject = new CaptionText('Grid', [[0, 0], [0, 0]]);
    makerjs.model.moveRelative(
        textObject,
        [0, -(gridBoxDimensions.length / 2) - 2],
    );
    this.text.push({
        label: 'Grid',
        // position: [0, -(gridBoxDimensions.length / 2) - 2],
        position: [0, -(gridBoxDimensions.length / 2) - (TEXT_SIZE / 2) - 1],
    });
    const points = [
        [(gridBoxDimensions.length / 2) * 0.9, (gridBoxDimensions.length) * 0],
        [(gridBoxDimensions.length / 2) * 0.7, (gridBoxDimensions.length) * 0.4],
        [(gridBoxDimensions.length / 2) * 0.6, (gridBoxDimensions.length) * 0.9],
        [(gridBoxDimensions.length / 2) * 0.4, (gridBoxDimensions.length) * 0.9],
        [(gridBoxDimensions.length / 2) * 0.3, (gridBoxDimensions.length) * 0.4],
        [(gridBoxDimensions.length / 2) * 0.1, (gridBoxDimensions.length) * 0],
    ];

    const wirePoints = [
        [(gridBoxDimensions.length / 2) * 0.9, (gridBoxDimensions.length) * 0],
        [(gridBoxDimensions.length / 2) * 0.2, (gridBoxDimensions.length) * 0.3],
        [(gridBoxDimensions.length / 2) * 0.65, (gridBoxDimensions.length) * 0.6],
        [(gridBoxDimensions.length / 2) * 0.35, (gridBoxDimensions.length) * 0.6],
        [(gridBoxDimensions.length / 2) * 0.8, (gridBoxDimensions.length) * 0.3],
        [(gridBoxDimensions.length / 2) * 0.1, (gridBoxDimensions.length) * 0],
    ];

    this.models = {
        tower: {
            models: {
                tower: new makerjs.models.ConnectTheDots(false, points),
                towerWire: new makerjs.models.ConnectTheDots(false, wirePoints),
            },
            paths: {
                antenna1: new makerjs.paths.Line(
                    [(gridBoxDimensions.length / 2) * 0.25, (gridBoxDimensions.length) * 0.6],
                    [(gridBoxDimensions.length / 2) * 0.75, (gridBoxDimensions.length) * 0.6],
                ),
                antenna2: new makerjs.paths.Line(
                    [(gridBoxDimensions.length / 2) * 0.1, (gridBoxDimensions.length) * 0.3],
                    [(gridBoxDimensions.length / 2) * 0.9, (gridBoxDimensions.length) * 0.3],
                ),
            },
        },
        box: {
            models: {
                outerBox: new makerjs.models.Rectangle(
                    gridBoxDimensions.length / 2,
                    gridBoxDimensions.length,
                ),
            },
        },
        text: textObject,
    };
    makerjs.model.center(this.models.box.models.outerBox);
    makerjs.model.center(this.models.tower);

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;

    this.outputs = [[(gridBoxDimensions.length / 4), 0]];
    this.inputs = [[-(gridBoxDimensions.length / 4), 0]];
}

export function GenerateBreaker(radius) {
    this.origin = [0, 0];
    this.models = {
        breaker: {
            models: {
                i_o: new makerjs.models.BoltCircle(radius, radius / 2, 2),
            },
            paths: {
                switchWire: new makerjs.paths.Arc([0, 0], radius, 45, 135),
            },
        },
    };
}

export function ParallelBreakers(
    radius, totalBreakers, spacing,
    combined = false, font,
) {
    this.origin = [0, 0];
    this.models = {};
    this.paths = {};
    let toGenerate;
    if (combined) {
        toGenerate = totalBreakers > 1 ? 2 : totalBreakers;
    }
    else {
        toGenerate = totalBreakers;
    }
    for (let i = 0; i < toGenerate; i += 1) {
        const breaker = new GenerateBreaker(radius);
        makerjs.model.moveRelative(breaker, [0, i * spacing]);
        this.models[`breaker${i}`] = breaker;
    }

    if (combined && toGenerate > 1) {
        const bBox0 = makerjs.measure.modelExtents(this.models.breaker0);
        const bBox1 = makerjs.measure.modelExtents(this.models.breaker1);

        // this.models.textObject =
        //    new makerjs.models.Text(font, `${totalBreakers}`, TEXT_SIZE, false, true);
        // makerjs.model.move(
        //     this.models.textObject,
        //     [bBox0.low[0], (bBox1.low[1] - bBox0.high[1]) / 2],
        // );
        const incFactor = (bBox1.low[1] - bBox0.high[1]) / 3;
        for (let i = 1; i <= 3; i += 1) {
            const s = [bBox0.center[0], bBox0.high[1] + (radius / 3) + ((i - 1) * incFactor)];
            const e = [bBox0.center[0], bBox0.high[1] + (i * incFactor)];
            this.paths[`line${i}`] = new makerjs.paths.Line(s, e);
        }
    }
}

// TODO: might be useful in future.
// export function LTPanel(
//     radius = 1, totalBreakers = 6, spacing = 8, padding = 2,
//     combineBreakers = false, font,
// ) {
//     this.models = {};
//     this.paths = {};
//     this.models.parallelBreakers = new ParallelBreakers(
//         radius, totalBreakers,
//         spacing, combineBreakers, font,
//     );
//     makerjs.model.center(this.models.parallelBreakers);
//     const boxExtents = makerjs.measure.modelExtents(this.models.parallelBreakers);
//     let toGenerate;
//     if (combineBreakers) {
//         toGenerate = totalBreakers > 1 ? 2 : totalBreakers;
//     }
//     else {
//         toGenerate = totalBreakers;
//     }
//     for (let i = 0; i < toGenerate; i += 1) {
//         this.paths[`paddedLine${i}`] = new makerjs.paths.Line(
//             [boxExtents.high[0], boxExtents.high[1] - (i * spacing) - radius],
//             [boxExtents.high[0] + padding, boxExtents.high[1] - (i * spacing) - radius],
//         );
//         this.paths[`connectionWire${i}`] = new makerjs.paths.Line(
//             [boxExtents.high[0] + padding, boxExtents.high[1] - ((i - 1) * spacing) - radius],
//             [boxExtents.high[0] + padding, boxExtents.high[1] - (i * spacing) - radius],
//         );
//     }
//     this.paths.inputWire = new makerjs.paths.Line(
//         [boxExtents.low[0], boxExtents.high[1] - ((toGenerate - 1) * spacing) - radius],
//         [
//             boxExtents.low[0] - (3 * padding),
//             boxExtents.high[1] - ((toGenerate - 1) * spacing) - radius,
//         ],
//     );
//     this.paths.outputWire = new makerjs.paths.Line(
//         [boxExtents.high[0] + padding, boxExtents.high[1] - ((-1) * spacing) - radius],
//         [boxExtents.high[0] + (3 * padding), boxExtents.high[1] - ((-1) * spacing) - radius],
//     );
//     this.models.outerBox = new makerjs.models.Rectangle(
//         boxExtents.width + (6 * padding),
//         boxExtents.height + (2 * spacing),
//     );
//     makerjs.model.center(this.models.outerBox);
//     makerjs.model.moveRelative(this.models.outerBox, [0, (spacing - radius) / 2]);
//     const outerBoxExtents = makerjs.measure.modelExtents(this.models.outerBox);

//     // this.models.textObject = new makerjs.models.Text(font, 'LT Panel', TEXT_SIZE);
//     // makerjs.model.center(this.models.textObject);
//     // const textExtents = makerjs.measure.modelExtents(this.models.textObject);
//     // makerjs.model.moveRelative(
//     //     this.models.textObject,
//     //     [
//     //         0,
//     //         ((spacing - radius) / 2)
//     //         - (outerBoxExtents.height / 2)
//     //         - (textExtents.height / 2) - 1,
//     //     ],
//     // );
//     this.text = [];
//     this.models.textObject = new CaptionText('LT Panel', [[0, 0], [0, 0]]);
//     makerjs.model.moveRelative(
//         this.models.textObject,
//         [0, ((spacing - radius) / 2) - (outerBoxExtents.height / 2) - 2],
//     );
//     this.text.push({
//         label: 'LT Panel',
//         position: [0, ((spacing - radius) / 2) - (outerBoxExtents.height / 2) - 2],
//     });

//     this.outputs = [this.paths.outputWire.end];
//     this.inputs = [this.paths.inputWire.end];
// }

export function LTPanel(
    radius, totalBreakers, spacing,
    padding, font,
) {
    this.models = {};
    this.paths = {};
    this.models.parallelBreakers = new ParallelBreakersWithWires(
        radius, totalBreakers, spacing,
        padding, font, true,
    );
    makerjs.model.center(this.models.parallelBreakers);
    const boxExtents = makerjs.measure.modelExtents(this.models.parallelBreakers);
    this.models.outerBox = new makerjs.models.Rectangle(
        boxExtents.width + (2 * padding),
        boxExtents.height + (2 * padding),
    );
    makerjs.model.center(this.models.outerBox);
    const outerBoxExtents = makerjs.measure.modelExtents(this.models.outerBox);

    // this.models.textObject = new makerjs.models.Text(font, 'LT Panel', TEXT_SIZE);
    // makerjs.model.center(this.models.textObject);
    // const textExtents = makerjs.measure.modelExtents(this.models.textObject);
    // makerjs.model.moveRelative(
    //     this.models.textObject,
    //     [0,
    // ((spacing - radius) / 2) - (outerBoxExtents.height / 2)- (textExtents.height / 2) - 1],
    // );

    this.text = [];
    this.models.textObject = new CaptionText('LT Panel', [[0, 0], [0, 0]]);
    makerjs.model.moveRelative(
        this.models.textObject,
        [0, -(outerBoxExtents.height / 2) - 2],
    );
    this.text.push({
        label: 'LT Panel',
        position: [0, -(outerBoxExtents.height / 2) - (TEXT_SIZE / 2) - 1],
    });

    this.inputs = [];
    this.outputs = [];

    this.outputs.push([
        boxExtents.high[0],
        boxExtents.center[1],
    ]);

    this.inputs.push([
        this.models.parallelBreakers.paths[`inputWire${totalBreakers.length - 1}`].end[0] + this.models.parallelBreakers.origin[0],
        this.models.parallelBreakers.paths[`inputWire${totalBreakers.length - 1}`].end[1] + this.models.parallelBreakers.origin[1],
    ]);
}

function AcDisconnectComponents(font, spacing, radius, meterDimension) {
    this.models = {};
    this.paths = {};
    this.text = [];

    this.models.breaker0 = new GenerateBreaker(radius);
    makerjs.model.rotate(this.models.breaker0, -90);
    const breaker0Extents = makerjs.measure.modelExtents(this.models.breaker0);

    const topYPos = (breaker0Extents.high[1] + spacing);
    const bottomYPos = (breaker0Extents.low[1] - spacing);

    this.models.breaker1 = new GenerateBreaker(radius);
    makerjs.model.moveRelative(this.models.breaker1, [spacing, topYPos]);
    const breaker1Extents = makerjs.measure.modelExtents(this.models.breaker1);

    this.models.subMeter = new Meter(font, meterDimension);
    makerjs.model.rotate(this.models.subMeter, -90);
    makerjs.model.moveRelative(this.models.subMeter, [spacing, bottomYPos]);
    const subMeterExtents = makerjs.measure.modelExtents(this.models.subMeter);

    this.models.rComponent = new CircleComponent(radius, font, 'R');
    // makerjs.model.rotate(this.models.rComponent, -90);
    makerjs.model.moveRelative(
        this.models.rComponent,
        [breaker1Extents.high[0] + spacing, topYPos],
    );
    this.text.push({
        label: 'R',
        position: [
            breaker1Extents.high[0] + spacing,
            topYPos,
        ],
    });
    const rComponentExtents = makerjs.measure.modelExtents(this.models.rComponent);

    this.models.yComponent = new CircleComponent(radius, font, 'Y');
    // makerjs.model.rotate(this.models.yComponent, -90);
    makerjs.model.moveRelative(
        this.models.yComponent,
        [rComponentExtents.high[0] + spacing, topYPos],
    );
    this.text.push({
        label: 'Y',
        position: [
            rComponentExtents.high[0] + spacing,
            topYPos,
        ],
    });
    const yComponentExtents = makerjs.measure.modelExtents(this.models.yComponent);

    this.models.bComponent = new CircleComponent(radius, font, 'B');
    // makerjs.model.rotate(this.models.bComponent, -90);
    makerjs.model.moveRelative(
        this.models.bComponent,
        [yComponentExtents.high[0] + spacing, topYPos],
    );
    this.text.push({
        label: 'B',
        position: [
            yComponentExtents.high[0] + spacing,
            topYPos,
        ],
    });
    const bComponentExtents = makerjs.measure.modelExtents(this.models.bComponent);

    // generate M
    const mPath = [
        [0 + (radius / 3), subMeterExtents.high[1]],
        [0 - (2 * (radius / 3)), (bottomYPos + subMeterExtents.high[1]) / 2],
        [0 + (radius / 3), bottomYPos],
        [0 - (2 * (radius / 3)), (bottomYPos + subMeterExtents.low[1]) / 2],
        [0 + (radius / 3), subMeterExtents.low[1]],
    ];
    this.models.M = new makerjs.models.ConnectTheDots(false, mPath);

    // Internal Connections
    this.paths.input = new makerjs.paths.Line([0, breaker0Extents.high[1]], [0, 2 * spacing]);
    this.paths.output = new makerjs.paths.Line([0, breaker0Extents.low[1]], [0, -(2 * spacing)]);

    this.paths.line1 = new makerjs.paths.Line([0, topYPos], [breaker1Extents.low[0], topYPos]);
    this.paths.line2 = new makerjs.paths.Line(
        [0, bottomYPos],
        [subMeterExtents.low[0], bottomYPos],
    );

    this.paths.line3 = new makerjs.paths.Line(
        [breaker1Extents.high[0], topYPos],
        [rComponentExtents.low[0], topYPos],
    );
    this.paths.line4 = new makerjs.paths.Line(
        [rComponentExtents.high[0], topYPos],
        [yComponentExtents.low[0], topYPos],
    );
    this.paths.line5 = new makerjs.paths.Line(
        [yComponentExtents.high[0], topYPos],
        [bComponentExtents.low[0], topYPos],
    );
}

export function GenerateAcDisconnectBox(
    font, spacing, radius,
    meterDimension, returnSVG = true,
) {
    this.models = {};
    const boxComponents = new AcDisconnectComponents(font, spacing, radius, meterDimension);
    makerjs.model.center(boxComponents);
    makerjs.model.rotate(boxComponents, 90);
    this.models.components = boxComponents;

    const componentExtents = makerjs.measure.modelExtents(this.models.components);

    this.models.outerBox = new makerjs.models.Rectangle(
        componentExtents.width + spacing,
        componentExtents.height + spacing,
    );
    makerjs.model.center(this.models.outerBox);
    const boxExtents = makerjs.measure.modelExtents(this.models.outerBox);

    // this.models.textObject = new makerjs.models.Text(font, 'AC DISCONNECT BOX', TEXT_SIZE);
    // makerjs.model.center(this.models.textObject);
    // const textExtents = makerjs.measure.modelExtents(this.models.textObject);
    // makerjs.model.moveRelative(
    //     this.models.textObject,
    //     [0, -(boxExtents.height / 2) - (textExtents.height / 2) - 1],
    // );

    this.models.textObject = new CaptionText('AC Disconnect Box', [[0, 0], [0, 0]]);
    makerjs.model.moveRelative(
        this.models.textObject,
        [0, -(boxExtents.height / 2) - 2],
    );

    this.text = [];
    for (let i = 0; i < 3; i += 1) {
        this.text.push({
            label: this.models.components.text[i].label,
            position: [
                -(this.models.components.text[i].position[1] + this.models.components.origin[1]),
                this.models.components.text[i].position[0] + this.models.components.origin[0],
            ],
        });
    }
    this.text.push({
        label: 'AC Disconnect Box',
        // position: [0, -(boxExtents.height / 2) - 2],
        position: [0, -(boxExtents.height / 2) - (TEXT_SIZE / 2) - 1],

    });

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;

    this.inputs = [[
        this.models.components.paths.input.end[0] + this.models.components.origin[0],
        this.models.components.paths.input.end[1] + this.models.components.origin[1],
    ]];

    this.outputs = [[
        this.models.components.paths.output.end[0] + this.models.components.origin[0],
        this.models.components.paths.output.end[1] + this.models.components.origin[1],
    ]];
}

export function MeasureBox(meterDimension) {
    this.origin = [0, 0];
    const meterDimensions = {
        length: meterDimension,
    };
    const boxArtPoints = [
        [(meterDimensions.length / 2) + (meterDimensions.length / 3), meterDimensions.length],
        [(meterDimensions.length / 2) + (meterDimensions.length / 3), meterDimensions.length / 3],
        [
            -(meterDimensions.length / 2) - (meterDimensions.length / 3),
            -(meterDimensions.length / 3),
        ],
        [-(meterDimensions.length / 2) - (meterDimensions.length / 3), -meterDimensions.length],
    ];
    this.models = {
        meter: {
            models: {
                outerBox: new makerjs.models.Rectangle(
                    meterDimensions.length,
                    meterDimensions.length * 2,
                ),
                boxArt: new makerjs.models.ConnectTheDots(false, boxArtPoints),
            },
        },
    };
    makerjs.model.center(this.models.meter.models.outerBox);
}

export function CoupledBreakers(radius, totalBreakers, spacing, font) {
    this.origin = [0, 0];
    this.models = {};
    for (let i = 0; i < totalBreakers.length; i += 1) {
        const combinedBreaker =
            new ParallelBreakers(radius, totalBreakers[i], spacing / 2, true, font);
        this.models[`combinedBreaker${i}`] = combinedBreaker;

        if ((totalBreakers[i] > 1 && totalBreakers.length > 1) ||
            (totalBreakers[i] === 1 && totalBreakers.length === 1)) {
            makerjs.model.moveRelative(combinedBreaker, [0, i * (-spacing)]);
        }
        else if ((totalBreakers[i] > 1 && totalBreakers.length === 1)) {
            makerjs.model.moveRelative(combinedBreaker, [0, -spacing / 2]);
        }
        else if ((totalBreakers[i] === 1 && totalBreakers.length > 1)) {
            makerjs.model.moveRelative(combinedBreaker, [0, (i * (-spacing) * 1) + (spacing / 2)]);
        }
    }
}

export function ParallelBreakersWithWires(
    radius, totalBreakers, spacing,
    padding, font, singleInput = false,
) {
    this.origin = [0, 0];
    this.models = {};
    this.paths = {};
    this.text = [];
    this.models.seriesBreaker = new CoupledBreakers(radius, totalBreakers, spacing, font);

    const boxExtents = makerjs.measure.modelExtents(this.models.seriesBreaker);
    for (let i = 0; i < totalBreakers.length; i += 1) {
        if (totalBreakers[i] > 1 && !singleInput) {
            // const text =
            //    new makerjs.models.Text(font, `${totalBreakers[i]}`, TEXT_SIZE, false, true);
            // makerjs.model.center(text);
            // makerjs.model.move(
            //     text,
            //     [boxExtents.low[0] - padding, boxExtents.high[1] - ((i + 0.45) * spacing)],
            // );
            const textObj = new CaptionText(`${totalBreakers[i]}`, [[0, 0], [0, 0]]);
            makerjs.model.move(
                textObj,
                [boxExtents.low[0] - padding, boxExtents.high[1] - ((i + 0.45) * spacing)],
            );
            this.models[`textObject${i}`] = textObj;

            this.text.push({
                label: `${totalBreakers[i]}`,
                position: [
                    boxExtents.low[0] - padding,
                    boxExtents.high[1] - ((i + 0.45) * spacing),
                ],
            });
        }

        this.paths[`paddedLine${i}`] = new makerjs.paths.Line(
            [boxExtents.high[0], boxExtents.high[1] - (i * spacing) - radius],
            [boxExtents.high[0] + padding, boxExtents.high[1] - (i * spacing) - radius],
        );
        if (!singleInput) {
            this.paths[`inputWire${i}`] = new makerjs.paths.Line(
                [boxExtents.low[0], boxExtents.high[1] - ((i) * spacing) - radius],
                [boxExtents.low[0] - (2 * padding), boxExtents.high[1] - ((i) * spacing) - radius],
            );
        }
        if ((i + 1) < totalBreakers.length) {
            this.paths[`connectionWire${i}`] = new makerjs.paths.Line(
                [boxExtents.high[0] + padding, boxExtents.high[1] - ((i) * spacing) - radius],
                [boxExtents.high[0] + padding, boxExtents.high[1] - ((i + 1) * spacing) - radius],
            );
        }
    }
    const ip = totalBreakers.length - 1;
    if (singleInput) {
        this.paths[`inputWire${ip}`] = new makerjs.paths.Line(
            [boxExtents.low[0], boxExtents.high[1] - ((ip) * spacing) - radius],
            [boxExtents.low[0] - (2 * padding), boxExtents.high[1] - ((ip) * spacing) - radius],
        );
    }
}

export function AcCombinerComponents(
    radius, meterDimension, font,
    totalBreakers, spacing, padding,
) {
    this.origin = [0, 0];
    this.models = {};
    this.paths = {};
    this.text = [];

    this.models.seriesBreaker = new ParallelBreakersWithWires(
        radius, totalBreakers,
        spacing, padding, font,
    );
    if (totalBreakers.length > 1) {
        makerjs.model.center(this.models.seriesBreaker);
    }
    makerjs.model.rotate(this.models.seriesBreaker, -90);
    makerjs.model.moveRelative(this.models.seriesBreaker, [0, 2 * spacing]);
    const seriesBreakerExtents = makerjs.measure.modelExtents(this.models.seriesBreaker);

    this.models.breaker0 = new GenerateBreaker(radius);
    makerjs.model.rotate(this.models.breaker0, -90);
    const breaker0Extents = makerjs.measure.modelExtents(this.models.breaker0);

    const topYPos = (breaker0Extents.high[1] + seriesBreakerExtents.low[1]) / 2;
    this.models.breaker1 = new GenerateBreaker(radius);
    makerjs.model.moveRelative(
        this.models.breaker1,
        [spacing / 2, topYPos],
    );
    const breaker1Extents = makerjs.measure.modelExtents(this.models.breaker1);

    this.models.measureBox = new MeasureBox(meterDimension);
    makerjs.model.moveRelative(
        this.models.measureBox,
        [meterDimension + (spacing / 2), (breaker0Extents.low[1] - (1 * spacing))],
    );
    const measureBoxExtents = makerjs.measure.modelExtents(this.models.measureBox);

    this.models.rComponent = new CircleComponent(radius, font, 'R');
    // makerjs.model.rotate(this.models.rComponent, -90);
    makerjs.model.moveRelative(
        this.models.rComponent,
        [breaker1Extents.high[0] + (0.5 * spacing), topYPos],
    );
    this.text.push({
        label: 'R',
        position: [
            breaker1Extents.high[0] + (0.5 * spacing),
            topYPos,
        ],
    });
    const rComponentExtents = makerjs.measure.modelExtents(this.models.rComponent);

    this.models.yComponent = new CircleComponent(radius, font, 'Y');
    // makerjs.model.rotate(this.models.yComponent, -90);
    makerjs.model.moveRelative(
        this.models.yComponent,
        [rComponentExtents.high[0] + (0.5 * spacing), topYPos],
    );
    this.text.push({
        label: 'Y',
        position: [
            rComponentExtents.high[0] + (0.5 * spacing),
            topYPos,
        ],
    });
    const yComponentExtents = makerjs.measure.modelExtents(this.models.yComponent);

    this.models.bComponent = new CircleComponent(radius, font, 'B');
    // makerjs.model.rotate(this.models.bComponent, -90);
    makerjs.model.moveRelative(
        this.models.bComponent,
        [yComponentExtents.high[0] + (0.5 * spacing), topYPos],
    );
    this.text.push({
        label: 'B',
        position: [
            yComponentExtents.high[0] + (0.5 * spacing),
            topYPos,
        ],
    });
    const bComponentExtents = makerjs.measure.modelExtents(this.models.bComponent);

    // Internal Connections
    this.paths.line1 =
        new makerjs.paths.Line([0, breaker0Extents.high[1]], [0, seriesBreakerExtents.low[1]]);
    this.paths.output = new makerjs.paths.Line(
        [0, breaker0Extents.low[1]],
        [0, measureBoxExtents.low[1] - (spacing / 2)],
    );

    this.paths.line3 = new makerjs.paths.Line(
        [0, topYPos],
        [breaker1Extents.low[0], topYPos],
    );
    this.paths.line4 = new makerjs.paths.Line(
        [breaker1Extents.high[0], topYPos],
        [rComponentExtents.low[0], topYPos],
    );
    this.paths.line5 = new makerjs.paths.Line(
        [rComponentExtents.high[0], topYPos],
        [yComponentExtents.low[0], topYPos],
    );
    this.paths.line6 = new makerjs.paths.Line(
        [yComponentExtents.high[0], topYPos],
        [bComponentExtents.low[0], topYPos],
    );

    this.paths.line7 = new makerjs.paths.Line(
        [0, (breaker0Extents.low[1] + measureBoxExtents.high[1]) / 2],
        [measureBoxExtents.center[0], (breaker0Extents.low[1] + measureBoxExtents.high[1]) / 2],
    );
    this.paths.line8 = new makerjs.paths.Line(
        [measureBoxExtents.center[0], (breaker0Extents.low[1] + measureBoxExtents.high[1]) / 2],
        [measureBoxExtents.center[0], (measureBoxExtents.high[1])],
    );
    this.paths.line9 = new makerjs.paths.Line(
        [measureBoxExtents.center[0], measureBoxExtents.low[1]],
        [measureBoxExtents.center[0], measureBoxExtents.low[1] - (spacing / 2)],
    );
}

export function GenerateAcCombinerPanel(
    radius, meterDimension, font, totalBreakers,
    spacing, padding, returnSVG = true, scale = 1,
) {
    this.origin = [0, 0];
    const parameters = {
        radius: scale * radius,
        meterDimension: scale * meterDimension,
        spacing: scale * spacing,
        padding: scale * padding,
    };
    this.models = {};
    this.paths = {};
    this.models.acBox = new AcCombinerComponents(
        parameters.radius, parameters.meterDimension, font,
        totalBreakers, parameters.spacing, parameters.padding,
    );
    makerjs.model.center(this.models.acBox);
    makerjs.model.rotate(this.models.acBox, 90);

    const boxExtents = makerjs.measure.modelExtents(this.models.acBox);
    this.models.outerBox =
        new makerjs.models.Rectangle(boxExtents.width, boxExtents.height + spacing);
    makerjs.model.center(this.models.outerBox);

    // this.models.textObject = new makerjs.models.Text(font, 'AC COMBINER PANEL', TEXT_SIZE);
    // makerjs.model.center(this.models.textObject);
    // const textExtents = makerjs.measure.modelExtents(this.models.textObject);
    // makerjs.model.moveRelative(
    //     this.models.textObject,
    //     [0, -((boxExtents.height + spacing) / 2) - (textExtents.height / 2) - 1],
    // );

    this.models.textObject = new CaptionText('AC combiner panel', [[0, 0], [0, 0]]);
    makerjs.model.moveRelative(
        this.models.textObject,
        [0, -((boxExtents.height + spacing) / 2) - 2],
    );
    this.text = [];
    for (let i = 0, j = 0; i < totalBreakers.length; i += 1) {
        if (totalBreakers[i] > 1) {
            this.text.push({
                label: this.models.acBox.models.seriesBreaker.text[j].label,
                position: [
                    this.models.acBox.models.seriesBreaker.paths[`inputWire${i}`].end[0] +
                    this.models.acBox.models.seriesBreaker.origin[0] + this.models.acBox.origin[0]
                    + (1.1 * padding),
                    (this.models.acBox.models.seriesBreaker.paths[`inputWire${i}`].end[1] +
                    this.models.acBox.models.seriesBreaker.origin[1] + this.models.acBox.origin[1])
                    - (spacing / 4),
                ],
            });
            j += 1;
        }
    }

    for (let i = 0; i < 3; i += 1) {
        this.text.push({
            label: this.models.acBox.text[i].label,
            position: [
                -(this.models.acBox.text[i].position[1] + this.models.acBox.origin[1]),
                this.models.acBox.text[i].position[0] + this.models.acBox.origin[0],
            ],
        });
    }
    this.text.push({
        label: 'AC Combiner Panel',
        position: [0, -((boxExtents.height + spacing) / 2) - (TEXT_SIZE / 2) - 1],

    });

    this.svg = (returnSVG) ?
        makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
    this.outputs = [];
    this.outputs.push([
        this.models.acBox.paths.output.end[0] + this.models.acBox.origin[0],
        this.models.acBox.paths.output.end[1] + this.models.acBox.origin[1],
    ]);
    this.inputs = [];
    for (let i = 0; i < totalBreakers.length; i += 1) {
        this.inputs.push([
            this.models.acBox.models.seriesBreaker.paths[`inputWire${i}`].end[0] +
            this.models.acBox.models.seriesBreaker.origin[0] + this.models.acBox.origin[0],
            this.models.acBox.models.seriesBreaker.paths[`inputWire${i}`].end[1] +
            this.models.acBox.models.seriesBreaker.origin[1] + this.models.acBox.origin[1],
        ]);
    }
}

/*
*   Draws a switch
*/
// TODO: This way of writing parameters is really useless, do something like object.assign or something. Do this everywhere
export function Switch({ scale, returnSVG } = {
    scale: 1,
    returnSVG: true,
}) {
    this.origin = [0, 0];
    const presentationConfig = {
        circleRadius: 8 * scale,
        lineWidth: 100 * scale,
        switchEndHeight: 20 * scale,
        textBezierAccuracy: Infinity,
    };

    this.paths = {
        leftCircle: makerjs.path.move(new makerjs.paths.Circle(presentationConfig.circleRadius), [
            presentationConfig.circleRadius, presentationConfig.circleRadius + presentationConfig.switchEndHeight,
        ]),
        rightCircle: makerjs.path.move(new makerjs.paths.Circle(presentationConfig.circleRadius), [
            presentationConfig.circleRadius * 3 + presentationConfig.lineWidth,
            presentationConfig.circleRadius + presentationConfig.switchEndHeight,
        ]),
        line: new makerjs.paths.Line(
            [presentationConfig.circleRadius * 2, presentationConfig.circleRadius + presentationConfig.switchEndHeight],
            [presentationConfig.circleRadius + presentationConfig.lineWidth + presentationConfig.circleRadius, (presentationConfig.switchEndHeight * 2) + presentationConfig.circleRadius],
        ),
    };

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height + presentationConfig.switchEndHeight];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;

    // TODO: Rename standard input and output
    this.outputs = {
        standardOutput: {
            position: [presentationConfig.circleRadius * 4 + presentationConfig.lineWidth, presentationConfig.circleRadius + presentationConfig.switchEndHeight],
        },
    };
    this.inputs = {
        standardInput: {
            position: [0, presentationConfig.circleRadius + presentationConfig.switchEndHeight],
        },
    };
}

/*
*   Draws a group of strings
*/
function TextBox({
    font, scale, text, returnSVG, rotation, initPoint, finalPoint,
} = {}) {
    this.origin = [0, 0];

    const presentationConfig = {
        textSize: TEXT_SIZE * 10,
        textMargin: 10 * scale,
        textBezierAccuracy: Infinity,
        boxWidth: 50,
    };

    this.models = {
        textModel:
        // makerjs.model.rotate(
            // new makerjs.models.Text(font, text, presentationConfig.textSize, undefined, undefined, presentationConfig.textBezierAccuracy)
            new CaptionText(text, [[presentationConfig.boxWidth / 2 - FONT_HEIGHT / 2, initPoint], [presentationConfig.boxWidth / 2 - FONT_HEIGHT / 2, finalPoint]]),
        // , rotation),
    };

    this.textObjects = [{
        text,
        position: [presentationConfig.boxWidth / 2 - FONT_HEIGHT / 2, (initPoint + finalPoint) / 2],
        rotation: 90,
    }];

    this.paths = {};

    // this.models.box = new makerjs.models.Rectangle(this, presentationConfig.textMargin);
    // TODO:
    this.models.box = new makerjs.models.Rectangle(
        presentationConfig.boxWidth,
        finalPoint,
    );
    // this.models.box.origin = [0, 0];
    // makerjs.model.move(this.models.textModel, [-this.models.box.origin[0], -this.models.box.origin[1]]);
    // makerjs.model.move(this.models.box, [-this.models.box.origin[0], -this.models.box.origin[1]]);
    // this.models.box.origin = [0, 0];

    this.inputs = {};
    this.outputs = {};
    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

/*
*   Draws a DC Disconnect
*/
export function DisconnectAndInverter({
    font, scale, returnSVG, dcDisconnectTitleText, numberOfInputs, showWireLabel, wireLabelText, inverterCapacityBoxText, inverterTitleText, inverterCount,
} = {}) {
    // Using makerjs.model.scale right now. Works a lot better.
    inverterCount = (inverterCount === undefined) ? 100 : inverterCount;
    const presentationConfig = {
        dcDisconnectAndInverterPadding: 400,
        textBezierAccuracy: Infinity,
    };
    this.origin = [0, 0];

    this.models = {
        dcDisconnect: new DCDisconnect({
            font,
            scale: 1,
            returnSVG: false,
            titleText: dcDisconnectTitleText,
            numberOfInputs,
            showWireLabel,
            wireLabelText,
        }),
        inverter: new Inverter({
            font,
            scale: 1,
            capacityBoxText: inverterCapacityBoxText,
            returnSVG: false,
            titleText: inverterTitleText,
            numberOfInputs,
            inverterCount,
        }),
    };
    this.paths = {};
    this.inputs = {};

    makerjs.model.moveRelative(
        this.models.inverter,
        [this.models.dcDisconnect.bounds[0] + presentationConfig.dcDisconnectAndInverterPadding, 0],
    );
    moveOutputs(this.models.inverter, [this.models.dcDisconnect.bounds[0] + presentationConfig.dcDisconnectAndInverterPadding, 0]);

    // TODO: Jugaad solution for now
    this.inputs = this.models.dcDisconnect.inputs;
    this.outputs = this.models.inverter.outputs;
    const inputKeys = Object.keys(this.inputs);
    for (let i = 0; i < inputKeys.length; i += 1) {
        this.inputs[inputKeys[i]].position = [
            this.inputs[inputKeys[i]].position[0] * scale,
            this.inputs[inputKeys[i]].position[1] * scale,
        ];
    }
    this.outputs[Object.keys(this.outputs)[0]].position = [
        this.outputs[Object.keys(this.outputs)[0]].position[0] * scale,
        this.outputs[Object.keys(this.outputs)[0]].position[1] * scale,
    ];

    const inverterBounds = makerjs.measure.modelExtents(this.models.inverter.models.outerBox);
    const disconnectBounds = makerjs.measure.modelExtents(this.models.dcDisconnect.models.outerBox);

    if (inverterBounds.height > disconnectBounds.height) {
        // TODO: 6 is Jugaad
        makerjs.model.moveRelative(
            this.models.dcDisconnect,
            [0, 6 + inverterBounds.low[1] + (inverterBounds.height / 2) - (disconnectBounds.height / 2) - disconnectBounds.low[1]],
        );
        moveInputs(
            this.models.dcDisconnect,
            [
                0,
                this.models.dcDisconnect.origin[1] * scale,
            ],
        );
    }
    else {
        makerjs.model.moveRelative(
            this.models.inverter,
            [0, -6 + disconnectBounds.low[1] + (disconnectBounds.height / 2) - (inverterBounds.height / 2) - inverterBounds.low[1]],
        );
        moveOutputs(
            this.models.inverter,
            [
                0,
                this.models.inverter.origin[1] * scale,
            ],
        );
    }

    this.textObjects = [];
    for (let i = 0; i < this.models.inverter.textObjects.length; i += 1) {
        this.textObjects.push({
            position: [
                this.models.inverter.textObjects[i].position[0] + this.models.inverter.origin[0],
                this.models.inverter.textObjects[i].position[1] + this.models.inverter.origin[1],
            ],
            text: this.models.inverter.textObjects[i].text,
            rotation: this.models.inverter.textObjects[i].rotation,
        });
    }

    for (let i = 0; i < this.models.dcDisconnect.textObjects.length; i += 1) {
        this.textObjects.push({
            position: [
                this.models.dcDisconnect.textObjects[i].position[0] + this.models.dcDisconnect.origin[0],
                this.models.dcDisconnect.textObjects[i].position[1] + this.models.dcDisconnect.origin[1],
            ],
            text: this.models.dcDisconnect.textObjects[i].text,
        });
    }

    for (let i = 0; i < numberOfInputs; i += 1) {
        this.models[`connection${i}`] = getConnectionLineWithPadding(
            this.models.dcDisconnect,
            this.models.inverter,
            this.models.dcDisconnect.outputs[`output${i}`],
            this.models.inverter.inputs[`inputs${i}`],
        );
    }

    makerjs.model.scale(this, scale);

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

/*
*   Draws a DC Disconnect
*/
export function DCDisconnect({
    font, scale, returnSVG, titleText, numberOfInputs, showWireLabel, wireLabelText,
} = {}) {
    const presentationConfig = {
        outerBoxPadding: 25,
        textSize: FONT_HEIGHT * 10,
        textTopPadding: 10,
        ovalRightPadding: 10,
        switchPadding: 100,
        showInputs: false,
        showOutputs: false,
        wireLabelPadding: 20,
        wireLabelEllipseWidth: 40,
        outputConnectionMinPadding: 10,
        outputConnectionMaxPadding: 100,
        inputConnectionPadding: 30,
        textBezierAccuracy: Infinity,
    };
    this.origin = [0, 0];

    this.models = {};
    this.paths = {};

    this.inputs = {};
    this.outputs = {};

    for (let i = 0; i < numberOfInputs; i += 1) {
        const lastSwitchHeight = (i === 0) ? 0 : this.models[`switch${i - 1}`].bounds[1];
        this.models[`switch${i}`] = makerjs.model.move(
            new Switch({ scale, returnSVG }),
            [0, i * (presentationConfig.switchPadding + lastSwitchHeight)],
        );
    }

    this.models.outerBox = new makerjs.models.Rectangle(this, presentationConfig.outerBoxPadding);
    moveMultipleModelsAndPaths(this.models, {}, [-this.models.outerBox.origin[0], -this.models.outerBox.origin[1]]);
    this.models.outerBox.origin = [0, 0];

    const temp = makerjs.measure.modelExtents(this);
    this.bounds = [temp.width, temp.height];

    const paddingValues = getPaddingValues(
        presentationConfig.outputConnectionMinPadding,
        presentationConfig.outputConnectionMaxPadding,
        numberOfInputs,
    );

    for (let i = 0; i < numberOfInputs; i += 1) {
        this.inputs[`input${i}`] = {
            position: [
                -this.models.outerBox.origin[0],
                this.models[`switch${i}`].inputs.standardInput.position[1] + this.models[`switch${i}`].origin[1] + presentationConfig.textSize + presentationConfig.textTopPadding,
            ],
            padding: presentationConfig.inputConnectionPadding,
        };
        this.outputs[`output${i}`] = {
            position: [
                this.bounds[0],
                this.models[`switch${i}`].inputs.standardInput.position[1] + this.models[`switch${i}`].origin[1] + presentationConfig.textSize + presentationConfig.textTopPadding,
            ],
            padding: paddingValues[i],
        };

        // TODO: jugaad
        this.inputs[`input${i}`].position[1] -= presentationConfig.textSize + presentationConfig.textTopPadding;

        this.paths[`inputConnection${i}`] = getConnectionLine(
            this,
            this.models[`switch${i}`],
            this.inputs[`input${i}`],
            this.models[`switch${i}`].inputs.standardInput,
        );

        // TODO: jugaad
        this.inputs[`input${i}`].position[1] += presentationConfig.textSize + presentationConfig.textTopPadding;

        if (presentationConfig.showInputs) {
            this.paths[`inputConnectionPoint${i}`] = makerjs.model.move(new makerjs.paths.Circle(3), this.inputs[`input${i}`].position);
        }

        // TODO: jugaad
        this.outputs[`output${i}`].position[1] -= presentationConfig.textSize + presentationConfig.textTopPadding;

        this.paths[`outputConnection${i}`] = getConnectionLine(
            this.models[`switch${i}`],
            this,
            this.models[`switch${i}`].outputs.standardOutput,
            this.outputs[`output${i}`],
        );

        // TODO: jugaad
        this.outputs[`output${i}`].position[1] += presentationConfig.textSize + presentationConfig.textTopPadding;
        if (presentationConfig.showOutputs) {
            this.paths[`outputConnectionPoint${i}`] = makerjs.model.move(new makerjs.paths.Circle(3), this.outputs[`output${i}`].position);
        }
    }

    moveMultipleModelsAndPaths(this.models, this.paths, [0, presentationConfig.textSize + presentationConfig.textTopPadding]);
    // moveOutputs(this, [0, presentationConfig.textSize + presentationConfig.textTopPadding]);

    this.models.titleText =
    new CaptionText(titleText, [[this.bounds[0] / 2, (FONT_HEIGHT * 10) / 2], [this.bounds[0] / 2, (FONT_HEIGHT * 10) / 2]]);
    // new makerjs.models.Text(font, titleText, presentationConfig.textSize, undefined, undefined, presentationConfig.textBezierAccuracy);
    // placeModelOnCenter(this.models.titleText, this.bounds, true, false);

    this.textObjects = [];

    if (showWireLabel) {
        moveMultipleModelsAndPaths(
            this.models,
            this.paths,
            [presentationConfig.wireLabelEllipseWidth + presentationConfig.wireLabelPadding, 0],
        );
        moveOutputs(
            this,
            [presentationConfig.wireLabelEllipseWidth + presentationConfig.wireLabelPadding, 0],
        );
        moveInputs(
            this,
            [presentationConfig.wireLabelEllipseWidth + presentationConfig.wireLabelPadding, 0],
        );
        const outerRectangleBounds = getBounds(this.models.outerBox);
        const radiusY = ((outerRectangleBounds[3] - outerRectangleBounds[1]) / 2) -
        presentationConfig.wireLabelPadding;
        const firstInputPosition = this.inputs.input0.position[1];
        const lastInputPosition = this.inputs[`input${numberOfInputs - 1}`].position[1];
        const wireLabelPosition = [0, (firstInputPosition + lastInputPosition) / 2 - radiusY];
        this.models.wireLabel = makerjs.model.move(new WireLabel({
            font,
            scale,
            returnSVG,
            labelText: wireLabelText,
            point1: [0, 0],
            point2: [0, 120 * scale],
            point3: [20 * scale, 140 * scale],
            ellipseSizeX: presentationConfig.wireLabelEllipseWidth / 2,
            ellipseSizeY: radiusY,
            textSize: 30 * scale,
        }), wireLabelPosition);

        for (let i = 0; i < this.models.wireLabel.textObjects.length; i += 1) {
            const textObj = this.models.wireLabel.textObjects[i];
            this.textObjects.push({
                text: textObj.text,
                position: [
                    textObj.position[0] + this.models.wireLabel.origin[0],
                    textObj.position[1] + this.models.wireLabel.origin[1],
                ],
            });
        }
    }

    this.textObjects.push({
        text: titleText,
        position: [
            this.bounds[0] / 2 + (presentationConfig.wireLabelEllipseWidth + presentationConfig.wireLabelPadding),
            (FONT_HEIGHT * 10) / 2,
        ],
    });

    // TODO: A bad hack but works
    // this.bounds[0] = getBoundsOfMultipleModels(this.models)[0];

    this.bounds[0] = makerjs.measure.modelExtents(this).width;

    this.svg = (returnSVG) ? makerjs.exporter.toSVG({ models: this.models, paths: this.paths }) : undefined;
}

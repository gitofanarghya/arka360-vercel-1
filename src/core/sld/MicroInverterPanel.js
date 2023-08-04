/* eslint-disable no-mixed-operators */
import * as THREE from 'three';
import * as utils from './utils';
import { microInverterDimensions } from './sldConstants';

export default class MicroInverterPanel {
    constructor(
        origin,
        width = microInverterDimensions.defaultWidth,
        height = microInverterDimensions.defaultHeight,
    ) {
        this.objectsGroup = new THREE.Group();
        this.whiteLines = [];
        this.bluePolyLines = [];
        this.whitePolyLines = [];
        this.dashedPolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.whitesld = [];
        this.white3ld = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
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

        const [x, Y] = origin;
        const inverterboxsize = width / 6;
        const panelPadding = height / 10;
        const smallboxsize = (3 * height) / 80;
        const y = Y + (width / 4) + (height / 5) + smallboxsize;

        this.blueMicroLines.push(...utils.getThreeBox(
            width,
            height,
            new THREE.Vector2(x, y),
        ));

        this.blueMicroPolyLines.push(utils.getThreeBoxPolyLine(
            width,
            height,
            new THREE.Vector2(x, y),
        ));

        this.cutCornerBox({
            width: width - (panelPadding * 2),
            height: height - (panelPadding * 2),
            origin: [x + panelPadding, y + panelPadding],
        });

        this.simpleGrid(
            [x + panelPadding, y + panelPadding],
            width - (panelPadding * 2),
            height - (panelPadding * 2),
        );

        this.MicroInverter(
            [x, y],
            [(width - inverterboxsize) / 2, (3 * inverterboxsize) / 2],
            inverterboxsize,
        );

        const offset = y - ((3 * inverterboxsize) / 2);

        this.purpleLines.push(...utils.getVectorPair(
            [x + (width / 2), offset],
            [x + (width / 2), offset - (height / 5)],
        ));
        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [x + (width / 2), offset],
            [x + (width / 2), offset - (height / 5)],
        ));

        this.purpleLines.push(...utils.getThreeBox(
            smallboxsize,
            smallboxsize,
            new THREE.Vector2(
                x + ((width - smallboxsize) / 2),
                offset - (height / 5) - smallboxsize,
            ),
        ));
        this.purplePolyLines.push(utils.getThreeBoxPolyLine(
            smallboxsize,
            smallboxsize,
            new THREE.Vector2(
                x + ((width - smallboxsize) / 2),
                offset - (height / 5) - smallboxsize,
            ),
        ));
        this.objectsGroup.add(utils.getDashedLine(
            [x + (width - (panelPadding * 2)), y],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
            'green',
        ));
        this.objectsGroup.add(utils.getDashedLine(
            [x + (width / 2), offset - (height / 10)],
            [x + (width / 2) + (inverterboxsize / 4), offset],
            'green',
        ));
        this.objectsGroup.add(utils.getDashedLine(
            [x + (width / 2) + (inverterboxsize / 4), offset],
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
            'green',
        ));
        this.objectsGroup.add(utils.getDashedLine(
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
            'green',
        ));
        this.dashedLines.push(...utils.getVectorPair(
            [x + (width - (panelPadding * 2)), y],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
        ));

        this.dashedLines.push(...utils.getVectorPair(
            [x + (width / 2), offset - (height / 10)],
            [x + (width / 2) + (inverterboxsize / 4), offset],
        ));
        this.dashedLines.push(...utils.getVectorPair(
            [x + (width / 2) + (inverterboxsize / 4), offset],
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
        ));
        this.dashedLines.push(...utils.getVectorPair(
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
        ));

        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x + (width - (panelPadding * 2)), y],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
        ));

        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x + (width / 2), offset - (height / 10)],
            [x + (width / 2) + (inverterboxsize / 4), offset],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x + (width / 2) + (inverterboxsize / 4), offset],
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
        ));
        this.dashedPolyLines.push(utils.getPolyLineVectorPair(
            [x + (width / 2) + (inverterboxsize / 2), offset - (height / 10)],
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
        ));

        this.greenConnectionPoints = {
            left:
            [x + (width / 2), offset - (height / 10)],
            right:
            [x + (width - (panelPadding * 2)), offset - (height / 10)],
        };
    }

    cutCornerBox({ width, height, origin }) {
        const [x, y] = origin;
        const cut = height / 10;

        this.blueMicroLines.push(
            new THREE.Vector3(x + cut, y),
            new THREE.Vector3(x + (width - cut), y),
            new THREE.Vector3(x + (width - cut), y),
            new THREE.Vector3(x + width, y + cut),
            new THREE.Vector3(x + width, y + cut),
            new THREE.Vector3(x + width, y + (height - cut)),
            new THREE.Vector3(x + width, y + (height - cut)),
            new THREE.Vector3(x + (width - cut), y + height),
            new THREE.Vector3(x + (width - cut), y + height),
            new THREE.Vector3(x + cut, y + height),
            new THREE.Vector3(x + cut, y + height),
            new THREE.Vector3(x, y + (height - cut)),
            new THREE.Vector3(x, y + (height - cut)),
            new THREE.Vector3(x, y + cut),
            new THREE.Vector3(x, y + cut),
            new THREE.Vector3(x + cut, y),
        );

        this.blueMicroPolyLines.push(
            {points: [new THREE.Vector3(x + cut, y),
                new THREE.Vector3(x + (width - cut), y),
                new THREE.Vector3(x + width, y + cut),
                new THREE.Vector3(x + width, y + (height - cut)),
                new THREE.Vector3(x + (width - cut), y + height),
                new THREE.Vector3(x + cut, y + height),
                new THREE.Vector3(x, y + (height - cut)),
                new THREE.Vector3(x, y + cut),
                new THREE.Vector3(x + cut, y),], closed: true}
        );
    }

    simpleGrid(origin, width, height) {
        const [x, y] = origin;
        const offset = height / 10;
        const increment = width / 10;

        let i;
        for (i = offset; i <= height - offset; i += increment) {
            this.whiteLines.push(...utils.getVectorPair([x, y + i], [x + width, y + i]));
            this.whitePolyLines.push(utils.getPolyLineVectorPair([x, y + i], [x + width, y + i]));
        }

        while (i < height) {
            const smallOffset = i - (height - offset);
            this.whiteLines.push(...utils.getVectorPair(
                [x + smallOffset, y + i],
                [x + (width - smallOffset), y + i],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + smallOffset, y + i],
                [x + (width - smallOffset), y + i],
            ));
            i += increment;
        }

        for (i = offset; i <= width - offset; i += increment) {
            this.whiteLines.push(...utils.getVectorPair([x + i, y], [x + i, y + height]));
            this.whitePolyLines.push(utils.getPolyLineVectorPair([x + i, y], [x + i, y + height]));
        }

        while (i < width) {
            const smallOffset = i - (width - offset);
            this.whiteLines.push(...utils.getVectorPair(
                [x + i, y + smallOffset],
                [x + i, y + (height - smallOffset)],
            ));
            this.whitePolyLines.push(utils.getPolyLineVectorPair(
                [x + i, y + smallOffset],
                [x + i, y + (height - smallOffset)],
            ));
            i += increment;
        }
    }

    MicroInverter(panelOrigin, [right, down], size) {
        const [x, y] = panelOrigin;
        this.getInverterBox([x + right, y - down], size);
        this.getPipe(panelOrigin, [x + right, (y - down) + size], size / 5);
    }

    getPipe(origin1, origin2, padding) {
        const [x1, y1] = origin1;
        const [x2, y2] = origin2;
        const boxProperties = {
            height: 2 * padding,
            width: 3 * padding,
            center: {
                x: (x1 + x2) / 2,
                y: y2 - (5 * (padding / 4) + 0.5),
            },
            left: ((x1 + x2) - (3 * padding)) / 2,
            right: ((x1 + x2) + (3 * padding)) / 2,
        };

        const boxProperties2 = {
            height: 2 * padding,
            width: 3 * padding,
            center: {
                x: (x1 + x2) / 2,
                y: y2 - (5 * (padding / 4) - 0.5),
            },
            left: ((x1 + x2) - (3 * padding)) / 2,
            right: ((x1 + x2) + (3 * padding)) / 2,
        };

        this.purpleLines.push(...utils.getVectorPair(
            [x1 + padding, y1],
            [x1 + padding, y2],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [x1 + padding, y1],
            [x1 + padding, y2],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [x1 + (2 * padding), y2 - (3 * (padding / 2))],
            [boxProperties.left + 2, y2 - (3 * (padding / 2))],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [x1 + (2 * padding), y2 - (3 * (padding / 2))],
            [boxProperties.left + 2, y2 - (3 * (padding / 2))],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [boxProperties.right - 2, y2 - (3 * (padding / 2))],
            [x2, y2 - (3 * (padding / 2))],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [boxProperties.right - 2, y2 - (3 * (padding / 2))],
            [x2, y2 - (3 * (padding / 2))],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [x1 + (3 * (padding / 2)), y1],
            [x1 + (3 * (padding / 2)), y2],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [x1 + (3 * (padding / 2)), y1],
            [x1 + (3 * (padding / 2)), y2],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [x1 + (2 * padding), y2 - padding],
            [boxProperties.left + 2, y2 - padding],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [x1 + (2 * padding), y2 - padding],
            [boxProperties.left + 2, y2 - padding],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [boxProperties.right - 2, y2 - padding],
            [x2, y2 - padding],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [boxProperties.right - 2, y2 - padding],
            [x2, y2 - padding],
        ));

        this.purpleLines.push(...utils.getThreeBoxCentered(
            boxProperties.width / 3,
            boxProperties.height / 6,
            boxProperties.center,
        ));

        this.purplePolyLines.push(utils.getThreeBoxCenteredPolyLine(
            boxProperties.width / 3,
            boxProperties.height / 6,
            boxProperties.center,
        ));

        this.purpleLines.push(...utils.getThreeBoxCentered(
            boxProperties2.width / 3,
            boxProperties2.height / 6,
            boxProperties2.center,
        ));

        this.purplePolyLines.push(utils.getThreeBoxCenteredPolyLine(
            boxProperties2.width / 3,
            boxProperties2.height / 6,
            boxProperties2.center,
        ));

        /* this.purpleLines.push(...utils.getVectorPair(
            [boxProperties.left, boxProperties.center.y],
            [boxProperties.right, boxProperties.center.y],
        )); */

        this.purpleLines.push(...utils.getVectorPair(
            [boxProperties.center.x, boxProperties.center.y - (boxProperties.height / 12)],
            [boxProperties.center.x, boxProperties.center.y + (boxProperties.height / 12)],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [boxProperties.center.x, boxProperties.center.y - (boxProperties.height / 12)],
            [boxProperties.center.x, boxProperties.center.y + (boxProperties.height / 12)],
        ));

        this.purpleLines.push(...utils.getVectorPair(
            [boxProperties2.center.x, boxProperties2.center.y - (boxProperties2.height / 12)],
            [boxProperties2.center.x, boxProperties2.center.y + (boxProperties2.height / 12)],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [boxProperties2.center.x, boxProperties2.center.y - (boxProperties2.height / 12)],
            [boxProperties2.center.x, boxProperties2.center.y + (boxProperties2.height / 12)],
        ));

        let curve = new THREE.QuadraticBezierCurve(
            new THREE.Vector2(x1 + padding, y2),
            new THREE.Vector2(x1 + padding, y2 - (3 * (padding / 2))),
            new THREE.Vector2(x1 + (2 * padding), y2 - (3 * (padding / 2))),
        );
        let points = curve.getPoints(10);
        for (let i = 0; i < points.length - 1; i++) {
            this.purpleLines.push(new THREE.Vector3(points[i].x, points[i].y, 0));
            this.purpleLines.push(new THREE.Vector3(points[i + 1].x, points[i + 1].y, 0));
        }
        this.purplePolyLines.push({points: points});

        curve = new THREE.QuadraticBezierCurve(
            new THREE.Vector2(x1 + (3 * (padding / 2)), y2),
            new THREE.Vector2(x1 + (3 * (padding / 2)), y2 - padding),
            new THREE.Vector2(x1 + (2 * padding), y2 - padding),
        );
        points = curve.getPoints(10);
        for (let i = 0; i < points.length - 1; i++) {
            this.purpleLines.push(new THREE.Vector3(points[i].x, points[i].y, 0));
            this.purpleLines.push(new THREE.Vector3(points[i + 1].x, points[i + 1].y, 0));
        }
        this.purplePolyLines.push({points: points});
    }

    getInverterBox(origin, size) {
        const [x, y] = origin;
        this.inverterOrigin = origin;

        this.purpleLines.push(...utils.getThreeBox(
            size,
            size,
            new THREE.Vector2(...origin),
        ));
        this.purplePolyLines.push(utils.getThreeBoxPolyLine(
            size,
            size,
            new THREE.Vector2(...origin),
        ));
        this.purpleLines.push(...utils.getVectorPair([x, y], [x + size, y + size]));
        this.purplePolyLines.push(utils.getPolyLineVectorPair([x, y], [x + size, y + size]));

        const sineCenter = {
            x: x + (3 * (size / 4)),
            y: y + (size / 4),
            size: (size / 4) * 0.8,
        };

        // number of points is 10
        for (let i = 0; i < 50; i++) {
            const [X, Y] = [
                sineCenter.x - (sineCenter.size),
                sineCenter.y,
            ];
            const point = [
                X + (i * (sineCenter.size / 30)),
                Y + (sineCenter.size * (Math.sin(i * (2 * (Math.PI / 50))))),
            ];
            const nextpoint = [
                X + ((i + 1) * (sineCenter.size / 30)),
                Y + (sineCenter.size * (Math.sin((i + 1) * (2 * (Math.PI / 50))))),
            ];
            this.purpleLines.push(...utils.getVectorPair(point, nextpoint));
            this.purplePolyLines.push(utils.getPolyLineVectorPair(point, nextpoint));
        }

        const lineSymbol = {
            x: x + (size / 4),
            y: y + (3 * (size / 4)),
            sizeX: (size / 4) * 0.8,
            sizeY: (size / 8) * 0.8,
        };

        this.purpleLines.push(...utils.getVectorPair(
            [lineSymbol.x - (lineSymbol.sizeX / 2), lineSymbol.y + (lineSymbol.sizeY / 2)],
            [lineSymbol.x + (lineSymbol.sizeX / 2) - 0.13, lineSymbol.y + (lineSymbol.sizeY / 2)],
        ));

        this.purplePolyLines.push(utils.getPolyLineVectorPair(
            [lineSymbol.x - (lineSymbol.sizeX / 2), lineSymbol.y + (lineSymbol.sizeY / 2)],
            [lineSymbol.x + (lineSymbol.sizeX / 2) - 0.13, lineSymbol.y + (lineSymbol.sizeY / 2)],
        ));

        const lineGap = (lineSymbol.sizeX / 3) * 0.2;
        let leftOffset = 0;

        for (let i = 0; i < 3; i++) {
            const [X, Y] = [
                lineSymbol.x - (lineSymbol.sizeX / 2),
                lineSymbol.y - (lineSymbol.sizeY / 2),
            ];
            const point = [
                X + leftOffset,
                Y,
            ];
            const nextpoint = [
                X + leftOffset + ((lineSymbol.sizeX / 3) - lineGap),
                Y,
            ];
            leftOffset += lineGap + ((lineSymbol.sizeX / 3) * 0.8);
            this.purpleLines.push(...utils.getVectorPair(point, nextpoint));
            this.purplePolyLines.push(utils.getPolyLineVectorPair(point, nextpoint));
        }
    }
}

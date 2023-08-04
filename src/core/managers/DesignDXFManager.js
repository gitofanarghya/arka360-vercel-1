/* eslint-disable class-methods-use-this */
import * as dxfjs from '@tarikjabiri/dxf';
import { saveAs } from 'file-saver';
import { roofMapExporter, panelMapExporter } from '../utils/exporters';
import {
    PANEL_COLOR,
    OBSTACLES_COLOR,
    ROOF_COLOR,
    HANDRAIL_COLOR,
    RAILS_COLOR,
    RAFTERS_COLOR,
    AC_CABLE_COLOR,
    SETBACK_COLOR,
    WALKWAY_COLOR,
    SAFETYLINE_COLOR,
    DC_STRING_COLOR,
    MICROINVERTERS_COLOR,
    PROPERTY_COLOR,
    OPTIMIZERS_COLOR,
    PROPERTY_DIMENSION_COLOR,
    ATTACHMENT_COLOR,
    ATTACHMENT_RADIUS,
} from '../coreConstants';
import { getThreeCircleDXF } from '../sld/utils';

export default class DesignDxfManager {
    constructor(stage) {
        this.stage = stage;
        this.dxf = {};
    }

    /**
     * This function is called when the user clicks the export button. It creates a new dxf file
     * object, calls two functions that return data about the panels and roof, and then calls the
     * draw() and addLayers() functions and finally the save().
     * @returns The return value is null.
     */
    exportAsDesignDXF() {
        this.dxf = new dxfjs.DxfWriter();
        this.panelExporterData = panelMapExporter(this.stage);
        this.roofExporterData = roofMapExporter(this.stage);
        this.referenceId = this.stage.getReferenceId();

        this.dxf.setVariable('$ACADVER', { 1: 'AC1015' });
        this.dxf.setUnits(dxfjs.Units.Meters);

        this.draw();
        this.addLayers();
        this.saveDXF();

        return null;
    }

    addLayers() {
        this.dxf.addLayer('MODULE', PANEL_COLOR);
        this.dxf.addLayer('ROOF OBSTRUCTION', OBSTACLES_COLOR);
        this.dxf.addLayer('FIRE SETBACK', SETBACK_COLOR);
        this.dxf.addLayer('walkway_layout', WALKWAY_COLOR);
        this.dxf.addLayer('PV-ROOF', ROOF_COLOR);
        this.dxf.addLayer('handrail_layout', HANDRAIL_COLOR);
        this.dxf.addLayer('safetyline_layout', SAFETYLINE_COLOR);
        this.dxf.addLayer('acCable_layout', AC_CABLE_COLOR);
        this.dxf.addLayer('dcString_layout', DC_STRING_COLOR);
        this.dxf.addLayer('Rafters', RAFTERS_COLOR);
        this.dxf.addLayer('ROOF-RAIL', RAILS_COLOR);
        this.dxf.addLayer('MICRO INVERTER', MICROINVERTERS_COLOR);
        this.dxf.addLayer('OPTIMIZER', OPTIMIZERS_COLOR);
        this.dxf.addLayer('PROPERTY', PROPERTY_COLOR);
        this.dxf.addLayer('PROPERTY-DIMENSION', PROPERTY_DIMENSION_COLOR);
        this.dxf.addLayer('ATTACHMENT', ATTACHMENT_COLOR);
    }


    /**
     * If the roofExporterData object has a property with a length greater than 0, then draw that.
     * property.
     */
    draw() {
        // ground
        if (this.roofExporterData.ground.length > 0) {
            this.drawGround();
        }

        // property Line
        if (this.roofExporterData.property.length > 0) {
            this.drawProperty();
        }

        // micro inverters
        if (this.roofExporterData.microInverters.length > 0) {
            this.drawMicroInverters();
        }

        // extras
        if (this.roofExporterData.extras.length > 0) {
            this.drawExtras();
        }

        // walkways
        if (this.roofExporterData.walkways.length > 0) {
            this.drawWalkways();
        }

        // safetyline
        if (this.roofExporterData.safetyline.length > 0) {
            this.drawSafetylines();
        }

        // handrails
        if (this.roofExporterData.handrail.length > 0) {
            this.drawHandrails();
        }

        // strings
        if (this.roofExporterData.dcStrings.length > 0) {
            this.drawStrings();
        }

        // ac cables
        if (this.roofExporterData.acCable.length > 0) {
            this.drawAcCables();
        }

        // dc cables
        if (this.roofExporterData.dcCable.length > 0) {
            this.drawDcCables();
        }

        // conduit
        if (this.roofExporterData.conduit.length > 0) {
            this.drawConduits();
        }

        // cable tray
        if (this.roofExporterData.cableTray.length > 0) {
            this.drawCableTray();
        }

        // optimizers
        if (this.roofExporterData.optimizers) {
            this.drawOptimizers();
        }

        // parapets
        if (this.roofExporterData.parapets.length > 0) {
            this.drawParapets();
        }

        // setbacks
        if (this.roofExporterData.setbacksFrontend.length > 0) {
            this.drawSetback();
        }

        // obstructions
        if (this.roofExporterData.obstructions.length > 0) {
            this.drawObstructions();
        }

        // rafters
        if (this.roofExporterData.rafters.length > 0) {
            this.drawRafters();
        }

        // panels
        if (this.panelExporterData.length > 0) {
            this.drawPanels();
        }

        // rails
        if (this.roofExporterData.rails.length > 0) {
            this.drawRails();
        }

        // polygon
        if (this.roofExporterData.polygons.length > 0) {
            this.drawPolygons();
        }

        // attachments
        if (this.roofExporterData.attachments.length > 0) {
            this.drawAttachments();
        }
    }

    /**
     * It takes an object with a property called "edges" which is an array of objects.
     * The function returns an object with a property called "coordinates"
     * which is an array of arrays & other properties propertyText,
     * textPosition,textAngle.
     * @param propertyLine - This is the line object that is returned from the dxfjs library.
     * @returns An object with the following properties:
     */
    getPropertyCoordinates(propertyLine) {
        const propertyText = [];
        const textPosition = [];
        const textAngle = [];
        const coordinates = [];
        const { edges } = propertyLine;
        const len = edges.length;
        for (let i = 0; i < len; i++) {
            propertyText.push(edges[i].dimension[0]);
            textPosition.push(dxfjs.point3d(
                edges[i].dimensionPosition[0][0],
                edges[i].dimensionPosition[0][1],
                0,
            ));
            textAngle.push(edges[i].angleWrtXaxis[0]);
            coordinates.push({
                point: dxfjs.point2d(edges[i].points[0][0], edges[i].points[0][1]),
            });
        }

        return {
            coordinates,
            propertyText,
            textPosition,
            textAngle,
        };
    }

    /**
     * It takes the first edge of the first entity in the extra object and returns an array of two
     * points.
     * @param extra - The extra object that is passed to the callback function.
     * @returns An array of objects with a point property.
     */
    getTwoPointCoordinates(extra) {
        const edge = extra.edges[0];
        const coordinates = [];
        coordinates.push({
            point: dxfjs.point2d(edge.points[0][0], edge.points[0][1]),
        });
        coordinates.push({
            point: dxfjs.point2d(edge.points[1][0], edge.points[1][1]),
        });
        return coordinates;
    }

    /**
     * It takes all the edges in the extra object and returns an array of all two
     * points.
     * @param extra - The extra object that is passed to the callback function.
     * @returns An array of objects with a point property.
     */
    getAllTwoPointCoordinates(extra) {
        const coordinates = [];
        extra.edges.forEach((edge) => {
            coordinates.push({
                point: dxfjs.point2d(edge.points[0][0], edge.points[0][1]),
            });
            coordinates.push({
                point: dxfjs.point2d(edge.points[1][0], edge.points[1][1]),
            });
        });
        return coordinates;
    }

    /**
     * It takes a polygon and returns an array of points that represent the polygon's edges.
     * @param polygon - The polygon object that you want to get the coordinates from.
     * @returns An array of objects with a point property.
     */
    getPolyLineCoordinates(polygon) {
        return polygon.edges
            .map(edge => ({ point: dxfjs.point2d(edge.points[0][0], edge.points[0][1]) }));
    }

    drawGround() {
        const point = dxfjs.point3d(
            this.roofExporterData.ground[0].vertices[2][0],
            this.roofExporterData.ground[0].vertices[2][1],
        );
        const { groundImage } = this.stage.ground;
        const { width, height } = groundImage.getImageDimensions();
        const offset = groundImage.getPosition();
        const scale = groundImage.getScale();
        const lengthMeters = this.roofExporterData.ground[0].width;
        const pixelPerMeter = Math.max(width, height) / (lengthMeters * scale);
        const metersPerPixel = 1 / pixelPerMeter;
        const imageHeightMeters = height * metersPerPixel;
        const imageWidthMeters = width * metersPerPixel;
        const imageOffsetx = ((lengthMeters / 2) - (imageWidthMeters / 2)) + offset.x;
        const imageOffsety = ((lengthMeters / 2) - (imageHeightMeters / 2)) + offset.y;
        point.x += imageOffsetx;
        point.y += imageOffsety;
        this.dxf.addImage(
            `${this.referenceId}.png`, // Or the absolute path of the image if it isn't in the same folder.
            this.referenceId,
            point, // Insertion point of the bottomLeft corner of the image.
            pixelPerMeter, // the width of the image
            pixelPerMeter, // the height of the image
            1, // Scale
            0, // rotation
        );
    }

    drawSetback() {
        const { setbacksFrontend } = this.roofExporterData;

        setbacksFrontend.forEach((setback) => {
            const outerPolyline = new dxfjs.HatchPolylineBoundary();
            setback.outerEdges.forEach((pair) => {
                outerPolyline.add(dxfjs.vertex(...pair.points[0]));
            });
            // eslint-disable-next-line arrow-body-style
            const outerPoint2D = setback.outerEdges.map((pair) => {
                return { point: dxfjs.point2d(...pair.points[0]) };
            });
            this.dxf.addLWPolyline(outerPoint2D, {
                layerName: 'FIRE SETBACK',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
            const boundary = new dxfjs.HatchBoundaryPaths();
            boundary.addPolylineBoundary(outerPolyline, dxfjs.PolylineFlags.External);

            setback.edges.forEach((holePoints) => {
                const holePolyline = new dxfjs.HatchPolylineBoundary();
                holePoints.hole.forEach((pair) => {
                    holePolyline.add(dxfjs.vertex(...pair.points[0]));
                });
                // eslint-disable-next-line arrow-body-style
                const innerPoint2D = holePoints.hole.map((pair) => {
                    return { point: dxfjs.point2d(...pair.points[0]) };
                });
                this.dxf.addLWPolyline(innerPoint2D, {
                    layerName: 'FIRE SETBACK',
                    flags: dxfjs.LWPolylineFlags.Closed,
                });
                boundary.addPolylineBoundary(holePolyline, dxfjs.PolylineFlags.Outermost);
            });

            const mysolid = dxfjs.pattern({
                name: dxfjs.HatchPredefinedPatterns.ANSI31,
                // angle: 297.89,
                scale: 0.073,
            });
            this.dxf.addHatch(boundary, mysolid, {
                layerName: 'FIRE SETBACK',
                visible: true,
            });
        });
    }

    drawRafters() {
        const { rafters } = this.roofExporterData;
        const rafterCoordinates = [];
        for (let i = 0; i < rafters.length; i++) {
            rafterCoordinates.push(this.getTwoPointCoordinates(rafters[i]));
        }
        for (let i = 0; i < rafterCoordinates.length; i++) {
            this.dxf.addLWPolyline(rafterCoordinates[i], {
                layerName: 'Rafters',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawRails() {
        const { rails } = this.roofExporterData;
        const rafterCoordinates = [];
        for (let i = 0; i < rails.length; i++) {
            rafterCoordinates.push(this.getTwoPointCoordinates(rails[i]));
        }
        for (let i = 0; i < rafterCoordinates.length; i++) {
            this.dxf.addLWPolyline(rafterCoordinates[i], {
                layerName: 'ROOF-RAIL',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawExtras() {
        const { extras } = this.roofExporterData;
        const extraCoordinates = [];
        for (let i = 0; i < extras.length; i++) {
            extraCoordinates.push(this.getAllTwoPointCoordinates(extras[i]));
        }
        for (let i = 0; i < extraCoordinates.length; i++) {
            this.dxf.addLWPolyline(extraCoordinates[i], {
                layerName: 'ROOF OBSTRUCTION',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawObstructions() {
        const { obstructions } = this.roofExporterData;
        const obstructionCoordinates = [];
        for (let i = 0; i < obstructions.length; i++) {
            obstructionCoordinates.push(this.getPolyLineCoordinates(obstructions[i]));
        }
        for (let i = 0; i < obstructionCoordinates.length; i++) {
            this.dxf.addLWPolyline(obstructionCoordinates[i], {
                layerName: 'ROOF OBSTRUCTION',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawWalkways() {
        const { walkways } = this.roofExporterData;
        const walkwayCoordinates = [];
        for (let i = 0; i < walkways.length; i++) {
            walkwayCoordinates.push(this.getPolyLineCoordinates(walkways[i]));
        }
        for (let i = 0; i < walkwayCoordinates.length; i++) {
            this.dxf.addLWPolyline(walkwayCoordinates[i], {
                layerName: 'walkway_layout',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawSafetylines() {
        const safetylines = this.roofExporterData.safetyline;
        const safetylineCoordinates = [];
        for (let i = 0; i < safetylines.length; i++) {
            safetylineCoordinates.push(this.getPolyLineCoordinates(safetylines[i]));
        }
        for (let i = 0; i < safetylineCoordinates.length; i++) {
            this.dxf.addLWPolyline(safetylineCoordinates[i], {
                layerName: 'safetyline_layout',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawHandrails() {
        const handrails = this.roofExporterData.handrail;
        const handrailCoordinates = [];
        for (let i = 0; i < handrails.length; i++) {
            handrailCoordinates.push(this.getPolyLineCoordinates(handrails[i]));
        }
        for (let i = 0; i < handrailCoordinates.length; i++) {
            this.dxf.addLWPolyline(handrailCoordinates[i], {
                layerName: 'handrail_layout',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawStrings() {
        const strings = this.roofExporterData.dcStrings;
        const stringCoordinates = [];
        for (let i = 0; i < strings.length; i++) {
            const coordinate = [];
            strings[i].forEach((element) => {
                coordinate.push({
                    point: dxfjs.point2d(element[0], element[1]),
                });
            });
            stringCoordinates.push(coordinate);
        }
        for (let i = 0; i < stringCoordinates.length; i++) {
            this.dxf.addLWPolyline(stringCoordinates[i], {
                layerName: 'dcString_layout',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawAcCables() {
        const acCables = this.roofExporterData.acCable;
        const acCableCoordinates = [];
        for (let i = 0; i < acCables.length; i++) {
            acCableCoordinates.push(this.getPolyLineCoordinates(acCables[i]));
        }
        for (let i = 0; i < acCableCoordinates.length; i++) {
            this.dxf.addLWPolyline(acCableCoordinates[i], {
                layerName: 'acCable_layout',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawDcCables() {
        const dcCables = this.roofExporterData.dcCable;
        const dcCableCoordinates = [];
        for (let i = 0; i < dcCables.length; i++) {
            dcCableCoordinates.push(this.getPolyLineCoordinates(dcCables[i]));
        }
        for (let i = 0; i < dcCableCoordinates.length; i++) {
            this.dxf.addLWPolyline(dcCableCoordinates[i], {
                layerName: 'dcString_layout',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawConduits() {
        const conduits = this.roofExporterData.conduit;
        const conduitCoordinates = [];
        for (let i = 0; i < conduits.length; i++) {
            conduitCoordinates.push(this.getPolyLineCoordinates(conduits[i]));
        }
        for (let i = 0; i < conduitCoordinates.length; i++) {
            this.dxf.addLWPolyline(conduitCoordinates[i], {
                layerName: 'dcString_layout',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawCableTray() {
        const cableTrays = this.roofExporterData.cableTray;
        const cableTraysCoordinates = [];
        for (let i = 0; i < cableTrays.length; i++) {
            cableTraysCoordinates.push(this.getPolyLineCoordinates(cableTrays[i]));
        }
        for (let i = 0; i < cableTraysCoordinates.length; i++) {
            this.dxf.addLWPolyline(cableTraysCoordinates[i], {
                layerName: 'dcString_layout',
                flags: dxfjs.LWPolylineFlags.None,
            });
        }
    }

    drawParapets() {
        const { parapets } = this.roofExporterData;
        const parapetCoordinates = [];
        for (let i = 0; i < parapets.length; i++) {
            parapetCoordinates.push(this.getPolyLineCoordinates(parapets[i]));
        }
        for (let i = 0; i < parapetCoordinates.length; i++) {
            this.dxf.addLWPolyline(parapetCoordinates[i], {
                layerName: 'ROOF OBSTRUCTION',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawPolygons() {
        const polygonCoordinates = [];
        const { polygons } = this.roofExporterData;
        for (let j = 0; j < polygons.length; j++) {
            polygonCoordinates.push(this.getPolyLineCoordinates(polygons[j]));
        }
        for (let i = 0; i < polygonCoordinates.length; i++) {
            if (polygons[i].placable) {
                this.dxf.addLWPolyline(polygonCoordinates[i], {
                    layerName: 'PV-ROOF',
                    flags: dxfjs.LWPolylineFlags.Closed,
                });
            }
            else {
                this.dxf.addLWPolyline(polygonCoordinates[i], {
                    layerName: 'ROOF OBSTRUCTION',
                    flags: dxfjs.LWPolylineFlags.Closed,
                });
            }
        }
    }

    drawProperty() {
        const propertyCoordinates = [];
        const propertyLines = this.roofExporterData.property;
        for (let j = 0; j < propertyLines.length; j++) {
            propertyCoordinates.push(this.getPropertyCoordinates(propertyLines[j]));
        }
        for (let i = 0; i < propertyCoordinates.length; i++) {
            for (let j = 0; j < propertyCoordinates[i].propertyText.length; j++) {
                this.dxf.addText(
                    propertyCoordinates[i].textPosition[j],
                    0.9144,
                    propertyCoordinates[i].propertyText[j],
                    {
                        rotation: propertyCoordinates[i].textAngle[j],
                        layerName: 'PROPERTY-DIMENSION',
                        horizontalAlignment: dxfjs.TextHorizontalAlignment.Center,
                        verticalAlignment: dxfjs.TextVerticalAlignment.Middle,
                        secondAlignmentPoint: propertyCoordinates[i].textPosition[j],
                    },
                );
            }
            this.dxf.addLWPolyline(propertyCoordinates[i].coordinates, {
                layerName: 'PROPERTY',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        }
    }

    drawOptimizers() {
        const { optimizers } = this.roofExporterData;
        const optimizercoordinates = [];
        for (let i = 0; i < optimizers.length; i++) {
            const coordinates = new dxfjs.HatchPolylineBoundary();
            optimizers[i].forEach((optimizer) => {
                coordinates.add(dxfjs.vertex(optimizer[0], optimizer[1]));
            });
            optimizercoordinates.push(coordinates);
        }

        for (let i = 0; i < optimizercoordinates.length; i++) {
            const boundary = new dxfjs.HatchBoundaryPaths();
            boundary.addPolylineBoundary(optimizercoordinates[i]);

            const mySolid = dxfjs.pattern({
                name: dxfjs.HatchPredefinedPatterns.SOLID,
            });

            this.dxf.addHatch(boundary, mySolid, {
                layerName: 'OPTIMIZER',
            });
        }
    }

    drawMicroInverters() {
        const microinverters = this.roofExporterData.microInverters;
        const microInvertersCoordinates = [];
        for (let i = 0; i < microinverters.length; i++) {
            const coordinates = new dxfjs.HatchPolylineBoundary();
            microinverters[i].forEach((microInverter) => {
                coordinates.add(dxfjs.vertex(microInverter[0], microInverter[1]));
            });
            microInvertersCoordinates.push(coordinates);
        }

        for (let i = 0; i < microInvertersCoordinates.length; i++) {
            const boundary = new dxfjs.HatchBoundaryPaths();
            boundary.addPolylineBoundary(microInvertersCoordinates[i]);

            const mygradient = dxfjs.pattern({
                name: dxfjs.HatchPredefinedPatterns.SOLID,
            });

            this.dxf.addHatch(boundary, mygradient, {
                layerName: 'MICRO INVERTER',
            });
        }
    }

    drawAttachments() {
        const { attachments } = this.roofExporterData;
        const attachmentPolyCoordinates = [];
        for (let i = 0; i < attachments.length; i++) {
            attachmentPolyCoordinates.push(dxfjs
                .point3d(attachments[i].edges[0].center.x, attachments[i].edges[0].center.y, 0));
        }

        const hatchCoordinates = new dxfjs.HatchPolylineBoundary();
        const points = getThreeCircleDXF([0, 0], ATTACHMENT_RADIUS, 0, 2 * Math.PI);
        points.forEach((attachment) => {
            hatchCoordinates.add(dxfjs.vertex(attachment.x, attachment.y));
        });

        for (let i = 0; i < attachments.length; i++) {
            // block
            const attachmentBlock = this.dxf.addBlock("attachmentBlock"+i.toString());

            // circle
            attachmentBlock.addCircle(dxfjs.point3d(0, 0, 0), ATTACHMENT_RADIUS, {
                layerName: 'ATTACHMENT',
            });

            // hatch
            const boundary = new dxfjs.HatchBoundaryPaths();
            boundary.addPolylineBoundary(hatchCoordinates);

            const mysolid = dxfjs.pattern({
                name: dxfjs.HatchPredefinedPatterns.ANSI31,
                // angle: 297.89,
                scale: 0.01,
            });

            attachmentBlock.addHatch(boundary, mysolid, {
                layerName: 'ATTACHMENT',
            });

            // adding block to dxf
            this.dxf.addInsert(attachmentBlock.name, attachmentPolyCoordinates[i], {
                layerName: 'ATTACHMENT',
            });

        }
    }

    drawPanels() {
        const panelCoordinates = [];
        for (let i = 0; i < this.panelExporterData.length; i++) {
            this.panelExporterData[i].rows.forEach((element) => {
                element.frames.forEach((table) => {
                    // dont push panels coordinates for hidden tables
                    if (!table.hidden) {
                        table.panels.forEach((panel) => {
                            panelCoordinates.push([
                                {
                                    point: dxfjs.point2d(
                                        panel.corners[0][0],
                                        panel.corners[0][1],
                                    ),
                                },
                                {
                                    point: dxfjs.point2d(
                                        panel.corners[1][0],
                                        panel.corners[1][1],
                                    ),
                                },
                                {
                                    point: dxfjs.point2d(
                                        panel.corners[2][0],
                                        panel.corners[2][1],
                                    ),
                                },
                                {
                                    point: dxfjs.point2d(
                                        panel.corners[3][0],
                                        panel.corners[3][1],
                                    ),
                                },
                            ]);
                        });
                    }
                });
            });
        }
        panelCoordinates.forEach((arr) => {
            this.dxf.addLWPolyline(arr, {
                layerName: 'MODULE',
                flags: dxfjs.LWPolylineFlags.Closed,
            });
        });
    }

    /**
     * It creates a link element, sets the href to the image URL, sets the download attribute to the
     * image name, appends the link to the body, clicks the link, and then removes the link from the
     * body.
     * The download attribute is what makes this work. It tells the browser to download the file
     * instead of navigating to it.
     * @param imageSrc - The URL of the image you want to download.
     * @param imgName - The name of the image you want to download.
     */
    async downloadImage(imageSrc, imgName) {
        const image = await fetch(imageSrc);
        const imageBlog = await image.blob();
        const imageURL = URL.createObjectURL(imageBlog);

        const link = document.createElement('a');
        link.href = imageURL;
        link.download = imgName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * "This function saves the dxf file and the image of the dxf file to the user's computer."
     */
    saveDXF() {
        const blobData = new Blob([this.dxf.stringify()], { type: 'text/plain' });
        saveAs(blobData, `${this.referenceId}.dxf`);
        this.downloadImage(this.stage.getGroundImage().url, `${this.referenceId}.png`);
    }
}

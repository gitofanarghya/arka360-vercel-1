import * as THREE from 'three';
import * as JSTS from 'jsts';
import _ from 'lodash';
import Row from './Row';
import { roofMapExporter } from '../../utils/exporters';
import * as utils from '../../utils/utils';
import {
    getTableCoordinates,
    getRays, getRowBox, getEdgesFromGeometry,
    getDynamicOffsetBasedOnArea, localToGlobalCoordinates,
} from '../../utils/subarrayUtils';
import {
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
    SUBARRAY_RACK_STYLE_FIXED,
    SUBARRAY_RACK_STYLE_FLUSH,
    ROW_SPACING_MODE_AUTO,
    RAFTER_ORIENTATION_PARALLEL,
    SUBARRAY_RACK_STYLE_EWRACKING,
} from '../../coreConstants';
import OutlinePoints from '../subObjects/OutlinePoints';
import * as JSTSConverter from '../../utils/JSTSConverter';
import PolygonModel from '../model/PolygonModel';
import CylinderModel from '../model/CylinderModel';
import Walkway from '../model/Walkway';
import Handrail from '../model/Handrail';
import Tree from '../model/Tree';
import Inverter from '../ac/Inverter';
import ACDB from '../ac/ACDB';
import DCDB from '../ac/DCDB';
import Subarray from './Subarray';
import SmartroofFace from '../model/smartroof/SmartroofFace';
import FlatDormer from '../model/smartroof/dormers/FlatDormer';
import Dormer from '../model/smartroof/Dormer';
// eslint-disable-next-line import/no-duplicates
import * as exporters from '../../utils/exporters';


const WALKWAY = 'Walkway';

export default {
    clearSubarray() {
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject({ shouldSaveState: true, deleteEmptyParent: false });
        }

        this.PANEL_MODEL_ID = 0;
    },
    makeSubarray(subarrayMap, { withoutContainer } = { withoutContainer: false }) {
        for (let rowMap of subarrayMap.rows !== undefined ? subarrayMap.rows : []) {
            const row = new Row(this.stage, rowMap, { withoutContainer: withoutContainer });
            this.addChild(row);
            row.saveState({ withoutContainer: withoutContainer });
        }
        this.mergeGeometriesForAllPanels();
    },

    getPanelPlacementRequest() {
        const fieldSegment = {};

        fieldSegment.id = this.id;
        fieldSegment.structureType = this.structureType;
        fieldSegment.rowSpacing = this.rowSpacing;
        fieldSegment.tilt = this.tilt;
        fieldSegment.azimuth = this.azimuth;
        fieldSegment.moduleLength = this.moduleProperties.moduleLength;
        fieldSegment.moduleWidth = this.moduleProperties.moduleWidth;
        fieldSegment.landscape = this.panelOrientation === PANEL_ORIENTATION_LANDSCAPE;
        fieldSegment.mountHeight = this.mountHeight;
        fieldSegment.frameSizeUp = this.tableSizeUp;
        fieldSegment.frameSizeWide = this.tableSizeWide;
        fieldSegment.frameSpacing = this.tableSpacing;
        fieldSegment.moduleSpacingUp = this.moduleSpacingUp;
        fieldSegment.moduleSpacingWide = this.moduleSpacingWide;

        fieldSegment.coordinates = this.get2DVertices();
        fieldSegment.associatedObstacle = this.associatedModel.id;

        const requestObject = {};
        requestObject.fieldSegment = fieldSegment;
        requestObject.obstacles = roofMapExporter(this.stage);

        return requestObject;
    },
    async updatePanelPlacement({ withoutContainer, noRefresh } =
    { withoutContainer: false, noRefresh: false }) {

        // update all the required properties here as we directly call updatePanelPlacement
        // for fillface on changing of mount type from sappane dropdown selection


        this.inverterLerpPosition = 0;
        // Wait for 300 ms before starting any work so that notification come
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!noRefresh && !this.addTableFlow) {
            this.removeIntersectingSiblingSubarrayTables();
        }
        // remove if panels placed already
        this.clearSubarray();

        // place panels
        try {
            this.autoPlacePanels({ withoutContainer, noRefresh });

            //jugaad: remove eastwest rack find properfix for this in removeIntersectingSiblingSubarrayTables() function
            let siblings = this.getParent().getChildren().filter(ele => ele !== this);
            siblings.forEach((ele) => {
                if (ele.objectType === 'EastWestRack') ele.removeObject();
            });

            this.updateRail();
            this.ensureValidSubarrayDCSize();
        }
        catch (error) {
            return Promise.reject(error);
        }

        if (this.removeIfEmpty(false)) {

            return Promise.reject(new Error('Empty Subarray'));
        }
        return Promise.resolve(true);
    },


    removeIntersectingSiblingSubarrayTables() {
        const siblings = this.getParent().getChildren();
        const allTables = [];
        const subarrayVertices = this.get2DVertices();
        for (let i = siblings.length - 1; i >= 0; i -= 1) {
            // jugaad: instead of skipping for eastwestrack remove its intersecting table
            // after fixing this remove jugaaad of updatePanelPlacement
            if (siblings[i].objectType === 'EastWestRack') {
                continue;
            }
            if (siblings[i] instanceof Subarray && siblings[i] !== this) {
                if (siblings[i].addTableFlow) {
                    const rows = siblings[i].getChildren();
                    for (let j = rows.length - 1; j >= 0; j -= 1) {
                        const tables = rows[j].getChildren();
                        for (let k = tables.length - 1; k >= 0; k -= 1) {
                            allTables.push(tables[k]);
                        }
                    }
                }
                else {
                    siblings[i].deleteTableInsideArea(subarrayVertices);
                }
            }
        }

        let minX = Infinity;
        let minY = Infinity;
        for (let i = subarrayVertices.length - 1; i >= 0; i -= 1) {
            if (subarrayVertices[i][0] < minX) {
                minX = subarrayVertices[i][0];
            }
            if (subarrayVertices[i][1] < minY) {
                minY = subarrayVertices[i][1];
            }
        }

        const result = [];
        const subarrayEdges = utils.getEdges(subarrayVertices);
        for (let i = allTables.length - 1; i >= 0; i -= 1) {
            const tableEdges = utils.getEdges(allTables[i].get2DVertices());
            let intersection = false;
            for (let j = subarrayEdges.length - 1; j >= 0; j -= 1) {
                for (let k = tableEdges.length - 1; k >= 0; k -= 1) {
                    const check = utils.checkLineIntersection(subarrayEdges[j], tableEdges[k]);
                    if (check.onLine1 && check.onLine2) {
                        result.push(allTables[i]);
                        intersection = true;
                        break;
                    }
                }
                if (intersection) {
                    break;
                }
            }

            if (!intersection) {
                const outsidePoint = new THREE.Vector2(minX - 2, minY - 2);
                const vertex = allTables[i].get2DVertices()[0];
                const extEdge = [ outsidePoint, new THREE.Vector2(vertex[0], vertex[1]) ];
                let noOfIntersection = 0;
                for (let edge of subarrayEdges) {
                    let check = utils.checkLineIntersection(extEdge, edge);
                    if (check.onLine1 && check.onLine2) {
                        noOfIntersection = noOfIntersection + 1;
                    }
                }
                if (noOfIntersection % 2 === 1) {
                    result.push(allTables[i]);
                    continue;
                }
            }
        }
        for (let r of result) {
            r.removeObject();
        }
    },

    async fillFace(vertices, rackStyle = SUBARRAY_RACK_STYLE_FIXED, { isCustom } = { isCustom: false }, {associatedFillFaceModel} = {associatedFillFaceModel: null}, ewNewFlag = false) {

        this.associatedFillFaceModel = associatedFillFaceModel;
        if (rackStyle === SUBARRAY_RACK_STYLE_EWRACKING) {
            this.mountType = SUBARRAY_RACK_STYLE_EWRACKING;
            const eastWestRackingProperties = this.getEastWestRackingProperties();
            this.tilt = eastWestRackingProperties.tilt;
            this.structureType = eastWestRackingProperties.structureType;
            this.azimuth = eastWestRackingProperties.azimuth;
            this.panelOrientation = eastWestRackingProperties.panelOrientation;
            this.mountHeight = eastWestRackingProperties.mountHeight;
            this.interRowSpacing = eastWestRackingProperties.interRowSpacing;
            this.interRowSpacingMode = eastWestRackingProperties.interRowSpacingMode;
            this.intraRowSpacing = eastWestRackingProperties.intraRowSpacing;
            this.tableSizeUp = eastWestRackingProperties.tableSizeUp;
            this.tableSizeWide = eastWestRackingProperties.tableSizeWide;
            this.tableSpacing = eastWestRackingProperties.tableSpacing;
            this.moduleSpacingUp = eastWestRackingProperties.moduleSpacingUp;
            this.moduleSpacingWide = eastWestRackingProperties.moduleSpacingWide;
            this.moduleProperties = eastWestRackingProperties.moduleProperties;
            this.panelProperties = eastWestRackingProperties.panelProperties;
        }
        else if (rackStyle === SUBARRAY_RACK_STYLE_FLUSH) {
            this.mountType = SUBARRAY_RACK_STYLE_FLUSH;
            const flushMountProperties = this.getFlushMountProperties();
            this.tilt = flushMountProperties.tilt;
            this.structureType = flushMountProperties.structureType;
            this.azimuth = flushMountProperties.azimuth;
            this.rowSpacingMode = flushMountProperties.rowSpacingMode;
            this.rowSpacing = flushMountProperties.rowSpacing;
            this.panelOrientation = flushMountProperties.panelOrientation;
            this.mountHeight = flushMountProperties.mountHeight;
            this.tableSizeUp = flushMountProperties.tableSizeUp;
            this.tableSizeWide = flushMountProperties.tableSizeWide;
            this.tableSpacing = flushMountProperties.tableSpacing;
            this.moduleSpacingUp = flushMountProperties.moduleSpacingUp;
            this.moduleSpacingWide = flushMountProperties.moduleSpacingWide;
            this.moduleProperties = flushMountProperties.moduleProperties;
            this.panelProperties = flushMountProperties.panelProperties;
        }
        else {
            this.mountType = SUBARRAY_RACK_STYLE_FIXED;
            const fixedMountProperties = this.getFixedMountProperties();
            this.azimuth = fixedMountProperties.azimuth;
            this.tilt = fixedMountProperties.tilt;
            this.structureType = fixedMountProperties.structureType;
            this.rowSpacingMode = fixedMountProperties.rowSpacingMode;
            this.panelOrientation = fixedMountProperties.panelOrientation;
            this.tableSizeUp = fixedMountProperties.tableSizeUp;
            this.tableSizeWide = fixedMountProperties.tableSizeWide;
            this.tableSpacing = fixedMountProperties.tableSpacing;
            this.moduleSpacingUp = fixedMountProperties.moduleSpacingUp;
            this.moduleSpacingWide = fixedMountProperties.moduleSpacingWide;
            this.moduleProperties = fixedMountProperties.moduleProperties;
            this.panelProperties = fixedMountProperties.panelProperties;
            let { rowSpacing } = fixedMountProperties;
            if (fixedMountProperties.rowSpacingMode === ROW_SPACING_MODE_AUTO) {
                const optimizedRowSpacing = this.getOptimisedRowSpacing();
                rowSpacing = optimizedRowSpacing < 0.001 ? 0.001 : optimizedRowSpacing;
            }
            this.rowSpacing = rowSpacing;
        }
        const defaultVal = this.getDefaultValues();
        if (this.panelProperties === undefined) {
            this.panelProperties = defaultVal.panelProperties;
        }
        // adjust vertices to accommodate for raycaster precision during placeObject
        // vertices = utils.convertArrayToVector(utils.setbackPolygon(vertices, -0.001));
        vertices = utils.convertArrayTo3DVector(utils.setbackPolygon(vertices, -0.001));
        // TODO: call onComplete after draw manager is refactored to return list of vertices

        // set outline points
        for (let vertex of vertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    vertex.x,
                    vertex.y,
                    vertex.z,
                    this,
                    this.stage
                )
            );
        }


        if (!isCustom) {
            try {
                // update panel placement
                await this.placeObject(); // 1 to 20 sec
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: Subarray: fillFace failed.', error);
                this.onCancel();
                return Promise.reject(error);
            }
        }
        else {
            try {
                await this.updateAssociatedModel();
            }
            catch (error) {
                console.error('ERROR: Subarray: placeObject failed', error);
                return Promise.reject(error);
            }
            if (rackStyle === SUBARRAY_RACK_STYLE_FLUSH) {
                const flushMountProperties = this.getFlushMountProperties();
                this.tilt = flushMountProperties.tilt;
                this.azimuth = flushMountProperties.azimuth;
            }
            this.updateGeometry();

            // show outline
            this.coreEdges.visible = true;
            // show outline points
            for (let outlinePoint of this.outlinePoints) {
                outlinePoint.showObject();
            }
        }
    },

    autoPanelPlacement(modelVertices, model, panelMap, solarAccessMap, solarAccessThreshold) {
        this.associatedModel = model;

        if (this.getParent() !== model) {
            model.addChild(this);
        }

        // adjust vertices to accommodate for raycaster precision during placeObject
        modelVertices = utils.setbackPolygon(modelVertices, -0.001);

        // set outline points
        for (let outlinePoint of modelVertices) {
            this.outlinePoints.push(
                new OutlinePoints(
                    outlinePoint[0],
                    outlinePoint[1],
                    outlinePoint[2],
                    this,
                    this.stage
                )
            );
        }

        // update geometry
        this.updateGeometry();

        // set subarray properties
        this.rowSpacing = panelMap.rowSpacing;
        this.tilt = panelMap.tilt;
        this.azimuth = panelMap.azimuth;
        this.panelOrientation = panelMap.landscape ?
            PANEL_ORIENTATION_LANDSCAPE : PANEL_ORIENTATION_PORTRAIT;
        this.mountHeight = panelMap.mountHeight;
        this.tableSizeUp = panelMap.frameSizeUp;
        this.tableSizeWide = panelMap.frameSizeWide;
        this.tableSpacing = panelMap.frameSpacing;
        this.moduleSpacingUp = panelMap.moduleSpacingUp;
        this.moduleSpacingWide = panelMap.moduleSpacingWide;
        panelMap = this.setCorrectPanelCoordinates(panelMap);
        panelMap = this.createRowBlocksInSubarrayMap(panelMap);
        this.makeSubarray(panelMap);
        this.ensureValidSubarrayDCSize({ showError: false });
        this.updateSolarAccess(solarAccessMap);
        this.optimiseOnSolarAccess(solarAccessThreshold);

        this.saveState();
    },

    deleteTableInsideArea(ver) {
        const bBox = this.getBoundingBox();
        const vertices = [];
        const polygonBox = {
            minX: Infinity,
            maxX: -Infinity,
            minY: Infinity,
            maxY: -Infinity,
        }
        for (let i = 0, l = ver.length; i < l; i += 1) {
            const point = this.globalToLocalCoordinates(new THREE.Vector2(ver[i][0], ver[i][1]), bBox);
            vertices.push(point);
            if (polygonBox.minY > point.y) {
                polygonBox.minY = point.y;
            }
            if (polygonBox.maxY < point.y) {
                polygonBox.maxY = point.y;
            }
            if (polygonBox.minX > point.x) {
                polygonBox.minX = point.x;
            }
            if (polygonBox.maxX < point.x) {
                polygonBox.maxX = point.x;
            }
        }
        const rows = [];
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            const rowBBox = this.getChildren()[i].getlocalBoundingBox();
            if (
                (rowBBox.minY > polygonBox.minY && rowBBox.minY < polygonBox.maxY) ||
                (rowBBox.maxY > polygonBox.minY && rowBBox.maxY < polygonBox.maxY) ||
                (polygonBox.minY > rowBBox.minY && polygonBox.minY < rowBBox.maxY) ||
                (polygonBox.maxY > rowBBox.minY && polygonBox.maxY < rowBBox.maxY)
            ) {
                if (
                    (rowBBox.minX > polygonBox.minX && rowBBox.minX < polygonBox.maxX) ||
                    (rowBBox.maxX > polygonBox.minX && rowBBox.maxX < polygonBox.maxX) ||
                    (polygonBox.minX > rowBBox.minX && polygonBox.minX < rowBBox.maxX) ||
                    (polygonBox.maxX > rowBBox.minX && polygonBox.maxX < rowBBox.maxX)
                ) {
                    rows.push(this.getChildren()[i]);
                }
            }
        }
        const tables = [];
        const { width } = this.getTableDimensions();
        const { length } = this.getTableDimensions();
        for (let i = 0, l = rows.length; i < l; i += 1) {
            for (let t = 0, len = rows[i].getChildren().length; t < len; t += 1) {
                const tablePosition = rows[i].getChildren()[t].getLocalPosition(this);
                const tableLeft = tablePosition.x - (width / 2);
                const tableRight = tablePosition.x + (width / 2);
                if (
                    (tableRight > polygonBox.minX && tableRight < polygonBox.maxX) ||
                    (tableLeft > polygonBox.minX && tableLeft < polygonBox.maxX) ||
                    (polygonBox.minX > tableLeft && polygonBox.minX < tableRight) ||
                    (polygonBox.maxX > tableLeft && polygonBox.maxX < tableRight)
                ) {
                    tables.push(rows[i].getChildren()[t]);
                }
            }
        }
        const result = [];
        const polygonEdges = utils.getEdges(vertices);
        for (let i = 0, l = tables.length; i < l; i += 1) {
            const tablePosition = tables[i].getLocalPosition(this);
            let intersection = false;
            const table2DCoordinates = this.get2DTableCoordinates(tablePosition, width, length);
            const tableEdges =
                utils.getEdges(table2DCoordinates);
            for (let k = 0, len = polygonEdges.length; k < len; k += 1) {
                for (let j = 0, len1 = tableEdges.length; j < len1; j += 1) {
                    const check = utils.checkLineIntersection(polygonEdges[k], tableEdges[j]);
                    if (check.onLine1 && check.onLine2) {
                        result.push(tables[i]);
                        intersection = true;
                        break;
                    }
                }
                if (intersection) {
                    break;
                }
            }
            if (!intersection) {
                // table completely inside
                let outsidePoint = new THREE.Vector2(polygonBox.minX - 2, polygonBox.minY - 2);
                let vertex = table2DCoordinates[0];
                let extEdge = [ outsidePoint, new THREE.Vector2(vertex[0], vertex[1]) ];
                let noOfIntersection = 0;
                for (let edge of polygonEdges) {
                    let check = utils.checkLineIntersection(extEdge, edge);
                    if (check.onLine1 && check.onLine2) {
                        noOfIntersection = noOfIntersection + 1;
                    }
                }
                if (noOfIntersection % 2 === 1) {
                    result.push(tables[i]);
                    continue;
                }
                // polygon completely inside a table..
                const tableDimension = this.getTableDimensions();
                const tableMinX = tablePosition.x - (tableDimension.width / 2);
                const tableMinY = tablePosition.y - (tableDimension.length / 2);

                outsidePoint = new THREE.Vector2(tableMinX - 2, tableMinY - 2);
                vertex = vertices[0];
                extEdge = [ outsidePoint, new THREE.Vector2(vertex.x, vertex.y) ];
                noOfIntersection = 0;
                for (let edge of tableEdges) {
                    let check = utils.checkLineIntersection(extEdge, edge);
                    if(check.onLine1 && check.onLine2){
                        noOfIntersection = noOfIntersection + 1;
                    }
                }
                if (noOfIntersection % 2 === 1) {
                    result.push(tables[i]);
                }
            }
        }
        for (let i = 0; i < result.length; i += 1) {
            if (result[i].getParent() !== null) {
                result[i].removeObject();
            }
        }
        this.mergeGeometriesForAllPanels();
    },

    get2DTableCoordinates(position, width, length) {
        return [
            [position.x - (width / 2), position.y - (length / 2)],
            [position.x + (width / 2), position.y - (length / 2)],
            [position.x + (width / 2), position.y + (length / 2)],
            [position.x - (width / 2), position.y + (length / 2)],
        ]
    },

    getTemplateTableMap({ withBBox } = { withBBox: true }) {
        let { moduleLength } = this.moduleProperties;
        let { moduleWidth } = this.moduleProperties;
        const bBox = withBBox ? this.getBoundingBox() : null;
        if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
            moduleWidth = this.moduleProperties.moduleLength;
            moduleLength = this.moduleProperties.moduleWidth;
        }

        return {
            hidden: false,
            panels: getTableCoordinates(
                [0, 0, 0], this.tableSizeUp, this.tableSizeWide, moduleWidth, moduleLength,
                this.azimuth, this.tilt,
                this.moduleSpacingUp, this.moduleSpacingWide,
                this.getTiltWrtParentSurface(), bBox,
            ),
            id: 1,
            isMoved: false,
            position: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
    },

    getCustomTableMapForAddTable(position, { withBBox } = { withBBox: true }) {
        let { moduleLength } = this.moduleProperties;
        let { moduleWidth } = this.moduleProperties;
        const bBox = withBBox ? this.getBoundingBox() : null;
        if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
            moduleWidth = this.moduleProperties.moduleLength;
            moduleLength = this.moduleProperties.moduleWidth;
        }
        return {
            hidden: false,
            panels: getTableCoordinates(
                [position.x, position.y, position.z], this.tableSizeUp,
                this.tableSizeWide, moduleWidth, moduleLength,
                this.azimuth, this.tilt,
                this.moduleSpacingUp, this.moduleSpacingWide,
                this.getTiltWrtParentSurface(), bBox,
            ),
            id: 1,
            isMoved: false,
        };
    },

    getTableDimensions(reset = false) {
        if (reset || this.tableDimensions === undefined) {
            let { moduleLength } = this.moduleProperties;
            let { moduleWidth } = this.moduleProperties;
            if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
                moduleWidth = this.moduleProperties.moduleLength;
                moduleLength = this.moduleProperties.moduleWidth;
            }
            this.tableDimensions = {
                length: (((this.tableSizeUp - 1) * this.moduleSpacingUp) +
                    (this.tableSizeUp * moduleLength)),
                width: (((this.tableSizeWide - 1) * this.moduleSpacingWide) +
                    (this.tableSizeWide * moduleWidth)),
                height: (((this.tableSizeUp - 1) * this.moduleSpacingUp) +
                    (this.tableSizeUp * moduleLength)) * Math.sin(this.tilt * (Math.PI / 180)),
            };
        }

        // console.log('this.tableDimensions: ', this.tableDimensions);
        // if(this.eastWestRackingEnabled) console.warn('sfdf');
        return this.tableDimensions;
    },

    getTableDimensionsEW(reset = false) {
        if (reset || this.tableDimensions === undefined) {
            let { moduleLength } = this.moduleProperties;
            let { moduleWidth } = this.moduleProperties;
            if (this.panelOrientation !== PANEL_ORIENTATION_PORTRAIT) {
                moduleWidth = this.moduleProperties.moduleLength;
                moduleLength = this.moduleProperties.moduleWidth;
            }
            if (this.eastWestRackingEnabled) {
                return {
                    length: ((((this.tableSizeUp * 2) - 1) * this.intraRowSpacing) +
                        ((this.tableSizeUp * 2) * moduleLength)),
                    width: (((this.tableSizeWide - 1) * this.moduleSpacingWide) +
                        (this.tableSizeWide * moduleWidth)),
                    height: ((((this.tableSizeUp * 2) - 1) * this.intraRowSpacing) +
                        (this.tableSizeUp * moduleLength)) * Math.sin(this.tilt * (Math.PI / 180)),
                };
            }
        }
        return this.tableDimensions;
    },

    getBoundingBox(reset = false) {
        // order of vertices
        // top-left
        // bottom-left
        // bottom-right
        // top-right
        if (this.boundingBox === undefined || reset) {
            this.coreMesh.geometry.computeBoundingSphere();
            const subarraySphere = this.coreMesh.geometry.boundingSphere;
            subarraySphere.center.z = this.getParent()
                .getZOnTopSurface(subarraySphere.center.x, subarraySphere.center.y);
            // 2D directions
            let bBoxDirectionUp = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                -this.azimuth * (Math.PI / 180),
            ); //  tilt's zero is from the base and azimuth is clockwise (in scene)
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionUp = utils.posResetFor2D(bBoxDirectionUp);

            let bBoxDirectionLeft = new THREE.Vector3().setFromSphericalCoords(
                1,
                90 * (Math.PI / 180),
                (-this.azimuth + 90) * (Math.PI / 180),
            );
            // rotation requied because in 2d-View the Y-azis is upwards not outwards
            bBoxDirectionLeft = utils.posResetFor2D(bBoxDirectionLeft);

            // finding 3D directions using the slope of parent
            const pointUp = subarraySphere.center.clone().addScaledVector(bBoxDirectionUp, 1);
            const pointLeft = subarraySphere.center.clone().addScaledVector(bBoxDirectionLeft, 1);

            // getting the z-coordinates of the points along the slope of the parent polygon
            pointUp.z = this.getParent().getZOnTopSurface(pointUp.x, pointUp.y);
            pointLeft.z = this.getParent().getZOnTopSurface(pointLeft.x, pointLeft.y);

            // now these direction are along the slope of the parent in 3D
            bBoxDirectionUp = pointUp.sub(subarraySphere.center);
            bBoxDirectionLeft = pointLeft.sub(subarraySphere.center);

            bBoxDirectionUp.normalize();
            bBoxDirectionLeft.normalize();

            // this is also normal of the parent surface
            const bBoxNormal = new THREE.Vector3();
            bBoxNormal.crossVectors(bBoxDirectionUp, bBoxDirectionLeft);
            bBoxNormal.normalize();

            const vertices = [];
            const diagonalVector = bBoxDirectionLeft.clone()
                .multiplyScalar(subarraySphere.radius * Math.SQRT2);
            const verticesOrderAngle = [-45, 45, 135, -135];

            verticesOrderAngle.forEach((angle) => {
                vertices.push(subarraySphere.center
                    .clone()
                    .add(diagonalVector
                        .clone()
                        .applyAxisAngle(bBoxNormal, utils.deg2Rad(angle))));
            });
            this.boundingBox = vertices;
        }
        return this.boundingBox;
    },

    globalToLocalCoordinates(point, bBox) {
        let globalPoint;
        // getting the z coordinate
        globalPoint = new THREE.Vector3(point.x, point.y, 0);
        if (this.rackSubarray && !(this.getParent())) {
            this.changeParent(this.getParent() ? this.getParent() : this.rackSubarray.getParent());
        }
        globalPoint.z = this.getParent().getZOnTopSurface(point.x, point.y);
        // signed angle between the top edge of bBox and
        // the line connecting first point of bBox and the globalPoint
        const line1 = bBox[1].clone().sub(bBox[0]);
        const line2 = bBox[3].clone().sub(bBox[0]);
        const planeNormal = line1.clone().cross(line2);
        const line3 = globalPoint.clone().sub(bBox[0]);
        const angle = line3.angleTo(line2) * Math.sign(planeNormal.dot(line3.clone().cross(line2)));

        const magnitude = globalPoint.distanceTo(bBox[0]);
        return new THREE.Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    },

    getAzimuthIn3D() {
        const tableMap = this.getTemplateTableMap();
        const panelMapCorners = tableMap.panels[0].corners;
        // panel map corners are in anti-clockwise order
        // (3 - 0) cross (0 - 1) will give the panelNormal
        const edge1 = new THREE.Vector3(
            panelMapCorners[0][0] - panelMapCorners[1][0],
            panelMapCorners[0][1] - panelMapCorners[1][1],
            panelMapCorners[0][2] - panelMapCorners[1][2],
        );
        const edge2 = new THREE.Vector3(
            panelMapCorners[3][0] - panelMapCorners[0][0],
            panelMapCorners[3][1] - panelMapCorners[0][1],
            panelMapCorners[3][2] - panelMapCorners[0][2],
        );
        const panelNormal = edge2.clone().cross(edge1);
        panelNormal.z = 0;
        panelNormal.normalize();
        if (Math.abs(panelNormal.x) < 0.0001) {
            return panelNormal.y > 0 ? 0 : 180;
        }
        const angle = Math.atan(panelNormal.y / panelNormal.x);
        if (panelNormal.x < 0) {
            return 270 - utils.rad2Deg(angle);
        }
        return 90 - utils.rad2Deg(angle);
    },

    getTiltWrtParentSurface(parent = this.getParent()) {
        const reverseTilt = (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) > 90
        )
        &&
        (
            (
                Math.max(this.azimuth, this.getParent().getAzimuth()) -
                Math.min(this.azimuth, this.getParent().getAzimuth())
            ) < 270
        );

        // eliminating the cases when the calculation is not required.
        if (!reverseTilt && (parent.getTilt() > this.tilt)) {
            return NaN;
        }

        if (parent.getAzimuth() === this.azimuth ||
        parent.getTilt() === 0
        ) {
            return utils.deg2Rad(this.tilt - parent.getTilt());
        }

        const bBox = this.getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();

        const groundNormal = new THREE.Vector3(0, 0, 1);
        const parentNormal = rightDirection.clone().cross(upDirection);
        let panelPlaneNormal;

        const c = Math.cos(utils.deg2Rad(this.tilt));

        const xD = rightDirection.x;
        const yD = rightDirection.y;
        const zD = rightDirection.z;

        let a;
        let b;

        if (Math.abs(xD) < 0.0001) {
            b = 0;
            a = Math.sqrt(1 - (c ** 2)) * (upDirection.x > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else if (Math.abs(yD) < 0.0001) {
            a = 0;
            b = Math.sqrt(1 - (c ** 2)) * (upDirection.y > 0 ? -1 : 1);
            panelPlaneNormal = new THREE.Vector3(a, b, c);
        }
        else {
            const A = (xD ** 2) + (yD ** 2);
            const B = 2 * xD * zD * c;
            const C = (((zD ** 2) * (c ** 2)) + ((yD ** 2) * (c ** 2))) - (yD ** 2);

            // Note
            // Precision is set to 13 for 64 bit systems.
            // Having lower precision will affect edge cases like azimuth close to 180˚
            const D = _.round((B ** 2) - (4 * A * C), 13);
            if (D >= 0) {
                let validOrderedPanelPlaceNormals = [];

                a = (-B + Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                a = (-B - Math.sqrt(D)) / (2 * A);
                b = -((c * zD) + (xD * a)) / yD;
                panelPlaneNormal = new THREE.Vector3(a, b, c);
                validOrderedPanelPlaceNormals.push({
                    panelNormal: panelPlaneNormal,
                    tiltWRTGround: groundNormal.angleTo(panelPlaneNormal),
                    tiltWRTParent: parentNormal.angleTo(panelPlaneNormal)
                });

                validOrderedPanelPlaceNormals = validOrderedPanelPlaceNormals.filter(item => Math.abs(utils.rad2Deg(item.tiltWRTGround) - this.tilt) <= 0.05, this);
                if (validOrderedPanelPlaceNormals.length === 0) {
                    return NaN;
                }

                validOrderedPanelPlaceNormals.sort((itemA, itemB) => itemA.tiltWRTParent - itemB.tiltWRTParent);

                panelPlaneNormal = (reverseTilt ? validOrderedPanelPlaceNormals[validOrderedPanelPlaceNormals.length - 1] : validOrderedPanelPlaceNormals[0]).panelNormal;
            }
            else {
                return NaN;
            }
        }
        const relativeTilt = parentNormal.angleTo(panelPlaneNormal);
        return relativeTilt;
    },

    autoPlacePanels({ withoutContainer, noRefresh } =
    { withoutContainer: false, noRefresh: false }) {
        // update bounding box rotated along the azimuth of the rows
        // and tilted along the parent surface
        const boundingBox = this.getBoundingBox({ reset: true });
        const bBoxDimensions = {
            xLength: boundingBox[0].distanceTo(boundingBox[1]),
            yLength: boundingBox[0].distanceTo(boundingBox[3]),
        };
        const relativeTilt = this.getTiltWrtParentSurface();
        if (Number.isNaN(relativeTilt)) {
            this.removeObject();
            this.stage.eventManager.subarrayTiltNotPossibleError();
            throw new Error('This combination of  Tilt and azimuth is not possible on this surface');
        }
        const tableMap = this.getTemplateTableMap();
        const tableDimensions = this.eastWestRackingEnabled ?  this.getTableDimensionsEW({reset: true}) : this.getTableDimensions({ reset: true });
        // get placable polygon and walkways polygon
        let placablePolygon = JSTSConverter.verticesToJSTSPolygon(this.get3DVertices());
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        if (this.getParent() instanceof PolygonModel || this.getParent() instanceof CylinderModel || this.getParent() instanceof SmartroofFace) {
            const insideSetbackShapes = this.getParent().getInsideSetbackPolygons();
            const parapetShapes = this.getParent() instanceof SmartroofFace ? [] : this.getParent().getParapetPolygons();
            if (insideSetbackShapes.length === 1) {
                const insideSetbackVertices = insideSetbackShapes[0].holeVertices
                    .map(shape => shape
                        .map(vertex => [vertex.x, vertex.y]));
                const insideSetbackSegmentsArray = [];
                insideSetbackVertices.forEach((shape) => {
                    const insideSetbackPolygon = JSTSConverter
                        .verticesToJSTSPolygon(shape);
                    const insideSetbackPolygonSegment = utils
                        .getReducedPrecisionJSTSGeometry(insideSetbackPolygon);
                    insideSetbackSegmentsArray.push(insideSetbackPolygonSegment);
                });
                // TODO: Calling geometryFactory like this is bad, should change later.
                // Will fix when changing geometryFactory instances in JSTSConverter,
                // have to know how to deal a factory pattern with a functional utils file.

                const geometryFactory = new JSTS.geom.GeometryFactory();
                const insideSetbackPolygon = geometryFactory
                    .createMultiPolygon(insideSetbackSegmentsArray).union();
                placablePolygon = placablePolygon.intersection(insideSetbackPolygon);
            }
            else if (parapetShapes.length === 1) {
                const parapetVertices = parapetShapes[0].holeVertices
                    .map(vertex => [vertex.x, vertex.y]);
                let parapetPolygon = JSTSConverter.verticesToJSTSPolygon(parapetVertices);
                parapetPolygon = utils.getReducedPrecisionJSTSGeometry(parapetPolygon);
                placablePolygon = placablePolygon.intersection(parapetPolygon);
            }
            else {
                let parentPolygon = JSTSConverter
                    .verticesToJSTSPolygon(this.getParent().get3DVertices());
                parentPolygon = utils.getReducedPrecisionJSTSGeometry(parentPolygon);
                placablePolygon = placablePolygon.intersection(parentPolygon);
            }

            if (this.getParent() instanceof SmartroofFace && insideSetbackShapes.length > 1) {
                const geometryFactory = new JSTS.geom.GeometryFactory();
                const insideSetbackSegmentsArray = [];
                insideSetbackShapes.forEach((insideSetbackShape) => {
                    const insideSetbackVertices = insideSetbackShape.holeVertices
                        .map(shape => shape
                            .map(vertex => [vertex.x, vertex.y]));

                    insideSetbackVertices.forEach((shape) => {
                        const insideSetbackPolygon = JSTSConverter
                            .verticesToJSTSPolygon(shape);
                        const insideSetbackPolygonSegment = utils
                            .getReducedPrecisionJSTSGeometry(insideSetbackPolygon);
                        insideSetbackSegmentsArray.push(insideSetbackPolygonSegment);
                    });
                });

                const insideSetbackPolygon = geometryFactory
                    .createMultiPolygon(insideSetbackSegmentsArray).union();
                placablePolygon = placablePolygon.intersection(insideSetbackPolygon);
            }
        }
        placablePolygon = utils.getReducedPrecisionJSTSGeometry(placablePolygon);
        const placablePolygonEdge = getEdgesFromGeometry(placablePolygon);
        // create a flat polygon from the placable polygon edges
        this.placablePolygonVertices = placablePolygonEdge.map(edge => [edge[0].x, edge[0].y]);
        const walkwaysLocalYCoordinates = [];

        const siblings = this.getParent().getChildren().filter(sibling => sibling !== this);
        //quick-fix
        const siblingObstacles = [];
        const allObstacleEdges = [];
        const allWalkwayObstacleEdges = [];

        for (let idx = 0, len = siblings.length; idx < len; idx += 1) {
            if (siblings[idx] instanceof PolygonModel || siblings[idx] instanceof CylinderModel || siblings[idx] instanceof Dormer) {
                if (!siblings[idx].isIgnored()) {
                    let siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    siblingObstacles.push(siblings[idx].get2DVertices());
                    const outsideSetbackShapes = siblings[idx].getOutsideSetbackPolygons();
                    const shapesLen = outsideSetbackShapes.length;
                    if (shapesLen > 0) {
                        for (let i = 0; i < shapesLen; i += 1) {
                            outsideSetbackShapes[i].vertices = outsideSetbackShapes[i].vertices
                                .map(vertex => [vertex.x, vertex.y]);
                            outsideSetbackShapes[i].holeVertices = outsideSetbackShapes[i]
                                .holeVertices
                                .map(vertex => [vertex.x, vertex.y]);
                        }
                        siblingPolygon = utils.getReducedPrecisionJSTSGeometry(
                            siblingPolygon.union(
                                utils.getReducedPrecisionJSTSGeometry(
                                    JSTSConverter.setbackToJSTSPolygon(outsideSetbackShapes))));

                    }
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                       allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Tree) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                       allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Inverter) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof ACDB) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof DCDB) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Walkway) {
                const walkwayVertices = siblings[idx].get2DVertices();
                if (!utils.checkParallel(this.azimuth, utils
                    .convertArrayToVector([walkwayVertices[0], walkwayVertices[1]])).isParallel) {
                    const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                        .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        allWalkwayObstacleEdges.push(obstacleEdges);
                    }
                }
                else {
                    const walkwayVerticesVector = utils.convertArrayToVector(walkwayVertices);
                    let min = Infinity;
                    let max = -Infinity;

                    for (let i = 0, arrLen = walkwayVerticesVector.length; i < arrLen; i += 1) {
                        const localCoordinates = this
                            .globalToLocalCoordinates(walkwayVerticesVector[i], boundingBox);
                        if (localCoordinates.y > max) {
                            max = localCoordinates.y;
                        }
                        if (localCoordinates.y < min) {
                            min = localCoordinates.y;
                        }
                    }
                    walkwaysLocalYCoordinates.push({ x: min, y: max });
                }
            }
            else if (siblings[idx] instanceof Handrail) {
                if (!siblings[idx].isIgnored()) {
                    const siblingPolygon = utils
                        .getReducedPrecisionJSTSGeometry(JSTSConverter
                            .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                       allObstacleEdges.push(obstacleEdges);
                    }
                }
            }
            else if (siblings[idx] instanceof Subarray && noRefresh === true) {
                const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                    .verticesToJSTSPolygon(siblings[idx].get3DVertices()));
                const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                    allObstacleEdges.push(obstacleEdges);
                }
            }
        }

        if (this.parent instanceof SmartroofFace) {
            const convexHullGroup = this.getParent().innerLoops;
            convexHullGroup.forEach((convexHull) => {
                if (convexHull.length > 3) {
                    const siblingPolygon = utils.getReducedPrecisionJSTSGeometry(JSTSConverter
                        .verticesToJSTSPolygon(convexHull));
                    siblingObstacles.push(this.getParent().innerLoops);
                    const intersectionMatrix = siblingPolygon.relate(placablePolygon);
                    if (intersectionMatrix.isIntersects() || intersectionMatrix.isWithin()) {
                        const obstacleEdges = getEdgesFromGeometry(siblingPolygon);
                        allObstacleEdges.push(obstacleEdges);
                    }
                }
            });
        }

        walkwaysLocalYCoordinates.sort((a, b) => a.x - b.x);

        let efficientRows = [];
        let maxRowLength = 0;
        this.isJustified = true;

        const { dynamicOffsetDx, dynamicOffsetDy } = getDynamicOffsetBasedOnArea(this.getArea());
        if (noRefresh && this.finaldx !== undefined && this.finaldy !== undefined) {
            [efficientRows, maxRowLength] = this.getRowsForGivenOffset(
                this.finaldx, this.finaldy, dynamicOffsetDx, walkwaysLocalYCoordinates,  boundingBox, bBoxDimensions,
                tableMap, tableDimensions, relativeTilt, false, placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
            );
        }
        else {
            // loop for dy
            this.newRowSpacing = this.rowSpacing;
            // EW REWORK REQUIRED
            // if(this.rowSpacingMode != ROW_SPACING_MODE_AUTO && this.eastWestRackingEnabled){
            //     this.newRowSpacing = this.interRowSpacing
            // }
            // if(this.eastWestRackingEnabled) this.newRowSpacing += this.intraRowSpacing + this.tableDimensions.length * Math.cos(relativeTilt);
            const dyIncrement = (tableDimensions.length + this.newRowSpacing) /
                dynamicOffsetDy;

            for (let dy = 0; dy < tableDimensions.length + this.newRowSpacing; dy += dyIncrement) {
                const [rows, rowLength, dx] = this.getRowsForGivenOffset(
                    0, dy, dynamicOffsetDx, walkwaysLocalYCoordinates, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt, true, placablePolygonEdge,
                    allObstacleEdges, allWalkwayObstacleEdges
                );

                if (rowLength > maxRowLength) {
                    maxRowLength = rowLength;
                    efficientRows = rows.slice(0);
                    this.finaldx = dx;
                    this.finaldy = dy;
                }

            }
        }
        if(this.eastWestRackingEnabled) {
            const newDims = this.getTableDimensionsEW({reset: true});
            efficientRows.forEach((o) => {
                o.tableDimensions = newDims;
                o.ewflag = true;
                o.offset = this.intraRowSpacing;
            });
            this.makeRows(efficientRows, { withoutContainer });
        }
        else {
            this.makeRows(efficientRows, { withoutContainer });
        }
        // efficientRows.forEach((o) => {
        //     const topLeft = localToGlobalCoordinates({x: o.startPositionX, y: o.bottomPositionY}, boundingBox, bBoxDimensions);
        //     const bottomRight = localToGlobalCoordinates({x: o.endPositionX, y: o.topPositionY}, boundingBox, bBoxDimensions);

        //     const material = new THREE.LineBasicMaterial({
        //         color: 0x0000ff
        //     });
        //     const geometry = new THREE.BufferGeometry().setFromPoints( [
        //         new THREE.Vector3(topLeft.x, topLeft.y, 10),
        //         new THREE.Vector3(bottomRight.x, topLeft.y, 10),
        //         new THREE.Vector3(bottomRight.x, bottomRight.y, 10),
        //         new THREE.Vector3(topLeft.x, bottomRight.y, 10),
        //         new THREE.Vector3(topLeft.x, topLeft.y, 10),
        //     ] );
            
        //     const line = new THREE.Line( geometry, material );
        //     this.stage.sceneManager.scene.add(line);
        // });
    },

    getRowsForGivenOffset(
        givenDx, dy, dynamicOffsetDx, walkwaysLocalYCoordinates,
        boundingBox, bBoxDimensions, tableMap, tableDimensions, relativeTilt, iterateThroughDx = true,
        placablePolygonEdge, allObstacleEdges, allWalkwayObstacleEdges
    ) {
        const possibleRows = [];
        this.relativeTilt = relativeTilt;
        const newTableLength = tableDimensions.length;
    
        const lines = getRays(
            dy, relativeTilt, newTableLength, this.rowSpacing,
            walkwaysLocalYCoordinates, boundingBox, bBoxDimensions.yLength,
        );
        for(let i=0; i<lines.length; i++) {
            const obstaclePoints1 = [];
            const obstaclePoints2 = [];
            const edge1 = [lines[i][0], lines[i][1]];
            const edge2 = [lines[i][2], lines[i][3]];
            const obsRows = [];
            const placableStartEnd = [];
            const obstacleStartEnd = [];
            const topLocalPositionY = this
                .globalToLocalCoordinates(lines[i][0], boundingBox).y;
            const bottomLocalPositionY = this
                .globalToLocalCoordinates(lines[i][2], boundingBox).y;
            for(let j=0; j<placablePolygonEdge.length; j++) {
                let point1 = utils.checkLineIntersection(placablePolygonEdge[j], edge1);
                let point2 = utils.checkLineIntersection(placablePolygonEdge[j], edge2);
                if (point1.onLine1 && point1.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point1.x, point1.y), boundingBox);
                    obstaclePoints1.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
                if (point2.onLine1 && point2.onLine2) {
                    const p = this
                        .globalToLocalCoordinates(new THREE.Vector2(point2.x, point2.y), boundingBox);
                    obstaclePoints2.push({ x: p.x, y: p.y, belongsTo: undefined });
                }
            }
            obstaclePoints1.sort((a, b) => a.x - b.x);
            obstaclePoints2.sort((a, b) => a.x - b.x);
            if(obstaclePoints1.length>0 && obstaclePoints2.length>0) {
                let idx1 = 0;
                let idx2 = 0;
                let start, end;
                while(obstaclePoints1.length > idx1 && obstaclePoints2.length > idx2) {
                    if(obstaclePoints1[idx1].x > obstaclePoints2[idx2].x) {
                        start = obstaclePoints1[idx1];
                        if(obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2].x) {
                            end = obstaclePoints1[idx1 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx1 += 2;
                            continue;
                        }

                    }
                    else {
                        start = obstaclePoints2[idx2];
                        if(obstaclePoints2[idx2 + 1].x < obstaclePoints1[idx1].x) {
                            end = obstaclePoints2[idx2 + 1];
                            if(start > end) {
                                let temp = start;
                                start = end;
                                end = temp;
                            }
                            placableStartEnd.push({start:start, end:end});
                            idx2 += 2;
                            continue;
                        }

                    }
                    if (obstaclePoints1[idx1 + 1].x < obstaclePoints2[idx2 + 1].x) {
                        end = obstaclePoints1[idx1 + 1];
                        idx1 += 2;
                        if(idx1 < obstaclePoints1.length) {
                            if(obstaclePoints1[idx1].x > obstaclePoints2[idx2 + 1].x) {
                                idx2 += 2;
                            }
                        }
                    }
                    else {
                        end = obstaclePoints2[idx2 + 1];
                        idx2 += 2;
                        if(idx2 < obstaclePoints2.length) {
                            if(obstaclePoints2[idx2].x > obstaclePoints1[idx1 + 1].x) {
                                idx1 += 2;
                            }
                        }
                    }
                    if(start > end) {
                        let temp = start;
                        start = end;
                        end = temp;
                    }
                    placableStartEnd.push({start:start, end:end});
                }
            }
            if(placableStartEnd.length>0) {
                for(let j=0; j<allObstacleEdges.length; j++) {
                    const obstacleEdges = allObstacleEdges[j];
                    let minX = null;
                    let maxX = null;
                    for(let k=0; k<obstacleEdges.length; k++) {
                        let obsTopCoordinate,  obsBottomCoordinate, obsEdge1 = null, obsEdge2 = null ;
                        obsTopCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][0], boundingBox);
                        obsBottomCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][1], boundingBox);
                        if(obsTopCoordinate.y < obsBottomCoordinate.y) {
                            let temp = obsBottomCoordinate;
                            obsBottomCoordinate = obsTopCoordinate;
                            obsTopCoordinate = temp;
                        }
                        let point1 = utils.checkLineIntersection(obstacleEdges[k], edge1);
                        let point2 = utils.checkLineIntersection(obstacleEdges[k], edge2);
                        const obstacleEdge = obstacleEdges[k];
                        if(point1.onLine1 && point1.onLine2 && point2.onLine1 && point2.onLine2){
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                        }
                        else if(point1.onLine1 && point1.onLine2) {
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: undefined};
                            obsEdge2 = {x:obsTopCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        else if(point2.onLine1 && point2.onLine2) {
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: undefined};
                            obsEdge1 = {x:obsBottomCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                        }
                        else if(topLocalPositionY<=obsTopCoordinate.y && bottomLocalPositionY>=obsBottomCoordinate.y) {
                            obsEdge1 = {x:obsTopCoordinate.x , y:topLocalPositionY, belongsTo: undefined};
                            obsEdge2 = {x:obsBottomCoordinate.x , y:bottomLocalPositionY, belongsTo: undefined};
                        }
                        if(obsEdge1 && obsEdge2) {
                            if(minX == null){
                                if(obsEdge1.x < obsEdge2.x) {
                                    minX = obsEdge1;
                                    maxX = obsEdge2;
                                }
                                else {
                                    minX = obsEdge2;
                                    maxX = obsEdge1;
                                }
                            }
                            else {
                                if(obsEdge2.x > obsEdge1.x) {
                                    if(minX.x > obsEdge1.x) {
                                        minX = obsEdge1;
                                    }
                                    if(maxX.x < obsEdge2.x) {
                                        maxX = obsEdge2;
                                    }
                                }
                                else {
                                    if(minX.x > obsEdge2.x) {
                                        minX = obsEdge2;
                                    }
                                    if(maxX.x < obsEdge1.x) {
                                        maxX = obsEdge1;
                                    }
                                }
                            }
                        }
                    }
                    if(minX && maxX) {
                        if(minX > maxX) {
                            let temp = minX;
                            minX = maxX;
                            maxX = temp;
                        }
                        obstacleStartEnd.push({start:minX, end:maxX});
                    }
                }
                for(let j=0; j<allWalkwayObstacleEdges.length; j++) {
                    const obstacleEdges = allWalkwayObstacleEdges[j];
                    let minX = null;
                    let maxX = null;
                    for(let k=0; k<obstacleEdges.length; k++) {
                        let obsTopCoordinate,  obsBottomCoordinate, obsEdge1 = null, obsEdge2 = null ;
                        obsTopCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][0], boundingBox);
                        obsBottomCoordinate = this.globalToLocalCoordinates(obstacleEdges[k][1], boundingBox);
                        if(obsTopCoordinate.y < obsBottomCoordinate.y) {
                            let temp = obsBottomCoordinate;
                            obsBottomCoordinate = obsTopCoordinate;
                            obsTopCoordinate = temp;
                        }
                        let point1 = utils.checkLineIntersection(obstacleEdges[k], edge1);
                        let point2 = utils.checkLineIntersection(obstacleEdges[k], edge2);
                        const obstacleEdge = obstacleEdges[k];
                        if(point1.onLine1 && point1.onLine2 && point2.onLine1 && point2.onLine2){
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: WALKWAY};
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: WALKWAY};
                        }
                        else if(point1.onLine1 && point1.onLine2) {
                            const p0 = this.globalToLocalCoordinates({x:point1.x, y:point1.y, z:obstacleEdge[0].z}, boundingBox);
                            obsEdge1 = {x: p0.x, y:p0.y, belongsTo: WALKWAY};
                            obsEdge2 = {x:obsTopCoordinate.x , y:bottomLocalPositionY, belongsTo: WALKWAY};
                        }
                        else if(point2.onLine1 && point2.onLine2) {
                            const p1 = this.globalToLocalCoordinates({x:point2.x, y:point2.y, z:obstacleEdge[1].z}, boundingBox);
                            obsEdge2 = {x: p1.x, y:p1.y, belongsTo: WALKWAY};
                            obsEdge1 = {x:obsBottomCoordinate.x , y:topLocalPositionY, belongsTo: WALKWAY};
                        }
                        else if(topLocalPositionY<=obsTopCoordinate.y && bottomLocalPositionY>=obsBottomCoordinate.y) {
                            obsEdge1 = {x:obsTopCoordinate.x , y:topLocalPositionY, belongsTo: WALKWAY};
                            obsEdge2 = {x:obsBottomCoordinate.x , y:bottomLocalPositionY, belongsTo: WALKWAY};
                        }
                        if(obsEdge1 && obsEdge2) {
                            if(minX == null){
                                if(obsEdge1.x < obsEdge2.x) {
                                    minX = obsEdge1;
                                    maxX = obsEdge2;
                                }
                                else {
                                    minX = obsEdge2;
                                    maxX = obsEdge1;
                                }
                            }
                            else {
                                if(obsEdge2.x > obsEdge1.x) {
                                    if(minX.x > obsEdge1.x) {
                                        minX = obsEdge1;
                                    }
                                    if(maxX.x < obsEdge2.x) {
                                        maxX = obsEdge2;
                                    }
                                }
                                else {
                                    if(minX.x > obsEdge2.x) {
                                        minX = obsEdge2;
                                    }
                                    if(maxX.x < obsEdge1.x) {
                                        maxX = obsEdge1;
                                    }
                                }
                            }
                        }
                    }
                    if(minX && maxX) {
                        if(minX > maxX) {
                            let temp = minX;
                            minX = maxX;
                            maxX = temp;
                        }
                        obstacleStartEnd.push({start:minX, end:maxX});
                    }
                }
                let clonedObsPoints = [];
                obstacleStartEnd.sort((a,b) => a.start.x - b.start.x);
                if( obstacleStartEnd.length > 0) {
                    clonedObsPoints.push( obstacleStartEnd[0]);
                    let idx = 1;
                    while(obstacleStartEnd.length > idx) {
                        let clonedIdx = clonedObsPoints.length;
                        if(clonedObsPoints[clonedIdx - 1].end.x <  obstacleStartEnd[idx].start.x) {
                            clonedObsPoints.push(obstacleStartEnd[idx]);
                        }
                        else {
                            if(clonedObsPoints[clonedIdx - 1].start.x > obstacleStartEnd[idx].start.x) {
                                clonedObsPoints[clonedIdx - 1].start = obstacleStartEnd[idx].start;
                            }
                            if(clonedObsPoints[clonedIdx - 1].end.x < obstacleStartEnd[idx].end.x) {
                                clonedObsPoints[clonedIdx - 1].end = obstacleStartEnd[idx].end;
                            }
                        }
                        idx += 1;
                    }
                }
                placableStartEnd.sort((a,b) => a.start.x - b.start.x);
                clonedObsPoints.sort((a,b) => a.start.x - b.start.x);
                let obsIdx = 0, placableIdx = 0;
                let start = placableStartEnd[0].start, end = placableStartEnd[0].end;
                while(clonedObsPoints.length > obsIdx && placableStartEnd.length > placableIdx) {
                    if(clonedObsPoints[obsIdx].end.x < start.x) {
                        while(clonedObsPoints.length > obsIdx && clonedObsPoints[obsIdx].end.x < start.x) {
                            obsIdx += 1;
                        }
                    }
                    else if(clonedObsPoints[obsIdx].start.x < start.x && clonedObsPoints[obsIdx].end.x > start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                    }
                    else if(start.x < clonedObsPoints[obsIdx].start.x && clonedObsPoints[obsIdx].end.x < end.x) {
                        if(start.belongsTo == WALKWAY) {
                            obsRows.push({start: start, end:start});
                        }
                       obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                        if(clonedObsPoints[obsIdx].start.belongsTo == WALKWAY) {
                            obsRows.push({start: clonedObsPoints[obsIdx].start, end:clonedObsPoints[obsIdx].start});
                        }
                       start = clonedObsPoints[obsIdx].end;
                       obsIdx += 1;
                    }
                    else if(clonedObsPoints[obsIdx].start.x < end.x && end.x < clonedObsPoints[obsIdx].end.x) {
                        if(start.belongsTo == WALKWAY) {
                            obsRows.push({start: start, end:start});
                        }
                        obsRows.push({start: start, end:clonedObsPoints[obsIdx].start});
                        if(clonedObsPoints[obsIdx].start.belongsTo == WALKWAY) {
                            obsRows.push({start: clonedObsPoints[obsIdx].start, end:clonedObsPoints[obsIdx].start});
                        }
                        start = clonedObsPoints[obsIdx].end;
                        obsIdx += 1;
                        placableIdx += 1;
                        while(placableStartEnd.length > placableIdx && start.x >= end.x ) {
                            if(start.x < placableStartEnd[placableIdx].end.x) {
                                if(placableStartEnd[placableIdx].start.x >= start.x) {
                                    start = placableStartEnd[placableIdx].start;
                                }
                                end = placableStartEnd[placableIdx].end;
                                break;
                            }
                            placableIdx += 1;
                        }
                    }
                    else {
                        obsRows.push({start: start, end:end});
                        placableIdx += 1;
                        if(placableStartEnd.length <= placableIdx) {
                            start = end;
                            break;
                        }
                        start = placableStartEnd[placableIdx].start;
                        end = placableStartEnd[placableIdx].end;
                    }

                }
                placableIdx += 1;
                while(placableStartEnd.length > placableIdx) {
                    obsRows.push({start: start, end:end});
                    start = placableStartEnd[placableIdx].start;
                    end = placableStartEnd[placableIdx].end;
                    placableIdx += 1;
                }
                if(start.x < end.x) {
                    if(start.belongsTo == WALKWAY) {
                        obsRows.push({start: start, end:start});
                    }
                    obsRows.push({start: start, end:end});
                    if(end.belongsTo == WALKWAY) {
                        obsRows.push({start: end, end:end});
                    }
                }
                possibleRows.push({
                    obsRows,
                    minY: bottomLocalPositionY,
                    maxY: topLocalPositionY,
                });
                obsRows.slice(0);
            }
        }
        let efficientRows = [];
        let maxRowLength = 0;
        let efficientDx = 0;
        if (iterateThroughDx) {
            let rowLength = 0;
            let rows = [];
            const dxIncrement = (tableDimensions.width + this.tableSpacing) /
                dynamicOffsetDx;
            for (let dx = 0; dx < tableDimensions.width + this.tableSpacing; dx += dxIncrement) {
                [rows, rowLength] = this
                    .getRowsForDx(
                        dx, possibleRows, boundingBox, bBoxDimensions,
                        tableMap, tableDimensions, relativeTilt,
                    );
                if (rowLength > maxRowLength) {
                    efficientRows = rows.slice(0);
                    maxRowLength = rowLength;
                    efficientDx = dx;
                }
            }
        }
        else {
            [efficientRows, maxRowLength] = this
                .getRowsForDx(
                    givenDx, possibleRows, boundingBox, bBoxDimensions,
                    tableMap, tableDimensions, relativeTilt,
                );
        }
        return [efficientRows, maxRowLength, efficientDx];
    },

    getRowsForDx(dx, possibleRows, boundingBox, bBoxDimensions, tableMap, tableDimensions, relativeTilt) {
        let rowLength = 0;
        const rows = [];
        for (let rowIdx = 0; rowIdx < possibleRows.length; rowIdx += 1) {
            let walkwayJustification = dx;
            for (let obsRowsIdx = 0; obsRowsIdx < possibleRows[rowIdx]
                .obsRows.length; obsRowsIdx += 1) {
                const rowStartPoint = possibleRows[rowIdx].obsRows[obsRowsIdx].start;
                const rowEndPoint = possibleRows[rowIdx].obsRows[obsRowsIdx].end;
                let justifiedStartPoint = rowStartPoint.x;
                if (this.isJustified) {
                    if (rowStartPoint.belongsTo !== WALKWAY) {
                        const tableWidthMultiple = Math.ceil(Math
                            .abs(walkwayJustification - rowStartPoint.x) /
                            (tableDimensions.width + this.tableSpacing));
                        justifiedStartPoint = walkwayJustification + ((tableWidthMultiple) *
                            (tableDimensions.width + this.tableSpacing));
                        if (justifiedStartPoint - (tableDimensions.width + this.tableSpacing) >
                            rowStartPoint.x) {
                            justifiedStartPoint -= (tableDimensions.width + this.tableSpacing);
                        }
                    }
                    else if (rowStartPoint.belongsTo === WALKWAY) {
                        walkwayJustification = rowStartPoint.x;
                    }
                }
                const noOfTables = Math.floor((rowEndPoint.x - justifiedStartPoint) /
                    (tableDimensions.width + this.moduleSpacingWide));
                if (noOfTables > 0) {
                    rowLength += noOfTables;
                    const row = {
                        startPositionX: justifiedStartPoint,
                        endPositionX: rowEndPoint.x,
                        topPositionY: possibleRows[rowIdx].maxY,
                        bottomPositionY: possibleRows[rowIdx].minY,
                        boundingBox,
                        bBoxDimensions,
                        tableMap,
                        tableDimensions,
                        relativeTilt,
                    };
                    rows.push(row);
                }
            }
        }
        // if(this.eastWestRackingEnabled) rowLength *= 2;
        return [rows, rowLength];
    },

    makeRows(rows, { withoutContainer } = { withoutContainer: false }) {
        let rowsLength = rows.length;
        if (this.objectType === 'Gazebo') {
            rows[0] = rows;
            rowsLength = 1;
        }
        for (let i = 0; i < rowsLength; i += 1) {
            const rowMap = {
                id: i,
                frames: [],
            };
            const row = new Row(this.stage, rowMap, { withoutContainer }, true);
            this.addChild(row);
            row.autoPlacePanels(rows[i], { withoutContainer });
            row.saveState();
        }
        this.mergeGeometriesForAllPanels();
    },

    limitDCSize(allowedDCSize) {
        let currentDCSize = 0;
        let rowIdx = 0;
        for (; rowIdx < this.getChildren().length; rowIdx += 1) {
            const currentRow = this.getChildren()[rowIdx];
            const currentRowDCSize = currentRow.getDcSize();
            if (currentDCSize + currentRowDCSize >= allowedDCSize) {
                const tableIdx = Math.floor((allowedDCSize - currentDCSize) /
                    currentRow.getChildren()[0].getDcSize());
                if (tableIdx <= 0) {
                    rowIdx -= 1;
                }
                else {
                    currentRow.divideRow(currentRow.getChildren()[tableIdx]);
                }
                break;
            }
            currentDCSize += currentRowDCSize;
        }

        for (let i = this.getChildren().length - 1; i > rowIdx; i -= 1) {
            this.getChildren()[i].removeObject({
                shouldSaveState: true,
                deleteEmptyParent: true,
                showError: false,
            });
        }
    },

};




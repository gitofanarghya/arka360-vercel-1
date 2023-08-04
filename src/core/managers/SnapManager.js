import * as THREE from 'three';
import * as utils from '../utils/utils';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Tree from '../objects/model/Tree';
import Subarray from '../objects/subArray/Subarray';
import Walkway from '../objects/model/Walkway';
import Handrail from '../objects/model/Handrail';
import Property from '../objects/model/Property';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import Table from '../objects/subArray/Table';
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import RotationPoint from '../objects/subObjects/RotationPoint';
import {
    SNAP_RADIUS, NO_OF_CELLS,
    PANEL_ORIENTATION_PORTRAIT,
    PANEL_ORIENTATION_LANDSCAPE,
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
} from '../coreConstants';
import Dimension from '../objects/subObjects/Dimension';
import LassoSelectionTool from '../lib/LassoSelectionTool';
import { checkPointInsideVertices, convertVectorToArray, checkClockwise } from '../utils/utils';
import { checkPointOnGround, getTopModelFromPointForSnapping } from '../utils/raycastingUtils';
import { getNearestSubarrayForTableSnapping } from '../utils/subarrayUtils';
import { getSubarrays } from '../utils/exporters';
import Inverter from '../objects/ac/Inverter';
import DCDB from '../objects/ac/DCDB';
import ACDB from '../objects/ac/ACDB';
import Conduit from '../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import TextBox from '../objects/subObjects/TextBox';
import EdgeCentrePoints from '../objects/subObjects/EdgeCentrePoints';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import Dormer from '../objects/model/smartroof/Dormer';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import CombinerBox from '../objects/ac/CombinerBox';
import Fold from '../objects/model/smartroof/Fold';
import { Vector3 } from 'three';
import InnerEdge from '../objects/model/smartroof/InnerEdge';
import InstancedTable from '../objects/subArray/InstancedTable';
import OuterEdge from '../objects/model/smartroof/OuterEdge';
import Gazebo from '../lib/PowerGazebo';
import DualMapMarker from '../objects/subObjects/DualMapMarker';


export default class SnapManager {
    constructor(stage) {
        this.stage = stage;

        //objectgroup to hold snap line SnapLine
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.canvas = stage.rendererManager.getDomElement();

        this.mousePoint = new THREE.Vector3();
        this.isSnapping = true;

        this.offsetX = 0;
        this.offsetY = 0;

        this.selectedObject = null;
        this.isInitialized = false;
        // this.selectedObjects = null;
        // this.isInitializedForObjects = false;

        // A grid for storing points, lines and edges for each cell
        this.grid = {};

        // Store each grid cell width and height
        this.cellWidth = 0;
        this.cellHeight = 0;
        this.gridLeft = 0;
        this.gridBottom = 0;

        // Helper points, edges and lines to snap to
        this.helperPoints = [];
        this.helperEdges = [];
        this.helperLines = [];

        // For storing if vertex of current model has been snapped to another model or not
        this.isObjectSnapped = false;
        this.objectSnappedMousePoint = new THREE.Vector3();

        // Objects snapped
        // this.isObjectsSnapped = {};
        // this.objectsSnappedMousePoint = {};

        // Variables storing information regarding snapping table/panel
        this.negativeOffset = new THREE.Vector3();
        this.centroidToMouse = null;
        this.rotationAngle = 0;
        this.tableCellWidth = 0;
        this.tableCellHeight = 0;
        this.allSubarrayProperties = [];
        this.copiedObjectEdges = [];

        // this.negativeOffsets = {};
        // this.centroidsToMouse = {};
        // this.rotationAngles = {};
        // this.tableCellWidths = {};
        // this.tableCellHeights = {};
    }

    initGrid() {
        const gridLength = Math.max(
            this.stage.cameraManager.camera.right,
            this.stage.cameraManager.camera.top,
        );

        const gridWidth = gridLength * 2;
        const gridHeight = gridLength * 2;

        this.cellWidth = gridWidth / NO_OF_CELLS;
        this.cellHeight = gridHeight / NO_OF_CELLS;

        this.gridLeft = gridLength;
        this.gridBottom = gridLength;

        for (let x = 0; x < NO_OF_CELLS; x += 1) {
            for (let y = 0; y < NO_OF_CELLS; y += 1) {
                const hash = this.hashFunc(x, y);
                this.grid[hash] = {
                    vertices: [],
                    edges: [],
                    lines: [],
                };
            }
        }
    }

    get normalizedSnapRadius() {
        return SNAP_RADIUS / this.stage.getNormalisedZoom();
    }

    get snappedPoint() {
        const snappedPoint = new THREE.Vector3();
        snappedPoint.x = this.mousePoint.x + this.offsetX;
        snappedPoint.y = this.mousePoint.y + this.offsetY;
        snappedPoint.z = 0;

        return snappedPoint;
    }

    hashFunc(gridX, gridY) {
        return (gridX + NO_OF_CELLS * gridY);
    }

    getCell(point) {
        const cellX = Math.floor((point.x + this.gridLeft) / this.cellWidth);
        const cellY = Math.floor((point.y + this.gridBottom) / this.cellHeight);

        return [cellX, cellY];
    }

    getHash(point) {
        const [gridX, gridY] = this.getCell(point);

        return this.hashFunc(gridX, gridY);
    }

    isSnapOverride(event) {
        return (event.altKey);
    }

    initialize(
        object, curMousePoint = null,
        { mirrorMode } = { mirrorMode: false },
        { duplicateMode } = { duplicateMode: false },
    ) {
        if (!this.isInitialized) {
            this.isSnapping = true;
            this.selectedObject = object;

            // Set up grid
            this.initGrid();

            if (this.selectedObject instanceof PolygonModel
                || this.selectedObject instanceof SmartroofModel
                || this.selectedObject instanceof SmartroofFace
                || this.selectedObject instanceof Dormer
                || this.selectedObject instanceof Subarray
                || this.selectedObject instanceof CylinderModel
                || this.selectedObject instanceof Walkway
                || this.selectedObject instanceof Handrail
                || this.selectedObject instanceof Property
                || this.selectedObject instanceof AcCable
                || this.selectedObject instanceof DcCable
                || this.selectedObject instanceof Conduit
                || this.selectedObject instanceof DoubleConduit
                || this.selectedObject instanceof DoubleSeparateConduit
                || this.selectedObject instanceof SingleCableTray
                || this.selectedObject instanceof DoubleCableTray
                || this.selectedObject instanceof DoubleSeparateCableTray
                || this.selectedObject instanceof Dimension
                || this.selectedObject instanceof LassoSelectionTool
                || this.selectedObject instanceof Tree
                || this.selectedObject instanceof Inverter
                || this.selectedObject instanceof DCDB
                || this.selectedObject instanceof ACDB
                || this.selectedObject instanceof TextBox
                || this.selectedObject instanceof CombinerBox
                || this.selectedObject instanceof InnerEdge
                || this.selectedObject instanceof OuterEdge
            ) {
                // Add vertices and edges of other models already drawn on scene
                // if mirrorMode enabled snap to the vertices and edges of the selected model
                // else Loop through all scene models except for the selected model and its children
                if (mirrorMode) {
                    this.addVerticesAndEdgesOfCurrentObject();
                }
                else {
                    this.addDrawnVerticesAndEdges();
                    if (duplicateMode) {
                        this.addHelpersForPasting();
                    }
                }

                this.isInitialized = true;
            }
            else if (this.selectedObject instanceof Fold) {
                this.isInitialized = true;
            }
            else if (this.selectedObject instanceof OutlinePoints) {
                // Add vertices and edges of other models already drawn on scene
                this.addDrawnVerticesAndEdges();

                // Update Helpers to ease dragging outline point
                this.updateOutlinePointHelpers();

                // Add Helpers to stage
                this.addHelpers();

                this.isInitialized = true;
            }
            else if (this.selectedObject instanceof EdgeCentrePoints) {
                // Add vertices and edges of other models already drawn on scene
                this.addDrawnVerticesAndEdges();

                // Update Helpers to ease dragging outline point
                this.updateOutlinePointHelpers();

                // Update Helpers to ease dragging outline point
                this.updateEdgeCenterPointHelpers();

                // Add Helpers to stage
                this.addHelpers();

                this.isInitialized = true;
            }
            else if ((this.selectedObject instanceof Table) ||
                (Array.isArray(this.selectedObject) && this.selectedObject[0] instanceof Table)) {
                if (this.selectedObject instanceof Table) {
                    this.selectedObject = [this.selectedObject];
                }

                this.addTableGrid(curMousePoint);
                this.isInitialized = true;
            }
            else if (this.selectedObject instanceof RotationPoint || this.selectedObject instanceof DualMapMarker) {
                this.isInitialized = true;
            }
            else if (this.selectedObject instanceof InstancedTable){
                this.isInitialized = true;
            }
        }
        else {
            console.error('SnapManager: Already initialised with another selected object');
        }
    }

    isSnapped() {
        // Jugaad fix for table getting wrong height
        // when click dragging in add table mode
        if (this.stage.editMode.isClicked) {
            return false;
        }

        if (this.isInitialized || this.stage.editMode.snapWhileClicked()) {
            return this.isSnapping;
        }
        console.error('SnapManager: Not initialised so cannot return the snapping information');
        return undefined;
    }

    unInitialize() {
        if (this.isInitialized) {
            this.isSnapping = true;
            this.mousePoint = new THREE.Vector3();

            this.offsetX = 0;
            this.offsetY = 0;

            this.selectedObject = null;
            this.isInitialized = false;

            this.grid = {};

            this.helperPoints = [];
            this.helperEdges = [];
            this.helperLines = [];

            this.negativeOffset = new THREE.Vector3();
            this.allSubarrayProperties = [];
            this.centroidToMouse = null;
            this.rotationAngle = 0;
            this.tableCellWidth = 0;
            this.tableCellHeight = 0;
        }
        else {
            console.error('SnapManager: Cannot unInitialize - Already unIntialized');
        }
    }

    getValidAdjacentCells(point) {
        const [ gridX, gridY ] = this.getCell(point);

        // Transform the point so that it is not negative
        let newPoint = new THREE.Vector2(point.x + this.gridLeft, point.y + this.gridBottom);

        // Taking a margin of Snap Radius / 2 for calculating adjacent valid cells. Meaning if the point lies
        // inside a distance of half the snap radius from a side then also add the point to the grid adjacent
        // to corresponding side
        const leftBoundary = (gridX * this.cellWidth) + (this.normalizedSnapRadius / 2);
        const rightBoundary = ((gridX + 1) * this.cellWidth) - (this.normalizedSnapRadius / 2);
        const bottomBoundary = (gridY * this.cellHeight) + (this.normalizedSnapRadius / 2);
        const topBoundary = ((gridY + 1) * this.cellHeight) - (this.normalizedSnapRadius / 2);

        let adjacentCells = [];
        let leftOrRight = false;
        let topOrBottom = false;
        let diagonalGridX = gridX;
        let diagonalGridY = gridY;

        if (gridX > 0 && newPoint.x < leftBoundary) {
            adjacentCells.push([ gridX - 1, gridY ]);
            leftOrRight = true;
            diagonalGridX = gridX - 1;
        }
        else if (gridX < NO_OF_CELLS - 1 && newPoint.x > rightBoundary) {
            adjacentCells.push([ gridX + 1, gridY ]);
            leftOrRight = true;
            diagonalGridX = gridX + 1;
        }

        if (gridY > 0 && newPoint.y < bottomBoundary) {
            adjacentCells.push([ gridX, gridY - 1 ]);
            topOrBottom = true;
            diagonalGridY = gridY - 1;
        }
        else if (gridY < NO_OF_CELLS - 1 && newPoint.y > topBoundary) {
            adjacentCells.push([ gridX, gridY + 1 ]);
            topOrBottom = true;
            diagonalGridY = gridY + 1;
        }

        // Also check if point lies too close to cell vertex, then add point to corresponding diagonal vertex too
        if (leftOrRight && topOrBottom) {
            adjacentCells.push([ diagonalGridX, diagonalGridY ]);
        }

        return adjacentCells;
    }

    getCellsContainingEdge(point1, point2) {
        if(point1.distanceTo(point2) < 0.01) return [];
        let containingCells = [];
        let p1 = point1;
        let p2 = point2;

        let [ point1CellX, point1CellY ]  = this.getCell(point1);
        let [ point2CellX, point2CellY ] = this.getCell(point2);
        const ux = point2CellX - point1CellX;
        const uy = point2CellY - point1CellY;

        if (Math.abs(uy) >= Math.abs(ux)) {
            // Making p2 with greater y than p1
            if (point1CellY > point2CellY) {
                p1 = point2;
                p2 = point1;
            }

            // Add current cell to containing cells
            const [ gridX, gridY ] = this.getCell(p1);
            containingCells.push([ gridX, gridY ]);

            // If both points are in same cell, then return the cell
            if (point1CellY === point2CellY && point1CellX === point2CellX) {
                return containingCells;
            }

            // 0.001 added so that the grid of the passing point is the next grid and not the same grid when using getCell function
            let passingPoint = utils.pointOnLineWithY(p1, p2, (gridY + 1) * this.cellHeight - this.gridBottom + 0.001);
            let [ otherGridX, otherGridY ] = this.getCell(passingPoint);

            // If passing point is in adjacent cell, then add that too
            if (otherGridX !== gridX) {
                containingCells.push([ otherGridX, gridY ]);
            }
            // Otherwise check if passing point lies too close to left or right cells, and if so add those too
            else {
                const rightBoundary = ((gridX + 1) * this.cellWidth) - this.gridLeft - (this.normalizedSnapRadius / 2);
                const leftBoundary = (gridX * this.cellWidth) - this.gridLeft + (this.normalizedSnapRadius / 2);

                if (gridX > 0 && passingPoint.x < leftBoundary) {
                    containingCells.push([ gridX - 1, gridY ]);
                }
                else if (gridX < NO_OF_CELLS - 1 && passingPoint.x > rightBoundary) {
                    containingCells.push([ gridX + 1, gridY ]);
                }
            }

            let otherCells = this.getCellsContainingEdge(passingPoint, p2);

            containingCells.push(...otherCells);
        }
        else {
            // Making p2 with greater x than p1
            if (point1CellX > point2CellX) {
                p1 = point2;
                p2 = point1;
            }

            // Add current cell to containing cells
            const [ gridX, gridY ] = this.getCell(p1);
            containingCells.push([ gridX, gridY ]);

            // If both points are in same cell, then return the cell
            if (point1CellY === point2CellY && point1CellX === point2CellX) {
                return containingCells;
            }

            // 0.001 added so that the grid of the passing point is the next grid and not the same grid when using getCell function
            let passingPoint = utils.pointOnLineWithX(p1, p2, (gridX + 1) * this.cellWidth - this.gridLeft + 0.001);
            let [ otherGridX, otherGridY ] = this.getCell(passingPoint);

            // If passing point is in adjacent cell, then add that too
            if (otherGridY !== gridY) {
                containingCells.push([ gridX, otherGridY ]);
            }
            // otherwise check if passing point lies too close to bottom or top cells, and if so add those too
            else {
                const bottomBoundary = (gridY * this.cellHeight) + (this.normalizedSnapRadius / 2) - this.gridBottom;
                const topBoundary = ((gridY + 1) * this.cellHeight) - (this.normalizedSnapRadius / 2) - this.gridBottom;

                if (gridY > 0 && passingPoint.y < bottomBoundary) {
                    containingCells.push([ gridX, gridY - 1 ]);
                }
                else if (gridY < NO_OF_CELLS - 1 && passingPoint.y > topBoundary) {
                    containingCells.push([ gridX, gridY + 1 ]);
                }
            }

            let otherCells = this.getCellsContainingEdge(passingPoint, p2);

            containingCells.push(...otherCells);
        }

        return containingCells;
    }

    addVertex(point) {
        if (point.isVector2) {
            let validCells = [];
            // Add the cell the point belongs to
            validCells.push(this.getCell(point));
            // Add adjacent cells if the point lies too close to a side of cell
            validCells.push(...this.getValidAdjacentCells(point));
            for (let i = 0, len = validCells.length; i < len; i += 1) {
                const cell = validCells[i];
                if (cell[ 0 ] < NO_OF_CELLS && cell[ 0 ] >= 0
                    && cell[ 1 ] < NO_OF_CELLS && cell[ 1 ] >= 0
                ) {
                    const hash = this.hashFunc(cell[ 0 ], cell[ 1 ]);
                    this.grid[ hash ].vertices.push(point);
                }
            }
        }
        else {
            console.error("ERROR: SnapManager: Vertex to add is not Vector2");
        }
    }

    addEdge(edge) {
        if (edge[ 0 ].isVector2 && edge[ 1 ].isVector2) {
            // get all cells the edge pass through
            let validCells = this.getCellsContainingEdge(edge[ 0 ], edge[ 1 ]);

            // Get valid adjacent cells for both edge end points and add them too if they are already not added
            for (let i = 0, len1 = edge.length; i < len1; i += 1) {
                const vertex = edge[i];
                const validAdjacentCells = this.getValidAdjacentCells(vertex);
                for (let j = 0, len2 = validAdjacentCells.length; j < len2; j += 1) {
                    const adjCell = validAdjacentCells[j];
                    let isFound = false;

                    for (let k = 0, len3 = validCells.length; k < len3; k += 1) {
                        const cell = validCells[k];
                        if (adjCell[ 0 ] === cell[ 0 ] && adjCell[ 1 ] === cell[ 1 ]) {
                            isFound = true;
                            break;
                        }
                    }

                    if (!isFound) {
                        validCells.push(adjCell);
                    }
                }
            }
            for (let i = 0, len = validCells.length; i < len; i += 1) {
                const cell = validCells[i];
                const hash = this.hashFunc(cell[ 0 ], cell[ 1 ]);
                if(this.grid[hash]) this.grid[ hash ].edges.push(edge);
            }
        }
        else {
            console.error("ERROR: SnapManager: End points of edge are not Vector2");
        }
    }

    addLine(line) {
        if (line[ 0 ].isVector2 && line[ 1 ].isVector2) {
            let extendedLine = [ new THREE.Vector2(), new THREE.Vector2() ];
            let curIndex = 0;

            // Subtract Snap radius / 2 from top and right boundaries as exactly getting a point on these
            // lead to cells outside the grid being considered whose hash is not present in grid
            const leftBoundary = 0 - this.gridLeft;
            const rightBoundary = (NO_OF_CELLS * this.cellWidth) - this.gridLeft - this.normalizedSnapRadius / 2;
            const bottomBoundary = 0 - this.gridBottom;
            const topBoundary = (NO_OF_CELLS * this.cellHeight) - this.gridBottom - this.normalizedSnapRadius / 2;

            // Check against left boundary
            let point = utils.pointOnLineWithX(line[ 0 ], line[ 1 ], leftBoundary);

            if (point !== null && point.y >= bottomBoundary && point.y < topBoundary) {
                extendedLine[ curIndex ] = point.clone();
                curIndex++;
            }

            // Check against right boundary
            point = utils.pointOnLineWithX(line[ 0 ], line[ 1 ], rightBoundary);

            if (point !== null && point.y >= bottomBoundary && point.y < topBoundary) {
                extendedLine[ curIndex ] = point.clone();
                curIndex++;
            }

            // Check against bottom boundary
            point = utils.pointOnLineWithY(line[ 0 ], line[ 1 ], bottomBoundary);

            if (point !== null && point.x >= leftBoundary && point.x < rightBoundary) {
                extendedLine[ curIndex ] = point.clone();
                curIndex++;
            }

            // Check against top boundary
            point = utils.pointOnLineWithY(line[ 0 ], line[ 1 ], topBoundary);

            if (point !== null && point.x >= leftBoundary && point.x < rightBoundary) {
                extendedLine[ curIndex ] = point.clone();
                curIndex++;
            }

            // TODO: Has to be thought through and fixed - should work for now
            if (curIndex !== 2) {
                return;
            }


            // get all cells the line pass through
            let validCells = this.getCellsContainingEdge(extendedLine[ 0 ], extendedLine[ 1 ]);

            // Get valid adjacent cells for both extended line end points and add them too if they are already not added
            for (let i = 0, len1 = extendedLine.length; i < len1; i += 1) {
                const vertex = extendedLine[i];
                const validAdjacentCells = this.getValidAdjacentCells(vertex);
                for (let j = 0, len2 = validAdjacentCells.length; j < len2; j += 1) {
                    const adjCell = validAdjacentCells[j];
                    let isFound = false;

                    for (let k = 0, len3 = validCells.length; k < len3; k += 1) {
                        const cell = validCells[k];
                        if (adjCell[ 0 ] === cell[ 0 ] && adjCell[ 1 ] === cell[ 1 ]) {
                            isFound = true;
                            break;
                        }
                    }

                    if (!isFound) {
                        validCells.push(adjCell);
                    }
                }
            }

            for (let i = 0, len = validCells.length; i < len; i += 1) {
                const cell = validCells[i];
                const hash = this.hashFunc(cell[ 0 ], cell[ 1 ]);
                this.grid[ hash ].lines.push(line);
            }
        }
        else {
            console.error("ERROR: SnapManager: End points of line are not Vector2");
        }
    }

    removeVertex(point) {
        if (point.isVector2) {
            const keys = Object.keys(this.grid);
            const len = keys.length;
            for (let i = 0; i < len; i += 1) {
                const hash = keys[i];
                const cell = this.grid[hash];

                for (let j = 0; j < cell.vertices.length - 1; j++) {
                    if (point.equals(cell.vertices[j])) {
                        cell.vertices.splice(j, 1);
                    }
                }
            }
        }
        else {
            console.error('ERROR: SnapManager: Point to remove is not Vector2');
        }
    }

    removeEdge(edge) {
        const start = edge[0];
        const end = edge[1];

        if (start.isVector2 && end.isVector2) {
            const keys = Object.keys(this.grid);
            const len = keys.length;
            for (let i = 0; i < len; i += 1) {
                const hash = keys[i];
                const cell = this.grid[hash];

                for (let j = 0; j < cell.edges.length; j++) {
                    if ((start.equals(cell.edges[j][0]) && end.equals(cell.edges[j][1]))
                        || (end.equals(cell.edges[j][0]) && start.equals(cell.edges[j][1]))
                    ) {
                        cell.edges.splice(j, 1);
                    }
                }
            }
        }
        else {
            console.error('ERROR: SnapManager: End points of edge are not Vector2');
        }
    }

    removeLine(line) {
        const start = line[0];
        const end = line[1];

        if (start.isVector2 && end.isVector2) {
            const keys = Object.keys(this.grid);
            const len = keys.length;
            for (let i = 0; i < len; i += 1) {
                const hash = keys[i];
                const cell = this.grid[hash];

                for (let j = 0; j < cell.lines.length; j++) {
                    if ((start.equals(cell.lines[j][0]) && end.equals(cell.lines[j][1]))
                        || (end.equals(cell.lines[j][0]) && start.equals(cell.lines[j][1]))
                    ) {
                        cell.lines.splice(j, 1);
                    }
                }
            }
        }
        else {
            console.error('ERROR: SnapManager: End points of line are not Vector2');
        }
    }

    addHelpers() {
        for (let i = 0, len = this.helperPoints.length; i < len; i += 1) {
            const point = this.helperPoints[i];
            this.addVertex(point);
        }
        for (let i = 0, len = this.helperEdges.length; i < len; i += 1) {
            const edge = this.helperEdges[i];
            this.addEdge(edge);
        }
        for (let i = 0, len = this.helperLines.length; i < len; i += 1) {
            const line = this.helperLines[i];
            this.addLine(line);
        }
    }

    removeHelpers() {
        for (let i = 0, len = this.helperPoints.length; i < len; i += 1) {
            const point = this.helperPoints[i];
            this.removeVertex(point);
        }
        for (let i = 0, len = this.helperEdges.length; i < len; i += 1) {
            const edge = this.helperEdges[i];
            this.removeEdge(edge);
        }
        for (let i = 0, len = this.helperLines.length; i < len; i += 1) {
            const line = this.helperLines[i];
            this.removeLine(line);
        }

        // Empty out helpers
        this.helperPoints = [];
        this.helperEdges = [];
        this.helperLines = [];
    }

    addHelpersForPasting() {
        const modelEdges = this.selectedObject.getEdges();
        const modelPosition = this.selectedObject.getPosition();
        for (let i = 0, len = modelEdges.length; i < len; i += 1) {
            const { perpendicularIntersectionPoint } = utils.getPerpendicularDistanceSq(
                modelPosition,
                modelEdges[i][0],
                modelEdges[i][1],
            );
            const perpendicularHelperLines = utils.getLineWithAngle(
                perpendicularIntersectionPoint,
                modelEdges[i][1],
                Math.PI / 2,
            );
            this.helperLines.push(perpendicularHelperLines);
        }
        this.addHelpers();
    }

    addVerticesAndEdgesOfCurrentObject() {
        const vector2DVertices =
        utils.convertArrayToVector(this.selectedObject.get2DVertices());
        for (let i = 0, len = vector2DVertices.length; i < len; i += 1) {
            this.addVertex(vector2DVertices[i]);
        }
        // Add edges in vector form
        const edges = this.selectedObject.getEdges();
        for (let i = 0, len = edges.length; i < len; i += 1) {
            this.addEdge(edges[i]);
        }
    }

    addDrawnVerticesAndEdges() {
        // Get names of all children of the selected object
        const children = utils.getAllChildren(this.selectedObject);
        const childrenNames = children.map(element => element.name);

        const sceneChildren = this.stage.sceneManager.scene.children;
        for (let c = 0, sceneLen = sceneChildren.length; c < sceneLen; c += 1) {
            const object = sceneChildren[c].container;
            if (
                (object instanceof PolygonModel
                    || object instanceof SmartroofModel
                    || object instanceof SmartroofFace
                    || object instanceof Dormer
                    || object instanceof Walkway
                    || object instanceof Handrail
                    || object instanceof Property
                    || object instanceof CylinderModel
                    || object instanceof Tree
                    || object instanceof Inverter
                    || object instanceof DCDB
                    || object instanceof ACDB
                    || object instanceof CombinerBox
                    || (object instanceof Table
                        && this.selectedObject instanceof Dimension))
                && object.name !== this.selectedObject.name
                && !childrenNames.includes(object.name)
            ) {
                // Add vertices in vector form
                const vector2DVertices =
                    utils.convertArrayToVector(object.get2DVertices());
                for (let i = 0, len = vector2DVertices.length; i < len; i += 1) {
                    this.addVertex(vector2DVertices[i]);
                }

                // add edgeCenters of the polygon
                if (object instanceof PolygonModel) {
                    const vector2DEdgeCentres =
                        utils.convertArrayToVector(object.get2DEdgeCentres());
                    for (let i = 0, len = vector2DEdgeCentres.length; i < len; i += 1) {
                        this.addVertex(vector2DEdgeCentres[i]);
                    }
                }

                // add edgeCenters of the Cable
                if (object instanceof AcCable || object instanceof DcCable || object instanceof Conduit
                    || object instanceof DoubleConduit || object instanceof DoubleSeparateConduit ||
                    object instanceof SingleCableTray || object instanceof DoubleCableTray || object instanceof DoubleSeparateCableTray) {
                    const vector2DEdgeCentres =
                        utils.convertArrayToVector(object.get2DEdgeCentres());
                    for (let i = 0, len = vector2DEdgeCentres.length; i < len; i += 1) {
                        this.addVertex(vector2DEdgeCentres[i]);
                    }
                }

                // add centre for cylinder model
                if (object instanceof CylinderModel) {
                    this.addVertex(new THREE.Vector2(...object.getPosition().toArray()));
                }

                // Add edges in vector form
                const edges = object.getEdges();
                for (let i = 0, len = edges.length; i < len; i += 1) {
                    this.addEdge(edges[i]);
                }
            }
        }
    }

    addTableGrid(curMousePoint) {
        if (curMousePoint !== null) {
            this.startMousePoint = curMousePoint.clone();
            this.selectedObjectCentroid = {};
            for (let i = 0, len = this.selectedObject.length; i < len; i += 1) {
                const selectedObject = this.selectedObject[i];
                this.selectedObjectCentroid[selectedObject.getId()] = selectedObject.getPosition();
            }
        }
        this.updateTableGrid();
    }

    /**
     * Update all the required properties of all the subarrays
     * to consider for snapping in a global array.
     */
    updateTableGrid() {
        this.allSubarrayProperties = [];
        if (this.selectedObject[0].getSubarray().addTableFlow) {
            if (!this.selectedObject[0].clickToAdd) {
                const allSubarraySiblings =
                    this.selectedObject[0].getSubarray().getParent().getChildren();
                for (let i = 0, len = allSubarraySiblings.length; i < len; i += 1) {
                    if (allSubarraySiblings[i] instanceof Subarray) {
                        const property = allSubarraySiblings[i].getState();
                        property.subarray = allSubarraySiblings[i];
                        this.allSubarrayProperties.push(property);
                    }
                }
            }
            else {
                const subarrays = [];
                getSubarrays(this.stage.ground, subarrays);
                for (let i = 0, len = subarrays.length; i < len; i += 1) {
                    const property = subarrays[i].getState();
                    property.subarray = subarrays[i];
                    this.allSubarrayProperties.push(property);
                }
            }
        }
    }

    updateOnAddingPoint() {
        if (this.selectedObject instanceof PolygonModel
            || this.selectedObject instanceof SmartroofModel
            || this.selectedObject instanceof Subarray
            || this.selectedObject instanceof Walkway
            || this.selectedObject instanceof Handrail
            || this.selectedObject instanceof Property
            || this.selectedObject instanceof Dimension
            || this.selectedObject instanceof LassoSelectionTool
            || this.selectedObject instanceof CylinderModel
            || this.selectedObject instanceof Tree) {
            // NOTE: Shouldn't happen, enable it if required in future
            // this.addUpdatedPolygon();

            // Remove current helpers
            this.removeHelpers();

            // Update helper arrays
            this.updatePolygonHelpers(utils
                .convertArrayToVector(this.stage.drawManager.get2DVertices()));

            // Add helpers to stage
            this.addHelpers();
        }
    }

    // NOTE: Shouldn't happen, enable it if required in future
    addUpdatedPolygon() {
        const drawingVertices = utils.convertArrayToVector(this.stage.drawManager.get2DVertices());
        const numVertices = this.stage.drawManager.getNoOfVertices();

        const lastPoint = drawingVertices[numVertices - 1];

        // Add last drawn point
        this.addVertex(lastPoint);

        if (numVertices >= 2) {
            const secondLastPoint = drawingVertices[numVertices - 2];

            // Add last drawn edge
            this.addEdge([secondLastPoint, lastPoint]);
        }
    }

    updatePolygonHelpers(drawingVertices) {
        const numVertices = drawingVertices.length;

        if (numVertices === 1) {
            // get intersecting edges and add helper line parallel and perpendicular to edges
            const firstPoint = drawingVertices[0];
            const hash = this.getHash(firstPoint);
            if (Object.prototype.hasOwnProperty.call(this.grid, `${hash}`)) {
                const { edges } = this.grid[hash];
                const intersectingEdges = utils.getEdgesContainingVertex(firstPoint, edges);
                for (let i = 0, len = intersectingEdges.length; i < len; i += 1) {
                    if (intersectingEdges[i][0].distanceTo(firstPoint) >
                        intersectingEdges[i][1].distanceTo(firstPoint)) {
                        intersectingEdges[i].reverse();
                    }
                    this.helperLines.push(utils.getLineWithAngle(
                        firstPoint,
                        intersectingEdges[i][1],
                        Math.PI / 2,
                    ));
                }
                //TODO: Need to be changed in future because we cant get smartroofmodel from getTopModelFromPoint()
                const topModel = getTopModelFromPointForSnapping(firstPoint, this.stage)[0];
                let topModelEdges = [];
                let topModelVertices = [];
                if (topModel instanceof PolygonModel) {
                    topModelEdges = topModel.getEdges();
                    topModelVertices = topModel.get2DVertices();
                }
                else if (topModel instanceof SmartroofModel) {
                    const smartRoofFace = topModel.getChildren().filter((children) => {
                        const raycaster = new THREE.Raycaster(new Vector3(firstPoint.x, firstPoint.y, 500), new Vector3(0, 0, -1));
                        const intersects = [];
                        children.faceMesh.raycast(raycaster, intersects);
                        return intersects.length > 0;
                        // checkPointInsideVertices(children.get2DVertices(), [firstPoint.x, firstPoint.y]
                    });
                    if (smartRoofFace[0]) {
                        topModelEdges = smartRoofFace[0].getEdges();
                        topModelVertices = smartRoofFace[0].get2DVertices();
                    }
                    else {
                        topModelEdges = null;
                        topModelVertices = null;
                    }
                }
                if (topModelEdges && topModelVertices) {
                    if (topModel instanceof PolygonModel || topModel instanceof SmartroofModel) {
                        if (checkClockwise(topModelVertices)) {
                            for (let i = 0, len = topModelEdges.length; i < len; i += 1) {
                                const { perpendicularDistanceSq, perpendicularIntersectionPoint } = utils.getPerpendicularDistanceSq(
                                    firstPoint,
                                    topModelEdges[i][0],
                                    topModelEdges[i][1],
                                );
                                const perpendicularHelperLines = utils.getLineWithAngle(
                                    perpendicularIntersectionPoint,
                                    topModelEdges[i][1],
                                    Math.PI / 2,
                                );
                                const parallelHelperLine = utils.getNormalPoints(
                                    topModelEdges[i][0],
                                    topModelEdges[i][1],
                                    Math.sqrt(perpendicularDistanceSq),
                                );
                                this.helperLines.push(parallelHelperLine, perpendicularHelperLines);
                            }
                        }
                        else {
                            for (let i = 0, len = topModelEdges.length; i < len; i += 1) {
                                const { perpendicularDistanceSq, perpendicularIntersectionPoint } = utils.getPerpendicularDistanceSq(
                                    firstPoint,
                                    topModelEdges[i][1],
                                    topModelEdges[i][0],
                                );
                                
                                const perpendicularHelperLines = utils.getLineWithAngle(
                                    perpendicularIntersectionPoint,
                                    topModelEdges[i][0],
                                    Math.PI / 2,
                                );
                                const parallelHelperLine = utils.getNormalPoints(
                                    topModelEdges[i][1],
                                    topModelEdges[i][0],
                                    Math.sqrt(perpendicularDistanceSq),
                                );
                                this.helperLines.push(parallelHelperLine, perpendicularHelperLines);
                            }
                        }
                    }
                }
            }
        }
        else if (numVertices >= 2) {
            const lastPoint = drawingVertices[numVertices - 1];
            const secondLastPoint = drawingVertices[numVertices - 2];
            const firstPoint = drawingVertices[0];

            // add first point used for completing object
            this.helperPoints.push(firstPoint);

            // Add imaginary edge joining last point to first point
            this.helperEdges.push([lastPoint, firstPoint]);

            // Create a vector from second last vertex to last vertex
            const lastEdgeVec = new THREE.Vector3(
                lastPoint.x - secondLastPoint.x,
                lastPoint.y - secondLastPoint.y,
                0,
            );

            for (let i = 1; i <= 6; i += 1) {
                // Add lines with multiples of 30 to last point of edge and also add points
                //  on right angle lines with same length as current line
                const helperLine = utils
                    .getLineWithAngle(lastPoint, secondLastPoint, (Math.PI / 6) * i);
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);
                const helpVec = new THREE.Vector3(
                    helperLine[1].x - lastPoint.x,
                    helperLine[1].y - lastPoint.y,
                    0,
                );
                const intersect = utils.getIntersectionPoint(
                    firstPoint,
                    lastEdgeVec.clone().normalize(),
                    lastPoint,
                    helpVec.normalize(),
                );
                if (intersect !== null) {
                    this.helperPoints.push(intersect);
                }
            }
            //
            for (let i = 0; i <= 4; i++) {
                //  Add lines with angle of 45, 135, 225, 315 to last point of edge and also add points
                //  on right angle lines with same length as current line
                const helperLine = utils
                    .getLineWithAngle(lastPoint, secondLastPoint, (Math.PI / 4) + ((Math.PI / 2) * i));
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);
                const helpVec = new THREE.Vector3(
                    helperLine[1].x - lastPoint.x,
                    helperLine[1].y - lastPoint.y,
                    0,
                );
                const intersect = utils.getIntersectionPoint(
                    firstPoint,
                    lastEdgeVec.clone().normalize(),
                    lastPoint,
                    helpVec.normalize(),
                );
                if (intersect !== null) {
                    this.helperPoints.push(intersect);
                }
            }
            let helperLine;
            let helpVec;
            let intersect;
            if (numVertices === 2) {
                // Add right angle lines to first point of edge and also add points on right angle
                // lines with same length as current line
                helperLine = utils.getLineWithAngle(firstPoint, lastPoint, Math.PI / 2);
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);

                // Add 180 degree angle lines to first point of edge and also add points on 180
                // degree angle lines with same length as current line
                helperLine = utils.getLineWithAngle(firstPoint, lastPoint, Math.PI);
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);
            }

            if (numVertices >= 3) {
                const thirdLastPoint = drawingVertices[numVertices - 3];

                // Create a vector from second last vertex to third last vertex
                const secondLastEdgeVec = new THREE.Vector3(
                    thirdLastPoint.x - secondLastPoint.x,
                    thirdLastPoint.y - secondLastPoint.y,
                    0,
                );

                // Get angle between above 2 edge vectors
                const angle = lastEdgeVec.angleTo(secondLastEdgeVec);

                // Get length of second last edge
                const length = secondLastPoint.distanceTo(thirdLastPoint);

                // Get line which makes same angle with last edge as the
                // angle between second last edge and last edge
                helperLine = utils.getLineWithAngle(lastPoint, secondLastPoint, angle, length);
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);
                helpVec = new THREE.Vector3(
                    helperLine[1].x - lastPoint.x,
                    helperLine[1].y - lastPoint.y,
                    0,
                );
                intersect = utils.getIntersectionPoint(
                    firstPoint,
                    lastEdgeVec.clone().normalize(),
                    lastPoint,
                    helpVec.normalize(),
                );
                if (intersect !== null) {
                    this.helperPoints.push(intersect);
                }

                // Get line which makes an angle of (pi - angle b/w second last edge and last edge)
                helperLine = utils.getLineWithAngle(
                    lastPoint,
                    secondLastPoint,
                    Math.PI - angle,
                    length,
                );
                this.helperPoints.push(...helperLine);
                this.helperLines.push(helperLine);
                helpVec = new THREE.Vector3(
                    helperLine[1].x - lastPoint.x,
                    helperLine[1].y - lastPoint.y,
                    0,
                );
                intersect = utils.getIntersectionPoint(
                    firstPoint,
                    lastEdgeVec.clone().normalize(),
                    lastPoint,
                    helpVec.normalize(),
                );
                if (intersect !== null) {
                    this.helperPoints.push(intersect);
                }
            }
        }
    }

    updateOutlinePointHelpers() {
        // Remove the outline point from vertices of belonging model and then call
        // updatePolygonHelpers with remaining vertices twice. Once by taking next vertex as last
        // vertex and again by taking previous vertex as last
        let vertices = [];
        if (this.selectedObject.belongsTo instanceof CylinderModel
            || this.selectedObject.belongsTo instanceof Tree) {
            vertices = utils.convertArrayToVector(this.selectedObject.belongsTo
                .get2DOutlineVertices());
        }
        else {
            vertices = utils.convertArrayToVector(this.selectedObject.belongsTo.get2DVertices());
        }

        const numVertices = vertices.length;
        const outlinePoint = this.selectedObject.getPosition();
        const forwardCycle = [];
        const backwardCycle = [];
        let index = -1;

        for (let i = 0; i < numVertices; i += 1) {
            if (Math.abs(vertices[i].x - outlinePoint.x) < 0.00001
                && Math.abs(vertices[i].y - outlinePoint.y) < 0.00001
            ) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            console.error('ERROR: SnapManager: Outline Point not found in belonging model');

            return;
        }

        let idx = index + 1;

        while (idx !== index) {
            if (idx >= numVertices) {
                idx = 0;
                continue;
            }

            forwardCycle.push(vertices[idx]);
            idx += 1;
        }

        idx = index - 1;

        while (idx !== index) {
            if (idx < 0) {
                idx = numVertices - 1;
                continue;
            }

            backwardCycle.push(vertices[idx]);
            idx -= 1;
        }

        // Add line joining outline point and previous vertex
        this.helperLines.push([vertices[idx], backwardCycle[0]]);

        // Add line joining outline point and next vertex
        this.helperLines.push([vertices[idx], forwardCycle[0]]);

        // Add helpers for both forward and backward vertices cycles
        this.updatePolygonHelpers(forwardCycle);
        this.updatePolygonHelpers(backwardCycle);
    }

    updateEdgeCenterPointHelpers() {
        // Remove the outline point from vertices of belonging model and then call
        // updatePolygonHelpers with remaining vertices twice. Once by taking next vertex as last
        // vertex and again by taking previous vertex as last
        let vertices = [];
        if (this.selectedObject.belongsTo instanceof PolygonModel ||
            this.selectedObject.belongsTo instanceof AcCable ||
            this.selectedObject.belongsTo instanceof DcCable ||
            this.selectedObject.belongsTo instanceof Conduit ||
            this.selectedObject.belongsTo instanceof DoubleConduit ||
            this.selectedObject.belongsTo instanceof DoubleSeparateConduit||
            this.selectedObject.belongsTo instanceof SingleCableTray ||
            this.selectedObject.belongsTo instanceof DoubleCableTray ||
            this.selectedObject.belongsTo instanceof DoubleSeparateCableTray
            ) {
            vertices = utils.convertArrayToVector(this.selectedObject.belongsTo.get2DEdgeCentres());
        }
        const numVertices = vertices.length;
        const outlinePoint = this.selectedObject.getPosition();
        const forwardCycle = [];
        const backwardCycle = [];
        let index = -1;

        for (let i = 0; i < numVertices; i += 1) {
            if (Math.abs(vertices[i].x - outlinePoint.x) < 0.00001
                && Math.abs(vertices[i].y - outlinePoint.y) < 0.00001
            ) {
                index = i;
                break;
            }
        }

        if (index === -1) {
            console.error('ERROR: SnapManager: Outline Point not found in belonging model');

            return;
        }

        let idx = index + 1;

        while (idx !== index) {
            if (idx >= numVertices) {
                idx = 0;
                continue;
            }

            forwardCycle.push(vertices[idx]);
            idx += 1;
        }

        idx = index - 1;

        while (idx !== index) {
            if (idx < 0) {
                idx = numVertices - 1;
                continue;
            }

            backwardCycle.push(vertices[idx]);
            idx -= 1;
        }

        // Add line joining outline point and previous vertex
        this.helperLines.push([vertices[idx], backwardCycle[0]]);

        // Add line joining outline point and next vertex
        this.helperLines.push([vertices[idx], forwardCycle[0]]);

        // Add helpers for both forward and backward vertices cycles
        this.updatePolygonHelpers(forwardCycle);
        this.updatePolygonHelpers(backwardCycle);
    }

    vertexToVertexSnap(curPoint, snapPoint) {
        return this.snapToPoint(curPoint, snapPoint);
    }

    vertexToEdgeSnap(curPoint, edge) {
        return this.snapToEdge(curPoint, edge);
    }

    vertexToLineSnap(curPoint, line) {
        return this.snapToEdge(curPoint, line, false);
    }

    edgeToVertexSnap(curEdge, vertex) {
        if (this.snapToEdge(vertex, curEdge)) {
            this.offsetX = -this.offsetX;
            this.offsetY = -this.offsetY;

            return true;
        }
        return false;
    }

    vertexSnap(event) {
        this.clearSnapLine(); // remove perivous snap line if the mouse is not on snap line
        if (!this.isInitialized) {
            console.error('ERROR: SnapManager: Snap Manager not initialised before trying to snap');
        }

        this.mousePoint =
            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);

        // shift snap functionality
        if (event.shiftKey) {
            return this.shiftSnap(this.mousePoint);
        }

        if (this.isSnapOverride(event)) {
            this.isSnapping = false;
            return this.mousePoint.clone();
        }

        const hash = this.getHash(this.mousePoint);

        if (!Object.prototype.hasOwnProperty.call(this.grid, `${hash}`)) {
            this.isSnapping = false;
            return this.mousePoint.clone();
        }

        const { vertices } = this.grid[hash];
        const { lines } = this.grid[hash];
        const { edges } = this.grid[hash];

        // Get nearest vertex from mouse point
        const [vertex] = utils.nearestVertexToVertex(this.mousePoint, vertices);

        // Check for vertex to vertex snapping
        if (vertex !== null && this.vertexToVertexSnap(this.mousePoint, vertex)) {
            this.drawSnapLineForSameLengthEdges(this.mousePoint, event);
            return this.snappedPoint;
        }

        let isEdgeSnapPossible = false;
        let isLineSnapPossible = false;

        // Get nearest edge from mouse point
        const [edge] = utils.nearestEdgeToVertex(this.mousePoint, edges);

        // Check for vertex to edge snapping
        if (edge !== null && this.vertexToEdgeSnap(this.mousePoint, edge)) {
            isEdgeSnapPossible = true;
        }

        // Get nearest line from mouse point
        const [line] = utils.nearestLineToVertex(this.mousePoint, lines);

        // Check for vertex to line snapping
        if (line !== null && this.vertexToLineSnap(this.mousePoint, line)) {
            isLineSnapPossible = true;
            this.drawSnapLine(
                new THREE.Vector3(line[0].x, line[0].y, 3),
                new THREE.Vector3(line[1].x, line[1].y, 3),
                event,
            );
        }

        if (isEdgeSnapPossible || isLineSnapPossible) {
            if (isEdgeSnapPossible && isLineSnapPossible) {
                const intersectionPoint = utils.checkLineIntersection(edge, line);

                if (intersectionPoint) {
                    const isInside = ((this.mousePoint.x - intersectionPoint.x) ** 2)
                    + ((this.mousePoint.y - intersectionPoint.y) ** 2)
                    <= this.normalizedSnapRadius ** 2;

                    if (isInside) {
                        this.offsetX = intersectionPoint.x - this.mousePoint.x;
                        this.offsetY = intersectionPoint.y - this.mousePoint.y;
                    }
                }
            }
            return this.snappedPoint;
        }

        // If no snapping can be done, simply return the mouse point
        this.isSnapping = false;
        return this.mousePoint.clone();
    }

    getIntermediateState() {
        const vertices = utils.convertArrayToVector(this.selectedObject.get2DVertices());
        const edges = this.selectedObject.getEdges();

        const offsetX = this.mousePoint.x - this.objectSnappedMousePoint.x;
        const offsetY = this.mousePoint.y - this.objectSnappedMousePoint.y;

        // Move every vertex by offset
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            vertices[i].x += offsetX;
            vertices[i].y += offsetY;
        }

        // Move every edge by offset
        // Adding only on first element of edge as offset will be added on second element
        // in next iteration otherwise offset gets added twice.
        for (let i = 0, len = edges.length; i < len; i += 1) {
            edges[i][0].x += offsetX;
            edges[i][0].y += offsetY;
        }

        return [vertices, edges];
    }

    objectSnap(event) {
        if (!this.isInitialized) {
            console.error('ERROR: SnapManager: Snap Manager not initialised before trying to snap');
        }

        this.mousePoint = utils
            .getNormalizedCameraCoordinates(event.clientX, event.clientY, this.stage);

        if (checkPointOnGround(this.mousePoint, this.stage)) {
            if (this.isSnapOverride(event)) {
                this.isSnapping = false;
                return this.mousePoint.clone();
            }
            this.isSnapping = true;
            if (this.selectedObject instanceof PolygonModel
                || this.selectedObject instanceof SmartroofModel
                || this.selectedObject instanceof Dormer
                || this.selectedObject instanceof SmartroofFace
                || this.selectedObject instanceof CylinderModel
                || this.selectedObject instanceof Subarray
                || this.selectedObject instanceof Walkway
                || this.selectedObject instanceof Handrail
                || this.selectedObject instanceof Property
                || this.selectedObject instanceof Inverter
                || this.selectedObject instanceof DCDB
                || this.selectedObject instanceof ACDB
                || this.selectedObject instanceof CombinerBox
            ) {
                return this.polygonSnap();
            }
            else if (this.selectedObject instanceof OutlinePoints) {
                return this.outlinePointSnap();
            }
            else if (this.selectedObject instanceof RotationPoint || this.selectedObject instanceof DualMapMarker) {
                return this.mousePoint;
            }
            else if (this.selectedObject instanceof InstancedTable) {
                return this.selectedObject.getSnappedPosition(this.mousePoint);
            }
            else if (Array.isArray(this.selectedObject) &&
                this.selectedObject[0] instanceof Table && !(this.selectedObject[0].getSubarray() instanceof Gazebo)) {
                if (this.selectedObject[0].getSubarray().addTableFlow &&
                    this.selectedObject[0].getSubarray().getNumberOfTables() === 1) {
                    return this.addTableSnap();
                }
                return this.tableSnap();
            }
        }
        this.isSnapping = false;
        return this.mousePoint.clone();
    }



    polygonSnap() {
        let modelVertices = utils.convertArrayToVector(this.selectedObject.get2DVertices());
        let modelEdges = this.selectedObject.getEdges();

        if (this.isObjectSnapped) {
            [modelVertices, modelEdges] = this.getIntermediateState();
            this.isObjectSnapped = false;
            this.objectSnappedMousePoint = new THREE.Vector3();
        }

        // Get nearest vertex and snapping vertex
        const [vertex, point] = this.nearestVertices(modelVertices);
        // Check for vertex to vertex snapping from vertex to the nearest point
        if (vertex !== null && this.vertexToVertexSnap(vertex, point)) {
            this.isObjectSnapped = true;
            this.objectSnappedMousePoint = this.snappedPoint;

            return this.snappedPoint;
        }

        // Get nearest edge to any vertex of model
        const [nearestVertex, edge] = this.nearestVerticesToEdges(modelVertices);

        // Check for vertex to edge snapping
        if (nearestVertex !== null && this.vertexToEdgeSnap(nearestVertex, edge)) {
            this.isObjectSnapped = true;
            this.objectSnappedMousePoint = this.snappedPoint;

            return this.snappedPoint;
        }

        // Get nearest vertex to any edge of model
        const [modelEdge, closestVertex] = this.nearestEdgesToVertices(modelEdges);

        // Check for edge to vertex snapping from model edge to nearest point
        if (modelEdge !== null && this.edgeToVertexSnap(modelEdge, closestVertex)) {
            this.isObjectSnapped = true;
            this.objectSnappedMousePoint = this.snappedPoint;

            return this.snappedPoint;
        }

        // Check for snapping in direction perpendicular edge.
        const hash = this.getHash(this.stage.mousePoint);
        const { lines } = this.grid[hash];
        const [line] = utils.nearestLineToVertex(this.mousePoint, lines);
        if (line !== null && this.vertexToLineSnap(this.mousePoint, line)) {
            this.isObjectSnapped = true;
            this.objectSnappedMousePoint = this.snappedPoint;

            return this.snappedPoint;
        }

        // If no snapping can be done, simply return mouse point
        this.isSnapping = false;
        return this.mousePoint.clone();
    }

    outlinePointSnap() {
        const outlinePoint = this.selectedObject.getPosition();

        if (checkPointOnGround(this.mousePoint, this.stage)) {
            if (this.isObjectSnapped) {
                const offset = this.mousePoint.clone();
                offset.sub(this.objectSnappedMousePoint);
                outlinePoint.add(offset);
                this.isObjectSnapped = false;
                this.objectSnappedMousePoint = new THREE.Vector3();
            }

            const hash = this.getHash(outlinePoint);
            const { vertices } = this.grid[hash];
            const { lines } = this.grid[hash];
            const { edges } = this.grid[hash];

            // Get nearest vertex from outline point
            const [vertex] = utils.nearestVertexToVertex(outlinePoint, vertices);

            // Check for vertex to vertex snapping
            if (vertex !== null && this.vertexToVertexSnap(outlinePoint, vertex)) {
                this.isObjectSnapped = true;
                this.objectSnappedMousePoint = this.snappedPoint;

                return this.snappedPoint;
            }

            // Get nearest edge from outline point
            const [edge] = utils.nearestEdgeToVertex(outlinePoint, edges);

            // Check for vertex to edge snapping
            if (edge !== null && this.vertexToEdgeSnap(outlinePoint, edge)) {
                this.isObjectSnapped = true;
                this.objectSnappedMousePoint = this.snappedPoint;

                return this.snappedPoint;
            }

            // Get nearest line from outline point
            const [line] = utils.nearestEdgeToVertex(outlinePoint, lines);

            // Check for vertex to line snapping
            if (line !== null && this.vertexToLineSnap(outlinePoint, line)) {
                this.isObjectSnapped = true;
                this.objectSnappedMousePoint = this.snappedPoint;

                return this.snappedPoint;
            }

            // If no snapping can be done, simply return the mouse point
            this.isSnapping = false;
            return this.mousePoint.clone();
        }
        this.isSnapping = false;
        return this.mousePoint.clone();
    }

    tableSnap() {
        let smallestDelta = new THREE.Vector2(Infinity, Infinity);
        const deltaMouseMove = new THREE.Vector3()
            .subVectors(this.mousePoint.clone(), this.startMousePoint);

        for (let idx = 0, l = this.selectedObject.length; idx < l; idx += 1) {
            const shiftInCentroid = new THREE.Vector3()
                .addVectors(
                    this.selectedObjectCentroid[this.selectedObject[idx].getId()],
                    deltaMouseMove,
                );

            const bBox = this.selectedObject[idx].getSubarray().getBoundingBox();
            const tableLocalPosition = this.selectedObject[idx].getSubarray()
                .globalToLocalCoordinates(shiftInCentroid, bBox);
            const rows = this.selectedObject[idx].getSubarray().getChildren();
            let minYDifference = Infinity;
            let maxY = -Infinity;
            let minY = Infinity;
            let nearestYRows = [];
            for (let i = 0, len = rows.length; i < len; i += 1) {
                const rowYPosition =
                    (rows[i].getlocalBoundingBox().minY + rows[i].getlocalBoundingBox().maxY) / 2;
                if (Math.abs(rowYPosition - tableLocalPosition.y) - minYDifference < -0.001) {
                    nearestYRows = [];
                    nearestYRows.push(rows[i]);
                    minYDifference = Math.abs(rowYPosition - tableLocalPosition.y);
                }
                else if (Math.abs(Math.abs(rowYPosition - tableLocalPosition.y) - minYDifference)
                        < 0.01) {
                    nearestYRows.push(rows[i]);
                }
                if (rowYPosition < minY) {
                    minY = rowYPosition;
                }
                if (rowYPosition > maxY) {
                    maxY = rowYPosition;
                }
            }

            let minXDifference = Infinity;
            let selectedRowIdx = 0;
            for (let i = 0, len = nearestYRows.length; i < len; i += 1) {
                const rowBBox = nearestYRows[i].getlocalBoundingBox();
                const rowXDistance =
                    Math.abs(rowBBox.minX - tableLocalPosition.x) <
                    Math.abs(rowBBox.maxX - tableLocalPosition.x) ?
                        Math.abs(rowBBox.minX - tableLocalPosition.x) :
                        Math.abs(rowBBox.maxX - tableLocalPosition.x);
                if (rowXDistance < minXDifference) {
                    minXDifference = rowXDistance;
                    selectedRowIdx = i;
                }
            }

            let tableWithinRows = false;
            if (tableLocalPosition.y <= maxY && tableLocalPosition.y >= minY) {
                tableWithinRows = true;
            }

            const tableDimensions = this.selectedObject[idx].getSubarray().getTableDimensions();
            const snappingRowBBox = nearestYRows[selectedRowIdx].getlocalBoundingBox();
            this.deltaRequired = new THREE.Vector2();
            const rowWidthAlongBoundingBox = tableDimensions.length *
                Math.cos(this.selectedObject[idx].getSubarray().getTiltWrtParentSurface());
            const rowSpacing = this.selectedObject[idx].getSubarray().getRowSpacing();
            const ySnapDistance = rowWidthAlongBoundingBox + rowSpacing;

            if (tableWithinRows) { // snap to the nearest row
                this.deltaRequired.y = tableLocalPosition.y
                            - snappingRowBBox.minY
                            - (rowWidthAlongBoundingBox / 2);
            }
            // snap according to the nearest row considering row Spacing
            else if (tableLocalPosition.y > snappingRowBBox.minY - rowSpacing / 2) {
                this.deltaRequired.y = ((
                    (tableLocalPosition.y - snappingRowBBox.minY + rowSpacing / 2)
                    / ySnapDistance)
                    % 1)
                    * ySnapDistance
                    - rowWidthAlongBoundingBox / 2 - rowSpacing / 2;
            }
            else {
                this.deltaRequired.y = ((
                    (tableLocalPosition.y - snappingRowBBox.minY + rowSpacing / 2)
                    / ySnapDistance)
                    % 1)
                    * ySnapDistance
                    + rowWidthAlongBoundingBox / 2 + rowSpacing / 2;
            }

            const tableSpacing = this.selectedObject[idx].getSubarray().getTableSpacing();
            const xSnapDistance = tableDimensions.width + tableSpacing;
            if (snappingRowBBox.minX < tableLocalPosition.x) {
                this.deltaRequired.x =
                    (((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                        / xSnapDistance) % 1) * xSnapDistance
                            + (tableDimensions.width / 2) + (tableSpacing / 2);
            }
            else {
                this.deltaRequired.x =
                    (((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                        / xSnapDistance) % 1)* xSnapDistance
                            - (tableDimensions.width / 2) - (tableSpacing / 2);
            }
            if (this.deltaRequired.length() < smallestDelta.length()) {
                smallestDelta = this.deltaRequired.clone();
            }
        }

        const bBox = this.selectedObject[0].getSubarray().getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();
        const finalDisplacement = (new THREE.Vector3())
            .addScaledVector(rightDirection, smallestDelta.x);
        finalDisplacement.addScaledVector(upDirection, smallestDelta.y);

        return this.mousePoint.clone().add(finalDisplacement);
    }

    isSimilarSubarrayProperties(s1, s2) {
        if (s1.moduleProperties.moduleId !== s2.moduleProperties.moduleId ||
            s1.moduleProperties.moduleMake !== s2.moduleProperties.moduleMake ||
            s1.moduleProperties.moduleSize !== s2.moduleProperties.moduleSize ||
            s1.moduleProperties.moduleLength !== s2.moduleProperties.moduleLength ||
            s1.moduleProperties.moduleWidth !== s2.moduleProperties.moduleWidth ||
            s1.tilt !== s2.tilt ||
            s1.azimuth !== s2.azimuth ||
            s1.tableSpacing !== s2.tableSpacing ||
            s1.moduleSpacingUp !== s2.moduleSpacingUp ||
            s1.moduleSpacingWide !== s2.moduleSpacingWide
            ) {
            return false;
        }
        return true;
    }

    addTableSnap() {
        let smallestDelta = new THREE.Vector2(Infinity, Infinity);
        const deltaMouseMove = new THREE.Vector3()
            .subVectors(this.mousePoint.clone(), this.startMousePoint);
        let finalSubarray = null;

        for (let idx = 0, l = this.selectedObject.length; idx < l; idx += 1) {
            const shiftInCentroid = new THREE.Vector3()
                .addVectors(
                    this.selectedObjectCentroid[this.selectedObject[idx].getId()],
                    deltaMouseMove,
                );
            // find the nearest subarray (with similar properties) to the mouse pointer
            let selectedSubarray = getNearestSubarrayForTableSnapping(
                this.allSubarrayProperties,
                this.selectedObject[idx],
                shiftInCentroid,
            );
            if (!selectedSubarray.hasOwnProperty('snappingSubarray')) {
                this.isSnapping = false;
                return this.mousePoint.clone();
            }
            const { snappingSubarray } = selectedSubarray;
            const { snappingRowBBox } = selectedSubarray;
            const { tableLocalPosition } = selectedSubarray;
            const { maxY } = selectedSubarray;
            const { minY } = selectedSubarray;

            const isSnappingSubarrayPortrait = snappingSubarray.panelOrientation === PANEL_ORIENTATION_PORTRAIT;
            const isSnappingSubarrayLandscape = snappingSubarray.panelOrientation === PANEL_ORIENTATION_LANDSCAPE;
            const isSelectedTablePortrait = this.selectedObject[idx].getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT;
            const isSelectedTableLandscape = this.selectedObject[idx].getSubarray().panelOrientation === PANEL_ORIENTATION_LANDSCAPE;
            const isTableSizeUpSnap = snappingSubarray.tableSizeUp === 1;
            const isTableSizeWideSnap = snappingSubarray.tableSizeWide === 1;
            const isTableOneCrossOne = isTableSizeUpSnap && isTableSizeWideSnap;
            this.tableDimensions = snappingSubarray.getTableDimensions();
            this.deltaRequired = new THREE.Vector2();
        
            /** This factor converts any Y-distance along the ground of the distances
             * which are along the tilt of subarray
             */
            const subarrayRelativeTiltFactor = Math.cos(snappingSubarray.getTiltWrtParentSurface());
            /** This factor converts any Y-distance along the ground of the distances
             * which are along the tilt of parent polygon/cylinder
             */
            const parentTiltFactor = Math.cos(utils.deg2Rad(Math.abs(
                snappingSubarray.getParent().getTilt()
            )));
            // all the distances are along the parent of snapping subarray
            const selectedTableLength = this
                .selectedObject[idx].getSubarray().getTableDimensions().length * subarrayRelativeTiltFactor;
            const rowWidth = this.tableDimensions.length * subarrayRelativeTiltFactor;
            const rowSpacing = snappingSubarray.getRowSpacing();

            const effPanelLength = ( // panel length + panel spacing
                (isSnappingSubarrayPortrait ?
                    snappingSubarray.moduleProperties.moduleLength :
                    snappingSubarray.moduleProperties.moduleWidth) +
                    snappingSubarray.moduleSpacingUp
            ) * subarrayRelativeTiltFactor;
            const tableSizeUpCurrent = this.selectedObject[idx].getSubarray().tableSizeUp;
            const tableSizeUpInSnappingTable = snappingSubarray.tableSizeUp;

            const tableWithinRows = tableLocalPosition.y <= (maxY + (rowSpacing / 2)) &&
                tableLocalPosition.y >= (minY - (rowSpacing / 2));
            if (tableWithinRows) { // snap to the nearest row
                const diffFromCentre = (tableLocalPosition.y -
                    ((snappingRowBBox.minY + snappingRowBBox.maxY) / 2));
                let panelLevelSnap = 0;
                if (tableSizeUpCurrent > tableSizeUpInSnappingTable) {
                    if (diffFromCentre < 0) {
                        panelLevelSnap = (rowWidth - selectedTableLength) / 2;
                    }
                    else {
                        panelLevelSnap = -(rowWidth - selectedTableLength) / 2;
                    }
                }
                else {
                    const ySnap = effPanelLength;
                    if (diffFromCentre < -(rowWidth - selectedTableLength) / 2) {
                        panelLevelSnap = -(rowWidth - selectedTableLength) / 2;
                    }
                    else if (
                        diffFromCentre > (rowWidth - selectedTableLength) / 2
                    ) {
                        panelLevelSnap = (rowWidth - selectedTableLength) / 2;
                    }
                    else if ((tableSizeUpCurrent + tableSizeUpInSnappingTable) % 2 == 1) {
                        panelLevelSnap = (Math.floor((diffFromCentre) / ySnap)) * ySnap + ySnap / 2;
                    }
                    else {
                        panelLevelSnap = (Math.round((diffFromCentre) / ySnap)) * ySnap;
                    }
                }
                if (panelLevelSnap === 0 && ((isSnappingSubarrayPortrait && isSelectedTableLandscape) ||
                (isSnappingSubarrayLandscape && isSelectedTablePortrait && isTableOneCrossOne))) {
                    panelLevelSnap = (rowWidth - selectedTableLength) / 2;
                }
                this.deltaRequired.y = diffFromCentre - panelLevelSnap;
            }
            else { // snap according to the nearest row considering row Spacing
                let ySnapDistance;
                if (isSnappingSubarrayPortrait && isSelectedTableLandscape) {
                    ySnapDistance = (rowWidth + rowSpacing) / 2;
                }
                else {
                    ySnapDistance = rowWidth + rowSpacing;
                }
                if (isSnappingSubarrayLandscape && isSelectedTablePortrait && isTableOneCrossOne) {
                    if (tableLocalPosition.y > snappingRowBBox.minY - rowSpacing / 2) {
                        this.deltaRequired.y = ((
                            ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2)
                            / ySnapDistance)
                            % 1)
                            * ySnapDistance
                            - selectedTableLength / 2 - rowSpacing / 2;
                    }
                    else {
                        this.deltaRequired.y = ((
                            ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2)
                            / ySnapDistance)
                            % 1)
                            * ySnapDistance
                            + selectedTableLength / 2 + rowSpacing / 2 - selectedTableLength / 2;
                    }
                }
                else if (tableLocalPosition.y > snappingRowBBox.minY - rowSpacing / 2) {
                    this.deltaRequired.y = ((
                        ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2)
                        / ySnapDistance)
                        % 1)
                        * ySnapDistance
                        - selectedTableLength / 2 - rowSpacing / 2;
                }
                else {
                    this.deltaRequired.y = ((
                        ((tableLocalPosition.y - snappingRowBBox.minY) + rowSpacing / 2)
                        / ySnapDistance)
                        % 1)
                        * ySnapDistance
                        + selectedTableLength / 2 + rowSpacing / 2;
                }
            }

            const tableSpacing = snappingSubarray.getTableSpacing();
            let xSnapDistance;
            if (isSnappingSubarrayLandscape && isSelectedTablePortrait && isTableOneCrossOne) {
                xSnapDistance = (this.tableDimensions.width + tableSpacing) / 2;
            }
            else {
                xSnapDistance = this.tableDimensions.width + tableSpacing;
            }
            const selectedTableWidth = this
                .selectedObject[idx].getSubarray().getTableDimensions().width;
            if (isSnappingSubarrayPortrait && isSelectedTableLandscape && isTableOneCrossOne) {
                if (snappingRowBBox.minX > tableLocalPosition.x) {
                    this.deltaRequired.x =
                        ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                            / (xSnapDistance)) % 1) * (xSnapDistance))
                                - (selectedTableWidth / 2) - (tableSpacing / 2) + (selectedTableWidth / 2);
                }
                else {
                    this.deltaRequired.x =
                            ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                                / (xSnapDistance)) % 1) * (xSnapDistance))
                                    + (selectedTableWidth / 2) + (tableSpacing);
                }
            }
            else if (snappingRowBBox.minX < tableLocalPosition.x) {
                this.deltaRequired.x =
                    ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                        / xSnapDistance) % 1) * xSnapDistance)
                            + (selectedTableWidth / 2) + (tableSpacing / 2);
            }
            else {
                this.deltaRequired.x =
                    ((((snappingRowBBox.minX - (tableSpacing / 2) - tableLocalPosition.x)
                        / xSnapDistance) % 1) * xSnapDistance)
                            - (selectedTableWidth / 2) - (tableSpacing / 2);
            }
            if (this.deltaRequired.length() < smallestDelta.length()) {
                smallestDelta = this.deltaRequired.clone();
                finalSubarray = snappingSubarray;
            }
        }

        const bBox = finalSubarray.getBoundingBox();
        const rightDirection = bBox[3].clone().sub(bBox[0]);
        rightDirection.normalize();
        const upDirection = bBox[0].clone().sub(bBox[1]);
        upDirection.normalize();
        const finalDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, smallestDelta.x);
        finalDisplacement.addScaledVector(upDirection, smallestDelta.y);

        return this.mousePoint.clone().add(finalDisplacement);
    }

    updateCentroidForAddTableSnap(centroidShift, table) {
        this.selectedObjectCentroid[table.getId()] = this.selectedObjectCentroid[table.getId()].sub(centroidShift);
    }

    nearestVertices(curVertices) {
        let nearestVertex = new THREE.Vector2();
        let nearestPoint = new THREE.Vector2();
        let nearestDistance = 100000;
        let nearestUpdated = false;

        // Get nearest vertex to any vertex of model
        for (let i = 0, len = curVertices.length; i < len; i += 1) {
            const vertex = curVertices[i];
            const hash = this.getHash(vertex);

            if (!this.grid.hasOwnProperty(hash)) {
                return [ null, null ];
            }

            let [ point, distance ] = utils.nearestVertexToVertex(vertex, this.grid[ hash ].vertices);

            if (point !== null && distance < nearestDistance) {
                nearestDistance = distance;
                nearestVertex = vertex;
                nearestPoint = point;
                nearestUpdated = true;
            }
        }

        if (nearestUpdated) {
            return [ nearestVertex, nearestPoint ];
        }
        else {
            return [ null, null ];
        }
    }

    nearestVerticesToEdges(curVertices) {
        let nearestVertex = new THREE.Vector2();
        let nearestEdge = [];
        let nearestDistance = 100000;
        let nearestUpdated = false;

        // Get nearest edge to any model vertex
        for (let i = 0, len = curVertices.length; i < len; i += 1) {
            const hash = this.getHash(curVertices[i]);

            if (!Object.prototype.hasOwnProperty.call(this.grid, `${hash}`)) {
                return [null, null];
            }

            const [edge, distance] =
                utils.nearestEdgeToVertex(curVertices[i], this.grid[hash].edges);

            if (edge !== null && distance < nearestDistance) {
                nearestDistance = distance;
                nearestVertex = curVertices[i];
                nearestEdge = edge;
                nearestUpdated = true;
            }
        }

        if (nearestUpdated) {
            return [nearestVertex, nearestEdge];
        }
        return [null, null];
    }

    nearestEdgesToVertices(curEdges) {
        let nearestEdge = [];
        let nearestVertex = new THREE.Vector2();
        let nearestDistance = 100000;
        let nearestUpdated = false;

        // Get nearest vertex to any model edge
        for (let i = 0, len1 = curEdges.length; i < len1; i += 1) {
            const edge = curEdges[i];
            let containingCells = this.getCellsContainingEdge(edge[ 0 ], edge[ 1 ]);

            for (let j = 0, len2 = containingCells.length; j < len2; j += 1) {
                const cell = containingCells[j];
                const hash = this.hashFunc(cell[ 0 ], cell[ 1 ]);

                if (!this.grid.hasOwnProperty(hash)) {
                    return [ null, null ];
                }

                let [ point, distance ] = utils.nearestVertexToEdge(edge, this.grid[ hash ].vertices);

                if (point !== null && distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestVertex = point;
                    nearestEdge = edge;
                    nearestUpdated = true;
                }
            }
        }

        if (nearestUpdated) {
            return [ nearestEdge, nearestVertex ];
        }
        else {
            return [ null, null ];
        }
    }

    drawSnapLineForSameLengthEdges(curPoint, event) {
        const hash = this.getHash(curPoint);
        const { lines } = this.grid[hash];
        const [edge] = utils.nearestLineToVertex(curPoint, lines);
        if (edge !== null) {
            const start = new THREE.Vector3(edge[0].x, edge[0].y, 3);
            const end = new THREE.Vector3(edge[1].x, edge[1].y, 3);
            this.drawSnapLine(start, end, event);
        }
    }

    drawLastSnapLine(start, end, event) {
        if (start.distanceToSquared(end) > this.normalizedSnapRadius ** 2) {
            const hash = this.getHash(end);
            const { lines } = this.grid[hash];
            if (lines !== null) {
                const [edge] = utils.nearestLineToVertex(end, lines);
                if (edge !== null) {
                    const slope1 = (edge[1].y - edge[0].y) / (edge[1].x - edge[0].x);
                    const slope2 = (end.y - start.y) / (end.x - start.x);
                    if (((slope1 * slope2).toFixed(1)) == -1 ||
                        ((end.x - start.x).toPrecision(1)) == 0 ||
                        ((end.y - start.y).toPrecision(1)) == 0) {

                        const { vertices } = this.grid[hash];
                        const [vertex] = utils.nearestVertexToVertex(this.mousePoint, vertices);
                        if (vertex !== null && this.snapToPoint(end, vertex)) {
                            this.drawSnapLine(start, vertex, event);
                        }
                    }
                }
            }
        }
    }

    snapToPoint(curPoint, snapPoint) {
        const isInside = (curPoint.x - snapPoint.x) ** 2 + (curPoint.y - snapPoint.y) ** 2 <= this.normalizedSnapRadius ** 2;

        if (isInside) {
            this.offsetX = snapPoint.x - curPoint.x;
            this.offsetY = snapPoint.y - curPoint.y;

            return true;
        }
        return false;
    }

    calculateSnapLine(start, end) {
        // calculate end points from end to end of map
        const endpoint = Math.floor(this.gridLeft);
        if ((start.x - end.x) == 0) {
            return ([
                (new THREE.Vector3(start.x, -endpoint, 10)),
                (new THREE.Vector3(start.x, endpoint, 10)),
            ]);
        }
        const slope = (start.y - end.y) / (start.x - end.x);
        const constant = (-(slope * start.x)) + start.y;
        const points = [];
        let y = (slope * endpoint) + constant;
        points.push(new THREE.Vector3(endpoint, y, 10));
        y = (slope * -endpoint) + constant;
        points.push(new THREE.Vector3(-endpoint, y, 10));
        let x = (endpoint - constant) / slope;
        points.push(new THREE.Vector3(x, endpoint, 10));
        x = (-endpoint - constant) / slope;
        points.push(new THREE.Vector3(x, -endpoint, 10));
        const newPoints = [];
        for (let i = 0; i < points.length; i++) {
            if (points[i].x === endpoint || points[i].x === -endpoint) {
                if (points[i].y <= endpoint && points[i].y >= -endpoint) {
                    newPoints.push(points[i]);
                }
            }
            if (points[i].y === endpoint || points[i].y === -endpoint) {
                if (points[i].x <= endpoint && points[i].x >= -endpoint) {
                    newPoints.push(points[i]);
                }
            }
        }
        return newPoints;
    }

    drawSnapLine(start, end, event) {
        if (!event.shiftKey) {
            const pointsNew = this.calculateSnapLine(start, end);
            const snapLineGeometry = new THREE.BufferGeometry();
            const snapLineMaterial = new THREE.LineDashedMaterial({
                color: 0xffff00,
                linewidth: 0.5,
                scale: 1,
                dashSize: this.cellHeight / 2,
                gapSize: this.cellHeight / 2,
                transparent: true,
                opacity: 0.6,
            });
            snapLineGeometry.setFromPoints(pointsNew);
            const snapLine = new THREE.Line(snapLineGeometry, snapLineMaterial);
            snapLine.computeLineDistances();
            this.objectsGroup.add(snapLine);
        }
    }

    clearSnapLine() {
        this.objectsGroup.clear();
    }

    shiftSnap(curPoint) {
        const drawingVertices = utils.convertArrayToVector(this.stage.drawManager.get2DVertices());

        if (drawingVertices.length === 0) {
            return curPoint;
        }
        const numVertices = this.stage.drawManager.getNoOfVertices();

        const startX = drawingVertices[numVertices - 1].x;
        const startY = drawingVertices[numVertices - 1].y;

        const x2 = curPoint.x - startX;
        const y2 = curPoint.y - startY;

        const r = Math.sqrt((x2 * x2) + (y2 * y2));
        let angle = ((Math.atan2(y2, x2) / Math.PI) * 180);

        angle = ((angle) % 360) + 180;

        if (angle <= 22.5 || angle >= 337.5) {
            angle = 0;
        }
        else if (angle <= 67.5) {
            angle = 45;
        }
        else if (angle <= 112.5) {
            angle = 90;
        }
        else if (angle <= 157.5) {
            angle = 135;
        }
        else if (angle <= 202.5) {
            angle = 180;
        }
        else if (angle <= 247.5) {
            angle = 225;
        }
        else if (angle <= 292.5) {
            angle = 270;
        }
        else if (angle < 337.5) {
            angle = 315;
        }
        angle -= 180;

        const cosx = r * Math.cos((angle * Math.PI) / 180);
        const sinx = r * Math.sin((angle * Math.PI) / 180);

        const newX = cosx + startX;
        const newY = sinx + startY;
        return (new THREE.Vector3(newX, newY, 0));
    }

    snapToEdge(curPoint, edge, shouldLieOnEdge = true) {
        const point = new THREE.Vector3(curPoint.x, curPoint.y, 0);

        // Create a line segment representing the edge
        const lineSegment = new THREE.Line3(
            new THREE.Vector3(edge[0].x, edge[0].y, 0),
            new THREE.Vector3(edge[1].x, edge[1].y, 0),
        );

        // Create a point to store perpendicular point from the point to the line
        const perpendicular = new THREE.Vector3();

        // Calculate perpendicular point and store in perpendicular
        lineSegment.closestPointToPoint(point, false, perpendicular);

        // Check if edge snapping condition is met
        const isInside =
            ((curPoint.x - perpendicular.x) ** 2) + ((curPoint.y - perpendicular.y) ** 2) <=
            this.normalizedSnapRadius ** 2;

        if (isInside) {
            if (!shouldLieOnEdge
                || (shouldLieOnEdge && utils.isOverLineSegment(
                    lineSegment.start,
                    perpendicular,
                    lineSegment.end,
                ))
            ) {
                this.offsetX = perpendicular.x - curPoint.x;
                this.offsetY = perpendicular.y - curPoint.y;

                return true;
            }
        }

        return false;
    }

    /*initializeForObjects(objects, currMousePoint = null) {
        if (!this.isInitializedForObjects) {
            this.selectedObjects = objects;
            this.ignoredObjectNames = [];
            this.populateIgnoredObjectNames(this.selectedObjects);

            this.initGrid();

            let isInitializedForDrawingObjects = false;
            let isInitializedForTables = true;
            for (let selectedObject of this.selectedObjects) {
                if (selectedObject instanceof PolygonModel
                  || selectedObject instanceof Subarray
                  || selectedObject instanceof CylinderModel
                  || selectedObject instanceof Walkway
                  || selectedObject instanceof Dimension
                ) {
                    this.isObjectsSnapped[selectedObject.name] = false;
                    this.objectsSnappedMousePoint[selectedObject.name] = new THREE.Vector3();
                    // Add vertices and edges of other models already drawn on scene
                    if (!isInitializedForDrawingObjects) {
                        this.addDrawnVerticesAndEdgesForObjects(selectedObject);
                    }

                    this.isInitializedForObjects = true;
                }
                else if (selectedObject instanceof Table) {
                    this.negativeOffsets[selectedObject.name] = new THREE.Vector3();
                    this.centroidsToMouse[selectedObject.name] = new THREE.Vector3();
                    this.rotationAngles[selectedObject.name] = 0;
                    this.tableCellHeights[selectedObject.name] = 0;
                    this.tableCellWidths[selectedObject.name] = 0;
                    const tableGridCreated = this.addTableGridForObjects(currMousePoint, selectedObject);

                    if (!tableGridCreated) {
                        this.manualOverride = true;
                    }

                    this.isInitializedForObjects = true;
                }
            }
        }
    }

    populateIgnoredObjectNames(selectedObjects) {
        for (let selectedObject of selectedObjects) {
            const children = utils.getAllChildren(selectedObject);
            children.map(element => this.ignoredObjectNames.push(element.name));
        }
    }

    addDrawnVerticesAndEdgesForObjects(selectedObject) {
        // Loop through all drawn models in the scene except for the selected model and its children
        for (let group of this.stage.sceneManager.scene.children) {
            let object = group.container;
            if (
              (object instanceof PolygonModel
                || object instanceof Walkway
                || (object instanceof Table
                  && object instanceof Dimension))
              && object.name !== selectedObject.name
              && !this.ignoredObjectNames.includes(object.name)
            ) {
                // Add vertices in vector form
                for (let vertex of utils.convertArrayToVector(object.get2DVertices())) {
                    this.addVertex(vertex);
                }

                // Add edges in vector form
                for (let edge of object.getEdges()) {
                    this.addEdge(edge);
                }
            }
        }
    }

    addTableGridForObjects(curMousePoint, selectedObject) {
        let subarray = selectedObject.getSubarray();
        let rows = subarray.getChildren();
        let upperFrameTable;
        let lowerFrameTable;
        let upperTableFound = false;

        for (let i = 0; i < rows.length; i++) {
            if (!upperTableFound) {
                for (let table of rows[ i ].getChildren()) {
                    if (!table.isMoved) {
                        upperFrameTable = table;
                        upperTableFound = true;
                        i++;
                        break;
                    }
                }
            }

            if (upperTableFound) {
                for (let table of rows[ i ].getChildren()) {
                    if (!table.isMoved) {
                        lowerFrameTable = table;
                        break;
                    }
                }

                break;
            }
        }

        if (upperFrameTable === undefined || lowerFrameTable === undefined) {
            return false;
        }

        const centroid = upperFrameTable.getPosition();
        this.negativeOffsets[selectedObject.name] = centroid.clone().negate();

        if (curMousePoint !== null) {
            const selectedCentroid = selectedObject.getPosition();
            this.centroidsToMouse[selectedObject.name].x = curMousePoint.x - selectedCentroid.x;
            this.centroidsToMouse[selectedObject.name].y = curMousePoint.y - selectedCentroid.y;
        }

        // Get coordinates specifying bounding box of the table
        let boundingBox = utils.boundingBox(upperFrameTable.getTableMap().panels, centroid);

        this.rotationAngles[selectedObject.name] = utils.toRadian(360 - subarray.getAzimuth());

        // get perpendicular distance between 2 rows as it is dependent on tilt along with row spacing
        let upperFrame = utils.convertArrayToVector(utils.boundingBox(upperFrameTable.getTableMap().panels, upperFrameTable.getPosition()));
        let lowerFrame = utils.convertArrayToVector(utils.boundingBox(lowerFrameTable.getTableMap().panels, lowerFrameTable.getPosition()));
        let perpendicularDistance = utils.getPerpendicularDistanceSq(
          upperFrame[ 2 ],
          lowerFrame[ 2 ],
          lowerFrame[ 3 ]
        );

        let vec0 = new THREE.Vector3(boundingBox[ 0 ][ 0 ], boundingBox[ 0 ][ 1 ], boundingBox[ 0 ][ 2 ]);
        let vec1 = new THREE.Vector3(boundingBox[ 1 ][ 0 ], boundingBox[ 1 ][ 1 ], boundingBox[ 1 ][ 2 ]);

        this.tableCellWidths[selectedObject.name] = vec0.distanceTo(vec1) + subarray.tableSpacing;
        this.tableCellHeights[selectedObject.name] = Math.sqrt(perpendicularDistance.perpendicularDistanceSq);

        return true;
    }

    objectsSnap(event) {
        if (!this.isInitializedForObjects) {
            console.error("ERROR: SnapManager: Snap Manager for objects not initialised before trying to snap");
        }

        this.mousePoint = this.getNormalizedCameraCoordinates(event.clientX, event.clientY);

        if (this.isSnapOverride(event)) {
            return this.mousePoint.clone();
        }

        let newMousePoint = new THREE.Vector3();
        let finalNewMousePoint = new THREE.Vector3();
        let nearestDistance = 100000000;
        for (let selectedObject of this.selectedObjects) {
            if (
              selectedObject instanceof PolygonModel ||
              selectedObject instanceof Subarray ||
              selectedObject instanceof Walkway
            ) {
                newMousePoint = this.polygonSnapForObject(selectedObject);
            }
            else if (selectedObject instanceof Table) {
                newMousePoint = this.tableSnapForObject(selectedObject);
            }

            if (this.distanceBetweenPoints(this.mousePoint.x, this.mousePoint.y, newMousePoint.x, newMousePoint.y) < nearestDistance + 0.01) {
                finalNewMousePoint = newMousePoint.clone();
                nearestDistance = this.distanceBetweenPoints(this.mousePoint.x, this.mousePoint.y, newMousePoint.x, newMousePoint.y);
            }
        }

        return finalNewMousePoint.clone();
    }

    distanceBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
    }

    getIntermediateStateForObjects(selectedObject) {
        let vertices = utils.convertArrayToVector(selectedObject.get2DVertices());
        let edges = selectedObject.getEdges();

        const offsetX = this.mousePoint.x - this.objectsSnappedMousePoint[selectedObject.name].x;
        const offsetY = this.mousePoint.y - this.objectsSnappedMousePoint[selectedObject.name].y;

        // Move every vertex by offset
        for (let vertex of vertices) {
            vertex.x += offsetX;
            vertex.y += offsetY;
        }

        // Move every edge by offset
        // Adding only on first element of edge as offset will be added on second element in next iteration otherwise
        // offset gets added twice. (Took too long than I would like to admit to find this bug)
        for (let edge of edges) {
            edge[ 0 ].x += offsetX;
            edge[ 0 ].y += offsetY;
        }

        return [ vertices, edges ];
    }

    polygonSnapForObject(selectedObject) {
        let modelVertices = utils.convertArrayToVector(selectedObject.get2DVertices());
        let modelEdges = selectedObject.getEdges();

        if (this.isObjectsSnapped[selectedObject.name]) {
            [ modelVertices, modelEdges ] = this.getIntermediateStateForObjects(selectedObject);
            this.isObjectsSnapped[selectedObject.name] = false;
            this.objectsSnappedMousePoint[selectedObject.name] = new THREE.Vector3();
        }

        // Get nearest vertex and snapping vertex
        let [ vertex, point ] = this.nearestVertices(modelVertices);

        // Check for vertex to vertex snapping from vertex to the nearest point
        if (vertex !== null && this.vertexToVertexSnap(vertex, point)) {
            this.isObjectsSnapped[selectedObject.name] = true;
            this.objectsSnappedMousePoint[selectedObject.name] = this.snappedPoint;

            return this.snappedPoint;
        }

        // Get nearest edge to any vertex of model
        let [ nearestVertex, edge ] = this.nearestVerticesToEdges(modelVertices);

        // Check for vertex to edge snapping
        if (nearestVertex !== null && this.vertexToEdgeSnap(nearestVertex, edge)) {
            this.isObjectsSnapped[selectedObject.name] = true;
            this.objectsSnappedMousePoint[selectedObject.name] = this.snappedPoint;

            return this.snappedPoint;
        }

        // Get nearest vertex to any edge of model
        let [ modelEdge, closestVertex ] = this.nearestEdgesToVertices(modelEdges);

        // Check for edge to vertex snapping from model edge to nearest point
        if (modelEdge !== null && this.edgeToVertexSnap(modelEdge, closestVertex)) {
            this.isObjectsSnapped[selectedObject.name] = true;
            this.objectsSnappedMousePoint[selectedObject.name] = this.snappedPoint;

            return this.snappedPoint;
        }

        // If no snapping can be done, simply return mouse point
        return this.mousePoint.clone();
    }

    tableSnapForObject(selectedObject) {
        let point = this.mousePoint.clone();

        // Add negative offset to move mouse point to coordinate system of table grid
        point.x += this.negativeOffsets[selectedObject.name].x;
        point.y += this.negativeOffsets[selectedObject.name].y;

        // Rotate it
        point.applyAxisAngle(new THREE.Vector3(0, 0, -1), this.rotationAngles[selectedObject.name]);

        point.x += this.tableCellWidths[selectedObject.name] / 2;
        point.y += this.tableCellHeights[selectedObject.name] / 2;

        const tableGridX = Math.floor(point.x / this.tableCellWidths[selectedObject.name]);
        const tableGridY = Math.floor(point.y / this.tableCellHeights[selectedObject.name]);

        point.x = (tableGridX * this.tableCellWidths[selectedObject.name]) + (this.tableCellWidths[selectedObject.name] / 2);
        point.y = (tableGridY * this.tableCellHeights[selectedObject.name]) + (this.tableCellHeights[selectedObject.name] / 2);

        // Reverse all transformations
        point.x -= this.tableCellWidths[selectedObject.name] / 2;
        point.y -= this.tableCellHeights[selectedObject.name] / 2;

        point.applyAxisAngle(new THREE.Vector3(0, 0, 1), this.rotationAngles[selectedObject.name]);

        point.x -= this.negativeOffsets[selectedObject.name].x;
        point.y -= this.negativeOffsets[selectedObject.name].y;

        point.x += this.centroidsToMouse[selectedObject.name].x;
        point.y += this.centroidsToMouse[selectedObject.name].y;

        return point;
    }

    unInitializeForObjects() {
        if (this.isInitializedForObjects) {
            this.mousePoint = new THREE.Vector3();

            this.offsetX = 0;
            this.offsetY = 0;

            this.selectedObjects = null;
            this.ignoredObjectNames = [];
            this.isInitializedForObjects = false;
            this.manualOverride = false;

            this.grid = {};

            this.helperPoints = [];
            this.helperEdges = [];
            this.helperLines = [];

            //Objects snapped
            this.isObjectsSnapped = {};
            this.objectsSnappedMousePoint = {};

            //
            this.negativeOffsets = {};
            this.centroidsToMouse = {};
            this.rotationAngles = {};
            this.tableCellWidths = {};
            this.tableCellHeights = {};
        }
        else {
            console.error("SnapManager: Cannot unInitialize for objects - Already unIntialized");
        }
    }*/
}

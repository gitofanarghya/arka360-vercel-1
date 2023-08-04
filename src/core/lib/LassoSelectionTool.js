/* eslint-disable max-len */
import * as THREE from 'three';
import * as raycastingUtils from '../utils/raycastingUtils';
import {
    COMPLEX_GEOMETRY_ERROR,
    OUT_OF_GROUND_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    VERTEX_OVER_EDGE_ERROR,
} from '../coreConstants';
import { MATERIAL_STATES, VISUAL_STATES, COLOR_MAPPINGS } from '../objects/visualConstants';
import * as utils from '../utils/utils';
import { Points } from 'three';
import createBufferGeometry from '../utils/meshUtils';

export const MINIMUM_NUMBER_OF_POINTS = 3;

export default class LassoSelectionTool {
    constructor(stage) {
        this.stage = stage;
        this.name = 'Lasso Selection Tool';

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.vertices = [];
        this.selectionPolygonMaterial = new THREE.LineDashedMaterial({
            linewidth: 3,
            scale: 1,
            dashSize: 1,
            gapSize: 0.5,
        });

        this.selectionPolygonMesh = new THREE.LineLoop(
            createBufferGeometry(),
            this.selectionPolygonMaterial,
        );

        this.objectsGroup.add(this.selectionPolygonMesh);
    }

    _updateGeometry() {
        const shape = new THREE.Shape(utils.convertArrayToVector(this.get2DVertices(this.vertices)));

        const geometry = new THREE.ShapeGeometry(shape);
        geometry.translate(0, 0, utils.getHighestZ(this.stage.ground) + 1);

        this.selectionPolygonMesh.geometry = geometry;

        this.selectionPolygonMesh.computeLineDistances();
    }

    initDrawingMode() {
        // Initialize drawing by providing event handlers and mesh materials
        this.vertices = [];
        this.selectionPolygonMesh.visible = false;

        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    getPlacingInformation(vertices) {
        const response = {};
        response.errors = [];
        let polygonExists = true;
        response.pointUnplaceableError = null;
        const vertices2DVectorArray = utils.convertArrayToVector(vertices);

        if (!raycastingUtils.areVerticesOnGround(vertices, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            polygonExists = false;
        }
        if (vertices2DVectorArray.length < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }
        if (utils.checkLastEdgeIntersectionWithEdges(vertices2DVectorArray)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (vertices.length > MINIMUM_NUMBER_OF_POINTS &&
            utils.checkComplexGeometry(vertices)) {
            const error = new Error(COMPLEX_GEOMETRY_ERROR);
            response.errors.push(error);
            response.cannotCompleteError = error;
        }
        if (polygonExists && utils.checkVertexEquivalency(vertices)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }
        if (utils.checkIfLastVertexOnEdges(vertices2DVectorArray)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }

        return response;
    }

    async onComplete(geometry) {
        // getting vertices from buffer geometry
        for (let i = 0; i < geometry.noOfVertices; i++) {
            this.vertices.push(
                new THREE.Vector3(
                    geometry.attributes.position.array[i * 3],
                    geometry.attributes.position.array[i * 3 + 1],
                    geometry.attributes.position.array[i * 3 + 2],
                )
            )
        }

        try {
            const placingInformation =
                this.getPlacingInformation(utils.convertVectorArrayTo2DArray(this.vertices));
            // check for complex geometry
            if (placingInformation.errors.length !== 0) {
                this.stage.eventManager.customErrorMessage(placingInformation.errors[0].message);
                this.onCancel();
                return Promise.reject(placingInformation.errors[0]);
            }

            this._updateGeometry();
            this.selectionPolygonMesh.visible = false;

            this.setSelectedObjects();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: Lasso Selection Tool: OnComplete failed.', error);
            this.onCancel();
            return Promise.reject(error);
        }
    }

    onCancel() {
        // disable Mesh
        this.selectionPolygonMesh.visible = false;
    }

    setSelectedObjects() {
        let collection = this.getSelectedObjects();
        //TODO: implement selection menu from a collection of different objects
        //and then pass only the list that is to be selected.
        let temp = [];
        if(this.stage.defaultPanelSelection) {
            if ( collection.panels.length !== 0 ){
                temp = [...collection.panels];
            }
            else if (collection.dcStrings.length !== 0 ) {
                temp = [...collection.dcStrings];
            }
            else if ( collection.dcCables.length !== 0 ) {
                temp = [...collection.dcCables];
            }
            else {
                temp = [...collection.conduits];
            }
        }
        else {
            if ( collection.tables.length !== 0 ){
                temp = [...collection.tables];
            }
            else if ( collection.dcStrings.length !== 0 ) {
                temp = [...collection.dcStrings];
            }
            else if ( collection.dcCables.length !== 0 ) {
                temp = [...collection.dcCables];
            }            
            else {
                temp = [...collection.conduits];
            }
        }
        if(temp.length > 0 && !this.stage.microInverterSelectionMode.enabled) {
            this.stage.selectionControls.setSelectedObjects(temp);
        }
        if(this.stage.microInverterSelectionMode.enabled ){
            this.stage.microInverterSelectionMode.setSelectedPanels([...collection.panels]);
            return true;
        }
    }

    get2DVertices(geometryVertices) {
        let vertices = [];
        for (let vertex of geometryVertices) {
            vertices.push([
                vertex.x,
                vertex.y
            ])
        }
        return vertices;
    }

    get numVertices() {
        return this.vertices.length;
    }

    getEdges(vertices2DArray) {
        let vertices = utils.convertArrayToVector(vertices2DArray);
        let edges = [];

        for (let i = 0; i < vertices.length - 1; i++) {
            edges.push([
                vertices[ i ],
                vertices[ i + 1 ]
            ]);
        }

        if (vertices2DArray.length > 2 &&
            (vertices[ vertices2DArray.length - 1 ].x !== vertices[ 0 ].x ||
                vertices[ vertices2DArray.length - 1 ].y !== vertices[ 0 ].y)) {
            edges.push([
                vertices[ vertices2DArray.length - 1 ],
                vertices[ 0 ]
            ]);
        }
        return edges;
    }

    getSelectedObjects(){
        let result = {
            polygons: [],
            cylinders: [],
            walkways: [],
            subarray: [],
            tables: [],
            panels: [],
            dcStrings: [],
            strings: [],
            dcCables: [],
            conduits: [],
            property: [],
            textbox: [],
        };

        utils.getAllObjectsInScene(this.stage.sceneManager.scene, result);
        let collection = this.searchInSelectedRegion( result );
        return collection;
    }

    searchInSelectedRegion(result){

        let collection = {
            polygons: [],
            cylinders: [],
            walkways: [],
            subarray: [],
            tables: [],
            panels: [],
            dcStrings: [],
            strings: [],
            dcCables: [],
            conduits: [],
        };

        //narrow down search space by rejecting objects which are not withing
        //bounding space of the drawn polygon
        let searchSpace = {
            polygons: [],
            cylinders: [],
            walkways: [],
            subarray: [],
            tables: [],
        };
        this.selectionPolygonMesh.geometry.computeBoundingBox();
        let polygonBox = this.selectionPolygonMesh.geometry.boundingBox;

        let minPolygonBound = polygonBox.min;
        let maxPolygonBound = polygonBox.max;

        if(!this.stage.defaultPanelSelection) {
            for ( let table of result.tables) {
                let bool = true;
                for ( let x = 0; x < table.children.length; x ++ ) {
                    table.children[x].panelMesh.geometry.computeBoundingBox();	
                    let box = table.children[x].getMeshBoundingBox();
                    let minBound = ((box.min.x > minPolygonBound.x) && (box.min.y > minPolygonBound.y)) ? true : false;
                    let maxBound = ((box.max.x < maxPolygonBound.x) && (box.max.y < maxPolygonBound.y)) ? true : false;

                    // if all panels of the table are inside the selection, then only select the table
                    if(!(maxBound && minBound)){
                        bool = false;
                        break;
                    }
                }
                if(bool) {
                    searchSpace.tables.push( table );
                }
            }
        }
        else {
            searchSpace.tables = [...result.tables];
        }
        let lassoPolygonEdges = this.getEdges(this.get2DVertices(this.vertices));
        let outsidePoint = new THREE.Vector2(minPolygonBound.x - 2, minPolygonBound.y -2);

        for ( let table of searchSpace.tables) {
            let bool = true;
            for ( let x = 0; x < table.children.length; x ++ ) {
                let intersection = false;
                let inside = false;
                let panel = table.children[x];
                const panelVertices = table.children[x].get2DVertices();
                let panelEdges = this.getEdges(panelVertices);

                //check edge intersection between two polygons
                for(let lassoEdge of lassoPolygonEdges){
                    for(let panelEdge of panelEdges){
                        let check = this.checkLineIntersection(panelEdge, lassoEdge);
                        if(check.onLine1 && check.onLine2){
                            intersection = true;
                            break;
                        }
                    }
                    if(intersection)
                        break;
                }

                //check if atleast one vertex of panel is inside the lasso polygon if there is no edge intersection
                if(!intersection) {
                    let vertex = panelVertices[3];
                    let extEdge = [ outsidePoint, new THREE.Vector2(vertex[0], vertex[1])];
                    let noOfIntersection = 0;
                    for(let edge of lassoPolygonEdges){
                        let check = this.checkLineIntersection(extEdge, edge);
                        if(check.onLine1 && check.onLine2){
                            noOfIntersection = noOfIntersection + 1;
                        }
                    }
                    if(noOfIntersection%2 === 1){
                        inside = true;
                    }
                    if(inside){
                        collection.panels.push(panel);
                        // panel.onSelect();
                    }
                }
                // if all panels of the table are inside the selection, then only select the table
                if(!inside ){
                    bool = false;
                }
            }
            if(bool) {
                if (table.getParent()) {
                    if (!(table.getSubarray().objectType && table.getSubarray().objectType === 'Gazebo')) {
                        collection.tables.push(table);
                    }
                }

            }
        }

        if ( ( this.stage.defaultPanelSelection && collection.panels.length === 0 ) || collection.tables.length === 0) {
            for ( let string of result.dcStrings ) {
                let bool = true;
                for ( let i = 0; i < string.optimizedLineGeometry.attributes.position.array.length / 3 && bool; i+=1 ) {
                    let x1cord = string.optimizedLineGeometry.attributes.position.array[i*3];
                    let y1cord = string.optimizedLineGeometry.attributes.position.array[i*3 +1];
                    let x2cord = string.optimizedLineGeometry.attributes.position.array[i*3 +3];
                    let y2cord = string.optimizedLineGeometry.attributes.position.array[i*3 +4];
                    let stringEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];

                    for(let edge of lassoPolygonEdges){
                        let result = utils.checkLineIntersection( edge, stringEdge );
                        if ( result.onLine1 && result.onLine2 ) {
                            collection.dcStrings.push(string);
                            bool = true;
                            break;
                        }
                    }
                }
            }

            for( let dcCable of result.dcCables ) {
                let bool = true;
                for ( let j = 0; j < dcCable.brokenOutlinePoints.length && bool; j+=1 ) {
                    const points = dcCable.brokenOutlinePoints[j];
                    for(let i=0; i<points.length - 1 && bool; i++) {
                        let x1cord = points[i].getPosition().x;
                        let y1cord = points[i].getPosition().y;
                        let x2cord = points[i+1].getPosition().x;
                        let y2cord = points[i+1].getPosition().y;
                        let cableEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];
                        for(let edge of lassoPolygonEdges){
                            let result = utils.checkLineIntersection( edge, cableEdge );
                            if ( result.onLine1 && result.onLine2 ) {
                                collection.dcCables.push(dcCable);
                                bool = true;
                                break;
                            }
                        }
                    }
                }
            }

            for ( let conduit of result.conduits ) {
                let bool = true;
                for ( let i = 0; i < conduit.outlinePoints.length-1 && bool; i+=1 ) {
                    let x1cord = conduit.outlinePoints[i].getPosition().x;
                    let y1cord = conduit.outlinePoints[i].getPosition().y;
                    let x2cord = conduit.outlinePoints[i+1].getPosition().x;
                    let y2cord = conduit.outlinePoints[i+1].getPosition().y;
                    let conduitEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];
                    for(let edge of lassoPolygonEdges){
                        let result = utils.checkLineIntersection( edge, conduitEdge );
                        if ( result.onLine1 && result.onLine2 ) {
                            collection.conduits.push(conduit);
                            bool = true;
                            break;
                        }
                    }
                }
            }
        }
		return collection;
    }

    checkLineIntersection(edge1, edge2) {
        //if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and 
        //booleans for whether line segment 1 or line segment 2 contain the point
        let denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((edge2[1].y - edge2[0].y) * (edge1[1].x - edge1[0].x)) - ((edge2[1].x - edge2[0].x) * (edge1[1].y - edge1[0].y));
        if (denominator == 0) {
            return result;
        }
        a = edge1[0].y - edge2[0].y;
        b = edge1[0].x - edge2[0].x;
        numerator1 = ((edge2[1].x - edge2[0].x) * a) - ((edge2[1].y - edge2[0].y) * b);
        numerator2 = ((edge1[1].x - edge1[0].x) * a) - ((edge1[1].y - edge1[0].y) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = edge1[0].x + (a * (edge1[1].x - edge1[0].x));
        result.y = edge1[0].y + (a * (edge1[1].y - edge1[0].y));

        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        // if line1 and line2 are segments, they intersect if both of the above are true
        return result;
    }

    //Helper Functions
    getAzimuth(){
        return 180;
    }

    getTilt(){
        return 0;
    }

    getColorMap() {
        return COLOR_MAPPINGS
            .LASSO_SELECTION[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT];
    }
}
import { xor } from 'lodash';
import { point } from 'makerjs';
import * as THREE from 'three';
import * as utils from '../utils/utils'

export default class SelectionRectangle {
    constructor(stage) {
        this.stage = stage;
        this.name = "Rectangle Selection Tool";
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.canvas = stage.rendererManager.getDomElement();
        this.startPoint = new THREE.Vector3();
        this.endPoint = new THREE.Vector3();

        this.selectionRectEnabled = false;
        this.mouseMove = false;

        this.rect = new THREE.Mesh(
            new THREE.PlaneGeometry(0, 0, 1),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide,
            }),
        );
        this.rect.frustumCulled = false;
        this.rect.visible = false;
        
        this.objectsGroup.add(this.rect);
    }

    enableRectTool() {
        if (!this.selectionRectEnabled) {
            this.canvas.addEventListener('mousedown', this.handleMouseDown);
            this.selectionRectEnabled = true;
        }
    }

    disableRectTool(){
        if (this.selectionRectEnabled) {
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.selectionRectEnabled = false;
        }
    }

    handleMouseDown = (event) => {
        if(!(event.ctrlKey || event.metaKey || event.which !== 1) && this.selectionRectEnabled){
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
    
            const { clientX, clientY } = event;
            this.setStartPoint(clientX, clientY);
        }
    };

    handleMouseMove = (event) => {
        if(this.selectionRectEnabled){
            this.mouseMove = true;
    
            const { clientX, clientY } = event;
            this.setEndPoint(clientX, clientY);
            this.show();
            this.render();
        }
    };

    handleMouseUp = () => {
        if(this.selectionRectEnabled){
            if(this.mouseMove){
                try {
                    if (this.setSelectedObjectsFromSelectionRectangle()) {
                        this.stage.selectionControls.clickOverride = true;
                    }
                } catch (error) {
                    console.error(error);
                }
                this.mouseMove = false;
            }
            // Remove event listeners once done
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);

            this.hide();
        }
    };

    setStartPoint(x, y) {
        const position = this.getNormalizedCameraCoordinates(x , y);
        //add offset to ensure rectangle is always on top
        position.z = utils.getHighestZ(this.stage.ground) + 5;            
        this.startPoint = position;
    }

    setEndPoint(x, y) {
        const position = this.getNormalizedCameraCoordinates(x , y);
        //add offset to ensure rectangle is always on top
        position.z = utils.getHighestZ(this.stage.ground) + 5;            
        this.endPoint = position;
    }

    render() {
        /** Setting the top left corner point */

        const positions = this.rect.geometry.getAttribute('position')
        positions.array[0] =  this.startPoint.x;
        positions.array[1] =  this.startPoint.y;
        positions.array[2] =  this.startPoint.z;

        positions.array[3] =  this.endPoint.x;
        positions.array[4] =  this.startPoint.y;
        positions.array[5] =  this.startPoint.z;

        positions.array[6] =  this.startPoint.x;
        positions.array[7] =  this.endPoint.y;
        positions.array[8] =  this.startPoint.z;

        positions.array[9] =  this.endPoint.x;
        positions.array[10] =  this.endPoint.y;
        positions.array[11] =  this.startPoint.z;
  
        this.rect.geometry.attributes.position.needsUpdate = true;
    }

    show() {
        this.rect.visible = true;
    }

    hide() {
        this.rect.visible = false;
    }

    getNormalizedCameraCoordinates(deviceX, deviceY) {
        let normalizedCoords = new THREE.Vector3();
        normalizedCoords.x = ((deviceX - this.stage.screenDimensions.left) / this.stage.screenDimensions.width) * 2 - 1;
        normalizedCoords.y = -((deviceY - this.stage.screenDimensions.top) / this.stage.screenDimensions.height) * 2 + 1;
        normalizedCoords.z = 0;

        normalizedCoords.unproject(this.stage.cameraManager.camera);

        return normalizedCoords;
    }
    setSelectedObjectsFromSelectionRectangle(){
        let collection = this.getSelectedObjects();
        //TODO: implement selection menu from a collection of different objects
        //and then pass only the list that is to be selected.
        let temp = [];
        if(this.stage.defaultPanelSelection) {
            if ( collection.textbox.length !== 0 ){
                temp = [...collection.textbox];
            }
            else if( collection.property.length !== 0) {
                temp= [...collection.property];
            }
            else if ( collection.panels.length !== 0 ){
                temp = [...collection.panels];
            }
            else if (collection.dcStrings.length !== 0 ) {
                temp = [...collection.dcStrings];
            }
            else if (collection.strings.length !== 0 ) {
                temp = [...collection.strings];
            }
            else if ( collection.dcCables.length !== 0 ) {
                temp = [...collection.dcCables];
            }
            else {
                temp = [...collection.conduits];
            }
        }
        else {
            if ( collection.textbox.length !== 0 ){
                temp = [...collection.textbox];
            }
            else if ( collection.tables.length !== 0 ){
                temp = [...collection.tables];
            }
            else if ( collection.property.length !== 0) {
                temp = [...collection.property];
            }
            else if ( collection.dcStrings.length !== 0 ) {
                temp = [...collection.dcStrings];
            }
            else if ( collection.strings.length !== 0 ) {
                temp = [...collection.strings];
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
            return true;
        }
        if(this.stage.microInverterSelectionMode.enabled ){
            this.stage.microInverterSelectionMode.setSelectedPanels([...collection.panels]);
            return true;
        }
        
        //if microInverter enable mode -> microinverter temp
        return false;
    }

    getSelectedObjects(){
        let result = {
            polygons: [],
            cylinders: [],
            walkways: [],
            subarray: [],
            tables: [],
            panels: [],
            property: [],
            dcStrings: [],
            strings: [],
            dcCables: [],
            conduits: [],
            textbox: [],
        };

        utils.getAllObjectsInScene(this.stage.sceneManager.scene, result);
        let collection = this.searchInSelectedRegion( result );
		return collection;
    }
 
    searchInSelectedRegion(result) {
        let collection = {
            polygons: [],
            cylinders: [],
            walkways: [],
            subarray: [],
            tables: [],
            panels: [],
            property: [],
            dcStrings: [],
            strings: [],
            dcCables: [],
            conduits: [],
            textbox: [],
        };

        const addCableMode = this.stage.addCablesMode.enabled;

        this.rect.geometry.computeBoundingBox();
        let selectionRectBounds = this.rect.geometry.boundingBox;
        // const start = performance.now();
        for ( let textbox of result.textbox) {
            let bool = true;
            const array = utils.getVerticesFromBufferGeometry(textbox.textBoxMesh.geometry);
            const vertArray = [...array].splice(0,4);
            vertArray.push(vertArray[0]);
            for ( let i = 0; i < vertArray.length-1  && bool; i+=1 ) {
                let x1cord = vertArray[i].x;
                let y1cord = vertArray[i].y;
                let x2cord = vertArray[i+1].x;
                let y2cord = vertArray[i+1].y;
                let x1In, x2In, y1In, y2In;
                x1In = x2In = y1In = y2In = false;
                if ( x1cord >= selectionRectBounds.min.x && x1cord <= selectionRectBounds.max.x )
                    x1In = true;
                if ( x2cord >= selectionRectBounds.min.x && x2cord <= selectionRectBounds.max.x )
                    x2In = true;
                if ( y1cord >= selectionRectBounds.min.y && y1cord <= selectionRectBounds.max.y )
                    y1In = true;
                if ( y2cord >= selectionRectBounds.min.y && y2cord <= selectionRectBounds.max.y )
                    y2In = true;
                if ( (( x1In && y1In ) || ( x2In && y2In)) && !addCableMode ) {
                    collection.textbox.push(textbox);
                    bool = false;
                }
                else if ( ( x1In && y2In ) || ( x2In && y1In ) ) {
                    //apply distance formula to find which strings are in rect area.
                    let temp = {x:0 , y:0};
                    let point1 = { x:x1cord , y:y1cord };
                    let point2 = { x:x2cord , y:y2cord };
                    x1In = utils.getSideofLine( point1, point2, selectionRectBounds.min);
                    x2In = utils.getSideofLine( point1, point2, selectionRectBounds.max);
                    temp.x = selectionRectBounds.min.x;
                    temp.y = selectionRectBounds.max.y;
                    y1In = utils.getSideofLine( point1, point2, temp);
                    temp.x = selectionRectBounds.max.x;
                    temp.y = selectionRectBounds.min.y;
                    y2In = utils.getSideofLine( point1, point2, temp);
                    if ( (x1In ^ x2In ^ y2In ^ y1In) && !addCableMode ) {
                        collection.textbox.push(textbox);
                        bool = false;
                    }
                }
                else {
                    let boxEdge1 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y } ];
                    let boxEdge2 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y } ];
                    let boxEdge3 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y } ];
                    let boxEdge4 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y } ];
                    let boxEdges = [ boxEdge1, boxEdge2, boxEdge3, boxEdge4];
                    let textboxEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];
                    
                    for ( let i=0; i<4; i+=1 ) {
                        let result = utils.checkLineIntersection( boxEdges[i], textboxEdge );
                        if ( result.onLine1 && result.onLine2 ) {
                            collection.textbox.push(textbox);
                            bool = false;
                            break;
                        }
                    }
                }
            }
        }
        // console.log(performance.now() - start);
        if (collection.textbox.length === 0) {
            if(this.stage.viewManager.propertyVisible) {
                for (let property of result.property) {
                    const edges = property.getEdges();
                    const boxEdges = [
                        [selectionRectBounds.max.x, selectionRectBounds.max.y],
                        [selectionRectBounds.max.x, selectionRectBounds.min.y],
                        [selectionRectBounds.min.x, selectionRectBounds.min.y],
                        [selectionRectBounds.min.x, selectionRectBounds.max.y],
                    ];
                    const bedges = [];
                    for (let i = 0; i < boxEdges.length - 1; i++) {
                        bedges.push([boxEdges[i], boxEdges[i + 1]]);
                    }
                    bedges.push([boxEdges[boxEdges.length - 1], boxEdges[0]]);

                    for (let i = 0; i < bedges.length; i +=1 ) {
                        const boxEdge = bedges[i];
                        for (let j = 0; j < edges.length; j +=1 ) {
                            const edge = edges[j];
                            const bEd = [
                                new THREE.Vector3(...boxEdge[0]),
                                new THREE.Vector3(...boxEdge[1]),
                            ]
                            let result = utils.checkLineIntersection( edge, bEd);
                            if ( result.onLine1 && result.onLine2 ) {
                                collection.property.push(property);
                                property.onSelect();
                                break;
                            }
                        }
                    }
                    let result2 = utils.checkPolygonInsidePolygon( property.get2DVertices(), boxEdges);
                    if (result2) {
                        collection.property.push(property);
                        property.onSelect();
                    }
                }
            }
            if (collection.property.length === 0) {
                for ( let table of result.tables) {
                    let bool = true;
                    for ( let x = 0; x < table.children.length; x ++ ) {
                        let temp = true;
                        table.children[x].panelMesh.geometry.computeBoundingBox();	
                        let box = table.children[x].getMeshBoundingBox();
                        let minBound = ((box.min.x > selectionRectBounds.min.x) && (box.min.y > selectionRectBounds.min.y)) ? true : false;
                        let maxBound = ((box.max.x < selectionRectBounds.max.x) && (box.max.y < selectionRectBounds.max.y)) ? true : false;
                        //if all panels of the table are inside the selection, then only select the table
                        if(!(maxBound && minBound)){
                            bool = false;
                            temp = false;
                        }
                        if(temp && !addCableMode){
                            collection.panels.push( table.children[x]);
                        }
                    }
                    if (bool && !addCableMode) {
                        // white rectangle is being coming after undo redo 
                        // due to tables are getting undefined
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
                            let x1In, x2In, y1In, y2In;
                            x1In = x2In = y1In = y2In = false;
                            if ( x1cord >= selectionRectBounds.min.x && x1cord <= selectionRectBounds.max.x )
                                x1In = true;
                            if ( x2cord >= selectionRectBounds.min.x && x2cord <= selectionRectBounds.max.x )
                                x2In = true;
                            if ( y1cord >= selectionRectBounds.min.y && y1cord <= selectionRectBounds.max.y )
                                y1In = true;
                            if ( y2cord >= selectionRectBounds.min.y && y2cord <= selectionRectBounds.max.y )
                                y2In = true;
                            if ( ( x1cord === 0 ) && ( x2cord === 0 ) &&  (y1cord === 0 ) && ( y2cord === 0 ) )
                                bool = false;
                            if ( (( x1In && y1In ) || ( x2In && y2In)) && !addCableMode ) {
                                collection.dcStrings.push(string);
                                bool = false;
                            }
                            else if ( ( x1In && y2In ) || ( x2In && y1In ) ) {
                                //apply distance formula to find which strings are in rect area.
                                let temp = {x:0 , y:0};
                                let point1 = { x:x1cord , y:y1cord };
                                let point2 = { x:x2cord , y:y2cord };
                                x1In = utils.getSideofLine( point1, point2, selectionRectBounds.min);
                                x2In = utils.getSideofLine( point1, point2, selectionRectBounds.max);
                                temp.x = selectionRectBounds.min.x;
                                temp.y = selectionRectBounds.max.y;
                                y1In = utils.getSideofLine( point1, point2, temp);
                                temp.x = selectionRectBounds.max.x;
                                temp.y = selectionRectBounds.min.y;
                                y2In = utils.getSideofLine( point1, point2, temp);
                                if ( (x1In ^ x2In ^ y2In ^ y1In) && !addCableMode ) {
                                    collection.dcStrings.push(string);
                                }
                            }
                        }
                    }
                    for ( let string of result.strings ) {
                        let bool = true;
                        for ( let i = 0; i < string.optimizedLineGeometry.attributes.position.array.length / 3 && bool; i+=1 ) {
                            let x1cord = string.optimizedLineGeometry.attributes.position.array[i*3];
                            let y1cord = string.optimizedLineGeometry.attributes.position.array[i*3 +1];
                            let x2cord = string.optimizedLineGeometry.attributes.position.array[i*3 +3];
                            let y2cord = string.optimizedLineGeometry.attributes.position.array[i*3 +4];
                            let x1In, x2In, y1In, y2In;
                            x1In = x2In = y1In = y2In = false;
                            if ( x1cord >= selectionRectBounds.min.x && x1cord <= selectionRectBounds.max.x )
                                x1In = true;
                            if ( x2cord >= selectionRectBounds.min.x && x2cord <= selectionRectBounds.max.x )
                                x2In = true;
                            if ( y1cord >= selectionRectBounds.min.y && y1cord <= selectionRectBounds.max.y )
                                y1In = true;
                            if ( y2cord >= selectionRectBounds.min.y && y2cord <= selectionRectBounds.max.y )
                                y2In = true;
                            if ( ( x1cord === 0 ) && ( x2cord === 0 ) &&  (y1cord === 0 ) && ( y2cord === 0 ) )
                                bool = false;
                            if ( (( x1In && y1In ) || ( x2In && y2In)) && !addCableMode ) {
                                collection.strings.push(string);
                                bool = false;
                            }
                            else if ( ( x1In && y2In ) || ( x2In && y1In ) ) {
                                //apply distance formula to find which strings are in rect area.
                                let temp = {x:0 , y:0};
                                let point1 = { x:x1cord , y:y1cord };
                                let point2 = { x:x2cord , y:y2cord };
                                x1In = utils.getSideofLine( point1, point2, selectionRectBounds.min);
                                x2In = utils.getSideofLine( point1, point2, selectionRectBounds.max);
                                temp.x = selectionRectBounds.min.x;
                                temp.y = selectionRectBounds.max.y;
                                y1In = utils.getSideofLine( point1, point2, temp);
                                temp.x = selectionRectBounds.max.x;
                                temp.y = selectionRectBounds.min.y;
                                y2In = utils.getSideofLine( point1, point2, temp);
                                if ( (x1In ^ x2In ^ y2In ^ y1In) && !addCableMode ) {
                                    collection.strings.push(string);
                                }
                            }
                        }
                    }
                    for( let dcCable of result.dcCables ) {
                        let bool = true;
                        for ( let j = 0; j < dcCable.brokenOutlinePoints.length && bool; j+=1 ) {
                            const points = dcCable.brokenOutlinePoints[j];
                            for(let i=0; i<points.length - 1; i++) {
                                let x1cord = points[i].getPosition().x;
                                let y1cord = points[i].getPosition().y;
                                let x2cord = points[i+1].getPosition().x;
                                let y2cord = points[i+1].getPosition().y;
                                let x1In, x2In, y1In, y2In;
                                // console.log(x1cord,y1cord,x2cord,y2cord,"x1,y1,x2,y2");
                                x1In = x2In = y1In = y2In = false;
                                if ( x1cord >= selectionRectBounds.min.x && x1cord <= selectionRectBounds.max.x )
                                    x1In = true;
                                if ( x2cord >= selectionRectBounds.min.x && x2cord <= selectionRectBounds.max.x )
                                    x2In = true;
                                if ( y1cord >= selectionRectBounds.min.y && y1cord <= selectionRectBounds.max.y )
                                    y1In = true;
                                if ( y2cord >= selectionRectBounds.min.y && y2cord <= selectionRectBounds.max.y )
                                    y2In = true;
                                // if ( ( x1cord === 0 ) && ( x2cord === 0 ) &&  (y1cord === 0 ) && ( y2cord === 0 ) )
                                //     bool = false;
                                if ( ( x1In && y1In ) || ( x2In && y2In) ) {
                                    dcCable.onSelect();
                                    collection.dcCables.push(dcCable);
                                    bool = false;
                                }
                                else if ( ( x1In && y2In ) || ( x2In && y1In ) ) {
                                    //apply distance formula to find which strings are in rect area.
                                    let temp = {x:0 , y:0};
                                    x1In = utils.getSideofLine( points[i].getPosition(), points[i+1].getPosition(), selectionRectBounds.min);
                                    x2In = utils.getSideofLine( points[i].getPosition(), points[i+1].getPosition(), selectionRectBounds.max);
                                    temp.x = selectionRectBounds.min.x;
                                    temp.y = selectionRectBounds.max.y;
                                    y1In = utils.getSideofLine( points[i].getPosition(), points[i+1].getPosition(), temp);
                                    temp.x = selectionRectBounds.max.x;
                                    temp.y = selectionRectBounds.min.y;
                                    y2In = utils.getSideofLine( points[i].getPosition(), points[i+1].getPosition(), temp);
                                    if ( x1In ^ x2In ^ y2In ^ y1In ) {
                                        dcCable.onSelect();
                                        collection.dcCables.push(dcCable);
                                    }
                                }
                                else {
                                    let boxEdge1 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y } ];
                                    let boxEdge2 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y } ];
                                    let boxEdge3 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y } ];
                                    let boxEdge4 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y } ];
                                    let boxEdges = [ boxEdge1, boxEdge2, boxEdge3, boxEdge4];
                                    let cableEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];
                                    
                                    for ( let i=0; i<4; i+=1 ) {
                                        let result = utils.checkLineIntersection( boxEdges[i], cableEdge );
                                        if ( result.onLine1 && result.onLine2 ) {
                                            dcCable.onSelect();
                                            collection.dcCables.push(dcCable);
                                            break;
                                        }
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
                            let x1In, x2In, y1In, y2In;
                            // console.log(x1cord,y1cord,x2cord,y2cord,"x1,y1,x2,y2");
                            x1In = x2In = y1In = y2In = false;
                            if ( x1cord >= selectionRectBounds.min.x && x1cord <= selectionRectBounds.max.x )
                                x1In = true;
                            if ( x2cord >= selectionRectBounds.min.x && x2cord <= selectionRectBounds.max.x )
                                x2In = true;
                            if ( y1cord >= selectionRectBounds.min.y && y1cord <= selectionRectBounds.max.y )
                                y1In = true;
                            if ( y2cord >= selectionRectBounds.min.y && y2cord <= selectionRectBounds.max.y )
                                y2In = true;
                            // if ( ( x1cord === 0 ) && ( x2cord === 0 ) &&  (y1cord === 0 ) && ( y2cord === 0 ) )
                            //     bool = false;
                            if ( (( x1In && y1In ) || ( x2In && y2In)) && !addCableMode ) {
                                collection.conduits.push(conduit);
                                bool = false;
                            }
                            else if ( ( x1In && y2In ) || ( x2In && y1In ) ) {
                                //apply distance formula to find which strings are in rect area.
                                let temp = {x:0 , y:0};
                                x1In = utils.getSideofLine( conduit.outlinePoints[i].getPosition(), conduit.outlinePoints[i+1].getPosition(), selectionRectBounds.min);
                                x2In = utils.getSideofLine( conduit.outlinePoints[i].getPosition(), conduit.outlinePoints[i+1].getPosition(), selectionRectBounds.max);
                                temp.x = selectionRectBounds.min.x;
                                temp.y = selectionRectBounds.max.y;
                                y1In = utils.getSideofLine( conduit.outlinePoints[i].getPosition(), conduit.outlinePoints[i+1].getPosition(), temp);
                                temp.x = selectionRectBounds.max.x;
                                temp.y = selectionRectBounds.min.y;
                                y2In = utils.getSideofLine( conduit.outlinePoints[i].getPosition(), conduit.outlinePoints[i+1].getPosition(), temp);
                                if ( (x1In ^ x2In ^ y2In ^ y1In) && !addCableMode ) {
                                    collection.conduits.push(conduit);
                                }
                            }
                            else {
                                let boxEdge1 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y } ];
                                let boxEdge2 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.min.y}, { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y } ];
                                let boxEdge3 = [ { x : selectionRectBounds.max.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y } ];
                                let boxEdge4 = [ { x : selectionRectBounds.min.x, y : selectionRectBounds.max.y}, { x : selectionRectBounds.min.x, y : selectionRectBounds.min.y } ];
                                let boxEdges = [ boxEdge1, boxEdge2, boxEdge3, boxEdge4];
                                let conduitEdge = [ { x: x1cord, y: y1cord }, { x: x2cord, y: y2cord } ];
                                
                                for ( let i=0; i<4; i+=1 ) {
                                    let result = utils.checkLineIntersection( boxEdges[i], conduitEdge );
                                    if ( result.onLine1 && result.onLine2 && !addCableMode ) {
                                        collection.conduits.push(conduit);
                                        break;
                                    }
                                }                    
                            }
                        }
                    }
                }
            }
        }
		return collection;
    }
}
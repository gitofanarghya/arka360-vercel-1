import * as THREE from "three";
import Ground from "../objects/ground/Ground";
import { isGroundOrModel } from "./utils";
import { getModels, getAllModelType} from "./exporters";
import BaseObject from "../objects/BaseObject";
import * as utils from '../utils/utils'
import _ from "lodash";
import MergedMesh from "../objects/ground/MergedMesh";
import SmartroofFace from "../objects/model/smartroof/SmartroofFace";
import PolygonModel from "../objects/model/PolygonModel";
import CylinderModel from "../objects/model/CylinderModel";
import { SmartroofModel } from "../objects/model/smartroof/SmartroofModel";
import Subarray from "../objects/subArray/Subarray";
import gjk from "gjk";

// Base function for all raycasting
// returns array of all objects at a given point with the intersection z value
export function getAllObjectsBelowPoint(point, stage, raycaster, objectMeshes = null, threshold = 0.001) {
    if (!raycaster) {
        raycaster = new THREE.Raycaster();
        if (stage.visualManager.in3D) {
            raycaster.params.Line.threshold = 0.5/stage.getNormalisedZoom();
            raycaster.params.Points.threshold = 2 / stage.getNormalisedZoom();   
            const vec = new THREE.Vector3(point.x, point.y, 0);
            vec.project(stage.cameraManager.camera);        
            raycaster.setFromCamera(vec, stage.cameraManager.camera);
        }
    }
    if (!stage.visualManager.in3D) {
        raycaster.params.Line.threshold = 0.5/stage.getNormalisedZoom();
        raycaster.params.Points.threshold = 2 / stage.getNormalisedZoom();
        const vec = new THREE.Vector3(point.x, point.y, 0);
        vec.project(stage.cameraManager.camera);
    
        raycaster.setFromCamera(vec, stage.cameraManager.camera);
    }
    let intersects;
    // Hack for preventing raycastor to raycast lidar
    raycaster.layers.disable(4);
    if (objectMeshes === undefined || objectMeshes === null) {
        intersects = raycaster.intersectObjects(stage.sceneManager.scene.children, true);
    }
    else {
        intersects = raycaster.intersectObjects(objectMeshes, false);
    }

    let allObjects = [];
    for (let i of intersects) {
        // appending the intersecting object's parent's container (object's parent will be an objectGroup
        // and it's container will be the TSL object) with the z value of intersection

        if (i.object.parent) {
            allObjects.push([
                i.object.parent.container,
                i.point.z
            ]);
        }
    }

    return allObjects;
}


// return true if the 2d point is on the ground
// uses getAllObjectsBelowsPoint()
export function checkPointOnGround(point, stage) {
    let newPoint;
    if (!(point instanceof THREE.Vector2 || point instanceof THREE.Vector3)) {
        [newPoint] = utils.convertArrayToVector([point]);
    }
    else {
        newPoint = point;
    }
    const [minX, minY, maxX, maxY] = stage.ground.getMinMax();
    return !(newPoint.x > maxX || newPoint.y > maxY || newPoint.x < minX || newPoint.y < minY);
}

export function getTopObjectOnClick(event, stage, objectMeshes=null) {
    if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
        const mousePoint =
            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, stage);
        const raycaster = new THREE.Raycaster();
        raycaster.params.Line.threshold = 2 / stage.getNormalisedZoom();
        raycaster.params.Points.threshold = 2 / stage.getNormalisedZoom();
        if (stage.visualManager.in3D) {
            // const vectorr = new THREE.Vector3();
            // const tempCamera = stage.cameraManager.camera.clone()
            // // tempCamera.copy(stage.cameraManager.camera)
            // // tempCamera.position.set(mousePoint.x,mousePoint.y,mousePoint.z);
            // // tempCamera.applyQuaternion(stage.cameraManager.camera.quaternion);
            // tempCamera.updateProjectionMatrix();
            // mousePoint.project(tempCamera);
            // tempCamera.getWorldDirection(vectorr);
            // // raycaster.set(mousePoint, vectorr.normalize());
            const vectorr = new THREE.Vector3();
            const tempCamera = stage.cameraManager.camera.clone()
            // tempCamera.copy(stage.cameraManager.camera)
            // tempCamera.position.set(mousePoint.x,mousePoint.y,mousePoint.z);
            // tempCamera.applyQuaternion(stage.cameraManager.camera.quaternion);
            tempCamera.updateProjectionMatrix();
            tempCamera.getWorldDirection(vectorr);
            mousePoint.project(tempCamera);
            raycaster.setFromCamera(mousePoint, tempCamera);
        }
        else {
            raycaster.setFromCamera(mousePoint, stage.cameraManager.camera);
        }
        // stage.sceneManager.scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000));
        const allObjectsBelowPoint = getAllObjectsBelowPoint(mousePoint, stage, raycaster, objectMeshes);
        // raycaster.intersectObjects(stage.sceneManager.scene.children, true)
        return (allObjectsBelowPoint.length === 0) ? null : allObjectsBelowPoint[0][0];
    }
    return null;
}

export function getObjectsOnClick(event, stage, objectMeshes=null) {
    if (!(event.ctrlKey || event.metaKey || event.which !== 1)) {
        const mousePoint =
            utils.getNormalizedCameraCoordinates(event.clientX, event.clientY, stage);
        const raycaster = new THREE.Raycaster();
        raycaster.params.Line.threshold = 2 / stage.getNormalisedZoom();
        raycaster.params.Points.threshold = 2 / stage.getNormalisedZoom();
        if (stage.visualManager.in3D) {
            const vectorr = new THREE.Vector3();
            const tempCamera = stage.cameraManager.camera.clone();
            tempCamera.updateProjectionMatrix();
            tempCamera.getWorldDirection(vectorr);
            mousePoint.project(tempCamera);
            raycaster.setFromCamera(mousePoint, tempCamera);
        }
        else {
            raycaster.setFromCamera(mousePoint, stage.cameraManager.camera);
        }
        const allObjectsBelowPoint = getAllObjectsBelowPoint(
            mousePoint, stage,
            raycaster, objectMeshes,
        );
        allObjectsBelowPoint.sort((a, b) => b[1] - a[1]);
        return (allObjectsBelowPoint.length === 0) ? [] : allObjectsBelowPoint;
    }
    return [];
}

export function getObjectsWithEdgeContainingPoint(point, stage) {
    let raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.002;
    let vec = new THREE.Vector3(point.x, point.y, 0);
    vec.project(stage.cameraManager.camera);
    raycaster.setFromCamera(vec, stage.cameraManager.camera);
    let intersectingObjects = raycaster.intersectObjects(stage.sceneManager.scene.children, true);

    // get top object with intersecting edge or ground if no intersecting edge
    let requiredObjects = [];
    let includesModel  = false, includesSubarray = false;
    for (let intersectObject of intersectingObjects) {
        if (!(intersectObject.object.parent.container instanceof MergedMesh) && (intersectObject.object.geometry instanceof THREE.EdgesGeometry || intersectObject.object.parent.container instanceof SmartroofModel || intersectObject.object.parent.container instanceof CylinderModel)) {
            let requiredObject = intersectObject.object.parent.container;
            if (!requiredObjects.includes(requiredObject)) {
                if(requiredObject instanceof Subarray){
                    includesSubarray = true;
                }
                // TODO: handle edge case for SmartRoof
                if(requiredObject instanceof PolygonModel || requiredObject instanceof CylinderModel){
                    includesModel = true;
                }
                requiredObjects.push(requiredObject)
            }
        }
    }
    //this is done for the case when subarray edge overlaps with polygon edge.
    if(includesModel && includesSubarray){
        requiredObjects = requiredObjects.filter((item) => {
            return !(item instanceof Subarray)
        })
    }

    // adding ground only if no object is on top of ground at the given point
    if (requiredObjects.length === 0 && intersectingObjects.length > 0) {
        for (let intersectObject of intersectingObjects) {
            let tempObject = intersectObject.object.parent.container;
            // below condition required since first intersection objects
            // are outline points and lines of dimension
            if (tempObject instanceof BaseObject) {
                if (tempObject instanceof Ground) {
                    requiredObjects.push(tempObject)
                }
                break;
            }
        }
    }

    return requiredObjects;
}

export function areVerticesOnGround(vertices2DVectorArray, stage) {
    for (let vertexIndex = 0; vertexIndex < vertices2DVectorArray.length; vertexIndex += 1) {
        const vertex = vertices2DVectorArray[vertexIndex];
        if (!checkPointOnGround(vertex, stage)) {
            return false;
        }
    }
    return true;
}

// returns top model and the z value of intersection
// uses getAllObjectsBelowsPoint() and filters for isGroundOrModel and returns the topmost
export function getTopModelFromPoint(point, stage, raycaster) {
    if (typeof raycaster === 'undefined') raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.001;

    let allObjects = getAllObjectsBelowPoint(point, stage, raycaster);

    for (let i of allObjects) {
        if (isGroundOrModel(i[0])) {
            i[1] = Math.max(0, i[1]);

            // returning the first object as intersects has the groups in sorted order in descending z
            return i
        }
    }

    return [-1, -1];
}

//TODO: Need to be changed in future because we cant get smartroofmodel from getTopModelFromPoint()
export function getTopModelFromPointForSnapping(point, stage, raycaster) {
    if (typeof raycaster === 'undefined') raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.001;

    let allObjects = getAllObjectsBelowPoint(point, stage, raycaster);

    for (let i of allObjects) {
        if (i[0] instanceof Ground ||
            i[0] instanceof PolygonModel ||
            i[0] instanceof CylinderModel ||
            i[0] instanceof SmartroofModel) {
            i[1] = Math.max(0, i[1]);

            // returning the first object as intersects has the groups in sorted order in descending z
            return i
        }
    }

    return [-1, -1];
}

// returns array of all objects below given vertices with the intersection's z value
// uses getAllObjectsBelowPoint() for each point and filters for isGroundOrModel
// in case there is different z for the same object under different vertices, the lowest is selected
// (so as to make chimneys).
// Each object is reported only once (the top occurrence, so as to not report multiple geometry again and again)

export function isIntersecting(vertices1, vertices2) {
    //polygon should have atleast 3 vertices.
    if (vertices2.length < 3) {
        console.error("polygon has less than 3 vertices")
        return false;
    }

    const polygonEdges1 = utils.getEdges(vertices1);
    const polygonBBox1 = utils.getBoundingBox(vertices1);
    const polygonOutsidePoint1 = new THREE.Vector2(polygonBBox1.min.x - 2, polygonBBox1.min.y - 2);

    const polygonEdges2 = utils.getEdges(vertices2);
    const polygonBBox2 = utils.getBoundingBox(vertices2);
    const polygonOutsidePoint2 = new THREE.Vector2(polygonBBox2.min.x - 2, polygonBBox2.min.y - 2);

    let isIntersection = true;
    let intersection = false;
    let inside = false;

    // check edge intersection between two polygons
    for (let j = 0, mEdgeLen = polygonEdges2.length; j < mEdgeLen; j += 1) {
        for (let k = 0, pEdgeLen = polygonEdges1.length; k < pEdgeLen; k += 1) {
            if (utils.lineIntersection(polygonEdges2[j], polygonEdges1[k]).intersect) {
                intersection = true;
                break;
            }
        }
        if (intersection) {
            break;
        }
    }

    if (!intersection) {
        // check whether considered polygon is inside the other polygon
        const vertex = vertices1[0];
        const extEdge = [polygonOutsidePoint2, new THREE.Vector2(vertex[0], vertex[1])];

        let noOfIntersection = 0;
        let prevPoint = new THREE.Vector2(-Infinity, -Infinity);
        for (let j = 0, mEdgeLen = polygonEdges2.length; j < mEdgeLen; j += 1) {
            const check = utils.lineIntersection(extEdge, polygonEdges2[j]);
            if (check.intersect && !prevPoint.equals(check.point)) {
                prevPoint = check.point;
                noOfIntersection += 1;
            }
        }

        // check whether other model is inside considered polygon
        const vertex1 = vertices2[2];
        const extEdge1 = [polygonOutsidePoint1, new THREE.Vector2(vertex1[0], vertex1[1])];

        let noOfIntersection1 = 0;
        prevPoint = new THREE.Vector2(-Infinity, -Infinity);
        for (let k = 0, pEdgeLen = polygonEdges1.length; k < pEdgeLen; k += 1) {
            const check = utils.lineIntersection(extEdge1, polygonEdges1[k]);
            if (check.intersect && !prevPoint.equals(check.point)) {
                prevPoint = check.point;
                noOfIntersection1 += 1;
            }
        }
        if (noOfIntersection % 2 === 1 || noOfIntersection1 % 2 === 1) {
            inside = true;
        }
    }

    if (!inside && !intersection) {
        isIntersection = false;
    }
    return isIntersection;
}

export function getAllTablesBelowVertices(vertices, stage) {
    const result = [];
    utils.getAllTables(stage.ground, result);
    const intersectingTables = [];
    for (let i = 0, len = result.length; i < len; i += 1) {
        if (isIntersecting(vertices, result[i].get2DVertices())) {
            intersectingTables.push(result[i]);
        }
    }
    return intersectingTables;
}

export function getAllModelsBelowVertices(
    polygonVertices,
    stage,
    { includeObstacles } = { includeObstacles: false },
) {
    const allObjects = [];

    // const result = getAllModelType();
    // getModels(stage.ground, result);

    // const models = [...result.polygons, ...result.smartroofs, ...result.smartroofFaces, ...result.cylinders, stage.ground];
    // if (includeObstacles) {
    //     models.push(...result.trees);
    //     models.push(...result.inverters);
    //     models.push(...result.acdb);
    // }
    const models = stage.quadTreeManager.getObjectsInQuadrant(utils.getBoundingBox(polygonVertices), includeObstacles);
    for (let i = 0, len = models.length; i < len; i += 1) {
        if (models[i] instanceof SmartroofFace && models[i].isDeleted) {
            continue;
        }
        if( !Array.isArray( polygonVertices[0] ) ){
            if ( utils.checkPointInsideVertices( models[i].get2DVertices() , polygonVertices) ) {
                let maxHeight = -Infinity;
                let h;
                h = models[i].getZOnTopSurface(polygonVertices[0], polygonVertices[1]);
                if (h > maxHeight) {
                    maxHeight = h;
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
        else{
            if (isIntersecting(polygonVertices, models[i].get2DVertices())) {            
                let maxHeight = -Infinity;
                let h;
                for (let j = 0, verticesLen = polygonVertices.length; j < verticesLen; j += 1) {
                    h = models[i].getZOnTopSurface(polygonVertices[j][0], polygonVertices[j][1]);
                    if (h > maxHeight) {
                        maxHeight = h;
                    }
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
    }

    allObjects.sort((x, y) => -(x[1] - y[1]));
    return allObjects;
}

export function getAllModelsBelowSmartroof(
    polygonVertices,
    stage,
    { includeObstacles } = { includeObstacles: false },
) {
    const allObjects = [];

    let models = stage.quadTreeManager.getObjectsInQuadrant(utils.getBoundingBox(polygonVertices), includeObstacles);

    // Added because quadtree does not return all the roof faces in some cases
    const intersectingFaces = Array.from(stage.ground.faces).filter(f => {
        return isIntersecting(polygonVertices, f.get2DVertices());
    })
    models.push(...intersectingFaces);
    models = Array.from(new Set(models));
    for (let i = 0, len = models.length; i < len; i += 1) {
        if( !Array.isArray( polygonVertices[0] ) ){
            if ( utils.checkPointInsideVertices( models[i].get2DVertices() , polygonVertices) ) {
                let maxHeight = -Infinity;
                let h;
                h = models[i].getZOnTopSurface(polygonVertices[0], polygonVertices[1]);
                if (h > maxHeight) {
                    maxHeight = h;
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
        else{
            let intersects = false;

            // Using GJK algorithm to check intersection as it is more accurate than the previous method
            intersects = isIntersecting(polygonVertices, models[i].get2DVertices());
            // if (isIntersecting(polygonVertices, models[i].get2DVertices())) {            
            if (intersects) {
                let maxHeight = -Infinity;
                let h;
                for (let j = 0, verticesLen = polygonVertices.length; j < verticesLen; j += 1) {
                    h = models[i].getZOnTopSurface(polygonVertices[j][0], polygonVertices[j][1]);
                    if (h > maxHeight) {
                        maxHeight = h;
                    }
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
    }

    allObjects.sort((x, y) => -(x[1] - y[1]));
    return allObjects;
}

export function getAllCommonModelsBelowVertices(polygonVertices, stage) {
    let commonModelList = null;

    for (let vertex of polygonVertices) {

        let intersectionList = getAllModelsBelowVertices([vertex], stage);

        if (commonModelList === null) {
            commonModelList = [];
            for (let intersection of intersectionList) {
                if (isGroundOrModel(intersection[0]) &&
                    _.findIndex(
                        commonModelList,
                        (el) => {return el[0] === intersection[0]},
                    ) === -1) {
                    commonModelList.push(intersection);
                }
            }
        } else {
            for (let intersection of intersectionList) {
                const idx = _.findIndex(
                    commonModelList,
                    (el) => {return el[0] === intersection[0]},
                )
                if (isGroundOrModel(intersection[0]) && idx !== -1) {
                    commonModelList.splice(0, idx);
                    break;
                }
            }
        }
    }

    return commonModelList;
}

// Only get objects that are not ignored
export function getAllModelsBelowVerticesCustom(
    polygonVertices,
    stage,
    { includeObstacles } = { includeObstacles: false },
) {
    const allObjects = [];
    
    const models = stage.quadTreeManager.getObjectsInQuadrant(utils.getBoundingBox(polygonVertices), includeObstacles);
    for (let i = 0, len = models.length; i < len; i += 1) {
        if (models[i] instanceof SmartroofFace && models[i].isDeleted) {
            continue;
        }
        if( !Array.isArray( polygonVertices[0] ) ){
            if (!models[i].ignored && utils.checkPointInsideVertices( models[i].get2DVertices() , polygonVertices) ) {
                let maxHeight = -Infinity;
                let h;
                h = models[i].getZOnTopSurface(polygonVertices[0], polygonVertices[1]);
                if (h > maxHeight) {
                    maxHeight = h;
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
        else{
            if (!models[i].ignored && isIntersecting(polygonVertices, models[i].get2DVertices())) {            
                let maxHeight = -Infinity;
                let h;
                for (let j = 0, verticesLen = polygonVertices.length; j < verticesLen; j += 1) {
                    h = models[i].getZOnTopSurface(polygonVertices[j][0], polygonVertices[j][1]);
                    if (h > maxHeight) {
                        maxHeight = h;
                    }
                }
                allObjects.push([models[i], maxHeight]);
            }
        }
    }

    allObjects.sort((x, y) => -(x[1] - y[1]));
    return allObjects;
}

/**
 * 
 * @param {* in a form of 2D array} polygonVertices
 * @param {*} stage
 */
export function getTopCommonModelBelowVertices(polygonVertices, stage) {
    return [getAllCommonModelsBelowVertices(polygonVertices, stage)[0][0]];
}

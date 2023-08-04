import * as THREE from "three";
import { BufferGeometry, Vector2 } from 'three';
import Ground from "../objects/ground/Ground";
import PolygonModel from "../objects/model/PolygonModel";
import CylinderModel from "../objects/model/CylinderModel";
import * as JSTSConverter from "./JSTSConverter";
import Subarray from "../objects/subArray/Subarray";
import Row from '../objects/subArray/Row';
import axios from "axios";
import BaseObject from '../objects/BaseObject';
import * as JSTS from 'jsts';
import OffsetCurveBuilder from 'jsts/org/locationtech/jts/operation/buffer/OffsetCurveBuilder';
import NodedSegmentString from 'jsts/org/locationtech/jts/noding/NodedSegmentString';
import MCIndexNoder from 'jsts/org/locationtech/jts/noding/MCIndexNoder';
import IntersectionAdder from 'jsts/org/locationtech/jts/noding/IntersectionAdder';
import RobustLineIntersector from 'jsts/org/locationtech/jts/algorithm/RobustLineIntersector';
import Coordinate from "jsts/org/locationtech/jts/geom/Coordinate";
import ArrayList from "jsts/java/util/ArrayList";
import { PDFDocument } from 'pdf-lib'
import { degrees } from 'pdf-lib'
import { saveAs } from 'file-saver';

import {
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
    COORDINATE_CLOSENESS_PRECISION,
    PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
} from '../coreConstants';
import {
    isMetricUnit,
} from '../../components/ui/length/utils'
import Table from "../objects/subArray/Table";
import Walkway from "../objects/model/Walkway";
import Tree from '../objects/model/Tree';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import Conduit from './../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import OutlinePoints from '../objects/subObjects/OutlinePoints';
import { LuSolve } from "./mathUtils";
import SafetyLine from "../objects/model/SafetyLine";
import Handrail from "../objects/model/Handrail";
import Property from "../objects/model/Property";
import EdgeCentrePoints from '../objects/subObjects/EdgeCentrePoints';
import RotationPoint from '../objects/subObjects/RotationPoint';
import SmartroofFace from "../objects/model/smartroof/SmartroofFace";
import InnerEdge from "../objects/model/smartroof/InnerEdge";
import { SmartroofModel } from "../objects/model/smartroof/SmartroofModel";
import DCString from "../objects/subArray/DCString";
import ElectricalString from "../objects/subArray/ElectricalString";
import { getModels, getAllModelType } from './exporters';
import Dormer from "../objects/model/smartroof/Dormer";
import TextBox from "../objects/subObjects/TextBox";
import Gazebo from "../lib/PowerGazebo";
import { threeStats } from "../lib/rStats.extras";
import { EdgesGeometry, Scene, Vector3 } from "three";
import { getAllObjectsBelowPoint } from "./raycastingUtils";
import { crossProduct } from "../structure/utils/mathUtils";
import API from '@/services/api';
import Drawface from "../objects/model/smartroof/DrawFace";
import Panel from "../objects/subArray/Panel";
import gjk from "gjk";
import SmartroofBuilder from "../objects/model/smartroof/SmartroofBuilder";
import OuterEdge from "../objects/model/smartroof/OuterEdge";
import crypto from 'crypto-js';
import url from 'url';
import {Buffer} from 'buffer';

export function getOutlinePoints(vertices, object) {
    let fend = new THREE.Vector2(vertices[0].x, vertices[0].y);
    let fstart = new THREE.Vector2(vertices[1].x, vertices[1].y);
    // 
    let start, end;
    let subArr;
    let children = [];
    let result = getAllModelType();
    getModels(object.stage.ground, result);
    for (const temp in result) {
        if (temp === 'polygons' || 'cylinders' || 'subArrays') {
            for (let i = 0; i < result[temp].length; i++) {
                children.push(result[temp][i]);
            }
        }
    }
    let objs = [];

    for (let i = 0; i < children.length; i++) {
        if (children[i] instanceof PolygonModel ||
            children[i] instanceof CylinderModel) {
            let obj = {};
            let points = children[i].get2DVertices();
            points = setbackPolygon(points, 1);

            if (!isInside(fstart, points) && !isInside(fend, points)) {
                obj.points = points;
                obj.tag = 'OBSTACLE';
                objs.push(obj);
            }
        }
        if (children[i] instanceof Subarray) {
            let subPoints = children[i].get2DVertices();
            subPoints = setbackPolygon(subPoints, 1.5);
            if (isInside(fstart, subPoints)) {
                subArr = children[i];

                let tempPoint1 = new THREE.Vector2(subPoints[subPoints.length - 1][0], subPoints[subPoints.length - 1][1]);
                let tempPoint2 = new THREE.Vector2(subPoints[0][0], subPoints[0][1]);
                let intersection = checkLineIntersection([fstart, fend], [tempPoint1, tempPoint2]);
                if (intersection.onLine1 && intersection.onLine2) {
                    end = new THREE.Vector2(intersection.x, intersection.y);
                }
                for (let j = 0; j < subPoints.length - 1; j++) {
                    let tempPoint1 = new THREE.Vector2(subPoints[j][0], subPoints[j][1]);
                    let tempPoint2 = new THREE.Vector2(subPoints[j + 1][0], subPoints[j + 1][1]);
                    let intersection = checkLineIntersection([fstart, fend], [tempPoint1, tempPoint2]);
                    if (intersection.onLine2 && intersection.onLine1) {
                        end = new THREE.Vector2(intersection.x, intersection.y);
                    }
                }

                if (isInside(fend, subPoints)) {
                    end = fend;
                }
            }
        }
    }
    let temp = [];
    let notToTakeIndexes = [];
    for (let i = 0; i < objs.length; i++) {
        for (let j = 0; j < objs.length; j++) {
            if (i !== j) {
                if (checkPolygonInsidePolygon(objs[i]['points'], objs[j]['points'])) {
                    notToTakeIndexes.push(i);
                    break;
                }
            }
        }
    }
    for (let i = 0; i < objs.length; i++) {
        if (i !== notToTakeIndexes[0]) {
            temp.push(objs[i]);
        } else {
            notToTakeIndexes.shift();
        }
    }

    objs = [...temp];

    function isInside(point, vs) {

        var x = point.x,
            y = point.y;

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0],
                yi = vs[i][1];
            var xj = vs[j][0],
                yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    function checkDistance(points) {
        let length = 0;
        let begin = points[0];
        for (let i = 1; i < points.length; i++) {
            length += Math.sqrt(begin.distanceToSquared(points[i]));
            begin = points[i];
        }
        return length;
    }

    function getPolygonContainingPoint(objects, point) {
        for (let i = 0; i < objects.length; i++) {
            if (checkIfPointLiesOnLineSegment([objects[i]['points'][0], objects[i]['points'][objects[i]['points'].length - 1]], point)) {
                return objects[i]['points'];
            }
            for (let j = 0; j < objects[i]['points'].length - 1; j++) {
                if (checkIfPointLiesOnLineSegment([objects[i]['points'][j], objects[i]['points'][j + 1]], point)) {
                    return objects[i]['points'];
                }
            }
        }
        return null;
    }

    function getFixedPoints(itr, polygon, left = false) {
        if (left) {
            return polygon.slice(itr, polygon.length).concat(polygon.slice(0, itr));
        }
        let fin = [];
        for (let i = itr; i >= 0; i--) {
            fin.push(polygon[i]);
        }
        for (let i = polygon.length - 1; i > itr; i--) {
            fin.push(polygon[i]);
        }
        return fin;
    }

    function getPointOnLine(polygon, point) {
        if (checkIfPointLiesOnLineSegment([polygon[0], polygon[polygon.length - 1]], point)) {
            return [polygon[0], polygon[polygon.length - 1]];
        }
        for (let i = 0; i < polygon.length - 1; i++) {
            if (checkIfPointLiesOnLineSegment([polygon[i], polygon[i + 1]], point)) {
                return [polygon[i], polygon[i + 1]];
            }
        }
        return [];
    }

    function getAround(start, end) {
        let polygon = getPolygonContainingPoint(objs, start);

        let line = getPointOnLine(polygon, start);

        let leftPoints = [start];
        let rightPoints = [start];
        let upperPoints = [start];

        let rightItr = polygon.indexOf(line[0]);
        let leftItr = polygon.indexOf(line[1]);

        if (rightItr === 0 && leftItr === polygon.length - 1) {
            rightItr = polygon.length - 1;
            leftItr = 0;
        }

        let leftArr = getFixedPoints(leftItr, polygon, true);
        let rightArr = getFixedPoints(rightItr, polygon);

        for (let i = 0; i < leftArr.length - 1; i++) {
            leftPoints.push(new THREE.Vector2(leftArr[i][0], leftArr[i][1]));
            if (checkIfPointLiesOnLineSegment([leftArr[i], leftArr[i + 1]], end)) {
                leftPoints.push(end);
                break;
            }
        }
        for (let i = 0; i < rightArr.length - 1; i++) {
            rightPoints.push(new THREE.Vector2(rightArr[i][0], rightArr[i][1]));
            if (checkIfPointLiesOnLineSegment([rightArr[i], rightArr[i + 1]], end)) {
                rightPoints.push(end);
                break;
            }
        }

        return (checkDistance(leftPoints) > checkDistance(rightPoints)) ? rightPoints : leftPoints;
    }

    function getPoints(start, end, objs) {
        // get all the intersection points.
        // store them wrt the distance from end point.
        let interPoints = [];
        for (let i = 0; i < objs.length; i++) {
            let tempPoint1 = new THREE.Vector2(objs[i]['points'][objs[i]['points'].length - 1][0], objs[i]['points'][objs[i]['points'].length - 1][1]);
            let tempPoint2 = new THREE.Vector2(objs[i]['points'][0][0], objs[i]['points'][0][1]);
            let intersection = checkLineIntersection([start, end], [tempPoint1, tempPoint2]);
            if (intersection.onLine1 && intersection.onLine2) {
                interPoints.push(new THREE.Vector2(intersection.x, intersection.y));
            }
            for (let j = 0; j < objs[i]['points'].length - 1; j++) {
                let tempPoint1 = new THREE.Vector2(objs[i]['points'][j][0], objs[i]['points'][j][1]);
                let tempPoint2 = new THREE.Vector2(objs[i]['points'][j + 1][0], objs[i]['points'][j + 1][1]);
                let intersection = checkLineIntersection([start, end], [tempPoint1, tempPoint2]);
                if (intersection.onLine2 && intersection.onLine1) {
                    interPoints.push(new THREE.Vector2(intersection.x, intersection.y));
                }
            }
        }

        interPoints.sort(function (point1, point2) {
            return (end.distanceToSquared(point2) - end.distanceToSquared(point1));
        });
        if (interPoints.length % 2 != 0) {
            interPoints.shift();
        }

        let finalPoints = [];
        for (let i = 0; i < interPoints.length; i += 2) {
            let points = getAround(interPoints[i], interPoints[i + 1]);
            for (let j = 0; j < points.length; j++) {
                finalPoints.push(points[j]);
            }
        }
        return finalPoints;
    }

    function getOuterPath(start, mid, end) {
        let finalPoints = [];
        finalPoints.push(start);

        let points = getPoints(start, mid, objs);
        for (let i = 0; i < points.length; i++) {
            finalPoints.push(points[i]);
        }
        start = (finalPoints.length > 0) ? finalPoints[finalPoints.length - 1] : start;

        let flag = 0;
        let point1, point2;
        for (let i = 0; i < objs.length; i++) {
            if (isInside(mid, objs[i]['points'])) {
                let vertices = [...objs[i]['points']];
                // vertices = setbackPolygon(vertices, 0.5);
                let tempPoint1 = new THREE.Vector2(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1]);
                let tempPoint2 = new THREE.Vector2(vertices[0][0], vertices[0][1]);
                let intersection1 = checkLineIntersection([start, mid], [tempPoint1, tempPoint2]);
                let intersection2 = checkLineIntersection([mid, end], [tempPoint1, tempPoint2]);
                if (intersection1.onLine1 && intersection1.onLine2) {
                    point1 = new THREE.Vector2(intersection1.x, intersection1.y);
                }
                if (intersection2.onLine1 && intersection2.onLine2) {
                    point2 = new THREE.Vector2(intersection2.x, intersection2.y);
                }
                for (let j = 0; j < vertices.length - 1; j++) {
                    let tempPoint1 = new THREE.Vector2(vertices[j][0], vertices[j][1]);
                    let tempPoint2 = new THREE.Vector2(vertices[j + 1][0], vertices[j + 1][1]);
                    let intersection1 = checkLineIntersection([start, mid], [tempPoint1, tempPoint2]);
                    let intersection2 = checkLineIntersection([mid, end], [tempPoint1, tempPoint2]);
                    if (intersection1.onLine1 && intersection1.onLine2) {
                        point1 = new THREE.Vector2(intersection1.x, intersection1.y);
                    }
                    if (intersection2.onLine1 && intersection2.onLine2) {
                        point2 = new THREE.Vector2(intersection2.x, intersection2.y);
                    }
                }
                mid = point2;
                flag = 1;
                break;
            }
        }

        if (flag === 1) {
            let points = getAround(point1, point2);
            for (let i = 0; i < points.length; i++) {
                finalPoints.push(points[i]);
            }
        }

        if (flag !== 1) {
            finalPoints.push(mid);
        }
        points = getPoints(mid, end, objs);
        for (let i = 0; i < points.length; i++) {
            finalPoints.push(points[i]);
        }
        finalPoints.push(end);
        return finalPoints;
    }

    let finalPoints = [];
    if (end === undefined) {
        end = fend;
    }

    let azi = (subArr !== undefined) ? subArr.azimuth : 180;

    let leftPoint, rightPoint;
    if (azi !== 0 || azi !== 180 || azi !== 360) {
        let points = getSecondPoints(fstart, end, azi);
        leftPoint = points[0];
        rightPoint = points[1];
    } else {
        leftPoint = new THREE.Vector2(fstart.x, end.y);
        rightPoint = new THREE.Vector2(end.x, fstart.y);
    }

    let leftPoints = getOuterPath(fstart, leftPoint, end);
    let rightPoints = getOuterPath(fstart, rightPoint, end);

    let points = (checkDistance(leftPoints) > checkDistance(rightPoints)) ? rightPoints : leftPoints;

    for (let i = 0; i < points.length; i++) {
        finalPoints.push(points[i]);
    }
    if (end !== fend) {
        start = end;
        end = fend;
        // finalPoints.push(start);

        leftPoint = new THREE.Vector2(start.x, end.y);
        rightPoint = new THREE.Vector2(end.x, start.y);

        leftPoints = getOuterPath(start, leftPoint, end);
        rightPoints = getOuterPath(start, rightPoint, end);

        points = (checkDistance(leftPoints) > checkDistance(rightPoints)) ? rightPoints : leftPoints;

        for (let i = 0; i < points.length; i++) {
            finalPoints.push(points[i]);
        }
    }

    let final = [];
    for (let i = 0; i < finalPoints.length; i++) {
        if (final[final.length - 1] !== finalPoints[i]) {
            final.push(finalPoints[i]);
        }
    }
    const outLinePoints = [];
    for (let i = 0; i < final.length; i++) {
        outLinePoints.push(new OutlinePoints(final[i].x, final[i].y, 100, object, object.stage));

    }
    return outLinePoints;
}

// getting setback points' array from outer points (array of array) and offset
export function setbackPolygon(outerPoints, offset) {
    if (outerPoints.length < 3) {
        console.error('No of vertices is less than 3');
        return outerPoints;
    }
    let outerPolygon = JSTSConverter.verticesToJSTSPolygon(outerPoints);

    const BufferOp = JSTS.operation.buffer.BufferOp;
    const BufferParameters = JSTS.operation.buffer.BufferParameters;
    let bufferParams = new BufferParameters(
        BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
        BufferParameters.CAP_FLAT,
        BufferParameters.JOIN_MITRE,
        BufferParameters.DEFAULT_MITRE_LIMIT
    );
    let innerPolygon = BufferOp.bufferOp(outerPolygon, offset, bufferParams);
    if (innerPolygon.getCoordinates().length < 4) {
        return [];
    }

    return JSTSConverter.verticesFromJSTSPolygon(innerPolygon);
}

export function bufferPolygon(outerPoints, offset) {
    if (outerPoints.length < 3) {
        console.error('No of vertices is less than 3');
        return outerPoints;
    }
    const outerPolygon = JSTSConverter.verticesToJSTSPolygon(outerPoints);
    const { BufferOp, BufferParameters } = JSTS.operation.buffer;
    const bufferParams = new BufferParameters(
        BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
        BufferParameters.CAP_FLAT,
        BufferParameters.JOIN_MITRE,
        BufferParameters.DEFAULT_MITRE_LIMIT,
    );
    const innerPolygons = BufferOp.bufferOp(outerPolygon, offset, bufferParams);
    const result = [];
    for (let index = 0; index < innerPolygons.getNumGeometries(); index++) {
        const innerPolygon = innerPolygons.getGeometryN(index);
        if (innerPolygon.getCoordinates().length > 3) {
            result.push(JSTSConverter.verticesFromJSTSPolygon(innerPolygon));
        }
    }
    return result;
}


/**
 * It takes three points, finds the center of the arc, finds the axis of rotation, and then rotates the
 * end point around the center point by the angle between the start and end points.
 * @param center - the center of the ellipse
 * @param start - {x: -100, y: 0}
 * @param end - The end point of the arc.
 * @returns An array of points.
 */

function getEllipticalInterpolation(center, start, end) {
    center = new THREE.Vector3(center.x, center.y, 0);
    start = new THREE.Vector3(start.x, start.y, 0);
    end = new THREE.Vector3(end.x, end.y, 0);
    let vM = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    let dir = new THREE.Vector3().subVectors(end, start).normalize();

    // get a center of an arc
    let c = new THREE.Vector3().subVectors(vM, center);
    let d = c.dot(dir);
    c.copy(dir).multiplyScalar(d).add(center);

    // andgle between start and end, relatively to the new center
    let vS = new THREE.Vector3().subVectors(start, c);
    let vE = new THREE.Vector3().subVectors(end, c);
    let a = vS.angleTo(vE);

    // get the axis to rotate around
    let divisions = 10;
    let aStep = a / divisions;
    let pts = [];
    let vecTemp = new THREE.Vector3();
    let tri = new THREE.Triangle(start, c, end);
    let axis = new THREE.Vector3();
    tri.getNormal(axis);
    for (let i = 0; i <= divisions; i++) {
        vecTemp.copy(vE);
        vecTemp.applyAxisAngle(axis, aStep * i);
        // move the arc to center position
        pts.push(vecTemp.clone().add(c));
    }
    pts.reverse();
    return pts;
}

export function checkClockwise(vertices) {
    // returns true if the given vertices are in clockwise order else false
    // return true in case of cylinderModel
    if (vertices.length === 2) return true;

    // using shoelace algorithm here https://en.wikipedia.org/wiki/Shoelace_formula
    let edgeLength = 0;

    // checking for sum over the edges, (x2 − x1)(y2 + y1)
    for (let idx = 0; idx < vertices.length - 1; idx++) {
        edgeLength += ((vertices[idx + 1][0] - vertices[idx][0]) *
            (vertices[idx + 1][1] + vertices[idx][1]))
    }

    // including the last edge
    edgeLength += ((vertices[0][0] - vertices[vertices.length - 1][0]) *
        (vertices[0][1] + vertices[vertices.length - 1][1]));

    // if edgeLength is positive, it is clockwise
    return edgeLength > 0;
}


/**
 * It returns the index of a point in an array of points, or undefined if the point is not in the
 * array.
 * @param point - the point you want to find in the array
 * @param arr - The array of points to search through.
 * @returns The index of the point in the array.
 */
export function indexOfVectorInArray(point, arr) {
    for (let i = 0; i < arr.length; i += 1) {
        if (arr[i][0].toFixed(4) === point.x.toFixed(4) &&
            arr[i][1].toFixed(4) === point.y.toFixed(4)) {
            return i;
        }
    }
    return undefined;
}

export function convertVectorToArray(vectorArray) {
    const array = [];
    vectorArray.forEach((vector) => {
        array.push([vector.x, vector.y]);
    });
    return array;
}

/**
 * It takes an array of vertices and returns an array of arrays of vertices, where each array of
 * vertices is a closed loop.
 * @param continousVertices - An array of vertices that are connected to each other.
 * @returns An array of arrays of vectors.
 */
export function getClosedLoops(continousVertices) {
    // Takes continous vertices and returns closed loops.
    const result = [];
    let temp = [];
    for (let i = 0; i < continousVertices.length; i++) {
        const repeatedAt = indexOfVectorInArray(continousVertices[i], convertVectorToArray(temp));
        if (repeatedAt) {
            result.push(temp.slice(repeatedAt, temp.length));
            temp = temp.slice(0, repeatedAt + 1);
        }
        else {
            temp.push(continousVertices[i]);
        }
    }
    if (temp.length > 0) {
        result.push(temp);
    }
    return result;
}

/**
 * Get the lines intersection of two lines
 * @param edge1 - [{x: 0, y: 0}, {x: 1, y: 1}]
 * @param edge2 - the line that is being tested for intersection with the polygon
 * @param [EPSILON=0] - The tolerance for the intersection. If the intersection is within EPSILON of
 * the end of the line, it is considered to be on the line.
 * @returns The intersection point of two lines.
 */
export function checkLineIntersection(edge1, edge2, EPSILON = 0) {
    // if the lines intersect, the result contains the x and y of the intersection
    // (treating the lines as infinite) booleans for whether line1 or line2 contain the point
    const result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false,
    };
    const denominator = ((edge2[1].y - edge2[0].y) * (edge1[1].x - edge1[0].x)) -
        ((edge2[1].x - edge2[0].x) * (edge1[1].y - edge1[0].y));

    if (denominator === 0) {
        return result;
    }
    let a = edge1[0].y - edge2[0].y;
    let b = edge1[0].x - edge2[0].x;
    const numerator1 = ((edge2[1].x - edge2[0].x) * a) - ((edge2[1].y - edge2[0].y) * b);
    const numerator2 = ((edge1[1].x - edge1[0].x) * a) - ((edge1[1].y - edge1[0].y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = edge1[0].x + (a * (edge1[1].x - edge1[0].x));
    result.y = edge1[0].y + (a * (edge1[1].y - edge1[0].y));

    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > -EPSILON && a < 1 + EPSILON) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > -EPSILON && b < 1 + EPSILON) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
}

/**
 * Extend a line in the forward direction.
 * @param {Coordinate[]} pair - Start and end of line segment.
 * @param {Int} length - length of extension.
 * @returns {Coordinate} - Coordinate of extended point.
 */
function extendLine(pair, length) {
    const [A, B] = pair;
    const direction = new THREE.Vector2().subVectors(
        new THREE.Vector2().copy(B),
        new THREE.Vector2().copy(A),
    );
    direction.normalize();
    const result = new Vector2().copy(B).addScaledVector(direction, length);
    const C = new Coordinate(result.x, result.y);
    return C;
}

/**
 * Approximate implementation of https://mcmains.me.berkeley.edu/pubs/DAC05OffsetPolygon.pdf .
 * @param {Int[][]} setbackValues - Values corresponding to each setback edge in the same order.
 * @param {THREE.Vector3[][]} outerPoints - The points of the polygon to get the setback for.
 * @param {*} setbackType - Type of setback inside/outside.
 * @returns {Coordinate[][]}
 */
export function newBuffer(
    setbackValues, outerPoints, setbackType,
    smartroofFaceModel = false, smoothCorners = false, extendedLines = true,
) {
    if (smartroofFaceModel) {
        smartroofFaceModel.debugGroup.clear();
    }
    const pointsRing = [...outerPoints];
    if (pointsRing.length > 0) pointsRing.push(pointsRing[0]);
    const orientedSetbackValues = [...setbackValues];
    // make anticlockwise if points are clockwise
    if (checkClockwise(outerPoints)) {
        pointsRing.reverse();
        orientedSetbackValues.reverse();
    }

    let directionMultiplier = 1;
    if (setbackType === EDIT_SETBACK_INSIDE) {
        directionMultiplier = 1;
    }
    else if (setbackType === EDIT_SETBACK_OUTSIDE) {
        directionMultiplier = -1;
    }

    const outerCoordinates = pointsRing.map(outerPoint => new JSTS.geom.Coordinate(...outerPoint));
    const BufferParameters = new JSTS.operation.buffer.BufferParameters(
        JSTS.operation.buffer.BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
        JSTS.operation.buffer.BufferParameters.CAP_FLAT,
        JSTS.operation.buffer.BufferParameters.JOIN_MITRE,
        JSTS.operation.buffer.BufferParameters.DEFAULT_MITRE_LIMIT,
    );
    BufferParameters.setSingleSided(true);
    const offsetCurveBuilder = new OffsetCurveBuilder(
        new JSTS.geom.PrecisionModel(),
        BufferParameters,
    );
    const segmentStringsWithoutCurve = [];
    const linecurves = [];

    let convexFlag = false;
    {
        const prevPoint = outerCoordinates[outerCoordinates.length - 2];
        const currentPoint = outerCoordinates[0];
        const nextPoint = outerCoordinates[1];
        const crossProduct = new THREE.Vector2(nextPoint.x, nextPoint.y)
            .sub(new THREE.Vector2(currentPoint.x, currentPoint.y))
            .cross(new THREE.Vector2(currentPoint.x, currentPoint.y)
                .sub(new THREE.Vector2(prevPoint.x, prevPoint.y))) * directionMultiplier;
        if (crossProduct > 0) {
            convexFlag = true;
        }
    }

    for (let index = 0; index < (outerCoordinates.length - 1); index++) {
        const prevPoint = outerCoordinates[index];
        const currentPoint = outerCoordinates[index + 1];
        const nextPoint = (index + 3) > outerCoordinates.length ?
            outerCoordinates[1] : outerCoordinates[(index + 2)];
        let linecurve = offsetCurveBuilder.getLineCurve(
            [
                outerCoordinates[index],
                outerCoordinates[index + 1],
            ],
            orientedSetbackValues[index] * directionMultiplier,
        );
        if (orientedSetbackValues[index] < 0) {
            linecurve.reverse();
            const shiftedBy1 = [];
            for (let i = 0; i < linecurve.length; i++) {
                const shifted = ((linecurve.length + i) - 1) % linecurve.length;
                const current = linecurve[shifted];
                shiftedBy1.push(current);
            }
            linecurve = shiftedBy1;
        }
        if (directionMultiplier === -1) {
            linecurve.reverse();
            linecurve.pop();
            const shiftedBy1 = [];
            for (let i = 0; i < linecurve.length; i++) {
                const shifted = ((linecurve.length + i) - 1) % linecurve.length;
                const current = linecurve[shifted];
                shiftedBy1.push(current);
            }
            linecurve = shiftedBy1;
            linecurve.push(linecurve[0]);
        }
        const crossProduct = new THREE.Vector2(nextPoint.x, nextPoint.y)
            .sub(new THREE.Vector2(currentPoint.x, currentPoint.y))
            .cross(new THREE.Vector2(currentPoint.x, currentPoint.y)
                .sub(new THREE.Vector2(prevPoint.x, prevPoint.y))) * directionMultiplier;
        if (convexFlag) {
            linecurve.shift();
            convexFlag = false;
        }
        else if (extendedLines && orientedSetbackValues[index] > 0) {
            const prevLinePoint = index > 0 ?
                new THREE.Vector2().copy(outerCoordinates[index - 1]) :
                new THREE.Vector2().copy(outerCoordinates[outerCoordinates.length - 2]);
            const currentLinePoint = new THREE.Vector2().copy(outerCoordinates[index]);
            const extensionStart = new THREE.Vector2().copy(linecurve[3]);
            const extensionEnd = new THREE.Vector2().copy(linecurve[2]);

            const prevLineVector = new THREE.Vector2()
                .subVectors(currentLinePoint, prevLinePoint);
            const unitVector = new THREE.Vector2()
                .subVectors(extensionEnd, extensionStart).normalize();
            const projection = Math.abs(unitVector
                .dot(prevLineVector));

            const intersected = checkLineIntersection(
                [linecurve[3], linecurve[2]],
                [prevLinePoint, currentLinePoint],
                0.000001,
            );

            const extended = extendLine(
                [linecurve[3], intersected],
                0.000001,
            );

            if (extended.x === null || extended.y === null) {
                console.warn(
                    'null value in extended point',
                    prevLinePoint, currentLinePoint,
                    extensionStart, extensionEnd,
                    index, outerCoordinates.length,
                    outerCoordinates,
                    'prev',
                );
            }
            else {
                linecurve[2] = new Coordinate(extended.x, extended.y);
            }
        }
        if (crossProduct > 0) {
            linecurve.pop();
            convexFlag = true;
        }
        else if (extendedLines && orientedSetbackValues[index] > 0) {
            const nextLinePoint = index + 2 < outerCoordinates.length ?
                new THREE.Vector2().copy(outerCoordinates[index + 2]) :
                new THREE.Vector2()
                    .copy(outerCoordinates[1 + ((index + 2) % outerCoordinates.length)]);
            const currentLinePoint = new THREE.Vector2().copy(outerCoordinates[index + 1]);
            const extensionStart = new THREE.Vector2().copy(linecurve[linecurve.length - 3]);
            const extensionEnd = new THREE.Vector2().copy(linecurve[linecurve.length - 2]);

            const nextLineVector = new THREE.Vector2()
                .subVectors(nextLinePoint, currentLinePoint);
            const unitVector = new THREE.Vector2()
                .subVectors(extensionEnd, extensionStart).normalize();
            const projection = Math.abs(unitVector
                .dot(nextLineVector));

            const intersected = checkLineIntersection(
                [linecurve[linecurve.length - 3], linecurve[linecurve.length - 2]],
                [nextLinePoint, currentLinePoint],
                0.000001,
            );

            const extended = extendLine(
                [linecurve[linecurve.length - 3], intersected],
                0.000001,
            );

            if (extended.x === null || extended.y === null) {
                console.warn(
                    'null value in extended point',
                    nextLinePoint, currentLinePoint,
                    extensionStart, extensionEnd,
                    index, outerCoordinates.length,
                    outerCoordinates,
                    'next',
                );
            }
            else {
                linecurve[linecurve.length - 2] = new Coordinate(extended.x, extended.y);
            }
        }
        linecurve.shift();
        linecurves.push(linecurve);
        segmentStringsWithoutCurve.push(new NodedSegmentString(linecurve));
    }

    const segmentStrings = [];
    for (let index = 0; index < (outerCoordinates.length - 1); index++) {
        const currentPoint = outerCoordinates[index];
        const currentValue = orientedSetbackValues[index];
        const prevPoint = (index - 1) < 0 ?
            outerCoordinates[outerCoordinates.length - 2] :
            outerCoordinates[index - 1];
        const prevValue = (index - 1) < 0 ?
            orientedSetbackValues[orientedSetbackValues.length - 1] :
            orientedSetbackValues[index - 1];
        const nextPoint = outerCoordinates[index + 1];

        const crossProduct = new THREE.Vector2(nextPoint.x, nextPoint.y)
            .sub(new THREE.Vector2(currentPoint.x, currentPoint.y))
            .cross(new THREE.Vector2(currentPoint.x, currentPoint.y)
                .sub(new THREE.Vector2(prevPoint.x, prevPoint.y))) * directionMultiplier;

        if (crossProduct > 0) {
            const prevCurve = (index - 1) < 0 ?
                linecurves[linecurves.length - 1] : linecurves[index - 1];
            const nextCurve = linecurves[index];
            if (smoothCorners && !(currentValue < 0) && !(prevValue < 0)) {
                const prevEnd = prevCurve[prevCurve.length - 1];
                const nextStart = nextCurve[0];
                const ellipse = getEllipticalInterpolation(
                    new THREE.Vector2(currentPoint.x, currentPoint.y),
                    new THREE.Vector2(prevEnd.x, prevEnd.y),
                    new THREE.Vector2(nextStart.x, nextStart.y),
                );
                const ellipseCoordinates = ellipse.map(vector => new Coordinate(
                    vector.x,
                    vector.y,
                ));
                segmentStrings.push(new NodedSegmentString(ellipseCoordinates));
            }
            else {
                const prevEdge = [
                    prevCurve[prevCurve.length - 1],
                    prevCurve[prevCurve.length - 2],
                ];
                const nextEdge = [
                    nextCurve[0],
                    nextCurve[1],
                ];

                const intersection = checkLineIntersection(prevEdge, nextEdge);

                const result = new Coordinate(intersection.x, intersection.y);
                const isInBetween = (A, B, point) => {
                    const total = A.distance(B);
                    return Math.abs(total - point.distance(A) - point.distance(B)) < 0.00001;
                };
                if (isInBetween(
                    prevEdge[0],
                    prevEdge[1],
                    result,
                )) {
                    prevCurve[prevCurve.length - 1] = result;
                    segmentStrings.push(new NodedSegmentString([
                        prevCurve[prevCurve.length - 1],
                        nextCurve[0],
                    ]));
                }
                else if(isInBetween(
                    nextEdge[0],
                    nextCurve[1],
                    result,
                )) {
                    nextCurve[0] = result;
                    prevCurve[prevCurve.length - 1] = result;
                    segmentStrings.push(new NodedSegmentString([
                        prevCurve[prevCurve.length - 1],
                        nextCurve[0],
                    ]));
                }
                else {
                    segmentStrings.push(new NodedSegmentString([
                        prevCurve[prevCurve.length - 1],
                        result,
                        nextCurve[0],
                    ]));
                }
            }
        }
        segmentStrings.push(segmentStringsWithoutCurve[index]);
    }
    const noder = new MCIndexNoder(new IntersectionAdder(new RobustLineIntersector()));

    // This is a workaround for a bug in how jts is ported to jsts. Need to be reported.
    const collection = new ArrayList();
    segmentStrings.forEach(e => collection.add(e));
    noder.computeNodes(collection);
    const nodedSegments = noder.getNodedSubstrings().toArray();
    const coords = nodedSegments.map(segment => segment.getCoordinates());

    const fullPath = [];
    coords.forEach((group) => {
        const subPath = group.slice(0, -1);
        fullPath.push(...subPath);
    });

    const loops = getClosedLoops(fullPath);
    const validLoops = loops
        .filter(loop => (loop.length) > 2 && !checkClockwise(convertVectorToArray(loop)));
    if (smartroofFaceModel) {
        segmentStrings.forEach((segString) => {
            const hexForFace = 0xff0000 + Math.floor(Math.random() * 0x00ffff);
            const randHeight = 5 + (Math.random() * 10);
            const loopy = [...segString.getCoordinates()];
            for (let index = 0; index < (loopy.length - 1); index++) {
                const vertex1 = loopy[index];
                const vector1 = new THREE.Vector3(vertex1.x, vertex1.y, randHeight);
                const vertex2 = loopy[(index + 1)];
                const vector2 = new THREE.Vector3(vertex2.x, vertex2.y, randHeight);
                const arrowVector = new THREE.Vector3().subVectors(vector2, vector1);
                const length = arrowVector.length();
                arrowVector.normalize();
                const arrowHelper = new THREE.ArrowHelper(arrowVector, vector1, length, hexForFace);
                smartroofFaceModel.debugGroup.add(arrowHelper);
            }
        });
    }
    return validLoops;
}

export function getNodedPolygons(polygons) {
    const segmentStrings = polygons.map((polygon) => {
        const coordinates = polygon.map(vector => new Coordinate(
            vector.x,
            vector.y,
            vector.z,
        ));
        coordinates.push(coordinates[0]);
        return new NodedSegmentString(coordinates);
    });

    const noder = new MCIndexNoder(new IntersectionAdder(new RobustLineIntersector()));

    // This is a workaround for a bug in how jts is ported to jsts. Need to be reported.
    const collection = new ArrayList();
    segmentStrings.forEach(e => collection.add(e));

    noder.computeNodes(collection);
    const nodedSegments = noder.getNodedSubstrings().toArray();
    const coords = nodedSegments.map(segment => segment.getCoordinates());

    const fullPath = [];
    coords.forEach((group) => {
        const subPath = group.slice(0, -1);
        fullPath.push(...subPath);
    });

    const loops = getClosedLoops(fullPath);
    return loops;
}

export function onSegm(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) &&
        q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) &&
        q.y >= Math.min(p.y, r.y)) {
        return true;
    }
    return false;
}

// To find orient1ation of ordered triplet (p, q, r).
export function orient1(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) -
        (q.x - p.x) * (r.y - q.y);
    if (val == 0) {
        return 0;
    }
    return (val > 0) ? 1 : 2;
}

// line segment 'p1q1' and 'p2q2' intersect.
export function doIntersect(p1, q1, p2, q2) {
    let o1 = this.orient1(p1, q1, p2);
    let o2 = this.orient1(p1, q1, q2);
    let o3 = this.orient1(p2, q2, p1);
    let o4 = this.orient1(p2, q2, q1);
    if (o1 != o2 && o3 != o4) {
        return true;
    }
    if (o1 == 0 && this.onSegm(p1, p2, q1)) {
        return true;
    }
    if (o2 == 0 && this.onSegm(p1, q2, q1)) {
        return true;
    }
    if (o3 == 0 && this.onSegm(p2, p1, q2)) {
        return true;
    }
    if (o4 == 0 && this.onSegm(p2, q1, q2)) {
        return true;
    }
    return false;
}


export function isInside(vertices, p) {
    let n = vertices.length;
    if (n < 3) {
        return false;
    }
    let extreme = new Vector2(10000, p.y);
    let count = 0;
    let i = 0;
    do {
        let next = (i + 1) % n;
        if (this.doIntersect(vertices[i], vertices[next], p, extreme)) {
            if (this.orient1(vertices[i], p, vertices[next]) == 0) {
                return this.onSegm(vertices[i], p, vertices[next]);
            }
            count++;
        }
        i = next;
    } while (i != 0);
    // Return true if count is odd, false otherwise
    return (count % 2 == 1);
}

export function generateSetbackGeometry(edgeSetbackValues, modelEdges, modelVertices, setbackType) {
    const clockWise = checkClockwise(modelVertices);
    let direction;

    if (setbackType === EDIT_SETBACK_INSIDE) {
        direction = clockWise ? DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION;
    } else if (setbackType === EDIT_SETBACK_OUTSIDE) {
        direction = clockWise ? ALTERNATE_WALKWAY_DIRECTION : DEFAULT_WALKWAY_DIRECTION;
    }

    const setbackEdges = [];
    for (let i = 0, len = modelEdges.length; i < len; i += 1) {
        const p1 = modelEdges[i][0].clone();
        const p2 = modelEdges[i][1].clone();
        //jugaad-fix smartroof face sometimes has less/more values of setback compared to edges
        if (edgeSetbackValues[i] === undefined) {
            edgeSetbackValues[i] = 0.5;
        }
        const setbackEdge = getNormalPoints(p1, p2, edgeSetbackValues[i], direction);
        setbackEdges.push(setbackEdge);
    }
    const setbackPoints = [];
    for (let i = 0, len = setbackEdges.length; i < len; i += 1) {
        const j = i + 1 < len ? i + 1 : 0;
        const edge1 = [...setbackEdges[i]];
        const edge2 = [...setbackEdges[j]];

        const result = checkLineIntersection(edge1, edge2);
        setbackPoints.push(new THREE.Vector2(result.x, result.y));
    }

    return setbackPoints;
}
/**
 * The function converts longitude, latitude, and height coordinates to Cartesian coordinates using the
 * WGS84 ellipsoid model.
 * @param longitude - The longitude of the location in degrees.
 * @param latitude - The latitude of the location in degrees.
 * @param height - The height (in meters) above the Earth's surface at which the Cartesian coordinates
 * are to be calculated.
 * @returns a THREE.Vector3 object representing the Cartesian coordinates of a point on the Earth's
 * surface, given its longitude, latitude, and height above the reference ellipsoid.
 */
export function fromLatLongToCartesian( longitude, latitude, height) {
    longitude = toRadian(longitude);
    latitude = toRadian(latitude);

    let scratchN = new THREE.Vector3();
    let scratchK = new THREE.Vector3();
    const wgs84RadiiSquared = new THREE.Vector3(
        6378137.0 * 6378137.0,
        6378137.0 * 6378137.0,
        6356752.3142451793 * 6356752.3142451793
    );

    const cosLatitude = Math.cos(latitude);
    scratchN.x = cosLatitude * Math.cos(longitude);
    scratchN.y = cosLatitude * Math.sin(longitude);
    scratchN.z = Math.sin(latitude);
    scratchN.normalize();
    scratchK = wgs84RadiiSquared.multiply(scratchN);
    //scratchK = multiplyComponents(wgs84RadiiSquared, scratchN, scratchK);
    const gamma = Math.sqrt(scratchN.dot(scratchK));
    scratchK = scratchK.divideScalar(gamma);
    scratchN = scratchN.multiplyScalar(height);
    return scratchK.add(scratchN);
};


/**
 * The function converts longitude, latitude, Altitude from WGS84 to ECEF
 * @param longitude - The longitude of the location in degrees.
 * @param latitude - The latitude of the location in degrees.
 * @param altitude - The height (in meters) above the Earth's surface 
 * @returns a THREE.Vector3 object representing the Cartesian coordinates of a point on the Earth's
 * surface, given its longitude, latitude, and altitude.
 */
export function convertCoordinatesToCartesian(latitude, longitude, altitude) {
    // Define the WGS84 ellipsoid parameters
    const a = 6378137;        // Semi-major axis
    const f = 1 / 298.257223563;  // Flattening

    // Convert WGS84 coordinates to ECEF
    const wgs84ToECEF = (latitude, longitude, altitude) => {
        const sinLat = Math.sin(latitude * Math.PI / 180);
        const cosLat = Math.cos(latitude * Math.PI / 180);
        const sinLon = Math.sin(longitude * Math.PI / 180);
        const cosLon = Math.cos(longitude * Math.PI / 180);

        const eSq = 1 - (1 - f) * (1 - f); // Eccentricity squared
        const N = a / Math.sqrt(1 - eSq * sinLat * sinLat); // Prime vertical radius of curvature

        const x = (N + altitude) * cosLat * cosLon;
        const y = (N + altitude) * cosLat * sinLon;
        const z = (N * (1 - eSq) + altitude) * sinLat;

        return new Vector3(x, y, z);
    };

    // Convert WGS84 coordinates to ECEF
    const ecefCoordinates = wgs84ToECEF(latitude, longitude, altitude);

    return ecefCoordinates;
    }

/**
 * Given a rectangle, return the two diagonals of the rectangle.
 * @param vert - [x1, y1, x2, y2]
 * @returns An array of arrays.
 */
export function getObstructionPointsAC(vert) {
    let diagonals = [];
    diagonals.push([vert[0], vert[2]]);
    diagonals.push([vert[1], vert[3]]);
    return diagonals;
}

/**
 * It takes a number of segments, a radius, and a center point and returns an array of points that are
 * evenly spaced around the circumference of a circle.
 * @param segment - number of points to draw
 * @param radius - The radius of the circle.
 * @param center - the center of the circle
 * @returns An array of Vector2 objects.
 */
export function drawCirclePoints(segment, radius, center) {
    let arr = [];
    let slice = 2 * Math.PI / segment;
    for (let i = 0; i < segment; i++) {
        let angle = slice * i;
        let newX = (center.x + radius * Math.cos(angle));
        let newY = (center.y + radius * Math.sin(angle));
        let p = new THREE.Vector2(newX, newY);
        arr.push(p);
    }
    return arr;
}

/**
 * It takes two points and a radius and returns a point that is the radius distance from the first
 * point and on the line between the two points.
 * @param v1 - the first vertex of the edge
 * @param v2 - the vertex that is being cropped
 * @param r - radius of the sphere
 * @returns a new vector that is the result of the calculation.
 */
export function cropEdge(v1, v2, r) {
    let v = v2.clone().add(v1.clone().negate());
    v = v.normalize();
    let x = v.multiplyScalar(Math.sqrt(v1.distanceToSquared(v2)) - r);
    let result = x.add(v1);
    return result;
}
/**
 * It takes two edges, a radius, and a set of vertices and returns an object with two arrays. The first
 * array is a set of points that make up a circle. The second array is a set of points that are the
 * intersection of the circle and the vertices.
 * @param edge1 - [ [x1,y1], [x2,y2] ]
 * @param edge2 - [ [x1,y1], [x2,y2] ]
 * @param radius - radius of the circle
 * @param vert - an array of THREE.Vector2 objects
 * @returns An object with two properties.
 */
export function getObstructionPointsChimney(edge1, edge2, radius, vert) {
    let obstruction = {
        circlePoints: [],
        croppedDiagonals: [],
    }
    let edgeVect1 = [new THREE.Vector2(edge1[0][0], edge1[0][1]), new THREE.Vector2(edge1[1][0], edge1[1][1])];
    let edgeVect2 = [new THREE.Vector2(edge2[0][0], edge2[0][1]), new THREE.Vector2(edge2[1][0], edge2[1][1])];
    let center = checkLineIntersection(edgeVect1, edgeVect2);
    obstruction.circlePoints = drawCirclePoints(24, radius, center);
    for (let i = 0; i < vert.length; i++) {
        let cropPoint = cropEdge(new THREE.Vector2(vert[i].x, vert[i].y), new THREE.Vector2(center.x, center.y), radius);
        obstruction.croppedDiagonals.push([cropPoint, vert[i]]);
    }
    return obstruction;
}

/**
 * It takes an array of vertices and returns true if the vertices form a rectangle
 * @param vert - An array of vertices.
 * @returns A boolean value.
 */
export function isRectangle(vert) {
    if (vert.length !== 4) {
        return false;
    }
    let vertices = convertArrayToVector(vert);
    for (let i = 0; i < vertices.length / 2; i++) {
        // pointer j points to opposite edge
        let j = (i + 2) % 4;
        let dist1 = vertices[i].distanceToSquared(vertices[i + 1]);
        let dist2 = vertices[j].distanceToSquared(vertices[(j + 1) % 4])
        if (dist1.toFixed(1) !== dist2.toFixed(1)) {
            return false;
        }
    }
    return true;
}
/**
 * It takes two arrays of arrays of points, and returns an array of indices of the second array that
 * match the first array
 * @param commonEdges - [[{x:0,y:0},{x:0,y:0}],[{x:0,y:0},{x:0,y:0}]]
 * @param faceEdge - [[{x:0,y:0},{x:0,y:1}],[{x:0,y:1},{x:1,y:1}],[{x:1,y:1},{x:1,y:0}],[{x
 * @returns the index of the common edges in the faceEdge array.
 */
 export function intersectOfVectorArrays(commonEdges, faceEdge) {
    let result = [];
    for (let i = 0; i < commonEdges.length; i++) {
        for (let j = 0; j < faceEdge.length; j++) {
            if (((Math.abs(commonEdges[i][0].x - faceEdge[j][0].x) < 0.001 && Math.abs(commonEdges[i][0].y - faceEdge[j][0].y) < 0.001)
                && (Math.abs(commonEdges[i][1].x - faceEdge[j][1].x) < 0.001 && Math.abs(commonEdges[i][1].y - faceEdge[j][1].y) < 0.001))
                || ((Math.abs(commonEdges[i][0].x - faceEdge[j][1].x) < 0.001 && Math.abs(commonEdges[i][0].y - faceEdge[j][1].y) < 0.001)
                    && (Math.abs(commonEdges[i][1].x - faceEdge[j][0].x) < 0.001 && Math.abs(commonEdges[i][1].y - faceEdge[j][0].y) < 0.001))
            ) {
                result.push(j);
            }
        }
    }
    return result;
}

export function getSetBack(edgeSetbackValues, faceVertices, setbackType, isStudio = false) {
    // disable setback
    let loops = newBuffer(edgeSetbackValues, convertVectorToArray(faceVertices), setbackType);
    const originalGeom = JSTSConverter.verticesToJSTSPolygon(convertVectorToArray(faceVertices));
    const cuttingGeoms = loops.map((loop) => {
        const vertices = loop.map(v => [v.x, v.y]);
        const geom = JSTSConverter.verticesToJSTSPolygon(vertices);
        return getReducedPrecisionJSTSGeometry(geom);

    });
    let finalGeom = originalGeom.copy();
    finalGeom = getReducedPrecisionJSTSGeometry(finalGeom);
    cuttingGeoms.forEach((geom) => {
        const temp = finalGeom.difference(geom);
        finalGeom = getReducedPrecisionJSTSGeometry(temp);
    });
    const geomList = [];
    for (let index = 0; index < finalGeom.getNumGeometries(); index++) {
        if (isStudio) {
            const geomItem = {
                shell: [],
                holes: [],
            };
            const nthGeom = finalGeom.getGeometryN(index);
            // eslint-disable-next-line no-underscore-dangle
            geomItem.shell.push(...nthGeom._shell.getCoordinates());
            // eslint-disable-next-line no-underscore-dangle
            nthGeom._holes.forEach(hole => geomItem.holes.push(hole.getCoordinates()));
            geomList.push(geomItem);
        }
        else {
            geomList.push(finalGeom.getGeometryN(index).getCoordinates());
        }
    }
    return geomList;
    // substract loops from face to get the polygon and return and push it to autocad
}

export function getSetBackForEdges(edgeSetbackValues, modelEdges, modelVertices, setbackType, outerEdges, dormer = true) {
    /*
    WHAT'S GOING ON?
    -> Create an object array with all setback points
    -> Calculate intersection point between each setbacks OR next edge and setback if setback is zero 
    -> Update intersection point in array and set the setback value in the array.
    -> Finally just push the setback along with respective edges to a different array and return.
    */
    const clockWise = checkClockwise(modelVertices);
    let direction;
    if (setbackType === EDIT_SETBACK_INSIDE) {
        direction = clockWise ? DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION;
    } else if (setbackType === EDIT_SETBACK_OUTSIDE) {
        direction = clockWise ? ALTERNATE_WALKWAY_DIRECTION : DEFAULT_WALKWAY_DIRECTION;
    }

    const setBackArray = [];
    //prepare array of setback objects
    for (let i = 0, len = modelEdges.length; i < len; i += 1) {
        let setbackObj = {
            setback: undefined,
            interPoint: undefined,
            edge: undefined,
            setbackEdge: undefined,
            value: edgeSetbackValues[i],
        };
        const p1 = modelEdges[i][0].clone();
        const p2 = modelEdges[i][1].clone();
        setbackObj.edge = [p1, p2];
        // smartroof face sometimes has less no of values of setback compared to no of  edges
        if (setbackObj.value === undefined) {
            setbackObj.value = 0.5;
        }
        if (arrayHasEdge(outerEdges, setbackObj.edge) && dormer) {
            setbackObj.value = 0.001;
        }
        setbackObj.setbackEdge = getNormalPoints(p1, p2, setbackObj.value, direction);
        setBackArray.push(setbackObj);
    }
    // check for zero setback edges and prepare setback accordingly
    for (let i = 0, len = setBackArray.length; i < len; i += 1) {
        // j points to the next edge
        const j = i + 1 < len ? i + 1 : 0;
        // edge1 is the current edge
        let edge1 = [...setBackArray[i].setbackEdge];
        // edge2 is the next edge
        let edge2 = [...setBackArray[j].setbackEdge];
        // check for zero setback edge and prepare setbackintersection point accordingly
        // by using next edge instead of next setback
        if (setBackArray[i].value === 0.001) {
            edge1 = [...setBackArray[i].edge];
        }
        if (setBackArray[j].value === 0.001) {
            edge2 = [...setBackArray[j].edge];
        }
        if (setBackArray[i].value === 0.001 && setBackArray[j].value === 0.001) {
            continue;
        }
        // calculate intersection point
        const result = checkLineIntersection(edge1, edge2);
        // update intersection point in setBackArray
        setBackArray[i].interPoint = new THREE.Vector2(result.x, result.y);
        // set setback value in setBackArray
        if (i > 0) {
            if (setBackArray[i - 1].interPoint !== undefined) {
                setBackArray[i].setback = [setBackArray[i - 1].interPoint, setBackArray[i].interPoint];
            }
        }
    }
    // set the setback value for the first edge(just in case the last edge is zero setback)
    if (setBackArray[setBackArray.length - 1].interPoint !== undefined) {
        setBackArray[0].setback = [setBackArray[setBackArray.length - 1].interPoint, setBackArray[0].interPoint];
    }
    return setBackArray;
}
// Check if the array of vertices has vertices of the edge
export function arrayHasEdge(arr, x) {
    // each flag for each vertice
    let flag1 = false;
    let flag2 = false;
    // iterate and search for vertice
    for (let i = 0; i < arr.length; i++) {
        // if vertice 1 found element [0] is x and element [1] is y
        if ((Math.abs(arr[i][0] - x[0].x) < 0.001 && Math.abs(arr[i][1] - x[0].y) < 0.001)) {
            flag1 = true;
        }
        //if vertice 2 found
        if ((Math.abs(arr[i][0] - x[1].x) < 0.001 && Math.abs(arr[i][1] - x[1].y) < 0.001)) {
            flag2 = true;
        }
        // if both the vertices were found edge exists in array of vertices
        if (flag1 && flag2) {
            return true;
        }
    }
    // both vertices did not exist on array of vertice
    return false;
}

export function shiftArrayForContinuesSetback(setbackArray) {
    // Right shift the array till last element is of zerosetaback
    for (let i = 0; i < setbackArray.length; i++) {
        if (setbackArray[setbackArray.length - 1].value === 0.001) {
            break;
        } else {
            let popped = setbackArray.pop();
            setbackArray.unshift(popped);
        }
    }
    return setbackArray;
}
export function getClosedPolygon(setbackObj, fullPolygon = true) {
    /*Creates closed polygon from objects of structure:
        {   setback: [v2,v2],
            interPoint: v2,
            edge: [v2,v2],
            setbackEdge: [v2,v2],
            value: float,
        }
    */
    let polygon = [];
    // push setback points
    for (let i = 0; i < setbackObj.length; i++) {
        polygon.push(setbackObj[i].setback[1]);
    }
    // push edge points in reverse
    for (let i = setbackObj.length - 1; i >= 0; i--) {
        polygon.push(setbackObj[i].edge[1]);
    }
    // push first vertexs edge and setback
    if (fullPolygon) {
        polygon.push(setbackObj[0].edge[0]);
        polygon.push(setbackObj[0].setback[0]);
    }
    return polygon;
}

export function getClosedPolygonFromSetback(setbackObj) {
    /*
    WHAT'S GOING ON?
    -> Takes array of objects returned from getSetBackForEdges() 
    let the array be [1110011001] where 1 is edge with setback and 0 with zerosetabck
    -> Right shifts the array till last element is a zerosetback: [1111001100]
    -> Iterate through the array and slice consicutive 1's and form a closed polygon: [1111][11]
    -> Push all the closed polygons in a array and return 
    */
    // initiate start of polygon pointer
    let startPoint = 0;
    let setback = {
        polygons: [],
        complete: false,
    };
    //make n-1th position zero setback (if array has zero setback) to get complete setback polygons
    setbackObj = shiftArrayForContinuesSetback(setbackObj);
    for (let i = 0; i < setbackObj.length; i += 1) {
        // set to n+1 postion pointer
        const j = i + 1 < setbackObj.length ? i + 1 : i;
        // skip and increase the pointer if current is zero set back
        if (setbackObj[i].value === 0.001) {
            startPoint = j;
            continue;
        }
        // if next node is zerosetback and current nod is non zero create the polygon
        if ((setbackObj[j].value === 0.001 && setbackObj[i].value !== 0.001)) {
            // if last node slice array till end
            // else slice from start pointer to the point 1 complete setback ends i.e. current node
            if (i === (setbackObj.length - 1)) {
                //get a closed polygon from chopped array and push in polygons
                setback.polygons.push(getClosedPolygon(setbackObj.slice(startPoint)));
            } else {
                setback.polygons.push(getClosedPolygon(setbackObj.slice(startPoint, j)));
            }
            // reset start node to the next node
            startPoint = j;
            continue;
        }
        // if array has no setback
        if (i === setbackObj.length - 1 && startPoint === 0) {
            setback.polygons.push(getClosedPolygon(setbackObj));
            setback.complete = true;
        }
    }
    return setback;
}

// Sorts unordered edges in ordered manner
export function getOrderedEdges(edgesArr) {
    /*
    WHAT'S GOING ON?
    -> We search for the 2nd vertex in edge at 1st position in edge array to find the 
    next conected edge starting from index 0 of edges
    -> Once the next edge is found we remove it from edges and store it in pointer
    -> Pointer keeps the track of current edge so that we can find the next edge to the pointer edge
    -> Once we complete a single closed loop, redo from step 1
    */
    let edges = [...edgesArr];
    let finalArray = [];
    // keep ading closed sub arrays to final array till all edges are pushed 
    while (edges.length > 0) {
        let result = [];
        //point it to zero index
        let pointer = { ...edges[0][1] };
        result.push(edges[0]);
        // remove from edges
        edges.splice(0, 1);
        // start finding next edges starting from index 0
        for (let j = 0; j < edges.length;) {
            if (Math.abs(pointer.x - edges[j][0].x) < 0.001 && Math.abs(pointer.y - edges[j][0].y) < 0.001) {
                result.push(edges[j]);
                pointer = { ...edges[j][1] };
                edges.splice(j, 1);
                // resets the j to 0
                j = 0;
            }
            // move on to next in edges
            else {
                j += 1;
            }
        }
        //push sub array to final 2d array
        finalArray.push(result);
    }
    // return a 2D array [[],[],[]] OR [[]]
    return finalArray;

}

/**
 * If the edge is collinear with any of the model edges and if the edge is a subset of the model edge,
 * then it is an eave.
 * @param edge - [ [x1,y1], [x2,y2] ]
 * @param modelEdges - an array of edges that make up the model
 */
export function isOutsideEdge(edge, modelEdges, modelVertices) {
    let vertex1 = new THREE.Vector3(edge[0].x, edge[0].y);
    let vertex2 = new THREE.Vector3(edge[1].x, edge[1].y);
    if( (!pointInPolygon(vertex1, modelVertices))&&(!pointInPolygon(vertex2, modelVertices))) return true;

    let vert1 = new THREE.Vector3(parseFloat(edge[0].x.toFixed(2)), parseFloat(edge[0].y.toFixed(2)));
    let vert2 = new THREE.Vector3(parseFloat(edge[1].x.toFixed(2)), parseFloat(edge[1].y.toFixed(2)));
    for (let i = 0; i < modelEdges.length; i++) {
        // check is all point are in a line and atleast one point is on the line
        let edgeVert1 = new THREE.Vector3(parseFloat(modelEdges[i][0].x.toFixed(2)), parseFloat(modelEdges[i][0].y.toFixed(2)));
        let edgeVert2 = new THREE.Vector3(parseFloat(modelEdges[i][1].x.toFixed(2)), parseFloat(modelEdges[i][1].y.toFixed(2)));
        let line1 = (checkCollinear(vert1, edgeVert1, edgeVert2) || checkIfPointLiesOnLineSegment([edgeVert1, edgeVert2], vert1));
        let line2 = (checkCollinear(vert2, edgeVert1, edgeVert2) || checkIfPointLiesOnLineSegment([edgeVert1, edgeVert2], vert2));
        if (line1 && line2 ) {
            return true;
        }
    }
    return false;
}

function pointInPolygon(point, polygon) {
    
    const x = point.x;
    const y = point.y;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }
  
/**
 * It returns the angle between the edge and the ground.
 * @param edge - an array of two Vector3 objects, representing the two points of the edge
 * @returns The angle between the edge and the ground.
 */
export function getEdgeAngleWithGround(edge) {
    let normal = new Vector3(0, 0, 1);
    const dir = new THREE.Vector3().subVectors(edge[0], edge[1]).normalize();
    return ((Math.PI / 2) - dir.angleTo(normal));
}
/**
 * It checks if a value is an integer.
 * @param value - The value to be checked.
 */
function isInt(value) {
    return !isNaN(value) && (function (x) { return (x | 0) === x; })(parseFloat(value))
}

/**
 * It takes an edge (two points) and returns two points that are on the left and right of the edge.
 * @param edge - an array of two points, the edge to be split
 * @returns An array of two points.
 */
export function getPointsOnLeftRightOfEdge(edge){
    let pointLeft = new THREE.Vector3();
    let pointRight = new THREE.Vector3();
    if (edge[0].z < edge[1].z) {
        edge.reverse();
    }
    pointLeft = getNormalMidpoint(edge[0], edge[1], 0.3);
    pointRight = getNormalMidpoint(edge[0], edge[1], -0.3);
    return [pointLeft, pointRight];
}

/**
 * It returns an array of two arrays, each of which contains the objects that are adjacent to the edge
 * @param edge - the edge to get the adjacent objects to
 * @param stage - The stage object
 * @returns An array of two arrays. Each array contains the objects that are below the point.
 */
export function getObjectAdjacentToEdge(edge, stage){
    const points = getPointsOnLeftRightOfEdge(edge);
    let objectMeshes = stage.mergeManager.getAllMeshesInScene();
    let objects1 = getAllObjectsBelowPoint(points[0], stage, undefined, objectMeshes, 0.0001);
    let objects2 = getAllObjectsBelowPoint(points[1], stage, undefined, objectMeshes, 0.0001);
    if(objects1.length > 0 && objects2.length > 0){
        return [objects1,objects2];
    }
    else return [];
}

/**
 * If the two objects adjacent to the edge are both SmartroofModels and they are not the same object,
 * then return true.
 * @param edge - the edge that is being checked
 * @param stage - the stage object
 * @returns An array of arrays of arrays of objects.
 */
function isIntersectionEdge(edge,stage){
    let objects = getObjectAdjacentToEdge(edge, stage)
    if(objects[0][0][0] instanceof SmartroofModel && objects[1][0][0] instanceof SmartroofModel){
        if(objects[0][0][0].id !== objects[1][0][0].id){
            return true;
        }
    }
    return false;
}
/**
 * It takes an edge and a stage, and returns the angle of the face that is adjacent to the edge with
 * the ground
 * @param edge - [{x: 0, y: 0}, {x: 0, y: 1}]
 * @param stage - The stage object from Konva.js
 * @returns The angle of the face with the ground.
 */
export function getFaceAngleAroundEdge(edge, stage) {
    const midPoint = getMidpoint(edge[0], edge[1]);
    const objects = getObjectAdjacentToEdge(edge, stage);
    const points =  getPointsOnLeftRightOfEdge(edge);
    
    points[0].z = parseFloat(Math.max(objects[0][0][1], 0).toFixed(3));
    points[1].z = parseFloat(Math.max(objects[1][0][1], 0).toFixed(3));
    
    const anglewithGround1 = getEdgeAngleWithGround([midPoint, points[0]]);
    const anglewithGround2 = getEdgeAngleWithGround([midPoint, points[1]]);
    return [anglewithGround1, anglewithGround2];
}

 /**
  * If the edge is outside the model and the angle of the edge is less than 0.1 radians, then it's an
  * eave.
  * @param edge - an edge of the model
  * @param modelEdges - an array of edges that make up the model
  * @returns A boolean value.
  */
 export function isEave(edge, modelEdges, modelVertices=[]) {
    let isOutside;
    if(modelVertices.length > 0) isOutside = isOutsideEdge(edge, modelEdges,modelVertices);
    else isOutside = isOutsideEdge(edge, modelEdges,[]);
     const angle = getEdgeAngleWithGround(edge);
    if (isOutside && Math.abs(angle) < 0.1) {
        return true
    }
    return false;
}

/**
 * If the edge is outside the model, and the angle of the edge with the ground is greater than 0.1, and
 * the objects adjacent to the edge are not templates, and the difference in the heights of the objects
 * adjacent to the edge is greater than 0.5, then the edge is a rack.
 * @param edge - the edge in question
 * @param modelEdges - an array of edges that are part of the model
 * @param stage - The stage object of the Konva library.
 */
export function isRack(edge, modelEdges, stage) {
    let flag = false;
    if (isOutsideEdge(edge, modelEdges,[]) && Math.abs(getEdgeAngleWithGround(edge)) > 0.1) {
        flag = true;
    }
    let objects = getObjectAdjacentToEdge(edge, stage);
    let thresh = 0.3;
    let topobj1, topobj2;
    if (objects.length > 1) {
        topobj1 = objects[0][0][0] instanceof Subarray ? objects[0][1][0] : objects[0][0][0];
        topobj2 = objects[1][0][0] instanceof Subarray ? objects[1][1][0] : objects[1][0][0];
        if (objects[0][0][0].isTemplate || objects[1][0][0].isTemplate) {
            flag = false;
            thresh = 0.1;
        } else {

            let eq = (topObj) => { return topObj instanceof SmartroofModel || topObj instanceof Drawface || topObj instanceof Dormer };
            if (eq(topobj1) && eq(topobj2)) {
                if (topobj1.id !== topobj2.id) {
                    thresh = 0.1;
                }
            }
        }

        if ((Math.abs(objects[0][0][1] - objects[1][0][1]) > thresh)) {
            flag = true;
        }
    } 
    return flag;
}

/**
 * If the angle of the edge is less than the threshold, and the edge is not an intersection edge, then
 * it is a ridge
 * @param edge - the edge to check
 * @param [tilt=20] - the angle of the roof in degrees
 * @param stage - the stage object
 * @returns A boolean value.
 */
export function isRidge(edge, tilt = 20, stage) {
    let angle = getEdgeAngleWithGround(edge);
    let threshold = 5;
    if (isInt(tilt)) {
        threshold = tilt / 4;
    }
    threshold = deg2Rad(threshold)
    if (Math.abs(angle) < threshold) {
        if(isIntersectionEdge(edge, stage)){
            return false;
        }
        return true;
    }
    return false;
}
/**
 * If the angle of the face around the edge is greater than 0, then it's a hip.
 * @param edge - an array of two vertices that make up an edge
 * @param stage - the stage of the roof, which is the number of faces that are connected to the edge.
 * @returns A boolean value.
 */
export function isHip(edge, stage) {
    const angles = getFaceAngleAroundEdge([...edge], stage);
    if ( angles[0] > 0 || angles[1] > 0) {
        return true
    }
    return false;
}
/**
 * If the angle of the face on either side of the edge is less than 0, then the edge is a valley.
 * @param edge - [0, 1]
 * @param stage - an array of arrays of vertices.
 * @returns a boolean value.
 */
export function isValley(edge, stage) {
    const angles = getFaceAngleAroundEdge([...edge], stage);
    if (angles[0] < 0 && angles[1] < 0) {
        return true;
    }
    return false;
}

export  function getEdgesWithPanelsAround(ground){
    const result = getAllModelType();
    getModels(ground, result);
    let commonEdges = [];
    for (let smartroofFaceModel of result.smartroofFaces) {
        if (smartroofFaceModel.hasPanel() && !smartroofFaceModel.isDeleted && smartroofFaceModel.isValid) {
            for (let i = 0; i < smartroofFaceModel.setbackVertices.length; i++) {
                if (!smartroofFaceModel.setbackEdges[i]) {
                    continue;
                }
                let faceEdges = [...smartroofFaceModel.setbackEdges[i]];
                for (let i = 0; i < faceEdges.length; i++) {
                    commonEdges.push(faceEdges[i]);
                }
            }
        }
    }
    return commonEdges;
}


const precisionModel = new JSTS.geom.PrecisionModel(1000);
export function getReducedPrecisionJSTSGeometry(geometry) {
    try {
        const reducedGeo = JSTS.precision.GeometryPrecisionReducer.reduce(geometry, precisionModel);
        return reducedGeo;
    } catch (error) {
        const geometryFactory = new JSTS.geom.GeometryFactory();
        return geometryFactory.createPolygon([]);
    }
}

export function removeCollinearPoints(points) {
    const slopes = [];
    const vertices = [...points];
    for (let i = 0, len = points.length; i < len; i += 1) {
        const idx2 = (i + 1) >= len ? 0 : (i + 1);
        let dX = (points[idx2][0] - points[i][0]);
        let dY = (points[idx2][1] - points[i][1]);

        dX = Math.abs(dX) < 0.001 ? 0 : dX;
        dY = Math.abs(dY) < 0.001 ? 0 : dY;

        const m = dX !== 0 ? Math.round((dY / dX) * 1000) / 1000 : Infinity;
        const c = m === Infinity ?
            Math.round(10 * points[i][0]) / 10 :
            Math.round(10 * (points[i][1] - (m * points[i][0]))) / 10;

        slopes.push({
            slope: m,
            p1: i,
            p2: idx2,
            intercept: c,
        });
    }
    slopes.sort((a, b) => a.intercept - b.intercept);

    const pointsToRemove = [];
    for (let i = 0, len = slopes.length; i < len - 1; i += 1) {
        if (slopes[i].intercept === slopes[i + 1].intercept &&
            slopes[i].slope === slopes[i + 1].slope) {
            const point = slopes[i].p1 === slopes[i + 1].p2 ? slopes[i].p1 : slopes[i].p2;
            pointsToRemove.push(point);
        }
    }
    pointsToRemove.sort((a, b) => b - a);

    for (let i = 0, len = pointsToRemove.length; i < len; i += 1) {
        vertices.splice(pointsToRemove[i], 1);
    }

    return vertices;
}

export function findAdjustedAzimuth(azimuth) {
    let correctAzimuth = 180 - azimuth;
    correctAzimuth = correctAzimuth < 0 ? correctAzimuth + 360 : correctAzimuth;
    return correctAzimuth;
}

export function ifSet(object, path) {
    return path.split('.').reduce((obj, part) => obj && obj[part], object)
}

export function getUniqueDcStringsOnPanels(panels) {
    const dcStrings = [];
    for (const panel of panels) {
        const electricalComponent = panel.electricalComponentConnected;
        if (electricalComponent !== undefined &&
            electricalComponent !== null &&
            electricalComponent instanceof DCString) {
            if (!(dcStrings.includes(electricalComponent))) {
                dcStrings.push(electricalComponent);
            }
        }
    }
    return dcStrings;
}

// TODO: Jugaad, fix for moveObject of safety line
export function updateHandrailAndSafetyLineForMove(objectMoved) {
    for (let i = 0; i < objectMoved.getChildren().length; i += 1) {
        const child = objectMoved.getChildren()[i];
        if (child instanceof SafetyLine) {
            child.update3DSafetyLine();
        } else if (child instanceof Handrail) {
            child.update3DHandrail();
        } else if (child instanceof PolygonModel || child instanceof CylinderModel || child instanceof SmartroofModel || child instanceof SmartroofFace || child instanceof Dormer) {
            updateHandrailAndSafetyLineForMove(child);
        }
    }
}

// this check if the edge is at an azimuth (parallel or anti parallel) : precision in degrees
export function checkParallel(azimuth, edge, precisionInDeg) {
    precisionInDeg = precisionInDeg || 5; // default is set to 5 degs.
    let result = {
        isParallel: false,
        isAntiParallel: false,
        isNonParallel: false
    };
    let dy = edge[1].y - edge[0].y;
    let dx = edge[1].x - edge[0].x;
    if (dx == 0) { //  later on check for anti parallel
        if (Math.abs(azimuth - 90) <= precisionInDeg || Math.abs(azimuth - 270) <= precisionInDeg) {
            result.isParallel = true;
        } else {
            result.isNonParallel = true;
        }
        return result;
    }
    let slope = dy / dx;
    let angle = Math.atan(slope) * 180 / Math.PI;
    if (azimuth <= 90) {
        azimuth = -azimuth;
    } else if (azimuth <= 180) {
        azimuth = -(azimuth - 180);
    } else if (azimuth <= 270) {
        azimuth = -(azimuth - 180);
    } else {
        azimuth = -(azimuth - 360);
    }

    if (Math.abs(angle - azimuth) <= precisionInDeg) {
        result.isParallel = true;
    } else if (Math.abs(azimuth) > (90 - precisionInDeg / 2) && Math.abs(azimuth + angle) <= precisionInDeg) {
        result.isParallel = true;
    } else {
        result.isNonParallel = true;
    }
    return result;
}

// QuickSort (this is custom sort for sorting according to x component of a vector)
export function quickSort(arr, left, right) {
    var len = arr.length,
        pivot,
        partitionIndex;


    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1);
        quickSort(arr, partitionIndex + 1, right);
    }
    return arr;
}

function partition(arr, pivot, left, right) {
    var pivotValue = arr[pivot],
        partitionIndex = left;

    for (var i = left; i < right; i++) {
        if (arr[i].x < pivotValue.x) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

/**
 * 
 * @param {* 2d-array} vertices1 
 * @param {* 2d-array} vertices2 
 */
export function checkPolygonIntersection(vertices1, vertices2) {
    const poly1 = JSTSConverter.verticesToJSTSPolygon(vertices1);
    const poly2 = JSTSConverter.verticesToJSTSPolygon(vertices2);
    return poly1.intersects(poly2);
}

export function checkIntersectionWithSiblings(parent, object, objectVertices) {
    const children = parent.getChildren();
    for (let i = 0, l = children.length; i < l; i += 1) {
        if (children[i] !== object && !(children[i] instanceof Subarray) &&
            !(children[i] instanceof SafetyLine) && !(children[i] instanceof Walkway) &&
            !(children[i] instanceof AcCable) && !(children[i] instanceof DcCable) &&
            !(children[i] instanceof Conduit) && !(children[i] instanceof DoubleConduit) &&
            !(children[i] instanceof DoubleSeparateConduit) &&
            !(children[i] instanceof SingleCableTray) && !(children[i] instanceof DoubleCableTray) &&
            !(children[i] instanceof DoubleSeparateCableTray)) {
            if (checkPolygonIntersection(objectVertices, children[i].get2DVertices())) {
                return true;
            }
        }
    }
    return false;
}

export function checkIntersectionWithSiblingsCustom(parent, object, objectVertices) {
    const children = parent.getChildren();
    for (let i = 0, l = children.length; i < l; i += 1) {
        if (children[i] !== object && !(children[i] instanceof Subarray) &&
            !children[i].ignored &&
            !(children[i] instanceof AcCable) && !(children[i] instanceof DcCable) &&
            !(children[i] instanceof Conduit) && !(children[i] instanceof DoubleConduit) &&
            !(children[i] instanceof DoubleSeparateConduit) &&
            !(children[i] instanceof SingleCableTray) && !(children[i] instanceof DoubleCableTray) &&
            !(children[i] instanceof DoubleSeparateCableTray)) {
            if (checkPolygonIntersection(objectVertices, children[i].get2DVertices())) {
                return true;
            }
        }
    }
    return false;
}

export function checkBoxIntersection(rowBox, edge) {
    let result = false;

    if ((edge[0].x >= rowBox.min.x && edge[0].y >= rowBox.min.y) && (edge[0].x <= rowBox.max.x && edge[0].y <= rowBox.max.y)) {
        result = true;
    }

    if ((edge[1].x >= rowBox.min.x && edge[1].y >= rowBox.min.y) && (edge[1].x <= rowBox.max.x && edge[1].y <= rowBox.max.y)) {
        result = true;
    }

    return result;
}


function onSegment(p, q, r) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
        return true;
    }
    return false;
}

/**
 * returns the lerp value of point wrt vertices
 * vertices[0] has lerp value 0
 * vertices[1] has lerp value 1
 * @param {* the reference vertices in vector2 form} vertices
 * @param {* the point whose lerp value needs to be found out} point
 */
export function getLerpValueFromVertices(vertices, point) {
    const xDisp = vertices[1].x - vertices[0].x;
    const yDisp = vertices[1].y - vertices[0].y;
    let numbers = 0;
    let xLerpValue = 0;
    if (Math.abs(xDisp) >= 0.001) {
        xLerpValue = (point.x - vertices[0].x) / xDisp;
        numbers += 1;
    }
    let yLerpValue = 0;
    if (Math.abs(yDisp) >= 0.001) {
        yLerpValue = (point.y - vertices[0].y) / yDisp;
        numbers += 1;
    }
    if (numbers === 0) {
        return 0;
    }
    return (xLerpValue + yLerpValue) / numbers;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    const val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));

    if (val === 0) return 0; // colinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

/**
 * Function to find out the perpendicular distance between a point and a line
 * @param {* vector array} point
 * @param {* array of vector2 of length 2} line
 * @returns {* distance between line and point in float}
 */
export function findPerpendicularDistance(point, line) {
    const pointX = point[0][0];
    const pointY = point[0][1];
    const lineStart = {
        x: line[0][0],
        y: line[0][1],
    };
    const lineEnd = {
        x: line[1][0],
        y: line[1][1],
    };
    const slope = (lineEnd.y - lineStart.y) / (lineEnd.x - lineStart.x);
    const intercept = lineStart.y - (slope * lineStart.x);
    const result = Math.abs(((slope * pointX) - pointY) + intercept) / Math.sqrt((slope ** 2) + 1);
    return result;
}

/**
 * Returns true if edge 1 and 2 intersects, with the point of intersection,
 * false if they do not intersect.
 * @param {*array of vector2 of length 2} edge1
 * @param {*array of vector2 of length 2} edge2
 * @returns {* an object in the format {
 *  intersect: true/false,
 *  point: the point of intersection}
 * }
 */
export function lineIntersection(edge1, edge2) {
    // Find the four orientations needed for general and
    // special cases
    const o1 = orientation(edge1[0], edge1[1], edge2[0]);
    const o2 = orientation(edge1[0], edge1[1], edge2[1]);
    const o3 = orientation(edge2[0], edge2[1], edge1[0]);
    const o4 = orientation(edge2[0], edge2[1], edge1[1]);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        const result = checkLineIntersection(edge1, edge2);
        if (result.onLine1 && result.onLine2) {
            return { intersect: true, point: new THREE.Vector2(result.x, result.y) };
        }
        return { intersect: false, point: new THREE.Vector2(Infinity, Infinity) };
    }

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 0 && onSegment(edge1[0], edge2[0], edge1[1])) {
        return { intersect: true, point: edge2[0] };
    }

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 === 0 && onSegment(edge1[0], edge2[1], edge1[1])) {
        return { intersect: true, point: edge2[1] };
    }

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 0 && onSegment(edge2[0], edge1[0], edge2[1])) {
        return { intersect: true, point: edge1[0] };
    }

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 0 && onSegment(edge2[0], edge1[1], edge2[1])) {
        return { intersect: true, point: edge1[1] };
    }

    // Doesn't fall in any of the above cases
    return { intersect: false, point: new THREE.Vector2(Infinity, Infinity) };
}

export function getAllTables(parent, result) {
    const children = parent.getChildren();
    for (let i = 0, len = children.length; i < len; i += 1) {
        if (children[i] instanceof PolygonModel ||
            children[i] instanceof SmartroofModel ||
            children[i] instanceof SmartroofFace ||
            children[i] instanceof Dormer ||
            children[i] instanceof CylinderModel ||
            children[i] instanceof Subarray ||
            children[i] instanceof Row ||
            children[i] instanceof Gazebo
        ) {
            getAllTables(children[i], result);
        } else if (children[i] instanceof Table) {
            result.push(children[i]);
        }
    }
}

//check which side a point(c) lies of a line of 2 points(a,b)
export function getSideofLine(a, b, c) {
    if (checkIfPointLiesOnLineSegment([a, b], c)) {
        return true;
    }
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) >= 0;
}


// get edges
export function getEdges(vertices2DArray) {
    let vertices = convertArrayToVector(vertices2DArray);
    let edges = [];

    for (let i = 0; i < vertices.length - 1; i++) {
        edges.push([
            vertices[i],
            vertices[i + 1]
        ]);
    }

    if (vertices2DArray.length > 2 &&
        (vertices[vertices2DArray.length - 1].x !== vertices[0].x ||
            vertices[vertices2DArray.length - 1].y !== vertices[0].y)) {
        edges.push([
            vertices[vertices2DArray.length - 1],
            vertices[0]
        ]);
    }
    return edges;
}

/**
 * returns true if the point is inside the vertices
 * else false.
 * @param {*} vertices 2D array
 * @param {*} point 2D point
 */
export function checkPointInsideVertices(vertices, point) {
    const outsidePoint = new THREE.Vector2(Infinity, Infinity);
    for (let i = 0, l = vertices.length; i < l; i += 1) {
        if (vertices[i][0] < outsidePoint.x) {
            outsidePoint.x = vertices[i][0];
        }
        if (vertices[i][1] < outsidePoint.y) {
            outsidePoint.y = vertices[i][1];
        }
    }
    outsidePoint.subScalar(2);
    const extEdge = [outsidePoint, new THREE.Vector2(point[0], point[1])];

    const edgesOfVertices = getEdges(vertices);

    let noOfIntersection = 0;
    let prevPoint = new THREE.Vector2(-Infinity, -Infinity);
    for (let j = 0, mEdgeLen = edgesOfVertices.length; j < mEdgeLen; j += 1) {
        const check = lineIntersection(extEdge, edgesOfVertices[j]);
        if (check.intersect && !prevPoint.equals(check.point)) {
            prevPoint = check.point;
            noOfIntersection += 1;
        }
    }

    if (noOfIntersection % 2 === 1) {
        return true;
    }
    return false;
}

// pnpoly implementation from: https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
export function checkPointInsideVertices3D(verticesList, point, vertical = true) {
    // Uncomment for pnpoly
    const pnpoly = (vertices, test) => {
        let oddIntersections = false;
        const nVertices = vertices.length;
        for (let i = 0, j = nVertices - 1; i < nVertices; j = i++) {
            if (
                ((vertices[i].y > test.y) !== (vertices[j].y > test.y)) &&
                (test.x < (((vertices[j].x - vertices[i].x) * (test.y - vertices[i].y))
                    / (vertices[j].y - vertices[i].y)) + vertices[i].x)
            ) oddIntersections = !oddIntersections;
        }
        return oddIntersections;
    };

    const vertX = verticesList.map(vertex => vertex.x);
    const vertY = verticesList.map(vertex => vertex.y);
    const vertZ = verticesList.map(vertex => vertex.z);
    const rangeX = Math.abs(Math.max(...vertX) - Math.min(...vertX));
    const rangeY = Math.abs(Math.max(...vertY) - Math.min(...vertY));
    // const rangeZ = Math.abs(Math.max(...vertZ) - Math.min(...vertZ));
    const rangeZ = vertical ? Infinity : Math.abs(Math.max(...vertZ) - Math.min(...vertZ));

    const minRange = Math.min(rangeX, rangeY, rangeZ);
    if (minRange === rangeX) {
        const vert2D = verticesList.map((vertex) => {
            const projected = { x: vertex.y, y: vertex.z };
            return projected;
        });
        const projectedPoint = { x: point.y, y: point.z };

        // Uncomment for pnpoly
        return pnpoly(vert2D, projectedPoint);

        // Uncomment for older Algo
        // const vertArray = vert2D.map(vertex => [vertex.x, vertex.y]);
        // const projArray = [projectedPoint.x, projectedPoint.y];
        // return inspectPointInsideVertices(vertArray, projectedPoint);
    }
    if (minRange === rangeY) {
        const vert2D = verticesList.map((vertex) => {
            const projected = { x: vertex.x, y: vertex.z };
            return projected;
        });
        const projectedPoint = { x: point.x, y: point.z };

        // Uncomment for pnpoly
        return pnpoly(vert2D, projectedPoint);

        // Uncomment for older Algo
        // const vertArray = vert2D.map(vertex => [vertex.x, vertex.y]);
        // const projArray = [projectedPoint.x, projectedPoint.y];
        // return inspectPointInsideVertices(vertArray, projectedPoint);
    }
    if (minRange === rangeZ) {
        const vert2D = verticesList.map((vertex) => {
            const projected = { x: vertex.x, y: vertex.y };
            return projected;
        });
        const projectedPoint = { x: point.x, y: point.y };

        // Uncomment for pnpoly
        return pnpoly(vert2D, projectedPoint);

        // Uncomment for older Algo
        // const vertArray = vert2D.map(vertex => [vertex.x, vertex.y]);
        // const projArray = [projectedPoint.x, projectedPoint.y];
        // return inspectPointInsideVertices(vertArray, projectedPoint);
    }

    console.error('checkPointInsideVertices3D broke: ', verticesList, vertX, rangeX, minRange);
    return false;
}

export function checkPointInsideMesh(point, mesh, setAttribute = false) {
    const raycaster = new THREE.Raycaster();
    // Direction is arbitrary, since any direction should work.
    const direction = new THREE.Vector3(1, 1, 1);
    direction.normalize();
    raycaster.set(point, direction);
    const intersections = [];
    mesh.raycast(raycaster, intersections);
    if ((intersections.length % 2) === 1) {
        if (setAttribute) point.isInside = true;
        return true;
    }
    if (setAttribute && !point.isInside) point.isInside = false;
    return false;
}

export function checkPointOnEdgesApprx(vertices, point) {
    const pointVect = new THREE.Vector2(point[0], point[1]);
    const edgesOfVertices = getEdges(vertices);

    for (let j = 0, mEdgeLen = edgesOfVertices.length; j < mEdgeLen; j += 1) {
        const edge = edgesOfVertices[j];
        if (Math.abs((edge[0].distanceTo(edge[1])) - (edge[0].distanceTo(pointVect) + edge[1].distanceTo(pointVect))) < 0.00001) {
            return true;
        }
    }

    return false;
}

//GOOGLE MAP SIGNING FUNCTIONS
function removeWebSafe(safeEncodedString) {
    return safeEncodedString.replace(/-/g, '+').replace(/_/g, '/');
}

function makeWebSafe(encodedString) {
    return encodedString.replace(/\+/g, '-').replace(/\//g, '_');
}

function decodeBase64Hash(code) {
    return Buffer.from(code, 'base64');
}

function encodeBase64Hash(key, data) {
    let cbase64 = crypto.HmacSHA1(data, crypto.lib.WordArray.create(key)).toString(crypto.enc.Base64);
    return cbase64;
}

export function signRequest(path, secret) {
    const uri = url.parse(path);
    const safeSecret = decodeBase64Hash(removeWebSafe(secret));
    const hashedSignature = makeWebSafe(encodeBase64Hash(safeSecret, uri.path));
    return url.format(uri) + '&signature=' + hashedSignature;
}

/**
 * It takes a geometry, and computes the UVs based on the bounding box of the Parent Geometry or the bounding box of.
 * If you want to calculate uv just from the Geometry then pass just the geometry not parent geometry.
 * If you want to calculate UV in refrence to its parent then pass.
 * @param geometry - the geometry to compute the UVs for
 * @param [parentGeometry=false] - The geometry that the UVs will be computed from. If not specified,
 * the geometry itself will be used.
 */
export function computeUVs(geometry, parentGeometry = false) {
    let points = geometry.getAttribute('position').array;
    if (!parentGeometry){
        parentGeometry = geometry;
    }
    parentGeometry.computeBoundingBox();

    let max = parentGeometry.boundingBox.max,
    min = parentGeometry.boundingBox.min;
    let offset = new THREE.Vector2(0 - min.x, 0 - min.y);
    let range = new THREE.Vector2(max.x - min.x, max.y - min.y);

    let quad_uv = [];
    for (let i = 0; i < points.length-1; i+=3) {
        quad_uv.push((points[i] + offset.x) / range.x);
        quad_uv.push((points[i + 1] + offset.y) / range.y);
    }
    geometry.setAttribute('uv',new THREE.BufferAttribute( new Float32Array( quad_uv), 2 )) ;
    geometry.computeVertexNormals();
}

export function inspectPointInsideVertices(vertices, point) {
    let x = point.x,
        y = point.y;

    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        let xi = vertices[i][0],
            yi = vertices[i][1];
        let xj = vertices[j][0],
            yj = vertices[j][1];

        let intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export function getBoundingBox(vertices) {
    let box = {
        min: new THREE.Vector2(Infinity, Infinity),
        max: new THREE.Vector2(-Infinity, -Infinity)
    }

    for (let v of vertices) {
        if (v[0] < box.min.x) {
            box.min.x = v[0];
        }
        if (v[1] < box.min.y) {
            box.min.y = v[1];
        }
        if (v[0] > box.max.x) {
            box.max.x = v[0];
        }
        if (v[1] > box.max.y) {
            box.max.y = v[1];
        }
    }

    return box;
}

export function getSetbackPoints(vertices3DArray, offset) {
    let vertices3DVectorArray = convertArrayTo3DVector(vertices3DArray);
    let vectorA = vertices3DVectorArray[0];
    let vectorB = vertices3DVectorArray[1];
    let vectorC = vertices3DVectorArray[2];
    let vectorBA = new THREE.Vector3();
    let vectorBC = new THREE.Vector3();
    vectorBA.subVectors(vectorB, vectorA);
    vectorBC.subVectors(vectorB, vectorC);
    let planeNormal = new THREE.Vector3();
    planeNormal.crossVectors(vectorBA, vectorBC);
    planeNormal.normalize();

    let quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(planeNormal, new THREE.Vector3(0, 0, 1));

    let newVertices3DVectorArray = convertArrayTo3DVector(vertices3DArray);
    let flatOutline2DArray = [];

    for (let vertex of newVertices3DVectorArray) {
        vertex.x -= vectorB.x;
        vertex.y -= vectorB.y;
        vertex.z -= vectorB.z;
        vertex.applyQuaternion(quaternion);
        flatOutline2DArray.push([vertex.x, vertex.y]);
    }

    let setbackInsidePoints = setbackPolygon(flatOutline2DArray, offset);


    let setbackVectorArray = [];
    for (let insideVertex of setbackInsidePoints) {
        setbackVectorArray.push(new THREE.Vector3(insideVertex[0], insideVertex[1], 0));
    }

    let reverseQuaternion = new THREE.Quaternion();
    reverseQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), planeNormal);

    for (let vertex of setbackVectorArray) {
        vertex.applyQuaternion(reverseQuaternion);
        vertex.x += vectorB.x;
        vertex.y += vectorB.y;
        vertex.z += vectorB.z;
    }

    return setbackVectorArray;
}

export function updateShapeCurves(shape, deltaX, deltaY) {
    const { curves } = shape;
    for (let i = 0; i < curves.length; i += 1) {
        curves[i].v1.x += deltaX;
        curves[i].v1.y += deltaY;

        curves[i].v2.x += deltaX;
        curves[i].v2.y += deltaY;
    }
}

export function updateShapeHoles(shape, deltaX, deltaY) {
    const { holes } = shape;
    for (let i = 0; i < holes.length; i += 1) {
        for (let j = 0; j < holes[i].curves.length; j += 1) {
            holes[i].curves[j].v1.x += deltaX;
            holes[i].curves[j].v1.y += deltaY;

            holes[i].curves[j].v2.x += deltaX;
            holes[i].curves[j].v2.y += deltaY;
        }
    }
}

export function translateShapeGeometry(geometry, deltaX, deltaY) {
    if (ifSet(geometry, 'parameters.shapes')) {
        const { shapes } = geometry.parameters;
        if (shapes instanceof Array && shapes.length > 0) {
            for (let i = 0; i < shapes.length; i += 1) {
                if (ifSet(shapes[i], 'holes')) {
                    updateShapeHoles(shapes[i], deltaX, deltaY);
                }
                if (ifSet(shapes[i], 'curves')) {
                    updateShapeCurves(shapes[i], deltaX, deltaY);
                }
            }
        } else {
            if (ifSet(shapes, 'holes')) {
                updateShapeHoles(shapes, deltaX, deltaY);
            }
            if (ifSet(shapes, 'curves')) {
                updateShapeCurves(shapes, deltaX, deltaY);
            }
        }
    }
}

export function directionOfPoint(A, B, P) {
    B.x -= A.x;
    B.y -= A.y;
    P.x -= A.x;
    P.y -= A.y;

    // Determining cross Product
    let cross_product = B.x * P.y - B.y * P.x;

    // return RIGHT if cross product is positive
    if (cross_product > 0)
        return 1;

    // return LEFT if cross product is negative
    if (cross_product < 0)
        return -1;

    // return ZERO if cross product is zero.
    return 0;
}

// get outside setback intersection with parent polygon
export function outsideSetbackIntersectionWithParent(
    outerSetbackPoints,
    innerPolygonPoints,
    parentPolygonPoints,
) {
    try {
        const parentPolygon =
            getReducedPrecisionJSTSGeometry(JSTSConverter.verticesToJSTSPolygon(parentPolygonPoints));
        const innerPolygon =
            getReducedPrecisionJSTSGeometry(JSTSConverter.verticesToJSTSPolygon(innerPolygonPoints));
        if (parentPolygon.within(innerPolygon)) {
            return new Error(PARENT_WITHIN_CHILD_SO_NO_SETBACK_OUTSIDE_ERROR);
        }
        const setBackPolygon =
            getReducedPrecisionJSTSGeometry(JSTSConverter.verticesToJSTSPolygon(outerSetbackPoints));

        const tempPolygon = getReducedPrecisionJSTSGeometry(JSTSConverter.validateJSTSPolygon(
            setBackPolygon,
            innerPolygon,
        ));
        const intersectingPolygon =
            getReducedPrecisionJSTSGeometry(parentPolygon.intersection(tempPolygon));
        const diffPolygon =
            getReducedPrecisionJSTSGeometry(intersectingPolygon.difference(innerPolygon));

        const vertices = JSTSConverter.verticesFromJSTSPolygonWithHoles(diffPolygon);
        return vertices;
    } catch (error) {
        return new Error('Cannot generate outside setback');
    }
}

// returns true if the geometry is self intersecting
export function checkComplexGeometry(vertices) {
    return !JSTSConverter.verticesToJSTSPolygon(vertices).isSimple();
}

// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
export function isOverLineSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
        q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}

// converts list of 2d (as array) to list of Vector2
export function convertArrayToVector(vertices) {
    let vectorVertices = [];
    for (let v of vertices) {
        if (v instanceof THREE.Vector2 || v instanceof THREE.Vector3) {
            return vertices;
        }
        vectorVertices.push(new THREE.Vector2(
            v[0],
            v[1]
        ));
    }
    return vectorVertices;
}

// Checks if the point lies on the line. Line is an array of vectors or arrays,
// point is an array or vector
export function checkIfPointLiesOnLineSegment(line, point, EPSILON = 0) {
    let formattedLine;
    let formattedPoint;
    if (!(point instanceof THREE.Vector2 || point instanceof THREE.Vector3)) {
        [formattedPoint] = convertArrayToVector([point]);
    } else {
        formattedPoint = point;
    }
    if (!(line[0] instanceof THREE.Vector2 || line[0] instanceof THREE.Vector3)) {
        formattedLine = convertArrayToVector(line);
    } else {
        formattedLine = line;
    }
    if (formattedLine[0] === formattedPoint || formattedLine[1] === formattedPoint) {
        return true;
    }

    const slope = (formattedLine[0].y - formattedLine[1].y) /
        (formattedLine[0].x - formattedLine[1].x);
    const constant = formattedLine[0].y - (slope * formattedLine[0].x);

    const liesOnLine = Math.abs(formattedPoint.y - ((slope * formattedPoint.x) + constant)) < 0.1;

    if (liesOnLine) {
        const maxX = Math.max(line[0].x, line[1].x);
        const maxY = Math.max(line[0].y, line[1].y);

        const minX = Math.min(line[0].x, line[1].x);
        const minY = Math.min(line[0].y, line[1].y);

        if (formattedPoint.y > maxY - EPSILON || formattedPoint.y < minY + EPSILON ||
            formattedPoint.x > maxX - EPSILON || formattedPoint.x < minX + EPSILON) {
            return false;
        }
        return true;
    }

    return false;
}

export function checkIfLastVertexOnEdges(vertices) {
    let formattedVertices;
    if (vertices.length < 3) {
        return false;
    }
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    } else {
        formattedVertices = vertices;
    }
    const pointToCheck = formattedVertices[formattedVertices.length - 1];
    for (let i = 0; i < formattedVertices.length - 2; i += 1) {
        if (checkIfPointLiesOnLineSegment(
            [formattedVertices[i], formattedVertices[i + 1]],
            pointToCheck,
        ) &&
            formattedVertices[i].distanceTo(pointToCheck) > 0.001 &&
            formattedVertices[i + 1].distanceTo(pointToCheck) > 0.001) {
            return true;
        }
    }
    return false;
}

export function checkIfVectorPresentInArray(line, lines) {
    for (let i = 0; i < lines.length; i++) {
        if (Math.abs(lines[i][0].x - line[0].x) < 0.0001 && Math.abs(lines[i][0].y - line[0].y) < 0.0001 && Math.abs(lines[i][0].z - line[0].z) < 0.0001 && Math.abs(lines[i][1].x - line[1].x) < 0.0001 && Math.abs(lines[i][1].y - line[1].y) < 0.0001 && Math.abs(lines[i][1].z - line[1].z) < 0.0001) {
            return true;
        }
        if (Math.abs(lines[i][0].x - line[1].x) < 0.0001 && Math.abs(lines[i][0].y - line[1].y) < 0.0001 && Math.abs(lines[i][0].z - line[1].z) < 0.0001 && Math.abs(lines[i][1].x - line[0].x) < 0.0001 && Math.abs(lines[i][1].y - line[0].y) < 0.0001 && Math.abs(lines[i][1].z - line[0].z) < 0.0001) {
            return true;
        }
    }
    return false;
}

export function checkLastEdgeIntersectionWithEdges(vertices) {
    if (vertices.length < 4) {
        return false;
    }
    let formattedVertices;
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    } else {
        formattedVertices = vertices;
    }

    const n = formattedVertices.length;
    const lastEdge = [formattedVertices[n - 2], formattedVertices[n - 1]];
    for (let i = 0; i < n - 2; i += 1) {
        const edge = [formattedVertices[i], formattedVertices[i + 1]];
        const lineIntersectionResult = checkLineIntersection(lastEdge, edge);
        const lineIntersectionPoint =
            new THREE.Vector2(lineIntersectionResult.x, lineIntersectionResult.y);
        if (lineIntersectionResult.onLine1 && lineIntersectionResult.onLine2 &&
            lineIntersectionPoint.distanceTo(edge[0]) > 0.001 &&
            lineIntersectionPoint.distanceTo(edge[1]) > 0.001) {
            return true;
        }
    }
    return false;
}
export function IntersectTwoPlanes(planeA, planeB, out_point, out_dir) {
    const normalA = planeA.normal;
    const pointA = planeA.point;
    const normalB = planeB.normal;
    const pointB = planeB.point;

    const A0 = normalA.x;
    const B0 = normalA.y;
    const C0 = normalA.z;
    const pointAPosition = new THREE.Vector3();
    pointA.getWorldPosition(pointAPosition);
    const x0 = pointAPosition.x;
    const y0 = pointAPosition.y;
    const z0 = pointAPosition.z;
    // D0 = A0 * x0 + B0 * y0 + C0 * z0

    const A1 = normalB.x;
    const B1 = normalB.y;
    const C1 = normalB.z;
    const pointBPosition = new THREE.Vector3();
    pointB.getWorldPosition(pointBPosition);
    const x1 = pointBPosition.x;
    const y1 = pointBPosition.y;
    const z1 = pointBPosition.z;
    // D1 = A1 * x1 + B1 * y1 + C1 * z1

    //https://stackoverflow.com/a/32410473/3427520
    // Intersection of 2-planes: a variation based on the 3-plane version.
    // see: Graphics Gems 1 pg 305
    //
    // Note that the 'normal' components of the planes need not be unit length
    function isect_plane_plane_to_normal_ray(
        p1, p2,
        // output args
        r_point, r_normal) {

        // logically the 3rd plane, but we only use the normal component.
        const p3_normal = new THREE.Vector3();
        p3_normal.crossVectors(p1.normal, p2.normal);
        const det = p3_normal.lengthSq();

        // If the determinant is 0, that means parallel planes, no intersection.
        // note: you may want to check against an epsilon value here.
        if (Math.abs(det) > 0.001) {
            // calculate the final (point, normal)
            r_point.set(0, 0, 0);
            const t0 = p3_normal.clone();
            t0.cross(p2.normal).multiplyScalar(p1.d);
            const t1 = p1.normal.clone();
            t1.cross(p3_normal).multiplyScalar(p2.d);
            r_point.addVectors(t0, t1);
            r_point.divideScalar(det);
            r_normal.copy(p3_normal);
            return true;
        } else {
            return false;
        }
    }

    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    const intersected = isect_plane_plane_to_normal_ray({
        normal: normalA,
        d: -(A0 * x0 + B0 * y0 + C0 * z0), //D0
    }, {
        normal: normalB,
        d: -(A1 * x1 + B1 * y1 + C1 * z1), //D1
    },
        p, n
    );

    if (intersected) {
        out_point.copy(p);
        out_dir.copy(n);
        return {
            p,
            n
        };
    } else {
        return false;
    }
}
export function posResetFor2D(vector) {
    let temp = vector.y;
    vector.setY(-vector.z);
    vector.setZ(temp);
    return vector;
}

export function convertArrayTo3DVector(vertices) {
    let vectorVertices = [];
    for (let v of vertices) {
        if (v instanceof THREE.Vector3) {
            vectorVertices.push(v.clone());
        } else {
            vectorVertices.push(new THREE.Vector3(
                v[0],
                v[1],
                v[2]
            ));
        }
    }
    return vectorVertices;
}


export function convertVectorArrayTo2DArray(vertices) {
    let array = [];
    for (let v of vertices) {
        array.push([v.x, v.y]);
    }
    return array;
}

export function checkVertexEquivalency(vertices) {
    let formattedVertices = vertices;
    if (vertices.length === 0) {
        return false;
    }
    if (!(vertices[0] instanceof THREE.Vector3 || vertices[0] instanceof THREE.Vector2)) {
        formattedVertices = convertArrayToVector(vertices);
    }
    const totalVertices = formattedVertices.length;
    let firstIndex = 0;
    const lastIndex = totalVertices - 1;
    if (totalVertices > 3) {
        firstIndex = 1;
    }
    for (let i = 1; i < totalVertices; i += 1) {
        const prevIndex = (i === 0) ? formattedVertices.length - 1 : i - 1;
        const nextIndex = (i === formattedVertices.length - 1) ? 1 : i + 1;
        if (firstIndex !== lastIndex && firstIndex < totalVertices) {
            if (formattedVertices[lastIndex].distanceTo(formattedVertices[firstIndex]) < 0.00001) {
                return true;
            }
        }
        if ((i !== nextIndex &&
            formattedVertices[i].distanceTo(formattedVertices[nextIndex]) < 0.00001) ||
            (i !== prevIndex &&
                formattedVertices[i].distanceTo(formattedVertices[prevIndex]) < 0.00001)) {
            return true;
        }
        firstIndex += 1;
    }

    return false;
}

export function checkVertexInsidePolygon(polygonVertices, vertex) {
    const polygon = JSTSConverter.verticesToJSTSPolygon(polygonVertices);
    const point = JSTSConverter.vertexToJSTSPoint(vertex);
    return point.coveredBy(polygon);
}

/**
 * Checks if p1 is inside p2.
 * p1 and p2 are vertices of the polygons
 */
export function checkPolygonInsidePolygon(p1, p2) {
    const polygon1 = JSTSConverter.verticesToJSTSPolygon(p1);
    const polygon2 = JSTSConverter.verticesToJSTSPolygon(p2);
    return polygon1.coveredBy(polygon2);
}

export function isGroundOrModel(object) {
    return object instanceof Ground ||
        object instanceof PolygonModel ||
        object instanceof CylinderModel ||
        object instanceof SmartroofFace;
}

// Get max height in the scene. Starts from ground and recursively goes into children till Models and
// Subarrays and returns the maximum height
export function getHighestZ(object) {
    let highestZ = 0;

    if (isGroundOrModel(object)) {
        for (let idx = 0; idx < object.children.length; idx += 1) {
            highestZ = Math.max(highestZ, getHighestZ(object.children[idx]));
        }
    }

    if (object instanceof PolygonModel ||
        object instanceof CylinderModel ||
        object instanceof SmartroofFace ||
        object instanceof SmartroofModel ||
        object instanceof Dormer ||
        object instanceof Subarray ||
        object instanceof Tree ||
        object instanceof Inverter ||
        object instanceof ACDB
    ) {
        highestZ = Math.max(highestZ, object.getHighestZ());
    }

    return highestZ;
}

// Get all children of the model
export function getAllChildren(object) {
    if (!(object instanceof BaseObject) || object instanceof Subarray) {
        return [];
    }

    let children = object.getChildren().slice();

    for (let child of object.getChildren()) {
        children.push(...getAllChildren(child));
    }

    return children;
}

// Get all objects in the scene
export function getAllObjectsInScene(object, result) {
    for (let x = 0; x < object.children.length; x++) {
        if (object.children[x].container instanceof PolygonModel) {
            result.polygons.push(object.children[x].container);
        } else if (object.children[x].container instanceof CylinderModel) {
            result.cylinders.push(object.children[x].container);
        } else if (object.children[x].container instanceof Subarray) {
            result.subarray.push(object.children[x].container);
        } else if (object.children[x].container instanceof Walkway) {
            result.walkways.push(object.children[x].container);
        } else if (object.children[x].container instanceof Table) {
            if (object.children[x].container.hidden !== true) {
                result.tables.push(object.children[x].container);
            }
        } else if (object.children[x].container instanceof DCString) {
            result.dcStrings.push(object.children[x].container);
        } else if (object.children[x].container instanceof ElectricalString) {
            result.strings.push(object.children[x].container);
        } else if (object.children[x].container instanceof DcCable) {
            result.dcCables.push(object.children[x].container);
        } else if (object.children[x].container instanceof Conduit) {
            result.conduits.push(object.children[x].container);
        } else if (object.children[x].container instanceof TextBox) {
            result.textbox.push(object.children[x].container);
        } else if (object.children[x].container instanceof Property) {
            result.property.push(object.children[x].container);
        }
    }
}

// Find UUID object
export function findBaseObjectInChildren(uuid, object) {
    if (object instanceof BaseObject) {
        for (let child of object.getChildren()) {
            if (child.uuid === uuid) {
                return child;
            } else {
                object = findBaseObjectInChildren(uuid, child);
                if (object !== null) {
                    return object;
                }
            }
        }
    }
    return null;
}

// Check if two points are equal by taking a small margin
export function isEquivalent(point1, point2) {
    return Math.abs(point1.x - point2.x) < COORDINATE_CLOSENESS_PRECISION && Math.abs(point1.y - point2.y) < COORDINATE_CLOSENESS_PRECISION;
}

// Given a no of panels and centroid of multipolygon formed by them, calculate the bounding box of the multipolygon
export function boundingBox(objects, centroid) {
    // Calculate distance from centroid to each vertex of each object and take those vertices whose distance is max
    let maxDistance = 0;
    let boundingBox = [];

    for (let i = 0, len1 = objects.length; i < len1; i += 1) {
        const object = objects[i];
        for (let j = 0, len2 = object.corners.length; j < len2; j += 1) {
            const vertex = object.corners[j];
            const distanceSq = ((centroid.x - vertex[0]) ** 2) + ((centroid.y - vertex[1]) ** 2);

            if (distanceSq - maxDistance > 0.00001) {
                maxDistance = distanceSq;
                boundingBox = [vertex];
            } else if (Math.abs(distanceSq - maxDistance) < 0.00001) {
                boundingBox.push(vertex);
            }
        }
    }

    return boundingBox;
}

// Get point on a line specified by 2 points given x
export function pointOnLineWithX(point1, point2, x) {
    // Equation of line given 2 points is
    // x = x1 + (x2 - x1)t
    // y = y1 + (y2 - y1)t
    // Given a x, solve for t and substitute to get y
    const ux = point2.x - point1.x;
    const uy = point2.y - point1.y;

    if (ux === 0) {
        if (x !== point1.x) {
            return null;
        }

        return point1;
    }

    const t = (x - point1.x) / ux;
    const y = point1.y + (uy * t);

    let point = new THREE.Vector2(x, y);

    return point;
}

// Get point on a line specified by 2 points given y
export function pointOnLineWithY(point1, point2, y) {
    // Equation of line given 2 points is
    // x = x1 + (x2 - x1)t
    // y = y1 + (y2 - y1)t
    // Given a x, solve for t and substitute to get y
    const ux = point2.x - point1.x;
    const uy = point2.y - point1.y;

    if (uy === 0) {
        if (y !== point1.y) {
            return null;
        }

        return point1;
    }

    const t = (y - point1.y) / uy;
    const x = point1.x + (ux * t);

    let point = new THREE.Vector2(x, y);

    return point;
}

// Given two lines in the form of a point and a direction vector, calculates the intersection point of the 2 vectors
export function getIntersectionPoint(point1, dirVec1, point2, dirVec2) {
    // Let 2 vectors are in the form -
    // v = point + dirVec * t
    // Then we solve linear equations like
    // point1.x + dirVec1.x * t1 = point2.x + dirVec2.x * t2
    // => dirVec1.x * t1 - dirVec2.x * t2 = point2.x - point1.x
    // We solve for t1 and t2 and substitute to get intersection point
    let coefficientsMatrix = [
        [dirVec1.x, -dirVec2.x],
        [dirVec1.y, -dirVec2.y]
    ];
    let valueMatrix = [point2.x - point1.x, point2.y - point1.y];

    // If both vectors are parallel, then there are no intersection point
    let angle = dirVec1.angleTo(dirVec2);

    if (angle === 0 || angle === Math.PI) {
        return null;
    }

    if (
        ((dirVec1.x === 0) && (dirVec1.y === 0) && (dirVec1.z === 0)) ||
        ((dirVec2.x === 0) && (dirVec2.y === 0) && (dirVec2.z === 0))
    ) {
        return null;
    }

    // Solve the linear equations
    // const [[ t ]] = lusolve(coefficientsMatrix, valueMatrix);

    const t = LuSolve(coefficientsMatrix, valueMatrix);

    // Substitute t to in 1 vector to get intersection point
    let intersection = new THREE.Vector2(point1.x + (dirVec1.x * t), point1.y + (dirVec1.y * t));

    return intersection;
}

// Calculates perpendicular distance from a point to a line specified by two end points
export function getPerpendicularDistanceSq(point, start, end) {
    const aPoint = new THREE.Vector3(point.x, point.y, 0);

    // Create a line using the given end points
    const line = new THREE.Line3(
        new THREE.Vector3(start.x, start.y, 0),
        new THREE.Vector3(end.x, end.y, 0)
    );

    // Create a point to store perpendicular point from the point to the line
    const perpendicular = new THREE.Vector3();

    // Calculate perpendicular point and store in perpendicular
    line.closestPointToPoint(aPoint, false, perpendicular);

    // Calculate distance between given point and the perpendicular point
    const perpendicularDistanceSq =
        ((perpendicular.x - aPoint.x) ** 2) + ((perpendicular.y - aPoint.y) ** 2);

    return {
        perpendicularDistanceSq,
        perpendicularIntersectionPoint: new THREE.Vector2(perpendicular.x, perpendicular.y),
    };
}

// Get a line which makes an angle with the edge specified by given 2 points
// The two points in the line returned are at same distance from point1. The distance is either equal to the length
// of edge vector or passed distance value
export function getLineWithAngle(point1, point2, angle, distance = null) {
    // Create a vector representing the edge from point1 to point2
    const edgeVector = new THREE.Vector3(point2.x - point1.x, point2.y - point1.y, 0);

    // Axis of rotation as z axis
    const rotationAxis = new THREE.Vector3(0, 0, 1);

    // Rotate edge vector about z axis by given angle
    edgeVector.applyAxisAngle(rotationAxis, angle);

    // If distance is given, set length of rotated edge vector equal to distance
    if (distance !== null) {
        edgeVector.setLength(distance);
    }

    // Add point1 to the edge vector to get the other point of rotated edge
    const otherPoint1 = new THREE.Vector2(edgeVector.x + point1.x, edgeVector.y + point1.y);

    // Negate edge vector and add point1 to it to get another point on rotated edge which is on other side
    edgeVector.negate();
    const otherPoint2 = new THREE.Vector2(edgeVector.x + point1.x, edgeVector.y + point1.y);

    return [otherPoint1, otherPoint2];
}

// Get get edges intersecting with the given vertex
export function getEdgesContainingVertex(curPoint, edges) {
    let requiredEdges = []
    for (let i = 0, len = edges.length; i < len; i += 1) {
        const edge = edges[i];
        let { perpendicularDistanceSq } = getPerpendicularDistanceSq(curPoint, edge[0], edge[1])
        if (perpendicularDistanceSq < 0.001) {
            requiredEdges.push(edge);
        }
    }
    return requiredEdges;
}

// Get nearest vertex to a vertex from a list of vertices
export function nearestVertexToVertex(curPoint, vertices) {
    let nearest = new THREE.Vector2();
    let nearestDistance = 100000;
    let nearestUpdated = false;

    for (let i = 0, len = vertices.length; i < len; i += 1) {
        const vertex = vertices[i];
        const distanceSq = (vertex.x - curPoint.x) ** 2 + (vertex.y - curPoint.y) ** 2;

        if (distanceSq < nearestDistance) {
            nearestDistance = distanceSq;
            nearest = vertex;
            nearestUpdated = true;
        }
    }

    if (nearestUpdated) {
        return [nearest, nearestDistance];
    } else {
        return [null, -1];
    }
}

// Get nearest edge from a vertex from a list of edges
export function nearestEdgeToVertex(curPoint, edges) {
    let nearest = [];
    let nearestDistance = 100000;
    let nearestUpdated = false;

    for (let i = 0, len = edges.length; i < len; i += 1) {
        const edge = edges[i];
        const { perpendicularDistanceSq, perpendicularIntersectionPoint } = getPerpendicularDistanceSq(curPoint, edge[0], edge[1]);

        if (isOverLineSegment(edge[0], perpendicularIntersectionPoint, edge[1]) && (perpendicularDistanceSq < nearestDistance)) {
            nearestDistance = perpendicularDistanceSq;
            nearest = edge;
            nearestUpdated = true;
        }
    }

    if (nearestUpdated) {
        return [nearest, nearestDistance];
    } else {
        return [null, -1];
    }
}

export function nearestLineToVertex(curPoint, lines) {
    let nearest = [];
    let nearestDistance = 100000;
    let nearestUpdated = false;

    for (let i = 0, len = lines.length; i < len; i += 1) {
        const line = lines[i];
        const { perpendicularDistanceSq } = getPerpendicularDistanceSq(curPoint, line[0], line[1]);

        if (perpendicularDistanceSq < nearestDistance) {
            nearestDistance = perpendicularDistanceSq;
            nearest = line;
            nearestUpdated = true;
        }
    }

    if (nearestUpdated) {
        return [nearest, nearestDistance];
    } else {
        return [null, -1];
    }
}

// Get nearest vertex from an edge from a list of vertices
export function nearestVertexToEdge(curEdge, vertices) {
    let nearest = new THREE.Vector2();
    let nearestDistance = 100000;
    let nearestUpdated = false;

    for (let i = 0, len = vertices.length; i < len; i += 1) {
        const vertex = vertices[i];
        const { perpendicularDistanceSq } = getPerpendicularDistanceSq(vertex, curEdge[0], curEdge[1]);

        if (perpendicularDistanceSq < nearestDistance) {
            nearestDistance = perpendicularDistanceSq;
            nearest = vertex;
            nearestUpdated = true;
        }
    }

    if (nearestUpdated) {
        return [nearest, nearestDistance];
    } else {
        return [null, -1];
    }
}

// function to get distance between two points.
// This uses the ‘haversine’ formula to calculate the great-circle distance between two point.
// Source: https://www.movable-type.co.uk/scripts/latlong.html
export function getDistanceBetweenTwoLatLng(lat1, lon1, lat2, lon2) {

    // local function to convert degrees to radians
    Math.radians = function (degrees) {
        return degrees * Math.PI / 180;
    };

    // radius of earth in metres
    const R = 6371e3;

    const phi1 = Math.radians(lat1);
    const phi2 = Math.radians(lat2);
    const deltaPhi = Math.radians(lat2 - lat1);
    const deltaLambda = Math.radians(lon2 - lon1);

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c
}

export function getImageDimensions(lat, lng, zoom, width, height) {

    // get top left and top right latitude and longitude
    let topLeftLatLng = getLatLngOfGivenPixel(lat, lng, zoom, width, height, 0, 0);
    let topRightLatLng = getLatLngOfGivenPixel(lat, lng, zoom, width, height, width, 0);

    // get distance between them
    let dist = getDistanceBetweenTwoLatLng(topLeftLatLng.lat, topLeftLatLng.lng, topRightLatLng.lat, topRightLatLng.lng);

    return {
        width: dist,
        height: dist
    }
}
export function getPixelOfLatLng(lat, lng, zoom, width, height, mapCenterLat, mapCenterLng) {
    // lat - latitude of the point
    // lng - longitude of the point
    // zoom - zoom of the static-map
    // width - width of the static-map
    // height - height of the static-map
    // mapCenterLat - center latitude of the static-map
    // mapCenterLng - center longitude of the static-map

    const tiles = 1 << zoom;
    const centerPoint = {
        x: (mapCenterLng + 180) * (256 / 360),
        y: (1 - Math.log(Math.tan(mapCenterLat * Math.PI / 180) + 1 / Math.cos(mapCenterLat * Math.PI / 180)) / Math.PI) * (256 / 2),
    };

    const point = {
        x: (lng + 180) * (256 / 360),
        y: (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) * (256 / 2),
    };

    const pixelX = Math.round((point.x - centerPoint.x) * tiles + width / 2);
    const pixelY = Math.round((point.y - centerPoint.y) * tiles + height / 2);

    return { x: pixelX, y: pixelY };
}
export function getLatLngOfGivenPixel(lat, lng, zoom, width, height, pixelX, pixelY) {
    //     lat - center-latitude of the static-map
    //     lng - center-longitude of the static-map
    //     zoom - zoom of the static-map
    //     width - width of the static-map
    //     height - height of the static-map
    //     pixelX - x-coordinate of the pixel in the image
    //     pixelY - y-coordinate of the pixel in the image

    let x, y, s, tiles, centerPoint, mousePoint, mouseLatLng;
    x = pixelX - (width / 2);
    y = pixelY - (height / 2);
    s = Math.min(Math.max(Math.sin(lat * (Math.PI / 180)), -.9999), .9999);
    tiles = 1 << zoom;
    centerPoint = {
        x: 128 + lng * (256 / 360),
        y: 128 + 0.5 * Math.log((1 + s) / (1 - s)) *
            -(256 / (2 * Math.PI))
    };
    mousePoint = {
        x: (centerPoint.x * tiles) + x,
        y: (centerPoint.y * tiles) + y
    };
    mouseLatLng = {
        lat: (2 * Math.atan(Math.exp(((mousePoint.y / tiles) - 128) /
            -(256 / (2 * Math.PI)))) -
            Math.PI / 2) / (Math.PI / 180),
        lng: (((mousePoint.x / tiles) - 128) / (256 / 360))
    };

    return mouseLatLng;

}

export function lngLatToXY(a, b) {
    const t = 0.017453292519943;
    const c = 6378137;
    (89.99999 < b) ? b = 89.99999 : -89.99999 > b && (b = -89.99999);
    const d = b * t;
    return [
        a * t * c,
        (c / 2) * Math.log((1 + Math.sin(d)) / (1 - Math.sin(d))),
    ];
}

export async function loadFromFirebase(identifier) {

    let baseUrl = 'https://models-35b1d.firebaseio.com/tsl_models/';
    let fileExtension = '.json';

    let url = baseUrl + identifier + fileExtension;

    let responseData = '';


    try {
        let response = await axios.get(
            url
        );
        responseData = response.data;
    } catch (error) {
        console.error('utils: loadFromFirebase failed', error);
    }

    return responseData;

}

export async function saveToFireBase(data) {

    let baseUrl = 'https://models-35b1d.firebaseio.com/';
    let filename = 'tsl_models';
    let fileExtension = '.json';

    let url = baseUrl + filename + fileExtension;

    let identifier = '';

    try {
        let response = await axios.post(
            url,
            data
        );
        identifier = response.data.name;
    } catch (error) {
        console.error('utils: saveToFireBase failed', error);
    }

    return identifier;
}

export function getMidpoint(vertex1, vertex2) {
    // noinspection JSValidateTypes
    return new THREE.Vector3((vertex1.x + vertex2.x) / 2, (vertex1.y + vertex2.y) / 2, (vertex1.z + vertex2.z) / 2);
}

export function getSlope(vertex1, vertex2) {
    return [vertex2.x - vertex1.x, vertex2.y - vertex1.y];
}

export function getEuclideanDistance(vertex1, vertex2) {
    let x1 = vertex1.x - vertex2.x,
        x2 = vertex1.y - vertex2.y,
        x3 = vertex1.z - vertex2.z;
    return parseFloat(Math.sqrt((x1 * x1) + (x2 * x2) + (x3 * x3))).toFixed(3);
}

// Only for 2D

export function rotateVector(vector, angle) {
    let x = vector[0],
        y = vector[1];
    let x1 = (x * Math.cos(angle)) - (y * Math.sin(angle));
    let y1 = (x * Math.sin(angle)) + (y * Math.cos(angle));
    return [x1, y1];
}

export function getUnitVector(direction) {
    let x = direction.x;
    let y = direction.y;
    let z = direction.z;
    let xI = (x / Math.sqrt(x * x + y * y + z * z));
    let yJ = (y / Math.sqrt(x * x + y * y + z * z));
    let zK = (z / Math.sqrt(x * x + y * y + z * z));
    return [parseFloat(xI), parseFloat(yJ), parseFloat(zK)];
}

export function getTextInclination(slopeVector) {
    let inclination = Math.atan2(slopeVector[1], slopeVector[0]);
    if (inclination < -Math.PI / 2 || inclination > Math.PI / 2)
        inclination += Math.PI;
    return inclination
}

export function getAngles(vertex1, vertex2, vertex3) {
    let x1 = vertex1.x - vertex2.x,
        x2 = vertex3.x - vertex2.x;
    let y1 = vertex1.y - vertex2.y,
        y2 = vertex3.y - vertex2.y;
    return [Math.atan2(y2, x2), Math.atan2(y1, x1)];
}

export function toDegrees(angle) {
    return parseFloat(angle * (180 / Math.PI));
}

export function toRadian(angle) {
    return (angle * (Math.PI / 180));
}

export function getAngleAtVertex(vertexNumber, vertices) {
    let length = vertices.length;
    let prevVertex, nextVertex;
    if (vertexNumber === 0) {
        prevVertex = length - 1;
        nextVertex = 1;
    } else if (vertexNumber === length - 1) {
        prevVertex = length - 2;
        nextVertex = 0;
    } else {
        prevVertex = vertexNumber - 1;
        nextVertex = vertexNumber + 1;
    }
    return this.getAngles(vertices[prevVertex], vertices[vertexNumber], vertices[nextVertex])
}

export function getNormalMidpoint(vertex1, vertex2, distance) {
    let midPoint = getMidpoint(vertex1, vertex2);
    let xDirection = vertex2.x - midPoint.x;
    let yDirection = vertex2.y - midPoint.y;
    let normalDirection = rotateVector([xDirection, yDirection], Math.PI / 2);
    let unitVectorNormal = new THREE.Vector3(normalDirection[0], normalDirection[1], 0);
    unitVectorNormal.normalize();
    let d = distance;
    // noinspection JSValidateTypes
    return new THREE.Vector3(midPoint.x + (unitVectorNormal.x * d), midPoint.y + (unitVectorNormal.y * d), 0);
}

export function getNormalPoints(vertex1, vertex2, distance, direction = DEFAULT_WALKWAY_DIRECTION) {
    if (vertex1.distanceTo(vertex2) === 0) {
        return null;
    }
    if (distance == undefined) {
        distance = 0.5
    }
    const unitDirectionalVector = vertex2
        .clone()
        .add(vertex1.clone().multiplyScalar(-1))
        .clone()
        .normalize();
    const perpendicularVector = new THREE.Vector2(unitDirectionalVector.y, -unitDirectionalVector.x);

    let multiplier = 0;
    if (direction === DEFAULT_WALKWAY_DIRECTION) {
        multiplier = 1;
    } else if (direction === ALTERNATE_WALKWAY_DIRECTION) {
        multiplier = -1;
    }

    const vertex3 = vertex1
        .clone()
        .add(perpendicularVector.clone().multiplyScalar(distance * multiplier));
    const vertex4 = vertex2
        .clone()
        .add(perpendicularVector.clone().multiplyScalar(distance * multiplier));

    return [vertex3, vertex4];
}

export function getNormalPointsWithTiltedParent(
    parentVertices3DArray,
    vertex1,
    vertex2,
    distance,
    direction = DEFAULT_WALKWAY_DIRECTION,
) {
    const vertices3DVectorArray = convertArrayTo3DVector(parentVertices3DArray);
    const vectorA = vertices3DVectorArray[0];
    const vectorB = vertices3DVectorArray[1];
    const vectorC = vertices3DVectorArray[2];

    const vectorBA = new THREE.Vector3();
    const vectorBC = new THREE.Vector3();
    vectorBA.subVectors(vectorB, vectorA);
    vectorBC.subVectors(vectorB, vectorC);
    const planeNormal = new THREE.Vector3();
    planeNormal.crossVectors(vectorBA, vectorBC);
    planeNormal.normalize();

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(planeNormal, new THREE.Vector3(0, 0, 1));

    const newVertex1 = vertex1.clone();
    const newVertex2 = vertex2.clone();

    const newVertices3DVectorArray = [newVertex1, newVertex2];

    for (let vertexIndex = 0; vertexIndex < newVertices3DVectorArray.length; vertexIndex += 1) {
        const vertex = newVertices3DVectorArray[vertexIndex];
        vertex.x -= vectorB.x;
        vertex.y -= vectorB.y;
        vertex.z -= vectorB.z;
        vertex.applyQuaternion(quaternion);
    }

    const newNormalPoints = getNormalPoints(
        newVertices3DVectorArray[0],
        newVertices3DVectorArray[1],
        distance,
        direction,
    );

    const normalPointsVectorArray = [];
    for (let normalVertexIndex = 0; normalVertexIndex < newNormalPoints.length; normalVertexIndex += 1) {
        const normalVertex = newNormalPoints[normalVertexIndex];
        normalPointsVectorArray.push(new THREE.Vector3(normalVertex.x, normalVertex.y, 0));
    }

    const reverseQuaternion = new THREE.Quaternion();
    reverseQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), planeNormal);

    for (let vertexIndex = 0; vertexIndex < normalPointsVectorArray.length; vertexIndex += 1) {
        const vertex = normalPointsVectorArray[vertexIndex];
        vertex.applyQuaternion(reverseQuaternion);
        vertex.x += vectorB.x;
        vertex.y += vectorB.y;
        vertex.z += vectorB.z;
    }

    return normalPointsVectorArray;
}

export function getCentroidOfObjects(objects) {
    let count = 0;
    let cumulativeX = 0;
    let cumulativeY = 0;
    let cumulativeZ = 0;
    for (let i = 0, len = objects.length; i < len; i += 1) {
        if (!(objects[i] instanceof OutlinePoints ||
            objects[i] instanceof EdgeCentrePoints ||
            objects[i] instanceof RotationPoint ||
            objects[i] instanceof InnerEdge ||
            objects[i] instanceof OuterEdge)) {
            const position = objects[i].getPosition();
            if (!sanityCheckVector3(position)) {
                continue;
            }
            cumulativeX += position.x;
            cumulativeY += position.y;
            cumulativeZ += position.z;
            count += 1;
        }
    }
    // noinspection JSValidateTypes
    return new THREE.Vector3(cumulativeX / count, cumulativeY / count, cumulativeZ / count);
}

export function getNormalizedCameraCoordinates(deviceX, deviceY, stage) {
    let normalizedCoords = new THREE.Vector3();
    normalizedCoords.x = ((deviceX - stage.screenDimensions.left) / stage.screenDimensions.width) * 2 - 1;
    normalizedCoords.y = -((deviceY - stage.screenDimensions.top) / stage.screenDimensions.height) * 2 + 1;
    // normalizedCoords.z = 0;

    normalizedCoords.unproject(stage.cameraManager.camera);

    return normalizedCoords;
}

export function drawingArrayToVectorArray(vertices, numVertices) {
    return convertArrayToVector(drawingArrayTo2DArray(vertices, numVertices));
}

export function drawingArrayTo2DArray(vertices, numVertices) {
    const newVertices = [];
    let count = 0;
    for (let i = 0; i <= numVertices; i += 1) {
        newVertices.push([
            vertices[count],
            vertices[count + 1],
        ]);
        count += 3;
    }
    return newVertices;
}

export function getCentroidOfPoints(points) {
    if (points.length === 0) {
        return null;
    }
    let formattedPoints = points;
    if (!(points[0] instanceof THREE.Vector2 || points[0] instanceof THREE.Vector3)) {
        formattedPoints = convertArrayToVector(points);
    }
    const count = formattedPoints.length;
    const centroid = (formattedPoints[0] instanceof THREE.Vector3) ?
        new THREE.Vector3() : new THREE.Vector2();
    for (let i = 0; i < formattedPoints.length; i += 1) {
        centroid.add(formattedPoints[i]);
    }
    centroid.divideScalar(count);
    return centroid;
}

// Equation is in the form ax + by + cz + d = 0
export function getPlaneDistanceToOrigin(plane) {
    return (plane[3]) / (Math.sqrt((plane[0] ** 2) + (plane[1] ** 2) + (plane[2] ** 2)));
}

// Equation is in the form ax + by + cz + d = 0
export function getEquationOfPlane(normal, point) {
    const eq = [];
    eq[0] = normal.x;
    eq[1] = normal.y;
    eq[2] = normal.z;
    eq[3] = (normal.x * (-point.x)) + (normal.y * (-point.y)) + (normal.z * (-point.z));
    return eq;
}

export const deg2Rad = (deg) => deg * (Math.PI / 180);
export const rad2Deg = (rad) => rad * (180 / Math.PI);

export const removeEmptySRT = (stage) => {
    for (let key in stage.objects) {
        let currentObject = stage.objects[key];
        if (currentObject instanceof Subarray && !(currentObject instanceof Gazebo)) {
            if (currentObject.getNumberOfPanels() === 0) {
                currentObject.removeObject();
            } else {
                for (let row of currentObject.getChildren()) {
                    if (row.getNumberOfPanelsIncludingHidden() === 0) {
                        row.removeObject();
                    }
                }
                let panelvert = currentObject.children[0].children[0].children[0].get2DVertices();
                if (panelvert[0][0] == 0 && panelvert[0][1] == 0 && panelvert[1][0] == 0 && panelvert[1][1] == 0) {
                    currentObject.removeObject();
                }
            }
        }
    }
}

export function containsAll(object, items) {
    for (let i = 0; i < items.length; i += 1) {
        if (!object.hasOwnProperty(items[i])) {
            return false;
        }
    }
    return true;
}

export function getProperty(object, propertiesString) {
    if (object === null && object === undefined) {
        return null;
    }
    const properties = propertiesString.split('.');
    let currentObject = object;
    for (let i = 0; i < properties.length; i += 1) {
        if (currentObject[properties[i]] !== undefined && currentObject[properties[i]] !== null) {
            currentObject = currentObject[properties[i]];
        } else {
            return null;
        }
    }
    return currentObject;
}

export function rotationAroundPoint(axisPointX, axisPointY, pointX, pointY, angleRad) {
    pointX = pointX - axisPointX;
    pointY = pointY - axisPointY;

    let newX = pointX * Math.cos(angleRad) - pointY * Math.sin(angleRad);
    let newY = pointX * Math.sin(angleRad) + pointY * Math.cos(angleRad);

    pointX = newX + axisPointX;
    pointY = newY + axisPointY;

    return [pointX, pointY];
}

/**
 * Returns the azimuth in degrees of a given vector
 * @param {vector a THREE.Vector3 object} vector 
 */
export function vectorToAzimuth(vector) {
    let theta = rad2Deg(Math.atan(vector.y / vector.x));
    if (theta < 90) {
        theta = 180 - theta;
    }
    return theta;
}

export function getSecondPoints(point1, point2, azimuth) {
    azimuth = azimuth * (Math.PI / 180);
    let m1 = -Math.tan(azimuth);
    let m2 = -1 / m1;
    let c1 = point1.y - m1 * point1.x;
    let c2 = point2.y - m2 * point2.x;

    let p1 = new THREE.Vector2(-Infinity, Infinity);
    p1.x = (c2 - c1) / (m1 - m2);
    p1.y = (m1 * c2 - m2 * c1) / (m1 - m2);

    c1 = point2.y - m1 * point2.x;
    c2 = point1.y - m2 * point1.x;

    let p2 = new THREE.Vector2(-Infinity, Infinity);
    p2.x = (c2 - c1) / (m1 - m2);
    p2.y = (m1 * c2 - m2 * c1) / (m1 - m2);

    return [p1, p2];
}

// ExpiryPopUp
export function handleLoader(val) {
    if (val) {
        document.getElementById('ps-loading-container').style.display = "flex";
        document.getElementById('ps-loading-background').style.display = "flex";
    } else {
        document.getElementById('ps-loading-container').style.display = "none";
        document.getElementById('ps-loading-background').style.display = "none";
    }
}

// ExpiryPopUp
export let expiryPopupDisplay = {
    message: false,
    isPricingPage: false,
    isFirstLoad: true,
    isStudioPage: false,
    isPopup: true,
    isPlansLoaded: false,
    isPlanExpired: false,
};
export const monthNumbers = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
};
export function checkEmailValidation(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
export function checkEmailValidation2(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
}
export function checkMobileNumberValidation(mobile) {
    const re = /^\d{10}$/;
    return re.test(mobile);
}
export function checkTwoDecimalPointValidation(decimal) {
    const re = /^(\d+(\.\d{0,2})?|\.?\d{1,2})$/;
    return re.test(decimal);
}

/*

Algorithm taken from http://geomalgorithms.com/a05-_intersect-1.html. See the
section 'Intersection of 2 Planes' and specifically the subsection
(A) Direct Linear Equation

*/
export function intersectPlanes(p1, p2) {

    // the cross product gives us the direction of the line at the intersection
    // of the two planes, and gives us an easy way to check if the two planes
    // are parallel - the cross product will have zero magnitude
    var direction = new THREE.Vector3().crossVectors(p1.normal, p2.normal)
    var magnitude = direction.distanceTo(new THREE.Vector3(0, 0, 0))
    if (magnitude === 0) {
        return null
    }

    // now find a point on the intersection. We use the 'Direct Linear Equation'
    // method described in the linked page, and we choose which coordinate
    // to set as zero by seeing which has the largest absolute value in the
    // directional vector

    var X = Math.abs(direction.x)
    var Y = Math.abs(direction.y)
    var Z = Math.abs(direction.z)

    var point

    if (Z >= X && Z >= Y) {
        point = solveIntersectingPoint('z', 'x', 'y', p1, p2)
    } else if (Y >= Z && Y >= X) {
        point = solveIntersectingPoint('y', 'z', 'x', p1, p2)
    } else {
        point = solveIntersectingPoint('x', 'y', 'z', p1, p2)
    }

    return [point, direction]
}


/*
  
This method helps finding a point on the intersection between two planes.
Depending on the orientation of the planes, the problem could solve for the
zero point on either the x, y or z axis
  
*/
function solveIntersectingPoint(zeroCoord, A, B, p1, p2) {
    var a1 = p1.normal[A]
    var b1 = p1.normal[B]
    var d1 = p1.constant

    var a2 = p2.normal[A]
    var b2 = p2.normal[B]
    var d2 = p2.constant

    var A0 = ((b2 * d1) - (b1 * d2)) / ((a1 * b2 - a2 * b1))
    var B0 = ((a1 * d2) - (a2 * d1)) / ((a1 * b2 - a2 * b1))

    var point = new THREE.Vector3()
    point[zeroCoord] = 0
    point[A] = A0
    point[B] = B0

    return point
}

export function findClosestPoint(points, x, y, length) {
    const point = new THREE.Vector2(x, y);
    let minDistance = 10000000;
    let closest
    for (let i = 0; i < length; i += 1) {
        const checkPoint = new THREE.Vector2(points[i].position.x, points[i].position.y);
        const distance = point.distanceTo(checkPoint);
        if (distance < minDistance) {
            closest = points[i];
            minDistance = distance
        }
    }
    return closest
}

/**
 * If the slope of the line between point1 and point2 is the same as the slope of the line between
 * point1 and point3, then the points are collinear
 * @param point1 - The first point of the line segment.
 * @param point2 - The point that is being tested to see if it is collinear with the other two points.
 * @param point3 - The point that is being tested to see if it is collinear with the other two points.
 * @returns a boolean value.
 */
export function checkCollinear(point1, point2, point3, EPSILON = 0.1) {
    if (point1 && point2 && point3) {
        return (Math.abs(((point3.y - point2.y) * (point3.x - point1.x)) - ((point3.y - point1.y) * (point3.x - point2.x))) <= EPSILON);
    }
}

// The points must be in order
export function checkCollinear3D(start, point, end) {
    const EPSILON = 0.00001;
    const distA = Math.abs(start.distanceTo(point));
    const distB = Math.abs(point.distanceTo(end));
    const distSum = Math.abs(start.distanceTo(end));
    return EPSILON > Math.abs(distSum - (distA + distB));
}

export function checkPointOnEdgesApprx3D(vertices, point) {
    const verticesInVectors = [...vertices];
    const nVertices = verticesInVectors.length;
    verticesInVectors.push(verticesInVectors[0]);
    for (let i = 0; i < nVertices; i++) {
        if (checkCollinear3D(
            verticesInVectors[i],
            point,
            verticesInVectors[i + 1],
        )) return true;
    }
    return false;
}

export function workAroundintersectSide(sidecords, line) {
    const EPSILON = 0.000001;
    const sideLine = {
        start: {
            x: sidecords[0][0],
            y: sidecords[0][1],
        },
        end: {
            x: sidecords[1][0],
            y: sidecords[1][1],
        }
    }

    const a = [{
        x: Math.min(line.start.x, line.end.x),
        y: Math.min(line.start.y, line.end.y),
    },
    {
        x: Math.max(line.start.x, line.end.x),
        y: Math.max(line.start.y, line.end.y),
    },
    ];
    const b = [{
        x: Math.min(sidecords[0][0], sidecords[1][0]),
        y: Math.min(sidecords[0][1], sidecords[1][1]),
    },
    {
        x: Math.max(sidecords[0][0], sidecords[1][0]),
        y: Math.max(sidecords[0][1], sidecords[1][1]),
    },
    ]

    const crossProduct = (p1, p2) => ((p1.x * p2.y) - (p2.x * p1.y));
    const isPointOnLine = (line, p) => {
        const tmp = [
            { x: 0, y: 0 },
            {
                x: line.end.x - line.start.x,
                y: line.end.y - line.start.y,
            }
        ];
        const pTmp = {
            x: p.x - line.start.x,
            y: p.y - line.start.y,
        };
        const r = crossProduct(tmp[1], pTmp);
        return (Math.abs(r) < EPSILON);
    };
    const isPointRightOfLine = (line, p) => {
        const tmp = [
            { x: 0, y: 0 },
            {
                x: line.end.x - line.start.x,
                y: line.end.y - line.start.y,
            }
        ];

        const pTmp = {
            x: p.x - line.start.x,
            y: p.y - line.start.y,
        };
        return (crossProduct(tmp[1], pTmp) < 0);
    };
    const lineSegmentTouchesOrCrossesLine = (linea, lineb) => (
        isPointOnLine(linea, lineb.start) ||
        isPointOnLine(linea, lineb.end) ||
        (isPointRightOfLine(linea, lineb.start) ^ isPointRightOfLine(linea, lineb.end))
    );

    const boundingBoxIntersect = a[0].x <= b[1].x &&
        a[1].x >= b[0].x &&
        a[0].y <= b[1].y &&
        a[1].y >= b[0].y;

    return (
        boundingBoxIntersect &&
        lineSegmentTouchesOrCrossesLine(line, sideLine) &&
        lineSegmentTouchesOrCrossesLine(sideLine, line)
    );
}

export function getNudgeVector(direction, planeNormal) {
    const EPSILON = 0.000001;
    const perpendicularDirection = direction.applyAxisAngle(planeNormal, Math.PI / 2);
    perpendicularDirection.setLength(EPSILON);
    return perpendicularDirection;
}

export function getLineCuts(start, end, intersections) {
    const sortedIntersections = intersections.sort((a, b) => {
        const SquaredDistance1 = start.distanceToSquared(a);
        const SquaredDistance2 = start.distanceToSquared(b);
        return SquaredDistance1 - SquaredDistance2;
    });
    let previousPoint = start;
    const cuts = [];
    sortedIntersections.forEach((point) => {
        // TODO: This check is for initial pruning
        // test and remove later for more accurate results.
        if (!previousPoint.isInside || !point.isInside) {
            const midPoint = new THREE.Vector3(
                (point.x + previousPoint.x) / 2,
                (point.y + previousPoint.y) / 2,
                (point.z + previousPoint.z) / 2,
            );
            const cutPoint = {
                start: previousPoint,
                end: point,
                mid: midPoint,
            };
            cuts.push(cutPoint);
        }
        previousPoint = point;
    });

    // TODO: This check is for initial pruning
    // test and remove later for more accurate results.
    if (!previousPoint.isInside || !end.isInside) {
        const midPoint = new THREE.Vector3(
            (end.x + previousPoint.x) / 2,
            (end.y + previousPoint.y) / 2,
            (end.z + previousPoint.z) / 2,
        );
        const cutPoint = {
            start: previousPoint,
            end: end,
            mid: midPoint,
        };
        cuts.push(cutPoint);
    }
    return cuts;
}

export function connectInOrder(startVector, endVector, intersections, graph) {
    // Init
    const start = new JSTS.geom.Coordinate(
        startVector.x,
        startVector.y,
        startVector.z,
    );
    const end = new JSTS.geom.Coordinate(
        endVector.x,
        endVector.y,
        endVector.z,
    );

    // Check
    for (let i = 0, n = intersections.length; i < n; i++) {
        const point = intersections[i];
        const sum = start.distance(point) + end.distance(point);
        const tolerance = 0.00001;
        if (Math.abs(sum - start.distance(end) > tolerance)) {
            console.error("Not collinear");
            return null;
        }
    };

    // Sort
    const sortedIntersections = intersections.sort((a, b) => {
        const EuclideanDistance1 = start.distance(a);
        const EuclideanDistance2 = start.distance(b);
        return EuclideanDistance1 - EuclideanDistance2;
    });

    // Adding edges
    let previousPoint = null;
    sortedIntersections.forEach((point) => {
        if (previousPoint) {
            graph.setEdge(
                previousPoint,
                point,
            );
        }
        previousPoint = point;
    });
}

export function combineTillDisjoint(jstsGeomList, inPlace = false) {
    // Intersects but not touch
    let isIntersecting = true;
    const newGeomList = inPlace ? jstsGeomList : [...jstsGeomList];
    while (isIntersecting) {
        isIntersecting = false;
        for (let i = 0; i < newGeomList.length; i++) {
            for (let j = i + 1; j < newGeomList.length; j++) {
                isIntersecting = newGeomList[i].intersects(newGeomList[j]);
                // isIntersecting = !newGeomList[i].touches(newGeomList[j]) && isIntersecting;
                isIntersecting = !(!isIntersecting || newGeomList[i].touches(newGeomList[j]));

                if (isIntersecting) {
                    newGeomList.splice(
                        i, 1,
                        newGeomList[i].union(newGeomList[j]),
                    );
                    newGeomList.splice(j, 1);
                    break;
                }
            }
            // To avoid index errors
            if (isIntersecting) break;
        }
    }
    if (!inPlace) {
        return newGeomList;
    }
}

export function unionCSGPolygons(polygonsArray) {
    const geometryFactory = new JSTS.geom.GeometryFactory();
    const geometries = [];
    polygonsArray.forEach(polygon => {
        const coordinates = polygon.vertices.map(vertex => new JSTS.geom.Coordinate(
            vertex.pos.x,
            vertex.pos.y,
            vertex.pos.z,
        ));
        coordinates.push(coordinates[0]);
        geometries.push(geometryFactory.createPolygon(coordinates));
    });
    const geometryCollection = new JSTS.geom.GeometryCollection(geometries, geometryFactory);
    return geometryCollection.union();
}

export function getDisjointPaths(pairs) {
    // TODO: Change 'for...of' loops because performance.

    const handleExistingPoint = (check) => {
        for (const point of points) {
            if (check.equals(point.point)) return point;
        };
        points.push({
            point: check,
            connectedTo: [],
            visited: false,
        });
        return points[points.length - 1];
    }

    const findPath = (point) => {
        if (point.length > 1) {
            console.error('Point of order greater than 1 in findPath');
        }
        const path = [point.point];
        let previousPoint = point;
        // return the point for order 0
        if (previousPoint.connectedlength === 0) {
            return path;
        }
        let currentPoint = point.connectedTo[0];
        currentPoint.visited = true;
        let order = currentPoint.connectedTo.length;
        while (order > 1) {
            path.push(currentPoint.point);
            if (currentPoint.connectedTo[0] === previousPoint) {
                const nextPoint = currentPoint.connectedTo[1];
                previousPoint = currentPoint;
                currentPoint = nextPoint;
            }
            else if (currentPoint.connectedTo[1] === previousPoint) {
                const nextPoint = currentPoint.connectedTo[0];
                previousPoint = currentPoint;
                currentPoint = nextPoint;
            }
            else {
                console.error('Connected point is not found somehow.');
            }
            currentPoint.visited = true;
            order = currentPoint.connectedTo.length;
        }
        return path;
    }

    // Initializing points
    const points = [];
    if (pairs.length === 0) {
        console.error('Array of lines (pairs) is empty');
    }
    pairs.forEach((pair) => {
        const point0 = handleExistingPoint(pair[0]);
        const point1 = handleExistingPoint(pair[1]);
        if (!(point1 in point0.connectedTo)) {
            point0.connectedTo.push(point1);
        }
        if (!(point0 in point1.connectedTo)) {
            point1.connectedTo.push(point0);
        }
    });

    // Check
    for (const point of points) {
        if (point.connectedTo.length > 2) {
            console.error('Point of order greater than 2', point);
        }
    }

    // Grouping
    const groups = {
        disjointSets: [],
        total: 0,
    };

    for (const point of points) {
        //Only check for order 1 or 0
        if (point.connectedTo.length < 2 && !(point.visited)) {
            const path = findPath(point);
            groups.total += path.length;
            groups.disjointSets.push(path);
        }
    }

    if (groups.total !== points.length) {
        console.error('Produced groups are wrong',
            'points:', points,
            'groups:', groups,
        );
    }

    return groups.disjointSets;
}

export function rotateVector3AroundX(vector3, center, angle) {
    const rotatedVector = new THREE.Vector3();
    rotatedVector.x = vector3.x;
    rotatedVector.y = ((vector3.y - center.y) * Math.cos(deg2Rad(angle))) - ((vector3.z - center.z) * Math.sin(deg2Rad(angle))) + center.y;
    rotatedVector.z = ((vector3.y - center.y) * Math.sin(deg2Rad(angle))) + ((vector3.z - center.z) * Math.cos(deg2Rad(angle))) + center.z;
    return rotatedVector;
}

export function rotateVector3AroundZ(vector3, center, angle) {
    const rotatedVector = new THREE.Vector3();
    rotatedVector.z = vector3.z;
    rotatedVector.x = ((vector3.x - center.x) * Math.cos(deg2Rad(angle))) - ((vector3.y - center.y) * Math.sin(deg2Rad(angle))) + center.x;
    rotatedVector.y = ((vector3.x - center.x) * Math.sin(deg2Rad(angle))) + ((vector3.y - center.y) * Math.cos(deg2Rad(angle))) + center.y;
    return rotatedVector;
}

export function rotateVector3AroundY(vector3, center, angle) {
    const rotatedVector = new THREE.Vector3();
    rotatedVector.x = ((vector3.x + center.x) * Math.cos(deg2Rad(angle))) + ((vector3.z + center.z) * Math.sin(deg2Rad(angle))) + center.x;
    rotatedVector.y = vector3.y;
    rotatedVector.z = - ((vector3.x + center.x) * Math.sin(deg2Rad(angle))) + ((vector3.z + center.z) * Math.cos(deg2Rad(angle))) + center.z;
    return rotatedVector;
}

export function getMaxZ(vertices) {
    let max = 0;
    for (let i = 0; i < vertices.length; i++) {
        if (max < vertices[i][2]) {
            max = vertices[i][2];
        }
    }
    return max;
}

export function isArrayInArray(arr, item) {
    let item_as_string = JSON.stringify(item);

    let contains = arr.some(function (ele) {
        return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}

// export function getColor(z, zMin, zMax) {

//     // normalize v in the range of vMin and vMax
//     function normalize(v, vMin, vMax) {
//         return ((v - vMin) / (vMax - vMin));
//     }

//     // clamp a value between min and max inclusive
//     function clamp(value, min, max) {
//         if (value >= max) return max;
//         if (value <= min) return min;
//         return value;
//     }

//     // calculates the linear interpolation of two numbers
//     function lerp(a, b, alpha) {
//         return a + (b - a) * clamp(alpha, 0, 1);
//     }

//     const zNorm = normalize(z, zMin, zMax);

//     // gradient definition. Each element defines a breakpoint within the normalized z-range (0 - 1) and color
//     // important: has to be sorted ascendingly by bp
//     const gradient = [
//         {bp: 0,   r: 0, g: 1, b: 0},
//         {bp: 1/3, r: 0, g: 0, b: 1},
//         {bp: 2/3, r: 1, g: 1, b: 0},
//         {bp: 1,   r: 1, g: 0, b: 0}
//     ];

//     let red, green, blue;

//     // find the color segment (between breakpoints), interpolate the color between breakpoints
//     for(let i = 0, g = gradient.length; i < g; i++) {
//         if(zNorm < gradient[i].bp || gradient[i].bp === 1) { 
//             red = lerp(gradient[i-1].r, gradient[i].r, normalize(zNorm, gradient[i-1].bp, gradient[i].bp));
//             green = lerp(gradient[i-1].g, gradient[i].g, normalize(zNorm, gradient[i-1].bp, gradient[i].bp));
//             blue = lerp(gradient[i-1].b, gradient[i].b, normalize(zNorm, gradient[i-1].bp, gradient[i].bp));
//             break;
//         }
//     }

//     return {r: red, g: green, b: blue};
// }
export function getIntersectionWithOtherModels(model, allModelConvexLines = []) {
    const intersectingModels = [];
    model.intersectingEdges = [];
    const smartRoofs = [];
    model.children.forEach((child) => {
        child.convexHullCoordinates = [];
        child.convexHullCoordinates2D = [];
        child.mergePoints = [];
        child.intersectingEdges = [];
    });

    const objectsInQuadrant = model.stage.quadTreeManager.getObjectsInQuadrant(getBoundingBox(model.get2DVertices()));

    const roofsInQuadrant = {
        smartroofs: [],
        dormers: [],
    };
    objectsInQuadrant.forEach((object) => {
        if (object instanceof SmartroofFace && !roofsInQuadrant.smartroofs.includes(object.parent)) {
            roofsInQuadrant.smartroofs.push(object.parent);
        }
        else if (object instanceof Dormer && !roofsInQuadrant.dormers.includes(object.parent)) {
            roofsInQuadrant.dormers.push(object.parent);
        }
    });

    const allRoofs = [];
    for (let smodel of roofsInQuadrant.smartroofs) {
        if (smodel !== model) smartRoofs.push(smodel);
        allRoofs.push(smodel);
    }
    for (let dormer of roofsInQuadrant.dormers) {
        if (dormer !== model) smartRoofs.push(dormer);
        allRoofs.push(dormer);
    }

    const checkPointInAllModels = (point, roofID) => {
        const EPSILON = 0.00001;
        // Workaround for points on surface
        const slightlyElevatedPoint = new THREE.Vector3(
            point.x,
            point.y,
            point.z + EPSILON,
        );
        for (let i = 0; i < allRoofs.length; i++) {
            const roof = allRoofs[i];
            if (roofID !== roof.uuid) {
                if (checkPointInsideMesh(slightlyElevatedPoint, roof.coreMesh)) {
                    return true;
                }
            }
        }
        return false;
    };

    const checkPointInAllModelsButNotOnEdge = (point, roofID) => {
        const EPSILON = 0.00001;
        // Workaround for points on surface
        const slightlyElevatedPoint = new THREE.Vector3(
            point.x,
            point.y,
            point.z + EPSILON,
        );
        for (let i = 0; i < allRoofs.length; i++) {
            const roof = allRoofs[i];
            if (roofID !== roof.uuid) {
                if (checkPointInsideMesh(slightlyElevatedPoint, roof.coreMesh) && !checkPointOnEdgesApprx(roof.get2DVertices(), [point.x, point.y])) {
                    return true;
                }
            }
        }
        return false;
    };

    const checkPointOnModelEdges = (point, roofID) => {
        for (let i = 0; i < allRoofs.length; i++) {
            const roof = allRoofs[i];
            if (roofID !== roof.uuid) {
                if (checkPointOnEdgesApprx(roof.get2DVertices(), [point.x, point.y])) {
                    return true;
                }
            }
        }
        return false;
    }

    const cutList = [];
    let isIntersecting = false;

    {
        const currentRoofID = model.uuid;
        for (let i = 0; i < model.children.length; i++) {
            const face = model.children[i];
            if (face.isDeleted) continue;
            const faceID = face.uuid;
            const facePoints = face.get3DVertices();
            facePoints.push(facePoints[0]);

            for (let j = 0; j < facePoints.length - 1; j++) {
                // We do two raycasters cuz Jugaad.
                // in three.js, when raycaster passes through the edge of the mesh exactly,
                // it doesn't leave an intersection.
                const start = new THREE.Vector3(...facePoints[j]);
                const start2 = new THREE.Vector3(
                    start.x,
                    start.y,
                    start.z + 0.00001,
                );
                const end = new THREE.Vector3(...facePoints[j + 1]);
                const lineIntersections = [];
                const direction = new THREE.Vector3().subVectors(end, start);
                const far = direction.length();
                direction.normalize();
                const raycaster = new THREE.Raycaster(start, direction, 0, far);
                const raycaster2 = new THREE.Raycaster(start2, direction, 0, far);

                // Face-domain interaction.
                for (let k = 0; k < smartRoofs.length; k++) {
                    const otherRoof = smartRoofs[k];
                    let isRoofIntersecting = false;
                    for (let l = 0; l < otherRoof.children.length; l++) {
                        const otherFace = otherRoof.children[l];
                        if (otherFace.isDeleted || !otherFace.faceMesh) continue;
                        const otherFaceMesh = otherFace.faceMesh;
                        const intersects = [];
                        otherFaceMesh.raycast(raycaster, intersects);
                        const intersects2 = [];
                        otherFaceMesh.raycast(raycaster2, intersects2);

                        intersects.forEach((intersection) => {
                            lineIntersections.push(intersection.point);
                            model.children[i]
                                .addMergePoint(new JSTS.geom.Coordinate(
                                    intersection.point.x,
                                    intersection.point.y,
                                    intersection.point.z,
                                ),
                                    otherFace.uuid,
                                );

                            // DEBUG
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices = [intersection.point];
                            // model.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color: (0x00ff00 + (0x0000f0 * l)), size: 10, sizeAttenuation: false }),
                            // ));
                            isIntersecting = true;
                            isRoofIntersecting = true;
                        });
                        intersects2.forEach((intersection) => {
                            lineIntersections.push(intersection.point);
                            model.children[i]
                                .addMergePoint(new JSTS.geom.Coordinate(
                                    intersection.point.x,
                                    intersection.point.y,
                                    intersection.point.z,
                                ),
                                    otherFace.uuid,
                                );

                            // DEBUG
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices = [intersection.point];
                            // model.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color: (0x00ff00 + (0x0000f0 * l)), size: 10, sizeAttenuation: false }),
                            // ));
                            isIntersecting = true;
                            isRoofIntersecting = true;
                        });

                        if (checkPointInsideMesh(
                            start,
                            otherFaceMesh,
                            true,
                        )) {
                            model.children[i]
                                .addMergePoint(new JSTS.geom.Coordinate(
                                    start.x,
                                    start.y,
                                    start.z,
                                ),
                                    otherFace.uuid,
                                );

                            // DEBUG
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices = [start];
                            // model.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color: (0xff0000), size: 10, sizeAttenuation: false }),
                            // ));
                        }
                        if (checkPointInsideMesh(
                            end,
                            otherFaceMesh,
                            true,
                        )) {
                            model.children[i]
                                .addMergePoint(new JSTS.geom.Coordinate(
                                    end.x,
                                    end.y,
                                    end.z,
                                ),
                                    otherFace.uuid,
                                );

                            // DEBUG
                            // const dotGeometry = createBufferGeometry();
                            // dotGeometry.vertices = [end];
                            // model.intersectionLinesGroup.add(new THREE.Points(
                            //     dotGeometry,
                            //     new THREE.PointsMaterial({ color: (0xff0000), size: 10, sizeAttenuation: false }),
                            // ));
                        }
                    }
                    if (isRoofIntersecting && !intersectingModels.includes(otherRoof)) {
                        intersectingModels.push(otherRoof);
                    }
                    if (isRoofIntersecting && !otherRoof.intersectingModels.includes(model)) {
                        otherRoof.intersectingModels.push(model);
                    }
                }
                const cuts = getLineCuts(start, end, lineIntersections);
                cutList.push({
                    roofID: currentRoofID,
                    cuts,
                    faceID,
                });
            }
        }
    }
    for (let z = 0; z < smartRoofs.length; z++) {
        const otherRoof = smartRoofs[z];
        let isRoofIntersecting = false;

        for (let i = 0; i < otherRoof.children.length; i++) {
            const face = otherRoof.children[i];
            if (face.isDeleted) continue;
            const facePoints = face.get3DVertices();
            const vertices = face.get3DVertices();
            facePoints.push(facePoints[0]);

            for (let j = 0; j < facePoints.length - 1; j++) {
                const start = new THREE.Vector3(...facePoints[j]);
                const end = new THREE.Vector3(...facePoints[j + 1]);
                const line = new THREE.Line3(start, end);
                // Face interaction.
                for (let k = 0; k < model.children.length; k++) {
                    const currentFace = model.children[k];
                    if (currentFace.isDeleted) continue;
                    const currentFacePlane = currentFace.plane;
                    const planecords = currentFace.get2DVertices();
                    const planecords3D = currentFace.get3DVertices().map(point => new THREE.Vector3(...point));
                    const result = new THREE.Vector3();
                    currentFacePlane.intersectLine(line, result);
                    const intersects = currentFacePlane.intersectsLine(line, result);
                    const resultPoint = [result.x, result.y, result.z];
                    // const onSurface = Math.abs(result.z - currentFace.getZOnTopSurface(result.x, result.y)) < 0.00001;
                    const projectedPoint = new THREE.Vector3();
                    currentFace.plane.projectPoint(result, projectedPoint);
                    const onSurface = Math.abs(projectedPoint.z - result.z) < 0.00001;


                    if (intersects &&
                        (
                            checkPointInsideVertices(planecords, resultPoint) ||
                            checkPointOnEdgesApprx3D(planecords3D, result)) &&
                        onSurface
                    ) {
                        currentFace
                            .addMergePoint(new JSTS.geom.Coordinate(
                                result.x,
                                result.y,
                                result.z,
                            ),
                                otherRoof.children[i].uuid,
                            );
                        isIntersecting = true;
                        isRoofIntersecting = true;
                    }
                }
            }

            // TODO: Integrate this into the previous loop.
            for (let j = 0; j < vertices.length; j++) {
                const vertex = vertices[j];
                const start = new THREE.Vector3(...vertex);
                // I don't want the point on the ground
                const end = new THREE.Vector3(
                    start.x,
                    start.y,
                    0.00001,
                );
                const direction = new THREE.Vector3().subVectors(end, start);
                const far = direction.length();
                direction.normalize();
                const raycaster = new THREE.Raycaster(start, direction, 0, far);

                for (let k = 0; k < model.children.length; k++) {
                    const currentFace = model.children[k];
                    if (currentFace.isDeleted || !currentFace.faceMesh) continue;
                    const currentFaceMesh = currentFace.faceMesh;
                    const intersects = [];
                    currentFaceMesh.raycast(raycaster, intersects);
                    intersects.forEach((intersection) => {
                        if (intersection.point.z === 0) {
                            console.warn('Point at z=0: ', intersection.point);
                            const { x, y } = intersection.point;
                            intersection.point.z = currentFace.getZOnTopSurface(x, y);
                        }
                        currentFace
                            .addMergePoint(new JSTS.geom.Coordinate(
                                intersection.point.x,
                                intersection.point.y,
                                intersection.point.z,
                            ),
                                otherRoof.children[i].uuid,
                            );

                        // DEBUG
                        // const dotGeometry = createBufferGeometry();
                        // dotGeometry.vertices = [intersection.point];
                        // model.intersectionLinesGroup.add(new THREE.Points(
                        //     dotGeometry,
                        //     new THREE.PointsMaterial({ color: (0x000000), size: 10, sizeAttenuation: false }),
                        // ));
                        isIntersecting = true;
                        isRoofIntersecting = true;
                    });
                }
            }
        }
        if (isRoofIntersecting && !intersectingModels.includes(otherRoof)) {
            intersectingModels.push(otherRoof);
        }
        if (isRoofIntersecting && !otherRoof.intersectingModels.includes(model)) {
            otherRoof.intersectingModels.push(model);
        }
    }

    {
        const drawableCuts = [];
        const points = [];
        cutList.forEach(({ roofID, cuts, faceID }) => {
            cuts.forEach((cut) => {
                if (!checkPointInAllModelsButNotOnEdge(cut.mid, roofID)) {
                    drawableCuts.push(cut);
                    points.push(
                        cut.start,
                        cut.end,
                    );
                    if (Math.abs(cut.start.x.toFixed(4)) !== Math.abs(cut.end.x.toFixed(4)) || Math.abs(cut.start.y.toFixed(4)) !== Math.abs(cut.end.y.toFixed(4))) {
                        model.stage.getObject(faceID).intersectingEdges.push([cut.start, cut.end]);
                        model.stage.getObject(roofID).coreEdges.add(new THREE.LineSegments(
                            new THREE.BufferGeometry().setFromPoints([
                                cut.start,
                                cut.end,
                            ]),
                            model.mergeEdgeMaterial2D,
                        ));
                    }
                }
            });
        });
    }

    if (isIntersecting) {
        for (let i = 0; i < model.children.length; i++) {
            // It would be better to do everything inside the class,
            // since we're dealing with its own property,
            // but this works for now, need to be changed later.

            const { mergePoints, plane } = model.children[i];
            const hullGeomList = [];

            Object.values(mergePoints).forEach((convexHull) => {
                const hullGeom = new JSTS.geom.GeometryFactory()
                    .createMultiPointFromCoords(convexHull)
                    .convexHull();
                const coordinates = hullGeom.getCoordinates();

                if (coordinates.length > 3) {
                    hullGeomList.push(hullGeom);
                }
                model.children[i].convexHullCoordinates.push(coordinates);
            });

            const multiGeom = combineTillDisjoint(hullGeomList);
            // Debug
            // const dotGroup = model.children[i].convexHullCoordinates;

            multiGeom.forEach((jstsGeom) => {
                const dotLocations = jstsGeom.getCoordinates();

                const dotLocationsWithoutDupes = [];

                let skipFlag = false;
                for (let i = 0, n = dotLocations.length; i < (n - 1); i++) {
                    const current = dotLocations[i];
                    const next = dotLocations[i + 1];
                    if (skipFlag) {
                        skipFlag = false;
                    }
                    else if (
                        (current.x.toFixed(4) - next.x.toFixed(4) === 0) &&
                        (current.y.toFixed(4) - next.y.toFixed(4) === 0)
                    ) {
                        dotLocationsWithoutDupes.push(new THREE.Vector3(
                            current.x,
                            current.y,
                            Math.max(current.z, next.z),
                        ));
                        skipFlag = true;
                    }
                    else {
                        dotLocationsWithoutDupes.push(current);
                    }
                }
                if (!skipFlag) {
                    dotLocationsWithoutDupes.push(dotLocations[dotLocations.length - 1]);
                }

                if (dotLocationsWithoutDupes.length > 3) {
                    // model.intersectingEdges.push(dotLocations.slice(0, -1));
                    const lineSegments = [];
                    let previousPoint;
                    dotLocationsWithoutDupes.forEach((dotLocation) => {
                        if (!dotLocation.z) {
                            dotLocation.z = model.children[i]
                                .getZOnTopSurface(dotLocation.x, dotLocation.y);
                        }

                        const currentPoint = new THREE.Vector3(
                            dotLocation.x,
                            dotLocation.y,
                            dotLocation.z,
                        );

                        const verticalpoints = [
                            currentPoint,
                            new THREE.Vector3(
                                dotLocation.x,
                                dotLocation.y,
                            ),
                        ];
                        const vertGeometry = new THREE.BufferGeometry()
                            .setFromPoints(verticalpoints);
                        // const vertMaterial = new THREE.LineBasicMaterial({
                        //     linewidth: LINE_WIDTH,
                        //     color: (0xffffff),
                        // });

                        {
                            const verticalline = new THREE.LineSegments(vertGeometry, model.mergeEdgeMaterial2D);
                            verticalline.position.x += 0.05;
                            model.coreEdges.add(verticalline);
                        }
                        {
                            const verticalline = new THREE.LineSegments(vertGeometry, model.mergeEdgeMaterial2D);
                            verticalline.position.x -= 0.05;
                            model.coreEdges.add(verticalline);
                        }

                        if (previousPoint) {
                            const midPoint = new THREE.Vector3(
                                (currentPoint.x + previousPoint.x) / 2,
                                (currentPoint.y + previousPoint.y) / 2,
                                (currentPoint.z + previousPoint.z) / 2,
                            );
                            const direction = new THREE.Vector3().subVectors(currentPoint, previousPoint);
                            const nudge = getNudgeVector(direction, plane.normal);
                            const nudged1 = new THREE.Vector3().addVectors(midPoint, nudge);
                            const nudged2 = new THREE.Vector3().subVectors(midPoint, nudge);
                            if (
                                (
                                    !checkPointInAllModelsButNotOnEdge(nudged1, model.uuid) ||
                                    !checkPointInAllModelsButNotOnEdge(nudged2, model.uuid)
                                ) &&
                                !checkIfVectorPresentInArray(
                                    [previousPoint, currentPoint],
                                    allModelConvexLines,
                                )
                            ) {
                                lineSegments.push(previousPoint, currentPoint);
                                if (Math.abs(previousPoint.x.toFixed(4)) !== Math.abs(currentPoint.x.toFixed(4)) || Math.abs(previousPoint.y.toFixed(4)) !== Math.abs(currentPoint.y.toFixed(4))) {
                                    model.children[i].intersectingEdges.push([previousPoint, currentPoint]);
                                }
                                allModelConvexLines.push([previousPoint, currentPoint]);
                            }
                        }

                        previousPoint = currentPoint;

                        // DEBUG
                        // const dotGeometry = createBufferGeometry();
                        // dotGeometry.vertices = [currentPoint];
                        // model.intersectionLinesGroup.add(new THREE.Points(
                        //     dotGeometry,
                        //     new THREE.PointsMaterial({ color: (0x00ff00 + (0x0000f0 * i)), size: 10, sizeAttenuation: false }),
                        // ));
                    });

                    if (lineSegments.length > 1) {
                        for (let ind = 0; ind < lineSegments.length - 1; ind++) {
                            model.intersectingEdges.push([lineSegments[ind], lineSegments[ind + 1]])
                        }
                        const hullLinesGeometry = new THREE.BufferGeometry()
                            .setFromPoints(lineSegments);
                        // const hullLinesMaterial = new THREE.LineBasicMaterial({
                        //     linewidth: LINE_WIDTH,
                        //     color: 0x00ff00,
                        // });
                        const horizontalline = new THREE.LineSegments(
                            hullLinesGeometry,
                            model.mergeEdgeMaterial2D,
                        );
                        horizontalline.position.z += 0.01;
                        model.coreEdges.add(horizontalline);
                    }
                }
            });

            const intermediate = getOrderedEdges(model.children[i].intersectingEdges);

            const intermediateWithoutDupes = [];
            intermediate
                .forEach((edgeArray) => {
                    const filteredEdges = edgeArray
                        .filter((edge) => {
                            return edge[0].distanceToSquared(edge[1]) > 0.000001;
                        });
                    if (filteredEdges.length > 0) {
                        intermediateWithoutDupes.push(filteredEdges);
                    }
                });

            const setbackVertices = intermediateWithoutDupes
                .map(verticesList => verticesList
                    .map(vertices => vertices[0]));

            model.children[i].setbackVertices = setbackVertices;
            model.children[i].setbackVerticesReset = true;


            // const groundline = new THREE.Line(ground, dbgMaterial);
            // groundline.position.y += 0.01;
            // model.intersectionLinesGroup.add(groundline);

            // const dbgGeometry = getFace(debugPlaneVertices.splice(-1));
            // const dbgMaterial = new THREE.MeshBasicMaterial({
            //     transparent: true,
            //     opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            //     color: (0x00ff00 + (0x0000f0 * i)),
            // });
            // const dbgmesh = new THREE.Mesh(dbgGeometry, dbgMaterial);
            // model.intersectionLinesGroup.add(dbgmesh);
        }
    }
    else {
        model.children.forEach((child) => {
            child.setbackVertices = [child.get3DVertices().map(vertex => new THREE.Vector3(...vertex))];
            child.setbackVerticesReset = true;
        });
    }
    if (isIntersecting) {
        model.children.forEach((child) => {
            child.updateGeometry();
        });
    }

    model.intersectingModels = intersectingModels;
    return allModelConvexLines;
}

export async function isOrganisationUnirac() {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const organisationId = user.organisation_id;

        let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
        if(!Object.keys(responseData).length){
            responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
        }

        return (responseData.name === 'Unirac' && responseData.id === 114 );
}

// returns the measurements of the object( i.e polygon, propertyLine, etc) passed in the parameter
export function getMeasurementText(object) {
    const measurements = [];
    for (let i = 0, l = object.lengthMeasurements.length; i < l; i += 1) {
        // if dimension is changed i.e from m to ft
        object.lengthMeasurements[i].update();
        if (isMetricUnit()) {
            // for meter the lengthMeasurements does not have unit in text
            measurements.push(object.lengthMeasurements[i].textObject.text.concat(' m'));
        }
        else {
            // for feet inches the lengthMeasurements have unit in text
            const measureInFtInch = object.lengthMeasurements[i].textObject.text.replace(' ft', '').replace('in','').split(" ");
            const ft = parseFloat(measureInFtInch[0]);
            const inch = parseFloat(measureInFtInch[1]);
            const foot = ((ft * 12) + inch) / 12;
            measurements.push('~'.concat(foot.toFixed(2).toString()).concat('\''));
        }
    }
    return measurements;
}

// returns the EdgeAngleWrtXaxis inBetween (90, -90) of the object( i.e polygon, propertyLine, etc) passed in the parameter
export function getEdgeAngleWrtXaxis(object) {
    const angles = [];
    const vertices = object.get2DVertices();
    const nVertices = vertices.length;
    for (let i = 0; i < nVertices; i++) {
        let x = 0, y = 0;
        if ( i < nVertices - 1) {
            y = vertices[i+1][1] - vertices[i][1];
            x = vertices[i+1][0] - vertices[i][0];
        }
        else {
            // for last edge
            y = vertices[0][1] - vertices[i][1];
            x = vertices[0][0] - vertices[i][0];
        }
        // angle in rad
        const angle = Math.atan(y / x);
        const degAngle = rad2Deg(angle.toFixed(3))
        angles.push(degAngle);
    }
    return angles;
}

export function getDimensionPositionFromEdge(object) {
    const position = [];
    const vertices = object.get2DVertices();
    const nVertices = vertices.length;
    for (let i = 0; i < nVertices; i++) {
        //edge points
        let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
        if ( i < nVertices - 1) {
            y1 = vertices[i][1];
            y2 = vertices[i+1][1];
            x1 = vertices[i][0];
            x2 = vertices[i+1][0];
        }
        else {
            // for last edge
            y1 = vertices[i][1];
            y2 = vertices[0][1];
            x1 = vertices[i][0];
            x2 = vertices[0][0];
        }
        const vertex1 = new THREE.Vector3(x1, y1, 0);
        const vertex2 = new THREE.Vector3(x2, y2, 0);
        const pos = getNormalMidpoint(vertex1, vertex2, 0.9144);
        position.push([pos.x, pos.y]);
    }
    return position;
}


/**
 * Calculates the intersection of three planes in 3D space.
 *
 * @param {THREE.Plane} p1 - The first plane.
 * @param {THREE.Plane} p2 - The second plane.
 * @param {THREE.Plane} p3 - The third plane.
 * @return {THREE.Vector3} The intersection point of the three planes.
 */
export function getInterSectionOfPlanes(p1, p2, p3) {
    let n1 = p1.normal,
        n2 = p2.normal,
        n3 = p3.normal;
    let x1 = p1.coplanarPoint(new THREE.Vector3());
    let x2 = p2.coplanarPoint(new THREE.Vector3());
    let x3 = p3.coplanarPoint(new THREE.Vector3());
    let f1 = new THREE.Vector3().crossVectors(n2, n3).multiplyScalar(x1.dot(n1));
    let f2 = new THREE.Vector3().crossVectors(n3, n1).multiplyScalar(x2.dot(n2));
    let f3 = new THREE.Vector3().crossVectors(n1, n2).multiplyScalar(x3.dot(n3));
    let det = new THREE.Matrix3().set(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, n3.x, n3.y, n3.z).determinant();
    let vectorSum = new THREE.Vector3().add(f1).add(f2).add(f3);
    let planeIntersection = new THREE.Vector3(vectorSum.x / det, vectorSum.y / det, vectorSum.z / det);

    return planeIntersection
}
  
  /**
   * Calculates the intersection of a line and a plane in 3D space.
   *
   * @param {THREE.Vector3} p0 - A point on the plane.
   * @param {THREE.Vector3} n - The normal vector of the plane.
   * @param {THREE.Vector3} l0 - A point on the line.
   * @param {THREE.Vector3} l - The direction vector of the line.
   * @return {THREE.Vector3} The intersection point of the line and plane, or
   * null if the line is parallel to the plane.
   */
export function getLinePlaneIntersection(p0, n, l0, l) {
    // Calculate the dot product of the normal vector and the direction vector.
    const dot = n.dot(l);

    // Check if the line is parallel to the plane (dot = 0) and return null if
    // there is no intersection.
    if (dot === 0) {
        return null;
    }

    // Calculate the distance along the line from l0 to the intersection point.
    const t = -(n.dot(p0) - n.dot(l0)) / dot;

    // Calculate the coordinates of the intersection point.
    const intersection = l0.clone().add(l.clone().multiplyScalar(t));

    return intersection;
}

  /**
   * Checks the sanity of a vector.
   *
   * @param {THREE.Vector3} vector - The vector to check.
   * @return {boolean} True if the vector is sane, false otherwise.
   */
export function sanityCheckVector3(vector) {
    if (vector.x === Infinity ||
        vector.x === -Infinity ||
        vector.y === Infinity ||
        vector.y === -Infinity ||
        vector.z === Infinity ||
        vector.z === -Infinity) {
        return false;
    }
    if (Number.isNaN(Number(vector.x)) || Number.isNaN(Number(vector.y)) || Number.isNaN(Number(vector.z))) {
        return false;
    }
    return true;
}

    /**
     *  Check if input is a number
     * 
     * @param {any} n
     * @returns {boolean}
     *  
    */
export function isNumber(n) {
    return !isNaN(n) && isFinite(n);
}

export function updateTable(tables,updatedProperties, stage){
    let groupedTables = groupTables(tables);

    createUpdatedTables(this,updatedProperties, groupedTables, stage)
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}
function groupTables(tables){
    return groupBy(tables,table =>table.getSubarray().uuid);
}

function checkIfSnapped(checkTable, tables){

    let subarray = tables[0].getSubarray();
    let dimension = subarray.getTableDimensions();
    let stage = tables[0].stage;
    const bBox = tables[0].getSubarray().getBoundingBox();
        
    const rightDirection = bBox[3].clone().sub(bBox[0]);
    rightDirection.normalize();
    const upDirection = bBox[0].clone().sub(bBox[1]);
    upDirection.normalize();

    for(let i= 0; i < tables.length; i++) {
        // console.log(tables[i])
    let position = tables[i].getPosition();
    const rightDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, dimension.width/2 + subarray.tableSpacing * 2 + 0.2);
    const leftDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, -(dimension.width/2 + subarray.tableSpacing * 2 + 0.2));
    const topDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, dimension.length/2 + subarray.rowSpacing * 2 + 0.2);
    const downDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, -dimension.length/2 + subarray.rowSpacing * 2 + 0.2);

        let leftPos = new Vector3(position.x + leftDisplacement.x, position.y + leftDisplacement.y, position.z);
        let rightPos = new Vector3(position.x + rightDisplacement.x, position.y + rightDisplacement.y, position.z);
        let topPos = new Vector3(position.x + topDisplacement.x, position.y + topDisplacement.y, position.z);
        let downPos = new Vector3(position.x + downDisplacement.x, position.y + downDisplacement.y, position.z);
        // let downPos = tables[i].getPosition();
        // //visualization
        // let box = new THREE.BoxGeometry(1, 1, 1);
        // let collision_mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({color:0xff0000}));
        // collision_mesh.position.set(leftPos.x, leftPos.y, leftPos.z);
        // tables[0].stage.sceneManager.scene.add(collision_mesh);

        tables[i].snappedLeft = null;
        tables[i].snappedRight = null;
        tables[i].anchorTable = false;
        // let subarray = tables[i].getSubarray();
        // let raycaster = new THREE.Raycaster();
        // //not working needs fix
        // let right = getAllObjectsBelowPoint(rightPos, stage, raycaster)
        // let left = getAllObjectsBelowPoint(leftPos, stage, raycaster)
        // let top = getAllObjectsBelowPoint(topPos, stage, raycaster)
        // let down = getAllObjectsBelowPoint(downPos, stage, raycaster)
        let nearestTop = subarray.getNearestTableToPoint(topPos);
        let nearestDown = subarray.getNearestTableToPoint(downPos);
        let nearestRight = subarray.getNearestTableToPoint(rightPos);
        let nearestLeft = subarray.getNearestTableToPoint(leftPos);
        
        // tables[i].getSubarray().parent.parent.drawCircleGreen(nearestTop.getPosition())
        // console.log(right[0][0].getParent(), left[0][0]);
        let snappedLeft = false;
        let snappedRight = false;
        let snappedTop = false;
        let snappedDown = false;
        if(nearestRight){
            if(checkPointInsideVertices(nearestRight.get2DVertices(), [rightPos.x, rightPos.y])){
                tables[i].snappedRight = nearestRight;
                snappedRight = true;
            }
        }
        if(nearestLeft){
            if(checkPointInsideVertices(nearestLeft.get2DVertices(), [leftPos.x, leftPos.y])){
                tables[i].snappedLeft = nearestLeft;
                snappedLeft = true;
            }
        }
        if(nearestTop){
            if(checkPointInsideVertices(nearestTop.get2DVertices(), [topPos.x, topPos.y])){
                tables[i].snappedTop = nearestTop;
                snappedTop = true;
            }
        }
        if(nearestDown){
            if(checkPointInsideVertices(nearestDown.get2DVertices(), [downPos.x, downPos.y])){
                tables[i].snappedDown = nearestDown;
                snappedDown = true;
            }
        }
        tables[i].anchorTable = !snappedLeft && snappedRight;
    }
    // console.log(tables)
    return tables;

}

function addSnappingInformation(tables){
    let _tables = tables;
    let startingTable = _tables[0]
    return checkIfSnapped(startingTable,tables);
}

function createUpdatedTables(tables,updatedProperties, groupedTables, stage) {
    stage.stateManager.startContainer();
    let groupKeys = Array.from(groupedTables.keys())
    for (let i = 0; i < groupKeys.length; i++) {
        let tables = groupedTables.get(groupKeys[i]);
        let subarrayProperties = tables[0].getSubarray();
        let oldDimensions = subarrayProperties.getTableDimensions();
        let newDimensions = null
        let oldTiltFactor = Math.cos(subarrayProperties.getTiltWrtParentSurface(subarrayProperties.stage.ground));
        if(oldTiltFactor){
            oldDimensions.length *= oldTiltFactor; 
        }
        tables = addSnappingInformation(tables);
        // console.log(tables)
        updatedProperties.moduleProperties = subarrayProperties.moduleProperties
        const subarray = createNewSubarray(subarrayProperties, stage)        
        subarray.updateSubarrayForAddTable(updatedProperties)
        oldDimensions.length *= oldTiltFactor
        newDimensions = subarray.getTableDimensions()
        let subarrayRelativeTiltFactor = Math.cos(subarray.getTiltWrtParentSurface(subarray.stage.ground));

        newDimensions.length *= subarrayRelativeTiltFactor;
        moveScaleFactor(tables, oldDimensions, newDimensions)
        for (let i = 0; i < tables.length; i++) {
            // subarray.isEmpty = false;
            const templateTableMap = subarray.getTemplateTableMap({ withBBox: true });
            templateTableMap.hidden = false;
            templateTableMap.isMoved = true;

                        let currentBaseTable = new Table(stage, templateTableMap, { withoutContainer: false }, false);
                        const rowMap = {
                            id: i,
                            frames: [],
                        };
                        const row = new Row(stage, rowMap, { withoutContainer: true }, true);
                        subarray.addChild(row);
                        currentBaseTable.clickToAdd = true;

                        row.addChild(currentBaseTable);
                        subarray.validateStructures();
                        const panels = currentBaseTable.getChildren();
                        for (let i = 0, l = panels.length; i < l; i += 1) {
                            panels[i].setId(subarray.getPanelId());
                        }
                        let position = tables[i].getPosition();
                        let newZ = subarray.getParent().getZOnTopSurface(position.x, position.y) + 0.1
                        currentBaseTable.moveObject(position.x, position.y, newZ);
                        currentBaseTable.updateVisualsAfterLoadingAndCreation();
                        row.saveState();
                    
                
                if (!subarray.isEmpty && subarray.getParent()) {
                    try{
                        subarray.removeOutlinePoints();
                        subarray.addTableFlow = false;
                        subarray.createConvexHull();
                        subarray.mergeGeometriesForAllPanels();
                    }catch(e){
                        console.log("ERROR CREATING SUBARRAY")
                    }
                } else {
                    subarray.removeIfEmpty();
                }

                tables[i].removeObject()
            // after the table is added to subarray we should update rails
            subarray.updateRail();
        }
    }
    stage.stateManager.stopContainer();
}
function moveScaleFactor(tables, oldDimensions, newDimensions){
    // let tables = subarray.getTables();
    let subarray = tables[0].getSubarray();
    let azimuthFactor = subarray.azimuth > 180 ? -1: -1;
    let xDiff = (oldDimensions.width - newDimensions.width) * azimuthFactor;  
    let yDiff = (oldDimensions.length - newDimensions.length) * azimuthFactor; 
    for(let i = 0; i < tables.length; i++){
        if(tables[i].anchorTable){
            const bBox = tables[i].getSubarray().getBoundingBox();
            
            const rightDirection = bBox[3].clone().sub(bBox[0]);
            rightDirection.normalize();
            const upDirection = bBox[0].clone().sub(bBox[1]);
            upDirection.normalize();
            

            let currentTable = tables[i];
            let distanceCount = 1;
            while(currentTable.snappedRight){
                
                if(currentTable.anchorTable && currentTable.snappedTop){
                currentTable.heightCount = (currentTable.snappedTop.heightCount || 0 ) + 1
                const finalDisplacement = (new THREE.Vector3()).addScaledVector(upDirection, -yDiff * currentTable.heightCount);
                currentTable.moveObject(finalDisplacement.x, finalDisplacement.y, 0)
                }


                const finalDisplacement = (new THREE.Vector3()).addScaledVector(rightDirection, xDiff * distanceCount);

                if(tables[i].snappedTop) finalDisplacement.addScaledVector(upDirection, -yDiff * tables[i].heightCount);

                currentTable = currentTable.snappedRight;
                currentTable.moveObject(finalDisplacement.x, finalDisplacement.y, 0)
                // finalDisplacement.addScaledVector(upDirection, smallestDelta.y);
                // console.log(currentTable.getPosition(), )
                distanceCount++
            }
        }
    }
}

function createNewSubarray(subarrayProperties, stage) {
    const newSubarray = new Subarray(stage);
    subarrayProperties.getParent().addChild(newSubarray);
    newSubarray.associatedModel = subarrayProperties.associatedModel;
    newSubarray.createBoundaryFromParent();
    newSubarray.addTableFlow = true;
    if (subarrayProperties !== null) {
        newSubarray.updateSubarrayForAddTable(subarrayProperties);
    }
    return newSubarray;
}


/**
 * 
 * @param {THREE.Vector3} poly1 
 * @param {THREE.Vector3} poly2 
 * @returns {THREE.Vector3} mtv
 * 
 * @also
 * 
 * @param {THREE.Vector2} poly1 
 * @param {THREE.Vector2} poly2 
 * @returns {THREE.Vector2} mtv
 */
export function findMTV(poly1, poly2) {

    const intersects = gjk.intersect(poly1, poly2);
  
    if (!intersects) {
      // If the polygons are not intersecting, find the nearest points on each polygon to the other polygon
      const nearestPoints = findNearestPoints(poly1, poly2);
  
      // Calculate the distance between the nearest points
      const distance = nearestPoints[0].distanceTo(nearestPoints[1]);
  
      // Calculate the direction of the shortest vector connecting the polygons
      const direction = nearestPoints[1].clone().sub(nearestPoints[0]);
  
      // Return the MTV as a three.js Vector with the calculated distance and direction
      return direction.setLength(distance);
    } else {
        return null;
    }
}

  // Helper function to find the nearest points on each polygon to the other polygon
export function findNearestPoints(poly1, poly2) {
    let minDistance = Number.MAX_VALUE;
    let nearestPoints;
  
    // Iterate over all combinations of points in the two polygons
    for (const p1 of poly1) {
      for (const p2 of poly2) {
        // Calculate the distance between the points
        const distance = p1.distanceTo(p2);
  
        // If the distance is smaller than the current minimum distance, update the minimum distance and the nearest points
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoints = [p1, p2];
        }
      }
    }
  
    return nearestPoints;
}

// Uses JSTS to find the union of two polygons (Vector2) and returns the result as a three.js Vector2 array
export function getUnionOfTwoPolygons(poly1, poly2) {
    const jstsPoly1 = JSTSConverter.verticesToJSTSPolygon(convertVectorArrayTo2DArray(poly1));
    const jstsPoly2 = JSTSConverter.verticesToJSTSPolygon(convertVectorArrayTo2DArray(poly2));
    const union = jstsPoly1.union(jstsPoly2);
    return JSTSConverter.verticesFromJSTSPolygon(union);
}

export function isDisjoint(poly1, poly2) {
    const jstsPoly1 = JSTSConverter.verticesToJSTSPolygon(convertVectorArrayTo2DArray(poly1));
    const jstsPoly2 = JSTSConverter.verticesToJSTSPolygon(convertVectorArrayTo2DArray(poly2));
    return !jstsPoly1.intersects(jstsPoly2);
}

export function mergeFaces(stage, face1, face2, snapRoofs = true, offset = 0) {
    const defaultTilt = Math.max(face1.tilt, face2.tilt);
    const defaultAzimuth = face1.azimuth;
    const tilt = deg2Rad(face1.tilt);
    const roof2 = face2.parent;

    if (snapRoofs) {
        const deltaAzimuth = face2.azimuth - face1.azimuth;
        if (Math.abs(deltaAzimuth) > 0.001) {
            roof2.rotateObjectHelper(deg2Rad(deltaAzimuth), roof2.getPosition());
        }
        
        const mtv = findMTV(face2.getVector2Vertices(), face1.getVector2Vertices());
        if (mtv) {
            mtv.multiplyScalar(1.01);
            roof2.moveObject(mtv.x, mtv.y, 0);
            roof2.placeObject();
        }
        const heightDelta = (face2.plane.constant - face1.plane.constant) / Math.cos(tilt);

        roof2.updateHeight(roof2.coreHeight + heightDelta);
        roof2.createRotation();
    }

    const union = offset === 0 ?
        getUnionOfTwoPolygons(face1.vertices, face2.vertices) :
        interpolateUnion(face1.vertices, face2.vertices, offset);

    if (checkClockwise(union)) {
        union.reverse();
    }
    const vecUnion = convertArrayToVector(union);
    for (let i = 0; i < vecUnion.length; i += 1) {
        const vertex = vecUnion[i];
        const vertexNext = vecUnion[(i + 1) % vecUnion.length];
        const vertexPrev = vecUnion[((i - 1) + vecUnion.length) % vecUnion.length];
        if (checkCollinear(vertex, vertexNext, vertexPrev, 0.0001)) {
            vecUnion.splice(i, 1);
            i -= 1;
        }
    }
    const cleanVerts = removeSharpCorners(vecUnion, 0.0001);
    const EPSILON = 0.1;
    const lowestHeight = Math.max(face1.getHeight(), face2.getHeight());
    // find the edge that is overlapping the outer edge of the lowest face

    let outerEdgeIndex = 0;
    const v3Vertices = cleanVerts.map(v => new THREE.Vector3(v.x, v.y, lowestHeight));
    const smBuilder = new SmartroofBuilder('Custom', stage, false);
    smBuilder.makeCustomDrawFace(v3Vertices, 0, defaultTilt);
    const drawFace = smBuilder.model;
    const outerEdges = drawFace.outerEdgeObjects;
    const index = outerEdges.findIndex(edge => {
        // getting normal for each pair
        let azimuth = 180;
        let angle = toDegrees(Math.atan2((edge.point1.y - edge.point2.y), -(edge.point1.x - edge.point2.x)));
        // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
        angle += 180;
        azimuth = angle.toFixed(2);
        if (azimuth > 359.99) {
            azimuth = 0;
        }
        if (Math.abs(defaultAzimuth-azimuth) < 0.01) {
            return true;
        }
        return false;
    });
    if (index != -1) {
        outerEdgeIndex = index;
    }

    drawFace.makePrimaryEdge(drawFace.outerEdgeObjects[outerEdgeIndex]);
    const point1 = drawFace.primaryEdge.point1;
    const highestZ = Math.max(face1.getZOnTopSurface(point1.x, point1.y), face2.getZOnTopSurface(point1.x, point1.y));
    drawFace.updateHeight(highestZ+EPSILON);
    face1.deSelect();
    face2.deSelect();
    return drawFace;
}

export function removeSharpCorners(vectorArray, threshold = 0.01) {
    const arrayCopy = [...vectorArray];
    for (let index = 0; index < arrayCopy.length; index++) {
        const vertex = arrayCopy[index];
        const prevIdx = (arrayCopy.length + (index - 1)) % arrayCopy.length;
        const previous = arrayCopy[prevIdx];
        const nextIdx = (index + 1) % arrayCopy.length;
        const next = arrayCopy[nextIdx];
        
        const [start, end] = getAngles(previous, vertex, next);
        const diff = Math.abs(end - start);
        if(
            diff < threshold ||
            Math.abs(diff - Math.PI) < threshold
        ) {
            arrayCopy.splice(index, 1);
            index -= 1;
        }
    }
    return arrayCopy;
}

export function minimumDistanceBetweenPolygons(polygon1, polygon2) {
    let minDistance = Number.MAX_VALUE;

    for (let i = 0; i < polygon1.length; i++) {
        for (let j = 0; j < polygon2.length; j++) {
            const distance = distanceBetweenPointAndEdge(polygon1[i], polygon2[j], polygon2[(j + 1) % polygon2.length]);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    }

    return minDistance;
}

export function distanceBetweenPointAndEdge(point, edgeStart, edgeEnd) {
    let closestPoint = closestPointOnEdge(point, edgeStart, edgeEnd);
    return distanceBetweenPoints(point, closestPoint);
}

export function closestPointOnEdge(point, edgeStart, edgeEnd) {
    const edgeVector = { x: edgeEnd.x - edgeStart.x, y: edgeEnd.y - edgeStart.y };
    const pointVector = { x: point.x - edgeStart.x, y: point.y - edgeStart.y };

    const edgeLengthSquared = edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y;
    const t = Math.max(0, Math.min(1, (pointVector.x * edgeVector.x + pointVector.y * edgeVector.y) / edgeLengthSquared));

    return { x: edgeStart.x + t * edgeVector.x, y: edgeStart.y + t * edgeVector.y };
}

// Gets the disance between two points in 2D space
export function distanceBetweenPoints(point1, point2) {
    const xDiff = point1.x - point2.x;
    const yDiff = point1.y - point2.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

export function getVerticesFromBufferGeometry(geometry) {
    const vertices = [];
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        vertices.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }
    return vertices;
}

// Gets the union of two polygons
export function interpolateUnion(polygon1, polygon2, buffer) {
    const jstsPoly1 = JSTSConverter
        .verticesToJSTSPolygon(polygon1.map(v => [v.x, v.y, v.z]));
    const jstsPoly2 = JSTSConverter
        .verticesToJSTSPolygon(polygon2.map(v => [v.x, v.y, v.z]));

    const geometryFactory = new JSTS.geom.GeometryFactory();
    // Should probably use ((buffer/2) + EPSILON) to be precise.
    const geometryCollection = new JSTS.geom.GeometryCollection([jstsPoly1.buffer(buffer), jstsPoly2.buffer(buffer)], geometryFactory);
    const unionPoly = geometryCollection.union();

    const BufferOp = JSTS.operation.buffer.BufferOp;
    const BufferParameters = JSTS.operation.buffer.BufferParameters;
    let bufferParams = new BufferParameters(
        BufferParameters.DEFAULT_QUADRANT_SEGMENTS,
        BufferParameters.CAP_FLAT,
        BufferParameters.JOIN_MITRE,
        BufferParameters.DEFAULT_MITRE_LIMIT
    );

    let innerPolygon = BufferOp.bufferOp(unionPoly, -buffer, bufferParams);
    if (innerPolygon.getCoordinates().length < 4) {
        return [];
    }

    return JSTSConverter.verticesFromJSTSPolygon(innerPolygon);
}

export function b64toBlob(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  /**
   * 
   * @param {*} height height of the page
   * @param {*} width width of the page
   * @param {*} rotation angle of rotation in degree
   * @returns 
   */
export function findOrientionOfPage(height, width, rotation = 0) {
    let orientation;
    if (rotation === 0 || rotation === 180) {
        orientation = width > height ? 'landscape' : 'portrait';
    }
    else if (rotation === 90 || rotation === 270) {
        orientation = width > height ? 'portrait' : 'landscape';
    }
    else {
        orientation = 'unknown';
    }

    return orientation;
}

export async function mergePdfs(pdfs = []) {
    const mergedPdf = await PDFDocument.create(); 

    for (let i = 0; i < pdfs.length; i += 1) {
        const url = pdfs[i];

        const donorPdfBytes = await fetch(url)
            .then((res) =>
                res.arrayBuffer());

        const donorPdfDoc = await PDFDocument.load(donorPdfBytes);

        const copiedPages = await mergedPdf.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
            mergedPdf.addPage(page)
        }); 

        await mergedPdf.save();
    }

    return mergedPdf;
}

export async function mergePdfPages(donorPdfDoc) {

    const embedDoc = await PDFDocument.create();
    const donorPdfDocPageCount = donorPdfDoc.getPageCount();

    const pageCount = donorPdfDocPageCount < 10 ? donorPdfDocPageCount : 10;
    for (let j = 0; j < pageCount; j += 1) {
        const page = embedDoc.addPage();
        const [embeddedPage1] = await embedDoc.embedPdf(donorPdfDoc, [j])
        let embeddedPage2;
        if (j + 1 < pageCount) {
            [embeddedPage2] = await embedDoc.embedPdf(donorPdfDoc, [j + 1])
        }

        const check1 = findOrientionOfPage(
            embeddedPage1.height,
            embeddedPage1.width,
            donorPdfDoc.getPage(j).getRotation().angle,
        ) == 'portrait'
        const check2 = embeddedPage2 &&
            findOrientionOfPage(
                embeddedPage2.height,
                embeddedPage2.width,
                donorPdfDoc.getPage(j + 1).getRotation().angle
            ) == 'portrait'


        if (check2 && check1) {
            const width = embeddedPage1.width + embeddedPage2.width
            page.setWidth(width);

            page.drawPage(embeddedPage1, {
                x: 0,
                y: 0,
                xScale: 1,
                yScale: 1,
                opacity: 1,
            })
            page.drawPage(embeddedPage2, {
                x: embeddedPage1.width,
                y: 0,
                xScale: 1,
                yScale: 1,
                opacity: 1,
            })

            j += 1

        }
        else {
            const angle = donorPdfDoc.getPage(j).getRotation().angle;
            const height = embeddedPage1.height;
            const width = embeddedPage1.width;

            page.setHeight(height);
            page.setWidth(width);
            page.setRotation(degrees(angle))
            page.drawPage(embeddedPage1, {
                opacity: 1,
            })
        }
    }

    return embedDoc;
}
export async function setGazeboStatus() {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    let organisationId = user.organisation_id;
    let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
    if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
        responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
    }
    return Promise.resolve(responseData.vip_for_power_gazebo);
}
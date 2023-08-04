import * as THREE from 'three';
import Cables from './Cables';
import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    OUT_OF_BASE_MODEL_ERROR,
    MODEL_INTERSECTION_WITH_OTHER_MODELS,
    VERTEX_EQUIVALENT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    DEFAULT_HANDRAIL_DIRECTION,
    ALTERNATE_HANDRAIL_DIRECTION,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    DEFAULT_VERTICES_DIRECTION,
    ALTERNATE_VERTICES_DIRECTION,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
} from '../../../coreConstants';
import { getModels, getAllModelType } from '../../../utils/exporters';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import {
    convertArrayToVector,
    convertArrayTo3DVector,
    checkIfLastVertexOnEdges,
    setbackPolygon,
    getNormalPoints,
    checkLastEdgeIntersectionWithEdges,
    checkPolygonInsidePolygon,
    checkIntersectionWithSiblings,
    checkIfPointLiesOnLineSegment,
    checkVertexEquivalency,
    checkLineIntersection,
    lineIntersection,
    getLerpValueFromVertices,
    getHighestZ,
    checkPointInsideVertices,
    rotationAroundPoint,
    getSecondPoints,
} from '../../../utils/utils';
import {
    areVerticesOnGround,
    getAllCommonModelsBelowVertices,
    getTopCommonModelBelowVertices,
    getTopModelFromPoint,
} from '../../../utils/raycastingUtils';
import OutlinePoints from '../../subObjects/OutlinePoints';
import LengthMeasurement from '../../subObjects/LengthMeasurement';
import Walkway from './../Walkway';
import PolygonModel from './../PolygonModel';
import Subarray from './../../subArray/Subarray';
import * as visualUtils from '../../../utils/visualUtils';
import Ground from '../../ground/Ground';
import BaseObject from '../../BaseObject';
import { mirrorObjectData } from '../../../utils/mirrorUtils';
import Handrail from './../Handrail';
import CylinderModel from './../CylinderModel';


export default class AcCable extends Cables {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        this.inverter = null;
        this.acdbAttached = null;
        // standard norms
        this.stage = stage;
        const defaultProperties = this.getDefaultProperties();
        this.setInitialProperties(defaultProperties);
    }

    setInitialProperties(properties) {
        this.materialType = properties.materialType;
        this.cores = properties.cores;
        this.cableSizeMM = properties.cableSizeMM;
        this.cableSizeAWG = properties.cableSizeAWG;
        this.CableDirection = DEFAULT_VERTICES_DIRECTION;
    }

    /**
     * Returns the default properties properties for handrail
     * For now they are hard-coded.
     */
    getDefaultProperties() {
            return {
                materialType: this.stage.getDesignSettings().drawing_defaults.acCable.materialType,
                cores: this.stage.getDesignSettings().drawing_defaults.acCable.cores,
                cableSizeMM: this.stage.getDesignSettings().drawing_defaults.acCable.cableSizeMM,
                cableSizeAWG: this.stage.getDesignSettings().drawing_defaults.acCable.cableSizeAWG,
            };
        }
        // load and save functions

    getState() {
        const acCableData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            inverteruuid: this.inverter.uuid,
            CableDirection: this.CableDirection,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        return acCableData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            this.id = state.id;
            this.name = state.name;
            this.inverter = this.stage.getObject(state.inverteruuid);

            this.CableDirection = state.CableDirection;

            this.updateVisualsAfterLoadingAndCreation();

            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.outlinePoints = state.outlinePoints.map(outlinePoint =>
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage,
                    ));

                this.updateMeasurement();
            } else {
                if (this.outlinePoints.length !== state.outlinePoints.length) {
                    console.error("Handrail: loadState: outlinePoints length don't match");
                    return null;
                }

                for (let index = 0; index < this.outlinePoints.length; index += 1) {
                    this.outlinePoints[index].setPosition(
                        state.outlinePoints[index][0],
                        state.outlinePoints[index][1],
                        state.outlinePoints[index][2],
                    );
                }

                this.updateMeasurement();
            }

            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                const nextIndex = i + 1 < l ? i + 1 : 0;
                const currentPoint = this.outlinePoints[i].getPosition();
                const nextPoint = this.outlinePoints[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }

            this.updateGeometry();
        }
    }


    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const acCableData = {
            type: AcCable.getObjectType(),
            id: this.id,
            name: this.name,
            CableDirection: this.CableDirection,
            materialType: this.materialType,
            cores: this.cores,
            cableSizeMM: this.cableSizeMM,
            cableSizeAWG: this.cableSizeAWG,
            inverterId: this.inverter != null ? this.inverter.id : 0,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
        };
        if (isCopy) {
            acCableData.uuid = this.uuid;
        }
        return acCableData;
    }

    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
            this.materialType = data.materialType;
            this.cores = data.cores;
            this.cableSizeMM = data.cableSizeMM;
            this.cableSizeAWG = data.cableSizeAWG;
        }

        // update properties here
        this.CableDirection = data.CableDirection;

        this.outlinePoints = data.outlinePoints.map(
            outlinePoint =>
            new OutlinePoints(
                outlinePoint[0],
                outlinePoint[1],
                outlinePoint[2],
                this,
                this.stage,
            ),
        );

        // for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
        //     const nextIndex = i + 1 < l ? i + 1 : 0;
        //     const currentPoint = this.outlinePoints[i].getPosition();
        //     const nextPoint = this.outlinePoints[nextIndex].getPosition();
        //     this.edgeCentrePoints.push(new EdgeCentrePoints(
        //         (currentPoint.x + nextPoint.x) / 2,
        //         (currentPoint.y + nextPoint.y) / 2,
        //         (currentPoint.z + nextPoint.z) / 2,
        //         this,
        //         this.stage,
        //     ));
        // }

        this.updateMeasurement();

        this.updateGeometry();
        this.inverter.acCableAttached = this;

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        } else {
            this.saveState({ withoutContainer: true });
        }
    }

    async updateObject(properties) {
        this.name = _.get(properties, 'name', this.name);

        const { materialType, cores, cableSizeAWG, cableSizeMM } = properties;

        if (materialType && materialType !== this.materialType) {
            this.materialType = materialType;
        }

        if (cores && cores !== this.cores) {
            this.cores = cores;
        }

        if (cableSizeAWG && cableSizeAWG !== this.cableSizeAWG) {
            this.cableSizeAWG = cableSizeAWG;
        }

        if (cableSizeMM && cableSizeMM !== this.cableSizeMM) {
            this.cableSizeMM = cableSizeMM;
        }

        this.updateGeometry();

        this.saveState();

        return true;
    }


    changePropertiesDuringCreation(properties) {

        // Here the values gets overridden by the change of values in Ac Cable properties.

        this.name = _.get(properties, 'name', this.name);
        this.materialType = _.get(properties, 'materialType', this.materialType);
        this.cores = _.get(properties, 'cores', this.cores);
        this.cableSizeAWG = _.get(properties, 'cableSizeAWG', this.cableSizeAWG);
        this.cableSizeMM = _.get(properties, 'cableSizeMM', this.cableSizeMM);

    }

    drawCableBetween2Points(vertices) {
        const notificationObject = this.stage.eventManager.setAcCableCreating();

        let start = new THREE.Vector2(vertices[0].x, vertices[0].y);
        let end = new THREE.Vector2(vertices[1].x, vertices[1].y);

        let children = [];

        let result = getAllModelType();
        getModels(this.stage.ground, result);
        for (const temp in result) {
            if (temp === 'polygons' || 'cylinders' || 'subArrays') {
                for (let i = 0; i < result[temp].length; i++) {
                    children.push(result[temp][i]);
                }
            }
        }

        // getting all the obstacles.
        let objs = [];
        // console.log(children, "CHILDREN");
        for (let i = 0; i < children.length; i++) {
            if (children[i] instanceof PolygonModel ||
                children[i] instanceof CylinderModel) {
                let obj = {};
                let points = children[i].get2DVertices();
                if (!isInside(start, points) && !isInside(end, points)) {
                    points = setbackPolygon(points, 1);
                    obj.points = points;
                    obj.tag = 'OBSTACLE';
                    objs.push(obj);
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

        // console.log(objs, 'OBJS');
        // console.log(polygon, "POLY");

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
                // console.log(point, [objects[i][0], objects[i][objects[i].length-1]], "LINE");
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
            // console.log(leftArr, rightArr, "ARRAYS");

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

            // console.log(leftPoints, rightPoints, "POINTS");
            // console.log(checkDistance(leftPoints), checkDistance(rightPoints), "Distance");
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

            interPoints.sort(function(point1, point2) {
                return (end.distanceToSquared(point2) - end.distanceToSquared(point1));
            });
            // console.log(interPoints, "INTER");

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
                // console.log(points, "FLAG")
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

        let leftPoint = new THREE.Vector2(start.x, end.y);
        let rightPoint = new THREE.Vector2(end.x, start.y);

        let leftPoints = getOuterPath(start, leftPoint, end);
        let rightPoints = getOuterPath(start, rightPoint, end);

        let points = (checkDistance(leftPoints) > checkDistance(rightPoints)) ? rightPoints : leftPoints;

        for (let i = 0; i < points.length; i++) {
            finalPoints.push(points[i]);
        }

        this.outlinePoints = finalPoints.map(
            vertex => new OutlinePoints(vertex.x, vertex.y, 100, this, this.stage),
        );

        // set edge center points
        vertices = [...finalPoints];
        for (let i = 0, l = vertices.length; i < l - 1; i += 1) {
            const nextIndex = i + 1 < l ? i + 1 : 0;
            this.edgeCentrePoints.push(new EdgeCentrePoints(
                (vertices[i].x + vertices[nextIndex].x) / 2,
                (vertices[i].y + vertices[nextIndex].y) / 2,
                (vertices[i].z + vertices[nextIndex].z) / 2,
                this,
                this.stage,
            ));
        }

        this.updateMeasurement();

        try {
            this.placeObject();
            this.stage.eventManager.completeAcCableCreation(notificationObject);
            return true;
        } catch (error) {
            console.error('ERROR: Cable: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorAcCableCreation(notificationObject);
            throw error;
        }
    }

    static getObjectType() {
        return 'AcCable ';
    }

}
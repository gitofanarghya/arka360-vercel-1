import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    OUT_OF_BASE_MODEL_ERROR,
    VERTEX_EQUIVALENT_ERROR,
    LAST_EDGE_INTERSECTION_ERROR,
    VERTEX_OVER_EDGE_ERROR,
    LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR,
    POLYGON_WITH_NO_AREA_ERROR,
    DEFAULT_VERTICES_DIRECTION,
    ALTERNATE_VERTICES_DIRECTION,
    DEFAULT_WALKWAY_DIRECTION,
    ALTERNATE_WALKWAY_DIRECTION,
} from '../../../coreConstants';
import {
    COLOR_MAPPINGS,
    VISUAL_STATES,
} from '../../visualConstants';
import {
    areVerticesOnGround,
    getTopCommonModelBelowVertices,
} from '../../../utils/raycastingUtils';
import {
    convertArrayToVector,
    convertArrayTo3DVector,
    checkIfLastVertexOnEdges,
    setbackPolygon,
    getNormalPoints,
    getNormalPointsWithTiltedParent,
    checkLastEdgeIntersectionWithEdges,
    checkVertexEquivalency,
    lineIntersection,
    getLerpValueFromVertices,
    getHighestZ,
    checkPointInsideVertices,
    rotationAroundPoint,
} from '../../../utils/utils';

import OutlinePoints from '../../subObjects/OutlinePoints';
import LengthMeasurement from '../../subObjects/LengthMeasurement';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import Walkway from './../Walkway';
import PolygonModel from './../PolygonModel';
import Ground from '../../ground/Ground';
import BaseObject from '../../BaseObject';
import Handrail from './../Handrail';
import CylinderModel from './../CylinderModel';
import AcCable from './AcCable';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';
import NikGeometry from '../../ground/NikGeometry';

const MINIMUM_NUMBER_OF_POINTS = 2;

const acCableRadius = 0.02;
const UP_CROSSING = 'up-crossing';
const DOWN_CROSSING = 'down-crossing';
const NO_CROSSING = 'no-crossing';
let pointOnParapet1 = false;
let pointOnParapet2 = false;

export default class Cable extends BaseObject {
    constructor(stage) {
        super(stage);
        this.stage = stage;

        // standard norms
        this.stage = stage;
        this.id = stage.getAcCableId();
        this.name = `Cable #${this.id.toString()}`;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.objectGroupFor3D = new THREE.Group();

        // materials
        this.meshMaterial2D = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });
        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: 4,
            color: 0xffffff,
        });
        this.edgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: 4,
            color: 0xffffff,
        });

        // meshes and edges
        this.coreMesh = createMesh(createBufferGeometry(), this.meshMaterial2D);
        this.coreEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.coreMesh.geometry),
            this.edgeMaterial2D,
        );
        this.merged3d = undefined;
        this.coreMesh.receiveShadow = true;
        this.coreMesh.castShadow = true;

        // adding meshes and edges to objectsGroup
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.CableDirection = DEFAULT_VERTICES_DIRECTION;

        this.outlinePoints = [];
        this.lengthMeasurements = [];
        this.edgeCentrePoints = [];
        this.updateVisualsAfterLoadingAndCreation();
        this.midEnd = [];
    }

    initDrawingMode() {
        this.stage.drawManager.initialize(
            this,
            this.onComplete.bind(this),
            this.onCancel.bind(this),
        );
    }

    /**
     * Gets the vertices geometry from draw manager and
     * places the ac cable according to the drawn vertices.
     */
    async onComplete(geometry) {
        const notificationObject = this.stage.eventManager.setAcCableCreating();

        const vertices = _.range(geometry.noOfVertices).map(
            index =>
                new THREE.Vector3(
                    geometry.attributes.position.array[index * 3],
                    geometry.attributes.position.array[index * 3 + 1],
                    geometry.attributes.position.array[index * 3 + 2],
                ),
        );

        this.outlinePoints = vertices.map(
            vertex => new OutlinePoints(vertex.x, vertex.y, 11, this, this.stage),
        );

        // set edge center points
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

        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }

        this.updateMeasurement();

        try {
            await this.placeObject();
            this.stage.eventManager.completeAcCableCreation(notificationObject);
            return true;
        }
        catch (error) {
            console.error('ERROR: Ac Cable: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorAcCableCreation(notificationObject);
            throw error;
        }
    }

    drawCableBetween2Points(vertices) {
        const notificationObject = this.stage.eventManager.setAcCableCreating();

        this.outlinePoints = vertices.map(
            vertex => new OutlinePoints(vertex.x, vertex.y, 100, this, this.stage),
        );

        // set edge center points
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
        }
        catch (error) {
            console.error('ERROR: Cable: onCompleted failed', error);
            this.onCancel();
            this.stage.eventManager.errorAcCableCreation(notificationObject);
            throw error;
        }
    }

    onCancel() {
        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    exportAsSTL() {
        const singleGeometry = BufferGeometryUtils
            .mergeGeometries(this.objectGroupFor3D.children.map(child => child.geometry));
        const mesh = createMesh(singleGeometry, new THREE.MeshBasicMaterial());

        return [{
            mesh,
            name: this.name,
        }];
    }

    exportAsCollada() {
        const singleGeometry = BufferGeometryUtils
            .mergeGeometries(this.objectGroupFor3D.children.map(child => child.geometry));
        const mesh = createMesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: 0x808080,
            }),
        );
        mesh.name = this.name;

        return {
            model: mesh,
            subarray: [],
        };
    }

    // functions for undo/redo

    getState() {
        const acCableData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
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
        }
        else {
            this.id = state.id;
            this.name = state.name;

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
            }
            else {
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

            for(let i=0; i<this.edgeCentrePoints.length; i++) {
                this.edgeCentrePoints[i].hideObject();
            }

            this.updateGeometry();
        }
    }

    clearState() {
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.getParent().removeChild(this);

        // Remove measurements
        this.removeMeasurement();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.edgeCentrePoints = [];
    }

    /**
     * returns the 3d vertices in 2d-array
     */
    get3DVertices() {
        const vertices2D = this.get2DVertices();
        if (vertices2D.length === 0) {
            return [];
        }
        const vertices = [];
        let lastPointUsed = 0;
        let lastPoint = null;
        let correctLerpLength;
        for (let i = 0, l = vertices2D.length; i < (l / 2) - 1; i += 1) {
            lastPointUsed = i;
            const point1 = new THREE.Vector2(vertices2D[i][0], vertices2D[i][1]);
            const point2 = new THREE.Vector2(vertices2D[i + 1][0], vertices2D[i + 1][1]);
            const lerp1Info = {
                lerpValue: 0,
                parentObject: getTopCommonModelBelowVertices([[point1.x, point1.y]], this.stage)[0],
            };
            const lerp2Info = {
                lerpValue: 1,
                parentObject: getTopCommonModelBelowVertices([[point2.x, point2.y]], this.stage)[0],
            };
            const totalLength = point1.distanceTo(point2);
            const lerpValues = [];
            const isPoint1InParapet = lerp1Info.parentObject instanceof PolygonModel && checkPointInsideVertices(lerp1Info.parentObject.get2DVertices(), [point1.x, point1.y]) && !checkPointInsideVertices(lerp1Info.parentObject.getParapet2DVertices(), [point1.x, point1.y]);
            const isPoint2InParapet = lerp2Info.parentObject instanceof PolygonModel && checkPointInsideVertices(lerp2Info.parentObject.get2DVertices(), [point2.x, point2.y]) && !checkPointInsideVertices(lerp2Info.parentObject.getParapet2DVertices(), [point2.x, point2.y]);
            pointOnParapet1 = isPoint1InParapet;
            pointOnParapet2 = isPoint2InParapet;

            Cable.get3DVerticesBetween2Points(
                [point1, point2], totalLength, lerp1Info, lerp2Info, lerpValues,
            );
            lerpValues.sort((a, b) => a.lerpValue - b.lerpValue);
            correctLerpLength = lerpValues.length;
            vertices.push([
                point1.x,
                point1.y,
                lerp1Info.parentObject.getZOnTopSurface(point1.x, point1.y) + acCableRadius
                + (pointOnParapet1 ? lerp1Info.parentObject.getParapetHeight() : 0),
            ]);
            for (let j = 0, len = lerpValues.length; j < len; j += 1) {
                const vertex = new THREE.Vector2().lerpVectors(point1, point2, lerpValues[j].lerpValue);
                vertices.push([
                    vertex.x,
                    vertex.y,
                    lerpValues[j].parentObject.getZOnTopSurface(vertex.x, vertex.y) + acCableRadius
                    + (lerpValues[j].addParaphetHeight ? lerpValues[j].parentObject.getParapetHeight() : 0),
                ]);
            }
            lastPoint = [
                point2.x,
                point2.y,
                lerp2Info.parentObject.getZOnTopSurface(point2.x, point2.y) + acCableRadius +
                (pointOnParapet2 ? lerp2Info.parentObject.getParapetHeight() : 0),
            ];
        }
        vertices.push(lastPoint);
        for (let i = lastPointUsed + 2, l = vertices2D.length; i < l - 1; i += 1) {
            const point1 = new THREE.Vector2(vertices2D[i][0], vertices2D[i][1]);
            const point2 = new THREE.Vector2(vertices2D[i + 1][0], vertices2D[i + 1][1]);
            const lerp1Info = {
                lerpValue: 0,
                parentObject: getTopCommonModelBelowVertices([[point1.x, point1.y]], this.stage)[0],
            };
            const lerp2Info = {
                lerpValue: 1,
                parentObject: getTopCommonModelBelowVertices([[point2.x, point2.y]], this.stage)[0],
            };
            const totalLength = point1.distanceTo(point2);
            const lerpValues = [];
            const isPoint1InParapet = lerp1Info.parentObject instanceof PolygonModel && checkPointInsideVertices(lerp1Info.parentObject.get2DVertices(), [point1.x, point1.y]) && !checkPointInsideVertices(lerp1Info.parentObject.getParapet2DVertices(), [point1.x, point1.y]);
            const isPoint2InParapet = lerp2Info.parentObject instanceof PolygonModel && checkPointInsideVertices(lerp2Info.parentObject.get2DVertices(), [point2.x, point2.y]) && !checkPointInsideVertices(lerp2Info.parentObject.getParapet2DVertices(), [point2.x, point2.y]);
            pointOnParapet1 = isPoint1InParapet;
            pointOnParapet2 = isPoint2InParapet;
            
            Cable.get3DVerticesBetween2Points(
                [point1, point2], totalLength, lerp1Info, lerp2Info, lerpValues,
            );
            lerpValues.sort((a, b) => a.lerpValue - b.lerpValue);
            vertices.push([
                point1.x,
                point1.y,
                lerp1Info.parentObject.getZOnTopSurface(point1.x, point1.y) + acCableRadius
                + (pointOnParapet1 ? lerp1Info.parentObject.getParapetHeight() : 0),
            ]);
            for (let j = 0, len = lerpValues.length; j < len; j += 1) {
                const vertex = new THREE.Vector2().lerpVectors(point1, point2, lerpValues[j].lerpValue);
                vertices.push([
                    vertex.x,
                    vertex.y,
                    lerpValues[j].parentObject.getZOnTopSurface(vertex.x, vertex.y) + acCableRadius
                    + (lerpValues[j].addParaphetHeight ? lerpValues[j].parentObject.getParapetHeight() : 0),
                ]);
            }
            lastPoint = [
                point2.x,
                point2.y,
                lerp2Info.parentObject.getZOnTopSurface(point2.x, point2.y) + acCableRadius
                + (pointOnParapet2 ? lerp2Info.parentObject.getParapetHeight() : 0),
            ];
        }
        vertices.push(lastPoint);
        return vertices;
    }

    /**
     * 
     * @param { in vector2 form} vertices
     * @param {} totalLength
     * @param {*} lerp1Info
     * @param {*} lerp2Info
     * @param {The result array} resultLerpValues
     */
    
    static get3DVerticesBetween2Points(vertices, totalLength, lerp1Info, lerp2Info, resultLerpValues) {
        const point1 = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], lerp1Info.lerpValue);
        const point2 = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], lerp2Info.lerpValue);
        const edge = [point1, point2];
        let parent = null;
        let crossing = NO_CROSSING;
        let intersectionPointsLerpValue = [];
        if (lerp1Info.parentObject === lerp2Info.parentObject) {
            parent = lerp1Info.parentObject;
            Cable.checkIntersectionWithChildren(intersectionPointsLerpValue, parent, edge, vertices);
            Cable.checkIntersectionWithParent(intersectionPointsLerpValue, parent, edge, vertices);
        }
        else {
            const parent1 = lerp1Info.parentObject;
            const parent2 = lerp2Info.parentObject;
            Cable.checkIntersectionWithChildren(intersectionPointsLerpValue, parent1, edge, vertices);
            Cable.checkIntersectionWithChildren(intersectionPointsLerpValue, parent2, edge, vertices);
            Cable.checkIntersectionWithParent(intersectionPointsLerpValue, parent1, edge, vertices);
            Cable.checkIntersectionWithParent(intersectionPointsLerpValue, parent2, edge, vertices);

        }
        intersectionPointsLerpValue = _.uniqBy(intersectionPointsLerpValue, 'lerpValue');
        intersectionPointsLerpValue.sort((a, b) => a.lerpValue - b.lerpValue);
        if (intersectionPointsLerpValue.length) {
            let firstPoint = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], lerp1Info.lerpValue);
            let secondPoint = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], intersectionPointsLerpValue[0].lerpValue);
            let firstPointZ = lerp1Info.parentObject.getZOnTopSurface(firstPoint.x, firstPoint.y);
            let secondPointZ = intersectionPointsLerpValue[0].parentObject.getZOnTopSurface(secondPoint.x, secondPoint.y);
            let previousParent;
            let prevCrossing = DOWN_CROSSING;
            if (intersectionPointsLerpValue[0].isParapet) {
                if (!pointOnParapet1) {
                    crossing = UP_CROSSING;
                }
                else {
                    crossing = DOWN_CROSSING;
                }
            }
            else if (firstPointZ < secondPointZ) {
                crossing = UP_CROSSING;
            }
            else {
                crossing = DOWN_CROSSING;
            }

            if (crossing === UP_CROSSING) {
                const lowerPoint = {
                    lerpValue: intersectionPointsLerpValue[0].lerpValue - ((acCableRadius + 0.001) / totalLength),
                    parentObject: intersectionPointsLerpValue[0].isParapet ? intersectionPointsLerpValue[0].parentObject : intersectionPointsLerpValue[0].parentObject.getParent(),
                    addParaphetHeight: false,
                };
                resultLerpValues.push(lowerPoint);
                const upperPoint = {
                    lerpValue: intersectionPointsLerpValue[0].lerpValue - (acCableRadius / totalLength),
                    parentObject: intersectionPointsLerpValue[0].parentObject,
                    addParaphetHeight: true,
                };
                resultLerpValues.push(upperPoint);
            }
            else {
                const lowerPoint = {
                    lerpValue: intersectionPointsLerpValue[0].lerpValue + ((acCableRadius + 0.001) / totalLength),
                    parentObject: intersectionPointsLerpValue[0].isParapet ? intersectionPointsLerpValue[0].parentObject : intersectionPointsLerpValue[0].parentObject.getParent(),
                    addParaphetHeight: false,
                };
                resultLerpValues.push(lowerPoint);
                const upperPoint = {
                    lerpValue: intersectionPointsLerpValue[0].lerpValue + (acCableRadius / totalLength),
                    parentObject: intersectionPointsLerpValue[0].parentObject,
                    addParaphetHeight: true,
                };
                resultLerpValues.push(upperPoint);
            }
            previousParent = intersectionPointsLerpValue[0];
            prevCrossing = crossing;
            for (let i = 1, l = intersectionPointsLerpValue.length; i < l; i += 1) {
                firstPoint = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], previousParent.lerpValue);
                secondPoint = new THREE.Vector2().lerpVectors(vertices[0], vertices[1], intersectionPointsLerpValue[i].lerpValue);
                firstPointZ = previousParent.parentObject.getZOnTopSurface(firstPoint.x, firstPoint.y);
                secondPointZ = intersectionPointsLerpValue[i].parentObject.getZOnTopSurface(secondPoint.x, secondPoint.y);
                if (intersectionPointsLerpValue[i].isParapet
                    || (previousParent.parentObject === intersectionPointsLerpValue[i].parentObject)
                    || firstPointZ === secondPointZ) {
                    if (prevCrossing === DOWN_CROSSING) {
                        crossing = UP_CROSSING;
                    }
                    else {
                        crossing = DOWN_CROSSING;
                    }
                }
                else if (firstPointZ < secondPointZ) {
                    crossing = UP_CROSSING;
                }
                else {
                    crossing = DOWN_CROSSING;
                }

                if (crossing === UP_CROSSING) {
                    const lowerPoint = {
                        lerpValue: intersectionPointsLerpValue[i].lerpValue - ((acCableRadius + 0.001) / totalLength),
                        parentObject: intersectionPointsLerpValue[i].isParapet ? intersectionPointsLerpValue[i].parentObject : intersectionPointsLerpValue[i].parentObject.getParent(),
                        addParaphetHeight: false,
                    };
                    resultLerpValues.push(lowerPoint);
                    const upperPoint = {
                        lerpValue: intersectionPointsLerpValue[i].lerpValue - (acCableRadius / totalLength),
                        parentObject: intersectionPointsLerpValue[i].parentObject,
                        addParaphetHeight: true,
                    };
                    resultLerpValues.push(upperPoint);
                }
                else {
                    const lowerPoint = {
                        lerpValue: intersectionPointsLerpValue[i].lerpValue + ((acCableRadius + 0.001) / totalLength),
                        parentObject: intersectionPointsLerpValue[i].isParapet ? intersectionPointsLerpValue[i].parentObject : intersectionPointsLerpValue[i].parentObject.getParent(),
                        addParaphetHeight: false,
                    };
                    resultLerpValues.push(lowerPoint);
                    const upperPoint = {
                        lerpValue: intersectionPointsLerpValue[i].lerpValue + (acCableRadius / totalLength),
                        parentObject: intersectionPointsLerpValue[i].parentObject,
                        addParaphetHeight: true,
                    };
                    resultLerpValues.push(upperPoint);
                }
                previousParent = intersectionPointsLerpValue[i];
                prevCrossing = crossing;
            }
        }
    }

    static checkIntersectionWithChildren(intersectionPointsLerpValue, parent, edge, vertices) {
        if (parent instanceof PolygonModel || parent instanceof CylinderModel) {
            const parentEdges = parent.getEdges();
            for (let j = 0, len = parentEdges.length; j < len; j += 1) {
                const intersection = lineIntersection(edge, parentEdges[j]);
                if (intersection.intersect) {
                    intersectionPointsLerpValue.push({
                        lerpValue: getLerpValueFromVertices(vertices, intersection.point),
                        parentObject: parent,
                    });
                }
            }
            if (parent.parapetHeight) {
                const parapetEdges = parent.getParapetEdges();
                for (let j = 0, len = parapetEdges.length; j < len; j += 1) {
                    const intersection = lineIntersection(edge, parapetEdges[j]);
                    if (intersection.intersect) {
                        intersectionPointsLerpValue.push({
                            lerpValue: getLerpValueFromVertices(vertices, intersection.point),
                            parentObject: parent,
                            isParapet: true,
                        });
                    }
                }
            }
        }
        const children = parent.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            Cable.checkIntersectionWithChildren(intersectionPointsLerpValue, children[i], edge, vertices);
        }
    }

    static checkIntersectionWithParent(intersectionPointsLerpValue, children, edge, vertices) {
        if (children instanceof PolygonModel || children instanceof CylinderModel) {
            const parentEdges = children.getEdges();
            for (let j = 0, len = parentEdges.length; j < len; j += 1) {
                const intersection = lineIntersection(edge, parentEdges[j]);
                if (intersection.intersect) {
                    intersectionPointsLerpValue.push({
                        lerpValue: getLerpValueFromVertices(vertices, intersection.point),
                        parentObject: children,
                    });
                }
            }
            if (children.parapetHeight) {
                const parapetEdges = children.getParapetEdges();
                for (let j = 0, len = parapetEdges.length; j < len; j += 1) {
                    const intersection = lineIntersection(edge, parapetEdges[j]);
                    if (intersection.intersect) {
                        intersectionPointsLerpValue.push({
                            lerpValue: getLerpValueFromVertices(vertices, intersection.point),
                            parentObject: children,
                            isParapet: true,
                        });
                    }
                }
            }
        }
        const parent = children.getParent();
        if (parent instanceof PolygonModel || parent instanceof CylinderModel) {
            Cable.checkIntersectionWithParent(intersectionPointsLerpValue, parent, edge, vertices);
        }
    }

    /**
     * returns the lerp values for the consideration
     * of paraphet
     * @param {*} totalLength
     * @param {*} edgePointLerpInfo
     * @param {*} crossing
     * @param {*} resultLerpValues
     */
    static addPointsForParaphet(totalLength, edgePointLerpInfo, crossing, resultLerpValues) {
        let factor = 1;
        if (crossing === DOWN_CROSSING) {
            factor = -1;
        }
        const paraphetLerpValue = edgePointLerpInfo.lerpValue
            + (((acCableRadius / totalLength) + (edgePointLerpInfo.parentObject.getParapetThickness() / totalLength)) * factor);
        
        // for lower point
        resultLerpValues.push({
            lerpValue: paraphetLerpValue + ((0.001 / totalLength) * factor),
            parentObject: edgePointLerpInfo.parentObject,
            addParaphetHeight: false,
        });
        // for upper point
        resultLerpValues.push({
            lerpValue: paraphetLerpValue,
            parentObject: edgePointLerpInfo.parentObject,
            addParaphetHeight: true,
        });
    }

    /**
     *
     * @param {array of vector2} drawingVertices
     */
    get2DVertices(drawingVertices = []) {
        const directVertices = [];
        const calculatedVertices = [];
        if (drawingVertices.length > 1) {
            for (let i = 0, l = drawingVertices.length; i < l - 1; i += 1) {
                const rectangleVertices = this.get2DVerticesUsing2Points(
                    drawingVertices[i],
                    drawingVertices[i + 1],
                );
                directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
            }
        }
        else {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                const rectangleVertices = this.get2DVerticesUsing2Points(
                    this.outlinePoints[i].getPosition(),
                    this.outlinePoints[i + 1].getPosition(),
                );
                directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
            }
        }
        let final1 = [];
        for (let i = 0;i < directVertices.length;i++)
        {
            if (directVertices[i] !== undefined)
            {
                final1.push(directVertices[i]);
            }
        }
        let final2 = [];
        for (let i = 0;i < calculatedVertices.length;i++)
        {
            if (calculatedVertices[i] !== undefined)
            {
                final2.push(calculatedVertices[i]);
            }
        }
        return Handrail.getOuterVerticesInSequence(final1, final2);
    }

    get2DEdgeCentres() {
        const vertices = [];
        for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
            vertices.push([
                this.edgeCentrePoints[i].getPosition().x,
                this.edgeCentrePoints[i].getPosition().y,
            ]);
        }
        return vertices;
    }

    /**
     *
     * @param { in vector2 form} vertexA
     * @param {* in vector2 form} vertexB
     */
    get2DVerticesUsing2Points(vertexA = null, vertexB = null) {
        const vertex1 = vertexA;
        const vertex2 = vertexB;
        if (vertex1 == null || vertex2 == null) {
            console.error('Wrong vertices passed in get2DVerticesUsing2Points');
        }
        if (vertex1.distanceTo(vertex2) === 0) {
            return [];
        }
        let vertex3;
        let vertex4;
        if (this.getParent() === null || this.getParent() === undefined ||
            this.getParent() instanceof Ground || this.getParent().getTilt() === 0) {
            const vertices = getNormalPoints(
                vertex1,
                vertex2,
                acCableRadius * 2,
                this.CableDirection === DEFAULT_VERTICES_DIRECTION ?
                    DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
            );
            if (vertices === null) {
                return [
                    [vertex1.x, vertex1.y],
                    [vertex2.x, vertex2.y],
                ];
            }
            [vertex3, vertex4] = vertices;
        }
        else {
            vertex1.z = this.getParent().getZOnTopSurface(vertex1.x, vertex1.y);
            vertex2.z = this.getParent().getZOnTopSurface(vertex2.x, vertex2.y);
            [vertex3, vertex4] = getNormalPointsWithTiltedParent(
                this.getParent().get3DVertices(),
                vertex1,
                vertex2,
                acCableRadius * 2,
                this.CableDirection === DEFAULT_VERTICES_DIRECTION ?
                    DEFAULT_WALKWAY_DIRECTION : ALTERNATE_WALKWAY_DIRECTION,
            );
        }
        return [
            [vertex1.x, vertex1.y],
            [vertex2.x, vertex2.y],
            [vertex4.x, vertex4.y],
            [vertex3.x, vertex3.y],
        ];
    }

    // Getters
    /**
     * get the placing information, returns the error if cannot place or
     * the parent if the object can be placed.
     * @param { drawing vertices when called during drawing} drawingVertices
     */
    getPlacingInformation(drawingVertices) {
        let rawVertices = drawingVertices;
        let vertices = drawingVertices;

        const response = {};
        let parentExists = true;
        let polygonExists = true;
        let numberOfPoints = 0;
        response.errors = [];
        response.pointUnplaceableError = null;

        if (vertices !== null && vertices !== undefined) {
            if (vertices.length - 1 < MINIMUM_NUMBER_OF_POINTS) {
                const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
                response.cannotCompleteError = error;
                response.errors.push(error);
                parentExists = false;
                polygonExists = false;
            }

            if (polygonExists) {
                vertices = [];
                for (let i = 0, l = drawingVertices.length; i < l; i += 1) {
                    vertices.push(new THREE.Vector3(drawingVertices[i][0], drawingVertices[i][1]));
                }
                vertices = this.get2DVertices(vertices);
                if (vertices.length === 0) {
                    polygonExists = false;
                }
            }
            numberOfPoints = vertices.length - 1;
        }
        else {
            vertices = this.get2DVertices();
            numberOfPoints = vertices.length;
        }

        if (numberOfPoints < MINIMUM_NUMBER_OF_POINTS) {
            const error = new Error(LESS_VERTICES_THAN_NEEDED_FOR_DRAWING_ERROR);
            response.cannotCompleteError = error;
            response.errors.push(error);
        }

        if (!areVerticesOnGround(vertices, this.stage)) {
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }
        const erodedVertices = setbackPolygon(vertices, -0.001);
        // if (currentParent !== null && currentParent !== undefined && erodedVertices.length > 3
        //     && !checkPolygonInsidePolygon(erodedVertices, currentParent.get2DVertices())) {
        //     const error = new Error(OUT_OF_BASE_MODEL_ERROR);
        //     response.errors.push(error);
        //     response.pointUnplaceableError = error;
        //     parentExists = false;
        // }
        // if (currentParent !== null && currentParent !== undefined && erodedVertices.length > 3
        //     && checkIntersectionWithSiblings(currentParent, this, erodedVertices)) {
        //     const error = new Error(MODEL_INTERSECTION_WITH_OTHER_MODELS);
        //     response.errors.push(error);
        //     response.pointUnplaceableError = error;
        //     parentExists = false;
        // }
        if (rawVertices === undefined) {
            rawVertices = vertices;
        }
        if (polygonExists && checkLastEdgeIntersectionWithEdges(rawVertices)) {
            const error = new Error(LAST_EDGE_INTERSECTION_ERROR);
            response.errors.push(error);
            parentExists = false;
            polygonExists = false;
            response.pointUnplaceableError = error;
        }
        if (polygonExists && checkIfLastVertexOnEdges(vertices)) {
            const error = new Error(VERTEX_OVER_EDGE_ERROR);
            response.errors.push(error);
            parentExists = false;
            response.pointUnplaceableError = error;
        }

        if (polygonExists && checkVertexEquivalency(vertices)) {
            const error = new Error(VERTEX_EQUIVALENT_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
            parentExists = false;
        }

        if (parentExists) {
            if (erodedVertices.length === 0) {
                response.errors.push(new Error(POLYGON_WITH_NO_AREA_ERROR));
                parentExists = false;
            }
            if (parentExists) {
                erodedVertices.splice(2, 2);
                [response.parent] = getTopCommonModelBelowVertices(erodedVertices, this.stage);
            }
        }
        return response;
    }

    getParent() {
        return this.parent;
    }

    getId() {
        return this.id;
    }

    getPosition() {
        const { cumulativeX, cumulativeY, cumulativeZ } = this.get3DVertices().reduce(
            (acc, vertex) => {
                return {
                    cumulativeX: acc.cumulativeX + vertex[0],
                    cumulativeY: acc.cumulativeY + vertex[1],
                    cumulativeZ: acc.cumulativeZ + vertex[2],
                };
            },
            {
                cumulativeX: 0,
                cumulativeY: 0,
                cumulativeZ: 0,
            },
        );
        return new THREE.Vector3(
            cumulativeX / this.numVertices,
            cumulativeY / this.numVertices,
            cumulativeZ / this.numVertices,
        );
    }

    updateGeometry() {
        const vertices2DArray = this.get2DVertices();
        // this.midEnd = this.midEndPoints(vertices2DArray);
        const vertices2DVectorToArray = convertArrayTo3DVector(vertices2DArray);
        // const numVertices = vertices2DArray.length;
        const geometry = new NikGeometry(this.stage);
        const coreGeometry = geometry.createFromPoints(vertices2DVectorToArray, this.coreHeight || 0.02);

        // const highestZ = getHighestZ(this.stage.ground);

        // for (let i = 0; i < numVertices; i++) {
        //     const vertex = coreGeometry.vertices[i];
        //     vertex.z = highestZ;
        // }

        // for (let i = numVertices; i < 2 * numVertices; i++) {
        //     const vertex = coreGeometry.vertices[i];
        //     vertex.z = highestZ + acCableRadius;
        // }

        // updating outline points height
        let constantForParapetAccommodation = 0;
        if (this.getParent() instanceof PolygonModel && this.getParent().isParapetPresent()) {
            constantForParapetAccommodation += this.getParent().getParapetHeight();
        }
        for (const outlinePoint of this.outlinePoints) {
            const position = outlinePoint.getPosition();
            outlinePoint.moveObjectWithoutConsequences(
                0,
                0,
                this.getParent().getZOnTopSurface(position.x, position.y) + acCableRadius + constantForParapetAccommodation - position.z,
            );
        }

        // updating meshes and edges
        this.coreMesh.geometry = coreGeometry;
        this.coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);

        // update measurement
        this.updateMeasurement();

        this.update3DAcCable();
    }

    // midEndPoints(points) {
    //     const noOfPoints = points.length;
    //     const leftEnd = [];
    //     leftEnd.push((points[0][0]+points[noOfPoints-1][0])/2);
    //     leftEnd.push((points[0][1]+points[noOfPoints-1][1])/2);
    //     const rightEnd = [];
    //     rightEnd.push((points[Math.ceil(noOfPoints/2)-1][0]+points[Math.ceil(noOfPoints/2)][0])/2);
    //     rightEnd.push((points[Math.ceil(noOfPoints/2)-1][1]+points[Math.ceil(noOfPoints/2)][1])/2);
    //     return [leftEnd, rightEnd];
    // }

    update3DAcCable(vertices3D = this.get3DVertices()) {
        // remove old meshes
        while (this.objectGroupFor3D.children.length > 0) {
            this.objectGroupFor3D.remove(this.objectGroupFor3D.children[0]);
        }
        const verticesLength = vertices3D.length;
        for (let i = 0, l = vertices3D.length / 2; i < l - 1; i += 1) {
            this.update3DAcCableBetween2Points([
                vertices3D[i],
                vertices3D[i + 1],
                vertices3D[verticesLength - i - 2],
                vertices3D[verticesLength - i - 1],
            ], i === 0);
        }
    }

    update3DAcCableBetween2Points(vertices) {
        // const vertices = this.get3DVertices();
        // 01 cross 03
        const v1 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[1][0], vertices[1][1], vertices[1][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        const v2 = new THREE.Vector3().subVectors(
            new THREE.Vector3(vertices[3][0], vertices[3][1], vertices[3][2]),
            new THREE.Vector3(vertices[0][0], vertices[0][1], vertices[0][2]),
        );
        v1.cross(v2);
        v1.normalize(); // v1 is the normal unit vector to the parent surface.

        const leftCenterPoint = new THREE.Vector3(
            (vertices[0][0] + vertices[3][0]) / 2,
            (vertices[0][1] + vertices[3][1]) / 2,
            ((vertices[0][2] + vertices[3][2]) / 2),
        );
        const rightCenterPoint = new THREE.Vector3(
            (vertices[1][0] + vertices[2][0]) / 2,
            (vertices[1][1] + vertices[2][1]) / 2,
            ((vertices[1][2] + vertices[2][2]) / 2),
        );

        const horizontalLineCylinderPoints = {
            basePoint: leftCenterPoint.clone(),
            upPoint: rightCenterPoint.clone(),
        };
        // horizontal line at the top
        let geometry = []
        geometry.push(...this.createHorizontalCylinderMesh(
            horizontalLineCylinderPoints.basePoint,
            horizontalLineCylinderPoints.upPoint,
            acCableRadius,
        ));

        const material = new THREE.MeshLambertMaterial({ color: 0x808080});

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometry);

        const lineSegmentsMesh = new THREE.LineSegments(mergedGeometry, new THREE.LineBasicMaterial({
            linewidth: 2,
            color: 0x404040,
        }));
        const mergedMesh = createMesh(mergedGeometry, material);
        this.merged3d = mergedMesh;
        this.objectGroupFor3D.add(lineSegmentsMesh);
        this.objectGroupFor3D.add(mergedMesh);

    }

    createHorizontalCylinderMesh(endpoint1, endpoint2, radius = 0.05) {
        const origin = new THREE.Vector3(
            (endpoint1.x + endpoint2.x) / 2,
            (endpoint1.y + endpoint2.y) / 2,
            (endpoint1.z + endpoint2.z) / 2,
        );
        const height = endpoint1.distanceTo(endpoint2);
        const direction = new THREE.Vector3();
        direction.subVectors(endpoint2, endpoint1).normalize();
        const geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 8);
        const yAxis = new THREE.Vector3(0, 1, 0);
        yAxis.normalize();
        let rotationAxis = new THREE.Vector3();
        rotationAxis.crossVectors(direction,yAxis);
        rotationAxis.normalize();
        let theta=-Math.acos(direction.dot(yAxis));
        let rotMatrix=new THREE.Matrix4();
        rotMatrix.makeRotationAxis(rotationAxis, theta);
        geometry.applyMatrix4(rotMatrix);
        geometry.translate(origin.x, origin.y, origin.z);
        return [geometry]; 
    }

    toggleDirectionDuringCreation() {
        if (this.CableDirection === DEFAULT_VERTICES_DIRECTION) {
            this.CableDirection = ALTERNATE_VERTICES_DIRECTION;
        }
        else if (this.CableDirection === ALTERNATE_VERTICES_DIRECTION) {
            this.CableDirection = DEFAULT_VERTICES_DIRECTION;
        }
    }

    toggleDirection() {
        if (this.CableDirection === DEFAULT_VERTICES_DIRECTION) {
            this.CableDirection = ALTERNATE_VERTICES_DIRECTION;
        }
        else if (this.CableDirection === ALTERNATE_VERTICES_DIRECTION) {
            this.CableDirection = DEFAULT_VERTICES_DIRECTION;
        }

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setHandrailOutOfGroundRemoved();
            }
            if (error.message === OUT_OF_BASE_MODEL_ERROR) {
                this.stage.eventManager
                    .customErrorMessage('Handrail: ' + OUT_OF_BASE_MODEL_ERROR);
            }
            this.removeObject();
            return;
        }

        this.updateGeometry();

        this.updateMeasurement();

        const notificationObject = this.stage.eventManager.setHandrailLoading();

        try {
            this.handleSiblingConsequences();
        }
        catch (error) {
            console.error('HANDRAIL: toggleDirection: handling sibling consequences failed', error);
        }
        finally {
            this.stage.eventManager.completeHandrailLoading(notificationObject);
        }

        this.saveState();

        return true;
    }

    /**
     * moves the object with displacement (x,y,z)
     * @param {* movement in x} deltaX
     * @param {* movement in y} deltaY
     * @param {* movement in z} deltaZ
     */
    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        this.coreMesh.geometry.translate(deltaX, deltaY, deltaZ);
        this.coreEdges.geometry.translate(deltaX, deltaY, deltaZ);

        // update outline points without consequences
        this.outlinePoints.forEach(outlinePoint => {
            outlinePoint.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        });

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        this.onlyUpdateMeasurement();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        this.saveState();
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        for (let i = 0, l = this.outlinePoints.length; i < l; i += 1) {
             // update edgeCentrePoints
             const edgePointX = this.edgeCentrePoints[i].getPosition().x;
             const edgePointY = this.edgeCentrePoints[i].getPosition().y;
             const edgeDeltaXY = utils.rotationAroundPoint(
                 centroidPoint.x,
                 centroidPoint.y,
                 edgePointX,
                 edgePointY,
                 angleInRad,
             );
 
             this.edgeCentrePoints[i].moveObjectWithoutConsequences(
                 edgeDeltaXY[0] - edgePointX,
                 edgeDeltaXY[1] - edgePointY,
             );

            // update outlinepoints
            const outlinePointX = this.outlinePoints[i].getPosition().x;
            const outlinePointY = this.outlinePoints[i].getPosition().y;
            const outlineDeltaXY = rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                outlinePointX,
                outlinePointY,
                angleInRad,
            );

            this.outlinePoints[i].moveObjectWithoutConsequences(
                outlineDeltaXY[0] - outlinePointX,
                outlineDeltaXY[1] - outlinePointY,
            );
        }
        this.updateGeometry();

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].rotateObjectHelper(angleInRad, centroidPoint);
        }
    }

    async placeObject(deltaX = 0, deltaY = 0) {
        // move object
        this.moveObject(deltaX, deltaY, 0);

        // check if place object possible
        const placingInformation = this.getPlacingInformation();

        if (placingInformation.errors.length !== 0) {
            const error = placingInformation.errors[0];
            if (error.message === OUT_OF_GROUND_ERROR) {
                this.stage.eventManager.setHandrailOutOfGroundRemoved();
            }
            else if (error.message === VERTEX_EQUIVALENT_ERROR) {
                this.stage.eventManager.walkwayVertexEquivalentError();
            }
            this.removeObject();
            return Promise.reject(placingInformation.error);
        }

        this.changeParent(placingInformation.parent);

        this.updateGeometry();

        // update dimensions
        for(let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        return true;
    }

    // Measurement functions

    updateMeasurement() {
        if (this.lengthMeasurements !== []) {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].remove();
            }
            this.lengthMeasurements = [];
        }

        if (this.CableDirection === DEFAULT_VERTICES_DIRECTION) {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                this.lengthMeasurements.push(new LengthMeasurement(
                    this.outlinePoints[i],
                    this.outlinePoints[i + 1],
                    this.stage,
                    this,
                ));
            }
        }
        else if (this.CableDirection === ALTERNATE_VERTICES_DIRECTION) {
            for (let i = 0, l = this.outlinePoints.length; i < l - 1; i += 1) {
                this.lengthMeasurements.push(new LengthMeasurement(
                    this.outlinePoints[i + 1],
                    this.outlinePoints[i],
                    this.stage,
                    this,
                ));
            }
        }

        if (this.stage.selectionControls.getSelectedObject() === this) {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].show();
                this.lengthMeasurements[i].update();
            }
        }
        else {
            for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
                this.lengthMeasurements[i].hide();
            }
        }
    }

    onlyUpdateMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].update();
        }
    }

    showMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].show();
            this.lengthMeasurements[i].update();
        }
    }

    hideMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].hide();
        }
    }

    removeMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].remove();
        }
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.WALKWAY;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }
    // visual functions

    switchMaterialState(newMaterialState, recursive) {
        super.switchMaterialState(newMaterialState, recursive);
        if (this.stage.visualManager.getIn3D() && !this.stage.sldView) {
            this.switchTo3D();
        }
        else {
            this.switchTo2D();
        }
    }

    switchTo3D() {
        this.objectsGroup.remove(this.coreMesh);
        this.objectsGroup.remove(this.coreEdges);
        this.objectsGroup.add(this.objectGroupFor3D);
        // Jugaad
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
        this.hideEdgeCenters();
    }

    switchTo2D() {
        this.objectsGroup.add(this.coreMesh);
        this.objectsGroup.add(this.coreEdges);
        this.objectsGroup.remove(this.objectGroupFor3D);
        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }
    }
    get mesh() {
        return this.coreMesh;
    }
    get mesh2D() {
        return this.coreMesh;
    }
    get mesh3D() {
        return this.merged3d;
    }
    
    get mergeMeshMaterial2D() {
        return this.meshMaterial2D;
    }
 
    get mergeEdgeMaterial2D() {
        return this.edgeMaterial2D;
    }
    
    handleDragStart() {
        // this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    async handleDragEnd() {
        const notificationObject = this.stage.eventManager.setHandrailLoading();
        try {
            await this.placeObject();
            this.stage.eventManager.completeHandrailLoading(notificationObject);
        }
        catch (error) {
            console.error('ERROR HANDRAIL: handleDragEnd failed', error);
            this.stage.eventManager.completeHandrailLoading(notificationObject);
            throw error;
        }
    }

    handleDragCancel() {
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    handleVertexDragStart(vertex){
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Cable: vertex not in outlinePoints in handleVertexDragStart');
        }
        // this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleVertexMove(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Cable: vertex not in outlinePoints in handleVertexMove');
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


        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        if (this.outlinePoints.indexOf(vertex) < 0) {
            console.error('ERROR: Handrail: vertex not in outlinePoints in handleVertexMove');
        }

        const notificationObject = this.stage.eventManager.setHandrailLoading();

        try {
            await this.placeObject();

            // this.lengthMeasurement.setMovableVertex(vertex);

            // remove dimensions if not over edge and update after resize
            for(let dimension in this.dimensionObjects) {
                this.dimensionObjects[dimension].handleAssociatedObjectUpdateGeometry(this);
            }

            this.stage.eventManager.completeHandrailLoading(notificationObject);

            this.stage.eventManager.setObjectsSelected(this);

            this.saveState();
        }
        catch (error) {
            console.error('ERROR Walkway: handleVertexPlace failed', error);
            this.stage.eventManager.completeHandrailLoading(notificationObject);
            throw error;
        }
    }

    handleEdgeCenterDragStart(vertex) {
        const idx = this.edgeCentrePoints.indexOf(vertex);
        const movedPoint = this.edgeCentrePoints[idx].getPosition();

        this.outlinePoints.splice(
            idx + 1, 0,
            new OutlinePoints(
                movedPoint.x,
                movedPoint.y,
                movedPoint.z,
                this,
                this.stage,
            ),
        );

        const nextIndex = idx + 2 < this.outlinePoints.length ? idx + 2 : 0;
        const prevPoint = this.outlinePoints[idx].getPosition();
        const currentPoint = this.outlinePoints[idx + 1].getPosition();
        const nextPoint = this.outlinePoints[nextIndex].getPosition();

        this.edgeCentrePoints.splice(
            idx, 0,
            new EdgeCentrePoints(
                (currentPoint.x + prevPoint.x) / 2,
                (currentPoint.y + prevPoint.y) / 2,
                (currentPoint.z + prevPoint.z) / 2,
                this,
                this.stage,
            ),
            new EdgeCentrePoints(
                (currentPoint.x + nextPoint.x) / 2,
                (currentPoint.y + nextPoint.y) / 2,
                (currentPoint.z + nextPoint.z) / 2,
                this,
                this.stage,
            ),
        );

    }

    handleEdgeCentreMove(vertex, delta) {
        const idx = this.edgeCentrePoints.indexOf(vertex);

        this.outlinePoints[idx - 1].moveObjectWithoutConsequences(delta.x, delta.y, delta.z);

        this.edgeCentrePoints[idx - 1]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);
        this.edgeCentrePoints[idx - 2]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleEdgeCentrePlace(vertex) {
        const idx = this.edgeCentrePoints.indexOf(vertex);
        let v = this.edgeCentrePoints[idx - 1];
        this.stage.dragControls.add(
            v,
            v.moveObject.bind(v),
            v.placeObject.bind(v),
            v.handleDragStart.bind(v),
        );

        v = this.edgeCentrePoints[idx - 2];
        this.stage.dragControls.add(
            v,
            v.moveObject.bind(v),
            v.placeObject.bind(v),
            v.handleDragStart.bind(v),
        );

        const [removedPoint] = this.edgeCentrePoints.splice(idx, 1);
        this.stage.dragControls.removeIfExists(removedPoint);
        removedPoint.removeObject();

        this.outlinePoints[idx - 1].showObject();
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
        // this.updateIntersectingCablesConduit(this.previousIntersectingAcCables);
        this.previousIntersectingAcCables = [];
        try {
            // place object
            await this.placeObject();

            // place its children if top surface changed, i.e., the model is tilted
            // await this.handleChildrenConsequences({
            //     resized: true,
            //     tiltChanged: this.getTilt() !== 0,
            // });

            // update measurement
            // this.polygonMeasurement.handleVertexDragEnd(this.outlinePoints[idx - 1]);

            // remove dimensions if not over edge and update after resize
            const keys = Object.keys(this.dimensionObjects);
            for (let i = 0, len = keys.length; i < len; i += 1) {
                this.dimensionObjects[keys[i]].handleAssociatedObjectUpdateGeometry(this);
            }

            // update SAP pane
            this.stage.eventManager.completeHandrailLoading(notificationObject);

            this.stage.eventManager.setObjectsSelected(this);

            this.saveState();

            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR Walkway: handleVertexPlace failed', error);
            this.stage.eventManager.completeHandrailLoading(notificationObject);
            throw error;
        }
    }


    async removeObject() {
        if(this instanceof AcCable ) {
            this.acdbAttached.cablesList.splice(this.acdbAttached.cablesList.indexOf(this),1);
            this.inverter.acCableAttached = null;
            this.inverter = null;
            this.acdbAttached = null;
        }
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.removeMeasurement();

        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }

        for (let j = 0, l = this.edgeCentrePoints.length; j < l; j += 1) {
            this.edgeCentrePoints[j].removeObject();
        }
        this.edgeCentrePoints = [];

        this.removeDimensions();
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
    }

    // Universal functions

    onSelect() {
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }

        // show measurements
        this.showMeasurement();

        // show edgecenters
        this.showEdgeCenters();

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );
        if (!this.stage.selectionControls.isMultiSelect()) {
            for (let v of this.outlinePoints) {
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v)
                );
            }
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                const v = this.edgeCentrePoints[i];
                this.stage.dragControls.add(
                    v,
                    v.moveObject.bind(v),
                    v.placeObject.bind(v),
                    v.handleDragStart.bind(v),
                );
            }
        }
    }

    isIgnored() {
        return false;
    }

    deSelect() {
        // hide outline points
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }

        // hide measurements
        this.hideMeasurement();

        // hide edge centers
        this.hideEdgeCenters();


    }

    hideEdgeCenters(override = false) {
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                this.edgeCentrePoints[i].hideObject();
        }
    }

    showEdgeCenters(override = false) {
            for (let i = 0, len = this.edgeCentrePoints.length; i < len; i += 1) {
                this.edgeCentrePoints[i].showObject();
            }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.showObject();
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].showObject();
        }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for (const outlinePoint of this.outlinePoints) {
            outlinePoint.hideObject();
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
    }

    showObjectLayer() {
        for(let child of this.objectsGroup.children){
            child.layers.enable(0);
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].showObject();
        }
        for(let child of this.objectGroupFor3D.children){
            child.layers.enable(0);
        }
    }

    hideObjectLayer() {
        for(let child of this.objectsGroup.children){
            child.layers.disable(0);
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
        for(let child of this.objectGroupFor3D.children){
            child.layers.disable(0);
        }
    }

    changePropertiesDuringCreation(properties) {

        // Here the values gets overridden by the change of values in Ac Cable properties.

        this.name = _.get(properties, 'name', this.name);
        this.materialType = _.get(properties, 'materialType', this.materialType);
        this.cores = _.get(properties, 'cores', this.cores);
        this.cableSizeAWG = _.get(properties, 'cableSizeAWG', this.cableSizeAWG);
        this.cableSizeMM = _.get(properties, 'cableSizeMM', this.cableSizeMM);

    }

    getLength() {
        let totalLength = 0;
        const vertices3d = convertArrayTo3DVector(this.get3DVertices());
        for (let i = 0; i < (vertices3d.length / 2) - 1; i++) {
            totalLength += vertices3d[i].distanceTo(vertices3d[i + 1]);
        }
        return totalLength;
    }
}
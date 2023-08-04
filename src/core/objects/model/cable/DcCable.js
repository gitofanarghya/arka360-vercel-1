import * as THREE from 'three';
import Cables from './Cables';
import EdgeCentrePoints from '../../subObjects/EdgeCentrePoints';
import {
    getTopCommonModelBelowVertices,
} from '../../../utils/raycastingUtils';
import { INVERTER_COLORS } from '../../visualConstants';
import OutlinePoints from '../../subObjects/OutlinePoints';
import LengthMeasurement from '../../subObjects/LengthMeasurement';
import PolygonModel from './../PolygonModel';
import Subarray from './../../subArray/Subarray';
import Handrail from './../Handrail';
import CylinderModel from './../CylinderModel';
import { getModels, getAllModelType } from '../../../utils/exporters';
import {
    convertArrayToVector,
    convertArrayTo3DVector,
    setbackPolygon,
    checkPolygonInsidePolygon,
    checkLineIntersection,
    checkPointInsideVertices,
    getSecondPoints,
    checkIfPointLiesOnLineSegment,
    getOutlinePoints,
    getHighestZ,
} from '../../../utils/utils';

import {
    CREATED_STATE,
    DELETED_STATE,
    OUT_OF_GROUND_ERROR,
    VERTEX_EQUIVALENT_ERROR,
} from '../../../coreConstants';
import Conduit from '../../ac/conduits/Conduit';
import DoubleConduit from '../../ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../../ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../../ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../../ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../../ac/cableTrays/DoubleSeparateCableTray';
import createBufferGeometry, { createMesh } from '../../../utils/meshUtils';
import NikGeometry from '../../ground/NikGeometry';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

const acCableRadius = 0.02;
let pointOnParapet1 = false;
let pointOnParapet2 = false;
export default class DcCable extends Cables {
    constructor(stage, inverter) {
        super(stage);
        // TODO- Add  changePropertiesDuringCreation function

        this.stage = stage;

        // this.objectColorMapping = this.getColorMapForObject();
        this.objectsGroup.container = this;
        // standard norms
        this.stage = stage;
        this.inverter = null;
        this.polarity = 'negative';
        this.cableLength = 0;
        this.stringSize = 0;
        this.attachedString = null;
        this.mpptIndex = 0;
        this.stringIndex = 0;
        this.conduit = null;
        this.attachedConduit = [];
        this.stringEnd = null;
        this.inverterEnd = null;
        this.ajbEnd = null;
        const defaultProperties = this.getDefaultProperties();
        this.setInitialProperties(defaultProperties);
        this.inverterId = 0;
        this.brokenOutlinePoints = [];

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
        this.merged3d = undefined;
        this.coreMesh = [];
        this.coreEdges = [];
        this.edgeCentrePoints = [];
    }

    setInverterId(inverterId) {
        this.inverterId = inverterId;
    }

    setInverterColor() {
        this.edgeMaterial2D.color.setHex(INVERTER_COLORS.Color[this.inverterId % INVERTER_COLORS.Color.length]);
    }

    setInitialProperties(properties) {
        // TODO-NOW
    }

    /**
     * Returns the default properties properties for handrail
     * For now they are hard-coded.
     */
    getDefaultProperties() {
        return {
            // TODO-NOW
        };
    }

    updateObject(properties) {
        const { cableLength, polarity, stringSize } = properties;
        if (cableLength && cableLength !== this.cableLength) {
            this.cableLength = cableLength;
        }
        if (polarity && polarity !== this.polarity) {
            updatePolarity(this);
        }
        if (stringSize && stringSize !== this.stringSize) {
            this.inverter.cableSize = stringSize;
            updateAllAttachedCable(this);
        }

        function updatePolarity(cable) {
            const cable1 = cable.attachedString.attachedDcCable[0];
            const cable2 = cable.attachedString.attachedDcCable[1];
            if (cable.id === cable1.id) {
                cable2.polarity = cable1.polarity;
                cable1.polarity = polarity;
            }
            else {
                cable1.polarity = cable2.polarity;
                cable2.polarity = polarity;
            }
        }

        function updateAllAttachedCable(cable) {
            for (let i = 0; i < cable.inverter.mppts.length; i++) {
                const strings = cable.inverter.mppts[i].strings;
                for (let j = 0; j < strings.length; j++) {
                    strings[j].attachedDcCable[0].stringSize = stringSize;
                    strings[j].attachedDcCable[1].stringSize = stringSize;
                }
            }
        }
    }

    getState() {
        const dcCableData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            inverterEnd: this.inverterEnd,
            ajbEnd: this.ajbEnd,
            stringEnd: this.stringEnd,
            stringId: this.attachedString != null ? this.attachedString.id : 0,
            conduit: this.attachedConduit.map(conduit => [
                conduit.uuid,
            ]),
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
        };

        const brokenOutlinePoints = [];
        for(const outlinePoints of this.brokenOutlinePoints) {
            const point = [];
            for (const outlinePoint of outlinePoints) {
                 point.push([
                    outlinePoint.getPosition().x,
                    outlinePoint.getPosition().y,
                    outlinePoint.getPosition().z,
                 ]);
            }
            brokenOutlinePoints.push(point);
        }

        dcCableData.brokenOutlinePoints = brokenOutlinePoints;

        return dcCableData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;
            this.inverterEnd = state.inverterEnd;
            this.ajbEnd = state.ajbEnd;
            this.stringEnd = state.stringEnd;
            this.attachedConduit = [];
            for (let i = 0; i < state.conduit.length; i++) {
                this.attachedConduit.push(this.stage.getObject(state.conduit[i]));
            }
            this.updateVisualsAfterLoadingAndCreation();

            const parentObject = this.stage.getObject(state.parent);
            if (parentObject && this.getParent() !== parentObject) {
                this.changeParent(parentObject);
            }

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                this.brokenOutlinePoints = [];
                for(const outlinePoints of state.brokenOutlinePoints) {
                    const point = [];
                    for (const outlinePoint of outlinePoints) {
                        point.push(
                            new OutlinePoints(
                                outlinePoint[0],
                                outlinePoint[1],
                                outlinePoint[2],
                                this,
                                this.stage, 
                            )
                        );
                    }
                    this.brokenOutlinePoints.push(point);
                }
            }
            else {
                for(const outlinePoints of this.brokenOutlinePoints) {
                    for (const outlinePoint of outlinePoints) {
                        outlinePoint.removeObject();
                    }
                }
                this.brokenOutlinePoints = [];

                // create outline pints
                for(const outlinePoints of state.brokenOutlinePoints) {
                    const point = [];
                    for (const outlinePoint of outlinePoints) {
                        point.push(
                            new OutlinePoints(
                                outlinePoint[0],
                                outlinePoint[1],
                                outlinePoint[2],
                                this,
                                this.stage, 
                            )
                        );
                    }
                    this.brokenOutlinePoints.push(point);
                }
            }

            this.updateMeasurement();
            for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
                this.edgeCentrePoints[i].removeObject();
            }
            this.edgeCentrePoints = [];
            for(let i = 0; i<this.brokenOutlinePoints.length; i++ ) {
                const points = this.brokenOutlinePoints[i];
                for (let j = 0, l = points.length - 1; j < l; j += 1) {
                    const nextIndex = j + 1;
                    const currentPoint = points[j].getPosition();
                    const nextPoint = points[nextIndex].getPosition();
                    this.edgeCentrePoints.push(new EdgeCentrePoints(
                        (currentPoint.x + nextPoint.x) / 2,
                        (currentPoint.y + nextPoint.y) / 2,
                        (currentPoint.z + nextPoint.z) / 2,
                        this,
                        this.stage,
                    ));
                }
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
        for (let i = 0, l = this.brokenOutlinePoints.length; i < l; i += 1) {
            const points = this.brokenOutlinePoints[i];
            for (let j = 0; j < points.length; j++) {
                points[j].removeObject();
            }
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }
        this.brokenOutlinePoints = [];
        this.edgeCentrePoints = [];
    }

    saveObject(isCopy = false) {
        // add all the properties of the ac cable
        const dcCableData = {
            type: DcCable.getObjectType(),
            id: this.id,
            name: this.name,
            cableLength: this.cableLength,
            stringSize: this.stringSize,
            polarity: this.polarity,
            inverterId: this.inverterId,
            inverterEnd: this.inverterEnd,
            ajbEnd: this.ajbEnd,
            stringEnd: this.stringEnd,
            stringId: this.attachedString != null ? this.attachedString.id : 0,
            conduitId: this.attachedConduit.map(attachedConduit => [
                attachedConduit.id,
            ]),
        };
        if (isCopy) {
            dcCableData.uuid = this.uuid;
        }

        const brokenOutlinePoints = [];
        for(const outlinePoints of this.brokenOutlinePoints) {
            const point = [];
            for (const outlinePoint of outlinePoints) {
                 point.push([
                    outlinePoint.getPosition().x,
                    outlinePoint.getPosition().y,
                    outlinePoint.getPosition().z,
                 ]);
            }
            brokenOutlinePoints.push(point);
        }

        dcCableData.brokenOutlinePoints = brokenOutlinePoints;

        return dcCableData;
    }

    loadObject(data, isPaste = false) {
        // load id and name
        if (!isPaste) {
            this.id = data.id;
            this.name = data.name;
            this.cableLength = data.cableLength;
            this.stringSize = data.stringSize;
            this.polarity = data.polarity;
        }

        this.inverterId = data.inverterId;
        this.inverterEnd = data.inverterEnd;
        this.ajbEnd = data.ajbEnd;
        this.stringEnd = data.stringEnd;
        this.getAttachedString(data.stringId);
        this.getAttachedConduit(data.conduitId);
        this.brokenOutlinePoints = [];
        for(const outlinePoints of data.brokenOutlinePoints) {
            const point = [];
            for (const outlinePoint of outlinePoints) {
                point.push(
                    new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage, 
                    )
                );
            }
            this.brokenOutlinePoints.push(point);
        };

        for(let i = 0; i<this.brokenOutlinePoints.length; i++ ) {
            const points = this.brokenOutlinePoints[i];
            for (let j = 0, l = points.length - 1; j < l; j += 1) {
                const nextIndex = j + 1;
                const currentPoint = points[j].getPosition();
                const nextPoint = points[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }

        this.updateMeasurement();

        this.updateGeometry();

        if (data.inverterId !== undefined) {
            this.inverterId = data.inverterId;
        }

        this.setInverterColor();

        if (isPaste) {
            this.saveState({ withoutContainer: false });
        }
        else {
            this.saveState({ withoutContainer: true });
        }
    }

    updateMeasurement() {
        for (let i = 0, l = this.lengthMeasurements.length; i < l; i += 1) {
            this.lengthMeasurements[i].remove();
        }
        this.lengthMeasurements = [];
        for (let j = 0; j < this.brokenOutlinePoints.length; j++) {
            const outlinePoints = this.brokenOutlinePoints[j];
            for (let i = 0, l = outlinePoints.length; i < l - 1; i += 1) {
                this.lengthMeasurements.push(new LengthMeasurement(
                    outlinePoints[i],
                    outlinePoints[i + 1],
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


    updateGeometry() {
        const highestZ = getHighestZ(this.stage.ground);
        const allMeshes2DVertices = this.getAllMeshes2DVertices();
        for (let i = 0; i < this.coreMesh.length; i++) {
            this.objectsGroup.remove(this.coreMesh[i]);
            this.objectsGroup.remove(this.coreEdges[i]);
        }
        this.coreMesh = [];
        this.coreEdges = [];
        const geometry = [];
        this.setInverterColor();
        for (let i = 0; i < allMeshes2DVertices.length; i++) {
            const coreMesh = createMesh(createBufferGeometry(), this.meshMaterial2D);
            const coreEdges = new THREE.LineSegments(
                new THREE.EdgesGeometry(coreMesh.geometry),
                this.edgeMaterial2D,
            );

            coreMesh.receiveShadow = true;
            coreMesh.castShadow = true;

            // adding meshes and edges to objectsGroup
            this.objectsGroup.add(coreMesh);
            this.objectsGroup.add(coreEdges);

            const vertices3DVectorToArray = convertArrayTo3DVector(allMeshes2DVertices[i]);
            // const numVertices = vertices2DArray.length;
            const shapeGeometry = new NikGeometry(this.stage);
            const coreGeometry = shapeGeometry.createFromPoints(vertices3DVectorToArray, this.coreHeight);
            coreMesh.geometry = coreGeometry;
            coreEdges.geometry = new THREE.EdgesGeometry(coreGeometry);
            this.coreMesh.push(coreMesh);
            this.coreEdges.push(coreEdges);
        }

        // updating outline points height
        let constantForParapetAccommodation = 0;
        if (this.getParent() instanceof PolygonModel && this.getParent().isParapetPresent()) {
            constantForParapetAccommodation += this.getParent().getParapetHeight();
        }

        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
                const position = outlinePoint.getPosition();
                outlinePoint.moveObjectWithoutConsequences(
                    0,
                    0,
                    highestZ + acCableRadius + constantForParapetAccommodation - position.z,
                );
            }
        }

        this.update3DDcCable();

        // update measurement
        this.updateMeasurement();
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
            for (let i = 0, l = this.brokenOutlinePoints.length; i < l; i += 1) {
                const outlinePoints = this.brokenOutlinePoints[i];
                for (let j = 0, len = outlinePoints.length; j < len - 1; j += 1) {
                    const rectangleVertices = this.get2DVerticesUsing2Points(
                        outlinePoints[j].getPosition(),
                        outlinePoints[j + 1].getPosition(),
                    );
                    directVertices.push(rectangleVertices[0], rectangleVertices[1]);
                    calculatedVertices.push(rectangleVertices[3], rectangleVertices[2]);
                }
            }
        }
        // let final1 = [];
        // for (let i = 0;i < directVertices.length;i++)
        // {
        //     if (directVertices[i] !== undefined)
        //     {
        //         final1.push(directVertices[i]);
        //     }
        // }
        // let final2 = [];
        // for (let i = 0;i < calculatedVertices.length;i++)
        // {
        //     if (calculatedVertices[i] !== undefined)
        //     {
        //         final2.push(calculatedVertices[i]);
        //     }
        // }
        //console.log(directVertices, calculatedVertices)
        return Handrail.getOuterVerticesInSequence(directVertices, calculatedVertices);
    }

    update3DDcCable() {
        // remove old meshes
        while (this.objectGroupFor3D.children.length > 0) {
            this.objectGroupFor3D.remove(this.objectGroupFor3D.children[0]);
        }

        let geometry = [];
        for(let j=0; j<this.brokenOutlinePoints.length; j++) {
            const vertices = [];
            const point = this.brokenOutlinePoints[j];
            for(let k=0; k<point.length; k++) {
                vertices.push(point[k].getPosition());
            }
            const vertices3D = this.get3DVertices(vertices);
            const verticesLength = vertices3D.length;
            for (let i = 0, l = vertices3D.length / 2; i < l - 1; i += 1) {
                this.update3DAcCableBetween2Points([
                    vertices3D[i],
                    vertices3D[i + 1],
                    vertices3D[verticesLength - i - 2],
                    vertices3D[verticesLength - i - 1],
                ], geometry, i === 0);
            }
        }

        const material = new THREE.MeshLambertMaterial({ color: 0x808080 });

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometry);

        const lineSegmentsMesh = new THREE.LineSegments(
            mergedGeometry,
            new THREE.LineBasicMaterial({
                linewidth: 2,
                color: 0x404040,
            }),
        );
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        this.merged3d = mergedMesh;
        this.objectGroupFor3D.add(lineSegmentsMesh);
        this.objectGroupFor3D.add(mergedMesh);
    }

    /**
     * returns the 3d vertices in 2d-array
     */
    get3DVertices(vertice = []) {
        const vertices2D = vertice.length > 0 ? this.get2DVertices(vertice) : this.get2DVertices();
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

            DcCable.get3DVerticesBetween2Points([point1, point2], totalLength, lerp1Info, lerp2Info, lerpValues);
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

            DcCable.get3DVerticesBetween2Points([point1, point2], totalLength, lerp1Info, lerp2Info, lerpValues);
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

    update3DAcCableBetween2Points(vertices, geometry) {
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
        //let geometry = []
        geometry.push(...this.createHorizontalCylinderMesh(
            horizontalLineCylinderPoints.basePoint,
            horizontalLineCylinderPoints.upPoint,
            acCableRadius,
        ));
    }

    updateAutoRoutingBrokenOutlinePoints() {
        // delete old outline points
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.hideObject();
            }
        }

        this.brokenOutlinePoints = [];
        let endOne = this.stringEnd;
        for (let i = 0; i < this.attachedConduit.length; i++) {
            const conduitPoint = this.attachedConduit[i].outlinePoints;
            const endTwo = conduitPoint[0].getPosition();
            this.brokenOutlinePoints.push(getOutlinePoints([endTwo, endOne], this));
            endOne = conduitPoint[conduitPoint.length - 1].getPosition();
        }

        if (this.inverter.AJBToggle && this.ajbEnd !== null) {
            const endTwo = this.ajbEnd;
            this.brokenOutlinePoints.push(getOutlinePoints([endTwo, endOne], this));
            endOne = endTwo;
        }
        this.brokenOutlinePoints.push(getOutlinePoints([this.inverterEnd, endOne], this));

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }

        this.edgeCentrePoints = [];
        for(let i = 0; i<this.brokenOutlinePoints.length; i++ ) {
            const points = this.brokenOutlinePoints[i];
            for (let j = 0, l = points.length - 1; j < l; j += 1) {
                const nextIndex = j + 1;
                const currentPoint = points[j].getPosition();
                const nextPoint = points[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }
        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }
    }

    getAllMeshes2DVertices() {
        const meshVertices = [];
        for (let i = 0, l = this.brokenOutlinePoints.length; i < l; i += 1) {
            const points = this.brokenOutlinePoints[i];
            const vertices = [];
            for (let j = 0; j < points.length; j++) {
                vertices.push(points[j].getPosition());
            }
            meshVertices.push(this.get2DVertices(vertices));
        }

        return meshVertices;
    }


    moveObject(deltaX, deltaY, deltaZ = 0) {
        // update all meshes and edges
        for (let i = 0; i < this.coreMesh.length; i++) {
            this.coreMesh[i].geometry.translate(deltaX, deltaY, deltaZ);
            this.coreEdges[i].geometry.translate(deltaX, deltaY, deltaZ);
        }

        // update outline points without consequences
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
                outlinePoint.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
            }
        }

        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        }

        // update measurement
        this.onlyUpdateMeasurement();

        // update dimensions
        this.moveDimensions(deltaX, deltaY, deltaZ);

        this.saveState();
    }

     placeObject(deltaX = 0, deltaY = 0) {
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
        for (const dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        if (this.checkIntersection()) {
            // this.joinCable(this.findOtherCable());
            // this.joinCable(this);

        }

        return true;
    }

    switchTo3D() {
        for (let i = 0; i < this.coreMesh.length; i++) {
            this.objectsGroup.remove(this.coreMesh[i]);
            this.objectsGroup.remove(this.coreEdges[i]);
        }
        this.objectsGroup.add(this.objectGroupFor3D);
        // Jugaad
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.hideObject();
            }
        }
        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }
    }

    switchTo2D() {
        for (let i = 0; i < this.coreMesh.length; i++) {
            this.objectsGroup.add(this.coreMesh[i]);
            this.objectsGroup.add(this.coreEdges[i]);
        }

        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.hideObject();
            }
        }
        for(let i=0; i<this.edgeCentrePoints.length; i++) {
            this.edgeCentrePoints[i].hideObject();
        }
        this.objectsGroup.remove(this.objectGroupFor3D);
    }

    joinCable(cable) {
        const selectedConduit = this.stage.addCablesMode.selectedConduit;
        let positiveEnd = [];
        let negativeEnd = [];
        if (selectedConduit.addedCables.positiveEnd !== undefined) {
            positiveEnd = selectedConduit.addedCables.positiveEnd;
            negativeEnd = selectedConduit.addedCables.negativeEnd;
        }
        this.stage.addCablesMode.joinConduitAndInverter(cable, positiveEnd, negativeEnd);
    }

    findOtherCable() {
        const inverter = this.inverter;
        for (let i = 0; i < inverter.mppts.length; i++) {
            const stringCable = inverter.mppts[i].strings;
            for (let j = 0; j < stringCable.length; j++) {
                if (stringCable[j].attachedDcCable[0].id === this.id) {
                    return stringCable[j].attachedDcCable[1];
                }
                else if (stringCable[j].attachedDcCable[1].id === this.id) {
                    return stringCable[j].attachedDcCable[0];
                }
            }
        }
        return { id: 0 };
    }

    checkIntersection() {
        if (this.parent != null) {
            const objects = this.parent.children;
            for (let i = 0; i < this.outlinePoints.length - 1; i++) {
                let pos1 = this.outlinePoints[i].getPosition();
                let pos2 = this.outlinePoints[i + 1].getPosition();
                const edge1 = [{ x: pos1.x, y: pos1.y }, { x: pos2.x, y: pos2.y }];
                for (let j = 0; j < objects.length; j++) {
                    if (objects[j] instanceof Conduit ||
                   objects[j] instanceof DoubleConduit ||
                   objects[j] instanceof DoubleSeparateConduit ||
                   objects[j] instanceof SingleCableTray ||
                   objects[j] instanceof DoubleCableTray ||
                   objects[j] instanceof DoubleSeparateCableTray) {
                        for (let k = 0; k < objects[j].outlinePoints.length - 1; k++) {
                            pos1 = objects[j].outlinePoints[k].getPosition();
                            pos2 = objects[j].outlinePoints[k + 1].getPosition();
                            const edge2 = [{ x: pos1.x, y: pos1.y }, { x: pos2.x, y: pos2.y }];
                            const result = checkLineIntersection(edge1, edge2);
                            if (result.onLine1 && result.onLine2) {
                                this.stage.addCablesMode.selectedConduit = objects[j];
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // getColorMapForObject() {
    //     return COLOR_MAPPINGS.INVERTER;
    // }

    // getColorMap() {
    //     if (this.materialAndVisualStatesExist(this.objectColorMapping)) {
    //         if (this.visualState === VISUAL_STATES.ERROR ||
    //             this.visualState === VISUAL_STATES.EDGE_HIGHLIGHT ||
    //             this.visualState === VISUAL_STATES.DRAWING_ERROR ||
    //             this.visualState === VISUAL_STATES.MIRROR_MODE){
    //                 return this.objectColorMapping[this.materialState][this.visualState];
    //             }
    //         else {
    //             return {
    //                 MESH_COLOR: INVERTER_COLORS.Color[2],
    //                 EDGE_COLOR: 0x424242,
    //                 PILLAR_COLOR: 0xA9A9A9,
    //             }
    //         }
    //     }
    //     return {};
    // }
    drawCableBetween2Points(vertices) {
        const notificationObject = this.stage.eventManager.setAcCableCreating();
        const fend = new THREE.Vector2(vertices[0].x, vertices[0].y);
        const fstart = new THREE.Vector2(vertices[1].x, vertices[1].y);
        // console.log(fstart, fend, "SP");
        let start,
            end;
        let subArr;
        const children = [];

        const result = getAllModelType();
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
            if (children[i] instanceof PolygonModel
                || children[i] instanceof CylinderModel) {
                // console.log(children[i], "CC");
                const obj = {};
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
                // console.log(isInside(fend, subPoints), "BOOL");
                subPoints = setbackPolygon(subPoints, 1.5);
                if (isInside(fstart, subPoints)) {
                    subArr = children[i];

                    const tempPoint1 = new THREE.Vector2(subPoints[subPoints.length - 1][0], subPoints[subPoints.length - 1][1]);
                    const tempPoint2 = new THREE.Vector2(subPoints[0][0], subPoints[0][1]);
                    const intersection = checkLineIntersection([fstart, fend], [tempPoint1, tempPoint2]);
                    if (intersection.onLine1 && intersection.onLine2) {
                        end = new THREE.Vector2(intersection.x, intersection.y);
                    }
                    for (let j = 0; j < subPoints.length - 1; j++) {
                        const tempPoint1 = new THREE.Vector2(subPoints[j][0], subPoints[j][1]);
                        const tempPoint2 = new THREE.Vector2(subPoints[j + 1][0], subPoints[j + 1][1]);
                        const intersection = checkLineIntersection([fstart, fend], [tempPoint1, tempPoint2]);
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

        const temp = [];
        const notToTakeIndexes = [];
        for (let i = 0; i < objs.length; i++) {
            for (let j = 0; j < objs.length; j++) {
                if (i !== j) {
                    if (checkPolygonInsidePolygon(objs[i].points, objs[j].points)) {
                        notToTakeIndexes.push(i);
                        break;
                    }
                }
            }
        }

        for (let i = 0; i < objs.length; i++) {
            if (i !== notToTakeIndexes[0]) {
                temp.push(objs[i]);
            }
            else {
                notToTakeIndexes.shift();
            }
        }

        objs = [...temp];
        // console.log(objs, 'OBJS');
        // console.log(subArr.azimuth, "SUBB");

        // console.log(polygon, "POLY");


        function isInside(point, vs) {
            let x = point.x,
                y = point.y;

            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                let xi = vs[i][0],
                    yi = vs[i][1];
                let xj = vs[j][0],
                    yj = vs[j][1];

                const intersect = ((yi > y) != (yj > y)) &&
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
                if (checkIfPointLiesOnLineSegment([objects[i].points[0], objects[i].points[objects[i].points.length - 1]], point)) {
                    return objects[i].points;
                }
                for (let j = 0; j < objects[i].points.length - 1; j++) {
                    if (checkIfPointLiesOnLineSegment([objects[i].points[j], objects[i].points[j + 1]], point)) {
                        return objects[i].points;
                    }
                }
            }
            return null;
        }

        function getFixedPoints(itr, polygon, left = false) {
            if (left) {
                return polygon.slice(itr, polygon.length).concat(polygon.slice(0, itr));
            }
            const fin = [];
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
            const polygon = getPolygonContainingPoint(objs, start);

            const line = getPointOnLine(polygon, start);

            const leftPoints = [start];
            const rightPoints = [start];
            const upperPoints = [start];

            let rightItr = polygon.indexOf(line[0]);
            let leftItr = polygon.indexOf(line[1]);

            if (rightItr === 0 && leftItr === polygon.length - 1) {
                rightItr = polygon.length - 1;
                leftItr = 0;
            }

            const leftArr = getFixedPoints(leftItr, polygon, true);
            const rightArr = getFixedPoints(rightItr, polygon);
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
            const interPoints = [];
            for (let i = 0; i < objs.length; i++) {
                const tempPoint1 = new THREE.Vector2(objs[i].points[objs[i].points.length - 1][0], objs[i].points[objs[i].points.length - 1][1]);
                const tempPoint2 = new THREE.Vector2(objs[i].points[0][0], objs[i].points[0][1]);
                const intersection = checkLineIntersection([start, end], [tempPoint1, tempPoint2]);
                if (intersection.onLine1 && intersection.onLine2) {
                    interPoints.push(new THREE.Vector2(intersection.x, intersection.y));
                }
                for (let j = 0; j < objs[i].points.length - 1; j++) {
                    const tempPoint1 = new THREE.Vector2(objs[i].points[j][0], objs[i].points[j][1]);
                    const tempPoint2 = new THREE.Vector2(objs[i].points[j + 1][0], objs[i].points[j + 1][1]);
                    const intersection = checkLineIntersection([start, end], [tempPoint1, tempPoint2]);
                    if (intersection.onLine2 && intersection.onLine1) {
                        interPoints.push(new THREE.Vector2(intersection.x, intersection.y));
                    }
                }
            }

            interPoints.sort((point1, point2) => (end.distanceToSquared(point2) - end.distanceToSquared(point1)));
            // console.log(interPoints, "INTER");
            if (interPoints.length % 2 != 0) {
                interPoints.shift();
            }

            const finalPoints = [];
            for (let i = 0; i < interPoints.length; i += 2) {
                const points = getAround(interPoints[i], interPoints[i + 1]);
                for (let j = 0; j < points.length; j++) {
                    finalPoints.push(points[j]);
                }
            }
            return finalPoints;
        }

        function getOuterPath(start, mid, end) {
            const finalPoints = [];
            finalPoints.push(start);

            let points = getPoints(start, mid, objs);
            for (let i = 0; i < points.length; i++) {
                finalPoints.push(points[i]);
            }
            start = (finalPoints.length > 0) ? finalPoints[finalPoints.length - 1] : start;

            let flag = 0;
            let point1,
                point2;
            for (let i = 0; i < objs.length; i++) {
                if (isInside(mid, objs[i].points)) {
                    const vertices = [...objs[i].points];
                    // vertices = setbackPolygon(vertices, 0.5);
                    const tempPoint1 = new THREE.Vector2(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1]);
                    const tempPoint2 = new THREE.Vector2(vertices[0][0], vertices[0][1]);
                    const intersection1 = checkLineIntersection([start, mid], [tempPoint1, tempPoint2]);
                    const intersection2 = checkLineIntersection([mid, end], [tempPoint1, tempPoint2]);
                    if (intersection1.onLine1 && intersection1.onLine2) {
                        point1 = new THREE.Vector2(intersection1.x, intersection1.y);
                    }
                    if (intersection2.onLine1 && intersection2.onLine2) {
                        point2 = new THREE.Vector2(intersection2.x, intersection2.y);
                    }
                    for (let j = 0; j < vertices.length - 1; j++) {
                        const tempPoint1 = new THREE.Vector2(vertices[j][0], vertices[j][1]);
                        const tempPoint2 = new THREE.Vector2(vertices[j + 1][0], vertices[j + 1][1]);
                        const intersection1 = checkLineIntersection([start, mid], [tempPoint1, tempPoint2]);
                        const intersection2 = checkLineIntersection([mid, end], [tempPoint1, tempPoint2]);
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
                const points = getAround(point1, point2);
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

        const finalPoints = [];
        if (end === undefined) {
            end = fend;
        }

        const azi = (subArr !== undefined) ? subArr.azimuth : 180;

        let leftPoint,
            rightPoint;
        if (azi !== 0 || azi !== 180 || azi !== 360) {
            const points = getSecondPoints(fstart, end, azi);
            leftPoint = points[0];
            rightPoint = points[1];
            // console.log(points, leftPoint, rightPoint, "sss");
        }
        else {
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
            // console.log(start, end, "POINTS");
            // finalPoints.push(start);

            leftPoint = new THREE.Vector2(start.x, end.y);
            rightPoint = new THREE.Vector2(end.x, start.y);

            leftPoints = getOuterPath(start, leftPoint, end);
            rightPoints = getOuterPath(start, rightPoint, end);

            points = (checkDistance(leftPoints) > checkDistance(rightPoints)) ? rightPoints : leftPoints;

            // console.log(checkDistance(leftPoints), checkDistance(rightPoints), "DIS");
            // console.log(leftPoints, rightPoints, "PPOINTS");
            // console.log(checkDistance(rightPoints), rightPoints, "RIGHT");
            // console.log(checkDistance(leftPoints), leftPoints, "LEFT");
            for (let i = 0; i < points.length; i++) {
                finalPoints.push(points[i]);
            }
        }

        const final = [];
        for (let i = 0; i < finalPoints.length; i++) {
            if (final[final.length - 1] !== finalPoints[i]) {
                final.push(finalPoints[i]);
            }
        }

        // console.log(final, "FINAL");
        this.outlinePoints = final.map(vertex => new OutlinePoints(vertex.x, vertex.y, 100, this, this.stage));

        vertices = [...final];
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

    onSelect() {

        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.showObject();
            }
        }

        // show measurements
        this.showMeasurement();

        // show edgecenters
        this.showEdgeCenters();

        // show inverter
        this.inverter.onSelect();

        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );
        if (!this.stage.selectionControls.isMultiSelect()) {  
            for (const outlinePoints of this.brokenOutlinePoints) {
                for (const outlinePoint of outlinePoints) {
                    this.stage.dragControls.add(
                                outlinePoint,
                                outlinePoint.moveObject.bind(outlinePoint),
                                outlinePoint.placeObject.bind(outlinePoint),
                                outlinePoint.handleDragStart.bind(outlinePoint),
                            );
                }
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

    deSelect() {
        // hide outline points
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.hideObject();
            }
        }

        // hide measurements
        this.hideMeasurement();

        // hide Edgecenter
        this.hideEdgeCenters();

        // hide inverter
        if (this.inverter !== undefined) {
            this.inverter.deSelect();
        }
    }

    showObject() {
        this.objectsGroup.visible = true;
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.showObject();
            }
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].showObject();
        }
    }

    hideObject() {
        this.objectsGroup.visible = false;
        for(const outlinePoints of this.brokenOutlinePoints) {
            for (const outlinePoint of outlinePoints) {
               outlinePoint.hideObject();
            }
        }
        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].hideObject();
        }
    }

    handleVertexDragStart(vertex){
        let vertexFound = false;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if(this.brokenOutlinePoints[i].includes(vertex)) {
                vertexFound = true;
                break;
            } 
        }

        if (!vertexFound) {
            console.error('ERROR: DcCable: vertex not in outlinePoints in handleVertexDragStart');
        }

        // this.prevIntersectingSubarrays = this.getIntersectingSubarrays();
    }

    handleVertexMove(vertex) {
        let vertexFound = false;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if(this.brokenOutlinePoints[i].includes(vertex)) {
                vertexFound = true;
                break;
            } 
        }

        if (!vertexFound) {
            console.error('ERROR: DcCable: vertex not in outlinePoints in handleVertexDragStart');
        }


        for (let i = 0, l = this.edgeCentrePoints.length; i < l; i += 1) {
            this.edgeCentrePoints[i].removeObject();
        }

        this.edgeCentrePoints = [];
        for(let i = 0; i<this.brokenOutlinePoints.length; i++ ) {
            const points = this.brokenOutlinePoints[i];
            for (let j = 0, l = points.length - 1; j < l; j += 1) {
                const nextIndex = j + 1;
                const currentPoint = points[j].getPosition();
                const nextPoint = points[nextIndex].getPosition();
                this.edgeCentrePoints.push(new EdgeCentrePoints(
                    (currentPoint.x + nextPoint.x) / 2,
                    (currentPoint.y + nextPoint.y) / 2,
                    (currentPoint.z + nextPoint.z) / 2,
                    this,
                    this.stage,
                ));
            }
        }

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleVertexPlace(vertex) {
        let vertexFound = false;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if(this.brokenOutlinePoints[i].includes(vertex)) {
                vertexFound = true;
                break;
            } 
        }

        if (!vertexFound) {
            console.error('ERROR: DcCable: vertex not in outlinePoints in handleVertexDragStart');
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
        const edgeCenterIndex = this.edgeCentrePoints.indexOf(vertex);
        let idx = this.edgeCentrePoints.indexOf(vertex);
        const movedPoint = this.edgeCentrePoints[idx].getPosition();
        let tempIndex = 0;
        let movedMeshIndex = 0;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if( tempIndex + this.brokenOutlinePoints[i].length - 2 >= idx) {
                movedMeshIndex = i;
                idx = idx - tempIndex;
                break;
            }
            tempIndex += this.brokenOutlinePoints[i].length - 1;
        }

        this.brokenOutlinePoints[movedMeshIndex].splice(
            idx + 1, 0,
            new OutlinePoints(
                movedPoint.x,
                movedPoint.y,
                movedPoint.z,
                this,
                this.stage,
            ),
        );

        const nextIndex = idx + 2 < this.brokenOutlinePoints[movedMeshIndex].length ? idx + 2 : 0;
        const prevPoint = this.brokenOutlinePoints[movedMeshIndex][idx].getPosition();
        const currentPoint = this.brokenOutlinePoints[movedMeshIndex][idx + 1].getPosition();
        const nextPoint = this.brokenOutlinePoints[movedMeshIndex][nextIndex].getPosition();

        this.edgeCentrePoints.splice(
            edgeCenterIndex, 0,
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
        const edgeCenterIndex = this.edgeCentrePoints.indexOf(vertex);
        let idx = this.edgeCentrePoints.indexOf(vertex);
        let tempIndex = 0;
        let movedMeshIndex = 0;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if( tempIndex + this.brokenOutlinePoints[i].length - 2 >= idx) {
                movedMeshIndex = i;
                idx = idx - tempIndex;
                break;
            }
            tempIndex += this.brokenOutlinePoints[i].length - 1;
        }

        this.brokenOutlinePoints[movedMeshIndex][idx - 1].moveObjectWithoutConsequences(delta.x, delta.y, delta.z);

        this.edgeCentrePoints[edgeCenterIndex - 1]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);
        this.edgeCentrePoints[edgeCenterIndex - 2]
            .moveObjectWithoutConsequences(delta.x / 2, delta.y / 2, delta.z);

        // update geometry
        this.updateGeometry();

        this.saveState();
    }

    async handleEdgeCentrePlace(vertex) {
        const edgeCenterIndex = this.edgeCentrePoints.indexOf(vertex);
        let idx = this.edgeCentrePoints.indexOf(vertex);
        let tempIndex = 0;
        let movedMeshIndex = 0;
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            if( tempIndex + this.brokenOutlinePoints[i].length - 2 >= idx) {
                movedMeshIndex = i;
                idx = idx - tempIndex;
                break;
            }
            tempIndex += this.brokenOutlinePoints[i].length - 1;
        }
        let v = this.edgeCentrePoints[edgeCenterIndex - 1];
        this.stage.dragControls.add(
            v,
            v.moveObject.bind(v),
            v.placeObject.bind(v),
            v.handleDragStart.bind(v),
        );

        v = this.edgeCentrePoints[edgeCenterIndex - 2];
        this.stage.dragControls.add(
            v,
            v.moveObject.bind(v),
            v.placeObject.bind(v),
            v.handleDragStart.bind(v),
        );

        const [removedPoint] = this.edgeCentrePoints.splice(edgeCenterIndex, 1);
        this.stage.dragControls.removeIfExists(removedPoint);
        removedPoint.removeObject();

        this.brokenOutlinePoints[movedMeshIndex][idx - 1].showObject();
        const notificationObject = this.stage.eventManager.setPolygonModelLoading();
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
        for(let i=0; i<this.brokenOutlinePoints.length; i++) {
            const points = this.brokenOutlinePoints[i];
            for(let j=0; j<points.length; j++) {
                points[j].removeObject();
            }
        }
        this.brokenOutlinePoints = [];

        for (let j = 0, l = this.edgeCentrePoints.length; j < l; j += 1) {
            this.edgeCentrePoints[j].removeObject();
        }
        this.edgeCentrePoints = [];

        this.removeDimensions();
    }

    updateOutlinePoints() {
        let endOne = this.stringEnd,
            endTwo;
        let points = [];
        for (let i = 0; i < this.outlinePoints.length; i++) {
            this.outlinePoints[i].hideObject();
        }
        for (let i = 0; i < this.attachedConduit.length; i++) {
            const conduitPoint = this.attachedConduit[i].outlinePoints;
            endTwo = conduitPoint[0].getPosition();
            const point = getOutlinePoints([endTwo, endOne], this);
            endOne = conduitPoint[conduitPoint.length - 1].getPosition();
            // point.splice(-1, 1);
            points = points.concat(point);
            // for(let j=0; j<conduitPoint.length-1; j++) {
            //     points.push(conduitPoint[j]);
            // }
        }

        if (this.inverter.AJBToggle && this.ajbEnd !== null) {
            const point = getOutlinePoints([this.ajbEnd, endOne], this);
            // point.splice(-1,1);
            points = points.concat(point);
            endOne = this.ajbEnd;
        }

        const point = getOutlinePoints([this.inverterEnd, endOne], this);
        points = points.concat(point);
        this.outlinePoints = points;
    }

    getAttachedString(id) {
        for (let i = 0; i < this.inverter.mppts.length; i++) {
            const strings = this.inverter.mppts[i].strings;
            for (let j = 0; j < strings.length; j++) {
                if (strings[j].id == id) {
                    this.attachedString = strings[j];
                    strings[j].attachedDcCable.push(this);
                    this.mpptIndex = i + 1;
                    this.stringIndex = j + 1;
                }
            }
        }
    }

    getAttachedConduit(conduitId) {
        const conduits = this.stage.ground.allConduitAndCabletary;
        for (let i = 0; i < conduitId.length; i++) {
            for (let j = 0; j < conduits.length; j++) {
                if (conduitId[i] == conduits[j].id) {
                    conduits[j].attachedDcCable.push(this);
                    this.attachedConduit.push(conduits[j]);
                }
                conduits[j].saveState();
            }
        }
    }

    // getLength() {
    //     let totalLength = 0;
    //     for(let j=0; j<this.brokenOutlinePoints.length; j++){
    //         const point = this.brokenOutlinePoints[j];
    //         const vertices = [];
    //         for(let k=0; k<point.length; k++) {
    //             vertices.push(point[k].getPosition());
    //         }
    //         const vertices3d = convertArrayTo3DVector(this.get3DVertices(vertices));
    //         for (let i = 0; i < (vertices3d.length / 2) - 1; i++) {
    //             totalLength += vertices3d[i].distanceTo(vertices3d[i + 1]);
    //         }
    //     }
    //     for(let i=0; i<this.attachedConduit; i++) {
    //         totalLength += this.attachedConduit[i].getLength();
    //     }
    //     return totalLength;
    // }
    get mesh3D() {
        return this.merged3d;
    }
    
    static getObjectType() {
        return 'DcCable ';
    }
}

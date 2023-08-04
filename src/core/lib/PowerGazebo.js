import { defaultGazeboModuleId } from "../../constants";
import {
    CREATED_STATE,
    DEFAULT_GAZEBO_INVERTER_TYPE,
    DEFAULT_GAZEBO_MODULEMAKE,
    DEFAULT_GAZEBO_MOUNTHEIGHT,
    DEFAULT_GAZEBO_STRUCTURE,
    DEFAULT_GAZEBO_TILT,
    DELETED_STATE,
    OUT_OF_POLYGON_MODEL,
    PANEL_ORIENTATION_LANDSCAPE
} from "../coreConstants";
import BaseObject from "../objects/BaseObject";
import * as JSTS from 'jsts';
import Subarray from "../objects/subArray/Subarray";
import OutlinePoints from "../objects/subObjects/OutlinePoints";
import { COLOR_MAPPINGS, MATERIAL_STATES, VISUAL_STATES } from "../objects/visualConstants";
import * as constants from '../structure/constants';
import { getStructureValidationErrorMessages } from "../structure/utils/structureValidationUtils";
import { checkClockwise, toDegrees } from "../utils/utils";
import Row from '../objects/subArray/Row';
import Table from '../objects/subArray/Table';
import * as utils from '../utils/utils';
import RotationPoint from "../objects/subObjects/RotationPoint";
import * as THREE from 'three';
import { onObjectSelection } from "../../componentManager/sapPaneAssistant";
import createBufferGeometry, { createMesh } from "../utils/meshUtils"
import Ground from "../objects/ground/Ground";

// basic functions for the gazebo tool
export default class Gazebo extends Subarray {
    constructor(stage) {
        super(stage);
        this.structureType = DEFAULT_GAZEBO_STRUCTURE;
        this.tableSizeWide = 4;
        this.tableSizeUp = 8;
        this.inverterType = DEFAULT_GAZEBO_INVERTER_TYPE;
        this.panelOrientation = PANEL_ORIENTATION_LANDSCAPE;
        this.azimuth = 180;
        this.moduleProperties = {
            moduleId: defaultGazeboModuleId,
            moduleLength: 1.12,
            moduleMake: DEFAULT_GAZEBO_MODULEMAKE,
            moduleSize: 0.077,
            moduleWidth: 0.465,
        };
        this.mountHeight = DEFAULT_GAZEBO_MOUNTHEIGHT;
        this.tilt = DEFAULT_GAZEBO_TILT;
        this.mountHeight = 2.4384;
        this.tilt = 10;
        this.objectType = 'Gazebo';
        this.rotationPoints = this.createRotation();
        this.panelCopyGroup = new THREE.Object3D();
        this.objectsGroup.add(this.panelCopyGroup);
    }

    createRotation() {
        this.coreMesh.geometry.computeBoundingSphere();
        const { center, radius } = this.coreMesh.geometry.boundingSphere;
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        // setting RotationPoint
        return new RotationPoint(
            center.x,
            center.y + radius,
            highestZ,
            this,
            this.stage,
        );
    }
    /**
     * saving the properties of gazebo
     * @returns gazebo data
     */
    saveObject() {
        let gazeboData = {
            type: Gazebo.getObjectType(),
        };

        // save id and name
        gazeboData.id = this.id;
        gazeboData.name = this.name;
        gazeboData.addTableFlow = this.addTableFlow;
        // save gazebo properties
        gazeboData.moduleProperties = {
            moduleId: this.moduleProperties.moduleId,
            moduleMake: this.moduleProperties.moduleMake,
            moduleSize: this.moduleProperties.moduleSize,
            moduleLength: this.moduleProperties.moduleLength,
            moduleWidth: this.moduleProperties.moduleWidth,
        };
        gazeboData.panelProperties = this.panelProperties;
        gazeboData.rowSpacing = this.rowSpacing;
        gazeboData.rowSpacingMode = this.rowSpacingMode;
        gazeboData.tilt = this.tilt;
        gazeboData.structureType = this.structureType;
        gazeboData.azimuth = this.azimuth;
        gazeboData.inverterType = this.inverterType;
        gazeboData.panelOrientation = this.panelOrientation;
        gazeboData.mountHeight = this.mountHeight;
        gazeboData.tableSizeUp = this.tableSizeUp;
        gazeboData.tableSizeWide = this.tableSizeWide;
        gazeboData.tableSpacing = this.tableSpacing;
        gazeboData.moduleSpacingUp = this.moduleSpacingUp;
        gazeboData.moduleSpacingWide = this.moduleSpacingWide;
        gazeboData.mountType = this.mountType;
        gazeboData.inverterLerpPosition = this.inverterLerpPosition;

        gazeboData.inverterIds = [];

        for (let i = 0, l = this.inverters.length; i < l; i += 1) {
            gazeboData.inverterIds.push(this.inverters[i].id);
        }
        gazeboData.bifacialEnabled = this.bifacialEnabled;

        // saving outline points
        let outlinePoints = [];
        for (let outlinePoint of this.outlinePoints) {
            outlinePoints.push([
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ])
        }
        gazeboData.outlinePoints = outlinePoints;
       
        // save subarray map
        gazeboData.subarrayMap = this.getSubarrayMap();
        return gazeboData;
    }
    /**
     *
     * @param {*} gazeboData
     * @param {*} parentModel
     * @param {*Boolean} isPaste
     *
     */
    loadObject(gazeboData, parentModel, isPaste = false) {
        if (gazeboData.subarrayMap.rows.length === 0) {
            return;
        }
        // load id and name
        if (!isPaste) {
            this.id = gazeboData.id;
            this.name = gazeboData.name;
        }

        this.addTableFlow = gazeboData.addTableFlow;
        // load subarray properties
        this.moduleProperties = {
            moduleId: gazeboData.moduleProperties.moduleId,
            moduleMake: gazeboData.moduleProperties.moduleMake,
            moduleSize: gazeboData.moduleProperties.moduleSize,
            moduleLength: gazeboData.moduleProperties.moduleLength,
            moduleWidth: gazeboData.moduleProperties.moduleWidth,
        };
        if (gazeboData.panelProperties === undefined) {
            this.panelProperties = this.getDefaultValues().panelProperties;
        }
        else {
            this.panelProperties = gazeboData.panelProperties;
        }
        this.rowSpacing = gazeboData.rowSpacing;
        this.rowSpacingMode = gazeboData.rowSpacingMode;
        this.tilt = gazeboData.tilt;
        this.structureType = gazeboData.structureType;
        this.azimuth = gazeboData.azimuth;
        this.panelOrientation = gazeboData.panelOrientation;
        this.mountHeight = gazeboData.mountHeight;
        this.tableSizeUp = gazeboData.tableSizeUp;
        this.tableSizeWide = gazeboData.tableSizeWide;
        this.tableSpacing = gazeboData.tableSpacing;
        this.moduleSpacingUp = gazeboData.moduleSpacingUp;
        this.moduleSpacingWide = gazeboData.moduleSpacingWide;
        this.mountType = gazeboData.mountType;
        this.bifacialEnabled = gazeboData.bifacialEnabled;

        if (gazeboData.inverterLerpPosition !== undefined) {
            this.inverterLerpPosition = gazeboData.inverterLerpPosition;
        }

        // load subarray outline vertices (points)
        if (parentModel !== null) {
            this.associatedModel = parentModel;
            this.associatedModel.addChild(this);
        }

        if (gazeboData.inverterIds !== undefined) {
            this.inverterIds = gazeboData.inverterIds;
        }
      
        // TODO: Identify the real cause
        if (gazeboData.outlinePoints.length === 0) {
            if (gazeboData.subarrayMap.rows.length === 0) {
                this.removeObject();
                return;
            }
            let coordinatePoints = [];
            for (let row of gazeboData.subarrayMap.rows) {
                for (let table of row.frames) {
                    for (let panel of table.panels) {
                        for (let corner of panel.corners) {
                            coordinatePoints.push(new JSTS.geom.Coordinate(corner[0], corner[1]));
                        }
                    }
                }
            }
            const convexHullCoordinates = new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints).convexHull().getCoordinates().slice(0, -1);
            gazeboData.outlinePoints = convexHullCoordinates.map(coordinate => [coordinate.x, coordinate.y, 0]);
        }

        // set outline points
        for (let outlinePoint of gazeboData.outlinePoints) {
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
        // update geometry of subarray
        this.updateGeometry();

        if (isPaste) {
            // load subarray map
            this.makeSubarray(gazeboData.subarrayMap, { withoutContainer: false });
            this.saveState({ withoutContainer: false });
        }
        else {
            // manuplating the subarray map to create row blocks
            gazeboData.subarrayMap = this.createRowBlocksInSubarrayMap(gazeboData.subarrayMap);
            this.makeSubarray(gazeboData.subarrayMap, { withoutContainer: true });
            this.saveState({ withoutContainer: true });
        }

        // this.ensureValidSubarrayDCSize();
    }

    getState() {
        return {
            type: Gazebo.getObjectType(),
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            addTableFlow: this.addTableFlow,
            moduleProperties: {
                moduleId: this.moduleProperties.moduleId,
                moduleMake: this.moduleProperties.moduleMake,
                moduleSize: this.moduleProperties.moduleSize,
                moduleLength: this.moduleProperties.moduleLength,
                moduleWidth: this.moduleProperties.moduleWidth,
            },
            panelProperties: this.panelProperties,
            mountType: this.mountType,
            rowSpacing: this.rowSpacing,
            rowSpacingMode: this.rowSpacingMode,
            tilt: this.tilt,
            structureType: this.structureType,
            inverterType: this.inverterType,
            azimuth: this.azimuth,
            panelOrientation: this.panelOrientation,
            mountHeight: this.mountHeight,
            tableSizeUp: this.tableSizeUp,
            tableSizeWide: this.tableSizeWide,
            tableSpacing: this.tableSpacing,
            moduleSpacingUp: this.moduleSpacingUp,
            moduleSpacingWide: this.moduleSpacingWide,
            outlinePoints: this.outlinePoints.map(outlinePoint => [
                outlinePoint.getPosition().x,
                outlinePoint.getPosition().y,
                outlinePoint.getPosition().z,
            ]),
            parent: this.getParent() ? this.getParent().uuid : null,
            boundingBox: this.getBoundingBox(),
            inverterLerpPosition: this.inverterLerpPosition,
        };
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            // load id and name
            this.id = state.id;
            this.name = state.name;
            this.addTableFlow = state.addTableFlow;
            // load subarray properties
            this.moduleProperties = {
                moduleId: state.moduleProperties.moduleId,
                moduleMake: state.moduleProperties.moduleMake,
                moduleSize: state.moduleProperties.moduleSize,
                moduleLength: state.moduleProperties.moduleLength,
                moduleWidth: state.moduleProperties.moduleWidth,
            };
            this.panelProperties = state.panelProperties;
            this.mountType = state.mountType;
            this.rowSpacing = state.rowSpacing;
            this.structureType = state.structureType; // TBC what is load state
            this.rowSpacingMode = state.rowSpacingMode;
            this.tilt = state.tilt;
            this.azimuth = state.azimuth;
            this.panelOrientation = state.panelOrientation;
            this.mountHeight = state.mountHeight;
            this.tableSizeUp = state.tableSizeUp;
            this.tableSizeWide = state.tableSizeWide;
            this.tableSpacing = state.tableSpacing;
            this.moduleSpacingUp = state.moduleSpacingUp;
            this.moduleSpacingWide = state.moduleSpacingWide;
            this.boundingBox = state.boundingBox;
            this.inverterLerpPosition = state.inverterLerpPosition;

            this.updateVisualsAfterLoadingAndCreation();

            // update parent
            const parentObject = this.stage.getObject(state.parent);
            if (parentObject) {
                this.changeParent(parentObject);
            }
            else {
                this.changeParent(this.stage.ground);
            }
            this.associatedModel = this.getParent();
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);

                if (state.outlinePoints.length === 0 && state.outlinePoints.length < 4) {
                    this.outlinePoints = state.boundingBox.map(outlinePoint => new OutlinePoints(
                        outlinePoint.x,
                        outlinePoint.y,
                        outlinePoint.z,
                        this,
                        this.stage,
                    ));
                }
                else {
                    // create outline pints
                    this.outlinePoints = state.outlinePoints.map(outlinePoint => new OutlinePoints(
                        outlinePoint[0],
                        outlinePoint[1],
                        outlinePoint[2],
                        this,
                        this.stage,
                    ));
                }
            }
            else {
                // update outline points
                // if (this.outlinePoints.length !== state.outlinePoints.length) {
                //     console.error('GazeboModel: loadState: outlinePoints length don\'t match');
                //     // return null;
                // }
                const vertices = state.outlinePoints;
                for (let i = 0, len = vertices.length; i < len; i += 1) {
                    this.outlinePoints.push(new OutlinePoints(
                        vertices[i][0],
                        vertices[i][1],
                        0,
                        this,
                        this.stage,
                    ));
                }
            }
            this.rotationPoints.hideObject();
            // update geometry of subarray
            this.updateGeometry();
            this.hideIndividualPanelMeshes()
            this.showMergedMeshes()
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.quadTreeManager.removeObject(this);

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        if (this.getParent() !== null) {
            this.getParent().removeChild(this);
        }

        this.rotationPoints.hideObject();

        // Remove outline points
        for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
            this.outlinePoints[i].removeObject();
            this.outlinePoints.splice(i, 1);
        }
    }

    changeTablePropertiesDuringCreation(properties) {
        this.changePropertiesDuringCreation(properties);
        this.boundingBox = this.getBoundingBox({ reset: true });
        this.getChildren()[0].getChildren()[0].changeTableDuringCreation();
    }

    changePropertiesDuringCreation(properties) {
        if (properties.hasOwnProperty('structureType')
        && properties.structureType !== this.structureType) {
            this.structureType = properties.structureType;
            this.tableSizeWide = parseInt(this.structureType[this.structureType.length - 3], 10);
            this.tableSizeUp = parseInt(this.structureType[this.structureType.length - 1], 10);
        }
        if (properties.hasOwnProperty('inverterType') &&
        properties.inverterType !== this.inverterType) {
            this.inverterType = properties.inverterType;
        }
        if (properties.hasOwnProperty('azimuth') &&
        properties.azimuth !== this.azimuth) {
            this.azimuth = properties.azimuth;
        }
    }

    createBoundaryFromParent() {
        const vertices = this.getParent().get2DVertices();
        for (let i = 0, len = vertices.length; i < len; i += 1) {
            this.outlinePoints.push(new OutlinePoints(
                vertices[i][0],
                vertices[i][1],
                0,
                this,
                this.stage,
            ));
        }
        this.updateGeometry();
    }

    createBoundaryFromBB() {
        const vertices = this.getChildren()[0].get3DBoundingBoxesExcludingHiddenTables();
        if (vertices[0]) {
            if (vertices[0].length > 0 && vertices[0].length === 4) {
                // remove subarray outlinePoints
                for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i,1);
                }
                // adding new outlinePoints for the gazebo
                for (let i = 0, len = vertices[0].length; i < len; i += 1) {
                    this.outlinePoints.push(new OutlinePoints(
                        vertices[0][i].x,
                        vertices[0][i].y,
                        0,
                        this,
                        this.stage,
                    ));
                }
            }
        }
        else {
            let outlinePoints = [];
            const tablePosition = this.getTables()[0].getPosition();
            const tableDimension = this.getTableDimensions();

            outlinePoints.push([
                tablePosition.x + (tableDimension.width / 2) - 0.01,
                tablePosition.y + (tableDimension.length / 2 - 0.01),
                tablePosition.z,
            ])

            outlinePoints.push([
                tablePosition.x - (tableDimension.width / 2),
                tablePosition.y + (tableDimension.length / 2),
                tablePosition.z,
            ])

            outlinePoints.push([
                tablePosition.x + (tableDimension.width / 2),
                tablePosition.y - (tableDimension.length / 2),
                tablePosition.z,
            ])

            outlinePoints.push([
                tablePosition.x - (tableDimension.width / 2),
                tablePosition.y - (tableDimension.length / 2),
                tablePosition.z,
            ])

            let points = [];

            outlinePoints.forEach((outline) => {
                points.push(new THREE.Vector3(outline[0], outline[1], 40))
            })

            let newPoints = [];

           for (let i = 0; i < 4; i++) {
                newPoints.push(utils.rotationAroundPoint(
                    tablePosition.x,
                    tablePosition.y,
                    points[i].x,
                    points[i].y,
                    utils.deg2Rad(180 - this.getAzimuth()) + this.getPanels()[0] ? this.getPanels()[0].rotation : 0,
                ));
            }

            if (newPoints.length > 0 && newPoints.length === 4) {
                for (let i = this.outlinePoints.length - 1; i >= 0; i--) {
                    this.outlinePoints[i].removeObject();
                    this.outlinePoints.splice(i,1);
                }
                // adding new outlinePoints for the gazebo
                for (let i = 0, len = newPoints.length; i < len; i += 1) {
                    this.outlinePoints.push(new OutlinePoints(
                        newPoints[i][0],
                        newPoints[i][1],
                        0,
                        this,
                        this.stage,
                    ));
                }
            }
        }
    }

    /**
     * creating new gazebo and gazebo table
     * and adding the gazebo table into gazebo
     * @returns new gazebo table
     */
    createNewGazeboTable(properties) {
        const newGazebo = this.createNewGazebo(properties);
        const templateTableMap = newGazebo.getTemplateTableMap({ withBBox: true });
        templateTableMap.hidden = false;
        templateTableMap.isMoved = true;
        const newTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
        newTable.showIndividualMesh();
        newTable.clickToAdd = true;
        newGazebo.getChildren()[0].addChild(newTable);
        // updating the panels id for the gazebo as the table
        // was added without updating the ids of panels
        const panels = newTable.getChildren();
        for (let i = 0, l = panels.length; i < l; i += 1) {
            panels[i].setId(newGazebo.getPanelId());
        }
        return newGazebo;
    }

    // remove this whole function its getting called from statemanager 
    createPanels() {
        const templateTableMap = this.getTemplateTableMap({ withBBox: true });
        templateTableMap.hidden = false;
        templateTableMap.isMoved = true;
        const newTable = new Table(this.stage, templateTableMap, { withoutContainer: false }, false);
        newTable.clickToAdd = true;
        // updating the panels id for the gazebo as the table
        // was added without updating the ids of panels
        const position = this.getTables()[0].getPosition();
        newTable.moveObject(position.x, position.y, position.z);
        const panels = newTable.getChildren();

        for (let i = 0, l = panels.length; i < l; i += 1) {
            panels[i].setId(i);
            panels[i].panelMesh.userData.fake = true;
        }
        this.children[0].children[0].children = panels;
        this.getPanels().forEach((panel) => {
            panel.parent = this.getTables()[0];
        })
        this.hideIndividualPanelMeshes();
        this.showMergedMeshes();
    }

    removePanels() {
        const panels = this.getPanels();
        panels.forEach(panel => {
            if (panel.panelMesh.userData.fake) {
                panel.removeObject(false);
            }
        })
    }
    /**
     * creating new gazebo from powergazebo class
     * and changing its properties
     * @returns new Gazebo
     */
    createNewGazebo(properties) {
        const newGazebo = new Gazebo(this.stage);
        this.getParent().addChild(newGazebo);
        newGazebo.associatedModel = this.getParent();
        newGazebo.addTableFlow = true;
        if (properties !== null) {
            newGazebo.changePropertiesDuringCreation(properties);
            newGazebo.createBoundaryFromParent();
        }

        const rowMap = {
            id: 0,
            frames: [],
        };
        const row = new Row(this.stage, rowMap, { withoutContainer: false }, true);
        newGazebo.addChild(row);
        row.saveState({ withoutContainer: false });
        return newGazebo;
    }
    async updateObject(properties) {
        const newProperties = this.saveObject();
        let updatePanelsRequired = false;
        if (Object.prototype.hasOwnProperty.call(properties, 'structureType') &&
        properties.structureType !== newProperties.structureType) {
            newProperties.structureType = properties.structureType;
            newProperties.tableSizeWide = parseInt(newProperties.structureType[newProperties.structureType.length - 3], 10);
            newProperties.tableSizeUp = parseInt(newProperties.structureType[newProperties.structureType.length - 1], 10);
            updatePanelsRequired = true;
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'inverterType') &&
        properties.inverterType !== newProperties.inverterType) {
            newProperties.inverterType = properties.inverterType;
            updatePanelsRequired = true; 
        }
        if (Object.prototype.hasOwnProperty.call(properties, 'azimuth') &&
        properties.azimuth !== newProperties.azimuth) {
            newProperties.azimuth = properties.azimuth;
            updatePanelsRequired = true;
        }
        let tablePositionFromChildrens;
        if (this.getChildren().length === 0) {
            tablePositionFromChildrens = this.previousChildrens[0].getChildren()[0];
        }
        else {
            tablePositionFromChildrens = this.getChildren()[0].getChildren()[0];
        }
        newProperties.tablePosition = this.getPositionForObjects(tablePositionFromChildrens);
        if (updatePanelsRequired) {
            try {
                if(this.newGazebo){
                    this.newGazebo.removeObject()
                }
                const newGazebo = this.createNewGazeboTable(newProperties);
                newGazebo.removeOutlinePoints()
                newGazebo.createConvexHull()
                this.previousChildrens = newGazebo.getChildren();
                newGazebo.createBoundaryFromBB();
                this.newGazebo = newGazebo;
                newGazebo.saveState();
                newGazebo.getChildren()[0].saveState();
                newGazebo.getChildren()[0].getChildren()[0].saveState();
                newGazebo.mergeGeometriesForAllPanels();
                newGazebo.hideIndividualPanelMeshes();
                if (this.tablePositionAfterRotation) {
                    newGazebo.getChildren()[0].getChildren()[0].moveObject(this.tablePositionAfterRotation.x, this.tablePositionAfterRotation.y, this.tablePositionAfterRotation.z);
                    this.tablePositionAfterRotation = null;
                }
                else {
                    newGazebo.getChildren()[0].getChildren()[0].moveObject(newProperties.tablePosition.x, newProperties.tablePosition.y, newProperties.tablePosition.z);
                    const placingInformation = newGazebo.getTables()[0].getPlacingInformation();
                    if (placingInformation.errors.length !== 0) {
                        const error = placingInformation.errors[0];
                        if (error.message === OUT_OF_POLYGON_MODEL) {
                            this.stage.eventManager.setGazeboOutOfPolygonRemoved();
                        }
                        this.stage.selectionControls.setSelectedObject(this.stage.ground);
                        this.removeObject();
                        newGazebo.removeObject({shouldSaveState: false});
                        return Promise.resolve(false);
                    }
                    newGazebo.getChildren()[0].getChildren()[0].removeIntersectingTables();
                    newGazebo.stage.selectionControls.setSelectedObject(newGazebo.getTables()[0]);
                }
                if (!this.notSelfRotate) {
                    newGazebo.getChildren()[0].getChildren()[0].removeIntersectingTables();
                    newGazebo.stage.selectionControls.setSelectedObject(newGazebo.getTables()[0]);
                }
                this.removeObject();
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: Gazebo: updateObject failed', error);
                // TODO: Restore previous properties and call new/update panel placement - don't know what
                return Promise.resolve(false);
            }
        }
    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        this.rotationStarted = true;
        const position = new THREE.Vector2(this.getTables()[0].getPosition().x, this.getTables()[0].getPosition().y);
        if (position.distanceTo(centroidPoint) > 0.0001) {
            this.notSelfRotate = true;
            this.newPosition = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                position.x,
                position.y,
                angleInRad,
            );
            this.getChildren()[0].getChildren()[0].moveObject(this.newPosition[0] - position.x, this.newPosition[1] - position.y, position.z);
            this.tablePositionAfterRotation = this.getTables()[0].getPosition();
        }
        else {
            this.notSelfRotate = false;
        }
        this.updatePropertiesWhileRotation(angleInRad);
    }

    saveInitPanelRotation() {
        const boundingBox = this.getChildren()[0].get3DBoundingBoxesExcludingHiddenTables();
        const panelMapCopy = this.getTables()[0].getChildren().map((panel) => panel.getPanelMap());
        const panelMeshCopy = [];
        const panelEdgeCopy = [];
        for (let i = 0; i < panelMapCopy.length; i++) {
            const panelMesh = createMesh(createBufferGeometry(),
                new THREE.MeshBasicMaterial({
                    transparent: false,
                    color: COLOR_MAPPINGS
                        .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                        .MESH_COLOR,
                })
            );
            const edgeMesh = new THREE.LineSegments(
                new THREE.EdgesGeometry(panelMesh.geometry),
                new THREE.LineBasicMaterial({
                    color: COLOR_MAPPINGS
                        .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                        .EDGE_COLOR,
                })
            );
            const panelGeometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                panelMapCopy[i].corners[0][0], panelMapCopy[i].corners[0][1], panelMapCopy[i].corners[0][2],
                panelMapCopy[i].corners[1][0], panelMapCopy[i].corners[1][1], panelMapCopy[i].corners[1][2],
                panelMapCopy[i].corners[2][0], panelMapCopy[i].corners[2][1], panelMapCopy[i].corners[2][2],

                panelMapCopy[i].corners[0][0], panelMapCopy[i].corners[0][1], panelMapCopy[i].corners[0][2],
                panelMapCopy[i].corners[2][0], panelMapCopy[i].corners[2][1], panelMapCopy[i].corners[2][2],
                panelMapCopy[i].corners[3][0], panelMapCopy[i].corners[3][1], panelMapCopy[i].corners[3][2],
            ]);
            panelGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            panelMesh.geometry = panelGeometry;
            panelMesh.userData.colorChange = true;
            edgeMesh.geometry = new THREE.EdgesGeometry(panelGeometry);
            panelMeshCopy.push(panelMesh);
            panelEdgeCopy.push(edgeMesh);
        }
        this.panelCopyGroup.add(...panelMeshCopy);
        this.panelCopyGroup.add(...panelEdgeCopy);
        this.hideIndividualPanelMeshes();
    }

    updatePropertiesWhileRotation(angleInRad) {
        if (this.getTables()[0].gazeboDirectionArrow !== null && this.getTables()[0].gazeboDirectionArrow !== undefined) {
            this.getTables()[0].gazeboDirectionArrow.visible = false;
        }
        this.getTables()[0].getChildren().forEach((panel) => {
            panel.gazeboRotation(angleInRad);
        });
        const centroidPoint = this.getTables()[0].getPosition();
        for (let i = 0; i < this.panelCopyGroup.children.length; i++) {
            this.rotateMeshAroundItsCenter(this.panelCopyGroup.children[i], angleInRad, centroidPoint);
            const placingInformation = this.getTables()[0].getPlacingInformation();
            if (placingInformation.errors.length !== 0) {
                const error = placingInformation.errors[0];
                if (error.message === OUT_OF_POLYGON_MODEL) {
                    if (this.panelCopyGroup.children[i].userData.colorChange) {
                        this.panelCopyGroup.children[i].material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    }
                }
            }
            else {
                if (this.panelCopyGroup.children[i].userData.colorChange) {
                    this.panelCopyGroup.children[i].material = new THREE.MeshBasicMaterial({
                        transparent: false,
                        color: COLOR_MAPPINGS
                            .PANEL[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                            .MESH_COLOR,
                    })
                }
            }
        }
    }

    rotateMeshAroundItsCenter(mesh, angleInRad, centroidPoint) {
        for (let i = 0, l = mesh.geometry.attributes.position.array.length; i < l; i += 3) {
            const oldX = mesh.geometry.attributes.position.array[i] +
                mesh.position.x;

            const oldY = mesh.geometry.attributes.position.array[i + 1] +
                mesh.position.y
                
            const newXY = utils.rotationAroundPoint(
                centroidPoint.x,
                centroidPoint.y,
                oldX,
                oldY,
                angleInRad,
            );
            mesh.geometry.attributes.position.array[i] += newXY[0] - oldX;
            mesh.geometry.attributes.position.array[i + 1] += newXY[1] - oldY;
            mesh.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    onGazeboRotationEnd() {
        // dont check parentInfo
        const parentInfoCheck = false;
        this.showObjectLayer();
        this.updateAfterRotation({ parentInfoCheck });
    }

    async updateAfterRotation({ parentInfoCheck } = { parentInfoCheck: true }) {
        if (this.rotationStarted) {
            this.panelCopyGroup.clear();
            const calcAzimuth = parseFloat((this.azimuth - utils.rad2Deg(this.getTables()[0].getChildren()[0].rotation)).toFixed(2)) % 360;
            const azimuth = calcAzimuth > 0 ? calcAzimuth : calcAzimuth + 360;
            const updateProperties = { azimuth: azimuth.toFixed(2) };
            updateProperties.parentInfoCheck = parentInfoCheck;
            const placingInformation = this.getTables()[0].getPlacingInformation();
            if (placingInformation.errors.length !== 0 && parentInfoCheck) {
                const error = placingInformation.errors[0];
                if (error.message === OUT_OF_POLYGON_MODEL) {
                    this.stage.eventManager.setGazeboOutOfPolygonRemoved();
                }
                this.removeObject();
            }
            else {
                await this.updateObject(updateProperties, true);
                if (!this.notSelfRotate) {
                    this.stage.selectionControls.setSelectedObject(this.newGazebo.getChildren()[0].getChildren()[0]);
                }
            }
        }
        this.rotationStarted = false;
    }

    getPositionForObjects(table) {
        if (!Array.isArray(table)) {
            return utils.getCentroidOfObjects([table]);
        }
        return utils.getCentroidOfObjects(table);
    }

    /**
     * to get the number of panels for gazebo summary.
     * @returns number of panels
     */
    gazeboType() {
        return this.structureType;
    }
    getInverterType() {
        return this.inverterType;
    }
    getInverterCountGazebos() {
        return (this.tableSizeUp * this.tableSizeWide) / 4;
    }

    getAcSize(){
        const inverterCountGazebos = this.getInverterCountGazebos();
        if (this.inverterType === DEFAULT_GAZEBO_INVERTER_TYPE){
            return inverterCountGazebos * 0.29 * 1000;
        }else {
            return inverterCountGazebos * 0.3 * 1000;
        }
    }
    getInverterData() {
        const panels = [];
        const inverterCountGazebos = this.getInverterCountGazebos();
        const allPanels = this.getPanels();
        for (let i = 0; i < inverterCountGazebos; i++) {
            const panel = {
                gazeboID : this.id,
                panelId: i,
            }
            panels.push(panel);
        }
        const microInverterMap = {
            panels,
            stringLength: 1,
            microInverterCount: inverterCountGazebos,
            inverterDatabaseId: this.inverterType === DEFAULT_GAZEBO_INVERTER_TYPE?6289 : 10931,
        }
        return microInverterMap;
    }
    validateStructures() {
        if (this.structureType === undefined) {
            return;
        }
        this.structureErrors = getStructureValidationErrorMessages(
            this,
            this.structureType,
        );
    }
 
    getPossibleAzimuths({ isCreation } = { isCreation: false }) {
        // get the vertices in clockwise order
        let vertices = this.get2DVertices();
        if (this.getParent()) vertices = this.getParent().get2DVertices();
        if (vertices.length === 0) {
            return [];
        }
        if (checkClockwise(vertices)) {
            vertices.reverse();
        }

        // getting normal for each pair
        vertices.push(vertices[0]);
        const azimuths = [];
        for (let idx = 0; idx < vertices.length - 1; idx += 1) {
            let angle = toDegrees(Math.atan2(
                (vertices[idx + 1][1] - vertices[idx][1]),
                -(vertices[idx + 1][0] - vertices[idx][0]),
            ));
            // atan2 returns between -pi and pi and we want between 0 and 360. 0 being in North
            if (angle < 0) angle += 360;
            azimuths.push(angle.toFixed(2));
        }

        return azimuths.sort((a, b) => a - b).filter((x, i, a) => a.indexOf(x) === i);
    }
    getGazeboType(){
        let gazeboMap = {
            gazebo_components: this.structureType,
        };
        return gazeboMap;
    }

    static getObjectType() {
        return 'Gazebo';
    }
}


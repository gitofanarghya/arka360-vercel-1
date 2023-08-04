import * as THREE from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import Panel from "./Panel";
import Subarray from './Subarray'
import Row from './Row'
import BaseObject from "../../objects/BaseObject";
import * as raycastingUtils from "../../utils/raycastingUtils";
import * as JSTSConverter from "../../utils/JSTSConverter";
import * as JSTS from "jsts";
import * as utils from '../../utils/utils';
import {
    getNearestSubarrayForTableSnapping,
} from '../../utils/subarrayUtils';
import {
    CREATED_STATE,
    DELETED_STATE,
    PANEL_ORIENTATION_PORTRAIT,
    OUT_OF_ASSOCIATED_MODEL_ERROR,
    TABLE_OUT_OF_GROUND_ERROR,
    TABLE_TILT_LOWER_THAN_PARENT_TILT_ERROR,
    COMBINATION_IS_NOT_POSSIBLE_ERROR,
    DC_CAP_REACHED_ERROR,
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    OUT_OF_POLYGON_MODEL,
} from '../../coreConstants';
import { COLOR_MAPPINGS, VISUAL_STATES } from '../visualConstants';
import PolygonModel from '../model/PolygonModel';
import Ground from '../../../core/objects/ground/Ground';
import SmartroofFace from "../model/smartroof/SmartroofFace";
import Gazebo from "../../lib/PowerGazebo";
import img from '../../../assets/img/arrowGazebo.png'

function getImageUrl(path) {
    return new URL(path, import.meta.url).href
}

export default class Table extends BaseObject {
    constructor(
        stage, tableMap, { withoutContainer } = { withoutContainer: false }, newFlow = false,
    ) {
        super(stage);

        this.stage = stage;
        this.id = parseInt(tableMap.id);
        this.name = `Table #${this.id.toString()}`;

        this.clickToAdd = false;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // TODO: shift table map to 0 0 0 when the new flow is not true
        const position = new THREE.Vector3();
        if (!newFlow) {
            let totalCorners = 0;
            for (let panelMap of tableMap.panels !== undefined ? tableMap.panels : []) {
                for (let i = 0, l = panelMap.corners.length; i < l; i += 1) {
                    position.x += panelMap.corners[i][0];
                    position.y += panelMap.corners[i][1];
                    position.z += panelMap.corners[i][2];
                    totalCorners += 1;
                }
            }
            position.divideScalar(totalCorners);
        }
        for (let panelMap of tableMap.panels !== undefined ? tableMap.panels : []) {
            for (let i = 0, l = panelMap.corners.length; i < l; i += 1) {
                panelMap.corners[i][0] = panelMap.corners[i][0] - position.x;
                panelMap.corners[i][1] = panelMap.corners[i][1] - position.y;
                panelMap.corners[i][2] = panelMap.corners[i][2] - position.z;
            }
            let panel = new Panel(stage, panelMap);
            this.addChild(panel);
        }

        this.useIndividualMesh = false;

        this.isMoved = tableMap.hasOwnProperty("isMoved") ? tableMap.isMoved : false;
        this.hidden = false;

        this.linked = false;

        if (tableMap.hasOwnProperty("hidden") ? tableMap.hidden : false) {
            this.hideTable();
        }

        for (let panel of this.getChildren()) {
            panel.saveState({ withoutContainer: withoutContainer });
        }

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        if (newFlow) { // new flow is only true in case of auto panel placement
            // as in the new flow the table is at origin and moved to the required position
            this.moveObject(tableMap.position.x, tableMap.position.y, tableMap.position.z);
        }
        else {
            // why this is added (this.moveObject(position.x, position.y, position.z);)
            // load Object and copy paste
            // this.moveObject(position.x, position.y, position.z);
            this.moveObject(tableMap.position.x, tableMap.position.y, tableMap.position.z);
        }

        this.updateVisualsAfterLoadingAndCreation();
    }

    exportAsSTL() {
        const children = this.getChildren();
        const singleGeometry = BufferGeometryUtils
            .mergeGeometries(children.map((child) => {
                const panelMesh = child.exportMesh();
                return panelMesh.geometry;
            }));

        const mesh = new THREE.Mesh(singleGeometry, new THREE.MeshBasicMaterial());

        return [{
            mesh,
            name: `${this.getParent().getParent().name} ${this.getParent().name} ${this.name}`,
        }];
    }

    exportAsCollada() {
        const children = this.getChildren();
        const singleGeometry = BufferGeometryUtils
            .mergeGeometries(children.map((child) => {
                const panelMesh = child.exportMesh();
                return panelMesh.geometry;
            }));

        const mesh = new THREE.Mesh(
            singleGeometry,
            new THREE.MeshLambertMaterial({
                color: 0x0062A3,
                transparent: false,
            }),
        );
        mesh.name = `${this.getParent().getParent().name} ${this.getParent().name} ${this.name}`;

        return [mesh];
    }

    saveObject(isCopy = false) {

        let tableData = {
            type: Table.getObjectType(),
            subarrayUUID: this.getParent().getParent().getUUID(),
        };

        // save id and name
        tableData.id = this.id;
        tableData.name = this.name;

        // saving properties
        tableData.hidden = this.hidden;
        tableData.isMoved = this.isMoved;

        // save table map
        tableData.tableMap = this.getTableMap();

        if (isCopy) {
            tableData.uuid = this.uuid;
            // Temp fix for EW: REWORK REQUIRED
            if (this.linkedTable){
                tableData.linked = this.linked;
                let linkedTableCopy = {
                    type: Table.getObjectType(),
                    subarrayUUID: this.linkedTable.getParent().getParent().getUUID(),
                };
                linkedTableCopy.id = this.linkedTable.id;
                linkedTableCopy.name = this.linkedTable.name;
                linkedTableCopy.uuid = this.linkedTable.uuid;
                linkedTableCopy.hidden = this.linkedTable.hidden;
                linkedTableCopy.isMoved = this.linkedTable.isMoved;
                linkedTableCopy.tableMap = this.linkedTable.getTableMap();                
                tableData.linkedTable = linkedTableCopy;
            }
        }
        return tableData;
    }

    loadObject(tableData, isPaste) {
        // load id and name
        if (!isPaste) {
            console.error('ERROR: Table: loadObject: Not implemented when not pasting');
        }

        this.id = this.getSubarray().getHighestTableId() + 1;
        this.name = "Table #" + this.id.toString();

        // get highest panel id in the subarray
        let highestPanelId = this.getSubarray().getHighestPanelId();

        // initialise table map
        this.hidden = false;
        this.isMoved = true;
        for (let panel of this.getChildren()) {
            panel.id = highestPanelId + 1;
            panel.name = "Panel #" + this.id.toString();
            highestPanelId += 1;
        }

        this.getSubarray().structureUpdateRequired = true;
        if (this.getSubarray() instanceof Gazebo) {
            if (this.rotationPoints)  this.rotationPoints.getSubarray().removeObject();
            this.getSubarray().createRotation();
        }

        if (isPaste) {
            if (tableData.linkedTable) {
                const { subarrayUUID } = tableData.linkedTable;
                const subarray = utils.findBaseObjectInChildren(
                    subarrayUUID,
                    this.stage.ground,
                );

                const object = new Table(this.stage, tableData.linkedTable.tableMap);
                object.showIndividualMesh();
                subarray.getChildren()[0].addChild(object);
                object.loadObject(tableData.linkedTable, true);
                this.linkedTable = object;
                this.linked = true;
                object.linkedTable = this;
                object.linked = true;

            }
        }
    }

    getState() {
        const position = this.getPosition();
        const state =  {
            uuid: this.uuid,
            id: this.id,
            name: this.name,
            parent: this.getParent() ? this.getParent().uuid : null,
            hidden: this.hidden,
            linked: this.linked,
            linkedTable: this.linkedTable ? this.linkedTable.uuid : null,
            position: {
                x: position.x,
                y: position.y,
                z: position.z,
            },
        };
        return state;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        } else {
            const { parent, id, name, hidden, position } = state;
            this.id = id;
            this.name = name;
            this.hidden = hidden;
            this.linked = state.linked;
            // if (state.linkedTable) this.linkedTable = this.stage.getObject(state.linkedTable);
            this.updateVisualsAfterLoadingAndCreation();

            if (parent) {
                const parentObject = this.stage.getObject(parent);
                if (!this.getParent()) {
                    parentObject.addChild(this, undefined, true);
                } else if (parentObject !== this.getParent()) {
                    this.getParent().removeChild(this);
                    parentObject.addChild(this, undefined, true);
                }
            }

            // TEMP FIX FOR EW: REWORK REQUIRED
            if (this.getSubarray() && this.getSubarray().eastWestEnabled) {
                if (!this.objectsGroup.parent) {
                    this.stage.sceneManager.scene.add(this.objectsGroup);
                }
            }
            
            this.setPosition(position);

            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                this.stage.sceneManager.scene.add(this.objectsGroup);
            }

            if (this.getSubarray()) {
                this.getSubarray().structureUpdateRequired = true;
            }
            if (this.getSubarray() instanceof Gazebo) {
                this.hideIndividualMesh();
                if (this.getSubarray().rotationPoints) {
                    this.getSubarray().createBoundaryFromBB();
                    this.getSubarray().updateGeometry();
                    this.getSubarray().showMergedMeshes();
                    this.getSubarray().rotationPoints.hideObject();
                    // this.stage.selectionControls.setSelectedObject(this.stage.ground);
                }
            }
        }
    }

    clearState() {
        // select ground if selected
        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        if (this.getParent()) {
            this.getParent().removeChild(this);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    // Geometry Manipulation

    moveObject(deltaX, deltaY, deltaZ = 0, rackMove = false) {
        this.objectsGroup.position.set(
            this.objectsGroup.position.x + deltaX,
            this.objectsGroup.position.y + deltaY,
            this.objectsGroup.position.z + deltaZ,
        );
        if (this.getParent() !== null && this.getParent() !== undefined) {
            if (this.getSubarray() instanceof Gazebo) {
                if (this.getSubarray().rotationPoints) {
                    // to update the bounding box of gazebo while moving and its rotation point.
                    this.getSubarray().createBoundaryFromBB();
                    this.getSubarray().updateGeometry();
                    this.getSubarray().rotationPoints.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
                    this.getSubarray().rotationPoints.lineMesh.visible = false;
                }
            }
        }

        this.moveDimensions(deltaX, deltaY, deltaZ);

        const children = this.getChildren();
        for (let i = 0, l = children.length; i < l; i += 1) {
            children[i].moveObject();
        }

        this.saveState();
        if (!this.stage.selectionControls.isMultiSelect() && this.isSelected) {
            if(this.linked && !rackMove ) {
                this.linkedTable.moveObject(deltaX, deltaY, 0, true);
            }
        }
    }

    setPosition(position) {
        this.objectsGroup.position.set(
            position.x,
            position.y,
            position.z,
        );
    }

    getLocalPosition(subarray) {
        if (!subarray) {
            subarray = this.getSubarray();
        }
        return subarray.globalToLocalCoordinates(new THREE
            .Vector2(this.getPosition().x, this.getPosition().y), subarray.getBoundingBox());
    }

    getPlacingInformation(mousePoint) {
        const subarrayParentModel = this.getSubarray().getAssociatedModel();
        let position = this.getPosition();
        const offset = 0.01;
        let boundingBoxVertices = [
            [position.x - offset, position.y - offset],
            [position.x - offset, position.y + offset],
            [position.x + offset, position.y - offset],
            [position.x + offset, position.y + offset],
        ];
        if (mousePoint) {
            boundingBoxVertices = [
                [mousePoint.x - offset, mousePoint.y - offset],
                [mousePoint.x - offset, mousePoint.y + offset],
                [mousePoint.x + offset, mousePoint.y + offset],
                [mousePoint.x + offset, mousePoint.y - offset],
            ];
        }

        // Two conditions for placement = at least one vertex should be on the associated model of
        // the subarray & all vertices should be open (i.e. no vertex should have a model on top
        // of it on placement)

        const response = {};
        let parentExists = true;
        response.errors = [];

        const allModels =
            raycastingUtils.getAllModelsBelowVertices(boundingBoxVertices, this.stage);

        let newParent;
        for (let idx = 0, len = allModels.length; idx < len; idx += 1) {
            if (!allModels[idx][0].isIgnored()) {
                [newParent] = allModels[idx];
                break;
            }
        }

        // if parent is undefined we dont have to check for inside model error.
        if (newParent) {
            if (this.getSubarray() instanceof Gazebo) {
                let outlinePoints = [];
                const tablePosition = this.getPosition();
                const tableDimension = this.getSubarray().getTableDimensions();

                outlinePoints.push([
                    tablePosition.x + (tableDimension.width / 2),
                    tablePosition.y + (tableDimension.length / 2),
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
                        utils.deg2Rad(180 - this.getSubarray().getAzimuth()) + this.getChildren()[0].rotation,
                    ));
                }

                let dontPlace = false;
                for (let i = 0; i < newPoints.length; i++) {
                    if (!utils.checkPointInsideVertices(newParent.get2DVertices(), newPoints[i])) {
                        dontPlace = true;
                        break;
                    }
                }

                if (dontPlace) {
                    response.errors.push(new Error(OUT_OF_POLYGON_MODEL));
                    parentExists = false;
                }
                // parentExists = false;
            }
        }

        // we cannot place the table on other model after it's placed on a model.
        // but it can be placed while gazebomode is enabled
        if (newParent !== subarrayParentModel && !this.stage.gazeboMode.enable) {
            response.errors.push(new Error(OUT_OF_ASSOCIATED_MODEL_ERROR));
            parentExists = false;
        }
        if (!raycastingUtils.areVerticesOnGround(utils
                .convertArrayToVector(this.get2DVertices()), this.stage)) {
            response.errors.push(new Error(TABLE_OUT_OF_GROUND_ERROR));
            parentExists = false;
        }
        if (Number.isNaN(this.getSubarray().getTiltWrtParentSurface(newParent))) {
            if (newParent.getTilt() !== this.getSubarray().getState().tilt && this.getSubarray().getState().mountType === SUBARRAY_RACK_STYLE_FLUSH) {
                parentExists = true;
            } else {
                response.errors.push(new Error(COMBINATION_IS_NOT_POSSIBLE_ERROR));
                parentExists = false;
            }
        }

        if (parentExists) {
            newParent = this.clickToAdd ? newParent : this.getSubarray().getAssociatedModel();
            response.parent = newParent;
        }
        return response;
    }

    updateWhilePlacing(placingInformation) {
        if (placingInformation.errors.length !== 0) {
            return;
        }
        // if (placingInformation.parent !== this.getSubarray().getParent()) {
        //     this.getSubarray().changeParent(placingInformation.parent);
        //     this.getSubarray().associatedModel = placingInformation.parent;
        //     this.getSubarray().createBoundaryFromParent();
        //     this.changeTableDuringCreation();
        // }
    }

    async updateWhileHovering(prevParent, parent, forGazebo = false) {
        if (this.parent == null || this.parent.parent == null) {
            return;
        }
        if (prevParent) {
            const parentSubarray = this.getSubarray();
            parentSubarray.changeParent(parent);
            const newSubarrayProperties = this.getSubarray().getState();
            if (newSubarrayProperties.mountType === SUBARRAY_RACK_STYLE_FLUSH) {
                newSubarrayProperties.azimuth = parent.getAzimuth();
                newSubarrayProperties.tilt = parent.getTilt();
            }
            if (parent instanceof PolygonModel || parent instanceof SmartroofFace ||
                parent instanceof Ground) {
                parentSubarray.changeTablePropertiesDuringCreation(newSubarrayProperties);
                if (forGazebo) {
                    this.stage.eventManager.addGazeboMode(parentSubarray);
                }
                else {
                    this.stage.eventManager.addTableMode(parentSubarray);
                }
            }
        }
    }

    getSubarrayProperties(placedSubarray, placableSubarray) {
        if (placedSubarray != null && placedSubarray != undefined) {
            return {
                name: placedSubarray.name,
                azimuth: placedSubarray.azimuth,
                moduleProperties: placedSubarray.moduleProperties,
                bifacialEnabled: placedSubarray.bifacialEnabled,
                moduleSpacingUp: placedSubarray.moduleSpacingUp,
                moduleSpacingWide: placedSubarray.moduleSpacingWide,
                mountHeight: placedSubarray.mountHeight,
                mountType: placedSubarray.mountType,
                panelOrientation: placedSubarray.panelOrientation,
                rowSpacing: placedSubarray.rowSpacing,
                rowSpacingMode: placedSubarray.rowSpacingMode,
                structureType: placedSubarray.structureType,
                tableSizeUp: placedSubarray.tableSizeUp,
                tableSizeWide: placedSubarray.tableSizeWide,
                tableSpacing: placedSubarray.tableSpacing,
                tilt: placedSubarray.tilt,
            }
        }

        return {
            name: placableSubarray.name,
            azimuth: placableSubarray.azimuth,
            moduleProperties: placableSubarray.moduleProperties,
            bifacialEnabled: placableSubarray.bifacialEnabled,
            moduleSpacingUp: placableSubarray.moduleSpacingUp,
            moduleSpacingWide: placableSubarray.moduleSpacingWide,
            mountHeight: placableSubarray.mountHeight,
            mountType: placableSubarray.mountType,
            panelOrientation: placableSubarray.panelOrientation,
            rowSpacing: placableSubarray.rowSpacing,
            rowSpacingMode: placableSubarray.rowSpacingMode,
            structureType: placableSubarray.structureType,
            tableSizeUp: placableSubarray.tableSizeUp,
            tableSizeWide: placableSubarray.tableSizeWide,
            tableSpacing: placableSubarray.tableSpacing,
            tilt: placableSubarray.tilt,
        }
    }

    // TODO: add a function to update the subarrays for removed tables.
    removeIntersectingTables() {
        const intersectingTables =
            raycastingUtils.getAllTablesBelowVertices(this.get2DVertices(), this.stage);
        for (let i = 0, l = intersectingTables.length; i < l; i += 1) {
            if (intersectingTables[i] !== this) {
                intersectingTables[i].removeObject();
            }
        }
    }

    placeObject(deltaX = 0, deltaY = 0, options = {}, isLinked = true) {
        // JUGAAD: panels were shaking because the subarrays had different azimuth
        // TODO: FIX for east west copypaste
        if (this.getSubarray() && this.getSubarray().rackSubarray) {
            if (this.getSubarray().objectType === 'EastWestRack' && this.getSubarray().azimuth === this.getSubarray().rackSubarray.azimuth) {
                let newAzimuth = this.getSubarray().rackSubarray.azimuth + 180;
                if (newAzimuth >= 360) newAzimuth -= 360;
                this.getSubarray().azimuth = newAzimuth;
                this.getSubarray().updateGeometry();
            }
        }
        // table is placed
        this.notPlaced = false;
        const defaultOptions = {
            objectSelected: false,
        };
        const customOptions = Object.assign(defaultOptions, options);

        // mark table as moved for solar access calculation
        this.isMoved = true;

        this.moveObject(deltaX, deltaY, 0);

        // check if each panel in the table is placable in the current position
        const errorsWhilePlacing = this.getPlacingInformation().errors;

        if (errorsWhilePlacing.length !== 0 || this.stage.getRemainingDcSize() < 0) {
            this.removeObject(
                undefined,
                undefined, { objectSelected: customOptions.objectSelected },
            );
            if (errorsWhilePlacing.length !== 0) {
                this.stage.eventManager.customErrorMessage(errorsWhilePlacing[0].message, 'Table');
            } else {
                this.stage.eventManager.dcCapSizeExceeded();
            }

            return false;
        }

        // show all hidden tables
        let hiddenTablesList = this.getSubarray().getHiddenTables();
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.showTable();
        }

        this.removeIntersectingTables();

        // hide remaining hidden tables
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.hideTable();
        }
        // change parent to new row and handel the consequences
        this.getSubarray().findAndSetNewParentForTable(this);

        // place table along z (only required when the roof is tilted)
        const lowestVertex = this.getLowestVertex();
        const associatedModelZ = Math.max(
            this.getSubarray().getAssociatedModel().getZOnTopSurface(
                lowestVertex.x,
                lowestVertex.y,
            ),
            0,
        );
        let deltaZ = this.getSubarray().getMountHeight() - (lowestVertex.z - associatedModelZ);
        this.moveObject(0, 0, deltaZ);

        // update dimensions
        for (let dimension in this.dimensionObjects ) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        if (this.getSubarray() instanceof Gazebo) {
            if (this.getSubarray().rotationPoints) {
                this.getSubarray().createBoundaryFromBB();
                this.getSubarray().updateGeometry();
            }
        }

        this.getSubarray().structureUpdateRequired = true;
        this.getSubarray().updateRail();

        if (isLinked) {
            if (this.linkedTable) {
                this.linkedTable.placeObject(deltaX, deltaY, options, false)
            }
        }
        this.saveState();
        return true;
    }

    /**
     * removes the table from the scene and returns the intersecting tables
     * without using the actual flow of removeObject
     */
    removeIntersectingTablesFromScene() {
        const intersectingTables =
            raycastingUtils.getAllTablesBelowVertices(this.get2DVertices(), this.stage);
        const tablesRemoved = [];
        for (let i = 0, l = intersectingTables.length; i < l; i += 1) {
            if (intersectingTables[i] !== this) {
                if (intersectingTables[i].getSubarray().addTableFlow) {
                    this.stage.addTableMode
                        .removeIntersectedSubarray(intersectingTables[i].getSubarray());
                    intersectingTables[i].removeObject();
                } else {
                    intersectingTables[i].removePanelsMeshFromScene();
                    tablesRemoved.push(intersectingTables[i]);
                    // intersectingTables[i].getSubarray()
                    //     .mergeGeometriesForAllPanels({ excludeTables: [intersectingTables[i]] });
                }
            }
        }
        return tablesRemoved;
    }

    getIntersectedTableWithoutRemoving(shouldHideMergedMesh = false) {
        const intersectingTables =
            raycastingUtils.getAllTablesBelowVertices(this.get2DVertices(), this.stage);
        const GazeboRemoved = [];
        const subarrayToBeUpdated = [];
        for (let i = 0, l = intersectingTables.length; i < l; i += 1) {
            if (intersectingTables[i] !== this) {
                if (intersectingTables[i].getSubarray() instanceof Gazebo) {
                    GazeboRemoved.push(intersectingTables[i].getSubarray())
                    if (shouldHideMergedMesh) {
                        intersectingTables[i].getSubarray().hideMergedMeshes(); 
                        intersectingTables[i].hideIndividualMesh();
                    }
                }
                else {
                    if (!subarrayToBeUpdated.includes(intersectingTables[i].getSubarray())) {
                        subarrayToBeUpdated.push(intersectingTables[i].getSubarray());
                    }
                }
            }
        }
        subarrayToBeUpdated.forEach(subarray => {
            subarray.hideMergedMeshes();
        });
        return {
            GazeboRemoved, 
            subarrayToBeUpdated
        };
    }

    placeObjectForAddTable(deltaX = 0, deltaY = 0) {
        // mark table as moved for solar access calculation
        this.isMoved = true;

        this.moveObject(deltaX, deltaY, 0);

        // check if each panel in the table is placable in the current position
        const placingInformation = this.getPlacingInformation();
        const errorsWhilePlacing = placingInformation.errors;
        if (placingInformation.parent !== this.getSubarray().getParent() && placingInformation.parent) {
            this.getSubarray().changeParent(placingInformation.parent);
            this.getSubarray().associatedModel = placingInformation.parent;
            this.getSubarray().createBoundaryFromParent();
            this.changeTableDuringCreation();
        }
        if (errorsWhilePlacing.length !== 0 || this.stage.getRemainingDcSize() < 0) {
            this.removeObject(
                undefined,
                undefined, { objectSelected: true },
            );
            if (errorsWhilePlacing.length !== 0) {
                this.stage.eventManager.customErrorMessage(errorsWhilePlacing[0].message, 'Table');
                return errorsWhilePlacing[0];
            }
            this.stage.eventManager.dcCapSizeExceeded();
            return new Error(DC_CAP_REACHED_ERROR);
        }

        if (this.clickToAdd && placingInformation.parent) {
            this.getSubarray().changeParent(placingInformation.parent);
            this.getSubarray().associatedModel = placingInformation.parent;
        }

        // show all hidden tables
        let hiddenTablesList = this.getSubarray().getHiddenTables();
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.showTable();
        }

        // const tablesRemoved = this.removeIntersectingTablesFromScene();
        // for removing the intersecting tables while 
        // copy paste the gazebo by clicking alt
        if (this.getSubarray() instanceof Gazebo && !this.getSubarray().addTableMode){
            this.removeIntersectingTables();
        }

        // hide remaining hidden tables
        for (let hiddenTable of hiddenTablesList) {
            hiddenTable.hideTable();
        }

        this.getSubarray().removeOutlinePoints();
        // this.getSubarray().createConvexHull();

        const allSubarrayProperties = [];
        const allSubarraySiblings = this.getSubarray().getParent().getChildren();
        for (let i = 0, len = allSubarraySiblings.length; i < len; i += 1) {
            if (allSubarraySiblings[i] instanceof Subarray) {
                const property = allSubarraySiblings[i].getState();
                property.subarray = allSubarraySiblings[i];
                allSubarrayProperties.push(property);
            }
        }
        if (this.stage.snapManager.isSnapped()) {
            const snapInfo = getNearestSubarrayForTableSnapping(
                allSubarrayProperties,
                this,
                this.stage.mousePoint.clone(),
            );
            if (snapInfo.hasOwnProperty('snappingSubarray')) {
                const localTablePosition = snapInfo.snappingSubarray
                    .globalToLocalCoordinates(
                        this.getPosition(true),
                        snapInfo.snappingSubarray.getBoundingBox(),
                    );
                const rowMinY = snapInfo.snappingRowBBox.minY;
                const rowMaxY = snapInfo.snappingRowBBox.maxY;
                const tableLength = this.getSubarray().getTableDimensions(true).length *
                    Math.cos(utils.toRadian(this.getSubarray().getTilt()));
                const tableMinY = snapInfo.tableLocalPosition.y - (tableLength / 2);
                const tableMaxY = snapInfo.tableLocalPosition.y + (tableLength / 2);
                const tableWithinRows = (rowMinY <= tableMaxY && rowMinY >= tableMinY) ||
                    (rowMaxY <= tableMaxY && rowMinY >= tableMinY) ||
                    (tableMaxY <= rowMaxY && tableMaxY >= rowMinY) ||
                    (tableMinY <= rowMaxY && tableMinY >= rowMinY);
                if (tableWithinRows) {
                    const surfaceTilt = snapInfo.snappingSubarray.getParent().getTilt();
                    const subarrayTilt = snapInfo.snappingSubarray.getTilt();
                    const yAlongBBoxFactor = Math.cos(utils.deg2Rad(subarrayTilt - surfaceTilt));

                    const tableHighestY = localTablePosition.y +
                        ((this.getSubarray().getTableDimensions().length * yAlongBBoxFactor) / 2);
                    const panelLength = (
                            this.getSubarray().panelOrientation === PANEL_ORIENTATION_PORTRAIT ?
                            this.getSubarray().moduleProperties.moduleLength :
                            this.getSubarray().moduleProperties.moduleWidth
                        ) +
                        this.getSubarray().moduleSpacingUp;
                    const num = Math.round((snapInfo.snappingRowBBox.maxY - tableHighestY) /
                        (panelLength * yAlongBBoxFactor));
                    const hDiff = num * panelLength * (Math.sin(utils.deg2Rad(subarrayTilt)) -
                        (Math.tan(utils.deg2Rad(surfaceTilt)) *
                            Math.cos(utils.deg2Rad(subarrayTilt))));

                    const calculatedMountHeight =
                        parseFloat((snapInfo.snappingSubarray.mountHeight + hDiff).toFixed(3));
                    // Jugad Fix: while using addtable panels are comming on ground or inside structure.
                    if (calculatedMountHeight > 0 && !(this.getSubarray() instanceof Gazebo)) {
                        this.getSubarray().mountHeight = calculatedMountHeight;
                    }
                }
            }
        }
        // place table along z (only required when the roof is tilted)
        const lowestVertex = this.getLowestVertex();
        const associatedModelZ = Math.max(
            this.getSubarray().getAssociatedModel().getZOnTopSurface(
                lowestVertex.x,
                lowestVertex.y,
            ),
            0,
        );
        const deltaZ = this.getSubarray().getMountHeight() - (lowestVertex.z - associatedModelZ);
        this.moveObject(0, 0, deltaZ);

        // update dimensions
        for (let dimension in this.dimensionObjects) {
            this.dimensionObjects[dimension].handleAssociatedObjectPlace(this);
        }

        if (this.getSubarray().rotationPoints) {
            this.getSubarray().createBoundaryFromBB();
            this.getSubarray().updateGeometry();
        }

        this.saveState();
        return {
            isSuccess: true,
            tablesRemoved: {},
        };
    }

    changeTableDuringCreation() {
        while (this.getChildren().length > 0) {
            this.getChildren()[0].removeObject();
        }
        const tableMap = this.getSubarray().getCustomTableMapForAddTable(
            new THREE.Vector3(), { withBBox: true },
        );
        const panelMaps = tableMap.panels !== undefined ? tableMap.panels : [];
        for (let i = 0, len = panelMaps.length; i < len; i += 1) {
            const panel = new Panel(this.stage, panelMaps[i]);
            this.addChild(panel);
            panel.switchVisualState(this.getVisualState(), true);
            panel.addToScene();
        }

        this.getSubarray().getTableDimensions(true);
        const position = this.getPosition(true);
        // TODO : change this method
        const highestZ = utils.getHighestZ(this.stage.ground) + 5;
        this.moveObject(0, 0, highestZ - position.z);

        // JUGAD: need to do this temp action because of some bug in BufferGeometry for Panel.
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.stage.sceneManager.scene.add(this.objectsGroup);
    }

    getLowestVertex() {
        let lowestVertex = new THREE.Vector3(0, 0, Infinity);
        for (let panel of this.getChildren()) {
            let panelLeastHighVertex = panel.getLowestVertex();
            if (panelLeastHighVertex.z < lowestVertex.z) {
                lowestVertex = panelLeastHighVertex;
            }
        }
        return lowestVertex;
    }

    shouldPropagate(model) {
        if (model instanceof Panel || model instanceof Subarray || model instanceof Table ||
            model instanceof Row) {
            return true;
        }
        return false;
    }

    handleDragStart() {
        for (let childIndex = 0; childIndex < this.children.length; childIndex += 1) {
            const child = this.children[childIndex];
            if (this.shouldPropagate(child)) {
                child.handleDragStart();
            }
        }
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    handleDragEnd(deltaX = 0, deltaY = 0) {
        for (let childIndex = 0; childIndex < this.children.length; childIndex += 1) {
            const child = this.children[childIndex];
            if (this.shouldPropagate(child)) {
                child.handleDragEnd();
            }
        }
        if (this.getSubarray() instanceof Gazebo) {
            this.placeObjectForAddTable(deltaX, deltaY, { objectSelected: true });
            this.getSubarray().saveState();
        } 
        else {
            this.placeObject(deltaX, deltaY, { objectSelected: true });
        }
    }

    // Visual Functions

    updateVisualsBasedOnStates() {}

    switchVisualState(newVisualState) {
        super.switchVisualState(newVisualState, true);
    }

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.TABLE;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    // Helper functions

    showTable() {
        if (this.hidden) {
            this.hidden = false;
            for (let child of this.getChildren()) {
                child.showPanel();
            }
            this.saveState();
        }
    }

    hideTable() {
        if (!this.hidden) {
            this.hidden = true;
            for (let child of this.getChildren()) {
                child.hidePanel();
            }
            this.saveState();
        }
    }

    showObjectLayer() {
        for (let child of this.getChildren()) {
            child.showObjectLayer();
        }
    }

    hideObjectLayer() {
        for (let child of this.getChildren()) {
            child.hideObjectLayer();
        }
    }

    isHidden() {
        return this.hidden;
    }

    getDcSize() {
        return this.getNumberOfPanels() * this.getSubarray().getPanelSize();
    }

    getNumberOfPanels() {
        if (this.hidden) {
            return 0;
        }
        return this.getChildren().length;
    }

    getNumberOfPanelsIncludingHidden() {
        let count = 0;
        for (let i = this.getChildren().length - 1; i >= 0; i--) {
            if (this.getChildren()[i] instanceof Panel) {
                count++;
            }
        }
        return count;
    }

    getTableMap({ withSolarAccess } = { withSolarAccess: true }) {
        let tableMap = {
            id: this.id,
            panels: [],
            position: {
                x: this.getPosition().x,
                y: this.getPosition().y,
                z: this.getPosition().z,
            },
        };
        if (this.isMoved) tableMap.isMoved = this.isMoved;
        if (this.hidden) tableMap.hidden = this.hidden;

        for (let panel of this.getChildren()) {
            const panelMap = panel.getPanelMap({ withSolarAccess: withSolarAccess });
            if(panelMap.corners.length > 0) tableMap.panels.push(panelMap);
        }
        return tableMap;
    }

    isSolarAccessComputed() {
        for (let child of this.getChildren()) {
            if (!child.isSolarAccessComputed()) {
                return false;
            }
        }
        return true;
    }

    getTotalSolarAccess(isLinkedTable = false) {
        let totalSolarAccess = 0;
        if (!this.hidden) {
            for (let child of this.getChildren()) {
                totalSolarAccess += child.getSolarAccess();
            }
        }

        if (this.linkedTable && !isLinkedTable) {
            totalSolarAccess = (this.linkedTable.getTotalSolarAccess(true) + totalSolarAccess) / 2;
        }
        return totalSolarAccess;
    }

    getAverageSolarAccess() {
        let nPanels = this.getNumberOfPanels();
        if (nPanels > 0) return this.getTotalSolarAccess() / nPanels;
        else return 0;
    }

    _getAverageSolarAccessIncludingHidden() {
        let totalSolarAccess = 0;
        for (let child of this.getChildren()) {
            totalSolarAccess += child.getSolarAccess();
        }
        return totalSolarAccess / this.getChildren().length;
    }

    getSubarray() {
        if (this.getParent()) {
            return this.getParent().getParent();
        }
        return null;
    }

    get tableSize() {
        return this.getSubarray().tableSize;
    }

    get2DVertices() {
        const panels = this.getChildren();
        const coordinatePoints = [];
        for (let i = 0, l = panels.length; i < l; i += 1) {
            const panelVertices = panels[i].get2DVertices();
            for (let j = 0, len = panelVertices.length; j < len; j += 1) {
                coordinatePoints
                    .push(new JSTS.geom.Coordinate(panelVertices[j][0], panelVertices[j][1]));
            }
        }
        const convexHullCoordinates =
            new JSTS.geom.GeometryFactory().createMultiPointFromCoords(coordinatePoints)
            .convexHull().getCoordinates();

        return utils.removeCollinearPoints(convexHullCoordinates
            .map(coordinate => [coordinate.x, coordinate.y]).slice(0, -1));
    }

    /**
     * Gives the nearest panel to the given point
     * @param {Vector3} point 
     */
    getNearestPanelToPoint(point) {
        const shiftedPoint = point.sub(this.getPosition());
        const panels = this.getChildren();
        let nearestDistance = Infinity;
        let nearestPanel = null;
        for (let i = 0, l = panels.length; i < l; i += 1) {
            const position = panels[i].getReleativePositionToTable();
            const currDistance = position.distanceToSquared(shiftedPoint)
            if (currDistance < nearestDistance) {
                nearestDistance = currDistance;
                nearestPanel = panels[i];
            }
        }
        if (nearestPanel === null) {
            console.error('how can the table exist if no panel???');
        }
        return nearestPanel;
    }

    getEdges() {
        let edges = [];
        for (let panel of this.getChildren()) {
            edges.push(...panel.getEdges());
        }
        return edges;
    }

    getPosition(refresh = false) {
        return this.objectsGroup.position.clone();
    }

    getId() {
        return this.id;
    }

    // Solar Access

    updateSolarAccess(solarAccessMap) {
        for (let child of this.getChildren()) {
            child.updateSolarAccess(solarAccessMap);
        }
    }

    getMaxSolarAccess() {
        return this._getAverageSolarAccessIncludingHidden();
    }

    optimiseOnSolarAccess(solarAccessThreshold) {
        if (this._getAverageSolarAccessIncludingHidden() < solarAccessThreshold && !this.hidden) {
            this.hideTable();
        } else if (this._getAverageSolarAccessIncludingHidden() >= solarAccessThreshold && this.hidden) {
            this.showTable();
        }
    }

    getDcStringsofPanels() {
        let dcStrings = [];
        for (let panel of this.getChildren()) {
            if (panel.electricalComponentConnected) {
                dcStrings.push(panel.electricalComponentConnected);
            }
        }
        return dcStrings;
    }

    // Universal Functions

    removeObject({ shouldSaveState, deleteEmptyParent } = { shouldSaveState: true, deleteEmptyParent: true },
        newFlow = true, { objectSelected } = { objectSelected: false },
    ) {
        // JUGAAD: panels were shaking because the subarrays had different azimuth
        // TODO: FIX for east west copypaste
        if (this.getSubarray() && this.getSubarray().rackSubarray) {
            if (this.getSubarray().objectType === 'EastWestRack' && this.getSubarray().azimuth === this.getSubarray().rackSubarray.azimuth) {
                let newAzimuth = this.getSubarray().rackSubarray.azimuth + 180;
                if (newAzimuth >= 360) newAzimuth -= 360;
                this.getSubarray().azimuth = newAzimuth;
                this.getSubarray().updateGeometry();
            }
        }
        if(!this.parent) return;
        if (this.gazeboDirectionArrow && this.gazeboDirectionArrow.visible) {
            this.gazeboDirectionArrow.visible = false;
        }
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        if (this.getSubarray()) {
            this.getSubarray().structureUpdateRequired = true;
            if (this.getSubarray().rotationPoints) this.getSubarray().rotationPoints.removeObject();
        }
        const i = 0;
        while (this.getChildren().length > i) {
            this.getChildren()[i].removeObject();
        }
        const row = this.getParent();
        row.removeChild(this, newFlow);

        this.removeDimensions();

        if (shouldSaveState) {
            this.stage.stateManager.add({
                uuid: this.uuid,
                getStateCb: () => DELETED_STATE,
            });
        }

        if (deleteEmptyParent) row.removeIfEmpty();

        // NOTE: deSelect should be after save since it will disable drag controls and
        // stop Undo/Redo container
        if (objectSelected) {
            this.stage.selectionControls.removeSelectedObject(this);
            this.stage.dragControls.removeIfExists(this);
        }

        if(this.linked){
            this.linkedTable.linked = false;
            this.linkedTable.removeObject({ shouldSaveState, deleteEmptyParent }, newFlow, { objectSelected })
        }
    }

    onSelect({ updateSubarray } = { updateSubarray: true }, rackSelect = false) {
        this.isSelected = true;
        this.showIndividualMesh();

        this.switchVisualState(VISUAL_STATES.SELECT, true);

        if (updateSubarray) {
            this.getSubarray().mergeGeometriesForAllPanels({ excludeTables: [this] });
        }

        if (this.getSubarray().objectType && this.getSubarray() instanceof Gazebo) {
            this.createDirectionArrowForGazebo();
        }
        this.addObjectsToDragControls();
        if(this.linked && !rackSelect){
            this.linkedTable.onSelect({updateSubarray}, true);
        }
    }

    createDirectionArrowForGazebo(azimuthAngle = this.getSubarray().azimuth) {
        const spriteTexture = new THREE.TextureLoader().load(img);
        this.gazeboDirectionArrow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: spriteTexture,
            rotation: (-Math.PI / 2) - utils.deg2Rad(azimuthAngle),
        }));
        this.gazeboDirectionArrow.scale.set(2, 1, 3);
        this.gazeboDirectionArrow.center.set(0.5, 0.5);
        this.gazeboDirectionArrow.position.set(0, 0, 5);
        this.gazeboDirectionArrow.frustumCulled = false;
        this.objectsGroup.add(this.gazeboDirectionArrow);
    }

    deSelect({ updateSubarray } = { updateSubarray: true }, rackSelect = false) {
        this.isSelected = false;
        this.hideIndividualMesh();
        if (this.gazeboDirectionArrow && this.gazeboDirectionArrow.visible) this.gazeboDirectionArrow.visible = false;
        if (this.getParent() !== null && this.getSubarray() !== null && this.getSubarray() !== undefined && this.getSubarray().rotationPoints !== undefined) {
            this.getSubarray().rotationPoints.hideObject();
        }
        if (updateSubarray) {
            this.getSubarray().mergeGeometriesForAllPanels({ excludeTables: [this] });
        }
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
        if(this.linked && !rackSelect){
            this.linkedTable.deSelect({updateSubarray}, true);
        }
    }

    handleObjectsGroupAddition(objectsGroup) {
        if (this.useIndividualMesh) {
            this.objectsGroup.add(objectsGroup);
        }
    }

    handleObjectsGroupDeletion(objectsGroup) {
        this.objectsGroup.remove(objectsGroup);
    }

    removePanelsMeshFromScene() {
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            this.getChildren()[i].removeFromScene();
        }
    }

    addPanelMeshToScene() {
        for (let i = 0, l = this.getChildren().length; i < l; i += 1) {
            this.getChildren()[i].addToScene();
        }
    }

    addObjectsToDragControls() {
        // Check if object is already added to drag controls
        if (this.stage.dragControls.objects.indexOf(this) !== -1) {
            // remove from drag and add again
            this.stage.dragControls.removeIfExists(this);
        }
        // add to drag
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
            this.handleDragEnd.bind(this),
            this.handleDragStart.bind(this),
            this.handleDragCancel.bind(this),
        );
        if (this.getSubarray().objectType === 'Gazebo') {
            this.getSubarray().rotationPoints = this.getSubarray().createRotation();
        }
        if (this.getSubarray() !== null && this.getSubarray() !== undefined && this.getSubarray().rotationPoints !== undefined) {
            this.getSubarray().rotationPoints.showObject();
            this.stage.dragControls.add(
                this.getSubarray().rotationPoints,
                this.getSubarray().rotationPoints.moveObject.bind(this.getSubarray().rotationPoints),
                this.getSubarray().rotationPoints.placeObject.bind(this.getSubarray().rotationPoints),
                this.getSubarray().rotationPoints.handleDragStart.bind(this.getSubarray().rotationPoints),
                this.getSubarray().rotationPoints.handleDragCancel.bind(this.getSubarray().rotationPoints),
            );
        }
    }


    showIndividualMesh() {
        this.useIndividualMesh = true;
        const children = this.getChildren();
        for (let i = 0; i < children.length; i += 1) {
            children[i].addToScene();
        }
    }

    hideIndividualMesh() {
        this.useIndividualMesh = false;
        const children = this.getChildren();
        for (let i = 0; i < children.length; i++) {
            children[i].removeFromScene();
        }
    }

    handleDragCancel() {
        const children = this.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            children[i].handleDragCancel();
        }
        this.switchVisualState(VISUAL_STATES.DEFAULT, true);
    }

    static getObjectType() {
        return 'Table';
    }
}
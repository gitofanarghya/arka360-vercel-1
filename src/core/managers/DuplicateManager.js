import * as THREE from 'three';
import Mousetrap from 'mousetrap';
import PolygonModel from '../objects/model/PolygonModel';
import CylinderModel from '../objects/model/CylinderModel';
import Walkway from '../objects/model/Walkway';
import SafetyLine from '../objects/model/SafetyLine';
import Tree from '../objects/model/Tree';
import Row from '../objects/subArray/Row';
import Table from '../objects/subArray/Table';
import Dimension from '../objects/subObjects/Dimension';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import DCDB from '../objects/ac/DCDB';
import Ground from '../objects/ground/Ground';
import { getCentroidOfObjects, findBaseObjectInChildren } from '../utils/utils';
import { mirrorPointAlongEdge } from '../utils/mirrorUtils';
import * as duplicateUtils from '../utils/duplicateUtils';
import {
    CLIPBOARD_READ_ACCESS,
    CLIPBOARD_WRITE_ACCESS,
    PASTE_TABLE_WITHOUT_SUBARRAY_ERROR,
} from '../coreConstants';
import TextBox from '../objects/subObjects/TextBox';
import { getSubarrays } from '../utils/exporters';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import HippedDormer from '../objects/model/smartroof/dormers/HippedDormer';
import GabledDormer from '../objects/model/smartroof/dormers/GabledDormer';
import FlatDormer from '../objects/model/smartroof/dormers/FlatDormer';
import RectangleObstruction from '../objects/model/Rectangle';
import TurretDormer from '../objects/model/smartroof/dormers/TurretDormer';
import Drawface from '../objects/model/smartroof/DrawFace';
import Gazebo from '../lib/PowerGazebo';

export default class DuplicateManager {
    constructor(stage) {
        this.stage = stage;

        Mousetrap.bind(['meta+shift+c', 'ctrl+shift+c'], this.onDuplicateWithOffset.bind(this));
        document.addEventListener('copy', this.onDuplicate);
        document.addEventListener('paste', this.onPaste);

        this.enabled = true;
        this.mousePoint = null;
        this.offsetVector = null;

        this.dimensionObject = null;
        this.editModeEnabled = false;
        this.mirrorModeEnabled = false;

        this.pasteObjectsHolder = [];
        this.duplicateObjectsHolder = [];
    }

    // handle duplicateWithOffset separately to prevent override of normal duplicate.
    onDuplicateWithOffset = async (event) => {
        if (this.enabled) {
            event.preventDefault();
            this.mousePoint = this.stage.mousePoint.clone();
            const copyData = duplicateUtils
                .copyObjectJson(this.stage.selectionControls.getSelectedObjects());
            await duplicateUtils.handleClipboardDataEvent(CLIPBOARD_WRITE_ACCESS, event, copyData);
        }
    };

    onDuplicate = async (event) => {
        if (this.enabled) {
            event.preventDefault();
            this.mousePoint = null;
            let selectedObj = this.stage.selectionControls.getSelectedObjects();
            // Temporary fix for EW: rework required
            if (this.stage.selectionControls.isMultiSelect()) {
                let hasEastWest = selectedObj.find((obj) => obj.linkedTable);
                if (hasEastWest) {
                    // return and throw error and notify user
                    console.error('Cannot duplicate a table with a linked subarray.');
                    notificationsAssistant.error({
                        title: 'Duplicate',
                        message: 'Object not supported',
                    });
                    return;
                }
            }
            if(!(selectedObj[0] instanceof Ground)){
                const copyData = duplicateUtils
                .copyObjectJson(selectedObj);
                await duplicateUtils.handleClipboardDataEvent(CLIPBOARD_WRITE_ACCESS, event, copyData);
                notificationsAssistant.success({
                    title: 'Copy',
                    message: ' Object copied successfully.',
                });
            }
        }
    };

    onPaste = async (event) => {
        
        if (this.enabled) {
            if (this.savingPaste) {
                notificationsAssistant.close(this.savingPaste);
            }
            this.savingPaste = notificationsAssistant.loading({
                title: 'Pasting',
                message: 'Object is being pasted.',
            });
            let pasteData;
            try {
                pasteData =
                await duplicateUtils.handleClipboardDataEvent(CLIPBOARD_READ_ACCESS, event);
                await this.handleActivePasteEvent(event);

                this.stage.visualManager.updateVisualsForEditing(this.enabled);

                this.stage.stateManager.startContainer();
                this.copiedObjectsJSON = JSON.parse(window.atob(pasteData));
            }
            catch (error) {
                console.error('ERROR: DuplicateManager: error in pasting from JSON', error);
                this.stage.stateManager.stopContainer({ discard: true });
                notificationsAssistant.close(this.savingPaste);
                // TODO: this.enable has never been defined why is this being checked?
                if (this.enable !== 'undefined') {
                   
                    try {
                        alert("Click 'Allow' in clipboard pop-up to paste your object. ");
                        await navigator.clipboard.readText();
                        
                    } 
                    catch (err) {

                        notificationsAssistant.error({
                           title: 'Paste',
                           message: 'Clipboard access not set or denied. ',
                       });
                    }
                   
                }
                return Promise.resolve(false);
            }

            try {
                await this.createObjectsFromJson(pasteData);
                this.initializePlaceManagerForPasting({ moveWithOffset: true });

                document.addEventListener('keydown', this.handleKeyPress, false);

                this.dimensionObject = new Dimension(this.stage, true);

                if (this.isCopiedObjectInScene()) {
                    const copiedObjects = [];
                    for (let i = 0; i < this.copiedObjectsJSON.length; i += 1) {
                        copiedObjects.push(this.stage.getObject([this.copiedObjectsJSON[i].uuid]));
                    }
                    this.copiedObjectsCentroid = getCentroidOfObjects(copiedObjects);
                    const pastedObjectsCentroid = getCentroidOfObjects(this.pasteObjectsHolder);
                    if (!(this.pasteObjectsHolder[0] instanceof TextBox)) {
                        this.dimensionObject.makeDimension(
                            this.copiedObjectsCentroid, this.stage.ground,
                            pastedObjectsCentroid, this.pasteObjectsHolder[0],
                        );
                        this.dimensionObject.enable();
                        this.dimensionObject.disableTextSelection();
                    }
                    this.stage.eventManager.setRepeatStatus(true);
                }
                return Promise.resolve(true);
            }
            catch (error) {
                console.error('ERROR: DuplicateManager: error in pasting', error);
                this.stage.stateManager.stopContainer({ discard: true });
                notificationsAssistant.close(this.savingPaste);
                notificationsAssistant.error({
                    title: 'Paste',
                    message: 'Unable to paste object',
                });
                this.stage.placeManager.onCancel();
                return Promise.resolve(false);
            }
        }
    };
    handleKeyPress = (event) => {
        if ((event.key === 'r' || event.key === 'R') && !this.mirrorModeEnabled) {
            this.repeatMode();
        }
        if (event.key === 'm' || event.key === 'M') {
            this.mirrorMode();
        }
        if ((event.key === 'Tab') && !this.mirrorModeEnabled) {
            this.tabMode(event);
        }
    };

    handleRepeatCountChange(value) {
        this.updateDuplicates(value);
    }

    repeatMode() {
        this.stage.eventManager.setRKeyPressed();
    }

    mirrorMode() {
        if (!this.mirrorModeEnabled &&
            !this.editModeEnabled) {
            this.stage.snapManager.unInitialize();
            this.stage.duplicateManager.disable();
            this.stage.placeManager.disable();
            this.stage.placeManager.reset();

            const initialized = this.stage.mirrorManager.initialize(
                this.pasteObjectsHolder[0], this.duplicateObjectsHolder,
                this.offsetVector.x, this.offsetVector.y,
            );
            if (initialized) {
                this.mirrorModeEnabled = true;
                if (this.isCopiedObjectInScene()) {
                    this.dimensionObject.disable();
                    this.stage.eventManager.setRepeatStatus(false);
                }
            }
            else {
                this.stage.duplicateManager.enable();
                this.initializePlaceManagerForPasting({ moveWithOffset: false });
            }
        }
        else if (this.mirrorModeEnabled) {
            this.stage.eventManager
                .customErrorMessage('Mirror mode already enabled.');
        }
    }

    mirrorMousePoint(point, edge, offSet) {
        if (this.mousePoint !== null) {
            const a = edge[1].y - edge[0].y;
            const b = edge[0].x - edge[1].x;
            const c = -1 * ((edge[0].x * a) + (edge[0].y * b));
            const newMousePoint = mirrorPointAlongEdge(point, a, b, c);
            this.mousePoint = new THREE.Vector2(
                newMousePoint.x + offSet.x,
                newMousePoint.y + offSet.y,
            );
        }
    }

    disableMirrorMode() {
        if (this.mirrorModeEnabled) {
            this.mirrorModeEnabled = false;
            this.stage.duplicateManager.enable();
            this.initializePlaceManagerForPasting({ moveWithOffset: false });

            if (this.isCopiedObjectInScene()) {
                this.dimensionObject.enable();
                this.stage.eventManager.setRepeatStatus(true);
            }
        }
    }

    tabMode(event) {
        event.preventDefault();
        if (!this.editModeEnabled) {
            this.editModeEnabled = true;
            this.dimensionObject.setTextEditable();
            this.stage.placeManager.disable();
        }
        else {
            this.dimensionObject.focusAndSelectText();
        }
    }

    handleValueUpdate(deltaX = 0, deltaY = 0) {
        this.stage.snapManager.unInitialize();
        this.stage.selectionControls.enable();
        this.stage.visualManager.updateVisualsForEditing();
        this.stage.viewManager.enableDimensions();

        const placableObjects = this.pasteObjectsHolder;
        for (let i = 0; i < placableObjects.length; i += 1) {
            placableObjects[i].moveObject(deltaX, deltaY);
        }
        this.moveDuplicates(deltaX, deltaY);
        for (let i = 0; i < placableObjects.length; i += 1) {
            placableObjects[i].placeObject(0, 0);
        }
        this.placeDuplicates();
        this.stage.stateManager.stopContainer();
        this.stage.placeManager.reset();
        this.reset();
    }

    handleValueCancel() {
        this.stage.snapManager.unInitialize();
        this.stage.selectionControls.enable();
        this.stage.visualManager.updateVisualsForEditing();
        this.stage.viewManager.enableDimensions();
        const deleteObject = this.pasteObjectsHolder;
        const count = deleteObject.length;
        for (let i = 0; i < count; i += 1) {
            deleteObject[0].removeObject();
        }
        this.stage.stateManager.stopContainer();
        this.stage.placeManager.reset();
        this.reset();
    }

    updateDuplicates(numberOfTemporaryDuplicates) {
        const objectHolderLength = this.duplicateObjectsHolder.length;
        const duplicateCountDifference = numberOfTemporaryDuplicates - objectHolderLength - 1;
        if (duplicateCountDifference <= 0) {
            let modDuplicateCount = Math.abs(duplicateCountDifference);
            while (modDuplicateCount) {
                const removedObject = this.duplicateObjectsHolder.pop();
                for (let i = 0; i < removedObject.length; i += 1) {
                    removedObject[i].removeObject(true);
                }
                modDuplicateCount -= 1;
            }
        }
        else {
            const objectsData = [];
            for (let i = 0, len = this.pasteObjectsHolder.length; i < len; i += 1) {
                objectsData.push(this.pasteObjectsHolder[i].saveObject());
            }
            const selectedObjectsCentroid = getCentroidOfObjects(this.pasteObjectsHolder);

            const dx = selectedObjectsCentroid.x - this.copiedObjectsCentroid.x;
            const dy = selectedObjectsCentroid.y - this.copiedObjectsCentroid.y;
            for (let j = objectHolderLength; j < duplicateCountDifference + objectHolderLength;
                j += 1) {
                let object;
                const objectsHolder = [];
                for (let i = 0; i < objectsData.length; i += 1) {
                    if (
                        objectsData[i].type === RectangleObstruction.getObjectType() ||
                        objectsData[i].type === PolygonModel.getObjectType() ||
                        objectsData[i].type === CylinderModel.getObjectType() ||
                        objectsData[i].type === Walkway.getObjectType() ||
                        objectsData[i].type === SafetyLine.getObjectType() ||
                        objectsData[i].type === Tree.getObjectType()
                    ) {
                        if (objectsData[i].type === RectangleObstruction.getObjectType()) {
                            object = new RectangleObstruction(this.stage);
                        }
                        else if (objectsData[i].type === PolygonModel.getObjectType()) {
                            object = new PolygonModel(this.stage);
                        }
                        else if (objectsData[i].type === Walkway.getObjectType()) {
                            object = new Walkway(this.stage);
                        }
                        else if (objectsData[i].type === SafetyLine.getObjectType()) {
                            object = new SafetyLine(this.stage);
                        }
                        else if (objectsData[i].type === CylinderModel.getObjectType()) {
                            object = new CylinderModel(this.stage);
                        }
                        else if (objectsData[i].type === Tree.getObjectType()) {
                            object = new Tree(this.stage);
                        }
                        this.stage.ground.addChild(object);
                        object.loadObject(objectsData[i], true);
                        object.moveObject((j + 1) * dx, (j + 1) * dy);
                        objectsHolder.push(object);
                    }
                    else if (objectsData[i].type === Table.getObjectType()) {
                        let gzbo = this.stage.getObject(objectsData[i].subarrayUUID);
                        if (gzbo.objectType && gzbo.objectType === 'Gazebo') {
                            return;
                        }
                        const { subarrayUUID } = objectsData[i];
                        const subarray = findBaseObjectInChildren(
                            subarrayUUID,
                            this.stage.ground,
                        );
                        if (subarray !== null) {
                            const { panels } = objectsData[i].tableMap;
                            for (let k = 0; k < panels.length; k += 1) {
                                panels[k].solarAccess = 0;
                            }
                            object = new Table(this.stage, objectsData[i].tableMap);
                            object.showIndividualMesh();
                            subarray.getChildren()[0].addChild(object);
                            object.loadObject(objectsData[i], true);
                            object.moveObject((j + 1) * dx, (j + 1) * dy);
                            objectsHolder.push(object);
                        }
                    }
                }
                this.duplicateObjectsHolder.push(objectsHolder);
            }
        }
    }

    moveDuplicates(dx = 0, dy = 0) {
        if (this.isEnabled()) {
            for (let i = 0; i < this.duplicateObjectsHolder.length; i += 1) {
                const xDiff = ((i + 2) * dx);
                const yDiff = ((i + 2) * dy);
                for (let j = 0; j < this.duplicateObjectsHolder[i].length; j += 1) {
                    this.duplicateObjectsHolder[i][j].moveObject(xDiff, yDiff, 0);
                }
            }
            this.stage.mergeManager.moveChildrenMesh(dx, dy);
        }
    }

    placeDuplicates() {
        notificationsAssistant.close(this.savingPaste);
        for (let i = 0; i < this.duplicateObjectsHolder.length; i += 1) {
            for (let j = 0; j < this.duplicateObjectsHolder[i].length; j += 1) {
                if (this.duplicateObjectsHolder[i][j] instanceof Table){
                    this.duplicateObjectsHolder[i][j].placeObjectForAddTable(0, 0);
                    this.duplicateObjectsHolder[i][j].getSubarray().mergeGeometriesForAllPanels();
                    this.duplicateObjectsHolder[i][j].hideIndividualMesh();
                    this.duplicateObjectsHolder[i][j].placeObject(0, 0);
                }
                else{
                    this.duplicateObjectsHolder[i][j].placeObject(0, 0);
                }
            }
        }
        while (this.duplicateObjectsHolder.length !== 0) {
            this.duplicateObjectsHolder.pop();
        }
    }

    async onClickHandler(onClickHandlers) {
        this.placeDuplicates();
        this.reset();
        const duplicateNotification = this.stage.eventManager.setPasteLoading();
        try {
            for (let i = 0, len = onClickHandlers.length; i < len; i += 1) {
                let ret = await onClickHandlers[i]();
                // if ret is false or instance of error then it will not be placed successfully
                if (ret && (!(ret instanceof Error))) {
                    notificationsAssistant.success({
                        title: 'Paste',
                        message: 'Object pasted successfully.',
                    });
                }
            }
            this.stage.stateManager.stopContainer();
            this.stage.mergeManager.mergeScene(this.stage.selectionControls.getSelectedObject());
            this.stage.eventManager.completePasteLoading(duplicateNotification);
            return Promise.resolve(true);
        }
        catch (error) {
            this.stage.eventManager.errorPasteLoading(duplicateNotification);
            console.error('ERROR: Duplicate Manager: error in placing object', error);
            this.stage.stateManager.stopContainer();
            return Promise.resolve(false);
        }
    }

    onCancelHandler(onCancelHandlers) {
        for (let i = 0, len = onCancelHandlers.length; i < len; i += 1) {
            onCancelHandlers[i]();
        }
        this.stage.stateManager.stopContainer({ discard: true });
        this.reset();
    }

    async handleActivePasteEvent(event) {
        if (this.stage.placeManager.isEnabled()) {
            try {
                await this.stage.placeManager.onClick(event);
            }
            catch (error) {
                console.error('ERROR: DuplicateManager: error in onClick event', error);
                this.stage.stateManager.stopContainer({ discard: true });
            }
        }
    }

    initializePlaceManagerForPasting({ moveWithOffset } = { moveWithOffset: false }) {
        if (this.pasteObjectsHolder.length !== 0) {
            const onClickHandlers = [];
            const onCancelHandlers = [];
            for (let idx = 0, len = this.pasteObjectsHolder.length; idx < len; idx += 1) {
                if (this.pasteObjectsHolder[idx] instanceof Table && this.pasteObjectsHolder[idx].getSubarray() instanceof Gazebo) {
                    onClickHandlers.push(this.pasteObjectsHolder[idx].placeObjectForAddTable.bind(
                        this.pasteObjectsHolder[idx], undefined, undefined,
                        { objectSelected: true },
                    ));
                }
                else {
                    onClickHandlers.push(this.pasteObjectsHolder[idx].placeObject.bind(
                        this.pasteObjectsHolder[idx], undefined, undefined,
                        { objectSelected: true },
                    ));
                }
                onCancelHandlers.push(this.pasteObjectsHolder[idx].removeObject.bind(
                    this.pasteObjectsHolder[idx], undefined, undefined,
                    { objectSelected: true },
                ));
            }
            this.offsetVector = this.getDisplacementVector();
            this.stage.selectionControls.setSelectedObjects(this.pasteObjectsHolder);
            this.stage.placeManager.initialize(
                this.pasteObjectsHolder,
                this.onClickHandler.bind(this, onClickHandlers),
                this.onCancelHandler.bind(this, onCancelHandlers),
                this.offsetVector.x,
                this.offsetVector.y,
                { moveWithOffset },
                { handleClickEvent: true },
                { duplicateMode: true },
            );

            this.stage.eventManager.setButtonStatusWhilePasting(this
                .stage.placeManager.onCancel.bind(this.stage.placeManager));

            if (this.pasteObjectsHolder[0] instanceof PolygonModel ||
                this.pasteObjectsHolder[0] instanceof RectangleObstruction ||
                this.pasteObjectsHolder[0] instanceof CylinderModel ||
                this.pasteObjectsHolder[0] instanceof HippedDormer ||
                this.pasteObjectsHolder[0] instanceof GabledDormer ||
                this.pasteObjectsHolder[0] instanceof FlatDormer ||
                this.pasteObjectsHolder[0] instanceof TurretDormer ||
                this.pasteObjectsHolder[0] instanceof Drawface ||
                this.pasteObjectsHolder[0] instanceof SmartroofModel||
                this.pasteObjectsHolder[0] instanceof Tree) {
                for (let idx = 0, len = this.pasteObjectsHolder.length; idx < len; idx += 1) {
                    this.pasteObjectsHolder[idx].hideMeasurement();
                }
            }
        }
        else {
            this.stage.stateManager.stopContainer({ discard: true });
        }
    }

    async createObjectsFromJson(data) {
        try {
            const objectsData = JSON.parse(window.atob(data));
            const subarrayTempRows = {};
            let object;
            for (let i = 0; i < objectsData.length; i += 1) {
                if (Object.prototype.hasOwnProperty.call(objectsData[i], 'type')) {
                    if (
                        objectsData[i].type === PolygonModel.getObjectType()
                        || objectsData[i].type === RectangleObstruction.getObjectType()
                        || objectsData[i].type === CylinderModel.getObjectType()
                        || objectsData[i].type === Walkway.getObjectType()
                        || objectsData[i].type === Tree.getObjectType()
                        || objectsData[i].type === Inverter.getObjectType()
                        || objectsData[i].type === ACDB.getObjectType()
                        || objectsData[i].type === DCDB.getObjectType()
                        || objectsData[i].type === SafetyLine.getObjectType()
                        || objectsData[i].type === TextBox.getObjectType()
                        || objectsData[i].type === Drawface.getObjectType()
                        || objectsData[i].type === TurretDormer.getObjectType()
                        || objectsData[i].type === SmartroofModel.getObjectType()
                        || objectsData[i].type === HippedDormer.getObjectType()
                        || objectsData[i].type === GabledDormer.getObjectType()
                        || objectsData[i].type === FlatDormer.getObjectType()
                    ) {
                        if (objectsData[i].type === RectangleObstruction.getObjectType()) {
                            object = new RectangleObstruction(this.stage);
                        }
                        else if (objectsData[i].type === PolygonModel.getObjectType()) {
                            object = new PolygonModel(this.stage);
                        }
                        else if (objectsData[i].type === CylinderModel.getObjectType()) {
                            object = new CylinderModel(this.stage);
                        }
                        else if (objectsData[i].type === Walkway.getObjectType()) {
                            object = new Walkway(this.stage);
                        }
                        else if (objectsData[i].type === SafetyLine.getObjectType()) {
                            object = new SafetyLine(this.stage);
                        }
                        else if (objectsData[i].type === Tree.getObjectType()) {
                            object = new Tree(this.stage);
                        }
                        else if (objectsData[i].type === Inverter.getObjectType()) {
                            // let inverterSpecifications = {};
                            // inverterSpecifications.electricalProperties = objectsData[i].electricalProperties;
                            // inverterSpecifications.mppts = []
                            // for(let j = 0 ; j < objectsData[i].mppts.length ; j++){
                            //     inverterSpecifications.mppts.push({
                            //         maxStrings: objectsData[i].mppts[j].maxStrings,
                            //     });
                            // }
                            const subarrays = [];
                            getSubarrays(this.stage.ground, subarrays);
                            const linkedSubarray = subarrays[0];

                            object = new Inverter(this.stage , objectsData[i]);
                            object.callOptimizerAndStringingApi(linkedSubarray.getModuleId());
                            for (let i = 0, l = object.mppts.length; i < l; i += 1) {
                                object.mppts[i].setLinkedSubarray(linkedSubarray);
                            }
                        }
                        else if (objectsData[i].type === ACDB.getObjectType()) {
                            object = new ACDB(this.stage);
                        }
                        else if (objectsData[i].type === DCDB.getObjectType()) {
                            object = new DCDB(this.stage);
                        }
                        else if (objectsData[i].type === TextBox.getObjectType()) {
                            object = new TextBox(this.stage);
                        }
                        else if (objectsData[i].type === Drawface.getObjectType()) {
                            object = new Drawface(this.stage);
                        }
                        else if (objectsData[i].type === TurretDormer.getObjectType()) {
                            object = new TurretDormer(this.stage);
                        }
                        else if (objectsData[i].type === SmartroofModel.getObjectType()) {
                            object = new SmartroofModel(this.stage);
                        }
                        else if (objectsData[i].type === HippedDormer.getObjectType()) {
                            object = new HippedDormer(this.stage);
                        }
                        else if (objectsData[i].type === GabledDormer.getObjectType()) {
                            object = new GabledDormer(this.stage);
                        }
                        else if (objectsData[i].type === FlatDormer.getObjectType()) {
                            object = new FlatDormer(this.stage);
                        }
                        this.stage.ground.addChild(object);
                        object.loadObject(objectsData[i], true);
                        this.pasteObjectsHolder.push(object);
                    }
                    else if (objectsData[i].type === Table.getObjectType()) {
                        let isGazebo = this.stage.getObject(objectsData[i].subarrayUUID);
                        if (isGazebo instanceof Gazebo) {
                            const newGazeboProperties = isGazebo.saveObject();
                            let newGazebo = isGazebo.createNewGazeboTable(newGazeboProperties);
                            newGazebo.saveState();
                            newGazebo.rotationPoints.hideObject();
                            newGazebo.mergeGeometriesForAllPanels();
                            newGazebo.hideIndividualPanelMeshes();
                            newGazebo.createBoundaryFromBB();
                            const newGazeboTable = newGazebo.getChildren()[0].getChildren()[0];
                            newGazeboTable.moveObject(0, 0, - (newGazeboTable.getPosition().z - newGazebo.mountHeight));
                            this.pasteObjectsHolder.push(newGazebo.getChildren()[0].getChildren()[0]);
                        }
                        else {
                            const { subarrayUUID } = objectsData[i];
                            let subarray = findBaseObjectInChildren(
                                subarrayUUID,
                                this.stage.ground,
                            );
                            // JUGAAD: panels were shaking because the subarrays had different azimuth
                            // TODO: FIX for east west copypaste
                            if (subarray.rackSubarray && subarray.azimuth !== subarray.rackSubarray.azimuth) {
                                subarray.azimuth = subarray.rackSubarray.azimuth;
                                subarray.updateGeometry();
                            }
                            if (subarray !== null) {
                                const { panels } = objectsData[i].tableMap;
                                for (let j = 0; j < panels.length; j += 1) {
                                    panels[j].solarAccess = 0;
                                }
                                object = new Table(this.stage, objectsData[i].tableMap);
                                if (Object.prototype.hasOwnProperty
                                    .call(subarrayTempRows, subarrayUUID)) {
                                    subarrayTempRows[subarrayUUID].addChild(object);
                                }
                                else {
                                    let tempBBox = {
                                        minX: 0,
                                        maxX: 0,
                                        minY: 0,
                                        maxY: 0,
                                    };
                                    if (subarray.getChildren().length > 0) {
                                        tempBBox = subarray.getChildren()[0].getlocalBoundingBox();
                                    }
                                    const rowMap = {
                                        id: 0,
                                        frames: [],
                                        localBBox: {
                                            minX: tempBBox.minX,
                                            maxX: tempBBox.maxX,
                                            minY: tempBBox.minY,
                                            maxY: tempBBox.maxY,
                                        },
                                    };
                                    subarrayTempRows[subarrayUUID] = new Row(this.stage, rowMap);
                                    subarray.addChild(subarrayTempRows[subarrayUUID]);
                                    subarrayTempRows[subarrayUUID].addChild(object);
                                }
                                object.loadObject(objectsData[i], true);
                                // Table is not placed yet it is just created
                                object.notPlaced = true;
                                this.pasteObjectsHolder.push(object);
                            }
                            else {
                                this.stage.eventManager
                                    .customErrorMessage(PASTE_TABLE_WITHOUT_SUBARRAY_ERROR);
                                break;
                            }
                        }
                    }
                }
            }
            return Promise.resolve(true);
        }
        catch (ex) {
            console.warn('DuplicateManager: Cannot complete pasting of object. Copied object not compatible', ex);
            this.stage.stateManager.stopContainer({ discard: true });
            return Promise.resolve(false);
        }
    }

    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    isEditModeEnabled() {
        return this.editModeEnabled;
    }

    destroy() {
        document.removeEventListener('copy', this.onDuplicate);
        document.removeEventListener('paste', this.onPaste);
        Mousetrap.unbind(['meta+shift+c', 'ctrl+shift+c']);
    }

    getDisplacementVector() {
        if (this.mousePoint !== null) {
            const originalPosition = getCentroidOfObjects(this.pasteObjectsHolder);
            return originalPosition.sub(this.mousePoint);
        }
        return new THREE.Vector2(0, 0);
    }

    isEnabled() {
        return this.enabled;
    }

    isCopiedObjectInScene() {
        const copiedObject = this.copiedObjectsJSON.length > 0 ?
            this.stage.getObject([this.copiedObjectsJSON[0].uuid]) : null;
        if (copiedObject) {
            return true;
        }
        return false;
    }

    reset() {
        notificationsAssistant.close(this.savingPaste);
        this.editModeEnabled = false;
        if (this.dimensionObject) {
            this.dimensionObject.remove();
        }
        this.dimensionObject = null;
        document.removeEventListener('keydown', this.handleKeyPress, false);
        this.stage.eventManager.setRepeatStatus(false);
        while (this.duplicateObjectsHolder.length !== 0) {
            const removedObject = this.duplicateObjectsHolder.pop();
            for (let i = 0; i < removedObject.length; i += 1) {
                removedObject[i].removeObject();
            }
        }
        this.pasteObjectsHolder = [];
    }
}

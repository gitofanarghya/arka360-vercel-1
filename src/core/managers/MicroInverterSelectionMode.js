import * as topBarAssistant from '../../componentManager/topBarAssistant';
import {
    store
} from '../../store';
import {
    v4
} from 'uuid';
import * as THREE from 'three';
import Panel from '../objects/subArray/Panel';
import {
    getSubarrays,
    getInverters
} from '../utils/exporters';
import * as CONSTANTS from '../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import SelectionRectangle from '../lib/SelectionRectangle';
import {
    serverBus
} from '../../main';
import {
    temperature
} from 'chroma-js';
import utils from '../../services/api/utils';
import axios from "axios";
import { requireJump } from '../structure/utils/mathUtils';
import { PANEL_ORIENTATION_LANDSCAPE, PANEL_ORIENTATION_PORTRAIT } from '../coreConstants';
import Gazebo from '../lib/PowerGazebo';
export default class MicroInverterSelectionMode {
    constructor(stage) {
        this.stage = stage;
        this.canvas = stage.rendererManager.getDomElement();
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        // initilizing the variables
        this.break = false;
        this.enabled = false;
        this.stringingModeEnabled = false;
        this.selectedPanels = [];
        this.completedStrings = [];
        this.selectionRectangle = new SelectionRectangle(stage);
        this.squareMaterial = new THREE.MeshBasicMaterial({
            color: 0x7BEBFF
        });
        this.squareGeometry = new THREE.PlaneGeometry(0.4, 0.4);
        this.finishString = false;

    }

    initialize(microInverter) {

        if (this.enabled) {
            console.error('');
            notificationsAssistant.error({
                title: 'microInverter',
                message: 'select panels to add microInverters',
            });
            return 'microInverter Mode Enabled';
        }

        if(microInverter.panels.length == 0) {
            notificationsAssistant.info({
                title: 'MicroInverter addition',
                message: 'Please select panels for microInverter addition',
            })
        }

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.SET_CREATION_MODE , true);

        topBarAssistant.setCompleteAction(this.onComplete.bind(this), this);
        topBarAssistant.setCancelAction(this.onCancel.bind(this));

        //purane panels usko selectbel panels mei add krdo

        this.enabled = true;
        this.stage.visualManager.updateVisualsForEditing(true);
        this.stage.selectionControls.disable();
        //rect tool enable
        this.stage.dragControls.disable();
        this.stage.viewManager.disableDimensions();
        this.stage.hideSolarAccess();
        // TODO: disable solar access and heat map.
        this.selectablePanels = [];
        this.microInverter = microInverter;
        this.microInverter.currentPanels = microInverter.panels.slice();
        this.selectionRectangle.enableRectTool();

        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].showIndividualPanelMeshes();
            allSubarrays[i].hideMergedMeshes();
            // shouldn't be able to select gazebo panels for microinverters.
            if (allSubarrays[i] instanceof Gazebo) continue;
            this.selectablePanels.push(...allSubarrays[i].getPanels());
        }

        // for all inverters set the color of panels to grey

        const inverters = getInverters(this.stage);

        for (let i = 0, l = inverters.length; i < l; i += 1) {
            const panels = inverters[i].getAllLinkedPanels();
            for (let j = 0, len = panels.length; j < len; j += 1) {
                panels[j].updateColorToGrey();
                this.selectablePanels.splice(this.selectablePanels.indexOf(panels[j]), 1);
            }
        }

        // do the same for micro inverters and central inverters.
        const microInverters = this.stage.ground.microInverters;

        for (let i = 0; i < microInverters.length; i += 1) {
            if (microInverters[i] !== this.microInverter) {
                const panels = microInverters[i].panels;
                for (let j = 0, len = panels.length; j < len; j += 1) {
                    panels[j].updateColorToGrey();
                    this.selectablePanels.splice(this.selectablePanels.indexOf(panels[j]), 1);
                }
            }
        }

        if(this.microInverter.currentPanels.length > 0){
            for (let i = 0; i < this.microInverter.currentPanels.length; i++) {
                this.microInverter.currentPanels[i].updateColorToSelected();
            }
            microInverter.deSelect();
        }

        this.canvas.addEventListener('mousedown', this.mouseDown, false);
        this.canvas.addEventListener('mouseup', this.mouseup, false);
        this.canvas.addEventListener('click', this.onMouseClick, false);

    }

    uninitialize() {

        this.canvas.removeEventListener('mousedown', this.mouseDown, false);
        this.canvas.removeEventListener('mouseup', this.mouseup, false);
        this.canvas.removeEventListener('click', this.onMouseClick, false);

        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        for (let i = 0, l = allSubarrays.length; i < l; i += 1) {
            allSubarrays[i].hideIndividualPanelMeshes();
            allSubarrays[i].showMergedMeshes();
        }

        this.enabled = false;
        this.selectablePanels = [];
        this.microInverter.currentPanels = [];

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_CREATION_MODE , false);


        this.stage.selectionControls.enable();
        this.stage.viewManager.enableDimensions();
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.dragControls.enable();
        this.stage.duplicateManager.enable();
        this.selectionRectangle.enableRectTool();
        this.selectionRectangle.disableRectTool();

    }

    setSelectedPanels(panels) {
        //check whether selectable or not
        for (let i = 0; i < panels.length; i += 1) {
            const currentPanelIndex = this.microInverter.currentPanels.indexOf(panels[i]);
            if (this.selectablePanels.includes(panels[i])) {
                if (currentPanelIndex > -1) {
                    if (panels[i].electricalComponentConnected !== null && panels[i].electricalComponentConnected.strings.length > 0) {
                        const numberOfStrings = panels[i].electricalComponentConnected.strings.length;
                        // panels[index] are the panels whose strings are to be removed as they have been removed from selection.
                        for (let j = 0; j < numberOfStrings; j++) {
                            const stringList = panels[i].electricalComponentConnected.strings[j];
                            stringList.linkedPanels.forEach(stringPanel => {
                                if (stringPanel.uuid === panels[i].uuid) {
                                    stringList.removeObject();
                                }
                            });
                        }
                    }
                    this.microInverter.currentPanels.splice(currentPanelIndex, 1);
                    panels[i].updateColorToDefault();
                } else {
                    this.microInverter.currentPanels.push(panels[i]);
                    panels[i].updateColorToSelected();
                }
            }
        }
    }

    removeMicroInverter() {
        if(this.microInverter.panels.length == 0){
            const allMicroInverters = this.stage.ground.microInverters;
            const microIndex = allMicroInverters.indexOf(this.microInverter);
            allMicroInverters.splice(microIndex, 1);
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }else{
            this.microInverter.onSelect();
        }
    }

    async onComplete() {
        this.stage.stateManager.startContainer();
        // update the string range of the inverter using the voltages values.
        this.microInverter.updatePanels(this.microInverter.currentPanels);
        this.microInverter.updateStrings();
        if(this.microInverter.panels.length === 0){
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }
        this.uninitialize();
        this.microInverter.setStringRange(await this.getMicroInverterStringRange());
        this.microInverter.updateGeometry();
        this.microInverter.onSelect();
        this.stage.stateManager.stopContainer();
    }

    onCancel() {
        this.removeMicroInverter();
        this.uninitialize();
    }

    async getMicroInverterStringRange() {
        try {
            const response = await axios.post(`api/designs/${this.stage.getDesignId()}/get_max_IV/`, {
                maxLength: 1,
                moduleID: this.microInverter.panels.length > 0 ?
                    this.microInverter.panels[0].getSubarray().getModuleId() : 1,
            });

            let maxx = Math.floor(this.microInverter.electricalProperties.MPPT_High_V / response.data.voltage);
            if (maxx < 1) {
                maxx = 1;
            }
            return {
                max: maxx,
                min: 1,
            };
        } catch (error) {
            console.log('MicroInverterSeletionMode: Error while updating the stringRange of microinverter. Using default as 1,1');
            return {
                max: 1,
                min: 1,
            }
        }
    }

    initializeStringingMode(microInverter) {
        if (this.stringingModeEnabled || this.enabled) {
            console.error('StringingMode: Stringing mode already Initilized');
            notificationsAssistant.error({
                title: 'Stringing',
                message: 'Already in Stringing mode.',
            });
            return 'Stringing Mode Enabled';
        }
        // this.stage.stateManager.startContainer();

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_ALL_DISABLED_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_DISABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_COMPLETE_CANCEL_STATE);
        store.commit(CONSTANTS.SET_CREATION_MODE , true);
        // store.commit(CONSTANTS.SET_SUMMARY_STATUS, false);
        this.microInverter = microInverter;
        topBarAssistant.setCompleteAction(this.onCompleteStringingMode.bind(this), this);
        topBarAssistant.setCancelAction(this.onCancelStringingMode.bind(this));
        this.selectionRectangle.disableRectTool();
        this.stringingModeEnabled = true;
        this.stage.visualManager.updateVisualsForEditing(true);
        this.stage.selectionControls.disable();
        this.stage.dragControls.disable();
        this.stage.viewManager.disableDimensions();
        this.stage.hideSolarAccess();
        this.currentStringPanels = [];
        this.currentStrings = [];

        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x36F443,
            // color: 0xf44336,
            linewidth: 1
        });
        this.optimizedLineGeometry = new THREE.BufferGeometry();
        this.optimizedLineMesh = new THREE.Line(this.optimizedLineGeometry, this.lineMaterial);
        const positions = new Float32Array(500 * 3); // 3 vertices per point
        this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.optimizedLineGeometry.setDrawRange(0, 2);
        this.index = -1;
        this.microInverter.stringGroup.add(this.optimizedLineMesh);
        this.microInverter.objectsGroup.add(this.microInverter.stringGroup);


        this.canvas.addEventListener('mousemove', this.onMouseMove, false);

        this.stage.stateManager.startContainer();
    }

    uninitializeStringingMode() {

        this.canvas.removeEventListener('mousemove', this.onMouseMove, false);

        store.commit(CONSTANTS.SIDEBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.ALL_MAP_BUTTONS_ENABLED_STATE);
        store.commit(CONSTANTS.TOPBAR_BUTTON_STATUS_HOME_STATE);
        store.commit(CONSTANTS.SET_CREATION_MODE , false);

        this.stringingModeEnabled = false;
        this.stage.visualManager.updateVisualsForEditing(false);
        this.stage.selectionControls.enable();
        this.stage.dragControls.enable();
        this.stage.viewManager.enableDimensions();
        this.currentStringPanels = [];
        this.optimizedLineGeometry = new THREE.BufferGeometry();
        this.optimizedLineMesh = new THREE.Line(this.optimizedLineGeometry, this.lineMaterial);

    }

    isEnabled() {
        //return is enabled
        return this.enabled;
    }

    onMouseMove = (event) => {
        if (event.buttons === 1) {
            let mouseCords = this.stage.mousePoint;
            let tempPanels = this.microInverter.microInverterArray;

            for (let i = 0, l = tempPanels.length; i < l; i += 1) {
                if ((this.distanceSquared(mouseCords, tempPanels[i].mesh.position) <= 0.16) &&
                    !this.isPanelStringed(tempPanels[i].connectedPanel)) {
                    this.drawString(tempPanels[i].connectedPanel);
                }
            }
        }
        if (event.buttons === 0) {
            this.finishString = true;
        }
    }

    onMouseClick = () => {

        let mouseCords = this.stage.mousePoint;
        let tempPanels = this.selectablePanels;

        let min = 0.5;
        let clickedPanel = null;
        let panel = [];
        for (let i = 0; i < tempPanels.length; i++) {
            let pos = this.distanceSquared(mouseCords, tempPanels[i].getPosition());
            if (pos < min) {
                min = pos;
                clickedPanel = tempPanels[i];
            }
        }

        panel.push(clickedPanel);
        this.setSelectedPanels(panel);
    }

    isPanelStringed(panel) {
        let currentStringed = false;
        let previousStringed = false;
        if (this.currentStringPanels.includes(panel)) {
            currentStringed = true;
        }
        for (let i = 0; i < this.microInverter.strings.length; i++) {
            if (this.microInverter.strings[i].panels.includes(panel)) {
                previousStringed = true;
            }
        }
        if (!currentStringed && !previousStringed) {
            return false;
        } else {
            return true;
        }
    }

    distanceSquared(point1, point2) {
        return ((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
    }

    drawString(panel) {
        if (this.currentStringPanels.length === this.microInverter.maxString || 
                (this.finishString && this.currentStringPanels.length > 0)) {
            this.microInverter.strings.push({
                stringNum: this.microInverter.strings.length,
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            });

            this.currentStrings.push({
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            });

            this.optimizedLineGeometry = new THREE.BufferGeometry();
            this.lineMaterial = new THREE.LineBasicMaterial({
                color: 0x36F443,
                linewidth: 1
            });
            this.optimizedLineMesh = new THREE.Line(this.optimizedLineGeometry, this.lineMaterial);
            const positions = new Float32Array(500 * 3); // 3 vertices per point
            this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.optimizedLineGeometry.setDrawRange(0, 2);
            this.index = -1;
            this.microInverter.stringGroup.add(this.optimizedLineMesh);
            this.microInverter.objectsGroup.add(this.microInverter.stringGroup);
            this.currentStringPanels = [];

        } else {
            // if (this.currentStringPanels.includes(panel)){
            //     console.log(this.currentStringPanels , "cuurentString panels")
            //     const index = this.currentStringPanels.indexOf(panel);
            //     this.currentStringPanels.splice(index , 1);
            //     this.finishString = false;
            //     let temp = new Float32Array(500 * 3);
            //     let lineVertices = this.optimizedLineGeometry.attributes.position.array;
            //     for(let i = 0 ; i < this.index ; i++){
            //         if(i == lineVertices.findIndex((element) => {element === panel.getPosition().x})){
            //             i += 2;
            //         }
            //         else{
            //             temp[i] = lineVertices[i];
            //         }
            //     }
            //     this.index -= 3;
            //     this.optimizedLineGeometry.attributes.position.array = temp;
            //     this.optimizedLineGeometry.setDrawRange(0, (this.index + 1) / 3);
            //     this.optimizedLineGeometry.attributes.position.needsUpdate = true;
            //     this.optimizedLineGeometry.computeBoundingBox();
            //     this.optimizedLineGeometry.computeBoundingSphere();
            // }
            // else{
            this.currentStringPanels.push(panel);
            this.finishString = false;
            const lineVertices = this.optimizedLineGeometry.attributes.position.array;
    
            const curve = this.drawCurve(panel , this.currentStringPanels);
            if(curve !== null && curve !== undefined){
                const curvePoints = curve.curvePoints;
                const points = curvePoints.getPoints(10);
                for (let j = 0; j < points.length; j += 1) {
                    lineVertices[++this.index] = points[j].x;
                    lineVertices[++this.index] = points[j].y;
                    lineVertices[++this.index] = curve.highestZ + 1;
                }
            }
    
            const vertex = panel.getPosition();
            let panelDimensions = panel.getSubarray().moduleProperties;
            const panelMap = panel.getPanelMap();
            let movementVector = new THREE.Vector3(panelMap.corners[2][0]- panelMap.corners[1][0], panelMap.corners[2][1]- panelMap.corners[1][1], panelMap.corners[2][2]- panelMap.corners[1][2]).normalize();
            if(panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleLength/2) - 0.2 - 0.3048);
            }
            else if(panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleWidth/2) - 0.2 - 0.2032);
            }
            vertex.sub(movementVector);
            lineVertices[++this.index] = vertex.x;
            lineVertices[++this.index] = vertex.y;
            lineVertices[++this.index] = panel.getHighestZ() + 1;
            this.optimizedLineGeometry.setDrawRange(0, (this.index + 1) / 3);
            this.optimizedLineGeometry.attributes.position.needsUpdate = true;
            this.optimizedLineGeometry.computeBoundingBox();
            this.optimizedLineGeometry.computeBoundingSphere();
            // }
        }
    }

    drawCurve(panel , currentStringPanels , previousPanel = null) {

        this.currentStringPanels = currentStringPanels;

        if (this.currentStringPanels.length > 1 && previousPanel === null) {
            previousPanel = this.currentStringPanels[this.currentStringPanels.indexOf(panel) - 1];
        }

        if (previousPanel !== null && previousPanel !== undefined) {
            const prevVertices = previousPanel.getPosition();
            const vertex = panel.getPosition();
            let panelDimensions = panel.getSubarray().moduleProperties;
            let panelMap = panel.getPanelMap();
            let movementVector = new THREE.Vector3(panelMap.corners[2][0]- panelMap.corners[1][0], panelMap.corners[2][1]- panelMap.corners[1][1], panelMap.corners[2][2]- panelMap.corners[1][2]).normalize();
            if(panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleLength/2) - 0.2 - 0.3048);
            }
            else if(panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleWidth/2) - 0.2 - 0.2032);
            }
            vertex.sub(movementVector);

            panelDimensions = previousPanel.getSubarray().moduleProperties;
            panelMap = previousPanel.getPanelMap();
            movementVector = new THREE.Vector3(panelMap.corners[2][0]- panelMap.corners[1][0], panelMap.corners[2][1]- panelMap.corners[1][1], panelMap.corners[2][2]- panelMap.corners[1][2]).normalize();
            if(previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleLength/2) - 0.2 - 0.3048);
            }
            else if(previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar( (panelDimensions.moduleWidth/2) - 0.2 - 0.2032);
            }
            prevVertices.sub(movementVector);
            let highestZ = panel.getHighestZ();
            const panelWidth = (
                (previousPanel.getSubarray().moduleProperties.moduleWidth / 2) +
                (panel.getSubarray().moduleProperties.moduleWidth / 2) + 0.1
            );
            const panelHeight = (
                (previousPanel.getSubarray().moduleProperties.moduleLength / 2) +
                (panel.getSubarray().moduleProperties.moduleLength / 2) + 0.1
            );
            if (previousPanel.getHighestZ() > panel.getHighestZ()) {
                highestZ = previousPanel.getHighestZ();
            }
            // below condition checks whether two panels are far from normal spacing, then curve implementation.
            const distanceX = prevVertices.x - vertex.x;
            const distanceY = prevVertices.y - vertex.y;
            const distance = Math.sqrt((distanceX ** 2) + (distanceY ** 2));
            if (
                requireJump(panel, previousPanel, distance, panelWidth, panelHeight)
            ) {
                let midpointX = (prevVertices.x + vertex.x) / 2;
                let midpointY = (prevVertices.y + vertex.y) / 2;
                const prevVertexVector = new THREE.Vector2(prevVertices.x, prevVertices.y);
                const vertexVector = new THREE.Vector2(vertex.x, vertex.y);
                vertexVector.sub(prevVertexVector);
                vertexVector.normalize();
                let unitVector;
                if (vertexVector.x === 0) {
                    unitVector = new THREE.Vector2(1, 0);
                }
                else {
                    const slope = vertexVector.y / vertexVector.x;
                    unitVector = new THREE.Vector2(-slope, 1);
                }
                unitVector.normalize();
                const midpointVector = new THREE.Vector2(midpointX, midpointY);
                midpointVector.add(unitVector.multiplyScalar(panelHeight));
                midpointX = midpointVector.x;
                midpointY = midpointVector.y;
                const midpointZ = panel.getSubarray().getHighestZ();

                const curvePoints = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(prevVertices.x, prevVertices.y, midpointZ + 1),
                    new THREE.Vector3(midpointX, midpointY, midpointZ + 1),
                    new THREE.Vector3(vertex.x, vertex.y, midpointZ + 1),
                );

                return {curvePoints , highestZ};
            }
        }
    }

    removeStringsFromMicroInverter() {
        let i=0 ; let j = 0;
        while(i < this.microInverter.strings.length){
            if(this.microInverter.strings[i].panels[0].id === this.currentStrings[j].panels[0].id){
                this.microInverter.stringGroup.remove(this.currentStrings[j].stringMesh);
                let index = this.microInverter.strings.findIndex(element => element.stringMesh === this.currentStrings[j].stringMesh);
                this.microInverter.strings.splice(index , 1);
                j++;
            }else{
                i++ ;
            }
        }
        this.currentStrings = [];
    }

    onCompleteStringingMode() {
        if(this.currentStringPanels.length > 0){
            this.microInverter.strings.push({
                stringNum: this.microInverter.strings.length,
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            });
            this.currentStrings.push({
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            })
        }
        this.currentStringPanels = [];
        this.microInverter.saveState();
        this.stage.stateManager.stopContainer();
        this.uninitializeStringingMode();
    }

    onCancelStringingMode() {
        //handle it on cancel
        if(this.currentStringPanels.length > 0){
            this.microInverter.strings.push({
                stringNum: this.microInverter.strings.length,
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            });
            this.currentStrings.push({
                panels: [...this.currentStringPanels],
                stringMesh: this.optimizedLineMesh
            })
        }
        if(this.currentStrings.length > 0){
            this.removeStringsFromMicroInverter();
        }
        this.microInverter.saveState();
        this.stage.stateManager.stopContainer({ discard: true });
        this.uninitializeStringingMode();
    }
}
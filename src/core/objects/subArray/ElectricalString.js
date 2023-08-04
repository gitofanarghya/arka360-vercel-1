import * as THREE from 'three';
import { v4 } from 'uuid';
import Panel from './Panel';
import {
    CREATED_STATE,
    DELETED_STATE,
    MAX_STRINGING_VERTICES,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
} from '../../coreConstants';
import { requireJump } from '../../structure/utils/mathUtils';
import LinkedList from './../model/cable/LinkedList';
import { INVERTER_COLORS, VISUAL_STATES } from './../visualConstants';
import { arrayOfCorrectImages, arrayOfIncorrectImages } from '../../utils/stringingModeUtils';

const incorrectNumberMeshes = [];
const correctNumberMeshes = [];
let currentNumberMeshes = incorrectNumberMeshes;
const planeGeometry = new THREE.PlaneGeometry(0.8, 0.8, 10);

for (let i = 0; i < arrayOfIncorrectImages.length; i += 1) {
    let texture = new THREE.TextureLoader().load(arrayOfIncorrectImages[i]);
    let planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    incorrectNumberMeshes.push(new THREE.Mesh(planeGeometry, planeMaterial));
    texture = new THREE.TextureLoader().load(arrayOfCorrectImages[i]);
    planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    correctNumberMeshes.push(new THREE.Mesh(planeGeometry, planeMaterial));
}

export default class ElectricalString {
    constructor(stage, inverter) {
        this.stage = stage;
        this.inverter = inverter;

        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        this.name = 'String';
        this.id = this.stage.getStringId();

        this.linkedPanels = [];
        this.list = new LinkedList();

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });

        this.stringColor = new THREE.Color(INVERTER_COLORS.Color[Math.floor(Math.random() * INVERTER_COLORS.Color.length)]);

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.circleGroup = new THREE.Group();
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xf44336, linewidth: 1 });
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        this.selectionPointers = new THREE.Group();
        this.pointerGeometry = new THREE.CircleGeometry(0.2, 30);
        this.pointer1 = new THREE.Mesh(this.pointerGeometry, this.circleMaterial);
        this.pointer2 = new THREE.Mesh(this.pointerGeometry, this.circleMaterial);
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.optimizedLineGeometry = new THREE.BufferGeometry();
        this.optimizedLineMesh = new THREE.Line(this.optimizedLineGeometry, this.lineMaterial);
        const positions = new Float32Array(MAX_STRINGING_VERTICES * 3); // 3 vertices per point
        this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.optimizedLineGeometry.setDrawRange(0, 2);

        this.displayStringForStringing();

        this.preventPanelAdditionInList = false;

        currentNumberMeshes = incorrectNumberMeshes;
        this.index = -1;
        this.stage.sceneManager.scene.add(this.objectsGroup);
    }

    getState() {
        const stringData = {
            linkedPanelsUuid: [],
            name: this.name,
            inverterUuid: this.inverter.uuid,
            id: this.id,

        };
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            stringData.linkedPanelsUuid.push(this.linkedPanels[i].uuid);
        }
        return stringData;
    }

    saveState({ withoutContainer } = { withoutContainer: false }) {
        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: this.getState.bind(this),
            withoutContainer,
        });
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.linkedPanels = [];
            for (let i = 0, l = state.linkedPanelsUuid.length; i < l; i += 1) {
                const panel = this.stage.getObject(state.linkedPanelsUuid[i]);
                this.linkedPanels.push(panel);
            }
            this.inverter = this.stage.getObject(state.inverterUuid);
            this.updateString();
            this.removeNumberMesh();
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                this.stage.sceneManager.scene.add(this.objectsGroup);
                this.inverter.addString(this);
            }
        }
    }

    updateString() {
        // first remove the old drawing.
        this.resetStringMesh();
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            if (i === 0) {
                this.addStringAndNumberForPanelAddition(this.linkedPanels[i], null);
            }
            else {
                this.addStringAndNumberForPanelAddition(this.linkedPanels[i], this.linkedPanels[i - 1]);
            }
        }
        this.saveState();
    }

    edit() {
        const currentVisualState = this.getStringColorState();
        let tempColor;
        if (currentVisualState === 'correct-string-size') {
            currentNumberMeshes = correctNumberMeshes;
            if (this.linkedPanels.length === this.inverter.maxString) {
                tempColor = this.stringColor;

            }
            tempColor = new THREE.Color(0xf44336);
        }
        // as we are showing only correctNumberMeshes in microinverter stringing.
        // else {
        //     currentNumberMeshes = incorrectNumberMeshes;
        //     tempColor = new THREE.Color(0xf44336);
        // }
        if (this.stage.stringing.init(this.inverter, this) !== 'Stringing Mode Enabled') {
            this.lineMaterial.color = tempColor;
        }
        this.displayStringForStringing();
    }

    enterPanel(panel) {
        const previousVisualState = this.getStringColorState();
        this.preventPanelAdditionInList = false;
        const indexOfPanel = this.linkedPanels.indexOf(panel);
        if (indexOfPanel !== -1) {
            if (indexOfPanel === this.linkedPanels.length - 2) {
                this.linkedPanels[this.linkedPanels.length - 1]
                    .switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT);
                this.removePanel(this.linkedPanels[this.linkedPanels.length - 1]);
            }
            else {
                this.removePanel(panel);
                panel.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT);
            }
            this.updateString();
        }
        else {
            this.addPanel(panel);
            panel.switchVisualState(previousVisualState);
            this.addStringAndNumberForPanelAddition(panel);
        }
        let randomStringColor;
        const currentVisualState = this.getStringColorState();
        if (previousVisualState === currentVisualState) {
            if (currentVisualState === 'correct-string-size') {
                currentNumberMeshes = correctNumberMeshes;
                if (this.linkedPanels.length === this.inverter.maxString) {
                    randomStringColor = this.stringColor;
                }
                else {
                    randomStringColor = new THREE.Color(0x9ad027);
                }
                this.lineMaterial.color = randomStringColor;
            }
            // as we are showing only correctNumberMeshes in microinverter stringing.
            // else {
            //     currentNumberMeshes = incorrectNumberMeshes;
            //     this.lineMaterial.color = new THREE.Color(0xf44336);
            // }
            this.updateString();
        }
    }

    removePanel(panel) {
        this.list.removeElement(panel.id);
        this.preventPanelAdditionInList = true;
        this.linkedPanels.splice(this.linkedPanels.indexOf(panel), 1);
        this.updateString();
        this.removeNumberMesh();
        return;
    }

    addPanel(panel) {
        if (!(panel instanceof Panel)) {
            console.error(panel, ' not an instance of panel.');
        }
        if (this.linkedPanels.includes(panel)) {
            console.error('This panel already added in the String');
            return;
        }
        this.linkedPanels.push(panel);
        this.list.add(panel.id, panel);
    }

    addStringAndNumberForPanelAddition(panel, previousPanel = null) {

        let curvePoints;
        let highestZ;

        const lineVertices = this.optimizedLineGeometry.attributes.position.array;

        if (this.linkedPanels.length > 1 && previousPanel === null) {
            previousPanel = this.linkedPanels[this.linkedPanels.indexOf(panel) - 1];
        }

        if (previousPanel !== null && previousPanel !== undefined) {
            const prevVertices = previousPanel.getPosition();
            const vertex = panel.getPosition();
            let panelDimensions = panel.getSubarray().moduleProperties;
            let panelMap = panel.getPanelMap();
            let movementVector = new THREE.Vector3(
                panelMap.corners[2][0] - panelMap.corners[1][0],
                panelMap.corners[2][1] - panelMap.corners[1][1],
                panelMap.corners[2][2] - panelMap.corners[1][2],
            ).normalize();
            if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
            }
            else if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
            }
            vertex.sub(movementVector);

            panelDimensions = previousPanel.getSubarray().moduleProperties;
            panelMap = previousPanel.getPanelMap();
            movementVector = new THREE.Vector3(panelMap.corners[2][0] - panelMap.corners[1][0], panelMap.corners[2][1] - panelMap.corners[1][1], panelMap.corners[2][2] - panelMap.corners[1][2]).normalize();
            if (previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
            }
            else if (previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
            }
            prevVertices.sub(movementVector);
            highestZ = panel.getHighestZ();
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

                curvePoints = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(prevVertices.x, prevVertices.y, midpointZ + 1),
                    new THREE.Vector3(midpointX, midpointY, midpointZ + 1),
                    new THREE.Vector3(vertex.x, vertex.y, midpointZ + 1),
                );
            }
        }
        if (curvePoints !== null && curvePoints !== undefined && highestZ !== null && highestZ !== undefined) {
            const points = curvePoints.getPoints(10);
            for (let j = 0; j < points.length; j += 1) {
                lineVertices[++this.index] = points[j].x;
                lineVertices[++this.index] = points[j].y;
                lineVertices[++this.index] = highestZ + 1;
            }
        }
 
        const vertex = panel.getPosition();
        const panelDimensions = panel.getSubarray().moduleProperties;
        const panelMap = panel.getPanelMap();
        let movementVector = new THREE.Vector3(
            panelMap.corners[2][0] - panelMap.corners[1][0],
            panelMap.corners[2][1] - panelMap.corners[1][1],
            panelMap.corners[2][2] - panelMap.corners[1][2],
        ).normalize();
        if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
            movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
        }
        else if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
            movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
        }
        vertex.sub(movementVector);
        lineVertices[++this.index] = vertex.x;
        lineVertices[++this.index] = vertex.y;
        lineVertices[++this.index] = panel.getHighestZ() + 1;
        this.optimizedLineGeometry.setDrawRange(0, (this.index + 1) / 3);
        this.optimizedLineGeometry.attributes.position.needsUpdate = true;
        this.optimizedLineGeometry.computeBoundingBox();
        this.optimizedLineGeometry.computeBoundingSphere();

        // code for adding numbers to strung panels

        const panelIndex = this.linkedPanels.indexOf(panel);
        if (panelIndex < 49) {
            currentNumberMeshes[panelIndex].position.x = vertex.x;
            currentNumberMeshes[panelIndex].position.y = vertex.y;
            currentNumberMeshes[panelIndex].position.z = panel.getHighestZ() + 1;
            this.circleGroup.add(currentNumberMeshes[panelIndex]);
        }
    }

    removeNumberMesh() {
        this.circleGroup.children = [];
    }

    resetStringMesh() {
        this.circleGroup.children = [];
        this.index = -1;
        const positions = new Float32Array(MAX_STRINGING_VERTICES * 3); // 3 vertices per point
        this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.optimizedLineGeometry.setDrawRange(0, 1);
        this.optimizedLineGeometry.attributes.position.needsUpdate = true;
    }

    getStringColorState() {
        // as we are showing only correctNumberMeshes in microinverter stringing.
        // if (this.linkedPanels.length > this.inverter.maxString) {
        //     return VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE;
        // }
        // if (this.inverter.maxString >= 2) {
        //     if (this.linkedPanels.length !== this.inverter.maxString) {
        //         return VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE;
        //     }
        // }
        return VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE;
    }

    clearState() {
        this.removeObject();
    }

    removeObject() {
        this.deleteString();
    }

    deleteString() {
        this.deSelect();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        if (this.inverter !== null) {
            this.stage.selectionControls.setSelectedObject(this.inverter);
        }
        this.linkedPanels = [];
        // TODO :clear list by calling linkedlist func

        if (this.inverter !== null) {
            this.inverter.removeString(this);
        }

        this.inverter = null;
        this.stage.selectionControls.removeSelectedObject(this);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });
    }

    saveObject() {
        this.verifyForPanelDeleted();
        const linkedPanelIds = [];
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            linkedPanelIds.push({
                panelId: this.linkedPanels[i].getId(),
                subarrayId: this.linkedPanels[i].getSubarray().getId(),
                shadowMapId: 0,
            });
        }
        return {
            linkedPanelIds,
            id: this.id,
        };
    }

    loadObject(linkedPanels) {
        for (let i = 0; i < linkedPanels.length; i += 1) {
            this.enterPanel(linkedPanels[i]);
        }
        this.removeNumberMesh();
        this.editStringColor();
        this.hideStringColor();
        this.saveState({ withoutContainer: true });
    }

    onSelect() {
        this.inverter.onSelect();
        this.displayStringForStringing();
        const lineVertices = this.optimizedLineGeometry.attributes.position.array;
        this.pointer1.position.set(lineVertices[0],lineVertices[1],lineVertices[2]+0.1);
        const inverterPos = [];
        this.inverter.microInverterArray.forEach(element => {
            inverterPos.push({
                panelId: element.connectedPanel.uuid,
                inverterMeshPos: element.mesh.position,
            })
        });
        const pointer2Pos = inverterPos.filter(element => element.panelId === this.linkedPanels[this.linkedPanels.length - 1].uuid)[0].inverterMeshPos;
        this.pointer2.position.set(pointer2Pos.x, pointer2Pos.y, pointer2Pos.z);
        this.pointer2.position.z += 0.1;
        this.selectionPointers.add(this.pointer1);
        this.selectionPointers.add(this.pointer2);
        this.objectsGroup.add(this.selectionPointers);

        this.lineMaterial.color = new THREE.Color(0xFFFFFF);    //0x7BEBFF
    }

    deSelect() {
        if (this.inverter) {
            this.inverter.deSelect();
        }
        if (!this.stage.viewManager.showStringing) {
            this.hideStringColor();
        }
        this.objectsGroup.remove(this.selectionPointers);
        this.selectionPointers.children = [];
        this.lineMaterial.color = this.stringColor;
    }

    hideStringColor() {
        this.objectsGroup.remove(this.circleGroup);
        this.circleGroup.children = [];
        this.objectsGroup.remove(this.optimizedLineMesh);
    }

    editStringColor() {
        this.objectsGroup.remove(this.circleGroup);
        this.circleGroup.children = [];
        this.lineMaterial.color = this.stringColor;
        this.objectsGroup.add(this.optimizedLineMesh);
    }

    getStringLength() {
        return (this.linkedPanels.length);
    }

    displayStringForStringing() {
        this.objectsGroup.add(this.circleGroup);
        this.objectsGroup.add(this.optimizedLineMesh);
    }

    // function to get coordinates of each Electrical Strings for CAD export

    getCoordinates() {
        const coordinates = [];
        for (let i = 0, l = this.optimizedLineMesh.geometry.attributes.position.array.length; i < l; i += 3) {
            if (
                this.optimizedLineMesh.geometry.attributes.position.array[i] === 0 &&
                this.optimizedLineMesh.geometry.attributes.position.array[i + 1] === 0 &&
                this.optimizedLineMesh.geometry.attributes.position.array[i + 2] === 0
            ) {
                break;
            }
            coordinates.push([
                this.optimizedLineMesh.geometry.attributes.position.array[i],
                this.optimizedLineMesh.geometry.attributes.position.array[i + 1],
                this.optimizedLineMesh.geometry.attributes.position.array[i + 2],
            ]);
        }
        return coordinates;
    }

    verifyForPanelDeleted() {
        const linkedPanels = [];
        let isStringUpdateRequired = false;
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            if (this.linkedPanels[i].getParent() === null
            || this.linkedPanels[i].getParent() === undefined
            || this.linkedPanels[i].hidden) {
                isStringUpdateRequired = true;
            }
            else {
                linkedPanels.push(this.linkedPanels[i]);
            }
        }
        if (isStringUpdateRequired) {
            this.resetStringMesh();
            this.linkedPanels.length = 0;
            if (linkedPanels.length > 0) {
                this.loadObject(linkedPanels);
            }
            else {
                this.removeObject();
            }
        }
    }
}
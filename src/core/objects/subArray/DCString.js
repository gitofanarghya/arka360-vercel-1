import * as THREE from 'three';
import { v4 } from 'uuid';
import Panel from '../../objects/subArray/Panel';
import { VISUAL_STATES, INVERTER_COLORS } from '../../objects/visualConstants';
import {
    CREATED_STATE,
    DELETED_STATE,
    MAX_STRINGING_VERTICES,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
} from '../../coreConstants';
import LinkedList from './../model/cable/LinkedList';
import { arrayOfCorrectImages, arrayOfIncorrectImages } from '../../utils/stringingModeUtils';
import { requireJump } from '../../structure/utils/mathUtils';
import { deg2Rad } from '../../utils/utils';
import * as utils from '../../utils/utils';

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

export default class DCString {
    constructor(stage, mppt) {
        this.stage = stage;
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        this.linkedPanels = [];
        this.name = 'Dc String';
        this.id = this.stage.getDcStringId();
        this.mppt = mppt;
        this.attachedDcCable = [];

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        this.list = new LinkedList();
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.circleGroup = new THREE.Group();
        this.selectionPointers = new THREE.Group();
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xf44336, linewidth: 1 });
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: 0x7BEBFF });
        this.pointerGeometry = new THREE.CircleGeometry(0.2, 30);
        this.pointer1 = new THREE.Mesh(this.pointerGeometry, this.circleMaterial);
        this.pointer2 = new THREE.Mesh(this.pointerGeometry, this.circleMaterial);
        this.squareGroup = new THREE.Group();
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xf44336, linewidth: 1 });
        this.circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.squareMaterial = new THREE.MeshBasicMaterial({ color: 0xC4DAEA });
        this.optimizedLineGeometry = new THREE.BufferGeometry();
        this.squareGeometry = new THREE.PlaneGeometry(0.4, 0.4);
        this.optimizedLineMesh = new THREE.Line(this.optimizedLineGeometry, this.lineMaterial);
        const positions = new Float32Array(MAX_STRINGING_VERTICES * 3); // 3 vertices per point
        this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.optimizedLineGeometry.setDrawRange(0, 2);

        // Figure out why this was used?
        this.displayStringForStringing();

        // Setting initial image color for every new string
        currentNumberMeshes = incorrectNumberMeshes;
        this.index = -1;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.preventPanelAdditionInList = false;
    }

    getState() {
        const stringData = {
            linkedPanelsUuid: [],
            name: this.name,
            mpptUuid: this.mppt.uuid,
            id: this.id,
        };
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            stringData.linkedPanelsUuid.push(this.linkedPanels[i].uuid);
        }
        return stringData;
    }

    saveState({ withoutContainer } = { withoutContainer: false }) {
        this.stage.stateManager.add({
            id: this.id,
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
                panel.setElectricalConnection(this);
            }
            this.mppt = this.stage.getObject(state.mpptUuid);
            this.updateString();
            this.removeNumberMesh();
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                // add objectsGroup to scene
                    this.stage.sceneManager.scene.add(this.objectsGroup);
                this.mppt.addString(this);
            }
        }
    }

    edit() {
        const currentVisualState = this.getStringColorState();
        this.objectsGroup.remove(this.squareGroup);
        this.squareGroup.clear();
        let tempColor;
        if (currentVisualState === 'correct-string-size') {
            currentNumberMeshes = correctNumberMeshes;
            tempColor = new THREE.Color(0x74bc22);
        }
        else {
            currentNumberMeshes = incorrectNumberMeshes;
            tempColor = new THREE.Color(0xf44336);
        }
        if (this.stage.stringing.init(this.mppt, this) !== 'Stringing Mode Enabled') {
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
        const currentVisualState = this.getStringColorState();
        if (previousVisualState !== currentVisualState) {
            if (currentVisualState === 'correct-string-size') {
                currentNumberMeshes = correctNumberMeshes;
                this.lineMaterial.color = new THREE.Color(0x74bc22);
            }
            else {
                currentNumberMeshes = incorrectNumberMeshes;
                this.lineMaterial.color = new THREE.Color(0xf44336);
            }
            this.updateString();
        }
    }

    addPanel(panel) {
        if (!(panel instanceof Panel)) {
            console.error(panel, ' not an instance of panel.');
        }
        if (this.linkedPanels.includes(panel)) {
            console.error('This panel already added in the DC String');
            return;
        }
        this.linkedPanels.push(panel);
        panel.electricalComponentConnected = this;
        this.list.add(panel.id, panel);
    }

    addPanelAtPosition(panel, index) {
        if (this.linkedPanels.includes(panel)) {
            console.error('This panel already added in the DC String');
            return;
        }
        this.linkedPanels.splice(index, 0, panel);
    }

    removePanel(panel) {
        if (this.linkedPanels.includes(panel)) {
            this.list.removeElement(panel.id);
            this.preventPanelAdditionInList = true;
            this.linkedPanels.splice(this.linkedPanels.indexOf(panel), 1);
            panel.electricalComponentConnected = null;
            return;
        }
        console.error('This panel is not in the DC String');
    }

    loadObject(linkedPanels) {
        for (let i = 0; i < linkedPanels.length; i += 1) {
            this.enterPanel(linkedPanels[i]);
        }
        this.drawOptimizers();
        this.hideStringColor();
        this.saveState({ withoutContainer: true });
    }

    getStringLength() {
        return this.linkedPanels.length;
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
        if (this.attachedDcCable[0] !== undefined) {
            // instead save the dc string in dc Cable and then it will automatically
            // update its end point
            this.attachedDcCable[0].stringEnd = this.linkedPanels[0].getPosition();
            this.attachedDcCable[0].updateAutoRoutingBrokenOutlinePoints();
            this.attachedDcCable[0].updateGeometry();
        }
        if (this.attachedDcCable[1] !== undefined) {
            this.attachedDcCable[1].stringEnd = this.linkedPanels[this.linkedPanels.length - 1].getPosition();
            this.attachedDcCable[1].updateAutoRoutingBrokenOutlinePoints();
            this.attachedDcCable[1].updateGeometry();
        }
        this.drawOptimizers();
        this.saveState();
    }

    addStringAndNumberForPanelAddition(panel, previousPanel = null) {
        if (this.index > MAX_STRINGING_VERTICES * 3) {
            return;
        }
        if (this.linkedPanels.length > 1 && previousPanel === null) {
            previousPanel = this.linkedPanels[this.linkedPanels.indexOf(panel) - 1];
        }
        const lineVertices = this.optimizedLineGeometry.attributes.position.array;
        const vertex = panel.getPosition();
        if (this.mppt.inverter.optimizerStatus) {
            let panelDimensions = panel.getSubarray().moduleProperties;
            let panelMap = panel.getPanelMap();
            let movementVector = new THREE.Vector3(panelMap.corners[2][0]- panelMap.corners[1][0], panelMap.corners[2][1]- panelMap.corners[1][1], panelMap.corners[2][2]- panelMap.corners[1][2]).normalize();
            if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength/2) - 0.2 - 0.3048);
            }
            else if (panel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth/2) - 0.2 - 0.2032);
            }
            vertex.sub(movementVector);
        }
        let highestZ = panel.getHighestZ();
        if (previousPanel !== null && previousPanel !== undefined) {
            const prevVertices = previousPanel.getPosition();
            if (this.mppt.inverter.optimizerStatus) {
                let panelDimensions = previousPanel.getSubarray().moduleProperties;
                let panelMap = previousPanel.getPanelMap();
                let movementVector = new THREE.Vector3(panelMap.corners[2][0] - panelMap.corners[1][0], panelMap.corners[2][1] - panelMap.corners[1][1], panelMap.corners[2][2] - panelMap.corners[1][2]).normalize();
                if (previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                    movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
                }
                else if (previousPanel.getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                    movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
                }
                prevVertices.sub(movementVector);
            }
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
                const points = curvePoints.getPoints(10);
                for (let j = 0; j < points.length; j += 1) {
                    lineVertices[++this.index] = points[j].x;
                    lineVertices[++this.index] = points[j].y;
                    lineVertices[++this.index] = highestZ + 1;
                }
                // this.optimizedLineGeometry.attributes.position.needsUpdate = true;
            }
        }
        // if panels are more than 1, comparison with the previous panel to cover some cases.
        // lineGeometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, highestZ + 0.1));
        // const lineVertices = this.optimizedLineGeometry.attributes.position.array;
        // const index = (this.linkedPanels.indexOf(panel)) * 3;

        lineVertices[++this.index] = vertex.x;
        lineVertices[++this.index] = vertex.y;
        lineVertices[++this.index] = highestZ + 1;
        this.optimizedLineGeometry.setDrawRange(0, (this.index + 1) / 3);
        this.optimizedLineGeometry.attributes.position.needsUpdate = true;

        // const t1 = performance.now();
        this.optimizedLineGeometry.computeBoundingBox();
        this.optimizedLineGeometry.computeBoundingSphere();
        // const t2 = performance.now();

        // positioning for image
        const panelIndex = this.linkedPanels.indexOf(panel);
        if (panelIndex < 49) {
            currentNumberMeshes[panelIndex].position.x = vertex.x;
            currentNumberMeshes[panelIndex].position.y = vertex.y;
            currentNumberMeshes[panelIndex].position.z = highestZ + 1.1;
            this.circleGroup.add(currentNumberMeshes[panelIndex]);
        }
    }

    removeNumberMesh() {
        this.circleGroup.children = [];
    }

    displayStringForStringing() {
        this.objectsGroup.add(this.circleGroup);
        this.objectsGroup.add(this.optimizedLineMesh);
        this.objectsGroup.add(this.squareGroup);
    }

    getStringData() {
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

    // implement undo/redo, this is not available during stringing mode
    clearState() {
        this.removeObject();
    }

    editStringColor() {
        this.objectsGroup.remove(this.circleGroup);
        this.circleGroup.children = [];
        this.lineMaterial.color = new THREE.Color(
            INVERTER_COLORS.Color[this.mppt.inverter.getId() % INVERTER_COLORS.Color.length],
        );
        this.objectsGroup.add(this.optimizedLineMesh);
        this.objectsGroup.add(this.squareGroup);
    }

    hideStringColor() {
        this.objectsGroup.remove(this.circleGroup);
        this.circleGroup.children = [];
        this.objectsGroup.remove(this.optimizedLineMesh);
        this.objectsGroup.remove(this.squareGroup);
    }

    onSelect() {
        this.mppt.inverter.onSelect();
        this.displayStringForStringing();
        const lineVertices = this.optimizedLineGeometry.attributes.position.array;
        this.pointer1.position.set(lineVertices[0],lineVertices[1],lineVertices[2]+0.1);
        this.pointer2.position.copy(this.linkedPanels[this.linkedPanels.length - 1].getPosition());
        this.pointer2.position.z += 0.1;
        this.selectionPointers.add(this.pointer1);
        this.selectionPointers.add(this.pointer2);
        this.objectsGroup.add(this.selectionPointers);

        this.lineMaterial.color = new THREE.Color(0x7BEBFF);
    }

    deSelect() {
        if ( this.mppt ) {
            this.mppt.inverter.deSelect();
        }
        if (!this.stage.viewManager.showStringing) {
            this.hideStringColor();
        }
        this.objectsGroup.remove(this.selectionPointers);
        this.selectionPointers.children = [];
        if (this.mppt && this.mppt.inverter !== null) {
            this.lineMaterial.color = new THREE.Color(
                INVERTER_COLORS.Color[this.mppt.inverter.getId() % INVERTER_COLORS.Color.length],
            );
        }
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

    removeObject() {
        this.deleteString();
    }

    removeWithContainer() {
        this.stage.stateManager.startContainer();
        this.removeObject();
        this.stage.stateManager.stopContainer();
    }

    deleteString() {
        // dc cable disabled
        // if (this.attachedDcCable.length > 0) {
        //     updateAttachedConduits(this.attachedDcCable[0]);
        //     updateAttachedConduits(this.attachedDcCable[1]);
        //     this.attachedDcCable[0].removeObject();
        //     this.attachedDcCable[1].removeObject();

        //     function updateAttachedConduits(cable) {
        //         for(let i=0; i<cable.attachedConduit.length; i++) {
        //             cable.attachedConduit[i].updateAttachedCables(cable.attachedString);
        //         }
        //     }
        // }
        this.deSelect();
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        // if (this.mppt.inverter !== null) {
        //     this.stage.selectionControls.setSelectedObject(this.mppt.inverter);
        // }
        for (let i = 0, l = this.linkedPanels.length; i < l; i += 1) {
            this.linkedPanels[i].electricalComponentConnected = null;
        }
        this.linkedPanels = [];
        if (this.mppt !== null) {
            this.mppt.removeString(this);

            // Juggad for dynamic update of completed strings in sappane
            this.mppt.setCopyStrings();
        }

        this.mppt = null;
        // this.stage.selectionControls.removeSelectedObject(this);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });
    }

    resetStringMesh() {
        this.circleGroup.children = [];
        this.index = -1;
        const positions = new Float32Array(MAX_STRINGING_VERTICES * 3); // 3 vertices per point
        this.optimizedLineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.optimizedLineGeometry.setDrawRange(0, 1);
        this.optimizedLineGeometry.attributes.position.needsUpdate = true;
    }

    // send this to mmp or get the data from mppt
    getStringColorState() {
        if (this.linkedPanels.length > this.mppt.stringRange.maximum ||
            this.linkedPanels.length < this.mppt.stringRange.minimum) {
            return VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE;
        }
        if (this.mppt.strings.length >= 2) {
            if (this.linkedPanels.length !== this.mppt.getFirstStringLength()) {
                return VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE;
            }
        }
        return VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE;
    }

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

    // Judgaad fix for undo/redo
    // when dc-string was selected while undo/redo
    switchVisualState() {
        // do nothing.
    }

    getOptimizersCoordinates() {
        if (this.mppt.inverter.optimizerStatus) {
            const optimizersCoordinates = [];
            const optimizersMesh = this.squareGroup.children;
            for (let i = 0, l = optimizersMesh.length; i < l; i += 1) {
                let optimizersVertices = [];
                const optimizerPosition = optimizersMesh[i].position;
                const vertices = utils.getVerticesFromBufferGeometry(optimizersMesh[i].geometry);
                for (let j = 0, len = vertices.length; j < len; j += 1) {
                    optimizersVertices.push([
                        vertices[j].x + optimizerPosition.x,
                        vertices[j].y + optimizerPosition.y,
                        vertices[j].z + optimizerPosition.z,
                    ]);
                    if (this.linkedPanels[i]) {
                        let vec1 = new THREE.Vector2(optimizersVertices[j][0], optimizersVertices[j][1]);
                        vec1.rotateAround(optimizerPosition, deg2Rad(180 - parseFloat(this.linkedPanels[i].getSubarray().getAzimuth())));
                        optimizersVertices[j] = [
                            vec1.x,
                            vec1.y,
                            vertices[j].z + optimizerPosition.z,
                        ];
                    }
                }
                let tempVal = optimizersVertices[2];
                optimizersVertices[2] = optimizersVertices[3];
                optimizersVertices[3] = tempVal;
                optimizersCoordinates.push(optimizersVertices);
            }
            return optimizersCoordinates;
        }
        return [];
    }

    drawOptimizers() {
        if (this.mppt.inverter.optimizerStatus) {
            // this.objectsGroup.remove(this.squareGroup);
            this.squareGroup.clear();
            for (let j = 0; j < this.linkedPanels.length; j++) {
                const squareMesh = new THREE.Mesh(this.squareGeometry, this.squareMaterial);
                // squareMesh.position.copy( this.linkedPanels[j].getPosition() );
                // squareMesh.position.z += 0.1;
                const panelDimensions = this.linkedPanels[j].getSubarray().moduleProperties;
                const panelMap = this.linkedPanels[j].getPanelMap();
                let movementVector = new THREE.Vector3(panelMap.corners[2][0] - panelMap.corners[1][0], panelMap.corners[2][1] - panelMap.corners[1][1], panelMap.corners[2][2] - panelMap.corners[1][2]).normalize();
                if (this.linkedPanels[j].getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                    movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
                }
                else if (this.linkedPanels[j].getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                    movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
                }
                squareMesh.position.copy(this.linkedPanels[j].getPosition().sub(movementVector));
                squareMesh.position.z += 0.2;
                const azimuth = this.linkedPanels[j].getSubarray().getAzimuth();
                squareMesh.rotateZ(deg2Rad(180 - parseFloat(azimuth)));
                this.squareGroup.add(squareMesh);
                j += this.mppt.inverter.optimizerStringLength - 1;
            }
            // this.objectsGroup.add(this.squareGroup);
        }
    }
}

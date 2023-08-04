import * as THREE from 'three';
import { getSubarrays } from '../../utils/exporters';
import axios from 'axios';
import BaseObject from '../BaseObject';
import ElectricalString from '../subArray/ElectricalString';
import { v4 } from 'uuid';
import {
    CREATED_STATE,
    DELETED_STATE,
    PANEL_ORIENTATION_LANDSCAPE,
    PANEL_ORIENTATION_PORTRAIT,
} from '../../coreConstants';
import {
    deg2Rad,
    rotateVector3AroundX,
    rotateVector3AroundZ,
} from '../../utils/utils';
import { createMesh } from '../../utils/meshUtils';

export default class MicroInverter extends BaseObject {
    constructor(stage, inverterSpecifications = {}) {
        super(stage);
        this.stage = stage;
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        this.id = this.stage.getMicroInverterId();
        this.name = `Micro Inverter #${this.id.toString()}`;
        this.panels = [];
        this.stringLength = 1;
        this.strings = [];

        // TODO: use this instead directly adding
        // square group and string group into scene
        this.objectsGroup = new THREE.Group();

        this.squareGroup = new THREE.Group();
        this.stringGroup = new THREE.Group();
        this.squareMaterial = new THREE.MeshBasicMaterial({
            color: 0x7BEBFF,
        });
        this.squareGeometry = new THREE.PlaneGeometry(0.4, 0.4);

        this.objectsGroup.add(this.squareGroup);
        this.objectsGroup.add(this.stringGroup);

        this.combinerBoxId = null;
        this.combinerBox = null;
        this.microInverterArray = [];
        this.currentPanels = [];

        if (inverterSpecifications !== undefined) {
            this.electricalProperties = inverterSpecifications;
        }
        else {
            this.electricalProperties = {};
        }
        this.maxString = 6;

        this.stringRange = {
            min: 1,
            max: 1,
        };

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => CREATED_STATE,
            withoutContainer: true,
        });
        this.stage.sceneManager.scene.add(this.objectsGroup);
    }

    getState() {
        const microInverterData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            panelsUuid: [],
            strings: [],
        };
        for (let i = 0, l = this.panels.length; i < l; i += 1) {
            microInverterData.panelsUuid.push(this.panels[i].uuid);
        }

        return microInverterData;
    }

    loadState(state, fromState) {
        if (state === CREATED_STATE || state === DELETED_STATE) {
            this.clearState();
        }
        else {
            this.id = state.id;
            this.name = state.name;

            this.panels = [];
            for (let i = 0, l = state.panelsUuid.length; i < l; i += 1) {
                const panel = this.stage.getObject(state.panelsUuid[i]);
                this.panels.push(panel);
                panel.setElectricalConnection(this);
            }
            this.updateGeometry();

            // to do depending on if stringing view is enabled.
            if (fromState === CREATED_STATE || fromState === DELETED_STATE) {
                this.stage.ground.microInverters.push(this);
                // add objectsGroup to scene
                this.stage.sceneManager.scene.add(this.objectsGroup);
            }
        }
    }

    clearState() {
        // select ground if selected
        this.removeObject();
    }

    async setMaxStringLength() {
        try {
            const response = await axios.post(`api/designs/${this.stage.getDesignId()}/micro_string_length/`, {
                inverterID: this.electricalProperties.id,
            });
            this.maxString = response.data.stringLength;
        }
        catch (error) {
            console.error('MicroInverter: Error while updating the inverterID microinverter.');
        }
    }

    saveObject(isCopy = false) {
        const microInverterData = {
            type: MicroInverter.getObjectType(),
        };
        microInverterData.id = this.id;
        microInverterData.name = this.name;
        microInverterData.stringLength = this.stringLength;
        microInverterData.stringRange = this.stringRange;
        microInverterData.electricalProperties = this.electricalProperties;
        microInverterData.maxString = this.maxString;

        microInverterData.panels = [];
        for (let i = 0, l = this.panels.length; i < l; i += 1) {
            microInverterData.panels.push({
                subarrayId: this.panels[i].getSubarray().getId(),
                panelId: this.panels[i].getId(),
            });
        }
        microInverterData.strings = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            microInverterData.strings.push(this.strings[i].saveObject());
        }

        if (isCopy) {
            microInverterData.uuid = this.uuid;
        }
        return microInverterData;
    }

    loadObject(microInverterData, isPaste = false) {
        if (!isPaste) {
            this.id = microInverterData.id;
            this.name = microInverterData.name;
        }

        this.stringLength = microInverterData.stringLength;
        this.stringRange = microInverterData.stringRange;
        this.electricalProperties = microInverterData.electricalProperties;
        this.maxString = microInverterData.maxString;

        this.panels = [];
        this.strings = [];

        const allSubarrays = [];
        getSubarrays(this.stage.ground, allSubarrays);

        for (let i = 0, l = microInverterData.panels.length; i < l; i += 1) {
            for (let j = 0, len = allSubarrays.length; j < len; j += 1) {
                if (allSubarrays[j].getId() === microInverterData.panels[i].subarrayId) {
                    const allPanels = allSubarrays[j].getPanels();
                    // eslint-disable-next-line no-restricted-syntax
                    for (const panel of allPanels) {
                        if (panel.getId() === microInverterData.panels[i].panelId) {
                            this.panels.push(panel);
                            panel.setElectricalConnection(this);
                        }
                    }
                }
            }
        }

        for (let i = 0, l = microInverterData.strings.length; i < l; i += 1) {
            const linkedPanels = [];
            if (microInverterData.strings[i].linkedPanelIds) {
                for (let j = 0, len = microInverterData.strings[i].linkedPanelIds.length; j < len; j += 1) {
                    for (let k = 0, length = allSubarrays.length; k < length; k += 1) {
                        // subarray ID if
                        if (allSubarrays[k].getId() === microInverterData.strings[i].linkedPanelIds[j].subarrayId) {
                            const panel = allSubarrays[k].getPanelWithId(microInverterData.strings[i].linkedPanelIds[j].panelId);
                            if (panel !== null) {
                                linkedPanels.push(panel);
                            }
                        }
                    }
                }
            }
            // backward compatibility (old designs dont have linkedPanelsIds)
            else {
                for (let j = 0, l = microInverterData.strings[i].panelsArray.length; j < l; j += 1) {
                    for (let k = 0, len = allSubarrays.length; k < len; k += 1) {
                        // subarray ID if
                        if (allSubarrays[k].getId() === microInverterData.strings[i].panelsArray[j].subarrayId) {
                            let allPanels = allSubarrays[k].getPanels();
                            for (const panel of allPanels) {
                                if (panel.getId() === microInverterData.strings[i].panelsArray[j].panelsId) {
                                    linkedPanels.push(panel);
                                }
                            }
                        }
                    }
                }
            }
            const string = new ElectricalString(this.stage, this);
            if ( microInverterData.strings[i].id) {
                string.id = microInverterData.strings[i].id;
            }
            this.addString(string);
            string.loadObject(linkedPanels);
        }

        this.updateGeometry();

        this.deSelect();
        this.saveState({ withoutContainer: true });
    }

    updatePanels(panels) {
        for(let i = 0; i < this.panels.length ; i++) {
            this.panels[i].electricalComponentConnected = null;
        }
        this.panels = [];
        for (let i = 0; i < panels.length; i++) {
            this.panels.push(panels[i]);
            panels[i].setElectricalConnection(this);
        }
        this.saveState();
    }

    updateStrings() {
        for (let i = 0; i < this.strings.length; i += 1) {
            this.strings[i].updateString();
            this.strings[i].removeNumberMesh();
        }
    }

    updateGeometry() {
        // update squares
        this.objectsGroup.remove(this.squareGroup);
        this.squareGroup.clear();
        if (this.panels.length == 0) {
            if (this.combinerBox) {
                this.combinerBox.removeObject();
            }
            return;
        }
        this.microInverterArray = [];
        for (let i = 0; i < this.panels.length; i++) {
            const squareMesh = createMesh(this.squareGeometry, this.squareMaterial);
            // squareMesh.position.copy(this.panels[i].getPosition());
            // squareMesh.position.z += 0.5;
            let panelDimensions = this.panels[i].getSubarray().moduleProperties;
            const panelMap = this.panels[i].getPanelMap();
            const tilt = this.panels[i].getSubarray().getTilt();
            let movementVector = new THREE.Vector3(panelMap.corners[2][0]- panelMap.corners[1][0], panelMap.corners[2][1]- panelMap.corners[1][1], panelMap.corners[2][2]- panelMap.corners[1][2]).normalize();
            if (this.panels[i].getSubarray().getPanelOrientation() === PANEL_ORIENTATION_PORTRAIT) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleLength / 2) - 0.2 - 0.3048);
            }
            else if (this.panels[i].getSubarray().getPanelOrientation() === PANEL_ORIENTATION_LANDSCAPE) {
                movementVector = movementVector.multiplyScalar((panelDimensions.moduleWidth / 2) - 0.2 - 0.2032);
            }
            squareMesh.position.copy(this.panels[i].getPosition().sub(movementVector));
            squareMesh.position.z += 0.2;
            const azimuth = this.panels[i].getSubarray().getAzimuth();
            squareMesh.rotateZ(deg2Rad(180 - parseFloat(azimuth)));
            squareMesh.rotateX(deg2Rad(tilt));
            this.squareGroup.add(squareMesh);
            this.microInverterArray.push({
                mesh: squareMesh,
                connectedPanel: this.panels[i],
            });
            i += this.stringLength - 1;
        }
        this.objectsGroup.add(this.squareGroup);

        this.updateStrings();
        this.saveState();
    }

    removePanel(panel) {
        // TODO: handel the removal of electrical component from the panel.
        for (let i = 0; i < this.strings.length; i++) {
            if (this.strings[i].linkedPanels.includes(panel)) {
                this.strings[i].removePanel(panel);
            }
        }
        const index = this.panels.indexOf(panel);
        if (index >= 0) {
            this.panels.splice(index, 1);
        }
        else {
            console.error('Microinverter.js: removed panel in not in microinverter');
        }
        this.saveState();
    }

    setStringRange(stringRange) {
        this.stringRange.min = stringRange.min;
        this.stringRange.max = stringRange.max;
    }

    getInverterMake() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Make;
        }
        return 'NA';
    }

    getInverterManufacturer() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Manufacturer;
        }
        return 'NA';
    }

    enterSelectionPanelMode() {
        this.stage.microInverterSelectionMode.initialize(this);
    }

    update() {
        // this.panel
    }

    /**
     * returns ac size in watts
     */
    getAcSize() {
        if (this.electricalProperties !== undefined) {
            return this.electricalProperties.Size * 1000;
        }
        return 1;
    }

    getDcSize() {
        let totalPanels = this.panels.length;
        let dcSize = 0;

        for (let i = 0; i < totalPanels; i++) {
            let linkedSubarray = null;
            linkedSubarray = this.panels[i].getSubarray();
            dcSize += linkedSubarray.moduleProperties.moduleSize;
        }
        return dcSize * 1000;
    }

    removeObject() {
        if (this.combinerBox) {
            this.combinerBox.removeObject();
        }
        if (this.strings) {
            const stringsCopy = [...this.strings];
            while (stringsCopy.length !== 0) {
                const stringToBeRemoved = stringsCopy.pop();
                stringToBeRemoved.deleteString();
            }
        }
        if (this.panels.length > 0) {
            this.deSelect();
            this.squareGroup.clear();
            for (let i = 0, l = this.panels.length; i < l; i += 1) {
                this.panels[i].electricalComponentConnected = null;
            }
        }

        const microInverters = this.stage.ground.microInverters;
        microInverters.splice(microInverters.indexOf(this), 1);

        if (this.stage.selectionControls.getSelectedObject() === this) {
            this.stage.selectionControls.setSelectedObject(this.stage.ground);
        }

        this.stage.sceneManager.scene.remove(this.objectsGroup);

        this.stage.stateManager.add({
            uuid: this.uuid,
            getStateCb: () => DELETED_STATE,
        });
    }

    onSelect() {
        this.stringGroup.visible = true;
        this.showObject();
        for (let j = 0; j < this.strings.length; j += 1) {
            this.strings[j].displayStringForStringing();
        }
    }

    deSelect() {
        if (!this.stage.viewManager.showStringing) {
            this.hideObject();
            for (let j = 0; j < this.strings.length; j += 1) {
                this.strings[j].hideStringColor();
            }
        }
    }

    showObject() {
        this.squareGroup.visible = true;
        this.stringGroup.visible = true;
    }

    hideObject() {
        this.squareGroup.visible = false;
        this.stringGroup.visible = false;
    }

    deleteStrings(string) {
        this.stage.selectionControls.selectGroundAndDisable();
        this.stage.stateManager.startContainer();
        string.deleteString();
        this.stage.stateManager.stopContainer();
        this.stage.selectionControls.enable();
    }

    editString(string) {
        string.edit();
    }

    addString(string) {
        this.strings.push(string);
    }

    removeString(string) {
        if (this.strings.includes(string)) {
            this.strings.splice(this.strings.indexOf(string), 1);
            return;
        }
    }

    showStrings() {

    }

    // exports

    getMicroinvertersCoordinates() {
        const microInvertersCoordinates = [];
        const microinverters = this.microInverterArray;
        for (let i = 0, l = microinverters.length; i < l; i += 1) {
            const microVertices = [];
            const microinverterPosition = microinverters[i].mesh.position;
            const { count } = microinverters[i].mesh.geometry.attributes.position;
            for (let j = 0, len = count; j < len; j += 1) {
                microVertices.push([
                    microinverters[i].mesh.geometry.attributes.position.getX(j) + microinverterPosition.x,
                    microinverters[i].mesh.geometry.attributes.position.getY(j) + microinverterPosition.y,
                    microinverters[i].mesh.geometry.attributes.position.getZ(j) + microinverterPosition.z,
                ]);
                if (microinverters[i] && microinverters[i].connectedPanel && microinverters[i].connectedPanel.getParent()) {
                    const vec1 = new THREE.Vector3(microVertices[j][0], microVertices[j][1], microVertices[j][2]);
                    const vec2 = rotateVector3AroundX(vec1, microinverterPosition, microinverters[i].connectedPanel.getSubarray().getTilt());
                    const vec3 = rotateVector3AroundZ(vec2, microinverterPosition, 180 - parseFloat(microinverters[i].connectedPanel.getSubarray().getAzimuth()));
                    microVertices[j] = [
                        vec3.x,
                        vec3.y,
                        vec3.z,
                    ];
                }
            }
            const tempVal = microVertices[2];
            microVertices[2] = microVertices[3];
            microVertices[3] = tempVal;
            microInvertersCoordinates.push(microVertices);
        }
        return microInvertersCoordinates;
    }

    static getObjectType() {
        return 'Microinverter';
    }

    getFirstStringLength() {
        if (this.strings.length >= 1) {
            return this.strings[0].linkedPanels.length;
        }
        return 0;
    }

    getStringsLeft() {
        return this.maxStrings - this.strings.length;
    }

    // function to get coordinates of Electrical Strings for CAD export

    getStringsCoordinates() {
        const stringsCoordinates = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            stringsCoordinates.push(this.strings[i].getCoordinates());
        }
        return stringsCoordinates;
    }
}

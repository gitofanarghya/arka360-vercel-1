import { v4 } from 'uuid';

export default class Mppt {
    constructor(inverter, maxStrings) {
        this.stage = inverter.stage;
        this.uuid = v4();
        this.stage.objects[this.uuid] = this;

        this.strings = [];
        this.stringsCopy = [];
        this.inverter = inverter;
        this.maxStrings = maxStrings;
        this.suggestedStringCount = 2;

        this.linkedSubarray = null;

        this.stringRange = {
            minimum: 8,
            maximum: 12,
        };
    }

    enterStringingEditMode() {
        this.stage.stringing.init(this);
    }

    addString(string) {
        if (this.getStringsLeft() > 0) {
            this.strings.push(string);
        }
        else {
            console.error('Mppt: addString max strings reached in the mppt');
        }
        // set the colors of all other strings to unlinkable
    }

    removeString(string) {
        if (this.strings.includes(string)) {
            this.strings.splice(this.strings.indexOf(string), 1);
            return;
        }
        console.error('This String is not in the mppt');
    }

    setCopyStrings() {
        while (this.stringsCopy.length !== 0) {
            this.stringsCopy.pop();
        }
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            this.stringsCopy.push({
                length: this.strings[i].linkedPanels.length,
                edit: this.strings[i].edit.bind(this.strings[i]),
                deleteString: this.strings[i].deleteString.bind(this.strings[i]),
                removeWithContainer: this.strings[i].removeWithContainer.bind(this.strings[i]),
            });
        }
    }

    removePanelFromString(panel) {
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            this.strings[i].removePanel(panel);
        }
    }

    setLinkedSubarray(linkedSubarray) {
        this.linkedSubarray = linkedSubarray;
    }

    getStrings() {
        return this.strings;
    }

    getInverter() {
        return this.inverter;
    }

    getMaxStrings() {
        return this.maxStrings;
    }

    getSuggestedStringCount() {
        return this.suggestedStringCount;
    }

    getStringsLeft() {
        return this.maxStrings - this.strings.length;
    }

    getLinkedSubarray() {
        return this.linkedSubarray;
    }

    getMpptMap() {
        const strings = [];
        for (let i = 0, len = this.strings.length; i < len; i += 1) {
            strings.push(this.strings[i].getStringData());
        }
        return {
            linkedSubarraysIds: [this.linkedSubarray !== null ? this.linkedSubarray.getId() : null],
            stringRange: this.stringRange,
            strings,
            maxStrings: this.maxStrings,
            suggestedStringCount: this.suggestedStringCount,
        };
    }

    getDcSize() {
        const totalPanels = this.getAllLinkedPanels().length;
        if (this.linkedSubarray !== undefined && this.linkedSubarray !== null) {
            return totalPanels * this.linkedSubarray.moduleProperties.moduleSize;
        }
        return 0;
    }

    /**
     * gets all the panels in the mppt
     */
    getAllLinkedPanels() {
        const panels = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            panels.push(...this.strings[i].linkedPanels);
        }
        return panels;
    }

    /**
     * gets all the panels in the mppt except the panels
     * not in the current string.
     * @param {*} string instance of DC string
     */
    getAllLinkedPanelsExcludingString(string) {
        const panels = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            if (this.strings[i] !== string) {
                panels.push(...this.strings[i].linkedPanels);
            }
        }
        return panels;
    }

    setStringRange(stringRange) {
        this.stringRange.minimum = stringRange.min;
        this.stringRange.maximum = stringRange.max;
    }

    setSuggestedStringCount(suggestedStringCount) {
        this.suggestedStringCount = suggestedStringCount;
    }

    removeObject() {
        while (this.strings.length > 0) {
            this.strings[0].removeObject();
        }
    }

    getFirstStringLength() {
        if (this.strings.length >= 1) {
            return this.strings[0].linkedPanels.length;
        }
        return 0;
    }

    getStringsCoordinates() {
        const stringsCoordinates = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            stringsCoordinates.push(this.strings[i].getCoordinates());
        }
        return stringsCoordinates;
    }

    getOptimizersCoordinates() {
        const optimizersCoordinates = [];
        for (let i = 0, l = this.strings.length; i < l; i += 1) {
            optimizersCoordinates.push(...this.strings[i].getOptimizersCoordinates());
        }
        return optimizersCoordinates;
    }

    // redo undo?

}
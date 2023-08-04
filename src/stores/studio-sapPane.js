import { defineStore } from 'pinia'

function getInitialState() {
    return {
        objectName: '',
        summaryEnabled: false,
        actionsEnabled: false,
        propertiesEnabled: false,
        creationMode: false,
        setbackEditEnabled: false,
        inverterDropdownEnabled: false,
    };
}

export const useStudioSapPaneStore = defineStore('studioSapPane', {
    state: () => getInitialState(),
    getters: {
        GET_INVERTER_DROPDOWN_STATUS: (state) => {
            return state.inverterDropdownEnabled;
        }
    },
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        SET_OBJECT_NAME(objectName) {
            this.objectName = objectName;
        },
        SET_CREATION_MODE(creationMode) {
            this.creationMode = creationMode;
        },
        SET_SUMMARY_STATUS(enabled) {
            this.summaryEnabled = enabled;
        },
        SET_ACTIONS_STATUS(enabled) {
            this.actionsEnabled = enabled;
        },
        SET_PROPERTIES_STATUS(enabled) {
            this.propertiesEnabled = enabled;
        },
        SET_SETBACKEDIT_STATUS(enabled) {
            this.setbackEditEnabled = enabled;
        },
        SET_INVERTER_DROPDOWN_STATUS(enabled) {
            this.inverterDropdownEnabled = enabled;
        }
    },
});
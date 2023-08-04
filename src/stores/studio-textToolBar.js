// TODO: REPLACE WITH OPTIONS OF TEXT TOOL BAR
import { defineStore } from 'pinia'

function getInitialState() {
    return {
        toolbarEnabled: false,
        buttonsEnabled: false,
    };
}

// tool enabled
// buttons disabled

export const useStudioTextToolBarStore = defineStore('studioTextToolBar', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        HOME_STATE() {
            this.toolbarEnabled = false;
            this.buttonsEnabled = false;
        },
        ALL_BUTTONS_DISABLED_STATE() {
            this.toolbarEnabled = true;
            this.buttonsEnabled = false;
        },
        TOOLBAR_ENABLED_STATE() {
            this.toolbarEnabled = true;
            this.buttonsEnabled = true;
        },
    },
});
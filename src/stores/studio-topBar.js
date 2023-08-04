import { defineStore } from 'pinia'

function getInitialState() {
    return {
        undo: {
            enabled: false,
            available: false,
        },
        redo: {
            enabled: false,
            available: false,
        },
        completeEnabled: false,
        cancelEnabled: false,
        saveEnabled: false,
        exportEnabled: false,
    };
}

export const useStudioTextTopBarStore = defineStore('studioTextTopBar', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        HOME_STATE() {
            this.undo.enabled = true;
            this.redo.enabled = true;
            this.completeEnabled = false;
            this.cancelEnabled = false;
            this.saveEnabled = true;
            this.exportEnabled = true;
        },
        LOADING_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = false;
            this.cancelEnabled = false;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        VIEW_3D_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = false;
            this.cancelEnabled = false;
            this.saveEnabled = true;
            this.exportEnabled = false;
        },
        VIEW_SLD_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = false;
            this.cancelEnabled = false;
            this.saveEnabled = true;
            this.exportEnabled = true;
        },
        DRAWING_STATE() {
            this.undo.enabled = true;
            this.redo.enabled = true;
            this.completeEnabled = true;
            this.cancelEnabled = true;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        NO_COMPLETE_DRAWING_STATE() {
            this.undo.enabled = true;
            this.redo.enabled = true;
            this.completeEnabled = false;
            this.cancelEnabled = true;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        CANCEL_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = false;
            this.cancelEnabled = true;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        COMPLETE_CANCEL_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = true;
            this.cancelEnabled = true;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        UNDO_REDO_COMPLETE_STATE() {
            this.undo.enabled = true;
            this.redo.enabled = true;
            this.completeEnabled = true;
            this.cancelEnabled = false;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        ONLY_COMPLETE_STATE() {
            this.undo.enabled = false;
            this.redo.enabled = false;
            this.completeEnabled = true;
            this.cancelEnabled = false;
            this.saveEnabled = false;
            this.exportEnabled = false;
        },
        UNDO_AVAILABILITY(available) {
            this.undo.available = available;
        },
        REDO_AVAILABILITY(available) {
            this.redo.available = available;
        },
        SAVE_BUTTON_STATUS(enabled) {
            this.saveEnabled = enabled;
        },
    },
});
import { defineStore } from 'pinia'

function getInitialState() {
    return {
        repeat: {
            visible: false,
        },
    };
}

export const useStudioStatusBarStore = defineStore('studioStatusBar', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        SET_REPEAT_VISIBILITY(visible) {
            this.repeat.visible = visible;
        },
    },
});
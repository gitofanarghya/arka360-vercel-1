import { defineStore } from 'pinia'

function getInitialState() {
    return {
        visible: false,
    };
}

export const useStudioSuggestionBarStore = defineStore('studioSuggestionBar', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        SET_VISIBILITY(visible) {
            this.visible = visible;
        },
    },
});
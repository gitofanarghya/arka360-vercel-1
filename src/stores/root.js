import { defineStore } from 'pinia'
import Vue from 'vue';

export const useRootStore = defineStore('root', {
    state: () => {
        return {
            scene: {},
            designStatus: {},
            projectName: '',
            designName: '',
            isSidebarOpen: false,
            
        }
    },

    getters: {
        savedStage(state) {
            return state.scene;
        },
        sidebarStatus(state) {
            return state.isSidebarOpen;
        }
    },

    actions: {
        updateScene(payload) {
            this.scene = payload;
        },
        updateName(payload) {
            this.projectName = payload.projectName !== undefined ? payload.projectName : this.projectName
            this.designName = payload.designName !== undefined ? payload.designName : this.designName
        },
        updateDesignStatus(payload) {
            if (this.designStatus.hasOwnProperty(payload.id)) {
                this.designStatus[payload.id] = payload.isGenerationEngineRunning;
            }
            else {
                Vue.set(this.designStatus, payload.id, payload.isGenerationEngineRunning);
            }
        },
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        }
    },
});
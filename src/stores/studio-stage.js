import { defineStore } from 'pinia'

function getInitialState() {
    return {
        enabled: false,
        cameraAzimuth: 0,
        dualMapMode: false,
        dualMapEnabled: false,
        resizeEnabled: false,
        mapChangeEnabled: false,
        streetViewEnabled: false,
        streetViewInvalid: false,
        satelliteViewEnabled: false,
    };
}

export const useStudioStageStore = defineStore('studioStage', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        SET_STATUS(enabled) {
            this.enabled = enabled;
        },
        SET_DUAL_MAP_MODE(enabled) {
            this.dualMapMode = enabled;
        },
        SET_CAMERA_AZIMUTH(azimuth) {
            this.cameraAzimuth = azimuth;
        },
        ALL_MAP_BUTTONS_DISABLED_STATE() {
            this.dualMapEnabled = false;
            this.mapChangeEnabled = false;
            this.resizeEnabled = false;
            this.streetViewEnabled = false;
            this.satelliteViewEnabled = false;
        },
        ALL_MAP_BUTTONS_ENABLED_STATE() {
            this.dualMapEnabled = true;
            this.mapChangeEnabled = true;
            this.resizeEnabled = true;
            this.streetViewEnabled = true;
            this.satelliteViewEnabled = true;
        },
    },
});

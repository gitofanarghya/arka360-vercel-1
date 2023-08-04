import { defineStore } from 'pinia'

function getInitialState() {
    return {
        modelEnabled: false,
        panelEnabled: false,
        heatMap: {
            enabled: false,
            visible: false,
        },
        solarAccess: {
            enabled: false,
            visible: false,
        },
        acEnabled: false,
        selection: false,
        dimensionEnabled: false,
        lassoEnabled: false,
        gazeboEnabled: false,
        textEnabled: false,
        viewsEnabled: false,
        layersEnabled: false,
        designSettingsEnabled: false,
    };
}

export const useStudioSideBarStore = defineStore('studioSidebar', {
    state: () => getInitialState(),
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        HOME_STATE() {
            this.modelEnabled = true;
            this.panelEnabled = true;
            this.heatMap.enabled = true;
            this.solarAccess.enabled = true;
            this.acEnabled = true;
            this.selection = true;
            this.dimensionEnabled = true;
            this.lassoEnabled = true;
            this.gazeboEnabled = true;
            this.textEnabled = true;
            this.viewsEnabled = true;
            this.layersEnabled = true;
            this.designSettingsEnabled = true;
        },
        ALL_BUTTONS_DISABLED_STATE() {
            this.modelEnabled = false;
            this.panelEnabled = false;
            this.heatMap.enabled = false;
            this.solarAccess.enabled = false;
            this.acEnabled = false;
            this.selection = false;
            this.dimensionEnabled = false;
            this.lassoEnabled = false;
            this.gazeboEnabled = false;
            this.textEnabled = false;
            this.viewsEnabled = false;
            this.layersEnabled = false;
            this.designSettingsEnabled = false;
        },
        LASSO_ENABLED() {
            this.modelEnabled = false;
            this.panelEnabled = false;
            this.heatMap.enabled = false;
            this.solarAccess.enabled = false;
            this.acEnabled = false;
            this.selection = false;
            this.dimensionEnabled = false;
            this.lassoEnabled = true;
            this.gazeboEnabled = false;
            this.textEnabled = false;
            this.viewsEnabled = false;
            this.layersEnabled = false;
            this.designSettingsEnabled = false;
        },
        VIEW_3D_STATE() {
            this.modelEnabled = false;
            this.panelEnabled = false;
            this.heatMap.enabled = true;
            this.solarAccess.enabled = true;
            this.acEnabled = false;
            this.selection = false;
            this.dimensionEnabled = false;
            this.lassoEnabled = false;
            this.gazeboEnabled = false;
            this.textEnabled = false;
            this.viewsEnabled = true;
            this.layersEnabled = true;
            this.designSettingsEnabled = false;
        },
        DISABLE_VIEW() {
            this.viewsEnabled = false;
        },
        ENABLE_VIEW() {
            this.viewsEnabled = true;
        },
        VIEW_SLD_STATE() {
            this.modelEnabled = false;
            this.panelEnabled = false;
            this.heatMap.enabled = false;
            this.solarAccess.enabled = false;
            this.acEnabled = false;
            this.selection = false;
            this.dimensionEnabled = false;
            this.lassoEnabled = false;
            this.gazeboEnabled = false;
            this.textEnabled = false;
            this.viewsEnabled = true;
            this.layersEnabled = false;
            this.designSettingsEnabled = false;
        },
        HEAT_MAP_VISIBILITY(visible) {
            this.heatMap.visible = visible;
        },
        HEAT_MAP_BUTTON_STATUS(enabled) {
            this.heatMap.enabled = enabled;
        },
        SOLAR_ACCESS_VISIBILITY(visible) {
            this.solarAccess.visible = visible;
        },
    },
});
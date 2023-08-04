import { MATERIAL_STATES, VISUAL_STATES } from '../objects/visualConstants';

export default class VisualManager {
    constructor(stage) {
        this.stage = stage;

        this.in3D = false;
        this.solarAccessEnabled = false;

        this.visualStates = [];
    }

    removeVisualState(visualState) {
        const index = this.visualStates.indexOf(visualState);
        if (index !== -1) {
            this.visualStates.splice(index, 1);
        }
    }

    addVisualState(visualState) {
        this.removeVisualState(visualState);
        this.visualStates.push(visualState);
    }

    containsVisualState(visualState) {
        return this.visualStates.indexOf(visualState) !== -1;
    }

    switchDefaultVisualStatesInSequenceForObject(object) {
        const visualStates = this.getDefaultVisualStates();
        for (let i = 0; i < visualStates.length; i += 1) {
            object.switchVisualState(visualStates[i], false);
        }
    }

    getDefaultVisualStates() {
        if (this.visualStates.length === 0) {
            return [VISUAL_STATES.DEFAULT_STATES.DEFAULT];
        }
        return this.visualStates;
    }

    getMaterialStateBasedOnConditions() {
        if ((this.getShadowEnabled() || this.getIn3D()) &&
            !this.getEditingEnabled()) {
            return MATERIAL_STATES.SOLID;
        }
        return MATERIAL_STATES.TRANSLUCENT;
    }

    updateVisualsFor2D() {
        this.in3D = false;
        this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
    }

    updateVisualsFor3D() {
        this.in3D = true;
        this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
    }

    updateVisualsForSolarAccess(enabled) {
        this.solarAccessEnabled = enabled;
        if (enabled) {
            this.addVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS, true);
            this.stage.mergeManager.switchMaterialState(null, VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS);
        }
        else {
            this.removeVisualState(VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT, true);
            this.stage.mergeManager.switchMaterialState(null, VISUAL_STATES.DEFAULT);
        }
    }

    updateVisualsForHeatMap(enabled) {
        if (enabled && !this.getIn3D()) {
            this.addVisualState(VISUAL_STATES.DEFAULT_STATES.HEATMAP);
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, true);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.HEATMAP, true);
            this.stage.mergeManager.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, VISUAL_STATES.DEFAULT_STATES.HEATMAP);
        }
        else {
            this.removeVisualState(VISUAL_STATES.DEFAULT_STATES.HEATMAP);
            this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT, true);
            this.stage.mergeManager.switchMaterialState(this.getMaterialStateBasedOnConditions(), VISUAL_STATES.DEFAULT);
        }
    }

    updateVisualsForSunSimulation(enabled) {
        if (enabled) {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.SOLID, true);
            this.addVisualState(VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION);
            this.stage.mergeManager.switchMaterialState(MATERIAL_STATES.SOLID, VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION, true);
        }
        else {
            this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
            this.removeVisualState(VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION);
            this.stage.mergeManager.switchMaterialState(this.getMaterialStateBasedOnConditions(), VISUAL_STATES.DEFAULT_STATES.DEFAULT);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
        }
    }

    updateVisualsForEditing(enabled) {
        if (enabled) {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, true);
        }
        else {
            this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
        }
    }

    updateVisualsForAddTableMode(enabled) {
        if (enabled) {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, true);
            this.stage.ground.faces.forEach((face) => {
                if (face.isValidFace()) {
                    face.showSetback();
                }
            });
        }
        else {
            this.stage.ground.switchMaterialState(this.getMaterialStateBasedOnConditions(), true);
            this.stage.ground.faces.forEach((face) => {
                if (face.isValidFace()) {
                    face.hideSetback();
                }
            });
        }
    }

    updateVisualsForCustomImageEdit(enabled) {
        if (enabled) {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.SOLID, true);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, false);
        }
        else {
            this.stage.ground.switchMaterialState(MATERIAL_STATES.TRANSLUCENT, true);
            this.stage.ground.switchVisualState(VISUAL_STATES.DEFAULT_STATES.DEFAULT, true);
        }
    }

    getShadowEnabled() {
        return this.stage.lightsManager.isShadowEnabled();
    }

    getEditingEnabled() {
        return this.stage.drawManager.isEnabled() ||
        this.stage.dragControls.getIsMoved() ||
        this.stage.placeManager.isEnabled();
    }

    getHeatMapEnabled() {
        return this.stage.heatMap.isVisible();
    }

    getSolarAccessEnabled() {
        return this.solarAccessEnabled;
    }

    getIn3D() {
        return this.in3D;
    }
}

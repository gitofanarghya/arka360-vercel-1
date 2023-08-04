<template>
    <div
        id="modelProperties"
        class="height-hundred-percent-model">
        <div class="scroll-area" v-bar>
            <div class="dataProperties">
                <div
                    v-if=" !propertiesData.is3d && propertiesData.isTurret"
                >
                    <el-row class="button-actions-row">
                        <el-col class="button-actions-wrapper">
                            <button
                                id="add_face"
                                class="button-actions"
                                @click="addTurretFace()">
                                Add Faces
                            </button>
                        </el-col>
                        <el-col class="button-actions-wrapper">
                            <button
                                id="remove_face"
                                class="button-actions"
                                @click="removeTurretFace()">
                                Remove Faces
                            </button>
                        </el-col>
                    </el-row>
                </div>
                <div
                    v-if="propertiesData.isTemplate && !propertiesData.isTurret"
                    class="sappane-label"> Snap Height
                    <el-switch
                        v-model="snapHeight"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>
                <div class="sappane-label" id = "core-height"> Base Height
                    <label>
                        <input-length
                            v-model="coreHeight"
                            :name="'Base Height'"
                            :disabled="!editEnabled || snapHeight"
                            :metric-validation="smartRoofHeightValidation"
                            :class-input="'sappane-input-value'"
                        />
                    </label>
                    <br>
                    <div class="chrome">
                        <span >
                            <input id="height_input_model" type="range" min="1" max="15" step="0.1" class="slider"/>
                        </span>
                    </div>
                    <p>
                        <span v-if="coreHeight === null">
                            Base Height Cannot be set to this value
                        </span>
                        <span v-else>
                            {{ errors.first('Base Height') }}
                        </span>
                    </p>
                </div>
                <div
                    v-if="!propertiesData.is3d && !propertiesData.isTurret"
                    class="sappane-label"> Tilt
                    <label>
                        <input
                            v-model.number="tilt"
                            :disabled="!editEnabled"
                            class="sappane-input-value"
                            name="Tilt"
                            metric-validate="tiltValidation"
                            autocomplete="off">
                    </label>
                    <br>
                    <div class="chrome">
                        <span
                        v-if="propertiesData.tilt !== 'custom' && !creationMode">
                            <input id="tilt_input_model" type="range" min="1" max="60" step="0.1" class="slider" />
                        </span>
                    </div>
                    <p>
                        <span>
                            {{ errors.first('Tilt') }}
                        </span>
                    </p>
                </div>

                <div
                    v-if="!propertiesData.is3d"
                    class="sappane-label"> Ignored
                    <el-switch
                        v-model="ignored"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>
            </div>
        </div>
        <properties-buttons-bar
            :creation-mode="creationMode"
            :update-enabled="updateEnabled"
            :cancel-enabled="cancelEnabled"
            :reset-enabled="resetEnabled"
            :update-properties="updateProperties"
            :cancel-properties="resetProperties"
            :reset-properties="resetProperties"/>
    </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import VeeValidate from 'vee-validate';
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import {
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    TILT_LOCKED,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
} from '../../../../core/coreConstants';
import {
    isMetricUnit,
    convertMetricToImperial,
    stringifyImperialMeasurement,
    stringifyMetricMeasurement,
} from '../../../../components/ui/length/utils';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';


VeeValidate.configure({
    useConstraintAttrs: false,
});

export default {
    name: 'SmartroofmodelProperties',
    components: {
        PropertiesButtonsBar,
        VueSlider,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.zeroLengthValidation,
        validationMixins.tiltValidation,
        validationMixins.smartRoofHeightValidation,
        validationMixins.azimuthValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    tilt: 20,
                    minTilt: 1,
                    coreHeight: 0,
                    ignored: false,
                    snapHeight: false,
                    isTemplate: false,
                    isTurret: false,
                    in3d: false,
                    maxTilt: 60,
                    update: () => {},
                    getPossibleAzimuths: () => {},
                    updateHeight: () => {},
                    onHeightChange: () => {},
                    tiltChange: () => {},
                    onTiltChange: () => {},
                };
            },
        },
        updateGettersFlag: {
            type: Number,
            default() {
                return 0;
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            tilt: this.propertiesData.tilt,
            coreHeight: this.propertiesData.coreHeight,
            ignored: this.propertiesData.ignored,
            snapHeight: this.propertiesData.snapHeight,
            isTemplate: this.propertiesData.isTemplate,
            isTurret: this.propertiesData.isTurret,
            in3d: this.propertiesData.in3d,
            maxTilt: this.propertiesData.maxTilt,
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled,
            setbackEditEnabled: state => state.setbackEditEnabled
        }),
        ...mapState(useStudioTextTopBarStore, {
            topBarCompleteEnabled: state => state.completeEnabled,
            topBarCancelEnabled: state => state.cancelEnabled
        }),
        updateEnabled() {
            return (
                !this.creationMode && this.editEnabled && this.valuesChanged && !this.errors.any()
            );
        },
        cancelEnabled() {
            return !this.creationMode && this.editEnabled && this.valuesChanged;
        },
        resetEnabled() {
            return this.creationMode && this.valuesChanged;
        },
    },
    watch: {
        updateGettersFlag() {
            // Used for updating values of getter functions returned in protertiesData
            this.possibleAzimuths = this.propertiesData.getPossibleAzimuths();
        },

        snapHeight: function(val) {
            this.snapHeight = val;
            const heightInput = document.getElementById("core-height")
            if(!val) {
                heightInput.removeAttribute("hidden");
            }
            else if(val) {
                heightInput.setAttribute("hidden", "hidden");
            }
        }

    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                tilt: vm.tilt,
                coreHeight: vm.coreHeight,
                ignored: vm.ignored,
                snapHeight: vm.snapHeight,
                isTemplate: vm.isTemplate,
                isTurret: vm.isTurret,
                is3d: vm.is3d,
                maxTilt: vm.maxTilt,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (this.is3d != this.propertiesData.is3d) {
                        this.updateMode();
                    }
                    if (
                        this.coreHeight !== this.propertiesData.coreHeight ||
                        this.tilt !== this.propertiesData.tilt ||
                        this.ignored !== this.propertiesData.ignored ||
                        this.snapHeight !== this.propertiesData.snapHeight ||
                        this.isTemplate !== this.propertiesData.isTemplate ||
                        this.isTurret !== this.propertiesData.isTurret
                    ) {
                        this.valuesChanged = true;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, true);
                        }
                    }
                    else {
                        this.valuesChanged = false;
                        if (!this.creationMode) {
                            this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
                        }
                    }
                });
            },
        );
        // no shortcuts in creation mode since
        // it will override complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) {
                this.$mousetrap.bind('enter', () => {
                    if (this.updateEnabled) this.updateProperties();
                });
            }
            if (!this.topBarCancelEnabled) {
                this.$mousetrap.bind('esc', () => {
                    if (this.cancelEnabled) this.resetProperties();
                });
            }
        }
        const heightInput = document.querySelector("#height_input_model")

        const tiltInput = document.querySelector("#tilt_input_model")

        if (heightInput != null) {
            const min = heightInput.min
            const max = heightInput.max

            heightInput.value = this.coreHeight;
            heightInput.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(heightInput.value-min)/(max-min)*100}%, #DEE2E6 ${(heightInput.value-min)/(max-min)*100}%, #DEE2E6 100%)`
            heightInput.addEventListener("input", (event) => {
                setTimeout(() => {
                    this.coreHeight = event.target.value;
                    this.propertiesData.updateHeight(event.target.value, false);
                    event.target.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(event.target.value - min)/(max-min)*100}%, #DEE2E6 ${(event.target.value-min)/(max-min)*100}%, #DEE2E6 100%)`
                    // this.heightChanged = true;
                }, 0);
            });
        }
        if(tiltInput != null) {
            tiltInput.setAttribute("max", this.maxTilt);
            const min = tiltInput.min
            const max = tiltInput.max
            tiltInput.value = this.tilt;
            tiltInput.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(tiltInput.value-min)/(max-min)*100}%, #DEE2E6 ${(tiltInput.value-min)/(max-min)*100}%, #DEE2E6 100%)`
            tiltInput.addEventListener("input", (event) => {
                setTimeout(() => {
                    this.tilt = event.target.value;
                    this.propertiesData.tiltChange(event.target.value);
                    event.target.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(event.target.value - min)/(max-min)*100}%, #DEE2E6 ${(event.target.value-min)/(max-min)*100}%, #DEE2E6 100%)`
                    this.tiltChanged = true;
                }, 0);
            });
        }

        const heightInputDiv = document.getElementById("core-height")
            if(!this.snapHeight) {
                heightInputDiv.removeAttribute("hidden");
            }
            else if(this.snapHeight) {
                heightInputDiv.setAttribute("hidden", "hidden");
            }

    },
    beforeDestroy() {
        // no unbinding shortcuts in creation mode since
        // it will unbind complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) this.$mousetrap.unbind('enter');
            if (!this.topBarCancelEnabled) this.$mousetrap.unbind('esc');
        }
    },
    methods: {
        onTiltChange() {
            this.propertiesData.onTiltChange();
        },
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update({
                tilt: this.tilt,
                coreHeight: this.coreHeight,
                ignored: this.ignored,
                snapHeight: this.snapHeight,
                isTemplate: this.isTemplate,
                isTurret: this.isTurret,
            }, !this.errors.any());
            if (this.tiltChanged) {
                this.propertiesData.onTiltChange();
                this.tiltChanged = false;
            }
            // if (this.heightChanged) {
            //     this.propertiesData.onHeightChange();
            //     this.heightChanged = false;
            // }
        },
        addTurretFace() {
            this.propertiesData.addTurretFace();
        },
        removeTurretFace() {
            this.propertiesData.removeTurretFace();
        },
        resetProperties() {
            this.tilt = this.propertiesData.tilt;
            this.coreHeight = this.propertiesData.coreHeight;
            this.ignored = this.propertiesData.ignored;
            this.snapHeight = this.propertiesData.snapHeight;
            this.isTemplate = this.propertiesData.isTemplate;
            this.isTurret = this.propertiesData.isTurret;
            this.updateProperties();
        },
        sliderEnabled(v) {
            if (!isMetricUnit()) {
                const a = convertMetricToImperial(v);
                return  stringifyImperialMeasurement (a[0], a[1]);
            }
            return stringifyMetricMeasurement(v);
        },
        updateMode() {
            this.is3d = this.propertiesData.is3d;
        },
    },
};

</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>

#modelProperties .el-icon-back:before {
    content: "\E606";
}

#modelProperties .el-icon-back {
    color: white;
}

#modelProperties .el-select__caret {
    display: none;
}

#modelProperties .dataProperties  { 
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#modelProperties ::-webkit-scrollbar { 
    display: none;
}

#modelProperties .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#modelProperties:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#modelProperties .icon-lock {
    opacity: 1;
    cursor: not-allowed;
}

#modelProperties .icon-unlock {
    opacity: 0.15;
    cursor: pointer;
}

#modelProperties .icon-lock, #modelProperties .icon-unlock {
    width: 2.5vw;
    border: 0px;
    background-color: transparent;
    border-color: transparent;
    padding: 0;
    font-size: 16px;
    position: sticky;
    left: 60%;
    top: 4px;
}

#modelProperties .edit-disabled {
    opacity: 0.15;
    cursor: not-allowed;
}

#modelProperties .edit-enabled {
    opacity: 1;
    cursor: pointer;
}

#modelProperties .edit-enabled, #modelProperties .edit-disabled {
    width: 2.5vw;
    border: 0px;
    background-color: transparent;
    border-color: transparent;
    padding: 0;
    font-size: 16px;
    position: sticky;
    left: 60%;
    top: 4px;
}

#modelProperties .tiltCustomError {
    margin: 0;
    padding: 0;
    text-align: left;
    color: white;
    font-family: "Helvetica neue", "Times", serif;
    font-size: 0.9vw;
    font-weight: 500;
}
.height-hundred-percent-model {
    height: 78%;
}

.sappane-label {
    margin-top: 23px;
    padding-left: 4%;
    padding-right: 1%;
}

#height_input_model {
  margin-top: 3px;
  border-radius: 8px;
  height: 5px;
  width: 100%;
  outline: none;
  -webkit-appearance: none;
}

#tilt_input_model {
  margin-top: 3px;
  border-radius: 8px;
  height: 5px;
  width: 100%;
  outline: none;
  -webkit-appearance: none;
}

input[type=range]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #2497E3;
  height: 18px;
  width: 18px;
  border-radius: 22px;
  background: #03a9f4;
  cursor: pointer;
  -webkit-appearance: none;
  /* margin-top: -7px; */
}

</style>

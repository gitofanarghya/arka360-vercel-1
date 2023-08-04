<template>
    <div
        id="modelProperties"
        class="height-hundred-percent-model">
        <div class="scroll-area" v-bar>
            <div class="dataProperties">
                <div v-if="!propertiesData.isDeleted">
                    <div class="sappane-label top-label sliderGaps" v-if="!propertiesData.isParentDormer || propertiesData.isParentFlatDormer"> Tilt
                        <label>
                            <input
                                v-validate="smartRoofTiltValidation"
                                v-model.number="tilt"
                                :disabled="!editEnabled ||
                                lockedParameter === lockConstants.TILT_LOCKED ||
                                propertiesData.isParentTurretDormer"
                                class="sappane-input-value"
                                name="Tilt"
                                autocomplete="off">
                        </label>
                        <br>
                        <div class="chrome">
                            <span v-if="!propertiesData.isParentTurretDormer">
                                <input id="tilt_input" type="range" min="1" max="60" step="0.1" />
                            </span>
                        </div>
                        <p>
                            <span v-if="tilt === null">
                                Tilt cannot be calculated for the given base height and
                                top height at this position
                            </span>
                            <span v-else>
                                {{ errors.first('Tilt') }}
                            </span>
                        </p>
                    </div>
                        <div class="sappane-label sliderGaps" v-if="!propertiesData.isDrawFace"> Height
                        <label>
                            <input-length
                                v-model="height"
                                :name="'Height'"
                                :disabled="!editEnabled || propertiesData.isParentTurretDormer"
                                :metric-validation="lengthValidation"
                                :class-input="'sappane-input-value'"
                            />
                        </label>
                        <br>
                        <div class="chrome">
                            <span v-if="!propertiesData.isParentTurretDormer">
                                <input id="height_input" type="range" min="1" max="15" step="0.1" />
                            </span>
                        </div>
                        <p>
                            <span v-if="height === null">
                                Height Cannot be set to this value
                            </span>
                            <span v-else>
                                {{ errors.first('Height') }}
                            </span>
                        </p>
                    </div>
                    <div class="sappane-label"> Setback Inside
                        <label>
                            <button
                            class="edit-button" 
                            :class="[creationMode || !editEnabled ?
                            'edit-disabled' : 'edit-enabled']"
                            @click="onSetbackEdit(setbackEditConstants.EDIT_SETBACK_INSIDE)"
                            >Edit</button>
                            <input-length
                                v-model="setbackInside"
                                :set-back-val="true"
                                :name="'Setback Inside'"
                                :disabled="!editEnabled"
                                :metric-validation="lengthValidation"
                                :class-input="'sappane-input-value'"
                                class="setback-input"
                            />
                        </label>
                    </div>
                    <div
                        v-if="!editEnabled"
                        class="automate-div">
                        <button
                            class="automate-button"
                            @click="automateSetBacks(setbackEditConstants.EDIT_SETBACK_INSIDE)"
                        >Automate SetBacks</button>
                    </div>
                    <p><span class="errorSpan">{{ errors.first('Setback Inside') }}</span></p>
                    <div class="sappane-label margintop"> Rafter
                        <el-switch
                            v-model="rafterEnabled"
                            :disabled="!editEnabled"
                            class="sappane-switch"
                        />
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label">Rafter Orientation
                        <el-select
                            v-model="rafterOrientation"
                            :disabled="!editEnabled"
                            style="width: 55%; float: right;"
                            class="sappane-select"
                            placeholder="Perpendicular"
                            popper-class="darkDropdown">
                            <el-option
                                :value=" rafterConstants.RAFTER_ORIENTATION_PERPENDICULAR"
                                label="Perpendicular"/>
                            <el-option
                                :value=" rafterConstants.RAFTER_ORIENTATION_PARALLEL"
                                label="Parallel"/>
                        </el-select>
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label">
                        Rafter Spacing
                        <span>
                            <label>
                                <input-length
                                    v-model="rafterSpacing"
                                    :name="'rafterSpacing'"
                                    :disabled="!editEnabled"
                                    :metric-validation="lengthValidation"
                                    :class-input="'sappane-input-value'"
                                />
                            </label>
                        </span>
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label">
                        Attachment Type
                        <span>
                            <el-select
                                v-model="attachmentType"
                                :disabled="!editEnabled"
                                style="width: 50%; float: right;"
                                class="sappane-select"
                                placeholder="Parallel"
                                popper-class="darkDropdown">
                                <el-option
                                    :value=" attachmentConstants.ATTACHMENT_ORIENTATION_PARALLEL"
                                    label="Parallel"/>
                                <el-option
                                    :value=" attachmentConstants.ATTACHMENT_ORIENTATION_STAGGERED"
                                    label="Staggered"/>
                            </el-select>
                        </span>
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label">
                        Attachment Spacing
                        <span>
                            <el-select
                                v-model="tempAttachmentValue"
                                :default-first-option="true"
                                :disabled="!editEnabled"
                                style="width: 50%; float: right;"
                                class="sappane-select"
                                popper-class="darkDropdown">
                                <el-option
                                    v-for="item in 5"
                                    :key="item"
                                    :label="getAttachmentValueFromMuliplier(rafterSpacing, item)"
                                    :value="getAttachmentValueFromMuliplier(rafterSpacing, item)"
                                />
                            </el-select>
                        </span>
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label"> Attachment Alignment
                        <img
                            :class="[creationMode || !editEnabled ?
                            'edit-disabled' : 'edit-enabled']"
                            src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                            @click="onAttachmentEdit(attachmentConstants.ATTACHMENT_ALIGNMENT)"
                        >
                    </div>
                    <div
                        v-if="rafterEnabled"
                        class="sappane-label margintop"> Rafter Alignment
                        <img
                            :class="[creationMode || !editEnabled ?
                            'edit-disabled' : 'edit-enabled']"
                            src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                            @click="onRafterEdit(rafterConstants.RAFTER_ALIGNMENT)"
                        >
                    </div>
                    <div class="sappane-label margintop"> Irradiance Map
                        <el-switch
                            v-model="placable"
                            :disabled="!editEnabled"
                            class="sappane-switch"
                        />
                    </div>
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
// import 'vue-slider-component/theme/antd.css';
import VeeValidate from 'vee-validate';
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import {
    TILT_LOCKED,
    EDIT_SETBACK_INSIDE,
    RAFTER_ORIENTATION_PERPENDICULAR,
    RAFTER_ORIENTATION_PARALLEL,
    RAFTER_ALIGNMENT,
    ATTACHMENT_ALIGNMENT,
    ATTACHMENT_ORIENTATION_STAGGERED,
    ATTACHMENT_ORIENTATION_PARALLEL,
} from '../../../../core/coreConstants';
import {
    isMetricUnit,
    convertMetricToImperial,
    stringifyImperialMeasurement,
    stringifyMetricMeasurement,
    convertImperialToMetric,
    parseImperialMeasurement,
} from '../../../../components/ui/length/utils';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

VeeValidate.configure({
    useConstraintAttrs: false,
});

export default {
    name: 'SmartrooffaceProperties',
    components: {
        PropertiesButtonsBar,
        VueSlider,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.zeroLengthValidation,
        validationMixins.smartRoofTiltValidation,
        validationMixins.azimuthValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    isParentDormer: false,
                    isParentFlatDormer: false,
                    isParentTurretDormer: false,
                    isDrawFace: false,
                    tilt: 0,
                    minTilt: 0,
                    height: 5,
                    setbackInside: 0,
                    rafterEnabled: 0,
                    rafterOrientation: '',
                    rafterSpacing: 0,
                    attachmentType: '',
                    attachmentSpacingMultiplier: 1,
                    placable: true,
                    setbackEditMode: () => {},
                    automateSetBacks: () => {},
                    rafterEditMode: () => {},
                    attachmentEditMode: () => {},
                    update: () => {},
                    tiltChange: () => {},
                    heightChange: () => {},
                    onTiltChange: () => {},
                    onHeightChange: () => {},
                };
            },
        },
        updateGettersFlag: {
            type: Number,
            default() {
                return 0;
            },
        },
        updateLockedParameterFlag: {
            type: Number,
            default() {
                return 0;
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            lockedParameter: this.propertiesData.lockedParameter,
            tilt: this.propertiesData.tilt,
            height: this.propertiesData.height,
            rafterEnabled: this.propertiesData.rafterEnabled,
            rafterOrientation: this.propertiesData.rafterOrientation,
            rafterSpacing: this.propertiesData.rafterSpacing,
            placable: this.propertiesData.placable,
            setbackInside: this.propertiesData.setbackInside,
            attachmentType: this.propertiesData.attachmentType,
            attachmentSpacingMultiplier: this.propertiesData.attachmentSpacingMultiplier,
            rafterConstants: {
                RAFTER_ORIENTATION_PERPENDICULAR,
                RAFTER_ORIENTATION_PARALLEL,
                RAFTER_ALIGNMENT,
            },
            attachmentConstants: {
                ATTACHMENT_ORIENTATION_STAGGERED,
                ATTACHMENT_ORIENTATION_PARALLEL,
                ATTACHMENT_ALIGNMENT,
            },
            lockConstants: {
                TILT_LOCKED,
            },
            setbackEditConstants: {
                EDIT_SETBACK_INSIDE,
            },
            tempAttachmentValue: this.getAttachmentValueFromMuliplier(this.propertiesData.rafterSpacing, this.propertiesData.attachmentSpacingMultiplier),
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled,
            setbackEditEnabled: state => state.setbackEditEnabled,
        }),
        ...mapState(useStudioTextTopBarStore, { 
            topBarCompleteEnabled: state => state.completeEnabled,
            topBarCancelEnabled: state => state.cancelEnabled,
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
        updateLockedParameterFlag() {
            this.updateCurrentlyLockedParameter();
        },
        tempAttachmentValue: {
            deep: true,
            handler(newVal) {
                this.attachmentSpacingMultiplier = this.getMultiplierFromValue(newVal);
            },
        },
        rafterSpacing: {
            deep: true,
            handler(newVal) {
                this.tempAttachmentValue = this.getAttachmentValueFromMuliplier(newVal, 1);
            },
        },



    },

    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                tilt: vm.tilt,
                height: vm.height,
                rafterEnabled: vm.rafterEnabled,
                rafterOrientation: vm.rafterOrientation,
                rafterSpacing: vm.rafterSpacing,
                attachmentType: vm.attachmentType,
                tempAttachmentValue: vm.tempAttachmentValue,
                placable: vm.placable,
                lockedParameter: vm.lockedParameter,
                setbackInside: vm.setbackInside,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    const multiplier = this.getMultiplierFromValue(this.tempAttachmentValue);
                    const attachmentSpacingChangeCheck =
                        (multiplier !== this.propertiesData.attachmentSpacingMultiplier &&
                            this.rafterSpacing === this.propertiesData.rafterSpacing);
                    if (
                        this.lockedParameter !== this.propertiesData.lockedParameter ||
                        this.tilt !== this.propertiesData.tilt ||
                        this.height !== this.propertiesData.height ||
                        this.rafterEnabled !== this.propertiesData.rafterEnabled ||
                        this.rafterOrientation !== this.propertiesData.rafterOrientation ||
                        this.rafterSpacing !== this.propertiesData.rafterSpacing ||
                        this.attachmentType !== this.propertiesData.attachmentType ||
                        this.setbackInside !== this.propertiesData.setbackInside ||
                        this.placable !== this.propertiesData.placable ||
                        attachmentSpacingChangeCheck
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
                    if (this.tilt !== this.propertiesData.tilt
                    ) {
                        if (this.isCreation ||
                            Number.isNaN(Number(this.tilt))) {
                            return;
                        }
                        const params = {
                            tilt: this.tilt,
                            lockedParameter: this.lockedParameter,
                        };

                        // const response = this.computeTiltAndHeights(params);
                        // this.updateCurrentlyLockedParameter(response);
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
        const heightInput = document.querySelector("#height_input")
        const tiltInput = document.querySelector("#tilt_input")

        if(heightInput == null && tiltInput == null) return;
        
        if (heightInput) heightInput.value = this.height;
        if (tiltInput) tiltInput.value = this.tilt;
        
        if (heightInput != null) {
            const min = heightInput.min
            const max = heightInput.max

            heightInput.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(heightInput.value-min)/(max-min)*100}%, #DEE2E6 ${(heightInput.value-min)/(max-min)*100}%, #DEE2E6 100%)`

            heightInput.addEventListener("input", (event) => {
                setTimeout(() => {
                    this.height = event.target.value;
                    this.propertiesData.heightChange(event.target.value);
                    event.target.style.background = `linear-gradient(to right, #03a9f4 0%, #03a9f4 ${(event.target.value - min)/(max-min)*100}%, #DEE2E6 ${(event.target.value-min)/(max-min)*100}%, #DEE2E6 100%)`
                    this.heightChanged = true;
                }, 0);
            });
        }
        if (tiltInput != null) {
            const min = tiltInput.min
            const max = tiltInput.max
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

        onHeightChange() {
            this.propertiesData.onHeightChange();
        },

        updateCurrentlyLockedParameter(tiltAndHeights = null) {
            switch (this.lockedParameter) {
            case TILT_LOCKED:
                this.tilt = (tiltAndHeights === null) ?
                    this.propertiesData.getCurrentlyLockedParameter() : tiltAndHeights.tilt;
                break;
            default:
                console.error(`ERROR: modelProperties: updateCurrentlyLockedParameter failed -
                    Invalid locked parameter`);
            }
        },
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update({
                tilt: this.tilt,
                height: this.height,
                rafterEnabled: this.rafterEnabled,
                rafterOrientation: this.rafterOrientation,
                rafterSpacing: this.rafterSpacing,
                lockedParameter: this.lockedParameter,
                attachmentSpacingMultiplier: this.attachmentSpacingMultiplier,
                attachmentType: this.attachmentType,
                setbackInside: this.setbackInside,
                placable: this.placable,
            }, !this.errors.any());

            if (this.tiltChanged) {
                this.propertiesData.onTiltChange();
                this.tiltChanged = false;
            }
            if (this.heightChanged) {
                this.propertiesData.onHeightChange();
                this.heightChanged = false;
            }
        },
        resetProperties() {
            this.lockedParameter = this.propertiesData.lockedParameter;
            this.tilt = this.propertiesData.tilt;
            this.height = this.propertiesData.height;
            this.rafterEnabled = this.propertiesData.rafterEnabled;
            this.rafterOrientation = this.propertiesData.rafterOrientation;
            this.rafterSpacing = this.propertiesData.rafterSpacing;
            this.setbackInside = this.propertiesData.setbackInside;
            this.placable = this.propertiesData.placable;
            this.attachmentType = this.propertiesData.attachmentType;
            this.tempAttachmentValue = this.getAttachmentValueFromMuliplier(this.rafterSpacing, this.propertiesData.attachmentSpacingMultiplier);
            this.updateProperties();
        },
        lockParameter(parameterName) {
            if (this.lockedParameter !== parameterName && this.editEnabled) {
                if (this.isCreation) {
                    switch (this.lockedParameter) {
                    case TILT_LOCKED:
                        if (this.tilt < 0 || this.tilt >= 90 || this.tilt === null) {
                            this.tilt = '';
                        }
                        break;
                    default:
                        console.error(`ERROR: ModelProperties: lockParameter failed -
                                Incorrect locked parameter name`);
                    }
                }
                this.lockedParameter = parameterName;
            }
        },
        automateSetBacks() {
            this.propertiesData.automateSetBacks();
        },
        onSetbackEdit(setbackType) {
            if (this.editEnabled && !this.creationMode) {
                this.propertiesData.setbackEditMode(setbackType);
            }
        },
        onRafterEdit(rafterAlignmentEdit) {
            if (this.editEnabled && !this.creationMode) {
                this.propertiesData.rafterEditMode(rafterAlignmentEdit);
            }
        },
        onAttachmentEdit(attachmentEdit) {
            if (this.editEnabled && !this.creationMode) {
                this.propertiesData.attachmentEditMode(attachmentEdit);
            }
        },
        sliderEnabled(v) {
            if (!isMetricUnit()) {
                const a = convertMetricToImperial(v);
                return  stringifyImperialMeasurement (a[0], a[1]);
            }
            return stringifyMetricMeasurement(v);
        },
        getAttachmentValueFromMuliplier(rafterSpacing, factor) {
            const value = this.sliderEnabled(rafterSpacing * factor);
            return value;
        },
        getMultiplierFromValue(value) {
            let intValue;
            if (!isMetricUnit()) {
                const buff = parseImperialMeasurement(value);
                intValue = convertImperialToMetric([buff[0], buff[1]]);
            }
            else {
                intValue = parseFloat(value);
            }
            const multiplier = Math.round(intValue / this.rafterSpacing);
            return multiplier;
        },
    },
};

</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>

.top-label {
    margin-top: 15px;
}

.flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flex .item-1 {
    width: 50%;
}

.flex .item-2 {
    width: 20%;
    height: 1.5vw;
}
.automate-div {
    display: flex;
    align-items: center;
    justify-items: center;
}
.automate-button {
    display: inline-block !important;
    height: 1.5vw !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    cursor: pointer !important;
    -webkit-appearance: none !important;
    text-align: center !important;
    -webkit-box-sizing: border-box !important;
    box-sizing: border-box !important;
    outline: none !important;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500 !important;
    border-radius: 4px !important;
    margin-left: 50px !important;
    background-color: inherit !important;
    font-size: 0.73vw !important;
    border: 1px solid white !important;
    color: white !important;
}
.edit-button {
    display: inline-block !important;
    height: 1.5vw !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    cursor: pointer !important;
    -webkit-appearance: none !important;
    text-align: center !important;
    -webkit-box-sizing: border-box !important;
    box-sizing: border-box !important;
    outline: none !important;
    -webkit-transition: .1s;
    transition: .1s;
    font-weight: 500 !important;
    border-radius: 4px !important;
    width: 3vw !important;
    left: 55% !important;
    background-color: inherit !important;
    font-size: 0.73vw !important;
    border: 1px solid white !important;
    color: white !important;
}

.errorSpan {
    color: red;
    font-size: 1.9vh;
}

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
.sliderGaps {
    margin-top: 23px;
    padding-left: 4%;
    padding-right: 1%;
}
#height_input {
  margin-top: 3px;
  border-radius: 8px;
  height: 5px;
  width: 100%;
  outline: none;
  -webkit-appearance: none;
}

#tilt_input {
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

.margintop {
    margin-top: 4px;
}
</style>

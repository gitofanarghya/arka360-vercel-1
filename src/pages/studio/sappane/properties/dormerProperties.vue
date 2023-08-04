<template>
    <div
        id="modelProperties"
        class="height-hundred-percent-model">
        <div class="scroll-area" v-bar>
            <div class="dataProperties">
                <div class="sappane-label top-label"> Tilt
                    <label>
                        <input
                            v-validate="flatDormertiltValidation"
                            v-model="tilt"
                            :disabled="!editEnabled ||
                            lockedParameter === lockConstants.TILT_LOCKED"
                            class="sappane-input-value"
                            name="Tilt"
                            autocomplete="off">
                    </label>
                    <span @mouseup="updateProperties();">
                        <vue-slider
                            v-model="tilt"
                            :min-range = "1"
                            :interval = "0.1"
                            :min = "flatDormertiltValidation.between.min"
                            :max = "flatDormertiltValidation.between.max"
                        />
                    </span>
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
                
                <div class="sappane-label flex"> 
                    <p class="item-1">Height</p>

                    <div class="item-3">
                        <input-length
                        v-model="Height"
                        :set-back-val="true"
                        :name="'Height'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                        :className="'setBackStyle'"
                    />
                    </div>
                </div>
                <div class="sappane-label flex"> 
                    <p class="item-1">Setback Outside</p>
                    <div class="item-2">
                        <button 
                        class="edit-button"
                        :class="[creationMode || !editEnabled ?
                        'edit-disabled' : 'edit-enabled']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                        @click="onSetbackEdit(setbackEditConstants.EDIT_SETBACK_OUTSIDE)"
                        >
                            Edit
                        </button>
                    </div>
                    <!-- <img
                        :class="[creationMode || !editEnabled ?
                        'edit-disabled' : 'edit-enabled']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                        @click="onSetbackEdit(setbackEditConstants.EDIT_SETBACK_OUTSIDE)"
                    > -->
                    <div class="item-3">
                        <input-length
                        v-model="setbackOutside"
                        :set-back-val="true"
                        :name="'Setback Outside'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                        :className="'setBackStyle'"
                    />
                    </div>
                    <!-- <input-length
                        v-model="setbackOutside"
                        :set-back-val="true"
                        :name="'Setback Outside'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    /> -->
                    <!-- <p><span>{{ errors.first('Setback Outside') }}</span></p> -->
                </div>
                <p><span class="errorSpan">{{ errors.first('Setback Outside') }}</span></p>
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
    TILT_LOCKED,
    EDIT_SETBACK_OUTSIDE,
} from '../../../../core/coreConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

VeeValidate.configure({
    useConstraintAttrs: false,
});

export default {
    name: 'DormerProperties',
    components: {
        PropertiesButtonsBar,
        VueSlider
    },
    mixins: [
        validationMixins.lengthValidation,
        // flatDormertiltValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    tilt: 0,
                    minTilt: 0,
                    maxTilt: 0,
                    setbackOutside: 0,
                    Height: 0,
                    setbackEditMode: () => {},
                    update: () => {},
                    updateHeightDormer: () => {},
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
            flatDormertiltValidation : {
                required: true,
                between: {
                    min: this.propertiesData.minTilt,
                    max: this.propertiesData.maxTilt,
                },
                decimal: 2,
            },
            valuesChanged: false,
            lockedParameter: this.propertiesData.lockedParameter,
            tilt: this.propertiesData.tilt,
            setbackOutside: this.propertiesData.setbackOutside,
            Height: this.propertiesData.Height,
            lockConstants: {
                TILT_LOCKED,
            },
            setbackEditConstants: {
                EDIT_SETBACK_OUTSIDE,
            },
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
        updateLockedParameterFlag() {
            this.updateCurrentlyLockedParameter();
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                tilt: vm.tilt,
                lockedParameter: vm.lockedParameter,
                setbackOutside: vm.setbackOutside,
                Height: vm.Height,
                }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.lockedParameter !== this.propertiesData.lockedParameter ||
                        this.tilt !== this.propertiesData.tilt ||
                        this.setbackOutside !== this.propertiesData.setbackOutside ||
                        this.Height !== this.propertiesData.Height 
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
                    if (this.updateEnabled) {this.updateProperties();
                    this.updateHeight();}
                });
            }
            if (!this.topBarCancelEnabled) {
                this.$mousetrap.bind('esc', () => {
                    if (this.cancelEnabled) this.resetProperties();
                });
            }
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
        updateHeight() {
            this.propertiesData.updateHeightDormer();
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
            // this.updateHeight();
            this.propertiesData.update({
                tilt: this.tilt,
                lockedParameter: this.lockedParameter,
                setbackOutside: this.setbackOutside,
                Height: this.Height,
                }, !this.errors.any());
        },
        resetProperties() {
            this.lockedParameter = this.propertiesData.lockedParameter;
            this.tilt = this.propertiesData.tilt;
            this.setbackOutside = this.propertiesData.setbackOutside;
            this.Height = this.propertiesData.Height;
            },
        lockParameter(parameterName) {
            if (this.lockedParameter !== parameterName && this.editEnabled) {
                if (this.isCreation) {
                    switch (this.lockedParameter) {
                    case TILT_LOCKED:
                        if (this.tilt >= 90 || this.tilt === null) {
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
        onSetbackEdit(setbackType) {
            if (this.editEnabled && !this.creationMode) {
                this.propertiesData.setbackEditMode(setbackType);
            }
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
    width: 40%;
}

.flex .item-2 {
    width: 20%;
    height: 1.5vw;
}

.flex .item-3 {
    width: 40%;
    height: 1.5vw;
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
    margin-left: 50px !important;
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

</style>

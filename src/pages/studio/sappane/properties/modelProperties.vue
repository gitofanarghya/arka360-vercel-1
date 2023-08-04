<template>
    <div
        id="modelProperties"
        class="height-hundred-percent-model">
        <div class="scroll-area" v-bar>
            <div class="dataProperties">
                <div v-if="propertiesData.isObstruction" class="sappane-label"> Flush Type
                    <el-switch
                        v-model="flushType"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>
                <div v-if="propertiesData.isObstruction ? !flushType : true">
                    <div class="sappane-label"> Base Height
                        <img
                            :class="[lockedParameter === lockConstants.CORE_HEIGHT_LOCKED ?
                            'icon-lock' : 'icon-unlock']"
                            src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-white.png"
                            @click="lockParameter(lockConstants.CORE_HEIGHT_LOCKED)"
                        >
                        <input-length
                            v-model="coreHeight"
                            :name="'Base Height'"
                            :disabled="!editEnabled || lockedParameter === lockConstants.CORE_HEIGHT_LOCKED"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p><span>{{ errors.first('Base Height') }}</span></p>
                    </div>

                    <div class="sappane-label"> Top Height
                    <img
                        :class="[lockedParameter === lockConstants.TOP_HEIGHT_LOCKED ?
                        'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-white.png"
                        @click="lockParameter(lockConstants.TOP_HEIGHT_LOCKED)"
                    >
                    <input-length
                        v-model="topHeight"
                        :name="'Top Height'"
                        :disabled="!editEnabled || lockedParameter === lockConstants.TOP_HEIGHT_LOCKED"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p><span>{{ errors.first('Top Height') }}</span></p>
                    </div>

                    <div class="sappane-label"> Tilt
                        <img
                            :class="[lockedParameter === lockConstants.TILT_LOCKED ?
                            'icon-lock' : 'icon-unlock']"
                            src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-white.png"
                            @click="lockParameter(lockConstants.TILT_LOCKED)"
                        >
                        <label>
                            <input
                                v-validate="tiltValidation"
                                v-model.number="tilt"
                                :disabled="!editEnabled ||
                                lockedParameter === lockConstants.TILT_LOCKED"
                                class="sappane-input-value"
                                name="Tilt"
                                autocomplete="off">
                        </label>
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
                    <div class="sappane-label"> Azimuth
                        <el-select
                            v-validate="azimuthValidation"
                            v-model.number="azimuth"
                            :disabled="!editEnabled"
                            class="sappane-select"
                            filterable=""
                            allow-create=""
                            popper-class="darkDropdown"
                            placeholder=""
                            name="Azimuth"
                            style="width: 25%;">
                            <el-option
                                v-for="azimuth_ in possibleAzimuths"
                                :key="azimuth_"
                                :label="azimuth_"
                                :value="azimuth_">
                                <div class="possibleAzimuthDropdown"> <span>{{ azimuth_ }} </span>
                                    <i
                                        :style="{
                                            'transform' : 'rotate(' + (Number(azimuth_) + 90) + 'deg)'
                                        }"
                                        class="el-icon-back"/>
                                </div>
                            </el-option>
                        </el-select>
                        <p><span>{{ errors.first('Azimuth') }}</span></p>
                    </div>
                </div>
                <div v-else>
                    <div class="sappane-label"> Height
                        <input-length
                            v-model="coreHeight"
                            :name="'Base Height'"
                            :disabled="!editEnabled || lockedParameter === lockConstants.CORE_HEIGHT_LOCKED"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p><span>{{ errors.first('Base Height') }}</span></p>
                    </div>
                </div>

                <div style="height:15%" />

                <div v-if="!propertiesData.isObstruction">
                    <div class="sappane-label"> Parapet Height
                        <input-length
                            v-model="parapetHeight"
                            :name="'Parapet Height'"
                            :disabled="!editEnabled"
                            :metric-validation="zeroLengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p><span>{{ errors.first('Parapet Height') }}</span></p>
                    </div>

                    <div class="sappane-label"> Parapet Thickness
                        <input-length
                            v-model="parapetThickness"
                            :name="'Parapet Thickness'"
                            :disabled="!editEnabled"
                            :metric-validation="parapetThicknessValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p><span>{{ errors.first('Parapet Thickness') }}</span></p>
                    </div>
                    <div class="sappane-label"> Setback Inside
                        <img
                            v-show="!creationMode && setbackEditEnabled"
                            :class="[creationMode || !editEnabled ?
                            'edit-disabled' : 'edit-enabled']"
                            src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                            @click="onSetbackEdit(setbackEditConstants.EDIT_SETBACK_INSIDE)"
                        >
                        <input-length
                            v-model="setbackInside"
                            :set-back-val="true"
                            :name="'Setback Inside'"
                            :disabled="!editEnabled"
                            :metric-validation="lengthValidation"
                            :class-input="'sappane-input-value'"
                        />
                        <p><span>{{ errors.first('Setback Inside') }}</span></p>
                    </div>
                </div>
                <div class="sappane-label"> Setback Outside
                    <img
                        v-show="!creationMode && setbackEditEnabled"
                        :class="[creationMode || !editEnabled ?
                        'edit-disabled' : 'edit-enabled']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/edit.png"
                        @click="onSetbackEdit(setbackEditConstants.EDIT_SETBACK_OUTSIDE)"
                    >
                    <input-length
                        v-model="setbackOutside"
                        :set-back-val="true"
                        :name="'Setback Outside'"
                        :disabled="!editEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p><span>{{ errors.first('Setback Outside') }}</span></p>
                </div>

                <div class="sappane-label"> Irradiance Map
                    <el-switch
                        v-model="placable"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>

                <div class="sappane-label"> Ignored
                    <el-switch
                        v-model="ignored"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>

                <div v-if="propertiesData.isObstruction && !propertiesData.isCylinder" class="sappane-label"> Allow Rotation
                    <el-switch
                        v-model="rotationAllowed"
                        :disabled="!editEnabled"
                        class="sappane-switch"/>
                </div>
               
                <div v-if="propertiesData.isObstruction" class="sappane-label">Obstruction Type
                    <el-select
                        v-model="obstruction"
                        class="sappane-select"
                        style="width :40%"
                        placeholder="Select"
                        popper-class="darkDropdown">
                        <el-option
                            value="None"
                            label="None"/>
                        <el-option
                            value="Chimney"
                            label="Chimney"/>
                        <el-option
                            value="Skylight"
                            label="Skylight"/>
                        <el-option
                            value="AC Unit"
                            label="AC Unit"/>
                    </el-select>
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
import VeeValidate from 'vee-validate';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import { mapState } from 'pinia';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import {
    TOP_HEIGHT_LOCKED,
    CORE_HEIGHT_LOCKED,
    TILT_LOCKED,
    EDIT_SETBACK_INSIDE,
    EDIT_SETBACK_OUTSIDE,
    OBSTRUCTION_TYPES,
} from '../../../../core/coreConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

VeeValidate.configure({
    useConstraintAttrs: false,
});

export default {
    name: 'ModelProperties',
    components: {
        PropertiesButtonsBar,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.zeroLengthValidation,
        validationMixins.tiltValidation,
        validationMixins.azimuthValidation,
        validationMixins.parapetThicknessValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    coreHeight: 0,
                    parapetHeight: 0,
                    parapetThickness: 0,
                    tilt: 0,
                    azimuth: 0,
                    setbackInside: 0,
                    setbackEditMode: () => {},
                    setbackOutside: 0,
                    ignored: false,
                    placable: true,
                    rotationAllowed: true,
                    flushType: false,
                    heatMapThreshold: 100,
                    obstruction: OBSTRUCTION_TYPES,
                    update: () => {},
                    getPossibleAzimuths: () => {},
                    isObstruction: false,
                    isCylinder: false,
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
            coreHeight: this.propertiesData.coreHeight,
            topHeight: this.propertiesData.topHeight,
            lockedParameter: this.propertiesData.lockedParameter,
            parapetHeight: this.propertiesData.parapetHeight,
            parapetThickness: this.propertiesData.parapetThickness,
            tilt: this.propertiesData.tilt,
            azimuth: this.propertiesData.azimuth,
            possibleAzimuths: this.propertiesData.getPossibleAzimuths(),
            setbackInside: this.propertiesData.setbackInside,
            setbackOutside: this.propertiesData.setbackOutside,
            ignored: this.propertiesData.ignored,
            placable: this.propertiesData.placable,
            rotationAllowed: this.propertiesData.rotationAllowed,
            flushType: this.propertiesData.flushType,
            heatMapThreshold: this.propertiesData.heatMapThreshold,
            obstruction: this.propertiesData.obstruction || 'None',
            lockConstants: {
                CORE_HEIGHT_LOCKED,
                TOP_HEIGHT_LOCKED,
                TILT_LOCKED,
            },
            setbackEditConstants: {
                EDIT_SETBACK_INSIDE,
                EDIT_SETBACK_OUTSIDE,
            },
            computeTiltAndHeights: this.propertiesData.computeTiltAndHeights,
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
        updateGettersFlag() {
            // Used for updating values of getter functions returned in protertiesData
            this.possibleAzimuths = this.propertiesData.getPossibleAzimuths();
        },
        updateLockedParameterFlag() {
            this.updateCurrentlyLockedParameter();
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                coreHeight: vm.coreHeight,
                parapetHeight: vm.parapetHeight,
                parapetThickness: vm.parapetThickness,
                tilt: vm.tilt,
                topHeight: vm.topHeight,
                lockedParameter: vm.lockedParameter,
                azimuth: vm.azimuth,
                setbackInside: vm.setbackInside,
                setbackOutside: vm.setbackOutside,
                ignored: vm.ignored,
                placable: vm.placable,
                rotationAllowed: vm.rotationAllowed,
                flushType: vm.flushType,
                obstruction: vm.obstruction,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.coreHeight !== this.propertiesData.coreHeight ||
                        this.topHeight !== this.propertiesData.topHeight ||
                        this.lockedParameter !== this.propertiesData.lockedParameter ||
                        this.parapetHeight !== this.propertiesData.parapetHeight ||
                        this.parapetThickness !== this.propertiesData.parapetThickness ||
                        this.tilt !== this.propertiesData.tilt ||
                        this.azimuth !== this.propertiesData.azimuth ||
                        this.setbackInside !== this.propertiesData.setbackInside ||
                        this.setbackOutside !== this.propertiesData.setbackOutside ||
                        this.ignored !== this.propertiesData.ignored ||
                        this.rotationAllowed !== this.propertiesData.rotationAllowed ||
                        this.placable !== this.propertiesData.placable ||
                        this.flushType !== this.propertiesData.flushType ||
                        this.obstruction !== this.propertiesData.obstruction
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
                    if (this.tilt !== this.propertiesData.tilt ||
                        this.topHeight !== this.propertiesData.topHeight ||
                        this.coreHeight !== this.propertiesData.coreHeight ||
                        this.azimuth !== this.propertiesData.azimuth) {
                        if (this.isCreation ||
                            Number.isNaN(Number(this.tilt)) ||
                            Number.isNaN(Number(this.topHeight)) ||
                            Number.isNaN(Number(this.coreHeight))) {
                            return;
                        }
                        const params = {
                            tilt: this.tilt,
                            topHeight: this.topHeight,
                            coreHeight: this.coreHeight,
                            lockedParameter: this.lockedParameter,
                            azimuth: this.azimuth,
                        };

                        const response = this.computeTiltAndHeights(params);

                        this.updateCurrentlyLockedParameter(response);
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
        updateCurrentlyLockedParameter(tiltAndHeights = null) {
            switch (this.lockedParameter) {
            case TILT_LOCKED:
                this.tilt = (tiltAndHeights === null) ?
                    this.propertiesData.getCurrentlyLockedParameter() : tiltAndHeights.tilt;
                break;
            case TOP_HEIGHT_LOCKED:
                this.topHeight = (tiltAndHeights === null) ?
                    this.propertiesData.getCurrentlyLockedParameter() : tiltAndHeights.topHeight;
                break;
            case CORE_HEIGHT_LOCKED:
                this.coreHeight = (tiltAndHeights === null) ?
                    this.propertiesData.getCurrentlyLockedParameter() : tiltAndHeights.coreHeight;
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
                coreHeight: this.coreHeight,
                parapetHeight: this.parapetHeight,
                parapetThickness: this.parapetThickness,
                tilt: this.tilt,
                lockedParameter: this.lockedParameter,
                topHeight: this.topHeight,
                azimuth: this.azimuth,
                setbackInside: this.setbackInside,
                setbackOutside: this.setbackOutside,
                ignored: this.ignored,
                placable: this.placable,
                rotationAllowed: this.rotationAllowed,
                flushType: this.flushType,
                obstruction: this.obstruction,
            }, !this.errors.any());
        },
        resetProperties() {
            this.coreHeight = this.propertiesData.coreHeight;
            this.parapetHeight = this.propertiesData.parapetHeight;
            this.topHeight = this.propertiesData.topHeight;
            this.lockedParameter = this.propertiesData.lockedParameter;
            this.parapetThickness = this.propertiesData.parapetThickness;
            this.tilt = this.propertiesData.tilt;
            this.azimuth = this.propertiesData.azimuth;
            this.setbackInside = this.propertiesData.setbackInside;
            this.setbackOutside = this.propertiesData.setbackOutside;
            this.ignored = this.propertiesData.ignored;
            this.placable = this.propertiesData.placable;
            this.rotationAllowed = this.propertiesData.rotationAllowed;
            this.flushType = this.propertiesData.flushType;
            this.obstruction = this.propertiesData.obstruction;
        },
        lockParameter(parameterName) {
            if (this.lockedParameter !== parameterName && this.editEnabled) {
                if (this.isCreation) {
                    switch (this.lockedParameter) {
                    case TOP_HEIGHT_LOCKED:
                        if (this.topHeight <= 0) {
                            this.topHeight = '';
                        }
                        break;
                    case CORE_HEIGHT_LOCKED:
                        if (this.coreHeight <= 0) {
                            this.coreHeight = '';
                        }
                        break;
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

</style>

<template>
    <div
        id="gazeboProperties"
        class="height-hundred-percent-">
        <div
            v-bar
            class="scroll-area">
            <div
                class="sappane-label sappane-label-panel">
                Gazebo Model Type
                <el-select
                    v-model="structureType"
                    class="sappane-select"
                    placeholder="Select"
                    style="width: 50%; float: right;"
                    popper-class="darkDropdown">
                    <el-option
                        value="PGUS01-01M1-77- 4x8"
                        label="PGUS01-01M1-77- 4x8"/>
                    <el-option
                        value="PGUS01-01M1-77- 5x8"
                        label="PGUS01-01M1-77- 5x8"/>
                    <el-option
                        value="PGUS01-01M1-77- 6x8"
                        label="PGUS01-01M1-77- 6x8"/>
                    <el-option
                        value="PGUS01-01M1-77- 7x8"
                        label="PGUS01-01M1-77- 7x8"/>
                </el-select>
            </div>
            <div
                class="sappane-label sappane-label-panel">
                Inverter Type
                <el-select
                    v-model="inverterType"
                    class="sappane-select"
                    placeholder="Select"
                    style="width: 50%; float: right;"
                    popper-class="darkDropdown">
                    <el-option
                        value="Enphase IQ7PLUS-72-2-US"
                        label="Enphase IQ7PLUS-72-2-US"/>
                    <el-option
                        value="Enphase IQ8PLUS-72-2-US-240"
                        label="Enphase IQ8PLUS-72-2-US-240"/>
                </el-select>
            </div>
            <div class="sappane-label">
                Azimuth
                <span>
                    <label>
                        <el-select
                            v-validate="azimuthValidation"
                            v-model.number="azimuth"
                            :disabled="!editEnabled"
                            class="sappane-select sappane-input-value"
                            filterable
                            allow-create
                            popper-class="darkDropdown"
                            name="Azimuth"
                            style="width: 25%;">
                            <el-option
                                v-for="azimuth_ in possibleAzimuths"
                                :key="azimuth_"
                                :label="azimuth_"
                                :value="azimuth_">
                                <div class="possibleAzimuthDropdown">
                                    <span> {{ azimuth_ }} </span>
                                    <i
                                        :style="{
                                            transform:
                                                'rotate(' +
                                                (Number(azimuth_) + 90) +
                                                'deg)',
                                        }"
                                        class="el-icon-back"/>
                                </div>
                            </el-option>
                        </el-select>
                    </label>
                </span>
                <p>
                    <span>{{ errors.first('Azimuth') }}</span>
                </p>
            </div>
        </div>
        <properties-buttons-bar
            :creation-mode="creationMode"
            :update-enabled="updateEnabled"
            :cancel-enabled="cancelEnabled"
            :reset-enabled="resetEnabled"
            :update-properties="updateProperties"
            :cancel-properties="resetProperties"
            :reset-properties="resetProperties"
        />
    </div>
</template>

<script>
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'GazeboProperties',
    components: {
        PropertiesButtonsBar,
    },
    mixins: [
        validationMixins.lengthValidation,
        validationMixins.tiltValidation,
        validationMixins.azimuthValidation,
        validationMixins.unitsValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    structureType: 'gazebo',
                    inverterType: 'Enphase IQ7PLUS-72-2-US',
                    azimuth: 0,
                    update: () => {},
                    getPossibleAzimuths: () => {},
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
            structureType: this.propertiesData.structureType,
            inverterType: this.propertiesData.inverterType,
            azimuth: this.propertiesData.azimuth,
            possibleAzimuths: this.propertiesData.getPossibleAzimuths(),
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled,
        }),
        ...mapState(useStudioTextTopBarStore, {
            topBarCompleteEnabled: state => state.completeEnabled,
            topBarCancelEnabled: state => state.cancelEnabled
        }),
        updateEnabled() {
            return (
                (
                    !this.creationMode &&
                    this.editEnabled &&
                    this.valuesChanged &&
                    !this.errors.any()
                )
                ||
                (
                    this.propertiesData.customFillFaceMode &&
                    !this.errors.any()
                )
            );
        },
        cancelEnabled() {
            return (
                (!this.creationMode && this.editEnabled && this.valuesChanged)
            );
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
    },

    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                structureType: vm.structureType,
                inverterType: vm.inverterType,
                azimuth: vm.azimuth,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.structureType !== this.propertiesData.structureType ||
                        this.inverterType !== this.propertiesData.inverterType ||
                        this.azimuth !== this.propertiesData.azimuth
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
    },
    beforeDestroy() {
        // no undinding shortcuts in creation mode since
        // it will unbind complete and cancel shortcuts in topBar
        if (!this.creationMode) {
            if (!this.topBarCompleteEnabled) this.$mousetrap.unbind('enter');
            if (!this.topBarCancelEnabled) this.$mousetrap.unbind('esc');
        }
    },
    methods: {
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update(
                {
                    structureType: this.structureType,
                    inverterType: this.inverterType,
                    azimuth: this.azimuth,
                },
                !this.errors.any(),
            );
        },
        resetProperties() {
            this.structureType = this.propertiesData.structureType;
            this.inverterType = this.propertiesData.inverterType;
            this.azimuth = this.propertiesData.azimuth;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
@import '../../../../styles/components/button';
</style>

<style scoped>
#walkwayProperties .dataProperties {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#walkwayProperties ::-webkit-scrollbar {
    display: none;
}

#walkwayProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#walkwayProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
.height-hundred-percent- {
    height: 75%;
}
</style>

<template>
    <div
        id="acdbProperties"
        class="height-hundred-percent">
        <div
            v-bar
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Azimuth
                    <label>
                        <input
                            v-validate="azimuthValidation"
                            v-model.number="azimuth"
                            :disabled="!editEnabled"
                            class="sappane-input-value"
                            name="Azimuth"
                            autocomplete="off">
                    </label>
                    <p><span>{{ errors.first('Azimuth') }}</span></p>
                </div>
                <div class="sappane-label">
                    Mount Height
                    <input-length
                        v-model="mountHeight"
                        :name="'Mount Height'"
                        :disabled="!editEnabled || !mountHeightEnabled"
                        :metric-validation="lengthValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Mount Height') }}</span>
                    </p>
                    <br><hr>
                </div>
                
                <!-- dc cable disabled <div class="sappane-label">
                    <div>INVERTERS</div>
                    <div class="module">Click '+' button to add inverter for auto stringing</div>
                    <br>
                    <div>
                        <div
                            v-if="this.invertersList.length == 0"
                            style="margin-top: 5px; padding: 5px"
                        >
                            No Inverters added yet. Click "Add Inverter" button below to add inverters.
                        </div>
                        <div
                            v-for="inverter in this.invertersList"
                            v-else
                            :key="inverter.id"
                        >
                            <div> {{ inverter.name }} </div>
                            <div v-if ="inverter.electricalProperties.Manufacturer !== null " >
                                {{ inverter.electricalProperties.Manufacturer }}
                            </div>
                            <div v-else>
                                ----------
                            </div>
                            <div> {{ inverter.electricalProperties.Make }} </div>
                            <div> {{ inverter.electricalProperties.Size }} kW </div>
                            <div v-if ="inverter.acCableAttached === null">
                                <button
                                    slot="reference"
                                    class="el-icon-circle-plus-outline button-sidebar-icons"
                                    style="font-size: 1.5vw"
                                    @click="addAcCable(inverter)"/>
                            </div>
                            <div v-else>
                                <button
                                    slot="reference"
                                    class="el-icon-circle-close button-sidebar-icons"
                                    style="font-size: 1.5vw"
                                    @click="deleteAcCable(inverter)"/>
                            </div>
                            <hr>
                        </div>
                    </div>
                </div> -->
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
import validationMixins from './validationMixins';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'ACDBProperties',
    components: {
        PropertiesButtonsBar,
    },
    mixins: [
        validationMixins.azimuthValidation,
        validationMixins.lengthValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    azimuth: 0,
                    mountHeight: 0.001,
                    mountHeightEditable: true,
                    invertersList: [],
                    update: () => {},
                    addAcCable: () => {},
                    deleteAcCable: () => {},
                };
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            azimuth: this.propertiesData.azimuth,
            mountHeight: this.propertiesData.mountHeight,
            mountHeightEditable: this.propertiesData.mountHeightEditable,
            invertersList: this.propertiesData.invertersList,
            addAcCable: this.propertiesData.addAcCable,
            deleteAcCable: this.propertiesData.deleteAcCable,
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled
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
        mountHeightEnabled() {
            return this.mountHeightEditable;
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                azimuth: vm.azimuth,
                mountHeight: vm.mountHeight,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (this.azimuth !== this.propertiesData.azimuth
                        || this.mountHeight !== this.propertiesData.mountHeight) {
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
        // no unbinding shortcuts in creation mode since
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
            this.propertiesData.update({
                azimuth: this.azimuth,
                mountHeight: this.mountHeight,
            }, !this.errors.any());
        },
        resetProperties() {
            this.azimuth = this.propertiesData.azimuth;
            this.mountHeight = this.propertiesData.mountHeight;
        },
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>
#acdbProperties .dataProperties  {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#acdbProperties ::-webkit-scrollbar {
    display: none;
}

#acdbProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#acdbProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
</style>

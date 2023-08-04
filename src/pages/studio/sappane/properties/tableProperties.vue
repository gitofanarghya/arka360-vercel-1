<template>
    <div  v-if="!eastWestRackingEnabled"
        id="tableProperties"
        class="height-hundred-percent">
        <div
            v-bar
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Module Selection
                    <div>
                            <infinite-scroll-dropdown-panel
                                :panel.sync="selectedPanel"
                                :module-id="defaultModuleId"
                                theme="darkDropdownWithFilters"/>
                        </div>
                        <br/>
                    <p v-for="(warning, index) in warnings" class="warning-text">
                        {{ warning }}
                    </p>
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
            :reset-properties="resetProperties"
        />
    </div>
</template>

<script>
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import VueToastr$1 from 'vue-toastr';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'TableProperties',
    components: {
        PropertiesButtonsBar,
        infiniteScrollDropdownPanel
    },
    mixins: [validationMixins.lengthValidation],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    trunkHeight: 0,
                    crownHeight: 0,
                    eastWestRackingEnabled: false,
                    update: () => {},
                };
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            eastWestRackingEnabled: this.propertiesData.eastWestRackingEnabled,
            trunkHeight: this.propertiesData.trunkHeight,
            crownHeight: this.propertiesData.crownHeight,
            selectedPanel:{},
            defaultModuleId:this.propertiesData.defaultModuleId,
            currentModuleId: this.propertiesData.defaultModuleId,
            warnings: this.propertiesData.warnings,
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
        moduleProperties: {
            get() {
                this.defaultModuleId = this.selectedPanel.id;
                return {
                    moduleId: parseInt(this.selectedPanel.id, 10),
                    moduleMake: `${this.selectedPanel.characteristics.manufacturer} ${
                        this.selectedPanel.model
                    }`,
                    moduleLength: parseFloat(this.selectedPanel.characteristics.length),
                    moduleWidth: parseFloat(this.selectedPanel.characteristics.width),
                    moduleSize: parseInt(this.selectedPanel.characteristics.p_mp_ref, 10) / 1000,
                    panelProperties: this.selectedPanel,
                };
            },
        },
        updateEnabled() {
            return (
                !this.creationMode && this.editEnabled && (this.currentModuleId!==this.selectedPanel.id)
                // true
            );
        },
        cancelEnabled() {
            return !this.creationMode && this.editEnabled && this.valuesChanged;
        },
        isEastWest(){
            return this.eastWestRackingEnabled
        },
        resetEnabled() {
            return this.creationMode && this.valuesChanged;
        },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                trunkHeight: vm.trunkHeight,
                crownHeight: vm.crownHeight,
                eastWestRackingEnabled: vm.eastWestRackingEnabled
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.trunkHeight !== this.propertiesData.trunkHeight ||
                        this.crownHeight !== this.propertiesData.crownHeight
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
            this.propertiesData.update(
                {
                    moduleProperties: {
                    moduleId: this.moduleProperties.moduleId,
                    moduleMake: this.moduleProperties.moduleMake,
                    moduleLength: this.moduleProperties.moduleLength,
                    moduleWidth: this.moduleProperties.moduleWidth,
                    moduleSize: this.moduleProperties.moduleSize,
                    panelProperties: this.moduleProperties.panelProperties,
                },
                },
                !this.errors.any(),
            );
            this.currentModuleId = this.defaultModuleId;
        },
        resetProperties() {
            this.trunkHeight = this.propertiesData.trunkHeight;
            this.crownHeight = this.propertiesData.crownHeight;
        },
    },
};
</script>
<style lang="scss" scoped>
@import '../../../../styles/components/input';
@import '../../../../styles/components/button';
</style>

<style scoped>
#treeProperties .dataProperties {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#treeProperties ::-webkit-scrollbar {
    display: none;
}

#treeProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#treeProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
.warning-text {
    color: chocolate;
}
</style>

<template>
    <div
        id="treeProperties"
        class="height-hundred-percent">
        <div
            v-bar
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Trunk Height
                    <input-length
                        v-model="trunkHeight"
                        :name="'Trunk Height'"
                        :disabled="!editEnabled"
                        :metric-validation="treeValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Trunk Height') }}</span>
                    </p>
                </div>
                <div class="sappane-label">
                    Crown Height
                    <input-length
                        v-model="crownHeight"
                        :name="'Crown Height'"
                        :disabled="!editEnabled"
                        :metric-validation="treeValidation"
                        :class-input="'sappane-input-value'"
                    />
                    <p>
                        <span>{{ errors.first('Crown Height') }}</span>
                    </p>
                </div>
                <div class="sappane-label gridClass">
                    <p style="white-space: nowrap;">Tree Model</p>
                    <el-select v-model="treeId" placeholder="Select">
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            >
                        </el-option>
                    </el-select>
                </div>
                <div class="sappane-label">
                    Enhanced Visualization in 3D
                    <el-tooltip style="     font-size: 0.9vw; "
                        placement="top" popper-class="designStudioToolTip">
                    
                        <template #content>Automatically adjust the width of the tree <br />based on its height. This adjustment will not<br /> affect the shadow calculations in software.</template>
                        <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                    </el-tooltip>
                    <el-switch v-model="isProportional"></el-switch>
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
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'TreeProperties',
    components: {
        PropertiesButtonsBar,
    },
    mixins: [validationMixins.treeValidation],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    treeId: 1,
                    isProportional: false,
                    trunkHeight: 0,
                    crownHeight: 0,
                    update: () => {},
                };
            },
        },
    },
    data() {
        return {
            options: [{
                value: 1,
                label: 'Small Oak'
            }, {
                value: 2,
                label: 'Birch'
            }, {
                value: 3,
                label: 'Branched'
            }, {
                value: 4,
                label: 'Pine'
            }, {
                value: 5,
                label: 'Apple'
            }, {
                value: 6,
                label: 'Palm'
            }],
            valuesChanged: false,
            treeId: this.propertiesData.treeId,
            isProportional: this.propertiesData.isProportional,
            trunkHeight: this.propertiesData.trunkHeight,
            crownHeight: this.propertiesData.crownHeight,
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
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                treeId: vm.treeId,
                isProportional: vm.isProportional,
                trunkHeight: vm.trunkHeight,
                crownHeight: vm.crownHeight,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (
                        this.trunkHeight !== this.propertiesData.trunkHeight ||
                        this.crownHeight !== this.propertiesData.crownHeight ||
                        this.treeId !== this.propertiesData.treeId ||
                        this.isProportional !== this.propertiesData.isProportional
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
                    treeId: this.treeId,
                    isProportional: this.isProportional,
                    trunkHeight: this.trunkHeight,
                    crownHeight: this.crownHeight,
                },
                !this.errors.any(),
            );
        },
        resetProperties() {
            this.treeId = this.propertiesData.treeId;
            this.isProportional = this.propertiesData.isProportional;
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

.gridClass {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.sappane-label >>> .el-select {
    width: 8.2vw;
}
.sappane-label >>> .el-input__inner {
    background-color: #000;
    color: #fff;
    height: inherit;
    max-height: 24px;
    line-height: 40px;
    padding: 0 12px;
    width: 100%;
    font-size: 0.9vw;
    border: none;
}

.sappane-label >>> .el-select .el-input .el-select__caret.is-reverse {
    position: relative;
    top: -8px;
}

.sappane-label >>> .el-select .el-input .el-select__caret {
    position: relative;
    top: 8px;
}
.designStudioToolTip{
    font-size: 14px;
}
</style>

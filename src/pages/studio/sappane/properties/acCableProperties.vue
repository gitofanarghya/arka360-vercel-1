<template>
    <div
        id="acCableProperties"
        class="height-hundred-percent">
        <div
            v-bar
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Material Type  
                    <el-select
                        v-model="materialType"
                        class="sappane-select acCable-select"
                        placeholder="Select"
                        popper-class="darkDropdown acCable-dropdown">
                        <el-option
                            value="aluminium"
                            label="Aluminium"/>
                        <el-option
                            value="copper"
                            label="Copper"/>
                    </el-select>
                </div>
                <div class="sappane-label">
                    No. of Cores
                    <el-select
                        v-model="cores"
                        class="sappane-select acCable-select"
                        placeholder="Select"
                        popper-class="darkDropdown acCable-dropdown">
                        
                        <el-option
                            value="1"
                            label="1"/>
                        <el-option
                            value="2"
                            label="2"/>
                        <el-option
                            value="3"
                            label="3"/>
                        <el-option
                            value="3.5"
                            label="3.5"/>
                        <el-option
                            value="4"
                            label="4"/>
                        <el-option
                            value="5"
                            label="5"/>
                    </el-select>
                </div>
                <div
                    :class="[wiringUnit === 'mmsq' ? 'sappane-label' : 'hidden']">
                    Size of Cable (sq.mm)
                    <el-select
                        v-model="cableSizeMM"
                        class="sappane-select acCable-select"
                        placeholder="Select"
                        popper-class="darkDropdown acCable-dropdown">
                        <div
                            v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_MM"
                            :key="index">
                            <el-option
                                :value="i"
                                :label="i"/>
                        </div>
                    </el-select>
                </div>
                <div
                    :class="[wiringUnit === 'awg' ? 'sappane-label' : 'hidden']">
                    Size of Cable (in AWG)
                    <el-select
                        v-model="cableSizeAWG"
                        class="sappane-select acCable-select"
                        placeholder="Select"
                        popper-class="darkDropdown acCable-dropdown">
                        <div
                            v-for="(i,index) in CONSTANTS.ACCABLE_SIZE_AWG"
                            :key="index">
                            <el-option
                                :value="i"
                                :label="i"/>
                        </div>
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
            :reset-properties="resetProperties"
        />
    </div>
</template>

<script>
import { mapState } from 'pinia';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { serverBus } from '../../../../main';
import {
    ACCABLE_MATERIAL_TYPE_COPPER,
    ACCABLE_MATERIAL_TYPE_ALUMINIUM,
    ACCABLE_SIZE_AWG,
    ACCABLE_SIZE_MM,
} from '../../../../core/coreConstants';
import { useDesignStore } from '../../../../stores/design';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'AcCableProperties',
    components: {
        PropertiesButtonsBar,
    },
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    materialType: 'aluminium',
                    cores: '1',
                    cableSizeMM: '1.5',
                    cableSizeAWG: '0000',
                };
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            materialType: this.propertiesData.materialType,
            cores: this.propertiesData.cores,
            cableSizeMM: this.propertiesData.cableSizeMM,
            cableSizeAWG: this.propertiesData.cableSizeAWG,
        };
    },
    nonReactiveData() {
        return {
            CONSTANTS: {
                ACCABLE_SIZE_AWG,
                ACCABLE_SIZE_MM,
                ACCABLE_MATERIAL_TYPE_ALUMINIUM,
                ACCABLE_MATERIAL_TYPE_COPPER,
            },
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            wiringUnit: state => state.versions.setting.wiring_unit,
        }),
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
    },
    watch: {
        // cableSizeAWG(newVal) {
        //     console.log('cable size',newVal)
        // },
    },
    mounted() {
        const vm = this;
        this.$watch(
            () => ({
                materialType: vm.materialType,
                cores: vm.cores,
                cableSizeMM: vm.cableSizeMM,
                cableSizeAWG: vm.cableSizeAWG,
                
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (this.materialType !== this.propertiesData.materialType ||
                    this.cores !== this.propertiesData.cores ||
                    this.cableSizeMM !== this.propertiesData.cableSizeMM ||
                    this.cableSizeAWG !== this.propertiesData.cableSizeAWG) {
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
        // serverBus.$off('newEditProfileVisible');
    },
    methods: {
        updateProperties() {
            if (!this.creationMode) {
                this.$eventBus.$emit(SET_PROPERTIES_EDIT_MODE, false);
            }
            this.propertiesData.update({
                materialType: this.materialType,
                cores: this.cores,
                cableSizeMM: this.cableSizeMM,
                cableSizeAWG: this.cableSizeAWG,
            }, !this.errors.any());
        },
        resetProperties() {
            this.materialType = this.propertiesData.materialType;
            this.cores = this.propertiesData.cores;
            this.cableSizeMM = this.propertiesData.cableSizeMM;
            this.cableSizeAWG = this.propertiesData.materialType;
        },
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>
#acCableProperties .dataProperties  {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#acCableProperties ::-webkit-scrollbar {
    display: none;
}

#acCableProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#acCableProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
.acCable-select {
    max-width: 100px;
}
.hidden {
    display: none;
}

/* .acCable-dropdown > .el-scrollbar {
    max-height: 270px !important;
} */


</style>
<style scoped>
.acCable-select {
    position: relative !important;
}
.acCable-dropdown .el-scrollbar {
    max-height: 270px !important;
}
.acCable-dropdown {
    margin: 0 !important;
    /* left: 1328px !important; */
}
</style>

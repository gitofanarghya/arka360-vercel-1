<template>
    <div
        id="dcCableProperties"
        class="height-hundred-percent">
        <div
            class="scroll-area">
            <div class="dataProperties">
                <div class="sappane-label">
                    Cable Length
                    <label>
                        <input
                            v-model="cableLength"
                            :disabled="!editEnabled"
                            class="sappane-input-value"
                            name="cableLength"
                            :metric-validation="lengthValidation"
                            autocomplete="off">
                    </label>
                    <p><span>{{ errors.first('cableLength') }}</span></p>
                </div>
                <div class="sappane-label">
                    Polarity  
                    <el-select
                        v-model="polarity"
                        class="sappane-select dcCable-select"
                        placeholder="Select Polarity"
                        popper-class="darkDropdown dcCable-dropdown">
                        <el-option
                            value="negative"
                            label="Negative"/>
                        <el-option
                            value="positive"
                            label="Positive"/>
                    </el-select>
                </div>
                <keep-alive>
                    <cable-size-pop-up
                        :isCableSizePopUpOpen="isCableSizePopUpOpen"
                        :cableSizeProperties="cableSizeProperties" 
                        :calculationResultArr="calculationResultArr" 
                        @select-cable="selectCableSize"
                        @close-popup="isCableSizePopUpOpen = false"
                        @setNewInputValues="getNewValuesFromPopUpInputForm"
                    ></cable-size-pop-up>
                </keep-alive>
                 <div class="Cable-Size">
                    <div class='label-value'>
                        Cable Size
                        <el-tooltip
                            content="Open Cable Size Calculator"
                            placement="top">
                            <i class="button-dark-theme-icons el-icon-info icons-circle'" style="margin-left: 5px"></i>
                        </el-tooltip>
                    </div>
                    <button @click="getVoltageAndCurrent" class="edit-btn">
                        <p v-if="!receivingVoltageAndCurrent">{{`${cableSizeWithUnit}, ${voltageDrop}%`}}</p>
                        <i class="el-icon-loading" v-else></i>
                    </button>
                </div>
                <div>
                    <p style="color:red;">By changing the string size, all cables attached to the "{{this.propertiesData.inverterName}}" will change.</p>
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
import axios from 'axios';
import PropertiesButtonsBar from './PropertiesButtonsBar.vue';
import validationMixins from './validationMixins';
import cableSizePopUp from '../../../../components/cableSize/cableSizePopUp1.vue'
import { SET_PROPERTIES_EDIT_MODE } from '../../../../componentManager/componentManagerConstants';
import { serverBus } from '../../../../main';
import {
    ACCABLE_MATERIAL_TYPE_COPPER,
    ACCABLE_MATERIAL_TYPE_ALUMINIUM,
    ACCABLE_SIZE_AWG,
    ACCABLE_SIZE_MM,
} from '../../../../core/coreConstants';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
import { useDesignStore } from '../../../../stores/design';
import { useStudioTextTopBarStore } from '../../../../stores/studio-topBar';

export default {
    name: 'DcCableProperties',
    components: {
        PropertiesButtonsBar,
        cableSizePopUp,
    },
     mixins: [
        validationMixins.lengthValidation,
    ],
    props: {
        propertiesData: {
            type: Object,
            default() {
                return {
                    cableLength:10,
                    polarity:'negative',
                    stringSize:10,
                    designId: 0,
                    update: () => {},
                    attachedMaxCableLength: () => 1,
                };
            },
        },
    },
    data() {
        return {
            valuesChanged: false,
            cableLength:this.propertiesData.cableLength,
            polarity:this.propertiesData.polarity,
            stringSize:this.propertiesData.stringSize,
            designId: this.propertiesData.designId,
            isCableSizePopUpOpen: false,
            receivingVoltageAndCurrent: false,
            voltageDrop: 0.99,
            calculationResultArr: [],
            cableSizeProperties: {
                designId: 0,
                wireSizeUnit: '',
                deratingFactor: 0,
                voltage: 0,
                current: 0,
                maxCableLength: this.propertiesData.attachedMaxCableLength().toFixed(2),
                size: 4,
            },
            moduleId: this.propertiesData.moduleId,
        };
    },
    nonReactiveData() {
        return {

        };
    },
    computed: {
        ...mapState(useDesignStore, {
            wiringUnit: state => state.versions.setting.wiring_unit == 'mmsq' ? 'sq.mm': state.versions.setting.wiring_unit,
            designSetting: state => state.versions.setting
        }),
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
            editEnabled: state => state.propertiesEnabled,
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
        cableSizeWithUnit(){
            return `${this.stringSize} ${this.wiringUnit === 'sq.mm' ? 'mm2' : 'AWG'}`;
        }
    },
    mounted() {
         const vm = this;
        this.$watch(
            () => ({
                cableLength:vm.cableLength,
                polarity:vm.polarity,
                stringSize:vm.stringSize,
            }),
            () => {
                this.$validator.validate().then(() => {
                    if (this.creationMode) {
                        this.updateProperties();
                    }
                    if (this.cableLength !== this.propertiesData.cableLength
                        || this.polarity !== this.propertiesData.polarity
                        || this.stringSize !== this.propertiesData.stringSize) {
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
                cableLength: this.cableLength,
                polarity: this.polarity,
                stringSize: this.stringSize,
            }, !this.errors.any());
        },
        resetProperties() {
            this.cableLength = this.propertiesData.cableLength;
            this.polarity = this.propertiesData.polarity;
            this.stringSize = this.propertiesData.stringSize;
        },
        async getVoltageAndCurrent(){
            if(!this.isCableSizePopUpOpen){
                this.receivingVoltageAndCurrent = true;
                //will receive data from backend
                try{
                    const resp = await axios.post(`api/designs/${this.designId}/get_max_IV/`, {
                        'maxLength': this.propertiesData.attachedMaxCableLength(), 
                        'moduleID': this.moduleId
                    });
                    const{voltage, current} = resp.data;
                    this.cableSizeProperties.voltage = voltage.toFixed(2);
                    this.cableSizeProperties.current = current.toFixed(2);
                    this.cableSizeProperties.designId = this.designId;
                    this.cableSizeProperties.wireSizeUnit = this.wiringUnit;
                    this.cableSizeProperties.deratingFactor = this.designSetting.constant_losses.derating_factor;
                }catch(error) {
                    console.error(error)
                }
                try{
                    const resp = await axios.post(`api/designs/${this.designId}/get_wire_size/`, {
                        "voltage": parseFloat(this.cableSizeProperties.voltage),
                        "current": parseFloat(this.cableSizeProperties.current),
                        "powerFactor": 1,
                        "deratingFactor": this.cableSizeProperties.deratingFactor,
                        "length": parseFloat(this.cableSizeProperties.maxCableLength),
                        "voltageDrop": this.voltageDrop,
                    });
                    const response = resp.data

                    if(this.calculationResultArr.length)
                        this.calculationResultArr = [];

                    for(let i=0; i<response.sqmm.length; i++){
                        this.calculationResultArr.push({
                            id: i, 
                            size: this.cableSizeProperties.wireSizeUnit === 'sq.mm' ? response.sqmm[i] : response.AWG[i], 
                            rating: response.Imax[i], 
                            voltageDrop: response.vdrop[i]
                        })
                    }
                } catch (error) {
                    console.error(error)
                }
                this.receivingVoltageAndCurrent = false;
                this.isCableSizePopUpOpen = true;
            }else{
                this.isCableSizePopUpOpen = false;
            }
        },
        selectCableSize(row) {
            this.stringSize = row.size;
            this.voltageDrop = row.voltageDrop;
            this.cableSizeProperties.size = row.size;
        },
        getNewValuesFromPopUpInputForm(values){
            this.deratingFactor = values.deratingFactor;
        }
    },
};
</script>
<style lang="scss" scoped>
    @import '../../../../styles/components/input';
    @import '../../../../styles/components/button';
</style>

<style scoped>
#dcCableProperties .dataProperties  {
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#dcCableProperties ::-webkit-scrollbar {
    display: none;
}

#dcCableProperties .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#dcCableProperties:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
.dcCable-select {
    max-width: 100px;
}
.hidden {
    display: none;
}

</style>
<style scoped>
.dcCable-select {
    position: relative !important;
}
.dcCable-dropdown .el-scrollbar {
    max-height: 270px !important;
}
.dcCable-dropdown {
    margin: 0 !important;
    /* left: 1328px !important; */
}
.Cable-Size{
    color: white;
    display:flex;
    justify-content:space-between;
    margin-bottom: 3%; 
    margin-top: 1.5%;
}
.edit-btn{
    font-size: x-small;
    width: 35%;
}
</style>

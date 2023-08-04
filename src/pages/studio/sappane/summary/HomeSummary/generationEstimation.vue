<template>
    <div>
        <hr>
        <div class="data-summary" style="padding-top: 10px; background-color: #141414">
            <div class="sappane-label" style="display: flex; justify-content: space-between;"> 
                <div style="display: flex; justify-content: flex-start;">
                    <p>Annual Generation</p>
                    <el-tooltip
                        :disabled="!isCalculateGenerationDisabled"
                        content="Please add Inverters and save the design."
                        placement="top"
                    >
                        <div>
                        <el-popover
                            placement="left-start"
                            trigger="hover"
                            popper-class="lossDiagramPopoverWhite">
                            <div
                                v-if="lossDiagramPopoverEnabled"
                                class="chartWrapperClass">
                                <div
                                    class="lossAnalysisHeader">
                                    LOSS ANALYSIS
                                </div>
                                <lossBarChart
                                    class='lossDiagramWrapperDiv'
                                    :disabled="isCalculateGenerationDisabled"
                                    :lossData="convertLossDataFromJsonToGraphFormat(currentGenerationData.lossData)"
                                    :options="chartOptions"/>
                            </div>
                            <button
                                slot="reference"
                                :disabled="isGenerationEngineRunning || !lossDiagramPopoverEnabled || isCalculateGenerationDisabled"
                                class="button-dark-theme-icons el-icon-info icons-circle'"/>
                        </el-popover>
                        </div>
                    </el-tooltip>
                </div>
                <span 
                    class="sappane-value"> 
                    {{ currentGenerationData.annualGeneration.toFixed(2) }} MWh
                </span>
            </div>
            <div class="sappane-label" style="display: flex; justify-content: space-between;">  
               <div style="display: flex; justify-content: flex-start;">
                    <p> Spec Gen</p>
                    <el-tooltip 
                        placement="top" popper-class="designStudioToolTip">
                
                        <template #content>The specific generation of a solar plant is<br />defined as the annual energy produced per<br/>kilowatt peak (kWp) of installed solar modules. </template>
                            <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                    </el-tooltip>
               </div>
               <span
                    class="sappane-value"
                    style="width: 60%; max-width: 150px;">
                    {{ currentGenerationData.specificGeneration.toFixed(2) }} kWh/kWp/year
                </span>
             
            </div>
            <div class="sappane-label" style="display: flex; justify-content: space-between;"> 
               <div style="display: flex; justify-content: flex-start;">
                <p> Performance Ratio</p>
                <el-tooltip 
                    placement="top" popper-class="designStudioToolTip">
            
                    <template #content>The performance ratio measures a solar PV<br />plant's quality and is expressed as a<br/>percentage, showing the relationship between<br/>actual and theoretical energy outputs. </template>
                    <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                </el-tooltip>
               </div>
               <span
                    class="sappane-value">
                    {{ currentGenerationData.performanceRatio.toFixed(2) }} %
                </span>
             
            </div>
           
            <div class="sappane-label" style="display: flex; justify-content: space-between;"> 
                <div style="display: flex; justify-content: flex-start;">
                    <p> Energy Offset</p>
                    <el-tooltip 
                       placement="top" popper-class="designStudioToolTip">
                
                        <template #content>Energy offset is the percentage of the ratio<br />of amount of yearly solar electricity generated<br/>in kilowatt-hours (kWh) and amount of yearly<br/>electricity consumed in kilowatt-hours (kWh).<br/>Energy Offset =  {{computedOffset}}</template>
                            <div >
                                <button class="button-dark-theme-icons el-icon-info icons-circle'"/>
                          
                            </div>
                    </el-tooltip>
                 </div>   
                    <span
                        class="sappane-value">
                        {{ currentGenerationData.offset }} %
                    </span>
                  
            </div>
            
            <!-- <p class="sappane-label" style="display: flex; justify-content: flex-start;"> Probability Distribution
                <modal ref="modalName">
                    <template v-slot:header>
                        <h3>Probability Distribution</h3>
                    </template>

                    <template v-slot:body>
                        <div style= "display:flex;justify-content: center" class="probabilty_distribution_body"> 
                            <img style= "width:50%;height:50%;" src="../../../../../assets/drop/Iphone-spinner-2.gif">
                        </div>
                    </template>

                <template v-slot:footer>
                    <div>
                    <button @click="$refs.modalName.closeModal()">Cancel</button>
                    <button @click="$refs.modalName.closeModal()">Save</button>
                    </div>
                </template> 
                </modal>
                <el-tooltip
                    :disabled="!isCalculateGenerationDisabled"
                    content="Please add Inverters and save the design."
                    placement="left"
                >
                    <div 
                        
                        style="padding-left: 5px"
                    >
                        <button
                            @click="$refs.modalName.openModal()"
                            slot="reference"
                            :disabled="isGenerationEngineRunning || !lossDiagramPopoverEnabled || isCalculateGenerationDisabled"
                            class="button-dark-theme-icons el-icon-info icons-circle'"/>
                    </div>
                </el-tooltip>
            </p>  -->
        </div>
        <el-tooltip
            :disabled="!isCalculateGenerationDisabled"
            content="Please add Inverters and save the design."
            placement="left"
        >
            <div
                :disabled="!isCalculateGenerationDisabled"
                style="width: 95%; font-size: 0.8vw;"
            >
                <button
                    id="calculateGenerationButton"
                    :disabled="isCalculateGenerationDisabled"
                    class="button-properties"
                    style="width: 100%; font-size: 0.8vw;"
                    @click="calculateGeneration">
                    <span v-show="!isGenerationEngineRunning">Calculate Generation</span>
                    <i
                        v-show="isGenerationEngineRunning"
                        class="el-icon-loading"/>
                </button>
            </div>
        </el-tooltip>
        <div
            class="sappane-label" 
            style="text-align: right; font-size: 0.7vw; padding: 5px 0 0 0">
            Last Updated {{ currentGenerationData.lastUpdated }} minutes(s) ago
        </div>   
    </div>
</template>
<script>
import { mapState, mapActions } from 'pinia';
import { useStudioStore } from '../../../../../stores/studio';
import { SET_SAVE } from '@/componentManager/componentManagerConstants';
import { convertLossDataFromJsonToGraphFormat } from '@/utils.js'
import lossBarChart from '@/components/ui/lossAnalysisChart.vue';
import { serverBus } from '../../../../../main';
import API from '@/services/api/';
import Modal from "@/components/ui/Modal.vue";
import { useDesignStore } from '../../../../../stores/design';
import { useProjectStore } from '../../../../../stores/project';

export default {
    components: {
        lossBarChart,
        Modal
    },
    props: {
        panelMap: {
            type: Array,
            default:() => [],
        },
        roofMap: {
            type: Object,
            default:() => {},
        },
        acSize: {
            type: String, 
            default: null,
        },
        dcSize: {
            type: String, 
            default: null,
        },
        isDesignSaved: {
            type: Boolean,
            default: false,
        },
        annualConsumption: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            isGenerationEngineRunning: false,
            chartOptions: {
                fontSize: 8,
                barThickness: 10,
                yOffset: 6,
                xOffset: 75,
            },
            isDesignSavedLocal: false,
            probabilty_distribution: null,
            isprobability: false
        };
    },
    computed: {
        ...mapState(useStudioStore, {
            currentGenerationData: 'GET_CURRENT_GENERATION',
        }),
        ...mapState(useDesignStore, {
            generationPayload: 'GET_GENERATION_PAYLOAD_DATA',
            designPathData: 'GET_DESIGN_PATH_DATA',
        }),
        ...mapState(useProjectStore, {
            projectConsumptionDetails: 'GET_CONSUMPTION_DETAILS',
        }),
        computedOffset(){
                return `(${parseFloat(this.currentGenerationData.annualGeneration).toFixed(2)*1000}/${parseFloat(this.annualConsumption).toFixed(2)})*100`;
        },

        isCalculateGenerationDisabled() {
            return this.isGenerationEngineRunning || parseFloat(this.dcSize) === 0
                || parseFloat(this.acSize) === 0 || !this.getIsDesignSaved;
        },

        lossDiagramPopoverEnabled() {
            return Object.keys(this.currentGenerationData.lossData.losses).length > 0;
        },
        ProbabilityPopoverEnabled() {
            return this.isprobability
        },
        getIsDesignSaved() {
            return this.isDesignSaved || this.isDesignSavedLocal;
        },
    },
    mounted() {
        this.$eventBus.$on('designSavedUpdated', (isDesignSavedLocal) => {
            this.isDesignSavedLocal = isDesignSavedLocal;
        });
    },
    created() {
        useStudioStore().generationData.annualGeneration = 0;
        useStudioStore().generationData.specificGeneration = 0;
        useStudioStore().generationData.performanceRatio = 0;
        useStudioStore().generationData.offset = 0;
    },
    methods: {
        ...mapActions(useStudioStore,[
            'FETCH_GENERATION',
            'FETCH_PROBABILITY'
        ]),
        convertLossDataFromJsonToGraphFormat,
        async calculateProbability() {
            try {
                const response = await this.FETCH_PROBABILITY(this.designPathData.designId);
                this.probabilty_distribution = response.data
                this.isprobability = true
                let data = document.getElementsByClassName("probabilty_distribution_body")[0];
                let img = data.getElementsByTagName("img")[0];
                if (img) {
                    img.src = 'data:image/png;base64,' + this.probabilty_distribution.image;
                    img.style.width = "100%";
                    img.style.height = "100%";
                }

            } catch (error) {
                console.error(error)
                this.$message({
                    showClose: true,
                    message: 'Error calculating generation numbers. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },
        async calculateGeneration() {
            this.isGenerationEngineRunning = true;
            try {
                const response = await this.FETCH_GENERATION(this.designPathData.designId);
            } catch (error) {
                this.$message({
                    showClose: true,
                    message: 'Error calculating generation numbers. Try again.',
                    type: 'error',
                    center: true
                });
            }
            this.isGenerationEngineRunning = false;
        },
        buttonHoverMessage() {
            if (this.isCalculateGenerationDisabled) {
                return 'Please save design.';
            }
            return '';
        },
        closeModal() {
            this.isprobability = false;
        },
        openModal() {  
          this.calculateProbability()
        }
    },
}
</script>
<style lang="scss" scoped>
@import '../../../../../styles/components/input';
@import '../../../../../styles/components/button';

.lossDiagramWrapperDiv {
    height: 400px; 
    width: 450px; 
    padding: 0 10px 10px 10px; 
    pointer-events: none;
}

.lossAnalysisHeader {
    text-align: center;
    font-size: 1vw;
    padding-top: 10px;
}
</style>

<style lang="scss">
.lossDiagramPopoverWhite {
    margin-right: 8.3vw !important;
    margin-bottom: 15px !important;
    background-color: white !important;
}
.leftmovingclass {
    left:1073px !important;
}
.designStudioToolTip{
    font-size: 14px;
}

</style>
<template>
    <div id="EwrackSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Subarray <span class="sappane-value"> {{ subarrayNumber }} </span></p>
                <p  v-show="creationMode" 
                    class="sappane-label"> Current Panel Count <span class="sappane-value" :class="{warn: (totalPanelCount != currentPanelsCount)}" > {{ currentPanelsCount }} </span></p>
                <p  v-show="creationMode" 
                    class="sappane-label"> Set Panel Count <span class="sappane-value"> {{ totalPanelCount }} </span></p>
                <p
                    v-show="!creationMode"
                    class="sappane-label"> Panels <span class="sappane-value"> {{ numPanels }} </span></p>
                <p
                    v-show="!creationMode"
                    class="sappane-label"> DC System Size <span class="sappane-value"> {{ subarraySize }} KW</span></p>
                <p
                    v-show="!creationMode"
                    class="sappane-label"> PV Module <span class="sappane-value"> {{ panelType }} </span></p>
                <p
                    v-show="!creationMode"
                    class="sappane-label"> Solar Access
                    <span class="sappane-value">
                        <i
                            v-if="solarAccessLoading"
                            class="el-icon-loading"/>
                        <span v-else> {{ solarAccess }} </span>
                    </span>
                </p>
                <p
                    v-if="showSubarrayStructureErrors"
                    class="sappane-label"
                    style="color: #ffb300"
                >
                    <i class="el-icon-warning" /> Structures for this subarray would not be created because-<br>
                    <ol style="margin: 0 1.3vw">
                        <li
                            v-for="(item, index) in summaryData.structureErrors"
                            :key="index"
                        >
                            {{ item }}
                        </li>
                    </ol>
                    <span
                        class="fix-button"
                        @click="summaryData.structureErrorAutoFixFunction"
                    > Fix </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioStore } from '../../../../stores/studio';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'EwrackSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    subarrayNumber: 0,
                    numPanels: 0,
                    totalModules: 0,
                    currentPanelsCount: 0,
                    subarraySize: 0,
                    panelType: 'Panel',
                    getSolarAccess: () => 0,
                    structureErrors: [],
                    structureErrorAutoFixFunction: () => 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioStore, {
            solarAccessLoading: state => state.solarAccess.loading
        }),
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode
        }),
        subarrayNumber() {
            if (Array.isArray(this.summaryData.subarrayNumber)) {
                return String(this.summaryData.subarrayNumber);
            }
            return this.summaryData.subarrayNumber;
        },
        numPanels() {
            if (Array.isArray(this.summaryData.numPanels)) {
                return this.summaryData.numPanels.reduce((acc, val) => acc + val);
            }
            if (this.summaryData.isEastWest) {
                return this.summaryData.numPanels*2;
            }
            return this.summaryData.numPanels;
        },
        totalPanelCount() {
            if (Array.isArray(this.summaryData.totalModules)) {
                return this.summaryData.totalModules.reduce((acc, val) => acc + val);
            }
            if (this.summaryData.isEastWest) {
                return this.summaryData.totalModules*2;
            }
            return this.summaryData.totalModules;
        },
        currentPanelsCount() {
            if (Array.isArray(this.summaryData.currentPanelsCount)) {
                return this.summaryData.currentPanelsCount.reduce((acc, val) => acc + val);
            }
            if (this.summaryData.isEastWest) {
                return this.summaryData.currentPanelsCount*2;
            }
            return this.summaryData.currentPanelsCount;
        },
        subarraySize() {
            if (Array.isArray(this.summaryData.subarraySize())) {
                return (this.summaryData.subarraySize().reduce((acc, val) => acc + val)).toFixed(2);
            }

            if (this.summaryData.isEastWest) {
                return this.summaryData.subarraySize().toFixed(2)*2;
            }
            return this.summaryData.subarraySize().toFixed(2);
        },
        panelType() {
            if (Array.isArray(this.summaryData.panelType)) {
                return 'Multiple Values';
            }
            return this.summaryData.panelType;
        },
        solarAccess() {
            if (this.solarAccessLoading) {
                return 'Computing...';
            }
            let solarAccess = this.summaryData.getSolarAccess();
            if (Array.isArray(solarAccess)) {
                solarAccess = solarAccess.reduce((acc, val) => acc + val) / solarAccess.length;
            }
            return (100 * solarAccess).toFixed(1);
        },
        showSubarrayStructureErrors() {
            return !this.creationMode && this.summaryData && this.summaryData.structureErrors && this.summaryData.structureErrors.length !== 0;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#subarraySummary ::-webkit-scrollbar {
    display: none;
}

#subarraySummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#subarraySummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#subarraySummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#subarraySummary .warn{  
    color:#ffb300;
}

#subarraySummary span.fix-button {
    color: white;
    padding: 2px 10px;
    top: 10px;
    position: relative;
    border: 1px solid white;
    border-radius: 5px;
    cursor: pointer;
}

.sappane-label {
    padding-bottom: 0px;
}

</style>

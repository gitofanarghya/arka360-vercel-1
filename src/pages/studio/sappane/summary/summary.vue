<template>
    <div id="summary">
        <div v-if = 'objectName == "INVERTERMENU"' class="header_sap">
            Inverter Menu Summary
        </div>
        <div v-else class="header_sap">
            {{ currentHeaderName }} Summary
        </div>
        <div class="summaryFooter">
            <component
                v-if="currentComponent!=='Summary'"
                :is="currentComponent"
                :summary-data="summaryData"/>
        </div>
    </div>
</template>

<script>
import HomeSummary from './HomeSummary/index.vue';
import ModelSummary from './modelSummary.vue';
import SmartrooffaceSummary from './smartroofFaceSummary.vue';
import WalkwaySummary from './walkwaySummary.vue';
import SafetylineSummary from './safetyLineSummary.vue';
import HandrailSummary from './handrailSummary.vue';
import PropertySummary from './propertySummary.vue';
import TreeSummary from './treeSummary.vue';
import SubarraySummary from './subarraySummary.vue';
import TableSummary from './tableSummary.vue';
import PanelSummary from './panelSummary.vue';
import StringSummary from './stringSummary.vue';
import DimensionSummary from './dimensionSummary.vue';
import SldSummary from './sldSummary/sldSummary.vue';
import InverterSummary from './inverterSummary.vue';
import MicroinverterSummary from './microInverterSummary.vue';
import CombinerBoxSummary from './combinerBoxSummary.vue';
import InvertermenuSummary from './inverterMenuSummary.vue';
import AcdbSummary from './acdbSummary.vue';
import DcdbSummary from './dcdbSummary.vue';
import TextboxSummary from './textboxSummary.vue';
import AcCableSummary from './acCableSummary.vue';
import DormerSummary from './dormerSummary.vue';
import DcCableSummary from './dcCableSummary.vue';
import ConduitSummary from './conduitSummary.vue';
import CabletraySummary from './cabletraySummary.vue';
import GazeboSummary from './gazeboSummary.vue';
import EwrackSummary from './eastWestRackingSummary.vue';
import mutationTypes from '../../../../store/modules/studio/modules/sapPane/mutationTypes';
import { mapState, mapActions } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'SapPaneSummaries',
    components: {
        HomeSummary,
        ModelSummary,
        SmartrooffaceSummary,
        WalkwaySummary,
        SafetylineSummary,
        HandrailSummary,
        PropertySummary,
        TreeSummary,
        SubarraySummary,
        TableSummary,
        PanelSummary,
        StringSummary,
        DimensionSummary,
        SldSummary,
        InverterSummary,
        MicroinverterSummary,
        CombinerBoxSummary,
        InvertermenuSummary,
        AcdbSummary,
        DcdbSummary,
        TextboxSummary,
        AcCableSummary,
        DormerSummary,
        DcCableSummary,
        ConduitSummary,
        CabletraySummary,
        GazeboSummary,
        EwrackSummary,
    },
    props: {
        summaryData: {
            type: Object,
            default: undefined,
        },
    },
    data() {
        return {
            current_Component: "Summary",
        };
    },
    methods: {
        ...mapActions(useStudioSapPaneStore, {
            setObjectName: mutationTypes.SET_OBJECT_NAME,
        }),
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            objectName: state => state.objectName,
        }),
        currentComponent: {
            get(){
                if (this.objectName === 'CUSTOM IMAGE') {
                    this.current_Component = 'Summary';
                    return this.current_Component;
                }
                else if (this.objectName === 'SMARTROOFMODEL'){
                    this.current_Component = 'ModelSummary';
                    return this.current_Component;
                }
                else if (this.objectName === 'ACCABLE' || this.objectName === 'DCCABLE') {
                    this.current_Component = `${this.objectName.charAt(0) + this.objectName.charAt(1).toLowerCase() + this.objectName.charAt(2) + this.objectName.substring(3).toLowerCase()}Summary`;
                    return this.current_Component;
                }
                else if (this.objectName === 'INVERTERMENU') {
                    this.current_Component = 'InvertermenuSummary';
                    return this.current_Component;
                }
                else if(this.objectName === 'COMBINERBOX') {
                    this.current_Component = 'CombinerBoxSummary';
                    return this.current_Component;
                }
                this.current_Component = `${this.objectName.charAt(0) + this.objectName.substring(1).toLowerCase()}Summary`;
                return this.current_Component;
            },
            set(val){
                this.current_Component = val;
            }
        },
        currentHeaderName() {
            const correspondingName = {
                "MICROINVERTER": 'Micro Inverter',
                "COMBINERBOX": 'Combiner Box',
                "INVERTERMENU": 'Inverter Menu',
                "HOME": 'Home'
            }
            return correspondingName[this.objectName];
        }
    },
    beforeDestroy() {
        this.currentComponent = "Summary";
        this.setObjectName("");
    }
};
</script>


<style lang="scss">
.scroll-area {
    height: 100%;
    margin: auto;
}
</style>


<style scoped>
#summary {
    height: 100% !important;
    /* overflow-y: auto; */
    display: flex;
    flex-direction: column;
}

#homeSummary,
#modelSummary,
#treeSummary,
#walkwaySummary,
#safetyLineSummary,
#handrailSummary,
#propertySummary,
#arraySummary,
#bosSummary,
#dcCableSummary,
#subarraySummary,
#acCableSummary,
#dormerSummary {
    height: 100% !important;
}

#inverterSummary,
#microInverterSummary,
#combinerBoxSummary,
#inverterMenuSummary,
#acdbSummary,
#dcdbSummary,
#textboxSummary,
#stringSummary,
#tableSummary,
#panelSummary,
#stringSummary,
#wiringZoneSummary {
    height: 100%;
}

</style>

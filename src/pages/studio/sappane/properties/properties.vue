<template>

    <div
        class="height-hundred-percent">
        <div class="header_sap" title="Select Subarray">
            {{ newObjectName }} PROPERTIES <label v-if="objectName == 'INVERTER'" class="beta-msg">BETA<span class="tooltiptext">This is a beta version of manual stringing.
More features will be released soon.</span>
</label>
        </div> 
        <component
            v-if="currentComponent!=='Properties' && !unmountComponent"
            :is="currentComponent"
            :properties-data="propertiesData"
            :update-locked-parameter-flag="updateLockedParameterFlag"
            :update-getters-flag="updateGettersFlag"/>
    </div>
</template>

<script>

import ModelProperties from './modelProperties.vue';
import WalkwayProperties from './walkwayProperties.vue';
import SubarrayProperties from './subarrayProperties.vue';
import TreeProperties from './treeProperties.vue';
import InverterProperties from './inverterProperties.vue';
import AcdbProperties from './acdbProperties.vue';
import DcdbProperties from './dcdbProperties.vue';
import CustomImageProperties from './customImageProperties.vue';
import AcCableProperties from './acCableProperties.vue';
import SmartrooffaceProperties from './smartroofFaceProperties.vue';
import SmartroofmodelProperties from './smartroofModelProperties.vue';
import DormerProperties from './dormerProperties.vue';
import DcCableProperties from './dcCableProperties.vue';
import ConduitProperties from './conduitProperties.vue';
import CabletrayProperties from './cabletrayProperties.vue';
import GazeboProperties from './gazeboProperties.vue';
import EwrackProperties from './eastWestRackingProperties.vue';
import TableProperties from './tableProperties.vue';
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane'
// const { mtate } = createNamespacedHelpers('studio/sapPane');

export default {
    name: 'Properties',
    components: {
        ModelProperties,
        WalkwayProperties,
        SubarrayProperties,
        GazeboProperties,
        EwrackProperties,
        TreeProperties,
        CustomImageProperties,
        InverterProperties,
        AcdbProperties,
        DcdbProperties,
        AcCableProperties,
        SmartrooffaceProperties,
        SmartroofmodelProperties,
        DormerProperties,
        DcCableProperties,
        ConduitProperties,
        CabletrayProperties,
        TableProperties
    },
    props: {
        propertiesData: {
            type: Object,
            default: undefined,
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
            unmountComponent: true,
        };
    },
    computed: {
        newObjectName() {
            if (this.objectName === 'SMARTROOFMODEL') {
                return 'ROOF MODEL';
            }
            else if (this.objectName === 'SMARTROOFFACE') {
                return 'ROOF FACE';
            }
            return this.objectName;
        },
        ...mapState(useStudioSapPaneStore, {
            objectName: state => state.objectName,
        }),
        currentComponent() {
            if (
                this.objectName === 'HOME'
                || this.objectName === 'DIMENSION'
                || this.objectName === 'SLD'
                || this.objectName === 'SAFETYLINE'
                || this.objectName === 'TEXTBOX'
                || this.objectName === 'HANDRAIL'
                || this.objectName === 'PROPERTY'
                || this.objectName === 'PANEL'
                || this.objectName === 'STRING'
                || this.objectName === 'INVERTERMENU'
                || this.objectName === 'MICROINVERTER'
                || this.objectName === 'COMBINERBOX'
            ) {
                return 'Properties';
            }
            if (this.objectName === 'CUSTOM IMAGE') {
                return 'CustomImageProperties';
            }
            else if (this.objectName === 'ACCABLE' || this.objectName === 'DCCABLE') {
                return `${this.objectName.charAt(0) + this.objectName.charAt(1).toLowerCase() + this.objectName.charAt(2) + this.objectName.substring(3).toLowerCase()}Properties`;
            }
            return `${this.objectName.charAt(0) +
                this.objectName.substring(1).toLowerCase()}Properties`;
        },
    },
    watch: {
        propertiesData() {
            // Used for unmounting and mounting if the same object type is selected
            this.unmountComponent = true;
            this.$nextTick().then(() => {
                this.unmountComponent = false;
            });
        },
    },    
};
</script>


<style lang="scss" scoped>
    @import '../../../../styles/components/utils';
    .beta-msg {
        width: 50px;
        height: 24px;
        margin: 4px 8px 20px 5px;
        padding: 3px 7px 4px;
        border-radius: 4px;
        background-color: #74bc22;
        cursor: pointer;
    }
    .beta-msg .tooltiptext{
        visibility: hidden;
        width: 81%;
        background-color: #ffffff;
        color: #000000;
        text-align: center;
        border-radius: 6px;
        padding: 15px;
        position: absolute;
        z-index: 9999;
        right: 3%;
        margin-top: -28%;
    }
    .beta-msg:hover .tooltiptext {
        visibility: visible;
}
</style>

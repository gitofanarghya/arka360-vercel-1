<template>
    <div id="actions">
        <component
            v-if="currentComponent!=='Actions'"
            :is="currentComponent"
            :actions-data="actionsData"/>
    </div>
</template>

<script>

import ModelActions from './modelActions.vue';
import WalkwayActions from './walkwayActions.vue';
import SafetylineActions from './safetyLineActions.vue';
import HandrailActions from './handrailActions.vue';
import PropertyActions from './propertyActions.vue';
import SubarrayActions from './subarrayActions.vue';
import TableActions from './tableActions.vue';
import PanelActions from './panelActions.vue';
import StringActions from './stringActions.vue';
import DimensionActions from './dimensionActions.vue';
import TreeActions from './treeActions.vue';
import InverterActions from './inverterActions.vue';
import AcdbActions from './acdbActions.vue';
import DcdbActions from './dcdbActions.vue';
import TextboxActions from './textboxActions.vue';
import AcCableActions from './acCableActions.vue';
import SmartrooffaceActions from './smartroofFaceActions.vue';
import SmartroofmodelActions from './smartroofModelActions.vue';
import DormerActions from './dormerActions.vue';
import DcCableActions from './dcCableActions.vue';
import ConduitActions from './conduitActions.vue';
import CabletrayActions from './cabletrayActions.vue';
import GazeboActions from './gazeboActions.vue';
import EwrackActions from './eastWestRackingActions.vue';

import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'Actions',
    components: {
        ModelActions,
        WalkwayActions,
        SafetylineActions,
        HandrailActions,
        PropertyActions,
        SubarrayActions,
        TableActions,
        PanelActions,
        StringActions,
        DimensionActions,
        TreeActions,
        InverterActions,
        AcdbActions,
        DcdbActions,
        TextboxActions,
        AcCableActions,
        SmartrooffaceActions,
        SmartroofmodelActions,
        DormerActions,
        DcCableActions,
        ConduitActions,
        CabletrayActions,
        GazeboActions,
        EwrackActions,
    },
    props: {
        actionsData: {
            type: Object,
            default: undefined,
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            objectName: state => state.objectName,
        }),
        currentComponent() {
            if (this.objectName === 'HOME' ||
                this.objectName === 'SLD' || this.objectName === 'CUSTOM IMAGE'
                || this.objectName === 'INVERTERMENU' || this.objectName === 'MICROINVERTER'
                || this.objectName === 'COMBINERBOX') {
                return 'Actions';
            }
            else if (this.objectName === 'ACCABLE' || this.objectName === 'DCCABLE') {
                return `${this.objectName.charAt(0) + this.objectName.charAt(1).toLowerCase() + this.objectName.charAt(2) + this.objectName.substring(3).toLowerCase()}Actions`;
            }
            return `${this.objectName.charAt(0) +
                this.objectName.substring(1).toLowerCase()}Actions`;
        },
    },
};
</script>

<style scoped>

#actions {
    height: 100% !important;
    display: flex;
    flex-direction: column;
    width: 100%;
}

#arrayActions {
    height: 100% !important;
}

</style>

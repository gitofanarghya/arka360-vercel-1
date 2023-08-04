<template>
    <div id="array">
        <el-popover
            v-model="popperVisible"
            placement="right"
            popper-class="subarrayPopper">
            <div
                @click="popperVisible = !popperVisible">
                <!-- <button
                    :disabled="true"
                    class="button-sidebar-dropdown"
                    @click="autoPanelDialogVisible=true">
                    Auto Panel Placement
                </button> -->
                <button
                    id="subarray_button"
                    class="button-sidebar-dropdown"
                    @click="checkMountAndCreateSubarray">
                    Add Subarray (S)
                </button>
                <button
                    id="delete-panels-button"
                    class="button-sidebar-dropdown"
                    @click="panelDeleteFunc">
                    Module Delete Mode
                </button>
                <button
                    id="add-table-button"
                    class="button-sidebar-dropdown"
                    @click="addTableFunc">
                    Add Table Mode (A)
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!panelEnabled"
                class="iconLeftSideBar-solar-panel button-sidebar-icons"/>
        </el-popover>
        <auto-panel-dialog
            v-if="autoPanelDialogVisible"
            :auto-subarray-func="autoSubarrayFunc"
            :get-design-settings-func="getDesignSettingsFunc"
            @hide-auto-panel-dialog="autoPanelDialogVisible=false"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import AutoPanelDialog from './AutoPanelDialog.vue';
import { serverBus } from '../../../main';
import { INIT_SUBARRAY } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';
import { SUBARRAY_RACK_STYLE_EWRACKING } from '../../../core/coreConstants';
import { setGazeboStatus } from '../../../core/utils/utils';

export default {
    name: 'Array',
    components: {
        AutoPanelDialog,
    },
    data() {
        return {
            isVipPowerGazebo: false,
            popperVisible: false,
            autoPanelDialogVisible: false,
        };
    },
    nonReactiveData() {
        return {
            newSubarrayFunc: () => {},
            autoSubarrayFunc: () => {},
            getDesignSettingsFunc: () => {},
            panelDeleteFunc: () => {},
            addTableFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            panelEnabled: state => state.panelEnabled,
        }),
    },
    methods: {
        checkMountAndCreateSubarray() {
            if (this.getDesignSettingsFunc().drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
                if (this.panelEnabled) this.newEastWestRackFunc();
            }
            else if (this.panelEnabled) {
                this.newSubarrayFunc();
            }
        }
    },
    async mounted() {
        this.isVipPowerGazebo = await setGazeboStatus()
        serverBus.$once(
            INIT_SUBARRAY,
            (newSubarrayFunc, newEastWestRackFunc, autoSubarray, getDesignSettings, panelDeleteFunc, addTableFunc) => {
                this.newSubarrayFunc = newSubarrayFunc;
                this.newEastWestRackFunc = newEastWestRackFunc;
                this.autoSubarrayFunc = autoSubarray;
                this.getDesignSettingsFunc = getDesignSettings;
                this.panelDeleteFunc = panelDeleteFunc;
                this.addTableFunc = addTableFunc;
                // if its VIP gazebo account removing the mouse bind actions for subarray
                if (!this.isVipPowerGazebo){
                    this.$mousetrap.bind('s', () => {
                        if (this.getDesignSettingsFunc().drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_EWRACKING) {
                            if (this.panelEnabled) newEastWestRackFunc();
                        }
                        else if (this.panelEnabled) newSubarrayFunc();
                    });
                    this.$mousetrap.bind('a', () => {
                        if (this.panelEnabled) addTableFunc();
                    });
                }
            },
        );
    },
    beforeDestroy() {
        this.$mousetrap.unbind('s');
        this.$mousetrap.unbind('a');
    },
};
</script>

<style type="text/css" scoped>

#array >>> .el-table th > .cell {
    font-size: 1.1vw;
    word-break: normal;
}

#array >>> .el-table td div {
    font-size: 1vw;
}

#array .el-table--group::after,
.el-table--border::after {
    width: 0;
}

/*for overriding the width changed by vuebar*/
#array >>> .el-form {
    width: 96% !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
}

#array >>> ::-webkit-scrollbar {
    width: 0px;
}

#array >>> .scroll-area {
    width: 100%;
    height: 65vh;
}

/*for removing the popper arrow*/
#array .el-popper .popper__arrow {
    display: none;
}
</style>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>

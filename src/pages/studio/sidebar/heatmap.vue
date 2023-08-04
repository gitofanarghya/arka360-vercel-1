<template>
    <div id="heatMap">
        <el-popover
            v-model="popperVisible"
            placement="right"
            width="60">
            <div

                @click="popperVisible = !popperVisible">
                <button
                    :disabled="heatMapVisible"
                    class="button-sidebar-dropdown"
                    @click="showFunc">
                    Show
                </button>
                <button
                    class="button-sidebar-dropdown"
                    @click="refreshFunc">
                    Refresh
                </button>
                <button
                    :disabled="!heatMapVisible"
                    class="button-sidebar-dropdown"
                    @click="hideFunc">
                    Hide
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!heatMapEnabled || !isDesignSaved"
                class="iconLeftSideBar-solar-pattern button-sidebar-icons"/>
        </el-popover>
    </div>
</template>

<script>
import { serverBus } from '../../../main';
import { INIT_HEAT_MAP } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';
import { useStudioStore } from '../../../stores/studio';

export default {
    name: 'HeatMap',
    data() {
        return {
            popperVisible: false,
            isDesignSaved: true,
        };
    },
    nonReactiveData() {
        return {
            showFunc: () => {},
            refreshFunc: () => {},
            hideFunc: () => {},
        };
    },
    computed: {
        heatMapEnabled() {
            return useStudioSideBarStore().heatMap.enabled && !useStudioStore().sunSimulation.enabled
        },
        heatMapVisible() {
            return useStudioSideBarStore().heatMap.visible
        }
    },
    mounted() {
        serverBus.$once(INIT_HEAT_MAP, (showFunc, refreshFunc, hideFunc) => {
            this.showFunc = showFunc;
            this.refreshFunc = refreshFunc;
            this.hideFunc = hideFunc;
        });
        this.$eventBus.$on('designSavedUpdated', (isDesignSaved) => {
            this.isDesignSaved = isDesignSaved;
        });
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
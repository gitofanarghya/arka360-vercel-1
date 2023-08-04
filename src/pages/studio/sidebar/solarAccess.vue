<template>
    <div id="solarAccess">
        <el-popover
            v-model="popperVisible"
            placement="right"
            width="60">
                
            <div
                @click="popperVisible = !popperVisible">
                <button
                    :disabled="solarAccessVisible"
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
                    :disabled="!solarAccessVisible"
                    class="button-sidebar-dropdown"
                    @click="hideFunc">
                    Hide
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!solarAccessEnabled"
                class="iconLeftSideBar-solaraccess button-sidebar-icons"
                style="font-size: 1.4vw;"/>
        </el-popover>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import { INIT_SOLAR_ACCESS } from '../../../componentManager/componentManagerConstants';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';
import { useStudioStore } from '../../../stores/studio';

export default {
    name: 'SolarAccess',
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
        ...mapState(useStudioSideBarStore, {
            solarAccessVisible: state => state.solarAccess.visible,
        }),
        solarAccessEnabled() {
            return (
                useStudioSideBarStore().solarAccess.enabled &&
                !useStudioStore().solarAccess.loading &&
                !useStudioStore().sunSimulation.enabled &&
                this.isDesignSaved
            );
        },
    },
    mounted() {
        serverBus.$once(INIT_SOLAR_ACCESS, (showFunc, refreshFunc, hideFunc) => {
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
.iconLeftSideBar-solaraccess:before {
  content: '';
  background-image: url("./../../../assets/img/Group\ 2115.svg");
  width: 1.3vw;
  height: 1.3vw;
  background-size: 1.3vw;
  background-repeat: no-repeat;
}
.iconLeftSideBar-solaraccess:disabled {
  opacity: 0.3;
}
</style>
<template>
    <div id="panelSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Number of Modules <span class="sappane-value"> {{summaryData.totalPanels}} </span></p>
                <p class="sappane-label"> DC Size <span class="sappane-value"> {{ DCSize }} kW</span></p>
                <p class="sappane-label"> Subarray List <span class="sappane-value"> {{ subarrayList }} </span></p>
                <p class="sappane-label"> Average Solar Access
                    <span class="sappane-value">
                        <i
                            v-if="solarAccessLoading"
                            class="el-icon-loading"/>
                        <span v-else> {{ solarAccess }} </span>
                    </span>
                </p>
                <p class="sappane-label"> Array Rows <span class="sappane-value"> {{ tableSizeY }} </span></p>
                <p class="sappane-label"> Array Columns <span class="sappane-value"> {{ tableSizeX }} </span></p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioStore } from '../../../../stores/studio';

export default {
    name: 'PanelSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    totalPanels: 0,
                    DCSize: () => 0,
                    subarrayList: 0,
                    tableSizeX: 0,
                    tableSizeY: 0,
                    getSolarAccess: () => 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioStore, {
            solarAccessLoading: state => state.solarAccess.loading,
        }),
        
        tableSizeX() {
            if (Array.isArray(this.summaryData.tableSizeX)) {
                const tableSizeX = [...new Set(this.summaryData.tableSizeX)];
                if (tableSizeX.length > 1) {
                    return 'Multiple Values';
                }
                return tableSizeX[0];
            }
            return this.summaryData.tableSizeX;
        },
        tableSizeY() {
            if (Array.isArray(this.summaryData.tableSizeY)) {
                const tableSizeY = [...new Set(this.summaryData.tableSizeY)];
                if (tableSizeY.length > 1) {
                    return 'Multiple Values';
                }
                return tableSizeY[0];
            }
            return this.summaryData.tableSizeY;
        },
        subarrayList() {
            if (Array.isArray(this.summaryData.subarrayList)) {
                const subarrayList = [...new Set(this.summaryData.subarrayList)];
                if (subarrayList.length > 1) {
                    return subarrayList.join(", ");
                }
                return subarrayList[0];
            }
            return this.summaryData.subarrayList;
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
        DCSize() {
            return this.summaryData.DCSize();
        }
        // multiSelectMode() {
        //     return (
        //         Array.isArray(this.summaryData.tableNumber) &&
        //         this.summaryData.tableNumber.length > 1
        //     );
        // },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#panelSummary ::-webkit-scrollbar {
    display: none;
}

#panelSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#panelSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#panelSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

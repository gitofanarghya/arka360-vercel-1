<template>
    <div id="tableSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Module count<span class="sappane-value"> {{ summaryData.panelCount }} </span></p>
                <p class="sappane-label">
                    <span v-if="multiSelectMode">Table Ids ({{ summaryData.tableNumber.length }})</span>
                    <span v-else>Table Id</span>
                    <span class="sappane-value"> {{ tableNumber }} </span>
                </p>
                <p class="sappane-label"> Array Rows <span class="sappane-value"> {{ tableSizeY }} </span></p>
                <p class="sappane-label"> Array Columns <span class="sappane-value"> {{ tableSizeX }} </span></p>
                <p class="sappane-label"> <span v-if="summaryData.isEastTable">Average East Solar <br> Access</span>
                    <span v-else-if="summaryData.isEastTable === false">Average West Solar <br> Access</span>
                    <span v-else>Average Solar Access</span>
                    <span class="sappane-value">
                        <i
                            v-if="solarAccessLoading"
                            class="el-icon-loading"/>
                        <span v-else> {{ solarAccess }} </span>
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioStore } from '../../../../stores/studio';

export default {
    name: 'TableSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    panelCount: 0,
                    tableNumber: 0,
                    tableSizeX: 0,
                    tableSizeY: 0,
                    isEastTable: Boolean,
                    getSolarAccess: () => 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioStore, {
            solarAccessLoading: state => state.solarAccess.loading,
        }),
        tableNumber() {
            if (Array.isArray(this.summaryData.tableNumber)) {
                return String(this.summaryData.tableNumber);
            }
            return this.summaryData.tableNumber;
        },
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
        multiSelectMode() {
            return (
                Array.isArray(this.summaryData.tableNumber) &&
                this.summaryData.tableNumber.length > 1
            );
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#tableSummary ::-webkit-scrollbar {
    display: none;
}

#tableSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#tableSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#tableSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.sappane-label {
    padding-bottom: 0px;
}
</style>

<template>
    <div id="gazeboSummary">
        <div
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    No.of Panels <span class="sappane-value"> {{ panelNumbers }} </span>
                </p>
                <p class="sappane-label">
                    Gazebo Model Type <span class="sappane-value"> {{ gazeboType }} </span>
                </p>
                <p class="sappane-label">
                    DC Size <span class="sappane-value"> {{ DCSize }} KW</span>
                </p>
                <p class="sappane-label">
                    Inverter Type <span class="sappane-value"> {{ inverterType }} </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';
export default {
    name: 'GazeboSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    panelNumbers: 0,
                    gazeboType: 'gazeboType',
                    DCSize: 0,
                    inverterType: 'inverterType',
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        panelNumbers() {
            if (Array.isArray(this.summaryData.panelNumbers)) {
                return this.summaryData.panelNumbers.reduce((acc, val) => acc + val);
            }
            return this.summaryData.panelNumbers;
        },
        gazeboType() {
            if (Array.isArray(this.summaryData.gazeboType)) {
                return 'Multiple Values';
            }
            return this.summaryData.gazeboType;
        },
        DCSize() {
            if (Array.isArray(this.summaryData.DCSize)) {
                return (this.summaryData.DCSize.reduce((acc, val) => acc + val)).toFixed(2);
            }
            return this.summaryData.DCSize.toFixed(2);
        },
        inverterType() {
            if (Array.isArray(this.summaryData.inverterType)) {
                return 'Multiple Values';
            }
            return this.summaryData.inverterType;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#gazeboSummary ::-webkit-scrollbar {
    display: none;
}

#gazeboSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#gazeboSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#gazeboSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>
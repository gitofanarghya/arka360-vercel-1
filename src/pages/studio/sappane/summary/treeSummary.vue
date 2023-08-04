<template>
    <div id="treeSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Tree Number
                    <span class="sappane-value">
                        {{ treeNumber }}
                    </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    Tree Height
                    <display-length
                        :metric-value="treeHeight"
                        :class-display="'sappane-value'"
                    />
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'TreeSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    treeNumber: 0,
                    treeHeight: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        treeNumber() {
            if (Array.isArray(this.summaryData.treeNumber)) {
                return String(this.summaryData.treeNumber);
            }
            return this.summaryData.treeNumber;
        },
        treeHeight() {
            if (Array.isArray(this.summaryData.treeHeight)) {
                return (this.summaryData.treeHeight.reduce((acc, val) => acc + val)).toFixed(3);
            }
            return this.summaryData.treeHeight.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#treeSummary ::-webkit-scrollbar {
    display: none;
}
#treeSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#treeSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#treeSummary .data-summary  {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

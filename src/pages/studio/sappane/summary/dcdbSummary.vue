<template>
    <div id="dcdbSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    DCDB Number
                    <span class="sappane-value">
                        {{ dcdbNumber }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'DCDBSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    dcdbNumber: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        dcdbNumber() {
            if (Array.isArray(this.summaryData.dcdbNumber)) {
                return String(this.summaryData.dcdbNumber);
            }
            return this.summaryData.dcdbNumber;
        },
    },
};
</script>


<style scoped>
#dcdbSummary ::-webkit-scrollbar {
    display: none;
}
#dcdbSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#dcdbSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
#dcdbSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

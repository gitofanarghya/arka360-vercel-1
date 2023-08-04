<template>
    <div id="acdbSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    <span>ACDB Number</span> 
                    <span class="sappane-value">
                        {{ acdbNumber }}
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
    name: 'ACDBSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    acdbNumber: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        acdbNumber() {
            if (Array.isArray(this.summaryData.acdbNumber)) {
                return String(this.summaryData.acdbNumber);
            }
            return this.summaryData.acdbNumber;
        },
    },
};
</script>


<style scoped>
#acdbSummary ::-webkit-scrollbar {
    display: none;
}
#acdbSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#acdbSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}
#acdbSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
#acdbSummary .data-summary .sappane-label {
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
}
</style>

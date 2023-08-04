<template>
    <div id="safetyLineSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Safety Line Number <span class="sappane-value"> {{ safetyLineNumber }} </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    Safety Line Length
                    <display-length
                        :metric-value="safetyLineLength"
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
    name: 'SafetyLineSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    safetyLineNumber: 0,
                    safetyLineLength: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        safetyLineNumber() {
            if (Array.isArray(this.summaryData.safetyLineNumber)) {
                return String(this.summaryData.safetyLineNumber);
            }
            return this.summaryData.safetyLineNumber;
        },
        safetyLineLength() {
            if (Array.isArray(this.summaryData.safetyLineLength)) {
                return this.summaryData.safetyLineLength.reduce((acc, val) => acc + val).toFixed(3);
            }
            return this.summaryData.safetyLineLength.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#safetyLineSummary ::-webkit-scrollbar {
    display: none;
}

#safetyLineSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#safetyLineSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#safetyLineSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

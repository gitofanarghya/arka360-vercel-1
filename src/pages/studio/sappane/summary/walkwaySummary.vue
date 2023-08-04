<template>
    <div id="walkwaySummary">
        <div
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Walkway Number <span class="sappane-value"> {{ walkwayNumber }} </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    Walkway Length
                    <display-length
                        :metric-value="walkwayLength"
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
    name: 'WalkwaySummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    walkwayNumber: 0,
                    walkwayLength: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        walkwayNumber() {
            if (Array.isArray(this.summaryData.walkwayNumber)) {
                return String(this.summaryData.walkwayNumber);
            }
            return this.summaryData.walkwayNumber;
        },
        walkwayLength() {
            if (Array.isArray(this.summaryData.walkwayLength)) {
                return this.summaryData.walkwayLength.reduce((acc, val) => acc + val).toFixed(3);
            }
            return this.summaryData.walkwayLength.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#WalkwaySummary ::-webkit-scrollbar {
    display: none;
}

#walkwaySummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#walkwaySummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#walkwaySummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

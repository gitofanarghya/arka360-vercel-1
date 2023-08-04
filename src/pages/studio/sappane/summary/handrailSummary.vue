<template>
    <div id="handrailSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Handrail Number <span class="sappane-value"> {{ handrailNumber }} </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    Handrail Length
                    <display-length
                        :metric-value="handrailLength"
                        :class-display="'sappane-value'"
                    />
                </p>
                <p class="sappane-label">
                    Handrail Height <span class="sappane-value"> {{ summaryData.height }} </span>
                </p>
                <p class="sappane-label">
                    Handrail column spacing <span class="sappane-value"> {{ summaryData.columnSpacing }} </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'HandrailSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    handrailNumber: 0,
                    handrailLength: 0,
                    height: 0,
                    columnSpacing: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        handrailNumber() {
            if (Array.isArray(this.summaryData.handrailNumber)) {
                return String(this.summaryData.handrailNumber);
            }
            return this.summaryData.handrailNumber;
        },
        handrailLength() {
            if (Array.isArray(this.summaryData.handrailLength)) {
                return this.summaryData.handrailLength.reduce((acc, val) => acc + val).toFixed(3);
            }
            return this.summaryData.handrailLength.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#handrailSummary ::-webkit-scrollbar {
    display: none;
}

#handrailSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#handrailSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#handrailSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

<template>
    <div id="acCableSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Ac cable Number <span class="sappane-value"> {{ AcCableNumber }} </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    AC Cable Length
                    <display-length
                        :metric-value="acCableLength"
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
    name: 'AcCableSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    acCableNumber: 0,
                    acCableLength: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        AcCableNumber() {
            if (Array.isArray(this.summaryData.acCableNumber)) {
                return String(this.summaryData.acCableNumber);
            }
            return this.summaryData.acCableNumber;
        },
        acCableLength() {
            if (Array.isArray(this.summaryData.acCableLength)) {
                return this.summaryData.acCableLength.reduce((acc, val) => acc + val).toFixed(3);
            }
            return this.summaryData.acCableLength.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#acCableSummary ::-webkit-scrollbar {
    display: none;
}

#acCableSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#acCableSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#acCableSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

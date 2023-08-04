<template>
    <div id="dcCableSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p
                 class="sappane-label">
                    Type <span class="sappane-value"> {{type}} </span>
                </p>
                <p v-show="!creationMode"
                class="sappane-label">
                    Conduit Length <span class="sappane-value"> {{cableTrayLength}}</span>
                </p>
                 <p v-show="!creationMode"
                 class="sappane-label">
                    Current Fill Factor <span class="sappane-value"> {{currentFillFactor}} </span>
                </p>
                
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'CabletraySummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    cableTrayLength:10,
                    currentFillFactor:0.1,
                    type:"cabletray"
                };
            },
        },
    },
    data() {
        return {
           type: this.summaryData.type,
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        cableTrayLength() {
            return this.summaryData.cableTrayLength.toFixed(3);
        },
        currentFillFactor() {
            return this.summaryData.currentFillFactor.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#dcCableSummary ::-webkit-scrollbar {
    display: none;
}

#dcCableSummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#dcCableSummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#dcCableSummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

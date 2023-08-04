<template>
    <div id="dcCableSummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Cable ID <span class="sappane-value"> {{summaryData.dcCableId}} </span>
                </p>
                 <p class="sappane-label">
                    Inverter Name <span class="sappane-value"> {{summaryData.inverterName}} </span>
                </p>
                <p class="sappane-label">
                    MPPT <span class="sappane-value"> {{summaryData.mppts}} </span>
                </p>
                <p class="sappane-label">
                    String <span class="sappane-value"> {{summaryData.string}} </span>
                </p>
                
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'DcCableSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {

                };
            },
        },
    },
    data() {
        return {
    
        };
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
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

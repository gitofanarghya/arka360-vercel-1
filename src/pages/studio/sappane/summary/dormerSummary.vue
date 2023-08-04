<template>
    <div id="dormerSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Model Number <span class="sappane-value"> {{ modelNumber }} </span></p>
                <p v-show="!creationMode" class="sappane-label">
                    Model Area
                    <display-length
                        :metric-value="modelArea"
                        :class-display="'sappane-value'"
                        :dimension="2"
                    />
                </p>
                <p v-show="!creationMode" class="sappane-label">
                    Module Percentage Area
                    <display-length
                        :metric-value="percentageArea"
                        :class-display="'sappane-value'"
                        :dimension="2"
                    />
                </p>
                <p class="sappane-label"> Type <span class="sappane-value"> {{type}} </span></p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'DormerSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    modelNumber: 0,
                    modelArea: 0,
                    percentageArea: 0,
                    type: 0,
                };
            },
        },
    },
    computed: {
        ...mapState(useStudioSapPaneStore, {
            creationMode: state => state.creationMode,
        }),
        modelNumber() {
            if (Array.isArray(this.summaryData.modelNumber)) {
                return String(this.summaryData.modelNumber);
            }
            return this.summaryData.modelNumber;
        },
        modelArea() {
            if (Array.isArray(this.summaryData.modelArea)) {
                return this.summaryData.modelArea.reduce((acc, val) => acc + val);
            }
            return this.summaryData.modelArea;
        },
        percentageArea() {
            if (Array.isArray(this.summaryData.percentageArea)) {
                return this.summaryData.percentageArea.reduce((acc, val) => acc + val);
            }
            return this.summaryData.percentageArea;
        },
        type() {
            return this.summaryData.type;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#dormerSummary ::-webkit-scrollbar {
    display: none;
}

#dormerSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#dormerSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#dormerSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

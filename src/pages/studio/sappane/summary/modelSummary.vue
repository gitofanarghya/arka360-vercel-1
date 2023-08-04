<template>
    <div id="modelSummary">
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
                <p v-if="!summaryData.isObstruction" class="sappane-label"> Module Coverage Area <span class="sappane-value"> {{ percentageArea }} % </span></p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'ModelSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    modelNumber: 0,
                    modelArea: 0,
                    percentageArea: 0,
                    isObstruction: false,
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
            return this.summaryData.percentageArea.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#modelSummary ::-webkit-scrollbar {
    display: none;
}

#modelSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#modelSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#modelSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

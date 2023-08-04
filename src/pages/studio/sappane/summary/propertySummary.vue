<template>
    <div id="propertySummary">
        <div
            v-bar
            class="scroll-area">
            <div class="data-summary">
                <p class="sappane-label">
                    Property Line Number <span class="sappane-value"> {{ propertyNumber }} </span>
                </p>
                <p
                    v-show="!creationMode"
                    class="sappane-label">
                    Property Line Length
                    <display-length
                        :metric-value="propertyLength"
                        :class-display="'sappane-value'"
                    />
                </p>
                <!-- <p class="sappane-label">
                    Property Line Height <span class="sappane-value"> {{ summaryData.height }} </span>
                </p>
                <p class="sappane-label">
                    Property Line column sopacing <span class="sappane-value"> {{ summaryData.columnSpacing }} </span>
                </p> -->
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useStudioSapPaneStore } from '../../../../stores/studio-sapPane';

export default {
    name: 'PropertySummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    propertyNumber: 0,
                    propertyLength: 0,
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
        propertyNumber() {
            if (Array.isArray(this.summaryData.propertyNumber)) {
                return String(this.summaryData.propertyNumber);
            }
            return this.summaryData.propertyNumber;
        },
        propertyLength() {
            if (Array.isArray(this.summaryData.propertyLength)) {
                return this.summaryData.propertyLength.reduce((acc, val) => acc + val).toFixed(3);
            }
            return this.summaryData.propertyLength.toFixed(3);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>
#propertySummary ::-webkit-scrollbar {
    display: none;
}

#propertySummary .vb > .vb-dragger > .vb-dragger-styler {
    visibility: hidden;
}

#propertySummary:hover .vb > .vb-dragger > .vb-dragger-styler {
    visibility: visible;
}

#propertySummary .data-summary {
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

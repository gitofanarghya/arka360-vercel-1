<template>
    <div id="dimensionSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label">
                    Dimension Number
                    <span class="sappane-value">
                        {{ dimensionNumber }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DimensionSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    dimensionNumber: 0,
                };
            },
        },
    },
    computed: {
        dimensionNumber() {
            if (Array.isArray(this.summaryData.dimensionNumber)) {
                return String(this.summaryData.dimensionNumber);
            }
            return this.summaryData.dimensionNumber;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#dimensionSummary ::-webkit-scrollbar {
    display: none;
}

#dimensionSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#dimensionSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#dimensionSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

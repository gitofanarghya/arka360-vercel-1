<template>
    <div id="stringSummary">
        <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Inverter Name <span class="sappane-value"> {{ summaryData.inverterName }} </span></p>
                <p class="sappane-label" v-if="summaryData.stringType === 'STRING_INVERTER'"> MPPT <span class="sappane-value"> {{ summaryData.mppt }} </span></p>
                <p class="sappane-label"> String <span class="sappane-value"> {{ summaryData.stringNum }} </span></p>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'StringSummary',
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    inverterName: 0,
                    mppt: 0,
                    stringNum: 0,
                    stringType: '',
                };
            },
        },
    },
    computed: {
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#panelSummary ::-webkit-scrollbar {
    display: none;
}

#panelSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#panelSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#panelSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

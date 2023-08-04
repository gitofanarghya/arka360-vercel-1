<template>
    <div id="smartroofFaceSummary">
         <div class="scroll-area" v-bar>
            <div class="data-summary">
                <p class="sappane-label"> Azimuth <span class="sappane-value"> {{summaryData.faceAzimuth}} </span></p>
            </div>
         </div>
    </div>
</template>

<script>

export default {
    name: 'SmartrooffaceSummary',
     props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    faceAzimuth: 0,
                };
            },
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/components/input';
</style>

<style scoped>

#smartroofFaceSummary ::-webkit-scrollbar {
    display: none;
}

#smartroofFaceSummary .vb > .vb-dragger > .vb-dragger-styler{
    visibility: hidden;
}

#smartroofFaceSummary:hover .vb > .vb-dragger > .vb-dragger-styler{
    visibility: visible;
}

#smartroofFaceSummary .data-summary  {  
    scrollbar-width: none;
    -ms-overflow-style: none;
}
</style>

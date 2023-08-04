<template>
    <div id="combinerBoxSummary">
        <div class="combiner-box-text">
            To show microInverter linked click on this button
            <el-row class="button-actions-row">
                <button
                    class="button-actions"
                    style="color: black;"
                    @click="showMicroInverter">
                    Show MicroInverter
                </button>
            </el-row>
        </div>
    </div>
</template>

<script>

export default {
    name: 'CombinerBoxSummary',
    components: {
    },
    props: {
        summaryData: {
            type: Object,
            default() {
                return {
                    showMicroInverter,
                };
            },
        },
    },
    mounted() {
        
    },
    methods: {
        showMicroInverter() {
            this.summaryData.showMicroInverter();
        }
    },
}
</script>

<style scoped>
.combiner-box-text {
    color: white;
    margin-bottom: 10px;
    font-size: small;
}
</style>>

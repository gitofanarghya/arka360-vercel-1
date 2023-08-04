<template>
    <div id="wiringZone">
        <!-- <el-popover
            v-model="popperVisible"
            placement="right"
            width="60"> -->
            <!-- <div @click="popperVisible = !popperVisible">

                <button class="button-sidebar-dropdown">
                    Action 1
                </button>

                <button class="button-sidebar-dropdown">
                    Action 2
                </button>

                <button class="button-sidebar-dropdown">
                    Action 3
                </button>

            </div> -->
            <!-- <el-tooltip content="wireSize calculator"> -->
            <button
                slot="reference"
                @click="redirectToWireSize()"
                class="iconLeftSideBar-wiring button-sidebar-icons"/>
            <!-- </el-tooltip> -->
        <!-- </el-popover> -->
    </div>
</template>

<script>

export default {

    name: 'WiringZone',
    props: ['isWiringZoneEnabled'],
    data() {
        return {
            msg: 'I am in wiringZone',
            designId: this.$route.params.designId,
            popperVisible: false,
        };
    },
    methods:{
        redirectToWireSize(){
           const routeData= this.$router.resolve({ name: 'wireSizeCalculator', params: {designId: this.designId} });
           window.open(routeData.href, "_blank");
        }
    }
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
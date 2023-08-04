<template>
    <el-breadcrumb separator=">">
        <el-breadcrumb-item
            :to="{ name: 'home' }">
            <p> Home </p>
        </el-breadcrumb-item>
        <el-breadcrumb-item
            v-if="!isCrmUser"
            :to="{ name: 'projectSummary', params: { projectId: designPathData.projectId }}">
            <p> Project Summary </p>
        </el-breadcrumb-item>
        <el-breadcrumb-item
            v-if="!isCrmUser"
            :to="{ name: 'designSummary', params: { designId: designPathData.designId }}">
            <p> Design Summary </p>
        </el-breadcrumb-item>
        <el-breadcrumb-item
            v-if="isCrmUser"
            :to="{ name: 'leadSummary', params: { leadId: leadIdFromDesign }}">
            <p> Lead Summary </p>
        </el-breadcrumb-item>
        <el-breadcrumb-item
            v-if="isCrmUser"
            :to="{ name: 'leadSummary:design', params: { leadId: leadIdFromDesign, designId: designPathData.designId }}">
            <p> Design </p>
        </el-breadcrumb-item>
    </el-breadcrumb>
</template>
<script>
    import LeftArrow from 'vue-material-design-icons/ArrowLeft.vue';
    import { mapState } from 'pinia';
    import { useDesignStore } from '../../../stores/design';
    import { isCrmUser } from "../../../utils"

    export default {
    name: 'DesignPath',
    data() {
        return {
        }
    },
    computed: {
        ...mapState(useDesignStore, {
            leadIdFromDesign: 'leadIdFromDesign',
            designPathData: 'GET_DESIGN_PATH_DATA'
        }),
        isCrmUser
    },
    methods:{
        projectNameFiltered(val){
            if(val){
                const escapedVal = val.replace(/`/g, "\\`"); // Escape backticks
                return eval("`" + escapedVal + "`");
            }
            else{
                return "-"
            }
        },
    },
    components:{
        LeftArrow,
    }
};
</script>

<style scoped>
.navBackButton{
    cursor: pointer;
    border: none;
    background-color: inherit;
    color: white;
}
</style>


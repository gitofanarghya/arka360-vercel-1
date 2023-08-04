<template>
    <div class="tabsContainer" :class="activeName=='first' ? 'first' : ''">
        <el-tabs v-model="activeName">
            <el-tab-pane label="Activity Timeline" name="first" class="commonTabClass">
                <ActivityTimeline :isDawer="true" :focusAddNote="focusAddNote" :lead="lead"/>
            </el-tab-pane>
            <el-tab-pane label="Tasks" name="second" class="commonTabClass">
                <div class="task-container">
                    <Tasks 
                    :lead="lead"
                    :project_id="project_id"
                    :sizeType="'medium'"
                    />
                </div>
            </el-tab-pane>
            <el-tab-pane label="Documents" name="third" class="commonTabClass">
                <Documents :lead="lead"/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import Tasks from './tasks.vue'
import Documents from './documents.vue';
import ActivityTimeline from "./activityTimeline.vue";
export default {

    components: {
        Tasks,
        Documents,
        ActivityTimeline
    },
    props: {
        tasks:{
            type: Array,
            default: []
        },
        project_id:{
            type: Number,
        },
        lead: {
            type: Object,
            default: {}
        },
        focusAddNote: {
            type: Boolean,
            default: false
        },
        activeTab: String
    },
    data() {
        return {
            activeName: 'first',
        }
    },

    created() {
        if (this.activeTab) {
            this.activeName = this.activeTab
        }
    },
}


</script>


<style scoped>
.tagsContainer {
    margin-bottom: 24px;
 }

.flexContainer6 {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
}

.tags {
    padding: 4px 12px;
    border-radius: 50px;
    background-color: #e8edf2;
    color: #222;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.label {
    font-size: 14px;
    color: #777;
    margin-bottom: 4px;
}

.tabsContainer {
    overflow-y: scroll;
}

.first {
    height: calc(100% - 260px);
}

.tabsContainer >>> .el-tabs__item {
    font-size: 18px;
    color: #777;
}

.tabsContainer >>> .el-tabs__item.is-active {
    color: #1c3366;
    font-weight: bold;
}

.tabsContainer >>> .el-tabs__active-bar {
    background-color: #1c3366;
}

.tabsContainer >>> .el-tabs__header{
    padding: 0 24px 0 24px;
    position: absolute;
    width: 100%;
    background-color: #fff;
    z-index: 10;
}
.task-container >>> .task-header{
    margin: 0 24px 8px 24px;
}

.commonTabClass {
    margin-top: 40px;
}
</style>
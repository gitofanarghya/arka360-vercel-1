<template>
    <div >
        <previousProposalRequests
          v-if="isPreviousRequestsPopupVisible"
          :isPreviousRequestsPopupVisible.sync="isPreviousRequestsPopupVisible"
          :currency_code="projectInformation.country_details.currency_code"
          :project_id="project_id"
      />
        <div class="history" v-if="forLeadSummary">
            <el-button v-if="!siteSurveyLink"
                class="btn createButton" type="primary" 
                @click="generateSiteSurveyLink()">Get Site Survey Link</el-button>
                <el-button v-else
                class="btn createButton" type="primary"
                @click="openMedia()">Site Survey</el-button>
                <img src="./assets/share.svg" class="shareIcon" v-if="siteSurveyLink" @click="shareSiteSurveyPopUp()"/>
            <p class="historyHead" @click="isPreviousRequestsPopupVisible = true">Proposal History</p>
        </div>
        <SiteSurveyLinkPopUp
            :siteSurveyLinkUrl.sync="siteSurveyLinkUrl"
            :isSiteSurveyLinkVisible.sync="isSiteSurveyLinkVisible"
            :viewSiteSurveyLink.sync = "viewSiteSurveyLink"
        />
        <EmptySiteSurveyLinkPopUp
            :emptySiteSurvey.sync = 'emptySiteSurvey'
            :closeEmptySiteSurveyPopUp.sync='closeEmptySiteSurveyPopUp'
        />
        <TaskElement :forLeadSummary="forLeadSummary" :headingText="headName" :backgroundColor="'white'">
            <template v-slot:header>
                <span class="taskStatus" v-if="forLeadSummary">{{ taskCount }} tasks</span>
                <div class="header-btn">
                    <el-button type="text" icon="el-icon-plus" @click="detailsDrawer=true" style="font-size: 16px; font-weight: 600;">Add Task</el-button>
                </div>
            </template>
            <template v-slot:body v-if="tasks.length">
                <div>
                    <Task  v-for="task in tasks" :countSize="countSize" :forLeadSummary="forLeadSummary" :info="task" :project_id="project_id" :key="task.id" v-on:toggleStatus="toggleStatus"/>
                </div>
                <div
                    v-observe-visibility="loadMoreTasks"
                    infinite-scroll-disabled="busy"
                    infinite-scroll-distance="10"
                    style="text-align: center"
                >
                    <i v-if="paginationDict.busy" class="el-icon-loading infiniteScrollLoader" />
                </div>
            </template>
            <template v-slot:body v-else>
                <div class="no-tasks-container">
                    No tasks here.
                </div>
            </template>
        </TaskElement>
        <all-drawer :drawer="detailsDrawer" @save="detailsDrawer = false" :componentName="componentName" :drawerSize="500"
            @close="detailsDrawer = false" :project_id="project_id" :leadId="leadId" :forAddTask="forAddTask"/>

    </div>
</template>
<script>
import previousProposalRequests from "../../webProposal/previousProposalRequests.vue";
import addOrEditTask from "./addOrEditTask.vue";
import Task from './models/Task.vue';
import API from "@/services/api/";
import TaskElement from './models/taskElement.vue';
import { useLeadStore } from '../../../stores/lead';
import { mapActions, mapState } from "pinia"
import SiteSurveyLinkPopUp from '../../dashboard/components/siteSurveyLinkPopUp.vue'
import { useProjectStore } from '../../../stores/project';
import { DATABASE_URL_FOR_SITE_SURVEY , DATABASE_URL } from "../../../constants";
import EmptySiteSurveyLinkPopUp from '../../dashboard/components/emptySiteSurveyPopUp.vue'
import { paginationHelper } from "../../../utils";

export default {
    name: 'TaskActivity',
    created() {
        this.getTaskInfo();
    },
    props: {
        forLeadSummary: {
            type: Boolean,
            default: false,
        },
        // tasks:{
        //     type: Object || Array,
        //     default: []
        // },
        lead: {
            type: Object,
        },
        project_id: {
            type: Number,
        },
        sizeType: {
            type: String,
            default: 'small'
        }
    },
    components: {
        SiteSurveyLinkPopUp,
        TaskElement,
        Task,
        addOrEditTask,
        previousProposalRequests,
        EmptySiteSurveyLinkPopUp
    },
    data() {
        return {
            taskCount:0,
            countSize: 0,
            isPreviousRequestsPopupVisible: false,
            headName: 'Tasks',
            tasksStatus: '',
            detailsDrawer: false,
            name: '',
            description: '',
            componentName: "addOrEditTask",
            forAddTask: true,
            tasks: [],
            isSiteSurveyLinkVisible: false,
            viewSiteSurveyLink: false,
            siteSurveyLinkUrl: "",
            busy: false,
            closeEmptySiteSurveyPopUp: true,
            emptySiteSurvey: false,
            paginationDict: {
                copyUrl: "",
                nextUrl: null,
                busy: false,
            }
        }
    },
    methods: {
        async generateSiteSurveyLink() {
            this.isSiteSurveyLinkVisible = true
            this.viewSiteSurveyLink = true;
            try{
                let response = await API.SITE_SURVEY_LINK.FETCH_SITE_SURVEY_LINK();
                this.siteSurveyToken = response.data.token;
                this.siteSurveyLinkUrl = response.data.url;
                this.updateSiteSurveyToken(response.data.token)
                await API.PROJECTS.PATCH_PROJECT(this.projectInformation.id, {site_survey_token: this.siteSurveyToken})
            }
            catch(e){
            console.error("error",e);
            }
        },
        async openMedia() {
            const surveyData = this.projectInformation.site_survey_token;
            const URL = `${DATABASE_URL}api/site-survey-details/${surveyData}/`;
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const { token } = user;
            const myHeaders = new Headers();
            myHeaders.append("authorization", `Token ${token}`);
            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };
            await fetch(URL, requestOptions)
					.then(response => response.text())
					.then(result => {
            const data = JSON.parse(result);
            if (data.site_survey_details.length === 0 && this.closeEmptySiteSurveyPopUp) 
              this.emptySiteSurvey = true;
          });
            if (surveyData && !this.emptySiteSurvey) {
                const routeData = this.$router.resolve({ name: 'mediaBox', params: { surveyId: surveyData } });
                window.open(routeData.href, '_blank');
            }
        },
        shareSiteSurveyPopUp() {
            this.isSiteSurveyLinkVisible = true
        },
        ...mapActions(useLeadStore, {
            fetchAllTasksInStore: "FETCH_ALL_TASKS_IN_STORE",
            oneditTask: "EDIT_TASK_IN_LEAD",
        }),
        async toggleStatus(id,isCompleted) {
            try {
                const patchData = {
                    is_completed: !isCompleted
                }
                const response = await API.LEADS.UPDATE_TASK(id, patchData);
                this.oneditTask(id,response.data)
            }
            catch (e) {
                console.log(e);
                this.$message({
                    showClose: true,
                    message: 'There was an unknown error while updating task status',
                    type: "error",
                    center: true
                })
            }
        },
        sortTasks() {
            this.tasks.sort(function (a, b) {
                return b.time - a.time;
            })
        },

        async getTaskInfo() {
            try {
                // this.isTasksRendered = false;
                let response = await API.LEADS.GET_TASKS(this.leadId, this.project_id);
                this.paginationDict.nextUrl = response.data.next
                this.taskCount=response.data.count;
                this.tasks = response.data.results;
                this.fetchAllTasksInStore(response.data.results,this.taskCount);
                // this.isTasksRendered = true;

            } catch (e) {
                // this.isTasksRendered = true;
                this.$message({
                    showClose: true,
                    message: 'Unable to get tasks.',
                    type: "error",
                    center: true
                });
            }

        },
		async loadMoreTasks() {
			let newList = await paginationHelper({
				origArray: this.tasks,
				paginationDict: this.paginationDict,
			})
      		if (newList) {
                this.tasks = newList;
                this.fetchAllTasksInStore(newList,this.taskCount);
			}
		},
    },
    watch: {
        allTasks: {
            deep: true,
            handler(value) {
                this.tasks = [...value];
            }
        },
        totalTasks: {
            deep: true,
            handler(value) {
                this.taskCount = value;
            }
        }
    },
    computed: {
        ...mapState(useLeadStore, {
            allTasks: state => state.tasks,
            leadInfo: state => state,
            totalTasks:state => state.taskCount,
        }),
        ...mapState(useProjectStore, {
            projectInformation: "GET_PROJECT_INFORMATION",
            updateSiteSurveyToken: "UPDATE_SITE_SURVEY_TOKEN"
        }), 
        siteSurveyLink() {
            if(this.projectInformation.site_survey_token) {
                return true;
            }
            else {
                return false;
            }
        },
        updateFinishedTasks() {
            let completedTasks = 0;
            console.log(this.tasks.length);
            this.tasks.forEach(e => {
                if (e.is_completed) completedTasks++
            });
            this.tasksStatus = `${completedTasks}/${this.taskCount}`
            return this.tasksStatus;
        },
        leadId() {
            return this.lead?.lead_details?.id || this.leadInfo?.id
        }
    },
    mounted() {
        this.$props.sizeType === 'medium' ? this.countSize = 120 : this.countSize = 40
        this.siteSurveyToken = this.projectInformation.site_survey_token;
        this.siteSurveyLinkUrl = DATABASE_URL_FOR_SITE_SURVEY.concat(this.siteSurveyToken);
    }
}
</script>
<style scoped>

.taskStatus {
    text-align: center;
    margin-left: auto;
}
.history{
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}
.shareIcon{
    cursor: pointer;
    margin: 0 10% 0 2%;
}
.addTskContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.addTskContainer {
    margin-bottom: 16px;
    gap: 24px;
}

.flexCont1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.historyHead {
    font-size: 16px;
    font-weight: 600;
    width: fit-content;
    color: #1c3366;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.historyHead::before {
    content: '';
    background: url('./assets/history.svg');
    width: 20px;
    min-width: 20px;
    height: 20px;
    display: block;
}

.taskBlue {
    font-size: 20px;
    color: #222;
}

.taskNo {
    font-size: 16px;
    color: #777;
}

.addTask {
    font-size: 16px;
    font-weight: bold;
    color: #409eff;
    display: flex;
    gap: 8px;
    align-items: center;
}

.addTask::before {
    content: '';
    background: url('./assets/PlusLg.svg');
    width: 20px;
    height: 20px;
    display: block;
}

.shrtFormSmall {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    font-size: 14px;
    color: #fff;
    background-color: #1c3366;
    border-radius: 50%;
}

.tasksBox {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 16px 0px;
    border-bottom: 4px dashed #999;
}

.tasksBox:last-child {
    border-bottom: none;
}

.heading {
    font-size: 16px;
    color: #222;
    margin-bottom: 4px;
}

.desc {
    font-size: 14px;
    color: #777;
}

.tasksContainer>>>.el-checkbox {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tasksContainer>>>.el-checkbox__inner {
    width: 16px !important;
    height: 16px !important;
    border-radius: 50%;
    border: 1px solid #222 !important;
}

.tasksContainer>>>.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #fff;
}

.tasksContainer>>>.el-checkbox__inner::after {
    border: 1px solid #222;
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 5px;
    top: 2px;
}

.historyHead,
.shareIcon {
    cursor: pointer;
}

.no-tasks-container {
    text-align: center;
    font-size: 1.2em;
    color: gray;
    padding: 2em;
}

.createButton {
    padding: 0.55rem 1rem;
}
.header-btn{
    margin-left: auto;
}
</style>


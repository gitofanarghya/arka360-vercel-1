import { defineStore } from 'pinia'
import API from '../services/api';
import { getProjectImageUrl } from '../utils';

export const useLeadStore = defineStore('lead', {
    state: () => {
        return {
            activity_logs: [],
            address: "",
            created_at: "",
            deal_value: 0,
            email: "",
            estimated_system_size: 0,
            id: -1,
            lead_source: null,
            lead_details: {last_contacted: null, latest_notes: null},
            name: "",
            owner: -1,
            phone: "",
            project_details: null,
            stage: "",
            tags: [],
            target_closure_date: "",
            taskCount:0,
            tasks: [],
        }
    },
    getters: {
        GET_ACTIVITY_DETAILS: state => state.activity_logs,
        GET_PROJECT_IMAGE_URL: (state) => {
            if (state?.project_details?.latitude && state?.project_details?.longitude) {
                return getProjectImageUrl(state.project_details.latitude, state.project_details.longitude, state.project_details.zoom);
            }
            return '';
        },
    },
    actions: {
        async SET_ACTIVITY(payload){
            this.activity_logs = payload;
        },
        async SET_LEAD_FROM_DATA(leadData){
            this.updateLeadInStore(leadData);
        },
        async SET_LEAD(leadId, projectId) {
            let resp = await API.LEADS.FETCH_LEAD(leadId, projectId)
            this.updateLeadInStore(resp.data)
        },
        async UPDATE_LEAD(patchData,notificationFunction) {
            try{
                const result = await API.LEADS.UPDATE_LEAD(this.id, this.project_details.id, patchData)
                this.updateLeadInStore(result.data)
            }
            catch(e){
                console.error(e);
                notificationFunction('error','Error in updating information');
            }
        },
        FETCH_ALL_TASKS_IN_STORE(allTasks,totalTasks){
            this.tasks = [... allTasks];
            this.taskCount=totalTasks;
        },
        ADD_TASK_IN_LEAD(task){
            this.tasks.push(task);
            this.taskCount=this.taskCount+1;
            console.log("add task",this.tasks);
        },
        EDIT_TASK_IN_LEAD(taskId,data){
            const task = this.$state.tasks.find(task => task.id === taskId);
            if (task) {
                Object.assign(task, data);
            }

        },
        DELETE_TASK_IN_LEAD(taskId){
            const index = this.$state.tasks.findIndex(task => task.id === taskId);
            if (index !== -1) {
                this.$state.tasks.splice(index, 1);
                this.taskCount=this.taskCount-1;
            }
        },
        async UPDATE_LEAD_FROM_DRAWER(leadId,projectId,patchData,notificationFunction){
            // try{
                const result = await API.LEADS.UPDATE_LEAD(leadId,projectId, patchData)
                this.updateLeadInStore(result.data);
                // return 1;
            // }
            // catch(e){
            //     // notificationFunction('error','Error in updating information');
            //     return 0;
            // }
        },
        updateLeadInStore(data) {
            for (let key of Object.keys(data)) {
                this[key] = data[key]
            }
        },
        UPDATE_LATEST_NOTE(newNote) {
            this.lead_details.latest_notes = newNote;
            this.lead_details.last_contacted="0 minutes ago";
        }
    }
})
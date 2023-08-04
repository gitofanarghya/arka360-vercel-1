import axios from "axios";
import { environment } from "../../constants";

let options = {};

// Sending project ID is better for backend,
// but project ID might not always be available
function addProjectIdIfAvailable(id) {
    if (id) {
        options.params = { project_id: id };
    } else {
        delete options.params;
    }
}

export default {
    FETCH_ALL_LEADS() {
        addProjectIdIfAvailable()
        return axios.get('/api/crm-lead/', options);
    },
    SEARCH_ALL_LEADS(query) {
        return axios.get(`/api/crm-lead/?query=${query}`);
    },
    SEARCH_ALL_LEADS_KANBAN(query, stage) {
        return axios.get(`/api/crm-lead/?stage=${stage}&query=${query}`);
    },
    FETCH_SORTED_LEADS(order_by,sort_by){
        return axios.get(`/api/crm-lead/?order_by=${order_by}&sort_by=${sort_by}`);
    },
    FETCH_FILTERED_LEADS(options){
        return axios.get(`/api/crm-lead/?${options}`);
    },
    FETCH_LEAD(leadId, projectId) {
        let endpoint = `/api/crm-lead/${leadId}/`
        addProjectIdIfAvailable(projectId)
        return axios.get(endpoint, options);
    },
    UPDATE_LEAD(leadId, projectId, body) {
        addProjectIdIfAvailable(projectId)
        return axios.patch(`/api/crm-lead/${leadId}/`, body, options)
    },
    FETCH_LEAD_LIST(options) {
        return axios.get(`/api/crm-lead/?${options}`);
    },
    LOAD_MORE_Leads(url) {
        return axios.get(url);
    },
    POST_USER_INFO(postData) {
        return axios.post(`/api/crm-lead/`, postData);
    },
    POST_REMINDER_INFO(leadId, postData) {
        return axios.post(`api/crm-lead/${leadId}/send_reminder/`, postData);
    },
    UPDATE_TASK(task_id, patchData) {
        return axios.patch(`/api/task/${task_id}/`, patchData);
    },
    CREATE_TASK(postData) {
        return axios.post(`/api/task/`, postData);
    },
    DELETE_TASK(task_id) {
        return axios.delete(`/api/task/${task_id}/`);
    },
    GET_TASKS(leadId, projectId) {
        // TODO: Once backend migrates CRM V2 to beta/prod, these conditions need to be removed.
        if (environment == 'dev') {
            return axios.get(`/api/task/?lead_id=${leadId}`);
        } else {
            return axios.get(`/api/task/${projectId}/`);
        }
    },
    LOAD_MORE_TASKS(url) {
        return axios.get(url);
    },
    ADD_ACTIVITY(postData) {
        return axios.post('api/activity-log/', postData);
    },
    UPDATE_ACTIVITY(projectId, activityId, patchData) {
        return axios.patch(`/api/activity-log/${activityId}/`, patchData);
    },
    FETCH_ACTIVITY(projectId) {
        return axios.get(`/api/activity-log/?project_id=${projectId}`);
    }
}

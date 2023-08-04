import axios from "axios";
export default {
    FETCH_DASHBOARD_INFO(org_id) {
        if(org_id)
        return axios.get(`api/organisations/${org_id }/dashboard/`);
    },
    FETCH_ALL_SERVICES_INFO(){
        return axios.get(`api/service-templates/`);
    },
    CREATE_PROJECT(rewObj_id,postData) {
        if(rewObj_id)
        return axios.post(`api/request-expert-services/${rewObj_id}/create_project/`,postData);
    },
    FINANCIAL_ADD_PRICING_POPUP_ADDED(rewObj_id,patchData) {
        if(rewObj_id)
        return axios.patch(`api/request-expert-services/${rewObj_id}/`,patchData);
    },
    GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(rewObj_id) {
        if(rewObj_id)
        return axios.get(`api/request-expert-services/${rewObj_id}/`);
    },
    ADITIONAL_ADD_NOTE_POPUP_ADDED(rewObj_id,postData) {
        if(rewObj_id)
        return axios.post(`api/request-expert-services/${rewObj_id}/create_and_update_design/`,postData);
    },
};
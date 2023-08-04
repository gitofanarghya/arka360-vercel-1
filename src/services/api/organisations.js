import axios from 'axios';

export default {

    FETCH_ORGANISATION(organisationId) {
        return axios.get(`/api/organisations/${organisationId}/`);
    },

    PATCH_ORGANISATION_SETTINGS(organisationId, patchData) {
        return axios.patch(`/api/organisations/${organisationId}/`, patchData);
    },

    FETCH_ALLOCATED_QUOTA() {
        return axios.get('/api/quota/allocated-quota/');
    },
    FETCH_USED_QUOTA() {
        return axios.get('/api/quota/usage/');
    },
    POST_PLAN_UPGRADATION_REQUEST() {
        // change here when request changed to post
        return axios.get('/api/quota/upgrade-plan/');
    },
    FETCH_ALL_AVAILABLE_PRICING_PLANS() {
        return axios.get('/api/quota/plan/');
    },
    FETCH_EXPERT_SERVICE_PERMISSION(organisationId) {
        return axios.get(`api/organisations/${organisationId}/`);
    },
    CREATE_TAGS(postData){
        return axios.post("/api/tags/", postData);
    },
    GET_TAGS() {
        return axios.get(`/api/tags/`);
    },
};

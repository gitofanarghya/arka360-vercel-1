import axios from 'axios';

export default {

    FETCH_MASTER_PANELS() {
        return axios.get('/api/master-data/modules/?old=true');
        // return axios.get('/api/master-data/modules/');
    },

    FETCH_MASTER_PANELS_OLDTRUE_REMOVED() {
        // return axios.get('/api/master-data/modules/?old=true');
        return axios.get('/api/master-data/modules/');
    },

    FETCH_ALL_MASTER_PANELS() {
        return axios.get('/api/master-data/modules/?old=true&admin_panel=true');
    },

    FETCH_ALL_MASTER_PANELS_BY_SORT(fieldName,sortType){
        return axios.get(`/api/master-data/modules/?old=true&admin_panel=true&fieldName=${fieldName}&sortType=${sortType}`);
    },


    FETCH_ALL_MASTER_PANELS_OLDTRUE_REMOVED() {
        return axios.get('/api/master-data/modules/?admin_panel=true');
    },

    POST_NEW_ADDED_PANELS(postData) {
        return axios.post('/api/master-data/modules/', postData);
    },

    DELETE_SELECTED_PANELS(patchData) {
        return axios.patch('/api/master-data/modules/1/', patchData);
    },

    FETCH_MASTER_PANEL_BY_ID(id) {
        if(id)
        return axios.get(`/api/master-data/modules/${id}/?old=true`);
        else
        console.error(`/api/master-data/modules/${id}/?old=true`)
        // return axios.get(`/api/master-data/modules/${id}`);
    },

    FETCH_MASTER_PANEL_BY_ID_OLDTRUE_REMOVED(id) {
        // return axios.get(`/api/master-data/modules/${id}/?old=true`);
        if(id)
        return axios.get(`/api/master-data/modules/${id}`);
        else
        console.error(`/api/master-data/modules/${id}`)
    },

    FETCH_UPDATED_MASTER_PANEL_BY_ID(id) {
        if(id)
        return axios.get(`/api/master-data/modules/${id}/`);
        else
        console.error(`/api/master-data/modules/${id}/`);
    },

    SEARCH_MASTER_PANELS(query, isAdminPanel , fieldName, sortType) {
        if (isAdminPanel) {
            query.admin_panel = true;
        }
        return axios.get(`/api/master-data/modules/?old=true&fieldName=${fieldName}&sortType=${sortType}`, { params: query });
    },

    SEARCH_MASTER_PANELS_OLDTRUE_REMOVED(query, isAdminPanel) {
        if (isAdminPanel) {
            query.admin_panel = true;
        }
        return axios.get('/api/master-data/modules/', { params: query });
    },

    LOAD_MORE_PANELS(url) {
        return axios.get(url);
    },
};

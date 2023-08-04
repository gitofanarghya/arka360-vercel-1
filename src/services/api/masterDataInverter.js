import axios from 'axios';

export default {

    FETCH_ALL_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?all_inverter=true');
    },

    FETCH_MORE_INVERTERS(url) {
        return axios.get(url);
    },

    FETCH_MASTER_INVERTERS() {
        // return axios.get('/api/master-data/master-inverters/');
        return axios.get('/api/master-data/master-inverters/?all_inverter=true');
    },

    FETCH_ALL_MASTER_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?admin_panel=true');
    },

    FETCH_ALL_MASTER_INVERTERS_BY_SORT(fieldName,sortType){
        // return axios.get(`/api/master-data/master-inverters/?admin_panel=true&fieldName=${fieldName}&sortType=${sortType}`);
        return axios.get(`/api/master-data/master-inverters/?admin_panel=true&all_inverter=true&fieldName=${fieldName}&sortType=${sortType}`);
    },

    FETCH_MICRO_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?type=micro');
    },
    FETCH_INVENTORY_INVERTERS(type) {
        if(type !== '') {
            return axios.get(`/api/inventory/inverters/?type=${type}`)
        } else {
            return axios.get(`/api/inventory/inverters/`)
        }
    },

    FETCH_MASTER_INVERTERS_BY_TYPE(type){	
        if(type==='String Inverter'){	
         console.log("inside string",type);	
        return axios.get(`api/master-data/master-inverters/`);	
              
        }	
        else if(type==='Micro Inverter'){	
         console.log("inside micro",type);	
        return axios.get(`api/master-data/master-inverters/?type=micro`);	
        }	
        else if(type==='Central Inverter'){	
        return axios.get(`api/master-data/master-inverters/?type=central`);	
        }	
 },

    FETCH_ALL_MICRO_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?admin_panel=true&type=micro');
    },

    FETCH_CENTRAL_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?type=central');
    },

    FETCH_ALL_CENTRAL_INVERTERS() {
        return axios.get('/api/master-data/master-inverters/?admin_panel=true&type=central');
    },

    POST_NEW_ADDED_INVERTERS(postData) {
        return axios.post('/api/master-data/master-inverters/', postData);
    },

    DELETE_SELECTED_INVERTERS(patchData) {
        return axios.patch('/api/master-data/master-inverters/1/', patchData);
    },

    FETCH_MASTER_INVERTER_BY_ID(id) {
        if(id)
        return axios.get(`/api/master-data/master-inverters/${id}/`);
        else
        console.error(`/api/master-data/master-inverters/${id}/`);
    },

    FETCH_MASTER_INVERTER_BY_OLD_ID(id) {
        if(id)
        return axios.get(`api/master-data/inverterMapping/?format=json&oldId=${id}`);
        else
        console.error(`api/master-data/inverterMapping/?format=json&oldId=${id}`);
    },

    SEARCH_MASTER_INVERTERS(query, isAdminPanel, fieldName, sortType) {
        if (isAdminPanel) {
            query.admin_panel = true;
        }
        // return axios.get('/api/master-data/master-inverters/', { params: query });
        return axios.get(`/api/master-data/master-inverters/?fieldName=${fieldName}&sortType=${sortType}`, { params: query });
    },

    SEARCH_ALL_INVERTERS(query, isAdminPanel, fieldName, sortType) {
        if (isAdminPanel) {
            query.admin_panel = true;
        }
        // return axios.get('/api/master-data/master-inverters/', { params: query });
        return axios.get(`/api/master-data/master-inverters/?all_inverter=true&fieldName=${fieldName}&sortType=${sortType}`, { params: query });
    },


    LOAD_MORE_INVERTERS(url) {
        return axios.get(url);
    },
};

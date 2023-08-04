import axios from 'axios';

export default {

    FETCH_ORGANISATION_PANELS() {
        return axios.get('/api/inventory/panels/?old=true');
    },

    DELETE_ORGANISATION_PANELS(payload) {
        return axios.delete(`/api/inventory/panels/${payload}/?old=true`);
    },

    ADD_ORGANISATION_PANELS(payload) {
        return axios.post('/api/inventory/panels/', payload);
    },

    LOAD_MORE_ORGANISATION_PANELS(url) {
        return axios.get(url);
    },

};

import axios from 'axios';

export default {

    FETCH_ORGANISATION_INVERTERS() {
        return axios.get(`/api/inventory/inverters/`);
    },

    DELETE_ORGANISATION_INVERTERS(payload) {
        return axios.delete(`/api/inventory/inverters/${payload}/`);
    },

    ADD_ORGANISATION_INVERTERS(payload) {
        return axios.post(`/api/inventory/inverters/`, payload);
    },

    LOAD_MORE_ORGANISATION_INVERTERS(url) {
        return axios.get(url);
    },

};

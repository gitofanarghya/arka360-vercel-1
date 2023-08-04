import axios from 'axios';

export default {

    FETCH_API_KEYS_DATA() {
        return axios.get('/api/integration-api/api-key/');
    },

    ADD_API_KEY(payload) {
        return axios.post('/api/integration-api/api-key/', payload);
    },

    DELETE_API_KEY(payload) {
        return axios.delete(`/api/integration-api/api-key/${payload}/`);
    },

    UPDATE_API_KEY(payload) {
        return axios.patch(`/api/integration-api/api-key/${payload.id}/`, payload);
    },

};

import axios from 'axios';

export default {

    FETCH_ORGANISATION_BOQ(payload) {
        return axios.get('/api/inventory/bom-inventory/', { params: payload });
    },

    DELETE_ORGANISATION_BOQ(id, payload) {
        return axios.delete(`/api/inventory/bom-inventory/${id}/`, { data: payload });
    },

    ADD_ORGANISATION_BOQ(payload) {
        return axios.post('/api/inventory/bom-inventory/', payload);
    },

    UPDATE_ORGANISATION_BOQ(id, patchData) {
        return axios.patch(`/api/inventory/bom-inventory/${id}/`, patchData);
    },

};

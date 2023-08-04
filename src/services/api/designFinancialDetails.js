import axios from 'axios';

export default {

	PATCH_DESIGN_FINANCIALS(designId, patchData) {
        return axios.patch(`/api/financial/pricing/${designId}/`, patchData);
    },

    DELETE_DESIGN_FINANCIALS(designId) {
        return axios.delete(`/api/financial/pricing/${designId}/`);
    },

    POST_DESIGN_FINANCIALS(postData) {
        return axios.post(`/api/financial/pricing/`, postData);
    },

}
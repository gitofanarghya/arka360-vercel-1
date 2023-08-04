import axios from 'axios';

export default {

    POST_USER_SHARES(postData) {
        return axios.post('/api/default-user-shares/', postData);
    },

    DELETE_USER_SHARES(shareId) {
        return axios.delete(`/api/default-user-shares/${shareId}/`);
    },

    PATCH_USER_SHARES(shareId, patchData) {
        return axios.patch(`/api/default-user-shares/${shareId}/`, patchData);
    },

};

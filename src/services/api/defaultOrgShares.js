import axios from 'axios';

export default {

    POST_ORG_SHARES(postData) {
        return axios.post('/api/default-org-shares/', postData);
    },

    DELETE_ORG_SHARES(shareId) {
        return axios.delete(`/api/default-org-shares/${shareId}/`);
    },

};

import axios from 'axios';

export default {

    FETCH_ALL_PROFILES() {
        return axios.get('/api/defaults-profiles/');
    },
    FETCH_ALL_SEARCHED_PROFILES(term) {
        return axios.get(`/api/defaults-profiles/?query=${term}`);
    },
    PATCH_PROFILE(profileId, patchData) {
        return axios.patch(`/api/defaults-profiles/${profileId}/`, patchData);
    },

    POST_NEW_PROFILE(postData) {
        return axios.post('/api/defaults-profiles/', postData);
    },

    DELETE_PROFILE(profileId) {
        return axios.delete(`/api/defaults-profiles/${profileId}/`);
    },

    FETCH_MORE_PROFILES(url) {
        return axios.get(url);
    },
};
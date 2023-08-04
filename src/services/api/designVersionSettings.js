import axios from 'axios';

export default {

    PATCH_VERSION_SETTINGS(designVersionSettingId, patchData) {
        return axios.patch(`/api/design-version-settings/${designVersionSettingId}/`, patchData);
    },
    FETCH_VERSION_SETTINGS(designVersionSettingId) {
        return axios.get(`/api/design-version-settings/${designVersionSettingId}/`);
    },
    FETCH_DEFAULT_PROFILE(defaultProfileId){
        return axios.get(`/api/defaults-profiles/${defaultProfileId}/`);
    }
};

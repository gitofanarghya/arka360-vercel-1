import axios from 'axios';

export default {

    POST_DESIGN_VERSION(postData) {
        return axios.post('/api/design-versions/', postData);
    },

    PATCH_DESIGN_VERSION_SCENE(designVersionId, [patchData, isDesignChanged]) {
        return axios.patch(`/api/design-versions/${designVersionId}/?clear_cache=${isDesignChanged}`, patchData);
    },

    PATCH_STUDIO_IMAGE_ID(versionId, patchData) {
        return axios.patch(`api/design-versions/${versionId}/`, patchData);
    },
    FETCH_IMAGES_FOR_REPORT(versionId,patchData){
        return axios.post(`api/design-versions/${versionId}/stage_report/`, patchData);
    },
    CACHE_REPORT_IMAGES(versionId,patchData){
        return axios.post(`api/design-versions/${versionId}/save_report_files/`, patchData);
    }
};

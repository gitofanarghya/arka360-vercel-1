import axios from 'axios';

export default {

    DOWNLOAD_GOOGLE_DOC (referenceId) {
        return axios.get(`report/google-docs?reference_id=${referenceId}&template=solar_labs`);
    },
    STAGE_REPORT(referenceId, payload) {
       return axios.post(`/api/design-versions/${referenceId}/stage_report/`, payload);
    },
    SAVE_REPORT(referenceId, payload) {
        return axios.post(`/api/design-versions/${referenceId}/save_report/`, payload);
    }
};

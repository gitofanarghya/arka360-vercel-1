import axios from 'axios';
export default {

    FETCH_DESIGN_VERSION_SCENE(referenceId) {
        return axios.get(`/api/design-version-scene/?reference_id=${referenceId}`);
    },
    FETCH_DESIGN_VERSION_METRICS(referenceId) {
        return axios.get(`/api/design-version-scene/roofview_data/?reference_id=${referenceId}`);
    },
};
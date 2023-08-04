import axios from 'axios';

export default {

    PATCH_MODELS(modelId, patchData) {
        return axios.patch(`/api/project-models/${modelId}/`, patchData);
    },
};

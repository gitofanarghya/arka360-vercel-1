import axios from 'axios';

export default {

    PATCH_TARGETS(targetId, patchData) {
        return axios.patch(`/api/project-targets/${targetId}/`, patchData);
    },

};

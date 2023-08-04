import axios from 'axios';

export default {

    UPDATE_BOQ_DATA(designId, patchData) {
        return axios.patch(`/api/design-version-summarys/${designId}/`, patchData);
    },
};

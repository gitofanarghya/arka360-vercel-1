import axios from "axios";

export default {
  PATCH_AHJ_INFORMATION(id, payLoad) {
    return axios.patch(`/api/projects/${id}/ahjregistry/`, payLoad);
  },
  FETCH_AHJ_INFORMATION(id) {
    return axios.get(`/api/projects/${id}/ahjregistry/`);
  },
};

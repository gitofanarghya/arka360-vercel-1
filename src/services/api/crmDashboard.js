import axios from "axios";

export default {
  FETCH_CRM_DASHBOARD_DATA(orgaisationId) {
    return axios.get(`/api/organisations/${orgaisationId}/dashboard/`);
  },
};

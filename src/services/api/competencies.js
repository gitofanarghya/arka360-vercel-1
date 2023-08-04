import axios from "axios";
export default {

  FETCH_COMPETENCY_DATA() {
    return axios.get(`/api/request-expert-services/all_competencies/`);
  },
};

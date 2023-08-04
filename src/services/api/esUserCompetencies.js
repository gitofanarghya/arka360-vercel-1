import axios from "axios";
export default {
  FETCH_ALL_COMPETENCIES() {
    return axios.get(`/api/competencies/`);
  },
}
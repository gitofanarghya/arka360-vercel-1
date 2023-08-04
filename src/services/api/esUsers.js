import axios from "axios";
export default {
  FETCH_ALL_USERS() {
    return axios.get(`/api/users/`);
  },
  FETCH_USER_DATA(id) {
    return axios.get(`/api/users/${id}/`);
  },
  UPDATE_USER_DATA(id, updateObject) {
    return axios.patch(`/api/users/${id}/`, updateObject);
  },
}
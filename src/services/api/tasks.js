import axios from "axios";

export default {
  FETCH_TASK_LIST(options) {
    return axios.get(`api/task/?${options}`);
  },
  UPDATE_TASK_LIST(id, data) {
    return axios.patch(`api/task/${id}/`, data);
  },
  FETCH_ALL_LEAD_LIST() {
    return axios.get(`api/task/lead_list/`);
  },
  SEARCH_ALL_TASK_KANBAN(query, stage) {
    return axios.get(`/api/task/?stage=${stage}&query=${query}`);
  },
  CREATE_TASK(task) {
    return axios.post("api/task/", task);
  },
  LOAD_MORE_LEADS(url) {
    return axios.get(url);
  },
};

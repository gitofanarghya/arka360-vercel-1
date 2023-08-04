import axios from "axios";

export default {
  FETCH_ALL_INCENTIVES() {
    return axios.get("/api/incentives/");
  },
  FETCH_INCENTIVES() {
    return axios.get(`/api/incentives/?get_default_incentives=false`);
  },
  POST_NEW_INCENTIVE(postData) {
    return axios.post("/api/incentives/", postData);
  },
  DELETE_INCENTIVE(incentiveId) {
    return axios.delete(`/api/incentives/${incentiveId}/`);
  },
  LOAD_MORE_INCENTIVES(url) {
    return axios.get(`${url}`);
  },
  SEARCH_ALL_INCENTIVES(query) {
    return axios.get(`/api/incentives/?query=${query}`);
  },
  UPDATE_INCENTIVE(id, newData) {
    return axios.patch(`/api/incentives/${id}/`, newData);
  },
  FETCH_INCENTIVE_BY_ID(id) {
    return axios.get(`/api/incentives/${id}/`);
  },
  UPDATE_ADDED_INCENTIVE_LIST(newList, designId) {
    return axios.patch(`/api/designs/${designId}/incentives/`, newList);
  },
  SELECTED_INCENTIVE_LIST(designId) {
    return axios.get(`/api/designs/${designId}/`);
  },
  CHANGE_MODE(organisationId,updateMode) {
    return axios.patch(`/api/organisations/${organisationId}/`, updateMode);
  },
  GET_MODE(organisationId) {
    return axios.get(`/api/organisations/${organisationId}/`);
  },
  SELECT_MULTIPLE_INCENTIVES_FROM_EXPERT_SERVICE(postData){
    return axios.post(`api/incentives/get_multiple/`,postData);  
  }
};

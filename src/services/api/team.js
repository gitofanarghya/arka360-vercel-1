import axios from "axios";

export default {
  // My Team
  FETCH_ALL_TEAM_MEMBERS(query) {
    return axios.get(`/api/team-members/?query=${query}`);
  },

  FETCH_MORE_TEAM_MEMBERS(url) {
    return axios.get(url);
  },

  DELETE_A_MEMBER(id) {
    return axios.delete(`/api/team-members/${id}/`);
  },

  FETCH_MEMBER_DETAIL(id) {
    return axios.get(`/api/team-members/${id}/`);
  },

  DELETE_TEAM_MEMBER(id) {
    return axios.delete(`/api/team-members/${id}/`);
  },

  POST_MEMBER_DETAILS(data) {
    return axios.post(`/api/team-members/`, data);
  },

  DELETE_MANAGER(id) {
    return axios.delete(`/api/team-members/${id}/`);
  },
};

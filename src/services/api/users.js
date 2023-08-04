import axios from "axios";

export default {
  FETCH_USER(userId) {
    return axios.get(`/api/users/${userId}/`);
  },

  FETCH_ALL_USERS() {
    return axios.get("/api/users/");
  },

  FETCH_ALL_ADMINS() {
    return axios.get("/api/users/?is_manager_or_admin=true");
  },

  ADD_USER(data) {
    return axios.post("/api/users/", data);
  },

  SEARCH_USERS(query) {
    return axios.get(`/api/users/?query=${query}`);
  },

  SEARCH_ADMINS(query) {
    return axios.get(`/api/users/?is_manager_or_admin=true&query=${query}`);
  },

  LOAD_MORE_USERS(url) {
    return axios.get(url);
  },

  CHANGE_PASSWORD(postData) {
    return axios.patch("/api/user/change-password/", postData);
  },

  RESET_PASSWORD(postData) {
    return axios.post("/api/user/reset-password/", postData);
  },

  CONFIRM_RESET_PASSWORD(postData) {
    return axios.post("/api/user/reset-password/confirm/", postData);
  },

  TOKEN_STATUS(postData) {
    return axios.post("/api/user/reset-password/token-status/", postData);
  },

  PATCH_USER_DATA(userId, patchData) {
    return axios.patch(`/api/users/${userId}/`, patchData);
  },

  LOGIN(userData) {
    return axios.post("/api-token-auth/", userData);
  },
  LOGOUT(userData) {
    if (userData) {
      return axios.post("/api/user/logout/", userData);
    }
  },
  LOGOUTSESSION(user) {
    if (user) {
      const token = user.token;
      const headers = { Authorization: `TOKEN ${token}` };
      let config = {
        headers: { Authorization: `TOKEN ${token}` },
      };
      return axios.post("/api/user/logout/", config);
    }
  },

  FETCH_API_KEY() {
    return axios.get(`/api/integration-api/api-key/`);
  },
  GENERATE_API_KEY(body) {
    return axios.post(`/api/integration-api/api-key/`, body);
  },
  
  PLAN_PAYMENT_LINK(selectedPlan) {
    return axios.post("/api/subscription/subscription/", selectedPlan);
  },
  CANCEL_PLAN_SUBSCRIPTION() {
    return axios.get(`/api/subscription/subscription/delete/`);
  },
  USER_REGISTER(userData) {
    return axios.post("/api/user-register/", userData);
  },
  ORGANISATION_REGISTER(orgData) {
    return axios.post("/api/organisation-register/", orgData);
  },
};

import axios from "axios";

export default {
  FETCH_ALL_ADDERS_AND_DISCOUNTS() {
    return axios.get("/api/adders-discounts/");
  },
  FETCH_PERMISSION_ADDERS_AND_DISCOUNTS(orgId) {
    return axios.get(`/api/organisations/${orgId}/`);
  },
  LOAD_MORE_ADDERS(url) {
    return axios.get(url);
  },
  FETCH_ALL_SEARCHED_ADDERS_AND_DISCOUNTS(term) {
    let options = { params: { q: term } };
    return axios.get(`/api/adders-discounts/`, options);
  },
  FETCH_SEARCHED_ADDERS_AND_DISCOUNTS_ID(id) {
    return axios.get(`/api/adders-discounts/${id}/`);
  },
  INSERT_ADDERS_AND_DISCOUNTS_ID(data) {
    return axios.post(`/api/adders-discounts/`, data);
  },
  PATCH_PERMISSION_ADDERS_AND_DISCOUNTS(orgId, data) {
    return axios.patch(`/api/organisations/${orgId}/`, data);
  },
  PATCH_SEARCHED_ADDERS_AND_DISCOUNTS_ID(id, data) {
    return axios.patch(`/api/adders-discounts/${id}/`, data);
  },
  DELETE_SEARCHED_ADDERS_AND_DISCOUNTS_ID(id) {
    return axios.delete(`/api/adders-discounts/${id}/`);
  },
  FETCH_ALL_DESIGN_ADDERS_AND_DISCOUNTS(id) {
    return axios.get(`/api/designs/${id}/`);
  },
  POST_ALL_DESIGN_SUMMARY_DATA(data) {
    return axios.post("/api/design-adders-discounts/", data);
  },
  PATCH_DESIGN_ADDERS_AND_DISCOUNTS_ID(id, data) {
    return axios.patch(`/api/design-adders-discounts/${id}/`, data);
  },
  DELETE_DESIGN_ADDERS_AND_DISCOUNTS_ID(id) {
    return axios.delete(`/api/design-adders-discounts/${id}/`);
  },
  SORT_ADDERS_DISCOUNT_DATA(sort, type) {
    return axios.get(
      `/api/adders-discounts/?sort_by=${sort}&&order_by=${type}`
    );
  },
};

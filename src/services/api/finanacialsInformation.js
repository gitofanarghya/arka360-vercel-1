import axios from "axios";

export default {
  FETCH_PAYMENT_METHOAD_TYPE(reqObj) {
    return axios.get(`/api/financial/payment-methods/?${reqObj}`);
  },
  GET_DETAIL_OF_PAYMENT_METHOAD(paymentMethoadID){
    return axios.get(`/api/financial/payment-methods/${paymentMethoadID}/`);
  },
  UPDATE_PAYMENT_METHOAD(updateObj,paymentMethoadID){
    return axios.patch(`/api/financial/payment-methods/${paymentMethoadID}/`,updateObj);
  },
  CHANGE_MODE(organisationId,updateMode) {
    return axios.patch(`/api/organisations/${organisationId}/`, updateMode);
  },
  GET_MODE(organisationId) {
    return axios.get(`/api/organisations/${organisationId}/`);
  },
  POST_NEW_FINANCIAL(postData) {
    return axios.post("/api/financial/payment-methods/", postData);
  },
  DELETE_FINANCIAL(financialId) {
    return axios.delete(`/api/financial/payment-methods/${financialId}/`);
  },
  LOAD_MORE_FINANCIAL(url) {
    return axios.get(url);
  }
};

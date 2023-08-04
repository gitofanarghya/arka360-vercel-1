import axios from "axios";
export default {
  FETCH_DESIGN_ORDER_METHOAD(reqObj) {
    return axios.get(`/api/request-expert-services/?${reqObj}`);
  },
  FETCH_DESIGN_ORDER() {
    return axios.get(`/api/request-expert-services/`);
  },
  UPDATE_DESIGN_ORDER_METHOAD(id, patchData) {
    return axios.patch(`/api/request-expert-services/${id}/`, patchData);
  },
  FETCH_DESIGN_ORDER_BY_ID_METHOD(orderId) {
    return axios.get(`/api/request-expert-services/${orderId}/`);
  },
  FETCH_DESIGN_ORDER_USERS(reqObj) {
    return axios.get(`/api/users/?${reqObj}`);
  },
  LOAD_MORE_Leads(url) {
    return axios.get(url);
  },
  UNREAD_NOTIFICATIONS_UPDATE(patchData) {
    return axios.patch(`api/chat/messages/message_offset/`, patchData);
  },
};

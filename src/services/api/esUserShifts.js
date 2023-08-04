import axios from "axios";
export default {
  CREATE_SHIFT(postObj) {
    console.log(postObj);
    return axios.post(`/api/shifts/`, postObj);
  },
  DELETE_SHIFT(shift_id) {
    return axios.delete(`/api/shifts/${shift_id}/`);
  },
  UPDATE_SHIFT(shift_id, updatedObj) {
    return axios.patch(`/api/shifts/${shift_id}/`, updatedObj);
  },
  //   UPDATE_DESIGN_ORDER_METHOAD(id, patchData) {
  //     return axios.patch(`/api/request-expert-services/${id}/`, patchData);
  //   },
  FETCH_SHIFTS_DATA() {
    return axios.get(`/api/shifts/`);
  },
};

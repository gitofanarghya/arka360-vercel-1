import axios from "axios";
export default {
    FETCH_ORDER_METHOAD_TYPE(reqObj) {
        return axios.get(`/api/request-expert-services/?order_status=${reqObj}`);
    },
    LOAD_MORE_ORDER(url) {
        return axios.get(url);
    }
};
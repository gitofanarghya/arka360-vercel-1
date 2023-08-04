import axios from "axios";
export default {
    FETCH_SELF_DESIGN(postData,reqSelfDesign) {
        return axios.post(`api/projects/?self_design=${reqSelfDesign}`,postData);
    },
    CREATE_NEW_SELF_DESIGN(postData,reqSelfDesign) {
        return axios.post(`/api/designs/?self_design=${reqSelfDesign}`, postData);
    },
};
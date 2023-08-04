import axios from "axios";
export default {
    POST_OPTIMIZER(payLoad) {
        return axios.post(`/api/master-data/optimizers/get_optimizer_list/`, payLoad);
      },
};
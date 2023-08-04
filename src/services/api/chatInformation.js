import axios from "axios";

export default {
  FETCH_CHAT_MESSAGES(project_id) {    
    return axios.get(`/api/chat/messages/?project_id=${project_id}`);
  },
  FETCH_CHAT_MESSAGE(order_id) {    
    return axios.get(`/api/chat/messages/?order_id=${order_id}`);
  },
};

 
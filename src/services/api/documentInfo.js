import axios from "axios";

export default {
  POST_DOCUMENTS(payLoad) {
    return axios.post(`/api/documents/`, payLoad);
  },
  FETCH_DOCUMENTS_FROM_INSTALLER(projectid,uploaded_by,orderId) {
    if(!orderId){
    return axios.get(`/api/documents/?project=${projectid}&uploaded_by=${uploaded_by}`);
    }else{
      return axios.get(`/api/documents/?project=${projectid}&uploaded_by=${uploaded_by}&order=${orderId}`);
    }

  },
  FETCH_DOCUMENTS_FOR_CRM(projectId) {
    return axios.get(`api/documents/?project=${projectId}`)
  },
  FETCH_DOCUMENTS_FROM_DESIGNER(projectid,uploaded_by,orderId){
    if(!orderId){
    return axios.get(`/api/documents/?project=${projectid}&uploaded_by=${uploaded_by}`);
    }else{
      return axios.get(`/api/documents/?project=${projectid}&uploaded_by=${uploaded_by}&order=${orderId}`);
    }
  },
  DOWNLOAD_DOCUMENTS(payLoad) {
    return axios.post(`/api/documents/download/`,payLoad);
  },
  DELETE_DOCUMENTS(fileId) {
    return axios.delete(`api/documents/${fileId}/`);
  },
};

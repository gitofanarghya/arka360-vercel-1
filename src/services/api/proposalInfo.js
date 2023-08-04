import axios from "axios";

export default {
  // ACCEPT_AND_SIGNED(postData){
  //   return axios.post("/api/design-version-documents/", postData);
  // },
  // SENT_EMAIL_AFTER_SIGNED(design_version_ID){
  //   console.log("nice 2 inside");
  //   return axios.post(`/api/design-version-documents/${design_version_ID}/send_document_proposal_email/`);
  // },
  // IS_DOCUMENT_SIGNED_OR_NOT(reference_ID){
  //   return axios.get(`designs/${reference_ID}/document_accepted`);
  // },
  // NEW_VERSION(desing_ID){
  //   return axios.get(`api/designs/${desing_ID}/?new=true`);
   
  // }
  GET_PROPOSAL_DETAILS(reference_ID){
    return axios.get(`api/design-version-documents/${reference_ID}/`);
  },

  CREATE_PROPOSAL(postData){
    return axios.post("/api/design-version-documents/", postData);
  },

  ACCEPT_OR_REJECT_PROPOSAL(reference_ID, patchData) {
    return axios.patch(`api/design-version-documents/${reference_ID}/`, patchData)
  },
  DOCUMENT_PROPOSAL_HISTORY(design_id){
    return axios.get(`api/design-version-documents/${design_id}/history/`);
  },
  CRM_PROPOSAL_HISTORY(project_id){
    return axios.get(`/api/projects/${project_id}/proposal_history/`);
  },
  LOAD_MORE_REQUESTS(url) {
    return axios.get(url);
  },
  
};

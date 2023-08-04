import axios from 'axios';

export default { 

  FETCH_WEB_PROPOSAL_DATA(id) {
    return axios.get(`/api/designs/${id}/report_data/`);
    // return axios.get(`https://devapi.thesolarlabs.com:8004/api/designs/${id}/reportData`);
  },
  async TEST_POST_ACCEPTANCE_DATA(postData) {
    await axios.post(`api/designs/${this.stage.getDesignId()}/get_optimizer_list/`, postData);
  },

  FETCH_PROJECT_DESIGN_NAME(id) {
    return axios.get(`/api/designs/${id}/`);
  },

  FETCH_PROJECT(id) {
    if(id)
    return axios.get(`/api/projects/${id}/`);
  },
}
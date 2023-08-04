import axios from 'axios';

export default {

    FETCH_SITE_SURVEY_LINK() {
        return axios.get(`/api/site-survey/generate_link/`);
    },

    SHARE_SITE_SURVEY_LINK(postData) {
        return axios.post(`api/site-survey/send_link/`, postData);
    }

}
import axios from 'axios';

export default {

    async GET_FEATURES_STATUS() {
        const response =  await axios.get('/api/feature-status/');
        const user = JSON.parse(localStorage.getItem('user'));
        user.is_manual_stringing_enabled = response.data.results[0].is_manual_stringing_enabled;
        user.ac_cable_enabled = response.data.results[0].ac_cable_enabled;
        user.autocad_enabled = response.data.results[0].autocad_enabled;
        user.docs_export_enabled = response.data.results[0].docs_export_enabled;
        user.stl_export_enabled = response.data.results[0].stl_export_enabled;
        user.threeds_export_enabled = response.data.results[0].threeds_export_enabled;
        localStorage.setItem("user",JSON.stringify(user))
        return response;
    },
    
    POST_FEATURES_STATUS(postData) {
        return axios.post('/api/feature-status/', postData);
    },
};

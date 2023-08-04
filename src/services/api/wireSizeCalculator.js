import axios from 'axios';


export default {

    POST_CALCULATOR(postData) {
        
        return axios.post('/api/wiresizecalculator/', postData);
    },

    PATCH_CALCULATOR(patchData, id) {
       
        return axios.patch(`/api/wiresizecalculator/${id}/`, patchData);
    },

    GET_CALCULATOR(id) {
        
        return axios.get(`/api/wiresizecalculator/${id}/`);
    },

    GET_EXCEL(id) {
        return axios.get(`/api/designs/${id}/get_wire_size_excel_sheet/`);
    }



};
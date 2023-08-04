import axios from 'axios';
import { DATABASE_URL } from '../../constants';
let environment = import.meta.env.VITE_APP_ENVIRONMENT;
import API from "@/services/api/";

export default {

    async FETCH_GENERATION_NUMBERS(designId) {
        let bifacialResponse,is_bifacial_enabled;
        if(environment=='prod'){
            bifacialResponse = await API.DESIGNS.FETCH_BIFACIAL_INFO(designId);
            is_bifacial_enabled = bifacialResponse.data.is_bifacial_enabled;
        }
        if(environment=='prod' && is_bifacial_enabled ){
            return axios.get(`https://betaapi.thesolarlabs.com/api/designs/${designId}/generation_engine/`);  
        }
        return axios.get(DATABASE_URL + 'api/designs/' + designId + '/generation_engine/');
    },
    FETCH_PROBABILITY(designId) {
        return axios.get(DATABASE_URL + 'api/designs/' + designId + '/probabilty_distribution/');
    },

};

import axios from "axios";

export default{
    FETCH_AND_SET_SAS_TOKEN(){
        const postData = {
            "container":"threedvideos"
        }
       return  axios.post(`/api/documents/generate-sas-token`,postData);
    },

}
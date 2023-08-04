import axios from 'axios';

export default {

    PATCH_CONSUMPTION_DETAILS(consumptionId, patchData) {
        return axios.patch(`/api/project-consumption-details/${consumptionId}/`, patchData);
    },

    FETCH_CONSUMPTION_DETAILS(consumptionId) {
        return axios.patch(`/api/project-consumption-details/${consumptionId}/`);
    },

    FETCH_PROJECT_CONSUMPTION_CALCULATION(id){
        return axios.get(`/api/projects/${id}/project_consumption_calculation/`);
    },

    PATCH_PROJECT_CONSUMPTION_CALCULATION(id,postData){
        return axios.patch(`/api/projects/${id}/project_consumption_calculation/`,postData);
    },

    FETCH_UTILITY_PROVIDER(id, selectedTariffSource){
        if(id && selectedTariffSource)
        return axios.get(`/api/projects/${id}/utility_provider/?source=${selectedTariffSource}`);
    },
    SEARCH_UTILITY_PROVIDER(id, selectedTariffSource,query){
        if(id && selectedTariffSource)
        return axios.get(`/api/projects/${id}/utility_provider/?source=${selectedTariffSource}&query=${query}`);
    },
    FETCH_UTILITY_RATE_BY_LSEID(projectId, lseId, source){
        if(lseId){   //we dont want to call it for empty lseid
            if(source=='genability')
                return axios.get(`/api/projects/${projectId}/tariffs/?lseId=${lseId}&source=${source}`);
            else if(source='default'){
                return axios.get(`/api/projects/${projectId}/tariffs/?provider=${lseId}&source=${source}`);
            }
        }
    },
    FETCH_MORE_UTILITY_RATE_BY_LSEID(url){
        return axios.get(url);
    },
    LOAD_MORE_UTILITY_PROVIDERS(url){
        return axios.get(url);
    },
    FETCH_UTILITY_RATE_BY_SEARCH(projectId, lseId, query,source){
        if(source=='genability')
        return axios.get(`/api/projects/${projectId}/tariffs/?lseId=${lseId}&search=${query}`);  
        else if(source='default'){
            return axios.get(`/api/projects/${projectId}/tariffs/?provider=${lseId}&source=${source}&query=${query}`)
        }
    },
    UPDATE_TARRIF_DETAILS(id,patchData){
        return axios.patch(`/api/projects/${id}/tariffs/`,patchData);
    }

};

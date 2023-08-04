  import axios from "axios";

export default {
    UTILITY_PROVIDER_CRUD(operation, rateId = null, postData = null) {
      if(operation === 'Create' || operation === "Copy") {
        return axios.post(`/api/utility-provider/`, postData);
      } else if (operation === "Edit") {
        return axios.patch(`/api/utility-provider/${rateId}/`, postData);
      } else {
        return axios.get(`/api/utility-provider/`);
      }
    },   
    UTILITY_RATE_NAME_CRUD( operation, rateId = null, postData = null) {
      if(operation === "Create" || operation === "Copy"){
        return axios.post(`/api/utility-rate/`, postData);
      } else if(operation === "Edit"){
        return axios.patch(`/api/utility-rate/${rateId}/`, postData);
      } else {
        return axios.get(`/api/utility-rate/`);
      }
    },   
    TARIFF_CRUD(operation, tariffId = null, all = true, postData = null) {
      if(operation === 'Create' || operation === 'Copy') {
        return axios.post(`api/tariffs/`, postData);
      } else if(operation === "Edit") {
        return axios.patch(`api/tariffs/${tariffId}/`, postData);
      } else if(operation === "Delete"){
        return axios.delete(`api/tariffs/${tariffId}/`);
      } else {
        if(all){
          return axios.get(`api/tariffs/?all=${all}`);
        } else {
          return axios.get(`api/tariffs/`);
        }
      }
    },
    FETCH_SPECIFIC_TARIFF(provider_id, rate_id, project_id, source){
      if(source=='genability'){
        return axios.get(`/api/projects/${project_id}/get_tou/?source=${source}&lseId=${provider_id}&masterTariffId=${rate_id}`);
      }
      else if(source=='default'){
        // the  rate_id which I am getting is the tariff id as it got changed later but I am not changing the soo many variable names
        return axios.get(`/api/projects/${project_id}/get_tou/?source=${source}&tariff=${rate_id}`);
      }
    },

    SEARCH_TARIFF(searchQuery, all=false){
      if(all){
        return axios.get(`/api/tariffs/?all=${all}&query=${searchQuery}`);
      }
      else{
        return axios.get(`/api/tariffs/?query=${searchQuery}`);
      }
    },

    SEARCH_UTILITY_PROVIDER(searchQuery){
        return axios.get(`/api/utility-provider/?query=${searchQuery}`);
    },

    LOAD_MORE_TARIFF(url) {
      return axios.get(url);
    },

    LOAD_MORE_UTILITY_PROVIDER(url) {
      return axios.get(url);
    },

    FETCH_RATES_FOR_PROVIDER(providerId){
      return axios.get(`/api/utility-rate/get_rate_for_provider/?provider=${providerId}`);
    }
};
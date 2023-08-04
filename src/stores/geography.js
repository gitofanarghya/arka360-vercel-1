import { defineStore } from 'pinia'
import API from '../services/api';

export const useGeographyStore = defineStore('geography', {
    state: () => {
        return {
            countryData: [],
        }
    },
    getters: {
        GET_COUNTRY_DETAILS: state => state.countryData,
    },
    actions: {
        async FETCH_COUNTRY_DETAILS() {
            const countryDetail = JSON.parse(localStorage.getItem("all_country_details"))
            if(!countryDetail){
                const response = await API.MASTER_DATA_COUNTRY.FETCH_COUNTRY_DETAILS();
                localStorage.setItem('all_country_details', JSON.stringify(response.data));
                this.countryData = [...response.data];
            }
            else{
                this.countryData = [...countryDetail];
            }
        },
    }
})
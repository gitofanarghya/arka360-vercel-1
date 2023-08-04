import { defineStore } from 'pinia'
import API from '../services/api';

export const useCreditsStore = defineStore('credits', {
    state: () => {
        return {
            purchased_credits: 0,
            promotional_credits: 0,
        }
    },
    getters: {
        GET_CREDIT_BALANCE: state => state,
    },
    actions: {
        async FETCH_AND_UPDATE_CREDIT_BALANCE() {
            const response = await API.CREDITS.FETCH_CREDIT_BALANCE();
            this.SET_CREDIT_BALANCE(response.data);
        },

        UPDATE_CREDIT_BALANCE(creditData) {
            this.SET_CREDIT_BALANCE(creditData);
        },

        SET_CREDIT_BALANCE (credits) {
            this.purchased_credits = credits.purchased_credits;
            this.promotional_credits = credits.promotional_credits; 
        },
    },
})
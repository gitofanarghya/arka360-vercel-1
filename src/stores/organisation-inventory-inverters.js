import API from '@/services/api/';
import { defineStore } from 'pinia'

export const useOrgInventoryInvertersStore = defineStore('orgInventoryInverters', {
    state: () => {
        return {
            inverters: [],
            nextURL: null,
        }
    },
    getters: {
        GET_ORGANISATION_INVERTERS: state => state.inverters,
    },
    actions: {

        async FETCH_ORGANISATION_INVERTERS() {

            // MAKE AN API CALL AND SET
            try {
                const response = await API.ORGANISATION_INVERTERS.FETCH_ORGANISATION_INVERTERS();

                const organisationPanelInventory = response.data.results;
                const nextURL = response.next;
                this.SET_ORGANISATION_INVERTERS(organisationPanelInventory, nextURL);
            }
            catch (e) {
                console.error(e);
            }
        },

        async LOAD_MORE_ORGANISATION_INVERTERS() {
            try {
                const response = await API.ORGANISATION_INVERTERS.LOAD_MORE_ORGANISATION_INVERTERS(this.nextURL);
                const organisationInverterInventory = response.data.results;
                const nextURL = response.data.next;
                this.SET_ORGANISATION_INVERTERS(organisationInverterInventory, nextURL);
            }
            catch (e) {
                console.error(e);
            }
        },

        async ADD_ORGANISATION_INVERTER({ payload }) {
            // MAKE AN API CALL AND SET
            try {
                await API.ORGANISATION_INVERTERS.ADD_ORGANISATION_INVERTERS(payload);
                this.FETCH_ORGANISATION_INVERTERS();
            }
            catch (e) {
                console.error(e);
            }
        },

        async DELETE_ORGANISATION_INVERTER({ payload }) {
            // MAKE AN API CALL AND SET
            try {
                await API.ORGANISATION_INVERTERS.DELETE_ORGANISATION_INVERTERS(payload);
                this.FETCH_ORGANISATION_INVERTERS();
            }
            catch (e) {
                console.error(e);
            }
        },

        SET_ORGANISATION_INVERTERS(inverters, next) {
            this.inverters = [...inverters];
            this.nextURL = next;
        },
    },
});

import API from '@/services/api/';
import { defineStore } from 'pinia'

export const useOrgInventoryPanelsStore = defineStore('orgInventoryPanels', {
    state: () => {
        return {
            panels: [],
            nextURL: null,
        }
    },
    getters: {
        GET_ORGANISATION_PANELS: state => state.panels,
    },
    actions: {

        async FETCH_ORGANISATION_PANELS() {

            // MAKE AN API CALL AND SET
            try {
                const response = await API.ORGANISATION_PANELS.FETCH_ORGANISATION_PANELS();
                const organisationPanelInventory = response.data.results;
                const nextURL = response.next;
                this.SET_ORGANISATION_PANELS(organisationPanelInventory, nextURL);
            }
            catch (e) {
                console.error(e);
            }
        },

        async LOAD_MORE_ORGANISATION_PANELS() {
            try {
                const response = await API.ORGANISATION_PANELS.LOAD_MORE_ORGANISATION_PANELS(this.nextURL);
                const organisationPanelInventory = response.data.results;
                const nextURL = response.data.next;
                this.SET_ORGANISATION_PANELS(organisationPanelInventory, nextURL);
            }
            catch (e) {

            }
        },

        async ADD_ORGANISATION_PANEL({ payload }) {

            // MAKE AN API CALL AND SET
            try {
                await API.ORGANISATION_PANELS.ADD_ORGANISATION_PANELS(payload);
                this.FETCH_ORGANISATION_PANELS();
            }
            catch (e) {
                console.error(e);
            }
        },

        async DELETE_ORGANISATION_PANEL({ payload }) {
            // MAKE AN API CALL AND SET
            try {
                await API.ORGANISATION_PANELS.DELETE_ORGANISATION_PANELS(payload);
                this.FETCH_ORGANISATION_PANELS();
            }
            catch (e) {
                console.error(e);
            }
        },

        SET_ORGANISATION_PANELS(panels, next) {
            this.panels = [...panels];
            this.nextURL = next;
        },
    },
});
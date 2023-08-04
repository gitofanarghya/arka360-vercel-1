import API from '@/services/api/';
import { defineStore } from 'pinia'

export const useOrgInventoryBOQStore = defineStore('orgInventoryBOQ', {
    state: () => {
        return {
            BOQ: {},
            organisationId: null,
        }
    },
    getters: {
        GET_ORGANISATION_BOQ_INVENTORY: state => state.BOQ,
    },
    actions: {
        async FETCH_ORGANISATION_BOQ() {
            const response = await API.ORGANISATION_BOQ.FETCH_ORGANISATION_BOQ({ organisation: this.organisationId });
            const organisationBOQ = response.data;
            this.SET_ORGANISATION_BOQ(organisationBOQ);
        },
        async UPDATE_ORGANISATION_BOQ(categoryMake) {
            const { id, ...payload } = { ...categoryMake };
            payload.organisation = this.organisationId;
            await API.ORGANISATION_BOQ.UPDATE_ORGANISATION_BOQ(id, payload);
            this.FETCH_ORGANISATION_BOQ();
        },
        async DELETE_ORGANISATION_BOQ(categoryId) {
            const payload = {
                organisation: this.organisationId,
            };
            await API.ORGANISATION_BOQ.DELETE_ORGANISATION_BOQ(categoryId, payload);
            this.FETCH_ORGANISATION_BOQ();
        },
        async ADD_ORGANISATION_BOQ(newBOQRowDetails) {
            const payload = { ...newBOQRowDetails };
            payload.organisation = this.organisationId;
            await API.ORGANISATION_BOQ.ADD_ORGANISATION_BOQ(payload);
            await this.FETCH_ORGANISATION_BOQ();
        },
        SET_ORGANISATION_BOQ(payload) {
            this.BOQ = payload;
        },
        SET_ORGANISATION_ID() {
            const user = JSON.parse(localStorage.getItem('user'));
            this.organisationId = user.organisation_id;
        },
    },
});
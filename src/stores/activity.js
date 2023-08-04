import { defineStore } from 'pinia';

export const useActivityStore = defineStore('activity', {
    state: () => {
        return {
            activityData: [],
        }
    },
    getters: {
        GET_ACTIVITY_DETAILS: state => state.activityData,
    },
    actions: {
        async SET_ACTIVITY_DETAILS(payload) {
            this.activityData = payload;
        }
    }
})
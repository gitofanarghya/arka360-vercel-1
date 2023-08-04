import { defineStore } from 'pinia';

export const useReminderStore = defineStore('reminder', {
    state: () => {
        return {
            reminderData: [],
        }
    },
    getters: {
        GET_REMINDER_DETAILS: state => state.reminderData,
    },
    actions: {
        async SET_REMINDER_DETAILS(payload) {
            this.reminderData = payload;
        }
    }
})
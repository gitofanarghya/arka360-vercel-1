import { defineStore } from 'pinia';

export const useDrawerStack = defineStore('drawerStack', {
    state: () => {
        return {
            drawerStack: [],
        }
    },
    getters: {
        GET_DRAWER_STACK: state => state.drawerStack,
    },
    actions: {
        PUSH_DRAWER(payload) {
            this.drawerStack.push(payload);
        },
        POP_DRAWER() {
            this.drawerStack.pop();
        }
    }
})
import Vue from 'vue';
import { createPinia, PiniaVuePlugin } from 'pinia'

const pinia = createPinia()

Vue.use(PiniaVuePlugin)
Vue.use(pinia)
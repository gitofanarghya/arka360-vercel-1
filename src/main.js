import Vue from "vue";
import InfiniteLoading from "vue-infinite-loading";
import VueStatic from "vue-static";
import Vue2TouchEvents from "vue2-touch-events";
import "./stores/index";
import { store } from "./store";
import router from "./router";
import Vuebar from "vuebar";
import "./registerServiceWorker";
//import * as Sentry from '@sentry/browser';
// import * as Integrations from '@sentry/integrations';
import { PRODUCTION_ENV } from "./constants";
import InputLength from "./components/ui/length/inputLength.vue";
import InputLengthOS from "./components/ui/length/inputLengthOutsideStudio.vue";
import DisplayLength from "./components/ui/length/displayLength.vue";
import VueConfirmDialog from "vue-confirm-dialog";
import "vue-tel-input/dist/vue-tel-input.css";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";
import VueToastr from "vue-toastr";
import "./styles/main.css";
import AddCreditPopup from "./components/ui/AddCreditPopup.vue";
import GenericPayNowPopup from "./components/ui/GenericPayNowPopup.vue";
import ProjectUpgradePopup from "./components/ui/ProjectUpgradePopup.vue";
import SelfDesignPopup from "./components/ui/SelfDesignPopup.vue";
import App from "./App.vue";
import AllDrawer from "./pages/commonComponents/allDrawer/allDrawer.vue";

import _ from "lodash";
window._ = _;

window.global ||= window;

if (PRODUCTION_ENV) {
  // Sentry.init({
  //     dsn: 'https://3df605c981b0460b85f127d124b5df2a@sentry.io/1487393',
  //     integrations: [new Integrations.Vue({Vue, attachProps: true})],
  // });
}

// Modified modules
import "./plugins/mousetrap";
import "./plugins/element-ui/element";
import "./plugins/vee-validate";
import "./registerServiceWorker";

export const serverBus = new Vue();
if (!Vue.prototype.$eventBus) {
  Object.defineProperty(Vue.prototype, "$eventBus", { value: serverBus });
}
Vue.config.productionTip = false;
// Making modules available to vue
Vue.use(Vuebar);
Vue.use(VueToastr);
Vue.use(VueConfirmDialog);
Vue.component("vue-confirm-dialog", VueConfirmDialog.default);
Vue.use(InfiniteLoading, {
  system: {
    throttleLimit: 500,
  },
});
Vue.use(VueStatic, {
  name: "nonReactiveData",
});

Vue.use(Vue2TouchEvents);

Vue.component("input-length", InputLength);
Vue.component("input-length-os", InputLengthOS);
Vue.component("display-length", DisplayLength);
Vue.component("add-credit-popup", AddCreditPopup);
Vue.component("generic-pay-now-popup", GenericPayNowPopup);
Vue.component("project-upgrade-popup", ProjectUpgradePopup);
Vue.component("self-design-popup", SelfDesignPopup);
Vue.component("all-drawer", AllDrawer);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

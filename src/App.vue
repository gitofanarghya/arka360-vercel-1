<template>
  <div id="app">
    <router-view />
    <!-- <div id="ps-loading-background" class="ps-loading-background"></div>
        <div id="ps-loading-container" class="ps-loading-container">
            <div id="ps-loader"></div>
        </div> -->
  </div>
</template>
<script>
import API from "@/services/api/";
import { SL360_URL, COOKIE_IDENTIFIER_FOR_ARKA } from "./constants";
import { getCookie } from "@/utils.js";
import { mapActions } from "pinia";
import { useAuthStore } from "./stores/auth";
import { useIntegrationStore } from "./stores/integration";
import { initializeStore } from "./utils";
import {
  initializeUnsignedIntercom,
  initializeSignedIntercom,
  setIntercomStudioStyle,
} from "./plugins/intercom";

export default {
  name: "App",
  async created() {
    API.SET_AXIOS_RESPONSE_HANDLER();
    API.SET_DATABASE_URL();
    if (
      !(
        window.location.pathname.includes("stage-report") ||
        window.location.pathname.includes("stage") ||
        window.location.pathname.includes("media")
      )
    ) {
      await this.setTokenStoreAndIntercom();
    }
    document.body.style.height = `${window.innerHeight}px`;
    window.onresize = () => {
      document.body.style.height = `${window.innerHeight}px`;
    };
    this.setProjectDataFromSessionStorage();
  },
  methods: {
    ...mapActions(useAuthStore, ["LOGOUT"]),
    ...mapActions(useIntegrationStore, {
      setProjectDataFromSessionStorage: "SET_PROJECTDATA_FROM_SESSION_STORAGE",
    }),
    getUserSessionInformation() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user;
    },
    isTokenValid(token) {
      if (token) return true;
      return false;
    },
    setAppRoute(routeName) {
      this.$router.push({ name: routeName });
    },
    async setTokenStoreAndIntercom() {
      const currentRoute = this.$route;

      // For 360 users #ArkaLoginFlow
      // Check if tsl cookie exists, and logout if they don't exist
      // WARNING: ALWAYS MAKE SURE YOU TEST THE LOGIN FLOW THOROUGHLY WHEN YOU CHANGE THIS CODE.
      // THIS PART OF THE CODE LOGS OUT THE USER UNDER CERTAIN CONDITIONS
      // AND CAN SEVERELY AFFECT THE USER EXPERIENCE.
      let userSessionInformation = this.getUserSessionInformation();
      let isTokenValid = this.isTokenValid(userSessionInformation.token);
      let sl360UserCondition = userSessionInformation.is_sl_360_user;
      if (sl360UserCondition) {
        // let arkaCookie = getCookie('arka')
        let tslCookie = getCookie("tsl" + COOKIE_IDENTIFIER_FOR_ARKA);

        if (!tslCookie) {
          if (isTokenValid) {
            console.log(`YOU ARE AN SL360 USER AND THERE ARE NO COOKIES.
                        SO YOU HAVE BEEN LOGGED OUT.`);
            await this.LOGOUT();
          }
        }
      }

      // #ArkaLoginFlow
      userSessionInformation = this.getUserSessionInformation();
      isTokenValid = this.isTokenValid(userSessionInformation.token);
      if (isTokenValid) {
        API.SET_TOKEN_HEADER(userSessionInformation.token);
        if (currentRoute.name === "arkaLogin") {
          const user = JSON.parse(localStorage.getItem("user"));
          window.location.href = `${SL360_URL}sso/tsl/?token=${userSessionInformation.token}&user_id=${user.user_id}`;
          return;
        }
        initializeStore();
        initializeSignedIntercom(userSessionInformation.email);
      } else if (
        currentRoute.meta.requiresAuth &&
        !(
          currentRoute.name === "waareeLogin" ||
          currentRoute.name === "resetPassword"
        )
      ) {
        this.setAppRoute("login");
        initializeUnsignedIntercom();
      } else if (
        currentRoute.name !== "DesignOverview" &&
        currentRoute.name !== "ReportStage" &&
        currentRoute.name !== "error"
      ) {
        initializeUnsignedIntercom();
      }
    },
  },
};
</script>

<style>
@import "./assets/iconFonts/navBar/styles.css";
@import "./assets/iconFonts/leftSideBar/left-side-bar.css";
@import "./assets/iconFonts/home/home.css";

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@font-face {
  font-family: Helvetica Neue;
  src: url(./assets/font/HelveticaNeue.otf);
}

body {
  font-family: "Helvetica Neue";
  width: 100%;
  padding: 0px;
  margin: 0px;
}

.el-popover {
  padding: 0 !important;
  border: 1px solid #141414 !important;
  z-index: 10000 !important;
}
.el-popover.panelSummaryPopoverLight {
  border: 1px solid #f8f8f8 !important;
}

.el-popper[x-placement^="right"] .popper__arrow {
  border-right-color: #141414 !important;
}

#app {
  height: 100%;
  position: relative;
}
#ps-loading-background {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  opacity: 0.5;
  background-color: #000000;
  z-index: 9995;
  overflow: hidden;
}
.ps-loading-background.hide {
  display: none;
}
#ps-loading-container {
  position: absolute;
  box-sizing: border-box;
  top: 0;
  left: 0;
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
  width: 100vw;
  min-width: 100vw;
  max-width: 100vw;
  /* background-color: #000000; */
  /* opacity: 0.5; */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  pointer-events: none;
}
.ps-loading-container.hide {
  display: none;
}
#ps-loader {
  border: 10px solid #f3f3f3;
  border-radius: 50%;
  border-top: 10px solid #409eff;
  width: 70px;
  height: 70px;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

<style lang="scss">
// These are global css needs to available across the app
//  classes which are appended to body can't be made scoped
@import "./styles/components/notification";
@import "./styles/components/switch";
@import "./styles/components/select";
@import "./styles/components/radio";
@import "./styles/components/dialog";
@import "./styles/components/checkbox";
</style>

<style>
::-webkit-scrollbar {
  width: 5px;
  border-radius: 4px;
}

/* Track */

::-webkit-scrollbar-track {
  background: inherit;
}

/* Handle */

::-webkit-scrollbar-thumb {
  background: #cccccc;
  border: 4px solid transparent;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb:hover {
  background: #cccccc !important;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>

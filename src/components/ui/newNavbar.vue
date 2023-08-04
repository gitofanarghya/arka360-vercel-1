<template>
  <header class="header">
    <div class="header_left_section">
      <div
        :class="[
          { open: isSidebarVisible },
          'humburger',
          isCrmUser() ? 'humburgerCRM' : '',
        ]"
        @click="toggleSidebar"
      >
        <div class="icon-left"></div>
        <div class="icon-right"></div>
      </div>
      <div>
        <router-link
          :class="['logo', isCrmUser() ? 'logoCRM' : '']"
          :to="{ name: 'home' }"
        >
          <img
            :src="arkaEnergyLogo"
            alt="Panelicon"
            :class="isCrmUser() ? 'logoForCRM' : 'imgLogo'"
          />
          <span
            class="app-version-text"
            :class="{ 'app-version-text-show': environment == 'dev' }"
            >{{ APP_VERSION }}</span
          >
          <!-- <img style = "max-height: 100px;" v-show="!!organisation_logo" :src="organisation_logo" alt="Solar" /> -->
        </router-link>
      </div>
    </div>
    <div class="header_right_section">
      <router-link
        :to="{ name: 'credits' }"
        class="credit_button_wrapper"
        v-if="!isCrmUser()"
      >
        <div class="credit_button_text">
          <div>Credit Balance:</div>
          <div class="credit_balance" style="">{{ totalCredits }}</div>
        </div>
        <div class="arrow_icon">
          <img
            src="../../assets/img/Group 2019.svg"
            alt="view tranaction history"
          />
        </div>
      </router-link>
      <div>
        <a href="javascript:void(0);" class="sub_logo">
          <img
            v-show="!!organisation_logo"
            :src="organisation_logo"
            alt="Solar"
          />
        </a>
      </div>
    </div>
  </header>
</template>

<script>
import { isCrmUser } from "../../utils";
import { fetchOrganisationDetails } from "@/utils.js";
import { fetchUserDetails } from "@/utils.js";
import { mapState } from "pinia";
import { useCreditsStore } from "../../stores/credits";
import { formatNumberWithCommas } from "@/utils.js";
import { APP_VERSION } from "../../constants";
import solarLabsLogo from "../../assets/drop/70cdd171-53f.png";
import { fetchArkaEnergyLogo } from "@/pages/utils/utils.js";
import { useRootStore } from "../../stores/root";
import { environment } from "../../constants";
export default {
  data() {
    return {
      arkaEnergyLogo: fetchArkaEnergyLogo(),
      solarLabsLogo: solarLabsLogo,
      isSidebarOpen: false,
      organisation_logo: null,
      APP_VERSION,
      environment,
    };
  },
  computed: {
    ...mapState(useCreditsStore, {
      credits: "GET_CREDIT_BALANCE",
    }),
    totalCredits() {
      let total =
        this.credits.purchased_credits + this.credits.promotional_credits;
      return formatNumberWithCommas(total);
    },
    isSidebarVisible() {
      return useRootStore().sidebarStatus;
    },
    flagForUS() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
  },
  methods: {
    isCrmUser,
    toggleSidebar() {
      useRootStore().toggleSidebar();
    },
    async getOrgLogo() {
      let organisationData =
        JSON.parse(localStorage.getItem("organisation")) || {};
      let img = new Image();
      try {
        // If existing logo url works, use that
        img.src = organisationData.logo;
        let prom = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        await prom;
        this.organisation_logo = organisationData.logo;
      } catch {
        // If not, fetch new url
        organisationData = await fetchOrganisationDetails();
        this.organisation_logo = organisationData.logo;
      }
    },
    async getOrgLogoForUS() {
      let userData = JSON.parse(localStorage.getItem("user")) || {};
      let img = new Image();
      try {
        // If existing logo url works, use that
        img.src = userData.logo;
        let prom = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        await prom;
        this.organisation_logo = userData.logo;
      } catch {
        // If not, fetch new url
        userData = await fetchUserDetails();
        this.organisation_logo = userData.logo;
        if (!userData.logo) {
          this.getOrgLogo();
        }
      }
    },
  },
  mounted() {
    // recieving event if the user has changed the logo in organisation summary and updating
    // here as Local Storage is not reactive
    window.addEventListener("user-logo-changed", (event) => {
      this.organisation_logo = event.detail.storage;
    });
    if (this.flagForUS) this.getOrgLogoForUS();
    else this.getOrgLogo();
  },
};
</script>
<style type="text/css" scoped>
.app-version-text {
  display: none;
  opacity: 0;
}

.app-version-text-show {
  display: unset;
  opacity: unset;
}

.header_left_section {
  display: flex;
  align-items: center;
}

.header_right_section {
  display: flex;
  align-items: center;
  column-gap: 2rem;
}

.credit_button_wrapper {
  padding: 0.6rem;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 1rem;
  cursor: pointer;
}

.credit_button_text {
  font-size: 14px;
  color: #1c3366;
  display: flex;
  row-gap: 0.4rem;
  flex-direction: column;
}

.credit_button_text .credit_balance {
  font-size: 16px;
  font-weight: 600;
}

.credit_button_wrapper .arrow_icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

* {
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font);
}

.header {
  display: flex;
  padding: 0 32px 0 24px;
  min-height: 100px;
  border-bottom: 1px solid var(--step-100);
  background: var(--white);
  position: sticky;
  top: 0;
  z-index: 432;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 767px) {
  .header {
    padding: 0 24px;
    justify-content: space-between;
  }
  .header {
    min-height: 80px;
  }
  .header_right_section {
    column-gap: 0rem;
  }
}
.header .humburger {
  margin-right: 12px;
}
@media (min-width: 1281px) {
  .header .humburger {
    display: none;
  }
  .header .humburgerCRM {
    display: block;
  }
}
.header a {
  display: inline-flex;
  align-items: center;
}
.header a.sub_logo {
  margin-left: auto;
}
@media (max-width: 767px) {
  .header a.sub_logo {
    display: none;
  }
}
.header a.sub_logo img {
  max-width: 190px;
  max-height: 100px;
  padding: 16px 0px;
}
.header a.logo {
  padding: 0 16px 0 0;
  display: flex;
  min-height: 100px;
  align-items: center;
  height: 100%;
}

.header a.logoCRM {
  border-right: none !important;
}
@media (min-width: 1281px) {
  .header a.logo {
    /* border-right: 1px solid var(--step-100); */
    min-width: 236px;
  }
}
@media (max-width: 1280px) {
  .header a.logo {
    min-height: 56px;
  }
}
.imgLogo {
  max-width: 200px;
  max-height: 65px;
  margin: auto;
}
.logoForCRM {
  max-width: 160px !important;
  max-height: 65px;
  margin: auto auto auto 16px;
}
@media (max-width: 1280px) {
  .imgLogo {
    max-width: 200px;
    max-height: 65px;
    margin-left: 0px;
  }
  .logoForCRM {
    max-width: 160px !important;
    max-height: 65px;
    margin: 0px;
  }
}
@media (max-width: 767px) {
  .header a.logo {
    display: none;
  }
}
.humburger {
  position: relative;
  width: 22px;
  height: 22px;
}
.humburger .icon-left {
  transition-duration: 0.5s;
  position: absolute;
  height: 3px;
  width: 10px;
  top: 10px;
  background-color: var(--step-200);
}
.humburger .icon-left:before {
  transition-duration: 0.5s;
  position: absolute;
  width: 10px;
  height: 3px;
  background-color: var(--step-200);
  content: "";
  top: -8px;
}
.humburger .icon-left:after {
  transition-duration: 0.5s;
  position: absolute;
  width: 10px;
  height: 3px;
  background-color: var(--step-200);
  content: "";
  top: 8px;
}
.humburger .icon-left:hover {
  cursor: pointer;
}
.humburger .icon-right {
  transition-duration: 0.5s;
  position: absolute;
  height: 3px;
  width: 10px;
  top: 10px;
  background-color: var(--step-200);
  left: 10px;
}
.humburger .icon-right:before {
  transition-duration: 0.5s;
  position: absolute;
  width: 10px;
  height: 3px;
  background-color: var(--step-200);
  content: "";
  top: -8px;
}
.humburger .icon-right:after {
  transition-duration: 0.5s;
  position: absolute;
  width: 10px;
  height: 3px;
  background-color: var(--step-200);
  content: "";
  top: 8px;
}
.humburger.open .icon-left {
  transition-duration: 0.5s;
  background: transparent;
}
.humburger.open .icon-left:before {
  transform: rotateZ(45deg) scaleX(1.2) translate(2px, 2px);
}
.humburger.open .icon-left:after {
  transform: rotateZ(-45deg) scaleX(1.2) translate(2px, -2px);
}
.humburger.open .icon-right {
  transition-duration: 0.5s;
  background: transparent;
}
.humburger.open .icon-right:before {
  transform: rotateZ(-45deg) scaleX(1.4) translate(-2px, 2px);
}
.humburger.open .icon-right:after {
  transform: rotateZ(45deg) scaleX(1.4) translate(-2px, -2px);
}
.humburger:hover {
  cursor: pointer;
}

@media (max-width: 1280px) {
  .header .humburger {
    display: block !important;
  }

  .logo {
    border: none !important;
  }
}
</style>

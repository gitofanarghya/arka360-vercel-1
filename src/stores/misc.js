import { defineStore } from "pinia";
import { alignIntercom, alignIntercomNormal } from "../plugins/intercom";
export const useMiscStore = defineStore("misc", {
  state: () => {
    return {
      workingDays: null,
      googleMapsState: {
        address: "",
        coordinates: {},
        isLoadingAddressFromMarker: false,
        state: "",
        countryCode: JSON.parse(localStorage.getItem("organisation"))
          ?.country_code,
        // countryCode: 'IN',
        isAddressChosenByInput: false,
        postalCode: null,
      },
      leadDrawerOpen: {
        isGlobalDrawerOpen: false,
        isAllDrawerOpen: false,
        isleadsDrawerOpen: false,
      },
    };
  },
  getters: {
    GET_WORKING_DAYS: (state) => state.workingDays,
    GET_GOOGLE_MAPS_STATE: (state) => state.googleMapsState,
  },
  actions: {
    UPDATE_GOOGLE_MAPS_STATE(data) {
      Object.keys(data).forEach((key) => {
        this.googleMapsState[key] = data[key];
      });
    },
    INITIALIZE_COUNTRY_CODE(countryCode) {
      this.googleMapsState.countryCode = countryCode;
    },
    SET_WORKING_DAYS(noOfWorkingDays) {
      this.workingDays = noOfWorkingDays;
    },
    SET_DRAWER_STATE(drawer, isOpen) {
      if (drawer == "globalDrawer") {
        this.leadDrawerOpen.isGlobalDrawerOpen = isOpen;
      } else if (drawer == "allDrawer") {
        this.leadDrawerOpen.isAllDrawerOpen = isOpen;
      } else {
        this.leadDrawerOpen.isleadsDrawerOpen = isOpen;
      }

      if (
        !this.leadDrawerOpen.isGlobalDrawerOpen &&
        !this.leadDrawerOpen.isAllDrawerOpen &&
        !this.leadDrawerOpen.isleadsDrawerOpen
      ) {
        alignIntercomNormal();
      } else {
        alignIntercom();
      }
    },
  },
});

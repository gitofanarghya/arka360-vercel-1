<template>
  <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
    <div class="content_section">
      <div class="filter_section">
        <div class="title">Manage Financials</div>
        <div class="starred_action">
          <div class="toggle-button-cover" v-if="isAdmin">
            <h5>
              Allow users to create, edit & delete financials
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    If you turn on the toggle, your organization will be able to
                    edit, delete, and copy the financials
                  </p>
                </div>
              </div>
            </h5>
            <div class="toggle_btn">
              <el-switch
                v-model="isPermissionGiven"
                @change="changeToggle"
                :disabled="!isAdmin"
              ></el-switch>
            </div>
          </div>
        </div>
      </div>
      <div>
        <financialsContainer />
      </div>
    </div>
  </section>
</template>

<script>
import API from "@/services/api/";
import financialsContainer from "./financialsContainer.vue";
import { mapActions } from "pinia";
import { useGeographyStore } from "../../../stores/geography";
import { isCrmUser } from "../../../utils";


export default {
  components: {
    financialsContainer,
  },

  props: {
    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
  },
  watch: {},
  data() {
    return {
      isPermissionGiven: false,
      isAdmin: false,
    };
  },
  created() {
    this.fetchCountryDetails();
    this.getLocalStorage();
  },
  methods: {
    isCrmUser,
    ...mapActions(useGeographyStore, {
      fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
    }),
    changeToggle() {
      this.changeModes();
    },
    async changeModes() {
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      let postObj = {
        allow_adding_updating_payment_methods: this.isPermissionGiven,
      };
      const res = await API.INCENTIVE_INFORMATION.CHANGE_MODE(organisation_id,postObj);
      localStorage.setItem('organisation',JSON.stringify(res.data));
    },
    async prevValue() {
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      // const resp = await API.INCENTIVE_INFORMATION.GET_MODE(organisation_id);
      const responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      this.isPermissionGiven = responseData.allow_adding_updating_payment_methods;
    },
    getLocalStorage() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      //only admin can see the toggle button and can change the state of toggle button
      if (user.role == "ADMIN") {
        this.isAdmin = true;
        this.prevValue();
      } else {
        this.isAdmin = false;
      }
    },
  },
};
</script>

<style scoped>

.infiniteScrollLoader {
  font-size: 20px;
}
.favorite_section {
  border: none !important;
}

.right_section >>> .el-switch__core {
  height: 27px !important;
}

.right_section >>> .el-switch__core:after {
  top: 6px;
  width: 18px !important;
}

.right_section >>> .el-switch.is-checked .el-switch__core::after {
  left: 85% !important;
}

.right_section >>> .el-switch__core:after {
  left: 4px !important;
}

.main-controller .right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }

  .right_sectionCRM {
    width: calc(100% - 74px) !important;
  }
}
</style>

<template>
  <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
    <div class="content_section">
      <div class="filter_section">
        <div class="title">Manage Incentives</div>
        <div class="starred_action" v-if="isAdmin">
          <div class="toggle-button-cover">
            <h5>
              Allow users to create, edit & delete incentives
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                 If you turn on the toggle, your organization will be able to add, edit, and delete all the incentives. If you turn off the toggle, your organization will not be able to add, edit, and delete any of the incentives in this section.
                  </p>
                </div>
              </div>
            </h5>
            <div class="toggle_btn">
              <input type="checkbox" class="checkbox" v-model="adminMode" />
              <div class="knobs"></div>
              <div class="layer"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="favorite_section">
        <incentiveListView :adminMode="adminMode" />
      </div>
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import API from "@/services/api/";
import { ObserveVisibility } from "vue-observe-visibility";
import incentiveListView from "./incentiveListView.vue";
import { isCrmUser } from "../../../utils";


Vue.directive("observe-visibility", ObserveVisibility);

export default {
  components: {
    incentiveListView,
  },

  props: {
    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
  },
  watch: {
    adminMode: {
      handler(val) {
        this.changeModes();
      },
    },
  },
  data() {
    return {
      adminMode: true,
    };
  },
  created() {
    this.prevValue();
    console.log(this.getUserSessionInformation());
  },
  computed:{
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.role == "ADMIN") {
        return true;
      }
      return false;
    },
  },
  methods: {
    isCrmUser,
    getUserSessionInformation() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user;
    },
    async changeModes() {
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      let postObj = { allow_adding_updating_incentives: this.adminMode };
      const res = await API.INCENTIVE_INFORMATION.CHANGE_MODE(organisation_id,postObj);
      localStorage.setItem('organisation',JSON.stringify(res.data));
    },
    async prevValue() {
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      // const resp = await API.INCENTIVE_INFORMATION.GET_MODE(organisation_id);
      let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
      this.adminMode = responseData.allow_adding_updating_incentives;
      if(!Object.keys(responseData).length){
        responseData =( await API.INCENTIVE_INFORMATION.GET_MODE(organisation_id)).data;
        this.adminMode = responseData.allow_adding_updating_incentives;
      }
    },
  },
};
</script>

<style scoped>
/* @import url(../styles/styles.css); */

.infiniteScrollLoader {
  font-size: 20px;
}

@media (min-width: 1281px) {
.right_sectionCRM {
  width: calc(100% - 74px) !important;
  margin-left: auto;
}
}
</style>

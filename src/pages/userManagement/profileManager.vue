<template>
  <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
    <div class="content_section">
      <div class="filter_section">
        <div class="title">My Profile</div>
      </div>
      <div class="tabs_section">
        <ul class="tabs_list">
          <li :class="{ active: $route.name === 'profile' }">
            <router-link :to="{ name: 'profile' }">
              <span>Personal Details</span>
            </router-link>
          </li>
          <!-- <li v-if="hasPermission" :class="{ active: $route.name === 'team' }">
            <router-link :to="{ name: 'team' }">
              <span>My Team</span>
            </router-link>
          </li>
          <li @click="toggleChangePasswordPopup">
            <span>Change Password</span>
          </li> -->
        </ul>
      </div>
      <router-view></router-view>
      <!-- <ChangePassword
        v-if="toggleChangePassPopup"
        @toggleChangePass="toggleChangePasswordPopup"
      /> -->
    </div>
  </section>
</template>

<script>
import ChangePassword from "./components/changePassword.vue";
import { isCrmUser } from "../../utils";

export default {
  components: {
    ChangePassword,
  },
  data() {
    return {
      toggleChangePassPopup: false,
      toggleAddNewUserPopup: false,
      isAdmin: false,
      isManager: false,
    };
  },
  computed: {
    hasPermission() {
      return this.isAdmin || this.isManager;
    },
  },
  mounted() {
    this.isAdmin = JSON.parse(localStorage.getItem("user")).role === "ADMIN";
    this.isManager = JSON.parse(localStorage.getItem("user")).is_manager;
    if (this.$route.name === "team" && this.hasPermission) {
      this.changeComponent("team");
    } else {
      this.changeComponent("profile");
    }
  },
  methods: {
    isCrmUser,
    changeComponent(_component) {
      switch (_component) {
        case "profile":
          this.$router.push({ name: "profile" });
          break;
        case "team":
          this.$router.push({ name: "team" });
          break;
        default:
          break;
      }
    },
    toggleChangePasswordPopup() {
      this.toggleChangePassPopup = !this.toggleChangePassPopup;
    },
    addUserPopup() {
      this.toggleAddNewUserPopup = !this.toggleAddNewUserPopup;
    },
  },
};
</script>

<style scoped>

@media (min-width: 1281px) {
.main-container .right_section {
  width: calc(100% - 260px);
  margin-left: auto;
}

.main-container .right_sectionCRM {
  width: calc(100% - 74px);
  margin-left: auto;
}
}

</style>

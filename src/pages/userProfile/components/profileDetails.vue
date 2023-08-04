<template>
  <section class="right_section">
    <div class="content_section">
      <div class="breadcrumb">
        <ul class="breadcrumb_items">
          <li class="path" @click="$router.push({ name: 'team' })">
            <a>My Team</a>
          </li>
          <li class="current path">
            <a href="#">Member Name</a>
          </li>
        </ul>
      </div>
      <div class="filter_section">
        <div class="title">My Profile</div>
        <div class="head_btn_group">
          <!-- <button class="btn btn-outline">Manage Permissions</button> -->
          <button
            class="btn btn-outline"
            @click="deleteMember"
            v-if="hasPermission"
          >
            Delete Member
          </button>
        </div>
      </div>

      <div class="profile_controller">
        <div class="col_row">
          <div class="col col_left">
            <div class="card">
              <div class="profile_form">
                <div class="profile_icon">
                  <figure>
                    <img
                      v-if="userProfile.avatar"
                      :src="userProfile.avatar"
                      :alt="userProfile.firstName"
                    />
                    <img
                      v-else
                      src="../../userManagement/assets/img/pro_ico.png"
                      alt="Profile Name"
                    />
                    <span class="change_btn">
                      <i class="fas fa-camera"></i>
                      <input
                        type="file"
                        @change="uploadAvatar($event)"
                        :disabled="!hasPermission"
                      />
                    </span>
                  </figure>
                </div>
                <div class="floating-form">
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="userProfile.firstName"
                      :disabled="!hasPermission"
                    />
                    <label>First Name</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="userProfile.lastName"
                      :disabled="!hasPermission"
                    />
                    <label>Last Name</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="userProfile.email"
                      disabled
                    />
                    <label>Email Id</label>
                  </div>
                  <div class="floating-label">
                    <input
                      class="floating-input"
                      type="text"
                      v-model="userProfile.phoneNumber"
                      :disabled="!hasPermission"
                    />
                    <label>Mobile Number</label>
                  </div>
                  <div class="floating-label">
                    <el-select
                      v-model="userProfile.role"
                      ref="elSelect"
                      placeholder="Select role"
                      :disabled="!hasPermission"
                    >
                      <el-option
                        v-for="role in roleType"
                        :key="role.value"
                        :label="role.label"
                        :value="role.value"
                      ></el-option>
                    </el-select>
                    <label>Role</label>
                  </div>
                  <!-- <div class="api_field">
                    <a
                      class="new_api"
                      href="javascript:void(0)"
                      v-if="hasPermission"
                      @click="generateAPIKey"
                      >Generate New</a
                    >
                    <div class="floating-label">
                      <input
                        class="floating-input"
                        type="text"
                        disabled
                        :value="apiKey"
                      />
                      <label>API Key</label>
                    </div>
                  </div> -->
                  <div class="sumbmit_btn" v-if="hasPermission">
                    <input
                      class="btn btn-primary"
                      type="submit"
                      value="Save"
                      :disabled="!isSaveOrCancelEnabled"
                      @click="updateUserProfile"
                    />
                    <input
                      class="btn btn-secondary"
                      type="submit"
                      value="Cancel"
                      :disabled="!isSaveOrCancelEnabled"
                      @click="onUserProfileCancel"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col col_right">
            <div class="card">
              <div class="profile_information">
                <h4>{{ userProfileTemp.firstName }}'s Managers</h4>
                <ul class="mng_list">
                  <li
                    v-for="manager in userProfileTemp.managers"
                    :key="manager.id"
                  >
                    <div class="mng_name">
                      {{ `${manager.first_name} ${manager.last_name}` }}
                    </div>
                    <span
                      v-if="hasPermission"
                      class="icon delete-alt"
                      @click="deleteManager(manager.id)"
                    ></span>
                  </li>
                </ul>
                <div class="more_addons">
                  <!-- <button
                    class="btn btn-primary"
                    @click="toggleAddNewManagerPopup"
                    v-if="hasPermission"
                  >
                    Add New Manager
                  </button> -->
                  <!-- <button class="btn btn-primary">View All</button> -->
                </div>
              </div>
            </div>
            <div class="card">
              <h4>My Add-ons</h4>
              <ul class="info_list">
                <li v-for="addon in userProfileTemp.add_ons" :key="addon">
                  <p>{{ allAddOns[addon] }}</p>
                </li>
              </ul>
              <div class="more_addons">
                <!-- <button
                  class="btn btn-primary"
                  @click="isAddonPopupOpen = !isAddonPopupOpen"
                  v-if="hasPermission"
                >
                  Add More Add-ons
                </button> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AddAddons
      v-if="isAddonPopupOpen"
      :userId="userProfileTemp.id"
      :addedAddonList="userProfileTemp.add_ons"
      :addonCounts="userProfileTemp.plan_details.add_ons_count"
      @toggleAddonPopup="toggleAddonPopup"
    />
    <AddNewManager
      v-if="isAddNewManagerPopupOpen"
      :userId="userProfile.id"
      @toggleAddNewManagerPopup="toggleAddNewManagerPopup"
    />
    <ConfirmDeleteUser
       v-if="isDeleteUserPopupOpen"
      :isDeleteUserPopupOpen="isDeleteUserPopupOpen"
      :id="userId"
      @closeDeleteUserPopup="deleteMember"
    />
  </section>
</template>

<script>
import API from "@/services/api/";
import AddAddons from "../../userManagement/components/addOnsPopup.vue";
import AddNewManager from "./addNewManager.vue";
import ConfirmDeleteUser from "../../userManagement/components/confirmDeleteUserPopup.vue";
export default {
  components: {
    AddAddons,
    AddNewManager,
    ConfirmDeleteUser,
  },
  data() {
    return {
      isAddonPopupOpen: false,
      isAddNewManagerPopupOpen: false,
      isDeleteUserPopupOpen: false,
      isAdmin: false,
      isManager: false,
      userId: 0,
      apiKey: "",
      allAddOns: {
        ac_cable_enabled: "AC Cable",
        autocad_enabled: "Export CAD Layout",
        docs_export_enabled: "Export to Google Doc",
        stl_export_enabled: "Export for SketchUp",
        threeds_export_enabled: " Export for PVSyst",
        is_heaven_solar_integrated: "Heaven Solar Integration",
        is_manual_stringing_enabled: "Manual Stinging",
      },
      userProfile: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        org_shares: null,
        role: null,
        avatar: null,
        user_shares: [],
      },
      userProfileTemp: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        org_shares: null,
        role: null,
        avatar: null,
        user_shares: [],
        add_ons: [],
        plan_details: {},
        managers: [],
      },
      roleType: [
        {
          label: "Admin",
          value: "ADMIN",
        },
        {
          label: "User",
          value: null,
        },
      ],
    };
  },
  computed: {
    isSaveOrCancelEnabled() {
      return (
        this.userProfile.firstName != this.userProfileTemp.firstName ||
        this.userProfile.lastName != this.userProfileTemp.lastName ||
        this.userProfile.email != this.userProfileTemp.email ||
        this.userProfile.phoneNumber != this.userProfileTemp.phoneNumber ||
        this.userProfile.role != this.userProfileTemp.role ||
        this.userProfile.avatar != this.userProfileTemp.avatar
      );
    },
    hasPermission() {
      return this.isAdmin || this.isManager;
    },
  },
  async mounted() {
    this.userId = this.$route.params.userId;
    this.isAdmin = JSON.parse(localStorage.getItem("user")).role === "ADMIN";
    this.isManager = JSON.parse(localStorage.getItem("user")).is_manager;
    await this.getMemberDetails();
  },
  methods: {
    async getMemberDetails() {
      try {
        const resp = await API.TEAM.FETCH_MEMBER_DETAIL(this.userId);
        const resultUserProfile = resp.data.user;
        this.setUserData(resultUserProfile);
        this.onUserProfileCancel();
      } catch (error) {
        console.error(error);
        this.$router.push({ name: "team" });
      }
    },
    setUserData(resultUserProfile) {
      this.userProfileTemp.id = resultUserProfile.id;
      this.userProfileTemp.firstName = resultUserProfile.first_name;
      this.userProfileTemp.lastName = resultUserProfile.last_name;
      this.userProfileTemp.email = resultUserProfile.email;
      this.userProfileTemp.phoneNumber = resultUserProfile.phone;
      this.userProfileTemp.role = resultUserProfile.role;
      this.userProfileTemp.avatar = resultUserProfile.image;
      this.userProfileTemp.add_ons = resultUserProfile.add_ons;
      this.userProfileTemp.plan_details = resultUserProfile.plan_details;
      this.apiKey = this.encodeAPIKey(resultUserProfile.api_key);
      this.userProfileTemp.managers = JSON.parse(
        JSON.stringify(resultUserProfile.managers)
      );

      this.userProfile.org_shares = JSON.parse(
        JSON.stringify(resultUserProfile.org_shares)
      );
      this.userProfile.user_shares = JSON.parse(
        JSON.stringify(resultUserProfile.user_shares)
      );
    },
    async generateAPIKey() {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const resp = await API.USERS.GENERATE_API_KEY({ user: this.userProfileTemp.id });
        this.apiKey = this.encodeAPIKey(resp.data.api_key);
      } catch (error) {
        console.error("Error in generating API key.", error);
        this.$message({
          showClose: true,
          message: "Failed to generate new API key.",
          type: "error",
          center: true
        });
      }
    },
    encodeAPIKey(key) {
      if (!key) return "";
      let tempKey = key;
      let temp = "";
      for (let i = 5; i < tempKey.length - 4; i++) {
        temp += "*";
      }
      return (
        tempKey.substr(0, 4) +
        temp +
        tempKey.substr(tempKey.length - 4, tempKey.length)
      );
    },
    uploadAvatar(event) {
      let file = event.target.files[0];
      if (!file) return;
      const fileReader = new FileReader();
      fileReader.onload = (loadEvent) =>
        (this.userProfile.avatar = loadEvent.target.result);
      fileReader.readAsDataURL(file);
    },
    async updateUserProfile() {
      const patchData = {
        first_name: this.userProfile.firstName,
        last_name: this.userProfile.lastName,
        email: this.userProfile.email,
        phone: this.userProfile.phoneNumber,
        role: this.userProfile.role,
      };
      if (this.userProfileTemp.avatar != this.userProfile.avatar)
        patchData["image"] = this.userProfile.avatar;
      try {
        const resp = await API.USERS.PATCH_USER_DATA(
          this.userProfile.id,
          patchData
        );
        this.setUserData(resp.data);
        this.onUserProfileCancel();
        this.$message({
          showClose: true,
          message: "Profile details updated successfully.",
          type: "success",
          center: true
        });
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message: "Failed to update profile details.",
          type: "error",
          center: true
        });
      }
    },
    onUserProfileCancel() {
      this.userProfile.id = this.userProfileTemp.id;
      this.userProfile.firstName = this.userProfileTemp.firstName;
      this.userProfile.lastName = this.userProfileTemp.lastName;
      this.userProfile.email = this.userProfileTemp.email;
      this.userProfile.phoneNumber = this.userProfileTemp.phoneNumber;
      this.userProfile.role = this.userProfileTemp.role;
      this.userProfile.avatar = this.userProfileTemp.avatar;
    },
    onUserProfileSubmit() {
      this.updateUserProfile();
    },
    async deleteMember() {
      this.isDeleteUserPopupOpen = !this.isDeleteUserPopupOpen;
    },
    async toggleAddNewManagerPopup() {
      this.isAddNewManagerPopupOpen = !this.isAddNewManagerPopupOpen;
      await this.getMemberDetails();
    },
    async deleteManager(id) {
      try {
        await API.TEAM.DELETE_MANAGER(id);
        await this.getMemberDetails();
        this.$message({
          showClose: true,
          message: "Manager deleted successfully.",
          type: "success",
          center: true
        });
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message: "Failed to delete manager.",
          type: "error",
          center: true
        });
      }
    },
    toggleAddonPopup() {
      this.isAddonPopupOpen = !this.isAddonPopupOpen;
      this.getMemberDetails();
    },
  },
};
</script>

<style scoped>
.el-select {
  width: 100%;
}
.el-select >>> input {
  background-color: var(--step-50);
  border: none;
}
input[type="text"][disabled] {
   color: var(--step-150)
}
</style>

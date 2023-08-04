<template>
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
                  alt="Profile Name"
                />
                <img
                  v-else
                  src="../assets/img/pro_ico.png"
                  alt="Profile Name"
                />
                <span class="change_btn">
                  <i class="fas fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    @change="uploadAvatar($event)"
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
                  required
                />
                <label>First Name*</label>
              </div>
              <div class="floating-label">
                <input
                  class="floating-input"
                  type="text"
                  v-model="userProfile.lastName"
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
                />
                <label>Mobile Number</label>
              </div>
              <div class="floating-label">
                <el-select
                  v-model="userProfile.role"
                  ref="elSelect"
                  placeholder="Select role"
                  disabled
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
                  href="#"
                  v-if="hasPermission"
                  @click="generateAPIKey"
                  >Generate New</a
                >
                <div class="floating-label">
                  <input
                    disabled
                    class="floating-input"
                    type="text"
                    :value="apiKey"
                  />
                  <label>API Key</label>
                </div>
              </div> -->
              <div class="btns">
                <div>
                  <input
                    class="btn btn-primary"
                    type="submit"
                    value="Save"
                    v-show="isSaveOrCancelEnabled"
                    @click="updateUserProfile"
                  />
                  <input
                    class="btn btn-secondary"
                    type="submit"
                    value="Cancel"
                    v-show="isSaveOrCancelEnabled"
                    @click="onUserProfileCancel"
                  />
                </div>
                <input
                  class="btn btn-primary"
                  type="submit"
                  value="Change Password"
                  :disabled="toggleChangePassPopup"
                  @click="toggleChangePasswordPopup"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="card">
          <h4>My Add-ons</h4>
          <ul class="info_list">
            <li v-for="addOn in userProfileTemp.add_ons" :key="addOn">
              <p>{{ allAddOns[addOn] }}</p>
              <!-- <div class="pricing">&#8377;15,000/Year</div> -->
            </li>
          </ul>
        </div>
      </div>
      <div class="col col_right">
        <div class="card">
          <h4>Plan Details</h4>
          <div class="table_section table_normal">
            <table>
              <thead>
                <tr>
                  <th>Basic</th>
                  <th>Used</th>
                  <th>Unused</th>
                </tr>
              </thead>
              <tbody v-if="userProfileTemp.plan_details">
                <tr>
                  <td>
                    <div class="md_head">Basic</div>
                    <div class="value_type" v-if="userProfileTemp.plan_details.plan_id">
                      {{ userProfileTemp.plan_details.plan_id.number_of_seats }}
                      Users
                    </div>
                  </td>
                  <td>
                    <div class="md_head">Used</div>
                    <div class="value_type" v-if="userProfileTemp.plan_details.users_count">
                      {{ userProfileTemp.plan_details.users_count.used_users }}
                    </div>
                  </td>
                  <td>
                    <div class="md_head">Unused</div>
                    <div class="value_type" v-if="userProfileTemp.plan_details.users_count">
                      {{
                        userProfileTemp.plan_details.users_count.unused_users
                      }}
                    </div>
                  </td>
                </tr>
                <tr class="td_heading">
                  <td colspan="3">
                    <strong>Add-ons</strong>
                  </td>
                </tr>
                <tr
                  v-for="(val, key) in userProfileTemp.plan_details
                    .add_ons_count"
                  :key="key"
                >
                  <td>
                    <div class="md_head">Basic</div>
                    <div class="value_type">
                      {{ allAddOns[key] }}
                      ({{ val.total_users }} Users)
                    </div>
                  </td>
                  <td>
                    <div class="md_head">Used</div>
                    <div class="value_type">
                      {{ val.used_users }}
                    </div>
                  </td>
                  <td>
                    <div class="md_head">Unused</div>
                    <div class="value_type">
                      {{ val.unused_users }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- <div class="more_addons" v-if="hasPermission">
            <button class="btn btn-primary">Buy More Add-ons</button>
          </div> -->
        </div>
        <!-- <div class="card" v-if="hasPermission">
          <h4>Project Sharing</h4>
          <div class="toggle-button-cover" v-if="tataPowerOrg">
            <h5>Default Project Sharing</h5>
            <div class="toggle_btn">
              <input
                type="checkbox"
                v-model="isPublicShared"
                class="checkbox"
                @change="changeOrgShareSetting"
              />
              <div class="knobs"></div>
              <div class="layer"></div>
            </div>
          </div>
          <div class="share_info">
            <p>
              All your projects will <span v-if="!isPublicShared">not</span> be
              visible to everyone from your organization
            </p>
            <div class="share_input" v-if="!isPublicShared">
              <label>Share</label>
              <div class="field_group">
                <InfiniteScrollUsers :user.sync="selectedUser" />
                <div class="input-group-append">
                  <button
                    class="btn btn-primary"
                    :disabled="
                      Object.entries(selectedUser).length === 0 &&
                        selectedUser.constructor === Object
                    "
                    @click.prevent="addUserToDefaultSharers"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <ChangePassword
        v-if="toggleChangePassPopup"
        @toggleChangePass="toggleChangePasswordPopup"
      />
  </div>
</template>

<script>
import API from "@/services/api/";
import InfiniteScrollUsers from "@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue";
import ChangePassword from "./changePassword.vue";
export default {
  name: "UserProfile",
  components: {
    InfiniteScrollUsers,
    ChangePassword,
  },
  data() {
    return {
      msg: " I am in userProfile",
      loading: false,
      isAdmin: false,
      isManager: false,
      selectedUser: {},
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
      },
      apiKey: null,
      org_share_id: null,
      isPublicShared: false,
      toggleChangePassPopup: false,
    };
  },

  mounted() {
    this.fetchUserProfile();
    this.isAdmin = JSON.parse(localStorage.getItem("user")).role === "ADMIN";
    this.isManager = JSON.parse(localStorage.getItem("user")).is_manager;
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
    }
  },
  methods: {
    async fetchUserProfile() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      const user_id = user.user_id;
      const vm = this;

      if (token) {
        try {
          const response = await API.USERS.FETCH_USER(user_id);
          const resultUserProfile = response.data;
          this.setUserData(resultUserProfile);
          this.onUserProfileCancel();
        } catch (e) {
          console.error(e);
        }
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

      if(resultUserProfile.api_key)
        this.apiKey = this.encodeAPIKey(resultUserProfile.api_key);
      this.userProfile.org_shares = JSON.parse(
        JSON.stringify(resultUserProfile.org_shares)
      );
      this.userProfile.user_shares = JSON.parse(
        JSON.stringify(resultUserProfile.user_shares)
      );

      this.isPublicShared = this.userProfile.org_shares.length > 0;
      if (this.isPublicShared) {
        this.org_share_id = this.userProfile.org_shares[0].id;
      }
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
          message: "User details successfully updated.",
          type: "success",
          center: true
        });
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          // message: "User details failed to update. ",
          message: "First Name is mandatory.",
          type: "error",
          center: true
        });
      }
    },

    onUserProfileSubmit() {
      this.updateUserProfile();
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
    async generateAPIKey() {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const resp = await API.USERS.GENERATE_API_KEY({ user: user.user_id });
        this.apiKey = this.encodeAPIKey(resp.data.api_key);
      } catch (error) {
        console.error("Error in generating API key.", error);
      }
    },
    uploadAvatar(event) {
      let file = event.target.files[0];
      if (!file) return;
      const fileReader = new FileReader();
      fileReader.onload = (loadEvent) =>
        (this.userProfile.avatar = loadEvent.target.result);
      fileReader.readAsDataURL(file);
    },
    encodeAPIKey(key) {
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
    async changeOrgShareSetting(data) {
      // toggle on means that project has to be shared between the users
      if (data.target.checked === true) {
        // send a patch request
        const postData = {
          permission: "CHANGE",
        };
        try {
          const response = await API.ORG_SHARES.POST_ORG_SHARES(postData);
          this.org_share_id = response.data.id;
        } catch (e) {
          // reverting back in case of api failure
          this.isPublicShared = false;
        }
      } else {
        const share_id = this.org_share_id;
        // send a delete request
        try {
          await API.ORG_SHARES.DELETE_ORG_SHARES(share_id);
        } catch (e) {
          this.isPublicShared = true;
        }
      }
    },
    async addUserToDefaultSharers() {
      // const doesUserAlreadyExist = this.userProfile.user_shares.filter(item => item.user.id === this.selectedUser.id).length < 1;
      let doesUserAlreadyExist = false;

      this.userProfile.user_shares.forEach((item) => {
        if (item.user.id === this.selectedUser.id) {
          doesUserAlreadyExist = true;
        }
      });

      if (!doesUserAlreadyExist) {
        const postBody = {
          user: this.selectedUser.id,
          permission: this.defaultPermission,
        };

        try {
          const response = await API.USER_SHARES.POST_USER_SHARES(postBody);

          // add user to default sharers
          this.userProfile.user_shares.push({
            user: {
              id: this.selectedUser.id,
              first_name: this.selectedUser.first_name,
              last_name: this.selectedUser.last_name,
              email: this.selectedUser.email,
            },
            permission: this.defaultPermission,
            id: response.data.id,
          });

          // clearing out input
          this.selectedUser = {};

          this.$message({
            showClose: true,
            message: "User is successfully added.",
            type: "success",
            center: true
          });
        } catch (e) {
          console.error(e);
          this.$message({
            showClose: true,
            message: "Something went wrong. Please try again.",
            type: "error",
            center: true
          });
        }
      } else {
        this.$message({
          showClose: true,
          message: "User already exist in your Default Share list.",
          type: "error",
          center: true
        });
      }
    },
    toggleChangePasswordPopup() {
      this.toggleChangePassPopup = !this.toggleChangePassPopup;
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

.floating-input{
  color: #222 !important;
  font-size: 16px !important;
  height: 48px !important;
}

.floating-label label{
  color: #222 !important;
  font-size: 14px !important;
}


.el-select .el-input.is-disabled .el-input__inner {
    cursor: not-allowed;
    height: 48px !important;
     color: #222 !important;
  font-size: 16px !important;

}

 .btns {
  display:flex;
  flex-wrap: wrap;
  column-gap: 1em;
  row-gap: 1em;
  justify-content: space-between
 }
</style>

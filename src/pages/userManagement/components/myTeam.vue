<template>
  <div class="">
    <div class="profile_controller team_section">
      <div class="search_group">
        <div class="search_field">
          <input
            class="input_field"
            type="search"
            placeholder="Search members by name or email"
            v-model="searchQuery"
          />
          <span class="searh-icon"><i class="fas fa-search"></i></span>
        </div>
        <button class="btn btn-primary" v-if="hasPermission" @click="toggleAddNewUserPopup">
          Add New Member
        </button>
      </div>
      <div class="card_container">
        <div v-for="user in userList" :key="user.id">
          <div class="card">
            <div class="profile_form">
              <div class="profile_icon">
                <figure>
                  <img
                    v-if="user.user.image"
                    :src="user.user.image"
                    :alt="user.user.email"
                  />
                  <img
                    v-else
                    src="../assets/img/pro_ico.png"
                    :alt="user.user.email"
                  />
                </figure>
              </div>
              <div class="member_detail">
                <div class="member_title">
                  <div class="name">
                    {{
                      `${user.user.first_name} ${user.user.last_name}` || "-"
                    }}
                  </div>
                  <ul class="action_list">
                    <li>
                      <button
                        class="btn"
                        @click="
                          $router.push({
                            name: 'teamMember',
                            params: { userId: user.id },
                          })
                        "
                      >
                        <span class="icon edit-alt"></span>
                      </button>
                    </li>
                    <li v-if="hasPermission">
                      <button
                        class="btn"
                        @click="toggleDeleteUserPopup(user.id)"
                      >
                        <span class="icon delete-alt"></span>
                      </button>
                    </li>
                  </ul>
                </div>
                <div class="col_row">
                  <div class="col col_3">
                    <div class="pro_info">
                      <span class="icon">
                        <img src="../assets/img/envelope.svg" alt="envelope" />
                      </span>
                      <div class="info_value">
                        {{ user.user.email }}
                      </div>
                    </div>
                  </div>
                  <div class="col col_3">
                    <div class="pro_info">
                      <span class="icon">
                        <img src="../assets/img/smartphone.svg" alt="Contact" />
                      </span>
                      <div class="info_value">
                        <span class="nowrap">{{ user.user.phone || "-" }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="col col_3">
                    <div class="pro_info">
                      <span class="icon">
                        <img src="../assets/img/user.svg" alt="User" />
                      </span>
                      <div class="info_value" style="">
                        {{ user.user.role ? "Admin" : "User" }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="addons-area">
                  <h5>Add-ons</h5>
                  <div class="col_row add_ons">
                    <div
                      class="col col_3"
                      v-for="addOn in user.user.add_ons"
                      :key="addOn"
                    >
                      <div class="addons_item">
                        <p>{{ allAddOns[addOn] }}</p>
                        <!-- <div class="pricing">&#8377;15,000/Year</div> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-observe-visibility="handleScrollBottom"
          style="text-align: center"
        >
          <i v-if="loadMore" class="el-icon-loading infiniteScrollLoader" />
        </div>
      </div>
    </div>
    <AddAddons
      v-if="isAddonPopupOpen"
      @toggleAddonPopup="openAddonPopup"
    />
    <AddNewUser
      :isAddNewUserPopupOpen="isAddNewUserPopupOpen"
      @closeAddUserPopup="toggleAddNewUserPopup"
    />
    <ConfirmDeleteUser
      v-if="isDeleteUserPopupOpen"
      :isDeleteUserPopupOpen="isDeleteUserPopupOpen"
      :id="userToBeDeleted"
      @closeDeleteUserPopup="deleteUserPopup"
    />
    <UserLimitAlert
      :isUserLimitAlertPopupOpen="isUserLimitAlertPopupOpen"
      @closeLimitAlertPopup="toggleUserLimitAlertPopup"
    />
  </div>
</template>

<script>
import AddAddons from "./addOnsPopup.vue";
import AddNewUser from "./addNewUser.vue";
import ConfirmDeleteUser from "./confirmDeleteUserPopup.vue";
import UserLimitAlert from "./userLimitExceededAlertPopup.vue";
import API from "@/services/api/";
export default {
  components: {
    AddAddons,
    AddNewUser,
    ConfirmDeleteUser,
    UserLimitAlert,
  },
  data() {
    return {
      isAddonPopupOpen: false,
      isAddNewUserPopupOpen: false,
      isDeleteUserPopupOpen: false,
      isUserLimitAlertPopupOpen: false,
      isAdmin: false,
      isManager: false,
      userList: [],
      nextURL: null,
      loadMore: false,
      allAddOns: {
        ac_cable_enabled: "AC Cable",
        autocad_enabled: "Export CAD Layout",
        docs_export_enabled: "Export to Google Doc",
        stl_export_enabled: "Export for SketchUp",
        threeds_export_enabled: " Export for PVSyst",
        is_heaven_solar_integrated: "Heaven Solar Integration",
        is_manual_stringing_enabled: "Manual Stinging",
      },
      searchQuery: "",
      userToBeDeleted: null,
    };
  },
  computed: {
    hasPermission() {
      return this.isAdmin || this.isManager;
    }
  },
  async mounted() {
    this.fetchMemberList();
    this.isAdmin = JSON.parse(localStorage.getItem("user")).role === "ADMIN";
    this.isManager = JSON.parse(localStorage.getItem("user")).is_manager;
  },
  methods: {
    async fetchMemberList() {
      this.loadMore = true;
      this.userList = [];
      this.nextURL = null;
      const response = await API.TEAM.FETCH_ALL_TEAM_MEMBERS(this.searchQuery);
      this.userList = JSON.parse(JSON.stringify(response.data.results));
      this.nextURL = response.data.next;
      this.loadMore = false;
    },
    async loadMoreMembers() {
      if (!this.nextURL || this.loadMore) return;
      this.loadMore = true;
      const response = await API.TEAM.FETCH_MORE_TEAM_MEMBERS(this.nextURL);
      this.userList.push(...response.data.results);
      this.nextURL = response.data.next;
      this.loadMore = false;
    },
    toggleAddNewUserPopup() {
      this.isAddNewUserPopupOpen = !this.isAddNewUserPopupOpen;
      if(!this.isAddNewUserPopupOpen)
        this.fetchMemberList();
    },
    openAddonPopup() {
      this.isAddonPopupOpen = !this.isAddonPopupOpen;
    },
    toggleDeleteUserPopup(id) {
      if(!this.hasPermission) return;
      this.isDeleteUserPopupOpen = !this.isDeleteUserPopupOpen;
      this.userToBeDeleted = id;
    },
    deleteUserPopup(confirm) {
      if (confirm) {
        const user = this.userList.find(
          (item) => item.id == this.userToBeDeleted
        );
        const idx = this.userList.indexOf(user);
        this.userList.splice(idx, 1);
      }
      this.isDeleteUserPopupOpen = !this.isDeleteUserPopupOpen;
    },
    toggleUserLimitAlertPopup() {
      this.isUserLimitAlertPopupOpen = !this.isUserLimitAlertPopupOpen;
    },
    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }
      this.loadMoreMembers();
    },
  },
  watch: {
    searchQuery() {
      this.fetchMemberList();
    },
  },
};
</script>

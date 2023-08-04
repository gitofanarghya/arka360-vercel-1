<template>
  <div class="modal modal_form" id="add_new_user" v-if="isAddNewUserPopupOpen">
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Add New Member</h4>
          <button
            class="modal-close modal-toggle"
            @click="$emit('closeAddUserPopup'), resetRole()"
          >
            <img src="../assets/img/close.svg" alt="Close" />
          </button>
        </div>
        <form class="inside_form">
          <div class="scroll_content">
            <div class="floating-form">
              <div class="floating-label">
                <input
                  class="floating-input"
                  type="text"
                  v-model="userDetails.first_name"
                />
                <p class="error-msg" v-if="errorMsg.first_name">
                  <!-- *{{ errorMsg.first_name[0] }} -->
                  *This field is required
                </p>
                <label>First Name*</label>
              </div>
              <div class="floating-label">
                <input
                  class="floating-input"
                  type="text"
                  v-model="userDetails.last_name"
                />
                <label>Last Name</label>
              </div>
              <div class="floating-label">
                <input
                  class="floating-input"
                  type="text"
                  v-model="userDetails.email"
                />
                <p class="error-msg" v-if="errorMsg.email">
                  <!-- *{{ errorMsg.email[0] }} -->
                  *This field is required
                </p>
                <label>Email Id*</label>
              </div>
              <div class="floating-label">
                <input
                  class="floating-input"
                  type="text"
                  v-model="userDetails.phone"
                />
                <p class="error-msg" v-if="errorMsg.phone">
                  <!-- *{{ errorMsg.phone[0] }} -->
                  *This field is required
                </p>
                <label>Mobile Number*</label>
              </div>
              <div class="floating-label">
                <label>Role</label>
                <el-select
                  v-model="userDetails.role"
                  ref="elSelect"
                  placeholder="Select role"
                >
                  <el-option
                    v-for="role in roleType"
                    :key="role.value"
                    :label="role.label"
                    :value="role.value"
                  ></el-option>
                </el-select>
              </div>
              <div class="floating-label">
                <label>Select Manager</label>
                <InfiniteScrollAdmin :user.sync="userDetails.manager" />
              </div>
            </div>
            <div class="button_area">
              <button @click.prevent="addNewMember" class="btn btn-primary">
                Add Member
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
import InfiniteScrollAdmin from "./infiniteScrollAdmin.vue";
export default {
  components: {
    InfiniteScrollAdmin,
  },
  props: {
    isAddNewUserPopupOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      userDetails: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "Select Role",
        manager: [],
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
      errorMsg: {},
    };
  },
  methods: {
    resetRole() {
      this.userDetails.role = "Select Role";
    },

    async addNewMember() {
      try {
        const userId = JSON.parse(localStorage.getItem("user")).user_id;
        if (this.userDetails.manager.indexOf(userId) == -1)
          this.userDetails.manager.push(userId);
        await API.USERS.ADD_USER(this.userDetails);
        this.$emit("closeAddUserPopup");
        this.$message({
          showClose: true,
          message: "New member added to the team successfully.",
          type: "success",
          center: true
        });
      } catch (e) {
        console.error(e);
        if (e.response.status === 400) {
          this.errorMsg = e.response.data;
        }
        this.$message({
          showClose: true,
          message: "Failed to add new member to the team.",
          type: "error",
          center: true
        });
      }
    },
  },
};
</script>

<style scoped>
.modal {
  z-index: 431 !important;
}
.el-select {
  width: 100%;
}
.el-select >>> input {
  background-color: var(--step-50);
  border: none;
}
</style>

<template>
  <div class="modal modal_form" id="add_new_user">
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <div class="modal-header">
          <h4>Add New Manager</h4>
          <button
            class="modal-close modal-toggle"
            @click="$emit('toggleAddNewManagerPopup')"
          >
            <img src="../../userManagement/assets/img/close.svg" alt="Close" />
          </button>
        </div>
        <form class="inside_form">
          <div class="scroll_content">
            <div class="floating-form">
              <div class="floating-label">
                <label>Select Manager</label>
                <InfiniteScrollAdmin :user.sync="userManagers" />
              </div>
            </div>
            <div class="button_area">
              <button @click.prevent="addNewManager" class="btn btn-primary">
                Add Manager
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteScrollAdmin from "../../userManagement/components/infiniteScrollAdmin.vue";
import API from "@/services/api/";
export default {
  components: {
    InfiniteScrollAdmin,
  },
  props: {
    userId: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      userManagers: [],
    };
  },
  methods: {
    async addNewManager() {
      try {
        const body = {
          user: this.userId,
          manager: this.userManagers,
        };
        await API.TEAM.POST_MEMBER_DETAILS(body);
        this.$message({
          showClose: true,
          message: "New manager added successfully.",
          type: "success",
          center: true
        });
      } catch (e) {
        console.error(e);
        this.$message({
          showClose: true,
          message: "Failed to add new manager. Please try again.",
          type: "error",
          center: true
        });
      } finally {
        this.$emit("toggleAddNewManagerPopup");
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

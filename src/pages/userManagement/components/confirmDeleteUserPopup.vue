<template>
  <div
    class="modal modal_delete"
    id="delete_member"
    v-if="isDeleteUserPopupOpen"
  >
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <button
          class="modal-close modal-toggle"
          @click="$emit('closeDeleteUserPopup', false)"
        >
          <img src="../assets/img/close.svg" alt="Close" />
        </button>
        <div class="delete_content">
          <figure>
            <img src="../assets/img/alert.svg" alt="Alert" />
          </figure>
          <p>Are you sure you want to delete this user?</p>
          <div class="button_area">
            <button class="btn btn-primary" @click="deleteMember">
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  props: {
    isDeleteUserPopupOpen: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [Number, String],
      default: null,
    },
  },
  mounted(){
    this.$mousetrap.bind('enter', () => {
        this.deleteMember();
    });
  },
  methods: {
    async deleteMember() {
      try {
        await API.TEAM.DELETE_A_MEMBER(this.id);
        this.$emit("closeDeleteUserPopup", true);
        this.$router.push({ name: "team" });
        this.$message({
          showClose: true,
          message: "User is deleted successfully.",
          type: "success",
          center: true
        });
      } catch (error) {
        this.$message({
          showClose: true,
          message: "Failed to delete team member.",
          type: "error",
          center: true
        });
      }
    },
  },
};
</script>

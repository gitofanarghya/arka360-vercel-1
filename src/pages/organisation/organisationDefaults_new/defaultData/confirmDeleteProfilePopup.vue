<template>
  <div
    class="modal modal_delete"
    id="delete_member"
  >
    <div class="modal-overlay modal-toggle"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <button
          class="modal-close modal-toggle"
          @click="$emit('closeDeleteProfilePopup')"
        >
          <img src="../assets/img/close.svg" alt="Close" />
        </button>
        <div class="delete_content">
          <figure>
            <img src="../assets/img/alert.svg" alt="Alert" />
          </figure>
          <p>Are you sure you want to delete this profile?</p>
          <div class="button_area">
            <button class="btn btn-primary" @click="deleteProfile">
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
import { serverBus } from '../../../../main';
export default {
  props: {
    id: {
      type: [Number, String],
      default: null,
    },
  },
  methods: {
    async deleteProfile() {
      await API.DEFAULTS_PROFILE.DELETE_PROFILE(this.id);
      this.$emit("closeDeleteProfilePopup");
      serverBus.$emit('profilesUpdated');
    },
  },
};
</script>

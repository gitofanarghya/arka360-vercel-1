<template>
  <div
    class="modal modal_delete"
    id="user_limit"
    v-if="isUserLimitAlertPopupOpen"
  >
    <div class="modal-overlay modal-toggle" data-dismiss="modal"></div>
    <div class="modal-wrapper">
      <div class="modal-content">
        <button
          class="modal-close modal-toggle"
          data-dismiss="modal"
          @click="$emit('closeLimitAlertPopup')"
        >
          <img src="../assets/img/close.svg" alt="Close" />
        </button>
        <div class="delete_content">
          <figure>
            <img src="../assets/img/information.svg" alt="Information" />
          </figure>
          <p>
            As per your current plan, you have reached to the maximum number of
            users limit. Please add more users to your existing plan
          </p>
          <div class="button_area">
            <button class="btn btn-primary" data-dismiss="modal">
              Add Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isUserLimitAlertPopupOpen: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

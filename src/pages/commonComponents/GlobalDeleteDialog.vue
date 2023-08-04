<template>
  <div>
    <GlobalDialog
      :dialogTitle="dialogTitle"
      :dialogVisible.sync="dialogVisible"
      :width="width"
      :footerButtonText="footerButtonText"
      :footerButtonType="footerButtonType"
      :disableCancel="disableCancel"
      :disableButton="disableButton"
      @handleClose="handleClose"
      @handleClick="handleClick"
    >
      <template slot="body">
        <div class="delete-body">
          <div class="alert">
            <img
              src="../../assets/img/alert (1).svg"
              alt="alert"
              class="warningImage"
            />
          </div>
          <span>{{ deleteMessage }}</span>
        </div>
      </template>
    </GlobalDialog>
  </div>
</template>

<script>
import GlobalDialog from "./GlobalDialog.vue";

export default {
  name: "GlobalDeleteDialog",
  components: {
    GlobalDialog,
  },
  props: {
    dialogTitle: {
      type: String,
      required: true,
      default: "",
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    footerButtonText: {
      type: String,
      default: "Delete",
      required: false,
    },
    width: {
      type: String,
      default: "30%",
      required: false,
    },
    footerButtonType: {
      type: String,
      default: "danger",
      required: false,
    },
    disableCancel: {
      type: Boolean,
      default: false,
      required: false,
    },
    disableButton: {
      type: Boolean,
      default: false,
      required: false,
    },
    deleteMessage: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleClose() {
      this.$emit("handleClose");
    },
    handleClick() {
      this.$emit("handleClick");
      this.$emit("handleClose");
    },
  },
};
</script>

<style scoped>
.delete-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.warningImage {
  width: 3.675rem !important;
  height: 3.194rem !important;
  object-fit: contain !important;
}

.alert {
  margin-bottom: 1.5rem;
}
</style>

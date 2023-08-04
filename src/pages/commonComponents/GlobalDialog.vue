<template>
  <div class="dialog-global">
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :width="width"
      :before-close="handleClose"
    >
      <slot name="body">
        <span>This is a message</span>
      </slot>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose" v-if="!disableCancel">Cancel</el-button>
        <el-button
          :type="footerButtonType"
          @click="handleClick"
          :disabled="disableButton"
          >{{ footerButtonText }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GlobalDialog",
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
      default: "Confirm",
      required: false,
    },
    width: {
      type: String,
      default: "30%",
      required: false,
    },
    footerButtonType: {
      type: String,
      default: "primary", // Success Info Warning Danger
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
.dialog-global ::v-deep .el-dialog__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dialog-global ::v-deep .el-dialog__header {
  background-color: #e8edf2;
}
.dialog-global ::v-deep .el-dialog__title {
  color: #222222 !important;
}
</style>

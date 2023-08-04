<template>
  <div class="deleteModule">
    <el-dialog
      :visible="isDeleteStoragePopupOpen"
      :close-on-click-modal="false"
       width="300px"
      class="delete_module"
      @close="closeModal"
    >
      <div class="close_button">
        <img
          src="../../home/assets/img/close.svg"
          alt="close"
          @click="$emit('cancelDelete')"
        />
      </div>
      <div class="alert">
        <img
          src="../assets/img/alert.svg"
          alt="alert"
          class="warningImage"
        />
      </div>
      <p class="msg">Are you sure you want to delete the battery?</p>
      <div class="button_container">
        <el-button
          class="confirmButton"
          type="primary"
          @click="$emit('confirmDelete')"
        >
          Yes
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isDeleteStoragePopupOpen: {
      type: Boolean,
      default: false,
    },
  },
  mounted(){
    this.$mousetrap.bind('enter', () => {
        this.$emit('confirmDelete');
    });
  },
  methods: {
    closeModal() {
      this.$emit("cancelDelete");
    },
  },
};
</script>

<style scoped>
.deleteModule .delete_module >>> .el-dialog {
  border-radius: 8px;
  margin-top: 14vh !important;
}
.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}
.deleteModule .delete_module .alert {
  padding: 15px 0 0px 10px;
}
.deleteModule .delete_module .alert,
.deleteModule .delete_module .msg,
.deleteModule .delete_module .button_container {
  display: flex;
  justify-content: center;
}
.deleteModule .delete_module .close_button {
  display: flex;
  justify-content: flex-end;
  padding: 10px 5px 0 0;
  cursor: pointer;
}

.warningImage {
  width: 4.675rem !important;
  height: 4.194rem !important;
  margin: 1rem 9.888rem 2.369rem 8.125rem !important;
  object-fit: contain !important;
}
.msg {
  font-family: "Helvetica Neue" !important;
  font-size: 16px !important;
  font-weight: 100 !important;
  font-stretch: normal !important;
  font-style: normal !important;
  line-height: 1.5 !important;
  letter-spacing: normal !important;
  text-align: center !important;
  color: #222 !important;
  word-break: normal;
  margin: 0%;
}
.deleteModule .delete_module .button_container .confirmButton {
  width: 9.5rem;
  height: 3rem;
  margin: 25px;
  font-size: 18px;
  font-weight: bolder;
}
</style>

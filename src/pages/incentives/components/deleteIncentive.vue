<template>
  <div class="deleteModule">
    <el-dialog
      :visible="deleteDialogFormVisible"
      :close-on-click-modal="false"
      title="Add User"
      width="30%"
      class="delete_module"
      @close="closeModal"
    >
      <div class="close_button">
        <img
          src="../../design/assets/img/close.svg"
          alt="close"
          @click="$emit('cancelDelete')"
        />
      </div>
      <div class="alert">
        <img
          src="../../design/assets/img/alert.svg"
          alt="alert"
          class="warningImage"
        />
      </div>
      <p class="msg">Are you sure you want to delete this incentive?</p>
      <div class="button_container">
        <el-button 
         class="btn btn-primary"
         type="primary"
         :loading="isButtonLoading"
         @click="handleDelete()"
        >
          Yes
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  name: "deleteIncentive",
  emits: ["close"],
  props: {
    isDeleteProjectPopupOpen: {
      type: Boolean,
      default: false,
    },
    projectIdTobeDeleted: {
      type: Number,
      default: -1,
    },
    deleteDialogFormVisible: {
      type: Boolean,
      default: false,
    },
    incentive_id: {
      default: null,
    },
  },
  data() {
    return {
      isButtonLoading: false,
    };
  },
  mounted(){
    this.$mousetrap.bind('enter', () => {
        this.handleDelete();
    });
  },
  methods: {
    closeModal() {
      this.$emit("cancelDelete");
    },
    async handleDelete() {
      this.isButtonLoading = true;
      try {
        await API.INCENTIVE_INFORMATION.DELETE_INCENTIVE(this.incentive_id);

        this.$message({
          showClose: true,
          message: "Incentive deleted successfully.",
          type: "success",
          center: true
        });
        this.isButtonLoading = false;
        this.$emit("close");
      } catch (e) {
        this.$message({
          showClose: true,
          message: "Error deleting the incentive. Try again.",
          type: "error",
          center: true
        });
      }
    },
  },
  watch: {
    incentive_id: {
      handler(val) {
        //console.log(val);
      },
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
  padding: 15px 0 0 10px;
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
.deleteModule .delete_module .button_container button {
  width: 9.5rem;
  height: 3rem;
  margin: 25px;
  font-size: 18px;
  font-weight: bolder;
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
}

</style>

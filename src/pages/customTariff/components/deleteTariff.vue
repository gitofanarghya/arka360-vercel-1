<template>
  <div class="parentContainer">
    <el-dialog
      :visible="isDeleteTariffPopup"
      :close-on-click-modal="false"
      title="Add User"
      width="600px"
      class="delete_module"
      @close="closeModal"
    >
      <div class="close_button">
        <img
          src="../../../assets/img/close.svg"
          alt="close"
          @click="$emit('close')"
        />
      </div>
      <div class="alert">
        <img
          src="../../../assets/img/alert.svg"
          alt="alert"
          class="warningImage"
        />
      </div>
      <p class="msg">Are you sure you want to delete this Tariff?</p>
      <p class="content">
        This action cannot be undone. Please note that this will not affect any
        projects that have already used this tariff. To edit the tariffs in
        existing projects, please open the project and make the necessary
        changes.
      </p>
      <div class="button_container">
        <el-button type="primary" :loading="isLoading" @click="deleteTariff()"
          >Yes</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>

import API from "@/services/api/";

export default {
  data() {
    return {
      isLoading: false,
    };
  },
  props: {
    isDeleteTariffPopup: {
      type: Boolean,
      default: false,
    },
    tariffId: {
      default: null,
    }
  },

  watch:{
    tariffId: {
      handler(val){
        this.tariffId = val;
      }
    }
  },

  methods: {

    async deleteTariff(){
      this.isLoading = true;
      let response = await API.TOU.TARIFF_CRUD("Delete", this.tariffId);
      this.isLoading = false;
      this.$emit("delete");
    },

    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.parentContainer .delete_module >>> .el-dialog {
  border-radius: 16px;
  margin-top: 14vh !important;
  width: 600px !important;
}
.parentContainer .delete_module >>> .el-dialog__header {
  display: none;
}
.parentContainer .delete_module .alert {
  margin: 16px 0px 18px 0px;
}
.parentContainer .delete_module .alert,
.parentContainer .delete_module .msg,
.parentContainer .delete_module .button_container {
  display: flex;
  justify-content: center;
}
.parentContainer .delete_module .close_button {
  display: flex;
  justify-content: flex-end;
  padding: 10px 5px 0 0;
  cursor: pointer;
}

.msg {
  font-family: "Helvetica Neue";
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  color: #222;
  word-break: break-word;
  margin-bottom: 12px;
}

.content {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  padding: 0px 10px;
  text-align: center;
  word-break: break-word;
}

.parentContainer .delete_module >>> .el-button {
  font-size: 18px;
  font-weight: 600;
  width: 128px;
  margin-bottom: 32px;
  margin-top: 20px;
}

@media (max-width: 650px) {
  .parentContainer .delete_module >>> .el-dialog {
    margin-top: 0vh !important;
    width: 90vw !important;
  }

  .parentContainer .delete_module .alert {
    margin: 8px 0px 16px 0px;
  }

  .msg {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .content {
    font-size: 14px;
  }

  .parentContainer .delete_module >>> .el-button {
    font-size: 16px;
    width: 100px;
    margin-bottom: 24px;
    margin-top: 16px;
  }
}
</style>
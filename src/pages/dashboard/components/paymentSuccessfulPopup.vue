<template>
  <div class="deleteModule" v-if="isPaymentSuccessfulPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      title="Add User"
      class="delete_module"
    >
      <div class="container">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">Payment Successful</p>
          <button
            class="modal-close modal-toggle"
           @click="$emit('closeSuccessFullPopup')"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer">
          <img class="imgIcon" src="../assests/patch-check-fill.png" />
          <h3 class="heading">Order Received Successfully.</h3>
          <p class="content">
            Please click on the continue button below to fill out the details.
            It will take us {{NO_OF_WORKING_DAYS}} to deliver the service once you provide
            all the project details.
          </p>
          <div class="btnContainer">
          <el-button type="primary"  @click="$emit('closeSuccessFullPopup')">Continue</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useMiscStore } from '../../../stores/misc';

export default {
  name: "paymentSuccessfulPopup",
  props: {
    isPaymentSuccessfulPopupVisible: {
      type: Boolean,
      default: false,
    },
    requestedServiceType:{
      type: String,
      default:""
    },
   timeRemaining:{
      type: String,
      default:""
    },
    timeUpdateData:{
      type: String,
      default: "",
    }
  },
  components: {},
  computed:{
    ...mapState(useMiscStore, {
      NO_OF_WORKING_DAYS: 'GET_WORKING_DAYS',
    }),
  },
  data() {
    return {};
  },

  methods: {
    closenewDesignDialogForm() {
      this.$emit("update:isPaymentSuccessfulPopupVisible", false);
      this.$validator.reset();
    },
  },
};
</script>


<style scoped>
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 580px !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.Rectangle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.rectContent {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-left: 20px;
}

.modal-close {
  background-color: #e8edf2;
  border: none;
}

.el-dialog__close {
  font-size: 25px;
  font-weight: 700;
  margin-right: 8px;
  cursor: pointer;
}

.contContainer{
   padding: 35px 65px 30px 65px;
}

.imgIcon{
    display: flex;
    margin: 0 auto 24px auto;
}

.heading {
  color: #19c114;
  font-weight: 500;
  font-size: 18px;
  text-align: center;
  margin-bottom: 24px;
}

.content {
  font-size: 16px;
  font-weight: 100;
  color: #222;
  text-align: center;
  word-break: break-word;
  line-height: 1.5;
}

.btnContainer{
    margin: 24px auto 16px auto;
    border: none;
    text-align: center;
}

.container >>> .el-button{
    font-size: 18px !important;
}

@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 338px !important;
  }

  .contContainer{
      padding: 24px;
  }
  .rectContent {
    margin-left: 16px;
  }
}
</style>


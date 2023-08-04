<template>
  <div class="deleteModule">
    <el-dialog
      :visible="dialogFormVisible"
      :close-on-click-modal="false"
      title="Checks For BOM"
      width="30%"
      class="delete_module"
      @close="closeModal"
    >
      <div class="close_button">
        <!-- <img
          src="../../design/assets/img/close.svg"
          alt="close"
          @click="$emit('cancelDelete')"
        /> -->
      </div>
      <div class="alert">
        <img
          src="../../design/assets/img/blueAlert.svg"
          alt="alert"
          class="warningImage"
        />
      </div>
        <p v-if="messageForCheck==='noInverter'" class="msg">
          Please Add Inverter. Redirecting you To Design Summary Page!
        </p>
        <p v-else-if="messageForCheck==='generationNotInRange'" class="msg">
          Generation is not between 10KW and 1MW. Redirecting you To Design Summary Page! 
        </p>
        <p v-else-if="messageForCheck==='invalidInverters'" class="msg">
            Please Select only Solis/Goodwe Inverter. Redirecting you To Design Summary Page!
        </p>
        <p v-else-if="messageForCheck==='Problem with API or Inverter Selection'" class="msg">
            Sorry! There is a Problem With Invetrer Selection. Redirecting you To Design Summary Page!
        </p>
      <div class="button_container">
        <button class="btn primary confirmButton" @click="redirectToDesignSummary(designId)">
          Ok
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
export default {
  name: "deleteIncentive",
  data(){
      return{
          designId: this.$route.params.designId,
      }

  },
  emits: ["close"],
  props: {
    isDeleteProjectPopupOpen: {
      type: Boolean,
      default: false,
    },
    dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    messageForCheck:{
        type : String,
        default: "noInverter",
    }
   
  },
  methods: {
    closeModal() {
      this.$emit("cancelDelete");
    },
    redirectToDesignSummary(designId){
        this.$router.push({ name: "designSummary", params: { designId } });
        this.$emit("close");
    },
    async handleDelete() {
      try {
        this.$emit("close");
      } catch (e) {
       
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
  padding: 14px 53px 12px;
  border-radius: 4px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
  background-image: linear-gradient(to bottom, #837bfe, #6c63ff);
  border: none;
  outline: none;
  cursor: pointer;
  color: #fff;
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
  word-break: break-word;
}
.confirmButton {
  font-family: "Helvetica Neue" !important;
  font-size: 18px !important;
  font-weight: bold !important;
  font-stretch: normal !important;
  font-style: normal !important;
  line-height: 0.89 !important;
  letter-spacing: normal !important;
  text-align: center !important;
  color: #fff !important;
}
</style>

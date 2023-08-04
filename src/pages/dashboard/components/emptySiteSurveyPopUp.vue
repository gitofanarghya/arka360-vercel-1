<template>
    <div class='deleteModule'>
        <el-dialog 
            :visible="emptySiteSurvey"
            :close-on-click-modal="false"
            title="Add User"
            width="30%"
            class="delete_module"
            @close="closeModal"
        >
            <!-- <div class='close_button'>
                <img 
                    src='../../home/assets/img/close.svg' 
                    alt='close' 
                    @click="$emit('update:emptySiteSurvey', false)"
                >
            </div> -->
            <div class='alert'>
                <img 
                    src='../../home/assets/img/info-circle.svg' 
                    alt='alert'
                    class="warningImage"
                >
            </div>
            <p class='msg'>No media files have been submitted yet.</p>
            <div class='button_container'>
                <el-button class='confirmButton' type="primary" @click="closeModal">
                    Close
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
  props: {
    emptySiteSurvey: Boolean,
    closeEmptySiteSurveyPopUp: Boolean,
  },
  mounted(){
    this.$mousetrap.bind('enter', () => {
        this.$emit('update:closeEmptySiteSurveyPopUp', false);
    });
  },
  methods: {
    closeModal() {
        this.$emit('update:emptySiteSurvey', false);
    },
  },
};
</script>

<style scoped>
.deleteModule .delete_module >>> .el-dialog {
  width: 90vw !important;
  max-width: 400px;
  height: auto !important;
  border-radius: 8px;
  margin-top: 14vh !important;
}
.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}
.deleteModule .delete_module .alert{
    padding: 15px 6px 2px 10px;
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
  padding: 10px 5px 0 100px;
  cursor: pointer;
}
.warningImage {
  width: 4.675rem !important;
  height: 4.194rem !important;
  margin: 16px 0px 37.7px 0px !important;
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
  padding-bottom: 15px;
}
.confirmButton {
  font-size: 18px !important;
  font-weight: bold !important;
  color: #fff !important;
  width: 9.5rem;
  height: 3rem;
  margin: 25px 0px 48px;
}
</style>

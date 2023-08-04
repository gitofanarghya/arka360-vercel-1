<template>
    <div class='deleteModule' id="deleteModule">
        <el-dialog 
            :visible="$props.isDeleteProjectDocumentPopupOpen"
            :close-on-click-modal="false"
            :title="title"
            width="30%"
            height="25rem !important"
            class="delete_module"
            @close="closeModal"
            :modal-append-to-body="false"        >
          
            <div class='alert'>
                <img 
                    src='../../../assets/img/alert (1).svg' 
                    alt='alert'
                    class="warningImage"
                >
            </div>
            <p class='msg'>{{info}}</p>
            <div class='button_container'>
                <el-button type="primary"  @click="confirmDelete()">Yes</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        isDeleteProjectDocumentPopupOpen: {
            type: Boolean,
            default: false,
        },
        title:{
            type:String,
            default:''
        },
        info:{
            type:String
        }
      
    },
    mounted(){
            // this.$mousetrap.bind('enter', () => {
            //     this.confirmDelete();
            // });
    },
    methods: {
        confirmDelete(){
          this.$emit('confirmDelete',true);
          this.closeModal()
        },
        closeModal() {
            this.$emit('cancelDelete');
        }
    },
}
</script>

<style scoped>
#deleteModule >>> .el-icon-close::before{
    font-size: 20px;
    font-weight: 600;
    color: #222222;
}
#deleteModule  >>> .el-dialog{
    height:'25rem !important'
}
.deleteModule .delete_module >>> .el-dialog{
    border-radius: 16px;
    margin-top: 14vh !important;
    width: 472px !important;
    height: 10rem !important;
}
.deleteModule .delete_module >>> .el-dialog__header .el-dialog__headerbtn .el-dialog__close {
    padding-top: 20px;
    color: #222222;
}
.deleteModule .delete_module >>> .el-dialog__header{
    /* display: none; */
    background-color: transparent;
    color: black !important;
    margin-bottom: 20px;
    padding: 10px !important;
    display: flex;
    align-items: center;
    justify-content: center;
}
.deleteModule .delete_module >>>.el-dialog__body {
    padding: 30px 20px;
    color: #606266;
    background-color: white;
    border-radius: 15px;
    font-size: 14px;
    word-break: break-all;
}
.deleteModule .delete_module .alert{
   margin: 24px 0px 32px 0px;
}
.deleteModule .delete_module .alert,
.deleteModule .delete_module .msg,
.deleteModule .delete_module .button_container {
    display: flex;
    justify-content: center;
}
.deleteModule .delete_module .close_button{
    display: flex;
    justify-content: flex-end;
    padding: 10px 5px 0 0;
    cursor: pointer;
}

.warningImage {
  width: 4.675rem !important;
  height: 4.194rem !important;
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

.el-button{
    font-size: 18px;
    padding: 13px 56px;
    margin: 32px 0px 40px 0px;
}

@media (max-width: 500px) {
.deleteModule .delete_module >>> .el-dialog{
    width: 86% !important;
}
}


</style>
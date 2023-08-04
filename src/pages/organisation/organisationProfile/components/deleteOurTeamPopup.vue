<template>
    <div class='deleteModule'>
        <el-dialog 
            :visible="isDeleteOurTeamPopupVisible"
            :close-on-click-modal="false"
            title="Add User"
            width="30%"
            class="delete_module"
            @close="closeModal"
        >
            <div class='close_button'>
                <img
                    src='../../../../assets/img/close.svg' 
                    alt='close' 
                    @click="$emit('cancelDelete')"
                >
            </div>
            <div class='alert'>
                <img 
                    src='../../../../assets/img/alert.svg' 
                    alt='alert'
                    class="warningImage"
                >
            </div>
            <p class='msg'>Are you sure you want to delete this member?</p>
            <div class='button_container'>
                <el-button type="primary" :loading=isLoading @click="deleteMemberData()">Yes</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import API from "@/services/api/";

export default {
    data() {
        return {
            isLoading : false,
        }
    },
    props: {
        isDeleteOurTeamPopupVisible: {
            type: Boolean,
            default: false,
        },
        index:"",
        teamProp: {
            type : Array,
        }
    },
    computed:{
        ISUs() {
          const organisation = JSON.parse(localStorage.getItem("organisation")) || {};
          if(organisation.country === 52){
            return true;
          }
          return false;
        },
    },
    methods: {
         async deleteMemberData() {


            try {
            this.isLoading = true;
            const user = JSON.parse(localStorage.getItem("user"));
            let team = this.teamProp;
            team.splice(this.index, 1);
            const patchData = { team_members : team };
            if(this.ISUs){
                await API.USERS.PATCH_USER_DATA(user.user_id, patchData);
            }
            else{
                const resp = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(
                user.organisation_id,
                patchData
                );    
                localStorage.setItem('organisation',JSON.stringify(resp.data));
            }
            this.closeModal();
        this.$message({
          showClose: true,
          message: "Member Deleted.",
          type: "success",
          center: true
        });
      } catch (e) {
        this.isLoading = false;
        console.error(e);
        if (e.response.status === 400) {
          this.errorMsg = e.response.data;
        }
        this.$message({
          showClose: true,
          message: "Failed to delete the member.",
          type: "error",
          center: true
        });
      }
        this.isLoading = false;
        },
        closeModal() {
            this.$emit('cancelDelete');
        }
    },
}
</script>

<style scoped>
.deleteModule .delete_module >>> .el-dialog{
    border-radius: 16px;
    margin-top: 14vh !important;
    width: 472px !important;
}
.deleteModule .delete_module >>> .el-dialog__header{
    display: none;
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
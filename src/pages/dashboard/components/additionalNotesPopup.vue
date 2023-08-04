<template>
  <div class="deleteModule" v-if="isadditionalNotesPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      title="Add User"
      class="delete_module"
    >
      <div class="container">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{isEdited ? "Additional Notes" : `${requestedServiceType}`}}</p>
          <button
            class="modal-close modal-toggle"
            @click="$emit('update:isadditionalNotesPopupVisible', false)"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer" v-loading="loading">
          <el-form ref="form" :model="form">
            <el-form-item v-if="flagForUS" label="In addition to the Jurisdiction codes entered previously, please add any other local jurisdiction codes required for the design.">
              <el-input v-model="form.local_code"></el-input>
            </el-form-item>
            <el-form-item label="Project Requirements">
              <el-input
                type="textarea"
                autosize
                placeholder="Enter any specific project requirements that needs to be considered. For example, is there a side of the house where you prefer to not place panels, electricity offset target, and anything else you would like to share with your design engineer. "
                v-model="form.Project_Requirements"
              ></el-input>
            </el-form-item>

            <h3 class="contactInfo">Whom should we contact in case of technical queries regarding this site?</h3>

            <div class="contactContainer">
            <el-form-item label="Phone Number">
              <el-input  v-model="form.phone_number" type="number"></el-input>
              <p v-if="isphoneNumbervalid" id="err-phone" >{{isNumberValid}}</p>
              <p v-if="nullPhoneNumber" id="err-phone">{{phoneNumber}}</p>
            </el-form-item><el-form-item label="Email Address">
              <el-input v-model="form.email_address" name="email" @input="handleEmail"  v-validate.immediate="emailValidation"></el-input>
              <p v-show="errors.has('email')" id="err-phone">{{ errors.first('email') }}</p>
            </el-form-item>
            </div>
          </el-form>
        </div>
        <!-- -----------------Footer----------------->
        <div class="footer">
          <p class="footerStep" v-if="!isEdited">
            Step {{ currentStepInProp }}/{{ totalSteps }}
          </p>
          <div class="notesBtn">
            <el-button
              class="backBtn"
              @click="$emit('closeAdditionalPopup', 'previous')"
              v-if="!isEdited">Back</el-button
            >
     
            <el-button type="primary" class="submitBtn" @click="submitClick" :loading="loading"
              v-if="!isEdited">Submit</el-button
            >
            <el-button type="primary" class="submitBtn" @click="submitClick" :loading="loading"
              v-if="isEdited" >Edit Notes</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState,mapActions } from "pinia";
import { checkEmailValidation2, checkMobileNumberValidation,} from "../../../core/utils/utils";
import API from "@/services/api/";
import { ERROR_MESSAGE_QUOTA_EXHAUSTED } from '@/pages/constants';
import { useDesignStore } from '../../../stores/design';
import { useProjectStore } from "../../../stores/project";
import { useLeadStore } from "../../../stores/lead"
import { isCrmUser, reportPagesPlainListUs } from "@/utils.js";



export default {
  name: "additionalNotesPopup",

  props: {
    isadditionalNotesPopupVisible: {
      type: Boolean,
      default: false,
    },
    request_object_id_from_ds:{
      type: Number,
      default: 0,
    },
    projectIdFromGenericComponent: {
      type: Number,
      default: null,
    },
    currentStepInProp: {
      type: Number,
      default: 1,
    },
    requestedServiceType:{
      type: String,
      default:""
    },
    totalSteps: {
      type: Number,
      default: 5,
    },
    request_object_id: {
      type: Number,
      default: 0,
    },
    additionalNotes:{
      type: Object,
      default() {
        return {
            Project_Requirements:null,
            local_code:null,
            phone_number:null,
            email_address:null,
        }
      }
    },
    isEdited: {

      type: Boolean,

      default: false,

    },
  },
  watch: {
    request_object_id(newval, oldval) {
      console.log("new,old", newval, oldval);
    },
  },
  created(){
    this.form = (this.$props.additionalNotes);
    this.fetchTotalNumberOfDesigns();
    // this.fetchAllProfiles();
  },
  data() {
    return {
      counter: 0,
      loading: false,
      form: {
        local_code: "",
        Project_Requirements: "",
        // contact_information: "",
        // name: "",
        phone_number: "",
        email_address: ""
      },
      emailValidation:{
        email:true,
      },
      AdditionalNoteBTn:false,
      Active:false,
      isphoneNumbervalid:false,
      nullPhoneNumber:false,
      isEmailvalid:false,
      nullEmail:false,
      totalDesigns:0,
      isNumberValid:"Enter Valid Mobile Number",
      phoneNumber:"Enter Mobile Number",
      InvalidEmail:"Enter Valid E-Mail Address",
      Email:"Enter E-Mail Address",
      selectedProfile: {},
      allProfiles_: [],
      usaReportPages: reportPagesPlainListUs,
      fetchProjectPromise : null,
    };
  },
  computed: {
    ...mapState(useDesignStore, {
      designInfo: "GET_ENTIRE_DESIGN"
    }),
    ...mapState(useLeadStore, {
      leadInfo: state => state
    }),

    checkBtn: function() {
        if(this.form.phone_number == null || this.form.email_address == null) {
       return true;
        } else {
        return false;
      }
    },
    flagForUS(){
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    isCrmUser,
  },
  methods: {
    ...mapActions(useProjectStore, ["GET_CURRENT_PROJECT","CHANGE_DESIGN_LIST"]),
    // ...mapActions(useProjectStore, ["CHANGE_DESIGN_LIST"]),
    handleEmail(){
      this.$validator.validate('email', this.form.email_address);
    },
    checkPhonenumber(){
      if(this.form.phone_number === ""){
        this.nullPhoneNumber=true;
        this.isphoneNumbervalid=false; 
        return;
      }else{
        this.nullPhoneNumber = false;
      }
    if (!checkMobileNumberValidation(this.form.phone_number)) {
        this.isphoneNumbervalid = true;
        return;
      } else {
        this.isphoneNumbervalid=false; 
      }
    },
    checkEmail(){
      if(this.form.email_address === ""){
          this.nullEmail=true;  
          this.isEmailvalid = false;
          return;    
      }else{
        this.nullEmail=false;
      }
      if (!checkEmailValidation2(this.form.email_address)) {   
           this.isEmailvalid = true;
           return;
      } else {
           this.isEmailvalid = false;    
      }
    },
    async fetchAllProfiles() {
            try {
                const response = await API.DEFAULTS_PROFILE.FETCH_ALL_PROFILES();
                this.allProfiles_ = JSON.parse(JSON.stringify(response.data.results));

                // this.nextURL = response.data.next;
                // this.prevURL = response.data.prev;
                // setting first userProfile to be the default option
                if (this.allProfiles_.length > 0) {
                    this.selectedProfile = this.allProfiles_[0];
                }
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in fetching defaults userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
    },
    async patchDesignVersionSettings(designVersionSettingsId) {
             console.log("############# calling new code");
            let report_defaults_temp=this.selectedProfile.report_defaults;
            // not adding check for template_name and report_type as this function meant for NonUS right now
            report_defaults_temp['template_name'] ='solar_labs'; 
            if(this.flagForUS){
              report_defaults_temp['template_name'] = 'solar_labs_usa';
              report_defaults_temp['pages'] = [...this.usaReportPages];
            }
            report_defaults_temp['report_type'] ='portrait'; 
            report_defaults_temp["defaultProfileId"]=this.selectedProfile.id;
            report_defaults_temp["defaultProfileName"]=this.selectedProfile.name;
            console.log("report_default_temp", report_defaults_temp);
            const patchData = {
                name: this.selectedProfile.name,
                distance_unit: this.selectedProfile.distance_unit,
                wiring_unit: this.selectedProfile.wiring_unit,
                shadows: this.selectedProfile.shadows,
                start_time_auto_row_spacing: this.selectedProfile.start_time_auto_row_spacing,
                end_time_auto_row_spacing: this.selectedProfile.end_time_auto_row_spacing,
                start_date_heatmap: this.selectedProfile.start_date_heatmap,
                end_date_heatmap: this.selectedProfile.end_date_heatmap,
                start_time_heatmap: this.selectedProfile.start_time_heatmap,
                end_time_heatmap: this.selectedProfile.end_time_heatmap,
                default_solar_access_threshold: this.selectedProfile.default_solar_access_threshold,
                default_table_types: this.selectedProfile.default_table_types,
                constant_losses: this.selectedProfile.constant_losses,
                drawing_defaults: this.selectedProfile.drawing_defaults,
                report_defaults: report_defaults_temp,

            };
            try {
                API.DESIGN_VERSION_SETTINGS.PATCH_VERSION_SETTINGS(designVersionSettingsId, patchData);
            }
            catch (e) {
                console.error();
                this.handleDesignCreationError(e);
            }
    },
    handleDesignCreationError(e) {
            console.log(e)
            let errorMessage = 'Error in creating design. Try again';
            if (e.response.status === 302) {
                errorMessage = this.ERROR_MESSAGE_QUOTA_EXHAUSTED;
            }
            this.$message({
                showClose: true,
                message: errorMessage,
                type: 'error',
                center: true
            });
            // this.isDesignGettingCreated = false;
    },
    totalExpertServiceDesigns(totaldesign) {
      let counter = 0
      for (let design of totaldesign) {
        if (design.request_expert_service && Object.keys(design.request_expert_service).length > 0) {
          counter++
        }
      }
      return counter;
    },
    async fetchTotalNumberOfDesigns(){
      let projectId = this.projectIdFromGenericComponent || this.designInfo.project.id;
      this.fetchProjectPromise = API.PROJECTS.FETCH_PROJECT(projectId);
    },
    async submitClick() {
      // const isFormValid = this.validate();
      // if (!isFormValid) {
      //   return;
      // }
      if(this.errors.has('email')){
        this.form.email_address="";
      }
      let resp = await this.fetchProjectPromise
      let expertDesigns = this.totalExpertServiceDesigns(resp.data.designs)      
      this.loading = true;
      var newPostData = {
        name: `${expertDesigns+1}. `+ this.requestedServiceType,
        additional_notes: {
          "Project_Requirements": this.form.Project_Requirements,
          "contact_information": this.form.contact_information,
          "local_code": this.form.local_code,
          "phone_number": this.form.phone_number,
          "email_address": this.form.email_address,
        },
      };
      try {
        if (this.$props.isEdited) {
          let response = await API.DASHBOARD_INFO.FINANCIAL_ADD_PRICING_POPUP_ADDED(
            this.$props.request_object_id_from_ds,
            newPostData
          );
          this.loading = false;
          this.$message({
            showClose: true,
            message: 'Additional notes updated',
            type: 'success',
            center: true
          });
          this.$emit('update:isadditionalNotesPopupVisible', false)
          //this.$props.isadditionalNotesPopupVisible = false;
          // this.loading = false;
        } else {
          let response = await API.DASHBOARD_INFO.ADITIONAL_ADD_NOTE_POPUP_ADDED(
            this.$props.request_object_id,
            newPostData
          );
          // const designVersionSettingsId = response.data.versions.setting.id;
          // const designId = response.data.id;
          // this.patchDesignVersionSettings(designVersionSettingsId);
          
          if(this.$route.name=='leadSummary'){
            this.$emit('update:isadditionalNotesPopupVisible', false)
            this.CHANGE_DESIGN_LIST();
            return;
          }
          this.loading = false;
          if(isCrmUser()){
            this.$router.push({
              path: `/leadSummary/${response.data.lead_id}`,
            });
          }
          else{
            this.$router.push({
              path: `/projectSummary/${response.data.project}`,
            });
          }
        }
      }
      catch (error) {
        console.error(error);
        this.loading = false;
        this.$message({
          showClose: true,
          message: 'Error in Updating Notes,Try again!',
          type: 'error',
        });
      }
    },
    closenewDesignDialogForm() {
      this.$emit("update:isOrderDetailPopupVisible", false);
      this.$validator.reset();
    },
    // validate() {
    //   let countValid = 0;
    //   if (this.form.phone_number === null) {
    //     this.nullPhoneNumber = true;
    //     this.isphoneNumbervalid = false;
    //     countValid++;
    //   } else {
    //     this.nullPhoneNumber = false;
    //   }

    //   if (!checkMobileNumberValidation(this.form.phone_number)) {
    //     this.isphoneNumbervalid = true;
    //     this.nullPhoneNumber = false;
    //    countValid++;
    //   } else {
    //     this.isphoneNumbervalid=false; 
    //   }

    //     if (!checkEmailValidation2(this.form.email_address)) {   
    //        this.isEmailvalid = true;
    //        countValid++;
    //   } else {
    //        this.isEmailvalid = false;    
    //   }

    //   if (this.form.email_address === null) {
    //     this.nullEmail = true;
    //      this.isEmailvalid = false;
    //     countValid++;
    //   } else {
    //     this.nullEmail = false;
    //   }
    //   if (countValid === 0) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    //   }
  },
};
</script>


<style scoped>
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
  word-break: break-word;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 90% !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule >>> .delete_module {
  overflow: hidden !important;
  margin-top: 5vh !important;
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

.contContainer {
  padding: 24px 24px 24px 24px;
  height: 65vh;
  overflow-y: scroll;
}

.deleteModule .delete_module >>> .el-form-item{
  margin-bottom: 16px !important;
}

.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
  min-height: 150px !important;
  padding: 15px 16px !important;
  word-break: break-word;
}

.deleteModule .delete_module >>> .el-textarea__inner::placeholder {
  font-size: 16px !important;
  font-weight: 100 !important;
  color: #999 !important;
  word-break: break-word;
}

.deleteModule .delete_module >>> .el-form-item__label{
  color: #222 !important;
  text-align: left !important;
  margin-bottom: 8px !important;
  line-height: 1.5 !important;
  word-break: break-word !important;
}

.deleteModule .delete_module >>> .el-input__inner{
  background-color: #e8edf2 !important;
  height: 48px !important;
  font-size: 16px !important;
  border: none !important;
}

.contactContainer{
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 24px;
}

.contactInfo{
  font-size: 16px;
  font-weight: 100;
  color: #222;
  margin-bottom: 16px;
  margin-top: 24px;
  word-break: break-word;
}


.footer {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
}

.footerStep {
  font-size: 16px;
  font-weight: 700;
  color: #222222;
  line-height: 2.5;
}

.unBold {
  color: #777777;
}

.el-button {
  font-size: 18px !important;
}

.backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
}

.submitBtn {
  padding: 13px 30px;
}
.tittle{

  color: #222;

  margin-left: 22px;

}
#err-phone {
  color: red;
  font-size: 13px;
}
@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

  .contContainer {
    padding: 16px 10px 8px 16px;
    max-height: 70vh;
  }
  .rectContent {
    margin-left: 16px;
  }

  .contactContainer{
  display: grid;
  grid-template-columns: auto;
  grid-gap: 0px;
  }

  .footer {
    padding: 16px 14px;
  }
  .el-button {
    font-size: 14px !important;
  }

.deleteModule .delete_module >>> .el-textarea__inner {
  min-height: 242px !important;
}

}
</style>
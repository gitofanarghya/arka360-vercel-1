<template>
  <div class="deleteModule" v-if="isSiteSurveyPopupVisible">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
      title="Add User"
      class="delete_module"
    >
      <div class="container">
        <!-- -----------------header------------->
        <div class="Rectangle">
          <p class="rectContent">{{requestedServiceType}}</p>
          <button
            @click="emitClose"
            class="modal-close modal-toggle"
          >
            <i class="el-dialog__close el-icon el-icon-close"></i>
          </button>
        </div>

        <!-- -----------------Container------------->
        <div class="contContainer">
           <!-- <iframe src="https://tsl-survey-tool.azurewebsites.net/sitesurvey/TSLSUR000810/tsl"
            height="200" width="300" style="width:-webkit-fill-available; height:-webkit-fill-available;" title="Iframe Example"></iframe> -->
             <iframe :src="link"
            height="300" width="400" style="width:100%; height:100%;" allow="clipboard-write" title="Iframe Example"></iframe>
            
        </div>

        <hr class="hrThree" />

        <!-- -----------------Checkbox-------------->
        <div class="containerFour flexProperty">
          <div class="balanceContFour">
            <!-- <h3 class="balanceHeading">Your Credit Balance</h3>
            <p class="balanceValue sameColor">{{totalAvailableCredits}} Credits</p> -->
            <p class="footerStep">Step {{currentStepInProp}}<span class="unBold">/{{totalSteps}}</span></p>
          </div>
          <div class="btnContainer">
            <el-button @click="$emit('closeSiteSurveyPopup','previous')"  class="backBtn">Back</el-button>
            <el-button type="primary" @click="$emit('closeSiteSurveyPopup','next')"  class="nextBtn">Next</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from '@/services/api/';
import { SITE_SURVEY_LINK } from '../../../constants'

export default {
    name: "WebView",
    emits: ["close"],
    props: {
        isSiteSurveyPopupVisible: {
            type: Boolean,
            default: false,
        },
        projectIdFromGenericComponent:{
            type : Number,
            default: null,
        },
        currentStepInProp:{
          type: Number,
          default:1,
        },
        totalSteps:{
            type: Number,
            default: 5,
        },
        siteSurveyPath:{
          type:String,
          default:""
        },
          requestedServiceType:{
            type: String,
            default:""
        },
            request_object_id: {
      type: Number,
      default: 0,
    }
    },
    mounted(){
       this.getData(this.$props.request_object_id);
    },
    components: {
    },
    data() {
        return {
            surveyInfo : {
                path : '',
                surveyId : '',
            },
            siteSurveyPathNew:"",
            link:null,
        };
    },
    computed:{
    },
     watch: {
        request_object_id(newval,oldval){
      console.log("new,old",newval,oldval);
       this.getData(newval);
    }},
    methods: {
      async getData(newID){
        
        console.log("@@@@@@@@@calling get financial");
        var response = await API.DASHBOARD_INFO.GET_FINANCIAL_ADD_PRICING_POPUP_ADDED(newID);
          console.log("@@@@@@@@@@@@response",response);
          if(response.data){
            if(response.data.additional_info){
                this.siteSurveyPathNew = response.data.additional_info.path;
                 this.getSurveyInfo();
            }
          }
        

      },
        emitClose(){
            this.$emit("closeSiteSurveyPopup");
        },
        closenewDesignDialogForm() {
        this.$emit("update:isSiteSurveyPopupVisible", false);
        this.$validator.reset();
        },
        getSurveyInfo(){
           console.log("@@@@@@@@@ finally siteSurveyPath",this.siteSurveyPathNew);
           console.log("Site survey link",SITE_SURVEY_LINK);
           this.link = `${SITE_SURVEY_LINK}${this.siteSurveyPathNew}/tsl`
            // this.link = `https://tsl-survey-tool.azurewebsites.net${this.siteSurveyPathNew}/tsl`;
        },
        async getSurveyInfoOld() {
            console.log("@@@@@@@@@ finally siteSurveyPath",this.siteSurveyPathNew);
            const projectIdObj = {
                projectId: this.projectIdFromGenericComponent,
            };
            // debugger
            try {
                //console.log(projectIdObj);
                // debugger
                const response = await API.DESIGNS.FETCH_SURVEY_INFO(projectIdObj);
                this.surveyInfo.path = response.data.path;
                this.surveyInfo.surveyId = response.data.surveyId;
                this.link = `${SITE_SURVEY_LINK}${this.siteSurveyPathNew}/tsl`
                // this.link = `https://tsl-survey-tool.azurewebsites.net${this.siteSurveyPathNew}/tsl`;
                // debugger
            }
            catch (e) {
                console.error();
            }
        },
    },
};
</script>


<style scoped>
.el-dialog__wrapper {
   margin-top: 5vh !important; 
}

.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 90vw !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  display: none;
}

.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.sameColor {
  color: #263342;
  font-weight: 600;
}

.containerFour {
  padding: 20px;
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

.contContainer{
    height: 65vh;
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

.flexProperty {
  display: flex;
  justify-content: space-between;
}

.containerOne {
  margin-bottom: 16px;
  padding: 24px 20px 0px 20px;
}


.infoOneHeading {
  margin-bottom: 5px;
  font-size: 18px;
  color: #263342;
  word-break: break-word;
  font-weight: 600;
}

.infoOneValue {
  font-size: 14px;
  color: #777;
  line-height: 1.6;
  word-break: break-word;
  font-weight: 500;
}


.containerTwo {
  padding: 0px 20px 0px 20px;
}

.newHeadCont{
  margin: 20px auto;
}

.boldHead{
  font-size: 18px;
  font-weight: 600;
  color: #263342;
}

.container >>> .el-checkbox {
  margin-bottom: 20px;
}

.container >>> .el-checkbox__label {
  color: #263342 !important;
  font-weight: 100 !important;
  font-size: 16px !important;
}

.container >>> .el-checkbox__inner {
  border: 1px solid #263342 !important;
}

.container >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #263342 !important;
  border-color: #263342 !important;
}

.container >>> .el-checkbox__inner:hover {
  border-color: #263342 !important;
}

.checkboxValue {
  font-weight: 600;
  font-size: 16px;
}

.infoContThree {
  margin-bottom: 20px;
  padding: 0px 20px 0px 20px;
}

.infoThreeHeading {
  color: #263342;
  font-size: 16px;
  font-weight: 100;
}

.infoThreeValue {
  font-size: 16px;
  font-weight: 600;
}

.totalThreeHeading,
.totalThreeValue {
  font-size: 18px;
  font-weight: 600;
  color: #263342;
}

.balanceContFour {
  display: flex;
  justify-content: center;
  align-items: center;
}

.balanceValue {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 16px;
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

hr {
  color: #ccc;
  opacity: 0.5;
}

.hrOne {
  margin: 0px 0px 16px 0px;
}

.hrTwo {
  margin: 16px 0px 16px 0px;
}

.backBtn {
  padding: 13px 32px;
  border: 1px solid #999;
}

.nextBtn {
  padding: 13px 36px;
}

.container >>> .el-button {
  font-size: 18px !important;
}

@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 90% !important;
  }

  .rectContent {
    margin-left: 16px;
  }

  .containerOne {
    padding: 16px 16px 0px 16px;
  }

  .containerTwo {
    padding: 0px 16px;
  }

  .infoContThree {
    padding: 0px 16px;
  }

  .containerFour {
    padding: 16px;
  }

  .hrOne {
    margin: 0px 0px 16px 0px;
  }

  .balanceContFour {
    padding: 0px 8px;
  }

  .balanceValue {
    margin-left: 4px;
  }

  .container >>> .el-button {
  font-size: 14px !important;
}
}
</style>


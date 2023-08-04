<template>
  <div class="card">
    <div class="card_header flex_header">
      <h4>Site Survey</h4>
      <div class="add_price_td">
        <!-- <p>
        Lorem ipsum dolor sit amet, consetetur
        sadipscing elitr, sed diam nonumy eirmod
        tempor invidunt
      </p> -->
       
     
      <!-- end add -->
    </div>
    
  </div>
  <div class="stieBtnDiv">
  <button 
          class="siteBtn"
          @click="goToSiteForm"
          data-toggle="modal"
          data-target="#weather_station" 
        >
          View Site Survey Details
        </button>
  </div>
         <siteForm 
            v-if="isSiteSurveyPopupVisible"
            :siteSurveyPath="siteSurveyPath"
            :isSiteSurveyPopupVisible.sync="isSiteSurveyPopupVisible"
            @closeSiteSurveyPopup="closeSiteSurveyPopup"
        />
  </div>
</template>

<script>
import siteForm from '@/pages/dashboard/components/siteForm.vue';

export default {
  name: "designFinancialView",
  components:{
 siteForm,
  },
  props:{
      siteSurveyPath:{
            type: String,
            default : ""
        }
  },
  created() {
   
    console.log("@@@@@siteSurvey in popup",this.siteSurveyPath);
   
  },
  data() {
    return {
      isSiteSurveyPopupVisible:false,
    };
  },
  methods:{

      goToSiteForm(){
           this.isSiteSurveyPopupVisible=true;
      },
      closeSiteSurveyPopup(){
            this.isSiteSurveyPopupVisible=false;
        },
  }

}
</script>
<style scoped>
.siteBtn {
    color: #f3f3f4;
    background-color: #3d9bf7;
    border: 1px solid var(--step-150);
    border-radius: 4px;
    display: inline-block;
    font-weight: 500;
    font-size: var(--f14);
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    padding: 0.55rem 1.5rem;
    line-height: 1.42857143;
    margin-top: 35px;
    margin-bottom: 37px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-box-shadow: 0 0 2px 0 var(--step-150);
    box-shadow: 0 0 2px 0 var(--step-150);
        border-color: var(--danger);
    background-color: var(--tertiary);
    background-image: -webkit-gradient(linear, left top, left bottom, from(var(--danger)), to(#3092F7));
    background-image: linear-gradient(to bottom, var(--danger), #3092F7);
    color: var(--white);
}
.stieBtnDiv {
    width: 100%;
    text-align: center;
}
</style>


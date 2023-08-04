<template>
    <div>
        <consumptionPopup
            v-if="isconsumptionPopupVisible"
            :isconsumptionPopupVisible.sync="isconsumptionPopupVisible"
            :requestedServiceType ="requestedServiceType"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeConsumptionPopup="genericMethodForPopupChain"
        />
        <ahjPopup2
             v-if="isAhjPopupVisible"
            :request_object_id.sync ="request_object_id"
            :requestedServiceType ="requestedServiceType"
            :isAhjPopupVisible.sync="isAhjPopupVisible"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeAhjPopup="genericMethodForPopupChain"

        />
        <siteSurvey
            v-if="isSiteSurveyPopupVisible"
            :request_object_id.sync ="request_object_id"
            :siteSurveyPath="siteSurveyPath"
            :isSiteSurveyPopupVisible.sync="isSiteSurveyPopupVisible"
            :requestedServiceType ="requestedServiceType"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeSiteSurveyPopup="genericMethodForPopupChain"
        />
        <additionalNotesPopup
            v-if="isadditionalNotesPopupVisible"
            :request_object_id.sync ="request_object_id"
            :requestedServiceType ="requestedServiceType"
            :isadditionalNotesPopupVisible.sync="isadditionalNotesPopupVisible"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeAdditionalPopup="genericMethodForPopupChain"
        />
        <addPricingPopup
            :isAddPricingPopupVisible.sync="isAddPricingPopupVisible"
             :requestedServiceType ="requestedServiceType"
            :request_object_id.sync ="request_object_id"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeAddPricingPopup="genericMethodForPopupChain"
        />
        <solarSalesProposalPopup
            v-if="isSolarSalesProposalPopupVisible"
            :isSolarSalesProposalPopupVisible.sync = 'isSolarSalesProposalPopupVisible'
            :requestedServiceType ="requestedServiceType"
            :request_object_id.sync ="request_object_id"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeSolarSalesPopup="genericMethodForPopupChain"

        />    
        <ShareDocumentPopup
            :isShareDocumentPopupVisible.sync = 'isShareDocumentPopupVisible'
            :requestedServiceType ="requestedServiceType"
            :request_object_id.sync ="request_object_id"
            :projectIdFromGenericComponent="projectId"
            :currentStepInProp="currentStep"
            :totalSteps="totalSteps"
            @closeShareDocumentPopup="genericMethodForPopupChain"

        />    
        
    </div>
</template>

<script>
import API from '@/services/api/';
import consumptionPopup from "./consumptionPopup.vue";
import ahjPopup2 from "./ahjPopup2.vue";
import siteSurvey from './siteSurvey.vue';
import additionalNotesPopup from './additionalNotesPopup.vue';
import addPricingPopup from './addPricingPopup.vue';
import solarSalesProposalPopup from './solarSalesProposalPopup.vue';
import ShareDocumentPopup from './shareDocumentPopup.vue';
import { getServiceSpecificInfo } from "@/pages/utils/utils.js"
export default {
    components:{
        consumptionPopup,
        ahjPopup2,
        siteSurvey,
        additionalNotesPopup,
        addPricingPopup,
        solarSalesProposalPopup,
        ShareDocumentPopup
    },
    data(){
        return{
            isconsumptionPopupVisible:false,
            isAhjPopupVisible:false,
            isSiteSurveyPopupVisible:false,
            isadditionalNotesPopupVisible:false,
            isAddPricingPopupVisible:false,
            isSolarSalesProposalPopupVisible:false,
            currentStep:1,
            isShareDocumentPopupVisible:false,
            currentIndex:0,
            
        };
    },
    props:{
        invokeGenericComponent:{
            type: Boolean,
            default: false,
        },
        projectId:{
            type : Number,
            default: null,
        },
        requestedServiceType:{
            type: String,
            default:""
        },
        currentStepInProp:{
            type: Number,
            default:1,
        },
        totalSteps:{
            type: Number,
            default: 5,
        },
        request_object_id:{
        type: Number,
        default: 0
        },
        siteSurveyPath:{
            type: String,
            default : ""
        }
    },
    
    created(){
         console.log("request_object_id in generic compo",this.$props.request_object_id);
         console.log("@@@@@@@@@@@ super super final",this.$props.siteSurveyPath);
    },
    mounted(){
        // console.log("popups flow",this.popupsFlowTemp);
    },
   
    methods:{
        closeShareDocumentPopup(nextOrPrevious){
              this.isShareDocumentPopupVisible = false;
            if(nextOrPrevious ==='next'){
                this.currentStep++;
                this.isadditionalNotesPopupVisible = true;
            }else if(this.requestedServiceType==='Solar Sales Proposal'){
                this.isSolarSalesProposalPopupVisible = true;
                this.currentStep--;
            }else{
                this.isSiteSurveyPopupVisible = true;
                this.currentStep--;
            }
        },
        closeConsumptionPopup(nextOrPrevious){
            this.isconsumptionPopupVisible = false;
            if(nextOrPrevious ==='next'){
                this.currentStep++;
                if(this.requestedServiceType==='Permit Package'){
                    this.isAhjPopupVisible=true;
                }
                else if(this.requestedServiceType==='Solar Sales Proposal'){
                    this.isAddPricingPopupVisible=true;
                }
            }
        },
        closeAhjPopup(nextOrPrevious){
            this.isAhjPopupVisible=false;
            if(nextOrPrevious==='next'){
                this.currentStep++;
                if(this.requestedServiceType==='Permit Package' || this.requestedServiceType==='PV Design' ){
                    this.isSiteSurveyPopupVisible=true;
                }
            }
            else if(nextOrPrevious==='previous'){
                this.currentStep--;
                if(this.requestedServiceType==='Permit Package'){
                    this.isconsumptionPopupVisible=true;
                }
            }
        },
        closeSiteSurveyPopup(nextOrPrevious){
            console.log("@@@@close site survey");
            this.isSiteSurveyPopupVisible=false;
            if(nextOrPrevious==='next'){
                this.currentStep++;
                if(this.requestedServiceType==='Permit Package' || this.requestedServiceType==='PV Design' ){
                    this.isShareDocumentPopupVisible=true;
                }
            }
            else if(nextOrPrevious==='previous'){
                this.currentStep--;
                if(this.requestedServiceType==='Permit Package' || this.requestedServiceType==='PV Design' ){
                    this.isAhjPopupVisible=true;
                }
            }
        },
        closeAddPricingPopup(nextOrPrevious){
            console.log("@@@@close add pricing");
            this.isAddPricingPopupVisible=false;
            if(nextOrPrevious==='next'){
                this.currentStep++;
                this.isSolarSalesProposalPopupVisible=true;
            }
            else if(nextOrPrevious==='previous'){
                this.currentStep--;
                this.isconsumptionPopupVisible = true;
            }
        },
        closeSolarSalesPopup(nextOrPrevious){
            this.isSolarSalesProposalPopupVisible=false;
            if(nextOrPrevious==='next'){

                this.currentStep++;
                this.isShareDocumentPopupVisible=true;
            }
            else if(nextOrPrevious==='previous'){
                this.currentStep--;
                this.isAddPricingPopupVisible=true;
            }
        },
        closeAdditionalPopup(nextOrPrevious){
            // this.isShareDocumentPopupVisible=false;
            this.isadditionalNotesPopupVisible = false;
            if(nextOrPrevious==='previous'){
                this.currentStep--;
                this.isShareDocumentPopupVisible = true;
                // if(this.requestedServiceType==='Solar Sales Proposal'){
                //     this.isSolarSalesProposalPopupVisible=true;
                // }
                // else if(this.requestedServiceType==='Permit Package' || this.requestedServiceType==='PV Design' ){
                //     this.isSiteSurveyPopupVisible=true;
                // }
            }
        },

        genericMethodForPopupChain(nextOrPrevious , firstTime = false){
            let currentPopup = this.popupsFlowTemp[this.currentIndex];
            if(firstTime) // everytime for next, there is increment of current step but already its coming having increment for the forst time so dealing with it
            this.currentStep--;

            // whatever is the current popup, just close that and then proceed to the next/previous one depending upon next or previous-----------------------
            if(currentPopup == 'Consumption Popup')
            this.isconsumptionPopupVisible=false;
            else if(currentPopup == 'AHJ Popup')
            this.isAhjPopupVisible=false;  
            else if(currentPopup == 'Site Survey Popup')
            this.isSiteSurveyPopupVisible=false;  
            else if(currentPopup == 'Pricing Popup')
            this.isAddPricingPopupVisible=false; 
            else if(currentPopup == 'Module/Inverter Popup')
            this.isSolarSalesProposalPopupVisible = false;
            else if(currentPopup == 'Document Upload Popup')
            this.isShareDocumentPopupVisible=false;
            else if(currentPopup == 'Additional Information Popup')
            this.isadditionalNotesPopupVisible = false;
            //-----------------------------------------------------------------------------------------------------------------------------------------------------

            //------------------ when u close the popup directly and in that case nextOrPrevious will be undefined and u dont want to execute next lines------------
            if(!nextOrPrevious)
            return;
            //-------------------------------------------------------------------------------------------------------------------------------------------------------

            //----------------------------- now open the popup depending upon next or previous-----------------------------------------------------------------------
            if(nextOrPrevious =='next'){
            this.currentIndex++;
            this.currentStep++;
            }
            else if(nextOrPrevious =='previous'){
            this.currentIndex--;
            this.currentStep--;
            }

            currentPopup = this.popupsFlowTemp[this.currentIndex];
            
            if(currentPopup == 'Consumption Popup')
            this.isconsumptionPopupVisible=true;
            else if(currentPopup == 'AHJ Popup')
            this.isAhjPopupVisible=true;  
            else if(currentPopup == 'Site Survey Popup')
            this.isSiteSurveyPopupVisible=true;  
            else if(currentPopup == 'Pricing Popup')
            this.isAddPricingPopupVisible=true; 
            else if(currentPopup == 'Module/Inverter Popup')
            this.isSolarSalesProposalPopupVisible = true;
            else if(currentPopup == 'Document Upload Popup')
            this.isShareDocumentPopupVisible=true;
            else if(currentPopup == 'Additional Information Popup')
            this.isadditionalNotesPopupVisible = true;   

            //---------------------------------------------------------------------------------------------------------------------------------------------------------
        }

        
    },
    computed:{
        popupsFlowTemp(){
            let data = getServiceSpecificInfo(this.requestedServiceType);
            return data['template_constant'][0]['pop_ups'];     
        },
    },
    watch:{
        invokeGenericComponent:{
            handler(val){
                if(val){
                    this.currentStep = this.currentStepInProp;
                    // this.currentIndex=1;
                    console.log("popups flow",this.popupsFlowTemp);
                    this.currentIndex=0;
                    this.genericMethodForPopupChain('next',true);
                    // if(this.requestedServiceType==='Solar Sales Proposal' || this.requestedServiceType==='Permit Package' ){
                    //     this.isconsumptionPopupVisible=true;
                    // }
                    // else if(this.requestedServiceType==='PV Design'){
                    //     this.isAhjPopupVisible=true;  
                    // }
                }
            }
        },
 //--------------------------------------------this part is imp---------------------------------------------------------------//
 // on closing of consumption popup or shj popup, its imp to tell parent of generic especially in orders that invokeGenericComponent is false
 // so that if the user click on continue again, it will turn to true from false and watch above will be executed     
 // now why only for these two. Its because after create new project, these will come just after that if considered every services right now.  
        isconsumptionPopupVisible:{
            handler(val){
                if(!val){
                    this.$emit('update:invokeGenericComponent',false);
                }
            }
        },
        isAhjPopupVisible:{
            handler(val){
                if(!val){
                    this.$emit('update:invokeGenericComponent',false);
                }
            }
        }
    }

//----------------------------------------------------------------------------------------------------------------------------------------//
}
</script>


<style scoped>

</style>
<template>
  <div id="parentContainer" class="deleteModule" v-if="isPayNowPopupVisible" v-loading.fullscreen="isWaitingForPayment">
    <el-dialog
      :visible="true"
      :close-on-click-modal="false"
     @close="closenewDesignDialogForm"
      title="Order Details"
      class="delete_module"
    >
     
     <div class="container">
        <div class="leftContainer">
          <!-- dummy dropdown test -->
          <!-- {{Selectedvalue}}
           <el-select v-model="Selectedvalue" placeholder="Select" value-key="value">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item">
              </el-option>
            </el-select> -->
          <div class="headerContainer">
            <h3 class="headings"> {{buttonclickedNEW.template_constant[0].name}}</h3>
            <p class="headContent">
              {{buttonclickedNEW.template_constant[0].detailed_description}}
            </p>
          </div>
          <div :class="['drpDownContainer', isNoOfRoofVisible ? 'drpDownContainerCondition' : '']">
            <div :class="isNoOfRoofVisible ? '' : 'drpDownWidth'">
              <label class="labelDrpDwn" v-if="this.$props.buttonclickedNEW.available_info[0] == 'delivery_info'">Delivery Time</label>
              <label class="labelDrpDwn" v-else>Project Type</label>
              <el-select v-model="selectedDropdownItem" placeholder="Select" value-key="id" @change="OptionsChange">
                <el-option
                  v-for="item in fetchInfo(buttonclickedNEW.available_info[0])"
                  :key="item.id"
                  :value="item"
                  :label="optionName(selectedDropdownItem.base)"
                  class="drpDwnHeight"
                >
                <div>
                  <span class="drpDownType">{{optionName(item.base)}}</span>
                  <span class="drpDownCredits"> {{formatNumberWithCommas(item.base.credits)}} Credits</span> 
                  <span class="drpDownDes">{{item.base.description}}</span>
                </div>
                </el-option>
              </el-select>
            </div>
            <div class="noOfRoofContainer" v-if="isNoOfRoofVisible">
              <label class="labelDrpDwn">No. of Roofs
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Add the number of roofs if more than 1 roof is needed in the design using additional credits per roof.
                      </p>
                    </div>
                </div>
              </label>
              <input type="number" v-model.number="totalNoOfRoofs"  min="1" class="noOfRoofInput"/>
              <img src="../../../assets/drop/Path 118.png"  class="upperArrow" @click="addRoofs"/>
              <img src="../../../assets/drop/Path 119.png" class="downArrow" @click="subRoofs"/>
            </div>
          </div>
          <ul class="checkBoxContainer" v-if="buttonclickedNEW.available_info[0] == 'project_info'">
             <li class="chkBoxLI">Size in kW -  {{selectedDropdownItem.base.max_size_kw}}</li>
             <li class="chkBoxLI">Number of Free Roofs - {{selectedDropdownItem.base.no_of_free_roofs}}</li>
             <li class="chkBoxLI">Free Revisions - {{selectedDropdownItem.base.free_revisions}}</li>
             <!-- <li class="chkBoxLI">Delivery Time-{{selectedDropdownItem.base.delivery_time.days}} {{daySuffix(selectedDropdownItem.base.delivery_time.days)}}</li> -->
             <li class="chkBoxLI">Delivery Time - {{deliveryTime(selectedDropdownItem.base.delivery_time)}}</li>
          </ul>
          <div  v-if="buttonclickedNEW.template_constant[0].has_add_ons">
            <el-checkbox-group class="checkBoxContainer" v-model="selectedAddOnChecked" @change="addonsChange">
            <el-checkbox  v-for="addon in buttonclickedNEW.template_constant[0].add_ons" :key="addon.name" :label="addon" :disabled="availedAddOn(addon.id)" :checked="availedAddOn(addon.id)"
              >
              <!-- {{addon.name}} ({{addon.credits}} Credits) - {{addon.delivery_time}} {{daySuffix(addon.delivery_time)}} -->
              {{addon.name}} ({{formatNumberWithCommas(addon.credits)}} Credits) {{deliveryTime(addon.delivery_time) ? "-" : ""}} {{deliveryTime(addon.delivery_time)}}
              
              <div v-if="addon.description" class="hover_information">
                  <i class="fas fa-info-circle"></i>
                  <div class="tooltip">
                    <p>
                      {{addon.description}}
                    </p>
                  </div>
              </div>

            </el-checkbox>
           </el-checkbox-group>
          </div>
          <div class="footer">
            <p class="note">
              <span class="boldTxt">Note:</span>
                 {{buttonclickedNEW.template_constant[0].notes}}
            </p>
            <el-checkbox v-model="ISchecked_terms_and_conditions">
              <p class="agreeContent">
                {{buttonclickedNEW.template_constant[0].terms_and_conditions}}
              </p>
            </el-checkbox>
          </div>
        </div>
        <div class="rightContainer">
          <div class="headerContainer">
            <h3 class="headings">Payment Details</h3>
            <div class="packageDetails">
              <p class="details">{{buttonclickedNEW.template_constant[0].service_type}}</p>
              <p class="detailsValue">{{formatNumberWithCommas(selectedDropdownItem.base.credits)}}</p>
            </div>
          </div>

          <!-- <div class="estDeleiveryTimeContainerOne" v-if="isNoOfRoofVisible">
            <div class="packageDetails">
              <div class="roofContainer">
                <p class="details">Number of Roofs</p>
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Use your bonus credits for sales proposals, revision requests, self-design creation, and some upgrades on a design level.
                      </p>
                    </div>
                </div>
              </div>
              <div class="totalNoOfRoofs">
                <p class="detailsValue circleRoofSub" @click="subRoofs">-</p>
                <p class="detailsValue">{{totalNoOfRoofs}}</p>
                <p class="detailsValue circleRoofAdd" @click="addRoofs">+</p>
              </div>
            </div>
          </div> -->

          <div class="selectedPaymentsHeight">
            <div class="selectedPayments" v-if="buttonclickedNEW.template_constant[0].has_add_ons">
              <div class="packageDetails" v-for="addon in manuallySelectedAddons" :key="addon.id">
                <p class="detailsSmall">{{(addon.name)}}</p>
                <p class="detailsValue">{{(formatNumberWithCommas(addon.credits))}}</p>
            </div>
          </div>
          
          </div>
          <div  class="estDeleiveryTimeContainerOne">
            <div class="packageDetails">
              <p class="details">Estimated Delivery Time</p>
              <p class="detailsValue">{{this.deliveryTime(estimatedeliveryTime)}}</p>
            </div>
            <div class="packageDetails" v-if="isNoOfRoofVisible">
              <p class="details">Additional Roof Charges</p>
              <p class="detailsValue">{{costOfAdditionalRoofs}}</p>
            </div>
          </div>
          <div class="estDeleiveryTimeContainerTwo">
            <h3 class="creditBal">Credit Balance</h3>
            <div class="packageDetails">
              <div class="crdtBalChkBoxContainer">
                <el-checkbox v-model="ISPromotionalChecked">
                  Promotional Credit Balance
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Use your bonus credits for sales proposals, revision requests, self-design creation,
                         and some upgrades on a design level.
                      </p>
                    </div>
                  </div>
                </el-checkbox>
              </div>
              <p class="details">{{formatNumberWithCommas(this.credits.promotional_credits)}}</p>
            </div>
          </div>
          <div class="purCredBalContainer">
            <div class="packageDetails">
              <p class="details">Purchased Credit Balance</p>
              <p class="detailsValue">{{formatNumberWithCommas(this.credits.purchased_credits)}}</p>
            </div>
          </div>
          <div class="footerBtnContainer">
            <div class="packageDetails">
              <p class="totalPayCred">Total Payable Credits:</p>
              <p class="totalPayCredVal">{{formatNumberWithCommas(totaPayable)}}</p>
            </div>
            <div class="footerMD">
            <p class="note">
              <span class="boldTxt">Note:</span>
                 {{buttonclickedNEW.template_constant[0].notes}}
            </p>
            <el-checkbox v-model="ISchecked_terms_and_conditions">
              <p class="agreeContent">
                {{buttonclickedNEW.template_constant[0].terms_and_conditions}}
              </p>
            </el-checkbox>
          </div>
            <!-- <el-button class="footerBtn" type="primary"
              >Add 179 Credits</el-button
            > -->
             <!-- <el-button class="footerBtn" :loading="loadingState" v-if="getHeadings().heading ==='PV Design'" type="primary" @click="orderExpertService()" :disabled="!ISchecked_terms_and_conditions">Pay Now</el-button>
            <el-button class="footerBtn" :loading="loadingState" v-else type="primary" :disabled="!ISchecked_terms_and_conditions" @click="orderExpertService()">Order Now</el-button> -->
            <el-button
              class="footerBtn"
              :loading="loadingState"
              type="primary"
              :disabled="!ISchecked_terms_and_conditions"
              @click="dynamicButtonName == 'Pay Now'? orderExpertService() : isAddCreditPopupVisible = true"
            >
              {{dynamicButtonName}}
            </el-button>

          </div>
        </div>
      </div>
    </el-dialog>
    <NewProjectPopup :isNewProjectFormVisible.sync ="isNewProjectFormVisible"/> 
    <add-credit-popup v-if="isAddCreditPopupVisible"
      :isAddCreditPopupVisible.sync="isAddCreditPopupVisible" :preFilledCreditCount ="insufficientCredits"/>
  </div>
</template>
<script>
import NewProjectPopup from "./NewProjectPopup.vue"
import API from '@/services/api/';
import { v4 as uuidv4 } from 'uuid';
import { mapState, mapActions } from "pinia";
import { useCreditsStore } from "../../../stores/credits";
import { useProjectStore } from "../../../stores/project";
import { useMiscStore } from "../../../stores/misc";
import { useLeadStore } from "../../../stores/lead";
import { formatNumberWithCommas } from '@/utils.js'

export default {
  name: "PayNowPopup",
  
  props: {
    isPayNowPopupVisible: {
      type: Boolean,
      default: false,
    },
    buttonclickedNEW:{
      type: Object,
      default() {
        return {}
      }
    },
  },
  components:{
    NewProjectPopup,
  },

  data() {
    return {
      selectedVmodel: '',
      isAddCreditPopupVisible: false,
      basePrice:0,
      totalAddonsCredits:0,
      totaPayable:0,
      isClicked:"",
      isWaitingForPayment: false,
      isconsumptionPopupVisible:false,
      paymentId:'',
      isNewProjectFormVisible:false,
      isChecked:false,
      loadingState:false,

      ISchecked_terms_and_conditions: false,
      ISPromotionalChecked: true,
      selectedAddOnChecked:[],
      isAddCreditPopup: false,
      form: {
        name: "",
      },
      Selectedvalue:{},
      options: [
        {
          value: "Option1",
          label: "Option1",
        },
        {
          value: "Option2",
          label: "Option2",
        },
        {
          value: "Option3",
          label: "Option3",
        },
        {
          value: "Option4",
          label: "Option4",
        },
        {
          value: "Option5",
          label: "Option5",
        },
      ],
      selectedDropdownItem: {},
      avilFeaturesIds:[],
      //TODO Clean this code
      //  correspondingServiceObj : {
      // "Preliminary Proposal":"project_info",
      // "Full Construction Drawing":"project_info",
      // "PV Design":"delivery_info",
      // "Solar Sales Proposal":"delivery_info",
      // "Permit Package":"delivery_info"},
     
      totalNoOfRoofs: 1,
      isNoOfRoofVisible: false,

      
    };
  },
  computed:{
    manuallySelectedAddons() {
      let manuallySelectedAddons = this.selectedAddOnChecked
      if (this.projectId)
       manuallySelectedAddons = this.selectedAddOnChecked.filter(x => !this.getAllFeaturesFromProject.availed_features.includes(x.id))
      return manuallySelectedAddons
    },
    projectId () {
      return this.$route.params.projectId || this.leadInfo?.project_details?.id
    },
    costOfAdditionalRoofs() {
      if (this.totalNoOfRoofs > 0) {
        let costOfAdditionalRoof = this.additionalRoofs * this.selectedDropdownItem.additional_roof.credits
        return costOfAdditionalRoof >= 0 ?  costOfAdditionalRoof : 0;
      }
      return 0 
    },
    additionalRoofs() {
      if(isNaN(this.selectedDropdownItem.base.no_of_free_roofs)) {
        return 0
      }
      return this.totalNoOfRoofs - this.selectedDropdownItem.base.no_of_free_roofs
    },
    addtionalRoofIds() {
      let addtionalRoofIds = []
      if(this.additionalRoofs>0)
        addtionalRoofIds = Array(this.additionalRoofs).fill(this.selectedDropdownItem.additional_roof.id)
        return addtionalRoofIds
    },
    uuid(){
      return  uuidv4();
    },
    userInformation(){
      return JSON.parse(localStorage.getItem('user')).user_id;
    },
    totalCreditBalance() {
      return this.credits.purchased_credits + this.credits.promotional_credits;
    },
    chosenCreditBalance() {
      if (this.ISPromotionalChecked) {
        return this.totalCreditBalance
      } else {
        return this.credits.purchased_credits
      }
    },
    dynamicButtonName() {
      if (this.insufficientCredits > 0) {
        return "Add " + this.insufficientCredits + " credits"
      } else {
        return "Pay Now"
      }
    },
    insufficientCredits() {
      return this.totaPayable - this.chosenCreditBalance
    },
    estimatedeliveryTime() {

      if (this.avilFeaturesIds.length == 0)
              return (this.selectedDropdownItem.base.delivery_time)

      // return this.buttonclickedNEW.template_constant[0].add_ons.filter(item => this.avilFeaturesIds.includes(item.id))
      
      // // this.selectedDropdownItem.base.delivery_time + this.template_constant[0].add
      let requiredAddons = this.$props.buttonclickedNEW.template_constant[0].add_ons.filter(item => this.avilFeaturesIds.includes(item.id));
      let requiredEstimatedTimes = requiredAddons.map(item => item.delivery_time.days * 24 + item.delivery_time.hours);
      let maxDeliveryTime = Math.max(...requiredEstimatedTimes);
      if(maxDeliveryTime<1)
      return (this.selectedDropdownItem.base.delivery_time)

      // console.log (maxDeliveryTime)

    //  console.log('days ; '+ Number(maxDeliveryTime / 24 + this.selectedDropdownItem.base.delivery_time.days))
    //  console.log('hours ; '+ Number(maxDeliveryTime % 24 + this.selectedDropdownItem.base.delivery_time.hours))
      let maxDeliveryTimeJSON = { 
        days : Number(maxDeliveryTime / 24 + this.selectedDropdownItem.base.delivery_time.days),
        hours : Number(maxDeliveryTime % 24 + this.selectedDropdownItem.base.delivery_time.hours)
      }
      return (maxDeliveryTimeJSON)
    },
    ...mapState(useCreditsStore, {
      credits: 'GET_CREDIT_BALANCE',
    }),
    ...mapState(useProjectStore, {
      getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
    }),
    ...mapState(useLeadStore, {
      leadInfo: (state) => state
    })
  },  
  created(){
    this.fetchDefaultSelectedDropdownItem(this.$props.buttonclickedNEW.available_info[0]);
    this.isRoofVisible()
    console.log('paynow',this.$props.buttonclickedNEW);
    console.log('selfDesignInfo',this.$props.buttonclickedNEW.available_info[0]);
  },
  
  methods: {
    availedAddOn(addOnId) {
      if (this.projectId && this.getAllFeaturesFromProject.availed_features.includes(addOnId))
        return true
      return false
    },
    deliveryTime(time, isUsingHere = true) {
      let result = ''
      if (!time) { return result }
      // console.log('see this time  : ' + time.days + ' ' + time.hours, isUsingHere)
      switch(time.days)
      {
        case 0 :
                  result =  ''; break
        case 1 : 
                  result = time.days + ((isUsingHere) ? ' Working Day ':' working day '); break
        default : 
                  result = time.days + ((isUsingHere) ? ' Working Days ':' working days ');    
      }

      switch(time.hours)
      {
        case 0 :
                  result = result + ''; break
        case 1 : 
                  result = result + time.hours + ((isUsingHere) ? ' Working Hour':' working hour'); break
        default : 
                  result = result + time.hours + ((isUsingHere) ? ' Working Hours':' working hours');           
      }

      if(time.minutes){
        result = time.minutes + " minutes";
      }

      

      return result
      // if(time.days == null || time.days == 0)
      //   result =  ''
      // else if (time.days == 1)
      //   result = time.days + ' Working Day'
      // else (time.days > 1)  
      //    result = time.days + ' Working Days'
    },
    optionName(base) {
      if(this.selectedVmodel == 'delivery_type')
      return this.deliveryTime(base.delivery_time)
      return base.type
    },
    // daySuffix(numberOfDays) {
    //     if(numberOfDays == 0 || numberOfDays == null)
    //     return ''
    //     else if (numberOfDays == 1)
    //     return ' Working Day'
    //     else return ' Working Days'
    //   },
    // daySuffix(numberOfHours) {
    //     if(numberOfHours == 0 || numberOfHours == null)
    //     return ''
    //     else if (numberOfHours == 1)
    //     return ' Working Hours'
    //     else return ' Working Hours'
    //   },
    isRoofVisible() {
      if(this.$props.buttonclickedNEW.project_info.length > 0) {
        if(this.$props.buttonclickedNEW.project_info[0].additional_roof) {
        return this.isNoOfRoofVisible = true ;
        }
      }
    },
    addRoofs() {
      return this.totalNoOfRoofs += 1;
    },
    subRoofs() {
      if (this.totalNoOfRoofs > 1) {
        return this.totalNoOfRoofs -= 1;
      }
    },
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),
    ...mapActions(useMiscStore, {
      setWorkingDays: 'SET_WORKING_DAYS',
    }),
    OptionsChange(){
      let credits = 0

      credits = credits + this.selectedDropdownItem.base.credits;
      this.basePrice = credits
      
      this.totaPayable = this.basePrice + this.totalAddonsCredits  + this.costOfAdditionalRoofs;
     
      
    },
    addonsChange(){
      if(this.$props.buttonclickedNEW.template_constant[0].has_add_ons){
        let addonsCredits = 0
        this.avilFeaturesIds = [];
        
        for(let addon of this.manuallySelectedAddons){
          addonsCredits = addonsCredits + addon.credits;
          this.avilFeaturesIds.push(addon.id)
        }

        this.totalAddonsCredits = addonsCredits
        this.totaPayable = this.basePrice + addonsCredits
      }
    },
    calculateAmount(){  
      this.selectedDropdownItem.base.credits 
    },
    fetchDefaultSelectedDropdownItem(serviceType){
      // console.log('Service type : ', serviceType)
      //  let genericInfo = this.correspondingServiceObj[serviceType];
      //  console.log('generic info : ', genericInfo)
       this.selectedDropdownItem = this.$props.buttonclickedNEW[serviceType][0];
       this.basePrice = this.selectedDropdownItem.base.credits
       this.totaPayable = this.basePrice
       this.totalNoOfRoofs = this.selectedDropdownItem.base.no_of_free_roofs ? 1 : 0
    },
    fetchInfo(serviceType){
      // console.log('Service type : ', serviceType)
      //correspondingServiceObj is a json which containes mapping of "service type : info" , in future if new service will come then you need to add service type and need to add corresponding info
      // console.log("@@ styoe",this.correspondingServiceObj[serviceType]);
      // let genericInfo = this.correspondingServiceObj[serviceType];
      let res= this.$props.buttonclickedNEW[serviceType].filter(item => item.base.id != null);
       
     //selectedVmodel is the key to show selected item from options. for us "selected type" (ex:T4) and for non us "selected delivery time"(ex:'4 working hours') 

      if(serviceType == 'delivery_info'){
          this.selectedVmodel = 'delivery_type'
      }else{
         this.selectedVmodel = 'site_size'
      }
      // console.log("##res",res);
      // console.log(this.buttonclickedNEW.template_constant[0].service_type).selectedVmodel
      return res
    },
   
    closenewDesignDialogForm() {
      this.$emit("update:isPayNowPopupVisible", false);
      this.$validator.reset();
    },
    NewProjectFormVisible(){
      this.isNewProjectFormVisible = true;
    },

    async orderExpertService() {
      var diOrPiInfoId = this.selectedDropdownItem.base.id
      this.avilFeaturesIds.push(diOrPiInfoId);
      if (this.totaPayable > this.chosenCreditBalance) {
        this.$message({
          showClose: true,
          message: 'You do not have enough credits to complete this transaction.',
          type: "error",
          center: true
        });
        return 
      }
      this.isWaitingForPayment = true;
      this.loadingState = true;
      this.paymentId = this.uuid;
      const postData = {
        features: this.avilFeaturesIds.concat(this.addtionalRoofIds),
        use_promotional_credits : this.ISPromotionalChecked,
        amount:this.totaPayable,
        // amount:1,
        payment_id: this.paymentId,
        additional_info: {"total":this.totaPayable},
        completed: null,
        completed_time: null,
        created_at: null,
        delayed_by: null,
        modified_at: null,
        notes: null,
        organisation: JSON.parse(localStorage.getItem('user')).organisation_id,
        revision_no: null,
        service_type: this.$props.buttonclickedNEW.template_constant[0].service_type,
        survey_id: null,
        user: this.userInformation,
        user_token: null,
        project: this.projectId,
        design: null,
        available_revisions: this.selectedDropdownItem.base.free_revisions,
        delivery_time: this.estimatedeliveryTime,
        roofs_count : this.totalNoOfRoofs,
        [this.selectedVmodel] : this.selectedDropdownItem.base.type
      };
      try {
        const resp = await API.DESIGNS.PAYMENT_FOR_3DMODEL(postData);
        this.setCreditBalance({
          purchased_credits: resp.data.data.purchased_credits,
          promotional_credits: resp.data.data.promotional_credits
        })
        this.setWorkingDays(this.deliveryTime(this.estimatedeliveryTime, false));
        // this.$emit("timeUpdateEvent", this.deliveryTime(this.estimatedeliveryTime, false));
        if(this.$route.name=='leadSummary'){
          // here true means successful payment and returning as for lead summary we dont require any redirection
          this.$emit('emit-for-payment-status',true,this.paymentId);
          return;

        }
        this.$router.push({ name: 'dashboard', params: {paymentId: this.paymentId} });
      }
      catch(e){
        console.error(e)
        this.loadingState = false;
        this.isWaitingForPayment = false;
        // here false means failed payment
        this.$emit('emit-for-payment-status',false);
      }
    },
    formatNumberWithCommas,
  },
  watch : {
     totalNoOfRoofs: function (val) {
      this.OptionsChange();
    },
  },
};
</script>


<style scoped>

#parentContainer >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

#parentContainer >>> .el-dialog__title {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #1c3366 !important;
}

#parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

#parentContainer >>> .el-dialog {
  border-radius: 8px !important;
  /* min-height: 592px; */
  margin-top: 4vh !important;
  width: 975px;
}

#parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

#parentContainer >>> .el-form-item__label {
  color: #222;
  font-size: 16px;
}

#parentContainer >>> .el-select {
  width: 100%;
  max-width: 300px;
}
#parentContainer >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
}

#parentContainer >>> .el-checkbox__inner {
  border: 1px solid #777;
}

.container {
  display: grid;
  grid-template-columns: 60% 40%;
  word-break: break-word;
}

.leftContainer {
  border-right: 1px solid #ccc;
  padding: 24px 16px 24px 24px;
  position: relative;
}

.rightContainer {
  padding: 24px 24px 24px 16px;
}

.headerContainer {
  border-bottom: 1px solid #ccc;
  padding-bottom: 12px;
}

.headings {
  font-size: 18px;
  font-weight: 600;
  color: #1c3366;
  margin-bottom: 8px;
}

.headContent {
  font-size: 14px;
  font-weight: 100;
  color: #222;
  line-height: 1.5;
}

.chkBoxLI {
  font-size: 16px;
  color: #222;
}

.chkBoxLI:before {
  content: '✓';
  margin-right: 12px;
  color: #0fbc0f;
  font-size: 14px;
}

.labelDrpDwn {
  font-size: 14px;
  color: #222;
  margin-bottom: 4px;
  display: block;
}
 

.drpDownContainer,
.checkBoxContainer,
.purCredBalContainer,
.estDeleiveryTimeContainerOne,
.estDeleiveryTimeContainerTwo {
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
  display: grid;
  grid-template-columns: auto;
  gap: 13px;
}

.drpDownContainerCondition {
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.noOfRoofContainer {
  position: relative;
}

.noOfRoofInput {
  background-color: #e8edf2;
  border: none;
  color: #222;
  font-size: 16px;
  height: 48px;
  padding: 8px 16px;
  width: 100%;
}

.upperArrow {
  position: absolute;
  cursor: pointer;
  bottom: 26px;
  right: 12px;
}

.downArrow {
  position: absolute;
  cursor: pointer;
  bottom: 16px;
  right: 12px;
}
.checkBoxContainer {
  border-bottom: none;
}

.addHeight {
  min-height: 192px;
}
.estDeleiveryTimeContainerTwo {
  border-bottom: none;
  padding-bottom: 0px;
}

.selectedPayments {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 16px 0px;
}

.selectedPaymentsHeight {
  min-height: 143px;
  border-bottom: 1px solid #ccc;
}

.drpDownType {
  font-size: 16px;
  color: #222;
}

.drpDownCredits {
  float: right;
  font-size: 14px;
  color: #222;
}

.drpDownDes {
  display: block;
  margin-top: -12px;
  color: #777;
  font-size: 14px;
}

#parentContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

#parentContainer >>> ::placeholder {
  color: #222;
}

.drpDwnHeight {
  height: auto;
}

.hover_information {
  display: inline-block;
  position: relative;
  margin-left: 4px;
}

.hover_information .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 300px;
  left: -15px;
  bottom: 100%;
  visibility: hidden;
  opacity: 0;
  transition: all ease-in-out 0.35s;
  z-index: 100;
}

.hover_information .tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
  white-space: initial;
}
.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.fa-info-circle {
  color: #777;
  cursor: pointer;
}

.footer {
  margin-top: 10px;
  position: absolute;
  bottom: 24px;
  margin-right: 16px;
  border-top: 1px solid #ccc;
  padding-top: 16px;
}

.footerMD {
  display: none;
}

.note {
  color: #777;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
}

.boldTxt {
  font-weight: 600;
  color: #222;
}

#parentContainer >>> .el-checkbox {
  display: flex;
  margin-right: 0px;
}

#parentContainer >>> .el-checkbox__inner {
  width: 20px;
  height: 20px;
}

#parentContainer >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

#parentContainer >>> .el-checkbox__label {
  color: #222;
  font-size: 16px;
  white-space: initial;
  padding-left: 12px;
}

.footer >>> .el-checkbox__label {
  color: #222;
  font-size: 14px;
  white-space: initial;
  padding-left: 12px;
}

#parentContainer >>> .el-checkbox__inner::after {
  top: 3px;
  left: 7px;
  border-width: 2px;
}

.agreeContent {
  font-size: 14px;
  line-height: 1.5;
  white-space: initial;
}

.packageDetails {
  display: flex;
  justify-content: space-between;
}

.totalNoOfRoofs,
.roofContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.roofContainer {
  gap: 4px;
}

.circleRoofAdd,
.circleRoofSub {
  padding: 0px 6px 3px 6px;
  border: 1px solid #222;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}

.circleRoofSub {
  padding: 0px 7.5px 3px 7.5px;
}


.details,
.detailsValue {
  font-size: 16px;
  color: #222;
}

.detailsSmall {
  font-size: 14px;
  color: #222;
}

.creditBal {
  color: #1c3366;
  font-size: 16px;
  font-weight: 600;
}

.footerBtnContainer {
  padding: 16px 0px 0px 0px;
}

.totalPayCred,
.totalPayCredVal {
  font-weight: 600;
  font-size: 16px;
  color: #222;
  padding-bottom: 21px;
}

.footerBtn {
  font-size: 18px;
  font-weight: 600;
  width: 100%;
}

@media (max-width: 1285px) {
  .hover_information .tooltip {
    border-radius: 8px;
    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
    border: solid 1px var(--light-m);
    background-color: var(--white);
    padding: 12px;
    position: absolute;
    width: 27vw;
    left: -14vw;
    bottom: 100%;
    visibility: hidden;
    opacity: 0;
    transition: all ease-in-out 0.35s;
    z-index: 100;
  }
}


@media (max-width: 1000px) {
  #parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
    margin-top: 0vh !important;
    max-height: auto !important;
  }

  #parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
    height: auto;
  }

  #parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  #parentContainer >>> .el-dialog__body {
    overflow: hidden;
    overflow-y: scroll;
    height: 76vh;
    margin-bottom: 16px;
  }

  .container {
    grid-template-columns: 1fr;
  }

  .leftContainer {
    padding: 16px 16px 0px 16px;
    border-bottom: 1px solid #ccc;
    border-right: none;
  }

  .drpDownWidth {
    max-width: 300px;
  }

  .rightContainer {
    padding: 16px 16px 0px 16px;
  }

  #parentContainer >>> .el-select {
    width: 100%;
    max-width: initial;
  }

  .footerMD {
    display: block;
    margin-bottom: 16px;
    border-top: 1px solid #ccc;
    padding-top: 16px;
  }

  .footer {
    display: none;
  }

  .selectedPaymentsHeight {
    min-height: initial;
    border-bottom: none;
  }
}

@media (max-width: 500px) {
  .drpDownContainerCondition {
    grid-template-columns: 1fr;
  }
}








/* .el-dialog__wrapper {
   margin-top: 2vh !important; 
} */
/* .footerContent{
  padding: 8px 20px;
  word-break:break-word;
}
.deleteModule .delete_module >>> .el-textarea__inner {
  background-color: rgb(232, 237, 242) !important;
  border: none !important;
}

.deleteModule .delete_module >>> .el-dialog {
  width: 580px !important;
  border-radius: 8px;
  margin-top: 1vh !important;
}



.deleteModule .delete_module >>> .el-dialog__body {
  padding: 0 !important;
}

.deleteModule .delete_module >>> .el-dialog__header {
  margin-bottom: 0 !important;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  height: 50px;
  background-color: #e8edf2;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}


.deleteModule .delete_module >>> .el-dialog__title {
    color: #222 !important;
    margin-left: 10px;
    font-family: Helvetica Neue;
    font-size: 16px;
    font-weight: 700;
}

.deleteModule .delete_module >>> .el-dialog__close {
    color: #222222 !important;
    font-weight: 600;
    font-size: 25px !important;
    margin-right: -12px;
}

.sameColor {
  color: #263342;
  font-weight: 600;
}

.containerFour {
  padding: 20px;
}

.checkDiv{
  display: flex;
  margin-top: 10px;
}

.footerCont{
  color: #777;
  font-weight: 100;
  word-break: break-word;
  font-size: 14px;
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

.flexProperty {
  display: flex;
  justify-content: space-between;
}
.container >>> .el-checkbox{
    margin-right: 12px !important;
    padding-top: 2px;
}
.payBtn{
  justify-content: right;
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

.newHeadCont {
  margin: 20px auto;
}

.boldHead {
  font-size: 18px;
  font-weight: 600;
  color: #263342;
}

.newHeadSmall {
  font-size: 14px;
  font-weight: 100;
  color: #777;
  margin-top: 6px;
}

.container >>> .el-checkbox {
  margin-bottom: 20px;
}

.checkDiv >>> .el-checkbox {
  margin-bottom: 20px;
  margin-right: 13px !important;
  padding-top: 2px;
}

.deleteModule .delete_module >>> .el-dialog__footer {
  padding: 0px !important;
  text-align: left;
  margin-top: 0;
}

.deleteModule .delete_module >>> .el-dialog__footer .note{
  color: #222;
  font-size: 14px;
}


.deleteModule .delete_module >>> .el-dialog__footer .noteStmt{
  color: #777;
  font-size: 14px;
}

.checkDiv >>> .el-checkbox__inner {
  border: 1px solid #263342 !important;
}

.checkDiv >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #263342 !important;
  border-color: #263342 !important;
}

.checkDiv >>> .el-checkbox__inner:hover {
  border-color: #263342 !important;
}

.deleteModule >>> .el-dialog__wrapper {
    top: 0 !important;
    overflow: visible;
  }
.el-dialog__wrapper {
   overflow: hidden;
   margin-top: 7vh !important;
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
  background-color: #e8edf2;
  border-radius: 4px;
  padding: 0 16px;
}

.balanceValue {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 16px;
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

.btnContainer >>> .el-button {
  font-size: 18px !important;
}

@media (max-width: 600px) {
  .deleteModule .delete_module >>> .el-dialog {
    width: 338px !important;
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
} */
</style>


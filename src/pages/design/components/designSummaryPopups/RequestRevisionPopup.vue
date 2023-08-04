<template>
  <div id="parentContainer" @dragover="dragover" @drop="drop">
    <el-dialog
      :visible="isRequestRevisionPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 976px"
      title="Request Revision"
      width="976px"
      @close="onDialogClose"
    >
      <div class="container">
        <!-- <p class="content" v-if="notFreeReqRevision">
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore.
        </p>
        <div class="flexCont" v-if="notFreeReqRevision">
          <div
            class="cardOne"
            :class="{ activeSettingOne }"
            @click="toggleClassSettingCardOne()"
          >
            <div class="circle" v-if="activeSettingOne"><div class="innerCircle"></div></div>
            <p class="rivisons">1 Revision</p>
            <p class="price">$5</p>
          </div>
          <div
            class="cardTwo"
            :class="{ activeSettingTwo }"
            @click="toggleClassSettingCardTwo()"
          >
            <div class="circle" v-if="activeSettingTwo"><div class="innerCircle"></div></div>
            <p class="rivisons">3 Revision</p>
            <p class="price">$12</p>
          </div>
          <div
            class="cardThree"
            :class="{ activeSettingThree }"
            @click="toggleClassSettingCardThree()"
          >
            <div class="circle" v-if="activeSettingThree"><div class="innerCircle"></div></div>
            <p class="rivisons">5 Revision</p>
            <p class="price">$20</p>
          </div>
        </div> -->
        <div class="leftContainer">
        <div class="flexContFree">
          <div class="flexContTwo">
            <p class="promotional">Free Revisions Left: {{freeRevisionsLeft}}</p>
          </div>
        </div>
        <hr class="hrTag" />
          <!-- <div class="headerContainer" v-if="serviceTemplateInfo['0']['input_dropdown']['0'] == 'project_info'">
            <p class="headContent">
              Upgrade Order Type
            </p>
          </div> -->
          <!-- <div v-if="isInfoInCheckbox" >
            <el-checkbox-group v-model="availedFeaturesIdsList" class="checkBoxContainer">
            <el-checkbox :label="option.id"  v-for="option in availableFeaturesInCheckbox"  :key="option.id" :disabled="option.isSelected"
              >{{option.name}} ({{option.credits + ' Credits'}})
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The percentage of system cost minus grants that will be
                    financed with the loan
                  </p>
                </div>
              </div>
            </el-checkbox>
            </el-checkbox-group>
          </div> -->
        <label for="addInfo" class="addInfoHeading">Describe your required changes</label
        ><br />
        <textarea id="addInfo" placeholder="Please be as detailed as possible" v-model="description">
        </textarea>
        <!-- {{ fileList }} -->
        <!-- {{ description }} -->
        <div class="filesNameContainer">
          <div class="fileNameCont" v-for="(file, i) in fileList" :key="i">
            
            <p class="fileName"><abbr :title = file.name class="abbrTag">{{ file.name }}</abbr></p>
            <img
              src="../../../../assets/drop/Group 1845.svg"
              class="crossIcon"
              @click="remove(i)"
            />
          </div>
        </div>
        <div class="uploadCont">
          <label class="select_label">
            <img
              src="../../../../assets/drop/Group 1805.svg"
              class="uploadIcon"
            />
            <input
                class="btn btn-outline"
                type="file"
                ref="file"
                @change="onChange"
                multiple
              />
            <p class="upload">Upload File</p>
            <!-- {{ resId }} -->
            <!-- {{ order_status }} -->
          </label>
          <!--<h3 class="containerNote">* Only .tm2, .tm3 and .csv formats supported</h3>-->
        </div>
          <div class="cardsContainer" v-if="dropdownOptionsAvailable">
            <div class="cards ">
              <button @click="toggle()" class="accordion">
                Upgrade Order
                <img src="@/assets/img/Group 2172.svg" class="whiteArrFAQ" />
              </button>
              <div class="panel" v-show="isOpen">
                <div :class="['drpDownContainer', dropdownOptionsAvailable ? 'drpDownContainerCondition' : '']" v-if="dropdownOptionsAvailable">
                  <div :class="dropdownOptionsAvailable ? '' : 'drpDownWidth'">
                    <label class="labelDrpDwn" v-if="dropdownOptionsAvailable">Upgrade Order Type</label>
                    <el-select v-model="selectedOption" placeholder="Select" @change="sizeChanged(selectedOption)">
                      <el-option
                        v-for="options in availableFeaturesInDropdown "
                        :key="options.id"
                        :value="options.type"
                        class="loanDropdown"
                      >
                      <div class="flexContainer">
                        <div class="">
                          <p class="flexContainer">
                            {{options.type }}
                          </p>
                          <p class="uptoKW">{{options.description}}</p>
                        </div>                                    
                          <p class="droDwnCredits">{{options.credits - prev_base_type["0"]["base"]["credits"]}} Credits</p>
                      </div>   
                      </el-option>
                    </el-select>
                  </div>
                  <div class="noOfRoofContainer" v-if="dropdownOptionsAvailable">
                    <label class="labelDrpDwn">No. of additional roofs
                      <div class="hover_information">
                          <i class="fas fa-info-circle"></i>
                          <div class="tooltip">
                            <p>
                              Use your bonus credits for sales proposals, revision requests, self-design creation, and some upgrades on a design level.
                            </p>
                          </div>
                      </div>
                    </label>
                    <!-- <input type="number" v-model="noOfAdditionalRoof"  class="noOfRoofInput"/>
                    <img src="../../../../assets/drop/Path 118.png"  class="upperArrow" />
                    <img src="../../../../assets/drop/Path 119.png" class="downArrow" /> -->
                    <div class="roofCont">
                      <p class="subRoof" @click="subRoofs">-</p>
                      <p class="roofNo">{{ noOfAdditionalRoof }}</p>
                      <p class="addRoof" @click="addRoofs">+</p>
                    </div>
                  </div>
                </div>
                  <!-- NTBD -->
                <ul class="checkBoxContainer" v-if="dropdownOptionsAvailable"> 
                  <li class="chkBoxLI">Size in kW - {{base_type["0"]["base"].max_size_kw}}</li>
                  <li class="chkBoxLI">Number of Free Roofs - {{base_type["0"]["base"].no_of_free_roofs}}</li>
                  <li class="chkBoxLI">Free Revisions - {{base_type["0"]["base"].free_revisions}}</li>
                  <li class="chkBoxLI">Delivery Time - {{ base_type["0"]["base"].delivery_time.days}} {{daySuffix(base_type["0"]["base"].delivery_time.days)}}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="rightContainer">
            <div class="headerContainerTwo">
              <h3 class="headings" :style="[
                      !priceInfoHeight
                      ? {'margin-bottom': '20px'}
                      : {},
                  ]">Payment Details</h3>
            </div>
           <!-- <div class="selectedPaymentsUpgrade" v-if="isInfoInCheckbox">
            <div class="packageDetails" v-for="data in availableFeaturesInCheckbox" :key="data.id"  >
              <p class="detailsSmall" v-if="!data.isSelected && availedFeaturesIdsList.includes(data.id)">Order Type {{data.name}}</p>
              <p class="detailsValue" v-if="!data.isSelected && availedFeaturesIdsList.includes(data.id)">{{data.credits}} Credits</p>
            </div>
          </div> -->
            <hr class="hrTag"  v-if="!selectedDropdownObj.type || !dropdownOptionsAvailable"/>
            <div class="selectedPayments" :style="[
                      priceInfoHeight
                      ? {'min-height': '290px'}
                      : {'min-height': '210px'},
                  ]">

              <div class="selectedPaymentsUpgrade" v-if="dropdownOptionsAvailable && selectedDropdownObj.type">
                <div class="packageDetails" v-if="selectedOption">
                    <p class="detailsSmall">Order Type {{selectedDropdownObj.type}}</p>
                    <p class="detailsValue" >{{formatNumberWithCommas(selectedDropdownObj.credits - prev_base_type["0"]["base"]["credits"])}} Credits</p>
                  </div>
              </div>
              <div class="packageDetails">
                <p class="detailsSmall">Request Revision</p>
                <p class="detailsValue">{{freeRevisionsLeft ? 0 : additionalCreditsForRevision}} Credits</p>
              </div>
              <div class="packageDetails" v-if="additionalRoofCost" >
                <p class="details">Additional Roof Charges</p>
                <p class="detailsValue">{{formatNumberWithCommas(additionalRoofCost)}} Credits</p>
              </div>
              <!-- <div class="packageDetails" v-if="serviceTemplateInfo['0']['input_dropdown']['0'] == 'project_info'">
              <div class="roofContainer">
                <p class="details">Number of Roofs</p>
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        The percentage of system cost minus grants that will be
                        financed with the loan
                      </p>
                    </div>
                </div>
              </div>
              <div class="noOfRoof">
                <p class="detailsValue circleRoof" @click="subRoofs">-</p>
                <p class="detailsValue">{{noOfAdditionalRoof}}</p>
                <p class="detailsValue circleRoof" @click="addRoofs">+</p>
              </div>
            </div>   -->
          </div>
            <div class="estDeleiveryTimeContainerTwo">
              <h3 class="creditBal">Credit Balance</h3>
            <div class="packageDetails">
              <div class="crdtBalChkBoxContainer">
                <el-checkbox v-model="isUsingPromotionalBalance"
                  >Promotional Credit Balance
                  <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Use your bonus credits for sales proposals, revision requests, self-design creation, and some upgrades on a design level.
                      </p>
                    </div>
                  </div>
                </el-checkbox>
              </div>
              <p class="details">{{formatNumberWithCommas(credits.promotional_credits)}} Credits</p>
            </div>
            </div>
            <div class="purCredBalContainer">
              <div class="packageDetails">
                <p class="detailsSmall">Purchased Credit Balance</p>
                <p class="detailsValue">{{formatNumberWithCommas(credits.purchased_credits)}} Credits</p>
              </div>
            </div>
            <div class="footerBtnContainer">
              <div class="packageDetails">
                <p class="totalPayCred">Total Payable Credits:</p>
                <p class="totalPayCredVal">{{formatNumberWithCommas(payableCredits)}} Credits</p>
              </div>    
            <el-button
              class="footerBtn"
              type="primary"
              :loading="inExecution"
              @click="dynamicButtonName == 'Request Now' ? requestRevisionClick() : isAddCreditPopupVisible = true"
            >
              {{dynamicButtonName}}
            </el-button>
            </div>
          </div>
      </div>
    </el-dialog>
    <add-credit-popup 
      v-if="isAddCreditPopupVisible"
      :isAddCreditPopupVisible.sync="isAddCreditPopupVisible" 
      :preFilledCreditCount ="insufficientCredits"
      />
  </div>
</template>

<script>
import API from '@/services/api/';
import { mapState, mapActions } from 'pinia';
import { useCreditsStore } from '../../../../stores/credits';
import { getServiceSpecificInfo } from "@/pages/utils/utils.js";
import { formatNumberWithCommas } from '@/utils.js'
import { useProjectStore } from '../../../../stores/project';
import { useDesignStore } from '../../../../stores/design';
export default {
  name: "requestRevisionPopup",

  props: {
    featuresArray:{
      type: Object,
      default: {},
    },
    requestServiceType : {
      type: String
    },
    isRequestRevisionPopupVisible: {
      type: Boolean,
      default: false,
    },
    resId: {
      type: Number,
    },
    revision_notes:{
      type: Array
    },
    available_revisions:{
      type: Number
    },
    project_type:{
      type: String,
      default: "T1"
    },
    design_type:{
      type: String,
      default: "Base"
    },
    order_type:{
      type: String,
      default: null
    },
  },

  data() {
    return {
      isOpen: false,
      expertServiceInfo: null,
      isSizeChanged: false,
      correspondingServiceObj : {
      "Preliminary Proposal":"project_info",
      "Full Construction Drawing":"project_info",
      "PV Design":"delivery_info",
      "Solar Sales Proposal":"delivery_info",
      "Permit Package":"delivery_info"},
      additionalRoofCost: 0,
      noOfAdditionalRoof: 0,
      isUsingPromotionalBalance: true,
      selectedOption: '',
      serviceTemplateInfo:{},
      isInfoInCheckbox:false,
      isInfoInDropdown:false,
      availableFeaturesInCheckbox:[],
      availableFeaturesInDropdown:[],
      // projectId: this.$route.params.projectId,
      availedFeaturesIdsList : [],
      availedFeaturesIdsListInitial: [],
      isLoading:false,
      loadingStateButton:false,
      serviceInfo: null,
      base_type: null,
      prev_base_type: null,
      additionalCreditsForRevision: 0,
      freeRevesionSpec: 0,
      checked : true,
      isAddCreditPopupVisible: false,
      inExecution: false,
      activeSettingOne: false,
      activeSettingTwo: false,
      activeSettingThree: false,
      fileList: [],
      dragFileList:[],
      description: '',
      order_status: '',
      revisionNotesArray: [],
      revisionVersion:1,
      fileSize:0,
      maxFileSize:52428800.0,
      UploadFileType:"",
      fileTypeIncorrect:false,
      totalNoOfRoofs: 1,
    };
  },

  created(){
    this.revisionNotesArray = this.$props.revision_notes
    this.available_revisions = this.$props.available_revisions
    this.getAllAvailableFeatures();
    this.fetchAvailedFeaturesID();
     this.serviceInfo = getServiceSpecificInfo(this.requestServiceType);
    this.base_type = this.serviceInfo[this.details_list].filter(obj => {
      return obj.base.type == this.order_type;
    });
    this.prev_base_type = this.base_type;
    this.selectedOption = this.order_type;
  },

  computed: {
    ...mapState(useCreditsStore, {
      credits: 'GET_CREDIT_BALANCE',
    }),
    ...mapState(useDesignStore, {
      projectIdFromStore:  (state) => state.project.id,
    }),
    ...mapState(useProjectStore, {
      getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
    }),
    ...mapState(useDesignStore, {
      getAllFeaturesFromDesign : 'GET_TOTAL_FEATURES',
    }),

    priceInfoHeight(){
      if(this.dropdownOptionsAvailable){
        if(this.isSizeChanged){
          return true;
        }
        return false;
      }
      else{
        return false;
      }
    },

    chosenCreditBalance() {
      if (this.isUsingPromotionalBalance) {
        return this.totalCredits
      } else {
        return this.credits.purchased_credits
      }
    },

    dropdownOptionsAvailable() {
      return this.serviceTemplateInfo['0']['input_dropdown']['0'] == 'project_info'
    },

    dynamicButtonName() {
      if (this.insufficientCredits > 0) {
        return "Add " + this.insufficientCredits + " credits"
      } else {
        return "Request Now"
      }
    },

    insufficientCredits() {
      return this.payableCredits - this.chosenCreditBalance
    },

    getAllFeatures(){
      if(this.$route.params.projectId && this.getAllFeaturesFromProject.available_features)
        return this.getAllFeaturesFromProject
      else if(this.$route.params.designId && this.getAllFeaturesFromDesign.available_features)
        return  this.getAllFeaturesFromDesign

      // return ( this.getAllFeaturesFromProject || this.getAllFeaturesFromDesign);
    },
    projectId(){
      return (this.$route.params.projectId || this.projectIdFromStore);
    },
    ISUs() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    listOfIdsToPurchaseNow(){
      let tempArray=[];
      if(this.isInfoInCheckbox){
        for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
          let data = this.availableFeaturesInCheckbox[i];
          if(!data.isSelected && this.availedFeaturesIdsList.includes(data.id)){
              tempArray.push(data.id);
          }
        }
      }
      if(this.isInfoInDropdown){
        tempArray.push(this.selectedDropdownObj.id);
      }
      return tempArray;
    },
    extraCreditsRequired(){
      if(this.totalPayableCredits> (this.credits.promotional_credits + this.credits.purchased_credits)){
        return this.totalPayableCredits - (this.credits.promotional_credits + this.credits.purchased_credits);
      }
      else return 0;
    },
    selectedDropdownObj(){
      let tempObj = {
        "type":'',
        "credits":'',
        "description":'',
        "id":'',
      }
      for(let i=0;i<this.availableFeaturesInDropdown.length;i++){
        let currentObj = this.availableFeaturesInDropdown[i];
        if(currentObj.type == this.selectedOption ){
          tempObj.type = currentObj.type;
          tempObj.credits = currentObj.credits;
          tempObj.description = currentObj.description;
          tempObj.id = currentObj.id;
          return tempObj;
        }
      }
      return tempObj;
    },
    isAddCredit(){
      if(this.checked){
        return !this.inExecution && this.totalCredits >= this.credits.purchased_credits;
      }
      else{
        return !this.inExecution && this.totalCredits >= this.payableCredits;
      }
    },

    servType(){
      let data = getServiceSpecificInfo(this.requestServiceType);

    },
    details_list(){
      return this.serviceTemplateInfo['0']['input_dropdown']['0'];
    },
    totalCredits() {
      return this.credits.purchased_credits + this.credits.promotional_credits;
    },
    freeRevisionsLeft(){
      return this.available_revisions;
    },
    payableCredits(){
      let data = getServiceSpecificInfo(this.requestServiceType);
      this.base_type = this.serviceInfo[this.details_list].filter(obj => {
        return obj.base.type == this.selectedOption;
      });
      let tierChangeCost = this.base_type["0"]["base"]["credits"] - this.prev_base_type["0"]["base"]["credits"]
      this.additionalCreditsForRevision = this.base_type["0"]["additional_revision"]["credits"];
      this.freeRevesionSpec = this.base_type["0"]["base"]["free_revisions"];
      let payableCreditFreeApplied =  this.freeRevisionsLeft ? 0 : this.additionalCreditsForRevision;
      this.additionalRoofCost = this.noOfAdditionalRoof ? this.noOfAdditionalRoof*this.base_type["0"]["additional_roof"]["credits"] : 0;
      return this.freeRevisionsLeft ? tierChangeCost + this.additionalRoofCost : tierChangeCost + payableCreditFreeApplied + this.additionalRoofCost;
    },
  },


  methods: {
    ...mapActions(useCreditsStore, {
      setCreditBalance: "SET_CREDIT_BALANCE",
    }),

    toggle() {
      this.isOpen=!this.isOpen;
    },

    sizeChanged(selectedOption){
      this.selectedOption = selectedOption
      this.isSizeChanged = true;
    },

        daySuffix(numberOfDays) {
        if(numberOfDays == 0 || numberOfDays == null)
        return ''
        else if (numberOfDays == 1)
        return ' Working Day'
        else return ' Working Days'
      },
    


    subRoofs() {
        if (this.noOfAdditionalRoof) {
				//  return this.noOfRoofs -= 1;
        return this.noOfAdditionalRoof -= 1;
			}
      },
     addRoofs() {
        // return this.noOfRoofs += 1;
        return this.noOfAdditionalRoof += 1;
      },
     currentTimestamp() {
      // var mydate = new Date().valueOf();
      var mydate = new Date();
      return mydate;
    },
    scrollToBottom() {
      let container = document.querySelector(".container");
      container.scrollTop = container.scrollHeight;
    },
    dragover(event) {
      event.preventDefault();
    },
    drop(event) {
     event.preventDefault();
     this.$refs.file.files = event.dataTransfer.files;
     this.onChange();
    },
    onChange() {
     this.fileList = [...this.fileList, ...this.$refs.file.files]
     this.fileSizeValidation(this.fileList);
     this.fileTypeValidation(this.fileList);
      setTimeout(this.scrollToBottom, 10);
    },
    remove(index) {
      this.fileSize = 0;
      this.UploadFileType="";
       let temp = Array.from(this.fileList);
      temp.splice(index, 1);
      this.fileList = temp;
      this.fileSizeValidation(this.fileList);
      this.fileTypeValidation(this.fileList);
    },
    fileSizeValidation(fileList){
     for(let i=0;i<fileList.length;i++){
        this.fileSize += parseInt(fileList[i].size);
        }
    },
    fileTypeValidation(fileList){
       for (let j= 0; j<fileList.length; j++) {
         this.UploadFileType = fileList[j];
         if(this.UploadFileType.type==='application/x-msdownload' ){
           this.fileTypeIncorrect = true;
           return;
         }
          this.fileTypeIncorrect = false;
       }
    },

    async requestRevisionClick() {
       if(this.fileSize > this.maxFileSize){
           this.$message({
              showClose: true,
              message:"The maximum file size can not exceed 50MB.",
              type: 'error',
              center: true
              });
        return;
      }
      this.fileTypeValidation(this.fileList);
      if(this.fileTypeIncorrect){
          this.$message({
              showClose: true,
              message:".exe file format not supported",
              type: 'error',
              center: true
              });
          return;
        }
    //   let credits = {
    //     purchased_credits: this.credits.purchased_credits,
    //     promotional_credits: this.credits.promotional_credits,
    //   }
    // if(this.checked){
    //   if(this.credits.promotional_credits){
    //     if(this.credits.promotional_credits > this.payableCredits){
    //       credits.promotional_credits-=this.payableCredits;     
    //     }
    //     else{
    //       credits.promotional_credits = 0;
    //       credits.purchased_credits = this.payableCredits - this.credits.promotional_credits;
    //     }
    //   }
    //   else{
    //     credits.purchased_credits -= this.payableCredits;
    //   }
    // }
    // else{
    //   if(this.credits.purchased_credits){
    //     if(this.credits.purchased_credits > this.payableCredits){
    //       credits.purchased_credits-=this.payableCredits;
    //     }
    //     else{
    //         this.$message({
    //           showClose: true,
    //           message:"Please tick the checkbox or add some purchased Credits",
    //           type: 'error',
    //           center: true
    //           });
    //           return;
    //     }
    //   }
    //   else{
    //         this.$message({
    //           showClose: true,
    //           message:"Please tick the checkbox or add some purchased Credits",
    //           type: 'error',
    //           center: true
    //           });
    //           return;
    //   }
    // }
    this.inExecution=true;
      const latestVersion = this.revisionNotesArray.length + 1;
     let obj = {
      "notes": this.description,
      "version":latestVersion,
      "revision_created_at": this.currentTimestamp(),
     }
      this.revisionNotesArray.push(obj)
      try {
      let patchData = new FormData();
       for(var i=0;i<this.fileList.length;i++){
         patchData.append("file[]",this.fileList[i]);
       }

      var featuresArray = [];   
      if(this.freeRevisionsLeft){
        if(this.dropdownOptionsAvailable){
          featuresArray = Array(parseInt(this.noOfAdditionalRoof)).fill(this.base_type["0"]["additional_roof"]["id"]);
          if(this.isSizeChanged){
            featuresArray.push(this.base_type["0"]["base"]["id"]);
          }
        }
      } else {
        if(this.dropdownOptionsAvailable){
          featuresArray = Array(parseInt(this.noOfAdditionalRoof)).fill(this.base_type["0"]["additional_roof"]["id"]);
          if(this.isSizeChanged){
            featuresArray.push(this.base_type["0"]["base"]["id"]);
          }
        }
        featuresArray.push(this.base_type["0"]["additional_revision"]["id"]);
      }
      featuresArray = JSON.stringify(featuresArray);
      patchData.append("features", featuresArray); 
      let convertArray= JSON.stringify(this.revisionNotesArray)
         patchData.append("revision_notes", convertArray); 
         patchData.append("order",this.resId);
         patchData.append("tags",latestVersion);
         patchData.append("uploaded_by","installer");
         patchData.append("project",this.projectId);
         patchData.append("use_promotional_credits", this.isUsingPromotionalBalance); 
        const response = await API.DESIGNS.REQUEST_REVISION_DATA_TO_BACKEND(this.resId, patchData);
        let credits = {
          purchased_credits: response.data.credits.purchased_credits,
          promotional_credits: response.data.credits.promotional_credits,
        }
        this.setCreditBalance(credits);
        // if(response.status == 200){
             this.$emit("confirmRevisionNote",true);
        // }
        this.order_status = response.data.order_status;
        this.$message({
          showClose: true,
          message: "Your  request has been successfully recieved",
          type: "success",
          center: true
        });
      }
      catch(e) {
        console.log(e);
        this.$message({
          showClose: true,
          message: "Request Revision Failed",
          type: "error",
          center: true
      });
      }
      this.onDialogClose();
      this.inExecution = false;
    },
    onDialogClose() {
      this.$emit("update:isRequestRevisionPopupVisible", false);
    },
    getAllAvailableFeatures(){
      this.serviceTemplateInfo =  JSON.parse(localStorage.getItem("allServicesInfo")).service_templates.filter(obj => {
        return obj["template_constant"]["0"]["service_type"] === this.requestServiceType;
      });    
      this.expertServiceInfo = this.serviceTemplateInfo["0"][this.serviceTemplateInfo["0"]["input_dropdown"]["0"]];  
      this.expertServiceInfo = this.expertServiceInfo.map(function(value) {
        return value["base"]; 
      });
      if(this.serviceTemplateInfo["0"]['input_checkbox'] && this.serviceTemplateInfo["0"]['input_checkbox'].length){
        this.isInfoInCheckbox = true;
        this.availableFeaturesInCheckbox = this.expertServiceInfo;
      }
      else if(this.serviceTemplateInfo["0"]['input_dropdown'] && this.serviceTemplateInfo["0"]['input_dropdown'].length){
        this.isInfoInDropdown = true;
        this.availableFeaturesInDropdown = this.expertServiceInfo;
      }
    },
    async fetchAvailedFeaturesID(){
      try{
        this.isLoading = true;
        this.availedFeaturesIdsList = [... this.featuresArray.availed_features];
        this.availedFeaturesIdsListInitial = [... this.featuresArray.availed_features];
        this.assignMoreKeyToTotalAvaibleObj(this.availedFeaturesIdsList);
        if(this.isInfoInDropdown){
          let tempArray = [];
          for(let i=0;i<this.availableFeaturesInDropdown.length;i++){
            let data = this.availableFeaturesInDropdown[i];
            if(!this.availedFeaturesIdsList.includes(data.id)){
              tempArray.push(data);
            } 
          }
          this.availableFeaturesInDropdown= [... tempArray];
        }
        this.isLoading = false;
      }
      catch(e){
        this.isLoading = false;
        this.$message({
          showClose: true,
          message: "Not able to fetch availed Features",
          type: "error",
          center: true
        });
      }
    },
    assignMoreKeyToTotalAvaibleObj(availedIDsList){
      for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
        if(availedIDsList.includes(this.availableFeaturesInCheckbox[i].id)){
          this.availableFeaturesInCheckbox[i]['isSelected'] = true;
        }
        else{
          this.availableFeaturesInCheckbox[i]['isSelected'] = false;
        }
      }
    },
    toggleClassSettingCardOne() {
      this.activeSettingOne = !this.activeSettingOne;
      this.activeSettingTwo = false;
      this.activeSettingThree = false;
    },
    toggleClassSettingCardTwo() {
      this.activeSettingTwo = !this.activeSettingTwo;
      this.activeSettingOne = false;
      this.activeSettingThree = false;
    },
    toggleClassSettingCardThree() {
      this.activeSettingThree = !this.activeSettingThree;
      this.activeSettingTwo = false;
      this.activeSettingTwo = false;
    },
    formatNumberWithCommas,
  },
};
</script>

<style scoped>


#parentContainer >>> .el-select-dropdown__item  {
    height: auto !important;
  }



.btn-outline {
  display: none;
}

.abbrTag{
  text-decoration: none;
}
.containerNote{
  color: #222;
  font-size: 11px;
  font-weight: 100;
  margin-bottom: 12px
}
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
    height: auto;
    /* overflow-y: auto; */
    margin-top: 4vh !important;
  }
  
  #parentContainer >>> .el-dialog__body {
    padding: 0px !important;
  }
  
  #parentContainer >>> .el-form-item__label {
    color: #222;
    font-size: 16px;
  }
  

.container {
  display: grid;
  grid-template-columns: 60% 40%;
  word-break: break-word;
}

.flexContFree {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.rivisions,
.freeValue {
  font-size: 18px;
  font-weight: 600;
  color: #263342;
}

.promotional {
  font-size: 16px;
  font-weight: 100;
  color: #777;
}

.hrTag {
  color: #cccccc;
  opacity: 0.5;
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

/* .content {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  text-align: center;
  word-break: break-word;
}

.flexCont {
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 24px;
  margin: 24px auto;
}

.cardOne,
.cardTwo,
.cardThree {
  width: 100%;
  height: 100px;
  border-radius: 2px;
  box-shadow: 2px 3px 6px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  background-color: #fff;
  padding: 22px 16px;
  cursor: pointer;
  position: relative;
}

.cardOne:hover,
.cardTwo:hover,
.cardThree:hover {
  transform: translateY(-4px);
  transition: transform 330ms ease-in-out;
}

.cardOne.activeSettingOne,
.cardTwo.activeSettingTwo,
.cardThree.activeSettingThree {
  border: 1.5px solid #263342;
  box-shadow: 6px 9px 25px 0 rgba(64, 158, 255, 0.14);
}

.circle {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #263342;
  justify-content: center;
  display: flex;
  align-items: center;
  position: absolute;
  top: 8px;
  right: 8px;
}

.innerCircle {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #263342;
}

.rivisons,
.price {
  font-size: 20px;
  color: #222;
  line-height: 1.5;
  word-break: break-word;
} */

.addInfoHeading {
  font-size: 14px;
  color: #222;
  display: inline-block;
  margin-top: 16px;
}

#addInfo {
  width: 100%;
  min-width: 100%;
  max-width: 100%;
  border: none;
  border-radius: 4px;
  background-color: #e8edf2;
  font-size: 16px;
  min-height: 128px;
  padding: 16px;
  margin-top: 8px;
  word-break: break-word;
}

#addInfo::placeholder {
  color: #777;
}

.chkBoxLI {
  color: #222;
  font-size: 16px;
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
 


.filesNameContainer {
  display: flex;
  grid-gap: 15px;
  flex-wrap: wrap;
  margin-top: 12px;
  max-height: 95px;
  overflow-y: auto;
}

.fileNameCont {
  position: relative;
  padding: 8px 13px;
  background-color: #e8edf2;
  border-radius: 2px;
  display: flex;
  gap: 6px;
}

.crossIcon {
  position: relative;
  cursor: pointer;
}

.fileName {
  text-decoration: underline;
  word-break: break-word;
  font-size: 14px;
  color: #222;
}

.uploadCont .select_label {
  display: flex;
  align-items: center;
  margin: 12px auto;
}

.uploadIcon {
  cursor: pointer;
  margin-right: 4px;
}

.upload {
  font-size: 14px;
  font-weight: 600;
  color: #1c3366;
  text-decoration: underline;
  cursor: pointer;
}

.btnCont {
  text-align: center;
}

.buyNowBtn {
  padding: 12px 24px;
  font-size: 16px;
}

.leftContainer {
    border-right: 1px solid #ccc;
    padding: 24px 16px 24px 24px;
  }

  .rightContainer {
    padding: 24px 24px 24px 16px;
  }

  .headings {
    font-size: 18px;
    font-weight: 600;
    color: #1c3366;

  }

  .selectedPayments {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding: 16px 0px;
    border-bottom: 1px solid #ccc;
  }

    .selectedPaymentsUpgrade {
    display: flex;
    flex-direction: column;
    gap: 13px;
    padding-top: 0px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ccc;
  }




  .packageDetails {
    display: flex;
    justify-content: space-between;
  }

  .details,
  .detailsValue {
    font-size: 16px;
    color: #222;
  }

  .infoDropDown{
    margin-bottom: 25px;
  }

  .detailsSmall {
    font-size: 16px;
    color: #222;
  }
  
  .estDeleiveryTimeContainerTwo,
  .purCredBalContainer {
    padding: 16px 0px;
    border-bottom: 1px solid #ccc;
    display: grid;
    grid-template-columns: auto;
    gap: 13px;
  }


.creditBal {
    color: #1c3366;
    font-size: 16px;
    font-weight: 600;
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
    bottom: 75%;
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
	
#parentContainer >>> .el-select-dropdown__item  {
    height: auto !important;
  }

  #parentContainer >>> .el-form-item__label {
  color: #222;
  font-size: 16px;
}

#parentContainer >>> .el-select {
  max-width: 300px;
  width: 100%;
}
#parentContainer >>> .el-input__inner {
  background-color: #e8edf2 !important;
  border: none !important;
  color: #222;
  font-size: 16px !important;
  height: 48px !important;
}
.uptoKW {
  font-size: 14px;
  color: #777;
  margin-top: -12px;
}

.droDwnCredits {
  color: #222;
  font-size: 14px;
}

.drpDownContainer,
.checkBoxContainer,
.purCredBalContainer,
.estDeleiveryTimeContainerTwo,
.estDeleiveryTimeContainerOne {
  padding: 16px 0px;
  display: grid;
  grid-template-columns: auto;
  gap: 13px;
}

.estDeleiveryTimeContainerOne {
  border-bottom: 1px solid #ccc;
}

.estDeleiveryTimeContainerTwo {
  border-bottom: none;
  padding-bottom: 0px;
}

.drpDownContainer {
  border-bottom: none;
  padding-bottom: 0px;
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

.roofCont {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.subRoof,
.addRoof {
  font-size: 18px;
    width: 26px;
    height: 26px;
    border: 1px solid #222;
    border-radius: 50%;
    text-align: center;
    user-select: none;
    cursor: pointer;
}

.roofNo {
  font-size: 18px;
  color: #222;
  font-weight: 600;
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
  border-bottom: 1px solid #ccc;
  margin-bottom: 0px;
}

#parentContainer >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 16px;
  font-weight: 600;
}

#parentContainer >>> ::placeholder {
  color: #222;
}


.tickSign {
  display: inline-block;
  margin-right: 12px;
  color: #0fbc0f;
}

.note {
  color: #777;
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.5;
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

.loanDropdown {
  height: auto !important;
}

.flexContainer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    font-size: 16px;
    color: #222;
}

.noOfRoof,
.roofContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
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
      max-height: 76vh;
      margin-bottom: 16px;
    }

    #parentContainer >>> .el-select {
  max-width: initial;
  width: 100%;
}

  .container {
    grid-template-columns: 1fr;
  }

  .flexCont {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 10px;
    margin: 24px auto;
  }

  .circle {
    height: 12px;
    width: 12px;
  }

  .innerCircle {
    height: 8px;
    width: 8px;
  }

  .cardOne,
  .cardTwo,
  .cardThree {
    padding: 30px 8px 22px 8px;
  }

  .rivisons,
  .price {
    font-size: 16px;
  }

  .leftContainer {
    border-right: 1px solid #ccc;
    padding: 24px 16px 24px 24px;
  }

  .leftContainer {
      padding: 16px 16px 16px 16px;
      border-bottom: 1px solid #ccc;
      border-right: none;
    }
  
    .rightContainer {
      padding: 16px 16px 0px 16px;
    }

    #parentContainer >>> .el-checkbox__label {
      font-size: 14px;
      padding-right: 8px;
    }

    .details,
     .detailsValue {
    font-size: 14px;
     }

  .drpDownWidth {
    max-width: 300px;
  }

  .selectedPayments {
    min-height: auto;
  }
}

@media (max-width: 500px) {
  .drpDownContainerCondition {
    grid-template-columns: 1fr;
  }
}


</style>

<style scoped>
.parentContainer {
  background-color: #e8edf2;
  min-height: 100vh;
}

.heading {
  font-size: 16px;
  color: #222;
  margin-bottom: 22px;
}

.click {
  font-weight: bold;
  color: #1c3366;
  cursor: pointer;
}


#preview img { max-width: 100%; max-height: 150px; margin-top:10px;}

.accordion {
  background-color: #f0f3f8;
  color: #222;
  cursor: pointer;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  outline: none;
  transition: 0.4s;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
  height: 40px;
}

.panel {
  padding: 0px 22px;
  background-color: #fff;
  height: 132px; 
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 4px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  row-gap: 0px;
  overflow-y: auto;
  overflow-x: hidden;

}

.imgContainer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0px;
}

.cardsContainer{
  margin-top: 13px;
}

.upldImgCntnr {
  width: 168px;
  height: 159px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
  cursor: pointer;
}

.crossIcon {
  position: relative;
  cursor: pointer;
}

.imgs {
  width: 168px;
  height: 159px;
  border-radius: 4px;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ddd;
}

.upldImgTxt {
  color: #777;
  font-size: 19px;
}

.accordion.active .whiteArrFAQ {
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}

.whiteArrFAQ {
  transform: rotate(180deg);
  transition: transform 0.2s ease-out;
}

.addCardCont {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.addCard {
  color: #1c3366;
  font-size: 18px;
  font-weight: 600;
  background-color: #fff;
  border: none;
  padding: 0px;
}

.btnsContainer {
  display: flex;
  justify-content: space-between;
}

.circleFillIcon {
  cursor: pointer;
}

.btn {
  font-size: 18px;
  font-weight: 600;
  padding: 24px 16px;
}

.btnMD {
  display: none;
}

@media (max-width: 500px) {

  .heading,
  .accordion,
  .addCard {
    font-size: 14px;
  }

  .whiteArrFAQ,
  .circleFillIcon {
    width: 18px;
  }

  .panel {
    gap: 16px;
    row-gap: 0px;
    padding: 0px 8px;
  }

  .imgContainer {
    margin: 12px 0px;
    gap: 8px;
  }

  .imgs,
  .upldImgCntnr {
    width: 86px;
    height: 86px;
  }

  .crossIcon {
    width: 11px;
    top: -4px;
    right: -4px;
  }

  .cloudImg {
    width: 28px;
    height: 19px;
  }

  .upldImgTxt {
    font-size: 12px;
  }

  .addCardCont {
    justify-content: flex-end;
  }

  .btn {
    display: none;
  }

  .btnMD {
    display: inherit;
    position: fixed;
    bottom: 0px;
    width: 100%;
    height: 47px;
    font-size: 18px;
    font-weight: 600;
    color: #f9f9f9;
    border-radius: 0px;
  }
}
</style>
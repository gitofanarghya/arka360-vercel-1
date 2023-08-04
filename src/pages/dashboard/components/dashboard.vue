<template>
  <div class="container" v-loading.fullscreen="isLoadingAfterPayment || isLoadingFirstTime">
      <!-- <esignPlugin></esignPlugin> -->
    <!-- <div class="containerThree">
      <h3 class="serviceHeading">Order Permit ertuigheuighudjigdiugnhsdfiu</h3>
      <p class="serviceDesc">
        Get your order permit done from our expert designer
      </p>
      <el-button
        type="primary"
        class="serviceBtn"
        @click="isOrderDetailPopupVisible = true"
        >Order Now</el-button
      >
    </div> -->
    <solarSalesProposalPopup 
      v-if="isSolarSalesProposalPopupVisible"
      :isSolarSalesProposalPopupVisible.sync ="isSolarSalesProposalPopupVisible"/> 
    <payNowPopup
      v-if="isPayNowPopupVisible"
      @timeUpdateEvent="timeUpdateFunc"
      :buttonclicked.sync="buttonclicked"
      :buttonclickedNEW.sync="buttonclickedNEW"
      :isPayNowPopupVisible.sync="isPayNowPopupVisible"
    />
    <ShareDocumentPopup :isShareDocumentPopupVisible.sync ="isShareDocumentPopupVisible"/>
    <!-- <paymentSuccessfulPopup :isOrderDetailPopupVisible.sync ="isOrderDetailPopupVisible"/> -->
    <!-- <consumptionPopup :isOrderDetailPopupVisible.sync ="isOrderDetailPopupVisible"/> -->
    <!-- <ahjPopup :isOrderDetailPopupVisible.sync ="isOrderDetailPopupVisible"/> -->
    <!-- <additionalNotesPopup :isOrderDetailPopupVisible.sync ="isOrderDetailPopupVisible"/> -->

    <!-- <div class="balanceContFour">
      <img src="../assests/wallet2.svg" /><span class="balanceValue"
        >Credit Balance: $500</span
      >
    </div> -->

    <!-- -------------------------Error----------------->
    <div class="errorMsgCont" v-if="dashData.incomplete_orders_count > 0">
      <p class="errorMsg">
        Incomplete Order Request:
        <span class="errorUnbold">{{dashData.incomplete_orders_count}} Incomplete order requests are pending in your order section.</span>
      </p>
      <el-button type="primary" class="errorBtn" @click="goToOrders">Go to Orders</el-button>
      <!-- <el-button type="primary" class="errorBtn" @click="isShareDocumentPopupVisible = true">document</el-button> -->
    </div>

    <!-- -------------------------Dashboard----------------->
    <h2 class="dahboardHeading">Dashboard</h2>

    <div class="dashboardContainer">
      <div class="dashboardCont dashOne"  @click="TotalNoOfProjects" v-if="!isTataOrg">
        <div class="dashFlex" >
          <h1 class="dashNo">{{ dashData.projects_count }}</h1>

          <h3 class="dashTotal">Total Number <br />of Projects</h3>
        </div>
      </div>
      <div class="dashboardCont dashTwo" @click="ActiveProject">
        <div class="dashFlex" >
          <h1 class="dashNo" >{{ dashData.active_orders_count }}</h1>
          <h3 class="dashTotal">Total Active <br />Orders</h3>
        </div>
      </div>
      <div class="dashboardCont dashThree" @click="PendingOrders">
        <div class="dashFlex"  >
          <h1 class="dashNo">{{dashData.pending_orders_count}}</h1>
          <h3 class="dashTotal">Total Pending <br />Orders</h3>
        </div>
      </div>
      <div class="dashboardCont dashFour" @click="CompleteOrders">
        <div class="dashFlex" >
          <h1 class="dashNo" >{{dashData.completed_orders_count}}</h1>
          <h3 class="dashTotal">Total Completed <br />Orders</h3>
        </div>
      </div>
    </div>

    <!-- -------------------------Order Services------------->
    <div :class="isSelfDesignShow ? 'gridContainerOne' : 'gridContainerTwo'">
      <div class="orderServicesGridContainer">
      <h2 class="osHeading">Order Services</h2>
      <div :class="isSelfDesignShow ? 'osContainerOne' : 'osContainerTwo'">
        <!-- <div class="osCont">
          <h3 class="osTotal">
            3D Roof Modeling<br />
            <p class="osCredit">200 Credits</p>
          </h3>
          <el-button type="primary" class="orderBtn" @click="payNowPopupVisible('3d')">Order Now</el-button>
        </div> -->
        <div :class="['osCont', isSelfDesignShow ? 'selfDesignShow' : '']" v-for="serviceTypes in orderServicesTypes" :key="serviceTypes.id">
          <h3 class="osTotal">
            {{serviceTypes.serviceName}}<br />
          </h3>
          <p class="osCredit">Starting From {{serviceTypes.basePrice}} Credits</p>
            <p class="osNote">
              {{serviceTypes.description}}
            </p>
          <el-button
            type="primary"
            class="orderBtn"
            @click="payNowPopupVisible(serviceTypes.detailedService)"
            >Order Now</el-button
          >
        </div>
      </div>
      </div>
      <div  class="selfDesignContainer" v-if="isSelfDesignShow">
        <div class="orderServicesGridContainer">
          <h2 class="osHeading">Self Designs</h2>
          <div class="osContainerOne osContainerSelfDesign">
            <div class="osCont selfDesignShow">
              <h3 class="osTotal">
                {{selfDesignInfo.name}}<br />
              </h3>
              <p class="osCredit">Starting From {{selfDesignInfo.base_price}} Credits</p>
              <p class="osNote">
                {{selfDesignInfo.description}}
              </p>
              <el-button
                type="primary"
                class="orderBtn"
                @click="selfDesignPopupVisible(selfDesignInfo)"
                >Create Now
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="containerThree" v-if="false">
      <LeadFunnel />
      <div class="tasksContainer">
        <h4 class="tskHeading">My Tasks</h4>
        <div class="tsksBox">
                <div class="tablevalueTSK tbleHeaderNone">
                  <p class="tablevalueWidthTSK firTble boldTxtSDS">NAME</p>
                  <p class="tablevalueWidthTSK secTble boldTxtSDS">CREATED BY</p>
                  <p class="tablevalueWidthTSK thrTble boldTxtSDS">START DATE</p>
                  <p class="tablevalueWidthTSK frTble boldTxtSDS">END DATE</p>
                  <p class="tablevalueWidthTSK fivTble boldTxtSDS">STATUS</p>
                </div>
                <div class="bodyCont">
                  <div class="bodyContainer">
                    <div>
                    <p class="headMD">PROJECT NAME</p>
                    <div class="arrowDropCont">
                      <img src="../../../assets/drop/group-44.png" class="arrwTSK" />
                      <p class="projectNo">Project 1</p>
                      <p class="projectNameMD">sdjhs  sh s fd  sasf afa safasf afas fd  sdssssf sf f ssf sfsfsf sfs as fafasf afaf a</p>
                    </div>
                    </div>
                    <p class="createdBy"><span class="headMD">CREATED BY</span>John Doe</p>
                    <p class="strtDate"><span class="headMD">START DATE</span>08-24-2022</p>
                    <p class="endDate"><span class="headMD">END DATE</span>08-24-2022</p>
                    <p class="activityMD"><span class="headMD">ACTIVITIES</span><span @click="isMyTaskMobileScreenPopupVisible = true" class="actvtySpan">View All</span></p>
                    <div>
                    <p class="headMD">STATUS</p>
                    <el-select v-model="value" placeholder="In-progress">
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                    </div>
                  </div>
                  <div class="innrBdyCont">
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2018.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Ellipse 182.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2015.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2016.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="bodyContainer">
                    <div>
                    <p class="headMD">PROJECT NAME</p>
                    <div class="arrowDropCont">
                      <img src="../../../assets/drop/group-44.png" class="arrwTSK" />
                      <p class="projectNo">Project 1</p>
                      <p class="projectNameMD">sdjhs  sh s fd  sasf afa safasf afas fd  sdssssf sf f ssf sfsfsf sfs as fafasf afaf a</p>
                    </div>
                    </div>
                    <p class="createdBy"><span class="headMD">CREATED BY</span>John Doe</p>
                    <p class="strtDate"><span class="headMD">START DATE</span>08-24-2022</p>
                    <p class="endDate"><span class="headMD">END DATE</span>08-24-2022</p>
                    <p class="activityMD"><span class="headMD">ACTIVITIES</span><span @click="isMyTaskMobileScreenPopupVisible = true" class="actvtySpan">View All</span></p>
                    <div>
                    <p class="headMD">STATUS</p>
                    <el-select v-model="value" placeholder="In-progress">
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                    </div>
                  </div>
                  <div class="innrBdyCont">
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2018.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Ellipse 182.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2015.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2016.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="bodyContainer">
                    <div>
                    <p class="headMD">PROJECT NAME</p>
                    <div class="arrowDropCont">
                      <img src="../../../assets/drop/group-44.png" class="arrwTSK" />
                      <p class="projectNo">Project 1</p>
                      <p class="projectNameMD">sdjhs  sh s fd  sasf afa safasf afas fd  sdssssf sf f ssf sfsfsf sfs as fafasf afaf a</p>
                    </div>
                    </div>
                    <p class="createdBy"><span class="headMD">CREATED BY</span>John Doe</p>
                    <p class="strtDate"><span class="headMD">START DATE</span>08-24-2022</p>
                    <p class="endDate"><span class="headMD">END DATE</span>08-24-2022</p>
                    <p class="activityMD"><span class="headMD">ACTIVITIES</span><span @click="isMyTaskMobileScreenPopupVisible = true" class="actvtySpan">View All</span></p>
                    <div>
                    <p class="headMD">STATUS</p>
                    <el-select v-model="value" placeholder="In-progress">
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                    </div>
                  </div>
                  <div class="innrBdyCont">
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2018.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Ellipse 182.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2015.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                    <div class="innerBodyContainer">
                      <div class="arrowDropCont">
                        <img src="../../../assets/drop/Group 2016.svg" class="innrIcnTSK" />
                        <p class="projectNoInnr">ACT...566 Conduct Site Survey</p>
                      </div>
                      <p class="createdBy">John Doe</p>
                      <p class="strtDate">08-24-2022</p>
                      <p class="endDate">08-24-2022</p>
                      <el-select v-model="value" placeholder="In-progress">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                </div>
                <div class="myTaskFooter">
                 <p class="viewAllBtn">View All</p> 
                </div>
        </div>
      </div>
    </div>


    <paymentSuccessfulPopup
      :isPaymentSuccessfulPopupVisible.sync="isPaymentSuccessfulPopupVisible"
      :timeUpdateData="timeUpdateData"
      :requestedServiceType="requestedServiceType"
      :timeRemaining="timeRemaining"
      @closeSuccessFullPopup="afterPaymentSuccessfull"
    />
    <createNewProjectPopup
      v-if="isNewProjectFormVisible"
      :isNewProjectFormVisible.sync="isNewProjectFormVisible"
      :request_object_id ="request_object_id"
      :requestedServiceType="requestedServiceType"
      @closeNewProjectPopup="closeNewProjectPopup"
    />
    <genericComponents
      :siteSurveyPath="siteSurveyPath"
      :projectId="projectId"
      :request_object_id ="request_object_id"
      :requestedServiceType="requestedServiceType"
      :invokeGenericComponent="invokeGenericComponent"
      :currentStepInProp="currentStep"
      :totalSteps="totalSteps"
    />
    <MyTaskMobileScreenPopup
      v-if="isMyTaskMobileScreenPopupVisible"
      :isMyTaskMobileScreenPopupVisible.sync="isMyTaskMobileScreenPopupVisible"
    />

    <add-credit-popup v-if="isAddCreditPopupVisible"
      :isAddCreditPopupVisible.sync="isAddCreditPopupVisible" />

    <generic-pay-now-popup v-if="isGenericPayNowPopupVisible"
      :isGenericPayNowPopupVisible.sync="isGenericPayNowPopupVisible" />

    <project-upgrade-popup v-if="isProjectUpgradePopupVisible"
      :isProjectUpgradePopupVisible.sync="isProjectUpgradePopupVisible" />

    <self-design-popup v-if="isSelfDesignPopupVisible"
      :isSelfDesignPopupVisible.sync="isSelfDesignPopupVisible"
      :buttonclickedNEW.sync="buttonclickedNEW"
      @onDialogClose="onDialogClose" />
  </div>
</template>


<script>
import API from "@/services/api/";
import payNowPopup from "./payNowPopup.vue";
import paymentSuccessfulPopup from "./paymentSuccessfulPopup.vue";
import createNewProjectPopup from "./NewProjectPopup.vue";
import genericComponents from "./genericComponent.vue";
import solarSalesProposalPopup from './solarSalesProposalPopup.vue';
import ShareDocumentPopup from './shareDocumentPopup.vue';
import MyTaskMobileScreenPopup from './myTaskMobileScreenPopup.vue';
import LeadFunnel from './LeadFunnel.vue'
import { getServiceSpecificInfo } from "@/pages/utils/utils.js"
import { mapActions } from "pinia";
import { useOrganisationStore } from "../../../stores/organisation";
import { isTataOrg } from "../../../utils";
// import esignPlugin from "../../../components/ui/esignPlugin.vue";


export default {
  components: {
    payNowPopup,
    paymentSuccessfulPopup,
    createNewProjectPopup,
    genericComponents,
    // consumptionPopup,
    /* ahjPopup, */
    // additionalNotesPopup,
    solarSalesProposalPopup,
    ShareDocumentPopup,
    MyTaskMobileScreenPopup,
    LeadFunnel,
  },
   created() {
    this.getData();
    this.sendPaymentStatusToBackend();
    this.getAllServicesInfoToLocalStorage();
  },
  data() {
    return {
      createdAt: null,
      timeUpdateData: null,
      dueDate: null,
      dashData: [],
      buttonclicked: "",
      buttonclickedNEW:{},
      isPayNowPopupVisible: false,
      isOrderDetailPopupVisible: false,
      isSolarSalesProposalPopupVisible: false,
      isLoadingFirstTime:false,
      requestedServiceType: "",
      isPaymentSuccessfulPopupVisible: false,
      isLoadingAfterPayment: false,
      isNewProjectFormVisible: false,
      projectId: null,
      request_object_id:0,
      invokeGenericComponent: false,
      currentStep:1,
      isProjectNowCreated:false,
      isShareDocumentPopupVisible : false,
      siteSurveyPath:"",
      isMyTaskMobileScreenPopupVisible: false,
      isAddCreditPopupVisible: false,
      isGenericPayNowPopupVisible: false,
      isProjectUpgradePopupVisible: false,
      isSelfDesignPopupVisible: false,
      options: [{
          value: 'Option1',
          label: 'Option1'
        }, {
          value: 'Option2',
          label: 'Option2'
        }, {
          value: 'Option3',
          label: 'Option3'
        }, {
          value: 'Option4',
          label: 'Option4'
        }, {
          value: 'Option5',
          label: 'Option5'
        }],
        
        value: '',
        orderServicesTypes: [],
        selfDesignInfo: null
    };
  },
  computed:{
    timeRemaining(){
      return this.dateToString2(this.dueDate, this.createdAt,);
    },
    totalSteps(){
      if(!JSON.parse(localStorage.getItem("allServicesInfo")))
        return;
      let data = getServiceSpecificInfo(this.requestedServiceType);
      if(!data)
        return;
      if(this.isProjectNowCreated)
        return data['template_constant'][0]['pop_ups'].length; 
      else 
        return data['template_constant'][0]['pop_ups'].length -1;
    },
    isSelfDesignShow() {
      const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
      if (allServicesInfo.self_designing_info.id == null) {
        return false
      }
      return true
    },
    isTataOrg
  },

  

  mounted(){
    this.setUsedQuotaDetailsAndQuotaType();
  },

  updated(){
     this.faqAccordion();
  },

  methods: {
    ...mapActions(useOrganisationStore, {
      setUsedQuotaDetailsAndQuotaType: 'SET_USED_QUOTA_DETAILS_AND_QUOTA_TYPE'
    }),
    onDialogClose() {
      this.isSelfDesignPopupVisible = false;
    },

    timeUpdateFunc(val){
      this.timeUpdateData = val; 
    },

    allServiceInfo() {
      const allServicesInfo = JSON.parse(localStorage.getItem("allServicesInfo"));
      if(allServicesInfo) {
        for(let i = 0; i < allServicesInfo.service_templates.length; i++) {
          this.orderServicesTypes.push({
            id: allServicesInfo.service_templates[i].template_constant[0].id,
            serviceName: allServicesInfo.service_templates[i].template_constant[0].name,
            description: allServicesInfo.service_templates[i].template_constant[0].description,
            detailedService:allServicesInfo.service_templates[i],
            basePrice: allServicesInfo.service_templates[i].base_price,
          });
        } 
        if (allServicesInfo.self_designing_info.id != null) {
          allServicesInfo['selfDesigningInfo'] =  allServicesInfo.self_designing_info
          console.log('allServicesInfo', allServicesInfo['selfDesigningInfo']);  
          this.selfDesignInfo = allServicesInfo['selfDesigningInfo'];
        }
      }
    },
    dateToString2: function (_dateString2,_dateString) {

      var mydate = new Date(_dateString);

      var mydate2 = new Date (_dateString2);
      
      var diff_in_time = mydate2.getTime() - mydate.getTime() ;
      var ms = diff_in_time % 1000;
    diff_in_time = (diff_in_time - ms) / 1000
    var ss = diff_in_time % 60;
    diff_in_time = (diff_in_time - ss) / 60
     var mm = diff_in_time % 60;
    diff_in_time = (diff_in_time - mm) / 60
     var hh = diff_in_time % 24;
    var days = (diff_in_time - hh) / 24;
    var finalOutcome = (days * 24);
    if(finalOutcome/24==1)
    {
       return finalOutcome/24 +" "+ "working day";
    }
    else{
       return finalOutcome/24 +" "+ "working days";
    }
      
    },

    faqAccordion(){
        var acc = document.getElementsByClassName("bodyContainer");

        for (let i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    },
    async getAllServicesInfoToLocalStorage(){
      if(!JSON.parse(localStorage.getItem('allServicesInfo'))){
        try{
        this.isLoadingFirstTime = true;
        let response = await API.DASHBOARD_INFO.FETCH_ALL_SERVICES_INFO();
        localStorage.setItem('allServicesInfo',JSON.stringify(response.data));
        this.isLoadingFirstTime = false;
        }
        catch(e){
          this.$message({
            showClose: true,
            message: 'Error in Fetching Services Information!',
            type: 'error',
            center: true
          });
          this.isLoadingFirstTime = false;
        }
      }
      this.allServiceInfo();
    },
    afterPaymentSuccessfull() {
      this.isPaymentSuccessfulPopupVisible = false;
      if(!this.projectId)
      this.isNewProjectFormVisible = true;
      else
      this.invokeGenericComponent = true;
    },
    closeNewProjectPopup(jsonPass) {
      console.log("@@@@@@@ super final jsonpass",jsonPass);
      this.siteSurveyPath = jsonPass.siteSurveyPath;
      this.projectId = jsonPass.projectId;
      this.isNewProjectFormVisible = false;
      this.invokeGenericComponent = true;
      this.currentStep++;
      this.isProjectNowCreated=true;
    },
    payNowPopupVisible(data) {
      console.log("@@ data",data);
      this.buttonclickedNEW = data;
      this.buttonclicked = data.template_constant.name;
      this.isPayNowPopupVisible = true;
    },
    selfDesignPopupVisible(data) {
      console.log("@@ data",data);
      this.isSelfDesignPopupVisible = true;
      this.buttonclickedNEW = data;
    },
    async sendPaymentStatusToBackend() {
      if (
        this.$router.currentRoute.path ===
          `/dashboard/success/${this.$route.params.paymentId}` &&
        this.$route.params.paymentId
      ) {
        this.isLoadingAfterPayment = true;
        const postData = {
          payment_id: this.$route.params.paymentId,
          payment_status: "success",
        };
        try {
          const response = await API.DESIGNS.CONFIRM_PAYMENT_FROM_BACKEND(
            postData
          );
          this.requestedServiceType = response.data.data.service_type;
          let paymentStatus = response.data.data.payment_status;
          let repeat = response.data.data.repeat;
          this.createdAt=response.data.data.created_at
          this.dueDate=response.data.data.due_date;
          this.request_object_id = response.data.data.request_object_id;
          console.log("requestedServiceType",this.requestedServiceType);
          console.log("request_object_id",this.request_object_id);
          this.projectId = response.data.data.project;
          this.isLoadingAfterPayment = false;
          if (paymentStatus === "success" && !repeat) {
            this.isPaymentSuccessfulPopupVisible = true;
          }
        } catch {
          this.isLoadingAfterPayment = false;
        }
      }
      else if(this.$router.currentRoute.path === `/dashboard/failed`){
        this.$message({
          showClose: true,
          message: "Payment Failed! Please try again.",
          type: "error",
          center: true
        });
      }
    },
    goToOrders(){
      this.$router.push({ name: 'orders', params: { activeTab: 'incomplete' }});
    },
    TotalNoOfProjects(){
      this.$router.push({ path:'/projects' });
    },
    ActiveProject(){
      this.$router.push({ name: 'orders', params: { activeTab: 'in_process' }});
    },
    PendingOrders(){
      this.$router.push({ name: 'orders', params: { activeTab: 'pending' }});
    },
    CompleteOrders(){
      this.$router.push({ name: 'orders', params: { activeTab: 'complete' }});
    },
    async getData() {
      const user = JSON.parse(localStorage.getItem("user"));
      const organisation_id = user.organisation_id;
      let response = await API.DASHBOARD_INFO.FETCH_DASHBOARD_INFO(
        organisation_id
      );
      var data = response.data;
      this.dashData = data;
      console.log(response.data, response.data.projects_count, this.dashData);
    },
  },

  watch: {
    "$route.params.paymentId"(val) {
      // call the method which loads your initial state
      console.log("payment id in params changed");
      this.isPayNowPopupVisible=false;
      this.getData();
      this.sendPaymentStatusToBackend();
    },
  },
};
</script>


<style scoped>

@media (min-width: 1281px) {
  .container {
    width: calc(100% - 260px);
    margin-left: auto;
    padding: 24px 64px;
    background-color: #e8edf2;
    min-height: 90vh;
    height: auto;
  }
}

.errorMsgCont {
  background-color: #fed1d1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
}

.errorMsg {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.errorUnbold {
  font-weight: 100;
}

.errorBtn {
  border-radius: 4px !important;
  border: 1px solid #222 !important;
  background-color: #fed1d1 !important;
  color: #222 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

.balanceContFour {
  position: fixed;
  top: 3%;
  right: 12%;
  z-index: 100;
  background-color: #e8edf2;
  border-radius: 4px;
  padding: 12px 16px;
}

.balanceValue {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  margin-left: 16px;
}

.dahboardHeading {
  font-size: 20px;
  font-weight: 700;
  color: #263342;
  margin-bottom: 16px;
  margin-top: 24px;
}

.dashboardContainer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  cursor:pointer;
}

.dashboardCont {
  width: 24%;
  border-radius: 4px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.dashOne {
  background-color: #345ab4;
}

.dashTwo {
  background-color: #229a92;
}

.dashThree {
  background-color: #20aa24;
}

.dashFour {
  background-color: #c79a31;
}

.dashFlex {
  display: flex;
}

.dashNo {
  font-size: 42px;
  font-weight: 600;
  color: #fff;
  cursor:pointer;
}

.dashTotal {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  margin: 2px auto 0px 16px;
}

.cdHeading {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 32px 0px 16px 0px;
  display: none;
}

.cdContainer {
  display: flex;
  display: none;
}

.cdImg {
  margin-right: 16px;
}

.cdBtn {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 4px;
  text-align: left !important;
}

.projectBtn {
  background-image: linear-gradient(to bottom, #409eff, #3092f7);
  margin-right: 24px;
}

.permitBtn {
  background-image: linear-gradient(to bottom, #f19d3e, #f46545);
  display: none;
}

.osHeading {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 32px 0px 16px 0px;
}

.gridContainerOne {
  display: grid;
  grid-template-columns: auto 34%;
  grid-gap: 18px;
}

.gridContainerTwo {
  display: grid;
  grid-template-columns: 100%;
}

.osContainerOne {
  border-radius: 8px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  padding: 16px;
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 16px;
}

.osContainerTwo {
  border-radius: 8px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  background-color: #fff;
  padding: 16px;
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 16px;
}

.osContainerSelfDesign{
  grid-gap: 0px;
}

.osCont {
  width: 100%;
  display: block;
  justify-content: space-between;
  border-radius: 4px;
  background-color: #e8edf2;
  padding: 18px 16px;
}

.selfDesignShow {
  min-height: 214px;
}

.osNote{
  margin: 12px 0 16px 1px;
  font-family: 'Helvetica Neue';
  font-size: 14px;
  font-weight: 100;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  /* min-height: 100px; */
}

.osTotal {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.osCredit {
  font-size: 16px;
  font-weight: 600;
  color: #1c3366;
  margin-top: 12px;
}

.orderBtn {
  font-size: 16px !important;
}

.containerThree{
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
}

.tskHeading{
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
}

.tasksContainer >>> .el-input__inner{
  height: 40px;
  border-radius: 4px;
  border:  1px solid #ccc;
  background-color: #e8edf2;
  font-size: 14px;
  color: #222;
  width: 136px;
}

.tasksContainer >>> .el-input__inner::placeholder{
  color: #222;
}

.tasksContainer >>> .el-select .el-input .el-select__caret{
  color: #222;
  font-weight: 600;
}

.tsksBox{
  border-radius: 8px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #ccc;
  background-color: #fff;
}

.customersTSK{
  width: 100%;
}

.tablevalueTSK{
  display: grid;
  grid-template-columns: 28% 18% 18% 17% 18%;
  border-radius: 8px;
  background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
  width: 100%;
}

.firTble{
  padding-left: 16px;
}

.secTble{
  padding-left: 16px;
}

.thrTble{
  padding-left: 16px;
}

.frTble{
  padding-left: 16px;
}

.fivTble{
  padding-left: 16px;
  padding-right: 8px;
}

#customersTSK{
  width: 100%;
}

.tablevalueWidthTSK{
  font-size: 14px;
  font-weight: 600;
  color: #1c3366;
  padding-top: 16px;
  padding-bottom: 16px;

}

.bodyCont{
  max-height: 300px;
  overflow: hidden;
  overflow-y: scroll;
}

.bodyContainer{
  display: grid;
  grid-template-columns: 29% 18% 18% 17% 18%;
  padding: 8px 16px;
  align-items: center;
  border-bottom: 1px solid #ccc;
  transition: 0.4s;

}

.bodyContainer.active .arrowDropCont .arrwTSK{
    transform: rotate(0deg);
    transition: transform 0.4s ease-out;
}

.arrowDropCont{
  display: flex;
  align-items: flex-start;
}

.arrwTSK{
  margin-right: 6px;
  width: 16px;
  transform: rotate(-90deg);
  transition: transform 0.4s ease-out;

}

.innrIcnTSK{
  margin-right: 6px;
}

.projectNo{
  font-size: 16px;
  color: #1c3366;
  font-weight: 600;
}

.projectNameMD{
  display: none;
}

.createdBy,
.strtDate,
.endDate{
  font-size: 14px;
  color: #222;
  word-break: break-word;
  padding-left: 16px;
}

.activityMD{
  display: none;
}

.innrBdyCont{
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
}

.innerBodyContainer{
  display: grid;
  grid-template-columns: 28% 18% 19% 17.5% 18%;
  padding: 8px 16px 8px 24px;
  align-items: flex-start;
  border-bottom: 1px solid #ccc;
}

.projectNoInnr{
  font-size: 14px;
  color: #222;
  font-weight: 500;
}


.bodyContainer >>> .el-input__inner{
  background-color: #fff;
  border: none;
  font-size: 14px;
  color: #222;
  width: 100%;
}

.innerBodyContainer >>> .el-input__inner{
  background-color: #fff;
  border: none;
  font-size: 14px;
  color: #222;
  width: 100%;
}

.myTaskFooter{
  padding: 16px 16px 24px 16px;
  text-align: right;
  border-top: 1px solid #ccc;
}

.viewAllBtn{
  font-size: 16px;
  font-weight: 600;
  color: #1c3366;
  text-decoration: underline;
  cursor: pointer;
}

.headMD{
  display: none;
}

@media (max-width: 1630px) {
  .selfDesignShow {
    min-height: 234px;
  }
}

@media (max-width: 1380px) {
  .selfDesignShow {
    min-height: 254px;
  }
}

@media (max-width: 1280px) {
  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }

  .balanceContFour {
    position: fixed;
    top: 1.5% !important;
  }
}

@media (max-width: 1150px) {
  .containerThree{
    margin-top: 32px;
    display: grid;
    grid-template-columns: auto;
    grid-gap: 40px;
  }
}

@media (max-width: 950px) {
  .dashboardCont{
    width: 49%;
  }

  .dashOne,
  .dashTwo{
    margin-bottom: 24px;
  }

  .osContainerOne,
  .osContainerTwo {
    grid-template-columns: auto auto;
  }

  .selfDesignShow {
    min-height: inherit;
  }
  

  .gridContainerOne {
    grid-template-columns: auto;
    grid-gap: 0px;
  }

  .osContainerSelfDesign {
    grid-template-columns: 50%;
}
}

@media (max-width: 650px) {
  .errorMsg {
    font-size: 14px;
  }

  .errorBtn {
    font-size: 12px !important;
    padding: 8px 16px !important;
    margin-left: 8px !important;
  }

  .container {
    padding: 24px;
    background-color: #e8edf2;
    height: 94vh;
    overflow: hidden;
    overflow-y: scroll;
  }

  .dashboardCont{
    width: 100%;
  }

  .dashOne,
  .dashTwo,.dashThree{
    margin-bottom: 24px;
  }

  .osContainerOne,
  .osContainerTwo {
    grid-template-columns: auto;
  }

  .balanceContFour {
    padding: 8px 16px;
  }

  .balanceContFour {
    right: 24px;
  }

  .tablevalueTSK{
    display: none;
  }

  .bodyContainer{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 16px;
    padding-top: 16px;
    align-items: flex-start;
  }

  .arrowDropCont,
  .createdBy,
  .strtDate,
  .endDate,
  .bodyContainer >>> .el-input__inner{
  width: 100%;
  padding: 0px;
  margin-bottom: 8px;
  }

  .activityMD{
    display: initial;
  }

  .headMD{
  display: block;
  color: #1c3366;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  }

  .bodyCont {
    max-height: 600px;
    overflow: hidden;
    overflow-y: scroll;
  }

  .bodyContainer >>> .el-input__inner{
  height: 16px;
  }

  .innrBdyCont{
    display: none;
  }

  .arrwTSK{
    display: none;
  }

  .actvtySpan{
    text-decoration: underline;
  }

  .projectNo{
    display: none;
  }

  .projectNameMD{
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  }

  .bodyContainer >>> .el-input__icon {
    height: auto;
    margin-top: -13px;
  }
}
</style>
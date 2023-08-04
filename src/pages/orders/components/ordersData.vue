<template>
  <div class="manage_details" v-loading="loading">
    <div class="table_section table_normal">
      <table class="data_table">
        <thead class="headerSticky">
          <tr>
            <th>
              <div class="data_head pName">
                <span class="title_text">Project Name</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Ordered On</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Order Type</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Time Remaining</span>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Status</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, index) in orderData" :key="index"  :class="[(order.project) ? 'tr' : 'incompleteCursor']" >
            <td class="smallScr" @click="goToProject(order)">
              <div class="md_head">Project Name</div>
              <div class="value_type pName">
                <div class="pNameCont">
                  <div class="pNameImg">
                     <figure class="figureImg">
                          <img 
                          :src="order.project?getProjectStaticImage(order.project.latitude,order.project.longitude)
                          :'https://cdn.zeplin.io/5fe06da7bcd15d47b191f058/assets/a03a0a9c-3b17-46fc-9cc5-8fb6568953a8.svg'" 
                          alt  :class="order.project?'pNameImage':'pDefaultImage'"/>
                      </figure>
                  </div>
                  <div class="pNameData">
                    <h3 class="pNameHeading">{{order.project? order.project.name:"Incomplete"+" "+`${order.service_type}`}}</h3>
                    <p class="pNameType">{{ order.project? order.project.project_type:"-" }}</p>
                    <h4 class="pNameAddress">{{order.project? order.project.client_address:"-"}}</h4>
                  </div>
                </div>
              </div>
            </td>
            <td class="orderOn" @click="goToProject(order)">
              <div class="md_head">Ordered On</div>
              <div class="value_type">
                <span class="orderDate">{{
                  getFormattedTime(order.created_at)
                }} <br/> {{getFormattedDate(order.created_at)}}</span
                ><br /><span class="orderDate"> </span>
              </div>
            </td>
            <td @click="goToProject(order)">
              <div class="md_head">Order Type</div>
              <div class="value_type orderType">{{ order.service_type }}</div>
            </td>
            <td @click="goToProject(order)">
              <div class="md_head">Time Remaining</div>
              <div class="value_type">
                <span class="nowrap" 
                  v-if="isStatusInprocess(order.order_status) || isStatusOrderPlaced(order.order_status)">
                  {{dateToString2(order.due_date , order.created_at)}}
                </span>
                <span v-else class="nowrap">-</span>
              </div>
            </td>
            <td @click.self="goToProject(order)">
              <div class="md_head" @click="goToProject(order)">Status</div>
              <div class="value_type" @click="goToProject(order)">
                <span :class="['nowrap', ((isItInCompleteColor(order.order_status)) ? 'incompleteColor' : 'inProcessColor'),
                 (order.order_status === 'complete' ? 'completedColor' : '')]" >
                 {{ getOrderStatus(order.order_status) }}</span>
              </div>
              <el-button type="primary" class="completeBtn"
                v-if="order.order_status == 'incomplete'"
                @click="completeYourOrder(order)">Complete Order</el-button>
            </td>
          </tr>
        </tbody>
      </table>
        <!-- <div
          v-infinite-scroll="loadMoreOrders"
          infinite-scroll-disabled="busy"
          style="text-align: center">
          <i v-if="busy" class="el-icon-loading infiniteScrollLoader"/>
        </div>   -->
      <div v-observe-visibility="loadMoreOrders" style="text-align: center">
        <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
      </div>
    </div>
    <createNewProjectPopup
      v-if="isNewProjectFormVisible"
      :isNewProjectFormVisible.sync="isNewProjectFormVisible"
      :request_object_id="request_object_id"
      :requestedServiceType="requestedServiceType"
      @closeNewProjectPopup="closeNewProjectPopup"
    />
    <genericComponents
      v-if="typeOfTab=='' || typeOfTab=='incomplete'"
      :siteSurveyPath="siteSurveyPath"
      :projectId="projectId"
      :request_object_id="request_object_id"
      :requestedServiceType="requestedServiceType"
      :invokeGenericComponent.sync="invokeGenericComponent"
      :currentStepInProp="currentStep"
      :totalSteps="totalSteps"
    />
  </div>
</template>

<script>
import Vue from "vue";
import API from "@/services/api/";
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from "../../../constants";
import createNewProjectPopup from "../../dashboard/components/NewProjectPopup.vue";
import genericComponents from "../../dashboard/components/genericComponent.vue";
import infiniteScroll from 'vue-infinite-scroll';
import { getServiceSpecificInfo } from "@/pages/utils/utils.js";
import { signRequest } from '../../../core/utils/utils';
import { isCrmUser } from "../../../utils";

Vue.use(infiniteScroll)
export default {
  name: "ordersData",
  components: {
    createNewProjectPopup,
    genericComponents,
  },
  props: ["typeOfTab"],
  data() {
    return {
      loading: false,
      orderData: [],
      nextUrl: null,
      copyURL: "",
      previousUrl: "",
      totalCount: "",
      busy: false,
      siteSurveyPath:"",
      requestedServiceType: "",
      isNewProjectFormVisible: false,
      projectId: null,
      request_object_id: 0,
      invokeGenericComponent: false,
      currentStep: 1,
      isProjectNowCreated: false,
    };
  },
  watch:{
    typeOfTab:{
      hamdler(val){
        console.log(val);
      }
    }
  },
  created() {
    this.getData();
  },
  computed: {
    totalSteps() {
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
  },
  methods: {
    isCrmUser,
    isItInCompleteColor(status){
      if(['incomplete','rejected','cancelled'].includes(status))
      return true;
      else 
      return false;
    },
    isStatusInComplete(status){
      if(status=='incomplete')
      return true;
      else 
      return false;
    },
    isStatusInprocess(status){
      if(status=='in_process')
      return true;
      else 
      return false;
    },
    isStatusOrderPlaced(status){
      if(status=='order_placed')
      return true;
      else 
      return false;
    },
    isStatusComplete(status){
      if(status=='complete')
      return true;
      else 
      return false;
    },
    isStatusRejected(status){
      if(status=='rejected')
      return true;
      else 
      return false;
    },
    isStatusCancelled(status){
      if(status=='cancelled')
      return true;
      else 
      return false;
    },

    getOrderStatus(orderStatus){
      switch(orderStatus){
        case 'incomplete':
          return 'Incomplete'
        break;
        case 'pending':
          return 'Pending'
        break;
        case 'in_process':
          return 'In Process'
        break;
         case 'on_hold':
           return 'On Hold'
        break;
         case 'complete':
           return 'Completed'
        break;
        case 'cancelled':
           return 'Cancelled'
        break;
        case 'rejected':
           return 'Rejected'
        break;
        case 'order_placed':
           return 'Order Placed'
        break;
      }
    },
     getProjectStaticImage(latitude, longitude) {
       if(latitude){
           return signRequest(`https://maps.googleapis.com/maps/api/staticmap?center=${latitude.toString()},
            ${longitude.toString()}&scale=2&zoom=18&maptype=satellite&size=80x80&key=${GOOGLE_API_KEY}`,GOOGLE_SIGNING_SECRET);
       }
    
    },
    completeYourOrder(order) {
      this.requestedServiceType = order.service_type;
      this.request_object_id = order.id;
      if(order.additional_info != 'undefine'){
        this.siteSurveyPath = order.additional_info.path
      }
      console.log("@@@@@ site survey",this.siteSurveyPath);
      this.projectId = order.project ? order.project.id : null;

      if (!this.projectId) {
        this.isNewProjectFormVisible = true;
        this.invokeGenericComponent = false;
      } else {
        this.invokeGenericComponent = true;
      }
    },
    getFormattedDate(time){
      // TODO : need to make a common function for date in the utils file and use it everywhere
      let curDate = time.split("T")[0];
      curDate = new Date(curDate);
      curDate = curDate.toDateString();
      let year = `${curDate[11]}${curDate[12]}${curDate[13]}${curDate[14]}`;
      let month = `${curDate[4]}${curDate[5]}${curDate[6]}`;
      let dt = `${curDate[8]}${curDate[9]}`;
      let modifiedDate = `${dt} ${month} ${year}`;

      return modifiedDate;
    },
    getFormattedTime(time){
      let objToday = new Date(time);
      let curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours());
      let curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes();
      let curMeridiem = objToday.getHours() > 12 ? "PM" : "AM";
      let timezone = objToday.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4).match(/\b(\w)/g).join('');
      return curHour + ":" + curMinute+ " "+ curMeridiem;
    },
    dateToString2: function (_dateString2,_dateString) {
      var mydate = new Date();

      var mydate2 = new Date (_dateString2);
      var diff = mydate2.valueOf() - mydate.valueOf();
      var finalOutcome = diff/1000/60/60;
      if (finalOutcome > 0) {
        return Math.floor(finalOutcome) +" "+ "hours";
      } else {
       // return Math.floor(Math.abs(finalOutcome)) +" "+ "hours" + " " + "order delayed"
        return  "Order Delayed"
      }
    },
    async getData() {
      this.loading = true;
      var reqObj = this.$props.typeOfTab;
      console.log("@@@calling get data",reqObj);
      let response = await API.ORDER_INFORMATION.FETCH_ORDER_METHOAD_TYPE(
        reqObj
      );
      this.loading = false;
      let data = response.data.results;
      this.previousUrl = response.data.previous;
      this.totalCount = response.data.count;
      this.orderData = [];
      this.orderData = response.data.results;
      this.nextUrl = response.data.next;
      console.log(response);
    },
    loadMoreOrders() {
      console.log("load more orders called for tab ",this.typeOfTab);
      if (this.copyURL == this.nextUrl) {
        return;
      }
      console.log(this.nextUrl);
      if (this.nextUrl !== null) {
        this.copyURL = this.nextUrl;
        this.busy = true;
        this.loadMoreOrdersCaller();
      }
    },
    async loadMoreOrdersCaller() {
      try {
        const response = await API.ORDER_INFORMATION.LOAD_MORE_ORDER(
          this.nextUrl
        );
        this.assignAPIResponse(response);
        this.nextUrl = response.data.next;

        this.busy = false;
      } catch (error) {
        // console.error();
      }
    },
    assignAPIResponse(response) {
      const data = response.data.results;
      this.orderData = this.orderData.concat(data);
      this.nextUrl = response.data.next;
    },
    closeNewProjectPopup(jsonPass) {
      this.projectId = jsonPass.projectId;
      this.siteSurveyPath = jsonPass.siteSurveyPath;
      this.isNewProjectFormVisible = false;
      this.invokeGenericComponent = true;
      this.currentStep++;
      this.isProjectNowCreated = true;

      this.getData();
    },
    goToProject(order){
      if(this.isCrmUser()) {
        let leadId = order.project.lead_id;
        if(leadId == null) {
          return;
        }
        if(leadId != null) {
          let designId=order.design;
          if(designId!=null){
            this.$router.push({
            path: `/leadSummary/${leadId}/design/${designId}`
          });  
          }else{
            if(order.order_status=="incomplete"){
              this.completeYourOrder(order);
            }else{
              this.$router.push({path: `/leadSummary/${leadId}`});
            }
          }
        }
      } else {
        let orderId = order.project
        if(orderId === null){
          return;
        }
        if(orderId != null){
          let projectId = order.project.id;
          let designId=order.design;
          if(designId!=null){
            this.$router.push({path: `/designSummary/${designId}`});  
          }else{
            if(order.order_status=="incomplete"){
              this.completeYourOrder(order);
            }else{
              this.$router.push({path: `/projectSummary/${projectId}`});
            }
          }
        }
      }
    },
  },
};
</script>


<style scoped>

.headerSticky{
  position: sticky !important;
  top: 0px !important;
  z-index: 1 !important;
}
.manage_details {
  padding: 0px !important;
}

.table_normal {
  height: calc(100vh - 320px) !important;
}

.table_section {
  overflow-x: auto;
  border-top-style: none !important;
  margin-top: 0.5rem;
}

.title_text {
  font-size: 14px !important;
  font-weight: 700 !important;
}

.pNameImg {
  border:1px solid #dedbdb;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-position: center; 
  margin-right: 12px;
}

.figureImg{
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.pNameImage{
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.pDefaultImage{
    width: 50%;
    height: 100%;
    border-radius: 8px;
    /* margin-left: 18px; */
    position: relative;
    left: 23%;
    top: -2%;
}

.pName {
  padding-left: 24px !important;

}

.pNameCont {
  display: flex !important;
}

.pNameHeading {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  line-height: 1.2;
}

.pNameType {
  font-size: 14px;
  font-weight: 100;
  color: #777;
  margin: 8px auto;
}

.pNameAddress {
  font-size: 14px;
  font-weight: 100;
}

.orderDate {
  font-weight: 100;
  font-size: 16px;
  color: #222;
  line-height: 1.5;
}

.orderType {
  font-weight: 100;
  font-size: 16px;
  color: #222;
}

.nowrap {
  font-size: 16px;
  font-weight: 100;
  padding-right: 16px;
}
.incompleteCursor{
  cursor:normal;
}
.incompleteColor{
  color: #ff0404;
}

.inProcessColor{
  color: #409eff;
}

.completedColor{
  color: #2cc21c;
}

.el-button {
  font-size: 13px !important;
  padding: 8px 8px !important;
  margin-top: 8px !important;
  margin-right: 8px !important;
}

.btnText {
  font-size: 16px;
  font-family: "Helvetica Neue";
  color: #222;
}
.tr{
  cursor:pointer;
}

@media (max-width: 1200px) {
  .table_section table tbody {
    padding: 0px 8px !important;
  }

  .table_section table tbody tr td .value_type,
  .table_section table tbody tr td .date {
    margin-top: 4px;
    display: block;
    padding-left: 0px !important;
  }
}

@media (max-width: 1200px) {
  .table_normal {
    height: calc(100vh - 320px) !important;
  }

  .table_section.table_normal table tbody tr td{
    width: initial !important;
    flex-grow: 1 !important;
  }

  .table_section.table_normal table tbody tr .smallScr{
    width: 100% !important
  }

  .table_section.table_normal table tbody tr .orderOn{
    margin-left: 92px !important;
  }
}

@media (max-width: 791px) {
.table_section.table_normal table tbody tr td{
    width: 50% !important;
    flex-grow: initial !important;
  }

.table_section.table_normal table tbody tr .orderOn{
    margin-left: 0px !important;
  }

  .table_section table tbody tr{
    padding-bottom: 8px !important;
    padding-right: 0px !important;
  }
}

</style>


<template>
    <div id="parentContainer" v-loading.fullscreen="isLoading">
        <el-dialog
                :visible="isPreviousRequestsPopupVisible"
                :close-on-click-modal="true"
                title="Previous Proposal Requests"
                @close="onDialogClose"
                append-to-body
              >
              <div class="container">
                <div class="backOne">
                <div class="table_section table_normal">
                <table class="data_table">
                  <thead class="headerSticky">
                    <tr>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Proposal Request</span>
                        </div>
                      </th>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Price</span>
                        </div>
                      </th>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Date</span>
                        </div>
                      </th>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Signed/Rejected by</span>
                        </div>
                      </th>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Reject Reason</span>
                        </div>
                      </th>
                      <th>
                        <div class="data_head">
                          <span class="title_text">Action</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(requests, index) in requestsData" :key="index"  :class="[(requests.client_name) ? 'tr' : 'incompleteCursor']" >
                      <td class="smallScr">
                        <div class="md_head">Proposal Request</div>
                        <div class="value_type pName">
                          <div class="pNameCont">
                            
                            <div class="pNameData">
                              <h3 class="pNameHeading proposalTitle">{{ requests.design_name }}</h3>
                              <h4 class="pNameAddress">{{requests.nameplate_dc_size}} kW</h4>
                              <h4 v-if="requests.state=='ACCEPTED'" style="color: #2cc21c" class="pNameAddress">Completed</h4>
                              <h4 v-if="requests.state=='REJECTED'" style="color: #ff0404" class="pNameAddress">Rejected</h4>
                              <h4 v-if="requests.state=='PENDING'" style="color: #becb0a" class="pNameAddress">Pending</h4>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <div class="md_head">Price</div>
                        <div v-if="requests.total_cost==null" class="value_type ">-</div>
                        <div v-else class="value_type " style="white-space: nowrap">{{currencySymbolNameMap[currency_code] + formatPrice(requests.total_cost)}}</div>
                      </td>
                      <td class="orderOn">
                        <div class="md_head">Date</div>
                        <div class="value_type">
                          <span class="orderDate" style="white-space: nowrap">{{getFormattedDate(requests.created_at)}}</span>
                        </div>
                      </td>
                      <td>
                        <div class="md_head">Signed/Rejected by</div>
                        <div class="value_type pName">
                          <div class="pNameCont">
                            
                            <div class="pNameData">
                              <h3 v-if="!(requests.state=='ACCEPTED')">-</h3>
                              <h3 v-else class="pNameHeading">{{requests.client_name}}</h3>
                              <p v-if="requests.state=='ACCEPTED'" class="pNameType">{{getFormattedDate(requests.modified_at)}} | {{getFormattedTime(requests.modified_at)}}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="md_head">Reject Reason</div>
                        <div class="value_type pName">
                          <div class="pNameCont">
                            
                            <div class="pNameData">
                              <h3 v-if="!(requests.state=='REJECTED')">-</h3>
                              <h3 v-else class="pNameHeading rejectReason" v-html="requests.reject_reason"></h3>
                              
                            </div>
                          </div>
                        </div>
                      </td>
            
                      <td>
                        <div class="md_head">Action</div>
                        <el-tooltip
                          :disabled="loadingState && !(referenceID==requests.reference_id)"
                          effect="dark"
                          placement="top-start"
                          :content="downloadTooltipContent"
                        >
                        <span>
                          <el-button :disabled="loadingState && !(referenceID==requests.reference_id)" 
                          :loading="loadingState && referenceID==requests.reference_id" @click="downloadFrontendPDF(requests)" style="border: none;">
                            <img v-if="!loadingState || !(referenceID==requests.reference_id)" 
                            src="./img/Group_2096.png" class="Group-2096">
                          </el-button >
                        </span>
                        </el-tooltip>
                      </td>
                    </tr>
                    
                  </tbody>
          
                </table>
                <div v-observe-visibility="loadMoreRequests" style="text-align: center">
                  <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
                </div>
              </div>
            </div>
          </div>
        </el-dialog>

    </div>
</template>
<script>
import API from "@/services/api";
import { formatDateForReport } from "@/pages/utils/utils.js"
import { SAVE_REPORT_LAMBDA_ENDPOINT } from "../../constants";
import { BASE_URL_FOR_REPORT_IMAGES, STAGE_REPORT_LAMBDA_ENDPOINT } from '../../constants'
import currencySymbolNameMap from '../currency-symbol-name-map';
export default{
    name: "previousProposalRequests",
    props: {
        isPreviousRequestsPopupVisible: {
            type: Boolean,
            default: false,
        },
        currency_code:{
          type: String,
        },
        design_id:{
          type: Number,
        }, 
        project_id: {
            type: Number,
        }, 
    },
    data() {
      return {
        isLoading: false,
        busy: false,
        requestsData:[],
        referenceID:"",
        nextUrl: null,
        copyURL: "",
        designId: this.$route.params.designId,
        loadingState: false,
      };
    },
    created() {
      this.getData();
    },
    computed: {
      
      downloadTooltipContent() {
        if (!this.loadingState) {
          return "Download Report.."
        }else{
          return "The proposal will be downloaded in about 20 seconds.."
        }
      },
    },
    nonReactiveData() {
      return {
          currencySymbolNameMap,
      }
    },
    methods:{
      formatPrice(price) {
        return parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      downloadFileHelper(url, extension) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.setAttribute("download", this.designId + extension); // or any other extension
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      },
      getToken() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        return user.token;
      },
      isLandscape(requestsData) {
        if(requestsData.report_defaults.report_type === "landscape"){
          return true;
        }else if(requestsData.report_defaults.report_type === "portrait"){
          return false;
        }else{
          if(requestsData.report_defaults.template_name === "solar_labs"){
            return true;
          }else if(requestsData.report_defaults.template_name === "solar_labs_usa"){
            return false;
          }
        }
      },
      pageSize(requestsData) {
        return requestsData.report_defaults.template_name == 'report_gazebo' ? 'Letter' : 'A4'
      },
      
      async downloadFrontendPDF(requestsData){ 
        this.loadingState = true
        this.referenceID=requestsData.reference_id
        let dateString = formatDateForReport(new Date())
        let referenceUrl = `${BASE_URL_FOR_REPORT_IMAGES}documentProposalRef/${requestsData.reference_id}/` ;

        let payload = {
          "reference_id": requestsData.reference_id,
          "base_url": referenceUrl + "puppeteer/" + dateString + '/'+ this.getToken(),
          "scale": requestsData.report_defaults.template_name === "solar_labs" ? 1.34 : 1.33,
          "landscape": this.isLandscape(requestsData),
          "format": this.pageSize(requestsData)
        }

        try {
          let response = await fetch(SAVE_REPORT_LAMBDA_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          let respText = await response.text();
          if (!response.ok) {
            throw respText
          }

          let reportUrl = respText;
          this.downloadFileHelper(reportUrl, ".pdf");
          this.loadingState = false
          this.referenceID=""
        } catch (e) {
          console.error(e);
          this.loadingState = false
          this.referenceID=""
          this.$message({
            showClose: true,
            message: "Error downloading report. Try again.",
            type: "error",
            center: true
          });
        }
      },
      async getData(){
        try{
          this.isLoading=true;
          let design_id=this.$route.params.designId
          if(design_id==null){
            design_id=this.design_id;
          }
          if(this.$router.currentRoute.name === 'leadSummary'){
            const response=  await API.PROPOSAL_INFO.CRM_PROPOSAL_HISTORY(this.project_id);
            this.requestsData = response.data.results;
            this.nextUrl = response.data.next;
          }else{
            const response=  await API.PROPOSAL_INFO.DOCUMENT_PROPOSAL_HISTORY(design_id);
            this.requestsData = response.data.results;
            this.nextUrl = response.data.next;
          }
          this.isLoading=false;
        }catch(e) {
            console.log(e);
            this.$message({
              showClose: true,
              message: 'There was an unknown error while fetching proposal requests history',
              type: "error",
              center: true
            })
             this.isLoading=false;
        }
       
        
      },
      loadMoreRequests() {
        if (this.copyURL == this.nextUrl) {
          return;
        }
        if (this.nextUrl !== null) {
          this.copyURL = this.nextUrl;
          this.busy = true;
          this.loadMoreRequestsCaller();
        }
      },
      async loadMoreRequestsCaller() {
        try {
          const response = await API.PROPOSAL_INFO.LOAD_MORE_REQUESTS(
            this.nextUrl
          );
          this.assignAPIResponse(response);
          this.nextUrl = response.data.next;
          this.busy = false;
        }catch(e) {
            console.log(e);
            this.$message({
              showClose: true,
              message: 'There was an unknown error while fetching proposal requests',
              type: "error",
              center: true
            })
        }
      },
      assignAPIResponse(response) {
        const data = response.data.results;
        this.requestsData = this.requestsData.concat(data);
        this.nextUrl = response.data.next;
      },
    
      onDialogClose() {
          this.$emit("update:isPreviousRequestsPopupVisible", false);
      },
      getFormattedTime(time){
        let objToday = new Date(time);
        let curHour = objToday.getHours() > 12 ? objToday.getHours() - 12 : (objToday.getHours() < 10 ? "0" + objToday.getHours() : objToday.getHours());
        let curMinute = objToday.getMinutes() < 10 ? "0" + objToday.getMinutes() : objToday.getMinutes();
        let curMeridiem = objToday.getHours() > 12 ? "PM" : "AM";
        let timezone = objToday.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4).match(/\b(\w)/g).join('');
        return curHour + ":" + curMinute+ " "+ curMeridiem;
      },
      getFormattedDate(time) {
        // TODO: Make a common function for date in the utils file and use it everywhere
        let curDate = time.split("T")[0];
        curDate = new Date(curDate);
        let year = curDate.getFullYear();
        let month = String(curDate.getMonth() + 1).padStart(2, "0");
        let dt = String(curDate.getDate()).padStart(2, "0");
        let modifiedDate = `${month}-${dt}-${year}`;

        return modifiedDate;
      },
    },
};
</script>

<style scoped>

.el-dialog__wrapper >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
}

.el-dialog__wrapper >>> .el-dialog__title {
  width: 257px;
  /* height: 19px; */
  /* margin: 3px 892px 2px 0; */
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #222;
  /* font-weight: 600; */
  margin-left: 10px;
  color: #222222 !important;
}

.el-dialog__wrapper >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.el-dialog__wrapper >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  margin-top: 2vh !important;
  min-width: 300px !important;
}
.pNameAddress{
  font-size: 16px;
  color: #222;
  line-height: 1.5;
}
.table_normal {
  height: calc(100vh - 320px) !important;
}
.pNameData{
  line-height: 1.2;
  font-size: 12px;
  color: #777;
}
.pNameCont {
  display: flex !important;
}
.value_type{
  font-size: 16px;
  color: #222;
  line-height: 1.2;
}
.pNameHeading {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
}
.proposalTitle{
  font-weight: 500;
  font-size: 18px;
}
.rejectReason{
  white-space: pre-line;
  max-width: 200px;
}
.el-dialog__wrapper >>> .el-dialog__body {
  padding: 0px !important;
}
.data_head{
  text-transform: capitalize !important;
  color: #777 !important;
}
.md_head{
  text-transform: capitalize !important;
  color: #777 !important;
}
.title_text{
  font-size: 14px !important;
}
img.Group-2096 {
  object-fit: contain;
}
.headerSticky{
  position: sticky !important;
  top: 0px !important;
  z-index: 1 !important;
}
.backOne {
  padding: 16px 20px 0px 20px;
  min-height: 400px;
}
.incompleteCursor{
  cursor:normal;
}

@media (max-width: 1200px) {
  .table_section table tbody {
    padding: 0px 8px !important;
  }
  .md_head{
    text-transform: capitalize !important;
    color: #777 !important;
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
  .md_head{
    text-transform: capitalize !important;
    color: #777 !important;
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
  .md_head{
    text-transform: capitalize !important;
    color: #777 !important;
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
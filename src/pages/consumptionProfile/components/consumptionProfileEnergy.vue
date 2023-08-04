<template>
     <div class="card">
      <div class="card_header flex_header">
        <h4>Consumption Profile Based on Energy Usage</h4>
          <div
          class="reset"
          data-toggle="modal"
          data-target="#info_edit"
          @click="resetAllInputValues"
          >
          <img src="../assests/arrow-repeat.svg" class="resetsvg" />
          Reset
          </div>
      </div>
      <div class="card_content">
        <div class="form consumType">
          <div :class="['row', isCrmUser() ? 'rowCRM': '']"> 
            <div class="field_container">
              <label>Type</label>
              <div class="group_radio">
                <label>
                  <input
                    type="radio"
                    name="radio"
                    value="Residential"
                    v-model="projectDetails.projectType"
                    @change="enableUpdate()"
                  />
                  <div class="box">
                    <img src="../assests/Group 1684.svg" class="commercialSvg" />
                    <span>Residential</span>
                  </div>
                </label>
                <label>
                  <input
                    type="radio"
                    name="radio"
                    value="Commercial"
                    v-model="projectDetails.projectType"
                    @change="enableUpdate()"
                  />
                  <div class="box">
                    <img src="../assests/Group 1685.svg" class="commercialSvg" />
                    <span>Commercial</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="field_container">
              <label>Consumption Profile*</label>
              <div class="custom_select" @click="openConsumptionProfileModal">
                <div class="select_area">
                  <div type="text" class="input_field">
                    <p class="input_field_p">
                      {{
                        this.consumptionDetails.profile == null
                          ? "Select Consumption Profile"
                          : selectedProfile.Name ||
                            "Select Consumption Profile"
                      }}
                    </p>
                  </div>
                  <img src="../assests/Group 1654.svg" class="dropDownSvg" />
                </div>
              </div>
            </div>

            <div class="field_container">
              <div class="flexCont">
                <label>Critical Load</label>
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Minimum load to maintain per hour
                      </p>
                    </div>
                </div>
              </div>
              <span class="inputValues">kW</span>
              <el-input
                v-model="criticalLoad"
                type="Number"
                @input="enableUpdate()"
              ></el-input>
              <p class="validationForInputs" v-if="criticalLoadNegativeError">
                This field cannot be negative number
              </p>
            </div>
          </div>


          
          <div
            class="group_button"
          >
          </div>
        </div>


        <div class="dropDownContainer">
              <el-select 
              v-model="selectedConsumptionProfileDropdown" 
              @change="enableUpdate()"
              placeholder="Select Consumption Profile">
                <el-option
                  v-for="item in consumptionProfileDropdownOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <p class="validationCss" v-if='consumptionProfileDropdownError'>This field is required</p>
            </div>

        <div class="inputContainer" 
        v-if="selectedConsumptionProfileDropdown
        ==='Up to 12 Months Energy Usage (kWh)' ||
        selectedConsumptionProfileDropdown
        ==='Up to 12 Months Pre-tax bill ($)'">

          <el-form :class="['formContainer', isCrmUser() ? 'formContainerCRM': '']">

            <el-form-item  label="Jan" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input 
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(0,'consumption');" 
                    :disabled="disableEnergyArray[0]"
                    v-model="monthlyAc[0]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Jan" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(0,'dollar');"
                    :disabled="disableDollarArray[0]" 
                    v-model="monthlyDollarRate[0]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[0] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Feb" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(1,'consumption');"
                    :disabled="disableEnergyArray[1]" 
                    v-model="monthlyAc[1]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Feb" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(1,'dollar');"
                    :disabled="disableDollarArray[1]"
                    v-model="monthlyDollarRate[1]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[1] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Mar" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(2,'consumption');"
                    :disabled="disableEnergyArray[2]"  
                    v-model="monthlyAc[2]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Mar" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(2,'dollar');"
                    :disabled="disableDollarArray[2]" 
                    v-model="monthlyDollarRate[2]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[2] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Apr" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(3,'consumption');"
                    :disabled="disableEnergyArray[3]" 
                    v-model="monthlyAc[3]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Apr" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(3,'dollar');"
                    :disabled="disableDollarArray[3]" 
                    v-model="monthlyDollarRate[3]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[3] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="May" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(4,'consumption');"
                    :disabled="disableEnergyArray[4]" 
                    v-model="monthlyAc[4]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="May" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(4,'dollar');"
                    :disabled="disableDollarArray[4]" 
                    v-model="monthlyDollarRate[4]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[4] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Jun" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(5,'consumption');"
                    :disabled="disableEnergyArray[5]" 
                    v-model="monthlyAc[5]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Jun" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(5,'dollar');"
                    :disabled="disableDollarArray[5]" 
                    v-model="monthlyDollarRate[5]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[5] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Jul" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(6,'consumption');"
                    :disabled="disableEnergyArray[6]" 
                    v-model="monthlyAc[6]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Jul" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(6,'dollar');"
                    :disabled="disableDollarArray[6]" 
                    v-model="monthlyDollarRate[6]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[6] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Aug" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(7,'consumption');"
                    :disabled="disableEnergyArray[7]" 
                    v-model="monthlyAc[7]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Aug" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(7,'dollar');"
                    :disabled="disableDollarArray[7]" 
                    v-model="monthlyDollarRate[7]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[7] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Sep" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(8,'consumption');"
                    :disabled="disableEnergyArray[8]" 
                    v-model="monthlyAc[8]">
                </el-input>      
            </el-form-item>
            <el-form-item label="Sep" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(8,'dollar');"
                    :disabled="disableDollarArray[8]"
                    v-model="monthlyDollarRate[8]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[8] +' kWh'}}
                </p>
            </el-form-item>

            <el-form-item label="Oct" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(9,'consumption');"
                    :disabled="disableEnergyArray[9]" 
                    v-model="monthlyAc[9]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Oct" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(9,'dollar');"
                    :disabled="disableDollarArray[9]" 
                    v-model="monthlyDollarRate[9]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[9] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Nov" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(10,'consumption');"
                    :disabled="disableEnergyArray[10]" 
                    v-model="monthlyAc[10]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Nov" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(10,'dollar');"
                    :disabled="disableDollarArray[10]" 
                    v-model="monthlyDollarRate[10]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[10] +' kWh'}}
                </p>
                
            </el-form-item>

            <el-form-item label="Dec" v-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'" >
                <h3 class="currIcon" >kWh</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(11,'consumption');"
                    :disabled="disableEnergyArray[11]" 
                    v-model="monthlyAc[11]">
                </el-input>
                
            </el-form-item>
            <el-form-item label="Dec" v-else-if="selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'">
                <h3 class="currIcon" :class="{setTopHeader: !is12kWhVisible }">$</h3>
                <br />
                <el-input  
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate(); disableOtherInputs(11,'dollar');"
                    :disabled="disableDollarArray[11]" 
                    v-model="monthlyDollarRate[11]">
                </el-input>
                <p class="inputInfo" v-if="is12kWhVisible">
                  {{monthlyAc[11] +' kWh'}}
                </p>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="inputContainer"
         v-else-if="selectedConsumptionProfileDropdown
        ==='Average Monthly Energy (kWh)' ||
        selectedConsumptionProfileDropdown
        ==='Average Monthly Pre-tax bill ($)'">

            <el-form :class="['formContainer singleInputs', isCrmUser() ? 'formContainerCRM': '']" @submit.native.prevent>
                <el-form-item label="" v-if="selectedConsumptionProfileDropdown==='Average Monthly Energy (kWh)'">
                  <h3 class="currIcon singleKWH">kWh</h3>
                  <br />
                  <el-input 
                  type="number"
                  v-on:keyup.enter.native="postConsumptionAndDollar"
                  v-model="avgMonthlyAc" 
                  @input="avgMonthlyAcOnChange()">
                  </el-input>
                </el-form-item>

                <el-form-item label="" v-else-if="selectedConsumptionProfileDropdown ==='Average Monthly Pre-tax bill ($)'">
                  <h3 class="currIcon singleDollar">$</h3>
                  <br />
                  <el-input
                    type="number"
                    min="0"
                    v-on:keyup.enter.native="postConsumptionAndDollar"
                    @input="enableUpdate" 
                    v-model="avgDollarRate">
                  </el-input>
                  <p class="inputInfo" v-if="isSinglekWhVisible">
                    {{avgMonthlyAc +' kWh'}}
                  </p>
                </el-form-item>
            </el-form>
        </div>

        <div class="btnContainer">
          <!-- <el-button>Cancel</el-button> -->
          <el-button type="primary" v-if="isUpdateEnabled" :loading="isLoading" @click="finalUpdateForBothConsumptionTypeAndEnergy()">Update</el-button>
        </div>
        <div  v-loading.lock="isLoading" class="graph_area" v-if="selectedConsumptionProfileDropdown">
            <generationChart
            :monthlyGeneration="monthlyAc" />

            <div class="graphCont">
              <span class="graphContent graphContentOne">
                Average Monthly Consumption: {{averageMonthlyConsumption}} kWh
              </span>
              <span class="graphContent graphContentTwo">
                Yearly Consumption: {{yearlyConsumption}} kWh
              </span>
            </div>
        </div>
      </div>
          <validationPopUp
                v-if="isGenabilityEnabled && countryCode==='US'"
                :dialogFormVisible="dialogFormVisible"
                :errorMessageInPopup="errorMessageInPopup"
                @close="dialogFormVisible=false"
                @cancelDelete="dialogFormVisible = false"
            />

            <div v-if="isConsumptionProfileOpen">
              <ConsumptionProfile
                @closeConsumptionProfileModal="isConsumptionProfileOpen = false"
                @confirmProfile="confirmProfile"
                :profileData="consumptionProfileData"
                :selectedProfile="selectedProfile"
              />
            </div>
    </div>
</template>
<script>
import axios from "axios";
import generationChart from "./generationChart.vue";
import { mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";
import {useDesignStore} from "../../../stores/design"
import { useLeadStore } from "../../../stores/lead";
import { mapActions } from 'pinia';
import API from "@/services/api/";
import validationPopUp from './validationPopUp.vue';
import ConsumptionProfile from "../consumptionDetails_components/consumptionProfileModal.vue";
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';
import { isCrmUser } from "../../../utils.js";


export default {
    components: {
    generationChart,
    validationPopUp,
    ConsumptionProfile,

  },
  props:{
      isGenabilityEnabled:{
        type: Boolean,
        default: false,
      },
      projectIdFromGenericComponent:{
        type: Number,
        default:null,
      },
      isExpertServicePopup:{
        type: Boolean,
        default: false,
      }
  },
  mixins: [homeRedirectionMixin],
  data(){
      return{
        form:{},
        avgMonthlyAc:0,
        avgDollarRate:0,
        monthlyAc : [0,0,0,0,0,0,0,0,0,0,0,0],
        monthlyAcCopy : [0,0,0,0,0,0,0,0,0,0,0,0],
        monthlyDollarRate:[0,0,0,0,0,0,0,0,0,0,0,0],
        monthlyDollarRateCopy:[0,0,0,0,0,0,0,0,0,0,0,0],
        genericArrayToSend:[0,0,0,0,0,0,0,0,0,0,0,0],
        consumptionModeAllMonths:false,
        consumptionModeAvgMonths:false,
        dollarModeAllMonths:false,
        dollarModeAvgMonths:false,
        consumptionProfileDropdownOptions:[
          {   label:"Up to 12 Months Energy Usage (kWh)",
              value:"Up to 12 Months Energy Usage (kWh)",
          },
          {   label:"Up to 12 Months bill ($)",
              value:"Up to 12 Months Pre-tax bill ($)",
          },
          {   label:"Average Monthly Energy (kWh)",
              value:"Average Monthly Energy (kWh)",
          },
          {   label:"Average Monthly bill ($)",
              value:"Average Monthly Pre-tax bill ($)",
          },
        ],
        selectedConsumptionProfileDropdown:'Up to 12 Months Energy Usage (kWh)',
        isLoading:false,
        isUpdateEnabled:false,
        disableEnergyArray:[false,false,false,false,false,false,false,false,false,false,false,false],
        disableDollarArray:[false,false,false,false,false,false,false,false,false,false,false,false],
        dialogFormVisible:false,
        genabilityMode:true,
        changedMonthIndex:0,
        errorMessageInPopup:'',
        countryCode:null,
        display12KWH:false,
        displayKWH:false,
        InvalidAvgMonthlyAc:false,
        InvalidAvgDollarRate:false,
        InvalidMonthlyAc:false,
        InvalidMonthlyDollarRate:false,
        IsInputValid:"value should not be negative",

        // datas from consumption type
        isProjectInfoLoading: false,
        projectInformation: {
          projectType: "",
          consumption: 0,
          profile: "",
        },
        projectDetails: {
          projectType: "",
        },
        consumptionDetails: {
          consumption: 0,
          profile: -1,
        },
        isConsumptionProfileOpen: false,
        consumptionProfileData: [],
        allConsumptionProfileData: [],
        selectedProfile: {
          Name: "",
        },
        criticalLoad:0,
        criticalLoadNegativeError:false,
        consumptionProfileDropdownError:false,

      }
  },
   mounted() {
    this.assignProjectDetail();
    this.getCountryDetails();  
    this.getConsumptionAndDollar();
    this.initialisationOfSelectedConsumptionProfileDropdown();
    // this.initialiseConsumptionProfileOptions();
  },
  
  computed:{
    ...mapState(useProjectStore, {
        // projectInformation: "GET_PROJECT_INFORMATION",
        utilityDetails: "GET_PROJECT_UTILITY_DETAILS",
        countryDetails : "GET_COUNTRY_DETAILS",
        utilityTariffDetails : "GET_PROJECT_UTILITY_TARIFF_DETAILS",
        projectStore: (state) => state
    }),
    ...mapState(useDesignStore, {
      designData: "GET_ENTIRE_DESIGN",
    }),
    ...mapState(useLeadStore, {
      leadInfo: state => state
    }),
    projectId() {
      return this.$route.params.projectId || this.projectIdFromGenericComponent || this.leadInfo?.project_details?.id
    },
    averageMonthlyConsumption(){
      let sum=0;
      for(let t=0;t<12;t++){
        sum+= Number(this.monthlyAc[t]);
      }
      return (sum/12).toFixed(2);
    },
    yearlyConsumption(){
      let sum=0;
      for(let t=0;t<12;t++){
        sum+= Number(this.monthlyAc[t]);
      }
      return sum.toFixed(2);
    },
    is12kWhVisible(){ 
      return this.display12KWH;
    },
    isSinglekWhVisible(){
      return this.displayKWH;
    },
    isAllowedToShowAll4OptionsInDropdown(){
      if((this.isGenabilityEnabled===false || this.countryCode!=='US')||
       (!(this.utilityTariffDetails && this.utilityTariffDetails.source=='genability' && 
       this.utilityTariffDetails.utility_provider_name && this.utilityTariffDetails.utility_rate_name ) 
       && !(this.utilityTariffDetails && this.utilityTariffDetails.post_solar_source=='genability' && 
       this.utilityTariffDetails.post_solar_utility_provider_name && this.utilityTariffDetails.post_solar_utility_rate_name ) )
       ){
        return false;
      }
      else 
      return true;

    },

    watchProjectType() {
      return this.projectDetails.projectType;
    },
    enableUpdateProjectInfo() {
      return (
        this.projectDetails.projectType != this.projectInformation.projectType
      );
    },
    enableUpdateConsumptionDetails() {
      return this.projectInformation.profile != this.consumptionDetails.profile;
    },
  },
  methods:{
        isCrmUser,
        ...mapActions(useProjectStore, [
          'UPDATE_PROJECT_CONSUMPTION_DETAILS',
          "UPDATE_PROJECT_INFORMATION",
          "GET_CURRENT_PROJECT",
        ]),
        ...mapActions(useDesignStore, {
          SET_DESIGN: 'SET_DESIGN',
        }),
        // ------methods from consumption type file--------------//
        async getProjectDetails() {
            try {
              await this.GET_CURRENT_PROJECT(this.projectId);
              this.isProjectBeingLoaded = false;
            } 
            catch (e) {
              if (e.response.status) {
                if (e.response.status === 404 || e.response.status === 403) {
                  this.$message({
                    showClose: true,
                    message: "Project not found. Redirecting to Home Page ...",
                    type: "error",
                    center: true
                  });
                } else if (e.response.status === 500) {
                  this.$message({
                    showClose: true,
                    message: "Error in loading project. Please try again.",
                    type: "error",
                    center: true
                  });
                }
                setTimeout(() => {
                  this.redirectToHomeBasedOnCountry()
                  // this.$router.push({ name: "home" });
                }, 2000);
              }
            }
        },
        async assignProjectDetail() {
          this.isProjectInfoLoading = true;
          // const projectInfo = await API.PROJECTS.FETCH_PROJECT(this.projectId);
          this.projectDetails.projectType = this.projectInformation.projectType =
            this.projectStore.project_type == "residential"
              ? "Residential"
              : "Commercial";  

          this.criticalLoad = this.projectStore.consumption_details.critical_load;
          this.estimatedEnergyConsumption = this.projectStore.consumption_details.estimated_energy_consumption;
          // this.group_classification = this.projectStore.group_classification;

          // consumptionDetails
          this.consumptionDetails.consumption =
            this.projectInformation.consumption = this.projectStore.consumption;
          this.consumptionDetails.profile = this.projectInformation.profile =
          this.projectStore.consumption_profile;

          const consumptionProfileResp = await axios.get(
            "api/master-data/consumptionProfile/"
          );
          this.allConsumptionProfileData = consumptionProfileResp.data.results;
          this.consumptionProfileData = [];
          if(!this.projectDetails.projectType){
            this.projectDetails.projectType = "Commercial";
          }
          this.allConsumptionProfileData.forEach((item) => {
            if (item.Profile_type == this.projectDetails.projectType)
              this.consumptionProfileData.push(item);
          });
          if (!this.consumptionDetails.profile) {
            this.selectedProfile = JSON.parse(
              JSON.stringify(this.consumptionProfileData[0])
            );
            this.consumptionDetails.profile = this.selectedProfile.id;
            this.updateConsumptionDetails();
          }
          let tempSelectedProfile =
            this.consumptionDetails.profile == null
              ? this.consumptionProfileData[0]
              : this.consumptionProfileData.filter(
                  (item) => item.id == this.consumptionDetails.profile
                )[0];

          if (!tempSelectedProfile)
            tempSelectedProfile = JSON.parse(
              JSON.stringify(this.consumptionProfileData[0])
            );
          this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
          this.isProjectInfoLoading = false;
        },
        isValidationPassed(){
          // this.estimatedEnergyConsumptionNegativeError = this.estimatedEnergyConsumption<0 ? true : false;
          this.criticalLoadNegativeError = this.criticalLoad <0 ? true : false;

          if(this.criticalLoadNegativeError){
            return false;
          }
          return true;
        },
        async updateProjectInfo() {
          if(!this.isValidationPassed()){
            return ;
          }
          // if (!this.enableUpdateProjectInfo) return;
          let reqBody = {
            project_type:
              this.projectDetails.projectType == "Commercial"
                ? "commercial"
                : "residential",
            consumption_profile_type: this.consumptionDetails.profile,
            critical_load: Number(this.criticalLoad),
            estimated_energy_consumption:Number((this.averageMonthlyConsumption/30).toFixed(2))
            // estimated_energy_consumption:(this.estimatedEnergyConsumption)
            // group_classification: this.group_classification
          };
          try {
            // await this.UPDATE_PROJECT_INFORMATION(reqBody);
            await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(reqBody);
            this.projectInformation.projectType = this.projectDetails.projectType;
            this.projectInformation.profile = this.consumptionDetails.profile;
            this.isUpdateEnabled=false;
            this.isLoading=false;
            // commenting this successful msg because two APIs we are hitting so we dont want to show this msg 2 times
            // this.$message({
            //   showClose: true,
            //   message: "Successfully Updated",
            //   type: "success",
            //   center: true
            // });
          } catch (error) {
            this.isLoading=false;
            let errorMessage = error.response.status === 403 ? "You don't have permission to edit this project." : 'error'
            this.$message({
              showClose: true,
              message: errorMessage,
              type: "error",
              center: true
            })
          }
        },
        async updateConsumptionDetails() {
          // if(!this.enableUpdateConsumptionDetails) return;
          let reqBody = {
            // consumption: this.consumptionDetails.consumption,
            consumption_profile: this.consumptionDetails.profile,
            // period: this.consumptionDetails.period,
          };
          try {
            await this.UPDATE_PROJECT_INFORMATION(reqBody);
            this.projectInformation.consumption =
              this.consumptionDetails.consumption;
            this.projectInformation.profile = this.consumptionDetails.profile;
            // this.projectInformation.period = this.consumptionDetails.period;
          } catch (e) {
            console.error(e);
          }
        },
        async openConsumptionProfileModal() {
          this.isConsumptionProfileOpen = true;
        },
        confirmProfile(profile) {
          this.selectedProfile = JSON.parse(JSON.stringify(profile));
          this.consumptionDetails.profile = this.selectedProfile.id;
          this.isUpdateEnabled=true;
        },
        closeModal() {
          this.isConsumptionProfileOpen = false;
        },

      // ------methods from consumption type file End--------------//


        async getCountryDetails(){
            this.countryCode = this.countryDetails.country_code;
            this.initialiseConsumptionProfileOptions();
        },  
        async getConsumptionAndDollar(){
            try{
                const response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_PROJECT_CONSUMPTION_CALCULATION(this.projectId);
                this.selectedConsumptionProfileDropdown = response.data.consumption_profile;
                

                if(this.selectedConsumptionProfileDropdown ==='Up to 12 Months Energy Usage (kWh)'){
                  this.fetchMonthlyAc(response);
                  this.display12KWH=false;
                  this.displayKWH=false;
                }
                else if(this.selectedConsumptionProfileDropdown ==='Up to 12 Months Pre-tax bill ($)'){
                  this.fetchMonthlyAc(response);
                  this.fetchMonthlyDollar(response);
                  this.display12KWH=true;
                  this.displayKWH=false;
                }
                else if(this.selectedConsumptionProfileDropdown ==='Average Monthly Energy (kWh)'){
                  this.fetchAvgAc(response);
                  this.display12KWH=false;
                  this.displayKWH=false;
                }
                else if(this.selectedConsumptionProfileDropdown ==='Average Monthly Pre-tax bill ($)'){
                  this.fetchAvgDollar(response);
                  this.fetchAvgAc(response);
                  this.display12KWH=false;
                  this.displayKWH=true;
                }
            }
            catch(e){
              // console.log(e.response.data);
                this.$message({
                    showClose: true,
                    message: 'Error in Fetching Data!',
                    type: 'error',
                    center: true
                });
            }
        },
          async  postConsumptionAndDollar(){
            this.graphFieldValidation();
            if(this.InvalidAvgMonthlyAc || this.InvalidAvgDollarRate ||this.InvalidMonthlyAc || this.InvalidMonthlyDollarRate){
              return;
            }
            if(!this.selectedConsumptionProfileDropdown){
              this.consumptionProfileDropdownError = true;
              return;
            }
          // if((this.isGenabilityEnabled && this.countryCode=='US' ) &&
          //  !(this.utilityDetails && this.utilityDetails.utilityProvider && this.utilityDetails.utilityRate) &&
          //   (this.selectedConsumptionProfileDropdown !=='Average Monthly Energy (kWh)') ){
          //   this.errorMessageInPopup='Kindly Add utility rates and utility Provider first!';
          //   // this.dialogFormVisible=true;

          //   this.$message({
          //     showClose: true,
          //     message: this.errorMessageInPopup,
          //     type: "error",
          //     center: true
          //   });
          //   return;
          // }
          if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Energy Usage (kWh)'){
            this.genericArrayToSend = [...this.monthlyAc];
          }
          else if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Pre-tax bill ($)'){
            this.genericArrayToSend = [...this.monthlyDollarRate];
          }
          else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Energy (kWh)'){
            this.genericArrayToSend = [0];
            this.genericArrayToSend[0] = Number(this.avgMonthlyAc);
          }
          else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Pre-tax bill ($)'){
            this.genericArrayToSend = [0];
            this.genericArrayToSend[0] = Number(this.avgDollarRate);
          }

          this.genabilityMode=true;
          if(!this.isAllowedToShowAll4OptionsInDropdown){
            this.genabilityMode=false;
          }
          if(this.genericArrayToSend.length===12){
            for(let i=0;i<this.genericArrayToSend.length;i++){
              if(i!==this.changedMonthIndex && this.genericArrayToSend[i]!==0){
                this.genabilityMode=false;
              }
            }
          }
            for(let i=0;i<this.genericArrayToSend.length;i++){
              this.genericArrayToSend[i] = Number(this.genericArrayToSend[i]);
            }
          const postData = {
              "consumption_input": [...this.genericArrayToSend],
              "consumption_profile": this.selectedConsumptionProfileDropdown,
              "genability_mode":this.genabilityMode,
              "month_index":this.changedMonthIndex
          }
          let reqBodyForDailyConsumption = {
            estimated_energy_consumption:Number((this.averageMonthlyConsumption/30).toFixed(2))
          }
          try{
              this.isLoading=true;
              await API.PROJECT_CONSUMPTION_DETAILS.PATCH_PROJECT_CONSUMPTION_CALCULATION(this.projectId,postData);
              await this.getConsumptionAndDollar();
              await this.updateProjectInfo(); // it is necessary in order to update generation for CRM
              if(this.$route.name =="leadSummary:design" && this.designData.id){
                await this.SET_DESIGN(this.designData.id);
              }
              // TODO: need to remove this API later and merge the 2 cards
              // await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(reqBodyForDailyConsumption);
              this.$message({
                showClose: true,
                message: 'Successfully Updated',
                type: 'success',
                center: true
              });
              this.isLoading=false;
              this.isUpdateEnabled=false;
              this.disableToEnableInputs();
          }
          catch(e){
              if(e.response.status===400){
                this.errorMessageInPopup=e.response.data[0];
                this.$message({
                  showClose: true,
                  message: this.errorMessageInPopup,
                  type: "error",
                  center: true
                });
              }
              else if(e.response.status===500){
                this.errorMessageInPopup = "Error In Fetching Data!"
                this.$message({
                    showClose: true,
                    message: this.errorMessageInPopup,
                    type: "error",
                    center: true
                  });
              }
              else if(e.response.status===403){
                this.errorMessageInPopup = "You don't have permission to edit this project."
                this.$message({
                  showClose: true,
                  message: this.errorMessageInPopup,
                  type: "error",
                  center: true
                });
              }else{
              // this.dialogFormVisible = true;
                this.$message({
                  showClose: true,
                  message: 'Error ',
                  type: 'error',
                  center: true
              });
              }
              this.isLoading=false;
              this.disableToEnableInputs();
          }
        },
        graphFieldValidation(){
          if(this.avgMonthlyAc === ""){
              this.InvalidAvgMonthlyAc=true;
                   this.$message({
                  showClose: true,
                  message: 'Field should not be empty',
                  type: "error",
                  center: true
                });
             return;
            }
            else{
              this.InvalidAvgMonthlyAc=false;
            }
          if(this.avgMonthlyAc<0){
              this.InvalidAvgMonthlyAc=true;
                   this.$message({
                  showClose: true,
                  message: 'Value should not be negative',
                  type: "error",
                  center: true
                });
             return;
            }
            else{
              this.InvalidAvgMonthlyAc=false;
            }
            if(this.avgDollarRate===""){
              this.InvalidAvgDollarRate=true;
                   this.$message({
                  showClose: true,
                  message: 'Field should not be empty',
                  type: "error",
                  center: true
                });
             return;
            } else{
              this.InvalidAvgDollarRate=false;
            }
            if(this.avgDollarRate<0){
              this.InvalidAvgDollarRate=true;
                   this.$message({
                  showClose: true,
                  message: 'Value should not be negative',
                  type: "error",
                  center: true
                });
             return;
            } else{
              this.InvalidAvgDollarRate=false;
            }
         if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Energy Usage (kWh)'){
          for(let i=0 ;i<this.monthlyAc.length;i++){
            if(this.monthlyAc[i]===""){
                 this.InvalidMonthlyAc = true;
                 this.$message({
                  showClose: true,
                  message: 'Field should not be empty',
                  type: "error",
                  center: true
                });
                return;
               }
               else{
                 this.InvalidMonthlyAc = false;
               }
             if(this.monthlyAc[i] < 0 ){
              this.InvalidMonthlyAc = true;
               this.$message({
                  showClose: true,
                  message: 'Value should not be negative',
                  type: "error",
                  center: true
                });
               return;
             }
             else{
               this.InvalidMonthlyAc = false;
             }
          }
         }
         if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Pre-tax bill ($)'){
           for(let j=0;j<this.monthlyDollarRate.length;j++){
             if(this.monthlyDollarRate[j] === ""){
                this.InvalidMonthlyDollarRate= true;
                 this.$message({
                  showClose: true,
                  message: 'Field should not be empty',
                  type: "error",
                  center: true
                });
                return
             }else{
               this.InvalidMonthlyDollarRate= false;
             }
               if(this.monthlyDollarRate[j] <0){
                 this.InvalidMonthlyDollarRate= true;
                 this.$message({
                  showClose: true,
                  message: 'Value should not be negative',
                  type: "error",
                  center: true
                });
                 return;
               }
               else{
                 this.InvalidMonthlyDollarRate=false;
               }
           }
         }
        },
        fetchMonthlyAc(response){
            let tempArray=[];
            for(let i=0;i<12;i++){
                if(response.data.consumption[i].consumption!==0)
                tempArray.push(Number(response.data.consumption[i].consumption).toFixed(2));
                else
                tempArray.push(Number(response.data.consumption[i].consumption));

            }
            this.monthlyAcCopy = [...tempArray];
            this.monthlyAc = [...tempArray];
        },
        fetchMonthlyDollar(response){
            let tempArray=[];
            for(let i=0;i<12;i++){
                if(response.data.consumption[i].cost!==0)
                  tempArray.push(Number(response.data.consumption[i].cost).toFixed(2));
                else
                  tempArray.push(Number(response.data.consumption[i].cost));
            }
            this.monthlyDollarRate = [...tempArray];
            this.monthlyDollarRateCopy = [...tempArray];
        },
        fetchAvgAc(response){
            this.avgMonthlyAc = Number(response.data.consumption[0].consumption).toFixed(2);
            let tempArray=[];
            for(let i=0;i<12;i++){
                tempArray.push(Number(response.data.consumption[0].consumption).toFixed(2));
            }
            this.monthlyAcCopy = [...tempArray];
            this.monthlyAc = [...tempArray];
        },
        fetchAvgDollar(response){
            this.avgDollarRate = Number(response.data.consumption[0].cost).toFixed(2);
        },
        initialisationOfSelectedConsumptionProfileDropdown(){

            if(this.selectedConsumptionProfileDropdown === 'Up to 12 Months Energy Usage (kWh)'){
                
                this.consumptionModeAllMonths=true;
                this.consumptionModeAvgMonths = true;
                this.dollarModeAllMonths=false;
                this.dollarModeAvgMonths=false;
            }
            else if(this.selectedConsumptionProfileDropdown === 'Up to 12 Months Pre-tax bill ($)'){
                this.consumptionModeAllMonths=false;
                this.consumptionModeAvgMonths = false;
                this.dollarModeAllMonths=true;
                this.dollarModeAvgMonths=true;
            }
            else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Energy (kWh)'){
                this.consumptionModeAllMonths=true;
                this.consumptionModeAvgMonths = true;
                this.dollarModeAllMonths=false;
                this.dollarModeAvgMonths=false;
            }
            else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Pre-tax bill ($)'){
                this.consumptionModeAllMonths=false;
                this.consumptionModeAvgMonths = false;
                this.dollarModeAllMonths=true;
                this.dollarModeAvgMonths=true;
            }
        },
        avgMonthlyAcOnChange(){
            let avgMonthlyAcArray=[];
            for(let i=0;i<12;i++){
                avgMonthlyAcArray.push(Number(this.avgMonthlyAc).toFixed(2))
            }
            this.monthlyAc = [...avgMonthlyAcArray];
            this.isUpdateEnabled=true;
        },
        resetAllInputValues(){
          let tempArray =[];
          // let tempBooleanArray=[];
          for(let i=0;i<12;i++){
            tempArray.push(0);
            // tempBooleanArray.push(false);
          }
          this.monthlyAc= [...tempArray];
          this.monthlyDollarRate=[...tempArray];
          this.avgMonthlyAc=0;
          this.avgDollarRate=0;
          this.disableToEnableInputs();
          this.enableUpdate();
          // this.disableEnergyArray=[...tempBooleanArray];
          // this.disableDollarArray=[...tempBooleanArray];
        },
        disableToEnableInputs(){
          let tempBooleanArray=[];
          for(let i=0;i<12;i++){
            tempBooleanArray.push(false);
          }
          this.disableEnergyArray=[...tempBooleanArray];
          this.disableDollarArray=[...tempBooleanArray];
        },
        initialiseConsumptionProfileOptions(){
          if(!this.isAllowedToShowAll4OptionsInDropdown){
              let tempArray = [
                {   
                  label:"Average Monthly Energy (kWh)",
                  value:"Average Monthly Energy (kWh)",
                },
                { 
                  label:"Up to 12 Months Energy Usage (kWh)",
                  value:"Up to 12 Months Energy Usage (kWh)",
                },
              ];
              this.consumptionProfileDropdownOptions = [...tempArray];
          }
          else{

            let tempArray = 
                              [
                          {   label:"Up to 12 Months Energy Usage (kWh)",
                              value:"Up to 12 Months Energy Usage (kWh)",
                          },
                          {   label:"Up to 12 Months bill ($)",
                              value:"Up to 12 Months Pre-tax bill ($)",
                          },
                          {   label:"Average Monthly Energy (kWh)",
                              value:"Average Monthly Energy (kWh)",
                          },
                          {   label:"Average Monthly bill ($)",
                              value:"Average Monthly Pre-tax bill ($)",
                          },
                        ];
                  this.consumptionProfileDropdownOptions = [...tempArray];      
          }
        },
        enableUpdate(){
            this.isUpdateEnabled=true;
        },
        disableOtherInputs(index,type){
          this.changedMonthIndex=index;
          let eligibleForDisable= true;
          if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Energy Usage (kWh)'){
            for(let i1=0;i1<12;i1++){
              if(i1!=index){
                if(this.monthlyAc[i1]!=0){
                eligibleForDisable=false;
                break;
                }
              }
            }
          }
          if(!this.isAllowedToShowAll4OptionsInDropdown){
            eligibleForDisable=false;
          }
          // else if(this.selectedConsumptionProfileDropdown==='Up to 12 Months Pre-tax bill ($)'){
          //   for(let i2=0;i2<12;i2++){
          //     if(i2!=index){
          //       if(this.monthlyDollarRate[i2]!=0){
          //       eligibleForDisable=false;
          //       break;
          //       }
          //     }  
          //   }
          // }
          if(!eligibleForDisable)
          return;
          
          this.changedMonthIndex=index;
          if(type==='consumption')
            for(let i=0;i<12;i++){
              if(i!==index)
              this.disableEnergyArray[i]=true;
            }
          else{
            for(let i=0;i<12;i++){
              if(i!==index)
              this.disableDollarArray[i]=true;
            }
          }  
        },
        async finalUpdateForBothConsumptionTypeAndEnergy(){
          if(this.isValidationPassed()){
           await this.postConsumptionAndDollar();
          }
          //  this.updateProjectInfo(); removing it and adding it inside postConsumptionAndDollar function

        }
      },
    watch:{
            selectedConsumptionProfileDropdown:{
                handler(val){
                    if(val){
                      this.consumptionProfileDropdownError=false;
                    }
                    this.selectedConsumptionProfileDropdown = val;
                    if(this.selectedConsumptionProfileDropdown === 'Up to 12 Months Energy Usage (kWh)'){
                        this.consumptionModeAllMonths=true;
                        this.consumptionModeAvgMonths = true;
                        this.dollarModeAllMonths=false;
                        this.dollarModeAvgMonths=false;
                        this.monthlyAc = [...this.monthlyAcCopy];
                    }
                    else if(this.selectedConsumptionProfileDropdown === 'Up to 12 Months Pre-tax bill ($)'){
                        this.consumptionModeAllMonths=false;
                        this.consumptionModeAvgMonths = false;
                        this.dollarModeAllMonths=true;
                        this.dollarModeAvgMonths=true;
                    }
                    else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Energy (kWh)'){
                        this.consumptionModeAllMonths=true;
                        this.consumptionModeAvgMonths = true;
                        this.dollarModeAllMonths=false;
                        this.dollarModeAvgMonths=false;
                        for(let i=0;i<this.monthlyAc.length;i++){
                            this.monthlyAc[i] = this.avgMonthlyAc;
                        }
                    }
                    else if(this.selectedConsumptionProfileDropdown === 'Average Monthly Pre-tax bill ($)'){
                        this.consumptionModeAllMonths=false;
                        this.consumptionModeAvgMonths = false;
                        this.dollarModeAllMonths=true;
                        this.dollarModeAvgMonths=true;
                    }
                }
        },
        monthlyAc:{
            deep:true,
            immediate:true,
            handler(val){
                this.monthlyAc = val;
            }
        },
        monthlyDollarRate:{
            handler(val){
              this.monthlyDollarRate = val;
            }
        },
        isGenabilityEnabled:{
            handler(val){
              if(val){
                  let tempArray = [
                    {   label:"Up to 12 Months Energy Usage (kWh)",
                        value:"Up to 12 Months Energy Usage (kWh)",
                    },
                    {   label:"Up to 12 Months bill ($)",
                        value:"Up to 12 Months Pre-tax bill ($)",
                    },
                    {   label:"Average Monthly Energy (kWh)",
                        value:"Average Monthly Energy (kWh)",
                    },
                    {   label:"Average Monthly bill ($)",
                        value:"Average Monthly Pre-tax bill ($)",
                    },
                  ];
                  this.consumptionProfileDropdownOptions = [...tempArray];
              }
              else{
                    let tempArray = [
                        {   
                          label:"Average Monthly Energy (kWh)",
                          value:"Average Monthly Energy (kWh)",
                        },
                        {   
                          label:"Up to 12 Months Energy Usage (kWh)",
                          value:"Up to 12 Months Energy Usage (kWh)",
                        },
                    ];
                    this.consumptionProfileDropdownOptions = [...tempArray];
              }
            }
        },
        utilityDetails:{
          handler(val){
            this.initialiseConsumptionProfileOptions();
          }
        },
        utilityTariffDetails:{
          handler(val){
            this.initialiseConsumptionProfileOptions();
          }
        },

        // --------------- watch from consumption Type ---------------------------------------//
        watchProjectType() {
          if (this.allConsumptionProfileData.length > 0) {
            let tempProfileData = [];
            this.allConsumptionProfileData.forEach((item) => {
              if (item.Profile_type == this.projectDetails.projectType)
                tempProfileData.push(item);
            });
            this.consumptionProfileData = JSON.parse(
              JSON.stringify(tempProfileData)
            );

            let tempSelectedProfile =
              this.consumptionDetails.profile == null
                ? this.consumptionProfileData[0]
                : this.consumptionProfileData.filter(
                    (item) => item.id == this.consumptionDetails.profile
                  )[0];

            if (!tempSelectedProfile)
              tempSelectedProfile = JSON.parse(
                JSON.stringify(this.consumptionProfileData[0])
              );
            this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
          }
        },
        // estimatedEnergyConsumption:{
        //   handler(val){
        //     this.estimatedEnergyConsumptionNegativeError = val <0 ? true : false;
        //   }
        // },
        criticalLoad:{
          handler(val){
            this.criticalLoadNegativeError = val <0 ? true : false;
          }
        }

        // --------------- watch from consumption Type Ended ---------------------------------------//
  }
    
}
</script>


<style scoped>
.allContainer {
  width: 100%;
  height: 100%;
  background-color: #e8edf2;
  margin: 0;
  padding: 0;
}
.Validation{
  color: red;
  font-size: 10px;
  margin-top: 14px;
}

.card {
  border: 1px solid var(--step-100);
  border-radius: 8px;
  background: var(--white);
  width: 90%;
  margin: 20px auto !important;
}

.card >>> ::placeholder {
  color: #222;
  font-size: 16px;
  font-weight: 100;
}

.card >>> .el-input--suffix .el-input__inner {
  height: 48px;
  border: none !important;
  background-color: #e8edf2 !important;
  color: #222 !important;
  font-size: 16px !important;
}

.card >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  font-size: 18px;
  margin-right: 8px;
}

.card >>> .el-select {
  width: 100%;
  max-width: 320px;
}

.card >>> .el-form-item__content{
  line-height: 0px !important;
}

.card .card_header {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  height: 48px;
  align-items: center;
  padding: 0px 0px 0pc 24px;
}

.flex_header {
  display: flex;
  justify-content: space-between;
}

.card .card_header h4 {
  /* font-family: "Roboto"; */
  font-size: 14px;
  font-weight: 600;
  color: #222;
  word-break: break-word;
}

.resetsvg {
  margin-right: 5px;
}

.card_content {
  padding: 24px 24px 16px 24px;
  border-radius: 12px 12px 0 0;
}

.inputContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
}

.formContainer {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  row-gap: 0px;
  justify-content: space-between;
  padding: 10px 0px 10px 0px;
}

.formContainerCRM {
  grid-template-columns: 1fr 1fr 1fr;
}

.singleInputs{
  padding-top: 18px !important;
}

.card >>> .el-form-item {
  width: 100% !important;
  margin-bottom: 0px !important;
  position: relative !important;
}

.card >>> .el-input {
  width: 100% !important;
}

.card >>> .el-input__inner {
  border: 1px solid #999;
}

.currIcon {
  position: absolute;
  top: 0%;
  right: 0%;
  z-index: 1;
  height: 38px;
  width: 25%;
  text-align: center;
  background-color: #e8edf2;
  border-right: 1px solid #999;
  font-size: 14px;
  font-weight: 100;
  color: #222;
  border-radius: 0px 4px 4px 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 41px !important;
}

.setTopHeader {
  top: 0% !important;
}

.singleKWH{
  top: 3% !important;
  margin-top: 0px !important;
}

.singleDollar{
  top: 1% !important;
  margin-top: 0px !important;
}

.inputInfo {
  margin: 16px 0px 8px 0px;
  font-size: 14px;
  font-weight: 100;
  color: #777;
}

.btnContainer{
  text-align: right;
  margin: 10px 0px 0px 0px;
}

.card >>> .el-select > .el-input {
  text-align: left !important;
  text-align-last: left !important;
}

.graph_area {
  background-color: #f2f6f9 !important;
  border-radius: 8px !important;
  margin-top: 20px;
}

.graphCont{
  display: flex;
  padding: 10px 25px 20px 50px;
  justify-content: space-between;
}

.graphContent{
  font-size: 14px;
  font-weight: 500;
  color: #777; 
  /* padding: 10px 0px 20px 26px; */
}

.graphContentOne{
text-align: left;
word-break: break-word !important;
}
.graphContentTwo{
text-align: right;
word-break: break-word !important;
}

.card .card_header.flex_header .reset {
  margin-right: 24px;
  cursor: pointer;
  display: flex;
}







.form {
  font-size: 14px;
  color: #222;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  margin-bottom: 8px;
}

.rowCRM {
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.row .col {
  flex-basis: 0;
  flex-grow: 1;
  max-width: 100%;
  min-height: 1px;
  padding-right: 12px;
  padding-left: 14px;
  position: relative;
}

.col.col_4 {
  flex: 0 0 33.333333%;
  max-width: 33.1%;
}

.field_container {
  margin-bottom: 16px;
  position: relative;
}

.form label {
  margin-bottom: 10px;
  display: block;
  font-size: 14px;
}

.form label[class] {
  margin: 0;
}

.group_radio {
  width: 100%;
  display: flex;
  height: 48px;
}

.group_radio label {
  display: flex;
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.group_radio label:first-child .box {
  border-radius: 4px 0 0 4px;
}

.group_radio label:last-child .box {
  border-radius: 0 4px 4px 0;
}

.group_radio input[type="radio"] {
  display: none;
}

.group_radio input[type="radio"]:checked + .box {
  background-color: #e8edf2;
}

.group_radio .box {
  width: 100%;
  overflow: hidden;
  border: 1px solid #999;
  background-color: #fff;
  transition: all 250ms ease;
  will-change: transition;
  display: inline-block;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  color: #222;
  padding: 6px 8px;
  user-select: none;
  display: flex;
  align-items: center;
  font-weight: 400;
}

.group_radio .box .icon {
  font-size: 22px;
  margin-right: 4px;
}

.custom_select {
  position: relative;
}

.select_area {
  position: relative;
}

.select_area input {
  padding-right: 30px;
}

.select_area .icon {
  position: absolute;
  right: 10px;
  top: 17px;
  cursor: pointer;
}

.form select,
.input_field {
  border: none;
  background-color: #e8edf2;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  height: 30px;
}

.input_field {
  padding: 0 0 0 8px !important;
  height: 46px !important;
  cursor: pointer;
}

.group_button {
  text-align: right;
}

/* .group_button .btn:not(:last-child) {
  margin-right: 12px;
} */

.group_button button:disabled {
  background: #e8edf2;
  color: #222;
  border: 1px solid #e8edf2;
  cursor: not-allowed;
}

/* .btn {
  padding: 8px 24px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #999;
  color: #222;
  border-radius: 4px;
}

.btn.btn-danger {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.btn.btn-outline {
  background: #fff;
} */

.commercialSvg{
  margin: auto 5px auto 0px;
}

.dropDownSvg {
  position: absolute;
  top: 24%;
  right: 2%;
  height: 24px;
  width: 24px;
}

.input_field_p{
  padding-top: 10px;
  font-size: 16px;
}

/* -------------------------graph----- */

/* .inputContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
}

.formContainer {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
  padding: 10px 0px 10px 10px;
}

.card >>> .el-form-item {
  width: 15% !important;
  margin-bottom: 0px !important;
  position: relative !important;
}

.card >>> .el-input {
  width: 80% !important;
}

.card >>> .el-input__inner {
  border: 1px solid #999;
}

.currIcon {
  position: absolute;
  top: 22%;
  right: 20%;
  z-index: 1;
  height: 38px;
  width: 20%;
  text-align: center;
  background-color: #e8edf2;
  border-top: 1px solid #999;
  border-bottom: 1px solid #999;
  border-right: 1px solid #999;
  font-size: 14px;
  font-weight: 100;
  color: #222;
  border-radius: 0px 4px 4px 0px;
}

.inputInfo {
  margin: 0px;
  font-size: 14px;
  font-weight: 100;
  color: #777;
}

.btnContainer {
  text-align: right;
  margin: 10px 3% 10px 0px;
} */




.headDropdownOne{
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 500;
  color: #777;
  line-height: 1.5;
}

.headDropdownTwo{
  padding: 10px 0px;
  font-size: 14px;
  font-weight: 500;
  color: #777;
  line-height: 1.5;
}



.dropdownContainer{
  display: grid;
  grid-template-columns: 40% 60%;
}

.grpClsNone{
  display: none;
}

.valueDropdown,
.labelDropdown{
    font-size: 16px !important;
    color: #222 !important;
     width: auto;
     white-space: initial !important;
}

/* @media screen and (max-width: 1100px) {
  .col.col_4 {
    flex: auto;
    max-width: inherit;
  }

  .card >>> .el-select {
    width: 55% !important;
  }
  .card >>> .el-form-item {
    width: 25% !important;
  }

  .card >>> .el-input {
    width: 87% !important;
  }

  .currIcon {
    right: 13%;
  }

} */

.el-select-group .el-select-dropdown__item {
    padding-left: 20px;
    height: auto !important;
}

.consumType >>> .el-input__inner {
  height: 48px;
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  border: none;
}

.flexCont {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}


.validationForInputs{
  margin-left: 3px;
  line-height: normal;
  color: #ff0000;
  margin-top: 8px;
}
.hover_information {
  display: inline-block;
  position: relative;
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

.hover_information .tooltip.tooltip-end {
  left: unset;
  right: -15px;
}

.hover_information .tooltip p {
  margin: 0;
  line-height: 20px;
  font-size: 14px;
  color: #222;
  word-break: break-word;
}

.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.inputValues {
  position: absolute;
  right: 24px;
  font-size: 16px;
  z-index: 100;
  margin-top: 4px;
  top: 38px;
  color: #222;
}
.validationCss {
  word-break: break-word;
  margin: 4px auto 0px auto;
  line-height: 25px;
  font-size: 14px;
  color: #ff0000;
}

@media screen and (max-width: 1700px) {
  .rowCRM {
    grid-template-columns: 1fr;
    grid-gap: 16px;
    row-gap: 4px;
  }

  .formContainerCRM {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (max-width: 1300px) {
  .currIcon{
    width: 35%;
  }
}

@media screen and (max-width: 1100px) {
.card_content {
    padding: 24px 12px !important;
  }


  .consumType >>> .el-select {
    width: 100% !important;
  }

  .consumType >>> .el-form-item {
    width: 50% !important;
  }


  .row {
    flex-direction: column;
  }

  .col.col_4 {
    flex: 0 0 33.333333%;
    max-width: 100%;
  }

  .form select,
  .input_field {
    width: 100%;
  }

  .card .card_header h4 {
  margin-left: -12px;
}

.valueDropdown,
.labelDropdown{
    font-size: 16px !important;
    color: #222 !important;
     width: auto;
}

}

@media screen and (max-width: 1000px) {

  .row {
    grid-template-columns: 1fr 1fr;
    grid-gap: 24px;
    padding: 10px 0px 10px 0px;
    row-gap: 4px;
  }

  .rowCRM {
    grid-template-columns: 1fr;
    grid-gap: 16px;
  }

  .card >>> .el-select {
    width: 48% !important;
  }

  .formContainer {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    row-gap: 0px;
  }

  .formContainerCRM {
    grid-template-columns: 1fr 1fr;
  } 

  .card >>> .el-input {
    width: 100% !important;
}

.currIcon{
  right: 0%;
}

}

@media screen and (max-width: 600px) {
  .card_content{
    padding: 24px 12px;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .card >>> .el-select {
    width: 100% !important;
}
  .formContainer {
    grid-template-columns: 1fr 1fr;
  }

  .currIcon{
    width: 30%;
  }

  .card .card_header h4 {
  word-break: break-word;
  margin-left: -12px;
  width: 200px;
  flex-grow: inherit;
}
.card .card_header.flex_header .reset {
  margin-right: 16px;
  cursor: pointer;
}

.graphCont{
  display: flex;
  padding: 10px 16px 20px 16px;
  justify-content: space-between;
}

}

</style>
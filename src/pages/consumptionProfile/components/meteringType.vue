<template>
  <div class="containerUtlityRateToggle">
    <el-tabs v-if="isCrmUser()" v-model="nameOfRateUsed" @tab-click="enableUpdate">
      <el-tab-pane :label="'Flat Rates'" :name="'flat'"></el-tab-pane>
      <el-tab-pane :label="'Time of Use Rates'" :name="'tou'"></el-tab-pane>
    </el-tabs>
    <div v-else class="radioBtnPVS boxed">
      <input type="radio" id="android" name="skills" value='flat' @change="enableUpdate()" v-model="nameOfRateUsed" class="inputOnePVS" checked />
      <label for="android" class="labelOnePVS">Flat Rates</label>
      <input type="radio" id="ios" name="skills" value='tou' @change="enableUpdate()" v-model="nameOfRateUsed" class="inputTwoPVS" />
      <label for="ios" class="labelTwoPVS">
          Time of Use Rates
          <el-tooltip placement="top" popper-class="designStudioToolTip">
            <template #content
              >Create your own Tariff rate based on Time of Use.
            </template><span class="crumNew">New</span>
          </el-tooltip>
      </label>
    </div>
    <div class="card" v-loading="isLoading1" >
      <div class="card_header flex_header">
        <h4>Utility Rate</h4>
      </div>
      <div class="card_content">
        <div class="dropDownContainer" v-if="!isTOURatesEnabled">
          <el-radio-group v-model="consumptionDetails.meteringType" @change="enableUpdate()">
              <el-radio  :label="METERING_TYPES.NET_METERING">Net Metering</el-radio>
              <el-radio  :label="METERING_TYPES.GROSS_METERING" v-if="flagForUS">Feed-In-Tariff</el-radio>
              <el-radio  :label="METERING_TYPES.GROSS_METERING" v-else>Gross Metering</el-radio>
          </el-radio-group>
        </div>
        <div class="inputContainer">
          <el-form ref="consumptionDetails" :model="consumptionDetails" :class="['meterFormContainer', isCrmUser() ? 'meterFormContainerCRM': '']">
            <el-form-item v-show="isGrossMeteringEnable" label="Average Import Unit Price*" class="meterInput" v-if="!isTOURatesEnabled">
              <h3 class="currIcon">{{currencySymbol}}/kWh</h3>
              <el-input 
                type="number"
                @input="enableUpdate()"
                v-on:keyup.enter.native="checkValidation"
                v-model="consumptionDetails.averageUnitPrice">
              </el-input>
              <p class="validationForRate" v-if="averageUnitPriceError">
                This field is Required
              </p>
              <p class="validationForRate" v-if="averageUnitPriceErrorMin">
                This field cannot be negative number
              </p>
            </el-form-item>

            <el-form-item v-show="!isGrossMeteringEnable" label="Price/kWh*" class="meterInput" v-if="!isTOURatesEnabled">
              <h3 class="currIcon">{{currencySymbol}}/kWh</h3>
              <el-input 
                type="number"
                @input="enableUpdate()" 
                v-on:keyup.enter.native="checkValidation"
                v-model="consumptionDetails.averageUnitPrice">
              </el-input>
              <p class="validationForRate" v-if="averageUnitPriceError">
                This field is Required
              </p>
              <p class="validationForRate" v-if="averageUnitPriceErrorMin">
                This field cannot be negative number
              </p>
            </el-form-item>

            <el-form-item v-show="isGrossMeteringEnable" label="Average Export Unit Price*" class="meterInput" v-if="!isTOURatesEnabled">
              <h3 class="currIcon">{{currencySymbol}}/kWh</h3>
              <el-input 
                type="number" 
                @input="enableUpdate()"
                v-on:keyup.enter.native="checkValidation"
                v-model="consumptionDetails.averageExportPrice">
              </el-input>
              <p class="validationForRate" v-if="averageExportPriceError">
                This field is Required
              </p>
              <p class="validationForRate" v-if="averageExportPriceErrorMin">
                This field cannot be negative number
              </p>
            </el-form-item>

            <!-- -----------------------------Tariff Source----------------------- -->

            <el-form-item v-if="isTOURatesEnabled"
              label="Tariff Source*" class="meterInput"><br/>
              <el-select
                v-model="selectedTariffSource"
                placeholder="Select Tariff Source"
                @change="onTariffSourceChange('preSolar')"
              >
              <el-option
                v-for="item in tariffSourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isTOURatesEnabled"
              label="Utility Provider*" class="meterInput"><br/>
              
              <el-select
                value-key="id"
                :disabled="!selectedTariffSource"
                :loading="isLoading2"
                filterable
                clearable
                :remote-method="searchUtilityProvider"
                remote
                v-model="selectedUtilityProviderObj"
                @change="selectUtilityProviderObjFunction()"
                @clear="clearUtilityProvider('preSolar')"
                placeholder="Select Utility Provider"
              >
                <el-option
                  v-for="(item,index) in utilityProviderArrayOptions"
                  :key="index"
                  :label="item.name"
                  :value="item"
                >
                </el-option>
                <el-option class="utprDrpdwn" v-if="!isManageTariffOptionsHidden">
                  <p class="labelDropdown">Can’t find what you are looking for?</p>
                  <p class="mngCT" @click="redirectToCustomTariff">Manage Custom Tariff</p>
                </el-option>

                <infinite-loading
                  :distance="0"
                  spinner="bubbles"
                  @infinite="loadMoreUtilityProviders"
                >
                  <div slot="no-more"></div>
                  <!-- <div
                      slot="no-more"
                      style="color: #606266; font-size: 12px">
                      No more utility Providers!!
                  </div>
                  <div
                      slot="no-results"
                      style="color: #606266; font-size: 12px">
                      No more utility Providers!!
                  </div>

                  <div
                      slot="error"
                      style="color: #606266; font-size: 12px">
                      Error in fetching utility Providers, retry!!
                  </div> -->
                </infinite-loading>
              </el-select>
              <p v-if="!selectedTariffSource" class="validationForRateInBlack">
                  Please select the Tariff Source first*
              </p>
              <p class="validationForRate" v-if="utilityProviderError && selectedTariffSource">
                This field is required
              </p>
            </el-form-item>

            <div class="utilityRCont" v-if="isTOURatesEnabled">
              <el-form-item v-if="isTOURatesEnabled"
              label="Utility Rate*" class="meterInput"><br/>
                <utilityRateInfiniteDropdown 
                :lseId="String(lseId)"
                :projectId="projectId"
                :key="keyCount"
                :selectedUtilityRateIdx="utility_tariff_details.utility_rate_name"
                :source = "selectedTariffSource"
                :preOrPostSolar="'preSolar'"
                :isManageTariffOptionsHidden="isManageTariffOptionsHidden"
                @selected-utility-rate-name="selectedUtilityRateName"
                @fetch-tariff-info = "fetchSpecificTariffInfo"
                />
                <p v-if="!lseId" class="validationForRateInBlack">
                  Please select Utility Provider first*
                </p>
                <p class="validationForRate" v-if="utilityRateError && lseId">
                  This field is required
                </p>
              </el-form-item>
              <img @click="handleEdit('preSolar')" v-if="isTOURatesEnabled && 
              utility_tariff_details.utility_rate_name" src="../assests/editIcon.svg"   :class="[!lseId ? 'editIcon2': 'editIcon', {'cursorDisabled': isButtonLoading}]"/>
            </div>
            <el-form-item
              :label="flagForUS ? 'Annual Escalation Rate*' : 'Tariff Escalation Rate*'"
              class="meterInput"
            >
              <h3 class="currIcon">%</h3>
              <el-input 
                type="number"
                @input="enableUpdate()" 
                v-on:keyup.enter.native="checkValidation"
                v-model="consumptionDetails.tariffEscalationRate">
              </el-input>
              <p class="validationForRate" v-if="tariffEscalationRateError">
                This field is required
              </p>
              <p class="validationForRate" v-if="tariffEscalationRateErrorMin">
                This field cannot be a negative number
              </p>
              <p class="validationForRate" v-if="tariffEscalationRateErrorOver100">
                This value cannot be over 100
              </p>
            </el-form-item>
          </el-form>
        </div>
        <div class="toggleCont" v-if="!flagForUS && !isTOURatesEnabled && consumptionDetails.meteringType=='Net metering'">
          <p class="cpMtr">Zero Export</p>
          <el-switch
          v-model="consumptionDetails.zero_export_enabled"
          @change="enableUpdate()">
          </el-switch>
        </div>
        <div class="btnContainer">
          <div class="ckboxContainer" v-if="isTOURatesEnabled">
            <el-checkbox v-model="checked" @change="enableUpdate()" >Have different post solar utility rate?</el-checkbox>
          </div>
          <div class="btnCont" v-if="!checked">
            <!-- <el-button >Cancel</el-button> -->
            <p class="mngCT" v-if="isTOURatesEnabled && !isManageTariffOptionsHidden" @click="redirectToCustomTariff">
              <el-tooltip placement="top" popper-class="designStudioToolTip">
                <template #content
                  >Create your own Tariff rate based on Time of Use.
                </template><span class="crumNew" style="margin-right: 10px;">New</span>
              </el-tooltip>
            Manage Custom Tariff</p>
            <el-button v-if="isUpdateEnabled" type="primary" :loading="isButtonLoading"
             @click="checkValidation()">{{isButtonLoading ? 'Wait' : 'Update'}}</el-button>
          </div>
        </div>

        <el-form ref="consumptionDetails" :model="consumptionDetails" :class="['meterFormContainer', isCrmUser() ? 'meterFormContainerCRM': '']" v-if="checked">
            <!-- -----------------------------Tariff Source----------------------- -->
            <el-form-item v-if="isTOURatesEnabled"
              label="Tariff Source*" class="meterInput"><br/>
              <el-select
                v-model="selectedPostTariffSource"
                placeholder="Select Tariff Source"
                @change="onTariffSourceChange('postSolar')"
              >
              <el-option
                v-for="item in tariffSourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
              </el-select>
            </el-form-item>

            <el-form-item v-if="isTOURatesEnabled"
              label="Utility Provider*" class="meterInput"><br/>
              <el-select
                value-key="id"
                :disabled="!selectedPostTariffSource"
                :remote-method="searchPostUtilityProvider"
                remote
                :loading="isLoading2"
                clearable
                filterable
                v-model="selectedPostUtilityProviderObj"
                @change="selectPostUtilityProviderObjFunction()"
                placeholder="Select Utility Provider"
                @clear="clearUtilityProvider('postSolar')"
              >
                <el-option
                  v-for="(item,index) in postUtilityProviderArrayOptions"
                  :key="index"
                  :label="item.name"
                  :value="item"
                >
                </el-option>
                <el-option class="utprDrpdwn" v-if="!isManageTariffOptionsHidden">
                  <p class="labelDropdown">Can’t find what you are looking for?</p>
                  <p class="mngCT" @click="redirectToCustomTariff">Manage Custom Tariff</p>
                </el-option>
                <infinite-loading
                  :distance="0"
                  spinner="bubbles"
                  @infinite="loadMorePostUtilityProviders"
                >
                 <div slot="no-more"></div>

                  <!-- <div
                      slot="no-more"
                      style="color: #606266; font-size: 12px">
                      No more utility Providers!!
                  </div>
                  <div
                      slot="no-results"
                      style="color: #606266; font-size: 12px">
                      No more utility Providers!!
                  </div>

                  <div
                      slot="error"
                      style="color: #606266; font-size: 12px">
                      Error in fetching utility Providers, retry!!
                  </div> -->
                </infinite-loading>
              </el-select>

              <p v-if="!selectedPostTariffSource" class="validationForRateInBlack">
                  Please select the Tariff Source first*
              </p>
              <p class="validationForRate" v-if="postUtilityProviderError && selectedPostTariffSource">
                This field is required
              </p>

            </el-form-item>

            <div class="utilityRCont" v-if="isTOURatesEnabled">
              <el-form-item v-if="isTOURatesEnabled"
              label="Utility Rate*" class="meterInput"><br/>
                <utilityRateInfiniteDropdown 
                :lseId="String(postLseId)"
                :projectId="projectId"
                :key="postSolarKeyCount"
                :selectedUtilityRateIdx="utility_tariff_details.post_solar_utility_rate_name"
                :source = "selectedPostTariffSource"
                :preOrPostSolar="'postSolar'"
                :isManageTariffOptionsHidden="isManageTariffOptionsHidden"
                @selected-utility-rate-name="selectedUtilityRateName"
                @fetch-tariff-info = "fetchSpecificTariffInfo"
                />
                <p v-if="!postLseId" class="validationForRateInBlack">
                  Please select Utility Provider first*
                </p>
                <p class="validationForRate" v-if="postUtilityRateError && postLseId">
                  This field is required
                </p>
              </el-form-item>
              <!-- <p @click="handleEdit('postSolar')"> -->
                <img @click="handleEdit('postSolar')" v-if="isTOURatesEnabled 
                 && utility_tariff_details.post_solar_utility_rate_name " src="../assests/editIcon.svg" 
                 :class="[!postLseId ? 'editIcon2': 'editIcon',{'cursorDisabled': isButtonLoading}]"/>
              <!-- </p> -->
            </div>
        </el-form>
        <div class="btnContainer" v-if="checked">
          <div class="ckboxContainer">
          </div>
          <div class="btnCont">
            <p class="mngCT" v-if="isTOURatesEnabled && !isManageTariffOptionsHidden" @click="redirectToCustomTariff">Manage Custom Tariff</p>
            <el-button v-if="isUpdateEnabled" type="primary" 
            :loading="isButtonLoading" @click="checkValidation()">{{isButtonLoading ? "Wait" : "Update"}}</el-button>
          </div>
        </div>
        <CreateTariffPopup
          :createTariffPopup="createTariffPopup"
          :typeOfOperation="typeOfOperation"
          :tariffForId="tariffForId"
          :key="createCounter"
          :isConsumption="true"
          @added="handleAdd"
          @close="handleClose()"
        />
      </div>
    </div>
  </div>
</template>


<script>
import CreateTariffPopup from "./../../customTariff/components/createTariffPopup.vue";
import { METERING_TYPES } from '@/pages/constants';
import API from '@/services/api/';
import { mapState, mapActions } from "pinia";
import { useProjectStore } from "../../../stores/project";
import { useLeadStore } from "../../../stores/lead";
import {useDesignStore} from "../../../stores/design";
import { useGeographyStore } from "../../../stores/geography";
import utilityRateInfiniteDropdown from './utilityRateInfiniteDropdown.vue';
import { isItIndianExpertService } from "@/pages/utils/utils.js";
import { isCrmUser } from "../../../utils.js";

export default {
    props:{
      isGenabilityEnabled:{
        type: Boolean,
        default: false,
      },
      projectIdFromGenericComponent:{
        type: Number,
        default:null,
      },
      isManageTariffOptionsHidden:{
        type: Boolean,
        default: false,
      },
      isExpertServicePopup:{
        type: Boolean,
        default: false,
      }
    },
    data() {
        return {
            createTariffPopup: false,
            createCounter: 0,
            typeOfOperation: "Edit",
            tariffForId: [],
            isScrollStateToBeReset: null,
            scrollState: '',
            form: {},
            radio: '1',
            averageUnitPriceError:false,
            averageExportPriceError:false,
            tariffEscalationRateError:false,
            averageUnitPriceErrorMin:false,
            averageExportPriceErrorMin:false,
            tariffEscalationRateErrorMin:false,
            tariffEscalationRateErrorOver100:false,
            utilityProviderError:false,
            utilityRateError:false,
            postUtilityRateError:false,
            postUtilityProviderError:false,
            consumptionDetails: {
                meteringType: '',
                averageUnitPrice: '',
                averageExportPrice: '',
                tariffEscalationRate: '',
                zero_export_enabled:'',
            },
            utilityDetails:{
              "utilityProvider":'',
              "utilityRate":'',
            },
            utilityDetailsCopy:{
              "utilityProvider":'',
              "utilityRate":'',
            },
            utilityProviderArray:[],
            postUtilityProviderArray:[],
            utilityProviderArrayOptions:[],
            postUtilityProviderArrayOptions:[],
            lseId:'',
            postLseId:'',
            nextURL: null,
            prevURL: null,
            postSolarNextURL: null,
            postSolarPrevURL: null,
            keyCount:0,
            postSolarKeyCount:0,
            utilityRateName:'',
            postUtilityRatename:'',
            selectedUtilityProviderIndex:null,
            selectedUtilityProviderObj:{},
            selectedPostUtilityProviderIndex:null,
            selectedPostUtilityProviderObj:{},
            selectedUtilityProvider:null,
            selectedPostUtilityProvider:null,
            isUpdateEnabled:false,
            isLoading1:false,
            isLoading2:true,
            countryCode:null,
            selectedTariffSource: 'default',
            selectedPostTariffSource : 'default',
            hideThis: false,
            specificTariffInfoObj:{},
            specificPostTariffInfoObj:{},
            checked: false,
            utility_tariff_details:{
              "source": '',
              "post_solar_source": '',
              "utility_provider_name": '',
              "utility_rate_name": '',
              "utility_provider": 0,
              "utility_rate": 0,
              "post_solar_utility_provider_name": '',
              "post_solar_utility_rate_name": '',
              "post_solar_utility_provider": 0,
              "post_solar_utility_rate": 0,
              "electricity_rates": [],
              "post_solar_electricity_rates": [],
              "weekday_schedule" : [],
              "weekend_schedule" : [],
              "post_solar_weekday_schedule" : [],
              "post_solar_weekend_schedule": [],
            },
            nameOfRateUsed:'tou',
            isButtonLoading:false,
            scrollState: '',
            isScrollStateToBeReset: null,
            
            
        };
    },
    components:{
        utilityRateInfiniteDropdown,
        CreateTariffPopup,
    },
   async mounted(){
       await this.fetchProjectConsumptionUsingAPI();
        this.fetchUtilityProvider('preAndPostSolar');
        this.fetchCountryDetails();
    },
    nonReactiveData() {
        return {
            METERING_TYPES,
        };
    },
    computed: {
      ...mapState(useProjectStore, {
        consumption: 'GET_PROJECT_CONSUMPTION_DETAILS',
        currencySymbol: 'GET_CURRENCY_SYMBOL',
        projectInformation: "GET_PROJECT_INFORMATION",
        countryDetails : "GET_COUNTRY_DETAILS",
        // projectConsumptionDetails: "GET_CONSUMPTION_DETAILS",
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

      organisation_id(){
        const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
        return organisation_id;
      },

      averagePriceText() {
        return this.consumption.metering_type === this.METERING_TYPES.GROSS_METERING ? 'Average import unit price*' : 'Price/kWh*';
      },
      isGrossMeteringEnable() {
        return this.consumptionDetails.meteringType === 'Gross metering';
      },
      flagForUS(){
        const user = JSON.parse(localStorage.getItem("user")) || {};
        return user.isUSFlagEnabled;
      },
      isTOURatesEnabled(){
        if(this.nameOfRateUsed=='flat')
        return false;
        else return true;
      },
      tariffSourceOptions(){
        if(this.isGenabilityEnabled && this.countryCode==='US'){
          return [
            {
              value:'default',
              label:'Tariff List',
            },
            {
              value:'genability',
              label:'Genability',
            }
          ]
        }
        else {
          return [
            {
              value:'default',
              label:'Tariff List',
            }
          ];
        }
      },
    },
    methods:{
            isCrmUser,
            ...mapActions(useProjectStore, [
              "UPDATE_PROJECT_INFORMATION",
              "GET_CURRENT_PROJECT",
              'UPDATE_PROJECT_CONSUMPTION_DETAILS',
            ]),
            ...mapActions(useDesignStore, {
              SET_DESIGN: 'SET_DESIGN',
            }),
            ...mapActions(useGeographyStore, {
              fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
            }),
            enableUpdate() {
              this.isUpdateEnabled = true;
            },
            handleAdd(updatedData,preOrPostSolar){
              console.log("updated data returned",updatedData,preOrPostSolar);
              if(preOrPostSolar=='preSolar'){
                this.utilityRateName = updatedData.utility_rate_name;
                this.utility_tariff_details.utility_rate_name = updatedData.utility_rate_name;
                this.selectedUtilityProvider = updatedData.utility_provider_name;
                this.selectedUtilityProviderObj = updatedData.utility_provider_name;
                this.keyCount= this.keyCount +1;
                this.specificTariffInfoObj.utility_provider = updatedData.utility_provider;
                this.specificTariffInfoObj.utility_rate = updatedData.utility_rate;
                this.specificTariffInfoObj.electricity_rates = updatedData.electricity_rates;
                this.specificTariffInfoObj.weekday_schedule = updatedData.weekday_schedule;
                this.specificTariffInfoObj.weekend_schedule = updatedData.weekend_schedule;
                this.specificTariffInfoObj.country = updatedData.country;
              } 
              else{
                this.postUtilityRateName = updatedData.utility_rate_name;
                this.utility_tariff_details.post_solar_utility_rate_name= updatedData.utility_rate_name;
                this.selectedPostUtilityProvider = updatedData.utility_provider_name;
                this.selectedPostUtilityProviderObj = updatedData.utility_provider_name;
                this.postSolarKeyCount= this.postSolarKeyCount +1;
                this.specificPostTariffInfoObj.utility_provider = updatedData.utility_provider;
                this.specificPostTariffInfoObj.utility_rate = updatedData.utility_rate;
                this.specificPostTariffInfoObj.electricity_rates = updatedData.electricity_rates;
                this.specificPostTariffInfoObj.weekday_schedule = updatedData.weekday_schedule;
                this.specificPostTariffInfoObj.weekend_schedule = updatedData.weekend_schedule;
                this.specificTariffInfoObj.country = updatedData.country;
              }
              this.isUpdateEnabled=true;
              this.createTariffPopup = false;
            },

            handleClose(){
              this.createTariffPopup = false;
            },

            handleEdit(preOrPostSolar){
              if(this.isButtonLoading){
                return;
              }
              this.typeOfOperation = "Edit";
              if(preOrPostSolar=='preSolar'){
                this.tariffForId = {
                  "id": this.utility_tariff_details.id,
                  "organisation": this.organisation_id,
                  "preOrPostSolar": preOrPostSolar,
                  "utility_provider_name": this.selectedUtilityProvider 
                                      || this.selectedUtilityProviderObj,
                  "utility_rate_name": this.utilityRateName || this.utility_tariff_details.utility_rate_name,
                  "utility_provider": this.specificTariffInfoObj.utility_provider 
                                  || this.utility_tariff_details.utility_provider || null,
                  // "utility_rate": this.specificTariffInfoObj.utility_rate  || this.utility_tariff_details.utility_rate || null,
                  "electricity_rates":this.specificTariffInfoObj.electricity_rates 
                                        || this.utility_tariff_details.electricity_rates||null,
                  "weekday_schedule" : this.specificTariffInfoObj.weekday_schedule 
                    || this.utility_tariff_details.weekday_schedule || null,
                  "weekend_schedule" : this.specificTariffInfoObj.weekend_schedule 
                    || this.utility_tariff_details.weekend_schedule || null,
                  "source": this.selectedTariffSource,
                  "country": this.specificTariffInfoObj.country 
                                        || this.utility_tariff_details.country||null,
                };
              }
              else if(preOrPostSolar=='postSolar'){
                this.tariffForId = {
                  "id": this.utility_tariff_details.id,
                  "organisation": this.organisation_id,
                  "preOrPostSolar": preOrPostSolar,
                  "utility_provider_name": this.checked? (this.selectedPostUtilityProvider 
                                                  || this.selectedPostUtilityProviderObj) : null,
                  "utility_rate_name": this.checked? (this.postUtilityRatename 
                                              || this.utility_tariff_details.post_solar_utility_rate_name) : null,
                  "utility_provider": this.checked? (this.specificPostTariffInfoObj.utility_provider 
                                              || this.utility_tariff_details.post_solar_utility_provider || null): null,
                  // "utility_rate": this.checked? (this.specificPostTariffInfoObj.utility_rate 
                  //                         || this.utility_tariff_details.post_solar_utility_rate || null) : null,
                  "electricity_rates": this.checked? (this.specificPostTariffInfoObj.electricity_rates
                  || this.utility_tariff_details.post_solar_electricity_rates || null) : null,
                  "weekday_schedule" : this.checked ? (this.specificPostTariffInfoObj.weekday_schedule ||
                  this.utility_tariff_details.post_solar_weekday_schedule || null) : null ,
                  "weekend_schedule": this.checked? (this.specificPostTariffInfoObj.weekend_schedule || 
                  this.utility_tariff_details.post_solar_weekend_schedule || null) : null,
                  "source": this.checked? this.selectedPostTariffSource : null,
                  "country": this.specificTariffInfoObj.country,
                };
              }
              this.createTariffPopup = true;
            },
            loadMoreUtilityProviders($state){
              this.scrollState = $state;
              if (this.nextURL !== null) {
                  this.loadMoreUtilityProvidersHelper(this.nextURL, $state);
              }
              else {
                  $state.complete();
                  this.isScrollStateToBeReset = true;
              }
            },
            loadMorePostUtilityProviders($state){
              this.scrollState = $state;
              if (this.postSolarNextURL !== null) {
                  this.loadMorePostUtilityProvidersHelper(this.postSolarNextURL, $state);
              }
              else {
                  $state.complete();
                  this.isScrollStateToBeReset = true;
              }
            },
            async loadMoreUtilityProvidersHelper(url, $state) {
              try {
                  const response = await API.PROJECT_CONSUMPTION_DETAILS.LOAD_MORE_UTILITY_PROVIDERS(url);
                  this.utilityProviderArray =[];
                  this.utilityProviderArray = [...response.data.results];
                  for(let k=0;k<this.utilityProviderArray.length;k++){
                    // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                    // give a key id for value-key whenever value is the object
                    if(this.utilityProviderArray[k].lseId){
                      this.utilityProviderArray[k]['id'] = this.utilityProviderArray[k].lseId
                    }
                    this.utilityProviderArrayOptions.push(this.utilityProviderArray[k]);
                  }
                  this.nextURL = response.data.next;
                  $state.loaded();
              }
              catch (e) {
                  $state.error();
                  console.error();
              }
            },
            async loadMorePostUtilityProvidersHelper(url, $state) {
              try {
                  const response = await API.PROJECT_CONSUMPTION_DETAILS.LOAD_MORE_UTILITY_PROVIDERS(url);
                  this.postUtilityProviderArray =[];
                  this.postUtilityProviderArray = [...response.data.results];
                  for(let k=0;k<this.postUtilityProviderArray.length;k++){
                    // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                    // give a key id for value-key whenever value is the object
                    if(this.postUtilityProviderArray[k].lseId){
                      this.postUtilityProviderArray[k]['id'] = this.postUtilityProviderArray[k].lseId
                    }
                    this.postUtilityProviderArrayOptions.push(this.postUtilityProviderArray[k]);
                  }
                  this.postSolarNextURL = response.data.next;
                  $state.loaded();
              }
              catch (e) {
                  $state.error();
                  console.error();
              }
            },
            async fetchUtilityProvider(preOrPostSolar){
              try{
                  this.isLoading2=true;
                  let response;
                  if(preOrPostSolar=='preSolar' || preOrPostSolar=='preAndPostSolar'){
                    if(!this.selectedTariffSource){
                      this.isLoading2=false;
                      return;
                    }
                    response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_UTILITY_PROVIDER(this.projectId, this.selectedTariffSource);
                    this.nextURL = response.data.next;
                    this.utilityProviderArray = [...response.data.results];
                    this.utilityProviderArrayOptions=[];
                    for(let i=0;i<this.utilityProviderArray.length;i++){
                      // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                      // give a key id for value-key whenever value is the object
                      if(this.utilityProviderArray[i].lseId){
                          this.utilityProviderArray[i]['id'] = this.utilityProviderArray[i].lseId
                      }
                      this.utilityProviderArrayOptions.push(this.utilityProviderArray[i]);
                    }
                  }
                  if(preOrPostSolar=='postSolar' || preOrPostSolar=='preAndPostSolar'){
                    if(!this.selectedPostTariffSource){
                      this.isLoading2=false;
                      return;
                    }
                    response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_UTILITY_PROVIDER(this.projectId, this.selectedPostTariffSource);
                    this.postSolarNextURL = response.data.next;
                    this.postUtilityProviderArray = [...response.data.results];
                    this.postUtilityProviderArrayOptions=[];
                    for(let i=0;i<this.postUtilityProviderArray.length;i++){
                        // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                        // give a key id for value-key whenever value is the object
                        if(this.postUtilityProviderArray[i].lseId){
                          this.postUtilityProviderArray[i]['id'] = this.postUtilityProviderArray[i].lseId
                        }
                        this.postUtilityProviderArrayOptions.push(this.postUtilityProviderArray[i]);
                    }
                  }
                  this.isLoading2 = false;                 
              }
              catch (err) {
                console.error(err)
                    this.$message({
                        showClose: true,
                        message: 'Not able to Fetch Information',
                        type: 'error',
                        center: true
                    });
                    // If no utility provider details available definitely in case of genability then
                    //clear ur utility provider options if it have some previous values of the source default
                    if(preOrPostSolar=='preSolar' || preOrPostSolar=='preAndPostSolar')
                    this.utilityProviderArrayOptions=[];
                    else if(preOrPostSolar=='postSolar' || preOrPostSolar=='preAndPostSolar')
                    this.postUtilityProviderArrayOptions=[];
                    this.isLoading2 = false; 
              }
            },
            async fetchProjectConsumptionUsingAPI(){
              try{
                this.isLoading1=true;
                this.countryCode = this.countryDetails.country_code;
                this.assignConsumptionFormValues();
                this.isLoading1=false;
              }
              catch{
                this.$message({
                  showClose: true,
                  message: 'Error in fetching consumption details! ',
                  type: 'error',
                  center: true
                });
                this.isLoading1=false;
              }
            },
            assignConsumptionFormValues() {
                this.nameOfRateUsed = this.projectInformation.type_of_rate;
                this.consumptionDetails.meteringType =
                this.consumption.metering_type;
                this.consumptionDetails.averageExportPrice = this.consumption.average_export_price_per_unit;
                this.consumptionDetails.tariffEscalationRate = this.consumption.tariff_escalation_rate;
                this.consumptionDetails.averageUnitPrice = this.consumption.average_price_per_unit;
                this.consumptionDetails.zero_export_enabled = this.consumption.zero_export_enabled;
                // if(this.consumption.utility_details){
                //   this.utilityDetails = JSON.parse(JSON.stringify(this.consumption.utility_details));
                //   this.selectedUtilityProviderIndex = this.consumption.utility_details.utilityProvider;
                //   if(this.consumption.utility_details.lseId)
                //   this.lseId = this.consumption.utility_details.lseId;
                // }
                if(this.consumption.utility_details){
                  if(this.consumption.utility_details.lseId)
                    this.lseId = this.consumption.utility_details.lseId;
                  if(this.consumption.utility_details.postLseId)
                    this.postLseId = this.consumption.utility_details.postLseId;

                  this.checked = this.consumption.utility_details.isPostSolarAvailable ; 
                  // this.nameOfRateUsed = this.consumption.utility_details.nameOfRateUsed;
                }
                if(this.consumption.utility_tariff_details){
                  this.utility_tariff_details = JSON.parse(JSON.stringify(this.consumption.utility_tariff_details));
                  this.selectedUtilityProviderObj = this.consumption.utility_tariff_details.utility_provider_name;
                  this.selectedPostUtilityProviderObj = this.consumption.utility_tariff_details.post_solar_utility_provider_name;

                  this.selectedTariffSource = this.utility_tariff_details.source;
                  this.selectedPostTariffSource = this.utility_tariff_details.post_solar_source;
                  // TODO: to remove later! if utility tariff details are htere then 'tou' otherwise 'flat'
                  // if(this.utility_tariff_details?.utility_rate_name){
                  //   this.nameOfRateUsed = 'tou';
                  // }
                  // else{
                  //   this.nameOfRateUsed = 'flat';
                  // }
                }
                //------------- when only 1 option then automaticlly first option should be selected by default--------------//
                if(!this.selectedTariffSource && this.tariffSourceOptions.length==1){
                  this.selectedTariffSource = 'default';
                }
                if(!this.selectedPostTariffSource && this.tariffSourceOptions.length==1){
                  this.selectedPostTariffSource = 'default';
                }
                //------------------------------------------------END---------------------------------------------------------//
                
            },
            checkValidation(){
              if(!this.isTOURatesEnabled){
                this.averageUnitPriceError     = (this.consumptionDetails.averageUnitPrice ==='')    ?true:false;
                this.averageExportPriceError   = (this.consumptionDetails.averageExportPrice ==='')  ?true:false;
                this.averageUnitPriceErrorMin     = (this.consumptionDetails.averageUnitPrice <0)    ?true:false;
                this.averageExportPriceErrorMin   = (this.consumptionDetails.averageExportPrice <0)  ?true:false;
                if(!this.averageUnitPriceError && !this.averageExportPriceError &&
                !this.averageUnitPriceErrorMin && !this.averageExportPriceErrorMin && this.isTariffEscalationValidationsPassed()) {
                  this.onConfirmConsumptionForm();
                }
              }
              else{
                if(this.isAllTariffValidationsPassed()){
                  this.onConfirmConsumptionForm();
                }
              }
            },
            isAllTariffValidationsPassed(){
              this.utilityProviderError = !this.selectedUtilityProviderObj? true : false;
              this.utilityRateError = !(this.utility_tariff_details.utility_rate_name)? true : false;
              if(this.checked){
                this.postUtilityProviderError = !this.selectedPostUtilityProviderObj? true : false;
                this.postUtilityRateError = !(this.utility_tariff_details.post_solar_utility_rate_name)? true : false;
              }
              else{
                this.postUtilityProviderError=false;
                this.postUtilityRateError=false;
              }
              if(this.isTariffEscalationValidationsPassed() && !this.utilityProviderError && !this.postUtilityProviderError
              && !this.utilityRateError && !this.postUtilityRateError){
                return true
              }
              else
              return false;
            },
            isTariffEscalationValidationsPassed(){
              this.tariffEscalationRateError = (this.consumptionDetails.tariffEscalationRate ==='')?true:false;
              this.tariffEscalationRateErrorMin = (this.consumptionDetails.tariffEscalationRate <0)?true:false;
              this.tariffEscalationRateErrorOver100 = (this.consumptionDetails.tariffEscalationRate > 100)?true:false;
              if(!this.tariffEscalationRateError &&  !this.tariffEscalationRateErrorMin && 
                !this.tariffEscalationRateErrorOver100){
                  return true;
              }
              else 
              return false
            },
            async onConfirmConsumptionForm() {
                this.isLoading1 = true
                let postData;
                let utility_tariff_details_obj = {
                    "source": this.selectedTariffSource,
                    "post_solar_source": this.checked? this.selectedPostTariffSource : null,
                    "utility_provider_name": this.selectedUtilityProvider 
                                            || this.selectedUtilityProviderObj,
                    "utility_rate_name": this.utilityRateName || this.utility_tariff_details.utility_rate_name,
                    "utility_provider": this.selectedTariffSource=='default' ? (this.specificTariffInfoObj.utility_provider 
                                        || this.utility_tariff_details.utility_provider || null) : null,
                    // "utility_rate": this.selectedTariffSource=='default' ?  (this.specificTariffInfoObj.utility_rate 
                    //                     || this.utility_tariff_details.utility_rate || null): null,
                    "post_solar_utility_provider_name": this.checked? (this.selectedPostUtilityProvider 
                                                        || this.selectedPostUtilityProviderObj) : null,
                    "post_solar_utility_rate_name": this.checked? (this.postUtilityRatename 
                                                    || this.utility_tariff_details.post_solar_utility_rate_name) : null,
                    "post_solar_utility_provider": this.checked? (this.selectedPostTariffSource=='default' ? (this.specificPostTariffInfoObj.utility_provider 
                                                    || this.utility_tariff_details.post_solar_utility_provider || null): null): null,
                    // "post_solar_utility_rate": this.checked? (this.selectedPostTariffSource=='default' ? (this.specificPostTariffInfoObj.utility_rate 
                    //                             || this.utility_tariff_details.post_solar_utility_rate || null): null) : null,

                    "electricity_rates":this.specificTariffInfoObj.electricity_rates 
                                      || this.utility_tariff_details.electricity_rates||null,
                    "post_solar_electricity_rates": this.checked? (this.specificPostTariffInfoObj.electricity_rates
                     || this.utility_tariff_details.post_solar_electricity_rates || null) : null,

                    "weekday_schedule" : this.specificTariffInfoObj.weekday_schedule 
                                        || this.utility_tariff_details.weekday_schedule || null,
                    "weekend_schedule" : this.specificTariffInfoObj.weekend_schedule 
                                        || this.utility_tariff_details.weekend_schedule || null,
                    "post_solar_weekday_schedule" : this.checked ? (this.specificPostTariffInfoObj.weekday_schedule ||
                      this.utility_tariff_details.post_solar_weekday_schedule || null) : null ,
                    "post_solar_weekend_schedule": this.checked? (this.specificPostTariffInfoObj.weekend_schedule || 
                      this.utility_tariff_details.post_solar_weekend_schedule || null) : null,
                    "country": this.specificTariffInfoObj.country 
                                      || this.utility_tariff_details.country||null,
                  };
                postData = {
                  average_price_per_unit: this.consumptionDetails.averageUnitPrice,
                  tariff_escalation_rate: Number(this.consumptionDetails.tariffEscalationRate).toFixed(2),
                  average_export_price_per_unit: this.consumptionDetails.averageExportPrice,
                  metering_type: this.consumptionDetails.meteringType,
                  project: this.projectId,
                  utility_details:{
                    // "utilityProvider": this.selectedUtilityProvider || this.selectedUtilityProviderIndex,
                    // "utilityRate": this.utilityRateName || this.utilityDetails.utilityRate,
                    "lseId": this.lseId,
                    "postLseId": this.postLseId,
                    'isPostSolarAvailable': this.checked,
                    // 'nameOfRateUsed': this.nameOfRateUsed,
                  },
                  'type_of_rate': this.nameOfRateUsed,
                  utility_tariff_details: this.isTOURatesEnabled ? {... utility_tariff_details_obj }: null,
                  zero_export_enabled: this.consumptionDetails.zero_export_enabled, 
                }
                try{
                    await this.UPDATE_PROJECT_CONSUMPTION_DETAILS(postData);
                    this.isUpdateEnabled=false;
                    this.$message({
                        showClose: true,
                        message: 'Successfully Updated',
                        type: 'success',
                        center: true
                    });
                    this.isLoading1 = false;
                    if(this.$route.name =="leadSummary:design" && this.designData.id)
                      await this.SET_DESIGN(this.designData.id);
                }
                catch(error){
                    let errorMessage = error.response.status === 403 ? "You don't have permission to edit this project." : 'error'
                    this.$message({
                      showClose: true,
                      message: errorMessage,
                      type: "error",
                      center: true
                    })  
                    this.isLoading1 = false;
                }
               
            },
            async selectedUtilityRateName(name,preOrPostSolar,masterTariffId){
              this.isUpdateEnabled= true;
              this.isButtonLoading = true;
              let response;
              if(preOrPostSolar=='preSolar'){
                this.utilityRateName = name;
                this.utility_tariff_details.utility_rate_name = name;
                this.utilityRateError = !(this.utility_tariff_details.utility_rate_name)? true : false;
                response = await API.TOU.FETCH_SPECIFIC_TARIFF(this.lseId, masterTariffId, this.projectId, this.selectedTariffSource)
                // TODO: remove this if condition when response from backend changes
                if(Array.isArray(response.data.results))
                this.specificTariffInfoObj = response.data.results[0];
                else
                this.specificTariffInfoObj = response.data.results;
                // TODO: remove this  when response from backend changes
                // this.specificTariffInfoObj['electricity_rates'] = this.specificTariffInfoObj['electricity_rate']
              }
              else if(preOrPostSolar=='postSolar'){
                this.postUtilityRateName = name;
                this.utility_tariff_details.post_solar_utility_rate_name = name;
                this.postUtilityRateError = !(this.utility_tariff_details.post_solar_utility_rate_name)? true : false;
                response = await API.TOU.FETCH_SPECIFIC_TARIFF(this.postLseId, masterTariffId,this.projectId, this.selectedPostTariffSource)
                // TODO: remove this if condition when response from backend changes
                if(Array.isArray(response.data.results))
                this.specificPostTariffInfoObj = response.data.results[0];
                else
                this.specificPostTariffInfoObj = response.data.results;

                // TODO: remove this  when response from backend changes
                // this.specificPostTariffInfoObj['electricity_rates'] = this.specificPostTariffInfoObj['electricity_rate']
              }
              // this.utilityRateName = name;
              // this.utilityDetails.utilityRate=name;
              this.isButtonLoading = false;
            },
            async fetchSpecificTariffInfo(selectedObj,preOrPostSolar){
              this.isUpdateEnabled= true;
              this.isButtonLoading = true;
              let response;
              if(preOrPostSolar=='preSolar'){
                this.utilityRateName = selectedObj.utility_rate;
                this.utility_tariff_details.utility_rate_name = selectedObj.utility_rate;
                this.utilityRateError = !(this.utility_tariff_details.utility_rate_name)? true : false;
                response = await API.TOU.FETCH_SPECIFIC_TARIFF(this.lseId, selectedObj.id,this.projectId,this.selectedTariffSource)
                this.specificTariffInfoObj = response.data.results;
              }
              else if(preOrPostSolar =='postSolar'){  
                this.postUtilityRateName = selectedObj.utility_rate;
                this.utility_tariff_details.post_solar_utility_rate_name = selectedObj.utility_rate;
                this.postUtilityRateError = !(this.utility_tariff_details.post_solar_utility_rate_name)? true : false;
                response = await API.TOU.FETCH_SPECIFIC_TARIFF(this.postLseId, selectedObj.id,this.projectId,this.selectedPostTariffSource)
                this.specificPostTariffInfoObj = response.data.results;
              }
              this.isButtonLoading = false;
            },
            enableUpdate(){
              this.isUpdateEnabled=true;
            },
            redirectToCustomTariff(){
              this.$router.push({ name: "customTariff" });
            },
            searchUtilityProvider(query) {
              if (query !== "") {
                setTimeout(() => {
                  this.searchUtilityProviderHelper(query);
                }, 200);
              } else {
                this.fetchUtilityProvider('preSolar');
              }
            },
            async searchUtilityProviderHelper(query) {
              try {
                let promise = API.PROJECT_CONSUMPTION_DETAILS.SEARCH_UTILITY_PROVIDER(this.projectId,this.selectedTariffSource,query);
                this.apiPromise = promise
                promise.then(response => {
                  if (this.apiPromise != promise) { return }
                  this.utilityProviderArray = [...response.data.results];
                  this.utilityProviderArrayOptions=[];
                  for(let i=0;i<this.utilityProviderArray.length;i++){
                    // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                    // give a key id for value-key whenever value is the object
                    if(this.utilityProviderArray[i].lseId){
                          this.utilityProviderArray[i]['id'] = this.utilityProviderArray[i].lseId
                    }
                    this.utilityProviderArrayOptions.push(this.utilityProviderArray[i]);
                  }
                  this.nextURL = response.data.next;
                  this.prevURL = response.data.previous;
                })
              } catch (e) {
                // this.loading = false;
                console.error(e);
              }
            },

            searchPostUtilityProvider(query) {
             
              if (query !== "") {
                setTimeout(() => {
                  this.searchPostUtilityProviderHelper(query);
                }, 200);
              } else {
                this.fetchUtilityProvider('postSolar');
              }
            },
            async searchPostUtilityProviderHelper(query) {
              try {
                let promise = API.PROJECT_CONSUMPTION_DETAILS.SEARCH_UTILITY_PROVIDER(this.projectId,this.selectedPostTariffSource,query);
                this.apiPromise = promise
                promise.then(response => {
                  if (this.apiPromise != promise) { return }
                  this.postSolarNextURL = response.data.next;
                  this.postUtilityProviderArray = [...response.data.results];
                  this.postUtilityProviderArrayOptions=[];
                  for(let i=0;i<this.postUtilityProviderArray.length;i++){
                    // pushing id here because in case of lseid, we dont have id as a key and in the el-select we need to 
                    // give a key id for value-key whenever value is the object
                    if(this.postUtilityProviderArray[i].lseId){
                      this.postUtilityProviderArray[i]['id'] = this.postUtilityProviderArray[i].lseId
                    }
                    this.postUtilityProviderArrayOptions.push(this.postUtilityProviderArray[i]);
                  }
                  // this.selectedPostUtilityProviderIndex=null;
                  this.enableUpdate();
                })
              } catch (e) {
                // this.loading = false;
                console.error(e);
              }
            },
            clearUtilityProvider(preOrPostSolar){
              this.fetchUtilityProvider(preOrPostSolar)
            },
            onTariffSourceChange(preOrPostSolar){
              // To clear the Utility Provider whenever the Tariff source is changed
              if(preOrPostSolar=='preSolar'){
                this.selectedUtilityProviderObj=null;
                this.utility_tariff_details.utility_rate_name = null;
                this.lseId='';
                this.keyCount= this.keyCount +1;
              }
              else if(preOrPostSolar=='postSolar'){
                this.selectedPostUtilityProviderObj=null;
                this.utility_tariff_details.post_solar_utility_rate_name = null;
                this.postLseId='';
                this.postSolarKeyCount= this.postSolarKeyCount +1;
              }
            },
            selectUtilityProviderObjFunction(){
              this.enableUpdate();
              if(this.utilityProviderArrayOptions.length){
                this.lseId = this.selectedUtilityProviderObj.lseId || this.selectedUtilityProviderObj.id ;
                this.selectedUtilityProvider = this.selectedUtilityProviderObj.name;
                // to clear the utility rate whenever provider is changed
                this.utility_tariff_details.utility_rate_name = null;
              }
              this.keyCount= this.keyCount +1;
              this.utilityProviderError = !this.selectedUtilityProviderObj? true : false;
            },
            selectPostUtilityProviderObjFunction(){
              this.enableUpdate();
              if(this.postUtilityProviderArrayOptions.length){
                this.postLseId = this.selectedPostUtilityProviderObj.lseId || this.selectedPostUtilityProviderObj.id ;
                this.selectedPostUtilityProvider = this.selectedPostUtilityProviderObj.name;
                // to clear the utility rate whenever provider is changed
                this.utility_tariff_details.post_solar_utility_rate_name = null;
              }
              this.postSolarKeyCount= this.postSolarKeyCount +1;
              this.postUtilityProviderError = !this.selectedPostUtilityProviderObj ? true : false;
            }
    },

    watch:{
      lseId:{
        handler(val){
          this.keyCount= this.keyCount +1;
        }
      },
      postLseId:{
        handler(val){
          this.postSolarKeyCount= this.postSolarKeyCount +1;
        }
      },
      selectedTariffSource:{
        handler(val){
          this.fetchUtilityProvider('preSolar');
        }
      },
      selectedPostTariffSource:{
        handler(val){
          this.fetchUtilityProvider('postSolar');
        }
      },
      // selectedUtilityProviderObj:{
      //   handler(val){
      //     if(this.utilityProviderArrayOptions.length){
      //       this.lseId = val.lseId || val.id ;
      //       this.selectedUtilityProvider = val.name;
      //       // to clear the utility rate whenever provider is changed
      //       this.utility_tariff_details.utility_rate_name = null;
      //     }
      //     this.keyCount= this.keyCount +1;
      //     // this.utilityProviderError = !this.selectedUtilityProviderObj? true : false;
      //   }
      // },
      // selectedPostUtilityProviderObj:{
      //   handler(val){
      //     console.log("^*%&&^&^&*&^*^&*&((*&(*(*&))))")
      //     if(this.postUtilityProviderArrayOptions.length){
      //       this.postLseId = val.lseId || val.id ;
      //       this.selectedPostUtilityProvider = val.name;
      //        // to clear the utility rate whenever provider is changed
      //       this.utility_tariff_details.post_solar_utility_rate_name = null;
      //     }
      //     this.postSolarKeyCount= this.postSolarKeyCount +1;
      //     this.postUtilityProviderError = !this.selectedPostUtilityProviderObj ? true : false;
      //   }
      // },
      consumptionDetails:{
        deep:true,
        immediate:true,
        handler(val){
            this.averageUnitPriceError     = (val.averageUnitPrice ==='')    ?true:false;
            this.averageExportPriceError   = (val.averageExportPrice ==='')  ?true:false;
            this.tariffEscalationRateError = (val.tariffEscalationRate ==='')?true:false;

            this.averageUnitPriceErrorMin     = (val.averageUnitPrice <0)    ?true:false;
            this.averageExportPriceErrorMin   = (val.averageExportPrice <0)  ?true:false;
            this.tariffEscalationRateErrorMin = (val.tariffEscalationRate <0)?true:false;

            this.tariffEscalationRateErrorOver100 = (val.tariffEscalationRate >100)?true:false;
        }
      }
    }
};
</script>

</script>

<style scoped>
  .crumNew {
  display: inline-block;
  font-size: 14px;
  color: #ffff;
  background-color: rgb(239, 161, 72);
  padding: 3px 5px 3px 5px;
  border-radius: 2px;
  margin-left: 10px;
}
.card {
  border: 1px solid var(--step-100);
  border-radius: 8px;
  background: var(--white);
}

.card >>> .el-radio{
  color: #222 !important;
}

.card >>> .el-radio__inner{
  width: 24px !important;
  height: 24px !important;
}

.card >>> .el-radio__label{
  font-size: 16px !important;
}

.card >>> ::placeholder {
  color: #222;
  font-size: 16px;
  font-weight: 100;
}

.card >>> .el-input__inner{
  height: 48px;
}

.card >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-weight: bold;
  font-size: 18px;
  margin-right: 8px;
}

.card >>> .el-select {
  width: 100%;
}

.card .card_header {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  height: 48px;
  align-items: center;
  padding:0px 0px 0px 24px;
  /* padding-left: 24px; */
}

.flex_header {
  display: flex;
  justify-content: space-between;
}

.card .card_header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.card_content {
  padding: 24px;
  padding-top: 4px !important;
  border-radius: 12px 12px 0 0;
}

.dropDownContainer {
  margin-top: 16px;
}

.inputContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: row;
}

.meterFormContainer {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 24px;
  row-gap: 16px;
  padding: 10px 0px 10px 0px;
}

.meterFormContainerCRM {
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;
  row-gap: 16px;
}

.meterInput {
  width: 100% !important;
  margin-bottom: 0px !important;
  position: relative !important;
}

.inputContainer >>> .el-form-item__label{
  color: #222 !important;
}

.inputContainer >>> .el-input {
  width: 100% !important;
}


.card >>> .el-input__inner {
  border: none !important;
  background-color: #e8edf2 !important;
  color: #222 !important;
  font-size: 16px !important;
}

.card >>> .el-form-item__content {
  position: initial !important;
}

.currIcon {
  position: absolute;
  margin-top: 4px;
  right: 4%;
  z-index: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 100;
  color: #222;
}

.btnContainer,
.btnCont {
  display: flex;
  gap: 16px;
  align-items: center;
  
}

.btnContainer {
  justify-content: space-between;
  margin-top: 12px;
}

.mngCT {
  font-size: 18px;
  font-weight: 600;
  text-decoration: underline;
  color: #1c3366;
  cursor: pointer;
}

.card >>> .el-select > .el-input {
  text-align: left !important;
  text-align-last: left !important;
}

.validationForRate{
  margin-left: 3px;
  line-height: normal;
  color: #ff0000;
  margin-top: 8px;
}
.validationForRateInBlack{
  margin-left: 3px;
  line-height: normal;
  margin-top: 8px;
}

.toggleCont {
  display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 16px;
}

.cpMtr {
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
}

.card >>> .el-switch__core {
  width: 32px !important;
}

.card >>> .el-switch.is-checked .el-switch__core::after {
    margin-left: -18px !important;
}

.utilityRCont {
  display: flex;
  gap: 16px;
}

.editIcon {
  margin-top: 38px;
  cursor: pointer;
  width: 24px;
}

.editIcon2 {
  margin-top: 18px;
  cursor: pointer;
  width: 24px;
}

.utPrvDrpdwnInput {

}

.utprDrpdwn {
    font-size: 16px !important;
    padding: 4px 20px !important;
    color: #222 !important;
    height: auto !important;
}

.utprDrpdwn.hover, .utprDrpdwn:hover {
  background: #fff !important;
}

.labelDropdown {
  font-size: 16px;
  color: #222;
  font-weight: 500;
}

.card >>> .el-checkbox {
  display: flex;
  margin-right: 0px;
  align-items: center;
}

.card >>> .el-checkbox__inner {
  width: 20px;
  height: 20px;
}

.card >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #1c3366;
  border-color: #1c3366;
}

.card >>> .el-checkbox__label {
  color: #222;
  font-size: 14px;
  white-space: initial;
  padding-left: 12px;
}

.card >>> .el-checkbox__inner::after {
  top: 3px;
  left: 7px;
  border-width: 2px;
}

.card >>> .el-checkbox__inner {
  border: 1px solid #777;
}

.card >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #222;
}

.radioBtnPVS {
    position: relative;
    margin-bottom: 74px;
    padding-bottom: 1px;
    margin-top: 24px;
}

.labelOnePVS,
.labelTwoPVS {
    display: inline-block;
    width: 55%;
    height: 48px;
    padding: 10px;
    transition: all 0.3s;
    border-radius: 40px;
    background-color: #fff;
    position: absolute;
    cursor: pointer;
    border: 1px solid #ccc;
}

.labelOnePVS {
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 45%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 18px;
    color: #777;
}

.labelTwoPVS {
    margin-left: auto;
    margin-right: auto;
    left: 45%;
    right: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 18px;
    color: #777;
}


.boxed input[type="radio"] {
    display: none;
}

.boxed input[type="radio"]:checked+.labelOnePVS {
    background-color: #409eff;
    color: #fff;
    z-index: 1;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.12);
}

.boxed input[type="radio"]:checked+.labelTwoPVS {
    background-color: #409eff;
    color: #fff;
    z-index: 1;
    box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.12);
}

.containerUtlityRateToggle {
  width: 90%;
  margin: 20px auto;
}

.cursorDisabled{
  cursor: not-allowed;
}

@media screen and (max-width: 1700px) {
  .meterFormContainerCRM {
    grid-template-columns: 1fr;
    grid-gap: 24px;
    row-gap: 4px;
  }
}

@media screen and (max-width: 1100px) {
.card_content {
    padding: 0px 12px 24px 12px !important;
  }
}

@media screen and (max-width: 1000px) {
  .meterFormContainer {
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
  padding: 10px 0px 10px 0px;
  row-gap: 4px;
}

.meterFormContainerCRM {
  grid-template-columns: 1fr;
  grid-gap: 16px;
}

  .card >>> .el-select {
    width: 100% !important;
  }

  .card >>> .el-input {
    width: 100% !important;
  }

  .currIcon {
    right: 4%;
  }
}

@media screen and (max-width: 600px) {
   .meterFormContainer {
  grid-template-columns: 1fr;
  grid-gap: 24px;
  padding: 10px 0px 10px 0px;
  row-gap: 4px;
}

  .card >>> .el-form-item {
    width: 100% !important;

  }

  .card .card_header h4 {
  margin-left: -12px;
  }

  .labelOnePVS,
  .labelTwoPVS {
    font-size: 15px;
    width: 55%;
  }

  .labelOnePVS {
    padding: 10px 10px 10px 10px;
  }

  .labelTwoPVS {
    padding-right: 0px;
    padding-left: 22px;
  }

}

</style>

<template>
  <div class="parentContainer">
    <el-dialog
      :visible="createTariffPopup"
      :close-on-click-modal="false"
      :title="dynamicHeading"
      width="1200px"
      class="delete_module"
      append-to-body
      @close="closeModal"
    >
      <div class="container">
        <el-form class="childContainer">
          <div class="positionR">
            <el-form-item label="Utility Provider*"
              ><br />
              <el-select v-model="finalUtilityRateProvider" placeholder="Select Utility Provider" filterable  clearable remote :loading="isLoading2" @change="addingUtilityRateProvider()" @clear="onClear" :remote-method="searchPostUtilityProvider" name="utilityProvider" v-validate="providerNameValidation">
                <el-option
                    v-for="(item,index) in filteredUtilityRateProviders"
                    :key="index"
                    :label="item.name"
                    :value="item.name">
                </el-option>
                <el-option
                  v-if="searchProviderQuery"
                  value="processing..."
                  >
                    <div class="addUtilityRateName">
                      <img
                        src="../../../assets/drop/Group2258.svg"
                        class="addTierIcon"
                      />
                      <p class="addTier">Add New Utility Provider</p><span>({{searchProviderQuery}})</span>
                    </div>
                </el-option>
                <infinite-loading
                  :distance="0"
                  spinner="bubbles"
                  @infinite="loadMoreUtilityProviders"
                >
                  <div slot="no-more"></div>
                  <span slot="no-results">
                  </span>
                </infinite-loading>
              </el-select>
              <p
                class="providerErrorMsg"
                style="color: red"
                v-show="errors.has('utilityProvider')"
              >
               <!-- {{ errors.first('utilityProvider') }} --> This field is required.
              </p>
            </el-form-item>
          </div>
          <el-form-item label="Utility Rate*"
            ><br />
            <!-- <el-select v-model="finalUtilityRateName" filterable placeholder="Utility Rate" @change="addingUtilityRateName()" :filter-method="filterMethod" :loading="loading" :disabled="!isUtilityProviderSelected">
              <el-option  
                v-for="item in filteredUtilityRateNames"
                :key="item.id"
                :label="item.name"
                :value="item.name">
              </el-option>
              <el-option
              v-if="!filteredUtilityRateNames.length"
              value="processing..."
              >
                <div class="addUtilityRateName">
                  <img
                    src="../../../assets/drop/Group2258.svg"
                    class="addTierIcon"
                  />
                  <p class="addTier">Add New Utility Rate Name</p>
                </div>
            </el-option>
            </el-select> -->
            <el-input v-model="finalUtilityRateName" name="utilityRate" v-validate="rateNameValidation" @input="isUtilityRate()"></el-input>
            <p
                class="providerErrorMsg"
                style="color: red"
                v-show="errors.has('utilityRate')"
              >
                This field is required.
            </p>
          </el-form-item>
          <div class="leftCont">
            <label for="" class="labelCont"
              >Electricity Rates
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    The electricity tariff sets the price or rate at which energy is sold based on defined values of varying time periods.
                  </p>
                </div>
              </div>
            </label>
            <div class="leftBorderCont">
              <div class="headerBrdr">
                <p class="headerVal">Period</p>
                <p class="headerVal">Tier</p>
                <p class="headerVal">Limits (kWh)</p>
                <p class="headerVal">Rate/Unit</p>
              </div>
              <div class="containerBorder">
                <div v-for="(period, index) in electricityRates" :key="index" class="periodBorder">
                  <div class="valBrdr">
                    <div class="ValuesCont">
                      <p class="period" :style="{backgroundColor : periodColors[index]}">{{index+1}}</p>
                      <p class="sNo">1</p>
                      <div class="inputDiv">
                        <p class="inputIcon" v-if="!(period.length==1)">kWh</p>
                        <el-input v-model="period[0].units" v-if="!(period.length==1)" type="Number"></el-input>
                      </div>
                      <div class="inputDiv1">
                        <p class="inputIcon2">{{currencySymbolComputed}}</p>
                        <el-input v-model="period[0].rate" type="Number" v-validate="firstRateValidation" @input="isFirstRate(index, 0)" :name="'rate_' + index"></el-input>
                        <p
                          class="formErrors"
                          style="color: red"
                          v-show="errors.has('rate_' + index)"
                        >
                          <!-- {{ errors.first('price') }} --> This field must be above 0.
                        </p>
                       <div class="forMD"></div>
                      </div>
                    </div>
                  </div>
                  <div class="valBrdrAdd" v-for="(tier, ind) in period.slice(1)" :key="ind">
                    <div class="ValuesCont">
                      <p class="mdPeriod"></p>
                      <p class="sNo">{{ind+2}}</p>
                      <div class="inputDiv">
                        <p class="inputIcon" v-if="!(ind === period.length - 2)">kWh</p>
                        <el-input v-model="tier['units']" v-if="!(ind === period.length - 2)" type="Number" @input="unitsInput"></el-input>
                        <p class="formErrors" style="color: red" v-if="parseFloat(tier['units']) <= parseFloat(electricityRates[index][ind]['units']) && ind+1<electricityRates[index].length-1">The unit must be greater than the previous unit.</p>
                      </div>
                      <div class="inputDiv2">
                        <p class="inputIcon2">{{currencySymbolComputed}}</p>
                        <div>
                        <el-input v-model="tier['rate']" v-validate="rateValidation" @input="isRate(index, ind)" :name="'rate_' + index + '_' + ind" type="Number"></el-input>
                        <p
                          class="formErrors"
                          style="color: red"
                          v-show="errors.has('rate_' + index + '_' + ind)"
                        >
                          <!-- {{ errors.first('price') }} --> This field must be above 0.
                        </p>
                      </div>
                        <img src="../../../assets/drop/Group 2291.svg" class="removeInpIcon" @click="deleteTier(index, ind)"/>
                      </div>
                    </div>
                  </div>
                  <div class="addTierContainer">
                    <div class="deleteContainer" @click="onDeletePeriod"  v-if="index === electricityRates.length - 1 && electricityRates.length>1" :class="{ disabled: isDeletePeriodDisabled }">
                      <img
                      src="../../../assets/drop/Group 2301.svg"
                      class="deletePeriodIcon"
                      />
                      <p class="delPeriod">Delete Period</p>
                    </div>
                    <div class="addTierCont" @click="addingTier(index)">
                      <img
                        src="../../../assets/drop/Group2258.svg"
                        class="addTierIcon"
                      />
                      <p class="addTier">Add Tier</p>
                    </div>
                  </div>
                </div>
                <div class="addWHover">
                <div class="addNewPerContainer"  @click="addingNewPeriod()" :class="{ disabled: isAddPeriodDisabled }">
                  <img
                    src="../../../assets/drop/Group2258.svg"
                    class="addNewPerIcon"
                  />
                  <p class="addNewPer">Add New Period</p>
                </div>
                <div class="selectCurency">
                  <div class="textCurrency">Change Currency</div>
                  <el-select
                    v-model="currency"
                    filterable
                    remote
                    reserve-keyword
                    @change="onCountryChange"
                  >
                    <el-option
                      v-for="country in countryDetails"
                      :key="country.id"
                      :label="
                        `${country.currency_code} ${
                          currencySymbolNameMap[country.currency_code]
                            ? `(${currencySymbolNameMap[country.currency_code]}) ${
                                country.name
                              } `
                            : ''
                        }`
                      "
                      :value="country.id"
                    />
                  </el-select>
                 </div>
                <div class="hover_information" v-if="isAddPeriodDisabled">
                  <i class="fas fa-info-circle"></i>
                  <div class="tooltip">
                    <p>
                      Maximum Limit Reached: You have already defined the maximum number of periods allowed, which is 9. To add additional periods, you will need to remove one or more existing periods.
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          <div class="rightCont">
            <label for="" class="labelCont"
              >Schedule
              <div class="hover_information">
                <i class="fas fa-info-circle"></i>
                <div class="tooltip">
                  <p>
                    Modify your TOU Rate Schedule: Select time slots and assign periods to set up your TOU rate schedule. Click on the desired time slots and use the number keys on your keyboard. The chart displays a full year of data, organized by month and time.
                  </p>
                </div>
              </div>
            </label>
            <div class="borderCont">
              <p class="Weekday">
                Weekday
              </p>
              <TariffTable :key="counter1" :id="tableSp1" @forTableOne="handleTableOneData" :weekdaySchedule="weekdaySchedule" :periodsAvailable="periodsAvailable"/>
            </div>
            <div class="borderCont">
              <p class="Weekday">
                Weekend
              </p>
              <TariffTable :key="counter2" :id="tableSp2"  @forTableTwo="handleTableTwoData" :weekendSchedule="weekendSchedule" :periodsAvailable="periodsAvailable"/>
            </div>
          </div>
        </el-form>
      </div>
      <div class="footer">
        <el-button type="primary" class="footerBtn" @click="addTariff" :disabled= "errors.items.length > 0 || hasLimitErrors">{{dynamicButtonText}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import API from "@/services/api/";
import TariffTable from "./tariffTable.vue"
import currencySymbolNameMap from "@/pages/currency-symbol-name-map";
import { mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";
import { useGeographyStore } from "../../../stores/geography";

export default {
  data() {
    return {
      rateValidation: {
        required: true,
        above_zero: true,
      },
      isTierRatesValid: true,
      firstRateValidation :{
        required: true,
        min_value: 0,
      },
      rateNameValidation: {
        required: true,
      },
      providerNameValidation: {
        required: true,
      },
      currency: 52,
      currencyCode: "USD",
      nextURL: null,
      isScrollStateToBeReset: null,
      isAdded: false,
      searchQuery: "",
      searchProviderQuery: "",
      utilityRateNameSearchText: "",
      utilityRateProviderSearchText: "",
      loading: false,
      isLoading2: false,
      searchNameQuery: "",
      tableSp1: "value1",
      tableSp2: "value2",
      weekdaySchedule: null,
      weekendSchedule: null,
      tableData2: null,
      data: 'Initial data',
      tariffId: null,
      finalUtilityRateName: "",
      finalUtilityRateProvider: "",
      finalUtilityRateProviderId: null,
      finalUtilityRateNameId: null,
      tempUtilityRateProviderId: null,
      tempUtilityRateNameId: null,
      utilityRateNames: null,
      filteredUtilityRateNames: [],
      filteredUtilityRateProviders: [],
      defaultData: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
      periodColors: ['#8ee2ab', '#80b3b3', '#c59430', '#2dae85', '#dbdb70', '#ce3939', '#b2b8bd', '#43c1e1', '#e2c453'],
      counter1: 0,
      counter2: 0,
      electricityRates: [
        [
              {
                units: 0,
                rate: 0
              }                                   
        ],
      ],
    };
  },

  nonReactiveData() {
    return {
      currencySymbolNameMap,
    };
  },
  
  components: {
    TariffTable,
  },

  props: {

    isConsumption:{
      default : false,
    },

    typeOfOperation:{
      type: String,
      default: "Create"
    },

    createTariffPopup: {
      type: Boolean,
      default: false,
    },

    tariffForId: {
      default: () => []
    }

  },

  watch:{
    tariffForId:{
      handler(val){
        this.counter1++;
        this.counter2++;
        this.tariffId = this.tariffForId.id;
        this.filteredUtilityRateProviders.push({
          id: this.tariffForId.utility_provider,
          name: this.tariffForId.utility_provider_name,
          organisation: this.organisation_id,
        });

        this.finalUtilityRateName = this.typeOfOperation==="Edit" ?  this.tariffForId.utility_rate_name : this.tariffForId.utility_rate_name + " (Copy)";
        this.finalUtilityRateProvider = this.tariffForId.utility_provider_name;
        this.finalUtilityRateNameId = this.tariffForId.utility_rate;
        this.finalUtilityRateProviderId = this.tariffForId.utility_provider;
        this.electricityRates = this.tariffForId.electricity_rates;
        this.weekdaySchedule = this.tariffForId.weekday_schedule;
        this.weekendSchedule = this.tariffForId.weekend_schedule;
        this.tempUtilityRateNameId = this.finalUtilityRateNameId;
        this.tempUtilityRateProviderId = this.finalUtilityRateProviderId;
        this.currency = this.tariffForId.country;
        this.onCountryChange(this.currency);
      }
    }
  },

  computed:{

    ...mapState(useProjectStore, {
        currencySymbol: 'GET_CURRENCY_SYMBOL',
    }),
    ...mapState(useGeographyStore, {
      countryDetails: "GET_COUNTRY_DETAILS",
    }),

    hasLimitErrors() {
      for (const period of this.electricityRates) {
        for (let i = 1; i < period.length-1; i++) {
          if (parseFloat(period[i].units) <= parseFloat(period[i - 1].units)) {
            return true; // There is a limit error
          }
        }
      }
      return false; // No limit errors found
    },

    currencySymbolComputed(){
      return currencySymbolNameMap[this.currencyCode];
    },

    projectId () {
      return this.$route.params.projectId || null
    },


    isAddPeriodDisabled() {
      return this.electricityRates.length >= 9;
    },

    isDeletePeriodDisabled() {
      return this.electricityRates.length <= 1;
    },

    isUtilityProviderSelected(){
      if(this.finalUtilityRateProvider) {
        return true;
      }
      return false;
    },

    periodsAvailable(){
      return this.electricityRates.length;
    },

    organisation_id(){
      const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
      return organisation_id;
    },

    dynamicButtonText(){
      return this.typeOfOperation + " Tariff";
    },

    dynamicHeading(){
      if(this.typeOfOperation === "Create"){
        return this.typeOfOperation + " New Tariff";  
      }
      return this.typeOfOperation + " Tariff";
    }

  },

  methods: {

    unitsInput() {
      for (let period of this.electricityRates) {
        for (let i = 1; i < period.length; i++) {
          if (parseFloat(period[i].units) < parseFloat(period[i - 1].units)) {
            this.isTierRatesValid = false;
          }
        }
      }
      this.isTierRatesValid = true;
    },

    onCountryChange(countryId) {
      // chosen is the one selected through dropdown
      const chosenCountryDetails = this.countryDetails.find(
        (country) => country.id === countryId
      );
      this.currency = chosenCountryDetails.id
      this.currencyCode = chosenCountryDetails.currency_code;
      // this.fixedAmount=(this.fixedAmount*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.costCap=(this.costCap*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.sizeCap=(this.sizeCap*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.prodReturnRate=(this.prodReturnRate*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.sizeReturnRate=(this.sizeReturnRate*Number(chosenCountryDetails.conversion_factor))/this.prevConversionFactor;
      // this.prevConversionFactor=chosenCountryDetails.conversion_factor;
      // console.log(this.projectInformation);
      //this.presetConversionFactor = parseFloat((Number(chosenCountryDetails.conversion_factor) / this.projectInformation.country_details.conversion_factor).toFixed(6));
      // this.currencyCodeChanged = chosenCountryCurrencyCode !== this.projectInformation.country_details.currency_code;
      // this.customExchangeRateConversionFactor = this.presetConversionFactor;
    },

    isRate(periodIndex, tierIndex) {
      let stringName = `rate_${periodIndex}_${tierIndex}`
      this.$validator.validate(stringName, this.electricityRates[periodIndex][tierIndex]);
      this.Update = true;
    },

    isFirstRate(periodIndex, tierIndex) {
      let stringName = `rate_${periodIndex}`
      this.$validator.validate(stringName, this.electricityRates[periodIndex][tierIndex]);
      this.Update = true;
    },

    isUtilityRate(){
      this.$validator.validate('utilityRate', this.finalUtilityRateName);
    },

    onClear(){
      this.filteredUtilityRateProviders = this.utilityRateProviders;
    },

    searchPostUtilityProvider(query) {
      setTimeout(() => {
        this.searchProviderQuery = query;
        this.searchUtilityProviderHelper(query);
      }, 200);
    },

    async searchUtilityProviderHelper(query) {
      try {
        this.isLoading2 = true;
        let response =await API.TOU.SEARCH_UTILITY_PROVIDER(query);
        this.filteredUtilityRateProviders = [...response.data.results];
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
      } catch (e) {
        // this.loading = false;
        console.error(e);
      }
      this.isLoading2 = false;
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


    async loadMoreUtilityProvidersHelper(url, $state) {
      try {
          const response = await API.TOU.LOAD_MORE_UTILITY_PROVIDER(url);
          const newProviders = [...response.data.results];
          this.filteredUtilityRateProviders.push(...newProviders);
          this.utilityRateProviders.push(...newProviders);
          this.nextURL = response.data.next;
          $state.loaded();
      }
      catch (e) {
          $state.error();
          console.error();
      }
    },

    onDeletePeriod() {
      this.electricityRates.pop();
    },

    deleteTier(periodIndex, tierIndex) {
      let period = this.electricityRates[periodIndex];
      period.splice(tierIndex+1, 1);
      if (period.length === 0) {
        this.electricityRates.splice(periodIndex, 1);
      }
    },

    handleAdd(){
      this.isAdded=true;
    },

    // filterMethodforProvider(query){
    //   this.searchProviderQuery = query;
    //   if (query !== '') {
    //     this.loading = true;
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.filteredUtilityRateProviders = this.utilityRateProviders.filter(item => {
    //         return item.name.toLowerCase()
    //           .indexOf(query.toLowerCase()) > -1;
    //       });
    //     }, 200);
    //   } else {
    //     this.filteredUtilityRateProviders = this.utilityRateProviders;
    //   }
    // },


    // filterMethod(query) {
    //   this.searchNameQuery = query;
    //   if (query !== '') {
    //     this.loading = true;
    //     setTimeout(() => {
    //       this.loading = false;
    //       this.filteredUtilityRateNames = this.utilityRateNames.filter(item => {
    //         return item.name.toLowerCase()
    //           .indexOf(query.toLowerCase()) > -1;
    //       });
    //     }, 200);
    //   } else {
    //     this.filteredUtilityRateNames = this.utilityRateNames;
    //   }
    // }, 

    handleTableOneData(val){
      this.weekdaySchedule = val;
    },

    handleTableTwoData(val){
      this.weekendSchedule = val;
    },

    async addTariff(){
      let isFormValid = false;
      await this.$validator.validateAll().then((result)=> {
        if (!result) {
          // validation failed, display error messages
          const errors = this.$validator.errors.all();
          // do something with the errors, such as displaying them in a div on the page
        } else {
          isFormValid = true
          // validation passed, submit the form normally
        }
      });
      if(isFormValid) {
        let postData = null;
        if(this.isConsumption){
          postData =  {
            "utility_provider_name": this.finalUtilityRateProvider,
            "utility_provider" : this.tempUtilityRateProviderId,
            "utility_rate_name": this.finalUtilityRateName,
            // "utility_rate": this.tempUtilityRateNameId,
            "electricity_rates": this.electricityRates,
            "weekday_schedule" : this.weekdaySchedule,
            "weekend_schedule" : this.weekendSchedule,
            "source": this.tariffForId.source,
            "country": this.currency,
          };
          this.$emit("added", postData,this.tariffForId.preOrPostSolar);
        } else {
          this.weekdaySchedule = this.weekdaySchedule ? this.weekdaySchedule : this.defaultData;
          this.weekendSchedule = this.weekendSchedule ? this.weekendSchedule : this.defaultData;
          postData =  {
            "utility_provider": this.tempUtilityRateProviderId,
            "utility_rate": this.finalUtilityRateName,
            "organization": this.organisation_id,
            "electricity_rates": this.electricityRates,
            "weekday_schedule" : this.weekdaySchedule,
            "weekend_schedule" : this.weekendSchedule,
            "country": this.currency,
            }
          let response = await API.TOU.TARIFF_CRUD(this.typeOfOperation, this.tariffId, false, postData);
          this.$emit("added", response.data);
        }
      }
    },

    // async addingUtilityRateName(){
    //   this.utilityRateNameSearchText = this.searchNameQuery;
    //   let postData = {};
    //   if(this.finalUtilityRateName === "processing..."){
    //     const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
    //     postData = {
    //       "name": this.utilityRateNameSearchText,
    //       "organisation": organisation_id
    //     } 
    //     let response = await API.TOU.UTILITY_RATE_NAME_CRUD("Create", null, postData);
    //     this.filteredUtilityRateNames.push(response.data[response.data.length-1]);
    //     this.utilityRateNames.push(response.data[response.data.length-1]);
    //     this.tempUtilityRateNameId = response.data[response.data.length-1].id;
    //     this.finalUtilityRateName = response.data[response.data.length-1].name;
    //   } else {
    //     let nameFound = this.utilityRateNames.find(obj => obj.name === this.finalUtilityRateName);
    //     this.tempUtilityRateNameId = nameFound.id;
    //   }
    // },

    async addingUtilityRateProvider(){
      this.$validator.validate('utilityRate', this.finalUtilityRateProvider);
      this.utilityRateProviderSearchText = this.searchProviderQuery;
      let postData = {};
      if(this.finalUtilityRateProvider === "processing..."){
        const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
        postData = {
          "name": this.utilityRateProviderSearchText,
          "organisation": organisation_id
        } 
        let response = await API.TOU.UTILITY_PROVIDER_CRUD("Create", null, postData);
        this.filteredUtilityRateProviders.push(response.data[response.data.length-1]);
        this.utilityRateProviders.push(response.data[response.data.length-1]);
        this.tempUtilityRateProviderId = response.data[response.data.length-1].id;
        this.finalUtilityRateProvider = response.data[response.data.length-1].name;
      } else {
        let nameFound = this.filteredUtilityRateProviders.find(obj => obj.name === this.finalUtilityRateProvider);
        this.tempUtilityRateProviderId = nameFound.id;
      }
      this.searchProviderQuery = "";
    },

    async loadUtilityOptions(){
      const utilityRateProvidersResponse = await API.TOU.UTILITY_PROVIDER_CRUD("Read");
      // const utilityRateNamesResponse = await API.TOU.UTILITY_RATE_NAME_CRUD("Read");
      // this.utilityRateNames = utilityRateNamesResponse.data.results;
      this.nextURL = utilityRateProvidersResponse.data.next;
      // this.filteredUtilityRateNames = this.utilityRateNames;
      this.utilityRateProviders = utilityRateProvidersResponse.data.results;
      this.filteredUtilityRateProviders = this.utilityRateProviders;
    },

    addingTier(period){
      this.electricityRates[period].push({
              units: 0,
              rate: 0
            });   
    },

    addingNewPeriod(){
      this.electricityRates.push([
          {
            units: 0,
            rate: 0       
          }
      ])
    },

    closeModal() {
      this.$emit("close");
    },

  },

  created(){
    // this.fetchCountryDetails();
    this.loadUtilityOptions();
  },

};
</script>
  
<style scoped>

.selectCurency{
  display: flex;
  width: 19rem;
}

.textCurrency{
  display: flex;
  align-items: center;
  width: 200px;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: left;
  color: #222;
}

.formErrors {
    color: red;
    font-size: 12px;
    padding-top: 5px;
}

.providerErrorMsg {
    color: red;
    font-size: 14 px;
    padding-left: 5px;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}

.addWHover{
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
}

.el-dialog__wrapper >>> .el-dialog__wrapper {
  margin-top: 0vh !important;
  max-height: fit-content !important;
}


.el-dialog__wrapper {
  max-height: 100vh;
  margin-top: 0vh !important;
  overflow: hidden;
}
.el-dialog__wrapper >>> .el-dialog {
  border-radius: 16px;
  margin-top: 4vh !important;
  width: 1200px !important;
}
.el-dialog__wrapper >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

.el-dialog__wrapper >>> .el-dialog__title {
  font-family: "Helvetica Neue";
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 2.38;
  letter-spacing: normal;
  text-align: left;
  color: #222 !important;
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

.mngCT {
  font-size: 16px;
  font-weight: 600;
  text-decoration: underline;
  color: #1c3366;
  cursor: pointer;
}


.el-dialog__wrapper >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.el-dialog__wrapper >>> .Weekday{
  text-align: center;
  margin-bottom: 8px;
  color: #222222;
  font-size: 14px;
  font-weight: 600;
}

.el-dialog__wrapper >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 12px 24px 8px 24px;
  overflow: hidden;
  overflow-y: scroll;
  max-height: 80vh;
}

.childContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  row-gap: 24px;
  word-break: break-word;
}

.positionR {
  position: relative;
}

.drpdwnIcon {
  position: absolute;
  top: 54px;
  right: 8px;
  filter: invert(0.8);
  width: 24px;
}

.el-dialog__wrapper >>> .el-form-item,
.el-dialog__wrapper >>> .el-autocomplete,
.el-dialog__wrapper >>> .el-select {
  width: 100%;
  margin-bottom: 0px;
}

.el-dialog__wrapper >>> .el-form-item__label {
  font-size: 14px;
  word-break: break-word;
  text-align: left;
  color: #222;
}

.el-dialog__wrapper >>> .el-select .el-input .el-select__caret {
  color: #222;
  font-size: 18px;
  font-weight: 600;
}

.el-dialog__wrapper >>> ::placeholder {
  color: #222;
}



.el-dialog__wrapper >>> .el-input__inner {
  position: relative;
  background-color: #e8edf2;
  border: none;
  padding: 0 16px;
  color: #222;
  font-size: 16px;
  height: 48px;
}

.hover_information {
  display: inline-block;
  position: relative;
}

.periodBorder{
  padding-top: 16px;
}

table{
  color: black;
  font-weight: 600;
  width: -webkit-fill-available;
}


table td {
    border: 1px solid #999;
    width: 20px;
    padding: 5px;
    height: 20px;
    margin: 10px;
    text-align: center;
    font-size: 14px;
    background-color: #8ee2ab;
}

/* tr:before {
    content: "Jan";
    float: right;
} */

td.selected {
    background-color: green !important;
}

table td {
   user-select: none;
}






.hover_information .tooltip {
  border-radius: 8px;
  box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px var(--light-m);
  background-color: var(--white);
  padding: 12px;
  position: absolute;
  width: 450px;
  left: -15px;
  bottom: 135%;
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
}
.hover_information i:hover ~ .tooltip {
  opacity: 1;
  visibility: visible;
}

.borderCont {
  border: 1px solid #999;
  border-radius: 8px;
  margin-top: 8px;
  width: 100%;
  padding: 8px 16px 16px 16px;
}

.leftBorderCont {
  border: 1px solid #999;
  border-radius: 8px;
  margin-top: 8px;
  width: 100%;
}

.headerBrdr {
  display: grid;
  grid-template-columns: 1.2fr 1.3fr 1.7fr 1.3fr;
  padding: 16px;
  border-bottom: 1px solid #ccc;
}

.headerVal {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.containerBorder {
  padding: 0px 16px 16px 16px;
  max-height: 554px;
  overflow: hidden;
  overflow-y: scroll;
  min-height: 554px;
}


.ValuesCont {
  display: grid;
  grid-template-columns: 1.2fr 1.3fr 1.5fr 1.5fr;
  align-items: flex-start;
  gap: 8px;
}

.period {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background-color: #8ee2ab;
  display: grid;
  place-items: center;
  color: #222;
}

.sNo {
  width: 64px;
  height: 40px;
  border-radius: 2px;
  background-color: #e8edf2;
  display: flex;
  padding-left: 8px;
  align-items: center;
  color: #222;
}

.inputDiv {
  width: 116px;
  position: relative;
}
.inputDiv2 {
  display: flex;
  gap: 8px;
  position: relative;
  width: 116px;
  align-items: baseline;
}

.inputDiv1 {
  display: block;
  gap: 8px;
  align-items: baseline;
  position: relative;
  width: 116px;
}

.ValuesCont >>> .el-input__inner {
  height: 40px !important;
  width: 116px;
  padding-left: 8px;
  padding-right: 44px;
}

.inputDiv1 >>> .el-input__inner {
  padding-left: 24px;
  padding-right: 8px;
}

.inputDiv2 >>> .el-input__inner {
  height: 32px;
  width: 116px;
  padding-left: 24px;
  padding-right: 8px;
}

.inputIcon,
.inputIcon2 {
  position: absolute;
  top: 12px;
  right: 8px;
  z-index: 1;
}

.inputIcon2 {
  left: 8px;
  right: auto;
}

.addTierContainer {
  display: flex;
  justify-content: flex-end;
  gap: 21px;
  padding: 12px 22px 12px 0px;
  border-bottom: 1px solid #ccc;
}

.deleteContainer,
.addTierCont {
  display: flex;
  align-items: center;
  gap: 4px;
}


.addUtilityRateNameContainer {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.addUtilityRateName{
  display: flex;
  border-bottom: 1px solid #ccc; 
  align-items: center;
  gap: 8px;
}

.delPeriod {
  font-size: 14px;
  font-weight: 500;
  color: #777;
  text-decoration: underline;
  cursor: pointer;
}

.addTier {
  color: #1c3366;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.addTierIcon,
.deletePeriodIcon,
.removeInpIcon {
  cursor: pointer;
}

.valBrdrAdd {
  margin: 16px auto 0px auto;
}

.addNewPerContainer {
  padding: 16px 0px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.addNewPerIcon {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.addNewPer {
  color: #1c3366;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 0px 24px 16px 24px;
}

.footerBtn {
  font-size: 18px;
  font-weight: 600;
}

.forMD {
  display: none;
}

@media (max-width: 1240px) {

  .hover_information .tooltip {
    width: 300px;
  }
  .el-dialog__wrapper {
    max-height: 100vh;
    margin-top: 3vh !important;
  }
  .el-dialog__wrapper >>> .el-dialog {
    width: 90vw !important;
    margin-top: 2vh !important;
  }

  .el-dialog__wrapper >>> .el-dialog__header {
    padding: 16px !important;
  }

  .container {
    max-height: 77vh;
    overflow: hidden;
    overflow-y: scroll;
    padding: 8px 16px 8px 16px;
  }

  .childContainer {
    grid-template-columns: 100%;
    row-gap: 8px;
  }

  .leftCont,
  .rightCont {
    margin-top: 8px;
  }

  .headerBrdr {
    padding: 10px;
  }

  .containerBorder {
    padding: 10px;
  }

  .containerBorder {
    min-height: auto;
  }

  .footer {
    justify-content: center;
  }
}

@media (max-width: 583px) {
  .containerBorder {
    padding: 10px 2px 10px 8px;
  }
  .headerBrdr {
    grid-template-columns: 40px 40px 1fr 2fr;
    gap: 10px;
  }

  .headerVal {
    font-size: 13px;
  }

  .ValuesCont {
    grid-template-columns: 40px auto 1fr 2fr;
    gap: 8px;
  }

  .mdPeriod {
    width: 32px;
  }

  .inputDiv,
  .ValuesCont >>> .el-input__inner,
  .inputDiv2,
  .inputDiv2 >>> .el-input__inner {
    width: 100%;
  }

  .ValuesCont >>> .el-input__inner {
    padding: 0px 8px;
  }

  .inputDiv2 >>> .el-input__inner {
    padding-left: 24px;
    padding-right: 8px;
  }

  .inputDiv1 >>> .el-input__inner {
    padding: 0px 8px 0px 20px;
  }
  .sNo {
    width: 40px;
    display: grid;
    place-items: center;
    padding: 0px;
  }

  .inputIcon {
    display: none;
  }

  .addTierContainer {
    padding: 12px 2px 12px 0px;
  }

  .forMD {
    display: flex;
    width: 24px;
  }
}
</style>

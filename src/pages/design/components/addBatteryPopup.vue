<template>
  <div class="parentContainer">
    <el-dialog
      :visible="isAddBatteryPopupVisible"
      :close-on-click-modal="false"
      style="min-width: 930px"
      title="Add Battery"
      width="800px"
      v-loading.fullscreen="isLoading"
      @close="onDialogClose"
    >
      <div class="container" v-show="curPage == 1">
        <el-form ref="form" :model="form" @submit.native.prevent>
          <div class="checkBoxContainer">
            <el-checkbox @change="calculateBatteryCapacity" v-model="form.for_self_consumption" @input="valueUpdated = true;">
              Use Battery for Self-consumption
            </el-checkbox>
            <div class="hover_information">
              <i class="fas fa-info-circle"></i>
              <div class="tooltip tooltip-bottom">
                <p>
                  Take advantage of time-of-use (TOU) rates by using the battery to decrease the utility bill. Calculate battery capacity required for daily use based on the hourly consumption range in a day, the critical load, and the backup needed in an emergency.
                </p>
              </div>
            </div>
            <div class="self-consumption-container" :class="{'section-collapsed': !form.for_self_consumption}">
              <div class="timeContainer">
                <p class="timeHead">Self Consumption Hours</p>
                <div class="timeInputs" v-for="(curRange, ind) in form.time_ranges" :key="'range' + ind">
                  <el-time-select
                    v-model="curRange[0]"
                    placeholder="Start time"
                    :clearable="false"
                    :picker-options="{
                      start: '00:00',
                      step: '00:30',
                      end: '23:59',
                      minTime: getStartMinTime(ind),
                      maxTime: getStartMaxTime(),
                    }"
                    @change="updateTotalConsumptionHours">
                  </el-time-select>
                  <p class="toTime">To</p>
                  <div style="position: relative">
                    <span class="moon-icon" @click="setToEndOfDay(ind)">
                      <img src="@/assets/img/moon-icon.svg" width="14px">
                    </span>
                    <el-time-select
                      v-model="curRange[1]"
                      placeholder="End time"
                      :clearable="false"
                      :picker-options="{
                        start: '00:00',
                        step: '00:30',
                        end: '23:59',
                        minTime: getEndMinTime(ind),
                        maxTime: getEndMaxTime(ind),
                      }"
                      @change="updateTotalConsumptionHours">
                    </el-time-select>
                  </div>
                  <img src="../../../assets/drop/Group 1735.svg" class="addIcon" v-if="ind != 0 || form.time_ranges.length > 1" @click="removeConsumptionTimeRange(ind)"/>
                  <img src="../../../assets/drop/Group 1733.svg" class="addIcon" v-if="ind == form.time_ranges.length - 1" @click="addConsumptionTimeRange"/>
                </div>
                <p class="validationCss" v-if="isConsumptionHoursOverlap">
                  Please make sure there is no overlap in the time ranges.
                </p>
              </div>
              <div style="display: flex; gap: 1em">
                <div class="field_container">
                  <label>Total Consumption Hours</label>
                  <div style="font-size: 2em">
                    {{totalConsumptionHours}} hour{{totalConsumptionHours == 1 ? '' : 's'}}
                  </div>
                </div>
                <div class="field_container" style="position: relative">
                  <label>Minimum Required Battery Capacity</label>
                  <div
                    style="font-size: 2em; transition: 1s"
                    :style="{ color: showCapacityValidationError ? 'darkorange' : '' }"
                    v-if="!minBatteryCapacityUpdateRequired">
                    {{minBatteryCapacity}} kWh
                  </div>
                  <el-button v-else
                    @click="calculateBatteryCapacity"
                    :loading="isLoadingBatteryCapacity"
                    plain round>
                    Refresh
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <!-- TODO: Responsive design for this div -->
          <div class="battery-selection-container">
            <div v-for="(bat, ind) in form.battery_detail" :key="ind" class="battery-row">
              <el-form-item label="Manufacturer">
                <el-select v-model="bat.manufacturer.id" :loading="isLoadingBatMans" @change="changeManufacturer(bat)">
                  <el-option
                    v-for="batMan in batteryManufacturerList"
                    :key="batMan.id"
                    :value="batMan.id"
                    :label="batMan.name"
                  >
                    {{batMan.name}}
                  </el-option>
                  <div
                    v-infinite-scroll="loadMoreManufacturers"
                    infinite-scroll-disabled="busy"
                    infinite-scroll-distance="10"
                    style="text-align: center">
                    <i v-if="manufacturerPaginationDict.busy" class="el-icon-loading infiniteScrollLoader"/>
                  </div>
                  <!-- <infinite-loading
                    :distance="0"
                    spinner="bubbles"
                    @infinite="loadMoreManufacturers"
                  >
                    <div
                      slot="no-more"
                      style="color: #606266; font-size: 12px">
                      No more batteries.
                    </div>
                    <div
                      slot="no-results"
                      style="color: #606266; font-size: 12px">
                      No more batteries.
                    </div>
                    <div
                      slot="error"
                      style="color: #606266; font-size: 12px">
                      Error while fetching batteries.
                    </div>
                  </infinite-loading> -->
                </el-select>
              </el-form-item>
              <el-form-item label="Battery Model">
                <el-select
                  value-key="id"
                  v-model="bat.battery"
                  :loading="bat.batteryModelsDict.isLoading"
                  :disabled="!bat.manufacturer.id"
                  @visible-change="loadBatteryModels(bat)"
                  @change="changeBatteryModel"
                >
                  <el-option
                    v-for="model in bat.batteryModelsDict.list"
                    :key="model.id"
                    :value="model"
                    :label="model.model"
                  >
                    {{model.model}} - {{batteryUsableCapacity(model)}}
                  </el-option>
                </el-select>
                <p class="validationCss" v-if="validateBattery && bat.battery.id==null">
                  Please choose a battery model.
                </p>
              </el-form-item>
              <el-form-item label="Battery Count">
                <el-input-number
                  controls-position="right"
                  v-model="bat.quantity"
                  :min="1"
                  @input="updateTotalBatteryCapacity"
                >
                </el-input-number>
                <p class="validationCss" v-if="bat.quantity==0">
                  Battery Count can't be 0.
                </p>
              </el-form-item>
              <img
                src="../../../assets/drop/Group 1735.svg"
                class="addIcon battery-icon"
                v-if="ind != 0 || form.battery_detail.length > 1"
                @click="removeBatteryFromDetail(ind)"
              />
              <img
                src="../../../assets/drop/Group 1733.svg"
                class="addIcon battery-icon"
                v-if="ind == form.battery_detail.length - 1"
                @click="addNewBatteryToDetail"
              />
            </div>
            <p class="validationCss" v-if="noBatterySelected">
              You must add at least one battery.
            </p>
            <div style="display: flex; gap: 1em">
              <div class="field_container" style="margin-top: 16px" v-if="form.for_self_consumption">
                <label>Minimum Required Battery Capacity</label>
                <div
                  style="font-size: 2em; transition: 1s"
                  :style="{ color: showCapacityValidationError ? 'darkorange' : '' }"
                >
                  {{minBatteryCapacity}} kWh
                </div>
              </div>
              <div class="field_container" style="margin-top: 16px">
                <label>Total Selected Battery Capacity</label>
                <div
                  style="font-size: 2em"
                >
                  {{form.total_battery_capacity}} kWh
                </div>
              </div>
            </div>
            <p class="validationCss" v-if="showCapacityValidationError">
              The total selected battery capacity must be higher than the minimum required battery capacity.
            </p>
          </div>
          <div v-if="showAdvancedSection" class="advanced-container">
            <el-checkbox v-model="showAdvancedOptions" @change="valueUpdated = true">Advanced</el-checkbox>
            <div class="advanced-table" :class="{'section-collapsed': !showAdvancedOptions}">
              <div class="advanced-row advanced-header">
                <span>Period</span>
                <span>Tier</span>
                <span>Units (kWh)</span>
                <span>Rate</span>
                <span>Charge from Grid</span>
                <span>Discharge to Grid</span>
                <span>Discharge to Load</span>
                <span>Charge from Solar</span>
                <span>Preference Grid/Battery</span>
              </div>
              <template v-for="period, pInd in periodRows">
                <div v-for="(tier, tierInd) in period" class="advanced-row">
                  <div>
                    <span v-if="tierInd == 0">{{pInd + 1}}</span>
                  </div>
                  <div>{{tierInd + 1}}</div>
                  <div>{{tier.units}}kWh</div>
                  <div>{{ currencySymbol }}{{tier.rate}}</div>
                  <div>
                    <el-checkbox
                      v-if="tierInd == 0"
                      v-model="tier.charge_from_grid"
                      @change="updateTotalBatteryCapacity"
                      :disabled="tier.discharge_to_grid"
                    >
                    </el-checkbox>
                  </div>
                  <div>
                    <el-checkbox
                      v-if="tierInd == 0"
                      v-model="tier.discharge_to_grid"
                      @change="updateTotalBatteryCapacity"
                      :disabled="tier.charge_from_grid"
                    >
                    </el-checkbox>
                  </div>
                  <div>
                    <el-checkbox
                      v-if="tierInd == 0"
                      v-model="tier.discharge_to_load"
                      @change="updateTotalBatteryCapacity"
                    >
                    </el-checkbox>
                  </div>
                  <div>
                    <el-checkbox
                      v-if="tierInd == 0"
                      v-model="tier.charge_from_solar"
                      @change="updateTotalBatteryCapacity"
                    >
                    </el-checkbox>
                  </div>
                  <div>
                    <el-select
                      v-if="tierInd == 0"
                      v-model="tier.preference"
                      @change="updateTotalBatteryCapacity"
                    >
                      <el-option value="grid" label="Grid">Grid</el-option>
                      <el-option value="battery" label="Battery">Battery</el-option>
                    </el-select>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </el-form>
        <h4 class="footerHead">
          In an outage, get a backup of
        </h4>
        <div class="footerCont" v-loading="isLoadingBackupTime">
          <div class="boxOne">
            <img src="./../../../assets/drop/cloud (2).svg" class="cloudImg" />
            <div class="BOCont">
              <div class="ftrIcons">
                <p class="dAndHrs">{{batteryBackupOnStorageAndLoadText}}</p>
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                        Estimated battery backup duration for a given battery capacity and critical load when solar power is unavailable.
                      </p>
                    </div>
                </div>
              </div>
              <p class="strg">on storage with critical load</p>
            </div>
          </div>
          <div class="boxOne">
            <img src="./../../../assets/drop/Group 1734.svg" class="cloudImg" />
            <div class="BOCont">
              <div class="ftrIcons">
                <p class="dAndHrs">{{batteryBackupOnStorageText}}</p>
                <div class="hover_information">
                    <i class="fas fa-info-circle"></i>
                    <div class="tooltip">
                      <p>
                         Estimated battery backup duration for a given battery capacity when solar power is unavailable.
                      </p>
                    </div>
                  </div>
              </div>
              <p class="strg">on storage only</p>
            </div>
          </div>
          <div class="boxTwo">
            <img
              src="./../../../assets/drop/brightness-high (2).svg"
              class="sunImg"
            />
            <div class="BOCont">
              <div class="ftrIcons">
                <p class="dAndHrs">{{batteryBackupOnStorageAndSolarText}}</p>
                <div class="hover_information">
                  <i class="fas fa-info-circle"></i>
                  <div class="tooltip tooltip-end">
                    <p>
                      Estimated battery backup duration for a given battery capacity when solar power is available.
                    </p>
                  </div>
                </div>
              </div>
              <p class="strg">on solar & storage</p>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 1em">
          <el-tooltip
          :disabled="validBatteryCount"
          effect="dark"
          placement="top-start"
          content="Please enter a valid value for the Battery Count."
          >
            <span>
              <el-button
                type="primary"
                :disabled="isCalculateBackupButtonDisabled"
                @click="updateBatteryStats"
                class="calBtn"
              >
                Calculate Backup
              </el-button>
            </span>
          </el-tooltip>
        </div>
        <p class="terms">The battery backup is calculated daily from 12 midnight.*</p>
      </div>
      <div class="btnContainer">
        <el-tooltip
          :disabled="!valueUpdated"
          effect="dark"
          placement="top-start"
          content="Please click on Calculate Backup before adding the battery."
        >
          <span>
          <el-button
            type="primary"
            class="footer-btn"
            @click="saveBatteryDetails"
            :disabled="valueUpdated || isBatteryCapacityInsufficient"
          >
            Add Battery
          </el-button>
          </span>
        </el-tooltip>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useProjectStore } from "../../../stores/project.js";
import { useDesignStore } from "../../../stores/design.js";
import axios from "axios";
import API from "@/services/api/";
import { modifyBackupTime } from './js/utils.js'
import { paginationHelper } from '@/utils.js'


function convertRangeFormat(timeRanges) {

  let startingHours = timeRanges.map(range => range[0])
  let endingHours = timeRanges.map(range => range[1])

  return { startingHours, endingHours }
}

function addBatteryDefaultFields(bat) {
  bat.batteryModelsDict = {
    isLoading: false,
    list: [bat.battery],
    curManufacturerId: null
  }
}

export default {
  name: "addBatteryPopup",
  props: {
    isAddBatteryPopupVisible: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      form: {
        estimated_energy_consumption: "",
        consumption_profile_id: -1,
        critical_load: "",
        battery_model: "",
        projectType: "",
        for_self_consumption: false,
        time_ranges: [],
        battery_detail: [],
        total_battery_capacity: 0
      },
      // tiers: [
      //   {
      //     period: 1,
      //     tier: 1,
      //     units: 20,
      //     rate: 123,
      //     charge_from_grid: true,
      //     discharge_to_grid: false,
      //     discharge_to_load: true,
      //     charge_from_solar: false,
      //     preference: "grid"
      //   },
      //   {
      //     period: 2,
      //     tier: 1,
      //     units: 20,
      //     rate: 123,
      //     charge_from_grid: true,
      //     discharge_to_grid: false,
      //     discharge_to_load: true,
      //     charge_from_solar: false,
      //     preference: "grid"
      //   },
      // ],
      periodRows: [],
      periods: [
        [
          [
            {
              "rate": 0,
              "units": 1
            }
          ],
          [
            {
              "rate": 12,
              "units": 5
            }
          ]
        ],
        [
          [
            {
              "rate": 45,
              "units": 34
            }
          ]
        ]
      ],
      batteryBackupOnStorage: 0,
      batteryBackupOnStorageAndSolar: 0,
      batteryBackupOnStorageAndLoad: 0,
      totalConsumptionHours: 0,
      minBatteryCapacity: 0,

      isLoading: true,
      isLoadingBatMans: true,
      isLoadingBackupTime: false,
      isEdited: false,
      isLoadingBatteryCapacity: false,
      valueUpdated: false,
      minBatteryCapacityUpdateRequired: false,
      validBatteryCount: false,
      validateBattery: false,

      isConsumptionHoursOverlap: false,
      curPage: 1,
      showAdvancedOptions: false,
      showAdvancedSection: false,
      manufacturerPaginationDict: {
        copyUrl: null,
        nextUrl: null,
        busy: false,
      },

      energyConsumptionRequired: false,
      criticalLoadRequired: false,
      batteryModelRequired: false,
      batteryCapacityRequired: false,
      noBatterySelected: false,

      consumptionProfileData: [],
      allConsumptionProfileData: [],
      selectedProfile: {
        Name: "",
      },
      allConsumptionProfileData: [],
      projectInformation: {
        projectType: "",
        consumption: 0,
        profile: "",
      },
      batteryManufacturerList: [],
    };
  },
  computed: {
    ...mapState(useDesignStore, {
      boqTableData: 'GET_ORGANISATION_BOQ_TABLE_DATA',
      consumptionData: "GET_CONSUMPTION_DATA",
      designPathData: "GET_DESIGN_PATH_DATA",
      designData: "GET_ENTIRE_DESIGN",
      projectId: (state) => state.project.id,
    }),
    ...mapState(useProjectStore, {
      currencySymbol: "GET_CURRENCY_SYMBOL",
      
    }),
    
    isBatteryCapacityInsufficient() {
      let inSufficientCondition = this.form.for_self_consumption && 
      (this.form.total_battery_capacity < this.minBatteryCapacity|| this.minBatteryCapacityUpdateRequired);      
      return inSufficientCondition;
    },
    isCalculateBackupButtonDisabled() {
      let condition = !this.batteryManufacturerExists || !this.batteryModelExists
      || (!this.valueUpdated || !this.validBatteryCount);
      return condition
    },
    showCapacityValidationError() {
      let condition = this.isBatteryCapacityInsufficient && this.batteryManufacturerExists
      && this.batteryModelExists
      return condition
    },
    watchProjectType() {
      return this.form.projectType;
    },
    batteryBackupOnStorageText() {
      return modifyBackupTime(this.batteryBackupOnStorage)
    },
    batteryBackupOnStorageAndSolarText() {
      return modifyBackupTime(this.batteryBackupOnStorageAndSolar)
    },
    batteryBackupOnStorageAndLoadText() {
      return modifyBackupTime(this.batteryBackupOnStorageAndLoad)
    },
    batteryManufacturerExists() {
      return this.form.battery_detail?.[0]?.manufacturer?.id
    },
    batteryModelExists() {
      return this.form.battery_detail?.[0]?.battery?.id
    }
  },
  async created() {
    this.updatePeriodRowsData()
    await this.fetchBatteryManufacturerData()

    if (this.consumptionData.battery_detail && this.consumptionData.battery_detail.length) {
      JSON.parse(JSON.stringify(this.consumptionData.battery_detail)).forEach(bat => {
        addBatteryDefaultFields(bat)
        this.form.battery_detail.push(bat)
      })
    } else {
      this.addNewBatteryToDetail()
    }
    this.updateTotalBatteryCapacity()

    // await this.assignProjectDetail()

    let details = this.consumptionData
    let form = this.form
    form.estimated_energy_consumption = parseInt(details.estimated_energy_consumption) || 0
    form.critical_load = details.critical_load || 0
    form.battery_model = details.battery_model || 'Generic Battery'
    form.battery_capacity = details.total_battery_capacity || 0
    form.for_self_consumption = details.for_self_consumption
    
    if (!(details.self_consumption_starting_hours && details.self_consumption_ending_hours && details.self_consumption_starting_hours.length && details.self_consumption_ending_hours.length)) {
      form.time_ranges.push(['12:00', '13:00'])
      this.updateTotalConsumptionHours()
    } else {
      let rangeLength = details.self_consumption_starting_hours.length > details.self_consumption_ending_hours.length ? details.self_consumption_starting_hours.length : details.self_consumption_ending_hours.length
      for (let i = 0; i < rangeLength; i++) {
        let startTime = details.self_consumption_starting_hours[i]
        let endTime = details.self_consumption_ending_hours[i]
        form.time_ranges.push([startTime, endTime])
      }
      this.updateTotalConsumptionHours()
    }

    // Small timeout is required here so that these values do not get reset to zero by another function.
    setTimeout(() => {
      this.batteryBackupOnStorage = details.battery_backup_on_storage
      this.batteryBackupOnStorageAndSolar = details.battery_backup_on_storage_and_solar
      this.batteryBackupOnStorageAndLoad = details.battery_backup_on_storage_and_load
    }, 100);
    this.minBatteryCapacity = details.minimum_battery_capacity || 0
    if (form.for_self_consumption && this.minBatteryCapacity) {
      this.minBatteryCapacityUpdateRequired = false
    }

    this.isLoading = false
  },
  methods: {
    ...mapActions(useDesignStore, {
      updateBOQTable: "UPDATE_BOQ_TABLE",
      setDesign: "SET_DESIGN",
    }),
    onDialogClose() {
      this.$emit("update:isAddBatteryPopupVisible", false);
    },

    validateForm() {
      let countInvalid = 0
      // if (!form.estimated_energy_consumption || parseFloat(form.estimated_energy_consumption) == 0) {
      //   this.energyConsumptionRequired = true
      //   this.goToPage(1)
      //   countInvalid++
      // }
      // if (!form.critical_load) {
      //   this.criticalLoadRequired = true
      //   countInvalid++
      // }
      // if (!form.battery_model) {
      //   this.batteryModelRequired = true
      //   countInvalid++
      // }
      // if (!form.battery_capacity) {
      //   this.batteryCapacityRequired = true
      //   countInvalid++
      // }

      if (this.isBatteryCapacityInsufficient) {
        countInvalid++
      }

      return countInvalid
    },

    validateFormForBatteryCapacity() {
      let countInvalid = 0
      let form = this.form
      // if (!form.estimated_energy_consumption || parseFloat(form.estimated_energy_consumption) == 0) {
      if (!parseFloat(form.estimated_energy_consumption)) {
        this.energyConsumptionRequired = true
        countInvalid++
      }

      return countInvalid
    },
    
    async assignProjectDetail() {
      let form = this.form

      if (this.consumptionData.consumption_profile) {
        form.projectType = this.consumptionData.consumption_profile.Profile_type  
        form.consumption_profile_id = this.consumptionData.consumption_profile.id;
      }

      const consumptionProfileResp = await axios.get(
        "api/master-data/consumptionProfile/"
      );
      this.allConsumptionProfileData = consumptionProfileResp.data.results;
      this.consumptionProfileData = [];
      if(!form.projectType){
        form.projectType = "Commercial";
      }
      this.allConsumptionProfileData.forEach((item) => {
        if (item.Profile_type == form.projectType)
          this.consumptionProfileData.push(item);
      });
      if (!form.consumption_profile_id) {
        this.selectedProfile = JSON.parse(
          JSON.stringify(this.consumptionProfileData[0])
        );
        form.consumption_profile_id = this.selectedProfile.id;
        this.updateConsumptionDetails();
      }
      let tempSelectedProfile =
        form.consumption_profile_id == null
          ? this.consumptionProfileData[0]
          : this.consumptionProfileData.filter(
              (item) => item.id == form.consumption_profile_id
            )[0];

      if (!tempSelectedProfile)
        tempSelectedProfile = JSON.parse(
          JSON.stringify(this.consumptionProfileData[0])
        );
      this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
    },
    
    confirmProfile(profile) {
      this.selectedProfile = JSON.parse(JSON.stringify(profile))
      this.form.consumption_profile_id = this.selectedProfile.id
      this.valueUpdated = true
      this.minBatteryCapacityUpdateRequired = true
    },

    async calculateBatteryCapacity() {
      if (!this.form.for_self_consumption) { return }

      this.isLoadingBatteryCapacity = true
      
      let designId = this.designPathData.designId
      let form = this.form
      let timeRanges = convertRangeFormat(form.time_ranges)
      let batteryData = {
        total_consumption_hours: parseFloat(this.totalConsumptionHours),
        self_consumption_starting_hours: timeRanges.startingHours,
        self_consumption_ending_hours: timeRanges.endingHours
      }

      try {
        let resp = await API.DESIGNS.CALCULATE_MIN_BATTERY_CAPACITY(designId, batteryData)
        this.minBatteryCapacity = resp.data.minimum_battery_capacity || 0
        this.minBatteryCapacityUpdateRequired = false
      } catch (e) {
        console.error(e)
        this.minBatteryCapacityUpdateRequired = true
        this.$message({
          showClose: true,
          message: "There was an error fetching the minimum required battery capacity.",
          type: "error",
          center: true
        })
      }
      this.isLoadingBatteryCapacity = false
    },

    async updateBatteryStats() {
      if (this.form.for_self_consumption && this.minBatteryCapacityUpdateRequired) {
        await this.calculateBatteryCapacity()
      }
      
      if (this.form.for_self_consumption) {
        let foundOverlap = this.isOverlapInConsumptionHours()
        if (foundOverlap) {
          this.totalConsumptionHours = 0
          this.isConsumptionHoursOverlap = true
          return
        }
      }
      
      this.isLoadingBackupTime = true
      let designId = this.designPathData.designId
      let form = this.form
      // let timeRanges = convertRangeFormat(form.time_ranges)

      let batteryData = {
        // critical_load: parseFloat(form.critical_load),
        // consumption_profile: parseFloat(form.consumption_profile_id),
        // project_type: form.projectType.toLowerCase(),
        // estimated_energy_consumption: parseFloat(form.estimated_energy_consumption),
        // battery_capacity: parseFloat(form.battery_capacity),
        total_battery_capacity: form.total_battery_capacity,
        // total_consumption_hours: parseFloat(this.totalConsumptionHours),
        // self_consumption_starting_hours: timeRanges.startingHours,
        // self_consumption_ending_hours: timeRanges.endingHours
      }
      if (this.showAdvancedOptions) {
        batteryData.battery_tier_details = this.getBatteryTierDetails()
      }

      try {
        let resp = await API.DESIGNS.CALCULATE_BATTERY_BACKUP(designId, batteryData)
        this.batteryBackupOnStorage = resp.data.battery_backup_on_storage
        this.batteryBackupOnStorageAndSolar = resp.data.battery_backup_on_storage_and_solar
        this.batteryBackupOnStorageAndLoad = resp.data.battery_backup_on_storage_and_load

        this.valueUpdated = false
      } catch(error) {
        this.batteryBackupOnStorage = 0
        this.batteryBackupOnStorageAndSolar = 0
        this.batteryBackupOnStorageAndLoad = 0
        const is403Error = error.response.status === 403;
        let errorMessage =  is403Error ?
                          "You don't have permission to edit this project." :
                          "There was an error fetching backup information."
        this.$message({
          showClose: true,
          message: errorMessage,
          type: "error",
          center: true
        })
        is403Error && this.$emit("update:isAddBatteryPopupVisible", false);
      }

      this.isLoadingBackupTime = false
    },

    async saveBatteryDetails() {
      // Validate form values
      this.validateBattery=true;
      let validateBatteryModel=true;
      this.form.battery_detail.forEach(bat => {
        if(bat.battery.id == null){
          validateBatteryModel=false;
        }
      })
      
      if(validateBatteryModel){
        let countInvalid = this.validateForm()
        if (countInvalid) { return }
        let timeRanges = convertRangeFormat(this.form.time_ranges)
        let batteryDetail = this.form.battery_detail.reduce((values, currentValue) => {
            let existingBattery = values.find(
              (batRow) => batRow.battery === currentValue.battery.id
            );
            if (existingBattery) {
              existingBattery.quantity += currentValue.quantity;
            } else {
              values.push({
                battery: currentValue.battery.id,
                quantity: currentValue.quantity,
                // TODO: usable_capacity_kWh is hardcoded here, there could be other units as well.
                capacity: currentValue.battery.usable_capacity_kWh,
              });
            }
            return values;
          },[]
        );
        if (!batteryDetail.length) {
          this.noBatterySelected = true
          return
        }

        this.isLoading = true

        let form = this.form
        let batteryData = {
          // critical_load: form.critical_load || 0,
          // consumption_profile: form.consumption_profile_id,
          // project_type: form.projectType.toLowerCase(),
          // estimated_energy_consumption: form.estimated_energy_consumption,
          // battery_capacity: form.battery_capacity,
          battery_detail: batteryDetail,
          minimum_battery_capacity: this.minBatteryCapacity,
          battery_tier_details: this.getBatteryTierDetails(),
          total_battery_capacity: form.total_battery_capacity,
          battery_model: form.battery_model || 'Generic Battery',
          battery_backup_on_storage: this.batteryBackupOnStorage,
          battery_backup_on_storage_and_solar: this.batteryBackupOnStorageAndSolar,
          battery_backup_on_storage_and_load: this.batteryBackupOnStorageAndLoad,
          total_consumption_hours: this.totalConsumptionHours,
          for_self_consumption: form.for_self_consumption,
          self_consumption_starting_hours: timeRanges.startingHours,
          self_consumption_ending_hours: timeRanges.endingHours
        }
        
        let designId = this.designPathData.designId
        let resp
        try {
          resp = await API.DESIGNS.SAVE_BATTERY_DETAILS(designId, batteryData)

          // // Update battery in manual_bom_data
          // let newTable = [...this.boqTableData]
          // let newBatteryComponent = {
          //   category: "Battery",
          //   make: `${batteryData.battery_model} - ${batteryData.battery_capacity} kWh`,
          //   quantity: '1'
          // }
          // let batteryComponent = newTable.find(mat => mat.category == 'Battery')
          // if (!batteryComponent) {
          //   newTable.push(newBatteryComponent)
          // } else {
          //   let ind = newTable.indexOf(batteryComponent)
          //   newTable[ind] = newBatteryComponent
          // }
          // let payload = {
          //   manual_bom_data: newTable,
          // }
          // await this.updateBOQTable(payload);

          await this.setDesign(designId)

        } catch(e) {
          this.isLoading = false
          this.$message({
            showClose: true,
            message: "There was an error saving the details.",
            type: "error",
            center: true
          });
          throw e
        }

        this.isLoading = false

        this.$emit('confirmDetails', resp.data)
        this.$emit("update:isAddBatteryPopupVisible", false);
      }
    },
    isOverlapInConsumptionHours() {
      let foundOverlap = false
      for (let curRange of this.form.time_ranges) {
        let curStartTime = curRange[0]
        let curEndTime = curRange[1]
        let curStartTimeNum = parseInt(curStartTime.replace(':', ''))
        let curEndTimeNum = parseInt(curEndTime.replace(':', ''))
        for (let curRange of this.form.time_ranges) {
          let startTimeNum = parseInt(curRange[0].replace(':', ''))
          let endTimeNum = parseInt(curRange[1].replace(':', ''))
          let overlapCondition = curStartTimeNum < endTimeNum && curStartTimeNum > startTimeNum
          overlapCondition = overlapCondition || (curEndTimeNum < endTimeNum && curEndTimeNum > startTimeNum)
          if (overlapCondition) {
            foundOverlap = true
            break
          }
        }
        if (foundOverlap) { break }
      }

      return foundOverlap
    },
    updateTotalConsumptionHours() {
      this.isConsumptionHoursOverlap = false
     

      // let totalMs = 0
      // for (let curRange of this.form.time_ranges) {
      //   let startTime = curRange[0]
      //   let endTime = curRange[1]

      //   if (!(startTime && endTime && startTime.getTime && endTime.getTime)) { continue }

      //   // To account for End time being next day
      //   if (endTime < startTime) {
      //     endTime.setDate(startTime.getDate() + 1)
      //   }
  
      //   totalMs += endTime - startTime
      // }
      // let totalHours = totalMs/3600000
      // this.totalConsumptionHours = totalHours.toFixed(1)

      let foundOverlap = this.isOverlapInConsumptionHours()
      if (foundOverlap) {
        this.totalConsumptionHours = 0
        this.isConsumptionHoursOverlap = true
        return
      }

      let totalTime = 0
      for (let curRange of this.form.time_ranges) {
        let startTime = curRange[0]
        let endTime = curRange[1]

        if (!(startTime && endTime)) { continue }

        let startHours = startTime.split(':')[0]
        let startMinutes = startTime.split(':')[1]
        let endHours = endTime.split(':')[0]
        let endMinutes = endTime.split(':')[1]

        if (endTime < startTime) {
          endHours = startHours
          endMinutes = startMinutes
          // curRange[1] = `${endHours}:${endMinutes}`

          // To make the new range item reactive
          let newRange = [curRange[0], `${endHours}:${endMinutes}`]
          let indexOfItem = this.form.time_ranges.indexOf(curRange)
          this.form.time_ranges.splice(indexOfItem, 1, newRange)
        }

        let hourDiff = endHours - startHours
        let minutesDiff = endMinutes - startMinutes

        let halfHour = minutesDiff/60
        let totalDiff = hourDiff + halfHour
        
        totalTime += totalDiff
      }

      if (totalTime > 24) { totalTime = 24 }

      this.totalConsumptionHours = totalTime
      this.valueUpdated = true
      this.minBatteryCapacityUpdateRequired = true
    },
    addConsumptionTimeRange() {
      // let startDate = new Date()
      // let endDate = new Date()
      // startDate.setHours(12, 0, 0, 0)
      // endDate.setHours(12, 0, 0, 0)
      // this.form.time_ranges.push([startDate, endDate])

      let timeRanges = this.form.time_ranges
      let lastTimeRange = timeRanges[timeRanges.length - 1]
      let endTime = lastTimeRange[1]
      let minutes = endTime.split(":")[1]
      let hours = endTime.split(":")[0]
      hours = parseInt(hours)
      if (minutes == '30') {
        hours += 1
        minutes = '00'
      } else {
        minutes = '30'
        if (hours == '24') {
          minutes = '00'
        }
      }
      hours = hours < 10 ? `0${hours}` : hours
      let newTimeRange = [endTime, `${hours}:${minutes}`]
      this.form.time_ranges.push(newTimeRange)
      this.updateTotalConsumptionHours()
    },
    removeConsumptionTimeRange(ind) {
      this.form.time_ranges.splice(ind, 1)
      this.updateTotalConsumptionHours()
    },
    addNewBatteryToDetail() {
      this.validateBattery = false
      let newBat = {
        "manufacturer": {},
        "battery": {},
        "quantity": null,
        "capacity": null,
      }
      addBatteryDefaultFields(newBat)
      this.form.battery_detail.push(newBat)
      this.updateTotalBatteryCapacity()
    },
    removeBatteryFromDetail(ind) {
      this.form.battery_detail.splice(ind, 1)
      this.updateTotalBatteryCapacity()
    },
    getStartMinTime(excludeInd) {
      return
      let endTimes = this.form.time_ranges.filter((val, ind) => ind < excludeInd).map(range => parseInt(range[1].replace(':','')))
      if (endTimes.length) {
        let maxEndTime = Math.max(...endTimes)
        let minutes = maxEndTime.toString().slice(-2)
        let hours = maxEndTime.toString().replace(minutes, '')
        if (minutes == '00') {
          minutes = '59'
          hours -= 1
        } else {
          minutes = '29'
        }
        return `${hours}:${minutes}`
      }
    },
    getStartMaxTime() {
      return
    },
    getEndMinTime(curInd) {
      return this.form.time_ranges[curInd][0]
    },
    getEndMaxTime(curInd) {
      return
      let nextRange = this.form.time_ranges[curInd + 1]
      if (nextRange) {
        let startTime = nextRange[0]
        let hours = startTime.split(':')[1]
        let minutes = startTime.split(':')[0]
        minutes = parseInt(minutes) + 1
        return `${hours}:${minutes}`
      }
    },
    setToEndOfDay(ind) {
      this.form.time_ranges[ind][1] = '24:00'
      this.updateTotalConsumptionHours()
    },
    async fetchBatteryManufacturerData() {
      // Fetching Battery Manufacturer Data
      await API.DESIGNS.GET_BATTERY_MANUFACTURER_DATA().then(resp => {
        this.batteryManufacturerList = resp.data.results
        this.isLoadingBatMans = false
      }).catch(err => {
        console.error(err)
        this.isLoadingBatMans = false
        this.$message({
          showClose: true,
          message: 'Unable to load battery manufacturer details.',
          type: "error",
          center: true
        })
      })

      // // Fetching Battery Model Data
      // API.DESIGNS.GET_BATTERY_MODEL_DATA().then(resp => {
      //   this.batteryModelList = resp.data.results
      //   this.isLoadingBatteryModels = false
      // }).catch(err => {
      //   console.error(err)
      //   this.isLoadingBatteryModels = false
      //   this.$message({
      //     showClose: true,
      //     message: 'Unable to load battery model details.',
      //     type: "error",
      //     center: true
      //   })
      // })
    },
    // TODO: This could be optimized; for some reason it's calling the API every time, for manufacturer=2 alone
    loadBatteryModels(bat) {
      let manufacturerIdToLoad = bat.manufacturer.id

      if (manufacturerIdToLoad == bat.batteryModelsDict.curManufacturerId) { return }
      else if (bat.batteryModelsDict.list.length > 1) { return }

      if (bat.batteryModelsDict.isLoading && 
          bat.batteryModelsDict.curManufacturerId == manufacturerIdToLoad
      ) {
        return
      }

      bat.batteryModelsDict.isLoading = true

      if (bat.battery.manufacturer != bat.manufacturer.id) {
        bat.batteryModelsDict.list = []
      }

      bat.curManufacturerId = manufacturerIdToLoad
      API.DESIGNS.GET_LIST_OF_BATTERIES_FROM_MANUFACTURER(manufacturerIdToLoad).then(resp => {
        if (manufacturerIdToLoad != bat.manufacturer.id) { return }
        resp.data.results.forEach(model => {
          let existingBattery = bat.batteryModelsDict.list.find(battery => battery.id == model.id)
          if (!existingBattery) { bat.batteryModelsDict.list.push(model) }
        })
        bat.batteryModelsDict.isLoading = false
      }).catch(err => {
        console.error(err)
        bat.batteryModelsDict.isLoading = false
        this.$message({
          showClose: true,
          message: 'Unable to load battery model details.',
          type: "error",
          center: true
        })
      })
    },
    // TODO: Need to check if this pagination is working fine
    async loadMoreManufacturers() {
      console.log("MORE MANUFACTURERS")
      let newList = await paginationHelper({
        origArray: this.batteryManufacturerList,
        manufacturerPaginationDict: {},
      })
      if (newList) { this.batteryManufacturerList = newList }
    },
    isOnPageOrHigher(checkPage) {
      if (this.curPage >= checkPage) {
        return true
      }
      return false
    },
    async goToPage(pageNo) {
      if (pageNo == 2) {
        if (this.validateFormForBatteryCapacity()) { return }
        if (this.form.for_self_consumption && this.minBatteryCapacityUpdateRequired) {
          await this.calculateBatteryCapacity()
        }
      }
      this.curPage = pageNo
    },
    calculateTotalBatteryCapacity() {
      this.validBatteryCount=true

      let total = 0
      this.form.battery_detail.forEach(bat => {
        let capacity = this.batteryUsableCapacity(bat.battery, { requireValue: true })
        bat.quantity = bat.quantity ?? 1
        if(bat.quantity > 0){
          this.validBatteryCount=this.validBatteryCount && true
        }else{
          this.validBatteryCount=this.validBatteryCount && false
        }
        
        let quantity = parseFloat(bat.quantity)
        if (isNaN(capacity) || isNaN(quantity)) { return }
        total += capacity * quantity
      })
      total = Math.round(total * 100) / 100
      return total
    },
    batteryUsableCapacity(model, options) {
      options = options || {}
      let requireValue = options.requireValue

      let usableCapacity
      let usableCapacityUnit
      let possibleCapacityKeys = ['usable_capacity_Ah', 'usable_capacity_VA', 'usable_capacity_kWh']
      for (let key of possibleCapacityKeys) {
        if (model[key]) {
          usableCapacity = model[key]
          usableCapacityUnit = key.replace('usable_capacity_','')
          break
        }
      }
      if (!usableCapacity && !usableCapacityUnit) {
        usableCapacity = 0
        usableCapacityUnit = 'kWh'
      }

      if (requireValue) {
        return usableCapacity
      } else {
        return `${usableCapacity}${usableCapacityUnit}`
      }
    },
    changeManufacturer(bat) {
      bat.battery = {}
      bat.batteryModelsDict.list = []
      this.loadBatteryModels(bat)
      this.updateTotalBatteryCapacity()
    },
    changeBatteryModel() {
      this.updateTotalBatteryCapacity()
    },
    updateTotalBatteryCapacity() {
      this.form.total_battery_capacity = this.calculateTotalBatteryCapacity()
      this.valueUpdated = true
      this.noBatterySelected = false
      this.batteryBackupOnStorageAndSolar = '-'
      this.batteryBackupOnStorage = '-'
      this.batteryBackupOnStorageAndLoad = '-'
    },
    updatePeriodRowsData() {
      let periods = this.designData.project?.consumption_details?.utility_tariff_details?.electricity_rates
      if (!periods) { return }
      if (!periods?.[0]?.[0]) {
        this.showAdvancedSection = false
        return
      } else {
        this.showAdvancedSection = true
      }

      let tierDetails = this.designData.battery_tier_details
      
      let periodRows = []
      periods.forEach((period, pInd) => {
        let periodRow = []
        period.forEach((tier, tInd) => {
          let tierChargingPreferences = tierDetails?.[pInd]?.[tInd] || {
            charge_from_grid: false,
            discharge_to_grid: false,
            discharge_to_load: false,
            charge_from_solar: false,
            preference: "grid"
          }
          let tierRow = {
            ...tier,
            ...tierChargingPreferences
          }
          periodRow.push(tierRow)
        })
        periodRows.push(periodRow)
      })
      this.periodRows = periodRows
    },
    getBatteryTierDetails() {
      return this.periodRows.map(period => {
        let tiers = period.map(tier => ({
          charge_from_grid: tier.charge_from_grid,
          discharge_to_grid: tier.discharge_to_grid,
          discharge_to_load: tier.discharge_to_load,
          charge_from_solar: tier.charge_from_solar,
          preference: tier.preference
        }))
        return tiers
      })
    }
  },
  watch: {
    watchProjectType() {
      if (this.allConsumptionProfileData.length > 0) {
        let tempProfileData = [];
        let form = this.form
        this.allConsumptionProfileData.forEach((item) => {
          if (item.Profile_type == form.projectType)
            tempProfileData.push(item);
        });
        this.consumptionProfileData = JSON.parse(
          JSON.stringify(tempProfileData)
        );

        let tempSelectedProfile =
          form.consumption_profile_id == null
            ? this.consumptionProfileData[0]
            : this.consumptionProfileData.filter(
                (item) => item.id == form.consumption_profile_id
              )[0];

        if (!tempSelectedProfile)
          tempSelectedProfile = JSON.parse(
            JSON.stringify(this.consumptionProfileData[0])
          );
        this.selectedProfile = JSON.parse(JSON.stringify(tempSelectedProfile));
        form.consumption_profile_id = this.selectedProfile.id
      }
    },
  },
};
</script>

<style scoped>

.page-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1em;
  border-bottom: 1px solid #ccc;
}

.page-button {
  border: none;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  color: white;
  background: lightgray;
  cursor: pointer;
}

.page-button.active:hover, .page-button:hover {
  background: #344559;
}

.page-button.active {
  background: #263342;
}

.page-button-separator {
  height: 3px;
  /* background: lightgray; */
  /* background: linear-gradient( to right, #263342 0%, lightgray 0% ); */
  /* border-top: 3px solid;
  border-color: lightgray; */
  width: 5em;
  position: relative;
  background: lightgray;
}

.page-button-separator .progress {
  position: absolute;
  width: 0%;
  height: 100%;
  background: #263342;
  transition: 0.5s;
}

.page-button-separator.active .progress {
  width: 100%;
}

.second-page-container >>> .el-form-item {
  display: flex;
  flex-direction: column;
}

.battery-row {
  /* display: flex;
  gap: 1em; */
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 23px 23px;
  grid-gap: 15px;
}

.battery-row >>> .el-form-item {
  margin-bottom: 0 !important;
}

.el-input-number >>> input {
  text-align: left;
}

.el-input-number >>> .el-input-number__decrease, .el-input-number >>> .el-input-number__increase {
  background: unset;
  border: none;
  line-height: 0px;
}

.el-input-number >>> .el-input-number__decrease {
  top: 50%;
}

.el-input-number >>> .el-input-number__increase {
  top: 40%;
  transform: translateY(-50%);
}

.el-input-number >>> .el-icon-arrow-up:before {
  content: "▲";
}

.el-input-number >>> .el-icon-arrow-down:before {
  content: "▼";
}

.parentContainer >>> .el-dialog__header {
  /* background-color: #1c3366; */
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0 !important;
  height: 48px !important;
  padding: 24px !important;
}

.parentContainer >>> .el-dialog__title {
  width: 157px;
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
  color: #222 !important;
}

.parentContainer >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 24px !important;
}

.parentContainer >>> .el-dialog {
  border-radius: 12px !important;
  height: auto;
  /* overflow-y: auto; */
  /* margin-top: 4vh !important; */
  /* width: 930px !important; */
}

.parentContainer >>> .el-dialog__body {
  padding: 0px !important;
}

.container {
  padding: 12px 24px 16px 24px;
  word-break: break-word;
  height: 60vh;
  overflow: hidden;
  overflow-y: scroll;
}

.gridContainer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
  row-gap: 0px;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ccc;
}

.checkBoxContainer {
  padding: 14px 0px 0px 0px;
  border-bottom: 1px solid #ccc;
}

.battery-selection-container {
  border-bottom: 1px solid #ccc;
}

.advanced-container {
  padding: 14px 0px 0px 0px;
  border-bottom: 1px solid #ccc;
}

.advanced-table {
  /* overflow-x: auto; */
  word-break: normal !important;
  max-height: 200px;
  overflow-y: auto;
  transition: 0.5s;
}

.section-collapsed {
  max-height: 0 !important;
}

.advanced-header {
  color: black;
  border-bottom: 1px solid #ccc;
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

.advanced-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 2fr;
  /* margin: 1em 0; */
  padding: 0.5em 0;
  gap: 0.5em
}

.advanced-row div {
  display: flex;
  align-items: center;
}

.advanced-row >>> .el-checkbox {
  padding-bottom: 0 !important;
}

.timeHead{
  font-size: 14px;
  /* font-weight: 100; */
  color: #222;
  margin-bottom: 8px;
}

.timeInputs{
  display: grid;
  grid-template-columns: 120px 16px 120px 23px 23px;
  grid-gap: 15px;
  align-items: center;
  margin-bottom: 8px;
}

.toTime{
  color: #222;
  font-size: 14px;
}

.addIcon {
  width: 23px;
  cursor: pointer;
}

.battery-icon {
  position: relative;
  top: 50px;
}

.gridContainerTwo{
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
  row-gap: 0px;
  margin-bottom: 4px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
}

.chkGridContainer{
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 24px;
  row-gap: 0px;
  margin-bottom: 4px;
  padding-top: 8px;
}

.parentContainer >>> .el-form-item {
  margin-bottom: 16px;
}

.parentContainer >>> .el-form-item__label {
  color: #222;
  /* line-height: 1.5; */
  word-break: break-word;
  text-align: left;
  /* margin-bottom: 8px; */
}

.parentContainer >>> .el-input__inner {
  height: 48px;
  background-color: #e8edf2;
  font-size: 16px;
  color: #222;
  border: none;
}

.parentContainer >>> .el-checkbox {
  font-size: 14px;
  margin-right: 8px;
  color: #222;
  padding-bottom: 16px;
}

.parentContainer >>> .el-checkbox__inner{
  width: 20px;
  height: 20px;
  border: 1px solid #999;
  border-radius: 2px;
}

.parentContainer >>> .el-checkbox__input.is-checked + .el-checkbox__label {
    color: #222;
}

.parentContainer >>> .el-checkbox__inner::after {
    left: 6px;
    top: 3px;
}

.parentContainer >>> .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #263342;
    border-color: #263342;
}

.parentContainer >>> .el-date-editor.el-input{
  width: 100%;
}

.parentContainer >>> .el-input__prefix {
    /* left: 83%; */
    color: #222;
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
  height: 48px;
}

.group_radio .box .icon {
  font-size: 22px;
  margin-right: 4px;
}


.field_container {
  height: fit-content;
  margin-bottom: 16px;
}

.field_container label {
  margin-bottom: 8px;
  display: block;
  color: #222;
}
.select_area {
  position: relative;
  cursor: pointer;
}

.input_field_p {
  margin-top: 4px;
}

.dropDownSvg {
  position: absolute;
  top: 12px;
  right: 8px;
}

.input_field {
  height: 48px;
  color: #222;
  font-size: 16px;
  background-color: #e8edf2;
  border: none;
}

.calBtn{
  font-size: 18px;
  font-weight: 600;
}

.terms {
  margin-top: 16px;
}

.footerHead {
  font-size: 14px;
  font-weight: normal;
  color: #222;
  margin-bottom: 8px;
  margin-top: 1em;
}

.footerCont {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 16px;
  align-items: center;
  word-break: break-word;
}

.boxOne,
.boxTwo {
  padding: 18px 16px;
  border-radius: 4px;
  background-color: #e8edf2;
  display: flex;
  align-items: center;
  height: 100px;
}

.dAndHrs {
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

.strg {
  font-size: 16px;
  color: #222;
}

.BOCont {
  margin-left: 16px;
}

.ftrIcons{
  display: flex;
  gap: 8px;
  align-items: center;
}

.inputValues {
  position: absolute;
  right: 10px;
  font-size: 16px;
  z-index: 100;
  margin-top: 4px;
  top: 40px;
  color: #222;
}

.btnContainer {
  display: flex;
  justify-content: flex-end;
  padding: 1em 2em;
  border-top: 1px solid #ccc;
}

.footer-btn {
  font-size: 18px;
  padding: 12px 32px;
  font-weight: 600;
}

@media (max-width: 930px) {
  .parentContainer >>> .el-dialog {
    width: 90vw !important;
    overflow-y: hidden;
  }

  .parentContainer >>> .el-dialog__wrapper {
    left: 5vw;
    right: 5vw;
    min-width: 0 !important;
    overflow: hidden;
  }
}

@media (max-width: 700px) {
  .parentContainer >>> .el-dialog__wrapper {
    margin-top: 6vh !important;
  }
  .parentContainer >>> .el-dialog {
    margin-top: 0vh !important;
  }

  .parentContainer >>> .el-dialog__header {
    padding: 16px !important;
  }

  .container {
    padding: 16px;
    height: 67vh;
    overflow: hidden;
    overflow-y: scroll;
  }

  .gridContainer,
  .gridContainerTwo,
  .chkGridContainer{
    display: grid;
    grid-template-columns: auto;
  }

  .field_container {
    margin-bottom: 16px;
    flex: 1;
  }

  .footerCont {
    grid-template-columns: 1fr;
  }

  .btnContainer {
    padding-top: 16px;
    padding-bottom: 24px;
  }
}

.consumptionProfileContainer {
  position: absolute;
  z-index: 1000;
  background: white;
  width: 930px;
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

.hover_information .tooltip.tooltip-bottom {
  left: unset;
  bottom: unset
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

.validationCss {
  word-break: break-word;
  margin: 4px auto 0px auto;
  line-height: 25px;
  font-size: 12px;
  color: #ff0000;
}

.self-consumption-container {
  display: grid;
  column-gap: 24px;
  grid-template-columns: 1fr 1fr;
  max-height: 200px;
  overflow-y: auto;
  transition: 0.5s;
}

.moon-icon {
  opacity: 0.5;
  position: absolute;
  right: 8px;
  top: 10px;
  z-index: 5;
  cursor: pointer;
  font-size: 1.5em;
  transition: 0.3s;
}

.moon-icon:hover {
  opacity: 0.9;
}

@media (max-width: 500px) {
  .hover_information .tooltip {
    padding: 8px;
    width: 235px;
    left: -116px;
  }

  .hover_information .tooltip p {
    font-size: 12px;
  }

  .timeInputs {
    grid-template-columns: 100px 16px 100px 23px 23px;
    grid-gap: 10px;
  }

}

@media (max-width: 700px) {
  .self-consumption-container {
    grid-template-columns: 1fr;
  }

  .timeInputs{
    grid-template-columns: 1fr 16px 1fr 23px 23px;
  }
}
</style>
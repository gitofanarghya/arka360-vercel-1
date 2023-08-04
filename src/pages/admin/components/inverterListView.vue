<template>
  <div v-if="!isActive" class="manage_details">
    <div class="header_details">
      <ul class="tag_list">
        <li
          :class="{ active: displayFavOrAllInverter === 'ALL' }"
          @click="setInverterToAll"
        >
          <span class="fontChange">All Inverters</span>
        </li>
        <li
          :class="{ active: displayFavOrAllInverter === 'FAV' }"
          @click="
            setInverterToFav();
            fetchOrganisationInverters();
          "
        >
          <span class="fontChange">Favorites</span>
        </li>
      </ul>
      <div v-if="displayFavOrAllInverter==='ALL'" class="search_group">
        <div class="addition_form">
          <div class="field_group">
            <input
              class="input_field"
              type="text"
              v-model="inverterMakeInput"
              @keyup="generateQueryAndMakeRequest"
              placeholder="Search inverters"
            />

            <input
              class="input_field value_field"
              v-validate="'decimal|min_value:' + 0"
              v-model="filters['p_min']"
              name="min-filter"
              type="text"
              @keyup="generateQueryAndMakeRequest"
              placeholder="Min (kW)"
            />
            <input
              class="input_field value_field"
              v-validate="'decimal|min_value:' + filters['p_min']"
              v-model="filters['p_max']"
              name="max-filter"
              type="text"
              @keyup="generateQueryAndMakeRequest"
              placeholder="Max (kW)"
            />
          </div>
          <button
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#make_inverter"
            @click="resetSearch()"
          >
            Reset Search
          </button>
        </div>
        <div class="not-valid">{{ errors.first("min-filter") }}</div>
        <div class="not-valid">{{ errors.first("max-filter") }}</div>
      </div>
    </div>
    <div class="table_section table_normal" :style="{height: `${(window.height - 400)}px`}">
      <table class="data_table">
        <thead>
          <tr>
            <th>
              <input class="checkbox" type="checkbox" style="visibility:hidden;" />
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Manufacturer</span>
                <i :class="checkSorting('Manufacturer')" @click="changeSorting('Manufacturer')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Size (kW)</span>
                <i :class="checkSorting('Size')" @click="changeSorting('Size')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">MPPT Low(V)</span>
                <i :class="checkSorting('MPPT_Low_V')" @click="changeSorting('MPPT_Low_V')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">MPPT High(V)</span>
                <i :class="checkSorting('MPPT_High_V')" @click="changeSorting('MPPT_High_V')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Type</span>
                 <i :class="checkSorting('inverter_type')" @click="changeSorting('inverter_type')"></i>
              </div>
            </th>
            <!-- <th class="text-center">Action</th> -->
          </tr>
        </thead>
        <tbody v-if="displayFavOrAllInverter === 'ALL' && !(inverterMakeInput || filters.p_min || filters.p_max)">
          <!-- <tr
            v-for="(item, index) in favInverterListToDisplay"
            :key="'A' + index"
            :value="item"
          >
            <td>
              <div class="md_head">Add Favorite</div>
              <div class="value_type giveCursor">
                <i
                   @click="addOrDeleteInverterFromOrg(item.id,item.newInverter.id,item)"
                  class="fa-star " :class="[{fas: starYellowOrWhite(item.newInverter.id,item) === 'yellow'},{far: starYellowOrWhite(item.newInverter.id,item) === 'white'}]"
                >
                </i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{
                  item.newInverter.Manufacturer + " " + item.newInverter.Make
                }}
                (Copy)
              </div>
            </td>

            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">{{ item.newInverter.Size }} kW</div>
            </td>

            <td>
              <div class="md_head">MPPT Low</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.newInverter.MPPT_Low_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">MPPT High</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.newInverter.MPPT_High_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">Type</div>
              <div class="value_type"><span class="nowrap">{{item.newInverter.inverter_type ? item.newInverter.inverter_type : 'String'}}</span></div>
            </td>
          </tr> -->
        </tbody>
        <tbody>
             <tr class="empty-list" v-if="inverterListToDisplay==0 && displayFavOrAllInverter === 'ALL'">
                       <td colspan="6">
                         <div class="create_list" >
                           <div class="info_content">
                              <p class="searchNOtFound">
                                 Sorry, no result found.
                             </p>
                           </div>
                         </div>
                       </td>
                     </tr>
          </tbody>
        <tbody v-if="displayFavOrAllInverter === 'ALL'" >
        
          <tr
            v-for="(item, index) in inverterListToDisplay"
            :key="index"
            :value="item"
          >
            <td>
              <div class="md_head">Add Favorite</div>
              <div class="value_type giveCursor">
                <i
                  @click="addOrDeleteInverterFromOrg(0,item.id,item)"
                  class="fa-star" :class="[{fas: starYellowOrWhite(item.id,item) === 'yellow'},{far: starYellowOrWhite(item.id,item) === 'white'}]"
                >
                </i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{ item.Manufacturer + " " + item.Make }} (Copy)
              </div>
            </td>

            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">{{ item.Size }} kW</div>
            </td>

            <td>
              <div class="md_head">MPPT Low(V)</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.MPPT_Low_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">MPPT High(V)</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.MPPT_High_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">Type</div>
              <div class="value_type"><span class="nowrap">{{item.inverter_type ? item.inverter_type : 'String'}}</span></div>
            </td>
          </tr>

          <div
            v-infinite-scroll="loadMoreInverter"
            infinite-scroll-disabled="busy"
            infinite-scroll-distance="10"
            style="text-align: center">
            <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
          </div>
        </tbody>

        <tbody v-if="displayFavOrAllInverter === 'FAV'" >
          <tr
            v-for="(item, index) in favInverterListToDisplay"
            :key="'A' + index"
            :value="item"
          >
            <td>
              <div class="md_head">Add Favorite</div>
              <div class="value_type giveCursor">
                <i
                  @click="addOrDeleteInverterFromOrg(item.id,item.newInverter.id,item)"
                  class="fa-star" :class="[{fas: starYellowOrWhite(item.newInverter.id,item) === 'yellow'},{far: starYellowOrWhite(item.newInverter.id,item) === 'white'}]"
                ></i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{
                  item.newInverter.Manufacturer + " " + item.newInverter.Make
                }}
                (Copy)
              </div>
            </td>

            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">{{ item.newInverter.Size }} kW</div>
            </td>

            <td>
              <div class="md_head">MPPT Low(V)</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.newInverter.MPPT_Low_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">MPPT High(V)</div>
              <div class="value_type">
                <span class="nowrap"> {{ item.newInverter.MPPT_High_V }}</span>
              </div>
            </td>

            <td>
              <div class="md_head">Type</div>
              <div class="value_type"><span class="nowrap">{{item.newInverter.inverter_type ? item.newInverter.inverter_type : 'String'}}</span></div>
            </td>
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import Vue from "vue";
import { mapState, mapActions } from "pinia";
import { useOrgInventoryInvertersStore } from  "../../../stores/organisation-inventory-inverters"
import API from "@/services/api/";
import { ObserveVisibility } from "vue-observe-visibility";
import debounce from "debounce";


Vue.directive("observe-visibility", ObserveVisibility);



export default {
  props: {
    areFavoritesRequired: {
      type: Boolean,
      default: true,
    },
    inverter: {
      type: [Object, Array],
      default() {
        return this.isAdminPanel ? [] : {};
      },
    },
    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
    isAdminPanel: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      currentAtPanel: true,
      // isActive : true,
      addPanelVisible: false,
      inverterListToDisplay: [],
      favInverterListToDisplay: [],
      displayFavOrAllInverter: "ALL",
      busy: false,

      isScrollStateToBeReset: "",
      scrollState: "",
      loading: false,
      inverterList: [],
      selectedInverter: this.inverter,
      inverterSearch: "",
      addInverterDiv: false,
      inverterdb: [],
      nextURL: null,
      prevURL: null,
      inverterMakeInput: null,
      filters: {
        p_min: null,
        p_max: null,
      },
      getRequestObject: {
        p_min: null,
        p_max: null,
        query: null,
      },
      innerIdToOuterIdMap:{},
       window: {
        width: 0,
        height: 0
      },    
      inverterPageResetNo:0,
      sortingObj:{
                "Manufacturer":0,
                "Size":0,
                "MPPT_Low_V":0,
                "MPPT_High_V":0,
                "inverter_type":0,
              },
      fieldName:'',  
      copyURL:''      
    };
  },

  computed: {
    ...mapState(useOrgInventoryInvertersStore, [
      "GET_ORGANISATION_INVERTERS",
    ]),

    inverterInventory() {
      let inverter = this.GET_ORGANISATION_INVERTERS;
      try {
        for (
          let newInverter = 0;
          newInverter < this.GET_ORGANISATION_INVERTERS.length;
          newInverter++
        ) {
          if (inverter[newInverter]["newInverter"])
            inverter[newInverter]["newInverter"]["displayname"] =
              inverter[newInverter]["newInverter"]["Manufacturer"] +
              " " +
              inverter[newInverter]["newInverter"]["Make"];
        }
      } catch (e) {
        console.log(e);
      }
      return inverter;
    },
    
  },

  watch: {},
  created() {
    this.generateQueryAndMakeRequest = debounce(this.generateQueryAndMakeRequest,1000);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },

  async mounted() {
    await this.FETCH_ORGANISATION_INVERTERS();
    this.fetchInverters();
  },

  methods: {
    ...mapActions(useOrgInventoryInvertersStore, [
      "FETCH_ORGANISATION_INVERTERS",
      "ADD_ORGANISATION_INVERTER",
      "DELETE_ORGANISATION_INVERTER",
    ]),

    handleResize() {
        this.window.width = window.innerWidth;
        this.window.height = window.innerHeight;
      },
     resetSearchNew(){
        this.inverterMakeInput='';
        this.generateQueryAndMakeRequest();

     },
    resetSearch(){
        this.inverterMakeInput='';
        this.filters.p_min='';
        this.filters.p_max='';
        let fieldNameArray = Object.keys(this.sortingObj);
        for(let i=0;i<fieldNameArray.length;i++){
            this.sortingObj[fieldNameArray[i]]=0;
        }
        this.fetchInverters();
    }, 

    checkSorting(fieldName){

        if(this.displayFavOrAllInverter==='FAV')
        return {}

        if(this.sortingObj[fieldName]===0)   //default or neutral
        return {
            "far": true,
            "fa-arrow-alt-circle-down" : true,
            "giveCursor":true,
        }
        
        else if(this.sortingObj[fieldName]===1)  // ascending
        return {
            "fas": true,
            "fa-arrow-alt-circle-up" : true,
            "giveCursor":true,
        }

        else if(this.sortingObj[fieldName]===2)  //descending
        return {
            "fas": true,
            "fa-arrow-alt-circle-down" : true,
            "giveCursor":true,
        }   
    },
    
    changeSorting(fieldName){
      this.fieldName = fieldName;
      if(this.sortingObj[fieldName]===0)
        this.sortingObj[fieldName]=1;  //ascending
      else if(this.sortingObj[fieldName]===1)
        this.sortingObj[fieldName]=2;  // descending
      else if(this.sortingObj[fieldName]===2)
        this.sortingObj[fieldName]=0   //neutral or default

      //now set every other field's sorting to be default or neutral
      let fieldNameArray = Object.keys(this.sortingObj);
      for(let i=0;i<fieldNameArray.length;i++){
        if(fieldNameArray[i]!=fieldName){
          this.sortingObj[fieldNameArray[i]]=0;
        }
      }
      if(!this.inverterMakeInput && !this.filters['p_min'] && !this.filters['p_max'])
      this.fetchInverters(fieldName);
      else{
        this.generateQueryAndMakeRequest();
      }
    },
   
    

    addInverterToOrganisation(selectedInverterId) {
      let doesInverterExist = false;
      for (let i = 0; i < this.inverterInventory.length; i++) {
        try {
          if (this.inverterInventory[i].newInverter) {
            if (
              selectedInverterId === this.inverterInventory[i].newInverter.id
            ) {
              doesInverterExist = true;
              break;
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (doesInverterExist === false) {
        const postData = {
          newInverter: selectedInverterId,
          inverter: 6,
        };
        this.ADD_ORGANISATION_INVERTER({ payload: postData });
        this.$message({
          showClose: true,
          message: "Inverter added to the inventory.",
          type: "success",
          center: true
        });
      } else {
        this.$message({
          showClose: true,
          message: "Inverter already exist in the inventory.",
          type: "error",
          center: true
        });
      }
    },

    starYellowOrWhite(id,item){
      let doesInverterExist = false;
      for (let i = 0; i < this.inverterInventory.length; i++) {
        if (id === this.inverterInventory[i].newInverter.id) {
           doesInverterExist = true;
          break;
        }
      }
      if( doesInverterExist){
        return "yellow";
      }
      else{
        return "white";
      }
    },

    deleteInverterFromOrganisation(outerId,innerId) {
      // const row_to_be_deleted = this.inverterInventory[index].id;
      outerId = this.innerIdToOuterIdMap[innerId];
      this.DELETE_ORGANISATION_INVERTER({ payload: outerId });
      this.$message({
        showClose: true,
        message: "Inverter successfully removed from favourites.",
        type: "success",
        center: true
      });
    },

    addOrDeleteInverterFromOrg(outerId, innerId,item){
      // check whether it is already present or not in organisation
       let doesInverterExist = false;
      for (let i = 0; i < this.inverterInventory.length; i++) {
        if (innerId === this.inverterInventory[i].newInverter.id) {
          doesInverterExist = true;
          break;
        }
      }
      if(doesInverterExist ===true){   // it means its already fav so need to delete it
      for(let i=0;i<this.inverterInventory.length;i++){
           let item = this.inverterInventory[i];
           this.innerIdToOuterIdMap[`${item.newInverter.id}`] = item.id;
        }
        this.deleteInverterFromOrganisation(outerId,innerId);
      } 
      else{
        for(let i=0;i<this.inverterInventory.length;i++){
           let item = this.inverterInventory[i];
           this.innerIdToOuterIdMap[`${item.newInverter.id}`] = item.id;
        }
        this.addInverterToOrganisation(innerId);
      }
    },

    setInverterToAll() {
      this.displayFavOrAllInverter = "ALL";
    },
    setInverterToFav() {
      this.displayFavOrAllInverter = "FAV";
    },

    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }
      this.loadMoreInverter();
    },

    setPanelTrue() {
      this.isActive = true;
      this.currentAtPanel = true;
    },
    setPanelFalse() {
      this.isActive = false;
      this.currentAtPanel = false;
    },
    async fetchOrganisationInverters() {
      try {
        const inventory = this.GET_ORGANISATION_INVERTERS;
        const orgInverters = [];
        this.favInverterListToDisplay = [];
        inventory.map(async (item) => {
          if (item.newInverter !== null) {
            this.favInverterListToDisplay.push(item);
            await orgInverters.push(item.newInverter);
          }
        });
         for(let i=0;i<this.favInverterListToDisplay.length;i++){
           let item = this.favInverterListToDisplay[i];
           this.innerIdToOuterIdMap[`${item.newInverter.id}`] = item.id;
        }

        this.favoritesInverters = {
          label: "Favorites",
          options: orgInverters,
        };
        this.inverterList.push(this.favoritesInverters);
      } catch (e) {
        console.error();
      }
    },

    async fetchMasterDataInverters(fieldName) {
      try {
        this.loading = true;
        let response = await (this.isAdminPanel
          ? API.MASTER_DATA_INVERTER.FETCH_ALL_MASTER_INVERTERS()
          : API.MASTER_DATA_INVERTER.FETCH_MASTER_INVERTERS());
        
        if(fieldName && this.sortingObj[fieldName]!==0){
          // when sortingObj[fieldName]===1 then it is ascending for that field
          // when sortingObj[fieldName]===2 then it is descending for that field
          response = await API.MASTER_DATA_INVERTER.FETCH_ALL_MASTER_INVERTERS_BY_SORT(fieldName,this.sortingObj[fieldName]);
        }
        this.setMasterDataInverters(response.data.results);
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        this.loading = false;
        this.loadMoreInverter();
      } catch (e) {
        console.error();
      }
    },

    async searchMasterInvertersHelper(query) {
      try {
        this.loading = true;

        const response = await API.MASTER_DATA_INVERTER.SEARCH_ALL_INVERTERS(
          query,
          this.isAdminPanel,
          this.fieldName,
          this.sortingObj[this.fieldName],
        );
        // resetting filters and request object in case of no results
        // if (response.data.results.length === 0) {
        //   setTimeout(() => {
        //     this.clearQueryAndReloadInventory();
        //     return null;
        //   }, 1500);
        // }
        this.inverterList = [];
        this.favInverterListToDisplay=[];
        this.setMasterDataInverters(response.data.results);
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        this.loading = false;

        this.loadMoreInverter();
        this.maintainScrollState();
      } catch (e) {
        console.error();
      }
    },

    async loadMoreInvertersHelper(url) {
      try {
        const response = await API.MASTER_DATA_INVERTER.LOAD_MORE_INVERTERS(
          url
        );
        const invertersToBeAppened = response.data.results;
        this.busy = false;
        // Appending it to inventory grou
        this.inverterList.forEach((currentGroup) => {
          if (currentGroup.label === "Inventory") {
            invertersToBeAppened.forEach((inverter) => {
              currentGroup.options.push(inverter);
            });
          }
        });

        for (let i = 0; i < invertersToBeAppened.length; i++) {
          this.inverterListToDisplay.push(invertersToBeAppened[i]);
        }
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
      } catch (e) {
        console.error();
      }
    },

    async fetchInverters(fieldName) {
      this.inverterList = [];
      // fetching organisation panels
      if (this.areFavoritesRequired) await this.fetchOrganisationInverters();
      // Calling after favorites are added to the list
      await this.fetchMasterDataInverters(fieldName);
    },
    setMasterDataInverters(allInventoryInverters) {
      const currentGroup = {
        label: "Inventory",
        options: allInventoryInverters,
      };
      this.inverterList.push(currentGroup);
      // this.inverterListToDisplay.push(allInventoryInverters);

      // last updated
      this.inverterListToDisplay = [];

      for (let i = 0; i < allInventoryInverters.length; i++) {
        this.inverterListToDisplay.push(allInventoryInverters[i]);
      }
      this.loading = false;
    },

    clearQueryAndReloadInventory() {
      // Resetting filter and get request object values
      this.filters.p_min = null;
      this.filters.p_max = null;
      Object.assign(this.getRequestObject, this.filters);
      this.inverterMakeInput = null;
      this.getRequestObject.query = null;
      this.removeEmptyKeysAndConvertKwToW();
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
    },

    removeEmptyKeysAndConvertKwToW() {
      Object.keys(this.getRequestObject).forEach((key) => {
        if (this.getRequestObject[key] !== null) {
          if (key === "p_min" || key === "p_max") {
            // Behalf API this change. Stop conversion here.
            // this.getRequestObject[key] *= 1000;
          }
        } else {
          delete this.getRequestObject[key];
        }
      });
    },

    loadMoreInverter() {
      if(this.copyURL===this.nextURL)
      {
        return;
      }
      if (this.nextURL !== null) {
        this.copyURL=this.nextURL;
        this.busy = true;
        this.loadMoreInvertersHelper(this.nextURL);
      }
    },

    checkRequestStatusAndReloadInventory(requestObject) {
      if (Object.keys(requestObject).length === 0) {
        this.maintainScrollState();
        this.fetchInverters();
      } else {
        this.searchMasterInvertersHelper(requestObject);
      }
    },

    maintainScrollState() {
      if (this.isScrollStateToBeReset) {
        this.scrollState.reset();
        this.isScrollStateToBeReset = null;
      }
    },

    generateQueryAndMakeRequest(e) {
      // Make a function to convert the object into query
      this.getRequestObject.query = this.inverterMakeInput;
      this.getRequestObject.p_min = this.filters.p_min;
      this.getRequestObject.p_max = this.filters.p_max;

      if(!this.getRequestObject.query &&  !this.getRequestObject.p_min && !this.getRequestObject.p_max){  
        this.fetchOrganisationInverters();  
        this.clearQueryAndReloadInventory();
      }

      // Remove empty keys from getRequestObject
      this.removeEmptyKeysAndConvertKwToW();

      // Check if query object consist of non null arguements and make a call
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
      if(e)
      e.preventDefault();
    },
    setFocusOnInverterMakeInput(e) {
      // e -> true when it appears, and false otherwise
      if (e === true) {
        // Timeout is required, element takes time to render
        setTimeout(() => {
          document.getElementById("inverterMakeInputElement").focus();
        }, 100);
      }
    },
  },
};
</script>


<style scoped>


.infiniteScrollLoader {
  font-size: 20px;
}
.searchNotFound{
  font-size: 16px;
}
.empty-list {
  justify-content: center;
}
.not-valid{
  margin-top: -13px;
  font-size: 13px;
  color: red;
  margin-bottom: 13px;
}
.giveCursor{
  cursor: pointer;
}

.table_section.table_normal table td, .table_section.table_normal table th {
font-size: 15px;
}

.table_section.table_normal{
  margin-top: 1rem;
}

@media (max-width: 767px){
.table_section.table_normal table tbody tr td {
    width: 50% !important;
}
}
</style>
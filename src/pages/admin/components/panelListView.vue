<template>
  <div v-if="isActive" class="manage_details">
    <div class="header_details">
      <ul class="tag_list">
        <li
          :class="{ active: displayFavOrAllPanel === 'ALL' }"
          @click="setPanelToAll();
          fetchOrganisationPanels();"
        >
          <span class="fontChange">All Modules</span>
        </li>
        <li
          :class="{ active: displayFavOrAllPanel === 'FAV' }"
          @click="
            setPanelToFav();
            fetchOrganisationPanels();
          "
        >
          <span class="fontChange">Favorites</span>
        </li>
      </ul>
      <div v-if=" displayFavOrAllPanel === 'ALL'" class="search_group">
        <div class="addition_form">
          <div class="field_group">
            <input
              class="input_field"
              type="text"
              placeholder="Search Modules"
              v-model="panelMakeInput"
              @keyup="generateQueryAndMakeRequest"
            />
            <input
              class="input_field value_field"
              type="text"
              v-model="filters['p_min']"
              v-validate="'decimal|min_value:' + 0"
              name="min-filter"
              @keyup="generateQueryAndMakeRequest"
              placeholder="Min (W)"
            />
            <input
              class="input_field value_field"
              type="text"
              name="max-filter"
              v-validate="'decimal|min_value:' + filters['p_min']"
              v-model="filters['p_max']"
              @keyup="generateQueryAndMakeRequest"
              placeholder="Max (W)"
            />
          </div>
          <button
            class="btn btn-primary"
            @click="resetSearch()"
            data-toggle="modal"
            data-target="#make_panel"
          >
            Reset Search
          </button>
        </div>
        <div class="not-valid">{{ errors.first("min-filter") }}</div>
        <div class="not-valid">{{ errors.first("max-filter") }}</div>
      </div>
    </div>
    <div class="table_section table_normal" :style="{height: `${(window.height - 400)}px`}" >
      <table class="data_table">
        <thead>
          <tr>
            <th>
              <input class="checkbox" type="checkbox" style="visibility:hidden;" />
            </th>
            <th>
              <div class="data_head">
                <span class="title_text" >Manufacturer</span>
                <i :class="checkSorting('company_name')" @click="changeSorting('company_name')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Model</span>
                <i :class="checkSorting('model')" @click="changeSorting('model')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Size (W)</span>
                <i :class="checkSorting('pmpp')" @click="changeSorting('pmpp')"></i>
              </div>
            </th>
            <th>
              <div class="data_head">
                <span class="title_text">Type</span>
                <i :class="checkSorting('cell_type')" @click="changeSorting('cell_type')"></i>
              </div>
            </th>
            <!-- <th class="text-center">Action</th> -->
          </tr>
        </thead>
        <tbody v-if="displayFavOrAllPanel === 'ALL' && !(panelMakeInput || filters.p_min || filters.p_max)">
            <!-- <tr
            v-for="(item, index) in favPanelListToDisplay"
            :key="'A' + index"
            :value="item"
          >
            <td>
              <div class="md_head">Add Favorite</div>
              <div class="value_type">
                <i
                  @click="addOrDeletePanelFromOrg(item.id,item.panel.id,item)"
                  class="fa-star giveCursor" :class="[{fas: starYellowOrWhite(item.panel.id,item) === 'yellow'},{far: starYellowOrWhite(item.panel.id,item) === 'white'}]"
                ></i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{ item.panel.characteristics.manufacturer }}
              </div>
            </td>
            <td>
              <div class="md_head">Model</div>
              <div class="value_type">
                {{ item.panel.characteristics.model }}
              </div>
            </td>
            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">
                <span class="nowrap"
                  >{{ item.panel.characteristics.p_mp_ref }} W</span
                >
              </div>
            </td>
            <td>
              <div class="md_head">Type</div>
              <div class="value_type">
                <span class="nowrap">{{
                  item.panel.characteristics.cell_type
                }}</span>
              </div>
            </td>
          </tr> -->
        </tbody>
        <tbody>
             <tr class="empty-list" v-if="panelListToDisplay==0 && displayFavOrAllPanel === 'ALL'">
                       <td colspan="6">
                         <div class="create_list" >
                           <div class="info_content">
                              <p class="searchNotFound">
                                 Sorry, no result found.
                             </p>
                           </div>
                         </div>
                       </td>
                     </tr>
          </tbody>      
        <tbody v-if="displayFavOrAllPanel === 'ALL'">
         
          <tr
            v-for="(item, index) in panelListToDisplay"
            :key="index"
            :value="item"
          >
            <td>
              <div class="md_head">Add Favorite</div>
              <div class="value_type">
                <i
                   @click="addOrDeletePanelFromOrg(0,item.id,item)"
                   class="fa-star giveCursor" :class="[{fas: starYellowOrWhite(item.id,item) === 'yellow'},{far: starYellowOrWhite(item.id,item) === 'white'}]"
                ></i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{ item.characteristics.manufacturer }}
              </div>
            </td>
            <td>
              <div class="md_head">Model</div>
              <div class="value_type">{{ item.characteristics.model }}</div>
            </td>
            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">
                <span class="nowrap"
                  >{{ item.characteristics.p_mp_ref }} W</span
                >
              </div>
            </td>
            <td>
              <div class="md_head">Type</div>
              <div class="value_type">
                <span class="nowrap">{{ item.characteristics.cell_type }}</span>
              </div>
            </td>
            <!-- <td class="text-center action-delete">
              <i class="fas fa-pencil-alt"></i>
              <i class="far fa-copy"></i>
              <i
                class="far fa-trash-alt"
                data-toggle="modal"
                data-target="#delete_panel"
              ></i>
            </td> -->
          </tr>

          <!-- <div
            v-observe-visibility="handleScrollBottom"
            style="text-align: right"
          > -->
          <div
            v-infinite-scroll="loadMorePanels"
            infinite-scroll-disabled="busy"
            infinite-scroll-distance="10"
            style="text-align: center">

            <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
          </div>
        </tbody>

        <tbody v-if="displayFavOrAllPanel === 'FAV'">
          <tr
            v-for="(item, index) in favPanelListToDisplay"
            :key="index"
            :value="item"
          >
            <td>
              <div class="md_head ">Add Favorite</div>
              <div class="value_type">
                <!-- <i
                  @click="deletePanelFromOrganisation(item.id)"
                  class="fas fa-star"
                ></i> -->
                <i
                  @click="addOrDeletePanelFromOrg(item.id,item.panel.id,item)"
                  class="fa-star giveCursor" :class="[{fas: starYellowOrWhite(item.panel.id,item) === 'yellow'},{far: starYellowOrWhite(item.panel.id,item) === 'white'}]"
                ></i>
              </div>
            </td>
            <td>
              <div class="md_head">Manufacturer</div>
              <div class="value_type">
                {{ item.panel.characteristics.manufacturer }}
              </div>
            </td>
            <td>
              <div class="md_head">Model</div>
              <div class="value_type">
                {{ item.panel.characteristics.model }}
              </div>
            </td>
            <td>
              <div class="md_head">Size (W)</div>
              <div class="value_type">
                <span class="nowrap"
                  >{{ item.panel.characteristics.p_mp_ref }} W</span
                >
              </div>
            </td>
            <td>
              <div class="md_head">Type</div>
              <div class="value_type">
                <span class="nowrap">{{
                  item.panel.characteristics.cell_type
                }}</span>
              </div>
            </td>
            <!-- <td class="text-center action-delete">
              <i class="fas fa-pencil-alt"></i>
              <i class="far fa-copy"></i>
              <i
                class="far fa-trash-alt"
                data-toggle="modal"
                data-target="#delete_panel"
              ></i>
            </td> -->
          </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>



<script>
import Vue from "vue";
import { mapState, mapActions } from "pinia";
import { useOrgInventoryPanelsStore } from "../../../stores/organisation-inventory-panels";
import API from "@/services/api/";
import { ObserveVisibility } from "vue-observe-visibility";
import debounce from "debounce";


Vue.directive("observe-visibility", ObserveVisibility);
export default {
  props: {
    isActive: {
      type: Boolean,
      default: true,
    },

    areFavoritesRequired: {
      type: Boolean,
      default: true,
    },
    panel: {
      type: [Object, Array],
      default() {
        return this.isAdminPanel ? [] : {};
      },
    },

    moduleId: {
      type: Number,
      default: null,
    },

    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
    componentId: {
      type: String,
      default: "panel",
    },
    isAdminPanel: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      displayFavOrAllPanel: "ALL",
      panelListToDisplay: [],
      favPanelListToDisplay: [],
      busy: false,

      isScrollStateToBeReset: null,
      scrollState: "",
      msg: " I am in ModuleInventory",
      labelPosition: "left",
      panelList: [],
      selectedPanel: this.panel,
      panelSearch: "",
      addPanelDiv: false,
      styleSearchButton:
        "el-icon-search button-light-theme-icons searchButtonStyleAddition",
      styleDeleteButton:
        "el-icon-delete button-light-theme-icons deleteButtonStyleAddition",
      loading: true,
      paneldb: [],
      nextURL: null,
      prevURL: null,
      panelMakeInput: null,
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
      sortingObj:{
                "company_name":0,
                "model":0,
                "pmpp":0,
                "cell_type":0,
              },
      fieldName:'',            
    };
  },

  computed: {
    ...mapState(useOrgInventoryPanelsStore, ["GET_ORGANISATION_PANELS"]),
    doesSelectedPanelExist() {
      if (!this.areFavoritesRequired) {
        return true;
      }
      return !(
        Object.entries(this.selectedPanel).length === 0 &&
        this.selectedPanel.constructor === Object
      );
    },
    panelMakeInputElement() {
      return `panelMakeInputElement-${this.componentId}`;
    },

    panelInventory() {
      return this.GET_ORGANISATION_PANELS;
    },
  },

  watch: {
    panelMakeInput(){
          this.generateQueryAndMakeRequest();
    },
    filters:{
          handler(val){
            this.generateQueryAndMakeRequest();
          },
          deep:true,
    },
    moduleId() {
      this.fetchSelectedModuleId();
    },
    panel: {
      deep: true,
      handler(value) {
        this.selectedPanel = JSON.parse(JSON.stringify(value));
      },
    },
  },

  created() {
    this.generateQueryAndMakeRequest = debounce(this.generateQueryAndMakeRequest,1000);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResize);
  },

  async mounted() {
    await this.FETCH_ORGANISATION_PANELS();
    this.fetchPanels();
    //    await this.loadMorePanels();
  },

  methods: {
    ...mapActions(useOrgInventoryPanelsStore, [
      "FETCH_ORGANISATION_PANELS",
      "ADD_ORGANISATION_PANEL",
      "DELETE_ORGANISATION_PANEL",
    ]),

    handleResize() {
      this.window.width = window.innerWidth;
      this.window.height = window.innerHeight;
    },

    resetSearch(){
        this.panelMakeInput=null;
        this.filters.p_min=null;
        this.filters.p_max=null;
        let fieldNameArray = Object.keys(this.sortingObj);
        for(let i=0;i<fieldNameArray.length;i++){
            this.sortingObj[fieldNameArray[i]]=0;
        }
        this.fetchOrganisationPanels();
        this.fetchPanels();
    }, 

    checkSorting(fieldName){
        if(this.displayFavOrAllPanel==='FAV')
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
      if(!this.panelMakeInput && !this.filters['p_min'] && !this.filters['p_max'])
      this.fetchPanels(fieldName);
      else{
        this.generateQueryAndMakeRequest();
      }
    },


    setPanelToAll() {
      this.displayFavOrAllPanel = "ALL";
    },

    setPanelToFav() {
      this.displayFavOrAllPanel = "FAV";
    },

    handleScrollBottom(isVisible) {
      if (!isVisible) {
        return;
      }
      this.loadMorePanels();
    },
    
    starYellowOrWhite(id,item){
      // console.log("inside yellow or white",item);
      let doesPanelExist = false;
      for (let i = 0; i < this.panelInventory.length; i++) {
        if (id === this.panelInventory[i].panel.id) {
          doesPanelExist = true;
          break;
        }
      }
      if(doesPanelExist){
        return "yellow";
      }
      else{
        return "white";
      }
    },

    addPanelToOrganisation(selectedPanelId) {
      let doesPanelExist = false;
      for (let i = 0; i < this.panelInventory.length; i++) {
        if (selectedPanelId === this.panelInventory[i].panel.id) {
          doesPanelExist = true;
          break;
        }
      }

      if (doesPanelExist === false) {
        console.log("inner Id of Module going to be fav",selectedPanelId);
        const postData = {
          panel: selectedPanelId,
        };
        this.ADD_ORGANISATION_PANEL({ payload: postData });
        this.$message({
          showClose: true,
          message: "Module added to the inventory.",
          type: "success",
          center: true
        });
      } else {
        this.$message({
          showClose: true,
          message: "Module already exist in the inventory.",
          type: "error",
          center: true
        });
      }
      // this.addPanelDiv = false;
      // this.selectedPanel = {};
    },

    deletePanelFromOrganisation(outerId, innerId) {
      // const row_to_be_deleted = this.panelInventory[index].id;
      console.log("outer id of panel going to be deleted",outerId);
      outerId = this.innerIdToOuterIdMap[innerId];
      this.DELETE_ORGANISATION_PANEL({ payload: outerId });

      this.$message({
        showClose: true,
        message: "Panel successfully removed from favourites.",
        type: "success",
        center: true
      });
    },

    addOrDeletePanelFromOrg(outerId, innerId,item){
      console.log("outer id->",outerId,"inner id->",innerId);
      // check whether it is already present or not in organisation
      console.log("addordeletePanel",item);
       let doesPanelExist = false;
      for (let i = 0; i < this.panelInventory.length; i++) {
        if (innerId === this.panelInventory[i].panel.id) {
          doesPanelExist = true;
          break;
        }
      }
      if(doesPanelExist ===true){   // it means its already fav so need to delete it
      for(let i=0;i<this.panelInventory.length;i++){
           let item = this.panelInventory[i];
           this.innerIdToOuterIdMap[`${item.panel.id}`] = item.id;
        }
        this.deletePanelFromOrganisation(outerId,innerId);
      } 
      else{
        for(let i=0;i<this.panelInventory.length;i++){
           let item = this.panelInventory[i];
           this.innerIdToOuterIdMap[`${item.panel.id}`] = item.id;
        }
        this.addPanelToOrganisation(innerId);
      }
    },

    async fetchSelectedModuleId() {
      try {
        const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(
          this.moduleId
        );
        this.selectedPanel = response.data;
        this.$emit("update:panel", this.selectedPanel);
        this.addSelectedPanelToPanelList();
      } catch (e) {
        console.log(
          "fetchSelectedModuleId: Error in fetching selected Module",
          e
        );
      }
    },
    async fetchOrganisationPanels() {
      try {
        const orgInventoryResponseObject = this.GET_ORGANISATION_PANELS;

        console.log("favPanelsInitial", orgInventoryResponseObject);
        const orgPanels = [];

        orgInventoryResponseObject.forEach((item) => {
          orgPanels.push(item.panel);
        });

        this.favPanelListToDisplay = orgInventoryResponseObject;

        for(let i=0;i<this.favPanelListToDisplay.length;i++){
           let item = this.favPanelListToDisplay[i];
           this.innerIdToOuterIdMap[`${item.panel.id}`] = item.id;
        }
        this.favoritesPanels = {
          label: "Favorites",
          options: orgPanels,
        };
        this.panelList.push(this.favoritesPanels);
      } catch (e) {
        console.error();
      }
    },

    async fetchMasterDataPanels(fieldName) {
      console.log("inside fetch master Modules");
      try {
        this.loading = true;
        let response = await (this.isAdminPanel
          ? API.MASTER_DATA_PANEL.FETCH_ALL_MASTER_PANELS()
          : API.MASTER_DATA_PANEL.FETCH_MASTER_PANELS());

        console.log("field name inside fetch master data panels is",fieldName);
        
        if( fieldName && (this.sortingObj[fieldName]===1 || this.sortingObj[fieldName]===2)){
          // when sortingObj[fieldName]===1 then it is ascending for that field
          // when sortingObj[fieldName]===2 then it is descending for that field
          response = await API.MASTER_DATA_PANEL.FETCH_ALL_MASTER_PANELS_BY_SORT(fieldName,this.sortingObj[fieldName]);
        }    
        this.setMasterDataPanels(response.data.results);

        console.log("allMasterPanels", response.data);
        console.log(response.data.next);
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        await this.loadMorePanels();
        this.loading = false;
      } catch (e) {
        console.error();
      }
    },

    async addSelectedPanelToPanelList() {
      try {
        const vm = this;
        let isSelectedPanel = false;

        // check if this panel is in the favorites or starting list of panel list in selected menu
        this.panelList.forEach((arrayItem) => {
          arrayItem.options.forEach((panel) => {
            if (panel.id === vm.selectedPanel.id) {
              isSelectedPanel = true;
            }
          });
        });

        // if panel is not there add a new group to panelList and push it to the start of list
        if (!isSelectedPanel) {
          this.panelList.forEach((arrayItem) => {
            if (arrayItem.label === "Inventory") {
              arrayItem.options.push(this.selectedPanel);
            }
          });
        }
      } catch (e) {
        console.error();
      }
    },
    async searchMasterPanelsHelper(query) {
      try {
        this.loading = true;
        const response = await API.MASTER_DATA_PANEL.SEARCH_MASTER_PANELS(
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
        //   }, 2000);
        // }
        this.panelList = [];
        // this.favPanelListToDisplay=[];
        this.setMasterDataPanels(response.data.results);
        this.maintainScrollState();
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        this.loading = false;
        this.loadMorePanels();
      } catch (e) {
        console.error(e);
      }
    },
    

    async loadMorePanelsHelper(url) {
      try {
        console.log("inside helper", url);
        const response = await API.MASTER_DATA_PANEL.LOAD_MORE_PANELS(url);
        const panelsToBeAppended = response.data.results;
        this.busy = false;
        for (let i = 0; i < panelsToBeAppended.length; i++) {
          this.panelListToDisplay.push(panelsToBeAppended[i]);
        }
        this.nextURL = response.data.next;
        this.prevURL = response.data.previous;
        //   Appending it to inventory group
        this.panelList.forEach((currentGroup) => {
          if (currentGroup.label === "Inventory") {
            panelsToBeAppended.forEach((panel) => {
              currentGroup.options.push(panel);
            });
          }
        });

        // $state.loaded();
      } catch (e) {
        // $state.error();
        console.error();
      }
    },
    // async fetchFavPanels(){
    //   await this.fetchOrganisationPanels();
    // },

    async fetchPanels(fieldName) {
      this.panelList = [];
      // fetching organisation panels
      if (this.areFavoritesRequired)
      await this.fetchOrganisationPanels();

      // Calling after favorites are added to the list
      await this.fetchMasterDataPanels(fieldName);

      if (this.areFavoritesRequired) {
        // this.fetchSelectedModuleId();
      }
    },
    setMasterDataPanels(allInventoryPanels) {
      const currentGroup = {
        label: "Inventory",
        options: allInventoryPanels,
      };

      console.log("inside set master panels");
      this.panelListToDisplay = [];

      for (let i = 0; i < allInventoryPanels.length; i++) {
        this.panelListToDisplay.push(allInventoryPanels[i]);
      }
      this.panelList.push(currentGroup);
    },

    async loadMorePanels() {
      console.log("inside load more panels");
      console.log(this.nextURL);
      if (this.nextURL !== null) {
        this.busy = true;
        await this.loadMorePanelsHelper(this.nextURL);
      }
    },

    removeEmptyKeys() {
      Object.keys(this.getRequestObject).forEach((key) => {
        if (this.getRequestObject[key] === null) {
          delete this.getRequestObject[key];
        }
      });
    },

    maintainScrollState() {
      if (this.isScrollStateToBeReset) {
        this.scrollState.reset();
        this.isScrollStateToBeReset = null;
      }
    },
    checkRequestStatusAndReloadInventory(requestObject) {
      if (Object.keys(requestObject).length === 0) {
        this.maintainScrollState();
        this.fetchPanels();
      } else {
        this.searchMasterPanelsHelper(requestObject);
      }
    },

    async clearQueryAndReloadInventory() {
      // Reset size filter
      this.filters.p_min = null;
      this.filters.p_max = null;
      Object.assign(this.getRequestObject, this.filters);

      // Reset Make query
      this.panelMakeInput = null;
      this.getRequestObject.query = null;

      await this.removeEmptyKeys();

      // Reload Inventory
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
    },

    generateQueryAndMakeRequest(e) {
      // Make a function to convert the object into query
      this.getRequestObject.query = this.panelMakeInput;
      this.getRequestObject.p_min = this.filters.p_min;
      this.getRequestObject.p_max = this.filters.p_max;

      // if(this.getRequestObject.query==='' &&  this.getRequestObject.p_min==='' && this.getRequestObject.p_max ===''){
      //   this.fetchOrganisationPanels();
      //   this.fetchPanels();
      // }

      if(!this.getRequestObject.query &&  !this.getRequestObject.p_min && !this.getRequestObject.p_max){
        this.fetchOrganisationPanels();
        this.fetchPanels();
      }
      
      // Remove empty keys from getRequestObject
      this.removeEmptyKeys();

      // Check if query object consist of non null arguements and make a call
      this.checkRequestStatusAndReloadInventory(this.getRequestObject);
      if(e)
      e.preventDefault();
    },

    setFocusOnPanelMakeInput(e) {
      // e -> true when it appears, and false otherwise
      if (e === true) {
        // Timeout is required, element takes time to render
        setTimeout(() => {
          document.getElementById(this.panelMakeInputElement).focus();
        }, 100);
      }
    },
  },
};
</script>


<style scoped>
/* @import url(../styles/styles.css); */
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
  
  .table_section.table_normal table tbody tr td:first-child {
    width: 100% !important;
  }
}
</style>
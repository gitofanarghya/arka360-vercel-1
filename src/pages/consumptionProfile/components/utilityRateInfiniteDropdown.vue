<template>
    <div
        id="panelInfiniteScroll"
        style="width: 100%;">
       
        <el-select
            :remote-method="generateQueryAndMakeRequest"
            filterable
            remote
            clearable
            :id="componentId"
            v-model="selectedUtilityRateObj"
            :disabled="!Boolean(lseId)"
            :class="theme==='darkDropdownWithFilters' ? 'sappane-select' : ''"
            :popper-class="theme"
            :loading="loading"
            placeholder="Select Utility Rate"
            value-key="id"
            style="width: 100%;"
            no-data-text="No utility rates with searched query! Resetting... "
            @clear="fetchFinalUtilityRateByLSEID()"
            @visible-change="setFocusOnPanelMakeInput"
            @change="$emit('update:panel', JSON.parse(JSON.stringify(selectedUtilityRate)));
            $emit('event-to-save-panel-obj',selectedUtilityRate);"
            >
            <!-- <form
                class="formStyle"
                :submit="generateQueryAndMakeRequest"
                action="#">
                <div class="SearchBarWrapper">
                    <div class="SearchBarColumn" style="width: 87%;">
                        <input
                            :id="panelMakeInputElement"
                            v-model="utilityRateMakeInput"
                            type="text"
                            placeholder="Search Utility Rates"
                            class="SearchField"
                            style="border-radius:4px 0px 0px 4px;"
                            autocomplete="off">
                    </div>
                    <div
                        class="SearchBarColumn" style="width: 13%;">
                        <button
                            class="SearchButton"
                            style="border-radius: 0px 4px 4px 0px;"
                            :class="styleSearchButton"
                            type="submit"
                            @click="generateQueryAndMakeRequest"/>
                    </div>
                </div>
            </form> -->
            <el-option
            v-for="(item,index) in utilityRateArrayOptions"
            :key="index"
            :label="item.tariffCode ?  (item.tariffCode + ' '+ item.tariffName) : item.utility_rate"
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
                @infinite="fetchMoreUtilityRateByLSEID"
            >
                <div
                    slot="no-more"
                    style="color: #606266; font-size: 12px">
                    No more utility rates!!
                </div>
                <div
                    slot="no-results"
                    style="color: #606266; font-size: 12px">
                    No more utility rates!!
                </div>

                <div
                    slot="error"
                    style="color: #606266; font-size: 12px">
                    Error in fetching utility rates, retry!!
                </div>
            </infinite-loading>
        </el-select>
    </div>
</template>

<script>
import API from '@/services/api/';
import { mapState } from 'pinia';
import { useOrgInventoryPanelsStore } from '../../../stores/organisation-inventory-panels';

export default {
    name: 'PanelScroll',
    props: {
        lseId:{
             type:String,
             default:'',
        },
        projectId:null,
        // areFavoritesRequired: {
        //     type: Boolean,
        //     default: true,
        // },
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
            default: 'lightDrowpdownWithFilters',
        },
        componentId: {
            type: String,
            default: 'panel',
        },
        isAdminPanel: {
            type: Boolean,
            default: false,
        },
        selectedUtilityRateIdx:{
            type: String,
            default:null,
        },
        source:{
            type: String || Number,
            default : null
        },
        preOrPostSolar:{
            type: String,
            default: 'preSolar'
        },
        isManageTariffOptionsHidden:{
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            isScrollStateToBeReset: null,
            scrollState: '',
            msg: ' I am in panelInventory',
            labelPosition: 'left',
            panelList: [],
            selectedPanel: this.panel,
            panelSearch: '',
            addPanelDiv: false,
            styleSearchButton: 'el-icon-search button-light-theme-icons searchButtonStyleAddition',
            styleDeleteButton: 'el-icon-delete button-light-theme-icons deleteButtonStyleAddition',
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


            utilityRateArray:[],
            utilityRateArrayOptions:[],
            selectedUtilityRate:null,
            selectedUtilityRateIndex:null,
            selectedUtilityRateObj:{},
            utilityRateMakeInput:null,
        };
    },
    computed: {
        ...mapState(useOrgInventoryPanelsStore, [
            'GET_ORGANISATION_PANELS',
        ]),
        // doesSelectedPanelExist() {
        //     if (!this.areFavoritesRequired) {
        //         return true;
        //     }
        //     return !(Object.entries(this.selectedPanel).length === 0
        //         && this.selectedPanel.constructor === Object);
        // },
        panelMakeInputElement() {
            return `panelMakeInputElement-${this.componentId}`;
        },
    },
    watch: {
        moduleId() {
            this.fetchSelectedModuleId();
        },
        panel: {
            deep: true,
            handler(value) {
                this.selectedPanel = JSON.parse(JSON.stringify(value));
            },
        },
        lseId:{
            handler(val){
                
                this.utilityRateArrayOptions=[];
                this.fetchUtilityRateByLSEID();
                console.log("lseId is being watched and its value is",this.lseId,"and project id is",this.projectId);
            }
        },
        selectedUtilityRate:{
            handler(val){
                console.log("selected utility rate Obj is",val,this.selectedUtilityRate);
            }
        },
        selectedUtilityRateObj:{
            handler(val){
                if(this.utilityRateArrayOptions.length){
                // this.selectedUtilityRateObj = JSON.parse(JSON.stringify(this.utilityRateArrayOptions[val]));
                    // console.log("selectedUtilityRateIndex*************",val)
                    // this.selectedUtilityRateObj = JSON.parse(JSON.stringify(val));
                    if(this.source=='genability')
                        this.updateTarrifDetails(this.selectedUtilityRateObj);
                    else if(this.source=='default'){
                        this.getTariffDeatils(this.selectedUtilityRateObj);
                    }

                }
            }
        },
    },
    mounted() {
        this.fetchUtilityRateByLSEID();
    },
    methods: {
        async fetchSelectedModuleId() {
            try {
                const response = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID_OLDTRUE_REMOVED(this.moduleId);
                this.selectedPanel = response.data;
                this.$emit('update:panel', this.selectedPanel);
                this.addSelectedPanelToPanelList();
            }
            catch (e) {
                console.log('fetchSelectedModuleId: Error in fetching selected panel', e);
            }
        },
        async fetchOrganisationPanels() {
            try {
                const orgInventoryResponseObject = this.GET_ORGANISATION_PANELS;
                const orgPanels = [];
                orgInventoryResponseObject.forEach((item) => {
                    orgPanels.push(item.panel);
                });

                this.favoritesPanels = {
                    label: 'Favorites',
                    options: orgPanels,
                };
                this.panelList.push(this.favoritesPanels);
            }
            catch (e) {
                console.error();
            }
        },

        async fetchFinalUtilityRateByLSEID() {
            try {
                this.loading = true;
                const response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_UTILITY_RATE_BY_LSEID(this.projectId,this.lseId,this.source);
                console.log("to check actual incoming master data panels",response);
                this.utilityRateArrayOptions=[];
                this.setUtilityRates(response.data.results);
                this.nextURL = response.data.next;
                this.loading = false;
            }
            catch (e) {
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
                        if (arrayItem.label === 'Inventory') {
                            arrayItem.options.push(this.selectedPanel);
                        }
                    });
                }
            }
            catch (e) {
                console.error();
            }
        },
        async searchUtilityRatesHelper(requestObj) {
            try {
                this.loading = true;
                const response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_UTILITY_RATE_BY_SEARCH(
                      this.projectId,
                      this.lseId,
                      requestObj.query,
                      this.source
                  );
                // resetting filters and request object in case of no results
                if (response.data.results.length === 0) {
                    // Clear Query and reload Inventory
                    setTimeout(() => {
                        this.clearQueryAndReloadInventory();
                        return null;
                    }, 2000);
                }
                this.utilityRateArrayOptions=[];
                this.panelList = [];
                this.setUtilityRates(response.data.results);
                this.maintainScrollState();
                this.nextURL = response.data.next;
                this.loading = false;
            }
            catch (e) {
                console.error(e);
            }
        },
        async fetchMoreUtilityRateByLSEIDHelper(url, $state) {
            try {
                
                const response = await API.PROJECT_CONSUMPTION_DETAILS.FETCH_MORE_UTILITY_RATE_BY_LSEID(url);
                this.utilityRateArray =[];
                this.utilityRateArray = [...response.data.results];
                for(let k=0;k<this.utilityRateArray.length;k++){
                    // pushing id here because in case of masterTariffId, we dont have id as a key and in the el-select we need to 
                    // give a key id for value-key whenever value is the object
                    if(this.utilityRateArray[k].masterTariffId){
                        this.utilityRateArray[k]['id'] = this.utilityRateArray[k].masterTariffId;
                    }
                    this.utilityRateArrayOptions.push(this.utilityRateArray[k]);
                }
                this.nextURL = response.data.next;
                $state.loaded();
            }
            catch (e) {
                $state.error();
                console.error();
            }
        },
        async fetchUtilityRateByLSEID() {
            // this.selectedUtilityRateIndex = this.selectedUtilityRateIdx;
            this.selectedUtilityRateObj = this.selectedUtilityRateIdx;

            this.panelList = [];
            await this.fetchFinalUtilityRateByLSEID();
        },
        setUtilityRates(results) {
            // let emptyObj = {tariffCode:"", tariffName:"",name:""};
            // this.utilityRateArrayOptions.push(emptyObj);
            this.utilityRateArray =[];
            this.utilityRateArray = [...results];
            for(let j=0;j<this.utilityRateArray.length;j++){
                // pushing id here because in case of masterTariffId, we dont have id as a key and in the el-select we need to 
                // give a key id for value-key whenever value is the object
                if(this.utilityRateArray[j].masterTariffId){
                    this.utilityRateArray[j]['id'] = this.utilityRateArray[j].masterTariffId;
                }
                this.utilityRateArrayOptions.push(this.utilityRateArray[j]);
            }
        },
        fetchMoreUtilityRateByLSEID($state) {
            this.scrollState = $state;
            if (this.nextURL !== null) {
                this.fetchMoreUtilityRateByLSEIDHelper(this.nextURL, $state);
            }
            else {
                $state.complete();
                this.isScrollStateToBeReset = true;
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
                this.fetchUtilityRateByLSEID();
            }
            else { 
                this.searchUtilityRatesHelper(requestObject);
            }
        },
        async clearQueryAndReloadInventory() {
           
            this.panelMakeInput = '';
            this.utilityRateMakeInput='';
            this.getRequestObject.query = '';
            // Reload Inventory
            this.checkRequestStatusAndReloadInventory(this.getRequestObject);
        },
        generateQueryAndMakeRequest(query) {
            // Make a function to convert the object into query
            // this.getRequestObject.query = this.panelMakeInput;
            this.utilityRateMakeInput = query;
            this.getRequestObject.query = this.utilityRateMakeInput;
            this.checkRequestStatusAndReloadInventory(this.getRequestObject);
            // e.preventDefault();
        },
        setFocusOnPanelMakeInput(e) {
            if (e === true) {
                setTimeout(() => {
                    document.getElementById(this.panelMakeInputElement).focus();
                }, 100);
            }
        },
        async updateTarrifDetails(selectedObj){
            const patchData ={
                "genability_tariff_id": selectedObj.tariffId,
                "genability_master_tariff_id": selectedObj.masterTariffId,
                "genability_tariff_effective_date": selectedObj.effectiveDate,
            }
            try{
                this.$emit("selected-utility-rate-name",`${selectedObj.tariffCode} ${selectedObj.tariffName}`,this.preOrPostSolar,selectedObj.masterTariffId);
                await API.PROJECT_CONSUMPTION_DETAILS.UPDATE_TARRIF_DETAILS(this.projectId,patchData);
            }
            catch{

            }
        },
        getTariffDeatils(selectedObj){
            this.$emit("fetch-tariff-info",selectedObj,this.preOrPostSolar);
        },
        redirectToCustomTariff(){
            this.$router.push({ name: "customTariff" });
        },
        // clearUtilityRate(){
        //     this.fetchUtilityRateByLSEID();
        // }
    },
};
</script>

<style lang="scss">
// These are global css needs to available across the app
//  classes which are appended to body can't be made scoped
    @import '../../../styles/components/notification';
    @import '../../../styles/components/switch';
    @import '../../../styles/components/select';
    @import '../../../styles/components/radio';
    @import '../../../styles/components/dialog';
    @import '../../../styles/components/utils';
</style>
<style scoped>
    /* duplicate keys and min-width part pending */
    /* to-do: check if all the parts in these classes are actually needed and bring the button and
    error class here from styles folder */

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
        font-size: 18px;
        font-weight: 600;
        text-decoration: underline;
        color: #1c3366;
        cursor: pointer;
    }

    .filter-div-light {
        background-color: white;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 40px;
        z-index: 10;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 0 0 7px 0;
    }
    .filter-input-light {
        width: 27%;
        height: 25px;
        margin: 0px 6px;
        border-radius: 3px;
        border: 1px solid #909090;
        padding: 0 3px;
        font-size: 10px;
        color: #222;
    }
    .not-valid {
        font-size: 10.5px;
        color: red;
        position: absolute;
        right: 20px;
        top: 34px;
    }
    .inventoryInformationDropdownStyling {
        overflow-x: hidden;
        padding: 0 10px 0 0;
        text-overflow: ellipsis!important;
    }

    .panelSummaryPopoverLight {
        background-color: #fff;
        border: 1px solid #f8f8f8 !important;
    }

    .panelSummaryPopoverDark {
        background-color: #363636 !important;
        border: 1px solid #363636 !important;
    }

    .panelSummaryKeyDark, .panelSummaryValueDark {
        text-align: left;
        font-size: .8vw;
        text-overflow: ellipsis!important;
        padding-bottom: 2%;
        font-family: Helvetica Neue,sans-serif;
    }

    .panelSummaryValueDark {
        color: #eaeaea;
        -webkit-box-sizing: content-box;
        box-sizing: content-box;
        display: inline-block;
        max-width: 150px;
        min-width: 100px;
        overflow-x: hidden;
        white-space: nowrap;
        -webkit-box-flex: 1;
        -ms-flex-positive: 1;
        flex-grow: 1;
    }
    
    .panelSummaryKeyDark {
        color: #d1d1d1;
        font-weight: 400;
        text-decoration: none;
        overflow: hidden;
        width: 80px;
    }

    .displayFlex {
        display: flex;
        justify-content: flex-start;
    }

    .panelSummaryKeyLight, .panelSummaryValueLight {
        text-align: left;
        font-size: .8vw;
        text-overflow: ellipsis!important;
        padding-bottom: 2%;
        font-family: Helvetica Neue,sans-serif;
    }

    .panelSummaryKeyLight {
        color: #1b1b1b;
        font-weight: 400;
        text-decoration: none;
        overflow: hidden;
        width: 80px;
    }

    .panelSummaryValueLight {
        color: #606266;
        box-sizing: content-box;
        display: inline-block;
        max-width: 150px;
        min-width: 100px;
        overflow-x: hidden;
        white-space: nowrap;
        flex-grow: 1;
    }

    .ulContainer {
        height: auto !important;
        white-space: inherit !important;
        line-height: 1.5 !important;
        padding: 10px 20px !important;
        max-width: 450px !important;
    }


    @media screen and (max-width: 1200px) {
        .ulContainer {
        height: auto !important;
        white-space: inherit !important;
        line-height: 1.5 !important;
        padding: 10px 20px !important;
        max-width: 350px !important;
    }
    }
    

</style>

<style lang="scss" scoped>
    @import '../../../styles/components/button';
</style>


<style lang="scss">

</style>

<style type="text/css">


.formStyle{
   padding: 10px 20px;
    background-color: #fff;
    position: absolute;
    top: 0px;
    left: 0;
    width: 100%;
    height: 3rem;
    z-index: 10;
    display: -webkit-box;
}

.SearchBarWrapper {
    position: relative;
    background-color: rgb(255, 255, 255);
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
     background-color: #fff;
     align-items: center;
     justify-content: space-between;
}


.SearchBarColumn {
     display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-around;
    margin: 0px;
}

.SearchFieldTitle {
    color: #7f7f7f;
    font-size: 12px;
}

.SearchField {
    width: 100%;
    margin:0px;
    height:35px;
    font-size: 11px;
    border-radius:0px;
    padding-left: 8px;
    border: 1px solid #909090;
    color: #222;
}

.SearchButton {
    padding: 5px;
    width: 100%;
    height: 35px;
}

.displayFlex {
    display: flex;
    justify-content: flex-start;
}

.panelSummaryKeyDark {
    color: #d1d1d1;
    text-align: left;
    font-size: 0.8vw;
    font-weight: 400;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis !important;
    padding-bottom: 2%;
    font-family: Helvetica Neue, sans-serif;
    width: 80px;
    word-break: break-word;

}

.panelSummaryValueDark {
    font-size: 0.8vw;
    padding-bottom: 2%;
    color: #eaeaea;
    box-sizing: content-box;
    display: inline-block;
    max-width: 150px;
    min-width: 100px;
    overflow-x: hidden;
    font-family: Helvetica Neue, sans-serif;
    white-space: normal;
    word-break: break-word;
    text-overflow: ellipsis !important;
    flex-grow: 1;
    text-align:left;
}

.panelSummaryKeyLight {
    color: #1b1b1b;
    text-align: left;
    font-size: 0.8vw;
    font-weight: 400;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis !important;
    padding-bottom: 2%;
    font-family: Helvetica Neue, sans-serif;
    width: 80px;
    word-break: break-word;
}

.panelSummaryValueLight {
    /* later check redundant properties and why is the same class kept at two places */
    font-size: 0.8vw;
    padding-bottom: 2%;
    color: #606266;
    box-sizing: content-box;
    display: inline-block;
    max-width: 150px;
    min-width: 100px;
    overflow-x: hidden;
    font-family: Helvetica Neue, sans-serif;
    white-space: normal;
    /* text-overflow: ellipsis !important; */
    flex-grow: 1;
    text-align:left;
    word-break: break-word;
}

</style>
    
<style type="text/css">
.panelSummaryPopoverDark {

  background-color: #363636 !important;
  border: 1px solid #363636 !important;

}

.panelSummaryPopoverDark .popper__arrow {
  border-top-color: #363636 !important;
  border-right-color: transparent !important;
  bottom: -7px !important;
}

.panelSummaryPopoverLight {

  background-color: white;
  border: 1px solid rgb(248, 248, 248);

}

.panelSummaryPopoverLight .popper__arrow {
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  bottom: -7px !important;
}

.inventoryInformationDropdownStyling {
  overflow-x:hidden; 
  padding: 0 10px 0 0; 
  text-overflow: ellipsis !important;
}

.darkDropdownWithFilters .el-select-dropdown__wrap {
    max-height: 220px;
    width: 102%;
}

.darkDropdownWithFilters .el-select-dropdown__wrap::-webkit-scrollbar {
    width: 0.5rem;
    background-color: transparent;
}

.darkDropdownWithFilters .el-select-dropdown__wrap::-webkit-scrollbar-thumb {
    background-color: transparent;
}
</style>

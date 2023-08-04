<template>
    <div
        id="inverterInfiniteScroll"
        style="width: 100%;">
        <el-select
            id="inverter"
            v-model="selectedInverter"
            :popper-class="theme"
            :class="theme==='darkDropdownWithFilters' ? 'sappane-select' : ''" 
            :loading="loading"
            :multiple="isAdminPanel"
            placeholder="Select Inverter"
            value-key="id"
            style="width:100%; bottom:0px"
            no-data-text="No inverters with searched query! Resetting... "
            @visible-change="setFocusOnInverterMakeInput"
            @change="$emit('update:inverter', JSON.parse(JSON.stringify(selectedInverter)));
             $emit('event-to-save-inverter-obj',selectedInverter,currentIndex);"
        >
            <div id="new div" class="dropdownWrapper">
               <form
                :submit="generateQueryAndMakeRequest"
                action="#">
                <div class="SearchBarWrapper">
                    <div class="SearchBarColumn SearchMakeWrapper">
                        <span class="SearchFieldTitle">Make</span>
                        <input
                            id="inverterMakeInputElement"
                            v-model="inverterMakeInput"
                            placeholder="Search Inverter"
                            class="SearchField"
                            style="border-radius:4px 0px 0px 4px;"
                            autocomplete="off">
                    </div>
                    <div class="SearchBarColumn SearchSizeWrapper">
                        <span class="SearchFieldTitle">Size</span>
                        <input
                            style="border-left: none;"
                            v-validate="'decimal|min_value:' + 0"
                            v-model="filters['p_min']"
                            name="min-filter"
                            placeholder="Min(kW)"
                            class="SearchField"
                            autocomplete="off">
                        <div class="not-valid">{{ errors.first('min-filter') }}</div>
                        <!-- <span>-</span>
                        <input
                            v-validate="'decimal|min_value:' + filters['p_min']"
                            v-model="filters['p_max']"
                            name="max-filter"
                            placeholder="Max(kW)"
                            class="filter-input-light"
                            autocomplete="off">
                        <div class="not-valid">{{ errors.first('max-filter') }}</div> -->
                    </div>
                    <div class="SearchBarColumn  SearchButtonWrapper">
                        <div class="SearchFieldTitle" style="height: 12px;"></div>
                        <button
                            class="SearchButton"
                            style="border-radius: 0px 4px 4px 0px;"
                            :class="styleSearchButton"
                            type="submit"
                            @click="generateQueryAndMakeRequest"/>
                        <!-- <button
                            :class="styleDeleteButton"
                            type="button"
                            style="font-size: 15px; padding: 5px"
                            @click="clearQueryAndReloadInventory"/> -->
                    </div>
                </div>
            </form>
            <el-option-group
                v-for="(group, index) in inverterList"
                :key="index"
                :label="group.label"
            >
                <el-option
                    v-for="(item, index) in group.options"
                    :key="index"
                    :label="item.Manufacturer + ' ' +item.Make"
                    :value="item"
                    style="height: auto"
                >
                    <div style="" class="option-wrapper">
                            <div style="" 
                                class="inventoryInformationDropdownStyling name">{{ item.Manufacturer + ' ' + item.Make }}</div>
                            <div style="" class="inventoryInformationDropdownStyling model">
                                <div
                                    v-if="item.Size === null">
                                    {{ item.max_ac_power_W / 1000 }} kW
                                </div>

                                <div v-else>{{ item.Size }} kW</div>
                            </div>   
                            <span style="text-align:end; font-size: 13px" class="tooltip">
                                <el-popover
                                :close-delay="1"
                                :visible-arrow="false"
                                :popper-class="theme==='darkDropdownWithFilters' ? 'inverterSummaryPopoverDark' : 'inverterSummaryPopoverLight'"
                                placement="top-end"
                                trigger="hover">
                                <div
                                    style="padding: 10px;">
                                    <!-- have a single variable for this -->

                                    <div class="displayFlex">
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryKeyDark' : 'inverterSummaryKeyLight'"> No. of MPPT </div>                                  
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryValueDark' : 'inverterSummaryValueLight'"> {{ item.Number_of_MPPT }} </div> 
                                    </div>

                                    <div class="displayFlex">
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryKeyDark' : 'inverterSummaryKeyLight'"> MPPT Voltage High </div>   
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryValueDark' : 'inverterSummaryValueLight'"> {{item.MPPT_High_V}} </div> 
                                    </div>

                                    <div class="displayFlex">
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryKeyDark' : 'inverterSummaryKeyLight'"> MPPT Voltage Low </div> 
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryValueDark' : 'inverterSummaryValueLight'"> {{item.MPPT_Low_V}} </div> 
                                    </div>

                                    <div class="displayFlex">
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryKeyDark' : 'inverterSummaryKeyLight'"> Input per MPPT </div> 
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryValueDark' : 'inverterSummaryValueLight'"> {{item.Number_of_Strings}} </div> 
                                    </div>

                                    <div class="displayFlex">
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryKeyDark' : 'inverterSummaryKeyLight'"> Type </div>  
                                        <div :class="theme==='darkDropdownWithFilters' ? 'inverterSummaryValueDark' : 'inverterSummaryValueLight'"> String Inverter </div> 
                                    </div>
                                </div>
                                <i
                                    slot="reference"
                                    class="el-icon-info"/>
                                </el-popover>
                            </span>                        
                        <!-- </div> -->
                        <!-- <span style="padding: 0 20px 0 0">{{ item.Manufacturer + ' ' + item.Make }}</span>
                        <span style="float: right;">{{ item.Size === null ? item.max_ac_power_W / 1000 : item.Size }} kW</span> -->
                    </div>
                </el-option>
            </el-option-group>
            <infinite-loading
                :distance="0"
                spinner="bubbles"
                @infinite="loadMoreInverter"
            >
                <div
                    slot="no-more"
                    style="color: #606266; font-size: 12px">
                    No more inverters!!
                </div>
                <div
                    slot="no-results"
                    style="color: #606266; font-size: 12px">
                    No more inverters!!
                </div>
                <div
                    slot="error"
                    style="color: #606266; font-size: 12px">
                    Error in fetching inverters, retry!!
                </div>
            </infinite-loading>
            </div>
        </el-select>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import API from '@/services/api/';
import { useOrgInventoryInvertersStore } from '../../../stores/organisation-inventory-inverters';

export default {
    name: 'infiniteScrollDropdownInverter',
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
            default: 'lightDrowpdownWithFilters',
        },
        isAdminPanel: {
            type: Boolean,
            default: false,
        },
              inverterType :{
             type: String,
             default : 'String Inverter'
        },
        currentIndex :{
            type : Number,
            default : 1,
        }
    },
    data() {
        return {
            isScrollStateToBeReset: '',
            scrollState: '',
            loading: false,
            inverterList: [],
            selectedInverter: this.inverter,
            inverterSearch: '',
            addInverterDiv: false,
            inverterdb: [],
            nextURL: null,
            prevURL: null,
            inverterMakeInput: null,
            styleSearchButton: 'el-icon-search button-light-theme-icons searchButtonStyleAddition',
            styleDeleteButton: 'el-icon-delete button-light-theme-icons deleteButtonStyleAddition',
            filters: {
                p_min: null,
                p_max: null,
            },
            getRequestObject: {
                p_min: null,
                p_max: null,
                query: null,
            },
        };
    },
    computed: {
        ...mapState(useOrgInventoryInvertersStore, [
            'GET_ORGANISATION_INVERTERS',
        ]),
    },
    watch: {
        inverter: {
            deep: true,
            immediate: true,
            handler(value) {
                this.selectedInverter = JSON.parse(JSON.stringify(value));
                this.$root.$emit('trigerInverter', this.selectedInverter);
            },
        },
        inverterType:{
            immediate: true,
            handler(value){
                // this.inverterType = value;
                // this.fetchMasterDataInverters();
                this.fetchInverters();
            }
        }
    },
    async mounted() {
        await this.FETCH_ORGANISATION_INVERTERS();
        this.fetchInverters();
    },
    methods: {
        ...mapActions(useOrgInventoryInvertersStore, [
            "FETCH_ORGANISATION_INVERTERS",
        ]),
        async fetchOrganisationInverters() {
            try {
                const inventory = this.GET_ORGANISATION_INVERTERS;
                const orgInverters = [];
                // inventory.forEach( async (item) => {
                //    await orgInverters.push(item.newInverter.Make);
                // });
                inventory.map(async(item) => {
                    if(item.newInverter !== null) {
                        await orgInverters.push(item.newInverter);
                    }
                })

                this.favoritesInverters = {
                    label: 'Favorites',
                    options: orgInverters,
                };
                this.inverterList.push(this.favoritesInverters);
            }
            catch (e) {
                console.error();
            }
        },
        async fetchMasterDataInverters() {
            try {
                this.loading = true;
                // const response = await ((this.isAdminPanel) ?
                //     API.MASTER_DATA_INVERTER.FETCH_ALL_MASTER_INVERTERS() :
                //     API.MASTER_DATA_INVERTER.FETCH_MASTER_INVERTERS());
                const response = await API.MASTER_DATA_INVERTER.FETCH_ALL_INVERTERS();
                this.setMasterDataInverters(response.data.results);
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                this.loading = false;
            }
            catch (e) {
                console.error();
            }
        },

        async searchMasterInvertersHelper(query) {
            try {
                this.loading = true;
                const response = await API.MASTER_DATA_INVERTER.SEARCH_ALL_INVERTERS(query, this.isAdminPanel);
                // resetting filters and request object in case of no results
                if (response.data.results.length === 0) {
                    setTimeout(() => {
                        this.clearQueryAndReloadInventory();
                        return null;
                    }, 1500);
                }
                this.inverterList = [];
                this.setMasterDataInverters(response.data.results);
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                this.loading = false;
                this.maintainScrollState();
            }
            catch (e) {
                console.error();
            }
        },
        async loadMoreInvertersHelper(url, $state) {
            try {
                console.log("Just Checking--------------",this.inverterList);
                if(this.nextURL!==null)
                {
                const response = await API.MASTER_DATA_INVERTER.FETCH_MORE_INVERTERS(this.nextURL);
                const invertersToBeAppened = response.data.results;
                this.inverterList.forEach((currentGroup) => {
                    if (currentGroup.label === 'Inventory') {
                        invertersToBeAppened.forEach((inverter) => {
                            currentGroup.options.push(inverter);
                        });
                    }
                });
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                console.log(this.nextURL);
                }
                $state.loaded(); 
            }
            catch (e) {
                $state.error();
                console.error();
            }
        },

        async fetchInverters() {
            this.inverterList = [];

            // fetching organisation panels
            if (this.areFavoritesRequired) await this.fetchOrganisationInverters();

            // Calling after favorites are added to the list
            await this.fetchMasterDataInverters();
        },
        setMasterDataInverters(allInventoryInverters) {
            const currentGroup = {
                label: 'Inventory',
                options: allInventoryInverters,
            };
            this.inverterList.push(currentGroup);
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
                    if (key === 'p_min' || key === 'p_max') {
                        // Behalf API this change. Stop conversion here.
                        // this.getRequestObject[key] *= 1000;
                    }
                }
                else {
                    delete this.getRequestObject[key];
                }
            });
        },

        loadMoreInverter($state) {
            this.scrollState=$state;
            console.log("Scroll State-------------------------------------------------------------", this.scrollState);
            if (this.nextURL !== null) {
                this.loadMoreInvertersHelper(this.nextURL, $state);
            }
            else {
                $state.complete();
                this.isScrollStateToBeReset = true;
            }
        },

        checkRequestStatusAndReloadInventory(requestObject) {
            if (Object.keys(requestObject).length === 0) {
                this.maintainScrollState();
                this.fetchInverters();
            }
            else { 
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
            // this.getRequestObject.p_max = this.filters.p_max;
            this.getRequestObject.p_max = this.filters.p_min;

             if(this.inverterType==='Micro Inverter')
            this.getRequestObject.type = 'micro';
            else if(this.inverterType==='Central Inverter')
            this.getRequestObject.type = 'central';

            // Remove empty keys from getRequestObject
            this.removeEmptyKeysAndConvertKwToW();
            
            // Check if query object consist of non null arguements and make a call
            this.checkRequestStatusAndReloadInventory(this.getRequestObject);
            e.preventDefault();
        },
        setFocusOnInverterMakeInput(e) {
            // e -> true when it appears, and false otherwise
            if (e === true) {

                // Timeout is required, element takes time to render
                setTimeout(() => {
                    document.getElementById('inverterMakeInputElement').focus();
                }, 100);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
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
    .filter-div-light {
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
        height: 35px;
        /* margin: 0px 6px; */
        /* border-radius: 3px; */
        border: 1px solid #909090;
        font-size: 11px;
        color: #222;
    }
    .not-valid {
        font-size: 10.5px;
        color: red;
        position: absolute;
        right: 20px;
        top: 58px;
    }
    .inventoryInformationDropdownStyling {
        overflow-x: hidden;
        padding: 0 10px 0 0;
        text-overflow: ellipsis!important;
    }

    .inverterSummaryPopoverLight {
        background-color: #fff;
        border: 1px solid #f8f8f8 !important;
    }

    .inverterSummaryPopoverDark {
        background-color: #363636 !important;
        border: 1px solid #363636 !important;
    }

    .inverterSummaryKeyDark, .inverterSummaryValueDark {
        text-align: left;
        font-size: .8vw;
        text-overflow: ellipsis!important;
        padding-bottom: 2%;
        font-family: Helvetica Neue,sans-serif;
    }

    .inverterSummaryValueDark {
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
    
    .inverterSummaryKeyDark {
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

    .inverterSummaryKeyLight, .inverterSummaryValueLight {
        text-align: left;
        font-size: 2.5vw;
        text-overflow: ellipsis!important;
        padding-bottom: 2%;
        font-family: Helvetica Neue,sans-serif;
    }

    .inverterSummaryKeyLight {
        color: #1b1b1b;
        font-weight: 400;
        text-decoration: none;
        overflow: hidden;
        width: 80px;
    }

    .inverterSummaryValueLight {
        color: #606266;
        box-sizing: content-box;
        display: inline-block;
        max-width: 150px;
        min-width: 100px;
        overflow-x: hidden;
        white-space: nowrap;
        flex-grow: 1;
    }

    .el-select> .el-input {
        text-align: center;
        text-align-last: left;
    }

    .el-input--suffix .el-input__inner{
        /* padding: 15px; */
        font-size: 17;
    }

    .searchButtonStyleAddition:hover, .searchButtonStyleAddition:focus {
        background-color: #358dd9 !important;
        color: #fafafa !important;
    }

    .deleteButtonStyleAddition:hover, .deleteButtonStyleAddition:focus {
        background-color: #ff0000 !important;
        color: #fafafa !important;
    }

    .deleteButtonStyleAddition {
        color: #fafafa;
        background-color: #e20b0b !important;
    }

    .searchButtonStyleAddition {
        color: #fafafa;
        background-color: #409eff !important;
    }

.inverterSummaryKeyLight {
  color: #1b1b1b;
  font-weight: 400;
  text-decoration: none;
  overflow: hidden;
  width: 80px;
}
.el-select > .el-input {
  text-align: center;
  text-align-last: left;
}

</style>

<style lang="scss" scoped>
    @import '../../../styles/components/button';
    @import '../../../styles/components/input';
</style>



<style type="text/css" scoped>

.displayFlex {
    display: flex;
    justify-content: flex-start;
}

.inverterSummaryKeyDark {
    color: #d1d1d1;
    text-align: left;
    font-size: 2.5vw;
    font-weight: 400;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis !important;
    padding-bottom: 2%;
    font-family: Helvetica Neue, sans-serif;
    width: 80px;
    word-break: break-word;

}

.inverterSummaryValueDark {
    font-size: 2.5vw;
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

.inverterSummaryKeyLight {
    color: #1b1b1b;
    text-align: left;
    font-size: 2.5vw;
    font-weight: 400;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis !important;
    padding-bottom: 2%;
    font-family: Helvetica Neue, sans-serif;
    width: 80px;
    word-break: break-word;
}

.inverterSummaryValueLight {
    /* later check redundant properties and why is the same class kept at two places */
    font-size: 2.5vw;
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
    
<style type="text/css" scoped>
.inverterSummaryPopoverDark {

  background-color: #363636 !important;
  border: 1px solid #363636 !important;

}

.inverterSummaryPopoverDark .popper__arrow {
  border-top-color: #363636 !important;
  border-right-color: transparent !important;
  bottom: -7px !important;
}

.inverterSummaryPopoverLight {

  background-color: white;
  border: 1px solid rgb(248, 248, 248);

}

.inverterSummaryPopoverLight .popper__arrow {
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
}

.dropdownWrapper {
    margin-top: 5rem;
    overflow:hidden;
}

#new\ div > form {
padding: 10px 20px;
    background-color: white;
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 5rem;
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


 .SearchMakeWrapper {
    width: 65%;
}

 .SearchSizeWrapper {
    width: 20%;
}

 .SearchButtonWrapper {
    width: 15%;
}

.option-wrapper {
    display: flex;
    flex-direction: row;
    border-bottom: 1px #606266 solid;
    max-width: 320px;
    min-width: 320px;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.option-wrapper .name{
    width: 100%;
}

@media only screen and (min-width: 768px) {

#panelInfiniteScroll {
    max-width: 370px;
}

 .SearchMakeWrapper {
    width: 72%;
}

 .SearchSizeWrapper {
    width: 20%;
}

 .SearchButtonWrapper {
    width: 8%;
}

.option-wrapper {
    display: flex;
    flex-direction: row;
    border: none;
    min-width: 100%;
    justify-content: space-between;
}

.option-wrapper .name{
    width: 55%;
}

.option-wrapper .model{
    width: 30%;
}

.option-wrapper .pmpp{
    width: 10%;
}

.option-wrapper > span.tooltip{
    width: 5%;
    text-align:end;
    font-size: 13px;
    display: block;
}

.inverterSummaryKeyLight, .inverterSummaryValueLight{
   font-size: 0.8vw;
}

}
</style>

<style>
.inverterSummaryPopoverDark {
  background-color: #363636;
  border: 1px solid #363636;
}

</style>

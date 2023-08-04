<template>
    <div
        id="panelInfiniteScroll"
        style="width: 100%;">
       
        <el-select
            :id="componentId"
            v-model="selectedPanel"
            :disabled="!doesSelectedPanelExist"
            :class="theme==='darkDropdownWithFilters' ? 'sappane-select' : ''"
            :popper-class="theme"
            :loading="loading"
            :multiple="isAdminPanel"
            placeholder="Add Panel"
            value-key="id"
            style="width: 100%;"
            no-data-text="No panels with searched query! Resetting... "
            @visible-change="setFocusOnPanelMakeInput"
            @change="$emit('update:panel', JSON.parse(JSON.stringify(selectedPanel)));
            $emit('event-to-save-panel-obj',selectedPanel);">
            <form
                :submit="generateQueryAndMakeRequest"
                action="#">
                <div class="filter-div-light center-space-between-alignment">
                    <div style="width: 45%;">
                        <span style="color: #7f7f7f; font-size: 11px;">Make</span>
                        <input
                            :id="panelMakeInputElement"
                            v-model="panelMakeInput"
                            type="text"
                            placeholder="Search Module"
                            class="filter-input-light"
                            style="width: 70%;"
                            autocomplete="off">
                    </div>
                    <div style="width: 40%; padding: 0 5px;">
                        <span style="color: #7f7f7f; font-size: 11px;">Size</span>
                        <input
                            v-validate="'decimal|min_value:' + 0"
                            v-model="filters['p_min']"
                            name="min-filter"
                            placeholder="Min(W)"
                            class="filter-input-light"
                            autocomplete="off">
                        <div class="not-valid">{{ errors.first('min-filter') }}</div>
                        <!-- <span>-</span>
                        <input
                            v-validate="'decimal|min_value:' + filters['p_min']"
                            v-model="filters['p_max']"
                            name="max-filter"
                            placeholder="Max(W)"
                            class="filter-input-light"
                            autocomplete="off">
                        <div class="not-valid">{{ errors.first('max-filter') }}</div> -->
                    </div>
                    <div
                        class="dropdownSearchDeleteButtonStyler"
                        style="width: 15%; text-align: right;">
                        <button
                            :class="styleSearchButton"
                            type="submit"
                            style="font-size: 15px; padding: 5px"
                            @click="generateQueryAndMakeRequest"/>
                        <button
                            :class="styleDeleteButton"
                            type="button"
                            style="font-size: 15px; padding: 5px"
                            @click="clearQueryAndReloadInventory"/>
                    </div>
                </div>
            </form>
            <el-option-group
                v-for="(group, index) in panelList"
                :key="index"
                 style="min-width:750px !important;"
                :label="group.label">
                <el-option
                    v-for="(item, panelIndex) in group.options"
                    :key="panelIndex"
                    :label="
                        item.company_name + item.model
                    "
                    :value="item"
                >
                    <div style="display: flex; justify-content: space-between">
                        <div
                            style="width: 90%; display: flex; justify-content: space-between;">
                            <div
                                style="width: 50%;" 
                                class="inventoryInformationDropdownStyling">
                                {{ item.company_name }}
                            </div>
                            <div style="width: 35%; display:flex; justify-content: flex-start;">
                                <div
                                    v-if="item.model.length <= 5"
                                    class="inventoryInformationDropdownStyling">
                                    {{ item.series }} {{ item.model }}
                                </div>

                                <div
                                    v-else
                                    class="inventoryInformationDropdownStyling">
                                    {{ item.model }}
                                </div>
                            </div>
                            <span style="float: right; font-size: 13px">
                                <el-popover
                                    :close-delay="1"
                                    :visible-arrow="false"
                                    :popper-class="theme==='darkDropdownWithFilters' ? 'panelSummaryPopoverDark' : 'panelSummaryPopoverLight'"
                                    placement="top-end"
                                    trigger="hover">
                                    <div
                                        v-if="item.characteristics"
                                        style="padding: 10px;">
                                        <!-- have a single variable for this -->
                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> Company </div>                                  
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{ item.company_name }} </div> 
                                        </div>

                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> Series </div>   
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{item.series}} </div> 
                                        </div>

                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> Model </div> 
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{item.model}} </div> 
                                        </div>

                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> No. of Cells </div> 
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{item.cell_number}} </div> 
                                        </div>

                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> Cell type </div>  
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{item.cell_type}} </div> 
                                        </div>

                                        <div class="displayFlex">
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryKeyDark' : 'panelSummaryKeyLight'"> Max Voltage </div>  
                                            <div :class="theme==='darkDropdownWithFilters' ? 'panelSummaryValueDark' : 'panelSummaryValueLight'"> {{item.v_max}} </div> 
                                        </div>
                                    </div>
                                    <i
                                        slot="reference"
                                        class="el-icon-info"/>
                                </el-popover>
                            </span>
                        </div>
                        <div style="float: right;">{{ item.pmpp }} W</div>
                    </div>
                </el-option>

            </el-option-group>
            <infinite-loading
                :distance="0"
                spinner="bubbles"
                @infinite="loadMorePanels"
            >
                <div
                    slot="no-more"
                    style="color: #606266; font-size: 12px">
                    No more panels!!
                </div>
                <div
                    slot="no-results"
                    style="color: #606266; font-size: 12px">
                    No more panels!!
                </div>

                <div
                    slot="error"
                    style="color: #606266; font-size: 12px">
                    Error in fetching panels, retry!!
                </div>
            </infinite-loading>
        </el-select>
    </div>
</template>

<script>
import API from '@/services/api/';
import { mapState, mapActions } from 'pinia';
import { useOrgInventoryPanelsStore } from '../../../stores/organisation-inventory-panels';

export default {
    name: 'PanelScroll',
    props: {
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
        };
    },
    computed: {
        ...mapState(useOrgInventoryPanelsStore, [
            'GET_ORGANISATION_PANELS',
        ]),
        doesSelectedPanelExist() {
            if (!this.areFavoritesRequired) {
                return true;
            }
            return !(Object.entries(this.selectedPanel).length === 0
                && this.selectedPanel.constructor === Object);
        },
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
        // panelMakeInput(){
        //     this.generateQueryAndMakeRequest();

            

        // },
    },
    async mounted() {
        await this.FETCH_ORGANISATION_PANELS(); 
        this.fetchPanels();
    },
    methods: {
        ...mapActions(useOrgInventoryPanelsStore, [
            "FETCH_ORGANISATION_PANELS",
        ]),
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

        async fetchMasterDataPanels() {
            try {
                this.loading = true;
                const response = await API.MASTER_DATA_PANEL.FETCH_ALL_MASTER_PANELS_OLDTRUE_REMOVED() ;
                console.log("to check actual incoming master data panels",response);
                this.setMasterDataPanels(response.data.results);
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
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
        async searchMasterPanelsHelper(query) {
            try {
                this.loading = true;
                const response = await API.MASTER_DATA_PANEL.SEARCH_MASTER_PANELS_OLDTRUE_REMOVED(query, this.isAdminPanel);
                // resetting filters and request object in case of no results
                if (response.data.results.length === 0) {
                    // Clear Query and reload Inventory
                    setTimeout(() => {
                        this.clearQueryAndReloadInventory();
                        return null;
                    }, 2000);
                }
                this.panelList = [];
                this.setMasterDataPanels(response.data.results);
                this.maintainScrollState();
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                this.loading = false;
            }
            catch (e) {
                console.error(e);
            }
        },
        async loadMorePanelsHelper(url, $state) {
            try {
                const response = await API.MASTER_DATA_PANEL.LOAD_MORE_PANELS(url);
                const panelsToBeAppended = response.data.results;
                // Appending it to inventory group
                this.panelList.forEach((currentGroup) => {
                    if (currentGroup.label === 'Inventory') {
                        panelsToBeAppended.forEach((panel) => {
                            currentGroup.options.push(panel);
                        });
                    }
                });
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                $state.loaded();
            }
            catch (e) {
                $state.error();
                console.error();
            }
        },
        async fetchPanels() {
            this.panelList = [];
            // fetching organisation panels
            if (this.areFavoritesRequired) await this.fetchOrganisationPanels();

            // Calling after favorites are added to the list
            await this.fetchMasterDataPanels();

            console.log("to check whole panel list",this.panelList);

            if (this.areFavoritesRequired) {
                this.fetchSelectedModuleId();
            }
        },
        setMasterDataPanels(allInventoryPanels) {
            const currentGroup = {
                label: 'Inventory',
                options: allInventoryPanels,
            };
            this.panelList.push(currentGroup);
        },

        loadMorePanels($state) {
            this.scrollState = $state;
            if (this.nextURL !== null) {
                this.loadMorePanelsHelper(this.nextURL, $state);
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
                this.fetchPanels();
            }
            else { 
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
            // this.getRequestObject.p_max = this.filters.p_max;
            this.getRequestObject.p_max = this.filters.p_min;

            // Remove empty keys from getRequestObject
            this.removeEmptyKeys();
            
           // Check if query object consist of non null arguements and make a call

        //     setTimeout(() => {
        
        //   this.checkRequestStatusAndReloadInventory(this.getRequestObject);
        // }, 2000);

             this.checkRequestStatusAndReloadInventory(this.getRequestObject);
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

</style>

<style lang="scss" scoped>
    @import '../../../styles/components/button';
</style>


<style lang="scss">

</style>

<style type="text/css" scoped>

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
    
<style type="text/css" scoped>
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
}
</style>

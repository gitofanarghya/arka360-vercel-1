<!-- UNUSED FILE -->
<template>
    <div id="panelInventory">
        <div class="inventoryTopPart">
            <div class="searchBarWrapper">
                <div class="searchBar">
                    <el-input
                        v-model="panelSearch"
                        placeholder="Search Favorites"
                        suffix-icon="el-icon-search"
                    />
                </div>
            </div>

            <button
                v-show="!addPanelDiv"
                class="button-confirm"
                style="float: right; height: 40px; margin: 0;"
                @click="addPanelDiv = !addPanelDiv">
                Add Module
            </button>

            <div
                v-show="addPanelDiv"
                class="addInventoryWrapper">
                <infinite-scroll-dropdown-panel
                    :panel.sync="selectedPanel"
                    :areFavoritesRequired="false"/>
                <button
                    class="button-confirm"
                    style="margin: 0;"
                    @click="addPanelToOrganisation()"
                    :disabled="Object.keys(selectedPanel).length === 0">
                    Add
                </button>
            </div>
        </div>

        <el-table
            :data="
                panelInventory.filter(
                    data =>
                        !panelSearch ||
                        data.panel.characteristics.manufacturer
                            .toLowerCase()
                        .includes(panelSearch.toLowerCase()) ||
                        data.panel.model
                            .toLowerCase()
                            .includes(panelSearch.toLowerCase())
                )
            "
            :fit="true"
            stripe
            style="width: 100%;">
            <el-table-column
                min-width="150px"
                sortable
                prop="panel.characteristics.manufacturer"
                label="Manufacturer"/>
            <el-table-column
                prop="panel.model"
                label="Model"/>
            <el-table-column
                sortable
                prop="panel.characteristics.p_mp_ref"
                label="Size (W)"/>
            <el-table-column label="Delete">
                <template slot-scope="scope">
                    <div class="inventoryDeleteWrapper">
                        <button
                            size="mini"
                            class="el-icon-delete"
                            @click="deletePanelFromOrganisation(scope.$index)"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue'
import { useOrgInventoryPanelsStore } from '../../../../stores/organisation-inventory-panels';

const user = JSON.parse(localStorage.getItem('user')) || {};
const token = user.token;

export default {
    name: 'PanelInventory',
    components: {
        infiniteScrollDropdownPanel,
    },
    data() {
        return {
            msg: ' I am in panelInventory',
            panelSearch: '',
            addPanelDiv: false,
            loading: false,
            selectedPanel: {},
            paneldb: [],
            nextURL: null,
            prevURL: null,
        };
    },
    computed: {
        ...mapState(useOrgInventoryPanelsStore, [
            'GET_ORGANISATION_PANELS',
        ]),

        panelInventory() {
            return this.GET_ORGANISATION_PANELS;
        },
    },
    methods: {
        ...mapActions(useOrgInventoryPanelsStore, [
            'FETCH_ORGANISATION_PANELS',
            'ADD_ORGANISATION_PANEL',
            'DELETE_ORGANISATION_PANEL',
        ]),

        deletePanelFromOrganisation(index) {
            const row_to_be_deleted = this.panelInventory[index].id;
            this.DELETE_ORGANISATION_PANEL({ payload: row_to_be_deleted });
        },

        addPanelToOrganisation() {
            let doesPanelExist = false;
            for (let i = 0; i < this.panelInventory.length; i++) {
                if (this.selectedPanel.id === this.panelInventory[i].panel.id) {
                    doesPanelExist = true;
                    break;
                }
            }

            if (doesPanelExist === false) {
                const postData = {
                    panel: this.selectedPanel.id,
                };
                this.ADD_ORGANISATION_PANEL({ payload: postData });
                this.$message({
                    showClose: true,
                    message: 'Module added to the inventory.',
                    type: 'success',
                    center: true
                });
            }
            else {
                this.$message({
                    showClose: true,
                    message: 'Module already exist in the inventory.',
                    type: 'error',
                    center: true
                });
            }
            this.addPanelDiv = false;
            this.selectedPanel = {};
        },
    },
};
</script>

<style scoped>

.searchBarWrapper {
    width: 30%;
    text-align: left;
    display: inline-block;
}

.inventoryTopPart {
    padding-bottom: 20px;
}

.addInventoryWrapper {
    width: 40%;
    float: right;
    display: flex;
}

.el-icon-delete {
    background-color: transparent;
    border-color: transparent;
    cursor: pointer;
    color: #606266;
    font-size: 15px;
}

.el-icon-delete:hover {
    color: #409EFF;
}

.el-icon-delete:focus {
    outline: none;
}

#panelInventory >>> .el-table th > .cell {
    color: #409eff;
}


</style>

<style lang="scss" scoped>
@import '../../../../styles/components/button';
</style>

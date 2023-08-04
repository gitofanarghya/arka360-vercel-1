
<!-- UNUSED FILE -->
<template>
    <div id="inverterInventory">
        <div class="inventoryTopPart">
            <div class="searchBarWrapper">
                <div class="searchBar">
                    <el-input
                        v-model="inverterSearch"
                        placeholder="Search Favorites"
                        suffix-icon="el-icon-search"/>
                </div>
            </div>

            <button
                v-show="!addInverterDiv"
                class="button-confirm"
                style="float: right; height: 40px; margin: 0;"
                @click="addInverterDiv=!addInverterDiv">
                Add Inverter
            </button>

            <div
                v-show="addInverterDiv"
                class="addInventoryWrapper">

                <infinite-scroll-dropdown-inverter
                    :inverter.sync="selectedInverter"
                    :are-favorites-required="false"
                />
                <button
                    class="button-confirm"
                    style="margin: 0"
                    @click="addInverterToOrganisation()"
                    :disabled="Object.keys(selectedInverter).length === 0"
                >
                    Add
                </button>
            </div>
        </div>
        <el-table
            :data="inverterInventory.filter(data => !inverterSearch ||
            data.newInverter.displayname.toLowerCase().includes(inverterSearch.toLowerCase()))"
            :fit="true"
            stripe
            style="width: 100%;">
            <el-table-column
                sortable
                prop="newInverter.displayname"
                label="Name"/>
            <el-table-column
                sortable
                prop="newInverter.Size"
                label="Size (KW)"/>
            <el-table-column
                sortable
                prop="newInverter.MPPT_Low_V"
                label="Mppt Low"/>
            <el-table-column
                sortable
                prop="newInverter.MPPT_High_V"
                label="Mppt High"/>
            <el-table-column
                label="Delete">
                <template slot-scope="scope">
                    <div class="inventoryDeleteWrapper">
                        <button
                            class="el-icon-delete" 
                            @click="deleteInverterFromOrganisation(scope.$index)"/>
                    </div>
                </template>
            </el-table-column>
        </el-table>

    </div>


</template>

<script>
import { mapState, mapActions } from 'pinia';
import infiniteScrollDropdownInverter from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverter.vue'
import { useOrgInventoryInvertersStore } from '../../../../stores/organisation-inventory-inverters';

export default {
    name: 'InverterInventory',
    components: {
        	infiniteScrollDropdownInverter,
    },
    data() {
        return {
            msg: ' I am in inverterInventory',
            addInverterDiv: false,
            inverterdb: [],
            loading: false,
            selectedInverter: {},
            inverterSearch: '',
        };
    },
    computed: {
        ...mapState(useOrgInventoryInvertersStore, [
            'GET_ORGANISATION_INVERTERS',
        ]),
        inverterInventory() {
            let inverter = this.GET_ORGANISATION_INVERTERS;
            try {
            for (let newInverter = 0; newInverter < this.GET_ORGANISATION_INVERTERS.length; newInverter++) {
                if (inverter[newInverter]["newInverter"])
                inverter[newInverter]["newInverter"]["displayname"] = inverter[newInverter]["newInverter"]["Manufacturer"] + " " + inverter[newInverter]["newInverter"]["Make"]
            }
            } catch(e) {
                console.log(e)
            }
             return inverter
        },
        
    },
    methods: {

        ...mapActions(useOrgInventoryInvertersStore, [
            'FETCH_ORGANISATION_INVERTERS',
            'ADD_ORGANISATION_INVERTER',
            'DELETE_ORGANISATION_INVERTER',
        ]),

        deleteInverterFromOrganisation(index) {
            const row_to_be_deleted = this.inverterInventory[index].id;
            this.DELETE_ORGANISATION_INVERTER({ payload: row_to_be_deleted });
        },

        addInverterToOrganisation() {
            let doesInverterExist = false;
            for (let i = 0; i < this.inverterInventory.length; i++) {
                try {
                if (this.inverterInventory[i].newInverter) {
                if (this.selectedInverter.id === this.inverterInventory[i].newInverter.id) {
                    doesInverterExist = true;
                    break;
                }
                }
                } catch (e) {
                    console.log(e)
                }
            }

            if (doesInverterExist === false) {
                const postData = {
                    newInverter: this.selectedInverter.id,
                    inverter: 6

                };
                this.ADD_ORGANISATION_INVERTER({ payload: postData });
                this.$message({
                    showClose: true,
                    message: 'Inverter added to the inventory.',
                    type: 'success',
                    center: true
                });
            }
            else {
                this.$message({
                    showClose: true,
                    message: 'Inverter already exist in the inventory.',
                    type: 'error',
                    center: true
                });
            }
            this.addInverterDiv = false;
            this.selectedInverter = {};
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

#inverterInventory >>> .el-table th > .cell {
    color: #409eff;
}


</style>

<style lang="scss" scoped>
@import '../../../../styles/components/button';
</style>

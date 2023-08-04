<template>
    <div id="admin">
        <!-- to-do change the way css is done -->
        <el-header class="navBar-container">
            <navBar :current-page="currentPage" />
        </el-header>
        <div style="margin: 5vw 3vw">
            <div>
                <el-row style="margin: 2vw 0">
                    <el-col
                        :span="5"
                        style="text-align:left;">Select User</el-col>
                    <el-col
                        :span="4"
                        style="text-align:center;">Manage Permissions</el-col>
                </el-row>
                <el-row>
                    <el-col
                        :span="5"
                        style="margin-top: 10px;">
                        <infiniteScrollUsers
                            :user.sync="selectedUser"
                            style="height: 28px; border-right: 1px solid #409EFF; width:80%;"/>
                    </el-col>
                    <el-col
                        :span="4"
                        style="margin-top:5px; text-align: center;">
                        <button
                            class="button-confirm"
                            style="height: 28px;"
                            @click="onOpenPermissionsDialog(permissionsType.newUser, defaultPermissionsData)">Manage
                        </button>
                    </el-col>
                </el-row>
            </div>
            <div style="margin: 5vw 5vw">
                <el-table
                    :data="apiKeysData"
                    style="width: 100%;">
                    <el-table-column
                        prop="api_hit_count"
                        label="API Hits Count"/>
                    <el-table-column
                        prop="api_key"
                        label="API Key"/>
                    <el-table-column
                        label="User">
                        <template slot-scope="scope">
                            {{ scope.row.user_detail.first_name }} {{ scope.row.user_detail.last_name }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="Permissions">
                        <template slot-scope="scope">
                            <button
                                class="button-confirm"
                                @click="onOpenPermissionsDialog(permissionsType.existingUser, scope.row.permissions, scope.row.id, scope.row.user)">
                                Manage
                            </button>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="Delete">
                        <template slot-scope="scope">
                            <button
                                size="mini"
                                class="el-icon-delete"
                                @click="deleteApiKeyRow(scope.row.id)"/>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <el-dialog
                :visible.sync="isPermissionDialogVisible"
                :close-on-click-modal="false"
                style="min-width: 800px;"
                title="Permissions"
                width="50%">
                <div
                    v-for="(individualPermissionData, indidvidualPermissionName) in currentSelectedPermissionData"
                    :key="indidvidualPermissionName">
                    <div style="font-weight: bold; margin: 10px 0">{{ labelDisplayValueMap[indidvidualPermissionName] }}</div>
                    <el-checkbox
                        v-for="(indidvidualPermissionValue, indidvidualPermissionKey) in individualPermissionData"
                        :key="indidvidualPermissionKey"
                        :disabled="disabledKeys[indidvidualPermissionName][indidvidualPermissionKey]"
                        v-model="currentSelectedPermissionData[indidvidualPermissionName][indidvidualPermissionKey]"
                        class="checkBoxBorder">
                        {{ labelDisplayValueMap[indidvidualPermissionKey] }}
                    </el-checkbox>
                </div>
                <div style="text-align: right; padding: 13px;">
                    <button
                        :disabled="isConfirmButtonDisabled"
                        class="button-confirm"
                        @click="onDialogConfirm()">
                        {{ dialogConfirmButtonText }}
                    </button>
                </div>
            </el-dialog>
            <adminPanelInverterPanel
                :on-add="addSelected.bind(this, selectedInverters, tableDataforInverters, 'inverter')"
                :on-delete="deleteInverters"
                :is-add-disabled="selectedInverters.length === 0"
                :is-delete-disabled="invertersToDelete.length === 0"
                type="Inverters"
                style="margin: 0 0 2vw 0">
                <infiniteScrollDropdownInverter
                    :are-favorites-required="false"
                    :inverter.sync="selectedInverters"
                    is-admin-panel
                    style="width: 70vw; margin: 2vw 0"/>
                <el-table
                    v-if="isInverterRestricted"
                    :data="tableDataforInverters"
                    style="width: 100%; margin: 0 0 2vw 0">
                    <el-table-column
                        prop="characteristics.name"
                        label="Name"/>
                    <el-table-column
                        prop="characteristics.paco"
                        label="Size (W)"/>
                    <el-table-column
                        prop="characteristics.mppt_low"
                        label="Mppt Low"/>
                    <el-table-column
                        prop="characteristics.mppt_high"
                        label="Mppt High"/>
                    <el-table-column
                        label="Mark for deleting">
                        <template slot-scope="scope">
                            <el-checkbox
                                :value="invertersToDelete.includes(scope.row.id)"
                                style="padding: 0 2px 0 0"
                                class="checkBoxBorder"
                                @change="addRemoveInverterPanelFromDelArr(scope.row.id, invertersToDelete)"/>                        
                        </template>
                    </el-table-column>
                </el-table>
                <h1 v-else> All inverters are being used </h1>
            </adminPanelInverterPanel>
            <adminPanelInverterPanel
                :on-add="addSelected.bind(this, selectedPanels, tableDataforPanels, 'panel')"
                :on-delete="deletePanels"
                :is-add-disabled="selectedPanels.length === 0"
                :is-delete-disabled="panelsToDelete.length === 0"
                type="Panels"
                style="margin: 0 0 2vw 0">
                <infiniteScrollDropdownPanel
                    :are-favorites-required="false"
                    :panel.sync="selectedPanels"
                    is-admin-panel
                    style="width: 70vw; margin: 2vw 0"/>
                <el-table
                    v-if="isPanelRestricted"
                    :data="tableDataforPanels"
                    style="width: 100%; margin: 0 0 2vw 0">
                    <el-table-column
                        prop="characteristics.manufacturer"
                        label="Manufacturer Name"/>
                    <el-table-column
                        prop="characteristics.p_mp_ref"
                        label="Size (W)"/>
                    <el-table-column
                        prop="model"
                        label="Model"/>
                    <el-table-column
                        label="Mark for deleting">
                        <template slot-scope="scope">
                            <el-checkbox
                                :value="panelsToDelete.includes(scope.row.id)"
                                style="padding: 0 2px 0 0"
                                class="checkBoxBorder"
                                @change="addRemoveInverterPanelFromDelArr(scope.row.id, panelsToDelete)"/>
                        </template>
                    </el-table-column>
                </el-table>
                <h1 v-else> All panels are being used </h1>
            </adminPanelInverterPanel>
        </div>
    </div>
</template>

<script>

import API from '@/services/api';
import infiniteScrollUsers from '@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue';
import navBar from '@/components/ui/navBar/navBar.vue';
import adminPanelInverterPanel from '@/components/ui/adminPanelInverterPanel/adminPanelInverterPanel.vue';
import infiniteScrollDropdownInverter from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownInverter.vue';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';

export default {
    name: 'Admin',
    components: {
        infiniteScrollUsers,
        navBar,
        adminPanelInverterPanel,
        infiniteScrollDropdownInverter,
        infiniteScrollDropdownPanel,
    },
    data() {
        return {
            isPanelRestricted: false,
            isInverterRestricted: false,
            isInverterInDelArr: true,
            selectedInverters: [],
            selectedPanels: [],
            invertersToDelete: [],
            panelsToDelete: [],
            tableDataforInverters: [],
            tableDataforPanels: [],
            organisationId: null,
            currentPage: 'admin',
            permissionsType: {
                newUser: 'new',
                existingUser: 'existing',
            },
            editAPIKeyID: '',
            isPermissionDialogVisible: false,
            currentSelectedPermissionData: {},
            currentSelectedPermissionType: '',
            disabledKeys: {
                report: {
                    title: true,
                    savings: true,
                    components: true,
                    'monthly-production': true,
                    losses: true,
                    'environmental-impact': true,
                },
            },
            labelDisplayValueMap: {
                project: 'Project',
                design: 'Design',
                report: 'Report',
                edit: 'Edit',
                view: 'View',
                delete: 'Delete',
                title: 'Title',
                'system-metrics': 'System Metrics',
                savings: 'Savings',
                components: 'Components',
                'monthly-production': 'Monthly Production',
                'monthly-table': 'Monthly Table',
                'bill-with-without-solar': 'Bill With Without Solar',
                'environmental-impact': 'Environmental Impact',
                'heat-map': 'Irradiance Map',
                'about-us': 'About Us',
                'thank-you': 'Thank You',
                losses: 'Losses',
                'field-segments': 'Field Segments',
                'shadow-analysis': 'Shadow Analysis',
            },
            selectedUser: {},
            apiKeysData: [],
            defaultPermissionsData: {
                report: {
                    title: true,
                    'system-metrics': true,
                    savings: true,
                    components: true,
                    'monthly-production': true,
                    'monthly-table': true,
                    'bill-with-without-solar': true,
                    'environmental-impact': true,
                    'heat-map': true,
                    'about-us': true,
                    'thank-you': true,
                    losses: true,
                    'field-segments': true,
                    'shadow-analysis': true,
                },
            },
        };
    },
    computed: {
        dialogConfirmButtonText() {
            return this.currentSelectedPermissionType === this.permissionsType.newUser ? 'Generate' : 'Save';
        },
        isConfirmButtonDisabled() {
            return this.currentSelectedPermissionType === this.permissionsType.newUser && Object.keys(this.selectedUser).length === 0;
        },
    },
    async mounted() {
        const isUserAdmin = await this.checkIfAdminUser();
        if (isUserAdmin) {
            this.fetchAPIKeysData();
            await this.setRestrictions();
            if (this.isInverterRestricted) {
                this.fetchAddedInverters();
            }
            if (this.isPanelRestricted) {
                this.fetchAddedPanels();
            }
        }
        else {
            this.$router.push('/');
        }
    },
    methods: {
        async setRestrictions() {
            const organisationData = JSON.parse(localStorage.getItem('organisation')) || {};
            // const orgSummaryData = (await API.ORGANISATION.FETCH_ORGANISATION(this.organisationId)).data;
            const orgSummaryData = organisationData;
            this.isInverterRestricted = orgSummaryData.is_inverter_restricted;
            this.isPanelRestricted = orgSummaryData.is_panel_restricted;
        },
        async fetchAPIKeysData() {
            this.apiKeysData = (await API.INTEGRATION.FETCH_API_KEYS_DATA()).data;
        },
        async deleteApiKeyRow(apiKeyId) {
            await API.INTEGRATION.DELETE_API_KEY(apiKeyId);
            await this.fetchAPIKeysData();
        },
        async onOpenPermissionsDialog(permissionsType, permissionsData, rowID, userID) {
            // deep copy
            this.currentSelectedPermissionData = JSON.parse(JSON.stringify(permissionsData));
            this.currentSelectedPermissionType = permissionsType;
            this.editAPIKeyID = rowID;
            this.editAPIKeyUser = userID;
            this.isPermissionDialogVisible = true;
        },
        async generateKey() {
            await API.INTEGRATION.ADD_API_KEY({
                permissions: this.currentSelectedPermissionData,
                user: this.selectedUser.id,
            });
            this.fetchAPIKeysData();
        },
        async updateAPIKeyPermissions() {
            await API.INTEGRATION.UPDATE_API_KEY({
                permissions: this.currentSelectedPermissionData,
                user: this.editAPIKeyUser,
                id: this.editAPIKeyID,
            });
            this.fetchAPIKeysData();
        },
        onDialogConfirm() {
            if (this.currentSelectedPermissionType === this.permissionsType.newUser) {
                this.generateKey();
            }
            else {
                this.updateAPIKeyPermissions();
            }
            this.isPermissionDialogVisible = false;
        },
        async checkIfAdminUser() {
            const { user_id, organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
            this.organisationId = organisation_id;
            const isAdmin = (await API.USERS.FETCH_USER(user_id)).data.role !== null;
            return isAdmin;
        },
        async addSelected(selectedArr, tableDataArr, type) {
            let iDList = []; // An array to add panel list which contain only ids
            for (let i = 0; i < selectedArr.length; i += 1) {
                let isSelectedExist = false;
                for (let j = 0; j < tableDataArr.length; j += 1) {
                    if (selectedArr[i].id === tableDataArr[j].id) {
                        isSelectedExist = true;
                        break;
                    }
                }
                if (!isSelectedExist) iDList = iDList.concat(parseInt(selectedArr[i].id, 10));
            }
            const postData = { add: iDList };
            if (type === 'inverter') {
                await this.postAddedInverter(postData);
                this.selectedInverters = [];
            }
            else {
                await this.postAddedPanel(postData);
                this.selectedPanels = [];
            }
            this.setRestrictions();
        },
        async postAddedInverter(postData) {
            try {
                await API.MASTER_DATA_INVERTER.POST_NEW_ADDED_INVERTERS(postData);
            }
            catch (e) {
                console.error();
            }
            this.fetchAddedInverters();
        },
        async postAddedPanel(postData) {
            try {
                await API.MASTER_DATA_PANEL.POST_NEW_ADDED_PANELS(postData);
            }
            catch (e) {
                console.error();
            }
            this.fetchAddedPanels();
        },
        async fetchAddedInverters() {
            try {
                this.tableDataforInverters = (await API.MASTER_DATA_INVERTER.FETCH_MASTER_INVERTERS()).data.results;
            }
            catch (e) {
                console.error();
            }
        },
        async fetchAddedPanels() {
            try {
                this.tableDataforPanels = (await API.MASTER_DATA_PANEL.FETCH_MASTER_PANELS()).data.results;
            }
            catch (e) {
                console.error();
            }
        },
        addRemoveInverterPanelFromDelArr(inverterPanelID, inverterPanelArr) {
            const indexIninverterPanelArr = inverterPanelArr.indexOf(inverterPanelID);
            const isInverterPresent = indexIninverterPanelArr !== -1;
            if (isInverterPresent) {
                inverterPanelArr.splice(indexIninverterPanelArr, 1);
            }
            else {
                inverterPanelArr.push(inverterPanelID);
            }
        },
        async deleteInverters() {
            const patchData = { add: [], remove: this.invertersToDelete };
            try {
                await API.MASTER_DATA_INVERTER.DELETE_SELECTED_INVERTERS(patchData);
                this.invertersToDelete = [];
                await this.fetchAddedInverters();
                this.setRestrictions();
            }
            catch (e) {
                console.error();
            }
        },
        async deletePanels() {
            const patchData = { add: [], remove: this.panelsToDelete };
            try {
                await API.MASTER_DATA_PANEL.DELETE_SELECTED_PANELS(patchData);
                this.panelsToDelete = [];
                await this.fetchAddedPanels();
                this.setRestrictions();
            }
            catch (e) {
                console.error();
            }
        },
    },
};

</script>

<style scoped>
.checkBoxBorder >>> .el-checkbox__inner {
    border: 1px solid #DCDFE6 !important;
    width: 18px;
    height: 18px;
}

.checkBoxBorder >>> .el-checkbox__inner::after {
    top: 3px;
    left: 6px;
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

#admin >>> .el-table th > .cell {
    color: #409eff;
}


</style>

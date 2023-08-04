<template>
    <div
        id="settingsButton"
        class="navBarRightButtons">
        <el-dropdown trigger="click">
            <span class="el-dropdown-link">
                <button class="navBarIcon iconNavBar-settings" />
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="goToInventorySettings">
                    Inventory
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="tataPowerOrg"
                    @click.native="goToOrganisationProfile"
                >
                    {{ displayOrgProfile }}
                </el-dropdown-item>

                <el-dropdown-item
                    v-if="tataProleAdmin"
                    @click.native="goToOrganisationDefaults"
                >
                    Organisation Defaults
                </el-dropdown-item>

                <!-- <el-dropdown-item v-if="isAdmin" @click.native="goToPricing">
                    Plan and Pricing
                </el-dropdown-item> -->

                <el-dropdown-item
                    v-if="isAdmin"
                    @click.native="goToAdmin">
                    Admin
                </el-dropdown-item>

                <el-dropdown-item
                    v-if="wireSizeEnabled"
                    @click.native="goToWireSizeCalculator">
                    Wire Size Calculator
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
/* eslint-disable camelcase */
import { isTataOrg } from '../../../../utils';

export default {
    name: 'SettingsButton',
    data() {
        // ============ Create Check for Tata Power User ===============
        const user = JSON.parse(localStorage.getItem('user'));
        const roleAdmin = user.role;
        // ========================= End ===============================

        return {
            isAdmin: false,
            wireSizeEnabled: false,
            displayOrgProfile: this.displayOrganisationProfile(),

            // ============ Create Check for Tata Power User ===================
            tataPowerOrg: !isTataOrg(),
            tataProleAdmin: roleAdmin === 'ADMIN',
            // ========================= End ===================================
        };
    },
    mounted() {
        this.checkIsAdmin();
        this.checkWireSizeEnabled();
    },
    methods: {
        // to-do make a single method that accepts route name
        goToInventorySettings() {
            this.$router.push({ name: 'inventory' });
        },
        goToOrganisationProfile() {
            this.$router.push({ name: 'organisationSummary' });
        },
        goToOrganisationDefaults() {
            this.$router.push({ name: 'organisationDefaults' });
        },
        goToPricing() {
            this.$router.push({ name: 'pricing' });
        },
        goToAdmin() {
            this.$router.push({ name: 'admin' });
        },
        goToWireSizeCalculator() {
            this.$router.push({ name: 'wireSizeCalculator' });
        },
        async checkIsAdmin() {
            // to-do move to store
            const { user_id, role } = { ...JSON.parse(localStorage.getItem('user')) };
            // this.isAdmin = (await API.USERS.FETCH_USER(user_id)).data.role !== null;
            this.isAdmin = role !== null;
        },
        async checkWireSizeEnabled() {
            const { organisation_id } = { ...JSON.parse(localStorage.getItem('user')) };
            // added organisation id for UNIRAC
            // TODO: check based on the key from backend, for enabling WSC.
            if (organisation_id === 1
            || organisation_id === 2
            || organisation_id === 114) {
                this.wireSizeEnabled = true;
            }
            else {
                this.wireSizeEnabled = false;
            }
        },
        displayOrganisationProfile() {
            const admin = JSON.parse(localStorage.getItem('user')).role === 'ADMIN';
            return admin ? 'Organisation Profile' : '';
        },
    },
};
</script>

<style scoped>
.navBarRightButtons {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navBarRightButtons .navBarIcon {
    font-size: 1.25vw;
    border: none;
    background-color: inherit;
    color: white;
}
button {
    padding: 0px;
    cursor: pointer;
}
button:focus {
    outline: none;
}
</style>

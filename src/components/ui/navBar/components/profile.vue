<template>
    <div
        id="profile"
        class="navBarRightButtons">

        <el-dropdown
            trigger="click">
            <span class="el-dropdown-link">
                <button class="navBarIcon iconNavBar-profile"/>
            </span>
            <el-dropdown-menu slot="dropdown">

                <el-dropdown-item
                    @click.native = "goToSettings()">
                    Profile
                </el-dropdown-item>
                <el-dropdown-item
                    @click.native = "logout()">
                    Logout
                </el-dropdown-item>

            </el-dropdown-menu>
        </el-dropdown>


    </div>

</template>

<script>
import { mapActions } from 'pinia'
import { useAuthStore } from '../../../../stores/auth';

export default {
    name: 'Profile',
    data() {
        return {
            msg: 'I am in userProfile',
        };
    },
    methods: {
        ...mapActions(useAuthStore, [
            'LOGOUT',
            'LOGOUTSESSION'
        ]),
        goToSettings() {
            this.$router.push('/userProfile');
        },

        async logout() {
            try {
                await this.LOGOUT();
                this.$router.push({ name: "login" });
            } catch (e) {
                console.error(e);
            }
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


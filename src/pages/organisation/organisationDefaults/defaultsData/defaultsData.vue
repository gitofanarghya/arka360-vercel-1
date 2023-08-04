<template>
    <div
        id="defaultsData">
        <div class="defaultsWrapper">
            <span>
                {{ profileData.name }}
            </span>
            <div>
                <button
                    class="button-light-theme-icons"
                    @click="editProfile">
                    Edit
                </button>
                <button
                    class="button-light-theme-icons"
                    @click="deleteProfile">
                    Delete
                </button>
            </div>
        </div>
        <keep-alive>
            <component
                :is="currentComponent"
                :profile-data="profileData"/>
        </keep-alive>
    </div>
</template>

<script>

import { serverBus } from '../../../../main';
import PolygonDefaults from './polygons.vue';
import SmartroofDefaults from './smartroofs.vue';
import DormerDefaults from './dormer.vue';
import CylinderDefaults from './cylinders.vue';
import TreeDefaults from './trees.vue';
import InverterDefaults from './inverters.vue';
import ACDBDefaults from './acdb.vue';
import SubarrayDefaults from './subarray/subarray.vue';
import WalkwaysDefaults from './walkways.vue';
import AutoPanelPlacementDefaults from './settings/app.vue';
import GeneralDefaults from './settings/general.vue';
import LossesDefaults from './settings/losses.vue';
import ReportDefaults from './settings/report.vue';
import AcCableDefaults from './acCable.vue';


import API from '@/services/api';


    export default {
        name: 'defaultsData',
        props: ['profileData'],
        data() {
            return {
                msg: ' I am in defaultsData',
                currentComponent: GeneralDefaults,
            }
        },

        methods: { 
            async deleteProfile() {

                try {
                    await API.DEFAULTS_PROFILE.DELETE_PROFILE(this.profileData.id);
                    this.$message({
                        showClose: true,
                        message: 'Profile deleted successfully.',
                        type: 'success',
                        center: true
                    });
                    serverBus.$emit('profilesUpdated');

                    // fetching updated profiles
                    // this.fetchAllProfiles();


                } catch (e) {

                    this.$message({
                        showClose: true,
                        message: 'Error in deleting profile. Try again.',
                        type: 'error',
                        center: true
                    });

                }

            },

            editProfile() {
                serverBus.$emit('newEditProfileVisible', this.profileData, 'editProfile');
            },
        },

        components: {
			PolygonDefaults,
			TreeDefaults,
            CylinderDefaults,
            InverterDefaults,
            ACDBDefaults,
            WalkwaysDefaults,
            SubarrayDefaults,
            AutoPanelPlacementDefaults,
            GeneralDefaults,
            LossesDefaults,
            ReportDefaults,
            AcCableDefaults,
            SmartroofDefaults,
            DormerDefaults,
        },
		mounted() {
            serverBus.$on('component', (body) => {
				if (body === 'AC Cable') {
                    this.currentComponent = 'AcCableDefaults';
                }
                else {
                    this.currentComponent = body + 'Defaults';
                }
            });
		}, 
        watch: {
            profileData: function (newVal) {
                this.profileData = newVal;
            },
		},
    }

</script>

<style type="text/css" scoped>

button {
    color: #409eff;
    font-size: 12px;
    /* important overrirdes the one by button-light-theme-icons */
    margin-left: 10px !important;
}

#defaultsData {
    padding-left:10px;
    overflow-y: scroll;
    height: 100%;
}

#defaultsData .defaultsWrapper {
    display: flex;
    justify-content: space-between;
    padding: 0 0 20px 0;
    align-items: center;
}

</style>

<style lang="scss" scoped>
@import '../../../../styles/components/button';
</style>

<template>
    <div class="content_scroller">
        <div class="profile_container">
            <div class="tabs_section">
                <ul class="tabs_list">
                    <li :class="{active: mountType==='fixed'}" @click="mountType = 'fixed'">
                        <span class="subarray">Roof Mount </span>
                    </li>
                    <li :class="{active: mountType==='flush'}" @click="mountType = 'flush'">
                        <span class="subarray">Tilted Mount</span>
                    </li>
                    <li :class="{active: mountType==='eastWestRacking'}" @click="mountType = 'eastWestRacking'">
                        <span class="subarray">East West Racking</span>
                    </li>
                </ul>
            </div>
            <div v-if="mountType==='fixed'">
                <SubarrayFixedDefaults
                    :template-data="profileData.drawing_defaults.subarray.fixedMount"
                />
            </div>
            <div v-else-if="mountType === 'flush'">
                <SubarrayFlushDefaults
                    :template-data="profileData.drawing_defaults.subarray.flushMount"
                />
            </div>
            <div v-else>
                <SubarrayEastWestDefaults
                    :template-data="profileData.drawing_defaults.subarray.eastWestRacking" 
                />
            </div>
        </div>
    </div>
</template>

<script>

import SubarrayFixedDefaults from './subarrayFixedDefaults.vue';
import SubarrayFlushDefaults from './subarrayFlushDefaults.vue';
import SubarrayEastWestDefaults from './subarrayEastWestDefaults.vue';


export default {
    name: 'SubarrayDefaults',
    components: {
        SubarrayFixedDefaults,
        SubarrayFlushDefaults,
        SubarrayEastWestDefaults,
    },
    props: {
        profileData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            msg: ' I am in subarrayDefaults',
            mountType: 'fixed',
        };
    },
};

</script>
<style scoped>
.subarray {
    font-size: 16px !important;
}
</style>

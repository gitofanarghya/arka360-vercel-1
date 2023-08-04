<template>
    <div id="subarrayDefaults">
        <div style="margin-left: 18px;">
            <el-tabs>
                <el-tab-pane label="Roof Mount"> <subarrayTemplateDefaults
                    :template-data="profileData.drawing_defaults.subarray.fixedMount"
                    mount-type="fixed"/>
                </el-tab-pane>
                <el-tab-pane label="Tilted Mount"> <subarrayTemplateDefaults
                    :template-data="profileData.drawing_defaults.subarray.flushMount"
                    mount-type="flush"/>
                </el-tab-pane>
                <el-tab-pane label="East West Racking"> <subarrayTemplateDefaults
                    :template-data="profileData.drawing_defaults.subarray.eastWestRacking"
                    mount-type="eastWestRacking"/>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>

import subarrayTemplateDefaults from './subarrayTemplatesDefaults.vue';

export default {
    name: 'SubarrayDefaults',
    components: {
        subarrayTemplateDefaults,
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
        };
    },
};

</script>

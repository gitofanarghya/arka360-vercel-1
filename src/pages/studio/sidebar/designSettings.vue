<template>
    <div id="designSettings">
        <newEditProfile/>
        <button
            id="design_summary_button"
            :disabled="!designSettingsEnabled"
            class="iconLeftSideBar-design-settings button-sidebar-icons"
            @click="openNewEditDialog"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { serverBus } from '../../../main';
import newEditProfile from '../../organisation/organisationDefaults/newEditProfile.vue';
import { useDesignStore } from '../../../stores/design';
import { useStudioSideBarStore } from '../../../stores/studio-sideBar';


export default {
    name: 'DesignSettings',
    components: {
        newEditProfile,
    },
    data() {
        return {
        };
    },
    computed: {
        ...mapState(useStudioSideBarStore, {
            designSettingsEnabled: state => state.designSettingsEnabled,
        }),
        ...mapState(useDesignStore, {
            designSettingsData: 'GET_DESIGN_VERSION_SETTINGS',
        }),
    },
    mounted() {
        this.$mousetrap.bind('mod+alt+,', () => {
            if (this.designSettingsEnabled) this.openNewEditDialog();
        });

        // from studio
        // serverBus.$on('designVersionSettingsData', (data) => {
        //     this.designSettingsData = JSON.parse(JSON.stringify(data));
        // });

        // serverBus.$on('designVersionSettingsUpdated', (designSettings) => {
        //     this.designSettingsData = JSON.parse(JSON.stringify(designSettings));
        // });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('mod+alt+,');
    },
    methods: {
        openNewEditDialog() {
            //next line is just temporary fix for development, should not go live, data to be added from backend.
            // this.designSettingsData.drawing_defaults.subarray.eastWestRacking = this.designSettingsData.drawing_defaults.subarray.fixedMount;
            serverBus.$emit(
                'newEditProfileVisible',
                this.designSettingsData,
                'designVersionSettings',
            );
        },
        confirmOnClickAction() {
            this.dialogFormVisible = false;
            this.submitForm('designSettingsData');
        },
        cancelOnClickAction() {
            this.dialogFormVisible = false;
            this.resetForm('designSettingsData');
        },
        submitForm(formName) {
            this.$refs[formName].validate(valid => valid);
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
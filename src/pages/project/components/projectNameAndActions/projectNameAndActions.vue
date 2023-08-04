<template>
    <div id="projectNameAndActions">
        <div class="projectSummaryHeading">
            <button
                class="el-icon-arrow-left icon_size_header"
                style="cursor:pointer; left: -40px; position: absolute;"
                @click="goToHomePage"/>
            <div class="page-header">{{ projectInformation.projectName }}</div>
        </div>
        <div style="display: flex">
                                  <el-tooltip
                            content="Delete Project"
                            placement="bottom"
                            popper-class="navBarToolTip">
            <button
                :disabled="!isCurrentUserAllowedToEdit"
                class="el-icon-delete button-light-theme-icons page-header-icons"
                @click="deleteProject"/>
                                  </el-tooltip>
                       <el-tooltip
                            content="Share Project"
                            placement="bottom"
                            popper-class="navBarToolTip">
            <button
                :disabled="!isCurrentUserAllowedToEdit"
                class="el-icon-share button-light-theme-icons page-header-icons"
                @click="shareDialogBoxVisible = true"/>
                       </el-tooltip>
        </div>
       <shareProject :shareDialogBoxVisible.sync="shareDialogBoxVisible" :project_id="projectId" />
    </div>
</template>

<script>

import API from '@/services/api/';
import shareProject from './shareProject.vue';
import homeRedirectionMixin from '@/pages/homeRedirectionMixin';
import { mapState } from 'pinia';
import { useProjectStore } from '../../../../stores/project';

export default {
    name: 'ProjectInformationNameAndActions',
    components: {
        shareProject,
    },
    data() {
        return {
            projectId: this.$route.params.projectId,
            shareDialogBoxVisible: false,
        };
    },
    mixins: [homeRedirectionMixin],
    computed: {
        ...mapState(useProjectStore, {
            projectInformation: 'GET_PROJECT_INFORMATION',
            isCurrentUserAllowedToEdit: 'GET_USER_PERMISSION',
        }),
    },
    methods: {
        async deleteProject() {
            const answer = window.confirm('Are you sure you want to delete the project?');

            if (answer) {
                try {
                    await API.PROJECTS.DELETE_PROJECT(this.projectId);

                    this.$message({
                        showClose: true,
                        message: 'Project deleted successfully.',
                        type: 'success',
                        center: true
                    });

                    this.$router.push({ name: 'home' });
                }
                catch (e) {
                    this.$message({
                        showClose: true,
                        message: 'Error deleting project. Try again.',
                        type: 'error',
                        center: true
                    });
                    console.error();
                }
            }
        },

        goToHomePage() {
           this.redirectToHomeBasedOnCountry();
        },
    },
};
</script>

<style scoped>
    .page-header-icons {
        color: #707070;
    }

    .icon_size_header {
        font-size: 30px;
        cursor:pointer;
        outline: none;
        border: transparent;
        background-color: transparent;
        margin-left: -15px;
    }

    .icon_size_header:hover {
        font-weight: bold;
    }

    .projectSummaryHeading {
        display: flex; 
        align-items: center; 
        position: relative; 
        margin: 0 0 10px 0
    }

</style>

<style lang="scss" scoped>

    @import '../../../../styles/pages/project-design-pages';
    @import '../../../../styles/components/button';

</style>

<template>
    <div id="integration">
        <newProjectDialog
            :is-new-project-form-visible.sync="isNewProjectFormVisible"
            is-integration/>
    </div>
</template>

<script>
import newProjectDialog from '@/components/ui/newProject/newProject.vue';
import { mapState, mapActions } from "pinia";
import { useIntegrationStore } from '../../stores/integration';

export default {
    name: 'Integration',
    components: {
        newProjectDialog,
    },
    props: {
        isRedirectedFromLoginPage: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isNewProjectFormVisible: false,
        };
    },
    computed: {
        ...mapState(useIntegrationStore, [
            'IS_INTEGRATION',
        ]),
    },
    async mounted() {
        if (!this.IS_INTEGRATION) {
            this.$router.push({ name: 'home' });
        }
        else if (!this.isRedirectedFromLoginPage) {
            this.$router.replace({ query: {} });
            const doesProjectExist = await this.checkProjectExistAndSetId();
            if (doesProjectExist) {
                this.routeToProjectSummary();
                this.removeProjectDataFromSessionStorage();
            }
            else {
                this.openNewProjectForm();
            }
        }
        else {
            this.openNewProjectForm();
        }
    },
    methods: {
        ...mapActions(useIntegrationStore, {
            removeProjectDataFromSessionStorage: 'REMOVE_PROJECTDATA_FROM_SESSION_STORAGE',
            routeToProjectSummary: 'ROUTE_TO_PROJECT_SUMMARY',
            checkProjectExistAndSetId: 'CHECK_PROJECT_EXIST_AND_SET_ID',
        }),
        openNewProjectForm() {
            this.isNewProjectFormVisible = true;
        },
    },
};

</script>

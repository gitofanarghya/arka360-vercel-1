import { defineStore } from 'pinia'
import API from '../services/api';

export const useIntegrationStore = defineStore('integration', {
    state: () => {
        return {
            projectData: null,
            projectId: null,
        }
    },
    getters: {
        IS_INTEGRATION: state => state.projectData !== null,
    },
    actions: {
        async CHECK_PROJECT_EXIST_AND_SET_ID() {
            // eslint-disable-next-line camelcase
            const { source_id, source } = { ...this.projectData };
            const projectData = (await API.PROJECTS.FETCH_PROJECT_DETAILS(source_id, source)).data.results;
            const projectExists = projectData.length > 0;
            if (projectExists) {
                this.projectId = projectData[0].id;
            }
            return projectExists;
        },
        SET_PROJECTDATA_FROM_SESSION_STORAGE() {
            this.projectData = JSON.parse(sessionStorage.getItem('projectData'));
        },
        REMOVE_PROJECTDATA_FROM_SESSION_STORAGE() {
            sessionStorage.removeItem('projectData');
            this.projectData = null;
        },
        ROUTE_TO_PROJECT_SUMMARY() {
            router.push({ name: 'projectSummary', params: { projectId: this.projectId } });
        },
    }
})
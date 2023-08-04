import axios from 'axios';

export default {
    async FETCH_API_GOOGLE_MAP_PROJECTS() {
        return axios.get('/api/project-lat-lng/');
    },
    async FETCH_API_GOOGLE_MAP_PROJECTS_QUERY(query) {
        return axios.get('/api/project-lat-lng/?query=' + query);
    },
    async FETCH_ALL_PROJECTS() {
        return axios.get('/api/projects.json/');
    },

    SEARCH_ALL_PROJECTS(query) {
        return axios.get(`/api/projects/?query=${query}`);
    },

    LOAD_MORE_PROJECTS(url) {
        return axios.get(url);
    },

    FETCH_PROJECT(id) {
        if(id) {
            return axios.get(`/api/projects/${id}/`);
        }
    },

    POST_PROJECT(postData) {
        return axios.post('/api/projects/', postData);
    },

    PATCH_PROJECT(id, patchData) {
        return axios.patch(`/api/projects/${id}/`, patchData);
    },

    DELETE_PROJECT(id) {
        return axios.delete(`/api/projects/${id}/`);
    },

    FETCH_PROJECT_PERMISSIONS(id) {
        return axios.get(`/api/projects/${id}/permissions/`);
    },

    POST_PROJECT_PERMISSIONS(id, postData) {
        return axios.post(`/api/projects/${id}/permissions/`, postData);
    },
    PATCH_PROJECT_PERMISSIONS(id, postData) {
        return axios.patch(`/api/projects/${id}/permissions/`, postData);
    },

    FETCH_PROJECT_MAP_IMAGE(id) {
        if (id !== null) {
            return axios.get(`/api/project-map-images/${id}/`);
        }
        return null;
    },

    FETCH_ALL_PREVIOUS_IMAGES(id) {
        return axios.get(`/api/projects/${id}/map_images/`);
    },

    POST_CURRENT_STUDIO_IMAGE(projectID, postImageObject) {
        return axios.post(`/api/projects/${projectID}/map_images/`, postImageObject);
    },

    PATCH_IMAGE_TRANSFORMATIONS(projectId, transformationsData) {
        return axios.patch(`/api/projects/${projectId}/map_images/`, transformationsData);
    },

    PATCH_WEATHER_STATION(projectID, patchData) {
        return axios.patch(`api/projects/${projectID}/`, patchData);
    },

    // eslint-disable-next-line camelcase
    FETCH_PROJECT_DETAILS(source_id, import_source) {
        return axios.get('api/projects/', {
            params: {
                source_id,
                import_source,
            },
        });
    },
    FETCH_AVAILED_FEATURES(projectId){
        return axios.get(`api/features/availed/?project_id=${projectId}`);
    },
    UPGRADE_PROJECT_FEATURES(patchData){
        return axios.post(`api/features/`,patchData);
    },
    FETCH_PROJECT_PERMISSIONS_FOR_LEAD(projectId){
        return axios.get(`/api/projects/${projectId}/user_permissions/`);
    }
};

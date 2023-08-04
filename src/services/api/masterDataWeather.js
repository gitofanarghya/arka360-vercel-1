import axios from 'axios';

export default {

    FETCH_SELECTED_STATION(weatherId) {
        return axios.get(`api/master-data/weather/${weatherId}/`);
    },

    PATCH_LATEST_WEATHER_FILE(Id) {
        return axios.patch(`api/projects/${Id}/update_to_meteonorm/`);
    },
    PATCH_LATEST_NSRDB_WEATHER_FILE(Id) {
        return axios.patch(`api/projects/${Id}/update_to_nsrdb/`);
    },
    GET_SORTED_WEATHER_FILES(lat, lon) {
        return axios.get(`api/master-data/weather/get_sorted_weather_files/?latitude=${lat}&longitude=${lon}`);
    },
    PATCH_MASTER_WEATHER_DATA(id, patchData) {
        return axios.patch(`api/master-data/weather/${id}/`, patchData);
    },
    UPLOAD_WEATHER_FILE(postData) {
        return axios.post('api/master-data/weather/', postData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    GET_PROCESSED_FILE(url) {
        // Temporary solution to remove custom headers from single instance of axios.
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const token = user.token || null;
        delete axios.defaults.headers.common.Authorization;
        const response = axios.get(url);
        axios.defaults.headers.common.Authorization = `Token ${token}`;
        return response;
    },
    PATCH_LATEST_PVGIS_WEATHER_FILE(Id) {
        return axios.patch(`api/projects/${Id}/update_to_pvgis/`);
    },
};
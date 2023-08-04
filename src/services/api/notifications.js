import axios from 'axios';

export default {
    GET_ALL_NOTIFICATIONS(queries) {
        let queryString = new URLSearchParams(queries).toString()
        return axios.get(`/api/notification/?${queryString}`)
    },
    GET_NOTIFICATION_SETTINGS(organisationId) {
        return axios.get(`/api/notification/${organisationId}/setting/`)
    },
    UPDATE_NOTIFICATION_SETTINGS(organisationId , newSettings) {
        return axios.patch(`/api/notification/${organisationId}/setting/`, newSettings)
    }
}
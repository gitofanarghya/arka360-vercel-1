import axios from "axios";
import { lidarTiltApi } from "../../constants";

export default {
    GET_LIDAR_DATA(projectId, postData) {
        return axios.post(`/api/projects/${projectId}/nearmap_data/`, postData);
    },
    GET_FACE_TILT_USING_CONTOUR(designId, postData) {
        return axios.post(`${lidarTiltApi}/api/get_tilt?design_id=${designId}`, postData);
    }
};
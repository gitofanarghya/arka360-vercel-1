import axios from "axios";

export default {
  FETCH_EAGLEVIEW_MAP(projectId) {
    return axios.get(`/api/projects/${projectId}/eagleview_image/`);
  },
  FETCH_NEARMAP_MAP(projectId, postData) {
    return axios.post(`/api/projects/${projectId}/nearmap_image/`, postData);
  },
  FETCH_ALL_MAP_IMAGES(designId) {
    return axios.get(`/api/design-map-images/?design=${designId}`);
  },
  POST_MAP_IMAGE(postData) {
    return axios.post(`/api/design-map-images/`, postData);
  },
  DELETE_MAP_IMAGE(imageId) {
    return axios.delete(`/api/design-map-images/${imageId}/`);
  },
  PATCH_MAP_IMAGE(imageId, postData) {
    return axios.patch(`/api/design-map-images/${imageId}/`, postData);
  },
  UPDATE_MAP_DATA(designId, postData) {
    return axios.patch(`/api/designs/${designId}/map_data/`, postData);
  },
  GET_MAP_IMAGES_REFID(reference_id){
    return axios.get(`/api/reference-map-images/${reference_id}/`);
  }
};
import axios from 'axios';
import { GOOGLE_API_KEY } from "../../constants"
import { replaceGoogleApiKeyInUrl } from "@/utils.js"
import API from "@/services/api/";
let environment = import.meta.env.VITE_APP_ENVIRONMENT;

// Maybe Jugaad - Replacing the API key in the image URL with the newer API key.
// We're doing this because the old API Key has expired, but it has been hardcoded in the database
// and it needs to be replaced with the new API key.
function modifyGoogleAPIkeyInResponse(resp) {
    let imageURL = resp && resp.data && resp.data.versions && resp.data.versions.scene
                   && resp.data.versions.scene.imageURL
    if (imageURL && imageURL.includes('&key=')) {
        let newUrl = replaceGoogleApiKeyInUrl(imageURL)
        resp.data.versions.scene.imageURL = newUrl
    }
    return resp
}

export default {
    SHARE_PROPOSAL_EMAIL(postData) {
        return axios.post(`/designs/send_email`, postData);
    },

    FETCH_WEB_PROPOSAL_DATA(id) {
        return axios.get(`/api/designs/${id}/report_data/`);
        // return axios.get(`/api/designs/31502/reportData/`);
        // return axios.get(`https://devapi.thesolarlabs.com:8004/api/designs/${id}/reportData`);
        // return axios.get(`https://devapi.thesolarlabs.com:8004/api/designs/31502/reportData`);
    },
    FETCH_WEB_PROPOSAL_DATA_BY_REFRENCE_ID(refId) {
        return axios.get(`/api/report/${refId}/report_data/`);
        // return axios.get(`/api/designs/31502/reportData/`);
        // return axios.get(`https://devapi.thesolarlabs.com:8004/api/designs/${id}/reportData`);
        // return axios.get(`https://devapi.thesolarlabs.com:8004/api/designs/31502/reportData`);
    },

    CANCEL_REVISION(id, patchData) {
        return axios.patch(`/api/request-expert-services/${id}/cancel_revision/`, patchData);
    },

    REQUEST_REVISION_DATA_TO_BACKEND(id, patchData){
        return axios.patch(`/api/request-expert-services/${id}/revision/`, patchData);
    },
    CANCEL_ORDER(id, patchData){
        return axios.patch(`/api/request-expert-services/${id}/cancel/`, patchData);
    },
    PAYMENT_FOR_3DMODEL(postData){
        return axios.post(`/api/request-expert-services/`,postData);
        // return axios.get(`/api/projects/services_payment/`);
    },
    CONFIRM_PAYMENT_FROM_BACKEND(postData){
        return axios.post(`/api/request-expert-services/verify_payment/`,postData);
    },

    async FETCH_DESIGN(id, generation = false) {
        let resp, bifacialResponse, is_bifacial_enabled;
        if(environment == 'prod'){
            bifacialResponse = await API.DESIGNS.FETCH_BIFACIAL_INFO(id);
            is_bifacial_enabled = bifacialResponse.data.is_bifacial_enabled;
        }
        if(environment=='prod' && is_bifacial_enabled ){
            if (generation) {
                resp = await axios.get(`https://betaapi.thesolarlabs.com/api/designs/${id}/?format=json&generation=${generation}`);
            } else {
                resp = await axios.get(`https://betaapi.thesolarlabs.com/api/designs/${id}/?format=json`);
            }
            resp = modifyGoogleAPIkeyInResponse(resp)
            return resp
        }

        if (generation) {
            resp = await axios.get(`/api/designs/${id}/?format=json&generation=${generation}`);
        } else {
            resp = await axios.get(`/api/designs/${id}/?format=json`);
        }
        resp = modifyGoogleAPIkeyInResponse(resp)
        return resp
    },

    GENERATE_DETAILED_BOM(id){
        return axios.get(`/api/designs/${id}/generate_detailed_bom/`);
    },

    UPDATE_SUMMARY_DATA(id,data){
        return axios.post(`/api/designs/${id}/updatebom_systemParameters/`,data);
    },

    UPDATE_BILL_OF_MATERIAL(id,data){
        return axios.post(`/api/designs/${id}/updatebom_customerOrderDetails/`,data);
    },

    UPDATE_AC_CABLE_LENGTH(id,data){
        return axios.post(`/api/designs/${id}/updatebom_acCableLength/`,data);
    },

    POST_NEW_CUSTOM_ITEM(id,postData){
        return axios.post(`/api/designs/${id}/updatebom_addCustomItem/`,postData);
    },

    UPDATE_GENERATE_DETAILED_BOM(id,postData){
        return axios.post(`/api/designs/${id}/generate_detailed_bom/`,postData);
    },

    CACHE_SOLAR_ACCESS(id) {
        return axios.get(`/api/designs/${id}/solar_access/`);
    },
    GET_HEAT_MAP(id) {
        return axios.get(`/api/designs/${id}/calculate_heat_map/`);

    },
    GET_ORGANISATION(id) {
        return axios.get(`/api/organisations/${id}/`)
    },

    async UPDATE_DESIGN_NAME(id, patchdata) {
        let resp = await axios.patch(`/api/designs/${id}/`, patchdata);
        resp = modifyGoogleAPIkeyInResponse(resp)
        return resp
    },

    async FETCH_PROJECT_DESIGN_NAME(id) {
        let resp = await axios.get(`/api/designs/${id}/`);
        resp = modifyGoogleAPIkeyInResponse(resp)
        return resp
    },

    async FETCH_NEW_DESIGN_VERSION(id) {
        let resp = await axios.get(`/api/designs/${id}/?new=true`);
        resp = modifyGoogleAPIkeyInResponse(resp)
        return resp
    },

    FETCH_AUTO_CAD(id) {
        return axios.get(`/api/designs/${id}/autocad/`);
    },
    export_to_heaven_solar(id) {
        return axios.get(`/api/designs/${id}/export_to_heaven_solar/`);
    },

    FETCH_GENERATION_CSV(id) {
        return axios.get(`api/designs/${id}/generation_csv/`);
    },

    FETCH_REPORT(id, selectedPages) {
        return axios.get(`api/designs/${id}/report/?pages=${selectedPages}`);
    },

    FETCH_DWG_PROPS(id) {
        let response = axios.get(`/api/designs/${id}/get_autocad_dwg_data/`);
        return response;
    },

    DUPLICATE_DESIGN(id, designName) {
        return axios.post(`/api/designs/${id}/duplicate/`, {
          'designName': designName,
        });
    },

    DELETE_DESIGN(id) {
        return axios.delete(`/api/designs/${id}/`);
    },

    FETCH_DESIGN_LAYOUT(id) {
        return axios.get(`/api/designs/${id}/layout/`);
    },

    CREATE_NEW_DESIGN(postData) {
        return axios.post('/api/designs/', postData);
    },

    FETCH_INVERTER_STRINGING_INFO(id, inverterData) {
        if (id && window.location.href.indexOf("stage") == -1) {
            return axios.post(`/api/designs/${id}/string_length/`, inverterData);
        }
    },

    FETCH_SURVEY_INFO(projectIdObj) {
        return axios.post('/api/request-expert-services/sitesurvey/', projectIdObj);
    },

    POST_DESIGN_SERVICE_INFO(postData){
        return axios.post(`/api/request-expert-services/`, postData);
    },

    GET_BATTERY_MANUFACTURER_DATA() {
        return axios.get(`/api/battery-manufacturers/`)
    },

    GET_BATTERY_MODEL_DATA() {
        return axios.get(`/api/battery/`)
    },

    GET_LIST_OF_BATTERIES_FROM_MANUFACTURER(manufacturerId) {
        return axios.get(`/api/battery/?manufacturer=${manufacturerId}`)
    },

    GET_BATTERY_DETAILS(id){
        return axios.get(`/api/designs/${id}/get_battery_details/`)
    },

    SAVE_BATTERY_DETAILS(id, patchData) {
        return axios.patch(`/api/designs/${id}/add_battery/`, patchData)
    },

    CALCULATE_BATTERY_BACKUP(id, patchData) {
        return axios.patch(`api/designs/${id}/calculate_backup/`, patchData)
    },

    CALCULATE_MIN_BATTERY_CAPACITY(id, patchData) {
        return axios.patch(`api/designs/${id}/calculate_tou/`, patchData)
    },

    DELETE_BATTERY(id) {
        return axios.patch(`api/designs/${id}/delete_battery/`)
    },

    REQUEST_3D_VIDEO_OF_DESIGN(id) {
        return axios.get(`api/designs/${id}/get_3d_video/`)
    },

    /**
     * @return {string}
     */
    FETCH_STATIC_LAYOUT_IMAGE(latitude, longitude, zoom, width, height) {
        return "https://maps.googleapis.com/maps/api/staticmap?center=" +
            latitude.toString() +
            "," +
            longitude.toString() +
            "&scale=2&zoom=" +
            zoom.toString() +
            "&maptype=satellite&size=" +
            width.toString() +
            "x" +
            height.toString() +
            "&key=" + 
            GOOGLE_API_KEY;
    },

    POST_USER_DETAILS_INFO(id,postData){
        return axios.post(`/api/design-version-documents/${id}/create_loan/`, postData);
    },
    FETCH_BIFACIAL_INFO(designId){
       return axios.get(`/designs/get_bifacial_info/?design_id=${designId}`)
    }
};
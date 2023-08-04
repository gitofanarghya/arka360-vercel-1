import { defineStore } from 'pinia'
import API from '../services/api';
import { METERING_TYPES } from "../pages/constants"
import currencySymbolName from "../pages/currency-symbol-name-map"
import { getProjectImageUrl } from '../utils';

export const useProjectStore = defineStore('project', {
    state: () => {
        return {
            id: null,
            client_address: '',
            client_email_id: '',
            client_name: '',
            client_phone: '',
            created_at: '',
            created_by: {
                email: '',
                first_name: '',
                id: null,
                last_name: '',
            },
            consumption_details: {
                average_price_per_unit: 0,
                id: null,
                monthly_units: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                project: null,
                tariff_escalation_rate: 0,
                averageMonthlyConsumption: 0,
                annual_consumption: 0,
                zero_export_enabled: false,
            },
            consumption_profile: 0,
            consumption: 0,
            geo_image: null,
            geo_image_thumbnail: null,
            latitude: null,
            longitude: null,
            name: '',
            organisation: null,
            zoom: '18',
            country: 91,
            country_details: {
                conversion_factor: '',
                country_code: '',
                currency: '',
                currency_code: '',
                id: '',
                name: '',
            },
            isCurrentUserAllowedToEdit: false,
            designs: [],
            weather: null,
            quota_type: null,
            AHJCode:'',
            AHJName:'',
            BuildingCode:'',
            ElectricCode:'',
            FireCode:'',
            Level:'',
            ResidentialCode:'',
            projectType: null,
            features:{},
            type_of_rate:'tou',
            site_survey_token: null,
            permissionForLeadObject:{},
            isDesignListChanged:false

        }
    },
    getters: {
        GET_PROJECT_INFORMATION: ({
            id, name, client_name: clientName, client_email_id: clientEmail, client_phone: clientPhone,
            created_at: createdAt, client_address: clientAddress, created_by: createdBy,
            latitude, longitude, weather, quota_type: quotaType, country,
            country_details: countryDetails, project_type, type_of_rate, site_survey_token,
        }) => ({
            id,
            projectName: name,
            clientName,
            clientEmail,
            clientPhone,
            createdAt: createdAt.split('T')[0],
            clientAddress,
            createdBy: `${createdBy.first_name} ${createdBy.last_name}`,
            latitude,
            longitude,
            weather,
            quotaType,
            country,
            country_details: countryDetails,
            project_type,
            type_of_rate,
            site_survey_token,
        }),
    
        GET_PROJECT_IMAGE_URL: (state) => {
            if (state.geo_image_thumbnail !== null) {
                return state.geo_image_thumbnail;
            }
            if (state.latitude !== null && state.longitude !== null) {
                return getProjectImageUrl(state.latitude, state.longitude, state.zoom);
            }
            return '';
        },
    
        GET_PROJECT_IMAGE_HREF: (state) => {
            if (state.latitude !== null && state.longitude !== null) {
                return `https://www.google.com/maps/@?api=1&map_action=map&center=${
                    state.latitude},${state.longitude}&zoom=${state.zoom}&basemap=satellite&layer=transit`;   
            }
            return '';
        },
    
        GET_PROJECT_CONSUMPTION_DETAILS: (state) => {
            let averageMonthlyUnitConsumption = 0;
            if (state.consumption_details.monthly_units !== null) {
                let total = 0;
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < state.consumption_details.monthly_units.length; i++) {
                    total += state.consumption_details.monthly_units[i];
                }
                averageMonthlyUnitConsumption = total / 12;
            }
            return {
                id: state.consumption_details.id,
                project: state.consumption_details.project,
                average_price_per_unit: state.consumption_details.average_price_per_unit || 0,
                annual_consumption: state.consumption_details.annual_consumption || 0,
                tariff_escalation_rate: state.consumption_details.tariff_escalation_rate || 0,
                average_export_price_per_unit: state.consumption_details.average_export_price_per_unit || 0,
                metering_type: state.consumption_details.metering_type || METERING_TYPES.NET_METERING,
                averageMonthlyConsumption: averageMonthlyUnitConsumption,
                utility_details : state.consumption_details.utility_details,
                zero_export_enabled: state.consumption_details.zero_export_enabled,
                utility_tariff_details : state.consumption_details.utility_tariff_details,
                estimated_energy_consumption:state.consumption_details.estimated_energy_consumption || 0,
                critical_load:state.consumption_details.critical_load || 0,
            };
        },
        GET_TYPE_OF_RATE:(state)=>{
            return state.type_of_rate;
        },
        GET_AHJ_DETAILS: (state) => {
            return {
                AHJCode : state.AHJCode,
                AHJName : state.AHJName,
                BuildingCode : state.BuildingCode,
                ElectricCode : state.ElectricCode,
                FireCode : state.FireCode,
                Level: state.Level,
                ResidentialCode : state.ResidentialCode,
            }
        },
        GET_PROJECT_UTILITY_DETAILS: (state)=>{
            return state.consumption_details.utility_details;
        },
        GET_PROJECT_UTILITY_TARIFF_DETAILS: (state)=>{
            return state.consumption_details.utility_tariff_details;
        },
        GET_CONSUMPTION_DETAILS: (state)=>{
            return state.consumption_details;
        },
        GET_DESIGNS_DETAILS: state => state.designs,
    
        GET_USER_PERMISSION: state => state.isCurrentUserAllowedToEdit,
    
        GET_DESIGNS_COUNT: state => state.designs.length,
    
        GET_PROJECT_TYPE: state => state,
    
        GET_CURRENCY_SYMBOL: state => currencySymbolName[state.country_details.currency_code] || state.country_details.currency_code,
    
        GET_TOTAL_FEATURES : state => state.features,
        
        GET_COUNTRY_DETAILS : state => state.country_details,

        GET_PERMISISON_OBJECT : state => state.permissionForLeadObject,
    },
    actions: {
        async GET_CURRENT_PROJECT(projectID) {
            try {
                const response = await API.PROJECTS.FETCH_PROJECT(
                    projectID,
                );
                this.SET_CURRENT_PROJECT(response.data);
            }
            catch (e) {
                throw e;            
            }
        },
    
        async UPDATE_PROJECT_INFORMATION(payload) {
            try {
                const response = await API.PROJECTS.PATCH_PROJECT(this.id, payload);
                this.SET_CURRENT_PROJECT(response.data);
            } catch (e) {
                throw e;
            }
        },
    
        async UPDATE_PROJECT_CONSUMPTION_DETAILS(payload) {
            try {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                await API.PROJECT_CONSUMPTION_DETAILS.PATCH_CONSUMPTION_DETAILS(this.consumption_details.id, payload);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                await this.GET_CURRENT_PROJECT(this.id);
            } 
            catch (e) { 
                throw e;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
        },
        async FETCH_PERMISSION_OBJECT(projectId){
            try {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                const response = await API.PROJECTS.FETCH_PROJECT_PERMISSIONS_FOR_LEAD(projectId);
                this.SET_PERMISSION_OBJECT(response.data);
            } 
            catch (e) { 
                throw e;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
            }                
            
        },

        UPDATE_WEATHER_ID(payload) {
            this.weather = payload.weatherID !== undefined ? payload.weatherID : this.weather;
        },
        UPDATE_ALL_AVAILABLE_FEATURES(featureJson){
            this.features = {... featureJson};
        },
        SET_PERMISSION_OBJECT(payload){
            this.permissionForLeadObject = payload
        },
        SET_CURRENT_PROJECT(payload) {
            this.id = payload.id;
            this.name = payload.name;
            this.client_address = payload.client_address;
            this.client_email_id = payload.client_email_id;
            this.client_name = payload.client_name;
            this.client_phone = payload.client_phone;
            this.consumption_details = payload.consumption_details;
            this.consumption_profile = payload.consumption_profile;
            this.consumption = payload.consumption;
            this.geo_image = payload.geo_image;
            this.geo_image_thumbnail = payload.geo_image_thumbnail;
            this.latitude = payload.latitude;
            this.longitude = payload.longitude;
            this.organisation = payload.organisation;
            this.zoom = payload.zoom;
            this.country = payload.country;
            this.country_details = payload.country_details;
            this.designs = payload.designs;
            this.created_at = payload.created_at;
            if (typeof payload.created_by === 'object') {
                this.created_by = payload.created_by;
            }
            this.weather = payload.weather;
            this.quota_type = payload.quota_type;
            this.AHJCode = payload.AHJCode;
            this.AHJName = payload.AHJName;
            this.BuildingCode= payload.BuildingCode;
            this.ElectricCode = payload.ElectricCode;
            this.FireCode = payload.FireCode;
            this.Level = payload.Level;
            this.ResidentialCode = payload.ResidentialCode;
            this.project_type = payload.project_type;
            this.features = {...payload.features};
            this.type_of_rate = payload.type_of_rate;
            this.site_survey_token = payload.site_survey_token;
        },
        SET_USER_PERMISSION(payload) {
            this.isCurrentUserAllowedToEdit = payload;
        },
        CHANGE_DESIGN_LIST(){
            console.log("design list changed",this.isDesignListChanged)
            this.isDesignListChanged = ! this.isDesignListChanged;
        },
        UPDATE_SITE_SURVEY_TOKEN(value) {
            this.site_survey_token = value;
        }
        
    }
})
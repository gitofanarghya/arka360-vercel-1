import { defineStore } from 'pinia'
import { GOOGLE_API_KEY, defaultModuleId, GOOGLE_SIGNING_SECRET } from '../constants';
import { useProjectStore } from './project';
import { METRIC_SYSTEM_UNIT } from '../components/ui/length/constants';
import API from '../services/api';
import _ from "lodash"
import {
    TOP_HEIGHT_LOCKED,
    SUBARRAY_RACK_STYLE_FIXED,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
    PANEL_ORIENTATION_PORTRAIT,
} from '../core/coreConstants';
import { signRequest } from '../core/utils/utils';
import {useMapImagesStore} from './mapImages';
import { reportPagesListNonUs } from '../utils';
import currencySymbolName from "../pages/currency-symbol-name-map"

const checkedPagesCopy = reportPagesListNonUs.map(page => page.label)

function getInitialState() {
    return {
        id: null,
        name: null,
        is_exported_heaven_solar: false,
        request_expert_service: {},
        pricing: [],
        incentives:[],
        annual_generation: null,
        project: {
            id: null,
            name: '',
            latitude: null,
            longitude: null,
            zoom: null,
            geo_image: null,
            geo_image_thumbnail: null,
            weather: null,
            currency_code: 'INR',
            AHJCode: null,
            AHJName: null,
            BuildingCode: null,
            ElectricCode: null,
            FireCode: null,
            Level: null,
            ResidentialCode: null,
            features:{},
        },
        studioMapImage: null,
        versions: {
            id: null,
            overviewMode: false,
            design: null,
            reference_id: null,
            layout_image: null,
            studio_map_id: null,
            scene: null,
            summary: {},
            setting: {
                id: null,
                constant_losses: {
                    ac: {
                        ac_ohmic: 1,
                        unavailability: 0,
                    },
                    dc: {
                        lid: 1.5,
                        dc_ohmic: 1,
                        irradiance: 3,
                        mismatch: 1.5,
                        temperature: 8,
                    },
                    irradiance: {
                        iam: 1.5,
                        shading: 2,
                        soiling: 3.5,
                    },
                    module_degradation_rate: 1.5,
                    inverter_efficiency: 96,
                    derating_factor: 0.35,
                },
                default_solar_access_threshold: 95,
                default_table_types: [
                    {
                        mountHeight: 1,
                        tableSizeUp: 1,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        panelOrientation: 'Portrait',
                        moduleSpacingWide: 0.025,
                    },
                    {
                        mountHeight: 1,
                        tableSizeUp: 1,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        panelOrientation: 'Landscape',
                        moduleSpacingWide: 0.025,
                    },
                    {
                        mountHeight: 1,
                        tableSizeUp: 2,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        panelOrientation: 'Portrait',
                        moduleSpacingWide: 0.025,
                    },
                    {
                        mountHeight: 1,
                        tableSizeUp: 2,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        panelOrientation: 'Landscape',
                        moduleSpacingWide: 0.025,
                    },
                ],
                distance_unit: 'meters',
                shadows: {
                    high_resolution_shadows: false,
                },
                drawing_defaults: {
                    polygonModel: {
                        azimuth: 180,
                        coreHeight: 2,
                        ignored: false,
                        parapetHeight: 0,
                        parapetThickness: 0.3,
                        placable: true,
                        heatMapThreshold: 100,
                        setbackInside: 0.5,
                        setbackOutside: 0.5,
                        tilt: 0,
                        lockedParameter: TOP_HEIGHT_LOCKED,
                        obstruction: 'None',
                    },
                    cylinderModel: {
                        tilt: 0,
                        azimuth: 180,
                        ignored: false,
                        placable: true,
                        heatMapThreshold: 100,
                        coreHeight: 2,
                        parapetHeight: 0,
                        setbackInside: 0.5,
                        setbackOutside: 0.5,
                        parapetThickness: 0.3,
                        lockedParameter: TOP_HEIGHT_LOCKED,
                        obstruction: 'None',

                    },
                    smartroofModel: {
                        coreHeight: 5,
                        tilt: 20,
                        setbackInside: 0.5,
                    },
                    dormer: {
                        tilt: 20,
                        setbackOutside: 0.5,
                    },
                    subarray: {
                        mountType: SUBARRAY_RACK_STYLE_FIXED,
                        fixedMount: {
                            azimuth: 180,
                            structureType: 'Default Fixed Tilt',
                            moduleProperties: {
                                moduleId: 153,
                                moduleLength: 1.632,
                                moduleMake: 'ANJI Technology Co., Ltd.',
                                moduleSize: 0.26,
                                moduleWidth: 0.995,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 60,
                                    cell_type: 'Polycrystalline',
                                    length: 1.632,
                                    manufacturer: 'ANJI Technology Co., Ltd.',
                                    model: '260',
                                    p_mp_ref: 260,
                                    series: 'AJP-M660 260-275',
                                    v_max: 1000,
                                    width: 0.995,
                                },
                                id: 153,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'AJP-M660 260-275 260',
                            },
                            moduleSpacingUp: 0.025,
                            moduleSpacingWide: 0.025,
                            mountHeight: 1,
                            mountType: 'Fixed Tilt',
                            panelOrientation: 'Portrait',
                            tableSizeUp: 1,
                            tableSizeWide: 1,
                            tableSpacing: 0.025,
                            tilt: 20,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                            rowSpacing: 0.025,
                        },
                        flushMount: {
                            moduleProperties: {
                                moduleId: 153,
                                moduleLength: 1.632,
                                moduleMake: 'ANJI Technology Co., Ltd.',
                                moduleSize: 0.26,
                                moduleWidth: 0.995,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 60,
                                    cell_type: 'Polycrystalline',
                                    length: 1.632,
                                    manufacturer: 'ANJI Technology Co., Ltd.',
                                    model: '260',
                                    p_mp_ref: 260,
                                    series: 'AJP-M660 260-275',
                                    v_max: 1000,
                                    width: 0.995,
                                },
                                id: 153,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'AJP-M660 260-275 260',
                            },
                            moduleSpacingUp: 0.025,
                            moduleSpacingWide: 0.025,
                            mountHeight: 0.1,
                            panelOrientation: 'Portrait',
                            tableSizeUp: 1,
                            tableSizeWide: 1,
                            tableSpacing: 0.025,
                            rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                            rowSpacing: 0.025,
                        },
                    },
                    walkwayModel: {
                        coreHeight: 0.1,
                        width: 0.25,
                    },
                    texture: true,
                    monocrystallinepanels: false,
                    structures: {
                        visible: false,
                        template: 'Default Fixed Tilt',
                    },
                    tree: {
                        treeId: 1,
                        isProportional: false,
                        crownHeight: 10,
                        trunkHeight: 15,
                    },
                    inverter: {
                        azimuth: 90,
                        mountHeight: 1.2,
                    },
                    acdb: {
                        azimuth: 90,
                        mountHeight: 0.5,
                    },
                    acCable: {
                        materialType: 'aluminium',
                        cableSizeMM: '1.5',
                        cores: '1',
                        cableSizeAWG: '0000',
                    },
                    dcCable: {    
                        cableLength:0,
                        polarity:'negative',
                        cableSize:0,                  
                    },
                    conduit: {    
                        materialType:'EMT - Electrical Metallic Tubing',
                        innerDiameter:0.5,
                        outerDiameter:0.5,
                        maxFillFactor:0.4,                 
                    },
                    cabletray: {    
                        materialType:'EMT - Electrical Metallic Tubing',
                        width:150,
                        height:45,
                        maxFillFactor:0.4,                 
                    },
                    quickView: {
                        smartroofSetbacks: {
                            ridge: 0.4572,
                            eaves: 0.0,
                            hips: 0.4572,
                            valley: 0.4572,
                            rack: 0.4572,
                        },
                        totalModules: 0,
                        moduleArea: 100,
                        roofArea: 0,
                        ridgeLocked: true,
                    },
                },
                report_defaults: {
                    custom_color: {
                        primary_color: "#005482",
                        secondary_color: "#0086ae",
                        tertiary_color: "#00c2c7"
                    },
                    threed_data: {
                        generation: true,
                        financial: true,
                    },
                    shadowAnalysis: {
                        start_time_shadow_analysis: '09:00:00',
                        end_time_shadow_analysis: '17:00:00',
                    },
                    pages: checkedPagesCopy,
                },
                end_date_heatmap: '2019-12-31',
                end_time_auto_row_spacing: '15:00:00',
                end_time_heatmap: '23:59:59',
                start_date_heatmap: '2019-01-01',
                start_time_auto_row_spacing: '09:00:00',
                start_time_heatmap: '00:00:00',
                wiring_unit: 'awg',
            },
            notes: null,
            modified_at: null,
            modified_by: null,
        },
        imageURL: null,
        modified_at: null,
        modified_by: null,
        created_by: null,
        isDesignLoaded: false,
        battery_capacity: -1,
        battery_model: '',
        battery_detail: [],
        battery_tier_details: [],
        consumption_profile: {},
        critical_load: -1,
        estimated_energy_consumption: -1,
        project_type: '',
        battery_backup_on_storage: -1,
        battery_backup_on_storage_and_solar: -1,
        battery_backup_on_storage_and_load: -1,
        minimum_battery_capacity: -1,
        total_consumption_hours: -1,
        for_self_consumption: false,
        self_consumption_starting_hours: [],
        self_consumption_ending_hours: [],
    }
}

export const useDesignStore = defineStore('design', {
    state: () => getInitialState(),
    getters: {
        GET_ENTIRE_DESIGN: (state) => state,
        GET_DESIGN_INFORMATION: (state) => {
            if (state.versions) {
                const acDc =
                    parseFloat(state.versions.summary.nameplate_dc_size)
                    / parseFloat(state.versions.summary.ac_size);
                const acDcRatio = (Number.isNaN(acDc) ||
                    parseFloat(state.versions.summary.ac_size) === 0
                    ? 0
                    : acDc
                ).toFixed(2);
    
                return {
                    acSize:
                        (state.versions.summary.ac_size !== null && state.versions.summary.ac_size !== undefined)
                            ? parseFloat((state.versions.summary.ac_size).toFixed(2))
                            : 0.0,
                    nameplateDcSize:
                        (state.versions.summary.nameplate_dc_size !== null && state.versions.summary.nameplate_dc_size !== undefined)
                            ? parseFloat((state.versions.summary.nameplate_dc_size))
                            : 0.0,
                    specificGeneration:
                        Number.isNaN(parseFloat(state.versions.summary.specific_generation))
                            ? 0.0
                            : parseFloat((state.versions.summary.specific_generation).toFixed(2)),
                    performanceRatio:
                        (state.versions.summary.performance_ratio !== null && state.versions.summary.performance_ratio !== undefined)
                            ? parseFloat((state.versions.summary.performance_ratio).toFixed(2))
                            : 0.0,
                    lastModifiedAt:
                        state.versions.modified_at !== null ? state.versions.modified_at.split('T')[0] : null,
                    lastModifiedBy: state.versions.modified_by,
                    acDcRatio,
                    created_by: {
                        first_name: state.created_by ? state.created_by.first_name: '',
                        last_name: state.created_by ? state.created_by.last_name: '',
                    }
                };
            }
            return {};
        },
        GET_DESIGN_IMAGE: state => state.versions.layout_image || 
            signRequest(`https://maps.googleapis.com/maps/api/staticmap?center=${state.project.latitude},${state.project.longitude}&scale=2&zoom=${state.project.zoom}&maptype=satellite&size=512x512&key=${GOOGLE_API_KEY}`, GOOGLE_SIGNING_SECRET),
        GET_DESIGN_MONTHLY_AC_GENERATION: (state) => {
            if (state.versions) {
                if (state.versions.summary.monthly_generation) {
                    return state.versions.summary.monthly_generation.ac.map(parseFloat);
                }
            }
            return [];
        },
        GET_DESIGN_LOSS_DATA: (state) => {
            if (state.versions) {
                if (state.versions.summary.loss_diagram) {
                    return state.versions.summary.loss_diagram;
                }
            }
            return [];
        },
        GET_FINANCIAL_DATA: (state) => {
            if (state.pricing) {
                return state.pricing;
            }
            return [];
        },
        GET_EXPERT_SERVICE_INFO: (state) => {
            if (state.request_expert_service) {
                return state.request_expert_service;
            }
            return {};
        },
        GET_CURRENCY_CODE: (state) => {
            return {
                CurrencyCode : state.project.currency_code,
            }
        },
        GET_AHJ_DETAILS: (state) => {
            return {
                AHJCode : state.project.AHJCode,
                AHJName : state.project.AHJName,
                BuildingCode : state.project.BuildingCode,
                ElectricCode : state.project.ElectricCode,
                FireCode : state.project.FireCode,
                Level: state.project.Level,
                ResidentialCode : state.project.ResidentialCode,
            }
        },
        GET_BOM_DATA: (state) => {
            if (state.versions) {
                const bomData = [];
                // Restructuring bom data to fit in with el-table model data
                for (let key in state.versions.summary.bom_data) {
                    const componentData =
                        state.versions.summary.bom_data[key];
                    componentData.forEach(arrayItem => {
                        if (arrayItem[1] !== 0) {
                        bomData.push(JSON.parse(JSON.stringify({
                                    component:
                                        key.charAt(0).toUpperCase() +
                                        key.slice(1),
                                    make: arrayItem[0],
                                    count: arrayItem[1],
                                })
                            )
                        )
                     }
                    })
                }
                // To display structures in BOM in case of any design:
                if(state.versions.summary.nameplate_dc_size){
                    bomData.push(JSON.parse(JSON.stringify({
                        component: "Structure",
                        make: "Premium Structure",
                        count: "",
                    })
                )
            )
           }
                return bomData;
            }
            return [];
        },
        GET_DESIGN_VERSION_STAGE_DATA: (state) => {
            return {
                scene: state.versions.scene,
                latitude: state.project.latitude,
                longitude: state.project.longitude,
                zoom: state.project.zoom,
                designSettings: state.versions.setting,
                studioMapImage: state.studioMapImage,
            };
        },
        GET_DESIGN_VERSION_IMAGERY_DATA: (state) => {
            return {
                latitude: state.project.latitude,
                longitude: state.project.longitude,
                zoom: state.project.zoom,
                projectId: state.project.id,
                versionId: state.versions.id,
                currentStudioImageId: state.versions.studio_map_id,
            };
        },
        GET_DESIGN_PATH_DATA: (state) => {
            return {
                projectId: state.project.id,
                projectName: state.project.name,
                designId: state.id,
                designName: state.name,
                leadId: state.project.lead
            };
        },
        GET_DESIGN_VERSION_SETTINGS: state => state.versions.setting,
    
        GET_GENERATION_PAYLOAD_DATA: (state) => {
            return {
                latitude: state.project.latitude,
                longitude: state.project.longitude,
                weather: state.project.weather,
                constantLosses: {
                    soiling: state.versions.setting.constant_losses.irradiance.soiling / 100,
                    module_quality: 0,
                    lid: state.versions.setting.constant_losses.dc.lid / 100,
                    mismatch: state.versions.setting.constant_losses.dc.mismatch / 100,
                    dc_ohmic: state.versions.setting.constant_losses.dc.dc_ohmic / 100,
                    inverter_conversion: state.versions.setting.constant_losses.inverter_efficiency / 100,
                    unavailability: state.versions.setting.constant_losses.ac.unavailability / 100,
                    ac_ohmic: state.versions.setting.constant_losses.ac.ac_ohmic / 100,
                },
            };
        },
        GET_DESIGN_INCENTIVES_INFORMATION: (state)=> {
            if (state.incentives) {
                return state.incentives;
            } 
            return [];
        },
        // GET_DESIGN_INVERTER_DATA: (state) => {
        //     if (state.versions.scene.ground) {
        //         return state.versions.scene.ground.selectedPreliminaryInverters;
        //     }
        //     return [];
        // },
    
        GET_DESIGN_WEATHER_ID: state => state.project.weather,
        GET_DESIGN_REVISION_NOTE: state =>state.request_expert_service.revision_notes,
    
        GET_ORGANISATION_BOQ_TABLE_DATA: state => state.versions.summary.manual_bom_data,
        IS_DESIGN_MEASUREMENT_SYSTEM_METRIC: state =>
            state.versions.setting.distance_unit === METRIC_SYSTEM_UNIT,
        GET_CONSUMPTION_DATA: state => {
            return {
                total_battery_capacity: state.total_battery_capacity,
                battery_model: state.battery_model,
                battery_detail: state.battery_detail,
                consumption_profile: state.consumption_profile,
                critical_load: state.critical_load,
                estimated_energy_consumption: state.estimated_energy_consumption,
                project_type: state.project_type,
                battery_backup_on_storage: state.battery_backup_on_storage,
                battery_backup_on_storage_and_solar: state.battery_backup_on_storage_and_solar,
                battery_backup_on_storage_and_load: state.battery_backup_on_storage_and_load,
                minimum_battery_capacity: state.minimum_battery_capacity,
                total_consumption_hours: state.total_consumption_hours,
                for_self_consumption: state.for_self_consumption,
                self_consumption_starting_hours: state.self_consumption_starting_hours,
                self_consumption_ending_hours: state.self_consumption_ending_hours,
            }
        },
        GET_TOTAL_FEATURES : state => state.project.features,
        isExpertService: state => {
            return Object.keys(state.request_expert_service).length
        },
        leadIdFromDesign: state => state.project.lead,
    },
    actions: {
        async SET_DESIGN(designID) {
            try {
                this.isDesignLoaded = false;
                const response = await API.DESIGNS.FETCH_DESIGN(designID, true);
                if (response.data.versions === null) {
                    // sending a post request to create new design-version for given design
                    const postData = {
                        scene: null,
                        notes: null,
                        design: this.designId,
                    };
    
                    await API.DESIGN_VERSIONS.POST_DESIGN_VERSION(postData);
                }

                let projectStore = useProjectStore()
                projectStore.country_details.currency_code = response.data.project.currency_code;
                projectStore.weather = response.data.project.weather;
                projectStore.id = response.data.project.id;
                projectStore.quota_type = response.data.project.quota_type;

                this.RESET_STATE();
                this.SET_CURRENT_DESIGN(response.data);
                this.isDesignLoaded = true;

                let designIndex =  projectStore.designs.findIndex((design) => design.id == designID )
                if(designIndex>=0){
                    let annualGeneration = response.data.annual_generation;
                    let pricing = response.data.pricing;
                    projectStore.designs[designIndex].annual_generation = annualGeneration;
                    projectStore.designs[designIndex].pricing = [... pricing];
                }
            }
            catch (e) {
                throw e;
            }
        },
        async UPDATE_DESIGN_NAME(patchData) {
            try {
                const response = await API.DESIGNS.UPDATE_DESIGN_NAME(this.id, patchData);
                this.SET_DESIGN_NAME(response.data.name);
            }
            catch (e) {
                throw e;
            }
        },
        async PATCH_DESIGN_VERSION_SCENE([patchData, isDesignChanged]) {
            try {
                const response =
                    await API.DESIGN_VERSIONS.PATCH_DESIGN_VERSION_SCENE(
                        this.versions.id,
                        [patchData, isDesignChanged],
                    );
                this.SET_DESIGN_VERSION_SCENE(response.data.scene);
            }
            catch (e) {
                throw e;
            }
        },
    
        async SET_NEW_DESIGN_VERSION(designID) {
            try {
                if (this.id !== null) {
                    this.isDesignLoaded = false;
                    await this.UPDATE_STUDIO_IMAGE();
                    // await useMapImagesStore().POPULATE_ALL_MAP_IMAGES(designID);
                    this.isDesignLoaded = true;
                }
                else {
                    this.isDesignLoaded = false;
                    const response = await API.DESIGNS.FETCH_DESIGN(designID);
                    let projectStore = useProjectStore()
                    projectStore.weather = response.data.project.weather;
                    projectStore.id = response.data.project.id;
                    projectStore.quota_type = response.data.project.quota_type;
                    this.RESET_STATE();
                    this.SET_CURRENT_DESIGN(response.data);
                    await this.UPDATE_STUDIO_IMAGE();
                    // await useMapImagesStore().POPULATE_ALL_MAP_IMAGES(designID);
                    this.isDesignLoaded = true;
                }
            }
            catch (e) {
                throw e;
            }
        },
    
        async STORE_DESIGN_VERSION(response) {
            try {
                this.isDesignLoaded = false;
    
                let projectStore = useProjectStore()
                projectStore.weather = response.data.project.weather;
                projectStore.id = response.data.project.id;
                projectStore.quota_type = response.data.project.quota_type;
                this.RESET_STATE()
                this.SET_CURRENT_DESIGN(response.data);
                await this.UPDATE_STUDIO_IMAGE();
            }
            catch (e) {
                throw e;
            }
        },
        async UPDATE_DESIGN_VERSION_SETTINGS(payload) {
            try {
                const response = await API.DESIGN_VERSION_SETTINGS.PATCH_VERSION_SETTINGS(
                    this.versions.setting.id,
                    payload,
                );
                this.SET_DESIGN_VERSION_SETTINGS(response.data);
            }
            catch (e) {
                throw e;
            }
        },
        async UPDATE_DESIGN_FINANCIAL_DETAILS(payload) {
            try {
                await API.DESIGN_FINANCIAL_DETAILS
                    .PATCH_DESIGN_FINANCIALS(this.pricing[0].id, payload);
                this.SET_DESIGN(this.id);
            }
            catch (e) {
                throw e;
            }
        },
        async POST_FINANCIAL_DETAILS(payload) {
            try {
                await API.DESIGN_FINANCIAL_DETAILS.POST_DESIGN_FINANCIALS(payload);
                this.SET_DESIGN(this.id);
            }
            catch (e) {
                throw e;
            }
        },
        async DELETE_DESIGN_FINANCIAL_DETAILS(payload) {
            try {
                await API.DESIGN_FINANCIAL_DETAILS.DELETE_DESIGN_FINANCIALS(payload);
                this.SET_DESIGN(this.id);
            }
            catch (e) {
                throw e;
            }
        },
        async UPDATE_STUDIO_IMAGE() {
            try {
                if (this.versions.studio_map_id !== null) {
                    const response = await API.PROJECTS.FETCH_PROJECT_MAP_IMAGE(this.versions.studio_map_id);
                    const studioImage = {
                        url: response.data.image,
                        rotation: response.data.rotation,
                        scale: response.data.scale,
                        offset: response.data.offset,
                        source: response.data.source,
                        zoom: response.data.zoom,
                    };
                    this.SET_STUDIO_IMAGE(studioImage);
                }
                else {
                    this.SET_STUDIO_IMAGE(null);
                }
            }
            catch (e) {
                throw e;
            }
        },
    
        async PATCH_DESIGN_VERSION_MAP_IMAGE(patchData) {
            try {
                const response = await API.DESIGN_VERSIONS.PATCH_STUDIO_IMAGE_ID(this.versions.id, patchData);
                this.SET_STUDIO_IMAGE_ID(response.data.map_image.id);
            }
            catch (e) {
                throw e;
            }
        },
        async UPDATE_BOQ_TABLE(payload) {
            try {
                const summaryId = this.versions.summary.id;
                await API.DESIGN_VERSION_SUMMARY.UPDATE_BOQ_DATA(summaryId, payload);
                await this.SET_DESIGN(this.id);
            }
            catch (e) {
                throw e;
            }
        },
        async DELETE_BATTERY() {
            try {
                await API.DESIGNS.DELETE_BATTERY(this.id)
                await this.SET_DESIGN(this.id)
            }
            catch (e) {
                throw e
            }
        },

        SET_CURRENT_DESIGN(payload) {
            this.id = payload.id;
            this.name = payload.name;
            this.is_exported_heaven_solar = payload.is_exported_heaven_solar;
            this.request_expert_service = payload.request_expert_service;
            this.pricing = payload.pricing;
            this.project = payload.project;
            this.modified_at = payload.modified_at;
            this.modified_by = payload.modified_by;
            this.created_by = payload.created_by;
            this.incentives = payload.incentives;
            this.annual_generation = payload.annual_generation;
            
            this.total_battery_capacity = payload.total_battery_capacity
            this.battery_model = payload.battery_model
            this.battery_detail = payload.battery_detail
            this.battery_tier_details = payload.battery_tier_details
            this.consumption_profile = payload.consumption_profile
            this.critical_load = payload.critical_load
            this.estimated_energy_consumption = payload.estimated_energy_consumption
            this.project_type = payload.project_type
            this.battery_backup_on_storage = payload.battery_backup_on_storage || '-'
            this.battery_backup_on_storage_and_solar = payload.battery_backup_on_storage_and_solar || '-'
            this.battery_backup_on_storage_and_load = payload.battery_backup_on_storage_and_load || '-'
            this.minimum_battery_capacity = payload.minimum_battery_capacity || 0
            this.total_consumption_hours = payload.total_consumption_hours || 0
            this.for_self_consumption = payload.for_self_consumption || false
            this.self_consumption_starting_hours = payload.self_consumption_starting_hours || []
            this.self_consumption_ending_hours = payload.self_consumption_ending_hours || []


            // TODO: Use Object Destructuring
            this.versions.id = payload.versions.id;
            this.versions.reference_id = payload.versions.reference_id;
            this.versions.layout_image = payload.versions.layout_image;
            this.versions.scene = payload.versions.scene;
            this.versions.summary = payload.versions.summary;
            this.versions.notes = payload.versions.notes;
            this.versions.modified_at = payload.versions.modified_at;
            this.versions.modified_by = payload.versions.modified_by;

            // Load Imagery Data
            this.versions.studio_map_id = payload.versions.map_image.id || null;
            // load map_data
            useMapImagesStore().latitude = payload.map_data ? payload.map_data.latitude_for_map ? payload.map_data.latitude_for_map : parseFloat(this.project.latitude) : parseFloat(this.project.latitude);
            useMapImagesStore().longitude = payload.map_data ? payload.map_data.longitude_for_map ? payload.map_data.longitude_for_map : parseFloat(this.project.longitude) : parseFloat(this.project.longitude);
            useMapImagesStore().zoomLevel = payload.map_data ? payload.map_data.zoomLevel ? payload.map_data.zoomLevel : this.project.zoom : this.project.zoom;
            useMapImagesStore().dimensions = payload.map_data ? payload.map_data.dimensions ? payload.map_data.dimensions : 512 : 512;
            useMapImagesStore().square = payload.map_data ? payload.map_data.square ? payload.map_data.square : {south: 0, west: 0, north: 100, east: 100} : {south: 0, west: 0, north: 100, east: 100};

            // fetch report_defaults Data
            if (payload.versions.setting.hasOwnProperty('report_defaults')) {
                
                if (payload.versions.setting.report_defaults.hasOwnProperty('custom_color')) {
                    this.versions.setting.report_defaults.custom_color = payload.versions.setting.report_defaults.custom_color;
                }
                if (payload.versions.setting.report_defaults.hasOwnProperty('template_name')) {
                    this.versions.setting.report_defaults.template_name = payload.versions.setting.report_defaults.template_name;
                }
                if (payload.versions.setting.report_defaults.hasOwnProperty('report_type')) {
                    this.versions.setting.report_defaults.report_type = payload.versions.setting.report_defaults.report_type;
                }
                if (payload.versions.setting.report_defaults.hasOwnProperty('pages')) {
                    this.versions.setting.report_defaults.pages = payload.versions.setting.report_defaults.pages;
                }
                if (payload.versions.setting.report_defaults.hasOwnProperty('threed_data')) {
                    if (payload.versions.setting.report_defaults.threed_data.hasOwnProperty('generation')) {
                        this.versions.setting.report_defaults.threed_data.generation = payload.versions.setting.report_defaults.threed_data.generation
                    }
                    if (payload.versions.setting.report_defaults.threed_data.hasOwnProperty('financial')) {
                        this.versions.setting.report_defaults.threed_data.financial = payload.versions.setting.report_defaults.threed_data.financial
                    }
                }
                if (payload.versions.setting.report_defaults.hasOwnProperty('shadowAnalysis')) {
                    if (payload.versions.setting.report_defaults.shadowAnalysis.hasOwnProperty('start_time_shadow_analysis')) {
                        this.versions.setting.report_defaults.shadowAnalysis.start_time_shadow_analysis =
                            payload.versions.setting.report_defaults.shadowAnalysis.start_time_shadow_analysis
                    }
                    if (payload.versions.setting.report_defaults.shadowAnalysis.hasOwnProperty('end_time_shadow_analysis')) {
                        this.versions.setting.report_defaults.shadowAnalysis.end_time_shadow_analysis =
                            payload.versions.setting.report_defaults.shadowAnalysis.end_time_shadow_analysis
                    }
                }
            }
            // Design Version Settings
            if (!_.isEmpty(payload.versions.setting)) {
                this.versions.setting.id = payload.versions.setting.id;
                this.versions.setting.default_solar_access_threshold =
                    payload.versions.setting.default_solar_access_threshold;
                this.versions.setting.distance_unit =
                    payload.versions.setting.distance_unit;
                this.versions.setting.end_date_heatmap =
                    payload.versions.setting.end_date_heatmap;
                this.versions.setting.start_date_heatmap =
                    payload.versions.setting.start_date_heatmap;
                this.versions.setting.start_time_heatmap =
                    payload.versions.setting.start_time_heatmap;
                this.versions.setting.end_time_heatmap =
                    payload.versions.setting.end_time_heatmap;
                this.versions.setting.start_time_auto_row_spacing =
                    payload.versions.setting.start_time_auto_row_spacing;
                this.versions.setting.end_time_auto_row_spacing =
                    payload.versions.setting.end_time_auto_row_spacing;
                this.versions.setting.wiring_unit =
                    payload.versions.setting.wiring_unit;

                // Constant Losses
                if (!_.isEmpty(payload.versions.setting.constant_losses)) {
                    this.versions.setting.constant_losses.irradiance.iam =
                        payload.versions.setting.constant_losses.irradiance.iam;
                    this.versions.setting.constant_losses.irradiance.soiling =
                        payload.versions.setting.constant_losses.irradiance.soiling;
                    this.versions.setting.constant_losses.dc.irradiance =
                        payload.versions.setting.constant_losses.dc.irradiance;
                    this.versions.setting.constant_losses.dc.temperature =
                        payload.versions.setting.constant_losses.dc.temperature;
                    this.versions.setting.constant_losses.dc.dc_ohmic =
                        payload.versions.setting.constant_losses.dc.dc_ohmic;
                    this.versions.setting.constant_losses.dc.mismatch =
                        payload.versions.setting.constant_losses.dc.mismatch;
                    this.versions.setting.constant_losses.ac.ac_ohmic =
                        payload.versions.setting.constant_losses.ac.ac_ohmic;
                    this.versions.setting.constant_losses.ac.unavailability =
                        payload.versions.setting.constant_losses.ac.unavailability;
                    this.versions.setting.constant_losses.inverter_efficiency =
                        payload.versions.setting.constant_losses.inverter_efficiency;
                    if (payload.versions.setting.constant_losses.dc.hasOwnProperty('lid')) {
                        this.versions.setting.constant_losses.dc.lid =
                            payload.versions.setting.constant_losses.dc.lid;
                    }
                    if (payload.versions.setting.constant_losses.dc.hasOwnProperty('derating_factor')) {
                        this.versions.setting.constant_losses.derating_factor =
                            payload.versions.setting.constant_losses.derating_factor;
                    }
                    if (payload.versions.setting.constant_losses.hasOwnProperty('module_degradation_rate')) {
                        this.versions.setting.constant_losses.module_degradation_rate =
                            payload.versions.setting.constant_losses.module_degradation_rate;
                    }
                }
                if (!_.isEmpty(payload.versions.setting.default_table_types)) {
                    this.versions.setting.default_table_types =
                        payload.versions.setting.default_table_types;
                }
                if (!_.isEmpty(payload.versions.setting.drawing_defaults)) {
                    Object.assign(
                        this.versions.setting.drawing_defaults.walkwayModel,
                        payload.versions.setting.drawing_defaults.walkwayModel,
                    );
                    Object.assign(
                        this.versions.setting.drawing_defaults.polygonModel,
                        payload.versions.setting.drawing_defaults.polygonModel,
                    );
                    if ('quickView' in payload.versions.setting.drawing_defaults) {
                        Object.assign(
                            this.versions.setting.drawing_defaults.quickView,
                            payload.versions.setting.drawing_defaults.quickView,
                        );
                    }
                    if ('subarray' in payload.versions.setting.drawing_defaults) {
                        if (!('eastWestRacking' in payload.versions.setting.drawing_defaults.subarray)) {
                            payload.versions.setting.drawing_defaults.subarray = {
                                mountType: SUBARRAY_RACK_STYLE_FIXED,
                                fixedMount: {
                                    azimuth: 180,
                                    structureType: 'Default Fixed Tilt',
                                    moduleProperties: {
                                        moduleId: defaultModuleId,
                                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                        moduleSize: 0.313,
                                        moduleLength: 2.030,
                                        moduleWidth: 0.98,
                                    },
                                    panelProperties: {
                                        characteristics: {
                                            cell_number: 72,
                                            cell_type: 'Monocrystalline',
                                            length: 2.03,
                                            manufacturer: 'The Solar Labs',
                                            model: 'TSL-315-FX',
                                            p_mp_ref: 313,
                                            series: 'SolarLabs TSL-310-330-FX',
                                            v_max: 999,
                                            width: 0.98,
                                        },
                                        id: defaultModuleId,
                                        image: null,
                                        image_link: null,
                                        is_selected: true,
                                        model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                                    },
                                    moduleSpacingUp: 0.025,
                                    moduleSpacingWide: 0.025,
                                    mountHeight: 1,
                                    mountType: 'Fixed Tilt',
                                    panelOrientation: 'Portrait',
                                    tableSizeUp: 1,
                                    tableSizeWide: 1,
                                    tableSpacing: 0.025,
                                    tilt: 20,
                                    rowSpacingMode: ROW_SPACING_MODE_AUTO,
                                    rowSpacing: 0.025,
                                },
                                flushMount: {
                                    structureType: '',
                                    moduleProperties: {
                                        moduleId: defaultModuleId,
                                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                        moduleSize: 0.313,
                                        moduleLength: 2.030,
                                        moduleWidth: 0.98,
                                    },
                                    panelProperties: {
                                        characteristics: {
                                            cell_number: 72,
                                            cell_type: 'Monocrystalline',
                                            length: 2.03,
                                            manufacturer: 'The Solar Labs',
                                            model: 'TSL-315-FX',
                                            p_mp_ref: 313,
                                            series: 'SolarLabs TSL-310-330-FX',
                                            v_max: 999,
                                            width: 0.98,
                                        },
                                        id: defaultModuleId,
                                        image: null,
                                        image_link: null,
                                        is_selected: true,
                                        model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                                    },
                                    moduleSpacingUp: 0.025,
                                    moduleSpacingWide: 0.025,
                                    mountHeight: 0.1,
                                    panelOrientation: 'Portrait',
                                    tableSizeUp: 1,
                                    tableSizeWide: 1,
                                    tableSpacing: 0.025,
                                    rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                                    rowSpacing: 0.025,
                                },
                                eastWestRacking: {
                                    azimuth: 90,
                                    structureType: 'Low Foundation Fixed Tilt',
                                    moduleProperties: {
                                        moduleId: defaultModuleId,
                                        moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                        moduleSize: 0.313,
                                        moduleLength: 2.030,
                                        moduleWidth: 0.98,
                                    },
                                    panelProperties: {
                                        panelProperties: {
                                            characteristics: {
                                                cell_number: 72,
                                                cell_type: 'Monocrystalline',
                                                length: 2.03,
                                                manufacturer: 'The Solar Labs',
                                                model: 'TSL-315-FX',
                                                p_mp_ref: 313,
                                                series: 'SolarLabs TSL-310-330-FX',
                                                v_max: 999,
                                                width: 0.98,
                                            },
                                            id: defaultModuleId,
                                            image: null,
                                            image_link: null,
                                            is_selected: true,
                                            model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                                        },
                                    },
                                    moduleSpacingUp: 0.025,
                                    moduleSpacingWide: 0.025,
                                    mountHeight: 0.5,
                                    tilt: 5,
                                    intraRowSpacing: 0.100,
                                    interRowSpacingMode: ROW_SPACING_MODE_AUTO,
                                    interRowSpacing: 0.44,
                                    panelOrientation: PANEL_ORIENTATION_PORTRAIT,
                                    tableSizeUp: 1,
                                    tableSizeWide: 1,
                                    tableSpacing: 0.025,
                                }
                            }
                        }
                        if ('fixedMount' in payload.versions.setting.drawing_defaults.subarray) {
                            this.versions.setting.drawing_defaults.subarray =
                                payload.versions.setting.drawing_defaults.subarray;
                            if (!('moduleProperties' in this.versions.setting.drawing_defaults.subarray.fixedMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.fixedMount = {
                                        azimuth: 180,
                                        structureType: 'Default Fixed Tilt',
                                        moduleProperties: {
                                            moduleId: defaultModuleId,
                                            moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                            moduleSize: 0.313,
                                            moduleLength: 2.030,
                                            moduleWidth: 0.98,
                                        },
                                        panelProperties: {
                                            characteristics: {
                                                cell_number: 72,
                                                cell_type: 'Monocrystalline',
                                                length: 2.03,
                                                manufacturer: 'The Solar Labs',
                                                model: 'TSL-315-FX',
                                                p_mp_ref: 313,
                                                series: 'SolarLabs TSL-310-330-FX',
                                                v_max: 999,
                                                width: 0.98,
                                            },
                                            id: defaultModuleId,
                                            image: null,
                                            image_link: null,
                                            is_selected: true,
                                            model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                                        },
                                        moduleSpacingUp: 0.025,
                                        moduleSpacingWide: 0.025,
                                        mountHeight: 1,
                                        mountType: 'Fixed Tilt',
                                        panelOrientation: 'Portrait',
                                        tableSizeUp: 1,
                                        tableSizeWide: 1,
                                        tableSpacing: 0.025,
                                        tilt: 20,
                                        rowSpacingMode: ROW_SPACING_MODE_AUTO,
                                        rowSpacing: 0.025,
                                    }
                            }
                            if (!('moduleProperties' in this.versions.setting.drawing_defaults.subarray.flushMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.flushMount = {
                                        moduleProperties: {
                                            moduleId: defaultModuleId,
                                            moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                            moduleSize: 0.313,
                                            moduleLength: 2.030,
                                            moduleWidth: 0.98,
                                        },
                                        panelProperties: {
                                            characteristics: {
                                                cell_number: 72,
                                                cell_type: 'Monocrystalline',
                                                length: 2.03,
                                                manufacturer: 'The Solar Labs',
                                                model: 'TSL-315-FX',
                                                p_mp_ref: 313,
                                                series: 'SolarLabs TSL-310-330-FX',
                                                v_max: 999,
                                                width: 0.98,
                                            },
                                            id: defaultModuleId,
                                            image: null,
                                            image_link: null,
                                            is_selected: true,
                                            model: 'SolarLabs TSL-310-330-FX TSL-315-FX',
                                        },
                                        moduleSpacingUp: 0.025,
                                        moduleSpacingWide: 0.025,
                                        mountHeight: 0.1,
                                        panelOrientation: 'Portrait',
                                        tableSizeUp: 1,
                                        tableSizeWide: 1,
                                        tableSpacing: 0.025,
                                        rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                                        rowSpacing: 0.025,
                                    }
                            }
                            if (!('rowSpacing' in this.versions.setting.drawing_defaults.subarray.fixedMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.fixedMount.rowSpacing = 0.001;
                            }
                            if (!('panelProperties' in this.versions.setting.drawing_defaults.subarray.fixedMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.fixedMount.panelProperties = payload.versions.setting.drawing_defaults.subarray.fixedMount.panelProperties;
                            }
                            if (!('rowSpacingMode' in this.versions.setting.drawing_defaults.subarray.fixedMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.fixedMount.rowSpacingMode = ROW_SPACING_MODE_AUTO;
                            }
                            if (!('rowSpacing' in this.versions.setting.drawing_defaults.subarray.flushMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.flushMount.rowSpacing = 0.001;
                            }
                            if (!('rowSpacingMode' in this.versions.setting.drawing_defaults.subarray.flushMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.flushMount.rowSpacingMode = ROW_SPACING_MODE_AUTO;
                            }
                            if (!('panelProperties' in this.versions.setting.drawing_defaults.subarray.flushMount)) {
                                this.versions.setting.drawing_defaults
                                    .subarray.flushMount.panelProperties = payload.versions.setting.drawing_defaults.subarray.flushMount.panelProperties;
                            }
                        } else {
                            Object.assign(
                                this.versions.setting.drawing_defaults.subarray.flushMount.moduleProperties,
                                payload.versions.setting.drawing_defaults.subarray.moduleProperties,
                            );
                            Object.assign(
                                this.versions.setting.drawing_defaults.subarray.flushMount.panelProperties,
                                payload.versions.setting.drawing_defaults.subarray.panelProperties,
                            );
                            Object.assign(
                                this.versions.setting.drawing_defaults.subarray.fixedMount.moduleProperties,
                                payload.versions.setting.drawing_defaults.subarray.moduleProperties,
                            );
                            Object.assign(
                                this.versions.setting.drawing_defaults.subarray.fixedMount.panelProperties,
                                payload.versions.setting.drawing_defaults.subarray.panelProperties,
                            );
                        }
                    }
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('polygonModel')) {
                        if (payload.versions.setting.drawing_defaults.polygonModel.hasOwnProperty('obstruction')) {
                            this.versions.setting.drawing_defaults.polygonModel.obstruction =
                                payload.versions.setting.drawing_defaults.polygonModel.obstruction;
                        }
                        if (payload.versions.setting.drawing_defaults.polygonModel.hasOwnProperty('heatMapThreshold')) {
                            this.versions.setting.drawing_defaults.polygonModel.heatMapThreshold =
                                payload.versions.setting.drawing_defaults.polygonModel.heatMapThreshold;
                        }
                        else {
                            Object.assign(
                                this.versions.setting.drawing_defaults.polygonModel,
                                payload.versions.setting.drawing_defaults.polygonModel,
                            );
                        }
                    }
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('cylinderModel')) {
                        if (payload.versions.setting.drawing_defaults.cylinderModel.hasOwnProperty('obstruction')) {
                            this.versions.setting.drawing_defaults.cylinderModel.obstruction =
                                payload.versions.setting.drawing_defaults.cylinderModel.obstruction;
                        }
                        if (payload.versions.setting.drawing_defaults.cylinderModel.hasOwnProperty('heatMapThreshold')) {
                            this.versions.setting.drawing_defaults.cylinderModel.heatMapThreshold =
                                payload.versions.setting.drawing_defaults.cylinderModel.heatMapThreshold;
                        }
                        else {
                            Object.assign(
                                this.versions.setting.drawing_defaults.cylinderModel,
                                payload.versions.setting.drawing_defaults.cylinderModel,
                            );
                        }
                    }

                    // checking for roof top texture
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('texture')) {
                        this.versions.setting.drawing_defaults.texture =
                            payload.versions.setting.drawing_defaults.texture;

                    }
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('monocrystallinepanels')) {
                        this.versions.setting.drawing_defaults.monocrystallinepanels =
                            payload.versions.setting.drawing_defaults.monocrystallinepanels;

                    }
                    // checking for structures object in design settings
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('structures')) {
                        if (payload.versions.setting.drawing_defaults.structures.hasOwnProperty('template')) {
                            this.versions.setting.drawing_defaults.structures.template =
                                payload.versions.setting.drawing_defaults.structures.template;
                        }
                        if (payload.versions.setting.drawing_defaults.structures.hasOwnProperty('visible')) {
                            this.versions.setting.drawing_defaults.structures.visible =
                                payload.versions.setting.drawing_defaults.structures.visible;
                        }
                    }
                    // checking for tree
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('tree')) {
                        if (payload.versions.setting.drawing_defaults.tree.hasOwnProperty('trunkHeight')) {
                            this.versions.setting.drawing_defaults.tree.trunkHeight =
                                payload.versions.setting.drawing_defaults.tree.trunkHeight;
                        }
                        if (payload.versions.setting.drawing_defaults.tree.hasOwnProperty('crownHeight')) {
                            this.versions.setting.drawing_defaults.tree.crownHeight =
                                payload.versions.setting.drawing_defaults.tree.crownHeight;
                        }
                        if (payload.versions.setting.drawing_defaults.tree.hasOwnProperty('treeId')) {
                            this.versions.setting.drawing_defaults.tree.treeId =
                                payload.versions.setting.drawing_defaults.tree.treeId;
                        }
                        if (payload.versions.setting.drawing_defaults.tree.hasOwnProperty('isProportional')) {
                            this.versions.setting.drawing_defaults.tree.isProportional =
                                payload.versions.setting.drawing_defaults.tree.isProportional;
                        }
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('inverter')) {
                        if (payload.versions.setting.drawing_defaults.inverter.hasOwnProperty('azimuth')) {
                            this.versions.setting.drawing_defaults.inverter.azimuth =
                                payload.versions.setting.drawing_defaults.inverter.azimuth;
                        }
                        if (payload.versions.setting.drawing_defaults.inverter.hasOwnProperty('mountHeight')) {
                            this.versions.setting.drawing_defaults.inverter.mountHeight =
                                payload.versions.setting.drawing_defaults.inverter.mountHeight;
                        }
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('acdb')) {
                        if (payload.versions.setting.drawing_defaults.acdb.hasOwnProperty('azimuth')) {
                            this.versions.setting.drawing_defaults.acdb.azimuth =
                                payload.versions.setting.drawing_defaults.acdb.azimuth;
                        }
                        if (payload.versions.setting.drawing_defaults.acdb.hasOwnProperty('mountHeight')) {
                            this.versions.setting.drawing_defaults.acdb.mountHeight =
                                payload.versions.setting.drawing_defaults.acdb.mountHeight;
                        }
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('dcCable')) {
                        if (payload.versions.setting.drawing_defaults.dcCable.hasOwnProperty('cableLength')) {
                            this.versions.setting.drawing_defaults.dcCable.cableLength =
                                payload.versions.setting.drawing_defaults.dcCable.cableLength;
                        }
                        if (payload.versions.setting.drawing_defaults.dcCable.hasOwnProperty('polarity')) {
                            this.versions.setting.drawing_defaults.dcCable.polarity =
                                payload.versions.setting.drawing_defaults.dcCable.polarity;
                        }
                        if (payload.versions.setting.drawing_defaults.dcCable.hasOwnProperty('cableSize')) {
                            this.versions.setting.drawing_defaults.dcCable.cableSize =
                                payload.versions.setting.drawing_defaults.dcCable.cableSize;
                        }
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('conduit')) {
                        if (payload.versions.setting.drawing_defaults.conduit.hasOwnProperty('materialType')) {
                            this.versions.setting.drawing_defaults.conduit.materialType =
                                payload.versions.setting.drawing_defaults.conduit.materialType;
                        }
                        if (payload.versions.setting.drawing_defaults.conduit.hasOwnProperty('innerDiameter')) {
                            this.versions.setting.drawing_defaults.conduit.innerDiameter =
                                payload.versions.setting.drawing_defaults.conduit.innerDiameter;
                        }
                        if (payload.versions.setting.drawing_defaults.conduit.hasOwnProperty('outerDiameter')) {
                            this.versions.setting.drawing_defaults.conduit.outerDiameter =
                                payload.versions.setting.drawing_defaults.conduit.outerDiameter;
                        }
                        if (payload.versions.setting.drawing_defaults.conduit.hasOwnProperty('maxFillFactor')) {
                            this.versions.setting.drawing_defaults.conduit.maxFillFactor =
                                payload.versions.setting.drawing_defaults.conduit.maxFillFactor;
                        }

                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('cabletray')) {
                        if (payload.versions.setting.drawing_defaults.cabletray.hasOwnProperty('materialType')) {
                            this.versions.setting.drawing_defaults.cabletray.materialType =
                                payload.versions.setting.drawing_defaults.cabletray.materialType;
                        }
                        if (payload.versions.setting.drawing_defaults.cabletray.hasOwnProperty('width')) {
                            this.versions.setting.drawing_defaults.cabletray.width =
                                payload.versions.setting.drawing_defaults.cabletray.width;
                        }
                        if (payload.versions.setting.drawing_defaults.cabletray.hasOwnProperty('height')) {
                            this.versions.setting.drawing_defaults.cabletray.height =
                                payload.versions.setting.drawing_defaults.cabletray.height;
                        }
                        if (payload.versions.setting.drawing_defaults.cabletray.hasOwnProperty('maxFillFactor')) {
                            this.versions.setting.drawing_defaults.cabletray.maxFillFactor =
                                payload.versions.setting.drawing_defaults.cabletray.maxFillFactor;
                        }

                    }

                    // Checking for cylinders
                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('cylinderModel')) {
                        Object.assign(
                            this.versions.setting.drawing_defaults.cylinderModel,
                            payload.versions.setting.drawing_defaults.cylinderModel,
                        );
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('smartroofModel')) {
                        Object.assign(
                            this.versions.setting.drawing_defaults.smartroofModel,
                            payload.versions.setting.drawing_defaults.smartroofModel,
                        );
                    }

                    if (payload.versions.setting.drawing_defaults.hasOwnProperty('dormer')) {
                        Object.assign(
                            this.versions.setting.drawing_defaults.dormer,
                            payload.versions.setting.drawing_defaults.dormer,
                        );
                    }

                    if (payload.versions.setting.hasOwnProperty('report_defaults')) {
                        if (payload.versions.setting.report_defaults.hasOwnProperty('custom_color')) {
                            this.versions.setting.report_defaults.custom_color = payload.versions.setting.report_defaults.custom_color;
                        }
                        if (payload.versions.setting.report_defaults.hasOwnProperty('pages')) {
                            this.versions.setting.report_defaults.pages = payload.versions.setting.report_defaults.pages;
                        }
                        if (payload.versions.setting.report_defaults.hasOwnProperty('threed_data')) {
                            if (payload.versions.setting.report_defaults.threed_data.hasOwnProperty('generation')) {
                                this.versions.setting.report_defaults.threed_data.generation = payload.versions.setting.report_defaults.threed_data.generation
                            }
                            if (payload.versions.setting.report_defaults.threed_data.hasOwnProperty('financial')) {
                                this.versions.setting.report_defaults.threed_data.financial = payload.versions.setting.report_defaults.threed_data.financial
                            }
                        }
                        if (payload.versions.setting.report_defaults.hasOwnProperty('shadowAnalysis')) {
                            if (payload.versions.setting.report_defaults.shadowAnalysis.hasOwnProperty('start_time_shadow_analysis')) {
                                this.versions.setting.report_defaults.shadowAnalysis.start_time_shadow_analysis =
                                    payload.versions.setting.report_defaults.shadowAnalysis.start_time_shadow_analysis
                            }
                            if (payload.versions.setting.report_defaults.shadowAnalysis.hasOwnProperty('end_time_shadow_analysis')) {
                                this.versions.setting.report_defaults.shadowAnalysis.end_time_shadow_analysis =
                                    payload.versions.setting.report_defaults.shadowAnalysis.end_time_shadow_analysis
                            }
                        }
                    }
                }

                // checking for high resolution shadows
                if (!_.isEmpty(payload.versions.setting.shadows)) {
                    this.versions.setting.shadows =
                        payload.versions.setting.shadows;
                }
            }
            // this.isDesignLoaded = true;
        },
        UPDATE_ADDONS_ON_CONVERTING_TO_MEDIUM(projectType){
            if(projectType){
                this.project.add_ons_availed.project_type = projectType;
            }
        },
        UPDATE_ALL_AVAILABLE_FEATURES(featureJson){
            this.project.features = {... featureJson.updatesFeaturesJson};
            if(featureJson.type){
                this.project.add_ons_availed.project_type = featureJson.type;
            }
        },
        SET_DESIGN_VERSION_SCENE (payload) {
            this.versions.scene = payload;
        },
        SET_DESIGN_VERSION_SETTINGS(payload) {
            this.versions.setting = payload;
        },
        SET_DESIGN_NAME(payload) {
            this.name = payload;
        },
        SET_STUDIO_IMAGE(payload) {
            this.studioMapImage = payload;
        },
        SET_STUDIO_IMAGE_ID(payload) {
            this.versions.studio_map_id = payload;
        },
        SET_DISTANCE_UNIT(payload) {
            this.versions.setting.distance_unit = payload;
        },
        SET_WIRING_UNIT(payload) {
            this.versions.setting.wiring_unit = payload;
        },
        RESET_STATE() {
            this.$reset()
        },
        SET_OVERVIEW_MODE(payload) {
            this.versions.overviewMode = payload;
        },
    }
})
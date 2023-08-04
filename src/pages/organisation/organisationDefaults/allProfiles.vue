<template>
    <div id="allProfiles">
        <el-header class="navBar-container">
            <navBar :currentPage="currentPage">
            </navBar>
        </el-header>

        <div class="userFormWrapper" style="padding-right: 25%;">
            <div style="padding-bottom: 20px; display: flex; align-items: center">
                <i @click="goBack" class="el-icon-arrow-left backButton" style="cursor: pointer;"></i>
                <h1 style="display: inline-block;"> Design Defaults </h1>
            </div>

            <div style="display: flex; justify-content: space-between; padding-bottom: 20px;">
                <div class="searchBar">
                    <el-input
                        placeholder="Search"
                        size="small"
                        suffix-icon="el-icon-search"
                        v-model="searchProfileQuery"
                        disabled>
                    </el-input>
                </div>
                <div style="display: inline-block;">
                    <button
                        class="button-confirm"
                        style="margin: 0; height: 32px;"
                        @click="newProfile"> New Profile
                    </button>
                </div>
            </div>

            <div class="profilesContainer">

                <div class="profileContainerTreesDiv" v-infinite-scroll="loadMoreProfiles">
                    <!-- List of all profiles, each object contains userProfile id and name -->
                    <p> PROFILES </p>
                    <el-tree 
                            :data="profileList"
                            node-key="id"
                            default-expand-all
                            highlight-current
                            ref="prof"
                            :filter-node-method="filterProfile"
                            @node-click="selectedItem">
                    </el-tree>

                </div>

                <div class="profileContainerTreesDiv">
                    <!-- Profile settings and objects tree -->
                    <p> PROPERTIES </p>
                    <profileTree
                        v-bind:isDataVisible="isDataVisible"/>
                </div>

                <div style="width: 34%; height: 100%; padding: 10px 0 0 0">
                    <!-- Profile Display data -->
                    <!-- using if to avoid error in case of nested objects which are empty initially -->
                    <defaultsData
                        v-if="isDataVisible"
                        :profileData="selectedProfile"/>
                </div>
            </div>
        </div>
        <div>
            <newEditProfile/>
        </div>
    </div>
</template>

<script>

import {
    TOP_HEIGHT_LOCKED,
    SUBARRAY_RACK_STYLE_FLUSH,
    SUBARRAY_RACK_STYLE_FIXED,
    ROW_SPACING_MODE_AUTO,
    ROW_SPACING_MODE_MANUAL,
} from '../../../core/coreConstants';
import {serverBus} from '../../../main';
import navBar from '@/components/ui/navBar/navBar.vue';
import profileTree from './profileTree.vue';
import defaultsData from './defaultsData/defaultsData.vue';
import newEditProfile from './newEditProfile.vue';
import API from '../../../services/api/';
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from '../../../stores/design';
import { reportPagesPlainListNonUs } from '../../../utils';

export default {
    name: 'allProfiles',
    components: {
        navBar,
        profileTree,
        defaultsData,
        newEditProfile,
    },
    data() {
        return {
            msg: ' I am in allProfiles',
            searchProfileQuery: '',
            currentPage: 'organisationSettings',
            isNewProfile: true,
            newEditProfileVisible: false,
            profileList: [],
            selectedProfileIndex: 0,
            selectedProfile: {},
            isDataVisible: false,
            defaultProps: {
                children: 'children',
                id: 'id',
                label: 'label'
            },
            defaultProfileData: {
                name: 'New Profile',
                distance_unit: 'meters',
                wiring_unit: 'awg',
                start_time_auto_row_spacing: '09:00:00',
                end_time_auto_row_spacing: '15:00:00',
                start_date_heatmap: '2019-01-01',
                end_date_heatmap: '2019-12-31',
                start_time_heatmap: '00:00:00',
                end_time_heatmap: '23:59:59',
                default_solar_access_threshold: 92,
                shadows: {
                    high_resolution_shadows: false,
                },
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
                constant_losses: {
                    ac: {
                        ac_ohmic: 1,
                        unavailability: 0,
                    },
                    dc: {
                        dc_ohmic: 1,
                        mismatch: 1.5,
                        irradiance: 3,
                        temperature: 5,
                        lid: 1.5,
                    },
                    irradiance: {
                        iam: 1.5,
                        shading: 1,
                        soiling: 2,
                    },
                    module_degradation_rate: 1.5,
                    inverter_efficiency: 96,
                },
                report_defaults: {
                    custom_color: {
                        primary_color: '#005482',
                        secondary_color : '#0086ae',
                        tertiary_color : '#00c2c7', 
                    },
                    threed_data: {
                        generation: true,
                        financial: true,
                    },
                    shadowAnalysis: {
                        start_time_shadow_analysis: '09:00:00',
                        end_time_shadow_analysis: '17:00:00',
                    },
                    pages: reportPagesPlainListNonUs,
                },
                drawing_defaults: {
                    subarray: {
                        mountType: SUBARRAY_RACK_STYLE_FIXED,
                        fixedMount: {
                            tilt: 20,
                            azimuth: 180,
                            structureType: 'Default Fixed Tilt',
                            mountHeight: 1,
                            tableSizeUp: 1,
                            tableSpacing: 0.025,
                            tableSizeWide: 1,
                            moduleSpacingUp: 0.025,
                            moduleProperties: {
                                moduleId: 20511,
                                moduleMake: 'Waaree Energies Ltd Merlin WM-310-330-FX WM-315-FX',
                                moduleSize: 0.315,
                                moduleLength: 2.030,
                                moduleWidth: 0.98,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 72,
                                    cell_type: 'Monocrystalline',
                                    length: 2.03,
                                    manufacturer: 'Waaree Energies Ltd',
                                    model: 'WM-315-FX',
                                    p_mp_ref: 315,
                                    series: 'Merlin WM-310-330-FX',
                                    v_max: 1000,
                                    width: 0.98,
                                },
                                id: 20511,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'Merlin WM-310-330-FX WM-315-FX',
                            },
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                            rowSpacing: 0.025,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                        },
                        flushMount: {
                            mountHeight: 0.1,
                            structureType: 'Default Fixed Tilt',
                            tableSizeUp: 1,
                            tableSpacing: 0.025,
                            tableSizeWide: 1,
                            moduleSpacingUp: 0.025,
                            moduleProperties: {
                                moduleId: 20511,
                                moduleMake: 'Waaree Energies Ltd Merlin WM-310-330-FX WM-315-FX',
                                moduleSize: 0.315,
                                moduleLength: 2.030,
                                moduleWidth: 0.98,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 72,
                                    cell_type: 'Monocrystalline',
                                    length: 2.03,
                                    manufacturer: 'Waaree Energies Ltd',
                                    model: 'WM-315-FX',
                                    p_mp_ref: 315,
                                    series: 'Merlin WM-310-330-FX',
                                    v_max: 1000,
                                    width: 0.98,
                                },
                                id: 20511,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'Merlin WM-310-330-FX WM-315-FX',
                            },
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                            rowSpacing: 0.025,
                            rowSpacingMode: ROW_SPACING_MODE_MANUAL,
                        },
                        eastWestRacking: {
                            tilt: 5,
                            azimuth: 90,
                            structureType: 'Low Foundation Fixed Tilt',
                            mountHeight: 0.5,
                            intraRowSpacing:0.100,
                            interRowSpacingMode: 'Auto',
                            interRowSpacing:0.44,
                            tableSizeUp: 1,
                            tableSpacing: 0.025,
                            tableSizeWide: 1,
                            moduleSpacingUp: 0.025,
                            moduleProperties: {
                                moduleId: 20511,
                                moduleMake: 'Waaree Energies Ltd Merlin WM-310-330-FX WM-315-FX',
                                moduleSize: 0.315,
                                moduleLength: 2.030,
                                moduleWidth: 0.98,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 72,
                                    cell_type: 'Monocrystalline',
                                    length: 2.03,
                                    manufacturer: 'Waaree Energies Ltd',
                                    model: 'WM-315-FX',
                                    p_mp_ref: 315,
                                    series: 'Merlin WM-310-330-FX',
                                    v_max: 1000,
                                    width: 0.98,
                                },
                                id: 20511,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'Merlin WM-310-330-FX WM-315-FX',
                            },
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                        },
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
                    },
                    polygonModel: {
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
                    },
                    smartroofModel: {
                        tilt: 20,
                        setbackInside: 0.5,
                        coreHeight: 5,
                    },
                    dormer: {
                        tilt: 20,
                        setbackOutside: 0.5,
                    },
                    tree: {
                        treeId: 1,
                        isProportional: false,
                        trunkHeight: 10,
                        crownHeight: 15,
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
                    walkwayModel: {
                        coreHeight: 0.1,
                        width: 0.25,
                    },
                    structures: {
                        visible: false,
                        template: 'Default Fixed Tilt',
                    },
                },
            },
            nextURL: null,
            prevURL: null,
        };
    },
    watch: {
        searchProfileQuery(val) {
            this.$refs.prof.filter(val);
        }
    },
    computed: {
        ...mapState(useDesignStore, {
            GET_DESIGN_DISTANCE_UNIT: 'design/GET_DESIGN_DISTANCE_UNIT',
            GET_DESIGN_WIRING_UNIT: 'design/GET_DESIGN_WIRING_UNIT',
        }),
    },

    mounted() {
        this.fetchAllProfiles();
        let vm = this;

        serverBus.$on('profilesUpdated', () => {
            vm.fetchAllProfiles();
        });
    },
    beforeDestroy() {
        serverBus.$off('profilesUpdated');
        this.setMeasurementUnitState(this.measurementUnitInitialState);
        this.setWiringUnitState(this.wiringUnitInitialState);
    },
    methods: {
        ...mapActions(useDesignStore, [
            'SET_DISTANCE_UNIT',
            'SET_WIRING_UNIT',
        ]),
        addReportKeysToProfile() {
            this.allProfiles_.forEach(profile => {
                if (!profile.report_defaults.hasOwnProperty('pages')) {
                    profile.report_defaults.pages = reportPagesPlainListNonUs;
                }
                if (profile.report_defaults.hasOwnProperty('threed_data')) {
                    if (!profile.report_defaults.threed_data.hasOwnProperty('generation')) {
                        profile.report_defaults.threed_data.generation = true;
                    }
                    if (!profile.report_defaults.threed_data.hasOwnProperty('financial')) {
                        profile.report_defaults.threed_data.financial = true;
                    }
                } 
                else {
                    profile.report_defaults.threed_data = {
                        generation: true,
                        financial: true,
                    };
                }
                if (profile.report_defaults.hasOwnProperty('shadowAnalysis')) {
                    if (!profile.report_defaults.shadowAnalysis.hasOwnProperty('start_time_shadow_analysis')) {
                        profile.report_defaults.shadowAnalysis.start_time_shadow_analysis = '09:00:00';                            
                    }
                    if (!profile.report_defaults.shadowAnalysis.hasOwnProperty('end_time_shadow_analysis')) {
                        profile.report_defaults.shadowAnalysis.end_time_shadow_analysis = '17:00:00';                            
                    }
                }
                else {
                    profile.report_defaults.shadowAnalysis = {
                        start_time_shadow_analysis: '09:00:00',
                        end_time_shadow_analysis: '17:00:00',    
                    }
                } 
            })
        },
        addFixedAndFlushDefaultsToProfiles() {
            for (let i = 0, l = this.allProfiles_.length; i < l; i += 1) {
                const profile = this.allProfiles_[i];
                if (!('fixedMount' in profile.drawing_defaults.subarray)) {
                    if (profile.drawing_defaults.subarray.mountType === SUBARRAY_RACK_STYLE_FIXED) {
                        profile.drawing_defaults.subarray.mountType = SUBARRAY_RACK_STYLE_FIXED;
                        profile.drawing_defaults.subarray.fixedMount = {
                            tilt: profile.drawing_defaults.subarray.tilt,
                            structureType: profile.drawing_defaults.subarray.structureType,
                            azimuth: profile.drawing_defaults.subarray.azimuth,
                            mountHeight: profile.drawing_defaults.subarray.mountHeight,
                            tableSizeUp: profile.drawing_defaults.subarray.tableSizeUp,
                            tableSpacing: profile.drawing_defaults.subarray.tableSpacing,
                            tableSizeWide: profile.drawing_defaults.subarray.tableSizeWide,
                            moduleSpacingUp: profile.drawing_defaults.subarray.moduleSpacingUp,
                            moduleProperties: {
                                moduleId:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleId,
                                moduleMake:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleMake,
                                moduleSize:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleSize,
                                moduleLength:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleLength,
                                moduleWidth:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleWidth,
                            },
                            panelProperties:
                                profile.drawing_defaults.subarray.panelProperties,
                            panelOrientation: profile.drawing_defaults.subarray.panelOrientation,
                            moduleSpacingWide:
                                profile.drawing_defaults.subarray.moduleSpacingWide,
                            rowSpacing: 0.001,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                        };
                        profile.drawing_defaults.subarray.flushMount = {
                            structureType: 'Default Fixed Tilt',
                            mountHeight: 0.16,
                            tableSizeUp: 1,
                            tableSpacing: 0.025,
                            tableSizeWide: 1,
                            moduleSpacingUp: 0.025,
                            moduleProperties: {
                                moduleId: 20511,
                                moduleMake: 'Waaree Energies Ltd Merlin WM-310-330-FX WM-315-FX',
                                moduleSize: 0.315,
                                moduleLength: 2.030,
                                moduleWidth: 0.98,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 72,
                                    cell_type: 'Monocrystalline',
                                    length: 2.03,
                                    manufacturer: 'Waaree Energies Ltd',
                                    model: 'WM-315-FX',
                                    p_mp_ref: 315,
                                    series: 'Merlin WM-310-330-FX',
                                    v_max: 1000,
                                    width: 0.98,
                                },
                                id: 20511,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'Merlin WM-310-330-FX WM-315-FX',
                            },
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                            rowSpacing: 0.001,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                        };
                    }
                    else {
                        profile.drawing_defaults.subarray.mountType = SUBARRAY_RACK_STYLE_FLUSH;
                        profile.drawing_defaults.subarray.flushMount = {
                            mountHeight: profile.drawing_defaults.subarray.mountHeight,
                            structureType: profile.drawing_defaults.subarray.structureType,
                            tableSizeUp: profile.drawing_defaults.subarray.tableSizeUp,
                            tableSpacing: profile.drawing_defaults.subarray.tableSpacing,
                            tableSizeWide: profile.drawing_defaults.subarray.tableSizeWide,
                            moduleSpacingUp: profile.drawing_defaults.subarray.tableSizeUp,
                            moduleProperties: {
                                moduleId:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleId,
                                moduleMake:
                                    profile.drawing_defaults.subarray.moduleProperties.moduleMake,
                                moduleSize:
                                  profile.drawing_defaults.subarray.moduleProperties.moduleSize,
                                moduleLength:
                                  profile.drawing_defaults.subarray.moduleProperties.moduleLength,
                                moduleWidth:
                                  profile.drawing_defaults.subarray.moduleProperties.moduleWidth,
                            },
                            panelProperties:
                                profile.drawing_defaults.subarray.panelProperties,
                            panelOrientation:
                                profile.drawing_defaults.subarray.panelOrientation,
                            moduleSpacingWide:
                                profile.drawing_defaults.subarray.moduleSpacingWide,
                            rowSpacing: 0.001,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                        };
                        profile.drawing_defaults.subarray.fixedMount = {
                            tilt: 20,
                            structureType: 'Default Fixed Tilt',
                            azimuth: 180,
                            mountHeight: 1,
                            tableSizeUp: 1,
                            tableSpacing: 0.025,
                            tableSizeWide: 1,
                            moduleSpacingUp: 0.025,
                            moduleProperties: {
                                moduleId: 20511,
                                moduleMake: 'Waaree Energies Ltd Merlin WM-310-330-FX WM-315-FX',
                                moduleSize: 0.315,
                                moduleLength: 2.030,
                                moduleWidth: 0.98,
                            },
                            panelProperties: {
                                characteristics: {
                                    cell_number: 72,
                                    cell_type: 'Monocrystalline',
                                    length: 2.03,
                                    manufacturer: 'Waaree Energies Ltd',
                                    model: 'WM-315-FX',
                                    p_mp_ref: 315,
                                    series: 'Merlin WM-310-330-FX',
                                    v_max: 1000,
                                    width: 0.98,
                                },
                                id: 20511,
                                image: null,
                                image_link: null,
                                is_selected: true,
                                model: 'Merlin WM-310-330-FX WM-315-FX',
                            },
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                            rowSpacing: 0.001,
                            rowSpacingMode: ROW_SPACING_MODE_AUTO,
                        };
                    }
                }
                else {
                    if (!('rowSpacingMode' in profile.drawing_defaults.subarray.fixedMount)) {
                        profile.drawing_defaults.subarray.fixedMount.rowSpacing = 0.001;
                        profile.drawing_defaults.subarray.fixedMount.rowSpacingMode =
                            ROW_SPACING_MODE_AUTO;
                    }
                    if (!('rowSpacingMode' in profile.drawing_defaults.subarray.flushMount)) {
                        profile.drawing_defaults.subarray.flushMount.rowSpacing = 0.001;
                        profile.drawing_defaults.subarray.flushMount.rowSpacingMode =
                            ROW_SPACING_MODE_AUTO;
                    }
                }
                if ('azimuth' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.azimuth;
                }
                if ('tilt' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.tilt;
                }
                if ('structureType' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.structureType;
                }
                if ('mountHeight' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.mountHeight;
                }
                if ('tableSizeUp' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.tableSizeUp;
                }
                if ('tableSpacing' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.tableSpacing;
                }
                if ('tableSizeWide' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.tableSizeWide;
                }
                if ('moduleProperties' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.moduleProperties;
                }
                if ('panelProperties' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.panelProperties;
                }
                if ('moduleSpacingUp' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.moduleSpacingUp;
                }
                if ('moduleSpacingWide' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.moduleSpacingWide;
                }
                if ('panelOrientation' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.panelOrientation;
                }
                if ('azimuth' in profile.drawing_defaults.subarray) {
                    delete profile.drawing_defaults.subarray.azimuth;
                }
            }
        },
        addEastWestDefaultsToProfiles(){
            for (let i = 0, l = this.allProfiles_.length; i < l; i += 1) {
                const profile = this.allProfiles_[i];
                if(!profile.drawing_defaults) {
                    continue;
                }
                if (!('eastWestRacking' in profile.drawing_defaults.subarray)) {
                    profile.drawing_defaults.subarray = {
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
                            intraRowSpacing: 0.100,
                            interRowSpacingMode: 'Auto',
                            interRowSpacing: 0.44,
                            panelOrientation: 'Portrait',
                            tableSizeUp: 1,
                            tableSizeWide: 1,
                            tableSpacing: 0.025,
                        }
                    }
                }
            }
        },
        addHighResolutionShadowsToProfiles() {
            this.allProfiles_.forEach(profile => {
                if (profile.hasOwnProperty('shadows')) {
                    if(!profile.shadows.hasOwnProperty('high_resolution_shadows')) {
                        profile['shadows']['high_resolution_shadows'] = false;
                    }
                }
                else {
                    profile['shadows']['high_resolution_shadows'] = false;
                }
            });
        },
        addStructuresAndLossToProfiles() {
            this.allProfiles_.forEach(profile => {
                if (!profile.constant_losses.dc.hasOwnProperty('lid')) {
                    profile.constant_losses.dc.lid = 1.5;
                }
                if (!profile.constant_losses.hasOwnProperty('module_degradation_rate')) {
                    profile.constant_losses.module_degradation_rate = 1.5;
                }
                if (profile.drawing_defaults.hasOwnProperty('structures')) {
                    if(!profile.drawing_defaults.structures.hasOwnProperty('template')) {
                        profile['drawing_defaults']['structures']['template'] = 'Default Fixed Tilt';
                    }
                    if(!profile.drawing_defaults.structures.hasOwnProperty('visible')) {
                        profile['drawing_defaults']['structures']['visible'] = false;
                    }
                }
                else {
                    profile['drawing_defaults']['structures'] = {
                        'template': 'Default Fixed Tilt',
                        'visible': false,
                    }
                }
            })
        },

        addTreesToProfiles() {
            this.allProfiles_.forEach(profile => {
                if (profile.drawing_defaults.hasOwnProperty('tree')) {
                    if(!profile.drawing_defaults.tree.hasOwnProperty('trunkHeight')) {
                        profile['drawing_defaults']['tree']['trunkHeight'] = 10;
                    }
                    if(!profile.drawing_defaults.tree.hasOwnProperty('crownHeight')) {
                        profile['drawing_defaults']['tree']['crownHeight'] = 15;
                    }
                    if (!profile.drawing_defaults.tree.hasOwnProperty('treeId')) {
                        profile['drawing_defaults']['tree']['treeId'] = 1;
                    }
                    if (!profile.drawing_defaults.tree.hasOwnProperty('isProportional')) {
                        profile['drawing_defaults']['tree']['isProportional'] = false;
                    }
                }
                else {
                    profile['drawing_defaults']['tree'] = {
                        'trunkHeight': 10,
                        'crownHeight': 15,
                        'treeId': 1,
                        'isProportional': false,
                    }
                }
            });
        },

        addInvertersToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'inverter')) {
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.inverter, 'azimuth')) {
                        profile.drawing_defaults.inverter.azimuth = 90;
                    }
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.inverter, 'mountHeight')) {
                        profile.drawing_defaults.inverter.mountHeight = 1.2;
                    }
                }
                else {
                    profile.drawing_defaults.inverter = {
                        azimuth: 90,
                        mountHeight: 1.2,
                    };
                }
            });
        },

        addACDBToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'acdb')) {
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acdb, 'azimuth')) {
                        profile.drawing_defaults.acdb.azimuth = 90;
                    }
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acdb, 'mountHeight')) {
                        profile.drawing_defaults.acdb.mountHeight = 0.5;
                    }
                }
                else {
                    profile.drawing_defaults.acdb = {
                        azimuth: 90,
                        mountHeight: 0.5,
                    };
                }
            });
        },

        addACCABLEToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'acCable')) {
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acCable, 'materialType')) {
                        profile.drawing_defaults.acCable.materialType = 'aluminium';
                    }
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acCable, 'cableSizeMM')) {
                        profile.drawing_defaults.acCable.cableSizeMM = '1.5';
                    }
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acCable, 'cableSizeAWG')) {
                        profile.drawing_defaults.acCable.cableSizeAWG = '0000';
                    }
                    if (!Object.prototype.hasOwnProperty.call(profile.drawing_defaults.acCable, 'cores')) {
                        profile.drawing_defaults.acCable.cores = '1';
                    }
                }
                else {
                    profile.drawing_defaults.acCable = {
                        materialType: 'aluminium',
                        cableSizeMM: '1.5',
                        cores: '1',
                        cableSizeAWG: '0000',
                    };
                }
            });
        },

        getAllProfileTree() {
            	let unstructuredProfiles = JSON.parse(JSON.stringify(this.allProfiles_));

	            let profiles = [];
                unstructuredProfiles.forEach( function(arrayItem) {

                    let profileObj = {};
                    profileObj['id'] = arrayItem.id;
                    profileObj['label'] = arrayItem.name;
                    profiles.push(profileObj);
                });

                this.profileList = profiles;

            },
            
        addLockedParameterToProfiles() {
            this.allProfiles_.forEach(profile => {
                if (profile.drawing_defaults.hasOwnProperty('polygonModel')) {
                    if(!profile.drawing_defaults.polygonModel.hasOwnProperty('lockedParameter')) {
                        profile['drawing_defaults']['polygonModel']['lockedParameter'] =
                            TOP_HEIGHT_LOCKED;
                    }
                }
                if (profile.drawing_defaults.hasOwnProperty('cylinderModel')) {
                    if(!profile.drawing_defaults.polygonModel.hasOwnProperty('lockedParameter')) {
                        profile['drawing_defaults']['cylinderModel']['lockedParameter'] =
                            TOP_HEIGHT_LOCKED;
                    }
                }
            })
        },

        addSmartroofToProfiles(){
            this.allProfiles_.forEach((profile) => {
                if (profile.drawing_defaults.hasOwnProperty('smartroofModel')){
                    if (!profile.drawing_defaults.smartroofModel.hasOwnProperty('tilt')){
                        profile.drawing_defaults.smartroofModel.tilt = 20;
                    }
                    if (!profile.drawing_defaults.smartroofModel.hasOwnProperty('coreHeight')) {
                        profile.drawing_defaults.smartroofModel.coreHeight = 5;
                    }
                    if (!profile.drawing_defaults.smartroofModel.hasOwnProperty('setbackInside')) {
                        profile.drawing_defaults.smartroofModel.setbackInside = 0.5;
                    }
                }
                else{
                    profile.drawing_defaults.smartroofModel = {
                        tilt: 20,
                        coreHeight: 5,
                        setbackInside: 0.5,
                    };
                }
            })
        },

        addDormerToProfiles(){
            this.allProfiles_.forEach((profile) => {
                if (profile.drawing_defaults.hasOwnProperty('dormer')){
                    if (!profile.drawing_defaults.dormer.hasOwnProperty(tilt)){
                        profile.drawing_defaults.dormer.tilt = 20;
                    }
                    if (!profile.drawing_defaults.dormer.hasOwnProperty('setbackOutside')) {
                        profile.drawing_defaults.dormer.setbackOutside = 0.5;
                    }
                }
                else{
                    profile.drawing_defaults.dormer = {
                        tilt: 20,
                        setbackOutside: 0.5,
                    };
                }
            })
        },

        addCylindersToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if (profile.drawing_defaults.hasOwnProperty('cylinderModel')) {
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('tilt')) {
                        profile.drawing_defaults.cylinderModel.tilt = 0;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('azimuth')) {
                        profile.drawing_defaults.cylinderModel.azimuth = 180;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('ignored')) {
                        profile.drawing_defaults.cylinderModel.ignored = false;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('heatMapThreshold')) {
                        profile.drawing_defaults.cylinderModel.heatMapThreshold = 100;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('placable')) {
                        profile.drawing_defaults.cylinderModel.placable = true;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('coreHeight')) {
                        profile.drawing_defaults.cylinderModel.coreHeight = 2;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('parapetHeight')) {
                        profile.drawing_defaults.cylinderModel.parapetHeight = 0;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('setbackInside')) {
                        profile.drawing_defaults.cylinderModel.setbackInside = 0.5;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('setbackOutside')) {
                        profile.drawing_defaults.cylinderModel.setbackOutside = 0.5;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('parapetThickness')) {
                        profile.drawing_defaults.cylinderModel.parapetThickness = 0.3;
                    }
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('lockedParameter')) {
                        profile.drawing_defaults.cylinderModel.lockedParameter = TOP_HEIGHT_LOCKED;
                    }
                }
                else {
                    profile.drawing_defaults.cylinderModel = {
                        tilt: 0,
                        azimuth: 180,
                        ignored: false,
                        heatMapThreshold: 100,
                        placable: true,
                        coreHeight: 2,
                        parapetHeight: 0,
                        setbackInside: 0.5,
                        setbackOutside: 0.5,
                        parapetThickness: 0.3,
                        lockedParameter: TOP_HEIGHT_LOCKED,
                    };
                }
            });
        },

        changeDefaultsInProfiles() {
            // use this function to modify any other defaults.
            this.allProfiles_.forEach((profile) => {
                // change default placable property for polygonModel and cylinderModel
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'cylinderModel')) {
                    if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults.cylinderModel, 'heatMapThreshold')) {
                        profile.drawing_defaults.cylinderModel.heatMapThreshold = 100;
                    }
                }
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'polygonModel')) {
                    if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults.polygonModel, 'placable')) {
                        profile.drawing_defaults.polygonModel.placable = true;
                    }
                }
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'polygonModel')) {
                    if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults.polygonModel, 'heatMapThreshold')) {
                        profile.drawing_defaults.polygonModel.heatMapThreshold = 100;
                    }
                }
            });
        },

        async fetchAllProfiles() {
            try {
                let response = await API.DEFAULTS_PROFILE.FETCH_ALL_PROFILES();
                this.allProfiles_ = JSON.parse(JSON.stringify(response.data.results));

                this.addFixedAndFlushDefaultsToProfiles();
                this.addEastWestDefaultsToProfiles();
                this.addHighResolutionShadowsToProfiles();
                this.addStructuresAndLossToProfiles();
                this.addTreesToProfiles();
                this.addInvertersToProfiles();
                this.addACDBToProfiles();
                this.addReportKeysToProfile();
                this.getAllProfileTree();
                this.addCylindersToProfiles();
                this.addLockedParameterToProfiles();
                this.addACCABLEToProfiles();
                this.changeDefaultsInProfiles();
                this.addSmartroofToProfiles();
                this.addDormerToProfiles();

                this.nextURL = response.data.next;
                this.prevURL = response.data.prev;

                // set current node.
                // Using time out because after fetching tree takes some time to re render
                // Setting first one to be the default one

                if (this.allProfiles_.length > 0) {
                    setTimeout(() => {
                        this.selectedProfile = this.allProfiles_[0];
                        console.log("Ref before: ", this.$refs.prof);
                        this.$refs.prof.setCurrentKey(this.selectedProfile.id);
                        console.log("Ref: after", this.$refs.prof);
                        this.setMeasurementUnitState(this.selectedProfile.distance_unit);
                        this.setWiringUnitState(this.selectedProfile.wiring_unit);
                        this.isDataVisible = true;
                    }, 300);
                }
                else {
                    // when all profiles are deleted
                    this.isDataVisible = false;
                }
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error in fetching defaults userProfile. Try again.',
                    type: 'error',
                    center: true
                });
            }
        },

        goBack() {
            window.history.length > 1
                ? this.$router.go(-1)
                : this.$router.push('/')
        },

        setMeasurementUnitState(distanceUnit) {
            // Commit current profile distance unit
            this.SET_DISTANCE_UNIT(distanceUnit);
        },

        setWiringUnitState(wiringUnit) {
            // Commit current profile distance unit
            this.SET_WIRING_UNIT(wiringUnit);
        },

        selectedItem(data) {
            this.selectedProfileIndex = data.id;
            let vm = this;
            // Can't use direct ids. Won't sync
            this.allProfiles_.forEach(arrayItem => {
                if(arrayItem.id === data.id) {
                    vm.selectedProfile = arrayItem;
                    this.setMeasurementUnitState(this.selectedProfile.distance_unit);
                    if (this.selectedProfile.wiring_unit === 'millimeter_square') {
                        this.selectedProfile.wiring_unit = 'mmsq';
                    }
                    this.setWiringUnitState(this.selectedProfile.wiring_unit);
                }
            });
        },
        newProfile()  {
            let profileData = JSON.parse(JSON.stringify(this.defaultProfileData));
            serverBus.$emit('newEditProfileVisible', profileData, 'newProfile');
        },
        AcCableProperties()  {
            let profileData = JSON.parse(JSON.stringify(this.defaultProfileData));
            serverBus.$emit('newEditProfileVisible', profileData, 'AcCableProperties');
        },

        filterProfile(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },
        async loadMoreProfilesHelper(url) {
            try {
                const response = await API.DEFAULTS_PROFILE.FETCH_MORE_PROFILES(url);
                const newProfiles = response.data.results;
                newProfiles.forEach((item) => {
                    this.allProfiles_.push(item);
                });
                this.getAllProfileTree();
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
            }
            catch (e) {
                console.error();
            }
        },

        loadMoreProfiles() {
            if (this.nextURL !== null) {
                this.loadMoreProfilesHelper(this.nextURL);
            }
        },
    },
}
</script>


<style type="text/css" scoped>
.userFormWrapper {
    width: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding-top: 80px;
    padding-left: 15%;
    padding-right: 25%;
}

#allProfiles .backButton {
    font-size: 25px;
    color: #303133;
}

#allProfiles .backButton:hover {
    font-weight: bold;
}

#allProfiles >>> .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    color: #000;
}

#allProfiles >>> .el-tree {
    background-color: #f8f8f8;
    color: #121212;
}

#allProfiles >>> .el-tree-node__content:hover {
    color: #409eff;
    background-color: #e7f2ff;
}

#allProfiles >>> .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    color: #409eff;
    background-color: #e7f2ff;
}

#allProfiles .profilesContainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 65vh;
}

#allProfiles .profileContainerTreesDiv {
    width: 33%;
    height: 100%;
    overflow-y: scroll;
    background-color: #f8f8f8;
    border-right: 1px solid #d8d8d8;
    padding: 10px 0 0 0;
}

#allProfiles .profileContainerTreesDiv p{
    padding: 0 0 10px 10px;
}
#navBar .navBarRightButtons .navBarIcon, #navBar .navBarMidButtons .navBarIcon{
    padding: 0px
}
</style>

<style type="text/css">

    #allProfiles  .el-icon-caret-right {
        color:black;
    }

    #allProfiles .el-tree-node__expand-icon.is-leaf {
        color: transparent;
    }

	#allProfiles .backButton {

		font-size: 23px;
		color: #303133;
	}

	#allProfiles .backButton:hover {
		font-weight: bold;
	}

	#allProfiles   .custom-tree-node {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		padding-right: 8px;
		color: #000;
	}

	.el-tree {
		background-color: #f8f8f8;
		color: #121212;
	}

	.el-tree-node__content:hover {
		color: #409eff;
		background-color: #e7f2ff;
	}

	.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
		color: #409eff;
		background-color: #e7f2ff;
	}

	#allProfiles .profilesContainer {

		display: flex;
		flex-direction: row;
		justify-content: space-between;
		height: 65vh;

	}

	#allProfiles .profileContainerTreesDiv {

		width: 33%;
		height: 100%;
		overflow-y: scroll;
		background-color: #f8f8f8;
		border-right: 1px solid #d8d8d8;
		padding: 10px 0 10px 0;

	}

	#allProfiles .profileContainerTreesDiv p{
		padding: 0 0 10px 10px;
	}
    #navBar .navBarRightButtons .navBarIcon, #navBar .navBarMidButtons .navBarIcon{
        padding: 0px
    }


</style>

<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>

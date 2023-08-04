<template>
  <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
    <div class="content_section">
        <div v-if="windowWidth<1024" class="backLinkWrapper">
            <span class="backLink" :class="{ selected: step == '1' }" @click="moveToDesignProfiles">Design Profiles</span>
            <span v-if="step>1" class="backLink" :class="{ selected: step == 2 }" @click="moveToProperties"> / {{selectedProfile.name}}</span>
            <span v-if="step>2" class="backLink" :class="{ selected: step == 3 }"> / Properties</span>
        </div>
        <div class="filter_section">
        <div class="title" v-if="step==1 || windowWidth>1023">Design Defaults</div>
        <button v-if="windowWidth>1023" class="btn btn-primary" @click="newProfile">Create Design Profile</button>
        <!-- <button v-else class="btn btn-secondary" @click="previousStep()">Back</button> -->
      </div>
      <div class="design_section" style="min-height: 400px">
        <div class="col_area design_profile" v-if="step==1 || windowWidth>1023">
          <div class="header_title">
            <h4 v-if="windowWidth>1023">Design Profiles</h4>
            <div class="search_box">
              <input type="search" v-model="searchTerm" placeholder="Search profile by name"/>
              <i
              class="el-icon-search"
              v-if="searchTerm===''"
            ></i>
             <i
              v-else
              @click="searchTerm=''"
              class="el-icon-close"
            ></i>
            </div>
          </div>
          <div class="content_scroller">
            <ul class="profiles_list" v-for="data in profileList" :key="data.id">
              <li 
                :class="{active: data.id===selectedProfileIndex}"
                @click="selectedItem(data); nextStep()"
              >
                <span>{{data.label}}</span>
                <i class="fas fa-arrow-right"></i>
              </li>
            </ul>
            <div v-observe-visibility="handleScrollBottom" style="text-align: center">
              <i v-if="busy" class="el-icon-loading infiniteScrollLoader" />
            </div>
          </div>
        </div>
        <div v-if="!isDataVisible" :class="[ windowWidth>1023 ? 'loading-icon': 'mobile-view-loading-icon']" v-loading="true"></div>

        <ProfileTree :isDataVisible="isDataVisible" :windowWidth="windowWidth" v-show="step==2 || windowWidth>1023" @nextStep="nextStep()" :selectedProperty.sync="selectedProperty" />
        <DefaultData 
          v-if="isDataVisible" v-show=" step==3 || windowWidth>1023"
          :profileData="selectedProfile"
        />
      </div>
    </div>
    <NewEditProfile :selectedProperty.sync="selectedProperty" />
  </section>
</template>

<script>
import { defaultModuleId } from "../../../constants"
import {
  TOP_HEIGHT_LOCKED,
  SUBARRAY_RACK_STYLE_FLUSH,
  SUBARRAY_RACK_STYLE_FIXED,
  ROW_SPACING_MODE_AUTO,
  ROW_SPACING_MODE_MANUAL,
  SUBARRAY_RACK_STYLE_EWRACKING,
} from '../../../core/coreConstants';
import Vue from "vue";
import {serverBus} from '../../../main';
import ProfileTree from './profileTree.vue';
import DefaultData from './defaultData/defaultData.vue';
import NewEditProfile from './newEditProfile.vue';
import API from '../../../services/api/';
import { mapState, mapActions } from 'pinia';
import { useDesignStore } from "../../../stores/design";
import { ObserveVisibility } from "vue-observe-visibility";
import {
    isCrmUser,
    reportPagesPlainListUs,
    reportPagesPlainListNonUs,
} from "../../../utils";


Vue.directive("observe-visibility", ObserveVisibility);

export default {
    name: 'allProfiles',
    components: {
        ProfileTree,
        DefaultData,
        NewEditProfile,
    },
    data() {
        return {
            selectedProperty: {
                id: 1,
                label: 'General',
            },
            allProfiles_:[],
            windowWidth: window.innerWidth,
            step: 1,
            totalStep: 3,
            msg: ' I am in allProfiles',
            searchProfileQuery: '',
            currentPage: 'organisationSettings',
            isNewProfile: true,
            newEditProfileVisible: false,
            busy: false,
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
                name: '',
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
                    // pages : [... this.finalPages]
                    pages: JSON.parse(localStorage.getItem("user")).isUSFlagEnabled ?
                    reportPagesPlainListUs : reportPagesPlainListNonUs,
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
                            panelOrientation: 'Portrait',
                            moduleSpacingWide: 0.025,
                        },
                    },
                    cylinderModel: {
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
                    },
                    polygonModel: {
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
                    },
                    smartroofModel: {
                        tilt: 20,
                        setbackInside: 0.5,
                        coreHeight: 5,
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
            },
            nextURL: null,
            prevURL: null,
            searchTerm: '',
            pages: reportPagesPlainListNonUs,
            pagesForUS: reportPagesPlainListUs,        
        };
    },
    watch: {
        searchProfileQuery(val) {
            this.$refs.prof.filter(val);
        },
        async searchTerm() {
            await this.fetchAllProfiles(this.searchTerm);
        },
    },
    computed: {
        ...mapState(useDesignStore, {
            GET_DESIGN_DISTANCE_UNIT: 'design/GET_DESIGN_DISTANCE_UNIT',
            GET_DESIGN_WIRING_UNIT: 'design/GET_DESIGN_WIRING_UNIT',
        }),
        flagForUS(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
        },
        finalPages(){
            if(this.flagForUS){
                return this.pagesForUS;
            }
            else{
                return this.pages;
            }
        }
    },

    mounted() {
        this.fetchAllProfiles();
        let vm = this;

        serverBus.$on('profilesUpdated', () => {
            vm.fetchAllProfiles();
        });
        window.onresize = () => {
                this.windowWidth = window.innerWidth
            };
    },
    beforeDestroy() {
        serverBus.$off('profilesUpdated');
        this.setMeasurementUnitState(this.measurementUnitInitialState);
        this.setWiringUnitState(this.wiringUnitInitialState);
    },
    methods: {
        isCrmUser,
        ...mapActions(useDesignStore, [
            'SET_DISTANCE_UNIT',
            'SET_WIRING_UNIT',
        ]),
        addReportKeysToProfile() {
            this.allProfiles_.forEach(profile => {
                if(!profile.report_defaults)
                  return;
                if (!profile.report_defaults.hasOwnProperty('pages')) {
                    profile.report_defaults.pages =  [... this.finalPages];
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
                if(!profile.drawing_defaults)
                continue;
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
                                moduleId: defaultModuleId,
                                moduleMake: 'The Solar Labs SolarLabs TSL-310-330-FX TSL-315-FX',
                                moduleSize: 0.315,
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
                            tilt: 5,
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
                if(!profile.constant_losses)
                return;
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
                if(!profile.drawing_defaults)
                return;
                if (profile.drawing_defaults.hasOwnProperty('tree')) {
                    if(!profile.drawing_defaults.tree.hasOwnProperty('trunkHeight')) {
                        profile['drawing_defaults']['tree']['trunkHeight'] = 10;
                    }
                    if(!profile.drawing_defaults.tree.hasOwnProperty('crownHeight')) {
                        profile['drawing_defaults']['tree']['crownHeight'] = 15;
                    }
                    if(!profile.drawing_defaults.tree.hasOwnProperty('treeId')) {
                        profile['drawing_defaults']['tree']['treeId'] = 1;
                    }
                    if(!profile.drawing_defaults.tree.hasOwnProperty('isProportional')) {
                        profile['drawing_defaults']['tree']['isProportional'] = false;
                    }
                }
                else {
                    profile['drawing_defaults']['tree'] = {
                        'treeId': 1,
                        'isProportional': false,
                        'trunkHeight': 10,
                        'crownHeight': 15,
                    }
                }
            })
        },

        addInvertersToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if(!profile.drawing_defaults)
                return;
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
                if(!profile.drawing_defaults)
                return;
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
                if(!profile.drawing_defaults)
                return;
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
                if(!profile.drawing_defaults)
                    return;
                if (profile.drawing_defaults.hasOwnProperty('polygonModel')) {
                    if(!profile.drawing_defaults.polygonModel.hasOwnProperty('lockedParameter')) {
                        profile['drawing_defaults']['polygonModel']['lockedParameter'] =
                            TOP_HEIGHT_LOCKED;
                    }
                    if(!profile.drawing_defaults.polygonModel.hasOwnProperty('heatMapThreshold')) {
                        profile['drawing_defaults']['polygonModel']['heatMapThreshold'] =
                            100;
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

        addQuickViewToProfies() {
            this.allProfiles_.forEach((profile) => {
                if(!profile.drawing_defaults)
                    return;
                if (profile.drawing_defaults.hasOwnProperty('quickView')) {
                    if (!profile.drawing_defaults.quickView.hasOwnProperty('moduleArea')) {
                        profile.drawing_defaults.quickView.moduleArea = 100;
                    }
                    if (!profile.drawing_defaults.quickView.hasOwnProperty('ridgeLocked')) {
                        profile.drawing_defaults.quickView.ridgeLocked = true;
                    }
                    if (!profile.drawing_defaults.quickView.hasOwnProperty('roofArea')) {
                        profile.drawing_defaults.quickView.roofArea = 0;
                    }
                    if (!profile.drawing_defaults.quickView.hasOwnProperty('totalModules')) {
                        profile.drawing_defaults.quickView.totalModules = 0;
                    }
                }
                else {
                    profile.drawing_defaults.quickView = {
                        moduleArea: 100,
                        roofArea: 0,
                        totalModules: 0,
                        smartroofSetbacks:{
                            ridge: 0.4572,
                            eaves: 0.0,
                            hips: 0.4572,
                            valley: 0.4572,
                            rack: 0.4572,
                        },
                        ridgeLocked: true,
                    }
                }
            });
        },

        addCylindersToProfiles() {
            this.allProfiles_.forEach((profile) => {
                if(!profile.drawing_defaults)
                    return;
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
                    if (!profile.drawing_defaults.cylinderModel.hasOwnProperty('heatMapThreshold')) {
                        profile.drawing_defaults.cylinderModel.heatMapThreshold = 100;
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
                if(!profile.drawing_defaults)
                return;
                // change default placable property for polygonModel and cylinderModel
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'cylinderModel')) {
                    if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults.cylinderModel, 'placable')) {
                        profile.drawing_defaults.cylinderModel.placable = true;
                    }
                }
                if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults, 'polygonModel')) {
                    if (Object.prototype.hasOwnProperty.call(profile.drawing_defaults.polygonModel, 'placable')) {
                        profile.drawing_defaults.polygonModel.placable = true;
                    }
                }
            });
        },

        async fetchAllProfiles() {
            try {
                let response = await API.DEFAULTS_PROFILE.FETCH_ALL_SEARCHED_PROFILES(this.searchTerm);
                // allProfiles old is added that if we dont get any response from above api then
                // just have the results of old all Profiles into allProfiles_
                let allProfiles_Old = [... this.allProfiles_];
                this.allProfiles_ = [];

                for(let i1=0;i1<(response.data.results.length) ; i1++){
                    if(response.data.results[i1].name && response.data.results[i1].drawing_defaults)
                    this.allProfiles_.push(response.data.results[i1]);
                }
                if(this.allProfiles_.length==0)
                this.allProfiles_ = [... allProfiles_Old];

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
                this.addQuickViewToProfies();
                this.changeDefaultsInProfiles();
                this.addSmartroofToProfiles();

                this.nextURL = response.data.next;
                this.prevURL = response.data.prev;

                // set current node.
                // Using time out because after fetching tree takes some time to re render
                // Setting first one to be the default one

                if (this.allProfiles_.length > 0) {
                    setTimeout(() => {
                        this.selectedProfile = this.allProfiles_[0];
                        // this.$refs.prof.setCurrentKey(this.selectedProfile.id);
                        this.selectedProfileIndex = this.selectedProfile.id;
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

        nextStep() {
            if(this.step<this.totalStep)
            this.step++;
        },

        previousStep() {
            this.step--;
        },

        moveToProperties() {
            this.step=2;
        },

        moveToDesignProfiles() {
            this.step=1;
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
          console.log("Selected item: ", data);
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
            console.log("Clicked")
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
                this.busy = true;
                const response = await API.DEFAULTS_PROFILE.FETCH_MORE_PROFILES(url);
                const newProfiles = response.data.results;
                newProfiles.forEach((item) => {
                    this.allProfiles_.push(item);
                });
                this.getAllProfileTree();
                this.nextURL = response.data.next;
                this.prevURL = response.data.previous;
                this.busy = false;
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
        handleScrollBottom(isVisible) {
          if (!isVisible) {
            return;
          }
          this.loadMoreProfiles();
        },
    },
}
</script>

<style scoped>
.infiniteScrollLoader {
  font-size: 20px;
}
.el-icon-search{
cursor:pointer;
position: absolute; 
right: 20px;
top: 33%;
}
.el-icon-close{
cursor:pointer;
position: absolute; 
right: 20px;
top: 33%;
}
.selected {
  color: #1c3366;
}
.loading-icon{
    margin-left: 35%;
}

.mobile-view-loading-icon{
    margin-top: 100px;
}

@media (min-width: 1281px) {
.right_sectionCRM {
  width: calc(100% - 74px) !important;
  margin-left: auto;
}
}

</style>
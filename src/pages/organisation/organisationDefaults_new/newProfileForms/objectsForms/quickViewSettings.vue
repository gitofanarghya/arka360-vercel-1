<template>
    <div id="quickSettingsForm">
        <VuePerfectScrollbar class="scroll-area">

            <el-form
                :model="profileData.drawing_defaults.smartroofModel"
                :label-position="labelPosition"
                label-width="250px"
                size="mini">
                <p class="formHeadings">PROPERTIES</p>

                <el-form-item label="Smartroof Model Tilt">
                    <input
                        v-validate="{
                            between: {
                                min: 2,
                                max: 60,
                            },
                            decimal: 1,
                        }"
                        v-model.number="profileData.drawing_defaults.smartroofModel.tilt"
                        type="number"
                        class="inputBoxStyler"
                        autocomplete="off"
                        name="Tilt"
                        step="any">
                    <p class="formErrors"><span>{{ errors.first('Tilt') }}</span></p>
                </el-form-item>

                <el-form-item v-if="!isVipPowerGazebo" label="Module">
                    <infinite-scroll-dropdown-panel
                        :panel.sync="subarrayPanel"
                        :module-id="profileData
                        .drawing_defaults.subarray['flushMount'].moduleProperties.moduleId"
                        :component-id="panelInfiniteScrollId"/>
                </el-form-item>
                <p> Smartroof Setbacks </p>
                <el-form-item label="Ridge">
                    <img
                        :class="[profileData.drawing_defaults.quickView.ridgeLocked ? 'icon-lock' : 'icon-unlock']"
                        src="https://front-end-assests.s3-us-west-2.amazonaws.com/auto-black.png"
                        @click="lockParameter()"
                    >
                    <input-length
                        v-model="profileData.drawing_defaults.quickView.smartroofSetbacks.ridge"
                        :name="'SetbackRidge'"
                        :disabled="profileData.drawing_defaults.quickView.ridgeLocked"
                        :metric-validation="{
                            required: !profileData.drawing_defaults.quickView.ridgeLocked,
                            min_value: 0,
                            decimal: 3,
                        }"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('SetbackRidge') }}</span></p>
                </el-form-item>

                <el-form-item label="Eaves">
                    <input-length
                        v-model="profileData.drawing_defaults.quickView.smartroofSetbacks.eaves"
                        :name="'SetbackEaves'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('SetbackEaves') }}</span></p>
                </el-form-item>

                <el-form-item label="Hips">
                    <input-length
                        v-model="profileData.drawing_defaults.quickView.smartroofSetbacks.hips"
                        :name="'SetbackHips'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('SetbackHips') }}</span></p>
                </el-form-item>

                <el-form-item label="Valley">
                    <input-length
                        v-model="profileData.drawing_defaults.quickView.smartroofSetbacks.valley"
                        :name="'SetbackValley'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('SetbackValley') }}</span></p>
                </el-form-item>

                <el-form-item label="Rack">
                    <input-length
                        v-model="profileData.drawing_defaults.quickView.smartroofSetbacks.rack"
                        :name="'SetbackRack'"
                        :metric-validation="setbackInsideValidation"
                        :class-input="'inputBoxStyler'"
                        :error-view-ancestor="this"
                    />
                    <p class="formErrors"><span>{{ errors.first('SetbackRack') }}</span></p>
                </el-form-item>

                <div v-if="isOrgUnirac">
                    <el-form-item label="Number of Modules">
                        <input
                            v-model.number="profileData.drawing_defaults.quickView.totalModules"
                            name="ModuleCount"
                            v-validate="moduleCountValidation"
                            type="number"
                            class="inputBoxStyler"
                            autocomplete="off"
                            step="any"
                        />
                        <p class="formErrors"><span>{{ errors.first('ModuleCount') }}</span></p>
                    </el-form-item>

                    <el-form-item label="Total module area">
                        <input
                            v-model.number="profileData.drawing_defaults.quickView.moduleArea"
                            disabled="true"
                            name="ModuleArea"
                            type="number"
                            class="inputBoxStyler"
                            autocomplete="off"
                            step="any"
                        />%
                        <p class="formErrors"><span>{{ errors.first('ModuleArea') }}</span></p>
                    </el-form-item>

                    <el-form-item label="Total roof area">
                        <input
                            v-model.number="profileData.drawing_defaults.quickView.roofArea"
                            disabled="true"
                            name="RoofArea"
                            type="number"
                            class="inputBoxStyler"
                            autocomplete="off"
                            step="any"
                        />%
                        <p class="formErrors"><span>{{ errors.first('RoofArea') }}</span></p>
                    </el-form-item>
                </div>
            </el-form>
        </VuePerfectScrollbar>

    </div>

</template>

<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import infiniteScrollDropdownPanel from
    '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue';

export default {
    name: 'quickViewSettingsForm',
    components: {
        VuePerfectScrollbar,
        infiniteScrollDropdownPanel
    },
    props: {
        profileData: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            labelPosition: 'left',
            subarrayPanel: {},
            panelInfiniteScrollId: 'flushMountPanel',
            setbackInsideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            moduleCountValidation: {
                required: true,
                min_value: 0,
                decimal: 0,
            },
            isOrgUnirac : false,
            isVipPowerGazebo: false,
        };
    },
    computed: {
    },
    watch: {
        subarrayPanel: {
            deep: true,
            handler(value) {
                this.profileData.drawing_defaults.subarray['flushMount']
                    .moduleProperties.moduleId = parseInt(value.id, 10);
                this.profileData.drawing_defaults.subarray['flushMount']
                    .moduleProperties.moduleMake =
                        `${value.characteristics.manufacturer}  ${value.model}`;
                this.profileData.drawing_defaults.subarray['flushMount']
                    .moduleProperties.moduleLength = parseFloat(value.characteristics.length);
                this.profileData.drawing_defaults.subarray['flushMount']
                    .moduleProperties.moduleWidth = parseFloat(value.characteristics.width);
                this.profileData.drawing_defaults.subarray['flushMount']
                    .moduleProperties.moduleSize =
                        parseFloat(value.characteristics.p_mp_ref / 1000);
                this.profileData.drawing_defaults.subarray['flushMount']
                    .panelProperties = value;
            },
        },
    },
    async mounted() {
        this.isVipPowerGazebo = await this.setGazeboStatus();
        this.isOrganisationUnirac();
    },
    methods: {
        async isOrganisationUnirac() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            const organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!Object.keys(responseData).length){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            this.isOrgUnirac = (responseData.name === 'Unirac' && responseData.id === 114 );
        },
        lockParameter() {
            this.profileData.drawing_defaults.quickView.ridgeLocked = !this.profileData.drawing_defaults.quickView.ridgeLocked;
            if (this.profileData.drawing_defaults.quickView.ridgeLocked) {
                this.profileData.drawing_defaults.quickView.smartroofSetbacks.ridge = '';
                // const scope = this;
                // this.$nextTick(() => {
                //     scope.$validator.validate('SetbackRidge');
                // });
            }
        },
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        }
    },
};
</script>
<style type="text/css">

    #newProfile .el-dialog__body {
        text-align: left
    }

    #newProfile .formHeadings {
        color: #606266;
        font-size: 14px;
        text-align: left;
        padding-bottom: 10px;
        padding-top: 0px;
        font-weight: 600;
    }

    #quickSettingsForm .scroll-area {
        position: relative;
        margin: auto;
        width: 100%;
        height: 55vh;
    }

    #quickSettingsForm .icon-lock {
        opacity: 1;
    }

    #quickSettingsForm .icon-unlock {
        opacity: 0.2;
    }

    #quickSettingsForm .icon-lock, #quickSettingsForm .icon-unlock {
        height: 20px;
        border: 0px;
        background-color: transparent;
        border-color: transparent;
        padding: 0;
        position: absolute;
        left: -60px;
        font-size: 16px;
        top: 6px;
    }

</style>

<template>
    <div id="organisationSettings">
        <el-header class="navBar-container">
            <navBar :current-page="currentPage" />
        </el-header>
        <div
            class="userFormWrapper"
            style="padding-right: 15%;">
            <div style="padding-bottom: 20px;">
                <i
                    class="el-icon-arrow-left backButton"
                    @click="goBack"/>
                <h1 style="display: inline-block;">Organisation</h1>
            </div>
            <el-row>
                <el-col :span="15">
                    <div style="margin-left: 18px;">
                        <el-form
                            :model="organisationSettingsData"
                            label-position="top"
                            label-width="150px"
                            @submit.native.prevent>
                            <el-form-item
                                label="Name"
                                required>
                                <el-input
                                    v-validate="organisationNameValidation"
                                    v-model="organisationSettingsData.name"
                                    name="Name"/>
                                <p class="formErrors">
                                    <span>
                                        {{ errors.first('Name') }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Contact Number"
                                required>
                                <el-input
                                    v-validate="contactNumberValidation"
                                    v-model="organisationSettingsData.phone"
                                    name="Contact Number"/>
                                <p class="formErrors">
                                    <span>
                                        {{ errors.first('Contact Number') }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Email"
                                required>
                                <el-input
                                    v-validate="emailValidation"
                                    v-model="organisationSettingsData.email"
                                    name="Email"/>
                                <p class="formErrors">
                                    <span>{{ errors.first('Email') }}</span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Website"
                                required>
                                <el-input
                                    v-validate="websiteValidation"
                                    v-model="organisationSettingsData.website"
                                    name="Website"/>
                                <p class="formErrors">
                                    <span>{{ errors.first('Website') }}</span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Address"
                                required>
                                <el-input
                                    v-validate="addressValidation"
                                    v-model="organisationSettingsData.address"
                                    name="Address"/>
                                <p class="formErrors">
                                    <span>{{ errors.first('Address') }}</span>
                                </p>
                            </el-form-item>
                            
                            <el-form-item 
                                label="About Us"
                                class="notRequiredFields"> 
                                <el-input 
                                    type="textarea"
                                    v-validate="{max: 900, regex: /^\s*\S+(?:\s+\S+){0,199}\s*$/}" 
                                    v-model="organisationSettingsData.aboutUs"
                                    name="aboutUs">
                                </el-input>
                                <p class="formErrors">
                                    <span>{{ errors.first('aboutUs') }}</span>
                                </p>
                            </el-form-item>

                            <!-- TODO: Nearmap pushed and leaving code for later -->
                            <!-- <div style="display: flex;">
                                <el-form-item
                                    class="notRequiredFields"
                                    style="margin-bottom: 0px; flex-grow: 1;"
                                    label="Nearmap API" />

                                <el-switch
                                    v-model="organisationSettingsData.nearmapEnabled"
                                    name="NearmapEnabled"
                                    @change="toggleNearmapSwitch"
                                />
                            </div>

                            <div style="padding-left: 10px">
                                <el-input
                                    v-validate="nearmapApiKeyValidation"
                                    v-show="organisationSettingsData.nearmapEnabled"
                                    v-model="organisationSettingsData.nearmapApiKey"
                                    placeholder="Nearmap API Key"
                                    name="Nearmap API Key"/>
                                <p class="formErrors">
                                    <span>{{ errors.first('Nearmap API Key') }}</span>
                                </p>
                            </div> -->

                            <el-form-item
                                size="small"
                                style="padding-top: 20px;">
                                <button
                                    class="button-confirm"
                                    @click="updateOrganisationSettings()"
                                    :disabled="errors.items.length > 0">
                                    Update
                                </button>
                                <button
                                    class="button-cancel"
                                    @click="onOrganisationCancel()">
                                    Cancel
                                </button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-col>
                <el-col :span="9">
                    <div class="logoText">Logo:</div>
                    <el-upload
                        :before-upload="beforeLogoUpload"
                        class="logo-uploader"
                        id="organisationLogoID"
                        accept=".jpeg,.jpg,.png,"
                        action="">
                        <img
                            v-if="organisationSettingsData.logoUrl"
                            :src="organisationSettingsData.logoUrl"
                            class="organisationLogo">
                        <i
                            class="el-icon-plus logo-uploader-icon"/>
                    </el-upload>
                    <div class="logoText" style="font-size: 10px">
                        <span>&#42;</span> Click on Logo to update.<br>
                        <span>&#42;</span> Only JPG/PNG format is allowed.
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import API from '@/services/api/';
import navBar from '@/components/ui/navBar/navBar.vue';
import { Validator } from 'vee-validate';

const dict = {
  custom: {
    aboutUs: {
      max: 'The About Us field can contain a maximum of 900 characters',
      regex: 'The About Us field can contain a maximum of 200 words'
    },
  }
};

Validator.localize('en', dict);

export default {
    name: 'OrganisationSettings',
    components: {
        navBar,
    },

    data() {
        return {
            msg: ' I am in organisationSettings',
            currentPage: 'organisationSummary',
            organisationSettingsData: {
                name: '',
                phone: '',
                email: '',
                website: '',
                cin: '',
                address: '',
                logoUrl: '',
                aboutUs: '',
                nearmapEnabled: false,
                nearmapApiKey: '',
            },
            organisationSettingsDataTemp: {
                name: '',
                phone: '',
                email: '',
                website: '',
                cin: '',
                address: '',
                logoUrl: '',
                aboutUs: '',
                nearmapEnabled: false,
                nearmapApiKey: '',
            },
            organisationNameValidation: {
                required: true,
            },
            contactNumberValidation: {
                required: true,
            },
            emailValidation: {
                required: true,
            },
            websiteValidation: {
                required: true,
            },
            addressValidation: {
                required: true,
            },
            aboutUsValidation: {
                max: 900
            }
        };
    },
    computed: {
        nearmapApiKeyValidation() {
            return {
                required: this.organisationSettingsData.nearmapEnabled,
            };
        },
    },
    created() {
        this.fetchOrganisationSettings();
    },
    methods: {
        goBack() {
            window.history.length > 1
                ? this.$router.go(-1)
                : this.$router.push('/')
        },

        success() {
            this.$message({
                showClose: true,
                message: 'Organisation Settings are updated successfully.',
                type: 'success',
                center: true
            });
        },

        failure() {
            this.$message({
                showClose: true,
                message: 'Error in updating Organisation settings. Try Again.',
                type: 'error',
                center: true
            });
        },

        async updateOrganisationSettings() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const token = user.token;
            const organisationId = user.organisation_id;

            if (token) {
                const patchData = {
                    name: this.organisationSettingsData.name,
                    address: this.organisationSettingsData.address,
                    email_id: this.organisationSettingsData.email,
                    phone: this.organisationSettingsData.phone,
                    cin: this.organisationSettingsData.cin,
                    website: this.organisationSettingsData.website,
                    about_us: this.organisationSettingsData.aboutUs,
                    nearmap_enabled: this.organisationSettingsData.nearmapEnabled,
                    nearmap_api_key: this.organisationSettingsData.nearmapApiKey,
                };
                // to patch the logo only if it has changed
                if (this.organisationSettingsDataTemp.logoUrl !== this.organisationSettingsData.logoUrl) {
                    patchData.logo = this.organisationSettingsData.logoUrl;
                }

                try {
                    const response = await API.ORGANISATION.PATCH_ORGANISATION_SETTINGS(organisationId, patchData);
                    localStorage.setItem('organisation',JSON.stringify(response.data));

                    this.organisationSettingsDataTemp.name = this.organisationSettingsData.name;
                    this.organisationSettingsDataTemp.address = this.organisationSettingsData.address;
                    this.organisationSettingsDataTemp.email = this.organisationSettingsData.email;
                    this.organisationSettingsDataTemp.phone = this.organisationSettingsData.phone;
                    this.organisationSettingsDataTemp.cin = this.organisationSettingsData.cin;
                    this.organisationSettingsDataTemp.website = this.organisationSettingsData.website;
                    this.organisationSettingsDataTemp.logoUrl = this.organisationSettingsData.logoUrl;
                    this.organisationSettingsDataTemp.aboutUs = this.organisationSettingsData.aboutUs;
                    this.organisationSettingsDataTemp.nearmapEnabled = this.organisationSettingsData.nearmapEnabled;
                    this.organisationSettingsDataTemp.nearmapApiKey = this.organisationSettingsData.nearmapApiKey;
                    this.success();
                }
                catch (error) {
                    this.failure();
                    this.onOrganisationCancel();
                }
            }
        },

        onOrganisationCancel() {
            this.organisationSettingsData.address = this.organisationSettingsDataTemp.address;
            this.organisationSettingsData.name = this.organisationSettingsDataTemp.name;
            this.organisationSettingsData.cin = this.organisationSettingsDataTemp.cin;
            this.organisationSettingsData.email = this.organisationSettingsDataTemp.email;
            this.organisationSettingsData.phone = this.organisationSettingsDataTemp.phone;
            this.organisationSettingsData.website = this.organisationSettingsDataTemp.website;
            this.organisationSettingsData.logoUrl = this.organisationSettingsDataTemp.logoUrl;
            this.organisationSettingsData.aboutUs = this.organisationSettingsDataTemp.aboutUs;
            this.organisationSettingsData.nearmapEnabled =
                this.organisationSettingsDataTemp.nearmapEnabled;
            this.organisationSettingsData.nearmapApiKey =
                this.organisationSettingsDataTemp.nearmapApiKey;
        },

        async fetchOrganisationSettings() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const token = user.token;
            const organisationId = user.organisation_id;

            if (token) {
                try {
                    // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisationId);
                    let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
                    const resultOrganisationData = responseData;
                    if(!Object.keys(responseData).length){
                        responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
                    }
                     resultOrganisationData = responseData;
                    this.organisationSettingsDataTemp.name =
                        resultOrganisationData.name;
                    this.organisationSettingsDataTemp.address =
                        resultOrganisationData.address;
                    this.organisationSettingsDataTemp.email =
                        resultOrganisationData.email_id;
                    this.organisationSettingsDataTemp.phone =
                        resultOrganisationData.phone;
                    this.organisationSettingsDataTemp.cin =
                        resultOrganisationData.cin;
                    this.organisationSettingsDataTemp.website =
                        resultOrganisationData.website;
                    this.organisationSettingsDataTemp.logoUrl =
                        resultOrganisationData.logo;
                    this.organisationSettingsDataTemp.aboutUs =
                        resultOrganisationData.about_us;
                    this.organisationSettingsDataTemp.nearmapEnabled =
                        ((resultOrganisationData.nearmap_enabled === undefined) ? false : resultOrganisationData.nearmap_enabled);
                    this.organisationSettingsDataTemp.nearmapApiKey =
                        ((resultOrganisationData.nearmap_api_key === undefined) ? '' : resultOrganisationData.nearmap_api_key);

                    // Creating two copies of response data to provide cancel
                    // functionality without making a api call
                    this.onOrganisationCancel();
                }
                catch (e) {
                    console.error();
                }
            }
        },

        beforeLogoUpload(file) {
            const isLt256KB = file.size / 1024 < 256;
            const vm = this;

            // taking the base64 string if image size is less than 256KB

            if (!isLt256KB) {
                this.$message.error('Image size can not exceed 256KB!')
            }
            else {
                const fileReader = new FileReader();
                fileReader.onload = function (fileLoadedEvent) {
                    vm.organisationSettingsData.logoUrl =
                    fileLoadedEvent.target.result;
                };
                fileReader.readAsDataURL(file);
            }
            // this ensures that no request is sent on action url
            return false;
        },

        toggleNearmapSwitch(enabled) {
            if (!enabled) {
                this.organisationSettingsData.nearmapApiKey = '';
            }
            this.$nextTick(() => {
                this.$validator.validateAll();
            });
        },
    },
};
</script>

<style scoped>
#organisationSettings >>> .el-textarea__inner {
    min-height: 200px !important;
}

#organisationSettings >>> .notRequiredFields .el-form-item__label {
    padding-left: 10px;
}

#organisationSettings >>> .el-form-item__label {
    color: #000;
    line-height: 20px;
    font-size: 16px;
}

.userFormWrapper >>> .el-form-item__content {
    padding-left: 10px;
}

.userFormWrapper >>> .el-input__inner {
    font-size: 12px;
}

.userFormWrapper {
    width: 100%;
    box-sizing: border-box;
    padding-top: 80px;
    padding-left: 15%;
    padding-right: 30%;
    text-align: left;
}

#organisationSettings .backButton {
    font-size: 23px;
    color: #303133;
}

#organisationSettings .backButton:hover {
    font-weight: bold;
    cursor: pointer;
}

.logo-uploader {
    margin: 0 0 10px 5vw;
    position: relative;
    width: 130px;
}

.logo-uploader >>> .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
}

#organisationLogoID:hover >>> .el-upload{
    border: 1px dashed #363535;
    border-radius: 6px;
}

#organisationLogoID:hover img{
    opacity: 0.3;
}

#organisationLogoID:hover .logo-uploader-icon{
    color: rgb(54, 53, 53);
}

.logo-uploader-icon {

    position: absolute;
    left: 55px;
    top: 55px;
    cursor: pointer;
    text-align: center;
    color: transparent;
    opacity: 0.8;
    font-size: 20px;
    background-color: transparent;
    -webkit-transition: opacity .3s;
    transition: opacity .3s;
}

.organisationLogo {
    width: 130px;
    height: 130px;
    display: block;
    border-radius: 6px;
}

.logoText {
    margin: 0 0 10px 5vw;
    font-size: 16px;
    color: #000;
    width: 125px;
}
</style>

<style lang="scss" scoped>
@import '../../../styles/components/button';
@import '../../../styles/components/forms';
</style>

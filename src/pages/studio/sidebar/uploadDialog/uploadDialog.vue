<template>
    <div id="upload-box-container">
        <el-dialog
            :visible="uploadBoxVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            title="Add Map"
            width="60%"
            @open="openDialog"
            @close="closeDialog">

            <div
                v-loading="isImageBeingApplied"
                style="display: flex"
                element-loading-background="rgba(255, 255, 255, 0.8)"
                element-loading-text="Updating Map. Please Wait....."
                element-loading-spinner="el-icon-loading">
                <!-- treating as separate form-items -->
                <div
                    v-bar
                    style="width: 50%; height: 55vh;">
                    <el-form
                        :model="uploadImageInformation"
                        style="text-align: left">
                        <el-form-item>
                            <el-radio
                                v-model="uploadImageInformation.currentSelectedRemote"
                                label="remoteImage"
                                @change="handleSelectedRadioOption">
                                Select other source
                            </el-radio>
                        </el-form-item>
                        <el-form-item>
                            <el-select
                                size="small"
                                style="width: 85%;"
                                @change="selectOptionFromDropDown"
                                :popper-append-to-body="false"
                                popper-class="remoteImageDropdown"
                                :disabled="uploadImageInformation.currentSelectedRemote !== 'remoteImage'"
                                v-model="uploadImageInformation.selectedOtherSource"
                                placeholder="Select">
                                <el-option
                                    v-for="(value, key) in uploadImageInformation.otherSourcesOptions"
                                    :key="key"
                                    :disabled="!isThisFeatureEnabled[value] && (value == 'Nearmap HD Imagery with 3D data' || value == 'Nearmap HD Imagery')"
                                    :label="value"
                                    :value="key">
                                    <div class="flexContainer">
                                        <div class="">
                                            <p class="flexContainer">{{value}}
                                                <img src="../../../../assets/drop/Group 2086.svg"
                                                v-if="!isThisFeatureEnabled[value] && (value == 'Nearmap HD Imagery with 3D data' || value == 'Nearmap HD Imagery')" />
                                            </p>
                                            <p class="credits" v-if="!isThisFeatureEnabled[value] && (value == 'Nearmap HD Imagery with 3D data' || value == 'Nearmap HD Imagery')">
                                                {{findCreditsOfThisFeature[value]}} Credits
                                            </p>
                                        </div>
                                        
                                        <p v-if="!isThisFeatureEnabled[value] && (value == 'Nearmap HD Imagery with 3D data' || value == 'Nearmap HD Imagery')">
                                            <el-button type="primary" class="upgradeBtn"  @click="isProjectUpgradePopupVisible = true">Upgrade</el-button>
                                        </p>
                                    </div>   
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-radio
                                v-model="uploadImageInformation.currentSelectedRemote"
                                label="customImage"
                                @change="handleSelectedRadioOption">
                                Custom image
                            </el-radio>
                        </el-form-item>
                        <el-form-item v-show="images.length > 0">
                            <el-radio
                                v-model="uploadImageInformation.currentSelectedRemote"
                                label="previousSelection"
                                @change="handleSelectedRadioOption">
                                Previous Selections
                            </el-radio>
                            <div>
                                <div
                                    @click="previewThumbnail(index)"
                                    v-for="(item, index) in images"
                                    :key="index"
                                    :class="[(uploadImageInformation.currentSelectedRemote === 'previousSelection' && previousSelectedIndex === index) ? 'thumbnailEnabled' : 'thumbnailDisabled',
                                    (uploadImageInformation.currentSelectedRemote !== 'previousSelection') ? 'pointerDisable' : 'cursorpointer']"
                                    class="thumbnails">
                                    <TransformedImage
                                        :image-src="item.url"
                                        :scale="item.scale"
                                        :rotation="item.rotation"
                                        :offset="item.offset"
                                        :default-ground-size="defaultGroundSize"
                                        :ground-size="groundSize"
                                        :key="index"
                                        style="height: 100%"
                                    />
                                </div>
                            </div>
                        </el-form-item>
                        <div
                            v-show="errorInFetchingImages"
                            style="word-break: break-word; width: 85%">
                            Error in fetching previously selected images. Please refresh.
                        </div>
                    </el-form>
                </div>
                <div style="width: 50%; margin: 0 0 0 5%; text-align: center">
                    <el-upload
                        v-show="showUploadButton"
                        :show-file-list="false"
                        :before-upload="validateCustomImageUpload"
                        class="avatar-uploader"
                        action="#">
                        <i class="el-icon-plus avatar-uploader-icon" />
                        <span style="margin-top: 10px">Upload image</span>
                        <span style="margin-top: 4px; font-size: 11px">
                            <i>Max size: 20MB; Allowed formats: jpg, png</i>
                        </span>
                    </el-upload>
                    <img
                        v-if="showAvatar"
                        :src="customImageData"
                        class="avatar"
                    >
                    <div style="">
                        <TransformedImage
                            v-show="showMapImage"
                            ref="mapImage"
                            :image-src="selectedImage.url"
                            :offset="selectedImage.offset"
                            :rotation="selectedImage.rotation"
                            :scale="selectedImage.scale"
                            :on-image-load="imageApplied"
                            :default-ground-size="defaultGroundSize"
                            :ground-size="groundSize"
                            style="height: 27vw; width: 27vw"
                        />
                    </div>
                    <div
                        v-show="showImageError"
                        style="word-break: break-word">
                        {{ errorMessage }}
                    </div>
                    <div v-if="uploadImageInformation.selectedOtherSource!=='EagleView' && uploadImageInformation.selectedOtherSource!=='nearmap3D'">    
                        <el-slider
                            v-if="showZoomSlider"
                            v-model="zoomlevel"
                            :step=1
                            :max="maxZoom"
                            show-input>
                        </el-slider>
                    </div>
                </div>
            </div>
            <span slot="footer">
                <button
                    :disabled="editButtonDisabled"
                    class="button-confirm"
                    @click="editImage">
                    <span>Edit</span>
                </button>
                <button
                    :disabled="updateButtonDisabled"
                    class="button-confirm"
                    @click="updateImage">
                    <span>Update</span>
                </button>
                <button
                    class="button-cancel"                    
                    :disabled="isImageBeingApplied"
                    @click="$emit('update:uploadBoxVisible', false);">
                    Cancel
                </button>
            </span>
        </el-dialog>
        <project-upgrade-popup v-if="isProjectUpgradePopupVisible"
            :isProjectUpgradePopupVisible.sync="isProjectUpgradePopupVisible" />
    </div>

</template>

<script>
import axios from 'axios';
import {
    UPDATE_MAP_IMAGE,
    SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE,
    SIDEBAR_UPDATE_UPLOAD_DIALOG_IMAGES,
} from '../../../../componentManager/componentManagerConstants';

import { mapState, mapActions } from 'pinia';
import TransformedImage from './TransformedImage.vue';
import * as utils from '../../../../core/utils/utils';
import { getCroppedImage, scaleMetersToRatio } from '../../../../core/utils/customImageEditUtils';
import API from '@/services/api/';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from "../../../../constants";
import { INVALID_SCALE } from '../../../../core/coreConstants';
import md5 from 'crypto-js/hmac-md5';
import { useDesignStore } from '../../../../stores/design';
import { useProjectStore } from '../../../../stores/project';


export default {
    name: 'UploadDialog',
    components: {
        TransformedImage,
    },
    props: {
        uploadBoxVisible: {
            type: Boolean,
            default: false,
        },
        getImageDimensions: {
            type: Function,
            default: () => {},
        },
        getDefaultGroundSize: {
            type: Function,
            default: () => {},
        },
        fetchLidarData: {
            type: Function,
            default: () => {},
        },
    },
    computed: {
        ...mapState(useDesignStore,{
            designVersionImageryData: 'GET_DESIGN_VERSION_IMAGERY_DATA',
            getAllFeaturesFromDesign : 'GET_TOTAL_FEATURES',
        }),
        ...mapState(useProjectStore, {
            getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
        }),
        // ...mapGetters('design', {
        //     getAllFeaturesFromDesign : 'GET_TOTAL_FEATURES',
        // }),
        getAllFeatures(){
            if(this.$route.params.projectId && this.getAllFeaturesFromProject.available_features)
            return this.getAllFeaturesFromProject
            else if(this.$route.params.designId && this.getAllFeaturesFromDesign.available_features)
            return  this.getAllFeaturesFromDesign

            // return ( this.getAllFeaturesFromProject || this.getAllFeaturesFromDesign);
        },
        editButtonDisabled() {
            return this.isImageBeingApplied ||
                (this.selectedImage.imageType === this.IMAGE_STATES.CUSTOM_IMAGE &&
                !this.customImageData) ||
                this.selectedImage.source === 'nearmap3D' ||
                this.selectedImage.imageType === this.IMAGE_STATES.IMAGE_ERROR;
        },
        updateButtonDisabled() {
            return this.isImageBeingApplied ||
                this.selectedImage.imageType === this.IMAGE_STATES.CUSTOM_IMAGE ||
                this.selectedImage.imageType === this.IMAGE_STATES.IMAGE_ERROR;
        },
        showUploadButton() {
            return this.selectedImage.imageType === this.IMAGE_STATES.CUSTOM_IMAGE &&
                !this.customImageData;
        },
        showAvatar() {
            return this.customImageData &&
                this.selectedImage.imageType === this.IMAGE_STATES.CUSTOM_IMAGE;
        },
        showMapImage() {
            return this.selectedImage.imageType === this.IMAGE_STATES.MAP_IMAGE;
        },
        showImageError() {
            return this.selectedImage.imageType === this.IMAGE_STATES.IMAGE_ERROR;
        },
        showZoomSlider() {
            return this.uploadImageInformation.currentSelectedRemote!=='previousSelection'
            && !(this.uploadImageInformation.selectedOtherSource ==='Nearmap HD Imagery with 3D data')
            && this.uploadImageInformation.currentSelectedRemote != "customImage"
        }
    },
    data() {
        return {
            maxZoom:21,
            evApiKey:null,
            evSecretKey:null,
            evToken:null,
            evTransacId:null,
            previousSelectedIndex: 0,
            errorInFetchingImages: false,
            areImagesFetched : false,
            versionId: null,
            uploadImageInformation: {
                currentSelectedRemote: 'previousSelection',
                otherSourcesOptions: {
                    google_maps: 'Google Maps',
                    bing: 'Bing',
                    esri: 'Esri',

                    // Nearmap3DData: 'Nearmap 3D Data'
                },
                selectedOtherSource: 'google_maps',
            },
            customImageData: '',
            selectedImage: {
                imageType: 'map',
                url: '',
            },
            nearmapApiKey: undefined,
            errorMessage: '',
            images: [],
            latitude: null,
            longitude: null,
            zoomlevel: null,
            projectID: null,
            currentStudioImageId: null,
            designId: this.$route.params["designId"],
            isImageBeingApplied: false,
            IMAGE_STATES: {
                MAP_IMAGE: 'map',
                IMAGE_ERROR: 'error',
                CUSTOM_IMAGE: 'custom-image',
            },
            groundSize: 0,
            defaultGroundSize: 0,
            isProjectUpgradePopupVisible: false,
            availableFeaturesInCheckbox:[],
            isThisFeatureEnabled:{},
            findCreditsOfThisFeature:{},

        };
    },
    mounted() {
        this.updateNearmapApiKey();
        this.updateEagleViewApiKey();
    },
    methods: {
        ...mapActions(useDesignStore, [
            'PATCH_DESIGN_VERSION_MAP_IMAGE',
        ]),


        // async evAuth(){

        // var currentUnixTimestap = ~~(+new Date() / 1000);
        // var evSignature =  md5(`${this.evApiKey}${currentUnixTimestap}`,`${this.evSecretKey}`).toString()
        //     try {
        //         const authResponse = await axios.get(`https://pol.pictometry.com/Gateway/v1/authenticate/95EA4962BE2E0F97CEBD4067A1D4AF39/${currentUnixTimestap}/${evSignature}`);
        //          this.evToken=authResponse.data.response.token;
        //          this.uploadImageInformation.otherSourcesOptions['EagleView'] = 'EagleView';
        //     }
        //     catch (error) {
        //         console.log("Auth Error");
        //     }


        // },

        // async searchEagleView(){
        //         this.maxZoom = 24;
        //         this.isImageBeingApplied = true;
        //         const latLongString = `${this.latitude},${this.longitude}`;
        //          const searchResponse= await axios.get(`https://pol.pictometry.com/Gateway/v1/search/${latLongString}/${this.evToken}`);
        //          if(searchResponse.data.response.statusCode === "2013")
        //          {   
        //             this.errorMessage = 'EagleView image not available for this location';
        //             this.selectedImage.imageType = this.IMAGE_STATES.IMAGE_ERROR;
        //              this.isImageBeingApplied = false;
        //          }
        //          else{
        //             this.evTransacId=searchResponse.data.response.transactionId;
        //             this.evImage();
        //          }
        // },

        async updateNearmapApiKey() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const { token } = user;
            const organisationId = user.organisation_id;

            if (token) {
                // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisationId);
                let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
                if(!Object.keys(responseData).length){
                    responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
                }
                // if (responseData.nearmap_enabled) {
                //     this.uploadImageInformation.otherSourcesOptions['nearmap'] = 'Nearmap Hi-Res Imagery';
                // }
                // if (responseData.nearmap_enabled && responseData.is_lidar_enabled) {
                //     this.uploadImageInformation.otherSourcesOptions['nearmap3D'] = 'Nearmap 3D Data';
                // }

                // this for loop is the replacement of the above two if conditions//
                for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
                    this.uploadImageInformation.otherSourcesOptions[this.availableFeaturesInCheckbox[i].name] = this.availableFeaturesInCheckbox[i].name;
                }
            }
        },

        getAllAvailableFeatures(){
            let selfDesigningInfo =  JSON.parse(localStorage.getItem("allServicesInfo")).self_designing_info;
            if(selfDesigningInfo['input_checkbox'] && selfDesigningInfo['input_checkbox'].length){
                this.availableFeaturesInCheckbox = [...selfDesigningInfo.available_features];
            }
        },
        fetchAvailedFeaturesID(){
            try{
                // const response =  await API.PROJECTS.FETCH_AVAILED_FEATURES(this.projectID);
                // this.availedFeaturesIdsList = [... response.data.availed_features];
                // this.availedFeaturesIdsListInitial = [... response.data.availed_features];

                this.availedFeaturesIdsList = [... this.getAllFeatures.availed_features];
                this.availedFeaturesIdsListInitial = [... this.getAllFeatures.availed_features];
                // console.log("project features, design features, main features",this.getAllFeaturesFromProject,this.getAllFeaturesFromDesign,this.getAllFeatures);
                // this.availedFeaturesIdsListInitial = []; //static, will remove later
                // this.availedFeaturesIdsList = []; //static, will remove later
                this.assignMoreKeyToTotalAvaibleObj(this.availedFeaturesIdsList);
                // console.log("availed features IDs list", this.availedFeaturesIdsList);
            }
            catch(e){
                console.log("error inside design when fetching availed info",e);
                this.$message({
                showClose: true,
                message: "Not able to fetch availed Features",
                type: "error",
                center: true
                });
            }
        },
        assignMoreKeyToTotalAvaibleObj(availedIDsList){
            for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
                if(availedIDsList.includes(this.availableFeaturesInCheckbox[i].id)){
                    this.availableFeaturesInCheckbox[i]['isSelected'] = true;
                    this.isThisFeatureEnabled[this.availableFeaturesInCheckbox[i].name] = true; 
                }
                else{
                    this.availableFeaturesInCheckbox[i]['isSelected'] = false;
                    this.isThisFeatureEnabled[this.availableFeaturesInCheckbox[i].name] = false;
                }
                this.findCreditsOfThisFeature[this.availableFeaturesInCheckbox[i].name] = this.availableFeaturesInCheckbox[i].credits;
            }
        },
        // findCreditsOfThisFeature(featureName){
        //     for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
        //         if(this.availableFeaturesInCheckbox[i].name == featureName)
        //         {
        //            return this.availableFeaturesInCheckbox[i].credits;
        //         }
        //     }
        // },
        // isThisFeatureDisabled(featureName){
        //     for(let i=0;i<this.availableFeaturesInCheckbox.length;i++){
        //         if(this.availableFeaturesInCheckbox[i].name == featureName)
        //         {
        //             if( this.availableFeaturesInCheckbox[i]['isSelected'])
        //             return false;
        //             else
        //             return true;
        //         }
        //     }
        //     return false;
        // },
        async updateEagleViewApiKey() {
            const designInfo = await API.DESIGNS.FETCH_DESIGN(this.$route.params["designId"]);
            if(designInfo.data.project.country===52)
            {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const { token } = user;
            const organisationId = user.organisation_id;
            if (token) {
                // const response = await API.ORGANISATION.FETCH_ORGANISATION(organisationId);
                let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
                if(!Object.keys(responseData).length){
                    responseData = ( await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
                }
                 if (responseData.is_eagle_view_enabled){
                    this.uploadImageInformation.otherSourcesOptions['EagleView'] = 'Eagle View';
                 }
                }
            }
            
        },
        


        imageApplied() {
            this.isImageBeingApplied = false;
        },

        handleSelectedRadioOption(selectedRadioValue) {
            if (selectedRadioValue === 'remoteImage') {
                this.selectOptionFromDropDown(this.uploadImageInformation.selectedOtherSource);
            }
            else if (selectedRadioValue === 'previousSelection') {
                this.previewThumbnail(this.previousSelectedIndex);
            }
            else if (selectedRadioValue === 'customImage') {
                this.selectedImage = {
                    imageType: this.IMAGE_STATES.CUSTOM_IMAGE,
                    url: '',
                };
            }
        },

        validateCustomImageUpload(file) {
            const isValidFormat = file.type === 'image/png' || file.type === 'image/jpeg';
            const underSizeLimit = file.size / 1024 / 1024 < 20;

            if (!underSizeLimit) {
                this.$message.error('Picture size can not exceed 20MB!');
            }
            if (!isValidFormat) {
                this.$message.error('Picture must be JPG or PNG format!');
            }
            const vm = this;

            if (isValidFormat && underSizeLimit) {
                const fileReader = new FileReader();
                fileReader.onload = (fileLoadedEvent) => {
                    vm.customImageData = fileLoadedEvent.target.result;
                };
                fileReader.readAsDataURL(file);
            }

            return false;
        },

        setGoogleMapsImage() {
            this.maxZoom = 21;
            this.isImageBeingApplied = true;
            this.selectedImage = {
                url: `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude},${this.longitude}&scale=2&zoom=${this.zoomlevel}&maptype=satellite&size=512x512&key=${GOOGLE_API_KEY}`,
                imageType: this.IMAGE_STATES.MAP_IMAGE,
                rotation: 0,
                scale: this.selectedImage.scale,
                offset: [0, 0],
                source: 'google',
                zoom: this.zoomlevel,
            };
            this.selectedImage.url = utils.signRequest(this.selectedImage.url, GOOGLE_SIGNING_SECRET);
            this.imageApplied();
        },

        async setBingMapImage() {
            this.maxZoom = 19;
            const maxZoomLevel = 19;

            this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
            this.isImageBeingApplied = true;
            if (this.zoomlevel > maxZoomLevel) {
                const imageURL = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/${this.latitude},${this.longitude}/${maxZoomLevel}?mapSize=512,512&dpi=Large&key=Aqffsw1BfSx4Bx0PYJI78MnSh2cbHe2Lh9fLf2JNHxLWWEK9jirkbmImXzlug1Im`;
                this.selectedImage.url = await getCroppedImage(imageURL, 2 ** (this.zoomlevel - maxZoomLevel));
            }
            else {
                this.selectedImage.url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/${this.latitude},${this.longitude}/${this.zoomlevel}?mapSize=512,512&key=Aqffsw1BfSx4Bx0PYJI78MnSh2cbHe2Lh9fLf2JNHxLWWEK9jirkbmImXzlug1Im`;
            }
            this.selectedImage.rotation = 0;
            this.selectedImage.scale = this.getDefaultGroundSize().width;
            this.selectedImage.offset = [0, 0];
            this.selectedImage.source = 'bing';
            this.selectedImage.zoom = this.zoomlevel,
            this.imageApplied();
        },

        async setEsriImage() {
            this.maxZoom = 19;
            const maxZoomLevel = 19;

            this.isImageBeingApplied = true;
            const topLeftLatLong = utils.getLatLngOfGivenPixel(
                this.latitude,
                this.longitude,
                Math.min(this.zoomlevel, maxZoomLevel),
                512,
                512,
                0,
                0,
            );
            const bottomRightlatlong = utils.getLatLngOfGivenPixel(
                this.latitude,
                this.longitude,
                Math.min(this.zoomlevel, maxZoomLevel),
                512,
                512,
                512,
                512,
            );
            const [xmin, ymin] = this.lngLatToXY(topLeftLatLong.lng, topLeftLatLong.lat);
            const [xmax, ymax] = this.lngLatToXY(bottomRightlatlong.lng, bottomRightlatlong.lat);
            if (this.zoomlevel <= maxZoomLevel) {
                this.selectedImage.url = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${xmin},${ymin},${xmax},${ymax}&dpi=800&size=512,512&f=image`;
            }
            else {
                const imageURL = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${xmin},${ymin},${xmax},${ymax}&dpi=400&size=512,512&f=image`;
                this.selectedImage.url = await getCroppedImage(imageURL, 2 ** (this.zoomlevel - maxZoomLevel));
            }
            this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
            this.selectedImage.rotation = 0;
            this.selectedImage.scale = this.getDefaultGroundSize().width;
            this.selectedImage.offset = [0, 0];
            this.selectedImage.source = 'esri';
            this.selectedImage.zoom = this.zoomlevel,
            this.imageApplied();
        },

        // async setNearmapImage() {
        //     this.maxZoom = 24;
        //     this.isImageBeingApplied = true;
        //     const latLongString = `${this.longitude},${this.latitude}`;

        //     // TODO: Get this domain rotation number
        //     const domainRotationNumber = 1;

        //     // TODO: Confirm if the date is in UTC
        //     const currentDate = new Date();
        //     const currentMonth = currentDate.getUTCMonth() + 1;
        //     const month = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
        //     const day = currentDate.getUTCDate() < 10 ? `0${currentDate.getUTCDate()}` : currentDate.getUTCDate();
        //     const date = `${currentDate.getUTCFullYear()}${month}${day}`;

        //     // TODO: Move this somewhere else
        //     // Checking if the place has coverage in nearmap
        //     let response;
        //     try {
        //         response = await axios.get(`https://api.nearmap.com/coverage/v2/point/${latLongString}?apikey=${this.nearmapApiKey}`);
        //         this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
        //     }
        //     catch (error) {
        //         if (error.response.status === 401) {
        //             this.errorMessage = 'Incorrect API Key';
        //             this.selectedImage.imageType = this.IMAGE_STATES.IMAGE_ERROR;
        //         }
        //         this.isImageBeingApplied = false;
        //         return;
        //     }

        //     // TODO: Check if it has coverage using response
        //     if (response.data.surveys.length > 0) {
        //         // TODO: rc
        //         const rc = 'us';
        //         this.selectedImage.url = `http://${rc}${domainRotationNumber}.nearmap.com/staticmap?center=${this.latitude},${this.longitude}&size=1024x1024&zoom=${this.zoomlevel}&date=${date}&httpauth=false&apikey=${this.nearmapApiKey}`;
        //     }
        //     else {
        //         this.errorMessage = 'Nearmap image not available for this location';
        //         this.selectedImage.imageType = this.IMAGE_STATES.IMAGE_ERROR;
        //     }
        //     this.isImageBeingApplied = false;
        // },


        //  async evImage(){
        //     this.isImageBeingApplied = true;
        //     this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
        //     this.selectedImage.url=`https://pol.pictometry.com/Gateway/v1/image/${this.evTransacId}/D/0/${this.evToken}/width:512;height:512`;
        //     this.selectedImage.rotation = 0;
        //     this.selectedImage.scale = this.getDefaultGroundSize().width;
        //     this.selectedImage.offset = [0, 0];         
        //     this.isImageBeingApplied = false;
        // },
        async setNearmapLidar(){
            this.isImageBeingApplied = true;
            this.fetchLidarData().then(
                (url) => {
                    this.selectedImage.url = url;
                    this.selectedImage.rotation = 0;
                    this.selectedImage.scale = this.getDefaultGroundSize().width;
                    this.selectedImage.offset = [0, 0];
                    this.selectedImage.source = 'nearmap3D';
                    this.selectedImage.zoom = this.zoomlevel;
                    this.imageApplied();
                },
                () => {
                    this.imageApplied();
                    this.handleImageApplyingError();
                }
            );
        },

        async setNearmapImage(){
                this.maxZoom = 24;
                const currentDate = new Date();
                const currentMonth = currentDate.getUTCMonth() + 1;
                const month = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
                const day = currentDate.getUTCDate() < 10 ? `0${currentDate.getUTCDate()}` : currentDate.getUTCDate();
                const date = `${currentDate.getUTCFullYear()}-${month}-${day}`;
                this.isImageBeingApplied = true;
                let postData = {
                        "latitude": this.latitude,
                        "longitude": this.longitude,
                        "zoom": this.zoomlevel,
                        "date": date
                    }
                let nearMapBase64 = await API.FETCH_MAP.FETCH_NEARMAP_MAP(this.projectID, postData);
                var nearMapImage = new Image();
                nearMapImage.src = `data:image/png;base64, ${nearMapBase64.data}`;
                this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
                this.selectedImage.url= nearMapImage.src;
                this.selectedImage.rotation = 0;
                this.selectedImage.scale = this.getDefaultGroundSize().width;
                this.selectedImage.offset = [0, 0];
                this.selectedImage.source = 'nearmap';
                this.selectedImage.zoom = this.zoomlevel,

                this.isImageBeingApplied = false;
        },

        async evImage(){
            try{
                this.isImageBeingApplied = true;
                let evImageBase64 = await API.FETCH_MAP.FETCH_EAGLEVIEW_MAP(this.projectID);
                this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
                this.selectedImage.url= evImageBase64.data.url;
                this.selectedImage.rotation = 0;
                this.selectedImage.scale = this.getDefaultGroundSize().width;
                this.selectedImage.offset = [0, 0];   
                this.selectedImage.source = 'eagleview';
                this.selectedImage.zoom = this.zoomlevel,
                this.isImageBeingApplied = false;
            }
            catch(error){

            }
        },

        selectOptionFromDropDown(selectedValue) {
            switch (selectedValue) {
            case 'google_maps':
                this.setGoogleMapsImage();
                break;
            case 'bing':
                this.setBingMapImage();
                break;
            case 'esri':
                this.setEsriImage();
                break;
            // case 'nearmap':
            case 'Nearmap HD Imagery':
                this.setNearmapImage();
                break;
            // case 'nearmap3D':
            case 'Nearmap HD Imagery with 3D data':
                this.setNearmapLidar();
                break;
            case 'EagleView':
                this.evImage();
                break;
            default:
                console.error('ERROR: uploadDialog.vue - selectOptionFromDropDown - unknown option selected')
            }
        },

        previewThumbnail(index) {
            // create a local value for index to use it to show the previously selected one
            this.previousSelectedIndex = index;
            // console.log(this.images[index].id);
            this.selectedImage = {
                id: this.images[index].id,
                url: this.images[index].url,
                rotation: this.images[index].rotation,
                offset: this.images[index].offset,
                scale: this.images[index].scale,
                zoom: this.images[index].zoom,
                source: this.images[index].source,
                imageType: this.IMAGE_STATES.MAP_IMAGE,
            };
        },

        async editImage() {
            this.isImageBeingApplied = true;
            await new Promise(r => setTimeout(() => {
                r();
                this.$emit('update:uploadBoxVisible', false);
            }, 300));

            const transformations = {
                scale: this.selectedImage.scale,
                rotation: this.selectedImage.rotation,
                offset: this.selectedImage.offset,
            };

            if (this.uploadImageInformation.currentSelectedRemote === 'previousSelection') {
                const imageId = this.selectedImage.id;
                const response =
                    await API.PROJECTS.FETCH_PROJECT_MAP_IMAGE(this.selectedImage.id);

                this.$eventBus.$emit(
                    SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE,
                    response.data.image,
                    imageId,
                    transformations,
                );
            }
            else if (this.uploadImageInformation.currentSelectedRemote === 'customImage') {
                this.$eventBus.$emit(
                    SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE,
                    this.customImageData,
                    null,
                    {},
                );
            }
            else {
                this.$eventBus.$emit(
                    SWITCH_TO_CUSTOM_IMAGE_EDIT_MODE,
                    this.selectedImage.url,
                    null,
                    transformations,
                );
            }
            // this.isImageBeingApplied = false;
            this.areImagesFetched = true;

            this.$eventBus.$once(SIDEBAR_UPDATE_UPLOAD_DIALOG_IMAGES, (updateImage, imageData) => {
                this.isImageBeingApplied = false;
                if (updateImage) {
                    let imagePosition = -1;
                    for (let imageIndex = 0; imageIndex < this.images.length; imageIndex += 1) {
                        const image = this.images[imageIndex];
                        if (image.id === imageData.id) {
                            imagePosition = imageIndex;
                            break;
                        }
                    }

                    if (imagePosition === -1) {
                        this.images.push({
                            id: imageData.id,
                            url: imageData.url,
                            scale: imageData.scale,
                            rotation: imageData.rotation,
                            offset: imageData.offset,
                        });
                        this.previousSelectedIndex = this.images.length - 1;
                    }
                    else {
                        this.images[imagePosition].scale = imageData.scale;
                        this.images[imagePosition].rotation = imageData.rotation;
                        this.images[imagePosition].offset = imageData.offset;

                        this.previousSelectedIndex = imagePosition;
                    }

                    this.previewThumbnail(this.previousSelectedIndex);

                    this.groundSize = this.getImageDimensions().width;
                    this.defaultGroundSize = this.getDefaultGroundSize().width;
                }
            });
        },

        // Upload image and update source
        async updateImage() {
            if (this.uploadImageInformation.currentSelectedRemote === 'remoteImage') {
                this.getImageFromUrl(this.selectedImage.url, (dataUrl) => {
                    this.updateImageOnStage(dataUrl, this.selectedImage.source, this.selectedImage.zoom);
                });
            }
            else if (this.uploadImageInformation.currentSelectedRemote === 'previousSelection') {
                try {
                    this.isImageBeingApplied = true;
                    // generates a diff. url, overcomes CORS
                    this.currentStudioImageId = this.images[this.previousSelectedIndex].id;
                    const patchData = {
                        map_image: this.currentStudioImageId,
                    };
                    await this.PATCH_DESIGN_VERSION_MAP_IMAGE(patchData);
                    const imageURLForStudio = await this.getImageThroughId(this.currentStudioImageId);
                    this.$eventBus.$emit(
                        UPDATE_MAP_IMAGE,
                        {
                            url: imageURLForStudio,
                            scale: this.selectedImage.scale,
                            offset: this.selectedImage.offset,
                            rotation: this.selectedImage.rotation,
                            source: this.selectedImage.source,
                            zoom: this.selectedImage.zoom,
                        },
                    );
                    this.isImageBeingApplied = false;
                    this.$emit('update:uploadBoxVisible', false);
                }
                catch (e) {
                    this.isImageBeingApplied = false;
                    this.handleImageApplyingError(e);
                }
            }
        },
        async getImageThroughId(imageId) {

            try {
                const response = await API.PROJECTS.FETCH_PROJECT_MAP_IMAGE(imageId);
                return response.data.image;
            }
            catch (e) {
                throw e;
            }
        },
        async updateImageOnStage(postRequestImageUrl, imageSource, zoomLevel) {
            try {
                const postImageObject = {
                    image: postRequestImageUrl,
                    rotation: 0,
                    scale: INVALID_SCALE,
                    offset: [0, 0],
                    source: imageSource,
                    zoom: zoomLevel,
                };
                const response = await API.PROJECTS.POST_CURRENT_STUDIO_IMAGE(this.projectID, postImageObject);
                
                this.currentStudioImageId = response.data.id;
                const patchData = {
                    map_image: this.currentStudioImageId,
                };
                await this.PATCH_DESIGN_VERSION_MAP_IMAGE(patchData);
                this.$eventBus.$emit(
                    UPDATE_MAP_IMAGE,
                    {
                        url: response.data.image,
                        rotation: 0,
                        scale: INVALID_SCALE,
                        offset: [0, 0],
                        source: imageSource,
                        zoom: zoomLevel,
                    },
                );
                this.isImageBeingApplied = false;
                // pushing latest image info in images array
                let containsImage = false;
                for (let obj of this.images) {
                    if (obj.id === response.data.id) {
                        containsImage = true;
                    }
                }
                if (!containsImage) {
                    this.images.push({ id: response.data.id, url: response.data.image });
                }
                this.$emit('update:uploadBoxVisible', false);
            }
            catch (e) {
                this.isImageBeingApplied = false;
                this.handleImageApplyingError(e);
            }
        },

        handleImageApplyingError(error) {
            let errorMessage;
            if (error && error.response && error.response.status === 403) {
                errorMessage = "You don't have permission to edit this project.";
            } else {
                errorMessage = 'Error in updating image, Try again.';
            }
            this.$message({
                showClose: true,
                message: errorMessage,
                type: 'error',
                center: true
            });
        },
        // Convert image URL to base64 stirng
        getImageFromUrl(url, callback) {
            this.isImageBeingApplied = true;
            const httpRequest = new XMLHttpRequest();
            httpRequest.onload = () => {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    callback(fileReader.result);
                };
                fileReader.readAsDataURL(httpRequest.response);
            };
            httpRequest.open('GET', url);
            httpRequest.responseType = 'blob';
            httpRequest.send();
        },
        // Convert longitude, latitude to XY format for ESRI
        lngLatToXY(a, b) {
            const t = 0.017453292519943;
            const c = 6378137;
            (89.99999 < b) ? b = 89.99999 : -89.99999 > b && (b = -89.99999);
            const d = b * t;
            return [
                a * t * c,
                (c / 2) * Math.log((1 + Math.sin(d)) / (1 - Math.sin(d))),
            ];
        },
        async getPreviousImages(id) {
            if (!this.areImagesFetched) {
                try {
                    this.images = [];
                    const res = await API.PROJECTS.FETCH_ALL_PREVIOUS_IMAGES(id);
                    const recievedImages = res.data.map_images;
                    console.log(recievedImages);
                    if (recievedImages.length > 0) {
                        this.uploadImageInformation.currentSelectedRemote = 'previousSelection';
                        recievedImages.map((i, index) => {
                            this.images.push({
                                id: i.id,
                                url: i.image,
                                scale: i.scale,
                                rotation: i.rotation,
                                offset: i.offset,
                                source: i.source,
                                zoom: i.zoom,
                            });
                            if (i.id === this.currentStudioImageId) {
                                this.previewThumbnail(index);
                            }
                        });
                    }
                    else {
                        // keeping remote option as selected in case of no previous images
                        this.uploadImageInformation.currentSelectedRemote = 'remoteImage';
                        this.handleSelectedRadioOption('remoteImage');
                    }
                }
                catch (e) {
                    this.errorInFetchingImages = true;
                    console.log(e);
                }
            }
        },

        closeDialog() {
            // finding the index of the currentstudioimage when they exist
            if (this.images.length > 0) {
                let currentlyAppliedStudioImageIndex = 0;
                this.images.forEach((val, index) => {
                    if (val.id === this.currentStudioImageId) {
                        currentlyAppliedStudioImageIndex = index;
                    }
                });
                // preview of image and making previous selection radio option selected
                this.previewThumbnail(currentlyAppliedStudioImageIndex);
                this.uploadImageInformation.currentSelectedRemote = 'previousSelection';
                this.selectedImage.imageType = this.IMAGE_STATES.MAP_IMAGE;
                this.customImageData = '';
            }
            this.$emit('update:uploadBoxVisible', false);
        },

        async openDialog() {
            this.setDesignVersionImageryData();
            this.groundSize = this.getImageDimensions().width;
            this.defaultGroundSize = this.getDefaultGroundSize().width;

            this.getAllAvailableFeatures();
            this.fetchAvailedFeaturesID();
            this.updateNearmapApiKey();
        },

        setDesignVersionImageryData() {
            this.currentStudioImageId = useDesignStore().versions.studio_map_id;
            this.latitude = useDesignStore().project.latitude;
            this.longitude = useDesignStore().project.longitude;
            this.projectID = useDesignStore().project.id;
            this.versionId = useDesignStore().versions.id;
            this.zoomlevel = useDesignStore().project.zoom;
            if (this.projectID || this.projectID === 0) {
                this.getPreviousImages(this.projectID);
            };
            this.areImagesFetched = true;
        },
    },
    watch: {
        zoomlevel: {
            handler(val){
                this.selectOptionFromDropDown(this.uploadImageInformation.selectedOtherSource);
            }
        },
        designVersionImageryData: {
            deep: true,
            handler(newVal) {
                this.latitude = newVal.latitude;
                this.longitude = newVal.longitude;
                this.projectID = newVal.projectId;
                this.zoomlevel = newVal.zoom;
                this.currentStudioImageId = newVal.currentStudioImageId;
                this.versionId = newVal.versionId;
                if (this.projectID !== null) {
                    this.getPreviousImages(this.projectID);
                }
                // to prevent the call when the currentStudioImageId changes
                this.areImagesFetched = true;
            }
        },
        getAllFeatures:{
            deep: true,
            immediate:true,
            handler(val){
                if(val)
                this.fetchAvailedFeaturesID();
            }
        }
    },
    beforeDestroy() {
        // turns the serverbus off
        this.$eventBus.$off(UPDATE_MAP_IMAGE);
    },
};
</script>

<style lang="scss" scoped>
    @import '../../../../styles/components/button';
</style>
<style scoped>

#upload-box-container >>> .el-dialog__body {
    padding: 0 20px;
}

.thumbnailDisabled {
    opacity: 0.3;
}

.cursorPointer {
    cursor: pointer;
}

.pointerDisable {
    pointer-events: none;
}

.thumbnailEnabled {
    opacity: 1;
}

.thumbnails {
    width: 12vw;
    margin: 5% 5% 0 0;
    display: inline-block;
    /* the min-height just ensures that scrollbar is properly available */
    min-height: 12vw;
    height: 12vw;
}

.disableButton {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
}

#upload-box-container >>> .el-form-item__content {
    line-height: 16px;
}

.vb-content {
    width: 100% !important;
}

#upload-box-container .el-form { 
    scrollbar-width: none;
    -ms-overflow-style: none; 
}

#upload-box-container >>> .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    max-height: 50vh;
    display: flex;
    flex-direction: column;
    height: 450px;
    justify-content: center;
  }
  #upload-box-container >>> .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  #upload-box-container >>> .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    text-align: center;
    align-self: center;
  }
  .avatar {
    width: 100%;
    max-height: 50vh;
    border-radius: 5px;
  }

  .flexContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 16px;
  }

  .upgradeBtn {
    float: right;
    font-size: 14px;
    margin-bottom: 8px;
    padding: 5px 8px;
  }

  .credits {
    font-size: 14px;
    color: #777;
    margin-top: -8px;
  }

  #upload-box-container >>> .el-select-dropdown__item  {
    height: auto;
  }

</style>


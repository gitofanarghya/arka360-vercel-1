<template>
<div class="relativeCont">
        <div class="mapSources" v-if="isMapDropdownOpen">
            <p class="sourceHeading">Standard</p>
            <div class="flexColumn">
                <div class="optionsContainer" @click="applyGoogleImage">
                    <p class="sourceItem" :class="currentAppliedImageSource=='google'? 'activeOption' :''"> Google</p>
                    <img v-if="currentAppliedImageSource=='google'" src="../../../assets/drop/Group 2439.svg" />
                </div>
                <div class="optionsContainer" @click="applyBingImage">
                    <p class="sourceItem" :class="currentAppliedImageSource=='bing'? 'activeOption' :''"> Bing</p>
                    <img v-if="currentAppliedImageSource=='bing'" src="../../../assets/drop/Group 2439.svg" />
                </div>
                <div class="optionsContainer" @click="applyEsriImage">
                    <p class="sourceItem" :class="currentAppliedImageSource=='esri'? 'activeOption' :''"> Esri</p>
                    <img v-if="currentAppliedImageSource=='esri'" src="../../../assets/drop/Group 2439.svg" />
                </div>
                <!-- <div class="optionsContainer" @click="applyNearmapImage">
                    <p class="sourceItem" :class="currentAppliedImageSource=='nearmap'? 'activeOption' :''">NEARMAP</p>
                    <img v-if="currentAppliedImageSource=='nearmap'" src="../../../assets/drop/lock.svg" />
                </div> -->
            </div>
            <!-- <div class="nearmapHeading" v-if="isNearmapAvailable" >
                <p class="sourceHeadingNearmap" >Nearmap</p>
                    <el-tooltip
                        :disabled="isThisFeatureEnabled['Nearmap HD Imagery']"
                        effect="dark"
                        placement="top-start"
                        :content="'Purchase credits to enable Nearmap HD Imagery'"
                    >
                        <img src="../../../assets/drop/Group 2086.svg" class="lock" @click="uploadNearmap" v-if="!isThisFeatureEnabled['Nearmap HD Imagery']" />
                    </el-tooltip>
                    <img src="../../../assets/drop/Group 2421.svg" v-if="isThisFeatureEnabled['Nearmap HD Imagery']"
                     @click="uploadNearmap" class="addNearmapIcon"/>
            </div>
            <div class="flexColumnTwo">
                <span 
                v-for="cImage in nearmapImages"
                :key="cImage.id">
                    <div class="optionsContainer hoverClass" @click="applyNearmapImage(cImage)">
                        <p class="sourceItem fileName" :class="cImage.is_visible ? 'activeOption' :''" @click="toggleImageVisibility(cImage.id)" :title="cImage.name"> Nearmap_image{{ cImage.id }}</p>
                        <img v-if="cImage.is_visible" src="../../../assets/drop/Group 2439.svg" class="tickIcon"/>
                        <img src="../../../assets/drop/Group 280.svg" class="editIcon" @click="startCustomImageEditing(cImage.id); isMapDropdownOpen=false" style="width: 20px;"/>
                     </div>
                </span>
            </div> -->
            <p class="sourceHeading">Custom</p>
            <div class="flexColumnTwo">
                <el-upload
                class=""
                :before-upload="validateCustomImageUpload"
                :show-file-list="false"
                accept=".jpg, .jpeg, .png"
                action="">
                    <p class="upldImg">Upload Custom Image</p>
                    <img src="../../../assets/drop/Group 2421.svg" />
                </el-upload>
                <span 
                v-for="cImage in customMapImagesState"
                :key="cImage.id">
                    <div class="optionsContainer hoverClass">
                        <p class="sourceItem fileName" :class="cImage.is_visible ? 'activeOption' :''" @click="toggleImageVisibility(cImage.id)" :title="cImage.name"> {{cImage.name}}</p>
                        <img v-if="cImage.is_visible" src="../../../assets/drop/Group 2439.svg" class="tickIcon"/>
                        <img src="../../../assets/drop/Group 280.svg" class="editIcon" @click="startCustomImageEditing(cImage.id); isMapDropdownOpen=false" style="width: 20px;"/>
                        <!-- <el-button @click="startCustomImageEditing(cImage.id); isMapDropdownOpen=false">Edit</el-button> -->
                    </div>  
                </span>
            </div>
        </div>
        <div class="googleMapBtn" :class="mapChangeEnabled ? '' : 'noCursorEvents'">
            <div class="eyeBtn" @click="toggleMapImageFunc">
                <img v-if="mapImageVisible" src="../../../../src/assets/drop/eye.svg"/>
                <img v-else src="../../../../src/assets/drop/eye-slash (1).svg"/>
            </div>
            <div class="textBtn" @click="switchMapDropdown">
                <p class="btnText">{{currentAppliedImageSource}}</p>
                <img :style="isMapDropdownOpen ? 'transform: rotate(180deg)' : ''" src="../../../../src/assets/drop/arrow.svg" />
            </div>
        </div>
        <!-- <el-button :disabled="!mapChangeEnabled" @click="toggleMapImageFunc" :class="mapImageVisible? 'mainBtn' :''"> eye </el-button>
        <el-button :disabled="!mapChangeEnabled" class="mainBtnClass" :class="isMapDropdownOpen? 'mainBtn' :''" @click="switchMapDropdown">maps selected</el-button> -->
        <map-editor 
            :updateMapImageFunc='updateMapImageFunc'
            :mapEditorVisible.sync="mapEditorVisible"
            :toggleMapEditorVisibility="closeNearmapPopup"
            :isNearmap=true
            :key="count"
            @addedNearmap="onAddNearmap"
        />
        <project-upgrade-popup v-if="isProjectUpgradePopupVisible"
            :isProjectUpgradePopupVisible.sync="isProjectUpgradePopupVisible" />
    </div>
</template>

<script>
import {useMapImagesStore} from '../../../stores/mapImages'
import { mapActions, mapState } from "pinia";
import { serverBus } from '../../../main';
import { useStudioStageStore } from '../../../stores/studio-stage';
import { TOGGLE_MAP_IMAGE, UPDATE_MAP_IMAGE } from '../../../componentManager/componentManagerConstants';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from '../../../constants';
import * as utils from '../../../core/utils/utils';
import { getCroppedImage } from '../../../core/utils/customImageEditUtils';
import API from '@/services/api/';
import { useDesignStore } from '../../../stores/design';
import { useProjectStore } from '../../../stores/project';
import MapEditor from '../PopUps/MapEditor.vue';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
export default {
    name: 'MapDropdown',
    components:{
        MapEditor
    },
    data() {
        return{
            isMapDropdownOpen: false,
            startCustomImageEditing: () => {},
            uploadCustomImageFunc: () => {},
            toggleMapImageFunc: () => {},
            updateMapImageFunc: () => {},
            customImageData: {},
            groundImageData: {},
            customImageStats: [],
            designId: this.$route.params.designId,
            mapEditorVisible: false,
            count:0,
            availableFeaturesInCheckbox:[],
            isThisFeatureEnabled:{},
            findCreditsOfThisFeature:{},
            isProjectUpgradePopupVisible: false,
            loading: ""
        }
    },
    computed: {
        ...mapState(useMapImagesStore, {
            customMapImagesState: "GET_CUSTOM_IMAGES",
            standardMapImages: "GET_STANDARD_IMAGES",
            currentAppliedImageSource: "GET_CURRENT_APPLIED_IMAGE_SOURCE",
            mapImageVisible: state => state.groundMapImageVisible,
            latitude_for_map: state => state.latitude,
            longitude_for_map: state => state.longitude,
            zoomLevel: state => state.zoomLevel,
            dimensions: state => state.dimensions,
        }),
        ...mapState(useStudioStageStore, {
            mapChangeEnabled: state => state.mapChangeEnabled,
        }),
        ...mapState(useDesignStore,{
            getAllFeaturesFromDesign : 'GET_TOTAL_FEATURES',
        }),
        ...mapState(useProjectStore, {
            getAllFeaturesFromProject : 'GET_TOTAL_FEATURES',
        }),
        getAllFeatures(){
            if(this.$route.params.projectId && this.getAllFeaturesFromProject.available_features)
            return this.getAllFeaturesFromProject
            else if(this.$route.params.designId && this.getAllFeaturesFromDesign.available_features)
            return  this.getAllFeaturesFromDesign

            // return ( this.getAllFeaturesFromProject || this.getAllFeaturesFromDesign);
        },
        nearmapImages(){
            return this.standardMapImages.nearmap;
        },
        isNearmapAvailable(){
           let index= this.availableFeaturesInCheckbox.findIndex((feature)=>{ return feature.name=="Nearmap HD Imagery"});
           if(index>=0)
            return true;
           else
            return false; 
        }
    },
    mounted() {
        serverBus.$once('customImageEditFunc', (customEditFunc) => {
            this.startCustomImageEditing = customEditFunc;
        });
        serverBus.$once('customImageViewToggleFunc', (toggleImageVisibility) => {
            this.toggleImageVisibility = toggleImageVisibility;
        });
        serverBus.$once('uploadCustomImage', (uploadCustomImage) => {
            this.uploadCustomImageFunc = uploadCustomImage;
        });
        serverBus.$once(TOGGLE_MAP_IMAGE, (toggleMapImageFunc) => {
            this.toggleMapImageFunc = toggleMapImageFunc;
        });
        serverBus.$once(UPDATE_MAP_IMAGE, (updateMapImageFunc) => {
            this.updateMapImageFunc = updateMapImageFunc;
        });
        this.projectID = useDesignStore().project.id;
    },
    methods: {
        ...mapActions(useMapImagesStore, {
            setStandardImages: 'SET_STANDARD_IMAGES',
        }),
        getAllAvailableFeatures(){
            let selfDesigningInfo =  JSON.parse(localStorage.getItem("allServicesInfo")).self_designing_info;
            if(selfDesigningInfo['input_checkbox'] && selfDesigningInfo['input_checkbox'].length){
                this.availableFeaturesInCheckbox = [...selfDesigningInfo.available_features];
            }
        },
        fetchAvailedFeaturesID(){
            try{
                this.availedFeaturesIdsList = [... this.getAllFeatures.availed_features];
                this.availedFeaturesIdsListInitial = [... this.getAllFeatures.availed_features];
                this.assignMoreKeyToTotalAvaibleObj(this.availedFeaturesIdsList);
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
        showNotification(status) {
            switch (status) {
                case 'loading' : 
                    this.loading = notificationsAssistant.loading({
                        title: 'Map Update',
                        message: 'Updating map image.',
                    });
                    break;
                case 'success' :
                    notificationsAssistant.close(this.loading);
                    notificationsAssistant.success({
                        title: 'Map Update',
                        message: 'Map image updated successfully.'
                    });
                    break;
                case 'error' :
                    notificationsAssistant.close(this.loading);
                    notificationsAssistant.error({
                        title: 'Map Update',
                        message: 'Error updating map image.',
                    });
                    break
            }

        },
        closeDropdownFunc(e){
            if (!(document.getElementsByClassName('relativeCont')[0].contains(e.target))){
                this.isMapDropdownOpen = false;
                window.removeEventListener('click',this.closeDropdownFunc,true);
                for (let i = 0; i < this.customImageStats.length; i++) {
                    if(this.customMapImagesState[i].is_visible != this.customImageStats[i]){
                        API.FETCH_MAP.PATCH_MAP_IMAGE(this.customMapImagesState[i].id, {...this.customMapImagesState[i]});
                    }
                }
            }
        },
        onAddNearmap(){
            this.fetchNearmapImage().then(async()=>{
                let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE({...this.saveImageJSON(this.groundImageData), "project": this.projectID})).data;
                this.updateMapImageFunc(savedImgData);
                // this.setStandardImages(Object.assign(this.standardMapImages, {nearmap: {...savedImgData}}),'nearmap');
                this.standardMapImages.nearmap.push({ ...savedImgData });
            });
        },
        switchMapDropdown() {
            this.isMapDropdownOpen = !this.isMapDropdownOpen;
            if(this.isMapDropdownOpen){
                this.customImageStats = [];
                for (let i = 0; i < this.customMapImagesState.length; i++) {
                    this.customImageStats.push(this.customMapImagesState[i].is_visible);
                }
            }
            window.addEventListener('click',this.closeDropdownFunc,true);
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
                    vm.customImageData = {url:fileLoadedEvent.target.result,name:file.name};
                    this.uploadCustomImageFunc(vm.customImageData);
                    vm.isMapDropdownOpen = false;
                };
                fileReader.readAsDataURL(file);
            }

            return false;
        },
        uploadNearmap(){
            if(!this.isThisFeatureEnabled['Nearmap HD Imagery']){
                this.isProjectUpgradePopupVisible=true;
            }
            else{
                this.count +=1;
                this.mapEditorVisible = !this.mapEditorVisible;
            }
        },
        closeNearmapPopup(){
            this.mapEditorVisible = false;
        },
        async applyGoogleImage() {
            this.showNotification("loading")
            try {
            if(this.standardMapImages.google){
                //update ground image to google image
                if(this.currentAppliedImageSource !== 'google'){
                    this.updateMapImageFunc(this.standardMapImages.google);
                    const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.google.id, this.saveImageJSON(this.standardMapImages.google))).data;
                    this.setStandardImages(Object.assign(this.standardMapImages, {google: {...updatedImage}}),'google');
                }
            } else {
                //fetch google image for lat,lng,zoom and crop it according to req dimensions.
                this.fetchGoogleMapsImage();
                let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE(this.saveImageJSON(this.groundImageData))).data;
                //patch the fetched image, add in store and update the ground image
                this.updateMapImageFunc(savedImgData);
                this.setStandardImages(Object.assign(this.standardMapImages, {google: {...savedImgData}}),'google');
            }
            this.showNotification("success")
            }
            catch (e) {
                this.showNotification("error")      
           }
        },
        async applyBingImage() {
            this.showNotification("loading")
            try {
            if(this.standardMapImages.bing){
                //update ground image to bing image
                if(this.currentAppliedImageSource !== 'bing'){
                    this.updateMapImageFunc(this.standardMapImages.bing);
                    const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.bing.id, this.saveImageJSON(this.standardMapImages.bing))).data;
                    this.setStandardImages(Object.assign(this.standardMapImages, {bing: {...updatedImage}}),'bing');
                    this.showNotification("success")
                }
            } else {
                this.fetchBingMapImage().then(async()=>{
                    let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE(this.saveImageJSON(this.groundImageData))).data;
                    this.updateMapImageFunc(savedImgData);
                    this.setStandardImages(Object.assign(this.standardMapImages, {bing: {...savedImgData}}),'bing');
                    this.showNotification("success")
                });
                //fetch bing image for lat,lng,zoom and crop it according to req dimensions.
            }
            }
            catch (e) {
                this.showNotification("error")
                }

        },
        async applyEsriImage() {
            this.showNotification("loading")
            try {
            if(this.standardMapImages.esri){
                //update ground image to esri image
                if(this.currentAppliedImageSource !== 'esri'){
                    this.updateMapImageFunc(this.standardMapImages.esri);
                    const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.esri.id, this.saveImageJSON(this.standardMapImages.esri))).data;
                    this.setStandardImages(Object.assign(this.standardMapImages, {esri: {...updatedImage}}),'esri');
                    this.showNotification("success")
                }
            } else {
                this.fetchEsriMapImage().then(async()=>{
                    let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE(this.saveImageJSON(this.groundImageData))).data;
                    this.updateMapImageFunc(savedImgData);
                    this.setStandardImages(Object.assign(this.standardMapImages, {esri: {...savedImgData}}),'esri');
                    this.showNotification("success")
                });
                //fetch bing image for lat,lng,zoom and crop it according to req dimensions.
            }
            }
            catch (e) {
                this.showNotification("error")
                }
        },
        async applyNearmapImage(nearmapImage) {
            this.showNotification("loading")
            try {
            this.updateMapImageFunc(nearmapImage);
            nearmapImage.is_visible = true;
            const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(nearmapImage.id, nearmapImage)).data;
            this.standardMapImages.nearmap.forEach((item) => {
                if (item.id === nearmapImage.id) {
                    item.is_visible = true;
                }
            });
            this.setStandardImages(this.standardMapImages,'nearmap', nearmapImage);
            // if(this.standardMapImages.nearmap){
            //     //update ground image to nearmap image
            //     if(this.currentAppliedImageSource !== 'nearmap'){
            //         this.updateMapImageFunc(this.standardMapImages.nearmap);
            //         const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.nearmap.id, this.saveImageJSON(this.standardMapImages.nearmap))).data;
            //         this.setStandardImages(Object.assign(this.standardMapImages, {nearmap: {...updatedImage}}),'nearmap');
            //     }
            // } else {
            //     this.fetchNearmapImage().then(async()=>{
            //         let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE(this.saveImageJSON(this.groundImageData))).data;
            //         this.updateMapImageFunc(savedImgData);
            //         // this.setStandardImages(Object.assign(this.standardMapImages, {nearmap: {...savedImgData}}),'nearmap');
            //         this.standardMapImages.nearmap.push({ ...savedImgData });
            //     });
            //     //fetch bing image for lat,lng,zoom and crop it according to req dimensions.
            // }
            this.showNotification("success")
            }
            catch (e) {
                this.showNotification("error")
            }
        },

        fetchGoogleMapsImage() {
            // this.isImageBeingApplied = true;
            this.groundImageData = {};
            this.groundImageData = {
                url: `https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude_for_map},${this.longitude_for_map}&scale=2&zoom=${this.zoomLevel}&maptype=satellite&size=${this.dimensions}x${this.dimensions}&key=${GOOGLE_API_KEY}`,
                imageType: 'map',
                rotation: 0,
                scale: 0,
                offset: [0, 0],
                source: 'google_maps',
                zoom: this.zoomLevel,
            };
            this.groundImageData.url = utils.signRequest(this.groundImageData.url, GOOGLE_SIGNING_SECRET);
        },
        async fetchBingMapImage() {
            const maxZoomLevel = 19;
            this.groundImageData = {};
            this.groundImageData.imageType = 'map';
            if (this.zoomLevel > maxZoomLevel) {
                const imageURL = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/${this.latitude_for_map},${this.longitude_for_map}/${maxZoomLevel}?mapSize=${this.dimensions},${this.dimensions}&dpi=Large&key=Aqffsw1BfSx4Bx0PYJI78MnSh2cbHe2Lh9fLf2JNHxLWWEK9jirkbmImXzlug1Im`;
                this.groundImageData.url = await getCroppedImage(imageURL, 2 ** (this.zoomLevel - maxZoomLevel));
            }
            else {
                this.groundImageData.url = `https://dev.virtualearth.net/REST/v1/Imagery/Map/Aerial/${this.latitude_for_map},${this.longitude_for_map}/${this.zoomLevel}?mapSize=${this.dimensions},${this.dimensions}&key=Aqffsw1BfSx4Bx0PYJI78MnSh2cbHe2Lh9fLf2JNHxLWWEK9jirkbmImXzlug1Im`;
            }
            this.groundImageData.rotation = 0;
            this.groundImageData.scale = 0;
            this.groundImageData.offset = [0, 0];
            this.groundImageData.source = 'bing';
            this.groundImageData.zoom = this.zoomLevel;
        },
        async fetchEsriMapImage() {
            const maxZoomLevel = 19;
            this.groundImageData = {};
            const topLeftLatLong = utils.getLatLngOfGivenPixel(
                this.latitude_for_map,
                this.longitude_for_map,
                Math.min(this.zoomLevel, maxZoomLevel),
                this.dimensions,
                this.dimensions,
                0,
                0,
            );
            const bottomRightlatlong = utils.getLatLngOfGivenPixel(
                this.latitude_for_map,
                this.longitude_for_map,
                Math.min(this.zoomLevel, maxZoomLevel),
                this.dimensions,
                this.dimensions,
                this.dimensions,
                this.dimensions,
            );
            const [xmin, ymin] = utils.lngLatToXY(topLeftLatLong.lng, topLeftLatLong.lat);
            const [xmax, ymax] = utils.lngLatToXY(bottomRightlatlong.lng, bottomRightlatlong.lat);
            if (this.zoomlevel <= maxZoomLevel) {
                this.groundImageData.url = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${xmin},${ymin},${xmax},${ymax}&dpi=800&size=${this.dimensions},${this.dimensions}&f=image`;
            }
            else {
                const imageURL = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${xmin},${ymin},${xmax},${ymax}&dpi=400&size=${this.dimensions},${this.dimensions}&f=image`;
                this.groundImageData.url = await getCroppedImage(imageURL, 2 ** (this.zoomLevel - maxZoomLevel));
            }
            this.groundImageData.imageType = 'map';
            this.groundImageData.rotation = 0;
            this.groundImageData.scale = 0;
            this.groundImageData.offset = [0, 0];
            this.groundImageData.source = 'esri';
            this.groundImageData.zoom = this.zoomLevel;
        },
        async fetchNearmapImage() {
            const currentDate = new Date();
            const currentMonth = currentDate.getUTCMonth() + 1;
            const month = currentMonth < 10 ? `0${currentMonth}` : currentMonth;
            const day = currentDate.getUTCDate() < 10 ? `0${currentDate.getUTCDate()}` : currentDate.getUTCDate();
            const date = `${currentDate.getUTCFullYear()}-${month}-${day}`;
            let postData = {
                    "latitude": this.latitude_for_map.toFixed(8),
                    "longitude": this.longitude_for_map.toFixed(8),
                    "zoom": this.zoomLevel,
                    "date": date
                }
            let nearMapBase64 = await API.FETCH_MAP.FETCH_NEARMAP_MAP(this.projectID, postData);
            let nearMapImage = new Image();
            nearMapImage.src = `data:image/png;base64, ${nearMapBase64.data}`;
            this.groundImageData.imageType = 'map';
            this.groundImageData.url= nearMapImage.src;
            this.groundImageData.rotation = 0;
            this.groundImageData.scale = 0;
            this.groundImageData.offset = [0, 0];
            this.groundImageData.source = 'nearmap';
            this.groundImageData.zoom = this.zoomlevel;
        },
        saveImageJSON(obj){
            
            return {
                "url": obj.url,
                "rotation": obj.rotation,
                "scale": obj.scale,
                "design": this.designId,
                "source": obj.source,
                "zoom": obj.zoom,
                "is_visible": true,
            };
        },
    },
    watch:{
        getAllFeatures:{
            deep: true,
            immediate:true,
            handler(val){
                if(val)
                this.fetchAvailedFeaturesID();
            }
        },
        isMapDropdownOpen:{
            handler(val){
                if(val){
                    this.getAllAvailableFeatures();
                    this.fetchAvailedFeaturesID();
                }
            }
        }
    }
};
</script>
<style scoped>

/* .relativeCont{
    position: absolute;
    bottom: 40px;
    left: 120px;
} */
.noCursorEvents{
    pointer-events: none;
}
.mapSources {
    position: relative;
    border-radius: 8px;
    z-index: 1;
    width: 300px;
    padding: 16px 0px 0px 0px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    background-color: #fff;
    margin-bottom: 16px;
    max-height: 400px;
    overflow-y: auto;
}

.mapSources:after {
    content: "";
    position: absolute;
    bottom: -14px;
    left: 4%;
    border-width: 7px;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
}

.flexColumn,
.flexColumnTwo {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    padding-bottom: 4px;
    border-bottom: 1px solid #ccc;
}

.flexColumnTwo {
    border-bottom: none;
}

.optionsContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 45px;
    cursor: pointer;
    padding: 0px 16px 0px 24px;
}

.optionsContainer:hover {
    background-color: #f5f7fa;
}

.sourceHeading {
    padding: 0px 16px;
    font-size: 16px;
    font-weight: 600;
    color: #999;
    cursor: default;
    margin-bottom: 8px;
}

.sourceHeadingNearmap {
    font-size: 16px;
    font-weight: 600;
    color: #999;
    cursor: default;
}
.sourceItem{
    font-size: 16px;
    color: #777;
}

.fileName {
    max-width: 200px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.activeOption {
    color: #222;
    font-weight: 600;
}

.upldImg {
    font-size: 16px;
    font-weight: 600;
    color: #999;
}

.relativeCont >>> .el-upload {
    /* position: absolute; */
    /* bottom: 0px; */
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 45px;
    padding: 0px 16px 0px 24px;
    width: 100%;
    background-color: #fff;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.nearmapHeading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 45px;
    padding: 0px 16px 12px;
    width: 100%;
    background-color: #fff;
    border-bottom: 1px solid #ccc;
}

.addNearmapIcon{
    cursor: pointer;
}

.mainBtnClass {
    position: relative;
    font-size: 14px;
    font-weight: 600;
    height: 40px;
    margin: 0px;
    z-index: 2;
    border-radius: 0px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.googleMapBtn {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 42px;
    width: 164px;
    padding: 8px 0px;
    border-radius: 4px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    background-color: #fff;
    cursor: pointer;
    width: fit-content;
}

.textBtn {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 40px;
    padding-right: 12px;
    user-select: none;
    text-transform: capitalize;
}

.eyeBtn {
    height: 40px;
    display: grid;
    place-items: center;
    padding-left: 12px;
}

.btnText {
    font-size: 14px;
    color: #000;
}
.mainBtn {
    background: #3a8ee6;
    border-color: #3a8ee6;
    color: #FFFFFF;
    outline: none;
}

.mainBtn:disabled {
    background: #3a8ee6;
    border-color: #3a8ee6;
    outline: none;
    color: #C0C4CC;
}

.hoverClass:hover .tickIcon {
    display: none;
}

.editIcon {
    display: none;
}

.hoverClass:hover .editIcon {
    display: inherit;
}
.lock{
    cursor: pointer;
}
</style>
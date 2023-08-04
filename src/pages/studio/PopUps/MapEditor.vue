<template>
  <div id="mapEditor">
    <el-dialog
    :visible="mapEditorVisible"
    :title=updatedTitle
    @close="toggleMapEditorVisibility"
    :close-on-click-modal="false"
    >
  <div class="containerDiv">
  <div class="map">
  <GoogleMaps
    :center="geoLocation.center"
    :zoom="geoLocation.zoom"
    :mapOptions="mapOptions"
    :showCentralMarker="false"
    :isResize="true"
    @areaFinal="updateMapParamsTemp"
  />
  </div>
  <div class="sidePane">
    <div class="heading">{{ isNearmap ? "Nearmap Imagery" :  "Resize Map Image"}}</div>
    <div class="description">Change the box size to update the map image for designing.</div>
    <div class="updateButton">
      <el-button type="primary" @click="isModelOutsideGround ? toggleConfirmPopupVisibility() : onCompleteUpdate()">Update Map Image </el-button>
    </div>
  </div>
</div>
</el-dialog>
<el-dialog
      :visible.sync="confirmPopupVisiblity"
      :close-on-click-modal="false"
      title=""
      class="delete_module"
    >
      <div class="alert">
        <img
          src="../../design/assets/img/alert.svg"
          alt="alert"
          class="warningImage"
        />
      </div>
      <p class="msg">Some parts of your design are gettinng deleted, would<br>you like to proceed</p>
      <div class="button_container">
        <el-button 
         class="btn confirmButton"
         @click="toggleConfirmPopupVisibility"
        >
          Cancel
        </el-button>
        <el-button 
         class="btn btn-primary confirmButton"
         type="primary"
         @click = "onCompleteUpdate"
        >
          Yes
        </el-button>
      </div>
    </el-dialog>
</div>
</template>

<script>
import GoogleMaps from "@/components/googleMaps/GoogleMaps.vue"
import { useMapImagesStore } from '../../../stores/mapImages';
import { mapActions, mapState } from 'pinia';
import { useDesignStore } from '../../../stores/design';
import API from '@/services/api/';
import * as utils from '../../../core/utils/utils';
import { getCroppedImage } from '../../../core/utils/customImageEditUtils';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from '../../../constants';
import { serverBus } from '../../../main';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';

const mapOptions = {
  mapTypeId: 'hybrid',
  controlSize: 20,
  minZoom: 15,
  mapTypeControl: true,
  fullscreenControl: false,
  rotateControl: false,
  streetViewControl: false,
};

export default {
  name: "MapSelector",
  components: {
    GoogleMaps,
  },
  computed:{
    updatedTitle(){
      if(this.isNearmap) {
        return "Nearmap Image"
      } else {
        return "Resize Map Image"
      }
    },
    ...mapState(useMapImagesStore, {
        customMapImagesState: "GET_CUSTOM_IMAGES",
        standardMapImages: "GET_STANDARD_IMAGES",
        currentAppliedImageSource: "GET_CURRENT_APPLIED_IMAGE_SOURCE",
        latitude_for_map: state => state.latitude,
        longitude_for_map: state => state.longitude,
        zoomLevel: state => state.zoomLevel,
        dimensions: state => state.dimensions,
        square: state => state.square,
    }),
  },
  props: {
    mapEditorVisible:{
      default: false,
      type: Boolean
    },
    isNearmap:{
      type: Boolean,
      default: false
    },
    toggleMapEditorVisibility: {
      type: Function,
      default: () => {},
    },
    geoLocation: {
      type: Object,
      default() {
        return {
          center: { lat: parseFloat(useDesignStore().project.latitude), lng: parseFloat(useDesignStore().project.longitude) },
          zoom: useDesignStore().project.zoom,
        };
      },
    },
    updateMapImageFunc:{
      type: Function,
      default: () => {},
    }
  },
  data() {
    return {
      mapOptions,
      groundImageData:{},
      designId: this.$route.params.designId,
      latTemp: useMapImagesStore().latitude,
      lngTemp: useMapImagesStore().longitude,
      zoomTemp: useMapImagesStore().zoomLevel,
      dimTemp: useMapImagesStore().dimensions,
      confirmPopupVisiblity: false,
      isModelOutsideGround: false,
      squareTemp: useMapImagesStore().square,
    };
  },
  mounted() {
    serverBus.$on('modelOutside', (checkFunction) => {
      // checkFunction has boolean value to check if the models are outside / inside ground after resize
      if (checkFunction()) {
        this.isModelOutsideGround = true;
      }
      else {
        this.isModelOutsideGround = false;
      }
    });
  },
  methods: {
    ...mapActions(useMapImagesStore, {
        setStandardImages: 'SET_STANDARD_IMAGES',
    }),
    toggleConfirmPopupVisibility() {
      this.confirmPopupVisiblity = !this.confirmPopupVisiblity
    },
    async onCompleteUpdate(){
      serverBus.$emit('deleteModels');
      const applyImage = notificationsAssistant.loading({
          title: 'Map Update',
          message: 'Updating map image.',
      });
      try {
      this.updateMapParams();
      this.toggleMapEditorVisibility();
      if(this.isNearmap){
        this.$emit('addedNearmap');
      }
      else{
        await this.applyCurrentSourceImage();
        this.deleteGoogleImage();
        this.deleteBingImage();
        this.deleteEsriImage();
      }
      notificationsAssistant.close(applyImage);
          notificationsAssistant.success({
              title: 'Map Update',
              message: 'Map image updated successfully.'
          });
      }
      catch (e) {
          notificationsAssistant.close(applyImage);
              notificationsAssistant.error({
                  title: 'Map Update',
                  message: 'Error updating map image.',
              });
          }
    },
    updateMapParams(){
      useMapImagesStore().zoomLevel = this.zoomTemp;
      useMapImagesStore().latitude = this.latTemp;
      useMapImagesStore().longitude = this.lngTemp;
      useMapImagesStore().dimensions = this.dimTemp;
      useMapImagesStore().square = this.squareTemp;
      // API.FETCH_MAP.UPDATE_MAP_DATA(this.designId, {latitude_for_map: this.latitude_for_map, longitude_for_map: this.longitude_for_map, zoomLevel: this.zoomLevel, dimensions: this.dimensions, square: this.square});
    },
    updateMapParamsTemp(lat, lng, zoom, dim, square){
      this.zoomTemp = zoom;
      this.latTemp = lat;
      this.lngTemp = lng;
      this.dimTemp = dim;
      this.squareTemp = square;
    },
    deleteGoogleImage(){
      if(this.currentAppliedImageSource !== 'google'){
        if(this.standardMapImages.google){
          API.FETCH_MAP.DELETE_MAP_IMAGE(this.standardMapImages.google.id);
          this.standardMapImages.google = null;
        }
      }
    },
    deleteBingImage(){
      if(this.currentAppliedImageSource !== 'bing'){
        if(this.standardMapImages.bing){
          API.FETCH_MAP.DELETE_MAP_IMAGE(this.standardMapImages.bing.id);
          this.standardMapImages.bing = null;
        }
      }
    },
    deleteEsriImage(){
      if(this.currentAppliedImageSource !== 'esri'){
        if(this.standardMapImages.esri){
          API.FETCH_MAP.DELETE_MAP_IMAGE(this.standardMapImages.esri.id);
          this.standardMapImages.esri = null;
        }
      }
    },
    async applyCurrentSourceImage(){
      if(this.currentAppliedImageSource === 'google'){
        //fetchgoogleimage and patch
        this.fetchGoogleMapsImage();
        await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.google.id, this.saveImageJSON(this.groundImageData)).then((patchImage)=>{
          const updatedImage = patchImage.data;
          this.setStandardImages(Object.assign(this.standardMapImages, {google: {...updatedImage}}),'google');
          this.updateMapImageFunc(updatedImage);
        });
      }
      else if(this.currentAppliedImageSource === 'bing'){
        //getbingimage
        await this.fetchBingMapImage().then(async ()=>{
          await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.bing.id, this.saveImageJSON(this.groundImageData)).then((patchImage)=>{
            const updatedImage = patchImage.data;
            this.setStandardImages(Object.assign(this.standardMapImages, {bing: {...updatedImage}}),'bing');
            this.updateMapImageFunc(updatedImage);
          })
        });
      }
      else if(this.currentAppliedImageSource === 'esri'){
        //get esrimage
        await this.fetchEsriMapImage().then(async()=>{
          const updatedImage = (await API.FETCH_MAP.PATCH_MAP_IMAGE(this.standardMapImages.esri.id, this.saveImageJSON(this.groundImageData))).data;
          this.setStandardImages(Object.assign(this.standardMapImages, {esri: {...updatedImage}}),'esri');
          this.updateMapImageFunc(updatedImage);
        });
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
          console.log(imageURL);
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
      if (this.zoomLevel <= maxZoomLevel) {
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
};
</script>

<style type="text/css" scoped>

#google-map {
  height: 100%;
  width: 100%;
}

#mapSelector {
  width: 325px;
  height: 290px;
  margin-bottom: 24px;
}

.searchBarWrapper {
  text-align: left;
  border: 2px solid #c0c4cc;
  height: 28px;
  margin-bottom: 10px;
  border-radius: 4px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  box-sizing: border-box;
  width: 100%;
}

.sidePane{
  padding: 10px 20px;
}

.heading{
  margin: 0 0 13px 0;
    /* font-family: HelveticaNeue; */
    font-size: 16px;
    font-weight: 600;
    font-stretch: normal;
    font-style: normal;
    /* line-height: 1.38; */
    letter-spacing: normal;
    text-align: left;
    color: #444;
}

#mapWrapperNewProject {
  background-color: white;
  width: 100%;
  height: 100%;
  display: block;
}

#mapWrapperNewProject >>> .vue-map {
  border-radius: 4px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.containerDiv{
  display: grid;
  grid-template-columns: 77% 23%;
  height: 100%;
}

#mapWrapperNewProject input {
  height: 100%;
  outline: 0;
  width: 100%;
  border: none;
  box-sizing: border-box;
  padding-left: 8px;
  width: 100%;
}
/* optimised assuming map is to be kept as a square */
.description {
  margin: 13px 0;
  font-size: 16px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.38;
  letter-spacing: normal;
  text-align: left;
  color: #444;
  word-break: break-word;
}

.mapImageStyler {
  height: 465px;
  width: 512px;
  transform: scale(calc(325 / 512));
  position: relative;
  top: -90px;
  left: -93px;
}

@media (max-width: 1140px) {
.mapImageStyler {
  height: 70vh;
  width: 140vw;
  transform: scale(calc(325 / 512));
  position: relative;
  top: -13vh;
  left: -25vw;
}

#mapSelector {
  width: 80vw;
  height: calc((325/512) * 70vh);
}

.creditsContainer{
  position: relative;
  top: 46vh;
  margin-left: 2vw;
  margin-right: 2vw;
  margin-bottom: 34px
}
}

</style>

<!--  This is required for map styling (suggestion dropdown) -->
<style>
.pac-container {
  z-index: 3000;
}

body .gm-control-active .gm-fullscreen-control {
  margin: 20px !important;
  width: 30px;
  height: 30px;
}
</style>

<style scoped>

#mapEditor >>> .el-dialog{
  width: 83%;
}

#mapEditor >>> .el-dialog__header{
  padding-left: 1.6rem !important;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  justify-content: flex-start;
  background-color: #e8edf2;
  margin-bottom: 0 !important;
}

#mapEditor >>> .el-dialog__title {
  font-family: "Helvetica Neue" !important;
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  color: #222222 !important;
}

#mapEditor >>> .el-dialog__close {
  color: #222222 !important;
  font-weight: 800 !important;
  font-size: 18px !important;
}

#mapEditor >>> .el-dialog__body {
  height: 68vh;
  padding: 0 !important;
}

 #mapEditor .delete_module >>> .el-dialog {
  border-radius: 8px;
  margin-top: 14vh !important;
  width: fit-content;
}
 .delete_module >>> .el-dialog__header {
  display: none;
}
 #mapEditor .delete_module >>> .el-dialog__body {
  height: auto;
  padding: 0 10px!important;
}
 .delete_module .alert {
  padding: 15px 0 0 10px;
}
 .delete_module .alert,
 .delete_module .msg,
 .delete_module .button_container {
  display: flex;
  justify-content: center;
}
 .delete_module .button_container .confirmButton{
  width: 9.5rem;
  height: 3rem;
  margin: 25px;
  font-size: 18px;
  font-weight: bolder;
}
.warningImage {
  width: 4.675rem !important;
  height: 4.194rem !important;
  margin: 1rem 0rem 2.369rem 0rem !important;
  object-fit: contain !important;
}
.msg {
  font-family: "Helvetica Neue" !important;
  font-size: 16px !important;
  font-weight: 100 !important;
  font-stretch: normal !important;
  font-style: normal !important;
  line-height: 1.5 !important;
  letter-spacing: normal !important;
  text-align: center !important;
  color: #222 !important;
  word-break: normal;
}
</style>
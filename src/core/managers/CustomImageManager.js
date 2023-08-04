import { onObjectSelection } from "../../componentManager/sapPaneAssistant";
import { serverBus } from "../../main";
import { useMapImagesStore } from "../../stores/mapImages";
import CustomImage from "../objects/ground/CustomImage";
import API from '../../services/api';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';

export default class CustomImageManager {
    constructor(stage) {
        this.stage = stage;
        this.customImages = [];
        this.currentEditingImage = null;
        this.tempImageStats = {'rotation':0, 'scale':0, 'position':{'x':0, 'y':0}, 'opacity':0};
        this.mapImageStore = useMapImagesStore();
        serverBus.$emit('customImageEditFunc', this.initCustomImageEditMode.bind(this));
        serverBus.$emit('customImageViewToggleFunc', this.toggleImageVisibility.bind(this));
        serverBus.$emit('uploadCustomImage', this.addNewImage.bind(this));
    }

    async addNewImage(imageData){
        const uploadImage = notificationsAssistant.loading({
            title: 'Image Upload',
            message: 'Uploading custom image',
        });
        try {
        //api to save image will be added here
        let savedImgData = (await API.FETCH_MAP.POST_MAP_IMAGE(this.saveImageJSON(imageData))).data;
        this.mapImageStore.SET_CUSTOM_IMAGES([...this.mapImageStore.customImages,{id:savedImgData.id, name:savedImgData.name, url:savedImgData.url, rotation:0, scale:1, opacity: 83, is_visible:true, location: {x:0,y:0}}]);
        this.currentEditingImage = new CustomImage(this.stage, savedImgData.url, savedImgData.id, true, true, false);
        this.currentEditingImage.name = savedImgData.name;
        this.customImages.push(this.currentEditingImage);
        this.initCustomImageEditMode(this.currentEditingImage.imageId);
        notificationsAssistant.close(uploadImage);
            notificationsAssistant.success({
                title: 'Image Upload',
                message: 'Custom image uploaded successfully',
            });        
        }
        catch (e) {
            notificationsAssistant.close(uploadImage);
            notificationsAssistant.error({
                title: 'Image Upload',
                message: 'Error uploading custom image',
            });
        }
    }

    loadCustomImagesOnLoad() {
        for (let ind = 0; ind < this.mapImageStore.GET_CUSTOM_IMAGES.length; ind++) {
            const imgEl = this.mapImageStore.GET_CUSTOM_IMAGES[ind];
            let imageObj = new CustomImage(this.stage, imgEl.url, imgEl.id, true, true, true);
            imageObj.scale = imgEl.scale;
            imageObj.rotation = imgEl.rotation;
            imageObj.updateGeometry();
            if(imgEl.is_visible !== imageObj.isVisible)imageObj.toggleVisiblity();
            imageObj.updateOpacity(imgEl.opacity);
            imageObj.moveObject(imgEl.location.x, imgEl.location.y);
            imageObj.name = imgEl.name;
            this.customImages.push(imageObj);
        }
    }

    initCustomImageEditMode(id){
        for(let i = 0; i < this.customImages.length; i+=1){
            if(this.customImages[i].imageId===id){
                this.currentEditingImage = this.customImages[i];
                break;
            } 
        }
        this.tempImageStats.rotation = this.currentEditingImage.getRotation();
        this.tempImageStats.scale = this.currentEditingImage.getScale();
        this.tempImageStats.position = {'x':this.currentEditingImage.getPosition().clone().x, 'y':this.currentEditingImage.getPosition().clone().y};
        this.tempImageStats.opacity = this.currentEditingImage.getOpacity();
        this.stage.switchToCustomImageEditMode();
        if(!this.currentEditingImage.isVisible)this.currentEditingImage.toggleVisiblity();
        this.currentEditingImage.enableDragging();
        this.currentEditingImage.showEdges();
        this.currentEditingImage.showOutlinePoints();
        this.stage.selectionControls.disable();
        this.stage.duplicateManager.disable();
        this.stage.eventManager.setButtonStatusWhileEditingCustomImage(
            this.onComplete.bind(this),
            this.onComplete.bind(this),
            this.currentEditingImage,
        );
        onObjectSelection(this.currentEditingImage);
    }

    async onComplete(isDeleted=false) {
        if(!isDeleted && (this.tempImageStats.position.x !== this.currentEditingImage.getPosition().x 
        || this.tempImageStats.position.y !== this.currentEditingImage.getPosition().y 
        || this.tempImageStats.rotation !== this.currentEditingImage.getRotation() 
        || this.tempImageStats.scale !== this.currentEditingImage.getScale()
        || this.tempImageStats.opacity !== this.currentEditingImage.getOpacity()) ) {
            //patch custom image and update in store
            await API.FETCH_MAP.PATCH_MAP_IMAGE(this.currentEditingImage.imageId, this.saveImageJSON(this.currentEditingImage));
        }
        this.currentEditingImage.hideEdges();
        this.currentEditingImage.hideOutlinePoints();
        this.stage.duplicateManager.enable();
        this.stage.selectionControls.enable();
        this.stage.selectionControls.removeSelectedObject(this);
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
        this.stage.dragControls.removeIfExists(this);
        this.stage.eventManager.finishCustomImageEditMode();
        this.stage.inCustomImageEditMode = false;
        this.currentEditingImage = null;
    }

    deleteImage(){
        API.FETCH_MAP.DELETE_MAP_IMAGE(this.currentEditingImage.imageId);
        this.currentEditingImage.deleteImage();
        let imagesInStore = [...this.mapImageStore.GET_CUSTOM_IMAGES];
        for(let i = 0; i < this.customImages.length; i+=1){
            if(this.customImages[i].imageId===this.currentEditingImage.imageId){
                this.customImages.splice(i,1);
            } 
            if(imagesInStore[i].id === this.currentEditingImage.imageId){
                imagesInStore.splice(i,1);
                this.mapImageStore.SET_CUSTOM_IMAGES([...imagesInStore]);
            }
        }
        this.onComplete(true);
    }

    toggleImageVisibility(id){
        for(let i = 0; i < this.customImages.length; i+=1){
            if(this.customImages[i].imageId===id){
                this.customImages[i].toggleVisiblity();
                break;
            } 
        }
    }

    hideAllImages(){
        for(let i = 0; i < this.customImages.length; i+=1){
            this.customImages[i].hardHide();
        }
    }

    showAllImages(){
        for(let i = 0; i < this.customImages.length; i+=1){
            this.customImages[i].hardShow();
        }
    }

    saveImageJSON(obj){
        return {
            "url": obj.url,
            "rotation": obj.rotation ? obj.rotation : 0,
            "scale": obj.scale ? obj.scale : 1,
            "offset": [
                0,
                0
            ],
            "opacity" : obj.imageOpacity ? obj.imageOpacity : 83,
            "location": obj.position ? {"x":obj.position.x ,"y":obj.position.y} : {"x":0, "y":0},
            "design": this.stage.getDesignId(),
            "source": "manual_upload",
            "zoom": 0,
            "name": obj.name ? obj.name : null,
            "is_visible": obj.isVisible==null ? true : obj.isVisible,
        }
    }
}
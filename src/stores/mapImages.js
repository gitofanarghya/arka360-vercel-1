import { defineStore } from 'pinia'
import API from '../services/api';

function getInitialState() {
    return {
        customImages: [],
        standardMapImages: {google: null, bing: null, esri: null, nearmap: []},
        groundMapImageVisible: true,
        currentImageSource: null,
        latitude: 37.784403999,
        longitude: -122.4038104,
        zoomLevel: 19,
        dimensions: 512,
        square: {
            south: 0, 
            west: 0,
            north: 100,
            east: 100,
        },
    };
}

export const useMapImagesStore = defineStore('mapImages', {
    state: () => getInitialState(),
    getters: {
        GET_CUSTOM_IMAGES: (state) => {
            return state.customImages;
        },
        GET_STANDARD_IMAGES: (state) => {
            return state.standardMapImages;
        },
        GET_CURRENT_APPLIED_IMAGE_SOURCE: (state) => {
            return state.currentImageSource;
        }
    },
    actions: {
        RESET_STATE() {
            Object.assign(this, getInitialState());
        },
        SET_CUSTOM_IMAGES(images) {
            this.customImages = images;
        },
        SET_STANDARD_IMAGES(images, addedSource, nearmapImage=null) {
            this.standardMapImages = images;
            if(addedSource=="nearmap") {
                if(this.currentImageSource=="nearmap") {
                    this.standardMapImages.nearmap.forEach((item) => {
                        if(item.id==nearmapImage.id) {
                            item.is_visible=true;
                        } else {
                            item.is_visible = false;
                        }
                    });
                    this.currentImageSource = addedSource;
                } else {
                    this.standardMapImages[this.currentImageSource].is_visible = false;
                    this.currentImageSource = addedSource;
                }
            }
            else if(this.standardMapImages[addedSource].is_visible){
                if(this.currentImageSource){
                    if(this.currentImageSource == "nearmap") {
                        this.standardMapImages.nearmap.forEach((item) => {
                                item.is_visible = false;
                        }); 
                        this.currentImageSource = addedSource;
                    } else {
                        this.standardMapImages[this.currentImageSource].is_visible = false;
                        this.currentImageSource = addedSource;
                    }
                    
                }
                else{
                    this.currentImageSource = addedSource;
                }
            }
        },
        async POPULATE_ALL_MAP_IMAGES(designId) {
            const response = await API.FETCH_MAP.FETCH_ALL_MAP_IMAGES(designId);
            if(response && response.data && response.data.design_map_images){
                for (let ind = 0; ind < response.data.design_map_images.length; ind++) {
                    const imgEl = response.data.design_map_images[ind];
                    if(imgEl && imgEl.source==='bing'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {bing: {...imgEl}}),'bing');
                    }
                    else if(imgEl && imgEl.source==='google_maps'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {google: {...imgEl}}),'google');
                    }
                    else if(imgEl && imgEl.source==='esri'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {esri: {...imgEl}}),'esri');
                    }
                    // else if(imgEl && imgEl.source==='nearmap'){
                    //     this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {nearmap: {...imgEl}}),'nearmap');
                    // }
                    else if (imgEl.source === 'nearmap') {
                          this.standardMapImages.nearmap.push({ ...imgEl });
                          if(imgEl.is_visible){
                            this.currentImageSource = "nearmap";
                          }
                    }
                    else if(imgEl && imgEl.source==='manual_upload'){
                        this.SET_CUSTOM_IMAGES([...this.customImages, imgEl]);
                    }
                }
            }
        },
        async POPULATE_ALL_MAP_IMAGES_3DLINK(reference_id) {
            const response = await API.FETCH_MAP.GET_MAP_IMAGES_REFID(reference_id);
            if(response && response.data && response.data.design_map_images){
                for (let ind = 0; ind < response.data.design_map_images.length; ind++) {
                    const imgEl = response.data.design_map_images[ind];
                    if(imgEl && imgEl.source==='bing'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {bing: {...imgEl}}),'bing');
                    }
                    else if(imgEl && imgEl.source==='google_maps'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {google: {...imgEl}}),'google');
                    }
                    else if(imgEl && imgEl.source==='esri'){
                        this.SET_STANDARD_IMAGES(Object.assign(this.standardMapImages, {esri: {...imgEl}}),'esri');
                    }
                    else if(imgEl && imgEl.source==='nearmap'){
                        this.standardMapImages.nearmap.push({ ...imgEl });
                        if(imgEl.is_visible){
                          this.currentImageSource = "nearmap";
                        }
                    }
                    else if(imgEl && imgEl.source==='manual_upload'){
                        this.SET_CUSTOM_IMAGES([...this.customImages, imgEl]);
                    }
                }
            }
        },
    },
});
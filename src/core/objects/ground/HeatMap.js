import * as THREE from 'three';
import axios from 'axios';
import { DATABASE_URL } from '../../../constants';
import PolygonModel from '../model/PolygonModel.js';
import CylinderModel from '../model/CylinderModel.js';
import { SmartroofModel } from '../model/smartroof/SmartroofModel.js';
import SmartroofFace from '../model/smartroof/SmartroofFace.js';
import Dormer from '../model/smartroof/Dormer.js';

export default class HeatMap {
    constructor(stage) {
        this.stage = stage;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);

        this.material = new THREE.MeshBasicMaterial();
        this.material.transparent = true;
        this.heatMapEnabled = false;
        this.heatMapTexture = null;
        /** initial code :heatMap image is added in a plane instead of roof */
        // this.plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(stage.imageDimensions.width, stage.imageDimensions.height),
        //     this.material,
        // );
        // this.plane.position.z = -0.005;

        // this.objectsGroup.add(this.plane);

        this.objectsGroup.visible = false;
    }

    saveHeatMap() {
        const heatMapData = {
            heatMapB64Image: null,
        };
        if (this.material.map) {
            if (this.material.map.image) {
                heatMapData.heatMapB64Image = this.material.map.image.src;
            }
        }
        return heatMapData;
    }

    loadHeatMap(heatMapData) {
        if (heatMapData.heatMapB64Image !== null) {
            this.updateMaterial(heatMapData.heatMapB64Image);
        }
    }

    async updateHeatMap(notify = true) {
        // const heatMapRequest = {
        //     latitude: this.stage.getLatitude(),
        //     longitude: this.stage.getLongitude(),
        //     image_dimensions: this.stage.imageDimensions,
        //     models: roofMapExporter(
        //         this.stage,
        //         { approximateCylinder: true },
        //         { approximateTree: true },
        //     ),
        // };

        const payload = {
            image_dimensions: {
                width: this.stage.imageDimensions.width,
                height: this.stage.imageDimensions.height,
            },
        };
        let notificationObject;
        if(notify){
            notificationObject = this.stage.eventManager.heatMapLoading();
        }
        try {
            // let response;
            // if (!localStorage.getItem('heatmap')) {
                let refOrDesignID = ""
                    if(this.stage.getDesignId()){
                        refOrDesignID = this.stage.getDesignId()
                    }else{
                        refOrDesignID = window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
                    }
                const response = await axios.post(
                    DATABASE_URL + 'api/designs/' + refOrDesignID + '/get_heat_map/',
                    payload,
                );
                this.updateMaterial(response.data);
            // } else {
            //     response = localStorage.getItem('heatmap')
            //     this.updateMaterial(response);
            // }
            if (notify) {
                this.stage.eventManager.heatMapLoaded(notificationObject);
            }
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('HeatMap: updateHeatMap: Request failed.', error);
            if (notify) {
                this.stage.eventManager.heatMapLoadingFailed(notificationObject);
            }
            return Promise.reject(error);
        }
    }

    updateMaterial(heatMapB64Image) {
        this.texture = new THREE.TextureLoader().load(heatMapB64Image);
        this.material.map = this.texture;
        this.material.needsUpdate = true;
        const groundChildren = this.stage.ground.getChildren();
        for (let i = 0; i < groundChildren.length; i++) {
            if (groundChildren[i] instanceof PolygonModel ||
                groundChildren[i] instanceof CylinderModel ||
                groundChildren[i] instanceof SmartroofModel ||
                groundChildren[i] instanceof SmartroofFace ||
                groundChildren[i] instanceof Dormer) {
                groundChildren[i].heatMapTexture = this.texture;
                groundChildren[i].heatMapEnabled = true;
                groundChildren[i].addMapTexture();
            }
        }
    }

    async show(notify = true) {
        if (!this.objectsGroup.visible) {
            if (this.material.map === null) {
                try {
                    await this.updateHeatMap(notify);
                }
                catch (error) {
                    console.error('HeatMap: show: Request failed.', error);
                    return Promise.reject(error);
                }
            }
            this.objectsGroup.visible = true;
            this.heatMapEnabled = true;
            this.stage.eventManager.heatMapVisibility(true);
            this.stage.visualManager.updateVisualsForHeatMap(true);
            const groundChildren = this.stage.ground.getChildren();
            for (let i = 0; i < groundChildren.length; i++) {
                if (groundChildren[i] instanceof PolygonModel ||
                    groundChildren[i] instanceof CylinderModel ||
                    groundChildren[i] instanceof SmartroofModel ||
                    groundChildren[i] instanceof SmartroofFace ||
                    groundChildren[i] instanceof Dormer) {
                    groundChildren[i].heatMapEnabled = true;
                    groundChildren[i].addMapTexture();
                }
            }
        }
        return Promise.resolve(true);
    }

    async refresh() {
        try {
            await this.updateHeatMap();
            await this.show();
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('HeatMap: refresh: Request failed.', error);
            return Promise.reject(error);
        }
    }

    hide() {
        if (this.objectsGroup.visible) {
            this.objectsGroup.visible = false;
            this.heatMapEnabled = false;
            this.stage.eventManager.heatMapVisibility(false);
            this.stage.visualManager.updateVisualsForHeatMap(false);
            this.stage.ground.removeRoofTexture();
            const groundChildren = this.stage.ground.getChildren();
            for (let i = 0; i < groundChildren.length; i++) {
                if (groundChildren[i] instanceof PolygonModel ||
                    groundChildren[i] instanceof CylinderModel ||
                    groundChildren[i] instanceof SmartroofModel ||
                    groundChildren[i] instanceof SmartroofFace ||
                    groundChildren[i] instanceof Dormer) {
                    groundChildren[i].heatMapEnabled = false;
                    if (this.stage.visualManager.in3D) {
                        groundChildren[i].addMapTexture();
                    }
                }
            }
        }
    }

    removeHeatMapOnModelPlace() {
        this.hide();
        this.material.map = null;
    }

    showObjectLayer() {
        this.objectsGroup.children.forEach((child) => {
            child.layers.enable(0);
        });
    }

    hideObjectLayer() {
        this.objectsGroup.children.forEach((child) => {
            child.layers.disable(0);
        });
    }

    isVisible() {
        return this.objectsGroup.visible;
    }
}

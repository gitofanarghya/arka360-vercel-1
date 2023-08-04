import * as utils from "../utils/utils";
import * as raycastingUtils from "../utils/raycastingUtils";
import * as THREE from "three";
import { useStudioStageStore } from "../../stores/studio-stage";
import { serverBus } from "../../main";
import mapsLoaded from "../../components/googleMaps/googleMaps"
import DualMapMarker from "../objects/subObjects/DualMapMarker";
import { useMapImagesStore } from "../../stores/mapImages";

export default class DualMapManager {
    constructor(stage) {
        this.stage = stage;
        this.mapObjectsGroup = new THREE.Group();
        this.mapObjectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.mapObjectsGroup);
        this.dualMapMarker = new DualMapMarker(stage);
        this.dualMapMarker.hideMarker();
        this.mapStore = useMapImagesStore();
    }
    async turnStreetMap() {
        await this.startStreetMap();
        this.showStreetViewLayer();
        useStudioStageStore().resizeEnabled = false;
        this.stage.streetMapVisible = true;
        this.stage.resizeRendererAndCamera();
    }

    async turnSatelliteMap() {
        this.hideStreetViewLayer();
        await this.startTiltMap();
        useStudioStageStore().resizeEnabled = true;
        this.stage.streetMapVisible = false;
        this.stage.resizeRendererAndCamera();
    }

    showStreetViewLayer() {
        if(!this.stage.visualManager.in3D){
            this.mapObjectsGroup.visible = true;
            this.dualMapMarker.showMarker();
        }
    }
    hideStreetViewLayer() {
        this.mapObjectsGroup.visible = false;
        this.dualMapMarker.hideMarker();
    }

    stopDualMap() {
        this.hideStreetViewLayer();
        useStudioStageStore().resizeEnabled = true;
        this.stage.streetMapVisible = false;
        this.stage.resizeRendererAndCamera();
    }

    async switchDualMap() {
        let stage = useStudioStageStore();
        stage.SET_DUAL_MAP_MODE(!stage.dualMapMode);
        this.stage.dualMapVisible = stage.dualMapMode;
        this.checkIfStreetDataAvailable();
        serverBus.$emit('satelliteMapFunc', this.turnSatelliteMap.bind(this));
        serverBus.$emit('streetMapFunc', this.turnStreetMap.bind(this));
        setTimeout(async () => {
            this.stage.dualMapVisible ? await this.turnSatelliteMap() : this.stopDualMap();
        }, 0);
    }
    async checkIfStreetDataAvailable() {
        try {
            if(!this.google){
                this.google = await mapsLoaded;
            }
        }catch (err) {
            console.error("Google Maps API Load Error")
            console.error(err)
            return
        }
        const sv = new this.google.maps.StreetViewService();
        try {
            await sv.getPanorama({ location: {lat: this.mapStore.latitude, lng: this.mapStore.longitude}, radius: 50 }).then(this.svCallback);
        }catch(err) {
            console.log(err, "error");
            useStudioStageStore().streetViewInvalid = true;
        }

    }

    svCallback({data}) {
        useStudioStageStore().streetViewInvalid = false;
    }
    async startTiltMap(){
        try {
            if(!this.google){
                // google = await mapsLoaded
                this.google = await mapsLoaded;
            }
        }catch (err) {
            console.error("Google Maps API Load Error")
            console.error(err)
            return
        }
        let mapOptions = {
            zoom: this.mapStore.zoomLevel,
            minZoom: 15,
            center: {lat: this.mapStore.latitude, lng: this.mapStore.longitude},
            mapTypeId: 'satellite',
            fullscreenControl: false,
            mapTypeControl: true,
            streetViewControl: false,
        };
        this.tiltMap = new this.google.maps.Map(document.getElementById('map_canvas'),
            mapOptions);
    }

    async startStreetMap(){
        try {
            if(!this.google){
                // google = await mapsLoaded
                this.google = await mapsLoaded;
            }
        }catch (err) {
            console.error("Google Maps API Load Error")
            console.error(err)
            return
        }
        const panorama = new this.google.maps.StreetViewPanorama(
            document.getElementById("map_canvas"),
            {
                position: {lat:this.mapStore.latitude, lng:this.mapStore.longitude},
                pov: {
                    heading: 0,
                    pitch: 0,
                },
                zoom: 1,
                motionTracking: false,
                linksControl: false,
                fullscreenControl: false,
                addressControl: false,
                visible: true,
                scrollwheel: true,
            }
        );
        this.panorama = panorama;
        panorama.setZoom(1);

        this.currentPov = panorama.getPov().heading;
        this.currentZoom = panorama.getZoom();
        this.currentFovAngle = (this.currentZoom == 0) ? 180 : (this.currentZoom == 1) ? 90 : (this.currentZoom == 2) ? 45 : (this.currentZoom == 3) ? 22.5 : (this.currentZoom == 4) ? 11.25 : 45;
        // panorama.setTilt(45);
        this.drawLineBlue(0,0);
        this.drawLineRed(0,0);
        this.drawPlane();
        this.lastFovCenter = {lat:this.mapStore.latitude, lng:this.mapStore.longitude};
        panorama.addListener("pov_changed", () => {
            this.updatePOV(panorama.getPov().heading);
        });
        panorama.addListener("position_changed", () => {
            this.updateFovCenter(panorama.getPosition());
        });
        panorama.addListener("zoom_changed", () => {
            this.updateZoomForFOV(panorama.getZoom(), panorama.getPov().heading);
        });
    }
    updatePOV(obj){
        let deg2rot = utils.deg2Rad(this.currentPov-obj);
        this.currentPov = obj;
        this.rotateLine(this.blueline, deg2rot);
        this.rotateLine(this.redline, deg2rot);
        this.drawPlane();
    }
    rotateLine(line, deg2rot){
        let tempVec = new THREE.Vector2();
        let rotationCenter = new THREE.Vector2(line.geometry.attributes.position.getX(0),line.geometry.attributes.position.getY(0));
        tempVec.x = line.geometry.attributes.position.getX(1) - line.geometry.attributes.position.getX(0);
        tempVec.y = line.geometry.attributes.position.getY(1) - line.geometry.attributes.position.getY(0);
        tempVec.rotateAround(rotationCenter, deg2rot);
        line.geometry.attributes.position.setXY(1, tempVec.x, tempVec.y);
        line.geometry.attributes.position.needsUpdate = true;

        // tempVec = new THREE.Vector2();
        // rotationCenter = new THREE.Vector2(this.redline.geometry.attributes.position.getX(0),this.redline.geometry.attributes.position.getY(0));
        // tempVec.x = this.redline.geometry.attributes.position.getX(1) - this.redline.geometry.attributes.position.getX(0);
        // tempVec.y = this.redline.geometry.attributes.position.getY(1) - this.redline.geometry.attributes.position.getY(0);
        // tempVec.rotateAround(rotationCenter, deg2rot);
        // this.redline.geometry.attributes.position.setXY(1, tempVec.x, tempVec.y);
        // this.redline.geometry.attributes.position.needsUpdate = true;
    }
    updateZoomForFOV(val, centerAngle){
        let zoomVal = Math.round(val);
        if(this.currentZoom!==zoomVal){
            let fovAngle = (zoomVal == 0) ? 180 : (zoomVal == 1) ? 90 : (zoomVal == 2) ? 45 : (zoomVal == 3) ? 22.5 : (zoomVal == 4) ? 11.25 : 45;
            // centerAngle += 90;
            let ang2rot = fovAngle-this.currentFovAngle;
            this.currentZoom = zoomVal;
            this.rotateLine(this.blueline, utils.deg2Rad(ang2rot/2));
            this.rotateLine(this.redline, utils.deg2Rad(-ang2rot/2));
            // this.blueline.rotateZ(utils.deg2Rad(ang2rot/2));
            // this.redline.rotateZ(utils.deg2Rad(-ang2rot/2));
            this.currentFovAngle = fovAngle;
            this.drawPlane();
        }
    }
    updateFovCenter(pos){
        const newLat = pos.lat();
        const newLong = pos.lng();
        let diffX = (newLong - this.mapStore.longitude)*(111000/90)*(90-Math.abs(newLat));
        let diffY = (newLat - this.mapStore.latitude)*111000;
        if(!raycastingUtils.checkPointOnGround([diffX,diffY],this.stage)){
            this.panorama.setPosition(this.lastFovCenter);
            return;
        }
        this.lastFovCenter = {lat:newLat, lng: newLong};
        this.moveFovLines(diffX, diffY);
        // this.moveFovPlane(diffX, diffY);
        this.drawPlane();
    }
    updateMarkerPosition(x,y){
        const currentPos = this.blueline.position.clone();
        const diffX = x- currentPos.x;
        const diffY = y - currentPos.y;
        let currCords = this.panorama.getPosition();
        let newLat = (diffY/111000) + currCords.lat();
        let newLong = ((diffX*(90/111000))/(90-Math.abs(newLat))) + currCords.lng();

        this.panorama.setPosition({lat:newLat, lng:newLong});
    }
    moveFovPlane(finX, finY){
        const currentPoint = this.fovPlane.position.clone();
        console.log(finX, finY, currentPoint);
        this.fovPlane.translateX(finX - currentPoint.x);
        this.fovPlane.translateY(finY - currentPoint.y);
    }
    moveFovLines(finX, finY){
        const currentPoint = this.blueline.position.clone();
        this.blueline.translateX(finX - currentPoint.x);
        this.blueline.translateY(finY - currentPoint.y);
        this.redline.translateX(finX - currentPoint.x);
        this.redline.translateY(finY - currentPoint.y);
    }
    drawPlane(){
        if(this.fovPlane){
            this.mapObjectsGroup.remove(this.fovPlane);
        }
        let rect = new THREE.Mesh(
            new THREE.PlaneGeometry(0, 0, 1),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
            }),
        );
        rect.frustumCulled = false;
        rect.visible = true;
        this.mapObjectsGroup.add( rect );
        this.fovPlane = rect;

        const positions = this.fovPlane.geometry.getAttribute('position')
        positions.array[0] =  this.blueline.position.clone().x + this.blueline.geometry.attributes.position.getX(0);
        positions.array[1] =  this.blueline.position.clone().y + this.blueline.geometry.attributes.position.getY(0);
        positions.array[2] =  20;

        positions.array[3] =  this.blueline.position.clone().x + this.blueline.geometry.attributes.position.getX(1);
        positions.array[4] =  this.blueline.position.clone().y + this.blueline.geometry.attributes.position.getY(1);
        positions.array[5] =  20;

        positions.array[6] =  this.blueline.position.clone().x + this.redline.geometry.attributes.position.getX(1);
        positions.array[7] =  this.blueline.position.clone().y + this.redline.geometry.attributes.position.getY(1);
        positions.array[8] =  20;

        positions.array[9] =  this.blueline.position.clone().x + this.blueline.geometry.attributes.position.getX(0);
        positions.array[10] = this.blueline.position.clone().y + this.blueline.geometry.attributes.position.getY(0);
        positions.array[11] =  20;
  
        this.fovPlane.geometry.attributes.position.needsUpdate = true;
        return rect;
    }
    drawLineRed(x,y){
        if(this.redline){
            this.mapObjectsGroup.remove(this.redline);
        }
        const points = [];
        const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 1,
            scale: 2,
            dashSize: 1,
            gapSize: 1,
        });
        points.push( new THREE.Vector3( x, y, 100 ) );
        points.push( new THREE.Vector3( 60, 60, 100 ) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        line.computeLineDistances();
        this.mapObjectsGroup.add( line );
        this.redline = line;
        return line;
    }
    drawLineBlue(x,y){
        if(this.blueline){
            this.mapObjectsGroup.remove(this.blueline);
        }
        const points = [];
        // const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 1,
            scale: 2,
            dashSize: 1,
            gapSize: 1,
        });
        points.push( new THREE.Vector3( x, y, 100 ) );
        points.push( new THREE.Vector3( -60, 60, 100 ) );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometry, material );
        line.computeLineDistances();
        this.mapObjectsGroup.add( line );
        this.blueline = line;
        return line;
    }
}
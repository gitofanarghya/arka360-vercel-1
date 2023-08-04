import * as THREE from "three";
import { checkPointOnGround } from "../../utils/raycastingUtils";
import { OUT_OF_GROUND_ERROR } from "../../coreConstants";

export default class DualMapMarker {
    constructor(stage) {
        this.stage = stage;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // this.belongsTo = object;
        const svgImageURL = new URL('/src/assets/img/marker.png', import.meta.url).href
        const spriteTexture = new THREE.TextureLoader().load(svgImageURL);

        this.vertexMesh = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTexture }));
        this.vertexMesh.position.set(
            0,0,110
        );
        this.vertexMesh.scale.set(5,6,1);
        this.objectsGroup.add(this.vertexMesh);
    }
    moveObject(deltaX,deltaY){
        this.vertexMesh.position.add(new THREE.Vector3(deltaX,deltaY,0));
    }
    placeObject(){
        this.stage.dualMapManager.updateMarkerPosition(this.vertexMesh.position.x, this.vertexMesh.position.y);
    }
    showMarker(){
        this.objectsGroup.visible = true;
        this.stage.dragControls.add(
            this,
            this.moveObject.bind(this),
            this.placeObject.bind(this),
        );
    }
    hideMarker(){
        this.objectsGroup.visible = false;
        this.stage.dragControls.removeIfExists(this);
    }
    getPosition() {
        if (this.vertexMesh != null) {
            // noinspection JSValidateTypes
            return this.vertexMesh.position.clone();
        }
        return null;
    }
    getPlacingInformation() {
        const response = {};

        response.errors = [];
        // This is the error that is displayed to the user
        response.pointUnplaceableError = null;
        if(!checkPointOnGround(this.getPosition(),this.stage)){
            const error = new Error(OUT_OF_GROUND_ERROR);
            response.errors.push(error);
            response.pointUnplaceableError = error;
        }

        return response;
    }
    updateWhilePlacing(){
    }
}
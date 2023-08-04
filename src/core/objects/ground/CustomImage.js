import * as THREE from 'three';

import CustomImageEditorManager from
    '../../managers/CustomImageEditorManager';
import {
    getCustomImageDimensions,
    scaleMetersToRatio,
    getAspectRatio,
    scaleRatioToMeters,
    getDefaultGroundSize,
} from '../../utils/customImageEditUtils';
import * as utils from '../../utils/utils';
import {
    COLOR_MAPPINGS,
    IMAGE_MODEL_OPACITY,
} from '../visualConstants';
import * as visualUtils from '../../utils/visualUtils';
import { INVALID_SCALE } from '../../coreConstants';
import OutlinePoints from '../subObjects/OutlinePoints';
import { useMapImagesStore } from '../../../stores/mapImages';

export default class CustomImage {
    constructor(stage, image, imageId, loadTexture = true, isCustom = false, onLoad = false) {
        this.stage = stage;
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: loadTexture,
            opacity: IMAGE_MODEL_OPACITY,
        });
        this.outlinePoints = [];

        const planeGeometry =
            new THREE.PlaneGeometry(stage.imageDimensions.width, stage.imageDimensions.height);
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.highlightEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.plane.geometry),
            new THREE.LineDashedMaterial({
                color: 0xffffff,
                linewidth: 1,
                scale: 2,
                dashSize: 1,
                gapSize: 1,
            })
        );
        this.highlightEdges.computeLineDistances();
        this.position = new THREE.Vector3(0, 0, 0);
        this.initalPoints = [];

        if (loadTexture) {
            new THREE.TextureLoader().load(image, (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                const customImageDimensions = getCustomImageDimensions(
                    stage.imageDimensions,
                    {
                        width: texture.image.width,
                        height: texture.image.height,
                    },
                );
                if(isCustom){
                    customImageDimensions.width /= 4;
                    customImageDimensions.height /= 4;
                }
                this.plane.geometry = new THREE.PlaneGeometry(
                    customImageDimensions.width,
                    customImageDimensions.height,
                );
                this.plane.material.map = texture;
                this.plane.material.needsUpdate = true;
                if(isCustom){
                    for (let i = 0, l = 4; i < l; i += 1) {
                        this.outlinePoints.push(new OutlinePoints(
                            this.plane.geometry.attributes.position.getX(i),
                            this.plane.geometry.attributes.position.getY(i),
                            this.plane.geometry.attributes.position.getZ(i),
                            this,
                            this.stage,
                            {
                                OUTLINE_POINT_COLOR: 0xffffff,
                            },
                        ));
                        this.initalPoints.push(this.outlinePoints[i].getPosition());
                    }
                    this.highlightEdges.geometry = new THREE.EdgesGeometry(this.plane.geometry);
                    this.highlightEdges.computeLineDistances();
                    if(!onLoad){
                        this.showOutlinePoints();
                        this.enableOutlinePointDragging();
                    }
                    this.correctOutlinePoints();
                }      
            })
        }
        this.image = image;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        stage.sceneManager.scene.add(this.objectsGroup);

        this.objectsGroup.add(this.plane);

        if(isCustom){            
            this.objectsGroup.add(this.highlightEdges);
        }
        this.hideEdges();
        this.isVisible = true;
        this.rotation = 0;
        this.scale = 1;
        this.imageOpacity = 83;

        this.imageId = imageId;
    }

    hideOutlinePoints(){
        this.outlinePoints.forEach(op => {
            op.hideObject();
        });
    }

    showOutlinePoints(){
        this.outlinePoints.forEach(op => {
            op.showObject();
        });
    }

    initialize() {
        CustomImageEditorManager.getInstance().initialize(
            this,
            this.removeObject.bind(this),
            this.removeObject.bind(this),
        );
    }

    async applyTransformations(transformations) {
        if (transformations.scale !== undefined && transformations.scale !== null) {
            if (transformations.scale === INVALID_SCALE) {
                transformations.scale = getDefaultGroundSize(this.stage).width;
            }
            this.updateScale(scaleMetersToRatio(
                transformations.scale,
                await getAspectRatio(this.image),
                this.stage.getImageDimensions().width,
            ));
        }
        if (transformations.rotation !== undefined && transformations.rotation !== null) {
            this.updateRotation(transformations.rotation);
        }
        if (transformations.offset !== undefined && transformations.offset !== null) {
            this.moveObject(transformations.offset[0], transformations.offset[1]);
        }
    }
    updateWhilePlacing() {
        // do nothing
    }


    removeObject() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);

        this.stage.selectionControls.removeSelectedObject(this);
        this.stage.dragControls.removeIfExists(this);
    }

    deleteImage() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);
    }

    updateRotation(newRotation) {
        this.rotation = newRotation;
        this.updateGeometry();
        this.correctOutlinePoints();
    }

    updateOpacity(opacityVal) {
        this.imageOpacity = opacityVal;
        this.plane.material.opacity = this.imageOpacity/100;
    }

    updateScale(newScale, scaleCentre = this.getPosition()) {
        const centre = this.plane.position;
        const newPositionOfScaleOrigin = new THREE.Vector2(
            ((newScale / this.scale) * (scaleCentre.x - centre.x)) + centre.x,
            ((newScale / this.scale) * (scaleCentre.y - centre.y)) + centre.y,
        );
        this.moveObject(
            scaleCentre.x - newPositionOfScaleOrigin.x,
            scaleCentre.y - newPositionOfScaleOrigin.y,
        );

        this.scale = newScale;
        this.updateGeometry();
        this.correctOutlinePoints();
    }

    updateGeometry() {
        this.plane.scale.set(this.scale, this.scale, this.scale);
        this.plane.rotation.set(0, 0, -utils.deg2Rad(this.rotation));
        this.highlightEdges.scale.set(this.scale, this.scale, this.scale);
        this.highlightEdges.rotation.set(0, 0, -utils.deg2Rad(this.rotation));
        this.highlightEdges.computeLineDistances();   
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        const deltaVector = new THREE.Vector3(deltaX, deltaY, deltaZ);
        this.plane.position.add(deltaVector);
        this.highlightEdges.position.add(deltaVector);
        this.position.add(deltaVector);
        this.outlinePoints.forEach(op => {
            op.moveObjectWithoutConsequences(deltaX, deltaY, deltaZ);
        });
    }

    // In version 2, error visuals would be added.
    getPlacingInformation() {
        const response = {
            parent: null,
            height: 0,
            errors: [],
        };

        return response;
    }

    handleDragMove(deltaX, deltaY) {
        this.moveObject(deltaX, deltaY, 0);
    }

    // Visual Functions
    // In version 2 different visuals would be added so leaving this here.

    getColorMap() {
        const colorMapping = COLOR_MAPPINGS.IMAGE_MODEL;
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    removeTransparency() {
        this.plane.material.transparent = false;
    }

    updateVisualsBasedOnStates() {
        const newColors = this.getColorMap();

        visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.plane);
    }

    enableDragging() {
        this.stage.dragControls.add(
            this,
            this.handleDragMove.bind(this),
        );
        this.enableOutlinePointDragging();
    }
    /**
     * This function enables dragging of outline points in a JavaScript program.
     */
    enableOutlinePointDragging() {
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const v = this.outlinePoints[i];
            this.stage.dragControls.add(
                v,
                v.moveObject.bind(v),
                v.placeObject.bind(v),
                v.handleDragStart.bind(v),
                v.handleDragCancel.bind(v),
            );
        }
    }

    enableObjectLayer(layer) {
        this.plane.layers.enable(layer);
    }

    disableObjectLayer(layer) {
        this.plane.layers.disable(layer);
    }

    showEdges() {
        this.highlightEdges.visible = true;
    }

    hideEdges() {
        this.highlightEdges.visible = false;
    }

    showImage() {
        this.objectsGroup.visible = true;
    }

    hideImage() {
        this.objectsGroup.visible = false;
    }

    toggleVisiblity(){
        this.isVisible = !this.isVisible;
        const customImagesInStore = useMapImagesStore().GET_CUSTOM_IMAGES;
        for (let ind = 0; ind < customImagesInStore.length; ind++) {
            if(customImagesInStore[ind].id===this.imageId) {
                customImagesInStore[ind].is_visible = this.isVisible;
                break;
            }
        }
        if(this.isVisible){
            this.showImage();
        }else{
            this.hideImage();
        }
    }

    hardHide(){
        this.isVisible = false;
        this.hideImage();
        const customImagesInStore = useMapImagesStore().GET_CUSTOM_IMAGES;
        for (let ind = 0; ind < customImagesInStore.length; ind++) {
            if(customImagesInStore[ind].id===this.imageId) {
                customImagesInStore[ind].is_visible = false;
                break;
            }
        }
    }

    hardShow(){
        this.isVisible = true;
        this.showImage();
        const customImagesInStore = useMapImagesStore().GET_CUSTOM_IMAGES;
        for (let ind = 0; ind < customImagesInStore.length; ind++) {
            if(customImagesInStore[ind].id===this.imageId) {
                customImagesInStore[ind].is_visible = true;
                break;
            }
        }
    }

    getAspectRatio() {
        return this.plane.material.map.image.width / this.plane.material.map.image.height;
    }

    async getDimensions() {
        await new Promise((resolve) => {
          const checkImageLoaded = () => {
            if (this.plane.material.map && this.plane.material.map.image && this.plane.material.map.image.width > 0) {
              resolve();
            } else {
              requestAnimationFrame(checkImageLoaded);
            }
          };
          checkImageLoaded();
        });
      
        return {
          width: this.plane.material.map.image.width,
          height: this.plane.material.map.image.height,
        };
      }

    getImageDimensions() {
        return {
            width: this.plane.material.map.image.width,
            height: this.plane.material.map.image.height,
        };
    }

    getPosition() {
        return this.position;
    }

    getImage() {
        return this.image;
    }

    getScale() {
        return this.scale;
    }

    getRotation() {
        return this.rotation;
    }

    getOpacity() {
        return this.imageOpacity;
    }

    getOffset() {
        return [this.getPosition().x, this.getPosition().y];
    }

    getScaleInMeters() {
        return scaleRatioToMeters(
            this.getScale(),
            this.stage.getImageDimensions().width,
        );
    }

    getImageId() {
        return this.imageId;
    }

    static getObjectType() {
        return 'CustomImage';
    }

    get2DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            vertices.push([
                this.outlinePoints[i].getPosition().x,
                this.outlinePoints[i].getPosition().y,
            ]);
        }
        return vertices;
    }

    get3DVertices() {
        const vertices = [];
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            const outlinePoint = this.outlinePoints[i].getPosition();
            vertices.push([
                outlinePoint.x,
                outlinePoint.y,
                this.position.z,
            ]);
        }
        return vertices;
    }

    /**
     * The function corrects the position of outline points based on the transformation of a plane and
     * returns the updated vertices.
     * @returns an array of vertices.
     */
    correctOutlinePoints() {
        this.plane.updateMatrix();
        const transformed = this.initalPoints.map(v => v.clone().applyMatrix4(this.plane.matrix));
        let vertices = utils.convertVectorToArray(transformed);
        for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
            let offset = new THREE.Vector3().subVectors(new THREE.Vector3(vertices[i][0], vertices[i][1], this.position.z), this.outlinePoints[i].getPosition());
            this.outlinePoints[i].moveObjectWithoutConsequences(offset.x, offset.y, offset.z);
        }
        return vertices;
    }

    /**
     * This function handles the movement and scaling of vertices on a plane in a 3D space.
     * @param point - The point being moved.
     */
    handleVertexMove(point) {
        // Calcukate the position to which point should be scaled to on diagonal axis
        let pointOfScale = utils.closestPointOnEdge(point.getPosition(), this.plane.position.clone(), this.vertexDragStartPosition.clone().sub(this.plane.position.clone()).multiplyScalar(1000));
        
        // Calculate the scale factor
        let scale = this.plane.position.clone().distanceTo(new THREE.Vector3(pointOfScale.x, pointOfScale.y, 0)) / this.plane.position.clone().distanceTo(this.vertexDragStartPosition);
        
        // Restrict moving to center of plane
        if (Math.abs(pointOfScale.x - this.plane.position.x) > 1
            && Math.abs(pointOfScale.y - this.plane.position.y) > 1) {

            this.pointOfScale = pointOfScale;
            for (let i = 0, len = this.outlinePoints.length; i < len; i += 1) {
                // Move other points respectively
                    let dir = this.initialVertices[i].clone().sub(this.plane.position.clone());
                    let newPos = dir.multiplyScalar(scale).add(this.plane.position.clone());
                    let offset = new THREE.Vector3().subVectors(newPos, this.outlinePoints[i].getPosition());
                    this.outlinePoints[i].moveObjectWithoutConsequences(offset.x, offset.y, offset.z);
                // Scale the image with sespect to currect scale
                    this.scale = scale * this.initialScale;
                    this.updateGeometry();
            }

        } else {
            point.setPosition(this.pointOfScale.x, this.pointOfScale.y, this.position.z);
        }
    }

    /**
     * This function handles the start of a vertex drag operation and stores the initial position,
     * scale, and vertices.
     * @param point - `point` is an object that represents the position of the vertex being dragged. It
     * likely contains x and y coordinates that indicate the location of the vertex on the screen.
     */
    handleVertexDragStart(point){
        this.vertexDragStartPosition = point.getPosition();
        this.initialScale = this.scale;
        this.initialVertices = utils.convertArrayTo3DVector(this.get3DVertices());
    }

    handleVertexPlace(point) {
        console.log('handleVertexPlace: ');
        // this.handleVertexMove(point);
        // this.initialVertices = utils.convertArrayTo3DVector(this.get3DVertices());
    }

    handleDragCancel(point) {
        console.log('handleDragCancel: ');
    }
}

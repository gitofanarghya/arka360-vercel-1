import * as THREE from 'three';
import CustomImage from './CustomImage';
import { getCustomImageDimensions } from '../../utils/customImageEditUtils';
import { replaceGoogleApiKeyInUrl } from "@/utils.js"

export default class GroundImage extends CustomImage {
    constructor(stage, image, imageId, ground) {
        super(stage, image.url, imageId, false, false);

        this.objectsGroup.container = ground;

        this.solidMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
        });
        this.solidMaterial.defines = this.solidMaterial.defines || {};
        this.solidMaterial.defines.CUSTOM = '';

        this.translucentMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        });
        this.plane.position.z = -0.01;
        this.plane.visible = false;

        this.switchToTranslucentMaterial();

        // Jugaad - Replace old expired Google API key with new key
        image.url = replaceGoogleApiKeyInUrl(image.url)

        this.textureLoadPromise = [];
        this.textureLoadPromise.push(new THREE.TextureLoader().loadAsync(image.url).then((texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            const customImageDimensions = getCustomImageDimensions(
                stage.imageDimensions,
                {
                    width: texture.image.width,
                    height: texture.image.height,
                },
            );
            this.plane.geometry = new THREE.PlaneGeometry(
                customImageDimensions.width,
                customImageDimensions.height,
            );

            this.solidMaterial.map = texture;
            this.solidMaterial.needsUpdate = true;

            this.translucentMaterial.map = texture;
            this.translucentMaterial.needsUpdate = true;

        }));
    }

    loadObject(customImageData) {
        this.updateRotation(customImageData.rotation);
        this.updateScale(customImageData.scale);
        this.moveObject(customImageData.offset[0], customImageData.offset[1]);
        this.updateClippingPlanes();

        this.plane.visible = true;
    }

    updateClippingPlanes() {
        const clippingPlaneConstant = this.stage.getImageDimensions().width / 2;
        const clippingPlanes = [
            new THREE.Plane(new THREE.Vector3(1, 0, 0), clippingPlaneConstant),
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), clippingPlaneConstant),
            new THREE.Plane(new THREE.Vector3(0, 1, 0), clippingPlaneConstant),
            new THREE.Plane(new THREE.Vector3(0, -1, 0), clippingPlaneConstant),
            new THREE.Plane(new THREE.Vector3(0, 0, 1), clippingPlaneConstant),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), clippingPlaneConstant),
        ];

        this.solidMaterial.clippingPlanes = clippingPlanes;
        this.translucentMaterial.clippingPlanes = clippingPlanes;
    }

    switchToSolidMaterial() {
        this.plane.material = this.solidMaterial;
        this.plane.receiveShadow = true;
        this.solidMaterial.needsUpdate = true;
    }

    switchToTranslucentMaterial() {
        this.plane.material = this.translucentMaterial;
        this.plane.receiveShadow = false;
        this.translucentMaterial.needsUpdate = true;
    }

    hide() {
        this.objectsGroup.visible = false;
    }

    show() {
        this.objectsGroup.visible = true;
    }

    remove() {
        this.stage.sceneManager.scene.remove(this.objectsGroup);
        this.plane.geometry.dispose();
    }

    getPlane() {
        return this.plane;
    }
}

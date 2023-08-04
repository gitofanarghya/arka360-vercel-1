import * as THREE from 'three';
export default class RendererManager {
    constructor(canvas) {
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            preserveDrawingBuffer: true,
            logarithmicDepthBuffer: true,
        });
        this.DPR = window.devicePixelRatio ? window.devicePixelRatio : 1;
        this.renderer.setPixelRatio(this.DPR);
        // This gets resized later anyway. So we can start with minimum dimensions for the renderer.
        this.renderer.setSize(1, 1);

        this.renderer.localClippingEnabled = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = false;
        this.renderer.shadowMap.type = THREE.PCFShadowMap; // options are THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    }

    getMaxTextureSizeForThisMachine() {
        return this.renderer.capabilities.maxTextureSize;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resizeRenderer(screenDimensions) {
        this.renderer.setSize(screenDimensions.width, screenDimensions.height);
    }

    getDomElement() {
        return this.renderer.domElement;
    }

    updateShadows() {
        // previously shadows were rendered every animation frame
        // which resulted in huge frame drops when using directional lights
        this.renderer.shadowMap.needsUpdate = true;
    }
}

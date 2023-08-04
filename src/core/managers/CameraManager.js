import * as THREE from 'three';
import { CAMERA_TYPE_2D, CAMERA_TYPE_3D, ORTHO_CAMERA_Z } from '../coreConstants';
import { deg2Rad } from '../utils/utils';

const FOV = 45;

export default class CameraManager {
    constructor(screenDimensions, imageDimensions, cameraType) {
        this.camera = undefined;
        this.isCameraHelperEnabled = false;

        this.initPerspectiveCamera(screenDimensions, imageDimensions);
        this.initOrthographicCamera(screenDimensions, imageDimensions);

        if (cameraType === CAMERA_TYPE_2D) {
            this.camera = this.orthographicCamera;
        }
        else if (cameraType === CAMERA_TYPE_3D) {
            this.camera = this.perspectiveCamera;
        }
        else {
            console.error('ERROR: CameraManager encountered an unknown camera type');
        }
    }

    initOrthographicCamera(screenDimensions, imageDimensions) {
        const orthographicCameraScaleFactor = imageDimensions.width /
            (screenDimensions.width > screenDimensions.height ?
                screenDimensions.width : screenDimensions.height);
        this.orthographicCamera = new THREE.OrthographicCamera(
            (screenDimensions.width / -2) * orthographicCameraScaleFactor,
            (screenDimensions.width / 2) * orthographicCameraScaleFactor,
            (screenDimensions.height / 2) * orthographicCameraScaleFactor,
            (screenDimensions.height / -2) * orthographicCameraScaleFactor,
            1,
            1000,
        );
        this.orthographicCamera.position.set(0, 0, ORTHO_CAMERA_Z);
        this.orthographicCameraFirstSwitch = true;
    }

    initPerspectiveCamera(screenDimensions, imageDimensions) {
        const perspectiveCameraZ = (imageDimensions.width < imageDimensions.height ?
            imageDimensions.width :
            imageDimensions.height) / (2 * Math.tan(deg2Rad(FOV / 2)));
        this.perspectiveCamera = new THREE.PerspectiveCamera(
            FOV,
            screenDimensions.width / screenDimensions.height,
            1,
            10000,
        );
        this.perspectiveCamera.up = new THREE.Vector3(0, 0, 1);
        this.perspectiveCamera.position.set(0, -50, perspectiveCameraZ);
        this.perspectiveCameraFirstSwitch = true;
    }


    getCamera() {
        return this.camera;
    }

    get2dCamera() {
        return this.orthographicCamera;
    }
    get3dCamera() {
        return this.perspectiveCamera;
    }

    usePerspectiveCamera() {
        this.perspectiveCameraFirstSwitch = false;
        this.camera = this.perspectiveCamera;
    }

    useOrthographicCamera() {
        this.orthographicCameraFirstSwitch = false;
        this.camera = this.orthographicCamera;
    }

    setCameraPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    makeCameraLookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }

    getCameraType() {
        if (this.camera.isPerspectiveCamera) return CAMERA_TYPE_3D;
        else if (this.camera.isOrthographicCamera) return CAMERA_TYPE_2D;

        console.error('ERROR: CameraManager encountered an unknown camera type');
        return null;
    }

    updateOrthographicCamera(screenDimensions, imageDimensions) {
        const orthographicCameraScaleFactor = imageDimensions.width /
            (screenDimensions.width > screenDimensions.height ?
                screenDimensions.width : screenDimensions.height);
        this.orthographicCamera.left = (screenDimensions.width / -2) *
            orthographicCameraScaleFactor;
        this.orthographicCamera.right = (screenDimensions.width / 2) *
            orthographicCameraScaleFactor;
        this.orthographicCamera.top = (screenDimensions.height / 2) * orthographicCameraScaleFactor;
        this.orthographicCamera.bottom = (screenDimensions.height / -2) *
            orthographicCameraScaleFactor;
        this.orthographicCamera.updateProjectionMatrix();
    }

    updatePerspectiveCamera(screenDimensions) {
        this.perspectiveCamera.aspect = screenDimensions.width / screenDimensions.height;
        this.perspectiveCamera.updateProjectionMatrix();
    }

    updatePerspectiveCameraImageDimensions(imageDimensions) {
        const perspectiveCameraZ = (imageDimensions.width < imageDimensions.height ?
            imageDimensions.width :
            imageDimensions.height) / (2 * Math.tan(deg2Rad(FOV / 2)));
        this.perspectiveCamera.position.set(0, -50, perspectiveCameraZ);
    }

    updateImageDimensions(screenDimensions, imageDimensions) {
        this.updateOrthographicCamera(screenDimensions, imageDimensions);
        this.updatePerspectiveCameraImageDimensions(imageDimensions);
    }

    updateCamera(screenDimensions, imageDimensions) {
        this.updateOrthographicCamera(screenDimensions, imageDimensions);
        this.updatePerspectiveCamera(screenDimensions);

        // update camera helper if enabled
        if (this.isCameraHelperEnabled) this.helper.update();
    }

    enableCameraHelper(sceneManager) {
        this.isCameraHelperEnabled = true;
        this.helper = new THREE.CameraHelper(this.camera);
        sceneManager.scene.add(this.helper);
    }
}

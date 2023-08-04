import * as THREE from 'three';
import Mousetrap from 'mousetrap';
import { CAMERA_UPDATED, ORTHO_CAMERA_Z } from '../coreConstants';
import OrbitControls from '../lib/OrbitControls';
import Table from '../objects/subArray/Table';
import * as controlsUtils from '../utils/controlsUtils';
import { getTopModelFromPoint } from '../utils/raycastingUtils';
import Ground from '../objects/ground/Ground';

const QUICK_LOOK_CONFIG = {
    ZOOM_BUFFER: {
        DEFAULT: {
            X: 1.1,
            Y: 1.1,
        },
        [Ground.getObjectType()]: {
            X: 1,
            Y: 1,
        },
    },
    // In meters
    ZOOM_LIMITS: {
        DEFAULT: {
            MAX_X: -1,
            MAX_Y: -1,
        },
        [Table.getObjectType()]: {
            MAX_X: 10,
            MAX_Y: -1,
        },
    },

    TOTAL_FRAMES: 15,

    MINIMUM_TIME_TO_HOLD_KEY: 250,
    KEY: 'q',
};

const VIEW_ANGLE = -45 * (Math.PI / 180);

export default class ControlsManger {
    constructor(_2dCamera, _3dCamera, canvas, eventBus, stage) {
        // this.controls = undefined;

        this._2dControls = new OrbitControls(_2dCamera, canvas, eventBus, stage);
        this._2dControls.screenSpacePanning = true;
        this._2dControls.enableRotate = false;
        this._2dControls.disable();
        this.is2dControlsEnabled = false;

        this._3dControls = new OrbitControls(_3dCamera, canvas, eventBus, stage);
        this._3dControls.screenSpacePanning = true;
        this._3dControls.maxDistance = 3000;
        this._3dControls.enableRotate = true;
        this._3dControls.disable();
        this.is3dControlsEnabled = false;
        this._3dControls.maxPolarAngle = (Math.PI / 2) * (75 / 90);

        this.stage = stage;
        this.eventBus = eventBus;

        Mousetrap.bind(
            QUICK_LOOK_CONFIG.KEY,
            this.handleQuickLookKeyDown.bind(this),
            'keydown',
        );
        this.quickLookParams = {
            moving: false,
            enabled: true,
        };
    }

    startMovingCamera(endPosition, endZoom, totalFrames, onCompleteCallback) {
        const currentPosition = this._2dControls.object.position;
        const currentPerpendicularLength = this._2dControls.object.position.z;

        const frustumWidth = this._2dControls.getCameraFrustumWidth();
        const fov = this._2dControls.getOrthographicFOV(frustumWidth);

        const endHorizontalLength = frustumWidth / endZoom;
        const endPerpendicularLength = (endHorizontalLength / 2) * Math.tan(fov / 2);

        const offsetPerpendicularLength =
            (currentPerpendicularLength - endPerpendicularLength) / totalFrames;
        const offsetPosition =
            (new THREE.Vector3()).copy(endPosition).sub(currentPosition).divideScalar(totalFrames);

        let frameCount = 0;

        let oldPerpendicularLength = currentPerpendicularLength;

        const move = () => {
            if (frameCount !== totalFrames - 1) {
                const newPerpendicularLength = oldPerpendicularLength - offsetPerpendicularLength;
                const newHorizontalWidth = 2 * (newPerpendicularLength / (Math.tan(fov / 2)));
                const newZoom = frustumWidth / newHorizontalWidth;
                oldPerpendicularLength = newPerpendicularLength;

                this._2dControls
                    .updateOrthographicCameraPosition(new THREE.Vector3().copy(offsetPosition));
                this._2dControls
                    .updateOrthographicTargetPosition(new THREE.Vector3().copy(offsetPosition));
                this._2dControls.setOrthographicCameraZoom(newZoom);

                window.requestAnimationFrame(move);
                frameCount += 1;
            } else {
                this._2dControls.setOrthographicCameraPosition(endPosition);
                this._2dControls.setOrthographicTarget(endPosition);
                this._2dControls.setOrthographicCameraZoom(endZoom);
                onCompleteCallback();
            }
            // TODO: Jugaad solution
            setTimeout(() => {
                this.eventBus.dispatchEvent({ type: CAMERA_UPDATED });
            }, 50);
        };

        window.requestAnimationFrame(move);
    }

    handleQuickLookKeyUp() {
        const endTime = (new Date()).getTime();
        if (endTime - this.quickLookParams.startTime >
            QUICK_LOOK_CONFIG.MINIMUM_TIME_TO_HOLD_KEY &&
            !this.quickLookParams.moving) {
            this.quickLookParams.moving = true;
            this._2dControls.disable();
            this.startMovingCamera(
                this.quickLookParams.currentPosition,
                this.quickLookParams.currentZoom,
                QUICK_LOOK_CONFIG.TOTAL_FRAMES,
                () => {
                    this.quickLookParams.moving = false;
                    this._2dControls.enable();
                },
            );
        }

        Mousetrap.unbind(QUICK_LOOK_CONFIG.KEY, 'keyup');
        Mousetrap.bind(
            QUICK_LOOK_CONFIG.KEY,
            this.handleQuickLookKeyDown.bind(this),
            'keydown',
        );
    }

    handleQuickLookKeyDown() {
        if (!this.is2dControlsEnabled || this.quickLookParams.moving || !this.quickLookParams.enabled) {
            return;
        }
        this.quickLookParams.moving = true;
        this._2dControls.disable();

        this.quickLookParams.startTime = (new Date()).getTime();
        this.quickLookParams.currentPosition = new THREE.Vector3().copy(this._2dControls.getCameraPosition());
        this.quickLookParams.currentZoom = this._2dControls.getCameraZoom();

        Mousetrap.unbind(QUICK_LOOK_CONFIG.KEY, 'keydown');
        Mousetrap.bind(
            QUICK_LOOK_CONFIG.KEY,
            this.handleQuickLookKeyUp.bind(this),
            'keyup',
        );

        const zoomInformation = controlsUtils.getZoomInformationForQuickLook(
            this.stage,
            QUICK_LOOK_CONFIG,
            this._2dControls,
        );

        if (zoomInformation === null) {
            this.quickLookParams.moving = false;
            this._2dControls.enable();
            return;
        }

        this.startMovingCamera(
            zoomInformation.centroid,
            zoomInformation.zoom,
            QUICK_LOOK_CONFIG.TOTAL_FRAMES,
            () => {
                this.quickLookParams.moving = false;
                this._2dControls.enable();
            },
        );
    }

    disableQuickLook() {
        this.quickLookParams.enabled = false;
    }

    enableQuickLook() {
        this.quickLookParams.enabled = true;
    }

    use2dControls() {
        if (this.is3dControlsEnabled) {
            this._3dControls.disable();
            this.is3dControlsEnabled = false;
        }
        if (!this.is2dControlsEnabled) {
            this._2dControls.enable();
            this.is2dControlsEnabled = true;
            const status = this.getOrthographicCameraStatus();
            this._2dControls.switchMode(
                status.position,
                status.target,
                status.zoom,
                this.stage.cameraManager.orthographicCameraFirstSwitch,
            );
            // this.controls = this._2dControls;
        }
    }

    getOrthographicCameraStatus() {
        const oldPos = this._3dControls.object.position.clone();
        // oldPos.applyAxisAngle(new THREE.Vector3(1, 0, 0), -VIEW_ANGLE);
        const groundPoint = this.getCameraProjectionOnGround(oldPos.clone());

        const newPos = new THREE.Vector3().set(
            groundPoint.x, groundPoint.y,
            ORTHO_CAMERA_Z,
        );
        const newTarget = newPos.clone().setZ(0);
        // To set zoom based on perspective camera position.
        // const zoom = 500 / (2 * oldPos.y);
        return { position: newPos, target: newTarget, zoom: this._2dControls.object.zoom };
    }

    getPerspectiveCameraStatus() {
        const oldPos = this._2dControls.object.position.clone();
        const oldZoom = this._2dControls.object.zoom;
        const screenHeight = this._2dControls.getCameraFrustumHeight() / oldZoom;

        const distance =
            ((screenHeight / 2) / Math.tan(this._3dControls.object.fov / 2)) *
            (this._3dControls.object.aspect);
        let targetHeight = 10;

        try {
            targetHeight = getTopModelFromPoint(oldPos, this.stage)[1];
        } catch (error) {
            console.error('not able to get top object', error);
        }
        const cameraY = distance < targetHeight ?
            targetHeight + Math.abs(distance - targetHeight) + 10 : distance;
        // const newPos = new THREE.Vector3().set(
        //     oldPos.x,
        //     cameraY, -oldPos.y,
        // );

        // const newTarget = new THREE.Vector3().set(
        //     oldPos.x,
        //     0, -oldPos.y,
        // );

        // const len = newPos.distanceTo(newTarget);
        // const { x } = newPos;
        // let y = newPos.y - (len * Math.cos(VIEW_ANGLE));
        // y = y < targetHeight ? targetHeight + Math.abs(y - targetHeight) : y;
        // const z = newPos.z + (len * Math.sin(VIEW_ANGLE));
        // const modifiedPos = new THREE.Vector3(x, z, -y);

        // Calculation of 3d camera postion from 2d camera.
        const newPosition = new THREE.Vector3(
            oldPos.x,
            oldPos.y - cameraY,
            cameraY
        )

        const target1 = new THREE.Vector3(
            oldPos.x,
            oldPos.y,
            0
        )

        return { position: newPosition, target: target1, zoom: 1 };
    }

    getCameraProjectionOnGround(start) {
        const target = this._3dControls.target.clone();
        const dir = new THREE.Vector3().subVectors(target, start);

        const groundNormalIn3D = new THREE.Vector3(0, 1, 0);
        const pointOnGround = new THREE.Vector3();
        const intersection = (groundNormalIn3D
                .dot(new THREE.Vector3().subVectors(pointOnGround, start))) /
            (groundNormalIn3D.dot(dir));

        return new THREE.Vector3().addVectors(start, dir.clone().multiplyScalar(intersection));
    }

    use3dControls() {
        if (this.is2dControlsEnabled) {
            this._2dControls.disable();
            this.is2dControlsEnabled = false;
        }
        if (!this.is3dControlsEnabled) {
            this._3dControls.enable();
            this.is3dControlsEnabled = true;
            const status = this.getPerspectiveCameraStatus();
            this._3dControls.switchMode(
                status.position,
                status.target,
                status.zoom,
                false,
            );
            // this.controls = this._3dControls;
        }
    }

    get2DControls() {
        return this._2dControls;
    }

    reset() {
        if (this.is2dControlsEnabled) {
            this._2dControls.reset();
        }
        if (this.is3dControlsEnabled) {
            this._3dControls.reset();
        }
    }
}
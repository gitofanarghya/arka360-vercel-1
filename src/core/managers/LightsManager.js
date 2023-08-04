import * as THREE from 'three';
import * as utils from '../utils/utils';
import axios from 'axios';
import { DateTime } from 'luxon';
import {
    SUN_REVOLUTION_RADIUS,
    SHADOW_VIEW_SUMMER_SOLSTICE,
    SHADOW_VIEW_WINTER_SOLSTICE,
    SHADOW_VIEW_MORNING_TIME,
    SHADOW_VIEW_EVENING_TIME,
    LOW_SHADOW_MAP_RESOLUTION,
} from '../coreConstants';
import { getZoomAndCentroidForAllObjects } from '../utils/controlsUtils';
import tzLookup from 'tz-lookup';

export default class LightsManager {
    constructor(stage) {
        this.stage = stage;
        this.shadowEnabled = false;

        // Ambient light.
        this.ambientLightDefaultIntensity = 1;
        this.ambientLightSunSimulationIntensity = 0.2;
        this.ambientLight = new THREE.AmbientLight(0xffffff);
        this.ambientLight.castShadow = false;
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;

        this.highResolutionShadows = !this.stage.getDesignSettings().shadows.high_resolution_shadows;
        this.updateShadowMapResolution();

        this.directionalLight.shadow.radius = 0.5;
        this.directionalLight.shadow.bias = -0.0002;

        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;

        this.diagonal =
            Math.sqrt((this.stage.imageDimensions.width ** 2) +
                (this.stage.imageDimensions.height ** 2));

        this.directionalLight.shadow.camera.right = this.diagonal / 2;
        this.directionalLight.shadow.camera.left = -this.diagonal / 2;
        this.directionalLight.shadow.camera.top = this.diagonal / 2;
        this.directionalLight.shadow.camera.bottom = -this.diagonal / 2;

        // by default directional light should be hidden, since its expensive.
        this.directionalLight.visible = false;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.add(this.directionalLight);

        this.objectsGroupWithoutShadows = new THREE.Group();
        this.objectsGroupWithoutShadows.add(this.ambientLight);

        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.stage.sceneManager.scene.add(this.objectsGroupWithoutShadows);

        this.helperEnabled = false;

        // Helper Lines Code
        if (this.helperEnabled) {
            // shadow camera helper
            this.cameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
            this.stage.sceneManager.scene.add(this.cameraHelper);

            // arrow helper
            this.dir = new THREE.Vector3();
            this.directionalLight.shadow.camera.getWorldDirection(this.dir);

            this.point1 = new THREE.Vector3(this.stage.imageDimensions.width / 2, 0, 0);
            this.point2 = new THREE.Vector3(0, -this.stage.imageDimensions.height / 2, 0);
            this.point3 = new THREE.Vector3(-this.stage.imageDimensions.width / 2, 0, 0);
            this.point4 = new THREE.Vector3(0, this.stage.imageDimensions.height / 2, 0);

            this.arrowHelper1 = new THREE.ArrowHelper(this.dir, this.point1, SUN_REVOLUTION_RADIUS);
            this.arrowHelper2 = new THREE.ArrowHelper(this.dir, this.point2, SUN_REVOLUTION_RADIUS);
            this.arrowHelper3 = new THREE.ArrowHelper(this.dir, this.point3, SUN_REVOLUTION_RADIUS);
            this.arrowHelper4 = new THREE.ArrowHelper(this.dir, this.point4, SUN_REVOLUTION_RADIUS);

            this.stage.sceneManager.scene.add(this.arrowHelper1);
            this.stage.sceneManager.scene.add(this.arrowHelper2);
            this.stage.sceneManager.scene.add(this.arrowHelper3);
            this.stage.sceneManager.scene.add(this.arrowHelper4);
        }
    }

    // This runs when sun simulation is switched on
    enableShadows() {
        this.ambientLight.intensity = this.ambientLightSunSimulationIntensity;

        // Enabling sun simulation directional light
        this.directionalLight.intensity = 1;
        this.directionalLight.visible = true;

        this.shadowEnabled = true;

        this.setShadowMapParameters();

        this.stage.heatMap.hide();
        this.stage.hideSolarAccess();
        this.stage.eventManager.sunSimulationOn();
        this.setLightIntensity(this.objectsGroup.position);
        this.stage.visualManager.updateVisualsForSunSimulation(true);

    }

    enableShadowsForLidar() {
        this.ambientLight.intensity = this.ambientLightSunSimulationIntensity;

        // Enabling sun simulation directional light
        this.directionalLight.intensity = 1;
        this.directionalLight.visible = true;

        this.shadowEnabled = true;

        this.setShadowMapParameters();

        this.stage.heatMap.hide();
        this.stage.hideSolarAccess();
        this.stage.eventManager.lidarSimulationOn();
        this.setLightIntensity(this.objectsGroup.position);
        this.stage.visualManager.updateVisualsForSunSimulation(true);

    }

    updateShadowMapResolution() {
        if (this.stage.getDesignSettings().shadows.high_resolution_shadows !==
            this.highResolutionShadows) {
            this.highResolutionShadows =
                this.stage.getDesignSettings().shadows.high_resolution_shadows;
            const textureSize = this.highResolutionShadows ?
                this.stage.rendererManager.getMaxTextureSizeForThisMachine() / 2 :
                LOW_SHADOW_MAP_RESOLUTION;
            this.directionalLight.shadow.mapSize.width = textureSize;
            this.directionalLight.shadow.mapSize.height = textureSize;
            if (this.directionalLight.shadow.map !== null) {
                this.directionalLight.shadow.map.dispose();
                this.directionalLight.shadow.map = null;
            }
        }
    }

    setHighResolutionShadows() {
        const textureSize = this.stage.rendererManager.getMaxTextureSizeForThisMachine() / 2;
        this.directionalLight.shadow.mapSize.width = textureSize;
        this.directionalLight.shadow.mapSize.height = textureSize;
        if (this.directionalLight.shadow.map !== null) {
            this.directionalLight.shadow.map.dispose();
            this.directionalLight.shadow.map = null;
        }
    }

    // This runs when sun simulation is switched off
    disableShadows() {
        // Disable sun simulation directional light
        this.directionalLight.intensity = 0;
        this.directionalLight.visible = false;

        // Enable ambient light
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        this.shadowEnabled = false;
        this.stage.eventManager.sunSimulationOff();

        this.stage.visualManager.updateVisualsForSunSimulation(false);
    }

    disableShadowsForLidar() {
        // Disable sun simulation directional light
        this.directionalLight.intensity = 0;
        this.directionalLight.visible = false;

        // Enable ambient light
        this.ambientLight.intensity = this.ambientLightDefaultIntensity;

        this.shadowEnabled = false;
        this.stage.eventManager.lidarSimulationOff();

        this.stage.visualManager.updateVisualsForSunSimulation(false);
    }

    toggleShadows() {
        if(this.stage.lidar.lidarModeEnabled){
            this.stage.lidar.hideObject();
            this.stage.lidar.lidarModeEnabled = false;
        }
        if (!this.shadowEnabled) {
            this.enableShadows();
        } else {
            this.disableShadows();
        }
        // this.stage.selectionControls.setSelectedObject(this.stage.ground);
    }

    setLightIntensity(position) {
        if (this.stage.visualManager.getIn3D() && this.shadowEnabled) {
            if (position.z > 0 && position.z < 30) {
                this.directionalLight.intensity = Math.abs(position.z) / 30;
            } else if (position.z < 0) {
                this.directionalLight.intensity = 0;
            } else {
                this.directionalLight.intensity = 1;
            }
        }
    }

    setLightPosition(position) {
        //start setting the sun when it comesclose to horizon : y in 3d is height of sun
        this.setLightIntensity(position);
        this.objectsGroup.position.x = position.x;
        this.objectsGroup.position.y = position.y;
        this.objectsGroup.position.z = position.z;
        this.setShadowMapParameters();
        this.stage.rendererManager.updateShadows();
    }

    setLightTarget() {
        this.directionalLight.target = this.stage.ground.plane.clone();
    }

    sunPosResetFor2D() {
        // const oldZ = this.objectsGroup.position.z;
        // this.objectsGroup.position.z = this.objectsGroup.position.y;
        // this.objectsGroup.position.y = -oldZ;
        this.setShadowMapParameters();
        this.stage.rendererManager.updateShadows();
    }

    sunPosResetFor3D() {
        // const oldY = this.objectsGroup.position.y;
        // this.objectsGroup.position.y = this.objectsGroup.position.z;
        // this.objectsGroup.position.z = -oldY;
        this.setShadowMapParameters();
        this.stage.rendererManager.updateShadows();
    }

    setShadowMapParameters() {
        if (this.shadowEnabled) {
            if (this.stage.controlsManager.is2dControlsEnabled) {
                const camera2D = this.stage.cameraManager.get2dCamera();

                const cp1 = camera2D.right / camera2D.zoom;
                const cp2 = camera2D.bottom / camera2D.zoom;
                const cp3 = camera2D.left / camera2D.zoom;
                const cp4 = camera2D.top / camera2D.zoom;

                this.point1 = new THREE.Vector3(
                    camera2D.position.x + cp1 < this.stage.imageDimensions.width / 2 ?
                    camera2D.position.x + cp1 :
                    this.stage.imageDimensions.width / 2,
                    camera2D.position.y,
                    0,
                );
                this.point3 = new THREE.Vector3(
                    camera2D.position.x + cp3 > -this.stage.imageDimensions.width / 2 ?
                    camera2D.position.x + cp3 :
                    -this.stage.imageDimensions.width / 2,
                    camera2D.position.y,
                    0,
                );

                this.point2 = new THREE.Vector3(
                    camera2D.position.x,
                    camera2D.position.y + cp2 > -this.stage.imageDimensions.height / 2 ?
                    camera2D.position.y + cp2 :
                    -this.stage.imageDimensions.height / 2,
                    0,
                );
                this.point4 = new THREE.Vector3(
                    camera2D.position.x,
                    camera2D.position.y + cp4 < this.stage.imageDimensions.height / 2 ?
                    camera2D.position.y + cp4 :
                    this.stage.imageDimensions.height / 2,
                    0,
                );

                const dir = new THREE.Vector3();
                const pos = new THREE.Vector3();

                this.directionalLight.shadow.camera.getWorldDirection(dir);
                this.directionalLight.shadow.camera.getWorldPosition(pos);

                const ver = new THREE.Vector3(pos.x, pos.y, pos.z);
                ver.normalize();

                if (this.helperEnabled) {
                    this.arrowHelper1.position.copy(this.point1);
                    this.arrowHelper2.position.copy(this.point2);
                    this.arrowHelper3.position.copy(this.point3);
                    this.arrowHelper4.position.copy(this.point4);

                    this.arrowHelper1.setDirection(ver);
                    this.arrowHelper2.setDirection(ver);
                    this.arrowHelper3.setDirection(ver);
                    this.arrowHelper4.setDirection(ver);
                }

                const plane = new THREE.Plane(dir, SUN_REVOLUTION_RADIUS);

                // right
                let dis = plane.distanceToPoint(this.point1);
                const vertex1 = new THREE.Vector3();
                vertex1.copy(ver);
                vertex1.multiplyScalar(dis);
                const p1 = new THREE.Vector3();
                p1.addVectors(this.point1, vertex1);

                // bottom
                dis = plane.distanceToPoint(this.point2);
                const vertex2 = new THREE.Vector3();
                vertex2.copy(ver);
                vertex2.multiplyScalar(dis);
                const p2 = new THREE.Vector3();
                p2.addVectors(this.point2, vertex2);

                // left
                dis = plane.distanceToPoint(this.point3);
                const vertex3 = new THREE.Vector3();
                vertex3.copy(ver);
                vertex3.multiplyScalar(dis);
                const p3 = new THREE.Vector3();
                p3.addVectors(this.point3, vertex3);

                // top
                dis = plane.distanceToPoint(this.point4);
                const vertex4 = new THREE.Vector3();
                vertex4.copy(ver);
                vertex4.multiplyScalar(dis);
                const p4 = new THREE.Vector3();
                p4.addVectors(this.point4, vertex4);

                const highestZ = utils.getHighestZ(this.stage.ground);

                this.point1.setZ(highestZ);
                this.point2.setZ(highestZ);
                this.point3.setZ(highestZ);
                this.point4.setZ(highestZ);

                // right
                dis = plane.distanceToPoint(this.point1);
                const vertex11 = new THREE.Vector3();
                vertex11.copy(ver);
                vertex11.multiplyScalar(dis);
                const p11 = new THREE.Vector3();
                p11.addVectors(this.point1, vertex11);

                // bottom
                dis = plane.distanceToPoint(this.point2);
                const vertex22 = new THREE.Vector3();
                vertex22.copy(ver);
                vertex22.multiplyScalar(dis);
                const p22 = new THREE.Vector3();
                p22.addVectors(this.point2, vertex22);

                // left
                dis = plane.distanceToPoint(this.point3);
                const vertex33 = new THREE.Vector3();
                vertex33.copy(ver);
                vertex33.multiplyScalar(dis);
                const p33 = new THREE.Vector3();
                p33.addVectors(this.point3, vertex33);

                // top
                dis = plane.distanceToPoint(this.point4);
                const vertex44 = new THREE.Vector3();
                vertex44.copy(ver);
                vertex44.multiplyScalar(dis);
                const p44 = new THREE.Vector3();
                p44.addVectors(this.point4, vertex44);

                const p1d = p1.distanceTo(pos);
                const p11d = p11.distanceTo(pos);
                const p2d = p2.distanceTo(pos);
                const p22d = p22.distanceTo(pos);
                const p3d = p3.distanceTo(pos);
                const p33d = p33.distanceTo(pos);
                const p4d = p4.distanceTo(pos);
                const p44d = p44.distanceTo(pos);

                this.directionalLight.shadow.camera.right =
                    ((p1d > p11d ? p1d : p11d) / this.stage.imageDimensions.width) * this.diagonal;
                this.directionalLight.shadow.camera.bottom =
                    (-(p2d > p22d ? p2d : p22d) / this.stage.imageDimensions.height) * this.diagonal;
                this.directionalLight.shadow.camera.left =
                    (-(p3d > p33d ? p33d : p33d) / this.stage.imageDimensions.width) * this.diagonal;
                this.directionalLight.shadow.camera.top =
                    ((p4d > p44d ? p4d : p44d) / this.stage.imageDimensions.height) * this.diagonal;

                this.directionalLight.shadow.camera.updateProjectionMatrix();

                if (this.helperEnabled) {
                    this.cameraHelper.update();
                }
            } else {
                const highestZ = utils.getHighestZ(this.stage.ground)
                this.directionalLight.target.position.z = highestZ / 2;
                this.directionalLight.target.visible = false;

                let largeDiagonal = Math.sqrt((this.stage.imageDimensions.width ** 2) +
                    (this.stage.imageDimensions.height ** 2) + (highestZ ** 2));

                if (this.diagonal < largeDiagonal) {
                    this.diagonal = largeDiagonal
                }

                this.directionalLight.shadow.camera.right = this.diagonal / 2;
                this.directionalLight.shadow.camera.left = -this.diagonal / 2;
                this.directionalLight.shadow.camera.top = this.diagonal / 2;
                this.directionalLight.shadow.camera.bottom = -this.diagonal / 2;

                this.directionalLight.shadow.camera.updateProjectionMatrix();

                if (this.helperEnabled) {
                    this.cameraHelper.update();
                }
                // TODO : optimize shadow parameters for 3d

                // this.point1 = new THREE.Vector3(
                //     cp1 < this.stage.imageDimensions.width / 2
                //         ? cp1
                //         : this.stage.imageDimensions.width / 2,
                //     0,
                //     0,
                // );
                // this.point3 = new THREE.Vector3(
                //     cp3 > -this.stage.imageDimensions.width / 2
                //         ? cp3
                //         : -this.stage.imageDimensions.width / 2,
                //     0,
                //     0,
                // );

                // this.point2 = new THREE.Vector3(
                //     0,
                //     0,
                //     -cp2 < this.stage.imageDimensions.height / 2
                //         ? -cp2
                //         : this.stage.imageDimensions.height / 2,
                // );
                // this.point4 = new THREE.Vector3(
                //     0,
                //     0,
                //     -(cp4 < this.stage.imageDimensions.height / 2
                //         ? cp4
                //         : this.stage.imageDimensions.height / 2),
                // );

                // this.point1.setY(maxheight);
                // this.point2.setY(maxheight);
                // this.point3.setY(maxheight);
                // this.point4.setY(maxheight);
            }
        }
    }

    async switchToNormalView() {
        this.stage.hideStructure();
        this.stage.rotateSceneBack();
        this.stage.cameraManager.useOrthographicCamera();
        this.stage.controlsManager.use2dControls();

        const [zoom, centroid] = getZoomAndCentroidForAllObjects(this.stage);
        this.stage.controlsManager.get2DControls().setOrthographicCameraZoom(zoom);
        this.stage.controlsManager.get2DControls().setOrthographicCameraPosition(centroid);

        this.stage.rendererManager.renderer.shadowMap.autoUpdate = false;
        this.setHighResolutionShadows();
        this.disableShadows();
    }
    getLocalIana() {
        const zoneIANA = tzLookup(this.stage.latitude, this.stage.longitude);
        return zoneIANA;
    }

    async switchToShadowView(solstice, timeOfDay) {
        this.stage.hideStructure();
        this.stage.rotateSceneBack();
        this.stage.cameraManager.useOrthographicCamera();
        this.stage.controlsManager.use2dControls();

        const [zoom, centroid] = getZoomAndCentroidForAllObjects(this.stage);
        this.stage.controlsManager.get2DControls().setOrthographicCameraZoom(zoom);
        this.stage.controlsManager.get2DControls().setOrthographicCameraPosition(centroid);

        this.stage.rendererManager.renderer.shadowMap.autoUpdate = false;
        this.setHighResolutionShadows();
        this.enableShadows();

        let date = DateTime.local().setZone(this.getLocalIana());

        if (solstice === SHADOW_VIEW_WINTER_SOLSTICE) {
            date = date.set({ day: 21, month: 12 });
        } else if (solstice === SHADOW_VIEW_SUMMER_SOLSTICE) {
            date = date.set({ day: 21, month: 5 });
        } else {
            console.error('ERROR: LightsManager: Incorrect solstice parameter passed in switchToShadowView');
        }

        let timeString;

        if (timeOfDay === SHADOW_VIEW_MORNING_TIME) {
            timeString =
                this.stage.designSettings.report_defaults.shadowAnalysis.start_time_shadow_analysis;
        } else if (timeOfDay === SHADOW_VIEW_EVENING_TIME) {
            timeString =
                this.stage.designSettings.report_defaults.shadowAnalysis.end_time_shadow_analysis;
        } else {
            console.error('ERROR: LightsManager: Incorrect timeOfDay parameter passed in switchToShadowView');
        }

        const [hours, minutes, seconds] = timeString.split(':');
        date = date.set({ hours: hours, minutes: minutes, seconds: seconds });

        this.stage.tweenControls.TweenActions.time = date.ts;
        this.stage.tweenControls.setSunPosition();

        this.stage.rendererManager.renderer.shadowMap.needsUpdate = true;
        await new Promise((resolve) => {
            const intervalId = setInterval(
                () => {
                    if (!this.stage.rendererManager.renderer.shadowMap.needsUpdate) {
                        resolve(true);
                        clearInterval(intervalId);
                    }
                }, 50,
            );
        });
    }

    isShadowEnabled() {
        return this.shadowEnabled;
    }
}

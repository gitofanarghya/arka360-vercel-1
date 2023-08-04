/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import API from '@/services/api/';
import * as THREE from 'three';
import Delaunator from 'delaunator';
import parseGeoraster from 'georaster';
import { fitToLidar, lerp, normalize, toFixedNoRounding, getGroundHieght, groupByKey } from './lidarUtils';
import { SmartroofModel } from '../model/smartroof/SmartroofModel';
import { store } from '../../../store';

export default class Lidar {
    constructor(stage) {
        this.stage = stage;

        this.URL = undefined;
        this.mapRadius = undefined;

        this.lidarModeEnabled = false;
        this.lidarDataFetched = false;
        this.lidarMeshCreated = false;
        this.lidarMeshVisible = false;

        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.objectsGroup.type = 'lidar';
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.clippingPlane = new THREE.Plane().setFromCoplanarPoints(
            new THREE.Vector3(1, 1, 0),
            new THREE.Vector3(2, 1, 0),
            new THREE.Vector3(1, 2, 0),
        );
        // this.clippingPlane.negate();

        this.lidarGeometry = new THREE.BufferGeometry();
        this.lidarMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            flatShading: false,
            vertexColors: true,
            shininess: 1,
            side: THREE.DoubleSide,
            opacity: 0.6,
            transparent: true,
        });
        this.lidarMesh = new THREE.Mesh(this.lidarGeometry, this.lidarMaterial);
        this.lidarMesh.receiveShadow = true;
        this.lidarMesh.castShadow = true;

        this.objectsGroup.add(this.lidarMesh);

        this.lidarData = [];
        this.lidarZMin = 0;

        this.lidarSimulationTime = 1659126960000;

        this.typedArrays = [];
        const n = 1024 * 1024 * 3;
        this.array = new Float32Array(n);
        this.lidarMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n), 3));
    }

    async fetchData() {
        // fetch tif from backend
        const latitude = this.stage.getLatitude();
        const longitude = this.stage.getLongitude();
        this.mapRadius = Math.ceil(this.stage.imageDimensions.width / 2);
        const position = `${String(toFixedNoRounding(longitude, 16))},${String(toFixedNoRounding(latitude, 16))}`;
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();

        if (dd < 10) dd = `0${dd}`;
        if (mm < 10) mm = `0${mm}`;

        const formattedToday = `${yyyy}-${mm}-${dd}`;
        const postData = {
            point: position,
            radius: this.mapRadius <= 30 ? this.mapRadius : 30,
            overlap: 'all',
            since: '2015-01-31',
            until: formattedToday,
            limit: 100,
            resources: 'DetailDsm,TrueOrtho,Vert',
            fields: 'id,captureDate,firstPhotoTime,lastPhotoTime,pixelSizes',
            format: 'tif',
            size: '1024x1024',
            type: 'DetailDsm',
        };
        try {
            const response = await API.LIDAR_INFO.GET_LIDAR_DATA(this.getProjectId(), postData);
            this.URL = response.data.nearmap_file_url;
            this.lidarDataFetched = true;
            return Promise.resolve(response.data.nearmap_image_url);
        }
        catch (e) {
            console.log('LIDAR_INFO: Error in fetching lidar data', e);
            return Promise.reject();
        }
    }

    async initialize() {
        const notificationObject = this.stage.eventManager.setLidarLoading();
        if (!this.lidarDataFetched) {
            await this.fetchData();
        }
        if (this.URL) {
            const ratio = 1024 / (this.stage.imageDimensions.width / 2);
            const offSet = Math.round(((this.mapRadius - (this.stage.imageDimensions.width / 2)) * ratio) / 2);
            const options = {
                left: offSet,
                top: offSet,
                right: 1024 - offSet,
                bottom: 1024 - offSet,
                width: 1024,
                height: 1024,
            };
            await parseGeoraster(this.URL).then((georaster) => {
                georaster.getValues(options).then((values) => {
                    [this.lidarData] = values;
                    this.updateGeometry();
                    this.lidarMeshCreated = true;
                    this.stage.eventManager.completeLidarLoading(notificationObject);
                });
            });
            return Promise.resolve(true);
        }
        this.stage.eventManager.errorLidarLoading(notificationObject);
        console.error('Error in fetching lidar data');
        return Promise.reject();
    }

    updateGeometry() {
        const trianglePoints = [];
        const allHeightLevels = [];
        let max = 0;
        let min = this.lidarData[0][0];
        for (let i = 0, len1 = this.lidarData.length; i < len1; i++) {
            const innerArray = this.lidarData[i];
            for (let j = 0, len2 = innerArray.length; j < len2; j++) {
                const l = ((1024 * i) + j) * 3;
                this.array.set([i], l);
                this.array.set([j], l + 1);
                this.array.set([innerArray[j]], l + 2);
                trianglePoints.push([i, j]);
                allHeightLevels.push(innerArray[j]);

                if (innerArray[j] > max) {
                    max = innerArray[j];
                }

                if (innerArray[j] < min) {
                    min = innerArray[j];
                }
            }
        }

        // ground plane detection

        const Hres = 33;
        const Wres = 33;

        const groundArray = [];

        // create low resolution point array
        for (let i = 0; i < Wres; i++) {
            for (let j = 0; j < Hres; j++) {
                const Wround = Math.round((i / Wres) * 1024);
                const Hround = Math.round((j / Wres) * 1024);
                const height = this.lidarData[Wround][Hround];
                groundArray.push({ x: Wround, y: Hround, z: height });
            }
        }

        const result = groupByKey(groundArray, 'z', 3);
        this.lidarZMin = getGroundHieght(result, 1.2);

        const indexD = Delaunator.from(trianglePoints);
        // this.lidarZMin = min + 1; // 1 is added for a minor offset, FIND PROPER WAY!
        // this.lidarZMin = mode(allHeightLevels);
        this.lidarMesh.geometry.setAttribute('position', new THREE.BufferAttribute(this.array, 3));
        this.lidarMesh.geometry.setIndex([]);
        this.lidarMesh.geometry.index.array = indexD._triangles;
        this.lidarMesh.geometry.index.count = indexD._triangles.length;
        this.lidarMesh.geometry.index.needsUpdate = true;
        this.lidarMesh.geometry.computeVertexNormals();
        this.lidarMesh.geometry.translate(-512, -512, -(this.lidarZMin));

        const scale = (1 / 1024) * this.stage.imageDimensions.width;
        this.lidarMesh.scale.set(scale, scale, 1);
        this.lidarMesh.rotateZ(-Math.PI / 2);

        const { position } = this.lidarMesh.geometry.attributes;

        const colors = this.lidarMesh.geometry.attributes.color;
        const gradient = [
            {
                bp: 0, r: 0, g: 0, b: 1,
            },
            {
                bp: 1 / 3, r: 0, g: 1, b: 0,
            },
            {
                bp: 2 / 3, r: 1, g: 1, b: 0,
            },
            {
                bp: 1, r: 1, g: 0, b: 0,
            },
        ];
        let red;
        let green;
        let blue;
        for (let i = 0, len = position.count; i < len; i++) {
            const z = position.getZ(i) + this.lidarZMin;
            const norm = ((z - min) / (max - min));

            if (norm < 1 / 3) {
                red = lerp(
                    gradient[0].r, gradient[1].r,
                    normalize(norm, gradient[0].bp, gradient[1].bp),
                );
                green = lerp(
                    gradient[0].g, gradient[1].g,
                    normalize(norm, gradient[0].bp, gradient[1].bp),
                );
                blue = lerp(
                    gradient[0].b, gradient[1].b,
                    normalize(norm, gradient[0].bp, gradient[1].bp),
                );
            }
            else if (norm < 2 / 3) {
                red = lerp(
                    gradient[1].r, gradient[2].r,
                    normalize(norm, gradient[1].bp, gradient[2].bp),
                );
                green = lerp(
                    gradient[1].g, gradient[2].g,
                    normalize(norm, gradient[1].bp, gradient[2].bp),
                );
                blue = lerp(
                    gradient[1].b, gradient[2].b,
                    normalize(norm, gradient[1].bp, gradient[2].bp),
                );
            }
            else if (norm < 1) {
                red = lerp(
                    gradient[2].r, gradient[3].r,
                    normalize(norm, gradient[2].bp, gradient[3].bp),
                );
                green = lerp(
                    gradient[2].g, gradient[3].g,
                    normalize(norm, gradient[2].bp, gradient[3].bp),
                );
                blue = lerp(
                    gradient[2].b, gradient[3].b,
                    normalize(norm, gradient[2].bp, gradient[3].bp),
                );
            }
            colors.setXYZ(i, red, green, blue);
        }
        colors.needsUpdate = true;
    }

    toggleLidarMode() {
        if (!this.lidarMeshCreated) {
            // fetch lidar data, via API
            // store data on projectLevel
            this.initialize().then(
                () => {
                    this.lidarDataFetched = true;
                    this.lidarMeshCreated = true;
                    this.stage.selectionControls.setSelectedObject(this.stage.ground);
                },
                () => {
                    this.lidarDataFetched = false;
                    this.lidarMeshCreated = false;
                    this.stage.selectionControls.setSelectedObject(this.stage.ground);
                },
            );
        }
        if (this.lidarModeEnabled) {
            // disable lidar mode
            // disable lidar buttons everywhere in studio
            this.hideObject();
            this.lidarModeEnabled = false;
        }
        else {
            // enable lidar mode
            // enable lidar buttons everywhere in studio
            this.showObject();
            this.lidarModeEnabled = true;
        }
    }

    /**
     * If the lidar data is fetched, then fit the model to the lidar data. If the model is moved, then
     * get the face tilt using the lidar data.
     * @param model - This is the model object that is being moved.
     */
    async onClickFitToLidar(model) {
        // const notificationObject = this.stage.eventManager.setLidarLoading();
        if (this.lidarMeshCreated) {
            fitToLidar(model);
        }
        // const modelCoords = model.getFaceLatLongs();
        // const postData = { tif_file_url: this.URL, input_vertices: modelCoords };
        // if (model.isMoved) {
        //     try {
        //         await API.LIDAR_INFO.GET_FACE_TILT_USING_CONTOUR(this.getDesignId(), postData).then((response) => {
        //             this.stage.eventManager.completeLidarLoading(notificationObject);
        //             model.isMoved = false;
        //             console.log(response);
        //         });
        //     }
        //     catch (e) {
        //         this.stage.eventManager.errorLidarLoading(notificationObject);
        //         model.isMoved = false;
        //         console.log('LIDAR_FACE_INFO: Error in fetching face tilt using lidar data', e);
        //     }
        // }
        // else {
        //     this.stage.eventManager.completeLidarLoading(notificationObject);
        // }
        this.stage.eventManager.completeLidarAutoFitLoading();
    }

    // eslint-disable-next-line consistent-return
    autoFitAllModels() {
        const groundChildren = this.stage.ground.getChildren();
        this.stage.stateManager.startContainer();
        try {
            if (!this.lidarMeshCreated) {
                return new Error('lidar data not fetched');
            }
            const allSmartroofs = [];
            for (let i = 0, len = groundChildren.length; i < len; i++) {
                const child = groundChildren[i];
                if (child instanceof SmartroofModel) {
                    allSmartroofs.push(child);
                }
            }
            for (let i = 0, len = allSmartroofs.length; i < len; i++) {
                const smartRoofModel = allSmartroofs[i];
                smartRoofModel.getChildren().forEach((c) => {
                    c.updateLidarConvexHull();
                });
            }
            for (let i = 0, len = allSmartroofs.length; i < len; i++) {
                const smartRoofModel = allSmartroofs[i];
                smartRoofModel.fitToLidar();
            }
            for (let i = 0, len = allSmartroofs.length; i < len; i++) {
                const smartRoofModel = allSmartroofs[i];
                smartRoofModel.getChildren().forEach((c) => {
                    c.updateLidarConvexHull();
                });
            }
        }
        catch (e) {
            console.log('e: ', e);
            this.stage.eventManager.errorLidarAutoFitLoading();
            this.stage.stateManager.stopContainer();
        }
        finally {
            this.stage.eventManager.completeLidarAutoFitLoading();
            this.stage.stateManager.stopContainer();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    getProjectId() {
        return store.state.design.project.id;
    }

    getDesignId() {
        return this.stage.getDesignId();
    }

    hideObject() {
        this.objectsGroup.visible = false;
        this.lidarMeshVisible = false;
        this.stage.lightsManager.disableShadowsForLidar();
        this.stage.tweenControls.setSunPosition();
    }

    showObject() {
        this.objectsGroup.visible = true;
        this.lidarMeshVisible = true;
        this.stage.lightsManager.enableShadowsForLidar();
        this.stage.tweenControls.setSunPositionForLidar(this.lidarSimulationTime);
    }

    switchTo2D() {
        this.lidarMaterial.clippingPlanes = [];
        this.lidarMaterial.opacity = 0.6;
    }

    switchTo3D() {
        this.lidarMaterial.clippingPlanes = [this.clippingPlane];
        this.lidarMaterial.opacity = 1;
    }
}

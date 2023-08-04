import * as THREE from 'three';
import { BufferAttribute, Object3D } from 'three';
import * as exporters from '../../utils/exporters';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { MATERIAL_STATES, COLOR_MAPPINGS, VISUAL_STATES, TRANSLUCENT_OPACITY_FOR_MODELS, LINE_WIDTH } from '../visualConstants';
import * as visualUtils from '../../utils/visualUtils';
import {
    ACDB,
    AC_CABLE,
    CONDUIT,
    CROWN,
    CROWN_EDGE,
    CYLINDER,
    DCDB,
    DC_CABLE,
    DOUBLE_CABLE_TRAY,
    DOUBLE_CONDUIT,
    DOUBLE_SEPARATE_CABLE_TRAY,
    DOUBLE_SEPARATE_CONDUIT,
    EDGE_CENTRE_POINT,
    HANDRAIL,
    PROPERTY,
    INVERTER,
    PILLAR,
    POLYGON,
    SAFETY_LINE,
    SINGLE_CABLE_TRAY,
    SMARTROOF_FACES,
    SUBARRAYS,
    TREE,
    TRUNK,
    TRUNK_EDGE,
    PARAPET,
    SMARTROOF,
    TEXT_BOX,
    DORMER
} from '../../objectConstants';
import { createMesh } from '../../utils/meshUtils';

export default class MergedMesh {
    constructor(stage) {
        this.stage = stage;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        this.visualState = null;
        this.materialState = null;

        this.mergedObjects = exporters.getAllModelType();
        this.mergedObjects.edgeCentrePoints = [];
        this.mergedObjectsGeometry = exporters.getAllModelType();
        this.mergedObjectsGeometry.edgeCentrePoints = [];
        this.mergedObjectsGeometry.crown = [];
        this.mergedObjectsGeometry.crownEdge = [];
        this.mergedObjectsGeometry.trunk = [];
        this.mergedObjectsGeometry.trunkEdge = [];
        this.mergedObjectsGeometry.pillar = [];
        this.mergedObjectsGeometry.parapet = [];
        this.mergedMesh = exporters.getAllModelType();
        this.mergedMesh.edgeCentrePoints = [];
        this.mergedMesh.crown = [];
        this.mergedMesh.trunk = [];
        this.mergedMesh.pillar = [];
        this.mergedMesh.parapet = [];
        this.mergedLineMesh = exporters.getAllModelType();
        this.mergedLineMesh.edgeCentrePoints = [];
        this.mergedLineMesh.crownEdge = [];
        this.mergedLineMesh.trunkEdge = [];
        this.mergedLineMesh.pillar = [];
        this.mergedLineMesh.parapet = [];
        this.meshesInScene = [];
        this.pillarMaterial2D = null;
        this.pillarMaterial3D = null;
        this.pillarEdgeMaterial = null;
        this.translucenthMaterial2DParapet = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: TRANSLUCENT_OPACITY_FOR_MODELS,
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.parapetSolidMeshMaterial = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.SOLID][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .PARAPET_COLOR,
        });
        this.translucentParapetEdgeMaterial2D = new THREE.LineBasicMaterial({
            linewidth: LINE_WIDTH,
            color: COLOR_MAPPINGS
                .POLYGON[MATERIAL_STATES.TRANSLUCENT][VISUAL_STATES.DEFAULT_STATES.DEFAULT]
                .EDGE_COLOR,
        });
        this.inverterColors = [];
    }

    addObjectsToMerge(objects) {
        this.collectObjectGeometryAndMeshes(objects);
        this.createMergedMesh();
    }

    collectObjectGeometryAndMeshes(objects) {
        this.mergedObjectsGeometry.edgeCentrePoints = [];
        this.mergedObjects.edgeCentrePoints = [];
        this.mergedObjectsGeometry.crown = [];
        this.mergedObjectsGeometry.crownEdge = [];
        this.mergedObjectsGeometry.trunk = [];
        this.mergedObjectsGeometry.trunkEdge = [];
        this.mergedObjectsGeometry.pillar = [];
        this.mergedObjectsGeometry.parapet = [];
        this.meshesInScene = [];

        Object.keys(objects).forEach(object => {

            if (object === SMARTROOF_FACES) {
                return;
            }

            if (object === SUBARRAYS || object === HANDRAIL || object === AC_CABLE || object === DC_CABLE || object === SAFETY_LINE ||
                object === CONDUIT || object === DOUBLE_CONDUIT || object === DOUBLE_SEPARATE_CONDUIT || object === SINGLE_CABLE_TRAY ||
                object === DOUBLE_CABLE_TRAY || object === DOUBLE_SEPARATE_CABLE_TRAY || object === ACDB || object === DCDB || object === SMARTROOF || object === DORMER || object === PROPERTY || object === 'combinerBox') {
                for (let i = 0, l = objects[object].length; i < l; i += 1) {
                    this.meshesInScene.push(objects[object][i].mesh);
                }
                return;
            }
            if (object === TEXT_BOX) {
                for (let i = 0, l = objects[object].length; i < l; i += 1) {
                    this.meshesInScene.push(objects[object][i].textBoxMesh);
                    this.meshesInScene.push(objects[object][i].textMesh);
                }
                return;
            }

            this.mergedObjects[object] = [];
            this.mergedObjectsGeometry[object] = [];
            for (let i = 0, l = objects[object].length; i < l; i += 1) {
                if (object === TREE) {
                    if (objects[object][i].crownMesh.geometry !== undefined) {
                        let bufferGeometry = objects[object][i].crownMesh.geometry.clone();
                        this.mergedObjectsGeometry.crown.push(bufferGeometry);
                        bufferGeometry = objects[object][i].trunkMesh.geometry.clone();
                        this.mergedObjectsGeometry.trunk.push(bufferGeometry);
                        this.mergedObjectsGeometry.crownEdge.push(objects[object][i].crownEdgeGeometry);
                        this.mergedObjectsGeometry.trunkEdge.push(objects[object][i].trunkEdgeGeometry);
                        this.mergedObjects[object].push(objects[object][i]);
                        this.meshesInScene.push(objects[object][i].crownMesh);
                        this.meshesInScene.push(objects[object][i].trunkMesh);
                        objects[object][i].hideObject();
                    }
                }
                // todo: Can directly get buffergeometry and merge it in future, currently it becomes undefined in start.
                else if (object === INVERTER) {
                    if (objects[object][i].mesh.geometry !== undefined) {
                        if (this.pillarMaterial2D === null) {
                            this.pillarMaterial2D = objects[object][0].pillarMaterial2D;
                            this.pillarMaterial3D = objects[object][0].pillarMaterial3D;
                            this.pillarEdgeMaterial = objects[object][0].edgeMaterial;
                        }
                        this.mergedObjects[object].push(objects[object][i]);
                        const threejsColor = objects[object][i].meshMaterial2D.color;
                        let defaultColorRGB = {
                            _rgb: [
                                parseInt(threejsColor.r * 255),
                                parseInt(threejsColor.g * 255),
                                parseInt(threejsColor.b * 255),
                                1,
                            ]
                        };
                        let bufferGeometry = objects[object][i].mesh.geometry.clone();
                        const colors = new Uint8Array(bufferGeometry.attributes.position.array.length);
                        for (let i = 0, l = colors.length; i < l; i += 1) {
                            colors[i] = defaultColorRGB._rgb[i % 3];
                        }
                        const normalized = true;
                        const colorAttrib = new THREE.BufferAttribute(colors, 3, normalized);
                        bufferGeometry.setAttribute('color', colorAttrib);
                        this.mergedObjectsGeometry[object].push(bufferGeometry);
                        if (objects[object][i].getPillarMesh !== null && objects[object][i].getPillarMesh.geometry !== undefined) {
                            bufferGeometry = objects[object][i].getPillarMesh.geometry.clone();
                            this.mergedObjectsGeometry.pillar.push(bufferGeometry);
                        }
                        this.meshesInScene.push(objects[object][i].mesh);
                        objects[object][i].hideObject();
                    }
                } else {
                    //todo: Can directly get buffergeometry and merge it in future, currently it becomes undefined in start.
                    if (objects[object][i].mesh.geometry !== undefined) {
                        this.mergedObjects[object].push(objects[object][i]);
                        const bufferGeometry = objects[object][i].mesh.geometry.clone();
                        this.mergedObjectsGeometry[object].push(bufferGeometry);
                        objects[object][i].hideObject();
                        this.meshesInScene.push(objects[object][i].mesh);
                    }
                    // add condition for cables and tree
                    if (objects[object][i].edgeCentrePoints !== undefined) {
                        objects[object][i].edgeCentrePoints.forEach((point) => {
                            if (point.vertexMesh.geometry !== undefined) {
                                const temp = point.vertexMesh.geometry.clone();
                                // temp.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                                this.mergedObjects.edgeCentrePoints.push(point);
                                this.mergedObjectsGeometry.edgeCentrePoints.push(temp);
                                point.hideObject();
                            }
                        });
                    }
                }
                //Condition for parapet.
                if (object === POLYGON || object === CYLINDER) {
                    if (objects[object][i].getParapetMesh !== null && objects[object][i].getParapetMesh.geometry !== undefined) {
                        const bufferGeometry = objects[object][i].getParapetMesh.geometry.clone();
                        this.mergedObjectsGeometry.parapet.push(bufferGeometry);
                        this.meshesInScene.push(objects[object][i].getParapetMesh);
                    }
                }
            }
        });
        this.materialState = MATERIAL_STATES.TRANSLUCENT;
        this.visualState = VISUAL_STATES.DEFAULT;
    }

    // Merged geometry is placed 0.1 unit below to show the proper colour of object while hovering.ub
    createMergedMesh() {
        Object.keys(this.mergedObjectsGeometry).forEach((object) => {
            this.mergedMesh[object] = [];
            this.mergedLineMesh[object] = [];
            if (this.mergedObjectsGeometry[object].length > 0) {
                if (object === EDGE_CENTRE_POINT) {
                    const pointsMaterial = this.mergedObjects[object][0].objectsGroup.children[0].material;
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    this.mergedMesh[object] = new THREE.Points(mergedGeometry, pointsMaterial);
                } else if (object === PILLAR) {
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    this.mergedMesh[object] = createMesh(mergedGeometry, this.pillarMaterial2D);
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                    this.mergedLineMesh[object] = new THREE.LineSegments(new THREE.EdgesGeometry(mergedGeometry), this.pillarEdgeMaterial);
                } else if (object === CYLINDER) {
                    const lineGeometry = [];
                    this.mergedObjects[object].forEach((cylinder) => {
                        lineGeometry.push(cylinder.coreEdges.geometry);
                    });
                    let mergedGeometry = BufferGeometryUtils.mergeGeometries(lineGeometry);
                    this.mergedLineMesh[object] = new THREE.LineSegments(mergedGeometry, this.mergedObjects[object][0].mergeEdgeMaterial2D);
                    mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const meshMaterial = this.mergedObjects[object][0].mergeMeshMaterial2D.clone();
                    this.mergedMesh[object] = createMesh(mergedGeometry, meshMaterial);
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                } else if (object === CROWN) {
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const crownMaterial = this.mergedObjects.trees[0].crownMaterial2D;
                    this.mergedMesh[object] = createMesh(mergedGeometry, crownMaterial);
                    this.mergedMesh[object].renderOrder = 1;
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                } else if (object === CROWN_EDGE) {
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const crownEdgeMaterial = this.mergedObjects.trees[0].crownEdgeMaterial;
                    this.mergedLineMesh[object] = new THREE.LineSegments(mergedGeometry, crownEdgeMaterial);
                } else if (object === TRUNK) {
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const trunkMaterial = this.mergedObjects.trees[0].trunkMaterial2D;
                    this.mergedMesh[object] = createMesh(mergedGeometry, trunkMaterial);
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                } else if (object === TRUNK_EDGE) {
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const trunkEdgeMaterial = this.mergedObjects.trees[0].trunkEdgeMaterial;
                    this.mergedLineMesh[object] = new THREE.LineSegments(mergedGeometry, trunkEdgeMaterial);
                } else if (object === PARAPET) {
                    let mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    const parapetMaterial = this.translucenthMaterial2DParapet.clone();
                    this.mergedMesh[object] = createMesh(mergedGeometry, parapetMaterial);
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                    mergedGeometry = new THREE.EdgesGeometry(mergedGeometry);
                    this.mergedLineMesh[object] = new THREE.LineSegments(mergedGeometry, this.translucentParapetEdgeMaterial2D);
                    this.mergedLineMesh[object].position.z = 0.01;
                } else {
                    let mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    mergedGeometry.translate(0, 0, -0.01);
                    let meshMaterial = this.mergedObjects[object][0].mergeMeshMaterial2D.clone();
                    if (object === INVERTER) {
                        meshMaterial = new THREE.MeshBasicMaterial({
                            transparent: false,
                            vertexColors: true,
                        });
                    }
                    this.mergedMesh[object] = createMesh(mergedGeometry, meshMaterial);
                    this.mergedMesh[object].receiveShadow = true;
                    this.mergedMesh[object].castShadow = true;
                    mergedGeometry = new THREE.EdgesGeometry(mergedGeometry);
                    this.mergedLineMesh[object] = new THREE.LineSegments(mergedGeometry, this.mergedObjects[object][0].mergeEdgeMaterial2D);
                    if (object === POLYGON || object === 'smartroofs' || object === 'dormers') {
                        this.mergedLineMesh[object].position.z = 0.01;
                    }
                }
            }
        });
    }

    addToScene() {
        this.objectsGroup.clear();
        Object.keys(this.mergedMesh).forEach((object) => {
            if (object === EDGE_CENTRE_POINT) {
                if (this.stage.viewManager.edgeCenterVisible && !this.stage.visualManager.getIn3D()) {
                    if (this.mergedMesh[object] instanceof Object3D) {
                        this.objectsGroup.add(this.mergedMesh[object]);
                    }
                } else if (this.mergedMesh[object] instanceof Object3D) {
                    this.objectsGroup.remove(this.mergedMesh[object]);
                }
            } else {
                if (this.mergedMesh[object] instanceof Object3D) {
                    this.objectsGroup.add(this.mergedMesh[object]);
                }
                if (this.mergedLineMesh[object] instanceof THREE.Object3D) {
                    this.objectsGroup.add(this.mergedLineMesh[object]);
                }
            }
        });
        this.updateVisualsBasedOnStates(this.stage.visualManager.getMaterialStateBasedOnConditions(), this.visualState);
    }

    hideMesh() {
        this.objectsGroup.visible = false;
    }

    showMesh() {
        this.objectsGroup.visible = true;
    }

    switchTo3D() {
        Object.keys(this.mergedMesh).forEach((object) => {
            if (this.mergedMesh[object] instanceof Object3D) {
                if (object === EDGE_CENTRE_POINT) {
                    this.objectsGroup.remove(this.mergedMesh[object]);
                } else if (object === AC_CABLE || object === DC_CABLE || object === SAFETY_LINE || object === CONDUIT ||
                    object === DOUBLE_CONDUIT || object === DOUBLE_SEPARATE_CONDUIT || object === SINGLE_CABLE_TRAY ||
                    object === DOUBLE_CABLE_TRAY || object === DOUBLE_SEPARATE_CABLE_TRAY) {
                    for (let i = 0, l = this.mergedObjects[object].length; i < l; i += 1) {
                        if (this.mergedObjectsGeometry[object].length > 0) {
                            this.mergedObjectsGeometry[object].forEach(geometry => {
                                if (geometry !== undefined || geometry !== null) {
                                    geometry.dispose();
                                }
                            });
                            this.mergedObjectsGeometry[object] = [];
                            const bufferGeometry = this.mergedObjects[object][i].mesh3D.geometry.clone();
                            this.mergedObjectsGeometry[object].push(bufferGeometry);
                        }
                    }
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    this.mergedMesh[object].geometry = mergedGeometry;
                    this.mergedLineMesh[object].geometry = mergedGeometry;
                    this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial3D;
                    this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial3D;
                } else if (object === CROWN) {
                    this.mergedMesh[object].material = this.mergedObjects.trees[0].crownMaterial3D;
                    this.mergedLineMesh.crownEdge.visible = false;
                    this.mergedMesh[object].visible = false;
                } else if (object === TRUNK) {
                    this.mergedMesh[object].material = this.mergedObjects.trees[0].trunkMaterial3D;
                    this.mergedLineMesh.trunkEdge.visible = false
                    this.mergedMesh[object].visible = false;
                } else if (object === PILLAR) {
                    this.mergedMesh[object].material = this.pillarMaterial3D;
                    this.mergedLineMesh[object].material = this.pillarEdgeMaterial;
                } else if (!this.stage.visualManager.getHeatMapEnabled()) {
                    if (object === PARAPET) {
                        this.mergedMesh[object].material = this.parapetSolidMeshMaterial;
                        this.mergedLineMesh[object].material = this.mergedObjects.polygons.length > 0 ? this.mergedObjects.polygons[0].mergeEdgeMaterial3D : this.mergedObjects.cylinders[0].mergeEdgeMaterial3D;
                    } else {
                        this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial3D;
                        if (object === INVERTER) {
                            let meshMaterial = new THREE.MeshBasicMaterial({
                                transparent: true,
                                vertexColors: true,
                            });
                            this.mergedMesh[object].material = meshMaterial;
                        }
                        this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial3D;
                    }
                }
            }
        });
        if (this.stage.getDesignSettings().drawing_defaults.tree.treeId != 7) {    
            this.mergedObjects.trees.forEach(object => {
                if (object.polyTrunkMesh) {
                    object.polyTrunkMesh.visible = true;
                }
            });
        }
        this.updateVisualsBasedOnStates(this.stage.visualManager.getMaterialStateBasedOnConditions(), this.visualState);
    }

    switchTo2D() {
        Object.keys(this.mergedMesh).forEach((object) => {
            if (this.mergedMesh[object] instanceof Object3D) {
                if (object === EDGE_CENTRE_POINT) {
                    if(this.stage.viewManager.edgeCenterVisible){
                        this.objectsGroup.add(this.mergedMesh[object]);
                    }
                } else if (object === AC_CABLE || object === DC_CABLE || object === SAFETY_LINE || object === CONDUIT ||
                    object === DOUBLE_CONDUIT || object === DOUBLE_SEPARATE_CONDUIT || object === SINGLE_CABLE_TRAY || object === DOUBLE_CABLE_TRAY ||
                    object === DOUBLE_SEPARATE_CABLE_TRAY) {
                    for (let i = 0, l = this.mergedObjects[object].length; i < l; i += 1) {
                        if (this.mergedObjectsGeometry[object].length > 0) {
                            this.mergedObjectsGeometry[object].forEach((geometry) => {
                                geometry.dispose();
                            });
                            this.mergedObjectsGeometry[object] = [];
                            const bufferGeometry = this.mergedObjects[object][i].mesh2D.geometry.clone();
                            this.mergedObjectsGeometry[object].push(bufferGeometry);
                        }
                    }
                    const mergedGeometry = BufferGeometryUtils.mergeGeometries(this.mergedObjectsGeometry[object]);
                    this.mergedMesh[object].geometry = mergedGeometry;
                    this.mergedLineMesh[object].geometry = mergedGeometry;
                    this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial2D;
                    this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial2D;
                } else if (object === CROWN) {
                    this.mergedMesh[object].material = this.mergedObjects.trees[0].crownMaterial2D;
                    this.mergedLineMesh.crownEdge.visible = true;
                    this.mergedMesh[object].visible = true;
                } else if (object === TRUNK) {
                    this.mergedMesh[object].material = this.mergedObjects.trees[0].trunkMaterial2D;
                    this.mergedLineMesh.trunkEdge.visible = true;
                    this.mergedMesh[object].visible = true;
                } else if (object === PILLAR) {
                    this.mergedMesh[object].material = this.pillarMaterial2D;
                    this.mergedLineMesh[object].material = this.pillarEdgeMaterial;
                } else if (object === PARAPET) {
                    this.mergedMesh[object].material = this.translucenthMaterial2DParapet;
                    this.mergedLineMesh[object].material = this.translucentParapetEdgeMaterial2D;
                } else {
                    this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial2D;
                    if (object === INVERTER) {
                        let meshMaterial = new THREE.MeshBasicMaterial({
                            transparent: false,
                            vertexColors: true,
                        });
                        this.mergedMesh[object].material = meshMaterial;
                    }

                    this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial2D;
                }
            }
        });
        this.mergedObjects.trees.forEach(object => {
            if (object.polyTrunkMesh) {
                object.polyTrunkMesh.visible = false;
            }
        });
        this.materialState = MATERIAL_STATES.TRANSLUCENT;
        this.updateVisualsBasedOnStates(this.stage.visualManager.getMaterialStateBasedOnConditions(), this.visualState);
    }

    getColorMap(object) {
        //TODO: ADD CASES FOR CABLES, CONDUITS
        let colorMapping;
        switch (object) {
            case 'polygons':
                colorMapping = COLOR_MAPPINGS.POLYGON;
                break;
            case 'smartroofs':
                colorMapping = COLOR_MAPPINGS.SMARTROOF;
                break;
            case 'cylinders':
                colorMapping = COLOR_MAPPINGS.CYLINDER;
                break;
            case 'walkways':
                colorMapping = COLOR_MAPPINGS.WALKWAY;
                break;
            case 'inverters':
                colorMapping = COLOR_MAPPINGS.INVERTER;
                break;
            case 'acdb':
                colorMapping = COLOR_MAPPINGS.ACDB;
                break;
            case 'safetyline':
                colorMapping = COLOR_MAPPINGS.SAFETY_LINE;
                break;
            case 'trees':
                colorMapping = COLOR_MAPPINGS.TREE;
                break;
            case 'handrail':
                colorMapping = COLOR_MAPPINGS.HANDRAIL;
                break;
            case 'property':
                colorMapping = COLOR_MAPPINGS.PROPERTY;
                break;
            case 'subArrays':
                colorMapping = COLOR_MAPPINGS.SUBARRAY;
                break;
            case 'dormers':
                colorMapping = COLOR_MAPPINGS.POLYGON;
                break;
            default:
                colorMapping = [];
                break;
                //TODO: ADD CASES FOR CABLES, CONDUITS
        }
        if (this.materialAndVisualStatesExist(colorMapping)) {
            return colorMapping[this.materialState][this.visualState];
        }
        return {};
    }

    materialAndVisualStatesExist(colorMapping) {
        if (colorMapping[this.materialState] !== undefined &&
            colorMapping[this.materialState] !== null &&
            colorMapping[this.materialState][this.visualState] !== undefined &&
            colorMapping[this.materialState][this.visualState] !== null) {
            return true;
        }
        return false;
    }

    updateVisualsBasedOnStates(materialState, visualState) {
        const is3DEnabled = this.stage.visualManager.in3D;
        let flag = false;
        if (materialState !== null) {
            if (this.materialState !== materialState) {
                this.materialState = materialState;
                flag = true;
                if (this.materialState === MATERIAL_STATES.SOLID) {
                    Object.keys(this.mergedMesh).forEach((object) => {
                        if (this.mergedMesh[object] instanceof Object3D) {
                            if (object === EDGE_CENTRE_POINT) {
                                return;
                            } else if (object === PILLAR) {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = this.pillarMaterial3D;
                                this.mergedLineMesh[object].material = this.pillarEdgeMaterial;
                            } else if (object === CROWN) {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = this.mergedObjects.trees[0].crownMaterial3D;
                                this.mergedLineMesh.crownEdge.visible = false;
                                if(is3DEnabled) {
                                    this.mergedMesh[object].visible = false;
                                }
                            } else if (object === TRUNK) {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = this.mergedObjects.trees[0].trunkMaterial3D;
                                this.mergedLineMesh.trunkEdge.visible = false;
                                if(is3DEnabled) {
                                    this.mergedMesh[object].visible = false;
                                }
                            } else if (object === INVERTER) {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = new THREE.MeshBasicMaterial({
                                    transparent: true,
                                    vertexColors: true,
                                });
                                this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial3D;
                            } else if (object === PARAPET) {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = this.parapetSolidMeshMaterial;
                                this.mergedLineMesh[object].material = this.mergedObjects.polygons.length > 0 ? this.mergedObjects.polygons[0].mergeEdgeMaterial3D : this.mergedObjects.cylinders[0].mergeEdgeMaterial3D;
                            } else {
                                this.mergedMesh[object].castShadow = true;
                                this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial3D;
                                this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial3D;
                            }
                        }
                    });
                } else if (this.materialState === MATERIAL_STATES.TRANSLUCENT) {
                    Object.keys(this.mergedMesh).forEach((object) => {
                        if (this.mergedMesh[object] instanceof Object3D) {
                            if (object === EDGE_CENTRE_POINT) {
                                return;
                            } else if (object === PILLAR) {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = this.pillarMaterial2D;
                                this.mergedLineMesh[object].material = this.pillarEdgeMaterial;
                            } else if (object === CROWN) {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = this.mergedObjects.trees[0].crownMaterial2D;
                                this.mergedLineMesh.crownEdge.visible = true;
                                if(is3DEnabled) {
                                    this.mergedMesh[object].visible = false;
                                }
                            } else if (object === TRUNK) {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = this.mergedObjects.trees[0].trunkMaterial2D;
                                this.mergedLineMesh.trunkEdge.visible = true;
                                if(is3DEnabled) {
                                    this.mergedMesh[object].visible = false;
                                }
                            } else if (object === INVERTER) {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = new THREE.MeshBasicMaterial({
                                    transparent: false,
                                    vertexColors: true,
                                });
                                this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial2D;
                            } else if (object === PARAPET) {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = this.translucenthMaterial2DParapet;
                                this.mergedLineMesh[object].material = this.translucentParapetEdgeMaterial2D;
                            } else {
                                this.mergedMesh[object].castShadow = false;
                                this.mergedMesh[object].material = this.mergedObjects[object][0].mergeMeshMaterial2D;
                                this.mergedLineMesh[object].material = this.mergedObjects[object][0].mergeEdgeMaterial2D;
                            }
                        }
                    });
                }
            }
        }
        if (visualState !== null) {
            if (this.visualState !== visualState) {
                this.visualState = visualState;
                flag = true;
            }
        }
        if (flag) {
            Object.keys(this.mergedMesh).forEach((object) => {
                if (this.mergedMesh[object] instanceof Object3D) {
                    const newColors = this.getColorMap(object);
                    visualUtils.updateMeshWithColor(newColors.MESH_COLOR, this.mergedMesh[object]);
                    visualUtils.updateMeshWithColor(newColors.EDGE_COLOR, this.mergedLineMesh[object]);
                }
            });
        }
    }
}
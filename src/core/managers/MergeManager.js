import * as THREE from 'three';
import { Object3D } from 'three';
import * as exporters from '../utils/exporters';
import MergedMesh from '../objects/ground/MergedMesh';
import PolygonModel from '../objects/model/PolygonModel';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import Dormer from '../objects/model/smartroof/Dormer';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import CylinderModel from '../objects/model/CylinderModel';
import Walkway from '../objects/model/Walkway';
import SafetyLine from '../objects/model/SafetyLine';
import Handrail from '../objects/model/Handrail';
import Property from '../objects/model/Property';
import Tree from '../objects/model/Tree';
import Inverter from '../objects/ac/Inverter';
import CombinerBox from '../objects/ac/CombinerBox';
import ACDB from '../objects/ac/ACDB';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import DCDB from '../objects/ac/DCDB';
import Subarray from '../objects/subArray/Subarray';
import Conduit from '../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import Table from '../objects/subArray/Table';
import Panel from '../objects/subArray/Panel';
import Cable from '../objects/model/cable/Cables';
import DCString from '../objects/subArray/DCString';
import { rotationAroundPoint } from '../utils/utils';
import ElectricalString from '../objects/subArray/ElectricalString';
import MicroInverter from '../objects/ac/MicroInverter';
import Dimension from '../objects/subObjects/Dimension';
import TextBox from '../objects/subObjects/TextBox';
import OuterEdge from '../objects/model/smartroof/OuterEdge';
import Gazebo from '../lib/PowerGazebo';

export default class MergeManager {
    constructor(stage) {
        this.stage = stage;
        this.backgroundMergeMesh = new MergedMesh(stage);
        this.childrenMergeMesh = new MergedMesh(stage);
        this.currentSelectedObject = null;
    }

    mergeScene(object, makeVisible = true) {
        if (object instanceof DCString || object instanceof Dimension || object instanceof ElectricalString) {
            object = this.stage.ground;
        }
        this.createChildrenMergeMesh(object);
        this.createBackgroundMergeMesh(object);
        this.displayMeshes();

        if (object !== this.stage.ground) {
            if (!(object instanceof Subarray || object instanceof Table || object instanceof Panel || object instanceof Handrail || 
                object instanceof Property || object instanceof Cable || object instanceof SafetyLine || object instanceof ACDB || object instanceof DCDB 
                || object instanceof SmartroofFace || object instanceof OuterEdge || object instanceof TextBox || object instanceof CombinerBox)) {
                if (makeVisible) object.showObject(); // required?
            }
        }
        this.currentSelectedObject = object;
    }

    hideMergedMesh() {
        this.childrenMergeMesh.hideMesh();
        this.backgroundMergeMesh.hideMesh();
    }

    showMergedMesh() {
        this.childrenMergeMesh.showMesh();
        this.backgroundMergeMesh.showMesh();
    }

    getAllMeshesInScene() {
        let meshes = [];
        meshes.push(...this.childrenMergeMesh.meshesInScene, ...this.backgroundMergeMesh.meshesInScene);
        if (this.currentSelectedObject === this.stage.ground) {
            meshes.push(this.currentSelectedObject.plane);
        }
        else if (this.currentSelectedObject instanceof Table || 
            this.currentSelectedObject instanceof Panel || 
            this.currentSelectedObject instanceof SmartroofFace ||
            this.currentSelectedObject instanceof OuterEdge ||
            this.currentSelectedObject instanceof MicroInverter) {
            meshes.push(this.stage.ground.plane);
        }
        else if (this.currentSelectedObject instanceof Tree) {
            meshes.push(this.currentSelectedObject.crownMesh);
            meshes.push(this.currentSelectedObject.trunkMesh);
            meshes.push(this.stage.ground.plane);
        }
        else if (this.currentSelectedObject instanceof TextBox) {
            meshes.push(this.currentSelectedObject.textBoxMesh);
            meshes.push(this.currentSelectedObject.textMesh);
            meshes.push(this.stage.ground.plane);
        }
        else {
            if (this.currentSelectedObject.mesh !== undefined) meshes.push(this.currentSelectedObject.mesh);
            if (this.currentSelectedObject.edgeCentrePoints !== undefined) {
                this.currentSelectedObject.edgeCentrePoints.forEach((edgeCenter) => {
                    meshes.push(edgeCenter.vertexMesh);
                });
            }
            if (this.currentSelectedObject instanceof PolygonModel || this.currentSelectedObject instanceof CylinderModel) {
                if (this.currentSelectedObject.parapetMesh !== undefined) {
                    meshes.push(this.currentSelectedObject.parapetMesh);
                }
            }
            if (!(this.currentSelectedObject instanceof Gazebo) &&
                this.currentSelectedObject.outlinePoints !== undefined &&
                this.currentSelectedObject.outlinePoints[0] !== undefined &&
                this.currentSelectedObject.outlinePoints[0].vertexMesh !== undefined) {
                this.currentSelectedObject.outlinePoints.forEach((outlinePoint) => {
                    meshes.push(outlinePoint.vertexMesh);
                });
            }
            if (this.currentSelectedObject.rotationPoints &&
                this.currentSelectedObject.rotationPoints.vertexMesh) {
                meshes.push(this.currentSelectedObject.rotationPoints.vertexMesh);
            }
           
            if (this.currentSelectedObject instanceof SmartroofModel) {
                if (this.currentSelectedObject.innerEdgesMesh !== undefined) {
                    meshes.push(...this.currentSelectedObject.innerEdgesMesh);
                }
            }
            if (this.currentSelectedObject instanceof SmartroofModel) {
                if (this.currentSelectedObject.outerEdgesMesh !== undefined) {
                    meshes.push(...this.currentSelectedObject.outerEdgesMesh);
                }
            }
            if (this.currentSelectedObject instanceof SmartroofModel) {
                if (this.currentSelectedObject.measurementTextMesh !== undefined) {
                    meshes.push(...this.currentSelectedObject.measurementTextMesh);
                }
            }
            meshes.push(this.stage.ground.plane);
        }
        return meshes;
    }

    getAllModelsInScene() {
        let meshes = [];
        meshes.push(...this.childrenMergeMesh.mergedObjects, ...this.backgroundMergeMesh.mergedObjects);
        if (this.currentSelectedObject === this.stage.ground) {
            meshes.push(this.currentSelectedObject);
        } else if (this.currentSelectedObject instanceof Table ||
            this.currentSelectedObject instanceof Panel ||
            this.currentSelectedObject instanceof SmartroofFace ||
            this.currentSelectedObject instanceof MicroInverter || this.currentSelectedObject instanceof Tree || this.currentSelectedObject instanceof TextBox) {} else {
            meshes.push(this.currentSelectedObject);
            if (this.currentSelectedObject.edgeCentrePoints !== undefined) {
                this.currentSelectedObject.edgeCentrePoints.forEach(edgeCenter => {
                    meshes.push(edgeCenter.vertexMesh);
                });
            }
            meshes.push(this.stage.ground.plane);
        }
        return meshes;
    }

    displayMeshes() {
        this.backgroundMergeMesh.addToScene();
        this.childrenMergeMesh.addToScene();
    }
    
    createChildrenMergeMesh(object) {
        let children = exporters.getAllModelType();
        exporters.getModels(object,children);
        this.childrenMergeMesh.addObjectsToMerge(children);
    }

    createBackgroundMergeMesh(object) {
        let background = exporters.getAllModelType();
        this.getBackgroundModels(this.stage.ground, background, object);
        this.backgroundMergeMesh.addObjectsToMerge(background);
    }

    moveChildrenMesh(deltaX, deltaY, deltaZ = 0) {
        Object.keys(this.childrenMergeMesh.mergedMesh).forEach(object => {
            if (this.childrenMergeMesh.mergedMesh[object] instanceof Object3D) {
                const value = this.childrenMergeMesh.mergedMesh[object].position;
                this.childrenMergeMesh.mergedMesh[object].position.set(value.x + deltaX, value.y + deltaY, value.z + deltaZ);
            }
        });
        
        Object.keys(this.childrenMergeMesh.mergedLineMesh).forEach(object => {
            if (this.childrenMergeMesh.mergedLineMesh[object] instanceof Object3D) {
                const value = this.childrenMergeMesh.mergedLineMesh[object].position;
                this.childrenMergeMesh.mergedLineMesh[object].position.set(value.x + deltaX, value.y + deltaY, value.z + deltaZ);
            }
        });

    }

    rotateObjectHelper(angleInRad, centroidPoint) {
        Object.keys(this.childrenMergeMesh.mergedMesh).forEach(object => {
            if (this.childrenMergeMesh.mergedMesh[object] instanceof Object3D) {
                for (let i = 0, l = this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.array.length; i < l; i += 3) {
                    const oldX = this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.array[i] +
                        this.childrenMergeMesh.mergedMesh[object].position.x;

                    const oldY = this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.array[i + 1] +
                        this.childrenMergeMesh.mergedMesh[object].position.y
                        
                    const newXY = rotationAroundPoint(
                        centroidPoint.x,
                        centroidPoint.y,
                        oldX,
                        oldY,
                        angleInRad,
                    );
                    this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.array[i] += newXY[0] - oldX;
                    this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.array[i + 1] += newXY[1] - oldY;
                    this.childrenMergeMesh.mergedMesh[object].geometry.attributes.position.needsUpdate = true;
                }    
            }
        });

        Object.keys(this.childrenMergeMesh.mergedLineMesh).forEach(object => {
            if (this.childrenMergeMesh.mergedLineMesh[object] instanceof Object3D) {
                for (let i = 0, l = this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.array.length; i < l; i += 3) {

                    const oldX = this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.array[i] +
                        this.childrenMergeMesh.mergedMesh[object].position.x;

                    const oldY = this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.array[i + 1] +
                        this.childrenMergeMesh.mergedMesh[object].position.y;

                    const newXY = rotationAroundPoint(
                        centroidPoint.x,
                        centroidPoint.y,
                        oldX,
                        oldY,
                        angleInRad,
                    );
                    this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.array[i] += newXY[0] - oldX;
                    this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.array[i + 1] += newXY[1] - oldY;
                    this.childrenMergeMesh.mergedLineMesh[object].geometry.attributes.position.needsUpdate = true;
                }    
            }
        });
        
    }

    lockChildrenMesh() {
        this.childrenMergeMesh.objectsGroup.children.forEach((child) => {
            child.matrixAutoUpdate = false;
        });
    }
    unlockChildrenMesh() {
        this.childrenMergeMesh.objectsGroup.children.forEach((child) => {
            child.matrixAutoUpdate = true;
        });
    }

    switchTo2D() {
        this.childrenMergeMesh.switchTo2D();
        this.backgroundMergeMesh.switchTo2D();
    }

    switchTo3D() {
        this.childrenMergeMesh.switchTo3D();
        this.backgroundMergeMesh.switchTo3D();
    }

    switchMaterialState(materialState, visualState) {
        this.childrenMergeMesh.updateVisualsBasedOnStates(materialState, visualState);
        this.backgroundMergeMesh.updateVisualsBasedOnStates(materialState, visualState);
    }

    getBackgroundModels(object, result, exclude) {
        if (exclude === object) {
            return;
        }
        const children = object.getChildren();
        for (let i = 0, len = children.length; i < len; i += 1) {
            if (children[i] === exclude) {
                continue;
            }
            if (children[i] instanceof PolygonModel) {
                result.polygons.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof SmartroofModel) {
                result.smartroofs.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof Dormer) {
                result.dormers.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof SmartroofFace) {
                result.smartroofFaces.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof OuterEdge) {
                result.outerEdges.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof CylinderModel) {
                result.cylinders.push(children[i]);
                this.getBackgroundModels(children[i], result, exclude);
            }
            else if (children[i] instanceof Walkway) {
                if (children[i] instanceof SafetyLine) {
                    result.safetyline.push(children[i]);
                }
                else {
                    result.walkways.push(children[i]);
                }
            }
            else if (children[i] instanceof Handrail) {
                result.handrail.push(children[i]);
            }
            else if (children[i] instanceof Property) {
                result.property.push(children[i]);
            }
            else if (children[i] instanceof Tree) {
                result.trees.push(children[i]);
            }
            else if (children[i] instanceof Inverter) {
                result.inverters.push(children[i]);
            }
            else if (children[i] instanceof CombinerBox) {
                result.combinerBox.push(children[i]);
            }
            else if (children[i] instanceof ACDB) {
                result.acdb.push(children[i]);
            }
            else if (children[i] instanceof AcCable) {
                result.acCable.push(children[i]);
            }
            else if (children[i] instanceof DcCable) {
                result.dcCable.push(children[i]);
            }
            else if (children[i] instanceof DCDB) {
                if (result.dcdb === undefined) {
                    result.dcdb = [];
                }
                result.dcdb.push(children[i]);
            }
            else if (children[i] instanceof Subarray){
                result.subArrays.push(children[i]);
            }
            else if (children[i] instanceof Conduit) {
                if (children[i] instanceof DoubleConduit) {
                    result.doubleConduit.push(children[i]);
                }
                else if (children[i] instanceof DoubleSeparateConduit) {
                    result.doubleSeparateConduit.push(children[i]);
                }
                else if (children[i] instanceof SingleCableTray) {
                    result.singleCableTray.push(children[i]);
                }
                else if (children[i] instanceof DoubleCableTray) {
                    result.doubleCableTray.push(children[i]);
                }
                else if (children[i] instanceof DoubleSeparateCableTray) {
                    result.DoubleSeparateCableTray.push(children[i]);
                }
                else {
                    result.conduits.push(children[i]);
                }
            }
        }
    }
}
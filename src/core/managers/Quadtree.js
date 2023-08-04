import FixedObject from '../objects/FixedObject';
import CylinderModel from '../objects/model/CylinderModel';
import Handrail from '../objects/model/Handrail';
import PolygonModel from '../objects/model/PolygonModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Tree from '../objects/model/Tree';
import Walkway from '../objects/model/Walkway';
import Quadrant from './Quadrant';

export const mapped = {};
export default class Quadtree {
    constructor(stage, boundary, n) {
        this.stage = stage;
        this.boundary = boundary;
        this.maxObjectsPerCell = n;
        this.objects = [];
        this.divided = false;
        this.parent = undefined;
        this.modelResults = [];
        this.obstacleResults = [];
    }
    // if a quadrant of the quadree is alloted with more than 4 objects , the quadrant is divided further
    // until the condition is satisfied

    subdivide() {
        const x = this.boundary.centerX;
        const y = this.boundary.centerY;
        const w = this.boundary.gridLeft;
        const h = this.boundary.gridBottom;
        const tl = new Quadrant(x - (w / 2), y + (h / 2), (w / 2), (h / 2));
        this.topLeft = new Quadtree(this.stage, tl, this.maxObjectsPerCell);
        const tr = new Quadrant(x + (w / 2), y + (h / 2), (w / 2), (h / 2));
        this.topRight = new Quadtree(this.stage, tr, this.maxObjectsPerCell);
        const bl = new Quadrant(x - (w / 2), y - (h / 2), (w / 2), (h / 2));
        this.bottomLeft = new Quadtree(this.stage, bl, this.maxObjectsPerCell);
        const br = new Quadrant(x + (w / 2), y - (h / 2), (w / 2), (h / 2));
        this.bottomRight = new Quadtree(this.stage, br, this.maxObjectsPerCell);
        this.divided = true;
    }

    // The object is removed from whichever quadrants it belongs to

    removeObject(uuid) {
        this.objects = this.objects.filter(o => o.getUUID() !== uuid);
    }

    // Made as a method to uninitialize.
    destroy() {
        this.parent = undefined;
        this.modelResults = [];
        this.objects = [];
        this.divided = false;
    }

    // Add objects to the quadtree
    addObject(object) {
        if (!this.boundary.contains(object)) {
            return false;
        }
        // const geometry = new THREE.PlaneGeometry(this.boundary.gridLeft*2,this.boundary.gridLeft*2)
        // const material = new THREE.MeshBasicMaterial({color:0x080808, wireframe:true})
        // const mesh = new THREE.Mesh(geometry,material)
        // mesh.position.x = this.boundary.x
        // mesh.position.y = this.boundary.y
        // this.stage.sceneManager.scene.add(mesh)
        if (this.objects.length < this.maxObjectsPerCell) {
            this.objects.push(object);
            if (mapped[object.getUUID()]) {
                mapped[object.getUUID()].push(this);
            }
            else {
                mapped[object.getUUID()] = [this];
            }
            return true;
        }
        if (!this.divided) {
            this.subdivide();
        }
        if (this.topRight.boundary.contains(object)) {
            this.topRight.addObject(object);
        }
        if (this.topLeft.boundary.contains(object)) {
            this.topLeft.addObject(object);
        }
        if (this.bottomRight.boundary.contains(object)) {
            this.bottomRight.addObject(object);
        }
        if (this.bottomLeft.boundary.contains(object)) {
            this.bottomLeft.addObject(object);
        }
    }

    // The searching algorithm. The range is the imaginary rectangle of the selected object.
    // upon mouse move, all the object belonging in the range are found and added to this.modelResults
    query(range, foundModels, obstacleModels) {
        this.modelResults = [];
        this.obstacleResults = [];
        if (!foundModels) {
            foundModels = [];
            obstacleModels = [];
        }
        if (!this.boundary.intersects(range.boundingBoxRange)) {
            return;
        }

        this.objects.forEach((object) => {
            if (range.contains(object)) {
                if (foundModels !== undefined) {
                    if (
                        object instanceof PolygonModel
                        || object instanceof CylinderModel
                        || (object instanceof SmartroofFace && object.isValidFace())) {
                        if (!foundModels.includes(object)) {
                            foundModels.push(object);
                        }
                    }
                    else if (
                        object instanceof Walkway
                        || object instanceof Handrail
                        || object instanceof Tree
                        || object instanceof FixedObject
                    ) {
                        if (!obstacleModels.includes(object)) {
                            obstacleModels.push(object);
                        }
                    }
                }
            }
        });

        if (this.divided) {
            this.topLeft.query(range, foundModels, obstacleModels);
            this.topRight.query(range, foundModels, obstacleModels);
            this.bottomRight.query(range, foundModels, obstacleModels);
            this.bottomLeft.query(range, foundModels, obstacleModels);
        }
        this.modelResults.push(...foundModels);
        this.obstacleResults.push(...obstacleModels);
    }
}

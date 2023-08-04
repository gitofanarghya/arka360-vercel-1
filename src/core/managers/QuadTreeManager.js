import { getAllModelType, getModels } from '../utils/exporters';
import Quadtree, { mapped } from './Quadtree';
import Quadrant from './Quadrant';

export default class QuadTreeManager {
    constructor(stage) {
        this.stage = stage;

        this.rootQuadrant = new Quadrant(0, 0, Math.max(
            this.stage.cameraManager.camera.right,
            this.stage.cameraManager.camera.top,
        ), Math.max(
            this.stage.cameraManager.camera.right,
            this.stage.cameraManager.camera.top,
        ));
        this.rootNode = new Quadtree(this.stage, this.rootQuadrant, 5);

        // initializing the searching quadrant
        this.queryNode = new Quadrant(0, 0, 0, 0);
    }

    initialize() {
        const result = getAllModelType();
        getModels(this.stage.ground, result);

        // not adding subarrays to quadtree
        const subArrayKey = 'subArrays';
        delete result[subArrayKey];

        Object.keys(result).forEach((model) => {
            result[model].forEach((object) => {
                this.rootNode.addObject(object);
            });
        });
    }

    getObjectsInQuadrant(boundingBox, includeObstacles) {
        this.queryNode.setBoundingBox(boundingBox);

        const foundModels = null;
        const obstacleModels = null;
        this.rootNode.query(this.queryNode, foundModels, obstacleModels);
        if (includeObstacles) {
            return [
                ...this.rootNode.modelResults,
                ...this.rootNode.obstacleResults,
                this.stage.ground,
            ];
        }
        return [
            ...this.rootNode.modelResults,
            this.stage.ground,
        ];
    }

    handlePlaceObject(object) {
        for (let i = 0; i < object.getChildren().length; i += 1) {
            if (mapped[object.getChildren()[i].getUUID()]) {
                mapped[object.getChildren()[i].getUUID()].forEach((h) => {
                    h.removeObject(object.getChildren()[i].getUUID());
                });
            }
            this.rootNode.addObject(object.getChildren()[i]);
        }
        if (mapped[object.getUUID()]) {
            mapped[object.getUUID()].forEach((h) => {
                h.removeObject(object.getUUID());
            });
        }
        this.rootNode.addObject(object);
    }

    removeObject(object) {
        if (mapped[object.getUUID()]) {
            mapped[object.getUUID()].forEach((h) => {
                h.removeObject(object.getUUID());
            });
        }
    }
}

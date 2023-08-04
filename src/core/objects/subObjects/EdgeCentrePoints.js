import * as THREE from 'three';
import { EDGE_CENTRE_POINT_COLOR } from '../visualConstants';
import OutlinePoints from './OutlinePoints';

export default class EdgeCentrePoints extends OutlinePoints {
    constructor(x, y, z, object, stage, colorMap = null) {
        const pointColor = colorMap !== null ? colorMap : {
            OUTLINE_POINT_COLOR: EDGE_CENTRE_POINT_COLOR,
        };

        super(x, y, z, object, stage, pointColor);
        this.showObject();
    }

    handleDragStart() {
        // change colour of point to resemble outline point
        this.belongsTo.handleEdgeCenterDragStart(this);
    }

    moveObject(deltaX, deltaY, deltaZ = 0) {
        // stupidly move the points
        this.vertexMesh.geometry.translate(deltaX, deltaY, deltaZ);
        const delta = new THREE.Vector3(deltaX, deltaY, deltaZ);
        // call on resize function for model
        this.belongsTo.handleEdgeCentreMove(this, delta);
    }

    async handleDragCancel() {
        await this.placeObject();
    }

    async placeObject(deltaX = 0, deltaY = 0, deltaZ = 0) {
        this.moveObject(deltaX, deltaY, deltaZ);
        try {
            await this.belongsTo.handleEdgeCentrePlace(this);
            return Promise.resolve(true);
        }
        catch (error) {
            console.error('ERROR: EdgeCentrePoints: placeObject failed', error);
            return Promise.reject(error);
        }
    }
}

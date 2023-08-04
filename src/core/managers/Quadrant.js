import { isIntersecting } from '../utils/raycastingUtils';
import { checkPolygonInsidePolygon } from '../utils/utils';


export default class Quadrant {
    constructor(centerX, centerY, gridLeft, gridBottom) {
        // centerX and centerY are the origin coordinates of the quadrant
        this.centerX = centerX;
        this.centerY = centerY;
        this.gridLeft = gridLeft;
        this.gridBottom = gridBottom;
        this.boundingBoxRange = [
            [this.centerX - (this.gridLeft), this.centerY + (this.gridBottom)],
            [this.centerX + (this.gridLeft), this.centerY + (this.gridBottom)],
            [this.centerX + (this.gridLeft), this.centerY - (this.gridBottom)],
            [this.centerX - (this.gridLeft), this.centerY - (this.gridBottom)],
        ];
    }

    setBoundingBox(boundingBox) {
        this.boundingBoxRange = [
            [boundingBox.max.x, boundingBox.max.y],
            [boundingBox.max.x, boundingBox.min.y],
            [boundingBox.min.x, boundingBox.min.y],
            [boundingBox.min.x, boundingBox.max.y],
        ];
    }

    contains(object) {
        if (object.get2DVertices().length < 3) {
            // console.error("Object has less than 3 vertices",object);
            return false;
        }
        return (isIntersecting(this.boundingBoxRange, object.get2DVertices()) ||
            checkPolygonInsidePolygon(object.get2DVertices(), this.boundingBoxRange));
    }

    intersects(range) {
        return (isIntersecting(this.boundingBoxRange, range) ||
            checkPolygonInsidePolygon(range, this.boundingBoxRange));
    }
}

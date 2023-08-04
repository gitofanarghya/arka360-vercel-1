import * as THREE from 'three';
import { createMesh } from '../utils/meshUtils';

export default class DropDownTool {
    constructor(x, y, object) {
        // standard norms

        this.belongsTo = object;
        this.objectsGroup = this.belongsTo.toolGroup;
        this.objectsGroup.container = this;

        // this connects it back to the tsl object class

        const invertedTriangle = new THREE.Shape();
        invertedTriangle.moveTo(x, y);
        invertedTriangle.lineTo(x - 5, y - 10);
        invertedTriangle.lineTo(x - 10, y);

        const geometry = new THREE.ShapeGeometry(invertedTriangle);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.dropDownMesh = createMesh(geometry, material);
        this.dropDownMesh.position.setZ(10);
        this.objectsGroup.add(this.dropDownMesh);
        this.objectsGroup.name = 'drop down tool';
    }
}

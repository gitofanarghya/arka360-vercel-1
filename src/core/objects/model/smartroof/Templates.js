import * as THREE from 'three';

export default class Templates {
    constructor(type) {
        this.type = type;
        this.vertices = [];
        this.movementEdge = [];
        // this.height = parent.coreHeight;
        // this.tilt = parent.tilt;
        this.deletedFacesEdge = [];
        this.createTemplate();
    }

    createTemplate() {
        switch (this.type) {
        case 'GabledDormer':
            {
                this.vertices.push(new THREE.Vector3(0, 0, 5),new THREE.Vector3(0, 5, 5),new THREE.Vector3(2.5, 7.5, 5),new THREE.Vector3(5, 5, 5),new THREE.Vector3(5, 0, 5));
                this.deletedFacesEdge.push(1,2,4);
                this.movementEdge.push([0,3]);
            }
            break;
        case 'HippedDormer':
            {
                this.vertices.push(new THREE.Vector3(0, 0, 5),new THREE.Vector3(0, 5, 5),new THREE.Vector3(2.5, 7.5, 5),new THREE.Vector3(5, 5, 5),new THREE.Vector3(5, 0, 5));
                this.deletedFacesEdge.push(1,2);
                this.movementEdge.push([0,3]);
            }
            break;

        case 'FlatDormer':
            {
                this.vertices.push(new THREE.Vector3(0, 0, 5),new THREE.Vector3(0, 5, 5),new THREE.Vector3(5, 5, 5),new THREE.Vector3(5, 0, 5));
                this.deletedFacesEdge.push(0,2,1);
                this.movementEdge.push([0,2]);
            }
            break;
        default:
            console.error('No valid template passed');
        }
    }

}
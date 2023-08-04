import * as THREE from 'three';

/**
 *
 * @param {Array} vertices
 * @returns
 */
export default function createBufferGeometry(vertices = []) {
    const geometry = new THREE.BufferGeometry();

    geometry.setFromPoints(vertices);

    return geometry;
}

export function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    return mesh;
}

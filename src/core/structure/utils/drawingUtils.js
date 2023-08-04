import * as THREE from 'three';

import { DRAWING_CONSTANTS } from '../constants';

export function getEdgeMaterial() {
    return new THREE.LineBasicMaterial({
        color: DRAWING_CONSTANTS.EDGES_COLOR,
        linewidth: DRAWING_CONSTANTS.EDGES_LINE_WIDTH,
    });
}

export function getMeshMaterial(color, imageURL) {
    const material = new THREE.MeshLambertMaterial({
        color,
    });
    material.defines = material.defines || {};
    material.defines.CUSTOM = '';
    const loader = new THREE.TextureLoader();
    loader.load(
        imageURL,
        (texture) => {
            material.color = 0x000000;
            material.map = texture;
            material.needsUpdate = true;
        },
        undefined,
        () => {
            console.warn('Error in loading textures');
        },
    );

    return material;
}

export function drawLine(point1, point2, { length, width }, { color, textureURL }, globalRotationY = 0) {
    const mat = getMeshMaterial(color, textureURL);

    const shapeVectors = [
        new THREE.Vector2(-width / 2, length / 2),
        new THREE.Vector2(width / 2, length / 2),
        new THREE.Vector2(width / 2, -length / 2),
        new THREE.Vector2(-width / 2, -length / 2),
    ];
    for (let i = 0; i < shapeVectors.length; i += 1) {
        shapeVectors[i].rotateAround(new THREE.Vector3(), globalRotationY);
    }

    const shape = new THREE.Shape();
    shape.moveTo(
        shapeVectors[shapeVectors.length - 1].x,
        shapeVectors[shapeVectors.length - 1].y,
    );
    for (let i = 0; i < shapeVectors.length; i += 1) {
        shape.lineTo(shapeVectors[i].x, shapeVectors[i].y);
    }

    const curve = new THREE.LineCurve3(point1, point2);
    const geom = new THREE.ExtrudeGeometry(shape, { extrudePath: curve });

    return new THREE.Mesh(geom, mat);
}

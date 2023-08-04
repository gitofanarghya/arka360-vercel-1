import * as THREE from 'three';
import { deg2Rad, rad2Deg } from '../../utils/utils';
import CylinderModel from './CylinderModel';
import PolygonModel from './PolygonModel';

export function getNormalsForTopAndBottomPlane(tilt, azimuth, parentTilt, parentAzimuth) {
    return [
        Math.sin(deg2Rad(parentTilt)) * Math.sin(deg2Rad(parentAzimuth)),
        Math.sin(deg2Rad(parentTilt)) * Math.cos(deg2Rad(parentAzimuth)),
        Math.cos(deg2Rad(parentTilt)),
        Math.sin(deg2Rad(tilt)) * Math.sin(deg2Rad(azimuth)),
        Math.sin(deg2Rad(tilt)) * Math.cos(deg2Rad(azimuth)),
        Math.cos(deg2Rad(tilt)),
    ];
}

export function getHeightDifferenceBetweenTopAndBottomPlane(
    parentTilt,
    parentAzimuth,
    tilt,
    azimuth,
    vertices,
) {
    // Get height difference between top and bottom surface
    const [a1, b1, c1, a2, b2, c2] =
        getNormalsForTopAndBottomPlane(tilt, azimuth, parentTilt, parentAzimuth);

    const heightDiffs = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const v = vertices[i];
        heightDiffs.push((((a1 * v.x) + (b1 * v.y)) / c1) - (((a2 * v.x) + (b2 * v.y)) / c2));
    }

    return heightDiffs;
}

export function computeTopHeight(
    parentTilt,
    parentAzimuth,
    tilt,
    azimuth,
    vertices,
    coreHeight,
) {
    const heightDiffs = getHeightDifferenceBetweenTopAndBottomPlane(
        parentTilt,
        parentAzimuth,
        tilt,
        azimuth,
        vertices,
    );
    return parseFloat((-Math.min(...heightDiffs) + Number(coreHeight) + Math.max(...heightDiffs))
        .toFixed(3));
}

export function computeCoreHeight(
    parentTilt,
    parentAzimuth,
    tilt,
    azimuth,
    vertices,
    topHeight,
) {
    const heightDiffs = getHeightDifferenceBetweenTopAndBottomPlane(
        parentTilt,
        parentAzimuth,
        tilt,
        azimuth,
        vertices,
    );
    return parseFloat(((Number(topHeight) - Math.max(...heightDiffs)) + Math.min(...heightDiffs))
        .toFixed(3));
}

export function computeTilt(azimuth, coreHeight, topHeight, vertices, parent, other = false) {
    if (coreHeight > topHeight) {
        return null;
    }

    let tilt = other ? 89 : 1;
    const parentTilt = parent.getTilt();
    const parentAzimuth = parent.getAzimuth();

    // Get height difference between top and bottom surface
    const heightDiffs = getHeightDifferenceBetweenTopAndBottomPlane(
        parentTilt,
        parentAzimuth,
        tilt,
        azimuth,
        vertices,
    );

    // get vertex which should have smallest height, i.e. coreHeight
    const basePoint = vertices[heightDiffs.indexOf(Math.min(...heightDiffs))].clone();
    const topPoint = vertices[heightDiffs.indexOf(Math.max(...heightDiffs))].clone();

    if (parent instanceof CylinderModel || parent instanceof PolygonModel) {
        basePoint.z = parent.getZOnTopSurface(basePoint.x, basePoint.y) + coreHeight;
        topPoint.z = parent.getZOnTopSurface(topPoint.x, topPoint.y) + topHeight;
    }
    else {
        basePoint.z = coreHeight;
        topPoint.z = topHeight;
    }

    if (topPoint.z === basePoint.z) {
        tilt = 0;
    }
    else {
        const theta = deg2Rad(90 - azimuth);
        const iCap = Math.cos(theta);
        const jCap = Math.sin(theta);
        let kCap = (-1 / (topPoint.z - basePoint.z)) * ((iCap * (topPoint.x - basePoint.x)) +
            (jCap * (topPoint.y - basePoint.y)));
        kCap /= Math.sqrt((iCap ** 2) + (jCap ** 2) + (kCap ** 2));
        tilt = 90 - rad2Deg(Math.asin(kCap));
    }

    const tempHeightDiffs = getHeightDifferenceBetweenTopAndBottomPlane(
        parentTilt,
        parentAzimuth,
        tilt,
        azimuth,
        vertices,
    );

    const estimatedTopHeight =
        parseFloat((-Math.min(...tempHeightDiffs) + coreHeight + Math.max(...tempHeightDiffs)));

    if (!(Math.abs(topHeight - estimatedTopHeight) < 0.01) || tilt >= 90) {
        if (other) {
            return null;
        }
        tilt = computeTilt(azimuth, coreHeight, topHeight, vertices, parent, true);
    }

    return Number.isNaN(parseFloat(tilt)) ? null : parseFloat(tilt.toFixed(1));
}

export function getPlusBufferGeometry(position, size, zOffset = 0, getZOnTopSurfaceCb) {
    const nVertices = 4;
    const plusVertices = new Float32Array(nVertices * 3);

    plusVertices[0] = position.x;
    plusVertices[1] = position.y - (size / 2);
    plusVertices[2] = position.z + zOffset;

    plusVertices[3] = position.x;
    plusVertices[4] = position.y + (size / 2);
    plusVertices[5] = position.z + zOffset;

    plusVertices[6] = position.x - (size / 2);
    plusVertices[7] = position.y;
    plusVertices[8] = position.z + zOffset;

    plusVertices[9] = position.x + (size / 2);
    plusVertices[10] = position.y;
    plusVertices[11] = position.z + zOffset;


    if (getZOnTopSurfaceCb !== undefined) {
        for (let idx = 0; idx < nVertices; idx += 1) {
            plusVertices[(idx * 3) + 2] = getZOnTopSurfaceCb(
                plusVertices[(idx * 3) + 0],
                plusVertices[(idx * 3) + 1],
            )
            + zOffset;
        }
    }

    const plusGeometry = new THREE.BufferGeometry();
    plusGeometry.setAttribute('position', new THREE.BufferAttribute(plusVertices, 3));

    return plusGeometry;
}

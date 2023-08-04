/* eslint-disable camelcase */
import * as THREE from 'three';

export function getChildrenSequence(object) {
    const local = [];
    for (let i = 0; i < object.getChildren().length; i++) {
        local.push(object.getChildren()[i].id);
    }
    return local;
}

export function checkChildrenSequence(previouschildsequence,object) {
    let same = false;
    const currentchildsequence = [];
    if (previouschildsequence) {
        for (let i = 0; i < object.getChildren().length; i++) {
            currentchildsequence.push(object.children[i].id);
            if (previouschildsequence[i] != currentchildsequence[i]) {
                same = false;
                break;
            }
            else {
                same = true;
            }
        }
        if (!same) {
            const temp = object.children;
            temp.reverse();
            object.children = temp;
        }
    } else {
        const temp = object.children;
        temp.reverse();
        object.children = temp;
    }
}

export function getDistanceBetweenPointAndLine(point, edge) {
    const numerator = Math.abs((edge[1].x - edge[0].x) * (edge[0].y - point.y) - (edge[0].x - point.x) * (edge[1].y - edge[0].y));
    // eslint-disable-next-line no-restricted-properties
    const denominator = Math.sqrt(Math.pow(edge[1].x - edge[0].x, 2) + Math.pow(edge[1].y - edge[0].y, 2));
    return numerator / denominator;
}

export function findEigonPlane(points) {
    const n = points.length;
    const vSum = new THREE.Vector3();

    for (let i = 0, len = points.length; i < len; i += 1) {
        const point = points[i];
        vSum.x += point.x;
        vSum.y += point.y;
        vSum.z += point.z;
    }
    const centroid = vSum.divideScalar(n);
    // Calculate full 3x3 covariance matrix, excluding symmetries:
    let xx = 0;
    let xy = 0;
    let xz = 0;
    let yy = 0;
    let yz = 0;
    let zz = 0;

    for (let i = 0, len = points.length; i < len; i += 1) {
        const point = points[i];
        const r = new THREE.Vector3(
            point.x - centroid.x,
            point.y - centroid.y,
            point.z - centroid.z,
        );
        xx += r.x * r.x;
        xy += r.x * r.y;
        xz += r.x * r.z;
        yy += r.y * r.y;
        yz += r.y * r.z;
        zz += r.z * r.z;
    }
    xx /= n;
    xy /= n;
    xz /= n;
    yy /= n;
    yz /= n;
    zz /= n;

    const weighted_dir = new THREE.Vector3();

    const det_x = yy * zz - yz * yz;
    const axis_dir_x = new THREE.Vector3(
        det_x,
        xz * yz - xy * zz,
        xy * yz - xz * yy,
    );
    let weight_x = det_x * det_x;

    if (weighted_dir.dot(axis_dir_x) < 0) {
        weight_x = -weight_x;
    }
    weighted_dir.add(axis_dir_x.multiplyScalar(weight_x));

    const det_y = xx * zz - xz * xz;
    const axis_dir_y = new THREE.Vector3(
        xz * yz - xy * zz,
        det_y,
        xy * xz - yz * xx,
    );
    let weight_y = det_y * det_y;
    if (weighted_dir.dot(axis_dir_y) < 0) {
        weight_y = -weight_y;
    }
    weighted_dir.add(axis_dir_y.multiplyScalar(weight_y));

    const det_z = xx * yy - xy * xy;
    const axis_dir_z = new THREE.Vector3(
        xy * yz - xz * yy,
        xy * xz - yz * xx,
        det_z,
    );
    let weight_z = det_z * det_z;
    if (weighted_dir.dot(axis_dir_z) < 0) {
        weight_z = -weight_z;
    }
    weighted_dir.add(axis_dir_z.multiplyScalar(weight_z));
    const normal = weighted_dir.normalize();

    const eigonPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, centroid);

    return eigonPlane;
}

export function generatePlaneFromPoints(points) {
    const noisyPlane = findEigonPlane(points);
    const obstructionPoints = [];
    const noiseFreePoints = [];
    for (let i = 0, len = points.length; i < len; i += 1) {
        const distance = noisyPlane.distanceToPoint(points[i]);
        if (distance > 0.9) {
            obstructionPoints.push([points[i].x, points[i].y]);
        }
        else {
            noiseFreePoints.push(points[i]);
        }
    }
    const eigonPlane = findEigonPlane(noiseFreePoints);
    if (eigonPlane.normal.z > 0) {
        eigonPlane.negate();
    }
    const groundPlane = new THREE.Plane().setFromCoplanarPoints(
        new THREE.Vector3(1, 5, 0),
        new THREE.Vector3(2.9, 3.2, 0),
        new THREE.Vector3(3.5, 1, 0),
    );


    const angle = eigonPlane.normal.angleTo(groundPlane.normal) * 180 / Math.PI;

    return {
        angle: Number(angle.toFixed(3)),
        plane: eigonPlane,
        obstruction: obstructionPoints,
    };
}

function isInsideCircle(center, point, radius) {
    if (center.distanceTo(point) <= radius) {
        return true;
    }
    return false;
}

function getCenterOfPoints(points) {
    const center = new THREE.Vector2();
    points.forEach((point) => {
        center.add(point);
    });

    center.divideScalar(points.length);

    return center;
}

export function groupPoint(points) {
    let setOfPoints = points;
    const temp = points;

    const groups = [];

    while (temp.length > 0) {
        const innerGroup = [];
        let bool = true;
        let radius = 0.5;
        let center = temp[0];

        while (bool) {
            setOfPoints = [...temp];
            let counter = 0;
            for (let i = 0, len = setOfPoints.length; i < len; i += 1) {
                const point = setOfPoints[i];
                if (isInsideCircle(center, point, radius)) {
                    temp.splice(i + counter, 1);
                    counter -= 1;
                    innerGroup.push(point);
                    center = getCenterOfPoints(innerGroup);
                }
            }
            if (counter === 0 || temp.length === 0) {
                bool = false;
            }
            if (temp.length === 0) {
                bool = false;
            }
            radius += 0.5;
        }
        groups.push(innerGroup);
    }

    return groups;
}

/**
 *
 * @param {*} A Starting point.
 * @param {*} B Ending Point, point which gets extended.
 */
export function getExtendedLine(A, B) {
    const C = new THREE.Vector3();
    const length = 100; // random value of length to be extended from B
    const lenAB = A.distanceTo(B);
    C.x = B.x + (B.x - A.x) / lenAB * length;
    C.y = B.y + (B.y - A.y) / lenAB * length;

    const line = new THREE.Line3(A, C);

    return line;
}

import * as THREE from 'three';
import Table from '../objects/subArray/Table';
import * as utils from './utils';
import Ground from '../objects/ground/Ground';
import Tree from '../objects/model/Tree';

export function calculateZoomFromBoundingBox(
    boundingInformation,
    zoomBuffer,
    width,
    height,
    zoomLimit = {
        MAX_X: -1, MAX_Y: -1,
    },
) {
    const zoomX = width / (zoomBuffer.X * (boundingInformation.maxX - boundingInformation.minX));
    const zoomY = height / (zoomBuffer.Y * (boundingInformation.maxY - boundingInformation.minY));

    const zoomLimitX = (zoomLimit.MAX_X === -1) ? Infinity : width / zoomLimit.MAX_X;
    const zoomLimitY = (zoomLimit.MAX_Y === -1) ? Infinity : height / zoomLimit.MAX_Y;

    return Math.min(zoomX, zoomY, zoomLimitX, zoomLimitY);
}

export function getZoomLimit(object, config) {
    if (object instanceof Table) {
        return config.ZOOM_LIMITS[Table.getObjectType()];
    }
    return config.ZOOM_LIMITS.DEFAULT;
}

export function getZoomBuffer(object, config) {
    if (object instanceof Ground) {
        return config.ZOOM_BUFFER[Ground.getObjectType()];
    }
    return config.ZOOM_BUFFER.DEFAULT;
}

export function getBoundingInformationFromPoints(points) {
    let minX;
    let minY;
    let maxX;
    let maxY;
    for (let i = 0; i < points.length; i += 1) {
        if (minX === undefined || minX > points[i].x) {
            minX = points[i].x;
        }
        if (maxX === undefined || maxX < points[i].x) {
            maxX = points[i].x;
        }
        if (minY === undefined || minY > points[i].y) {
            minY = points[i].y;
        }
        if (maxY === undefined || maxY < points[i].y) {
            maxY = points[i].y;
        }
    }
    return {
        points: [
            new THREE.Vector3(minX, maxY, 0),
            new THREE.Vector3(maxX, maxY, 0),
            new THREE.Vector3(maxX, minY, 0),
            new THREE.Vector3(minX, minY, 0),
        ],
        minX,
        minY,
        maxX,
        maxY,
    };
}

export function getTargetPlane(cameraPosition, targetPosition) {
    const normal = new THREE.Vector3().copy(cameraPosition).sub(targetPosition);
    const point = (new THREE.Vector3()).copy(targetPosition);
    const plane = utils.getEquationOfPlane(normal, point);
    const distance = utils.getPlaneDistanceToOrigin(plane);
    normal.setLength(1);

    const threePlane = new THREE.Plane(normal, distance);

    return threePlane;
}

export function getZoomToObject(object, controls, { bufferX = 1, bufferY = 1 }) {
    const boundingInformation =
        getBoundingInformationFromPoints(utils.convertArrayToVector(object.get2DVertices()));
    return calculateZoomFromBoundingBox(
        boundingInformation,
        {
            X: bufferX,
            Y: bufferY,
        },
        controls.getCameraFrustumWidth(),
        controls.getCameraFrustumHeight(),
    );
}

export function getZoomInformationForQuickLook(stage, config, controls) {
    const selectedObjects = stage.selectionControls.getSelectedObjects();

    const zoomBuffer = getZoomBuffer(selectedObjects[0], config);

    const zoomLimit = getZoomLimit(
        selectedObjects[0],
        config,
    );

    // Calculate bounding box of all objects
    const allPoints = [];
    for (let i = 0; i < selectedObjects.length; i += 1) {
        if (selectedObjects[i].get2DVertices !== undefined) {
            // TODO: Refactor This.
            if (selectedObjects[i] instanceof Tree) {
                allPoints.push(...selectedObjects[i].get2DCrownVertices());
            }
            else {
                allPoints.push(...selectedObjects[i].get2DVertices());
            }
        }
    }
    if (allPoints.length === 0) {
        return null;
    }

    const boundingInformation =
        getBoundingInformationFromPoints(utils.convertArrayToVector(allPoints));

    // Calculate the new zoom and position to move the camera to
    const zoom = calculateZoomFromBoundingBox(
        boundingInformation,
        zoomBuffer,
        controls.getCameraFrustumWidth(),
        controls.getCameraFrustumHeight(),
        zoomLimit,
    );
    const centroid = utils.getCentroidOfPoints(boundingInformation.points);

    return {
        centroid,
        zoom,
    };
}

export function getCenterClientValues(stage) {
    const normalizedCoords = new THREE.Vector3();
    normalizedCoords.x = stage.screenDimensions.left + (stage.screenDimensions.width / 2);
    normalizedCoords.y = stage.screenDimensions.top + (stage.screenDimensions.height / 2);
    normalizedCoords.z = 0;

    return normalizedCoords;
}

export function getZoomAndCentroidForAllObjects(stage) {
    const allModels = utils.getAllChildren(stage.ground);
    const allModelVertices = [];
    for (let i = 0; i < allModels.length; i += 1) {
        allModelVertices.push(...allModels[i].get2DVertices());
    }
    const boundingBox = utils.getBoundingBox(allModelVertices);
    const zoom = calculateZoomFromBoundingBox(
        {
            minX: boundingBox.min.x,
            maxX: boundingBox.max.x,
            minY: boundingBox.min.y,
            maxY: boundingBox.max.y,
        },
        {
            X: 1.1, Y: 1.1,
        },
        stage.controlsManager.get2DControls().getCameraFrustumWidth(),
        stage.controlsManager.get2DControls().getCameraFrustumHeight(),
    );

    return [
        zoom,
        utils.getCentroidOfPoints([
            boundingBox.min,
            boundingBox.max,
        ]),
    ];
}

/* eslint-disable no-mixed-operators */
/* eslint-disable no-use-before-define */
import * as constants from '../constants';
import * as THREE from "three";
import { convertArrayToVector, deg2Rad, getMidpoint, setbackPolygon } from '../../utils/utils';
import Ground from '../../objects/ground/Ground';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import arkaGazeboRoofTexture from '../../../assets/img/arkaGazeboRoofTexture.jpeg';


function createArkaGazebo9x5(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    legs,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    const angle = subarrayDetails.azimuth;

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });
            const pivot1 = new THREE.Object3D();
            const gltfloader = new GLTFLoader();
            gltfloader.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Rear+Post-+Artwork.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(22, 22, 22);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    pivot1.position.set(boundingBoxes[i][j][0].x, boundingBoxes[i][j][0].y, boundingBoxes[i][j][0].z);
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    let pivot2 = pivot1.clone();
                    let model2 = model1.clone();
                    pivot2.position.set(boundingBoxes[i][j][1].x, boundingBoxes[i][j][1].y, boundingBoxes[i][j][1].z);
                    model1.position.set(-0.06, 0, -2.8);
                    model2.position.set(-0.06, -0.4, -2.8);
                    pivot1.add(model1);
                    pivot2.add(model2);
                    objectsGroup.add(pivot1, pivot2);
                },
            );
        }
    }
    createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angle);
}

function createArkaGazebo4x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    legs,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    let angle = subarrayDetails.azimuth;

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });
            const pivot1 = new THREE.Object3D();
            const gltfloader = new GLTFLoader();
            gltfloader.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Rear+Post-+Artwork.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(22, 22, 22);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    pivot1.position.set(boundingBoxes[i][j][0].x, boundingBoxes[i][j][0].y, boundingBoxes[i][j][0].z);
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    let pivot2 = pivot1.clone();
                    let model2 = model1.clone();
                    pivot2.position.set(boundingBoxes[i][j][1].x, boundingBoxes[i][j][1].y, boundingBoxes[i][j][1].z);
                    model1.position.set(-0.03, 0, -2.8);
                    model2.position.set(-0.03, -0.4, -2.8);
                    pivot1.add(model1);
                    pivot2.add(model2);
                    objectsGroup.add(pivot1, pivot2);
                },
            );
        }
    }
    createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angle);
}

function createArkaGazebo5x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    legs,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    let angle = subarrayDetails.azimuth;

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });
            const pivot1 = new THREE.Object3D();
            const gltfloader = new GLTFLoader();
            gltfloader.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Rear+Post-+Artwork.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(22, 22, 22);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    pivot1.position.set(boundingBoxes[i][j][0].x, boundingBoxes[i][j][0].y, boundingBoxes[i][j][0].z);
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    let pivot2 = pivot1.clone();
                    let model2 = model1.clone();
                    pivot2.position.set(boundingBoxes[i][j][1].x, boundingBoxes[i][j][1].y, boundingBoxes[i][j][1].z);
                    model1.position.set(-0.06, 0, -2.8);
                    model2.position.set(-0.06, -0.4, -2.8);
                    pivot1.add(model1);
                    pivot2.add(model2);
                    objectsGroup.add(pivot1, pivot2);
                },
            );
        }
    }
    createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angle);
}

function createArkaGazebo6x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    legs,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    let angle = subarrayDetails.azimuth;
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });
            const pivot1 = new THREE.Object3D();
            const gltfloader = new GLTFLoader();
            gltfloader.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Rear+Post-+Artwork.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(22, 22, 22);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    pivot1.position.set(boundingBoxes[i][j][0].x, boundingBoxes[i][j][0].y, boundingBoxes[i][j][0].z);
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    let pivot2 = pivot1.clone();
                    let model2 = model1.clone();
                    pivot2.position.set(boundingBoxes[i][j][1].x, boundingBoxes[i][j][1].y, boundingBoxes[i][j][1].z);
                    model1.position.set(-0.06, 0, -2.8);
                    model2.position.set(-0.06, -0.4, -2.8);
                    pivot1.add(model1);
                    pivot2.add(model2);
                    objectsGroup.add(pivot1, pivot2);
                },
            );
        }
    }
    createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angle);
}

function createArkaGazebo7x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    legs,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    let angle = subarrayDetails.azimuth;
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });
            const pivot1 = new THREE.Object3D();
            const gltfloader = new GLTFLoader();
            gltfloader.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Rear+Post-+Artwork.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(22, 22, 22);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    pivot1.position.set(boundingBoxes[i][j][0].x, boundingBoxes[i][j][0].y, boundingBoxes[i][j][0].z);
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    let pivot2 = pivot1.clone();
                    let model2 = model1.clone();
                    pivot2.position.set(boundingBoxes[i][j][1].x, boundingBoxes[i][j][1].y, boundingBoxes[i][j][1].z);
                    model1.position.set(-0.08, 0, -2.8);
                    model2.position.set(-0.08, -0.4, -2.8);
                    pivot1.add(model1);
                    pivot2.add(model2);
                    objectsGroup.add(pivot1, pivot2);
                },
            );
        }
    }
    createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angle);
}

/**
 *
 * this function creates the gazebo Submodels like Legs, Roof and Ground Deck, Covers, Footings  
 *  depending on the parameters such as :
 *  --> the number of rows, legs, azimuth, height which are passed
 *  from the respective gazebo Model Creation Functions.
 * @param {*} rows
 * @param {*} params
 * @param {Number} boundingBoxes
 * @param {String} objectsGroup
 * @param {Number} legs
 * @param {Number} angleDeg
 */

function createArkaGazebo(rows, params, boundingBoxes, objectsGroup, legs, angleDeg) {
    let requiredHeightFromGround;
    if (rows[0].getParent().getParent() instanceof Ground) {
        requiredHeightFromGround = 0;
    }
    else {
        requiredHeightFromGround = rows[0].getParent().getParent().coreHeight + rows[0].getParent().getParent().baseHeight;
    }

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const deckDimensions = getDeckLengthAndWidth(boundingBoxes[i][j], false);
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
                rearPostPositions: [],
                frontPostPositions: [],
                rearPostLength: row.getParent().mountHeight + (((deckDimensions.length) * (Math.sin(deg2Rad(row.getParent().tilt)))) - 0.3175),
                frontPostLength: row.getParent().mountHeight - 0.3175,
                requiredHeightFromGround,
                deckDimensions,
                connectorHeight: 0,
            });
            const p1 = [];
            for (let k = 0; k < params.boundingBox.length; k += 1) {
                p1.push(params.boundingBox[k]);
            }
            const midPointForGround = getPositionForGroundDeck(
                params.boundingBox[0],
                params.boundingBox[2],
            );
            createGroundDeck(
                objectsGroup,
                midPointForGround,
                params.boundingBox,
                angleDeg,
                requiredHeightFromGround,
            );
            createRoofDeck(params, midPointForGround);
            for (let k = 0; k < p1.length / 2; k += 1) {
                createRearPosts(
                    objectsGroup,
                    k,
                    midPointForGround,
                    params,
                    angleDeg,
                    requiredHeightFromGround,
                );
            }
            createFrontPosts(
                objectsGroup,
                params,
                angleDeg,
                midPointForGround,
                requiredHeightFromGround,
            );
            createMiddleSupportingLegs(params, legs);
        }
    }
}

/**
 *
 * this function returns the gazebo Front Leg positions
 *  --> angle / tilt of the post and height
 * @param {*} objectsGroup
 * @param {*} params
 * @param {Number} angle
 * @param {Number} center
 * @param {Number} requiredHeightFromGround
 */

function createFrontPosts(objectsGroup, params, angle, center, requiredHeightFromGround) {

    let connectorPositionForLegs = [];

    const frontLegPillar1 = createFrontPostLegs(params, angle, params.boundingBox[3], params.boundingBox[0], 0.08, center, requiredHeightFromGround);
    connectorPositionForLegs.push(frontLegPillar1[1]);
    const frontLegPillar3 = createFrontPostLegs(params, angle, params.boundingBox[3], params.boundingBox[0], -0.03, center, requiredHeightFromGround);
    connectorPositionForLegs.push(frontLegPillar3[1]);
    const frontLegPillar2 = createFrontPostLegs(params, angle, params.boundingBox[2], params.boundingBox[1], 0.08, center, requiredHeightFromGround);
    connectorPositionForLegs.push(frontLegPillar2[1]);
    const frontLegPillar4 = createFrontPostLegs(params, angle, params.boundingBox[2], params.boundingBox[1], -0.03, center, requiredHeightFromGround);
    connectorPositionForLegs.push(frontLegPillar4[1]);

    connectorPositionForLegs = convertArrayToVector(connectorPositionForLegs);
    for (let i = 0; i < connectorPositionForLegs.length - 1; i += 2) {
        getFootingsForFrontLeg(
            connectorPositionForLegs[i],
            connectorPositionForLegs[i + 1],
            objectsGroup,
            angle,
            requiredHeightFromGround,
        );
        drawFrontPostConnectors(
            params,
            connectorPositionForLegs[i],
            connectorPositionForLegs[i + 1],
        );
    }
    objectsGroup.add(
        frontLegPillar1[0],
        frontLegPillar2[0],
        frontLegPillar3[0],
        frontLegPillar4[0],
    );
    params.frontPostPositions.push(
        frontLegPillar1[0].position,
        frontLegPillar2[0].position,
        frontLegPillar3[0].position,
        frontLegPillar4[0].position,
    );
}

/**
 * this function creates the Mesh for the front post
 * @param {*} params has the length of the post
 * @returns front Post Mesh
 */

function drawFrontPostMesh(params) {
    const frontPostLegMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const frontPostLegGeometry = new THREE.BoxGeometry(0.08, 0.08, params.frontPostLength);
    return new THREE.Mesh(frontPostLegGeometry, frontPostLegMaterial);
}

/**
 *
 * this function creates the gazebo Front Legs depending on the parameters :
 *  --> angle / tilt of the post and height
 * @param {*} objectsGroup
 * @param {*} params
 * @param {Number} angle
 * @param {Number} center
 * @param {Number} requiredHeightFromGround
 */

function createFrontPostLegs(params, angle, pos1, pos2, delta, center, requiredHeightFromGround) {
    let frontLegPillarPositions = [];
    const frontPostLegMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const frontPostLegGeometry = new THREE.BoxGeometry(0.08, 0.08, params.frontPostLength);
    const frontPostLegMesh1 = new THREE.Mesh(frontPostLegGeometry, frontPostLegMaterial);
    let pointFor1stPost = getPointWithDeltaToAPoint(pos1, pos2, delta);
    pointFor1stPost = new THREE.Vector3(pointFor1stPost.x, pointFor1stPost.y, pointFor1stPost.z);
    pointFor1stPost = getPointWithDeltaToAPoint(pointFor1stPost, center, 0.2);
    frontLegPillarPositions = pointFor1stPost;
    frontPostLegMesh1.position.set(
        pointFor1stPost.x,
        pointFor1stPost.y,
        ((pointFor1stPost.z + requiredHeightFromGround) / 2) - 0.1,
    );
    frontPostLegMesh1.rotateZ(Math.PI - (angle * (Math.PI / 180)));
    frontPostLegMesh1.rotateX(Math.PI + (constants.ARKA_GAZEBO_FRONT_POST_TILT * (Math.PI / 180)));
    params.connectorHeight = frontLegPillarPositions.z;
    return [frontPostLegMesh1, frontLegPillarPositions];
}

/**
 * this function creates the Mesh for the rear post
 * @param {*} params has the length of the post
 * @returns rear Post Mesh
 */

function drawRearPostMesh(params) {
    const rearPostGeometry = new THREE.BoxGeometry(0.1, 0.1, params.rearPostLength);
    const rearPostMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    return (new THREE.Mesh(rearPostGeometry, rearPostMaterial));
}

/**
 * returns the triangular footing mesh for the rear Post
 * @returns the traingular Footing Mesh
 */

function createTiltedSquareMesh() {
    const traingularFootingGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.01);
    const traingularFootingMaterial = new THREE.MeshBasicMaterial({ color: 0x28282B });
    const traingularFootingMesh = new THREE.Mesh(
        traingularFootingGeometry,
        traingularFootingMaterial,
    );
    return traingularFootingMesh;
}

/**
 * creates trinagular Footings for the rear Post
 * @param {Number} pos for footing position
 * @param {*} params for the height of the footing from ground
 */

function createTraingularFootings(pos, params) {
    const traingularFootingMesh1 = createTiltedSquareMesh();
    const traingularFootingMesh2 = createTiltedSquareMesh();
    traingularFootingMesh1.position.set(pos.x, pos.y, params.requiredHeightFromGround);
    traingularFootingMesh1.rotateX(Math.PI - (90 * (Math.PI / 180)));
    traingularFootingMesh1.rotateY(Math.PI - (90 * (Math.PI / 180)));
    traingularFootingMesh1.rotateZ(Math.PI - (45 * (Math.PI / 180)));
    traingularFootingMesh2.position.set(pos.x, pos.y, params.requiredHeightFromGround);
    traingularFootingMesh2.rotateX(Math.PI - (90 * (Math.PI / 180)));
    traingularFootingMesh2.rotateZ(Math.PI - (45 * (Math.PI / 180)));
    params.objectsGroup.add(traingularFootingMesh1, traingularFootingMesh2);
    const clippingPlane = new THREE.Plane().setFromCoplanarPoints(
        new THREE.Vector3(1, 0.05 + params.requiredHeightFromGround, 1),
        new THREE.Vector3(2, 0.05 + params.requiredHeightFromGround, 1),
        new THREE.Vector3(1, 0.05 + params.requiredHeightFromGround, 2),
    );
    clippingPlane.negate();
    traingularFootingMesh1.material.clippingPlanes = [clippingPlane];
    traingularFootingMesh2.material.clippingPlanes = [clippingPlane];
}

/**
 * creates the rearPost with all the parameters below :
 * @param {*} objectsGroup
 * @param {Number} k index of rear Post
 * @param {Number} midPointForGround
 * @param {*} params
 * @param {Number} azimuthAngle
 * @param {Number} requiredHeightFromGround
 */

function createRearPosts(objectsGroup, k, midPointForGround, params, azimuthAngle, requiredHeightFromGround) {
    const rearPostGeometry = new THREE.BoxGeometry(0.1, 0.1, params.rearPostLength);
    const rearPostMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const rearPostMesh = new THREE.Mesh(rearPostGeometry, rearPostMaterial);
    objectsGroup.add(rearPostMesh);
    const pointForRearPostAlignment = getPointWithDeltaToAPoint(
        params.boundingBox[k],
        midPointForGround,
        0.25,
    );
    rearPostMesh.position.set(
        pointForRearPostAlignment.x,
        pointForRearPostAlignment.y,
        ((pointForRearPostAlignment.z / 2) + (requiredHeightFromGround / 2)) - 0.1,
    );
    const pointForRearLegs = pointForRearPostAlignment;
    params.rearPostPositions.push(rearPostMesh.position);
    getFootingsForRearLegs(pointForRearLegs, objectsGroup, azimuthAngle, requiredHeightFromGround);
    createTraingularFootings(rearPostMesh.position, params);
}

/**
 * function to create the ground Deck for the gazebo with azimuth
 * @param {*} params
 * @param {*} groundDeckPosition
 */

function createGroundDeck(objectsGroup, groundDeckPosition, BBox, angle, requiredHeightFromGround) {
    const deckDimensions = getDeckLengthAndWidth(BBox, true);
    const groundDeckGeometry = new THREE.BoxGeometry(
        deckDimensions.width,
        deckDimensions.length,
        0.100,
    );
    const groundDeckMaterial = new THREE.MeshBasicMaterial({ color: 0x855E42 });
    const groundDeckMesh = new THREE.Mesh(groundDeckGeometry, groundDeckMaterial);
    objectsGroup.add(groundDeckMesh);
    if (angle) {
        groundDeckMesh.rotateZ(Math.PI - (angle * (Math.PI / 180)));
    }
    groundDeckMesh.position.set(
        groundDeckPosition.x,
        groundDeckPosition.y,
        requiredHeightFromGround,
    );
}

/**
 * function to create the roof Deck for the gazebo with tilt, azimuth. and underDeck texture
 * @param {*} params
 * @param {*} groundDeckPosition
 */

function createRoofDeck(params, groundDeckPosition) {
    const loader = new THREE.TextureLoader();
    const roofDeckMaterial = [
        new THREE.MeshPhongMaterial({ color: 0x71797E }),
        new THREE.MeshPhongMaterial({ color: 0x71797E }),
        new THREE.MeshPhongMaterial({ color: 0x71797E }),
        new THREE.MeshPhongMaterial({ color: 0x71797E }),
        new THREE.MeshPhongMaterial({ color: 0x71797E }),
        new THREE.MeshPhongMaterial({ map: loader.load(arkaGazeboRoofTexture) }),
    ];
    // new THREE.MeshPhongMaterial({ color: 0x855E42 }),
    const deckDimensions = getDeckLengthAndWidth(params.boundingBox, false);
    const roofDeckGeometry = new THREE.BoxGeometry(
        deckDimensions.width,
        deckDimensions.length,
        0.24,
    );
    const roofDeckMesh = new THREE.Mesh(roofDeckGeometry, roofDeckMaterial);
    params.objectsGroup.add(roofDeckMesh);
    roofDeckMesh.position.set(
        groundDeckPosition.x,
        groundDeckPosition.y,
        groundDeckPosition.z - 0.16,
    );
    if (params.row.getParent().azimuth !== undefined) {
        roofDeckMesh.rotateZ(Math.PI - (params.row.getParent().azimuth * (Math.PI / 180)));
    }
    roofDeckMesh.rotateX((params.row.getParent().tilt * (Math.PI / 180)));
    createSideCoversForTheRoof(params, deckDimensions);
    getPointsForRoofDeckCover(params.boundingBox);
}

/**
 * function to create the Mesh for covers
 * @param {Number} deckDimensions
 * @param {Number} thickness
 * @param {Number} height
 * @returns the mesh for covers
 */

function getCoverMesh(deckDimensions, thickness, height) {
    const coverGeometry = new THREE.BoxGeometry(deckDimensions + 0.01, thickness, height + 0.08);
    const coverMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    return new THREE.Mesh(coverGeometry, coverMaterial);
}

function getPointsForLegs(point1, point2, noOfLegs) {
    const maxRatio = (noOfLegs / 2) + 1;
    const points = [];
    for (let i = 1; i <= (noOfLegs / 2); i++) {
        const x = (((i * point1.x) + ((maxRatio - i) * point2.x)) / maxRatio);
        const y = (((i * point1.y) + ((maxRatio - i) * point2.y)) / maxRatio);
        points.push(new THREE.Vector3(x, y, point1.z));
    }
    return points;
}

/**
 * function to create the middle legs equidistant from the both front and rear corner posts
 * @param {*} params
 * @param {Number} numberOfLegs no of middle legs required
 */

function createMiddleSupportingLegs(params, numberOfLegs) {
    const rearMidPostPoint = getPointsForLegs(
        params.rearPostPositions[0],
        params.rearPostPositions[1],
        numberOfLegs,
    );
    const frontMidPostPoint = getPointsForLegs(
        params.frontPostPositions[0],
        params.frontPostPositions[1],
        numberOfLegs,
    );
    frontMidPostPoint.push(...getPointsForLegs(
        params.frontPostPositions[2],
        params.frontPostPositions[3],
        numberOfLegs,
    ));
    for (let i = 0; i < rearMidPostPoint.length; i++) {
        const rearPostMesh = drawRearPostMesh(params);
        rearPostMesh.position.set(
            rearMidPostPoint[i].x,
            rearMidPostPoint[i].y,
            rearMidPostPoint[i].z,
        );
        params.objectsGroup.add(rearPostMesh);
        getFootingsForRearLegs(
            rearMidPostPoint[i],
            params.objectsGroup,
            params.row.getParent().azimuth,
            params.requiredHeightFromGround,
        );
        createTraingularFootings(rearPostMesh.position, params);
    }
    for (let i = 0; i < frontMidPostPoint.length; i++) {
        const frontPostMesh = drawFrontPostMesh(params);
        frontPostMesh.position.set(
            frontMidPostPoint[i].x,
            frontMidPostPoint[i].y,
            frontMidPostPoint[i].z,
        );
        frontPostMesh.rotateZ(Math.PI - (params.row.getParent().azimuth * (Math.PI / 180)));
        frontPostMesh.rotateX(Math.PI + (constants.ARKA_GAZEBO_FRONT_POST_TILT * (Math.PI / 180)));
        params.objectsGroup.add(frontPostMesh);
    }
    for (let i = 0; i < frontMidPostPoint.length / 2; i++) {
        getFootingsForFrontLeg(
            frontMidPostPoint[i],
            frontMidPostPoint[i + (frontMidPostPoint.length / 2)],
            params.objectsGroup,
            params.row.getParent().azimuth,
            params.requiredHeightFromGround,
        );
        drawFrontPostConnectors(
            params,
            frontMidPostPoint[i],
            frontMidPostPoint[i + (frontMidPostPoint.length / 2)],
        );
    }
}

/**
 * function to create the side boundary covering for the rood deck with measurements given
 * @param {*} params
 * @param {Number} deckDimensions dimensions of the roof deck
 */

function createSideCoversForTheRoof(params, deckDimensions) {
    const coverMeshRequiredPositions = getPointsForRoofDeckCover(params.boundingBox);
    const gazeboBBoxPointsForCovers = getGazeboBoundingBoxMidPoints(params.boundingBox);
    for (let i = 0; i < coverMeshRequiredPositions.length; i += 1) {
        let coverMesh1;
        if (i === 0) {
            coverMesh1 = getCoverMesh(deckDimensions.width + 0.05, 0.125, 0.24);
            coverMesh1.position.set(
                coverMeshRequiredPositions[i].x,
                coverMeshRequiredPositions[i].y,
                gazeboBBoxPointsForCovers[i].z - 0.11,
            );
            coverMesh1.rotateZ(-(params.row.getParent().azimuth * (Math.PI / 180)));
            coverMesh1.rotateX(-(params.row.getParent().tilt * (Math.PI / 180)));
        }
        if (i === 2) {
            coverMesh1 = getCoverMesh(deckDimensions.width + 0.05, 0.08, 0.24);
            coverMesh1.position.set(
                coverMeshRequiredPositions[i].x,
                coverMeshRequiredPositions[i].y,
                gazeboBBoxPointsForCovers[i].z - 0.13,
            );
            coverMesh1.rotateZ(-(params.row.getParent().azimuth * (Math.PI / 180)));
            coverMesh1.rotateX(-(params.row.getParent().tilt * (Math.PI / 180)));
        }
        if (i === 1) {
            coverMesh1 = getCoverMesh(deckDimensions.length + 0.05, 0.06, 0.24);
            coverMesh1.position.set(
                coverMeshRequiredPositions[i].x,
                coverMeshRequiredPositions[i].y,
                gazeboBBoxPointsForCovers[i].z - 0.12,
            );
            coverMesh1.rotateZ(-(params.row.getParent().azimuth * (Math.PI / 180)) + (Math.PI / 2));
            coverMesh1.rotateY((params.row.getParent().tilt * (Math.PI / 180)));
        }
        if (i === 3) {
            coverMesh1 = getCoverMesh(deckDimensions.length + 0.05, 0.08, 0.24);
            coverMesh1.position.set(
                coverMeshRequiredPositions[i].x,
                coverMeshRequiredPositions[i].y,
                gazeboBBoxPointsForCovers[i].z - 0.12,
            );
            coverMesh1.rotateZ(-(params.row.getParent().azimuth * (Math.PI / 180)) + (Math.PI / 2));
            coverMesh1.rotateY((params.row.getParent().tilt * (Math.PI / 180)));
        }
        params.objectsGroup.add(coverMesh1);
    }
}

/**
 * returns the midPoint of the front post as the reference position for the connectors
 * @param {Number} pointA midPoint of 1st front post
 * @param {Number} pointB midPoint of 2nd front post
 * @returns midPoint of the 1st front post & 2nd front post
 */

function getPointForFrontPostConnectors(pointA, pointB) {
    const midPointConnector = getMidpoint(pointA, pointB);
    return midPointConnector;
}

/**
 * function to create the mesh for the connectors of front post
 * @param {Number} length
 * @param {Number} width
 * @param {Number} height
 * @param {Number} azimuthAngle
 * @returns mesh for the connectors for the front post
 */

function getConnectorMesh(length, width, height, azimuthAngle) {
    const connectorGeometry = new THREE.BoxGeometry(length, width, height);
    const connectorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connectorMesh.rotateZ(Math.PI - (azimuthAngle * (Math.PI / 180)));
    return connectorMesh;
}

/**
 * function to create the connectors for the front Post
 * @param {*} params
 * @param {Number} pointA
 * @param {Number} pointB
 */

function drawFrontPostConnectors(params, pointA, pointB) {
    const azimuthAngle = params.row.parent.azimuth;
    const connectorPosition = getPointForFrontPostConnectors(pointA, pointB);
    const upperConnectorMesh = getConnectorMesh(0.08, 0.11, 0.1, azimuthAngle);
    const lowerConnectorMesh = getConnectorMesh(0.08, 0.11, 0.1, azimuthAngle);

    const heightMidPoint = (params.connectorHeight - params.requiredHeightFromGround) / 2;

    upperConnectorMesh.position.set(
        connectorPosition.x,
        connectorPosition.y,
        (heightMidPoint + (heightMidPoint / 2)) + params.requiredHeightFromGround,
    );

    lowerConnectorMesh.position.set(
        connectorPosition.x,
        connectorPosition.y,
        (heightMidPoint - (heightMidPoint / 2)) + params.requiredHeightFromGround,
    );
    params.objectsGroup.add(upperConnectorMesh, lowerConnectorMesh);
}

/**
 * function to calculate points for the roof Covers
 * @param {Number} BBoxPoints
 * @returns point as position for the roof Deck Covers
 */

function getPointsForRoofDeckCover(BBoxPoints) {
    const array2d = BBoxPoints.map((point) => {
        return [point.x, point.y, point.z];
    });
    const extendedVerticesTemp = setbackPolygon(array2d, 0.12);
    let extendedVertices = setbackPolygon(array2d, 0.04);
    extendedVertices[0] = extendedVerticesTemp[0];
    extendedVertices = convertArrayToVector(extendedVertices);
    const pointsForRoofDeckCover = [];
    for (let x = 0; x < extendedVertices.length - 1; x += 1) {
        pointsForRoofDeckCover.push(getMidpoint(
            extendedVertices[x],
            extendedVertices[x + 1],
        ));
    }
    pointsForRoofDeckCover.push(getMidpoint(
        extendedVertices[extendedVertices.length - 1],
        extendedVertices[0],
    ));
    return pointsForRoofDeckCover;
}
/**
 *  function to create and position front leg footing
 * @param {Number} pointA
 * @param {Number} pointB
 * @param {*} objectsGroup
 * @param {Number} azimuthAngle
 * @param {Number} requiredHeightFromGround
 */

function getFootingsForFrontLeg(pointA, pointB, objectsGroup, azimuthAngle, requiredHeightFromGround) {
    const connectorPosition = pointA;
    const connectorGeometry = new THREE.BoxGeometry(
        constants.ARKA_GAZEBO_FOOTING_LENGTH,
        constants.ARKA_GAZEBO_FOOTING_WIDTH,
        0.01,
    );
    const connectorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
    objectsGroup.add(connectorMesh);
    connectorMesh.position.set(
        connectorPosition.x,
        connectorPosition.y,
        (0.055 + requiredHeightFromGround),
    );
    connectorMesh.rotateZ(Math.PI - (azimuthAngle * (Math.PI / 180)));
}

/**
 * function to create and position the footings for te rear legs
 * @param {Number} rearPostCenterPoint footing point
 * @param {*} objectsGroup
 * @param {Number} azimuthAngle
 * @param {Number} requiredHeightFromGround
 */

function getFootingsForRearLegs(rearPostCenterPoint, objectsGroup, azimuthAngle, requiredHeightFromGround) {
    const connectorPosition = rearPostCenterPoint;
    const connectorGeometry = new THREE.BoxGeometry(
        constants.ARKA_GAZEBO_FOOTING_LENGTH,
        constants.ARKA_GAZEBO_FOOTING_WIDTH,
        0.01,
    );
    const connectorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
    objectsGroup.add(connectorMesh);
    connectorMesh.position.set(
        connectorPosition.x,
        connectorPosition.y,
        (0.055 + requiredHeightFromGround),
    );
    connectorMesh.rotateZ(Math.PI - (azimuthAngle * (Math.PI / 180)));
}

/**
 * function to return position of ground deck
 * @param {Number} BBoxPoint1
 * @param {Number} BBoxPoint2
 * @returns midpoint of diagonal of deck as center of the ground deck
 */

function getPositionForGroundDeck(BBoxPoint1, BBoxPoint2) {
    return getMidpoint(BBoxPoint1, BBoxPoint2);
}

/**
 * function to calculate length and width with offset of footings
 * @param {Number} BBox
 * @param {Boolean} isDeckTypeGround checks if the deck type is ground
 * @returns length and width of the Deck
 */

function getDeckLengthAndWidth(BBox, isDeckTypeGround) {
    const footingOffsetForDeckLength = 0.14;
    const footingOffsetForDeckWidth = 0.10;
    let length = 0;
    let width = 0;
    if (isDeckTypeGround) {
        length = BBox[1].distanceTo(BBox[2]) + footingOffsetForDeckLength;
        width = BBox[0].distanceTo(BBox[1]) + footingOffsetForDeckWidth;
    }
    else {
        length = BBox[1].distanceTo(BBox[2]) + (footingOffsetForDeckLength / 2);
        width = BBox[0].distanceTo(BBox[1]) + (footingOffsetForDeckLength / 2);
    }
    return { length, width };
}

/**
 *
 * @param {*} BBox boundingBox of the gazebo
 * @returns the midPoint of the bounding box edges.
 */

function getGazeboBoundingBoxMidPoints(BBox) {
    const gazeboBoundingBoxMidPoints = [];
    for (let x = 0; x < BBox.length - 1; x++) {
        gazeboBoundingBoxMidPoints.push(getMidpoint(BBox[x], BBox[x + 1]));
    }
    gazeboBoundingBoxMidPoints.push(getMidpoint(BBox[BBox.length - 1], BBox[0]));
    return gazeboBoundingBoxMidPoints;
}

/**
 * function to find a point with a delta to a point
 * @param {*} p1
 * @param {*} p2
 * @param {*} delta
 * @returns
 */

function getPointWithDeltaToAPoint(p1, p2, delta) {
    const distanceP1ToP2 = p1.distanceTo(p2);
    const ratio = delta / distanceP1ToP2;

    const requiredPoint = new THREE.Vector3(
        ((1 - ratio) * p1.x) + (ratio * p2.x),
        ((1 - ratio) * p1.y) + (ratio * p2.y),
        p1.z,
    );
    return requiredPoint;
}

export default {
    [constants.TEMPLATES.ARKAPERGOLA1.NAME]: (params, template) => {
        try { return createArkaGazebo9x5(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA2.NAME]: (params, template) => {
        try { return createArkaGazebo4x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA5X8.NAME]: (params, template) => {
        try { return createArkaGazebo5x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA6X8.NAME]: (params, template) => {
        try { return createArkaGazebo6x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA7X8.NAME]: (params, template) => {
        try { return createArkaGazebo7x8(...params, template); } catch (ex) { console.log(ex); }
    },
};
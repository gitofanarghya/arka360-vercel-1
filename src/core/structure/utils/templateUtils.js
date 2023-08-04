import {
    createRailings,
    createBlocks,
    createFootings,
    createLegs,
    createRafters,
    createPurlins,
    createBackCover,
    createClips,
    createBracings,
    createPillars,
    createPillarConnectors,
    createRodMesh,
    createLegConnector,
    createFrontBracings,
    createSideBracings,
} from './componentUtils';
import { computeNumberOfTablesInBoundingBox, isAnyBoundingBoxOutsideParentModel } from './mathUtils';
import * as constants from '../constants';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from "three";


function createPergolaStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };
    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });

            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createPergolaarkaStructure1(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };

    let angle = 180 - subarrayDetails.azimuth;
    angle = angle > 360 ? angle - 360 : angle;
    angle = 90 + angle;
    angle = angle > 360 ? angle - 360 : angle;

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
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Pergola1.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(1.05, 1.05, 1.05);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    const X = (boundingBoxes[i][j][0].x + boundingBoxes[i][j][2].x) / 2 ;
                    const Y = (boundingBoxes[i][j][0].y + boundingBoxes[i][j][2].y) / 2 ;
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(-Math.PI / 2 + (angle * (Math.PI / 180)));
                    pivot1.position.set(X, Y, 0);
                    pivot1.position.z = params.boundingBox[0].z - 3.16;
                    model1.position.set(-5, 9.44, -5);
                    pivot1.add(model1);
                    objectsGroup.add(pivot1);
                },
            );
        }
    }
}

function createPergolaarkaStructure2(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
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
            const gltfloader1 = new GLTFLoader();
            gltfloader1.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Gazebo-Convert+01.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(0.000925, 0.0009, 0.0008);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    const X = (boundingBoxes[i][j][0].x + boundingBoxes[i][j][2].x) / 2 ;
                    const Y = (boundingBoxes[i][j][0].y + boundingBoxes[i][j][2].y) / 2 ;
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    pivot1.position.set(X, Y, 0);
                    pivot1.position.z = params.boundingBox[0].z;
                    model1.position.set(-2.05, -2.5, -2.925);
                    pivot1.add(model1);
                    objectsGroup.add(pivot1);
                },
            );
        }
    }
}

function createPergolaarkaStructure6x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
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
            const gltfloader1 = new GLTFLoader();
            gltfloader1.load(
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Gazebo%2B6x8.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(0.925, 0.9, 0.8);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    const X = (boundingBoxes[i][j][0].x + boundingBoxes[i][j][2].x) / 2 ;
                    const Y = (boundingBoxes[i][j][0].y + boundingBoxes[i][j][2].y) / 2 ;
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    pivot1.position.set(X, Y, 0);
                    pivot1.position.z = params.boundingBox[0].z;
                    model1.position.set(-2.02, -3.62, -2.925);
                    pivot1.add(model1);
                    objectsGroup.add(pivot1);
                },
            );
        }
    }
}

function createPergolaarkaStructure5x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
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
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Gazebo+5x8.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(0.000925, 0.0009, 0.0008);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    const X = (boundingBoxes[i][j][0].x + boundingBoxes[i][j][2].x) / 2 ;
                    const Y = (boundingBoxes[i][j][0].y + boundingBoxes[i][j][2].y) / 2 ;
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    pivot1.position.set(X, Y, 0);
                    pivot1.position.z = params.boundingBox[0].z;
                    model1.position.set(-2.05, -3.05, -2.925);
                    pivot1.add(model1);
                    objectsGroup.add(pivot1);
                },
            );
        }
    }
}
function createPergolaarkaStructure7x8(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
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
                'https://design-studio-app-dae-files.s3.ap-south-1.amazonaws.com/Gazebo%2B7x8.glb',
                function (gltf) {
                    let model1 = gltf.scene;
                    model1.scale.set(0.925, 0.9, 0.8);
                    model1.name = "model" + i;
                    pivot1.name = "pivot" + i;
                    const X = (boundingBoxes[i][j][0].x + boundingBoxes[i][j][2].x) / 2 ;
                    const Y = (boundingBoxes[i][j][0].y + boundingBoxes[i][j][2].y) / 2 ;
                    model1.rotateX(Math.PI / 2);
                    model1.rotateY(Math.PI + Math.PI);
                    pivot1.rotateZ(Math.PI / 2 - (angle * (Math.PI / 180)));
                    pivot1.position.set(X, Y, 0);
                    pivot1.position.z = params.boundingBox[0].z;
                    model1.position.set(-2.02, -4.2, -2.925);
                    pivot1.add(model1);
                    objectsGroup.add(pivot1);
                },
            );
        }
    }
}

function createLowFoundationFixedTiltStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
            });

            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createDefaultFixedTiltStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            params = Object.assign(params, {
                boundingBox: boundingBoxes[i][j],
                row,
                footingCount: undefined,
            });

            params = Object.assign(
                params,
                createFootings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createFourMMSTwoLeg(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
        footingCount: {
            up: 2,
            wide: 2,
        },
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            try {
                params = Object.assign(params, {
                    boundingBox: boundingBoxes[i][j],
                    row,
                });

                params = Object.assign(
                    params,
                    createFootings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
            }
            catch (ex) {
                console.log(ex);
            }
        }
    }
}

function createFourMMSOneLeg(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
        footingCount: {
            up: 1,
            wide: 2,
        },
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            try {
                params = Object.assign(params, {
                    boundingBox: boundingBoxes[i][j],
                    row,
                });

                params = Object.assign(
                    params,
                    createFootings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createBracings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
            }
            catch (ex) {
                console.log(ex);
            }
        }
    }
}

async function createUNIRACStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        boundingBoxes,
        rows,
        drawRailings: false,
        subarrayParent: rows[0].getParent().getParent(),
    };

    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );
    params = Object.assign(
        params,
        await createBlocks(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );
}

function createGeneralBallastStructures(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        boundingBoxes,
        backLegsOnly: true,
        rows,
        drawFootings: false,
        subarrayParent: rows[0].getParent().getParent(),
    };

    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );
    params = Object.assign(
        params,
        createBlocks(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                subarrayDetails,
                boundingBoxes[i][j],
            );
            params = Object.assign(
                params,
                {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    footingCount: {
                        up: 2,
                        wide: (numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) + 1,
                    },
                },
            );


            params = Object.assign(
                params,
                createBackCover(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createClips(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createBallastType1(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        boundingBoxes,
        backLegsOnly: true,
        rows,
        drawFootings: false,
        drawRailings: false,
        subarrayParent: rows[0].getParent().getParent(),
        tiltedDistanceFromTop: 0,
    };

    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );
    params = Object.assign(
        params,
        createBlocks(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                subarrayDetails,
                boundingBoxes[i][j],
            );
            params = Object.assign(
                params,
                {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    footingCount: {
                        up: 2,
                        wide: (numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) * 2,
                    },
                },
            );

            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createBallastType2(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        boundingBoxes,
        backLegsOnly: true,
        rows,
        drawFootings: false,
        drawRailings: true,
        subarrayParent: rows[0].getParent().getParent(),
        tiltedDistanceFromTop: 0,
    };

    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );
    params = Object.assign(
        params,
        createBlocks(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (boundingBoxes[i]) {
            for (let j = 0; j < boundingBoxes[i].length; j += 1) {
                const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                    subarrayDetails,
                    boundingBoxes[i][j],
                );
                params = Object.assign(
                    params,
                    {
                        boundingBox: boundingBoxes[i][j],
                        row,
                        footingCount: {
                            up: 2,
                            wide: (numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) * 2,
                        },
                    },
                );
    
                params = Object.assign(
                    params,
                    createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
            }
        }
    }
}

function createBallastType3(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        boundingBoxes,
        backLegsOnly: true,
        rows,
        drawFootings: false,
        drawRailings: true,
        drawRailingSupport: true,
        // TODO: Jugaad
        drawLastBlock: false,
        subarrayParent: rows[0].getParent().getParent(),
        tiltedDistanceFromTop: 0,
    };
    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    params = Object.assign(
        params,
        createBlocks(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                subarrayDetails,
                boundingBoxes[i][j],
            );
            params = Object.assign(
                params,
                {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    footingCount: {
                        up: 2,
                        wide: (numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) * 2,
                    },
                },
            );

            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

function createGroundMountMMS(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        backLegsOnly: false,
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            try {
                params = Object.assign(params, {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    // TODO: Somewhat assuming a purlinSize??
                    purlinHeight: (structureDesignTemplate.PURLIN) ? structureDesignTemplate.PURLIN.SIZE.HEIGHT : 0,
                    rafterSize: structureDesignTemplate.RAFTER.HEIGHT,
                    tilt: subarrayDetails.tilt,
                    footingCount: {
                        up: 1,
                        wide: 4,
                    },
                });

                params = Object.assign(
                    params,
                    createFootings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
                params = Object.assign(
                    params,
                    createBracings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
                );
            }
            catch (ex) {
                console.log(ex);
            }
        }
    }
}

function createElevatedMMS(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    // if (isAnyBoundingBoxOutsideParentModel(boundingBoxes, rows[0].getParent().getParent())) {
    //     return;
    // }

    let params = {
        objectsGroup,
        boundingBoxes,
        rows,
        drawRailings: false,
        subarrayParent: rows[0].getParent().getParent(),
        railingCountFunction: (numberOfTablesInBoundingBox, subarrayDetails) => {
            return {
                up: 2,
                wide: ((numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) / 4) + 1,
            };
        },
        alignPillarToBottom: true,
    };

    params = Object.assign(
        params,
        createRailings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    params = Object.assign(
        params,
        createPillars(params, subarrayDetails, structureDesignTemplate, objectsGroup),
    );

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                subarrayDetails,
                boundingBoxes[i][j],
            );

            params = Object.assign(
                params,
                {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    legCount: {
                        up: 2,
                        wide: ((numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) / 4) + 1,
                    },
                    numberOfPillarConnectors: ((numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) / 4) + 1,
                },
            );

            params = Object.assign(
                params,
                createPillarConnectors(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
          
            // TODO: Legs
            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            // TODO: Rafters
            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            // TODO: RodMesh
            params = Object.assign(
                params,
                createRodMesh(params, subarrayDetails, structureDesignTemplate, objectsGroup)
            );
        }
    }
}

function createFixedTilt2500mm(
    rows,
    boundingBoxes,
    subarrayDetails,
    objectsGroup,
    structureDesignTemplate,
) {
    let params = {
        objectsGroup,
        subarrayParent: rows[0].getParent().getParent(),
    };

    for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        for (let j = 0; j < boundingBoxes[i].length; j += 1) {
            const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
                subarrayDetails,
                boundingBoxes[i][j],
            );

            params = Object.assign(
                params,
                {
                    boundingBox: boundingBoxes[i][j],
                    row,
                    legCount: {
                        up: 2,
                        wide: Math.ceil(((numberOfTablesInBoundingBox*subarrayDetails.tableSize.wide)/4)+1),
                    },
                    numberOfLegConnectors: Math.floor(((numberOfTablesInBoundingBox * subarrayDetails.tableSize.wide) / 4) + 1),
                },
            );

            params = Object.assign(
                params,
                createLegs(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createLegConnector(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createPurlins(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createRafters(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );

            params = Object.assign(
                params,
                createFrontBracings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
            params = Object.assign(
                params,
                createSideBracings(params, subarrayDetails, structureDesignTemplate, objectsGroup),
            );
        }
    }
}

export default{
    [constants.TEMPLATES.DEFAULT_FIXED_TILT.NAME]: (params, template) => {
        try { return createDefaultFixedTiltStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA1.NAME]: (params, template) => {
        try { return createPergolaarkaStructure1(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA5X8.NAME]: (params, template) => {
        try { return createPergolaarkaStructure5x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA7X8.NAME]: (params, template) => {
        try { return createPergolaarkaStructure7x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA2.NAME]: (params, template) => {
        try { return createPergolaarkaStructure2(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ARKAPERGOLA6X8.NAME]: (params, template) => {
        try { return createPergolaarkaStructure6x8(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.PERGOLA.NAME]: (params, template) => {
        try { return createPergolaStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.LOW_FOUNDATION_FIXED_TILT.NAME]: (params, template) => {
        try { return createLowFoundationFixedTiltStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.GENERAL_BALLAST.NAME]: (params, template) => {
        try { return createGeneralBallastStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.UNIRAC_RM_10.NAME]: (params, template) => {
        try { return createUNIRACStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.UNIRAC_RM_5.NAME]: (params, template) => {
        try { return createUNIRACStructures(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.BALLAST_TYPE_1.NAME]: (params, template) => {
        try { return createBallastType1(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.BALLAST_TYPE_2.NAME]: (params, template) => {
        try { return createBallastType2(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.BALLAST_TYPE_3.NAME]: (params, template) => {
        try { return createBallastType3(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.GROUND_MOUNT_MMS.NAME]: (params, template) => {
        try { return createGroundMountMMS(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.FOUR_MMS_ONE_LEG.NAME]: (params, template) => {
        try { return createFourMMSOneLeg(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.FOUR_MMS_TWO_LEG.NAME]: (params, template) => {
        try { return createFourMMSTwoLeg(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.ELEVATED_MMS.NAME]: (params, template) => {
        try { return createElevatedMMS(...params, template); } catch (ex) { console.log(ex); }
    },
    [constants.TEMPLATES.FIXED_TILT_2500mm.NAME]: (params, template) => {
        try { return createFixedTilt2500mm(...params, template); } catch (ex) { console.log(ex); }
    },
    // [constants.TEMPLATES.FIXED_TILT_1m_3MMS.NAME]: (params, template) => {
    //     try { return createFixedTilt1mtr3MMS(...params, template); } catch (ex) { console.log(ex); }
    // },
};

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as makerjs from 'makerjs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Ground from '../objects/ground/Ground';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import PolygonModel from "../objects/model/PolygonModel";
import CylinderModel from "../objects/model/CylinderModel";
import Subarray from "../objects/subArray/Subarray";
import Walkway from "../objects/model/Walkway";
import SafetyLine from "../objects/model/SafetyLine";
import Handrail from "../objects/model/Handrail";
import STLExporter from '../lib/STLExporter';
import ColladaExporter from '../lib/ColladaExporter';
import { CONVERTER_URL } from '../coreConstants';
import Tree from '../objects/model/Tree';
import Inverter from '../objects/ac/Inverter';
import DCDB from '../objects/ac/DCDB';
import ACDB from '../objects/ac/ACDB';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import Dormer from '../objects/model/smartroof/Dormer';
import Conduit from '../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import CombinerBox from '../objects/ac/CombinerBox';
import { EDIT_SETBACK_INSIDE } from '../coreConstants';
import { getSetBack, convertArrayToVector,getObstructionPointsChimney,getObstructionPointsAC, newBuffer, convertVectorToArray, getMeasurementText,getEdgeAngleWrtXaxis,getDimensionPositionFromEdge} from './utils';
import Property from '../objects/model/Property';
import TextBox from '../objects/subObjects/TextBox';
import Gazebo from '../lib/PowerGazebo';

// TODO: replace the ds with this function where ever
// getModles is used.
export function getAllModelType() {
    return {
        polygons: [],
        smartroofs: [],
        smartroofFaces: [],
        dormers: [],
        subArrays: [],
        cylinders: [],
        walkways: [],
        safetyline: [],
        trees: [],
        inverters: [],
        combinerBox: [],
        acdb: [],
        property: [],
        handrail: [],
        acCable: [],
        dcCable: [],
        dcdb: [],
        conduits: [],
        doubleConduit: [],
        doubleSeparateConduit: [],
        singleCableTray: [],
        doubleCableTray: [],
        DoubleSeparateCableTray: [],
        textbox: [],
    };
}

export function getModels(object, result) {
    const children = object.getChildren();
    for (let i = 0, len = children.length; i < len; i += 1) {
        if (children[i] instanceof PolygonModel) {
            result.polygons.push(children[i]);
            getModels(children[i], result);
        } else if (children[i] instanceof SmartroofModel) {
            result.smartroofs.push(children[i]);
            getModels(children[i], result);
        } else if (children[i] instanceof Dormer) {
            result.dormers.push(children[i]);
            getModels(children[i], result);
        } else if (children[i] instanceof SmartroofFace) {
            result.smartroofFaces.push(children[i]);
            getModels(children[i], result);
        } else if (children[i] instanceof CylinderModel) {
            result.cylinders.push(children[i]);
            getModels(children[i], result);
        } else if (children[i] instanceof Walkway) {
            if (children[i] instanceof SafetyLine) {
                result.safetyline.push(children[i]);
            } else {
                result.walkways.push(children[i]);
            }
        } else if (children[i] instanceof Handrail) {
            result.handrail.push(children[i]);
        } else if (children[i] instanceof Property) {
            result.property.push(children[i]);    
        } else if (children[i] instanceof Tree) {
            result.trees.push(children[i]);
        } else if (children[i] instanceof Inverter) {
            result.inverters.push(children[i]);
        } else if (children[i] instanceof CombinerBox) {
            result.combinerBox.push(children[i]);
        } else if (children[i] instanceof ACDB) {
            result.acdb.push(children[i]);
        } else if (children[i] instanceof AcCable) {
            result.acCable.push(children[i]);
        } else if (children[i] instanceof DcCable) {
            result.dcCable.push(children[i]);
        } else if (children[i] instanceof DCDB) {
            if (result.dcdb === undefined) {
                result.dcdb = [];
            }
            result.dcdb.push(children[i]);
        } else if (children[i] instanceof Subarray) {
            result.subArrays.push(children[i]);
        } else if (children[i] instanceof Conduit) {
            if (children[i] instanceof DoubleConduit) {
                result.doubleConduit.push(children[i]);
            } else if (children[i] instanceof DoubleSeparateConduit) {
                result.doubleSeparateConduit.push(children[i]);
            } else if (children[i] instanceof SingleCableTray) {
                result.singleCableTray.push(children[i]);
            } else if (children[i] instanceof DoubleCableTray) {
                result.doubleCableTray.push(children[i]);
            } else if (children[i] instanceof DoubleSeparateCableTray) {
                result.DoubleSeparateCableTray.push(children[i]);
            } else {
                result.conduits.push(children[i]);
            }
        } else if (children[i] instanceof TextBox) {
            result.textbox.push(children[i]);
        }
    }
}

export function getAllDoubleSeperteConduits(stage) {
    const result = getAllModelType();
    getModels(stage.ground, result);

    return result.doubleSeparateConduit;
}

/**
 * returns all the conduits in the scene
 * TODO: change name to all inverters
 */
export function getAllConduits(stage) {
    const result = getAllModelType();
    getModels(stage.ground, result);

    return result.conduits;
}

/**
 * returns all the inveters in the scene
 * TODO: change name to all inverters
 */
export function getInverters(stage) {
    let result = getAllModelType();
    getModels(stage.ground, result);

    return result.inverters;
}

export function getCombinerBox(stage) {
    let result = getAllModelType();
    getModels(stage.ground, result);
    return result.combinerBox;
}

export function getAllDCDBs(stage) {
    let result = getAllModelType();
    getModels(stage.ground, result);

    return result.dcdb;
}

export function getAllAcCables(stage) {
    let result = getAllModelType();
    getModels(stage.ground, result);

    return result.acCable;
}

export function getAllDcCables(stage) {
    let result = getAllModelType();
    getModels(stage.ground, result);

    return result.dcCable;
}



// TODO: Remove approximateCylinder option later
export function roofMapExporter(
    stage, { approximateCylinder } = { approximateCylinder: false }, { approximateTree } = { approximateTree: false },
) {
    const result = getAllModelType();
    getModels(stage.ground, result);

    let roofMap = {
        cylinders: [],
        polygons: [],
        walkways: [],
        safetyline: [],
        handrail: [],
        acCable: [],
        dcStrings: [],
        strings: [],
        dcCable: [],
        conduit: [],
        cableTray: [],
        microInverters: [],
        optimizers: [],
        rafters: [],
        attachments: [],
        rails: [],
        obstructions: [],
        setbacks: [],
        setbacksFrontend: [],
        property: [],
        parapets: [],
        extras: [],
        ground: [],
    };

    //for ground
    let ground= {
        height:0,
        width:0,
        vertices: [],
    }
    
    ground.height = stage.getImageDimensions().height;
    ground.width = stage.getImageDimensions().width;
    ground.vertices = stage.ground.get2DVertices();
    roofMap.ground.push(ground);

    //for polygons
    for (let polygonModel of result.polygons) {
        let polygon = {
            id: polygonModel.id,
            ignored: polygonModel.ignored,
            placable: polygonModel.placable,
            obstruction: polygonModel.obstruction,
            edges: []
        };
        let vertices = polygonModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            polygon.edges.push({
                heightParapet: polygonModel.parapetHeight,
                thicknessParapet: polygonModel.parapetThickness,
                setbackInside: polygonModel.setbackInside,
                setbackOutside: polygonModel.setbackOutside,
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        polygon.edges.push({
            heightParapet: polygonModel.parapetHeight,
            thicknessParapet: polygonModel.parapetThickness,
            setbackInside: polygonModel.setbackInside,
            setbackOutside: polygonModel.setbackOutside,
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        if (polygonModel.parent instanceof SmartroofFace || (polygonModel.obstruction !== 'None')) {
            roofMap.obstructions.push(polygon);
        } else {
            roofMap.polygons.push(polygon);
        }
        /* Creating a polygon with diagonals */
        if (polygonModel instanceof PolygonModel && polygonModel.get2DVertices().length > 3) {
            let diagonals = getObstructionPointsAC(polygonModel.get2DVertices());
            let vertices = convertArrayToVector(polygonModel.get2DVertices());
            if (polygonModel.obstruction === 'AC Unit') {
                let obs = diagonals;
                obs.forEach(element => {
                    let line = {
                        edges: [],
                    };
                    line.edges.push({
                        points: [
                            element[0],
                            element[1]
                        ],
                    });
                    roofMap.extras.push(line);
                });
            } else if (polygonModel.obstruction === 'Chimney') {
                /* Creating a polygon with a circle in the center. along with cropped diagonals */
                let dist1 = vertices[0].distanceToSquared(vertices[1]);
                let dist2 = vertices[1].distanceToSquared(vertices[2]);
                let dist = dist1 < dist2 ? dist1 : dist2;
                let obstructionChimney = getObstructionPointsChimney(diagonals[0], diagonals[1], Math.sqrt(dist.toFixed(1)) / 4, vertices);
                let polygon = {
                    id: polygonModel.id,
                    ignored: polygonModel.ignored,
                    placable: polygonModel.placable,
                    obstruction: polygonModel.obstruction,
                    edges: []
                };
                for (let i = 0; i < obstructionChimney.circlePoints.length - 1; i++) {
                    polygon.edges.push({
                        points: [
                            [obstructionChimney.circlePoints[i].x, obstructionChimney.circlePoints[i].y],
                            [obstructionChimney.circlePoints[i + 1].x, obstructionChimney.circlePoints[i + 1].y]
                        ],
                    });
                }
                polygon.edges.push({
                    points: [
                        [obstructionChimney.circlePoints[obstructionChimney.circlePoints.length - 1].x, obstructionChimney.circlePoints[obstructionChimney.circlePoints.length - 1].y],
                        [obstructionChimney.circlePoints[0].x, obstructionChimney.circlePoints[0].y]
                    ],
                });
                roofMap.extras.push(polygon);
                obstructionChimney.croppedDiagonals.forEach(element => {
                    let line = {
                        edges: [],
                    };
                    line.edges.push({
                        points: [
                            [element[0].x, element[0].y],
                            [element[1].x, element[1].y]
                        ],
                    });
                    roofMap.extras.push(line);
                });
            }
        }

        /* Parapet for each polygon model */
        // chech if polygon has parapet
        if (polygonModel.isParapetPresent()) {
            let parapet = {
                edges: []
            };
            // get vertices of parapet
            let parapetVert = polygonModel.getParapet2DVertices();
            let nParaVert = parapetVert.length;
            for (let i = 0; i < parapetVert.length - 1; i++) {
                parapet.edges.push({
                    points: [
                        parapetVert[i],
                        parapetVert[i + 1]
                    ],
                });
            }
            parapet.edges.push({
                points: [
                    parapetVert[nParaVert - 1],
                    parapetVert[0]
                ],
            });
            roofMap.parapets.push(parapet);

        }

        if (!polygonModel.isObstruction) {
            const outerVertices = polygonModel.get3DVertices().map(arr => new THREE.Vector3(...arr));
            const setbackValues = [...polygonModel.setbackInside];
            const setbacks = getSetbackForFaceFrontend(outerVertices, setbackValues);
            for (let i = 0; i < setbacks.length; i++) {
                roofMap.setbacksFrontend.push(setbacks[i]);
            }
        }
    }
    
    //for dormer
    // for (let dormerModel of result.dormers) {
    //     for(let faceChild of dormerModel.getChildren()) {
    //         let faceobj = {
    //             id: faceChild.id,
    //             ignored: faceChild.ignored,
    //             placable: faceChild.placable,
    //             edges: []
    //         };
    //         let vertices = faceChild.get3DVertices();
    //         let nVertices = vertices.length;
    //         for (let i = 0; i < nVertices - 1; i++) {
    //             faceobj.edges.push({
    //                 heightParapet: 0,
    //                 thicknessParapet: 0,
    //                 setbackInside: 0,
    //                 setbackOutside: faceChild.setbackOutside,
    //                 points: [
    //                     vertices[i],
    //                     vertices[i + 1]
    //                 ],
    //             });
    //         }
    //         faceobj.edges.push({
    //             heightParapet: 0,
    //             thicknessParapet: 0,
    //             setbackInside: 0,
    //             setbackOutside: faceChild.setbackOutside,
    //             points: [
    //                 vertices[nVertices - 1],
    //                 vertices[0]
    //             ],
    //         });
    //         roofMap.polygons.push(faceobj);
    //     }
    // }

    //for smartroofFaces
    for (let smartroofFaceModel of result.smartroofFaces) {
        if (smartroofFaceModel.isValidFace()) {
            // if (!(smartroofFaceModel.parent instanceof Dormer)) {
            let smartroofFace = {
                id: smartroofFaceModel.id,
                ignored: smartroofFaceModel.ignored,
                placable: smartroofFaceModel.placable,
                edges: []
            };
            let verticesArray = smartroofFaceModel.setbackVertices;
            // let verticesArray = getOrderedEdges(smartroofFaceModel.getIntersectingEdges());
            verticesArray.forEach(vertices => {
                smartroofFace = {
                    id: smartroofFaceModel.id,
                    ignored: smartroofFaceModel.ignored,
                    placable: smartroofFaceModel.placable,
                    edges: []
                };
                let nVertices = vertices.length;
                for (let i = 0; i < nVertices; i++) {
                    const next = (i + 1) % nVertices;
                    smartroofFace.edges.push({
                        heightParapet: 0,
                        thicknessParapet: 0,
                        setbackInside: smartroofFaceModel.setbackInside,
                        setbackOutside: 0,
                        points: [
                            [vertices[i].x, vertices[i].y, vertices[i].z],
                            [vertices[next].x, vertices[next].y, vertices[next].z],
                        ],
                    });
                }

                roofMap.polygons.push(smartroofFace);
            });
            if (smartroofFaceModel.rafterEnabled) {
                const rafterLinesVertices = smartroofFaceModel.getRafterLineVertices();
                rafterLinesVertices.forEach(rafterLine => {
                    if (rafterLine.length > 0) {
                        let rafter = {
                            edges: [],
                        }
                        rafter.edges.push({
                            points: [
                                ...rafterLine
                            ]
                        })
                        roofMap.rafters.push(rafter);
                    }
                });
                const railLinesVertices = smartroofFaceModel.getRailLineVertices();
                railLinesVertices.forEach(railLine => {
                    if (railLine.length > 0) {
                        let rail = {
                            edges: [],
                        }
                        rail.edges.push({
                            points: [
                                ...railLine
                            ]
                        })
                        roofMap.rails.push(rail);
                    }
                });
                const attachmentPoints = smartroofFaceModel.getAttachmentPoints();
                attachmentPoints.forEach((point) => {
                    if (point.length > 0) {
                        let attachment = {
                            edges: [],
                        }
                        attachment.edges.push({
                            center: point[0],
                            points: [
                                ...point.slice(1)
                            ],
                        })
                        roofMap.attachments.push(attachment);
                    }
                })
            }
        }
    }
    // SETBACK 
    // faces with panels
    for (let smartroofFaceModel of result.smartroofFaces) {
        if (smartroofFaceModel.isValidFace()) {
            for (let i = 0; i < smartroofFaceModel.setbackVertices.length; i++) {
                let faceVertices = [...smartroofFaceModel.setbackVertices[i]];
                if (!smartroofFaceModel.setbackEdges[i]) {
                    continue;
                }
                let faceSetbackValue = [...smartroofFaceModel.setbackInside[i]];
                let setbacks = getSetbackForFace(faceVertices, faceSetbackValue);
                for (let i = 0; i < setbacks.length; i++) {
                    roofMap.setbacks.push(setbacks[i]);
                }
                setbacks = getSetbackForFaceFrontend(faceVertices, faceSetbackValue);
                for (let i = 0; i < setbacks.length; i++) {
                    roofMap.setbacksFrontend.push(setbacks[i]);
                }
            }
        }
    }
    //for cylinderModel
    //export cylinder as a polygon
    for (let cylinderModel of result.cylinders) {
        let cylinder = {
            id: cylinderModel.id,
            ignored: cylinderModel.ignored,
            placable: cylinderModel.placable,
            obstruction: cylinderModel.obstruction,
            edges: []
        };
        let vertices = cylinderModel.get3DVertices(undefined, { approximate: approximateCylinder });
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            cylinder.edges.push({
                heightParapet: cylinderModel.parapetHeight,
                thicknessParapet: cylinderModel.parapetThickness,
                setbackInside: cylinderModel.setbackInside,
                setbackOutside: cylinderModel.setbackOutside,
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }

        cylinder.edges.push({
            heightParapet: cylinderModel.parapetHeight,
            thicknessParapet: cylinderModel.parapetThickness,
            setbackInside: cylinderModel.setbackInside,
            setbackOutside: cylinderModel.setbackOutside,
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        if (cylinderModel.parent instanceof Ground) {
            roofMap.polygons.push(cylinder);
        } else {
            roofMap.obstructions.push(cylinder);
        }
    }

    // for trees
    // export tree as a polygon
    for (let i = 0, len = result.trees.length; i < len; i += 1) {
        const tree = {
            id: result.trees[i].id,
            ignored: result.trees[i].ignored,
            placable: result.trees[i].placable,
            edges: [],
        };
        const vertices =
            result.trees[i].get3DVertices(
                undefined, { approximate: approximateTree }, { roofMapExport: true },
            );
        const nVertices = vertices.length;
        for (let j = 0; j < nVertices - 1; j += 1) {
            tree.edges.push({
                heightParapet: 0,
                thicknessParapet: 0,
                setbackInside: 0,
                setbackOutside: 0,
                points: [
                    vertices[j],
                    vertices[j + 1],
                ],
            });
        }
        tree.edges.push({
            heightParapet: 0,
            thicknessParapet: 0,
            setbackInside: 0,
            setbackOutside: 0,
            points: [
                vertices[nVertices - 1],
                vertices[0],
            ],
        });
        roofMap.obstructions.push(tree);
    }

    // for inverters
    // export inverter as a 
    if (stage.showInverterIn3D) {
        for (let i = 0, len = result.inverters.length; i < len; i += 1) {
            const inverter = {
                id: result.inverters[i].id,
                ignored: result.inverters[i].ignored,
                placable: result.inverters[i].placable,
                edges: [],
            };
            const vertices =
                result.inverters[i].get3DVertices();
            const nVertices = vertices.length;
            for (let j = 0; j < nVertices - 1; j += 1) {
                inverter.edges.push({
                    heightParapet: 0,
                    thicknessParapet: 0,
                    setbackInside: 0,
                    setbackOutside: 0,
                    points: [
                        vertices[j],
                        vertices[j + 1],
                    ],
                });
            }
            inverter.edges.push({
                heightParapet: 0,
                thicknessParapet: 0,
                setbackInside: 0,
                setbackOutside: 0,
                points: [
                    vertices[nVertices - 1],
                    vertices[0],
                ],
            });
            roofMap.polygons.push(inverter);
            roofMap.dcStrings.push(...result.inverters[i].getStringsCoordinates());
            roofMap.optimizers.push(...result.inverters[i].getOptimizersCoordinates());
        }
    }

    // for microinverters
    // ElectricalString.js cad export
    const microinverters = stage.ground.microInverters;
    for (let i = 0, l = microinverters.length; i < l; i += 1) {
        roofMap.microInverters.push(...microinverters[i].getMicroinvertersCoordinates());
        roofMap.dcStrings.push(...microinverters[i].getStringsCoordinates());
    }
    // for acdbs
    // export acdb as a polygon
    for (let i = 0, len = result.acdb.length; i < len; i += 1) {
        const acdb = {
            id: result.acdb[i].id,
            ignored: result.acdb[i].ignored,
            placable: result.acdb[i].placable,
            edges: [],
        };
        const vertices =
            result.acdb[i].get3DVertices();
        const nVertices = vertices.length;
        for (let j = 0; j < nVertices - 1; j += 1) {
            acdb.edges.push({
                heightParapet: 0,
                thicknessParapet: 0,
                setbackInside: 0,
                setbackOutside: 0,
                points: [
                    vertices[j],
                    vertices[j + 1],
                ],
            });
        }
        acdb.edges.push({
            heightParapet: 0,
            thicknessParapet: 0,
            setbackInside: 0,
            setbackOutside: 0,
            points: [
                vertices[nVertices - 1],
                vertices[0],
            ],
        });
        roofMap.polygons.push(acdb);
    }

    // for walkways
    for (const walkwayModel of result.walkways) {
        const walkway = {
            id: walkwayModel.id,
            associatedObstacle: walkwayModel.getParent().getId(),
            edges: [],
            length: walkwayModel.computeLength(),
        };
        const vertices = walkwayModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            walkway.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        walkway.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.walkways.push(walkway);
    }

    // for safetyline
    for (let safetyLineModel of result.safetyline) {
        const safetyLine = {
            id: safetyLineModel.id,
            associatedObstacle: safetyLineModel.getParent().getId(),
            edges: [],
            length: safetyLineModel.computeLength(),
        };
        const vertices = safetyLineModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices; i++) {
            safetyLine.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        roofMap.safetyline.push(safetyLine);
    }

    // for Handrail
    for (let handrailModel of result.handrail) {
        const handRail = {
            id: handrailModel.id,
            associatedObstacle: handrailModel.getParent().getId(),
            edges: [],
            length: handrailModel.getLength(),
        };
        const vertices = handrailModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices; i++) {
            handRail.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        roofMap.handrail.push(handRail);
    }

    // for propertyline
    for (let propertyModel of result.property) {
        const propertyline = {
            id: propertyModel.id,
            associatedObstacle: propertyModel.getParent().getId(),
            edges: [],
            length: propertyModel.getLength(),
        };
        const vertices = propertyModel.get2DVertices();
        const measurements = getMeasurementText(propertyModel);
        const edgeAnlesWrtXaxis = getEdgeAngleWrtXaxis(propertyModel);
        const dimensionPos = getDimensionPositionFromEdge(propertyModel);
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            propertyline.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
                dimension: [
                    measurements[i],
                ],
                angleWrtXaxis: [
                    edgeAnlesWrtXaxis[i],
                ],
                dimensionPosition: [
                    dimensionPos[i],
                ],
            });
        }
        propertyline.edges.push({
            points:[
                vertices[nVertices - 1],
                vertices[0]
            ],
            dimension: [
                measurements[nVertices - 1],
            ],
            angleWrtXaxis: [
                edgeAnlesWrtXaxis[nVertices - 1],
            ],
            dimensionPosition: [
                dimensionPos[nVertices - 1],
            ],
        });
        roofMap.property.push(propertyline);
    }

    // for Ac Cable
    for (const acCableModel of result.acCable) {
        const accable = {
            id: acCableModel.id,
            associatedObstacle: acCableModel.getParent().getId(),
            edges: [],
            length: acCableModel.getLength(),
            cableSizeAWG: acCableModel.cableSizeAWG,
            cableSizeMM: acCableModel.cableSizeMM,
            cores: acCableModel.cores,
            materialType: acCableModel.materialType,
            wiring_unit: acCableModel.stage.designSettings.wiring_unit,
            distance_unit: acCableModel.stage.designSettings.distance_unit,
        };
        const vertices = acCableModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            accable.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        accable.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.acCable.push(accable);
    }

    // for Dc Cable
    for (const dcCableModel of result.dcCable) {
        const dccable = {
            id: dcCableModel.id,
            associatedObstacle: dcCableModel.getParent().getId(),
            edges: [],
            length: dcCableModel.getLength(),
            cableSizeAWG: dcCableModel.cableSizeAWG,
            cableSizeMM: dcCableModel.cableSizeMM,
            cores: dcCableModel.cores,
            materialType: dcCableModel.materialType,
            wiring_unit: dcCableModel.stage.designSettings.wiring_unit,
            distance_unit: dcCableModel.stage.designSettings.distance_unit,
        };
        const vertices = dcCableModel.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            dccable.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        dccable.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.dcCable.push(dccable);
    }

    // for Conduit
    for (const conduitt of result.conduits) {
        const conduitObj = {
            id: conduitt.id,
            associatedObstacle: conduitt.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: conduitt.cableSizeAWG,
            cableSizeMM: conduitt.cableSizeMM,
            cores: conduitt.cores,
            materialType: conduitt.materialType,
            wiring_unit: conduitt.stage.designSettings.wiring_unit,
            distance_unit: conduitt.stage.designSettings.distance_unit,
        };
        const vertices = conduitt.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            conduitObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        conduitObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.conduit.push(conduitObj);
    }

    for (const conduitt of result.doubleConduit) {
        const conduitObj = {
            id: conduitt.id,
            associatedObstacle: conduitt.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: conduitt.cableSizeAWG,
            cableSizeMM: conduitt.cableSizeMM,
            cores: conduitt.cores,
            materialType: conduitt.materialType,
            wiring_unit: conduitt.stage.designSettings.wiring_unit,
            distance_unit: conduitt.stage.designSettings.distance_unit,
        };
        const vertices = conduitt.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            conduitObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        conduitObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.conduit.push(conduitObj);
    }

    for (const conduitt of result.doubleSeparateConduit) {
        const conduitObj = {
            id: conduitt.id,
            associatedObstacle: conduitt.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: conduitt.cableSizeAWG,
            cableSizeMM: conduitt.cableSizeMM,
            cores: conduitt.cores,
            materialType: conduitt.materialType,
            wiring_unit: conduitt.stage.designSettings.wiring_unit,
            distance_unit: conduitt.stage.designSettings.distance_unit,
        };
        const vertices = conduitt.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            conduitObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        conduitObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.conduit.push(conduitObj);
    }

    // for cable tray
    for (const cable of result.singleCableTray) {
        const cableObj = {
            id: cable.id,
            associatedObstacle: cable.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: cable.cableSizeAWG,
            cableSizeMM: cable.cableSizeMM,
            cores: cable.cores,
            materialType: cable.materialType,
            wiring_unit: cable.stage.designSettings.wiring_unit,
            distance_unit: cable.stage.designSettings.distance_unit,
        };
        const vertices = cable.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            cableObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        cableObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.cableTray.push(cableObj);
    }

    for (const cable of result.doubleCableTray) {
        const cableObj = {
            id: cable.id,
            associatedObstacle: cable.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: cable.cableSizeAWG,
            cableSizeMM: cable.cableSizeMM,
            cores: cable.cores,
            materialType: cable.materialType,
            wiring_unit: cable.stage.designSettings.wiring_unit,
            distance_unit: cable.stage.designSettings.distance_unit,
        };
        const vertices = cable.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            cableObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        cableObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.cableTray.push(cableObj);
    }

    for (const cable of result.DoubleSeparateCableTray) {
        const cableObj = {
            id: cable.id,
            associatedObstacle: cable.getParent().getId(),
            edges: [],
            length: 0,
            cableSizeAWG: cable.cableSizeAWG,
            cableSizeMM: cable.cableSizeMM,
            cores: cable.cores,
            materialType: cable.materialType,
            wiring_unit: cable.stage.designSettings.wiring_unit,
            distance_unit: cable.stage.designSettings.distance_unit,
        };
        const vertices = cable.get3DVertices();
        let nVertices = vertices.length;
        for (let i = 0; i < nVertices - 1; i++) {
            cableObj.edges.push({
                points: [
                    vertices[i],
                    vertices[i + 1]
                ],
            });
        }
        cableObj.edges.push({
            points: [
                vertices[nVertices - 1],
                vertices[0]
            ],
        });
        roofMap.cableTray.push(cableObj);
    }
    return roofMap;
}

/**
 * This function returns all the subarrays on a
 * model, traversing recursively on child models 
 * @param {*object instance of model}  
 * @param {*result the array in which subarray needs to be pushed} 
 */
export function getSubarrays(object, result) {
    for (let child of object.getChildren()) {
        if (child instanceof PolygonModel || child instanceof CylinderModel || child instanceof SmartroofModel ||
            child instanceof SmartroofFace || child instanceof Dormer) {
            getSubarrays(child, result);
        } else if (child instanceof Subarray) {
            result.push(child);
        }
    }
}

export function getGazebos(object, result) {
    for (let child of object.getChildren()) {
        if (child instanceof PolygonModel || child instanceof CylinderModel || child instanceof SmartroofModel ||
            child instanceof SmartroofFace || child instanceof Dormer) {
            getGazebos(child, result);
        } else if (child instanceof Gazebo) {
            result.push(child);
        }
    }
}

export function getOptimizerQuantity(stage) {
    const inverters = getInverters(stage);
    let optimizerCount = 0;

    for (let j = 0; j < inverters.length; j++) {
        if (inverters[j].optimizerStatus) {
            for (let i = 0; i < inverters[j].mppts.length; i++) {
                let count = 0;
                for (let k = 0; k < inverters[j].mppts[i].strings.length; k++) {
                    count = inverters[j].mppts[i].strings[k].linkedPanels.length;
                    optimizerCount += Math.ceil(count / inverters[j].optimizerStringLength);
                }
            }
        }
    }
    return optimizerCount;
}
export function isBifacialEnabled(panelMap){
    let index = panelMap.findIndex((item)=>{ return item.bifacialEnabled==true})
    if(index>=0)
        return true;
    else
        return false;
}
export function panelMapExporter(stage) {
    let result = [];
    getSubarrays(stage.ground, result);

    let panelMapArray = [];
    for (let subarray of result) {
        const panelMap = subarray.getSubarrayMap();
        if(panelMap && panelMap.azimuth){
            panelMap.azimuth = parseFloat(panelMap.azimuth);
        }
        // TODO: Figure out why empty rows are occuring in the first place.
        if(panelMap.rows.length > 0) panelMapArray.push(panelMap);
    }
    return panelMapArray;
}

export function gazeboMapExporter(stage) {
   
    let result = [];
    getGazebos(stage.ground,result);

    let gazebo_map = {
        gazebo_components: {},
        gazebo_total_size: stage.getDcSizeForGazebos(),
        gazebo_system_name: undefined,
    };
    for (let gazebo of result){
        gazebo_map.gazebo_components[gazebo.getGazeboType().gazebo_components] = (gazebo_map.gazebo_components[gazebo.getGazeboType().gazebo_components]|| 0) + 1;
    }
    const gazebo_structureType = gazebo_map.gazebo_components;
    const gazeboTotal = gazebo_map.gazebo_total_size;
    if (Object.keys(gazebo_structureType).length > 0) {
        const defaultKey = Object.keys(gazebo_structureType)[0]; 

        let values = defaultKey.split(" ");
        let l_name = values[1] ? defaultKey.substr(defaultKey.indexOf(' ') + 1) : '';
        gazebo_map.gazebo_system_name = Object.keys(gazebo_structureType).length > 1 ? `PowerGazebo™ ${gazeboTotal} kWp`:`PowerGazebo™ ${gazeboTotal}kWp ${l_name} System`;
    }
    return gazebo_map; 
}

// returns the array of inverters electrical
// components
export function inverterElectricalMapExporter(stage, panelMap) {
    const result = getAllModelType();
    getModels(stage.ground, result);

    let isStringing = false;

    const string = [];

    for (let i = 0, l = result.inverters.length; i < l; i += 1) {
        if (result.inverters[i].mppts.length > 0) {
            string.push(result.inverters[i].getElectricalMap());
        }
    }

    const allPanelsArray = [];

    if (panelMap === undefined || panelMap === null) {
        panelMap = panelMapExporter(stage);
    }

    if (panelMap !== undefined) {
        for (let subarray of panelMap) {
            for (let row of subarray.rows) {
                for (let table of row.frames) {
                    if (!table.hidden) {
                        for (let panel of table.panels) {
                            allPanelsArray.push({
                                subarrayId: subarray.id,
                                panelId: panel.id,
                            });
                        }
                    }
                }
            }
        }
    }

    for (let inverter of string) {
        for (let mppt of inverter.mppts) {
            for (let string of mppt.strings) {
                for (let linkedPanelId of string.linkedPanelIds) {
                    const ppanels = allPanelsArray;
                    for (let i = 0, l = ppanels.length; i < l; i += 1) {
                        if (linkedPanelId.subarrayId === ppanels[i].subarrayId &&
                            linkedPanelId.panelId === ppanels[i].panelId) {
                            linkedPanelId.shadowMapId = i + 1;
                            isStringing = true;
                        }
                    }
                }
            }
        }
    }

    const micro = [];
    for (let i = 0, l = stage.ground.microInverters.length; i < l; i += 1) {
        const panels = [];
        for (let j = 0, len = stage.ground.microInverters[i].panels.length; j < len; j += 1) {
            const panel = {
                subarrayId: stage.ground.microInverters[i].panels[j].getSubarray().getId(),
                panelId: stage.ground.microInverters[i].panels[j].getId(),
            }
            for (let i = 0, l = allPanelsArray.length; i < l; i += 1) {
                if (panel.subarrayId === allPanelsArray[i].subarrayId &&
                    panel.panelId === allPanelsArray[i].panelId) {
                    panel.shadowMapId = i + 1;
                }
            }
            panels.push(panel);
        }
        micro.push({
            panels,
            stringLength: stage.ground.microInverters[i].stringLength,
            microInverterCount: panels.length / stage.ground.microInverters[i].stringLength,
            inverterDatabaseId: stage.ground.microInverters[i].electricalProperties.id,
        });
    }
    const gazebos = [];
    getGazebos(stage.ground, gazebos);
    for (let i = 0, l = gazebos.length; i < l; i += 1) {
        micro.push(gazebos[i].getInverterData());
    }

    const central = [];

    return {
        micro,
        string,
        central,
        isStringing,
    };
}

/* ####### SETBACK FOR CAD #########
    -> Setback for the model is stored in three arrays  
    - edges , outerEdges
    - zeroSetback
    -> Edges and outer edges store the faces without any zero setback 
    where outer setback is the associated edge with each setback
    -> Zerosetback has all the faces with zero setback, each closed polygon for setback is pushed seperately
    
    PS: This is being done as Zero Setbacks are being handled in the backend in a different manner.
*/
export function getSetbackForFace(faceVertices, faceSetbackValue) {
    let result = []
    // make object structure
    let setback = {
        edges: [],
        outerEdges: [],
        zeroSetback: [],
    };
    let edgeSetbackInsideValues = [...faceSetbackValue];
    let completeGeom = true;

    for (let i = 0; i < edgeSetbackInsideValues.length; i++) {
        if (edgeSetbackInsideValues[i] <= 0.001) {
            completeGeom = false;
            edgeSetbackInsideValues[i] = -0.001;
        }
    }

    // check if array exists
    if (!completeGeom) {
        // push all faces having zerosetback 
        let setbackPolygon = getSetBack(
            edgeSetbackInsideValues,
            faceVertices,
            EDIT_SETBACK_INSIDE,
        );
        for (let j = 0; j < setbackPolygon.length; j++) {
            setback = {
                edges: [],
                outerEdges: [],
                zeroSetback: [],
            };
            // push all points of the closed polygon
            for (let i = 0; i < setbackPolygon[j].length - 1; i++) {
                setback.zeroSetback.push({
                    points: [
                        [setbackPolygon[j][i].x, setbackPolygon[j][i].y],
                        [setbackPolygon[j][i + 1].x, setbackPolygon[j][i + 1].y]
                    ],
                });
            }
            if (!(setback.edges.length === 0 && setback.outerEdges.length === 0 && setback.zeroSetback.length === 0)) {
                result.push(setback);
            }
        }
    }
    // push all setback for normal faces i.e. non zero setback
    else {
        let indsideSetbackPolygon = newBuffer(
            edgeSetbackInsideValues,
            convertVectorToArray(faceVertices),
            EDIT_SETBACK_INSIDE,
        );
        for (let i = 0; i < indsideSetbackPolygon.length; i++) {
            let insideHole = [];
            for (let j = 0; j < indsideSetbackPolygon[i].length - 1; j++) {
                //this creates the inner boundary
                insideHole.push({
                    points: [
                        [indsideSetbackPolygon[i][j].x, indsideSetbackPolygon[i][j].y],
                        [indsideSetbackPolygon[i][j + 1].x, indsideSetbackPolygon[i][j + 1].y]
                    ],
                });
            }
            let n = indsideSetbackPolygon[i].length - 1;
            insideHole.push({
                points: [
                    [indsideSetbackPolygon[i][n].x, indsideSetbackPolygon[i][n].y],
                    [indsideSetbackPolygon[i][0].x, indsideSetbackPolygon[i][0].y]
                ],
            });
            setback.edges.push({hole : insideHole});
        }
        for (let i = 0; i < faceVertices.length - 1; i++) {
            // this creates the outer boundary
            setback.outerEdges.push({
                points: [
                    [faceVertices[i].x, faceVertices[i].y],
                    [faceVertices[i + 1].x, faceVertices[i + 1].y]
                ],
            });
        }
        let n = faceVertices.length - 1;
        setback.outerEdges.push({
            points: [
                [faceVertices[n].x, faceVertices[n].y],
                [faceVertices[0].x, faceVertices[0].y]
            ],
        });

        // push first point to last
        // setback.outerEdges.push(setback.outerEdges.shift());
        if(!(setback.edges.length === 0 && setback.outerEdges.length === 0 && setback.zeroSetback.length === 0)){
            result.push(setback);
        }
    }
    return result;
}

export function getSetbackForFaceFrontend(faceVertices, faceSetbackValue) {
    const result = [];
    // make object structure
    let setback = {
        edges: [],
        outerEdges: [],
        zeroSetback: [],
    };
    const edgeSetbackInsideValues = [...faceSetbackValue];

    for (let i = 0; i < edgeSetbackInsideValues.length; i++) {
        if (edgeSetbackInsideValues[i].toFixed(3) <= 0.001) {
            edgeSetbackInsideValues[i] = -0.001;
        }
    }
    // push all faces having zerosetback
    const setbackPolygon = getSetBack(
        edgeSetbackInsideValues,
        faceVertices,
        EDIT_SETBACK_INSIDE,
        true,
    );
    for (let j = 0; j < setbackPolygon.length; j++) {
        setback = {
            edges: [],
            outerEdges: [],
            zeroSetback: [],
        };
        // push all points of the closed polygon
        const outerPoints = setbackPolygon[j].shell;
        for (let i = 0; i < outerPoints.length - 1; i++) {
            setback.outerEdges.push({
                points: [
                    [outerPoints[i].x, outerPoints[i].y],
                    [outerPoints[i + 1].x, outerPoints[i + 1].y],
                ],
            });
        }

        const indsideSetbackPolygon = setbackPolygon[j].holes;
        for (let i = 0; i < indsideSetbackPolygon.length; i++) {
            const insideHole = [];
            for (let k = 0; k < indsideSetbackPolygon[i].length - 1; k++) {
                // this creates the inner boundary
                insideHole.push({
                    points: [
                        [indsideSetbackPolygon[i][k].x, indsideSetbackPolygon[i][k].y],
                        [indsideSetbackPolygon[i][k + 1].x, indsideSetbackPolygon[i][k + 1].y],
                    ],
                });
            }
            const n = indsideSetbackPolygon[i].length - 1;
            insideHole.push({
                points: [
                    [indsideSetbackPolygon[i][n].x, indsideSetbackPolygon[i][n].y],
                    [indsideSetbackPolygon[i][0].x, indsideSetbackPolygon[i][0].y],
                ],
            });
            setback.edges.push({ hole: insideHole });
        }

        if (!(
            setback.edges.length === 0 &&
            setback.outerEdges.length === 0 &&
            setback.zeroSetback.length === 0
        )) {
            result.push(setback);
        }
    }

    return result;
}

export function getTimeStamp() {
    const time = new Date();
    const date = time.getDate();
    const month = time.getMonth() + 1;
    const year = time.getFullYear();
    const hrs = time.getHours();
    const mins = time.getMinutes();

    return `{${date < 10 ? '0' : ''}${date}-${month < 10 ? '0' : ''}${month}-${year} ${hrs < 10 ? '0' : ''}${hrs}-${mins < 10 ? '0' : ''}${mins}}`;
}

export async function DXFExport(SLDModel, designName) {
    const timeStamp = getTimeStamp();
    const dxfString = makerjs.exporter.toDXF(SLDModel, { fontSize: 2 });
    const blobData = new Blob([dxfString], { type: 'text/plain' });
    try {
        saveAs(blobData, `${designName}_sld_${timeStamp}.dxf`);
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function STLExport(stage) {
    const exporter = new STLExporter();

    const objects = stage.ground.exportAsSTL();

    const rootZip = new JSZip();
    const rootName = stage.eventManager.getProjectDesignName();
    const designFolder = rootZip.folder(rootName);

    // TODO: Remove this backward compatibility after 6 months on 01/01/2020
    const objectNames = [];
    let counter = 0;
    for (let i = 0; i < objects.length; i += 1) {
        if (objectNames.includes(objects[i].name)) {
            objects[i].name += String(counter += 1);
        }
        objectNames.push(objects[i].name);
        designFolder.file(`${objects[i].name}.stl`, new Blob([exporter.parse(objects[i].mesh)], { type: 'text/plain' }));
    }

    try {
        const content = await rootZip.generateAsync({ type: 'blob' });
        saveAs(content, `${rootName}.zip`);
        return Promise.resolve(true);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function ColladaExport(stage) {
    const exporter = new ColladaExporter();
    const designName = stage.eventManager.getProjectDesignName();
    const designs = [];

    const object = stage.ground.exportAsCollada();

    const singleGeometry = BufferGeometryUtils
        .mergeGeometries(object.subarray.map((child) => {
            child.updateMatrix();
            return child.geometry;
        }));

    const subArraysMesh = new THREE.Mesh(
        singleGeometry,
        new THREE.MeshLambertMaterial({
            color: 0x0062A3,
            transparent: false,
        }),
    );
    subArraysMesh.name = 'Subarrays';

    // to maintain directions
    // TODO: remove after fixing orbit controls and coordinate system.
    object.model.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.PI);
    subArraysMesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.PI);

    designs.push(object.model);
    designs.push(subArraysMesh);

    const files = [];
    for (let i = 0; i < designs.length; i += 1) {
        const blobData = new Blob([exporter.parse(designs[i]).data], { type: 'text/plain' });
        const file = new File([blobData], `${designName}_${designs[i].name}.dae`);
        files.push(file);
    }

    try {
        let form = new FormData();
        form.append('file', files[0]);
        const converterResponseModel = await axios.post(
            CONVERTER_URL,
            form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
        );

        form = new FormData();
        form.append('file', files[1]);

        const converterResponseSubarray = await axios.post(
            CONVERTER_URL,
            form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
        );

        saveAs(converterResponseModel.data.file, `${designName}_${designs[0].name}.3ds`);
        saveAs(converterResponseSubarray.data.file, `${designName}_${designs[1].name}.3ds`);

        return Promise.resolve(true);
    } catch (error) {
        console.error('ERROR: Exporters: PVsyst export unsuccessful.', error);
        return Promise.reject(error);
    }
}
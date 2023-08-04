import * as JSTS from 'jsts';

export function verticesToJSTSPolygon(vertices) {
    const coordinateArray = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const vertex = vertices[i];
        coordinateArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1], 10));
    }
    // vertices aren't ring but JSTS Polygon only takes linear ring
    coordinateArray.push(coordinateArray[0]);

    const geometryFactory = new JSTS.geom.GeometryFactory();
    return geometryFactory.createPolygon(coordinateArray);
}

export function verticesToJSTSLine(vertices) {
    const coordinateArray = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const vertex = vertices[i];
        coordinateArray.push(new JSTS.geom.Coordinate(vertex.x, vertex.y, vertex.z));
    }
    const geometryFactory = new JSTS.geom.GeometryFactory();
    return geometryFactory.createLineString(coordinateArray);
}

export function setbackToJSTSPolygon(setbackShapes) {
    const geometryFactory = new JSTS.geom.GeometryFactory();
    const polygons = [];
    setbackShapes.forEach((shape) => {
        const coordinateArray = [];
        for (let i = 0; i < shape.vertices.length; i += 1) {
            const vertex = shape.vertices[i];
            coordinateArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1]));
        }
        coordinateArray.push(coordinateArray[0]);
        // TODO: Add holes also. For now works without holes
        // let holeArray = [];
        // for (let vertex of shape.holeVertices) {
        //     holeArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1]));
        // }
        // holeArray.push(holeArray[0]);
        polygons.push(geometryFactory.createPolygon(coordinateArray));
    });
    return geometryFactory.createMultiPolygon(polygons).union();
}

export function verticesFromJSTSPolygon(polygon) {
    const vertices = [];

    const polygonCoordinates = polygon.getCoordinates();
    for (let idx = 0; idx < polygonCoordinates.length - 1; idx += 1) {
        vertices.push([
            polygonCoordinates[idx].x,
            polygonCoordinates[idx].y,
            polygonCoordinates[idx].z,
        ]);
    }

    return vertices;
}

export function verticesToJSTSLinearRing(vertices) {
    const coordinateArray = [];
    for (let i = 0; i < vertices.length; i += 1) {
        const vertex = vertices[i];
        coordinateArray.push(new JSTS.geom.Coordinate(vertex[0], vertex[1], 10));
    }
    // vertices aren't ring but JSTS Polygon only takes linear ring
    coordinateArray.push(coordinateArray[0]);

    const geometryFactory = new JSTS.geom.GeometryFactory();
    return geometryFactory.createLinearRing(coordinateArray);
}

function verticesFromCoordinateArray(array) {
    const vertices = [];

    for (let idx = 0; idx < array.length - 1; idx += 1) {
        vertices.push([array[idx].x, array[idx].y]);
    }

    return vertices;
}

export function verticesFromJSTSPolygonWithHoles(intersectedPolygon) {
    const outerRingVertices = [];
    const innerRingVertices = [];

    if (intersectedPolygon._geometries !== undefined) {
        for (let i = 0; i < intersectedPolygon._geometries.length; i += 1) {
            const tempGeo = intersectedPolygon._geometries[i];

            const extRingVertices = tempGeo.getExteriorRing().getCoordinates();

            const outerVertices = verticesFromCoordinateArray(extRingVertices);

            outerRingVertices.push(outerVertices);

            const innerRing = [];
            if (tempGeo._holes.length !== 0) {
                for (let j = 0; j < tempGeo._holes.length; j += 1) {
                    const intRingVertices = tempGeo._holes[j].getCoordinates();

                    const innerVertices = verticesFromCoordinateArray(intRingVertices);

                    innerRing.push(innerVertices);
                }
            }
            innerRingVertices.push(innerRing);
        }
    }
    else {
        const extRingVertices = intersectedPolygon.getExteriorRing().getCoordinates();

        const outerVertices = verticesFromCoordinateArray(extRingVertices);
        outerRingVertices.push(outerVertices);

        const innerRing = [];
        if (intersectedPolygon._holes.length !== 0) {
            for (let j = 0; j < intersectedPolygon._holes.length; j += 1) {
                const intRingVertices = intersectedPolygon._holes[j].getCoordinates();

                const innerVertices = verticesFromCoordinateArray(intRingVertices);

                innerRing.push(innerVertices);
            }
        }
        innerRingVertices.push(innerRing);
    }
    return [outerRingVertices, innerRingVertices];
}

function addLineString(originalLineString, polygonizer) {
    // LinearRings are treated differently to line strings : we need a LineString NOT a LinearRing
    let lineString;
    if (originalLineString instanceof JSTS.geom.LinearRing) {
        lineString = originalLineString
            .getFactory().createLineString(originalLineString.getCoordinateSequence());
    }
    else {
        lineString = originalLineString;
    }

    // unioning the linestring with the point makes any self intersections explicit.
    const point = lineString.getFactory().createPoint(lineString.getCoordinateN(0));
    const toAdd = lineString.union(point);

    // Add result to polygonizer
    polygonizer.add(toAdd);
}

function addPolygon(polygon, polygonizer) {
    addLineString(polygon.getExteriorRing(), polygonizer);
    for (let n = polygon.getNumInteriorRing(); n > 0; n -= 1) {
        addLineString(polygon.getInteriorRingN(n), polygonizer);
    }
}

function toPolygonGeometry(polygons, innerPolygon) {
    switch (polygons.size()) {
    case 0:
        return null;
    case 1:
        return polygons.iterator().next();
    default: {
        // polygons may still overlap! Need to sym difference them
        const iter = polygons.iterator();
        const factory = new JSTS.geom.GeometryFactory();

        let ret = factory.createPolygon();
        let temp;
        while (iter.hasNext()) {
            temp = iter.next();

            if (temp.intersects(innerPolygon)) ret = ret.symDifference(temp);
        }
        return ret;
    }
    }
}

export function validateJSTSPolygon(geom, innerPolygon) {
    if (geom instanceof JSTS.geom.Polygon) {
        if (geom.isValid()) {
            geom.normalize();
            return geom;
        }
        const polygonizer = new JSTS.operation.polygonize.Polygonizer();
        addPolygon(geom, polygonizer);

        return toPolygonGeometry(polygonizer.getPolygons(), innerPolygon);
    }
    else if (geom instanceof JSTS.geom.MultiPolygon) {
        if (geom.isValid()) {
            geom.normalize();
            return geom;
        }
        const polygonizer = new JSTS.geom.Polygonizer();
        for (let n = geom.getNumGeometries(); n > 0; n -= 1) {
            addPolygon(geom.getGeometryN(n), polygonizer);
        }
        return toPolygonGeometry(polygonizer.getPolygons(), geom.getFactory());
    }
    return geom;
}

export function vertexToJSTSPoint(vertex) {
    const geometryFactory = new JSTS.geom.GeometryFactory();
    return geometryFactory.createPoint(new JSTS.geom.Coordinate(vertex[0], vertex[1], 10));
}

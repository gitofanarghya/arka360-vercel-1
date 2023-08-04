/* eslint-disable prefer-destructuring */
/* eslint-disable no-continue */
import * as utils from './utils';
import { Line3, Vector2, Vector3 } from 'three';
import * as THREE from 'three';

/**
 * It returns a union of all polygons
 * @param {*} polygonArray An array of polygons made using Vector3 arrays
 */
export function unionOfConvexPolygons(polygonArray, precisionPoints = 4) {
    const vertexData = {};
    const edgeData = {};
    const precision = Math.pow(10, precisionPoints);


    polygonArray.forEach((polygon) => {
        const orientedPolygon = [...polygon];
        if (utils.checkClockwise(orientedPolygon.map(v => [v.x, v.y]))) orientedPolygon.reverse();

        // Creates a edge hashmap with only valid edges
        for (let i = 0, l = polygon.length; i < l; i++) {
            const currentVertex = polygon[i];
            const nextVertex = polygon[(i + 1) % l];
            const currentVertexHash = `${Math.round(currentVertex.x * precision)},${Math.round(currentVertex.y * precision)},${Math.round(currentVertex.z * precision)}`;
            const nextVertexHash = `${Math.round(nextVertex.x * precision)},${Math.round(nextVertex.y * precision)},${Math.round(nextVertex.z * precision)}`;

            const edgeHash = `${currentVertexHash}_${nextVertexHash}`;
            const reverseEdgeHash = `${nextVertexHash}_${currentVertexHash}`;

            if (reverseEdgeHash in edgeData && edgeData[reverseEdgeHash]) {
                edgeData[reverseEdgeHash] = null;
            }
            else if (!(edgeHash in edgeData)) {
                // if we've already got an edge here then skip adding a new one
                edgeData[edgeHash] = {
                    hash: edgeHash,
                    line: new Line3(currentVertex, nextVertex),
                    vertex1: {
                        hash: currentVertexHash,
                        position: currentVertex,
                    },
                    vertex2: {
                        hash: nextVertexHash,
                        position: nextVertex,
                    },

                };
            }
        }
    });

    const edges = Object.values(edgeData);
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        if (!edge) continue;
        edge.segments = [];
        for (let j = 1; j < edges.length; j++) {
            if (!edges[(j + i) % edges.length]) continue;
            const vertex = edges[(j + i) % edges.length].vertex1;
            if (vertex.hash === edge.vertex1.hash || vertex.hash === edge.vertex2.hash) continue;
            const target = new Vector3();
            edge.line.closestPointToPoint(vertex.position, true, target);
            if (target.distanceTo(vertex.position) < 0.00000001) {
                edge.segments.push(vertex);
            }
        }
        if (edge.segments.length > 0) {
            delete edgeData[edge.hash];
            const startingVertex = edge.vertex1;
            const endingVertex = edge.vertex2;
            edge.segments.sort((v1, v2) => v1.position.distanceTo(startingVertex.position) - v2.position.distanceTo(startingVertex.position));
            let prevVertex = startingVertex;
            edge.segments.push(endingVertex);
            let nextVertex;
            for (let j = 0; j < edge.segments.length; j++) {
                nextVertex = edge.segments[j];
                const newEdgeHash = `${prevVertex.hash}_${nextVertex.hash}`;
                const reverseEdgeHash = `${nextVertex.hash}_${prevVertex.hash}`;
                if (reverseEdgeHash in edgeData || newEdgeHash in edgeData) {
                    edgeData[reverseEdgeHash] = null;
                }
                else if (!(newEdgeHash in edgeData)) {
                    // if we've already got an edge here then skip adding a new one
                    edgeData[newEdgeHash] = {
                        hash: newEdgeHash,
                        line: new Line3(prevVertex.position, nextVertex.position),
                        vertex1: {
                            hash: prevVertex.hash,
                            position: prevVertex.position,
                        },
                        vertex2: {
                            hash: nextVertex.hash,
                            position: nextVertex.position,
                        },

                    };
                }
                prevVertex = nextVertex;
            }
        }
    }

    Object.keys(edgeData).forEach((key) => {
        if (!edgeData[key]) {
            delete edgeData[key];
        }
    });


    // Populate vertex graph using the edge data
    Object.values(edgeData).forEach((edge) => {
        if (!edge) return;
        // vertexData[edge.vertex1.hash] = edge;
        if (edge.vertex1.hash in vertexData) vertexData[edge.vertex1.hash].push(edge);
        else vertexData[edge.vertex1.hash] = [edge];
    });
    const unalteredEdges = [...Object.values(edgeData)];
    let cleanEdges = Object.values(edgeData);
    // return edgeData;
    const allLoops = [];
    const EPSILON = 0.0001;
    while (cleanEdges.length > 1) {
        const loop = [];
        const firstEdge = cleanEdges.splice(0, 1)[0];
        delete edgeData[firstEdge.hash];
        const firstVertex = firstEdge.vertex1;
        loop.push(firstVertex.position);
        let prevVertex = firstVertex;
        let nextVertex = firstEdge.vertex2;
        loop.push(nextVertex.position);
        while (nextVertex.hash !== firstVertex.hash) {
            const nextEdges = vertexData[nextVertex.hash];
            if (!nextEdges) break;
            if (nextEdges.length === 2) {
                const edge1 = nextEdges[0];
                const edge2 = nextEdges[1];
                const prevEdgeVector = nextVertex.position.clone().sub(prevVertex.position).normalize();
                const prev = new Vector2(prevEdgeVector.x, prevEdgeVector.y);
                const edge1Vector = edge1.vertex2.position.clone().sub(edge1.vertex1.position).normalize();
                const edge1Vec = new Vector2(edge1Vector.x, edge1Vector.y);
                const edge2Vector = edge2.vertex2.position.clone().sub(edge2.vertex1.position).normalize();
                const edge2Vec = new Vector2(edge2Vector.x, edge2Vector.y);

                const cross1 = prev.cross(edge1Vec);
                const cross2 = prev.cross(edge2Vec);
                let nextEdge;
                if (cross1 > EPSILON && cross2 < EPSILON) {
                    nextEdge = edge1;
                }
                else if (cross1 < EPSILON && cross2 > EPSILON) {
                    nextEdge = edge2;
                }
                else if (cross1 > EPSILON && cross2 > EPSILON) {
                    if (cross1 < cross2) {
                        nextEdge = edge1;
                    }
                    else {
                        nextEdge = edge2;
                    }
                }
                else if (cross1 < EPSILON && cross2 < EPSILON) {
                    if (cross1 > cross2) {
                        nextEdge = edge1;
                    }
                    else {
                        nextEdge = edge2;
                    }
                }
                vertexData[nextVertex.hash].splice(vertexData[nextVertex.hash].indexOf(nextEdge), 1);
                prevVertex = nextVertex;
                nextVertex = nextEdge.vertex2;
                delete edgeData[nextEdge.hash];
            }
            else {
                delete vertexData[nextVertex.hash];
                const nextEdge = nextEdges[0];
                prevVertex = nextVertex;
                nextVertex = nextEdge.vertex2;
                delete edgeData[nextEdge.hash];
            }
            loop.push(nextVertex.position);
        }
        cleanEdges = Object.values(edgeData);
        allLoops.push(loop);
    }
    return { loops: allLoops, edges: unalteredEdges };
}

export function testDegenracy() {
    const g = new graph.Graph();
    g.setNode(1);
    g.setNode(2);
    g.setNode(3);
    g.setNode(4);
    g.setNode(5);
    g.setEdge(1, 2);
    g.setEdge(2, 4);
    g.setEdge(5, 2);
    g.setEdge(2, 2);
    g.setEdge(3, 1);
    g.setEdge(2, 3);
    g.setEdge(4, 5);
    const loops = graph.alg.findCycles(g);
}

/** Basic element of a graph. */
class Node {
    /**
     * @param {Object} data - contains the data of the node.
     * @param {String} hash - Identifier for lookup.
     * @param {Node[]} adjacencyList - Array of all the nodes the current node can traverse to.
     */
    constructor(data, hash, adjacencyList = []) {
        this.data = data;
        this.hash = hash;
        this.adjacencyList = adjacencyList;
        this.next = null;
        if (adjacencyList.length === 1) [this.next] = adjacencyList;
    }

    getOrder() {
        return this.adjacencyList.length;
    }

    /**
     * Adds a node to the adjacencyList.
     * @param {Node} node - node in the graph
     */
    addConnection(node) {
        // Needs changes to account for hash.
        if (this.adjacencyList.find(x => x.hash === node.hash) === undefined &&
        node.hash !== this.hash) {
            this.adjacencyList.push(node);
            this.update();
        }
        // else console.warn('Trying to add an existing node in the adjacency list');
    }

    /**
     * Adds a node to the adjacencyList by finding in nodeList.
     * @param {String} hash - Identifier for lookup.
     * @param {Node[]} nodeList - List of nodes to look in.
     */
    addConnectionWithHash(hash, nodeList) {
        const node = nodeList.find(n => n.hash === hash);
        if (node === undefined) {
            console.warn("Couldn't find node in the nodeList");
            return;
        }
        if (!(node in this.adjacencyList)) {
            this.adjacencyList.push(node);
            this.update();
        }
        // else console.warn('Trying to add an exiting node in the adjacency list');
    }

    /**
     * Reattributes properties.
     * Only useful when manually manipulating adjacencyList.
     */
    update() {
        if (this.adjacencyList.length === 1) [this.next] = this.adjacencyList;
        else this.next = null;
    }
}
/** Segment with only nodes of order 1 except of the start and end points. */
class ElementarySegment {
    /**
     * @param {Node[]} nodes
     */
    constructor(nodes) {
        [this.start] = nodes;
        this.end = nodes[nodes.length - 1];
        this.nodes = nodes;
        this.hash = `${this.start.hash}_${this.end.hash}`;
        this.reverseHash = `${this.end.hash}_${this.start.hash}`;
        this.isLoop = this.start.hash === this.end.hash;
    }

    /**
     * Merges two elementary segments in no order.
     * @param {ElementarySegment} segment1 - First segment to merge.
     * @param {ElementarySegment} segment2 - Second segment to merge.
     * @returns {ElementarySegment}
     */
    static merge(segment1, segment2) {
        if (segment2.end === segment1.start) {
            const sliced = segment2.nodes.slice(0, -1);
            const nodes = [...sliced, ...segment1.nodes];
            return new ElementarySegment(nodes);
        }
        else if (segment2.start === segment1.end) {
            const nodes = [...segment1.nodes, ...segment2.nodes.slice(1)];
            return new ElementarySegment(nodes);
        }
        console.error('Merging segments with no common points', segment1, segment2);
        return {};
    }

    /** Updates properties */
    update() {
        [this.start] = this.nodes;
        this.end = this.nodes[this.nodes.length - 1];
        this.hash = `${this.start.hash}_${this.end.hash}`;
        this.reverseHash = `${this.end.hash}_${this.start.hash}`;
        this.isLoop = this.start.hash === this.end.hash;
    }
}


/**
 * Traverses a linear path till a node with degree greater than 1
 * and return an Array of ElementarySegments for the path.
 * @param {Node} startNode - Node to start traversal from.
 * @param {Object} visited - Dicitionary/Hashmap of visited Nodes.
 * @returns {ElementarySegment[]}
 */
function traverseTillSplit(startNode, visited) {
    if (startNode.getOrder() > 1) {
        startNode.adjacencyList = startNode.adjacencyList
            .filter(node => !visited[node.hash])
            .sort((a, b) => a.getOrder() - b.getOrder());
        startNode.update();
    }

    if (startNode.adjacencyList.length === 0) {
        return [];
    }
    else if (startNode.adjacencyList.every(n => n.getOrder() > 1)) {
        const specialPaths = startNode.adjacencyList
            .map(node => new ElementarySegment([startNode, node]));
        startNode.adjacencyList = [];
        startNode.update();
        return specialPaths;
    }

    const start = startNode;
    const elementarySegments = [];
    start.adjacencyList.forEach((pathPoint) => {
        let current = pathPoint;
        const linearPath = [];
        linearPath.push(start);
        while (current.next && current.hash !== startNode.hash && !visited[current.hash]) {
            linearPath.push(current);
            visited[current.hash] = true;
            current = current.next;
        }
        // Endpoint
        linearPath.push(current);
        if (current.getOrder() < 2) visited[current.hash] = true;
        elementarySegments.push(new ElementarySegment(linearPath));
    });
    return elementarySegments;
}

/**
 * Returns all elementary Segments.
 * @param {Node[]} nodeList - List of all the nodes in the Graph.
 * @returns {ElementarySegment[]}
 */
function makeElementarySegments(nodeList) {
    const visited = {};
    const elementarySegments = [];
    const specialNodeList = nodeList
        .filter(node => (node.getOrder() > 0))
        .map((node) => {
            if (node.getOrder > 1) {
                return new Node(node.data, node.hash, node.adjacencyList);
            }
            return node;
        });

    // First traversal with only specialNodes
    for (let index = 0; index < specialNodeList.length; index++) {
        const start = specialNodeList[index];
        if (visited[start.hash]) continue;
        if (start.getOrder() === 1) continue;
        else if (start.getOrder() === 0) {
            visited[start.hash] = true;
        }
        else {
            elementarySegments.push(...traverseTillSplit(start, visited));
        }
    }

    // Traversal for residue
    for (let index = 0; index < specialNodeList.length; index++) {
        const start = specialNodeList[index];
        if (visited[start.hash]) continue;
        if (start.getOrder() === 1) {
            visited[start.hash] = true;
            elementarySegments.push(...traverseTillSplit(start, visited));
        }
    }

    return elementarySegments;
}

export function altUnionOfConvexPolygons(polygonArray, precisionPoints = 4) {
    const vertexData = {};
    const edgeData = {};
    const precision = 10 ** precisionPoints;

    polygonArray.forEach((polygon) => {
        const orientedPolygon = [...polygon];
        if (utils.checkClockwise(orientedPolygon.map(v => [v.x, v.y]))) orientedPolygon.reverse();

        // Creates a edge hashmap with only valid edges
        for (let i = 0, l = polygon.length; i < l; i++) {
            const currentVertex = polygon[i];
            const nextVertex = polygon[(i + 1) % l];
            const currentVertexHash = `${Math.round(currentVertex.x * precision)},${Math.round(currentVertex.y * precision)},${Math.round(currentVertex.z * precision)}`;
            const nextVertexHash = `${Math.round(nextVertex.x * precision)},${Math.round(nextVertex.y * precision)},${Math.round(nextVertex.z * precision)}`;

            const edgeHash = `${currentVertexHash}_${nextVertexHash}`;
            const reverseEdgeHash = `${nextVertexHash}_${currentVertexHash}`;

            if (currentVertexHash === nextVertexHash) {
                continue;
            }

            if (reverseEdgeHash in edgeData && edgeData[reverseEdgeHash]) {
                edgeData[reverseEdgeHash] = null;
            }
            else if (!(edgeHash in edgeData)) {
                // if we've already got an edge here then skip adding a new one
                let vertex1;
                if (vertexData[currentVertexHash]) vertex1 = vertexData[currentVertexHash];
                else {
                    vertex1 = new Node(currentVertex, currentVertexHash);
                    vertexData[currentVertexHash] = vertex1;
                }

                let vertex2;
                if (vertexData[nextVertexHash]) vertex2 = vertexData[nextVertexHash];
                else {
                    vertex2 = new Node(nextVertex, nextVertexHash);
                    vertexData[nextVertexHash] = vertex2;
                }
                const line = new Line3(currentVertex, nextVertex);
                const hash = edgeHash;
                edgeData[edgeHash] = {
                    vertex1, vertex2, line, hash,
                };
            }
        }
    });

    Object.keys(edgeData).forEach((key) => {
        if (!edgeData[key]) {
            delete edgeData[key];
        }
    });

    const edges = Object.values(edgeData);
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        if (!edge) continue;
        edge.segments = [];
        for (let j = 1; j < edges.length; j++) {
            if (!edges[(j + i) % edges.length]) continue;
            const vertex = edges[(j + i) % edges.length].vertex1;
            if (vertex.hash === edge.vertex1.hash || vertex.hash === edge.vertex2.hash) continue;
            const target = new Vector3();
            edge.line.closestPointToPoint(vertex.data, true, target);
            if (target.distanceTo(vertex.data) < 0.00000001) {
                edge.segments.push(vertex);
            }
        }
        if (edge.segments.length > 0) {
            delete edgeData[edge.hash];
            const startingVertex = edge.vertex1;
            const endingVertex = edge.vertex2;
            edge.segments.sort((v1, v2) => v1.data.distanceTo(startingVertex.data) - v2.data.distanceTo(startingVertex.data));
            let prevVertex = startingVertex;
            edge.segments.push(endingVertex);
            let nextVertex;
            for (let j = 0; j < edge.segments.length; j++) {
                nextVertex = edge.segments[j];
                const newEdgeHash = `${prevVertex.hash}_${nextVertex.hash}`;
                const reverseEdgeHash = `${nextVertex.hash}_${prevVertex.hash}`;
                if (reverseEdgeHash in edgeData || newEdgeHash in edgeData) {
                    edgeData[reverseEdgeHash] = null;
                }
                else if (!(newEdgeHash in edgeData)) {
                    // if we've already got an edge here then skip adding a new one
                    edgeData[newEdgeHash] = {
                        hash: newEdgeHash,
                        line: new Line3(prevVertex.data, nextVertex.data),
                        vertex1: vertexData[prevVertex.hash],
                        vertex2: vertexData[nextVertex.hash],

                    };
                }
                prevVertex = nextVertex;
            }
        }
    }

    Object.keys(edgeData).forEach((key) => {
        if (!edgeData[key]) {
            delete edgeData[key];
        }
    });

    // Populate vertex graph using the edge data
    Object.values(edgeData).forEach((edge) => {
        if (!edge) return;
        if (edge.vertex1.hash in vertexData) {
            vertexData[edge.vertex1.hash].addConnection(edge.vertex2);
        }
        else {
            vertexData[edge.vertex1.hash] = edge.vertex1;
            vertexData[edge.vertex1.hash].addConnection(edge.vertex2);
        }
    });

    // Use the vertex graph to create loops
    const elementarySegments = makeElementarySegments(Object.values(vertexData));
    const segmentMap = {};
    const result = {
        loops: [],
        edges: [],
    };
    elementarySegments.forEach((segment) => {
        // if (segmentMap[segment.hash]) console.warn('segment already present in segmentMap');
        if (segmentMap[segment.reverseHash]) {
            segmentMap[segment.reverseHash] = ElementarySegment
                .merge(segmentMap[segment.reverseHash], segment);
            segmentMap[segment.hash] = null;
        }
        else segmentMap[segment.hash] = segment;
    });
    Object.values(segmentMap).forEach((segment) => {
        if (segment !== null) {
            if (segment.isLoop) {
                const unlooped = segment.nodes.slice(0, -1);
                result.loops.push(unlooped.map(n => n.data));
            }
            else result.edges.push(segment.nodes.map(n => n.data));
        }
    });
    result.edgeData = edgeData;
    result.vertexData = vertexData;

    return result;
}

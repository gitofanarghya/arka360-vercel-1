import * as THREE from 'three';
import { checkClockwise, convertVectorToArray } from '../../utils/utils';

export default class NikGeometry {
    constructor() {
        this.geometry = new THREE.BufferGeometry();
        this.vertices = [];
        this.topVertices = [];
        this.bottomVertices = [];
        this.triangles = [];
        this.topHoles = [];
        this.bottomHoles = [];
    }

    /**
     * The function accepts vertices and height to be extruded of the polygon to be created
     * @param {Array} points
     * @param {Number} height
     */
    createFromPoints(points, height, holes = []) {
        this.reset();

        const clockwise1 = checkClockwise(convertVectorToArray(points));
        this.bottomVertices = clockwise1 ? points.reverse() : points;

        for (let i = 0; i < this.bottomVertices.length; i += 1) {
            const vertex = this.bottomVertices[i].clone();
            vertex.setZ(height);

            this.topVertices.push(vertex);
        }
        if (holes.length > 0) {
            for (let i = 0; i < holes.length; i += 1) {
                const clockwise2 = checkClockwise(convertVectorToArray(holes[i]));
                const hole = clockwise2 ? holes[i].reverse() : holes[i];

                const top = [];
                for (let j = 0; j < hole.length; j += 1) {
                    const vertex = hole[i].clone();
                    vertex.setZ(height);
                    top.push(vertex);
                }

                this.bottomHoles.push(hole);
                this.topHoles.push(top);
            }
        }

        this.triangulateTopAndBottom();
        this.triangulateSides();
        this.setAttributes();

        return this.geometry;
    }

    /**
     * The function accepts top and bottom vertices of the polygon to be created
     * @param {Array} topPoints
     * @param {Array} bottomPoints
     */
    createFromTopAndBottomPoints(topPoints, bottomPoints, topHoles = [], bottomHoles = []) {
        this.reset();

        const clockwise1 = checkClockwise(convertVectorToArray(topPoints));
        if (clockwise1) {
            topPoints.reverse();
            bottomPoints.reverse();
        }
        this.topVertices = topPoints;
        this.bottomVertices = bottomPoints;

        if (topHoles.length > 0) {
            for (let i = 0; i < topHoles.length; i += 1) {
                const topHole = topHoles[i];
                const bottomHole = bottomHoles[i];
                const clockwise3 = checkClockwise(convertVectorToArray(topHole));
                if (clockwise3) {
                    topHole.reverse();
                    bottomHole.reverse();
                }

                this.topHoles.push(topHole);
                this.bottomHoles.push(bottomHole);
            }
        }

        this.triangulateTopAndBottom();
        this.triangulateSides();
        this.setAttributes();

        return this.geometry;
    }

    triangulateTopAndBottom() {
        const bottomTriangles = THREE.ShapeUtils.triangulateShape(this.bottomVertices, this.bottomHoles);
        // const topTriangles = THREE.ShapeUtils.triangulateShape(this.topVertices, this.topHoles);
        const bottom = [...this.bottomVertices];
        const top = [...this.topVertices];
        for (let i = 0; i < this.topHoles.length; i += 1) {
            const len = this.topHoles[i].length;

            for (let j = 0; j < len; j += 1) {
                bottom.push(this.bottomHoles[i][j]);
                top.push(this.topHoles[i][j]);
            }
        }

        for (let i = 0; i < bottomTriangles.length; i += 1) {
            const triangle = bottomTriangles[i];
            this.triangles.push(...bottom[triangle[2]]);
            this.triangles.push(...bottom[triangle[1]]);
            this.triangles.push(...bottom[triangle[0]]);

            this.triangles.push(...top[triangle[0]]);
            this.triangles.push(...top[triangle[1]]);
            this.triangles.push(...top[triangle[2]]);
        }
        // for (let i = 0; i < topTriangles.length; i += 1) {
        //     const triangle = topTriangles[i];
        //     this.triangles.push(...top[triangle[0]]);
        //     this.triangles.push(...top[triangle[1]]);
        //     this.triangles.push(...top[triangle[2]]);
        // }
    }

    triangulateSides() {
        const length = this.topVertices.length - 1;

        for (let i = 0; i < length; i += 1) {
            this.triangles.push(...this.topVertices[i]);
            this.triangles.push(...this.bottomVertices[i]);
            this.triangles.push(...this.bottomVertices[i + 1]);
            //
            this.triangles.push(...this.bottomVertices[i + 1]);
            this.triangles.push(...this.topVertices[i + 1]);
            this.triangles.push(...this.topVertices[i]);
        }
        this.triangles.push(...this.topVertices[length]);
        this.triangles.push(...this.bottomVertices[length]);
        this.triangles.push(...this.bottomVertices[0]);


        this.triangles.push(...this.bottomVertices[0]);
        this.triangles.push(...this.topVertices[0]);
        this.triangles.push(...this.topVertices[length]);

        if (this.topHoles.length > 0) {
            for (let i = 0; i < this.topHoles.length; i += 1) {
                const holeLength = this.topHoles[i].length - 1;

                for (let j = 0; j < holeLength; j += 1) {
                    this.triangles.push(...this.topHoles[i][j]);
                    this.triangles.push(...this.bottomHoles[i][j]);
                    this.triangles.push(...this.bottomHoles[i][j + 1]);
                    //
                    this.triangles.push(...this.bottomHoles[i][j + 1]);
                    this.triangles.push(...this.topHoles[i][j + 1]);
                    this.triangles.push(...this.topHoles[i][j]);
                }

                this.triangles.push(...this.topHoles[i][holeLength]);
                this.triangles.push(...this.bottomHoles[i][holeLength]);
                this.triangles.push(...this.bottomHoles[i][0]);

                this.triangles.push(...this.bottomHoles[i][0]);
                this.triangles.push(...this.topHoles[i][0]);
                this.triangles.push(...this.topHoles[i][holeLength]);
            }
        }
    }

    setAttributes() {
        const positions = new Float32Array(this.triangles);
        // const uv = this.triangles.filter((_, i) => (i + 1) % 3);
        // if (this.topHoles.length > 0) {
        //     console.log(this.topVertices);
        //     console.log(this.topHoles);
        // }
        // const uvs = new Float32Array(uv);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(positions, 2));
        this.geometry.computeVertexNormals();
    }

    reset() {
        this.vertices = [];
        this.topVertices = [];
        this.bottomVertices = [];
        this.triangles = [];
        this.topHoles = [];
        this.bottomHoles = [];
    }
}


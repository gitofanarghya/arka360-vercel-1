export default class SLDBaseClass {
    constructor(stage) {
        this.stage = stage;

        this.connections = {
            startPoints: [],
            endPoints: [],
            startComponents: [],
            endComponents: [],
        };

        this.boundingBox = {
            max: {
                x: undefined,
                y: undefined,
            },
            min: {
                x: undefined,
                y: undefined,
            },
        };
    }

    addStartPoint(point) {
        this.connections.startPoints.push(point);
    }
    addEndPoint(point) {
        this.connections.endPoints.push(point);
    }
    addStartComponent(component) {
        this.connections.startComponents.push(component);
    }
    addEndComponent(component) {
        this.connections.endComponents.push(component);
    }
}

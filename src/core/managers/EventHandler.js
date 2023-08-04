
export default class EventHandler {
    constructor() {
        this.mouseMoves = [];
    }

    addEvent(event) {
        this.mouseMoves.push(event);
    }

    update(event) {
        this.mouseMoves.forEach((func) => {
            if (func !== undefined) {
                func(event);
            }
        });
    }

    removeEvent(idx) {
        this.mouseMoves.splice(idx, 1);
    }

    getIndex() {
        return this.mouseMoves.length - 1;
    }
}

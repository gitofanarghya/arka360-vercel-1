import Dormer from "../Dormer";

export default class GabledDormer extends Dormer {
    constructor(stage){
        super(stage);
        this.stage = stage;
        this.type = "Gabled Dormer";
    }
}
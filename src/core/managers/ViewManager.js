import Mousetrap from 'mousetrap';
import PolygonModel from '../objects/model/PolygonModel';
import Ground from '../objects/ground/Ground';
import Subarray from '../objects/subArray/Subarray';
import CylinderModel from '../objects/model/CylinderModel';
import Dimension from '../objects/subObjects/Dimension';
import Walkway from '../objects/model/Walkway';
import Handrail from '../objects/model/Handrail';
import Property from '../objects/model/Property';
import Tree from '../objects/model/Tree';
import Inverter from '../objects/ac/Inverter';
import ACDB from '../objects/ac/ACDB';
import DCDB from '../objects/ac/DCDB';
import Conduit from '../objects/ac/conduits/Conduit';
import DoubleConduit from '../objects/ac/conduits/DoubleConduit';
import DoubleSeparateConduit from '../objects/ac/conduits/DoubleSeparateConduit';
import SingleCableTray from '../objects/ac/cableTrays/SingleCableTray';
import DoubleCableTray from '../objects/ac/cableTrays/DoubleCableTray';
import DoubleSeparateCableTray from '../objects/ac/cableTrays/DoubleSeparateCableTray';
import TextBox from '../objects/subObjects/TextBox';
import AcCable from '../objects/model/cable/AcCable';
import DcCable from '../objects/model/cable/DcCable';
import { getAllModelType, getInverters, getModels } from '../../core/utils/exporters';
import { SmartroofModel } from '../objects/model/smartroof/SmartroofModel';
import SmartroofFace from '../objects/model/smartroof/SmartroofFace';
import Dormer from '../objects/model/smartroof/Dormer';
import CombinerBox from '../objects/ac/CombinerBox';
import MicroInverter from '../objects/ac/MicroInverter';
import {POLYGON_EDGE_CENTER_VISIBILTY_DEFAULT, EDGE_LENGTH_VISIBILTY_DEFAULT, ARC_VISIBILTY_DEFAULT, RAFTER_VISIBILTY_DEFAULT, PROPERTY_VISIBILTY_DEFAULT, DIMENSION_VISIBILTY_DEFAULT, SETBACK_VISIBILTY_DEFAULT, MAPIMAGE_VISIBILTY_DEFAULT, STRINGING_VISIBILTY_DEFAULT} from '../coreConstants';
import { useMapImagesStore } from '../../stores/mapImages';

export default class ViewManager {
    constructor(stage) {
        this.stage = stage;
        this.init();
        this.keyPressed = false;
        this.bindXRayVision();
    }

    bindXRayVision() {
        Mousetrap.bind('x', this.xRayVisionOn.bind(this), 'keydown');
        Mousetrap.bind('x', this.xRayVisionOff.bind(this), 'keyup');
    }

    unbindXRayVision() {
        Mousetrap.unbind('x', 'keydown');
        Mousetrap.unbind('x', 'keyup');
    }

    init() {
        this.lengthVisible = EDGE_LENGTH_VISIBILTY_DEFAULT;
        this.arcVisible = ARC_VISIBILTY_DEFAULT;
        this.rafterVisible = RAFTER_VISIBILTY_DEFAULT;
        this.propertyVisible = PROPERTY_VISIBILTY_DEFAULT;
        this.dimensionVisible = DIMENSION_VISIBILTY_DEFAULT;
        this.setbackVisible = SETBACK_VISIBILTY_DEFAULT;
        this.mapImageVisible = MAPIMAGE_VISIBILTY_DEFAULT;
        this.edgeCenterVisible = POLYGON_EDGE_CENTER_VISIBILTY_DEFAULT;
        this.showStringing = STRINGING_VISIBILTY_DEFAULT;
        this.selectedObjects = [];
    }

    toggleMapImage() {
        if (this.mapImageVisible) {
            this.hideMapImage();
        } else {
            this.showMapImage();
        }
    }

    toggleLength() {
        this.selectedObjects = this.stage.selectionControls.getSelectedObjects();

        if (this.lengthVisible) {
            this.hideLengthMeasurements();
        } else {
            this.showLengthMeasurements();
        }
    }

    toggleArc() {
        this.selectedObjects = this.stage.selectionControls.getSelectedObjects();

        if (this.arcVisible) {
            this.hideArcMeasurements();
        } else {
            this.showArcMeasurements();
        }
    }

    toggleRafter() {
        if (this.rafterVisible) {
            this.hideRafter();
        } else {
            this.showRafter();
        }
    }

    onToggleProperty() {
        if (this.propertyVisible) {
            this.hideProperty();
        } else {
            this.showProperty();
        }
    }

    toggleSetback() {
        this.selectedObjects = this.stage.selectionControls.getSelectedObjects();

        if (this.setbackVisible) {
            this.hideSetbacks();
        } else {
            this.showSetbacks();
        }
    }

    toggleDimension() {
        this.selectedObjects = this.stage.selectionControls.getSelectedObjects();

        if (this.dimensionVisible) {
            this.dimensionVisible = false;
            this.hideDimensions(false);
        } else {
            this.dimensionVisible = true;
            this.showDimensions();
        }
    }

    toggleEdgeCenter() {
        if (this.keyPressed) {
            return;
        }
        if (this.edgeCenterVisible) {
            this.edgeCenterVisible = false;
            // below commented because mergedMesh edge centers will be merged.
            // this.hideEdgeCenters(this.stage.ground);
            this.stage.mergeManager.displayMeshes();
        } else {
            this.edgeCenterVisible = true;
            // this.showEdgeCenters(this.stage.ground);
            this.stage.mergeManager.displayMeshes();
        }
    }

    toggleShowStringing() {
        if (this.showStringing) {
            this.showStringing = false;
            this.hideStringing();
        } else {
            this.showStringing = true;
            if (!this.stage.visualManager.getIn3D()) {
                this.showStringingFunc();
            }
        }
    }

    hideMapImage() {
        this.mapImageVisible = false;
        useMapImagesStore().groundMapImageVisible = false;
        this.stage.ground.hideImage();
        this.stage.customImageManager.hideAllImages();
    }

    hideLengthMeasurements() {
        this.lengthVisible = false;
        for (let i = 0, len = this.selectedObjects.length; i < len; i += 1) {
            if (this.selectedObjects[i] instanceof PolygonModel) {
                this.selectedObjects[i].polygonMeasurement.hideLength();
            } else if (this.selectedObjects[i] instanceof CylinderModel) {
                this.selectedObjects[i].polygonMeasurement.hide();
            } else if (this.selectedObjects[i] instanceof SmartroofModel) {
                this.selectedObjects[i].polygonMeasurement.hideLength();
            } else if (this.selectedObjects[i] instanceof SmartroofFace) {
                this.selectedObjects[i].polygonMeasurement.hideLength();
            } else if (this.selectedObjects[i] instanceof Dormer) {
                this.selectedObjects[i].polygonMeasurement.hideLength();
            } else if (this.selectedObjects[i] instanceof Walkway) {
                this.selectedObjects[i].lengthMeasurement.hide();
            } else if (this.selectedObjects[i] instanceof Tree) {
                this.selectedObjects[i].trunkMeasurement.hide();
                this.selectedObjects[i].crownMeasurement.hide();
            }
        }
    }

    hideArcMeasurements() {
        this.arcVisible = false;
        for (let i = 0; i < this.selectedObjects.length; i += 1) {
            const obj = this.selectedObjects[i];
            if (obj instanceof PolygonModel || obj instanceof SmartroofModel || obj instanceof SmartroofFace || obj instanceof Dormer) {
                obj.polygonMeasurement.hideArc();
            }
        }
    }

    hideRafter() {
        this.rafterVisible = false;
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        result.smartroofFaces.forEach((object) => {
            object.hideRafter();
        });
    }

    hideProperty() {
        this.propertyVisible = false;
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        result.property.forEach((object) => {
            object.hideObjectLayer();
        });
        this.stage.selectionControls.setSelectedObject(this.stage.ground);
    }

    hideDimensions(forXRay = true) {
        if (!forXRay) {
            for (let i = 0; i < this.selectedObjects.length; i += 1) {
                const obj = this.selectedObjects[i];
                if (obj instanceof Dimension) {
                    this.stage.selectionControls.setSelectedObject(this.stage.ground);
                }
            }
        }
        const dimensionKeys = Object.keys(this.stage.dimensionObjects);
        for (let i = 0; i < dimensionKeys.length; i += 1) {
            this.stage.dimensionObjects[dimensionKeys[i]].hide();
        }
    }

    hideSetbacks() {
        this.setbackVisible = false;
        for (let i = 0; i < this.selectedObjects.length; i += 1) {
            const obj = this.selectedObjects[i];
            if (obj instanceof PolygonModel || obj instanceof CylinderModel || obj instanceof SmartroofFace || obj instanceof Dormer) {
                obj.hideSetback();
            }
        }
    }

    hideEdgeCenters(object) {
        if (object instanceof Ground) {
            object.getChildren().forEach((child) => {
                if (child instanceof PolygonModel) {
                    this.hideEdgeCenters(child);
                }
            });
        } else if (object instanceof PolygonModel) {
            if (!object.isSelected) {
                object.hideEdgeCenters(true);
            }
            object.getChildren().forEach((child) => {
                if (child instanceof PolygonModel) {
                    this.hideEdgeCenters(child);
                }
            });
        } else {
            console.error('ViewManager: hideEdgeCenters: Object type not handled.', object);
        }
    }

    hideStringing() {
        const invertersArray = getInverters(this.stage);
        for (let i = 0; i < invertersArray.length; i++) {
            if (invertersArray[i]) {
                const mpptsArray = invertersArray[i].mppts;
                for (let j = 0; j < mpptsArray.length; j++) {
                    for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                        mpptsArray[j].strings[k].hideStringColor();
                    }
                }
            }
        }
        const microInverters = this.stage.ground.microInverters;
        for (let i = 0; i < microInverters.length; i++) {
            for (let j = 0; j < microInverters[i].strings.length; j++) {
                microInverters[i].strings[j].hideStringColor();
            }
            microInverters[i].hideObject();
        }
        this.stage.selectionControls.setSelectedObject(this.stage.ground)
    }

    showMapImage() {
        this.mapImageVisible = true;
        useMapImagesStore().groundMapImageVisible = true;
        this.stage.ground.showImage();
        this.stage.customImageManager.showAllImages();
    }

    showLengthMeasurements() {
        this.lengthVisible = true;
        for (let i = 0, len = this.selectedObjects.length; i < len; i += 1) {
            if (this.selectedObjects[i] instanceof PolygonModel) {
                this.selectedObjects[i].polygonMeasurement.showLength();
            } else if (this.selectedObjects[i] instanceof CylinderModel) {
                this.selectedObjects[i].polygonMeasurement.show();
            } else if (this.selectedObjects[i] instanceof SmartroofModel) {
                this.selectedObjects[i].polygonMeasurement.showLength();
            } else if (this.selectedObjects[i] instanceof SmartroofFace) {
                this.selectedObjects[i].polygonMeasurement.showLength();
            } else if (this.selectedObjects[i] instanceof Dormer) {
                this.selectedObjects[i].polygonMeasurement.showLength();
            } else if (this.selectedObjects[i] instanceof Walkway) {
                this.selectedObjects[i].lengthMeasurement.show();
            } else if (this.selectedObjects[i] instanceof Tree) {
                this.selectedObjects[i].trunkMeasurement.show();
                this.selectedObjects[i].crownMeasurement.show();
            }
        }
    }

    showArcMeasurements() {
        this.arcVisible = true;
        for (let i = 0; i < this.selectedObjects.length; i += 1) {
            const obj = this.selectedObjects[i];
            if (obj instanceof PolygonModel || obj instanceof SmartroofModel || obj instanceof SmartroofFace || obj instanceof Dormer) {
                obj.polygonMeasurement.showArc();
            }
        }
    }

    showRafter() {
        this.rafterVisible = true;
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        result.smartroofFaces.forEach((object) => {
            object.updateRafter();
            object.showAttachments();
        });
    }

    showProperty() {
        this.propertyVisible = true;
        const result = getAllModelType();
        getModels(this.stage.ground, result);
        result.property.forEach((object) => {
            object.showObjectLayer();
        });
    }

    showDimensions() {
        const dimensionKeys = Object.keys(this.stage.dimensionObjects);
        for (let i = 0; i < dimensionKeys.length; i += 1) {
            this.stage.dimensionObjects[dimensionKeys[i]].show();
        }
    }

    showSetbacks() {
        this.setbackVisible = true;
        for (let i = 0; i < this.selectedObjects.length; i += 1) {
            const obj = this.selectedObjects[i];
            if (obj instanceof PolygonModel || obj instanceof CylinderModel || obj instanceof SmartroofFace || obj instanceof Dormer) {
                obj.showSetback();
            }
        }
    }

    showEdgeCenters(object) {
        if (object instanceof Ground) {
            object.getChildren().forEach((child) => {
                if (child instanceof PolygonModel) {
                    this.showEdgeCenters(child);
                }
            });
        } else if (object instanceof PolygonModel) {
            object.showEdgeCenters(true);
            object.getChildren().forEach((child) => {
                if (child instanceof PolygonModel) {
                    this.showEdgeCenters(child);
                }
            });
        } else {
            console.error('ViewManager: showEdgeCenters: Object type not handled.', object);
        }
    }

    showStringingFunc() {
        const invertersArray = getInverters(this.stage);
        for (let i = 0; i < invertersArray.length; i++) {
            if (invertersArray[i]) {
                const mpptsArray = invertersArray[i].mppts;
                for (let j = 0; j < mpptsArray.length; j++) {
                    for (let k = 0; k < mpptsArray[j].strings.length; k += 1) {
                        mpptsArray[j].strings[k].editStringColor();
                        mpptsArray[j].strings[k].displayStringForStringing();
                    }
                }
            }
        }
        const microInverters = this.stage.ground.microInverters;
        // what is this logic --FIXED
        for (let i = 0; i < microInverters.length; i++) {
            for (let j = 0; j < microInverters[i].strings.length; j++) {
                microInverters[i].strings[j].displayStringForStringing();
            }
            microInverters[i].showObject();
        }
    }

    areDimensionsVisible() {
        return this.dimensionVisible;
    }

    xRayVisionOn(event) {
        if (event.keyCode === 88 && this.stage.sldView === false) {
            if (!this.keyPressed) {
                this.keyPressed = true;
                this.selectedObjects = this.stage.selectionControls.getSelectedObjects();
                this.hideDimensions(true);
                this.selectedObjects = this.stage.selectionControls.getSelectedObjects();
                this.stage.heatMap.hideObjectLayer();
                this.stage.mergeManager.hideMergedMesh();
                this.enableXray(this.stage.ground);
                this.stage.ground.hideRoofTexture();
                for (let i = 0; i < this.selectedObjects.length; i += 1) {
                    const obj = this.selectedObjects[i];
                    if (!(obj instanceof Dimension)) obj.showObjectLayer(true);
                }
                if (this.stage.structures !== null) {
                    this.stage.structures.visible = false;
                }
            }
        }
    }

    xRayVisionOff(event) {
        if (event.keyCode === 88) {
            if (this.keyPressed) {
                this.keyPressed = false;
                this.showDimensions();
                this.stage.heatMap.showObjectLayer();
                this.stage.mergeManager.showMergedMesh();
                this.disableXray(this.stage.ground);
                this.stage.ground.showRoofTexture();
                if (this.stage.structures !== null) {
                    this.stage.structures.visible = true;
                }
            }
        }
    }

    updateSelectedObjects(selectedObjects) {
        if (this.keyPressed) {
            for (let i = 0; i < this.selectedObjects.length; i += 1) {
                const obj = this.selectedObjects[i];
                if (!(obj instanceof Ground || obj instanceof Dimension)) {
                    obj.hideObjectLayer();
                }
            }
            this.selectedObjects = selectedObjects;
            for (let i = 0; i < this.selectedObjects.length; i += 1) {
                const obj = this.selectedObjects[i];
                if (!(obj instanceof Ground || obj instanceof Dimension)) {
                    obj.showObjectLayer();
                }
            }
        }
    }

    enableXray(object) {
        if (object instanceof Ground) {
            object.getChildren().forEach((child) => {
                this.enableXray(child);
            });
        } else if (object instanceof PolygonModel ||
            object instanceof CylinderModel ||
            object instanceof Handrail ||
            object instanceof Property ||
            object instanceof SmartroofModel ||
            object instanceof SmartroofFace ||
            object instanceof Dormer ||
            object instanceof Walkway) {
            object.hideObjectLayer();
            object.getChildren().forEach((child) => {
                this.enableXray(child);
            });
        } else if (object instanceof Subarray ||
            object instanceof Tree ||
            object instanceof Inverter ||
            object instanceof ACDB ||
            object instanceof DCDB ||
            object instanceof AcCable ||
            object instanceof DcCable ||
            object instanceof Conduit ||
            object instanceof DoubleConduit ||
            object instanceof DoubleSeparateConduit ||
            object instanceof SingleCableTray ||
            object instanceof DoubleCableTray ||
            object instanceof DoubleSeparateCableTray ||
            object instanceof CombinerBox ||
            object instanceof MicroInverter ||
            object instanceof TextBox) {
            object.hideObjectLayer();
        } else {
            console.error('ViewManager: enableXray: Object type not handled.', object);
        }
    }

    disableXray(object) {
        if (object instanceof Ground) {
            object.getChildren().forEach((element) => {
                this.disableXray(element);
            });
        } else if (object instanceof PolygonModel ||
            object instanceof CylinderModel ||
            object instanceof Handrail ||
            object instanceof Property ||
            object instanceof SmartroofModel ||
            object instanceof SmartroofFace ||
            object instanceof Dormer ||
            object instanceof Walkway) {
            object.showObjectLayer();
            object.getChildren().forEach((element) => {
                this.disableXray(element);
            });
        } else if (object instanceof Subarray ||
            object instanceof Tree ||
            object instanceof Inverter ||
            object instanceof AcCable ||
            object instanceof DcCable ||
            object instanceof Conduit ||
            object instanceof DoubleConduit ||
            object instanceof DoubleSeparateConduit ||
            object instanceof SingleCableTray ||
            object instanceof DoubleCableTray ||
            object instanceof DoubleSeparateCableTray ||
            object instanceof ACDB ||
            object instanceof DCDB ||
            object instanceof CombinerBox ||
            object instanceof MicroInverter ||
            object instanceof TextBox) {
            object.showObjectLayer();
        } else {
            console.error('ViewManager: disableXray: Object type not handled.', object);
        }
    }

    enableDimensions() {
        const dimensionKeys = Object.keys(this.stage.dimensionObjects);
        for (let i = 0; i < dimensionKeys.length; i += 1) {
            this.stage.dimensionObjects[dimensionKeys[i]].enable();
        }
    }

    disableDimensions() {
        const dimensionKeys = Object.keys(this.stage.dimensionObjects);
        for (let i = 0; i < dimensionKeys.length; i += 1) {
            this.stage.dimensionObjects[dimensionKeys[i]].disable();
        }
    }

    // ANOTHER METHOD FOR ENABLING AND DISABLING (using previous hide / show of objects)
    /*
    enableXray(){
        this.selectedObject = this.stage.selectionControls.getSelectedObject();
        let length = this.stage.sceneManager.scene.children.length;
        for (let i=0 ; i < length ; i++) {
            if (this.stage.sceneManager.scene.children[i].container instanceof PolygonModel ||
                this.stage.sceneManager.scene.children[i].container instanceof Subarray) {
                console.log(this.stage.sceneManager.scene.children[i]);
                if (this.stage.sceneManager.scene.children[i].container ==
                    this.stage.drawManager.currentDrawingObject ||
                    this.stage.sceneManager.scene.children[i].container ==
                    this.selectedObject) {

                }
                else{
                    this.stage.sceneManager.scene.children[i].container.hideObject();
                }
           }
        }
    }

    disableXray(){
        let length = this.stage.sceneManager.scene.children.length;
        this.selectedObject = this.stage.selectionControls.getSelectedObject();

        for(let i=0 ; i < length ; i++){
            if(this.stage.sceneManager.scene.children[i].container instanceof PolygonModel ||
                    this.stage.sceneManager.scene.children[i].container instanceof Subarray){
                console.log(this.stage.sceneManager.scene.children[i]);
                if(this.stage.sceneManager.scene.children[i].container ==
                        this.stage.drawManager.currentDrawingObject ||
                        this.stage.sceneManager.scene.children[i].container ==
                        this.selectedObject){

                }
                else{
                    this.stage.sceneManager.scene.children[i].container.showObject();
                }
           }
        }
    } */
}
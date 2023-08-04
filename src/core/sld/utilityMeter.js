/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import * as THREE from 'three';
import DropDownTool from './dropDownTool';
import { utilityMeterList } from './sldConstants';
import TopFed from './UtilityMeter & MSP/TopFed';
import CenterFed from './UtilityMeter & MSP/CenterFed';
import BottomFed from './UtilityMeter & MSP/BottomFed';
import NoMain from './UtilityMeter & MSP/NoMain';
import WithSubPanel from './UtilityMeter & MSP/WithSubPanel';
import NoMainWithSubPanel from './UtilityMeter & MSP/NoMainWithSubPanel';
import SolarReadyPanel from './UtilityMeter & MSP/SolarReadyPanel';
import GeneracGeneratorSystem from './UtilityMeter & MSP/GeneracGeneratorSystem';
import TapWithJunctionBox from './UtilityMeter & MSP/TapWithJunctionBox';
import MainHotBusPanel from './UtilityMeter & MSP/MainHotBusPanel';
import LoadSideTap from './UtilityMeter & MSP/LoadSideTap';
import LineSideTap from './UtilityMeter & MSP/LineSideTap';
import LineSideTapWithDitachedMSP from './UtilityMeter & MSP/LineSideTapWithDitachedMSP';
import MeterMain from './UtilityMeter & MSP/MeterMain';

export default class UtilityMeter {
    constructor(origin, previousEndPoints, font, groupSLD, group3LD, wireSize, isMicroInverter = false) {
        this.parentSLD = groupSLD;
        this.parent3LD = group3LD;
        this.origin = origin;
        this.origin1 = [origin[0], origin[1] + 40];
        this.origin2 = [origin[0] + 40, origin[1]];
        [this.originX, this.originY] = this.origin;
        this.size = 60;

        this.font = font;
        this.wireSize = wireSize;
        // Arrays of Points
        this.previousEndPoints = previousEndPoints; // AC Disconnect box End Points
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.bluePolyLines = [];
        this.whiteLines = [];
        this.redLines = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.whiteEllipse = [];
        this.whiteCircles = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.leaders = [];
        this.dashedLines = [];
        this.startPoints = []; // starting points of utility meter
        this.connectionPoints = []; // upper and lower joining points for the wires

        this.isMicroInverter = isMicroInverter;
        this.topFed = true; // Default Set to Top Fed
        this.centerFed = false;
        this.bottomFedWithDownUtility = false;
        this.noMain = false;
        this.withSubPanel = false;
        this.noMainWithSubPanel = false;
        this.solarReadyPanel = false;
        this.generacGeneratorSystem = false;
        this.lineSideTapWithDitachedMsp = false;
        this.loadSideTap = false;
        this.lineSideTap = false;
        this.tapWithJunctionBox = false;
        this.mainHotBusPanel = false;
        this.dualLugDisconnectInMeterCombo = false;
        this.meterMain = false;

        this.sldObjectsGroup = new THREE.Group(); // SLD layer Group (Always visible)
        this.sldObjectsGroup.name = 'utility-meter-group-sld'; // SLD group name for dropdown
        this.s3ldObjectsGroup = new THREE.Group(); // 3LD layer Group (Only visible in 3LD mode)
        this.s3ldObjectsGroup.name = 'utility-meter-group-3ld'; // 3LD group name for drapdown
        this.toolGroup = new THREE.Group();

        const dropDownPosition = new THREE.Vector2(this.originX + this.size, this.originY + (this.size * 3));
        this.dropDownTool = new DropDownTool(dropDownPosition.x, dropDownPosition.y, this);
        this.selected = 0;

        // Create TopFed Utility Meter By Default
        this.defaultComponent = new TopFed(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
        this.currentComponent = this.defaultComponent;
        // this.defaultComponent.createComponent();
    }

    selectionControl(i) {
        for (let k = 0; k < this.parentSLD.children.length; k += 1) {
            if (this.parentSLD.children[k].name === 'utility-meter-group-sld') {
                this.parentSLD.children.splice(k, 1);
                break;
            }
        }
        for (let j = 0; j < this.parent3LD.children.length; j += 1) {
            if (this.parent3LD.children[j].name === 'utility-meter-group-3ld') {
                this.parent3LD.children.splice(j, 1);
                break;
            }
        }

        this.sldObjectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.parentSLD.add(this.sldObjectsGroup);
        this.parent3LD.add(this.s3ldObjectsGroup);
        this.selected = i;
        // check the component selected in the dropdown and create component according to the selected component

        if (i === 0) { // Top Fed
            const topFedMode = new TopFed(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            topFedMode.createComponent();
            this.currentComponent = topFedMode;
        }
        else if (i === 1) { // Center Fed
            const centerFedMode = new CenterFed(this.origin1, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            centerFedMode.createComponent();
            this.currentComponent = centerFedMode;
        }
        else if (i === 2) { // Bottom Fed With Down Utility
            const bottomFedMode = new BottomFed(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            bottomFedMode.createComponent();
            this.currentComponent = bottomFedMode;
        }
        else if (i === 3) { // No Main
            const noMainMode = new NoMain(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            noMainMode.createComponent();
            this.currentComponent = noMainMode;
        }
        else if (i === 4) { // with Sub panel
            const withSubPanelMode = new WithSubPanel(this.origin2, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            withSubPanelMode.createComponent();
            this.currentComponent = withSubPanelMode;
        }
        else if (i === 5) { // No Main with Sub Panel
            const noMainWithSubPanelMode = new NoMainWithSubPanel(this.origin2, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            noMainWithSubPanelMode.createComponent();
            this.currentComponent = noMainWithSubPanelMode;
        }
        else if (i === 6) { // Solar Ready Panel
            const solarReadyPanelMode = new SolarReadyPanel(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            solarReadyPanelMode.createComponent();
            this.currentComponent = solarReadyPanelMode;
        }
        else if (i === 7) { // Generac Generator System
            const generacGeneratorSystemMode = new GeneracGeneratorSystem(this.origin2, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            generacGeneratorSystemMode.createComponent();
            this.currentComponent = generacGeneratorSystemMode;
        }
        else if (i === 8) { // Load Side Tap
            const loadSideTapMode = new LoadSideTap(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            loadSideTapMode.createComponent();
            this.currentComponent = loadSideTapMode;
        }
        else if (i === 9) { // Line Side Tap
            const lineSideTapMode = new LineSideTap(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            lineSideTapMode.createComponent();
            this.currentComponent = lineSideTapMode;
        }
        else if (i === 10) { // Line Side Tap With Ditached Msp
            const lineSideTapWithDitachedMspMode = new LineSideTapWithDitachedMSP(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            lineSideTapWithDitachedMspMode.createComponent();
            this.currentComponent = lineSideTapWithDitachedMspMode;
        }
        else if (i === 11) { // Tap With Junction Box
            const tapWithJunctionBoxMode = new TapWithJunctionBox(this.origin1, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            tapWithJunctionBoxMode.createComponent();
            this.currentComponent = tapWithJunctionBoxMode;
        }
        else if (i === 12) {
            const mainHotBusPanelMode = new MainHotBusPanel(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            mainHotBusPanelMode.createComponent();
            this.currentComponent = mainHotBusPanelMode;
        }
        else if (i === 13){
            const meterMainMode = new MeterMain(this.origin, this.previousEndPoints, this.font, this.sldObjectsGroup, this.s3ldObjectsGroup, this.wireSize, this.isMicroInverter);
            meterMainMode.createComponent();
            this.currentComponent = meterMainMode;
        }
    }
    getNames() {
        return utilityMeterList;
    }
    getDefault() {
        return this.selected;
    }
}

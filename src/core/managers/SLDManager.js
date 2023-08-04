/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import * as THREE from 'three';
import { saveAs } from 'file-saver';
import {
    getInverters,
    getTimeStamp,
    inverterElectricalMapExporter,
} from '../utils/exporters';
import { getInverterSizing } from '../utils/inverterUtils';
import GroupOfStrings from '../sld/groupofstrings';
import ProductionMeter from '../sld/productionMeter';
import UtilityMeter from '../sld/utilityMeter';
import loadThreeJsFont, { outputDocument, setSceneZoom } from '../sld/sldUtils';
import wireSizeCalculator from '../../services/api/wireSizeCalculator';
import InverterSLD from '../sld/InverterSLD';
import LoadCenter from '../sld/loadCenter';
import AcDisconnectBox from '../sld/acDisconnectBox';
import { MICRO_INVERTER, STRING_INVERTER } from '../sld/sldConstants';
import { getModuleMake, getTemperatureData, addAllrgbwgos } from '../sld/utils';
import JunctionBox from '../sld/junctionBox';

export default class SLDManager {
    constructor(stage) {
        this.dropDownToolMesh = [];
        this.stage = stage;
        // store sld data
        this.totalModulesLeft = undefined;
        this.isContainOptimizer = false;
        this.isStrung = false;
        this.pos = 0;
        this.objectsGroup = new THREE.Group();
        this.objectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.objectsGroup);
        // 3ld objects group
        this.s3ldObjectsGroup = new THREE.Group();
        this.s3ldObjectsGroup.container = this;
        this.stage.sceneManager.scene.add(this.s3ldObjectsGroup);
        // exclusive sld
        this.exclusivesld = new THREE.Group();
        this.exclusivesld.container = this;
        this.stage.sceneManager.scene.add(this.exclusivesld);
        // exclusive 3ld
        this.exclusive3ld = new THREE.Group();
        this.exclusive3ld.container = this;
        this.stage.sceneManager.scene.add(this.exclusive3ld);
        this.inverterData = [];
        // objects group is hidden by default
        this.toolMeshes = [];

        // exporter data
        this.whiteLines = [];
        this.whitePolyLines = [];
        this.whitesld = [];
        this.white3ld = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.greenPoly3ld = [];
        this.redLines = [];
        this.redPolyLines = [];
        this.redCircles = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.blueCircles = [];
        this.greenLines = [];
        this.greenCircles = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.bluePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenCircles3ld = [];
        this.dashedLines = [];
        this.leaders = [];
        this.acDisconnectBoxArrangenment = 3;

        this.components = [];
        this.is3LD = false;
        this.hideObject();
        this.loadFont();
        this.temperatureData = null;
        this.isMeterEnabled = true;
    }
    async loadFont() {
        this.threeJsFont = await loadThreeJsFont('https://sld-assets.s3.ap-south-1.amazonaws.com/Arial_Regular.json');
    }
    changeAcDisconnect(newValue) {
        this.components = [];
        this.toolMeshes = [];
        this.objectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.exclusivesld.clear();
        this.exclusive3ld.clear();
        this.acDisconnectBoxArrangenment = newValue;
        this.createSLD();
    }
    createSLD() {
        if (this.isStringInverter) {
            this.createStringSLD();
        }
        else {
            this.createMicroSLD();
        }
        // this.exportAsDXF();
        setSceneZoom(
            this.stage,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            this.exclusive3ld,
            this.exclusivesld,
            1.2,
        );
        const boundingBox = (new THREE.Box3()).setFromObject(this.objectsGroup);
        const planeWidth = boundingBox.max.x * 400;
        const planeHeight = boundingBox.max.y * 400;
        this.addBlackPlane(planeHeight, planeWidth);
    }
    async init() {
        if (this.temperatureData === null) {
            const weatherID = this.stage.eventManager.getWeatherID();
            this.temperatureData = await getTemperatureData(weatherID);
        }
        this.toolMeshes = [];
        this.components = [];
        this.objectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.exclusivesld.clear();
        this.exclusive3ld.clear();
        this.showObject();
        this.inverterData = [];
        await this.getSLDData();
        this.getConnectionGaps();
        this.createSLD();
    }

    updateSLD(index, data, isStrung = true) {
        this.components = [];
        this.toolMeshes = [];
        this.objectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.exclusivesld.clear();
        this.exclusive3ld.clear();
        this.inverterData[index].sizingData = data;
        this.inverterData[index].isStrung = isStrung;
        this.getConnectionGaps();
        this.createSLD();
    }

    createMicroSLD(isUpdation = false) {
        this.inverterPosition = this.inverterYBandwidth / 4;
        const junctionBoxEndPoints = [];
        const loadCenterEndPoints = [];
        for (let i = 0; i < this.inverterData.length; i += 1) {
            const isLast = (i === (this.inverterData.length - 1));
            const group = this.createGroupOfStrings(this.inverterData[i], MICRO_INVERTER, isLast);
            junctionBoxEndPoints.push(...group.junctionboxEndpoints);
            if (this.inverterData[i + 1] && this.inverterData[i + 1].isStrung &&
                this.inverterData[i].isStrung) {
                this.inverterPosition -= (this.inverterData[i].inverterWidth / 4) +
                    (this.inverterData[i + 1].inverterWidth / 4);
            }
            else {
                this.inverterPosition -= this.inverterData[i].inverterWidth;
            }
        }

        // to shift load center and other fixed components with the junction box
        this.xBuffer = 0;
        for (let i = 1; i < junctionBoxEndPoints.length; i += 1) {
            this.xBuffer += 25;
        }

        const load = this.createLoadCenter(junctionBoxEndPoints, this.inverterData);
        loadCenterEndPoints.push(...load.endPoints);
        if (!isUpdation) {
            if (this.acDisconnectBoxArrangenment === 0) {
                const meter = this.createMeter(loadCenterEndPoints);
                const disconnect = this.createAcDisconnect(meter.endPoints);
                const disconnect2 = this.create2AcDisconnect(disconnect.endPoints);
                this.createUtilityMeter(disconnect2.endPoints);
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                const disconnect = this.createAcDisconnect(loadCenterEndPoints);
                const meter = this.createMeter(disconnect.endPoints);
                const disconnect2 = this.create2AcDisconnect(meter.endPoints);
                this.createUtilityMeter(disconnect2.endPoints);
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                const disconnect = this.createAcDisconnect(loadCenterEndPoints);
                const disconnect2 = this.create2AcDisconnect(disconnect.endPoints);
                const meter = this.createMeter(disconnect2.endPoints);
                this.createUtilityMeter(meter.endPoints);
            }
            else if (this.acDisconnectBoxArrangenment === 3) {
                const meter = this.createMeter(loadCenterEndPoints);
                const disconnect = this.createAcDisconnect(meter.endPoints);
                this.createUtilityMeter(disconnect.endPoints);
            }
        }
    }


    createStringSLD(isUpdation = false) {
        const inverterEndPoints = [];
        const loadCenterEndPoints = [];
        this.inverterPosition = this.inverterYBandwidth / 2;

        let inverterCount = 0;
        this.inverterData.forEach((data) => {
            if (data.isStrung) {
                inverterCount += 1
            }
        })
        inverterCount = inverterCount === 0 ? this.inverterData.length : inverterCount;
        for (let i = 0; i < this.inverterData.length; i += 1) {
            if (this.inverterData[i].isStrung) {
                const group = this.createGroupOfStrings(
                    this.inverterData[i],
                    STRING_INVERTER,
                );
                const inverterComp = this.createInverter(
                    this.inverterData[i],
                    group.junctionboxEndpoints,
                    inverterCount,
                    i,
                );
                inverterEndPoints.push(...inverterComp.endPoints);
                if (this.inverterData[i + 1] && this.inverterData[i + 1].isStrung &&
                    this.inverterData[i].isStrung) {
                    this.inverterPosition -= (this.inverterData[i].inverterWidth / 2) +
                        (this.inverterData[i + 1].inverterWidth / 2);
                }
                else {
                    this.inverterPosition -= this.inverterData[i].inverterWidth;
                }
            }
        }
        if (this.inverterCount > 1) {
            const load = this.createLoadCenter(inverterEndPoints, this.inverterData);
            loadCenterEndPoints.push(...load.endPoints);
        }
        if (!isUpdation) {
            if (this.acDisconnectBoxArrangenment === 0) {
                let meter;
                if (this.inverterCount > 1) {
                    meter = this.createMeter(loadCenterEndPoints, this.acDisconnectBoxArrangenment);
                }
                else {
                    meter = this.createMeter(inverterEndPoints, this.acDisconnectBoxArrangenment, 1);
                }
                const disconnect = this.createAcDisconnect(meter.endPoints, this.acDisconnectBoxArrangenment);
                const disconnect2 = this.create2AcDisconnect(disconnect.endPoints, this.acDisconnectBoxArrangenment);
                this.createUtilityMeter(disconnect2.endPoints, this.acDisconnectBoxArrangenment);
            }

            else if (this.acDisconnectBoxArrangenment === 1) {
                let disconnect;
                if (this.inverterCount > 1) {
                    disconnect = this.createAcDisconnect(loadCenterEndPoints, this.acDisconnectBoxArrangenment);
                }
                else {
                    disconnect = this.createAcDisconnect(inverterEndPoints, this.acDisconnectBoxArrangenment, 1);
                }
                const meter = this.createMeter(disconnect.endPoints, this.acDisconnectBoxArrangenment);
                const disconnect2 = this.create2AcDisconnect(meter.endPoints, this.acDisconnectBoxArrangenment);
                this.createUtilityMeter(disconnect2.endPoints, this.acDisconnectBoxArrangenment);
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                let disconnect;
                if (this.inverterCount > 1) {
                    disconnect = this.createAcDisconnect(loadCenterEndPoints, this.acDisconnectBoxArrangenment);
                }
                else {
                    disconnect = this.createAcDisconnect(inverterEndPoints, this.acDisconnectBoxArrangenment, 1);
                }
                const disconnect2 = this.create2AcDisconnect(disconnect.endPoints, this.acDisconnectBoxArrangenment);
                const meter = this.createMeter(disconnect2.endPoints, this.acDisconnectBoxArrangenment);
                this.createUtilityMeter(meter.endPoints, this.acDisconnectBoxArrangenment);
            }
            else if (this.acDisconnectBoxArrangenment === 3) {
                let meter;
                if (this.inverterCount > 1) {
                    meter = this.createMeter(loadCenterEndPoints, this.acDisconnectBoxArrangenment);
                }
                else {
                    meter = this.createMeter(inverterEndPoints, this.acDisconnectBoxArrangenment, 1);
                }
                const disconnect = this.createAcDisconnect(meter.endPoints, this.acDisconnectBoxArrangenment);
                this.createUtilityMeter(disconnect.endPoints, this.acDisconnectBoxArrangenment);
            }
        }
    }

    createGroupOfStrings(inverterData, type, isLast) {
        let pos;
        let wireSize;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
        }
        else {
            wireSize = this.wireSizeData.micro;
        }
        if (this.isStringInverter) {
            pos = [-550 - (inverterData.stringCount * 20), this.inverterPosition + 60];
        }
        else {
            pos = [-350 - (this.maxStringCount * 40), this.inverterPosition + 60];
        }
        const component = new GroupOfStrings(
            pos,
            inverterData,
            wireSize,
            this.threeJsFont,
            type,
            inverterData.isContainOptimizer,
            isLast,
        );
        this.components.push(component);
        this.objectsGroup.add(component.groupSLD);
        this.s3ldObjectsGroup.add(component.group3LD);
        this.exclusivesld.add(component.exclusivesld);
        this.exclusive3ld.add(component.exclusive3ld);
        return component;
    }

    createInverter(inverterData, endpoints, inverterCount, i) {
        let numberOfConnections = 0;
        for (let j = 0; j < inverterData.sizingData.length; j++) {
            numberOfConnections += inverterData.sizingData[j].numberOfStrings;
        }
        let origin;
        if (inverterCount === 1) {
            origin = new THREE.Vector2(-570, this.inverterPosition);
            this.pos = -570 + (numberOfConnections * 15);
        }
        else {
            origin = new THREE.Vector2((-550 - ((numberOfConnections - (numberOfConnections % 5)) * 2)), this.inverterPosition);
            // origin = new THREE.Vector2(-550, this.inverterPosition);
            this.pos = -550 + (numberOfConnections * 15);
        }

        const component = new InverterSLD(
            origin,
            inverterData.sizingData,
            inverterData.name,
            inverterData.manufacture,
            inverterData.size,
            endpoints,
            inverterCount,
            this.wireSizeData.string,
            this.threeJsFont,
            this.inverterText,
            i * 3,
        );
        this.components.push(component);

        this.objectsGroup.add(component.sldObjectsGroup);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
        return component;
    }

    createLoadCenter(endPoints, inverterData) {
        let wireSize;
        let pos;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
            pos = [-250, 0];
        }
        else {
            wireSize = this.wireSizeData.micro;
            if (endPoints.length === 1) {
                pos = [-420 - this.xBuffer, 0]; //
            }
            else {
                pos = [-420 - this.xBuffer, 0];
            }
            // if (endPoints.length == 1) {
            //     pos = [-250, 0];
            // }
            // else {
            //     pos = [-150 - (endPoints.length * 10), 0];
            // }
        }
        const component = new LoadCenter(
            pos,
            endPoints,
            this.threeJsFont,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            this.exclusivesld,
            this.exclusive3ld,
            !this.isStringInverter,
            this.wireSizeData,
            wireSize,
            inverterData.name,
            this.acDisconnectBoxArrangenment,
        );
        //
        this.components.push(component);
        this.exclusivesld.add(component.exclusivesld);
        this.objectsGroup.add(component.sldObjectsGroup);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
        if (!this.isStringInverter) {
            this.toolMeshes.push(component.dropDownTool.dropDownMesh);
            this.dropDownToolMesh.push(component.dropDownTool.dropDownMesh);
            this.objectsGroup.add(component.toolGroup);
        }
        return component;
    }

    createMeter(endPoints, acDisconnectPos = 3, n = 2) {
        let wireSize;
        let pos;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
            if (this.acDisconnectBoxArrangenment === 0 || this.acDisconnectBoxArrangenment === 3) {
                pos = [-130, 2.5];
                if (this.inverterCount === 1) {
                    pos = [-400, 2.5];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [-40, 2.5];
                if (this.inverterCount === 1) {
                    pos = [-310, 2.5];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [50, 2.5];
                if (this.inverterCount === 1) {
                    pos = [-220, 2.5];
                }
            }
        }
        else {
            wireSize = this.wireSizeData.micro;
            if (this.acDisconnectBoxArrangenment === 0 || this.acDisconnectBoxArrangenment === 3) {
                pos = [-300 - this.xBuffer, 2.5];
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [-220 - this.xBuffer, 2.5];
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [-130 - this.xBuffer, 2.5];
            }
        }
        const component = new ProductionMeter(
            pos,
            endPoints,
            wireSize,
            this.threeJsFont,
            n,
            this.isMeterEnabled,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            this.exclusivesld,
            this.exclusive3ld,
            !this.isStringInverter,
            this.acDisconnectBoxArrangenment,
        );
        this.components.push(component);
        this.objectsGroup.add(component.sldObjectsGroup);
        this.exclusivesld.add(component.exclusivesld);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
        this.exclusive3ld.add(component.exclusive3ld);
        if (this.isMeterEnabled) {
            this.toolMeshes.push(component.dropDownTool.dropDownMesh);
            this.dropDownToolMesh.push(component.dropDownTool.dropDownMesh);
            this.objectsGroup.add(component.toolGroup);
        }
        return component;
    }

    createAcDisconnect(meter) {
        let wireSize;
        let pos;
        const xPos = this.isMeterEnabled ? 150 : 60;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
            if (this.acDisconnectBoxArrangenment === 0 || this.acDisconnectBoxArrangenment === 3) {
                pos = [xPos - 190, 0];
                if (this.inverterCount === 1) {
                    pos = [xPos - 460, 0];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [-130, 0];
                if (this.inverterCount === 1) {
                    pos = [-400, 0];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [-130, 0];
                if (this.inverterCount === 1) {
                    pos = [-400, 0];
                }
            }
        }
        else {
            wireSize = this.wireSizeData.micro;
            if (this.acDisconnectBoxArrangenment === 0 || this.acDisconnectBoxArrangenment === 3) {
                pos = [xPos - 360 - this.xBuffer, 0];
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [-310 - this.xBuffer, 0];
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [-310 - this.xBuffer, 0];
            }
        }
        const component = new AcDisconnectBox(
            pos,
            meter,
            this.threeJsFont,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            this.exclusivesld,
            this.exclusive3ld,
            wireSize,
            this.inverterCount,
            this.inverterData,
            !this.isStringInverter,
            this.acDisconnectBoxArrangenment,
            this.isMeterEnabled,
            );
        this.components.push(component);
        this.objectsGroup.add(component.sldObjectsGroup);
        this.exclusivesld.add(component.exclusivesld);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
        this.exclusive3ld.add(component.exclusive3ld);
        this.toolMeshes.push(component.dropDownTool.dropDownMesh);
        this.dropDownToolMesh.push(component.dropDownTool.dropDownMesh);
        this.objectsGroup.add(component.toolGroup);
        return component;
    }

    create2AcDisconnect(disconnect) {
        let wireSize;
        let pos;
        const xPos = this.isMeterEnabled ? 300 : 200;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
            if (this.acDisconnectBoxArrangenment === 0) {
                pos = [xPos - 240, 0];
                if (this.inverterCount === 1) {
                    pos = [xPos - 510, 0];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [xPos - 240, 0];
                if (this.inverterCount === 1) {
                    pos = [xPos - 510, 0];
                }
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [-40, 0];
                if (this.inverterCount === 1) {
                    pos = [-310, 0];
                }
            }
        }
        else {
            wireSize = this.wireSizeData.micro;
            if (this.acDisconnectBoxArrangenment === 0) {
                pos = [xPos - 410 - this.xBuffer, 0];
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [xPos - 420 - this.xBuffer, 0];
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [-220 - this.xBuffer, 0];
            }
        }
        const component = new AcDisconnectBox(
            pos,
            disconnect,
            this.threeJsFont,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            this.exclusivesld,
            this.exclusive3ld,
            wireSize,
            this.inverterCount,
            this.inverterData,
            !this.isStringInverter,
            this.acDisconnectBoxArrangenment,
            this.isMeterEnabled,
            true,
        );
        this.components.push(component);
        this.objectsGroup.add(component.sldObjectsGroup);
        this.exclusivesld.add(component.exclusivesld);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
        this.exclusive3ld.add(component.exclusive3ld);
        this.toolMeshes.push(component.dropDownTool.dropDownMesh);
        this.dropDownToolMesh.push(component.dropDownTool.dropDownMesh);
        this.objectsGroup.add(component.toolGroup);
        return component;
    }

    createUtilityMeter(disconnect) {
        let wireSize;
        let pos;
        const xPos = this.isMeterEnabled ? 440 : 330;
        const xPosOneAc = this.isMeterEnabled ? 340 : 250;
        if (this.isStringInverter) {
            wireSize = this.wireSizeData.string;
            if (this.acDisconnectBoxArrangenment === 3) {
                pos = [xPosOneAc - 220, -40];
                if (this.inverterCount === 1) {
                    pos = [xPosOneAc - 490, -40];
                }
            }
            else {
                pos = [xPos - 220, -40];
                if (this.inverterCount === 1) {
                    pos = [xPos - 490, -40];
                }
            }
            // else {
            //     pos = [xPos - 100, -40];
            //     if (this.inverterCount === 1) {
            //         pos = [xPos - 430, -40];
            //     }
            // }
        }
        else {
            wireSize = this.wireSizeData.micro;
            if (this.acDisconnectBoxArrangenment === 3) {
                pos = [xPosOneAc - 390 - this.xBuffer, -40];
            }
            else if (this.acDisconnectBoxArrangenment === 2) {
                pos = [xPos - 390 - this.xBuffer, -40];
            }
            else if (this.acDisconnectBoxArrangenment === 1) {
                pos = [xPos - 400 - this.xBuffer, -40];
            }
            else {
                pos = [xPos - 390 - this.xBuffer, -40];
            }
        }
        const component = new UtilityMeter(
            pos,
            disconnect,
            this.threeJsFont,
            this.objectsGroup,
            this.s3ldObjectsGroup,
            wireSize,
            !this.isStringInverter,
        );
        this.components.push(component);


        this.toolMeshes.push(component.dropDownTool.dropDownMesh);
        this.dropDownToolMesh.push(component.dropDownTool.dropDownMesh);
        this.objectsGroup.add(component.sldObjectsGroup);
        this.objectsGroup.add(component.toolGroup);
        this.s3ldObjectsGroup.add(component.s3ldObjectsGroup);
    }

    addBlackPlane(planeHeight, planeWidth) {
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.blackPlane = new THREE.Mesh(geometry, material);
        this.blackPlane.position.z = -10;
        this.objectsGroup.add(this.blackPlane);
        this.toolMeshes.push(this.blackPlane);
    }

    getConnectionGaps() {
        this.inverterYBandwidth = 0;
        this.inverterCount = 0;
        this.maxStringCount = 0;
        for (let i = 0; i < this.inverterData.length; i += 1) {
            let totalNumberOfString = 0;
            if (this.inverterData[i].isStrung) {
                this.inverterCount++;
                for (let j = 0; j < this.inverterData[i].sizingData.length; j += 1) {
                    const stringCount = this.inverterData[i].sizingData[j].numberOfStrings;
                    totalNumberOfString += stringCount;
                }
                let width;
                if (!this.isStringInverter) {
                    width = 180 * totalNumberOfString;
                }
                else if (totalNumberOfString > 2) {
                    width = (70 * totalNumberOfString) + 50;
                }
                else {
                    width = 200;
                }
                this.inverterData[i].inverterWidth = width;
                this.inverterYBandwidth += width;
            }
            else {
                this.inverterData[i].inverterWidth = 0;
            }
            this.inverterData[i].stringCount = totalNumberOfString;
            if (totalNumberOfString > this.maxStringCount) {
                this.maxStringCount = totalNumberOfString;
            }
        }
        this.inverterData[this.inverterData.length - 1].inverterWidth +=
            this.inverterData[this.inverterData.length - 1].inverterWidth;
        if (this.inverterData.length === 1) {
            this.inverterYBandwidth = 0;
        }
    }

    async getSLDData() {
        // get design id - for getting wiresize calculations
        const designId = this.stage.getDesignId();
        const wireSize = await wireSizeCalculator.GET_CALCULATOR(designId);
        // inverter sizing / check for string or micro / font load
        this.modules = await getModuleMake(this.stage.ground);
        this.inverterMap = inverterElectricalMapExporter(this.stage);
        this.isStringInverter = this.inverterMap.string.length > 0;
        //
        const stringWire = wireSize.data.scene.allCalculationData.String;
        let string;
        let micro;
        this.inverterText = [];
        // Jugaad fix:
        // wire size data has to be saved each time an inverter is placed- need to be fixed
        if (this.isStringInverter) {
            if (stringWire['INVERTER TO LOAD CENTRE'].length !== this.inverterMap.string.length) {
                this.stage.eventManager.completeCreateSLDLoading(this.stage.eventManager.setCreateSLDLoading());
                this.stage.eventManager.setSaveWireSizeCalculator();
            }
            for (let i = 0; i < this.inverterMap.string.length; i++) {
                this.inverterText.push(stringWire['INVERTER TO LOAD CENTRE'][i]['GROUND WIRE SIZE']);
                this.inverterText.push(stringWire['INVERTER TO LOAD CENTRE'][i]['CIRCUIT CONDUCTOR SIZE']);
                this.inverterText.push(stringWire['INVERTER TO LOAD CENTRE'][i]['CONDUIT SIZE']);
            }
            string = {
                temprature: {
                    tempratureAc: wireSize.data.scene.siteDataToSend.tempCorrectionFactorAC,
                    tempratureDc: wireSize.data.scene.siteDataToSend.tempCorrectionFactorDC,
                },
                inverterCurrent: {
                    current: wireSize.data.scene.inverterSpecsToSend[0].maxOutputCurrent,
                },
                breakerSizes: {
                    loadCenter: stringWire['INVERTER TO LOAD CENTRE'][0]['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                    acDisconnectBox: stringWire['LOAD CENTRE TO AC DISCONNECT']['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                    utilityMeter: stringWire['AC DISCONNECT TO INTERCONNECTION']['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                },
                arrayToJunctionBox: {
                    ground1: '(1) Q- CABLE',
                    conductorSize1: '(1) #6 BARE CU GND',
                    ground: stringWire['ARRAY TO JUNCTION BOX']['GROUND WIRE SIZE'],
                    conductorSize: stringWire['ARRAY TO JUNCTION BOX']['CIRCUIT CONDUCTOR SIZE'],
                },
                junctionBoxToInverter: {
                    ground: stringWire['JUNCTION BOX TO INVERTER'][0]['GROUND WIRE SIZE'],
                    conductorSize: stringWire['JUNCTION BOX TO INVERTER'][0]['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: stringWire['JUNCTION BOX TO INVERTER'][0]['CONDUIT SIZE'],
                },
                loadCenterToAcDisconnect: {
                    ground: stringWire['LOAD CENTRE TO AC DISCONNECT']['GROUND WIRE SIZE'],
                    conductorSize: stringWire['LOAD CENTRE TO AC DISCONNECT']['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: stringWire['LOAD CENTRE TO AC DISCONNECT']['CONDUIT SIZE'],
                },
                AcDisconnectToUtility: {
                    ground: stringWire['AC DISCONNECT TO INTERCONNECTION']['GROUND WIRE SIZE'],
                    conductorSize: stringWire['AC DISCONNECT TO INTERCONNECTION']['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: stringWire['AC DISCONNECT TO INTERCONNECTION']['CONDUIT SIZE'],
                },
            };
        }
        else {
            const microWire = wireSize.data.scene.allCalculationData.Micro;
            micro = {
                model: {
                    manufacture: wireSize.data.scene.inverterSpecsToSend[0].manufactureName,
                    modelName: wireSize.data.scene.inverterSpecsToSend[0].modelName,
                },
                temprature: {
                    tempratureAc: wireSize.data.scene.siteDataToSend.tempCorrectionFactorAC,
                    tempratureDc: wireSize.data.scene.siteDataToSend.tempCorrectionFactorDC,
                },
                inverterCurrent: {
                    current: wireSize.data.scene.inverterSpecsToSend[0].maxOutputCurrent,
                },
                breakerSizes: {
                    loadCenter: microWire['JUNCTION BOX TO COMBINER BOX']['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                    acDisconnectBox: microWire['COMBINER BOX TO AC DISCONNECT']['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                    utilityMeter: microWire['AC DISCONNECT TO INTERCONNECTION']['REQUIRED CIRCUIT CONDUCTOR AMPACITY FOR AC AND STRING'],
                },
                arrayToJunctionBox: {
                    ground: 'Q- CABLE',
                    conductorSize: '(1) #6 BARE CU GND',
                },
                loadCenterToAcDisconnect: {
                    ground: microWire['COMBINER BOX TO PRODUCTION METER']['GROUND WIRE SIZE'],
                    conductorSize: microWire['COMBINER BOX TO PRODUCTION METER']['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: microWire['COMBINER BOX TO PRODUCTION METER']['CONDUIT SIZE'],
                },
                junctionBoxToLoadCenter: {
                    ground: microWire['JUNCTION BOX TO COMBINER BOX']['GROUND WIRE SIZE'],
                    conductorSize: microWire['JUNCTION BOX TO COMBINER BOX']['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: microWire['JUNCTION BOX TO COMBINER BOX']['CONDUIT SIZE'],
                },
                AcDisconnectToUtility: {
                    ground: microWire['AC DISCONNECT TO INTERCONNECTION']['GROUND WIRE SIZE'],
                    conductorSize: microWire['AC DISCONNECT TO INTERCONNECTION']['CIRCUIT CONDUCTOR SIZE'],
                    conduitSize: microWire['AC DISCONNECT TO INTERCONNECTION']['CONDUIT SIZE'],
                },
            };
        }

        this.wireSizeData = {
            string,
            micro,
        };

        this.microInverters = this.stage.ground.getMicroinverters();
        this.isStrung = this.inverterMap.isStringing;
        this.stringInverters = getInverters(this.stage);

        // inverter Data for group of strings
        // inverter data of string inverters
        if (this.isStringInverter) {
            if (this.isStrung) {
                for (let i = 0; i < this.inverterMap.string.length; i += 1) {
                    let isContainOptimizer = false;
                    if (this.inverterMap.string[i].optimizerCount) {
                        isContainOptimizer = true;
                    }
                    const stringing = [];
                    for (
                        let j = 0;
                        j < this.inverterMap.string[i].mppts.length;
                        j += 1
                    ) {
                        for (
                            let k = 0;
                            k < this.inverterMap.string[i].mppts[j].strings.length;
                            k += 1
                        ) {
                            stringing.push({
                                numberOfModules:
                                    this.inverterMap.string[i].mppts[j].strings[k]
                                        .linkedPanelIds.length,
                                numberOfStrings: 1,
                            });
                        }
                    }
                    // Todo : jugaad
                    if (stringing.length > 0) {
                        this.inverterData.push({
                            sizingRange: {
                                maxModules:
                                    this.inverterMap.string[i].mppts[0].stringRange
                                        .maximum,
                                minModules:
                                    this.inverterMap.string[i].mppts[0].stringRange
                                        .minimum,
                            },
                            sizingData: stringing,
                            isStrung: true,
                            isContainOptimizer,
                            name: this.inverterMap.string[i].inverterMake,
                            manufacture: this.inverterMap.string[i].inverterManufacturer,
                        });
                    }
                    else {
                        stringing.push({
                            numberOfModules: 0,
                            numberOfStrings: 0,
                        });
                        this.inverterData.push({
                            sizingRange: {
                                maxModules:
                                    this.inverterMap.string[i].mppts[0].stringRange
                                        .maximum,
                                minModules:
                                    this.inverterMap.string[i].mppts[0].stringRange
                                        .minimum,
                            },
                            sizingData: stringing,
                            isStrung: false,
                            isContainOptimizer,
                            name: this.inverterMap.string[i].inverterMake,
                            manufacture: this.inverterMap.string[i].inverterManufacturer,
                        });
                    }
                }
            }
            else {
                const inverterSizing = getInverterSizing(
                    this.modules,
                    this.stringInverters,
                    this.temperatureData,
                );
                this.inverters = inverterSizing.inverters;
                for (let i = 0, len = this.inverters.length; i < len; i += 1) {
                    let isContainOptimizer = false;
                    if (this.inverters[i].optimizer) {
                        isContainOptimizer = true;
                    }
                    const stringing = [];
                    let isStrung = false;
                    if (this.inverters[i].sizing.length > 0) {
                        isStrung = true;
                        for (
                            let j = 0,
                                l = this.inverters[i].sizing[0]
                                    .stringsConfiguration.length;
                            j < l;
                            j += 1
                        ) {
                            stringing.push({
                                numberOfModules: this.inverters[i].sizing[0]
                                    .stringsConfiguration[j].numberOfModules,
                                numberOfStrings: this.inverters[i].sizing[0]
                                    .stringsConfiguration[j].numberOfStrings,
                            });
                        }
                    }
                    else {
                        isStrung = false;
                        stringing.push({
                            numberOfModules: 0,
                            numberOfStrings: 0,
                        });
                    }
                    this.inverterData.push({
                        sizingRange: {
                            maxModules: this.inverters[i].sizingRange
                                .maxSeriesModules,
                            minModules: this.inverters[i].sizingRange
                                .minSeriesModules,
                        },
                        sizingData: stringing,
                        isStrung,
                        isContainOptimizer,
                        name: this.inverters[i].electricalProperties.Make,
                        manufacture: this.inverterMap.string[i].inverterManufacturer,
                        size: this.inverters[i].electricalProperties.Size,
                    });
                }
            }
        }
        // inverter data of micro inverters
        else {
            for (let i = 0, len = this.microInverters.length; i < len; i += 1) {
                const stringing = [];
                if (this.microInverters[i].strings.length === 0) {
                    stringing.push({
                        numberOfModules: this.microInverters[i].panels.length,
                        numberOfStrings: 1,
                    });
                    this.inverterData.push({
                        sizingRange: {
                            maxModules: 1,
                            minModules: 1,
                        },
                        sizingData: stringing,
                        isStrung: true,
                    });
                }
                else {
                    for (let j = 0; j < this.microInverters[i].strings.length; j += 1) {
                        // for new stringing we have linked panels instead of panels
                        // added backward compatibility
                        stringing.push({
                            numberOfModules: this.microInverters[i].strings[j].panels ? 
                                this.microInverters[i].strings[j].panels.length :
                                this.microInverters[i].strings[j].linkedPanels.length,
                            numberOfStrings: 1,
                        });
                    }
                    this.inverterData.push({
                        sizingRange: {
                            maxModules: 1,
                            minModules: 1,
                        },
                        sizingData: stringing,
                        isStrung: true,
                    });
                }
            }
        }
        let total = 0;
        for (let i = 0; i < this.inverterData.length; i += 1) {
            for (let j = 0; j < this.inverterData[i].sizingData.length; j += 1) {
                total += this.inverterData[i].sizingData[j].numberOfModules *
                    this.inverterData[i].sizingData[j].numberOfStrings;
            }
        }
        this.totalModulesLeft = this.modules.count - total;
    }

    exportAsDXF() {
        const SCALING_FACTOR = 0.015 * 1.1;
        const TEXT_SIZE = 0.05;
        this.whiteLines = [];
        this.whitePolyLines = [];
        this.whitesld = [];
        this.white3ld = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.greenPoly3ld = [];
        this.redLines = [];
        this.redPolyLines = [];
        this.redCircles = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.blueLines = [];
        this.blueCircles = [];
        this.greenLines = [];
        this.greenPolyLines = [];
        this.greenCircles = [];
        this.green3ld = [];
        this.texts = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.bluePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenCircles3ld = [];
        this.dashedLines = [];
        this.dashedPolyLines = [];
        this.leaders = [];
        this.components.forEach((component) => {
            if (
                component instanceof GroupOfStrings
                || component instanceof ProductionMeter
                || component instanceof AcDisconnectBox
                || component instanceof LoadCenter
            ) {
                addAllrgbwgos(this, component, true, this.is3LD);
            }
            else if (component instanceof UtilityMeter) {
                addAllrgbwgos(this, component.currentComponent, false, this.is3LD);
            }
            else {
                addAllrgbwgos(this, component, false, this.is3LD);
            }
        });
        const dxfString = outputDocument(this, this.is3LD);
        const timeStamp = getTimeStamp();
        // const dxfString = outputDocument(obj);
        const blobData = new Blob([dxfString], { type: 'text/plain' });
        const designName = this.stage.eventManager.getProjectDesignName();
        try {
            saveAs(blobData, `${designName}_sld_${timeStamp}.dxf`);
            return Promise.resolve(true);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    autoSizeInverters(index) {
        const autoSizedInfo = [];
        for (
            let j = 0, l = this.inverters[index].sizing[0].stringsConfiguration.length;
            j < l;
            j += 1
        ) {
            autoSizedInfo.push({
                numberOfModules: this.inverters[index].sizing[0]
                    .stringsConfiguration[j].numberOfModules,
                numberOfStrings: this.inverters[index].sizing[0]
                    .stringsConfiguration[j].numberOfStrings,
            });
        }
        return autoSizedInfo;
    }
    showObject() {
        this.objectsGroup.visible = true;
        this.exclusivesld.visible = true;
    }

    hideObject() {
        this.objectsGroup.visible = false;
        this.s3ldObjectsGroup.visible = false;
        this.exclusivesld.visible = false;
        this.exclusive3ld.visible = false;
    }

    switchToSLD() {
        this.is3LD = false;
        this.s3ldObjectsGroup.visible = false;
        this.exclusivesld.visible = true;
        this.exclusive3ld.visible = false;
    }

    switchTo3LD() {
        this.is3LD = true;
        this.s3ldObjectsGroup.visible = true;
        this.exclusivesld.visible = false;
        this.exclusive3ld.visible = true;
    }

    getMeshes() {
        return this.toolMeshes;
    }

    getModules() {
        return this.modules;
    }

    getStrings() {
        return this.inverterData;
    }

    getNumberOfModulesLeft() {
        return this.totalModulesLeft;
    }

    getMeterState() {
        return this.isMeterEnabled;
    }

    toggleMeter() {
        this.components = [];
        this.toolMeshes = [];
        this.objectsGroup.clear();
        this.s3ldObjectsGroup.clear();
        this.exclusivesld.clear();
        this.exclusive3ld.clear();
        this.isMeterEnabled = !this.isMeterEnabled;

        if (this.isStringInverter) {
            this.createStringSLD();
        }
        else {
            this.createMicroSLD();
        }

        const boundingBox = (new THREE.Box3()).setFromObject(this.objectsGroup);
        const planeWidth = boundingBox.max.x * 400;
        const planeHeight = boundingBox.max.y * 400;
        this.addBlackPlane(planeHeight, planeWidth);
    }
}

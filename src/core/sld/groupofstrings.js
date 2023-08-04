import * as THREE from 'three';
import * as sldConstants from './sldConstants';
import JunctionBox from './junctionBox';
import * as utils from './utils';
import createBufferGeometry from '../utils/meshUtils';

export default class GroupOfStrings {
    constructor(center, inverterData, wireSize, font, type, optimizer = false, last = false, is3LD) {
        const [X, Y] = center;
        const { sizingData } = inverterData;
        const numberOfGroups = sizingData
            .reduce((total, sizing) => total + sizing.numberOfStrings, 0);
        // actually, total number of branches

        const padding = sldConstants.stringPadding;
        const spacingFactor = 5;

        // const numberOfJunctionBoxes = Math.ceil(numberOfGroups/4);


        let maxPanelGroupSize;
        if (type === 'string') {
            maxPanelGroupSize = sldConstants.maxPanelLineSize;
        }
        else if (type === 'micro') {
            maxPanelGroupSize = sldConstants.maxMicroInverterPanelLineSize;
        }
        else {
            console.error('Wrong panel type');
        }

        const leftOffset = maxPanelGroupSize.x + (spacingFactor * numberOfGroups);
        // horizontal distance between the strings and the junctionbox

        const totalBoxSpacing = maxPanelGroupSize.y * numberOfGroups;
        const totalPadding = padding * (numberOfGroups + 1);
        const totalSpacing = (totalBoxSpacing + totalPadding);
        const origin = [X, Y + (totalSpacing / 2)];
        const x = origin[0] - 30;

        this.groupSLD = new THREE.Group();
        this.group3LD = new THREE.Group();
        this.exclusivesld = new THREE.Group();
        this.exclusive3ld = new THREE.Group();

        this.whiteLines = [];
        this.whitePolyLines = [];
        this.whitesld = [];
        this.white3ld = [];
        this.redLines = [];
        this.redPolyLines = [];
        this.bluePolyLines = [];
        this.blueMicroPolyLines = [];
        this.purplePolyLines = [];
        this.whitePolySld = [];
        this.whitePoly3ld = [];
        this.greenPoly3ld = [];
        this.greenCircles3ld = [];
        this.blueLines = [];
        this.blueMicroLines = [];
        this.purpleLines = [];
        this.greenLines = [];
        this.greenPolyLines = [];
        this.dashedLines = [];
        this.dashedPolyLines = [];
        this.whiteCircles = [];
        this.whiteEllipse = [];
        this.redCircles = [];
        this.blueCircles = [];
        this.greenCircles = [];
        this.texts3LD = [];
        this.textsSLD = [];
        this.texts = [];

        const extentSize = totalSpacing - (padding * 2) - maxPanelGroupSize.y;
        const junctionbox = new JunctionBox(
            [x - 60, Y],
            numberOfGroups, font, type, leftOffset, optimizer, wireSize, last,
        );
        this.junctionboxEndpoints = junctionbox.endpoints;

        junctionbox.addChildren(extentSize, inverterData);

        this.exclusivesld.add(junctionbox.exclusivesld);
        this.exclusive3ld.add(junctionbox.exclusive3ld);

        utils.addAllrgbwgos(this, junctionbox, true, true);
        const whiteGeometry = createBufferGeometry([...this.whiteLines]);
        const whiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
        });
        const whiteLine = new THREE.LineSegments(whiteGeometry, whiteMaterial);

        const redGeometry = createBufferGeometry([...this.redLines]);
        const redMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
        });
        const redLine = new THREE.LineSegments(redGeometry, redMaterial);

        const blueGeometry = createBufferGeometry([...this.blueLines]);
        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x808080,
            linewidth: 3,
        });
        const blueLine = new THREE.LineSegments(blueGeometry, blueMaterial);

        const blueMicroGeometry = createBufferGeometry();
        const blueMicroMaterial = new THREE.LineBasicMaterial({
            color: 0x0000ff,
            linewidth: 3,
        });
        blueMicroGeometry.setFromPoints([...this.blueMicroLines]);
        const blueMicroLine = new THREE.LineSegments(blueMicroGeometry, blueMicroMaterial);

        const purpleGeometry = createBufferGeometry();
        const purpleMaterial = new THREE.LineBasicMaterial({
            color: 0x800080,
            linewidth: 3,
        });
        purpleGeometry.setFromPoints([...this.purpleLines]);
        const purpleLine = new THREE.LineSegments(purpleGeometry, purpleMaterial);

        // const greenGeometry = createBufferGeometry();
        // const greenMaterial = new THREE.LineBasicMaterial({
        //     color: 0x00ff00,
        //     linewidth: 3,
        // });
        // greenGeometry.setFromPoints(...this.greenLines);
        // const greenLine = new THREE.LineSegments(greenGeometry, greenMaterial);

        this.groupSLD.add(whiteLine);
        this.group3LD.add(redLine);
        this.groupSLD.add(blueLine);
        this.groupSLD.add(blueMicroLine);
        this.groupSLD.add(purpleLine);

        this.groupSLD.add(junctionbox.objectsGroup);
        this.group3LD.add(junctionbox.objectsGroup3ld);
        if (type === 'string') {
            const whitesldGeometry = createBufferGeometry();
            whitesldGeometry.setFromPoints([...this.whitesld]);
            const whiteLinesld = new THREE.LineSegments(whitesldGeometry, whiteMaterial);

            const white3ldGeometry = createBufferGeometry();
            white3ldGeometry.setFromPoints([...this.white3ld]);
            const whiteLine3ld = new THREE.LineSegments(white3ldGeometry, whiteMaterial);

            this.exclusivesld.add(whiteLinesld);
            this.exclusive3ld.add(whiteLine3ld);
        }
    }
}

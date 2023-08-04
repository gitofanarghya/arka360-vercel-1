import { containsAll } from '../../utils/utils';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';

import { computeLegs, drawLegs } from '../components/legUtils';
import { computeFootings, drawFootings } from '../components/footingUtils';
import { computeRafters, drawRafters } from '../components/rafterUtils';
import { computePurlins, drawPurlins } from '../components/purlinUtils';
import { computeRailings, drawRailings } from '../components/railingUtils';
import { computeClips, drawClips } from '../components/clipUtils';
import { computeBackCover, drawBackCover } from '../components/backCoverUtils';
import { computeBlocks, drawBlocks } from '../components/blockUtils';
import { computeBracings, drawBracings } from '../components/bracingUtils';
import { computePillars, drawPillars } from '../components/pillarUtils';
import { computePillarConnectors, drawPillarConnectors } from '../components/pillarConnectorUtils';
import { computeLegConnectors, drawLegConnectors } from '../components/legConnectorUtils';
import { computeFrontBracings, drawFrontBracings } from '../components/frontBracingUtils';
import { computeSideBracings, drawSideBracings } from '../components/sideBracingUtils';
import {
    computeNumberOfTablesInBoundingBox,
    getBuffer,
} from './mathUtils';
import { DRAWING_CONSTANTS } from '../constants';
import { computeRodMesh, drawRodMesh } from '../components/rodMeshUtils';

const LOG = false;

function lg(entity, msg) {
    if (LOG) {
        console.log(`${entity} START`);
        console.log(msg);
        console.log(`${entity} END`);
    }
}

export function createFootings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['row', 'boundingBox'])) {
        throw new Error('createAndDrawFootings failed. Necessary information not supplied.');
    }

    const { row, boundingBox } = params;
    let footingPosition;
    let { footingCount } = params;

    const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
        subarrayDetails,
        boundingBox,
    );
    const footingParams = {
        boundingBox,
        row,
        footingSize: template.FOOTING.SIZE,
        tableSize: subarrayDetails.tableSize,
        footingBuffer: getBuffer(subarrayDetails, template.FOOTING.BUFFER),
        numberOfTablesInBoundingBox,
        // TODO: The issue is that some places we are using the template
        // and some places we are using the params.
        singleVerticalRow: template.FOOTING.SINGLE_VERTICAL_ROW,
        footingCount,
    };

    ({
        // eslint-disable-next-line prefer-const
        footingPosition,
        footingCount,
    } = computeFootings(footingParams));

    const footingDrawingParams = {
        footingSize: template.FOOTING.SIZE,
        azimuth: subarrayDetails.azimuth,
        footingPosition,
        footingStyle: template.FOOTING.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };
    drawFootings(footingDrawingParams, objectsGroup,template.NAME);

    return {
        footingPosition,
        footingCount,
        footingHeight: template.FOOTING.SIZE.HEIGHT,
    };
}

export function createLegs(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['row', 'boundingBox'])) {
        throw new Error('createAndDrawLegs failed. Necessary information not supplied.');
    }

    lg('Leg Params', params);

    const { row, boundingBox } = params;

    const numberOfTablesInBoundingBox = computeNumberOfTablesInBoundingBox(
        subarrayDetails,
        boundingBox,
    );

    const tiltedDistanceFromTop = (params.tiltedDistanceFromTop != null) ?
        params.tiltedDistanceFromTop : ((Object.hasOwnProperty.call(template, 'RAFTER') ?
            template.RAFTER.SIZE.HEIGHT : 0) + (Object.hasOwnProperty.call(template, 'PURLIN')
            ? template.PURLIN.SIZE.HEIGHT : 0));

    let legBaseHeight = 0;
    if (params.railingHeight) {
        legBaseHeight = params.railingHeight;
    }
    else if (params.footingHeight) {
        legBaseHeight = params.footingHeight;
    }

    const legParams = {
        boundingBox,
        row,
        tableSize: subarrayDetails.tableSize,
        legBuffer: getBuffer(subarrayDetails, template.LEG.BUFFER),
        numberOfTablesInBoundingBox,
        legCount: params.legCount ? params.legCount : params.footingCount,
        topZToLeave: tiltedDistanceFromTop,
        backLegsOnly: Object.hasOwnProperty.call(params, 'backLegsOnly') ? params.backLegsOnly : false,
        legBaseHeight,
        subarrayDetails,
        objectsGroup,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    const {
        legHeights,
        legPosition,
        legLines,
        legTilts,
    } = computeLegs(legParams);


    const legDrawingParams = {
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
        legPosition,
        legSize: template.LEG.SIZE,
        legHeights,
        legStyle: template.LEG.STYLE,
        legLines,
        legTilts,
        boundingBox,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    drawLegs(legDrawingParams, objectsGroup,template.NAME);

    return {
        legHeights,
        legPosition,
    };
}

export function createPurlins(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['boundingBox', 'legPosition'])) {
        throw new Error('createAndDrawPurlins failed. Necessary information not supplied.');
    }

    lg('Purlin Params', params);

    const {
        moduleDimensions,
        tableSize,
        orientation,
        moduleSpacing,
        tilt,
        azimuth,
    } = subarrayDetails;

    const { boundingBox } = params;

    let purlinBuffer;

    if (subarrayDetails.orientation === PANEL_ORIENTATION_PORTRAIT) {
        purlinBuffer = {
            TOP: template.PURLIN.BUFFER.TOP * moduleDimensions.length,
            BOTTOM: template.PURLIN.BUFFER.BOTTOM *
                moduleDimensions.length,
        };
    }
    else {
        purlinBuffer = {
            TOP: template.PURLIN.BUFFER.TOP * moduleDimensions.width,
            BOTTOM: template.PURLIN.BUFFER.BOTTOM *
                moduleDimensions.width,
        };
    }
    const purlinParams = {
        purlinBuffer,
        boundingBox,
        moduleLength: moduleDimensions.length,
        moduleWidth: moduleDimensions.width,
        tableSizeUp: tableSize.up,
        orientation,
        moduleSpacingUp: moduleSpacing.up,
        purlinSize: template.PURLIN.SIZE,
        legPosition: params.legPosition,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        footingBuffer: template.LEG.BUFFER,
        tilt,
    };

    const { purlinLines } = computePurlins(purlinParams);

    const purlinDrawingParams = {
        purlinLines,
        purlinColor: template.PURLIN.STYLE.COLOR,
        purlinSize: template.PURLIN.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth,
        tilt,
        purlinStyle: template.PURLIN.STYLE,
    };

    drawPurlins(purlinDrawingParams, objectsGroup, template.NAME);

    return {
        purlinLines,
    };
}

export function createRafters(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legHeights', 'legPosition'])) {
        throw new Error('createAndDrawRafters failed. Necessary information not supplied.');
    }

    const { tilt, orientation, azimuth } = subarrayDetails;

    const rafterParams = {
        legPosition: params.legPosition,
        legHeights: params.legHeights,
        purlinLines: params.purlinLines,
        boundingBoxZDifference: (template.PURLIN) ? template.PURLIN.SIZE.HEIGHT : 0,
        rafterSize: template.RAFTER.SIZE,
        tilt,
        orientation,
        rafterBuffer: template.RAFTER.BUFFER,
        footingBuffer: template.LEG.BUFFER,
        boundingBox: params.boundingBox,
        templateName: template.NAME, // Temp fix for making the function generous
    };

    const { rafterLines } = computeRafters(rafterParams);

    const rafterDrawingParams = {
        rafterLines,
        rafterColor: template.RAFTER.STYLE.COLOR,
        rafterSize: template.RAFTER.SIZE,
        azimuth,
        tilt,
        rafterStyle: template.RAFTER.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawRafters(rafterDrawingParams, objectsGroup ,template.NAME);

    return { rafterLines };
}

export function createBackCover(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['railingHeight', 'boundingBox', 'row'])) {
        throw new Error('createAndDrawBackCover failed. Necessary information not supplied.');
    }

    const { azimuth } = subarrayDetails;

    const backCoverParams = {
        minZ: params.railingHeight,
        boundingBox: params.boundingBox,
        row: params.row,
        legLength: Object.prototype.hasOwnProperty.call(template, 'LEG') ? template.LEG.SIZE.LENGTH : 0,
    };

    const { backCoverLine, backCoverLength } = computeBackCover(backCoverParams);

    const backCoverDrawingParams = {
        backCoverLine,
        backCoverLength,
        backCoverSize: template.BACK_COVER.SIZE,
        azimuth,
        backCoverStyle: template.BACK_COVER.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawBackCover(backCoverDrawingParams, objectsGroup,template.NAME);

    return {};
}

export function createRailings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['boundingBoxes', 'rows'])) {
        throw new Error('createAndDrawRailings failed. Necessary information not supplied.');
    }

    const railingParams = {
        boundingBoxes: params.boundingBoxes,
        railingHeight: template.RAILING.SIZE.HEIGHT,
        rows: params.rows,
        railingBuffer: template.RAILING.BUFFER,
        drawRailingSupport: params.drawRailingSupport,
        subarrayDetails,
        maximumAllowedDistance: subarrayDetails.rowSpacing + template.RAILING.BUFFER.UP,
        railingCountFunction: params.railingCountFunction,
        alignPillarToBottom: params.alignPillarToBottom,
        objectsGroup,
        // TODO: Potential BugFix but not tested
        // maximumAllowedDistance: template.RAILING.BUFFER.UP,
    };

    const { railingLines, numberOfLinesCombined, railingSupports } = computeRailings(railingParams);

    const railingDrawingParams = {
        railingLines,
        railingSupports,
        railingsColor: template.RAILING.STYLE.COLOR,
        railingSize: template.RAILING.SIZE,
        railingStyle: template.RAILING.STYLE,
        railingBuffer: template.RAILING.BUFFER,
        drawRailingSupport: params.drawRailingSupport,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
    };

    if (params.drawRailings === true || params.drawRailings === null ||
        params.drawRailings === undefined) {  
        drawRailings(railingDrawingParams, objectsGroup ,template.NAME);
    }

    return {
        railingLines,
        numberOfLinesCombined,
        railingHeight: template.RAILING.SIZE.HEIGHT,
    };
}

export async function createBlocks(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['railingLines', 'numberOfLinesCombined', 'subarrayParent'])) {
        throw new Error('createAndDrawBlocks failed. Necessary information not supplied.');
    }

    const blockParams = {
        railingLines: params.railingLines,
        numberOfLinesCombined: params.numberOfLinesCombined,
        railingHeight: template.RAILING.SIZE.HEIGHT,
        subarrayParent: params.subarrayParent,
        subarrayDetails,
        blockBuffer: template.BLOCK.BUFFER,
        drawLastBlock: params.drawLastBlock,
    };

    const { blockPosition } = computeBlocks(blockParams);

    const blockDrawingParams = {
        templateName: template.NAME,
        blockPosition,
        blockStyle: template.BLOCK.STYLE,
        azimuth: subarrayDetails.azimuth,
        blockSize: template.BLOCK.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    await drawBlocks(blockDrawingParams, objectsGroup, template.NAME);

    return {};
}

export function createPillarConnectors(params, subarrayDetails, template, objectsGroup) {
    const pillarParams = {
        pillarPosition: params.pillarPosition,
        pillarHeight: params.pillarHeight,
        boundingBox: params.boundingBox,
        subarrayDetails,
        alignPillarToBottom: params.alignPillarToBottom,
        subarrayParent: params.subarrayParent,
        numberOfPillarConnectors: params.numberOfPillarConnectors,
    };

    const { pillarConnectorLines } = computePillarConnectors(pillarParams);

    const pillarDrawingParams = {
        pillarConnectorLines,
        pillarConnectorStyle: template.PILLAR_CONNECTOR.STYLE,
        pillarConnectorSize: template.PILLAR_CONNECTOR.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawPillarConnectors(pillarDrawingParams, objectsGroup ,template.NAME);

    return {
        pillarConnectorLines,
    };
}

export function createPillars(params, subarrayDetails, template, objectsGroup) {
    // TODO: Refactor
    if (!containsAll(params, ['railingLines', 'numberOfLinesCombined', 'subarrayParent'])) {
        throw new Error('createAndDrawBlocks failed. Necessary information not supplied.');
    }

    const pillarParams = {
        railingLines: params.railingLines,
        numberOfLinesCombined: params.numberOfLinesCombined,
        railingHeight: template.RAILING.SIZE.HEIGHT,
        subarrayParent: params.subarrayParent,
        subarrayDetails,
        pillarBuffer: template.PILLAR.BUFFER,
        pillarSize: template.PILLAR.SIZE,
    };

    const { pillarPosition, pillarHeight } = computePillars(pillarParams);

    const pillarDrawingParams = {
        pillarPosition,
        pillarStyle: template.PILLAR.STYLE,
        azimuth: subarrayDetails.azimuth,
        pillarSize: template.PILLAR.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawPillars(pillarDrawingParams, objectsGroup, template.NAME);

    return {
        pillarPosition,
        pillarHeight,
    };
}

export function createClips(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legPosition', 'boundingBox', 'row', 'footingCount', 'railingHeight'])) {
        throw new Error('createAndDrawClips failed. Necessary information not supplied.');
    }

    const clipParams = {
        boundingBox: params.boundingBox,
        buffer: getBuffer(subarrayDetails, template.CLIP.BUFFER),
        row: params.row,
        clipCount: params.footingCount,
        clipSize: template.CLIP.SIZE,
        tilt: subarrayDetails.tilt,
        mountHeight: subarrayDetails.mountHeight,
        minZ: params.railingHeight,
    };

    const { clipLines } = computeClips(clipParams);

    const clipDrawingParams = {
        clipLines,
        clipStyle: template.CLIP.STYLE,
        clipSize: template.CLIP.SIZE,
        azimuth: subarrayDetails.azimuth,
        tilt: subarrayDetails.tilt,
    };

    drawClips(clipDrawingParams, objectsGroup,template.NAME);

    return {};
}

export function createBracings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legPosition', 'rafterLines', 'legHeights'])) {
        throw new Error('createBracings failed. Necessary information not supplied.');
    }

    const bracingParams = {
        legPosition: params.legPosition,
        rafterLines: params.rafterLines,
        legHeights: params.legHeights,
        rafterTop: template.BRACING.RAFTER_TOP,
        rafterBottom: template.BRACING.RAFTER_BOTTOM,
        legPercentageFromBottom: template.BRACING.BOTTOM_PERCENT,
        bracingConnector: template.BRACING.BRACING_CONNECTOR,
        boundingBox: params.boundingBox,
        bracingSize: template.BRACING.SIZE,
    };

    const { bracingLines, bracingConnectorLines } = computeBracings(bracingParams);

    const bracingDrawingParams = {
        bracingLines,
        bracingConnectorLines,
        // railingsColor: template.RAILING.STYLE.COLOR,
        bracingSize: template.BRACING.SIZE,
        bracingStyle: template.BRACING.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
        tilt: subarrayDetails.tilt,
    };

    drawBracings(bracingDrawingParams, objectsGroup ,template.NAME);

    return {};
}

export function createRodMesh(params, subarrayDetails, template, objectsGroup) {
    const rodMeshParams = {
        numberOfVerticalRods: template.ROD_MESH.VERTICAL_RODS,
        rafterLines: params.rafterLines,
        pillarConnectorLines: params.pillarConnectorLines,
        buffer: template.ROD_MESH.BUFFER,
    };

    const { rodLines } = computeRodMesh(rodMeshParams);

    const rodMeshDrawingParams = {
        rodLines,
        rodMeshSize: template.ROD_MESH.SIZE,
        rodMeshStyle: template.ROD_MESH.STYLE,
        azimuth: subarrayDetails.azimuth,
    };

    drawRodMesh(rodMeshDrawingParams, objectsGroup, template.NAME);
}

export function createLegConnector(params, subarrayDetails, template, objectsGroup) {
    const legParams = {
        legPosition: params.legPosition,
        legHeight: params.legHeights,
        boundingBox: params.boundingBox,
        subarrayDetails,
        subarrayParent: params.subarrayParent,
        numberOfLegConnectors: params.numberOfLegConnectors,
    };

    const { legConnectorLines, legConnectorMidPoint } = computeLegConnectors(legParams);

    const legDrawingParams = {
        legConnectorLines,
        legConnectorStyle: template.LEG_CONNECTOR.STYLE,
        legConnectorSize: template.LEG_CONNECTOR.SIZE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
    };

    drawLegConnectors(legDrawingParams, objectsGroup, template.NAME);

    return {
        legConnectorLines,
        legConnectorMidPoint,
    };
}

export function createFrontBracings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legPosition', 'legConnectorLines', 'legHeights', 'legConnectorMidPoint'])) {
        throw new Error('createFrontBracings failed. Necessary information not supplied.');
    }

    const frontBracingParams = {
        legPosition: params.legPosition,
        legConnectorLines: params.legConnectorLines,
        legHeights: params.legHeights,
        legConnectorMidPoint: params.legConnectorMidPoint,
        legPercentageFromBottom: template.FRONT_BRACING.BOTTOM_PERCENT,
        boundingBox: params.boundingBox,
        frontBracingSize: template.FRONT_BRACING.SIZE,
    };

    const frontBracingConnectorLines = computeFrontBracings(frontBracingParams);

    const frontBracingDrawingParams = {
        frontBracingConnectorLines,
        frontBracingSize: template.FRONT_BRACING.SIZE,
        frontBracingStyle: template.FRONT_BRACING.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
        tilt: subarrayDetails.tilt,
    };
    drawFrontBracings(frontBracingDrawingParams, objectsGroup, template.NAME);

    return {};
}

export function createSideBracings(params, subarrayDetails, template, objectsGroup) {
    if (!containsAll(params, ['legPosition', 'purlinLines', 'legHeights', 'rafterLines'])) {
        throw new Error('createsideBracings failed. Necessary information not supplied.');
    }

    const sideBracingParams = {
        legPosition: params.legPosition,
        rafterLines: params.rafterLines,
        purlinLines: params.purlinLines,
        legHeights: params.legHeights,
        legPercentageFromBottom: template.SIDE_BRACING.BOTTOM_PERCENT,
        boundingBox: params.boundingBox,
        sideBracingSize: template.SIDE_BRACING.SIZE,
    };

    const sideBracingConnectorLines = computeSideBracings(sideBracingParams);

    const sideBracingDrawingParams = {
        sideBracingConnectorLines,
        sideBracingSize: template.SIDE_BRACING.SIZE,
        sideBracingStyle: template.SIDE_BRACING.STYLE,
        drawingBuffer: DRAWING_CONSTANTS.BUFFER,
        azimuth: subarrayDetails.azimuth,
        tilt: subarrayDetails.tilt,
    };
    drawSideBracings(sideBracingDrawingParams, objectsGroup ,template.NAME);

    return {};
}

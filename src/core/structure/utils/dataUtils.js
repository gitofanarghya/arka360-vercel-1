import * as constants from '../constants';
import { PANEL_ORIENTATION_PORTRAIT } from '../../coreConstants';

export function getTemplate(templateName) {
    return Object.values(constants.TEMPLATES).filter(obj => obj.NAME === templateName)[0];
}

export function getSubarrayPropertiesFromSubarray(subarray) {
    const subarrayPanelOrientation = subarray.panelOrientation;
    const moduleDimensions = {
        length: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleLength : subarray.moduleLength,
        width: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleWidth : subarray.moduleWidth,
    };
    const moduleid = subarray.moduleProperties !== undefined ?
        subarray.moduleProperties.moduleId : subarray.moduleId;

    let moduleHorizontalLength;
    let moduleVerticalLength;

    if (subarrayPanelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        moduleHorizontalLength = moduleDimensions.width;
        moduleVerticalLength = moduleDimensions.length;
    }
    else {
        moduleHorizontalLength = moduleDimensions.length;
        moduleVerticalLength = moduleDimensions.width;
    }

    const tableVerticalLength = (moduleVerticalLength * subarray.tableSizeUp) +
        (subarray.moduleSpacingUp * (subarray.tableSizeUp - 1));

    return {
        azimuth: subarray.azimuth,
        tilt: subarray.tilt,
        orientation: subarrayPanelOrientation,
        moduleDimensions,
        moduleid,
        moduleSpacing: { up: subarray.moduleSpacingUp, wide: subarray.moduleSpacingWide },
        tableSize: { up: subarray.tableSizeUp, wide: subarray.tableSizeWide },
        parentTilt: subarray.getParent().getTilt(),
        mountHeight: subarray.mountHeight,
        rowSpacing: subarray.rowSpacing,
        tableSpacing: subarray.tableSpacing,
        moduleHorizontalLength,
        moduleVerticalLength,
        pitch: subarray.rowSpacing + moduleDimensions.width,
        mountType: subarray.mountType,
        tableVerticalLength,
    };
}

export function getSubarrayPropertiesForDefaultSettings(subarray) {
    const subarrayPanelOrientation = subarray.panelOrientation;
    const moduleDimensions = {
        length: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleLength : subarray.moduleLength,
        width: subarray.moduleProperties !== undefined ?
            subarray.moduleProperties.moduleWidth : subarray.moduleWidth,
    };
    const moduleid = subarray.moduleProperties !== undefined ?
        subarray.moduleProperties.moduleId : subarray.moduleId;

    let moduleHorizontalLength;
    let moduleVerticalLength;

    if (subarrayPanelOrientation === PANEL_ORIENTATION_PORTRAIT) {
        moduleHorizontalLength = moduleDimensions.width;
        moduleVerticalLength = moduleDimensions.length;
    }
    else {
        moduleHorizontalLength = moduleDimensions.length;
        moduleVerticalLength = moduleDimensions.width;
    }

    const tableVerticalLength = (moduleVerticalLength * subarray.tableSizeUp) +
        (subarray.moduleSpacingUp * (subarray.tableSizeUp - 1));

    return {
        azimuth: subarray.azimuth,
        tilt: subarray.tilt,
        orientation: subarrayPanelOrientation,
        moduleDimensions,
        moduleid,
        moduleSpacing: { up: subarray.moduleSpacingUp, wide: subarray.moduleSpacingWide },
        tableSize: { up: subarray.tableSizeUp, wide: subarray.tableSizeWide },
        parentTilt: 0,
        mountHeight: subarray.mountHeight,
        rowSpacing: subarray.rowSpacing,
        tableSpacing: subarray.tableSpacing,
        moduleHorizontalLength,
        moduleVerticalLength,
        pitch: subarray.rowSpacing + moduleDimensions.width,
        mountType: 'Fixed Tilt',
        tableVerticalLength,
    };
}

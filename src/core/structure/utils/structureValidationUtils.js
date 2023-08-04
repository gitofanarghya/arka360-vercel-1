import * as constants from '../constants';
import {
    getTemplate,
    getSubarrayPropertiesFromSubarray,
    getSubarrayPropertiesForDefaultSettings,
} from './dataUtils';
import {
    PANEL_ORIENTATION_LANDSCAPE,
    ROW_SPACING_MODE_MANUAL,
    PANEL_ORIENTATION_PORTRAIT,
    SUBARRAY_RACK_STYLE_FIXED,
} from '../../coreConstants';
import { stringifyFromMetricMeasurement } from '../../../components/ui/length/utils';

// TODO: This seems out of place. Move it to mathUtils?
function getAllowedRanges(allowedValues, allowedVariation, digits) {
    const sortedAllowedValues = allowedValues.sort();
    const allowedRanges = [];
    for (let i = 0; i < sortedAllowedValues.length; i += 1) {
        const minValue = Math.round((sortedAllowedValues[i] - allowedVariation) *
            (10 ** digits)) / (10 ** digits);
        const maxValue = Math.round((sortedAllowedValues[i] + allowedVariation) *
            (10 ** digits)) / (10 ** digits);

        if (allowedRanges.length !== 0 && allowedRanges[i - 1].max > minValue) {
            allowedRanges[i - 1].max = maxValue;
        }
        else {
            allowedRanges.push({
                min: minValue,
                max: maxValue,
            });
        }
    }
    return allowedRanges;
}

// Validation functions
function validateMinimumMountHeight(structureValidation, template, subarrayDetails) {
    return {
        isValid: subarrayDetails.mountHeight >= structureValidation.mountHeight
            || subarrayDetails.parentTilt !== 0,
        isFixable: true,
        properties: {
            mountHeight: [
                { higherThan: structureValidation.mountHeight },
            ],
        },
        errorMessage: `Mount height is not higher than ${stringifyFromMetricMeasurement(structureValidation.mountHeight)}.`,
    };
}

function validateParentNonZeroTilt(structureValidation, template, subarrayDetails) {
    return {
        isValid: subarrayDetails.parentTilt === 0,
        isFixable: false,
        errorMessage: 'Parent tilt is not 0.',
        properties: {},
    };
}

function validate77WModuleByID(structureValidation, template, subarrayDetails) {
    const properties = {};
    properties.moduleId = [{ exact: structureValidation.moduleid }];
    const moduleIdset = new Set(structureValidation.moduleIdArray);
    return {
        isValid: moduleIdset.has(subarrayDetails.moduleid),
        isFixable: true,
        errorMessage: 'Panel is not 77W Arka Energy ',
        properties,
    };
}

function validateMountHeightHigherThanComponents(structureValidation, template, subarrayDetails) {
    let minimumHeight = 0;
    if (Object.prototype.hasOwnProperty.call(template, 'FOOTING')) {
        minimumHeight += template.FOOTING.SIZE.HEIGHT;
    }
    if (Object.prototype.hasOwnProperty.call(template, 'RAFTER')) {
        minimumHeight += template.RAFTER.SIZE.HEIGHT;
    }
    if (Object.prototype.hasOwnProperty.call(template, 'PURLIN')) {
        minimumHeight += template.PURLIN.SIZE.HEIGHT;
    }

    return {
        isValid: subarrayDetails.mountHeight > minimumHeight,
        isFixable: true,
        properties: {
            mountHeight: [
                { higherThan: minimumHeight },
            ],
        },
        errorMessage: `Mount height is not higher than ${stringifyFromMetricMeasurement(minimumHeight)}.`,
    };
}

function validateTiltRange(structureValidation, template, subarrayDetails) {
    const tiltRange = getAllowedRanges(
        [structureValidation.tilt],
        structureValidation.allowedVariation,
        3,
    )[0];

    let tiltProperties = [];
    let errorMessage;
    if (tiltRange.min === tiltRange.max) {
        tiltProperties = [{ exact: tiltRange.min }];
        errorMessage = `Subarray tilt should be ${tiltRange.min}`;
    }
    else {
        tiltProperties = [{ higherThan: tiltRange.min }, { lowerThan: tiltRange.max }];
        errorMessage = `Subarray tilt should be between ${tiltRange.min} and ${tiltRange.max}`;
    }
    return {
        isValid: subarrayDetails.tilt >= tiltRange.min && subarrayDetails.tilt <= tiltRange.max,
        isFixable: true,
        properties: {
            tilt: tiltProperties,
        },
        errorMessage,
    };
}

function validateTilt(structureValidation, template, subarrayDetails) {
    let tiltValid = false;
    const tiltValues = structureValidation.tiltValues.map(tilt => parseFloat(tilt.toFixed(3)));
    for (let j = 0; j < tiltValues.length; j += 1) {
        if (subarrayDetails.tilt === tiltValues[j]) {
            tiltValid = true;
            break;
        }
    }

    let errorMessage;
    if (tiltValues.length === 1) {
        errorMessage = `Tilt should be ${tiltValues[0]}.`;
    }
    else {
        errorMessage = `Tilt should be 
            ${tiltValues.slice(0, tiltValues.length - 1).join(',')} or
            ${tiltValues[tiltValues.length - 1]}.`;
    }

    return {
        isValid: tiltValid,
        isFixable: true,
        properties: {
            tilt: tiltValues.map(tiltValue => { return { exact: tiltValue }; }),
        },
        errorMessage,
    };
}

function validatePortraitOnly(structureValidation, template, subarrayDetails) {
    return {
        isValid: subarrayDetails.orientation === PANEL_ORIENTATION_PORTRAIT,
        isFixable: true,
        properties: {
            panelOrientation: [
                { exact: PANEL_ORIENTATION_PORTRAIT },
            ],
        },
        errorMessage: 'Table orientation is not portrait.',
    };
}

function validateLandscapeOnly(structureValidation, template, subarrayDetails) {
    return {
        isValid: subarrayDetails.orientation === PANEL_ORIENTATION_LANDSCAPE,
        isFixable: true,
        properties: {
            panelOrientation: [
                { exact: PANEL_ORIENTATION_LANDSCAPE },
            ],
        },
        errorMessage: 'Table orientation is not landscape.',
    };
}

function validateModuleSpacing(structureValidation, template, subarrayDetails) {
    const errorStrings = [];
    const properties = {};
    if (structureValidation.moduleSpacingUp &&
        structureValidation.moduleSpacingUp !== subarrayDetails.moduleSpacing.up) {
        errorStrings.push(`up should be ${stringifyFromMetricMeasurement(structureValidation.moduleSpacingUp)}`);
        properties.moduleSpacingUp = [{ exact: structureValidation.moduleSpacingUp }];
    }

    if (structureValidation.moduleSpacingWide &&
        structureValidation.moduleSpacingWide !== subarrayDetails.moduleSpacing.wide) {
        errorStrings.push(`wide should be ${stringifyFromMetricMeasurement(structureValidation.moduleSpacingWide)}`);
        properties.moduleSpacingWide = [{ exact: structureValidation.moduleSpacingWide }];
    }

    return {
        isValid: errorStrings.length === 0,
        isFixable: true,
        properties,
        errorMessage: `Module spacing ${errorStrings.join(' and ')}`,
    };
}

function validateTableSize(structureValidation, template, subarrayDetails) {
    const errorStrings = [];
    const properties = {};
    if (structureValidation.upValues &&
        !structureValidation.upValues.reduce((foundMatch, upValue) =>
            foundMatch || upValue === subarrayDetails.tableSize.up, false)
    ) {
        errorStrings.push(`size up should be ${structureValidation.upValues.join(', ')}`);
        properties.tableSizeUp = structureValidation.upValues.map((upValue) => { return { exact: upValue } });
    }

    if (structureValidation.wideValues &&
        !structureValidation.wideValues.reduce((foundMatch, wideValue) =>
            foundMatch || wideValue === subarrayDetails.tableSize.wide, false)
    ) {
        errorStrings.push(`size wide should be ${structureValidation.wideValues.join(', ')}`);
        properties.tableSizeWide = structureValidation.wideValues.map((wideValue) => { return { exact: wideValue } });
    }

    return {
        isValid: errorStrings.length === 0,
        isFixable: true,
        errorMessage: `Table ${errorStrings.join(' and ')}.`,
        properties,
    };
}

function validateCustomTableSizeWide(structureValidation, template, subarrayDetails) {
    let errorMessage = null;
    const properties = {};
    if (subarrayDetails.tableSize.wide % structureValidation.multipleOf !== 0) {
        errorMessage = `Table size wide should be a multiple of ${structureValidation.multipleOf}`;
        properties.tableSizeWide = [{
            exact: (subarrayDetails.tableSize.wide + structureValidation.multipleOf) -
                (subarrayDetails.tableSize.wide % structureValidation.multipleOf),
        }];
    }

    return {
        isValid: errorMessage === null,
        isFixable: true,
        errorMessage,
        properties,
    };
}

function validateRowSpacing(structureValidation, template, subarrayDetails) {
    let rowSpacingValid = false;
    const rowSpacingValues = structureValidation.rowSpacingValues
        .map(rowSpacing => parseFloat(rowSpacing.toFixed(3)));
    for (let j = 0; j < rowSpacingValues.length; j += 1) {
        if (subarrayDetails.rowSpacing === rowSpacingValues[j]) {
            rowSpacingValid = true;
            break;
        }
    }

    let errorMessage;
    if (rowSpacingValues.length === 1) {
        errorMessage = `Row spacing should be ${stringifyFromMetricMeasurement(rowSpacingValues[0])}.`;
    }
    else {
        errorMessage = `Row spacing should be 
            ${rowSpacingValues.map(rowSpacingValue => stringifyFromMetricMeasurement(rowSpacingValue)).slice(0, rowSpacingValues.length - 1).join(',')} or
            ${stringifyFromMetricMeasurement(rowSpacingValues[rowSpacingValues.length - 1])}.`;
    }

    return {
        isValid: rowSpacingValid,
        isFixable: true,
        properties: {
            rowSpacing: rowSpacingValues.map(rowSpacingValue => { return { exact: rowSpacingValue }; }),
            rowSpacingMode: [{ exact: ROW_SPACING_MODE_MANUAL }],
        },
        errorMessage,
    };
}

function validateMountHeight(structureValidation, template, subarrayDetails) {
    const requiredMountHeight = parseFloat(structureValidation.mountHeight.toFixed(3));
    return {
        isValid: subarrayDetails.mountHeight === requiredMountHeight,
        isFixable: true,
        properties: {
            mountHeight: [
                { exact: requiredMountHeight },
            ],
        },
        errorMessage: `Subarray mount height should be ${stringifyFromMetricMeasurement(requiredMountHeight)}.`,
    };
}

function validateTableSpacing(structureValidation, template, subarrayDetails) {
    const requiredTableSpacing = parseFloat(structureValidation.tableSpacing.toFixed(3));
    return {
        isValid: subarrayDetails.tableSpacing === requiredTableSpacing,
        isFixable: true,
        properties: {
            tableSpacing: [
                { exact: requiredTableSpacing },
            ],
        },
        errorMessage: `Subarray table spacing should be ${stringifyFromMetricMeasurement(requiredTableSpacing)}.`,
    };
}

function validateMultiPropertyCheck(structureValidation, template, subarrayDetails) {
    const errorStrings = [];
    for (let i = 0; i < structureValidation.propertyChecks.length; i += 1) {
        let valid = true;
        const propertyKeys = Object.keys(structureValidation.propertyChecks[i]);
        const propertyErrorStrings = [];
        for (let j = 0; j < propertyKeys.length; j += 1) {
            // TODO: Jugaad
            if (propertyKeys[j] === 'pitch') {
                if (structureValidation.propertyChecks[i][propertyKeys[j]] !==
                    subarrayDetails.rowSpacing + ((template.NAME === 'Ground Mount MMS') ? 2 * subarrayDetails.moduleDimensions.length : subarrayDetails.moduleDimensions.width)) {
                    valid = false;
                }
            }
            else {
                if (structureValidation.propertyChecks[i][propertyKeys[j]] !==
                    subarrayDetails[propertyKeys[j]]) {
                    valid = false;
                }
            }

            const readableName = (propertyKeys[j] === 'pitch') ? 'row spacing' : propertyKeys[j];
            // TODO: Jugaad
            let readableValue;

            if (template.NAME === 'Ground Mount MMS') {
                readableValue = Number.parseFloat((structureValidation.propertyChecks[i][propertyKeys[j]] -
                    ((propertyKeys[j] === 'pitch') ? subarrayDetails.moduleDimensions.length * 2 : 0)).toFixed(3));
            }
            else {
                readableValue = Number.parseFloat((structureValidation.propertyChecks[i][propertyKeys[j]] -
                    ((propertyKeys[j] === 'pitch') ? subarrayDetails.moduleDimensions.width : 0)).toFixed(3));
            }
            
            if (readableName === 'row spacing') {
                readableValue = stringifyFromMetricMeasurement(readableValue);
            }
            
            propertyErrorStrings.push(`${readableName} should be ${readableValue}`);
        }
        errorStrings.push(propertyErrorStrings.join(' and '));
        if (valid) {
            return {
                isValid: true,
            };
        }
    }

    // TODO: Pitch won't be handled properly here. Will need to change some things for that to work
    const { decidingFactor } = structureValidation;
    const subarrayValueForDecidingFactor = subarrayDetails[decidingFactor];

    let chosenPropertyCheck;
    let differenceBetweenClosesDecidingFactor = 100000;
    for (let i = 0; i < structureValidation.propertyChecks.length; i += 1) {
        const currentDecidingFactor = structureValidation.propertyChecks[i][decidingFactor];

        if (differenceBetweenClosesDecidingFactor > Math.abs(currentDecidingFactor - subarrayValueForDecidingFactor)) {
            differenceBetweenClosesDecidingFactor = Math.abs(currentDecidingFactor - subarrayValueForDecidingFactor);
            chosenPropertyCheck = structureValidation.propertyChecks[i];
        }
    }

    const newProperties = {};
    const newPropertyKeys = Object.keys(chosenPropertyCheck);
    for (let i = 0; i < newPropertyKeys.length; i += 1) {
        let adjustedKey = newPropertyKeys[i];
        let adjustedValue = chosenPropertyCheck[newPropertyKeys[i]];
        if (adjustedKey === 'pitch') {
            adjustedKey = 'rowSpacing';
            // TODO: Jugaad fix for now
            if (template.NAME === 'Ground Mount MMS') {
                adjustedValue -= subarrayDetails.moduleDimensions.length * 2;
            }
            else {
                adjustedValue -= subarrayDetails.moduleDimensions.width;
            }
            newProperties.rowSpacingMode = [{ exact: ROW_SPACING_MODE_MANUAL }];
        }

        newProperties[adjustedKey] = [{ exact: Number.parseFloat(adjustedValue.toFixed(3)) }];
    }

    const completeErrorString = errorStrings.join(' or ');
    return {
        isValid: false,
        isFixable: true,
        properties: newProperties,
        errorMessage: completeErrorString.charAt(0).toUpperCase() + completeErrorString.slice(1),
    };
}

function validateFixedMount(structureValidation, template, subarrayDetails) {
    return {
        isValid: subarrayDetails.mountType === SUBARRAY_RACK_STYLE_FIXED ||
            subarrayDetails.parentTilt !== 0,
        isFixable: false,
        properties: {
            mountType: [{ exact: SUBARRAY_RACK_STYLE_FIXED }],
        },
        errorMessage: 'Subarray mount type template should be fixed',
    };
}

function combineProperties(properties) {
    const combinedProperties = {};

    for (let j = 0; j < properties.length; j += 1) {
        const property = properties[j];
        const propertyKeys = Object.keys(property);
        for (let i = 0; i < propertyKeys.length; i += 1) {
            const currentProperty = propertyKeys[i];

            if (!combinedProperties[currentProperty]) {
                combinedProperties[currentProperty] = [];
            }

            combinedProperties[currentProperty].push(...property[currentProperty]);
        }
    }

    return combinedProperties;
}

function constructClosestPropertiesToSubarray(subarrayProperties, combinedProperties) {
    const closestProperties = {};
    const combinedPropertyKeys = Object.keys(combinedProperties);
    for (let i = 0; i < combinedPropertyKeys.length; i += 1) {
        let closestExact = Infinity;
        let min = Infinity;
        let max = -Infinity;
        const combinedProperty = combinedProperties[combinedPropertyKeys[i]];

        let subarrayCurrentValue;
        if (combinedPropertyKeys[i] === 'tableSizeUp') {
            subarrayCurrentValue = subarrayProperties.tableSize.up;
        }
        else if (combinedPropertyKeys[i] === 'tableSizeWide') {
            subarrayCurrentValue = subarrayProperties.tableSize.wide;
        }
        else {
            subarrayCurrentValue = subarrayProperties[combinedPropertyKeys[i]]
        }

        for (let j = 0; j < combinedProperty.length; j += 1) {
            if (combinedProperty[j].higherThan != null) {
                min = (min < combinedProperty[j].higherThan) ? min : combinedProperty[j].higherThan;
            }
            else if (combinedProperty[j].lowerThan != null) {
                max = (max > combinedProperty[j].lowerThan) ? max : combinedProperty[j].lowerThan;
            }
            else if (combinedProperty[j].exact != null) {
                closestExact = (Math.abs(closestExact - subarrayCurrentValue) < Math.abs(combinedProperty[j].exact - subarrayCurrentValue)) ?
                    closestExact : combinedProperty[j].exact;
            }
        }

        if (closestExact !== Infinity) {
            closestProperties[combinedPropertyKeys[i]] = closestExact;
        }
        else {
            closestProperties[combinedPropertyKeys[i]] =
                (Math.abs(min - subarrayCurrentValue) < Math.abs(max - subarrayCurrentValue)) ?
                    min : max;
        }
    }

    return closestProperties;
}

function validateStructuresForSubarray(subarrayProperties, templateName) {
    const template = getTemplate(templateName);

    const errors = [];

    const structureValidations = template.VALIDATION_CHECKS;
    for (let i = 0; i < structureValidations.length; i += 1) {
        switch (structureValidations[i].name) {
        case constants.VALIDATION_CHECKS.PARENT_NON_ZERO_TILT.name: {
            const validation =
                validateParentNonZeroTilt(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT.name: {
            const validation =
                validateMinimumMountHeight(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.CHECK_FIXED_MOUNT.name: {
            const validation =
                validateFixedMount(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.SUBARRAY_MOUNT_HEIGHT_HIGHER_THAN_COMPONENTS
            .name: {
            const validation =
            validateMountHeightHigherThanComponents(
                structureValidations[i],
                template,
                subarrayProperties,
            );
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.SUBARRAY_TILT_RANGE.name: {
            const validation =
            validateTiltRange(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.SUBARRAY_TILT.name: {
            const validation =
            validateTilt(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.LANDSCAPE_ONLY.name: {
            const validation =
            validateLandscapeOnly(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.PORTRAIT_ONLY.name: {
            const validation =
            validatePortraitOnly(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.TABLE_SIZE.name: {
            const validation =
            validateTableSize(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.ROW_SPACING.name: {
            const validation =
            validateRowSpacing(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.MOUNT_HEIGHT.name: {
            const validation =
            validateMountHeight(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.TABLE_SPACING.name: {
            const validation =
                validateTableSpacing(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.MODULE_SPACING.name: {
            const validation =
                validateModuleSpacing(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.MULTI_PROPERTY_CHECKS.name: {
            const validation =
                validateMultiPropertyCheck(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.TABLE_SIZE_WIDE_MULTIPLE.name: {
            const validation =
                validateCustomTableSizeWide(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        case constants.VALIDATION_CHECKS.MODULE77W_ID.name: {
            const validation =
                validate77WModuleByID(structureValidations[i], template, subarrayProperties);
            if (!validation.isValid) {
                errors.push(validation);
            }
            break;
        }
        default:
            console.warn('WARN: structureValidations.js: Incorrect validation given for structures');
            break;
        }
    }
    return errors;
}

export function getPropertiesForSubarrayForAutoFix(subarray, templateName) {
    // const subarrayProperties = getSubarrayPropertiesForDefaultSettings(subarray);
    const subarrayProperties = getSubarrayPropertiesFromSubarray(subarray);
    const allValidations = validateStructuresForSubarray(subarrayProperties, templateName);

    const properties = allValidations.filter(validation => validation.isFixable)
        .map((validation => validation.properties));

    const combinedProperties = combineProperties(properties);

    return {
        subarrayProperties: constructClosestPropertiesToSubarray(subarrayProperties, combinedProperties),
        allErrorsFixable: allValidations.every(validation => validation.isFixable),
    };
}

export function getStructureValidationErrorMessages(subarray, templateName) {
    if (subarray.objectType && subarray.objectType === 'Gazebo') {
        return [];
    }
    const subarrayProperties = getSubarrayPropertiesFromSubarray(subarray);
    return validateStructuresForSubarray(subarrayProperties, templateName)
        .map(validation => validation.errorMessage);
}

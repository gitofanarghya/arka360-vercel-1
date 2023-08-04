import {
    STANDARD_INCHES_FORMAT,
    STANDARD_FEET_FORMAT,
    FOOT_INCHES_VALIDATION_REGEX,
} from './constants';
import { store } from '../../../store';

function getFeetInchesInStandardFormat(userFootInchesString, regex) {
    // takes the input by user in all accepted formats and return it in x ft y in
    // group represents the group from regex that consists numeric value for ft and in
    // HERE $1 --> Input Feet value & $8 --> Input Inches value

    // TODO: Jugaad for only inches
    const feetRegex = /'|ft|feet/;
    let regexGroup = `$2 ${STANDARD_FEET_FORMAT} $8 ${STANDARD_INCHES_FORMAT}`;
    if (!feetRegex.test(userFootInchesString)) {
        // Update regex group if it's only inches
        regexGroup = `0 ${STANDARD_FEET_FORMAT} $12 ${STANDARD_INCHES_FORMAT}`;
    }
    return userFootInchesString.replace(regex, regexGroup);
}

// eslint-disable-next-line import/prefer-default-export
export function parseImperialMeasurement(val) {
    const standardFootInchesInput = getFeetInchesInStandardFormat(
        val,
        FOOT_INCHES_VALIDATION_REGEX,
    );
    const feetInchesObject = {
        feet: 0,
        inches: 0,
    };
    const indexOfFt = standardFootInchesInput.indexOf(STANDARD_FEET_FORMAT);
    const indexOfIn = standardFootInchesInput.indexOf(STANDARD_INCHES_FORMAT);
    if (indexOfFt !== -1) {
        feetInchesObject.feet = standardFootInchesInput.slice(0, indexOfFt).trim();
    }
    if (indexOfIn !== -1) {
        feetInchesObject.inches = standardFootInchesInput
            .slice(indexOfFt + STANDARD_FEET_FORMAT.length, indexOfIn)
            .trim();
    }
    return [
        Number.isNaN(parseFloat(feetInchesObject.feet)) ? 0 : parseFloat(feetInchesObject.feet),
        Number.isNaN(parseFloat(feetInchesObject.inches)) ? 0 : parseFloat(feetInchesObject.inches),
    ];
}

export function stringify2ndDimensionImperialMeasurement(squareFeet) {
    return `${new Intl.NumberFormat('en-US').format(squareFeet.toFixed(2))} sq.ft`;
}

export function convertMeterSqtToSqtFeet(value) {
    const MsqtToSqtF = 10.7639;
    const convert = (value * MsqtToSqtF);
    return (convert);
}

export function convertSqtFeetToMeterSqt(value) {
    const SqtFToMsqt = 10.7639;
    const convert1 = (value * SqtFToMsqt);
    return convert1;
}

export function convertImperialToMetric(imperialValues) {
    const in2ft = 0.0833333;
    const ft2mt = 0.3048;
    const value = ((imperialValues[0] + ( imperialValues[1] * in2ft )) * ft2mt);
    // return math
    //     .add(math.unit(imperialValues[0], 'ft'), math.unit(imperialValues[1], 'in'))
    //     .toNumber('m');
    return value;
}

export function convertMetricToImperial(metricValue, dimension = 1) {
    const sqmt2sqft = 10.7639;
    const mt2in = 39.3701;
    const feet = Math.floor((metricValue * mt2in) / 12);
    const inch = (metricValue * mt2in) - (12 * feet);
    switch (dimension) {
    case 1:
        // return math
        //     .unit(metricValue, 'm')
        //     .splitUnit(['ft', 'in'])
        //     .map(e => e.toNumber());
        return [feet, inch];
    case 2:
        // return math
        //     .unit(metricValue, 'm2')
        //     .toNumber('sqft');
        return (metricValue * sqmt2sqft);
    default:
        throw Error('Invalid Dimension Value');
    }
}

/**
 * Returns the current measurement unit.
 */
export function isMetricUnit() {
    return store.getters['design/IS_DESIGN_MEASUREMENT_SYSTEM_METRIC'];
}

// Functions related to stringifying

/**
 * This stringifies 'meters'. Should be avoided to be called from outside this module.
 * stringifyFromMetricMeasurement should be called instead.
 * @param  {Number} meters
 */
export function stringifyMetricMeasurement(meters, isMsqt = false) {
    if (isMsqt) {
        return `${meters.toFixed(3)} sqm`;
    }
    else {
        return `${Number(meters).toFixed(3)}`;
    }
}

/**
 * This stringifies 'feets' and 'inches'. Should be avoided to be called from outside this module.
 * stringifyFromMetricMeasurement should be called instead.
 * @param  {Number} feet
 * @param  {Number} inches
 */
export function stringifyImperialMeasurement(feet, inches) {
    if (inches === undefined) {
        return (`${feet.toFixed(2)} sq.ft`);
    }
    else {
        const roundedFeet = (Number.parseFloat(inches.toFixed(2)) === 12) ?
            Number.parseFloat((feet + 1).toFixed(2)) :
            Number.parseFloat(feet.toFixed(2));

        return `${(roundedFeet > 0) ? `${roundedFeet} ft ` : ''}${Number.parseFloat(inches.toFixed(2)) === 12 ? 0 : inches.toFixed(2)} in`;
    }
}

/**
 * This stringifies metric measurement to whatever the current measurement unit is.
 * This is the right function to call when converting metric units in threeJS.
 * @param  {Number} meters
 */
export function stringifyFromMetricMeasurement(meters) {
    return isMetricUnit() ? stringifyMetricMeasurement(meters) :
        stringifyImperialMeasurement(...convertMetricToImperial(meters));
}

import { getSubarrays } from './exporters';

function getInverterSizing(modules, inverters, temperature, autoSizingRequired = false) {
    function splitNumberIntoAlmostEqualParts(numberToSplit, numberOfParts) {
        
        if (numberToSplit % numberOfParts === 0 ) {
            return [
                {
                    numberOfModules: numberToSplit / numberOfParts,
                    numberOfStrings: 1,
                    numberOfInvertersToUseThisStringSize: numberOfParts,
                },
            ];
        }
        const splittedNumbers = [];
        let numberOfModulesOfBiggerType = 0;
        const zp = numberOfParts - (numberToSplit % numberOfParts);
        const pp = parseInt(numberToSplit / numberOfParts, 10);
        for (let i = 0; i < numberOfParts; i += 1) {
            if (i >= zp) {
                splittedNumbers.push(pp + 1);
                numberOfModulesOfBiggerType += 1;
            }
            else {
                splittedNumbers.push(pp);
            }
        }
        const stringConfigurationToAdd = [];
        stringConfigurationToAdd.push(
            {
                numberOfModules: pp,
                numberOfStrings: 1,
                numberOfInvertersToUseThisStringSize: splittedNumbers.length - numberOfModulesOfBiggerType,
            },
            {
                numberOfModules: pp + 1,
                numberOfStrings: 1,
                numberOfInvertersToUseThisStringSize: numberOfModulesOfBiggerType,
            },
        );

        return stringConfigurationToAdd;
    }
    function getStringSizingRange(inverter) {
        const mpptLow = inverter.electricalProperties.MPPT_Low_V;
        const mpptHigh = inverter.electricalProperties.MPPT_High_V;
        const moduleVocCoefficient = modules.characteristics.mu_voc;
        const moduleVoc = modules.characteristics.voc;
        const lowestTemp = temperature.min;
        const highestTemp = temperature.max + 35;

        const maxSeriesModules = parseInt(Math.ceil(mpptHigh /
            ((moduleVoc) * (1 - ((moduleVocCoefficient / 100) * (25 - highestTemp))))), 10);

        const minSeriesModules = parseInt(Math.ceil(mpptLow /
            ((moduleVoc) * (1 - ((moduleVocCoefficient / 100) * (25 - lowestTemp))))), 10);

        return { minSeriesModules, maxSeriesModules };
    }
    // No Automatic string sizing, if any inverter is strung
    let isAutoStringSizingRequired = true;
    let totalModulesAlreadyStrung = 0;

    // if auto sizing is not required by the calling function, then check if needs to be done or not
    if (autoSizingRequired !== true) {
        inverters.forEach((inverter) => {
            if (Object.prototype.hasOwnProperty.call(inverter, 'sizing')) {
                isAutoStringSizingRequired = !inverter.sizing.length > 0;
                inverter.sizing.forEach((currentSizing) => {
                    totalModulesAlreadyStrung +=
                        currentSizing.inverterCountCurrentSizing *
                        currentSizing.stringsConfiguration.reduce((a, b) => a + (b.numberOfStrings * b.numberOfModules), 0);
                });
            }
            else {
                inverter['sizingRange'] = getStringSizingRange(inverter);
                // inverter['numberOfStrings'] = 0;
                inverter['numberOfStrings'] = 0;
                inverter['sizing'] = [];
            }
        });
    }

    if (isAutoStringSizingRequired) {
        let ifUniformStringSizingWithMaxModules = true;
        let totalModulesLeft = modules.count;
        while (totalModulesLeft > 0 && ifUniformStringSizingWithMaxModules) {
            for (let index = 0; index < inverters.length; index += 1) {
                // const requiredModules = inverters[index].quantity * inverters[index].sizingRange.maxSeriesModules;
                const requiredModules = inverters[index].sizingRange.maxSeriesModules;
                if (totalModulesLeft >= requiredModules) {
                    inverters[index].numberOfStrings += 1;
                    if (inverters[index].sizing.length > 0) {
                        inverters[index].sizing[0].stringsConfiguration[0].numberOfStrings += 1;
                    }
                    else {
                        inverters[index].sizing.push({
                            // inverterCountCurrentSizing: inverters[index].quantity,
                            inverterCountCurrentSizing: 1,
                            stringsConfiguration: [{
                                numberOfStrings: 1,
                                // ...inverters[index].sizing.stringsConfiguration,
                                numberOfModules: inverters[index].sizingRange.maxSeriesModules,
                            }],
                        });
                    }
                    totalModulesLeft -= requiredModules;
                }
                else {
                    // Case when uniform string sizing with maximum modules is not possible
                    ifUniformStringSizingWithMaxModules = false;
                    // if (totalModulesLeft > inverters[index].quantity * inverters[index].sizingRange.minSeriesModules) {
                    if (totalModulesLeft > inverters[index].sizingRange.minSeriesModules) {
                        // for this type of inverter, divide remaining panels into N parts, with minimum difference
                        const stringConfigurationToAdd = splitNumberIntoAlmostEqualParts(totalModulesLeft, 1);
                        
                        // Case when splitted configuration results in two types of string sizes
                        if (stringConfigurationToAdd.length > 1) {
                            if (inverters[index].numberOfStrings > 0) {
                                inverters[index].numberOfStrings += 1;
                                inverters[index].sizing.push(JSON.parse(JSON.stringify(inverters[index].sizing[0])));
                                for (let i = 0; i < inverters[index].sizing.length; i += 1) {
                                    inverters[index].sizing[i].stringsConfiguration.push({
                                        numberOfStrings: stringConfigurationToAdd[i].numberOfStrings,
                                        numberOfModules: stringConfigurationToAdd[i].numberOfModules,
                                    });
                                    inverters[index].sizing[i].inverterCountCurrentSizing = stringConfigurationToAdd[i].numberOfInvertersToUseThisStringSize;
                                    totalModulesLeft -= stringConfigurationToAdd[i].numberOfModules * stringConfigurationToAdd[i].numberOfInvertersToUseThisStringSize;
                                }
                            }
                            else {
                                inverters[index].numberOfStrings += 1;
                                for (let j = 0; j < stringConfigurationToAdd.length; j += 1) {
                                    inverters[index].sizing.push({
                                        inverterCountCurrentSizing: stringConfigurationToAdd[j].numberOfInvertersToUseThisStringSize,
                                        stringsConfiguration: [{
                                            numberOfStrings: stringConfigurationToAdd[j].numberOfStrings,
                                            numberOfModules: stringConfigurationToAdd[j].numberOfModules,
                                        }],
                                    });
                                    totalModulesLeft -= stringConfigurationToAdd[j].numberOfModules * stringConfigurationToAdd[j].numberOfInvertersToUseThisStringSize;
                                }
                            }
                        }
                        // Case when splitted configuration results in uniform string size
                        else if (stringConfigurationToAdd.length === 1) {
                            if (inverters[index].numberOfStrings > 0) {
                                inverters[index].numberOfStrings += 1;
                                inverters[index].sizing[0].stringsConfiguration.push({
                                    numberOfStrings: stringConfigurationToAdd[0].numberOfStrings,
                                    numberOfModules: stringConfigurationToAdd[0].numberOfModules,
                                });
                                totalModulesLeft -= stringConfigurationToAdd[0].numberOfModules * inverters[index].sizing[0].inverterCountCurrentSizing;
                            }
                            else {
                                inverters[index].numberOfStrings += 1;
                                inverters[index].sizing.push({
                                    inverterCountCurrentSizing: stringConfigurationToAdd[0].numberOfInvertersToUseThisStringSize,
                                    stringsConfiguration: [{
                                        numberOfStrings: stringConfigurationToAdd[0].numberOfStrings,
                                        numberOfModules: stringConfigurationToAdd[0].numberOfModules,
                                    }],
                                });
                                totalModulesLeft -= stringConfigurationToAdd[0].numberOfModules * stringConfigurationToAdd[0].numberOfInvertersToUseThisStringSize;
                            }
                        }
                        return { inverters, totalModulesLeft };
                    }
                    return { inverters, totalModulesLeft };
                }
            }
        }
        return { inverters, totalModulesLeft };
    }
    return { inverters, totalModulesLeft: modules.count - totalModulesAlreadyStrung };
}

function getUniqueModuleIdWithCount(object) {
    const subarrays = [];
    getSubarrays(object, subarrays);

    const uniqueModuleIds = {};
    for (let idx = 0, len = subarrays.length; idx < len; idx += 1) {
        const subarray = subarrays[idx];
        const moduleId = subarray.getModuleId();
        if (Object.prototype.hasOwnProperty.call(uniqueModuleIds, moduleId)) {
            uniqueModuleIds[moduleId] += subarray.getNumberOfPanels();
        }
        else {
            uniqueModuleIds[moduleId] = subarray.getNumberOfPanels();
        }
    }
    return uniqueModuleIds;
}

export { getInverterSizing, getUniqueModuleIdWithCount };

const lengthValidation = {
    nonReactiveData() {
        return {
            lengthValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
        };
    },
};

const parapetThicknessValidation = {
    nonReactiveData() {
        return {
            parapetThicknessValidation: {
                required: true,
                min_value: 0.001,
                max_value: 10,
                decimal: 3,
            },
        };
    },
};

const treeValidation = {
    nonReactiveData() {
        return {
            treeValidation: {
                required: true,
                min_value: 0.001,
                max_value: 50,
                decimal: 3,
            },
        };
    },
};


const zeroLengthValidation = {
    nonReactiveData() {
        return {
            zeroLengthValidation: {
                required: true,
                min_value: 0,
                max_value: 10,
                decimal: 3,
            },
        };
    },
};

const tiltValidation = {
    nonReactiveData() {
        return {
            tiltValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 89.9,
                },
                decimal: 2,
            },
        };
    },
};

const smartRoofTiltValidation = {
    nonReactiveData() {
        return {
            smartRoofTiltValidation: {
                required: true,
                between: {
                    min: 0.1,
                    max: 89.9,
                },
                decimal: 2,
            },
        };
    },
};

const smartRoofHeightValidation = {
    nonReactiveData() {
        return {
            smartRoofHeightValidation: {
                required: true,
                between: {
                    min: 0.1,
                    max: 100,
                },
                // decimal: 2,
            },
        };
    },
};


const azimuthValidation = {
    nonReactiveData() {
        return {
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 359.99,
                },
                decimal: 2,
            },
        };
    },
};

const customImageRotationValidation = {
    nonReactiveData() {
        return {
            customImageRotationValidation: {
                required: true,
                between: {
                    min: -180,
                    max: 180,
                },
                decimal: 2,
            },
        };
    },
};

const customImageOpacityValidation = {
    nonReactiveData() {
        return {
            customImageOpacityValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 100,
                },
            },
        };
    },
};

const unitsValidation = {
    nonReactiveData() {
        return {
            unitsValidation: {
                required: true,
                numeric: true,
                min_value: 1,
            },
        };
    },
};

export default {
    lengthValidation,
    zeroLengthValidation,
    tiltValidation,
    smartRoofTiltValidation,
    smartRoofHeightValidation,
    customImageRotationValidation,
    customImageOpacityValidation,
    azimuthValidation,
    unitsValidation,
    parapetThicknessValidation,
    treeValidation,
};

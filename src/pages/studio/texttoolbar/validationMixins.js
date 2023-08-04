const fontSizeValidation = {
    nonReactiveData() {
        return {
            fontSizeValidation: {
                required: true,
                between: {
                    min: 6,
                    max: 400,
                },
                decimal: 1,
            },
        };
    },
};

const shapeWidthValidation = {
    nonReactiveData() {
        return {
            shapeWidthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 50,
                },
                decimal: 2,
            },
        };
    },
};

export default {
    fontSizeValidation,
    shapeWidthValidation,
};

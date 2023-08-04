<template>
    <span :class="classDisplay">
        {{ displayValue }}
    </span>
</template>

<script>
import { mapState } from 'pinia';
import { useDesignStore } from '../../../stores/design';
import {
    stringifyMetricMeasurement,
    stringifyImperialMeasurement,
    stringify2ndDimensionImperialMeasurement,
    convertMetricToImperial,
    convertMeterSqtToSqtFeet,
} from './utils';

export default {
    name: 'DisplayLength',
    props: {
        metricValue: {
            type: [Number, String],
            default: NaN,
        },
        classDisplay: {
            type: String,
            default: '',
        },
        dimension: {
            type: Number,
            default: 1,
            validator(value) {
                return [1, 2].indexOf(value) !== -1;
            },
        },
        convertValue: {
            type: Boolean,
            default: false,
        },
        appendMeterUnit: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState(useDesignStore, {
            metricSystem: 'IS_DESIGN_MEASUREMENT_SYSTEM_METRIC',
        }),
        displayValue() {
            // for status bar
            if (this.metricValue === '--') {
                return '--';
            }
            // for Easier Shed Height values
            if (Number.isNaN(this.metricValue) || this.metricValue === '' || this.metricValue === null || this.metricValue === undefined || this.metricValue === "NaN") {
                return '';
            }
            if (this.convertValue) {
                if (this.metricSystem) {
                    return stringifyMetricMeasurement(this.metricValue, true);
                }
                else {
                    return stringifyImperialMeasurement(convertMeterSqtToSqtFeet(this.metricValue));
                }
            }
            if (this.metricSystem) {
                if(this.appendMeterUnit==true)        
                    return stringifyMetricMeasurement(Number(this.metricValue))+' m';

                return stringifyMetricMeasurement(Number(this.metricValue));
            }

            switch (this.dimension) {
            case 1:
                if (this.metricValue >= 0) {
                    return stringifyImperialMeasurement(...convertMetricToImperial(this.metricValue));
                }
                // if metricValue is less than zero convert it to -(x ft y in)
                return `-${stringifyImperialMeasurement(...convertMetricToImperial(-(this.metricValue)))}`;
            case 2:
                return stringify2ndDimensionImperialMeasurement(convertMetricToImperial(this.metricValue, this.dimension));
            default:
                return 'Invalid Dimension Value';
            }
        },
    },
};
</script>

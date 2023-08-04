<template>
    <span>
        <label>
            <input
                v-validate="inputValidation"
                v-model="displayValue.text"
                :name="name"
                :disabled="disabled"
                :class="classInput"
                :data-vv-scope="errorScope !== null ? errorScope : null"
                autocomplete="off"
                @input="onDisplayValueUpdate">
        </label>
    </span>
</template>

<script>
import _ from 'lodash';
import {
    parseImperialMeasurement,
    stringifyMetricMeasurement,
    stringifyImperialMeasurement,
    convertMetricToImperial,
    convertImperialToMetric,
} from './utils';
import { FOOT_INCHES_VALIDATION_REGEX } from './constants';
import { mapState } from 'pinia';
import { useDesignStore } from '../../../stores/design';

const EPSILON = 10e-5;

export default {
    name: 'InputLength',
    model: {
        prop: 'metricValueProp',
        event: 'updateMetricValueProp',
    },
    props: {
        metricValueProp: {
            type: [Number, String],
            default: NaN,
        },
        name: {
            type: String,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        classInput: {
            type: String,
            default: '',
        },
        metricValidation: {
            type: Object,
            default() {
                return {
                    required: true,
                    min_value: 0.001,
                    decimal: 3,
                };
            },
        },
        errorViewAncestor: {
            type: Object,
            default() {
                return this.$parent;
            },
        },
        errorScope: {
            type: String,
            default: null,
        },
        setBackVal: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            metricValue: {
                meters: NaN,
                toString() {
                    return stringifyMetricMeasurement(this.meters);
                },
                set(meters) {
                    this.meters = meters;
                },
                get() {
                    return this.meters;
                },
                toImperialValue() {
                    return convertMetricToImperial(this.meters);
                },
            },
            imperialValue: {
                feet: NaN,
                inches: NaN,
                toString() {
                    return stringifyImperialMeasurement(this.feet, this.inches);
                },
                set(feet, inches) {
                    this.feet = feet;
                    this.inches = inches;
                },
                toMetricValue() {
                    return convertImperialToMetric([this.feet, this.inches]);
                },
            },
            displayValue: {
                text: null,
                toMetricValue() {
                    return parseFloat(this.text);
                },
                toImperialValue() {
                    return parseImperialMeasurement(this.text);
                },
                set(text) {
                    this.text = text;
                },
            },
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            metricSystem: 'IS_DESIGN_MEASUREMENT_SYSTEM_METRIC',
        }),
        inputValidation() {
            return this.metricSystem ? this.metricValidation : this.imperialValidation;
        },
        imperialValidation() {
            return {
                regex: FOOT_INCHES_VALIDATION_REGEX,
                required: this.metricValidation.required,
            };
        },
        isMetricValuePropNotEmptyNullAndUndefined() {
            return this.metricValueProp !== null && this.metricValueProp !== undefined && this.metricValueProp !== '';
        },
    },
    watch: {
        metricValueProp: {
            handler: 'onMetricValuePropUpdate',
            immediate: true,
        },
        metricSystem: {
            handler() {
                this.updateDisplayValue();
            },
        },
        'metricValidation.required': {
            handler() {
                this.handleESHValue();
            },
        },
    },
    mounted() {
        this.onMetricValuePropUpdate(this.metricValueProp);
    },
    methods: {
        onMetricValuePropUpdate(metricValueProp) {
            if (metricValueProp === 'custom') {
                this.displayValue.set('custom');
                return;
            }
            if (!Number.isNaN(metricValueProp) && this.isMetricValuePropNotEmptyNullAndUndefined) {
                if (Number.isNaN(this.metricValue.get())) {
                    this.updateMetricValue(metricValueProp);
                    this.updateDisplayValue();
                }
                else if (Math.abs(this.metricValue.get() - metricValueProp) > EPSILON) {
                    this.updateMetricValue(metricValueProp);
                    this.updateDisplayValue();
                }
            }
        },
        updateMetricValue(meters) {
            this.metricValue.set(meters);
            this.imperialValue.set(...this.metricValue.toImperialValue());
        },
        updateImperialValue(feet, inches) {
            this.imperialValue.set(feet, inches);
            this.metricValue.set(this.imperialValue.toMetricValue());
        },
        async handleESHValue() {
            const isMetricValueNullUndefinedEmptyOrNaN = this.metricValueProp === '' ||
                Number.isNaN(this.metricValueProp) || this.metricValueProp === undefined ||
                this.metricValueProp === null;
            if (isMetricValueNullUndefinedEmptyOrNaN) {
                this.displayValue.set('');
                await this.$nextTick;
                await this.updateErrors();
                if (this.metricSystem) {
                    this.updateMetricValue(NaN);
                }
                else {
                    this.updateImperialValue(NaN, NaN);
                }
                this.$emit('updateMetricValueProp', NaN);
            }
        },
        async updateDisplayValue() {
            if (!Number.isNaN(this.metricValueProp) && this.isMetricValuePropNotEmptyNullAndUndefined) {
                this.displayValue.set(this.metricSystem ?
                    this.metricValue.toString() : this.imperialValue.toString());
                await this.$nextTick();
                await this.updateErrors();
            }
        },
        async updateErrors() {
            await this.$validator.validate();
            if (this.errorScope === null) {
                this.errorViewAncestor.errors.remove(this.name);
                if (this.errors.has(this.name)) {
                    this.errorViewAncestor.errors.add({
                        field: this.name,
                        msg: this.errors.first(this.name),
                    });
                }
            }
            else {
                this.errorViewAncestor.errors.remove(this.name, this.errorScope);
                if (this.errors.has(this.name, this.errorScope)) {
                    this.errorViewAncestor.errors.add({
                        field: this.name,
                        msg: this.errors.first(this.name, this.errorScope),
                        scope: this.errorScope,
                    });
                }
            }
        },
        async onDisplayValueUpdate() {
            if (this.setBackVal) {
                if (this.displayValue.text === 'custom') {
                    this.$emit('updateMetricValueProp', 'custom');
                    this.errorViewAncestor.errors.remove(this.name);
                    return;
                }
            }
            await this.updateErrors();
            if (this.metricSystem) {
                if (this.errors.any()) {
                    this.updateMetricValue(NaN);
                }
                else if (
                    stringifyMetricMeasurement(this.displayValue.toMetricValue()) !==
                    this.metricValue.toString()
                ) {
                    this.updateMetricValue(this.displayValue.toMetricValue());
                }
            }
            else {
                const displayImperialValue = this.displayValue.toImperialValue();
                // manually handling less than 0.03 inches
                if (this.metricValidation.min_value > 0) {
                    const [feet, inches] = [...displayImperialValue];
                    if (feet === 0 && inches <= 0.03) {
                        this.errorViewAncestor.errors.add({
                            field: this.name,
                            msg: `${this.name} field can't be less than 0.03 inches`,
                        });
                    }
                }
                if (this.errors.any()) {
                    this.updateImperialValue(NaN, NaN);
                }
                else if (
                    stringifyImperialMeasurement(...displayImperialValue) !==
                    this.imperialValue.toString()
                ) {
                    this.updateImperialValue(...displayImperialValue);
                    
                }
            }
            this.updateParent();
        },
        updateParent() {
            if (this.errors.any()) {
                this.$emit('updateMetricValueProp', NaN);
            }
            else {
                this.$emit('updateMetricValueProp', _.round(this.metricValue.get(), 5));
            }
        },
    },
};
</script>


<style lang="scss" scoped>
    @import '../../../styles/components/input';
    @import '../../../styles/components/button';
</style>
<style scoped>
/* input{
    background-color: var(--step-50);
    border: none;
    border-radius:4px;
     padding: 5px 10px;
} */
</style>
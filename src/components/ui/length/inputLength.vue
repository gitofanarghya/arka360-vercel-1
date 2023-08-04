<template>
    <span :class="spanWidth">
        <label>
            <input
                v-validate="inputValidation"
                v-model="displayValue.text"
                :name="name"
                :disabled="disabled"
                :placeholder="holder"
                :class="classInput"
                :data-vv-scope="errorScope !== null ? errorScope : null"
                autocomplete="off"
                @keyup.enter="enter"
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
    convertMeterSqtToSqtFeet,
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
        className: {
            type: String,
            default: ''
            // default: 'sappane-input-value'
        },
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
        holder:{
            type: String,
            default: ""
        },
        spanWidth: {
            type: String,
            default: ''
        },
        convertValue: {
            type: Boolean,
            default: false,
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
        const convertToSqtFeet = this.convertValue;
        return {
            enterPressed: false,
            metricValue: {
                meters: NaN,
                toString() {
                    if (convertToSqtFeet) {
                        return stringifyMetricMeasurement(this.meters, true);
                    }
                    return stringifyMetricMeasurement(this.meters);
                },
                set(meters) {
                    this.meters = meters;
                },
                get() {
                    return this.meters;
                },
                toImperialValue() {
                    if (convertToSqtFeet) {
                        return convertMeterSqtToSqtFeet(this.meters);
                    }
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
            if (!(this.convertValue)) {
                return this.metricSystem ? this.metricValidation : this.imperialValidation;
            }
            else {
                return true;
            }
        },
        imperialValidation() {
            if (!(this.convertValue)) {
                return {
                    regex: FOOT_INCHES_VALIDATION_REGEX,
                    required: this.metricValidation.required,
                };
            }
            else {
                return {
                    required: this.metricValidation.required,
                };
            }       
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
        enter(){
            this.$emit("enterPressed",this.enterPressed = true);
        },
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
            if (!this.convertValue) {
                this.imperialValue.set(...this.metricValue.toImperialValue());
            }
            else {
                this.imperialValue.set(this.metricValue.toImperialValue());
            }
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
    .setBackStyle {
        background-color: #050505;
        width: 55%;
        float: right;
        height: 1.5vw !important;
        color: #fafafa;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        padding: 0 5px 0 0;
        border: none;
        text-align: right;
        font-size: 0.8vw;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        border-radius: 2px;
    }
</style>
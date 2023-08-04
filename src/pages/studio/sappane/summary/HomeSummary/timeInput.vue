<template>
    <div class="timeInput">
        <input
            :disabled="disabled"
            :step="step"
            v-model.number="minute"
            type="number"
            class="sappane-input-value"
            onfocus="this.select();"
            @blur="minute = checkRangeMinute()"
            @keydown.esc="minute = checkRangeMinute()"
            @keydown.enter="minute = checkRangeMinute()"
            @keydown.up.prevent="incrementMinute"
            @keydown.down.prevent="decrementMinute"
            @keydown.left.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
            @keydown.tab.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
        >

        <p
            class="sappane-value"
            style="width: 10px;">:</p>
        <input
            :disabled="disabled"
            :step="step"
            v-model.number="hour"
            class="sappane-input-value"
            type="number"
            onfocus="this.select();"
            @blur="hour = checkRangeHour()"
            @keydown.esc="hour = checkRangeHour()"
            @keydown.enter="hour = checkRangeHour()"
            @keydown.up.prevent="incrementHour"
            @keydown.down.prevent="decrementHour"
            @keydown.right.prevent="
                $event.target.previousElementSibling.previousElementSibling.focus()
            "
            @keydown.tab.prevent="
                $event.target.previousElementSibling.previousElementSibling.focus()
            "
        >
    </div>
</template>

<script>

import { DateTime } from 'luxon';

export default {

    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        max: {
            type: Number,
            default: Infinity,
        },
        min: {
            type: Number,
            default: -Infinity,
        },
        value: {
            type: Number,
            required: true,
        },
        step: {
            type: Number,
            default: 1,
        },
        zoneIana: {
            type: String,
            default: 'Asia/Calcutta',
        },
    },
    data() {
        return {
            currentValue: this.value,
            decrementDisabled: false,
            incrementDisabled: false,
            minute: 1,
            hour: 1,
        };
    },

    watch: {
        value(val) {
            const date = DateTime.fromMillis(val, { zone: this.zoneIana });
            this.hour = date.hour;
            this.minute = date.minute;
        },
    },

    mounted() {
        const date = DateTime.fromMillis(this.value, { zone: this.zoneIana });
        this.hour = date.hour;
        this.minute = date.minute;
    },

    methods: {
        checkRangeMinute() {
            let val = 0;
            if (this.minute > 59) {
                val = 59;
            }
            else if (this.minute < 0) {
                val = 0;
            }
            else {
                val = this.minute;
            }
            this.currentValue = (DateTime.fromObject({
                year: 1970,
                month: 1,
                day: 1,
                hour: this.hour,
                minute: val,
            }, {
                zone: this.zoneIana,
            })).valueOf();
            this.$emit('input', this.currentValue);
            this.$emit('change');
            return val;
        },
        checkRangeHour() {
            let val = 0;
            if (this.hour > 23) {
                val = 23;
            }
            else if (this.hour < 0) {
                val = 0;
            }
            else {
                val = this.hour;
            }
            this.currentValue = (DateTime.fromObject({
                year: 1970,
                month: 1,
                day: 1,
                hour: val,
                minute: this.minute,
            }, {
                zone: this.zoneIana,
            })).valueOf();
            this.$emit('input', this.currentValue);
            this.$emit('change');
            return val;
        },

        incrementHour() {
            const newVal = this.hour + (1 * this.step);
            this.decrementDisabled = false;

            this._updateHour(newVal);
        },
        decrementHour() {
            const newVal = this.hour + (-1 * this.step);
            this.incrementDisabled = false;

            this._updateHour(newVal);
        },
        _updateHour(newVal) {
            if (newVal < 0) {
                newVal = 23;
            }
            if (newVal > 23) {
                newVal = 0;
            }
            this.hour = newVal;
            this.setTime();
        },
        incrementMinute() {
            const newVal = this.minute + 1 * this.step;
            this.decrementDisabled = false;

            this._updateMinute(newVal);
        },
        decrementMinute() {
            const newVal = this.minute + -1 * this.step;
            this.incrementDisabled = false;

            this._updateMinute(newVal);
        },
        _updateMinute(newVal) {
            if (newVal < 0) {
                newVal = 59;
                this.decrementHour();
            }
            if (newVal > 59) {
                newVal = 0;
                this.incrementHour();
            }
            this.minute = newVal;
            this.setTime();
        },

        setTime() {
            this.currentValue = (DateTime.fromObject({
                year: 1970,
                month: 1,
                day: 1,
                hour: this.hour,
                minute: this.minute,
            }, {
                zone: this.zoneIana,
            })).valueOf();
            this.$emit('input', this.currentValue);
            this.$emit('change');
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../../../styles/components/input';
</style>

<style type="text/css" scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>

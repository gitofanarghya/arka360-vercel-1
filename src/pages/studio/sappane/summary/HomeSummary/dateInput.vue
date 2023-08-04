1<template>
    <div>
        <input
            v-if="flagForUS"
            :disabled="disabled"
            :step="step"
            v-model.number="date"
            class="sappane-input-value"
            type="number"
            onfocus="this.select();"
            @blur="date = checkRangeDate()"
            @keydown.esc="date = checkRangeDate()"
            @keydown.enter="date = checkRangeDate()"
            @keydown.up.prevent="incrementDate"
            @keydown.down.prevent="decrementDate"
            @keydown.right.prevent="
                $event.target.previousElementSibling.previousElementSibling.focus()
            "
            @keydown.tab.prevent="
                $event.target.previousElementSibling.previousElementSibling.focus()
            "
        >

        <input
            v-else
            :disabled="disabled"
            :step="step"
            v-model.number="actualMonth"
            class="sappane-input-value"
            type="number"
            onfocus="this.select();"
            @blur="actualMonth = checkRangeMonth()"
            @keydown.esc="actualMonth = checkRangeMonth()"
            @keydown.enter="actualMonth = checkRangeMonth()"
            @keydown.up.prevent="incrementMonth"
            @keydown.down.prevent="decrementMonth"
            @keydown.left.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
            @keydown.tab.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
        >

        <p
            class="sappane-value"
            style="width: 10px;">/</p>

        <input
            v-if="flagForUS"
            :disabled="disabled"
            :step="step"
            v-model.number="actualMonth"
            class="sappane-input-value"
            type="number"
            onfocus="this.select();"
            @blur="actualMonth = checkRangeMonth()"
            @keydown.esc="actualMonth = checkRangeMonth()"
            @keydown.enter="actualMonth = checkRangeMonth()"
            @keydown.up.prevent="incrementMonth"
            @keydown.down.prevent="decrementMonth"
            @keydown.left.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
            @keydown.tab.prevent="
                $event.target.nextElementSibling.nextElementSibling.focus()
            "
        >

        <input
            v-else
            :disabled="disabled"
            :step="step"
            v-model.number="date"
            class="sappane-input-value"
            type="number"
            onfocus="this.select();"
            @blur="date = checkRangeDate()"
            @keydown.esc="date = checkRangeDate()"
            @keydown.enter="date = checkRangeDate()"
            @keydown.up.prevent="incrementDate"
            @keydown.down.prevent="decrementDate"
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
            required: true,
        },
        step: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            currentValue: this.value,
            decrementDisabled: false,
            incrementDisabled: false,
            // inputDisabled: disabled,
            month: 1,
            date: 1,
            daysInMonths: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            actualMonth: this.month + 1,
        };
    },

    computed:{
         flagForUS(){
          const user = JSON.parse(localStorage.getItem("user")) || {};
          return user.isUSFlagEnabled;
        }
    },
    watch: {
        value(val) {
            this.date = new Date(val).getDate();
            this.month = new Date(val).getMonth();
            this.actualMonth = this.month + 1;
        },
    },

    mounted() {
        this.date = new Date(this.value).getDate();
        this.month = new Date(this.value).getMonth();
        this.actualMonth = this.month + 1;
    },

    methods: {
        checkRangeMonth() {
            let val = 0;
            if (this.actualMonth > 12) {
                val = 12;
            }
            else if (this.actualMonth < 1) {
                val = 1;
            }
            else {
                this.month = this.actualMonth - 1;
                val = this.actualMonth;
            }
            this.month = val - 1;

            this.currentValue = Date.UTC(
                new Date().getFullYear(),
                this.month,
                this.date,
            );
            this.$emit('input', this.currentValue);
            this.$emit('change');
            return val;
        },
        checkRangeDate() {
            let val = 0;
            if (this.date > this.daysInMonths[this.month]) {
                val = this.daysInMonths[this.month];
            }
            else if (this.date < 1) {
                val = 1;
            }
            else {
                val = this.date;
            }
            this.currentValue = Date.UTC(
                new Date().getFullYear(),
                this.month,
                val,
            );
            this.$emit('input', this.currentValue);
            this.$emit('change');
            return val;
        },

        incrementDate() {
            // if (this.disabled || this.incrementDisabled) {
            //     return
            // }

            const newVal = this.date + 1 * this.step;
            this.decrementDisabled = false;

            this._updateDate(newVal);
        },
        decrementDate() {
            // if (this.disabled || this.decrementDisabled) {
            //     return
            // }

            const newVal = this.date + -1 * this.step;
            this.incrementDisabled = false;

            this._updateDate(newVal);
        },
        _updateDate(newVal) {
            const oldVal = this.date;
            // if (oldVal === newVal || typeof this.value !== 'number') {
            //     return;
            // }
            if (newVal < 1) {
                this.decrementMonth();
                newVal = this.daysInMonths[this.month];
            }
            if (newVal > this.daysInMonths[this.month]) {
                this.incrementMonth();
                newVal = 1;
            }
            this.date = newVal;
            this.currentValue = Date.UTC(
                new Date().getFullYear(),
                this.month,
                this.date,
            );
            this.$emit('input', this.currentValue);
            this.$emit('change');
        },
        incrementMonth() {
            const newVal = this.month + 1 * this.step;
            this.decrementDisabled = false;

            this._updateMonth(newVal);
        },
        decrementMonth() {

            const newVal = this.month + -1 * this.step;
            this.incrementDisabled = false;

            this._updateMonth(newVal);
        },
        _updateMonth(newVal) {
            const oldVal = this.month;

            // if (oldVal === newVal || typeof this.value !== 'number') {
            //     return;
            // }
            if (newVal < 0) {
                newVal = 11;
            }
            if (newVal > 11) {
                newVal = 0;
            }
            this.month = newVal;
            this.actualMonth = this.month + 1;
            this.currentValue = Date.UTC(
                new Date().getFullYear(),
                this.month,
                this.date,
            );
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

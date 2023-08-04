<template>
    <div
        id="repeat">
        <div style="display: flex">
            <div class="repeatText">Repeat Count</div>
            <el-input
                v-validate="repeatValidation"
                id="repeatInput"
                v-model="num"
                :controls="false"
                class="repeat"
                size="mini"
                name="repeat"
                type="number"
                @input="repeatCountInput"/>
        </div>
    </div>
</template>
<script>
import { R_KEY_PRESSED } from '../../../componentManager/componentManagerConstants';

export default {
    props: {
        handleRepeatCountChange: {
            type: Function,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            num: 1,
            repeatValidation: {
                required: true,
                min_value: 1,
                max_value: 20,
                integer: true,
            },
        };
    },
    mounted() {
        this.$eventBus.$on(R_KEY_PRESSED, () => {
            this.focusInput();
        });
    },
    beforeDestroy() {
        this.$eventBus.$off(R_KEY_PRESSED);
    },
    methods: {
        async repeatCountInput() {
            const isValid = await this.$validator.validateAll();
            if (isValid) {
                document.getElementById('repeatInput').style.color = '#fafafa';
                this.handleRepeatCountChange(this.num);
            }
            else {
                document.getElementById('repeatInput').style.color = 'red';
            }
        },
        focusInput() {
            document.getElementById('repeatInput').focus();
            repeatInput.select();
        },
    },
};
</script>
<style type="text/css" scoped>
.repeat{
    color: white;
    font-size: 0.9vw;
    margin: 0 10px;
}

#repeat >>> .el-input--mini, #repeat >>> .el-input__inner {
    height: 15px;
    line-height: 15px;
    color: #fafafa;
    background-color: #050505;
    border: none;
    padding: 0 2px;
    width: 3vw;
}

.repeatText {
    font-size: 0.9vw;
    color: white;
    white-space: nowrap;
    line-height: 15px;
    vertical-align: middle;
}

#repeat >>> .el-input__inner::-webkit-inner-spin-button,
#repeat >>> .el-input__inner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>

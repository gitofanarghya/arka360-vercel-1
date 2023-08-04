/**
 * @Author: Vivek Yadav
 * @Date: 2020-10-18T05:11:28+05:30
 * @Email: vivek@thesolarlabs.com
 * @Last modified by: Vivek Yadav
 * @Last modified time: 2020-10-18T05:11:28+05:30
 */
 
<template>
    <div>
        <div class="custom-color"> 
            <div>Color #1</div>
            <span title="Copy color code for future">{{colorCode1}}</span>
            <span class="color-area" :style="{ backgroundColor: colorCode1 }" ></span>
        </div>
        <div class="custom-color"> 
            <div>Color #2</div>
            <span>{{colorCode2}}</span>
            <span class="color-area" :style="{ backgroundColor: colorCode2 }" ></span>
        </div>
        <div class="custom-color"> 
            <div>Color #3</div>
            <span>{{colorCode3}}</span>
            <span class="color-area" :style="{ backgroundColor: colorCode3 }" ></span>
        </div>
    </div>
</template>

<script>
export default {
    
    name: 'reportCustomColorDefaults',
    props: ['colorScheme'],
    data() {
        return  { 
            msg: ' I am in settingsGeneralDefaults',
        }
    },
    computed: {
        colorCode1: {
            get: function() {
                return this.colorScheme.report_defaults.custom_color ? this.colorScheme.report_defaults.custom_color.primary_color : "#005482";
            },
        },
        colorCode2: {
            get: function() {
                return this.colorScheme.report_defaults.custom_color ? this.colorScheme.report_defaults.custom_color.secondary_color : "#0086ae";
            }
        },
        colorCode3: {
            get: function() {
                return this.colorScheme.report_defaults.custom_color ? this.colorScheme.report_defaults.custom_color.tertiary_color : "#00c2c7";
            }
        }
    },
}
</script>

<style type="text/css" scoped>
    .custom-color {
        display: flex;
        direction: row;
        justify-content: space-between;
        padding-bottom: 10px;
    }
    .color-area {
        width: 40px;
        height: 20px;
    }
</style>
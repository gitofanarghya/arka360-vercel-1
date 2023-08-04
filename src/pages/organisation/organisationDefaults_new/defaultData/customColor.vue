<template>
    <div>
        <div class="custom-color"> 
            <div>Primary Color</div>
            <span title="Copy color code for future">{{colorCode1}}</span>
            <span class="color-area" :style="{ backgroundColor: colorCode1 }" ></span>
        </div>
        <div class="custom-color"> 
            <div>Secondary Color</div>
            <span style="margin-right:21px;">{{colorCode2}}</span>
            <span class="color-area" :style="{ backgroundColor: colorCode2 }"   ></span>
        </div>
        <div class="custom-color"> 
            <div>Tertiary Color</div>
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
.customColor {
  padding-left: 1.5rem;
  padding-right: 3rem;
  padding-top: 0.5rem;
}
    .custom-color {
        display: flex;
        direction: row;
        font-size: 16px;
        justify-content: space-between;
        padding-bottom: 10px;
    }
    .color-area {
        width: 40px;
        height: 20px;
    }
    .item_label{
  font-size:16px;
}
.design_section .col_area .item_ditails .item_label {
    font-size: 16px;
    color: var(--step-250);
}
</style>
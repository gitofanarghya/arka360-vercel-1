<!-- UNUSED FILE -->
<template>
    <div id="inventory">
        <el-header class="navBar-container">
            <navBar :current-page="currentPage"/>
        </el-header>
        <div class="inventoryWrapper">
            <div style="padding-bottom: 20px; display: flex; align-items: center">
                <i
                    class="el-icon-arrow-left backButton"
                    @click="goBack"/>
                <h1 style="display: inline-block;"> Inventory </h1>
            </div>
            <div style="margin-left: 18px;">
                <el-tabs>
                    <el-tab-pane label="Modules"> <panelInventory/> </el-tab-pane>
                    <el-tab-pane label="Inverters"> <inverterInventory/> </el-tab-pane>
                    <el-tab-pane label="BOQ"> <BOQ/> </el-tab-pane>
                    <el-tab-pane
                        disabled
                        label="Wires"> <wireInventory/> </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script>

import inverterInventory from './components/inverterInventory.vue';
import panelInventory from './components/panelInventory.vue';
import wireInventory from './components/wireInventory.vue';
import BOQ from './components/BOQ.vue';
import navBar from '@/components/ui/navBar/navBar.vue';


export default {


    name: 'Inventory',
    components: {

        inverterInventory,
        panelInventory,
        wireInventory,
        BOQ,
        navBar,
    },
    data() {
        return {
            msg: ' I am in inventory',
            currentPage: 'organisationSettings',
            isInverterVisible: false,
            isPanelVisible: true,
            isWireVisible: false,
        };
    },
    methods: {
        goBack() {
            window.history.length > 1
                ? this.$router.go(-1)
                : this.$router.push('/');
        },
    },
};
</script>


<style type="text/css" scoped>

.backButton {
font-size : 25px;
color: #303133;
cursor: pointer;
}

.inventoryWrapper .backButton:hover {
font-weight: bold;
}


#inventory >>> .el-tabs__active-bar {
background-color: #409eff;
}

#inventory >>> .el-tabs__item.is-active {
color: black;
}

#inventory >>> .el-tabs__item.is-disabled {
cursor: not-allowed;
}

#inventory >>> .el-tabs__item {
color: #808080;
}

.inventoryWrapper {
width: 100%;
box-sizing: border-box;
padding-top: 80px;
padding-left: 15%;
padding-right: 20%;
text-align: left;
}

</style>

<style scoped>
/* this is for arrow above dropdown of panels/inverters */
.lightDropdown .popper__arrow, .popper__arrow::after, .popper__arrow::before {
border-color: transparent !important;
border-bottom-color: white ;
}

.lightDropdown .el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
color: #409eff;
background-color: rgba(64, 158,255, 0.06) !important;;
}
</style>

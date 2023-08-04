<template>
    <div id="acCableDefaults">
        <div>
            <p class="headings"> Material Type </p>
            <p class="data"> {{ profileData.drawing_defaults.acCable.materialType }} </p>
        </div>
        <div>
            <p class="headings"> No. of Cores </p>
            <p class="data"> {{ profileData.drawing_defaults.acCable.cores }} </p>
        </div>
        <div :class="[profileData.wiring_unit === 'mmsq' ? '' : 'hidden']">
            <p class="headings"> Size of Cable(in sq.mm) </p>
            <p class="data"> {{ profileData.drawing_defaults.acCable.cableSizeMM }} </p>
        </div>
        <div :class="[profileData.wiring_unit === 'awg' ? '' : 'hidden']">
            <p class="headings"> Size of Cable(in AWG) </p>
            <p class="data"> {{ profileData.drawing_defaults.acCable.cableSizeAWG }} </p>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AcCableDefaults',
    props: {
        profileData: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            msg: ' I am in acCableDefaults',
        };
    },
    mounted() {
    }
};
</script>
<style type="text/css" scoped>
.hidden {
    display: none !important;
}
</style>
<style type="text/css" scoped>
#defaultsData .headings {
color: #121212;
font-size: 14px;
line-height: 16px;
}
#defaultsData .data {
color: #707070;
font-size: 14px;
padding-bottom: 20px;
}
#defaultsData .el-switch.is-checked .el-switch__core {
background-color: #409eff !important;
border-color: #409eff !important;
}
#defaultsData .dataSwitches {
display: flex;
justify-content: space-between;
padding-bottom: 20px;
}
</style>
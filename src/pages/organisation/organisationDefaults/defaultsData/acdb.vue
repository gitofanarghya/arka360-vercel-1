<template>
    <div id="acdbDefaults">
        <div>
            <div>
                <p class="headings"> Azimuth </p>
                <p class="data"> {{ profileData.drawing_defaults.acdb.azimuth }} </p>
            </div>
            <div>
                <p class="headings"> Mount Height </p>
                <p class="data">
                    <display-length
                        :metric-value="profileData.drawing_defaults.acdb.mountHeight"/>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ACDBDefaults',
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
            msg: ' I am in acdbDefaults',
        };
    },
};
</script>

<style type="text/css">
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

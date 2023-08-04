<template>
    <div id="progressBarUsedQuota">
        <div class="center-space-between-alignment">
            <div style="font-size: 12px"> {{ quotaType }}
                <span v-show="maxAllowedSize > 0">
                    (&#60; {{ maxAllowedSize }} kW)
                </span>
            </div>
            <div style="font-size: 11px">
                <span style="font-weight: bold">
                    {{ projectsUsed }}
                </span>
                of {{ projectsQuota }} projects used
            </div>
        </div>
        <el-progress
            :format="formatProgressBar"
            :percentage="percentageUsedProjects"
            style="margin: 15px 0 0 0"/>
    </div>
</template>

<script>

export default {
    name: 'ProgressBarUsedQuota',
    props: {
        projectsUsed: {
            type: Number,
            default: 0,
        },
        projectsQuota: {
            type: Number,
            default: 0,
        },
        quotaType: {
            type: String,
            default: '',
        },
        maxAllowedSize: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        percentageUsedProjects() {
            return (Number((this.projectsUsed / this.projectsQuota) * 100)) || 0;
        },
    },
    methods: {
        formatProgressBar() {
            return '';
        },
    },
};
</script>

<style scoped>
#progressBarUsedQuota {
    padding: 20px 20px 25px 20px;
}
</style>

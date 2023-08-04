<template>
    <div>
        <el-row
            v-if="generationStatsVisible"
            :gutter="12">
            <el-col :span="12">
                <stat-box
                    :stat-name="'Annual Production'"
                    :stat-value="annualProduction"/>
            </el-col>
            <el-col :span="12">
                <stat-box
                    :stat-name="'System Size'"
                    :stat-value="systemSize"/>
            </el-col>
        </el-row>
        <el-row
            v-if="financialStatsVisible"
            :gutter="12">
            <el-col :span="12">
                <stat-box
                    :stat-name="'Net Present Value'"
                    :stat-value="npv"/>
            </el-col>
            <el-col :span="12">
                <stat-box
                    :stat-name="'Payback Period'"
                    :stat-value="paybackPeriod"/>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import StatBox from './StatBox.vue';

export default {
    name: 'DesignStats',
    components: {
        StatBox,
    },
    props: {
        generationStatsVisible: {
            type: Boolean,
            default: false,
        },
        financialStatsVisible: {
            type: Boolean,
            default: false,
        },
        annualProduction: {
            type: String,
            default: '',
        },
        systemSize: {
            type: String,
            default: '',
        },
        npv: {
            type: String,
            default: '',
        },
        paybackPeriod: {
            type: String,
            default: '',
        },
    },
};
</script>

<template>
    <div id="designRequestForm">
        <el-dialog
            :visible="isDesignRequestFormDialogVisible"
            :close-on-click-modal="false"
            title="Request Detailed Design"
            width="40%"
            @close="closeDesignRequestFormDialog">
            <iframe
                :src="requestFormFrameSrc"
                frameborder="0"
                style="height:500px; width:100%; border:none; padding: 0;"/>
        </el-dialog>
    </div>
</template>
<script>
export default {
    name: 'DesignRequestForm',
    props: {
        isDesignRequestFormDialogVisible: {
            type: Boolean,
            default: false,
        },
        requestFormFrameSrc: {
            type: String,
            default: '',
        },
    },
    methods: {
        closeDesignRequestFormDialog() {
            this.$emit('update:isDesignRequestFormDialogVisible', false);
        },
    },
};
</script>


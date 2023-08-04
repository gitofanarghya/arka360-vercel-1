const pricingMixin = {
    methods: {
        showSuccessMessagePlanRequestUpgrade(msg) {
            this.$message({
                showClose: true,
                message: msg,
                type: 'success',
                center: true
            });
        },
        showErrorMessageAPIRequest() {
            this.$message({
                showClose: true,
                message: 'Error in processing request. Please try again.',
                type: 'error',
                center: true
            });
        },
    },
};

export default pricingMixin;

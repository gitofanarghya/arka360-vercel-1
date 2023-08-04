<template>
    <div class='deleteModule'>
        <el-dialog 
            :visible="isChecksPopUpForDetailedBOMVisible"
            :close-on-click-modal="false"
            title="Add User"
            width="30%"
            class="delete_module"
            @close="closeModal"
        >
            <div class='close_button'>
                <img src='../../assets/img/close.svg' alt='close' @click="$emit('cancelDelete')">
            </div>
            <div class='alert'>
                <img src='../../assets/img/alert.svg' alt='alert'>
            </div>
            <p class='msg' v-if="isDCSizeInRange">{{('Please Add inverter to see detailed BOM')}}</p>
            <p class='msg' v-else>{{('Generation is not between 10KW and 1MW.')}}</p>
            <div class='button_container'>
                <button class='btn primary' @click="$emit('cancelDelete')">{{('OK')}}</button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        isChecksPopUpForDetailedBOMVisible: {
            type: Boolean,
            default: false,
        },
        isDCSizeInRange:{
            type: Boolean,
            default: true,
        }
    },
    methods: {
        closeModal() {
            this.$emit('cancelDelete');
        }
    },
}
</script>

<style scoped>
.deleteModule .delete_module >>> .el-dialog{
    border-radius: 8px;
     margin-top: 14vh !important;
}
.deleteModule .delete_module >>> .el-dialog__header{
    display: none;
}
.deleteModule .delete_module .alert{
    padding: 15px 0 0 10px;
}
.deleteModule .delete_module .alert,
.deleteModule .delete_module .msg,
.deleteModule .delete_module .button_container {
    display: flex;
    justify-content: center;
}
.deleteModule .delete_module .close_button{
    display: flex;
    justify-content: flex-end;
    padding: 10px 5px 0 0;
    cursor: pointer;
}
.deleteModule .delete_module .button_container button{
    width: 136px;
    height: 48px;
    margin: 25px;
    padding: 14px 53px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.08);
    background-color: #f46545;
    border: none;
    outline: none;
    cursor: pointer;
    color: #fff;
    font-weight: bolder;
}
</style>
<template>
    <div id="designNameEditDialog">
        <el-dialog
            title="Edit Design Name"
            @open="assignDesignName"
            :visible="isEditDesignNameDialogVisible"
            :close-on-click-modal="false"
            @close="onCancelEditDesignNameDialog"
            width="30%">
            <el-form 
                label-position="left"
                label-width="100px"
                @submit.native.prevent
                size="small">
                <el-form-item label="Design Name">
                    <el-input 
                        v-model="designNameLocal"
                        v-validate="designNameValidation"
                        name="Design Name">
                    </el-input>
                    <p class="formErrors">{{ errors.first('Design Name') }}</p>
                </el-form-item>
                <el-form-item>
                    <!-- <button 
                        class="button-cancel" 
                        :disabled="isDesignNameChanging"
                        @click="onCancelEditDesignNameDialog">
                        Cancel
                    </button> -->
                    <button
                        native-type="submit"
                        type="primary"
                        class="button-confirm"
                        @click="onConfirmEditDesignName"
                        :disabled="errors.items.length > 0 || isDesignNameChanging">
                        <i
                            v-show="isDesignNameChanging"
                            class="el-icon-loading"/>
                        <span
                            v-show="!isDesignNameChanging">
                            Confirm
                        </span>
                    </button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

import { mapActions } from 'pinia';
import { useDesignStore } from '../../../../stores/design';


export default {
    name: 'DesignNameEditDialog',
    props: {
        isEditDesignNameDialogVisible: {
            type: Boolean,
            default: false,
        },
        designName: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            designNameLocal: '',
            isDesignNameChanging: false,
            designNameValidation: {
                required: true,
            },
        };
    },
    computed: {
    },
    methods: {
        ...mapActions(useDesignStore, [
            'UPDATE_DESIGN_NAME',
        ]),
        onCancelEditDesignNameDialog() {
            this.$emit('update:isEditDesignNameDialogVisible', false);
        },
        async onConfirmEditDesignName() {
            const designName = { name: this.designNameLocal };
            this.isDesignNameChanging = true;
            try {
                await this.UPDATE_DESIGN_NAME(designName);
                this.$message({
                    showClose: true,
                    message: 'Design name is changed successfully.',
                    type: 'success',
                    center: true
                });
            }
            catch (error) {
                let errorMessage = error.response.status === 403 ?
                            "You don't have permission to edit this project." :
                            "Error editing design name. Try again.";
                this.$message({
                    showClose: true,
                    message: errorMessage,
                    type: 'error',
                    center: true
                });
            }   
            this.isDesignNameChanging = false;
            this.onCancelEditDesignNameDialog();  
        },
        assignDesignName() {
            this.designNameLocal = this.designName;
        },
    },
};
</script>

<style type="text/css" scoped>

#designNameEditDialog >>> .el-dialog {
        border-radius: 8px;
        width: 500px !important;
    }
#designNameEditDialog >>> .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
        height: 48px;
        margin-bottom: 0px;
    }

    #designNameEditDialog >>> .el-dialog__title{

     font-weight: 600;
     margin-left: 0px;
      color: #222222 !important;
    }
    #designNameEditDialog >>> .el-dialog__close {
        color: #222222 !important;
        font-size: 24px;
        font-weight: 600;
    }

    #designNameEditDialog >>> .el-dialog__body{
        padding: 16px 24px 8px 24px !important;
    }

    #designNameEditDialog >>> .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       padding: 8px 20px !important;
       /* height: 40px  !important; */
       color: #fff;
       border-radius: 4px;
       font-weight: 600;
       letter-spacing: 1px;
    }

     #designNameEditDialog >>> .el-form-item {

        text-align: center !important;
    } 
     
      #designNameEditDialog >>> .el-form-item__content {

        margin-left: 0px !important;
    } 

    #designNameEditDialog >>> .el-form-item__label{
        color: #222;
    }

    #designNameEditDialog >>> .el-input__inner{
        height: 48px;
        background-color: #e8edf2;
        outline: 0;
        border: none;
        font-size: 16px;
        color: #222;
        border-radius: 4px;
    }

    @media screen and (max-width: 530px) {
        #designNameEditDialog >>> .el-dialog {
        border-radius: 8px;
        width: 90% !important;
    }
    }



</style>

<style lang="scss" scoped>

    // @import '../../../../styles/components/button';
    // @import '../../../../styles/components/forms';

</style>

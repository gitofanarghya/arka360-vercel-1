<template>
    <div>
        <!-- <component
            :are-favorites-required="false"
            :inverter.sync="selectedInverters"
            :is="dropdownType"
            is-admin-panel/> -->
        <el-row>
            <el-col :span="5">
                <h3> Select {{ type }} to add </h3>
            </el-col>
            <el-col :span="4">
                <button
                    :disabled="isAddDisabled"
                    class="button-confirm"
                    @click="onAdd">
                    Add {{ type }}
                </button>
            </el-col>
        </el-row>
        <slot/>
        <div>
            <button
                :disabled="isDeleteDisabled"
                class="button-confirm"
                style="margin: 0 0 0 70vw"
                @click="onDelete">
                Delete {{ type }}
            </button>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        dropdownType: {
            type: String,
            default: null,
        },
        type: {
            type: String,
            default: null,
        },
        onAdd: {
            type: Function,
            default: null,
        },
        onDelete: {
            type: Function,
            default: null,
        },
        isAddDisabled: {
            type: Boolean,
            default: false,
        },
        isDeleteDisabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
        };
    },
    methods: {

    },
};
</script>


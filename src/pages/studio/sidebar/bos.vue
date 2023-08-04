<template>
    <div id="bos">
        <el-popover
            v-model="popperVisible"
            placement="right">
            <div @click="popperVisible = !popperVisible">

                <button class="button-sidebar-dropdown">
                    BOS 1
                </button>

                <button class="button-sidebar-dropdown">
                    BOS 2
                </button>
            </div>
            <button
                slot="reference"
                :disabled="!isBosEnabled"
                class="iconLeftSideBar-ac button-sidebar-icons"/>
        </el-popover>
    </div>
</template>

<script>

export default {
    name: 'Bos',
    props: ['isBosEnabled'],
    data() {
    	return {
    		msg: 'I am in bos',
            popperVisible: false,
    	};
    },
};
</script>
<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>
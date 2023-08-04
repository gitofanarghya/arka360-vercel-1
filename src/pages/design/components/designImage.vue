<template>
    <div id="designSummaryImage">
        <div
            class="designImageWrapperClass">
            <img
                :src="designImageUrl"
                style="float: right; max-width: 19vw; max-height: 19vw">
        </div>
    </div>

</template>

<script>

import { mapState } from 'pinia';
import { useDesignStore } from '../../../stores/design';


export default {
    name: 'DesignImage',
    data() {
        return {
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            designImageUrl: 'GET_DESIGN_IMAGE',
        }),
    },
    mounted() {
    },
    methods: {
    },
};
</script>

<style type="text/css" scoped>

.designImageWrapperClass:before {
	content: "";
	display: block;
}

#designSummaryImage {
	width : 100%;
	margin-top: calc(10px + 1.5vw); 
}

</style>

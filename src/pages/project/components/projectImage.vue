<template>
    <div id="projectInformationImage">
        <a
            :href="projectImageHref"
            target="_blank">
            <img
                :src="projectImageURL"
                style="float: right; max-width: 19vw; max-height: 19vw">
        </a>
    </div>
</template>

<script>

import { mapState } from 'pinia';
import { useProjectStore } from '../../../stores/project';
export default {
    name: 'ProjectInformationImage',
    data() {
        return {
        }
    },
    mounted() {
    },
    methods: {
    },
    computed: {
        ...mapState(useProjectStore, {
            projectImageURL: 'GET_PROJECT_IMAGE_URL',
            projectImageHref: 'GET_PROJECT_IMAGE_HREF',
        }),
    },
};

</script>

<style type="text/css" scoped>
#projectInformationImage {
    margin-top: calc(10px + 1.5vw)
}
</style>

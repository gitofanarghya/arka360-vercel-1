<template>
    <div
        class="stage-compass-container"
        @click="resetCam"
        @touchend="resetCam"
    >
        <img
            :style="'transform: rotate(' + cameraAzimuth + 'deg)'"
            src="https://front-end-assests.s3-us-west-2.amazonaws.com/compass.png"
            class="stage-compass"
        >
    </div>
</template>
<script>
import { INIT_COMPASS } from '../../../componentManager/componentManagerConstants';
import { mapState } from 'pinia';
import { useStudioStageStore } from '../../../stores/studio-stage';


export default {
    name: 'Compass',
    nonReactiveData() {
        return {
            resetCamera: () => {},
        };
    },
    methods: {
        resetCam(){
            this.resetCamera();
        }
    },
    computed: {
        ...mapState(useStudioStageStore, {
            cameraAzimuth: state => state.cameraAzimuth,
        }),
    },
    mounted() {
        this.$eventBus.$once(INIT_COMPASS, (resetCamera) => {
            this.resetCamera = resetCamera;
        });
    },
};
</script>
<style scoped type="text/css">
    .stage-compass-container {
        position: absolute;
        width: 50px;
        height: 50px;
        right: 0;
        padding: 5px;
        margin: 5px;
        z-index: 1;
    }
    .stage-compass {
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
</style>

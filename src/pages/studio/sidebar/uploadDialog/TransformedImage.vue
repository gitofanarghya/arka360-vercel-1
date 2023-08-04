<template>
    <div
        v-loading="!imageLoaded"
        ref="container"
        class="container"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        element-loading-text="Loading"
        element-loading-spinner="el-icon-loading"
    >
        <img
            v-show="imageLoaded"
            ref="image"
            :src="updatedImageSource"
            :style="{ 'transform': transformStyle }"
            class="overlayImage"
        >
    </div>
</template>

<script>
import { INVALID_SCALE } from '../../../../core/coreConstants';

export default {
    props: {
        scale: {
            type: Number,
            default: INVALID_SCALE,
        },
        rotation: {
            type: Number,
            default: 0,
        },
        offset: {
            type: Array,
            default() {
                return [0, 0];
            },
        },
        imageSrc: {
            type: String,
            default: '',
        },
        onImageLoad: {
            type: Function,
            default: () => {},
        },
        groundSize: {
            type: Number,
            default: 0,
        },
        defaultGroundSize: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            isMounted: false,
            containerWidth: -1,
            containerHeight: -1,
            imageLoaded: false,
            updatedImageSource: '',
        };
    },
    computed: {
        transformStyle() {
            if (!this.isMounted || this.containerWidth === -1 || this.containerHeight === -1) {
                return '';
            }

            const scaleRatio = (this.scale === INVALID_SCALE) ?
                (this.defaultGroundSize / this.groundSize) :
                (this.scale / this.groundSize);
            const offset = [
                (this.offset[0] / this.groundSize) * this.containerWidth,
                -1 * (this.offset[1] / this.groundSize) * this.containerHeight,
            ];

            offset[1] = Number.isNaN(offset[1]) ? '0' : offset[1];
            offset[0] = Number.isNaN(offset[0]) ? '0' : offset[0];

            return `translate(${offset[0]}px, calc(${offset[1]}px - 50%)) scale(${scaleRatio}) rotate(${this.rotation}deg)`;
        },
    },
    watch: {
        imageSrc: function imageSrcChanged() {
            this.imageLoaded = false;
            this.$refs.image.addEventListener('load', () => {
                this.imageLoadingComplete();
            });

            this.updatedImageSource = this.imageSrc;
        },
    },
    mounted() {
        this.isMounted = true;
        this.$refs.image.addEventListener('load', () => {
            this.imageLoadingComplete();
        });

        this.updatedImageSource = this.imageSrc;
    },
    methods: {
        updateImageSize() {
            const computedStyle = window.getComputedStyle(this.$refs.container);
            this.containerWidth = parseFloat(computedStyle.width.split('px', 1)[0]);
            this.containerHeight = parseFloat(computedStyle.height.split('px', 1)[0]);
        },
        imageLoadingComplete() {
            this.updateImageSize();
            this.onImageLoad();
            this.imageLoaded = true;
        },
    },
};
</script>

<style scoped>
.overlayImage {
    position: relative;
    height: auto;
    width: 100%;
    top: 50%;
}

.container {
    background-image: url('https://design-studio-app.s3.ap-south-1.amazonaws.com/grid.png');
    border: 1px solid black;
    width: 100%;
    overflow: hidden;
    border-radius: 5px;
    cursor: pointer;
    max-height: 54vh;
}

.grid {
    border-radius: 5px;
    position: relative;
    height: 100%;
    width: 100%;
}
</style>

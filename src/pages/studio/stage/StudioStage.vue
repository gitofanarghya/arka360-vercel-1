<template>
    <div id="studio-stage">
        <color-bar/>
        <selection-context-menu/>
        <compass/>
        <design-canvas
            :latitude="latitude"
            :longitude="longitude"
            :zoom="zoom"
            :design-settings="designSettings"
            :map-image="mapImage"
            :stage-data="stageData"
            :edit-mode="true"/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import designCanvas from './DesignCanvas.vue';
import colorBar from './ColorBar.vue';
import selectionContextMenu from './SelectionContextMenu.vue';
import Compass from './Compass.vue';
import { GOOGLE_API_KEY, GOOGLE_SIGNING_SECRET } from "../../../constants";
import { INVALID_SCALE } from '../../../core/coreConstants';
import { useDesignStore } from '../../../stores/design';
import { signRequest } from '../../../core/utils/utils';

export default {
    name: 'StudioStage',
    components: {
        designCanvas,
        colorBar,
        selectionContextMenu,
        Compass,
    },
    computed: {
        ...mapState(useDesignStore, {
            designVersion: 'GET_DESIGN_VERSION_STAGE_DATA',
        }),
        latitude() {
            return parseFloat(this.designVersion.latitude);
        },
        longitude() {
            return parseFloat(this.designVersion.longitude);
        },
        zoom() {
            return parseInt(this.designVersion.zoom, 10);
        },
        designSettings() {
            return JSON.parse(JSON.stringify(this.designVersion.designSettings));
        },
        mapImage() {
            const studioMapImage = (this.designVersion.studioMapImage === null ||
                this.designVersion.studioMapImage === undefined) ? {} :
                this.designVersion.studioMapImage;

            let studioMapImageUrl;
            if (studioMapImage.url !== undefined && studioMapImage.url !== null) {
                studioMapImageUrl = studioMapImage.url;
            }
            else if (this.designVersion.scene !== null && this.designVersion.scene !== undefined
                && this.designVersion.scene.imageURL !== null &&
                this.designVersion.scene.imageURL !== undefined) {
                studioMapImageUrl = this.designVersion.scene.imageURL;
            }
            else {
                studioMapImageUrl = signRequest(`https://maps.googleapis.com/maps/api/staticmap?center=${this.latitude.toString()},
                    ${this.longitude.toString()}&scale=2&zoom=${this.zoom.toString()}&maptype=satellite&size=512x512&key=${GOOGLE_API_KEY}`, GOOGLE_SIGNING_SECRET);
            }

            return {
                rotation: (studioMapImage.rotation === undefined ||
                    studioMapImage.rotation === null) ? 0 : studioMapImage.rotation,
                scale: (studioMapImage.scale === undefined || studioMapImage.scale === null) ?
                    INVALID_SCALE : studioMapImage.scale,
                offset: (studioMapImage.offset === undefined || studioMapImage.offset === null) ?
                    [0, 0] : studioMapImage.offset,
                url: studioMapImageUrl,
                source: (studioMapImage.source === undefined ||
                    studioMapImage.source === null) ? "google" : studioMapImage.source,
                zoom: (studioMapImage.zoom === undefined ||
                    studioMapImage.zoom === null) ? 20 : studioMapImage.zoom,
            };
        },
        stageData() {
            return JSON.parse(JSON.stringify(this.designVersion.scene));
        },
    },
};
</script>

<style lang="scss">
    @import '../../../styles/components/htmlText';
</style>

<style type="text/css">
#studio-stage {
        height: 100%;
        overflow: hidden;
        width: 100%;
    }
</style>

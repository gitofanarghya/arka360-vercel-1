<template>
    <div id="designThumbnail">
        <div
            v-show="designDetails.length < 1"
            style="color: #606266; text-align: center"> No Designs Yet
        </div>
        <el-row v-if="areThumbnailsVisible">
            <el-col
                v-for="(design, index) in designDetails"
                :key="index"
                :span="8"
                style="margin: 0 0 5% 0">
                <el-card
                    :body-style="{ padding: '0px', width: '100%' }"
                    class="thumbnailImageWrapper">
                    <div
                        v-loading="designThumbnailsData[index].isLoading"
                        :style="{height: thumbnailHeight}"
                        class="loadingIconAdjuster"
                        style="width: 100%; cursor: pointer;"
                        @click.stop="onDesignClickHandler(design.id)">
                        <img
                            :src="designThumbnailsData[index].url"
                            style="width: 100%; height: 100%; min-height: 100%"
                        >
                    </div>
                    <div style="padding: 1vw 0.5vw;">
                        <div
                            class="designNameEditWrapper">
                            <div class="designNameStyling"> {{ design.name }}</div>
                            <button
                                v-show="!designThumbnailsData[index].isDesignBeingLoaded"
                                class="button-light-theme-icons"
                                style="color: #409eff; font-size: 0.8vw"
                                @click.stop="leadToStudio(design.id, index)">
                                Edit
                            </button>
                            <i
                                v-show="designThumbnailsData[index].isDesignBeingLoaded"
                                class="el-icon-loading"
                                style="color: #409eff;"/>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>

import API from '@/services/api/';
import { mapState, mapActions } from 'pinia'
import { useProjectStore } from '../../../../stores/project';
import { useDesignStore } from '../../../../stores/design';

export default {
    name: 'DesignThumbnail',
    data() {
        return {
            thumbnailHeight: '',
            areThumbnailsVisible: false,
            designThumbnailsData: [],
            thumbnail: {
                id: null,
                url: null,
                isLoading: null,
                isDesignBeingLoaded: false,
            },
        };
    },
    computed: {
        ...mapState(useProjectStore, {
            designDetails: 'GET_DESIGNS_DETAILS',
            staticImageUrl: 'GET_PROJECT_IMAGE_URL',
        }),
    },
    methods: {
        ...mapActions(useDesignStore, {
            STORE_DESIGN_VERSION: 'STORE_DESIGN_VERSION',
        }),
        async leadToStudio(designId, index) {
            try {
                // for object reactivity
                this.$set(this.designThumbnailsData[index], 'isDesignBeingLoaded', true);
                const response = await API.DESIGNS.FETCH_DESIGN(designId);

                if (response.data.versions !== null) {
                    await this.STORE_DESIGN_VERSION(response);
                    this.$router.push({ name: 'studio', params: { designId } });
                }
                else {
                    // create new design version and push to studio
                    const postData = {
                        scene: null,
                        notes: null,
                        design: designId,
                    };
                    await API.DESIGN_VERSIONS.POST_DESIGN_VERSION(postData);
                    // send it to the studio app
                    this.$router.push({ name: 'studio', params: { designId } });
                }
            }
            catch (e) {
                // for object reactivity
                this.$set(this.designThumbnailsData[index], 'isDesignBeingLoaded' , false);
                console.error('ERROR: FetchDesign', e);
            }
        },

        onDesignClickHandler(designId) {
            this.$router.push({ name: 'designSummary', params: { designId } });
        },

        thumbnailHeightSetter() {
            // returning an array and using the width of the first element
            const thumbnailWrapperWidth = document.getElementsByClassName('thumbnailImageWrapper')[0].clientWidth;
            const viewportWidth = window.innerWidth;
            this.thumbnailHeight = `${(thumbnailWrapperWidth / viewportWidth) * 100}vw`;
        },

        getDesignThumbnails() {
            for (let i = 0; i < this.designDetails.length; i += 1) {
                this.thumbnail.url = this.staticImageUrl;
                this.thumbnail.id = this.designDetails[i].id;
                this.thumbnail.isLoading = true;

                API.DESIGNS.FETCH_DESIGN_LAYOUT(this.designDetails[i].id)
                    .then(response => {
                        if (response.data !== "") this.designThumbnailsData[i].url = response.data;
                    })
                    .catch(() => {
                        console.error();
                    })
                    .then(() => {
                        this.designThumbnailsData[i].isLoading = false;
                    });
                this.designThumbnailsData.push({...this.thumbnail});
            }
            this.areThumbnailsVisible = true;
            // Required to ensure that thumbnailHeightSetter is able to execute properly
            this.$nextTick(() => this.thumbnailHeightSetter());
        },
    },
    watch: {
        designDetails: function () {
            // to ensure that call is not sent again when forms are edited and not sent in case of no designs
            if (!this.areThumbnailsVisible && this.designDetails.length > 0) {
            this.getDesignThumbnails();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .el-card {
        width: 90%;
    }
    .designNameEditWrapper {
        display: flex;
        justify-content: space-between;
        font-size: 1.2vw;
        align-items: center;
        height: 3vw;

        .designNameStyling {
            color: #606266;
            width: 80%;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            line-height: 1.4vw;
        }
    }
</style>

<style lang="scss" scoped>

    @import '../../../../styles/components/button';

</style>

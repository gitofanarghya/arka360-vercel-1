<template>
    <el-footer
        v-if="visible"
        id="suggestionBarContainer"
        class="suggestionBar">
        <div
            id="suggestionBar"
            style="height: 100%; width: 100%;"
            class="center-alignment"
        >
            <el-container>
                <el-aside
                    width="5%"
                    class="center-alignment">
                    <i
                        id="suggestionBarPrevButton"
                        class="el-icon-d-arrow-left"
                        @click="prevSlide"
                    />
                </el-aside>
                <div
                    style="width: 90%;"
                    class="center-alignment">
                    <carousel
                        ref="carousel"
                        :per-page="3"
                        :scroll-per-page="false"
                        :mouse-drag="true"
                        :center-mode="true"
                        :pagination-enabled="false"
                        :per-page-custom="[[480, 2], [720, 3], [1080, 4]]"
                    >
                        <slide
                            v-for="(suggestion, index) in autoPanelsSuggestions"
                            :key="index"
                            :data-index="index"
                            @slideclick="onClickSuggestionHandler"
                        >
                            <el-card
                                class="suggestion-bar-card"
                                shadow="never">
                                <p class="suggestion-bar-label">
                                    <span class="suggestion-bar-value">
                                        System Size:
                                        {{ suggestion.systemSize.toFixed(3) }}
                                        KW
                                    </span>
                                </p>
                                <p class="suggestion-bar-label">
                                    <span class="suggestion-bar-value">
                                        Avg. Solar Access:
                                        {{ ( 100 * suggestion.avgSolarAccess).toFixed(1) }}
                                    </span>
                                </p>
                            </el-card>
                        </slide>
                    </carousel>
                </div>
                <el-aside
                    width="5%"
                    class="center-alignment">
                    <i
                        id="suggestionBarNextButton"
                        class="el-icon-d-arrow-right"
                        @click="nextSlide"
                    />
                </el-aside>
            </el-container>
        </div>
    </el-footer>
</template>

<script type="text/javascript">
import { Carousel, Slide } from 'vue-carousel';
import { serverBus } from '../../../main';
import mutationTypes from '../../../store/modules/studio/modules/suggestionBar/mutationTypes';
import {
    SUGGESTION_TYPE_AUTO_PANELS,
    SUGGESTION_TYPE_AUTO_STRING,
    SUGGESTION_TYPE_AUTO_WIRE,
    INIT_SUGGESTION_BAR,
} from '../../../componentManager/componentManagerConstants';


import { mapState, mapActions } from 'pinia';
import { useStudioSuggestionBarStore } from '../../../stores/studio-suggestionBar'
export default {
    name: 'SuggestionBar',
    components: {
        Carousel,
        Slide,
    },
    data() {
        return {};
    },
    nonReactiveData() {
        return {
            suggestionTypes: {
                autoPanels: SUGGESTION_TYPE_AUTO_PANELS,
                autoSting: SUGGESTION_TYPE_AUTO_STRING,
                autoWire: SUGGESTION_TYPE_AUTO_WIRE,
            },
            suggestionType: '',
            autoPanelsSuggestions: {},
            onClickSuggestionFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioSuggestionBarStore, {
            visible: state => state.visible,
        }),
    },
    mounted() {
        serverBus.$on(
            INIT_SUGGESTION_BAR,
            (suggestionType, suggestions, onClickSuggestionFunc) => {
                if (suggestionType === SUGGESTION_TYPE_AUTO_PANELS) {
                    this.autoPanelsSuggestions = suggestions;
                }
                else {
                    console.error('Unidentified suggestion type');
                    return;
                }
                this.suggestionType = suggestionType;
                this.onClickSuggestionFunc = onClickSuggestionFunc;

                this.setVisibility(true);
                this.$nextTick().then(() =>
                    this.enableDisableNavigationButtons());
            },
        );
    },
    methods: {
        ...mapActions(useStudioSuggestionBarStore, {
            setVisibility: mutationTypes.SET_VISIBILITY,
        }),
        onClickSuggestionHandler(data) {
            this.onClickSuggestionFunc(parseInt(data.index, 10));
        },
        enableDisableNavigationButtons() {
            const nextButton = document.getElementById('suggestionBarNextButton');
            const prevButton = document.getElementById('suggestionBarPrevButton');

            const totalPageCount = this.$refs.carousel.pageCount;
            const { currentPage } = this.$refs.carousel;

            if (currentPage === 0) {
                // Disable prev
                prevButton.style.cursor = 'not-allowed';
                prevButton.style.color = '#4c4c4c';
            }
            else {
                // Enable prev
                prevButton.style.cursor = 'pointer';
                prevButton.style.color = 'white';
            }

            if (currentPage === totalPageCount - 1) {
                // Disable next
                nextButton.style.cursor = 'not-allowed';
                nextButton.style.color = '#4c4c4c';
            }
            else {
                // Enable Next
                nextButton.style.cursor = 'pointer';
                nextButton.style.color = 'white';
            }
        },
        nextSlide() {
            this.$refs.carousel.goToPage(this.$refs.carousel.getNextPage());
            this.enableDisableNavigationButtons();
        },
        prevSlide() {
            this.$refs.carousel.goToPage(this.$refs.carousel.getPreviousPage());
            this.enableDisableNavigationButtons();
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/components/utils';
</style>

<style lang="scss" scoped>
.suggestion-bar-label {
    font-size: 14px;
    font-weight: normal;
    .suggestion-bar-value {
        font-weight: bold;
    }
}

.suggestion-bar-card {
    margin: 5px !important;
    cursor: pointer;
}
</style>

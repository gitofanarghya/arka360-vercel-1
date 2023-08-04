<template>
    <div id="studio">
        <el-container
            class="windowContainer">
            <el-header class="navBar-container">
                <navBar :current-page="'studio'"/>
                <!-- TODO: add if validation -->
            </el-header>
            <el-container class="studioContainer">
                <el-aside class="style-sideBar">
                    <sideBar/>
                </el-aside>
                <!-- <el-row>
                    <textToolBar/>
                </el-row> -->
                <el-container
                    class="canvasContainer">
                    <el-main
                        class="el-main"
                        style="color: white; height: calc(100% - 20px)">
                        <studio-stage v-if="isDesignLoaded"/>
                    </el-main>
                    <textToolBar/>
                    <suggestionBar/>
                    <dcCapSizeErrorDialog/>
                    <el-footer
                        class="el-footer"
                        height="20px">
                        <statusBar/>
                    </el-footer>
                </el-container>
                <el-aside class="style-sapPane">
                    <sapPane/>
                </el-aside>
            </el-container>
        </el-container>
        <LoadingScreen v-if="isLoadingVisible"/>
    </div>
</template>

<script>
import navBar from '@/components/ui/navBar/navBar.vue';
import { mapActions, mapState } from 'pinia';
import { setIntercomStudioStyle, setIntercomNormalStyle } from '../../plugins/intercom';

import statusBar from './statusbar/statusBar.vue';
import sideBar from './sidebar/sideBar.vue';
import textToolBar from './texttoolbar/textToolBar.vue';
import sapPane from './sappane/sapPane.vue';
import suggestionBar from './suggestionbar/suggestionBar.vue';
import studioStage from './stage/StudioStage.vue';
import dcCapSizeErrorDialog from '../studio/components/dcCapSizeErrorDialog/dcCapSizeErrorDialog.vue';

import { SET_SAVE } from '../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../componentManager/notificationsAssistant';
import { isCloselyEqual } from '../../core/utils/comparisonUtils';
import { expiryPopupDisplay } from '../../core/utils/utils';
import LoadingScreen from '../../components/ui/loadingScreen.vue';
import { useDesignStore } from '../../stores/design';

export default {
    name: 'Studio',
    components: {
        navBar,
        sideBar,
        textToolBar,
        sapPane,
        suggestionBar,
        statusBar,
        studioStage,
        dcCapSizeErrorDialog,
        LoadingScreen,
    },
    nonReactiveData() {
        return {
            saveFunc: () => {},
        };
    },
    data() {
        return {
            isLoadingVisible: false,
        };
    },
    computed: {
        ...mapState(useDesignStore, {
            isDesignLoaded: state => state.isDesignLoaded,
            designVersionScene: state => state.versions.scene,
        }),
    },
    async created() {
        expiryPopupDisplay.isStudioPage = true;
        const loadingNotification = notificationsAssistant.loading({
            title: 'Loading Studio',
            message: 'Design is being loaded',
        });

        try {
            await this.SET_NEW_DESIGN_VERSION(this.$route.params.designId);
            notificationsAssistant.close(loadingNotification);
            window.addEventListener('beforeunload', this.beforeLeaving);
        }
        catch (error) {
            notificationsAssistant.close(loadingNotification);
            notificationsAssistant.error({
                title: 'Loading Failed',
                message: 'Design not found. Redirecting to Home Page ...',
            });

            const { status } = error.response;
            if (status === 404 || status === 401 || status === 403) {
                setTimeout(() => {
                    this.$router.push({ name: 'home' });
                }, 3000);
            }
        }
    },
    mounted() {
        this.$eventBus.$once(SET_SAVE, (saveFunc) => {
            this.saveFunc = saveFunc;
        });
        setIntercomStudioStyle();
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.beforeLeaving);
    },
   
    updated(){
        // setIntercomStudioStyle();
    },
    destroyed() {
        setIntercomNormalStyle();
        expiryPopupDisplay.isStudioPage = false;
    },
    methods: {
        ...mapActions(useDesignStore, {
            SET_NEW_DESIGN_VERSION: 'SET_NEW_DESIGN_VERSION',
        }),

        isDesignChanged() {
            const currentStageData = this.saveFunc();
            const savedStageData = this.designVersionScene === undefined ?
                null :
                JSON.parse(JSON.stringify(this.designVersionScene));

            // when stage was never loaded
            if (typeof currentStageData === 'undefined') return false;

            // when design was never saved before
            if (savedStageData === null) {
                return currentStageData.ground.children.length !== 0;
            }

            return !isCloselyEqual(currentStageData.ground, savedStageData.ground, 3);
        },

        beforeLeaving() {
            const vm = this;
            const confirmMessage = 'notEqual';

            // Firing only when current component is studio
            if (vm.$route.name === 'studio') {
                if (vm.isDesignChanged()) {
                    window.event.returnValue = confirmMessage;
                }
            }
        },
    },

    async beforeRouteLeave(to, from, next) {
        if (this.isDesignChanged()) {
            const answer = window.confirm('Do you really want to leave? You have unsaved changes!');
            if (answer) {
                next();
            }
            else {
                next(false);
            }
        }
        else {
            next();
        }
    },
};
</script>

<style type="text/css" scoped>
#studio {
    height: 100vh;
    width: 100%;
    display: block;
    overflow: hidden;
}

#studio .studioContainer {
    height: 90%;
    box-sizing: border-box;
    border-top: 2px solid #121212;
}

#studio .windowContainer {
    background-color: #141414;
    height: 100%;
    width: 100%;
}

#studio .style-sideBar {
    width: 3.8vw !important;
    height: 100%;
    overflow-x: hidden;
}

#studio .canvasContainer {
    height: 100%;
    position: relative;
}

#studio .el-main {
    height: 100%;
    width: 100%;
    position: absolute;
    padding: 0;
    overflow: hidden;
}

#studio .el-footer {
    padding: 0;
    height: 20px !important;
    z-index: 1;
    position: absolute;
    bottom: 0;
    right: 0;
}

#studio .suggestionBar {
    bottom: 0;
    width: 100%;
    position: absolute;
    padding: 0 !important;
    background-color: #141414 !important;
    height: 25% !important;
    overflow: hidden;
    opacity: 0.9;
}

#studio .style-sapPane {
    height: 100%;
    /* overflow: hidden; */
    width: 19.4% !important;
    min-width: 180px;
}
</style>

<style scoped>
.bodyWrapper {
    width: 100vw;
    height: 100vh;
}

* {
    margin: 0;
    padding: 0;
}
</style>

<style scoped>
    /* .intercom-launcher-badge-frame {
        z-index: 2147483001;
        position: fixed;
        bottom: 60px;
        right: 20% !important;
        width: 22px;
        height: 22px;
        box-shadow: rgba(0, 0, 0, 0.27) 0px 1px 0px;
        border-radius: 50%;
        animation: 150ms ease 150ms 1 normal backwards running animation-16z06qj;
    } */
</style>

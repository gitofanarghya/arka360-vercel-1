<template>
    <div
        id="save_button"
        class="navBarMidButtons">
        <el-button
            id="save_button"
            :disabled="!saveEnabled"
            class="navBarIcon iconNavBar-save "
            @click="onClickSave"/>
    </div>
</template>

<script>
import API from '@/services/api/';
import { mapActions, mapState } from 'pinia';
import { serverBus } from '../../../main';
import { SET_SAVE } from '../../../componentManager/componentManagerConstants';
import * as notificationsAssistant from '../../../componentManager/notificationsAssistant';
import topBarMutationTypes from '../../../store/modules/studio/modules/topBar/mutationTypes';
import { isCloselyEqual } from '../../../core/utils/comparisonUtils';
import { useDesignStore } from '../../../stores/design';
import { useStudioTextTopBarStore } from '../../../stores/studio-topBar';

export default {
    name: 'TopBarSaveButton',
    props: {
        designVersionId: {
            type: Number,
            default: -1,
        },
        designVersionSummaryId: {
            type: Number,
            default: -1,
        },
    },
    nonReactiveData() {
        return {
            saveFunc: () => {},
        };
    },
    computed: {
        ...mapState(useStudioTextTopBarStore, {
            saveEnabled: state => state.saveEnabled,
        }),
        ...mapState(useDesignStore, {
            designVersionScene: state => state.versions.scene
        })
    },
    mounted() {
        serverBus.$once(SET_SAVE, (saveFunc) => {
            this.saveFunc = saveFunc;
            this.$mousetrap.bind('mod+s', () => {
                if (this.saveEnabled) this.onClickSave();
                return false;
            });
        });
        serverBus.$on('settingsSaved', () => {
            this.onClickSave();
        });
    },
    beforeDestroy() {
        this.$mousetrap.unbind('mod+s');
    },
    methods: {
        ...mapActions(useDesignStore, {
            updateScene: 'updateScene',
            PATCH_DESIGN_VERSION_SCENE: 'PATCH_DESIGN_VERSION_SCENE',
        }),
        ...mapActions(useStudioTextTopBarStore, {
            setSaveButtonStatus: topBarMutationTypes.SAVE_BUTTON_STATUS,
        }),
        async onClickSave() {
            this.setSaveButtonStatus(false);
            const savingNotification = notificationsAssistant.loading({
                title: 'Saving',
                message: 'Design is being saved',
            });

            try {
                const saveData = await this.saveFunc();
                const patchData = {
                    scene: saveData,
                };
                const currentStageData = saveData;
                const savedStageData = this.designVersionScene === undefined ?
                    null :
                    JSON.parse(JSON.stringify(this.designVersionScene));

                let isDesignChanged;
                // when stage was never loaded
                if (typeof currentStageData === 'undefined') isDesignChanged = false;

                // when design was never saved before
                if (savedStageData === null) {
                    isDesignChanged = currentStageData.ground.children.length !== 0;
                }
                else {
                    isDesignChanged =
                        !isCloselyEqual(currentStageData.ground, savedStageData.ground, 3);
                }

                // if(isDesignChanged)
                await this.PATCH_DESIGN_VERSION_SCENE([patchData, isDesignChanged]);

                this.setSaveButtonStatus(true);
                // Notification on successful save
                notificationsAssistant.close(savingNotification);
                notificationsAssistant.success({
                    title: 'Save',
                    message: 'Design is successfully saved',
                });
            }
            catch (e) {
                console.error('save.vue: onClickSave: Error while saving', e);
                this.setSaveButtonStatus(true);
                // Notification on fail save
                notificationsAssistant.close(savingNotification);
                if (typeof e.response !== 'undefined' && e.response.status === 403) {
                    notificationsAssistant.error({
                        title: 'Save',
                        message: 'You are not allowed to edit this design. ',
                    });
                }
                else {
                    notificationsAssistant.error({
                        title: 'Save',
                        message: 'Design is not saved. Try again',
                    });
                }
            }
            serverBus.$emit('designSaved');
        },
    },
};
</script>

<style scoped>
.navBarMidButtons {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navBarMidButtons .navBarIcon {
    font-size: 1.25vw;
    border: none;
    background-color: inherit;
    color: white;
}
</style>

// This entire file is a hack/jugaad, created during the vuex to pinia migration.
// It serves as a pseudo Vuex store, and satisfies all
// the legacy Vuex code in the codebase, which couldn't be migrated to Pinia either
// because of time constraints, or just the sheer volume of code which needed to be migrated.

import { useDesignStore } from "../stores/design"
import { useStudioStageStore } from "../stores/studio-stage"
import { useProjectStore } from "../stores/project"
import { useStudioStore } from "../stores/studio"
import { useStudioSideBarStore } from "../stores/studio-sideBar"
import { useStudioTextTopBarStore } from "../stores/studio-topBar"
import { useStudioSapPaneStore } from "../stores/studio-sapPane"
import { useStudioTextToolBarStore } from "../stores/studio-textToolBar"
import { useStudioSuggestionBarStore } from "../stores/studio-suggestionBar"
import { useStudioStatusBarStore } from "../stores/studio-statusBar"

export const store = {
    state: {
        design: useDesignStore(),
        project: useProjectStore(),
        studio: {
            sideBar: useStudioSideBarStore(),
            stage: useStudioStageStore()
        }
    },
    actions: {
        "design": useDesignStore(),
        "studio/stage": useStudioStageStore(),
        "studio" : useStudioStore(),
        "studio/sideBar" : useStudioSideBarStore(),
        "studio/topBar" : useStudioTextTopBarStore(),
        "studio/sapPane" : useStudioSapPaneStore(),
        "studio/textToolBar" : useStudioTextToolBarStore(),
        "studio/suggestionBar" : useStudioSuggestionBarStore(),
        "studio/statusBar" : useStudioStatusBarStore(),
    },
    getters: {
        get ["design/IS_DESIGN_MEASUREMENT_SYSTEM_METRIC"]() {
            return useDesignStore().IS_DESIGN_MEASUREMENT_SYSTEM_METRIC
        },
        get ["studio/sapPane/GET_INVERTER_DROPDOWN_STATUS"]() {
            return useStudioSapPaneStore().GET_INVERTER_DROPDOWN_STATUS
        }
    },
    dispatch: (functionPath, functionArg) => {
        store.commit(functionPath, functionArg)
    },
    commit: (functionPath, functionArg) => {
        let functionName = functionPath.split('/').at(-1)
        let storeName = functionPath.replace('/' + functionName, '')
        store.actions[storeName][functionName](functionArg)
    }
}
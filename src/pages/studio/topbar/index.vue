<template>
    <el-row style="display:flex; justify-content: space-evenly;">
        <el-col :span="5"/>
        <el-col>
            <el-tooltip
                content="Undo (Ctrl / Cmd + Z)"
                placement="bottom"
                popper-class="navBarToolTip">
                <undo/>
            </el-tooltip>
        </el-col>
        <el-col>
            <el-tooltip
                content="Redo (Ctrl / Cmd + Shift + Z)"
                placement="bottom"
                popper-class="navBarToolTip">
                <redo/>
            </el-tooltip>
        </el-col>
        <el-col>
            <el-tooltip
                content="Complete (Enter)"
                placement="bottom"
                popper-class="navBarToolTip">
                <complete/>
            </el-tooltip>
        </el-col>
        <el-col>
            <el-tooltip
                content="Cancel (Esc)"
                placement="bottom"
                popper-class="navBarToolTip">
                <cancel/>
            </el-tooltip>
        </el-col>
        <el-col>
            <el-tooltip
                content="Save (Ctrl / Cmd + S)"
                placement="bottom"
                popper-class="navBarToolTip">
                <save
                    :design-version-id="designVersionId"
                    :design-version-summary-id="designVersionSummaryId"/>
            </el-tooltip>
        </el-col>
        <el-col>
            <el-tooltip
                content="Export"
                placement="bottom"
                popper-class="navBarToolTip">
                <export/>
            </el-tooltip>
        </el-col>
        <el-col :span="5"/>
    </el-row>
</template>

<script>

import { mapState } from 'pinia';
import undo from './undo.vue';
import redo from './redo.vue';
import complete from './complete.vue';
import cancel from './cancel.vue';
import save from './save.vue';
import Export from './Export.vue';
import { useDesignStore } from '../../../stores/design';

export default {
    components: {
        undo,
        redo,
        complete,
        cancel,
        save,
        Export,
    },
    computed: {
        ...mapState(useDesignStore, {
            designVersionId: state => state.versions.id,
            designVersionSummaryId: state => state.versions.summary.id,
        })
    },
};
</script>


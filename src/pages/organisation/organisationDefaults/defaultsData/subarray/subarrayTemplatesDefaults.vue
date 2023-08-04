<template>
    <div id="subarrayDefaults">

        <div>

            <div>
                <p class="headings"> PV Module </p>
                <p class="data"> {{ templateData.moduleProperties.moduleMake }} </p>
            </div>

            <div v-if="mountType==='fixed'"  class="headings">
                <p class="headings"> Structure Type </p>
                <p class="data"> {{ templateData.structureType }} </p>           
            </div>

            <div v-if="mountType=='flush'" class="headings">
                Structure Type
                <el-select
                    :disabled="true"
                    class="data"
                    placeholder="Select">
                    <el-option
                        value="NA"
                        label="NA"/>         
                </el-select>
            </div>
            
            <div
                v-if="mountType === 'fixed'"
            >
                <p class="headings"> Tilt  </p>
                <p class="data"> {{ templateData.tilt }} </p>
            </div>

            <div
                v-if="mountType === 'fixed'"
            >
                <p class="headings"> Azimuth </p>
                <p class="data"> {{ templateData.azimuth }} </p>
            </div>

            <div
                v-if="mountType === 'fixed'"
            >
                <p class="headings"> Row Spacing Mode</p>
                <p class="data">  </p>
            </div>

            <div
                v-if="templateData.rowSpacingMode === manualRowSpacing"
            >
                <p class="headings"> Row Spacing </p>
                <p class="data">
                    <display-length
                        :metric-value="templateData.rowSpacing"/>
                </p>
            </div>

            <div>
                <p class="headings"> Module Orientation </p>
                <p class="data"> {{ templateData.panelOrientation }} </p>
            </div>

            <div>
                <p class="headings"> Array Rows </p>
                <p class="data"> {{ templateData.tableSizeUp }} </p>
            </div>

            <div>
                <p class="headings"> Array Columns </p>
                <p class="data"> {{ templateData.tableSizeWide }} </p>
            </div>

            <div>
                <p class="headings"> Table Spacing </p>
                <p class="data">
                    <display-length
                        :metric-value="templateData.tableSpacing"/>
                </p>
            </div>

            <div>
                <p class="headings"> Vertical Module Spacing </p>
                <p class="data">
                    <display-length
                        :metric-value="templateData.moduleSpacingUp"/>
                </p>
            </div>

            <div>
                <p class="headings"> Horizontal Module Spacing </p>
                <p class="data">
                    <display-length
                        :metric-value="templateData.moduleSpacingWide"/>
                </p>
            </div>


        </div>

    </div>
</template>

<script>

import { ROW_SPACING_MODE_MANUAL } from '../../../../../core/coreConstants';

export default {
    name: 'SubarrayDefaults',
    props: {
        templateData: {
            type: Object,
            default() {
                return {};
            },
        },
        mountType: {
            type: String,
            default: 'fixed',
        },
    },
    data() {
        return {
            manualRowSpacing: ROW_SPACING_MODE_MANUAL,
        };
    },
};

</script>

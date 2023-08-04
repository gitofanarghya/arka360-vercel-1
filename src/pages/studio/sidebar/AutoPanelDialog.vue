<template>
    <div id="autoPanelDialog">
        <el-dialog
            :visible="true"
            :close-on-click-modal="false"
            title="Auto Panel Placement Details"
            width="50%"
            @close="$emit('hide-auto-panel-dialog')"
        >
            <div
                v-bar
                class="scroll-area">
                <el-form
                    ref="autoSubarray"
                    :model="autoSubarray"
                    size="mini"
                    label-position="left"
                    label-width="200px"
                >
                    <p class="formHeadings">Field Segment Properties</p>
                    <el-form-item label="Module">
                        <div>
                            <infinite-scroll-dropdown-panel
                                :panel.sync="autoSubarray.selectedPanel"
                                :moduleId="autoSubarray.moduleProperties.moduleId"
                            />
                        </div>
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first(
                                        'PV Module',
                                        'fieldSegmentFormScope'
                                    )
                                }}
                            </span>
                        </p>
                    </el-form-item>
                    <el-form-item
                        label="Table Spacing"
                        prop="tableSpacing">
                        <input-length
                            v-model="autoSubarray.tableSpacing"
                            :name="'Table Spacing'"
                            :metric-validation="tableSpacingValidation"
                            :class-input="'customInputBoxStylerAPP inputBoxStyler'"
                            :error-view-ancestor="this"
                            error-scope="fieldSegmentFormScope"/>
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first(
                                        'Table Spacing',
                                        'fieldSegmentFormScope'
                                    )
                                }}
                            </span>
                        </p>
                    </el-form-item>
                    <el-form-item
                        label="Tilt"
                        prop="tilt">
                        <el-input
                            v-validate="tiltValidation"
                            v-model="autoSubarray.tilt"
                            data-vv-scope="fieldSegmentFormScope"
                            name="Tilt"
                        />
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first(
                                        'Tilt',
                                        'fieldSegmentFormScope'
                                    )
                                }}
                            </span>
                        </p>
                    </el-form-item>

                    <el-form-item
                        label="Azimuth"
                        prop="azimuth">
                        <el-input
                            v-validate="azimuthValidation"
                            v-model="autoSubarray.azimuth"
                            data-vv-scope="fieldSegmentFormScope"
                            name="Azimuth"
                        />
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first(
                                        'Azimuth',
                                        'fieldSegmentFormScope'
                                    )
                                }}
                            </span>
                        </p>
                    </el-form-item>
                    <el-form-item
                        label="Solar Access Cutoff"
                        prop="solarAccessCutoff"
                    >
                        <el-input
                            v-validate="solarAccessCutoffValidation"
                            v-model="autoSubarray.solarAccessCutoff"
                            data-vv-scope="fieldSegmentFormScope"
                            name="Solar Access Cutoff"
                        />
                        <p class="formErrors">
                            <span>
                                {{
                                    errors.first(
                                        'Solar Access Cutoff',
                                        'fieldSegmentFormScope'
                                    )
                                }}
                            </span>
                        </p>
                    </el-form-item>

                    <p class="formHeadings">
                        Table Types
                        <button
                            class="el-icon-plus button-light-theme-icons icons-circle"
                            @click.prevent="
                                addTableTypeFormVisible = !addTableTypeFormVisible
                            "
                        />
                    </p>
                    <el-dialog
                        :visible.sync="addTableTypeFormVisible"
                        :close-on-click-modal="false"
                        title="Table Type Details"
                        width="50%"
                        style="font-family: 'Avenir', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; color: #606266"
                        append-to-body
                        @close="resetAddTableData">
                        <el-form
                            ref="addTableType"
                            :model="addTableType"
                            size="mini"
                            label-position="left"
                            label-width="160px"
                        >
                            <el-form-item
                                label="Module Orientation"
                                prop="panelOrientation"
                            >
                                <el-radio-group
                                    v-model="addTableType.panelOrientation"
                                    size="mini"
                                >
                                    <el-radio-button label="Landscape" />
                                    <el-radio-button label="Portrait" />
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item
                                label="Array Rows"
                                prop="tableSizeUp"
                            >
                                <el-input
                                    v-validate="tableSizeUpValidation"
                                    v-model="addTableType.tableSizeUp"
                                    data-vv-scope="addTableFormScope"
                                    name="Array Rows"
                                />
                                <p class="formErrors">
                                    <span>
                                        {{
                                            errors.first(
                                                'Array Rows',
                                                'addTableFormScope'
                                            )
                                        }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Array Columns"
                                prop="tableSizeWide"
                            >
                                <el-input
                                    v-validate="tableSizeWideValidation"
                                    v-model="addTableType.tableSizeWide"
                                    data-vv-scope="addTableFormScope"
                                    name="Array Columns"
                                />
                                <p class="formErrors">
                                    <span>
                                        {{
                                            errors.first(
                                                'Array Columns',
                                                'addTableFormScope'
                                            )
                                        }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Vertical Module Spacing"
                                prop="moduleSpacingUp"
                            >
                                <input-length
                                    v-model="addTableType.moduleSpacingUp"
                                    :name="'Vertical Module Spacing'"
                                    :metric-validation="moduleSpacingUpValidation"
                                    :class-input="'customInputBoxStylerAPP inputBoxStyler'"
                                    :error-view-ancestor="this"
                                    error-scope="addTableFormScope"/>
                                <p class="formErrors">
                                    <span>
                                        {{
                                            errors.first(
                                                'Vertical Module Spacing',
                                                'addTableFormScope'
                                            )
                                        }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Horizontal Module Spacing"
                                prop="moduleSpacingWide"
                            >
                                <input-length
                                    v-model="addTableType.moduleSpacingWide"
                                    :name="'Horizontal Module Spacing'"
                                    :metric-validation="moduleSpacingWideValidation"
                                    :class-input="'customInputBoxStylerAPP inputBoxStyler'"
                                    :error-view-ancestor="this"
                                    error-scope="addTableFormScope"/>
                                <p class="formErrors">
                                    <span>
                                        {{
                                            errors.first(
                                                'Horizontal Module Spacing',
                                                'addTableFormScope'
                                            )
                                        }}
                                    </span>
                                </p>
                            </el-form-item>

                            <el-form-item
                                label="Mount Height"
                                prop="mountHeight"
                            >
                                <input-length
                                    v-model="addTableType.mountHeight"
                                    :name="'Mount Height'"
                                    :metric-validation="mountHeightValidation"
                                    :class-input="'customInputBoxStylerAPP inputBoxStyler'"
                                    :error-view-ancestor="this"
                                    error-scope="addTableFormScope"/>
                                <p class="formErrors">
                                    <span>
                                        {{
                                            errors.first(
                                                'Mount Height',
                                                'addTableFormScope'
                                            )
                                        }}
                                    </span>
                                </p>
                            </el-form-item>
                        </el-form>

                        <span
                            slot="footer"
                            class="dialog-footer">
                            <el-button
                                class="button-cancel"
                                @click="cancelOnClickActionAddTableType()"
                            >
                                Cancel
                            </el-button>
                            <el-button
                                :disabled="errors.any('addTableFormScope')"
                                class="button-confirm"
                                @click="confirmOnClickActionAddTableType()"
                            >
                                Confirm
                            </el-button>
                        </span>
                    </el-dialog>

                    <el-table :data="autoSubarray.tableTypes">
                        <el-table-column
                            property="panelOrientation"
                            label="Orientation"
                        />

                        <el-table-column label="Table Size">
                            <el-table-column
                                property="tableSizeUp"
                                label="Up"
                            />
                            <el-table-column
                                property="tableSizeWide"
                                label="Wide"
                            />
                        </el-table-column>

                        <el-table-column label="Module Spacing">
                            <el-table-column
                                label="Up">
                                <template slot-scope="scope">
                                    <display-length
                                        :metric-value="scope.row.moduleSpacingUp"/>
                                </template>
                            </el-table-column>
                            <el-table-column
                                label="Wide">
                                <template slot-scope="scope">
                                    <display-length
                                        :metric-value="scope.row.moduleSpacingWide"/>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        <el-table-column
                            label="Mount Height">
                            <template slot-scope="scope">
                                <display-length
                                    :metric-value="scope.row.mountHeight"/>
                            </template>
                        </el-table-column>
                        <el-table-column label="Operations">
                            <template slot-scope="scope">
                                <button
                                    class="button-danger"
                                    @click.prevent="
                                        deleteTableType(scope.$index, scope.row)
                                    "
                                >
                                    Delete
                                </button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-form-item style="text-align: right;">
                        <button
                            class="button-cancel"
                            @click="cancelOnClickAction()"
                        >
                            Cancel
                        </button>
                        <button
                            :disabled="
                                errors.any('fieldSegmentFormScope') ||
                                    autoSubarray.selectedPanel === null
                            "
                            class="button-confirm"
                            @click="confirmOnClickAction()"
                        >
                            Confirm
                        </button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>
    </div>
</template>

<script>
// Extracting user token from local storage
import API from '@/services/api/';
import infiniteScrollDropdownPanel from '@/components/ui/infiniteScrollDropdown/infiniteScrollDropdownPanel.vue/';


export default {
    name: 'Array',
    components: {
        infiniteScrollDropdownPanel,
    },
    props: {
        autoSubarrayFunc: {
            type: Function,
            required: true,
        },
        getDesignSettingsFunc: {
            type: Function,
            required: true,
        },
    },
    data() {
        return {
            noResults: false,
            isFormReadyForRender: false,
            addTableTypeFormVisible: false,
            isScrollStateToBeReset: '',
            scrollState: '',
            filters: {
                'p_min': '',
                'p_max': '',
                'query': '',
            },
            addTableType: {
                panelOrientation: 'Landscape',
                tableSizeUp: 1,
                tableSizeWide: 1,
                moduleSpacingUp: 0.025,
                moduleSpacingWide: 0.025,
                mountHeight: 0.1,
            },
            loading: false,
            nextURL: null,
            prevURL: null,
            defaultPanel: {},
            defaultPanelGroup: {},
            autoSubarray: {
                tableSpacing: 0.025,
                tilt: 20,
                azimuth: 180,
                solarAccessCutoff: 90,
                tableTypes: [
                    {
                        panelOrientation: 'Landscape',
                        tableSizeUp: 1,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        moduleSpacingWide: 0.025,
                        mountHeight: 1,
                    },
                    {
                        panelOrientation: 'Portrait',
                        tableSizeUp: 1,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        moduleSpacingWide: 0.025,
                        mountHeight: 1,
                    },
                    {
                        panelOrientation: 'Landscape',
                        tableSizeUp: 2,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        moduleSpacingWide: 0.025,
                        mountHeight: 1,
                    },
                    {
                        panelOrientation: 'Portrait',
                        tableSizeUp: 2,
                        tableSizeWide: 1,
                        moduleSpacingUp: 0.025,
                        moduleSpacingWide: 0.025,
                        mountHeight: 1,
                    },
                ],
                selectedPanel: {},
                panelList: [],
                favoritesPanels: [],
                moduleProperties: {
                    moduleId: 9134,
                    moduleMake: 'Waaree Energies WSM-315',
                    moduleSize: 0.315,
                    moduleLength: 1.96,
                    moduleWidth: 0.99,
                },
            },
            moduleValidation: {
                required: true,
            },
            tableSpacingValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            tiltValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 89.9,
                },
                decimal: 1,
            },
            azimuthValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 360,
                },
                decimal: 2,
            },
            solarAccessCutoffValidation: {
                required: true,
                between: {
                    min: 0,
                    max: 100,
                },
                decimal: 2,
            },
            tableSizeUpValidation: {
                required: true,
                numeric: true,
                min_value: 1,
            },
            tableSizeWideValidation: {
                required: true,
                numeric: true,
                min_value: 1,
            },
            mountHeightValidation: {
                required: true,
                min_value: 0.001,
                decimal: 3,
            },
            moduleSpacingUpValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
            moduleSpacingWideValidation: {
                required: true,
                min_value: 0,
                decimal: 3,
            },
        };
    },

    mounted() {
        const currentDesignSettings = this.getDesignSettingsFunc();
        const fixedMountSubarrayDefaults =
            currentDesignSettings.drawing_defaults.subarray.fixedMount;
        this.autoSubarray.tableSpacing = fixedMountSubarrayDefaults.tableSpacing;
        this.autoSubarray.tilt = fixedMountSubarrayDefaults.tilt;
        this.autoSubarray.azimuth = fixedMountSubarrayDefaults.azimuth;
        this.autoSubarray.moduleProperties = {
            moduleId: fixedMountSubarrayDefaults.moduleProperties.moduleId,
            moduleLength: fixedMountSubarrayDefaults.moduleProperties.moduleLength,
            moduleWidth: fixedMountSubarrayDefaults.moduleProperties.moduleWidth,
            moduleMake: fixedMountSubarrayDefaults.moduleProperties.moduleMake,
            moduleSize: fixedMountSubarrayDefaults.moduleProperties.moduleSize,
        };
        this.autoSubarray.solarAccessCutoff =
            currentDesignSettings.default_solar_access_threshold;
        this.autoSubarray.tableTypes = currentDesignSettings.default_table_types;

    },
    methods: {

        resetAddTableData() {
            this.$validator.reset('addTableFormScope');

            // Resetting  add table data
            this.addTableType.panelOrientation = 'Landscape';
            this.addTableType.tableSizeUp = 1;
            this.addTableType.tableSizeWide = 1;
            this.addTableType.moduleSpacingUp = 0.025;
            this.addTableType.moduleSpacingWide = 0.025;
            this.addTableType.mountHeight = 0.025;
        },

        resetMainForm() {
            // Removing validations and resetting main form values
            this.$validator.reset('fieldSegmentFormScope');

            this.autoSubarray.tableSpacing = 0.025;
            this.autoSubarray.tilt = 20;
            this.autoSubarray.azimuth = 180;
            this.autoSubarray.solarAccessCutoff = 90;
        },

        resetBothForms() {
            this.resetMainForm();
            this.resetAddTableData();
        },

        confirmOnClickAction() {
            this.$emit('hide-auto-panel-dialog');
            const appParameters = {
                tilt: parseFloat(this.autoSubarray.tilt),
                azimuth: parseFloat(this.autoSubarray.azimuth),
                tableSpacing: parseFloat(this.autoSubarray.tableSpacing),
                solarAccessCutoff: parseFloat(this.autoSubarray.solarAccessCutoff),
                moduleProperties: {
                    moduleId: parseInt(this.autoSubarray.selectedPanel.id),
                    moduleMake: `${
                        this.autoSubarray.selectedPanel.characteristics
                            .manufacturer
                    } ${this.autoSubarray.selectedPanel.model}`,
                    moduleSize:
                        parseFloat(this.autoSubarray.selectedPanel.characteristics
                            .p_mp_ref) / 1000,
                    moduleLength: parseFloat(this.autoSubarray.selectedPanel.characteristics.length),
                    moduleWidth: parseFloat(this.autoSubarray.selectedPanel.characteristics.width),
                },
                tableTypes: [],
            };
            for (const tableType of this.autoSubarray.tableTypes) {
                appParameters.tableTypes.push({
                    panelOrientation: tableType.panelOrientation,
                    tableSizeUp: parseInt(tableType.tableSizeUp),
                    tableSizeWide: parseInt(tableType.tableSizeWide),
                    moduleSpacingUp: parseFloat(tableType.moduleSpacingUp),
                    moduleSpacingWide: parseFloat(tableType.moduleSpacingWide),
                    mountHeight: parseFloat(tableType.mountHeight),
                });
            }
            this.autoSubarrayFunc(appParameters);
        },

        cancelOnClickAction() {
            this.$emit('hide-auto-panel-dialog');
        },

        confirmOnClickActionAddTableType() {
            this.addTableTypeFormVisible = false;
            this.autoSubarray.tableTypes.push({
                panelOrientation: this.addTableType.panelOrientation,
                tableSizeUp: this.addTableType.tableSizeUp,
                tableSizeWide: this.addTableType.tableSizeWide,
                moduleSpacingUp: this.addTableType.moduleSpacingUp,
                moduleSpacingWide: this.addTableType.moduleSpacingWide,
                mountHeight: this.addTableType.mountHeight,
            });
        },

        cancelOnClickActionAddTableType() {
            this.addTableTypeFormVisible = false;
        },

        deleteTableType(index, row) {
            this.autoSubarray.tableTypes.splice(index, 1);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '../../../styles/components/button';
</style>

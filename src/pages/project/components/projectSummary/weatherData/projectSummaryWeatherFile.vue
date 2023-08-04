<template>
	<div id="projectSummaryWeatherDataDialog">
		<el-dialog title="Weather Stations"
                :visible="weatherFileDialog"
                :close-on-click-modal="false"
                @close="$emit('update:weatherFileDialog', false)"
                width="45%">
			<div>
                <div style="width: 100%; height: 50vh;" v-bar>
                    <el-table       
                        ref="weatherFileTable"
                        :data="weatherFiles"
                        highlight-current-row
                        @current-change="handleWeatherFileChange"
                        style="width: 100%"
                        :header-cell-style="() => {return { padding: '5px 0' }}">
                        <el-table-column
                            type="index"
                            width="50"
                            class-name="cellPaddingReducer">
                        </el-table-column>
                        <el-table-column
                            label="Location"
                            width="250"
                            class-name="cellPaddingReducer">
                            <template slot-scope="scope">
                                {{ scope.row.siteName }} 
                                ({{ scope.row.latitude }},
                                {{ scope.row.longitude }})
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="source"
                            label="Source"
                            class-name="cellPaddingReducer">
                        </el-table-column>
                        <el-table-column
                            label="Distance"
                            class-name="cellPaddingReducer">
                            <template slot-scope="scope">
                                {{ scope.row.distance }} km ({{ (Number(scope.row.distance) * 0.62).toFixed(2) }} miles)
                            </template>
                        </el-table-column>
                    </el-table>                
                </div>
			</div>
			<span slot="footer" class="footer">
                <button
                    class="button-upload"
                    @click="openUploadForm"
                >
                    Upload New File
                </button>
                <button
                        class="button-confirm"
                        style="width: 80px;"
                        @click="onConfirmDialog"
                        :disabled="isChangingWeatherStation">
                        <span v-show="!isChangingWeatherStation">Save</span>
                        <i class="el-icon-loading" v-show="isChangingWeatherStation"></i>
                    </button>
            </span>
		</el-dialog>
        <uploadWeatherFile
            :uploadWeatherFileDialog="uploadWeatherFileDialog" 
            @close-upload="openUploadForm"
        />
	</div>
</template>

<script>

    import { serverBus } from "../../../../../main";
    import uploadWeatherFile from './uploadWeatherFile1.vue';
    import { weatherMixin } from './weatherMixin.js';
    import { mapState } from "pinia";
    import { useProjectStore } from "../../../../../stores/project";
    

    export default {
        name: 'projectSummaryWeatherDataDialog',
        mixins: [weatherMixin],
        props: {
            weatherFiles: {
                type: Array,
                default: () => [],
            },
            weatherFileDialog: {
                type: Boolean,
                default: false
            },
            selectedWeatherStation: {
                type: Object,
                default: () => {}
            },
        },
        components: {
            uploadWeatherFile
        },
        computed: {
            ...mapState(useProjectStore, {
                latitude: state => state.latitude,
                longitude: state => state.longitude,
            }),
        },
        data() {
            return {
                msg: 'I am in projectSummaryWeatherDataDialog',
                modelsFormVisible: false,
                selectedWeatherStationLocal: this.selectedWeatherStation,
                uploadWeatherFileDialog: false,
                isChangingWeatherStation: false,
            }
        },
        methods: {
            async onConfirmDialog() {
                try {
                    this.isChangingWeatherStation = true;
                    await this.patchWeatherStation(this.selectedWeatherStationLocal.id);
                    this.$emit('update:selectedWeatherStation', this.selectedWeatherStationLocal);
                    this.$emit('update:weatherFileDialog', false);
                } catch (error) {
                }
                this.isChangingWeatherStation = false;
                
            },

            handleWeatherFileChange(currentSelection) {
                this.selectedWeatherStationLocal = currentSelection
            },
            openUploadForm(){
                this.uploadWeatherFileDialog = !this.uploadWeatherFileDialog;
            },
        },
        watch: {
            weatherFileDialog: function () {
                // Set time out is required since table takes sometime to render
                setTimeout(() => {
                    this.$refs.weatherFileTable.setCurrentRow(this.selectedWeatherStation);
                }, 250);
            }
        },
        mounted() {
            serverBus.$on('weatherStationUpdated', async (station, isUsingUploadedFile) => {
                if (isUsingUploadedFile) {
                    this.$emit('update:selectedWeatherStation', station);
                    this.$emit('update:weatherFileDialog', false);
                }
                this.$emit('update:weatherFiles', await this.fetchWeatherFiles(this.latitude, this.longitude));
            });
        }
    };
</script>

<style lang="scss" scoped>
    @import '../../../../../styles/components/button';
</style>

<style type="text/css">
    tr {
        cursor: pointer;
    }
    #projectSummaryWeatherDataDialog .el-table {
        overflow: scroll !important;
    }

    #projectSummaryWeatherDataDialog .el-table::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    #projectSummaryWeatherDataDialog .el-table__header-wrapper, 
    #projectSummaryWeatherDataDialog .el-table__footer-wrapper {
        position: fixed;
        z-index: 1;
        width: calc(45vw - 20px);
        min-width: 480px;
    }

    #projectSummaryWeatherDataDialog .el-table__body-wrapper {
        margin: 35px 0 0 0;
    }

    #projectSummaryWeatherDataDialog .el-table th .cell {
		color: #409eff;
	}

    #projectSummaryWeatherDataDialog .el-dialog {
        min-width: 500px;
    }

    #projectSummaryWeatherDataDialog td.cellPaddingReducer {
        padding: 5px 0;
    }
    #projectSummaryWeatherDataDialog .vb > .vb-dragger > .vb-dragger-styler {
        height: 100%;
    }
    #projectSummaryWeatherDataDialog .el-table {
        font-size: 10px;
    }

    #projectSummaryWeatherDataDialog .el-dialog__close {
    color: #222222 !important;
    font-weight: 800 !important;
    font-size: 18px !important;
    }

     #projectSummaryWeatherDataDialog  .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        display: flex;
        justify-content: space-between;
    }

       #projectSummaryWeatherDataDialog  .el-dialog__title{

     font-weight: 550;
     margin-left: 0px;
      color: #222222 !important;
        }

         #projectSummaryWeatherDataDialog  .el-dialog__close {
       color: #222222 !important;
        }

          th .cell {

             color: #222222  !important;
         }

        #projectSummaryWeatherDataDialog  .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       padding: 10px 2px !important;
       width: 80px  !important;
       /* height: 40px  !important; */
       
       
    }


      #projectSummaryWeatherDataDialog  .button-upload {
       background-color: #ffffff !important;
       color: #222222 !important;
       font-size: 13px !important;
       border: solid 1px #1c3366  !important; 
       padding: 10px 2px !important;
       width: 130px  !important;
       height: 40px !important ;
       border-radius: 4px !important;
       /* height: 40px  !important; */
       
       
    }
    .footer{
        display: flex;
        justify-content: space-between;
    }
</style>

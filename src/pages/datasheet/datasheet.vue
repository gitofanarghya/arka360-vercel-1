<template>
    <div class="datasheetContainer">
        <div class="childContainer">
            <div class="btnContainer">
                <p class="datasheetHeading">Datasheet</p>
                <div>
                    <el-button type="primary" class="dwnldBtn" @click="downloadDatasheet">
                        <span v-show="!isDownloadRunning">Download Datasheet</span>
                        <i
                            v-show="isDownloadRunning"
                            class="el-icon-loading"/>
                    </el-button>
                    <el-button type="primary" class="saveBtn" @click="save" :disabled="!isSavedEnabled">
                        <span v-show="!isSaveRunning">Save</span>
                        <i
                            v-show="isSaveRunning"
                            class="el-icon-loading"/>
                    </el-button>
                </div>
            </div>
            <div class="tableContainer">

                <!-- ---------------------------------------------------------header------------------------------------------ -->
                <div class="tableHeader commonGridClass">
                    <el-checkbox v-model="universalCheck">Component</el-checkbox>
                    <p class="headerDesc">Description</p>
                    <p class="headerAct">Action</p>
                </div>

                <!-- ---------------------------------------------------------body------------------------------------------------>
                <div class="tableBodyContainer">


                    <!-- ---------------------------------------------------------without dropdown------------------------------------>
                    <div class="tableBody commonGridClass">
                        <el-checkbox v-model="modulesCheck" :disabled="moduleLinks.length == 0">Modules</el-checkbox>
                        <div  id="noDropContainer">
                            <div id="noDropBody" v-for="item in modules" :key="item.id">
                                <p class="bodyDesc">{{ item.make }}</p>
                                <p class="errorMsg" v-if="!item.isValidLink">Datasheet not available for this module</p>
                            </div>
                        </div>
                    </div>
                    <div class="tableBody commonGridClass">
                        <el-checkbox v-model="invertersCheck" :disabled="inverterLinks.length == 0">Inverters</el-checkbox>
                        <div id="noDropContainer">
                            <div id="noDropBody" v-for="item in inverters" :key="item.id">
                                <p class="bodyDesc">{{ item.make }}</p>
                                <p class="errorMsg" v-if="!item.isValidLink">Datasheet not available for this inverter</p>
                            </div>
                        </div>
                    </div>
                    <div 
                        class="tableBody commonGridClass"
                        v-if="optimizers.length > 0">
                        <el-checkbox v-model="invertersCheck" :disabled="inverterLinks.length == 0">Optimiser</el-checkbox>
                        <div>
                            <div v-for="item in optimizers" :key="item.id">
                                <p class="bodyDesc valueOptimizer">{{ item }}</p>
                                <p class=""></p>
                            </div>
                        </div>
                    </div>

                    <!-- ---------------------------------------------------------with dropdown--------------------------------------->
                    
                    <div
                        v-for="(item, key, index) in dropDownComponents">
                        <div class="tableBody commonGridClass" :class="(addNewDropdown == true || item.selectedPDFs.length > 1 )? 'DropdownsRow' : ''" >
                            <el-checkbox v-model="item.isChecked" :class="(addNewDropdown == true || item.selectedPDFs.length > 1) ? 'conditionDropDown' : ''">{{ key }}</el-checkbox>
                            <div class="dropdownContainer">
                                <div 
                                    class="moreDropdownsContainer"
                                    v-for="(value, idx) in item.selectedPDFs">
                                        <InfiniteDropdown
                                            :options="item.options"
                                            :componentKey="key"
                                            :selectedPDF="value"
                                            :index="idx"/>
                                        <img 
                                            v-if="idx > 0"
                                            src="./assets/img/Group 278.svg" class="icon" @click="setDeleteOption(key, idx)" />
                                </div>
                            </div>
                            <p class="bodyAct" @click="addNewOption(key)" :class="(addNewDropdown == true || item.selectedPDFs.length > 1 )? 'conditionDropDown' : ''">New {{ key }}</p>
                        </div>
                    </div>
                    <!-- <div class="tableBody commonGridClass">
                        <el-checkbox v-model="checked">Option</el-checkbox>
                        <InfiniteDropdown />
                        <p class="bodyAct">New Structure/Attachment</p>
                    </div> -->

                    <!-- ---------------------------------------------------------user can add---------------------------------------->
                    <div v-for="(item, key, index) in uploadComponents">
                        <div class="tableBody commonGridClass userRow">
                            <el-checkbox v-model="item.isChecked" v-if="editRow.isEditBtnClicked == false">{{ item.component
                            }}</el-checkbox>
                            <input type="text" v-model="item.component" v-if="editRow.isEditBtnClicked == true"
                            @focus="bindEnter"
                            @blur="unbindEnter"
                                class="editInputs" />
                            <div class=''>
                                <p class="bodyDesc" v-if="editRow.isEditBtnClicked == false">{{ item.make }}</p>
                                <input type="text" v-model="item.make" v-if="editRow.isEditBtnClicked == true"
                                @focus="bindEnter"
                            @blur="unbindEnter"
                                    class="editInputs" />
                                <!-- <ul class="uploadFilesContainer">
                                    <li class="uploadFiles">huiuhihuihuhi</li>
                                    <li class="uploadFiles">huiuhihuihuhi</li>
                                </ul> -->
                            </div>
                            <div class="editDelContainer">
                                <img src="./assets/img/Group 294.svg" class="icon" @click="editRowText()" v-if="showEditIcon"/>
                                <img src="./assets/img/tickIcon.svg" class="icon" @click="editRowText()" v-if="showTickIcon"/>
                                <img src="./assets/img/Group 278.svg" class="icon" @click="setDeleteRowIndex(index)" />

                            </div>
                        </div>
                    </div>



                    <!-- ---------------------------------------------------------footer--------------------------------------------->
                    <p class="footerHeading">Upload Custom Datasheet</p>
                    <div class="footerInputsContainer">
                        <input type="text" placeholder="Enter Component Name" class="footerInputs" id="input-component" />
                        <input type="text" placeholder="Enter Make" class="footerInputs" id="input-make"  />
                        <div class="positionR">
                            <label for="card_index" class="labelBtn">
                                <div class="imgContainer upldImgCntnr">
                                    <p class="upldImgTxt">{{ uploadFileName }}</p>
                                    <img src="./assets/img/Group 1716.svg" class="uploadIcon" />
                                    <input type="file" id="card_index" multiple="multiple"
                                        style="width: -webkit-fill-available;" accept="application/pdf" @input="handlePdfInput" />
                                </div>
                            </label>
                            <p class="fileType">.pdf</p>
                        </div>
                        <el-button type="primary" class="addDSBtn" @click="uploadPDF()">
                            <span v-show="!isUploadRunning">Add Datasheet</span>
                            <i
                                v-show="isUploadRunning"
                                class="el-icon-loading"/>
                        </el-button>
                    </div>

                </div>
            </div>
            <el-button class="el-icon-back backBtn" @click="moveToDesignSummary" type="primary" > Back to Design Summary Page</el-button>   
        </div>
        <DeleteComponentPopup 
            :isDeleteComponentPopup="isDeleteComponentPopup"
            @confirmDelete="deleteOption()"
            @cancelDelete="isDeleteComponentPopup = false" />
        <DeleteComponentPopup 
            :isDeleteComponentPopup="isDeleteUploadComponentPopup"
            @confirmDelete="deleteRow()"
            @cancelDelete="isDeleteUploadComponentPopup = false" />

        <loading :active.sync="isLoading" 
            :can-cancel="true" 
            :on-cancel="onCancel"
            :is-full-page="fullPage"></loading>
    </div>
</template>


<script>

import InfiniteDropdown from "./components/infiniteDropdown.vue"
import DeleteComponentPopup from "./components/deleteComponentPopup.vue";
import API from '@/services/api/';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib'
import { degrees } from 'pdf-lib'
import { serverBus } from "../../main";
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import { findOrientionOfPage, mergePdfPages, mergePdfs } from "../../core/utils/utils";


export default {
    components: {
        InfiniteDropdown,
        DeleteComponentPopup,
        Loading
    },
    data() {
        return {
            isLoading: false,
            fullPage: true,
            editRow: {
                editComponent: "Lifeline",
                editDesc: "Make",
                isEditBtnClicked: false
            },
            checked: false,
            isDeleteComponentPopup: false,
            isDeleteUploadComponentPopup: false,
            universalCheck: true,
            addNewDropdown: false,
            uploadFileBlob: undefined,
            modules: [],
            modulesCheck: true,
            moduleLinks: [],
            invalidModuleLinks: [],
            inverterLinks: [],
            invalidInverterLinks: [],
            invertersCheck: true,
            inverters: [],
            optimiserCheck: true,
            optimizers: [],
            uploadData: [],
            inverterType: undefined,
            //
            components:[],
            dropDownComponents: {},
            nooDropDownComponents: {},
            uploadComponents: [],
            isSavedEnabled: false,
            design: {},
            uploadComponentsDeleteIdx: undefined,
            dropDownDeleteKey: undefined,
            dropDownDeleteIdx: undefined,
            someDatasheetsMissing: false,
            showEditIcon: true,
            showTickIcon: false,
            isDownloadRunning: false,
            isSaveRunning: false,
            isUploadRunning: false,
            projectId: this.$route.params.projectId,
            uploadFileName: 'Upload File',
            address: '',
        }
    },

    async mounted() {
        this.isLoading = true;
        await this.getAllComponents();
        await this.fetchModulesAndInverters();
        const isSaved = await this.getDesign();

        if (!isSaved) {
            await this.getComponentOptions();
        }
        this.isLoading = false;

        // this.addUploadEvent();
        this.addOptionChangeEvent();
    },

    methods: {
        moveToDesignSummary(){
            this.$router.push({
                name: 'designSummary',
                params: { projectId: this.projectId },
            });
        },
        onCancel() {
            console.log('User cancelled the loader.')
        },

        bindEnter(e){
            this.$mousetrap.bind('enter', this.editRowText);
        },

        unbindEnter(e){
            this.$mousetrap.unbind('enter');
        },
        handlePdfInput() {
            const inputElement = document.getElementById('card_index');
            const file = inputElement.files[0];

            if (file.type !== 'application/pdf') {
                this.$message({
                    showClose: true,
                    message: "Invalid file type. Please add PDF",
                    type: "error",
                    center: true
                });

                return

            }
            this.uploadFileName = file.name.slice(0, 10) + '..' ;
        },

        async getDesign() {
            const design_id = this.$route.params.designId;

            const res = await this.fetchData(`/api/designs/${design_id}/`);
            this.address = res.project.client_address;

            this.design = res

            let data = {};
            if (res.component_state && res.component_state.dropDownComponents && Object.keys(res.component_state.dropDownComponents).length > 0) {

                const newKeys = Object.keys(res.component_state.dropDownComponents);

                if (this.inverterType === 'micro') {
                    if (!newKeys.includes("Combiner Box")) {
                        return false;
                    }
                }

                if (this.inverterType === 'string') {
                    if (newKeys.includes("Combiner Box")) {
                        return false;
                    }
                }

                // if (this.inverterType === 'optimizer') {
                //     if (newKeys.includes())
                //         return false;
                // }
                
                for (let i = 0; i < this.components.length; i += 1) {
                    const component = this.components[i];
                    const key = Object.keys(component)[0];

                    if (!newKeys.includes(key)) {
                        return false;
                    }

                }    


                for (let i = 0; i < this.components.length; i += 1) {
                    const component = this.components[i];
                    const key = Object.keys(component)[0];

                    data[key] = res.component_state.dropDownComponents[key];

                    // backward compatibility

                    if (typeof(data[key].selectedPDFs[0]) !== 'number') {
                        return false
                    }
                }                

                if (res.component_state.uploadComponents.length > 0) {
                    this.uploadComponents.push(...res.component_state.uploadComponents)
                }
                this.dropDownComponents = data;

                return true;
            }

            return false;

        },
        async getAllComponents() {
            const design_id = this.$route.params.designId;

            const components = await this.fetchData(`/api/components_list/${design_id}/`);

            this.components = components;
        },
        async getComponentOptions() {
            const components = this.components;

            let data = {};
            
            for (let i = 0; i < components.length; i += 1) {
                const component = components[i];
                const key = Object.keys(component)[0];

                if (component[key] == 'optimizer') {
                    continue
                }

                const res = await this.fetchData(`/api/components/${component[key]}/`);

                const name = component[key];
                const isChecked = true;
                const options = res.results;
                let selectedPDFs = [res.results[0].id];

                let moduleMake;
                if (this.modules && this.modules[0] && this.modules[0].make) {
                    moduleMake = this.modules[0].make.toLocaleLowerCase().split(" ");


                    if (name == 'module_certificate' && moduleMake) {
                        for (let j = 0; j < options.length; j += 1) {
                            const option = options[j];
                            const company_name = [option.company_name.toLocaleLowerCase().split(" ")[0]];

                            const found = company_name.some(r=> moduleMake.indexOf(r) >= 0);

                            if (found) {
                                selectedPDFs = [option.id];
                            }
                        }
                    }
                }

                if (this.address.length > 0) {
                    const stringArray = this.address.split(",")
                    const state = stringArray.length > 2 ? stringArray[stringArray.length - 3].trim().toLocaleLowerCase() : undefined;
                    if (name == 'structural_engineer_certificate' && state) {
                        for (let j = 0; j < options.length; j += 1) {
                            const option = options[j];
                            const company_name = [option.location.toLocaleLowerCase()];

                            const found = company_name.some(r=> state.indexOf(r) >= 0);

                            if (found) {
                                selectedPDFs = [option.id];
                            }
                        }
                    }
                }

                data[key] = {
                    name: name,
                    isChecked: isChecked,
                    options: options,
                    selectedPDFs: selectedPDFs,
                }
            }
            this.dropDownComponents = data;
        },
        addNewOption(idx) {
            this.addNewDropdown = true
            this.dropDownComponents[idx].selectedPDFs.push(this.dropDownComponents[idx].options[0].id)
            this.isSavedEnabled = true;
        },
        setDeleteRowIndex(idx) {
            this.isDeleteUploadComponentPopup = true;
            this.uploadComponentsDeleteIdx = idx;
        },
        deleteRow() {
            this.uploadComponents.splice(this.uploadComponentsDeleteIdx, 1);
            this.isSavedEnabled = true;
            this.isDeleteUploadComponentPopup = false;
        },
        setDeleteOption(key, idx) {
            this.dropDownDeleteKey = key;
            this.dropDownDeleteIdx = idx
            this.isDeleteComponentPopup = true;
        },
        deleteOption() {
            this.dropDownComponents[this.dropDownDeleteKey].selectedPDFs.splice(this.dropDownDeleteIdx, 1);
            this.isSavedEnabled = true;
            this.isDeleteComponentPopup = false;
        },
        async fetchModulesAndInverters() {
            const designId = this.$route.params.designId;

            let design
            if (Object.keys(this.design).length > 0) {
                design = this.design;
            } else {
                const response = await API.DESIGNS.FETCH_DESIGN(designId);
                design = response.data
            }

            const inverters = [];
            const modules = [];
            const moduleLinks = [];
            const inverterLinks = [];
            const invalidInverterLinks = [];
            const invalidModuleLinks = [];
            // Jugaad check for s3 links
            const linkCheck = 's3.'

            const panelMap = design.versions.scene.panelMap;
            const inverterElectricalMap = design.versions.scene.inverterElectricalMap;
            // Modules
            for (let i = 0; i < panelMap.length; i += 1) {
                const panel = panelMap[i];

                const moduleMake = panel.moduleProperties.moduleMake;

                const trimmedMake = moduleMake.replace(/\s+/g, "");

                let includes = false;

                for (let j = 0; j < modules.length; j += 1) {
                    const make = modules[j].make.replace(/\s+/g, "");

                    if (trimmedMake === make) {
                        includes = true;
                    }
                }

                if (!includes) {
                    let isValidLink = true;

                    const id = panel.moduleProperties.moduleId;

                    const res = await API.MASTER_DATA_PANEL.FETCH_MASTER_PANEL_BY_ID(id);
                    if (res.data.characteristics.pdf_link) {

                        if (res.data.characteristics.pdf_link.includes(linkCheck)) {
                            moduleLinks.push(res.data.characteristics.pdf_link)
                        } else {
                            invalidModuleLinks.push(res.data.characteristics.pdf_link);
                            this.someDatasheetsMissing = true;
                            isValidLink = false;
                        }
                    }

                    modules.push({
                        make: moduleMake,
                        isValidLink: isValidLink,
                    })
                }
            }
            // Inverter

            const string = inverterElectricalMap.string;

            if (string.length > 0) {
                this.inverterType = 'string';
                for (let i = 0; i < string.length; i += 1) {
                    const stringInverter = string[i];

                    const inverterMake = stringInverter.inverterMake;
                    const inverterManufacturer = stringInverter.inverterManufacturer;

                    let includes = false;
                    for (let j = 0; j < inverters.length; j += 1) {
                        if (inverters[j].make == inverterMake) {
                            includes = true;
                        }
                    }

                    if (!includes) {

                        let isValidLink = true;

                        const id = stringInverter.inverterDatabaseId;

                        if (stringInverter.optimizerMake) {

                            this.inverterType = 'optimizer';

                            this.optimizers.push(stringInverter.optimizerMake);
                        }

                        const res = await API.MASTER_DATA_INVERTER.FETCH_MASTER_INVERTER_BY_ID(id);
                        if (res.data.Source_link) {
                            if (res.data.Source_link.includes(linkCheck)) {
                                inverterLinks.push(res.data.Source_link);
                            } else {
                                this.someDatasheetsMissing = true;
                                isValidLink = false;
                                invalidModuleLinks.push(res.data.Source_link);
                            }
                        }

                        inverters.push({
                            make: `${inverterManufacturer} ${inverterMake}`,
                            isValidLink: isValidLink,
                        })

                    }
                }
            }
            else {

                this.inverterType = 'micro';
                const micro = design.versions.scene.ground.microInverters;

                for (let i = 0; i < micro.length; i += 1) {

                    const microInverter = micro[i]
                    
                    const inverterMake = microInverter.electricalProperties.Make;
                    const inverterManufacturer = microInverter.electricalProperties.Manufacturer;

                    let includes = false;
                    for (let j = 0; j < inverters.length; j += 1) {
                        if (inverters[j].make == inverterMake) {
                            includes = true;
                        }
                    }
                    
                    if (!includes) {
                        let isValidLink = true;


                        if (microInverter.electricalProperties.Source_link) {

                            if (microInverter.electricalProperties.Source_link.includes(linkCheck)) {
                                inverterLinks.push(microInverter.electricalProperties.Source_link);
                            } else {
                                invalidInverterLinks.push(microInverter.electricalProperties.Source_link);
                                this.someDatasheetsMissing = true;
                                isValidLink = false;    
                            }

                        } else {
                            this.someDatasheetsMissing = true;
                            isValidLink = false;  
                        }

                        
                        inverters.push({
                            make: `${inverterManufacturer} ${inverterMake}`,
                            isValidLink: isValidLink,
                        })
                    }
                }
            }

            this.inverters.push(...inverters);
            this.modules.push(...modules);
            this.moduleLinks.push(...moduleLinks);
            this.inverterLinks.push(...inverterLinks);
            this.invalidInverterLinks.push(...invalidInverterLinks);
            this.invalidModuleLinks.push(...invalidModuleLinks);

            if (this.moduleLinks.length === 0) {
                this.modulesCheck = false;
            }

            if (this.inverterLinks.length === 0) {
                this.invertersCheck = false;
            }
        },
        async fetchData(endPoint) {
            try {
                const response = await axios.get(endPoint);
                return response.data;
            }
            catch(e) {
                this.$message({
                    showClose: true,
                    message: "Unexpected Error. Try again",
                    type: "error",
                    center: true
                });
                this.loading = false;
            }

        },
        editRowText() {
            this.editRow.isEditBtnClicked = !this.editRow.isEditBtnClicked;
            if(this.editRow.isEditBtnClicked) {
                this.showTickIcon = true;
                this.showEditIcon = false;
            } else {
                this.showTickIcon = false;
                this.showEditIcon = true;
            }
        },
        async save() {
            this.isSaveRunning = true;
            const design_id = this.$route.params.designId;

            const payLoad = {
                component_state: {
                    dropDownComponents: this.dropDownComponents,
                    uploadComponents: this.uploadComponents,
                }
            };

            // const savingNotification = notificationsAssistant.loading({
            //     title: 'Saving',
            //     message: 'Design is being saved',
            // });

            try {
                const response = await axios.patch(
                    `/api/designs/${design_id}/`,
                    payLoad
                );
                // notificationsAssistant.close(savingNotification);
                // notificationsAssistant.success({
                //     title: 'Save',
                //     message: 'Design is successfully saved',
                // });
                this.$message({
                    showClose: true,
                    message: 'Data successfully saved',
                    type: "success",
                    center: true
                })
                this.isSavedEnabled = false;
                this.isSaveRunning = false;
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: "Data is not saved. Try again",
                    type: "error",
                    center: true
                });
                this.isSaveRunning = false;
                // notificationsAssistant.error({
                //         title: 'Save',
                //         message: 'Design is not saved. Try again',
                //     });

            }

        },
        addUploadEvent() {
            const inputElement = document.getElementById('card_index');

            inputElement.onchange = function (event) {
                const file = event.target.files[0];
            }
        },
        addOptionChangeEvent() {
            serverBus.$on('select-datasheet-option', (data) => {
                this.dropDownComponents[data.key].selectedPDFs[data.index] = data.value;
                this.isSavedEnabled = true;
            })
        },
        async uploadPDF() {
            this.isUploadRunning = true;
            const componentElement = document.getElementById('input-component')
            const makeElement = document.getElementById('input-make')
            const component = componentElement.value;
            const make = makeElement.value;

            if (component.length == 0 || make.length == 0) {
                this.$message({
                        showClose: true,
                        message: "Empty fields. Please add text",
                        type: "error",
                        center: true
                    });

                    if (component.length ==0) {
                        componentElement.classList.add('error');
                    }
                    if (make.length ==0) {
                        makeElement.classList.add('error');
                    }

                    this.isUploadRunning = false;
                    return
            }

            componentElement.classList.remove('error');
            makeElement.classList.remove('error');

            const inputElement = document.getElementById('card_index');
            const file = inputElement.files[0];

            if (!file) {
                this.$message({
                        showClose: true,
                        message: "Empty fields. Please add PDF",
                        type: "error",
                        center: true
                    });
                    this.isUploadRunning = false;

                    return
            }

            if (file.type !== 'application/pdf') {
                this.$message({
                        showClose: true,
                        message: "Invalid file type. Please add PDF",
                        type: "error",
                        center: true
                    });
                    this.isUploadRunning = false;

                    return;
            }

            const formData = new FormData();
            formData.append('company_name', component);
            formData.append( 'make', make);
            formData.append('File', file);

            componentElement.value = '';
            makeElement.value = '';
            this.uploadFileName = 'Upload File'

            // const uploadingNotification = notificationsAssistant.loading({
            //     title: 'Upload',
            //     message: 'Datasheet is being uploaded',
            // });
                try {
                    const response = await axios.post(
                        `/api/component/upload_sheet/`,
                        formData
                    );

                    this.uploadComponents.push(
                        {
                            component: component,
                            make: make,
                            isChecked: true,
                            url: response.data.file_url,
                        }
                    )

                    this.$message({
                        showClose: true,
                        message: 'Datasheet successfully uploaded',
                        type: "success",
                        center: true
                    })

                    this.isSavedEnabled = true;
                    this.isUploadRunning = false;


                    // notificationsAssistant.close(uploadingNotification);
                    // notificationsAssistant.success({
                    //     title: 'Upload',
                    //     message: 'Datasheet is successfully uploaded',
                    // });
                }
                catch (e) {
                    this.$message({
                        showClose: true,
                        message: "Datasheet is not uploaded. Try again",
                        type: "error",
                        center: true
                    });
                    this.isUploadRunning = false;
                    // notificationsAssistant.error({
                    //     title: 'Upload',
                    //     message: 'Datasheet is not uploaded. Try again',
                    // });
                }
        },
        getAllUrls() {
            const urls = [];
            const keys = Object.keys(this.dropDownComponents);


            if (this.modulesCheck) {
                for (let i = 0; i < this.moduleLinks.length; i += 1) {
                    urls.push([this.moduleLinks[i]])
                }
            }

            if (this.invertersCheck) {
                for (let i = 0; i < this.inverterLinks.length; i += 1) {
                    urls.push([this.inverterLinks[i]])
                }
            }
            let isGrouped = false;
            for (let i = 0; i < keys.length; i += 1) {
                const key = keys[i];
                const component = this.dropDownComponents[key];

                if (key == 'Mid Clamp') {
                    const check = 
                        this.dropDownComponents['Rail'] &&
                        this.dropDownComponents['Rail'].isChecked &&
                        component.isChecked;

                    if (check) {
                        const mid = [];
                        const rail = [];
                        isGrouped = true;

                        for (let j = 0; j < component.selectedPDFs.length; j += 1) {
                            const id = component.selectedPDFs[j];

                            component.options.forEach((option) => {
                                if (option.id === id) {
                                    mid.push(option.pdf_link);
                                }
                            })
                        }
                        for (let j = 0; j < this.dropDownComponents['Rail'].selectedPDFs.length; j += 1) {
                            const id = this.dropDownComponents['Rail'].selectedPDFs[j];

                            this.dropDownComponents['Rail'].options.forEach((option) => {
                                if (option.id === id) {
                                    rail.push(option.pdf_link);
                                }
                            })
                        }

                        const length = mid.length < rail.length ? mid.length: rail.length;
                        const sub = mid.length < rail.length ? rail.slice(length, rail.length) : mid.slice(length, mid.length)

                        for (let j = 0; j < length; j ++) {
                            urls.push([mid[j], rail[j]]);
                        }

                        sub.forEach((element) => {
                            urls.push([element])
                        })

                    }
                    else {
                        if (component.isChecked) {
                            for (let j = 0; j < component.selectedPDFs.length; j += 1) {
                            const id = component.selectedPDFs[j];
    
                            component.options.forEach((option) => {
                                if (option.id === id) {
                                    urls.push([option.pdf_link]);
                                }
                            })
                        }
                    }
                    }
                }
                else if (component.isChecked && !(key === 'Rail' && isGrouped)) {
                    for (let j = 0; j < component.selectedPDFs.length; j += 1) {
                        const id = component.selectedPDFs[j];

                        component.options.forEach((option) => {
                            if (option.id === id) {
                                urls.push([option.pdf_link]);
                            }
                        })
                    }
                }
        
            }

            for (let i = 0; i < this.uploadComponents.length; i += 1) {
                if (this.uploadComponents[i].isChecked) {
                    const url = this.uploadComponents[i].url;
                    urls.push([url]);
                }
            }

            return urls;
        },
        async downloadDatasheet() {
            this.isDownloadRunning = true;
            const pdfDoc = await PDFDocument.create();

            const urls = this.getAllUrls();

            if (urls.length == 0) {
                this.$message({
                    showClose: true,
                    message: 'No component selected',
                    type: "error",
                    center: true
                })
                this.isDownloadRunning = false;
                return;
            }

            let error = false;

            for (let i = 0; i < urls.length; i += 1) {
                const url = urls[i];

                try {
                    const mergedPDF = await mergePdfs(url);
                    const embedDoc = await mergePdfPages(mergedPDF);
    
                    for (let j = 0; j < embedDoc.getPageCount(); j += 1) {
                        const [donorPage] = await pdfDoc.copyPages(embedDoc, [j]);
                        pdfDoc.addPage(donorPage)
                    }
                }
                catch(e) {
                    error = true;
                }
            }

            if (error) {
                this.$message({
                    showClose: true,
                    message: 'Some Datasheets are corrupted.',
                    type: "error",
                    center: true
                })
            }


 
            // return

            // for (let i = 0; i < urls.length; i += 1) {

            //     const embedDoc = await PDFDocument.create();

            //     const url = urls[i];

            //     const donorPdfBytes = await fetch(url)
            //         .then((res) =>
            //             res.arrayBuffer());

            //     const donorPdfDoc = await PDFDocument.load(donorPdfBytes);
            //     const pageCount = donorPdfDoc.getPageCount();

            //     for (let j = 0; j < pageCount; j += 1) {
            //         const page = embedDoc.addPage();
            //         const [embeddedPage1] = await embedDoc.embedPdf(donorPdfBytes, [j])
            //         let embeddedPage2;
            //         if (j + 1  < pageCount) {
            //             [embeddedPage2] = await embedDoc.embedPdf(donorPdfBytes, [j + 1])
            //         }

            //         const check1 = findOrientionOfPage(
            //             embeddedPage1.height, 
            //             embeddedPage1.width,
            //             donorPdfDoc.getPage(j).getRotation().angle,
            //             ) == 'portrait'
            //         const check2 = embeddedPage2 &&
            //             findOrientionOfPage(
            //                 embeddedPage2.height,
            //                 embeddedPage2.width,
            //                 donorPdfDoc.getPage(j + 1).getRotation().angle
            //             ) == 'portrait'
        

            //         if (check2 && check1) {
            //             const width = embeddedPage1.width + embeddedPage2.width
            //             page.setWidth(width);

            //             page.drawPage(embeddedPage1, {
            //                 x: 0,
            //                 y: 0,
            //                 xScale: 1,
            //                 yScale: 1,
            //                 opacity: 1,
            //             })
            //             page.drawPage(embeddedPage2, {
            //                 x: embeddedPage1.width,
            //                 y: 0,
            //                 xScale: 1,
            //                 yScale: 1,
            //                 opacity: 1,
            //             })

            //             j += 1

            //         }
            //         else {
            //             const angle = donorPdfDoc.getPage(j).getRotation().angle;
            //             const height = embeddedPage1.height;
            //             const width = embeddedPage1.width;

            //             page.setHeight(height);
            //             page.setWidth(width);
            //             page.setRotation(degrees(angle))
            //             page.drawPage(embeddedPage1, {
            //                 opacity: 1,
            //             })
            //         }

            //     }


            //     for (let j = 0; j < embedDoc.getPageCount(); j += 1) {
            //         const [donorPage] = await pdfDoc.copyPages(embedDoc, [j]);
            //         pdfDoc.addPage(donorPage)
            //     }

            // }
            this.pdf = await pdfDoc.save();

            const blob = new Blob([this.pdf], { type: "application/pdf" });

            try {
                saveAs(blob, `datasheet${this.$route.params.designId}.pdf`);
                this.isDownloadRunning = false;
                return Promise.resolve(true);
            }
            catch (error) {
                this.isDownloadRunning = false;
                return Promise.reject(error);
            }
        },
    },
    watch: {
        universalCheck: {
            handler(val) {
                Object.keys(this.dropDownComponents).forEach((key) => {
                    this.dropDownComponents[key].isChecked = val;
                })
                for (let i = 0; i < this.uploadComponents.length; i += 1) {
                    this.uploadComponents[i].isChecked = val;
                }

                if (this.moduleLinks.length > 0) {
                    this.modulesCheck = val;
                }
                if (this.inverterLinks.length > 0) {
                    this.invertersCheck = val;
                    this.optimiserCheck = val;
                }
            }
        },
    }
}
</script>


<style scoped>
.datasheetContainer {
    position: relative;
    background-color: #e8edf2;
    min-height: 100vh;
    width: 100%;
}

.childContainer {
    width: 80%;
    margin: auto;
    min-width: 1160px;
}

.btnContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 32px;
    margin-bottom: 18px;
}

.datasheetHeading {
    font-size: 28px;
    font-weight: 600;
    color: #1c3366;
}

.dwnldBtn {
    font-size: 18px;
    font-weight: 600;
    width: 210px;
}
.saveBtn {
    font-size: 18px;
    font-weight: 600;
    width: 81px;
}

.tableContainer {
    border: 1px solid #ccc;
    border-radius: 8px;
}

.tableHeader {
    padding: 12px 24px;
    border-top-right-radius: 7px;
    border-top-left-radius: 7px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e9ecf2);
}

.datasheetContainer>>>.el-checkbox {
    display: flex;
    margin-right: 0px;
}

.datasheetContainer>>>.el-checkbox__inner {
    width: 20px;
    height: 20px;
}

.datasheetContainer>>>.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #1c3366;
    border-color: #1c3366;
}

.datasheetContainer>>>.el-checkbox__input.is-checked+.el-checkbox__label {
    color: #222;
}

.datasheetContainer>>>.el-checkbox__label {
    color: #222;
    font-size: 16px;
    white-space: initial;
    padding-left: 12px;
}

.tableHeader>>>.el-checkbox__label {
    color: #1c3366;
    font-weight: 600;
}

.footer>>>.el-checkbox__label {
    color: #222;
    font-size: 14px;
    white-space: initial;
    padding-left: 12px;
}

.datasheetContainer>>>.el-checkbox__inner::after {
    top: 3px;
    left: 7px;
    border-width: 2px;
}

.datasheetContainer>>>.el-checkbox__inner {
    border: 1px solid #777;
}

.commonGridClass {
    display: grid;
    grid-template-columns: 1.3fr 2.5fr 1fr;
    gap: 24px;
    align-items: center;
}

.headerDesc,
.headerAct,
.bodyAct,
.upldImgTxt {
    font-size: 16px;
    font-weight: 600;
    color: #1c3366;
}

.tableBodyContainer {
    padding: 0px 24px;
    background-color: #fff;
    padding-bottom: 42px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}

.tableBody {
    min-height: 55px;
    border-bottom: 1px solid #999;
    padding-top: 8px;
    padding-bottom: 8px;
}

.bodyDesc {
    font-size: 16px;
    font-weight: 500;
    color: #222;
}

.valueOptimizer {
    margin-bottom: 4px;
}

#noDropContainer {
    display: flex;
    flex-direction: column;
}

#noDropBody {
    margin-bottom: 8px;
}

.error {
    border:1px solid red !important
}

.errorMsg {
    font-size: 10px;
    font-weight: 500;
    color: #ff0000;
}

.bodyAct {
    text-decoration: underline;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.bodyAct::before {
    content: url('./assets/img/Subtraction 8.svg');
    width: 22px;
    height: 22px;
    margin-right: 8px;
}

.moreDropdownsContainer {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    margin-bottom: 8px;
}

.editInputs {
    height: 40px;
    padding: 0px 16px;
    border: 1px solid #999;
    border-radius: 4px;
    width: 100%;
}

.editDelContainer {
    display: flex;
    align-items: center;
    gap: 16px;
}

.icon {
    cursor: pointer;
}

.userRow {
    align-items: flex-start;
    padding-top: 16px;
}

.uploadFilesContainer {
    margin-top: 6px;
    margin-bottom: 8px;
}

.uploadFiles {
    font-size: 14px;
    color: #777;
}

.DropdownsRow {
    align-items: flex-start;
}

.conditionDropDown {
    margin-top: 14px;
}

.footerHeading {
    font-size: 16px;
    font-weight: 600;
    color: #777;
    margin-top: 14px;
    margin-bottom: 14px;
}

.footerInputsContainer {
    display: grid;
    grid-template-columns: 1.1fr 1.7fr 0.7fr auto;
    align-items: center;
}

.footerInputs {
    height: 48px;
    padding: 0px 16px;
    border: 1px solid #999;
    border-radius: 0px;
}

.footerInputs:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.upldImgCntnr>input {
    display: none;
}

.positionR {
    position: relative;
}

.labelBtn {
    display: block;
    margin: 0px;
    height: 48px;
    border: 1px solid #999;
    cursor: pointer;
}

.fileType {
    position: absolute;
    bottom: -24px;
    font-size: 14px;
    color: #777;
    left: 14px;
}

.upldImgCntnr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px 0px 16px;
    gap: 16px;
}

.addDSBtn {
    font-size: 18px;
    font-weight: 600;
    height: 48px;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
    width: 160px;
}

.backBtn {
    margin-top: 24px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 30px;
}
</style>
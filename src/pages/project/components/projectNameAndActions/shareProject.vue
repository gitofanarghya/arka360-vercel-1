<template>
    <div id="shareProject">
        <el-dialog
            :visible="shareDialogBoxVisible"
            :close-on-click-modal="false"
            title="Sharing"
            custom-class="dialog-box"
            @close="syncPermissions">
            <el-form
                label-position="top"
                style="text-align: left; padding-bottom: 20px">
                <div style="display: flex;">
                    <el-form-item
                        label="Public"
                        style="margin-bottom: 0; flex-grow: 1; text-align: end; margin-right: 8px;"/>
                    <el-switch
                        v-model="isPublicShared"
                       
                        style="margin: auto"/>
                </div>
                <div
                    class="disclaimer"
                    style="padding-top: 10px; color:#222;display: flex;justify-content: center; text-align:center;">
                    <span v-if="isPublicShared"> This {{isCrmUser() ? 'lead' : 'project'}} is visible to everyone from your organization. 
                     You can turn off the toggle button above to keep it private.
                     </span> 
                    <span v-else> This {{isCrmUser() ? 'lead' : 'project'}} is visible to your managers only. To
                    add more people, add email id below
                    </span>

                </div>
                <el-form-item
                    style="margin-bottom: 10px;">
                    <div
                        style="display: flex; height: 33px; line-height: 0px">
                        <infiniteScrollUsers
                            :user.sync="selectedUser"
                            :isUserListDisabled="isPublicShared"
                            style="flex-grow: 1;"/>
                        <button
                            :disabled="Object.entries(selectedUser).length === 0 &&
                            selectedUser.constructor === Object"
                            class="button-confirm"
                            style="height: 48.2px;
                                    margin: 0;
                                    border-radius: 0px 4px 4px 0px;
                                    padding: 0 15px; backgoundColor: #409EFF"
                            @click.prevent="addUserToSharerList">
                            Add
                        </button>
                    </div>
                    
                </el-form-item>
                <div
                    v-if="sharingMessage && projectPermissionsUsers.length === 1 && !isPublicShared"
                    class="disclaimer">
                    Sharing with {{ projectPermissionsUsers[0].user.first_name }}
                </div>
                <div
                    v-else-if="sharingMessage && projectPermissionsUsers.length > 1 && !isPublicShared"
                    class="disclaimer">
                    Sharing with {{ projectPermissionsUsers[0].user.first_name }} and
                    {{ projectPermissionsUsers.length - 1 }} other(s)
                </div>
                <div
                    v-else-if="sharingMessage  && isPublicShared"
                    class="disclaimer">
                    Sharing with Everyone!
                </div>
                <div
                    v-if="!personHavingAccessList && !isPublicShared"
                    style="display: inline-block;">
                    <a
                        v-if="projectPermissionsUsers.length !== 0"
                        class="hideOrShowList"
                        @click="showUserPermissionList()">
                        Change Permission
                    </a>
                </div>

                <div
                    v-if="personHavingAccessList"
                    style="padding: 13px 0 10px 0; text-align: left; color:#777777"
                    class="disclaimer">
                    Who has access
                    <a
                        class="hideOrShowList"
                        @click="hideUserPermissionList()">
                        Hide List
                    </a>
                </div>      
                <div
                    v-if="personHavingAccessList"
                    style="height: 25vh;  padding: 5px 0 10px 0; text-align: left">
                    <VuePerfectScrollbar class="scroll-area">
                        <el-row
                            v-for="(user, index) in projectPermissionsUsers"
                            :key="user.id"
                            style="text-align: left; padding-top: 1.5vh">
                            <el-col
                                :span="17"
                                style="padding: 0px 10px 0px 10px;
                                color: #303133;
                                line-height: 28px; width: auto;">
                                <div >{{ user.user.first_name }} {{ user.user.last_name }}</div>
                                <div @click="removePersonAccess(index)" class="removeButton" >Remove</div>
                            </el-col>
                            <el-col
                                :span="4"
                                style="text-align: right; width:auto; float: right; padding-right: 10px !important;">
                                <!-- <el-select
                                    v-model="user.permission[0]"
                                    class="permissions"
                                    popper-class="lightDropdown">
                                    <el-option
                                        v-for="(options,
                                                indexPermission) in permissionsAvailable"
                                        :key="indexPermission"
                                        :label="options.label"
                                        :value="options.name"/>
                                </el-select> -->
                                    <el-radio-group v-model="user.permission" size="small">
                                        <el-radio-button label="change">Edit</el-radio-button>
                                        <el-radio-button label="view">View</el-radio-button>
                                    </el-radio-group>
                                <!-- <input id="toggle-on" class="toggle toggle-left" name="toggle" value="false" type="radio" checked>
                                <label for="toggle-on" class="butn">Yes</label>
                                <input id="toggle-off" class="toggle toggle-right" name="toggle" value="true" type="radio">
                                <label for="toggle-off" class="butn">No</label> -->
                            </el-col>
                            <!-- <el-col
                                :span="3"
                                style="text-align: right;">
                                <i
                                    class="el-icon-close"
                                    style="cursor: pointer;
                                    padding: 0px 18px 0 0;
                                    font-size: 14px;
                                    line-height: 26px"
                                    @click="removePersonAccess(index)"/>
                            </el-col> -->
                        </el-row>
                    </VuePerfectScrollbar>
                </div>

                <el-form-item
                    v-if="false"
                    label="Shareable Link"
                    style="margin-bottom: 0px;">
                    <div
                        class="disclaimer"
                        style="padding: 0">
                        Anyone with this link
                        <a
                            href="#"
                            style="text-decoration: none; color: #409eff">
                            can view
                        </a>
                    </div>
                    <el-row>
                        <el-col :span="21">
                            <el-input
                                :disabled="true"
                                placeholder="http://localhost:8080/projectSummary/252"
                            />
                        </el-col>
                        <el-col :span="3">
                            <button
                                class="button-confirm"
                                disabled
                                style="width: 100%">
                                Copy
                            </button>
                        </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item
                    size="small"
                    style="padding-top: 20px;display: flex; justify-content: center">
                    <button
                        class="button-confirm"
                        @click.prevent="onProfileSharingSubmit"
                        :disabled = "!isUpdated"
                        >
                        Share
                    </button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog
            :visible.sync="unsavedChangesDialog"
            title="Confirm"
            width="30%"
            style="padding-top: 5vh;">
            <span>
                Your changes are not being saved. Do you want to save them?
            </span>
            <span
                slot="footer"
                class="confirm-dialog"
                style="text-align: center; display: flex;justify-content: center">
                <button
                    class="button-confirm"
                    @click="onUnsavedChangesDialogConfirm">
                    Confirm
                </button>
                <button
                    class="btn btn-cancel"
                    @click="onProfileSharingCancel">
                    Cancel
                </button>
            </span>
        </el-dialog>
    </div>
</template>


<script>

import { PerfectScrollbar as VuePerfectScrollbar } from 'vue2-perfect-scrollbar';
import API from '@/services/api/';
import infiniteScrollUsers from '@/components/ui/infiniteScrollDropdown/infiniteScrollUsers.vue/';
import { useProjectStore } from '../../../../stores/project';
import { mapState, mapActions } from 'pinia';
import { isCrmUser } from "../../../../utils";


export default {
    name: 'ShareProject',
    components: {
        infiniteScrollUsers,
        VuePerfectScrollbar,
    },
    props: {
        shareDialogBoxVisible: Boolean,
        project_id: {
            default: null,
        }
    },
    data() {
        return {
            sharingMessage: true,
            selectedUser: {},
            currentUserEditPermission: false,
            usersList: [],
            unsavedChangesDialog: false,
            isPublicShared: false,
            personHavingAccessList: false,
            projectPermissionsUsers: [],
            projectPermissionsUsersTemp: [],
            permissionsAvailable: [
                { name: 'change_project', label: 'EDIT' },
                { name: 'view_project', label: 'VIEW' },
            ],
        };
    },
    watch: {
        projectId: function(value) {
              this.fetchProjectPermissions();
        },
        isPublicShared:{
            async handler(val){
                if(this.shareDialogBoxVisible){
                    let patchData = {
                        "is_public_sharing_enabled": val
                    }
                    await API.PROJECTS.PATCH_PROJECT_PERMISSIONS(this.projectId, patchData);
                }
                if(!val){
                    this.fetchProjectPermissions();
                }
                else if(val){
                    this.hideUserPermissionList();
                }
            }
        }
    },
    computed: {
        ...mapState(useProjectStore, {
            isCurrentUserAllowedToEdit: 'GET_USER_PERMISSION',
        }),
    projectId: function() {
        if (this.project_id) {
            return this.project_id
            
        } else {
            return this.$route.params.projectId
        }
    },
    isUpdated(){
        return !_.isEqual(
                    this.projectPermissionsUsers,
                    this.projectPermissionsUsersTemp,
                ) ||
                this.isPublicShared !== this.isPublicSharedTemp;
    },
    },
    mounted() {
           this.fetchProjectPermissions();
    },
    methods: {
        ...mapActions(useProjectStore, [
            'SET_USER_PERMISSION',
        ]),
        isCrmUser,
        async fetchProjectPermissions() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const currUserId = user.user_id;
            try {
                if (this.projectId) {
                    const response = await API.PROJECTS.FETCH_PROJECT_PERMISSIONS(this.projectId);
                    if(response.status== 403){
                        this.SET_USER_PERMISSION(false);
                        return;
                    }
                    const users = JSON.parse(JSON.stringify(response.data));
                    if(Array.isArray(response.data) && response.data.length==0){
                        this.currentUserEditPermission = true;
                        this.isPublicShared = true;
                        this.isPublicSharedTemp = true;
                    }
                    // checking if current user has permission to modify sharing permissions
                    else{
                        users.forEach((item) => {
                            if (
                                item.user.id === currUserId &&
                                item.permission== 'change'
                            ) {
                                this.currentUserEditPermission = true;
                                return true;
                            }
                        });
                    }
                    // slicing current user. Users list is also modified here
                    this.projectPermissionsUsers = users.filter(userTemp => userTemp.user.id !== currUserId);
                    this.projectPermissionsUsersTemp = JSON.parse(JSON.stringify(this.projectPermissionsUsers));
                    // commit it in store
                    this.SET_USER_PERMISSION(this.isPublicShared || this.currentUserEditPermission);
                }
            }
            catch (e) {
                if(e.response.status==403){
                    this.SET_USER_PERMISSION(false);
                }
                console.error(e);
                
            }
        },

        async postSharingPermissionsHelper(
            userPermissionStructuredData,
            projectId,
        ) {
            // fetching all default sharers
            // const postData = {
            //     permissions: userPermissionStructuredData,
            // };
            try {
                // if(this.isPublicShared)
                //     await API.PROJECTS.PATCH_PROJECT_PERMISSIONS(projectId, userPermissionStructuredData);
                // else
                await API.PROJECTS.POST_PROJECT_PERMISSIONS(projectId, userPermissionStructuredData);
                // on successful post sync temp data
                this.projectPermissionsUsersTemp = JSON.parse(JSON.stringify(this.projectPermissionsUsers));
                this.isPublicSharedTemp = this.isPublicShared;

                // resetting selected user
                this.selectedUser = {};
                this.$message({
                    showClose: true,
                    message: 'Permissions Updated Successfully.',
                    type: 'success',
                });
                // commit project sharing status
                this.SET_USER_PERMISSION(this.isPublicShared || this.currentUserEditPermission);
                // hiding the dialog
                this.$emit('update:shareDialogBoxVisible', false);
            }
            catch (e) {
                this.$message({
                    showClose: true,
                    message: 'Error updating permissions. Try again.',
                    type: 'error',
                });
            }
        },

        async updateSharingPermissions(projectId) {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            let updatedUsersIds={};
            let oldUsersIds={}
            let newUsers=[], deletedUsers=[],updatedUsers=[],userPermissionStructuredData;
            if(this.isPublicShared){
                userPermissionStructuredData = {
                    "is_public_sharing_enabled": true
                }
                this.postSharingPermissionsHelper(
                    userPermissionStructuredData,
                    projectId,
                );
                return;
            }
            // store a json having ids of all the updated users (old users + new users - deleted users = updated users)
            for(let i=0;i<this.projectPermissionsUsers.length;i++){
                updatedUsersIds[this.projectPermissionsUsers[i].user.id] = true
            }
            // store a json having ids of all the old users
            for(let i=0;i<this.projectPermissionsUsersTemp.length;i++){
                oldUsersIds[this.projectPermissionsUsersTemp[i].user.id] = true
            }
            for(let i=0;i<this.projectPermissionsUsers.length;i++){
                let id = this.projectPermissionsUsers[i].user.id
                if(!oldUsersIds[id]){   // it means Old user is not having this id, so its a new Id
                    newUsers.push(
                        {
                            "email": this.projectPermissionsUsers[i].user.email,
                            "permission": this.projectPermissionsUsers[i].permission
                        }
                    )
                }
                else{
                    updatedUsers.push({
                        "user_id": this.projectPermissionsUsers[i].user.id,
                        "permission": this.projectPermissionsUsers[i].permission
                    })
                }
            }
            for(let i=0;i<this.projectPermissionsUsersTemp.length;i++){
                let id = this.projectPermissionsUsersTemp[i].user.id
                if(!updatedUsersIds[id]){   // it means Old user is not having this id, so its a new Id
                    deletedUsers.push(
                        {   
                            "user_id": this.projectPermissionsUsersTemp[i].user.id
                        }
                    )
                }
            }
            userPermissionStructuredData = {
                "new_users": [... newUsers],
                "updated_users" : [... updatedUsers],
                "deleted_users" : [... deletedUsers]
            }

            this.postSharingPermissionsHelper(
                userPermissionStructuredData,
                projectId,
            );
        },

        onUnsavedChangesDialogCancel() {
            // resetting the changes
            this.onProfileSharingCancel();

            // hiding the confirm dialog box
            this.unsavedChangesDialog = false;
        },

        onUnsavedChangesDialogConfirm() {
            // saving the changes
            this.updateSharingPermissions(this.projectId);

            // hiding the confirm dialog box
            this.unsavedChangesDialog = false;
        },

        syncPermissions() {
            if (
                !_.isEqual(
                    this.projectPermissionsUsers,
                    this.projectPermissionsUsersTemp,
                ) ||
                this.isPublicShared !== this.isPublicSharedTemp
            ) {
                this.unsavedChangesDialog = true;
            }
            else {
                this.$emit('update:shareDialogBoxVisible', false);
            }

            this.selectedUser = {};
            this.personHavingAccessList = false;
            this.sharingMessage = true;
        },

        // updatedSharers(userRestructuredData) {
        //     this.projectPermissionsUsers.forEach((arrayItem) => {
        //         if (arrayItem.permission.indexOf('view_project') !== -1) {
        //             // view mode
        //             userRestructuredData[0].users.push(arrayItem.id);
        //         }
        //         else {
        //             // edit mode
        //             userRestructuredData[1].users.push(arrayItem.id);
        //         }
        //     });

        //     return userRestructuredData;
        // },

        addUserToSharerList() {
            let doesUserAlreadyExist = false;

            this.projectPermissionsUsers.forEach((item) => {
                if (item.user.id === this.selectedUser.id) {
                    doesUserAlreadyExist = true;
                }
            });

            if (!doesUserAlreadyExist) {
                this.projectPermissionsUsers.push({
                    user: {
                        id: this.selectedUser.id,
                        first_name: this.selectedUser.first_name,
                        last_name: this.selectedUser.last_name,
                        email: this.selectedUser.email,
                        permission: 'view',
                    },
                    permission: 'view',
                });

                this.$message({
                    showClose: true,
                    message:
                        'User successfully added.',
                    type: 'success',
                });

                // resetting input field
                this.selectedUser = {};
            }
            else {
                this.$message({
                    showClose: true,
                    message: 'User already exist in the list. ',
                    type: 'error',
                });
            }
        },

        onProfileSharingSubmit() {
            // update project sharing permissions
            this.updateSharingPermissions(this.projectId);
        },

        onProfileSharingCancel() {
            // reset to last fetched data
            this.projectPermissionsUsers = JSON.parse(JSON.stringify(this.projectPermissionsUsersTemp));
            this.isPublicShared = this.isPublicSharedTemp;
            this.unsavedChangesDialog = false;

            // hiding the dialog
            this.$emit('update:shareDialogBoxVisible', false);
        },

        removePersonAccess(index) {
            this.projectPermissionsUsers.splice(index, 1);
        },

        showUserPermissionList() {
            this.personHavingAccessList = true;
            this.sharingMessage = false;
        },

        hideUserPermissionList() {
            this.personHavingAccessList = false;
            this.sharingMessage = true;
        },
    },
};
</script>

<style lang="scss" scoped>



.butn{
    border: 3px solid #1a1a1a;
    display: inline-block;
    padding: 10px;
    position: relative;
    text-align: center;
    transition: background 600ms ease, color 600ms ease;
}

  input[type="radio"].toggle {
    display: none;
    & + label{
        cursor: pointer;
        min-width: 60px;
        &:hover{
            background: none;
            color: #1a1a1a;
        }
        &:after{
            background: #1a1a1a;
            content: "";
            height: 100%;
            position: absolute;
            top: 0;
            transition: left 200ms cubic-bezier(0.77, 0, 0.175, 1);
            width: 100%;
            z-index: -1;
        }
    }
    &.toggle-left + label {
        border-right: 0;
        &:after{
            left: 100%
        }
    }
    &.toggle-right + label{
        margin-left: -5px;
        &:after{
            left: -100%;
        }
    }
    &:checked + label {
        cursor: default;
        color: #fff;
        transition: color 200ms;
        &:after{
            left: 0;
        }
    }
}
</style>

<style type="text/css" scoped>

    #shareProject >>> .el-radio-button__inner{
    background: #e8edf2;
    }

    #shareProject >>> .el-switch__core{
        width: 32px !important
    }


    #shareProject >>> .el-radio-button__orig-radio:checked + .el-radio-button__inner{
    color: white !important;
    background-color: #409EFF !important;
    }
    #shareProject >>> .el-form-item__label {
        line-height: 28px;
        padding: 0;
        color: #222222 ;
    }

    #shareProject >>> .el-dialog{
        background: #fff;
    }
    #shareProject >>> .confirm-dialog {

        height: 55px;
    }
    #shareProject >>> .confirm-dialog .button-confirm {

        height:40px  !important;
    }

    #shareProject >>> .button-confirm {    
        border: none !important;
        padding: 13px 31px;
        border-radius: 4px;
        background-image: linear-gradient(to bottom, #409eff, #3092f7);
        font-weight: bold;
    }

    #shareProject >>> .button-confirm:disabled{
        color: #999999 !important;
        cursor: not-allowed;
        background-image: linear-gradient(to bottom, #f1f1f1, #ddd) !important;
    }

        

    #shareProject >>>  .btn {
  color: var(--dark);
  background-color: var(--step-0);
  border: 1px solid var(--step-150);
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  -ms-border-radius: 4px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  font-size: var(--f14);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  padding: 0.55rem 1.5rem;
  line-height: 1.42857143;
  user-select: none;
  box-shadow: 0 0 2px 0 var(--step-150); }

   

    #shareProject >>> .btn.btn-cancel {
    margin-top: 5px !important;
    height: 40px !important;
    margin-left: 10px !important;
    background-color: var(--tertiary);
    background-image: linear-gradient(to bottom, #999,#777);
    color: var(--white); }

    #shareProject >>> .el-dialog__body {
        padding: 0 25px !important;
        text-align: center !important;
        word-break: keep-all;
    }
    #shareProject >>> .el-dialog__header {
        /* background-color: #1c3366; */
        background-image: linear-gradient(to bottom,#E8EDF2,#e9ecf2);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        justify-content: space-between;
    }

    #shareProject >>> .el-dialog__title{

     font-weight: 600;
     margin-left: 13px;
      color: #222222 !important;
        }

    #shareProject >>> .el-dialog__close {
        color: #222222 !important;
        }

    .page-header-icons {
        color: #707070;
    }

    .scroll-area {
        height: 100%;
        background-color: #E8EDF2;
        border-radius: 4px;
    }

    .disclaimer {
        display: inline-block;
        padding: 13px 0 20px 0;
        color: #777777;
        /* color: #909399; */
        font-weight: 500;
    }

    .hideOrShowList{
        text-decoration: underline;
        color: #1c3366; 
        cursor: pointer;
        margin-left:6px;
        font-weight: 600;
    }

    .removeButton{
        color:#777777;
        font-size:12px;
        top: -8px; 
        position: relative;
        text-decoration: underline;
        cursor: pointer;
    }


    .el-form-item--small.el-form-item {
        margin-bottom: 0
    }

    .permissions >>> .el-input__inner {
        border: 0px;
        padding-left: 0px;
        padding-right: 0px;
        background-color: #f8f8f8;
    }

    .permissions >>> .el-input__inner {
        height: 28px;
        font-size: 12px;
        border-right: 0px;
        border-radius: 4px 0px 0px 4px;
    }

    .permissions >>> .el-input__suffix {
        left: 50px;
    }

    .permissions >>> .el-input .el-input__suffix .el-input__suffix-inner .el-select__caret {
        
        color : #777777 !important;
        }

    .permissions >>> .el-input__suffix .el-input__suffix-inner .is-reverse {
        padding-top: 0;
    }
     #shareProject >>> .el-dialog {
        border-radius: 8px;
     }
    @media (max-width: 768px) {
        #shareProject >>> .el-dialog {
        width: 90% !important;
    }
        
    }

    
    .permissions >>> .el-select__caret {
        color: #141414;
        font-size: 10px;
    }

    .permissions >>> .el-input__icon {
        line-height: 0;
    }

 
      .el-scrollbar {

         margin-bottom: 8px  !important;
         margin-right: 8px  !important;
     }

      #shareProject >>> .el-select-dropdown {

         height: 80px !important ;
         text-align: center !important;
         align-items: center;
     }

     #shareProject >>>.el-scrollbar .el-select-dropdown__wrap .el-select-dropdown__item .el-select-dropdown__item {

         height: 42px !important ;
         text-align: center !important;
         align-items: center !important;
     }
    
    
     #shareProject >>> .el-dialog__close {
        color: #222222 !important;
        font-weight: 800 !important;
        font-size: 18px !important;
     }

     .button-confirm {
       background-color: #409EFF !important;
       font-size: 16px !important;
       border: none  !important;
       /* height: 40px  !important; */
       
       
    }
    .el-select-dropdown__wrap .el-scrollbar__wrap{
        margin-bottom: 0;
        margin-right: 0;
    }
</style>

<style lang="scss" scoped>

    @import '../../../../styles/pages/project-design-pages';
    @import '../../../../styles/components/button';

</style>

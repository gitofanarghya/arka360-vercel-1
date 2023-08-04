<template>
    <div
        id="help"
        class="navBarRightButtons">

        <el-dropdown trigger="click">
            <span class="el-dropdown-link">
                <button class="navBarIcon iconNavBar-help"/>
            </span>
            <el-dropdown-menu slot="dropdown">

                <el-dropdown-item
                    @click.native="shortcutsDialogVisible = !shortcutsDialogVisible">
                    Shortcuts
                </el-dropdown-item>
                <el-dropdown-item
                    @click.native="toggleChatIcon">
                    {{ chatIconStatus }} Chat Icon
                </el-dropdown-item>
                <el-dropdown-item>
                    <a
                        href="http://help.thesolarlabs.com/"
                        style="text-decoration: none; color: inherit; display: block"
                        target="_blank">
                        Help Docs
                    </a>
                </el-dropdown-item>

            </el-dropdown-menu>
        </el-dropdown>
        <!-- both the dialog boxes here have been appended to the body
        as the navbar is using position sticky -->
        <el-dialog
            :visible.sync="shortcutsDialogVisible"
            append-to-body
            :close-on-click-modal="false"
            title="Shortcuts"
            width="30%">

            <div class="data-summary">
                <p v-if="isVipPowerGazebo"> Gazebo <span class="output"> G </span></p>
                <p> Flat Roof <span class="output"> P </span></p>
                <p> Pitched Roof <span class="output"> R </span></p>
                <p> Draw Face <span class="output"> Shift + F </span> </p>
                <p> Polygon Obstruction <span class="output"> Shift + P </span></p>
                <p> Rectangle Obstruction <span class="output"> Shift + R </span></p>
                <p> Cylinder Obstruction <span class="output"> C </span></p>
                <p> Walkway <span class="output"> W </span></p>
                <p> Safety Line <span class="output"> E </span></p>
                <p> Handrail <span class="output"> H </span></p>
                <p> Property Line <span class="output"> N </span></p>
                <p> Tree <span class="output"> T </span></p>
                <p> Dimension Tool <span class="output"> D </span></p>
                <p> Lasso Tool <span class="output"> L </span></p>
                <p v-if="!isVipPowerGazebo"> Subarray <span class="output"> S </span></p>
                <p v-if="isUSFlagEnabled && !isVipPowerGazebo"> Gazebo <span class="output"> G </span></p>
                <p> Text Box <span class="output"> B </span></p>
                <p v-if="!isVipPowerGazebo"> Fill face the selected Model <span class="output"> F </span></p>
                <p v-if="!isVipPowerGazebo"> Optimize the selected Subarray <span class="output"> O </span></p>
                <p v-if="!isVipPowerGazebo"> Inverter Menu <span class="output"> I </span></p>
                <p> Mirror Image <span class="output"> M </span></p>
                <p> Cancel drawing/placing <span class="output"> Esc </span></p>
                <p> Discard properties changes <span class="output"> Esc </span></p>
                <p> Complete drawing/placing <span class="output"> Enter </span></p>
                <p> Accept change <span class="output"> Enter </span></p>
                <p> Delete selected object <span class="output"> Del </span></p>
                <p> Undo <span class="output"> Ctrl / Cmd + Z </span></p>
                <p> Redo <span class="output"> Ctrl / Cmd + Shift + Z </span></p>
                <p> Save <span class="output"> Ctrl / Cmd + S </span></p>
                <p> Quick Look <span class="output"> Q </span></p>
                <p> X-Ray mode <span class="output"> Press and Hold 'X' </span></p>
                <p> Zoom In <span class="output"> Ctrl / Cmd + Alt + Plus(+) </span></p>
                <p> Zoom Out <span class="output"> Ctrl / Cmd + Alt + Minus(-) </span></p>
                <p> Default Zoom <span class="output"> Ctrl / Cmd + Alt + Zero(0) </span></p>
                <p> 2D mode <span class="output"> Double Press '2' </span></p>
                <p> 3D mode <span class="output"> Double Press '3' </span></p>
                <p> SLD mode <span class="output"> Double Press '4' </span></p>
                <p v-if="!isVipPowerGazebo"> Add Table Mode <span class="output"> A </span></p>
                <p v-if="!isVipPowerGazebo"> Delete Table Mode <span class="output"> Shift + D </span></p>
            </div>

        </el-dialog>

    </div>
</template>

<script>

export default {
    name: 'Help',
    data() {
        return {
            msg: 'I am in help',
            contactDialogVisible: false,
            shortcutsDialogVisible: false,
            chatIconStatus: 'Hide',
            isVipPowerGazebo: false,
        };
    },
    async mounted() {
        this.isVipPowerGazebo = await this.setGazeboStatus();
    },
    computed: {
        isUSFlagEnabled(){
            const user = JSON.parse(localStorage.getItem("user")) || {};
            return user.isUSFlagEnabled;
        },
    },
    methods: {
        toggleChatIcon() {
            const chatIconVisibility = document.getElementsByClassName('intercom-launcher')[0] ? document.getElementsByClassName('intercom-launcher')[0] : document.getElementsByClassName('intercom-launcher-frame')[0];
            // for toggling hide/show word
            if (this.chatIconStatus === 'Hide') {
                this.chatIconStatus = 'Show';
                chatIconVisibility.style.display = 'none';
            }
            else {
                this.chatIconStatus = 'Hide';
                chatIconVisibility.style.display = 'block';
            }
        },
        async setGazeboStatus() {
            const user = JSON.parse(localStorage.getItem("user")) || {};
            let organisationId = user.organisation_id;
            let responseData = JSON.parse(localStorage.getItem('organisation')) || {};
            if(!(Object.keys(responseData).length && responseData.hasOwnProperty('vip_for_power_gazebo'))){
                responseData = (await API.ORGANISATION.FETCH_ORGANISATION(organisationId)).data;
            }
            return Promise.resolve(responseData.vip_for_power_gazebo);
        },
    },
};
</script>

<style type="text/css" scoped>

.modalBox {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}

.dataModalBox {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    font-size: 1.2vw;
    margin-top: 6px;
}

.output {
    font-size: 1.1vw;
    color: black;
    box-sizing: content-box;
    display: block;
    float: right;
    white-space: nowrap;
    text-overflow: ellipsis !important;
}

.data-summary p {
    color: black;
    text-align: left;
    font-size: 1.1vw;
    font-weight: 100;
    overflow: hidden;
    text-overflow: ellipsis !important;
    padding-bottom: 2%;
    padding-top: 4px;
    border-bottom: 1px solid lightgray;
}

.navBarRightButtons {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.navBarRightButtons .navBarIcon {
    font-size: 1.25vw;
    border: none;
    background-color: inherit;
    color: white;
}
button {
    padding: 0px;
    cursor: pointer;
}
button:focus {
    outline: none;
}

.data-summary {
    max-height: 75vh;
    overflow: hidden;
    overflow-y: scroll;
    margin-right: -10px;
    padding-right: 10px;
}

.el-dialog__wrapper >>> .el-dialog {
  min-width: 450px;
}

@media only screen and (max-width: 500px) {
  .el-dialog__wrapper >>> .el-dialog {
    border-radius: 16px;
    min-width: 90VW;
  }
}
</style>

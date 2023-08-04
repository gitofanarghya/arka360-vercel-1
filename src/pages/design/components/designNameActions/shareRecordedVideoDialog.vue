<template>
    <el-dialog
        id="shareVideoDialog"
        :close-on-click-modal="false"
        :visible.sync="isShareVideoDialogVisible"
        @close="onCancelShareVideoDialog"
        width="35em"
        center>
        <div class="share-body">
            <div class="paragraph">
                Your design video is ready. You can share & download the video by clicking any of the buttons below.
                <br/><br/>
                The video will be available for the next 7 days only.
            </div>
            <div class="button-group">
                <el-button class="share-modal-button" @click="shareVideoLinkOnWhatsApp">
                    <div class="share-modal-button-inner">
                        Share via WhatsApp&nbsp;
                        <span class="icon">
                            <img src="../../assets/img/whatsapp.svg" width="30" alt="Video" />
                        </span>
                    </div>
                </el-button>
                <el-button class="share-modal-button" @click="shareVideoLinkOnEmail">
                    <div class="share-modal-button-inner">
                        Share via email&nbsp;
                        <span class="icon">
                            <img src="../../assets/img/mail.svg" width="30" alt="Video" />
                        </span>
                    </div>
                </el-button>
            </div>
            <div class="button-group">
                <el-button class="share-modal-button" @click="downloadRecordedVideo">
                    <div class="share-modal-button-inner">
                        Download Video&nbsp;
                        <span class="icon">
                            <img src="../../assets/img/download.svg" width="30" alt="Video" />
                        </span>
                    </div>
                </el-button>
                <el-button class="share-modal-button" @click="copyLinkToRecordedVideo">
                    <div class="share-modal-button-inner">
                        Copy link&nbsp;
                        <span class="icon">
                            <img src="../../assets/img/copy.svg" width="30" alt="Video" />
                        </span>
                    </div>
                </el-button>
            </div>
        </div>
        <!-- <span slot="footer" class="dialog-footer">
            <el-button type="primary">
                <div class="share-modal-button-inner">
                    Record Again&nbsp;
                    <span class="icon">
                        <img src="../../assets/img/video-white.svg" width="30" alt="Video" />
                    </span>
                </div>
            </el-button>
        </span> -->
    </el-dialog>
</template>

<script>
export default {
    name: "ShareRecordedVideoDialog",
    props: {
        isShareVideoDialogVisible: {
            type: Boolean,
            default: false,
        },
        videoLink: {
            type: String,
            default: ""
        }
    },
    methods: {
        onCancelShareVideoDialog() {
            this.$emit("update:isShareVideoDialogVisible", false);
        },

        copyLinkToRecordedVideo() {
            if (!navigator.clipboard) {
                this.$message({
                    showClose: true,
                    message: "Unable to copy link.",
                    type: "error",
                    center: true
                });
                return
            }
            navigator.clipboard.writeText(this.videoLink).then(() => {
                this.$message({
                    showClose: true,
                    message: "The link to the video has been copied.",
                    type: "success",
                    center: true
                });
            })
        },

        shareVideoLinkOnWhatsApp() {
            let textString = this.videoLink
            let textStringWhatsApp = `Check out the recorded video here: ${textString}`
            let encodeText = encodeURIComponent(textStringWhatsApp);
            let shareString = `https://api.whatsapp.com/send?text=${encodeText}`;
            window.open(shareString);
        },

        shareVideoLinkOnEmail() {
            let emailSubject = "Video of Solar Panel Design"
            let emailBody = `Check out the video of solar panel design here: ${this.videoLink}`
            window.location.href = `mailto:user@example.com?subject=${emailSubject}&body=${emailBody}`
        },

        downloadRecordedVideo() {
            var link = document.createElement("a")
            link.href = this.videoLink
            link.click()
        },
    }
}
</script>

<style scoped>
#shareVideoDialog >>> .el-dialog {
    border-radius: 10px;
    width: 560px !important;
}

#shareVideoDialog >>> .el-dialog__header {
    background-color: white !important;
    border-radius: 10px;
    height: 48px;
    margin-bottom: 0px;
}

#shareVideoDialog >>> .el-dialog__headerbtn{
    font-size: 24px;
}

#shareVideoDialog >>> .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-weight: 600;
}

#shareVideoDialog >>>  .el-dialog__headerbtn:focus .el-dialog__close, #shareVideoDialog >>>  .el-dialog__headerbtn:hover .el-dialog__close {
    color: #222 !important;
}

#shareVideoDialog >>> .el-dialog__body {
    word-break: initial !important;
    padding: 0px 40px 32px 40px !important;
}

#shareVideoDialog >>> .el-dialog__footer {
    border-top-style: ridge;
}

.share-body {
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
}

.share-modal-button {
    flex: 1;
    margin: 0.5em;
}

.button-group {
    display: flex;
}

.share-modal-button > span {
    display: flex;
    align-items: center;
}

.share-modal-button-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: #222;
}

.paragraph{
    font-size: 16px;
    color: #222;
    line-height: 1.5;
    text-align: center;
    margin-bottom: 24px;
}

#shareVideoDialog >>> .el-button{
    border-color: #999;
}

#shareVideoDialog >>> .el-button:hover {
    border-color: #999;
    background-color: #ecf5ff;
}

@media (max-width: 600px) {
    #shareVideoDialog >>> .el-dialog {
        width: 93vw !important;
    }

    .button-group {
        flex-direction: column;
    }

    #shareVideoDialog >>> .el-dialog__body {
    padding: 0px 24px 32px 24px !important;
}
}
</style>
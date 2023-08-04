<template>
  <div class="card" v-loading="loadingComments">
    <div class="card_header flex_header">
      <div class="heading">
        <h4>COMMENTS</h4>
      </div>
    </div>
    <div class="comments-not-available" v-if="arkaProjectDoesNotExist">
      Comments not available
    </div>
    <div class="cmntsContainer" v-else>
      <div class="fixHeight">
        <div v-if="!comments.length" style="color: gray; text-align: center">No comments</div>
        <div class="cmntContainer" v-for="comment in comments" :key="comment.ID" v-loading="comment.isProcessing">
          <p class="nameDate">
            {{comment.commented_by.fullName}} |
            <span :title="new Date(comment.created_at)">
              {{getTimeDiff(comment.created_at)}}
            </span>
          </p>
          <div v-if="!comment.isBeingEdited">
            <p class="cmntCont">
              {{comment.body}}
            </p>

            <div class="iconsCmnts">
              <img src="./../../../assets/drop/Group 1783.svg"
                class="editIcon"
                @click="editCommentStart(comment)"
              />
              <img
                src="./../../../assets/drop/Group 1782.svg"
                class="deleteIcon"
                @click="deleteComment(comment)"
              />
            </div>
          </div>
          <div v-else style="display: flex">
            <el-input
              v-model="editCommentBody"
              >
            </el-input>
            <el-button slot="append" type="primary" plain style="margin-left: 10px" @click="editComment(comment)">Edit</el-button>
            <el-button slot="append" type="danger" plain @click="comment.isBeingEdited = false">Cancel</el-button>
          </div>
        </div>
      </div>
      <div class="inputContainer">
        <el-input class="new-comment-input" placeholder="Add comment here..." v-model="input"></el-input>
        <div class="btnContainer">
          <el-button class="cnclBtn">Cancel</el-button>
          <el-button type="primary" @click="postComment"
            :loading="postingComment">
            Add Comment
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import API from '@/services/api/';

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed/1000) + ' seconds ago';   
  }

  else if (elapsed < msPerHour) {
    return Math.round(elapsed/msPerMinute) + ' minutes ago';   
  }

  else if (elapsed < msPerDay ) {
    return Math.round(elapsed/msPerHour) + ' hours ago';   
  }

  else if (elapsed < msPerMonth) {
    return Math.round(elapsed/msPerDay) + ' days ago';   
  }

  else if (elapsed < msPerYear) {
    return Math.round(elapsed/msPerMonth) + ' months ago';   
  }

  else {
    return Math.round(elapsed/msPerYear ) + ' years ago';   
  }
}

export default {
  name: "comments",

  data() {
    return {
      loadingComments: true,
      postingComment: false,
      arkaProjectDoesNotExist: false,

      input: "",
      editCommentBody: "",
      projectId: this.$route.params.projectId,
      comments: []
    };
  },

  async created() {
    let resp
    try {
      resp = await API.ARKA.FETCH_COMMENTS(this.projectId)
    } catch (e) {
      console.error(e)
      this.arkaProjectDoesNotExist = false
      this.loadingComments = false
      return
    }
    let respData = await resp.json()
    let comments = respData.message
    if (!respData.success) {
      // Corresponding project on arka should exist for the given tsl project id
      this.arkaProjectDoesNotExist = true
    } else {
      if (comments) {
        comments.forEach(comment => {
          this.addDefaultFieldsForComment(comment)
          this.comments.push(comment)
        });
      }
    }

    this.loadingComments = false
  },

  methods: {
    getTimeDiff(cTime) {
      let cDate = new Date(cTime)
      let diff = timeDifference(new Date(), cDate)
      return diff
    },

    addDefaultFieldsForComment(comment) {
      comment.isBeingEdited = false
      comment.isProcessing = false
    },

    async postComment() {
      this.postingComment = true

      let postData = {
        tsl_project_ID: this.projectId,
        scope: "project",
        body: this.input
      }
      let resp = await API.ARKA.POST_COMMENT(postData)
      let respData = await resp.json()

      let newComment = respData.message
      this.addDefaultFieldsForComment(newComment)
      this.comments.unshift(newComment)

      this.input = ''
      this.postingComment = false
    },

    async deleteComment(comment) {
      comment.isProcessing = true

      let resp = await API.ARKA.DELETE_COMMENT(comment.comment_ID)
      let respData = await resp.json()
      if (respData.success) {
        let comments = this.comments
        let comm = comments.find(el => el.comment_ID == comment.comment_ID)
        let ind = comments.indexOf(comm)
        comments.splice(ind, 1)
      }

      comment.isProcessing = false
    },

    editCommentStart(comment) {
      this.editCommentBody = comment.body;
      this.comments.forEach(comm => comm.isBeingEdited = false)
      comment.isBeingEdited = true
    },

    async editComment(comment) {
      comment.isProcessing = true

      let putData = {
        body: this.editCommentBody
      }
      let resp = await API.ARKA.EDIT_COMMENT(comment.comment_ID, putData)
      let respData = await resp.json()

      if (respData.success) {
        let newComment = respData.message
        let ind = this.comments.indexOf(comment)
        this.addDefaultFieldsForComment(comment)
        this.comments.splice(ind, 1, newComment)
      }

      comment.isProcessing = false
    },
  }
};
</script>
  
  <style scoped>
.card {
  border: 1px solid var(--step-100);
  border-radius: 12px;
  background: var(--white);
}
.card .card_header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  padding: 16px 16px 16px 24px;
  border-radius: 12px 12px 0 0;
  height: 48px;
}

.card .card_header .heading h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
}

.fixHeight{
  max-height: 500px;
  overflow: hidden;
  overflow-y: scroll;
  padding: 24px 24px 0px 24px;
  margin-bottom: 24px;
}

.cmntsContainer {
  word-break: break-word;
}

.cmntContainer {
  padding-bottom: 16px;
  border-bottom: 1px solid #ccc;
  margin-bottom: 24px;
}

.nameDate {
  font-size: 16px;
  font-weight: normal;
  color: #777;
  margin-bottom: 8px;
}

.cmntCont {
  font-size: 16px;
  color: #222;
  line-height: 1.4;
}

.iconsCmnts {
  margin-top: 16px;
  text-align: end;
}

.deleteIcon,
.editIcon {
  width: 24px;
  cursor: pointer;
}

.deleteIcon {
  margin-left: 16px;
  margin-right: 8px;
}

.new-comment-input >>> .el-input__inner {
  color: #222;
  height: 56px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #e8edf2;
  font-size: 16px;
}

.inputContainer{
  padding: 0px 24px 24px 24px;
}

.btnContainer {
  margin-top: 16px;
  text-align: end;
}

.card >>> .el-button {
  font-size: 16px;
}

.cnclBtn {
  border: 1px solid #777;
}

.comments-not-available {
  text-align: center;
  color: lightgray;
  font-size: 2em;
  padding: 2em;
}
</style>
  
  
  
  
  
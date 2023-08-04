<template>
  <div class="parentContainer">
    <div class="btnContainer">
      <el-button
        type="primary"
        class="addBtn"
        @click="AddFaqPopup()"
        >Add FAQ</el-button
      >
    </div>

    <div class="container" v-if="this.frequentlyAskedQuestions.length">
      <div class="FAQcontainer"  v-for="(faq,index) in frequentlyAskedQuestions" :key="index" :id="index">
        <div class="flexQuesContainer">
          <p class="quesSign">Q.</p>
          <p class="ques">{{faq.question}}</p>
        </div>
        <div class="flexAnsContainer">
          <p class="ansSign">A.</p>
          <p class="answer">{{faq.answer}}</p>
        </div>
        <div class="flexIcon">
          <el-tooltip
            class="item"
            effect="dark"
            content="Edit"
            placement="top-start"
          >
            <i class="icon edit-alt" :id="index" @click="EditFaqPopup($event)"/>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Delete"
            placement="top-start"
          >
            <i class="icon delete-alt" :id="index" @click="DeleteFaqPopup($event)"/>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="emptyContainer" v-else>
      <p class="emptyContent">
        You will be able to add FAQ page to you sales proposal for your
        customers. Click 'Add FAQ' button above to add a FAQ.
      </p>
    </div>

    <AddFAQPopup
      v-if="isAddFaqPopupVisible"
      :isAddFaqPopupVisible.sync="isAddFaqPopupVisible"
      :mode = "mode"
      :frequentlyAskedQuestions = "frequentlyAskedQuestions"
      :index = "index"
    />
    <DeleteFAQPopup
      :isDeleteFaqPopupVisible="isDeleteFaqPopupVisible"
      @cancelDelete="isDeleteFaqPopupVisible = false"
      :frequentlyAskedQuestions = "frequentlyAskedQuestions"
      :index = "index"
    />
  </div>
</template>

<script>
import AddFAQPopup from "./addFAQPopup.vue";
import DeleteFAQPopup from "./deleteFAQPopup.vue";

export default {
  name: "faqsOrg",
  components: {
    AddFAQPopup,
    DeleteFAQPopup,
  },

  mounted() {
    this.FAQSize();
  },

  props : {
    frequently_asked_questions : "",
  },

  data() {
    return {
      isAddFaqPopupVisible: false,
      isDeleteFaqPopupVisible: false,
      frequentlyAskedQuestions : [],
      mode : "",
      index : ""
    };
  },

  methods : {
    AddFaqPopup() {
      this.index=this.frequentlyAskedQuestions.length;
      this.mode='add';
      this.isAddFaqPopupVisible = true;
    },
    EditFaqPopup(event) {
      this.mode='edit';
      this.index= event.currentTarget.id;
      this.isAddFaqPopupVisible = true;
    },
    DeleteFaqPopup(event) {
      this.index = event.currentTarget.id;
      this.isDeleteFaqPopupVisible = true;
    },
    FAQSize() {
      this.frequentlyAskedQuestions = (this.frequently_asked_questions === null ? [] : this.frequently_asked_questions);
    },
  }
};
</script>

<style scoped>
.btnContainer {
  text-align: end;
  margin-top: 8px;
}

.container {
  margin-top: 24px;
  overflow: hidden;
  overflow-y: scroll;
  max-height: 64vh;
}

.FAQcontainer {
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
}

.flexQuesContainer,
.flexAnsContainer {
  display: flex;
}

.flexQuesContainer {
  margin-bottom: 8px;
}

.quesSign,
.ansSign {
  margin-right: 24px;
  line-height: 1.5;
}

.ques,
.answer {
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.quesSign,
.ques {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.ansSign,
.answer {
  font-size: 16px;
  color: #777777;
}

.flexIcon {
  margin-top: 10px;
  margin-left: 34px;
  display: flex;
  align-items: center;
}

.edit-alt {
  font-size: 34px;
  color: #777777;
  margin-right: 8px;
  cursor: pointer;
}

.delete-alt {
  font-size: 26px;
  color: #777777;
  cursor: pointer;
}

.emptyContainer {
  margin-top: 24px;
  overflow: hidden;
  height: 64vh;
  width: 100%;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.emptyContent {
  font-size: 16px;
  color: #222;
  line-height: 1.5;
  width: 550px;
  word-break: break-word;
  text-align: center;
}

@media (max-width: 500px) {
  .FAQcontainer {
    padding: 16px;
  }

  .quesSign,
  .ansSign {
    margin-right: 16px;
  }

  .flexIcon{
    margin-left: 22px;
  }
}
</style>

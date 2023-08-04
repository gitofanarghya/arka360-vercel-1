<template>
  <div class="chat-container">
    <transition name="chat-slide">
      <div v-show="isChatOpen" class="chat-box">
        <div class="chat-content">
          asghsdaghsdgahsgadhgdashgsdahghdsgahgdhghsadgjhg
          <slot name="body">sdfdsfdsf </slot>
          <!-- Chat content goes here -->
        </div>
      </div>
    </transition>
    <div
      class="chat-footer"
      :class="{ 'chat-footer-open': isChatOpen }"
      @click="toggleChat"
    >
      <div>
        <el-row class="container-heading">
          <el-col :span="12" class="left-content">Chat</el-col>
          <el-col :span="12" class="right-content">
            {{ isChatOpen ? "close" : "open" }}
          </el-col>
        </el-row>
      </div>
      <!-- <span>Click here to {{ isChatOpen ? "close" : "open" }} chat</span> -->
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isChatOpen: false,
    };
  },
  methods: {
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
    },
  },
};
</script>

<style scoped>
.chat-container {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.chat-footer {
  position: fixed;
  bottom: 0;
  /* left: 0; */
  right: 0;
  background-color: #f0f0f0;
  /* display: flex;
  align-items: center; */
  cursor: pointer;
  transition: bottom 0.5s;
  z-index: 999;

  width: 40%;
  margin-right: 2rem;
}

.chat-footer-open {
  bottom: 55vh;
  border-radius: 12px 12px 0px 0px;
}
.container-heading {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 1rem;
}
.left-content {
  display: flex;
  justify-content: left;
}
.right-content {
  display: flex;
  justify-content: right;
}

.chat-box {
  position: fixed;
  bottom: 0;
  /* left: 0; */
  right: 0;
  top: 40vh;
  background-color: #ffffff;
  z-index: 998;
  width: 40%;
  margin-right: 2rem;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: top 0.3s;
}

.chat-slide-enter,
.chat-slide-leave-to {
  top: 80vh;
}
</style>

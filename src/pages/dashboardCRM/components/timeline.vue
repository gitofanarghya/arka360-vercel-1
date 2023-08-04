<template>
    <div class="body">
      <div id="header">
        <h3>Activities from Management</h3>
        <button class="view-all-button" @click="showAll = !showAll">
          {{ showAll ? 'View Less' : 'View All' }}
        </button>
      </div>
  
      <div class="timeline" id="timelineitem">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in displayedActivities"
            :key="index"
            :size="activity.size"
            :color="activity.color"
            :icon="activity.icon"
            placement="bottom"
          >
            <div class="timeline_body">
              <div class="link">
                <p class="date">{{ formatDate(activity.timestamp) }}</p>
                <a href="" style="text-decoration: none; color: deepskyblue;">{{ activity.content }}</a>
              </div>
              <div class="time">
                <p>{{ formatTime(activity.timestamp) }}</p>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </template>
  

<script>
export default {
    data() {
        return {
            showAll: false,
            activities: [
                {
                    id: 1,
                    content: 'Update of calendar events & Added new Events in next week.',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'black',
                    icon: 'el-icon-s-order',
                    size:'large'
                },
                {
                    id: 2,
                    content: 'New Theme for Spruka Website completed',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'deepskyblue',
                    icon:'el-icon-s-order'
                },
                {
                    id: 3,
                    content: 'Created a New task today',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'deepskyblue',
                    icon:'el-icon-s-order'
                },
                {
                    id: 4,
                    content: 'New member addreas gurrero added today to AI Summit',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'deepskyblue',
                },
                {
                    id: 5,
                    content: '32 New People Joined summit',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'deepskyblue',
                },
                {
                    id: 6,
                    content: 'Neon Tarly added Robert Bright to AI sunmmit project.',
                    timestamp: '2023-04-20T05:11:50',
                    color: 'deepskyblue',
                },
                {
                    id: 7,
                    content: 'Replied to new-support request',
                    timestamp: '2023-04-20T19:11:50',
                    color: 'deepskyblue',
                },
            ],
        };
    },
    computed: {
    displayedActivities() {
      if (this.showAll) {
        return this.activities;
      } else {
        return this.activities.slice(0, 3);
      }
    },
  },
    methods: {
        formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  },
  formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    let period = '';

    if (hours >= 12) {
      period = 'PM';
      if (hours > 12) {
        hours -= 12;
      }
    } else {
      period = 'AM';
      if (hours === 0) {
        hours = 12;
      }
    }

    return `${hours}:${minutes} ${period}`;
  },
        // getButtonIcon(id) {
        //     // Return different icons based on the activity id
        //     switch (id) {
        //         case 1:
        //             return 'el-icon-edit'; // Example icon
        //         case 2:
        //             return 'el-icon-share'; // Example icon
        //         case 3:
        //             return 'el-icon-delete'; // Example icon
        //         default:
        //             return 'el-icon-info'; // Example icon
        //     }
        // },
    },
};
</script>
  

  
<style scoped>
#timelineitem>>>.el-timeline-item__node{
    width: 20px;
    height: 20px;
}
#timelineitem>>>.el-timeline-item__tail{
    position: absolute;
    left: 7px;
    height: 100%;
    border-left: 3px dashed black
}
.date{
    color: rgb(21, 177, 21);
    width: 70px;
    border: 1px solid black;
    border-radius: 6px;
    padding: 5px;
    text-align: center;
    position: absolute;
    left: -80px;
}

.timeline_body {
    display: flex;
    justify-content: space-between;
}
.timeline{
    padding-left: 90px;
    padding-top: 20px;
}
#header {
    text-decoration: none;
    display: flex;
    justify-content: space-between;
    padding-left: 10px
}
</style>  
<template>
    <div class="overlapping-avatars">
      <el-tooltip class="avatar-tooltip" effect="dark" :content="tooltipText" placement="top">
        <div v-for="(collaborator, index) in displayedCollaborators" :key="index" class="avatar-wrapper" :style="avatarStyle(index)">
          <el-avatar :size="index === 2 && showPlusTwoIndicator ? 'small' : 'medium'">
            {{ avatarText(collaborator, index) }}
          </el-avatar>
        </div>
      </el-tooltip>
    </div>
  </template>
  
  <script>
  export default {
    name: 'OverlappingAvatars',
    props: {
      collaborators: {
        type: Array,
        required: true,
      },
    },
    computed: {
      tooltipText() {
        // Create a comma-separated string of all collaborator names
        return this.collaborators.map(collaborator => collaborator.name).join(', ');
      },
      displayedCollaborators() {
        // Return the collaborators to be displayed (up to 3)
        if (this.collaborators.length <= 2) {
          return this.collaborators;
        } else {
          return this.collaborators.slice(0, 3);
        }
      },
      showPlusTwoIndicator() {
        // Determine whether to show the "+2" indicator
        return this.collaborators.length > 3;
      },
    },
    methods: {
      avatarStyle(index) {
        // Calculate the overlapping position for each avatar
        const offset = 10; // Adjust this value to control the overlap amount
        const left = index * offset;
        return `left: ${left}px`;
      },
      avatarText(collaborator, index) {
        // Determine the text to be displayed in each avatar
        if (index === 2 && this.showPlusTwoIndicator) {
          const remainingCount = this.collaborators.length - 2;
          return `+${remainingCount}`;
        } else {
          return collaborator.name.charAt(0);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .overlapping-avatars {
    display: inline-block;
  }
  
  .avatar-tooltip {
    display: inline-block;
    position: relative;
  }
  
  .avatar-wrapper {
    display: inline-block;
  }
  </style>
  
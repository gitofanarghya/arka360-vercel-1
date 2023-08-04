<template>
        <el-dialog
        class="crm-notification-dialog-wrapper"
        :visible.sync="$props.isVisible"
        :modal-append-to-body="isModal"
        :show-close="false"
        @close="handleClose"
        width="30%"
        custom-class="crm-notification-dialog">
        <div style="height: 100%;">
            <div class="header-div">
                <div class="header-notification">Notifications</div>
                    <router-link class="header-more" :to="{ name: 'notifications' }"><span @click="handleClose">See all</span></router-link>
                    <div class="header-right"><span style="margin-right: 0.5rem;">Unread Only</span>
                        <el-switch :width="32" v-model="unreadOnly"></el-switch>
                    </div>
                </div>
                <div class="tabs-div">
                    <div @click="handleTabs('direct')" :class="[activeTab === 'direct' ? 'tabs-active' : 'tabs-inactive']">
                        Direct
                    </div>
                    <div @click="handleTabs('collab')" :class="[activeTab === 'collab' ? 'tabs-active' : 'tabs-inactive']">
                        Collaborators
                    </div> 
                    <div class="tabs-end" @click="handleReadAll">Mark all as read</div>
                    <!-- <el-tabs v-model="activeTab" @tab-click="">
                        <el-tab-pane label="Direct" name="direct">User</el-tab-pane>
                        <el-tab-pane label="Collaborators" name="collaborators">Config</el-tab-pane>
                    </el-tabs> -->
                </div>
                <div class="notification-cards">
                    
                    <NotificationCards 
                    :notificationsList="$props.notificationsList" 
                    @handleClick="handleClick"
                    :maxWidth="'250px'"
                    />
                    <!-- <NotificationCards v-for="notification in $props.notifications" :key="notification.id" :info="notification" v-show="!unreadOnly"/>
                        <NotificationCards v-for="notification in computedUnread" :key="notification.date_obj" :info="notification" v-show="unreadOnly"/> -->
                        <div class="footer" v-show="handleChange">
                            <div style="position: relative;">
                                <span class="footer-img">
                                    <img src="../../assets/img/notifBellDeny.svg" alt="bell-deny" height="20.35px" width="19.76px">
                                </span>
                                <span class="footer-left-text">That's all your notifications from last week</span>
                            </div>
                            <span class="footer-right">
                                See older notifications
                            </span>
                        </div>
                    </div>
            </div>
        </el-dialog>
</template>
<script>
import NotificationCards from './NotificationCards.vue';
export default {
    name: 'NotificationPopUp',
    components: {
        NotificationCards,
    },
    props: {
        isVisible: {
            type: Boolean,
            default: false,
        },
        notificationsList: {
            type: Array,
            default: []
        },
        isModal: {
            type: Boolean,
            default: true,
        }
        },
        data(){
            return {
                activeTab: 'direct',
                unreadOnly: false,
                unreadNotifications: [],
                showFooter: true,
            }
        },
        computed: {
            computedUnread(){
                // let filteredArr = this.$props.notifications.filter(e => e.isRead === false)
                // return filteredArr
            },
            handleChange(){
                if(this.unreadOnly){
                    return this.checkLength(this.unreadOnly)
                }else{
                    return this.checkLength(this.unreadOnly)
                }
            },
        },
        methods: {
            handleClick(value){
                this.$emit('openNotification', value)
            },
            handleReadAll(){
                this.$emit('handleReadAll')
            },
            getUnread(){
                // let filteredArr = this.$props.notifications.filter(e => e.isRead === false)
                // return filteredArr
            },
            handleClose(){
                this.$emit('closeNotification')
            },
            handleTabs(tab){
                this.activeTab = tab
                this.$emit('switchTabs', this.activeTab)
            },
            
            checkLength(bool){
                if(bool){
                    let filteredArr = this.$props.notificationsList.filter(e => e.isRead === false)
                    if(filteredArr.length > 15){
                        return true;
                    }else{
                        return false
                    }
                }else{
                    if(this.$props.notificationsList.length > 15){
                        return true
                    }else{
                        return false
                    }
                }
            }
        },
        created(){
        }
    }
</script>
<style scoped>
.header-div{
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 15px;
    justify-content: flex-start;
    align-items: center;
}
.header-notification{
    color: #222222; 
    font-size: 16px; 
    font-weight: 600;
}
.header-more{
    font-size: 14px;
    font-weight: 500;
    color: #409EFF;
    cursor: pointer;
}
.header-right{
    margin-left: auto;
}
.tabs-div{
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #CCCCCC;
    cursor: pointer;
}
.tabs-end{
    margin-left: auto;
    font-size: 14px;
    font-weight: 500;
    color: #555555;
}
.tabs-inactive{
    padding: 4px 8px;
    font-size: 16px;
    font-weight: 400;
    color: #777777;
}
.tabs-active{
    padding: 4px 10px;
    font-size: 16px;
    font-weight: 600;
    color: #1C3366;
    border-bottom: 2px solid #1C3366; 
}
.notification-cards{
    height: 690px;
    overflow: hidden;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.notification-cards::-webkit-scrollbar{
    display: none;
    width: 0 !important
}
.footer{
    cursor: default;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 56px;
    padding: 0 10px;
}
.footer-right{
    margin-left: auto;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.4000000059604645px;
    text-align: center;
    color: #409EFF;
    margin-top: 7px;
    cursor: pointer;
}
.footer-left-text{
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0px;
    text-align: left;
    color: #555555;
    margin-left: 26px;
}
.footer-img{
    position: absolute;
    top: -2px;
}
</style>
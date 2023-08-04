<template>
    <div>
        <h1>notification</h1>
        <el-input v-model="name" @input="getNotification()" ></el-input>
        <br>
        <NotificationSlide :message="info"/>
        <button @click="isNotificationOpen=true">Show Notifications</button>
        <NotificationPopUp :notificationsList="notificationsList" :isVisible="isNotificationOpen" @switchTabs="switchTabs" @handleReadAll="setReadAll" @closeNotification="closeNotification" :notifications="notifications"/>
    </div>
</template>
<script>
import NotificationSlide from './NotificationSlide.vue';
import NotificationPopUp from './NotificationPopUp.vue';
    export default {
        components: {
            NotificationSlide,
            NotificationPopUp
        },
        data(){
            return {
                name: '',
                info: {},
                isNotificationOpen: false,
                notificationsList: [
                    { 
                        notification_details: {
                            action_by: "Navneet",
                            action_for_name: "Nirmal",
                            action_for: 1520,
                            content_obj_type: "lead",
                            content_obj_name: "Julia An Eve",
                            content_obj_id: 12345,
                            action: "{action_by} assigned {content_obj_name} to {action_for}",
                            date: "2023-07-01T05:32:29.616Z",
                        },
                        is_read: false
                    },
                    {
                        notification_details: {
                            action_by: "Ajay",
                            content_obj_type: "lead",
                            content_obj_name: "Julia W",
                            lead_id: 12,
                            action_for_name: null,
                            action_for_id: null,
                            lead_status: "In Progress",
                            action: "{action_by} updated {content_obj_name} to {lead_status}",
                            date: "2023-06-25T05:32:29.616Z",
                        },
                        is_read: true
                    },
                    {
                        notification_details: {
                            action_by: "Sanjay",
                            content_obj_type: "task",
                            content_obj_name:
                                "Collect copies of electricity bills and the signed contract",
                            lead_id: 12,
                            action_for_name: null,
                            action_for: 1596,
                            lead_status: "In Progress",
                            action: "{action_by} assigned {content_obj_name} to {action_for}",
                            date: "2023-06-20T05:32:29.616Z",
                        },
                        is_read: false
                    },
                ],
                notifications: [
                    { id:1, type: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-07-03T11:17:00Z", isRead: false,
                    isCollaborator: true},
                    { id:2, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-07-03T11:07:00Z", isRead: false,
                    isCollaborator: true},
                    { id:3, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-07-01T18:30:00Z", isRead: false, isPerson: true,
                    isCollaborator: true},
                    { id:4, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true,
                    isCollaborator: true},
                    { id:5, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-05-30T18:30:00Z", isRead: true,
                    isCollaborator: true},
                    { id:6, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2022-06-30T18:30:00Z", isRead: true},
                    { id:7, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:8, ype: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:9, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:10, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true, isPerson: true},
                    { id:11, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:12, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:13, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:14, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:15, ype: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:16, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:17, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true, isPerson: true},
                    { id:18, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:19, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:20, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:21, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                ]
            }
        },
        methods: {
            getNotification(){
                this.info = {assigner: this.name}
            },
            closeNotification(){
                this.isNotificationOpen = false
            },
            setReadAll(){
                this.notifications = this.notifications.map(e => {
                    e.isRead = true
                    return e
                })
            },
            switchTabs(tab){
                if(tab === 'collab') {
                    this.notifications = this.notifications.filter(e => e.isCollaborator)
                }else{
                    this.notifications = [
                    { id:1, type: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-07-03T11:17:00Z", isRead: false,
                    isCollaborator: true},
                    { id:2, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-07-03T11:07:00Z", isRead: false,
                    isCollaborator: true},
                    { id:3, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-07-01T18:30:00Z", isRead: false, isPerson: true,
                    isCollaborator: true},
                    { id:4, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true,
                    isCollaborator: true},
                    { id:5, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-05-30T18:30:00Z", isRead: true,
                    isCollaborator: true},
                    { id:6, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2022-06-30T18:30:00Z", isRead: true},
                    { id:7, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:8, ype: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:9, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:10, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true, isPerson: true},
                    { id:11, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:12, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:13, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:14, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:15, ype: 'assigned', assigner: 'Navneet S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:16, type: 'assigned', assigner: 'Kaushal Rao', activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:17, type: 'updated', assigner: 'Ajay N', activity: 'Julia W at 139 Resin Ave', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true, isPerson: true},
                    { id:18, type: 'sent', assigner: 'Aravind S', assignee: 'Julia W at 139 Resin Ave', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:19, type: 'marked', assigner: 'Catherine A', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:20, type: 'reminder', assigner: 'Frederick R', activity: 'Collect copies of electricity bills and the signed contract', status:'In progress', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                    { id:21, type: 'reminder',  activity: 'Collect copies of electricity bills and the signed contract', date_obj: "2023-06-30T18:30:00Z", isRead: true},
                ]
                }

            }
        }
    }
</script>
<style>
</style>
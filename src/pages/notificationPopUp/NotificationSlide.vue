<template>
</template>
<script>
import NotificationCards from './NotificationCards.vue';
export default {
    name: "NotificationSlide",
    components: {
        NotificationCards
    },
    props: {
        message: {
            type: Object,
    },
    },
    data(){
        return{
            details: [
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
                    // {
                    //     notification_details: {
                    //         action_by: "Ajay",
                    //         content_obj_type: "lead",
                    //         content_obj_name: "Julia W",
                    //         lead_id: 12,
                    //         action_for_name: null,
                    //         action_for_id: null,
                    //         lead_status: "In Progress",
                    //         action: "{action_by} updated {content_obj_name} to {lead_status}",
                    //         date: "2023-06-25T05:32:29.616Z",
                    //     },
                    //     is_read: true
                    // },
                    // {
                    //     notification_details: {
                    //         action_by: "Sanjay",
                    //         content_obj_type: "task",
                    //         content_obj_name:
                    //             "Collect copies of electricity bills and the signed contract",
                    //         lead_id: 12,
                    //         action_for_name: null,
                    //         action_for: 1596,
                    //         lead_status: "In Progress",
                    //         action: "{action_by} assigned {content_obj_name} to {action_for}",
                    //         date: "2023-06-20T05:32:29.616Z",
                    //     },
                    //     is_read: false
                    // },
                ]
        } 
    },
    methods: {
        notification() {
            const h = this.$createElement;
            this.$notify({
                message: h(NotificationCards, { props: {notificationsList: this.details, isSlide: true}}), 
                //duration: 0,
                customClass: "crm-notification",
                showClose: false
            });
        },
    },
    watch: {
        message: function (newVal, oldVal) {
            this.notification();
        }
    },
}
</script>
<style scoped>
</style>
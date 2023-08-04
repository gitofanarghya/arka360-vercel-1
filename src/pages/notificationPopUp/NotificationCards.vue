<template>
    <div>
        <div class="main-card"  v-for="notification in notificationsList" @click="handleClick(notification)">
            <div class="main-card-div">


                <div style="display: flex; gap: 5px;">
                <template v-for="comp in notification.notification_details.components">
                    <template v-if="comp == '{action_by}'">
                            <el-avatar 
                                :size="24"
                                :style="getAvatarStyle(notification.notification_details.action_by_name)"
                                >{{ generateInitials(notification.notification_details.action_by_name) }}
                            </el-avatar>
                            <span class="assigner ellipsis">{{ getFirstName(notification.notification_details.action_by_name) }}</span>
                    </template>
                        <div v-else-if="comp == '{content_object_name}'" >
                            <p class="ellipsis activity-assignee" :style="{maxWidth: $props.maxWidth}">
                                <img class="person-badge" v-if="notification.notification_details.content_obj_type == 'lead'" src="../../assets/img/PersonBadge.svg" alt="person-badge">
                                <template v-else>
                                    <img class="circle-icon" src="../../assets/img/circleNotif.svg" alt="circle-icon">
                                    <img class="tick-icon" src="../../assets/img/tickNotif.svg" alt="tick-icon">
                                </template>
                                {{ notification.notification_details.content_obj_name }}
                            </p> 
                        </div>
                        <template v-else-if="comp == '{action_for}'" >
                            <span v-if="isSelf(notification.notification_details.action_for)" >you</span>
                            <div v-else  >
                                {{ notification.notification_details.action_for_name }}
                            </div>
                        </template>
                        <!-- <template v-else-if="comp == '{lead_status}'" >
                            <span class="ellipsis status" >{{ notification.notification_details.lead_status }}</span>
                        </template> -->
                        <span v-else>
                            {{ comp }}
                        </span>
                    </template>
                </div>

                <div class="right-info" v-if="!isSlide">    
                <span class="time">{{ generateNotificationTime(notification.notification_details.created_at) }}</span>
                <span class="blue-dot"> <img src="../../assets/img/blueDotNotif.svg" alt="blue-dot" width="8px" height="8px" v-show="!notification.is_read"> </span>
            </div>
            </div>
    
        </div>
    </div>
</template>
<script>
import {generateColorFromName} from '../../utils';
import { useGeographyStore } from '../../stores/geography'
import timeDifferenceGenerator from '../../utils/timeDifferenceGenerator'
import { mapState, mapActions } from "pinia";
import API from "@/services/api/";
import { DateTime } from "luxon";
    export default{
        name: 'NotificationCards',
        props: {
            notificationsList: {
                type: Array,
                default: [],
            },
            isSlide: {
                type: Boolean,
                default: false
            },
            maxWidth: {
                type: String,
                default: '220px'
            },
        },
        methods: {
            async handleClick(notif){
                let selectedNotif = notif.notification_details
                // this.fetchCountryDetails;
                // const countryDetail = JSON.parse(localStorage.getItem("all_country_details"))
                // console.log(countryDetail)
                if(selectedNotif.content_obj_type === "lead"){
                    let id = selectedNotif.content_obj_id;
                    try {
                        let res = await API.LEADS.FETCH_LEAD(id)
                        let filteredData = {
                            ...res.data,
                            color: generateColorFromName(res.data.name),
                            country: null,
                            created_at: this.formateDateTime(res.data.created_at),
                            lead_details: {
                                created_at: res.data.created_at,
                                deal_value: res.data.deal_value,
                                email: res.data.email,
                                estimated_system_size: res.data.estimated_system_size,
                                id: res.data.id,
                                last_contacted: res.data.last_contacted,
                                latest_notes: res.data.latest_notes,
                                lead_source: res.data.lead_source,
                                name: res.data.name,
                                owner: res.data.owner,
                                phone: res.data.phone,
                                stage: res.data.stage,
                                target_closure_date: res.data.target_closure_date || null
                            },  
                            ...res.data.project_details
                        }
                        this.$emit('handleClick', filteredData)
                    } catch (err) {
                        console.log(err.message)
                        this.$message({
                        showClose: true,
                        message:
                            "There was an error while getting the lead data. Please try again.",
                        type: "error",
                        center: true,
                        });
                    }
                }
            },
            formateDateTime(dateTime) {
                if (
                    DateTime.fromISO(dateTime).startOf("day").toISO() ===
                    DateTime.local().startOf("day").toISO()
                ) {
                    const date = DateTime.fromISO(dateTime);
                    const time = date.toLocaleString(DateTime.TIME_SIMPLE);
                    return `Today at ${time}`;
                }

                if (
                    DateTime.fromISO(dateTime).startOf("day").toISO() ===
                    DateTime.local().startOf("day").minus({ days: 1 }).toISO()
                ) {
                    const date = DateTime.fromISO(dateTime);
                    const time = date.toLocaleString(DateTime.TIME_SIMPLE);
                    return `Yesterday at ${time}`;
                }

                return DateTime.fromISO(dateTime).toFormat("dd/MM/y  hh:mm a");
                },
            async modifyNotifications() {
                function extractParts(input) {
                    const regex = /(\{[^{}]+\}|[^{}]+)/g;
                    return input.match(regex);
                }
                await this.notificationsList.forEach((msg) => {
                    msg.notification_details.action = msg.notification_details.action.replace(/\%\%(.*?)\%\%/g, '{$1}'); // replacing %% with { }
                    let components = extractParts(msg.notification_details.action);
                    this.$set(msg.notification_details, "components", components);
                });
            },
            generateInitials(name) {
                if (!isNaN(name) || name === null || !name || name.trim().length === 0 ) {
                    return "N/A"; // Return empty string for blank names
                }

                const names = name.trim().split(" ");
                const initials = names.map((n) => n.charAt(0).toUpperCase());

                if (initials.length === 1) {
                    return initials[0]; // Return single initial if only one name is available
                } else {
                    return initials[0] + initials[initials.length - 1]; // Return first and last initials for multiple names
                }
            
            },
            getFirstName(name){
                if(name === null){return 'NA'}
                let firstName = name.trim().split(' ')
                if(firstName[1]) return firstName[0]
                return name
            },
            getAvatarStyle(value) {
                const backgroundColor = generateColorFromName(value);
                return {
                    marginRight: "5px",
                    backgroundColor: backgroundColor,
                    fontSize: "12px",
                    position: 'relative',
                    top: '-3.5px'
                };
            },
            generateNotificationTime(notificationDate){
               return timeDifferenceGenerator(notificationDate, true)
            },
            isSelf(id){
                return JSON.parse(localStorage.getItem('user')).user_id === id ? true : false
            }
        },
        computed: {
            ...mapActions(useGeographyStore, {
                fetchCountryDetails: "FETCH_COUNTRY_DETAILS",
            }),
        },
        created() {
            this.modifyNotifications();
        },
        watch: {
            notificationsList: {
                handler(){
                    this.modifyNotifications();
                }
            }
        }
    }
</script>
<style scoped>
.main-card > div{
    display: flex;
    flex-direction: row;
    cursor: default;
    color: #555555;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    padding-bottom: 4px;
    margin-bottom: 4px;
    background: #FFFFFF;
    border-radius: 4px;
    cursor: pointer;
}
.main-card:hover{
    border-radius: 4px;
    box-shadow: 0px 2px 4px 0px #090A0B26;

}
.right-info{
    margin-left: auto;
    position: relative;
}
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
}
.main-card-div{
    padding: 8px;
    margin-top: 8px;
}
.assigner{
    font-size: 14px;
    font-weight: 600;
    color: #222222;
}
.activity-assignee{
    display: inline-block; 
    overflow: hidden;
    color: #409EFF;
    font-size: 14px;
    font-weight: 500;
    padding-left: 20px;
    position: relative;
}
.person-badge, .circle-icon, .tick-icon{
    position: absolute;
    left: 1px;
    top: 1px;
}
.circle-icon, .tick-icon{
    position: absolute;
    left: 1px;
    top: 1.5px;
}
.tick-icon{
    top: 5.5px;
    left: 5px;
}
.time{
    color: #999999;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    margin-right: 1.5rem;
}
.blue-dot{
    position: absolute;
    right: 0px;
}
.status{
    font-size: 14px;
    font-weight: 500;
    text-align: left;
    color: #409EFF;
}
</style>

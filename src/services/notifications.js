import { NOTIFICATIONS_WEBSOCKET_ENDPOINT } from "../constants";

// This notifications system uses websockets to establish a persistent connection with the notifications server.
export default class NotificationsManager {
    constructor(options) {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const token = user.token;
        if (!token) { return }

        this.userToken = token
        this.attemptCount = 0

        this.connect()
    }

    connect() {
        if (this.attemptCount > 4) {
            console.log("Unable to establish a connection with the notifications server. Total number of attempts: 5")
            return
        }
        this.attemptCount++
        let connection = new WebSocket(`${NOTIFICATIONS_WEBSOCKET_ENDPOINT}?token=${this.userToken}`)
        this.connection = connection
        
        connection.onmessage = event => {
            let message = JSON.parse(event.data)
            this.alert(message)
        }
        
        connection.onopen = event => {
            this.attemptCount = 0
            console.log("Successfully connected to the notifications server.")
        }

        connection.onclose = event => {
            console.log("Connection to the notifications server closed. Reconnecting..")
            setTimeout(() => {
                this.connect()
            }, 1000);
        }

        connection.onerror = event => {
            console.log("Connection to the notifications server closed due to an error.")
        }
    }

    alert(message) {
        // Do nothing by default
        // Modify this function on your instance according to your requirements.
    }
}
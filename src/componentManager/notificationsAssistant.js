import { Notification } from 'element-ui';

const NOTIFICATION_DURATION = 3000;
const NOTIFICATION_OFFSET = 40;

function _autoCloseNotification(options) {
    Notification({
        title: options.title,
        message: options.message,
        type: options.type,
        duration: NOTIFICATION_DURATION,
        offset: NOTIFICATION_OFFSET,
    });
}

function success(options) {
    options.type = 'success';
    _autoCloseNotification(options);
}

function error(options) {
    options.type = 'error';
    _autoCloseNotification(options);
}

function warning(options) {
    options.type = 'warning';
    _autoCloseNotification(options);
}

function info(options) {
    options.type = 'info';
    _autoCloseNotification(options);
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

function longInfo(options) {
    return (Notification({
        title: options.title,
        message: options.message,
        type: 'info',
        duration: Object.prototype.hasOwnProperty.call(options, 'duration') ? options.duration : 5000,
        offset: NOTIFICATION_OFFSET,
        showClose: true,
    }));
}

function loading(options) {
    return (Notification({
        title: options.title,
        message: options.message,
        duration: 0,
        offset: NOTIFICATION_OFFSET,
        iconClass: 'el-icon-loading',
        showClose: false,
    }));
}

function close(notificationObject) {
    if (typeof notificationObject.close === 'function') {
        notificationObject.close();
    }
    else {
        console.error('ERROR: notificationsAssistant: No close function in notificationObject passed.');
    }
}

export { success, error, warning, info, loading, close, longInfo };

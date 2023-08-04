function initializeUnsignedIntercom() {
    window.Intercom('boot', {
        app_id: 'zz1p1hbc',
    });
    window.Intercom('onHide', () => {
        document.activeElement.blur();
    });
}
function alignIntercom() {
    window.Intercom('boot', {
        alignment: 'left'
    });
}
function alignIntercomNormal() {
    window.Intercom('boot', {
        alignment: 'right'
    });
}
function initializeSignedIntercom(emailID) {
    window.Intercom('boot', {
        app_id: 'zz1p1hbc',
        email: emailID,
    });
    window.Intercom('onHide', () => {
        document.activeElement.blur();
    });
}
let setIntervalId = null;
function setIntercomStudioStyle() {
    setIntervalId = setInterval(() => {
        let intercomLauncher = document.querySelector('.intercom-launcher')
        let intercomLauncherFrame = document.querySelector('.intercom-launcher-frame')
        let intercomDfosxs = document.querySelector('.intercom-dfosxs')
        let intercomLauncherBadgeFrame = document.querySelector('.intercom-launcher-badge-frame')
        if (intercomLauncher) {
            intercomLauncher.style.right = 'max(calc(19.4% + 5px), 185px)';
            intercomLauncher.style.bottom = '25px';
        }
        if (intercomLauncherFrame) {
            intercomLauncherFrame.style.right = 'max(calc(19.4% + 5px), 185px)';
            intercomLauncherFrame.style.bottom = '25px';
            intercomDfosxs.style.bottom = '25px';
            intercomDfosxs.style.right = '20%';
        }
        if (intercomLauncherBadgeFrame) {
            intercomLauncherBadgeFrame.style.right = 'max(calc(19.4% + 5px), 185px)';
        }
    }, 100);
}

function setIntercomNormalStyle() {
    let intercomLauncher = document.querySelector('.intercom-launcher')
    let intercomLauncherFrame = document.querySelector('.intercom-launcher-frame')
    let intercomDfosxs = document.querySelector('.intercom-dfosxs')
    let intercomLauncherBadgeFrame = document.querySelector('.intercom-launcher-badge-frame')
    clearInterval(setIntervalId)
    if (intercomLauncher) {
        intercomLauncher.style.right = '20px';
        intercomLauncher.style.bottom = '15px';
    }
    if (intercomLauncherFrame) {
        intercomLauncherFrame.style.right = '20px';
        intercomLauncherFrame.style.bottom = '15px';
        intercomDfosxs.style.bottom = '';
        intercomDfosxs.style.right = '';
    }
    if (intercomLauncherBadgeFrame) {
        intercomLauncherBadgeFrame.style.right = '20px';
    }
}

export { initializeUnsignedIntercom, initializeSignedIntercom, setIntercomStudioStyle, setIntercomNormalStyle, alignIntercom, alignIntercomNormal };

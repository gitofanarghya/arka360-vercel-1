export async function addImagesLoadedFlag(imgUrls) {
    let images = document.querySelectorAll('img')
    if (!images.length) {
        window.allImagesLoaded = true
        return
    }
    let promises = []
    images.forEach(image => {
        if (!imgUrls.includes(image.src)) { return }

        if (image.complete) { return }

        let prom = new Promise(resolve => image.onload = resolve)
        promises.push(prom)
    })
    await Promise.all(promises)
    window.allImagesLoaded = true
    return true
}
export function isArkaEnergyDomain() {
    let domainName = window.location.hostname.split('.')[1];
    if (domainName == 'arkaenergy') {
        return true;
    }
    return false;
}
export function fetchArkaEnergyLogo() {
    let logo = "https://spotlightdocuments.blob.core.windows.net/documents/Arka%20Logo%20-%20Black.png?sp=r&st=2023-03-09T12:04:08Z&se=2025-10-02T20:04:08Z&spr=https&sv=2021-12-02&sr=b&sig=C9LvLVy9FldaWSwBpmKgNPd4meUyZznNjY864gLgFzk%3D";
    return logo;
}

export function formatDateForReport(date) {
    let dateNew = date.toDateString();
    let dateArray = dateNew.split(' ');
    let dateArray2 = dateArray.slice(1, 4);
    [dateArray2[0], dateArray2[1]] = [dateArray2[1], dateArray2[0]];
    dateArray2[1] = dateArray2[1] + ','
    let finalDate = dateArray2.join(' ');

    let dateString = finalDate + ' | ' + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    return dateString
}

// Thanks to https://stackoverflow.com/a/13899011
export function convertTimeTo12HourFormat(time) {
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
        time = time.slice(1);
        time[5] = +time[0] < 12 ? ' AM' : ' PM';
        time[0] = +time[0] % 12 || 12;
    }
    return time.join('');
}

export function getServiceSpecificInfo(serviceName) {
    //-----------------For Testing-------------------------------//
    // serviceName = 'Solar Sales Proposal';
    // serviceName = 'PV Design';
    // serviceName = 'Permit Package';
    // serviceName = 'Full Construction Drawing'
    // serviceName = 'Preliminary Proposal';
    //-----------------For Testing-------------------------------//
    let storedData = JSON.parse(localStorage.getItem("allServicesInfo"));
    storedData = storedData.service_templates; // now its an array of json of different services
    for (let i = 0; i < storedData.length; i++) {
        if (serviceName == storedData[i].template_constant[0].name)
            return storedData[i];
    }
}

export function isItIndianExpertService() {
    let storedData = JSON.parse(localStorage.getItem("allServicesInfo"));
    storedData = storedData.service_templates; // now its an array of json of different services
    if (storedData && storedData.length > 0) {
        if (storedData[0]['available_info'][0] == 'project_info')
            return true;
        else
            return false;
    }
    return false;
}

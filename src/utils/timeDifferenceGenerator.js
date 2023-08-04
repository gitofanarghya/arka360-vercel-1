import { DateTime } from "luxon";

export default function generateTimeDifference(date, isShort){
    let date1 = DateTime.fromISO(date,{ zone: "utc" })
    let date2 = DateTime.utc({ zone: "utc" })
    let diff = (date1.diff(date2, ["years", "months", "days", "hours", "minutes", "seconds"]))
    if(diff.years!=0){
        return `${Math.floor(diff.years*-1)}${ isShort ? 'y' : ' years'} ago`
    }else if(diff.months!=0){
        return `${Math.floor(diff.months*-1)}${ isShort ? 'm' : ' months'} ago`
    }else if(diff.days!=0){
        return `${Math.floor(diff.days*-1) > 1 ? (Math.floor(diff.days*-1)+(isShort?'d ago' : 'days ago')) : 'Yesterday'}`
    }else if(diff.hours!=0){
        return `${Math.floor(diff.hours*-1)}${ isShort ? 'h' : ' hours'} ago`
    }else if(diff.minutes!=0){
        return `${Math.floor(diff.minutes*-1)}${ isShort ? 'min' : ' minutes'} ago`
    }else if(diff.seconds!=0){
        return `${Math.floor(diff.seconds*-1)}${ isShort ? 's' : ' seconds'} ago`
    }
    
    return 'Just now'
}
import { DateTime } from "luxon";

export const typeConstants = {
  date: "Date",
  shortDate: "Short Date",
  dateTime: "Date Time",
  time: "Time",
  monthDay: "Month Day",
  shortTime: "Short Time",
  dateTimeNoSeconds: "Date Time (No Seconds)",
};

// Type          | Output (US Preference)      | Output (India Preference)    |
// --------------|----------------------------|-----------------------------|
// date          | 12/31/2023                 | 31/12/2023                   |
// shortDate    | Dec 31, 2023               | 31 Dec, 2023                 |
// dateTime      | 12/31/2023, 11:59:59 PM    | 31 Dec, 2023, 11:59:59 PM    |
// dateTimeNoSeconds| 12/31/2023, 11:59 PM    | 31 Dec, 2023, 11:59 PM    |
// time          | 11:59:59 PM                | 11:59:59 PM                  |
// monthDay     | Dec 31                     | 31 Dec                       |
// shortTime    | 11:59 PM                   | 11:59 PM                     |

export const formatDateTime = (isoDate, type, isUS) => {
  const date = DateTime.fromISO(isoDate);
  let formatString = "";

  switch (type) {
    case "Date":
      formatString = isUS ? "MM/dd/yyyy" : "dd/MM/yyyy";
      break;
    case "Date Dash":
      formatString = isUS ? "MM-dd-yyyy" : "dd-MM-yyyy";
      break;
    case "Short Date":
      formatString = isUS ? "MMM dd, yyyy" : "dd MMM, yyyy";
      break;
    case "Date Time":
      formatString = isUS
        ? "MMM dd, yyyy MMM dd, yyyy, hh:mm:ss a"
        : "dd MMM, yyyy, hh:mm:ss a";
      break;
    case "Date Time (No Seconds)":
      formatString = isUS ? "MMM dd, yyyy, hh:mm a" : "dd MMM, yyyy, hh:mm a";
      break;
    case "Time":
      formatString = "hh:mm:ss a";
      break;
    case "Month Day":
      formatString = isUS ? "MMM dd" : "dd MMM";
      break;
    case "Short Time":
      formatString = "hh:mm a";
      break;
    default:
      throw new Error("Invalid type");
  }

  // console.log({a:date.toLocaleString({ ...DateTime.DATETIME_MED, format: formatString })})
  return date.toFormat(formatString);
};

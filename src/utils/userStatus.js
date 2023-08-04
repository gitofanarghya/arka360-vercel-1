// Function to check if the current time falls within the shift duration
import { DateTime } from "luxon";

export function isShiftOngoing(shifts) {
  const currentDate = DateTime.local();
  const currentDayOfWeek = currentDate.toFormat("EEE").toLowerCase();
  const currentTime = currentDate.hour * 60 + currentDate.minute;

  if (typeof shifts !== Array)
    for (const shift of shifts) {
      const fromTimeParts = shift.from_time.split(":");
      const shiftFromTime =
        parseInt(fromTimeParts[0]) * 60 + parseInt(fromTimeParts[1]);

      const shiftDurationParts = shift.duration.split(":");
      const shiftDuration =
        parseInt(shiftDurationParts[0]) * 60 + parseInt(shiftDurationParts[1]);

      const isOnShiftDay = shift.days_of_week.includes(currentDayOfWeek);
      const isWithinShiftTime =
        currentTime >= shiftFromTime &&
        currentTime <= shiftFromTime + shiftDuration;

      if (isOnShiftDay && isWithinShiftTime) {
        return true;
      }
    }

  return false;
}

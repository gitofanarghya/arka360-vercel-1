// Color Lightner based on percentage
export function getLightenedColor(hexColor, percentage) {
  const cleanHexColor = hexColor.replace("#", "");

  const red = parseInt(cleanHexColor.substr(0, 2), 16);
  const green = parseInt(cleanHexColor.substr(2, 2), 16);
  const blue = parseInt(cleanHexColor.substr(4, 2), 16);

  const lightenedRed = Math.round((255 - red) * (percentage / 100)) + red;
  const lightenedGreen = Math.round((255 - green) * (percentage / 100)) + green;
  const lightenedBlue = Math.round((255 - blue) * (percentage / 100)) + blue;

  const lightenedHexColor =
    "#" +
    ((lightenedRed << 16) | (lightenedGreen << 8) | lightenedBlue)
      .toString(16)
      .padStart(6, "0");

  return lightenedHexColor;
}

//   Color based on Competence
export function handleCompetenceColor(data) {
  switch (data) {
    case "PV Design":
      return "#C13A5E";

    case "Solar Sales Proposal":
    case "Sales Proposal":
    case "Preliminary Proposal":
      return "#34691E";
    case "Permit Package":
      return "#EF6C00";
    case "Premium Order":
      return "#7C1EA4";
    default:
      return "#409eff";
  }
}

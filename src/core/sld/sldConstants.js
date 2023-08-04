export const stringContainerSpacing = 25;
export const xSpacing = 30;
export const xSpacingPerWire = 10;
export const textSize = 3;
export const stringPadding = 15;
export const maxPanelGroupSize = { x: 50, y: 83.7 };
export const maxPanelLineSize = { x: 68, y: 48 };
export const maxMicroInverterPanelGroupSize = { x: 76, y: 80 };
export const maxMicroInverterPanelLineSize = { x: 189, y: 66 };
export const dotsize = 8;
export const microInverterDimensions = {
    gap: 1.5,
    defaultWidth: 60,
    defaultHeight: 40,
    smallboxsize: 1.5,
    endConnectsize: 2,
    dotsize,
};
export const stringInverterDimensions = {
    gap: 1.5,
    defaultWidth: 20,
    defaultHeight: 60,
    dotsize,
    yOffset: 2,
};
export const junctionBoxDimensions = {
    extraSpace: 60,
    smallboxsize: 6,
    width: 30,
};
// export const maxMicroInverterPanelLines = new THREE.Vector2(61,65);

export const utilityMeterList = [
    'Top Fed',
    'Center Fed',
    'Bottom Fed with Down Utility',
    'No Main',
    'W/Sub Panel',
    'No Main with Sub Panel',
    'Solar Ready Panel',
    'Generac Generator System',
    'Load Side Tap',
    'Line Side Tap',
    'Line Side Tap With Ditached MSP',
    'Tap With Junction Box',
    'Main Hot Bus Panel',
    'Meter Main',
];

export const productionMeterList = ['Normal', 'Load Side', 'Line Side'];

export const loadCenterList = ['Main Breaker = 15 A', 'Main Breaker = 10 A', 'Main Breaker = 10 / 15 A'];

export const acDisconnectList = ['Fused AC Disconnect', 'NON-Fused AC Disconnect'];

export const STRING_INVERTER = 'string';

export const MICRO_INVERTER = 'micro';
